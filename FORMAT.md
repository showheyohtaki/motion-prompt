# Motion Prompt — pack and API format

English | [简体中文](FORMAT.zh-Hans.md)

Motion Prompt is a library of names: the words a field uses for the things you ask an AI to make, each
with a moving sample. Each element is a small, dependency-free Canvas 2D animation that is a
**pure function of time**, with its name and a one-line meaning in several languages, an example
of how to ask for it, and a copyable prompt (ja/en/zh-Hans), so people can tell Claude Code / Codex
"use #012 and #045" or "swap this title for #005".

Repo: GitHub `showheyohtaki/motion-prompt` (MIT) → GitHub Pages
`https://showheyohtaki.github.io/motion-prompt/`. Author: 大滝昇平 / Shohei Ohtaki (@showheyohtaki).
No build framework. The gallery, the packs, the API and the skill are plain HTML/CSS/JS and Node 18+
scripts with zero npm dependencies. Only `make-your-own/` (rendering your own videos) has a
`package.json`; it needs Playwright and ffmpeg.

## Layout

```
index.html  assets/{runtime.js,site.css,site.js,catalog.js*}   the gallery site (* = generated)
packs/<pack>/pack.js  packs/<pack>/meta.json  (optional fonts/)   source of truth
packs/README.md  packs/<pack>/README.md  README.<lang>.md*   the name lists, readable on GitHub (* = generated)
api/v1/…                                   generated static API (committed)
tools/build.mjs  tools/check.mjs           generators / checks
skills/motion-prompt/{SKILL.md,scripts/motion-prompt.mjs,references/}   the agent skill
.claude-plugin/{plugin.json,marketplace.json}
dev/preview.html                           per-pack preview
make-your-own/                             prompts, render script and two example sets for making your own
```

Packs and their order (global IDs are assigned in this order, 3 digits; new packs are appended):

| order | pack | elements | IDs | title |
|---|---|---|---|---|
| 1 | `motion` | 24 | 001–024 | Motion graphics moves / モーショングラフィックスの動き |
| 2 | `camera` | 24 | 025–048 | Camera moves & transitions / カメラワークと切り替え |
| 3 | `ui` | 24 | 049–072 | UI component names / UIパーツの名前 |
| 4 | `lp` | 24 | 073–096 | Landing page & web effects / LP・Webサイトの演出 |
| 5 | `photo` | 24 | 097–120 | Photo looks, lighting & styles / 写真の表現・光と画風 |

**Once the repository is public, numbers are never renumbered and published names are not renamed.**
A new pack takes the next `order` and the next free IDs. An element is added at the end of its pack
only if that pack is the last one; otherwise it goes into a new pack.

## packs/<pack>/pack.js

```js
/* Motion Prompt · pack "<pack>" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('<pack>', function () {
  // @kit
  // constants (CW, CH, CYC, palette C, fonts) and helpers shared by the whole pack
  const CELLS = [];

  // @element 01
  // one-line description
  CELLS[0] = (k, w, h, u) => { ... };

  // @shared
  // helpers used by several of the following elements (optional, any number of these blocks)

  // @element 02
  ...
  // @end
  return { width: CW, height: CH, cycle: CYC, cells: CELLS, fonts: [] };
});
```

Rules:
- Marker lines are exactly `// @kit`, `// @element NN`, `// @shared`, `// @end` at 2-space indent.
  The build cuts on them: an element's code = lines from its marker to the next marker. Everything
  an element needs that is not in its own block must be in `@kit` or a `@shared` block.
  Helper consts that belong to ONE element (e.g. a precomputed particle table) go inside that element's block.
- `cells[i](k, w, h, u)`: `k` = CanvasRenderingContext2D already cleared and wrapped in save/restore by the
  caller; `w,h` = pack width/height; `u` = seconds in `[0, cycle)`. Pure function of `u`: no Date, no
  Math.random at draw time (seeded tables are fine), no state carried between calls, loop must be seamless
  at `u = cycle → 0`. Wrappers in the source (`camCell`, `anim`, `abCell` …) are fine as long as the stored
  cell has this signature.
- An element draws only its own card: no page header, card frame, number or name label. The site adds those
  and applies its own per-tile phase offset.
- No DOM access except creating offscreen canvases (`document.createElement('canvas')`). No network.
- Fonts: system stacks. A pack may ship font files in `packs/<pack>/fonts/` ONLY if the
  font's license clearly allows redistribution in a public repo; declare them in `fonts: [{family, url:'fonts/x.otf'}]`
  (url relative to the pack folder) and put the license text beside them.

## packs/<pack>/meta.json

```json
{
  "pack": "motion", "order": 1,
  "title": { "ja": "モーショングラフィックスの動き", "en": "Motion graphics moves" },
  "categories": [ { "slug": "entrances-text", "ja": "登場・文字の演出", "en": "Entrances & text" } ],
  "elements": [
    { "no": "01", "slug": "pop-in", "category": "entrances-text",
      "name": { "ja": "ポップイン", "en": "Pop-in" },
      "meaning": { "ja": "ポンと弾んで現れる", "en": "Pops into view with a small bounce" },
      "ask": { "ja": "ロゴをポップインで出して。0.4秒で、行き過ぎは少しだけ。", "en": "Bring the logo in with a pop-in, about 0.4 s, with a slight overshoot." },
      "summary": { "ja": "…", "en": "…" },
      "spec": { "ja": ["…", "…"], "en": ["…", "…"] },
      "use": { "ja": "…", "en": "…" },
      "tags": ["pop", "spring", "icon", "badge"] }
  ]
}
```

- `name`: the term people in the field really use, in each language. Do not coin a name or translate
  one literally; where a language keeps the English term, write the English term.
- `meaning`: one short line saying what the name means (about 40 characters in English, 20 in Japanese).
- `ask`: one example sentence that asks an AI for it by name, with a duration, an amount or a subject.
  Optional, but the build warns when it is missing.
- `categories`: groups of elements inside the pack.
- `summary`: one sentence, what you see in the demo.
- `spec`: 3–6 short lines that let an AI rebuild the move **without seeing it**: what moves, in what order,
  durations in seconds, easing (name + cubic-bezier or spring/overshoot numbers), amounts (px relative to a
  539×208 card, degrees, scale). Take every number from the code — never invent. This is the product.
- `use`: one sentence, when to reach for it in a video.
- `tags`: 4–8 lowercase English keywords (include obvious synonyms people would search).
- Japanese copy: plain です/ます-free noun/verb endings as in a spec sheet, no hype words, no AI-ish filler.
  English: plain, no slang, check each term is safe and standard in English.

### Languages

Every text field (`title`, each category, `name`, `meaning`, `ask`, `summary`, `spec`, `use`) is an object
keyed by language code. `en` is required, because it is the language packs share. Every other code is
optional, and a pack does not need Japanese.

To add a language (say Spanish, `es`) to a pack, edit only `packs/<pack>/meta.json`:

1. add `"es"` to `title` and to each entry of `categories`;
2. add `"es"` to each element's `name`, `meaning` and `ask`;
3. optionally add `"es"` to `summary`, `use` and `spec` (same number of lines as `spec.en`);
4. run `node tools/build.mjs`. It writes `packs/<pack>/README.es.md` and links it from the other lists.

A field without the new language shows its English text in that list. The headings of the generated
list ("Name", "What it is", …) are English unless you add a block for the language to `DOC` in
`tools/build.mjs`; add its display name to `LANG_NAME` there too.

The gallery, `api/v1/<lang>/` and the copyable prompt are served in `ja`, `en` and `zh-Hans` (`LANGS` in
`tools/build.mjs`). In those, a pack with no Japanese shows its English text. Other languages are
carried in `api/v1/catalog.json` and shown in the generated lists.

## Generated API (tools/build.mjs writes these; the skill CLI and the site read them)

```
api/v1/catalog.json                 { version, count, packs:[…], elements:[{ id, pack, no, slug, category, width, height, cycle, name, meaning, ask, summary, spec, use, tags }] }
api/v1/<lang>/catalog.tsv           header comment line, then: id  pack  category  title  tags  summary      (lang = ja | en | zh-Hans)
api/v1/<lang>/e/<id>.txt            one element: license line, info header (name, what it shows, spec, use, size, cycle, "Needs: kit <pack>", live demo URL), then the element code block
api/v1/<lang>/p/<id>.txt            the copy-paste prompt for that element (same text the site's "copy prompt" button copies)
api/v1/kit/<pack>.js                @kit + all @shared blocks of the pack, plus a short header showing how to run one element standalone
```

First line of every `e/<id>.txt` and `kit/<pack>.js`:
`// Motion Prompt #<id> · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#<id>`

Live demo deep link: `https://showheyohtaki.github.io/motion-prompt/#<id>`.

## Tooling

- `node tools/build.mjs` regenerates `api/v1/`, `assets/catalog.js` and the name lists (`packs/README.md`,
  `packs/<pack>/README*.md`). `--check` validates without writing. If `assets/preview-<pack>.gif` exists,
  the pack's lists show it.
- `node tools/check.mjs` draws every element at several times and reports exceptions, blank frames and loop seams.
  It needs Playwright available to Node (it is not a dependency of this repo); use `MP_PLAYWRIGHT` to select it. `MP_PYTHON` can select the Python executable instead of the default `python3`.
- Preview a pack: serve the repo root (`python3 -m http.server 8000`) and open
  `dev/preview.html?pack=<pack>` (playing), `&t=1.2` (frozen) or `&only=5` (one element).
- A pack's `cycle` may be longer than one pass of the motion (camera uses 9.4s).
- The kit's first line uses the pack's ID range, e.g. `#001-024`.

## Simplified Chinese reference code

`api/v1/zh-Hans/kit/<pack>.js` is a generated variant of the shared kit with
`MP_LANG` defaulting to `zh-Hans`. Use `kit <pack> --lang zh-Hans` with Chinese
`get` output. The original `api/v1/kit/` remains the default for ja/en.
Pack factories may receive a language argument from the runtime. The text
helpers capture this language when a factory is created, so cells still depend
only on time and do not read the DOM language. No animation parameters change.

`node tools/check-localization.mjs` checks source coverage, generated prompts,
the gallery, the examples page, standalone Chinese code and the local pick flow.
It uses Playwright via `MP_PLAYWRIGHT`, like `tools/check.mjs`.
