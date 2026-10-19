# Tracing tools (not part of the site)

- `today_river.py "<name>" south,west,north,east`: today's course of a river or canal from OpenStreetMap (Overpass API), as JSON lines for the "after" shape.
- `overlay.py --year 1860 --box s,w,n,e --zoom 14 --data stop.json --out check.png`: draws lines and areas on swisstopo's map of that year ("Journey through time"), to check a trace by eye. Needs Pillow: `python3 -m venv .venv && .venv/bin/pip install pillow`, then run it with `.venv/bin/python`. Tiles are cached in `tilecache/` (ignored by git).
- `osm_shape.py '<overpass tag filter>' s,w,n,e --area|--line`: today's shape of any OpenStreetMap feature (lake, reservoir, railway, road, forest), for "after" shapes.
- `overlay.py ... --grid 0.005`: adds a labelled lat/lon grid, to read positions on the old map. `pix2ll.py --box ... --zoom ... --size W,H X Y ...` turns pixel positions in the image into lat/lon.
- `geoadmin.py <layer> s,w,n,e`: official federal geodata from geo.admin.ch, e.g. power stations (`ch.bfe.statistik-wasserkraftanlagen`), water intakes (`ch.bafu.wasser-entnahme`), water lines from intake to plant (`ch.bafu.wasser-leitungen`), return points (`ch.bafu.wasser-rueckgabe`), rivers (`ch.swisstopo.swisstlm3d-gewaessernetz`).
