// Thessaros core: helpers, the save, what the player knows, sound, the interface chrome
// (journal, map, hints, settings, keyring) and the scene runtime every room runs on.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = x => (x = clamp(x), x * x * (3 - 2 * x));
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => s.toUpperCase().replace(/[^A-Z]/g, '');
const reduced = () => S.settings.motion === 'reduce' || (S.settings.motion === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------------- the five keys ---------------- */
// Each key is drawn in its own material: a vertical gradient (lit from above) under a shared bevel that catches the light.
const KEYS = [
  { id: 'names', n: 'I', name: 'Key of Names', mat: 'carved bone', room: 'names', col: '#d9cfb8', grad: ['#fbf4e2', '#dccfb2', '#9c8c6c', '#4e4433'],
    svg: '<path d="M-39 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM-34.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0Z" fill-rule="evenodd"/><path d="M-26.5 -5.5L-18.5 -9.5L-22 -2Z"/><rect x="-22" y="-3.4" width="4" height="6.8" rx="1"/><path d="M-18 -1.8H24L27.5 0L24 1.8H-18Z"/><rect x="-7" y="-2.8" width="2" height="5.6" rx=".6"/><rect x="3" y="-2.8" width="2" height="5.6" rx=".6"/><path d="M11 1.5H14V7.5H11ZM16.5 1.5H19V5.2H16.5ZM21.5 1.5H24V9L21.5 7.6Z"/><path d="M-37.6 -3.4L-35.2 -2.6M-36.8 4.8L-34.6 3.4M-27.5 -8.6L-27 -6.1M-24.2 7.2L-25.3 5" stroke="#4e4433" stroke-width=".7"/>' },
  { id: 'chronicle', n: 'II', name: 'Key of the Chronicle', mat: 'grey slate', room: 'archive', col: '#9aa1aa', grad: ['#dfe4ea', '#9aa1ab', '#5a6069', '#22262b'],
    svg: '<path d="M-39 -9.5L-20 -9V9.5L-38.5 9ZM-34.5 -5H-24.5V5H-34.5Z" fill-rule="evenodd"/><path d="M-33 -2.5H-26M-33 0H-27.5M-33 2.5H-26" stroke="#22262b" stroke-width=".8"/><rect x="-20" y="-4.2" width="4" height="8.4"/><path d="M-16 -2.6H24V2.6H-16Z"/><path d="M6 2.6H11V9H6ZM13.5 2.6H17.5V6H13.5ZM20 2.6H24V8H20Z"/><path d="M-37 -7.5L-31 -1M-10 -2.6L-6 2.6" stroke="#22262b" stroke-width=".6"/>' },
  { id: 'coil', n: 'III', name: 'Key of the Coil', mat: 'green bronze', room: 'engine', col: '#7fb5a3', grad: ['#e2f6ea', '#94c9b3', '#4c8371', '#173229'],
    svg: '<path d="M-28 0a2 2 0 0 1 4 0a4 4 0 0 1 -8 0a6 6 0 0 1 12 0a8 8 0 0 1 -16 0" fill="none" stroke="url(#kg-coil)" stroke-width="2.6" stroke-linecap="round"/><circle cx="-19" cy="0" r="3"/><path d="M-17 -1.7H24L27.5 0L24 1.7H-17Z"/><circle cx="-2" cy="0" r="2.6"/><circle cx="6" cy="0" r="2.2"/><path d="M9 1.6L10.5 7.5H13.5L14.5 1.6ZM17 1.6L18 5.5H21L22 1.6Z"/>' },
  { id: 'rite', n: 'IV', name: 'Key of the Rite', mat: 'black mineral growth', room: 'chapel', col: '#3c4247', glow: '#4fd6c4', grad: ['#8a949b', '#3a4247', '#171b1e', '#030405'],
    svg: '<path d="M-39 0L-35 -8.5L-31.5 -4L-28 -11.5L-24 -3.5L-19.5 -7L-20 0L-19 6.5L-24.5 4L-28 10.5L-31.5 4.5L-35.5 8.5Z"/><path d="M-20 -2.2Q0 -3.6 25 -1.2L26.5 .8Q0 2.8 -20 2.2Z"/><path d="M5 1.8L7.5 9.5L10 1.8ZM13.5 1.6L15 6.5L17 1.6ZM19.5 1.4L23 9.5L24.5 1.4Z"/><circle cx="-28" cy="0" r="1.6" fill="#4fd6c4"/><circle cx="-33" cy="3" r=".8" fill="#4fd6c4"/><circle cx="-23.5" cy="-1.5" r=".7" fill="#4fd6c4"/>' },
  { id: 'gaze', n: 'V', name: 'Key of the Gaze', mat: 'dark glass', room: 'cell', col: '#2b4a4c', glow: '#5fe8d3', grad: ['#b9f2ec', '#4c9995', '#1d4446', '#071314'],
    svg: '<path d="M-40 0Q-29 -12 -18 0Q-29 12 -40 0Z"/><circle cx="-29" cy="0" r="4.2" fill="#4fd6c4"/><ellipse cx="-29" cy="0" rx="1.1" ry="3.6" fill="#020606"/><path d="M-18 -1.3H25L28 0L25 1.3H-18Z"/><path d="M9 1.3L12 9L14 1.3ZM17 1.3L19 6L21 1.3ZM23 1.3L26 7.5L27 1.3Z"/><path d="M-35 -3.5Q-30 -6.5 -24 -4" stroke="#e6fffb" stroke-width=".6" fill="none" opacity=".7"/>' },
];
const keyIcon = (k, cls = '') => `<svg class="keyicon ${cls}" viewBox="-42 -14 72 28" style="color:${k.col}" aria-hidden="true"><g fill="url(#kg-${k.id})" filter="url(#kBevel)">${k.svg}</g></svg>`;
// gradients and the bevel the key icons share, added to the page once
const keyDefs = () => `<defs>${KEYS.map(k => `<linearGradient id="kg-${k.id}" x1="0" y1="0" x2="0" y2="1">${k.grad.map((c, i) => `<stop offset="${[0, .35, .7, 1][i]}" stop-color="${c}"/>`).join('')}</linearGradient>`).join('')}
  <filter id="kBevel" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation=".9" result="b"/>
    <feSpecularLighting in="b" surfaceScale="2.4" specularConstant=".85" specularExponent="16" lighting-color="#fff6e0" result="s"><feDistantLight azimuth="250" elevation="38"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".7"/></filter></defs>`;

/* ---------------- the save ---------------- */
const SAVE_KEY = 'thessaros.v3';
const FRESH = () => ({
  v: 3, room: 'threshold', visited: {}, known: {}, flags: {}, keys: {}, letters: {}, words: {}, rules: {}, insc: {}, lore: {},
  inv: [], notes: '', puz: {}, door: { in: {}, plates: [], wheel: 3, stage: 0 }, hint: { goal: '', tier: 0 }, started: 0,
  settings: { sound: true, vol: .7, motion: 'auto', highlight: false, holdToggle: false, large: false },
});
let S = FRESH();
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && s.v === 3) { const f = FRESH(); S = { ...f, ...s, settings: { ...f.settings, ...s.settings }, door: { ...f.door, ...s.door } }; return true; }
  } catch {}
  return false;
}
// The previous version kept its campaign under 'thessaros2'. Its puzzles no longer exist, so it is never read; only noticed.
const hadOldSave = () => { try { return !!localStorage.getItem('thessaros2'); } catch { return false; } };
const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {} };
const has = f => !!S.flags[f];
const setFlag = (f, v = 1) => { S.flags[f] = v; save(); };
const keyCount = () => KEYS.filter(k => S.keys[k.id]).length;
const holding = item => S.inv.includes(item);

/* ---------------- what the player knows ---------------- */
const Know = {
  letters(str, quiet) {
    const fresh = [...str.toUpperCase()].filter(c => /[A-Z]/.test(c) && !S.letters[c]);
    fresh.forEach(c => S.letters[c] = 1); save();
    if (fresh.length && !quiet) note('Script', `Sounds learned: ${[...new Set(fresh)].join(' ')}`);
    return fresh.length;
  },
  // A word seen in context: a clue towards its meaning, never the meaning itself.
  clue(root, ctx, text) {
    const w = S.words[root] ||= { k: 0, ctx: {}, note: '' };
    if (w.ctx[ctx]) return;
    w.ctx[ctx] = text; if (w.k < 1) w.k = 1; save();
    note('Codex', `New clue for <b>${tl(root)}</b>: ${text}`);
  },
  confirm(root, quiet) {
    const w = S.words[root] ||= { k: 0, ctx: {}, note: '' };
    if (w.k === 2) return; w.k = 2; save();
    if (!quiet) note('Codex', `Confirmed: <b>${tl(root)}</b> means <i>${esc(short(root))}</i>`, 'good');
  },
  rule(id) { if (S.rules[id]) return; S.rules[id] = 1; save(); note('Grammar', RULES[id].t, 'good'); Sound.sfx('learn'); },
  lore(id) { if (S.lore[id]) return; S.lore[id] = Date.now(); save(); note('Journal', LORE[id].t); },
  // Viewing an inscription records it and makes every word in it a codex entry, even unread.
  see(id) {
    if (!S.insc[id]) { S.insc[id] = 1; save(); }
    for (const w of wordsOf(INSC[id].t)) { const a = analyze(w); if (a) S.words[a.root] ||= { k: 0, ctx: {}, note: '' }; }
  },
};
const tl = w => [...w].map(c => S.letters[c] ? c.toLowerCase() : '?').join('');
const short = root => LEX[root].m.split(/[;,]/)[0];
// What the player can say about one word right now.
function wordInfo(w) {
  const a = analyze(w), t = tl(w), lettersOK = [...w].every(c => S.letters[c]);
  if (!a || !lettersOK) return { t, known: false };
  const ws = S.words[a.root] || {}, sfxOK = a.sfx.every(s => S.rules[SUFFIX[s]]);
  let extra = '';
  if (LEX[a.root].more) for (const [f, m] of Object.entries(LEX[a.root].more)) if (has(f)) extra = f === 'name' ? ' (her)' : f === 'lid' ? ' / lid' : f === 'scale' ? ' / scale' : '';
  if (ws.k === 2 && sfxOK) return { t, known: true, g: (DERIVED[w] ? DERIVED[w].split(':')[0].split(',')[0] : short(a.root)) + extra };
  if (ws.k === 2) return { t, known: false, g: short(a.root) + a.sfx.map(s => ' -' + s.toLowerCase()).join('') + '?' };
  if (ws.note) return { t, known: false, g: `“${ws.note}”?` };
  return { t, known: false };
}
const lineKnown = text => wordsOf(text).every(w => wordInfo(w).known);
// Glyphs, transliteration and a word-by-word gloss of one inscription, as far as the player can read it.
function inscView(id, opts = {}) {
  const ins = INSC[id];
  const lines = ins.t.split('|').map(line => {
    const ws = line.split(' ').filter(w => w !== '.');
    return `<div class="iline"><div class="gl-wrap">${Glyph.svg(line, 'glyphs', 'inscription')}</div>
      <div class="gloss">${ws.map(w => { const i = wordInfo(w); return `<span class="tok${i.known ? ' k' : ''}"><i>${i.t}</i><b>${i.g ? esc(i.g) : '—'}</b></span>`; }).join('')}</div></div>`;
  }).join('');
  const whole = lineKnown(ins.t);
  const late = ins.late && has(ins.late.flag);
  return `<div class="insc" data-insc="${id}">${opts.at ? `<p class="at">${ins.at}</p>` : ''}${lines}
    ${whole ? `<p class="reading">“${late ? ins.late.read : ins.read}”</p>` : `<p class="unread">${[...ins.t].some(c => /[A-Z]/.test(c) && !S.letters[c]) ? 'Some of these signs have no sound yet.' : 'Not every word is understood yet.'}</p>`}</div>`;
}

/* ---------------- sound: every note is made live in the browser ---------------- */
const Sound = (() => {
  let ac = null, master, bus, verb, oscs = [], lp, droneG, windG, windBP, noiseBuf, timer = 0, prof = 'silent', nextEv = 0;
  const P = {
    silent:  { f: [40, 40, 60], lp: 200, d: 0, w: 0, wf: 400, ev: [], gap: [99, 99] },
    surface: { f: [41.2, 41.6, 61.7], lp: 260, d: .035, w: .1, wf: 650, ev: ['gust', 'grit'], gap: [5, 11] },
    letters: { f: [36.7, 37, 55], lp: 240, d: .06, w: .035, wf: 420, ev: ['drip', 'grit', 'far', 'chime'], gap: [4, 10] },
    ring:    { f: [32.7, 32.95, 49], lp: 220, d: .08, w: .05, wf: 300, ev: ['far', 'stone', 'drip', 'whisper', 'chime'], gap: [4, 9] },
    names:   { f: [36.7, 36.85, 58.3], lp: 300, d: .06, w: .02, wf: 900, ev: ['chime', 'grit', 'chime'], gap: [5, 10] },
    archive: { f: [34.6, 34.8, 51.9], lp: 230, d: .07, w: .03, wf: 500, ev: ['grit', 'page', 'far'], gap: [4, 9] },
    engine:  { f: [30.9, 31.4, 46.2], lp: 320, d: .09, w: .02, wf: 300, ev: ['tick', 'clank', 'far', 'tick'], gap: [2, 5] },
    cistern: { f: [29.1, 29.3, 43.7], lp: 200, d: .07, w: .04, wf: 260, ev: ['drip', 'drip', 'slosh'], gap: [1.5, 4] },
    chapel:  { f: [27.5, 27.7, 41.2], lp: 210, d: .09, w: .02, wf: 380, ev: ['bell', 'whisper', 'grit'], gap: [6, 12] },
    shrine:  { f: [26, 26.2, 39], lp: 190, d: .1, w: .03, wf: 300, ev: ['whisper', 'breath'], gap: [5, 10] },
    lower:   { f: [24.5, 24.7, 36.7], lp: 190, d: .11, w: .05, wf: 220, ev: ['breath', 'far', 'whisper', 'teal'], gap: [5, 10] },
    cell:    { f: [23.1, 23.3, 34.6], lp: 200, d: .11, w: .02, wf: 240, ev: ['teal', 'whisper', 'breath'], gap: [5, 9] },
    door:    { f: [21.8, 22, 32.7], lp: 170, d: .13, w: .04, wf: 180, ev: ['breath', 'stone'], gap: [7, 13] },
    abyss:   { f: [18.4, 18.6, 27.5], lp: 120, d: .2, w: .02, wf: 140, ev: [], gap: [99, 99] },
  };
  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = 0; master.connect(comp);
    bus = ac.createGain(); bus.connect(master);
    const n = ac.sampleRate * 4, ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2.6; }
    verb = ac.createConvolver(); verb.buffer = ir; verb.connect(bus);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    // the bed: one drone and one wind, built once and retuned per room so nothing piles up
    droneG = G(0); send(droneG, .35); lp = filt('lowpass', 220, 3, droneG);
    oscs = [0, 1, 2].map(i => { const o = ac.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.frequency.value = 40; o.connect(lp); o.start(); return o; });
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .045; lg.gain.value = 90; lfo.connect(lg).connect(lp.frequency); lfo.start();
    windG = G(0); send(windG, .4); windBP = filt('bandpass', 400, .8, windG);
    const ws = ac.createBufferSource(); ws.buffer = noiseBuf; ws.loop = true; ws.connect(windBP); ws.start();
    const wl = ac.createOscillator(), wlg = ac.createGain(); wl.frequency.value = .07; wlg.gain.value = .5; wl.connect(wlg).connect(windG.gain); wl.start();
    timer = setInterval(tick, 250);
  }
  const G = (v, dest = bus) => { const g = ac.createGain(); g.gain.value = v; g.connect(dest); return g; };
  const send = (node, amt) => node.connect(G(amt, verb));
  function filt(type, f, q, dest) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
  function env(g, t, a, peak, d) { const p = g.gain; p.setValueAtTime(.0001, t); p.exponentialRampToValueAtTime(peak, t + a); p.exponentialRampToValueAtTime(.0001, t + a + d); }
  function tone(type, f, t, dur, dest, detune = 0) { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune; o.connect(dest); o.start(t); o.stop(t + dur + .1); return o; }
  function noise(t, dur, dest) { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.connect(dest); s.start(t, Math.random()); s.stop(t + dur); }
  const SCALE = [146.8, 155.6, 196, 207.7, 233.1, 293.7, 311.1];
  const EV = {
    drip(t) { const g = G(0); env(g, t, .003, .12, .25); send(g, .9); const o = tone('sine', 900 + Math.random() * 900, t, .3, g); o.frequency.exponentialRampToValueAtTime(380, t + .12); },
    grit(t) { const g = G(0); env(g, t, .05, .05, 1.2); noise(t, 1.3, filt('highpass', 2500 + Math.random() * 2000, .7, g)); },
    far(t) { const g = G(0); env(g, t, .02, .4, 2.2); send(g, 1.2); const o = tone('sine', 60, t, 2.4, g); o.frequency.exponentialRampToValueAtTime(28, t + 1.5); noise(t, .6, filt('lowpass', 200, 1, g)); },
    stone(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.18, t + .6); g.gain.linearRampToValueAtTime(.0001, t + 2.4); send(g, .7);
      const b = filt('lowpass', 300, 4, g); b.frequency.setValueAtTime(160, t); b.frequency.linearRampToValueAtTime(420, t + 1.2); b.frequency.linearRampToValueAtTime(140, t + 2.4); noise(t, 2.5, b); },
    whisper(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.07, t + .9); g.gain.linearRampToValueAtTime(.0001, t + 2.6); send(g, .9);
      const pan = ac.createStereoPanner(); pan.pan.value = Math.random() * 2 - 1; pan.connect(g);
      for (const [f, q] of [[700 + Math.random() * 500, 9], [1900 + Math.random() * 800, 12]]) { const b = filt('bandpass', f, q, pan); b.frequency.linearRampToValueAtTime(f * .6, t + 2.6); noise(t, 2.7, b); } },
    chime(t) { const f = SCALE[Math.random() * SCALE.length | 0] * (Math.random() < .5 ? 1 : 2); for (const [r, v] of [[1, .045], [2.76, .015], [5.4, .007]]) { const g = G(0); env(g, t, .004, v, 5 / r ** .3); send(g, 1.1); tone('sine', f * r, t, 6, g); } },
    tick(t) { for (let i = 0; i < 3; i++) { const g = G(0); env(g, t + i * .42, .001, .09, .06); noise(t + i * .42, .08, filt('bandpass', 1400 + i * 300, 8, g)); } },
    clank(t) { const g = G(0); env(g, t, .002, .16, .9); send(g, .9); noise(t, .5, filt('bandpass', 1100, 16, g)); tone('triangle', 92, t, .9, g); },
    slosh(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.06, t + .5); g.gain.linearRampToValueAtTime(.0001, t + 1.6); noise(t, 1.7, filt('lowpass', 500, 2, g)); },
    bell(t) { for (const [r, v] of [[1, .09], [2.4, .04], [3.9, .02], [.5, .05]]) { const g = G(0); env(g, t, .006, v, 7 / r ** .4); send(g, 1.2); tone('sine', 98 * r, t, 8, g, (Math.random() - .5) * 8); } },
    breath(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.16, t + 2.5); g.gain.linearRampToValueAtTime(.0001, t + 6); send(g, .5); noise(t, 6.1, filt('lowpass', 110, 2, g)); },
    teal(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.018, t + 1.2); g.gain.linearRampToValueAtTime(.0001, t + 4); send(g, 1.4);
      tone('sine', 1760 + Math.random() * 300, t, 4, g); tone('sine', 1763 + Math.random() * 300, t, 4, g); },
    gust(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.1, t + 1.5); g.gain.linearRampToValueAtTime(.0001, t + 4); const b = filt('bandpass', 500, 1.2, g); b.frequency.linearRampToValueAtTime(900, t + 2); noise(t, 4.1, b); },
    page(t) { const g = G(0); env(g, t, .01, .05, .25); noise(t, .3, filt('highpass', 3500, .6, g)); },
  };
  function tick() {
    if (!ac || ac.state !== 'running') return;
    const p = P[prof], t = ac.currentTime;
    if (p.ev.length && t > nextEv) {
      EV[p.ev[Math.random() * p.ev.length | 0]](t + .05);
      nextEv = t + p.gap[0] + Math.random() * (p.gap[1] - p.gap[0]);
    }
  }
  function setProfile(name, glide = 2.5) {
    prof = P[name] ? name : 'silent';
    if (!ac) return;
    const p = P[prof], t = ac.currentTime;
    p.f.forEach((f, i) => oscs[i].frequency.setTargetAtTime(f, t, glide / 3));
    lp.frequency.setTargetAtTime(p.lp, t, glide / 3);
    droneG.gain.setTargetAtTime(p.d, t, glide / 3);
    windG.gain.setTargetAtTime(p.w, t, glide / 3); windBP.frequency.setTargetAtTime(p.wf, t, glide / 3);
    nextEv = t + 1.5;
  }
  function applyVolume() { if (ac) master.gain.setTargetAtTime(S.settings.sound ? S.settings.vol * .8 : 0, ac.currentTime, .3); }
  function start() {
    if (!ac) { try { init(); } catch { return; } }
    ac.resume(); applyVolume(); setProfile(prof);
  }
  // Short sounds for things the player does.
  function sfx(kind) {
    if (!ac || ac.state !== 'running') return;
    const t = ac.currentTime + .01, g = G(0);
    switch (kind) {
      case 'tick': env(g, t, .001, .14, .07); noise(t, .09, filt('bandpass', 2600, 6, g)); break;
      case 'deny': env(g, t, .02, .22, .6); { const l = filt('lowpass', 300, 6, g); tone('sawtooth', 55, t, .7, l); tone('sawtooth', 58.3, t, .7, l); } break;
      case 'good': for (const [f, d] of [[293.7, 0], [440, .12], [587.3, .26]]) { const h = G(0); env(h, t + d, .005, .06, 1.6); send(h, .9); tone('sine', f, t + d, 1.8, h); } break;
      case 'learn': { const h = G(0); env(h, t, .01, .045, 2.2); send(h, 1.2); tone('sine', 587.3, t, 2.3, h); tone('sine', 880.6, t + .08, 2.2, h); } break;
      case 'step': env(g, t, .005, .14, .12); noise(t, .14, filt('lowpass', 240, 1, g)); break;
      case 'grind': g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.3, t + .15); g.gain.linearRampToValueAtTime(.0001, t + .7); noise(t, .75, filt('lowpass', 380, 3, g)); break;
      case 'clank': env(g, t, .002, .35, .7); send(g, .6); noise(t, .4, filt('bandpass', 1800, 12, g)); tone('triangle', 130, t, .3, g).frequency.exponentialRampToValueAtTime(60, t + .25); break;
      case 'key': for (const [f, d] of [[392, 0], [587.3, .15], [784, .32], [1174.7, .5]]) { const h = G(0); env(h, t + d, .005, .05, 2.5); send(h, 1.2); tone('sine', f, t + d, 2.6, h); } break;
      case 'page': env(g, t, .01, .08, .2); noise(t, .25, filt('highpass', 3000, .7, g)); break;
      case 'whoosh': g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.12, t + .35); g.gain.linearRampToValueAtTime(.0001, t + .9); { const b = filt('bandpass', 300, 1.5, g); b.frequency.exponentialRampToValueAtTime(1400, t + .4); b.frequency.exponentialRampToValueAtTime(200, t + .9); noise(t, .95, b); } break;
      case 'stone': EV.stone(t); break;
      case 'boom': env(g, t, .05, .7, 4); send(g, .6); tone('sine', 46, t, 4.2, g).frequency.exponentialRampToValueAtTime(18, t + 3.8); noise(t, 3, filt('lowpass', 130, 1, g)); break;
      case 'rumble': g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.45, t + 2); g.gain.linearRampToValueAtTime(.0001, t + 7); send(g, .5);
        noise(t, 7.1, filt('lowpass', 70, 1.5, g)); tone('sine', 31, t, 7, g); break;
      case 'resonance': g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.16, t + 3); g.gain.linearRampToValueAtTime(.0001, t + 9); send(g, 1);
        { const l = filt('lowpass', 260, 7, g), v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 3.3; vg.gain.value = 6; v.connect(vg);
          for (const f of [55, 55.7, 82.6]) { const o = tone('sawtooth', f, t, 9, l); vg.connect(o.frequency); } v.start(t); v.stop(t + 9.2); } break;
      case 'eye': g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.14, t + 4); g.gain.linearRampToValueAtTime(.0001, t + 12); send(g, 1.4);
        for (const f of [36.7, 55, 73.4, 110, 164.8]) tone('sine', f, t, 12, g, (Math.random() - .5) * 6); break;
      case 'hum': env(g, t, .3, .08, 2.5); send(g, .8); tone('sine', 220, t, 2.8, g); tone('sine', 221.5, t, 2.8, g); break;
      case 'whisper': EV.whisper(t); break; case 'drip': EV.drip(t); break; case 'chime': EV.chime(t); break; case 'bell': EV.bell(t); break; case 'teal': EV.teal(t); break; case 'breath': EV.breath(t); break;
      // the sounds of her: a heart too big to belong to anything, a lid, a hiss, and the moment she comes at you
      case 'heart': for (const [d, v] of [[0, .55], [.27, .36]]) { const h = G(0); env(h, t + d, .006, v, .32); send(h, .25);
        tone('sine', 64, t + d, .4, h).frequency.exponentialRampToValueAtTime(30, t + d + .2); noise(t + d, .06, filt('lowpass', 160, 1, h)); } break;
      case 'blink': env(g, t, .004, .05, .14); noise(t, .16, filt('bandpass', 700, 2.5, g)); break;
      case 'hiss': { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.22, t + .12); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6); send(g, .7);
        const p = ac.createStereoPanner(); p.pan.value = Math.random() * 1.6 - .8; p.connect(g); const b = filt('bandpass', 5200, .9, p); b.frequency.linearRampToValueAtTime(3400, t + 1.5); noise(t, 1.7, filt('highpass', 2200, .7, b)); } break;
      case 'riser': { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + 1.5); g.gain.linearRampToValueAtTime(.0001, t + 1.62); send(g, .6);
        const b = filt('bandpass', 200, 3, g); b.frequency.exponentialRampToValueAtTime(4200, t + 1.55); noise(t, 1.65, b);
        for (const f of [220, 233, 247]) { const o = tone('sawtooth', f, t, 1.6, filt('lowpass', 2500, 1, g)); o.frequency.exponentialRampToValueAtTime(f * 4, t + 1.55); } } break;
      case 'lunge': { env(g, t, .008, .9, 3.2); send(g, .9); tone('sine', 52, t, 3.4, g).frequency.exponentialRampToValueAtTime(19, t + 2.8);
        noise(t, 1.4, filt('lowpass', 520, 1, g));
        const sg = G(0); env(sg, t, .01, .16, 2.4); send(sg, 1.4); const sb = filt('bandpass', 1900, 2, sg);
        for (const f of [880, 932, 988, 1047, 1109]) tone('sawtooth', f, t, 2.5, sb, (Math.random() - .5) * 30).frequency.exponentialRampToValueAtTime(f * .42, t + 2.3); } break;
      // the easter egg: her jaws coming at you, and closing
      case 'roar': { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.7, t + .45); g.gain.setValueAtTime(.7, t + .62); g.gain.linearRampToValueAtTime(.0001, t + .66); send(g, .4);
        const ws = ac.createWaveShaper(); ws.curve = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh((i / 512 - 1) * 9)); ws.connect(filt('lowpass', 1800, 1, g));
        for (const f of [48, 51, 72, 97]) tone('sawtooth', f, t, .7, ws).frequency.exponentialRampToValueAtTime(f * 2.2, t + .6);
        const b = filt('bandpass', 300, 1.5, g); b.frequency.exponentialRampToValueAtTime(2400, t + .6); noise(t, .68, b);
        const sg = G(0); sg.gain.setValueAtTime(.0001, t); sg.gain.exponentialRampToValueAtTime(.2, t + .5); sg.gain.linearRampToValueAtTime(.0001, t + .66);
        for (const f of [1320, 1397, 1480]) tone('sawtooth', f, t, .7, filt('bandpass', 2600, 2, sg)).frequency.exponentialRampToValueAtTime(f * 1.6, t + .6); } break;
      case 'bite': { env(g, t, .003, 1, 2.6); send(g, .8); tone('sine', 74, t, 2.8, g).frequency.exponentialRampToValueAtTime(22, t + 2.2); tone('square', 41, t, .25, filt('lowpass', 300, 1, g));
        for (let i = 0; i < 7; i++) { const c = G(0); env(c, t + i * .028, .001, .55 - i * .05, .07); noise(t + i * .028, .1, filt('bandpass', 1400 + Math.random() * 1800, 2.5, c)); } } break;
      case 'flick': for (const d of [0, .08, .15]) { const c = G(0); env(c, t + d, .001, .1, .05); noise(t + d, .07, filt('bandpass', 4200, 4, c)); } break;
      case 'rattle': { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.32, t + 1); g.gain.linearRampToValueAtTime(.0001, t + 1.12); send(g, .5);
        const am = G(.5, g), l = ac.createOscillator(), lg = ac.createGain(); l.type = 'square'; l.frequency.setValueAtTime(18, t); l.frequency.linearRampToValueAtTime(34, t + 1); lg.gain.value = .5; l.connect(lg).connect(am.gain); l.start(t); l.stop(t + 1.2);
        noise(t, 1.15, filt('bandpass', 4800, 1, am)); } break;
      case 'crunch': { env(g, t, .002, .8, 1.4); send(g, .6); tone('sine', 60, t, 1.5, g).frequency.exponentialRampToValueAtTime(24, t + 1);
        for (let i = 0; i < 10; i++) { const c = G(0), d = i * .022 + Math.random() * .01; env(c, t + d, .001, .6 - i * .04, .06); noise(t + d, .08, filt('bandpass', 900 + Math.random() * 2600, 3, c)); } } break;
      case 'gulp': for (const d of [0, .55]) { const c = G(0); env(c, t + d, .05, .5, .6); send(c, .3); tone('sine', 130, t + d, .7, filt('lowpass', 300, 2, c)).frequency.exponentialRampToValueAtTime(38, t + d + .55); noise(t + d, .5, filt('lowpass', 180, 1, c)); } break;
    }
  }
  /* the score for the deep: built when you step through the Door, torn down when you leave */
  let sc = null;
  function score(cmd, o = {}) {
    if (!ac) return;
    const t = ac.currentTime;
    if (cmd === 'stop') { if (!sc) return; const s = sc; sc = null; clearInterval(s.iv); s.out.gain.setTargetAtTime(0, t, .5); setTimeout(() => s.all.forEach(n => { try { n.stop(); } catch {} }), 3000); return; }
    if (cmd === 'set') { if (!sc) return; const k = (n, v) => n.gain.setTargetAtTime(v, t, .4), x = o.tension ?? 0;
      k(sc.growl, .015 + .16 * x); k(sc.str, .02 * x * x); k(sc.choir, .07 * (o.choir ?? 0)); k(sc.shG, o.shep ?? 0); sc.tension = x; return; }
    if (sc) score('stop');
    const out = G(0), all = []; out.gain.setTargetAtTime(1, t, 1.5); send(out, .5);
    const osc = (type, f, dest, det = 0) => { const n = tone(type, f, t, 3600, dest, det); all.push(n); return n; };
    const lfo = (f, amt, param) => { const n = ac.createOscillator(), a = ac.createGain(); n.frequency.value = f; a.gain.value = amt; n.connect(a).connect(param); n.start(t); all.push(n); };
    // the floor of the world: sines a hair apart, beating slower than breath
    const sub = filt('lowpass', 80, .7, G(.3, out)); [27.5, 27.62, 41.2].forEach(f => osc('sine', f, sub));
    // her growl: saws through a hard saturator, under a lowpass that breathes
    const growl = G(0, out), gl = filt('lowpass', 150, 6, growl), ws = ac.createWaveShaper();
    ws.curve = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh((i / 512 - 1) * 6)); ws.connect(gl);
    [36.7, 36.93, 55.1].forEach(f => osc('sawtooth', f, ws)); lfo(.11, 70, gl.frequency);
    // a choir with no throats: saws through three vowel formants that drift between ah and oo
    const choir = G(0, out); send(choir, 1.4); const voice = ac.createGain(); voice.gain.value = .5;
    const forms = [[650, 1], [1080, .5], [2650, .22]].map(([f, v]) => { const b = filt('bandpass', f, 9, G(v * 4, choir)); voice.connect(b); return b; });
    lfo(.05, 260, forms[0].frequency); lfo(.07, 380, forms[1].frequency);
    [73.42, 110, 146.83, 155.56, 220, 233.08].forEach((f, i) => lfo(4.4 + i * .27, f * .007, osc('sawtooth', f, voice, i % 2 ? -8 : 8).frequency));
    // strings at the edge of hearing: a tight cluster, trembling
    const str = G(0, out); send(str, 1); const tr = G(.5, str); lfo(7.3, .45, tr.gain);
    const sb = filt('bandpass', 1500, 1.1, tr); [1174.7, 1244.5, 1318.5, 1396.9].forEach(f => osc('sawtooth', f, sb, (Math.random() - .5) * 24));
    // the endless descent: a falling tone that never arrives anywhere
    const shG = G(0, out); send(shG, 1.2); const shl = filt('lowpass', 2200, .5, shG);
    const shep = Array.from({ length: 7 }, (_, i) => { const a = G(0, shl); return { o: osc('sine', 100, a), a, i }; });
    sc = { out, all, growl, choir, str, shG, tension: 0, ph: 0, last: t, next: t + 6 };
    sc.iv = setInterval(() => {
      const s = sc; if (!s || ac.state !== 'running') return;
      const now = ac.currentTime; s.ph = (s.ph + (now - s.last) * .02) % 1; s.last = now;
      for (const v of s.shep || shep) { const p = ((v.i / 7 - s.ph) % 1 + 1) % 1, f = 30 * 2 ** (p * 7), cur = v.o.frequency.value;
        if (Math.abs(Math.log2(f / cur)) > 1) v.o.frequency.setValueAtTime(f, now); else v.o.frequency.setTargetAtTime(f, now, .05);
        v.a.gain.setTargetAtTime(Math.sin(Math.PI * p) ** 2 * .04, now, .05); }
      // voices, when she is close
      if (s.tension > .3 && now > s.next) { EV.whisper(now + .05); if (Math.random() < .5) EV.whisper(now + .4); s.next = now + 1.5 + Math.random() * 6 * (1.2 - s.tension); }
    }, 60);
  }
  return { start, setProfile, sfx, score, applyVolume, get on() { return !!ac && S.settings.sound; } };
})();

/* ---------------- small interface pieces ---------------- */
function note(tag, html, cls = '') {
  const n = document.createElement('div'); n.className = 'note ' + cls; n.setAttribute('role', 'status');
  n.innerHTML = `<b>${tag}</b> ${html}`; $('#notes').append(n);
  if (tag === 'Codex' || tag === 'Script') Sound.sfx('learn');
  setTimeout(() => n.classList.add('out'), 5200); setTimeout(() => n.remove(), 6200);
  while ($('#notes').children.length > 4) $('#notes').firstChild.remove();
}
function say(text) { note('', text, 'plain'); }
function shake(el) { if (!el) return; el.classList.remove('shake'); void el.getBoundingClientRect(); el.classList.add('shake'); }
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" class="ic">${{
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14"/>',
  book: '<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
  hint: '<path d="M12 3a6 6 0 0 1 3.5 10.9V17h-7v-3.1A6 6 0 0 1 12 3z M9.5 20h5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  snd: '<path d="M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a8 8 0 0 1 0 11"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z M16 9l5 6 M21 9l-5 6"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
}[name]}</svg>`;

/* ---------------- the inspect panel ---------------- */
// {title, text, insc:[ids], actions:[{label, fn, primary, off}], art}
const Panel = {
  open(p) {
    const el = $('#panel');
    for (const id of p.insc || []) Know.see(id);
    el.innerHTML = `<button class="x" type="button" aria-label="Close">${icon('close')}</button>
      ${p.tag ? `<p class="tag">${p.tag}</p>` : ''}<h2>${p.title}</h2>${p.art || ''}<div class="txt">${p.text || ''}</div>
      ${(p.insc || []).map(id => inscView(id)).join('')}
      ${p.actions?.length ? `<div class="acts">${p.actions.map((a, i) => `<button type="button" data-a="${i}" class="${a.primary ? 'pri' : ''}" ${a.off ? 'disabled' : ''}>${a.label}</button>`).join('')}</div>` : ''}`;
    el.hidden = false; el.scrollTop = 0; this.cur = p;
    $('.x', el).onclick = () => this.close();
    $$('[data-a]', el).forEach(b => b.onclick = () => { const a = p.actions[+b.dataset.a]; if (a.keep !== true) this.close(); a.fn(); });
    Sound.sfx('page');
    requestAnimationFrame(() => ($('[data-a]', el) || $('.x', el)).focus({ preventScroll: true }));
  },
  close() { const el = $('#panel'); if (el.hidden) return; el.hidden = true; this.cur = null; Scene.refocus(); },
};

/* ---------------- the examine view: close-ups of mechanisms ---------------- */
const Exam = {
  cur: null,
  open(o) {
    this.close(true);
    Panel.close();
    const el = $('#exam');
    el.innerHTML = `<div class="exhead"><div><p class="tag">${o.tag || 'Close look'}</p><h2>${o.title}</h2></div>
      <button class="x" type="button" aria-label="Step back">${icon('close')}<span>Step back</span></button></div><div class="exbody"></div>`;
    el.hidden = false; this.cur = o;
    $('.x', el).onclick = () => this.close();
    o.build($('.exbody', el));
    Sound.sfx('whoosh');
    requestAnimationFrame(() => ($('.exbody [tabindex], .exbody button', el) || $('.x', el)).focus({ preventScroll: true }));
  },
  close(silent) {
    const el = $('#exam'), o = this.cur; if (!o) return;
    this.cur = null; o.onClose?.(); el.hidden = true; el.innerHTML = '';
    if (!silent) { Scene.render(); Scene.refocus(); }
  },
};

/* ---------------- modal sheets: journal, map, settings ---------------- */
const Sheet = {
  open(name, build) {
    Panel.close();
    const el = $('#sheet');
    el.dataset.kind = name; el.hidden = false;
    el.innerHTML = `<div class="sheetbox" role="dialog" aria-modal="true" aria-label="${name}"><button class="x" type="button" aria-label="Close">${icon('close')}</button><div class="sheetin"></div></div>`;
    $('.x', el).onclick = () => this.close();
    el.onclick = e => { if (e.target === el) this.close(); };
    build($('.sheetin', el)); Sound.sfx('page');
    requestAnimationFrame(() => $('.x', el).focus({ preventScroll: true }));
  },
  close() { const el = $('#sheet'); if (el.hidden) return; el.hidden = true; el.innerHTML = ''; Scene.refocus(); },
};

/* ---------------- the journal and codex ---------------- */
const Journal = {
  tab: 'insc',
  open(tab) { if (tab) this.tab = tab; Sheet.open('Journal', el => this.build(el)); },
  build(el) {
    const tabs = [['insc', 'Inscriptions'], ['words', 'Words'], ['script', 'Script'], ['grammar', 'Grammar'], ['notes', 'Field notes']];
    el.innerHTML = `<p class="tag">Field journal</p><h2>The Codex of Thessaros</h2>
      <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" type="button" data-t="${k}" aria-selected="${k === this.tab}">${t}</button>`).join('')}</div>
      <div class="tabpanel" role="tabpanel"></div>`;
    $$('[role=tab]', el).forEach(b => b.onclick = () => { this.tab = b.dataset.t; this.build(el); Sound.sfx('tick'); });
    this[this.tab]($('.tabpanel', el));
  },
  insc(el) {
    const ids = Object.keys(INSC).filter(id => S.insc[id]);
    if (!ids.length) { el.innerHTML = '<p class="empty">You have copied no inscriptions yet. Look closely at the walls.</p>'; return; }
    el.innerHTML = `<p class="lead">Every line you have copied, read with what you know now. Tap a sign to compare it with the others.</p>` +
      ids.map(id => inscView(id, { at: true })).join('');
  },
  words(el) {
    const roots = Object.keys(S.words).filter(r => LEX[r]);
    if (!roots.length) { el.innerHTML = '<p class="empty">No words yet.</p>'; return; }
    const forms = r => [...new Set(Object.keys(INSC).filter(id => S.insc[id]).flatMap(id => wordsOf(INSC[id].t)).filter(w => analyze(w)?.root === r && w !== r))];
    const order = roots.sort((a, b) => (S.words[b].k - S.words[a].k) || a.localeCompare(b));
    el.innerHTML = `<p class="lead">Confirmed meanings are marked. Everything else is a clue, and your own guess is yours to keep.</p><div class="lex">${order.map(r => {
      const w = S.words[r], readable = [...r].every(c => S.letters[c]);
      const more = LEX[r].more ? Object.entries(LEX[r].more).filter(([f]) => has(f)).map(([, m]) => `<p class="more">${m}</p>`).join('') : '';
      return `<div class="entry k${w.k}">${Glyph.svg(r)}<div><h3>${tl(r)} <span class="st">${w.k === 2 ? 'confirmed' : w.k === 1 ? 'clues' : 'unread'}</span></h3>
        ${w.k === 2 ? `<p class="m">${LEX[r].m}</p>${more}` : ''}
        ${Object.values(w.ctx || {}).map(c => `<p class="ctx">${c}</p>`).join('')}
        ${forms(r).length ? `<p class="forms">Seen as ${forms(r).map(f => `<i>${tl(f)}</i>`).join(', ')}</p>` : ''}
        ${w.k < 2 && readable ? `<label class="guess">Your guess <input data-w="${r}" value="${esc(w.note || '')}" maxlength="40" placeholder="what might it mean?"></label>` : ''}</div></div>`;
    }).join('')}</div>`;
    $$('input[data-w]', el).forEach(i => i.oninput = () => { S.words[i.dataset.w].note = i.value.trim(); save(); });
  },
  script(el) {
    const seen = new Set(Object.keys(INSC).filter(id => S.insc[id]).flatMap(id => [...INSC[id].t]));
    if (has('abcSeen')) Glyph.ROWS.join('').split('').forEach(c => seen.add(c));
    el.innerHTML = `<p class="lead">The serpent signs you have recorded. ${has('alphabet') ? '' : 'Signs without a sound are marked ?.'}</p>
      <table class="abc">${Glyph.ROWS.map(row => `<tr>${[...row].map(c => `<td class="${seen.has(c) ? '' : 'unseen'}">${seen.has(c) ? Glyph.svg(c) : ''}<b>${seen.has(c) ? (S.letters[c] ? c : '?') : ''}</b></td>`).join('')}</tr>`).join('')}</table>`;
  },
  grammar(el) {
    const ids = Object.keys(RULES).filter(r => S.rules[r]);
    el.innerHTML = ids.length ? ids.map(r => `<div class="rule"><h3>${RULES[r].t}</h3><p>${RULES[r].d}</p></div>`).join('') : '<p class="empty">You have not worked out any rules of the Tongue yet.</p>';
  },
  notes(el) {
    const ids = Object.keys(LORE).filter(id => S.lore[id]).sort((a, b) => S.lore[a] - S.lore[b]);
    el.innerHTML = `${ids.map(id => `<div class="lore"><h3>${LORE[id].t}</h3><p>${LORE[id].d}</p></div>`).join('') || '<p class="empty">Nothing noted yet.</p>'}
      <label class="mynotes">Your own notes<textarea rows="6" placeholder="Write anything: a pattern, a guess, a worry.">${esc(S.notes)}</textarea></label>`;
    $('textarea', el).oninput = e => { S.notes = e.target.value; save(); };
  },
};
// tapping a sign anywhere compares it with every inscription you have copied
document.addEventListener('click', e => {
  const g = e.target.closest('.insc .gl'); if (!g) return;
  const l = g.dataset.l, pop = $('#gpop');
  if (l === '.') { pop.innerHTML = '<b>◆</b> The diamond. It falls where a thought ends.'; }
  else {
    const where = Object.keys(INSC).filter(id => S.insc[id] && INSC[id].t.includes(l));
    const count = where.reduce((n, id) => n + [...INSC[id].t].filter(c => c === l).length, 0);
    pop.innerHTML = `<svg viewBox="-1 -1 13 21" class="glyphs">${`<path d="${Glyph.path(l)}"/>`}</svg><div><b>${S.letters[l] ? `Sounds like “${l}”` : 'Sound unknown'}</b>
      <span>${count} time${count === 1 ? '' : 's'} in ${where.length} inscription${where.length === 1 ? '' : 's'} you have copied.</span></div>`;
  }
  const r = g.getBoundingClientRect();
  pop.hidden = false; pop.style.left = clamp(r.left + r.width / 2 - 130, 8, innerWidth - 268) + 'px'; pop.style.top = (r.bottom + 8 > innerHeight - 90 ? r.top - 80 : r.bottom + 8) + 'px';
  $$('.gl.hit').forEach(x => x.classList.remove('hit')); $$(`.insc .gl[data-l="${l}"]`).forEach(x => x.classList.add('hit'));
  clearTimeout(pop.t); pop.t = setTimeout(() => { pop.hidden = true; $$('.gl.hit').forEach(x => x.classList.remove('hit')); }, 4200);
  e.stopPropagation();
});

/* ---------------- the map ---------------- */
// Drawn as a plan from above. The rings sit inside an almond whose meaning the player only learns in the last chamber.
const MAP = {
  threshold: [20, 150, 'Threshold'], letters: [64, 150, 'Hall of Letters'], upper: [112, 150, 'Upper Ring'],
  names: [168, 84, 'Hall of Names'], archive: [250, 86, 'Hall of Words'], stacks: [300, 60, 'The Stacks'],
  middle: [150, 150, 'Middle Ring'], engine: [186, 112, 'Engine of Sleep'], cistern: [222, 98, 'Cistern'],
  chapel: [196, 194, 'Chapel of the Rite'], shrine: [150, 212, 'Feeders’ Shrine'],
  lower: [180, 150, 'Lower Ring'], cell: [234, 168, 'Cell of Ishvel'], stair: [104, 222, 'Keepers’ Stair'],
  door: [214, 150, 'Door at the End'], abyss: [246, 150, 'Below'],
};
const EDGES = [['threshold', 'letters'], ['letters', 'upper'], ['upper', 'names'], ['upper', 'archive'], ['archive', 'stacks'], ['upper', 'middle'],
  ['middle', 'engine'], ['engine', 'cistern'], ['middle', 'chapel'], ['middle', 'shrine'], ['middle', 'lower'], ['lower', 'cell'], ['lower', 'stair'], ['stair', 'letters'], ['lower', 'door'], ['door', 'abyss']];
const MapView = {
  open() {
    Sheet.open('Map', el => {
      const vis = id => S.visited[id], kn = id => S.visited[id] || S.known[id];
      const eye = has('lid');
      el.innerHTML = `<p class="tag">Plan from above</p><h2>Thessaros</h2>
        <svg class="plan" viewBox="0 0 330 290" role="group" aria-label="Map of discovered places">
          <path class="lidline ${eye ? 'on' : ''}" d="M8 150Q170 -10 322 150Q170 310 8 150Z"/>
          <ellipse class="ringline" cx="214" cy="150" rx="104" ry="70"/><ellipse class="ringline" cx="214" cy="150" rx="66" ry="44"/><ellipse class="ringline" cx="214" cy="150" rx="36" ry="24"/>
          ${eye ? '<circle class="pupil" cx="214" cy="150" r="16"/>' + Array.from({ length: 9 }, (_, i) => { const x = 40 + i * 32; return `<path class="lash" d="M${x} ${150 - Math.sin((x - 8) / 314 * Math.PI) * 79}l${(i - 4) * 2} -12"/>`; }).join('') : ''}
          ${EDGES.filter(([a, b]) => kn(a) && kn(b) && (vis(a) || vis(b))).map(([a, b]) => `<line class="edge" x1="${MAP[a][0]}" y1="${MAP[a][1]}" x2="${MAP[b][0]}" y2="${MAP[b][1]}"/>`).join('')}
          ${Object.entries(MAP).filter(([id]) => kn(id)).map(([id, [x, y, n]]) => `<g class="mnode ${vis(id) ? 'vis' : 'unv'} ${S.room === id ? 'here' : ''}" ${vis(id) && S.room !== id ? `tabindex="0" role="button" aria-label="Go to ${n}"` : ''} data-go="${id}" transform="translate(${x} ${y})">
            <circle r="${id === 'door' ? 7 : 5}"/>${KEYS.some(k => k.room === id && S.keys[k.id]) ? '<circle class="kd" r="2"/>' : ''}<text y="${y > 200 ? 14 : -9}">${vis(id) ? n : '?'}</text></g>`).join('')}
        </svg>
        <p class="lead">${eye ? 'Drawn from above, the temple has the shape it always had: a closed eye. You walked its lid.' : 'Tap a place you have been to return there.'}</p>`;
      const goNode = n => { if (!n || !S.visited[n.dataset.go] || n.dataset.go === S.room) return; Sheet.close(); Scene.go(n.dataset.go); };
      $('svg', el).onclick = e => goNode(e.target.closest('.mnode'));
      $('svg', el).onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNode(e.target.closest('.mnode')); } };
    });
  },
};

/* ---------------- hints ---------------- */
const Hints = {
  open() {
    const h = currentHint();
    if (S.hint.goal !== h.goal) S.hint = { goal: h.goal, tier: 0 };
    Sheet.open('Hint', el => {
      const draw = () => {
        el.innerHTML = `<p class="tag">A thought</p><h2>${h.title}</h2>${h.tiers.slice(0, S.hint.tier + 1).map((t, i) => `<p class="hint t${i}">${t}</p>`).join('')}
          ${S.hint.tier < h.tiers.length - 1 ? '<button type="button" class="more">Think harder</button>' : '<p class="etch">That is all the help the stones will give.</p>'}`;
        const m = $('.more', el); if (m) m.onclick = () => { S.hint.tier++; save(); draw(); Sound.sfx('tick'); m.blur(); };
      };
      draw();
    });
  },
};

/* ---------------- settings ---------------- */
const Settings = {
  open() {
    Sheet.open('Settings', el => {
      const st = S.settings;
      el.innerHTML = `<p class="tag">Settings</p><h2>Lamp and Ear</h2>
        <label class="row"><input type="checkbox" data-s="sound" ${st.sound ? 'checked' : ''}> Sound</label>
        <label class="row">Volume <input type="range" min="0" max="1" step=".05" value="${st.vol}" data-s="vol"></label>
        <label class="row">Motion <select data-s="motion"><option value="auto">Follow my system</option><option value="reduce">Reduce motion</option><option value="full">Full motion</option></select></label>
        <label class="row"><input type="checkbox" data-s="highlight" ${st.highlight ? 'checked' : ''}> Mark things that can be examined</label>
        <label class="row"><input type="checkbox" data-s="holdToggle" ${st.holdToggle ? 'checked' : ''}> Press once instead of holding</label>
        <label class="row"><input type="checkbox" data-s="large" ${st.large ? 'checked' : ''}> Larger text</label>
        <p class="keys">Keys: <b>J</b> journal · <b>M</b> map · <b>H</b> hint · <b>S</b> sound · <b>Esc</b> close · arrow keys look around</p>
        <div class="acts">${has('revealSeen') ? '<button type="button" data-x="reveal">Watch the end again</button>' : ''}<button type="button" data-x="reset" class="danger">Begin a new expedition</button></div>`;
      $('[data-s=motion]', el).value = st.motion;
      $$('[data-s]', el).forEach(i => i.oninput = () => {
        st[i.dataset.s] = i.type === 'checkbox' ? i.checked : i.type === 'range' ? +i.value : i.value; save(); applySettings();
      });
      $$('[data-x]', el).forEach(b => b.onclick = () => {
        if (b.dataset.x === 'reveal') { Sheet.close(); Scene.go('abyss', { replay: true }); }
        else if (confirm('Erase this expedition and begin again? Everything you have learned will be lost.')) { localStorage.removeItem(SAVE_KEY); location.reload(); }
      });
    });
  },
};
function applySettings() {
  const st = S.settings, b = document.body;
  b.classList.toggle('reduced', reduced()); b.classList.toggle('marks', st.highlight); b.classList.toggle('large', st.large);
  Sound.applyVolume(); $('#b-snd').innerHTML = icon(st.sound ? 'snd' : 'mute');
  $('#b-snd').setAttribute('aria-label', st.sound ? 'Sound on' : 'Sound off');
}

/* ---------------- keyring and satchel ---------------- */
function renderKeyring() {
  $('#keyring').innerHTML = KEYS.map(k => `<span class="slot ${S.keys[k.id] ? 'got' : ''} ${S.door.in[k.id] ? 'set' : ''}" style="--kc:${k.glow || k.col}" id="slot-${k.id}" title="${k.name}${S.keys[k.id] ? ', ' + k.mat : ': not yet found'}">${keyIcon(k)}<i>${k.n}</i></span>`).join('')
    + (S.inv.length ? `<span class="satchel" title="Satchel">${S.inv.map(i => ITEMS[i]?.icon || '').join('')}<i>${S.inv.length}</i></span>` : '');
  $('#keyring').setAttribute('aria-label', `Keys: ${keyCount()} of 5` + (S.inv.length ? `. Carrying: ${S.inv.map(i => ITEMS[i]?.name).join(', ')}` : ''));
}
// The key rises out of the mechanism that held it, then flies to the keyring.
async function awardKey(id, text) {
  const k = KEYS.find(x => x.id === id); if (S.keys[id]) return;
  S.keys[id] = 1; save();
  const a = $('#award');
  a.style.setProperty('--kc', k.glow || k.col);
  a.innerHTML = `<div class="awin"><div class="kstage"><div class="rays"></div><svg class="kring" viewBox="-120 -120 240 240" aria-hidden="true"><circle r="112" fill="none" stroke="currentColor" stroke-width=".8"/><circle r="74" fill="none" stroke="currentColor" stroke-width=".5" stroke-dasharray="2 6"/><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${Glyph.ring('GHAZ'.repeat(5), 93, 15)}</g></svg>${Array.from({ length: 16 }, () => `<i class="sp" style="left:${10 + Math.random() * 80}%;top:${35 + Math.random() * 45}%;animation-delay:${(Math.random() * 4).toFixed(2)}s"></i>`).join('')}${keyIcon(k, 'big')}</div><p class="tag">The ${k.n === 'V' ? 'fifth' : ['first', 'second', 'third', 'fourth'][KEYS.indexOf(k)]} key</p><h2>${k.name}</h2>
    <p>${text}</p><p class="mat">${k.mat}</p><button type="button" class="pri">Take it</button></div>`;
  a.hidden = false; Sound.sfx('key');
  await new Promise(r => { $('button', a).onclick = r; $('button', a).focus(); });
  const from = $('.keyicon.big', a).getBoundingClientRect();
  a.hidden = true;
  renderKeyring();
  const slot = $('#slot-' + id).getBoundingClientRect(), fly = document.createElement('div');
  fly.className = 'flykey'; fly.innerHTML = keyIcon(k); Object.assign(fly.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
  document.body.append(fly);
  if (!reduced()) await fly.animate([{ transform: 'none' }, { transform: `translate(${slot.left - from.left}px,${slot.top - from.top}px) scale(${slot.width / from.width})` }],
    { duration: 900, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).finished;
  fly.remove(); $('#slot-' + id).classList.add('pop'); Sound.sfx('clank');
  Scene.render();
}

/* ---------------- the scene runtime ---------------- */
// Rooms are registered by world.js: { name, tongue, depth, mood, focus, draw(), on:{}, exits:{}, enter() }.
const ROOMS = {};
const Scene = {
  busy: false, lastFocus: null,
  async go(id, opts = {}) {
    if (this.busy || !ROOMS[id] || (ROOMS[id].guard && !ROOMS[id].guard())) return;
    this.busy = true;
    Panel.close(); Exam.close(true); Sheet.close();
    const prev = S.room;
    if (ROOMS[prev]?.leave) ROOMS[prev].leave();
    const fade = $('#fade');
    if (!opts.instant) { Sound.sfx('step'); fade.classList.add('on'); await wait(reduced() ? 120 : 650); }
    S.room = id; const first = !S.visited[id]; S.visited[id] = 1; save();
    this.render(true);
    Sound.setProfile(ROOMS[id].mood || 'ring');
    fade.classList.remove('on');
    if (!ROOMS[id].canvas) this.title(ROOMS[id], first);
    this.busy = false;
    ROOMS[id].enter?.(first, opts);
  },
  title(r, first) {
    const t = $('#titlecard');
    t.innerHTML = `${r.tongue ? `<div class="tg">${Glyph.svg(r.tongue)}</div>` : ''}<h1>${r.name}</h1>${r.depth ? `<p>${r.depth}</p>` : ''}`;
    t.classList.remove('on', 'long'); void t.offsetWidth; t.classList.add('on'); if (first) t.classList.add('long');
    $('#where').textContent = r.name;
  },
  render(recenter) {
    const r = ROOMS[S.room], stage = $('#stage'), keep = stage.scrollLeft;
    if (r.canvas) { stage.innerHTML = ''; return; }
    stage.innerHTML = `<svg class="scene" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="group" aria-label="${esc(r.name)}">${r.draw()}</svg>`;
    // things the room says you can examine get a faint marker when that setting is on
    $$('.hs', stage).forEach(h => { const b = h.getBBox?.(); if (b && h.dataset.mark !== 'no') h.insertAdjacentHTML('beforeend', `<circle class="mark" cx="${b.x + b.width / 2}" cy="${b.y + Math.min(b.height / 2, 60)}" r="9"/>`); });
    requestAnimationFrame(() => {
      const max = stage.scrollWidth - stage.clientWidth;
      if (recenter) { const svg = $('svg', stage); stage.scrollLeft = clamp((r.focus ?? 800) / 1600 * svg.clientWidth - stage.clientWidth / 2, 0, max); }
      else stage.scrollLeft = keep;
      this.edges();
      $$('[data-exit]', stage).forEach(x => { const to = r.exits[x.dataset.exit]?.to; if (to && !S.known[to]) { S.known[to] = 1; save(); } });
    });
  },
  edges() { const s = $('#stage'), max = s.scrollWidth - s.clientWidth; $('#panL').hidden = s.scrollLeft < 8; $('#panR').hidden = s.scrollLeft > max - 8; },
  refocus() { if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus({ preventScroll: true }); },
  activate(h) {
    const r = ROOMS[S.room]; this.lastFocus = h;
    if (h.dataset.exit) {
      const x = r.exits[h.dataset.exit];
      const why = x.locked?.();
      if (why) { Sound.sfx('deny'); shake(h); Panel.open({ title: x.label, text: `<p>${why}</p>` }); return; }
      S.known[x.to] = 1; this.go(x.to);
    } else r.on[h.dataset.hs]?.(h);
  },
};
document.addEventListener('click', e => { const h = e.target.closest('#stage .hs'); if (h && !Scene.busy) Scene.activate(h); });
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest?.('#stage .hs')) { e.preventDefault(); Scene.activate(e.target.closest('.hs')); return; }
  if (e.key === 'Escape') { if (!$('#gpop').hidden) $('#gpop').hidden = true; else if (!$('#sheet').hidden) Sheet.close(); else if (Exam.cur) Exam.close(); else Panel.close(); return; }
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !$('#title').hidden || !$('#award').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === 'j') Journal.open(); else if (k === 'm') MapView.open(); else if (k === 'h') Hints.open();
  else if (k === 's') { S.settings.sound = !S.settings.sound; save(); applySettings(); }
  else if ((k === 'arrowleft' || k === 'arrowright') && $('#sheet').hidden && !Exam.cur) $('#stage').scrollBy({ left: k === 'arrowleft' ? -240 : 240, behavior: reduced() ? 'auto' : 'smooth' });
});

/* ---------------- testing shortcuts: add ?dev to the URL ---------------- */
function devPanel() {
  const d = document.createElement('div'); d.id = 'dev';
  const jumps = { letters: 'Know the script', keys: 'All five keys', door: 'Door opened', reset: 'Reset' };
  const anims = { award: 'Key award', lid: 'Door opening', reveal: 'Reveal' };
  const btns = o => Object.entries(o).map(([k, l]) => `<button type="button" data-d="${k}">${l}</button>`).join('');
  d.innerHTML = '<b>DEV</b>' + btns(jumps) + '<b>PLAY</b>' + btns(anims);
  const grant = k => {
    Know.letters('ABCDEFGHIJKLMNOPQRSTUVWXYZ', true); ['arch', 'abcSeen', 'alphabet'].forEach(f => S.flags[f] = 1);
    if (k === 'letters') return;
    KEYS.forEach(x => S.keys[x.id] = 1); Object.keys(LEX).forEach(w => (S.words[w] ||= { k: 0, ctx: {}, note: '' }).k = 2); Object.keys(RULES).forEach(r => S.rules[r] = 1);
    ['portcullis', 'bridge', 'drained', 'riteHidden', 'name', 'lid', 'scale', 'turned', 'handleSet'].forEach(f => S.flags[f] = 1); Object.keys(ROOMS).forEach(r => S.visited[r] = 1);
    if (k === 'door') { KEYS.forEach(x => S.door.in[x.id] = 1); S.door.plates = [0, 1, 2, 3, 4]; S.flags.doorOpen = 1; }
  };
  // Animations play in place, without a reload, so they can be replayed back to back.
  const play = async k => {
    const t = $('#title'); if (!t.hidden) { Sound.start(); t.hidden = true; }
    if (Scene.busy) return;
    if (k === 'award') { delete S.keys.names; renderKeyring(); return awardKey('names', 'A test award from the dev panel.'); }
    grant('door'); renderKeyring();
    if (k === 'reveal') return Scene.go('abyss', { replay: true });
    if (S.room !== 'door') await Scene.go('door');
    if (!Door.el) Door.open();
    Door.activate(true);
  };
  d.onclick = e => {
    const k = e.target.dataset.d; if (!k) return;
    if (k in anims) return play(k);
    if (k === 'reset') { localStorage.removeItem(SAVE_KEY); return location.reload(); }
    grant(k);
    if (k !== 'door') delete S.visited.abyss;
    S.room = k === 'letters' ? 'letters' : 'door'; save(); location.reload();
  };
  document.body.append(d);
}

/* ---------------- boot ---------------- */
addEventListener('DOMContentLoaded', () => {
  const resumed = loadSave();
  $('#defs').innerHTML = Art.defs() + keyDefs();
  $('#hud .btns').innerHTML = [['map', 'Map (M)', 'map'], ['book', 'Journal (J)', 'journal'], ['hint', 'Hint (H)', 'hint'], ['gear', 'Settings', 'settings'], ['snd', 'Sound (S)', 'snd']]
    .map(([ic, l, id]) => `<button type="button" id="b-${id}" aria-label="${l}" title="${l}">${icon(ic)}</button>`).join('');
  $('#b-map').onclick = () => MapView.open(); $('#b-journal').onclick = () => Journal.open(); $('#b-hint').onclick = () => Hints.open();
  $('#b-settings').onclick = () => Settings.open(); $('#b-snd').onclick = () => { S.settings.sound = !S.settings.sound; save(); Sound.start(); applySettings(); };
  $('#stage').addEventListener('scroll', () => Scene.edges(), { passive: true });
  $('#panL').onclick = () => $('#stage').scrollBy({ left: -innerWidth * .6, behavior: 'smooth' });
  $('#panR').onclick = () => $('#stage').scrollBy({ left: innerWidth * .6, behavior: 'smooth' });
  addEventListener('resize', () => Scene.edges());
  applySettings(); renderKeyring();
  if (/[?&]dev\b/.test(location.search)) devPanel();
  // title screen
  const t = $('#title');
  $('.creed', t).innerHTML = Glyph.svg('AKH NHAUR VEN . KA VAL .');
  $('#t-old').hidden = resumed || !hadOldSave();
  $('#t-go').textContent = resumed ? 'Continue the descent' : 'Begin the descent';
  $('#t-new').hidden = !resumed;
  const begin = () => {
    Sound.start(); t.classList.add('gone'); setTimeout(() => t.hidden = true, 1600);
    if (!S.started) { S.started = Date.now(); save(); }
    Scene.go(S.room === 'abyss' && !has('doorOpen') ? 'door' : S.room, { instant: true });
  };
  $('#t-go').onclick = begin;
  $('#t-new').onclick = () => { if (confirm('Erase this expedition and begin again?')) { localStorage.removeItem(SAVE_KEY); S = FRESH(); applySettings(); renderKeyring(); begin(); } };
});
