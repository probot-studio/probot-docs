# Use the status LED

The colored LED on the board shows the state of the robot. This page explains what the colors mean, how to set the LED, and how to connect an extra signal lamp.

## What the colors mean {#renkler}

The library controls the LED color, and each color has a meaning. Blinking colors are on for half a second and off for half a second.

| Color | Meaning | What to do |
|---|---|---|
| Solid blue | Robot on, Driver Station not connected | Connect to the robot's network and open the Driver Station: [First 10 minutes](ilk-10-dakika.md) |
| Blinking blue | Driver Station connected, waiting for Init | Press **Init** |
| Solid yellow | Init done, waiting for Start | Press **Start** |
| Blinking orange | Autonomous running | When the autonomous time runs out, TeleOp starts by itself |
| Blinking green | TeleOp running | Drive the robot with the gamepad |
| Blinking red | A loop pass took longer than 2 seconds. Gamepad inputs were reset. | Look for a long `delay()` or a sensor call that does not respond: [Narrow down the problem step by step](hatayi-daralt.md) |
| Solid red | Emergency stop, robot locked | Press **Reboot Robot**, or turn the robot's power off and on |

After **Stop**, the LED blinks blue again. The blinking red ends by itself when the stuck pass ends.

The code has no function that changes the LED color. Calls to `setColor`, `set` and `setBrightness` from older versions do not compile. Delete those lines. For your own indicator, use the [signal lamp](#rsl).

## Set the LED pin and brightness {#led-pini}

By default, the LED is on GPIO 3, and its brightness is 32 (0-255). You change both with macros written before the `#include <probot.h>` line.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#define NEOPIXEL_PIN        48   // status LED on this pin
#define NEOPIXEL_BRIGHTNESS 16   // 0-255, default 32

#include <probot.h>

void robotInit() {}
void robotEnd() {}
void teleopInit() {}
void teleopLoop() {}
void autonomousInit() {}
void autonomousLoop() {}
```

1. From your board's pin diagram, find the GPIO number that the LED is connected to.
2. Write the `#define NEOPIXEL_PIN` line with your number before the `#include <probot.h>` line.
3. To change the brightness, write a value from 0 to 255 on the `#define NEOPIXEL_BRIGHTNESS` line.
4. Upload the code to the board.

Result: When the robot turns on, the LED lights blue at the brightness you wrote.

The library lights only the first LED on the strip. `NEOPIXEL_COUNT` (default 1) sets the LED count, but it does not give colors to the other LEDs.

## Connect a signal lamp (RSL) {#rsl}

The signal lamp (RSL) shows from a distance whether the robot can move. If you give a digital pin with `PROBOT_RSL_PIN`, the library drives that pin:

| Robot state | Lamp |
|---|---|
| Autonomous or TeleOp running | Blinks |
| Waiting for Init, Init done, Stop, emergency stop | Stays on |

The lamp is on when the pin is HIGH. When a loop pass gets stuck (red LED), the lamp keeps blinking, because the robot is still in autonomous or TeleOp.

1. Connect the lamp to an empty digital pin, so that it turns on when the pin is HIGH. The ESP32 pin gives a 3.3 V signal. If your lamp needs more power, put a driver between the pin and the lamp.
2. Write `#define PROBOT_RSL_PIN 10` before the `#include <probot.h>` line. Use your own pin instead of 10.
3. Upload the code to the board.
4. In the Driver Station, press **Init**, then **Start**.

Result: The lamp stays on when the robot turns on, blinks after **Start**, and stays on again after **Stop**.

## Having trouble?

- **The LED does not light at all:** `NEOPIXEL_PIN` does not match the LED's pin on your board. Check the pin diagram and fix the macro.
- **The LED blinks red:** A pass took longer than 2 seconds: [Errors and troubleshooting](sorunlar.md).
- **Old code fails to compile on the `setColor` line:** The LED color cannot be changed from code. Delete the line.

## Next step

[Settings macros](makro-listesi.md)
