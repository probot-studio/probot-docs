# Add a mechanism

On this page, you write mechanisms such as a conveyor, an arm with limit switches and a slider as separate classes. Then you connect them to the gamepad together with the drive code.

## Before you start

- The chassis drives with the gamepad and the `drive_base_t` class is ready. See [Move the chassis into a class](sasiyi-sur.md#drive-base-t).
- You tried the motor or relay of each mechanism on its own first. See [Drive one motor with the gamepad](motoru-sur.md#tek-motor).

Add the mechanisms one at a time. When one works, go on to the next. After each step, the robot must still be ready to go on the field.

## Make each mechanism a class {#alt-sistem}

As the robot grows, writing all the code inside `teleopLoop()` makes the work harder. Write each mechanism (chassis, arm, slider, gripper) as a separate class. These classes are called subsystems. They all follow the same layout:

| Function | What it does | Called from |
|---|---|---|
| `init()` | Sets up the pins, stops the mechanism | `teleopInit()`, `autonomousInit()` |
| `up()`, `run()` and similar | Makes the mechanism do a job | `teleopLoop()`, `autonomousLoop()` |
| `stop()` | Puts the mechanism in a safe state | `teleopStop()`, `autonomousStop()` |
| `periodic()` (if needed) | Checks the time or a sensor in every loop pass | `teleopLoop()`, `autonomousLoop()` |

This way, the loop function only connects the gamepad to the mechanisms. The pin and sensor details stay inside the class. The autonomous calls the same functions.

`init()` does not move the mechanism. Between Init and Start, the robot must stay in place. If a job moves the mechanism to its first position, call it from `teleopStart()` or `autonomousStart()`.

## Run the conveyor with a button {#konveyor}

This example assumes that the conveyor runs with a relay, or with a driver that turns in one direction at full speed. So there is no speed, only on and off. If the conveyor is connected to a BTS7960 and you need speed, use `motor_t`.

1. Add the `conveyor_t` class to the program and write its pin.
2. Call `conveyor.init()` in the two init functions, and `conveyor.stop()` in the two stop functions.
3. In `teleopLoop()`, call `conveyor.run()` while **RB** is pressed, and `conveyor.stop()` while it is not.

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

Result: While **RB** is pressed, the conveyor turns; when you let go, it stops. It also stops when you press **Stop**.

## Limit the arm with limit switches {#kol}

An arm that moves in two directions has a limit switch at each end. When a switch is pressed, the motor stops in that direction. Without a switch, the motor forces the arm against its mechanical limit and damages it.

One end of the limit switch goes to a pin on the board, the other end to GND. `INPUT_PULLUP` keeps the pin `HIGH` normally. When the switch is pressed, the pin connects to GND and reads `LOW`. You do not need a separate resistor.

1. Add the `arm_t` class to the program. The class uses the `setMotor` function from the [Drive one motor with the gamepad](motoru-sur.md#tek-motor) section.
2. Write the motor pins and the two switch pins.
3. In `teleopLoop()`, call `arm.up()` with **LB** and `arm.down()` with **A**. If neither is pressed, call `arm.stop()`.

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

  // If the switch is pressed (LOW), do not go that way
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

Result: While **LB** is pressed, the arm goes up; while **A** is pressed, it goes down. When it touches the top switch, the arm does not go up; when it touches the bottom switch, it does not go down.

You drive a slider (linear slide) with the same class. Put the switches at the two ends of the slide.

This is the simplest arm layout. Arms that hold their position under load need feedback control.

## Drive the slider by time {#slider-sure}

Without a limit switch, you estimate the position by time. When you press a button, the slider moves for a fixed time. `periodic()` checks the time in every loop pass and stops the slider when the time is up. The loop does not wait.

```cpp
class timed_slider_t {
public:
  timed_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }

  void raise() { _start( 0.8f, 1200); }   // up for 1.2 s
  void lower() { _start(-0.8f, 1200); }   // down for 1.2 s

  // Call in every loop pass: stops when the time is up
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
bool prevY = false, prevX = false;   // button state in the previous loop pass

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  bool y = js.getY(), x = js.getX();
  // Start only in the loop pass where the button is pressed; holding it does not make the time longer
  if (y && !prevY) slider.raise();
  if (x && !prevX) slider.lower();
  prevY = y;
  prevX = x;
  slider.periodic();   // check the time in every loop pass
}
```

Result: When you press **Y**, the slider goes up for 1.2 seconds; when you press **X**, it goes down for 1.2 seconds, then it stops. Holding the button does not make the time longer.

!!! warning "Warning"
    Driving by time does not protect the end of the mechanism. Pick a time short enough that the slider does not hit its end, and try it at low power first.

## Go to a target with an encoder {#encoder-sablonu}

An encoder gives the real position of the mechanism as a number. If you give the motor power based on the difference between the target position and the current position, the mechanism goes to the target. This feedback loop is called PID.

The Probot library does not give you encoder reading or PID. The class below is only a starting template. You have to write the `readEncoder()` function for your own encoder and tune the `_kp` value on the robot.

```cpp
class pid_slider_t {
public:
  pid_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void setTarget(long ticks) { _target = ticks; }

  // Call in every loop pass: gives power toward the target
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
  float   _kp = 0.0f;                // first raise only kp in small steps
};
```

Start `_kp` at 0 and raise it in small steps until the slider moves toward the target. If it goes back and forth around the target, the value is too big. If it gets close too slowly, the value is too small.

## Use the mechanisms together {#birlikte}

The program below drives the tank chassis, the conveyor and the arm together. Each class's `init()` function is called from `setupHardware()`, and its `stop()` function from `stopAll()`. The two init functions call `setupHardware()`, and the two stop functions call `stopAll()`.

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

  // If the switch is pressed (LOW), do not go that way
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

// Change the pins to match your board
motor_t      left_motor(16, 17);
motor_t      right_motor(18, 21, true);   // right motor mounted reversed
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(5);
arm_t        arm(12, 13, 14, 15);

// Runs at Init: the pins are ready, everything stops
void setupHardware() {
  drive_base.init();
  conveyor.init();
  arm.init();
}

// Runs at Stop: everything goes to a safe state
void stopAll() {
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}
void autonomousStop() { stopAll(); }

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();
}

void teleopStop() { stopAll(); }
```

Result: The robot drives with the sticks, **RB** runs the conveyor, and **LB** and **A** run the arm. When you press **Stop**, the chassis, the conveyor and the arm stop together.

To add a gripper, use the `gripper_t` class from the [Open and close the gripper in stages](servoyu-sur.md#gripper) section. You find the autonomous and the full robot on the [Code the example robot from start to finish](ornek-robotu-kodla.md) page.

## Having trouble?

- **The arm does not stop when it touches the top switch:** The switch pins may be swapped. In the `arm_t` line, swap the top and bottom switch pins.
- **The arm does not go one way at all:** The switch in that direction may always read as pressed. Check the switch cable and the pin number. To see the value, write it to the **Telemetry** panel with a line such as `probot::printf("ust=%d\n", digitalRead(14));`.
- **A mechanism keeps running after Stop:** That mechanism's `stop()` call is not in `stopAll()`, or one of the stop functions does not call `stopAll()`.
- **A mechanism moves when you press Init:** That mechanism's `init()` function gives the motor power. Move the movement to `teleopStart()`, `autonomousStart()` or the loop functions.

## Next step

[Write the autonomous](otonom-yaz.md)
