/* Mi Clóset — todo se guarda en el teléfono (IndexedDB). */
'use strict';

/* ---------- Cuerpo y siluetas ----------
   Un solo cuerpo de referencia (300 de ancho x 900 de alto, de la cabeza a los pies).
   Cada tipo de prenda se fotografía con un encuadre (ventana) de ese cuerpo, y el maniquí
   ubica cada foto en su ventana: así todo calza a la misma escala. */
const BODY_RIGHT = [
  [163, 104],
  ['C', 165, 122, 172, 130, 188, 136], ['C', 205, 141, 222, 144, 230, 156], ['C', 238, 168, 240, 186, 240, 205],
  ['C', 241, 250, 246, 290, 249, 330], ['C', 252, 370, 258, 410, 262, 445], ['C', 266, 470, 266, 500, 256, 512],
  ['C', 248, 520, 240, 506, 240, 486], ['C', 238, 470, 238, 455, 238, 445], ['C', 234, 405, 228, 370, 226, 335],
  ['C', 224, 290, 220, 240, 214, 214], ['C', 214, 250, 204, 290, 200, 330], ['C', 198, 365, 214, 390, 218, 425],
  ['C', 222, 460, 220, 490, 214, 520], ['C', 208, 570, 200, 610, 198, 640], ['C', 196, 670, 204, 700, 200, 730],
  ['C', 196, 780, 184, 830, 182, 862], ['C', 184, 880, 196, 892, 192, 900], ['L', 160, 900],
  ['C', 158, 890, 160, 875, 162, 862], ['C', 164, 800, 158, 700, 160, 640], ['C', 162, 580, 162, 500, 150, 452],
];
function buildBodyPath() {
  const m = (x) => 300 - x; const segs = BODY_RIGHT.slice(1); const ends = [BODY_RIGHT[0]];
  let d = `M${BODY_RIGHT[0][0]} ${BODY_RIGHT[0][1]}`;
  for (const s of segs) {
    d += s[0] === 'C' ? ` C${s[1]} ${s[2]} ${s[3]} ${s[4]} ${s[5]} ${s[6]}` : ` L${s[1]} ${s[2]}`;
    ends.push(s[0] === 'C' ? [s[5], s[6]] : [s[1], s[2]]);
  }
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i], p = ends[i];
    d += s[0] === 'C' ? ` C${m(s[3])} ${s[4]} ${m(s[1])} ${s[2]} ${m(p[0])} ${p[1]}` : ` L${m(p[0])} ${p[1]}`;
  }
  return d + ' Z';
}
const BODY_PATH = buildBodyPath();
const HEAD = { cx: 150, cy: 58, rx: 33, ry: 44 };
const bodySvgInner = () => `<path d="${BODY_PATH}"/><ellipse cx="${HEAD.cx}" cy="${HEAD.cy}" rx="${HEAD.rx}" ry="${HEAD.ry}"/>`;

/* Ventanas de cada zona: [x, y, ancho, alto] en coordenadas del cuerpo */
const WIN = {
  top: [15, 110, 270, 360], outer: [15, 110, 270, 360],
  bottom: [-60, 315, 420, 560], dress: [-72, 110, 444, 790], shoes: [90, 760, 120, 160],
};
const FIG = [-72, 100, 444, 830]; // lo que muestra el maniquí

/* Formas de prendas (para íconos y ejemplos), también en coordenadas del cuerpo */
const WEAR = {
  top: 'M128 112 Q150 128 172 112 L190 132 L232 150 L246 228 L216 236 L212 210 L214 300 L222 430 L78 430 L86 300 L88 210 L84 236 L54 228 L68 150 L110 132 Z',
  crop: 'M128 112 Q150 128 172 112 L190 132 L232 150 L246 228 L216 236 L212 210 L210 335 L90 335 L88 210 L84 236 L54 228 L68 150 L110 132 Z',
  sweater: 'M128 112 Q150 128 172 112 L194 130 L234 150 L246 210 L252 330 L262 448 L236 452 L226 340 L216 250 L218 430 L82 430 L84 250 L74 340 L64 452 L38 448 L48 330 L54 210 L66 150 L106 130 Z',
  outer: 'M124 110 Q150 140 176 110 L196 130 L234 150 L246 210 L252 330 L262 448 L236 452 L226 340 L218 250 L222 470 L78 470 L82 250 L74 340 L64 452 L38 448 L48 330 L54 210 L66 150 L104 130 Z',
  pants: 'M100 322 L200 322 L222 430 L232 870 L166 870 L152 470 L148 470 L134 870 L68 870 L78 430 Z',
  slim: 'M102 322 L198 322 L218 430 L198 870 L164 870 L154 480 L146 480 L136 870 L102 870 L82 430 Z',
  skirt: 'M104 322 L196 322 L222 430 L246 700 L54 700 L78 430 Z',
  shorts: 'M100 322 L200 322 L224 430 L228 540 L160 548 L150 470 L140 548 L72 540 L76 430 Z',
  dress: 'M126 112 Q150 132 174 112 L196 124 L204 210 L200 330 L222 430 L252 760 L48 760 L78 430 L100 330 L96 210 L104 124 Z',
  sneakers: 'M158 848 L190 848 Q200 870 198 902 L156 904 Q154 880 158 848 Z M142 848 L110 848 Q100 870 102 902 L144 904 Q146 880 142 848 Z',
  boots: 'M160 790 L192 790 L196 902 L154 904 Z M140 790 L108 790 L104 902 L146 904 Z',
};

const CATS = {
  top:    { label: 'Tops',       one: 'Top',      zone: 'top',    wear: 'top',      fits: ['Polera', 'Camisa', 'Blusa', 'Crop top', 'Sweater', 'Peto', 'Body', 'Polo'],
            hint: 'Ponte el top y calza hombros, brazos y caderas en la silueta. Frente a un espejo funciona mejor.' },
  outer:  { label: 'Abrigos',    one: 'Abrigo',   zone: 'outer',  wear: 'outer',    fits: ['Chaqueta', 'Blazer', 'Cárdigan', 'Polerón', 'Abrigo', 'Chaleco', 'Parka'],
            hint: 'Ponte el abrigo como lo usarías y calza hombros y brazos en la silueta.' },
  pants:  { label: 'Pantalones', one: 'Pantalón', zone: 'bottom', wear: 'pants',    fits: ['Wide leg', 'Cargo', 'Recto', 'Skinny', 'Baggy', 'Flare', 'Mom', 'Jogger', 'Palazzo'],
            hint: 'De la cintura a los tobillos. Apoya el celular y usa el temporizador, o pídele a alguien.' },
  skirt:  { label: 'Faldas',     one: 'Falda',    zone: 'bottom', wear: 'skirt',    fits: ['Mini', 'Midi', 'Larga', 'Plisada', 'Lápiz', 'Cargo'],
            hint: 'De la cintura a los tobillos, aunque la falda sea corta, para que calce con el resto.' },
  shorts: { label: 'Shorts',     one: 'Short',    zone: 'bottom', wear: 'shorts',   fits: ['Jeans', 'Bermuda', 'Tela', 'Deportivo'],
            hint: 'De la cintura a los tobillos, para que calce con el resto.' },
  dress:  { label: 'Vestidos',   one: 'Vestido',  zone: 'dress',  wear: 'dress',    fits: ['Mini', 'Midi', 'Largo', 'Jumper', 'Enterito'],
            hint: 'Cuerpo completo, de hombros a pies. Usa el temporizador o pídele a alguien que te saque la foto.' },
  shoes:  { label: 'Zapatos',    one: 'Zapatos',  zone: 'shoes',  wear: 'sneakers', fits: ['Zapatillas', 'Botas', 'Botines', 'Sandalias', 'Tacos', 'Ballerinas', 'Mocasines', 'Plataformas'],
            hint: 'Con los zapatos puestos, de pie, apunta a tus pies de frente.' },
};
const winOf = (cat) => WIN[CATS[cat].zone];
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
const OUT_W = 450;
const sizeFor = (cat) => { const w = winOf(cat); return [OUT_W, Math.round(OUT_W * w[3] / w[2])]; };
function canvasToBlob(c, type = 'image/jpeg', q = .85) { return new Promise((r) => c.toBlob(r, type, q)); }
async function cutoutBlob(c) {
  let b = await canvasToBlob(c, 'image/webp', .86);
  if (!b || b.type !== 'image/webp') b = await canvasToBlob(c, 'image/png');
  return b;
}
function drawCover(src, sw, sh, cat, mirror) {
  const [W, H] = sizeFor(cat);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); const target = W / H; let cw = sw, ch = sh;
  if (sw / sh > target) cw = sh * target; else ch = sw / target;
  if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
  ctx.drawImage(src, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, W, H);
  return c;
}
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image(); const isBlob = src instanceof Blob; const u = isBlob ? URL.createObjectURL(src) : src;
    img.onload = () => { if (isBlob) URL.revokeObjectURL(u); res(img); }; img.onerror = rej; img.src = u;
  });
}
async function blobToCanvas(blob) {
  const img = await loadImage(blob); const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext('2d').drawImage(img, 0, 0); return c;
}

/* Quitar el fondo automático (MediaPipe, corre en el mismo celular). Devuelve una máscara. */
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
async function autoMask(canvas) {
  const seg = await getSegmenter();
  const res = seg.segment(canvas);
  const m = res.confidenceMasks[0]; const w = m.width, h = m.height; const p = m.getAsFloat32Array().slice();
  if (res.close) res.close();
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
    let v = invert ? 1 - p[i] : p[i]; v = Math.min(1, Math.max(0, (v - .3) / .4));
    id.data[i * 4 + 3] = v * 255; if (v > .5) on++;
  }
  const cover = on / p.length;
  if (cover < .03 || cover > .97) throw new Error('mask');
  mx.putImageData(id, 0, 0);
  const out = document.createElement('canvas'); out.width = canvas.width; out.height = canvas.height;
  out.getContext('2d').drawImage(mc, 0, 0, out.width, out.height);
  return out;
}

/* Color principal: zona central de la prenda, ignorando lo transparente */
const COLOR_ZONE = { top: [[.32, .68]], outer: [[.24, .4], [.6, .76]], bottom: [[.36, .64]], dress: [[.38, .62]], shoes: [[.12, .88]] };
const COLOR_Y = { top: [.25, .8], outer: [.25, .8], bottom: [.22, .55], dress: [.12, .4], shoes: [.45, .9] };
function detectColor(canvas, cat) {
  const SW = 60, SH = Math.round(60 * canvas.height / canvas.width);
  const s = document.createElement('canvas'); s.width = SW; s.height = SH;
  const x = s.getContext('2d', { willReadFrequently: true }); x.drawImage(canvas, 0, 0, SW, SH);
  const d = x.getImageData(0, 0, SW, SH).data;
  const px = (i, j) => { const k = (j * SW + i) * 4; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };
  const zone = CATS[cat].zone; const ys = COLOR_Y[zone];
  const buckets = new Map(); let fg = 0;
  const scan = (x0, x1, y0, y1) => {
    for (let j = Math.floor(SH * y0); j < SH * y1; j++) for (let i = Math.floor(SW * x0); i < SW * x1; i++) {
      const p = px(i, j); if (p[3] < 160) continue; fg++;
      const key = (p[0] >> 5) + ',' + (p[1] >> 5) + ',' + (p[2] >> 5);
      const b = buckets.get(key) || [0, 0, 0, 0]; b[0] += p[0]; b[1] += p[1]; b[2] += p[2]; b[3]++; buckets.set(key, b);
    }
  };
  for (const [a, b] of COLOR_ZONE[zone]) scan(a, b, ys[0], ys[1]);
  if (fg < 25) { buckets.clear(); fg = 0; scan(0, 1, 0, 1); }
  if (!fg) return '#8E8E8E';
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
function setGuide(svg, cat) { const w = winOf(cat); svg.setAttribute('viewBox', w.join(' ')); svg.innerHTML = bodySvgInner(); }
async function openCamera(cat) {
  pendingCat = cat; const c = CATS[cat]; const w = winOf(cat);
  $('#camera-label').textContent = c.one; $('#camera-hint').textContent = c.hint;
  setGuide($('#camera-guide'), cat);
  $('#cam-box').style.setProperty('--ar', `${w[2]} / ${w[3]}`); $('#cam-box').style.setProperty('--arn', String(w[2] / w[3]));
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
  closeCamera(); openCutter(c, null, pendingCat, true);
}

/* ---------- Editor de recorte ---------- */
const cut = { orig: null, mask: null, cat: 'top', tool: 'lasso', zoom: 1, undo: [], guide: true, drawing: false, pts: [], last: null, onDone: null };
const CUT_HINT = {
  lasso: 'Dibuja con el dedo una línea alrededor de la prenda. Se queda solo lo que quede adentro.',
  erase: 'Pasa el dedo por lo que quieras sacar (fondo, piel, pelo).',
  restore: 'Pasa el dedo por lo que borraste de más para recuperarlo.',
  move: 'Arrastra para moverte por la foto cuando tengas zoom.',
};
function openCutter(origCanvas, maskCanvas, cat, tryAuto, onDone) {
  cut.orig = origCanvas; cut.cat = cat; cut.undo = []; cut.zoom = 1; cut.onDone = onDone || null;
  cut.mask = document.createElement('canvas'); cut.mask.width = origCanvas.width; cut.mask.height = origCanvas.height;
  const mx = cut.mask.getContext('2d');
  if (maskCanvas) mx.drawImage(maskCanvas, 0, 0); else { mx.fillStyle = '#000'; mx.fillRect(0, 0, cut.mask.width, cut.mask.height); }
  const cv = $('#cut-canvas'); cv.width = origCanvas.width; cv.height = origCanvas.height;
  $('#cutter').hidden = false; document.body.style.overflow = 'hidden';
  setTool(maskCanvas ? 'erase' : 'lasso'); sizeCutCanvas(); drawCut();
  if (tryAuto) runAuto(true);
}
function sizeCutCanvas() {
  const st = $('#cut-stage'); const cv = $('#cut-canvas');
  const maxW = st.clientWidth - 24, maxH = st.clientHeight - 8;
  const base = Math.min(maxW, maxH * cv.width / cv.height);
  cv.style.width = base * cut.zoom + 'px'; cv.style.height = base * cut.zoom * cv.height / cv.width + 'px';
  $('#zoom-btn').textContent = `Zoom ${cut.zoom}×`;
}
function drawCut() {
  const cv = $('#cut-canvas'); const x = cv.getContext('2d'); const W = cv.width, H = cv.height;
  x.clearRect(0, 0, W, H);
  x.globalAlpha = .22; x.drawImage(cut.orig, 0, 0); x.globalAlpha = 1;
  const t = document.createElement('canvas'); t.width = W; t.height = H; const tx = t.getContext('2d');
  tx.drawImage(cut.orig, 0, 0); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(cut.mask, 0, 0);
  x.drawImage(t, 0, 0);
  if (cut.guide) {
    const w = winOf(cut.cat); const s = W / w[2];
    x.save(); x.scale(s, s); x.translate(-w[0], -w[1]);
    x.lineWidth = 2.2 / s; x.setLineDash([8 / s, 7 / s]); x.strokeStyle = 'rgba(226,124,156,.9)';
    x.stroke(new Path2D(BODY_PATH)); x.beginPath(); x.ellipse(HEAD.cx, HEAD.cy, HEAD.rx, HEAD.ry, 0, 0, Math.PI * 2); x.stroke();
    x.restore();
  }
  if (cut.tool === 'lasso' && cut.pts.length > 1) {
    x.save(); x.lineWidth = 3 * W / cv.clientWidth; x.strokeStyle = '#B9476F'; x.setLineDash([]);
    x.beginPath(); x.moveTo(...cut.pts[0]); for (const p of cut.pts) x.lineTo(...p); x.stroke(); x.restore();
  }
}
function setTool(t) {
  cut.tool = t; for (const b of $$('[data-tool]')) b.classList.toggle('is-active', b.dataset.tool === t);
  $('#cut-hint').textContent = CUT_HINT[t]; $('#cut-stage').classList.toggle('moving', t === 'move');
}
function pushUndo() {
  const m = cut.mask; cut.undo.push(m.getContext('2d').getImageData(0, 0, m.width, m.height)); if (cut.undo.length > 15) cut.undo.shift();
}
function cutPoint(e) {
  const cv = $('#cut-canvas'); const r = cv.getBoundingClientRect();
  return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
}
function brushPx() { const cv = $('#cut-canvas'); return +$('#brush-size').value * cv.width / cv.clientWidth; }
function paint(a, b) {
  const x = cut.mask.getContext('2d'); x.save();
  x.globalCompositeOperation = cut.tool === 'erase' ? 'destination-out' : 'source-over';
  x.strokeStyle = '#000'; x.fillStyle = '#000'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = brushPx();
  x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke();
  x.beginPath(); x.arc(b[0], b[1], brushPx() / 2, 0, Math.PI * 2); x.fill(); x.restore();
}
async function runAuto(silent) {
  $('#cut-hint').textContent = 'Buscando la silueta… la primera vez tarda unos segundos.';
  try {
    const m = await autoMask(cut.orig); pushUndo();
    const x = cut.mask.getContext('2d'); x.clearRect(0, 0, cut.mask.width, cut.mask.height); x.drawImage(m, 0, 0);
    drawCut(); setTool('erase');
    $('#cut-hint').textContent = 'Listo el recorte automático. Corrige con Borrar o Recuperar, o usa el Lazo para dejar solo la prenda.';
  } catch {
    setTool(cut.tool);
    if (!silent) toast('El recorte automático no funcionó con esta foto. Usa el Lazo.');
  }
}
function cutMaskIsFull() {
  const m = cut.mask; const d = m.getContext('2d').getImageData(0, 0, m.width, m.height).data;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) return false;
  return true;
}
async function finishCut() {
  const W = cut.orig.width, H = cut.orig.height;
  const out = document.createElement('canvas'); out.width = W; out.height = H; const o = out.getContext('2d');
  o.drawImage(cut.orig, 0, 0); o.globalCompositeOperation = 'destination-in'; o.drawImage(cut.mask, 0, 0);
  const full = cutMaskIsFull();
  const photo = full ? await canvasToBlob(cut.orig) : await cutoutBlob(out);
  const original = await canvasToBlob(cut.orig);
  const hex = detectColor(full ? cut.orig : out, cut.cat);
  closeCutter();
  const res = { photo, original, cutout: !full, hex };
  if (cut.onDone) cut.onDone(res);
  else openEdit({ id: null, cat: cut.cat, fit: '', name: '', colorName: nearestColor(hex).name, detected: true, photo, original, cutout: !full, open: false });
}
function closeCutter() { $('#cutter').hidden = true; document.body.style.overflow = ''; cut.pts = []; }
(function cutterEvents() {
  const cv = $('#cut-canvas');
  cv.addEventListener('pointerdown', (e) => {
    if (cut.tool === 'move') return;
    e.preventDefault(); cv.setPointerCapture(e.pointerId); cut.drawing = true; const p = cutPoint(e); cut.last = p;
    if (cut.tool === 'lasso') cut.pts = [p]; else { pushUndo(); paint(p, p); drawCut(); }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!cut.drawing) return; const p = cutPoint(e);
    if (cut.tool === 'lasso') cut.pts.push(p); else paint(cut.last, p);
    cut.last = p; drawCut();
  });
  const end = () => {
    if (!cut.drawing) return; cut.drawing = false;
    if (cut.tool === 'lasso' && cut.pts.length > 8) {
      pushUndo(); const x = cut.mask.getContext('2d'); x.save(); x.globalCompositeOperation = 'destination-in';
      x.beginPath(); x.moveTo(...cut.pts[0]); for (const p of cut.pts) x.lineTo(...p); x.closePath(); x.fillStyle = '#000'; x.fill(); x.restore();
      $('#cut-hint').textContent = 'Si quedó algo de más, usa Borrar. Si cortaste de más, Recuperar.';
    }
    cut.pts = []; drawCut();
  };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => { if (!$('#cutter').hidden) sizeCutCanvas(); });
})();

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
  const place = (zone) => { const w = WIN[zone]; const f = (n) => (n / FIG[2]).toFixed(4);
    return `left:calc(var(--fw) * ${f(w[0] - FIG[0])});top:calc(var(--fw) * ${f(w[1] - FIG[1])});width:calc(var(--fw) * ${f(w[2])})`; };
  const img = (it, zone, extra = '') => {
    const z = zone === 'dress' ? 'top' : zone;
    return `<img class="pc z-${z} ${extra} ${imgClass(it)} ${popZone === zone ? 'pop' : ''}" style="${place(zone)}" src="${photoUrl(it)}" alt="">`;
  };
  let h = `<svg class="mannequin" viewBox="${FIG.join(' ')}" aria-hidden="true">${bodySvgInner()}</svg>`;
  if (p.shoes) h += img(p.shoes, 'shoes');
  if (p.top && p.top.cat === 'dress') h += img(p.top, 'dress');
  else { if (p.bottom) h += img(p.bottom, 'bottom'); if (p.top) h += img(p.top, 'top'); }
  if (p.outer) h += img(p.outer, 'outer', isOpen(p.outer) ? 'open' : '');
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
      `<button class="cat-btn" data-pick-cat="${k}"><svg viewBox="${winOf(k).join(' ')}" aria-hidden="true"><path d="${WEAR[c.wear]}"/></svg>${c.one}</button>`).join('')}</div>
    <p class="muted small" style="margin:0">Sácate la foto con la prenda puesta, ojalá frente a un espejo y con buena luz. Después eliges qué parte de la foto conservar.</p>`);
}
let editing = null;
function fitOptions(cat) { const custom = (state.meta.customFits || {})[cat] || []; return [...new Set([...CATS[cat].fits, ...custom])]; }
function editPhotoHtml() { return `<img class="${editing.cutout ? '' : 'opaque'}" src="${editing._url}" alt="">`; }
function openEdit(item) {
  editing = { ...item }; const isNew = !item.id;
  editing._url = URL.createObjectURL(item.photo);
  const worn = item.worn || [];
  openSheet(`<h2>${isNew ? 'Nueva prenda' : esc(itemTitle(item))}</h2>
    <div class="edit-top">
      <div class="photo" id="edit-photo">${editPhotoHtml()}</div>
      <div style="display:flex;flex-direction:column;gap:12px;min-width:0">
        <label class="field"><span>Tipo</span>
          <select id="f-cat">${Object.entries(CATS).map(([k, c]) => `<option value="${k}" ${k === item.cat ? 'selected' : ''}>${c.one}</option>`).join('')}</select></label>
        <label class="field"><span>Fit / estilo</span>
          <input id="f-fit" list="fit-list" value="${esc(item.fit)}" placeholder="Ej: wide leg" autocomplete="off">
          <datalist id="fit-list">${fitOptions(item.cat).map((f) => `<option value="${esc(f)}">`).join('')}</datalist></label>
        <button class="btn btn-small btn-ghost" data-action="recrop">Ajustar recorte</button>
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
    id: editing.id || uid(), cat, fit, name, colorName: editing.colorName, photo: editing.photo, original: editing.original || null, cutout: !!editing.cutout,
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

async function recrop() {
  if (!editing) return;
  const src = editing.original || editing.photo;
  const orig = await blobToCanvas(src);
  let mask = null;
  if (editing.cutout && editing.original) {
    const cur = await blobToCanvas(editing.photo); mask = document.createElement('canvas'); mask.width = orig.width; mask.height = orig.height;
    mask.getContext('2d').drawImage(cur, 0, 0, orig.width, orig.height);
  }
  const keep = editing; $('#sheet').hidden = true; $('#sheet-backdrop').hidden = true;
  openCutter(orig, mask, $('#f-cat').value, false, (res) => {
    keep.photo = res.photo; keep.original = res.original; keep.cutout = res.cutout;
    URL.revokeObjectURL(keep._url); keep._url = URL.createObjectURL(res.photo);
    $('#edit-photo').innerHTML = editPhotoHtml(); $('#sheet').hidden = false; $('#sheet-backdrop').hidden = false;
  });
  // si cancela, vuelve a la ficha
  const restore = () => { if ($('#cutter').hidden && $('#sheet').hidden && editing) { $('#sheet').hidden = false; $('#sheet-backdrop').hidden = false; } };
  $('[data-action="cut-cancel"]').addEventListener('click', () => setTimeout(restore, 0), { once: true });
}

/* ---------- Respaldo ---------- */
function blobToDataUrl(b) { return new Promise((r) => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
async function dataUrlToBlob(u) { return (await fetch(u)).blob(); }
async function exportBackup() {
  const items = await Promise.all(state.items.filter((i) => !i.sample).map(async (i) => ({ ...i, photo: await blobToDataUrl(i.photo), original: i.original ? await blobToDataUrl(i.original) : null })));
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
    for (const i of data.items || []) await DB.put('items', { ...i, photo: await dataUrlToBlob(i.photo), original: i.original ? await dataUrlToBlob(i.original) : null });
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
  ['top', 'Polera', 'Blanco', 'top'], ['top', 'Camisa', 'Celeste', 'top'], ['top', 'Sweater', 'Burdeo', 'sweater'], ['top', 'Crop top', 'Negro', 'crop'], ['top', 'Blusa', 'Rosado', 'top'],
  ['outer', 'Chaqueta', 'Denim', 'outer'], ['outer', 'Blazer', 'Beige', 'outer'],
  ['pants', 'Wide leg', 'Negro', 'pants'], ['pants', 'Cargo', 'Verde oliva', 'pants'], ['pants', 'Recto', 'Denim', 'slim'],
  ['skirt', 'Midi', 'Camel', 'skirt'], ['dress', 'Midi', 'Lila', 'dress'],
  ['shoes', 'Zapatillas', 'Blanco', 'sneakers'], ['shoes', 'Botas', 'Negro', 'boots'],
];
function drawSample(cat, hex, shape) {
  const [W, H] = sizeFor(cat); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const w = winOf(cat); const sc = W / w[2]; x.scale(sc, sc); x.translate(-w[0], -w[1]);
  const p = new Path2D(WEAR[shape]); x.fillStyle = hex; x.fill(p);
  x.lineWidth = 2.5 / sc * 1.5; x.strokeStyle = 'rgba(0,0,0,.22)'; x.stroke(p);
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
  if (d.tool) return setTool(d.tool);
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
    case 'recrop': return recrop();
    case 'cut-cancel': closeCutter(); if (!cut.onDone) toast('Foto descartada'); return;
    case 'cut-done': return finishCut();
    case 'cut-undo': { const u = cut.undo.pop(); if (u) { cut.mask.getContext('2d').putImageData(u, 0, 0); drawCut(); } return; }
    case 'cut-auto': return runAuto(false);
    case 'cut-reset': { pushUndo(); const x = cut.mask.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, cut.mask.width, cut.mask.height); drawCut(); setTool('lasso'); return; }
    case 'cut-zoom': cut.zoom = cut.zoom >= 3 ? 1 : cut.zoom + 1; sizeCutCanvas(); drawCut(); if (cut.zoom > 1 && cut.tool !== 'move') toast('Usa Mover para recorrer la foto'); return;
    case 'cut-guide': cut.guide = !cut.guide; t.setAttribute('aria-pressed', String(cut.guide)); drawCut(); return;
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
  if (t.dataset.check) { const s = state.shopping.find((x) => x.id === t.dataset.check); s.done = t.checked; await DB.put('shopping', s); renderShop(); }
});
document.addEventListener('submit', (e) => { if (e.target.id === 'city-form') { e.preventDefault(); searchCity($('#city-input').value.trim()); } });
$('#shop-form').addEventListener('submit', async (e) => {
  e.preventDefault(); const v = $('#shop-text').value.trim(); if (!v) return; await addShop(v); $('#shop-text').value = '';
});
$('#gallery-input').addEventListener('change', async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  closeCamera();
  try { const img = await loadImage(f); openCutter(drawCover(img, img.naturalWidth, img.naturalHeight, pendingCat, false), null, pendingCat, true); }
  catch { toast('No pude abrir esa imagen.'); }
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
