// Thessaros illustration kit: shared SVG defs and the procedural pieces every room is drawn from.
// Scenes are 1600 x 1000 one-point-perspective views. Everything here returns SVG markup strings.
const Art = (() => {
  let seed = 1;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const srand = s => { seed = (s * 9301 + 49297) % 2147483647 || 1; };
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = n => +n.toFixed(1);

  // A tile of stone grain, made once on a canvas and used as an SVG pattern.
  function grain() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    for (let i = 0; i < 2600; i++) { const v = Math.random(); g.fillStyle = v < .55 ? `rgba(0,0,0,${.08 + Math.random() * .22})` : `rgba(200,205,215,${.02 + Math.random() * .05})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2.5, 1 + Math.random() * 2.5); }
    for (let i = 0; i < 18; i++) { let x = Math.random() * 256, y = Math.random() * 256; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 12; k++) { x += (Math.random() - .5) * 18; y += (Math.random() - .5) * 18; g.lineTo(x, y); }
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = .6; g.stroke(); }
    return c.toDataURL();
  }

  function defs() {
    return `<defs>
      <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0e11"/><stop offset=".55" stop-color="#1a1b20"/><stop offset="1" stop-color="#121317"/></linearGradient>
      <linearGradient id="gWallL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#26272c"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
      <linearGradient id="gWallR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#232429"/><stop offset="1" stop-color="#0b0c0e"/></linearGradient>
      <linearGradient id="gFloor" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#25252a"/><stop offset="1" stop-color="#09090b"/></linearGradient>
      <linearGradient id="gCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040405"/><stop offset="1" stop-color="#0d0e10"/></linearGradient>
      <linearGradient id="gStone" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5e6168"/><stop offset=".5" stop-color="#34363c"/><stop offset="1" stop-color="#16171a"/></linearGradient>
      <linearGradient id="gStoneV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d5057"/><stop offset="1" stop-color="#1b1c20"/></linearGradient>
      <linearGradient id="gPillar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121316"/><stop offset=".3" stop-color="#3b3d43"/><stop offset=".55" stop-color="#2a2c31"/><stop offset="1" stop-color="#0c0d0f"/></linearGradient>
      <linearGradient id="gBronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a7a55"/><stop offset=".5" stop-color="#4c4330"/><stop offset="1" stop-color="#1f1b13"/></linearGradient>
      <linearGradient id="gVerd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f9488"/><stop offset=".6" stop-color="#34504a"/><stop offset="1" stop-color="#141e1c"/></linearGradient>
      <linearGradient id="gBone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9d0bc"/><stop offset="1" stop-color="#6e675a"/></linearGradient>
      <linearGradient id="gFogUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa8ad" stop-opacity="0"/><stop offset=".6" stop-color="#7e8c92" stop-opacity=".09"/><stop offset="1" stop-color="#5d6a70" stop-opacity=".16"/></linearGradient>
      <linearGradient id="gShaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd6d6" stop-opacity=".13"/><stop offset="1" stop-color="#cfd6d6" stop-opacity="0"/></linearGradient>
      <linearGradient id="gTealUp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4fd6c4" stop-opacity=".35"/><stop offset="1" stop-color="#4fd6c4" stop-opacity="0"/></linearGradient>
      <radialGradient id="gPit"><stop offset="0" stop-color="#000"/><stop offset=".75" stop-color="#030304"/><stop offset="1" stop-color="#0b0c0e"/></radialGradient>
      <radialGradient id="gDoorDark" cx=".5" cy=".7" r=".8"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#08090a"/></radialGradient>
      <radialGradient id="gLamp"><stop offset="0" stop-color="#e8d9b4" stop-opacity=".55"/><stop offset=".25" stop-color="#cdb98f" stop-opacity=".18"/><stop offset="1" stop-color="#cdb98f" stop-opacity="0"/></radialGradient>
      <radialGradient id="gLantern" cx=".5" cy="1"><stop offset="0" stop-color="#d8cbaa" stop-opacity=".16"/><stop offset=".6" stop-color="#d8cbaa" stop-opacity=".04"/><stop offset="1" stop-color="#d8cbaa" stop-opacity="0"/></radialGradient>
      <radialGradient id="gTeal"><stop offset="0" stop-color="#7ff0e0" stop-opacity=".9"/><stop offset=".2" stop-color="#4fd6c4" stop-opacity=".35"/><stop offset="1" stop-color="#4fd6c4" stop-opacity="0"/></radialGradient>
      <radialGradient id="gTealSoft"><stop offset="0" stop-color="#4fd6c4" stop-opacity=".22"/><stop offset="1" stop-color="#4fd6c4" stop-opacity="0"/></radialGradient>
      <radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".92"/></radialGradient>
      <radialGradient id="gThroat" cx=".5" cy=".45"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#020303"/><stop offset=".85" stop-color="#0a0d0e"/><stop offset="1" stop-color="#15171a"/></radialGradient>
      <pattern id="pGrain" width="256" height="256" patternUnits="userSpaceOnUse"><image href="${grain()}" width="256" height="256"/></pattern>
      <pattern id="pBlocks" width="140" height="70" patternUnits="userSpaceOnUse">
        <path d="M0 .5H140M0 35.5H140M70 0V35M0 35V70M140 35V70" stroke="#000" stroke-opacity=".55" stroke-width="2" fill="none"/>
        <path d="M0 2.5H140M0 37.5H140M72 2V35M2 37V70" stroke="#fff" stroke-opacity=".035" stroke-width="1.5" fill="none"/></pattern>
      <filter id="fRough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
      <filter id="fBlur"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="fGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;
  }

  /* ---------- the room box ---------- */
  // A one-point-perspective chamber. back = [x0, y0, x1, y1] is the far wall. Returns markup and a mapper for the side walls.
  function room({ back: [x0, y0, x1, y1], courses = 7, slabs = 9, ceiling = true }) {
    let s = `<rect width="1600" height="1000" fill="#050506"/>`;
    s += `<polygon points="0,0 1600,0 ${x1},${y0} ${x0},${y0}" fill="url(#gCeil)"/>`;
    s += `<polygon points="0,1000 1600,1000 ${x1},${y1} ${x0},${y1}" fill="url(#gFloor)"/>`;
    s += `<polygon points="0,0 ${x0},${y0} ${x0},${y1} 0,1000" fill="url(#gWallL)"/>`;
    s += `<polygon points="1600,0 ${x1},${y0} ${x1},${y1} 1600,1000" fill="url(#gWallR)"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#gBack)"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#pBlocks)" opacity=".8"/>`;
    let lines = '';
    for (let k = 1; k < courses; k++) { const q = k / courses, yb = lerp(y0, y1, q), ys = lerp(0, 1000, q);
      lines += `M0 ${f1(ys)}L${x0} ${f1(yb)}M1600 ${f1(ys)}L${x1} ${f1(yb)}`; }
    for (let k = 1; k < 6; k++) { const t = 1 - 1 / (1 + k * .55); const xl = lerp(0, x0, t), xr = lerp(1600, x1, t);
      lines += `M${f1(xl)} ${f1(lerp(0, y0, t))}V${f1(lerp(1000, y1, t))}M${f1(xr)} ${f1(lerp(0, y0, t))}V${f1(lerp(1000, y1, t))}`; }
    for (let k = 0; slabs && k <= slabs; k++) { const bx = lerp(-600, 2200, k / slabs), fx = lerp(x0, x1, k / slabs); lines += `M${f1(bx)} 1000L${f1(fx)} ${y1}`; }
    for (let k = 1; k < 6; k++) { const y = y1 + (1000 - y1) * (k / 6) ** 1.8; lines += `M0 ${f1(y)}H1600`; }
    s += `<path d="${lines}" stroke="#000" stroke-opacity=".5" stroke-width="2" fill="none"/>`;
    s += `<polygon points="0,1000 1600,1000 ${x1},${y1} ${x0},${y1}" fill="url(#pGrain)" opacity=".7"/>`;
    s += `<rect width="1600" height="1000" fill="url(#pGrain)" opacity=".45"/>`;
    if (!ceiling) s += `<polygon points="0,0 1600,0 ${x1},${y0} ${x0},${y0}" fill="#000" opacity=".6"/>`;
    // point on a side wall: t from 0 (near edge of the screen) to 1 (the back wall), h from 0 (ceiling) to 1 (floor)
    const L = (t, h) => [f1(lerp(0, x0, t)), f1(lerp(lerp(0, y0, t), lerp(1000, y1, t), h))];
    const R = (t, h) => [f1(lerp(1600, x1, t)), f1(lerp(lerp(0, y0, t), lerp(1000, y1, t), h))];
    // point on the floor: u across (0 left wall .. 1 right wall), t depth as above
    const F = (u, t) => [f1(lerp(lerp(0, x0, t), lerp(1600, x1, t), u)), f1(lerp(1000, y1, t))];
    return { s, L, R, F };
  }

  // A doorway cut into a side wall between depths t0 and t1, h0 being where its top sits.
  function sideDoor(P, t0, t1, h0 = .32, opts = {}) {
    const a = P(t0, h0), b = P(t1, h0 + (1 - h0) * .06), c = P(t1, 1), d = P(t0, 1);
    const glow = opts.glow ? `<polygon points="${a} ${b} ${c} ${d}" fill="${opts.glow}" opacity=".25"/>` : '';
    return `<polygon points="${a} ${b} ${c} ${d}" fill="url(#gDoorDark)" stroke="#000" stroke-width="10"/>${glow}
      <polygon points="${a} ${b} ${c} ${d}" fill="none" stroke="#3c3e44" stroke-width="3" opacity=".7"/>`;
  }

  // An arched doorway in a back wall. open=false draws a stone slab in it.
  function arch(cx, base, w, h, opts = {}) {
    const r = w / 2, top = base - h;
    const d = `M${cx - r} ${base}V${top + r}A${r} ${r} 0 0 1 ${cx + r} ${top + r}V${base}Z`;
    let v = '';
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8, c = Math.cos(a), sn = Math.sin(a);
      v += `M${f1(cx + c * r)} ${f1(top + r + sn * r)}L${f1(cx + c * (r + 34))} ${f1(top + r + sn * (r + 34))}`; }
    return `<path d="M${cx - r - 34} ${base}V${top + r}A${r + 34} ${r + 34} 0 0 1 ${cx + r + 34} ${top + r}V${base}Z" fill="url(#gStoneV)"/>
      <path d="${v}M${cx - r - 34} ${top + r + 60}H${cx - r}M${cx + r} ${top + r + 60}H${cx + r + 34}M${cx - r - 34} ${top + r + 130}H${cx - r}M${cx + r} ${top + r + 130}H${cx + r + 34}" stroke="#000" stroke-opacity=".6" stroke-width="2.5"/>
      <path d="${d}" fill="${opts.open === false ? 'url(#gStone)' : 'url(#gDoorDark)'}" stroke="#000" stroke-width="4"/>
      ${opts.open === false ? `<path d="M${cx} ${top + 6}V${base}" stroke="#0008" stroke-width="3"/><path d="${d}" fill="url(#pGrain)"/>` : ''}
      ${opts.glow ? `<path d="${d}" fill="${opts.glow}" opacity=".18"/>` : ''}`;
  }

  function pillar(x, top, base, w = 70) {
    return `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${base - top}" fill="url(#gPillar)"/>
      <rect x="${x - w / 2 - 12}" y="${top}" width="${w + 24}" height="26" fill="url(#gStoneV)"/><rect x="${x - w / 2 - 12}" y="${base - 30}" width="${w + 24}" height="30" fill="url(#gStoneV)"/>
      <rect x="${x - w / 2}" y="${top}" width="${w}" height="${base - top}" fill="url(#pGrain)"/>
      <path d="M${x - w / 2 + 12} ${top + 30}V${base - 34}M${x + w / 4} ${top + 30}V${base - 34}" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
  }

  // Steps going down, away from the viewer, into the dark.
  function stairsDown(cx, y, w, n = 9) {
    let s = '';
    for (let i = 0; i < n; i++) { const q = i / n, q2 = (i + 1) / n, ww = w * (1 - q * .55), ww2 = w * (1 - q2 * .55), yy = y + q * 150, yy2 = y + q2 * 150;
      s += `<polygon points="${f1(cx - ww / 2)},${f1(yy)} ${f1(cx + ww / 2)},${f1(yy)} ${f1(cx + ww2 / 2)},${f1(yy2)} ${f1(cx - ww2 / 2)},${f1(yy2)}" fill="hsl(220,5%,${f1(15 - q * 13)}%)" stroke="#000" stroke-width="2"/>`; }
    return s + `<ellipse cx="${cx}" cy="${y + 175}" rx="${w * .35}" ry="60" fill="#000" filter="url(#fBlur)"/>`;
  }

  // The keepers: hooded figures with both hands over their eyes.
  function keeper(x, base, s = 1, opts = {}) {
    const turned = opts.turned ? `transform="translate(${x} ${base}) scale(${-s} ${s})"` : `transform="translate(${x} ${base}) scale(${s})"`;
    return `<g ${turned}>
      <ellipse cx="0" cy="2" rx="62" ry="12" fill="#000" opacity=".6"/>
      <rect x="-48" y="-36" width="96" height="36" fill="url(#gStoneV)"/><rect x="-48" y="-36" width="96" height="36" fill="url(#pGrain)"/>
      <path d="M-38 -36L-31 -170Q-36 -214 -21 -236Q0 -268 21 -236Q36 -214 31 -170L38 -36Z" fill="url(#gStone)" filter="url(#fRough)"/>
      <path d="M-14 -40L-12 -150M4 -40L6 -160M20 -40L17 -140M-26 -60Q-22 -120 -28 -168" stroke="#000" stroke-opacity=".45" stroke-width="3" fill="none"/>
      <ellipse cx="0" cy="-214" rx="14" ry="18" fill="#050506"/>
      <path d="M-27 -168Q-24 -196 -9 -212M27 -168Q24 -196 9 -212" stroke="url(#gStoneV)" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M-15 -218Q-6 -224 -1 -214Q-6 -206 -14 -208ZM15 -218Q6 -224 1 -214Q6 -206 14 -208Z" fill="#5a5d63"/>
      <path d="M-38 -36L-31 -170Q-36 -214 -21 -236Q0 -268 21 -236Q36 -214 31 -170L38 -36Z" fill="url(#pGrain)"/>
      ${opts.eyeTeal ? '<circle cx="0" cy="-214" r="2.5" fill="#7ff0e0" filter="url(#fGlow)"/>' : ''}</g>`;
  }

  function serpentStatue(x, base, s = 1) {
    return `<g transform="translate(${x} ${base}) scale(${s})">
      <ellipse cx="0" cy="2" rx="80" ry="14" fill="#000" opacity=".6"/>
      <rect x="-64" y="-46" width="128" height="46" fill="url(#gStoneV)"/><rect x="-64" y="-46" width="128" height="46" fill="url(#pGrain)"/>
      <g fill="none" stroke-linecap="round">
        <ellipse cx="0" cy="-64" rx="56" ry="18" stroke="#1d1e22" stroke-width="26"/><ellipse cx="0" cy="-64" rx="56" ry="18" stroke="#4a4d54" stroke-width="18"/>
        <ellipse cx="0" cy="-92" rx="44" ry="14" stroke="#1d1e22" stroke-width="24"/><ellipse cx="0" cy="-92" rx="44" ry="14" stroke="#52555c" stroke-width="16"/>
        <path d="M30 -96Q46 -140 10 -160Q-24 -178 -6 -214" stroke="#1d1e22" stroke-width="24"/><path d="M30 -96Q46 -140 10 -160Q-24 -178 -6 -214" stroke="#5a5d64" stroke-width="15"/></g>
      <path d="M-30 -214Q-8 -238 22 -226Q34 -218 20 -206Q0 -198 -30 -204Z" fill="url(#gStone)" stroke="#111" stroke-width="2"/>
      <path d="M-30 -208Q-40 -210 -46 -206" stroke="#26282c" stroke-width="2" fill="none"/>
      <path d="M-6 -218Q2 -222 8 -217" stroke="#0a0a0b" stroke-width="2.4" fill="none"/>
      <g fill="url(#pGrain)"><ellipse cx="0" cy="-64" rx="64" ry="27"/><ellipse cx="0" cy="-92" rx="52" ry="22"/></g></g>`;
  }

  // Black fibrous growth pushing out of a crack. eyes: how many tiny turquoise points it carries.
  function growth(x, y, s = 1, sd = 1, eyes = 0, dir = -Math.PI / 2) {
    srand(sd); let p = '', e = '';
    const n = 9 + (rnd() * 8 | 0);
    for (let i = 0; i < n; i++) {
      let a = dir + (rnd() - .5) * 2.4, px = x, py = y, w = (6 + rnd() * 7) * s;
      const len = (40 + rnd() * 110) * s, steps = 7;
      let left = '', right = '';
      for (let k = 0; k <= steps; k++) {
        const q = k / steps, ww = w * (1 - q) + .6;
        left += `${f1(px + Math.cos(a + 1.57) * ww)},${f1(py + Math.sin(a + 1.57) * ww)} `;
        right = `${f1(px - Math.cos(a + 1.57) * ww)},${f1(py - Math.sin(a + 1.57) * ww)} ` + right;
        a += (rnd() - .5) * .9; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps;
      }
      p += `<polygon points="${left}${right}" fill="${i % 3 ? '#07080a' : '#0f1216'}" stroke="#1c232a" stroke-width=".8"/>`;
    }
    for (let i = 0; i < 26; i++) { const a = rnd() * TAU, r = rnd() * 40 * s; p += `<path d="M${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r * .6)}q${f1((rnd() - .5) * 30 * s)} ${f1(-rnd() * 40 * s)} ${f1((rnd() - .5) * 50 * s)} ${f1(-rnd() * 60 * s)}" stroke="#0b0d10" stroke-width="${f1(1 + rnd() * 2)}" fill="none"/>`; }
    for (let i = 0; i < eyes; i++) { const ex = x + (rnd() - .5) * 50 * s, ey = y - rnd() * 40 * s;
      e += `<g class="teye" style="animation-delay:${f1(rnd() * 6)}s"><circle cx="${f1(ex)}" cy="${f1(ey)}" r="${f1(9 * s)}" fill="url(#gTeal)" opacity=".5"/><circle cx="${f1(ex)}" cy="${f1(ey)}" r="${f1(1.7 * s + .4)}" fill="#9ff7ea"/></g>`; }
    return `<g class="growth">${p}<ellipse cx="${x}" cy="${y}" rx="${30 * s}" ry="${10 * s}" fill="#000" opacity=".8"/>${e}</g>`;
  }

  // Carved serpent script. size is the glyph height in scene units.
  function carve(text, x, y, size = 40, opts = {}) {
    const k = size / 20, w = Glyph.width(text) * k, ox = opts.center ? x - w / 2 : x;
    const p = Glyph.paths(text);
    return `<g class="carve ${opts.cls || ''}" transform="translate(${f1(ox)} ${y}) scale(${f1(k)})">
      <g stroke="#000" stroke-opacity=".8" stroke-width="${opts.w || 1.5}" transform="translate(.35 .45)" fill="none">${p}</g>
      <g stroke="${opts.col || '#a59f92'}" stroke-opacity="${opts.op ?? .75}" stroke-width="${(opts.w || 1.5) * .7}" fill="none" ${opts.glow ? 'filter="url(#fGlow)"' : ''}>${p}</g></g>`;
  }

  function lamp(x, y, lit = true, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">${lit ? `<circle r="150" fill="url(#gLamp)" class="flick"/>` : ''}
      <path d="M-16 20H16L10 34H-10Z M0 34V60 M-12 60H12" stroke="#2a2621" stroke-width="5" fill="#1c1915"/>
      ${lit ? '<path class="flame" d="M0 -12Q8 2 5 14Q2 20 0 20Q-2 20 -5 14Q-8 2 0 -12Z" fill="#e9dcb8"/>' : '<path d="M-4 18h8" stroke="#000" stroke-width="3"/>'}</g>`;
  }

  function rubble(x, y, w = 200, sd = 5) {
    srand(sd); let s = '';
    for (let i = 0; i < 14; i++) { const cx = x + (rnd() - .5) * w, cy = y - rnd() * w * .18, r = 10 + rnd() * w * .12, pts = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + rnd() * .5; pts.push(`${f1(cx + Math.cos(a) * r)},${f1(cy + Math.sin(a) * r * .6)}`); }
      s += `<polygon points="${pts.join(' ')}" fill="hsl(220,4%,${f1(9 + rnd() * 14)}%)" stroke="#000" stroke-width="2"/>`; }
    return s;
  }

  const fog = (y = 600, h = 400, op = 1) => `<rect class="fog" x="-200" y="${y}" width="2000" height="${h}" fill="url(#gFogUp)" opacity="${op}"/>`;
  const shaft = (x, w = 220, op = 1) => `<polygon points="${x - w * .3},0 ${x + w * .3},0 ${x + w},1000 ${x - w},1000" fill="url(#gShaft)" opacity="${op}"/>`;
  const vignette = () => `<rect width="1600" height="1000" fill="url(#gVig)" pointer-events="none"/><rect x="0" y="560" width="1600" height="440" fill="url(#gLantern)" pointer-events="none"/>`;

  // The great shaft, seen from one of its rings: the far wall curves around a pit with no visible bottom.
  function throat({ depth = 0, teal = 0 } = {}) {
    let s = `<rect width="1600" height="1000" fill="#040405"/>`;
    // the far wall: three ledges of the spiral, curving around the shaft
    for (let i = 0; i < 4; i++) { const y = 120 + i * 150, l = 15 - i * 2.4 - depth * 1.5;
      s += `<path d="M-100 ${y + 220}Q800 ${y - 120} 1700 ${y + 220}V${y + 380}Q800 ${y + 30} -100 ${y + 380}Z" fill="hsl(220,5%,${f1(Math.max(3, l))}%)"/>
        <path d="M-100 ${y + 220}Q800 ${y - 120} 1700 ${y + 220}" stroke="#000" stroke-width="5" fill="none"/>
        <path d="M-100 ${y + 226}Q800 ${y - 114} 1700 ${y + 226}" stroke="#fff" stroke-opacity=".04" stroke-width="2" fill="none"/>`; }
    s += `<rect width="1600" height="1000" fill="url(#pGrain)" opacity=".5"/>`;
    s += `<ellipse cx="800" cy="720" rx="760" ry="250" fill="url(#gThroat)"/>`;
    s += `<ellipse cx="800" cy="760" rx="520" ry="150" fill="#000" filter="url(#fBlur)"/>`;
    if (teal) s += `<ellipse cx="800" cy="790" rx="${300 + teal * 160}" ry="${80 + teal * 40}" fill="url(#gTealSoft)" opacity="${f1(.3 + teal * .5)}" class="breathe"/>`;
    return s;
  }
  // The near ledge of a ring: floor and a balustrade over the void.
  function ledge() {
    let s = `<path d="M-50 1000V880Q800 760 1650 880V1000Z" fill="#17181b"/><path d="M-50 880Q800 760 1650 880" stroke="#000" stroke-width="8" fill="none"/>`;
    for (let i = 0; i <= 16; i++) { const x = -40 + i * 105, y = 880 - Math.sin(i / 16 * Math.PI) * 112;
      s += `<rect x="${f1(x - 9)}" y="${f1(y - 70)}" width="18" height="70" fill="url(#gStoneV)" stroke="#000" stroke-width="2"/>`; }
    s += `<path d="M-50 812Q800 692 1650 812" stroke="#2c2e33" stroke-width="16" fill="none"/><path d="M-50 806Q800 686 1650 806" stroke="#45474d" stroke-width="3" fill="none"/>`;
    return s + `<path d="M-50 1000V880Q800 760 1650 880V1000Z" fill="url(#pGrain)"/>`;
  }

  /* ---------- interactive wrappers ---------- */
  const hs = (id, label, inner, opts = '') => `<g class="hs" data-hs="${id}" tabindex="0" role="button" aria-label="${label}" ${opts}>${inner}</g>`;
  const exit = (id, label, inner) => `<g class="hs exit" data-exit="${id}" tabindex="0" role="button" aria-label="${label}">${inner}<title>${label}</title></g>`;

  return { defs, room, sideDoor, arch, pillar, stairsDown, keeper, serpentStatue, growth, carve, lamp, rubble, fog, shaft, vignette, throat, ledge, hs, exit, srand, rnd, f1 };
})();
