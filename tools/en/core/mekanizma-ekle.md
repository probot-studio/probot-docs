# Add a mechanism

On this page, you write mechanisms such as a conveyor, an arm with a limit switch and a slider as separate classes, and connect them to the gamepad together with the drive code.

## Before you start

- The chassis is driven with the gamepad, and the `drive_base_t` class is ready. See [Drive the chassis](sasiyi-sur.md#drive-base-t).
- You tested each mechanism's motor or relay on its own first. See [Drive the motor](motoru-sur.md#tek-motor).

Add the mechanisms one at a time. When one works, move on to the next. At every step, the robot should stay ready for the field.

## Write each mechanism as a class {#alt-sistem}

As the robot grows, writing all the code inside `teleopLoop()` makes the job harder. Write each mechanism (chassis, arm, slider, gripper) as its own class. These classes are called subsystems. They all follow the same pattern:

| Function | What it does | Where it is called |
|---|---|---|
| `init()` | Sets up the pins and stops the mechanism | `robotInit()` |
| `up()`, `run()` and similar | Makes the mechanism do a job | `teleopLoop()`, `autonomousLoop()` |
| `stop()` | Puts the mechanism in a safe position | `robotEnd()` |
| `periodic()` (if needed) | Checks the time or a sensor on every pass | `teleopLoop()`, `autonomousLoop()` |

So the loop functions only connect the gamepad to the mechanisms. Pin and sensor details stay inside the class. Autonomous calls the same functions.

## Run the conveyor with a button {#konveyor}

This example assumes the conveyor runs on a relay or on a driver that turns one way at full speed. So there is no speed control, only on and off. If the conveyor is connected to a BTS7960 and needs speed control, use `motor_t`.

1. Add the `conveyor_t` class to the program and write its pin.
2. Call `conveyor.init()` inside `robotInit()` and `conveyor.stop()` inside `robotEnd()`.
3. Inside `teleopLoop()`, call `conveyor.run()` while **RB** is pressed, and `conveyor.stop()` when it is not.

```cpp
class conveyor_t {
public:
  conveyor_t(uint8_t pin) : _pin(pin) {}

  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }

private:
  uint8_t _pin;
};

conveyor_t conveyor(5);   // relay or driver pin
```

Result: The conveyor runs while **RB** is pressed and stops when you let go. It also stops when you press **Stop**.

## Limit the arm with limit switches {#kol}

Put a limit switch at each end of an arm that moves in two directions. When the switch is pressed, the motor stops in that direction. Without switches, the motor pushes the arm into its mechanical limit and damages it.

One end of the limit switch connects to a board pin, and the other end connects to GND. An `INPUT_PULLUP` pin normally stays `HIGH`. When the switch is pressed, the pin connects to GND and reads `LOW`. No separate resistor is needed.

1. Add the `arm_t` class to the program. The class uses the `setMotor` function from the [Drive the motor](motoru-sur.md#tek-motor) page.
2. Write the motor pins and the two switch pins.
3. Inside `teleopLoop()`, call `arm.up()` with **LB** and `arm.down()` with **A**. If neither is pressed, call `arm.stop()`.

```cpp
class arm_t {
public:
  arm_t(uint8_t rpwm, uint8_t lpwm, uint8_t limit_top, uint8_t limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move in that direction
  void up(float power = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, power, false);
  }

  void down(float power = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, -power, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm, _limit_top, _limit_bottom;
};

arm_t arm(12, 13, 14, 15);   // motor RPWM, LPWM, top switch, bottom switch
```

Result: While **LB** is pressed the arm goes up, and while **A** is pressed it goes down. When the arm touches the top switch, it does not go up. When it touches the bottom switch, it does not go down.

A slider (linear rail) is driven with the same class. Put the switches at the two ends of the rail.

This is the simplest arm setup. Arms that hold a position under load need feedback control.

## Drive the slider for a set time {#slider-sure}

If there are no limit switches, you estimate the position from time. When you press a button, the slider moves for a fixed time. `periodic()` checks the time on every pass and stops the slider when the time is up. The loop does not wait.

```cpp
class timed_slider_t {
public:
  timed_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }

  void raise() { _start( 0.8f, 1200); }   // 1.2 s up
  void lower() { _start(-0.8f, 1200); }   // 1.2 s down

  // Call on every pass: stops when the time is up
  void periodic() {
    if (_running && millis() - _t0 >= _dur) stop();
  }

  void stop() { _running = false; setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  void _start(float power, uint32_t dur) {
    _t0 = millis(); _dur = dur; _running = true;
    setMotor(_rpwm, _lpwm, power, false);
  }

  uint8_t  _rpwm, _lpwm;
  bool     _running = false;
  uint32_t _t0 = 0, _dur = 0;
};

timed_slider_t slider(12, 13);

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  if (js.getY()) slider.raise();
  if (js.getX()) slider.lower();
  slider.periodic();   // check the time on every pass
}
```

Result: Pressing **Y** moves the slider up for 1.2 seconds, and pressing **X** moves it down for 1.2 seconds, then it stops.

!!! warning "Warning"
    Driving by time does not protect the ends of the mechanism. Pick a time short enough that the slider does not hit an end, and try it at low power first.

## Drive to a target with an encoder {#encoder-sablonu}

An encoder gives the mechanism's real position as a number. If you give the motor power based on the difference between the target position and the current position, the mechanism moves to the target. This feedback loop is called PID.

The Probot library does not provide encoder reading or PID. The class below is only a starting template. You must write the `readEncoder()` function for your own encoder, and tune the `_kp` value on the robot.

```cpp
class pid_slider_t {
public:
  pid_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void setTarget(long ticks) { _target = ticks; }

  // Call on every pass: applies power toward the target
  void periodic() {
    long  pos   = readEncoder();
    float error = (float)(_target - pos);
    float out   = constrain(_kp * error, -1.0f, 1.0f);   // P only; ki and kd can be added
    setMotor(_rpwm, _lpwm, out, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  long readEncoder() { return 0; }   // TODO: return the encoder count

  uint8_t _rpwm, _lpwm;
  long    _target = 0;
  float   _kp = 0.0f;                // first, raise only kp in small steps
};
```

Start `_kp` at 0, and raise it in small steps until the slider moves toward the target. If it goes back and forth around the target, the value is too high. If it approaches the target very slowly, the value is too low.

## Use the mechanisms together {#birlikte}

The program below drives the tank chassis, the conveyor and the arm together. Each class's `init()` function is called from `robotInit()`, and its `stop()` function is called from `robotEnd()`.

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

class conveyor_t {
public:
  conveyor_t(uint8_t pin) : _pin(pin) {}

  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }

private:
  uint8_t _pin;
};

class arm_t {
public:
  arm_t(uint8_t rpwm, uint8_t lpwm, uint8_t limit_top, uint8_t limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // If the switch is pressed (LOW), do not move in that direction
  void up(float power = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, power, false);
  }

  void down(float power = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, -power, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm, _limit_top, _limit_bottom;
};

// Change the pins for your board
motor_t      left_motor(16, 17);
motor_t      right_motor(18, 21, true);   // right motor mounted reversed
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(5);
arm_t        arm(12, 13, 14, 15);

void robotInit() {
  drive_base.init();
  conveyor.init();
  arm.init();
}

void robotEnd() {   // On Stop, everything goes to a safe position
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();
}
```

Result: The robot drives with the sticks, **RB** runs the conveyor, and **LB** and **A** run the arm. When you press **Stop**, the chassis, the conveyor and the arm stop together.

To add a gripper, use the `gripper_t` class from the [Drive the servo](servoyu-sur.md#gripper) page. You will find the autonomous and the full robot on the [Code the example robot from start to finish](ornek-robotu-kodla.md) page.

## Having trouble?

- **The arm does not stop when it reaches the top switch:** The switch pins may be swapped. In the `arm_t` line, swap the top and bottom switch pins.
- **The arm does not move in one direction at all:** The switch for that direction may always read as pressed. Check the switch wire and the pin number. To see the value, write it to the **Telemetry** panel with a line such as `probot::printf("ust=%d\n", digitalRead(14));`.
- **A mechanism keeps running after Stop:** That mechanism's `stop()` call is missing from `robotEnd()`.

## Next step

[Write the autonomous](otonom-yaz.md)
