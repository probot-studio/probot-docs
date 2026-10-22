# Settings macros

This page lists every Probot Core 0.4.0 setting that you change with `#define`, with its default value and what it does.

## How to write a macro {#nasil-yazilir}

Macros come **before** the `#include <probot.h>` line. A macro written after it has no effect. The password and the channel then count as not defined at all, and the code does not compile.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"       // network name
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // required, at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1              // required, 1-13

#include <probot.h>
```

Some macros take no value (for example `PROBOT_WIFI_AP_SSID_MAC_SUFFIX`). You write only the name: `#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX`.

<a id="tum-makrolar"></a>
## WiFi {#wifi}

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

| Macro | Default | What it does |
|---|---|---|
| `PROBOT_WIFI_AP_SSID` | `Probot-XXXXXX` | The robot's network name. If it is not defined, 6 characters from the MAC address are added to the name `Probot`, and compiling gives a warning. At most 32 characters; at most 25 while the MAC suffix is on. |
| `PROBOT_WIFI_AP_PASSWORD` | none (required) | The network password, at least 8 characters. |
| `PROBOT_WIFI_AP_CHANNEL` | none (required) | The WiFi channel, 1-13. A channel saved with **Kanal Değiştir** (Change channel) in the Driver Station's **Logs** tab wins over this macro. Which channel to pick: [Set up the robot's WiFi](wifi-ayarla.md). |
| `PROBOT_WIFI_AUTO_CHANNEL` | `0` | `1`: at every startup, the robot scans the band and picks the emptiest of channels 1, 6 and 11. Startup takes 2-3 seconds longer. In this mode you still write `PROBOT_WIFI_AP_CHANNEL` (0-13 is accepted). Robots that start at the same time can land on the same channel, so it is not recommended for several robots. |
| `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` | off | Written with no value. It adds `-XXXXXX` (6 characters from the MAC address) to the end of the network name. When you upload the same code to several robots, their network names stay different. |
| `PROBOT_WIFI_ENABLE_11B` | `0` | `1`: turns on the 802.11b speeds. Only for devices older than 802.11g. |
| `PROBOT_WIFI_PMF_REQUIRED` | `0` | `1`: makes PMF (802.11w) required. It blocks fake disconnect attacks; old tablets may not be able to connect. |
| `PROBOT_CAPTIVE_PORTAL` | `1` | The welcome page opens by itself on a device that joins the robot's network. `0` turns it off. |

## Connection safety {#baglanti}

| Macro | Default | What it does |
|---|---|---|
| `PROBOT_INPUT_TIMEOUT_MS` | `500` | If no gamepad data comes for this many milliseconds, all axes and buttons read as zero. |
| `PROBOT_DS_OWNER_TIMEOUT_MS` | `5000` | If the device that controls the robot sends no request for this long, its place becomes free. Another device can then open the Driver Station. |
| `PROBOT_DS_TIMEOUT_MS` | `10000` | If the Driver Station stays fully silent for this long, the connection counts as lost. |
| `PROBOT_DS_TIMEOUT_FORCE_STOP` | `1` | `1`: when the connection drops, the robot stops and the running mode's stop function runs. `0`: the loops go on, the gamepad reads as neutral, and the robot continues from where it was when the connection comes back. `0` is for keeping the robot waiting without stopping it when the connection drops (testing on the bench). In a competition, keep it at `1`. |

## Loop and emergency stop {#dongu}

| Macro | Default | What it does |
|---|---|---|
| `USER_LOOP_PERIOD_MS` | `20` | The time (ms) the library waits between calls of the loop and initLoop functions. |
| `PROBOT_LOOP_DEADLINE_MS` | `2000` | If a loop pass or initLoop pass takes longer than this, the gamepad inputs are reset and the status LED blinks red. The task is not stopped and the board does not restart; it clears when the pass ends. |
| `PROBOT_HOOK_DEADLINE_MS` | `10000` | The same limit (ms) for the init, start and stop functions, which run once. It leaves room for long jobs like sensor calibration. It cannot be smaller than `PROBOT_LOOP_DEADLINE_MS`; if you write a smaller value, the code does not compile. |
| `PROBOT_WDT_TIMEOUT_S` | `8` | The hardware watchdog time (seconds). It watches only the library's own task; your loop does not restart the board. Keep it longer than `PROBOT_LOOP_DEADLINE_MS`. |
| `PROBOT_ESTOP_END_MS` | `500` | The time (ms) given to the running mode's stop function in an emergency stop. If it takes longer, the board restarts. |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | An enable pin that the library drives; `-1` is off. It is HIGH at startup and LOW in an emergency stop. If you connect it to the enable line of the motor drivers, the emergency stop also cuts the motors at the driver level. |

## LED {#led}

| Macro | Default | What it does |
|---|---|---|
| `NEOPIXEL_PIN` | `3` | The status LED's pin. What the colors mean: [Use the status LED](led-durumu.md). |
| `NEOPIXEL_COUNT` | `1` | The number of LEDs. The library colors only the first LED. |
| `NEOPIXEL_BRIGHTNESS` | `32` | The status LED's brightness, 0-255. |
| `PROBOT_RSL_PIN` | `-1` | The signal light (RSL) pin; `-1` is off. It blinks while a mode runs (after **Start**). It stays on in the Init phase, while the robot is stopped, in the transition and in an emergency stop. |

## Battery {#batarya}

These macros let the library measure the battery voltage by itself. Pick one of two methods: a voltage divider (`PROBOT_BATTERY_ADC_PIN`) or an INA219 / INA226 sensor (`PROBOT_BATTERY_INA`). If you write both, the code does not compile. If you write neither, the measurement is off. Circuit and code: [Measure the battery voltage](bataryayi-olc.md).

| Macro | Default | What it does |
|---|---|---|
| `PROBOT_BATTERY_ADC_PIN` | off | The pin the divider's middle point is connected to. On the ESP32-S3, it must be an ADC1 pin (GPIO1-10). ADC2 pins cannot be read while WiFi is on. |
| `PROBOT_BATTERY_R_TOP_K` | none | The divider's resistor on the battery side (kΩ). Required with `PROBOT_BATTERY_ADC_PIN`. `100` for a 3S LiPo. |
| `PROBOT_BATTERY_R_BOT_K` | none | The divider's resistor on the GND side (kΩ). Required with `PROBOT_BATTERY_ADC_PIN`. `22` for a 3S LiPo. |
| `PROBOT_BATTERY_INA` | off | The I2C voltage sensor: `219` or `226`. |
| `PROBOT_BATTERY_INA_ADDR` | `0x40` | The sensor's I2C address, `0x08`-`0x77`. |
| `PROBOT_BATTERY_INA_SDA`, `PROBOT_BATTERY_INA_SCL` | the board's default I2C pins | The sensor's I2C pins. You write both together. |
| `PROBOT_BATTERY_INA_SHUNT_MOHM` | `100` | The shunt resistor on the sensor module (mΩ). It affects only the current calculation. |
| `PROBOT_BATTERY_TRIM` | `1.0f` | A fine-tuning factor you set with a multimeter, 0.5-2.0. |

The library measures in a separate task every 250 ms and passes the value to the Driver Station in 0.1 V steps. If it cannot reach the sensor, the line below appears in the **Telemetry** panel, and the indicator goes back to "Veri yok" (No data):

```text
!! [PB-E306] BATTERY SENSOR UNREACHABLE — INA I2C yanit vermiyor — docs/hatalar#pb-e306
```

## Compile messages {#derleme-mesajlari}

If a macro is missing or wrong, Arduino IDE stops compiling. Each message starts with an error code and ends with the address of the error page, for example `Docs: probotstudio.com/docs/hatalar/#pb-e101`. The tables below leave out this address part. Fixes: [Compile errors](sorunlar.md#derleme-hatalari).

The WiFi messages are in English:

| Message | Cause |
|---|---|
| "[PB-E101] Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h." | The password macro is missing, or it comes after the `#include` line. |
| "[PB-E101] PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." | The password is shorter than 8 characters. |
| "[PB-E102] WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h." | The channel macro is missing, or it comes after the `#include` line. |
| "[PB-E102] PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only)." | The channel is outside 1-13. |
| "[PB-E102] PROBOT_WIFI_AP_CHANNEL must be 0-13 (used as the fallback when the auto-select scan finds nothing)." | The channel is outside 0-13 while `PROBOT_WIFI_AUTO_CHANNEL 1` is set. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be at least 1 character." | The network name is empty. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be 32 characters or fewer." | The network name is longer than 32 characters. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." | The network name is longer than 25 characters while the MAC suffix is on. |

If you do not write `PROBOT_WIFI_AP_SSID` at all, compiling does not stop. This warning appears: "PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX). Define a custom SSID for better identification."

The battery messages are in Turkish, written without Turkish characters:

| Message | Cause |
|---|---|
| "[PB-E104] Gerilim bolucu direncleri eksik: PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K (kilo-ohm) tanimlanmali." | `PROBOT_BATTERY_ADC_PIN` is there, but one of the resistors is missing. |
| "[PB-E104] Bolucu direncleri pozitif olmali (kilo-ohm)." | A resistor value is 0 or negative. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN ADC1 pini olmali (ESP32-S3: GPIO1-10). ADC2 (GPIO11-20) WiFi acikken calismaz." | The pin is outside GPIO1-10. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_RSL_PIN ile cakisiyor." | The measuring pin is the same as the signal light pin. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN, NEOPIXEL_PIN ile cakisiyor." | The measuring pin is the same as the status LED pin. |
| "[PB-E105] Tek batarya kaynagi secin: PROBOT_BATTERY_ADC_PIN (bolucu) VEYA PROBOT_BATTERY_INA (I2C sensor), ikisi birden degil." | Both methods are written. |
| "[PB-E105] PROBOT_BATTERY_INA 219 ya da 226 olmali (desteklenen sensorler: INA219, INA226)." | The sensor number is wrong. |
| "[PB-E105] I2C pinleri yarim tanimli: PROBOT_BATTERY_INA_SDA ve PROBOT_BATTERY_INA_SCL birlikte verilmeli (ya ikisi ya hicbiri)." | Only one of SDA and SCL is written. |
| "[PB-E105] SDA ve SCL ayni pin olamaz." | SDA and SCL are the same pin. |
| "[PB-E105] INA I2C pini PROBOT_RSL_PIN ile cakisiyor." | One of the I2C pins is the same as the signal light pin. |
| "[PB-E105] PROBOT_BATTERY_INA_SHUNT_MOHM pozitif olmali (mili-ohm)." | The shunt value is 0 or negative. |
| "[PB-E105] PROBOT_BATTERY_INA_ADDR gecerli 7-bit I2C adresi olmali (0x08-0x77)." | The I2C address is out of range. |

Three battery messages are long and do not fit in the table. The first two appear when the measuring pin or one of the I2C pins is the same as `PROBOT_ESTOP_ENABLE_PIN`. The third appears when `PROBOT_BATTERY_TRIM` is outside 0.5-2.0:

```text
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti ADC'ye devredilemez.
[PB-E105] INA I2C pini PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti I2C'ye devredilemez.
[PB-E105] PROBOT_BATTERY_TRIM makul araligin disinda (0.5-2.0) — trim ince ayar icindir, oran duzeltmesi icin bolucu direnclerini duzeltin.
```

The time limit message has no address:

| Message | Cause |
|---|---|
| "PROBOT_HOOK_DEADLINE_MS must be >= PROBOT_LOOP_DEADLINE_MS" | `PROBOT_HOOK_DEADLINE_MS` is smaller than `PROBOT_LOOP_DEADLINE_MS`. |
