# Upload the program to the Control Hub

On this page you upload the program you got from Blocks to the Control Hub and run it from the
Driver Station. Blocks does not send the program to the Control Hub by itself. The Control Hub
screens are covered in detail in FTC's own documentation.

!!! note "Note"
    The Control Hub steps on this page are based on the FTC documentation. Button names can change
    with the Control Hub software version. To be sure, follow the linked FTC pages.

## Before you start

- A `.blk` or `.java` file you downloaded from Blocks. See [Save the program, open it and get the Java code](ftc-programi-kaydet.md).
  If you do not have a program, start with a ready-made example: [Start with an FTC example](ftc-ornekle-basla.md).
- A Control Hub that is turned on, and a computer connected to its WiFi network.
- An active robot configuration on the Control Hub. Its device names match the **Robot configuration** in Blocks.

## Upload the .blk file to the Blocks editor

1. With the computer on the Control Hub's network, open the Control Hub's page in the browser.
2. Select the **Blocks** tab.
3. Press **Upload Op Mode**.
4. In the window that opens, select the `.blk` file.
5. When the program opens in the Control Hub's Blocks editor, save it.

Result: The OpMode appears in the Driver Station list with its file name (for example
`TankSasiTeleOp`), under the type you picked in Blocks (**TeleOp** or **Autonomous**).

Details: [FTC Docs: Managing OpModes in Blocks](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/blocks/managing_opmodes/managing-opmodes.html)

<!-- SAY: On the Blocks page of the Control Hub we upload the .blk file we downloaded. -->

## Add the Java code to OnBot Java

!!! warning "Warning"
    In OnBot Java, the file name must match the name on the `public class` line of the code. Blocks
    shows this name next to the **OnBot Java** heading. If the names differ, **Build** fails.

1. On the Control Hub's page, select the **OnBot Java** tab.
2. Upload the `.java` file. Or create a new file and give it the name shown next to the **OnBot Java**
   heading in Blocks (for example `TankSasiTeleOp.java`). Then paste the code you got with **Copy Java**.
3. Press **Build** (the wrench icon).

Result: The build succeeds. The OpMode appears in the Driver Station list with
`(Blocks to Java)` at the end of its name (for example `TankSasiTeleOp (Blocks to Java)`).

Details: [FTC Docs: Creating and Running an Op Mode (OnBot Java)](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/onbot_java/creating_op_modes/Creating-and-Running-an-Op-Mode-%28OnBot-Java%29.html)

<!-- SAY: We add the Java code to OnBot Java and build it. -->

## Run the OpMode

!!! warning "Warning"
    If a device name from Blocks is not in the Control Hub configuration, the program shows an error
    at **INIT**. First compare the names letter by letter: [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md).

1. On the Driver Station, select the OpMode. The list shows the name of the file you downloaded, not
   the name you typed in the **OpMode** box. For example, if you typed `Tank Sasi TeleOp`, the list
   shows `TankSasiTeleOp`. If you added it with OnBot Java, the name is `TankSasiTeleOp (Blocks to Java)`.
2. Press **INIT**.
3. Press **START**.

Result: The program runs until you press **STOP**. In the **Tank Chassis TeleOp** example, the
**left stick** of gamepad1 drives the robot forward and back, and the **right stick** turns the robot.

<!-- SAY: We select the program on the Driver Station and start it. -->

## Having trouble?

- **Device not found error at INIT:** A device name from Blocks is missing from the Control Hub
  configuration or is spelled differently. Compare the names letter by letter. See [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md).
- **The program is not in the list:** You may have forgotten to save in the Blocks editor or to press
  **Build** in OnBot Java. Look for the file name in the list (for example `TankSasiTeleOp`), not the name
  you typed in the **OpMode** box.
- **Build fails in OnBot Java:** The file name does not match the `public class` name in the code. Give
  the file the name shown next to the **OnBot Java** heading in Blocks.

## Next step

[Try the program in Sim](ftc-simde-dene.md)
