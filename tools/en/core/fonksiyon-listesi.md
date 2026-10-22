# Functions and state list

This page lists all the functions you can use in your code, the robot state fields and the HTTP addresses of Probot Core 0.3.0.

All of them come with `#include <probot.h>`.

## Six functions {#hooklar}

`setup()` and `loop()` belong to the library; do not write them in your code. Your code must define these six functions. Their bodies can be empty, but if one is missing, the code does not compile.

| Function | When it is called |
|---|---|
| `robotInit()` | Once each time you press **Init** on the Driver Station. Pin settings and starting values go here. |
| `autonomousInit()` | Once, on **Start**, if the **Autonomous** switch is on. |
| `autonomousLoop()` | Again and again during autonomous. After each pass the library waits 20 ms. |
| `teleopInit()` | Once, when TeleOp starts: when the autonomous time runs out, when the **Autonomous** switch is turned off during autonomous, or when you press **Start** with the switch off. |
| `teleopLoop()` | Again and again during TeleOp, with a 20 ms wait after each pass. |
| `robotEnd()` | Once, on **Stop**, when the Driver Station connection drops for 10 seconds (default setting), and on an emergency stop. Stop the motors here. |

`robotEnd()` is not called when switching from autonomous to TeleOp. All six functions run in order on the same task; a phase change takes effect when the current pass ends.

If a loop pass takes longer than 2 seconds, the gamepad inputs are reset and the status LED blinks red. The code is not stopped; when the pass ends, everything returns to normal. Details: [Write the autonomous](otonom-yaz.md).

## Gamepad {#kumanda}

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

`makeDefault()` returns a lightweight object; calling it again on every loop pass is normal.

| Function | Returns | Description |
|---|---|---|
| `getLeftX()`, `getLeftY()` | `float` -1..+1 | Left stick. Positive when Y is pushed up. |
| `getRightX()`, `getRightY()` | `float` -1..+1 | Right stick. |
| `getLeftTriggerAxis()`, `getRightTriggerAxis()` | `float` 0 or 1 | Triggers. 1 when pressed, 0 when not; no in-between values. |
| `getA()`, `getB()`, `getX()`, `getY()` | `bool` | Buttons with their Xbox names. |
| `getCross()`, `getCircle()`, `getSquare()`, `getTriangle()` | `bool` | The same buttons with their PlayStation names (A, B, X, Y). |
| `getLB()`, `getRB()` | `bool` | Shoulder buttons. |
| `getBack()`, `getStart()` | `bool` | Middle buttons. |
| `getOptions()` | `bool` | Works only with the `tuna-default` mapping. |
| `getLeftStickButton()`, `getRightStickButton()` | `bool` | Pressing the stick (L3, R3). |
| `getPOV()` | `int` | D-pad: -1 not pressed, 0 up, 90 right, 180 down, 270 left. |
| `getDpadUp()`, `getDpadRight()`, `getDpadDown()`, `getDpadLeft()` | `bool` | A single D-pad direction. |
| `getRawAxis(i)`, `getRawButton(i)` | `float` / `bool` | Raw axis and button, with no mapping. A number that does not exist returns 0 / `false`. |
| `isConnected()` | `bool` | `true` if data came from the gamepad in the last 500 ms. |
| `getAxisCount()`, `getButtonCount()` | `uint32_t` | Number of axes and buttons the gamepad sends. |
| `getSeq()`, `getMs()` | `uint32_t` | Counter of incoming packets and the time of the last packet. |

If no gamepad data arrives for 500 ms, every axis reads 0 and every button reads `false`. You change this time with `PROBOT_INPUT_TIMEOUT_MS`: [Settings macros](makro-listesi.md).

**Settings.** With `Options` you can change the dead zone and the Y direction:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // default 0.08: values below this read as 0
auto js = probot::io::joystick_api::makeDefault(opt);
```

| Field | Default | Meaning |
|---|---|---|
| `deadzone` | `0.08f` | Axes whose absolute value is below this read as 0. |
| `invertY` | `true` | Flips the Y axis, so up is positive. |
| `useMappingInvert` | `true` | Also applies the mapping's own Y flip setting. |

All built-in mappings flip Y by themselves. To really change the Y direction, set both `invertY` and `useMappingInvert` to `false`.

**Gamepad mapping.** The default is `logitech-f310`. For another gamepad, choose the mapping in `robotInit()`:

```cpp
probot::io::joystick_mapping::setActiveByName("standard");
```

| Name | Mapping |
|---|---|
| `"logitech-f310"`, `"f310"` | Logitech F310 (default) |
| `"standard"`, `"xbox"`, `"xbox-one"`, `"ds4"`, `"dualshock-4"`, `"ps"` | The browser's standard layout |
| `"axis9-dpad"` | Gamepads that read the D-pad from axis 9 |
| `"tuna-default"`, `"tuna"` | Tuna layout (`getOptions()` works only with this one) |

If you write a name that is not recognized, no error appears; `logitech-f310` is used.

## Telemetry {#telemetri}

Telemetry writes to the **Telemetry** panel on the **Dashboard** tab of the Driver Station.

| Function | What it does |
|---|---|
| `probot::print("metin")` | Writes the text. Does not start a new line. |
| `probot::println("metin")` | Writes the text and starts a new line. A call with no text only starts a new line. |
| `probot::printf("hiz=%.2f\n", hiz)` | Writes formatted text. At most 127 characters in one call. |
| `probot::clearTelemetry()` | Clears the panel. |

The panel shows a 256-byte buffer; when it is full, the oldest lines drop out. For a value that updates on every pass, call `clearTelemetry()` at the start of the pass.

<a id="robot-durumu-ileri-seviye"></a>
## Robot state {#robot-durumu}

`probot::robot::state().read()` gives a copy of the robot's current state. The copy is taken in one step, so the fields match each other.

```cpp
auto s = probot::robot::state().read();
```

| Field | Type | Meaning |
|---|---|---|
| `s.status` | `Status` | The last command from the Driver Station: `INIT`, `START`, `STOP`. |
| `s.phase` | `Phase` | The robot's current phase: `NOT_INIT`, `INITED`, `AUTONOMOUS`, `TELEOP`. |
| `s.autonomousEnabled` | `bool` | Whether the **Autonomous** switch is on. Becomes `false` when the autonomous time runs out. |
| `s.autoPeriodSeconds` | `int32_t` | Autonomous length (seconds). Default 30. |
| `s.autoStartMs` | `uint32_t` | The moment autonomous started (in `millis()` time). Written before `autonomousInit()` is called. |
| `s.clientCount` | `int32_t` | 1 if a Driver Station controls the robot, 0 if not. |
| `s.deadlineMiss` | `bool` | Whether a loop pass is taking longer than 2 seconds right now. |
| `s.batteryVoltage` | `float` | Battery voltage (V) that the code saved. 0 if you do not save it. |
| `s.ms`, `s.seq` | `uint32_t` | The time of the last change and the change counter. |

Write enum values in full, for example `s.phase == probot::robot::Phase::TELEOP`.

Short forms for a single field: `probot::robot::state().phase()`, `.status()`, `.autonomousEnabled()`, `.autoPeriodSeconds()`, `.autoStartMs()`.

The only field you can write from code is the battery voltage:

```cpp
probot::robot::state().setBatteryVoltage(millis(), volt);
```

Measurement circuit and full code: [Measure the battery voltage](bataryayi-olc.md). The library uses the other `set...` functions. If you call them from your code, they conflict with the Driver Station.

## Emergency stop {#acil-durdurma}

`probot::emergencyStop()` does the same job as **EMERGENCY STOP** on the Driver Station. You can call it from inside any of the six functions.

An emergency stop does these steps in order:

1. The robot locks.
2. If `PROBOT_ESTOP_ENABLE_PIN` is defined, that pin goes LOW.
3. The running code is stopped.
4. `robotEnd()` runs for at most 500 ms; if it does not finish, the board restarts.

Until the robot restarts, every command except **EMERGENCY STOP** and **Reboot Robot** does nothing. To unlock, press **Reboot Robot**, or turn the power off and on.

The code below runs an emergency stop when Back and Start are pressed together, and writes the autonomous time left to the telemetry:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

void robotInit() {
  // Choose the gamepad mapping
  probot::io::joystick_mapping::setActiveByName("standard");
}

void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Back and Start pressed together: emergency stop
  if (js.getBack() && js.getStart()) {
    probot::emergencyStop();
  }
}

void autonomousInit() {}

void autonomousLoop() {
  auto s = probot::robot::state().read();

  // Time left in autonomous (ms)
  int32_t elapsed = (int32_t)(millis() - s.autoStartMs);
  int32_t remaining = s.autoPeriodSeconds * 1000 - elapsed;

  probot::clearTelemetry();
  probot::printf("Kalan: %ld ms\n", (long)remaining);
}
```

!!! warning "Warning"
    If the board fully locks up, a software emergency stop does not work. For real safety, put a hardware emergency stop switch on the motors' power line.

## HTTP addresses {#http}

The robot runs one server at `192.168.4.1`. The Driver Station uses these addresses. If you do not write your own tool, you do not need them.

"Owner needed" column: the first device that sends a request to the robot becomes the owner, and protected addresses answer only that device. Other devices get `403`. If the owner sends no requests for 5 seconds, the spot is freed.

| Address | Owner needed | What it returns |
|---|---|---|
| `/` | Yes | The Driver Station interface |
| `/joystick` (WebSocket) | Yes | Gamepad data, state and telemetry |
| `/updateController` (POST) | Yes | Gamepad data when there is no WebSocket |
| `/robotControl?cmd=init`, `start`, `stop`, `cancelAuto` | Yes | Phase commands. Autonomous settings with `auto=0/1` and `autoLen=N`. While the emergency stop lock is on, every command except `estop` and `reboot` returns `409`. |
| `/robotControl?cmd=estop` | Yes | Emergency stop |
| `/robotControl?cmd=reboot` | Yes | Restarts the board |
| `/setChannel?ch=N` | Yes | Saves the channel. For 1-13, the robot moves to that channel with a CSA announcement; most devices keep the connection, and some drop and reconnect. `0` deletes the saved channel. |
| `/getState` | Yes | Phase and autonomous state (JSON) |
| `/telemetry` | Yes | Telemetry text |
| `/getBattery` | No | Battery voltage, one decimal place |
| `/health` | No | Signal and connection info (JSON) |
| `/info` | No | Network name, channel, IP and board info |
| `/portal` | No | The welcome page that opens when you join the network |

Response from `/getState`:

```json
{"phase":3,"autonomousEnabled":false,"autoPeriodSeconds":30,"autoRemainingMs":0,"estop":false}
```

`phase` number: 0 `NOT_INIT`, 1 `INITED`, 2 `AUTONOMOUS`, 3 `TELEOP`.

`/health` fields: `rssi` signal strength, `up` uptime (ms), `heap` free memory, `dm` whether a loop pass took longer than 2 seconds, `joyAgeMs` age of the last gamepad packet (-1 if none arrived), `sta` number of connected devices, `disc` reason code of the last disconnect.

Byte layout of the WebSocket frames: [Probot Core 0.3.0 API reference](https://github.com/probot-studio/probot-core/blob/0.3.0/API.md).
