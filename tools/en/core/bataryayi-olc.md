# Measure the battery voltage

On this page, you use two resistors to measure the battery voltage. Then you print the value to the **Telemetry** panel on the Driver Station, and save it in the robot state.

Probot Core does not measure the battery by itself. Your code does the measurement. The library stores the value, and it gives the value to the battery block in Blocks and to the robot's `/getBattery` address. If you do not save the value, it shows 0 everywhere.

## Before you start

- The robot code is uploaded with Arduino IDE: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You have one 100 kΩ resistor and one 22 kΩ resistor. These values are for a 3S LiPo (12.6 V when full).
- A multimeter for fine tuning.

<a id="1-gerilim-bolucu-adc"></a>
## Connect the voltage divider {#gerilim-bolucu}

An ESP32 pin cannot measure a voltage higher than 3.3 V. Two resistors reduce the battery voltage by a fixed ratio: pin voltage = battery voltage × 22 / (100 + 22). A 12.6 V battery gives 2.27 V at the pin.

```text
BAT+ ──[100k]──┬──[22k]── GND
               │
             GPIO1
```

The measuring pin must be an ADC1 pin. On the ESP32-S3, the ADC1 pins are GPIO1-10. On the ESP32, they are GPIO32-39. ADC2 pins cannot be read while WiFi is on, and the Probot WiFi is always on.

!!! warning "Warning"
    Connect the divider after the main switch. If you connect it before the switch, it draws current from the battery even when the robot is off (about 0.1 mA at 12.6 V).

1. Connect one end of the 100 kΩ resistor to the positive battery wire, after the main switch.
2. Connect the other end of the 100 kΩ resistor to the 22 kΩ resistor. Connect the other end of the 22 kΩ resistor to GND.
3. Connect the point where the two resistors meet to GPIO1.
4. Connect the negative end of the battery and the ESP32's GND together.

Result: When the robot is on, the multimeter shows about 0.18 times the battery voltage between GPIO1 and GND (2.27 V at 12.6 V).

For another battery, choose the resistors so that the pin does not go above 3.3 V at the battery's highest voltage.

<a id="3-elle-besleme"></a>
## Add the measurement to the code {#olcumu-koda-ekle}

`analogReadMilliVolts()` is a function of the ESP32 Arduino core. It returns the pin voltage in millivolts. The code multiplies it by the divider ratio to find the battery voltage. `probot::robot::state().setBatteryVoltage()` saves the value in the robot state.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Divider midpoint (ADC1 pin: GPIO1-10 on ESP32-S3)
#define BATTERY_PIN 1

const float R_TOP_K = 100.0f;   // resistor on the battery side (kΩ)
const float R_BOT_K = 22.0f;    // resistor on the GND side (kΩ)
const float TRIM    = 1.0f;     // trim factor, set with the multimeter

// Reads the pin voltage and converts it to the battery voltage (volts)
float readBatteryVolts() {
  float pinVolts = analogReadMilliVolts(BATTERY_PIN) / 1000.0f;
  return pinVolts * (R_TOP_K + R_BOT_K) / R_BOT_K * TRIM;
}

// Writes the reading to telemetry and saves it in the robot state
void reportBattery() {
  float v = readBatteryVolts();
  probot::robot::state().setBatteryVoltage(millis(), v);
  probot::clearTelemetry();
  probot::printf("Batarya: %.2f V\n", v);
}

void robotInit() {}
void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  reportBattery();
  // your drive code goes here
}

void autonomousInit() {}

void autonomousLoop() {
  reportBattery();
  // your autonomous code goes here
}
```

1. Paste the code, and change `BATTERY_PIN` to the pin you connected the divider to.
2. If you used other resistors, write their values in kΩ in `R_TOP_K` and `R_BOT_K`.
3. Upload the code to the board.
4. In the Driver Station, press **Init**, then **Start**.

Result: In the **Telemetry** panel on the **Dashboard**, the line that starts with `Batarya:` shows the battery voltage in volts.

The value updates only while `teleopLoop()` or `autonomousLoop()` runs. While the robot waits for Init, or after Stop, the last saved value stays.

## Fine-tune with a multimeter {#ince-ayar}

Resistor tolerances can shift the reading by a few percent. The `TRIM` factor corrects this.

1. With the robot on, measure the voltage at the battery terminals with the multimeter.
2. Note the value in the **Telemetry** panel.
3. Change the `TRIM` value in the code to multimeter / telemetry. For example, if the multimeter shows 12.50 V and the telemetry shows 12.30 V, write `12.50 / 12.30 = 1.016`.
4. Upload the code again, then press **Init**, then **Start**.

Result: The value in the **Telemetry** panel equals the multimeter value, or is very close to it.

## Where to read the value {#gostergeyi-okumak}

| Place | How |
|---|---|
| Driver Station, **Telemetry** panel | The `probot::printf` line in your code |
| Your own code | `probot::robot::state().read().batteryVoltage` |
| Probot Blocks | The **robot:** **battery voltage (V)** block reads the same value |
| A device connected to the robot's network | `http://192.168.4.1/getBattery` gives the voltage with one decimal |

If `setBatteryVoltage` is never called, the value is 0 in all three places. The Driver Station has no separate battery indicator. Print the value with telemetry.

## Having trouble?

- **Telemetry shows 0.00 V:** The midpoint of the divider is not connected to the pin in `BATTERY_PIN`, or the pin is not an ADC1 pin.
- **The value is far from the real voltage:** The `R_TOP_K` and `R_BOT_K` values in the code do not match the resistors you installed. For small differences, do the [fine tuning](#ince-ayar).
- **The battery block in Blocks shows 0:** There is no `setBatteryVoltage` call in the code. Add the `reportBattery()` function from this page.

## Next step

[Use the status LED](led-durumu.md)
