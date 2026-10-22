# Write the autonomous

On this page you turn the moves that the robot makes after **Start**, without the gamepad, into code. You write them as timed steps, distances and field points.

## Before you start

- You can drive the robot with the gamepad: [Drive the chassis](sasiyi-sur.md).
- You know the functions of the match flow: [Write the functions for the match flow](hooklari-yaz.md).

## How autonomous works {#otonom}

When the **Autonomous** switch is on in the Driver Station, press **Start** to begin autonomous. In autonomous, the code drives the robot, not the gamepad.

| Event | Function that runs |
|---|---|
| **Start** pressed, **Autonomous** on | `autonomousInit()` once, then `autonomousLoop()` again and again |
| **Autonomous Duration** ran out | `teleopInit()` once, then `teleopLoop()` again and again |
| The **Autonomous** switch was turned off during autonomous | `teleopInit()`, then `teleopLoop()` |
| **Start** pressed, **Autonomous** off | Autonomous is skipped: `teleopInit()`, then `teleopLoop()` |
| **Stop** pressed | `robotEnd()` once |

The library waits 20 ms after each loop pass of `autonomousLoop()`, then calls it again. The driver does not have to press anything to move from autonomous to TeleOp.

When autonomous ends and TeleOp starts, `robotEnd()` is not called. The motors and mechanisms you ran in autonomous keep running with the same command until the TeleOp code gives them a new command. So stop everything inside `teleopInit()`.

## Set the autonomous duration {#otonom-suresi}

1. In the Driver Station, select the **Dashboard** tab.
2. In the **Match Control** section, type the number of seconds in the **Autonomous Duration** box, for example `15`. The default is 30.
3. Turn on the **Autonomous** switch.
4. Press **Init**, then press **Start**.

Result: The **Autonomous Countdown** counts down. When it reaches zero, TeleOp starts and the robot responds to the gamepad.

For a test without autonomous, turn off the **Autonomous** switch in step 3.

## Wait with millis() {#bekleme}

An `autonomousLoop()` pass that takes longer than 2 seconds (`PROBOT_LOOP_DEADLINE_MS`, 2000 ms) counts as stalled. The library zeroes the gamepad inputs, the status LED blinks red, and this line appears in the **Telemetry** panel:

```text
!! LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

When the pass ends, the red light turns off by itself. During this time the library does not stop the task and does not restart the board.

!!! warning "Warning"
    The library does not touch your motor pins. During a long wait such as `delay(3000)`, the motors keep running at the last command you gave. **Stop** and the switch to TeleOp also wait for the pass to end.

So do not write long `delay()` calls. In each pass, use `millis()` to check the time spent on the current step. When the time is up, move to the next step.

## Write the autonomous with timed steps {#durum-makinesi}

The simplest autonomous is a set of steps with fixed times. Each step does one job. When its time is up, it hands over to the next step. The code below drives the robot forward for 2 seconds, turns it right for 0.8 seconds and stops it. In TeleOp, the left stick drives forward and back, and the right stick turns.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Change the pins for your board
#define LEFT_RPWM   5
#define LEFT_LPWM   6
#define RIGHT_RPWM  7
#define RIGHT_LPWM  8

// Set to true if the motor direction is reversed
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

// Forward/backward + turn. A positive turn turns the robot right.
void drive(float fwd, float turn) {
  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}

void stopMotors() {
  drive(0.0f, 0.0f);
}

void robotInit() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void robotEnd() {
  stopMotors();   // The motors stop at Stop
}

void teleopInit() {
  stopMotors();   // clear the command left from autonomous
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive(js.getLeftY(), js.getRightX());
}

// ---- Autonomous: step by step ----
enum class Stage { FORWARD, TURN_RIGHT, DONE };
Stage stage = Stage::FORWARD;
uint32_t stageStart = 0;   // when the current step started (ms)

void autonomousInit() {
  stage = Stage::FORWARD;   // start from the beginning in every autonomous
  stageStart = millis();    // the moment of Start
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
```

1. Paste the code into a new sketch in Arduino IDE.
2. Change the pin and `_INVERTED` lines for your robot.
3. Upload the code to the board: [Set up Arduino IDE for Probot](arduino-ide-kur.md).
4. Place the robot in an open area. In the Driver Station, turn on the **Autonomous** switch.
5. Press **Init**, then press **Start**.

Result: The robot drives forward for 2 seconds, turns right for 0.8 seconds and stops. When autonomous ends, TeleOp starts and the gamepad drives the robot.

`autonomousInit()` runs at every **Start**. Variables keep the value from the previous run, so reset the step and the time here. Each step change restarts `stageStart`. This way, `elapsed` measures the time since the start of that step, not since the start of autonomous.

If the robot drives backward instead of forward, or turns the wrong way, change the `_INVERTED` value for that side.

<a id="mesafe-ve-acyla-hareket"></a>
## Move by distance and angle {#mesafe-ve-aciyla-hareket}

A robot without an encoder cannot know how far it has really gone. At a fixed power, the time spent roughly matches a fixed distance. If you measure two coefficients on your robot, you can write the autonomous as "1 meter forward, 90 degrees right."

The autonomous is split into a list of steps. A `GO` step takes meters (positive is forward, negative is backward). A `TURN` step takes degrees (positive is right, negative is left). The duration of each step is calculated from the coefficients. Delete everything after the line `// ---- Autonomous: step by step ----` in the previous code, and write this in its place:

```cpp
// ---- Autonomous: distance and angle ----
// Measure on your robot: how many seconds 1 meter and 1 degree take at a fixed power
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // example value
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // example value

enum class Move { GO, TURN };
struct Step { Move type; float amount; };

// GO: meters (+ forward, - backward). TURN: degrees (+ right, - left).
Step plan[] = {
  { Move::GO,   1.0f },    // 1 meter forward
  { Move::TURN, 90.0f },   // 90 degrees right
  { Move::GO,   0.5f },    // 0.5 meters forward
};
const int STEP_COUNT = sizeof(plan) / sizeof(plan[0]);

int      stepIndex    = 0;
uint32_t stepStart    = 0;
uint32_t stepDuration = 0;

// Starts a step: drives the motors and calculates the step's duration
void startStep(int i) {
  stepIndex = i;
  stepStart = millis();
  if (i >= STEP_COUNT) { stopMotors(); return; }   // plan finished

  Step s = plan[i];
  if (s.type == Move::GO) {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_METER * 1000);    // seconds to ms
    drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
  } else {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_DEGREE * 1000);   // seconds to ms
    drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
  }
}

void autonomousInit() {
  startStep(0);   // the moment of Start: first step
}

void autonomousLoop() {
  if (stepIndex < STEP_COUNT && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}
```

Measure the coefficients on your robot:

1. In the `plan` array, keep only the `{ Move::GO, 1.0f }` line. Upload the code.
2. Start autonomous, and measure the distance the robot travels in meters.
3. Change `SEC_PER_METER` to the old value divided by the measured meters. For example, if you used 2.3 and the robot went 0.8 m, write `2.3 / 0.8 = 2.875`.
4. Do the same with `{ Move::TURN, 90.0f }`. `SEC_PER_DEGREE` is the old value times 90, divided by the measured angle.
5. Put the real plan back, upload the code and start autonomous.

Result: The robot drives 1 meter forward, turns 90 degrees right, drives 0.5 meters forward and stops.

This method works reasonably well on a tank chassis. Mecanum wheels slip more, so the link between time and distance is less reliable there.

## Go to field points {#koordinata-gitme}

If you know the robot's start position and direction, you can define points on the field and send the robot to them in order. For each point, the robot first turns toward it, then drives the distance to it. Positions are in meters. Direction is in degrees. Direction 0 is the forward direction at the start (+y), and it increases to the right.

The target direction is found with `atan2(dx, dy)`. The argument order is `dx, dy` because direction 0 is forward (+y). `normalizeDeg` brings the turn angle into the range -180 to +180. So the robot turns 10 degrees the short way instead of 350 degrees. The distance is the length of the straight line between the two points.

Replace the autonomous part of the previous code with this:

```cpp
// ---- Autonomous: go to points ----
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // example value, measure on your robot
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // example value, measure on your robot

enum class Move { GO, TURN };
struct Step  { Move type; float amount; };
struct Point { float x, y; };   // meters

// Start: (0, 0), direction 0 = forward (+y). The angle grows clockwise (to the right).
Point waypoints[] = { { 1.0f, 1.0f }, { 1.0f, 2.0f }, { 0.0f, 2.0f } };
const int WP_COUNT = sizeof(waypoints) / sizeof(waypoints[0]);

Step     plan[2 * WP_COUNT];   // one turn and one forward drive per point
int      stepCount = 0, stepIndex = 0;
uint32_t stepStart = 0, stepDuration = 0;

// Brings the angle difference into the range -180..+180: the robot turns the short way
float normalizeDeg(float d) {
  while (d >  180.0f) d -= 360.0f;
  while (d < -180.0f) d += 360.0f;
  return d;
}

// Builds the turn and forward steps from the points
void buildPlan() {
  stepCount = 0;
  float x = 0.0f, y = 0.0f, heading = 0.0f;
  for (int i = 0; i < WP_COUNT; i++) {
    float dx = waypoints[i].x - x;
    float dy = waypoints[i].y - y;
    float target = degrees(atan2f(dx, dy));   // direction 0 is +y, so (dx, dy)
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
  buildPlan();
  startStep(0);
}

void autonomousLoop() {
  if (stepIndex < stepCount && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}
```

1. Replace `SEC_PER_METER` and `SEC_PER_DEGREE` with the values you measured in the previous section.
2. Write the points to visit in the `waypoints` array, in meters.
3. Upload the code.
4. Place the robot at the start point, facing forward.
5. With **Autonomous** on, press **Init**, then press **Start**.

Result: The robot turns 45 degrees right and drives to (1, 1). Then it drives to (1, 2) and (0, 2), and stops.

## Run mechanisms in autonomous {#hareketi-mekanizmalarla-birlestirmek}

A real autonomous does not only drive. It also runs mechanisms. Each step gives commands to both the chassis and the mechanism. A step change can depend on time or on a sensor. For example, move to the next step when `digitalRead(LIMIT_TOP) == LOW`.

Stop the mechanisms in three places: in the last step, in `robotEnd()` and in `teleopInit()`. For a full example that drives the chassis and runs a conveyor, see [Code the example robot from start to finish](ornek-robotu-kodla.md#otonom).

## Limits {#sinirlar}

Every method on this page depends on estimates. Wheels slip, the speed drops as the battery weakens, and the surface changes. The robot does not measure where it really goes, so a small error builds up at each step. The methods work for short autonomous routines. They are not reliable for long, precise moves.

For real accuracy, the robot must measure its own motion. An encoder measures the distance the wheel turns. A gyroscope gives the robot's angle. Probot Core handles the communication between the robot and the Driver Station, and the match flow. It does not include encoder reading, odometry or PID.

## Having trouble?

- **After you press Start, the robot responds to the gamepad instead of running autonomous:** The **Autonomous** switch is off. Turn it on, then press **Init** and **Start** again.
- **The status LED blinks red:** A pass took longer than 2 seconds. Look for a long `delay()` or a sensor call that does not respond: [Narrow down the problem step by step](hatayi-daralt.md).
- **In the second run, autonomous starts from the last step:** Reset the step variable and the time in `autonomousInit()`.
- **A mechanism keeps running when TeleOp starts:** Stop that mechanism in `teleopInit()`.

## Next step

[Code the example robot from start to finish](ornek-robotu-kodla.md)
