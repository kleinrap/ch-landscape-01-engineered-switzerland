#!/usr/bin/env python3
"""Today's course of a river or canal, from OpenStreetMap (Overpass API), clipped to a box.

Usage:
  python3 today_river.py "Thur" 47.45,8.90,47.62,9.10 > thur_today.json
  python3 today_river.py "Linthkanal" 47.10,8.95,47.25,9.10 --canal > linth_today.json

Box is south,west,north,east (WGS84). Output: JSON {"name", "coords"} where coords is a list of
lines, each a list of [lat, lon] points (ready for the "lines" field, kind "new").
Points are thinned to about one every 30 m. Data (c) OpenStreetMap contributors, ODbL.
"""
import json
import math
import sys
import time
import urllib.parse
import urllib.request

URL = "https://overpass-api.de/api/interpreter"
UA = "how-switzerland-grew/1.0 (river research)"


def query(q):
    data = urllib.parse.urlencode({"data": q}).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, data=data, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except Exception as e:  # Overpass is busy sometimes: wait and retry
            if attempt == 3:
                raise
            time.sleep(10 * (attempt + 1))


def dist(a, b):
    k = 111320.0
    return math.hypot((a[0] - b[0]) * k, (a[1] - b[1]) * k * math.cos(math.radians(a[0])))


def thin(line, step=30.0):
    out = [line[0]]
    for p in line[1:-1]:
        if dist(out[-1], p) >= step:
            out.append(p)
    out.append(line[-1])
    return out


def join(lines):
    """Join way pieces that touch end to end, so the river is a few long lines."""
    lines = [l[:] for l in lines if len(l) > 1]
    changed = True
    while changed:
        changed = False
        for i in range(len(lines)):
            for j in range(len(lines)):
                if i == j or not lines[i] or not lines[j]:
                    continue
                a, b = lines[i], lines[j]
                if a[-1] == b[0]:
                    lines[i] = a + b[1:]; lines[j] = []; changed = True
                elif a[-1] == b[-1]:
                    lines[i] = a + b[::-1][1:]; lines[j] = []; changed = True
        lines = [l for l in lines if l]
    return lines


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    name, box = sys.argv[1], sys.argv[2]
    s, w, n, e = [float(x) for x in box.split(",")]
    kinds = "river|canal|stream" if "--canal" in sys.argv or "--any" in sys.argv else "river|canal"
    bb = "%f,%f,%f,%f" % (s, w, n, e)
    q = '[out:json][timeout:90];way["waterway"~"^(%s)$"]["name"="%s"](%s);out geom;' % (kinds, name.replace('"', ''), bb)
    d = query(q)
    lines = []
    for el in d.get("elements", []):
        pts = [[round(g["lat"], 6), round(g["lon"], 6)] for g in el.get("geometry", [])]
        # clip to box
        seg = []
        for p in pts:
            if s <= p[0] <= n and w <= p[1] <= e:
                seg.append(p)
            elif seg:
                lines.append(seg); seg = []
        if seg:
            lines.append(seg)
    lines = [thin(l) for l in join(lines)]
    lines.sort(key=len, reverse=True)
    if not lines:
        sys.exit("No OpenStreetMap waterway named %r in that box." % name)
    print(json.dumps({"name": name, "source": "OpenStreetMap", "coords": lines}))
    sys.stderr.write("%d line(s), %d points\n" % (len(lines), sum(len(l) for l in lines)))


if __name__ == "__main__":
    main()
