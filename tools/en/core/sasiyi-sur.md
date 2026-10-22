# Drive the chassis

On this page, you drive a two-motor chassis with tank and arcade control, and a four-motor mecanum chassis on three axes. You also make the driving smoother.

## Before you start

- You tried each motor on its own and fixed its direction. See [Drive the motor](motoru-sur.md).
- On a two-motor chassis, this page uses pins 16 and 17 for the left motor and pins 18 and 21 for the right motor. Change the pins to match your board.

The chassis is the motors that move the robot together. You can drive the same chassis with different gamepad layouts. In Probot Blocks, the **tank drive** and **arcade drive** blocks generate the same code: [Write a drive program](../blocks/probot-surus-programi-yaz.md).

## Drive with tank control {#tank}

In tank control, each stick drives one side: the left stick drives the left motor, the right stick drives the right motor.

1. Write the four pin numbers at the top of the program.
2. If the right motor is mounted reversed, leave `RIGHT_INVERTED` as `true`; if not, make it `false`.
3. In `teleopLoop()`, give the Y values of the two sticks to the two motors.
4. Upload the code. While **Teleoperated** is selected, press **Init**, then **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Change the pins to match your board
#define LEFT_RPWM   16
#define LEFT_LPWM   17
#define RIGHT_RPWM  18
#define RIGHT_LPWM  21

// If a motor turns the wrong way, make it true
#define LEFT_INVERTED  false
#define RIGHT_INVERTED true

// Drives a BTS7960-style dual-PWM driver: -1 (back) .. +1 (forward)
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

// Runs at Init: sets up the pins, the motors stop
void setupHardware() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}
void autonomousStop() { stopMotors(); }   // At Stop, the motors go to a safe state

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Each stick drives one side
  setMotor(LEFT_RPWM,  LEFT_LPWM,  js.getLeftY(),  LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, js.getRightY(), RIGHT_INVERTED);
}

void teleopStop() { stopMotors(); }      // At Stop, the motors go to a safe state
```

Result: When you push both sticks forward together, the robot goes forward. When you push only the left stick, the robot turns right. When you let go of the sticks, the robot stops.

## Drive with arcade control {#arcade}

In arcade control, one stick drives forward and back, and the other stick drives the turn. Most drivers find it more familiar than tank.

1. Open the program from the [Drive with tank control](#tank) section.
2. Replace the `teleopLoop()` in the program with the one below.
3. Upload the code. While **Teleoperated** is selected, press **Init**, then **Start**.

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float fwd  = js.getLeftY();    // left stick: forward / back
  float turn = js.getRightX();   // right stick: turn, right is positive

  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}
```

Result: When you push the left stick, the robot goes forward. When you tilt the right stick to the right, the robot turns right.

The sum can go over 1. For example, if you turn right while going full forward, the left motor gets a value greater than 1. `setMotor` limits this value to 255, so the motor turns at full power at most.

## Move the chassis into a class {#drive-base-t}

When the chassis is in a class, the autonomous and the other code do not see pins or formulas; they only call `arcade()`. The program below uses the `motor_t` class from the [Move the motor into a class](motoru-sur.md#motor-sinifi) section.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Drives a BTS7960-style dual-PWM driver: -1 (back) .. +1 (forward)
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

  // fwd: forward is positive, turn: right is positive
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

void autonomousInit() { drive_base.init(); }
void autonomousLoop() {}
void autonomousStop() { drive_base.stop(); }   // At Stop, the chassis stops

void teleopInit() { drive_base.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}

void teleopStop() { drive_base.stop(); }       // At Stop, the chassis stops
```

Result: The robot drives the same way as in the arcade example. No pin numbers are left in the functions.

## Drive a mecanum chassis {#mecanum}

A chassis with mecanum wheels has four motors. The robot goes forward and back, turns in place and slides sideways. The left stick drives forward and back and the sideways slide; the right stick drives the turn.

1. Write the pins of the four motors in the `motor_t` lines.
2. In the line of a motor that turns the wrong way, add `true` as the third value.
3. Upload the code. While **Teleoperated** is selected, press **Init**, then **Start**.
4. Try the robot first going only forward, then only sideways, then only turning.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Drives a BTS7960-style dual-PWM driver: -1 (back) .. +1 (forward)
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

  // fwd: forward is positive, strafe: sliding right is positive, rotate: turning right is positive
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // If the largest value goes over 1, shrink all by the same ratio; the direction is kept
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

// Change the pins to match your board
motor_t   fl_motor(10, 11);   // front left
motor_t   fr_motor(12, 13);   // front right
motor_t   bl_motor(14, 15);   // back left
motor_t   br_motor(16, 17);   // back right
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void autonomousInit() { mecanum.init(); }
void autonomousLoop() {}
void autonomousStop() { mecanum.stop(); }   // At Stop, all four motors stop

void teleopInit() { mecanum.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}

void teleopStop() { mecanum.stop(); }       // At Stop, all four motors stop
```

!!! warning "Warning"
    These pins are for the ESP32-S3. On a plain ESP32, GPIO6-11 are connected to the flash memory; do not use them. Four motors use eight PWM pins and fill the eight LEDC channels of the ESP32-S3; you cannot add a servo to this chassis.

Result: When you push the left stick forward, the robot goes forward; when you tilt it to the right, the robot slides right. When you tilt the right stick to the right, the robot turns right in place. If a movement goes the wrong way, add `true` to the line of the motor that turns the wrong way in that movement.

The sum for the four motors can go over 1. In that case, the code divides all four values by the largest one. This way, the ratio between the motors and the direction of the movement are kept.

## Make the driving smoother {#yumusat}

If you give the stick value straight to the motor, the robot drives, but the driving is rough. The two methods below make precise moves easier.

**Take the cube of the value.** Small stick movements give the motor less power, and the power grows fast toward the end. When the stick is halfway, the output is 0.125. The **precise power** block in Probot Blocks generates the same function.

```cpp
// The cube of the stick value: precise at low speed, full power at high speed (the sign is kept)
float hassasGuc(float x) { return x * x * x; }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(hassasGuc(js.getLeftY()), hassasGuc(js.getRightX()));
}
```

Write the `hassasGuc` function outside `teleopLoop()`, above it.

For a lighter effect, use `x * fabsf(x)`. The sign is still kept.

**Limit the change.** When you push the stick full forward at once, the motor gets full power at once. The wheels spin or the robot jerks. The code below lets the output change by at most 0.05 in one loop pass.

```cpp
// Move toward the target by at most max_step
float slew(float target, float current, float max_step) {
  float diff = constrain(target - current, -max_step, max_step);
  return current + diff;
}

float drive_out = 0.0f;

void teleopStart() { drive_out = 0.0f; }  // start from zero at every Start

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_out = slew(js.getLeftY(), drive_out, 0.05f);   // at most 0.05 per loop pass
  drive_base.arcade(drive_out, js.getRightX());
}
```

`teleopStart()` runs once when you press **Start**. If the program does not have it yet, add this line; if it does, write the `drive_out = 0.0f;` line inside it.

The smaller `max_step` is, the smoother the driving, but the robot reacts later. Pick the value by trying it on the robot.

## Which chassis to pick {#hangisi}

For most competition tasks, a tank chassis is enough and causes the fewest problems. The only difference between tank and arcade is the gamepad layout; the hardware is the same. If you really need to slide sideways, think about mecanum. Mecanum is more complex mechanically, and its wheels slip more.

## Having trouble?

- **The robot turns instead of going forward:** One motor turns the wrong way. Change that motor's inverted value. See [Fix the motor's direction](motoru-sur.md#yon).
- **The robot goes to the wrong side when it turns:** In the arcade formula, change the sign of `turn`, or swap the left and right motors.
- **The robot creeps when you let go of the stick:** Make the dead zone bigger. See [Set the dead zone](kumandayi-oku.md#olu-bolge).

## Next step

[Drive the servo](servoyu-sur.md)
