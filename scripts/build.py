#!/usr/bin/env python3
"""Build data/changes.js (window.CHANGES) from all research/changes-*.json files.

Each file holds human changes of one type (rivers now; marshes, lakes, dams ... later).
Checks: unique ids, periods, map years 1844-2021, before/after present.
Standard library only.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(ROOT, "research")
DATA = os.path.join(ROOT, "data")
TYPES = {"river", "marsh", "lake", "dam", "hydropower", "stream", "forest", "landuse", "transport", "protection", "species"}


def main():
    changes = []
    for name in sorted(os.listdir(RESEARCH)):
        if name.startswith("changes-") and name.endswith(".json"):
            changes += json.load(open(os.path.join(RESEARCH, name), encoding="utf-8"))
    problems = []
    ids = [c["id"] for c in changes]
    for i in sorted({i for i in ids if ids.count(i) > 1}):
        problems.append("duplicate id " + i)
    for c in changes:
        if c.get("type") not in TYPES:
            problems.append("%s: unknown type %s" % (c["id"], c.get("type")))
        if not c.get("periods"):
            problems.append(c["id"] + ": no periods")
        if "before" not in c or "after" not in c:
            problems.append(c["id"] + ": needs before and after")
        for s in c.get("story", {}).get("stops", []):
            if s.get("map") == "old" and not 1844 <= s.get("mapYear", 0) <= 2021:
                problems.append("%s %s: mapYear outside 1844-2021" % (c["id"], s.get("year")))
    if problems:
        raise SystemExit("\n".join(problems))
    # Sources: count paragraphs without a source (shown on the site as "no source yet").
    missing = 0
    for c in changes:
        known = {r["id"] for r in c.get("refs", [])}
        groups = [([c["summary"]], [c.get("summary_refs", [])])] + [(c.get(k, []), c.get(k + "_refs", [])) for k in ("why", "gained", "lost")]
        groups += [(st.get("text", []), st.get("refs", [])) for st in c["story"]["stops"]]
        for texts, refs in groups:
            for i, t in enumerate(texts):
                ids = refs[i] if i < len(refs) else []
                for x in ids:
                    if x not in known:
                        problems.append("%s: unknown ref %s" % (c["id"], x))
                if not ids and "not confirmed" not in t.lower():
                    missing += 1
    if problems:
        raise SystemExit("\n".join(problems))
    changes.sort(key=lambda c: c["periods"][0][0])
    # Smaller file: story steps that repeat a before/after shape point to it ("same": "before.lines.0")
    # instead of repeating the coordinates; app.js puts the coordinates back. Coordinates are rounded to 5 decimals (about 1 m).
    def rnd(k):
        return [rnd(x) for x in k] if isinstance(k, list) else round(k, 5) if isinstance(k, float) else k
    for c in changes:
        known = {}
        for part in ("before", "after"):
            for kind in ("lines", "areas"):
                for i, sh in enumerate(c[part].get(kind, [])):
                    sh["coords"] = rnd(sh["coords"])
                    known.setdefault(json.dumps(sh["coords"]), "%s.%s.%d" % (part, kind, i))
        for st in c["story"]["stops"]:
            for kind in ("lines", "areas"):
                for sh in st.get(kind, []):
                    sh["coords"] = rnd(sh["coords"])
                    key = known.get(json.dumps(sh["coords"]))
                    if key:
                        sh["same"] = key
                        del sh["coords"]
    os.makedirs(DATA, exist_ok=True)
    with open(os.path.join(DATA, "changes.js"), "w", encoding="utf-8") as fh:
        fh.write("// Human changes to the Swiss landscape. Built by scripts/build.py from research/changes-*.json\n")
        fh.write("window.CHANGES = %s;\n" % json.dumps(changes, ensure_ascii=False, separators=(",", ":")))
        # "Switzerland Without Us" (phase 7): the text of the special view; the map is built from the "before" shapes.
        wpath = os.path.join(RESEARCH, "without.json")
        if os.path.exists(wpath):
            fh.write("window.WITHOUT = %s;\n" % json.dumps(json.load(open(wpath, encoding="utf-8")), ensure_ascii=False, separators=(",", ":")))
    print("%d changes (%s); %d paragraphs without a source" % (len(changes), ", ".join(sorted({c["type"] for c in changes})), missing))


if __name__ == "__main__":
    main()
