// The rooms of Thessaros: what each looks like, what can be examined, where the passages lead,
// plus the field-journal lore, the satchel items and the hint system.
const { room: box, sideDoor, arch, pillar, stairsDown, keeper, serpentStatue, growth, carve, lamp, rubble, fog, shaft, vignette, throat, ledge, hs, exit } = Art;
// Lay flat artwork drawn in a w x h box onto a wall, given its top-left A, top-right B and bottom-left D corners.
const onWall = (A, B, D, w, h, inner) => `<g transform="matrix(${(B[0] - A[0]) / w} ${(B[1] - A[1]) / w} ${(D[0] - A[0]) / h} ${(D[1] - A[1]) / h} ${A[0]} ${A[1]})">${inner}</g>`;
const take = (item, msg) => { if (holding(item) || has('took:' + item)) return; S.inv.push(item); setFlag('took:' + item); renderKeyring(); note('Satchel', msg || ITEMS[item].name); Sound.sfx('tick'); Scene.render(); };
const P = (...a) => a.map(t => `<p>${t}</p>`).join('');
const eyesAwake = () => keyCount() + (has('doorOpen') ? 3 : 0);

/* ---------------- items you can carry ---------------- */
const fragIcon = '<svg viewBox="0 0 20 20" class="itm"><path d="M3 4L15 2L17 12L9 18L2 13Z" fill="#6c7078" stroke="#000"/></svg>';
const ITEMS = {
  fTL: { name: 'a stele fragment with a carved crown', icon: fragIcon }, fTR: { name: 'a stele fragment, crown on the right', icon: fragIcon },
  fML: { name: 'a stele fragment, border on the left', icon: fragIcon }, fMR: { name: 'a stele fragment, border on the right', icon: fragIcon },
  fBL: { name: 'a stele fragment with a footing on the left', icon: fragIcon }, fBR: { name: 'a stele fragment with a footing on the right', icon: fragIcon },
  fX: { name: 'a fragment of warmer stone, border on the left', icon: fragIcon },
  handle: { name: 'a bronze crank handle', icon: '<svg viewBox="0 0 20 20" class="itm"><path d="M3 15L13 5M13 5h4v4" stroke="#8a7a55" stroke-width="3" fill="none"/></svg>' },
};

/* ---------------- the field journal ---------------- */
const LORE = {
  marker:   { t: 'The surveyor’s marker', d: 'A survey post left by the charting office: “THESSAROS. So the old charts name it. Nine-sign inscription over the arch; no reading of the script is known.”' },
  keystone: { t: 'An eye over the door', d: 'The keystone of the entrance arch is carved as a closed eye, taller than a person. Its lashes are small serpents. Nobody carves a closed eye over a door to welcome guests.' },
  orvane1:  { t: 'Orvane’s pack', d: 'An earlier explorer’s pack, rotted at the seams. One page survives: “Third day. The arch has nine signs. The fourth, fifth and ninth are the same sign. If the word is the city’s name, the script can be broken. I have not told the others I hear breathing on the stair.”' },
  scribes:  { t: 'The scribes’ desk', d: 'Reed pens, a dried inkstone, a ring of iron keys. Someone left mid-lesson: a child’s slate still lies face up, as if they meant to return.' },
  lamps:    { t: 'Lamps that should be dead', d: 'The lamps in the Hall of Letters are lit. There is no oil in them. The flames lean toward the grate in the floor, as if something below were drawing breath.' },
  grate:    { t: 'The grate', d: 'Through the iron grate: a shaft with no bottom. When you hold your breath, you can hear something very large not moving.' },
  mural:    { t: 'The painted wall', d: 'A serpent coiled around a closed eye, painted over and over in layers, each newer coat a little darker. The eye has been repainted more often than anything else in the room.' },
  keepers:  { t: 'The keepers', d: 'Every statue in the rings has its hands over its eyes. They are not praying. They are refusing to look.' },
  turned:   { t: 'The statue has turned', d: 'The hooded keeper in the Upper Ring no longer faces the ramp. It faces the shaft now, hands still over its eyes. You did not hear it move.' },
  nicheN:   { t: 'The seventh niche', d: 'In the Hall of Names, six niches hold six things and their names. The seventh holds nothing: only a hole that goes down, and a prism with one name on all four faces: <i>nhaur</i>.' },
  pigeon:   { t: 'Empty pigeonholes', d: 'The Hall of Words held thousands of tablets. Nearly every one has been taken down and smashed, carefully, as if someone wanted the words destroyed rather than lost.' },
  forged:   { t: 'Two chronicles', d: 'Two hands carved the history of Thessaros. The keepers wrote that they shut the door. An older, warmer stone says the dead were given, gladly, to “she who is the end”. The two accounts do not agree about what lies below.' },
  orvane2:  { t: 'Chalk on the shelves', d: 'Orvane’s chalk, on the Stacks’ shelves: “The tablets are all the same story told by people who disagree. One word keeps being scratched out: whatever the deep is called when it is called by name.”' },
  feeders:  { t: 'The Feeders', d: 'Before there were keepers there were Feeders: the people of the plain who brought their dead to the chasm and gave them to it. The shrine is older than the temple around it. The keepers did not destroy it. They corrected it.' },
  masks:    { t: 'A heap of masks', d: 'Hundreds of clay masks with the eyes left blank. Each was made for one face, then never used.' },
  tally:    { t: 'Tally marks', d: 'The cistern wall is covered in tallies, grouped in eights. The keepers were counting something, every day, for longer than the city stood.' },
  mosaic:   { t: 'The drowned mosaic', d: 'With the water gone, the cistern floor shows a closed eye ringed by five great scales. Each scale has a keyhole in it.' },
  gears:    { t: 'The engine still turns', d: 'The Engine of Sleep has no driver, no water wheel, no weights you can find. Its gears creep forward by themselves, a tooth every few minutes.' },
  rite:     { t: 'Beneath the bier', d: 'When the bier came back up it was empty except for a key of black growth, warm, still damp. Under where it stood, the keepers had written how their story ended: Thessaros did not fall. It went down. Masked, its eyes sealed, its names broken, so that she would not see them.' },
  orvane3:  { t: 'Orvane’s last page', d: 'On the Keepers’ Stair, Orvane’s lantern, cold. The last page: “I could read it all now. I wish I could not. Every inscription is the same warning in a different room. I am going back up. I keep counting the steps and getting a different number. Something else is counting too.”' },
  plan:     { t: 'The plan of Thessaros', d: 'On the ceiling of Ishvel’s cell, the temple drawn from above: the rings, the chambers, the Threshold at one corner. Drawn this way it is unmistakable. Thessaros is a closed eye, and the five chambers are set along its lid like stitches.' },
  counted:  { t: 'Letters that were not there', d: 'When her light reached the reader’s seat, new letters surfaced on the testament wall, as if the stone itself had been waiting to say them: she counts the readers. There are a great many tally marks beneath them.' },
  door:     { t: 'The Door at the End', d: 'It is not round, as you imagined. It is an almond of stone wider than a house, split by a single horizontal seam. Five keyholes run along its upper curve.' },
};

/* ---------------- the rooms ---------------- */
ROOMS.threshold = {
  name: 'The Threshold', depth: 'The surface', mood: 'surface', focus: 800,
  draw() {
    let s = `<defs><linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070a"/><stop offset="1" stop-color="#161b22"/></linearGradient>
      <linearGradient id="gCliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2c31"/><stop offset=".45" stop-color="#18191d"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient>
      <radialGradient id="gArchLight" cx=".5" cy=".85" r=".6"><stop offset="0" stop-color="#d8cbaa" stop-opacity=".16"/><stop offset="1" stop-color="#d8cbaa" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="1000" fill="url(#gSky)"/><circle cx="260" cy="150" r="150" fill="#c7cfd6" opacity=".035"/><circle cx="260" cy="150" r="60" fill="#c7cfd6" opacity=".05"/>
      <path d="M0 540L180 480L320 510L470 440L640 480L760 430L900 470L1100 410L1280 480L1450 440L1600 490V1000H0Z" fill="#0c0f13"/>
      <path d="M140 1000L220 620Q290 250 520 170Q800 80 1080 170Q1310 250 1380 620L1460 1000Z" fill="url(#gCliff)" filter="url(#fRough)"/><path d="M220 1000L290 600Q380 300 560 230Q800 160 1040 230Q1220 300 1310 600L1380 1000Z" fill="url(#gArchLight)"/>
      <path d="M140 1000L220 620Q290 250 520 170Q800 80 1080 170Q1310 250 1380 620L1460 1000Z" fill="url(#pGrain)"/>
      <path d="M260 420Q520 330 800 340Q1080 330 1330 420M235 560Q520 500 800 505Q1080 500 1360 560M215 720Q520 690 800 690Q1080 690 1385 720" stroke="#000" stroke-opacity=".45" stroke-width="3" fill="none"/>
      <path d="M330 300l60 90l-20 70l50 110M1240 330l-40 80l30 60l-30 120M600 200l30 40l-10 40" stroke="#000" stroke-opacity=".55" stroke-width="2.5" fill="none"/>`;
    s += hs('arch', 'The great inscription over the arch', `<rect x="600" y="270" width="400" height="120" fill="#000" opacity=".01"/>${carve('THESSAROS', 800, 282, 56, { center: true, op: .85 })}${carve('AKH NHAUR VEN . KA VAL .', 800, 356, 17, { center: true, op: .6 })}`);
    s += arch(800, 900, 300, 450);
    s += exit('down', 'Go down the stair, under the arch', `<path d="M650 900V600A150 150 0 0 1 950 600V900Z" fill="#000" opacity=".01"/>${stairsDown(800, 900, 290)}`);
    s += hs('keystone', 'The keystone above the arch', `<path d="M748 420Q800 384 852 420Q800 452 748 420Z" fill="#2a2c31" stroke="#000" stroke-width="4"/><path d="M752 420Q800 438 848 420" stroke="#6f7279" stroke-width="3" fill="none"/>
      ${[-36, -18, 0, 18, 36].map(d => `<path d="M${800 + d} ${428 + Math.abs(d) * -.1}q${d * .2} 10 ${d * .1 + 4} 16" stroke="#55585f" stroke-width="2.5" fill="none"/>`).join('')}`);
    s += hs('marker', 'A surveyor’s marker post', `<rect x="318" y="700" width="14" height="210" fill="#2b241b"/><rect x="270" y="690" width="110" height="64" fill="#3b3226" stroke="#120e0a" stroke-width="3"/>
      <path d="M284 708h80M284 722h60M284 736h72" stroke="#8a7d66" stroke-width="3"/>`);
    s += hs('pack', 'An abandoned pack', `<path d="M1150 930Q1140 860 1190 850Q1250 845 1255 900L1260 935Z" fill="#2d2a22" stroke="#0e0c08" stroke-width="3"/>
      <path d="M1175 858Q1200 820 1230 856" stroke="#1d1a14" stroke-width="6" fill="none"/><rect x="1262" y="900" width="26" height="36" rx="4" fill="#3a3832" stroke="#111" stroke-width="2"/>`);
    s += growth(1030, 905, .5, 4, 0, -2.2);
    return s + fog(640, 400, 1.2) + vignette();
  },
  on: {
    arch: () => Panel.open({ tag: 'The Threshold', title: 'Over the arch', insc: ['arch', 'arch2'],
      text: has('arch') ? P('The great word is the city’s name. You read it yourself.') : P('Nine serpent signs, each taller than your hand, and a smaller line beneath them.', 'You cannot read a single one. Yet.'),
      actions: has('arch') ? [] : [{ label: 'Try to read the great word', primary: true, fn: () => Puzzles.arch() }] }),
    keystone: () => { Know.lore('keystone'); Panel.open({ title: 'The keystone', text: P('A closed eye, carved in the stone over the entrance. The lid is worked with great care. Its lashes are tiny serpents.', 'It is the first thing anyone entering Thessaros would pass beneath.') }); },
    marker: () => { Know.lore('marker'); Panel.open({ title: 'Surveyor’s marker', text: P('A weathered post in your own script:', '<span class="common">THESSAROS. So the old charts name it.<br>Nine-sign inscription over the arch.<br>No reading of the script is known.</span>') }); },
    pack: () => { Know.lore('orvane1'); Panel.open({ title: 'An abandoned pack', text: P('Someone came before you. The pack has rotted at the seams. One page of notes is still legible, signed <i>Orvane</i>:',
      '<span class="common">“Third day. The arch has nine signs. The fourth, fifth and ninth are the same sign. If the word is the city’s name, the script can be broken. I have not told the others I hear breathing on the stair.”</span>') }); },
  },
  exits: { down: { to: 'letters', label: 'Down the stair' } },
};

ROOMS.letters = {
  name: 'The Hall of Letters', tongue: 'ZHAAL', depth: 'The first chamber', mood: 'letters', focus: 800,
  draw() {
    const b = box({ back: [420, 210, 1180, 690] }); let s = b.s;
    // the scribes' wall: the whole script laid out in rows
    let grid = '';
    Glyph.ROWS.forEach((row, r) => [...row].forEach((c, i) => {
      const x = 572 + i * 96, y = 300 + r * 62, known = S.letters[c];
      grid += `<rect x="${x - 38}" y="${y - 6}" width="76" height="54" fill="#0c0d10" stroke="#2c2e33" stroke-width="2"/>${carve(c, x - 11, y - 2, 40, { col: has('alphabet') ? '#cfc6ae' : '#a59f92', op: known ? .95 : .7 })}`;
    }));
    s += hs('abc', 'The scribes’ wall of signs', `<rect x="520" y="230" width="560" height="440" fill="#000" opacity=".25"/>${carve('ZHAAL', 800, 240, 34, { center: true })}${grid}
      <path d="M700 560l40 30l-12 30l30 40M1010 300l-22 40l18 26" stroke="#000" stroke-width="3" fill="none"/>`);
    s += lamp(470, 420, true, .9) + lamp(1130, 420, true, .9);
    s += hs('lamps', 'The burning lamps', '<rect x="430" y="380" width="80" height="110" fill="#000" opacity=".01"/><rect x="1090" y="380" width="80" height="110" fill="#000" opacity=".01"/>', 'data-mark="no"');
    // the mural on the left wall
    const ml = b.L(.22, .2), mr = b.L(.7, .22), md = b.L(.22, .72);
    s += hs('mural', 'A painted wall', onWall(ml, mr, md, 400, 300, `<rect width="400" height="300" fill="#2a2620"/><rect width="400" height="300" fill="url(#pGrain)"/>
      <ellipse cx="200" cy="140" rx="150" ry="95" fill="none" stroke="#46493f" stroke-width="40"/><ellipse cx="200" cy="140" rx="150" ry="95" fill="none" stroke="#5d6152" stroke-width="10" stroke-dasharray="18 10"/>
      <path d="M120 140Q200 90 280 140Q200 175 120 140Z" fill="#14130f"/><path d="M124 141Q200 162 276 141" stroke="#a29a80" stroke-width="5" fill="none"/>
      <path d="M332 170Q370 210 340 240" stroke="#5d6152" stroke-width="30" fill="none" stroke-linecap="round"/><circle cx="342" cy="236" r="6" fill="#14130f"/>
      ${has('gaze') || keyCount() >= 5 ? '<path d="M150 141Q200 128 250 141" stroke="#4fd6c4" stroke-width="3" fill="none" opacity=".7"/>' : ''}
      ${carve('OUROTH AKH THESS .', 200, 252, 26, { center: true, col: '#b8af96' })}`));
    // the scribes' desk, right foreground
    s += hs('desk', 'The scribes’ desk', `<polygon points="1180,760 1500,720 1600,800 1600,1000 1240,1000" fill="#1d1b18" stroke="#000" stroke-width="4"/>
      <polygon points="1180,760 1500,720 1600,800 1260,850" fill="#2c2924"/><rect x="1300" y="755" width="90" height="56" fill="#16171a" stroke="#3a3c42" stroke-width="3" transform="rotate(-6 1345 783)"/>
      <circle cx="1450" cy="776" r="18" fill="none" stroke="#4a4842" stroke-width="5"/><path d="M1462 788l24 18" stroke="#4a4842" stroke-width="5"/><rect x="1474" y="800" width="20" height="12" fill="#8a7d66"/>`);
    // the grate in the floor
    s += hs('grate', 'An iron grate in the floor', `<ellipse cx="800" cy="860" rx="240" ry="70" fill="url(#gStoneV)" stroke="#000" stroke-width="4"/><ellipse cx="800" cy="858" rx="190" ry="52" fill="#000"/>
      <g stroke="#2a2b2f" stroke-width="7">${[-150, -100, -50, 0, 50, 100, 150].map(x => `<path d="M${800 + x} ${858 - Math.sqrt(1 - (x / 190) ** 2) * 52}V${858 + Math.sqrt(1 - (x / 190) ** 2) * 52}"/>`).join('')}</g>
      ${carve('NHAUR', 800, 914, 22, { center: true })}`);
    // inner door on the right wall
    const open = has('alphabet');
    s += exit('in', 'The inner door', `${sideDoor(b.R, .45, .78, .3)}${open ? '' : `<polygon points="${b.R(.47, .33)} ${b.R(.76, .34)} ${b.R(.76, 1)} ${b.R(.47, 1)}" fill="url(#gStone)" stroke="#000" stroke-width="3"/>`}`);
    s += hs('doorL', 'Letters above the inner door', onWall(b.R(.43, .22), b.R(.8, .23), b.R(.43, .28), 300, 40, carve('ZHAALAR DURN GHUL .', 150, 6, 28, { center: true })));
    s += exit('up', 'Back up to the Threshold', `${sideDoor(b.L, .02, .2, .28)}<path d="M80 900l40 -30l40 30M80 860l40 -30l40 30" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    if (has('stairOpen')) s += exit('stair', 'The Keepers’ Stair', `${sideDoor(b.L, .74, .88, .4)}`);
    s += hs('slate', 'A child’s slate', `<rect x="1225" y="880" width="110" height="70" fill="#121315" stroke="#3a3833" stroke-width="5" transform="rotate(8 1280 915)"/>`);
    if (keyCount() >= 2) s += growth(468, 690, .55, 11, Math.min(2, keyCount() - 1), -1.2);
    return s + fog(700, 300, .6) + vignette();
  },
  on: {
    abc: () => { setFlag('abcSeen'); Know.see('abc'); has('alphabet') ? Panel.open({ title: 'The scribes’ wall', insc: ['abc'], text: P('Every sign of the Tongue, in the order the scribes taught it. You can read every one of them now.'), actions: [{ label: 'Study the wall again', fn: () => Puzzles.alphabet() }] }) : Puzzles.alphabet(); },
    lamps: () => { Know.lore('lamps'); Panel.open({ title: 'The lamps', text: P('Two bronze lamps, lit. There is no oil in them and no wick you can see.', 'Both flames lean the same way: towards the grate in the floor.') }); },
    mural: () => { Know.lore('mural'); Panel.open({ title: 'The painted wall', insc: ['mural'], text: P('A serpent coiled around a closed eye, painted again and again in layers. Beneath the picture, a line of signs.') }); if (has('alphabet')) { Know.clue('OUROTH', 'mural', 'painted under a serpent coiled round an eye, beside <i>akh</i>'); Know.clue('AKH', 'mural', 'painted under a serpent coiled round an eye, beside <i>ouroth</i>'); } },
    desk: () => { Know.lore('scribes'); Panel.open({ title: 'The scribes’ desk', insc: ['keytag'], text: P('Reed pens, a dried inkstone. A ring of iron keys hangs from a peg, and one word is stamped on its tag.') }); if (has('alphabet')) Know.clue('GHAZ', 'tag', 'stamped on the tag of a ring of keys'); },
    slate: () => Panel.open({ title: 'A child’s slate', insc: ['slate'], text: P('Small, careful signs, copied twice and corrected once. A name, perhaps. Every child here must have learned it.') }),
    grate: () => { Know.lore('grate'); Panel.open({ title: 'The grate', insc: ['grate'], text: P('Iron bars over a shaft that drops away out of the lamplight. One word is cut into the rim, facing the door, so that everyone who comes in reads it first.') }); if (has('alphabet')) Know.clue('NHAUR', 'grate', 'cut around a grate over a bottomless shaft'); },
    doorL: () => { Panel.open({ title: 'Above the inner door', insc: ['doorL'], text: P('A line carved over the inner door.') }); if (has('alphabet')) Know.clue('DURN', 'doorL', 'carved over the inner door of the Hall of Letters'); },
  },
  exits: {
    up: { to: 'threshold', label: 'Up to the Threshold' },
    in: { to: 'upper', label: 'The inner door', locked: () => has('alphabet') ? '' : 'A slab of stone fills the doorway. There is no handle and no keyhole. Something in this room must move it.' },
    stair: { to: 'stair', label: 'The Keepers’ Stair' },
  },
  enter(first) { if (first) setTimeout(() => say('Your lamp finds walls covered in signs. The air smells of cold ink.'), 900); },
};

ROOMS.upper = {
  name: 'The Upper Ring', tongue: 'THESSAROS', depth: 'Around the Throat', mood: 'ring', focus: 800,
  draw() {
    let s = throat({ depth: 0, teal: keyCount() >= 3 ? .15 : 0 });
    s += exit('names', 'The doorway marked Shemos', arch(330, 560, 110, 190));
    s += hs('signNames', 'Signs over the left doorway', `<rect x="250" y="320" width="160" height="40" fill="#000" opacity=".2"/>${carve('SHEMOS', 330, 326, 24, { center: true })}`);
    s += exit('archive', 'The doorway marked Zhaalos', arch(1270, 560, 110, 190));
    s += hs('signWords', 'Signs over the right doorway', `<rect x="1180" y="320" width="180" height="40" fill="#000" opacity=".2"/>${carve('ZHAALOS', 1270, 326, 24, { center: true })}`);
    s += lamp(1100, 470, true, .6) + hs('lamp', 'A lamp niche', `<rect x="1050" y="430" width="100" height="100" fill="#000" opacity=".01"/>${carve('LUM', 1100, 520, 16, { center: true })}`);
    // the gate down to the Middle Ring, with two chains running to the chambers
    const up = has('portcullis');
    s += exit('down', 'The gate down to the Middle Ring', `${arch(800, 650, 150, 210)}${up ? '' : `<g stroke="#2f3136" stroke-width="7">${[-60, -36, -12, 12, 36, 60].map(x => `<path d="M${800 + x} 505V650"/>`).join('')}<path d="M725 560H875M725 610H875"/></g>`}`);
    s += hs('portcullis', 'Inscription and chains on the gate', `<rect x="690" y="410" width="220" height="30" fill="#000" opacity=".2"/>${carve('THESSAROS DURN THESS .', 800, 412, 16, { center: true })}
      <path d="M700 460Q560 440 410 400" stroke="${S.keys.names ? '#2a2b2f' : '#55575e'}" stroke-width="6" stroke-dasharray="10 5" fill="none"/>
      <path d="M900 460Q1040 440 1190 400" stroke="${S.keys.chronicle ? '#2a2b2f' : '#55575e'}" stroke-width="6" stroke-dasharray="10 5" fill="none"/>`);
    s += ledge();
    s += hs('keeper', 'A hooded statue', keeper(220, 960, 1.35, { turned: has('turned'), eyeTeal: keyCount() >= 4 }));
    s += hs('serpent', 'A serpent statue', serpentStatue(1390, 970, 1.15));
    s += hs('quarry', 'A dressed stone block', `<polygon points="520,900 660,880 700,930 560,955" fill="#3a3c41" stroke="#000" stroke-width="3"/><polygon points="520,900 560,955 560,1000 520,950" fill="#202125"/><polygon points="560,955 700,930 700,975 560,1000" fill="#2a2b30"/>
      ${carve('VORZ', 630, 942, 18, { center: true })}<path d="M720 960l40 -14l8 8z" fill="#5e5a50"/>`);
    s += exit('back', 'Back to the Hall of Letters', `<path d="M0 640L90 600V1000H0Z" fill="#0a0a0c"/><path d="M20 760l30 -24l30 24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    if (keyCount() >= 1) s += growth(905, 650, .55, 21, Math.min(3, keyCount()), -2);
    return s + fog(560, 440, 1) + vignette();
  },
  on: {
    signNames: () => { Panel.open({ title: 'Over the left doorway', insc: ['signNames'], text: P('One word, carved deep.') }); if (S.words.SHEM?.k === 2) Know.rule('os'); },
    signWords: () => Panel.open({ title: 'Over the right doorway', insc: ['signWords'], text: P('One word, carved deep.') }),
    lamp: () => { Panel.open({ title: 'A lamp niche', insc: ['lamp'], text: P('A small bronze lamp burning without oil. The same short word is cut beside every lamp niche in the ring.') }); Know.clue('LUM', 'niche', 'cut beside every lamp niche'); },
    portcullis: () => Panel.open({ title: 'The gate', insc: ['portcullis'], text: P(has('portcullis') ? 'The gate is raised. Both chains hang slack.' : 'A gate of black iron. Two chains run from its counterweights across the shaft, one to each of the doorways above, and vanish into the walls.',
      has('portcullis') ? '' : `${S.keys.names ? 'The left chain hangs slack now.' : 'The left chain is taut.'} ${S.keys.chronicle ? 'The right chain hangs slack now.' : 'The right chain is taut.'}`) }),
    keeper: () => { Know.lore('keepers'); if (has('turned')) Know.lore('turned'); Panel.open({ title: 'A hooded statue', insc: ['keeper'], text: P('A hooded figure, twice your height, both hands pressed over its eyes.', has('turned') ? 'It is facing the shaft now. It was not, before.' : 'It faces the ramp, as if guarding it.') });
      if (S.words.THESS?.k === 2) { Know.rule('ar'); Know.confirm('THESS', true); } },
    serpent: () => { Panel.open({ title: 'A serpent statue', insc: ['serpent'], text: P('A serpent, coiled three times, its head raised towards the shaft. One word on its plinth.') }); Know.clue('OUROTH', 'statue', 'on the plinth of a coiled serpent statue'); },
    quarry: () => { Panel.open({ title: 'A dressed block', insc: ['quarry'], text: P('A block of stone, cut square and never used. A mason’s mallet lies beside it. The same word is cut into every unused block on the ramp.') }); Know.clue('VORZ', 'quarry', 'cut into unused blocks of building stone'); },
  },
  exits: {
    back: { to: 'letters', label: 'Back to the Hall of Letters' },
    names: { to: 'names', label: 'The left doorway' },
    archive: { to: 'archive', label: 'The right doorway' },
    down: { to: 'middle', label: 'The gate down', locked: () => has('portcullis') ? '' : `The gate is down. Its two chains run into the walls, one towards each doorway on this ring. ${S.keys.names ? 'The left one has gone slack.' : ''} ${S.keys.chronicle ? 'The right one has gone slack.' : ''}` },
  },
  enter(first) { if (first) setTimeout(() => say('The temple opens around a shaft so wide your lamp cannot reach the far side of it. The ramp spirals down.'), 900); },
};

/* ---------------- I. the Hall of Names ---------------- */
const NAMES = { things: ['stone', 'lamp', 'key', 'door', 'serpent', 'eye'], right: ['VORZ', 'LUM', 'GHAZ', 'DURN', 'OUROTH', 'AKH'],
  faces: [['AKH', 'VORZ', 'LUM', 'DURN'], ['VORZ', 'OUROTH', 'LUM', 'GHAZ'], ['LUM', 'GHAZ', 'AKH', 'OUROTH'], ['GHAZ', 'DURN', 'OUROTH', 'VORZ'], ['DURN', 'AKH', 'OUROTH', 'LUM'], ['OUROTH', 'DURN', 'GHAZ', 'AKH']] };
const thingArt = (i, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${[
  '<polygon points="-30,-10 20,-20 34,0 -16,10" fill="#4b4e55" stroke="#000" stroke-width="2"/><polygon points="-30,-10 -16,10 -16,40 -30,22" fill="#25262a"/><polygon points="-16,10 34,0 34,28 -16,40" fill="#33353a"/>',
  '<path d="M-26 20Q-30 0 0 0Q34 0 26 20Z" fill="url(#gBronze)" stroke="#000" stroke-width="2"/><path d="M26 10Q40 4 34 -6" stroke="#4c4330" stroke-width="5" fill="none"/>' + (has('noFlame') ? '' : '<path class="flame" d="M-22 2Q-16 -18 -12 2Z" fill="#e9dcb8"/>'),
  '<g transform="scale(1.4)" fill="#6a6252" stroke="#000" stroke-width="1"><circle cx="-14" cy="10" r="8" fill="none" stroke="#6a6252" stroke-width="4"/><path d="M-6 8H24V12H-6ZM14 12H18V20H14ZM20 12H24V18H20Z"/></g>',
  '<rect x="-24" y="-30" width="48" height="66" fill="url(#gBronze)" stroke="#000" stroke-width="3"/><path d="M0 -30V36M-24 2H24" stroke="#1f1b13" stroke-width="3"/><circle cx="12" cy="6" r="3" fill="#000"/>',
  '<path d="M-28 30Q-34 10 -10 8Q20 6 18 -10Q16 -26 -2 -24" stroke="#1d1e22" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M-28 30Q-34 10 -10 8Q20 6 18 -10Q16 -26 -2 -24" stroke="#5a5d64" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-8 -30Q2 -36 10 -26Q2 -18 -8 -22Z" fill="#5a5d64" stroke="#000"/>',
  '<ellipse cx="0" cy="8" rx="28" ry="22" fill="#d7d2c4" stroke="#000" stroke-width="2"/><circle cx="4" cy="8" r="11" fill="#2b5050"/><circle cx="4" cy="8" r="5" fill="#000"/><circle cx="0" cy="3" r="2.5" fill="#fff" opacity=".7"/>',
][i]}</g>`;
ROOMS.names = {
  name: 'The Hall of Names', tongue: 'SHEMOS', depth: 'Chamber I', mood: 'names', focus: 800,
  draw() {
    const b = box({ back: [560, 250, 1040, 640], slabs: 7 }); let s = b.s;
    const st = S.puz.names || [0, 0, 0, 0, 0, 0], solved = !!S.keys.names;
    // six plinths, three each side, the prism above each showing the name it is turned to
    const spots = [[.12, .2], [.12, .5], [.12, .74], [.88, .2], [.88, .5], [.88, .74]];
    spots.forEach(([u, t], i) => {
      const [x, y] = b.F(u, t), k = 1 - t * .62, w = solved ? NAMES.right[i] : NAMES.faces[i][st[i]];
      s += hs('p' + i, `Plinth ${i + 1}: a ${NAMES.things[i]}, and a name prism`, `<rect x="${x - 50 * k}" y="${y - 120 * k}" width="${100 * k}" height="${120 * k}" fill="url(#gStoneV)" stroke="#000" stroke-width="3"/>
        ${thingArt(i, x, y - 150 * k, k * 1.25)}<rect x="${x - 56 * k}" y="${y - 290 * k}" width="${112 * k}" height="${58 * k}" fill="#24252a" stroke="${solved ? '#b9a978' : '#000'}" stroke-width="3"/>
        ${carve(w, x, y - 278 * k, 34 * k, { center: true, col: solved ? '#e2d6aa' : '#b4ac98', glow: solved })}<path d="M${x} ${y - 232 * k}V${y - 214 * k}" stroke="#2a2b30" stroke-width="${6 * k}"/>`);
    });
    // the back wall: the reliquary, the release lever and the seventh niche
    s += hs('reliquary', 'An eye-shaped reliquary', `<path d="M690 470Q800 380 910 470Q800 560 690 470Z" fill="url(#gBronze)" stroke="#000" stroke-width="4"/>
      ${solved ? '<path d="M700 470Q800 420 900 470Q800 520 700 470Z" fill="#000"/>' : '<path d="M700 470Q800 500 900 470" stroke="#1f1b13" stroke-width="4" fill="none"/>'}
      <circle cx="800" cy="486" r="6" fill="#000"/>`);
    s += hs('lever', 'A lever in the wall', `<rect x="958" y="480" width="40" height="110" fill="#111215" stroke="#33353a" stroke-width="3"/><path d="M978 ${solved ? 570 : 500}L1010 ${solved ? 600 : 470}" stroke="url(#gBronze)" stroke-width="10" stroke-linecap="round"/>`);
    s += hs('niche', 'An empty niche', `<rect x="590" y="430" width="70" height="120" fill="#030304" stroke="#33353a" stroke-width="3"/><rect x="598" y="400" width="54" height="28" fill="#24252a" stroke="#000" stroke-width="2"/>${carve('NHAUR', 625, 405, 14, { center: true })}`);
    s += exit('back', 'Back to the Upper Ring', `<path d="M0 940L60 920V1000H0Z" fill="#000"/><path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    s += lamp(620, 330, true, .5) + lamp(980, 330, true, .5);
    return s + fog(700, 300, .5) + vignette();
  },
  on: Object.assign({
    reliquary: () => Panel.open({ title: 'The reliquary', text: solvedNames() ? P('The bronze lids stand open. Whatever lay inside is in your keyring.') : P('A bronze casket shaped like a closed eye, set into the back wall. A keyhole-shaped slot runs through its pupil, but there is no key inside, only the end of a rod that runs into the wall towards the lever.') }),
    lever: () => Puzzles.names(),
    niche: () => { Know.lore('nicheN'); Panel.open({ title: 'The seventh niche', insc: ['underside'].filter(() => has('lookedUnder')), text: P('Six niches hold six things. This one holds nothing: only a round hole in its floor that drops into the dark. Above it, a prism with the same word on all four faces.'),
      actions: has('lookedUnder') ? [] : [{ label: 'Lift the prism and look beneath it', fn: () => { setFlag('lookedUnder'); Sound.sfx('grind'); ROOMS.names.on.niche(); } }] }); },
  }, Object.fromEntries([0, 1, 2, 3, 4, 5].map(i => ['p' + i, () => Puzzles.names(i)]))),
  exits: { back: { to: 'upper', label: 'Back to the Upper Ring' } },
};
const solvedNames = () => !!S.keys.names;

/* ---------------- II. the Hall of Words ---------------- */
ROOMS.archive = {
  name: 'The Hall of Words', tongue: 'ZHAALOS', depth: 'Chamber II', mood: 'archive', focus: 760,
  draw() {
    const b = box({ back: [500, 150, 1100, 650], courses: 9 }); let s = b.s;
    let holes = '';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) holes += `<rect x="${520 + c * 64}" y="${180 + r * 46}" width="48" height="32" fill="#050506"/>`;
    s += hs('holes', 'Rows of empty pigeonholes', holes, 'data-mark="no"');
    // the high ledge on the left wall, and the statue that fell against it
    const la = b.L(.25, .4), lb = b.L(.6, .42);
    s += `<polygon points="${la} ${lb} ${lb[0] + 60},${lb[1] + 20} ${la[0] + 80},${la[1] + 30}" fill="#2b2c31" stroke="#000" stroke-width="3"/>`;
    if (!has('took:fBL')) s += hs('ledge', 'Something on the high ledge', `<polygon points="${la[0] + 60},${la[1] + 2} ${la[0] + 110},${la[1] - 6} ${la[0] + 118},${la[1] + 14} ${la[0] + 66},${la[1] + 20}" fill="#686c74" stroke="#000" stroke-width="2"/>`);
    s += hs('statue', 'A toppled statue', `<g transform="translate(150 880) rotate(-38)">${keeper(0, 0, 1.15).replace(/<g transform="[^"]+">/, '<g>')}</g>`);
    // the stele base
    s += hs('stele', 'The base of a broken stele', `<rect x="700" y="760" width="200" height="90" fill="url(#gStoneV)" stroke="#000" stroke-width="4"/><rect x="720" y="${S.keys.chronicle ? 330 : 700}" width="160" height="${S.keys.chronicle ? 430 : 60}" fill="url(#gStone)" stroke="#000" stroke-width="3"/>
      ${S.keys.chronicle ? `<path d="M740 360h120M740 400h120M740 440h120M740 500h120M740 540h120M740 600h120" stroke="#cfc6ae" stroke-opacity=".5" stroke-width="3" stroke-dasharray="7 5"/><circle cx="800" cy="350" r="9" fill="#000" stroke="#b9a978" stroke-width="2"/>` : '<path d="M720 700l20 -14l18 10l30 -18l24 16l26 -12l20 14l22 -6v10h-160z" fill="#3d3f45"/>'}
      <rect x="700" y="760" width="200" height="90" fill="url(#pGrain)"/>`);
    // fragments lying about
    const frag = (id, x, y, r, warm) => has('took:' + id) ? '' : hs(id, 'A broken piece of carved stone', `<g transform="translate(${x} ${y}) rotate(${r})"><polygon points="-34,-20 30,-26 38,14 -4,30 -38,12" fill="${warm ? '#6f665a' : '#5c6067'}" stroke="#000" stroke-width="3"/><path d="M-24 -6h44M-24 6h36" stroke="#000" stroke-opacity=".5" stroke-width="3" stroke-dasharray="5 4"/></g>`);
    s += frag('fTL', 640, 900, -14) + frag('fTR', 980, 930, 22) + frag('fBR', 1270, 960, -8) + frag('fX', 470, 960, 30, true);
    s += hs('rubble', has('rubble') ? 'Cleared rubble' : 'A heap of rubble', has('rubble') ? rubble(1240, 840, 160, 9) : rubble(1250, 860, 260, 7));
    if (has('rubble') && !has('took:fML')) s += frag('fML', 1150, 880, -24);
    s += exit('stacks', 'A crack in the right wall', `<path d="M${b.R(.55, .3)[0]} ${b.R(.55, .3)[1]}l-20 60l16 40l-24 70l14 60l-10 60l40 -10l-6 -70l22 -60l-14 -50z" fill="#000" stroke="#1d1e22" stroke-width="3"/>`);
    s += exit('back', 'Back to the Upper Ring', `<path d="M0 940L60 920V1000H0Z" fill="#000"/><path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + shaft(800, 260, .6) + fog(650, 350, .6) + vignette();
  },
  on: {
    holes: () => { Know.lore('pigeon'); Panel.open({ title: 'Pigeonholes', text: P('Hundreds of square holes in the walls, each sized for a clay tablet. Almost all are empty. The floor below them is ankle-deep in broken clay.') }); },
    statue: () => Panel.open({ title: 'A toppled keeper', text: P('A hooded statue lies broken against the left wall, hands still over its eyes. Its back makes a rough ramp up towards a ledge high on the wall.'),
      actions: has('took:fBL') ? [] : [{ label: 'Climb the statue to the ledge', fn: () => { Sound.sfx('step'); take('fBL', 'From the ledge: a stele fragment with a footing on the left'); } }] }),
    ledge: () => Panel.open({ title: 'The ledge', text: P('Something pale lies on a ledge high on the left wall, too high to reach from the floor.') }),
    rubble: () => has('rubble') ? Panel.open({ title: 'Rubble', text: P('Cleared. Only broken clay remains.') })
      : Panel.open({ title: 'A heap of rubble', text: P('Fallen ceiling blocks and smashed tablets. A carved edge shows between two blocks.'), actions: [{ label: 'Drag the blocks aside', fn: () => { Sound.sfx('grind'); setFlag('rubble'); Scene.render(); say('Under the blocks: another fragment of the stele.'); } }] }),
    stele: () => Puzzles.stele(),
    ...Object.fromEntries(['fTL', 'fTR', 'fBR', 'fX', 'fML'].map(id => [id, () => take(id, 'You take ' + ITEMS[id].name + '.')])),
  },
  exits: { back: { to: 'upper', label: 'Back to the Upper Ring' }, stacks: { to: 'stacks', label: 'Through the crack' } },
};

ROOMS.stacks = {
  name: 'The Stacks', depth: 'Behind the Hall of Words', mood: 'archive', focus: 800,
  draw() {
    const b = box({ back: [660, 260, 940, 640], courses: 10 }); let s = b.s;
    for (let side of [b.L, b.R]) for (let r = 0; r < 6; r++) {
      const h = .18 + r * .13; s += `<polygon points="${side(.05, h)} ${side(.9, h)} ${side(.9, h + .02)} ${side(.05, h + .03)}" fill="#2a2b30"/>`;
      for (let k = 0; k < 9; k++) { const t = .08 + k * .09; if ((r * 7 + k * 3) % 5 === 0) continue; const p = side(t, h - .07), q = side(t + .05, h); s += `<rect x="${Math.min(p[0], q[0])}" y="${p[1]}" width="${Math.abs(q[0] - p[0])}" height="${q[1] - p[1]}" fill="#4a453c" stroke="#000"/>`; }
    }
    s += rubble(800, 940, 380, 12) + rubble(560, 980, 240, 13);
    s += hs('tablet', 'An unbroken tablet', `<rect x="1080" y="800" width="120" height="80" fill="#5a5245" stroke="#000" stroke-width="3" transform="rotate(-8 1140 840)"/><path d="M1095 822h86M1095 840h70M1095 858h80" stroke="#2a251d" stroke-width="3" transform="rotate(-8 1140 840)"/>`);
    if (!has('took:fMR')) s += hs('jar', 'A sealed jar', `<path d="M770 640Q740 600 760 560H840Q860 600 830 640Z" fill="#4b3f30" stroke="#000" stroke-width="3"/><rect x="772" y="546" width="56" height="16" fill="#2b231a"/>`);
    s += hs('chalk', 'Chalk marks on a shelf', `<path d="M300 520l40 -6M300 540l30 -4M296 560l50 -8M380 520l-10 50M400 518l-10 50M420 516l-10 50M440 514l-10 50M370 545l80 -12" stroke="#d6d2c8" stroke-opacity=".6" stroke-width="3"/>`);
    s += exit('back', 'Back through the crack', `<path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + fog(600, 400, .7) + vignette();
  },
  on: {
    tablet: () => { Panel.open({ title: 'An unbroken tablet', insc: ['stacks'], text: P('The only whole tablet on these shelves, hidden behind fallen ones. Someone saved this one.') }); if (S.rules.order) Know.rule('nobe'); },
    jar: () => Panel.open({ title: 'A sealed jar', text: P('A clay jar, its lid sealed with wax. It is heavy and something inside shifts like stone.'), actions: [{ label: 'Break the seal', fn: () => { Sound.sfx('clank'); take('fMR', 'Inside the jar: a stele fragment, border on the right. Someone hid it here.'); } }] }),
    chalk: () => { Know.lore('orvane2'); Panel.open({ title: 'Chalk on the shelf', text: P('Tally marks and a note in your own script, in chalk:', '<span class="common">“The tablets are all the same story told by people who disagree. One word keeps being scratched out: whatever the deep is called when it is called by name. — O.”</span>') }); },
  },
  exits: { back: { to: 'archive', label: 'Back to the Hall of Words' } },
};

/* ---------------- the Middle Ring ---------------- */
ROOMS.middle = {
  name: 'The Middle Ring', tongue: 'NHAUR', depth: 'Halfway down the Throat', mood: 'ring', focus: 800,
  draw() {
    let s = throat({ depth: 1, teal: .25 + keyCount() * .06 });
    s += exit('engine', 'The doorway marked Murros', arch(320, 590, 110, 190, { glow: S.keys.coil ? '#4fd6c4' : '' }));
    s += hs('signSleep', 'Signs over the left doorway', `<rect x="240" y="350" width="160" height="40" fill="#000" opacity=".2"/>${carve('MURROS', 320, 356, 24, { center: true })}`);
    s += exit('chapel', 'The doorway marked Valos', arch(1280, 590, 110, 190));
    s += hs('signDown', 'Signs over the right doorway', `<rect x="1200" y="350" width="160" height="40" fill="#000" opacity=".2"/>${carve('VALOS', 1280, 356, 24, { center: true })}`);
    const bridge = has('bridge');
    s += exit('lower', bridge ? 'The bridge across the Throat' : 'A stub of bridge over the Throat', bridge ? `<polygon points="700,820 900,820 860,560 740,560" fill="#202125" stroke="#000" stroke-width="4"/><path d="M740 560L700 820M860 560L900 820" stroke="#45474d" stroke-width="4"/><polygon points="700,820 900,820 860,560 740,560" fill="url(#pGrain)"/>`
      : `<polygon points="720,820 880,820 866,740 734,740" fill="#202125" stroke="#000" stroke-width="4"/><path d="M734 740l12 -8l14 10l16 -12l20 12l18 -8l14 8l18 -4" stroke="#000" stroke-width="3" fill="none"/>`);
    s += ledge();
    s += hs('rail', 'Words cut into the balustrade', `<rect x="680" y="690" width="240" height="38" fill="#000" opacity=".2"/>${carve('NHAUR KA VEN .', 800, 696, 22, { center: true })}`);
    s += exit('shrine', 'A low broken doorway', `<path d="M40 1000V730Q60 660 120 650Q180 660 190 740V1000Z" fill="#000" stroke="#2a2b30" stroke-width="6"/><path d="M60 720l30 20l-10 30" stroke="#2a2b30" stroke-width="4" fill="none"/>`);
    s += exit('up', 'The stair back up', `<path d="M1440 1000V720H1600V1000Z" fill="#0a0a0c"/><path d="M1490 820l30 -24l30 24M1490 860l30 -24l30 24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    s += growth(1060, 880, .8, 31, 1 + Math.min(4, keyCount()), -2.1) + growth(560, 905, .6, 32, keyCount() >= 3 ? 2 : 0, -1.2);
    s += keeper(1180, 930, .9, { turned: true });
    return s + fog(520, 480, 1.2) + vignette();
  },
  on: {
    signSleep: () => Panel.open({ title: 'Over the left doorway', insc: ['signSleep'], text: P('One word.') }),
    signDown: () => Panel.open({ title: 'Over the right doorway', insc: ['signDown'], text: P('One word.') }),
    rail: () => Panel.open({ title: 'The balustrade', insc: ['rail'], text: P('Cut into the top of the balustrade, where a hand would rest before leaning out. The stone has been worn smooth by hands, except for the words.') }),
  },
  exits: {
    up: { to: 'upper', label: 'Up to the Upper Ring' }, engine: { to: 'engine', label: 'The left doorway' }, chapel: { to: 'chapel', label: 'The right doorway' }, shrine: { to: 'shrine', label: 'The broken doorway' },
    lower: { to: 'lower', label: 'Across the Throat', locked: () => has('bridge') ? '' : `The bridge has been drawn back into the far wall. Its chains run to the two doorways on this ring. ${S.keys.coil ? 'One has gone slack.' : ''} ${S.keys.rite ? 'The other has gone slack.' : ''} It will need both.` },
  },
  enter(first) { if (first) setTimeout(() => say('The air is colder here. Far below, the dark has a faint colour to it.'), 900); },
};

ROOMS.shrine = {
  name: 'The Feeders’ Shrine', depth: 'Older than the temple', mood: 'shrine', focus: 800,
  draw() {
    let s = `<rect width="1600" height="1000" fill="#060607"/><path d="M0 0H1600V1000H0Z M200 1000Q120 600 260 300Q500 80 800 90Q1100 80 1340 300Q1480 600 1400 1000Z" fill="#000" fill-rule="evenodd"/>
      <path d="M200 1000Q120 600 260 300Q500 80 800 90Q1100 80 1340 300Q1480 600 1400 1000Z" fill="#1b1a19"/><path d="M200 1000Q120 600 260 300Q500 80 800 90Q1100 80 1340 300Q1480 600 1400 1000Z" fill="url(#pGrain)"/>`;
    s += hs('painting', 'A painting on the rock', `<path d="M480 200H1120V480H480Z" fill="#2a241d" opacity=".9"/><ellipse cx="800" cy="420" rx="220" ry="50" fill="#050505"/>
      <path d="M720 420Q800 395 880 420Q800 440 720 420Z" fill="#3b5f5a"/>
      ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${560 + i * 120} 300)"><circle r="12" fill="#6b5d48"/><path d="M-10 12L-14 70H14L10 12Z" fill="#6b5d48"/><path d="M14 30Q${50 + i * 4} 40 ${60} 90" stroke="#6b5d48" stroke-width="7" fill="none"/></g>`).join('')}
      <path d="M560 470Q700 440 800 410" stroke="#9b8e75" stroke-dasharray="6 8" stroke-width="3" fill="none"/>`);
    s += hs('altar', 'A carved altar', `<path d="M560 760H1040L1000 900H600Z" fill="url(#gStoneV)" stroke="#000" stroke-width="4"/><path d="M560 760H1040L1000 900H600Z" fill="url(#pGrain)"/>
      ${carve('VALARUK KRULITH DAL .', 800, 790, 26, { center: true, col: '#a69a7a' })}
      <g transform="translate(${800 + (Glyph.width('VALARUK KRULITH ') - Glyph.width('VALARUK KRULITH DAL .') / 2) * 1.3 - 9} 772) rotate(-6)">${carve('KA', 0, 0, 22, { col: '#c9c0a6', w: 2.2 })}</g>
      <path d="M640 860h320" stroke="#000" stroke-width="3"/>`);
    s += hs('masks', 'A heap of masks', `${[0, 1, 2, 3, 4, 5, 6].map(i => `<g transform="translate(${1150 + (i % 4) * 46 - (i > 3 ? 20 : 0)} ${900 - (i > 3 ? 40 : 0)}) rotate(${(i * 37) % 40 - 20})"><ellipse rx="26" ry="34" fill="#8a7f6c" stroke="#000" stroke-width="2"/><path d="M-12 -6Q-6 -10 -2 -6M2 -6Q6 -10 12 -6" stroke="#000" stroke-width="3" fill="none"/></g>`).join('')}`);
    s += growth(320, 880, .9, 41, Math.min(3, keyCount()), -1.4);
    s += exit('back', 'Back to the Middle Ring', `<path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + lamp(800, 600, true, .7) + fog(640, 360, .8) + vignette();
  },
  on: {
    painting: () => Panel.open({ title: 'The painting', text: P('Rough figures in ochre carry bodies to the edge of a pit and tip them in. At the bottom of the pit, painted in a colour that has not faded at all: a long almond shape, half open.') }),
    altar: () => { Know.lore('feeders'); Panel.open({ title: 'The altar', insc: ['feedOld', 'feedNew'], text: P('An old prayer, smoothly carved. One short word has been forced into it later, crudely, with a different chisel.') });
      Know.clue('DAL', 'altar', 'the deed of an old prayer said over the dead'); },
    masks: () => { Know.lore('masks'); Panel.open({ title: 'Masks', text: P('Clay masks, hundreds, with blank eyes. A word is pressed into the brow of each.'), insc: ['feedMask'].filter(x => INSC[x]) }); Know.clue('MUL', 'masks', 'pressed into the brow of hundreds of clay masks'); },
  },
  exits: { back: { to: 'middle', label: 'Back to the Middle Ring' } },
};
INSC.feedMask = { at: 'The Feeders’ Shrine, pressed into a clay mask', t: 'MUL', read: 'Mask.' };

/* ---------------- III. the Engine of Sleep ---------------- */
const COIL_N = [8, 6, 4];
ROOMS.engine = {
  name: 'The Engine of Sleep', tongue: 'MURROS', depth: 'Chamber III', mood: 'engine', focus: 800,
  draw() {
    const b = box({ back: [360, 170, 1240, 560], courses: 6, slabs: 0 }); let s = b.s;
    const st = S.puz.coil || [3, 1, 2], solved = !!S.keys.coil;
    s += hs('table', 'A carved table on the far wall', `<rect x="560" y="220" width="480" height="230" fill="#1e1f23" stroke="#000" stroke-width="4"/><rect x="560" y="220" width="480" height="230" fill="url(#pGrain)"/>
      ${[[650, 8], [800, 6], [950, 4]].map(([x, n]) => `<circle cx="${x}" cy="320" r="48" fill="none" stroke="#7d7a70" stroke-width="5"/>${Array.from({ length: n }, (_, i) => `<circle cx="${x + Math.sin(i / n * TAU) * 48}" cy="${320 - Math.cos(i / n * TAU) * 48}" r="4" fill="#b8b2a0"/>`).join('')}<path d="M${x} 320L${x} 276" stroke="#b8b2a0" stroke-width="4"/>`).join('')}
      <path d="M770 262Q800 246 830 262Q800 274 770 262Z" fill="#000" stroke="#b8b2a0" stroke-width="2"/>${carve('OUROTHUK AKH VEN . NHAUR MURR .', 800, 400, 20, { center: true })}`);
    // the three rings set into the floor
    let rings = '';
    [[540, 160, 64], [390, 116, 52], [240, 72, 44]].forEach(([rx, ry, w], k) => {
      rings += `<ellipse cx="800" cy="790" rx="${rx}" ry="${ry}" fill="none" stroke="#000" stroke-width="${w + 8}"/><ellipse cx="800" cy="790" rx="${rx}" ry="${ry}" fill="none" stroke="${['#2c2d31', '#34363b', '#3c3e44'][k]}" stroke-width="${w}"/>`;
      for (let i = 0; i < COIL_N[k]; i++) { const a = i / COIL_N[k] * TAU - Math.PI / 2; rings += `<circle cx="${800 + Math.cos(a) * rx}" cy="${790 + Math.sin(a) * ry}" r="5" fill="#8d887a"/>`; }
      const a = st[k] / COIL_N[k] * TAU - Math.PI / 2, hx = 800 + Math.cos(a) * rx, hy = 790 + Math.sin(a) * ry;
      rings += `<g transform="translate(${hx} ${hy})"><ellipse rx="${w * .45}" ry="${w * .28}" fill="${solved ? '#4c7d72' : '#5e6168'}" stroke="#000" stroke-width="3"/><circle cx="${w * .12}" cy="-3" r="3" fill="#000"/></g>`;
    });
    s += hs('rings', 'Three stone rings set into the floor', `${rings}<path d="M780 618Q800 606 820 618Q800 628 780 618Z" fill="#000" stroke="#a49e8c" stroke-width="2"/>
      <ellipse cx="800" cy="790" rx="110" ry="34" fill="${solved ? '#0d2421' : '#0a0a0c'}" stroke="#000" stroke-width="4"/>${solved ? '<ellipse cx="800" cy="790" rx="90" ry="26" fill="url(#gTealSoft)"/>' : ''}`);
    s += hs('gears', 'Gears in the walls', `<g class="${solved ? 'spin-slow' : 'creep'}" style="transform-origin:180px 330px"><circle cx="180" cy="330" r="120" fill="none" stroke="#24252a" stroke-width="30" stroke-dasharray="16 12"/><circle cx="180" cy="330" r="80" fill="#151619" stroke="#000" stroke-width="4"/></g>
      <g class="${solved ? 'spin-rev' : 'creep'}" style="transform-origin:1440px 300px"><circle cx="1440" cy="300" r="90" fill="none" stroke="#24252a" stroke-width="26" stroke-dasharray="14 10"/><circle cx="1440" cy="300" r="56" fill="#151619" stroke="#000" stroke-width="4"/></g>`);
    const crank = (id, x, hasHandle) => hs(id, id === 'crankA' ? 'The left crank' : 'The right crank', `<rect x="${x - 26}" y="760" width="52" height="200" fill="url(#gStoneV)" stroke="#000" stroke-width="3"/><circle cx="${x}" cy="780" r="24" fill="url(#gBronze)" stroke="#000" stroke-width="3"/>
      ${hasHandle ? `<path d="M${x} 780L${x + 50} 740" stroke="url(#gBronze)" stroke-width="12" stroke-linecap="round"/><circle cx="${x + 50}" cy="740" r="9" fill="#4c4330"/>` : `<rect x="${x - 7}" y="773" width="14" height="14" fill="#000"/>`}`);
    s += crank('crankA', 200, true) + crank('crankB', 1400, has('handleSet'));
    s += exit('cistern', 'A grated door to the right', `${sideDoor(b.R, .3, .55, .35)}<g stroke="#2f3136" stroke-width="5">${[.34, .4, .46, .52].map(t => `<path d="M${b.R(t, .37)[0]} ${b.R(t, .37)[1]}V${b.R(t, 1)[1]}"/>`).join('')}</g>`);
    s += exit('back', 'Back to the Middle Ring', `<path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + fog(640, 360, .7) + vignette();
  },
  on: {
    table: () => { Panel.open({ title: 'The table on the wall', insc: ['breath'], text: P('Three rings are carved here, with eight marks, six marks and four marks. Each has a serpent’s head pointing straight up at a carved closed eye.') }); },
    rings: () => Puzzles.coil(),
    crankA: () => Puzzles.coil(),
    crankB: () => {
      if (has('handleSet')) return Puzzles.coil();
      if (holding('handle')) { S.inv = S.inv.filter(i => i !== 'handle'); setFlag('handleSet'); renderKeyring(); Sound.sfx('clank'); say('The bronze handle slides into the socket and locks with a click.'); Scene.render(); return; }
      Panel.open({ title: 'The right crank', text: P('A crank post like the one on the left, but its handle has been broken off. The square socket is empty and clean. Someone took it, or dropped it.') });
    },
    gears: () => { Know.lore('gears'); Panel.open({ title: 'The gears', text: P(S.keys.coil ? 'The gears turn smoothly now, as if relieved.' : 'Great stone gears half sunk in the walls. As you watch, one creeps forward by a single tooth, with no one turning it.') }); },
  },
  exits: { back: { to: 'middle', label: 'Back to the Middle Ring' }, cistern: { to: 'cistern', label: 'The grated door' } },
};

ROOMS.cistern = {
  name: 'The Cistern', depth: 'Beside the Engine', mood: 'cistern', focus: 800,
  draw() {
    const b = box({ back: [520, 260, 1080, 600], courses: 6, slabs: 0 }); let s = b.s, dry = has('drained');
    for (const [x, t] of [[.25, .2], [.75, .2], [.3, .55], [.7, .55]]) { const [px, py] = b.F(x, t), k = 1 - t * .6; s += pillar(px, py - 760 * k, py, 70 * k); }
    if (dry) s += hs('mosaic', 'A mosaic on the floor', `<ellipse cx="800" cy="780" rx="420" ry="120" fill="#1b1d1f"/><path d="M560 780Q800 700 1040 780Q800 860 560 780Z" fill="#203431" stroke="#9db1aa" stroke-width="4"/><path d="M570 782Q800 806 1030 782" stroke="#9db1aa" stroke-width="5" fill="none"/>
      ${[0, 1, 2, 3, 4].map(i => { const a = Math.PI + i * Math.PI / 4; return `<path transform="translate(${800 + Math.cos(a) * 340} ${760 + Math.sin(a) * 110}) rotate(${i * 45 - 90})" d="M-26 -20Q0 -40 26 -20L18 20Q0 32 -18 20Z" fill="#33433f" stroke="#000" stroke-width="3"/>`; }).join('')}
      ${carve('GHAZUK DURN THESS .', 800, 870, 22, { center: true, col: '#b8c4bd' })}`);
    else s += `<polygon points="0,1000 1600,1000 1080,600 520,600" fill="#071012" opacity=".92"/><path d="M200 900Q500 880 800 905T1400 895M300 820Q600 805 900 822T1300 815M420 720Q700 710 1000 724" stroke="#4a6a70" stroke-opacity=".25" stroke-width="2" fill="none" class="ripple"/>`;
    if (!has('took:handle') && !has('handleSet')) s += hs('handle', 'A glint under the water', `<circle cx="1180" cy="880" r="40" fill="url(#gLamp)" opacity=".4"/><path d="M1160 890L1200 868" stroke="#8a7a55" stroke-width="7" stroke-linecap="round"/>`);
    s += hs('tablet', 'A tablet in the silt', `<rect x="380" y="860" width="110" height="70" fill="#4a453c" stroke="#000" stroke-width="3" transform="rotate(12 435 895)"/>`);
    s += hs('tally', 'Marks on the wall', onWall(b.R(.15, .3), b.R(.6, .32), b.R(.15, .6), 400, 200, Array.from({ length: 22 }, (_, i) => `<path d="M${10 + i * 18} 20v60M${10 + i * 18} 110v60" stroke="#c9c2b0" stroke-opacity=".45" stroke-width="3"/>`).join('') + '<path d="M0 50h400M0 140h400" stroke="#c9c2b0" stroke-opacity=".3" stroke-width="2"/>'));
    s += exit('back', 'Back to the Engine', `<path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + fog(600, 400, .9) + vignette();
  },
  on: {
    handle: () => take('handle', 'You reach into the cold water and draw out a bronze crank handle.'),
    tablet: () => { Panel.open({ title: 'A tablet in the silt', insc: ['cistern'], text: P('Half sunk, its corner chipped. Beside the words, a picture: a sleeping serpent with one eye half open, and a keeper beside it making marks on a wall.') });
      Know.clue('RHA', 'cistern', 'beside a picture of a sleeping serpent with one eye half open'); Know.clue('KRENN', 'cistern', 'beside a picture of a keeper making marks on a wall'); },
    tally: () => { Know.lore('tally'); Panel.open({ title: 'Tally marks', text: P('Thousands of marks, grouped in eights, then in rows. They cover the wall up into the dark.') }); },
    mosaic: () => { Know.lore('mosaic'); setFlag('scale'); Panel.open({ title: 'The drowned mosaic', insc: ['mosaic'], text: P('With the water gone: a closed eye ringed by five great scales, each pierced by a keyhole. The words beneath are the same words you know for keys, but the pictures are unmistakably scales.') }); Know.confirm('GHAZ', true); },
  },
  exits: { back: { to: 'engine', label: 'Back to the Engine' } },
};

/* ---------------- IV. the Chapel of the Last Rite ---------------- */
const RITE = ['name', 'wash', 'wax', 'mask', 'bell', 'lower'];
ROOMS.chapel = {
  name: 'The Chapel of the Last Rite', tongue: 'VALOS', depth: 'Chamber IV', mood: 'chapel', focus: 800,
  draw() {
    const b = box({ back: [470, 200, 1130, 640] }); let s = b.s;
    const step = S.puz.rite || 0, solved = !!S.keys.rite, done = k => solved || step > RITE.indexOf(k);
    s += lamp(560, 360, true, .7) + lamp(1040, 360, true, .7);
    // the relief on the left wall
    s += hs('relief', 'A relief of two figures', onWall(b.L(.25, .2), b.L(.7, .22), b.L(.25, .65), 400, 300, `<rect width="400" height="300" fill="#26272b"/><rect width="400" height="300" fill="url(#pGrain)"/>
      <g fill="#6b6c70"><circle cx="110" cy="80" r="22"/><path d="M80 100L70 240H150L140 100Z"/><path d="M92 82L126 82" stroke="#26272b" stroke-width="10"/></g>
      <g fill="#6b6c70"><circle cx="290" cy="120" r="22"/><path d="M260 140L250 240H330L320 140Z"/><path d="M290 140Q300 190 310 240" stroke="#26272b" stroke-width="3"/></g>
      <path d="M240 60L350 260" stroke="#111" stroke-width="12"/><path d="M200 240h200" stroke="#000" stroke-width="40"/><ellipse cx="300" cy="262" rx="60" ry="12" fill="#000"/>
      ${carve('THESSAR KA VEN .', 200, 262, 22, { center: true })}`));
    // the shaft and the bier
    const lowered = step >= 6 && !solved;
    s += `<polygon points="560,880 1040,880 980,700 620,700" fill="#000" stroke="#2a2b30" stroke-width="6"/>`;
    if (solved && has('riteHidden')) s += hs('hidden', 'Letters on the rim of the shaft', `<rect x="560" y="880" width="480" height="40" fill="#000" opacity=".01"/>${carve('THESSAROS NHAUR VAL .', 800, 888, 20, { center: true, col: '#9fe3d8', glow: true })}`);
    if (!lowered) s += hs('bier', 'The bier', `<polygon points="600,820 1000,820 960,720 640,720" fill="#3a3530" stroke="#000" stroke-width="4"/>
      ${solved ? '' : `<path d="M660 770Q800 730 940 770Q800 800 660 770Z" fill="#9a9180" stroke="#000" stroke-width="2"/><ellipse cx="900" cy="760" rx="34" ry="20" fill="${done('mask') ? '#8a7f6c' : '#b4ab98'}" stroke="#000" stroke-width="2"/>
      ${done('wax') && !done('mask') ? '<path d="M884 756h12M904 756h12" stroke="#2b2b2b" stroke-width="5"/>' : ''}${done('mask') ? '<path d="M884 754Q890 750 896 754M904 754Q910 750 916 754" stroke="#000" stroke-width="3" fill="none"/>' : ''}
      ${done('wash') ? '<path d="M680 772Q800 742 930 770" stroke="#a9c3c9" stroke-opacity=".5" stroke-width="4" fill="none"/>' : ''}
      <rect x="760" y="752" width="44" height="26" fill="#5b5448" stroke="#000" stroke-width="2"/>${done('name') ? '<path d="M760 752l22 26l22 -26" stroke="#000" stroke-width="3" fill="none"/>' : ''}`}
      ${carve('SHEM KRAK . SKETH ORR . AKHUK THESS . MUL DAL . KHOL ZHA . SKETH NHAUR VAL .', 800, 830, 10, { center: true })}`);
    else s += `<ellipse cx="800" cy="790" rx="150" ry="40" fill="url(#gTealSoft)" class="breathe"/>`;
    // the stations
    s += hs('tablet', 'A small table with a mallet', `<polygon points="250,830 430,830 410,900 270,900" fill="#2c2924" stroke="#000" stroke-width="3"/><rect x="280" y="800" width="60" height="30" fill="#5b5448" stroke="#000" stroke-width="2"/><path d="M360 820l50 -40" stroke="#4c4330" stroke-width="8"/><rect x="395" y="770" width="30" height="20" fill="#3b3a36" transform="rotate(-40 410 780)"/>`);
    s += hs('basin', 'A stone basin', `<path d="M480 700Q480 760 560 760Q640 760 640 700Z" fill="url(#gStoneV)" stroke="#000" stroke-width="3"/><ellipse cx="560" cy="700" rx="80" ry="16" fill="${done('wash') ? '#14181a' : '#2b4248'}" stroke="#000" stroke-width="3"/><rect x="545" y="760" width="30" height="80" fill="#26272b"/>`);
    s += hs('wax', 'A pot of wax and a candle', `<rect x="640" y="590" width="50" height="40" fill="#5d4f3a" stroke="#000" stroke-width="2"/><rect x="700" y="560" width="14" height="70" fill="#d6cdb5"/><path class="flame" d="M707 540Q713 552 711 560Q707 562 703 560Q701 552 707 540Z" fill="#e9dcb8"/>`);
    s += hs('mask', 'A mask on a pedestal', `<rect x="930" y="600" width="50" height="60" fill="url(#gStoneV)" stroke="#000" stroke-width="2"/>${done('mask') ? '' : '<ellipse cx="955" cy="578" rx="26" ry="32" fill="#8a7f6c" stroke="#000" stroke-width="2"/><path d="M943 572Q949 568 953 572M957 572Q961 568 967 572" stroke="#000" stroke-width="3" fill="none"/>'}`);
    s += hs('bell', 'A bronze bell', `<path d="M1060 380H1160M1110 380V420" stroke="#2a2b30" stroke-width="8"/><path d="M1080 480Q1080 420 1110 420Q1140 420 1140 480L1150 490H1070Z" fill="url(#gBronze)" stroke="#000" stroke-width="3"/><circle cx="1110" cy="496" r="7" fill="#2a2418"/>`);
    s += hs('crank', 'The bier’s winch', `<rect x="1230" y="760" width="90" height="160" fill="url(#gStoneV)" stroke="#000" stroke-width="3"/><circle cx="1275" cy="800" r="36" fill="none" stroke="url(#gBronze)" stroke-width="10"/><path d="M1275 800L1310 770" stroke="url(#gBronze)" stroke-width="8"/>
      <path d="M1230 790Q1100 760 1000 760" stroke="#2a2b30" stroke-width="4" stroke-dasharray="8 4" fill="none"/>`);
    s += exit('back', 'Back to the Middle Ring', `<path d="M0 940L60 920V1000H0Z" fill="#000"/><path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + fog(660, 340, .8) + vignette();
  },
  on: {
    relief: () => { Panel.open({ title: 'Two figures', insc: ['kaRelief'], text: P('Two keepers stand at the edge of a shaft. The one on the left holds both hands over its eyes. The one on the right is leaning out, looking down, and the sculptor has struck it through with a single deep cut.') });
      Know.clue('VEN', 'relief', 'under a figure leaning out to look down a shaft'); Know.clue('KA', 'relief', 'under a figure that looks, struck through with a chisel'); Know.rule('ka'); },
    bier: () => Panel.open({ title: 'The bier', insc: ['litany', 'bierPlate'], text: S.keys.rite ? P('Empty. The winch chain is still wet.') : P('A stone bier over a square shaft. On it lies a body wrapped in linen, a clay name-tablet on its chest. Its face is bare.', 'Words run around the rim of the bier in a single line.') + riteNote() }),
    hidden: () => { Know.lore('rite'); Panel.open({ title: 'Under the bier', insc: ['hidden'], text: P('Uncovered where the bier stood. The letters are filled with something faintly luminous.') }); },
    ...Object.fromEntries(['tablet', 'basin', 'wax', 'mask', 'bell', 'crank'].map(k => [k, () => Puzzles.riteStation(k)])),
  },
  exits: { back: { to: 'middle', label: 'Back to the Middle Ring' } },
};
const riteNote = () => (S.puz.rite || 0) ? `<p class="dim">You have begun the rite. ${['', 'The name is broken.', 'The body is washed.', 'The eyes are sealed.', 'The mask is given.', 'The bell has spoken.'][S.puz.rite]}</p>` : '';

/* ---------------- the Lower Ring and the Keepers' Stair ---------------- */
ROOMS.lower = {
  name: 'The Lower Ring', tongue: 'AKHOS', depth: 'Near the bottom of the Throat', mood: 'lower', focus: 800,
  draw() {
    let s = throat({ depth: 2, teal: .7 + keyCount() * .05 });
    s += exit('cell', 'The doorway marked Akhos', arch(800, 600, 120, 200, { glow: '#4fd6c4' }));
    s += hs('signEye', 'Signs over the doorway', `<rect x="720" y="350" width="160" height="40" fill="#000" opacity=".2"/>${carve('AKHOS', 800, 356, 26, { center: true })}`);
    s += ledge();
    s += exit('down', 'The last stair, down', `<polygon points="1180,1000 1600,1000 1600,760 1260,800" fill="#0c0c0e"/>${stairsDown(1420, 820, 300, 7)}`);
    s += hs('signEnd', 'Signs above the last stair', `<rect x="1300" y="700" width="220" height="44" fill="#000" opacity=".25"/>${carve('DURN KRUL', 1410, 708, 26, { center: true })}`);
    s += hs('relief', 'A keeper carved into the wall', `<path d="M0 560H260V1000H0Z" fill="#1b1c20" stroke="#000" stroke-width="4"/><path d="M0 560H260V1000H0Z" fill="url(#pGrain)"/>${keeper(130, 960, 1.4)}
      ${has('stairOpen') ? '<path d="M20 600H240V1000H20Z" fill="#000" opacity=".85"/>' : ''}`);
    s += exit('up', 'The bridge back up', `<polygon points="560,1000 760,1000 740,860 580,860" fill="#202125" stroke="#000" stroke-width="3"/><path d="M630 960l30 -24l30 24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    s += growth(1000, 880, 1.1, 51, 3 + Math.min(4, keyCount()), -2.3) + growth(330, 900, .8, 52, 2, -1);
    return s + fog(480, 520, 1.4) + vignette();
  },
  on: {
    signEye: () => Panel.open({ title: 'Over the doorway', insc: ['signEye'], text: P('A faint turquoise light comes from inside. It does not flicker like a flame.') }),
    signEnd: () => Panel.open({ title: 'Above the last stair', insc: ['signEnd'], text: P('The stair goes down further than the lamp can follow.') }),
    relief: () => Panel.open({ title: 'A carved keeper', text: has('stairOpen') ? P('The relief has swung back on a pivot. Behind it, a narrow stair climbs into the rock.') : P('A keeper in relief, life-sized, hands over its eyes like all the others. But here the hands are a separate piece of stone, and they are loose.'),
      actions: has('stairOpen') ? [{ label: 'Climb the narrow stair', fn: () => Scene.go('stair') }] : [{ label: 'Pull the keeper’s hands from its eyes', fn: () => { setFlag('stairOpen'); S.known.stair = 1; Sound.sfx('stone'); say('The hands come away. Behind them the eyes are open. The whole relief swings inward on a pivot.'); Scene.render(); } }] }),
  },
  exits: { up: { to: 'middle', label: 'Back over the bridge' }, cell: { to: 'cell', label: 'The doorway of light' }, down: { to: 'door', label: 'The last stair' } },
  enter(first) { if (first) setTimeout(() => say('Here the dark below is not black. It is the colour of deep water with light under it.'), 900); },
};

ROOMS.stair = {
  name: 'The Keepers’ Stair', depth: 'A hidden way', mood: 'lower', focus: 800,
  draw() {
    let s = `<rect width="1600" height="1000" fill="#050506"/><path d="M300 0Q800 200 1300 0V1000H300Z" fill="#141518"/><path d="M300 0Q800 200 1300 0V1000H300Z" fill="url(#pGrain)"/>`;
    for (let i = 0; i < 10; i++) { const y = 1000 - i * 70, w = 900 - i * 40; s += `<path d="M${800 - w / 2} ${y}Q800 ${y - 60} ${800 + w / 2} ${y}V${y - 26}Q800 ${y - 86} ${800 - w / 2} ${y - 26}Z" fill="hsl(220,5%,${f(16 - i * 1.3)}%)" stroke="#000" stroke-width="2"/>`; }
    s += hs('marks', 'Chalk marks on the wall', Array.from({ length: 30 }, (_, i) => `<path d="M${330 + (i % 10) * 18} ${200 + (i / 10 | 0) * 60}v40" stroke="#d6d2c8" stroke-opacity=".5" stroke-width="3"/>`).join('') + Array.from({ length: 30 }, (_, i) => `<path d="M${1110 + (i % 10) * 16} ${260 + (i / 10 | 0) * 60}v40" stroke="#d6d2c8" stroke-opacity=".35" stroke-width="3"/>`).join(''));
    s += hs('lantern', 'A cold lantern', `<rect x="760" y="760" width="60" height="80" rx="6" fill="#26241f" stroke="#000" stroke-width="3"/><path d="M770 760Q790 730 810 760" stroke="#26241f" stroke-width="5" fill="none"/><rect x="772" y="776" width="36" height="46" fill="#0d0d0c"/><rect x="840" y="830" width="80" height="16" fill="#cfc6ae" transform="rotate(-10 880 838)"/>`);
    s += exit('up', 'Up, towards the Hall of Letters', `<path d="M700 300Q800 260 900 300V420H700Z" fill="#000"/><path d="M770 380l30 -24l30 24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    s += exit('down', 'Down, to the Lower Ring', `<path d="M300 1000V900H460V1000Z" fill="#000"/><path d="M350 940l30 24l30 -24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + vignette();
  },
  on: {
    marks: () => Panel.open({ title: 'Chalk marks', text: P('Tallies, hundreds of them, in your own kind of chalk. Some are in a steady hand. The last rows are not.') }),
    lantern: () => { Know.lore('orvane3'); Panel.open({ title: 'Orvane’s lantern', text: P('A lantern, cold, and a page weighed down under it:', '<span class="common">“I could read it all now. I wish I could not. Every inscription is the same warning in a different room. I am going back up. I keep counting the steps and getting a different number. Something else is counting too.”</span>', 'There is no sign of Orvane.') }); },
  },
  exits: { up: { to: 'letters', label: 'Up the hidden stair' }, down: { to: 'lower', label: 'Down to the Lower Ring' } },
  enter() { setFlag('stairOpen'); S.known.letters = 1; },
};
const f = Art.f1;

/* ---------------- V. the Cell of Ishvel ---------------- */
ROOMS.cell = {
  name: 'The Cell of Ishvel', tongue: 'AKHOS', depth: 'Chamber V', mood: 'cell', focus: 800,
  draw() {
    const solved = !!S.keys.gaze;
    let s = `<rect width="1600" height="1000" fill="#040506"/><path d="M60 1000Q20 500 200 220Q500 40 800 50Q1100 40 1400 220Q1580 500 1540 1000Z" fill="#151719"/><path d="M60 1000Q20 500 200 220Q500 40 800 50Q1100 40 1400 220Q1580 500 1540 1000Z" fill="url(#pGrain)"/>
      <path d="M60 1000Q20 500 200 220Q500 40 800 50Q1100 40 1400 220Q1580 500 1540 1000Z" fill="url(#gTealUp)" opacity="${solved ? .9 : .5}"/>`;
    s += hs('ceiling', 'Something drawn on the ceiling', `<path d="M420 120Q800 30 1180 120Q800 190 420 120Z" fill="#0d0f10" stroke="#5f6b68" stroke-width="3"/><ellipse cx="840" cy="118" rx="140" ry="28" fill="none" stroke="#5f6b68" stroke-width="2"/><ellipse cx="840" cy="118" rx="80" ry="16" fill="none" stroke="#5f6b68" stroke-width="2"/>`);
    let lines = '';
    INSC.testament.t.split('|').forEach((l, i) => lines += carve(l, 800, 210 + i * 46, 26, { center: true, col: '#b4b9ae' }));
    s += hs('testament', 'Writing on the far wall', `<rect x="430" y="190" width="740" height="290" fill="#0c0d0e" opacity=".6"/>${lines}`);
    if (solved) s += hs('counted', 'New letters on the wall', carve('NHAURITH ZHAALARUK KRENN .', 800, 492, 22, { center: true, col: '#8ff1e3', glow: true }));
    // the apparatus: mirrors in a grid over a crack full of light
    s += hs('mirrors', 'Mirrors standing over a crack in the floor', `<path d="M600 960L640 820L720 760L780 680L820 660L860 700L900 620" stroke="#7ff0e0" stroke-width="10" fill="none" opacity=".35" filter="url(#fBlur)"/><path d="M600 960L640 820L720 760L780 680L820 660L860 700L900 620" stroke="#b9fff4" stroke-width="2" fill="none"/>
      <polygon points="520,900 1080,900 1000,640 600,640" fill="#0b0d0e" opacity=".6" stroke="#2a2d2e" stroke-width="3"/>
      ${[[620, 860], [720, 820], [860, 840], [960, 860], [680, 720], [800, 700], [900, 730], [760, 650]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect x="-4" y="0" width="8" height="40" fill="#2a2b2e"/><rect x="-22" y="-36" width="44" height="40" fill="#5d7a77" stroke="#000" stroke-width="3" transform="skewY(${i % 2 ? 20 : -20})"/></g>`).join('')}`);
    s += hs('blind', 'A black stone', `<path d="M180 900Q170 760 260 740Q350 730 360 880Z" fill="#020202" stroke="#141516" stroke-width="3"/>${carve('NUL', 268, 820, 20, { center: true, col: '#55575c' })}`);
    s += hs('plate', 'A bronze plate', `<rect x="420" y="760" width="140" height="70" fill="url(#gBronze)" stroke="#000" stroke-width="3"/>${carve('AKH NHAUR NUL DAL .', 490, 786, 10, { center: true, col: '#d8cba8' })}`);
    s += hs('seat', 'A stone seat', `<path d="M1220 900V720Q1220 690 1260 690H1380Q1420 690 1420 720V900Z" fill="url(#gStoneV)" stroke="#000" stroke-width="4"/><rect x="1240" y="790" width="160" height="40" fill="#24262a" stroke="#000" stroke-width="3"/>
      ${carve('ZHAALAR', 1320, 728, 20, { center: true })}${solved ? '<ellipse cx="1320" cy="800" rx="120" ry="60" fill="url(#gTeal)" opacity=".4"/>' : ''}`);
    s += exit('back', 'Back to the Lower Ring', `<path d="M640 1000L700 950H900L960 1000Z" fill="#0c0c0e"/><path d="M770 985l30 -22l30 22" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    return s + fog(560, 440, .8) + vignette();
  },
  on: {
    ceiling: () => { Know.lore('plan'); setFlag('lid'); Panel.open({ title: 'The ceiling', insc: ['plan'].filter(x => INSC[x]), text: P('Scratched into the rock overhead, very old: a plan of Thessaros as seen from above. The Threshold at one corner. The three rings. The five chambers in a line along the top. The Door at the very centre.',
      'Drawn this way the shape is unmistakable. It is a closed eye. The five chambers are set along its lid like stitches. On the lid, one word.') }); Know.confirm('DURN', true); },
    testament: () => { Panel.open({ title: 'The oldest writing', insc: ['testament'], text: P('Rougher than anything above, cut by a hand that was not used to cutting. This is where the Tongue was first written down.',
      'Every inscription in the temple writes <i>nhaur</i>, the deep. Here, once, the same word goes on: <i>nhaurith</i>. You have seen <i>-ith</i> before, on a child’s slate: <i>zhaalith</i>, she who speaks.') });
      Know.rule('ith'); if (!has('name')) { setFlag('name'); note('Codex', '<i>nhaur</i> was never a place. <i>Nhaurith</i>: she who is the deep. Every inscription that names the deep has been naming her.', 'good'); } },
    counted: () => { Know.lore('counted'); Panel.open({ title: 'New letters', insc: ['counted'], text: P('They were not there when you came in.') }); Know.confirm('KRENN', true); },
    mirrors: () => Puzzles.lens(),
    blind: () => Panel.open({ title: 'The black stone', insc: ['blind'], text: P('A boulder of stone so dark the light seems to sink into it. Where light falls on it, nothing is lit.') }),
    plate: () => Panel.open({ title: 'A bronze plate', insc: ['keepersPlate'], text: P('Fixed beside the mirrors, newer than everything else in the cell. The keepers’ instructions.') }),
    seat: () => Panel.open({ title: 'The seat', insc: ['seat'], text: S.keys.gaze ? P('Still warm.') : P('A seat cut from the rock, facing the mirrors. A small recess under the seat is closed by a lid of dark glass. The light in this room never quite reaches it.') }),
  },
  exits: { back: { to: 'lower', label: 'Back to the Lower Ring' } },
};
INSC.plan = { at: 'The Cell of Ishvel, scratched into the ceiling', t: 'DURN', read: 'The lid.' };

/* ---------------- the Door at the End ---------------- */
ROOMS.door = {
  name: 'The Door at the End', tongue: 'DURN KRUL', depth: 'The bottom of Thessaros', mood: 'door', focus: 800,
  draw() {
    const open = has('doorOpen');
    let s = `<rect width="1600" height="1000" fill="#030304"/><path d="M0 0H1600V1000H0Z" fill="#111214"/><rect width="1600" height="1000" fill="url(#pGrain)"/>
      <path d="M0 1000L200 860H1400L1600 1000Z" fill="#1a1b1e"/>`;
    s += hs('lintel', 'Words cut above the door', `<rect x="560" y="110" width="480" height="50" fill="#000" opacity=".25"/>${carve('DURN AKH NHAURITH .', 800, 118, 30, { center: true })}`);
    s += DoorArt.scene(open);
    s += exit('up', 'Back up the stair', `<path d="M40 1000V720L200 760V1000Z" fill="#000"/><path d="M90 860l30 -24l30 24" stroke="#6b6e75" stroke-width="5" fill="none"/>`);
    if (open) s += exit('abyss', 'Step through, into the dark', '<path d="M420 520Q800 330 1180 520Q800 700 420 520Z" fill="#000" opacity=".01"/>');
    return s + fog(650, 350, .9) + vignette();
  },
  on: {
    lintel: () => Panel.open({ title: 'Above the door', insc: ['lintel'], text: P('The letters are cut so deep a hand fits in them.') }),
    door: () => { Know.lore('door'); Door.open(); },
  },
  exits: { up: { to: 'lower', label: 'Back up the stair' }, abyss: { to: 'abyss', label: 'Into the dark' } },
};

/* ---------------- hints ---------------- */
function currentHint() {
  const r = S.room, need = (g, title, ...tiers) => ({ goal: g, title, tiers });
  if (!has('arch')) return need('arch', 'The great word', 'The surveyor’s marker and the pack at the Threshold both have something to say about the arch.',
    'Nine signs, and the fourth, fifth and ninth are the same. You already know a nine-letter word that people use for this place.', 'Read the great word over the arch as THESSAROS: one letter under each sign.');
  if (!has('alphabet')) return need('abc', 'The scribes’ wall', 'The wall in the Hall of Letters lays out every sign. Fill in the sounds you know and look at where they fall.',
    'Every sign in the top row wears the Eye. A, E and O are there. The last row has a single sign, like the last letter of your own alphabet. The barbs count along each row.', 'The rows run in the order of your own alphabet: the top row is A E I O U, then B C D F G, H J K L M, N P Q R S, T V W X Y, and Z alone. Complete two rows yourself and the rest follows.');
  if (['names'].includes(r) && !S.keys.names) return need('names', 'The six names', 'Each plinth holds a thing; each prism should show that thing’s name. The same words are carved elsewhere in the temple, beside the very things they name.',
    'Look beside the lamp niches and the unused building blocks on the Upper Ring, the serpent statue’s plinth, the key tag on the scribes’ desk, and the line over the inner door. Your journal lists the clues for each word.', 'stone: vorz. lamp: lum. key: ghaz. door: durn. serpent: ouroth. eye: akh.');
  if (['archive', 'stacks'].includes(r) && !S.keys.chronicle) {
    const missing = ['fTL', 'fTR', 'fML', 'fMR', 'fBL', 'fBR'].filter(i => !has('took:' + i)).length;
    if (missing) return need('frags', 'The broken stele', `The stele has six parts, and ${missing} ${missing === 1 ? 'is' : 'are'} still missing. They were scattered across the hall, and some were put out of reach.`,
      'Look under the rubble, on the high ledge (the fallen statue makes a way up), and beyond the crack in the right wall.', 'One piece is on the ledge (climb the toppled statue), one under the rubble, and one in a sealed jar in the Stacks.');
    return need('stele', 'The broken stele', 'The carved border and the shape of each break tell you where most pieces go. One fragment of warmer stone fits a place it does not belong.',
      'Words run across the breaks. A line that only makes sense with one piece is the right piece: read the words that straddle the middle seam.', 'The warmer fragment is from another, older stele. Leave it out. The piece from the rubble belongs in the middle on the left.');
  }
  if (!S.keys.names || !S.keys.chronicle) return need('ring1', 'The Upper Ring', 'Two doorways open off the Upper Ring. Each chamber holds a key, and each key slackens one of the chains on the gate down.', `You still need the ${!S.keys.names ? 'Key of Names (Shemos, on the left)' : 'Key of the Chronicle (Zhaalos, on the right)'}.`);
  if (['engine', 'cistern'].includes(r) && !S.keys.coil) {
    if (!has('handleSet')) return need('handle', 'The broken crank', 'The right crank is missing its handle. Water collects in the room next door.', 'Look in the water of the Cistern, near the drain.');
    return need('coil', 'The three rings', 'The table on the wall shows every serpent looking up at the closed eye. Each crank turns two rings at once, and only forwards.',
      'Set the outer ring first, then the inner. A full turn of one ring brings it back to where it was, but drags the ring it is geared to along with it.', 'From the start: left crank 5 times, then right crank 10 times. Or: left crank 13 times and right 6.');
  }
  if (r === 'chapel' && !S.keys.rite) return need('rite', 'The last rite', 'The line around the bier is the rite, step by step, each deed last in its sentence. The stations in the room each perform one deed.',
    'The relief shows two keepers: one looks, one does not, and the one who looked was struck out. Start at the closed-eye mark on the rim and read on.', 'Break the name-tablet, wash the body at the basin, seal the eyes with wax, give the mask, ring the bell, then lower the bier with your eyes turned away.');
  if (!S.keys.coil || !S.keys.rite) return need('ring2', 'The Middle Ring', 'The bridge across the Throat needs both chambers of the Middle Ring.', `You still need the ${!S.keys.coil ? 'Key of the Coil (Murros, on the left)' : 'Key of the Rite (Valos, on the right)'}.`);
  if (r === 'cell' && !S.keys.gaze) return need('lens', 'The mirrors', 'The light spells something as it passes through the lenses. The plate says what the keepers did with it; the seat says who it is for.',
    'Read the oldest writing on the wall: it holds a name written whole, the only place it ever was. The light must spell that name and then fall on the reader’s seat.', 'Spell NHAURITH: N, H, A, U, R, then turn up through I, right through T, up again, and left through H onto the seat.');
  if (!S.keys.gaze) return need('cell', 'The last chamber', 'The doorway on the Lower Ring glows. Ishvel’s cell holds the fifth key.');
  if (!has('doorOpen')) return need('door', 'The Door at the End', 'Each lock is different. Examine it before forcing the key.',
    'The lid-plates lie over one another: only the one on top can move. The wheel wants the word for what you want the door to do.', 'Set the wheel to GHUL: to open.');
  return need('end', 'The end', 'There is nothing left to open.');
}
