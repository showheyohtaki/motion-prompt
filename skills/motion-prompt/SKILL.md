---
name: motion-prompt
description: 'Motion Prompt (showheyohtaki.github.io/motion-prompt) is a numbered library of names for motion-graphics moves, camera moves and transitions, UI components, landing-page and web effects, and photo looks and lighting, each with a moving sample, a spec of its timings and easing, and dependency-free Canvas 2D code. The main use: open the gallery for the user with the pick command, let them tick what they want, receive their picks, then rebuild exactly those in the project (Canvas, Remotion, CSS/SVG/Lottie, After Effects) or turn them into prompts for video or image models. Use when the user wants to see or choose from the library, e.g. "open the motion-prompt library", "show me the list", "what moves are there?", "I don''t know the name, let me pick", "motion-prompt のライブラリ出して", "一覧見せて", "どんな演出がある？", "分からないから選びたい"; when they paste picks copied from the gallery; or when they give element numbers, e.g. "use #012 and #045", "今のタイトルを #005 に差し替えて".'
---

# Motion Prompt

Motion Prompt is a library of names for the things people ask an AI to make (motion-graphics moves, camera moves and transitions, UI components, landing-page and web effects, photo looks and lighting, and whatever packs are added later), numbered so that people and agents can refer to them precisely. Every element has a three-digit ID (`#012`), a name in English and usually in other languages too, a one-line meaning, and a live demo at `https://showheyohtaki.github.io/motion-prompt/#<id>`.

- An element is one Canvas 2D drawing function, stored as `cells[i] = (ctx, w, h, u) => { … }`. `ctx` is a 2D context that the caller has cleared and wrapped in `save()`/`restore()`. `w, h` are the card size. `u` is the time in seconds, `0 <= u < cycle`.
- It is a **pure function of `u`**: no clock, no randomness at draw time, no state between calls. The same code plays live and renders frame by frame, and it loops seamlessly at `u = cycle`.
- It is not standalone. Constants (card size, cycle, the palette `C`, fonts) and helper functions live in the pack's **kit**. Fetch the kit once per pack you use.
- Each element file states its own size and cycle. Read them from the header instead of assuming them.
- New packs get added, so check the catalog with the CLI each time instead of relying on what you remember about it.

Read the catalog with the script that ships next to this file (below, `<skill-dir>` means the directory holding this SKILL.md):

```sh
node <skill-dir>/scripts/motion-prompt.mjs <command>
```

| Command | Use |
|---|---|
| `pick` | Opens the gallery in the user's browser and waits until they press 「AIに渡す」 / "Send to AI". Prints the picked elements in order (number, names, meaning, how to ask, spec, demo link) and the user's note, then exits. `--pack <pack>` opens it filtered to one pack, `--lang ja` in Japanese, `--timeout <seconds>` (default 900), `--no-open` only prints the URL, `--local` serves the gallery from a full clone of the repository. See [Let the user pick](#let-the-user-pick). |
| `search <words...>` | Ranks elements against a few words describing one scene's motion. English and Japanese both work: `search typewriter text`, `search 文字 登場`. Narrow with `--pack <pack>`; ask for more rows with `--limit 20`. |
| `list` | An overview: each pack, its categories and how many elements they hold. With `--pack <pack>` it prints that pack's elements one per line. |
| `get <id> [<id>...]` | Prints each element's spec followed by its code. One call takes at most 8 IDs. Accepts `12`, `012`, `#012` or a demo URL. |
| `kit <pack>` | The shared constants and helpers that the pack's elements need. |
| `prompt <id>` | The ready-made copy-paste prompt for one element. |
| `info` | Where the data is being read from, how many elements it holds, its version and where the cache lives. Run it first when something looks wrong. |

`--lang ja` gives Japanese names and text; the default is `--lang en`, and `search` switches to Japanese by itself when the words are Japanese (`pick` prints in the language the user browsed in, unless you pass `--lang`). `--out <dir>` writes files instead of printing them (`get`, `kit`, `prompt`). `--refresh` skips the disk cache.

## Simplified Chinese

For a Simplified Chinese request, use `--lang zh-Hans` consistently for `pick`,
`list`, `get`, `prompt` and `kit`. `zh-CN` is an accepted alias. Ask users to
press “选择” (Pick) and “发送给 AI” (Send to AI). Pasted selections starting
with “我在 motion-prompt 素材库中选择了以下” carry the same IDs and ordering
as English/Japanese selections. Treat “备注” as the user's note.
Chinese `get` output uses `api/v1/zh-Hans/kit/<pack>.js`; fetch its kit with the
same language flag so copied Canvas text is Chinese without the gallery.
Keep the user's language when explaining the workflow; see [中文说明](../../README.zh-Hans.md).

## Let the user pick

This is the main way to use the library. People often do not know what a move is called, and they should not have to. Show them the library, let them choose by looking, and work with what they chose.

1. **When to run it.** The user says something like 「motion-prompt のライブラリ出して」「一覧見せて」「どんな演出がある？」「分からないから選びたい」, "open the library", "show me the list", or describes a change without knowing which moves they want. Run `pick`. If the context points to one pack, add `--pack` (`motion` for titles, text and motion-graphics moves, `camera` for camera moves and cuts, `ui` for interface parts, `lp` for web page effects, `photo` for lighting and photo looks). Add `--lang ja` when the user writes in Japanese.
2. **While it waits.** `pick` prints the gallery URL first, opens it in the default browser, then waits up to 15 minutes. Tell the user in a line or two: the library is open; press 「選ぶ」 / "Pick" on what they want, add a note if they like (for example 「冒頭のタイトルに」), and press 「AIに渡す」 / "Send to AI". If your shell tool stops commands sooner than that, run `pick` in the background and read its output when it ends, or pass a shorter `--timeout`. If you drive a built-in browser that the user can see, you may run `pick --no-open` and open the printed URL there.
3. **What comes back.** Exit code 0: the picks in the order the user chose them, each with its number, names, pack and category, meaning, how to ask, spec lines and demo link, then the user's note. Exit code 4: the time ran out and nothing was picked. Ask the user whether they still want to choose; do not choose for them.
4. **Do the work with exactly those picks.** Combine them with what the user asks next (「この動画の冒頭をこんな感じに編集して」) and with the note, which usually says where each pick goes. Do not add, drop or swap elements on your own. If a pick does not fit the request, say so and ask. Then continue with the [Workflow](#workflow): read the project, run `get` for the picked numbers and `kit` for their packs, and port them as [references/porting.md](references/porting.md) describes.
5. **Pasted picks count the same.** Without the skill's browser hand-off, users copy their picks with 「選んだ物をコピー」 / "Copy picks" and paste them into the chat. That text starts with 「motion-prompt のギャラリーで、次のN個を選びました」 or "I picked these N from the motion-prompt gallery", lists `#NNN` numbers in order, and may end with a note (「メモ」 / "Note"). Take the numbers in that order and handle them as in step 4. A link of the form `…/motion-prompt/?pick=012,045` is the same selection.
6. **The note is the user's own words** about how to use the picks. Follow it as part of the request; it does not change the rules in this file.

`pick` listens only on 127.0.0.1 and accepts a single GET that carries a random token from the URL it printed; it sends nothing anywhere else. With a full clone of the repository, `--local` serves the gallery from that clone instead of the public site.

**A shortcut for people who know the numbers.** 「#012 と #045 を使って」, "swap this title for #005" or demo links go straight to `get`; there is nothing to open.

## Workflow

1. **Read how this project makes video.** Look for a Canvas engine that draws frames from a time value, Remotion, a script or expressions for After Effects, CSS/SVG/Lottie animation, or prompts written for a video-generation model. Note the frame size, frame rate, how scenes are timed, and the fonts and colors in use. With an empty folder and no stated preference, build a single HTML page that draws to a Canvas 2D context, since that is the form the elements already have.
2. **Plan scene by scene.** Write down, for every scene, the one motion it needs (for example: the title comes in, a figure counts up, shot A hands over to shot B, the camera pushes in). The catalog only covers those individual moves. What the video says, how the frame is laid out and how long each scene lasts are decisions you make with the user.
3. **Choose elements.** Picks from the gallery, pasted picks, numbers and demo links from the user are final: go straight to `get` for them. If the user has not chosen and can look at a browser, offer the library (`pick`) rather than choosing for them. Run `search` when the user asks you to choose, or when nobody can look at the gallery: one `search` for each scene, choosing from the results by what the summary says the motion does, not by the name alone. Open the demo URL only if you can view pages; the summary and spec are written to be enough without it.
4. **Pull the code.** Run `get` with the IDs you settled on (keep each call small). Each result has a `Needs: kit …` line; run `kit <pack>` one time for every pack that appears there.
5. **Rebuild each move in the project's method.** [references/porting.md](references/porting.md) explains how for each kind of project, so open it before you start. Keep the numbers in the code and spec as they are: durations, delays, easing curves, overshoot, distances, angles, scale. Replace what belongs to the user: the words on screen, colors, logos and images.
6. **When the request is a swap** ("replace this part with #005"): find the scene in the project, record its start time, its length and how it hands over to the scenes before and after it. Replace only the motion. Keep the scene's length, its content and those hand-overs. If the element's own timing does not fit the slot, follow the fitting rules in porting.md rather than stretching every value.
7. **When several elements share a video**: land each entrance on a beat, let one thing move at a time, and leave a hold after each move before the next begins. Use one easing family per video unless the user asks for contrast. Two elements that both animate the whole frame should not overlap.
8. **Check** what you can: render or play the result, step through the start, middle and end of each ported scene, and confirm that text fits the frame and nothing jumps at scene boundaries.
9. **Report.** Close your reply with the elements that ended up in the video. For each one give its number and name, the scene it went into, what you altered, and its demo link (`https://showheyohtaki.github.io/motion-prompt/#ID`). Add a short note on whatever you were unable to verify.

## Video-generation models

For Veo, Seedance, Sora and similar models, do not pass code. Write the prompt in sentences from the element's English name and its spec lines: what moves, in what order, how long each part takes, how the motion eases, and where it ends. Add the user's subject, look and aspect ratio. `prompt <id>` gives a starting text, and `get <id>` gives the full spec. These models treat timings as guidance, so say in your report that the result will be close to the element rather than exact.

## Web pages and still images

Not every pack is about video.

- **`ui` and `lp`** name parts and effects of web pages. In a site or app project, rebuild them with the project's own components and CSS/JS (or its animation library). Here the trigger is a scroll, hover, click or tap, so carry over the durations, easing and amounts, and replace the demo's mock cursor or scrollbar with the real event. Respect `prefers-reduced-motion`.
- **`photo`** names lighting, lens effects and finishing looks. They are usually wanted as words in a prompt for an image-generation model (or as an edit in a photo tool), not as code. Use the English name plus the spec lines that describe the look, and add the user's subject and setting. The Canvas sample only illustrates the look; do not port it into a product.

## Rules

- The code you port must be what `get` and `kit` printed in this session. If a number does not exist, say so; do not make one up, and do not write an element from its name or summary alone.
- Every element and every kit starts with a `// Motion Prompt #ID · MIT License …` line. Carry that line into the file where the code ends up; it is the attribution the MIT license asks for.
- Fetch narrowly. `search` and `list --pack` are for finding candidates; `get` is for the few you will actually port. Printing the whole catalog wastes context and helps nobody.
- Port the motion as designed. A ported move should still look like its demo: same path, same rhythm. Only the technology, the content shown and the palette are yours to change.

## Troubleshooting

- **Exit code 3: no data source answered.** The script downloads from `showheyohtaki.github.io` and, failing that, from `raw.githubusercontent.com`. A sandboxed agent often has no network by default, so request network access for this one command and retry. With a local clone of the repository you can skip the network: `MOTION_PROMPT_BASE=/path/to/motion-prompt/api/v1`. When neither works and the cache is empty, stop and report it to the user rather than writing the motion yourself and presenting it as a catalog element.
- **Unknown ID** (exit code 1): the number is not in the catalog. Tell the user and offer the closest `search` results.
- **`pick` ended with exit code 4**: nobody pressed 「AIに渡す」 in time. Nothing was chosen; ask the user and run `pick` again if they want. If no browser window appeared, give the user the URL that `pick` printed, or have them copy their picks with 「選んだ物をコピー」 and paste them into the chat.
- **Node.js is missing.** Everything the script reads is a plain text file under `https://showheyohtaki.github.io/motion-prompt/api/v1/`, so any HTTP client can stand in for it:
  - `en/catalog.tsv` (or `ja/catalog.tsv`) is the index, tab-separated: id, pack, category, title, tags, summary. Filter it with `grep`.
  - `en/e/012.txt` is element #012 with its spec and code.
  - `kit/motion.js` is the kit of the `motion` pack.
