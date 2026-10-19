# Engineered Switzerland

How people reshaped the Swiss landscape: rivers, marshes, lakes, streams, dams, hydropower, forests, land use, transport, protection works and animals. Every paragraph shows its sources. Each change shows the land before (dashed red) and after (blue) on today's map, why it was needed, and what was gained and lost (each with a source). The final goal is a map "Switzerland Without Us". Sister site: How Switzerland Grew.

## Run it

Double-click `index.html`. To rebuild the data: `python3 scripts/build.py` (reads `research/changes-*.json`, writes `data/changes.js`). To rebuild the uncertainty page: `python3 scripts/build_uncertain.py . "Engineered Switzerland"`.

## Files

- `research/changes-rivers.json`: 48 river changes (with 3 marsh drainages, 2 dams, 1 lake). `changes-water.json`: 57 marshes, lakes, streams and dams. `changes-hydropower.json`: 31 hydropower networks. `changes-land.json`: 17 forest and land-use changes. `changes-protection.json`: 14 protection works. `changes-species.json`: 14 animals lost and brought back. `without.json`: text of the "Switzerland Without Us" view. `changes-transport.json`: 25 railways, roads and tunnels. `evidence-*.json`: source quotes, open questions and visits (not shown on the site). `research/legacy/`: the original river research.
- `app.js`: overview (all changes, eras, time chart), stories, panel. `map.js`: the Leaflet map.
- `PLAN.md`: decisions and phases. `docs/OPEN-QUESTIONS.md`: facts to check. `docs/VISITS.md`: archive visit sheets (`python3 scripts/build_visits.py`). `scripts/tracing/`: tools to trace and check shapes on old maps.
