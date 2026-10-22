# Code the example robot from start to finish

On this page, you start with one motor. You add the chassis, a conveyor, an arm with a limit switch and a servo gripper. You write the code for a competition robot one part at a time.

The goal is to reach a robot that works from zero by the shortest and most reliable route. Advanced control methods such as encoders or PID are not covered on this page. All the code compiles with Probot Core. The pin numbers are chosen for the ESP32-S3 board. Change them for your board. For a plain ESP32 board: [Select the board and the partition scheme](arduino-ide-kur.md#kart-ve-bolumleme).

## Before you start

- Arduino IDE is installed and Probot Core is installed: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You can connect to the robot's network and open the Driver Station: [First 10 minutes](ilk-10-dakika.md).
- The motors are connected to BTS7960-style drivers with two PWM inputs (RPWM and LPWM).

## Plan the systems {#sistemleri-planlamak}

Before you write code, think about how each system of the robot will work. There are three levels:

- **Always-on systems:** They run as soon as you give power. You do not turn them on or off. A fan, a conveyor at a fixed speed, a light. A direct power connection is often enough. Not every mechanical system needs software.
- **Systems you turn on and off:** The robot decides when to start and stop them. The decision comes from the driver (a button), from time (go forward for 2 seconds), or from a sensor (stop when the limit switch is touched). Settling this at the start decides how you write the code.
- **Systems that need precise control:** If speed or position must be held precisely, you need an encoder and PID. Move to this level only when simpler methods are not enough. Early complexity wastes time and makes debugging harder.

The examples on this page cover the first two levels.

## Test the hardware alone first {#temel-sistemi-once-dogrula}

Before you write code, make sure the mechanics and electronics work. If you write the motor code and the motor does not turn, finding out whether the cable, the driver, the motor or the code is at fault takes a long time.

Connect the driver and the motor directly to a power supply, and check that the motor turns. If it turns, the electronics work, and the problem is in the code or the connections. If it does not turn, fix the hardware before you go to the code. Do the same for every servo, sensor and other part. Test each one alone before you assemble it.

## Build one subsystem at a time {#subsystem-subsystem-kodla}

If you write all of the robot's code at once and test it, it will not work. Finding the broken part is hard. Gall's Law puts it this way: a complex system that works evolves from a simple system that works.

Write the code for each subsystem separately and test it alone. The order is usually this:

- **Driving:** The robot can move.
- **Gamepad:** The robot drives with the gamepad.
- **Mechanisms:** Arm, scoop, conveyor. Add each one in turn.
- **Autonomous:** Write it after TeleOp works fully.

At each step, keep the robot ready for the field. Do not hold up driving because a second mechanism does not work. If you use an AI assistant, follow the same order: [Write code with an AI assistant](yapay-zekayla-kod-yaz.md).

<a id="ornek-surusten-tam-robota"></a>
## Spin one motor {#tek-motor}

The first goal is the simplest one: does one motor turn, and is its direction right? If you move on to the chassis without knowing this, debugging gets harder.

The motor is not connected directly to an ESP32 pin, because a pin cannot supply the current needed to turn the motor. A motor driver sits between them. On the BTS7960, a signal on the `RPWM` pin turns the motor forward, and a signal on the `LPWM` pin turns it backward. Never send a signal to both pins at the same time. `analogWrite` writes a value from 0 (stop) to 255 (full power) to a pin. The stick value comes in between -1 and +1, so it is multiplied by 255. Details: [Drive the motor](motoru-sur.md).

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Change the pins for your board
#define RPWM 5   // signal to this pin: motor forward
#define LPWM 6   // signal to this pin: motor backward

void stopMotor() {
  analogWrite(RPWM, 0);
  analogWrite(LPWM, 0);
}

void robotInit() {
  pinMode(RPWM, OUTPUT);
  pinMode(LPWM, OUTPUT);
  stopMotor();
}

void robotEnd() {
  stopMotor();   // The motor stops at Stop
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float speed = js.getLeftY();   // -1..+1, forward is positive

  // Never signal both pins at once: one of them is always 0
  if (speed > 0) { analogWrite(RPWM, (int)(speed * 255));  analogWrite(LPWM, 0); }
  else           { analogWrite(RPWM, 0); analogWrite(LPWM, (int)(-speed * 255)); }
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Paste the code into a new sketch in Arduino IDE. Change `RPWM` and `LPWM` to your pins.
2. Upload the code to the board.
3. In the Driver Station, turn off the **Autonomous** switch. Then **Start** starts TeleOp directly.
4. Press **Init**, then **Start**.
5. Push the left stick forward, then pull it back.

Result: The motor turns one way when the stick is pushed forward, and the other way when it is pulled back. It stops when you let go of the stick.

If the motor turns the wrong way, swap the two motor wires, or swap the `RPWM` and `LPWM` numbers in the code. If the motor does not respond at all, first check the stick movement on the **Joystick** tab of the Driver Station: [Read the gamepad data](kumandayi-oku.md).

If the robot has more than one motor, test each one with this code before you move on to the chassis.

### Move the motor into the motor_t class {#motor_t}

Putting one motor in a class keeps its pin numbers and direction in one place. The code is the same as on the [Drive the motor](motoru-sur.md#motor-sinifi) page. Every later subsystem uses the motor through `motor_t`. Class names end with `_t`.

```cpp
// ---- Motor: dual-PWM driver, BTS7960 style ----
// -1 (backward) .. +1 (forward)
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
```

## Drive the tank chassis {#tank-sasi}

Two `motor_t` objects side by side. This drive is called **arcade**: the left stick drives forward and backward, and the horizontal axis of the right stick drives the turn. The left wheel gets `forward + turn`, and the right wheel gets `forward - turn`. If the turn is positive, the robot turns right. If it is negative, the robot turns left. When the sticks are released, both values go to zero and the robot stops.

The total can go above 1. For example, when you drive full forward and turn right sharply, the left wheel needs a value above 1. `setMotor` limits the value to 255, so you do not need another limit.

Putting the chassis in a class lets the autonomous code and other systems call `arcade()` without seeing pin numbers or formulas. For a motor mounted in reverse, write `true` as the third value on its `motor_t` line.

```cpp
// ---- Chassis: two-motor tank, arcade drive ----
class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: forward/backward, turn: turn (positive = right)
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

motor_t      left_motor(5, 6);
motor_t      right_motor(7, 8);   // if the right motor is reversed: right_motor(7, 8, true)
drive_base_t drive_base(left_motor, right_motor);
```

The functions no longer see pin numbers or formulas:

```cpp
void robotInit()  { drive_base.init(); }
void robotEnd()   { drive_base.stop(); }
void teleopInit() { drive_base.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Delete the `RPWM`, `LPWM` and `stopMotor` lines from the single-motor code.
2. Below the `#include <probot.h>` line, add the `setMotor` function, the `motor_t` and `drive_base_t` classes, and the motor definitions.
3. Replace the six functions with the ones above.
4. Upload the code. With the **Autonomous** switch off, press **Init**, then **Start**.
5. Push the left stick forward, then tilt the right stick to the right.

Result: The robot drives forward with the left stick. When you tilt the right stick to the right, the robot turns right. If one side drives the wrong way, add `true` as the third value on that side's `motor_t` line.

Choosing a chassis and other ways to drive: [Drive the chassis](sasiyi-sur.md).

## Drive the mecanum chassis {#mecanum-sasi}

A mecanum chassis has four motors, and its wheels have angled rollers. The robot can slide sideways as well as drive forward and backward, and it can turn in place. The three axes are driven separately: the left stick drives forward/backward and sideways slide, and the right stick drives the turn.

The speed of each motor is calculated with a different formula, based on the wheel's position. If one of the four values goes above 1, all four are scaled down by the same ratio. This keeps the direction of motion. For a motor mounted in reverse, write `true` as the third value on its `motor_t` line.

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

// ---- Mecanum chassis: four motors ----
class mecanum_t {
public:
  mecanum_t(motor_t& fl, motor_t& fr, motor_t& bl, motor_t& br)
    : _fl(fl), _fr(fr), _bl(bl), _br(br) {}

  void init() { _fl.init(); _fr.init(); _bl.init(); _br.init(); }
  void stop() { _fl.stop(); _fr.stop(); _bl.stop(); _br.stop(); }

  // fwd: forward/backward, strafe: sideways slide (positive = right), rotate: turn (positive = right)
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // If the largest value goes above 1, scale all four by the same ratio: the direction stays the same
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
motor_t   fl_motor(5, 6);     // front left
motor_t   fr_motor(7, 8);     // front right
motor_t   bl_motor(15, 16);   // back left
motor_t   br_motor(17, 18);   // back right
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void robotInit()  { mecanum.init(); }
void robotEnd()   { mecanum.stop(); }
void teleopInit() { mecanum.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  // Left stick: forward/backward and sideways slide. Right stick: turn.
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Paste the code into a new sketch and change the pins of the four motors.
2. Upload the code. With the **Autonomous** switch off, press **Init**, then **Start**.
3. Lift the robot off the ground and push the left stick forward. All four wheels must turn forward. For a motor that turns the wrong way, add `true` as the third value on its `motor_t` line.
4. Put the robot back on the ground and tilt the left stick to the right.

Result: The robot drives forward when the left stick is pushed forward. It slides right when the left stick tilts right. The right stick turns it in place.

If the robot turns or moves diagonally instead of sliding, check the way the wheels are mounted and the `true` values on the motor lines.

Four motors use eight PWM pins, which fills all eight LEDC channels of the ESP32-S3. A servo cannot be added to this chassis.

## Add a conveyor {#konveyor}

When driving works, add the first mechanism. The conveyor is the simplest example: one pin, on or off. It runs while **RB** is held and stops when you let go.

This example assumes the conveyor runs on a relay or a one-way driver at full speed. There is no speed control, only on and off with `digitalWrite`. If the conveyor is also connected to a BTS7960 and needs speed control, use a `motor_t` instead of `conveyor_t`.

```cpp
// ---- Conveyor: one pin, on/off (relay or one-way driver) ----
class conveyor_t {
public:
  conveyor_t(int pin) : _pin(pin) {}
  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }
private:
  int _pin;
};

conveyor_t conveyor(9);
```

1. Put the `conveyor_t` class below `drive_base_t`, and the `conveyor(9)` line below the motor definitions.
2. Add `conveyor.init();` inside `robotInit()`.
3. Add `conveyor.stop();` inside `robotEnd()` and `teleopInit()`.
4. Add `if (js.getRB()) conveyor.run(); else conveyor.stop();` inside `teleopLoop()`.
5. Upload the code, press **Init** and **Start**, and hold **RB**.

Result: The conveyor runs while **RB** is held and stops when you let go. Pressing **Stop** stops it too.

If the stop line is not in `robotEnd()`, the conveyor keeps running after **Stop**. If it is not in `teleopInit()`, a conveyor you started in autonomous keeps running in TeleOp.

## Control the arm with a limit switch {#kol-limit-switchli-mekanizma}

Limit switches are placed at both ends of a mechanism that moves in two directions. The motor stops before the mechanism hits its end. Without switches, the motor forces the mechanism and damages it.

One end of the switch connects to an ESP32 pin, and the other end connects to GND. An `INPUT_PULLUP` pin normally reads `HIGH`. When the switch is pressed, the pin connects to GND and reads `LOW`. So pressed means `LOW`, which means do not move in that direction. No separate resistor is needed. The code reads the relevant switch before every movement command.

```cpp
// ---- Arm: limit switch at each end ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move in that direction
  void up(float speed = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    _drive(speed);
  }

  void down(float speed = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    _drive(-speed);
  }

  void stop() { _drive(0.0f); }

private:
  void _drive(float speed) {
    speed = constrain(speed, -1.0f, 1.0f);
    if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
    else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
  }

  int _rpwm, _lpwm, _limit_top, _limit_bottom;
};

arm_t arm(10, 11, 12, 13);   // RPWM, LPWM, top switch, bottom switch
```

1. Add the `arm_t` class and the `arm(...)` line to the code.
2. Add `arm.init();` inside `robotInit()`. Add `arm.stop();` inside `robotEnd()` and `teleopInit()`.
3. Add this inside `teleopLoop()`: `if (js.getLB()) arm.up(); else if (js.getA()) arm.down(); else arm.stop();`
4. Upload the code, press **Init** and **Start**, and hold **LB**.

Result: The arm goes up while **LB** is held and stops at the top switch. It goes down while **A** is held and stops at the bottom switch.

This is the simplest arm system. An arm that needs different torque depending on its load and position may need feedforward and PID. This page does not cover them. For mechanisms that run by time or by encoder: [Add a mechanism](mekanizma-ekle.md).

<a id="gripper-asamal-servo-kontrolu"></a>
## Drive the gripper in stages {#gripper-asamali-servo-kontrolu}

Some mechanisms have a few fixed positions: a gripper closed, half open, fully open. Moving them with a stick is less precise than moving between preset angles.

The angles are kept in an array, and a cursor (`_cursor`) tracks which one is current. **D-pad** up moves the cursor forward, **D-pad** down moves it back, and the servo goes to the new angle. So that a held button does not trigger on every pass, only the moment of the press counts. The value from the previous pass (`_prev_up`) is kept for this. How the servo signal is made: [Drive the servo](servoyu-sur.md).

```cpp
// ---- Gripper: servo, stepping between fixed angles ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, high channel
    _cursor = 0;
    _apply();
  }

  // D-pad up: next stage, down: previous stage. Counted once, at the moment of the press.
  void update(bool dpad_up, bool dpad_down) {
    if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
    if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
    _prev_up   = dpad_up;
    _prev_down = dpad_down;
  }

  void release() { ledcWrite(_pin, 0); }   // cut the pulse

private:
  void _apply() {
    float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);   // 0-180° -> 500-2500 µs
    ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
  }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);   // pin 4, LEDC channel 7, 3 stages
```

!!! warning "Warning"
    Do not power the servo from the 5V or 3V3 pin of the ESP32 board. Use a separate 5-6 V source (BEC), and connect the GND pins together.

1. Add the `gripper_t` class and the `gripper(...)` line to the code.
2. Add `gripper.init();` inside `robotInit()`. Add `gripper.release();` inside `robotEnd()`.
3. Add `gripper.update(js.getDpadUp(), js.getDpadDown());` inside `teleopLoop()`.
4. Upload the code, press **Init** and **Start**, and press **D-pad** up three times.

Result: Each press of **Init** moves the gripper to 0 degrees. Each press of **D-pad** up moves it to the next stage, 45 degrees and then 130 degrees. Each press of **D-pad** down moves it back one stage.

The same cursor and list idea is not limited to the gripper. An arm or lift whose position is read by an encoder can keep a list of target positions.

## Full code {#tam-kod}

All the parts together. The autonomous part is explained under the next heading.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// ---- Motor: dual-PWM driver, BTS7960 style ----
// -1 (backward) .. +1 (forward)
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

// ---- Chassis: two-motor tank, arcade drive ----
class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: forward/backward, turn: turn (positive = right)
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

// ---- Conveyor: one pin, on/off (relay or one-way driver) ----
class conveyor_t {
public:
  conveyor_t(int pin) : _pin(pin) {}
  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }
private:
  int _pin;
};

// ---- Arm: limit switch at each end ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move in that direction
  void up(float speed = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    _drive(speed);
  }

  void down(float speed = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    _drive(-speed);
  }

  void stop() { _drive(0.0f); }

private:
  void _drive(float speed) {
    speed = constrain(speed, -1.0f, 1.0f);
    if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
    else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
  }

  int _rpwm, _lpwm, _limit_top, _limit_bottom;
};

// ---- Gripper: servo, stepping between fixed angles ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, high channel
    _cursor = 0;
    _apply();
  }

  // D-pad up: next stage, down: previous stage. Counted once, at the moment of the press.
  void update(bool dpad_up, bool dpad_down) {
    if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
    if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
    _prev_up   = dpad_up;
    _prev_down = dpad_down;
  }

  void release() { ledcWrite(_pin, 0); }   // cut the pulse

private:
  void _apply() {
    float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);   // 0-180° -> 500-2500 µs
    ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
  }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

// ---- Robot parts (change the pins for your board) ----
motor_t      left_motor(5, 6);
motor_t      right_motor(7, 8);   // if the right motor is reversed: right_motor(7, 8, true)
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(9);
arm_t        arm(10, 11, 12, 13);

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);

void stopAll() {
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void robotInit() {
  drive_base.init();
  conveyor.init();
  arm.init();
  gripper.init();
}

void robotEnd() {
  stopAll();
  gripper.release();
}

void teleopInit() {
  stopAll();   // clear the commands left over from autonomous
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();

  gripper.update(js.getDpadUp(), js.getDpadDown());
}

// ---- Autonomous: drive forward, collect, stop ----
enum class Stage { FORWARD, COLLECT, DONE };
Stage    stage      = Stage::FORWARD;
uint32_t stageStart = 0;

void autonomousInit() {
  stage = Stage::FORWARD;
  stageStart = millis();   // the moment of Start
}

void autonomousLoop() {
  uint32_t elapsed = millis() - stageStart;   // time spent in this stage (ms)

  switch (stage) {
    case Stage::FORWARD:
      drive_base.arcade(0.7f, 0.0f);
      if (elapsed >= 2000) { stage = Stage::COLLECT; stageStart = millis(); }
      break;
    case Stage::COLLECT:
      drive_base.stop();
      conveyor.run();
      if (elapsed >= 1500) { stage = Stage::DONE; stageStart = millis(); }
      break;
    case Stage::DONE:
      stopAll();
      break;
  }
}
```

1. Paste the code into a new sketch and change the pin numbers for your board.
2. Upload the code to the board.
3. With the **Autonomous** switch off, press **Init**, then **Start**.
4. Try each control in the table one at a time.

Result: The robot responds to the gamepad as in the table below. Pressing **Stop** stops all motors and frees the gripper servo.

| Gamepad input | What it does |
|---|---|
| **left stick** forward/backward | The robot drives forward/backward |
| **right stick** right/left | The robot turns right/left |
| **RB** held | The conveyor runs |
| **LB** held | The arm goes up and stops at the top switch |
| **A** held | The arm goes down and stops at the bottom switch |
| **D-pad** up / down | The gripper moves to the next / previous angle |

<a id="faz-faz-ilerleyen-otonom"></a>
## Add autonomous {#otonom}

In autonomous there is no gamepad. The robot follows code that you wrote in advance. The classes you wrote for TeleOp are used here too. The commands come from the code, not from the gamepad. The autonomous in the full code has three stages: drive forward, stop and run the conveyor, then stop.

Timing is done with `millis()`. Waiting with `delay()` causes the gamepad inputs to reset once a pass takes longer than 2 seconds, and the status LED blinks red. `autonomousInit()` runs at every Start, so reset the stage and the time there. At every stage change, `stageStart` is renewed. `elapsed` measures the time spent in that stage.

1. Put the robot in an empty area.
2. In the Driver Station, turn on the **Autonomous** switch.
3. Press **Init**, then **Start**.

Result: The robot drives forward for 2 seconds and stops. The conveyor runs for 1.5 seconds and stops. When the autonomous time is up, TeleOp starts, and the robot is driven with the gamepad.

Driving by distance and angle, going to field points, and the limits of autonomous: [Write the autonomous](otonom-yaz.md).

## Next step

[Narrow down the problem step by step](hatayi-daralt.md)
