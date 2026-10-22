# Write the functions for the match flow

A Probot program does not use `setup()` and `loop()`. You write init, loop and stop functions for each mode instead. On this page, you see when each one runs and you build the skeleton of the program.

## Before you start

- Arduino IDE is installed and the Probot library is installed. See [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You know the robot's WiFi name, password and channel. See [Set up the robot's WiFi](wifi-ayarla.md).

The code on this page is for version 0.4.0 of the Probot library. Do you have code written for 0.3.0 that uses `robotInit()` and `robotEnd()`? Then read the [Move 0.3.0 code](#gecis) section first.

## Get to know the mode functions {#alti-fonksiyon}

The library defines the `setup()` and `loop()` functions itself. Instead of them, you write functions for each mode. You select the mode on the Driver Station: **Autonomous** means the autonomous phase, **Teleoperated** means the TeleOp phase.

| Function | When it runs | What goes here | Required |
|---|---|---|---|
| `autonomousInit()` | Once, every time you press **Init** while **Autonomous** is selected | Pin settings, stopping the motors, starting values | No |
| `autonomousLoop()` | After **Start**, during autonomous, about 50 times per second | Autonomous movements | Yes |
| `autonomousStop()` | Once, every time autonomous ends | Putting the motors and servos in a safe position | Yes |
| `teleopInit()` | Once, every time you press **Init** while **Teleoperated** is selected | Pin settings, stopping the motors, gamepad mapping | No |
| `teleopLoop()` | After **Start**, during TeleOp, about 50 times per second | Reading the gamepad and driving | Yes |
| `teleopStop()` | Once, every time TeleOp ends | Putting the motors and servos in a safe position | Yes |

The four required functions must be in the program, even if they are empty. If one is missing, the program does not link. An init function you do not write counts as empty. If you write `setup()` or `loop()`, the program does not compile.

Each mode has two more optional functions: `autonomousInitLoop()`, `autonomousStart()`, `teleopInitLoop()` and `teleopStart()`. Most robots do not need them. Details: [Run code between Init and Start](#initloop-start).

## Write the skeleton of the program {#iskelet}

1. In Arduino IDE, open a new sketch and delete the `setup()` and `loop()` functions in it.
2. At the very top, write the three WiFi macros. The macros come before the `#include <probot.h>` line.
3. Below them, write the `#include <probot.h>` line.
4. Add the functions of the two modes as shown below.
5. Compile the code.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void autonomousInit() {}   // runs once when you press Init while Autonomous is selected
void autonomousLoop() {}   // called again and again during autonomous (required)
void autonomousStop() {}   // runs once every time autonomous ends (required)

void teleopInit() {}       // runs once when you press Init while Teleoperated is selected
void teleopLoop() {}       // called again and again during TeleOp (required)
void teleopStop() {}       // runs once every time TeleOp ends (required)
```

Result: Compiling ends without errors. When you upload the code to the robot and press **Init** on the Driver Station, the status LED lights yellow.

## Follow the match flow {#mac-akisi}

The **Match Control** section of the Driver Station has the mode list, the **Init** button and the **Stop** button. The list shows **Autonomous** and **Teleoperated**. After you press **Init**, the button's text changes to **Start**. Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

```text
select mode: Autonomous
Init  ──> autonomousInit() ──> autonomousInitLoop() ... (until Start)
Start ──> autonomousStart() ──> autonomousLoop() ... (for the autonomous duration)
                                    │ when the time is up, by itself
                                    v
                               autonomousStop() ──> transition: Teleoperated selected, waits
Init  ──> teleopInit() ──> teleopInitLoop() ... (until Start)
Start ──> teleopStart() ──> teleopLoop() ...
Stop  ──> teleopStop()
```

- The mode changes only while the robot is stopped: before Init, or after the autonomous time is up. During Init or while running, the list is locked; press **Stop** first.
- **Init** runs the selected mode's init function once. The robot does not move: the gamepad values read as 0, and the signal light stays lit.
- **Start** starts the mode's loop function. The gamepad is read only in this phase.
- Autonomous lasts as long as the time in the **Autonomous süresi** (Autonomous duration) box. The default is 30 seconds. The box is made for a value from 1 to 120; type a whole number. The time starts when `autonomousStart()` ends.
- When the time is up, `autonomousStop()` runs and **Teleoperated** becomes selected by itself. TeleOp does not start by itself: the button's text changes to **Init Teleop**. Press it first, then press **Start**.
- For a match without autonomous, select **Teleoperated** from the start.
- Every time you press **Init**, the init function runs again. The code in it must work correctly when it runs again.

All functions run one after another in a single task. That is why global and `static` variables keep their values between modes. Reset a mode's starting values in that mode's init function.

At each transition, the library resets the gamepad values. In the Init phase and while the robot is stopped, all sticks read as 0 and all buttons as `false`.

## Stop the motors on Stop {#robotend}

After **Stop**, the loop function is not called again. If the code that stops the motor is not in the mode's stop function, the motor keeps turning with the last power it got.

While a mode is in its Init or running phase, the stop function runs once in these cases:

- When you press **Stop**. If the loop is running, it runs after the current pass ends. It also runs if you press it in the Init phase.
- When the autonomous time is up. In this case, `autonomousStop()` runs.
- If the Driver Station sends no data at all for 10 seconds. The library stops the robot by itself.
- When you press **Emergency Stop**. In this case, the stop function has 500 ms. If it takes longer, the board restarts. Until the robot is restarted, it accepts no command except **Emergency Stop** and **Reboot Robot**.

While the robot is stopped, or in the transition after the autonomous time is up, the stop function is not called. At that moment, no mode is running.

Put the stopping code in one function and call it from the init and stop functions of both modes:

```cpp
void stopMotors() {
  analogWrite(16, 0);   // left motor RPWM
  analogWrite(17, 0);   // left motor LPWM
}

void setupMotors() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
  stopMotors();
}

void autonomousInit() { setupMotors(); }
void autonomousStop() { stopMotors(); }   // the motors stop every time autonomous ends

void teleopInit() { setupMotors(); }
void teleopStop() { stopMotors(); }       // the motors stop every time TeleOp ends
```

The stop function must be short. Do not wait or read sensors in it.

To start an emergency stop from the code, call `probot::emergencyStop();`. You can safely make this call from inside any function. What happens next is the same as with the **Emergency Stop** button.

!!! warning "Warning"
    A software stop does not replace a physical emergency stop switch on the power line. If the board locks up completely, only the physical switch works.

## Run code between Init and Start {#initloop-start}

`autonomousInitLoop()` and `teleopInitLoop()` are called again and again between **Init** and **Start**, like a loop. Use them for a check before the match, or to show the state of a sensor or a calibration on the screen. Do not move the robot in this phase; the gamepad reads as 0.

`autonomousStart()` and `teleopStart()` run once when you press **Start**, before the loop. Use them to take a timestamp and to reset counters.

The code below shows after Init whether the arm is down. In autonomous, it drives the left motor forward for 2 seconds:

1. At the very top of the code, write the WiFi macros and the `#include <probot.h>` line.
2. In `autonomousInitLoop()`, read the limit switch and write it to the **Telemetry** panel.
3. In `autonomousStart()`, save the Start moment with `millis()`.
4. In `autonomousLoop()`, drive the motor based on the time that has passed.
5. Upload the code, select **Autonomous** and press **Init**.

```cpp
const int LIMIT_PIN = 4;   // the arm's lower limit switch
uint32_t startMs = 0;      // the moment autonomous started

void stopMotors() {
  analogWrite(16, 0);   // left motor RPWM
  analogWrite(17, 0);   // left motor LPWM
}

void autonomousInit() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
  stopMotors();
  pinMode(LIMIT_PIN, INPUT_PULLUP);
}

void autonomousInitLoop() {
  // Called again and again between Init and Start; do not drive motors here
  probot::clearTelemetry();
  probot::printf("Kol altta: %s\n", digitalRead(LIMIT_PIN) == LOW ? "evet" : "hayir");
}

void autonomousStart() {
  startMs = millis();   // the Start moment
}

void autonomousLoop() {
  uint32_t elapsed = millis() - startMs;   // time since Start (ms)
  if (elapsed < 2000) analogWrite(16, 100);  // forward for the first 2 seconds
  else stopMotors();
}

void autonomousStop() { stopMotors(); }

// TeleOp is empty in this example; these two functions must be in the program
void teleopLoop() {}
void teleopStop() { stopMotors(); }
```

Result: The **Telemetry** panel shows the line "Kol altta: evet" or "Kol altta: hayir", and it changes when you press the switch. When you press **Start**, the motor turns for 2 seconds and stops.

The init, start and stop functions run once, so they get more time than the loop: 10 seconds. You can do a job of a few seconds, like a gyro calibration, in the init function.

## Keep the loop short {#loop-kurali}

The library calls the loop function. When the function returns, the library waits 20 ms and calls it again. The initLoop functions are called the same way. You do not have to put `delay(20)` at the end of the loop.

If a loop or initLoop pass does not return within 2 seconds, the library makes the robot safe. For the init, start and stop functions, this limit is 10 seconds.

- The gamepad values are reset.
- The status LED blinks red.
- This line appears in the **Telemetry** panel:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

The program is not killed, and the board does not restart. When the pass returns, the robot goes back to normal.

If you need to wait, measure the time that has passed with `millis()` instead of `delay()`. Example: [Write the autonomous](otonom-yaz.md). Macros that change the limits: [Loop and emergency stop](makro-listesi.md#dongu).

## Move 0.3.0 code {#gecis}

`robotInit()` and `robotEnd()` from 0.3.0 were removed in 0.4.0. Code that has these two functions does not compile and gives this error:

```text
error: redefinition of 'void robotInit()'
note: 'void robotInit()' previously defined here
void robotInit() = delete; // [PB-E106] removed in 0.4.0: move this code into teleopInit()/autonomousInit()
```

The note line shows the declaration in the library and tells you where to move the code. The same error appears for `robotEnd()`.

To move the code:

1. Move the code in `robotInit()` into `autonomousInit()` and `teleopInit()`. Put the code that is the same in both into one function, and call it from the two init functions.
2. Move the code in `robotEnd()` into `autonomousStop()` and `teleopStop()`.
3. Delete the `robotInit()` and `robotEnd()` functions.
4. If `autonomousStop()` or `teleopStop()` is missing, add it, even if it is empty.
5. Compile the code.

Result: Compiling ends without errors. When you press **Init**, the selected mode's init function runs. When you press **Stop**, its stop function runs.

The behavior changed too:

- The **Autonomous** switch is gone. To start without autonomous, select **Teleoperated** from the list.
- **Init** now only gets the robot ready. The code starts running after **Start**.
- When the autonomous time is up, TeleOp does not start by itself. Press **Init** and **Start** again.
- The phase names of the robot state changed, and the `autonomousEnabled` field is gone: [Robot state](fonksiyon-listesi.md#robot-durumu).

## Having trouble?

- **Compiling shows "undefined reference to" and a function name:** One of the four required functions is missing. The linker may write the name in an encoded form: the line "undefined reference to `_Z10teleopStopv'" means `teleopStop()` is missing. Add the named function, even if it is empty.
- **Compiling shows "redefinition of 'void robotInit()'" or "robotEnd()":** The code was written for 0.3.0. See [Move 0.3.0 code](#gecis).
- **Compiling shows "redefinition of 'void setup()'":** The program has `setup()` or `loop()`. Delete them, and move the code in them into the init and loop functions.
- **The gamepad values read as 0 after Init:** This is expected. The gamepad is read after **Start**.
- **You cannot select a mode in the mode list:** The robot is in the Init or running phase. Press **Stop** first.
- **Autonomous ended, but TeleOp did not start:** This is expected. Press **Init Teleop**, then **Start**.
- **The motor keeps turning after Stop:** The mode's stop function has no code that stops the motor.
- **The LED blinks red:** A loop or initLoop pass went over 2 seconds, or an init, start or stop function went over 10 seconds. See [The LED blinks red: the loop stalled](sorunlar.md#pb-e301-deadline-miss-loop-takildi).

## Next step

[Read the gamepad data](kumandayi-oku.md)
