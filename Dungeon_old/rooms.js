// The rooms of the Descent: the Hall of Glyphs and the five key chambers.
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const gsvg = ch => `<svg viewBox="-1 -1 13 21" class="glyphs"><path d="${Glyph.path(ch)}"/></svg>`;

/* ---------------- the Hall of Glyphs ---------------- */
const LEX = [['NUL', 'nul', 'void, nothing, the abyss'], ['OUROTH', 'ouroth', 'serpent, coil, the Serpent'], ['ZARG', 'zarg', 'god'],
  ['ZARGUK', 'zarg-ûk', 'all gods'], ['GHAZ', 'ghaz', 'key; also scale'], ['GHAZUK', 'ghaz-ûk', 'all keys, every key'],
  ['SHA', 'shâ', 'devours, eats, ends'], ['GHUL', 'ghûl', 'opens'], ['KRENN', 'krenn', 'counts, reckons'],
  ['AKH', 'akh', 'eye'], ['ISHKRA', 'ishkra', 'blood'], ['VORZ', 'vorz', 'stone'], ['MUL', 'mûl', 'mask, a face that is not yours'],
  ['KRUL', 'krûl', 'the end, the last'], ['DURN', 'dûrn', 'door; also mouth'], ['SKETH', 'sketh', 'flesh'], ['ZHAAL', 'zhaal', 'tongue, speech']];
const HEADS = [['Eye: the vowels', 'AEIOU'], ['Hook, left', 'BCDFG'], ['Hook, right', 'HJKLM'], ['Fangs', 'NPQRS'], ['Crown', 'TVWXY'], ['Bar', 'Z']];

VIEWS.hall = {
  build(el) {
    el.innerHTML = roomHead({ ...HALL, flavor: 'A long hall where every wall is a page. The Gorgons carved their alphabet here so the faithful could learn to read the Serpent. Study it well. Every chamber below speaks this tongue.' }) + `
      <div class="wrap">
        <div class="tabs" role="tablist">${['Codex', 'Lexicon', 'Slate', 'Trial'].map((t, i) => `<button role="tab" data-t="${i}" aria-selected="${!i}">${t}</button>`).join('')}</div>
        <div class="tabpanel panel" data-p="0"><h3>The Serpent Alphabet</h3>
          <p>Every letter is a small serpent: a <b>head</b> and a <b>body</b>. The head names the family. The <b>barbs</b> across the body count from none to four. Vowels wear the <b>Eye</b>, for the Serpent watches with five. Consonants march in order through the other heads, five to a family, and the lonely Z bears the bar.</p>
          <table class="heads"><tr><th></th>${[0, 1, 2, 3, 4].map(n => `<th>${n} barb${n === 1 ? '' : 's'}</th>`).join('')}</tr>
            ${HEADS.map(([h, ls]) => `<tr><th>${h}</th>${[0, 1, 2, 3, 4].map(n => `<td>${ls[n] ? Glyph.svg(ls[n]) + ls[n] : ''}</td>`).join('')}</tr>`).join('')}</table>
          <p class="etched">Full stops are a small diamond. Spaces are only silence.</p></div>
        <div class="tabpanel panel" data-p="1" hidden><h3>Lexicon of Nul-Ouroth</h3>
          <p class="flavor">Spoken low and harsh. <b>û</b> a long “oo”, <b>â</b> an open “ah”, <b>zh</b> as in <i>measure</i>, <b>kh</b> from the back of the throat. Written without the marks.</p>
          <div class="rule"><b>The Law of the Tongue.</b> The one who acts comes first, then what is acted upon, and the deed comes last, as the end always does.<br>
            <i>Nul zarg-ûk shâ</i>: the void, all gods, devours. “The void devours all gods.”<br>
            Only the creed breaks the law: <i>Ouroth shâ Ouroth</i> reads the same from either end, because it is a circle.</div>
          <div class="lex">${LEX.map(([g, w, m]) => `<div>${Glyph.svg(g)}<b>${w}</b> <span>${m}</span></div>`).join('')}</div></div>
        <div class="tabpanel panel slate" data-p="2" hidden><h3>The Scribe’s Slate</h3><p>Write in Common and the slate answers in the Serpent’s hand.</p>
          <input id="slate" placeholder="Write here…" autocomplete="off"><div class="out" id="slateout"></div></div>
        <div class="tabpanel panel trial" data-p="3" hidden><h3>The Trial of Glyphs</h3>
          <div id="trialIntro"><p>Ten glyphs will rise from the wall. Name each before its light fades. Three mistakes and the Serpent bites.</p>
            <p class="etched" id="best"></p><button type="button" id="trialGo">Begin the Trial</button></div>
          <div id="trialGame" hidden><div class="hud"><span id="tRound"></span><span id="tScore"></span><span class="lives" id="tLives"></span></div>
            <div class="big" id="tGlyph"></div><div class="timer"><i id="tBar"></i></div><div class="opts" id="tOpts"></div></div>
          <p class="fb" id="tFb"></p></div>
      </div>`;
    const tabs = $$('[role="tab"]', el), panels = $$('.tabpanel', el);
    tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.setAttribute('aria-selected', x === t)); panels.forEach(p => p.hidden = p.dataset.p !== t.dataset.t); Audio.sfx('tick');
      const p = panels[+t.dataset.t]; p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; });
    const slate = $('#slate', el), out = $('#slateout', el);
    slate.oninput = () => { out.innerHTML = slate.value.toUpperCase().split(/\s+/).filter(Boolean).map(w => `<div class="draw">${Glyph.svg(w)}</div>`).join(''); };

    // the trial: 10 glyphs, 4 choices, 3 lives, a fading light
    let round, score, lives, answer, timer;
    const family = l => HEADS.find(h => h[1].includes(l))[1];
    const end = () => { $('#trialGame', el).hidden = true; $('#trialIntro', el).hidden = false;
      S.trial = Math.max(S.trial, score); save(); paintBest();
      $('#tFb', el).className = 'fb' + (score === 10 ? ' good' : '');
      $('#tFb', el).textContent = score === 10 ? 'Ten of ten. The wall bows to you. You are glyph-sworn.' : lives ? `${score} of 10. The wall is patient.` : `The Serpent bites. ${score} of 10.`; };
    const choose = (b, l) => {
      clearTimeout(timer); $$('#tOpts button', el).forEach(x => { x.disabled = true; if (x.dataset.l === answer) x.classList.add('right'); });
      if (l === answer) { score++; Audio.sfx('good'); } else { lives--; if (b) b.classList.add('wrong'); Audio.sfx('deny'); shake($('#tGlyph', el)); }
      round++; setTimeout(nextRound, 750);
    };
    const nextRound = () => {
      if (round === 10 || !lives) return end();
      answer = pick([...ABC]);
      const fam = [...family(answer)].filter(c => c !== answer), opts = new Set([answer]);
      while (opts.size < 4) opts.add(fam.length && Math.random() < .6 ? pick(fam) : pick([...ABC]));
      $('#tRound', el).textContent = `Glyph ${round + 1} / 10`; $('#tScore', el).textContent = `${score} named`; $('#tLives', el).textContent = '◆'.repeat(lives) + '◇'.repeat(3 - lives);
      $('#tGlyph', el).innerHTML = `<div class="draw">${Glyph.svg(answer)}</div>`;
      $('#tOpts', el).innerHTML = [...opts].sort(() => Math.random() - .5).map(l => `<button type="button" data-l="${l}">${l}</button>`).join('');
      const bar = $('#tBar', el), secs = Math.max(3, 7 - round * .35);
      bar.classList.remove('run'); void bar.offsetWidth; bar.style.animationDuration = secs + 's'; bar.classList.add('run');
      timer = setTimeout(() => choose(null, ''), secs * 1000);
    };
    $('#tOpts', el).addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) choose(b, b.dataset.l); });
    $('#trialGo', el).onclick = () => { round = 0; score = 0; lives = 3; $('#tFb', el).textContent = ''; $('#trialIntro', el).hidden = true; $('#trialGame', el).hidden = false; nextRound(); };
    const paintBest = () => { $('#best', el).textContent = S.trial ? `Your best: ${S.trial} of 10` : ''; };
    paintBest();
    this.stop = () => clearTimeout(timer);
  },
  leave() { this.stop?.(); },
};

/* ---------------- I. The Speaking Wall: the coil cipher ---------------- */
// The inscription is written seven letters on. Turning the dial back reads it.
const WALL_ENC = 'ILMVYL AOL NVKZ AOLYL DHZ VUSF AOL CVPK. ZWLHR PAZ UHTL PU AOL AVUNBL VM AOL JVPS.';
VIEWS.wall = {
  build(el) {
    let k = 0;
    const step = 360 / 26;
    const inner = [...ABC].map((ch, i) => `<path transform="rotate(${i * step}) translate(0 -128) scale(1.15) translate(-6 -10)" d="${Glyph.path(ch)}"/>`).join('');
    const outer = [...ABC].map((ch, i) => { const a = (i * step - 90) * Math.PI / 180;
      return `<text class="lat" x="${(Math.cos(a) * 172).toFixed(1)}" y="${(Math.sin(a) * 172 + 5).toFixed(1)}">${ch}</text>`; }).join('');
    el.innerHTML = roomHead(CH[0], 0) + `
      <div class="panel"><p class="tag">The inscription</p><br>
        <div class="inscr" id="inscr">${WALL_ENC.split(' ').map(w => `<span class="word">${[...w].map(ch => ABC.includes(ch)
          ? `<span class="gcell" data-c="${ABC.indexOf(ch)}">${gsvg(ch)}<b></b></span>` : `<span class="gdot">${gsvg(ch)}</span>`).join('')}</span>`).join('')}</div>
        <div class="dial" id="dial"><svg viewBox="-205 -205 410 410" aria-label="the serpent dial">
          <circle r="196" fill="#120d12" stroke="#000" stroke-width="3"/><circle r="152" fill="#0b080d" stroke="#ffffff14"/>
          <circle r="104" fill="#060407" stroke="#ffffff10"/>${outer}
          <path d="M-8 -198L0 -184L8 -198Z" fill="#3fd8a4"/>
          <g class="inner" id="dinner"><g fill="none" stroke="#3fd8a4" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>
            <g transform="translate(0 -96)"><path d="M14 -7L-12 0L14 7Q8 0 14 -7Z" fill="#2a1f2c" stroke="#3fd8a4"/><circle cx="2" cy="-2" r="1.6" fill="#ff3b12"/></g></g>
          <text y="6" text-anchor="middle" font-family="Cinzel" font-size="12" fill="#6f6458" letter-spacing="3">TURN THE COIL</text></svg></div>
        <div class="ctrls"><button type="button" id="dl">◀ Turn back</button><button type="button" id="dr">Turn on ▶</button></div>
        <p class="etched">Scratched beneath the dial in the Tongue:</p><div style="color:var(--c);max-width:340px;margin:0 auto">${Glyph.svg('IT HAS SWALLOWED SEVEN')}</div>
        <p class="fb" id="wfb"></p></div>
      ${speakForm(0)}`;
    const cells = $$('.gcell', el), inscr = $('#inscr', el), dinner = $('#dinner', el), dial = $('#dial', el);
    const paint = () => {
      dinner.style.transform = `rotate(${-k * step}deg)`;
      const kk = ((k % 26) + 26) % 26;
      cells.forEach(c => $('b', c).textContent = ABC[(+c.dataset.c - kk + 26) % 26]);
      const clear = kk === 7; inscr.classList.toggle('clear', clear);
      if (clear && !paint.was) { Audio.sfx('stone'); $('#wfb', el).className = 'fb good'; $('#wfb', el).textContent = 'The wall speaks clearly now. It is asking you something.'; }
      if (!clear) $('#wfb', el).textContent = '';
      paint.was = clear;
    };
    const turn = d => { k += d; Audio.sfx('tick'); paint(); };
    $('#dl', el).onclick = () => turn(-1); $('#dr', el).onclick = () => turn(1);
    // drag the inner ring like a real dial
    let drag = null;
    const ang = e => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI; };
    dial.addEventListener('pointerdown', e => { drag = { a: ang(e), k }; dial.setPointerCapture(e.pointerId); dial.classList.add('dragging'); });
    dial.addEventListener('pointermove', e => { if (!drag) return; let d = ang(e) - drag.a; d = ((d + 540) % 360) - 180;
      const nk = drag.k - Math.round(d / step); if (nk !== k) { k = nk; Audio.sfx('tick'); paint(); } });
    const stop = () => { drag = null; dial.classList.remove('dragging'); };
    dial.addEventListener('pointerup', stop); dial.addEventListener('pointercancel', stop);
    paint();
  },
  enter(el) { markClaimed(el, 0); },
};

/* ---------------- II. The Gallery of the Gaze: read the names, order the fallen ---------------- */
const FIG = {
  base: '<circle class="fig" cx="30" cy="16" r="8"/><path class="fig" d="M17 30Q30 23 43 30L47 88H13Z"/>',
  VAEL: '<path class="figline" d="M42 34L54 16"/><path class="figline" d="M51 12L57 20"/>',
  ESK: '<path class="figline" d="M24 46L30 38L36 46"/><path class="figline" d="M30 38V50"/>',
  NYRA: '<path class="figline" d="M42 36L58 30"/><circle cx="59" cy="29" r="2.6" fill="#8f8790"/>',
  ORRIN: '<path class="figline" d="M18 36L3 25"/><ellipse cx="30" cy="20" rx="2.4" ry="3" fill="#0a080b"/>',
  MOUR: '<path class="figline" d="M48 6V88"/><path d="M45 12L48 2L51 12Z" fill="#8f8790"/>',
};
const STATUES = [['NYRA', 'THIEF'], ['MOUR', 'GUARD'], ['VAEL', 'MASON'], ['ORRIN', 'SCHOLAR'], ['ESK', 'PRIESTESS']];
const QUEEN = `<svg viewBox="0 0 200 170" aria-hidden="true"><defs><linearGradient id="qs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d5660"/><stop offset="1" stop-color="#1a161b"/></linearGradient></defs>
  <g fill="none" stroke="#3b353d" stroke-width="5" stroke-linecap="round">${[[-1, 0], [1, 0], [-1, 1], [1, 1], [-1, 2], [1, 2], [0, 3]].map(([s, k]) =>
    `<path d="M${100 + s * (14 + k * 6)} ${52 - k * 4}Q${100 + s * (40 + k * 14)} ${30 - k * 12} ${100 + s * (30 + k * 20)} ${8 + k * 2}Q${100 + s * (24 + k * 22)} ${-2 + k * 4} ${100 + s * (36 + k * 22)} ${2 + k * 6}"/><ellipse cx="${100 + s * (37 + k * 22)}" cy="${3 + k * 6}" rx="5" ry="3.4" fill="#3b353d" stroke="none"/><circle cx="${100 + s * (39 + k * 22)}" cy="${2 + k * 6}" r="1" fill="#ff3b12" stroke="none"/>`).join('')}</g>
  <path d="M100 30C76 30 68 52 70 72C72 98 86 112 100 112C114 112 128 98 130 72C132 52 124 30 100 30Z" fill="url(#qs)" stroke="#0a080b" stroke-width="2"/>
  <path d="M60 170Q64 124 100 118Q136 124 140 170Z" fill="url(#qs)" stroke="#0a080b" stroke-width="2"/>
  <path class="qeye" d="M78 68Q87 60 96 68Q87 74 78 68Z"/><path class="qeye" d="M104 68Q113 60 122 68Q113 74 104 68Z"/>
  <path d="M87 63V73M113 63V73" stroke="#0a080b" stroke-width="1.6"/><path d="M74 62L96 66M126 62L104 66" stroke="#0a080b" stroke-width="3" stroke-linecap="round"/>
  <path d="M88 94Q100 90 112 94Q100 104 88 94Z" fill="#0a080b"/><path d="M93 94L95 101L97 94M103 94L105 101L107 94" fill="#d8cfba"/>
  <path d="M92 40L100 50L108 40" fill="none" stroke="#0a080b" stroke-width="1.5"/></svg>`;

VIEWS.gallery = {
  build(el) {
    el.innerHTML = roomHead(CH[1], 1) + `
      <div class="queen" id="queen">${QUEEN}</div>
      <p class="etched">Carved above the Queen: “She remembers the order in which she fed.”</p>
      <div class="plinths" id="plinths">${['First', 'Second', 'Third', 'Fourth', 'Last'].map(o => `<div class="plinth"><span>${o}</span><div class="pg"></div></div>`).join('')}</div>
      <div class="ctrls"><button type="button" id="g-undo">Undo</button><button type="button" id="g-clear">Clear</button></div>
      <p class="etched">Touch the fallen in the order the Gaze took them. Their names and callings are carved in the Tongue.</p>
      <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="stoneFig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#77707a"/><stop offset="1" stop-color="#29242b"/></linearGradient></defs></svg>
      <div class="statues" id="statues">${STATUES.map(([n, r], i) => `<button type="button" class="statue" data-i="${i}" aria-label="statue ${i + 1}">
        <svg class="fig-svg" viewBox="0 0 60 92" aria-hidden="true">${n === 'ESK' ? FIG.base.replace('cy="16"', 'cy="30"').replace('M17 30Q30 23 43 30L47 88H13Z', 'M15 46Q30 38 45 46L50 88H10Z') : FIG.base}${FIG[n]}</svg>
        ${Glyph.svg(n)}<div class="role">${Glyph.svg(r)}</div></button>`).join('')}</div>
      <p class="fb" id="gfb"></p>
      <div class="panel"><h3>The Testimony of the Floor</h3><ol class="clues">
        <li>The mason was the first to look upon her. His work was never finished.</li>
        <li>The guard was taken last, still facing the door he swore to hold.</li>
        <li>The thief was neither the first to fall nor the last.</li>
        <li>The scholar turned to stone the very moment after the thief. He had looked up to shout a warning.</li>
        <li>The priestess did not outlive the scholar. She was deep in prayer before his warning ever came.</li></ol></div>`;
    let order = [];
    const queen = $('#queen', el), plinths = $$('.plinth', el), cards = $$('.statue', el);
    const paint = (reveal) => {
      plinths.forEach((p, k) => { const s = STATUES[order[k]]; $('.pg', p).innerHTML = s ? Glyph.svg(s[0]) + (reveal ? `<b>${s[0][0]}</b>` : '') : ''; });
      cards.forEach((c, i) => c.classList.toggle('placed', order.includes(i)));
    };
    $('#statues', el).addEventListener('click', e => {
      const c = e.target.closest('.statue'); if (!c || order.length >= 5 || S.keys[1]) return;
      const i = +c.dataset.i; if (order.includes(i)) return;
      order.push(i); Audio.sfx('stone'); paint();
      if (order.length < 5) return;
      if (hash(order.map(k => STATUES[k][0][0]).join('')) === 'cf24avootd') {
        queen.classList.add('fed'); paint(true); Audio.sfx('good'); $('#gfb', el).className = 'fb good'; $('#gfb', el).textContent = 'Their first letters burn: the Gaze remembers.';
        setTimeout(() => award(1), 1600);
      } else {
        queen.classList.add('angry'); shake($('#plinths', el)); Audio.sfx('deny');
        $('#gfb', el).className = 'fb'; $('#gfb', el).textContent = 'The Gaze does not remember it so. The figures grind back to where they stood.';
        setTimeout(() => { queen.classList.remove('angry'); order = []; paint(); }, 1500);
      }
    });
    $('#g-undo', el).onclick = () => { if (!S.keys[1]) { order.pop(); paint(); } };
    $('#g-clear', el).onclick = () => { if (!S.keys[1]) { order = []; paint(); } };
    this.solve = () => { order = [2, 4, 0, 3, 1]; queen.classList.add('fed'); paint(true); };
  },
  enter(el) { markClaimed(el, 1); if (S.keys[1]) this.solve(); },
};

/* ---------------- III. The Counting Coil: trace the hunger ---------------- */
const COIL = 'DEVNOULUORURROTHSHAZEARG';
const coilXY = i => { const a = (-90 + i * 15) * Math.PI / 180; return [Math.cos(a) * 150, Math.sin(a) * 150]; };
VIEWS.coil = {
  build(el) {
    const head = `<g transform="translate(0 -196) scale(.72)">
      <path d="M34 -20Q0 -40 -40 -14Q-56 -6 -58 0Q-56 6 -40 14Q0 40 34 20Z" fill="#120c10" stroke="#000" stroke-width="2"/>
      <path d="M-44 -6L-60 -2M-44 6L-60 2" stroke="#e9dfc8" stroke-width="3" stroke-linecap="round"/>
      <path d="M30 -18Q50 -36 72 -40M30 18Q50 36 72 40M34 -10Q60 -18 80 -14M34 10Q60 18 80 14" fill="none" stroke="#5c5048" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="-8" cy="-14" rx="9" ry="4.5" fill="#ff3b12"/><ellipse cx="-8" cy="-14" rx="1.4" ry="4" fill="#000"/>
      <ellipse cx="-8" cy="14" rx="9" ry="4.5" fill="#ff3b12"/><ellipse cx="-8" cy="14" rx="1.4" ry="4" fill="#000"/></g>`;
    const scales = [...COIL].map((ch, i) => { const [x, y] = coilXY(i), [bx, by] = coilXY(i).map(v => v * 1.27);
      return `<g class="scale" data-i="${i}" tabindex="0" role="button" aria-label="scale ${i + 1}">
        <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${i * 15})"><path class="sc" d="M-15 -16Q0 -26 15 -16L13 14Q0 24 -13 14Z"/>
          <path class="sg" transform="scale(1.15) translate(-6 -10)" d="${Glyph.path(ch)}"/></g>
        <text class="badge" x="${bx.toFixed(1)}" y="${(by + 4).toFixed(1)}" text-anchor="middle"></text></g>`; }).join('');
    el.innerHTML = roomHead(CH[2], 2) + `
      <p class="etched" style="font-size:1.2rem"><b>“It eats once. It eats once more. After that, each hunger is the sum of the two before it.<br>
        Begin beneath the eye, and follow the body toward the tail. What it does is eight scales long.”</b></p>
      <div class="coilwrap" id="coilwrap"><svg viewBox="-215 -232 430 447">
        <circle r="150" fill="none" stroke="#1a1316" stroke-width="48"/><circle r="126" fill="none" stroke="#ffffff10"/><circle r="174" fill="none" stroke="#ffffff10"/>
        <polyline id="cpath"/>${scales}${head}
        <text y="6" text-anchor="middle" font-family="Cinzel" font-size="13" fill="#6f6458" letter-spacing="4">OUROTH KRENN</text></svg></div>
      <div class="picks" id="picks">${'<span></span>'.repeat(8)}</div>
      <div class="ctrls"><button type="button" id="c-undo">Undo</button><button type="button" id="c-clear">Clear</button></div>
      <p class="fb" id="cfb"></p>`;
    let picks = [];
    const wrap = $('#coilwrap', el), sc = $$('.scale', el);
    const paint = () => {
      sc.forEach((g, i) => { const k = picks.indexOf(i); g.classList.toggle('sel', k >= 0); $('.badge', g).textContent = k >= 0 ? k + 1 : ''; });
      $('#cpath', el).setAttribute('points', picks.map(i => coilXY(i).map(v => (v * .7).toFixed(1)).join(',')).join(' '));
      $$('#picks span', el).forEach((s, k) => s.innerHTML = picks[k] != null ? Glyph.svg(COIL[picks[k]]) : '');
    };
    const tap = i => {
      if (S.keys[2] || picks.includes(i) || picks.length >= 8) return;
      picks.push(i); Audio.sfx('tick'); paint();
      if (picks.length < 8) return;
      if (hash(picks.map(k => COIL[k]).join('')) === '1visnlviwlw') { wrap.classList.add('solved'); Audio.sfx('good'); setTimeout(() => award(2), 1000); }
      else { Audio.sfx('deny'); shake(wrap); $('#cfb', el).textContent = 'The Coil hisses. That is not how it counts.'; setTimeout(() => { picks = []; paint(); $('#cfb', el).textContent = ''; }, 1400); }
    };
    wrap.addEventListener('click', e => { const g = e.target.closest('.scale'); if (g) tap(+g.dataset.i); });
    wrap.addEventListener('keydown', e => { const g = e.target.closest('.scale'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tap(+g.dataset.i); } });
    $('#c-undo', el).onclick = () => { if (!S.keys[2]) { picks.pop(); paint(); } };
    $('#c-clear', el).onclick = () => { if (!S.keys[2]) { picks = []; paint(); } };
    this.solve = () => { picks = [0, 1, 2, 4, 7, 12, 20, 9]; wrap.classList.add('solved'); paint(); };
  },
  enter(el) { markClaimed(el, 2); if (S.keys[2]) this.solve(); },
};

/* ---------------- IV. The Chapel of Liturgy: rebuild the prayers ---------------- */
const LIT = [['The void devours all gods.', '1yhbp4fp9io'], ['Blood opens the eye.', '1dcfcnamme5'], ['The serpent counts every key.', 'xtu6s513tk']];
const TILES = ['SHA', 'VORZ', 'ISHKRA', 'GHAZUK', 'NUL', 'MUL', 'KRENN', 'AKH', 'KRUL', 'ZARGUK', 'DURN', 'GHUL', 'SKETH', 'OUROTH', 'ZHAAL'];
VIEWS.liturgy = {
  build(el) {
    el.innerHTML = roomHead(CH[3], 3) + `
      <div class="panel"><div class="lines-l" id="llines">${LIT.map(([m], i) => `<div class="lline" data-i="${i}"><p>“${m}”</p>
        <div class="lslots">${'<div class="lslot"></div>'.repeat(3)}</div></div>`).join('')}</div>
        <div class="pool" id="pool">${TILES.map((t, i) => `<button type="button" class="tile" data-w="${t}" style="animation-delay:${i * 40}ms">${Glyph.svg(t)}</button>`).join('')}</div>
        <p class="fb" id="lfb"></p>
        <p class="etched">On the altar’s edge: “Read the Lexicon in the Hall of Glyphs. Remember the Law: the deed comes last.”</p></div>`;
    let line = 0, cur = [];
    const lines = $$('.lline', el), tiles = $$('.tile', el);
    const paint = () => {
      lines.forEach((l, i) => { l.classList.toggle('cur', i === line); l.classList.toggle('done', i < line); });
      if (line < 3) $$('.lslot', lines[line]).forEach((s, k) => s.innerHTML = cur[k] != null ? Glyph.svg(tiles[cur[k]].dataset.w) : '');
    };
    $('#pool', el).addEventListener('click', e => {
      const t = e.target.closest('.tile'); if (!t || line >= 3 || S.keys[3]) return;
      const i = tiles.indexOf(t); cur.push(i); t.classList.add('used'); Audio.sfx('tick'); paint();
      if (cur.length < 3) return;
      const words = cur.map(k => tiles[k].dataset.w).join(' ');
      if (hash(words) === LIT[line][1]) {
        Audio.sfx('good'); line++; cur = []; paint(); $('#lfb', el).className = 'fb good';
        $('#lfb', el).textContent = line < 3 ? 'The altar hums the line back to you.' : 'The liturgy is whole.';
        if (line === 3) setTimeout(() => award(3), 1200);
      } else {
        Audio.sfx('deny'); shake(lines[line]); $('#lfb', el).className = 'fb'; $('#lfb', el).textContent = 'The altar rejects the prayer. The tiles slide back.';
        setTimeout(() => { cur.forEach(k => tiles[k].classList.remove('used')); cur = []; paint(); }, 900);
      }
    });
    // tapping a filled slot returns its tile
    $('#llines', el).addEventListener('click', e => { const s = e.target.closest('.lslot'); if (!s || line >= 3) return;
      const k = $$('.lslot', lines[line]).indexOf(s); if (k < 0 || cur[k] == null) return;
      tiles[cur[k]].classList.remove('used'); cur.splice(k, 1); paint(); });
    this.solve = () => { line = 3; tiles.forEach(t => t.classList.add('used')); paint();
      const ans = [['NUL', 'ZARGUK', 'SHA'], ['ISHKRA', 'AKH', 'GHUL'], ['OUROTH', 'GHAZUK', 'KRENN']];
      lines.forEach((l, i) => $$('.lslot', l).forEach((s, k) => s.innerHTML = Glyph.svg(ans[i][k]))); };
    paint();
  },
  enter(el) { markClaimed(el, 3); if (S.keys[3]) this.solve(); },
};

/* ---------------- V. The Ring at the End: read the way it eats ---------------- */
VIEWS.ring = {
  build(el) {
    const msg = atob('SSBIQVZFIE5PIEJFR0lOTklORyBBTkQgTk8gRU5ELiBTUEVBSyBUSEUgTkFNRSBUSEUgT1VUU0lERVJTIEdBVkUgTUUu'), txt = ' ' + [...msg].reverse().join('') + ' ';
    el.innerHTML = roomHead(CH[4], 4) + `
      <div class="endring"><svg viewBox="-170 -170 340 340" aria-label="a ring of serpent script">
        <circle r="160" fill="#120d12" stroke="#000" stroke-width="2"/><circle r="152" fill="none" stroke="#ffffff12"/><circle r="112" fill="none" stroke="#ffffff12"/>
        <circle r="104" fill="#060407"/>
        <g class="spin"><g fill="none" stroke="#ff8a4a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 3px #ff6a1a)">${Glyph.ring(txt, 132, 17)}</g>
          <g transform="translate(0 -132)"><path d="M10 -9L-10 0L10 9Q4 0 10 -9Z" fill="#ff6a1a"/><circle cx="3" cy="-3" r="1.6" fill="#000"/></g></g>
        <circle r="40" fill="none" stroke="#ff6a1a" stroke-width="2" opacity=".4"/><circle r="40" fill="none" stroke="#ff6a1a" stroke-width="6" opacity=".15" style="filter:blur(4px)"/>
        <text y="76" text-anchor="middle" font-family="Cinzel" font-size="13" fill="#6f6458" letter-spacing="5">NUL KRUL</text></svg></div>
      <p class="etched" style="font-size:1.2rem"><b>“It begins where it ends. It is read the way it eats.”</b></p>
      <p class="etched">Hold the ring to stop it turning.</p>
      ${speakForm(4)}`;
  },
  enter(el) { markClaimed(el, 4); },
};
