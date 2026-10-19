#!/usr/bin/env python3
"""Today's shape of any OpenStreetMap feature (lake, reservoir, railway, road, forest ...), clipped to a box.

Usage:
  python3 osm_shape.py '["natural"="water"]["name"="Sihlsee"]' 47.05,8.70,47.20,8.90 --area
  python3 osm_shape.py '["railway"="rail"]["tunnel"="yes"]["name"~"Gotthard"]' 46.50,8.50,46.70,8.65 --line

The filter is Overpass QL tag syntax. Ways and relations (multipolygons, routes) are both searched.
--area: output closed rings (outer rings of multipolygons; ways must be closed).
--line: output lines (joined end to end where they touch), thinned to about one point every 30 m.
Output: JSON {"filter", "source", "coords"} with coords = list of rings or lines of [lat, lon].
Data (c) OpenStreetMap contributors, ODbL.
"""
import json
import sys

from today_river import query, thin


def join(lines):
    """Join pieces that share an end point (any direction)."""
    lines = [l[:] for l in lines if len(l) > 1]
    changed = True
    while changed:
        changed = False
        for i in range(len(lines)):
            for j in range(len(lines)):
                if i == j or not lines[i] or not lines[j] or lines[i][0] == lines[i][-1]:
                    continue
                a, b = lines[i], lines[j]
                if a[-1] == b[0]:
                    lines[i] = a + b[1:]
                elif a[-1] == b[-1]:
                    lines[i] = a + b[::-1][1:]
                elif a[0] == b[-1]:
                    lines[i] = b + a[1:]
                elif a[0] == b[0]:
                    lines[i] = b[::-1] + a[1:]
                else:
                    continue
                lines[j] = []
                changed = True
        lines = [l for l in lines if l]
    return lines


def main():
    if len(sys.argv) < 4 or sys.argv[3] not in ("--area", "--line"):
        sys.exit(__doc__)
    flt, box, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    s, w, n, e = [float(x) for x in box.split(",")]
    bb = "%f,%f,%f,%f" % (s, w, n, e)
    d = query("[out:json][timeout:120];(way%s(%s);relation%s(%s););out geom;" % (flt, bb, flt, bb))
    pieces = []
    for el in d.get("elements", []):
        if el["type"] == "way":
            pieces.append([[round(g["lat"], 6), round(g["lon"], 6)] for g in el.get("geometry", [])])
        else:
            for m in el.get("members", []):
                if m.get("type") == "way" and "geometry" in m and (mode == "--line" or m.get("role") in ("outer", "")):
                    pieces.append([[round(g["lat"], 6), round(g["lon"], 6)] for g in m["geometry"]])
    if mode == "--area":
        rings = [r for r in join(pieces) if len(r) > 3 and r[0] == r[-1]]
        open_ = len([r for r in join(pieces) if r[0] != r[-1]])
        if open_:
            sys.stderr.write("warning: %d piece(s) did not close into a ring (cut by the box?)\n" % open_)
        out = [thin(r, 20.0) for r in rings]
    else:
        out = []
        for l in join(pieces):
            seg = [p for p in l if s <= p[0] <= n and w <= p[1] <= e]
            if len(seg) > 1:
                out.append(thin(seg))
    out.sort(key=len, reverse=True)
    if not out:
        sys.exit("Nothing found for %s in that box." % flt)
    print(json.dumps({"filter": flt, "source": "OpenStreetMap", "coords": out}))
    sys.stderr.write("%d piece(s), %d points\n" % (len(out), sum(len(x) for x in out)))


if __name__ == "__main__":
    main()
