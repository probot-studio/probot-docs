# Drive the chassis

On this page you drive a two-motor chassis with tank and arcade control. You drive a four-motor mecanum chassis with three axes. You also smooth out the driving.

## Before you start

- You tested each motor on its own and fixed its direction. See [Drive the motor](motoru-sur.md).
- On a two-motor chassis, this page uses pins 16 and 17 for the left motor, and pins 18 and 21 for the right motor. Change the pins to match your board.

A chassis is the set of motors that move the robot together. The same chassis can be driven with different gamepad layouts. In Probot Blocks, the **tank drive** and **arcade drive** blocks generate the same code: [Write a drive program](../blocks/probot-surus-programi-yaz.md).

## Drive with tank control {#tank}

In tank control, each stick drives one side. The left stick drives the left motor, and the right stick drives the right motor.

1. Write the four pin numbers at the top of the program.
2. If the right motor is mounted reversed, keep `RIGHT_INVERTED` as `true`. Otherwise, set it to `false`.
3. In `teleopLoop()`, give the Y value of each stick to its motor.
4. Upload the code, press **Init**, then press **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins for your board
#define LEFT_RPWM   16
#define LEFT_LPWM   17
#define RIGHT_RPWM  18
#define RIGHT_LPWM  21

// Set to true if the motor direction is reversed
#define LEFT_INVERTED  false
#define RIGHT_INVERTED true

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
  setMotor(LEFT_RPWM, LEFT_LPWM, 0.0f, false);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, 0.0f, false);
}

void robotInit() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void robotEnd() {
  stopMotors();   // at Stop, the motors go to a safe position
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Each stick drives one side
  setMotor(LEFT_RPWM,  LEFT_LPWM,  js.getLeftY(),  LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, js.getRightY(), RIGHT_INVERTED);
}
```

Result: When you push both sticks forward together, the robot drives forward. When you push only the left stick, the robot turns right. When you let go of the sticks, the robot stops.

## Drive with arcade control {#arcade}

In arcade control, one stick drives forward and back, and the other stick turns. Most drivers find it more familiar than tank control.

1. Open the program from [Drive with tank control](#tank).
2. Replace `teleopLoop()` in the program with the code below.
3. Upload the code, press **Init**, then press **Start**.

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float fwd  = js.getLeftY();    // left stick: forward / backward
  float turn = js.getRightX();   // right stick: turn, positive to the right

  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}
```

Result: When you push the left stick forward, the robot drives forward. When you tilt the right stick right, the robot turns right.

The total can be more than 1. For example, at full forward, a right turn gives the left motor a value above 1. `setMotor` limits the duty to 255, so the motor runs at most at full power.

## Move the chassis into a class {#drive-base-t}

When the chassis is in a class, the autonomous and other code do not see pins or formulas. They only call `arcade()`. The program below uses the `motor_t` class from [Drive the motor](motoru-sur.md#motor-sinifi).

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Drives a dual-PWM BTS7960-style driver: -1 (backward) .. +1 (forward)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

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

class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: forward positive, turn: right positive
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

motor_t      left_motor(16, 17);
motor_t      right_motor(18, 21, true);   // right motor mounted reversed
drive_base_t drive_base(left_motor, right_motor);

void robotInit() { drive_base.init(); }
void robotEnd()  { drive_base.stop(); }   // The chassis stops at Stop

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}
```

Result: The robot is driven the same way as in the arcade example. No pin numbers remain in the functions.

## Drive a mecanum chassis {#mecanum}

A mecanum chassis has four motors. The robot drives forward and back, turns in place and slides sideways. The left stick drives forward, backward and sideways. The right stick turns the robot.

1. Write the pins of the four motors in the `motor_t` lines.
2. Add `true` as the third value to the line of each motor that turns in reverse.
3. Upload the code, press **Init**, then press **Start**.
4. Test the robot moving only forward first, then only sideways, then only turning.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Drives a dual-PWM BTS7960-style driver: -1 (backward) .. +1 (forward)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

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

class mecanum_t {
public:
  mecanum_t(motor_t& fl, motor_t& fr, motor_t& bl, motor_t& br)
    : _fl(fl), _fr(fr), _bl(bl), _br(br) {}

  void init() { _fl.init(); _fr.init(); _bl.init(); _br.init(); }
  void stop() { _fl.stop(); _fr.stop(); _bl.stop(); _br.stop(); }

  // fwd: forward positive, strafe: slide right positive, rotate: turn right positive
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // If the largest value is above 1, scale all four by the same ratio so the direction stays
    float mx = fmaxf(fmaxf(fabsf(fl), fabsf(fr)), fmaxf(fabsf(bl), fabsf(br)));
    if (mx > 1.0f) { fl /= mx; fr /= mx; bl /= mx; br /= mx; }

    _fl.set(fl); _fr.set(fr);
    _bl.set(bl); _br.set(br);
  }

private:
  motor_t& _fl;
  motor_t& _fr;
  motor_t& _bl;
  motor_t& _br;
};

// Change the pins for your board
motor_t   fl_motor(10, 11);   // front left
motor_t   fr_motor(12, 13);   // front right
motor_t   bl_motor(14, 15);   // back left
motor_t   br_motor(16, 17);   // back right
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void robotInit() { mecanum.init(); }
void robotEnd()  { mecanum.stop(); }   // All four motors stop at Stop

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}
```

!!! warning "Warning"
    These pins are for the ESP32-S3. On a plain ESP32, GPIO6-11 are connected to the flash memory, so do not use them. Four motors use eight PWM pins and fill all eight LEDC channels of the ESP32-S3. No servo can be added to this chassis.

Result: When you push the left stick forward, the robot drives forward. When you tilt the left stick right, the robot slides right. When you tilt the right stick right, the robot turns in place to the right. If a movement goes the wrong way, add `true` to the line of the motor that turns the wrong way.

Each motor's total can be more than 1. In that case, the code divides all four values by the largest one. This keeps the ratio between the motors, and so the direction of the movement.

## Smooth the driving {#yumusat}

Passing the stick value straight to the motor works, but the driving is harsh. The two methods below make fine maneuvers easier.

**Cube the value.** Small stick movements give the motor less power. The power rises fast toward the end of the stick. At half stick, the output is 0.125. The **precise power** block in Probot Blocks generates the same function.

```cpp
// Cube of the stick value: fine control at low speed, full power at the top (sign kept)
float hassasGuc(float x) { return x * x * x; }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(hassasGuc(js.getLeftY()), hassasGuc(js.getRightX()));
}
```

Write the `hassasGuc` function above `teleopLoop()`, outside of it.

For a milder effect, use `x * fabsf(x)`. The sign is still kept.

**Limit the change.** When the stick is pushed to full forward at once, the motor gets full power at once. The wheels spin, or the robot jolts. The code below lets the output change by at most 0.05 in each loop pass.

```cpp
// Moves toward the target by at most max_step
float slew(float target, float current, float max_step) {
  float diff = constrain(target - current, -max_step, max_step);
  return current + diff;
}

float drive_out = 0.0f;

void teleopInit() { drive_out = 0.0f; }   // reset at the start of every TeleOp

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_out = slew(js.getLeftY(), drive_out, 0.05f);   // at most 0.05 per loop pass
  drive_base.arcade(drive_out, js.getRightX());
}
```

The smaller `max_step` is, the smoother the driving. The robot then responds more slowly. Choose the value by testing on the robot.

## Which chassis to choose {#hangisi}

For most competition tasks, a tank chassis is enough and causes the fewest problems. Tank and arcade differ only in the control layout. The hardware is the same. If you really need sideways movement, consider mecanum. A mecanum chassis is more complex mechanically, and its wheels are more prone to slipping.

## Having trouble?

- **The robot turns instead of going forward:** One motor turns the wrong way. Change the reversed value for that motor. See [Fix the motor direction](motoru-sur.md#yon).
- **The robot turns the wrong way:** Change the sign of `turn` in the arcade formula, or swap the left and right motors.
- **The robot creeps after you let go of the sticks:** Make the dead zone bigger. See [Set the dead zone](kumandayi-oku.md#olu-bolge).

## Next step

[Drive the servo](servoyu-sur.md)
