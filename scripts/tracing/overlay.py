#!/usr/bin/env python3
"""Draw lines and areas on a swisstopo map of a given year, to check them by eye.

Run with the Pillow venv:
  ../rv2/venv/bin/python overlay.py --year 1860 --box 47.33,9.55,47.50,9.70 --zoom 14 \
      --data stop.json --out check.png

--year: 1844..2021 ("Journey through time" map of 31 Dec of that year) or "today".
--box: south,west,north,east. --zoom: 12..16 (max 100 tiles; use a smaller box or zoom if refused).
--data: JSON with optional "lines" and "areas" in the rivers.json format:
   lines: [{"kind": "old"|"new", "coords": [[lat,lon],...] or [[[lat,lon],...], ...]}]
   areas: [{"kind": "old"|"new", "coords": [[lat,lon],...] or a list of rings}]
Old = red (dashed look), new = blue. Areas are filled half-transparent.
Tiles are cached in ./tilecache/.
"""
import argparse
import io
import json
import math
import os
import urllib.request

from PIL import Image, ImageDraw

OLD = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.zeitreihen/default/{t}1231/3857/{z}/{x}/{y}.png"
TODAY = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg"
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "tilecache")
COLORS = {"old": (200, 40, 30), "new": (31, 111, 209)}


def px(lat, lon, z):
    n = 2 ** z * 256
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def tile(url):
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, url.split("/1.0.0/")[1].replace("/", "_"))
    if not os.path.exists(f):
        req = urllib.request.Request(url, headers={"User-Agent": "how-switzerland-grew/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            open(f, "wb").write(r.read())
    return Image.open(f).convert("RGB")


def as_lines(coords):
    if coords and isinstance(coords[0][0], (int, float)):
        return [coords]
    return coords


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", required=True)
    ap.add_argument("--box", required=True)
    ap.add_argument("--zoom", type=int, default=14)
    ap.add_argument("--data")
    ap.add_argument("--out", required=True)
    ap.add_argument("--grid", type=float, help="draw a labelled lat/lon grid every STEP degrees (e.g. 0.005), to read positions")
    a = ap.parse_args()
    s, w, n, e = [float(v) for v in a.box.split(",")]
    z = a.zoom
    x0, y0 = px(n, w, z)
    x1, y1 = px(s, e, z)
    tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256)
    count = (tx1 - tx0 + 1) * (ty1 - ty0 + 1)
    if count > 100:
        raise SystemExit("Too many tiles (%d). Use a smaller box or a lower zoom." % count)
    img = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256), "white")
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            url = (TODAY if a.year == "today" else OLD).format(t=a.year, z=z, x=tx, y=ty)
            try:
                img.paste(tile(url), ((tx - tx0) * 256, (ty - ty0) * 256))
            except Exception:
                pass
    ox, oy = tx0 * 256, ty0 * 256
    over = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    data = json.load(open(a.data)) if a.data else {}
    for ar in data.get("areas", []):
        col = COLORS.get(ar.get("kind"), COLORS["old"])
        for ring in as_lines(ar["coords"]):
            pts = [(px(p[0], p[1], z)[0] - ox, px(p[0], p[1], z)[1] - oy) for p in ring]
            if len(pts) > 2:
                d.polygon(pts, fill=col + (70,), outline=col + (255,))
    for ln in data.get("lines", []):
        col = COLORS.get(ln.get("kind"), COLORS["old"])
        for line in as_lines(ln["coords"]):
            pts = [(px(p[0], p[1], z)[0] - ox, px(p[0], p[1], z)[1] - oy) for p in line]
            if ln.get("kind") == "old":  # dashed look: draw every other segment
                for i in range(len(pts) - 1):
                    if i % 2 == 0:
                        d.line([pts[i], pts[i + 1]], fill=col + (255,), width=4)
            else:
                d.line(pts, fill=col + (255,), width=4)
    if a.grid:
        import math as _m
        g = a.grid
        lat = _m.ceil(s / g) * g
        while lat < n:
            y = px(lat, w, z)[1] - oy
            d.line([(0, y), (img.width, y)], fill=(0, 0, 0, 110), width=1)
            d.text((x0 - ox + 3, y + 1), "%.4f" % lat, fill=(0, 0, 0, 255))
            lat += g
        lon = _m.ceil(w / g) * g
        while lon < e:
            x = px(s, lon, z)[0] - ox
            d.line([(x, 0), (x, img.height)], fill=(0, 0, 0, 110), width=1)
            d.text((x + 2, y0 - oy + 3), "%.4f" % lon, fill=(0, 0, 0, 255))
            lon += g
    img = Image.alpha_composite(img.convert("RGBA"), over).convert("RGB")
    crop = (int(x0 - ox), int(y0 - oy), int(x1 - ox), int(y1 - oy))
    img = img.crop(crop)
    if img.width > 1400:
        img = img.resize((1400, int(img.height * 1400 / img.width)))
    img.save(a.out)
    print("saved", a.out, img.size)
    print("pixel -> lat/lon: python3 pix2ll.py --box %s --zoom %d --size %d,%d X Y" % (a.box, z, img.width, img.height))


if __name__ == "__main__":
    main()
