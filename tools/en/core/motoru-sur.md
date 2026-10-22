# Drive the motor

On this page, you drive one motor with a BTS7960-style motor driver, using the left stick of the gamepad. Then you move the motor code into a class that you can reuse.

## Before you start

- The motor is connected to the board through a motor driver. A board pin alone cannot turn the motor.
- You know the pin numbers of the driver's two PWM inputs (RPWM and LPWM) on the board. This page uses 16 and 17.
- On the BTS7960 module, the R_EN and L_EN pins are connected to 5V (or to the board's 3.3 V). If they are not connected, the motor never turns.
- You know how to read the gamepad. See [Read the gamepad data](kumandayi-oku.md).

Test the driver and the motor alone before you connect them to the code. If the motor does not turn, the problem is in the cable or the driver, not in the code.

The library has no ready-made motor class. The motor is driven with `analogWrite`. Probot Blocks also generates the same `setMotor` code.

## Drive one motor with the gamepad {#tek-motor}

On a BTS7960-style driver, RPWM turns the motor forward, and LPWM turns it backward. `analogWrite` writes a value between 0 and 255 to a pin. 0 stops the motor, and 255 is full power.

1. Write the pin numbers on the `MOTOR_RPWM` and `MOTOR_LPWM` lines.
2. Add the `setMotor` function to the program.
3. Inside `robotInit()`, set the pins as outputs and stop the motor.
4. Inside `robotEnd()`, stop the motor.
5. Inside `teleopLoop()`, pass the value of the left stick to `setMotor`.
6. Upload the code. In the Driver Station, press **Init**, then **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins for your board
#define MOTOR_RPWM  16
#define MOTOR_LPWM  17

// Set to true if the motor turns the wrong way
#define MOTOR_INVERTED false

// Drives a dual-PWM BTS7960-style driver: -1 (backward) .. +1 (forward)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

void stopMotors() {
  setMotor(MOTOR_RPWM, MOTOR_LPWM, 0.0f, false);
}

void robotInit() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  stopMotors();
}

void robotEnd() {
  stopMotors();   // at Stop, the motor goes to a safe position
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // When the connection drops, the library resets the axes and the motor stops
  setMotor(MOTOR_RPWM, MOTOR_LPWM, js.getLeftY(), MOTOR_INVERTED);
}
```

Result: When you push the left stick forward, the motor turns one way. When you pull it back, the motor turns the other way. When you let go of the stick or press **Stop**, the motor stops.

`setMotor` takes a power between -1 and +1. It multiplies the value by 255 and limits the result to at most 255. For powers between -0.02 and +0.02, it writes 0 to both pins.

If the robot has more than one motor, test each one with this code before you move on to the chassis.

## Fix the motor direction {#yon}

If the motor turns backward when you push the stick forward, you do not need to change the cables.

1. In the code, go to the line `#define MOTOR_INVERTED false`.
2. Replace `false` with `true`.
3. Upload the code again.

Result: When you push the left stick forward, the motor turns the other way.

## Use a different driver {#baska-surucu}

Drivers such as the L298N or TB6612 have a PWM pin and a direction (DIR) pin. For these drivers, change the `analogWrite` lines in `setMotor` to match your driver. Write the speed to the PWM pin with `analogWrite`, and write the direction to the DIR pin with `digitalWrite`.

## Move the motor into a class {#motor-sinifi}

Putting the motor code in a class keeps the pin numbers in one place. The chassis and mechanism code use the motor through this class. Class names end with `_t`.

```cpp
class motor_t {
public:
  motor_t(uint8_t rpwm, uint8_t lpwm, bool inverted = false)
    : _rpwm(rpwm), _lpwm(lpwm), _inverted(inverted) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void set(float power) { setMotor(_rpwm, _lpwm, power, _inverted); }
  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm;
  bool    _inverted;
};

motor_t motor(16, 17);   // if it turns the wrong way: motor(16, 17, true)
```

Write the class below the `setMotor` function. Use it in the functions like this:

```cpp
void robotInit() { motor.init(); }
void robotEnd()  { motor.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motor.set(js.getLeftY());
}
```

## Having trouble?

- **The motor does not turn at all:** Test the driver and the motor without the code. Check the pin numbers. Check the gamepad values with the code on the [Read the gamepad data](kumandayi-oku.md#kumandayi-oku) page.
- **The motor keeps turning after Stop:** `stopMotors()` is not in `robotEnd()`. See [Stop the motors at Stop](hooklari-yaz.md#robotend).
- **The motor turns slowly when the stick is released:** Make the dead zone bigger. See [Set the dead zone](kumandayi-oku.md#olu-bolge).

## Next step

[Drive the chassis](sasiyi-sur.md)
