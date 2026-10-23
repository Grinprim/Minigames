// The Tongue of Thessaros: lexicon, grammar, every inscription in the temple, and how a line is glossed
// from what the player currently knows. Nothing here touches the DOM.

/* ---------------- lexicon ----------------
   m: the meaning once confirmed. cat: noun / verb / particle / name.
   more: extra senses that surface when a flag is set (the language keeps a few secrets). */
const LEX = {
  NHAUR:  { m: 'the deep; what lies below', cat: 'noun', more: { name: 'never a place: her name, cut short. The scribes would not write it whole.' } },
  AKH:    { m: 'eye', cat: 'noun' },
  VEN:    { m: 'see, look, watch', cat: 'verb' },
  VAL:    { m: 'go down, descend; said of the dead: to die', cat: 'verb' },
  THESS:  { m: 'keep shut, bind, hold closed', cat: 'verb' },
  ZHAAL:  { m: 'word, speech; the Tongue itself', cat: 'noun' },
  ZHA:    { m: 'speak, sound', cat: 'verb' },
  DURN:   { m: 'door', cat: 'noun', more: { lid: 'also: lid. The lid of an eye.' } },
  GHUL:   { m: 'open', cat: 'verb' },
  GHAZ:   { m: 'key', cat: 'noun', more: { scale: 'also: scale, as on a serpent.' } },
  OUROTH: { m: 'serpent, coil', cat: 'noun' },
  VORZ:   { m: 'stone', cat: 'noun' },
  LUM:    { m: 'lamp, light', cat: 'noun' },
  SHEM:   { m: 'name', cat: 'noun' },
  ISHVEL: { m: 'Ishvel, a woman’s name: the first to go down and come back', cat: 'name' },
  ZARG:   { m: 'god', cat: 'noun' },
  SHA:    { m: 'devour, consume, end', cat: 'verb' },
  KRUL:   { m: 'the end, the last', cat: 'noun' },
  NUL:    { m: 'nothing, the void', cat: 'noun' },
  MURR:   { m: 'sleep', cat: 'verb' },
  RHA:    { m: 'wake, stir', cat: 'verb' },
  KRENN:  { m: 'count, reckon', cat: 'verb' },
  SKETH:  { m: 'body, flesh; the dead body', cat: 'noun' },
  ORR:    { m: 'pour, wash', cat: 'verb' },
  MUL:    { m: 'mask, a face that is not yours', cat: 'noun' },
  DAL:    { m: 'give, place', cat: 'verb' },
  KRAK:   { m: 'break', cat: 'verb' },
  KHOL:   { m: 'bell', cat: 'noun' },
  KA:     { m: 'not; it stands before the deed it refuses', cat: 'particle' },
};

// Suffixes, each tied to the grammar rule that explains it.
const SUFFIX = { UK: 'uk', AR: 'ar', OS: 'os', ITH: 'ith' };
const SFX_GLOSS = { UK: 'all / many', AR: 'one who', OS: 'place of', ITH: 'she who is' };
// Smooth English for the derived words that appear in the temple.
const DERIVED = {
  THESSAR: 'keeper', THESSARUK: 'the keepers', THESSAROS: 'Thessaros, the place of the keepers',
  VALAR: 'one who has gone down', VALARUK: 'the dead, all who have gone down', VALOS: 'the place of going down',
  ZHAALAR: 'reader, one who knows the words', ZHAALARUK: 'the readers', ZHAALOS: 'the place of words', ZHAALITH: 'she who speaks',
  NHAURITH: 'Nhaurith: she who is the deep', KRULITH: 'she who is the end', AKHUK: 'the eyes', AKHOS: 'the place of the eye',
  GHAZUK: 'the keys', OUROTHUK: 'the serpents', ZARGUK: 'all the gods', SHEMOS: 'the place of names', MURROS: 'the place of sleep',
};

/* ---------------- grammar ---------------- */
const RULES = {
  script: { t: 'One sign, one sound', d: 'Each serpent is a single sound. Its head names the family; the barbs across its body count along the row. The Eye-headed signs are the open sounds, the vowels. A small diamond ends a sentence.' },
  order:  { t: 'The deed comes last', d: 'The one who acts comes first, then what is acted upon, and the deed always last. <i>Nhaur zarguk sha</i>: the deep, all gods, devours.' },
  poss:   { t: 'The thing, then its owner', d: 'A thing stands before whoever owns it. <i>Akh nhaur</i>: eye, deep, so “the eye of the deep”. <i>Durn krul</i>: “the door of the end”.' },
  uk:     { t: '-UK: all of them', d: '<i>Zarg</i> is a god; <i>zarguk</i> is every god. <i>-uk</i> makes a word many.' },
  ar:     { t: '-AR: the one who does it', d: '<i>Thess</i> is to keep shut; a <i>thessar</i> is one who keeps it shut. Added to a thing, it is the one who works with it: <i>zhaalar</i>, one who knows the words, a reader.' },
  os:     { t: '-OS: the place of', d: '<i>Shem</i> is a name; <i>Shemos</i> is the place of names. So <i>Thessaros</i> is the place of the keepers.' },
  ka:     { t: 'KA: not', d: '<i>Ka</i> stands before the deed and refuses it. <i>Thessar ka ven</i>: the keeper does not look. On its own it commands: <i>ka val</i>, do not go down. With no deed at all, it ends the line: <i>nhaur vorz ka</i>, the deep is not stone.' },
  ith:    { t: '-ITH: she who is', d: 'Added to a word, <i>-ith</i> makes a woman, or a power that is one: <i>zhaalith</i>, she who speaks. <i>Krulith</i>, she who is the end. And <i>nhaur</i>, the deep, becomes <i>Nhaurith</i>, she who is the deep.' },
  nobe:   { t: 'No word for “is”', d: 'The Tongue sets two things side by side and lets them be one. <i>Nhaur krul</i>: the deep, the end. “The deep is the end.”' },
};

/* ---------------- inscriptions ----------------
   t: the text in the Tongue (lines separated by |). at: where it is found. read: a fluent reading, offered once every
   word is understood. late: a second reading that only makes sense after a flag. */
const INSC = {
  arch:      { at: 'The Threshold, carved across the arch', t: 'THESSAROS', read: 'Thessaros: the place of those who keep it shut.' },
  arch2:     { at: 'The Threshold, small letters under the arch', t: 'AKH NHAUR VEN . KA VAL .', read: 'The eye of the deep is watching. Do not go down.',
               late: { flag: 'name', read: 'Her eye is watching. Do not go down to her. It was the first thing they ever said to you.' } },
  abc:       { at: 'The Hall of Letters, above the scribes’ wall', t: 'ZHAAL', read: 'The Tongue.' },
  doorL:     { at: 'The Hall of Letters, the lintel of the inner door', t: 'ZHAALAR DURN GHUL .', read: 'The one who reads opens the door.',
               late: { flag: 'lid', read: 'The one who reads opens the lid. They built the first door of the temple to say it.' } },
  grate:     { at: 'The Hall of Letters, around the iron grate in the floor', t: 'NHAUR', read: 'The deep.', late: { flag: 'name', read: 'Her.' } },
  keytag:    { at: 'The Hall of Letters, a tag on the scribe’s ring', t: 'GHAZ', read: 'Key.' },
  mural:     { at: 'The Hall of Letters, the painted wall', t: 'OUROTH AKH THESS .', read: 'The serpent keeps the eye shut.',
               late: { flag: 'name', read: 'The serpent keeps the eye shut. The serpent and the eye are the same creature.' } },
  slate:     { at: 'The Hall of Letters, a child’s slate', t: 'ISHVEL ZHAALITH .', read: 'Ishvel, she who speaks. A child copying a name every child knew.' },
  keeper:    { at: 'The Upper Ring, the plinth of a hooded statue', t: 'THESSAR', read: 'Keeper.' },
  serpent:   { at: 'The Upper Ring, the plinth of the serpent statue', t: 'OUROTH', read: 'Serpent.' },
  quarry:    { at: 'The Upper Ring, a mason’s block', t: 'VORZ', read: 'Stone.' },
  lamp:      { at: 'The Upper Ring, beside a lamp niche', t: 'LUM', read: 'Lamp.' },
  portcullis:{ at: 'The Upper Ring, the gate to the stair', t: 'THESSAROS DURN THESS .', read: 'Thessaros keeps the door shut.',
               late: { flag: 'lid', read: 'Thessaros keeps the lid shut. The whole city was the hand that holds an eyelid down.' } },
  signNames: { at: 'The Upper Ring, over a doorway', t: 'SHEMOS', read: 'The place of names.' },
  signWords: { at: 'The Upper Ring, over a doorway', t: 'ZHAALOS', read: 'The place of words.' },
  underside: { at: 'The Hall of Names, under the empty prism', t: 'SHEM NHAUR KA ZHA .', read: 'Do not speak the name of the deep.',
               late: { flag: 'name', read: 'Do not speak her name. They had stopped calling it a place long before they carved this.' } },
  leverN:    { at: 'The Hall of Names, the release lever', t: 'SHEM THESS .', read: 'The name holds.' },
  stele:     { at: 'The Hall of Words, the Chronicle stele', t: 'VALARUK NHAUR VAL .|ISHVEL NHAUR VAL .|AKH NHAUR GHUL .|NHAUR ZARGUK SHA .|THESSARUK DURN THESS .|DURN KRUL GHUL .',
               read: 'The dead go down into the deep. Ishvel went down into the deep. The eye of the deep opened. The deep devoured every god. The keepers shut the door. At the end, the door opens.' },
  forgery:   { at: 'The Hall of Words, a fragment of a second stele', t: 'VALARUK KRULITH DAL .|KRULITH VALARUK VEN .', read: 'We give the dead to she who is the end. She who is the end sees the dead.' },
  stacks:    { at: 'The Stacks, a tablet on the last shelf', t: 'ZARGUK NHAUR VAL . NHAUR KRUL .', read: 'All the gods go down into the deep. The deep is the end.' },
  rail:      { at: 'The Middle Ring, the rail above the Throat', t: 'NHAUR KA VEN .', read: 'Do not look into the deep.', late: { flag: 'name', read: 'Do not look at her.' } },
  signSleep: { at: 'The Middle Ring, over a doorway', t: 'MURROS', read: 'The place of sleep.' },
  signDown:  { at: 'The Middle Ring, over a doorway', t: 'VALOS', read: 'The place of going down.' },
  breath:    { at: 'The Engine of Sleep, the breath table', t: 'OUROTHUK AKH VEN . NHAUR MURR .', read: 'When the serpents look upon the eye, the deep sleeps.' },
  cistern:   { at: 'The Cistern, a tablet in the silt', t: 'NHAUR RHA . THESSARUK KRENN .', read: 'The deep stirs. The keepers count.' },
  mosaic:    { at: 'The Cistern floor, uncovered when the water fell', t: 'GHAZUK DURN THESS .', read: 'The keys hold the door shut.',
               late: { flag: 'lid', read: 'The scales hold the lid shut. Five scales of her own body, cut away and set as locks.' } },
  litany:    { at: 'The Chapel of the Last Rite, around the rim of the bier', t: 'SHEM KRAK . SKETH ORR . AKHUK THESS . MUL DAL . KHOL ZHA . SKETH NHAUR VAL .',
               read: 'Break the name. Wash the body. Shut the eyes. Give the mask. Let the bell speak. The body goes down into the deep.' },
  kaRelief:  { at: 'The Chapel of the Last Rite, a relief of two figures', t: 'THESSAR KA VEN .', read: 'The keeper does not look.' },
  bierPlate: { at: 'The Chapel of the Last Rite, the foot of the bier', t: 'SKETH', read: 'The body.' },
  hidden:    { at: 'The Chapel, beneath the bier', t: 'THESSAROS NHAUR VAL . VALARUK KA SHA . VALARUK MURR .', read: 'Thessaros has gone down. The dead are not devoured. The dead are sleeping.' },
  feedOld:   { at: 'The Feeders’ Shrine, the oldest carving', t: 'VALARUK KRULITH DAL .', read: 'We give the dead to she who is the end.' },
  feedNew:   { at: 'The Feeders’ Shrine, cut into the same line later and roughly', t: 'KA', read: 'Not. The keepers forced one word into the prayer, turning it into “Do not give the dead to her.”' },
  signEye:   { at: 'The Lower Ring, over the last doorway', t: 'AKHOS', read: 'The place of the eye.' },
  signEnd:   { at: 'The Lower Ring, above the final stair', t: 'DURN KRUL', read: 'The door of the end.' },
  testament: { at: 'The Cell of Ishvel, the oldest writing in Thessaros', t: 'ISHVEL NHAUR VAL .|NHAUR VORZ KA . NHAUR NUL KA .|AKH ISHVEL VEN .|SHEM NHAURITH .|THESSAROS DURN AKH NHAURITH .|NHAURITH ZHAALAR VEN .',
               read: 'Ishvel went down into the deep. The deep is not stone. The deep is not nothing. An eye saw Ishvel. Her name: Nhaurith. Thessaros is the lid of Nhaurith’s eye. Nhaurith sees the one who reads.' },
  keepersPlate: { at: 'The Cell of Ishvel, a bronze plate by the mirrors', t: 'AKH NHAUR NUL DAL .', read: 'Give the eye of the deep to nothing.' },
  blind:     { at: 'The Cell of Ishvel, the black stone', t: 'NUL', read: 'Nothing.' },
  seat:      { at: 'The Cell of Ishvel, the stone seat', t: 'ZHAALAR', read: 'The reader.' },
  counted:   { at: 'The Cell of Ishvel, letters that were not there before', t: 'NHAURITH ZHAALARUK KRENN .', read: 'Nhaurith counts the readers.' },
  lintel:    { at: 'The Door at the End, the lintel', t: 'DURN AKH NHAURITH .', read: 'The lid of Nhaurith’s eye.' },
  wheelStop: { at: 'The Door at the End, beside the great wheel', t: 'THESSAROS KA GHUL .', read: 'Thessaros does not open.' },
};

/* ---------------- analysis ---------------- */
// Split a word into a root from the lexicon plus suffixes, e.g. THESSARUK -> THESS + AR + UK.
function analyze(w) {
  if (LEX[w]) return { root: w, sfx: [] };
  for (const s of Object.keys(SUFFIX)) if (w.endsWith(s) && w.length > s.length) {
    const r = analyze(w.slice(0, -s.length));
    if (r) return { root: r.root, sfx: [...r.sfx, s] };
  }
  return null;
}
const wordsOf = text => text.split(/[\s|.]+/).filter(Boolean);
