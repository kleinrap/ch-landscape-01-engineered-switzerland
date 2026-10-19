# Plan: Engineered Switzerland

How people reshaped the Swiss landscape: why each change was needed (floods, disease, hunger, safety) and what was lost. Sister site: [How Switzerland Grew](../ch-history-01-how-switzerland-grew/) (history through maps).

Final goal: **"Switzerland Without Us"**, a map of Switzerland as it would look without people, built by undoing every recorded change.

## Decisions (October 2026)

- **Readers:** curious people. Sources for every change, uncertain points visible (note per change, `uncertain.html`).
- **Tone:** neutral. Every change shows **why it was needed** and **what was gained / what was lost**.
- **Data model:** one list of **human changes** (`research/changes-*.json`, built into `data/changes.js` by `scripts/build.py`). Each change has:
  - `type` (river, marsh, lake, dam, stream, forest, landuse, transport, protection, species), `periods`, `place`, `scale` (major / regional)
  - `before` and `after` shapes (lines and areas) — the "before" shapes together become "Switzerland Without Us"
  - `certainty`, `why`, `gained`, `lost`, `sources`, `notes`
  - `story.stops`: the step-by-step story for the reader
- **Map:** today's grey swisstopo map as the base. Before = dashed red, after = blue. The historical swisstopo map of each step is an optional add-on.
- **Language:** English now, DE/FR/IT later. **Name:** "Engineered Switzerland" (no domain yet).
- **Code:** its own git repository, published on GitHub Pages.
- **Licences:** texts CC BY 4.0, code MIT, data derived from OpenStreetMap ODbL.

## Live

- How Switzerland Grew: https://kleinrap.github.io/ch-history-01-how-switzerland-grew/
- Engineered Switzerland: https://kleinrap.github.io/ch-landscape-01-engineered-switzerland/

Published on GitHub Pages from the `main` branch (18 Oct 2026). The repository names equal the folder names, so the links between the sites (`../<folder>/index.html`) work both online and from disk.

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | Move the 48 corrections from "How Switzerland Grew" and convert them to the human-changes format; site shell with overview map, time chart, stories | **Done** (18 Oct 2026) |
| 2 | Water: (a) fill `gained` / `lost` for the 48 existing changes; (b) marshes and wetlands (incl. peat), lake regulation and shore filling, streams in pipes, dams and hydropower (incl. dry river beds) | (a) **Done** (19 Oct 2026); (b) **first round done** (19 Oct 2026): 57 changes (9 marshes, 11 lakes, 8 streams, 29 dams) |
| 2c | Hydropower networks: collection tunnels, pressure shafts, power stations, river stretches with only residual flow; national picture (growth, residual-flow law, hydropeaking) | **First round done** (20 Oct 2026): 31 changes (27 schemes, 4 national) |
| 3 | Forests and land use: forest loss and regrowth (1876 forest law), pastures above the tree line, vineyard terraces, settlements, gravel pits and quarries | **First round done** (19 Oct 2026): 17 changes (8 forest, 9 land use) |
| 4 | Transport: Alpine tunnels and railways, passes and roads | **First round done** (19 Oct 2026): 25 changes (14 railways and tunnels, 11 roads, passes and road tunnels) |
| 5 | Protection: avalanche and torrent works | **First round done** (20 Oct 2026): 14 changes (7 avalanche, 7 torrent, debris-flow, rockfall and flood) |
| 6 | Animals lost and brought back (ibex, beaver, lynx, wolf …) | **First round done** (20 Oct 2026): 14 changes (9 mammals, 5 birds and fish) |
| 7 | "Switzerland Without Us": first before industry (about 1800), then before farming (about 7,500 years ago) | **First version done** (20 Oct 2026): a view that draws all checked "before" shapes; sourced text in `research/without.json` |

## Research workflow

Same as the sister site: open questions in `docs/OPEN-QUESTIONS.md` sorted by impact, top items as GitHub issues, visit sheets in `docs/VISITS.md` for archives and libraries. Tools for tracing and checking lines are kept outside the site (see the history of this project); new courses come from OpenStreetMap or swisstopo swissTLM3D, old courses are traced on swisstopo's historical maps and checked by eye.

## Gained and lost (19 Oct 2026)

- Order agreed with the user: first `gained` / `lost` for the 48 existing changes, then the new water changes.
- 94 gained and 122 lost items. Each item has a short quote from a source in `research/evidence-gainlost.json` (not read by the build). Scope "region" there means the source covers the wider valley.
- Rule: no item without a source. So some changes have few or no items (Thur in the Toggenburg, Suze, Areuse). Many sources do not state a safety gain; often floods continued. Gaps are listed in `docs/OPEN-QUESTIONS.md` (round 4).
- Hydropower effects (e.g. Maggia) are left for the dam changes of phase 2b.

## Transport, first round (19 Oct 2026)

- `research/changes-transport.json`: 25 changes. "After" lines from OpenStreetMap (railways) or the federal inventories (IVS historic routes, ASTRA national roads), checked on the first map after opening and on today's map. "Before" is mostly empty: old mule paths are drawn only where they were checked on an old map.
- Reviewer data (quotes, open questions, visits, check images) in `research/evidence-transport.json`. Open questions in `docs/OPEN-QUESTIONS.md` (round 5); archive visits in `docs/VISITS.md` (built by `scripts/build_visits.py`).
- Facts that rested only on Wikipedia were removed.

## Forests and land use, first round (19 Oct 2026)

- `research/changes-land.json`: 17 changes. The user chose "sample areas + numbers": shapes only in small sample areas where the old map shows the old state clearly; Swiss-wide numbers in the text. 7 changes have no shape (places only).
- Every gained/lost item has a source quote in `research/evidence-land.json`, or is marked as measured on the maps.
- The time chart starts in 1700; older work (vineyards, protection forests) starts at the left edge with "←".

## Water, first round (19 Oct 2026)

- `research/changes-water.json`: 57 changes. Marshes: before = marsh area on the Siegfried map (by eye, approximate), after = remaining moor from the federal inventories. Lakes: old shore or filled land where the map shows it; level changes too small for the map have places only. Streams: open course on the oldest useful map, reopened parts from OpenStreetMap. Dams: old river traced on the last map before the dam, reservoir from OpenStreetMap.
- Overlaps are marked in the notes: Grande Cariçaie (made by the Jura lake lowering, "jura"), Linth plain drainage 1941–64 ("linth"), Lac de la Gruyère ("saane").
- Every gained/lost item has a source quote in `research/evidence-water.json`, or is marked as seen on the maps. Facts seen only in search extracts or on Wikipedia were removed.
- Left for later: Gelmersee, Räterichsbodensee, Bannalpsee, Verbois, the Maggia hydropower (residual flow), the Seedamm, Hallwilersee.

## Hydropower networks, phase 2c (decided 19 Oct 2026)

- The user's rule: draw only lines from official or checked data.
- Result: `research/changes-hydropower.json`, 31 changes (27 schemes in VS, BE/UR/SZ/GL/VD, GR/SG, TI; 4 national: growth, residual-flow law, hydropeaking, water fees). Left for later: Misox, Prättigau, Lungern/Engelberg, Saane stations.
- Type `hydropower`, one change per scheme. Water lines from the BAFU residual flow map (`ch.bafu.wasser-leitungen`: simplified, not exact tunnel routes), intakes and return points (`ch.bafu.wasser-entnahme`, `ch.bafu.wasser-rueckgabe`), stations from BFE WASTA (`ch.bfe.statistik-wasserkraftanlagen`), rivers from swissTLM3D. Tool: `scripts/tracing/geoadmin.py`.
- Red dashed = river stretches that now carry only residual flow (cut at official intake and return points). Reservoirs stay in their own "dam" changes.

## Sources for every element (20 Oct 2026)

- The user asked: "finish all phases, and then we need sources", because for some elements it was not clear where a fact came from.
- Format: each change has `refs` [{id, url, title, quote, supports}] and, per paragraph, lists of ref ids (`summary_refs`, `why_refs`, `gained_refs`, `lost_refs`, and `refs` in each story step). The site shows the numbers after each paragraph, "Sources for this step" and "All sources for this change". A paragraph with no source shows "no source yet"; a point marked "not confirmed" shows that tag. `scripts/build.py` counts paragraphs without a source (now 0) and rejects unknown ref ids.
- The overview story links each paragraph to the change stories that hold its sources.
- `research/evidence-*.json` keep the reviewer data (open questions, visits, check images).

## Open next steps

- More changes for phases 2–4 (see the "left for later" lists), then phase 5 (protection works) and phase 6 (animals).
- Fill the gaps of round 4, where an archive can help (docs/VISITS.md).
