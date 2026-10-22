# Measure the battery voltage

On this page, you measure the battery's voltage with two resistors and see the value on the Driver Station's **Battery** indicator.

Probot Core measures the battery by itself. You write the divider's pin and the resistors with macros. The library reads the voltage every 250 ms, smooths it and saves it to the robot state. You do not need to write measuring code in a loop function. If no measuring source is defined, the indicator says "Veri yok · batarya ölçümü kapalı" (No data · battery measurement off), and the value is 0 everywhere.

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

You pick one of three sources: a voltage divider (the main path on this page), an [INA219 or INA226 sensor](#ina-sensoru), or [your own measurement](#kendi-olcumun).

## Before you start

- You upload the robot code from Arduino IDE: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You have one 100 kΩ resistor, one 22 kΩ resistor and one 100 nF capacitor. These resistor values are for a 3S LiPo (12.6 V when full).
- Your board is an ESP32-S3. The library accepts only GPIO1-10 as the divider pin; the divider method does not work on a plain ESP32. There, use the [INA sensor](#ina-sensoru) or [your own measurement](#kendi-olcumun).
- A multimeter for fine-tuning.

<a id="1-gerilim-bolucu-adc"></a>
## Connect the voltage divider {#gerilim-bolucu}

An ESP32 pin cannot measure more than 3.3 V. Two resistors make the battery's voltage smaller by a fixed ratio: voltage at the pin = battery × 22 / (100 + 22). A 12.6 V battery gives 2.27 V at the pin.

```text
BAT+ ──[100k]──┬──[22k]── GND
               │
             GPIO1 ── 100nF ── GND
```

You pick the measuring pin from GPIO1-10; these are the ESP32-S3's ADC1 pins. ADC2 pins (GPIO11-20) cannot be read while WiFi is on, and Probot's WiFi is always on. If you write another pin, the program does not compile.

!!! warning "Warning"
    Connect the divider after the main switch. If you connect it before the switch, it draws current from the battery even while the robot is off (about 0.1 mA at 12.6 V).

1. Connect one end of the 100 kΩ resistor to the battery's plus line, after the main switch.
2. Connect the other end of the 100 kΩ resistor to the 22 kΩ resistor. Connect the other end of the 22 kΩ resistor to GND.
3. Connect the point where the two resistors meet to GPIO1.
4. From the same point, connect the 100 nF capacitor to GND.
5. Connect the battery's minus end to the ESP32's GND, so they share a common ground.

Result: While the robot is on, the multimeter shows about 0.18 times the battery voltage between GPIO1 and GND (2.27 V at 12.6 V).

For another battery, pick resistors so that the pin does not go over 3.3 V at the battery's highest voltage.

## Add the measurement to the code {#olcumu-koda-ekle}

Three macros turn on the measurement: the pin, the resistor on the battery side and the resistor on the GND side. You write the resistors in kΩ. The macros come before the `#include <probot.h>` line.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

// Battery measurement: the middle point of the voltage divider and the resistors
#define PROBOT_BATTERY_ADC_PIN  1     // ADC1 pin: GPIO1-10
#define PROBOT_BATTERY_R_TOP_K  100   // resistor on the battery side (kΩ)
#define PROBOT_BATTERY_R_BOT_K  22    // resistor on the GND side (kΩ)

#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}

void teleopLoop() {
  // Write the value the library measured to telemetry
  probot::clearTelemetry();
  probot::printf("Batarya: %.1f V\n", probot::robot::state().read().batteryVoltage);
}

void teleopStop() {}
```

1. Paste the code and change `PROBOT_BATTERY_ADC_PIN` to the pin you connected the divider to.
2. If you used other resistors, write the `PROBOT_BATTERY_R_TOP_K` and `PROBOT_BATTERY_R_BOT_K` values in kΩ.
3. Upload the code to the board and open the Driver Station.
4. While **Teleoperated** is selected, press **Init**, then **Start**.

Result: The **Battery** indicator on the **Dashboard** shows the voltage in volts, for example `12.4V`. The **Telemetry** panel shows a line such as `Batarya: 12.4 V`.

The indicator does not wait for **Init** and **Start**: the measurement runs from the moment the robot turns on. The telemetry line updates only while `teleopLoop()` runs.

The value changes in steps of 0.1 V. The library takes the average of 8 samples at each reading and smooths the result; the accuracy is about 1-2%.

## Fine-tune with a multimeter {#ince-ayar}

Resistor tolerances can shift the measurement by a few percent. The `PROBOT_BATTERY_TRIM` factor fixes this. Its default is 1.0, and it must be between 0.5 and 2.0.

1. While the robot is on, measure the voltage at the battery's ends with a multimeter.
2. Write down the `Batarya:` value in the **Telemetry** panel.
3. Next to the macros, add a line such as `#define PROBOT_BATTERY_TRIM 1.016f`. The value is multimeter / telemetry. For example, if the multimeter shows 12.50 V and telemetry shows 12.30 V, write `12.50 / 12.30 = 1.016`.
4. Upload the code again, then press **Init** and **Start**.

Result: The value in the **Telemetry** panel is equal to the multimeter's value, or at most 0.1 V away from it.

If the difference is bigger than a few percent, do not make the factor bigger. Check that the `R_TOP_K` and `R_BOT_K` values match the resistors you fitted.

## Use an INA219 or INA226 sensor {#ina-sensoru}

The INA219 and the INA226 are ready-made modules that give the voltage over I2C. You do not need to solder a divider. The sensor measures the current too.

1. Connect the sensor module's VCC and GND to the board, and its SDA and SCL to the board's I2C pins.
2. Connect the battery's plus line to the module's VIN+ pin, and the robot's power line to the VIN- pin.
3. Instead of the macros, write `#define PROBOT_BATTERY_INA 226` (`219` for the INA219).
4. Write your module's shunt resistor in mΩ, such as `#define PROBOT_BATTERY_INA_SHUNT_MOHM 2`.
5. Upload the code and open the Driver Station.

Result: The **Battery** indicator shows the voltage. `probot::io::battery::currentAmps()` gives the current drawn from the battery in amperes.

If you use pins other than the board's default I2C pins, write the `PROBOT_BATTERY_INA_SDA` and `PROBOT_BATTERY_INA_SCL` macros together. If the sensor's address is not 0x40, write it with `PROBOT_BATTERY_INA_ADDR`. The shunt value affects only the current calculation; its default is 100 mΩ.

The library reads the sensor from its own task. Do not connect a second I2C device (an IMU, a display) to the same `Wire` bus from the robot code. If you have your own I2C device, use the divider, or move your device to `Wire1` on separate pins.

You cannot define the divider and the INA at the same time; the program does not compile.

<a id="3-elle-besleme"></a>
## Use your own measurement {#kendi-olcumun}

If you measure the voltage in another way, you give the value to the library with `probot::setBatteryVoltage()`. The indicator and the other places read this value. With this method, you do not write `PROBOT_BATTERY_ADC_PIN` or `PROBOT_BATTERY_INA`. If one of them is defined, the automatic measurement writes over your value.

```cpp
void teleopLoop() {
  float v = readMyBattery();       // your own measuring function (volts)
  probot::setBatteryVoltage(v);    // write to the indicator and the robot state
}
```

If the value rounds to the same 0.1 V as the value before, it is not saved. So calling it on every pass does not make extra traffic. The value updates only while the function that makes the call is running.

## Where you see the value {#gostergeyi-okumak}

| Place | How |
|---|---|
| Driver Station, **Dashboard** > **Battery** | The average of about the last 8 seconds, a percentage and a status text |
| Driver Station, **Logs** > **History** > **Battery** chart | The measurements of the last 2 minutes, without averaging; the voltage drop under motor load shows here |
| Your own code | `probot::robot::state().read().batteryVoltage` |
| Probot Blocks | The **robot: battery voltage (V)** block reads the same value |
| A device connected to the robot's network | `http://192.168.4.1/getBattery` gives the voltage with one decimal place |

The percentage on the indicator is for a 3S LiPo: 10.5 V is 0% and 12.6 V is 100%. Above 11.6 V, the status text is "Nominal". Above 11.0 V, it is "Azalıyor" (Getting low). At a lower voltage, the indicator turns red; change the battery.

## Having trouble?

- **The indicator says "Veri yok":** The measuring macros are written after the `#include <probot.h>` line, or they are missing. Move the macros above the include line.
- **The compile error says "[PB-E104]":** The pin is outside GPIO1-10, or one of the resistors is not written. See [PB-E104](sorunlar.md#pb-e104).
- **The compile error says "[PB-E105]":** The divider and the INA are both defined, or one of the INA settings is not valid. See [PB-E105](sorunlar.md#pb-e105).
- **A "[PB-E306]" line appears in telemetry, and the indicator goes back to "Veri yok":** The INA sensor does not answer on I2C. Check the wiring and the address. See [PB-E306](sorunlar.md#pb-e306).
- **The indicator shows close to 0 V:** The divider's middle point is not connected to the pin in `PROBOT_BATTERY_ADC_PIN`.
- **The value is very different from the real voltage:** The `R_TOP_K` and `R_BOT_K` values in the code do not match the resistors you fitted. For small differences, [fine-tune with a multimeter](#ince-ayar).

## Next step

[Use the status LED](led-durumu.md)
