# Read the gamepad data

On this page, you read the gamepad's stick, button and D-pad values in your code. You see the values you read in the Driver Station's **Telemetry** panel.

## Before you start

- Your program's functions are ready. See [Write the functions for the match flow](hooklari-yaz.md).
- The gamepad is connected over USB or Bluetooth to the tablet or computer where you open the Driver Station. See [First 10 minutes](ilk-10-dakika.md). If you have no gamepad, use the keyboard or the touch screen: [Drive without a gamepad](#kumandasiz-sur).

The gamepad data goes from the browser to the robot over WiFi. In the code, `probot::io::joystick_api` reads this data.

The gamepad values reach the code only after **Start**, while autonomous or TeleOp runs. During **Init**, inside `teleopInitLoop()` and `autonomousInitLoop()`, all sticks and buttons read as 0. This way the robot does not move with the gamepad before **Start**.

## Read the gamepad and write it on the screen {#kumandayi-oku}

1. In `teleopLoop()`, write `auto js = probot::io::joystick_api::makeDefault();` on the first line.
2. Under it, write `probot::clearTelemetry();`. The panel is cleared on every pass.
3. Write the values you want to read with `probot::printf`.
4. Upload the code to the robot. On the Driver Station, select **Teleoperated**, press **Init**, then press **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();   // get it again on every pass

  probot::clearTelemetry();
  probot::printf("Sol: X=%.2f Y=%.2f\n", js.getLeftX(), js.getLeftY());
  probot::printf("Sag: X=%.2f Y=%.2f\n", js.getRightX(), js.getRightY());
  probot::printf("A=%d B=%d POV=%d\n", js.getA(), js.getB(), js.getPOV());
}

void teleopStop() {}
```

Result: The line "Sol: X=0.00 Y=0.00" appears in the **Telemetry** panel. When you push the left stick forward, the Y value turns positive and comes close to 1.00 at full push. When you press **A**, it shows "A=1".

`makeDefault()` does not open a connection; it gets the latest values that came in. Calling it again on every pass is normal.

## Read the sticks {#cubuklar}

A stick value is a `float` number between -1 and +1. When the stick is in the middle, it reads as 0.

| Function | What it reads |
|---|---|
| `getLeftX()` | Left stick, horizontal. Positive when you tilt it right |
| `getLeftY()` | Left stick, vertical. Positive when you push it forward |
| `getRightX()` | Right stick, horizontal. Positive when you tilt it right |
| `getRightY()` | Right stick, vertical. Positive when you push it forward |
| `getLeftTriggerAxis()` | Left trigger. 1 while pressed, 0 when released |
| `getRightTriggerAxis()` | Right trigger. 1 while pressed, 0 when released |

The triggers read like buttons. They give no values in between; they return only 0 or 1.

## Read the buttons {#dugmeler}

The button functions return a `bool`: `true` while pressed, `false` when not. The PlayStation names read the same button.

| Xbox | PlayStation | Function |
|---|---|---|
| **A** | **Cross** | `getA()` / `getCross()` |
| **B** | **Circle** | `getB()` / `getCircle()` |
| **X** | **Square** | `getX()` / `getSquare()` |
| **Y** | **Triangle** | `getY()` / `getTriangle()` |
| **LB** (left bumper) | | `getLB()` |
| **RB** (right bumper) | | `getRB()` |
| **Back** | | `getBack()` |
| **Start** | | `getStart()` |
| **L3** (press the left stick) | **L3** | `getLeftStickButton()` |
| **R3** (press the right stick) | **R3** | `getRightStickButton()` |

You can read the D-pad in two ways:

```cpp
// Each direction as a separate bool
js.getDpadUp();
js.getDpadRight();
js.getDpadDown();
js.getDpadLeft();

// One number, as an angle
js.getPOV();   // -1 = not pressed, 0 = up, 90 = right, 180 = down, 270 = left
```

To read a raw value without the mapping, there are `getRawAxis(i)` and `getRawButton(i)`. At most 20 axes and 20 buttons are read.

## Set the dead zone {#olu-bolge}

A stick may not go back to exactly 0 when you release it. The library turns a value into 0 when its absolute value is below the dead zone. The default dead zone is 0.08.

If the motor turns slowly even though you released the stick, make the dead zone larger:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // default 0.08
auto js = probot::io::joystick_api::makeDefault(opt);
```

Values above the dead zone come as they are; they are not rescaled.

## Change the gamepad mapping {#esleme}

The mapping sets which numbered button of the gamepad matches which name. The default mapping is `logitech-f310`, and it is the same as the W3C standard layout.

1. In `teleopInit()` and `autonomousInit()`, add the `setActiveByName` line.
2. Inside the quotes, write one of the names in the table.
3. Upload the code. On the Driver Station, select the mode and press **Init**.

```cpp
void autonomousInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Name | When |
|---|---|
| `"logitech-f310"` / `"f310"` | Default |
| `"standard"` / `"xbox"` / `"xbox-one"` / `"ds4"` / `"dualshock-4"` / `"ps"` | Gamepads that use the W3C standard layout |
| `"axis9-dpad"` | Gamepads that send the D-pad on axis 9 instead of as buttons |
| `"tuna-default"` / `"tuna"` | The old TunaGamepad layout. `getOptions()` works only with this mapping |

Result: The buttons read according to the mapping you selected. Test it with the code in [Read the gamepad and write it on the screen](#kumandayi-oku): after **Start**, when you press **A**, the **Telemetry** panel shows "A=1".

The mapping stays in effect until the robot turns off. If you write it in both init functions, the same mapping is used whichever mode you start with. If you write a name the library does not know, it uses `logitech-f310` without a warning.

## Drive without a gamepad {#kumandasiz-sur}

If you have no gamepad, the keyboard or the touch screen of the device where you open the Driver Station takes its place. The code does not change; the same functions read the values. Neither source turns on by itself; you turn it on by hand.

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

1. On the Driver Station, press the **Joystick** tab.
2. On a computer, in the **Input Source** section, press **Etkinleştir** (Turn on) on the **Klavye** (Keyboard) card. On a phone, press **Etkinleştir** on the **Dokunmatik** (Touch) card.
3. In **Dashboard**, select the mode, press **Init**, then press **Start**. On a touch screen, these are in the top bar of the drive screen: [Drive screen](arayuz.md#surus-ekrani).
4. On the keyboard, hold down <kbd>W</kbd>. On the touch screen, drag the left stick up.

Result: The card shows "Etkin" (On). In **System Status**, **Joystick** changes to "Klavye" or "Dokunmatik". With the code in [Read the gamepad and write it on the screen](#kumandayi-oku), the Y value in the **Telemetry** panel comes close to 1.00.

| Source | Sticks | Buttons |
|---|---|---|
| **Klavye** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> are the left stick, the arrow keys are the right stick. While you hold a key, the value rises to 1 in a short time. | <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>: **A**, **B**, **X**, **Y**. <kbd>Q</kbd> <kbd>E</kbd>: **LB**, **RB**. |
| **Dokunmatik** | Two sticks in the bottom corners of the screen. | **A**, **B**, **X**, **Y**. |

Neither source has triggers, a D-pad, **Back** or **Start**. While the cursor is in a text box (for example **Autonomous süresi** (Autonomous duration)), the keyboard does not send keys to the robot. In both cases, <kbd>Space</kbd> is the **Emergency Stop**.

## If the connection drops {#baglanti-koparsa}

If no gamepad data comes for 500 ms, all sticks and buttons read as 0. So it is safe to tie the motor power directly to a stick value: when the connection drops, the motor stops. If you unplug the gamepad or change the source, the Driver Station sends zero values to the robot at that moment; it does not wait 500 ms.

You can ask with `js.isConnected()` whether the gamepad data reaches the code. While the robot runs, it returns `true` if data came in the last 500 ms. During **Init**, it returns `false`.

You can change this time with a line like `#define PROBOT_INPUT_TIMEOUT_MS 300` before the `#include <probot.h>` line. The default is 500.

## Write to the Telemetry panel {#telemetri}

Telemetry sends text from the code to the **Telemetry** panel on the Driver Station. You see the values on the field without connecting a computer to the robot.

```cpp
probot::print("merhaba");
probot::println("satır sonu ekler");
probot::printf("hiz=%.2f\n", hiz);
probot::clearTelemetry();
```

- Behind the panel, there is a 256-byte buffer. When the buffer is full, the oldest text is deleted.
- One `printf` call writes at most 127 characters. The rest is cut off.
- Call `clearTelemetry()` at the start of every pass. If you do not, old lines pile up.
- Telemetry also works inside `teleopInitLoop()` and `autonomousInitLoop()`. You can use it to see sensor values in the panel before **Start**.

## Having trouble?

- **The values stay at 0:** Press any button on the gamepad; the browser detects the gamepad at the first button press. Check that the robot runs after **Start**, not in **Init**.
- **The wrong button triggers, or the D-pad does not work:** Change the mapping. See [Change the gamepad mapping](#esleme).
- **The motor turns slowly when you release the stick:** Make the dead zone larger. See [Set the dead zone](#olu-bolge).
- **The keyboard keys do not reach the robot:** Check that the **Klavye** card shows "Etkin". If the cursor is in a text box, click an empty spot on the page.
- **Text piles up in the panel:** Add `probot::clearTelemetry();` at the start of the pass.

## Next step

[Drive the motor](motoru-sur.md)
