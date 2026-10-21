# Give motors and servos a name and a port

On this page you will give each motor and servo on your robot a name to use in code. You will also
set the hub it is connected to and its port. This information is saved with the project and goes
with the robot to Sim.

![Properties panel with the motor's name, hub and port fields filled in.](../../builder/img/builder-donanim-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/?dil=en | hazirla=hazir:Omni chassis, one motor selected, name and port set | hedef=body | isaret=yok | bekle=text="Port" -->

## Before you start

- The Omni chassis is open in the scene (see [Start with a ready-made robot](hazir-robotla-basla.md)).
  This robot has two **REV HD Hex Motor** parts.
- The **Hardware** section of the **Properties** panel appears only when a motor or a servo is
  selected.

## Name a motor

1. In the **Left panel**, select the **Parts** tab.
2. Type `Motor` in the **Search in parts...** box.
3. In the list, select the first **REV HD Hex Motor** row.
4. In the **Hardware** section of the **Properties** panel, type `solMotor` in the **Name** box.
5. Press <kbd>Enter</kbd>.
   ![Hardware section; the Name box is marked with number 4.](../../builder/img/builder-donanim-ad.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/?dil=en | hazirla=hazir:Omni chassis; Parts tab search "Motor"; first REV HD Hex Motor selected; Name "solMotor" typed | hedef=[data-testid="donanim-ad"] | isaret=4 | bekle=[data-testid="donanim-alani"] -->
   <!-- SAY: We select the motor and give it the name we will use in code. -->

Result: In the **Parts** list, the motor's row shows "solMotor" next to its name.

- A name can be at most 40 characters long. An empty box shows an example: "e.g. leftFrontMotor"
  for a motor, "e.g. armServo" for a servo.
- <kbd>Esc</kbd> cancels what you typed. If you empty the box and press <kbd>Enter</kbd>, the name
  is removed.
- If you give the same name to two parts, "Another part has this name too" appears below the box.
- The **Search in parts...** box also searches hardware names. Type `solMotor` to find the motor.

## Select the hub, port and direction

1. In the **Hardware** section, select **Control Hub** or **Expansion Hub** from the **Hub** list.
   At first it shows **Control Hub**.
2. Select `0` from the **Port** list. The first option is **Not set**.
3. If the motor turns the wrong way, check the **Reverse direction** checkbox.
   ![Hardware section; Hub marked 1, Port marked 2, Reverse direction marked 3.](../../builder/img/builder-donanim-port.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/?dil=en | hazirla=hazir:Omni chassis; first REV HD Hex Motor selected; Name solMotor, Hub Control Hub, Port 0, Reverse direction checked | hedef=[data-testid="donanim-hub"];[data-testid="donanim-port"];[data-testid="donanim-ters"] | isaret=1-3 | bekle=[data-testid="donanim-alani"] -->
   <!-- SAY: We choose which port on which hub the motor is plugged into, and we reverse its direction if needed. -->

Result: The **Hardware** section shows the hub and port you selected and the **Reverse direction**
check mark.

- A motor uses ports 0 to 3. A servo uses ports 0 to 5.
- Only a motor has **Reverse direction**. It reverses the motor's direction in code.
- The part's type appears next to the section heading: "Motor" or "Servo".
- Each change is one undo step.

## Fix a port conflict

Two motors on the same hub cannot use the same port. Motor ports and servo ports are counted
separately: motor port 0 and servo port 0 can be on the same hub.

1. In the **Parts** list, select the second **REV HD Hex Motor** row.
2. Type `sagMotor` in the **Name** box and press <kbd>Enter</kbd>.
3. From the **Hub** list, select the same hub as the first motor.
4. Select `0` from the **Port** list. The warning "Port 0 is used by another motor" appears below
   the section.
5. Select `1` from the **Port** list.
   ![Hardware section; the "Port 0 is used by another motor" warning and the Port list are marked with number 4.](../../builder/img/builder-donanim-cakisma.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/?dil=en | hazirla=hazir:Omni chassis; first motor solMotor Control Hub Port 0; second motor selected, Name sagMotor, Control Hub, Port 0 | hedef=[data-testid="donanim-uyari-port"];[data-testid="donanim-port"] | isaret=4 | bekle=[data-testid="donanim-uyari-port"] -->
   <!-- SAY: When we give two motors the same port, Builder warns us, so we move the second motor to another port. -->

Result: The warning goes away. Each motor has its own name and its own port.

## Find out where this information goes

- **Project file:** The name, hub, port and direction are saved with the project. They are also
  in the file you download with **File** > **Save (download JSON)**.
- **Copies:** If you copy, duplicate, mirror or pattern a motor, only the hub goes to the copy. The
  name, port and **Reverse direction** stay empty in the copy, because two parts cannot use the
  same name or port.
- **Sim:** **File** > **Try in Sim** sends the robot to Sim with this name, hub, port and direction.
  If you left a name empty, Sim gives one in order (motor0, motor1, servo0). If you did not select a
  port, the next number is used. If you did not select a hub, Control Hub is used.
<!-- SAY: The names and ports we set are saved with the project, and they go with the robot when it moves to Sim. -->

## Having trouble?

- **The Hardware section does not appear:** The selected part is not a motor or a servo, or more
  than one part is selected. Select a single motor or servo.
- **"Port N is used by another motor" appears:** Another motor on the same hub uses this port.
  Select another port or another hub. For a servo, the warning is "Port N is used by another servo".
- **"Another part has this name too" appears:** Each name can be used only once, across all motors
  and servos. Type a different name.
- **There is no Reverse direction checkbox:** A servo is selected. Only a motor has **Reverse
  direction**.
- **The copied motor has no name and no port:** Only the hub goes to the copy. Set the name and the
  port again.

## Next step

- Attach the motor to the wheel shaft: [Set up joints and try the motion](eklem-kur-ve-oynat.md)
- Drive the robot: [Try the robot in Sim](simde-dene.md)
