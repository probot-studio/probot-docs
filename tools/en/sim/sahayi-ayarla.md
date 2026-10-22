# Select the field and the starting position

On this page you will select the field the robot runs on and the robot's first position on the field.

![Game section; Fast · 2D, BIOBUZZ 2026-27 (match start) and Red, audience wall selected, the robot in the preview.](../../sim/img/sim-saha-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=Starter Bot + Starter Bot Autonomous (CRServo), Fast · 2D, BIOBUZZ 2026-27 (match start), Red, audience wall | hedef=role=radio[name="Fast · 2D"]; role=button[name=/^BIOBUZZ 2026-27/]; role=button[name="Red, audience wall"] | isaret=yok | bekle=text="Starting position" -->
<!-- SAY: In the end our robot stands on the field we selected, at the position we selected. -->

Selecting the field works the same in the **Game** section of the home page and in the **Field** panel of the workspace.

## Before you start

- The Sim home page is open. If you are in the workspace, press **Home** in the toolbar, or go to the
  [Change the field in the workspace](#calisma-alaninda-sahayi-degistir) section.
- A robot and a program are selected: [Select the robot](robotu-sec.md), [Select the program](programi-sec.md).

<!-- SAY: We start selecting the field from the home page of Sim. -->

## Select the field

| Field | What is on it |
|---|---|
| **FTC field (empty)** | No obstacles, no game elements, AprilTags on the walls. For trying routes and driving. |
| **Test field (with obstacles)** | 3 obstacles, 7 game elements, AprilTags on the walls. For trying collisions. |
| **BIOBUZZ 2026-27 (match start)** | The layout at the start of the match: the HIVE and FLOWER structures, 30 game elements. The default field. |
| **BIOBUZZ practice (NECTAR on the floor)** | The match start layout (30 elements) plus 24 game elements added on the floor (8 red NECTAR, 8 blue NECTAR, 8 POLLEN); 54 game elements in total. |

1. In the **Game** section of the home page, select **Solo** from the **Game type** cards.
   The field choice appears only in this game type.
2. In the **Field** list, select a field, for example **Test field (with obstacles)**.
   Under each row, the number of obstacles and game elements is shown.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=Starter Bot + Starter Bot Autonomous (CRServo) | hedef=role=button[name=/^Test field/] | isaret=2 | bekle=text="Starting position" -->
   ![Game section; Test field in the Field list is marked with number 2.](../../sim/img/sim-saha-sec.png)
3. In **View**, select **Fast · 2D** or **Detailed · 3D**.

Result: The starting position preview draws the field you selected. The checklist in the bottom strip
reads "Field: <field name>, fast 2D view" ("detailed 3D view" if **Detailed · 3D** is selected).

In the **Detailed · 3D** view, the robot can push the game elements. When enough elements go into the top
cell of the HIVE in BIOBUZZ and stay there for a short time, the HIVE tips over by itself. The robot cannot tip the HIVE over by pushing it.

In the **Fast · 2D** view, the HIVE and FLOWER structures are fixed. Only the elements that start on the floor can be pushed;
the elements in the HIVE cells and on top of the FLOWER stay where they are. You cannot add elements to the field or delete them.

There are AprilTags on the walls of **FTC field (empty)** and **Test field (with obstacles)**. In the 2D scene
they are drawn as a thin black strip at the foot of the wall, in the 3D scene as a plate against the wall. The camera
and the Limelight in a Java program see these tags: [What works in Java](programi-sec.md#java-calisanlar).

The difference between the views: [Change the view and the camera](gorunumu-degistir.md).

<!-- SAY: We choose between the empty field, the test field with obstacles and the BIOBUZZ fields. -->

## Select a ready-made starting position

| Starting position | x | y | heading |
|---|---|---|---|
| **Red, audience wall** | -36 in | -63 in | 90° |
| **Red, alliance wall** | -63 in | 0 | 0° |
| **Blue, audience wall** | 36 in | -63 in | 90° |
| **Blue, alliance wall** | 63 in | 0 | 180° |
| **Field center** | 0 | 0 | 0° |

!!! note "Note"
    If you already ran a program in the workspace, the preview keeps showing the last frame of that run. The robot
    does not move. To see the new position, reload the page, or press **Reset** in the workspace before
    you go back to **Home**. If you press **Start**, the robot starts from its new position in the workspace.

1. In the **Game** section, in the **Field** list, select **BIOBUZZ 2026-27 (match start)**.
2. In the **Starting position** row, select a button, for example **Blue, alliance wall**.
   The button turns dark. The **x**, **y** and **heading** boxes show the button's values.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=Starter Bot, BIOBUZZ 2026-27 (match start) | hedef=role=button[name="Blue, alliance wall"] | isaret=2 | bekle=text="Starting position" -->
   ![Starting position buttons; Blue, alliance wall is marked with number 2.](../../sim/img/sim-saha-baslangic.png)
3. In the bottom strip, press **Start**.

Result: The workspace opens. The robot starts on the field from the starting position you selected, facing the heading in the table.

<!-- SAY: When we select one of the ready-made starting positions the robot moves to that point on the field. -->

## Type the starting position

The center of the field is the point (0, 0). The field is 144 × 144 inches; the edges are between -72 and 72.

- On the BIOBUZZ fields, minus **x** is toward the red alliance side and plus **x** is toward the blue alliance side.
- Minus **y** is toward the audience wall on all fields.
- On FTC field (empty) and the Test field, the 2D view draws the red line on the bottom edge (y minus) and the blue line
  on the top edge (y plus).
- The names of the ready-made starting positions follow the x direction on all fields (red is x minus, blue is x plus).
- At a **heading** of 0°, the robot faces the x plus direction; in BIOBUZZ this is the blue side. At 90°, the robot faces away
  from the audience wall.

!!! tip "Tip"
    In the 2D scene, when you move the mouse over the field, the corner shows the pointer's position as "x … · y … in".
    You can type this value into the boxes.

1. In the **x** box, type a number in inches, for example `0`.
2. In the **y** box, type a number, for example `-48`.
3. In the **heading** box, type degrees, or change it in steps of 15 degrees with the box's arrows.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en | hazirla=Starter Bot, x 0, y -48, heading 90 | hedef=label:has-text("x") >> input; label:has-text("y") >> input; label:has-text("heading") >> input | isaret=1,2,3 | bekle=text="Starting position" -->
   ![Starting position boxes; x is marked with number 1, y with 2 and heading with 3.](../../sim/img/sim-saha-elle.png)

Result: The robot moves to its new position in the preview. If the value does not match a ready-made position, no button is dark.
If you already ran a program in the workspace, the preview stays on the frame of the last run (see the note in the "Select a ready-made starting position" section).

<!-- SAY: We can also type the starting position by hand with x and y values in inches. -->

## Change the field in the workspace {#calisma-alaninda-sahayi-degistir}

The **Field** panel has the same choices as the **Game** section of the home page. At the top of the panel there is also the **View** picker.

!!! note "Note"
    If you change the field or the starting position while you drive in TeleOp, driving stops and is reset. To drive
    again, press **Start** in the toolbar.

1. In the workspace, in the left panels, select the **Field** tab.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=Starter Bot + Starter Bot Autonomous (CRServo), BIOBUZZ 2026-27 (match start), autonomous finished, Field tab selected | hedef=.dv-tab:has-text("Field") | isaret=1 | bekle=text="Starting position" -->
   ![Left panel group; the Field tab is marked with number 1, with the Field and Starting position choices below it.](../../sim/img/sim-saha-panel.png)
2. In the **Field** list, select a field.
3. In the **Starting position** row, select a button, or type values into the **x**, **y** and **heading** boxes.

Result: The autonomous program runs again by itself on the new field from the new position. In the **Game**
section of the home page, the same field and starting position are selected too.

<!-- SAY: When we change the field in the workspace the autonomous runs again by itself. -->

## Read the field note

On the BIOBUZZ fields, there is a **Field note** box in the corner of the scene. The other fields do not have this box.

1. In the workspace, in the **Field** panel's **Field** list, select a BIOBUZZ field, for example
   **BIOBUZZ 2026-27 (match start)**.
2. In the corner of the scene, press **Field note**.
   The box opens and shows the note.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=BIOBUZZ 2026-27 (match start), Fast · 2D, Field note open | hedef=summary:has-text("Field note") | isaret=2 | bekle=text="Field note" -->
   ![Corner of the scene; the open Field note box is marked with number 2.](../../sim/img/sim-saha-notu.png)
3. To close it, press **Field note** again.

Result: The box closes.

On the **BIOBUZZ 2026-27 (match start)** field, the note says: "Dimensions are from the game manual (v0.9); tube thicknesses and
the FLOWER's distance from the wall are approximate. The 5 NECTAR waiting in each alliance area and each robot's 4 preloaded POLLEN are not shown."

On the **BIOBUZZ practice (NECTAR on the floor)** field, the note starts with "Practice layout (not the official match start)."

<!-- SAY: The field note tells us which dimensions of the BIOBUZZ field are approximate. -->

## Next step

[Run the autonomous phase and review the recording](otonomu-calistir.md)

<!-- SAY: When the field is ready we run the autonomous phase. -->
