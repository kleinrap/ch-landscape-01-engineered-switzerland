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

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | Move the 48 corrections from "How Switzerland Grew" and convert them to the human-changes format; site shell with overview map, time chart, stories | **Done** (18 Oct 2026). `gained` / `lost` are still empty. |
| 2 | Water: marshes and wetlands (incl. peat), lake regulation and shore filling, streams in pipes, dams and hydropower (incl. dry river beds); fill `gained` / `lost` for all river changes | Next |
| 3 | Forests and land use: forest loss and regrowth (1876 forest law), pastures above the tree line, vineyard terraces, settlements, gravel pits and quarries | Planned |
| 4 | Transport: Alpine tunnels and railways, passes and roads | Planned |
| 5 | Protection: avalanche and torrent works | Planned |
| 6 | Animals lost and brought back (ibex, beaver, lynx, wolf …) | Planned |
| 7 | "Switzerland Without Us": first before industry (about 1800), then before farming (about 7,500 years ago) | Planned |

## Research workflow

Same as the sister site: open questions in `docs/OPEN-QUESTIONS.md` sorted by impact, top items as GitHub issues, visit sheets in `docs/VISITS.md` for archives and libraries. Tools for tracing and checking lines are kept outside the site (see the history of this project); new courses come from OpenStreetMap or swisstopo swissTLM3D, old courses are traced on swisstopo's historical maps and checked by eye.

## Open next steps

- Create the GitHub repository and publish on GitHub Pages (needs the owner's go-ahead). Name both repositories exactly like their folders (`ch-history-01-how-switzerland-grew`, `ch-landscape-01-engineered-switzerland`) under the same account, so the links between the sites (`../<folder>/index.html`) keep working.
- Write `gained` / `lost` for the 48 river changes.
