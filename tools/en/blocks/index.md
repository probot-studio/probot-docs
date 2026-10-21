# Blocks

Blocks is the tool where you write a robot program by arranging blocks. It turns the blocks into
ready-made code: Arduino code (`.ino`) for the Probot kit, and a `.blk` file and OnBot Java for an
FTC robot. The tool runs in the browser and needs no account and no installation.

Address: [probotstudio.com/blocks](https://probotstudio.com/blocks/?dil=en)

!!! warning "Warning"
    Blocks has no account and no cloud save. Your work is stored only in this browser. To keep a
    lasting copy, save it to a file with **Download blocks** (Probot) or **Download .blk** (FTC).

## Who it is for

- People who want to program the Probot kit. Blocks generates the Arduino code for the board.
- FTC teams that prepare a Blocks or OnBot Java program for the Control Hub.
- People who want to try an FTC program in Sim before they upload it to the robot.
- People who want to see the blocks and the code they generate side by side.

<!-- SAY: Blocks is for people who want to write programs for the Probot kit or for an FTC robot. -->

## What it does and does not do

| Blocks does | Blocks does not |
|---|---|
| Generates Arduino code (`.ino`) from Probot blocks and shows it in **Code Preview**. | It does not compile the code or send it to the board. You compile and upload in Arduino IDE: [Upload the code to the Probot board](probot-karta-yukle.md). |
| Generates a `.blk` file and OnBot Java (`.java`) from FTC blocks. | It does not send the program to the Control Hub by itself: [Upload the program to the Control Hub](ftc-control-hub-yukle.md). |
| Hands the FTC program to Sim when Sim is open in the same browser. | It does not run the program by itself. A Probot Blocks program does not run in Sim either. To try an FTC program on a virtual field: [Try the program in Sim](ftc-simde-dene.md). |
| Downloads a Probot project as a `.probot.json` file and an FTC program as a `.blk` file. | It does not save to an account or to the cloud. A Probot project is autosaved only in this browser: [How autosave works](probot-projeyi-kaydet.md#otomatik-kayit). |
| Defines the device names of an FTC program in **Robot configuration**. | It does not design robots. You build the robot in Builder: [probotstudio.com/builder](https://probotstudio.com/builder/?dil=en). |

<!-- SAY: Blocks generates the code, and we compile and upload it with other tools. -->

## Two modes

You work in one of the two tabs in the toolbar.

| Tab | What it is for | What it generates |
|---|---|---|
| **Probot Blocks** | Probot kit (ESP32 board) | `.ino` code, `.probot.json` project file |
| **FTC Blocks** | FTC robot (REV Control Hub) | `.blk` file, OnBot Java (`.java`) |

The first time you open the tool, it opens on the **FTC Blocks** tab. The tab you select is
remembered on your next visit.

<!-- SAY: Blocks has two separate modes, one for the Probot kit and one for an FTC robot. -->

## Get started

Select the starting page that fits your robot.

| Your robot | Start here |
|---|---|
| Probot kit | [First 10 minutes](ilk-10-dakika.md): get your first Probot code from a ready-made example. Then [Set up the robot WiFi](probot-wifi-ayarla.md), [Copy or download the code](probot-kodu-al.md), [Upload the code to the Probot board](probot-karta-yukle.md). |
| FTC robot | [Start with an FTC example](ftc-ornekle-basla.md): open a ready-made FTC program. Then [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md), [Write a new FTC program](ftc-program-yaz.md), [Save the program, open it and get the Java code](ftc-programi-kaydet.md), [Upload the program to the Control Hub](ftc-control-hub-yukle.md). |

- [Interface tour](arayuz.md): every region, every button.
- [Shortcuts](kisayollar.md): keyboard and mouse.
- [Troubleshooting](sorunlar.md): symptom, cause, fix.

<!-- SAY: If we have a Probot kit we start with the first ten minutes page, and if we have an FTC robot we start with an FTC example. -->

## Probot Blocks tasks

- [Start with a ready-made example](probot-ornekle-basla.md)
- [Add, connect and edit blocks](probot-bloklari-duzenle.md)
- [Write a drive program](probot-surus-programi-yaz.md)
- [Create and use a variable](probot-degisken-kullan.md)
- [Set up the robot WiFi](probot-wifi-ayarla.md)
- [Save the project, open it and start over](probot-projeyi-kaydet.md)
- [Copy or download the code](probot-kodu-al.md)
- [Upload the code to the Probot board](probot-karta-yukle.md)
- [Move blocks to FTC Blocks](probot-ftcye-tasi.md)
- [Probot block reference](probot-blok-listesi.md)

<!-- SAY: The Probot tasks go from a ready-made example all the way to uploading the code to the board. -->

## FTC Blocks tasks

- [Start with an FTC example](ftc-ornekle-basla.md)
- [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md)
- [Write a new FTC program](ftc-program-yaz.md)
- [Save the program, open it and get the Java code](ftc-programi-kaydet.md)
- [Upload the program to the Control Hub](ftc-control-hub-yukle.md)
- [Try the program in Sim](ftc-simde-dene.md)
- [FTC block reference](ftc-blok-listesi.md)

<!-- SAY: The FTC tasks go from the robot configuration all the way to the Control Hub and Sim. -->

## Both modes

- [Report a bug](hata-bildir.md)

<!-- SAY: When we see a bug, we report it to the team without leaving the tool. -->

## Glossary

| Term | Meaning |
|---|---|
| Toolbar | The top strip with the mode tabs, the project name and the file buttons. |
| Block list | The list of categories next to the workspace (**Gamepad**, **Motor & Drive**...). |
| Block panel | The panel that opens when you press a category and shows the blocks of that category. |
| Workspace | The large area where you arrange blocks. Its background is dotted in Probot mode and plain white in FTC mode. |
| Side panel | The settings and code panel next to the workspace. |
| Lifecycle blocks | The six blocks that are already there in Probot mode and cannot be deleted (**robotInit**, **teleopLoop**...). They set what the robot does at each moment. |
| Variable | A name that stores a value. Motor, servo and gamepad names are variables too. |
| OpMode | In FTC, the one program the robot runs. You select it by name on the Driver Station. |
| Robot configuration | The names of the motors, servos and sensors connected to the Control Hub. |
| `.ino` | The code file that Arduino IDE opens. |
| `.probot.json` | The Probot Blocks project file: blocks, project name, WiFi settings. |
| `.blk` | The FTC Blocks program file. The Blocks editor on the Control Hub uses the same format. |
| OnBot Java | The Java editor on the Control Hub. Blocks generates Java code to paste into this editor. |

<!-- SAY: The region names in these docs match the places on the screen. -->
