// River corrections tab: a Leaflet map. Base = today's grey swisstopo map (the same for every
// river and step); old (red, dashed) and new (blue) courses are drawn on top. The historical
// "Journey through time" map of the step is an add-on the reader can switch on.
// Classic script; app.js calls window.RiverMap.show(river, stop).
(function () {
  "use strict";

  var OLD = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.zeitreihen/default/{t}1231/3857/{z}/{x}/{y}.png";
  var BASE = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg";
  var ATTR = 'Maps © <a href="https://www.swisstopo.admin.ch/en/journey-through-time-historical-maps">swisstopo</a>';
  var BOUNDS = [[45.6, 5.7], [48.0, 10.7]];
  var CH_BOUNDS = [[45.82, 5.96], [47.81, 10.49]];

  var map = null, oldLayer = null, baseLayer = null, markers = null, lines = null;
  var histOn = false, histOpacity = 0.85;
  // Old river course: dashed red ("the river was here"). New canal or bed: solid blue (water today).
  var LINE_STYLE = {
    old: { color: "#c8281e", weight: 5, opacity: 0.9, dashArray: "10 8" },
    "new": { color: "#1f6fd1", weight: 5, opacity: 0.9 }
  };

  function init() {
    if (map || typeof L === "undefined") return;
    map = L.map("river-map", { minZoom: 8, maxZoom: 16, maxBounds: BOUNDS, zoomSnap: 0.5, attributionControl: true });
    // Faded grey base map: calm, recent, with terrain, and it covers the land across the border.
    baseLayer = L.tileLayer(BASE, { maxZoom: 16, attribution: ATTR, opacity: 0.5, zIndex: 1 }).addTo(map);
    lines = L.layerGroup().addTo(map);
    markers = L.layerGroup().addTo(map);
  }

  var onPick = null;
  function show(river, stop) {
    init();
    if (!map) return false;
    if (oldLayer) { map.removeLayer(oldLayer); oldLayer = null; }
    if (histOn && stop.map !== "today" && stop.mapYear) {
      oldLayer = L.tileLayer(OLD, { t: String(stop.mapYear), maxZoom: 16, attribution: ATTR, zIndex: 2, opacity: histOpacity }).addTo(map);
    }
    lines.clearLayers();
    // Areas: the wide old river bed (gravel, side channels) or a new lake or delta. Under the lines.
    (stop.areas || []).forEach(function (ar) {
      var st = LINE_STYLE[ar.kind] || LINE_STYLE.old;
      L.polygon(ar.coords, { color: st.color, weight: 1.5, opacity: 0.8, fillColor: st.color, fillOpacity: 0.18 })
        .bindTooltip(ar.name, { sticky: true }).addTo(lines);
    });
    // Lines: coords may be one line or a list of lines (a river in several pieces).
    (stop.lines || []).forEach(function (ln) {
      L.polyline(ln.coords, LINE_STYLE[ln.kind] || LINE_STYLE.old).bindTooltip(ln.name, { sticky: true }).addTo(lines);
    });
    markers.clearLayers();
    (stop.places || []).forEach(function (p) {
      var mk = L.circleMarker([p.lat, p.lon], { radius: p.river ? 8 : 6, weight: 2, color: "#fff", fillColor: p.river ? "#1f6fd1" : "#b3261e", fillOpacity: 1 })
        .bindTooltip(p.name, { permanent: true, direction: "right", className: "river-tip" }).addTo(markers);
      if (p.river) mk.on("click", function () { if (onPick) onPick(p.river); });
    });
    map.invalidateSize();
    var zoom = stop.zoom || river.zoom || 13;
    var drawn = L.featureGroup(lines.getLayers());
    // Wide overview steps: fit the whole drawn river into the map, so no end is cut off.
    if (stop.fitCH) map.fitBounds(CH_BOUNDS, { animate: false });
    else if (zoom <= 11 && drawn.getLayers().length) map.fitBounds(drawn.getBounds(), { padding: [20, 20], animate: false });
    else map.setView(stop.center || river.center, zoom, { animate: false });
    return true;
  }

  // Overview: every correction on one map. items: [{id, name, built, color, state, lines}],
  // state "done" (solid), "building" (dashed), "future" (not drawn).
  var overviewFitted = false;
  function showAll(items) {
    init();
    if (!map) return false;
    if (oldLayer) { map.removeLayer(oldLayer); oldLayer = null; }
    lines.clearLayers();
    markers.clearLayers();
    items.forEach(function (it) {
      if (it.state === "future") return;
      // Large corrections (HLS table) thick, regional ones thin.
      var regional = it.scale === "regional";
      var style = { color: it.color, weight: regional ? 3 : 5.5, opacity: regional ? 0.85 : 0.95, dashArray: it.state === "building" ? "6 6" : null };
      var tip = it.name + " · " + it.built + (it.state === "building" ? " (work going on)" : "");
      it.lines.forEach(function (c) {
        L.polyline(c, style).bindTooltip(tip, { sticky: true }).on("click", function () { if (onPick) onPick(it.id); }).addTo(lines);
      });
      L.circleMarker(it.center, { radius: regional ? 4 : 6.5, weight: regional ? 1.5 : 2, color: "#fff", fillColor: it.color, fillOpacity: 1 })
        .bindTooltip(tip, { direction: "right" }).on("click", function () { if (onPick) onPick(it.id); }).addTo(markers);
    });
    map.invalidateSize();
    if (!overviewFitted) { map.fitBounds(CH_BOUNDS, { animate: false }); overviewFitted = true; }
    return true;
  }
  function leaveOverview() { overviewFitted = false; }

  function setHistory(on) { histOn = on; }
  function setHistOpacity(v) { histOpacity = v; if (oldLayer) oldLayer.setOpacity(v); }
  function resize() { if (map) map.invalidateSize(); }

  function setPick(fn) { onPick = fn; }
  window.RiverMap = { show: show, showAll: showAll, leaveOverview: leaveOverview, setHistory: setHistory, setHistOpacity: setHistOpacity, resize: resize, setPick: setPick, LINE_STYLE: LINE_STYLE };
})();
