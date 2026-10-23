// The mechanisms of Thessaros: the first reading, the scribes' wall, and the five chambers that hold the keys.
// Each opens as a close-up view (Exam) and writes its progress into S.puz so it survives a reload.
const Puzzles = {};
const fb = (el, text, good) => { const p = $('.fb', el); if (!p) return; p.className = 'fb' + (good ? ' good' : ''); p.innerHTML = text; };
// Opening the way down once both chambers on a ring have given up their keys.
function checkGates() {
  if (S.keys.names && S.keys.chronicle && !has('portcullis')) { setFlag('portcullis'); S.known.middle = 1; setTimeout(() => { Sound.sfx('rumble'); say('Somewhere behind you, chains run out and iron grinds upward. The gate to the Middle Ring has risen.'); }, 1800); }
  if (S.keys.coil && S.keys.rite && !has('bridge')) { setFlag('bridge'); S.known.lower = 1; setTimeout(() => { Sound.sfx('rumble'); say('Far off, stone slides over stone. A bridge has pushed out across the Throat.'); }, 1800); }
  if (keyCount() >= 3 && !has('turned')) setFlag('turned');
}

/* ---------------- the arch: the first deduction ---------------- */
Puzzles.arch = () => Exam.open({ tag: 'The Threshold', title: 'Reading the great word', build(el) {
  const word = 'THESSAROS', sign = [...word];
  const guess = {};
  el.innerHTML = `<p class="lead">Nine signs. Write a sound under any sign; every copy of the same sign takes the same sound.</p>
    <div class="arch-read">${sign.map((c, i) => `<label class="cell"><svg viewBox="-1 -1 13 21" class="glyphs" aria-hidden="true"><path class="gl" data-l="${c}" d="${Glyph.path(c)}"/></svg>
      <input maxlength="1" data-i="${i}" data-s="${c}" aria-label="Sound of sign ${i + 1}" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>`).join('')}</div>
    <p class="fb" aria-live="polite"></p>`;
  const inputs = $$('input', el);
  const paint = () => inputs.forEach(i => { i.value = guess[i.dataset.s] || ''; });
  inputs.forEach((inp, k) => {
    inp.oninput = () => {
      const v = norm(inp.value).slice(-1);
      if (v) guess[inp.dataset.s] = v; else delete guess[inp.dataset.s];
      paint(); Sound.sfx('tick');
      const next = inputs.slice(k + 1).find(i => !i.value); if (v && next) next.focus();
      const read = inputs.map(i => i.value).join('');
      if (read.length < 9) { fb(el, ''); return; }
      if (read === word) {
        fb(el, 'THESSAROS. The name on the old charts fits the signs exactly. Seven of the serpent signs now have a sound.', true);
        setFlag('arch'); Know.see('arch'); Know.see('arch2'); Know.letters(word); Sound.sfx('good');
        inputs.forEach(i => i.disabled = true);
        setTimeout(() => Exam.close(), 2600);
      } else fb(el, `The signs read <b>${read}</b>. It means nothing to you. Is there a nine-letter name for this place?`);
    };
    inp.onkeydown = e => { if (e.key === 'Backspace' && !inp.value && k) inputs[k - 1].focus(); };
  });
  setTimeout(() => inputs[0].focus(), 50);
} });

/* ---------------- the scribes' wall: the whole alphabet ---------------- */
Puzzles.alphabet = () => Exam.open({ tag: 'The Hall of Letters', title: 'The scribes’ wall', build(el) {
  let sel = null;
  const draw = () => {
    const solved = has('alphabet');
    el.innerHTML = `<p class="lead">${solved ? 'Every sign has its sound.' : 'Every sign of the script, laid out in rows by the scribes. Select a sign, then give it a sound.'}</p>
      <div class="abcwall" role="grid">${Glyph.ROWS.map((row, r) => `<div class="abcrow" role="row">${[...row].map(c => `<button type="button" class="abccell ${S.letters[c] ? 'k' : ''} ${sel === c ? 'sel' : ''}" data-c="${c}" role="gridcell" aria-label="${S.letters[c] ? 'sign ' + c : 'unknown sign'}">
        <svg viewBox="-1 -1 13 21" class="glyphs"><path d="${Glyph.path(c)}"/></svg><b>${S.letters[c] ? c : ''}</b></button>`).join('')}</div>`).join('')}</div>
      ${solved ? '' : `<div class="picker" aria-label="Sounds">${[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(l => `<button type="button" data-p="${l}" ${S.letters[l] ? 'disabled' : ''}>${l}</button>`).join('')}</div>`}
      <p class="fb" aria-live="polite"></p>`;
    $$('.abccell', el).forEach(b => b.onclick = () => { if (S.letters[b.dataset.c] || solved) return; sel = b.dataset.c; Sound.sfx('tick'); draw(); $(`.abccell[data-c="${sel}"]`, el).focus(); });
    $$('[data-p]', el).forEach(b => b.onclick = () => assign(b.dataset.p));
  };
  const assign = l => {
    if (!sel) { fb(el, 'Choose a sign on the wall first.'); return; }
    if (l !== sel) { Sound.sfx('deny'); shake($(`.abccell[data-c="${sel}"]`, el)); fb(el, `Your stylus slips: “${l}” will not sit on that sign.`); return; }
    Know.letters(l, true); Sound.sfx('good'); const done = sel; sel = null;
    const rows = Glyph.ROWS.filter(r => r.length > 1 && [...r].every(c => S.letters[c])).length;
    draw(); fb(el, `“${done}”. The sign takes the sound.`, true);
    if (rows >= 2) cascade();
  };
  const cascade = async () => {
    fb(el, 'You see it now. The heads name the rows; the barbs count along them; the rows run in the order of your own alphabet.', true);
    $$('.abccell:not(.k)', el).forEach((b, i) => setTimeout(() => { b.classList.add('k', 'ink'); $('b', b).textContent = b.dataset.c; Sound.sfx('tick'); }, 200 + i * 90));
    await wait(200 + 26 * 90 + 600);
    Know.letters('ABCDEFGHIJKLMNOPQRSTUVWXYZ', true); setFlag('alphabet'); Know.see('abc'); Know.rule('script'); Know.confirm('ZHAAL');
    note('Script', 'Every sign now has a sound. Inscriptions you have copied can be sounded out in your journal.', 'good');
    await wait(900); Sound.sfx('stone');
    say('A deep grinding from the right-hand wall: the slab in the inner doorway sinks into the floor.');
    Exam.close();
  };
  el.onkeydown = e => { if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey && sel) { e.preventDefault(); assign(e.key.toUpperCase()); } };
  draw();
} });

/* ---------------- I. the six names ---------------- */
Puzzles.names = focus => Exam.open({ tag: 'Chamber I · Shemos', title: 'The six names', build(el) {
  const st = S.puz.names ||= [0, 0, 0, 0, 0, 0];
  const solved = () => !!S.keys.names;
  const draw = () => {
    el.innerHTML = `<p class="lead">${solved() ? 'Every thing holds its own name.' : 'Six things on six plinths. Above each, a stone prism with a word on every face. Turn each prism to the name of the thing beneath it, then pull the lever.'}</p>
      <div class="names">${NAMES.things.map((t, i) => { const w = solved() ? NAMES.right[i] : NAMES.faces[i][st[i]];
        return `<div class="plinth"><button type="button" class="prism ${solved() ? 'ok' : ''}" data-i="${i}" aria-label="Prism over the ${t}: reads ${tl(w)}. Turn it.">${Glyph.svg(w)}<span>${tl(w)}</span></button>
          <svg viewBox="-60 -60 120 110" class="thing" aria-hidden="true">${thingArt(i, 0, 0, 1.3)}</svg><p>${['a dressed stone', 'a bronze lamp, lit', 'an iron key', 'a small bronze door', 'a coiled serpent', 'a glass eye'][i]}</p></div>`; }).join('')}</div>
      <div class="lever-row">${inscView('leverN')}${solved() ? '' : '<button type="button" class="pri" id="pull">Pull the lever</button>'}</div><p class="fb" aria-live="polite"></p>`;
    Know.see('leverN');
    $$('.prism', el).forEach(b => b.onclick = () => {
      if (solved()) return;
      const i = +b.dataset.i; st[i] = (st[i] + 1) % 4; save(); Sound.sfx('grind'); draw();
      const nb = $(`.prism[data-i="${i}"]`, el); nb.classList.add('turn'); nb.focus();
    });
    const pull = $('#pull', el); if (pull) pull.onclick = pullLever;
  };
  const pullLever = async () => {
    const right = st.filter((f, i) => NAMES.faces[i][f] === NAMES.right[i]).length;
    Sound.sfx('clank');
    if (right < 6) { await wait(300); Sound.sfx('deny'); shake($('.names', el)); fb(el, right ? `The lever travels a little way and jams. Behind the wall, ${right === 1 ? 'one catch' : `${right} catches`} of six fall${right === 1 ? 's' : ''} into place, and the rest hold.` : 'The lever will not move at all. Not one name holds.'); return; }
    $('#pull', el).disabled = true;
    for (let i = 0; i < 6; i++) { await wait(380); $$('.prism', el)[i].classList.add('ok'); Sound.sfx('tick'); }
    fb(el, 'The lever drops. Six catches fall, one after another, and the reliquary on the back wall unfolds like an opening eyelid.', true);
    await wait(1400);
    NAMES.right.forEach(w => Know.confirm(w, true)); Know.confirm('SHEM', true); Know.rule('os');
    note('Codex', 'Six words confirmed: <i>vorz, lum, ghaz, durn, ouroth, akh</i>, and <i>shem</i>, name.', 'good');
    await awardKey('names', 'Inside the reliquary, on a cushion of dust: a key of pale bone. A single word runs down its shaft: <i>shem</i>.');
    Exam.close(); checkGates();
  };
  draw();
  if (focus != null) setTimeout(() => $$('.prism', el)[focus]?.focus(), 60);
} });

/* ---------------- II. the Chronicle stele ---------------- */
// A 440 x 660 stele in three registers of two lines; it broke into six pieces, each piece a jagged cell of a 2 x 3 grid.
const STELE = (() => {
  const W = 440, H = 660, xs = 220, ys = [220, 440];
  // jagged seams, shared by neighbouring pieces
  const jag = (a, b, fixed, n, amp, sd, vert) => { Art.srand(sd); const pts = [];
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n, o = (i === 0 || i === n) ? 0 : (Art.rnd() - .5) * amp; pts.push(vert ? [fixed + o, t] : [t, fixed + o]); } return pts; };
  const V = [jag(0, 220, xs, 7, 26, 3, true), jag(220, 440, xs, 7, 26, 4, true), jag(440, 660, xs, 7, 26, 5, true)];
  const Hs = ys.map((y, k) => [jag(0, 220, y, 6, 22, 10 + k), jag(220, 440, y, 6, 22, 20 + k)]);
  const P = pts => pts.map(p => p.map(Art.f1).join(',')).join(' ');
  const rev = a => [...a].reverse();
  const cell = (r, c) => {
    const top = r === 0 ? (c ? [[220, 0], [440, 0]] : [[0, 0], [220, 0]]) : Hs[r - 1][c];
    const bot = r === 2 ? (c ? [[220, 660], [440, 660]] : [[0, 660], [220, 660]]) : Hs[r][c];
    const side = c ? [[440, top.at(-1)[1]], [440, bot.at(-1)[1]]] : [[0, top[0][1]], [0, bot[0][1]]];
    return c ? [...top, ...side.slice(1), ...rev(bot), ...rev(V[r])] : [...top, ...V[r].slice(1), ...rev(bot), side[0]];
  };
  const SLOTS = { TL: [0, 0], TR: [0, 1], ML: [1, 0], MR: [1, 1], BL: [2, 0], BR: [2, 1] };
  const poly = Object.fromEntries(Object.entries(SLOTS).map(([k, [r, c]]) => [k, P(cell(r, c))]));
  const lines = INSC.stele.t.split('|'), forged = INSC.forgery.t.split('|');
  const text = (ls, col) => ls.map((l, i) => carve(l, 220, [118, 168, 338, 388, 558, 608][i] - 10, 22, { center: true, col })).join('');
  const border = eyes => `<rect x="6" y="6" width="428" height="648" fill="none" stroke="#1d1e22" stroke-width="22"/><rect x="6" y="6" width="428" height="648" fill="none" stroke="${eyes ? '#7b7266' : '#6d7178'}" stroke-width="10" stroke-dasharray="16 6"/>
    ${eyes ? Array.from({ length: 14 }, (_, i) => `<circle cx="6" cy="${30 + i * 46}" r="4" fill="#2b241c"/>`).join('') : ''}`;
  const art = {
    real: `<rect width="${W}" height="${H}" fill="#4e5259"/><rect width="${W}" height="${H}" fill="url(#pGrain)"/>${border(false)}
      <g stroke="#2a2c30" stroke-width="3" fill="#7d8188">
        ${[0, 1, 2, 3].map(i => `<g transform="translate(${60 + i * 36} ${40 + i * 14})"><circle r="7"/><path d="M-6 8L-8 34H8L6 8Z"/></g>`).join('')}<path d="M50 90L200 70L210 96H40Z" fill="#2a2c30"/>
        <g transform="translate(330 50)"><circle r="8"/><path d="M-7 9L-10 42H10L7 9Z"/><circle cx="16" cy="14" r="5" fill="#cfc6ae"/></g><path d="M260 96Q330 60 400 96" fill="none"/></g>
      <path d="M120 270Q220 205 320 270Q220 330 120 270Z" fill="#1d2b2a" stroke="#2a2c30" stroke-width="4"/><circle cx="220" cy="270" r="26" fill="#3a6a64"/><circle cx="220" cy="270" r="10" fill="#000"/>
      ${[70, 110, 330, 370].map((x, i) => `<g transform="translate(${x} ${250 + (i % 2) * 18}) rotate(${i < 2 ? 30 : -30})" fill="#7d8188" stroke="#2a2c30" stroke-width="2"><path d="M-8 -14l4 -8l4 6l4 -6l4 8z"/><circle r="6"/><path d="M-6 6L-8 26H8L6 6Z"/></g>`).join('')}
      <path d="M140 490Q220 450 300 490Q220 530 140 490Z" fill="#2a2c30" stroke="#1a1b1e" stroke-width="3"/><path d="M142 490H298" stroke="#7d8188" stroke-width="3"/>
      ${[0, 1, 2, 3, 4].map(i => `<circle cx="${170 + i * 25}" cy="${478 - Math.sin((i + .5) / 5 * Math.PI) * 10}" r="3" fill="#000"/>`).join('')}
      ${[60, 96, 344, 380].map((x, i) => `<g transform="translate(${x} 488)" fill="#5c5f66" stroke="#2a2c30" stroke-width="2"><path d="M-10 -24Q0 -38 10 -24L12 26H-12Z"/><path d="M${i < 2 ? 10 : -10} -8L${i < 2 ? 30 : -30} 0" stroke-width="6"/></g>`).join('')}
      ${text(lines, '#d7cfb8')}`,
    forged: `<rect width="${W}" height="${H}" fill="#6a6156"/><rect width="${W}" height="${H}" fill="url(#pGrain)"/>${border(true)}
      <path d="M40 300Q120 240 200 300" fill="none" stroke="#3a3229" stroke-width="5"/>${[0, 1, 2].map(i => `<g transform="translate(${60 + i * 50} 250)" fill="#8f8473" stroke="#3a3229" stroke-width="2"><circle r="7"/><path d="M-6 8L-8 32H8L6 8Z"/><path d="M8 18Q30 20 40 44" stroke-width="5" fill="none"/></g>`).join('')}
      ${text(['', '', ...forged, '', ''], '#e4d6b8')}`,
  };
  return { W, H, poly, art, SLOTS };
})();
const FRAG_SLOT = { fTL: 'TL', fTR: 'TR', fML: 'ML', fMR: 'MR', fBL: 'BL', fBR: 'BR', fX: 'ML' };
const fragSVG = (id, slot, cls = '') => {
  const s = slot || FRAG_SLOT[id], forged = id === 'fX', clip = `clip-${id}-${slot ? 'p' : 't'}`;
  return `<g class="frag ${cls}"><clipPath id="${clip}"><polygon points="${STELE.poly[s]}"/></clipPath><g clip-path="url(#${clip})">${forged ? STELE.art.forged : STELE.art.real}</g>
    <polygon points="${STELE.poly[s]}" fill="none" stroke="#000" stroke-width="3"/></g>`;
};
Puzzles.stele = () => Exam.open({ tag: 'Chamber II · Zhaalos', title: 'The Chronicle stele', build(el) {
  const st = S.puz.stele ||= {};
  let sel = null;
  const solved = () => !!S.keys.chronicle;
  const tray = () => S.inv.filter(i => FRAG_SLOT[i] && !Object.values(st).includes(i));
  const bbox = s => { const pts = STELE.poly[s].split(' ').map(p => p.split(',').map(Number)); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; };
  const draw = () => {
    const placed = Object.keys(st).length;
    el.innerHTML = `<div class="stelewrap"><svg class="stele" viewBox="-20 -20 480 700" role="group" aria-label="The stele base with six places for fragments">
        <rect x="-20" y="640" width="480" height="40" fill="#25262a"/>
        ${Object.keys(STELE.SLOTS).map(s => st[s] ? `<g class="slot full" data-s="${s}" tabindex="0" role="button" aria-label="Fragment in place; take it out">${fragSVG(st[s], s)}</g>`
          : `<g class="slot" data-s="${s}" tabindex="0" role="button" aria-label="Empty place ${s}"><polygon points="${STELE.poly[s]}" fill="#0b0b0d" stroke="#55585f" stroke-width="2" stroke-dasharray="6 5"/></g>`).join('')}
        ${solved() ? '<circle cx="220" cy="22" r="14" fill="#000" stroke="#b9a978" stroke-width="3"/>' : ''}</svg>
      <div class="tray"><p class="tag">In your satchel</p>${tray().map(id => { const [x, y, w, h] = bbox(FRAG_SLOT[id]);
        return `<button type="button" class="fragbtn ${sel === id ? 'sel' : ''}" data-f="${id}" aria-label="${ITEMS[id].name}"><svg viewBox="${x - 6} ${y - 6} ${w + 12} ${h + 12}">${fragSVG(id)}</svg></button>`; }).join('') || `<p class="dim">${solved() ? 'Nothing left to place.' : 'No fragments. Search the hall.'}</p>`}
        <p class="dim">${6 - placed > 0 && !solved() ? `${6 - Math.min(6, placed)} place${6 - placed === 1 ? '' : 's'} still empty.` : ''}</p></div></div>
      ${solved() ? inscView('stele') : ''}<p class="fb" aria-live="polite"></p>`;
    if (solved()) Know.see('stele');
    $$('.fragbtn', el).forEach(b => b.onclick = () => { sel = sel === b.dataset.f ? null : b.dataset.f; Sound.sfx('tick'); draw(); });
    $$('.slot', el).forEach(g => { const act = () => slotTap(g.dataset.s); g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }; });
  };
  const slotTap = s => {
    if (solved()) return;
    if (st[s]) { delete st[s]; save(); Sound.sfx('grind'); draw(); fb(el, 'You lift the fragment out again.'); return; }
    if (!sel) { fb(el, tray().length ? 'Choose a fragment from your satchel first.' : 'You have nothing to set here. More of the stele lies somewhere in this hall.'); return; }
    if (FRAG_SLOT[sel] !== s) { Sound.sfx('deny'); shake($(`.slot[data-s="${s}"]`, el)); fb(el, 'It does not sit flush there. The edges argue with each other.'); return; }
    st[s] = sel; sel = null; save(); Sound.sfx('clank'); draw();
    if (Object.keys(st).length === 6) check(); else fb(el, 'It settles into place with a grind of stone on stone.');
  };
  const check = async () => {
    if (st.ML !== 'fML') { Know.see('forgery'); Sound.sfx('deny'); fb(el, 'The stele stands whole, but it stays dead. Read across the breaks: the middle lines do not make words. One of these pieces is from a different stone.'); return; }
    fb(el, 'The last piece grinds home. The lines run unbroken across every crack, and the stone shudders as something inside it lets go.', true);
    Sound.sfx('stone'); await wait(1600);
    ['VAL', 'ISHVEL', 'GHUL', 'ZARG', 'SHA', 'THESS', 'KRUL', 'NHAUR'].forEach(w => Know.confirm(w, true));
    ['order', 'poss', 'uk', 'ar'].forEach(r => Know.rule(r));
    note('Codex', 'The reliefs beside each line give their meaning plainly. Eight words confirmed.', 'good');
    if (holding('fX')) Know.lore('forged');
    S.inv = S.inv.filter(i => !FRAG_SLOT[i] || i === 'fX'); renderKeyring();
    await awardKey('chronicle', 'At the top of the stele a carved eye-boss swings open on a stone hinge. Inside lies a heavy key of grey slate.');
    Exam.close(); checkGates();
  };
  draw();
} });

/* ---------------- III. the Engine of Sleep ---------------- */
// Crank A turns the outer ring on and the middle ring back; crank B turns the middle and inner rings on. Only forwards.
Puzzles.coil = () => Exam.open({ tag: 'Chamber III · Murros', title: 'The rings of the Engine', build(el) {
  const st = S.puz.coil ||= [3, 1, 2], N = COIL_N, R = [200, 145, 92];
  const ang = st.map((v, k) => v / N[k] * 360);
  let turns = 0, busy = false;
  const solved = () => !!S.keys.coil;
  el.innerHTML = `<div class="coilview"><svg viewBox="-250 -250 500 500" class="coil" role="img" aria-label="Three stone rings seen from above">
      <circle r="245" fill="#0d0e10"/>
      ${R.map((r, k) => `<g class="ring" id="ring${k}"><circle r="${r}" fill="none" stroke="#000" stroke-width="${[58, 50, 44][k]}"/><circle r="${r}" fill="none" stroke="${['#2c2d31', '#34363b', '#3c3e44'][k]}" stroke-width="${[50, 42, 36][k]}"/>
        ${Array.from({ length: N[k] }, (_, i) => `<circle cx="${Math.sin(i / N[k] * TAU) * r}" cy="${-Math.cos(i / N[k] * TAU) * r}" r="4" fill="#8d887a"/>`).join('')}
        <g class="head" transform="translate(0 ${-r})"><path d="M0 -24Q16 -6 10 12Q0 22 -10 12Q-16 -6 0 -24Z" fill="#6a6d74" stroke="#000" stroke-width="3"/><circle cx="-4" cy="-6" r="2.5" fill="#000"/><circle cx="4" cy="-6" r="2.5" fill="#000"/></g></g>`).join('')}
      <path d="M-26 -236Q0 -252 26 -236Q0 -222 -26 -236Z" fill="#000" stroke="#c9c0a6" stroke-width="2.5"/><path d="M0 -222V-50" stroke="#c9c0a6" stroke-opacity=".15" stroke-width="2" stroke-dasharray="4 6"/>
      <circle r="44" fill="#08090a" stroke="#000" stroke-width="4" id="hub"/></svg>
    <div class="cranks">
      <button type="button" id="cA" class="crank"><svg viewBox="-30 -30 60 60" aria-hidden="true"><circle r="22" fill="none" stroke="currentColor" stroke-width="5"/><path d="M0 0L18 -16" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>Turn the left crank</button>
      <button type="button" id="cB" class="crank" ${has('handleSet') ? '' : 'disabled'}><svg viewBox="-30 -30 60 60" aria-hidden="true"><circle r="22" fill="none" stroke="currentColor" stroke-width="5"/>${has('handleSet') ? '<path d="M0 0L18 -16" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>' : '<rect x="-5" y="-5" width="10" height="10"/>'}</svg>${has('handleSet') ? 'Turn the right crank' : 'The right crank has no handle'}</button>
      <p class="count" aria-live="polite"></p></div></div>
    ${inscView('breath')}<p class="fb" aria-live="polite"></p>`;
  Know.see('breath');
  const paint = () => { R.forEach((r, k) => { $('#ring' + k, el).style.transform = `rotate(${ang[k]}deg)`; });
    $('.count', el).textContent = solved() ? 'The engine is at rest.' : turns ? `${turns} turn${turns === 1 ? '' : 's'} of the cranks.` : ''; };
  const turn = async which => {
    if (busy || solved()) return;
    busy = true; turns++;
    const d = which === 'A' ? [1, -1, 0] : [0, 1, 1];
    d.forEach((x, k) => { st[k] = ((st[k] + x) % N[k] + N[k]) % N[k]; ang[k] += x * 360 / N[k]; });
    save(); Sound.sfx('grind'); setTimeout(() => Sound.sfx('tick'), 200); paint();
    await wait(reduced() ? 60 : 420); busy = false;
    if (st.every(v => v === 0)) win();
  };
  const win = async () => {
    busy = true; $$('.crank', el).forEach(b => b.disabled = true);
    fb(el, 'Three serpents look upon the closed eye. Under your feet the engine shifts its whole weight, and settles, and is quiet.', true);
    $('.coil', el).classList.add('won'); Sound.sfx('hum'); Sound.sfx('stone');
    await wait(2400);
    ['MURR', 'VEN', 'RHA'].forEach(w => Know.confirm(w, true));
    note('Codex', 'The serpents look; the deep sleeps. <i>ven</i>, <i>murr</i> and <i>rha</i> confirmed.', 'good');
    setFlag('drained');
    await awardKey('coil', 'The hub at the centre of the rings rises on a column of stone. On it lies a key of green bronze, its bow wound into a spiral.');
    say('Through the grated door you hear water rushing away down a drain.');
    Exam.close(); checkGates();
  };
  $('#cA', el).onclick = () => turn('A'); $('#cB', el).onclick = () => turn('B');
  if (solved()) $('.coil', el).classList.add('won');
  paint();
} });

/* ---------------- IV. the last rite ---------------- */
const STATION = {
  tablet: { t: 'A table and a mallet', d: 'A clay tablet stamped with a single name, and a small bronze mallet.', a: 'Break the name-tablet', step: 'name' },
  basin:  { t: 'The basin', d: 'A stone basin of dark, still water, with a ladle.', a: 'Pour water over the body', step: 'wash' },
  wax:    { t: 'Wax and a candle', d: 'A pot of black wax kept soft by a candle that has burned for longer than the city has been empty.', a: 'Seal the eyes with wax', step: 'wax' },
  mask:   { t: 'The mask', d: 'A clay mask with no eyes, made for the face on the bier.', a: 'Lay the mask over the face', step: 'mask' },
  bell:   { t: 'The bell', d: 'A bronze bell hanging over the shaft, its rope worn smooth.', a: 'Ring the bell', step: 'bell' },
  crank:  { t: 'The winch', d: 'A winch that lowers the bier into the shaft on a chain.', step: 'lower' },
};
Puzzles.riteStation = k => {
  const s = STATION[k], done = !!S.keys.rite;
  const acts = done ? [] : k === 'crank'
    ? [{ label: 'Lower the bier, watching it go', fn: () => riteDo('lower', true) }, { label: 'Lower the bier with your eyes turned away', fn: () => riteDo('lower', false) }]
    : [{ label: s.a, fn: () => riteDo(s.step) }];
  Panel.open({ tag: 'The Chapel of the Last Rite', title: s.t, text: P(s.d) + (done ? P('The rite is finished.') : riteNote()), actions: acts });
};
async function riteDo(step, looked) {
  const i = S.puz.rite || 0, want = RITE[i];
  if (step === 'mask' && i < 3) { Sound.sfx('deny'); say('You lift the mask, but the eyes on the bier are still open beneath it. It would be covering a face that can still see. You set it down.'); return; }
  if (step !== want) {
    Sound.sfx('deny');
    if (i) { S.puz.rite = 0; save(); Scene.render(); say('The candle flames shrink to blue points. The rite has gone wrong. When they recover, everything on the bier is as it was before you began.'); }
    else say('Nothing answers. That is not where the rite begins.');
    return;
  }
  if (step === 'lower' && looked) {
    Sound.sfx('whisper'); Sound.sfx('teal'); $('#fade').classList.add('teal'); await wait(1400); $('#fade').classList.remove('teal');
    S.puz.rite = 0; save(); Scene.render();
    say('As the bier sinks you look down the shaft, and far below two small points of turquoise light look up at you. The chain jerks and runs back. The rite is broken; everything is as it was.');
    return;
  }
  S.puz.rite = i + 1; save();
  Sound.sfx({ name: 'clank', wash: 'drip', wax: 'tick', mask: 'grind', bell: 'bell', lower: 'rumble' }[step]);
  Scene.render();
  if (step !== 'lower') { say({ name: 'The tablet cracks in two. The name on it is gone.', wash: 'The water runs off the linen and down into the shaft. You do not hear it land.', wax: 'You press warm wax over both eyes. They stay shut.', mask: 'The mask settles over the face. It fits exactly.', bell: 'One note. It goes on much longer than it should, down the shaft and away.' }[step]); return; }
  Scene.busy = true;
  say('Eyes averted, you turn the winch. The bier sinks out of the lamplight. The chain runs and runs.');
  await wait(4200); Sound.sfx('breath');
  say('The chain goes slack. Then, slowly, it begins to wind back up on its own.');
  await wait(3600); Sound.sfx('clank');
  S.puz.rite = 0; setFlag('riteHidden'); Scene.busy = false;
  ['SKETH', 'ORR', 'MUL', 'DAL', 'KRAK', 'KHOL', 'ZHA', 'KA'].forEach(w => Know.confirm(w, true)); Know.rule('ka');
  note('Codex', 'The rite is understood. Eight words confirmed.', 'good');
  await awardKey('rite', 'The bier comes back up empty. No body, no linen, no mask. Only a key, made of something black and fibrous that has grown into the shape of a key. It is warm.');
  Know.lore('rite'); checkGates();
}

/* ---------------- V. the mirrors in Ishvel's cell ---------------- */
// A 7 x 7 floor. Light rises from the crack below column 3. '/' and '\' are mirrors the player turns.
const LENS = (() => {
  const cells = { '3,6': 'N', '4,5': 'H', '5,6': 'L', '5,4': 'A', '6,3': 'O', '4,3': 'U', '3,3': 'R', '2,2': 'I', '1,1': 'T', '0,2': 'H', '0,3': 'S', '0,0': 'E',
    '3,1': 'T', '3,0': 'H', '5,0': 'L', '4,2': 'K', '4,4': 'E', '2,5': 'S', '1,5': 'O', '2,4': '#', '2,0': '@' };
  const mirrors = ['3,5', '5,5', '5,3', '2,3', '2,1', '0,1', '4,1', '4,0'];
  const start = ['\\', '\\', '/', '/', '\\', '\\', '\\', '/'];
  function trace(state) {
    let x = 3, y = 7, dx = 0, dy = -1, read = '', path = [[3, 7.5]], end = 'rock';
    const seen = new Set();
    for (let n = 0; n < 80; n++) {
      x += dx; y += dy;
      if (x < 0 || y < 0 || x > 6 || y > 6) { path.push([x - dx * .5, y - dy * .5]); break; }
      path.push([x, y]);
      const k = x + ',' + y, m = mirrors.indexOf(k), c = cells[k];
      const key = `${k}|${dx}|${dy}`; if (seen.has(key)) break; seen.add(key);
      if (m >= 0) { [dx, dy] = state[m] === '/' ? [-dy, -dx] : [dy, dx]; continue; }
      if (c === '#') { end = 'blind'; break; }
      if (c === '@') { end = 'seat'; break; }
      if (c) read += c;
    }
    return { read, path, end };
  }
  return { cells, mirrors, start, trace };
})();
Puzzles.lens = () => Exam.open({ tag: 'Chamber V · Akhos', title: 'The mirrors of the keepers', build(el) {
  const st = S.puz.lens ||= [...LENS.start];
  const solved = () => !!S.keys.gaze;
  const C = 80, X = c => c * C + C / 2, Y = r => r * C + C / 2;
  const draw = () => {
    const t = LENS.trace(st);
    const pts = t.path.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ');
    let cellsSvg = '';
    for (const [k, c] of Object.entries(LENS.cells)) { const [x, y] = k.split(',').map(Number);
      if (c === '#') cellsSvg += `<g transform="translate(${X(x)} ${Y(y)})"><path d="M-30 26Q-34 -20 0 -30Q34 -20 30 26Z" fill="#010101" stroke="#222" stroke-width="2"/><text y="8" class="lbl">NUL</text></g>`;
      else if (c === '@') cellsSvg += `<g transform="translate(${X(x)} ${Y(y)})"><path d="M-30 30V-14Q-30 -28 -16 -28H16Q30 -28 30 -14V30Z" fill="#3b3e44" stroke="#000" stroke-width="3"/><rect x="-24" y="2" width="48" height="12" fill="#24262a"/><text y="-6" class="lbl">SEAT</text></g>`;
      else cellsSvg += `<g transform="translate(${X(x)} ${Y(y)})"><circle r="27" fill="#0f1a1a" stroke="#48615e" stroke-width="3"/><g transform="translate(-9.6 -17) scale(1.6)"><path class="lensg" d="${Glyph.path(c)}"/></g></g>`; }
    const mir = LENS.mirrors.map((k, i) => { const [x, y] = k.split(',').map(Number);
      return `<g class="mirror" data-m="${i}" tabindex="0" role="button" aria-label="Mirror ${i + 1}, set ${st[i] === '/' ? 'rising to the right' : 'rising to the left'}. Turn it." transform="translate(${X(x)} ${Y(y)})">
        <circle r="34" fill="#151819" stroke="#3b4344" stroke-width="3"/><g class="mface" style="transform:rotate(${st[i] === '/' ? -45 : 45}deg)"><rect x="-30" y="-5" width="60" height="10" rx="3" fill="#9bc7c1" stroke="#000" stroke-width="2"/></g></g>`; }).join('');
    const status = { rock: 'The light runs into bare rock and is lost.', blind: t.read === 'NHAUR' ? 'The light spells <i>nhaur</i>, and the black stone drinks it. The cell goes dim. This is how the keepers left it.' : 'The black stone drinks the light. The cell goes dim.',
      seat: t.read === 'NHAURITH' ? 'The light spells her whole name and falls on the reader’s seat.' : `The light reaches the reader’s seat, but the dark glass under it stays shut. The light spelled <i>${t.read.toLowerCase()}</i>.` }[t.end];
    el.innerHTML = `<div class="lensview"><svg viewBox="-10 -10 580 640" class="lens" role="group" aria-label="The mirror floor">
        <rect x="-10" y="-10" width="580" height="660" fill="#090b0c"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * C} 0V560M0 ${i * C}H560" stroke="#1a1e1f" stroke-width="2"/>`).join('')}
        <path d="M${X(3) - 30} 600L${X(3)} 565L${X(3) + 30} 600" fill="#7ff0e0" opacity=".6" filter="url(#fGlow)"/>
        <polyline points="${pts}" fill="none" stroke="#4fd6c4" stroke-width="16" opacity=".25" filter="url(#fBlur)"/><polyline points="${pts}" fill="none" stroke="#c7fff6" stroke-width="3" class="beam"/>
        ${cellsSvg}${mir}</svg>
      <div class="lensside"><p class="tag">The light has passed through</p><div class="readout">${t.read ? Glyph.svg(t.read, 'glyphs teal') : '<span class="dim">nothing</span>'}<b>${t.read.toLowerCase()}</b></div>
        <p class="status ${t.end}">${status}</p>${inscView('keepersPlate')}${inscView('seat')}</div></div><p class="fb" aria-live="polite"></p>`;
    $$('.mirror', el).forEach(g => { const act = () => flip(+g.dataset.m); g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } }; });
    if (t.end === 'blind' && t.read === 'NHAUR' && !has('keeperState')) { setFlag('keeperState'); Sound.sfx('breath'); }
    return t;
  };
  const flip = m => {
    if (solved()) return;
    st[m] = st[m] === '/' ? '\\' : '/'; save(); Sound.sfx('tick');
    const t = draw(); $(`.mirror[data-m="${m}"]`, el)?.focus();
    if (t.end === 'seat' && t.read === 'NHAURITH') win();
  };
  const win = async () => {
    fb(el, 'Every lens burns. The light that rises from the crack is not a light. It is a gaze, and it has found you.', true);
    Sound.sfx('eye'); Sound.sfx('teal'); $('.lens', el).classList.add('won');
    await wait(3000);
    Know.confirm('NUL', true); Know.confirm('ZHAAL', true); Know.rule('ith'); setFlag('name');
    await awardKey('gaze', 'The dark glass under the seat slides open by itself. Inside: a key of glass so dark it seems to absorb the lamp. At its core, a point of turquoise light that turns to follow you.');
    Exam.close(); say('On the far wall, something new has been written.');
  };
  draw();
} });
