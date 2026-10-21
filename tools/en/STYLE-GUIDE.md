# English tool docs style guide

The English pages under `tools/en/` are translations of the Turkish tool guides. Everything in
[../STYLE-GUIDE.md](../STYLE-GUIDE.md) applies to them as well; this file only says what changes
in English. Where the two disagree for an English page, this file wins.

## 1. Source and scope

- **The Turkish page is the source.** An English page says what its Turkish page says: the same
  sections in the same order, the same steps, numbers, limits, keys, images and links. It adds no
  facts and drops none. If the Turkish page is wrong or out of date, report it: it is fixed first
  and the English page follows. The one exception is on-screen text, which always matches
  production (section 2), even before the Turkish page is fixed.
- **It describes the English interface in production.** A guide is published in English only
  after the English interface of its tool is in production.
- **Layout:** `tools/en/<guide>/<same file name>.md`. File names stay the Turkish ones, so a page
  and its translation share the slug and the language switch maps page to page.
- `tools/en/index.md` is the English tools landing page. Presentation folders (`presentation/`),
  capture scripts (`capture/`) and `video-script.json` are not translated.

## 2. On-screen text

- **Use the English on-screen label verbatim,** exactly as the English interface shows it,
  including case and punctuation: **Copy code**, **Download .ino**. Never translate a Turkish
  label yourself; look up what the English interface shows.
- Product, robot and example names are written as the English interface shows them. Product names
  (Probot Studio, Blocks, Builder, Sim, Probot Core, WattOS, BioBuzz) never change.
- FTC terms stay as FTC uses them: OnBot Java, Control Hub, Driver Hub, Driver Station, OpMode,
  TeleOp, Autonomous, INIT, START, STOP, gamepad1.
- Third-party software is described in its English interface: Arduino IDE **File** > **Open**,
  **Tools** > **Board**, **Upload**. Turkish-interface hints in the Turkish page ("Türkçe arayüzde
  **Dosya** > **Aç**") are left out.
- A screen that is not in English in production (today: Sim, the shop, the lessons, the robot's
  own pages) is quoted with its Turkish label verbatim, followed the first time by its meaning in
  parentheses: **Dosya aç (.blk, .java)** (Open file). The page says once that the screen is in
  Turkish.
- Placeholders are English: `<name>`, `<project-name>`, `<ClassName>`; `<n>` stays. A sample value
  the reader types may be English if it stays valid (`TEAM-2026`); names in code (`solMotor`) stay.
- Literal output stays verbatim: serial monitor lines, IDE and compiler messages, Driver Station
  texts, `PB-E` codes and their messages.
- Code blocks stay byte for byte, with one exception: code the English interface generates is
  quoted as the English interface generates it (for example the comments Blocks writes into the
  `.ino` file).

## 3. Fixed words

| Turkish page | English page |
|---|---|
| `İlk 10 dakika` / `Arayüz turu` / `Kısayollar` / `Sorun giderme` | `First 10 minutes` / `Interface tour` / `Shortcuts` / `Troubleshooting` |
| `Ne gerekir` | `What you need` |
| `Başlamadan önce` | `Before you start` |
| `Sonuç:` | `Result:` |
| `Kontrol et:` | `Check:` |
| `Sorun mu var?` | `Having trouble?` |
| `Sonraki adım` | `Next step` |
| `Sebep:` / `Çözüm:` / `Bkz.` | `Cause:` / `Fix:` / `See` |
| `Sebep \| Çözüm` table | `Cause \| Fix` table |
| `Gösterge \| Anlamı \| Ne yap` | `Indicator \| Meaning \| What to do` |
| `Ad \| Ne yapar \| Kısayol \| İlgili görev` | `Name \| What it does \| Shortcut \| Related task` |
| `Blok \| Ne yapar \| Ürettiği kod` | `Block \| What it does \| Code it generates` |
| `Kimin için` | `Who it is for` |
| `Neyi yapar, neyi yapmaz` | `What it does and does not do` |
| `Sözlük` | `Glossary` |
| `!!! note "Not"` | `!!! note "Note"` |
| `!!! tip "İpucu"` | `!!! tip "Tip"` |
| `!!! warning "Dikkat"` | `!!! warning "Warning"` |
| `!!! info "Yakında"` | `!!! info "Coming soon"` |

Each guide's glossary (the end of its `index.md`) fixes the English term for every concept of
that tool; the other pages of the guide use those terms and no synonyms.

### Verbs

| Situation | Verb |
|---|---|
| On-screen button | **press** ("Press **Copy code**.") |
| Menu command, list item, tab, block, part | **select** |
| Moving something | **drag** |
| Text input | **type** |
| Switch, checkbox, panel | **turn on / turn off**, **check / uncheck**, **open / close** |
| 3D camera | **rotate / zoom / pan** |

"Click" is used only where it is specific to the mouse: "right-click". A shortcut is extra
information, never the main path: "Select **Edit** > **Undo** (<kbd>Ctrl</kbd>+<kbd>Z</kbd>)."

## 4. Language and tone

- US English, plain and direct, for readers from about age 11. Address the reader as "you" and
  write steps in the imperative: "Select the example. Press **Download .ino**."
- One action per step, location first: "In the toolbar, press **Run**." About 20 words at most per
  sentence, at most 3 sentences per paragraph.
- Forbidden words: "easily, simply, just, immediately, of course, obviously". No praise, no scare
  tactics, no marketing, no unverified product claims.
- Observation verbs (look, find, see, wait, watch) never start a numbered step; they go into the
  `Result:` line or into the second sentence of the previous step.
- No em dash (U+2014): use a comma, a colon or a new sentence.
- Keyboard keys use English names: <kbd>Space</kbd>, <kbd>Enter</kbd>, <kbd>Shift</kbd>,
  <kbd>Esc</kbd>, the arrow keys.

## 5. Headings, anchors and links

- A heading written with an explicit `{#id}` keeps that id unchanged: other pages, the product
  and the Turkish page's language switch link to it.
- Every other heading gets its slug from the English heading text. No Turkish slug appears in an
  English page's links.
- A link to a page of the same guide stays relative: `[Copy or download the code](probot-kodu-al.md)`.
  A link to an anchor uses the English page's anchor.
- A link to another guide goes to its English page when that exists (`../core/x.md` inside
  `tools/en/`). Until then it goes to the Turkish page (`../../core/x.md`) and the link text ends
  with "(in Turkish)". When the English guide is published, these links are switched to it.
- A link that opens a tool opens its English interface: `https://probotstudio.com/blocks/?dil=en`.
  The link text stays the plain address (`probotstudio.com/blocks`).
- The requirements table is `tools/en/index.md#ne-gerekir`.

## 6. Images

- English pages use the Turkish guide's images by their real relative path
  (`../../blocks/img/blocks-ino-indir.png`) until English screenshots exist. English screenshots
  are captured from the English interface in production, saved as `tools/en/<guide>/img/` with the
  same file name, and the page then points at `img/<name>.png`.
- Alt text is English and follows the Turkish rules (mentions the marker, at most 150 characters).
- An `IMAGE-PENDING` comment keeps its file name and uses the same path the image line will use.

## 7. Hidden lines

- `CAPTURE` keeps its field names (`url`, `hazirla`, `hedef`, `isaret`, `bekle`) and its
  identifiers (`data-testid` values, CSS selectors). The production URL opens the English
  interface (`https://probotstudio.com/blocks/?dil=en`); text selectors, example names
  (`ornek:Tank Drive`) and free-text setup notes use the English interface's words
  (`text="Download .ino"`).
- `SAY` is one English sentence, as spoken, in the "we" narration form: "Now we open the Tank
  Drive example." No imperative, no em dash, colon or semicolon, and no "C++".

`python3 tools/check.py tools/en/<guide>` checks most of these rules with the English fixed words
above; run it before sending a change.
