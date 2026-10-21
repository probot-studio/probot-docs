# Probot block reference

This page lists every block in Probot Blocks, in category order. Block labels are written as they appear on screen.
You can also hover over a block to see a tooltip that explains it.

Fields marked `▾` are dropdowns. Fields in square brackets (`[0.5]`) are slots or number boxes.

The **Code it generates** column shows the code the block generates in **Code Preview**, using the default values from
the block list. An empty condition slot becomes `false` in the code, and an empty number slot becomes `0` or `0.0f`. For
blocks that hold other blocks, only the first line is shown.

<!-- SAY: On this page we can find out what each block does. -->

## Lifecycle blocks

They are already in the workspace, are not in the block list and cannot be deleted. Each one is a function in the code.

| Block | When it runs | Code it generates |
|---|---|---|
| **robotInit** | Once, when **Init** is pressed. Pin and motor setup goes here. | `void robotInit()` |
| **robotEnd** | Once, when **Stop** is pressed. The motors are stopped here. | `void robotEnd()` |
| **autonomousInit** | Once, when autonomous starts. | `void autonomousInit()` |
| **autonomousLoop** | About 50 times per second during autonomous. Do not wait longer than 2 seconds in it. | `void autonomousLoop()` |
| **teleopInit** | Once, when TeleOp starts. | `void teleopInit()` |
| **teleopLoop** | About 50 times per second during TeleOp. Reading the gamepad and driving go here. | `void teleopLoop()` |

<!-- SAY: The six lifecycle blocks decide what the robot does at each moment. -->

## Gamepad

| Block | What it does | Code it generates |
|---|---|---|
| **read gamepad** `js ▾` **deadzone** `[0.08]` | Gets the latest values from the gamepad. It is read on every pass of the loop. The deadzone (0-0.5) treats the small values left over when you let go of a stick as zero. | `auto js = probot::io::joystick_api::makeDefault();` |
| `js ▾` `left stick ↕ (forward +) ▾` | A stick gives a value from -1 to +1. A trigger gives only 1 (pressed) or 0 (not pressed); pressing it halfway does not give a value in between. Options: left/right stick ↕ and ↔, left/right trigger. | `js.getLeftY()` |
| `js ▾` `A (×) ▾` **pressed?** | Returns true if the button is pressed. Options: **A**, **B**, **X**, **Y**, **LB**, **RB**, **Back / Select**, **Start / Options**, **L3**, **R3**. The PlayStation name is shown in parentheses. | `js.getA()` |
| `js ▾` **D-Pad** `up ▾` **pressed?** | Returns true if that D-Pad direction is pressed: up, right, down, left. | `js.getDpadUp()` |
| `js ▾` **D-Pad angle** | Gives the D-Pad direction as one number: -1 none, 0 up, 90 right, 180 down, 270 left. | `js.getPOV()` |
| `js ▾` **connected?** | Returns true if data has come from the gamepad. | `js.isConnected()` |
| **gamepad mapping** `▾` | Selects the gamepad model: "Logitech F310 (default)", "Standard (Xbox One, DS4)", "Axis9 D-Pad", "Tuna default". "Tuna default" uses an old mapping from the library; if your gamepad is one of the first three models, do not select it. Goes in **robotInit**. | `probot::io::joystick_mapping::setActiveByName("logitech-f310");` |
| `js ▾` **raw axis number** `[0]` | Raw axis value without mapping (advanced). | `js.getRawAxis((int)(0))` |
| `js ▾` **raw button number** `[0]` | Raw button value without mapping (advanced). | `js.getRawButton((int)(0))` |

<!-- SAY: The gamepad blocks read the values of the sticks and buttons. -->

## Motor & Drive

These blocks generate code for motor drivers with two PWM inputs (BTS7960-style). **define motor** adds the pin
constants (`const uint8_t solMotor_RPWM = 16;`) and the `setMotor` function to the top of the code.

| Block | What it does | Code it generates |
|---|---|---|
| **define motor** `solMotor ▾` **RPWM pin** `16` **LPWM pin** `17` **reversed** ☐ | Defines the motor with two pins. If **reversed** is checked, the direction flips. Goes in **robotInit**. | `pinMode(solMotor_RPWM, OUTPUT);`<br>`pinMode(solMotor_LPWM, OUTPUT);`<br>`setMotor(solMotor_RPWM, solMotor_LPWM, 0.0f, false);` |
| **drive motor** `solMotor ▾` **power** `[0.5]` | Drives the motor with a power from -1 (full reverse) to +1 (full forward). 0 stops it. | `setMotor(solMotor_RPWM, solMotor_LPWM, (float)(0.5), solMotor_INVERTED);` |
| **stop motor** `solMotor ▾` | Stops the motor. Put one in **robotEnd** for each motor. | `setMotor(solMotor_RPWM, solMotor_LPWM, 0.0f, false);` |
| **tank drive - left motor** `▾` **right motor** `▾` **left power** `[0]` **right power** `[0]` | Each side is driven with its own power. Usually the left stick goes into the **left power** slot and the right stick into the **right power** slot. | `setMotor(solMotor_RPWM, solMotor_LPWM, (float)(0), solMotor_INVERTED);`<br>`setMotor(sagMotor_RPWM, sagMotor_LPWM, (float)(0), sagMotor_INVERTED);` |
| **arcade drive - left motor** `▾` **right motor** `▾` **forward/back** `[0]` **turn** `[0]` | One value gives forward/back, the other gives the turn. The left motor gets forward/back + turn, the right motor gets forward/back - turn. | `setMotor(solMotor_RPWM, solMotor_LPWM, fwd + turn, solMotor_INVERTED);`<br>`setMotor(sagMotor_RPWM, sagMotor_LPWM, fwd - turn, sagMotor_INVERTED);` |
| **precise power** `[x]` | Returns the value cubed. This gives fine control at low speed; -1, 0 and +1 stay the same. | `hassasGuc((float)(0.0f))` |

<!-- SAY: The motor blocks define the motors, drive them and stop them. -->

## Servo

**define servo** adds the line `const uint8_t kolServo_PIN = 4;` and the `servoAngle` function to the top of the
code.

| Block | What it does | Code it generates |
|---|---|---|
| **define servo** `kolServo ▾` **pin** `4` **LEDC channel** `7` | Defines the servo with a pin and a PWM channel (0-15). Goes in **robotInit**. | `ledcAttachChannel(kolServo_PIN, 50, 14, 7);` |
| **servo angle** `kolServo ▾` `[90]` **degrees** | Moves the servo to an angle between 0 and 180 degrees. | `servoAngle(kolServo_PIN, (float)(90));` |
| **stop servo signal** `kolServo ▾` | Stops the servo signal, so the servo goes limp. Good for **robotEnd**. | `ledcWrite(kolServo_PIN, 0);` |

Give each servo its own LEDC channel.

<!-- SAY: The servo blocks move the servo to the angle we want. -->

## Telemetry

These blocks write to the telemetry panel on the Driver Station screen.

| Block | What it does | Code it generates |
|---|---|---|
| **write to telemetry** `["Hello Probot"]` | Writes one line of text. | `probot::println("Hello Probot");` |
| **write value to telemetry - label** `speed` **value** `[x]` | Writes a number with its label, for example "speed: 0.42". | `probot::printf("speed: %.2f\n", (double)(0));` |
| **clear telemetry** | Clears the panel. Use it at the start of the loop. | `probot::clearTelemetry();` |

<!-- SAY: The telemetry blocks write information to the Driver Station screen. -->

## Time

| Block | What it does | Code it generates |
|---|---|---|
| **elapsed time (ms)** | Milliseconds since the robot was switched on. In autonomous, time your waits with this. | `millis()` |
| **wait** `[20]` **ms** | Pauses the program for the given time. In a loop, do not go over 2000 ms. | `delay(20);` |

<!-- SAY: The time blocks measure time or make the program wait. -->

## Pins

| Block | What it does | Code it generates |
|---|---|---|
| **pin** `2` **mode** `OUTPUT ▾` | Makes the pin an output, an input or an input with pull-up. Goes in **robotInit**. | `pinMode(2, OUTPUT);` |
| **digital pin** `2` **→** `HIGH (on) ▾` | Turns the pin on or off. | `digitalWrite(2, HIGH);` |
| **read digital pin** `2` | Returns true if the pin is on. On a pull-up input, a pressed button reads as off. | `(digitalRead(2) == HIGH)` |
| **PWM pin** `16` **value** `[128]` **(0-255)** | Writes a PWM value from 0 to 255 to the pin. | `analogWrite(16, (int)(128));` |
| **read analog pin** `1` | Reads the analog value (0-4095). | `analogRead(1)` |
| **Serial print line** `["debug"]` | Writes a line to the USB serial port. For debugging while the board is connected to a computer. | `Serial.println("debug");` |
| **Serial print** `[ ]` | Writes to the USB serial port without adding a line break. | `Serial.print("");` |

<!-- SAY: The pin blocks read and write the board's pins directly. -->

## Robot

| Block | What it does | Code it generates |
|---|---|---|
| **robot:** `battery voltage (V) ▾` | A number from the robot's state: battery voltage (V), number of connected clients, autonomous period (s). | `probot::robot::state().read().batteryVoltage` |
| **robot** `in autonomous? ▾` | Asks about the robot's state: in autonomous, in TeleOp, missed a deadline (advanced). | `(probot::robot::state().read().phase == probot::robot::Phase::AUTONOMOUS)` |

<!-- SAY: The robot blocks read information such as the battery voltage. -->

## Control

| Block | What it does | Code it generates |
|---|---|---|
| **if** ... **do** | Runs the blocks inside it if the condition is true. To add a branch, press the gear icon. In the small editing area that opens, drag the **else if** or **else** piece under the **if** piece. See [Add an else branch to an if block](probot-bloklari-duzenle.md#degilse-kolu-ekle). | `if (false) {` |
| **repeat** `[5]` **times** | Runs the blocks inside it the given number of times. | `for (int i = 0; i < 5; i++) {` |
| **repeat while** / **repeat until** | Repeats while the condition is true, or until it becomes true. | `while (false) {` / `while (!false) {` |
| **break out of loop** / **continue with next iteration of loop** | Ends the loop, or skips to the next pass. | `break;` / `continue;` |
| **count with** `i ▾` ... | Repeats while counting the variable step by step from one number to another. | `for (i = 0; i <= 10; i++) {` |

Do not run loop blocks for a long time inside **autonomousLoop** or **teleopLoop**. Those blocks already repeat about
50 times per second.

<!-- SAY: The control blocks make decisions based on a condition and repeat things. -->

## Logic

| Block | What it does | Code it generates |
|---|---|---|
| `[ ] = [ ]` | Compares two values: =, ≠, <, ≤, >, ≥. | `0 == 0` |
| `[ ]` **and** `[ ]` | Joins two conditions: **and**, **or**. | `false && false` |
| **true** / **false** | The value true or false. | `true` |
| **not** `[ ]` | Returns the opposite of the condition. | `!true` |
| **test** / **if true** / **if false** | Returns one of two values, based on a condition. In the sample code, **true**, `1` and `0` are plugged into the slots. | `true ? 1 : 0` |

<!-- SAY: The logic blocks give a true or false result. -->

## Math

| Block | What it does | Code it generates |
|---|---|---|
| `0` | A number. | `0` |
| `[1]` **+** `[1]` | Add, subtract, multiply, divide and raise to a power: +, -, ×, ÷, **^**. | `1 + 1` |
| **square root** `[ ]` | An operation on one number: square root, **absolute**, -, ln, log10, e^, 10^. | `sqrt(0)` |
| **sin** `[ ]` | Trigonometry, with the angle in degrees. | `sin((double)(0) * DEG_TO_RAD)` |
| **round** `[ ]` | Rounds a number: round, round up, round down. | `round(0)` |
| **remainder of** `[ ]` **÷** `[ ]` | Returns what is left over after dividing. | `fmod((double)(0), (double)(1))` |
| **constrain** `[ ]` **low** `[ ]` **high** `[ ]` | Keeps the value between two limits. | `constrain((double)(0), (double)(0), (double)(0))` |
| `[ ]` **is even** `▾` | Asks about a property of the number: is even, is odd, is prime, is whole, is positive, is negative, is divisible by. | `(fmod((double)(0), 2) == 0)` |

<!-- SAY: The math blocks do calculations. -->

## Text

| Block | What it does | Code it generates |
|---|---|---|
| `["  "]` | A piece of text. | `""` |
| **create text with** | Joins several pieces into one text. In the sample code, the text `"speed "` and the `speed` variable are plugged in. | `"speed " + String(speed)` |
| **length of** `[ ]` | Returns the number of characters in the text. | `(int)String("").length()` |

To add a piece to the **create text with** block, press the gear icon. In the small editing area that opens, drag the
**item** piece into the **join** piece; to remove one, drag it out. See
[Add an else branch to an if block](probot-bloklari-duzenle.md#degilse-kolu-ekle).

<!-- SAY: The text blocks build pieces of text. -->

## Variables

| Block | What it does | Code it generates |
|---|---|---|
| **Create variable...** | Asks for a new variable name. | Generates no code. |
| **set** `count ▾` **to** `[ ]` | Gives the variable a value. | `count = 0;` |
| **change** `count ▾` **by** `[1]` | Adds the given amount to the variable's value. | `count += 1;` |
| `count ▾` | Returns the variable's value. | `count` |

If a block uses a variable, the line `double count = 0;  // Blockly variable` is added to the
"// --- Definitions (from blocks) ---" section of the code.

More detail: [Create and use a variable](probot-degisken-kullan.md).

<!-- SAY: The variable blocks store values and read them back. -->
