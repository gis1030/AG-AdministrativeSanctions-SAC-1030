// Carte des infractions SAC par îlot — données : data/SAC_Carte_Data.js (build_SAC_Carte.py)
const M = CARTE_META;
const IND = Object.fromEntries(M.indicators.map(i => [i.key, i]));
const RAMPS = {
  rose:      ['#fde7f3', '#f9c4e2', '#f39ccd', '#ea6fb3', '#d93f92', '#a8155f'],
  teal:      ['#e0f5f3', '#b3e6e1', '#7fd3cb', '#47bdb2', '#1BAEA1', '#0e7469'],
  bleu:      ['#e3eef8', '#bcd6ee', '#8fbbe2', '#5b9bd3', '#2f78bd', '#1a5390'],
  vert:      ['#eef6dc', '#d6eab0', '#bcdc80', '#a2c426', '#7c9a1a', '#56700f'],
  orange:    ['#fdeee3', '#fbd3b6', '#f7b383', '#f29254', '#EE7937', '#b9501a'],
  rouge:     ['#fde4e4', '#f9bcbc', '#f28f8f', '#e86060', '#d93636', '#a01818'],
  violet:    ['#f0e8f6', '#dac6ea', '#bf9fdb', '#a276ca', '#8550b5', '#5c2b8c'],
  divergent: ['#d73027', '#fc8d59', '#fee08b', '#d9ef8b', '#91cf60', '#1a9850'],
  evol:      ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'],
};
const MONEY = new Set(['facture', 'percu', 'attente']);
const PCT = new Set(['taux', 'evol']);
const NOPOINTS = new Set(['dens', 'evol']);

const st = { year: M.years[M.years.length - 1], ind: 'n', off: new Set() };

// Format belge : milliers « . », décimales « , »
const fmt = (v, d = 0) => (v < 0 ? '-' : '') + Math.abs(v).toFixed(d).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function fv(k, v) {
  if (v === null || v === undefined) return '—';
  if (MONEY.has(k)) return fmt(v) + ' €';
  if (PCT.has(k)) return (k === 'evol' && v > 0 ? '+' : '') + fmt(v, 1) + ' %';
  if (k === 'dens') return fmt(v, 1);
  return fmt(v);
}
const cls = (v, b) => { const i = b.findIndex(x => v <= x); return i < 0 ? b.length : i; };
function classLabels(k) {
  const b = IND[k].breaks, u = MONEY.has(k) ? ' €' : PCT.has(k) ? ' %' : '';
  const f = x => (k === 'evol' && x > 0 ? '+' : '') + fmt(x) + u;
  return [`≤ ${f(b[0])}`, ...b.slice(1).map((x, i) => `${f(b[i])} – ${f(x)}`), `> ${f(b[b.length - 1])}`];
}
// Valeur représentable : les îlots sans infraction (ou valeur nulle) ne sont pas colorés
function val(s, k) {
  if (!s) return null;
  const v = s[k];
  if (v === null || v === undefined) return null;
  return PCT.has(k) ? v : (v > 0 ? v : null);
}

// ── Carte ──────────────────────────────────────────────
const map = L.map('map', { zoomControl: true, maxZoom: 20, minZoom: 11 }).setView([50.8624, 4.3926], 14);
new L.Hash(map);
map.attributionControl.setPrefix('© GeoData1030 · <a href="https://www.1030.be">Commune de Schaerbeek</a> · <a href="https://leafletjs.com">Leaflet</a>');
const bases = {
  terrain: L.tileLayer('https://mt0.google.com/vt/lyrs=p&hl=fr&x={x}&y={y}&z={z}', { maxZoom: 20, maxNativeZoom: 18, opacity: .55 }),
  osm: L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19, opacity: .55, attribution: 'données © <a href="https://osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="https://openstreetmap.fr">OSM France</a>' }),
  hybrid: L.tileLayer('https://{s}.google.com/vt/lyrs=y&hl=fr&x={x}&y={y}&z={z}', { maxZoom: 20, opacity: .8, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'données © <a href="https://google.com/maps">Google Maps</a>' }),
};
bases.terrain.addTo(map);

map.createPane('blocks').style.zIndex = 410;
map.createPane('borders').style.zIndex = 420;
map.createPane('pts').style.zIndex = 430;
const borders = {
  quartiers: L.geoJSON(json_LimitesSchaerbeekQuartiers_2, { pane: 'borders', interactive: false, style: { color: '#2ca02c', weight: 4, fill: false } }),
  commune: L.geoJSON(json_LimitesScaherbeek_3, { pane: 'borders', interactive: false, style: { color: '#555', weight: 4, fill: false } }),
};
borders.quartiers.addTo(map);

const blocks = L.geoJSON(CARTE_BLOCKS, { pane: 'blocks', style: styleBlock, onEachFeature: (f, l) => l.on('click', e => openPopup(e.latlng, blockPopup(f))) }).addTo(map);
const points = L.layerGroup().addTo(map);

function color(k, v) { return RAMPS[IND[k].ramp][cls(v, IND[k].breaks)]; }
function styleBlock(f) {
  const v = val(CARTE_STATS[st.year][f.properties.id], st.ind);
  const show = v !== null && !st.off.has(cls(v, IND[st.ind].breaks));
  return show
    ? { color: 'rgba(35,35,35,0.6)', weight: 1, fillColor: color(st.ind, v), fillOpacity: .85 }
    : { color: 'rgba(35,35,35,0.35)', weight: .6, fill: false };
}

function drawPoints() {
  points.clearLayers();
  if (NOPOINTS.has(st.ind) || st.off.has('pts')) return;
  for (const p of CARTE_POINTS[st.year] || []) {
    const v = val(p, st.ind);
    if (v === null || st.off.has(cls(v, IND[st.ind].breaks))) continue;
    L.circleMarker([p.lat, p.lon], {
      pane: 'pts', radius: Math.min(3 + 1.5 * Math.sqrt(p.n), 11), color: '#5c2b8c', weight: 1.2,
      fillColor: color(st.ind, v), fillOpacity: .9,
    }).on('click', e => openPopup(e.latlng, pointPopup(p))).addTo(points);
  }
}

// ── Pop-ups (agrégats uniquement) ─────────────────────
const ROWS = [
  ['Infractions', ['n', 'dens']], ['Catégorie', ['statio', 'classique', 'mixte']], ['Type', ['pv', 'constat']],
  ['Décision', ['amende', 'sanssuite', 'avert']], ['Montants', ['facture', 'percu', 'attente', 'taux']],
  ['Contrevenant', ['homme', 'femme', 'societe']], ['Âge du contrevenant', ['a_lt30', 'a_30', 'a_40', 'a_50', 'a_60']],
  ['Évolution', ['evol']],
];
function table(s, skip) {
  return '<table>' + ROWS.map(([g, ks]) => {
    const r = ks.filter(k => !skip.has(k) && s[k] !== undefined);
    return r.length ? `<tr class="grp"><td colspan="2">${g}</td></tr>` + r.map(k =>
      `<tr${k === st.ind ? ' class="sel"' : ''}><td>${IND[k].label.replace(/ \((€|%)\)$/, '')}</td><td class="v">${fv(k, s[k])}</td></tr>`).join('') : '';
  }).join('') + '</table>';
}
function blockPopup(f) {
  const p = f.properties, s = CARTE_STATS[st.year][p.id];
  const head = `<div class="pop"><h4>${p.id.replace('BlockParcel.', 'Îlot ')}</h4><div class="sub">${p.quartier || ''} · ${fmt(p.ha, 2)} ha · ${st.year}</div>`;
  return head + (s ? table(s, new Set()) : '<i>Aucune infraction</i>') + '</div>';
}
function pointPopup(p) {
  return `<div class="pop"><h4>Hors îlot (Dehors1030)</h4><div class="sub">${st.year}</div>${table(p, NOPOINTS)}</div>`;
}
function openPopup(latlng, html) { L.popup({ maxHeight: 360 }).setLatLng(latlng).setContent(html).openOn(map); }

// ── Panneau ───────────────────────────────────────────
const $ = id => document.getElementById(id);
$('years').innerHTML = M.years.map(y => `<button data-y="${y}">${y}</button>`).join('');
$('years').addEventListener('click', e => { if (e.target.dataset.y) { st.year = +e.target.dataset.y; render(); } });
let lastGroup = '';
$('ind').innerHTML = M.indicators.map(i => {
  const og = i.group !== lastGroup ? `${lastGroup ? '</optgroup>' : ''}<optgroup label="${i.group}">` : '';
  lastGroup = i.group;
  return og + `<option value="${i.key}">${i.label}</option>`;
}).join('') + '</optgroup>';
$('ind').addEventListener('change', e => { st.ind = e.target.value; [...st.off].forEach(c => c !== 'pts' && st.off.delete(c)); render(); });
document.querySelectorAll('input[name=bm]').forEach(r => r.addEventListener('change', () => {
  Object.values(bases).forEach(l => map.removeLayer(l)); bases[r.value].addTo(map);
}));
document.querySelectorAll('input[name=bd]').forEach(r => r.addEventListener('change', () => {
  Object.values(borders).forEach(l => map.removeLayer(l)); if (borders[r.value]) borders[r.value].addTo(map);
}));
$('pTog').addEventListener('click', () => { const c = $('panel').classList.toggle('col'); $('pTog').textContent = c ? '«' : '»'; });
$('infoBtn').addEventListener('click', () => { $('info').hidden = false; });
$('infoClose').addEventListener('click', () => { $('info').hidden = true; });
$('info').addEventListener('click', e => { if (e.target.id === 'info') $('info').hidden = true; });
$('legend').addEventListener('click', e => {
  const r = e.target.closest('.leg[data-c]'); if (!r) return;
  const c = r.dataset.c === 'pts' ? 'pts' : +r.dataset.c; st.off.has(c) ? st.off.delete(c) : st.off.add(c); render();
});

function render() {
  const k = st.ind, i = IND[k], stats = CARTE_STATS[st.year];
  const prevYear = M.years[M.years.indexOf(st.year) - 1];
  map.closePopup();
  document.querySelectorAll('#years button').forEach(b => b.classList.toggle('act', +b.dataset.y === st.year));
  $('ind').value = k;
  blocks.setStyle(styleBlock);
  drawPoints();

  const counts = new Array(6).fill(0);
  Object.values(stats).forEach(s => { const v = val(s, k); if (v !== null) counts[cls(v, i.breaks)]++; });
  const ramp = RAMPS[i.ramp];
  $('legTit').textContent = i.label;
  $('legend').innerHTML = classLabels(k).map((l, c) =>
    `<div class="leg${st.off.has(c) ? ' off' : ''}" data-c="${c}"><span class="sw" style="background:${ramp[c]}"></span>${l}<span class="cnt">${counts[c]} îlots</span></div>`).join('')
    + (NOPOINTS.has(k) || !(CARTE_POINTS[st.year] || []).length ? '' : `<div class="leg${st.off.has('pts') ? ' off' : ''}" data-c="pts"><span class="pt"></span>Hors îlot (Dehors1030)<span class="cnt">${(CARTE_POINTS[st.year] || []).filter(p => val(p, k) !== null).length} pts</span></div>`);
  $('legNote').textContent = k === 'evol'
    ? (prevYear ? `Variation du nombre d'infractions ${prevYear} → ${st.year} (îlots présents les deux années).` : 'Pas d\'année précédente disponible.')
    : (i.group === 'Contrevenant' || i.group.startsWith('Âge')) ? 'Nombre d\'infractions commises par ces contrevenants.'
    : k === 'taux' ? 'Montant perçu / montant facturé.' : 'Cliquez sur une classe pour l\'afficher / la masquer.';

  const t = M.totals[st.year], blk = Object.keys(stats).length, pts = (CARTE_POINTS[st.year] || []);
  $('summary').innerHTML = `<b>${st.year}</b> · ${fmt(t.total)} infractions · ${blk} îlots · ` +
    `${fmt(pts.reduce((a, p) => a + p.n, 0))} hors îlot (${pts.length} pts)` + (t.unplaced ? ` · ${t.unplaced} non localisées` : '') +
    `<br>Facturé ${fmt(t.facture)} € · Perçu ${fmt(t.percu)} €`;
  $('title').textContent = `Infractions SAC ${st.year} — ${i.label}`;
  document.title = `SAC ${st.year} — ${i.label}`;
}
$('infoGen').textContent = `Données générées le ${M.generated} · années : ${M.years.join(', ')}.`;
render();
