# Read the gamepad data

On this page, you read the stick, button and D-pad values of the gamepad in your code. You see the values you read in the **Telemetry** panel of the Driver Station.

## Before you start

- Your program has its six functions ready. See [Write the functions for the match flow](hooklari-yaz.md).
- The gamepad is connected by USB or Bluetooth to the tablet or computer where you opened the Driver Station. See [First 10 minutes](ilk-10-dakika.md).

Gamepad data goes from the browser to the robot over WiFi. In code, `probot::io::joystick_api` reads this data.

## Read the gamepad and print it {#kumandayi-oku}

1. In `teleopLoop()`, write `auto js = probot::io::joystick_api::makeDefault();` on the first line.
2. Under it, write `probot::clearTelemetry();`. The panel is cleared on every pass.
3. Write the values you want to read with `probot::printf`.
4. Upload the code to the robot. In the Driver Station, press **Init**, then **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void robotInit() {}
void robotEnd() {}
void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();   // get it again on every pass

  probot::clearTelemetry();
  probot::printf("Sol: X=%.2f Y=%.2f\n", js.getLeftX(), js.getLeftY());
  probot::printf("Sag: X=%.2f Y=%.2f\n", js.getRightX(), js.getRightY());
  probot::printf("A=%d B=%d POV=%d\n", js.getA(), js.getB(), js.getPOV());
}
```

Result: The **Telemetry** panel shows the line "Sol: X=0.00 Y=0.00". When you push the left stick forward, Y becomes positive and approaches 1.00 at full push. When you press **A**, the panel shows "A=1".

`makeDefault()` does not make a connection. It returns the most recent values. Calling it again on every pass is normal.

## Read the sticks {#cubuklar}

Stick values are `float` numbers from -1 to +1. A centered stick reads 0.

| Function | What it reads |
|---|---|
| `getLeftX()` | Left stick, horizontal. Positive when pushed right. |
| `getLeftY()` | Left stick, vertical. Positive when pushed forward. |
| `getRightX()` | Right stick, horizontal. Positive when pushed right. |
| `getRightY()` | Right stick, vertical. Positive when pushed forward. |
| `getLeftTriggerAxis()` | Left trigger. 1 when pressed, 0 when released. |
| `getRightTriggerAxis()` | Right trigger. 1 when pressed, 0 when released. |

The triggers are read like buttons. They give no in-between values. They return only 0 or 1.

## Read the buttons {#dugmeler}

Button functions return `bool`: `true` when pressed, `false` when not pressed. The PlayStation names read the same button.

| Xbox | PlayStation | Function |
|---|---|---|
| **A** | **Cross** | `getA()` / `getCross()` |
| **B** | **Circle** | `getB()` / `getCircle()` |
| **X** | **Square** | `getX()` / `getSquare()` |
| **Y** | **Triangle** | `getY()` / `getTriangle()` |
| **LB** (left shoulder) | | `getLB()` |
| **RB** (right shoulder) | | `getRB()` |
| **Back** | | `getBack()` |
| **Start** | | `getStart()` |
| **L3** (press the left stick) | **L3** | `getLeftStickButton()` |
| **R3** (press the right stick) | **R3** | `getRightStickButton()` |

The D-pad is read in two ways:

```cpp
// One bool for each direction
js.getDpadUp();
js.getDpadRight();
js.getDpadDown();
js.getDpadLeft();

// One number, as an angle
js.getPOV();   // -1 = not pressed, 0 = up, 90 = right, 180 = down, 270 = left
```

To read raw values without the mapping, use `getRawAxis(i)` and `getRawButton(i)`. Up to 20 axes and 20 buttons are read.

## Set the dead zone {#olu-bolge}

A stick may not return exactly to 0 when you let go. The library turns any value whose absolute value is below the dead zone into 0. The default dead zone is 0.08.

If the motor turns slowly while the stick is released, make the dead zone larger:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // default 0.08
auto js = probot::io::joystick_api::makeDefault(opt);
```

Values above the dead zone come through as they are. They are not rescaled.

## Change the gamepad mapping {#esleme}

The mapping sets which numbered button of the gamepad matches which name. The default mapping is `logitech-f310`. It is the same as the W3C standard layout.

1. Add the `setActiveByName` line inside `robotInit()`.
2. Inside the quotes, write one of the names from the table below.
3. Upload the code and press **Init**.

```cpp
void robotInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Name | When to use it |
|---|---|
| `"logitech-f310"` / `"f310"` | The default |
| `"standard"` / `"xbox"` / `"xbox-one"` / `"ds4"` / `"dualshock-4"` / `"ps"` | Gamepads that use the W3C standard layout |
| `"axis9-dpad"` | Gamepads that send the D-pad from axis 9 instead of as buttons |
| `"tuna-default"` / `"tuna"` | The old TunaGamepad layout. `getOptions()` works only with this mapping. |

Result: The buttons are read with the mapping you selected. Use the code in [Read the gamepad and print it](#kumandayi-oku): when you press **A**, the **Telemetry** panel shows "A=1".

If you write a name that the library does not recognize, it uses `logitech-f310` without a warning.

## If the connection drops {#baglanti-koparsa}

If no gamepad data arrives for 500 ms, all sticks and buttons read 0. So connecting the motor power directly to a stick value is safe. The motor stops when the connection drops.

You can ask whether the gamepad is connected with `js.isConnected()`. It returns `true` if data arrived in the last 500 ms.

To change this time, add a line such as `#define PROBOT_INPUT_TIMEOUT_MS 300` before the `#include <probot.h>` line. The default is 500.

## Write to the Telemetry panel {#telemetri}

Telemetry sends text from your code to the **Telemetry** panel on the Driver Station. You see the values on the field, without connecting a computer to the robot.

```cpp
probot::print("merhaba");
probot::println("satır sonu ekler");
probot::printf("hiz=%.2f\n", hiz);
probot::clearTelemetry();
```

- The panel has a 256-byte buffer behind it. When the buffer is full, the oldest text is erased.
- One `printf` call writes at most 127 characters. The rest is cut off.
- Call `clearTelemetry()` at the start of every pass. If you do not, old lines pile up.

## Having trouble?

- **The values stay at 0:** Press any button on the gamepad. The browser recognizes the gamepad at its first button press.
- **The wrong button triggers, or the D-pad does not work:** Change the mapping. See [Change the gamepad mapping](#esleme).
- **The motor turns slowly when the stick is released:** Make the dead zone larger. See [Set the dead zone](#olu-bolge).
- **Text piles up in the panel:** Add `probot::clearTelemetry();` at the start of the pass.

## Next step

[Drive the motor](motoru-sur.md)
