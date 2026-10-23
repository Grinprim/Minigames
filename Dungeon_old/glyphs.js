// Nul-Ouroth, the serpent script of Thessaros.
// Every letter is a small serpent: a head plus 0-4 barbs across its body.
// Vowels wear the Eye (A=0 barbs .. U=4). Consonants run in alphabetical order
// through five heads, five barb counts each: hook-left B C D F G, hook-right H J K L M,
// fang N P Q R S, crown T V W X Y, bar Z.
const Glyph = (() => {
  const VOW = 'AEIOU', CON = 'BCDFGHJKLMNPQRSTVWXYZ';
  const HEADS = {
    eye:   'M6 5V4.4M3.8 3Q6 0.2 8.2 3Q6 5.8 3.8 3ZM6 1.9V4.1',
    hookL: 'M6 5V2.2Q6 .5 4.3 .8Q2.8 1.2 3.3 3.1',
    hookR: 'M6 5V2.2Q6 .5 7.7 .8Q9.2 1.2 8.7 3.1',
    fang:  'M6 5L3.1 .8M6 5L8.9 .8',
    crown: 'M6 5V3.9M2.9 .9L4.5 3.9L6 1.5L7.5 3.9L9.1 .9',
    bar:   'M6 5V2.8M2.4 2.8H9.6',
  };
  const ORDER = ['hookL', 'hookR', 'fang', 'crown', 'bar'];
  const STEM = 'M6 5C8.6 7.4 3.4 9.8 6 12.4S8.2 16.6 5.4 18.6';
  const BARB_Y = [7.6, 9.8, 12, 14.2];
  const DOT = 'M6 14.4L7.5 16L6 17.6L4.5 16Z';

  function path(ch) {
    ch = ch.toUpperCase();
    const v = VOW.indexOf(ch), c = CON.indexOf(ch);
    let head, n;
    if (v >= 0) { head = 'eye'; n = v; }
    else if (c >= 0) { head = ORDER[c / 5 | 0]; n = c % 5; }
    else if ('.,:;!?'.includes(ch)) return DOT;
    else return null;
    let d = HEADS[head] + STEM;
    for (let i = 0; i < n; i++) d += `M3.5 ${BARB_Y[i] + 1.2}L8.5 ${BARB_Y[i] - 1.2}`;
    return d;
  }

  const adv = ch => ch === ' ' ? 7 : path(ch) === DOT ? 8 : path(ch) ? 11 : 0;

  // Inline SVG of a line of text, 20 units tall.
  function svg(text, cls = 'glyphs') {
    let x = 0, out = '';
    for (const ch of text) {
      const d = path(ch);
      if (d) out += `<path transform="translate(${x} 0)" d="${d}"/>`;
      x += adv(ch);
    }
    return `<svg class="${cls}" viewBox="-1 -1 ${x + 1} 22" role="img" aria-label="serpent script">${out}</svg>`;
  }

  // Glyphs spaced evenly around a circle at (0,0), tops facing outward, clockwise from 12 o'clock.
  function ring(text, r, size, start = 0) {
    const chars = [...text], k = size / 20, step = 360 / chars.length;
    return chars.map((ch, i) => {
      const d = path(ch);
      return d ? `<path transform="rotate(${start + i * step}) translate(0 ${-r}) scale(${k}) translate(-6 -10)" d="${d}"/>` : '';
    }).join('');
  }

  return { path, svg, ring };
})();
