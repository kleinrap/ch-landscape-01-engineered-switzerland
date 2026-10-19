#!/usr/bin/env python3
"""Build docs/VISITS.md: archive and library visit sheets, grouped by place.

Reads the "visits" lists in research/evidence-*.json ({id: {"visits": [{"place", "what"}], ...}})
and the change titles from research/changes-*.json. Standard library only.
"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def key(place):
    """Group by the institution name (text before the first comma), ignoring case and spaces."""
    return re.sub(r"\s+", " ", place.split(",")[0]).strip().lower()


def main():
    titles = {}
    for f in glob.glob(os.path.join(ROOT, "research", "changes-*.json")):
        for c in json.load(open(f, encoding="utf-8")):
            titles[c["id"]] = c["title"]
    groups = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "research", "evidence-*.json"))):
        data = json.load(open(f, encoding="utf-8"))
        if not isinstance(data, dict):
            continue
        for cid, r in data.items():
            if not isinstance(r, dict):
                continue
            for v in r.get("visits", []):
                g = groups.setdefault(key(v["place"]), {"place": v["place"], "items": []})
                if len(v["place"]) > len(g["place"]):
                    g["place"] = v["place"]
                g["items"].append((titles.get(cid, cid), v.get("what", "")))
    out = ["# Archive and library visits", "",
           "Facts that are not online. One sheet per place, so one trip can answer several questions.",
           "Before a visit: check the opening hours and order the documents in advance (most archives ask for this).",
           "Built by `python3 scripts/build_visits.py` from `research/evidence-*.json`.", ""]
    for g in sorted(groups.values(), key=lambda g: (-len(g["items"]), g["place"])):
        out.append("## " + g["place"])
        out.append("")
        for title, what in g["items"]:
            out.append("- **%s**: %s" % (title, what))
        out.append("")
    open(os.path.join(ROOT, "docs", "VISITS.md"), "w", encoding="utf-8").write("\n".join(out))
    print("%d places, %d questions" % (len(groups), sum(len(g["items"]) for g in groups.values())))


if __name__ == "__main__":
    main()
