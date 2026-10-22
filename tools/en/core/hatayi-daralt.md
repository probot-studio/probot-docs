# Narrow down the problem step by step

When the robot does not behave the way you expect, follow these steps to narrow the cause down to one part.

A robot is made of many layers: code, library, motor driver, motor, wiring, power. You cannot test them all at once.
At each step, you rule out one possibility; the one that is left is the answer.

## Before you start

- If there is an error message on the screen, in the Telemetry panel or in the Serial Monitor, first look up that text on
  the [Errors and troubleshooting](sorunlar.md) page. If there is a code such as `[PB-E301]`, find it in the
  [Error codes](sorunlar.md#hata-kodlari) table.
- You can connect to the robot's network and open the Driver Station. See [First 10 minutes](ilk-10-dakika.md).
- You have a copy of the last working version of your code.

## Find what changed {#ne-degisti}

The robot worked yesterday, and today it does not. The first question is: what changed? If the code did not change,
looking at the code wastes time; the cause is in a wire, a connector, the battery or a motor.

1. On a piece of paper, write down everything that changed since the robot last worked: code, wiring, battery, parts, library version.
2. If the code changed, upload the last working copy to the board.
3. If the code did not change, unplug the connectors one by one, plug them back in and look for loose wires.
4. Swap the battery for a charged battery. If battery measurement is set up, check the **Battery** indicator on the **Dashboard**.

Result: If the problem goes away with the last working copy or with a charged battery, that change is the cause. If the problem
is still there, go to the next section.

If you updated the library from 0.3.0 to 0.4.0, your code does not compile; move the old code: [Move 0.3.0 code](hooklari-yaz.md#gecis).

## Print the values on the screen {#degerleri-yazdir}

Read the data instead of guessing. `probot::printf` sends the line you write to the **Telemetry** panel on the
Driver Station. Check the color of the status LED: [Check the status indicators first](sorunlar.md#durum-gostergeleri).

The example prints the value of the left stick:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // at least 8 characters
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float ileri = js.getLeftY();
  probot::clearTelemetry();                 // clear the panel on every pass
  probot::printf("ileri=%.2f\n", ileri);   // shows in the Telemetry panel
}

void teleopStop() {}
```

1. Add a line to `teleopLoop()` that prints the value you suspect with `probot::printf`, as in the example.
2. Upload the code to the board.
3. In **Match Control** on the Driver Station, select **Teleoperated**.
4. Press **Init**, then **Start**.
5. On the gamepad, push the left stick forward and let go.

Result: The `ileri=` line appears in the **Telemetry** panel. While the stick is forward, the value is positive. When you let go, it becomes `ileri=0.00`.
If the value is what you expect, the problem is not in the gamepad but in the code that uses the value.

Gamepad values reach the code only after **Start**. At **Init**, the value always reads `0.00`; this is not a fault.

If you connect the board to the computer with USB, you can also read the library's `[DS   ]`, `[SYS  ]` and
`[BATT ]` lines in the Serial Monitor (115200 baud). The **Logs** tab shows the state of the connection: **RSSI**, **Joystick Age**,
**Deadline Miss**. The **Event Log** on the same tab lists the buttons you pressed and the rejected commands in order.

## Split the system into layers {#katmanlara-bol}

The motor used to turn, and now it does not. Is it the wiring, the driver or the motor? Test each possibility on its own.

!!! warning "Warning"
    Before you connect the motor directly to a power supply, put the robot on a stand so the wheels do not touch the ground. The motor
    turns at full speed.

1. Disconnect the motor from the driver and connect it directly to a power supply.
2. If the motor turns, connect it back to the driver. If the motor does not turn, the problem is in the motor or in the power line.
3. Swap the driver's cable for another cable that you know works.
4. Try the driver with a test code that does not use the library (below).

Result: If the motor turns at one layer and does not turn at the next, the problem is between those two layers.

On a BTS7960 module, the R_EN and L_EN pins must be connected to 5V (or to the board's 3.3 V); if they are not, the motor does not turn at all.

The test code without the library does not include `probot.h`; in this code, `setup()` and `loop()` are yours. For a
BTS7960-style driver:

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

If the motor turns with this code, the driver, the wiring and the motor are fine; the problem is in the Probot code. If it does not turn, the problem is
not in the library but in the hardware. Driving code that works with the library: [Drive the motor](motoru-sur.md).

## Change one thing at a time {#tek-degisiklik}

If you change the wire, the code and the battery at the same time, you cannot know which one fixed the problem, even if it goes away.

1. Make one change: one wire, one line of code or one part.
2. Upload the code or turn the robot on again.
3. Repeat the same test.
4. Write the result on the paper, then go to the next change.

Result: The change that makes the problem go away or come back is a single line on your paper.

## Cut the loop down to its simplest form {#en-sade-kod}

If the LED blinks red or the robot gets stuck, narrow the cause down to the lines in the code. About a stuck
loop: [The LED blinks red: the loop stalled](sorunlar.md#pb-e301).

1. Turn every line inside `teleopLoop()` into a comment (`//`).
2. Upload the code. In **Match Control**, select **Teleoperated**, press **Init**, then **Start**.
3. If the problem appears only in autonomous, select **Autonomous** and do the same for `autonomousLoop()`.
4. If the robot gets stuck when you press **Init**, do the same for `teleopInit()` and `autonomousInit()`. The time limit for init, start
   and stop functions is 10 seconds; for loop functions it is 2 seconds.
5. If the problem went away, turn the comment lines back on one at a time. Upload and test each time.

Result: The problem comes back with the last line you turned back on. The problem is in that line.

In the example, the suspicious sensor reading is turned off:

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
  probot::clearTelemetry();
  probot::printf("sensor=%u\n", sonuc);   // 0: the sensor answered
}

void sensorHazirla() {
  Wire.begin();
  Wire.setTimeOut(50);   // so a sensor that does not answer cannot lock up the loop
}

void autonomousInit() { sensorHazirla(); }
void autonomousLoop() {}
void autonomousStop() {}

void teleopInit() { sensorHazirla(); }

void teleopLoop() {
  // sensorOku();   // suspicious line: off, to be turned back on one by one later
}

void teleopStop() {}
```

## Make sure you found the root cause {#koku-dogrula}

When you think you found the cause, check that the problem does not come from somewhere else. A clear root cause keeps the same
problem from happening again.

1. Fix the part you found and test it.
2. Put the part back the way it was and repeat the same test.
3. Fix the part again.

Result: If the problem appears only while that part is back in its old state, that part is the root cause.

## Having trouble?

- **An error message shows on the screen:** Look up the message on the [Errors and troubleshooting](sorunlar.md) page.
- **You cannot find the cause:** Report the problem with the shortest code: [Report an error](sorunlar.md#hata-bildir).

## Next step

[Code the example robot from start to finish](ornek-robotu-kodla.md)
