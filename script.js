/* Mi Clóset — todo se guarda en el teléfono (IndexedDB). */
'use strict';

/* ---------- Siluetas ----------
   BODY: guía de la cámara (el cuerpo con la prenda puesta).
   WEAR: forma de la prenda, para íconos y prendas de ejemplo.
   Todas usan viewBox 300x400, salvo vestidos: 300x533 (cuerpo completo). */
const BODY = {
  top: 'M135 0 L135 30 Q100 38 70 52 Q52 60 50 90 L44 250 L40 330 L62 332 L72 250 L76 150 L84 175 L90 260 L86 390 L214 390 L210 260 L216 175 L224 150 L228 250 L238 332 L260 330 L256 250 L250 90 Q248 60 230 52 Q200 38 165 30 L165 0',
  bottom: 'M88 10 L212 10 L222 120 L214 250 L204 385 L166 385 L156 230 L150 140 L144 230 L134 385 L96 385 L86 250 L78 120 Z',
  dress: 'M138 0 L138 18 Q112 24 90 34 Q78 40 76 60 L70 170 L68 230 L84 232 L92 170 L96 100 L100 115 L104 170 L100 260 L106 380 L112 525 L140 525 L148 380 L150 330 L152 380 L160 525 L188 525 L194 380 L200 260 L196 170 L200 115 L204 100 L208 170 L216 232 L232 230 L230 170 L224 60 Q222 40 210 34 Q188 24 162 18 L162 0',
  shoes: 'M80 60 L118 60 L122 250 Q130 330 100 345 Q62 345 70 300 L80 250 Z M182 60 L220 60 L230 250 L238 300 Q240 345 200 345 Q170 330 178 250 Z',
};
const WEAR = {
  top: 'M105 32 Q150 58 195 32 L245 60 L262 140 L228 150 L216 112 L214 360 L86 360 L84 112 L72 150 L38 140 L55 60 Z',
  crop: 'M105 32 Q150 58 195 32 L245 60 L262 140 L228 150 L216 112 L214 250 L86 250 L84 112 L72 150 L38 140 L55 60 Z',
  outer: 'M100 28 Q150 40 200 28 L250 58 L264 334 L232 338 L222 150 L220 392 L80 392 L78 150 L68 338 L36 334 L50 58 Z',
  pants: 'M84 12 L216 12 L238 388 L162 388 L150 150 L138 388 L62 388 Z',
  slim: 'M88 12 L212 12 L214 388 L160 388 L150 150 L140 388 L86 388 Z',
  skirt: 'M86 12 L214 12 L252 300 L48 300 Z',
  shorts: 'M84 12 L216 12 L230 172 L158 178 L150 110 L142 178 L70 172 Z',
  dress: 'M112 22 Q150 46 188 22 L200 30 L206 180 L252 470 L48 470 L94 180 L100 30 Z',
  sneakers: 'M74 232 Q72 204 100 200 Q128 204 126 232 L132 330 Q100 352 66 330 Z M174 232 Q172 204 200 200 Q228 204 226 232 L234 330 Q200 352 168 330 Z',
  boots: 'M78 70 L122 70 L124 250 Q132 330 100 345 Q62 345 70 300 L76 250 Z M178 70 L222 70 L230 250 L238 300 Q240 345 200 345 Q168 330 176 250 Z',
};

const CATS = {
  top:    { label: 'Tops',       one: 'Top',      zone: 'top',    body: 'top',    wear: 'top',    fits: ['Polera', 'Camisa', 'Blusa', 'Crop top', 'Sweater', 'Peto', 'Body', 'Polo'],
            hint: 'Ponte el top y calza hombros y caderas en la silueta. Funciona mejor frente a un espejo.' },
  outer:  { label: 'Abrigos',    one: 'Abrigo',   zone: 'outer',  body: 'top',    wear: 'outer',  fits: ['Chaqueta', 'Blazer', 'Cárdigan', 'Polerón', 'Abrigo', 'Chaleco', 'Parka'],
            hint: 'Ponte el abrigo como lo usarías (abierto o cerrado) y calza hombros y caderas en la silueta.' },
  pants:  { label: 'Pantalones', one: 'Pantalón', zone: 'bottom', body: 'bottom', wear: 'pants',  fits: ['Wide leg', 'Cargo', 'Recto', 'Skinny', 'Baggy', 'Flare', 'Mom', 'Jogger', 'Palazzo'],
            hint: 'Desde la cintura hasta los tobillos. Usa el temporizador y apoya el celular, o pídele a alguien.' },
  skirt:  { label: 'Faldas',     one: 'Falda',    zone: 'bottom', body: 'bottom', wear: 'skirt',  fits: ['Mini', 'Midi', 'Larga', 'Plisada', 'Lápiz', 'Cargo'],
            hint: 'Desde la cintura hasta los tobillos, aunque la falda sea corta, para que calce con el resto.' },
  shorts: { label: 'Shorts',     one: 'Short',    zone: 'bottom', body: 'bottom', wear: 'shorts', fits: ['Jeans', 'Bermuda', 'Tela', 'Deportivo'],
            hint: 'Desde la cintura hasta los tobillos, para que calce con el resto.' },
  dress:  { label: 'Vestidos',   one: 'Vestido',  zone: 'dress',  body: 'dress',  wear: 'dress',  fits: ['Mini', 'Midi', 'Largo', 'Jumper', 'Enterito'], tall: true,
            hint: 'Cuerpo completo, de hombros a tobillos. Usa el temporizador o pídele a alguien que te saque la foto.' },
  shoes:  { label: 'Zapatos',    one: 'Zapatos',  zone: 'shoes',  body: 'shoes',  wear: 'sneakers', fits: ['Zapatillas', 'Botas', 'Botines', 'Sandalias', 'Tacos', 'Ballerinas', 'Mocasines', 'Plataformas'],
            hint: 'Con los zapatos puestos, apunta a tus pies de frente y un poco desde arriba.' },
};
const OPEN_FITS = /chaqueta|blazer|c[aá]rdigan|abrigo|chaleco/i;
const FIT_IS_NOUN = new Set(['top', 'outer', 'shoes']);

/* Colores con nombre. n = neutro (combina con todo). */
const COLORS = [
  { name: 'Negro', hex: '#1C1C1E', n: true }, { name: 'Blanco', hex: '#F4F3EF', n: true }, { name: 'Gris', hex: '#8E8E8E', n: true },
  { name: 'Crema', hex: '#EDE3CB', n: true }, { name: 'Beige', hex: '#D6C19C', n: true }, { name: 'Camel', hex: '#B5854B', n: true },
  { name: 'Café', hex: '#6B4428', n: true }, { name: 'Denim', hex: '#4D6E9E', n: true }, { name: 'Azul marino', hex: '#1F2B4D', n: true },
  { name: 'Verde oliva', hex: '#6B6E38', n: false }, { name: 'Rojo', hex: '#C62D2D', n: false }, { name: 'Burdeo', hex: '#6E1F2E', n: false },
  { name: 'Rosado', hex: '#F19CB9', n: false }, { name: 'Fucsia', hex: '#D81B7A', n: false }, { name: 'Terracota', hex: '#B6543A', n: false },
  { name: 'Naranjo', hex: '#EE7A2B', n: false }, { name: 'Amarillo', hex: '#F2CF3A', n: false }, { name: 'Verde', hex: '#3C9A5B', n: false },
  { name: 'Verde menta', hex: '#A6DABF', n: false }, { name: 'Celeste', hex: '#8EC5EA', n: false }, { name: 'Azul', hex: '#2D5BD1', n: false },
  { name: 'Lila', hex: '#B9A2E0', n: false }, { name: 'Morado', hex: '#6B3FA0', n: false },
];

/* Combinaciones curadas: [colores, tipo, por qué funciona] */
const COMBOS = [
  [['Rosado', 'Gris'], 'Pastel + neutro', 'El gris calma al rosado y lo hace más elegante.'],
  [['Celeste', 'Camel'], 'Complementario suave', 'Azul y café anaranjado son opuestos, pero en tonos suaves se ven frescos y cálidos a la vez.'],
  [['Burdeo', 'Beige'], 'Color + neutro', 'Un clásico de otoño: profundo y sofisticado.'],
  [['Azul', 'Naranjo'], 'Complementario', 'Contraste máximo. Queda mejor si uno de los dos es solo un detalle.'],
  [['Verde oliva', 'Crema'], 'Color + neutro', 'Terroso y suave, muy fácil para el día a día.'],
  [['Fucsia', 'Rojo'], 'Análogo atrevido', 'Vecinos en el círculo: juntos se ven intensos y modernos.'],
  [['Terracota', 'Denim'], 'Complementario terroso', 'El azul del denim equilibra el naranjo tostado.'],
  [['Verde menta', 'Rosado'], 'Complementario pastel', 'Opuestos suavizados: fresco y dulce.'],
  [['Lila', 'Amarillo'], 'Complementario', 'El amarillo hace brillar al lila. Mejor en versiones suaves.'],
  [['Negro', 'Blanco'], 'Neutro clásico', 'Nunca falla. Suma texturas para que no se vea plano.'],
  [['Burdeo', 'Camel', 'Crema'], 'Análogo + neutro', 'Gama cálida de otoño, de lo más oscuro a lo más claro.'],
  [['Azul marino', 'Rojo', 'Blanco'], 'Clásico marinero', 'Dos neutros y un color protagonista.'],
  [['Lila', 'Gris', 'Blanco'], 'Pastel + neutros', 'Suave y luminoso.'],
  [['Verde oliva', 'Terracota', 'Beige'], 'Tonos tierra', 'Colores de la naturaleza que se llevan solos.'],
  [['Rosado', 'Rojo', 'Blanco'], 'Monocromático', 'Distintas intensidades del mismo color, unidas por el blanco.'],
  [['Celeste', 'Azul', 'Beige'], 'Análogo + neutro', 'Azules que se escalonan y un beige que los entibia.'],
  [['Amarillo', 'Denim', 'Blanco'], 'Complementario + neutro', 'Fresco y veraniego.'],
  [['Fucsia', 'Naranjo', 'Crema'], 'Análogo intenso', 'Vibrante; el crema le da descanso a la vista.'],
  [['Rojo', 'Amarillo', 'Azul'], 'Triádico', 'Los tres primarios. Muy atrevido: úsalos apagados o en detalles.'],
  [['Verde', 'Morado', 'Naranjo'], 'Triádico', 'Los secundarios juntos: expresivo y artístico.'],
  [['Negro', 'Blanco', 'Camel', 'Rojo'], 'Regla 60-30-10', 'Base negra, blanco y camel de apoyo, rojo en un detalle.'],
  [['Denim', 'Blanco', 'Celeste', 'Amarillo'], 'Regla 60-30-10', 'Base de azules con un toque de sol.'],
  [['Beige', 'Café', 'Crema', 'Verde oliva'], 'Tonos tierra', 'Todos cálidos y apagados, se integran solos.'],
  [['Azul marino', 'Celeste', 'Blanco', 'Burdeo'], 'Fríos + acento', 'Azules como base y el burdeo como sorpresa.'],
  [['Rosado', 'Lila', 'Blanco', 'Gris'], 'Pasteles', 'Dos pasteles vecinos con neutros claros.'],
  [['Verde menta', 'Celeste', 'Lila', 'Blanco'], 'Análogos pastel', 'Una gama fría y suave, de primavera.'],
];

/* ---------- Utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const daysSince = (iso) => iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 864e5) : Infinity;
const ICON = {
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

function hexToRgb(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s * 100, l * 100];
}
function colorDist(a, b) {
  const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}
function nearestColor(hex) {
  const rgb = hexToRgb(hex); let best = COLORS[0], bd = Infinity;
  for (const c of COLORS) { const d = colorDist(rgb, hexToRgb(c.hex)); if (d < bd) { bd = d; best = c; } }
  return best;
}
const colorByName = (name) => COLORS.find((c) => c.name === name) || COLORS[2];
const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/* ---------- Base de datos ---------- */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('mi-closet', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        for (const s of ['items', 'outfits', 'shopping', 'meta']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
      };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  tx(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(store, mode); const s = t.objectStore(store); let out;
      const r = fn(s); if (r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error);
    });
  },
  all(store) { return this.tx(store, 'readonly', (s) => s.getAll()); },
  put(store, v) { return this.tx(store, 'readwrite', (s) => s.put(v)); },
  del(store, id) { return this.tx(store, 'readwrite', (s) => s.delete(id)); },
};

/* ---------- Estado ---------- */
const state = {
  items: [], outfits: [], shopping: [], meta: {},
  urls: new Map(), filter: 'all', tab: 'closet',
  sel: { outer: null, top: null, bottom: null, shoes: null }, touched: false,
  weather: null, comboN: 2, comboOwned: false,
};
function photoUrl(item) {
  if (!item || !item.photo) return '';
  if (!state.urls.has(item.id)) state.urls.set(item.id, URL.createObjectURL(item.photo));
  return state.urls.get(item.id);
}
function dropUrl(id) { const u = state.urls.get(id); if (u) { URL.revokeObjectURL(u); state.urls.delete(id); } }
async function loadAll() {
  [state.items, state.outfits, state.shopping] = await Promise.all([DB.all('items'), DB.all('outfits'), DB.all('shopping')]);
  const metas = await DB.all('meta'); state.meta = {}; for (const m of metas) state.meta[m.id] = m.value;
  state.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  state.outfits.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  state.shopping.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
async function setMeta(id, value) { state.meta[id] = value; await DB.put('meta', { id, value }); }

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------- Teoría del color ---------- */
function itemColor(item) { return colorByName(item.colorName); }
function hueOf(c) { return rgbToHsl(...hexToRgb(c.hex))[0]; }
function pairHarmony(a, b) {
  const [ha, , la] = rgbToHsl(...hexToRgb(a.hex)); const [hb, , lb] = rgbToHsl(...hexToRgb(b.hex));
  let d = Math.abs(ha - hb); if (d > 180) d = 360 - d;
  if (a.name === b.name || d <= 15) return Math.abs(la - lb) > 12 || a.name === b.name
    ? { s: .9, kind: 'Monocromático', tip: `Mismo color en distintos tonos: ${lower(a.name)} con ${lower(b.name)} se ve elegante y ordenado.` }
    : { s: .82, kind: 'Monocromático', tip: 'Tonos casi iguales. Juega con texturas para que no se vea plano.' };
  if (d <= 45) return { s: .88, kind: 'Análogo', tip: `${a.name} y ${lower(b.name)} son vecinos en el círculo cromático: combinan suave y natural.` };
  if (d >= 150) return { s: .86, kind: 'Complementario', tip: `${a.name} y ${lower(b.name)} son opuestos: contraste fuerte. Deja que uno domine y el otro acompañe.` };
  if (d >= 105 && d <= 135) return { s: .7, kind: 'Triádico', tip: 'Combinación atrevida pero equilibrada. Funciona mejor si uno de los colores es más apagado.' };
  return { s: .38, kind: 'Choque de colores', tip: `${a.name} y ${lower(b.name)} compiten entre sí. Prueba cambiando uno por un neutro.` };
}
function evaluateOutfit(items) {
  if (!items.length) return null;
  const cols = items.map(itemColor);
  const accents = []; for (const c of cols) if (!c.n && !accents.some((x) => x.name === c.name)) accents.push(c);
  if (accents.length === 0) return { s: .84, kind: 'Neutro clásico', tip: 'Todo en neutros: nunca falla. Unos aros o una cartera de color le darían un punto de atención.', cols };
  if (accents.length === 1) return { s: .95, kind: 'Un color protagonista', tip: `El ${lower(accents[0].name)} es la estrella y los neutros lo acompañan. Fórmula segura.`, cols };
  let worst = null;
  for (let i = 0; i < accents.length; i++) for (let j = i + 1; j < accents.length; j++) {
    const h = pairHarmony(accents[i], accents[j]); if (!worst || h.s < worst.s) worst = h;
  }
  const r = { ...worst, cols };
  if (accents.length >= 3 && worst.s < .85) { r.s -= .12; r.tip += ' Son muchos colores a la vez: cambia uno por un neutro.'; }
  return r;
}

/* ---------- Clima ---------- */
const WMO = (c) => c === 0 ? 'Despejado' : c <= 2 ? 'Parcial nublado' : c === 3 ? 'Nublado' : c <= 48 ? 'Niebla'
  : c <= 57 ? 'Llovizna' : c <= 67 ? 'Lluvia' : c <= 77 ? 'Nieve' : c <= 82 ? 'Chubascos' : 'Tormenta';
async function fetchWeather(lat, lon, place) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;
  const r = await fetch(url); if (!r.ok) throw new Error('clima');
  const j = await r.json();
  state.weather = {
    place, now: Math.round(j.current.temperature_2m), code: j.current.weather_code,
    max: Math.round(j.daily.temperature_2m_max[0]), min: Math.round(j.daily.temperature_2m_min[0]),
    rain: j.daily.precipitation_probability_max[0] ?? 0,
  };
  renderWeather(); renderVerdict();
}
function weatherFlags() {
  const w = state.weather; if (!w) return {};
  return { cold: w.max < 15, chilly: w.min < 10, hot: w.max >= 27, rain: w.rain >= 50 };
}
function weatherTip() {
  const f = weatherFlags(); const tips = [];
  if (f.cold) tips.push('Hace frío: suma un abrigo y zapatos cerrados.');
  else if (f.chilly) tips.push('Mañana y noche frescas: lleva una capa para sacarte al mediodía.');
  if (f.hot) tips.push('Día caluroso: telas livianas, shorts, faldas o vestidos.');
  if (f.rain) tips.push('Probable lluvia: evita sandalias y gamuza.');
  return tips.join(' ') || 'Clima templado: casi cualquier cosa funciona hoy.';
}
function initWeather() {
  const loc = state.meta.location;
  if (loc) { fetchWeather(loc.lat, loc.lon, loc.place).catch(() => renderWeather('error')); return; }
  renderWeather('ask');
}
function locateMe() {
  if (!navigator.geolocation) { renderWeather('city'); return; }
  renderWeather('loading');
  navigator.geolocation.getCurrentPosition(async (p) => {
    const lat = +p.coords.latitude.toFixed(3), lon = +p.coords.longitude.toFixed(3);
    await setMeta('location', { lat, lon, place: 'Tu ubicación' });
    fetchWeather(lat, lon, 'Tu ubicación').catch(() => renderWeather('error'));
  }, () => renderWeather('city'), { timeout: 10000, maximumAge: 36e5 });
}
async function searchCity(name) {
  renderWeather('loading');
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es`);
    const j = await r.json(); const g = j.results && j.results[0];
    if (!g) { renderWeather('city', 'No encontré esa ciudad. Prueba con otro nombre.'); return; }
    const place = g.name + (g.admin1 ? ', ' + g.admin1 : '');
    await setMeta('location', { lat: g.latitude, lon: g.longitude, place });
    await fetchWeather(g.latitude, g.longitude, place);
  } catch { renderWeather('error'); }
}
function renderWeather(mode, msg) {
  const el = $('#weather'); const w = state.weather;
  if (w && !mode) {
    el.innerHTML = `<div class="temp">${w.now}°</div>
      <div class="w-main"><div class="w-place">${esc(w.place)}</div>
      <div class="w-desc">${WMO(w.code)} · máx ${w.max}° mín ${w.min}° · lluvia ${w.rain}%</div></div>
      <button class="btn btn-small btn-ghost" data-action="change-city">Cambiar</button>
      <p class="w-tip">${esc(weatherTip())}</p>`;
    return;
  }
  if (mode === 'loading') { el.innerHTML = '<p class="muted" style="margin:0">Buscando el clima…</p>'; return; }
  if (mode === 'city' || mode === 'error') {
    el.innerHTML = `<p style="margin:0;flex:1 1 100%">${esc(msg || (mode === 'error' ? 'No pude cargar el clima. Revisa tu conexión o escribe tu ciudad.' : 'Escribe tu ciudad para ver el clima.'))}</p>
      <form id="city-form"><label class="sr" for="city-input">Ciudad</label>
      <input id="city-input" placeholder="Ej: Santiago" autocomplete="off" required>
      <button class="btn btn-small" type="submit">Ver clima</button></form>`;
    return;
  }
  el.innerHTML = `<div class="w-main"><div class="w-place">¿Qué tiempo hace hoy?</div>
    <div class="w-desc">Usa tu ubicación para que los outfits consideren el clima.</div></div>
    <button class="btn btn-small btn-accent" data-action="locate">Usar ubicación</button>
    <button class="btn btn-small btn-ghost" data-action="change-city">Escribir ciudad</button>`;
}

/* ---------- Imágenes ---------- */
const sizeFor = (cat) => CATS[cat].tall ? [450, 800] : [450, 600];
function canvasToBlob(c, type = 'image/jpeg', q = .82) { return new Promise((r) => c.toBlob(r, type, q)); }
function drawCover(src, sw, sh, cat, mirror) {
  const [W, H] = sizeFor(cat);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); const target = W / H; let cw = sw, ch = sh;
  if (sw / sh > target) cw = sh * target; else ch = sw / target;
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H);
  return c;
}
function loadImageFile(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const u = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(u); res(img); }; img.onerror = rej; img.src = u;
  });
}

/* Quitar el fondo con un modelo que corre en el mismo celular (MediaPipe). Se descarga la primera vez. */
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
let segPromise = null;
function getSegmenter() {
  if (!segPromise) {
    segPromise = (async () => {
      const vision = await import(MP + '/vision_bundle.mjs');
      const files = await vision.FilesetResolver.forVisionTasks(MP + '/wasm');
      return vision.ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite', delegate: 'CPU' },
        runningMode: 'IMAGE', outputCategoryMask: false, outputConfidenceMasks: true,
      });
    })();
    segPromise.catch(() => { segPromise = null; });
  }
  return segPromise;
}
async function removeBackground(canvas) {
  const seg = await getSegmenter();
  const res = seg.segment(canvas);
  const m = res.confidenceMasks[0]; const w = m.width, h = m.height; const p = m.getAsFloat32Array().slice();
  if (res.close) res.close();
  // ¿La máscara marca a la persona o al fondo? Compara centro con bordes.
  let center = 0, cn = 0, edge = 0, en = 0;
  for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) {
    const v = p[y * w + x];
    if (x > w * .35 && x < w * .65 && y > h * .3 && y < h * .7) { center += v; cn++; }
    else if (x < w * .08 || x > w * .92) { edge += v; en++; }
  }
  const invert = edge / en > center / cn;
  const mc = document.createElement('canvas'); mc.width = w; mc.height = h;
  const mx = mc.getContext('2d'); const id = mx.createImageData(w, h); let on = 0;
  for (let i = 0; i < p.length; i++) {
    let v = invert ? 1 - p[i] : p[i];
    v = Math.min(1, Math.max(0, (v - .3) / .4));
    id.data[i * 4 + 3] = v * 255; if (v > .5) on++;
  }
  const cover = on / p.length;
  if (cover < .04 || cover > .96) throw new Error('mask');
  mx.putImageData(id, 0, 0);
  const out = document.createElement('canvas'); out.width = canvas.width; out.height = canvas.height;
  const o = out.getContext('2d'); o.drawImage(mc, 0, 0, out.width, out.height);
  o.globalCompositeOperation = 'source-in'; o.drawImage(canvas, 0, 0);
  return out;
}

/* Color principal: zona central de la prenda, ignorando lo transparente o parecido al fondo */
const COLOR_ZONE = { top: [.3, .7, .22, .75], outer: [.22, .4, .2, .75], bottom: [.3, .7, .08, .5], dress: [.34, .66, .15, .5], shoes: [.2, .8, .55, .9] };
function detectColor(canvas, cat, transparent) {
  const SW = 60, SH = Math.round(60 * canvas.height / canvas.width);
  const s = document.createElement('canvas'); s.width = SW; s.height = SH;
  const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(canvas, 0, 0, SW, SH);
  const d = x.getImageData(0, 0, SW, SH).data;
  const px = (i, j) => { const k = (j * SW + i) * 4; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };
  let bg = null;
  if (!transparent) {
    bg = [0, 0, 0]; let n = 0;
    for (let i = 0; i < SW; i++) for (const j of [0, 1, SH - 2, SH - 1]) { const p = px(i, j); bg[0] += p[0]; bg[1] += p[1]; bg[2] += p[2]; n++; }
    for (let j = 2; j < SH - 2; j++) for (const i of [0, 1, SW - 2, SW - 1]) { const p = px(i, j); bg[0] += p[0]; bg[1] += p[1]; bg[2] += p[2]; n++; }
    bg = bg.map((v) => v / n);
  }
  const z = COLOR_ZONE[CATS[cat].zone] || COLOR_ZONE.top;
  const buckets = new Map(); let fg = 0;
  const scan = (x0, x1) => {
    for (let j = Math.floor(SH * z[2]); j < SH * z[3]; j++) for (let i = Math.floor(SW * x0); i < SW * x1; i++) {
      const p = px(i, j); if (p[3] < 160) continue; if (bg && colorDist(p, bg) < 70) continue; fg++;
      const key = (p[0] >> 5) + ',' + (p[1] >> 5) + ',' + (p[2] >> 5);
      const b = buckets.get(key) || [0, 0, 0, 0]; b[0] += p[0]; b[1] += p[1]; b[2] += p[2]; b[3]++; buckets.set(key, b);
    }
  };
  scan(z[0], z[1]); if (CATS[cat].zone === 'outer') scan(1 - z[1], 1 - z[0]);
  if (fg < 30) {
    let c = [0, 0, 0], m = 0;
    for (let j = Math.floor(SH * .35); j < SH * .65; j++) for (let i = Math.floor(SW * .35); i < SW * .65; i++) { const p = px(i, j); if (p[3] < 160) continue; c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; m++; }
    return m ? rgbToHex(c[0] / m, c[1] / m, c[2] / m) : '#8E8E8E';
  }
  let best = null; for (const b of buckets.values()) if (!best || b[3] > best[3]) best = b;
  return rgbToHex(best[0] / best[3], best[1] / best[3], best[2] / best[3]);
}

/* ---------- Cámara ---------- */
let stream = null, pendingCat = 'top', facing = 'environment', timer = 0, counting = false;
async function startStream() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1440 }, height: { ideal: 1920 } }, audio: false });
  const v = $('#camera-video'); v.srcObject = stream; v.classList.toggle('mirror', facing === 'user'); await v.play().catch(() => {});
}
async function openCamera(cat) {
  pendingCat = cat; const c = CATS[cat];
  $('#camera-label').textContent = c.one;
  $('#camera-hint').textContent = c.hint;
  const vb = c.tall ? '0 0 300 533' : '0 0 300 400';
  const g = $('#camera-guide'); g.setAttribute('viewBox', vb); g.innerHTML = `<path d="${BODY[c.body]}"/>`;
  $('#cam-box').style.setProperty('--ar', c.tall ? '9 / 16' : '3 / 4'); $('#cam-box').style.setProperty('--arn', c.tall ? '.5625' : '.75');
  $('#camera').hidden = false;
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no-cam');
    await startStream();
  } catch {
    closeCamera(); toast('No pude abrir la cámara. Elige una foto de tu galería.'); $('#gallery-input').click();
  }
}
function closeCamera() {
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  counting = false; $('#countdown').hidden = true;
  $('#camera-video').srcObject = null; $('#camera').hidden = true;
}
async function flipCamera() { facing = facing === 'user' ? 'environment' : 'user'; try { await startStream(); } catch { toast('Este celular no deja cambiar de cámara.'); } }
function cycleTimer() { timer = timer === 0 ? 3 : timer === 3 ? 10 : 0; $('#timer-btn').textContent = timer ? `Timer ${timer}s` : 'Sin timer'; }
async function shoot() {
  const v = $('#camera-video'); if (!v.videoWidth || counting) return;
  if (timer) {
    counting = true; const cd = $('#countdown'); cd.hidden = false;
    for (let s = timer; s > 0; s--) { if (!counting) return; cd.textContent = s; await new Promise((r) => setTimeout(r, 1000)); }
    cd.hidden = true; counting = false; if ($('#camera').hidden) return;
  }
  const c = drawCover(v, v.videoWidth, v.videoHeight, pendingCat, facing === 'user');
  closeCamera(); await afterCapture(c);
}
async function afterCapture(canvas) {
  openSheet(`<div class="working"><div class="spinner"></div><h2>Quitando el fondo…</h2>
    <p class="muted small" style="margin:0">La primera vez tarda un poco más porque descarga la herramienta.</p></div>`);
  const original = await canvasToBlob(canvas);
  let cutout = null, colorSrc = canvas, transparent = false;
  try {
    const out = await removeBackground(canvas);
    cutout = await canvasToBlob(out, 'image/webp', .85);
    if (!cutout || cutout.type !== 'image/webp') cutout = await canvasToBlob(out, 'image/png');
    colorSrc = out; transparent = true;
  } catch { cutout = null; }
  const hex = detectColor(colorSrc, pendingCat, transparent);
  const fitDefault = '';
  openEdit({ id: null, cat: pendingCat, fit: fitDefault, name: '', colorName: nearestColor(hex).name, detected: true,
    photo: cutout || original, cutout: !!cutout, _original: original, _cutout: cutout, open: false });
  if (!cutout) toast('No pude quitar el fondo; guardé la foto tal cual.');
}

/* ---------- Textos ---------- */
function catOf(item) { return CATS[item.cat] || CATS.top; }
function itemTitle(item) {
  if (item.name) return item.name;
  if (!item.fit) return catOf(item).one;
  return FIT_IS_NOUN.has(item.cat) ? item.fit : `${catOf(item).one} ${item.fit.toLowerCase()}`;
}
function forgotten(item) {
  const last = item.worn && item.worn.length ? item.worn[item.worn.length - 1] : null;
  return last ? daysSince(last) > 30 : daysSince(item.createdAt) > 30;
}
const imgClass = (it) => it.cutout ? '' : 'opaque';

/* ---------- Clóset ---------- */
function renderTopbar() { const n = state.items.length; $('#topbar-sub').textContent = n ? `${n} prenda${n === 1 ? '' : 's'}` : ''; $('#topbar-sub').hidden = !n; }
function renderCloset() {
  const counts = {}; for (const it of state.items) counts[it.cat] = (counts[it.cat] || 0) + 1;
  const nForgot = state.items.filter(forgotten).length;
  const chips = [['all', 'Todo', state.items.length], ...Object.entries(CATS).map(([k, c]) => [k, c.label, counts[k] || 0]).filter((c) => c[2] > 0)];
  if (nForgot) chips.push(['forgotten', 'Olvidadas', nForgot]);
  if (!chips.some((c) => c[0] === state.filter)) state.filter = 'all';
  $('#cat-filter').innerHTML = state.items.length ? chips.map(([k, l, n]) =>
    `<button class="chip ${state.filter === k ? 'is-active' : ''}" data-filter="${k}">${l}<span class="count">${n}</span></button>`).join('') : '';
  const list = state.items.filter((it) => state.filter === 'all' || (state.filter === 'forgotten' ? forgotten(it) : it.cat === state.filter));
  $('#closet-grid').innerHTML = list.map((it) =>
    `<button class="tile" data-item="${it.id}" aria-label="${esc(itemTitle(it))}">
      <img class="${imgClass(it)}" src="${photoUrl(it)}" alt="" loading="lazy">
      ${it.fit || it.name ? `<span class="tag">${esc(it.name || (FIT_IS_NOUN.has(it.cat) ? it.fit : catOf(it).one + ' ' + it.fit.toLowerCase()))}</span>` : ''}
      <span class="dot" style="background:${itemColor(it).hex}"></span></button>`).join('');
  $('#closet-empty').hidden = state.items.length > 0;
  $('#backup-banner').hidden = !(state.items.filter((i) => !i.sample).length >= 5 && daysSince(state.meta.lastBackup) > 30);
}

/* ---------- Maniquí ---------- */
function zoneLists() {
  const by = (pred) => state.items.filter(pred);
  return {
    outer: [null, ...by((i) => i.cat === 'outer')],
    top: by((i) => i.cat === 'top' || i.cat === 'dress'),
    bottom: by((i) => CATS[i.cat] && CATS[i.cat].zone === 'bottom'),
    shoes: [null, ...by((i) => i.cat === 'shoes')],
  };
}
function currentPieces() {
  const L = zoneLists(); const pick = (z) => L[z].find((i) => i && i.id === state.sel[z]) || null;
  const top = pick('top');
  return { outer: pick('outer'), top, bottom: top && top.cat === 'dress' ? null : pick('bottom'), shoes: pick('shoes') };
}
function ensureSelection() {
  const L = zoneLists();
  for (const z of ['top', 'bottom']) if (!L[z].some((i) => i.id === state.sel[z])) state.sel[z] = L[z][0] ? L[z][0].id : null;
  for (const z of ['outer', 'shoes']) if (state.sel[z] && !L[z].some((i) => i && i.id === state.sel[z])) state.sel[z] = null;
  if (!state.touched && !state.sel.shoes && L.shoes[1]) state.sel.shoes = L.shoes[1].id;
}
function isOpen(item) { return item && (item.open ?? OPEN_FITS.test(item.fit || '')); }
function figureHtml(p, popZone) {
  const img = (it, cls) => `<img class="pc ${cls} ${imgClass(it)} ${popZone && cls.startsWith(popZone) ? 'pop' : ''}" src="${photoUrl(it)}" alt="">`;
  const ghost = (path, cls, vb = '0 0 300 400') => `<svg class="pc ghost ${cls}" viewBox="${vb}" aria-hidden="true"><path d="${path}"/></svg>`;
  let h = '';
  if (p.shoes) h += img(p.shoes, 'shoes'); else h += ghost(BODY.shoes, 'shoes');
  if (p.top && p.top.cat === 'dress') h += img(p.top, 'dress');
  else {
    h += p.bottom ? img(p.bottom, 'bottom') : ghost(BODY.bottom, 'bottom');
    h += p.top ? img(p.top, 'top') : ghost(BODY.top, 'top');
  }
  if (p.outer) h += img(p.outer, 'outer' + (isOpen(p.outer) ? ' open' : ''));
  return h;
}
const ZONE_LABEL = { outer: 'Abrigo', top: 'Arriba', bottom: 'Abajo', shoes: 'Zapatos' };
function pickerHtml(zone, item, list) {
  const can = list.length > 1;
  const name = item ? itemTitle(item) : (list.filter(Boolean).length ? `Sin ${ZONE_LABEL[zone].toLowerCase()}` : `Aún no tienes ${zone === 'top' ? 'tops' : zone === 'bottom' ? 'partes de abajo' : ZONE_LABEL[zone].toLowerCase()}`);
  return `<div class="picker" data-zone="${zone}">
    <button class="arrow" data-move="${zone}:-1" aria-label="${ZONE_LABEL[zone]} anterior" ${can ? '' : 'disabled'}>${ICON.left}</button>
    <div class="pk-mid">
      <div class="pk-thumb ${item ? imgClass(item) : ''}">${item ? `<img src="${photoUrl(item)}" alt="">` : ''}</div>
      <div class="pk-text"><small>${ZONE_LABEL[zone]}</small>
        <b>${item ? `<span class="pk-dot" style="background:${itemColor(item).hex}"></span>` : ''}${esc(name)}</b></div>
    </div>
    <button class="arrow" data-move="${zone}:1" aria-label="${ZONE_LABEL[zone]} siguiente" ${can ? '' : 'disabled'}>${ICON.right}</button></div>`;
}
function renderDressup(popZone) {
  ensureSelection();
  const L = zoneLists(); const p = currentPieces();
  $('#figure').innerHTML = figureHtml(p, popZone);
  let h = pickerHtml('outer', p.outer, L.outer) + pickerHtml('top', p.top, L.top.length ? L.top : [null]);
  if (!(p.top && p.top.cat === 'dress')) h += pickerHtml('bottom', p.bottom, L.bottom.length ? L.bottom : [null]);
  h += pickerHtml('shoes', p.shoes, L.shoes);
  $('#pickers').innerHTML = h;
  renderVerdict();
}
function move(zone, step) {
  const L = zoneLists()[zone]; if (L.length < 2) return;
  const idx = Math.max(0, L.findIndex((i) => (i ? i.id : null) === state.sel[zone]));
  const n = L[(idx + step + L.length) % L.length];
  state.sel[zone] = n ? n.id : null; state.touched = true;
  const pz = zone === 'top' && n && n.cat === 'dress' ? 'dress' : zone;
  renderDressup(pz);
}
function piecesList(p) { return [p.outer, p.top, p.bottom, p.shoes].filter(Boolean); }
function renderVerdict() {
  const el = $('#verdict'); if (!el) return;
  const items = piecesList(currentPieces());
  if (!items.length) { el.innerHTML = '<p class="muted">Agrega prendas para empezar a armar outfits.</p>'; return; }
  const e = evaluateOutfit(items);
  const cls = e.s >= .8 ? 'good' : e.s >= .6 ? 'ok' : 'bad';
  const word = e.s >= .8 ? 'Combina' : e.s >= .6 ? 'Arriesgado' : 'No combina';
  const f = weatherFlags(); const warn = []; const p = currentPieces();
  if (f.cold && !p.outer) warn.push('Hoy hace frío y no llevas abrigo.');
  if (f.rain && p.shoes && /sandalia/i.test(p.shoes.fit)) warn.push('Con lluvia, mejor otros zapatos.');
  if (f.hot && p.outer) warn.push('Hace calor para ese abrigo.');
  el.innerHTML = `<span class="meter ${cls}">${word}</span>
    <div><p class="v-title">${esc(e.kind)}</p><p class="v-tip">${esc(e.tip)}${warn.length ? ' ' + esc(warn.join(' ')) : ''}</p>
    <div class="swatches">${e.cols.map((c) => `<span style="background:${c.hex}" title="${esc(c.name)}"></span>`).join('')}</div></div>`;
}
function surprise() {
  const L = zoneLists(); if (!L.top.length) { toast('Primero agrega al menos un top o vestido.'); return; }
  const f = weatherFlags(); const recent = (it) => it && it.worn && it.worn.length && daysSince(it.worn[it.worn.length - 1]) <= 3;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  let best = null;
  for (let k = 0; k < 400; k++) {
    const top = rnd(L.top); const bottom = top.cat === 'dress' ? null : (L.bottom.length ? rnd(L.bottom) : null);
    const outer = L.outer.length > 1 ? (f.cold ? rnd(L.outer.slice(1)) : f.hot ? null : rnd(L.outer)) : null;
    const shoes = L.shoes.length > 1 ? rnd(L.shoes.slice(1)) : null;
    const items = [outer, top, bottom, shoes].filter(Boolean);
    let s = evaluateOutfit(items).s + Math.random() * .08;
    if (f.cold) { if (outer) s += .15; if (bottom && bottom.cat === 'shorts') s -= .3; if (shoes && /sandalia/i.test(shoes.fit)) s -= .3; }
    if (f.hot) { if (bottom && (bottom.cat === 'shorts' || bottom.cat === 'skirt')) s += .08; if (top.cat === 'dress') s += .08; if (shoes && /bota/i.test(shoes.fit)) s -= .15; }
    if (f.rain && shoes && /sandalia/i.test(shoes.fit)) s -= .3;
    for (const it of items) if (recent(it)) s -= .12;
    if (!best || s > best.s) best = { s, outer, top, bottom, shoes };
  }
  state.sel = { outer: best.outer ? best.outer.id : null, top: best.top.id, bottom: best.bottom ? best.bottom.id : state.sel.bottom, shoes: best.shoes ? best.shoes.id : null };
  state.touched = true; renderDressup('top');
}
async function saveOutfit() {
  const p = currentPieces(); if (!p.top) { toast('Elige al menos un top o vestido.'); return; }
  const o = { id: uid(), createdAt: new Date().toISOString(), outer: p.outer?.id || null, top: p.top.id, bottom: p.bottom?.id || null, shoes: p.shoes?.id || null };
  await DB.put('outfits', o); state.outfits.unshift(o); renderSaved(); toast('Outfit guardado');
}
async function wearToday() {
  const items = piecesList(currentPieces()); if (!items.length) return;
  const t = todayStr();
  for (const it of items) { it.worn = it.worn || []; if (it.worn[it.worn.length - 1] !== t) it.worn.push(t); await DB.put('items', it); }
  toast('Anotado. ¡Que tengas un lindo día!');
}
function renderSaved() {
  const byId = new Map(state.items.map((i) => [i.id, i]));
  const valid = state.outfits.filter((o) => byId.has(o.top));
  $('#saved-outfits').innerHTML = valid.length ? valid.map((o) => {
    const p = { outer: byId.get(o.outer) || null, top: byId.get(o.top), bottom: byId.get(o.bottom) || null, shoes: byId.get(o.shoes) || null };
    if (p.top.cat === 'dress') p.bottom = null;
    return `<div class="saved-card" data-outfit="${o.id}" role="button" tabindex="0" aria-label="Cargar outfit">
      <div class="figure">${figureHtml(p)}</div>
      <button class="saved-del" data-del-outfit="${o.id}" aria-label="Borrar outfit">${ICON.x}</button></div>`;
  }).join('') : '<p class="muted" style="margin:0;grid-column:1/-1">Cuando te guste una combinación, toca Guardar y aparecerá aquí.</p>';
}

/* ---------- Colores ---------- */
function ownedColors() {
  const m = new Map(); for (const it of state.items) { const c = itemColor(it); m.set(c.name, (m.get(c.name) || 0) + 1); }
  return m;
}
function wheelSvg(owned) {
  const cx = 110, cy = 110, R = 100, r = 62; let s = '';
  for (let k = 0; k < 24; k++) {
    const a0 = (k * 15 - 90 - 7.5) * Math.PI / 180, a1 = ((k + 1) * 15 - 90 - 7.5) * Math.PI / 180;
    const p = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)}`;
    s += `<path d="M${p(r, a0)} L${p(R, a0)} A${R} ${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r} ${r} 0 0 0 ${p(r, a0)}Z" fill="hsl(${k * 15} 68% 72%)" stroke="var(--surface)" stroke-width="1.5"/>`;
  }
  const accents = [...owned.keys()].map(colorByName).filter((c) => !c.n);
  for (const c of accents) {
    const a = (hueOf(c) - 90) * Math.PI / 180; const rad = (R + r) / 2;
    s += `<circle cx="${(cx + rad * Math.cos(a)).toFixed(1)}" cy="${(cy + rad * Math.sin(a)).toFixed(1)}" r="11" fill="${c.hex}" stroke="#fff" stroke-width="3"/>`;
  }
  const neutrals = [...owned.keys()].map(colorByName).filter((c) => c.n);
  neutrals.slice(0, 9).forEach((c, i) => {
    const n = Math.min(neutrals.length, 9); const a = (i / n) * Math.PI * 2 - Math.PI / 2; const rad = n === 1 ? 0 : 30;
    s += `<circle cx="${(cx + rad * Math.cos(a)).toFixed(1)}" cy="${(cy + rad * Math.sin(a)).toFixed(1)}" r="10" fill="${c.hex}" stroke="#E7C9D4" stroke-width="2"/>`;
  });
  if (!neutrals.length) s += `<text x="110" y="114" text-anchor="middle" font-size="11" fill="var(--muted)" stroke="none">neutros</text>`;
  return s;
}
function chipDot(name, missing) { const c = colorByName(name); return `<span class="${missing ? 'missing' : ''}"><i style="background:${c.hex}"></i>${esc(c.name)}</span>`; }
function renderColors() {
  const owned = ownedColors();
  $('#wheel').innerHTML = wheelSvg(owned);
  const nAcc = [...owned.keys()].filter((n) => !colorByName(n).n).length; const nNeu = owned.size - nAcc;
  $('#palette-summary').textContent = owned.size
    ? `Tienes ${owned.size} color${owned.size === 1 ? '' : 'es'}: ${nNeu} neutro${nNeu === 1 ? '' : 's'} y ${nAcc} de color. En la rueda ves dónde cae cada uno; los neutros van al centro.`
    : 'Cuando agregues prendas, tus colores aparecerán en la rueda.';
  $('#palette-list').innerHTML = [...owned.entries()].sort((a, b) => b[1] - a[1])
    .map(([n, k]) => `<span><i style="background:${colorByName(n).hex}"></i>${esc(n)} · ${k}</span>`).join('');

  // Ideas para cada color de color que tiene
  const accents = [...owned.keys()].map(colorByName).filter((c) => !c.n);
  const neutralsOwned = [...owned.keys()].map(colorByName).filter((c) => c.n).map((c) => c.name);
  const ideas = accents.slice(0, 6).map((c) => {
    const matches = COLORS.filter((o) => !o.n && o.name !== c.name).map((o) => ({ o, h: pairHarmony(c, o) })).filter((x) => x.h.s >= .84);
    const have = matches.filter((x) => owned.has(x.o.name)).map((x) => x.o.name);
    const could = matches.filter((x) => !owned.has(x.o.name)).slice(0, 5).map((x) => x.o.name);
    const neutralIdea = ['Blanco', 'Negro', 'Beige', 'Gris', 'Denim'].filter((n) => !owned.has(n)).slice(0, 2);
    return `<div class="idea"><i style="background:${c.hex}"></i><div>
      <h3>Tu ${lower(c.name)}</h3>
      ${have.length || neutralsOwned.length ? `<p class="lbl">Combínalo con lo que tienes</p><div class="dots">${[...have, ...neutralsOwned.slice(0, 4)].map((n) => chipDot(n)).join('')}</div>` : ''}
      ${could.length ? `<p class="lbl">Si sumas</p><div class="dots">${[...could, ...neutralIdea].map((n) => chipDot(n, true)).join('')}</div>` : ''}
    </div></div>`;
  }).join('');
  $('#color-ideas').innerHTML = ideas ? `<div class="card"><h2 class="section-title">Ideas para tus colores</h2>${ideas}</div>` : '';

  // Combinaciones
  for (const b of $$('[data-combo-n]')) b.classList.toggle('is-active', +b.dataset.comboN === state.comboN);
  $('[data-combo-owned]').setAttribute('aria-pressed', String(state.comboOwned));
  let list = COMBOS.map(([cols, kind, why], i) => ({ i, cols, kind, why, missing: cols.filter((n) => !owned.has(n)) }))
    .filter((c) => (state.comboN === 4 ? c.cols.length >= 4 : c.cols.length === state.comboN));
  if (state.comboOwned) list = list.filter((c) => !c.missing.length);
  list.sort((a, b) => a.missing.length - b.missing.length);
  $('#combos').innerHTML = list.length ? list.map((c) => `<article class="combo">
      <div class="blobs">${c.cols.map((n) => `<span class="${c.missing.includes(n) ? 'missing' : ''}" style="background:${colorByName(n).hex}" title="${esc(n)}"></span>`).join('')}</div>
      <span class="kind">${esc(c.kind)}</span>
      <h3>${c.cols.map(esc).join(' + ')}</h3>
      <p>${esc(c.why)}</p>
      <div class="combo-foot">
        <span class="own ${c.missing.length ? '' : 'all'}">${c.missing.length ? 'Te falta: ' + c.missing.map(lower).join(', ') : 'Tienes todos estos colores'}</span>
        ${c.missing.length < c.cols.length - 1 ? `<button class="btn btn-small btn-ghost" data-try-combo="${c.i}">Probar</button>` : ''}
      </div></article>`).join('')
    : `<p class="muted" style="margin:0">${state.comboOwned ? 'Todavía no tienes todos los colores de estas combinaciones. Quita el filtro para ver ideas.' : 'No hay combinaciones aquí.'}</p>`;
}
function tryCombo(i) {
  const names = new Set(COMBOS[i][0]); const used = new Set();
  const pick = (pred) => {
    const cands = state.items.filter((it) => pred(it) && names.has(it.colorName));
    const fresh = cands.find((it) => !used.has(it.colorName)) || cands[0];
    if (fresh) used.add(fresh.colorName); return fresh || null;
  };
  const top = pick((i) => i.cat === 'top') || pick((i) => i.cat === 'dress');
  const bottom = top && top.cat === 'dress' ? null : pick((i) => CATS[i.cat].zone === 'bottom');
  const shoes = pick((i) => i.cat === 'shoes'); const outer = pick((i) => i.cat === 'outer');
  if (!top || (top.cat !== 'dress' && !bottom)) { toast('Te faltan prendas de estos colores para armarlo.'); return; }
  state.sel = { outer: outer?.id || null, top: top.id, bottom: bottom ? bottom.id : state.sel.bottom, shoes: shoes?.id || state.sel.shoes };
  state.touched = true; setTab('outfit');
}

/* ---------- Compras ---------- */
function computeGaps() {
  const it = state.items; if (!it.length) return [];
  const g = []; const has = (pred) => it.some(pred); const neutral = (i) => itemColor(i).n;
  const tops = it.filter((i) => i.cat === 'top').length;
  const bottoms = it.filter((i) => CATS[i.cat]?.zone === 'bottom').length;
  if (!has((i) => i.cat === 'shoes')) g.push(['Zapatillas blancas', 'Todavía no tienes zapatos en el clóset; unas blancas van con todo.']);
  if (!has((i) => CATS[i.cat]?.zone === 'bottom' && neutral(i))) g.push(['Pantalón neutro (negro, beige o denim)', 'No tienes partes de abajo neutras para equilibrar tus tops de color.']);
  if (!has((i) => i.cat === 'top' && neutral(i))) g.push(['Polera básica blanca o negra', 'Un top neutro te deja lucir tus partes de abajo con color.']);
  if (!has((i) => i.cat === 'outer')) g.push(['Chaqueta o abrigo', 'No tienes ninguna capa para los días fríos.']);
  if (tops > bottoms * 2 + 1) g.push(['Otra parte de abajo', `Tienes ${tops} tops y solo ${bottoms} partes de abajo: con una más multiplicas tus outfits.`]);
  if (bottoms > tops * 2 + 1) g.push(['Otro top', `Tienes ${bottoms} partes de abajo y solo ${tops} tops.`]);
  const sh = it.filter((i) => i.cat === 'shoes');
  if (sh.length && !sh.some((s) => /bota|botín/i.test(s.fit))) g.push(['Botas o botines', 'Útiles para el frío y la lluvia.']);
  const inList = new Set(state.shopping.map((s) => s.text.toLowerCase()));
  return g.filter(([t]) => !inList.has(t.toLowerCase()));
}
function renderShop() {
  const gaps = computeGaps();
  $('#gaps').innerHTML = gaps.length ? gaps.map(([t, why]) =>
    `<div class="gap"><p>${esc(t)}<span class="why">${esc(why)}</span></p>
     <button class="btn btn-small btn-ghost" data-add-gap="${esc(t)}">Agregar</button></div>`).join('')
    : `<p class="muted" style="margin:0">${state.items.length ? 'Tu clóset está bien equilibrado. Nada urgente que comprar.' : 'Agrega prendas y te diré qué te falta.'}</p>`;
  $('#shop-list').innerHTML = state.shopping.map((s) =>
    `<li class="${s.done ? 'done' : ''}"><input type="checkbox" id="chk-${s.id}" data-check="${s.id}" ${s.done ? 'checked' : ''}>
     <label class="txt" for="chk-${s.id}">${esc(s.text)}</label>
     <button class="icon-btn" data-del-shop="${s.id}" aria-label="Borrar">${ICON.x}</button></li>`).join('')
    || '<li class="muted">Tu lista está vacía.</li>';
}
async function addShop(text) {
  const s = { id: uid(), text, done: false, createdAt: new Date().toISOString() };
  await DB.put('shopping', s); state.shopping.push(s); renderShop(); toast('Agregado a tu lista');
}

/* ---------- Más ---------- */
function renderMore() {
  const lb = state.meta.lastBackup;
  $('#backup-status').textContent = lb ? `Último respaldo: hace ${daysSince(lb)} día${daysSince(lb) === 1 ? '' : 's'}.` : 'Todavía no has hecho un respaldo.';
  const counts = Object.entries(CATS).map(([k, c]) => [c.label, state.items.filter((i) => i.cat === k).length]);
  const max = Math.max(1, ...counts.map((c) => c[1]));
  $('#stats').innerHTML = state.items.length
    ? counts.map(([l, n]) => `<div class="stat-row"><span>${l}</span><div class="stat-bar"><span style="width:${(n / max) * 100}%"></span></div><span class="n">${n}</span></div>`).join('')
    : '<p class="muted">Aún no hay prendas.</p>';
}

function renderAll() {
  renderTopbar(); renderCloset();
  if (state.tab === 'outfit') { renderDressup(); renderSaved(); }
  if (state.tab === 'colors') renderColors();
  if (state.tab === 'shop') renderShop();
  if (state.tab === 'more') renderMore();
}

/* ---------- Hojas ---------- */
function openSheet(html) { $('#sheet').innerHTML = `<div class="sheet-inner">${html}</div>`; $('#sheet').hidden = false; $('#sheet-backdrop').hidden = false; $('#sheet').scrollTop = 0; }
function closeSheet() {
  if (editing && editing._url) URL.revokeObjectURL(editing._url);
  $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true; $('#sheet').innerHTML = ''; editing = null;
}
function openAdd() {
  openSheet(`<h2>¿Qué te vas a probar?</h2>
    <div class="cat-grid">${Object.entries(CATS).map(([k, c]) =>
      `<button class="cat-btn" data-pick-cat="${k}"><svg viewBox="${c.tall ? '0 0 300 500' : '0 0 300 400'}" aria-hidden="true"><path d="${WEAR[c.wear]}"/></svg>${c.one}</button>`).join('')}</div>
    <p class="muted small" style="margin:0">Sácate la foto con la prenda puesta, ojalá frente a un espejo y con buena luz. La silueta te ayuda a que todas queden del mismo tamaño.</p>`);
}
let editing = null;
function fitOptions(cat) { const custom = (state.meta.customFits || {})[cat] || []; return [...new Set([...CATS[cat].fits, ...custom])]; }
function editPhotoHtml() { return `<img class="${editing.cutout ? '' : 'opaque'}" src="${editing._url}" alt="">`; }
function openEdit(item) {
  editing = { ...item }; const isNew = !item.id;
  editing._url = URL.createObjectURL(item.photo);
  const worn = item.worn || [];
  const canToggleBg = isNew && item._cutout;
  openSheet(`<h2>${isNew ? 'Nueva prenda' : esc(itemTitle(item))}</h2>
    <div class="edit-top">
      <div class="photo" id="edit-photo">${editPhotoHtml()}</div>
      <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
        <label class="field"><span>Tipo</span>
          <select id="f-cat">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${k === item.cat ? 'selected' : ''}>${c.one}</option>`).join('')}</select></label>
        <label class="field"><span>Fit / estilo</span>
          <input id="f-fit" list="fit-list" value="${esc(item.fit)}" placeholder="Ej: wide leg" autocomplete="off">
          <datalist id="fit-list">${fitOptions(item.cat).map((f) => `<option value="${esc(f)}">`).join('')}</datalist></label>
        ${canToggleBg ? '<label class="switch"><input type="checkbox" id="f-bg" checked> Sin fondo</label>' : ''}
        <label class="switch" id="open-wrap" ${item.cat === 'outer' ? '' : 'hidden'}><input type="checkbox" id="f-open" ${isOpen(item) ? 'checked' : ''}> Lo uso abierto</label>
      </div>
    </div>
    <div class="chips" id="fit-chips">${fitOptions(item.cat).map((f) => `<button class="chip ${f === item.fit ? 'is-active' : ''}" data-fit="${esc(f)}">${esc(f)}</button>`).join('')}</div>
    <label class="field"><span>Nombre (opcional)</span><input id="f-name" value="${esc(item.name)}" placeholder="Ej: mi jeans favorito" autocomplete="off"></label>
    <div class="field"><span>Color</span>
      <div class="color-now" id="color-now"></div>
      <div class="color-pick">${COLORS.map((c) => `<button data-color="${esc(c.name)}" style="background:${c.hex}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join('')}</div>
    </div>
    ${isNew ? '' : `<p class="meta-line">${worn.length ? `Usada ${worn.length} ${worn.length === 1 ? 'vez' : 'veces'} · última hace ${daysSince(worn[worn.length - 1])} días` : 'Todavía no la has usado.'}</p>`}
    <div class="sheet-actions">
      ${isNew ? '<button class="btn btn-ghost" data-action="close-sheet">Cancelar</button>' : '<button class="btn btn-danger" data-action="delete-item">Borrar</button>'}
      <button class="btn btn-accent" data-action="save-item">${isNew ? 'Guardar prenda' : 'Guardar cambios'}</button>
    </div>`);
  renderColorNow();
}
function renderColorNow() {
  const c = colorByName(editing.colorName);
  $('#color-now').innerHTML = `<i style="background:${c.hex}"></i>${esc(c.name)}${c.n ? ' <span class="detected">(neutro)</span>' : ''}
    ${editing.detected ? '<span class="detected">· detectado en la foto</span>' : ''}`;
  for (const b of $$('[data-color]')) b.classList.toggle('is-active', b.dataset.color === editing.colorName);
}
async function saveItem() {
  const cat = $('#f-cat').value; const fit = $('#f-fit').value.trim(); const name = $('#f-name').value.trim();
  if (fit && !CATS[cat].fits.some((f) => f.toLowerCase() === fit.toLowerCase())) {
    const cf = { ...(state.meta.customFits || {}) }; cf[cat] = [...new Set([...(cf[cat] || []), fit])]; await setMeta('customFits', cf);
  }
  const isNew = !editing.id;
  const item = {
    id: editing.id || uid(), cat, fit, name, colorName: editing.colorName, photo: editing.photo, cutout: !!editing.cutout,
    open: cat === 'outer' ? $('#f-open').checked : false,
    createdAt: editing.createdAt || new Date().toISOString(), worn: editing.worn || [], sample: !!editing.sample,
  };
  await DB.put('items', item); dropUrl(item.id);
  const i = state.items.findIndex((x) => x.id === item.id);
  if (i >= 0) state.items[i] = item; else state.items.unshift(item);
  closeSheet();
  if (isNew) {
    state.filter = 'all';
    const z = CATS[cat].zone; if (z === 'bottom') state.sel.bottom = item.id; else if (z === 'top' || z === 'dress') state.sel.top = item.id; else state.sel[z] = item.id;
  }
  renderAll(); toast(isNew ? 'Prenda guardada' : 'Cambios guardados');
}
async function deleteItem(btn) {
  if (!btn.dataset.confirm) { btn.dataset.confirm = '1'; btn.textContent = 'Toca otra vez para borrar'; return; }
  const id = editing.id; await DB.del('items', id); dropUrl(id);
  state.items = state.items.filter((i) => i.id !== id); closeSheet(); renderAll(); toast('Prenda borrada');
}

/* ---------- Respaldo ---------- */
function blobToDataUrl(b) { return new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
async function dataUrlToBlob(u) { return (await fetch(u)).blob(); }
async function exportBackup() {
  const items = await Promise.all(state.items.filter((i) => !i.sample).map(async (i) => ({ ...i, photo: await blobToDataUrl(i.photo) })));
  const data = { app: 'mi-closet', version: 2, exportedAt: new Date().toISOString(), items, outfits: state.outfits, shopping: state.shopping, customFits: state.meta.customFits || {}, location: state.meta.location || null };
  const name = `mi-closet-respaldo-${todayStr()}.json`;
  const file = new File([JSON.stringify(data)], name, { type: 'application/json' });
  let shared = false;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Respaldo de Mi Clóset' }); shared = true; } catch (e) { if (e.name === 'AbortError') return; }
  }
  if (!shared) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  await setMeta('lastBackup', new Date().toISOString()); renderAll(); toast('Respaldo listo');
}
async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text()); if (data.app !== 'mi-closet') throw new Error();
    for (const i of data.items || []) await DB.put('items', { ...i, photo: await dataUrlToBlob(i.photo) });
    for (const o of data.outfits || []) await DB.put('outfits', o);
    for (const s of data.shopping || []) await DB.put('shopping', s);
    if (data.customFits) await setMeta('customFits', { ...(state.meta.customFits || {}), ...data.customFits });
    if (data.location && !state.meta.location) await setMeta('location', data.location);
    for (const id of [...state.urls.keys()]) dropUrl(id);
    await loadAll(); renderAll(); toast(`Recuperé ${(data.items || []).length} prendas`);
  } catch { toast('Ese archivo no es un respaldo de Mi Clóset.'); }
}

/* ---------- Prendas de ejemplo (dibujadas, sin fondo) ---------- */
const SAMPLES = [
  ['top', 'Polera', 'Blanco', 'top'], ['top', 'Camisa', 'Celeste', 'top'], ['top', 'Sweater', 'Burdeo', 'top'], ['top', 'Crop top', 'Negro', 'crop'], ['top', 'Blusa', 'Rosado', 'top'],
  ['outer', 'Chaqueta', 'Denim', 'outer'], ['outer', 'Blazer', 'Beige', 'outer'],
  ['pants', 'Wide leg', 'Negro', 'pants'], ['pants', 'Cargo', 'Verde oliva', 'pants'], ['pants', 'Recto', 'Denim', 'slim'],
  ['skirt', 'Midi', 'Camel', 'skirt'], ['dress', 'Midi', 'Lila', 'dress'],
  ['shoes', 'Zapatillas', 'Blanco', 'sneakers'], ['shoes', 'Botas', 'Negro', 'boots'],
];
function drawSample(cat, hex, shape) {
  const [W, H] = sizeFor(cat); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.scale(W / 300, W / 300);
  const p = new Path2D(WEAR[shape]); x.fillStyle = hex; x.fill(p);
  x.lineWidth = 2.5; x.strokeStyle = 'rgba(0,0,0,.22)'; x.stroke(p);
  return canvasToBlob(c, 'image/png');
}
async function loadSamples() {
  if (state.items.some((i) => i.sample)) { toast('Los ejemplos ya están cargados.'); return; }
  let t = Date.now();
  for (const [cat, fit, color, shape] of SAMPLES) {
    const photo = await drawSample(cat, colorByName(color).hex, shape);
    await DB.put('items', { id: uid(), cat, fit, name: '', colorName: color, photo, cutout: true, open: cat === 'outer', createdAt: new Date(t--).toISOString(), worn: [], sample: true });
  }
  await loadAll(); renderAll(); toast('Ejemplos cargados. Ve a Armar para jugar.');
}
async function clearSamples() {
  const s = state.items.filter((i) => i.sample); for (const i of s) { await DB.del('items', i.id); dropUrl(i.id); }
  await loadAll(); renderAll(); toast(s.length ? 'Ejemplos borrados' : 'No hay ejemplos cargados');
}

/* ---------- Pestañas ---------- */
const TABS = ['closet', 'outfit', 'colors', 'shop', 'more'];
function setTab(tab) {
  state.tab = tab;
  for (const t of $$('.tab')) t.classList.toggle('is-active', t.dataset.tab === tab);
  for (const v of TABS) $('#view-' + v).hidden = v !== tab;
  $('#fab').hidden = tab !== 'closet';
  if (tab === 'outfit' && !state.weather) initWeather();
  renderAll(); window.scrollTo(0, 0);
}

/* ---------- Eventos ---------- */
document.addEventListener('click', async (e) => {
  const t = e.target.closest('button, [data-outfit]'); if (!t) return;
  const d = t.dataset;
  if (d.tab) return setTab(d.tab);
  if (d.filter) { state.filter = d.filter; return renderCloset(); }
  if (d.item) { const it = state.items.find((i) => i.id === d.item); if (it) openEdit(it); return; }
  if (d.pickCat) { closeSheet(); return openCamera(d.pickCat); }
  if (d.fit) { $('#f-fit').value = d.fit; for (const c of $$('[data-fit]')) c.classList.toggle('is-active', c === t); if (editing.cat === 'outer') $('#f-open').checked = OPEN_FITS.test(d.fit); return; }
  if (d.color) { editing.colorName = d.color; editing.detected = false; return renderColorNow(); }
  if (d.move) { const [z, s] = d.move.split(':'); return move(z, +s); }
  if (d.delOutfit) { e.stopPropagation(); await DB.del('outfits', d.delOutfit); state.outfits = state.outfits.filter((o) => o.id !== d.delOutfit); return renderSaved(); }
  if (d.outfit) {
    const o = state.outfits.find((x) => x.id === d.outfit); if (!o) return;
    state.sel = { outer: o.outer, top: o.top, bottom: o.bottom || state.sel.bottom, shoes: o.shoes }; state.touched = true;
    renderDressup('top'); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
  }
  if (d.comboN) { state.comboN = +d.comboN; return renderColors(); }
  if (d.comboOwned) { state.comboOwned = !state.comboOwned; return renderColors(); }
  if (d.tryCombo) return tryCombo(+d.tryCombo);
  if (d.addGap) return addShop(d.addGap);
  if (d.delShop) { await DB.del('shopping', d.delShop); state.shopping = state.shopping.filter((s) => s.id !== d.delShop); return renderShop(); }
  switch (d.action) {
    case 'add': return openAdd();
    case 'close-sheet': return closeSheet();
    case 'save-item': return saveItem();
    case 'delete-item': return deleteItem(t);
    case 'close-camera': return closeCamera();
    case 'flip-camera': return flipCamera();
    case 'timer': return cycleTimer();
    case 'shoot': return shoot();
    case 'surprise': return surprise();
    case 'save-outfit': return saveOutfit();
    case 'wear-today': return wearToday();
    case 'export': return exportBackup();
    case 'load-samples': return loadSamples();
    case 'clear-samples': return clearSamples();
    case 'locate': return locateMe();
    case 'change-city': return renderWeather('city');
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-outfit]')) e.target.click(); });
$('#sheet-backdrop').addEventListener('click', closeSheet);
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.id === 'f-cat' && editing) {
    editing.cat = t.value; const opts = fitOptions(editing.cat);
    $('#fit-list').innerHTML = opts.map((f) => `<option value="${esc(f)}">`).join('');
    $('#fit-chips').innerHTML = opts.map((f) => `<button class="chip" data-fit="${esc(f)}">${esc(f)}</button>`).join('');
    $('#f-fit').value = ''; $('#open-wrap').hidden = editing.cat !== 'outer';
  }
  if (t.id === 'f-bg' && editing) {
    editing.cutout = t.checked; editing.photo = t.checked ? editing._cutout : editing._original;
    URL.revokeObjectURL(editing._url); editing._url = URL.createObjectURL(editing.photo); $('#edit-photo').innerHTML = editPhotoHtml();
  }
  if (t.dataset.check) { const s = state.shopping.find((x) => x.id === t.dataset.check); s.done = t.checked; await DB.put('shopping', s); renderShop(); }
});
document.addEventListener('submit', (e) => { if (e.target.id === 'city-form') { e.preventDefault(); searchCity($('#city-input').value.trim()); } });
$('#shop-form').addEventListener('submit', async (e) => {
  e.preventDefault(); const v = $('#shop-text').value.trim(); if (!v) return; await addShop(v); $('#shop-text').value = '';
});
$('#gallery-input').addEventListener('change', async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  closeCamera();
  try { const img = await loadImageFile(f); await afterCapture(drawCover(img, img.naturalWidth, img.naturalHeight, pendingCat, false)); }
  catch { closeSheet(); toast('No pude abrir esa imagen.'); }
});
$('#import-file').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) importBackup(f); });

/* Deslizar con el dedo en los selectores */
let touch = null;
document.addEventListener('touchstart', (e) => { const r = e.target.closest('.picker'); if (r) touch = { zone: r.dataset.zone, x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (!touch) return; const dx = e.changedTouches[0].clientX - touch.x, dy = e.changedTouches[0].clientY - touch.y;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) move(touch.zone, dx < 0 ? 1 : -1);
  touch = null;
}, { passive: true });

/* ---------- Inicio ---------- */
(async function init() {
  for (const el of $$('[data-swatches]')) el.innerHTML = el.dataset.swatches.split(',').map((n) => `<span style="background:${colorByName(n).hex}" title="${esc(n)}"></span>`).join('');
  try { await DB.open(); await loadAll(); }
  catch { toast('Tu navegador no permite guardar datos. Prueba fuera del modo incógnito.'); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  setTab('closet');
})();
