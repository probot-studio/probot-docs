# Tool docs style guide

The **usage** docs for the Probot Studio tools (Blocks, Builder, Sim) are written by this guide.
The goal is not teaching: the reader opens the tool, follows the page and finishes the job without
asking anyone. Every feature is covered; the guide shows step by step which button or key to press,
in order, to get a job done. Presentations and videos will later be produced from the same pages,
so the structure is strict.

The pages themselves are written in **Turkish**. This guide is in English, but every heading,
label and example sentence the writer must produce is quoted in Turkish, exactly as it must appear
on the page.

Background and sources: a study of widely praised documentation (Stripe, DigitalOcean, WPILib,
MakeCode, the Google and Microsoft style guides, Diátaxis).

## 1. What to document

- **Document what is in production:** `https://probotstudio.com/<tool>/`. A feature that exists
  only in development is not documented; things still changing in development go into a separate
  tracking note.
- **The source code is the source of truth.** The in-app Help window may be incomplete or wrong.
  Behavior is confirmed by reading the code and by trying it in production.
- **Use the Turkish on-screen label verbatim,** including product and robot names (a name such as
  "NFR mecanum şasi" is written exactly as it appears on screen).
- Things that must not be documented (experimental, behind a flag, internal use) are listed by the
  maintainers for each tool.
- **Requirements live in one place:** browser, narrowest screen, mouse, gamepad and account
  requirements are in the table at `tools/index.md#ne-gerekir`. Pages do not repeat these values;
  they link to it.

## 2. Page types

Every tool folder has the same set of page types.

| Type | File | Content |
|---|---|---|
| Tools landing page | `tools/index.md` | A **İlk 10 dakika** link for each tool, a table of file flow between the tools, the "Ne gerekir" table. |
| Introduction | `index.md` | What the tool is for (2-3 sentences), a **Kimin için** list, a **Neyi yapar, neyi yapmaz** table (every job it does not do links to the right tool or page), table of contents cards. |
| First 10 minutes | `ilk-10-dakika.md` | From zero to the first result: 4-6 sections, each ending with a "Kontrol et:" line. No explanations; at most 3 sentences at the start of a section for the single concept the reader will first stumble on, with a link to the glossary. |
| Interface tour | `arayuz.md` | Full screenshot with numbered regions. A table for each region: **Ad \| Ne yapar \| Kısayol \| İlgili görev**. Every button and menu item is here. |
| Task pages | `<verb-task>.md` | "How to do X". 60-70% of the docs. |
| Reference | `*-listesi.md` | A **Blok \| Ne yapar \| Ürettiği kod** table; one context image per category (the block attached to a lifecycle block). |
| Shortcuts | `kisayollar.md` | All keyboard, mouse, touch and gamepad mappings in one table. |
| Troubleshooting | `sorunlar.md` | Opens with a table of page status indicators (**Gösterge \| Anlamı \| Ne yap**). Each symptom is an anchored `###` heading starting with the on-screen text; below it, separate paragraphs: `Sebep:`, `Çözüm:`, `Bkz.`. With several causes, use a **Sebep \| Çözüm** table. |

Coverage rule: **every** button and menu item in the interface tour must be explained by at least
one task page or by the "Ne yapar" cell in the tour. No feature is left unexplained.

## 3. Task page skeleton

```markdown
# Projeyi robota yükle

Bu sayfada yazdığın programı robotuna göndereceksin. (1-2 cümle: ne elde edeceksin.)

## Başlamadan önce
- Robot şarjlı ve açık.

## Programı indir

1. Araç çubuğunda **.ino indir**'e bas.
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:tank-surus | hedef=text=".ino indir" | isaret=1 -->
   ![Araç çubuğu; .ino indir düğmesi 1 numarayla işaretli.](img/blocks-ino-indir.png)
   <!-- SAY: Önce programı bilgisayarımıza indiriyoruz. -->
2. ...

Sonuç: Tarayıcı `proje.ino` dosyasını indirir.

## Sorun mu var?
- **"..." yazısı çıkıyor:** ...

## Sonraki adım
[Robotu kumandayla sür](kumandayla-sur.md)
```

- The title states the job and starts with a verb: "Projeyi robota yükle", "Parçaları birbirine
  tak". Noun titles such as "Yükleme" or "Parçalar" are not used.
- Each `##` section covers a single job and can be understood on its own. In a video, one section
  can be one sequence of scenes, that is one 30-45 second part.
- Each task page offers a "start from a ready-made example" path at the top or in the relevant
  section (an example project, a ready-made robot). The reader never has to start from scratch.

## 4. Writing steps

1. **One action per step. Location first, then the action.** "Araç çubuğunda **Çalıştır**'a bas."
2. **A procedure has 3-7 steps.** Split longer ones into subsections.
3. **Every procedure ends with a `Sonuç:` line.** It tells the reader they are in the right place.
   If the job finishes outside the tool (Arduino IDE, Control Hub, the robot), the `Sonuç:` line
   gives the on-screen text verbatim and the robot's visible behavior ("Robot 1 saniye ileri gider
   ve durur."). Do not write "... benzeri bir satır" or "Robot çalışır".
   Observation verbs (bak, bul, gör, bekle, izle) are never a numbered step; they go into the
   `Sonuç:` line or into the second sentence of the previous step.
4. **Prerequisites come before the steps,** in the "Başlamadan önce" list.
5. **Never skip the finishing action:** **Kaydet**, **Tamam**, **Uygula**.
6. **Do not hide information.** State the number, limit or key exactly (en az 8 karakter,
   30 saniye, 5 MB).

### Writing UI elements

| What | How | Example |
|---|---|---|
| Button, menu, tab, field name | **bold**, as on screen, without the word "düğme" | **Kodu kopyala**'ya bas. |
| Suffix | after an apostrophe, outside the bold part | **Başlat**'a, **Robotlarım**'ı |
| Menu path | `**Dosya** > **Kaydet**` (at most 3 levels) | **Dosya** > **Paylaşım linki**'ni seç. |
| Non-interactive screen text, error message | "in quotes" | "Derleme başarılı" yazısı görünür. |
| Keyboard key | `<kbd>` | <kbd>Ctrl</kbd>+<kbd>Z</kbd>, <kbd>Esc</kbd>, <kbd>Boşluk</kbd> |
| Gamepad button or stick | **bold** (not formatted like a keyboard key) | **A**, **LB**, **sol çubuk** |
| Text the reader types | `code` | **Proje adı** kutusuna `ilk-robot` yaz. |

- Keyboard keys are always written in HTML as `<kbd>Ctrl</kbd>+<kbd>S</kbd>` (not `++ctrl+s++`;
  the education site's renderer may not support it). Letter keys are upper case: <kbd>R</kbd>.
- Do not use direction words ("sağ üstte"). Use the region name: "**Araç çubuğunda**",
  "**Parçalar** panelinde". Region names are defined in the interface tour and the same name is
  used everywhere.

### Verbs

| Situation | Verb |
|---|---|
| On-screen button | **bas** |
| Menu command, list item, tab, block, part | **seç** |
| Moving something | **sürükle** |
| Text input | **yaz** |
| Switch, checkbox, panel | **aç / kapat**, **işaretle** |
| 3D camera | **döndür / yakınlaştır / kaydır** |

"Tıkla" is used only where it is specific to the mouse: "sağ tıkla". A shortcut is never the main
path; it is given as extra information: "**Düzen** > **Geri al**'ı seç (<kbd>Ctrl</kbd>+<kbd>Z</kbd>)."

## 5. Language and tone

- **Address the reader as "sen":** Seç, bas, sürükle. (Same as the existing Probot docs.)
- One verb per sentence, at most about 15 words. At most 3 sentences per paragraph.
- Forbidden words: "kolayca, basitçe, sadece, hemen, tabii ki, açıkça". No praise, no scare
  tactics, no marketing. No unverified product claims.
- Do not use the em dash (U+2014).
- One fixed term per thing: whatever the on-screen label is. Each tool's `index.md` ends with a
  short glossary.

## 6. Admonitions

Only three kinds, at most one box per section:

```markdown
!!! note "Not"
!!! tip "İpucu"
!!! warning "Dikkat"
```

A job that risks data loss (deleting, resetting, work stored in the browser) gets a **Dikkat** box
**before** the step. A note longer than two sentences leaves the box and becomes a normal
paragraph. If a problem in the "Sorun mu var?" list arises at a specific step, it is also mentioned
with a single box before that section's steps.

Wherever **Hata bildir** is described, the list of things to include in the message is fixed: the
open example or robot, the last button or key pressed, the exact on-screen text, the browser.

## 7. Screenshots

- **Images are placeholders for now.** They are captured from production and will later be
  refreshed under the same file name. The file name stays fixed: `<tool>-<task>-<place>.png`
  (for example `builder-tak-araci.png`).
- When to add one: the element is small or hidden, it sits among similar options, or the result
  needs to be confirmed visually. Every procedure has at least one image (usually the result
  image). Not every step gets an image. The first-10-minutes page and task pages open, below the
  intro paragraph, with an unmarked result image showing the moment the job is done (when there is
  one; the same frame as the result scene in `video-script.json`).
- **An image that has not been captured does not go on the page.** If the file does not exist, do
  not write the `![...]()` line; write
  `<!-- IMAGE-PENDING: img/<name>.png | alt=<alt text> -->` instead and keep the `CAPTURE` line.
  Once the image is captured, the comment is turned into an image line.
- Capture settings: light theme, desktop 1440×900, `deviceScaleFactor: 1`, cropped to the area
  needed, no cursor or focus ring, animations off. PNG or WebP, at most 250 KB.
- **Markers:** one color, **magenta `#E6007E`** (orange is already the button color in the UI).
  A 3 px frame with rounded corners and a white number in a filled circle. **The badge number is the
  same as the step number.** Arrows only for dragging. At most 3 markers per image.
- Information never lives only in the image: the step text is complete without it. The alt text
  also mentions the marker, at most 150 characters:
  `![Araç çubuğu; Başlat düğmesi 1 numarayla işaretli.](img/sim-baslat.png)`
- No personal data, e-mail addresses, tokens or admin panels on screen.
- In a 3D scene (Builder, Sim) there are no DOM selectors: the scene state (ready-made robot,
  camera) is written in the `CAPTURE` line, and a marker, if needed, is drawn from coordinates.

## 8. Hidden lines for video and presentations

Below each step there can be two comment lines that are not shown on the site. `CAPTURE` is
required on every step that has an image; `SAY` appears at least once in every `##` section.

```markdown
<!-- CAPTURE: url=<production URL> | hazirla=<example project/robot> | hedef=<stable selector> | isaret=<number> | bekle=<element expected to appear> -->
<!-- SAY: <one Turkish sentence, as if spoken> -->
```

`CAPTURE` fields (the field names are kept as they appear on the pages):

| Field | Meaning |
|---|---|
| `url` | production address |
| `hazirla` | setup: example project or ready-made robot |
| `hedef` | target: a stable selector |
| `isaret` | marker: the badge number |
| `bekle` | wait for: the element that must appear before capturing |

- **Selector:** use `data-testid` when it exists; otherwise a text-based one (`text="Başlat"`,
  `role=button[name="Başlat"]`). No hashed CSS class names. Wait until a given element appears
  instead of waiting a fixed time.
- **`SAY` language:** no imperative mood; use the "-iyoruz" narration form or the "siz" form; no em
  dash, colon or semicolon; the sentence ends with the predicate; do not write "C++". Example:
  "Şimdi robotu sahaya koyuyoruz."

Each tool folder also has a `video-script.json` (see `README.md`).

`tools/check.py` checks most of these rules; run it before sending a change.
