# Write the autonomous

On this page, you turn the robot's moves after Start, without the gamepad, into code: with timed steps, distances and field points.

## Before you start

- You can drive the robot with the gamepad: [Drive the chassis](sasiyi-sur.md).
- You know the functions in the match flow: [Write the functions for the match flow](hooklari-yaz.md).

## How the autonomous works {#otonom}

In the **Match Control** section of the Driver Station, you first select the mode: **Autonomous** or **Teleoperated**. In autonomous, the code drives the robot, not the gamepad.

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

| Event | Function that runs |
|---|---|
| **Init** pressed while **Autonomous** is selected | `autonomousInit()` once, then `autonomousInitLoop()` again and again until **Start** |
| **Start** pressed | `autonomousStart()` once, then `autonomousLoop()` again and again |
| **Autonomous süresi** (Autonomous duration) is up | `autonomousStop()` once. **Teleoperated** is selected; TeleOp does not start |
| **Stop** pressed after **Init** or **Start** | `autonomousStop()` once |
| **Init Teleop** pressed after autonomous, then **Start** | `teleopInit()`, `teleopStart()`, then `teleopLoop()` again and again |

`autonomousInitLoop()` and `autonomousStart()` are optional; if you do not write them, they count as empty. `autonomousLoop()` and `autonomousStop()` must be in every program.

Between Init and Start, the robot must not move. The library keeps the gamepad values at zero during this time. Write motor commands in `autonomousStart()` or `autonomousLoop()`, not in `autonomousInit()`.

After each pass of `autonomousLoop()`, the library waits 20 ms and calls the function again. The autonomous time starts when `autonomousStart()` ends.

When the time is up, `autonomousStop()` runs and the robot stops. TeleOp does not start by itself: the driver presses **Init Teleop**, then **Start**. Stop every motor and mechanism you ran in autonomous inside `autonomousStop()`.

## Set the autonomous time {#otonom-suresi}

1. On the Driver Station, select the **Dashboard** tab.
2. In the **Match Control** section, select **Autonomous**.
3. In the **Autonomous süresi** box, type the seconds, for example `15`. The robot starts with 30 seconds.
4. Press **Init**, then **Start**.

Result: The **Countdown** counter counts down. When it reaches zero, the robot stops, **Teleoperated** is selected and the button's text becomes **Init Teleop**. For TeleOp, press **Init Teleop**, then **Start**.

You can select the mode only while the robot is stopped. For a test without autonomous, select **Teleoperated** in step 2.

## Wait with millis() {#bekleme}

If an `autonomousLoop()` pass takes longer than 2 seconds (`PROBOT_LOOP_DEADLINE_MS`, 2000 ms), the library counts the pass as stalled. It resets the gamepad inputs, the status LED blinks red and this line appears in the **Telemetry** panel:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

When the pass returns, the red light goes off by itself. During this time, the library does not stop the task and does not restart the board.

For `autonomousInit()`, `autonomousStart()` and `autonomousStop()`, which run once, the limit is 10 seconds (`PROBOT_HOOK_DEADLINE_MS`). You can put a long preparation, like sensor calibration, in `autonomousInit()`.

!!! warning "Warning"
    The library does not touch your motor pins. During a long wait like `delay(3000)`, the motors keep turning with the last command you gave. **Stop** and the end of the autonomous time also wait for the pass to end.

So do not write a long `delay()`. In each pass, use `millis()` to check the time spent in that step. When the time is up, go to the next step.

## Write the autonomous with timed steps {#durum-makinesi}

The simplest autonomous is made of steps with a fixed time. Each step does one job and hands over to the next one when its time is up. The code below drives the robot forward for 2 seconds, turns it right for 0.8 seconds and stops it. In TeleOp, the left stick drives forward/back and the right stick turns.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Change the pins to match your board
#define LEFT_RPWM   5
#define LEFT_LPWM   6
#define RIGHT_RPWM  7
#define RIGHT_LPWM  8

// Set to true if the motor turns the wrong way
#define LEFT_INVERTED  false
#define RIGHT_INVERTED true

void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

// Forward/back + turn. A positive turn turns the robot right.
void drive(float fwd, float turn) {
  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}

void stopMotors() {
  drive(0.0f, 0.0f);
}

// Runs at Init: sets up the pins, the motors stop
void setupHardware() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive(js.getLeftY(), js.getRightX());
}

void teleopStop() { stopMotors(); }   // the motors stop at Stop

// ---- Autonomous: step by step ----
enum class Stage { FORWARD, TURN_RIGHT, DONE };
Stage stage = Stage::FORWARD;
uint32_t stageStart = 0;   // the moment the current step started (ms)

void autonomousInit() {
  setupHardware();          // Init: the robot does not move, preparation only
  stage = Stage::FORWARD;   // start from the beginning on every try
}

void autonomousStart() {
  stageStart = millis();    // the time starts at the moment of Start
}

void autonomousLoop() {
  uint32_t elapsed = millis() - stageStart;   // time spent in this step (ms)

  switch (stage) {
    case Stage::FORWARD:
      drive(0.6f, 0.0f);
      if (elapsed >= 2000) { stage = Stage::TURN_RIGHT; stageStart = millis(); }
      break;
    case Stage::TURN_RIGHT:
      drive(0.0f, 0.4f);
      if (elapsed >= 800) { stage = Stage::DONE; stageStart = millis(); }
      break;
    case Stage::DONE:
      stopMotors();
      break;
  }
}

void autonomousStop() {
  stopMotors();   // the motors stop both when the time is up and at Stop
}
```

1. Paste the code into a new sketch in Arduino IDE.
2. Change the pin and `_INVERTED` lines to match your robot.
3. Upload the code to the board: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
4. Put the robot in an empty area. On the Driver Station, select **Autonomous**.
5. Press **Init**, then **Start**.

Result: At **Init**, the robot does not move. After **Start**, it goes forward for 2 seconds, turns right for 0.8 seconds and stops. When the autonomous time is up, the button's text becomes **Init Teleop**. When you press **Init Teleop** and then **Start**, you drive the robot with the gamepad.

`autonomousInit()` runs at every **Init**. Variables keep the value from the previous try, so reset the step here. Take the time in `autonomousStart()`: time can pass between Init and Start. `stageStart` is renewed at every step change. So `elapsed` measures the time since the start of that step, not since the start of the autonomous.

If the robot goes back instead of forward, or turns the wrong way, change the `_INVERTED` value of that side.

<a id="mesafe-ve-acyla-hareket"></a>
## Move by distance and angle {#mesafe-ve-aciyla-hareket}

Without an encoder, the robot cannot know how far it really went. But the time spent at a fixed power matches a roughly fixed distance. If you measure two factors on your own robot, you can write the autonomous as "1 meter forward, 90 degrees right".

The autonomous is split into a list of steps. A `GO` step takes meters (positive is forward, negative is back). A `TURN` step takes degrees (positive is right, negative is left). The time of a step is calculated from the factors. The first step starts in `autonomousStart()`. In the previous code, delete everything after the `// ---- Autonomous: step by step ----` line and write this in its place:

```cpp
// ---- Autonomous: by distance and angle ----
// Measure on your own robot: how many seconds 1 meter and 1 degree take at a fixed power
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // example value
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // example value

enum class Move { GO, TURN };
struct Step { Move type; float amount; };

// GO: meters (+ forward, - back). TURN: degrees (+ right, - left).
Step plan[] = {
  { Move::GO,   1.0f },    // 1 meter forward
  { Move::TURN, 90.0f },   // 90 degrees right
  { Move::GO,   0.5f },    // 0.5 meter forward
};
const int STEP_COUNT = sizeof(plan) / sizeof(plan[0]);

int      stepIndex    = 0;
uint32_t stepStart    = 0;
uint32_t stepDuration = 0;

// Starts a step: drives the motors, calculates the step's time
void startStep(int i) {
  stepIndex = i;
  stepStart = millis();
  if (i >= STEP_COUNT) { stopMotors(); return; }   // the plan is done

  Step s = plan[i];
  if (s.type == Move::GO) {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_METER * 1000);    // seconds -> ms
    drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
  } else {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_DEGREE * 1000);   // seconds -> ms
    drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
  }
}

void autonomousInit() {
  setupHardware();   // Init: the robot does not move
}

void autonomousStart() {
  startStep(0);      // the moment of Start: first step
}

void autonomousLoop() {
  if (stepIndex < STEP_COUNT && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}

void autonomousStop() {
  stopMotors();
}
```

Measure the factors on your own robot:

1. In the `plan` array, keep only the `{ Move::GO, 1.0f }` line, and upload the code to the board.
2. While **Autonomous** is selected, press **Init**, then **Start**. Measure the robot's path with a tape measure.
3. Change the `SEC_PER_METER` value to old value / measured meters. For example, if it went 0.8 m with 2.3, write `2.3 / 0.8 = 2.875`.
4. Do the same with `{ Move::TURN, 90.0f }`: `SEC_PER_DEGREE` = old value × 90 / measured angle.
5. Write the real plan back, upload the code, and press **Init** and **Start**.

Result: The robot goes 1 meter forward, turns 90 degrees right, goes 0.5 meter forward and stops.

This method works reasonably on a tank chassis. On a mecanum chassis, the wheels slip more, so the link between time and distance is less reliable there.

## Go to field points {#koordinata-gitme}

If you know the robot's start position and heading, you can define points on the field and send the robot to them in order. For each point, the robot first turns toward the target, then drives the distance between them. Position is in meters, heading is in degrees. Heading 0 is the forward direction the robot faces at the start (+y), and it grows to the right.

The target heading is found with `atan2(dx, dy)`. The argument order is `dx, dy`, because heading 0 matches forward (+y). `normalizeDeg` brings the turn angle between -180 and +180. So the robot turns 10 degrees the short way instead of 350 degrees. The distance is the length of the straight line between the two points.

Write this in place of the autonomous part of the previous code:

```cpp
// ---- Autonomous: go to points ----
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // example value, measure on your own robot
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // example value, measure on your own robot

enum class Move { GO, TURN };
struct Step  { Move type; float amount; };
struct Point { float x, y; };   // meters

// Start: (0, 0), heading 0 = forward (+y). The angle grows clockwise (to the right).
Point waypoints[] = { { 1.0f, 1.0f }, { 1.0f, 2.0f }, { 0.0f, 2.0f } };
const int WP_COUNT = sizeof(waypoints) / sizeof(waypoints[0]);

Step     plan[2 * WP_COUNT];   // one turn + one forward move for each point
int      stepCount = 0, stepIndex = 0;
uint32_t stepStart = 0, stepDuration = 0;

// Brings the angle difference into -180..+180: the robot turns the short way
float normalizeDeg(float d) {
  while (d >  180.0f) d -= 360.0f;
  while (d < -180.0f) d += 360.0f;
  return d;
}

// Builds the turn + forward move steps from the points
void buildPlan() {
  stepCount = 0;
  float x = 0.0f, y = 0.0f, heading = 0.0f;
  for (int i = 0; i < WP_COUNT; i++) {
    float dx = waypoints[i].x - x;
    float dy = waypoints[i].y - y;
    float target = degrees(atan2f(dx, dy));   // (dx, dy) because heading 0 = +y
    plan[stepCount++] = { Move::TURN, normalizeDeg(target - heading) };
    plan[stepCount++] = { Move::GO,   sqrtf(dx * dx + dy * dy) };
    x = waypoints[i].x; y = waypoints[i].y; heading = target;
  }
}

void startStep(int i) {
  stepIndex = i;
  stepStart = millis();
  if (i >= stepCount) { stopMotors(); return; }

  Step s = plan[i];
  if (s.type == Move::GO) {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_METER * 1000);
    drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
  } else {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_DEGREE * 1000);
    drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
  }
}

void autonomousInit() {
  setupHardware();
  buildPlan();       // the math runs at Init, the robot does not move
}

void autonomousStart() {
  startStep(0);      // the moment of Start: first step
}

void autonomousLoop() {
  if (stepIndex < stepCount && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}

void autonomousStop() {
  stopMotors();
}
```

1. Change `SEC_PER_METER` and `SEC_PER_DEGREE` to the values you measured in the previous section.
2. In the `waypoints` array, write the points to go to, in meters.
3. Upload the code to the board.
4. Put the robot on the start point, facing the forward direction.
5. While **Autonomous** is selected, press **Init**, then **Start**.

Result: The robot turns 45 degrees right and goes to the point (1, 1). Then it moves on to the points (1, 2) and (0, 2) and stops.

## Run a mechanism in autonomous {#hareketi-mekanizmalarla-birlestirmek}

A real autonomous does not only drive; it also runs mechanisms. Each step gives a command to both the chassis and the mechanism. A step change can depend on time or on a sensor. For example, go to the next step when `digitalRead(LIMIT_TOP) == LOW`.

Stop the mechanisms in two places: in the last step and inside `autonomousStop()`. `autonomousStop()` runs both at **Stop** and when the autonomous time is up. This way, no mechanism is still running when TeleOp begins. A full example that drives the chassis and runs a conveyor: [Add the autonomous](ornek-robotu-kodla.md#otonom).

## Limits {#sinirlar}

All methods on this page are based on estimates. Wheels slip, the speed drops as the battery gets weaker, and the floor changes. The robot does not measure where it really goes, so a small error builds up at each step. These methods work for short autonomous runs; they are not reliable for long and precise moves.

For real precision, the robot must measure its own movement: an encoder gives the path the wheel turned, a gyroscope gives the robot's angle. Probot Core handles the communication between the robot and the Driver Station, and the match flow. It does not include encoder reading, odometry or PID.

## Having trouble?

- **After Start, the robot does not run the autonomous and responds to the gamepad:** **Teleoperated** is selected. Press **Stop**, select **Autonomous**, then press **Init** and **Start** again.
- **The robot moves when you press Init:** The motor command is inside `autonomousInit()`. Move the command to `autonomousStart()` or `autonomousLoop()`.
- **Autonomous is over and the robot does not respond to the gamepad:** TeleOp does not start by itself. Press **Init Teleop**, then **Start**.
- **The status LED blinks red:** A loop or initLoop pass went over 2 seconds, or an init, start or stop function went over 10 seconds. Look for a long `delay()` or a sensor call that does not respond: [Narrow down the problem step by step](hatayi-daralt.md).
- **On the second try, the autonomous starts from the last step:** Reset the step variable inside `autonomousInit()`.
- **A mechanism keeps running after the autonomous ends:** Stop that mechanism inside `autonomousStop()`.

## Next step

[Code the example robot from start to finish](ornek-robotu-kodla.md)
