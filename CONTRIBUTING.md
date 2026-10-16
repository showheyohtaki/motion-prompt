# Contributing: add the names of your field

**English** | [日本語](CONTRIBUTING.ja.md) | [简体中文](CONTRIBUTING.zh-Hans.md)

This repository is a library of names: the words people in a field use for the things you can ask an AI to make. It started with two of the sets posted on X, motion graphics and camera moves, and UI component names, landing page and web effects, and photo looks have been added since. **Please add the common language of your own field, in your own language.**

Fields outside video are welcome: lighting, sound, UI and interaction, photography, typography, illustration, cooking, architecture, fashion, music, dance, games. If people in a field say "do a ___" to each other and an outsider would not know the word, that word belongs here.

You do not have to write the code yourself. The prompts in [`make-your-own/prompts/`](make-your-own/prompts/) let a coding AI (Claude Code, Codex, Cursor, and so on) do most of the building. What only you can bring is knowing which names are real.

## Three ways in

| Way in | What | How to send it | Where it goes |
|---|---|---|---|
| A pack of names | The names of your field with moving samples, or another language for an existing pack | A pull request (or [Suggest names or a pack](https://github.com/showheyohtaki/motion-prompt/issues/new?template=1-contribution.yml) to talk it over first) | `packs/<pack>/` |
| An example you found | A post on X that shares names with samples (your own is welcome) | [Suggest an example](https://github.com/showheyohtaki/motion-prompt/issues/new?template=2-example.yml) | `examples/found.json` and the [examples page](https://showheyohtaki.github.io/motion-prompt/found.html) |
| A contribution | Something you made with make-your-own (videos, HTML, a cheat-sheet image), or a fix to a name | A pull request or [Suggest names or a pack](https://github.com/showheyohtaki/motion-prompt/issues/new?template=1-contribution.yml) | `make-your-own/examples/<slug>/<lang>/` and so on |

"Make-your-own examples" are things you made yourself; "examples you found" are other people's posts on X.

### How found examples are listed

- Other people's posts are shown only with X's official embed, a link, and a one-line introduction we write. No images, videos, screenshots or post text are copied into this repository or onto the site.
- `examples/found.json` holds only the post ID (`id`), the author (`author`), `url`, a theme (`theme`), a one-line introduction (`intro`, in Japanese, English and Simplified Chinese), the language of the post (`lang`) and the date it was added (`added`). It does not keep the post text or counts such as likes.
- The introduction is one line in our own words. It does not copy the post and does not read as if the author recommends this site.
- We list posts with samples the author made (moving samples with names, cheat sheets and so on). We do not list posts that use someone else's work without credit, posts that only quote another post, posts that are mainly advertising a paid course or a product, or company ads.
- The examples page has no ads for courses or services.
- Requests to remove or correct an entry come in through the [issue form](https://github.com/showheyohtaki/motion-prompt/issues/new?template=3-removal.yml), and we act on them as soon as they are confirmed.

### We only take what can be released under MIT

Everything in this repository is released under the MIT License. We do not accept material that cannot be (someone else's work, fonts that cannot be redistributed, photos without permission). If you do not want your work under MIT, publish it on your own site or on X and suggest it as an example; we will embed and link to it.

## What you can add

| | What it is | Where it goes |
|---|---|---|
| A language | The names of an existing pack in another language | `packs/<pack>/meta.json` |
| A pack | The names of a new field (or another part of a field), with moving samples | `packs/<pack>/` |
| A "make your own" example | The videos, HTML source and cheat-sheet image you made | `make-your-own/examples/<slug>/<lang>/` |
| A correction | A name that is wrong, unclear, or not what people in that language really say | an issue or a pull request |

A small pull request is fine. One language for one pack is a complete contribution.

## What a name needs

1. **It is really used.** People who work in the field say or write this word. Someone can type it into an AI prompt or a search box and get the right thing.
2. **It is not invented and not translated literally.** If your language keeps the English term (many do for "J-cut" or "Easing"), write the English term. If two terms are both common, pick the more common one and mention the other in the pull request.
3. **You can say where you checked it.** A textbook, a software manual, a trade glossary, a well-known tutorial, or your own years of work in the field. Put the sources in the pull request description, one line per name is enough. If you are unsure about a name, say so; that is useful to reviewers.
4. **It has a one-line meaning** in plain words (`meaning`), **and one example of asking an AI for it** (`ask`), with a duration, an amount or a subject in it.
5. **It is safe to use.** No brand names or trademarks as the name of a technique, unless the trade itself uses that word generically.

## What a sample needs

A sample is the small animation shown next to the name. The look is yours: colors, fonts and drawing style do not have to match the existing packs, and one pack differing from another is welcome. These points are required whatever the look is:

- **The label can be hidden.** Someone who knows the field can tell which name it is from the sample alone. It shows the thing happening, not an icon of it. One idea per sample.
- **Readable on a phone.** Enough contrast, nothing essential drawn tiny.
- **No flashing.** No fast switching of large areas between light and dark.
- **A seamless loop.** The last frame leads into the first.
- **Drawn from the time only.** The same time always gives the same picture: no clock, no unseeded randomness, no state between frames.
- **Nothing from the network, nothing that belongs to someone else.** No web fonts, images, logos, characters or photos. Font files can be included only when their license clearly allows redistribution, with the license text beside them.

## Add a language to an existing pack

Every text field in `packs/<pack>/meta.json` is an object keyed by language code, for example `"name": { "ja": "パン", "en": "Pan" }`.

1. Add your language code (`es`, `ko`, `zh-Hans`, `fr` ...) to `title`, to each entry of `categories`, and to each element's `name`, `meaning` and `ask`.
2. Optional: add it to `summary`, `use` and `spec` as well. Where you leave it out, the English text is shown.
3. Run `node tools/build.mjs`. It checks the file and writes `packs/<pack>/README.<lang>.md`, a list that is readable on GitHub, and links it from the other lists.
4. Open a pull request with `meta.json` and the generated files, and say where you checked the names.

You can ask a coding AI to do steps 1 to 3 ("add Spanish to packs/camera/meta.json following CONTRIBUTING.md; list every name you are not sure about"). Then check the names yourself; that part is the contribution.

The gallery site and the skill's command line support English, Japanese and Simplified Chinese (`zh-Hans`). Other languages appear in the lists under `packs/` and in `api/v1/catalog.json`. [FORMAT.md](FORMAT.md) has the details.

To also make the videos in your language, use [`make-your-own/prompts/en/01-translate.md`](make-your-own/prompts/en/01-translate.md).

## Add a pack for your field

1. **Choose the names first.** Paste [`make-your-own/prompts/en/02-your-own-field.md`](make-your-own/prompts/en/02-your-own-field.md) into a coding AI. Its first step is the list of names, with where each one was checked. Fix that list until you would be happy to show it to a colleague. A pack is usually 16 to 24 names in 2 or 3 groups.
2. **Build the samples** with the same prompt. You get an HTML page and videos you can post anywhere. That alone can go into `make-your-own/examples/<slug>/<lang>/`.
3. **Turn it into a pack** for the gallery. Ask the coding AI:
   ```text
   Read FORMAT.md and packs/motion/. Turn make-your-own/examples/<slug>/<lang>/index.html into a new
   pack in packs/<pack>/: pack.js with one @element block per card, and meta.json with name, meaning,
   ask, summary, spec, use and tags in English and <LANGUAGE>. Take every number in spec from the code.
   Use the next free "order". Then run node tools/build.mjs and node tools/check.mjs and fix what they report.
   ```
4. **Check.** `node tools/build.mjs` must finish without errors. `node tools/check.mjs` draws every sample in a browser and reports exceptions, blank frames and loop seams (it needs Playwright; see the top of the file). Serve the folder (`python3 -m http.server 8000`) and look at your pack in the gallery.
5. **Open a pull request** with: the field and language, where you checked the names, the names you are unsure about, and the fonts you used.

English is required in every pack, because it is the language packs share. It can be a draft: mark the names whose English term you are not sure about and a reviewer will help. Your own language is the one that matters most.

Numbers are given in pack order. A published number is never reused or changed, and a published name is not renamed. New packs get the numbers after the existing ones.

## License

Everything here is under the [MIT License](LICENSE). By opening a pull request you agree that your contribution is released under it. Only contribute work that is yours to give.

Pull requests and contribution issues ask you to confirm four things (they are in the templates):

- You made it yourself (or the rights holder allowed you to publish it, and you described that permission).
- It contains no images, videos, fonts, logos or people from anyone else (or you described the permission).
- You agree to release it under the MIT License.
- You understand that the license cannot be withdrawn after it is published.

If the material is also in your own post on X, add that post's URL. We use it to confirm that the work is yours.
