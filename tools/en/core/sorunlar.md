# Errors and troubleshooting

On this page, you find the cause and the fix of errors that come up during setup, while compiling and during a match with Probot Core.

The page describes probot-core 0.4.0. First check the status indicators, then find the heading of the symptom. If a message appeared on the screen, the heading starts with that message. The library's messages start with an error code such as `[PB-E301]`; find the code in the
[Error codes](#hata-kodlari) table.

## Check the status indicators first {#durum-gostergeleri}

The status LED on the board shows the robot's current state. The library sets its color; your code cannot
change it. The Driver Station also shows some states with a text that covers the whole screen.

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

| Indicator | Meaning | What to do |
|---|---|---|
| LED solid blue | The robot is on, the Driver Station is not connected. | Connect to the robot's network and open `http://192.168.4.1` in the browser: [First 10 minutes](ilk-10-dakika.md). |
| LED blue, blinking | The Driver Station is connected, the robot is stopped. | In **Match Control**, select **Autonomous** or **Teleoperated**, then press **Init**. |
| LED solid yellow | Init is done, waiting for Start. | Press **Start**. |
| LED yellow, blinking | The autonomous time is up, Teleoperated is selected, waiting for Init. | See [Autonomous is over, TeleOp does not start](#teleop-baslamiyor). |
| LED orange, blinking | Autonomous is running. | When the time is up, autonomous stops. TeleOp does not start by itself. |
| LED green, blinking | TeleOp is running. | Drive the robot with the gamepad. |
| LED red, blinking | A loop pass of your code did not finish in time. | See [The LED blinks red: the loop stalled](#pb-e301). |
| LED solid red | The emergency stop is locked. | See ["EMERGENCY STOPPED"](#pb-e302). |
| A "PB-E301" band at the top of the page | A loop pass of your code stalled. | See [The LED blinks red: the loop stalled](#pb-e301). |
| "DISCONNECTED" on the Driver Station | The interface has received no data from the robot for 6 seconds. | See ["DISCONNECTED": connection lost, robot stopped](#pb-e303). |
| "EMERGENCY STOPPED" on the Driver Station | The emergency stop is locked. | See ["EMERGENCY STOPPED"](#pb-e302). |
| **Joystick** "None" in **System Status** | The page does not see a gamepad. | See [Gamepad not detected: "Bağlı değil" (Not connected)](#kumanda-baglanmiyor). |
| "Veri yok" (No data) in **Battery** | Battery measurement is not set up, or the sensor does not respond. | [Measure the battery voltage](bataryayi-olc.md); if you have a sensor, [PB-E306](#pb-e306). |
| "Komut reddedildi" (Command rejected) in **Event Log** | The command is not valid in the robot's current phase. | See ["Komut reddedildi": the command is not valid in this phase](#pb-e409). |

For all LED colors and the extra signal light (RSL): [Use the status LED](led-durumu.md).

<a id="hata-kodlar-pb-exxx"></a>
## Error codes {#hata-kodlari}

Every error message of the library carries a permanent code. The code is the same in the compiler output, in the Telemetry panel,
in the Serial Monitor and on the Driver Station. The first digit tells where the error came up: 1 compile, 2 link,
3 during the match, 4 Driver Station command.

| Code | Where it appears | Meaning |
|---|---|---|
| [PB-E101](#pb-e101) | Compile | The WiFi password is missing or shorter than 8 characters. |
| [PB-E102](#pb-e102) | Compile | The WiFi channel is missing or outside 1-13. |
| [PB-E103](#pb-e103) | Compile | The WiFi network name is empty or too long. |
| [PB-E104](#pb-e104) | Compile | The pin or the resistors of the battery voltage divider are wrong. |
| [PB-E105](#pb-e105) | Compile | The battery source or the INA sensor setting is wrong. |
| [PB-E106](#pb-e106) | Compile | The code has `robotInit()` or `robotEnd()`, which were removed in 0.4.0. |
| [PB-E201](#pb-e201) | Link | A required mode function is missing. |
| [PB-E202](#pb-e202) | Compile | The code has `setup()` or `loop()`. |
| [PB-E301](#pb-e301) | Telemetry, Driver Station | A loop pass of your code did not finish in time. |
| [PB-E302](#pb-e302) | Telemetry, Serial Monitor, Driver Station | The emergency stop is locked. |
| [PB-E303](#pb-e303) | Telemetry | The connection dropped, the robot stopped. |
| [PB-E304](#pb-e304) | Telemetry | The connection dropped, the robot did not stop. |
| [PB-E305](#pb-e305) | Serial Monitor | At the emergency stop, the stop function did not finish, and the board restarted. |
| [PB-E306](#pb-e306) | Telemetry, Serial Monitor | The battery sensor does not respond. |
| [PB-E409](#pb-e409) | Driver Station (**Event Log**) | The command is not valid in the robot's current phase. |

## Setup and upload {#kurulum-ve-yukleme}

Arduino IDE shows the error in the **Output** panel at the bottom. Setup steps: [Set up Arduino IDE for Probot](arduino-ide-kur.md).

### The port list is empty or the upload fails {#port-yok}

The **Tools** > **Port** list stays empty, or the upload stops with a port error.

| Cause | Fix |
|---|---|
| The USB cable is a charging-only cable and does not carry data. | Use a data cable. |
| On Windows, the USB driver (CH340 or CP210x) is not installed. | Install the driver from the maker's website. |
| The USB port or the hub has a problem. | Plug the board into a USB port on the computer itself. |
| A circuit connected to the board breaks the upload. | Remove the circuit and try again with the bare board. |

### "Sketch too big" {#sketch-too-big}

Cause: The code does not fit in the app area of the default partition layout (Partition Scheme). The library uses most
of this area; as your code grows, the area runs out.

Fix: In **Tools** > **Partition Scheme**, select **Huge APP (3MB No OTA/1MB SPIFFS)** and upload again.
When you open a new sketch or select the board again, check this setting.

See [Set up Arduino IDE for Probot](arduino-ide-kur.md).

### "probot.h: No such file or directory" {#probot-h-yok}

Cause: The `probot` library is not installed.

Fix: Select **Tools** > **Manage Libraries**, type `probot` and press **Install**. Check that the library version
is 0.4.0.

### "Adafruit_NeoPixel.h: No such file or directory" {#neopixel-yok}

Cause: The `Adafruit NeoPixel` library, which drives the status LED, is not installed. `probot` depends on this library.

Fix: In **Manage Libraries**, type `adafruit neopixel` and install it. When you install `probot`, if the IDE asks
about dependencies, press **Install all**.

## Compile errors {#derleme-hatalari}

These errors come from the settings in your code. Compiling stops, and nothing is uploaded to the board. The error line starts with `error:`;
you find the code and the explanation on that line.

!!! note "Note"
    Settings macros always come before the `#include <probot.h>` line. The library does not see a macro
    written after it. All macros: [Settings macros](makro-listesi.md).

<a id="pb-e101"></a>
<a id="pb-e101-wifi-sifresi-eksik-veya-ksa"></a>
### "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." {#pb-e101-wifi-sifresi-eksik-veya-kisa}

The full text:

```text
error: static assertion failed: [PB-E101] PROBOT_WIFI_AP_PASSWORD must be at least 8 characters. Docs: probotstudio.com/docs/hatalar/#pb-e101
```

If the password macro is missing, or it was written after the `#include` line, the text is:

```text
error: #error "[PB-E101] Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h. Docs: probotstudio.com/docs/hatalar/#pb-e101"
```

Cause: The robot's WiFi network does not open without a password. The password must be at least 8 characters.

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

The full text:

```text
error: static assertion failed: [PB-E102] PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only). Docs: probotstudio.com/docs/hatalar/#pb-e102
```

If the channel macro is missing, the text is:

```text
error: #error "[PB-E102] WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h. Docs: probotstudio.com/docs/hatalar/#pb-e102"
```

If `PROBOT_WIFI_AUTO_CHANNEL 1` is written, the channel can be 0-13; outside that range, the text starts with "PROBOT_WIFI_AP_CHANNEL must be 0-13".

Cause: The 2.4 GHz channel the robot broadcasts on must be set when the code is compiled. `PROBOT_WIFI_AP_CHANNEL` is missing or
outside 1-13.

Fix: Write a channel from 1 to 13, for example `#define PROBOT_WIFI_AP_CHANNEL 1`. If there are several robots
in the same hall, give each robot a different, fixed channel; 1, 6 and 11 are recommended.

See [Competition day channel plan](sinyali-iyilestir.md#kanal-plani).

<a id="pb-e103"></a>
### "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." {#pb-e103-ssid-uzunlugu}

Two more messages can come up with the same code:

```text
[PB-E103] PROBOT_WIFI_AP_SSID must be 32 characters or fewer.
[PB-E103] PROBOT_WIFI_AP_SSID must be at least 1 character.
```

Cause: The network name (SSID) can be at most 32 characters. If `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` is defined, the library adds
a 7-character suffix in the form `-XXXXXX` to the end of the name. So the name can be at most 25 characters. If you do not
write a network name at all, the name is `Probot` and the suffix turns on by itself.

Fix: Shorten the network name. With the suffix on, write at most 25 characters; with it off, at most 32. Do not write an empty name (`""`).

<a id="pb-e104"></a>
<a id="pb-e104-batarya-adc-konfigurasyonu-gecersiz"></a>
### "PROBOT_BATTERY_ADC_PIN ADC1 pini olmali" {#batarya-adc-ayari}

The full text:

```text
error: static assertion failed: [PB-E104] PROBOT_BATTERY_ADC_PIN ADC1 pini olmali (ESP32-S3: GPIO1-10). ADC2 (GPIO11-20) WiFi acikken calismaz. Docs: probotstudio.com/docs/hatalar/#pb-e104
```

Other messages can come up with the same code:

```text
[PB-E104] Gerilim bolucu direncleri eksik: PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K (kilo-ohm) tanimlanmali.
[PB-E104] Bolucu direncleri pozitif olmali (kilo-ohm).
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti ADC'ye devredilemez.
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_RSL_PIN ile cakisiyor.
[PB-E104] PROBOT_BATTERY_ADC_PIN, NEOPIXEL_PIN ile cakisiyor.
```

These errors come up when you measure the battery with a voltage divider (`PROBOT_BATTERY_ADC_PIN`).

| Cause | Fix |
|---|---|
| The pin is outside GPIO1-10. The GPIO11-20 pins cannot measure while WiFi is on. | Select a pin from GPIO1-10. |
| `PROBOT_BATTERY_R_TOP_K` or `PROBOT_BATTERY_R_BOT_K` is not written, or it is 0. | Write both resistors in kilo-ohms, for example `100` and `22`. |
| The battery pin is the same as the emergency stop, signal light or status LED pin. | Give the battery another pin. |

```cpp
#define PROBOT_BATTERY_ADC_PIN  5     // from GPIO1-10
#define PROBOT_BATTERY_R_TOP_K  100   // resistor connected to the battery, kilo-ohms
#define PROBOT_BATTERY_R_BOT_K  22    // resistor connected to GND, kilo-ohms
#include <probot.h>
```

See [Connect the voltage divider](bataryayi-olc.md#gerilim-bolucu).

<a id="pb-e105"></a>
<a id="pb-e105-batarya-kaynak-secimi-gecersiz"></a>
### "Tek batarya kaynagi secin" {#batarya-kaynagi}

The full text:

```text
error: #error "[PB-E105] Tek batarya kaynagi secin: PROBOT_BATTERY_ADC_PIN (bolucu) VEYA PROBOT_BATTERY_INA (I2C sensor), ikisi birden degil. Docs: probotstudio.com/docs/hatalar/#pb-e105"
```

The same code also comes up when the INA sensor macros or the fine-tuning macros are wrong. The text names the macro.

| Cause | Fix |
|---|---|
| Both `PROBOT_BATTERY_ADC_PIN` and `PROBOT_BATTERY_INA` are written. | Keep only one of them. |
| `PROBOT_BATTERY_INA` is not 219 or 226. | Write your sensor's number: `219` or `226`. |
| Only one of `PROBOT_BATTERY_INA_SDA` and `PROBOT_BATTERY_INA_SCL` is written, or both are the same pin. | Write both with different pins, or delete both. |
| An I2C pin of the INA is the same as the emergency stop or signal light pin. | Give the sensor other pins. |
| `PROBOT_BATTERY_TRIM` is outside 0.5-2.0. | If the ratio is far off, correct the resistor values; keep the fine-tuning between 0.5 and 2.0. |
| `PROBOT_BATTERY_INA_SHUNT_MOHM` is 0 or negative. | Write the module's shunt resistor in milliohms. |
| `PROBOT_BATTERY_INA_ADDR` is outside 0x08-0x77. | Write the sensor's I2C address; the default is `0x40`. |

```cpp
#define PROBOT_BATTERY_INA   226    // or 219; not written together with PROBOT_BATTERY_ADC_PIN
#include <probot.h>
```

See [Use an INA219 or INA226 sensor](bataryayi-olc.md#ina-sensoru).

<a id="pb-e106"></a>
<a id="pb-e106-kaldrlms-hook-robotinitrobotend"></a>
### "redefinition of 'void robotInit()'" {#pb-e106-kaldirilmis-hook-robotinit-robotend}

Compiling stops. The output shows these lines:

```text
error: redefinition of 'void robotInit()'
note: 'void robotInit()' previously defined here
void robotInit() = delete; // [PB-E106] removed in 0.4.0: move this code into teleopInit()/autonomousInit()
```

The `note:` line points to `probot.h`; the PB-E106 code and what to do are written there. The same error comes up
for `robotEnd()`: "move this code into teleopStop()/autonomousStop()".

Cause: `robotInit()` and `robotEnd()` are 0.3.0 functions; they were removed in 0.4.0. Your code was written for 0.3.0.
The library stops compiling so that old code does not compile and run without ever calling these functions.

Fix: Delete the two functions and move the code inside them:

| Function in 0.3.0 | Where to move the code |
|---|---|
| `robotInit()`: `pinMode`, starting values, gamepad mapping | `autonomousInit()` and `teleopInit()`; both call the same shared function |
| `robotEnd()`: stopping the motors | `autonomousStop()` and `teleopStop()`; both call the same shared function |

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

#define MOTOR_PIN 16   // change the pin to match your board

void motorlariDurdur() {   // the code from the old robotEnd()
  analogWrite(MOTOR_PIN, 0);
}

void hazirla() {           // the code from the old robotInit()
  pinMode(MOTOR_PIN, OUTPUT);
  motorlariDurdur();
}

void autonomousInit() { hazirla(); }           // once at Init while Autonomous is selected
void autonomousLoop() {}                       // again and again during autonomous
void autonomousStop() { motorlariDurdur(); }   // once every time autonomous ends

void teleopInit() { hazirla(); }               // once at Init while Teleoperated is selected
void teleopLoop() {}                           // again and again during TeleOp
void teleopStop() { motorlariDurdur(); }       // once every time TeleOp ends
```

If one of the stop functions is missing, after PB-E106 is fixed, linking stops with [PB-E201](#pb-e201).
See [Move 0.3.0 code](hooklari-yaz.md#gecis).

<a id="pb-e201"></a>
<a id="pb-e201-zorunlu-hook-tanmsz-undefined-reference"></a>
### "undefined reference to": a required function is missing {#pb-e201-zorunlu-hook-tanimsiz-undefined-reference}

Compiling passes, and the link step stops. The output shows these lines:

```text
undefined reference to `_Z14autonomousStopv'
collect2: error: ld returned 1 exit status
```

`_Z14autonomousStopv` is the name the compiler uses for `autonomousStop()`. The name changes with the missing function:
`_Z14autonomousLoopv`, `_Z10teleopLoopv` or `_Z10teleopStopv`.

Cause: `autonomousLoop()`, `autonomousStop()`, `teleopLoop()` and `teleopStop()` are required. If one is missing, the code
does not link. The init functions and the advanced functions are optional; if you do not write them, they count as empty.

Fix: Write all four required functions; their bodies can be empty. The shortest correct skeleton:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void autonomousInit() {}   // optional: once at Init
void autonomousLoop() {}   // required
void autonomousStop() {}   // required: stop the motors here

void teleopInit() {}       // optional: once at Init
void teleopLoop() {}       // required
void teleopStop() {}       // required: stop the motors here
```

See [Write the skeleton of the program](hooklari-yaz.md#iskelet).

<a id="pb-e202"></a>
<a id="pb-e202-setuploop-caksmas-multiple-definition"></a>
### "redefinition of 'void setup()'" {#pb-e202-setuploop-cakismasi-multiple-definition}

Compiling stops. The output shows these lines:

```text
error: redefinition of 'void setup()'
note: 'void setup()' previously defined here
```

The same text comes up for `loop()` too: "redefinition of 'void loop()'".

Cause: `setup()` and `loop()` belong to the library. The library defines both inside `probot.h`. When your code
defines them once more, the compiler stops.

Fix: Delete the `setup()` and `loop()` functions from your code. Move the code that runs at startup to `autonomousInit()` and
`teleopInit()`, and the code that repeats to `autonomousLoop()` or `teleopLoop()`.

See [Write the functions for the match flow](hooklari-yaz.md).

## Connection and gamepad {#baglanti-ve-kumanda}

### The interface does not open, or "Another client is already connected." {#arayuz-acilmiyor}

The robot accepts one device at a time. The first device that opens the interface owns it; other devices see this text (HTTP 403).

| Cause | Fix |
|---|---|
| The Driver Station is open on another device. | Close the tab on the other device, or take that device off the robot's network. After 5 seconds, reload the page. |
| The device is not connected to the robot's network. | In the WiFi list, select the robot's network, then open `http://192.168.4.1`. |
| The welcome page did not open when you connected to the network. | Open `http://192.168.4.1` in the browser yourself. |
| The browser opened the address with `https://`. | In the address bar, type `http://192.168.4.1`. |

See [Driver Station interface](arayuz.md).

### Gamepad not detected: "Bağlı değil" (Not connected) {#kumanda-baglanmiyor}

In **System Status** on the **Dashboard**, **Joystick** shows "None", or on the **Joystick** tab the **Gamepad** card
says "Bağlı değil". The axis values never change.

| Cause | Fix |
|---|---|
| No button has been pressed on the gamepad yet. The browser detects the gamepad at the first button press. | Press any button on the gamepad. |
| The gamepad is connected to another device. | Connect the gamepad to the phone or tablet where you opened the Driver Station. |
| You do not have a gamepad. | On the **Joystick** tab, in the **Klavye** (Keyboard) or **Dokunmatik** (Touch) card, press **Etkinleştir** (Turn on). See [Drive without a gamepad](kumandayi-oku.md#kumandasiz-sur). |
| The gamepad is connected, but the robot does not react during **Init**. | This is the expected behavior: the gamepad values reach your code only after **Start**. Press **Start**. |
| The gamepad is connected, but the axes or buttons are mixed up. | In `teleopInit()`, select the mapping that fits your gamepad, for example `probot::io::joystick_mapping::setActiveByName("standard");`. See [Change the gamepad mapping](kumandayi-oku.md#esleme). |

### The servo jitters {#servo-titriyor}

The servo does not hold its position, twitches now and then, or moves without a command.

| Cause | Fix |
|---|---|
| The servo is powered from the ESP32's 5V or 3V3 pin; these pins cannot supply the current the servo draws. | Give the servo a separate 5-6 V supply (BEC/UBEC), and connect the grounds (GND) together. |
| The servo and the motors share the same LEDC timer. The motors' `analogWrite` uses the low channels. | Give the servo a high channel: in `teleopInit()` and `autonomousInit()`, `ledcAttachChannel(SERVO_PIN, 50, 14, 7);` |
| On the PCA9685 board, the frequency is not 50 Hz. | Set the frequency to 50 Hz for the servo outputs. |
| The servo arm is stuck, or the load is too high. | Move the mechanism by hand and remove the friction. |

See [Drive the servo](servoyu-sur.md).

## During the match {#mac-sirasinda}

<a id="pb-e301"></a>
<a id="deadline-miss"></a>
<a id="pb-e301-deadline-miss-loop-takld"></a>
### The LED blinks red: the loop stalled {#pb-e301-deadline-miss-loop-takildi}

This line appears in the **Telemetry** panel of the Driver Station:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

A red band that starts with "PB-E301" appears at the top of the page. In **System Status**, **Robot Code** shows "Stalled";
on the **Logs** tab, **Deadline Miss** shows "YES".

Cause: A loop pass of your code did not finish in time. There are two time limits:

| Function | Limit | Macro |
|---|---|---|
| Functions called again and again: `autonomousLoop()`, `teleopLoop()`, `autonomousInitLoop()`, `teleopInitLoop()` | 2 seconds | `PROBOT_LOOP_DEADLINE_MS` (2000) |
| Functions called once: the init, start and stop functions | 10 seconds | `PROBOT_HOOK_DEADLINE_MS` (10000) |

This is why a sensor calibration that takes a few seconds inside `autonomousInit()` gives no error.

The library resets the gamepad inputs and turns the LED red. It does not stop your code and does not restart the board.
The phase does not change: autonomous stays in autonomous, TeleOp stays in TeleOp. When the pass ends, the error clears by itself.

!!! warning "Warning"
    The library does not touch the motor pins. When a pass stalls, the motors keep turning with the last command you gave.
    **Stop** waits for the pass to end. To stop the robot at once, press **Emergency Stop**.

| Cause | Fix |
|---|---|
| The loop has a `delay()` of 2 seconds or longer. | Instead of waiting, measure time with `millis()`. See [Wait with millis()](otonom-yaz.md#bekleme). |
| The loop has a `while` loop that waits for something. | Check the condition once per pass, and end the pass. |
| A sensor connected over I2C does not respond, and the call does not return. | After `Wire.begin()`, write `Wire.setTimeOut(50);`. Check the sensor's cable and power supply. |
| `Serial.println()` sends a lot of text on every pass. | Write less to Serial, or use `probot::printf`. |
| The calibration in the init function takes longer than 10 seconds. | Shorten the calibration, or split it into passes inside `autonomousInitLoop()`. |

If you cannot find the cause, simplify the code step by step: [Cut the loop down to its simplest form](hatayi-daralt.md#en-sade-kod).

<a id="pb-e302"></a>
### "EMERGENCY STOPPED" {#pb-e302-emergency-stop-kilidi}

This text covers the Driver Station, with the **Reboot Robot** button below it. The LED lights red and does not go out.

```text
EMERGENCY STOPPED
Robot disabled — reboot required to clear · PB-E302 — docs/hatalar#pb-e302
```

These lines appear in the **Telemetry** panel and in the Serial Monitor:

```text
!! [PB-E302] EMERGENCY STOP — robot disabled, reboot required — docs/hatalar#pb-e302
[SYS  ] [PB-E302] EMERGENCY STOP — docs: probotstudio.com/docs/hatalar/#pb-e302
```

Cause: Someone pressed **Emergency Stop** on the Driver Station or <kbd>Space</kbd> on the keyboard, or the code
called `probot::emergencyStop()`. This is not a fault; it is a safety behavior. The library cuts your code. If the robot
is in **Init** or running, it runs the current mode's stop function (`autonomousStop()` or `teleopStop()`) once.
If `PROBOT_ESTOP_ENABLE_PIN` is defined, it sets that pin LOW.

Until the robot restarts, it rejects every command other than **Emergency Stop** and **Reboot Robot** (HTTP 409).
The rejection message is:

```text
EMERGENCY STOPPED — reboot required
```

Fix: Only a restart clears the lock. Press **Reboot Robot**, or turn the robot's power off and on. Then
select the mode, and press **Init** and **Start** again.

<a id="pb-e303"></a>
<a id="pb-e303-baglant-kopmas-robot-durduruldu"></a>
### "DISCONNECTED": connection lost, robot stopped {#pb-e303-baglanti-kopmasi-robot-durduruldu}

The text "DISCONNECTED" and "Trying to reconnect…" covers the Driver Station. In the Serial Monitor, a line that starts with
"DS timeout: no activity for" appears. The library also writes this line to the **Telemetry** panel:

```text
!! [PB-E303] DS CONNECTION LOST — stopping robot — docs/hatalar#pb-e303
```

When the connection drops, the library does these things in order:

1. If no gamepad data arrives for 500 ms, the axes and buttons read as zero (`PROBOT_INPUT_TIMEOUT_MS`).
2. If the owner device stays silent for 5 seconds, the ownership is released and the gamepad data is reset (`PROBOT_DS_OWNER_TIMEOUT_MS`).
3. If the Driver Station stays silent for 10 seconds, the robot stops and the current mode's stop function runs (`PROBOT_DS_TIMEOUT_MS`).

When the connection comes back, the robot does not start by itself. Select the mode, and press **Init** and **Start** again.

| Cause | Fix |
|---|---|
| Another robot nearby broadcasts on the same channel. | Give the robots different, fixed channels; 1, 6 and 11 are recommended. You can also change the channel without uploading code, with **Kanal Değiştir** (Change channel) on the **Logs** tab; do not change it during a match. |
| There are phone hotspots turned on nearby. | During a match, do not let anyone turn on a hotspot near the robot. |
| The tablet is far from the robot, or something is in between. | If **RSSI** on the **Logs** tab is worse than -70 dBm, move the tablet closer and check the antenna. |
| The tablet does not see channel 12 or 13. | Give the robot a channel from 1 to 11. |

See [Improve the signal quality](sinyali-iyilestir.md).

<a id="pb-e304"></a>
<a id="pb-e304-baglant-kopmas-notr-bekleme"></a>
### Connection lost, robot did not stop {#pb-e304-baglanti-kopmasi-notr-bekleme}

This line appears in the **Telemetry** panel:

```text
!! [PB-E304] DS CONNECTION LOST — joystick neutral, waiting reconnect — docs/hatalar#pb-e304
```

Cause: The code has `#define PROBOT_DS_TIMEOUT_FORCE_STOP 0`. With this setting, the robot does not stop after 10 seconds of silence.
The gamepad data reads as zero, and `teleopLoop()` or `autonomousLoop()` keeps running. When the connection comes back,
the robot carries on from where it was.

Fix: If you chose this setting, the behavior is expected. Autonomous also keeps running during this time; if you do not want the robot to move
without a connection, delete the macro (the default is `1`). For the causes of the drop: ["DISCONNECTED": connection lost, robot stopped](#pb-e303).

<a id="pb-e305"></a>
<a id="pb-e305-e-stop-stop-hook-zaman-asm"></a>
### The robot restarted after an emergency stop {#pb-e305-e-stop-stop-hook-zaman-asimi}

This line appears in the Serial Monitor:

```text
[SYS  ] [PB-E305] estop stop hook timed out -> restart — docs: probotstudio.com/docs/hatalar/#pb-e305
```

Cause: At the emergency stop, `autonomousStop()` or `teleopStop()` did not finish within 500 ms (`PROBOT_ESTOP_END_MS`).
Instead of waiting, the library restarts the board. The emergency stop cuts your code in the middle of its work, so an I2C call in the stop
function can stall too.

Fix: Keep the stop functions short: set the motor pins to zero and return. Do not put a `delay()`, a long loop or an I2C call
without a timeout inside them.

<a id="pb-e306"></a>
<a id="pb-e306-batarya-sensorune-ulaslamyor"></a>
### "BATTERY SENSOR UNREACHABLE": the battery sensor does not respond {#pb-e306-batarya-sensorune-ulasilamiyor}

These lines appear in the **Telemetry** panel and in the Serial Monitor:

```text
!! [PB-E306] BATTERY SENSOR UNREACHABLE — INA I2C yanit vermiyor — docs/hatalar#pb-e306
[BATT ] [PB-E306] sensor unreachable — docs: probotstudio.com/docs/hatalar/#pb-e306
```

The **Battery** indicator on the **Dashboard** says "Veri yok".

Cause: The code has `PROBOT_BATTERY_INA`, but the library cannot find the INA219 or INA226 sensor on I2C. After four failed
readings in a row, the library stops using the measurement, and the indicator shows "Veri yok".

| Cause | Fix |
|---|---|
| The SDA, SCL or power cable is loose. | Check the cables and the solder joints. |
| The sensor's address is different. | Write the address with `PROBOT_BATTERY_INA_ADDR`; the default is `0x40`. |
| The I2C line has no pull-up resistors. | Use a module that has pull-up resistors, or add the resistors. |
| Your code connects another device to the same I2C line. | Move your own device to `Wire1`, or measure the battery with a voltage divider. |

Fix: When the sensor responds again, the measurement comes back by itself. The `[BATT ] sensor recovered`
line appears in the Serial Monitor. See [Use an INA219 or INA226 sensor](bataryayi-olc.md#ina-sensoru).

<a id="pb-e409"></a>
<a id="pb-e409-gecersiz-evrede-komut"></a>
### "Komut reddedildi": the command is not valid in this phase {#komut-reddedildi}

In the **Event Log** on the **Logs** tab, a line in this form appears (HTTP 409):

```text
Komut reddedildi (init): 409 [PB-E409] INIT requires STOPPED — docs/hatalar#pb-e409
```

When a mode selection is rejected, the line starts with "Mod değişmedi:" (Mode did not change). In these cases, the interface disables the buttons, so this
message mostly comes up when you press a button several times quickly.

| Text | Cause | Fix |
|---|---|---|
| `STOP before changing mode` | The mode was changed while the robot was in **Init** or running. | Press **Stop** first, then select the mode. |
| `INIT requires STOPPED` | **Init** was sent before the robot stopped. | Press **Stop**, then press **Init**. |
| `START requires INIT` | The robot is not in the Init phase (**Init** was not pressed, the robot is already running, or autonomous ended a moment ago), or **Start** was already accepted. | Press **Init** first; when the LED is solid yellow, press **Start**. You do not need to wait for the init function to finish; **Start** is queued. |
| `STOP requires INIT or RUN` | The robot is already stopped. | Do nothing. Select the mode and press **Init**. |

See [Follow the match flow](hooklari-yaz.md#mac-akisi).

### Autonomous is over, TeleOp does not start {#teleop-baslamiyor}

When the autonomous time is up, the robot stops and the LED blinks yellow. In **Match Control**, the button's text changes to **Init Teleop**.

Cause: This is not a fault. In 0.4.0, when the autonomous time is up, `autonomousStop()` runs once and **Teleoperated**
becomes selected. TeleOp does not start by itself.

Fix: Press **Init Teleop**, then **Start**. See [Follow the match flow](hooklari-yaz.md#mac-akisi).

### The motors do not stop after Stop {#motorlar-durmuyor}

At Stop, the library calls the current mode's stop function: `autonomousStop()` in autonomous, `teleopStop()` in TeleOp.
The same function also runs when the autonomous time is up, when the connection drops and at an emergency stop. Stopping the motors
is your code's job. The stop function runs after the current loop pass ends.

| Cause | Fix |
|---|---|
| The stop function is empty or does not stop the motors. | Write the code that stops the motors in the stop function. See the example below. |
| The stopping code is only in one mode's stop function. | Write a shared stop function, and let both `autonomousStop()` and `teleopStop()` call it. |
| The loop pass takes long; the stop function waits for the pass to end. | Remove the long waits from the loop. To stop at once, press **Emergency Stop**. |

An example with one motor and a BTS7960-style driver:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins to match your board
#define MOTOR_RPWM 5   // forward
#define MOTOR_LPWM 6   // backward

void motorSur(float guc) {
  int duty = (int)(fabsf(guc) * 255.0f);
  if (duty > 255) duty = 255;
  if (guc > 0.02f)       { analogWrite(MOTOR_RPWM, duty); analogWrite(MOTOR_LPWM, 0); }
  else if (guc < -0.02f) { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, duty); }
  else                   { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, 0); }
}

void motorHazirla() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  motorSur(0);
}

void autonomousInit() { motorHazirla(); }
void autonomousLoop() {}
void autonomousStop() { motorSur(0); }   // the motor stops when autonomous ends or at Stop

void teleopInit() { motorHazirla(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motorSur(js.getLeftY());   // left stick forward: motor forward
}

void teleopStop() { motorSur(0); }       // the motor stops at Stop
```

See [Stop the motors on Stop](hooklari-yaz.md#robotend).

## Report an error {#hata-bildir}

If this page has no fix for your error, report it on the library's GitHub page:
[github.com/probot-studio/probot-core/issues](https://github.com/probot-studio/probot-core/issues).

Write these things in the message:

- The shortest code that shows the error.
- The selected mode and the last button you pressed (for example **Teleoperated**, **Start**).
- The text on the screen, in the Telemetry panel or in the Serial Monitor, exactly as it appears. If there is an error code, write it too.
- The library version (0.4.0) and the browser you use.
