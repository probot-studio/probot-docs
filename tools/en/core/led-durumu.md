# Use the status LED

The color LED on the board shows the robot's state. On this page, you find what the colors mean, the LED settings and the extra signal light.

## What the colors mean {#renkler}

The library sets the LED's color, and each color has a meaning. A blinking color is on for half a second and off for half a second.

| Color | Meaning | What to do |
|---|---|---|
| Solid blue | The robot is stopped, and the Driver Station is not connected | Connect to the robot's network and open the Driver Station: [First 10 minutes](ilk-10-dakika.md) |
| Blinking blue | The Driver Station is connected and the robot is stopped; it waits for the mode selection and Init | Select the mode and press **Init** |
| Solid yellow | Init is done; it waits for Start | Press **Start** |
| Blinking yellow | The autonomous time is up and **Teleoperated** is selected; it waits for Init | Press **Init Teleop**, then **Start** |
| Blinking orange | Autonomous is running | When the autonomous time is up, the robot stops and the LED blinks yellow |
| Blinking green | TeleOp is running | Drive the robot with the gamepad |
| Blinking red | A loop or initLoop pass took longer than 2 seconds, or an init, start or stop function took longer than 10 seconds; the gamepad inputs were reset | Look for a long `delay()` or a sensor call that does not respond: [Narrow down the problem step by step](hatayi-daralt.md) |
| Solid red | An emergency stop was made, and the robot is locked | Press **Reboot Robot**, or turn the robot's power off and on |

If the Driver Station connection drops after Init, the LED keeps the color of the current phase until the robot stops. After **Stop**, the LED blinks blue again. The red blinking ends by itself when the stuck pass ends.

The code has no function that changes the LED's color. The `setColor`, `set` and `setBrightness` calls of older versions do not compile; delete these lines. For your own indicator, use the [signal light](#rsl).

## Set the LED pin and brightness {#led-pini}

By default, the LED is on GPIO 3, and its brightness is 32 (0-255). You change both with macros that you write before the `#include <probot.h>` line.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#define NEOPIXEL_PIN        48   // the status LED is on this pin
#define NEOPIXEL_BRIGHTNESS 16   // 0-255, default 32

#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}
void teleopLoop() {}
void teleopStop() {}
```

1. In your board's pin diagram, find the GPIO number the LED is connected to.
2. Before the `#include <probot.h>` line, write the `#define NEOPIXEL_PIN` line with your number.
3. To change the brightness, write a value from 0 to 255 in the `#define NEOPIXEL_BRIGHTNESS` line.
4. Upload the code to the board.

Result: When the robot turns on, the LED lights blue at the brightness you wrote.

The library colors only the first LED on the strip. `NEOPIXEL_COUNT` (default 1) sets the number of LEDs, but it does not give the other LEDs a color.

## Connect a signal light (RSL) {#rsl}

The signal light (RSL) shows from a distance whether the robot can move. If you give a digital pin with `PROBOT_RSL_PIN`, the library drives that pin:

| Robot state | Light |
|---|---|
| Autonomous or TeleOp is running | It blinks |
| The robot is stopped; Init is done; autonomous is over and it waits for Init; emergency stop | Solid (it does not blink) |

The light is on when the pin is HIGH. During Init, the light stays solid even when the initLoop functions run; the robot does not move at that time. When a loop pass is stuck (red LED), the light keeps blinking too, because the robot is still in autonomous or TeleOp.

1. Connect the light to a free digital pin so that it is on when the pin is HIGH. The ESP32 pin gives a 3.3 V signal; if your light needs more power, put a driver between them.
2. Before the `#include <probot.h>` line, write `#define PROBOT_RSL_PIN 10` (your own pin instead of 10).
3. Upload the code to the board.
4. On the Driver Station, select the mode, press **Init**, then press **Start**.

Result: The light is solid at startup and after **Init**. It blinks after **Start**, and it is solid again at **Stop**.

## Having trouble?

- **The LED does not light at all:** `NEOPIXEL_PIN` does not match the pin of the LED on your board. Check the pin diagram and fix the macro.
- **The LED blinks red:** A loop or initLoop pass took longer than 2 seconds, or an init, start or stop function took longer than 10 seconds: [The LED blinks red: the loop stalled](sorunlar.md#pb-e301-deadline-miss-loop-takildi).
- **Old code does not compile at the `setColor` line:** You cannot change the LED's color from the code; delete the line.

## Next step

[Settings macros](makro-listesi.md)
