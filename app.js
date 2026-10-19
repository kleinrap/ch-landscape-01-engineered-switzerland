(function () {
  "use strict";

  // All human changes (data/changes.js), sorted by the year the work started.
  var CHANGES = (window.CHANGES || []).slice().sort(function (a, b) { return a.periods[0][0] - b.periods[0][0]; });
  // Story shapes may point to a before/after shape ("same": "before.lines.0") to keep the data file small.
  CHANGES.forEach(function (c) {
    c.story.stops.forEach(function (st) {
      ["lines", "areas"].forEach(function (kind) {
        (st[kind] || []).forEach(function (sh) {
          if (!sh.same) return;
          var p = sh.same.split(".");
          sh.coords = c[p[0]][p[1]][+p[2]].coords;
        });
      });
    });
  });
  var TYPE_GROUPS = [
    { label: "Large river corrections", test: function (c) { return c.type === "river" && c.scale !== "regional"; } },
    { label: "Regional river corrections", test: function (c) { return c.type === "river" && c.scale === "regional"; } },
    { label: "Marshes and wetlands", test: function (c) { return c.type === "marsh"; } },
    { label: "Lakes and shores", test: function (c) { return c.type === "lake"; } },
    { label: "Streams in pipes", test: function (c) { return c.type === "stream"; } },
    { label: "Dams and reservoirs", test: function (c) { return c.type === "dam"; } },
    { label: "Hydropower networks", test: function (c) { return c.type === "hydropower"; } },
    { label: "Forests", test: function (c) { return c.type === "forest"; } },
    { label: "Land use", test: function (c) { return c.type === "landuse"; } },
    { label: "Railways, roads and tunnels", test: function (c) { return c.type === "transport"; } },
    { label: "Protection works", test: function (c) { return c.type === "protection"; } },
    { label: "Animals lost and brought back", test: function (c) { return c.type === "species"; } }
  ];
  // Themes: the top level of the list. A theme also filters the overview map and the time chart.
  var THEMES = [
    { id: "all", label: "All", types: null },
    { id: "rivers", label: "Rivers", types: ["river"] },
    { id: "water", label: "Water and power", types: ["marsh", "lake", "stream", "dam", "hydropower"] },
    { id: "land", label: "Forests and land", types: ["forest", "landuse"] },
    { id: "transport", label: "Transport", types: ["transport"] },
    { id: "protection", label: "Protection", types: ["protection"] },
    { id: "species", label: "Animals", types: ["species"] }
  ];
  var theme = THEMES[0];
  function inTheme(c, th) { th = th || theme; return !th.types || th.types.indexOf(c.type) >= 0; }
  function shown() { return CHANGES.filter(function (c) { return inTheme(c); }); }

  // One colour per period in which the work started: the same on the map, legend and time chart.
  var ERAS = [
    { from: 0, to: 1799, color: "#5b2a86", label: "Started before 1800" },
    { from: 1800, to: 1849, color: "#2c5fb0", label: "Started 1800–1849" },
    { from: 1850, to: 1874, color: "#1f9e89", label: "Started 1850–1874" },
    { from: 1875, to: 1899, color: "#7fb800", label: "Started 1875–1899" },
    { from: 1900, to: 1949, color: "#e08a1e", label: "Started 1900–1949" },
    { from: 1950, to: 9999, color: "#b0306a", label: "Started 1950 or later" }
  ];
  function eraColor(y) { for (var i = 0; i < ERAS.length; i++) if (y >= ERAS[i].from && y <= ERAS[i].to) return ERAS[i].color; return "#666"; }
  function start(c) { return c.periods[0][0]; }
  function stateAt(c, year) {
    var st = "future";
    c.periods.forEach(function (p) { if (year >= p[0]) st = year >= p[1] ? "done" : "building"; });
    return st;
  }
  // Lines for the overview: the "after" lines and the outlines of the "after" areas (lakes, forests ...).
  function afterLines(c) {
    var out = [];
    function add(k) { if (k.length && typeof k[0][0] === "number") out.push(k); else out = out.concat(k); }
    (c.after.lines || []).forEach(function (ln) { add(ln.coords); });
    (c.after.areas || []).forEach(function (ar) { add(ar.coords); });
    return out;
  }

  // The overview: moments in the story of all changes.
  var OVERVIEW = {
    id: "all", title: "All changes", overview: true,
    summary: "Every change on one map: rivers, marshes, lakes, streams, dams, forests, land use and transport. The colour shows when the work started. Click a line, a dot or a row to open its story.",
    story: { stops: [
      { year: 1714, see: [["kander"], ["kander"]], title: "The first big correction",
        text: ["Bern leads the Kander through a hill into Lake Thun (1711–1714), to stop the floods around Thun.",
               "For almost 100 years, it is the only large river correction in today's Switzerland."] },
      { year: 1816, see: [["linth"]], title: "The Linth",
        text: ["Hans Conrad Escher leads the Linth into Lake Walen and builds a canal to Lake Zurich (1807–1816). The marshy plain becomes dry land."] },
      { year: 1865, see: [["reuss-uri", "guerbe", "seez", "orbe", "alpenrhein-oben", "rhone"]], title: "Many cantons start",
        text: ["From the 1850s, cantons straighten their rivers: the Reuss in Uri, the Gürbe, the Seez, the Orbe, the Alpine Rhine above Rüthi and the Rhône in Valais."] },
      { year: 1880, see: [["jura"], ["forstpolizeigesetz"], ["jura", "hasliaare", "emme", "thur", "glatt"]], title: "The federal state helps",
        text: ["After the great floods of 1868, the federal state starts to pay part of the cost. The constitution of 1874 and the water law of 1877 make river works in the mountains a federal task.",
               "The forest police law of 1876 puts the mountain forests under federal control. From 1902 the law covers all forests. Sources differ on whether the ban on clearing came in 1876 or in 1902.",
               "Big river projects start: the Jura water correction, the Hasli Aare, the Emme, the Thur and the Glatt."] },
      { year: 1882, see: [["gotthardbahn", "simplontunnel", "loetschbergbahn", "albulabahn"]], title: "Railways through the Alps",
        text: ["The Gotthard railway opens (1872–1882), with a 15 km tunnel from Göschenen to Airolo. The Simplon (1906), the Lötschberg (1913) and the Albula line (1904) follow."] },
      { year: 1895, see: [["toess", "ticino", "maggia"]], title: "More rivers in the east and the south",
        text: ["The Töss, the Ticino in the Magadino plain and the Maggia at Locarno follow."] },
      { year: 1925, see: [["alpenrhein-unten", "waegitalersee", "grimselsee"]], title: "New cuts, new lakes",
        text: ["Switzerland and Austria cut two big bends of the Alpine Rhine, at Fussach (1900) and Diepoldsau (1923). The first big reservoirs for electricity appear, such as the Wägitalersee (1924) and the Grimselsee (1932)."] },
      { year: 1943, see: [["anbauschlacht-plan-wahlen", "junzlen-kriegsrodung"]], title: "The war: more fields",
        text: ["To feed the country during the Second World War, the Plan Wahlen almost doubles the cropland, from 183,000 to 352,000 hectares. Marshes are drained, and about 12,900 hectares of forest are cleared."] },
      { year: 1965, see: [["grande-dixence", "mattmark"], ["a1-geneva-lausanne"]], title: "Big dams and the first motorways",
        text: ["High valleys in the Alps become reservoirs: the Grande Dixence wall (1961) is the highest gravity dam in the world. At Mattmark an ice avalanche kills 88 workers in 1965.",
               "The national road law of 1960 starts the motorway network. Geneva–Lausanne opens in 1964."] },
      { year: 1975, see: [["jura"]], title: "Second corrections",
        text: ["Some old works were not enough. The second Jura water correction (1962–1973) deepens and widens the canals. It cuts the highest lake levels and keeps the lowest levels higher."] },
      { year: 1987, see: [["moorverlust-schweiz", "rothenthurm-moor"]], title: "Protect the last moors",
        text: ["In the 19th and 20th centuries Switzerland lost about 90% of its moors and wetlands. In 1987 the voters accept the Rothenthurm initiative: the moors of national importance are protected, and peat cutting is banned."] },
      { year: 2026, see: [["moorverlust-schweiz", "flon-louve-lausanne"], ["waldzunahme-seit-1985"], ["rhone", "alpenrhein-unten"]], title: "The landscape today",
        text: ["Almost every larger river in the lowlands is now straight and held between dams. Most marshes are gone. Many streams in towns run in pipes.",
               "Forest grows again: from 1985 to 2018 about 977 km² of new forest and woody areas grew, mostly on abandoned alpine pastures.",
               "Since 2011 the water protection law asks the cantons to give rivers more space again. The third Rhône correction and the Rhesi project on the Alpine Rhine follow this new idea."] }
    ] }
  };
  // "Switzerland Without Us": every "before" shape at once. Stop keys: "today", "1800", "before-farming".
  var WITHOUT = window.WITHOUT ? {
    id: "without", title: window.WITHOUT.title, without: true, summary: window.WITHOUT.summary,
    summary_refs: window.WITHOUT.summary_refs, refs: window.WITHOUT.refs, story: { stops: window.WITHOUT.stops }
  } : null;
  var ALL = [OVERVIEW].concat(WITHOUT ? [WITHOUT] : [], CHANGES);

  var state = { id: "all", index: 0 };
  var histOn = false;
  function current() { return ALL.filter(function (c) { return c.id === state.id; })[0] || OVERVIEW; }
  function stops() { return current().story.stops; }

  // ---- drawing ----
  function drawOverview(stop) {
    var items = shown().map(function (c) {
      return { id: c.id, name: c.title, built: c.built, color: eraColor(start(c)), scale: c.scale,
               state: stateAt(c, stop.year), lines: afterLines(c), center: c.story.center };
    });
    window.RiverMap.showAll(items);
    d3.select("#fade-wrap").attr("hidden", true);
    d3.select("#river-image").attr("hidden", true);
    d3.select("#why").attr("hidden", true);
    d3.select("#gainlost").attr("hidden", true);
    var done = items.filter(function (i) { return i.state === "done"; }).length;
    var building = items.filter(function (i) { return i.state === "building"; }).length;
    d3.select("#stat").html(done + " of " + items.length + " changes finished" + (theme.types ? " (" + theme.label.toLowerCase() + ")" : "") + (building ? " <span>(" + building + " going on: dashed)</span>" : ""));
    var leg = ERAS.map(function (e) { return '<span class="swatch" style="background:' + e.color + '"></span><span>' + e.label + "</span>"; });
    leg.push('<span class="swatch" style="height:0;margin-top:9px;border-top:5px solid var(--ink);width:22px;background:none"></span><span>Thick line: large change. Thin line: regional change. A dot only: no line drawn.</span>');
    d3.select("#legend").attr("hidden", null).selectAll("li").data(leg).join("li").html(function (h) { return h; });
    drawGantt(stop.year);
  }

  function drawGantt(year) {
    var rows = shown(), rowH = 15, left = 118, W2 = 330, top = 16;
    var H2 = top + rows.length * rowH + 6;
    var x = d3.scaleLinear().domain([1700, 2030]).range([left, W2 - 6]);
    var g = d3.select("#gantt").attr("hidden", null).select("svg").attr("viewBox", "0 0 " + W2 + " " + H2);
    g.selectAll("text.gx").data([1700, 1800, 1900, 2000]).join("text").attr("class", "gx")
      .attr("x", function (d) { return x(d); }).attr("y", 10).text(function (d) { return d; });
    g.selectAll("line.gl").data([1700, 1800, 1900, 2000]).join("line").attr("class", "gl")
      .attr("x1", function (d) { return x(d); }).attr("x2", function (d) { return x(d); }).attr("y1", top - 2).attr("y2", H2);
    var row = g.selectAll("g.row").data(rows, function (c) { return c.id; }).join(function (en) {
      var gr = en.append("g").attr("class", "row").attr("tabindex", 0).attr("role", "button");
      gr.append("rect").attr("class", "hit");
      gr.append("text").attr("class", "gname");
      return gr;
    });
    row.attr("transform", function (c, i) { return "translate(0," + (top + i * rowH) + ")"; })
      .attr("aria-label", function (c) { return c.title + ", " + c.built; })
      .classed("off", function (c) { return stateAt(c, year) === "future"; })
      .on("click", function (e, c) { pick(c.id); })
      .on("keydown", function (e, c) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(c.id); } });
    row.select("rect.hit").attr("x", 0).attr("y", 0).attr("width", W2).attr("height", rowH);
    row.select("text.gname").attr("x", left - 6).attr("y", rowH - 4)
      .classed("regional", function (c) { return c.scale === "regional"; })
      .text(function (c) { return (start(c) < 1700 ? "← " : "") + (c.title.length > 20 ? c.title.slice(0, 19) + "…" : c.title); });
    row.selectAll("rect.bar").data(function (c) { return c.periods.map(function (p) { return { p: p, c: eraColor(start(c)) }; }); })
      .join("rect").attr("class", "bar")
      // Work that started before 1700 (forests, vineyards) starts at the left edge of the chart.
      .attr("x", function (d) { return x(Math.max(d.p[0], 1700)); }).attr("y", 3)
      .attr("width", function (d) { return Math.max(3, x(Math.max(d.p[1], 1700)) - x(Math.max(d.p[0], 1700))); }).attr("height", rowH - 6)
      .attr("rx", 2).style("fill", function (d) { return d.c; });
    g.selectAll("line.now").data([year]).join("line").attr("class", "now")
      .attr("x1", x(year)).attr("x2", x(year)).attr("y1", top - 4).attr("y2", H2);
  }

  // ---- sources ----
  // Each change has "refs" [{id, url, title, quote, supports}] and, per paragraph, lists of ref ids
  // (summary_refs, why_refs, gained_refs, lost_refs, stop.refs). A paragraph with no ref gets a visible tag.
  function esc(t) { return String(t).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }
  function refIndex(c) { var m = {}; (c.refs || []).forEach(function (r, i) { m[r.id] = i + 1; }); return m; }
  function withRefs(c, text, ids) {
    if (!c.refs) return esc(text);
    var idx = refIndex(c), html = esc(text);
    ids = (ids || []).filter(function (id) { return idx[id]; });
    if (ids.length) {
      html += " " + ids.map(function (id) {
        return '<sup class="ref"><a href="#" data-ref="' + esc(id) + '" title="Source ' + idx[id] + '">' + idx[id] + "</a></sup>";
      }).join("");
    } else {
      html += /not confirmed/i.test(text) ? ' <span class="nosrc warn">not confirmed</span>' : ' <span class="nosrc">no source yet</span>';
    }
    return html;
  }
  function refItem(c, r) {
    var idx = refIndex(c);
    return '<span class="rn">' + idx[r.id] + "</span> " +
      '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.title || r.url) + "</a>" +
      (r.quote ? ' <q>' + esc(r.quote) + "</q>" : "") +
      (r.supports ? ' <span class="sup">Supports: ' + esc(r.supports) + "</span>" : "");
  }
  function drawSources(c, stop) {
    var used = [];
    (stop.refs || []).forEach(function (l) { (l || []).forEach(function (id) { if (used.indexOf(id) < 0) used.push(id); }); });
    var stepRefs = (c.refs || []).filter(function (r) { return used.indexOf(r.id) >= 0; });
    d3.select("#step-sources").attr("hidden", stepRefs.length ? null : true)
      .select("ul").selectAll("li").data(stepRefs).join("li").attr("data-id", function (r) { return r.id; }).html(function (r) { return refItem(c, r); });
    d3.select("#all-sources").attr("hidden", c.refs && c.refs.length ? null : true);
    d3.select("#all-sources-n").text(c.refs ? c.refs.length : 0);
    d3.select("#all-sources ol").selectAll("li").data(c.refs || []).join("li").attr("data-id", function (r) { return r.id; }).html(function (r) { return refItem(c, r); });
  }
  // Click on a source number: open the list of all sources and show that source.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("sup.ref a");
    if (!a) return;
    e.preventDefault();
    var box = document.getElementById("all-sources");
    box.open = true;
    var li = box.querySelector('li[data-id="' + a.getAttribute("data-ref") + '"]');
    if (li) {
      li.scrollIntoView({ block: "center", behavior: "smooth" });
      li.classList.add("hit"); setTimeout(function () { li.classList.remove("hit"); }, 1600);
    }
  });

  function drawWithout(c, stop) {
    var list = CHANGES.filter(function (ch) {
      if (stop.key === "today") return true;
      if (stop.key === "1800") return start(ch) >= 1800;
      return true;
    });
    var lines = [], areas = [], part = stop.key === "today" ? "after" : "before", kind = stop.key === "today" ? "new" : "old";
    list.forEach(function (ch) {
      (ch[part].lines || []).forEach(function (l) { lines.push({ name: ch.title, kind: kind, coords: l.coords }); });
      (ch[part].areas || []).forEach(function (a) { areas.push({ name: ch.title, kind: kind, coords: a.coords }); });
    });
    window.RiverMap.leaveOverview();
    var hasHist = !!stop.mapYear;
    window.RiverMap.show({ center: [46.8, 8.2], zoom: 8 }, { lines: lines, areas: areas, places: [], fitCH: true, map: hasHist ? "old" : "today", mapYear: stop.mapYear });
    d3.select("#fade-wrap").attr("hidden", hasHist ? null : true);
    d3.select("#hist-toggle").attr("aria-pressed", histOn ? "true" : "false")
      .text(histOn ? "Historical map " + stop.mapYear + ": on" : "Show historical map (" + (stop.mapYear || "") + ")");
    d3.select("#fade").attr("hidden", histOn && hasHist ? null : true);
    d3.select("#river-image").attr("hidden", true);
    d3.select("#why").attr("hidden", true);
    d3.select("#gainlost").attr("hidden", true);
    d3.select("#gantt").attr("hidden", true);
    var withShape = list.filter(function (ch) { return ch[part].lines.length || ch[part].areas.length; }).length;
    d3.select("#stat").html(stop.key === "today"
      ? "Blue: what people built or changed (" + withShape + " changes with a shape)."
      : "Red: the land and water before " + (stop.key === "1800" ? "the changes made after 1800" : "all the changes") + " (" + withShape + " of " + list.length + " changes have a checked shape). <span>Changes without a checked shape are not drawn.</span>");
    var LS = window.RiverMap.LINE_STYLE, st = LS[kind];
    d3.select("#legend").attr("hidden", null).selectAll("li").data([1]).join("li").html(
      '<span class="swatch" style="height:0;margin-top:9px;border-top:4px ' + (st.dashArray ? "dashed" : "solid") + " " + st.color + ';background:none;width:22px"></span><span>' +
      (kind === "old" ? "Before people changed it (rivers, marshes, lakes, forests …)" : "After: the changed landscape today") + "</span>");
    drawSources(c, stop);
  }

  function drawChange(c, stop) {
    window.RiverMap.leaveOverview();
    window.RiverMap.show(c.story, stop);
    var hasHist = stop.map !== "today" && stop.mapYear;
    d3.select("#fade-wrap").attr("hidden", hasHist ? null : true);
    d3.select("#hist-toggle").attr("aria-pressed", histOn ? "true" : "false")
      .text(histOn ? "Historical map " + stop.mapYear + ": on" : "Show historical map (" + (hasHist ? stop.mapYear : "") + ")");
    d3.select("#fade").attr("hidden", histOn ? null : true);
    var before = histOn && stop.year < 1844;
    d3.select("#stat").html(histOn && hasHist
      ? "Historical map: swisstopo, state of " + stop.mapYear +
        (before ? " <span>(it shows the land after the work; the oldest swisstopo maps start in 1844)</span>" : "")
      : "Base map: swisstopo today <span>(red dashed = before, blue = after)</span>");
    var img = stop.image;
    d3.select("#river-image").attr("hidden", img ? null : true);
    if (img) {
      d3.select("#river-image-img").attr("src", img.url).attr("alt", img.caption || "Historical map");
      d3.select("#river-image-link").attr("href", img.source || img.url);
      d3.select("#river-image-cap").html("");
      d3.select("#river-image-cap").append("span").text((img.caption || "") + " ");
      d3.select("#river-image-cap").append("a").attr("href", img.source || img.url).attr("target", "_blank")
        .text("Source" + (img.license ? " · " + img.license : ""));
    }
    d3.select("#why").attr("hidden", c.why && c.why.length ? null : true);
    d3.select("#why-text").selectAll("p").data(c.why || []).join("p").html(function (d, i) { return withRefs(c, d, (c.why_refs || [])[i]); });
    var hasGL = (c.gained && c.gained.length) || (c.lost && c.lost.length);
    d3.select("#gainlost").attr("hidden", hasGL ? null : true);
    d3.select("#gained").selectAll("li").data(c.gained || []).join("li").html(function (d, i) { return withRefs(c, d, (c.gained_refs || [])[i]); });
    d3.select("#lost").selectAll("li").data(c.lost || []).join("li").html(function (d, i) { return withRefs(c, d, (c.lost_refs || [])[i]); });
    drawSources(c, stop);
    d3.select("#gantt").attr("hidden", true);
    var LS = window.RiverMap.LINE_STYLE;
    var items = (stop.areas || []).map(function (ar) { return { area: LS[ar.kind] || LS.old, label: ar.name }; })
      .concat((stop.lines || []).map(function (ln) { return { line: LS[ln.kind] || LS.old, label: ln.name }; }));
    d3.select("#legend").attr("hidden", items.length ? null : true);
    d3.select("#legend").selectAll("li").data(items).join("li").html(function (d) {
      if (d.area) return '<span class="swatch" style="background:' + d.area.color + '33;border:1.5px solid ' + d.area.color + '"></span><span>' + d.label + "</span>";
      var st = d.line || {};
      return '<span class="swatch" style="height:0;margin-top:9px;border-top:4px ' + (st.dashArray ? "dashed" : "solid") +
        " " + st.color + ';background:none;width:22px"></span><span>' + d.label + "</span>";
    });
  }

  function tickText(s) { return s.tick || String(s.year); }
  function renderTicks() {
    var list = stops();
    d3.select("#ticks").selectAll("li").data(list, function (d, i) { return state.id + i + tickText(d); }).join("li")
      .html(function (d) { return "<button>" + tickText(d) + "</button>"; })
      .select("button")
      .attr("aria-current", function (d, i) { return i === state.index ? "true" : "false"; })
      .attr("aria-label", function (d) { return tickText(d) + ": " + d.title; })
      .on("click", function (e, d) { stopPlay(); go(list.indexOf(d)); });
  }

  function render() {
    var c = current(), s = stops()[state.index];
    // An open change always shows its own theme in the list (e.g. after a link or a search).
    if (!c.overview && !c.without && !inTheme(c)) theme = THEMES.filter(function (t) { return t.types && inTheme(c, t); })[0] || THEMES[0];
    d3.select("#summary").html(c.overview ? esc(c.summary) : "<strong>" + esc(c.title) + ":</strong> " + withRefs(c, c.summary, c.summary_refs));
    d3.select("#year").text(s.when || (s.year < 0 ? (s.tick || -s.year + " BC") : String(s.year)));
    d3.select("#title").text(s.title);
    d3.select("#text").selectAll("p").data(s.text).join("p").html(function (d, i) {
      if (!c.overview) return withRefs(c, d, (s.refs || [])[i]);
      // Overview: the facts come from the change stories; link to them (their sources are there).
      var ids = (s.see || [])[i] || [];
      var links = ids.map(function (id) {
        var ch = CHANGES.filter(function (x) { return x.id === id; })[0];
        return ch ? '<a href="#" class="see" data-id="' + esc(id) + '">' + esc(ch.title) + "</a>" : "";
      }).filter(Boolean);
      return esc(d) + (links.length ? ' <span class="see-list">Sources in: ' + links.join(", ") + "</span>" : ' <span class="nosrc">no source yet</span>');
    });
    d3.select("#text").selectAll("a.see").on("click", function (e) { e.preventDefault(); pick(this.getAttribute("data-id")); });
    if (!c.refs) { d3.select("#step-sources").attr("hidden", true); d3.select("#all-sources").attr("hidden", true); }
    d3.select("#notes").attr("hidden", c.notes ? null : true);
    d3.select("#notes-text").text(c.notes || "");
    if (c.overview) drawOverview(s); else if (c.without) drawWithout(c, s); else drawChange(c, s);
    drawPicker();
    renderTicks();
    var cur = document.querySelector('#ticks [aria-current="true"]');
    if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest", inline: "nearest" });
    try { window.history.replaceState(null, "", "#" + state.id + "-" + tickText(s).toLowerCase().replace(/[^a-z0-9]+/g, "-")); } catch (e) { /* file:// */ }
  }

  function go(i) { var n = stops().length; state.index = (i + n) % n; render(); }
  function pick(id) { stopPlay(); state.id = id; state.index = 0; render(); }

  // ---- controls ----
  var timer = null;
  function stopPlay() { if (timer) { clearInterval(timer); timer = null; d3.select("#play").html("&#9654;").attr("aria-label", "Play"); } }
  d3.select("#play").on("click", function () {
    if (timer) return stopPlay();
    d3.select(this).html("&#10074;&#10074;").attr("aria-label", "Pause");
    if (state.index === stops().length - 1) go(0);
    timer = setInterval(function () {
      if (state.index === stops().length - 1) return stopPlay();
      go(state.index + 1);
    }, 3200);
  });
  d3.select("#prev").on("click", function () { stopPlay(); go(state.index - 1); });
  d3.select("#next").on("click", function () { stopPlay(); go(state.index + 1); });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") { stopPlay(); go(state.index + 1); }
    if (e.key === "ArrowLeft") { stopPlay(); go(state.index - 1); }
  });
  d3.select("#hist-toggle").on("click", function () { histOn = !histOn; window.RiverMap.setHistory(histOn); render(); });
  d3.select("#fade").on("input", function () { window.RiverMap.setHistOpacity(this.value / 100); });
  window.RiverMap.setPick(pick);

  // List of changes: theme tabs, a search box, and one folding group per kind of change (each by start year).
  var query = "", openSet = {};
  // Canton names (English, German, French, Italian), so a search for "Valais" or "Wallis" finds "VS".
  var CANTON_NAMES = {
    AG: "Aargau Argovie", AI: "Appenzell Innerrhoden", AR: "Appenzell Ausserrhoden", BE: "Bern Berne", BL: "Basel-Landschaft Bâle",
    BS: "Basel-Stadt Bâle", FR: "Fribourg Freiburg", GE: "Geneva Genève Genf", GL: "Glarus Glaris", GR: "Graubünden Grisons Grigioni",
    JU: "Jura", LU: "Lucerne Luzern", NE: "Neuchâtel Neuenburg", NW: "Nidwalden", OW: "Obwalden", SG: "St. Gallen Saint-Gall",
    SH: "Schaffhausen Schaffhouse", SO: "Solothurn Soleure", SZ: "Schwyz", TG: "Thurgau Thurgovie", TI: "Ticino Tessin",
    UR: "Uri", VD: "Vaud Waadt", VS: "Valais Wallis Vallese", ZG: "Zug Zoug", ZH: "Zurich Zürich"
  };
  function matches(c) {
    if (!query) return true;
    var t = (c.title + " " + (c.place || "") + " " + (c.cantons || []).map(function (k) { return k + " " + (CANTON_NAMES[k] || ""); }).join(" ") + " " + (c.built || "")).toLowerCase();
    return query.split(/\s+/).every(function (w) { return t.indexOf(w) >= 0; });
  }
  function drawPicker() {
    var tabs = d3.select("#themes").selectAll("button")
      .data(THEMES.filter(function (t) { return CHANGES.some(function (c) { return inTheme(c, t); }); }), function (t) { return t.id; }).join("button")
      .attr("type", "button").attr("role", "tab")
      .attr("aria-selected", function (t) { return t === theme ? "true" : "false"; })
      .html(function (t) { return t.label + ' <span class="n">' + CHANGES.filter(function (c) { return inTheme(c, t); }).length + "</span>"; })
      .on("click", function (e, t) {
        theme = t;
        try { localStorage.setItem("es-theme", t.id); } catch (err) { /* private mode */ }
        if (state.id !== "all" && !inTheme(current())) { state.id = "all"; state.index = 0; }
        render();
      });
    var groups = TYPE_GROUPS.map(function (g) {
      return { g: g, list: CHANGES.filter(function (c) { return g.test(c) && (query ? true : inTheme(c)) && matches(c); }) };
    }).filter(function (x) { return x.list.length; });
    var box = d3.select("#river-chips");
    box.selectAll("*").remove();
    if (!groups.length) box.append("p").attr("class", "no-hit").text("No change found.");
    groups.forEach(function (x) {
      var open = query || groups.length === 1 || openSet[x.g.label] || x.list.some(function (c) { return c.id === state.id; });
      var d = box.append("details").attr("class", "group").property("open", !!open)
        .on("toggle", function () { if (!query) openSet[x.g.label] = this.open; });
      d.append("summary").html(x.g.label + ' <span class="n">' + x.list.length + "</span>");
      var wrap = d.append("div").attr("class", "chips-in");
      x.list.forEach(function (c) {
        wrap.append("button").attr("type", "button").datum(c)
          .attr("aria-pressed", c.id === state.id ? "true" : "false")
          .html('<span class="t"></span> <span class="y"></span>')
          .on("click", function () { pick(c.id); });
      });
      wrap.selectAll("button").select(".t").text(function (c) { return c.title; });
      wrap.selectAll("button").select(".y").text(function (c) { return c.built ? c.built.split(/[;(,]/)[0].trim() : ""; });
    });
    d3.select("#overview-btn").attr("aria-pressed", state.id === "all" ? "true" : "false");
    d3.select("#without-btn").attr("hidden", WITHOUT ? null : true).attr("aria-pressed", state.id === "without" ? "true" : "false");
  }
  d3.select("#overview-btn").on("click", function () { pick("all"); });
  d3.select("#without-btn").on("click", function () { pick("without"); });
  d3.select("#find").on("input", function () { query = this.value.trim().toLowerCase(); drawPicker(); });
  try {
    var saved = localStorage.getItem("es-theme");
    THEMES.forEach(function (t) { if (t.id === saved) theme = t; });
  } catch (err) { /* private mode */ }

  d3.select("#sources").html(
    'Maps: <a href="https://www.swisstopo.admin.ch/en/journey-through-time-historical-maps">swisstopo</a> (national map and "Journey through time"). ' +
    'New courses: <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> (ODbL) and swisstopo swissTLM3D. ' +
    'History: <a href="https://hls-dhs-dss.ch/de/articles/007850">Historisches Lexikon der Schweiz</a>, BAFU, cantons; sources per change.');

  // Link "#<id>-<tick>": ids may contain dashes, so take the longest id that starts the hash.
  function fromHash() {
    var hash = location.hash.slice(1), hit = null;
    ALL.forEach(function (c) { if (hash.indexOf(c.id + "-") === 0 && (!hit || c.id.length > hit.id.length)) hit = c; });
    if (!hit) return false;
    state.id = hit.id; state.index = 0;
    var tick = hash.slice(hit.id.length + 1);
    stops().forEach(function (s, i) { if (tickText(s).toLowerCase().replace(/[^a-z0-9]+/g, "-") === tick) state.index = i; });
    return true;
  }
  fromHash();
  window.addEventListener("hashchange", function () { if (fromHash()) { stopPlay(); render(); } });
  render();
})();
