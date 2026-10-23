// The Door at the End, and the Sanctum behind it where the Abyssal Serpent waits.

/* ---------------- the door ---------------- */
VIEWS.door = (() => {
  const POS = [[-41, -41], [41, -41], [41, 41], [-41, 41], [0, -9]], SC = [1, 1, 1, 1, 1.3];
  const CUTS = [-80, -22, 31, 86, 139, 197, 252];
  const P = (a, r) => [+(Math.cos(a * Math.PI / 180) * r).toFixed(1), +(Math.sin(a * Math.PI / 180) * r).toFixed(1)];
  const RIM = 'NUL ZARG UK SHA . OUROTH SHA OUROTH . KRUL . ';
  let busy = false;
  const fourTurned = () => S.turned.slice(0, 4).every(Boolean);
  const anim = (el, frames, opts) => el.animate(frames, { fill: 'forwards', ...opts }).finished;
  const chain = (x1, y1, x2, y2) => `<line class="ch0" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line class="ch1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  const toScreen = (x, y) => { const p = new DOMPoint(x, y).matrixTransform($('#door').getScreenCTM()); return [p.x, p.y]; };

  function stoneTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), R = Math.random;
    const rg = g.createRadialGradient(240, 210, 20, 256, 256, 262);
    rg.addColorStop(0, '#3b3442'); rg.addColorStop(.65, '#211b26'); rg.addColorStop(1, '#0b080e');
    g.fillStyle = rg; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 260; i++) { const x = R() * 512, y = R() * 512, r = 8 + R() * 70, b = g.createRadialGradient(x, y, 0, x, y, r);
      b.addColorStop(0, R() < .7 ? 'rgba(0,0,0,.2)' : 'rgba(150,135,170,.07)'); b.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = b; g.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let v = 0; v < 22; v++) { let x = R() * 512, y = R() * 512; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 40; k++) { x += (R() - .5) * 20; y += (R() - .5) * 20; g.lineTo(x, y); }
      g.strokeStyle = v < 6 ? 'rgba(150,70,255,.28)' : 'rgba(0,0,0,.4)'; g.lineWidth = .4 + R() * 1.3; g.stroke(); }
    const d = g.getImageData(0, 0, 512, 512);
    for (let i = 0; i < d.data.length; i += 4) { const n = (R() - .5) * 28; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; }
    g.putImageData(d, 0, 0); return c.toDataURL();
  }

  function buildDoor(door) {
    const c0 = [2, -3];
    const bound = CUTS.map((a, i) => [c0, ...[1, 2, 3, 4, 5, 6].map(k => P(a + Math.sin(i * 7.3 + k * 2.1) * 7, k * 19))]);
    let clips = '', shards = '', cracks = '', teeth = '', chains = '', locks = '';
    CUTS.forEach((a, i) => {
      const b = CUTS[(i + 1) % 7] + (i === 6 ? 360 : 0), arc = [];
      for (let x = a; x < b; x += 8) arc.push(P(x, 118));
      clips += `<clipPath id="sh${i}"><polygon points="${[...bound[i], ...arc, ...[...bound[(i + 1) % 7]].reverse()].join(' ')}"/></clipPath>`;
      shards += `<g class="shard" clip-path="url(#sh${i})"><use href="#face"/></g>`;
      cracks += `<polyline class="crack" pathLength="1" points="${bound[i].join(' ')}"/>`;
    });
    for (let k = 0; k < 44; k++) { const a = k * 360 / 44, w = 3.2; teeth += `<polygon points="${[P(a - w, 105), P(a, 96.5 - (k % 2) * 3), P(a + w, 105)].join(' ')}"/>`; }
    POS.forEach(([x, y], i) => {
      if (i < 4) { const a = Math.atan2(y, x) * 180 / Math.PI, [ax, ay] = P(a, 92);
        chains += `<g class="chain" id="ch${i}">${chain(ax, ay, x, y - 10)}${chain(x, y + 6, POS[4][0] + x * .2, POS[4][1] + 8 + y * .2)}</g>`; }
      const c = CH[i];
      locks += `<g transform="translate(${x} ${y}) scale(${SC[i]})"><g class="lock lk" id="lk${i}" tabindex="0" role="button" aria-label="${c.lock}" style="color:${c.color}">
        <path class="shackle" d="M-7.5 -3V-10A7.5 7.5 0 0 1 7.5 -10V-3"/>
        ${i === 4 ? '<circle class="body" cy="6" r="15"/><circle class="rim" cy="6" r="12.5"/>'
          : '<path class="body" d="M-12 -4H12V8Q12 16 0 20Q-12 16 -12 8Z"/><path class="rim" d="M-9.5 -1.5H9.5V8Q9.5 14 0 17.3Q-9.5 14 -9.5 8Z"/>'}
        <path class="sig" d="${c.sig}"/><circle class="hole" cy="13" r="1.8"/><path class="hole" d="M-.9 13.5H.9L1.5 17H-1.5Z"/></g></g>`;
    });
    const rune = Glyph.ring(RIM, 87.5, 9), creed = Glyph.ring('NUL ZARG UK SHA . OUROTH SHA OUROTH . GHAZ UK DURN SHA . ', 113, 8.5);
    door.innerHTML = `<defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="iron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4e46"/><stop offset=".5" stop-color="#2a221e"/><stop offset="1" stop-color="#110d0b"/></linearGradient>
        <linearGradient id="ironV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2420"/><stop offset=".45" stop-color="#8d8076"/><stop offset="1" stop-color="#2b2420"/></linearGradient>
        <linearGradient id="bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cfba"/><stop offset="1" stop-color="#6d6357"/></linearGradient>
        <radialGradient id="pit"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#05010a"/><stop offset="1" stop-color="#2a0f40"/></radialGradient>
        <clipPath id="disk"><circle r="98"/></clipPath>${clips}
        <g id="face"><image href="${stoneTexture()}" x="-98" y="-98" width="196" height="196" clip-path="url(#disk)"/>
          <path class="carve" d="${spiralPath(24, 76, 5, 500)}"/>
          <circle class="groove" r="95"/><circle class="groove hi" r="94"/><circle class="groove" r="80"/><circle class="groove hi" r="79.2"/><circle class="groove" r="22"/>
          <g class="cut hi" transform="translate(.45 .55)">${rune}</g><g class="cut">${rune}</g></g>
      </defs>
      <circle r="120" fill="#120e13" stroke="#000" stroke-width="2"/><circle r="113" fill="none" stroke="#1d181e" stroke-width="13"/>
      <g class="spin-slow" fill="none" stroke="#a477ff" stroke-width="1.1" stroke-linecap="round" opacity=".55" filter="url(#glow)">${creed}</g>
      <circle r="99" fill="url(#pit)"/>
      <g id="shards">${shards}</g><g id="cracks">${cracks}</g>
      <g fill="url(#bone)" stroke="#000" stroke-width=".6">${teeth}</g>
      ${chains}${locks}<g id="fx"></g>`;
    door.addEventListener('click', e => { const l = e.target.closest('.lock'); if (l) useLock(+l.id.slice(2)); });
    door.addEventListener('keydown', e => { const l = e.target.closest('.lock'); if (l && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); useLock(+l.id.slice(2)); } });
  }
  function hideLock(i) { $('#lk' + i).parentNode.style.display = 'none'; const ch = $('#ch' + i); if (ch) ch.style.display = 'none'; }
  function refresh() {
    S.turned.forEach((t, i) => t && hideLock(i));
    CH.forEach((c, i) => { const l = $('#lk' + i); const ready = S.keys[i] && !S.turned[i] && (i < 4 || fourTurned());
      l.classList.toggle('ready', !!ready); l.classList.toggle('sealed', !S.keys[i]); });
    const held = S.keys.filter((k, i) => k && !S.turned[i]).length;
    $('#doorhint').textContent = S.turned.every(Boolean) ? 'The door is open. Something is waiting.'
      : held ? `You carry ${held} unturned key${held > 1 ? 's' : ''}. Touch a glowing lock to turn it. The End turns last.` : 'You carry no unturned keys.';
  }
  async function useLock(i) {
    if (busy || S.turned[i]) return;
    const c = CH[i];
    if (!S.keys[i]) { toast(`You do not carry the ${c.key}.`); Audio.sfx('deny'); shake($('#lk' + i)); return; }
    if (i === 4 && !fourTurned()) { toast('The End turns last. Four locks still bind it.'); Audio.sfx('deny'); return; }
    busy = true;
    const lk = $('#lk' + i), ch = $('#ch' + i), [x, y] = POS[i], ty = y + 13 * SC[i], s = SC[i];
    const key = document.createElementNS(NS, 'g');
    key.style.color = c.color; key.style.pointerEvents = 'none'; key.innerHTML = `<g filter="url(#glow)">${KEY_SVG}</g>`;
    $('#fx').append(key);
    Audio.sfx('summon'); Ambient.burst(...toScreen(-10, 62), c.color, 50);
    await anim(key, [{ transform: 'translate(10px,62px) scale(0) rotate(-220deg)', opacity: 0 }, { transform: 'translate(10px,62px) scale(1.6) rotate(0deg)', opacity: 1 }], { duration: 1000, easing: 'cubic-bezier(.2,.8,.2,1)' });
    await anim(key, [{ transform: 'translate(10px,62px) scale(1.6)' }, { transform: `translate(${x - 22}px,${ty}px) scale(${s})` }], { duration: 850, easing: 'cubic-bezier(.6,0,.3,1)' });
    await anim(key, [{ transform: `translate(${x - 22}px,${ty}px) scale(${s})` }, { transform: `translate(${x}px,${ty}px) scale(${s})` }], { duration: 260, easing: 'ease-in' });
    Audio.sfx('clank');
    await anim(key, [{ transform: `translate(${x}px,${ty}px) scale(${s},${s})` }, { transform: `translate(${x}px,${ty}px) scale(${s},${-s})` }], { duration: 520, easing: 'ease-in-out' });
    Ambient.burst(...toScreen(x, y), c.color, 80); Audio.sfx('clank');
    await anim(lk.querySelector('.shackle'), [{ transform: 'none' }, { transform: 'translateY(-7px)' }], { duration: 220, easing: 'ease-out' });
    await wait(220);
    anim(key, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).then(() => key.remove());
    if (ch) anim(ch, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(22px)' }], { duration: 900, easing: 'ease-in' });
    await anim(lk, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(70px) rotate(35deg)', opacity: 0 }], { duration: 1000, easing: 'cubic-bezier(.5,0,.9,.5)' });
    hideLock(i); S.turned[i] = 1; save(); renderKeyring(); refresh();
    busy = false;
    if (i === 4) finale(); else if (fourTurned()) toast('Four keys turned. The End is listening.');
  }
  async function finale() {
    busy = true; Audio.sfx('boom'); Audio.awaken();
    const door = $('#door'), shards = $$('.shard'), cracks = $$('.crack');
    door.animate([{ transform: 'none' }, ...Array.from({ length: 14 }, (_, k) => ({ transform: `translate(${(Math.random() - .5) * k}px,${(Math.random() - .5) * k}px)` })), { transform: 'none' }], { duration: 1700 });
    cracks.forEach((c, i) => anim(c, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: i * 130, easing: 'ease-out' }));
    await wait(1800);
    const [cx, cy] = toScreen(0, 0);
    Ambient.burst(cx, cy, '#ff6a1a', 140); Ambient.burst(cx, cy, '#a477ff', 90);
    cracks.forEach(c => anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 700 }));
    shards.forEach((s, i) => {
      const a = (CUTS[i] + CUTS[(i + 1) % 7] + (i === 6 ? 360 : 0)) / 2 * Math.PI / 180, dx = Math.cos(a) * 24, dy = Math.sin(a) * 24;
      anim(s, [{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 1, offset: .3 },
               { transform: `rotate(${(i % 2 ? 1 : -1) * (130 + i * 30)}deg) scale(0)`, opacity: 0 }], { duration: 2800, delay: i * 90, easing: 'cubic-bezier(.5,0,.8,.4)' });
    });
    await wait(3400);
    $('#fade').classList.add('on'); await wait(1700);
    busy = false; location.hash = '#sanctum';
    await wait(300); $('#fade').classList.remove('on');
  }
  return {
    guard: () => S.keys.every(Boolean),
    build(el) {
      el.innerHTML = `<a class="backlink" href="#map">↺ The Descent</a><p class="tag">The deepest point</p><h2>The Door at the End</h2>
        <p class="flavor">A round door of black stone set in a frame of teeth. Five locks bind it. Around its rim, the cult’s creed.</p>
        <div class="doorbox"><svg id="door" viewBox="-122 -122 244 244" aria-label="The Door at the End"></svg></div><p class="doorhint" id="doorhint"></p>`;
      buildDoor($('#door', el));
    },
    enter() { refresh(); },
  };
})();

/* ---------------- the sanctum ---------------- */
const REVEAL = [
  ['THE DOOR WAS A MOUTH', 'The door at the end was never a door. It was a mouth.'],
  [null, 'Five keys turned. Five scales fell from the Coil, and the Coil noticed.'],
  [null, 'Thessaros did not fall. Thessaros was finished, the way a meal is finished.'],
  ['NUL ZARG UK SHA', 'Nul zarg-ûk shâ. The void devours the gods.'],
  ['OUROTH SHA OUROTH', 'Ouroth shâ Ouroth. The Serpent devours the Serpent.'],
  ['WHAT ENDS BEGINS', 'What ends, begins. What begins is swallowed.'],
  [null, 'You came looking for the end. There is no end. There is only the next bite.'],
  [null, '<span class="sign">— the One at the End</span>'],
];

VIEWS.sanctum = (() => {
  let g, W, H, CX, CY, R, BW, raf = 0, t0 = 0, last = 0, T = 0, rot = 0, form = 0, eyes = 0, awake = 0, roared = false, revealT = 0, iris = null;
  const N = 320, COLS = 190, ROWS = 9, SPAN = TAU * .955, RING = 'NUL ZARG UK SHA . OUROTH SHA OUROTH . KRUL IS THE FIRST WORD AND THE LAST . ';
  const pts = Array.from({ length: N + 1 }, () => ({ x: 0, y: 0, tx: 0, ty: 0, nx: 0, ny: 0, w: 0 }));
  const rnd = Array.from({ length: COLS * ROWS }, Math.random);
  const stars = Array.from({ length: 280 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + .2, p: Math.random() * TAU }));
  const glyphCache = {}, gp = ch => ch in glyphCache ? glyphCache[ch] : (glyphCache[ch] = Glyph.path(ch) && new Path2D(Glyph.path(ch)));
  let motes = [], parts = [], LX = -.45, LY = -.6, tLX = LX, tLY = LY;

  function resize() {
    const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; CX = W / 2; CY = H / 2;
    g.canvas.width = W * d; g.canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
    R = Math.min(W, H) * .34; BW = R * .17;
  }
  function spawn(m, any) {
    const far = Math.hypot(W, H) * .6;
    m.a = Math.random() * TAU; m.r = any ? R * .3 + Math.random() * far : far * (.85 + Math.random() * .3);
    m.h = Math.random() < .72 ? 262 + Math.random() * 40 : (Math.random() < .5 ? 105 : 12);
    m.z = .4 + Math.random() * 1.3; m.px = null; return m;
  }

  // A fibrous serpent iris, painted once and reused every frame.
  function irisTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 512; const q = c.getContext('2d'), M = 256, rnd = Math.random;
    const b = q.createRadialGradient(M, M, 0, M, M, M);
    [[0, '#fbffb0'], [.1, '#d8ff5a'], [.3, '#6fdc2a'], [.5, '#ffb01a'], [.68, '#ff5a12'], [.85, '#a8180a'], [.95, '#2a0402'], [1, '#000']].forEach(s => b.addColorStop(...s));
    q.fillStyle = b; q.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1800; i++) {
      const a = rnd() * TAU, r0 = M * (.06 + rnd() * .2), r1 = M * (.45 + rnd() * .5), w = (rnd() - .5) * .12;
      q.strokeStyle = rnd() < .55 ? `rgba(255,${200 + rnd() * 55 | 0},${110 + rnd() * 80 | 0},${.05 + rnd() * .14})` : `rgba(40,0,0,${.08 + rnd() * .2})`;
      q.lineWidth = .4 + rnd() * 1.6; q.beginPath(); q.moveTo(M + Math.cos(a) * r0, M + Math.sin(a) * r0);
      q.quadraticCurveTo(M + Math.cos(a + w) * (r0 + r1) / 2, M + Math.sin(a + w) * (r0 + r1) / 2, M + Math.cos(a + w * 2) * r1, M + Math.sin(a + w * 2) * r1); q.stroke();
    }
    for (let i = 0; i < 160; i++) { const a = rnd() * TAU, r = M * (.35 + rnd() * .4);
      q.fillStyle = `rgba(20,0,0,${.15 + rnd() * .25})`; q.beginPath(); q.ellipse(M + Math.cos(a) * r, M + Math.sin(a) * r, 2 + rnd() * 6, 1 + rnd() * 2.5, a, 0, TAU); q.fill(); }
    q.beginPath(); for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, r = M * (.27 + Math.sin(i * 1.7) * .02 + rnd() * .02);
      i ? q.lineTo(M + Math.cos(a) * r, M + Math.sin(a) * r) : q.moveTo(M + Math.cos(a) * r, M + Math.sin(a) * r); }
    q.strokeStyle = 'rgba(255,245,170,.45)'; q.lineWidth = 3; q.stroke();
    return c;
  }

  function sample(t) {
    for (let i = 0; i <= N; i++) {
      const s = i / N, a = rot + (1 - s) * SPAN - Math.PI / 2, fade = Math.min(1, s * 4, (1 - s) * 6);
      const r = R + Math.sin(s * TAU * 4 - t * 1.1) * BW * .09 * fade;
      const p = pts[i]; p.x = CX + Math.cos(a) * r; p.y = CY + Math.sin(a) * r;
      p.w = BW * (.1 + .9 * smooth(s / .45)) * (1 - .1 * smooth((s - .9) / .1)) * (1 + .025 * Math.sin(t * 1.4));
    }
    for (let i = 0; i <= N; i++) {
      const p = pts[i], q = pts[Math.min(i + 1, N)], o = pts[Math.max(i - 1, 0)];
      let tx = q.x - o.x, ty = q.y - o.y; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
      let nx = -ty, ny = tx; if (nx * (p.x - CX) + ny * (p.y - CY) < 0) { nx = -nx; ny = -ny; }
      p.tx = tx; p.ty = ty; p.nx = nx; p.ny = ny;
    }
  }

  function drawVoid(t, dt) {
    const bg = g.createRadialGradient(CX, CY, 0, CX, CY, Math.hypot(W, H) * .6);
    bg.addColorStop(0, '#0c0614'); bg.addColorStop(1, '#010002'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    [['rgba(80,25,130,.2)', 0], ['rgba(10,70,80,.12)', 2.1], ['rgba(120,20,30,.12)', 4.2]].forEach(([c, o]) => {
      const x = CX + Math.cos(t * .02 + o) * W * .35, y = CY + Math.sin(t * .027 + o) * H * .3, r = Math.max(W, H) * .55;
      const n = g.createRadialGradient(x, y, 0, x, y, r); n.addColorStop(0, c); n.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = n; g.fillRect(0, 0, W, H); });
    g.fillStyle = '#cbbfe8';
    for (const s of stars) { g.globalAlpha = .25 + .25 * Math.sin(t * 1.3 + s.p); g.fillRect(s.x * W, s.y * H, s.r, s.r); }
    g.globalAlpha = 1;
    const ringR = R + BW * 2.6, k = BW * .55 / 20, chars = [...RING], step = TAU / chars.length;
    g.save(); g.translate(CX, CY); g.lineWidth = 1.15; g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = `rgba(${170 + awake * 85},${110 - awake * 40},255,${(.15 + awake * .25) * smooth(form * 2)})`;
    chars.forEach((ch, i) => { const p = gp(ch); if (!p) return;
      g.save(); g.rotate(-rot * .6 + t * .01 + i * step); g.translate(0, -ringR); g.scale(k, k); g.translate(-6, -10); g.stroke(p); g.restore(); });
    g.restore();
    g.globalCompositeOperation = 'lighter';
    const sp = dt * (1 + awake * 2.5) * (REDUCED ? .3 : 1);
    for (const m of motes) {
      m.a += sp * (.2 + 60 / (m.r + 30)); m.r -= sp * (14 + 2400 / (m.r + 40)) * m.z * .5;
      if (m.r < R * .06) { spawn(m); continue; }
      const x = CX + Math.cos(m.a) * m.r, y = CY + Math.sin(m.a) * m.r;
      if (m.px != null) { g.strokeStyle = `hsla(${m.h},85%,65%,${Math.min(1, m.r / (R * .7)) * .55})`; g.lineWidth = m.z;
        g.beginPath(); g.moveTo(m.px, m.py); g.lineTo(x, y); g.stroke(); }
      m.px = x; m.py = y;
    }
    g.globalCompositeOperation = 'source-over';
    const hr = R * (.6 + awake * .1) * (1 + .03 * Math.sin(t * 1.7));
    const ab = g.createRadialGradient(CX, CY, hr * .15, CX, CY, hr * 1.25);
    ab.addColorStop(0, '#000'); ab.addColorStop(.55, 'rgba(0,0,0,.96)');
    ab.addColorStop(.8, `rgba(${90 + awake * 120},${30 + awake * 20},${150 - awake * 100},.28)`); ab.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = ab; g.beginPath(); g.arc(CX, CY, hr * 1.25, 0, TAU); g.fill();
    g.lineWidth = 2; g.globalCompositeOperation = 'lighter';
    for (let a = 0; a < 4; a++) { g.beginPath();
      for (let q = 0; q <= 1; q += .02) { const an = -t * .5 + a * TAU / 4 + q * 3.4, r = hr * (1.15 - q * .95), x = CX + Math.cos(an) * r, y = CY + Math.sin(an) * r;
        q ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.strokeStyle = `rgba(150,80,255,${.07 + awake * .06})`; g.stroke(); }
    g.globalCompositeOperation = 'source-over';
    if (awake > .01) abyssEye(t, hr);
  }

  // The eye in the abyss: scaled lids, a fibrous iris, a wet slit pupil that breathes and follows you.
  function abyssEye(t, hr) {
    const bt = t % 6.5, blink = bt < .4 ? 1 - Math.sin(bt / .4 * Math.PI) : 1;
    const open = smooth(awake) * blink, ew = hr * .92, eh = hr * .4;
    const almond = (h) => { g.beginPath(); g.moveTo(-ew, 0); g.bezierCurveTo(-ew * .45, -h * 1.45, ew * .45, -h * 1.45, ew, 0); g.bezierCurveTo(ew * .45, h * 1.45, -ew * .45, h * 1.45, -ew, 0); g.closePath(); };
    g.save(); g.translate(CX, CY);
    g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(0, 0, 0, 0, 0, ew * 1.5);
    gl.addColorStop(0, `rgba(255,90,25,${.35 * open})`); gl.addColorStop(.6, `rgba(160,40,200,${.12 * awake})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(-ew * 1.5, -ew * 1.5, ew * 3, ew * 3);
    g.globalCompositeOperation = 'source-over';
    // ring of plated scales around the socket
    for (let row = 2; row >= 0; row--) { const s = 1.1 + row * .12, n = 34 + row * 6, sz = hr * (.07 + row * .015);
      for (let i = 0; i < n; i++) { const q = (i + (row % 2) * .5) / n * TAU, x = Math.cos(q) * ew * s, y = Math.sin(q) * eh * s * 1.3;
        g.save(); g.translate(x, y); g.rotate(Math.atan2(y / (eh * eh), x / (ew * ew)));
        g.beginPath(); g.ellipse(0, 0, sz, sz * .7, 0, 0, TAU);
        g.fillStyle = `hsl(${270 + row * 6},${25 + row * 5}%,${5 + (2 - row) * 3}%)`; g.globalAlpha = smooth(awake) * .75; g.fill();
        g.strokeStyle = 'rgba(164,119,255,.25)'; g.lineWidth = 1; g.stroke(); g.restore(); } }
    g.globalAlpha = 1;
    // the lids
    almond(eh); const lid = g.createLinearGradient(0, -eh * 1.5, 0, eh * 1.5);
    lid.addColorStop(0, '#1d1024'); lid.addColorStop(.5, '#08040b'); lid.addColorStop(1, '#1d1024'); g.fillStyle = lid; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 4; g.stroke();
    for (let k = 1; k <= 3; k++) { g.save(); almond(eh * (1 - k * .15 * (1 - open) - .02)); g.strokeStyle = 'rgba(164,119,255,.08)'; g.lineWidth = 1.5; g.stroke(); g.restore(); }
    if (open > .02) {
      const oh = eh * open;
      g.save(); almond(oh); g.clip();
      const ox = LX * ew * .16, oy = LY * oh * .25, ir = ew * 1.02;
      g.drawImage(iris, ox - ir, oy - ir, ir * 2, ir * 2);
      g.globalCompositeOperation = 'lighter';
      const pulse = .25 + .15 * Math.sin(t * 1.8);
      const fire = g.createRadialGradient(ox, oy, 0, ox, oy, ir * .5); fire.addColorStop(0, `rgba(255,200,80,${pulse})`); fire.addColorStop(1, 'rgba(255,80,0,0)');
      g.fillStyle = fire; g.fillRect(-ew, -eh * 2, ew * 2, eh * 4);
      g.globalCompositeOperation = 'source-over';
      const dil = .045 + .035 * (.5 + .5 * Math.sin(t * .6)), pw = ew * dil;
      for (const [w, a] of [[2.6, .25], [1.7, .5], [1, 1]]) { g.fillStyle = `rgba(0,0,0,${a})`; g.beginPath(); g.ellipse(ox, oy, pw * w, eh * 1.25, 0, 0, TAU); g.fill(); }
      const shade = g.createLinearGradient(0, -oh * 1.45, 0, oh * 1.45);
      shade.addColorStop(0, 'rgba(0,0,0,.75)'); shade.addColorStop(.3, 'rgba(0,0,0,0)'); shade.addColorStop(.85, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,.6)');
      g.fillStyle = shade; g.fillRect(-ew, -eh * 2, ew * 2, eh * 4);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-ew * .32 + ox * .3, -oh * .42, ew * .07, oh * .12, -.4, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(-ew * .2 + ox * .3, -oh * .2, ew * .025, oh * .05, -.4, 0, TAU); g.fill();
      g.restore();
      almond(oh); g.strokeStyle = 'rgba(255,90,40,.55)'; g.lineWidth = 2; g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 5; g.globalAlpha = .6; g.stroke(); g.globalAlpha = 1;
    }
    g.restore();
  }

  function drawSerpent(t) {
    sample(t);
    const lastI = Math.max(2, Math.round(form * N));
    const body = new Path2D();
    for (let i = 0; i <= lastI; i++) { const p = pts[i]; body.lineTo(p.x + p.nx * p.w, p.y + p.ny * p.w); }
    for (let i = lastI; i >= 0; i--) { const p = pts[i]; body.lineTo(p.x - p.nx * p.w, p.y - p.ny * p.w); }
    body.closePath();
    g.save(); g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = BW; g.shadowOffsetY = BW * .2; g.fillStyle = '#040207'; g.fill(body); g.restore();
    const ll = Math.hypot(LX, LY, .9), L0 = LX / ll, L1 = LY / ll, L2 = .9 / ll;
    const seg = SPAN * R / COLS, veins = .016 + awake * .05;
    g.lineWidth = .6;
    for (let j = 0; j < COLS; j++) for (let k = 0; k < ROWS; k++) {
      const s = (j + (k & 1) * .5 + .5) / COLS; if (s >= form || s >= 1) continue;
      const p = pts[Math.round(s * N)];
      const phi = (-1 + (k + .5) * 2 / ROWS) * Math.PI / 2 * .93, sn = Math.sin(phi), cs = Math.cos(phi);
      const off = sn * p.w * .97, cx = p.x + p.nx * off, cy = p.y + p.ny * off;
      const hw = p.w * cs * (Math.PI / ROWS) * .64, len = seg * 1.35 * (.35 + .65 * Math.min(1, p.w / BW * 1.6));
      const dif = Math.max(0, p.nx * sn * L0 + p.ny * sn * L1 + cs * L2), spec = dif ** 30;
      const hue = 268 + 30 * Math.sin(s * 11 + t * .35) + 70 * spec, lit = 2 + 15 * dif * dif + 48 * spec;
      const tx = p.tx, ty = p.ty, nx = p.nx, ny = p.ny, fx = cx + tx * len * .5, fy = cy + ty * len * .5;
      g.beginPath();
      g.moveTo(fx + nx * hw, fy + ny * hw);
      g.quadraticCurveTo(cx - tx * len * .35 + nx * hw * 1.1, cy - ty * len * .35 + ny * hw * 1.1, cx - tx * len * .62, cy - ty * len * .62);
      g.quadraticCurveTo(cx - tx * len * .35 - nx * hw * 1.1, cy - ty * len * .35 - ny * hw * 1.1, fx - nx * hw, fy - ny * hw);
      g.closePath();
      if (rnd[j * ROWS + k] < veins) { const pulse = .5 + .5 * Math.sin(t * 2.3 + j * .7); g.fillStyle = `hsl(${(j + k) & 1 ? 8 : 100},85%,${5 + 22 * pulse}%)`; }
      else g.fillStyle = `hsl(${hue},${38 + 25 * spec}%,${lit}%)`;
      g.fill();
      g.strokeStyle = `hsla(${hue},50%,${lit + 13}%,.5)`; g.stroke();
      if (k === ROWS >> 1 && j % 2 === 0) { g.beginPath(); g.moveTo(cx + tx * len * .3, cy + ty * len * .3); g.lineTo(cx - tx * len * .5, cy - ty * len * .5);
        g.strokeStyle = `hsla(${hue},40%,${lit + 22}%,.5)`; g.stroke(); }
    }
    g.strokeStyle = 'rgba(0,0,0,.85)'; g.lineWidth = 1.6; g.stroke(body);
    g.globalCompositeOperation = 'lighter'; g.beginPath();
    for (let i = 0; i <= lastI; i++) { const p = pts[i]; g.lineTo(p.x + p.nx * p.w * .97, p.y + p.ny * p.w * .97); }
    g.strokeStyle = `rgba(164,119,255,${.25 + awake * .2})`; g.lineWidth = 1.4; g.stroke(); g.globalCompositeOperation = 'source-over';
    for (let s = .1; s < Math.min(.93, form); s += 1 / 72) {
      const p = pts[Math.round(s * N)], len = p.w * (.5 + .12 * Math.sin(s * 90)), bx = p.x + p.nx * p.w * .82, by = p.y + p.ny * p.w * .82;
      const dif = Math.max(0, p.nx * L0 + p.ny * L1 + .4 * L2);
      g.beginPath(); g.moveTo(bx + p.tx * len * .45, by + p.ty * len * .45);
      g.quadraticCurveTo(bx + p.nx * len * .7, by + p.ny * len * .7, bx + p.nx * len * 1.15 - p.tx * len * .95, by + p.ny * len * 1.15 - p.ty * len * .95);
      g.lineTo(bx - p.tx * len * .45, by - p.ty * len * .45); g.closePath();
      g.fillStyle = `hsl(36,14%,${12 + dif * 36}%)`; g.fill(); g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = .8; g.stroke();
    }
    if (form < 1) { const p = pts[lastI]; for (let i = 0; i < 3; i++) { const a = Math.random() * TAU, v = 30 + Math.random() * 120;
      parts.push({ x: p.x + (Math.random() - .5) * p.w * 2, y: p.y + (Math.random() - .5) * p.w * 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: .5 + Math.random() * .7,
        col: Math.random() < .5 ? '#ff6a1a' : '#a477ff' }); } }
    else drawHead(t);
  }

  const HEAD = [[-.15, -.95], [.3, -1.25], [.85, -1.2], [1.35, -.88], [1.8, -.52], [2.1, -.2], [2.2, 0], [2.1, .2], [1.8, .52], [1.35, .88], [.85, 1.2], [.3, 1.25], [-.15, .95]];
  function smoothClosed(pp) {
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = pp.length;
    g.beginPath(); g.moveTo(...m(pp[n - 1], pp[0]));
    for (let i = 0; i < n; i++) g.quadraticCurveTo(...pp[i], ...m(pp[i], pp[(i + 1) % n]));
    g.closePath();
  }
  function drawHead(t) {
    const p = pts[N], lw = px => px / BW, rise = smooth(eyes * 3);
    g.save(); g.translate(p.x, p.y); g.transform(p.tx, p.ty, p.nx, p.ny, 0, 0); g.scale(BW, BW);
    g.globalAlpha = rise;
    for (const side of [-1, 1]) for (let h = 0; h < 4; h++) {
      const a0 = [.7, .45, .2, -.05][h], b0 = [.8, 1.0, 1.08, .95][h] * side, len = [2.2, 2.8, 2.3, 1.5][h], spread = [.45, .9, 1.25, .3][h];
      let px = a0, py = b0;
      for (let k = 1; k <= 18; k++) { const q = k / 18;
        const x = a0 - q * len, y = b0 + side * (q * spread + Math.sin(q * 6 + t * (1.3 + awake * 2) + h * 2) * .15 * q);
        g.beginPath(); g.moveTo(px, py); g.lineTo(x, y);
        g.strokeStyle = `hsl(35,12%,${50 - q * 34}%)`; g.lineWidth = .18 * (1 - q) + .035; g.lineCap = 'round'; g.stroke(); px = x; py = y; }
      g.fillStyle = '#2b241f'; g.beginPath(); g.ellipse(px, py, .09, .055, 0, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,80,20,${.6 * eyes})`; g.beginPath(); g.arc(px + .03, py, .018, 0, TAU); g.fill();
    }
    g.save(); g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = BW * .5;
    smoothClosed(HEAD);
    const sk = g.createRadialGradient(.75, -.25, .1, .8, 0, 1.8);
    sk.addColorStop(0, '#2e1b3d'); sk.addColorStop(.6, '#0d0614'); sk.addColorStop(1, '#020103'); g.fillStyle = sk; g.fill(); g.restore();
    g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = lw(1.6); g.stroke();
    g.strokeStyle = 'rgba(170,130,220,.3)'; g.lineWidth = lw(.8);
    for (const [a, b, rx, ry] of [[.3, 0, .22, .3], [.72, 0, .2, .26], [1.1, 0, .17, .2], [1.45, 0, .14, .15], [1.75, 0, .1, .1],
      [.45, -.6, .2, .16], [.45, .6, .2, .16], [1.25, -.45, .15, .12], [1.25, .45, .15, .12], [1.6, -.3, .1, .08], [1.6, .3, .1, .08]]) {
      g.beginPath(); g.ellipse(a, b, rx, ry, 0, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(.05, 0); g.lineTo(1.9, 0); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = lw(1.2); g.stroke();
    g.fillStyle = '#e9dfc8';
    for (const s of [-1, 1]) {
      g.beginPath(); g.moveTo(1.6, .5 * s); g.quadraticCurveTo(2.05, .7 * s, 2.24, .26 * s); g.lineTo(1.84, .38 * s); g.closePath(); g.fill();
      for (let a = 1; a < 1.6; a += .14) { const b = 1.2 * (2.2 - a) / 1.35 * s; g.beginPath(); g.moveTo(a, b); g.lineTo(a + .06, b * .8); g.lineTo(a + .12, b * .98); g.fill(); }
    }
    g.fillStyle = '#000'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(1.95, .16 * s, .07, .028, 0, 0, TAU); g.fill(); }
    const glow = (1 + awake * 1.8) * eyes, pulse = .8 + .2 * Math.sin(t * 2.2);
    for (const s of [-1, 1]) {
      g.globalCompositeOperation = 'lighter';
      const eg = g.createRadialGradient(.95, .72 * s, 0, .95, .72 * s, .8 * glow + .01);
      eg.addColorStop(0, `rgba(255,80,20,${.55 * pulse})`); eg.addColorStop(1, 'rgba(255,40,0,0)');
      g.fillStyle = eg; g.beginPath(); g.arc(.95, .72 * s, .8 * glow + .01, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
      g.save(); g.beginPath(); g.ellipse(.95, .72 * s, .3, .13 * eyes + .005, 0, 0, TAU); g.clip();
      g.drawImage(iris, .95 - .32, .72 * s - .32, .64, .64);
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(.95, .72 * s, .035, .12, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(.86, .72 * s - .05, .05, .025, 0, 0, TAU); g.fill(); g.restore();
      g.beginPath(); g.moveTo(.45, .55 * s); g.quadraticCurveTo(.95, 1.05 * s, 1.4, .6 * s);
      g.strokeStyle = 'hsl(36,16%,55%)'; g.lineWidth = .09; g.stroke();
    }
    g.restore();
  }

  function drawParts(dt) {
    g.globalCompositeOperation = 'lighter';
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life += dt; if (p.life > p.max) { parts.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .97; g.globalAlpha = 1 - p.life / p.max; g.fillStyle = p.col;
      g.beginPath(); g.arc(p.x, p.y, 1.8, 0, TAU); g.fill(); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; T += dt;
    const el = (now - t0) / 1000;
    form = REDUCED ? 1 : smooth(el / 7);
    if (form >= 1) eyes = Math.min(1, eyes + dt * .7);
    if (eyes >= 1 && !roared) { roared = true; Audio.sfx('boom'); Audio.awaken(); revealT = el + 3; }
    if (roared) awake += (1 - awake) * Math.min(1, dt * .5);
    if (revealT && el > revealT) { revealT = 0; showReveal(); }
    rot -= dt * (.03 + awake * .12) * (REDUCED ? .2 : 1);
    LX += (tLX - LX) * dt * 3; LY += (tLY - LY) * dt * 3;
    drawVoid(T, dt); drawSerpent(T); drawParts(dt);
    raf = requestAnimationFrame(frame);
  }
  function showReveal() {
    $('#lines').innerHTML = REVEAL.map(([gl, t]) => `<p>${gl ? Glyph.svg(gl) : ''}${t}</p>`).join('');
    $('#reveal').hidden = false;
    $$('#lines p').forEach((p, i) => setTimeout(() => p.classList.add('on'), 400 + i * 1600));
  }
  const onMove = e => { tLX = (e.clientX / W - .5) * 1.6; tLY = (e.clientY / H - .5) * 1.6; };

  return {
    guard: () => S.turned.every(Boolean),
    build(el) {
      el.innerHTML = `<canvas id="serpent"></canvas><a class="backlink" href="#map">↺ The Descent</a>
        <div id="reveal" hidden><div><div class="lines" id="lines"></div><div class="ctrls"><button type="button" id="stare">Stare into it</button></div></div></div>`;
      g = $('#serpent', el).getContext('2d'); iris = irisTexture();
      $('#stare', el).onclick = () => { $('#reveal').hidden = true; toast('It is looking back.'); };
    },
    enter() {
      Ambient.pause(true); resize(); motes = Array.from({ length: REDUCED ? 120 : 420 }, () => spawn({}, true)); parts = [];
      form = eyes = awake = 0; roared = false; revealT = 0; $('#reveal').hidden = true;
      addEventListener('resize', resize); addEventListener('pointermove', onMove);
      t0 = last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    },
    leave() { cancelAnimationFrame(raf); Ambient.pause(false); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); },
  };
})();
