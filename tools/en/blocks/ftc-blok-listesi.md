# FTC block reference

This page lists the categories in FTC Blocks and the blocks inside them. The blocks come from FTC's own Blocks
editor and are in English. They work the same as the blocks with the same names on the Control Hub. For more
detail, see the FTC docs: [FTC Docs: Blocks](https://ftc-docs.firstinspires.org/en/latest/programming_resources/blocks/Blocks-Tutorial.html).

The block list has only the blocks a school robot needs. Device types are limited to DcMotor, Servo, CRServo and
IMU. There are no color, distance or touch sensors.

The **Code it generates** column shows the line the block generates in the **OnBot Java** section. In place of
`<name>`, the code uses the device name from the **Robot configuration**.

<!-- SAY: The blocks work the same as the ones on the Control Hub, and here we have the ones a school robot needs. -->

## How device categories appear

The categories under **Actuators** and **Sensors** are built from the **Robot configuration**. Each device gets
a category with its own name. If the configuration has no device of a type, that category does not appear. See
[Set up the robot configuration](ftc-yapilandirmayi-ayarla.md).

<!-- SAY: We see the motor and sensor categories built from the device names in the configuration. -->

## LinearOpMode

| Block | What it does | Code it generates |
|---|---|---|
| **call waitForStart** | Waits until **START** is pressed. | `waitForStart();` |
| **call idle** | Inside a loop, gives the processor a short break. | `idle();` |
| **call sleep** `1000` | Waits for the given number of milliseconds. | `sleep(1000);` |
| **call opModeInInit** | Returns true between **INIT** and **START**. | `opModeInInit()` |
| **call opModeIsActive** | Returns true while the program is running. It is the condition of the main loop. | `opModeIsActive()` |
| **call isStarted** / **call isStopRequested** | Was **START** pressed? / Was **STOP** requested? | `isStarted()` / `isStopRequested()` |
| **call getRuntime** / **call resetRuntime** | Returns how long the OpMode has been running / resets it to zero. | `getRuntime()` / `resetRuntime();` |
| **call requestOpModeStop** | Stops the program. | `requestOpModeStop();` |

<!-- SAY: We use the LinearOpMode blocks to manage the flow of the program. -->

## Gamepad

| Group | Blocks | Code it generates |
|---|---|---|
| Sticks and triggers (number) | `gamepad1.LeftStickX`, `LeftStickY`, `RightStickX`, `RightStickY`, `LeftTrigger`, `RightTrigger` | `gamepad1.left_stick_x`, `gamepad1.left_stick_y`, `gamepad1.left_trigger` |
| Buttons (true/false) | `A`, `B`, `X`, `Y`, `LeftBumper`, `RightBumper`, `DpadUp`, `DpadDown`, `DpadLeft`, `DpadRight`, `Back`, `Start`, `LeftStickButton`, `RightStickButton` | `gamepad1.a`, `gamepad1.left_bumper`, `gamepad1.dpad_up` |
| **Pressed** | `AWasPressed` ... `DpadRightWasPressed`: returns true once when the button was newly pressed. | `gamepad1.a_was_pressed()` |
| **Rumble** | `rumble` (500 ms), `rumbleBlips` (3), `isRumbling`, `stopRumble`: make the gamepad vibrate. | `gamepad1.rumble(500);`, `gamepad1.rumbleBlips(3);`, `gamepad1.isRumbling()`, `gamepad1.stopRumble();` |

Every Gamepad block comes with `gamepad1`. For a second gamepad, select `gamepad2` from the dropdown on the block.
The block's property dropdown also has options that are not in the block list: release options such as
`AWasReleased`, PlayStation names such as `Circle` and `Cross`, and `Touchpad`.

<!-- SAY: We read the sticks and buttons of the gamepad with the Gamepad blocks. -->

## Actuators

| Subcategory | Blocks | Code it generates |
|---|---|---|
| **DcMotor** > `<name>` | Set `Power` (1 and 0), read `Power`. | `<name>.setPower(1);`, `<name>.getPower()` |
| **DcMotor** > `<name>` | Set `Direction`, `ZeroPowerBehavior`, `Mode` (RunMode). | `<name>.setDirection(DcMotor.Direction.REVERSE);`, `<name>.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);`, `<name>.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);` |
| **DcMotor** > `<name>` | Read `CurrentPosition`, set and read `TargetPosition`, `isBusy`. | `<name>.getCurrentPosition()`, `<name>.setTargetPosition(0);`, `<name>.isBusy()` |
| **DcMotor** > `<name>` | A block that sets `Power` on two motors at once. It appears when the configuration has at least two motors. | `<name1>.setPower(1);` and `<name2>.setPower(1);` |
| **DcMotor** > `<name>` > **Extended** | Set and read `Velocity`, `getCurrent`. | `((DcMotorEx) <name>).setVelocity(0);`, `((DcMotorEx) <name>).getVelocity()` |
| **Servo** > `<name>` | Set (0.5) and read `Position`, `Direction`, `scaleRange` (0.2-0.8). | `<name>.setPosition(0.5);`, `<name>.getPosition()`, `<name>.setDirection(Servo.Direction.REVERSE);`, `<name>.scaleRange(0.2, 0.8);` |
| **CRServo** > `<name>` | Set `Power` (1 and 0), `Direction`. | `<name>.setPower(1);`, `<name>.setDirection(CRServo.Direction.REVERSE);` |

<!-- SAY: We drive the motors and servos with the Actuators blocks. -->

## Sensors

| Subcategory | Blocks | Code it generates |
|---|---|---|
| **IMU** > `<name>` | `initialize` (with the REV hub orientation), `resetYaw`. | `<name>.initialize(new IMU.Parameters(...));`, `<name>.resetYaw();` |
| **IMU** > `<name>` | `RobotYawPitchRollAngles`, `Yaw` (with an angle unit). | `<name>.getRobotYawPitchRollAngles()`, `orientation.getYaw(AngleUnit.DEGREES)` |
| **IMU** > `<name>` | `getRobotAngularVelocity`, `ZRotationRate`. | `<name>.getRobotAngularVelocity(AngleUnit.DEGREES)`, `angularVelocity.zRotationRate` |

<!-- SAY: We measure which way the robot is facing with the IMU blocks. -->

## Utilities

| Subcategory | Blocks | Code it generates |
|---|---|---|
| **ElapsedTime** | Create a timer, `Seconds`, `Milliseconds`, `reset`. | `new ElapsedTime()`, `myElapsedTime.seconds()`, `myElapsedTime.milliseconds()`, `myElapsedTime.reset();` |
| **Range** | `clip` (limits a value), `scale` (converts a value to another range). | `Range.clip(0, -1, 1)`, `Range.scale(0, 0, 1, 0, 100)` |
| **Telemetry** | `addData` (number), `addData` (text), `addLine`, `update`. | `telemetry.addData("key", 123);`, `telemetry.addData("key", "text");`, `telemetry.addLine("text");`, `telemetry.update();` |
| **Time** | `currentTimeMillis`, `nanoTime`. | `System.currentTimeMillis()`, `System.nanoTime()` |

<!-- SAY: We use the Utilities blocks for time, ranges and telemetry. -->

## General programming blocks

| Category | Blocks |
|---|---|
| **Logic** | `if`, `if-else`, `if-else if-else`, comparison, `and` / `or`, `not`, `true` / `false`, `test` / `if true` / `if false` choice. |
| **Loops** | `repeat 10 times`, `repeat while`, `count with` (1-10), `for each item`, `break out of loop` (you can select `continue with next iteration of loop` from its dropdown). |
| **Math** | Number, + − × ÷ ^, negative, absolute value, square root, trigonometry, `atan2`, constants, rounding, `min` / `max`, remainder, constrain, random number. |
| **Text** | Text, join, length, `formatNumber`. |
| **Lists** | Empty list, create list, length, get item, set item. |
| **Variables** | **Create variable...** and the variable blocks. |
| **Functions** | Function definition (`to do something`), function that returns a value, `if return`, call blocks. |

You can see the code these blocks generate in the **OnBot Java** section.

<!-- SAY: We use the logic, loop and math blocks in every program. -->
