// Host-authoritative auction over PeerJS (WebRTC). The host's browser owns the state
// and broadcasts it after every change; other players only send intents (join/bid/pass).
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const U = Object.fromEntries(UNITS.map(u => [u.id, u]));
const TYPE = { c: 'Named character', a: 'Army', l: 'Lord of War' };
const PREFIX = 'mgwh-';
const COIN = '<i class="coin" aria-hidden="true"></i>';
const SOLD_PAUSE = 2600;
// Players behind strict NATs (mobile data, CGNAT, school/work wifi) can't connect directly and
// need a TURN relay. PeerJS's built-in public TURN is often down, so paste your own here, e.g.
// from a free metered.ca account: { urls: 'turn:global.relay.metered.ca:80', username: '…', credential: '…' }
const TURN = [];
const PEER_OPTS = TURN.length ? { config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, ...TURN] } } : {};

let peer, isHost = false, me = null, S = null, hostConn = null, offset = 0;
const conns = new Map();

// ---------- faction helpers ----------
function factionOf(key) {
  const [f, b] = key.split(':');
  const fac = FACTIONS.find(x => x.k === f);
  const sub = b && fac.subs.find(x => x.k === b);
  return { n: sub ? `${fac.n} · ${sub.n}` : fac.n, c: (sub || fac).c };
}
const leafKeys = f => f.subs ? f.subs.map(b => `${f.k}:${b.k}`) : [f.k];
const modeOf = k => MODES.find(m => m.k === k) || MODES[0];
const poolFor = (factions, mode) => UNITS.filter(u => factions.includes(u.f) && modeOf(mode).f(u));

// Portraits live in img/ (see images.js); units without one get a faction-coloured monogram.
function art(id, cls = '') {
  const u = U[id], initials = u.n.replace(/^The /, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('');
  const img = IMAGES[id] ? `<img src="${IMAGES[id]}" alt="">` : `<span>${esc(initials)}</span>`;
  return `<div class="art ${cls}" style="--c:${factionOf(u.f).c}" role="img" aria-label="${esc(u.n)}">${img}</div>`;
}

// ---------- screens ----------
function show(id) { document.querySelectorAll('.screen').forEach(e => { e.hidden = e.id !== id; }); }
function fail(text) {
  show('home'); $('#where').textContent = '';
  $('#homeMsg').textContent = text;
  peer?.destroy(); peer = null; S = null; isHost = false;
}

// ---------- home: game mode and faction picker ----------
const picked = new Set(FACTIONS.flatMap(leafKeys));
let mode = 'classic', openSubs = null; // key of the faction whose branch picker is open

function renderSetup() {
  $('#modes').innerHTML = MODES.map(m =>
    `<button type="button" class="mode" data-m="${m.k}" aria-pressed="${m.k === mode}"><b>${esc(m.n)}</b><span>${esc(m.d)}</span></button>`).join('');

  $('#factions').innerHTML = FACTIONS.map(f => {
    const keys = leafKeys(f), on = keys.filter(k => picked.has(k)).length;
    const extra = f.subs ? ` <small>${on} of ${keys.length}</small>` : '';
    const attr = f.subs ? `aria-expanded="${openSubs === f.k}" aria-controls="subs"` : '';
    return `<button type="button" class="fac" data-f="${f.k}" aria-pressed="${on > 0}" ${attr} style="--c:${f.c}">${esc(f.n)}${extra}</button>`;
  }).join('');

  const f = FACTIONS.find(x => x.k === openSubs);
  $('#subs').hidden = !f;
  if (f) {
    $('#subs').innerHTML = `<p class="hint">${esc(f.ask)} <button type="button" class="linkish" data-all="${f.k}">All</button> <button type="button" class="linkish" data-none="${f.k}">None</button></p>`
      + f.subs.map(b => `<button type="button" class="fac" data-b="${f.k}:${b.k}" aria-pressed="${picked.has(f.k + ':' + b.k)}" style="--c:${b.c}">${esc(b.n)}</button>`).join('');
  }

  const pool = poolFor([...picked], mode).length;
  $('#poolInfo').textContent = pool
    ? `${pool} auctionables in the pool.`
    : 'Nothing matches this mode with these factions. Pick more factions or another mode.';
}

$('#modes').addEventListener('click', e => {
  const b = e.target.closest('[data-m]'); if (!b) return;
  mode = b.dataset.m;
  renderSetup();
});
$('#factions').addEventListener('click', e => {
  const b = e.target.closest('[data-f]'); if (!b) return;
  const f = FACTIONS.find(x => x.k === b.dataset.f);
  if (f.subs) openSubs = openSubs === f.k ? null : f.k;
  else picked.has(f.k) ? picked.delete(f.k) : picked.add(f.k);
  renderSetup();
});
$('#subs').addEventListener('click', e => {
  const t = e.target.closest('[data-b], [data-all], [data-none]'); if (!t) return;
  if (t.dataset.b) picked.has(t.dataset.b) ? picked.delete(t.dataset.b) : picked.add(t.dataset.b);
  else {
    const f = FACTIONS.find(x => x.k === (t.dataset.all || t.dataset.none));
    leafKeys(f).forEach(k => t.dataset.all ? picked.add(k) : picked.delete(k));
  }
  renderSetup();
});

// ---------- hosting ----------
function makeCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 5 }, () => A[Math.random() * A.length | 0]).join('');
}

function hostSession(name, settings) {
  const code = makeCode();
  peer = new Peer(PREFIX + code, PEER_OPTS);
  peer.on('open', () => {
    isHost = true; me = 'host';
    // The host runs the auction and never bids, so they are not in players.
    S = { code, phase: 'lobby', settings, hostName: name, players: [] };
    broadcast();
  });
  peer.on('connection', c => {
    conns.set(c.peer, c);
    c.on('data', m => handle(c.peer, m));
    c.on('close', () => leave(c.peer));
  });
  peer.on('error', e => {
    if (e.type === 'unavailable-id') { peer.destroy(); hostSession(name, settings); }
    else if (e.type !== 'peer-unavailable') fail(`Connection problem: ${e.message}`);
  });
}

function broadcast() {
  S.now = Date.now();
  const msg = { t: 'state', s: S };
  conns.forEach(c => c.open && c.send(msg));
  render();
}

function handle(id, m) {
  const p = S.players.find(x => x.id === id);
  if (id === me) {
    // host-only controls
    if (m.t === 'start' && S.phase === 'lobby' && S.players.length >= 2) start();
    else if (m.t === 'skip' && S.stage === 'bidding') { S.bid = { amount: 0, by: null }; hammer(); }
    else if (m.t === 'end' && S.phase === 'auction') battle();
    else if (m.t === 'again' && S.phase === 'battle') {
      S.players.forEach(x => { x.points = S.settings.points; x.won = []; });
      S.players = S.players.filter(x => !x.left);
      S.phase = 'lobby';
    } else return;
  } else if (m.t === 'join') {
    if (p) return;
    if (S.phase !== 'lobby' || S.players.length >= S.settings.players) {
      conns.get(id)?.send({ t: 'refused', why: S.phase !== 'lobby' ? 'That auction has already started.' : 'That session is full.' });
      return;
    }
    S.players.push({ id, name: String(m.name || '').trim().slice(0, 20) || 'Player', points: S.settings.points, won: [] });
  } else if (!p) {
    return;
  } else if (m.t === 'bid') {
    if (!canBid(p, m.amount)) return;
    S.bid = { amount: m.amount, by: id };
    S.deadline = Date.now() + S.settings.timer * 1000;
  } else if (m.t === 'pass') {
    if (S.phase !== 'auction' || S.stage !== 'bidding' || S.passed.includes(id)) return;
    S.passed.push(id);
  } else return;
  check();
  broadcast();
}

// Lords of War open at the host's minimum; after that any raise of 1 is enough.
const minBid = () => S.bid.amount ? S.bid.amount + 1 : U[S.lot].t === 'l' ? S.settings.lordMin : 1;
const full = p => p.won.length >= S.settings.team;

function canBid(p, a) {
  return S.phase === 'auction' && S.stage === 'bidding' && Number.isInteger(a)
    && a >= minBid() && a <= p.points && S.bid.by !== p.id && !S.passed.includes(p.id) && !p.left && !full(p);
}

function leave(id) {
  conns.delete(id);
  const p = S?.players.find(x => x.id === id);
  if (!p) return;
  if (S.phase === 'lobby') S.players = S.players.filter(x => x !== p);
  else p.left = true;
  check();
  broadcast();
}

function start() {
  const pool = poolFor(S.settings.factions, S.settings.mode).map(u => u.id);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  S.lots = pool.slice(0, S.settings.lots);
  S.i = -1;
  S.phase = 'auction';
  next();
}

function next() {
  S.i++;
  if (S.i >= S.lots.length) return battle();
  S.lot = S.lots[S.i];
  S.stage = 'bidding';
  S.bid = { amount: 0, by: null };
  S.passed = [];
  S.sold = null;
  S.deadline = Date.now() + S.settings.timer * 1000;
}

// Sell when nobody else can or will outbid, or when the clock runs out.
function check() {
  if (S.phase !== 'auction' || S.stage !== 'bidding') return;
  const rivals = S.players.filter(p => p.id !== S.bid.by && !p.left && !S.passed.includes(p.id) && !full(p) && p.points >= minBid());
  if (!rivals.length || Date.now() > S.deadline) hammer();
}

function hammer() {
  const w = S.players.find(p => p.id === S.bid.by);
  if (w) { w.points -= S.bid.amount; w.won.push(S.lot); }
  S.sold = { lot: S.lot, by: w ? w.id : null, amount: S.bid.amount };
  S.stage = 'sold';
  S.deadline = Date.now() + SOLD_PAUSE;
}

function tick() {
  if (!isHost || S?.phase !== 'auction') return;
  const before = S.stage + S.i;
  if (S.stage === 'sold' && Date.now() > S.deadline) next();
  else check();
  if (S.stage + S.i !== before || S.phase !== 'auction') broadcast();
}
setInterval(tick, 250);

// Free-for-all: each army's health is its total power, and each blow scales with the
// attacker's power, so the strongest roster usually wins but an upset is possible.
function battle() {
  const f = S.players.map(p => {
    const power = p.won.reduce((s, id) => s + U[id].p, 0);
    return { id: p.id, hp: power, max: power, won: p.won };
  });
  const log = [];
  let alive = f.filter(x => x.hp > 0);
  while (alive.length > 1 && log.length < 400) {
    for (const a of alive) {
      const targets = alive.filter(x => x !== a && x.hp > 0);
      if (a.hp <= 0 || !targets.length) continue;
      const t = targets[Math.random() * targets.length | 0];
      const unit = a.won[Math.random() * a.won.length | 0];
      const dmg = Math.max(1, Math.round(a.max * (0.1 + Math.random() * 0.02)));
      t.hp = Math.max(0, t.hp - dmg);
      log.push([a.id, t.id, dmg, unit, t.hp]);
    }
    alive = alive.filter(x => x.hp > 0);
  }
  S.phase = 'battle';
  S.battle = { id: Math.random(), log, winner: alive.length === 1 ? alive[0].id : null };
}

// ---------- joining ----------
function joinSession(name, code) {
  const p = peer = new Peer(PEER_OPTS);
  peer.on('open', () => {
    me = peer.id;
    hostConn = peer.connect(PREFIX + code, { reliable: true });
    // A blocked WebRTC link never errors, it just hangs, so give up visibly.
    setTimeout(() => { if (peer === p && !hostConn.open) fail('Could not reach the host. One of you is likely on a strict network (mobile data, school/work wifi), so try another network.'); }, 15000);
    hostConn.on('open', () => hostConn.send({ t: 'join', name }));
    hostConn.on('data', m => {
      if (m.t === 'refused') return fail(m.why);
      if (m.t !== 'state') return;
      S = m.s; offset = Date.now() - S.now;
      render();
    });
    hostConn.on('close', () => fail('The host closed the session.'));
  });
  peer.on('error', e => fail(e.type === 'peer-unavailable' ? `No session found with code ${code}.` : `Connection problem: ${e.message}`));
}

function act(m) { isHost ? handle(me, m) : hostConn?.open && hostConn.send(m); }

// ---------- rendering ----------
const nameOf = id => S.players.find(p => p.id === id)?.name ?? 'Someone';
const mine = () => S.players.find(p => p.id === me);
let shownLot = null, shownSold = null, shownBattle = null;

function render() {
  if (!S) return;
  $('#where').textContent = S.phase === 'auction'
    ? `Session ${S.code}, lot ${S.i + 1} of ${S.lots.length}`
    : `Session ${S.code}`;
  if (S.phase === 'lobby') renderLobby();
  else if (S.phase === 'auction') renderAuction();
  else renderBattle();
  if ($('#armiesDlg').open) $('#armiesList').innerHTML = armies();
}

// The host sees every army inline; a bidder's dialog shows only their own.
// Power is never shown to anyone: lore knowledge is the only guide to what wins.
function armies() {
  return S.players.filter(p => isHost || p.id === me).map(p => {
    const units = p.won.map(id => `<li>${art(id, 'thumb')}<span>${esc(U[id].n)}</span></li>`).join('');
    return `<div class="who${S.bid?.by === p.id ? ' lead' : ''}${p.left ? ' out' : ''}">
      <p class="whoname">${esc(p.name)}${p.id === me ? ' <small>you</small>' : ''}${p.left ? ' <small>left</small>' : ''}</p>
      <p class="hint">${COIN}${p.points} coins left, ${p.won.length} of ${S.settings.team} units</p>
      <ul class="units">${units || '<li class="hint">Nothing bought yet</li>'}</ul>
    </div>`;
  }).join('');
}

function renderLobby() {
  show('lobby');
  shownBattle = null;
  $('#lobbyCode').textContent = S.code;
  $('#seatCount').textContent = `${S.players.length} of ${S.settings.players} players`;
  $('#hostedBy').textContent = `Auctioneer: ${S.hostName}${isHost ? ' (you)' : ''}`;
  $('#seats').innerHTML = S.players.map(p => `<li>${esc(p.name)}${p.id === me ? ' <small>you</small>' : ''}</li>`).join('')
    + Array.from({ length: S.settings.players - S.players.length }, () => '<li class="empty">Empty seat</li>').join('');
  const fac = [...new Set(S.settings.factions.map(k => k.split(':')[0]))].map(k => FACTIONS.find(f => f.k === k).n);
  $('#lobbyRules').textContent = `${modeOf(S.settings.mode).n}. ${S.settings.points} coins each, armies of up to ${S.settings.team}, Lords of War open at ${S.settings.lordMin}. ${Math.min(S.settings.lots, poolFor(S.settings.factions, S.settings.mode).length)} lots, ${S.settings.timer} seconds per bid. Factions: ${fac.join(', ')}.`;
  $('#start').hidden = !isHost;
  $('#start').disabled = S.players.length < 2;
  $('#lobbyWait').hidden = isHost;
}

function renderAuction() {
  show('auction');
  const u = U[S.lot], fac = factionOf(u.f), my = mine();

  if (shownLot !== S.lot) {
    shownLot = S.lot;
    $('#lot').innerHTML = `
      <div class="relic" style="--c:${fac.c}">${art(u.id, 'big')}</div>
      <h2 class="lotname">${esc(u.n)}</h2>
      <p class="lotmeta">${TYPE[u.t]} of the ${esc(fac.n)}</p>`;
    $('#amount').value = '';
  }

  // the hammer falls
  const soldKey = S.stage === 'sold' ? S.lot + S.i : null;
  if (soldKey !== shownSold) {
    shownSold = soldKey;
    const seal = $('#seal');
    seal.hidden = !soldKey;
    if (soldKey) {
      seal.innerHTML = S.sold.by
        ? `<b>Sold</b><span>${esc(nameOf(S.sold.by))}</span><span>${S.sold.amount} coins</span>`
        : `<b>Unsold</b>`;
      seal.classList.toggle('unsold', !S.sold.by);
    }
  }

  $('#bidNow').textContent = S.bid.amount;
  $('#bidBy').textContent = S.bid.by ? `by ${nameOf(S.bid.by)}` : 'No bids yet';
  $('#hostCtl').hidden = !isHost;
  $('#myCtl').hidden = isHost;
  $('#armiesBtn').hidden = isHost;
  $('#skip').disabled = S.stage !== 'bidding';

  if (isHost) {
    $('#roster').innerHTML = armies();
    return;
  }

  $('#roster').innerHTML = S.players.map(p => {
    const state = p.left ? 'left' : S.bid.by === p.id ? 'highest bid' : S.passed.includes(p.id) ? 'passed' : full(p) ? 'army full' : 'bidding';
    return `<div class="who${S.bid.by === p.id ? ' lead' : ''}${p.left || S.passed.includes(p.id) ? ' out' : ''}">
      <p class="whoname">${esc(p.name)}${p.id === me ? ' <small>you</small>' : ''}</p>
      <p class="hint">${state}</p>
    </div>`;
  }).join('');
  $('#myPoints').textContent = my.points;

  const amt = $('#amount');
  const min = minBid();
  if (!(+amt.value >= min)) amt.value = Math.min(min, my.points);
  amt.min = min;
  amt.max = my.points;

  let why = '';
  if (S.stage !== 'bidding') why = '';
  else if (my.left) why = 'You left this session.';
  else if (full(my)) why = `Your army is full (${S.settings.team} of ${S.settings.team}).`;
  else if (S.passed.includes(me)) why = 'You passed on this lot.';
  else if (S.bid.by === me) why = 'You hold the highest bid.';
  else if (my.points < min) why = `Not enough coins. The lowest bid is ${min}.`;
  const off = S.stage !== 'bidding' || !!why;
  ['#bid', '#pass', '#amount'].forEach(s => { $(s).disabled = off; });
  document.querySelectorAll('[data-add]').forEach(b => { b.disabled = off; });
  $('#pass').disabled = S.stage !== 'bidding' || S.passed.includes(me) || S.bid.by === me || !!my.left;
  $('#bidMsg').textContent = why || (S.stage === 'bidding' && !S.bid.amount && u.t === 'l' ? `Lords of War open at ${min} coins.` : '');
}

// countdown runs locally against the host clock
setInterval(() => {
  if (S?.phase !== 'auction') return;
  const left = S.deadline - (Date.now() - offset);
  const total = S.stage === 'bidding' ? S.settings.timer * 1000 : SOLD_PAUSE;
  const bar = $('#timerBar');
  bar.style.width = `${Math.max(0, Math.min(100, left / total * 100))}%`;
  bar.classList.toggle('late', S.stage === 'bidding' && left < 5000);
}, 100);

// ---------- battle animation ----------
// What each kind of unit does in the narration; no numbers, so power stays hidden.
const DEEDS = {
  c: ['duels the champions of', 'cuts a path through', 'slays the captains of'],
  a: ['opens fire on', 'charges into', 'overruns a flank of'],
  l: ['crushes', 'tramples the lines of', 'rains ruin on'],
};
let battleTimer = null;
const calm = matchMedia('(prefers-reduced-motion: reduce)');

function renderBattle() {
  show('battle');
  shownLot = null;
  $('#again').hidden = !isHost;
  if (shownBattle === S.battle.id) return;
  shownBattle = S.battle.id;
  playBattle();
}

function playBattle() {
  clearTimeout(battleTimer);
  const { log, winner } = S.battle;
  const hp = {};
  $('#battleHead').textContent = 'The armies meet';
  $('#arena').innerHTML = S.players.map(p => {
    const max = p.won.reduce((s, id) => s + U[id].p, 0);
    hp[p.id] = max;
    return `<div class="fighter${max ? '' : ' fallen'}" data-id="${esc(p.id)}" data-max="${max}">
      <p class="whoname">${esc(p.name)}</p>
      <div class="hp"><i style="width:${max ? 100 : 0}%"></i></div>
      <div class="won">${p.won.map(id => art(id, 'thumb')).join('') || '<p class="hint">No army</p>'}</div>
    </div>`;
  }).join('');
  const col = id => $(`.fighter[data-id="${CSS.escape(id)}"]`);

  let i = 0;
  const step = () => {
    if (i >= log.length) {
      $('#battleHead').textContent = winner ? `${nameOf(winner)} holds the field` : 'No one is left standing';
      $('#battleLine').textContent = winner ? 'Victory.' : 'Nobody bought an army, or every army fell together.';
      if (winner) col(winner)?.classList.add('victor');
      return;
    }
    const [a, t, , unit, after] = log[i++];
    const A = col(a), T = col(t);
    const verbs = DEEDS[U[unit].t];
    $('#battleLine').textContent = `${U[unit].n} (${nameOf(a)}) ${verbs[Math.random() * verbs.length | 0]} ${nameOf(t)}'s army`;
    [A, T].forEach(el => el?.classList.remove('strike', 'hit'));
    void A?.offsetWidth;
    A?.classList.add('strike'); T?.classList.add('hit');
    if (T) {
      T.querySelector('.hp i').style.width = `${after / T.dataset.max * 100}%`;
      const pop = document.createElement('span');
      pop.className = 'pop';
      T.append(pop); setTimeout(() => pop.remove(), 900);
      if (after <= 0) T.classList.add('fallen');
    }
    battleTimer = setTimeout(step, calm.matches ? 500 : 750);
  };
  battleTimer = setTimeout(step, 900);
}

// ---------- wiring ----------
$('#hostForm').addEventListener('submit', e => {
  e.preventDefault();
  const factions = [...picked];
  if (!poolFor(factions, mode).length) return renderSetup();
  $('#homeMsg').textContent = 'Opening session…';
  hostSession($('#hName').value.trim().slice(0, 20), {
    players: Math.max(2, Math.min(8, +$('#players').value)),
    points: +$('#points').value,
    team: Math.max(1, +$('#team').value),
    lordMin: Math.max(1, Math.min(10, +$('#lordMin').value)),
    lots: +$('#lots').value,
    timer: +$('#timer').value,
    factions,
    mode,
  });
});
$('#joinForm').addEventListener('submit', e => {
  e.preventDefault();
  $('#homeMsg').textContent = 'Connecting…';
  joinSession($('#jName').value.trim().slice(0, 20), $('#code').value.trim().toUpperCase());
});
$('#copyLink').addEventListener('click', async () => {
  const link = `${location.origin}${location.pathname}?join=${S.code}`;
  try { await navigator.clipboard.writeText(link); $('#copyLink').textContent = 'Link copied'; }
  catch { prompt('Copy this invite link', link); }
});
$('#start').addEventListener('click', () => act({ t: 'start' }));
$('#skip').addEventListener('click', () => act({ t: 'skip' }));
$('#end').addEventListener('click', () => confirm('End the auction now and go to battle?') && act({ t: 'end' }));
$('#again').addEventListener('click', () => act({ t: 'again' }));
$('#replay').addEventListener('click', playBattle);
$('#armiesBtn').addEventListener('click', () => { $('#armiesList').innerHTML = armies(); $('#armiesDlg').showModal(); });
$('#pass').addEventListener('click', () => act({ t: 'pass' }));
$('#bid').addEventListener('click', () => act({ t: 'bid', amount: Math.floor(+$('#amount').value) }));
$('#amount').addEventListener('keydown', e => { if (e.key === 'Enter') $('#bid').click(); });
document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
  $('#amount').value = Math.min(Math.max(minBid(), S.bid.amount + +b.dataset.add), mine().points);
}));

const invite = new URLSearchParams(location.search).get('join');
if (invite) { $('#code').value = invite.toUpperCase(); $('#jName').focus(); }
renderSetup();
