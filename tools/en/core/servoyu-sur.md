# Drive the servo

On this page you drive a hobby servo without jitter using the ESP32's LEDC hardware, change its angle with the gamepad, and build a staged gripper.

## Before you start

- The servo's signal wire is connected to a pin on the board. This page uses pin 4.
- The servo has its own 5-6 V power source. See [Power the servo from a separate source](#guc).
- You know how to read the gamepad. See [Read the gamepad data](kumandayi-oku.md).

The library has no servo class. The servo is driven directly with the ESP32's LEDC hardware. The **define servo** block in Probot Blocks generates the same code.

## Drive the servo with the gamepad {#servo-kumanda}

The servo expects a 50 Hz signal: one pulse every 20 ms. The width of the pulse sets the angle. The code on this page turns 0 to 180 degrees into a pulse from 500 to 2500 µs.

1. Write `ledcAttachChannel(SERVO_PIN, 50, 14, 7)` in `robotInit()`.
2. Add the `servoAngle` function to the program.
3. In `teleopLoop()`, turn the stick value into an angle and give it to `servoAngle`.
4. In `robotEnd()`, cut the pulse with `ledcWrite(SERVO_PIN, 0)`.
5. Upload the code, press **Init**, then press **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

#define SERVO_PIN      4
#define SERVO_LEDC_CH  7   // high channel: does not clash while there are at most 7 motor PWM pins

// Moves a hobby servo to 0-180 degrees (50 Hz / 14-bit LEDC)
void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
  deg = constrain(deg, 0.0f, 180.0f);
  uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
  ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

void robotInit() {
  // 50 Hz, 14-bit. No pulse until the first write: the servo does not jump at startup
  ledcAttachChannel(SERVO_PIN, 50, 14, SERVO_LEDC_CH);
}

void robotEnd() {
  ledcWrite(SERVO_PIN, 0);   // cut the pulse, safe state
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float angle = (js.getLeftY() + 1.0f) * 90.0f;   // -1..+1 -> 0-180
  if (js.getA()) angle = 90.0f;                    // A centers the servo
  servoAngle(SERVO_PIN, angle);

  probot::clearTelemetry();
  probot::printf("Servo: %.0f derece\n", angle);
}
```

Result: When the left stick is in the middle, the servo turns to 90 degrees. The **Telemetry** panel shows "Servo: 90 derece". When you push the stick fully forward, the servo turns to 180 degrees. When you pull it fully back, it turns to 0 degrees.

The numbers in the code:

- `ledcAttachChannel(pin, 50, 14, 7)`: 50 Hz, 14-bit resolution, channel 7.
- At 14 bits, the largest value is 16383. It stands for one 20 ms frame.
- `us * 16383 / 20000` converts microseconds to this value.

`analogWrite` makes a signal of about 1 kHz, which a servo does not accept. The servo gets a high channel (7). The motors' `analogWrite` uses the low channels (0, 1, 2). So the servo and the motors do not share the same timer.

## Move to fixed angles with buttons {#sabit-aci}

To move the servo to two fixed angles with buttons instead of the stick, write `teleopLoop()` like this:

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  if (js.getA())      servoAngle(SERVO_PIN, 0.0f);     // A: 0 degrees
  else if (js.getB()) servoAngle(SERVO_PIN, 180.0f);   // B: 180 degrees
}
```

Result: When you press **A**, the servo goes to 0 degrees. When you press **B**, it goes to 180 degrees. When you let go of the button, the servo stays where it is.

## Open and close the gripper in stages {#gripper}

The gripper has a few fixed positions: closed, half open and fully open. Keeping the angles in a list, and moving between these positions with the D-pad, is more exact than driving with a stick.

1. Write the angles in the `GRIPPER_STAGES` list.
2. In `robotInit()`, call `gripper.init()`. The gripper goes to the first position in the list.
3. In `teleopLoop()`, call `gripper.update(js.getDpadUp(), js.getDpadDown())`.
4. Upload the code, press **Init**, then press **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Moves a hobby servo to 0-180 degrees (50 Hz / 14-bit LEDC)
void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
  deg = constrain(deg, 0.0f, 180.0f);
  uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
  ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit
    _cursor = 0;
    _apply();
  }

  // Runs once when the button is pressed, not again while it is held
  void update(bool up, bool down) {
    if (up   && !_prev_up   && _cursor < _count - 1) { _cursor++; _apply(); }
    if (down && !_prev_down && _cursor > 0)          { _cursor--; _apply(); }
    _prev_up   = up;
    _prev_down = down;
  }

  void release() { ledcWrite(_pin, 0); }   // cut the pulse, servo goes free

private:
  void _apply() { servoAngle(_pin, _stages[_cursor]); }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };   // closed, half open, open
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);              // pin 4, channel 7

void robotInit() { gripper.init(); }
void robotEnd()  { gripper.release(); }

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  gripper.update(js.getDpadUp(), js.getDpadDown());
}
```

Result: When you press **Init**, the gripper goes to 0 degrees. Each press of **D-pad up** moves it to the next angle (45, then 130). Each press of **D-pad down** moves it to the previous one.

`update` keeps the button value from the previous loop pass. It does something only when a button goes from not pressed to pressed. So holding the button does not drive the gripper to the end.

## Add a second servo {#ikinci-servo}

Give each servo its own pin and its own high channel. For example, use pin 5 and channel 6 for a second servo:

```cpp
ledcAttachChannel(5, 50, 14, 6);   // second servo: pin 5, channel 6
```

## Power the servo from a separate source {#guc}

!!! warning "Warning"
    Do not power the servo from the board's 5V or 3V3 pin. These pins cannot supply the current the servo draws, and the servo jitters.

Connect the servo to a separate 5-6 V source (BEC or UBEC). Connect the signal wire to the pin on the board. Connect the plus and minus wires to the source. Connect the GND of the source to the GND of the board.

If you use a servo board such as the PCA9685, set its PWM frequency to 50 Hz. A servo pulse cannot be made at 1 kHz.

## Having trouble?

- **The servo jitters:** The servo's channel may share a timer with the motors. Give the servo a high channel such as 7. Check the servo's power supply: [Power the servo from a separate source](#guc).
- **The servo does not move at all:** Check that the `ledcAttachChannel` line is in `robotInit()`. Make sure you pressed **Init** in the Driver Station.
- **The servo strains at the ends or does not turn fully:** Pass `minUs` and `maxUs` to `servoAngle`, and narrow the range inside 500 to 2500. For example: `servoAngle(SERVO_PIN, angle, 600, 2400);`

## Next step

[Add a mechanism](mekanizma-ekle.md)
