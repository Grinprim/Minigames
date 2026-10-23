// The Door at the End: an almond of stone that is also an eyelid. Five locks, five lid-plates over a wheel,
// one word, and then the lid opens. Progress lives in S.door so a reload resumes at the right stage.
const DOOR = {
  P0: [300, 540], P1: [800, 120], P2: [1300, 540],
  WORDS: ['THESS', 'GHUL', 'VEN', 'MURR', 'SHA', 'VAL'],
  PLATE_WORDS: ['SHEM', 'ZHAAL', 'MURR', 'VAL', 'AKH'],
  STACK: [2, 4, 0, 3, 1],  // the order the plates were laid down, bottom first; they lift off in reverse
  WRONG: {
    THESS: 'The lid presses down harder. Dust sifts from the seam. The door has been told to stay shut, and it agrees.',
    VEN: 'For a moment a hair-thin line of turquoise light shows along the seam, as if something inside had looked out. Then it is gone.',
    MURR: 'The stone goes still and heavy, like a sleeper rolling over.',
    SHA: 'From behind the stone comes a sound like a long swallow. Nothing opens.',
    VAL: 'The floor drops a finger’s width under your feet, and stops.',
  },
};
const lidPt = t => { const [a, b, c] = [DOOR.P0, DOOR.P1, DOOR.P2], u = 1 - t; return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]]; };
const lockPos = i => { const [x, y] = lidPt(.22 + i * .14); return [x, 540 + (y - 540) * .72]; };
const ALMOND = 'M300 540Q800 120 1300 540Q800 960 300 540Z';

const DoorArt = {
  // The whole door. state: 'shut' or 'open'; o = how far open (0..1) when animating.
  door(o = 0, opts = {}) {
    const up = -175 * o, dn = 150 * o, ins = S.door.in;
    let s = `<defs><clipPath id="almondClip${opts.id || ''}"><path d="${ALMOND}"/></clipPath>
      <radialGradient id="gInner"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#010303"/><stop offset="1" stop-color="#06100f"/></radialGradient>
      <linearGradient id="gLid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3c42"/><stop offset="1" stop-color="#1a1b1f"/></linearGradient>
      <linearGradient id="gLidB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15161a"/><stop offset="1" stop-color="#2c2e33"/></linearGradient></defs>`;
    // the rock around it, carved into a brow and a cheek
    s += `<path d="M180 540Q800 -40 1420 540Q800 1080 180 540Z" fill="#17181b" stroke="#000" stroke-width="6"/><path d="M180 540Q800 -40 1420 540Q800 1080 180 540Z" fill="url(#pGrain)"/>
      ${Array.from({ length: 13 }, (_, i) => { const [x, y] = lidPt(.04 + i * .0767); return `<path d="M${x} ${y}q${(x - 800) * .06} -40 ${(x - 800) * .1} -70" stroke="#0a0b0d" stroke-width="10" stroke-linecap="round" fill="none"/>`; }).join('')}`;
    s += `<g clip-path="url(#almondClip${opts.id || ''})"><path d="${ALMOND}" fill="url(#gInner)"/>
      ${o > 0 ? `<ellipse cx="800" cy="560" rx="${380 * o}" ry="${120 * o}" fill="url(#gTealSoft)" opacity="${.6 * o}"/>` : ''}
      <g transform="translate(0 ${up})"><path d="M300 540Q800 120 1300 540Q800 610 300 540Z" fill="url(#gLid)"/><path d="M300 540Q800 120 1300 540Q800 610 300 540Z" fill="url(#pGrain)"/>
        <path d="M380 470Q800 170 1220 470M460 410Q800 210 1140 410" stroke="#000" stroke-opacity=".4" stroke-width="3" fill="none"/>
        ${[0, 1, 2, 3, 4].map(i => this.lock(i, ins[KEYS[i].id], opts)).join('')}</g>
      <g transform="translate(0 ${dn})"><path d="M300 540Q800 960 1300 540Q800 470 300 540Z" fill="url(#gLidB)"/><path d="M300 540Q800 960 1300 540Q800 470 300 540Z" fill="url(#pGrain)"/>
        <path d="M400 610Q800 860 1200 610" stroke="#000" stroke-opacity=".4" stroke-width="3" fill="none"/></g>
      ${o < .2 ? this.center(opts) : ''}
      ${o >= 1 ? "" : `<path class="seam" d="M300 540H1300" stroke="${opts.seam ? "#7ff0e0" : "#000"}" stroke-width="${opts.seam ? 2 + opts.seam * 4 : 5}" opacity="${(opts.seam ? .3 + opts.seam * .7 : 1) * (1 - o)}" ${opts.seam ? 'filter="url(#fGlow)"' : ''}/>`}</g>
      <path d="${ALMOND}" fill="none" stroke="#000" stroke-width="10"/><path d="${ALMOND}" fill="none" stroke="#4a4c52" stroke-width="3" opacity=".6"/>`;
    return s;
  },
  lock(i, done, opts) {
    const [x, y] = lockPos(i), k = KEYS[i];
    return `<g class="dlock ${done ? 'done' : ''} ${opts.glow?.[i] ? 'glow' : ''}" data-lock="${i}" ${opts.interactive ? `tabindex="0" role="button" aria-label="Lock ${k.n}${done ? ', key turned' : ''}"` : ''} transform="translate(${x} ${y})" style="color:${k.col}">
      <circle r="44" fill="#121316" stroke="#000" stroke-width="4"/><circle r="36" fill="none" stroke="currentColor" stroke-width="2" opacity="${done ? .9 : .35}"/>
      ${[this.mech1, this.mech2, this.mech3, this.mech4, this.mech5][i].call(this, done)}
      <text y="64" class="lnum">${k.n}</text></g>`;
  },
  // little previews of each lock's mechanism as seen on the door
  mech1: d => `<rect x="-16" y="-34" width="32" height="18" fill="#2a2b30" stroke="#000"/><path d="M-3 ${d ? -8 : -8}h6v22h-6z" fill="${d ? 'currentColor' : '#000'}"/>`,
  mech2: d => d ? '<path d="M-3 -10h6v24h-6z" fill="currentColor"/>' : '<rect x="-24" y="-16" width="23" height="32" fill="#3a3c42" stroke="#000"/><rect x="1" y="-16" width="23" height="32" fill="#3a3c42" stroke="#000"/>',
  mech3: d => `<path d="M0 0m-26 0a26 26 0 1 0 52 0a26 26 0 1 0 -52 0M0 0m-16 0a16 16 0 1 0 32 0a16 16 0 1 0 -32 0" fill="none" stroke="#000" stroke-width="3"/><path d="M-3 -10h6v20h-6z" fill="${d ? 'currentColor' : '#000'}"/>`,
  mech4: d => `<path d="M-20 20L20 ${d ? 26 : -14}" stroke="#2a2b30" stroke-width="8" stroke-linecap="round"/><path d="M-3 -12h6v18h-6z" fill="${d ? 'currentColor' : '#000'}"/>`,
  mech5: d => `<path d="M-30 -30L30 30" stroke="#4fd6c4" stroke-opacity="${d ? .8 : .2}" stroke-width="2"/><path d="M0 -10L8 0L0 10L-8 0Z" fill="${d ? '#4fd6c4' : '#000'}"/>`,
  // the five plates over the wheel, then the wheel itself
  center(opts) {
    const gone = S.door.plates, all = gone.length === 5;
    let s = `<g transform="translate(800 540)"><circle r="122" fill="#0d0e10" stroke="#000" stroke-width="5"/>`;
    s += `<g class="wheel" id="wheel${opts.id || ''}" style="transform:rotate(${-S.door.wheel * 60}deg)"><circle r="104" fill="url(#gStone)" stroke="#000" stroke-width="4"/><circle r="104" fill="url(#pGrain)"/>
      ${DOOR.WORDS.map((w, i) => `<g transform="rotate(${i * 60}) translate(0 -78)">${Art.carve(w, 0, -6, 13, { center: true, col: '#d7cfb8' })}</g><path transform="rotate(${i * 60 + 30})" d="M0 -100V-60" stroke="#000" stroke-width="3"/>`).join('')}
      <circle r="40" fill="#15161a" stroke="#000" stroke-width="3"/><path d="M-26 0Q0 -18 26 0Q0 18 -26 0Z" fill="#000" stroke="#4a4c52" stroke-width="2"/></g>
      <path d="M-12 -126L0 -108L12 -126Z" fill="#c9c0a6"/>`;
    DOOR.STACK.forEach(i => {
      if (gone.includes(i)) return;
      const a = i * 72 - 90;
      s += `<g class="plate" data-plate="${i}" ${opts.interactive && !all ? `tabindex="0" role="button" aria-label="A lid-plate marked ${tl(DOOR.PLATE_WORDS[i])}"` : ''} transform="rotate(${a})">
        <path d="M-20 0Q30 -64 128 -10Q130 0 128 10Q30 64 -20 0Z" transform="translate(-12 0)" fill="url(#gLid)" stroke="#000" stroke-width="4" filter="url(#fRough)"/>
        <path d="M-20 0Q30 -64 128 -10Q130 0 128 10Q30 64 -20 0Z" transform="translate(-12 0)" fill="none" stroke="#6a6c72" stroke-width="1.5"/>
        <g transform="translate(70 0) rotate(${-a})">${Art.carve(DOOR.PLATE_WORDS[i], 0, -8, 14, { center: true, col: '#cfc6ae' })}</g></g>`;
    });
    return s + '</g>';
  },
  // as it appears in the room, a hotspot
  scene(open) { return Art.hs('door', open ? 'The open door' : 'The Door at the End', this.door(open ? 1 : 0, { id: 's' })); },
};

/* ---------------- the minigame ---------------- */
const LOCKS = [
  { t: 'Lock I', d: 'A keyhole under a small stone prism with a word on each face. A shutter of stone covers the hole.' },
  { t: 'Lock II', d: 'The keyhole is hidden behind two sliding halves of stone, like a stele split down the middle.' },
  { t: 'Lock III', d: 'The keyhole sits at the centre of a spiral groove that winds three times around it.' },
  { t: 'Lock IV', d: 'A keyhole beside a heavy lever. The lever is weighted to spring back up.' },
  { t: 'Lock V', d: 'A keyhole of dark glass. A hair-thin crack in the stone above it leaks turquoise light at a slant.' },
];
const Door = {
  open() {
    Exam.open({ tag: 'The bottom of Thessaros', title: 'The Door at the End', build: el => { this.el = el; this.sel = null; this.local = {}; this.draw(); }, onClose: () => { this.stopHold?.(); this.el = null; } });
  },
  stage() {
    if (has('doorOpen')) return 'open';
    if (KEYS.some(k => !S.door.in[k.id])) return 'locks';
    if (S.door.plates.length < 5) return 'plates';
    return 'wheel';
  },
  draw(msg) {
    const el = this.el, st = this.stage();
    const side = st === 'open' ? `<p>The lid stands open. Beyond it there is a dark that does not end where it should.</p><div class="acts"><button type="button" class="pri" id="d-go">Step into the dark</button><button type="button" id="d-replay">Watch it open again</button></div>`
      : st === 'locks' ? this.lockPanel()
      : st === 'plates' ? `<p class="tag">The lid-plates</p><p>With all five keys turned, the plates over the centre have come loose. They were laid down one over another. Lift them away.</p>`
      : `<p class="tag">The wheel</p><p>Under the plates, a wheel of six words. A notch at the top marks the seam.</p>${inscView('wheelStop')}
         <div class="acts"><button type="button" id="w-l" aria-label="Turn the wheel left">◀ Turn</button><button type="button" id="w-r" aria-label="Turn the wheel right">Turn ▶</button></div>
         <p>At the notch: <b class="wword">${tl(DOOR.WORDS[S.door.wheel])}</b></p><div class="acts"><button type="button" class="pri" id="w-go">Throw the great lever</button></div>`;
    const vb = st === 'plates' || st === 'wheel' ? '520 300 560 480' : st === 'locks' ? '250 200 1100 640' : '170 80 1260 920';
    el.innerHTML = `<div class="doorview"><svg viewBox="${vb}" class="doorsvg" role="group" aria-label="The Door at the End">${DoorArt.door(st === 'open' ? 1 : 0, { id: 'x', interactive: true })}</svg>
      <div class="doorside">${side}<p class="fb" aria-live="polite">${msg || ''}</p></div></div>`;
    Know.see('lintel');
    $$('.dlock', el).forEach(g => { const act = () => { this.sel = +g.dataset.lock; Sound.sfx('tick'); this.local = {}; this.draw(); }; g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }; });
    if (this.sel != null) $(`.dlock[data-lock="${this.sel}"]`, el)?.classList.add('sel');
    $$('.plate', el).forEach(g => { const act = () => this.lift(+g.dataset.plate, g); g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }; });
    if (st === 'wheel') {
      $('#w-l', el).onclick = () => this.spin(-1); $('#w-r', el).onclick = () => this.spin(1); $('#w-go', el).onclick = () => this.lever();
      this.dragWheel($('#wheelx', el));
    }
    if (st === 'open') { $('#d-go', el).onclick = () => Scene.go('abyss'); $('#d-replay', el).onclick = () => this.activate(true); }
    if (st === 'locks') this.bindLock();
  },

  /* ----- stage 2: the five locks, each its own small machine ----- */
  lockPanel() {
    const i = this.sel;
    if (i == null) return `<p class="tag">Five locks</p><p>Five keyholes run along the upper curve of the lid, and no two are alike. Choose one to look at closely.</p>
      <p class="dim">${KEYS.filter(k => S.door.in[k.id]).length} of 5 keys turned.</p>`;
    const k = KEYS[i], L = LOCKS[i], lo = this.local, done = S.door.in[k.id], have = S.keys[k.id];
    let mech = '', ctrl = '';
    if (done) ctrl = `<p>The ${k.name} is turned in this lock.</p>`;
    else if (!have) ctrl = `<p class="dim">You do not carry the key for this lock.</p>`;
    else if (i === 0) { const faces = ['AKH', 'NHAUR', 'SHEM', 'DURN'], f = lo.f || 0; lo.f = f;
      mech = `<rect x="-50" y="-80" width="100" height="44" fill="#2a2b30" stroke="#000" stroke-width="3"/>${Art.carve(faces[f], 0, -70, 24, { center: true, col: '#d7cfb8' })}<rect x="-16" y="-20" width="32" height="60" fill="${faces[f] === 'SHEM' ? '#000' : '#3a3c42'}" stroke="#000" stroke-width="3"/>`;
      ctrl = `<button type="button" data-c="turn">Turn the prism</button><button type="button" data-c="in" class="pri" ${faces[f] === 'SHEM' ? '' : 'disabled'}>Insert the ${k.name}</button>`; }
    else if (i === 1) { const l = lo.l, r = lo.r;
      mech = `<rect x="-14" y="-24" width="28" height="56" fill="#000"/><rect x="${l ? -96 : -50}" y="-50" width="50" height="100" fill="#3a3c42" stroke="#000" stroke-width="3" class="slide"/><rect x="${r ? 46 : 0}" y="-50" width="50" height="100" fill="#3a3c42" stroke="#000" stroke-width="3" class="slide"/>`;
      ctrl = `<button type="button" data-c="l" ${l ? 'disabled' : ''}>Slide the left half</button><button type="button" data-c="r" ${r ? 'disabled' : ''}>Slide the right half</button><button type="button" data-c="in" class="pri" ${l && r ? '' : 'disabled'}>Insert the ${k.name}</button>`; }
    else if (i === 2) { const t = lo.t || 0;
      mech = `<path d="${Array.from({ length: 3 }, (_, n) => `M0 0m-${70 - n * 20} 0a${70 - n * 20} ${70 - n * 20} 0 1 0 ${140 - n * 40} 0a${70 - n * 20} ${70 - n * 20} 0 1 0 -${140 - n * 40} 0`).join('')}" fill="none" stroke="#000" stroke-width="5"/>
        ${Array.from({ length: 3 }, (_, n) => t >= (n + 1) * 2 ? `<circle r="${70 - n * 20}" fill="none" stroke="${k.col}" stroke-width="3"/>` : '').join('')}
        ${lo.in ? `<g style="transform:rotate(${t * 180}deg);transition:transform .5s" class="kturn"><g transform="scale(1.6)" style="color:${k.col}" fill="currentColor"><path d="M-6 -1.5H34V1.5H-6Z"/></g></g>` : '<rect x="-4" y="-14" width="8" height="28" fill="#000"/>'}`;
      ctrl = lo.in ? `<button type="button" data-c="turn" class="pri">Turn the key a half turn</button><p class="dim">${t / 2} of 3 full turns.</p>` : `<button type="button" data-c="in" class="pri">Insert the ${k.name}</button>`; }
    else if (i === 3) { const p = lo.p || 0;
      mech = `<rect x="-6" y="-30" width="12" height="40" fill="#000"/><path d="M-70 40L${-70 + 140} ${40 - 80 + p * 110}" stroke="#2a2b30" stroke-width="18" stroke-linecap="round" class="lever"/><circle cx="-70" cy="40" r="12" fill="#3a3c42"/>
        <rect x="-80" y="70" width="160" height="10" fill="#111"/><rect x="-80" y="70" width="${160 * p}" height="10" fill="${k.col}"/>`;
      ctrl = lo.in ? `<button type="button" data-c="hold" class="pri hold">${S.settings.holdToggle ? 'Lean on the lever' : 'Hold the lever down'}</button><p class="dim">${S.settings.holdToggle ? 'Press once; you will keep your weight on it.' : 'Press and hold, with a finger, the mouse, or Space.'}</p>` : `<button type="button" data-c="in" class="pri">Insert the ${k.name}</button>`; }
    else { const a = lo.a || 0;
      mech = `<path d="M-90 -90L90 90" stroke="#4fd6c4" stroke-opacity=".35" stroke-width="3"/><circle r="56" fill="#0b0f10" stroke="#000" stroke-width="3"/>
        ${lo.in ? `<g style="transform:rotate(${a * 45}deg);transition:transform .4s"><path d="M-48 0L0 -10L48 0L0 10Z" fill="#1c2b2c" stroke="#000" stroke-width="2"/><path d="M30 0L36 -5L42 0L36 5Z" fill="#7ff0e0"/><path d="M-42 0L-36 -5L-30 0L-36 5Z" fill="#7ff0e0"/></g>` : '<path d="M0 -14L8 0L0 14L-8 0Z" fill="#000"/>'}`;
      ctrl = lo.in ? `<button type="button" data-c="turn" class="pri">Turn the glass key</button>` : `<button type="button" data-c="in" class="pri">Insert the ${k.name}</button>`; }
    return `<p class="tag">${L.t} · ${k.name}</p><p>${L.d}</p>${mech ? `<svg viewBox="-110 -110 220 220" class="lockzoom" aria-hidden="true">${mech}</svg>` : ''}<div class="acts">${ctrl}</div>
      <button type="button" class="linkish" data-c="back">All five locks</button>`;
  },
  bindLock() {
    const el = this.el, i = this.sel, lo = this.local;
    $$('[data-c]', el).forEach(b => {
      const c = b.dataset.c;
      if (c === 'hold') return this.bindHold(b);
      b.onclick = () => {
        if (c === 'back') { this.sel = null; return this.draw(); }
        if (c === 'in') { lo.in = 1; Sound.sfx('clank'); if (i < 2) return this.turned(i); return this.draw('The key slides home.'); }
        if (i === 0 && c === 'turn') { lo.f = ((lo.f || 0) + 1) % 4; Sound.sfx('grind'); }
        if (i === 1) { lo[c] = 1; Sound.sfx('grind'); }
        if (i === 2 && c === 'turn') { lo.t = (lo.t || 0) + 1; Sound.sfx('tick'); if (lo.t >= 6) { this.draw(); return setTimeout(() => this.turned(2), 500); } }
        if (i === 4 && c === 'turn') { lo.a = ((lo.a || 0) + 1) % 8; Sound.sfx('tick'); if (lo.a % 4 === 1) { this.draw('The turquoise light runs straight through the glass.'); return setTimeout(() => this.turned(4), 700); } }
        this.draw();
        $(`[data-c="${c}"]:not(:disabled)`, el)?.focus();
      };
    });
  },
  bindHold(b) {
    const lo = this.local; let raf = 0, held = false, last = 0;
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      lo.p = clamp((lo.p || 0) + (held ? dt / 2.4 : -dt / .8));
      const lever = $('.lockzoom .lever', this.el), bar = $('.lockzoom rect:last-child', this.el);
      if (lever) lever.setAttribute('d', `M-70 40L70 ${-40 + lo.p * 110}`); if (bar) bar.setAttribute('width', 160 * lo.p);
      if (lo.p >= 1) { cancelAnimationFrame(raf); raf = 0; held = false; Sound.sfx('clank'); return this.turned(3); }
      if (lo.p > 0 || held) raf = requestAnimationFrame(step); else raf = 0;
    };
    const down = e => { e?.preventDefault(); if (held && S.settings.holdToggle) return; held = true; Sound.sfx('grind'); if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    const up = () => { if (!S.settings.holdToggle) held = false; };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
    b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(e); });
    b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') up(); });
    b.onclick = e => e.preventDefault();
    this.stopHold = () => { cancelAnimationFrame(raf); raf = 0; };
  },
  turned(i) {
    const k = KEYS[i];
    S.door.in[k.id] = 1; save(); renderKeyring(); Sound.sfx('clank'); setTimeout(() => Sound.sfx('stone'), 300);
    this.sel = null; this.local = {};
    const left = KEYS.filter(x => !S.door.in[x.id]).length;
    this.draw(left ? `The ${k.name} turns. Deep in the stone, something shifts by one notch.` : 'The fifth key turns. All five locks are open, and with a sound like a held breath let out, the plates over the centre come loose.');
    if (!left) Sound.sfx('rumble');
  },

  /* ----- stage 3: the plates, then the wheel ----- */
  lift(i, g) {
    if (this.stage() !== 'plates') return;
    const above = DOOR.STACK.slice(DOOR.STACK.indexOf(i) + 1).filter(p => !S.door.plates.includes(p));
    if (above.length) { Sound.sfx('deny'); shake(g); this.draw(`The plate marked <i>${tl(DOOR.PLATE_WORDS[i])}</i> is pinned under the one marked <i>${tl(DOOR.PLATE_WORDS[above.at(-1)])}</i>.`); return; }
    S.door.plates.push(i); save(); Sound.sfx('grind');
    const a = (i * 72 - 90) * Math.PI / 180;
    const fly = g.animate([{ transform: g.getAttribute('transform') ? `rotate(${i * 72 - 90}deg)` : 'none' }, { transform: `translate(${Math.cos(a) * 160}px,${Math.sin(a) * 160}px) rotate(${i * 72 - 90}deg)`, opacity: 0 }], { duration: reduced() ? 50 : 700, easing: 'ease-in', fill: 'forwards' });
    fly.finished.then(() => this.draw(S.door.plates.length === 5 ? 'The last plate slides into the rim. Beneath them all: a wheel of words.' : 'The plate slides outward into a slot in the rim.'));
  },
  spin(d) { S.door.wheel = (S.door.wheel + d + 6) % 6; save(); Sound.sfx('grind'); setTimeout(() => Sound.sfx('tick'), 250); this.draw(); },
  dragWheel(w) {
    if (!w) return;
    let a0 = null, base = 0;
    const ang = e => { const r = w.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI; };
    w.style.cursor = 'grab'; w.style.touchAction = 'none';
    w.addEventListener('pointerdown', e => { a0 = ang(e); base = S.door.wheel; w.setPointerCapture(e.pointerId); w.style.transition = 'none'; });
    w.addEventListener('pointermove', e => { if (a0 == null) return; let d = ((ang(e) - a0 + 540) % 360) - 180; w.style.transform = `rotate(${-base * 60 + d}deg)`;
      const n = ((base - Math.round(d / 60)) % 6 + 6) % 6; if (n !== S.door.wheel) { S.door.wheel = n; Sound.sfx('tick'); $('.wword', this.el).textContent = tl(DOOR.WORDS[n]); } });
    const end = () => { if (a0 == null) return; a0 = null; w.style.transition = ''; save(); Sound.sfx('grind'); this.draw(); };
    w.addEventListener('pointerup', end); w.addEventListener('pointercancel', end);
  },
  lever() {
    const w = DOOR.WORDS[S.door.wheel];
    Sound.sfx('clank');
    if (w !== 'GHUL') { setTimeout(() => Sound.sfx(w === 'VEN' ? 'teal' : 'deny'), 400); shake($('.doorsvg', this.el)); this.draw(`The lever falls with the wheel at <i>${tl(w)}</i>. ${DOOR.WRONG[w]}`); return; }
    this.activate(false);
  },

  /* ----- stage 4: the lid opens ----- */
  async activate(replay) {
    const el = this.el; if (!el) return;
    Scene.busy = true;
    const R = reduced(), svg = () => $('.doorsvg', el), T = ms => wait(R ? Math.min(ms, 300) : ms);
    let skip = false;
    $('.doorside', el).innerHTML = `<p class="tag">The lid</p><p class="cine"></p>${replay ? '<button type="button" id="d-skip">Skip</button>' : ''}`;
    if (replay) $('#d-skip', el).onclick = () => { skip = true; };
    const line = t => { const p = $('.cine', el); if (p) { p.textContent = t; p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } };
    const paint = (o, glow, seam) => { const s = svg(); if (s) s.innerHTML = DoorArt.door(o, { id: 'x', glow, seam }); };
    const glow = [0, 0, 0, 0, 0];
    S.door.plates = [0, 1, 2, 3, 4]; svg()?.setAttribute('viewBox', '170 80 1260 920'); paint(0, glow, 0);
    line('The five locks answer, one after another.');
    for (let i = 0; i < 5 && !skip; i++) { await T(650); glow[i] = 1; paint(0, glow, 0); Sound.sfx('clank'); }
    if (!skip) { await T(500); Sound.sfx('rumble'); line('Deep in the rock, something enormous begins to move.'); el.classList.add('quake'); this.dust(el, 90); await T(2600); }
    if (!skip) { line('The seam begins to shine.'); Sound.sfx('teal'); for (let k = 1; k <= 20 && !skip; k++) { paint(0, glow, k / 20); await T(90); } }
    if (!skip) { line('The lid lifts.'); Sound.sfx('boom'); Sound.setProfile('door'); this.dust(el, 60); }
    const t0 = performance.now(), dur = skip || R ? 300 : 7000;
    await new Promise(res => { const f = now => { const q = Math.min(1, skip ? 1 : (now - t0) / dur); paint(smooth(q), glow, 1 - q * .6);
      const s = svg(); if (s && !R) s.style.transform = `scale(${1 + smooth(q) * .12})`; if (q < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    el.classList.remove('quake');
    setFlag('doorOpen'); Scene.busy = false;
    line('Beyond it is a darkness deeper than the dark around you.');
    await T(skip ? 400 : 2600);
    if (!this.el) return;
    // nothing to choose: the dark takes you
    line('It pulls you down.'); Sound.sfx('whoosh'); await T(skip ? 0 : 1400);
    if (this.el) Scene.go('abyss');
  },
  dust(el, n) {
    if (reduced()) return;
    for (let i = 0; i < n; i++) { const d = document.createElement('i'); d.className = 'dust';
      d.style.left = Math.random() * 100 + '%'; d.style.animationDelay = Math.random() * 2.4 + 's'; d.style.animationDuration = 1.6 + Math.random() * 2.4 + 's';
      el.append(d); setTimeout(() => d.remove(), 5200); }
  },
};
