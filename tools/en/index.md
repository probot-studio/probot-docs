# Probot Studio tools

Probot Studio has three tools: Blocks, Builder and Sim. All three run in the browser and need no
installation. These pages show you how to use each tool step by step: which button to press, and
what you see on screen at the end.

| Tool | What you do | Start |
|---|---|---|
| [**Blocks**](blocks/index.md) | You write a robot program by arranging blocks. It generates Arduino code (`.ino`) for the Probot kit, and a `.blk` file and OnBot Java for an FTC robot. | [First 10 minutes: open the Tank Drive example, download the code](blocks/ilk-10-dakika.md) |
| [**Builder** (in Turkish)](../builder/index.md) | You design your robot in 3D. You pick parts from the catalog, attach them by their holes, move the joints and send the parts list to the shop cart. | [First 10 minutes: open a ready-made robot, attach a part, save (in Turkish)](../builder/ilk-10-dakika.md) |
| [**Sim** (in Turkish)](../sim/index.md) | You run a Builder robot and the FTC program from Blocks on a virtual FTC field. You watch the autonomous phase and drive in TeleOp with the keyboard or a gamepad. | [First 10 minutes: watch autonomous with a ready-made robot, drive in TeleOp (in Turkish)](../sim/ilk-10-dakika.md) |

In each tool, follow the **First 10 minutes** page first. Then open the page for the job you want
to do from the tool's introduction page.

<!-- SAY: All three Probot Studio tools run in the browser and need no installation. -->

## How the tools work together

1. In **Builder**, build your robot or open a ready-made one.
2. In **Builder**, select **File** > **Try in Sim**. Sim opens in a new tab with your robot selected.
3. In **Blocks**, write your program in the **FTC Blocks** tab.
4. In **Sim**, select the "Blocks'ta açık FTC projesi" (FTC project open in Blocks) row in the **OpMode** list and try the program on the field.
5. When the program is ready, press **Download .blk** and upload the file to the Control Hub.

The Probot kit takes a different path: in the **Probot Blocks** tab, you press
**Download .ino** to get the code and upload it to the board with Arduino IDE. Sim does not run Probot Blocks programs.

For the steps that need no file (steps 2 and 4), the tools must be open in the same browser and at
the same address (probotstudio.com). Sim reads the work that Builder and Blocks keep in this browser.

Sim's interface is in Turkish for now. This page quotes Sim's labels in Turkish, with their meaning in
parentheses.

| File | Made by | How | Used by | How |
|---|---|---|---|---|
| Robot (no file) | Builder | **File** > **Try in Sim**, or **Try in Sim** in the **Robot catalog** | Sim | Opens in a new tab with the robot selected. See [Try the robot in Sim (in Turkish)](../builder/simde-dene.md) |
| Robot (no file) | Builder | Saves the project to this browser by itself | Sim | In the **Robot** section, select the row with the "Builder" badge in the **Kaynak** (Source) list. See [Select the robot (in Turkish)](../sim/robotu-sec.md) |
| Robot (`.json`) | Builder | **File** > **Save (download JSON)** | Sim | In the **Robot** section, **Proje dosyası aç** (Open project file), or **Dosya** > **Robot proje dosyası aç…** (File > Open robot project file). See [Open a Builder project file (in Turkish)](../sim/robotu-sec.md#builder-proje-dosyasini-ac) |
| Robot (`.json`) | Builder | **File** > **Save (download JSON)** | Builder | **File** > **Open...**. See [Save to a file and open it (in Turkish)](../builder/dosyaya-kaydet-ve-ac.md) |
| FTC program (no file) | Blocks | The program is open in the **FTC Blocks** tab | Sim | In the **OpMode** list, select the "Blocks'ta açık FTC projesi" row. See [Try the program in Sim](blocks/ftc-simde-dene.md) |
| FTC program (`.blk`) | Blocks | **Download .blk** in the **FTC Blocks** tab | Sim | In the **Kod** (Code) section, **Dosya aç (.blk, .java)** (Open file), or **Dosya** > **Kod dosyası (.blk, .java) aç…** (File > Open code file). See [Open a .blk file (in Turkish)](../sim/programi-sec.md#blk-dosyasini-ac) |
| FTC program (`.blk`) | Blocks | **Download .blk** in the **FTC Blocks** tab | Control Hub | **Upload Op Mode** in the **Blocks** tab. See [Upload the program to the Control Hub](blocks/ftc-control-hub-yukle.md) |
| OnBot Java (`.java`) | Blocks | **Download .java** or **Copy Java** in the **FTC Blocks** tab | Control Hub | In the **OnBot Java** tab, upload or paste it, then press **Build**. See [Upload the program to the Control Hub](blocks/ftc-control-hub-yukle.md) |
| Probot code (`.ino`) | Blocks | **Download .ino** or **Copy code** in the **Probot Blocks** tab | Arduino IDE | Open it with **File** > **Open** and upload it to the board. See [Upload the code to the Probot board](blocks/probot-karta-yukle.md) |
| Probot project (`.probot.json`) | Blocks | **Download blocks** in the **Probot Blocks** tab | Blocks | **Load blocks**. See [Save the project, open it and start over](blocks/probot-projeyi-kaydet.md) |

Sim does not open `.ino` or `.probot.json` files. Sim has no save or export. Changes you make in
Sim do not go back to Builder.

<!-- SAY: We build the robot in Builder, write the program in Blocks and try them together in Sim. -->

## What you need {#ne-gerekir}

The tool pages do not repeat these values; they link to this table. "-" means the value is not known.

| | Blocks | Builder | Sim |
|---|---|---|---|
| Browser | Chrome, Edge, Firefox or Safari, latest version | Chrome, Edge or Firefox, latest version | Chrome, Edge or Firefox, latest version |
| Narrowest screen / touchscreen | If the window is 860 px wide or narrower, the regions stack one below the other. On a phone, the intro card shows a warning, and **Continue anyway** becomes active after 3 seconds. On a touchscreen, dragging blocks and scrolling work. | If the window is 900 px wide or narrower (narrower than 1100 px on a touchscreen), Builder does not open and the "Builder runs on a computer" screen appears. | If the window is 900 px wide or narrower (narrower than 1100 px on a touchscreen), the intro card shows a warning, and **Yine de devam et** (Continue anyway) becomes active after 3 seconds. At 900 px or narrower, the panels become tabs below the scene. |
| Mouse | The wheel scrolls (in FTC Blocks it zooms). In Probot Blocks, you can widen the side panel only with a mouse. | A three-button mouse is recommended: the right button rotates the camera, the middle button pans. | In the 3D scene, the left button rotates the camera, the right button pans and the wheel zooms. |
| Keyboard | For shortcuts and for moving blocks (<kbd>Ctrl</kbd>+<kbd>C</kbd>, <kbd>Ctrl</kbd>+<kbd>V</kbd>) | For shortcuts. Every job also has a button or a menu item. | You need a keyboard or a gamepad to drive in TeleOp. There is no on-screen touch gamepad. |
| Gamepad | Not needed | Not needed | Optional. A USB or Bluetooth gamepad becomes **gamepad1**; only the first gamepad you connect is read. |
| Account / sign-in | Not needed. There is no account and no cloud save. | Not needed. **Save to my account**, **My robots**, **Share link** and **Share your robot** need you to sign in with a Probot account. | Not needed |
| Internet | Needed to open the page. The FTC examples are also loaded from the internet. | Needed to open the page. Part models and account actions also need the internet. | Needed to open the page. |
| Where work is saved | Probot Blocks: the project and WiFi settings are kept in a browser cookie (about 4 KB; a larger project is not saved, and there is no warning). FTC Blocks: the program is kept in the browser (localStorage). Lasting copy: the `.probot.json` and `.blk` files. | The project is kept in the browser (localStorage), saved by itself 1 second after every change. Lasting copy: a `.json` file or your Probot account. | Choices and settings are kept in the browser (localStorage). A robot or program opened from a file is not kept. There is no save or share button. |

!!! warning "Warning"
    Work stored in the browser belongs to that browser. It is lost if you clear your browser data,
    work in a private window or move to another computer. To keep a lasting copy, download it to a file.

<!-- SAY: For all three tools we only need a computer and an up-to-date browser, and no account. -->

## Where to start

- **If you have nothing yet**, start with Sim: [Sim: First 10 minutes (in Turkish)](../sim/ilk-10-dakika.md).
  You need no account, no installation and no robot. You see your first result with a ready-made
  robot and a ready-made program.
- **If you have a Probot kit**, start with the **Probot Blocks** tab in Blocks:
  [Blocks: First 10 minutes](blocks/ilk-10-dakika.md).
- **If you are on an FTC team**, first drive the ready-made robot in Sim, then write your own
  program with **FTC Blocks** in Blocks: [Start with an FTC example](blocks/ftc-ornekle-basla.md).
- **If you want to design a robot or order parts**, start with Builder:
  [Builder: First 10 minutes (in Turkish)](../builder/ilk-10-dakika.md).

<!-- SAY: If we have no robot we start with Sim, and if we have a Probot kit we start with Blocks. -->
