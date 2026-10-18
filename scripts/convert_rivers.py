#!/usr/bin/env python3
"""One-time conversion: the river research (research/legacy/rivers*.json, from the
"How Switzerland Grew" project) -> the "human changes" format (research/changes-rivers.json).

A human change is one thing people did to the land. It keeps:
  - what it is (type, title, place, dates as periods),
  - the land BEFORE and AFTER (lines and areas), so the map "Switzerland Without Us"
    can later be built from all the "before" shapes,
  - how sure we are (certainty),
  - why it was needed (why) and what was gained and lost (gained, lost: to be filled),
  - the step-by-step story for the reader (story.stops).

Standard library only.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGACY = os.path.join(ROOT, "research", "legacy")


def periods(built, stops):
    years = [int(y) for y in re.findall(r"\d{4}", built or "")]
    out = [[years[i], years[i + 1] if i + 1 < len(years) else years[i]] for i in range(0, len(years), 2)]
    return out or [[stops[0]["year"], stops[0]["year"]]]


def collect(stops, kind, which):
    """All lines or areas of one kind across the stops, without repeats (same name = same shape)."""
    seen, out = set(), []
    for s in stops:
        for item in s.get(which, []):
            if item.get("kind") != kind or item["name"] in seen:
                continue
            seen.add(item["name"])
            out.append({"name": item["name"], "coords": item["coords"]})
    return out


def certainty(r):
    text = json.dumps(r).lower()
    return "approximate" if ("approximate" in text or "about" in (r.get("notes") or "").lower()) else "good"


# Most entries are river corrections; these are other kinds of change.
TYPE = {"lungerersee": "lake", "waegitalersee": "dam", "sihlsee": "dam",
        "plaine-fully-saillon": "marsh", "werdenberger-binnenkanal": "marsh", "rheintaler-binnenkanal": "marsh"}


def convert(r, scale):
    stops = r["stops"]
    last = stops[-1]
    return {
        "id": r["id"],
        "type": TYPE.get(r["id"], "river"),
        "title": r["name"],
        "scale": r.get("scale", scale),
        "cantons": r.get("cantons", []),
        "place": r.get("stretch", ""),
        "built": r.get("built", ""),
        "periods": periods(r.get("built"), stops),
        "length_km": r.get("length_km"),
        "summary": r.get("summary", ""),
        "why": r.get("why", []),
        "gained": [],
        "lost": [],
        "before": {"lines": collect(stops, "old", "lines"), "areas": collect(stops, "old", "areas")},
        "after": {"lines": [{"name": l["name"], "coords": l["coords"]} for l in last.get("lines", []) if l.get("kind") == "new"],
                  "areas": [{"name": a["name"], "coords": a["coords"]} for a in last.get("areas", []) if a.get("kind") == "new"]},
        "certainty": certainty(r),
        "story": {"center": r["center"], "zoom": r.get("zoom", 13), "stops": stops},
        "sources": r.get("sources", []),
        "notes": r.get("notes", ""),
    }


def main():
    out = []
    for name in sorted(os.listdir(LEGACY)):
        if not (name.startswith("rivers") and name.endswith(".json")):
            continue
        scale = "regional" if "regional" in name else "major"
        for r in json.load(open(os.path.join(LEGACY, name), encoding="utf-8")):
            out.append(convert(r, scale))
    out.sort(key=lambda c: c["periods"][0][0])
    path = os.path.join(ROOT, "research", "changes-rivers.json")
    json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("%d river changes -> %s" % (len(out), path))


if __name__ == "__main__":
    main()
