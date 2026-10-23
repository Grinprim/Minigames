# Thessaros

An atmospheric exploration and decipherment game for desktop and mobile browsers. You learn a dead serpent script,
open five chambers, and go down through the Door at the End to meet Nhaurith, the One Below.

## Launch

Open `index.html` in a current browser (Chrome, Edge, Firefox or Safari, desktop or mobile). You don't need a server or a build step.
If your browser blocks local files, serve the folder instead, for example `python -m http.server` in this folder and then open http://localhost:8000.

Sound is synthesized live with the Web Audio API and starts after the first click. Mute with **S** or the speaker button.
The game saves itself in browser storage (`thessaros.v3`). An older `thessaros2` save is detected, then ignored and left untouched.

Keys: **J** journal, **M** map, **H** hint, **S** sound, **Esc** close, **arrow keys** look around, **Tab / Enter** to examine things.

## Testing progression

- `index.html?dev` shows a panel with *Know the script*, *All five keys* (puts you at the Door with unturned keys),
  *Door opened* (straight to the reveal) and *Reset*. Under **PLAY**, *Key award*, *Door opening* and *Reveal* play those
  animations on the spot, as often as you like, from any save (they grant whatever state the animation needs).
- **Settings → Begin a new expedition** wipes the save. After you've seen the ending, **Settings → Watch the end again** replays it, and a Skip button is available.
- `dm-guide.html` has every solution, the full language and the reveal timeline.

## Files

| File | What it holds |
|---|---|
| `index.html` | The page shell and script order |
| `temple.css` | All styling, responsive layout, reduced-motion rules |
| `glyphs.js` | The serpent-script glyph generator |
| `lang.js` | Lexicon, grammar rules, every inscription, word analysis |
| `engine.js` | Save/load, knowledge model, Web Audio sound, panel / close-up / journal / map / hints / settings, scene runtime |
| `art.js` | Shared SVG defs and the procedural illustration kit |
| `world.js` | Every room: art, examinable things, exits, lore, items, hints |
| `puzzles.js` | The first reading, the scribes' wall and the five chamber mechanisms |
| `door.js` | The Door at the End: locks, lid-plates, wheel and the opening |
| `nhaurith.js` | Nhaurith's canvas renderer and the timed reveal |
| `dm-guide.html` | Spoiler guide |

The two reference images (`image 1.png`, `image 2.png`) are not used by the game. Nhaurith is drawn procedurally
from them at load time (baked canvas textures for her hide, head, iris and coils), so the game needs no image assets.
