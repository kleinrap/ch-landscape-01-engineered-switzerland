# Engineered Switzerland

How people reshaped the Swiss landscape: river corrections, drained marshes, lakes and dams. Each change shows the land before (dashed red) and after (blue) on today's map, why it was needed, and (soon) what was gained and lost. The final goal is a map "Switzerland Without Us". Sister site: How Switzerland Grew.

## Run it

Double-click `index.html`. To rebuild the data: `python3 scripts/build.py` (reads `research/changes-*.json`, writes `data/changes.js`). To rebuild the uncertainty page: `python3 scripts/build_uncertain.py . "Engineered Switzerland"`.

## Files

- `research/changes-rivers.json`: 48 changes (41 rivers, 3 marsh drainages, 2 dams, 1 lake). `research/legacy/`: the original river research.
- `app.js`: overview (all changes, eras, time chart), stories, panel. `map.js`: the Leaflet map.
- `PLAN.md`: decisions and phases. `docs/OPEN-QUESTIONS.md`: facts to check.
