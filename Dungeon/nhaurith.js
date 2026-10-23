// Nhaurith, the One Below. A layered canvas renderer (procedural textures baked once, bent and lit every frame)
// and the timed reveal: darkness, two eyes, darkness again, her shape, and the Eye.
const Nhaurith = (() => {
  /* ---------------- seeded randomness ---------------- */
  let sd = 1;
  const R = () => (sd = sd * 16807 % 2147483647) / 2147483647, seed = s => { sd = s; };
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };

  /* ---------------- baked textures ---------------- */
  // A strip of her body: a ragged ribbon of tangled fibre, banded like scale and sinew. Bent along paths at draw time.
  function strandTexture() {
    const [c, g] = mk(1024, 128); seed(7);
    const top = [], bot = [];
    for (let x = 0; x <= 1024; x += 16) { top.push([x, 16 + R() * 14]); bot.push([x, 112 - R() * 14]); }
    const body = new Path2D(); body.moveTo(0, top[0][1]); top.forEach(p => body.lineTo(...p)); bot.reverse().forEach(p => body.lineTo(...p)); body.closePath();
    const gr = g.createLinearGradient(0, 0, 0, 128);
    [[0, '#030305'], [.25, '#0b0d13'], [.42, '#141822'], [.6, '#0c0f15'], [.85, '#050609'], [1, '#020203']].forEach(s => gr.addColorStop(...s));
    g.fillStyle = gr; g.fill(body);
    g.save(); g.clip(body);
    // bands: ridges of overlapping plates
    for (let x = 0; x < 1024; x += 26 + R() * 30) {
      g.beginPath(); g.moveTo(x, 10); g.bezierCurveTo(x + 14, 40, x - 8, 86, x + 10, 120);
      g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = 4 + R() * 4; g.stroke();
      g.beginPath(); g.moveTo(x + 4, 10); g.bezierCurveTo(x + 18, 40, x - 4, 70, x + 8, 92);
      g.strokeStyle = `rgba(70,84,104,${.12 + R() * .14})`; g.lineWidth = 1.2; g.stroke();
    }
    // overlapping plates and knots, each catching a little light on its upper lip, like the reference's crusted hide
    for (let i = 0; i < 520; i++) {
      const x = R() * 1040 - 8, y = 18 + R() * 92, w = 8 + R() * 26, h = w * (.3 + R() * .35), a = (R() - .5) * .9;
      g.save(); g.translate(x, y); g.rotate(a);
      g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * .3, -h * 1.7, w, -h * .1); g.quadraticCurveTo(w * .1, h, -w, 0);
      g.fillStyle = `hsl(222,14%,${2 + R() * 5}%)`; g.fill();
      const lit = Math.max(0, 1 - Math.abs(y - 40) / 60);
      g.beginPath(); g.moveTo(-w * .85, -h * .2); g.quadraticCurveTo(-w * .25, -h * 1.45, w * .9, -h * .15);
      g.strokeStyle = R() < .07 ? `rgba(60,170,158,${.35 + R() * .3})` : `hsla(216,18%,${10 + lit * 36 * R()}%,.85)`; g.lineWidth = .8 + R() * 1.4; g.stroke();
      g.restore();
    }
    // fibres along the length, lighter on the upper side as if lit from above
    for (let i = 0; i < 2200; i++) {
      const x = R() * 1060 - 20, y = 14 + Math.pow(R(), .9) * 100, len = 8 + R() * 54, a = (R() - .5) * .5;
      const lit = Math.max(0, 1 - Math.abs(y - 44) / 50);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + (R() - .5) * 10, x + Math.cos(a) * len, y + Math.sin(a) * len);
      const l = 4 + lit * 20 * R();
      g.strokeStyle = R() < .06 ? `rgba(40,110,104,${.25 + R() * .3})` : `hsla(${215 + R() * 15},${18 + R() * 10}%,${l}%,${.35 + R() * .5})`;
      g.lineWidth = .5 + R() * 1.6; g.stroke();
    }
    // a teal rim from below
    const rim = g.createLinearGradient(0, 80, 0, 116); rim.addColorStop(0, 'rgba(40,150,140,0)'); rim.addColorStop(1, 'rgba(40,150,140,.22)');
    g.fillStyle = rim; g.fillRect(0, 80, 1024, 40);
    g.restore();
    // hair and ragged fringe breaking the silhouette
    for (let i = 0; i < 700; i++) {
      const x = R() * 1024, up = R() < .5, y = up ? top[Math.round(x / 16)][1] : 128 - (128 - bot[bot.length - 1 - Math.round(x / 16)][1]);
      const len = 5 + R() * 26, a = (up ? -1 : 1) * (Math.PI / 2 + (R() - .5) * 1.6);
      g.beginPath(); g.moveTo(x, y + (up ? 3 : -3)); g.quadraticCurveTo(x + Math.cos(a) * len * .6 + (R() - .5) * 8, y + Math.sin(a) * len * .6, x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.strokeStyle = `rgba(${8 + R() * 14},${10 + R() * 14},${16 + R() * 18},.9)`; g.lineWidth = .5 + R() * 1.4; g.stroke();
    }
    return c;
  }

  // Her head in profile, facing left, after the reference: a long broad snout, needle teeth,
  // a beard of hanging tendrils, a mane of ragged plates and a small cluster of eyes above the snout.
  const HEAD_W = 1400, HEAD_H = 1000, EYE_ANCHOR = [505, 287];
  const SMALL_EYES = [[480, 291, 7.5], [527, 281, 8], [503, 303, 5], [548, 297, 4.2], [462, 307, 3.6], [512, 266, 3.2]];
  function headTexture() {
    const [c, g] = mk(HEAD_W, HEAD_H); seed(11);
    const path = pts => { const p = new Path2D(); p.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; p.quadraticCurveTo(...pts[i], ...m); } p.lineTo(...pts.at(-1)); p.closePath(); return p; };
    const fibres = (clip, n, dir, light, wmax = 1.8) => {
      g.save(); g.clip(clip);
      for (let i = 0; i < n; i++) {
        const x = R() * HEAD_W, y = R() * HEAD_H; if (!g.isPointInPath(clip, x, y)) continue;
        const a = dir(x, y) + (R() - .5) * .5, len = 10 + R() * 46, l = light(x, y);
        g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * len * .5 + (R() - .5) * 8, y + Math.sin(a) * len * .5 + (R() - .5) * 8, x + Math.cos(a) * len, y + Math.sin(a) * len);
        g.strokeStyle = R() < .04 ? `rgba(46,130,122,${.3 + R() * .3})` : `hsla(${212 + R() * 18},${16 + R() * 12}%,${3 + l * (10 + R() * 18)}%,${.5 + R() * .45})`;
        g.lineWidth = .5 + R() * wmax; g.stroke();
      }
      g.restore();
    };
    const plates = (x0, x1, yAt, n, sz, dirA) => {
      for (let i = 0; i < n; i++) {
        const x = x0 + R() * (x1 - x0), y = yAt(x) + R() * 30, a = dirA + (R() - .5) * .6, w = sz * (.5 + R()), h = w * (.35 + R() * .25);
        g.save(); g.translate(x, y); g.rotate(a);
        g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * .2, -h * 1.6, w, -h * .2); g.quadraticCurveTo(w * .2, h * .8, -w, 0);
        g.fillStyle = `hsl(220,14%,${3 + R() * 4}%)`; g.fill();
        g.beginPath(); g.moveTo(-w * .8, -h * .25); g.quadraticCurveTo(-w * .1, -h * 1.3, w * .9, -h * .3);
        g.strokeStyle = `hsla(214,18%,${16 + R() * 18}%,.7)`; g.lineWidth = 1 + R(); g.stroke();
        g.restore();
      }
    };
    const taper = (x, y, a, len, w, bend, col, steps = 14) => {
      const L = [], Rt = []; let px = x, py = y;
      for (let k = 0; k <= steps; k++) { const q = k / steps, ww = w * (1 - q) + .25;
        L.push([px + Math.cos(a + 1.57) * ww, py + Math.sin(a + 1.57) * ww]); Rt.unshift([px - Math.cos(a + 1.57) * ww, py - Math.sin(a + 1.57) * ww]);
        a += bend + (R() - .5) * .18; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; }
      g.beginPath(); [...L, ...Rt].forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); g.fillStyle = col; g.fill();
    };
    // body and neck behind everything: tangled coils filling the right of the canvas
    const neck = path([[720, 420], [860, 300], [1080, 260], [1400, 260], [1400, 1000], [900, 1000], [760, 760], [700, 560]]);
    g.fillStyle = '#040508'; g.fill(neck);
    fibres(neck, 9000, (x, y) => .9 + Math.sin(y * .01 + x * .004) * .9, (x, y) => .25 + .4 * Math.max(0, 1 - (y - 260) / 500), 2.4);
    for (let i = 0; i < 18; i++) { const x = 760 + R() * 640, y = 330 + R() * 650; g.beginPath(); g.ellipse(x, y, 60 + R() * 120, 20 + R() * 40, R() * 3, 0, 6.3);
      g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 6 + R() * 8; g.stroke(); g.strokeStyle = 'rgba(60,72,92,.18)'; g.lineWidth = 1.5; g.stroke(); }
    // the mane: a shaggy mass rising behind the brow
    const mane = path([[470, 260], [540, 150], [660, 70], [820, 30], [1000, 40], [1200, 90], [1400, 150], [1400, 420], [1080, 380], [880, 420], [700, 400], [560, 330]]);
    g.fillStyle = '#05060a'; g.fill(mane);
    fibres(mane, 12000, (x, y) => -.35 + (x - 500) * .0006 + Math.sin(x * .02) * .4, (x, y) => .3 + .6 * Math.max(0, 1 - (y - 30) / 300), 2.2);
    plates(520, 1380, x => 150 - Math.sin((x - 520) / 880 * 3) * 90, 140, 34, -.25);
    for (let i = 0; i < 260; i++) { const x = 500 + R() * 900, y = 160 - Math.sin((x - 500) / 900 * 3.1) * 120 + R() * 60;
      taper(x, y, -2.2 + (x - 500) / 900 * 1.6 + (R() - .5) * .7, 50 + R() * 190, 3 + R() * 7, .02 + R() * .05, R() < .2 ? '#141821' : '#06070b'); }
    // the lower jaw, hanging slightly open
    const jaw = path([[120, 425], [300, 440], [520, 462], [720, 470], [830, 520], [800, 570], [640, 560], [420, 520], [220, 480]]);
    g.fillStyle = '#05060a'; g.fill(jaw);
    fibres(jaw, 3500, () => 0.08, (x, y) => .25 + .4 * Math.max(0, 1 - (y - 440) / 100), 1.6);
    // the mouth: dark inside, then the teeth
    const mouth = path([[60, 352], [260, 384], [500, 410], [720, 440], [720, 470], [500, 462], [300, 442], [130, 425]]);
    g.fillStyle = '#010102'; g.fill(mouth);
    const tooth = (x, y, len, up) => { const a = up ? -1.6 - (R() - .5) * .3 : 1.45 + (x / 800) * .25 + (R() - .5) * .25, w = 2.6 + R() * 2.6;
      const gr = g.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len); gr.addColorStop(0, '#2c2428'); gr.addColorStop(.35, `hsl(345,${8 + R() * 8}%,${40 + R() * 18}%)`); gr.addColorStop(1, `hsl(20,${6 + R() * 8}%,${58 + R() * 18}%)`);
      taper(x, y, a, len, w, up ? .01 : -.012, gr, 10); };
    for (let x = 150; x < 640; x += 16 + R() * 26) tooth(x, 443 + (x - 140) * .05 + R() * 6, 18 + R() * 56 * (1 - (x - 140) / 700), true);
    for (let x = 74; x < 600; x += 14 + R() * 24) tooth(x, 356 + (x - 60) * .1 + R() * 4, 30 + R() * 110 * (1 - (x - 70) / 760) * (R() < .25 ? .45 : 1), false);
    // the snout: long, broad, plated, faintly lit along its top
    const snout = path([[30, 330], [120, 300], [260, 274], [400, 256], [520, 236], [640, 210], [780, 250], [820, 360], [760, 438], [560, 414], [380, 394], [200, 370], [40, 350]]);
    g.fillStyle = '#06070b'; g.fill(snout);
    fibres(snout, 9000, (x, y) => Math.PI + .06 - (y - 300) * .002, (x, y) => .2 + .8 * Math.max(0, 1 - (y - 230) / 150), 1.7);
    plates(50, 760, x => 300 - (x - 30) * .07, 120, 22, -.08);
    for (let x = 90; x < 700; x += 18 + R() * 46) { const k = (R() - .5) * 30; g.beginPath(); g.moveTo(x + k * .3, 290 - x * .06 + R() * 10); g.quadraticCurveTo(x + k, 335 - x * .03, x - k * .5, 372 + x * .04 - R() * 30); g.strokeStyle = `rgba(0,0,0,${.25 + R() * .3})`; g.lineWidth = 1 + R() * 2.5; g.stroke(); }
    g.beginPath(); g.ellipse(84, 318, 16, 5, -.2, 0, 6.3); g.fillStyle = '#000'; g.fill();
    // sockets for the small eyes, each with a ridge of flesh above it
    SMALL_EYES.forEach(([x, y, r]) => { g.beginPath(); g.ellipse(x, y, r * 2.2, r * 1.6, -.1, 0, 6.3); g.fillStyle = '#010101'; g.fill();
      g.beginPath(); g.ellipse(x, y - r * .6, r * 2.6, r * 1.6, -.1, 3.4, 6); g.strokeStyle = 'rgba(80,92,110,.45)'; g.lineWidth = 1.5; g.stroke(); });
    // the beard: hundreds of thin tendrils hanging from the jaw
    for (let i = 0; i < 420; i++) {
      const t = R(), x = 150 + t * 680, y = 470 + t * 80 + R() * 30, len = 90 + R() * 420 * (.4 + t * .6);
      const col = R() < .12 ? `hsl(214,14%,${12 + R() * 10}%)` : R() < .05 ? '#1c4744' : `hsl(220,15%,${2 + R() * 5}%)`;
      taper(x, y, 1.45 + (R() - .5) * .6, len, 1 + R() * 3.4, (R() - .5) * .05, col, 18);
    }
    return c;
  }

  // The great iris: turquoise fibre around a well of black.
  function irisTexture() {
    const [c, g] = mk(512, 512), M = 256; seed(23);
    // an irregular rim: the iris is not a circle
    g.beginPath(); for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, r = M * (.94 + Math.sin(a * 3 + 1) * .025 + Math.sin(a * 7) * .015 + R() * .02); i ? g.lineTo(M + Math.cos(a) * r, M + Math.sin(a) * r) : g.moveTo(M + Math.cos(a) * r, M + Math.sin(a) * r); }
    g.closePath(); g.clip();
    const b = g.createRadialGradient(M, M, 0, M, M, M);
    [[0, '#000'], [.14, '#041a17'], [.2, '#5fe8d3'], [.3, '#2bb3a2'], [.48, '#147a6e'], [.68, '#0b4a43'], [.84, '#06241f'], [.95, '#020a09'], [1, '#000']].forEach(s => b.addColorStop(...s));
    g.fillStyle = b; g.fillRect(0, 0, 512, 512);
    // growth rings, like a tree that never stopped growing
    for (let k = 0; k < 7; k++) { const r = M * (.34 + k * .085); g.beginPath();
      for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, rr = r + Math.sin(a * (5 + k) + k) * 4 + (R() - .5) * 3; i ? g.lineTo(M + Math.cos(a) * rr, M + Math.sin(a) * rr) : g.moveTo(M + Math.cos(a) * rr, M + Math.sin(a) * rr); }
      g.strokeStyle = `rgba(0,12,10,${.25 + R() * .25})`; g.lineWidth = 1.5 + R() * 2.5; g.stroke(); }
    for (let i = 0; i < 2600; i++) {
      const a = R() * TAU, r0 = M * (.17 + R() * .12), r1 = M * (.5 + R() * .45), w = (R() - .5) * .14;
      g.strokeStyle = R() < .6 ? `rgba(${90 + R() * 80 | 0},${220 + R() * 35 | 0},${200 + R() * 40 | 0},${.04 + R() * .12})` : `rgba(0,10,10,${.1 + R() * .25})`;
      g.lineWidth = .4 + R() * 1.5; g.beginPath(); g.moveTo(M + Math.cos(a) * r0, M + Math.sin(a) * r0);
      g.quadraticCurveTo(M + Math.cos(a + w) * (r0 + r1) / 2, M + Math.sin(a + w) * (r0 + r1) / 2, M + Math.cos(a + w * 2) * r1, M + Math.sin(a + w * 2) * r1); g.stroke();
    }
    for (let i = 0; i < 140; i++) { const a = R() * TAU, r = M * (.32 + R() * .4); g.fillStyle = `rgba(0,8,8,${.25 + R() * .35})`;
      g.beginPath(); g.ellipse(M + Math.cos(a) * r, M + Math.sin(a) * r, 2 + R() * 7, 1 + R() * 2.4, a, 0, TAU); g.fill(); }
    g.beginPath(); for (let i = 0; i <= 140; i++) { const a = i / 140 * TAU, r = M * (.26 + Math.sin(i * 1.9) * .015 + R() * .015); i ? g.lineTo(M + Math.cos(a) * r, M + Math.sin(a) * r) : g.moveTo(M + Math.cos(a) * r, M + Math.sin(a) * r); }
    g.strokeStyle = 'rgba(160,255,240,.5)'; g.lineWidth = 2.5; g.stroke();
    return c;
  }

  // A far mass of coils for the dark beats: shapes you cannot tell from rock.
  function massTexture(W, H) {
    const [c, g] = mk(W, H); seed(31);
    for (let i = 0; i < 26; i++) {
      const pts = Array.from({ length: 5 }, () => [R() * W * 1.4 - W * .2, R() * H * 1.4 - H * .2]);
      bend(g, curve(pts, 40), (W + H) * (.02 + R() * .05), 0);
    }
    return c;
  }

  /* ---------------- bending the strip along a path ---------------- */
  let strand = null, head = null, iris = null, mass = null;
  const catmull = (p, t) => { const n = p.length - 1, f = t * n, i = Math.min(n - 1, f | 0), u = f - i, p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(n, i + 2)];
    return [0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u)); };
  const curve = (pts, n) => Array.from({ length: n + 1 }, (_, i) => catmull(pts, i / n));
  // Draw the body strip along a polyline, w px wide, tapering at the s=0 end. The texture keeps its own proportions,
  // so a long coil shows more plates rather than the same plates stretched.
  function bend(g, pts, w, taper = .3, off = 0) {
    const n = pts.length - 1, tw = strand.width, th = strand.height, k = th / Math.max(4, w);
    let u = off * tw;
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], len = Math.hypot(x1 - x0, y1 - y0); if (len < .5) continue;
      const s = i / n, ww = w * (taper ? (taper + (1 - taper) * smooth(s / .3)) * (1 - .5 * smooth((s - .85) / .15)) : 1);
      const slice = Math.min(tw - 2, Math.max(2, len * k * .9)), sx = u % (tw - slice - 1); u += slice;
      g.setTransform(1, 0, 0, 1, 0, 0); g.translate(x0, y0); g.rotate(Math.atan2(y1 - y0, x1 - x0));
      g.drawImage(strand, sx, 0, slice, th, -1, -ww / 2, len + 2, ww);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
  }
  // A coil wandering through the dark: a random walk with momentum, so it bends, doubles back and loops.
  function wander(x, y, a, steps, step) {
    const pts = [[x, y]];
    for (let i = 0; i < steps; i++) { a += (R() - .5) * 1.5; x += Math.cos(a) * step; y += Math.sin(a) * step; pts.push([x, y]); }
    return pts;
  }

  /* ---------------- the scene ---------------- */
  let cv, g, lay, lg, W = 0, H = 0, U = 0, DPR = 1, raf = 0, t0 = 0, last = 0, fired = new Set(), skip = false, motes = [], strands = [], sparks = [], tendrils = [];
  const P = {};
  // the beats, in seconds from the moment you step through
  const B = { dark: 0, signs: 4.5, eyes: 10, gone: 16.5, shape: 19.5, coil: 27, eye: 31, words: 38.5 };
  function layout() {
    DPR = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; U = Math.min(W, H);
    for (const [c, x] of [[cv, g], [lay, lg]]) { c.width = W * DPR; c.height = H * DPR; x.setTransform(DPR, 0, 0, DPR, 0, 0); }
    mass = massTexture(Math.round(W * .6), Math.round(H * .6));
    seed(41);
    const big = Math.max(W, H), N = 26;
    strands = Array.from({ length: N }, (_, i) => {
      // front coils stay low and to the right of her head; the rest sprawl behind it and past every edge
      const front = i % 5 === 0, x = front ? W * (.55 + R() * .5) : R() * W * 1.3 - W * .15, y = front ? H * (.65 + R() * .45) : R() * H * 1.3 - H * .15;
      return { w: U * (i % 4 === 3 ? .025 + R() * .02 : .05 + R() * .085), th: i / N * TAU + R() * .2, d: R() * .4, off: R(), front, ph: R() * TAU,
        tangle: wander(x, y, R() * TAU, 9, U * (.16 + R() * .14)), reach: big * (.7 + R() * .55), turns: 1.4 + R() * .6 };
    });
    tendrils = Array.from({ length: 70 }, () => ({ x: 160 + R() * 640, len: 120 + R() * 380, ph: R() * TAU, w: .6 + R() * 1.8 }));
    swarm = Array.from({ length: 80 }, () => { const r = 1.75 + R() * R() * 2.3; return { a: R() * TAU, r, s: .012 + R() * .022, at: R() * 9, bl: -9, nb: 1 }; });
    motes = Array.from({ length: 90 }, () => ({ x: R() * W, y: R() * H, z: .3 + R(), v: 3 + R() * 9, p: R() * TAU }));
  }
  // where the head sits, how big, how lit
  function headXf(t) {
    const s = Math.max(W / 1050, H / 820) * (1 + .03 * Math.sin(t * .13)), f = smooth(P.form);
    const ax = W * (W > H ? .4 : .58), ay = H * .36;
    // as the coils wind inward, the head is drawn off to the upper left, still watching
    return { s: s * (1 - f * .35), x: ax - f * (ax - W * .13) + Math.sin(t * .11) * U * .006, y: ay - f * (ay - H * .22) + Math.sin(t * .17) * U * .01, rot: -f * .35 };
  }
  const toScreen = (xf, hx, hy) => { const c = Math.cos(xf.rot), s = Math.sin(xf.rot), dx = (hx - EYE_ANCHOR[0]) * xf.s, dy = (hy - EYE_ANCHOR[1]) * xf.s; return [xf.x + dx * c - dy * s, xf.y + dx * s + dy * c]; };

  function params(t) {
    const r = reduced() ? .7 : 1, e = (a, b) => smooth((t - a) / (b - a));
    P.arch = e(.5, 4) * (1 - e(B.eyes, B.gone) * .6);
    P.signs = t > B.signs && t < B.eyes + 1 ? 1 : 0;
    P.faint = e(B.signs, B.eyes) * (1 - e(B.eyes - .5, B.eyes + 1)) * .1;
    P.eyes2 = e(B.eyes, B.eyes + 2.2) * (1 - e(B.gone, B.gone + .7));
    P.expo = e(B.shape, B.coil) * .62 + e(B.coil, B.words) * .12;
    P.cluster = e(B.shape + 2, B.coil) * (1 - e(B.coil + 3, B.eye + 2) * .7);
    P.form = e(B.coil, B.coil + 7 * r + (1 - r) * 4);
    P.open = e(B.eye, B.eye + 5);
    P.focus = e(B.eye + 5.2, B.eye + 6.6);
    P.light = e(B.eye + 1, B.eye + 7);
    P.dark = t > B.gone + .7 && t < B.shape ? 1 : 0;
  }

  // The Eye at the centre of everything: lids of wrinkled tissue, a deep iris, a pupil that narrows as it finds you.
  const EYE = { cx: () => W / 2, cy: () => H * .52, r: () => U * .25 };
  // Her gaze: where she looks, how wide the pupil is, when she blinks. Driven by the pointer, and by her own will when you keep still.
  const gz = { x: 0, y: 0, tx: 0, ty: 0, dil: .8, blink: -9, next: 0, squint: 0, near: 0, speed: 0, idleAt: -9, wander: 0, has: false };
  let mx = 0, my = 0, moved = false, anger = 0, shake = 0, lungeT = -99, pulse = 0, heartAt = 0, tNow = 0, scoreAt = 0;
  // 0 = open, 1 = shut. A blink is quick to fall and slower to lift; a squint holds the lids half down.
  function lidClose(t) {
    const b = (t - gz.blink) / .28, c = b < 0 || b > 1 ? 0 : b < .35 ? smooth(b / .35) : 1 - smooth((b - .35) / .65);
    return Math.max(c, gz.squint * .55, eatT >= 0 ? smooth((tNow - eatT) / EAT.shut) : 0);
  }
  function gaze(t, dt) {
    const cx = EYE.cx(), cy = EYE.cy(), er = EYE.r();
    if (moved) { gz.idleAt = t; moved = false; }
    const idle = !gz.has || t - gz.idleAt > 3.5;
    if (idle) { if (t > gz.wander) { gz.tx = (Math.random() - .5) * er * 1.1; gz.ty = (Math.random() - .5) * er * .45; gz.wander = t + .4 + Math.random() * 2.2; } }
    else { gz.tx = er * .62 * Math.tanh((mx - cx) / (er * 2.2)); gz.ty = er * .2 * Math.tanh((my - cy) / (er * 1.5)); }
    // eyes do not glide, they jump: a fast approach, then a tremor
    const k = 1 - Math.exp(-dt * (idle ? 14 : 26));
    gz.x += (gz.tx - gz.x) * k + (Math.random() - .5) * er * .004; gz.y += (gz.ty - gz.y) * k + (Math.random() - .5) * er * .003;
    const near = gz.has ? clamp(1 - Math.hypot(mx - cx, my - cy) / (U * .8)) : 0;
    gz.near += (near - gz.near) * (1 - Math.exp(-dt * 3));
    gz.speed *= Math.exp(-dt * 4); gz.squint *= Math.exp(-dt * 1.3); anger = Math.max(0, anger - dt * .35); if (t - pokeT > 6) pokes = 0;
    // the pupil opens wide in the dark and when you are far; it closes to a thread when you come close or move fast
    const dil = clamp(.95 - gz.near * .6 - gz.speed / (U * 2.5) - gz.squint * .6 - P.focus * .2 - (tNow - lungeT < 1.5 ? .5 : 0), .04, 1);
    gz.dil += (dil - gz.dil) * (1 - Math.exp(-dt * 6));
    if (P.open >= 1 && t > gz.next && !reduced()) {
      gz.blink = t; Sound.sfx('blink');
      gz.next = t + (Math.random() < .22 ? .36 : 2 + Math.random() * 5);
    }
  }
  function drawEye(t) {
    const cx = EYE.cx(), cy = EYE.cy(), er = EYE.r(), open = P.open; if (open <= 0) return;
    const c = lidClose(t), op = smooth(open), still = reduced();
    const ax = er * 1.65, ay = er * .68 * op;
    // looking up lifts the upper lid; the lids meet a little below the middle
    const lift = -gz.y / er * .3, ayU = ay * (1 + lift) * (1 - c), ayL = ay * (1 - lift * .5) * (1 - c), yc = cy + ay * .25 * c;
    // the socket: a hollow of shadow the lids sink into
    const fl = g.createRadialGradient(cx, cy, er * .6, cx, cy, er * 1.4);
    fl.addColorStop(0, 'rgba(1,2,3,.95)'); fl.addColorStop(.6, 'rgba(2,3,5,.8)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = Math.min(.85, open * 2); g.fillStyle = fl; g.beginPath(); g.ellipse(cx, cy, er * 2.05, er * 1.05, 0, 0, TAU); g.fill(); g.globalAlpha = 1;
    const ap = new Path2D(); ap.moveTo(cx - ax, cy);
    ap.bezierCurveTo(cx - ax * .45, yc - ayU * 1.45, cx + ax * .45, yc - ayU * 1.45, cx + ax, cy);
    ap.bezierCurveTo(cx + ax * .45, yc + ayL * 1.4, cx - ax * .45, yc + ayL * 1.4, cx - ax, cy); ap.closePath();
    // points along the upper (sign -1) or lower (+1) lid edge
    const edge = (sign, n, grow = 0) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u, b = (sign < 0 ? ayU * 1.45 : ayL * 1.4) + grow;
      return [cx - ax * (1 + grow / er * .3) * (v * v * v + 3 * v * v * u * .45 - 3 * v * u * u * .45 - u * u * u), cy + 3 * v * u * (yc - cy + sign * b)]; });
    if (c < .98) {
      g.save(); g.clip(ap);
      // a wet sclera, the colour of deep water, threaded with veins that darken with her pulse and with your nearness
      const sc = g.createRadialGradient(cx, cy, 0, cx, cy, ax); sc.addColorStop(0, '#1b3936'); sc.addColorStop(.55, '#0c1d1b'); sc.addColorStop(1, '#010202');
      g.fillStyle = sc; g.fillRect(cx - ax, cy - ax, ax * 2, ax * 2);
      seed(61); const red = .25 + gz.near * .45 + pulse * .25 + pokes * .07;
      for (let i = 0; i < 34; i++) { const a = R() * TAU, isRed = R() < .45; let x = cx + Math.cos(a) * ax, y = cy + Math.sin(a) * ax * .75; g.beginPath(); g.moveTo(x, y);
        for (let k = 0; k < 6; k++) { x += (cx - x) * .16 + (R() - .5) * er * .09; y += (cy - y) * .16 + (R() - .5) * er * .07; g.lineTo(x, y); }
        g.strokeStyle = isRed ? `rgba(120,22,34,${red})` : 'rgba(40,110,100,.28)'; g.lineWidth = .6 + R() * 1.4; g.stroke(); }
      // the iris turns with the gaze: foreshortened as it rolls away from you, slowly revolving on itself
      const ir = er * .64, ix = cx + gz.x, iy = cy + gz.y, fx = 1 - Math.abs(gz.x) / er * .45, fy = 1 - Math.abs(gz.y) / er * .45;
      g.save(); g.translate(ix, iy); g.scale(fx, fy); g.rotate(still ? 0 : t * .012); g.drawImage(iris, -ir, -ir, ir * 2, ir * 2); g.restore();
      g.globalCompositeOperation = 'lighter';
      const glow = g.createRadialGradient(ix, iy, ir * .15, ix, iy, ir); glow.addColorStop(0, `rgba(90,230,210,${.18 + .1 * Math.sin(t * 1.3) + pulse * .08})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow; g.beginPath(); g.ellipse(ix, iy, ir * fx, ir * fy, 0, 0, TAU); g.fill();
      g.globalCompositeOperation = 'source-over';
      // the pupil: a well when the dark is all there is, a thread when it has found you
      const d = gz.dil * (1 + pulse * .07), pw = ir * (.035 + .36 * d) * fx, ph = ir * (.4 + .48 * (1 - d) + .06 * d) * fy;
      const pupil = k => { const p = new Path2D(); p.moveTo(ix, iy - ph * k); p.bezierCurveTo(ix + pw * 1.35 * k, iy - ph * .55 * k, ix + pw * 1.35 * k, iy + ph * .55 * k, ix, iy + ph * k);
        p.bezierCurveTo(ix - pw * 1.35 * k, iy + ph * .55 * k, ix - pw * 1.35 * k, iy - ph * .55 * k, ix, iy - ph * k); return p; };
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fill(pupil(1.5)); g.fillStyle = 'rgba(0,0,0,.65)'; g.fill(pupil(1.18)); g.fillStyle = '#000'; g.fill(pupil(1));
      g.strokeStyle = `rgba(150,255,240,${.12 + .35 * (1 - gz.dil)})`; g.lineWidth = 1.2; g.stroke(pupil(1.07));
      // shadow under the lids, then the wet light on the eye's surface; one small bright point is you
      const sh = g.createLinearGradient(0, yc - ayU * 1.4, 0, yc + ayL * 1.4); sh.addColorStop(0, 'rgba(0,0,0,.9)'); sh.addColorStop(.34, 'rgba(0,0,0,0)'); sh.addColorStop(.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.75)');
      g.fillStyle = sh; g.fillRect(cx - ax, cy - ax, ax * 2, ax * 2);
      g.fillStyle = 'rgba(220,255,250,.5)'; g.beginPath(); g.ellipse(cx - er * .32 - gz.x * .2, cy - er * .3 - gz.y * .2, ir * .1, ir * .05, -.5, 0, TAU); g.fill();
      g.fillStyle = 'rgba(220,255,250,.18)'; g.beginPath(); g.ellipse(cx + er * .3, cy + er * .28, ir * .06, ir * .025, -.5, 0, TAU); g.fill();
      if (gz.has) { const rx = ix + clamp((mx - cx) / W, -.5, .5) * pw * 1.2, ry = iy + clamp((my - cy) / H, -.5, .5) * ph * .8;
        g.fillStyle = `rgba(255,250,235,${.35 + gz.near * .4})`; g.beginPath(); g.arc(rx, ry, Math.max(1, er * .012), 0, TAU); g.fill(); }
      g.restore();
    }
    // the lids themselves: thick bands of her hide following the opening, then hanging fibres over the eye
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (const sign of [-1, 1]) for (const [lw, gr, o] of [[er * .55, er * .32, .3], [er * .34, er * .14, .7]]) { const pts = edge(sign, 34, gr).map(([x, y]) => [x * DPR, y * DPR]); bend(g, pts, lw * DPR, .12, sign < 0 ? o : o + .2); }
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.lineCap = 'round';
    seed(67);
    const up = edge(-1, 60);
    for (let i = 3; i < 58; i++) { if (R() < .3) continue; const [x, y] = up[i], len = er * (.06 + R() * .2) * Math.sin(i / 60 * Math.PI), sw = still ? 0 : Math.sin(t * .6 + i) * er * .01;
      g.beginPath(); g.moveTo(x, y - 2); g.quadraticCurveTo(x + (R() - .5) * er * .05, y + len * .5, x + sw + (R() - .5) * er * .04, y + len); g.strokeStyle = R() < .15 ? '#14302d' : '#020304'; g.lineWidth = .8 + R() * 1.8; g.stroke(); }
    g.lineWidth = er * .035; g.strokeStyle = '#010203'; g.stroke(ap);
    g.save(); g.clip(ap); g.lineWidth = 2.2; g.strokeStyle = `rgba(110,230,210,${.2 + P.light * .4})`; g.stroke(ap); g.restore();
  }

  // When the great Eye has found you, the rest of her opens too: small eyes all along the coils, each turning to you.
  let swarm = [];
  function drawSwarm(t, spin) {
    const since = t - (B.eye + 6.5); if (since <= 0) return;
    const ex = EYE.cx(), ey = EYE.cy(), er = EYE.r();
    for (const e of swarm) {
      const o = smooth((since - e.at) / 1.2); if (o <= 0) continue;
      if (t > e.bl + e.nb) { e.bl = t; e.nb = 2.5 + Math.random() * 7; }
      const b = (t - e.bl) / .24, shut = b >= 0 && b < 1 ? Math.sin(b * Math.PI) : 0;
      const a = e.a + spin * 1.3, s = e.s * U, x = ex + Math.cos(a) * e.r * er * 1.18, y = ey + Math.sin(a) * e.r * er * .88;
      if (x < -s * 3 || y < -s * 3 || x > W + s * 3 || y > H + s * 3) continue;
      const h = s * .5 * o * (1 - shut) * (1 - gz.squint * .7);
      g.globalCompositeOperation = 'lighter';
      const gl = g.createRadialGradient(x, y, 0, x, y, s * 3); gl.addColorStop(0, `rgba(80,225,205,${.22 * o * (1 - shut * .8)})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gl; g.fillRect(x - s * 3, y - s * 3, s * 6, s * 6);
      g.globalCompositeOperation = 'source-over';
      const lid = new Path2D(); lid.moveTo(x - s, y); lid.quadraticCurveTo(x, y - h * 1.7, x + s, y); lid.quadraticCurveTo(x, y + h * 1.7, x - s, y);
      if (h > .4) {
        g.save(); g.clip(lid); g.fillStyle = '#071412'; g.fillRect(x - s, y - s, s * 2, s * 2);
        // each one looks at you, not where the great Eye looks
        let dx = (gz.has ? mx : ex + gz.x * 6) - x, dy = (gz.has ? my : ey + gz.y * 6) - y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
        const ix = x + dx * s * .4, iy = y + dy * s * .25, ir = s * .58;
        const ig = g.createRadialGradient(ix, iy, 0, ix, iy, ir); ig.addColorStop(0, '#062a26'); ig.addColorStop(.3, '#5fe8d3'); ig.addColorStop(.75, '#178274'); ig.addColorStop(1, '#03201c');
        g.fillStyle = ig; g.beginPath(); g.arc(ix, iy, ir, 0, TAU); g.fill();
        g.fillStyle = '#000'; g.beginPath(); g.ellipse(ix, iy, ir * (.12 + .3 * gz.dil), ir * .8, 0, 0, TAU); g.fill();
        g.fillStyle = 'rgba(230,255,250,.7)'; g.beginPath(); g.arc(ix - ir * .35, iy - ir * .35, ir * .14, 0, TAU); g.fill();
        g.restore();
      }
      g.lineWidth = Math.max(1, s * .16); g.strokeStyle = '#000'; g.stroke(lid);
    }
  }
  /* ---------------- an easter egg: poke the Eye ten times and she eats you ---------------- */
  // The Eye shuts and the dark goes silent. Her head comes out of it, tastes the air, draws back, and strikes.
  // Then you are inside her mouth, the jaws close, chew once, and you go down.
  const EAT = { shut: .25, black: .9, emerge: 1, flick1: 1.6, flick2: 1.95, recoil: 2.1, strike: 3.25, inside: 3.6, bite: 3.78, part: 4.45, chew: 4.9, gulp: 5.35, text: 6.4, done: 10 };
  let pokes = 0, pokeT = -99, eatT = -99, eatFired = new Set();
  const inEye = (x, y) => { const er = EYE.r(); return ((x - EYE.cx()) / (er * 1.65)) ** 2 + ((y - EYE.cy()) / (er * .9)) ** 2 < 1; };
  function devour() {
    eatT = tNow; eatFired = new Set(); pokes = 0; gz.squint = 1; hideBake ||= bakeHide();
    $('#endtext').hidden = true; $('#cinebar').hidden = true;
    Sound.score('set', { tension: 0, choir: 0, shep: 0 });
  }
  const bump = (L, a, len) => { const x = (L - a) / len; return x > 0 && x < 1 ? Math.sin(x * Math.PI) : 0; };

  // One tooth from base (bx,by) along (dx,dy): wide at the root, a hooked needle at the tip, wet down one side.
  function tooth(bx, by, dx, dy, len, w, dim = 0, hook = 0) {
    const px = -dy, py = dx, tx = bx + dx * len + px * hook, ty = by + dy * len + py * hook;
    const p = new Path2D(); p.moveTo(bx - px * w / 2, by - py * w / 2);
    p.quadraticCurveTo(bx + dx * len * .35 - px * w * .06, by + dy * len * .35 - py * w * .06, tx, ty);
    p.quadraticCurveTo(bx + dx * len * .32 + px * w * .1, by + dy * len * .32 + py * w * .1, bx + px * w / 2, by + py * w / 2); p.closePath();
    const gr = g.createLinearGradient(bx, by, tx, ty); gr.addColorStop(0, '#2e1d18'); gr.addColorStop(.12, '#6b5444'); gr.addColorStop(.35, '#a8977c'); gr.addColorStop(.72, '#e8dfca'); gr.addColorStop(.93, '#fbf6ea'); gr.addColorStop(1, 'rgba(255,250,240,.55)');
    g.fillStyle = gr; g.fill(p);
    if (w > 9) { g.strokeStyle = 'rgba(40,25,20,.45)'; g.lineWidth = Math.max(.5, w * .03); g.beginPath(); g.moveTo(bx + dx * len * .15 + px * w * .1, by + dy * len * .15 + py * w * .1); g.lineTo(bx + dx * len * .38 + px * w * .02, by + dy * len * .38 + py * w * .02); g.lineTo(bx + dx * len * .5 + px * w * .08, by + dy * len * .5 + py * w * .08); g.stroke(); }
    if (dim > 0) { g.fillStyle = `rgba(8,0,3,${dim})`; g.fill(p); }
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = Math.max(.6, w * .05); g.stroke(p);
    g.strokeStyle = `rgba(255,255,255,${.5 * (1 - dim)})`; g.lineWidth = Math.max(.5, w * .07);
    g.beginPath(); g.moveTo(bx - px * w * .25 + dx * len * .15, by - py * w * .25 + dy * len * .15); g.quadraticCurveTo(bx + dx * len * .5 - px * w * .12, by + dy * len * .5 - py * w * .12, tx - dx * len * .08, ty - dy * len * .08); g.stroke();
  }
  // Rings of teeth further down the throat, pointing inward, darker the deeper they are.
  function throatRings(cx, cy, rx, ry, s, pulseK = 0) {
    seed(107); g.strokeStyle = 'rgba(10,0,4,.35)';
    for (let i = 0; i < 26; i++) { const a = R() * TAU; g.lineWidth = s * (.004 + R() * .01); g.beginPath(); g.moveTo(cx + Math.cos(a) * rx * .1, cy + Math.sin(a) * ry * .1); g.quadraticCurveTo(cx + Math.cos(a + .2) * rx * .5, cy + Math.sin(a + .2) * ry * .5, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); g.stroke(); }
    for (let i = 0; i < 40; i++) { const a = R() * TAU, d = .2 + R() * .8; g.fillStyle = `rgba(255,215,220,${.08 + R() * .16})`; g.beginPath(); g.ellipse(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, s * (.004 + R() * .012), s * (.002 + R() * .005), a + 1.57, 0, TAU); g.fill(); }
    for (let j = 4; j >= 1; j--) {
      const k = .62 ** j * (1 + pulseK * .04 * Math.sin(tNow * 9 + j)), n = 14 + j * 3, dim = .25 + j * .16;
      g.strokeStyle = `rgba(90,20,32,${.9 - j * .12})`; g.lineWidth = s * .05 * .7 ** j; g.beginPath(); g.ellipse(cx, cy, rx * k, ry * k, 0, 0, TAU); g.stroke();
      for (let i = 0; i < n; i++) { const a = i / n * TAU + j * .4, bx = cx + Math.cos(a) * rx * k, by = cy + Math.sin(a) * ry * k;
        tooth(bx, by, -Math.cos(a), -Math.sin(a), Math.min(rx, ry) * k * .45, s * .05 * .75 ** j, dim, (j % 2 ? 1 : -1) * s * .006); }
    }
  }
  // Her scales, baked once for the upper head and the jaw: rows bending round a dome, lit mostly by the glow of her own eyes.
  const HPX = 360, HX0 = -1.2, HY0 = -1.35;
  let hideBake = null;
  function bakeHide() {
    const out = {};
    for (const [key, fy, y0, y1] of [['up', -.4, -1.05, .2], ['lo', .65, .02, 1.95]]) {
      const [c, x] = mk(2.4 * HPX, 3.3 * HPX), st = .13;
      for (let row = 0, y = y0; y < y1; row++, y += st * .7) for (let x0 = -1.15 + (row % 2) * st / 2; x0 < 1.15; x0 += st) {
        const j = Math.sin(row * 12.9898 + x0 * 78.233) * 43758.5453 % 1, u = x0 + j * st * .12, v = y + u * u * .22;
        const d2 = u * u * .85 + ((v - fy) * .75) ** 2; if (d2 > 1.9) continue;
        const eg = key === 'up' ? Math.max(0, .55 - Math.hypot(Math.abs(u) - .43, v + .3) / .5) : 0;
        const k = Math.sqrt(Math.max(.06, 1 - d2 * .62)), rs = st * .66 * k * (.9 + Math.abs(j) * .2) * HPX, lit = clamp(.3 - (v - fy) * .2 - d2 * .35) + eg;
        const sx = (u - HX0) * HPX, sy = (v - HY0) * HPX;
        const p = new Path2D(); p.moveTo(sx - rs, sy); p.quadraticCurveTo(sx - rs, sy + rs * 1.4, sx, sy + rs * 1.8); p.quadraticCurveTo(sx + rs, sy + rs * 1.4, sx + rs, sy); p.quadraticCurveTo(sx, sy - rs * .45, sx - rs, sy);
        x.fillStyle = `rgb(${6 + lit * 14 | 0},${8 + lit * 26 + eg * 50 | 0},${10 + lit * 26 + eg * 46 | 0})`; x.fill(p);
        x.lineWidth = Math.max(.5, rs * .16); x.strokeStyle = 'rgba(0,0,0,.75)'; x.stroke(p);
        x.strokeStyle = `rgba(79,214,196,${.04 + lit * .16})`; x.lineWidth = Math.max(.5, rs * .08); x.beginPath(); x.moveTo(sx - rs * .8, sy + rs * .7); x.quadraticCurveTo(sx, sy + rs * 1.7, sx + rs * .8, sy + rs * .7); x.stroke();
      }
      out[key] = c;
    }
    return out;
  }
  // Her head from the front, half-width s, jaws open by m (0..1).
  function drawHead(hx, hy, s, m, L, alpha) {
    const X = x => hx + x * s, Y = y => hy + y * s;
    const P2 = pts => { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(X(x), Y(y)) : p.moveTo(X(x), Y(y))); p.closePath(); return p; };
    const lift = m * .32, drop = m * 1.05, cw = .7 * (1 + m * .2), cy0 = .12;
    const lipU = u => cy0 - lift * (1 - u * u) ** .6 - .05 * (1 - u * u), lipL = u => cy0 + drop * (1 - u * u) ** .7 + .02 * (1 - u * u);
    const us = Array.from({ length: 41 }, (_, i) => i / 20 - 1);
    const upLine = us.map(u => [u * cw, lipU(u)]), loLine = us.map(u => [u * cw, lipL(u)]);
    const crown = curve([[cw + .02, cy0 - .02], [1, -.12 - lift], [.88, -.46 - lift], [.56, -.76 - lift], [.22, -.92 - lift], [0, -.97 - lift], [-.22, -.92 - lift], [-.56, -.76 - lift], [-.88, -.46 - lift], [-1, -.12 - lift], [-cw - .02, cy0 - .02]], 56);
    const chin = curve([[-cw - .02, cy0 + .02], [-.8, .25 + drop * .4], [-.5, .5 + drop * .85], [-.18, .66 + drop], [0, .7 + drop], [.18, .66 + drop], [.5, .5 + drop * .85], [.8, .25 + drop * .4], [cw + .02, cy0 + .02]], 56);
    const upper = P2([...crown, ...upLine]), lower = P2([...chin, ...[...loLine].reverse()]), mouth = P2([...upLine, ...[...loLine].reverse()]);
    const sway = i => reduced() ? 0 : Math.sin(L * 2.4 + i * 1.7) * .05;
    g.save(); g.globalAlpha = alpha; g.lineCap = 'round';
    // the mane: ragged fibres standing out all round her head
    seed(73);
    for (let i = 0; i < 75; i++) { const a = -Math.PI * 1.12 + R() * Math.PI * 1.24, len = .35 + R() * .95, ox = Math.cos(a), oy = Math.sin(a), x0 = ox * .9, y0 = oy * .82 - lift * .8;
      for (let k = 0, n = 2 + R() * 4 | 0; k < n; k++) { const sw = sway(i + k * .3) * (1 + k * .4), sp = (R() - .5) * .14, l = len * (.6 + R() * .5);
        const x1 = x0 + (ox + sp) * l * .55, y1 = y0 + oy * l * .45, x2 = x0 + (ox + sp) * l * .75 + sw, y2 = y0 + oy * l * .3 + l * .7;
        g.strokeStyle = R() < .07 ? 'rgba(40,120,110,.5)' : R() < .5 ? '#06090b' : '#020304'; g.lineWidth = s * (.005 + R() * .016);
        g.beginPath(); g.moveTo(X(x0 + sp * .2), Y(y0)); g.quadraticCurveTo(X(x1), Y(y1), X(x2), Y(y2)); g.stroke(); } }
    const hide = (path, key, dy, fy) => { g.fillStyle = '#030405'; g.fill(path);
      hideBake ||= bakeHide();
      g.save(); g.clip(path); g.drawImage(hideBake[key], X(HX0), Y(HY0 + dy), 2.4 * s, 3.3 * s); g.restore();
      const sh = g.createRadialGradient(X(0), Y(fy), s * .1, X(0), Y(fy), s * 1.1); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.6, 'rgba(0,0,0,.35)'); sh.addColorStop(1, 'rgba(0,0,0,.95)');
      g.fillStyle = sh; g.fill(path); g.lineWidth = s * .01; g.strokeStyle = 'rgba(79,214,196,.05)'; g.stroke(path); };
    hide(lower, 'lo', drop * .3, .35 + drop * .6);
    // the beard: tendrils hanging from the jaw, swinging
    seed(79);
    for (let i = 0; i < 60; i++) { const [cx0, cy1] = chin[4 + (R() * (chin.length - 8) | 0)], len = .25 + R() * .95, sw = sway(i + 40) * 2;
      g.strokeStyle = R() < .08 ? 'rgba(40,120,110,.5)' : '#030405'; g.lineWidth = s * (.006 + R() * .02);
      g.beginPath(); g.moveTo(X(cx0), Y(cy1 - .03)); g.bezierCurveTo(X(cx0 + sw * .3), Y(cy1 + len * .4), X(cx0 + sw), Y(cy1 + len * .7), X(cx0 + sw * 1.4 + (R() - .5) * .1), Y(cy1 + len)); g.stroke(); }
    if (m > .02) {
      // inside: wet red going down to black, rings of teeth all the way down
      const mx0 = X(0), my0 = Y(cy0 + (drop - lift) * .4), rx = cw * s * .95, ry = (drop + lift) * s * .55;
      const th = g.createRadialGradient(mx0, my0, 0, mx0, my0, rx); [[0, '#000'], [.28, '#12030a'], [.62, '#4e1322'], [1, '#86303c']].forEach(c => th.addColorStop(...c));
      g.fillStyle = th; g.fill(mouth);
      g.save(); g.clip(mouth); throatRings(mx0, my0, rx * .9, ry * .9, s, 1);
      g.strokeStyle = 'rgba(255,140,150,.13)'; g.lineWidth = s * .01;
      for (let k = 1; k <= 4; k++) { g.beginPath(); upLine.forEach(([x, y], i) => { const yy = Y(y) + (my0 - Y(y)) * k * .14; i ? g.lineTo(X(x * (1 - k * .1)), yy) : g.moveTo(X(x * (1 - k * .1)), yy); }); g.stroke(); }
      g.restore();
      // gums, swollen at every tooth
      for (const line of [upLine, loLine]) { g.strokeStyle = '#5c1826'; g.lineWidth = s * .05; g.beginPath(); line.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.stroke(); }
    }
    // the tongue: out through the notch at the front of her lips, forked, tasting for you
    const tg = Math.max(bump(L, EAT.flick1, .4), bump(L, EAT.flick2, .4), bump(L, EAT.recoil + .5, .45), m * .55) * (1 - smooth((m - .5) / .15));
    if (tg > .02) { const t0y = lipL(0) - .05, len = .25 + tg * .7, w = sway(3) * 2, fork = .1 + tg * .08;
      const q = reduced() ? 0 : 1, at = i => { const f = i / 14; return [w * f + Math.sin(f * 7 + L * 26) * .03 * f * q, t0y + len * f]; };
      const ribbon = (pts, w0, w1, col) => { const L2 = [], R2 = []; pts.forEach(([x, y], i) => { const [nx, ny] = pts[Math.min(i + 1, pts.length - 1)], [px0, py0] = pts[Math.max(i - 1, 0)], a = Math.atan2(ny - py0, nx - px0) + Math.PI / 2, ww = w0 + (w1 - w0) * i / (pts.length - 1);
        L2.push([x + Math.cos(a) * ww, y + Math.sin(a) * ww]); R2.unshift([x - Math.cos(a) * ww, y - Math.sin(a) * ww]); }); g.fillStyle = col; g.fill(P2([...L2, ...R2])); };
      const stem = Array.from({ length: 15 }, (_, i) => at(i)), [ex0, ey0] = stem[14];
      ribbon(stem, .032, .02, '#5e0d1b');
      for (const d of [-1, 1]) ribbon(Array.from({ length: 8 }, (_, i) => { const f = i / 7; return [ex0 + d * fork * f + Math.sin(L * 30 + d) * .02 * f * q, ey0 + .28 * f * (1 - f * .2)]; }), .02, .003, '#5e0d1b');
      g.strokeStyle = 'rgba(255,170,180,.32)'; g.lineWidth = s * .008; g.beginPath(); stem.forEach(([x, y], i) => i ? g.lineTo(X(x - .012), Y(y)) : g.moveTo(X(x - .012), Y(y))); g.stroke(); }
    if (m > .02) {
      // teeth: needles all along both jaws, two long fangs that swing down as the mouth opens
      seed(83); const show = smooth(m * 3);
      for (let i = 1; i < 40; i++) { const u = i / 20 - 1, [x, y] = upLine[i], len = (.06 + R() * .09) * (1 - Math.abs(u) * .45) * show;
        tooth(X(x), Y(y), -u * .18, 1, len * s, s * .045, 0, -u * s * .01); }
      for (let i = 2; i < 39; i++) { const u = i / 20 - 1, [x, y] = loLine[i], len = (.05 + R() * .08) * (1 - Math.abs(u) * .4) * show;
        tooth(X(x), Y(y), -u * .15, -1, len * s, s * .04, 0, u * s * .008); }
      for (const d of [-1, 1]) { const u = d * .34, x = u * cw; tooth(X(x), Y(lipU(u)), -d * .1, 1, s * (.12 + .5 * smooth(m * 1.6)), s * .085, 0, -d * s * .03); }
      // drool from the fangs
      g.strokeStyle = 'rgba(210,235,228,.28)'; g.lineWidth = s * .008;
      for (const d of [-1, 1]) { const x = d * .34 * cw, y = lipU(d * .34) + .12 + .5 * smooth(m * 1.6); g.beginPath(); g.moveTo(X(x), Y(y)); g.quadraticCurveTo(X(x + .02), Y(y + .15), X(x - .01), Y(y + .2 + .2 * m)); g.stroke(); }
    }
    hide(upper, 'up', -lift, -.4 - lift);
    { g.globalCompositeOperation = 'lighter'; const sh = g.createRadialGradient(X(0), Y(-.6 - lift), 0, X(0), Y(-.6 - lift), s * .7); sh.addColorStop(0, 'rgba(79,214,196,.1)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fill(upper);
      const rg = g.createLinearGradient(X(-.08), 0, X(.08), 0); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(.5, 'rgba(120,230,215,.07)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(X(-.08), Y(-.9 - lift), s * .16, s * (.9 + cy0)); g.globalCompositeOperation = 'source-over'; }
    // brow ridges with a row of spines, nostrils, heat pits along the lip
    for (const d of [-1, 1]) {
      const so = g.createRadialGradient(X(d * .43), Y(-.3 - lift), 0, X(d * .43), Y(-.3 - lift), s * .3); so.addColorStop(0, 'rgba(0,0,0,.85)'); so.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = so; g.fillRect(X(d * .43) - s * .3, Y(-.3 - lift) - s * .3, s * .6, s * .6);
      const ridge = curve([[d * .1, -.36 - lift], [d * .38, -.5 - lift], [d * .72, -.62 - lift]], 16);
      g.strokeStyle = '#010203'; g.lineWidth = s * .08; g.beginPath(); ridge.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))); g.stroke();
      g.strokeStyle = 'rgba(79,214,196,.16)'; g.lineWidth = s * .012; g.beginPath(); ridge.forEach(([x, y], i) => i ? g.lineTo(X(x), Y(y - .04)) : g.moveTo(X(x), Y(y - .04))); g.stroke();
      for (let k = 0; k < 6; k++) { const [x, y] = ridge[2 + k * 2]; g.fillStyle = '#080b0d'; g.beginPath(); g.moveTo(X(x - .03), Y(y)); g.lineTo(X(x + d * (.06 + k * .02)), Y(y - .1 - k * .035)); g.lineTo(X(x + .03), Y(y)); g.fill();
        g.strokeStyle = 'rgba(79,214,196,.15)'; g.lineWidth = s * .006; g.stroke(); }
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(X(d * .11), Y(cy0 - .2 - lift * .9), s * .038, s * .017, d * .55, 0, TAU); g.fill();
      for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(X(d * (.3 + k * .09)), Y(lipU(d * (.3 + k * .09) / cw) - .045), s * .013, 0, TAU); g.fill(); }
    }
    // her eyes: a great one and a cluster of small ones on each side, lit one after another, every one on you
    const EYES = [[0, 0, .075], [-.13, -.1, .034], [.12, -.13, .03], [.17, .03, .026], [-.05, .11, .028], [-.18, .04, .022], [.04, -.2, .02]];
    for (const d of [-1, 1]) EYES.forEach(([ox, oy, r], i) => {
      const a = smooth((L - EAT.emerge - .15 - i * .07 - (d > 0 ? .03 : 0)) / .18) * (1 - gz.squint * .3); if (a <= 0) return;
      const ex = X(d * (.43 + ox)), ey = Y(-.3 - lift + oy), rr = r * s;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 1; const gl = g.createRadialGradient(ex, ey, 0, ex, ey, rr * 6); gl.addColorStop(0, `rgba(90,235,214,${.5 * a})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(ex - rr * 6, ey - rr * 6, rr * 12, rr * 12);
      g.globalCompositeOperation = 'source-over';
      const lid = new Path2D(); lid.moveTo(ex - rr * 1.3, ey); lid.quadraticCurveTo(ex, ey - rr * 1.05 * a, ex + rr * 1.3, ey); lid.quadraticCurveTo(ex, ey + rr * 1.05 * a, ex - rr * 1.3, ey);
      g.save(); g.clip(lid); g.fillStyle = '#02100d'; g.fillRect(ex - rr * 2, ey - rr * 2, rr * 4, rr * 4);
      const ix = ex + (hx - ex) * .02, ig = g.createRadialGradient(ix, ey, 0, ix, ey, rr * .8); ig.addColorStop(0, '#0a3b35'); ig.addColorStop(.35, '#7ff5e2'); ig.addColorStop(.8, '#1a9283'); ig.addColorStop(1, '#03201c');
      g.fillStyle = ig; g.beginPath(); g.arc(ix, ey, rr * .8, 0, TAU); g.fill();
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(ix, ey, rr * .1, rr * .7, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(240,255,252,.85)'; g.beginPath(); g.arc(ix - rr * .3, ey - rr * .3, rr * .14, 0, TAU); g.fill(); g.restore();
      g.strokeStyle = '#000'; g.lineWidth = rr * .25; g.stroke(lid);
    });
    g.restore();
  }
  // From the dark: her head comes, rears back on a coil of neck, and strikes.
  function drawStrike(L) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const still = reduced(), em = smooth((L - EAT.emerge - .35) / 1), r = smooth((L - EAT.recoil) / (EAT.strike - EAT.recoil)), q = clamp((L - EAT.strike) / (EAT.inside - EAT.strike));
    const lunge = still ? q : q ** 2.3, tremble = r * (1 - q) * U * .008;
    const s = U * .32 * (1 - .45 * r) * (1 + lunge * 7);
    const hx = W / 2 + Math.sin(L * 1.9) * U * .025 * (1 - r) + (Math.random() - .5) * tremble;
    const hy = H * .47 - r * H * .17 * (1 - q) + (Math.random() - .5) * tremble + lunge * H * .1;
    const m = .5 * r + .5 * smooth(q * 2.2);
    const fog = g.createRadialGradient(hx, hy + s * .4, 0, hx, hy + s * .4, U * .9); fog.addColorStop(0, `rgba(40,140,128,${.1 * em})`); fog.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fog; g.fillRect(0, 0, W, H);
    // the neck, coiled under her like a spring
    if (q < .5) {
      const pts = curve([[W * .78, H * 1.35], [W * .3 + r * U * .12, H * 1.05], [W * .62 - r * U * .2, H * .82 + r * H * .04], [W * .44 + r * U * .1, H * .66], [hx, hy + s * .5]], 40);
      g.globalAlpha = em; g.setTransform(1, 0, 0, 1, 0, 0); bend(g, pts.map(([x, y]) => [x * DPR, y * DPR]), s * 1.2 * DPR, 0, .4); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
    }
    // as she comes, the air streaks past her
    if (q > 0 && !still) {
      g.strokeStyle = `rgba(150,255,235,${.08 * q})`; g.lineWidth = 2; seed(89);
      for (let i = 0; i < 60; i++) { const a = R() * TAU, r0 = U * (.2 + R() * .4) * (1 + q), r1 = r0 + U * (.3 + R() * .5) * q; g.beginPath(); g.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0); g.lineTo(hx + Math.cos(a) * r1, hy + Math.sin(a) * r1); g.stroke(); }
    }
    const rot = still ? 0 : Math.sin(L * 1.4) * .07 * (1 - r) + r * (1 - q) * Math.sin(L * 11) * .02;
    const head = (ss, a) => { g.save(); g.translate(hx, hy); g.rotate(rot); drawHead(0, 0, ss, m, L, a); g.restore(); };
    head(s, Math.max(em, .001));
    const v = g.createRadialGradient(W / 2, H / 2, U * .3, W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.9)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
  // Inside her mouth: the jaws closing on you, then the chew, then the dark.
  function drawInside(L) {
    const cx = W / 2, cy = H / 2;
    let k = 1.15, shut = 1;
    if (L < EAT.bite) { const q = clamp((L - EAT.inside) / (EAT.bite - EAT.inside)); k = 1.5 - .35 * q; shut = q ** 1.6; }
    else if (L > EAT.part && L < EAT.chew) shut = 1 - .14 * bump(L, EAT.part, EAT.chew - EAT.part);
    const mw = W * .56 * k, gapMax = H * .48 * k, gap = gapMax * (1 - shut), s = U * k;
    const lip = g.createRadialGradient(cx, cy, mw * .5, cx, cy, Math.max(W, H) * .8); lip.addColorStop(0, '#2a0b12'); lip.addColorStop(.35, '#12060a'); lip.addColorStop(1, '#010102');
    g.fillStyle = lip; g.fillRect(0, 0, W, H);
    const gum = sign => Array.from({ length: 49 }, (_, i) => { const u = i / 24 - 1; return [cx + u * mw, cy + sign * gap * Math.sqrt(1 - u * u)]; });
    const up = gum(-1), lo = gum(1);
    const mouth = new Path2D(); up.forEach(([x, y], i) => i ? mouth.lineTo(x, y) : mouth.moveTo(x, y)); [...lo].reverse().forEach(([x, y]) => mouth.lineTo(x, y)); mouth.closePath();
    const th = g.createRadialGradient(cx, cy, 0, cx, cy, mw); [[0, '#000'], [.25, '#100308'], [.6, '#45101d'], [1, '#7e2a36']].forEach(c => th.addColorStop(...c));
    g.fillStyle = th; g.fill(mouth);
    if (gap > 2) {
      g.save(); g.clip(mouth);
      throatRings(cx, cy, mw * .75, Math.max(gap, gapMax * .3) * .75, s * .5, 1);
      const deep = g.createRadialGradient(cx, cy, 0, cx, cy, mw * .18); deep.addColorStop(0, 'rgba(79,214,196,.16)'); deep.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = deep; g.fillRect(0, 0, W, H);
      // ridges on the roof of her mouth, and the tongue lying in the floor of it
      g.strokeStyle = 'rgba(255,130,145,.12)'; g.lineWidth = 3 * k;
      for (let j = 1; j <= 5; j++) { g.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 15 - 1, x = cx + u * mw * (1 - j * .12), y = cy - gap * Math.sqrt(1 - u * u) * (1 - j * .16) + j * 4; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
      const ty = cy + gap * .55, tw = sway2(L);
      const tp = Array.from({ length: 16 }, (_, i) => { const f = i / 15; return [cx + Math.sin(f * 5 + L * 14) * mw * .05 * f + tw * mw * .04 * f, cy + gap * (.05 + .7 * f)]; });
      g.lineCap = 'round';
      for (let i = 0; i < 15; i++) { g.strokeStyle = '#5a0c1a'; g.lineWidth = s * (.05 - i * .002); g.beginPath(); g.moveTo(...tp[i]); g.lineTo(...tp[i + 1]); g.stroke(); }
      const [fx, fy] = tp[15]; g.lineWidth = s * .016;
      for (const d of [-1, 1]) { g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + d * mw * .03, fy + gap * .08, fx + d * mw * .06 + Math.sin(L * 20 + d) * mw * .01, fy + gap * .2); g.stroke(); }
      g.strokeStyle = 'rgba(255,170,180,.28)'; g.lineWidth = s * .008; g.beginPath(); tp.forEach(([x, y], i) => i ? g.lineTo(x - s * .012, y) : g.moveTo(x - s * .012, y)); g.stroke();
      // spit strung between the jaws
      seed(97); g.lineWidth = Math.max(1, 1.8 * k);
      for (let i = 0; i < 12; i++) { const u = (R() - .5) * 1.6, x = cx + u * mw, h = gap * Math.sqrt(1 - u * u);
        g.strokeStyle = `rgba(205,228,220,${.1 + R() * .22})`; g.beginPath(); g.moveTo(x, cy - h); g.quadraticCurveTo(x + (R() - .5) * mw * .08, cy + h * R() * .7, x + (R() - .5) * mw * .04, cy + h); g.stroke(); }
      g.restore();
    }
    // gums swollen round every root, then two rows of teeth on each jaw, longest at the front
    for (const [pts, sign] of [[up, 1], [lo, -1]]) {
      g.lineWidth = 22 * k; g.strokeStyle = '#4e1420'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
      g.fillStyle = '#6a2232'; pts.forEach(([x, y], i) => { if (i % 2) { g.beginPath(); g.arc(x, y + sign * 4 * k, 8 * k, 0, TAU); g.fill(); } });
      g.lineWidth = 3 * k; g.strokeStyle = 'rgba(79,214,196,.22)'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y - sign * 14 * k) : g.moveTo(x, y - sign * 14 * k)); g.stroke();
      seed(sign > 0 ? 91 : 93);
      for (const row of [1, 0]) { const N = row ? 32 : 24;
        for (let i = 1; i < N; i++) {
          const u = (i + row * .5) / N * 2 - 1; if (Math.abs(u) > .97) continue;
          const x = cx + u * mw, y = cy - sign * gap * Math.sqrt(1 - u * u), w = mw * 2 / N * (row ? .3 : .4);
          const fang = !row && Math.abs(Math.abs(u) - .3) < .05;
          const len = gapMax * (fang ? .95 : (row ? .3 : .55) * (.45 + R() * .55)) * (1 - Math.abs(u) * .5);
          tooth(x, y, -u * .15, sign, len, fang ? w * 1.15 : w, row ? .35 : 0, (R() - .5) * w * 1.6 - u * w * 1.4);
        } }
    }
    // drool sliding off the tips of the upper teeth
    if (gap > 2) { seed(101); g.fillStyle = 'rgba(205,228,220,.35)';
      for (let i = 0; i < 10; i++) { const u = (R() - .5) * 1.6, x = cx + u * mw, y0 = cy - gap * Math.sqrt(1 - u * u) + gapMax * .3 * (1 - Math.abs(u) * .5), y = y0 + ((L * (90 + R() * 80) * k) % (gap * 1.2));
        g.beginPath(); g.ellipse(x, y, 2.2 * k, 6 * k, 0, 0, TAU); g.fill(); } }
  }
  const sway2 = L => reduced() ? 0 : Math.sin(L * 7) * .6;
  // swallowed: rings of her throat going past you, down towards a small light
  function drawSwallow(L) {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const fade = 1 - smooth((L - EAT.text - 1.5) / 2), big = Math.max(W, H) * .85;
    for (let i = 0; i < 12; i++) { const p = ((L - EAT.gulp) * .7 + i / 12) % 1, r = p ** 2.2 * big;
      g.strokeStyle = `rgba(95,18,30,${(1 - p) * .55 * fade})`; g.lineWidth = 2 + p * 40; g.beginPath(); g.ellipse(W / 2, H / 2, r * 1.2, r * .8, 0, 0, TAU); g.stroke(); }
    const l = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, U * .06); l.addColorStop(0, `rgba(79,214,196,${.35 * fade})`); l.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = l; g.fillRect(0, 0, W, H);
  }
  // blood-dark drops running down the inside of your eyes after the bite
  function drawDrips(L) {
    const a = smooth((L - EAT.bite) / .2) * (1 - smooth((L - EAT.text) / 1.5)); if (a <= 0) return; seed(103);
    for (let i = 0; i < 22; i++) { const x = R() * W, len = Math.min(H * (.15 + R() * .6), (L - EAT.bite) * H * (.15 + R() * .35)), w = 3 + R() * 9;
      const gr = g.createLinearGradient(0, 0, 0, len); gr.addColorStop(0, `rgba(70,4,12,${a})`); gr.addColorStop(1, `rgba(120,10,24,${a})`);
      g.fillStyle = gr; g.fillRect(x - w / 2, 0, w, len); g.beginPath(); g.arc(x, len, w * .75, 0, TAU); g.fill();
      g.fillStyle = `rgba(255,140,150,${.25 * a})`; g.fillRect(x - w * .3, 0, w * .15, len * .9); }
  }
  let grain = null;
  function drawEat(L) {
    if (L < EAT.inside) drawStrike(L);
    else if (L < EAT.gulp) {
      drawInside(L);
      if (L > EAT.bite) {
        const flash = Math.max(1 - (L - EAT.bite) / .45, L > EAT.chew ? 1 - (L - EAT.chew) / .4 : 0);
        const dark = L > EAT.part && L < EAT.chew ? 1 - .6 * bump(L, EAT.part, EAT.chew - EAT.part) : smooth((L - EAT.bite) / .3);
        g.fillStyle = `rgba(0,0,0,${dark})`; g.fillRect(0, 0, W, H);
        if (flash > 0) { g.fillStyle = `rgba(130,6,20,${flash * .65})`; g.fillRect(0, 0, W, H); }
      }
    } else drawSwallow(L);
    drawDrips(L);
    if (!grain) { const [c, x] = mk(256, 256), d = x.createImageData(256, 256); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); grain = g.createPattern(c, 'repeat'); }
    if (!reduced()) { g.save(); g.globalAlpha = .07; g.globalCompositeOperation = 'overlay'; g.translate(Math.random() * 256, Math.random() * 256); g.fillStyle = grain; g.fillRect(-256, -256, W + 512, H + 512); g.restore();
      if (Math.random() < .08) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, W, H); } }
    if (L > EAT.text) { const a = smooth((L - EAT.text) / 1.2) * (1 - smooth((L - EAT.done + 1.2) / 1));
      g.globalAlpha = a; g.fillStyle = '#c9bc9c'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `italic 500 ${Math.round(U * .042)}px 'Cormorant Garamond', Georgia, serif`; g.fillText('Nhaurith does not like to be touched.', W / 2, H / 2 - U * .03);
      g.font = `700 ${Math.round(U * .018)}px Cinzel, Georgia, serif`; g.fillStyle = '#4fd6c4'; g.fillText('S H E   L E T S   Y O U   G O .   T H I S   T I M E .', W / 2, H / 2 + U * .05);
      g.globalAlpha = 1; }
  }
  // the sounds and the end of the sequence, each fired once
  function eatEvents(L) {
    const at = (id, s, fn) => { if (L >= s && !eatFired.has(id)) { eatFired.add(id); fn(); } };
    at('rumble', EAT.emerge, () => Sound.sfx('rumble'));
    at('f1', EAT.flick1, () => Sound.sfx('flick')); at('f2', EAT.flick2, () => Sound.sfx('flick'));
    at('rattle', EAT.recoil, () => { Sound.sfx('rattle'); Sound.sfx('hiss'); });
    at('f3', EAT.recoil + .5, () => Sound.sfx('flick'));
    at('roar', EAT.strike - .3, () => Sound.sfx('roar'));
    at('go', EAT.strike, () => { if (!reduced()) shake = .9; });
    at('bite', EAT.bite, () => { Sound.sfx('bite'); if (!reduced()) shake = 3; });
    at('chew', EAT.chew, () => { Sound.sfx('crunch'); if (!reduced()) shake = 2.2; });
    at('gulp', EAT.gulp, () => Sound.sfx('gulp'));
    at('lore', EAT.text, () => { setFlag('eaten'); Know.lore('eaten'); });
    at('h1', EAT.text + .5, () => Sound.sfx('heart')); at('h2', EAT.text + 2, () => Sound.sfx('heart'));
    at('done', EAT.done, () => { eatT = -99; gz.squint = 1; gz.blink = tNow; $('#cinebar').hidden = false; });
  }

  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    // skipping moves the start of the clock, so time keeps running from the words onward
    if (skip && (now - t0) / 1000 < B.words + .5) t0 = now - (B.words + .5) * 1000;
    const t = (now - t0) / 1000;
    params(t); events(t); tNow = t;
    const still = reduced();
    gaze(t, dt);
    // her heart, from the moment her eyes go out: slow in the dark, faster the closer you come
    const eating = eatT >= 0, eL = t - eatT;
    if (eating) eatEvents(eL);
    if (!eating && t > B.gone && t > heartAt) { Sound.sfx('heart'); pulse = 1; heartAt = t + 60 / (44 + gz.near * 75 + gz.squint * 30 + anger * 12 + (t > B.eye + 4 && t < B.eye + 9 ? 35 : 0)); }
    pulse *= Math.exp(-dt * 7);
    if (!eating && now > scoreAt) { scoreAt = now + 200; Sound.score('set', { tension: clamp(P.open * .4 + gz.near * .45 + gz.squint * .4 + anger * .1), choir: P.expo, shep: t > B.gone ? 1 : 0 }); }
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    if (eating && eL > EAT.black) {
      shake *= Math.exp(-dt * 3);
      drawEat(eL);
      cv.style.transform = still ? '' : `translate(${(Math.random() - .5) * shake * U * .03}px,${(Math.random() - .5) * shake * U * .03}px)`;
      raf = requestAnimationFrame(frame); return;
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    // a cold glow far below
    const deep = g.createRadialGradient(W / 2, H * 1.1, 0, W / 2, H * 1.1, Math.max(W, H) * .9);
    deep.addColorStop(0, `rgba(30,120,110,${.05 + P.expo * .1 + P.light * .12})`); deep.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = deep; g.fillRect(0, 0, W, H);
    // the last of the architecture: a ledge and broken pillars
    if (P.arch > 0) { g.globalAlpha = P.arch * .45 * (1 - P.dark);
      g.fillStyle = '#0a0c0e'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * .88); g.quadraticCurveTo(W * .3, H * .84, W * .45, H * .86); g.lineTo(W * .5, H * .9); g.lineTo(W * .56, H * .85); g.quadraticCurveTo(W * .8, H * .83, W, H * .88); g.lineTo(W, H); g.fill();
      // broken columns at the edge of the last ledge, their tops sheared off
      for (const [x, h, k] of [[.05, .62, 1], [.14, .38, -1], [.9, .5, 1], [.97, .74, -1]]) { const cw = U * .055, x0 = W * x - cw / 2, top = H * (1 - h);
        g.beginPath(); g.moveTo(x0, H * .9); g.lineTo(x0, top + k * cw * .3); g.lineTo(x0 + cw * .3, top - cw * .2); g.lineTo(x0 + cw * .55, top + cw * .25); g.lineTo(x0 + cw, top - k * cw * .4); g.lineTo(x0 + cw, H * .9); g.fill(); }
      const rim = g.createLinearGradient(0, H * .82, 0, H * .9); rim.addColorStop(0, 'rgba(60,170,158,.12)'); rim.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rim; g.fillRect(0, H * .82, W, H * .08);
      g.globalAlpha = 1; }
    // faint shapes in the dark, that might be rock
    if (P.faint > 0) { g.globalAlpha = P.faint; g.drawImage(mass, -W * .05 + Math.sin(t * .05) * 20, -H * .05, W * 1.1, H * 1.1); g.globalAlpha = 1; }
    // the creature layer: strands and head, then masked by what light reaches it
    const lit = P.expo > .001 || P.eyes2 > .001;
    if (lit) {
      lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, lay.width, lay.height);
      const xf = headXf(t), spin = t * .02 * (still ? 0 : 1);
      const ex = EYE.cx(), ey = EYE.cy(), er = EYE.r();
      const drawStrand = s => {
        const e = smooth((P.form - s.d) / (1 - s.d));
        const pts = [];
        for (let i = 0; i <= 44; i++) {
          const q = i / 44, wob = still ? 0 : Math.sin(q * 6 + t * .25 + s.ph) * U * .02;
          const [tx, ty] = catmull(s.tangle, q), r = er * 1.2 + q * s.reach, a = s.th + spin + q * s.turns * Math.PI;
          pts.push([(tx + wob) * (1 - e) + (ex + Math.cos(a) * r) * e, (ty + wob * .6) * (1 - e) + (ey + Math.sin(a) * r * .88) * e]);
        }
        lg.setTransform(DPR, 0, 0, DPR, 0, 0); bend(lg, pts.map(([x, y]) => [x * DPR, y * DPR]), s.w * DPR * (1 + e * .3), .25 + .4 * (1 - e), s.off);
      };
      strands.filter(s => !s.front).forEach(drawStrand);
      // lid folds: rings of body closing round the Eye
      if (P.form > .3) { const k = smooth((P.form - .3) / .7);
        for (let j = 0; j < 4; j++) { const rr = er * (1.25 + j * .2), pts = [];
          for (let i = 0; i <= 60; i++) { const a = i / 60 * TAU + j * .7 + spin * (j % 2 ? -1 : 1); pts.push([(ex + Math.cos(a) * rr * 1.18) * DPR, (ey + Math.sin(a) * rr * .8) * DPR]); }
          lg.globalAlpha = k; bend(lg, pts, er * (.42 - j * .05) * DPR, 0, j * .3); }
        lg.globalAlpha = 1; }
      // the head
      lg.setTransform(DPR, 0, 0, DPR, 0, 0); lg.translate(xf.x, xf.y); lg.rotate(xf.rot); lg.scale(xf.s, xf.s); lg.translate(-EYE_ANCHOR[0], -EYE_ANCHOR[1]);
      lg.globalAlpha = 1 - P.form * .5; lg.drawImage(head, 0, 0);
      // a few tendrils that sway
      lg.lineCap = 'round';
      for (const d of tendrils) { const sway = still ? 0 : Math.sin(t * .5 + d.ph) * 18; lg.beginPath(); lg.moveTo(d.x, 480 + d.x * .1);
        lg.bezierCurveTo(d.x + sway * .4, 520 + d.len * .3, d.x + sway + 10, 520 + d.len * .7, d.x + sway * 1.6 + 20, 500 + d.len); lg.strokeStyle = '#07080c'; lg.lineWidth = d.w; lg.stroke(); }
      lg.globalAlpha = 1;
      strands.filter(s => s.front).forEach(drawStrand);
      // what can be seen: a general exposure, plus the reach of the small eyes and of the great Eye
      lg.setTransform(DPR, 0, 0, DPR, 0, 0);
      lg.globalCompositeOperation = 'destination-in';
      const [sx, sy] = toScreen(xf, ...EYE_ANCHOR), m = lg.createRadialGradient(sx, sy, 0, sx, sy, U * (.24 + P.cluster * .4));
      const base = P.expo * (1 - P.light * .25);
      m.addColorStop(0, `rgba(0,0,0,${Math.min(1, base + P.eyes2 * .5 + P.cluster * .4)})`); m.addColorStop(1, `rgba(0,0,0,${base})`);
      lg.fillStyle = m; lg.fillRect(0, 0, W, H);
      // turquoise light from the Eye, laid only on her body
      lg.globalCompositeOperation = 'source-atop';
      if (P.light > 0 || P.eyes2 > 0 || P.cluster > 0) {
        const lx = P.light > 0 ? ex : sx, ly = P.light > 0 ? ey : sy, lr = P.light > 0 ? U * (.35 + P.light * .75) : U * .22;
        const tl = lg.createRadialGradient(lx, ly, 0, lx, ly, lr);
        tl.addColorStop(0, `rgba(70,215,195,${.24 * Math.max(P.light, P.eyes2 * .7, P.cluster * .5)})`); tl.addColorStop(.5, `rgba(50,170,156,${.1 * Math.max(P.light, P.eyes2 * .5)})`); tl.addColorStop(1, 'rgba(70,215,195,0)');
        lg.fillStyle = tl; lg.fillRect(0, 0, W, H);
      }
      lg.globalCompositeOperation = 'source-over';
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(lay, 0, 0); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      // her small eyes: first two, later the whole cluster
      g.globalCompositeOperation = 'lighter';
      SMALL_EYES.forEach(([hx, hy, r], i) => {
        const a = i < 2 ? Math.max(P.eyes2, P.cluster) : P.cluster * .8; if (a <= .01) return;
        const [x, y] = toScreen(xf, hx, hy), rr = r * xf.s, fl = .85 + .15 * Math.sin(t * 2.1 + i * 1.7);
        const h = g.createRadialGradient(x, y, 0, x, y, rr * 8); h.addColorStop(0, `rgba(100,240,220,${.5 * a * fl})`); h.addColorStop(.2, `rgba(50,190,172,${.16 * a})`); h.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = h; g.fillRect(x - rr * 8, y - rr * 8, rr * 16, rr * 16);
        const c = g.createRadialGradient(x - rr * .2, y - rr * .15, 0, x, y, rr * .9); c.addColorStop(0, `rgba(210,255,248,${a})`); c.addColorStop(.45, `rgba(90,235,214,${a})`); c.addColorStop(1, `rgba(20,110,100,${a * .6})`);
        g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rr * .85, rr * .6, -.15, 0, TAU); g.fill();
        g.fillStyle = `rgba(0,22,20,${a * .9})`; g.beginPath(); g.ellipse(x + rr * .12, y + rr * .02, rr * .14, rr * .42, .1, 0, TAU); g.fill();
        g.fillStyle = `rgba(255,255,255,${a * .8})`; g.beginPath(); g.arc(x - rr * .35, y - rr * .2, rr * .12, 0, TAU); g.fill();
      });
      g.globalCompositeOperation = 'source-over';
    }
    // turquoise points that come and go in the dark
    if (P.signs) { g.globalCompositeOperation = 'lighter';
      for (const s of sparks) { const q = (t - s.at) / s.life; if (q < 0 || q > 1) continue; const a = Math.sin(q * Math.PI) * .8;
        const h = g.createRadialGradient(s.x * W, s.y * H, 0, s.x * W, s.y * H, 10); h.addColorStop(0, `rgba(150,255,240,${a})`); h.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = h; g.fillRect(s.x * W - 10, s.y * H - 10, 20, 20); }
      g.globalCompositeOperation = 'source-over'; }
    drawSwarm(t, t * .02 * (still ? 0 : 1));
    drawEye(t);
    // dust hanging in the dark
    g.fillStyle = '#9fb4b0';
    for (const m of motes) { if (!still) { m.y -= m.v * dt * m.z; m.x += Math.sin(t * .3 + m.p) * dt * 4; if (m.y < -5) { m.y = H + 5; m.x = Math.random() * W; } }
      const near = P.light ? Math.max(0, 1 - Math.hypot(m.x - W / 2, m.y - H * .52) / (U * .9)) : 0;
      g.globalAlpha = (.04 + near * .3 + P.expo * .05) * m.z * (1 - P.dark * .9); g.fillRect(m.x, m.y, m.z * 1.6, m.z * 1.6); }
    g.globalAlpha = 1;
    if (eating) { g.fillStyle = `rgba(0,0,0,${smooth((eL - .3) / (EAT.black - .3))})`; g.fillRect(0, 0, W, H); }
    // the dark closes in with every beat, and further when you come near
    const v = g.createRadialGradient(W / 2, H / 2, U * (.36 - pulse * .06 - gz.near * .1), W / 2, H / 2, Math.max(W, H) * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${.85 + pulse * .1})`);
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // when she comes at you: a flash, the world lurching toward the Eye, the ground shaking
    const L = t - lungeT, z = L < 0 ? 0 : L < .12 ? L / .12 : Math.exp(-(L - .12) * 2.4);
    if (z > .01) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(120,255,235,${z * .22})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
    shake *= Math.exp(-dt * 4);
    cv.style.transform = still ? '' : `translate(${(Math.random() - .5) * (shake + pulse * gz.near * .3) * U * .025}px,${(Math.random() - .5) * (shake + pulse * gz.near * .3) * U * .025}px) scale(${1 + z * .3})`;
    raf = requestAnimationFrame(frame);
  }

  /* ---------------- sound and words, fired once per viewing ---------------- */
  function once(id, at, t, fn) { if (t >= at && !fired.has(id)) { fired.add(id); if (!skip || id === 'words') fn(); } }
  function events(t) {
    once('wind', .2, t, () => Sound.sfx('breath'));
    once('rumble', B.eyes - 1, t, () => Sound.sfx('rumble'));
    once('res', B.eyes + 1.5, t, () => Sound.sfx('resonance'));
    once('gone', B.gone + .3, t, () => Sound.sfx('breath'));
    once('shape', B.shape + .5, t, () => { Sound.sfx('rumble'); Sound.sfx('resonance'); });
    once('eye', B.eye, t, () => Sound.sfx('eye'));
    // the moment the pupil finds you, she comes at you
    once('riser', B.eye + 3.85, t, () => Sound.sfx('riser'));
    once('focus', B.eye + 5.4, t, () => { Sound.sfx('lunge'); gz.squint = .4; if (!reduced()) { lungeT = t; shake = 1.6; } });
    once('swarm', B.eye + 6.5, t, () => { Sound.sfx('hiss'); Sound.sfx('whisper'); });
    once('words', B.words, t, words);
  }
  function words() {
    setFlag('revealSeen'); Know.lore('end'); Know.see('arch2');
    const lines = [['AKH NHAUR VEN .', has('name') ? 'Her eye is watching.' : 'The eye of the deep is watching.', 'The first words you saw, over the Threshold.'],
      ['NHAURITH ZHAALAR VEN .', 'Nhaurith sees the one who reads.'],
      [null, 'She was watching before you could read a single sign.'],
      ['KRUL .', 'The end.']];
    const box = $('#endtext');
    // each line in the Tongue is glossed only as far as you can read it
    box.innerHTML = `<div class="lines">${lines.map(([gl, tr, sub]) => `<p>${gl ? Glyph.svg(gl, 'glyphs') : ''}<span>${!gl || lineKnown(gl) ? tr : wordsOf(gl).map(w => wordInfo(w).g || tl(w)).join(' ') + '…'}</span>${sub ? `<small>${sub}</small>` : ''}</p>`).join('')}</div>
      <div class="name"><h1>Nhaurith</h1><h2>The One Below</h2></div><div class="acts"><button type="button" id="e-stay">Keep looking</button><button type="button" id="e-again">Watch again</button><button type="button" id="e-back">Turn away</button></div>`;
    box.hidden = false;
    // one line at a time, each given room to be read; then her name, then the way out
    const ps = $$('.lines p', box), gap = skip ? 0 : reduced() ? 2600 : 4200;
    ps.forEach((p, i) => { timers.push(setTimeout(() => { ps.forEach(q => q.classList.remove('on')); p.classList.add('on'); }, 300 + i * gap)); });
    timers.push(setTimeout(() => { ps.forEach(q => q.classList.remove('on')); $('.name', box).classList.add('on'); }, 300 + ps.length * gap + (skip ? 0 : 600)));
    timers.push(setTimeout(() => { $('.acts', box).classList.add('on'); $('#e-back', box).focus({ preventScroll: true }); }, 300 + ps.length * gap + (skip ? 0 : 3800)));
    $('#e-stay', box).onclick = () => { box.hidden = true; $('#cinebar').hidden = false; $('#c-skip').hidden = true; };
    $('#e-again', box).onclick = () => start(true);
    $('#e-back', box).onclick = () => Scene.go('door');
    $('#c-skip').hidden = true;
  }

  /* ---------------- lifecycle ---------------- */
  const onMove = e => { if (gz.has) gz.speed += Math.hypot(e.clientX - mx, e.clientY - my); mx = e.clientX; my = e.clientY; gz.has = true; moved = true; };
  const onOut = e => { if (!e.relatedTarget) gz.has = false; };
  // touch her and she flinches; keep at it and she comes for you
  const onDown = e => {
    if (e.target.closest('button, a, #endtext .acts')) return; onMove(e);
    if (P.open < .8) return;
    if (eatT >= 0) return;
    if (inEye(e.clientX, e.clientY) && ++pokes && (pokeT = tNow) && pokes >= 10) return devour();
    gz.squint = 1; shake = Math.max(shake, .7); anger++; Sound.sfx('hiss');
    swarm.forEach(s => { s.bl = tNow + Math.random() * .15; s.nb = .3 + Math.random() * 3; });
    if (anger >= 3 && tNow - lungeT > 4) { anger = 0; Sound.sfx('lunge'); if (!reduced()) { lungeT = tNow; shake = 1.8; } }
  };
  let resizeT = 0; const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(layout, 200); };
  let timers = [];
  function start(replay) {
    stop();
    cv = $('#abyss'); g = cv.getContext('2d');
    if (!lay) [lay, lg] = mk(1, 1);
    if (!strand) { strand = strandTexture(); head = headTexture(); iris = irisTexture(); }
    layout();
    seed(53); sparks = Array.from({ length: 9 }, () => ({ x: .15 + R() * .7, y: .2 + R() * .5, at: B.signs + R() * (B.eyes - B.signs - 1), life: .6 + R() * 1.4 }));
    fired = new Set(); skip = false;
    $('#endtext').hidden = true; $('#endtext').innerHTML = '';
    cv.hidden = false; document.body.classList.add('cine');
    const bar = $('#cinebar'); bar.hidden = false;
    $('#c-skip').hidden = !has('revealSeen'); $('#c-skip').onclick = () => { skip = true; $('#c-skip').hidden = true; };
    $('#c-leave').onclick = () => Scene.go('door');
    addEventListener('pointermove', onMove); addEventListener('pointerdown', onDown); document.addEventListener('pointerout', onOut); addEventListener('resize', onResize);
    Object.assign(gz, { x: 0, y: 0, dil: .9, blink: -9, next: 0, squint: 0, near: 0, speed: 0, wander: 0 }); anger = 0; shake = 0; lungeT = -99; pulse = 0; heartAt = 0; pokes = 0; pokeT = -99; eatT = -99;
    cv.style.transformOrigin = '50% 52%'; Sound.score('start');
    t0 = last = performance.now(); raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf); raf = 0; timers.forEach(clearTimeout); timers = [];
    removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown); document.removeEventListener('pointerout', onOut); removeEventListener('resize', onResize);
    Sound.score('stop');
    if (cv) { cv.hidden = true; cv.style.transform = ''; }
    document.body.classList.remove('cine'); $('#cinebar').hidden = true; $('#endtext').hidden = true;
  }
  return { start, stop };
})();

ROOMS.abyss = {
  name: 'Below', depth: '', mood: 'abyss', canvas: true, guard: () => has('doorOpen'),
  enter() { Nhaurith.start(); },
  leave() { Nhaurith.stop(); },
};
LORE.end = { t: 'The One Below', d: 'Nhaurith. Not a serpent that lives in the abyss: the abyss, with a name. The temple was her closed eye, the city its lid, the keys five scales of her own body. Everything that falls, falls to her. She was watching you from the Threshold.' };
LORE.eaten = { t: 'Inside', d: 'You put your finger in the eye of the abyss ten times. She took you into her mouth, and then, for reasons of her own, she let you out again.' };
