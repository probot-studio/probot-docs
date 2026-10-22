# Functions and state list

This page lists all functions of Probot Core 0.4.0 that you can use from your code. It also lists the robot state fields and the HTTP addresses.

All of them come with `#include <probot.h>`.

## Mode functions {#hooklar}

`setup()` and `loop()` belong to the library; do not write them in your code. The library calls the functions below at given moments of the match. You must define the required ones, even if they are empty. If one is missing, the code does not link. An optional function that you do not define counts as empty.

| Function | When it is called | Required |
|---|---|---|
| `autonomousInit()` | Once, every time you press **Init** while **Autonomous** is selected. Pin settings and starting values go here. | No |
| `autonomousInitLoop()` | Again and again, between the autonomous **Init** and **Start**. The gamepad reads as 0; do not move the robot here. | No |
| `autonomousStart()` | Once, at **Start**, before `autonomousLoop()`. The autonomous time starts when this function ends. | No |
| `autonomousLoop()` | Again and again, during autonomous. After each pass, the library waits 20 ms. | Yes |
| `autonomousStop()` | Once, every time autonomous leaves its Init or running phase: **Stop**, the end of the autonomous time, a Driver Station connection lost for 10 seconds (with the default setting), an emergency stop. | Yes |
| `teleopInit()` | Once, every time you press **Init** while **Teleoperated** is selected. | No |
| `teleopInitLoop()` | Again and again, between the TeleOp **Init** and **Start**. | No |
| `teleopStart()` | Once, at **Start**, before `teleopLoop()`. | No |
| `teleopLoop()` | Again and again, during TeleOp, with a 20 ms wait after each pass. | Yes |
| `teleopStop()` | Once, every time TeleOp leaves its Init or running phase: **Stop**, a lost connection, an emergency stop. | Yes |

When the autonomous time is up, `autonomousStop()` runs and **Teleoperated** becomes selected. TeleOp does not start by itself; it needs **Init** and **Start**.

All functions run one after another in the same task. A phase change takes effect when the current pass ends. Global variables keep their values between modes.

If an initLoop or loop pass takes longer than 2 seconds, the gamepad inputs are reset and the status LED blinks red. For the init, start and stop functions, the limit is 10 seconds. The code is not stopped; when the pass ends, everything goes back to normal. Details: [Keep the loop short](hooklari-yaz.md#loop-kurali).

`robotInit()` and `robotEnd()` from 0.3.0 were removed. If they stay in your code, compiling stops with the error "redefinition of 'void robotInit()'": [Move 0.3.0 code](hooklari-yaz.md#gecis).

## Gamepad {#kumanda}

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

`makeDefault()` returns a light object. Calling it again in every loop pass is normal.

| Function | Returns | Description |
|---|---|---|
| `getLeftX()`, `getLeftY()` | `float` -1..+1 | Left stick. Y is positive when you push it up. |
| `getRightX()`, `getRightY()` | `float` -1..+1 | Right stick. |
| `getLeftTriggerAxis()`, `getRightTriggerAxis()` | `float` 0 or 1 | Triggers. 1 when pressed, 0 when not; there is no value in between. |
| `getA()`, `getB()`, `getX()`, `getY()` | `bool` | Buttons with their Xbox names. |
| `getCross()`, `getCircle()`, `getSquare()`, `getTriangle()` | `bool` | The same buttons (A, B, X, Y) with their PlayStation names. |
| `getLB()`, `getRB()` | `bool` | Bumpers. |
| `getBack()`, `getStart()` | `bool` | Middle buttons. |
| `getOptions()` | `bool` | Works only with the `tuna-default` mapping. |
| `getLeftStickButton()`, `getRightStickButton()` | `bool` | Pressing a stick (L3, R3). |
| `getPOV()` | `int` | D-pad: -1 not pressed, 0 up, 90 right, 180 down, 270 left. |
| `getDpadUp()`, `getDpadRight()`, `getDpadDown()`, `getDpadLeft()` | `bool` | One D-pad direction. |
| `getRawAxis(i)`, `getRawButton(i)` | `float` / `bool` | Raw axis and button, without a mapping. A number that does not exist returns 0 / `false`. |
| `isConnected()` | `bool` | `true` if data came from the gamepad in the last 500 ms. |
| `getAxisCount()`, `getButtonCount()` | `uint32_t` | The number of axes and buttons the gamepad sends. |
| `getSeq()`, `getMs()` | `uint32_t` | The counter of incoming packets and the time of the last packet. |

Gamepad data reaches the code only while a mode is running, that is after **Start**. In the Init phase, while the robot is stopped and when a loop pass is stuck, all axes read as 0, all buttons as `false`, and `isConnected()` returns `false`.

If no gamepad data comes for 500 ms, all axes also read as 0 and all buttons as `false`. You change this time with `PROBOT_INPUT_TIMEOUT_MS`: [Connection safety](makro-listesi.md#baglanti).

**Settings.** With `Options`, you can change the dead zone and the Y direction:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // default 0.08: values below this read as 0
auto js = probot::io::joystick_api::makeDefault(opt);
```

| Field | Default | Meaning |
|---|---|---|
| `deadzone` | `0.08f` | An axis whose absolute value is below this reads as 0. |
| `invertY` | `true` | Flips the Y axis, so up is positive. |
| `useMappingInvert` | `true` | Also applies the mapping's own Y flip setting. |

All built-in mappings flip Y themselves. To really change the Y direction, set both `invertY` and `useMappingInvert` to `false`.

**Gamepad mapping.** The default is `logitech-f310`. For another gamepad, select the mapping in the mode's init function, for example in `teleopInit()`:

```cpp
probot::io::joystick_mapping::setActiveByName("standard");
```

| Name | Mapping |
|---|---|
| `"logitech-f310"`, `"f310"` | Logitech F310 (default) |
| `"standard"`, `"xbox"`, `"xbox-one"`, `"ds4"`, `"dualshock-4"`, `"ps"` | The browser's standard layout |
| `"axis9-dpad"` | Gamepads that read the D-pad from axis 9 |
| `"tuna-default"`, `"tuna"` | Tuna layout (`getOptions()` works only with this one) |

If you write a name that is not known, there is no error; `logitech-f310` is used. The selected mapping is kept between modes.

## Telemetry {#telemetri}

Telemetry writes to the **Telemetry** panel in the Driver Station's **Dashboard** tab.

| Function | What it does |
|---|---|
| `probot::print("metin")` | Writes the text, without a new line. |
| `probot::println("metin")` | Writes the text and starts a new line. An empty call only starts a new line. |
| `probot::printf("hiz=%.2f\n", hiz)` | Writes formatted text. At most 127 characters in one call. |
| `probot::clearTelemetry()` | Clears the panel. |

The panel shows a 256-byte buffer; when it is full, the oldest lines drop off. For a value that changes in every pass, call `clearTelemetry()` at the start of the pass.

<a id="robot-durumu-ileri-seviye"></a>
## Robot state {#robot-durumu}

`probot::robot::state().read()` gives you a copy of the robot's current state. The copy is taken in one go, so the fields agree with each other.

```cpp
auto s = probot::robot::state().read();
```

| Field | Type | Meaning |
|---|---|---|
| `s.status` | `Status` | The last command the Driver Station accepted: `INIT`, `START`, `STOP`. It becomes `STOP` when the autonomous time is up. |
| `s.phase` | `Phase` | The phase the library has finished moving to. The values are in the table below. |
| `s.selectedMode` | `OpMode` | The mode selected on the Driver Station: `AUTO` or `TELEOP`. It becomes `TELEOP` when the autonomous time is up. |
| `s.autoPeriodSeconds` | `int32_t` | The autonomous time (seconds). Default 30. |
| `s.autoStartMs` | `uint32_t` | The moment autonomous started running (in `millis()`). It is written after `autonomousStart()` ends; it is up to date inside `autonomousLoop()`. |
| `s.clientCount` | `int32_t` | 1 if a Driver Station controls the robot, 0 if not. |
| `s.deadlineMiss` | `bool` | Whether a pass is over its time limit right now. |
| `s.batteryVoltage` | `float` | The last battery voltage (V), in 0.1 V steps. 0 means no data. |
| `s.ms`, `s.seq` | `uint32_t` | The time of the last change and the change counter. |

| `Phase` | Number | Meaning |
|---|---|---|
| `STOPPED` | 0 | The robot is stopped. You can select a mode. |
| `AUTO_INIT` | 1 | The autonomous Init phase. |
| `AUTO_RUN` | 2 | Autonomous is running. |
| `TELEOP_INIT` | 3 | The TeleOp Init phase. |
| `TELEOP_RUN` | 4 | TeleOp is running. |
| `TRANSITION` | 5 | The autonomous time is up; TeleOp is selected and waits for **Init**. |

The numbers are the `phase` value the Driver Station gets. `Status` numbers: 0 `INIT`, 1 `START`, 2 `STOP`.

Write enum values with their full name, for example `s.phase == probot::robot::Phase::TELEOP_RUN` or `s.selectedMode == probot::robot::OpMode::AUTO`.

Shortcuts for a single field: `probot::robot::state().phase()`, `.status()`, `.selectedMode()`, `.autoPeriodSeconds()`, `.autoStartMs()`.

The library uses the `set...` functions of the robot state. If you call them from your code, they conflict with the Driver Station. For the battery voltage, use the function below.

## Battery {#batarya}

The library can measure the battery voltage by itself in two ways: a voltage divider or an INA219 / INA226 sensor. You select the method with a macro: [Battery](makro-listesi.md#batarya). The measuring circuit: [Measure the battery voltage](bataryayi-olc.md).

| Function | What it does |
|---|---|
| `probot::setBatteryVoltage(volt)` | Writes a voltage (V) you measured yourself to the robot state. If the value does not change after rounding to a 0.1 V step, it does not write it. So calling it in every pass is fine. |
| `probot::io::battery::currentAmps()` | The current (A) read from the INA sensor at this moment. It exists only when `PROBOT_BATTERY_INA` is defined. |

Do not call `probot::setBatteryVoltage()` when `PROBOT_BATTERY_ADC_PIN` or `PROBOT_BATTERY_INA` is defined. The library's measurement writes over the value about every 250 ms.

## Emergency stop {#acil-durdurma}

`probot::emergencyStop()` does the same thing as **Emergency Stop** on the Driver Station. You can call it from inside any mode function.

In an emergency stop, in this order:

1. The robot is locked.
2. If `PROBOT_ESTOP_ENABLE_PIN` is defined, it goes LOW.
3. Your running code is stopped.
4. If a mode is in its Init or running phase, that mode's stop function runs within at most 500 ms. If it does not end, the board restarts. If the robot is stopped or in the transition phase, the stop function is not called.

This line appears in the **Telemetry** panel:

```text
!! [PB-E302] EMERGENCY STOP — robot disabled, reboot required — docs/hatalar#pb-e302
```

Until the robot restarts, no command works except **Emergency Stop** and **Reboot Robot**. To unlock it, press **Reboot Robot**, or turn the power off and on.

The code below does an emergency stop when Back and Start are pressed together. It also writes the time left in autonomous to the telemetry:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

void teleopInit() {
  // Select the gamepad mapping
  probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Emergency stop if Back and Start are pressed together
  if (js.getBack() && js.getStart()) {
    probot::emergencyStop();
  }
}

void teleopStop() {}

void autonomousLoop() {
  auto s = probot::robot::state().read();

  // Time left until autonomous ends (ms)
  int32_t elapsed = (int32_t)(millis() - s.autoStartMs);
  int32_t remaining = s.autoPeriodSeconds * 1000 - elapsed;

  probot::clearTelemetry();
  probot::printf("Kalan: %ld ms\n", (long)remaining);
}

void autonomousStop() {}
```

!!! warning "Warning"
    If the board locks up completely, the software emergency stop does not work. For real safety, put a hardware emergency stop switch on the motors' power line.

## HTTP addresses {#http}

The robot runs a single server at the address `192.168.4.1`. The Driver Station uses these addresses. Unless you write your own tool, you do not need them.

The "Owner" column: the device that sends the first request to the robot becomes the owner. Protected addresses answer only that device. Other devices get `403`. If the owner sends no request for 5 seconds, it stops being the owner, and another device can take its place.

| Address | Owner needed | What it gives |
|---|---|---|
| `/` | yes | The Driver Station interface |
| `/joystick` (WebSocket) | yes | Gamepad data, state and telemetry |
| `/updateController` (POST) | yes | Gamepad data when there is no WebSocket |
| `/robotControl?cmd=mode&val=auto`, `val=teleop` | yes | Selects the mode. It is accepted only while the robot is stopped or in the transition phase. |
| `/robotControl?cmd=init`, `start`, `stop` | yes | Phase commands. `autoLen=N` gives the autonomous time (seconds). `init` is accepted only while the robot is stopped or in the transition; `start` only in the Init phase. `stop` is accepted in the Init or running phase. It is also accepted while an `init` or `start` is accepted but not yet applied. |
| `/robotControl?cmd=estop` | yes | Emergency stop |
| `/robotControl?cmd=reboot` | yes | Restarts the board |
| `/setChannel?ch=N` | yes | Saves the channel. If it is 1-13, the robot moves to that channel with a CSA announcement. Most devices keep the connection; some drop it and connect again. `0` deletes the saved channel. |
| `/getState` | yes | Command, phase, selected mode, autonomous and battery state (JSON) |
| `/telemetry` | yes | Telemetry text |
| `/getBattery` | no | Battery voltage, one decimal place |
| `/health` | no | Signal and connection information (JSON) |
| `/info` | no | Network name, channel and the channel's source, IP, board information |
| `/portal` | no | The welcome page that opens when you join the network |

A command in the wrong phase returns `409`. The body of the answer gives the reason:

```text
[PB-E409] STOP before changing mode — docs/hatalar#pb-e409
[PB-E409] INIT requires STOPPED — docs/hatalar#pb-e409
[PB-E409] START requires INIT — docs/hatalar#pb-e409
[PB-E409] STOP requires INIT or RUN — docs/hatalar#pb-e409
EMERGENCY STOPPED — reboot required
```

The last line is for the emergency stop lock; every command except `estop` and `reboot` gets this answer. Details: ["Komut reddedildi": the command is not valid in this phase](sorunlar.md#pb-e409).

The `/getState` answer:

```json
{"status":1,"phase":4,"selectedMode":"teleop","autoPeriodSeconds":30,"autoRemainingMs":0,"batt":12.4,"estop":false}
```

The `status` and `phase` numbers are the same as in the [Robot state](#robot-durumu) section. If `batt` is 0.0, there is no battery data. `autoRemainingMs` is above 0 only while autonomous is running.

`/health` fields: `rssi` signal strength, `up` time the robot has been on (ms), `heap` free memory, `dm` whether a pass went over its time limit, `joyAgeMs` age of the last gamepad packet (-1 never came), `sta` number of connected devices, `disc` the reason code of the last disconnect.

In `/info`, `chSource` tells where the channel comes from: `macro` the macro in the code, `nvs` the channel saved with **Kanal Değiştir** (Change channel), `auto` automatic channel selection. **Kanal Değiştir** is a Driver Station label, and some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

Byte layout of the WebSocket frames: [Probot Core 0.4.0 API reference](https://github.com/probot-studio/probot-core/blob/0.4.0/API.md).
