#!/usr/bin/env python3
"""Official federal geodata (api3.geo.admin.ch) for a layer in a box, as JSON with [lat, lon] coordinates.

Usage:
  python3 geoadmin.py <layer> s,w,n,e [--attrs]
Useful layers for hydropower:
  ch.bfe.statistik-wasserkraftanlagen  power stations (WASTA: name, start year, MW, GWh, head)   points
  ch.bafu.wasser-entnahme               water intakes (residual flow map; link to a PDF sheet)    points
  ch.bafu.wasser-leitungen              water lines from intake to plant (tunnels, pipes)         lines
  ch.bafu.wasser-rueckgabe              return points (where the water goes back to a river)      points
  ch.bfe.stauanlagen-bundesaufsicht     dams under federal supervision                            points
Output: {"layer", "source", "features": [{"id", "attributes", "type": "point|line|area", "coords"}]}
Data: Swiss Confederation (BFE, BAFU), open government data, via geo.admin.ch.
"""
import json
import sys
import urllib.parse
import urllib.request

API = "https://api3.geo.admin.ch/rest/services/api/MapServer/identify"


def get(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "engineered-switzerland/1.0 (research)"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


def to_ll(xy):
    return [round(xy[1], 6), round(xy[0], 6)]


def shape(g):
    t = g.get("type")
    c = g.get("coordinates")
    if t == "Point":
        return "point", to_ll(c)
    if t == "MultiPoint":
        return "point", [to_ll(p) for p in c]
    if t == "LineString":
        return "line", [[to_ll(p) for p in c]]
    if t == "MultiLineString":
        return "line", [[to_ll(p) for p in l] for l in c]
    if t == "Polygon":
        return "area", [[to_ll(p) for p in r] for r in c]
    if t == "MultiPolygon":
        return "area", [[to_ll(p) for p in r] for poly in c for r in poly[:1]]
    return t, c


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    layer, box = sys.argv[1], sys.argv[2]
    s, w, n, e = [float(v) for v in box.split(",")]
    out, offset = [], 0
    while True:
        d = get({"geometryType": "esriGeometryEnvelope", "geometry": "%f,%f,%f,%f" % (w, s, e, n),
                 "sr": 4326, "imageDisplay": "1000,1000,96", "mapExtent": "%f,%f,%f,%f" % (w, s, e, n),
                 "tolerance": 0, "layers": "all:" + layer, "returnGeometry": "true", "geometryFormat": "geojson",
                 "limit": 50, "offset": offset, "lang": "en"})
        res = d.get("results", [])
        for r in res:
            kind, coords = shape(r.get("geometry", {}))
            out.append({"id": r.get("featureId"), "attributes": r.get("properties") or r.get("attributes"), "type": kind, "coords": coords})
        if len(res) < 50:
            break
        offset += 50
    print(json.dumps({"layer": layer, "source": "geo.admin.ch (Swiss Confederation)", "features": out}, ensure_ascii=False))
    sys.stderr.write("%d feature(s)\n" % len(out))


if __name__ == "__main__":
    main()
