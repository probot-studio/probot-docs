# Code the example robot from start to finish

On this page, you start from a single motor. You then add a chassis, a conveyor, an arm with limit switches and a servo gripper. Piece by piece, you write the code of a competition robot.

The goal is to reach a working robot from zero by the shortest and most reliable path. Advanced control methods such as an encoder or PID are not on this page. All the code compiles with Probot Core. The pin numbers are picked for the ESP32-S3 board; change them to match your own board. For a plain ESP32: [Select the board and the partition scheme](arduino-ide-kur.md#kart-ve-bolumleme).

## Before you start

- Arduino IDE is installed, and Probot Core is installed: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
- You can connect to the robot's network and open the Driver Station: [First 10 minutes](ilk-10-dakika.md).
- The motors are connected to BTS7960-style drivers with two PWM inputs (RPWM and LPWM).

## Plan the systems {#sistemleri-planlamak}

Before you write code, think about how each system of the robot will work. There are three levels:

- **Always-on systems:** They run when they get power, and you do not need to turn them on and off. A fan, a fixed-speed conveyor, a light. A direct power connection is often enough; not every mechanical system needs software.
- **Systems that turn on and off:** The robot decides when to start and stop them. The decision comes from the driver (a button), from time (drive forward for 2 seconds) or from a sensor (stop when it touches the limit switch). Making this clear at the start decides how you write the code.
- **Systems that need precise control:** If you must hold a speed or a position precisely, you need an encoder and PID. Move to this level only when simpler methods are not enough. Early complexity wastes time and makes debugging harder.

The examples on this page cover the first two levels.

## Test the hardware on its own first {#temel-sistemi-once-dogrula}

Before you write code, make sure the mechanics and the electronics work. If you write the motor code and the motor does not turn, it takes long to find the problem. It can be the cable, the driver, the motor or the code.

Connect the driver and the motor directly to a power supply and check that the motor turns. If it turns, the electronics are fine, and the problem is in the code or in a connection. If it does not turn, fix the hardware before you move to the code. Do the same for the servo, the sensors and every other part: test each one on its own before you put them together.

## Move forward piece by piece {#subsystem-subsystem-kodla}

If you write and test all of the robot's code at once, it does not work, and it is hard to find what is broken. Gall's law says it like this: a complex system that works grows from a simple system that works.

Code each subsystem separately and test it on its own. The order is usually this:

- **Drive:** The robot can move.
- **Gamepad:** You drive with the gamepad.
- **Mechanisms:** Arm, scoop, conveyor; you add them one by one.
- **Autonomous:** You write it when TeleOp works fully.

At every step, keep the robot ready to go on the field. Do not let the drive wait for the second mechanism to work. If you use an AI assistant, follow the same order: [Write code with an AI assistant](yapay-zekayla-kod-yaz.md).

<a id="ornek-surusten-tam-robota"></a>
## Turn one motor {#tek-motor}

The first goal is the simplest one: does a single motor turn, and in the right direction? If you move to the chassis without knowing this, debugging gets harder.

The motor does not connect directly to an ESP32 pin; the pin cannot give the current that turns the motor. A motor driver goes between them. On the BTS7960, a signal on the `RPWM` pin turns the motor forward, and a signal on the `LPWM` pin turns it backward. Never send a signal to both at the same time. `analogWrite` writes a value from 0 (stop) to 255 (full power) to the pin. The stick value comes from -1 to +1, so it is multiplied by 255. Details: [Drive the motor](motoru-sur.md).

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Change the pins to match your board
#define RPWM 5   // signal on this pin: motor forward
#define LPWM 6   // signal on this pin: motor backward

void stopMotor() {
  analogWrite(RPWM, 0);
  analogWrite(LPWM, 0);
}

// Runs at Init: gets the pins ready, the motor stops
void setupHardware() {
  pinMode(RPWM, OUTPUT);
  pinMode(LPWM, OUTPUT);
  stopMotor();
}

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}
void autonomousStop() { stopMotor(); }   // the motor stops at Stop

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float speed = js.getLeftY();   // -1..+1, forward is positive

  // Never signal both pins at once: one is always 0
  if (speed > 0) { analogWrite(RPWM, (int)(speed * 255));  analogWrite(LPWM, 0); }
  else           { analogWrite(RPWM, 0); analogWrite(LPWM, (int)(-speed * 255)); }
}

void teleopStop() { stopMotor(); }       // the motor stops at Stop
```

1. Paste the code into a new sketch in Arduino IDE. Change `RPWM` and `LPWM` to match your own pins.
2. Upload the code to the board.
3. In the **Match Control** section of the Driver Station, select **Teleoperated**. Then **Start** starts TeleOp directly.
4. Press **Init**, then press **Start**.
5. Push the left stick forward, then pull it back.

Result: The motor turns one way while the stick is forward and the other way while it is back. It stops when you let go of the stick or press **Stop**.

The init functions only get things ready: they set up the pins and stop the motor. The robot does not move between **Init** and **Start**, and the gamepad values are zero at that time. The stop functions put the motor in a safe state. This pattern stays the same until the end of the page.

If the motor turns the wrong way, swap the motor's two cables or swap the `RPWM` and `LPWM` numbers in the code. If the motor does not react at all, first check the stick's movement in the **Joystick** tab of the Driver Station: [Read the gamepad data](kumandayi-oku.md).

If the robot has more than one motor, test each of them with this code before you move to the chassis.

### Move it into the motor_t class {#motor_t}

Putting the single motor into a class keeps the pin numbers and the motor's direction in one place. The code is the same as in [Move the motor into a class](motoru-sur.md#motor-sinifi). Every later subsystem uses the motor through `motor_t`. Class names end with `_t`.

```cpp
// ---- Motor: BTS7960-style dual-PWM driver ----
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

Two `motor_t` side by side. This way of driving is called **arcade**: the left stick drives forward and backward, and the right stick's horizontal axis drives the turning. The left wheel gets `forward + turn`, and the right wheel gets `forward - turn`. If the turn is positive, the robot turns right; if it is negative, it turns left. When you let go of the sticks, both values go back to zero, and the robot stops.

The sum can go over 1: when you turn right at full forward speed, the left wheel asks for a value over 1. `setMotor` limits this value to 255, so you do not need another limit.

Putting the chassis into a class lets the autonomous and the other systems call `arcade()` without seeing pin numbers or formulas. For a motor that is mounted reversed, write `true` as the third value in its `motor_t` line.

```cpp
// ---- Chassis: two-motor tank, arcade drive ----
class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: forward/backward, turn: turning (positive = right)
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
// Runs at Init: everything is ready, the robot stays still
void setupHardware() { drive_base.init(); }

// Runs at Stop: everything goes to a safe state
void stopAll() { drive_base.stop(); }

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}
void autonomousStop() { stopAll(); }

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}

void teleopStop() { stopAll(); }
```

1. Delete the `RPWM`, `LPWM`, `stopMotor` and `setupHardware` lines from the single motor code.
2. Under the `#include <probot.h>` line, put the `setMotor` function, the `motor_t` and `drive_base_t` classes and the motor definitions.
3. Replace the functions with the ones above.
4. Upload the code. While **Teleoperated** is selected, press **Init**, then press **Start**.
5. Push the left stick forward, then tilt the right stick to the right.

Result: The robot drives forward with the left stick, and it turns right when the right stick tilts right. If one side goes the wrong way, add `true` as the third value in that side's `motor_t` line.

How to pick a chassis, and other ways of driving: [Drive the chassis](sasiyi-sur.md).

## Drive the mecanum chassis {#mecanum-sasi}

A mecanum chassis has four motors, and the rollers of the wheels sit at an angle. The robot can drive forward and backward, and it can also slide sideways and turn in place. The three axes are driven separately: the left stick drives forward/backward and sliding sideways, and the right stick drives the turning.

The speed of each motor is calculated with a different formula, by the wheel's position. If one of the four values goes over 1, all of them are made smaller by the same ratio. This keeps the direction of the movement. For a motor that is mounted reversed, you write `true` as the third value in its `motor_t` line.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Drives a BTS7960-style dual-PWM driver: -1 (backward) .. +1 (forward)
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

  // fwd: forward/backward, strafe: sliding sideways (positive = right), rotate: turning (positive = right)
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // If the largest value goes over 1, make all of them smaller by the same ratio: the direction is kept
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
motor_t   fl_motor(5, 6);     // front left
motor_t   fr_motor(7, 8);     // front right
motor_t   bl_motor(15, 16);   // back left
motor_t   br_motor(17, 18);   // back right
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void autonomousInit() { mecanum.init(); }
void autonomousLoop() {}
void autonomousStop() { mecanum.stop(); }

void teleopInit() { mecanum.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  // Left stick: forward/backward and sliding sideways. Right stick: turning.
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}

void teleopStop() { mecanum.stop(); }
```

1. Paste the code into a new sketch and change the pins of the four motors.
2. Upload the code. While **Teleoperated** is selected, press **Init**, then press **Start**.
3. Lift the robot off the ground and push the left stick forward. Check that all four wheels turn forward. For a motor that turns the wrong way, add `true` as the third value in its `motor_t` line.
4. Put the robot on the ground and tilt the left stick to the right.

Result: The robot drives forward while the left stick is forward, slides right when it tilts right, and turns in place with the right stick.

If the robot turns or drives diagonally instead of sliding, check the direction in which the wheels are mounted and the `true` values in the motor lines.

Four motors use eight PWM pins, and they fill the eight LEDC channels of the ESP32-S3. You cannot add a servo to this chassis.

## Add a conveyor {#konveyor}

When the drive works, add the first mechanism. The conveyor is the simplest example: one pin, on or off. It runs while **RB** is held down and stops when you let go.

This example assumes that the conveyor runs through a relay or through a driver that turns in one direction at full speed. There is no speed, only on/off with `digitalWrite`. If the conveyor is also connected to a BTS7960 and you need a speed, use a `motor_t` instead of `conveyor_t`.

```cpp
// ---- Conveyor: one pin, on/off (relay or one-direction driver) ----
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

1. Put the `conveyor_t` class under `drive_base_t`, and the `conveyor(9)` line under the motor definitions.
2. In `setupHardware()`, add `conveyor.init();`.
3. In `stopAll()`, add `conveyor.stop();`.
4. In `teleopLoop()`, add `if (js.getRB()) conveyor.run(); else conveyor.stop();`.
5. Upload the code, press **Init** and **Start**, and hold down **RB**.

Result: The conveyor turns while **RB** is held down and stops when you let go. It also stops when you press **Stop**.

If the stop line is not in `stopAll()`, the conveyor keeps turning after **Stop**. Both stop functions call `stopAll()`, so the conveyor also stops when the autonomous time is up.

## Drive the arm with limit switches {#kol-limit-switchli-mekanizma}

A mechanism that moves in two directions gets a limit switch at each end. The motor stops before the mechanism hits its limit. Without a switch, the motor forces the mechanics and damages them.

One end of the switch connects to an ESP32 pin, and the other end connects to GND. `INPUT_PULLUP` keeps the pin `HIGH` normally. When the switch is pressed, the pin connects to GND and reads `LOW`. So pressed = `LOW` = do not move that way. You do not need a separate resistor. Before every move command, the code reads the switch for that direction.

```cpp
// ---- Arm: a limit switch at each end ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move that way
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

1. Put the `arm_t` class under `conveyor_t`, and the `arm(...)` line under the `conveyor(9)` line.
2. In `setupHardware()`, add `arm.init();`. In `stopAll()`, add `arm.stop();`.
3. In `teleopLoop()`, add this: `if (js.getLB()) arm.up(); else if (js.getA()) arm.down(); else arm.stop();`
4. Upload the code, press **Init** and **Start**, and hold down **LB**.

Result: While **LB** is held down, the arm goes up and stops when it touches the top switch. While **A** is held down, it goes down and stops at the bottom switch.

This is the simplest arm system. Arms that need a different torque for each load and position may need feedforward and PID; this page does not cover them. Mechanisms that run by time or with an encoder: [Add a mechanism](mekanizma-ekle.md).

<a id="gripper-asamal-servo-kontrolu"></a>
## Drive the gripper in stages {#gripper-asamali-servo-kontrolu}

Some mechanisms have a few fixed positions: gripper closed, half open, fully open. Moving between preset angles is more exact than driving them with a stick.

The angles are kept in an array, and a cursor (`_cursor`) keeps which one is current. **D-pad** up moves the cursor forward, down moves it back, and the servo goes to the new angle. So that a held button does not fire on every pass, only the moment of the press counts: the code keeps the value from the previous pass (`_prev_up`). How the servo signal is made: [Drive the servo](servoyu-sur.md).

```cpp
// ---- Gripper: servo, stage by stage between fixed angles ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  // Init: sets up the channel, no pulse (the gripper does not move at Init)
  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, high channel
  }

  // Start: goes to the first stage
  void start() {
    _cursor = 0;
    _apply();
  }

  // D-pad up: next stage, down: previous stage. Once, at the moment of the press.
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
    Do not power the servo from the 5V or 3V3 pin of the ESP32 board. Use a separate 5-6 V supply (BEC) and connect the GNDs together.

1. Put the `gripper_t` class under `arm_t`, and the `GRIPPER_STAGES` and `gripper(...)` lines under the `arm(...)` line.
2. In `setupHardware()`, add `gripper.init();`. Add the line `void teleopStart() { gripper.start(); }` to the program.
3. In both stop functions, add `gripper.release();`.
4. In `teleopLoop()`, add `gripper.update(js.getDpadUp(), js.getDpadDown());`.
5. Upload the code, press **Init** and **Start**, and press **D-pad** up three times.

Result: At **Init**, the gripper does not move. Every time you press **Start**, the gripper goes to 0 degrees. Each press of **D-pad** up moves it to 45 and then 130 degrees. Each press of down moves it back one stage.

`teleopStart()` runs once when you press **Start**. The movement starts at Start, not at Init, so the move to the gripper's first position goes here.

The same cursor and list idea is not limited to the gripper. An arm or an elevator whose position is read with an encoder can keep a list of target positions.

## Full code {#tam-kod}

All the pieces together. The next section explains the autonomous part.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// ---- Motor: BTS7960-style dual-PWM driver ----
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

  // fwd: forward/backward, turn: turning (positive = right)
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

// ---- Conveyor: one pin, on/off (relay or one-direction driver) ----
class conveyor_t {
public:
  conveyor_t(int pin) : _pin(pin) {}
  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }
private:
  int _pin;
};

// ---- Arm: a limit switch at each end ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move that way
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

// ---- Gripper: servo, stage by stage between fixed angles ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  // Init: sets up the channel, no pulse (the gripper does not move at Init)
  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, high channel
  }

  // Start: goes to the first stage
  void start() {
    _cursor = 0;
    _apply();
  }

  // D-pad up: next stage, down: previous stage. Once, at the moment of the press.
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

// ---- The robot's parts (change the pins to match your board) ----
motor_t      left_motor(5, 6);
motor_t      right_motor(7, 8);   // if the right motor is reversed: right_motor(7, 8, true)
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(9);
arm_t        arm(10, 11, 12, 13);

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);

// Runs at Init: everything is ready, the robot does not move
void setupHardware() {
  drive_base.init();
  conveyor.init();
  arm.init();
  gripper.init();
}

// Stops everything that has a motor
void stopAll() {
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void teleopInit()  { setupHardware(); }
void teleopStart() { gripper.start(); }   // at Start, the gripper goes to the first stage

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();

  gripper.update(js.getDpadUp(), js.getDpadDown());
}

void teleopStop() {
  stopAll();
  gripper.release();   // at Stop, the servo is released
}

// ---- Autonomous: drive forward, collect, stop ----
enum class Stage { FORWARD, COLLECT, DONE };
Stage    stage      = Stage::FORWARD;
uint32_t stageStart = 0;

void autonomousInit() {
  setupHardware();
  stage = Stage::FORWARD;   // start from the beginning on every try
}

void autonomousStart() {
  stageStart = millis();    // timing starts at the moment of Start
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

void autonomousStop() {
  stopAll();           // everything stops both when time is up and at Stop
  gripper.release();
}
```

1. Paste the code into a new sketch and change the pin numbers to match your own board.
2. Upload the code to the board.
3. While **Teleoperated** is selected, press **Init**, then press **Start**.
4. Try the controls in the table one by one.

Result: The robot responds to the gamepad as in this table. When you press **Stop**, all motors stop, and the gripper servo is released.

| Gamepad | What it does |
|---|---|
| **left stick** forward/back | The robot drives forward/backward |
| **right stick** right/left | The robot turns right/left |
| **RB** held down | The conveyor turns |
| **LB** held down | The arm goes up and stops at the top switch |
| **A** held down | The arm goes down and stops at the bottom switch |
| **D-pad** up / down | The gripper moves to the next / previous angle |

<a id="faz-faz-ilerleyen-otonom"></a>
## Add the autonomous {#otonom}

In autonomous there is no gamepad; the robot moves by code written in advance. The classes you wrote for TeleOp are used here too, but the commands come from the code, not from the gamepad. The autonomous in the full code has three stages: drive forward, stop and run the conveyor, stop.

The timing uses `millis()`. If you wait with `delay()` and a pass takes longer than 2 seconds, the gamepad inputs are reset and the status LED blinks red. `autonomousInit()` runs at every **Init**; reset the stage there. The time is taken in `autonomousStart()`, because time can pass between Init and Start. At every stage change, `stageStart` is renewed, and `elapsed` measures the time spent in that stage.

1. Put the robot in an empty area.
2. In the **Match Control** section of the Driver Station, select **Autonomous**.
3. Press **Init**, then press **Start**.

Result: At **Init**, the robot does not move. After **Start**, it drives forward for 2 seconds and stops, and the conveyor turns for 1.5 seconds and stops. When the autonomous time is up, `autonomousStop()` runs, and the button's text changes to **Init Teleop**. When you press **Init Teleop**, then **Start**, you drive the robot with the gamepad.

Moving by distance and angle, going to field points, and the limits of the autonomous: [Write the autonomous](otonom-yaz.md).

## Next step

[Narrow down the problem step by step](hatayi-daralt.md)
