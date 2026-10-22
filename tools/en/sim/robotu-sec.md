# Select the robot

On this page you will select the robot that goes out on the field in Sim: a ready-made robot, the
project open in Builder or the project file you downloaded from Builder. Then you will set which
end of the robot goes in front.

Selecting a robot works the same in the **Robot** section of the home page and in the **Robot**
panel of the workspace. The robot you select in one is selected in the other too.

## Before you start

- Sim is open: [probotstudio.com/sim](https://probotstudio.com/sim/?dil=en).
- Computer and browser: [What you need](../index.md#ne-gerekir).
- If you bring your own robot, it must be built in Builder: [Builder](../builder/index.md).

<!-- SAY: Before we start we open Sim, and if we have our own robot we have already built it in Builder. -->

## Select a ready-made robot {#hazir-robot-sec}

The ready-made robots are Builder templates sold by Probot: **Starter Bot**, **Omni chassis**, **WattOS mecanum chassis**.

!!! tip "Tip"
    Select the robot first, then the program. If an example program is selected and you press a ready-made
    robot, even the robot that is already selected, the program goes back to that robot's example.

1. If you are in the workspace, press **Home** in the toolbar. On the home page titled "Try your
   robot on the field", the first section is **Robot**.
2. In the **Source** list of the **Robot** section, select a robot, for example **WattOS mecanum chassis**.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=intro card and cookie banner closed | hedef=role=button[name=/^WattOS mecanum chassis/] | isaret=2 | bekle=text="Source" -->
   ![Robot section; WattOS mecanum chassis in the Source list is marked with number 2.](../../sim/img/sim-robot-hazir.png)
3. If your own program is selected in the **Code** section, select the robot's example from the
   **OpMode** list, for example **Mecanum Chassis TeleOp**. Examples: [Select an example program](programi-sec.md#ornek-programi-sec).

Result: The summary under the section title shows the robot's name, drive type, and number of
motors and servos, for example "WattOS mecanum chassis · Mecanum, motors: 4, servos: 0". The
checklist in the bottom strip also says "Robot: WattOS mecanum chassis (Mecanum, motors: 4,
servos: 0)". The example program in the **Code** section switches to the example for this robot.

<!-- SAY: When we select one of the ready-made robots, Sim also selects the matching example program by itself. -->

If a program you opened yourself or one that came from Blocks is selected, the program does not
change when the robot changes.

## Select the project open in Builder

If Builder and Sim are open in the same browser, Sim sees the project that Builder saved automatically.

!!! tip "Tip"
    Open Builder in the same browser as Sim and at the same address (probotstudio.com). The project
    must have at least one part; an empty project does not show up in the list.

1. In the toolbar, press **Builder**. Builder opens in a new tab.
2. In Builder, build or open your robot. Builder saves the project by itself.
3. Go back to the Sim tab.
4. In the **Source** list, select the row with the "Builder" badge.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=the ready-made Omni chassis loaded in Builder in the same browser | hedef=.ks-oge:has-text("Project open in Builder") | isaret=4 | bekle=text="Project open in Builder" -->
   ![Robot section; the row with the Builder badge in the Source list is marked with number 4.](../../sim/img/sim-robot-builder.png)

Result: The row's description says "Project open in Builder, <number of parts> parts", and the
robot is selected. If the project was built from a Builder template, the example program in the
**Code** section also switches to that template's example. If a program you opened yourself or one
that came from Blocks is selected, the program does not change.

As you change the project in Builder, Sim reads the robot in the list again.

If you select **File** > **Try in Sim** in Builder, Sim opens in a new tab with this row selected.
For a project built from a template, the example program is selected by the same rule:
[Try the robot in Sim](../builder/simde-dene.md).

<!-- SAY: If Builder is open in the same browser, the robot we built comes into Sim's list by itself. -->

## Open a Builder project file {#builder-proje-dosyasini-ac}

You open a robot built on another computer with the `.json` file that Builder downloaded.

!!! warning "Warning"
    The list holds only one file robot at a time. When you open a new `.json` or reload the page,
    the previous file robot leaves the list.

1. In the **Robot** section, press **Open project file** (or select **File** > **Open robot project file…**).
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=intro card and cookie banner closed | hedef=role=button[name="Open project file"] | isaret=1 | bekle=text="Source" -->
   ![Robot section; the Open project file button is marked with number 1.](../../sim/img/sim-robot-dosya-ac.png)
2. In the window that opens, select the `.json` file you downloaded from Builder.
3. Press **Open**.

Result: The robot is added to the list with the "file" badge and is selected. Its description says
"From file: <file name>".

If the file is not a Builder project, an error appears. If you opened it with **Open project file**,
the error shows in a red box in the **Robot** section. If you opened it from the **File** menu, the
error shows in a notification at the bottom of the screen for a few seconds ("This file is not a
Builder project." or "Could not read the Builder project file (not JSON).").

See [A file does not open](sorunlar.md#robot-dosyasi-acilmiyor).

<!-- SAY: We can open the project file we downloaded from Builder in Sim. -->

## Set the drive front {#surus-onunu-ayarla}

If the robot goes backward on the field or faces the wrong way at the start, change the drive front.

1. In the **Source** list of the **Robot** section, select the robot you want to set.
2. In the **Drive front** picker, select **Front in Builder** or **Back side**.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=Starter Bot selected | hedef=role=radiogroup[name="Drive front"] | isaret=2 | bekle=text="Drive front" -->
   ![Robot section; the Drive front picker is marked with number 2.](../../sim/img/sim-robot-surus-onu.png)
3. In the **OpMode** list of the **Code** section, select a program with the "TeleOp" badge.
4. In the bottom strip, press **Start**. The workspace opens and live driving starts.
5. Hold down <kbd>W</kbd>.

Result: The robot drives with the side you selected in front. At the start, this side
faces into the field. The orange arrow in the preview is the starting direction and does not change; what
changes is which side of the robot faces that direction. The robot's front and back are easier to
tell apart in the **Detailed · 3D** view.

On the Starter Bot, **Back side** is selected by default, and the robot drives with the shooter in
front. When you select **Front in Builder**, the "Starter Bot drives with the shooter at the front; …"
item disappears from the robot notes. The setting is kept separately for each robot.

<!-- SAY: If the robot goes backward, changing the drive front is enough. -->

## Read the robot notes

When Sim puts the robot on the field, it fills in some missing pieces by itself. It lists them item
by item under the **Robot** section. Example Starter Bot notes:

- "Builder set up 13 joints on its own (they were not in the project)."
- "Shooter motor taken as 1:1 (6000 rpm); the Builder template shows 19.2:1."
- "Chassis motors taken as 12:1 (3:1 + 4:1 cartridges)."
- "Starter Bot drives with the shooter at the front; at the start Sim places the robot with the shooter side facing the field."

The notes are for information; you do not need to do anything.

<!-- SAY: When Sim puts the robot on the field, it writes the pieces it filled in into the robot notes. -->

## Having trouble?

- **"No drive wheel connected to a motor was found on the robot; it will not move." warning:** In
  Builder, connect the wheels to a motor. See [The robot does not move](sorunlar.md#robot-kipirdamiyor).
- **My Builder project is not in the list:** Open Builder in the same browser and at the same
  address (probotstudio.com). Add at least one part to the project.
- **The robot I opened from a file is gone after I reloaded the page:** A file robot is not kept.
  Open the file again with **Open project file**.

<!-- SAY: If the robot does not move, we check that the wheels are connected to a motor. -->

## Next step

[Select the program](programi-sec.md)

<!-- SAY: After we select the robot, we select the program. -->
