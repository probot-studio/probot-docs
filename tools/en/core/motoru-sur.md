# Drive the motor

On this page, you drive one motor on a BTS7960-style motor driver with the gamepad's left stick. Then you move the motor code into a class you can use again.

## Before you start

- The motor is connected to the board through a motor driver. A board pin cannot turn a motor on its own.
- You know the board pin numbers of the driver's two PWM inputs (RPWM and LPWM). This page uses 16 and 17.
- On the BTS7960 module, the R_EN and L_EN pins are connected to 5V (or to the board's 3.3 V). If they are not connected, the motor does not turn at all.
- You know how to read the gamepad. See [Read the gamepad data](kumandayi-oku.md).

Before you connect the motor to the code, test the driver and the motor on their own. If the motor does not turn in this test, the problem is in the cable or the driver, not in the code.

The library has no ready-made motor class. You drive the motor with `analogWrite`. Probot Blocks generates the same `setMotor` code.

## Drive one motor with the gamepad {#tek-motor}

On a BTS7960-style driver, RPWM turns the motor forward and LPWM turns it backward. `analogWrite` writes a value from 0 to 255 to the pin: 0 stops, 255 is full power.

1. Write the pin numbers in the `MOTOR_RPWM` and `MOTOR_LPWM` lines.
2. Add the `setMotor` function to the program.
3. In `setupHardware()`, make the pins outputs and stop the motor. Call this function from `autonomousInit()` and `teleopInit()`.
4. In `autonomousStop()` and `teleopStop()`, call `stopMotors()`.
5. In `teleopLoop()`, give the left stick's value to `setMotor`.
6. Upload the code. On the Driver Station, while **Teleoperated** is selected, press **Init**, then **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins to match your board
#define MOTOR_RPWM  16
#define MOTOR_LPWM  17

// Set to true if the motor turns the wrong way
#define MOTOR_INVERTED false

// Drives a BTS7960-style driver with two PWM inputs: -1 (back) .. +1 (forward)
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

// Runs at Init: gets the pins ready, the motor stops
void setupHardware() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  stopMotors();
}

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}                    // autonomous is empty on this page
void autonomousStop() { stopMotors(); }     // at Stop, the motor goes to a safe state

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // When the connection drops, the library resets the axes and the motor stops
  setMotor(MOTOR_RPWM, MOTOR_LPWM, js.getLeftY(), MOTOR_INVERTED);
}

void teleopStop() { stopMotors(); }         // at Stop, the motor goes to a safe state
```

Result: After **Init**, the motor is stopped and does not respond to the stick. After **Start**, when you push the left stick forward, the motor turns one way. When you pull it back, the motor turns the other way. When you let go of the stick or press **Stop**, the motor stops.

`setMotor` takes the power from -1 to +1. It multiplies the value by 255 and limits it to at most 255. For a power between -0.02 and +0.02, it writes 0 to both pins.

Between Init and Start, the library keeps the gamepad values at zero. That is why you write the motor command in the loop function, not in the init function. The init functions run again at every **Init**. When `setupHardware()` runs again, it stops the motor again.

If the robot has more than one motor, test each motor one by one with this code before you move on to the chassis.

## Fix the motor's direction {#yon}

If the motor turns backward when you push the stick forward, you do not need to swap the cables.

1. In the code, go to the line `#define MOTOR_INVERTED false`.
2. Write `true` instead of `false`.
3. Upload the code again.

Result: When you push the left stick forward, the motor turns the other way.

## Use another driver {#baska-surucu}

Drivers like the L298N or the TB6612 have one PWM pin and one direction (DIR) pin. For these drivers, change the `analogWrite` lines in `setMotor` to match your driver. Write the speed to the PWM pin with `analogWrite`, and the direction to the DIR pin with `digitalWrite`.

## Move the motor into a class {#motor-sinifi}

Putting the motor code into a class keeps the pin numbers in one place. The chassis and mechanism code use the motor through this class. Class names end with `_t`.

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
void autonomousInit() { motor.init(); }
void autonomousLoop() {}
void autonomousStop() { motor.stop(); }

void teleopInit() { motor.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motor.set(js.getLeftY());
}

void teleopStop() { motor.stop(); }
```

## Having trouble?

- **The motor does not turn at all:** Test the driver and the motor without the code. Check the pin numbers. To see the gamepad values, use the code in [Read the gamepad and write it on the screen](kumandayi-oku.md#kumandayi-oku).
- **After Init, the motor does not respond to the stick:** The gamepad values are zero until **Start**. Press **Start**.
- **The motor keeps turning after Stop:** `teleopStop()` or `autonomousStop()` does not call `stopMotors()`. See [Stop the motors on Stop](hooklari-yaz.md#robotend).
- **Compiling shows an error on the `robotInit` or `robotEnd` line:** The code was written for an older version. Move the code in `robotInit()` into the two init functions, and the code in `robotEnd()` into the two stop functions. Then delete these two functions.
- **The motor turns slowly when you let go of the stick:** Make the dead zone bigger. See [Set the dead zone](kumandayi-oku.md#olu-bolge).

## Next step

[Drive the chassis](sasiyi-sur.md)
