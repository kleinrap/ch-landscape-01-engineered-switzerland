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
TYPES = {"river", "marsh", "lake", "dam", "stream", "forest", "landuse", "transport", "protection", "species"}


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
    changes.sort(key=lambda c: c["periods"][0][0])
    os.makedirs(DATA, exist_ok=True)
    with open(os.path.join(DATA, "changes.js"), "w", encoding="utf-8") as fh:
        fh.write("// Human changes to the Swiss landscape. Built by scripts/build.py from research/changes-*.json\n")
        fh.write("window.CHANGES = %s;\n" % json.dumps(changes, ensure_ascii=False, separators=(",", ":")))
    print("%d changes (%s)" % (len(changes), ", ".join(sorted({c["type"] for c in changes}))))


if __name__ == "__main__":
    main()
