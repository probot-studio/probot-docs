# Change the view and the camera

On this page you will switch the scene between 2D and 3D, and rotate and zoom the camera on the 3D scene.

![3D scene; Detailed · 3D selected, Field on in the camera buttons, autonomous run finished.](../../sim/img/sim-gorunum-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=Starter Bot + Starter Bot Autonomous (CRServo), BIOBUZZ 2026-27 (match start), Detailed · 3D, autonomous run finished | hedef=body | isaret=yok | bekle=role=button[name="Driver's-eye view"] -->
<!-- SAY: At the end of the page we see the scene in three dimensions and turn the camera to the angle we want. -->

The view changes more than the drawing. It also changes the physics. The same program can give a slightly different result in the two views.

| View | Physics | When |
|---|---|---|
| **Fast · 2D** | Light physics, top-down field. | Trying out a route, or when your computer is slow. The default view. |
| **Detailed · 3D** | Full physics, 3D field. | Collisions, pushing a game element, the HIVE tipping over. |

## Before you start

- The workspace is open, and a robot and an autonomous program are selected. A ready-made example: the **Starter Bot**
  robot and the **Starter Bot Autonomous (CRServo)** program ([Select the robot](robotu-sec.md), [Select the program](programi-sec.md)).
- **Fast · 2D** is selected in the toolbar.

<!-- SAY: We keep the workspace open with the Starter Bot and its autonomous program. -->

## Select the view

!!! tip "Tip"
    If your computer is slow or the 3D scene stutters, stay in **Fast · 2D**. Prepare your route in 2D,
    and check collisions in 3D at the end.

1. When "OpMode ran for … s" appears under the timeline, note the "Collisions …" number.
2. In the toolbar, select **Detailed · 3D**. The scene is drawn again, and the autonomous phase runs again from the start with full physics.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=Starter Bot + Starter Bot Autonomous (CRServo), Fast · 2D | hedef=role=radiogroup[name="View"] >> text="Detailed · 3D" | isaret=2 | bekle=.sahne -->
   ![Toolbar; Detailed · 3D marked with number 2.](../../sim/img/sim-gorunum-sec.png)
3. When the run is over, compare the new "Collisions …" number with the first one.

Result: The scene becomes 3D, and the **Field**, **Driver's-eye view** and **Follow robot** buttons appear in its corner.
The "Collisions …" number can be different from the one in 2D.

While the workspace opens, "Loading workspace…" appears, and while the 3D scene is drawn for the first time, "Loading 3D scene…" appears.
If the computation takes long in 3D, "Computing physics…" appears on the scene.

The same choice is also in the menu bar under **View** > **Scene**, and in **View** in the **Field** panel.
On the home page it is in **View** in the **Game** section. Sim remembers the view you selected in this browser.

If a TeleOp program is selected, changing the view resets the drive. To drive again, press **Start** in the toolbar.

<!-- SAY: When we set the view to 3D, Sim draws the scene in three dimensions and computes it again with full physics. -->

## Read the 2D scene

1. In the toolbar, select **Fast · 2D**. The autonomous phase runs again with light physics.
2. In the timeline, drag the **Time** slider. The robot moves to where it was at that moment.
3. Move the mouse over the field.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=Fast · 2D, mouse up and to the right of the scene center | hedef=.saha2d__imlec | isaret=3 | bekle=.saha2d__imlec -->
   ![2D scene; the pointer coordinates in the corner marked with number 3.](../../sim/img/sim-gorunum-2b-imlec.png)

Result: The corner of the field shows the pointer's position as "x … · y … in". The path the robot has
taken up to that moment is drawn as a dark dashed line.

| On the 2D scene | Meaning |
|---|---|
| Red robot body | The robot is touching a wall or an obstacle. "The robot is touching a wall or an obstacle" also appears under the timeline. |
| Orange arrow | The front of the robot. |
| Green wheel | The wheel is turning forward. The color gets stronger as the power goes up. |
| Red wheel | The wheel is turning backward. The color gets stronger as the power goes up. |
| Gray wheel | The wheel is stopped. |
| Dark dashed line | The path the robot has taken up to the moment selected in the timeline. |

On the 2D scene, the red alliance wall is on the left, the blue alliance wall is on the right and the audience wall is at the bottom.
On **FTC field (empty)** and **Test field (with obstacles)**, you see a red line along the bottom edge and a blue line along the top edge.
These lines are not alliance walls.

The BIOBUZZ fields do not have these lines; the red and blue shapes there are game areas.

<!-- SAY: When we move the mouse over the 2D scene, the pointer's position on the field appears in inches. -->

## Use the 3D camera {#3b-kamerayi-kullan}

| Mouse | What it does |
|---|---|
| Drag with the left button | Rotates the camera around the field. |
| Drag with the right button | Pans the camera. |
| Wheel | Zooms in and out. |

While rotating, the camera does not go below the floor. If the scene disappears while you pan with the right button, select **Field** in the camera buttons.
The camera goes back to its first angle.

1. In the camera buttons on the scene, select **Field**.
   <!-- CAPTURE: url=https://probotstudio.com/sim/?dil=en#calis | hazirla=Detailed · 3D, autonomous run finished | hedef=role=group[name="Camera"] | isaret=1 | bekle=role=button[name="Driver's-eye view"] -->
   ![3D scene; the camera buttons in the corner marked with number 1.](../../sim/img/sim-gorunum-kamera.png)
2. On the scene, drag with the left button to change the angle.
3. Zoom in with the wheel.

Result: **Field** turns orange (with white text on it). The camera rotates around the field and zooms in on the field with the wheel.

| Button | What it shows |
|---|---|
| **Field** | Shows the whole field diagonally from the audience side. |
| **Driver's-eye view** | Looks at the robot from behind the alliance wall on the robot's side of the field, at a driver's height. The mouse does not work with this camera. |
| **Follow robot** | Looks from close to the robot and slides along with it. You can change the angle with the mouse. |

<!-- SAY: We can set the camera to the field, to the driver's eye or to follow the robot. -->

## Having trouble?

- **The 3D scene is empty or very slow:** Go back to **Fast · 2D**. See [The 3D scene is slow](sorunlar.md#3b-yavas).
- **The mouse does not work in the driver's-eye view:** This is expected with this camera. To rotate, select **Field** in the camera buttons.
- **The TeleOp drive stopped when you changed the view:** This is expected. Press **Start** in the toolbar again.

<!-- SAY: If the scene is slow, we go back to the fast 2D view. -->

## Next step

[Set the motor values and the mass](motorlari-ayarla.md)

<!-- SAY: After the view we look at the motor values. -->
