# Make your own

**English** | [日本語](README.ja.md) | [简体中文](README.zh-Hans.md)

Prompts, a render script and two finished examples for making a "names" set of your own: 3 looping videos of 8 cards each, where every card is a small animation that shows what one name means, plus a one-page cheat-sheet image.

You can make it for your own field, in your own language, with your own look.

| | Camera moves (`examples/camera-moves/`) | Motion graphics (`examples/motion-graphics/`) |
|---|---|---|
| Look | light gray, one blue, pictogram style | dark navy cards, four colors |
| Languages | English, Japanese | Japanese |
| | ![Camera moves 01–08](../assets/preview-camera.gif) | ![Motion graphics 01–08](../assets/preview-motion.gif) |

The bundled videos and cheat sheets are the ones that were posted, so they keep the wording used at the time (for example, the Japanese name of 10 is 手持ち風). The name lists in [`packs/`](../packs/README.md) now say 手持ち.

The two examples look different on purpose. This is not a template for one style. What they share is one rule: the name is the subject, and each card shows what that name means.

## What is in here

```
prompts/en, prompts/ja      copy-and-paste prompts for a coding AI / an image AI
render.mjs                  HTML -> mp4 (Playwright + ffmpeg)
examples/camera-moves/
  en/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png
examples/motion-graphics/
  ja/  index.html  video-1of3.mp4  video-2of3.mp4  video-3of3.mp4  cheatsheet.png  cheatsheet-prompt.md
```

| | |
|---|---|
| Videos | 1200x1350, 30fps, H.264 (yuv420p), no audio, 9.4 seconds, seamless loop |
| Cheat-sheet image | made with an image-generation AI from the prompt in `prompts/` |

Each video is one HTML file that draws on a `<canvas>`. There is no build step and no framework, so a coding AI (Claude Code, Codex, Cursor, and so on) can read the whole thing and change it for you.

## Prompts

Give this repository to a coding AI and paste one of these.

| Goal | Prompt |
|---|---|
| The same videos in another language | [`prompts/en/01-translate.md`](prompts/en/01-translate.md) |
| The names of your own field, with your own look | [`prompts/en/02-your-own-field.md`](prompts/en/02-your-own-field.md) |
| The one-page cheat-sheet image | [`prompts/en/03-cheatsheet-image.md`](prompts/en/03-cheatsheet-image.md) |

Japanese versions are in [`prompts/ja/`](prompts/ja/).

Where to edit by hand, in an `index.html`:

- `PAGES` and `ITEMS`: the headings and the 24 names
- `CELLS[0]` to `CELLS[23]`: one drawing function per card
- `C`: colors. `JP`, `EN`, `MONO` / `DISP`: fonts

## Preview

Open `examples/camera-moves/en/index.html` in a browser (Chrome or another Chromium browser is recommended). It plays the loop.

- `?page=2` shows page 2 (pages are 1 to 3)
- `?t=3.5` shows a still at 3.5 seconds

## Render to mp4

You need [Node.js](https://nodejs.org/) 18 or later and [ffmpeg](https://ffmpeg.org/) on your PATH. Run these inside `make-your-own/`.

```bash
cd make-your-own
npm install
npx playwright install chromium

node render.mjs examples/camera-moves/en/index.html --page 1
# -> out/en-page1.mp4

node render.mjs examples/motion-graphics/ja/index.html --all --sheet
# -> out/ja-page1.mp4, ja-page2.mp4, ja-page3.mp4 and a contact sheet PNG for each
```

Options: `--page <n>`, `--all`, `--pages <n>`, `--out <file>`, `--out-dir <dir>`, `--fps <n>`, `--crf <n>`, `--sheet`. Run `node render.mjs --help` for details.

`--sheet` saves one frame per second as a single image. It is the quickest way to check all eight cards for mistakes without watching the loop many times.

### How rendering works

The HTML does not use a real-time clock. Every frame is drawn from its frame number:

| In the HTML | Meaning |
|---|---|
| `window.N_FRAMES` | number of frames in one page (282 = 9.4s x 30fps) |
| `window.renderFrame(i)` | draws frame `i` on `<canvas id="c">` |
| `window.prepareFrame(i)` | optional, may be async |
| `window.READY` | becomes `true` when fonts are loaded |
| `?page=N`, `?render=1` | page to draw / turn off the preview loop |

`render.mjs` calls `renderFrame(i)` for each frame, reads the canvas as PNG, and pipes it into ffmpeg. So no frame is dropped even on a slow machine. Any HTML that follows this contract can be rendered with the same script.

## Fonts

The examples load nothing from the network: no web fonts, no CDN, no images. They use fonts that come with macOS (Helvetica Neue, Avenir Next, Hiragino Sans, SF Mono), and no font files are included in this repository.

The bundled mp4 files were rendered on macOS. On Windows or Linux the browser falls back to other fonts, so the text will look a little different, and the Japanese versions need a Japanese font installed (for example Noto Sans JP). To use another font, change the font constants near the top of `index.html`.

## Notes

- The Japanese HTML files were first written as one 30-second video that goes through the three pages. Here they draw one page per video, like the English one. The bundled Japanese mp4 files are the ones from the original posts, so a new render can differ from them by one frame at hard cuts.
- Code comments inside the example HTML are mostly in Japanese.
- The canvas code uses `roundRect` and `letterSpacing`, which need a recent Chromium. The one Playwright installs works.
- The cards of these two examples are also in the gallery as the `camera` and `motion` packs ([`packs/`](../packs/README.md)). To add your own set there, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## License

[MIT](../LICENSE). You can use the code, videos and images here in your own work, including commercial work. A link back is welcome but not required.
