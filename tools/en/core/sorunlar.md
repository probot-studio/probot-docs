# Errors and troubleshooting

On this page, you find the cause and the fix for errors that come up during setup, compiling and a match with Probot Core.

The page describes probot-core 0.3.0. Probot Blocks also generates 0.3.0 code. First check the status indicators, then find the heading for your symptom. If a message appeared on the screen, the headings start with that message.

<a id="hata-kodlar-pb-exxx"></a>
<a id="pb-e104"></a>
<a id="pb-e104-batarya-adc-konfigurasyonu-gecersiz"></a>
<a id="pb-e105"></a>
<a id="pb-e105-batarya-kaynak-secimi-gecersiz"></a>
<a id="pb-e306"></a>
<a id="pb-e306-batarya-sensorune-ulaslamyor"></a>
<a id="pb-e409"></a>
<a id="pb-e409-gecersiz-evrede-komut"></a>
## Check the status indicators first {#durum-gostergeleri}

The status LED on the top of the board shows the robot's current state. The library controls its color. You cannot change it from your code. The Driver Station also shows some states with a message that covers the whole screen.

| Indicator | Meaning | What to do |
|---|---|---|
| LED blue, solid | The robot is on. The Driver Station is not connected. | Connect to the robot's network and open `http://192.168.4.1` in your browser: [First 10 minutes](ilk-10-dakika.md). |
| LED blue, blinking | The Driver Station is connected. The robot waits for Init. | In the Driver Station, press **Init**. |
| LED yellow, solid | Init is done. The robot waits for Start. | Press **Start**. |
| LED orange, blinking | Autonomous is running. | When the autonomous time runs out, TeleOp starts by itself. |
| LED green, blinking | TeleOp is running. | Drive the robot with the gamepad. |
| LED red, blinking | A loop pass did not finish in 2 seconds. | See [Loop stalled](#pb-e301). |
| LED red, solid | The emergency stop is locked. | See [Emergency stop lock](#pb-e302). |
| "DISCONNECTED" in the Driver Station | The interface has not received data from the robot for 6 seconds. | See [Connection lost](#pb-e303). |
| "EMERGENCY STOPPED" in the Driver Station | The emergency stop is locked. | See [Emergency stop lock](#pb-e302). |
| Gamepad status "Not Connected" | The browser does not see the gamepad. | See [Gamepad "Not Connected"](#kumanda-baglanmiyor). |
| **Deadline Miss** "YES" in the **Logs** tab | A loop pass stalled. | See [Loop stalled](#pb-e301). |

For all LED colors and the extra signal lamp (RSL), see [Use the status LED](led-durumu.md).

## Installation and upload {#kurulum-ve-yukleme}

Arduino IDE writes the error in the output panel at the bottom. For the setup steps, see [Set up Arduino IDE for Probot](arduino-ide-kur.md).

### Port list is empty or the upload fails {#port-yok}

The **Tools** > **Port** list stays empty, or the upload stops with a port error.

| Cause | Fix |
|---|---|
| The USB cable only charges. It does not carry data. | Use a data cable. |
| On Windows, the USB driver (CH340 or CP210x) is not installed. | Install the driver from the manufacturer's website. |
| The USB port or the hub has a problem. | Plug the board into the computer's own USB port. |
| A circuit connected to the board breaks the upload. | Disconnect the circuit, and try again with the bare board. |

### "Sketch too big" {#sketch-too-big}

Cause: The code does not fit in the application area of the default partitioning (Partition Scheme). The library uses about three quarters of this area. Large code runs out of space.

Fix: In **Tools** > **Partition Scheme**, select **Huge APP (3MB No OTA/1MB SPIFFS)**, and upload again. When you open a new sketch or select the board again, check this setting.

See [Set up Arduino IDE for Probot](arduino-ide-kur.md).

### "probot.h: No such file or directory" {#probot-h-yok}

Cause: The `probot` library is not installed.

Fix: Select **Tools** > **Manage Libraries**, type `probot`, and press **Install**.

### "Adafruit_NeoPixel.h: No such file or directory" {#neopixel-yok}

Cause: The `Adafruit NeoPixel` library, which drives the status LED, is not installed. `probot` depends on this library.

Fix: In **Manage Libraries**, type `adafruit neopixel`, and install it. If the IDE asks about dependencies when you install `probot`, press **Install all**.

## Compile errors {#derleme-hatalari}

These errors come from the settings in your code. The compile stops, and nothing is uploaded to the board.

!!! note "Note"
    Settings macros always come before the `#include <probot.h>` line. The library does not see a macro written after it. All macros: [Settings macros](makro-listesi.md).

<a id="pb-e101"></a>
<a id="pb-e101-wifi-sifresi-eksik-veya-ksa"></a>
### "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." {#pb-e101-wifi-sifresi-eksik-veya-kisa}

If the password macro is missing, or you wrote it after the `#include` line, the message is:

```text
Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h.
```

Cause: The robot's WiFi network does not open without a password. The password must have at least 8 characters.

Fix: Write the password before `#include <probot.h>`, with at least 8 characters:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>
```

See [Set up the robot's WiFi](wifi-ayarla.md).

<a id="pb-e102"></a>
<a id="pb-e102-wifi-kanal-eksik-veya-gecersiz"></a>
### "PROBOT_WIFI_AP_CHANNEL must be 1-13." {#pb-e102-wifi-kanali-eksik-veya-gecersiz}

The full message is: "PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only)."

If the channel macro is missing, the message is:

```text
WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h.
```

Cause: The 2.4 GHz channel that the robot broadcasts on must be known at compile time. `PROBOT_WIFI_AP_CHANNEL` is missing, or it is outside 1-13.

Fix: Write a channel from 1 to 13, for example `#define PROBOT_WIFI_AP_CHANNEL 1`. If several robots are in the same hall, give each robot a different channel from 1, 5, 9 and 13.

See [Improve the signal quality](sinyali-iyilestir.md).

<a id="pb-e103"></a>
### "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." {#pb-e103-ssid-uzunlugu}

Two more messages can appear under this heading:

```text
PROBOT_WIFI_AP_SSID must be 32 characters or fewer.
PROBOT_WIFI_AP_SSID must be at least 1 character.
```

Cause: The network name (SSID) can have at most 32 characters. When `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` is defined, the library adds a 7-character suffix, `-XXXXXX`, to the end of the name. So the name can have at most 25 characters. If you do not write a network name at all, the name is `Probot` and the suffix turns on by itself.

Fix: Shorten the network name. With the suffix on, write at most 25 characters. With the suffix off, write at most 32 characters. Do not write an empty name (`""`).

<a id="pb-e201"></a>
<a id="pb-e201-zorunlu-hook-tanmsz-undefined-reference"></a>
### "undefined reference to `robotEnd()'" {#pb-e201-zorunlu-hook-tanimsiz-undefined-reference}

The compile step passes. The build stops at the link step. The name changes with the missing function: `robotInit()`, `teleopInit()`, `teleopLoop()`, `autonomousInit()` or `autonomousLoop()`.

Cause: In 0.3.0, all six functions are required. If one is missing, the code does not link.

Fix: Write all six functions. Each body can be empty. The shortest correct skeleton:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void robotInit() {}        // once, when you press Init
void robotEnd() {}         // once, at Stop: stop the motors here
void teleopInit() {}       // once, when TeleOp starts
void teleopLoop() {}       // called again and again during TeleOp
void autonomousInit() {}   // once, when autonomous starts
void autonomousLoop() {}   // called again and again during autonomous
```

See [Write the functions for the match flow](hooklari-yaz.md).

<a id="pb-e202"></a>
<a id="pb-e202-setuploop-caksmas-multiple-definition"></a>
### "redefinition of 'void setup()'" {#pb-e202-setuploop-cakismasi-multiple-definition}

The same message appears for `loop()`: "redefinition of 'void loop()'".

Cause: The library owns `setup()` and `loop()`. It defines both in `probot.h`. If your code defines them again, the compiler stops.

Fix: Delete the `setup()` and `loop()` functions from your code. Move the code that runs at startup to `robotInit()`. Move the code that repeats to `teleopLoop()` or `autonomousLoop()`.

See [Write the functions for the match flow](hooklari-yaz.md).

## Connection and gamepad {#baglanti-ve-kumanda}

### The interface does not open, or "Another client is already connected." {#arayuz-acilmiyor}

The robot accepts one device at a time. The device that opens the interface first owns it. The other devices see this message (HTTP 403).

| Cause | Fix |
|---|---|
| Another device has the Driver Station open. | Close the tab on the other device, or disconnect that device from the robot's network. Wait 5 seconds, then refresh the page. |
| The device is not connected to the robot's network. | In the WiFi list, select the robot's network. Then open `http://192.168.4.1`. |
| The browser opened the address with `https://`. | Type `http://192.168.4.1` in the address bar. |

See [Driver Station interface](arayuz.md).

### Gamepad "Not Connected" {#kumanda-baglanmiyor}

In the Driver Station, the gamepad status says "Not Connected", or the axis values never change.

| Cause | Fix |
|---|---|
| No button has been pressed on the gamepad yet. The browser recognizes the gamepad at the first button press. The **Joystick** tab says "Press any controller button to activate." | Press any button on the gamepad. |
| The gamepad is connected to another device. | Connect the gamepad to the phone or tablet where you open the Driver Station. |
| The gamepad is connected, but the sticks or buttons are mixed up. | In `robotInit()`, select the mapping that matches your gamepad, for example `probot::io::joystick_mapping::setActiveByName("standard");`. See [Read the gamepad data](kumandayi-oku.md). |

### Servo jitters {#servo-titriyor}

The servo does not hold its position. It twitches now and then, or it moves without a command.

| Cause | Fix |
|---|---|
| The servo is powered from the ESP32's 5V or 3V3 pin. These pins cannot supply the current the servo draws. | Give the servo a separate 5-6 V source (BEC/UBEC), and connect the grounds (GND) together. |
| The servo and the motors share the same LEDC timer. The motors' `analogWrite` uses the lower channels. | Give the servo a high channel: `ledcAttachChannel(SERVO_PIN, 50, 14, 7);` |
| The PCA9685 board's frequency is not 50 Hz. | Set the frequency to 50 Hz for the servo outputs. |
| The servo arm is stuck, or the load is too high. | Move the mechanism by hand, and remove the friction. |

See [Drive the servo](servoyu-sur.md).

## During a match {#mac-sirasinda}

<a id="pb-e301"></a>
<a id="deadline-miss"></a>
<a id="pb-e301-deadline-miss-loop-takld"></a>
### LED blinks red: loop stalled {#pb-e301-deadline-miss-loop-takildi}

The Driver Station's **Telemetry** panel shows this line. In the **Logs** tab, **Deadline Miss** shows "YES".

```text
!! LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

Cause: `teleopLoop()` or `autonomousLoop()` did not finish in 2 seconds. This time is the `PROBOT_LOOP_DEADLINE_MS` macro (default 2000 ms).

The library resets the gamepad inputs and turns the LED red. It does not stop your task, and it does not restart the board. The phase does not change: autonomous stays in autonomous, and TeleOp stays in TeleOp. The error clears by itself when the pass ends.

!!! warning "Warning"
    The library does not touch the motor pins. When a pass stalls, the motors keep turning at the last command you gave. To stop the robot, press **EMERGENCY STOP**.

| Cause | Fix |
|---|---|
| The loop has a `delay()` of 2 seconds or longer. | Measure time with `millis()` instead of waiting. See [Write the autonomous](otonom-yaz.md). |
| The loop has a `while` loop that waits for something. | Check the condition once per pass, and end the pass. |
| An I2C sensor does not answer, and the call does not return. | Check the sensor's wiring and power. Turn off the suspect call, and try again. |
| A calculation in one pass takes more than 2 seconds. | Split the calculation over several passes. |

If you cannot find the cause, simplify the loop step by step: [Narrow down the problem step by step](hatayi-daralt.md#en-sade-kod).

<a id="pb-e302"></a>
### "EMERGENCY STOPPED" {#pb-e302-emergency-stop-kilidi}

A message covers the Driver Station, and a **Reboot Robot** button appears below it. The LED turns red and stays red.

```text
EMERGENCY STOPPED
Robot disabled — reboot required to clear
```

The **Telemetry** panel and the Serial Monitor show these lines:

```text
!! EMERGENCY STOP — robot disabled, reboot required
[SYS  ] EMERGENCY STOP
```

Cause: **EMERGENCY STOP** was pressed in the Driver Station, or your code called `probot::emergencyStop()`. This is a safety behavior, not a fault. The library stops your task, runs `robotEnd()` once, and drives the `PROBOT_ESTOP_ENABLE_PIN` LOW if you defined it. Until the robot restarts, it rejects all commands except **EMERGENCY STOP** and **Reboot Robot** (HTTP 409).

Fix: Only a restart clears the lock. Press **Reboot Robot**, or turn the robot's power off and on. Then press **Init** and **Start** again.

<a id="pb-e303"></a>
<a id="pb-e303-baglant-kopmas-robot-durduruldu"></a>
### "DISCONNECTED": connection lost, robot stopped {#pb-e303-baglanti-kopmasi-robot-durduruldu}

The Driver Station shows "DISCONNECTED" and "Trying to reconnect..." over the screen. The Serial Monitor shows a line that starts with "DS timeout: no activity for". The library also writes this line to the **Telemetry** panel:

```text
!! DS CONNECTION LOST — stopping robot
```

When the connection drops, the library does these steps in order:

1. If no gamepad data arrives for 500 ms, the axes and buttons read as zero (`PROBOT_INPUT_TIMEOUT_MS`).
2. If the owner device stays silent for 5 seconds, ownership is released, and the gamepad data is reset (`PROBOT_DS_OWNER_TIMEOUT_MS`).
3. If the Driver Station stays silent for 10 seconds, the robot stops and `robotEnd()` runs (`PROBOT_DS_TIMEOUT_MS`).

When the connection comes back, the robot does not start by itself. Press **Init** and **Start** again.

| Cause | Fix |
|---|---|
| Another robot nearby broadcasts on the same channel. | Give each robot a different fixed channel from 1, 5, 9 and 13. You can also change the channel without uploading the code again: **Kanal Değiştir** (Change channel) in the **Logs** tab (the channel controls in the **Logs** tab are in Turkish). Do not change it during a match. |
| Phone hotspots are open nearby. | During a match, do not let anyone turn on a hotspot near the robot. |
| The tablet is far from the robot, or something blocks the signal. | If **RSSI** in the **Logs** tab is worse than -70 dBm, move the tablet closer, and check the antenna. |
| The tablet does not see channel 12 or 13. | Give the robot a channel from 1 to 11. |

See [Improve the signal quality](sinyali-iyilestir.md).

<a id="pb-e304"></a>
<a id="pb-e304-baglant-kopmas-notr-bekleme"></a>
### Connection lost, robot did not stop {#pb-e304-baglanti-kopmasi-notr-bekleme}

The **Telemetry** panel shows this line:

```text
!! DS CONNECTION LOST — joystick neutral, waiting reconnect
```

Cause: The code has `#define PROBOT_DS_TIMEOUT_FORCE_STOP 0`. With this setting, the robot does not stop after 10 seconds of silence. The gamepad data reads as zero, and `teleopLoop()` or `autonomousLoop()` keeps running. When the connection comes back, the robot continues from where it was.

Fix: If you chose this setting, the behavior is expected. Autonomous also keeps running during this time. If you do not want the robot to move without a connection, delete the macro (the default is `1`). For the causes of a drop, see [Connection lost, robot stopped](#pb-e303).

<a id="pb-e305"></a>
<a id="pb-e305-e-stop-stop-hook-zaman-asm"></a>
### Robot restarted after an emergency stop {#pb-e305-e-stop-stop-hook-zaman-asimi}

The Serial Monitor shows this line:

```text
[SYS  ] estop robotEnd timed out -> restart
```

Cause: During an emergency stop, `robotEnd()` did not finish in 500 ms (`PROBOT_ESTOP_END_MS`). Instead of waiting, the library restarts the board. An emergency stop interrupts your task in the middle of its work. That is why an I2C call inside `robotEnd()` can also stall.

Fix: Keep `robotEnd()` short. Reset the motor pins, and return. Do not put `delay()`, a long loop or an I2C call without a timeout inside it.

### Motors do not stop after Stop {#motorlar-durmuyor}

At Stop, the library calls `robotEnd()`. Stopping the motors is your code's job. `robotEnd()` runs after the current loop pass ends.

| Cause | Fix |
|---|---|
| `robotEnd()` is empty, or it does not stop the motors. | Write the code that stops the motors in `robotEnd()`. An example is below. |
| The loop pass takes a long time, and `robotEnd()` waits for the pass to end. | Remove the long waits from the loop. To stop at once, press **EMERGENCY STOP**. |

An example with one motor and a BTS7960-style driver:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins for your board
#define MOTOR_RPWM 5   // forward
#define MOTOR_LPWM 6   // backward

void motorSur(float guc) {
  int duty = (int)(fabsf(guc) * 255.0f);
  if (duty > 255) duty = 255;
  if (guc > 0.02f)       { analogWrite(MOTOR_RPWM, duty); analogWrite(MOTOR_LPWM, 0); }
  else if (guc < -0.02f) { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, duty); }
  else                   { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, 0); }
}

void robotInit() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  motorSur(0);
}

void robotEnd() {
  motorSur(0);   // The motor stops at Stop
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motorSur(js.getLeftY());   // left stick forward: motor forward
}

void autonomousInit() {}
void autonomousLoop() {}
```

See [Drive the motor](motoru-sur.md).

## Report a bug {#hata-bildir}

If this page has no fix for an error, report it on the library's GitHub page: [github.com/probot-studio/probot-core/issues](https://github.com/probot-studio/probot-core/issues).

Include these in your message:

- The shortest code that shows the error.
- The last button you pressed (for example **Init** or **Start**).
- The text on the screen, in the Telemetry panel, or in the Serial Monitor, word for word.
- The library version (0.3.0) and the browser you use.
