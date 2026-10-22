# Write the functions for the match flow

Probot programs use six functions instead of `setup()` and `loop()`. On this page, you learn when each one runs, and you build the skeleton of the program.

## Before you start

- Arduino IDE is installed and the Probot library is installed. See [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You know the robot's WiFi name, password and channel. See [Set up the robot's WiFi](wifi-ayarla.md).

The code on this page matches version 0.3.0 of the Probot library. Probot Blocks generates the same six functions: [Write a drive program](../blocks/probot-surus-programi-yaz.md).

## Get to know the six functions {#alti-fonksiyon}

The library defines `setup()` and `loop()` itself. You write the six functions below instead.

| Function | When it runs | What goes here |
|---|---|---|
| `robotInit()` | Once, each time you press **Init** on the Driver Station | Pin setup, stopping the motors, gamepad mapping |
| `robotEnd()` | Once, when you press **Stop**, and at an emergency stop | Putting the motors and servos in a safe position |
| `autonomousInit()` | Once, when autonomous starts | Starting values for autonomous |
| `autonomousLoop()` | During autonomous, about 50 times per second | Autonomous movement |
| `teleopInit()` | Once, when TeleOp starts | Preparing for TeleOp |
| `teleopLoop()` | During TeleOp, about 50 times per second | Reading the gamepad and driving |

All six must be in the program. They can stay empty. If you write `setup()` or `loop()`, the program does not compile.

## Write the program skeleton {#iskelet}

1. In Arduino IDE, open a new sketch. Delete the `setup()` and `loop()` functions in it.
2. At the top, write the three WiFi macros. Macros come before the `#include <probot.h>` line.
3. Under them, write the `#include <probot.h>` line.
4. Add the six functions as shown below.
5. Compile the code.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void robotInit() {}        // once, when you press Init
void robotEnd() {}         // once, at Stop: stop the motors here

void autonomousInit() {}   // once, when autonomous starts
void autonomousLoop() {}   // called again and again during autonomous

void teleopInit() {}       // once, when TeleOp starts
void teleopLoop() {}       // called again and again during TeleOp
```

Result: The compile finishes with no errors. When you upload the code and press **Init** on the Driver Station, the status LED lights yellow.

## Follow the match flow {#mac-akisi}

The **Match Control** section of the Driver Station has one button. Its label changes in turn: **Init**, **Start** and **Stop**.

```text
Init ──> robotInit()
Start ──> autonomousInit() ──> autonomousLoop() ... (Autonomous Duration seconds)
                                   │ when the time is up, automatically
                                   v
                              teleopInit() ──> teleopLoop() ...
Stop ──> robotEnd()
```

- When **Autonomous** is on, **Start** starts autonomous. The switch is on by default.
- Autonomous lasts as long as the **Autonomous Duration** box says. The default is 30 seconds. The box is designed for values from 1 to 120. Type a whole number.
- When the time is up, TeleOp starts on its own. `teleopInit()` runs first, then `teleopLoop()`. `robotEnd()` is not called in between.
- When **Autonomous** is off, **Start** starts TeleOp right away.
- If you turn the switch off during autonomous, the robot switches to TeleOp.
- Each time you press **Init**, `robotInit()` runs again. The code inside it must be safe to run more than once.

At each change of phase, the library resets the gamepad values. In the first pass of the new phase, the sticks may read 0.

## Stop the motors at Stop {#robotend}

After **Stop**, the loop functions are not called again. If the code that stops the motor is not in `robotEnd()`, the motor keeps turning at the last power it got.

`robotEnd()` runs in these cases:

- When you press **Stop**. It runs after the current loop pass ends.
- When the Driver Station sends no data for 10 seconds. The library stops the robot by itself.
- When you press **EMERGENCY STOP**. In this case, `robotEnd()` has 500 ms. If it takes longer, the board restarts. Until the robot restarts, it accepts only **EMERGENCY STOP** and **Reboot Robot**. It ignores the other commands.

Collect the stop code in one function. Call it from both `robotInit()` and `robotEnd()`:

```cpp
void stopMotors() {
  analogWrite(16, 0);   // left motor RPWM
  analogWrite(17, 0);   // left motor LPWM
}

void robotInit() { pinMode(16, OUTPUT); pinMode(17, OUTPUT); stopMotors(); }
void robotEnd()  { stopMotors(); }   // at Stop, the motors go to a safe position
```

`robotEnd()` should be short. Do not wait or read sensors inside it.

To start an emergency stop from your code, call `probot::emergencyStop();`. You can make this call from inside any function. After it, the result is the same as the **EMERGENCY STOP** button.

!!! warning "Warning"
    A software stop does not replace the physical emergency stop switch on the power line. If the board locks up completely, only the physical switch works.

## Keep the loop short {#loop-kurali}

The library calls the loop function. When the function returns, the library waits 20 ms and calls it again. You do not have to put `delay(20)` at the end of the loop.

If a loop pass does not finish within 2 seconds, the library puts the robot in a safe state:

- The gamepad values reset to zero.
- The status LED blinks red.
- This line appears in the **Telemetry** panel:

```text
!! LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

The program is not killed, and the board does not restart. When the pass finishes, the robot returns to normal.

If you need to wait, measure the elapsed time with `millis()` instead of `delay()`. Example: [Write the autonomous](otonom-yaz.md).

## Having trouble?

- **The compile shows "undefined reference to" and a function name** (for example, "undefined reference to `robotEnd()'"): One of the six functions is missing. Add the function named in the error, even if it is empty.
- **The compile shows "redefinition of 'void setup()'":** The program has `setup()` or `loop()`. Delete them, and move their code into `robotInit()` and the loop functions.
- **The motor keeps turning after Stop:** There is no code in `robotEnd()` that stops the motor.
- **The LED blinks red:** A loop pass took longer than 2 seconds. See [Errors and troubleshooting](sorunlar.md).

## Next step

[Read the gamepad data](kumandayi-oku.md)
