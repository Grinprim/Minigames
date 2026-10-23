// Thessaros: shared core. State, the abyss music, transitions, keyring, dev panel and the spiral map of the Descent.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg', TAU = Math.PI * 2;
const smooth = x => (x = Math.max(0, Math.min(1, x)), x * x * (3 - 2 * x));
const wait = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.random() * a.length | 0];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
// cyrb53: answers live in the code only as hashes, so a peek at the source spoils nothing.
const hash = (s, seed = 1337) => { let a = 0xdeadbeef ^ seed, b = 0x41c6ce57 ^ seed;
  for (const c of s) { const k = c.charCodeAt(0); a = Math.imul(a ^ k, 2654435761); b = Math.imul(b ^ k, 1597334677); }
  a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909);
  b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909);
  return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36); };
const norm = s => s.toUpperCase().replace(/[^A-Z]/g, '');
const spiralPath = (r0, r1, turns, n, cx = 0, cy = 0) => { let d = '';
  for (let i = 0; i <= n; i++) { const q = i / n, a = q * TAU * turns, r = r0 + q * (r1 - r0);
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(2) + ' ' + (cy + Math.sin(a) * r).toFixed(2); } return d; };

// The five key rooms, in the order the path reaches them.
const CH = [
  { id: 'wall', n: 'I', name: 'The Speaking Wall', key: 'Key of Echoes', lock: 'Lock of Echoes', tongue: 'ZHAAL VORZ', tr: 'zhaal vorz: the stone that speaks',
    color: '#3fd8a4', sig: 'M-6 2Q0 -3 6 2Q0 9 -6 2ZM-6 2H6M-3 -4V-1M0 -5V-2M3 -4V-1',
    blurb: 'An inscription that only speaks when the serpent alphabet is turned.',
    flavor: 'A wall of black glass covered in coiled letters. They are glyphs you know, yet they spell nonsense. Before the wall stands a stone dial: the serpent alphabet, wound into a ring and biting its own tail.',
    ask: 'The wall asks a question. Answer it in the Tongue.', h: ['1rgq4geta2m'],
    near: { '2e6fkre8fvh': 'Yes. But the wall asked in the Tongue, and wants the Tongue back.', '205i4onybdf': 'Yes. But the wall asked in the Tongue, and wants the Tongue back.' },
    won: 'The glass ripples like water. A key of green glass rises out of it, still humming the word you spoke.' },
  { id: 'gallery', n: 'II', name: 'The Gallery of the Gaze', key: 'Key of Stone', lock: 'Lock of Stone', tongue: 'VORZ AKHUL', tr: 'vorz akhûl: the eye of stone',
    color: '#a9bdd8', sig: 'M-6.5 4Q0 -2.5 6.5 4Q0 10.5 -6.5 4ZM0 1.2V6.8',
    blurb: 'Five who looked upon the first Queen, and never looked away.',
    flavor: 'An auditorium of stone-eyed seers. At its heart stands the first Gorgon queen, eyes open. Five figures stand frozen at her feet. Their plinths name them only in the Tongue.',
    won: 'The Queen’s eyes close. Something cold drops from her stone lips into your palm.' },
  { id: 'coil', n: 'III', name: 'The Counting Coil', key: 'Key of the Coil', lock: 'Lock of the Coil', tongue: 'OUROTH KRENN', tr: 'ouroth krenn: the serpent counts',
    color: '#a477ff', sig: spiralPath(.4, 6, 2.2, 60, 0, 4),
    blurb: 'A serpent in the floor that counts its meals.',
    flavor: 'A spiral antechamber, carved so perfectly it seems grown. Set into the floor, a black serpent bites its own tail. Each of its twenty-four scales bears one glyph.',
    won: 'The coil shudders and sheds a single scale into your hand. It has the shape of a key.' },
  { id: 'liturgy', n: 'IV', name: 'The Chapel of Liturgy', key: 'Key of the Word', lock: 'Lock of the Word', tongue: 'ZHAAL KRUL', tr: 'zhaal krûl: the last speech',
    color: '#ff2f45', sig: 'M-5 -1H5V10H-5ZM-3 2H3M-3 4.5H3M-3 7H1',
    blurb: 'An altar whose prayers were chiselled away.',
    flavor: 'An altar of black stone, warm to the touch. Three lines of the liturgy have been chiselled out, leaving only their meaning carved in Common. The missing words lie scattered across the floor as glyph tiles.',
    won: 'The altar drinks the last word. Its surface splits, and inside lies a key the colour of old blood.' },
  { id: 'ring', n: 'V', name: 'The Ring at the End', key: 'Key of the End', lock: 'Lock of the End', tongue: 'NUL KRUL', tr: 'nul krûl: the void at the end',
    color: '#ff6a1a', sig: 'M5.6 4A5.6 5.6 0 1 1 4 .1M4 .1L7.6 -.8L6.4 2.7Z',
    blurb: 'A ring of script that eats its own words.',
    flavor: 'The deepest chamber before the Door. A single band of glyphs turns slowly in the floor. It has no beginning, only a small carved mouth.',
    ask: 'Speak the name the ring asks for.', h: ['bcr8zcgd7g'],
    near: { '1ty9r33mj2f': 'That is my name in the Tongue. The outsiders call me something else.', '1px49zd29ir': 'That is what I am. Not what they named me.' },
    won: 'The ring stops turning. Where the mouth was, there is a key made of absence. It weighs nothing.' },
];
const HALL = { id: 'hall', name: 'The Hall of Glyphs', tongue: 'ZHAAL ISHKUN', tr: 'zhaal ishkûn: the tongue that coils', color: '#e0c27a' };
// Map nodes along the spiral, outermost first.
const NODES = [
  { id: 'threshold', name: 'The Threshold', color: '#9d93a8', sig: 'M-5 10V2Q-5 -4 0 -5Q5 -4 5 2V10', at: 0, blurb: 'Where the light ends and the stairs begin.' },
  { id: 'hall', name: HALL.name, color: HALL.color, glyph: 'O', at: .1, blurb: 'Every wall a page. Learn the serpent tongue here before you go deeper.' },
  ...CH.map((c, i) => ({ id: c.id, name: c.name, color: c.color, sig: c.sig, at: [.24, .39, .54, .69, .84][i], blurb: c.blurb, ch: i })),
  { id: 'door', name: 'The Door at the End', color: '#ff6a1a', sig: 'M0 4m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M0 3V6', at: 1, blurb: 'Five locks. One mouth.' },
];
const WRONG = ['Nul. The Serpent does not know that word.', 'The stone tastes your answer and spits it out.',
  'Something in the dark laughs without a mouth.', 'Wrong. The Coil tightens.', 'The air grows colder. Try again.'];
const CREED = 'NUL ZARG UK SHA . OUROTH SHA OUROTH';
const KEY_SVG = `<circle class="k" cx="-27" r="6.2"/><path d="M-27 -6.2L-23.4 -9.6L-22.2 -5.4Z" fill="currentColor"/>
  <circle cx="-27" r="1.8" fill="currentColor"/><path class="k" d="M-20.8 0H0"/><path d="M-8 0V5.4H-6V2.6H-4V6.4H-2V0Z" fill="currentColor"/>`;

/* ---------------- state ---------------- */
const FRESH = () => ({ keys: [0, 0, 0, 0, 0], turned: [0, 0, 0, 0, 0], at: 0, trial: 0 });
let S = FRESH();
try { const s = JSON.parse(localStorage.getItem('thessaros2')); if (s && s.keys && s.turned) S = { ...FRESH(), ...s }; } catch {}
const save = () => { try { localStorage.setItem('thessaros2', JSON.stringify(S)); } catch {} };
const roomOpen = i => i === 0 || !!S.keys[i - 1];
const nodeOpen = k => { const n = NODES[k]; return n.ch != null ? roomOpen(n.ch) : n.id === 'door' ? S.keys.every(Boolean) : true; };

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2800); }
function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------------- the abyss: music made live in the browser ---------------- */
// Heartbeat, a tritone drone, whispers and a broken music box. Press M to mute.
const Audio = (() => {
  let ac, master, sfxBus, bus, verb, noiseBuf, st = 0, next = 0, deep = false, muted = false;
  const BELL = [587.33, 415.3, 554.37, 392, 587.33, 369.99];
  function init() {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = .6; master.connect(comp);
    sfxBus = ac.createGain(); sfxBus.gain.value = .75; sfxBus.connect(master);
    bus = ac.createGain(); bus.connect(master);
    const n = ac.sampleRate * 3.4, ir = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3; }
    verb = ac.createConvolver(); verb.buffer = ir; verb.connect(bus);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  const G = (v, dest = bus) => { const g = ac.createGain(); g.gain.value = v; g.connect(dest); return g; };
  const send = (node, amt) => node.connect(G(amt, verb));
  function env(g, t, a, peak, d) { const p = g.gain; p.setValueAtTime(.0001, t); p.exponentialRampToValueAtTime(peak, t + a); p.exponentialRampToValueAtTime(.0001, t + a + d); }
  function tone(type, f, t, dur, dest, detune = 0) { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = detune;
    o.connect(dest); o.start(t); o.stop(t + dur + .1); return o; }
  function noise(t, dur, dest) { const s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur); }
  function filt(type, f, q, dest) { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; }
  function drone(freqs, level, fade) { const t = ac.currentTime, g = G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + fade); send(g, .3);
    const lp = filt('lowpass', 220, 4, g), lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = .05 + Math.random() * .03; lg.gain.value = 140; lfo.connect(lg).connect(lp.frequency); lfo.start();
    for (const f of freqs) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); } }
  function thump(t, v) { const g = G(0); env(g, t, .01, v, .35); const o = tone('sine', 70, t, .4, g); o.frequency.exponentialRampToValueAtTime(32, t + .3); }
  function bell(t, f) { for (const [r, v] of [[1, .07], [2.76, .03], [5.4, .015], [.5, .04]]) {
    const g = G(0); env(g, t, .004, v, 4 / r ** .3); send(g, .8); tone('sine', f * r, t, 5, g); } }
  function pad(t, freqs, dur, v) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * .4);
    g.gain.linearRampToValueAtTime(.0001, t + dur); send(g, .6); const lp = filt('lowpass', 900, 1, g);
    for (const f of freqs) for (const d of [-8, 8]) tone('sawtooth', f, t, dur, lp, d); }
  function whisper(t) { const g = G(0); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.14, t + .8); g.gain.linearRampToValueAtTime(.0001, t + 2.2);
    send(g, .7); const pan = ac.createStereoPanner(); pan.pan.value = Math.random() * 2 - 1; pan.connect(g);
    for (const [f, q] of [[600 + Math.random() * 500, 9], [1800 + Math.random() * 900, 12]]) {
      const b = filt('bandpass', f, q, pan); b.frequency.setValueAtTime(f, t); b.frequency.linearRampToValueAtTime(f * .6, t + 2.2); noise(t, 2.3, b); } }
  function step(t, s) {
    if (s % (deep ? 2 : 3) === 0) { thump(t, .9); thump(t + .27, .5); }
    if (s % 16 === 0) pad(t, [146.83, 155.56, 220, 207.65], 9, .03);
    if (s % (deep ? 4 : 7) === 3) bell(t, BELL[(s / 7 | 0) % BELL.length] / (deep ? 2 : 1));
    if (s % (deep ? 6 : 11) === 5) whisper(t);
  }
  function tick() { while (next < ac.currentTime + .15) { step(next, st++); next += .5; } }
  function start() { if (ac) { ac.resume(); return; } init(); drone([36.71, 36.95, 51.91], .22, 5); next = ac.currentTime + .1; setInterval(tick, 30); }
  function awaken() { if (!ac || deep) return; deep = true; drone([73.42, 103.83, 110.3], .09, 10); }
  function sfx(kind) {
    if (!ac) return; const t = ac.currentTime, g = ac.createGain(); g.connect(sfxBus);
    if (kind === 'clank') { env(g, t, .002, .7, .5); noise(t, .5, filt('bandpass', 2300, 14, g)); tone('sine', 120, t, .25, g).frequency.exponentialRampToValueAtTime(50, t + .2); }
    if (kind === 'deny') { env(g, t, .02, .4, .6); const lp = filt('lowpass', 320, 8, g); tone('sawtooth', 55, t, .7, lp); tone('sawtooth', 58.3, t, .7, lp); }
    if (kind === 'tick') { env(g, t, .001, .25, .08); noise(t, .1, filt('bandpass', 3200, 6, g)); }
    if (kind === 'good') { for (const [f, d] of [[587.33, 0], [880, .09]]) { const h = ac.createGain(); h.connect(sfxBus); env(h, t + d, .005, .12, .6); tone('sine', f, t + d, .7, h); } }
    if (kind === 'step') { env(g, t, .005, .18, .12); noise(t, .14, filt('lowpass', 260, 1, g)); }
    if (kind === 'whoosh') { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.25, t + .35); g.gain.linearRampToValueAtTime(.0001, t + .9);
      const b = filt('bandpass', 300, 1.5, g); b.frequency.setValueAtTime(300, t); b.frequency.exponentialRampToValueAtTime(2400, t + .4); b.frequency.exponentialRampToValueAtTime(200, t + .9); noise(t, .95, b); }
    if (kind === 'stone') { env(g, t, .03, .5, .9); noise(t, 1, filt('lowpass', 380, 2, g)); }
    if (kind === 'summon') { g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.2, t + .8); g.gain.linearRampToValueAtTime(.0001, t + 1.8);
      for (const f of [220, 330, 311]) tone('sine', f, t, 1.8, g).frequency.exponentialRampToValueAtTime(f * 4, t + 1.1); }
    if (kind === 'boom') { env(g, t, .05, .9, 3.5); tone('sine', 48, t, 4, g).frequency.exponentialRampToValueAtTime(18, t + 3.5); noise(t, 3, filt('lowpass', 140, 1, g)); }
  }
  addEventListener('keydown', e => { if (ac && e.key.toLowerCase() === 'm' && !e.target.closest('input')) {
    muted = !muted; master.gain.setTargetAtTime(muted ? 0 : .6, ac.currentTime, .2); toast(muted ? 'The abyss falls silent. (M)' : 'The abyss breathes again.'); } });
  return { start, awaken, sfx };
})();

/* ---------------- views, routing & the void-wipe ---------------- */
const VIEWS = {};
let current = null;
function route() {
  let name = location.hash.slice(1) || 'map';
  if (!VIEWS[name]) name = 'map';
  if (VIEWS[name].guard && !VIEWS[name].guard()) { location.hash = '#map'; return; }
  if (current && VIEWS[current].leave) VIEWS[current].leave();
  $('#award').hidden = true;
  $$('main > section').forEach(s => s.classList.toggle('on', s.dataset.view === name));
  const idx = CH.findIndex(c => c.id === name);
  document.documentElement.style.setProperty('--c', idx >= 0 ? CH[idx].color : name === 'hall' ? HALL.color : name === 'door' ? '#ff6a1a' : '#a477ff');
  document.body.dataset.view = name;
  current = name;
  const at = NODES.findIndex(n => n.id === name); if (at > 0) { S.at = at; save(); }
  scrollTo({ top: 0, behavior: 'instant' });
  VIEWS[name].enter?.($(`section[data-view="${name}"]`));
}
let wiping = false;
async function go(hash, x = innerWidth / 2, y = innerHeight / 2) {
  if (wiping || location.hash === hash) return;
  wiping = true;
  const w = $('#wipe'); w.style.setProperty('--x', x + 'px'); w.style.setProperty('--y', y + 'px');
  Audio.sfx('whoosh'); w.classList.add('on');
  await wait(REDUCED ? 50 : 680);
  location.hash = hash; await wait(60);
  w.style.setProperty('--x', '50%'); w.style.setProperty('--y', '50%');
  w.classList.remove('on'); await wait(500);
  wiping = false;
}
// every in-page link travels through the void
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented) return;
  e.preventDefault(); go(a.getAttribute('href'), e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
});

function renderKeyring() {
  $('#keyring').innerHTML = CH.map((c, i) => `<span class="slot ${S.keys[i] ? 'got' : ''} ${S.turned[i] ? 'turned' : ''}" id="slot${i}"
    style="--c:${c.color}" title="${c.key}${S.keys[i] ? '' : ' (not yet found)'}"><svg viewBox="-35 -11 37 19" aria-hidden="true">${KEY_SVG}</svg></span>`).join('');
}

/* key award, shown inside a room; on leaving, the key flies into the keyring */
let awarding = -1;
function award(i) {
  if (current !== CH[i].id) { S.keys[i] = 1; save(); renderKeyring(); toast(`You claimed the ${CH[i].key}.`); return; }
  S.keys[i] = 1; save(); awarding = i;
  const a = $('#award'), c = CH[i];
  a.style.setProperty('--c', c.color);
  $('#award-key').innerHTML = KEY_SVG;
  $('#award-name').textContent = 'The ' + c.key;
  $('#award-text').textContent = c.won;
  $('#award-next').textContent = i < 4 ? `The way to ${CH[i + 1].name} is open.` : 'All five keys are yours. The Door at the End is waiting.';
  a.hidden = false; a.classList.remove('show'); void a.offsetWidth; a.classList.add('show');
  Audio.sfx('summon'); setTimeout(() => Audio.sfx('clank'), 1300);
  Ambient.burst(innerWidth / 2, innerHeight / 2, c.color, 120);
  VIEWS[c.id].enter?.($(`section[data-view="${c.id}"]`));
}
async function closeAward(back) {
  const a = $('#award'), i = awarding; if (a.hidden) return;
  const from = $('#award-key').getBoundingClientRect(), slot = $('#slot' + i).getBoundingClientRect();
  const fly = document.createElementNS(NS, 'svg');
  fly.setAttribute('viewBox', '-37 -12 40 22'); fly.setAttribute('class', 'flykey'); fly.style.setProperty('--c', CH[i].color);
  Object.assign(fly.style, { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' });
  fly.innerHTML = KEY_SVG; document.body.append(fly);
  a.hidden = true;
  const dx = slot.left + slot.width / 2 - (from.left + from.width / 2), dy = slot.top + slot.height / 2 - (from.top + from.height / 2), sc = slot.width / from.width;
  await fly.animate([{ transform: 'none' }, { transform: `translate(${dx * .4}px,${dy * .2 - 80}px) rotate(-30deg) scale(${(1 + sc) / 2})`, offset: .45 },
    { transform: `translate(${dx}px,${dy}px) rotate(0) scale(${sc})` }], { duration: 1000, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' }).finished;
  fly.remove(); renderKeyring(); const s = $('#slot' + i); s.classList.add('pop'); Audio.sfx('clank');
  if (back) { await wait(250); go('#map'); }
}

function roomHead(c, i) {
  return `<a class="backlink" href="#map">↺ The Descent</a>
    <header class="ch-head"><p class="tag">${i != null ? 'Chamber ' + CH[i].n : 'The first stop'}</p><div class="draw">${Glyph.svg(c.tongue)}</div><p class="translit">${c.tr}</p>
    <h2>${c.name}</h2><p class="flavor">${c.flavor || ''}</p></header>
    ${i != null ? `<div class="claimed" hidden>You carry the ${CH[i].key}. <a href="#map">Return to the Descent.</a></div>` : ''}`;
}
function speakForm(i) {
  return `<form class="speak" data-i="${i}"><label for="ans${i}">${CH[i].ask}</label>
    <div class="speakrow"><input id="ans${i}" autocomplete="off" spellcheck="false" autocapitalize="characters"><button type="submit">Speak</button></div>
    <p class="fb" aria-live="polite"></p></form>`;
}
document.addEventListener('submit', e => {
  const f = e.target.closest('form.speak'); if (!f) return;
  e.preventDefault();
  const i = +f.dataset.i, v = norm(f.querySelector('input').value); if (!v) return;
  const h = hash(v);
  if (CH[i].h.includes(h)) { f.querySelector('.fb').textContent = ''; award(i); return; }
  f.querySelector('.fb').textContent = CH[i].near[h] || pick(WRONG);
  shake(f); Audio.sfx('deny'); f.querySelector('input').select();
});
const markClaimed = (el, i) => { $('.claimed', el).hidden = !S.keys[i]; };

/* ---------------- ambient: embers rise, ash falls ---------------- */
const Ambient = (() => {
  const g = $('#ambient').getContext('2d'); let W, H, run = true;
  const motes = [], sparks = [];
  function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    g.canvas.width = W * d; g.canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); }
  const spawn = (m, any) => Object.assign(m, { x: Math.random() * W, y: any ? Math.random() * H : (m.ember ? H + 10 : -10),
    v: 8 + Math.random() * 24, r: .5 + Math.random() * 1.6, p: Math.random() * TAU });
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < (REDUCED ? 40 : 140); i++) motes.push(spawn({ ember: i % 3 === 0 }, true));
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (run) {
      g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
      const tint = getComputedStyle(document.documentElement).getPropertyValue('--c').trim() || '#a477ff';
      for (const m of motes) {
        m.p += dt; m.y += (m.ember ? -m.v : m.v * .5) * dt; m.x += Math.sin(m.p * .8) * 8 * dt;
        if (m.y < -12 || m.y > H + 12) spawn(m);
        g.globalAlpha = (m.ember ? .55 : .25) * (.6 + .4 * Math.sin(m.p * 3));
        g.fillStyle = m.ember ? (m.r > 1.4 ? tint : '#ff7a2a') : '#b8acc4';
        g.beginPath(); g.arc(m.x, m.y, m.r, 0, TAU); g.fill();
      }
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life += dt; if (s.life > s.max) { sparks.splice(i, 1); continue; }
        s.vy += 140 * dt; s.x += s.vx * dt; s.y += s.vy * dt; g.globalAlpha = 1 - s.life / s.max; g.fillStyle = s.col;
        g.beginPath(); g.arc(s.x, s.y, 2, 0, TAU); g.fill(); }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return {
    pause(p) { run = !p; if (p) g.clearRect(0, 0, W, H); },
    burst(x, y, col, n) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 40 + Math.random() * 260;
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, life: 0, max: .7 + Math.random() * 1.1, col }); } },
  };
})();

/* ---------------- the map: a spiral ramp descending into the void ---------------- */
VIEWS.map = (() => {
  let path, total, token, lens = [], tokenLen = 0, walking = false, sel = null;
  const SPIRAL = (() => { let d = ''; const n = 500, turns = 2.1;
    for (let i = 0; i <= n; i++) { const q = i / n, a = -Math.PI / 2 - q * turns * TAU, r = 420 - q * 300;
      d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d; })();
  const sigOf = n => n.glyph ? `<g transform="scale(2.6) translate(-6 -10)"><path class="nsig" d="${Glyph.path(n.glyph)}" style="stroke-width:.9"/></g>`
    : `<g transform="scale(3.2) translate(0 -4)"><path class="nsig" d="${n.sig}"/></g>`;
  const LOCK_ICON = '<g class="badge" transform="translate(30 -30)"><circle r="13" fill="#0b080d" stroke="#4a4250" stroke-width="2"/><path d="M-4 0V-4A4 4 0 0 1 4 -4V0" fill="none" stroke="#8a8090" stroke-width="2"/><rect x="-6" y="-1" width="12" height="9" rx="1" fill="#8a8090"/></g>';
  const KEY_ICON = c => `<g class="badge" transform="translate(30 -30)"><circle r="14" fill="#0b080d" stroke="${c}" stroke-width="2"/><g transform="translate(9 -1) scale(.55)" style="color:${c}">${KEY_SVG}</g></g>`;

  function screenOf(len) { const p = path.getPointAtLength(len), m = $('#map').getScreenCTM(); const q = new DOMPoint(p.x, p.y).matrixTransform(m); return [q.x, q.y]; }
  function place(len) { const p = path.getPointAtLength(len); token.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); }
  function walkTo(k) {
    return new Promise(res => {
      const from = tokenLen, to = lens[k], dist = Math.abs(to - from);
      if (dist < 1) return res();
      walking = true;
      const dur = REDUCED ? 200 : Math.min(2800, 500 + dist * .9), t0 = performance.now(), trail = $('#trail');
      let lastStep = 0, lastTrail = 0;
      (function f(now) {
        const q = Math.min(1, (now - t0) / dur), e = q < .5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2;
        tokenLen = from + (to - from) * e; place(tokenLen);
        if (now - lastStep > 280) { lastStep = now; Audio.sfx('step'); }
        if (now - lastTrail > 40) { lastTrail = now; const p = path.getPointAtLength(tokenLen), c = document.createElementNS(NS, 'circle');
          c.setAttribute('class', 'trail'); c.setAttribute('cx', p.x + (Math.random() - .5) * 10); c.setAttribute('cy', p.y + (Math.random() - .5) * 10); c.setAttribute('r', 2 + Math.random() * 4);
          trail.append(c); setTimeout(() => c.remove(), 950); }
        if (q < 1) requestAnimationFrame(f); else { walking = false; S.at = k; save(); res(); }
      })(performance.now());
    });
  }
  function showCard(k) {
    const n = NODES[k], card = $('#card'), open = nodeOpen(k);
    sel = k; card.hidden = false; card.style.setProperty('--c', n.color);
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    $('#card .tag').textContent = n.ch != null ? 'Chamber ' + CH[n.ch].n : n.id === 'door' ? 'The deepest point' : n.id === 'hall' ? 'The first stop' : 'The way in';
    $('#card h3').textContent = n.name; $('#card .blurb').textContent = n.blurb;
    const st = $('#card .state'), btn = $('#card button');
    btn.hidden = n.id === 'threshold';
    if (n.ch != null) st.textContent = S.keys[n.ch] ? `${CH[n.ch].key} claimed` : open ? 'Unsolved' : `Sealed. Earn the ${CH[n.ch - 1].key} first.`;
    else if (n.id === 'door') st.textContent = open ? (S.turned.every(Boolean) ? 'Open' : 'Your five keys will fit') : `${S.keys.filter(Boolean).length} of 5 keys found`;
    else if (n.id === 'hall') st.textContent = S.trial ? `Trial of Glyphs: best ${S.trial} / 10` : 'Always open';
    else st.textContent = 'Go deeper.';
    btn.disabled = !open; btn.textContent = n.id === 'door' ? 'Approach the Door' : 'Enter';
  }
  async function select(k) {
    if (walking) return;
    if (!nodeOpen(k)) { Audio.sfx('deny'); shake($('#node' + k)); showCard(k); return; }
    $('#card').hidden = true;
    $$('.node').forEach(n => n.classList.remove('here'));
    await walkTo(k);
    $('#node' + k).classList.add('here');
    showCard(k);
  }
  function refresh() {
    NODES.forEach((n, k) => { const el = $('#node' + k), open = nodeOpen(k), solved = n.ch != null && S.keys[n.ch];
      el.classList.toggle('locked', !open); el.classList.toggle('open', open && !solved && n.id !== 'threshold'); el.classList.toggle('solved', !!solved);
      $('.badge', el)?.remove(); if (!open) el.insertAdjacentHTML('beforeend', LOCK_ICON); else if (solved) el.insertAdjacentHTML('beforeend', KEY_ICON(n.color)); });
    let far = 0; NODES.forEach((n, k) => { if (nodeOpen(k)) far = k; });
    $('#rampGlow').style.strokeDashoffset = total - lens[far];
    const found = S.keys.filter(Boolean).length;
    $('.maphud .prog').innerHTML = `${found} / 5 keys<br><span style="font-weight:500">${S.turned.every(Boolean) ? 'The door is open' : found === 5 ? 'The door awaits' : 'Descend'}</span>`;
  }
  return {
    build(el) {
      el.innerHTML = `<div class="maphud"><div class="logo">Thessaros<small>The Descent into the Coil</small></div><div class="prog"></div></div>
        <svg id="map" viewBox="-500 -500 1000 1000" aria-label="Map of the Descent">
          <defs>
            <radialGradient id="deep"><stop offset="0" stop-color="#000"/><stop offset=".35" stop-color="#05020a"/><stop offset=".8" stop-color="#140b1c"/><stop offset="1" stop-color="#140b1c" stop-opacity="0"/></radialGradient>
            <radialGradient id="dark"><stop offset="0" stop-color="#000" stop-opacity=".9"/><stop offset=".45" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
            <linearGradient id="rampG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3240"/><stop offset=".5" stop-color="#231c28"/><stop offset="1" stop-color="#15101a"/></linearGradient>
            <radialGradient id="medal" cx=".4" cy=".35"><stop offset="0" stop-color="#4a414d"/><stop offset="1" stop-color="#120e14"/></radialGradient>
            <radialGradient id="tok"><stop offset="0" stop-color="#fff3c4"/><stop offset=".25" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
            <radialGradient id="voidG"><stop offset="0" stop-color="#000"/><stop offset=".6" stop-color="#07020d"/><stop offset="1" stop-color="#5a2a9a" stop-opacity=".5"/></radialGradient>
            <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <circle r="500" fill="url(#deep)"/>
          <g class="spin-slow" fill="none" stroke="#a477ff" stroke-width="1.1" stroke-linecap="round" opacity=".28">${Glyph.ring('NUL ZARG UK SHA . OUROTH SHA OUROTH . GHAZ UK DURN SHA . KRUL . ', 478, 16)}</g>
          <path class="ramp-edge" d="${SPIRAL}"/><path class="ramp" d="${SPIRAL}"/><path class="ramp-steps" d="${SPIRAL}"/>
          <path id="rampGlow" class="ramp-glow" d="${SPIRAL}"/>
          <circle r="440" fill="url(#dark)" pointer-events="none"/>
          <circle r="95" fill="url(#voidG)"/>
          <g class="spin-rev" fill="none" stroke="#ff6a1a" stroke-width="1" stroke-linecap="round" opacity=".5">${Glyph.ring('KRUL . KRUL . KRUL . ', 74, 10)}</g>
          <g id="trail"></g>
          <g id="nodes"></g>
          <g id="token"><circle r="34" fill="url(#tok)"/><path class="flame" d="M0 -16Q7 -6 5 2Q3 8 0 8Q-3 8 -5 2Q-7 -6 0 -16Z" fill="#ffe7a0"/><circle r="4" cy="2" fill="#fff"/></g>
        </svg>
        <div id="card" hidden><p class="tag"></p><h3></h3><p class="blurb"></p><p class="state"></p><button type="button">Enter</button></div>`;
    },
    init(el) {
      path = $('#rampGlow', el); total = path.getTotalLength();
      path.style.strokeDasharray = total; path.style.strokeDashoffset = total;
      lens = NODES.map(n => n.at * total);
      $('#nodes', el).innerHTML = NODES.map((n, k) => { const p = n.id === 'door' ? { x: 0, y: 0 } : path.getPointAtLength(lens[k]), big = n.id === 'door' ? 1.6 : 1;
        return `<g class="node" id="node${k}" style="--c:${n.color}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${big})" tabindex="0" role="button" aria-label="${n.name}">
          <circle class="halo" r="54"/><circle class="disc" r="38"/><circle class="ring" r="38"/>${sigOf(n)}
          <text class="lbl" y="${n.id === 'door' ? 62 : 66}" style="${n.id === 'door' ? 'font-size:15px' : ''}">${n.name.replace('The ', '')}</text></g>`; }).join('');
      token = $('#token', el);
      $('#nodes', el).addEventListener('click', e => { const n = e.target.closest('.node'); if (n) select(+n.id.slice(4)); });
      $('#nodes', el).addEventListener('keydown', e => { const n = e.target.closest('.node'); if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(+n.id.slice(4)); } });
      $('#card button', el).onclick = e => { if (sel == null || walking) return; const [x, y] = screenOf(lens[sel]); go('#' + NODES[sel].id, x, y); };
    },
    enter(el) {
      if (!lens.length) this.init(el);
      tokenLen = lens[S.at] || 0; place(tokenLen); refresh();
      $$('.node').forEach(n => n.classList.remove('here')); $('#node' + S.at).classList.add('here');
      $('#card').hidden = true; if (S.at) setTimeout(() => current === 'map' && showCard(S.at), 500);
    },
    refresh,
  };
})();

/* ---------------- dev panel: add ?dev to the URL ---------------- */
function devPanel() {
  const d = document.createElement('div'); d.id = 'dev';
  d.innerHTML = `<b>DEV</b><button data-a="keys">All keys</button><button data-a="turn">All keys + door</button><button data-a="trial">Max trial</button><button data-a="reset">Reset all</button>`;
  d.onclick = e => { const a = e.target.dataset.a; if (!a) return;
    if (a === 'keys') { S.keys = [1, 1, 1, 1, 1]; S.at = 7; }
    if (a === 'turn') { S.keys = [1, 1, 1, 1, 1]; S.turned = [1, 1, 1, 1, 1]; S.at = 7; }
    if (a === 'trial') S.trial = 10;
    if (a === 'reset') S = FRESH();
    save(); location.hash = a === 'turn' ? '#sanctum' : '#map'; location.reload(); };
  document.body.append(d);
}

/* ---------------- boot ---------------- */
addEventListener('DOMContentLoaded', () => {
  $('#threshold .creed').innerHTML = Glyph.svg(CREED);
  for (const [name, v] of Object.entries(VIEWS)) v.build?.($(`section[data-view="${name}"]`));
  renderKeyring();
  $('#award-back').onclick = () => closeAward(true);
  $('#award-stay').onclick = () => closeAward(false);
  if (/[?&]dev\b/.test(location.search)) devPanel();
  $('#enter').onclick = () => { Audio.start(); $('#threshold').classList.add('gone'); };
  addEventListener('hashchange', route);
  route();
});
