# Narrow down the problem step by step

When your robot does not behave as you expect, follow this order to narrow the cause down to a single part.

A robot has many layers: code, library, motor driver, motor, cable and power. You cannot test all of them at once. At each step, you rule out one possibility. The one left is the answer.

## Before you start

- If the screen, the Telemetry panel or the Serial Monitor shows an error message, first search for that message on the [Errors and troubleshooting](sorunlar.md) page.
- You can connect to the robot's network and open the Driver Station. See [First 10 minutes](ilk-10-dakika.md).
- You have a copy of the last code version that worked.

## Find what changed {#ne-degisti}

The robot worked yesterday, and today it does not. The first question is: what changed? If the code did not change, looking at the code wastes time. The cause is a cable, a connector, the battery or a motor.

1. Write down everything that changed since it last worked: code, cable, battery and parts.
2. If the code changed, upload the last working copy to the board.
3. If the code did not change, unplug the connectors one at a time, plug them back in, and look for a loose cable.
4. Replace the battery with a charged battery.

Result: If the error goes away with the last working copy or with a charged battery, that change is the cause. If the error stays, go to the next section.

## Print the values on screen {#degerleri-yazdir}

Read the data instead of guessing. `probot::printf` sends the line you write to the **Telemetry** panel on the Driver Station. First, check the status LED color: [Status indicators](sorunlar.md#durum-gostergeleri).

This example prints the value of the left stick:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void robotInit() {}
void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float ileri = js.getLeftY();
  probot::printf("ileri=%.2f\n", ileri);   // Shows in the Telemetry panel
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Add the line that prints the value you suspect with `probot::printf` to `teleopLoop()`, as in the example.
2. Upload the code to the board.
3. In the Driver Station, turn off the **Autonomous** switch. Then **Start** starts TeleOp directly.
4. Press **Init**, then **Start**.
5. On the gamepad, push the left stick forward, and let it go.

Result: Lines that start with `ileri=` scroll in the **Telemetry** panel. When the stick is forward, the value is positive. When you let go, it shows `ileri=0.00`. If the value is what you expect, the problem is not the gamepad. It is in the code that uses the value.

If you connect the board to a computer over USB, you can also read the library's `[DS   ]` and `[SYS  ]` lines in the Serial Monitor (115200 baud). The **Logs** tab shows the connection status: **RSSI**, **Joystick Age** and **Deadline Miss**.

## Split the system into layers {#katmanlara-bol}

The motor used to turn, and now it does not. Is it the cable, the driver or the motor? Test each possibility on its own.

!!! warning "Warning"
    Before you connect the motor directly to the power supply, put the robot on blocks so the wheels do not touch the ground. The motor runs at full speed.

1. Disconnect the motor from the driver, and connect it directly to the power supply.
2. If the motor turns, connect it back to the driver. If the motor does not turn, the problem is in the motor or the power line.
3. Replace the driver's cable with another cable that you know works.
4. Test the driver with test code that does not use the library (below).

Result: If the motor turns in one layer but not in the next one, the problem is between those two layers.

On the BTS7960 module, the R_EN and L_EN pins must be connected to 5 V (or to the board's 3.3 V). If they are not connected, the motor does not turn at all.

The test code without the library does not include `probot.h`. In this code, you write `setup()` and `loop()` yourself. For a BTS7960-style driver:

```cpp
// Motor test without the library: no probot.h.
// Change the pins to match your board
#define MOTOR_RPWM 5   // forward
#define MOTOR_LPWM 6   // backward

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
}

void loop() {
  Serial.println("ileri");
  analogWrite(MOTOR_RPWM, 100);   // forward at low speed
  analogWrite(MOTOR_LPWM, 0);
  delay(2000);

  Serial.println("dur");
  analogWrite(MOTOR_RPWM, 0);
  analogWrite(MOTOR_LPWM, 0);
  delay(2000);
}
```

If the motor turns with this code, the driver, the cable and the motor are good. The problem is in your Probot code. If the motor does not turn, the problem is in the hardware, not the library. For the driving code that uses the library, see [Drive the motor](motoru-sur.md).

## Change one thing at a time {#tek-degisiklik}

If you change the cable, the code and the battery at the same time, you cannot tell which one fixed the problem.

1. Make one change: one cable, one line of code, or one part.
2. Upload the code, or turn the robot on again.
3. Repeat the same test.
4. Write the result down, then move to the next change.

Result: The change that made the error go away, or brought it back, is one line on your paper.

## Reduce the loop to its simplest form {#en-sade-kod}

If the LED blinks red or the robot stalls, narrow the cause down to lines of code. For more about loop stalls, see [LED blinks red: loop stalled](sorunlar.md#pb-e301).

1. Turn each line in `teleopLoop()` into a comment (`//`).
2. Upload the code. With the **Autonomous** switch off, press **Init**, then **Start**.
3. If the error appears only in autonomous, turn on the **Autonomous** switch, and do the same for `autonomousLoop()`. If the robot freezes at **Init** or **Start** and the LED does not turn red, check the lines in `robotInit()` and `teleopInit()`.
4. If the error goes away, turn the comment lines back on one at a time. Upload and test after each one.

Result: The error returns with the last line you turned on. That line is the problem.

In the example, the suspect sensor reading is turned off:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>
#include <Wire.h>

#define SENSOR_ADRES 0x29   // your sensor's I2C address

void sensorOku() {
  Wire.beginTransmission(SENSOR_ADRES);
  uint8_t sonuc = Wire.endTransmission();
  probot::printf("sensor=%u\n", sonuc);   // 0: the sensor answered
}

void robotInit() {
  Wire.begin();
}

void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  // sensorOku();   // suspect line: off for now, turn on one at a time
}

void autonomousInit() {}
void autonomousLoop() {}
```

## Make sure you found the root cause {#koku-dogrula}

When you think you found the cause, check that the problem does not come from somewhere else. A clear root cause prevents the same error from coming back.

1. Fix the part you found, and test it.
2. Put the part back to its old state, and repeat the same test.
3. Fix the part again.

Result: If the error appears only when the part is in its old state, that part is the root cause.

## Having trouble?

- **An error message shows on the screen:** Search for the message on the [Errors and troubleshooting](sorunlar.md) page.
- **No cause is found:** Report the error with the shortest code: [Report a bug](sorunlar.md#hata-bildir).

## Next step

[Code the example robot from start to finish](ornek-robotu-kodla.md)
