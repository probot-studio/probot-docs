# Sim

Sim is the tool where you run your robot and your program on a virtual FTC field. You try the robot
you built in Builder and the FTC program you wrote in Blocks or Android Studio without uploading it
to a robot. You watch the autonomous phase and drive in TeleOp with the keyboard. The tool runs in the
browser and needs no account and no installation.

Address: [probotstudio.com/sim](https://probotstudio.com/sim/?dil=en)

!!! warning "Warning"
    Your choices, your settings and the Android Studio project you open are kept only in this
    browser. A robot and a `.blk` program that you open from a file are not kept: if you reload the
    page, you have to open them again. If you clear the browser data or move to another computer,
    everything goes back to the defaults.

## Who it is for

- Teams who want to try their FTC program before they go out on the field.
- Anyone who wants to see how the robot they built in Builder moves on the field.
- Anyone who wants to rehearse the driving keys and the autonomous route before the robot is ready.

<!-- SAY: We try our program in Sim before we go out on the field. -->

## What it does and does not do

| Sim does | Sim does not |
|---|---|
| Puts a Builder robot (a ready-made robot, an open project or a `.json` file) on the field. | Build robots. You build the robot in Builder: [Builder](../builder/index.md). |
| Opens the robot (`.json`) and the program (`.blk`, `.java`) from the **File** menu. | Save or share. Sim has no buttons for these. You save the robot in Builder: [Save to a file and open it](../builder/dosyaya-kaydet-ve-ac.md). You save the program in Blocks: [Save the program, open it and get the Java code](../blocks/ftc-programi-kaydet.md). |
| Runs a Blocks FTC program (`.blk`) the way the Control Hub does. | Run Probot Blocks (`.ino`) programs. A `.ino` program runs on the Probot board: [Upload the code to the Probot board](../blocks/probot-karta-yukle.md). |
| Runs OpModes written in Java in Android Studio (`.java`, the `TeamCode` folder): [Open an Android Studio project](programi-sec.md#android-studio-projesini-ac). | Process camera images. The camera and the Limelight in a Java program see the AprilTags on the field by computing them from their positions: [What works in Java](programi-sec.md#java-calisanlar). |
| Runs the autonomous phase for 30 seconds and TeleOp for 120 seconds. | Export the recording or a video. You watch the autonomous recording in Sim by moving it back and forth: [Run the autonomous phase and review the recording](otonomu-calistir.md). |
| Simulates motors, servos, continuous servos, the IMU and the motor encoders. | Simulate distance, color and touch sensors. Which blocks work: [Select the program](programi-sec.md). |
| Makes the keyboard or a gamepad connected to the computer **gamepad1**. | Support a second gamepad (**gamepad2**). Key and gamepad mapping: [Shortcuts](kisayollar.md). |

The **Multiplayer** and **League** game types are shown on the screen, but they are closed with a
"Coming soon" badge.

<!-- SAY: Sim simulates the motors and the IMU, but it does not support sensors or a second gamepad. -->

## Get started

- [First 10 minutes](ilk-10-dakika.md): watch your first autonomous run with a ready-made robot, then drive in TeleOp.
- [Interface tour](arayuz.md): every region, every button.
- [Shortcuts](kisayollar.md): driving keys, gamepad mapping, mouse.
- [Troubleshooting](sorunlar.md): symptom, cause, fix.

<!-- SAY: If we are new, we start with the first ten minutes page. -->

## Tasks

- [Select the robot](robotu-sec.md): a ready-made robot, a Builder project, a `.json` file, the drive front.
- [Select the program](programi-sec.md): an example program, the program in Blocks, a `.blk` file, an Android Studio project.
- [Connect the devices to ports](cihazlari-porta-bagla.md): match the names in the code to the motors and servos on the robot.
- [Select the field and the starting position](sahayi-ayarla.md)
- [Run the autonomous phase and review the recording](otonomu-calistir.md)
- [Drive in TeleOp with the keyboard or a gamepad](teleopu-sur.md)
- [Change the view and the camera](gorunumu-degistir.md): 2D, 3D, camera angles.
- [Set the motor values and the mass](motorlari-ayarla.md)
- [Arrange the panels](panelleri-duzenle.md)

<!-- SAY: On each task page we do one job step by step. -->

## With the other tools

- You build the robot in Builder: [Builder](../builder/index.md).
- You send the robot in Builder to Sim: [Try the robot in Sim](../builder/simde-dene.md).
- You write the FTC program in Blocks: [Try the program in Sim](../blocks/ftc-simde-dene.md).

<!-- SAY: We build the robot in Builder, write the program in Blocks and try both in Sim. -->

## Glossary

| Term | Meaning |
|---|---|
| Home page | Sim's opening screen. You make your choices in the Robot, Code and Game sections. |
| Workspace | The screen that opens after **Start**: the scene in the middle, the panels around it. |
| Toolbar | The strip under the menu bar: **Home**, the run button (**Start** in TeleOp, **Run** / **Run again** in the autonomous phase; while you drive live, **Stop** takes its place), **Stop**, **Reset**, the view picker (**Fast · 2D** / **Detailed · 3D**), and the **Builder** and **Blocks** links. |
| Scene | The area where the robot and the field are drawn. It is 2D or 3D. |
| Timeline | The playback bar under the scene. |
| Panel | A movable window in the workspace: **Robot**, **Code**, **Field**, **Driver Station**, **Gamepad**. |
| Checklist | A summary of your choices and the warnings, in the bottom strip of the home page. |
| OpMode | A single program that the robot runs in FTC. In Sim, you select it in the **Code** section. |
| Autonomous | An OpMode that runs without a gamepad. In Sim it runs for 30 seconds. |
| TeleOp | An OpMode that the driver controls with a gamepad. In Sim it runs for 120 seconds. |
| Configuration | The mapping that says which port on the robot a device name in the code is connected to. |
| Drive front | Which side of the robot goes in front when the left stick is pushed forward. |
| gamepad1 | The first gamepad that the FTC program reads. The keyboard and a connected gamepad write to it. |
| Telemetry | The lines that the program writes to the Driver Station. |
| `.json` | A Builder project file. |
| `.blk` | An FTC Blocks program file. |
| `.java` | An OpMode file written in Java in Android Studio. |

<!-- SAY: In the glossary we look up the terms that come up often in Sim. -->
