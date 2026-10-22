# Settings macros

This page lists all the settings that you change with `#define` in Probot Core. It shows the default value of each one and what it does.

## How to write a macro {#nasil-yazilir}

Write macros **before** the `#include <probot.h>` line. A macro written after it has no effect. The password and the channel then count as not defined, and the code does not compile.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"       // network name
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // required, at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1              // required, 1-13

#include <probot.h>
```

A macro that has no value (for example `PROBOT_WIFI_AP_SSID_MAC_SUFFIX`) is written without a value: `#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX`.

<a id="tum-makrolar"></a>
## WiFi {#wifi}

| Macro | Default | What it does |
|---|---|---|
| `PROBOT_WIFI_AP_SSID` | `Probot-XXXXXX` | The robot's network name. If it is not defined, the name is `Probot` with 6 characters from the MAC address added, and the compile shows a warning. At most 32 characters; at most 25 when the MAC suffix is on. |
| `PROBOT_WIFI_AP_PASSWORD` | none (required) | The network password, at least 8 characters. |
| `PROBOT_WIFI_AP_CHANNEL` | none (required) | The WiFi channel, 1-13. The channel saved with **Kanal Değiştir** (Change channel) in the **Logs** tab of the Driver Station overrides this macro (the channel controls in the **Logs** tab are in Turkish). For the channel, see [Set up the robot's WiFi](wifi-ayarla.md). |
| `PROBOT_WIFI_AUTO_CHANNEL` | `0` | `1`: the robot scans the band at every startup and picks the least busy channel among 1, 5, 9 and 13. Startup takes 2-3 seconds longer. In this mode, `PROBOT_WIFI_AP_CHANNEL` must still be written (0-13 accepted). Not recommended for several robots, because robots that start together can end up on the same channel. |
| `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` | off | Write it without a value. Adds `-XXXXXX` (6 characters from the MAC address) to the end of the network name. When you upload the same code to several robots, their network names stay separate. |
| `PROBOT_WIFI_ENABLE_11B` | `0` | `1`: turns on the 802.11b rates. Only for devices older than 802.11g. |
| `PROBOT_WIFI_PMF_REQUIRED` | `0` | `1`: makes protected management frames (PMF, 802.11w) required. This protects against fake disconnect attacks. Old tablets may not be able to connect. |
| `PROBOT_CAPTIVE_PORTAL` | `1` | On a device that joins the robot's network, the welcome page opens by itself. `0` turns this off. |

## Connection safety {#baglanti}

| Macro | Default | What it does |
|---|---|---|
| `PROBOT_INPUT_TIMEOUT_MS` | `500` | If no gamepad data arrives for this many milliseconds, all axes and buttons read as zero. |
| `PROBOT_DS_OWNER_TIMEOUT_MS` | `5000` | If the device that controls the robot sends no requests for this long, its place is released. Another device can then open the Driver Station. |
| `PROBOT_DS_TIMEOUT_MS` | `10000` | If the Driver Station stays completely silent for this long, the connection counts as lost. |
| `PROBOT_DS_TIMEOUT_FORCE_STOP` | `1` | `1`: when the connection drops, the robot goes to Stop and `robotEnd()` runs. `0`: the loops keep running, the gamepad reads neutral, and the robot continues where it left off when the connection returns. `0` is for bench tests: when the connection drops, the robot waits without stopping. Keep `1` at a competition. |

## Loop and emergency stop {#dongu}

| Macro | Default | What it does |
|---|---|---|
| `USER_LOOP_PERIOD_MS` | `20` | The time, in ms, that the library waits between calls to `teleopLoop()` and `autonomousLoop()`. |
| `PROBOT_LOOP_DEADLINE_MS` | `2000` | If a loop pass takes longer than this, the gamepad inputs reset and the status LED blinks red. The task is not stopped, and the board does not restart. The error clears when the pass ends. |
| `PROBOT_WDT_TIMEOUT_S` | `8` | The hardware watchdog time, in seconds. It watches only the library's own task. Your loop does not restart the board. It must stay longer than `PROBOT_LOOP_DEADLINE_MS`. |
| `PROBOT_ESTOP_END_MS` | `500` | The time, in ms, given to `robotEnd()` during an emergency stop. If it runs out, the board restarts. |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | The enable pin that the library drives; `-1` is off. It goes HIGH at startup and LOW at an emergency stop. If you connect it to the enable line of the motor drivers, an emergency stop also cuts the motors at the driver level. |

## LED {#led}

| Macro | Default | What it does |
|---|---|---|
| `NEOPIXEL_PIN` | `3` | The pin of the status LED. For what the colors mean, see [Use the status LED](led-durumu.md). |
| `NEOPIXEL_COUNT` | `1` | The number of LEDs. The library lights only the first LED. |
| `NEOPIXEL_BRIGHTNESS` | `32` | The brightness of the status LED, 0-255. |
| `PROBOT_RSL_PIN` | `-1` | The pin of the signal lamp (RSL); `-1` is off. It blinks while the robot runs, and stays on in other states. |

## Compile messages {#derleme-mesajlari}

If a macro is missing or wrong, Arduino IDE stops the compile with these messages. The messages are in English.

| Message | Cause |
|---|---|
| "Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h." | The password macro is missing, or it is written after the `#include` line. |
| "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." | The password has fewer than 8 characters. |
| "WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h." | The channel macro is missing, or it is written after the `#include` line. |
| "PROBOT_WIFI_AP_CHANNEL must be 1-13. ..." | The channel is outside 1-13. |
| "PROBOT_WIFI_AP_CHANNEL must be 0-13 ..." | `PROBOT_WIFI_AUTO_CHANNEL 1` is set, and the channel is outside 0-13. |
| "PROBOT_WIFI_AP_SSID must be 32 characters or fewer." | The network name is longer than 32 characters. |
| "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." | The MAC suffix is on, and the network name is longer than 25 characters. |

If you do not write `PROBOT_WIFI_AP_SSID` at all, the compile does not stop. The warning "PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX)." appears.
