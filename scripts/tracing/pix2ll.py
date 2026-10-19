#!/usr/bin/env python3
"""Turn pixel positions in an overlay.py image back into lat/lon (Web Mercator).

Usage: python3 pix2ll.py --box s,w,n,e --zoom 14 --size W,H X1 Y1 [X2 Y2 ...]
--box, --zoom: the same as for overlay.py; --size: the saved image size (overlay.py prints it).
Prints one "lat, lon" per point, as JSON list [[lat, lon], ...].
"""
import argparse
import json
import math


def merc_y(lat):
    return math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--box", required=True)
    ap.add_argument("--zoom", type=int)
    ap.add_argument("--size", required=True)
    ap.add_argument("xy", nargs="+", type=float)
    a = ap.parse_args()
    s, w, n, e = [float(v) for v in a.box.split(",")]
    W, H = [float(v) for v in a.size.split(",")]
    yn, ys = merc_y(n), merc_y(s)
    out = []
    for i in range(0, len(a.xy) - 1, 2):
        x, y = a.xy[i], a.xy[i + 1]
        lon = w + x / W * (e - w)
        my = yn - y / H * (yn - ys)
        lat = math.degrees(math.atan(math.sinh(my)))
        out.append([round(lat, 6), round(lon, 6)])
    print(json.dumps(out))


if __name__ == "__main__":
    main()
