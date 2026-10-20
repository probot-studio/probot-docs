# Probot Studio tool docs

Step-by-step usage guides for Blocks, Builder and Sim. The end-user pages are written in Turkish;
everything around them (scripts, scenario files, this README, the style guide) is in English.
The exception is the presentation folders: their decks and READMEs are in Turkish because they
are teaching material. Writing rules: [STYLE-GUIDE.md](STYLE-GUIDE.md).

The presentation series that builds one robot across Builder, Blocks and Sim is in
[build-a-robot/](build-a-robot/README.md).

This folder is not part of the MkDocs build (MkDocs builds only `docs/`). The platform site is
planned to render it under `/docs/` on probotstudio.com.

## Folder layout

```
tools/
  README.md
  STYLE-GUIDE.md          writing rules for the Turkish pages
  check.py                checker for all tools (see "Checking the pages")
  index.md                tools landing page (Turkish)
  build-a-robot/          Builder -> Blocks -> Sim presentation series (Turkish, not rendered)
  <tool>/                 blocks | builder | sim
    index.md              introduction + table of contents + glossary
    ilk-10-dakika.md      "first 10 minutes": from zero to the first result
    arayuz.md             interface tour: every region, every button
    <task>.md             task pages (file name starts with a Turkish verb)
    kisayollar.md         all shortcuts
    sorunlar.md           troubleshooting
    img/                  screenshots (refreshed under the same names when the UI changes)
    video-script.json     video shooting script
    capture/              screenshot capture and audit scripts
      capture-dev.mjs     builder, sim: "Yakında" images from the development build
    presentation/         Turkish ders.md decks, not rendered on the site; NN-name/img/
                          holds copies of or symlinks to ../../../img/ images
    example/              reproducible example project files (if any)
```

Page file names, headings and image names stay in Turkish because they are part of the published
pages and their URLs.

## video-script.json

Derived from each tool's task pages; it stays consistent with the `CAPTURE` and `SAY` lines on the
pages. One video = one job. Reels are 15-60 s; long tasks are split into 30-45 s parts.

```json
{
  "tool": "builder",
  "version": "prod 2026-10-13",
  "note": "optional free text for whoever shoots the video",
  "videos": [
    {
      "id": "builder-ilk-robot",
      "title": "Robotu 3 adımda kur",
      "page": "ilk-10-dakika.md#...",
      "result_scene": "s1",
      "scenes": [
        {
          "id": "s1",
          "url": "https://probotstudio.com/builder/",
          "setup": "örnek proje ya da hazır robot (tekrarlanabilir)",
          "steps": [
            {"action": "click", "target": "role=menuitem[name=\"Dosya\"]"},
            {"action": "wait", "target": "text=\"Robot Kataloğu\""}
          ],
          "expected": "Robot Kataloğu penceresi açılır",
          "narration": "Önce hazır robotlardan birini açıyoruz.",
          "caption": "Hazır robot aç",
          "duration_s": 4,
          "in_3d": false
        }
      ]
    }
  ]
}
```

Keys:

| Level | Key | Meaning |
|---|---|---|
| file | `tool` | `blocks`, `builder` or `sim` |
| file | `version` | which production build the script was written against |
| file | `note` | optional free-text note |
| file | `videos` | list of videos |
| video | `id` | stable video id |
| video | `title` | on-screen title (Turkish) |
| video | `page` | source page and anchor |
| video | `result_scene` | id of the scene that shows the finished result (same frame as the page's result image) |
| video | `scenes` | list of scenes |
| scene | `id`, `url` | scene id and production URL (must start with `https://probotstudio.com/`) |
| scene | `setup` | starting state: example project, ready-made robot, clean browser |
| scene | `steps` | list of actions (see below) |
| scene | `expected` | what is visible when the scene ends |
| scene | `narration` | spoken line (Turkish) |
| scene | `caption` | short on-screen text (Turkish) |
| scene | `duration_s` | scene length in seconds |
| scene | `in_3d` | `true` when the scene happens inside the WebGL canvas |
| step | `action` | `click`, `type`, `drag`, `wait`, `scroll` or `key` |
| step | `target` | selector of the element to act on or wait for |
| step | `value` | text for `type`, key combination for `key` (e.g. `"Control+Z"`) |
| step | `drop_target` | selector of the drop location for `drag` |

Rules:

- `target`: use `data-testid` when it exists; otherwise a text or role selector. No hashed CSS
  class names.
- `in_3d: true`: the scene is inside the WebGL canvas and cannot be marked with a DOM selector; it
  needs coordinates or a prepared image.
- `narration` and `caption` follow the `SAY` rules in the style guide: no imperative mood, use the
  "-iyoruz" form or the "siz" form; no em dash, no ":" and no ";".
- Keep the important action in the middle of the screen (a vertical crop loses roughly the top
  250 px and the bottom 350 px).
- No personal data on screen.

## Checking the pages

`check.py` checks every tool folder (any subfolder that has an `index.md`) against the style guide:
broken links and images, forbidden words, em dashes, a `CAPTURE` line next to every image, alt
text length, `IMAGE-PENDING` placeholders, `SAY` lines per section, procedure length (3-7 steps),
the closing `Sonuç:` line, required pages, `video-script.json` validity and image sizes.

```bash
python3 tools/check.py                  # all tools
python3 tools/check.py tools/builder    # one tool
```

It prints one line per finding (`ERROR` or `WARN`) and a `SUMMARY` line per tool with counts
(`pages`, `sections`, `procedures`, `steps`, `images`, `pending_images`, `say`, `videos`,
`scenes`). The exit code is 1 when there is at least one `ERROR`; warnings do not change it.

Each tool also has its own stricter audit script in `capture/audit.py`.

## Capturing screenshots

The `capture/` scripts open the production site with Playwright, prepare the screen for each image,
mark targets with a magenta frame and a numbered badge, crop to the needed area and write
`<image-name>.png`. They are heavy browser jobs:

- Run them from a folder where Playwright is installed (the scripts import `playwright`).
- `PW_WS` is the WebSocket address of a Playwright `run-server`. The Blocks and Sim scripts
  require it; the Builder scripts connect to it when it is set and launch a local Chromium
  otherwise.
- On a shared machine, coordinate heavy browser work (for example with a lock) so that several
  captures do not run at the same time.
- Write to a scratch output folder first, review the images, then copy them into `<tool>/img/`.

Per tool:

- **Blocks, Sim:** `node <tool>/capture/capture.mjs <output-folder> [name1,name2,...]`, then
  `python3 <tool>/capture/compress.py <folder> [target-folder]` to reduce images to 256 colors and
  at most 250 KB.
- **Builder:** the shared helpers are in `builder/capture/lib.mjs`. `capture-base.mjs` takes the
  index, interface tour and first-10-minutes images; `capture-a.mjs` and `capture-b.mjs` take the
  task page images grouped by starting scene; `capture-night.mjs` takes images that are still
  pending. Each script takes the image folder as its first argument, followed by its scene and image
  name filters (see the header comment of each script). `shrink.py <png ...>` brings images under
  250 KB, `pending-images.py` turns image lines whose file is missing into `IMAGE-PENDING`
  placeholders and back once the file exists (it only counts unless given its apply flag), and
  `coverage.py <inventory.md>` checks that every control and shortcut in an inventory file is
  mentioned in the docs. `list-a.md` to `list-e.md` are the per-group image lists (file, page
  section, scene setup, crop, markers).
