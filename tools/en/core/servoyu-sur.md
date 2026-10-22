# Drive the servo

On this page, you drive a hobby servo without jitter using the ESP32's LEDC hardware. You change its angle with the gamepad and build a gripper that moves in stages.

## Before you start

- The servo's signal wire is connected to a pin on the board. This page uses pin 4.
- The servo gets its power from a separate 5-6 V supply. See [Power the servo from a separate supply](#guc).
- You know how to read the gamepad. See [Read the gamepad data](kumandayi-oku.md).

The library has no servo class. The `probot::devices::Servo` class from older versions was removed; code that uses it does not compile. You drive the servo directly with the ESP32's LEDC hardware. The **define servo** block in Probot Blocks generates the same lines, but as 0.3.0 code it puts them in `robotInit()`; in 0.4.0 these lines go in the init functions ([Move 0.3.0 code](hooklari-yaz.md#gecis)).

## Drive the servo with the gamepad {#servo-kumanda}

A servo expects a 50 Hz signal: a pulse comes every 20 ms. The width of the pulse sets the angle. The code on this page turns 0 to 180 degrees into a pulse from 500 to 2500 µs.

1. In `setupServo()`, write the line `ledcAttachChannel(SERVO_PIN, 50, 14, 7)`. Call this function from both init functions.
2. Add the `servoAngle` function to the program.
3. In `teleopLoop()`, turn the stick value into an angle and pass it to `servoAngle`.
4. In `stopServo()`, cut the pulse with `ledcWrite(SERVO_PIN, 0)`. Call this function from both stop functions.
5. Upload the code. While **Teleoperated** is selected, press **Init**, then **Start**.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

#define SERVO_PIN      4
#define SERVO_LEDC_CH  7   // high channel: no clash while there are at most 7 motor PWM pins

// Moves a hobby servo to 0-180 degrees (50 Hz / 14-bit LEDC)
void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
  deg = constrain(deg, 0.0f, 180.0f);
  uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
  ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

// Runs at Init: 50 Hz, 14-bit, fixed channel.
// No pulse until the first write: the servo does not move at Init
void setupServo() {
  ledcAttachChannel(SERVO_PIN, 50, 14, SERVO_LEDC_CH);
}

void stopServo() {
  ledcWrite(SERVO_PIN, 0);   // cut the pulse, safe state
}

void autonomousInit() { setupServo(); }
void autonomousLoop() {}
void autonomousStop() { stopServo(); }

void teleopInit() { setupServo(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float angle = (js.getLeftY() + 1.0f) * 90.0f;   // -1..+1 -> 0-180
  if (js.getA()) angle = 90.0f;                    // A centers
  servoAngle(SERVO_PIN, angle);

  probot::clearTelemetry();
  probot::printf("Servo: %.0f derece\n", angle);
}

void teleopStop() { stopServo(); }
```

Result: After **Init**, the servo does not move. After **Start**, the servo goes to 90 degrees while the left stick is in the middle, and the **Telemetry** panel shows "Servo: 90 derece". When you push the stick all the way forward, the servo turns to 180 degrees. When you pull it all the way back, it turns to 0 degrees.

The numbers in the code:

- `ledcAttachChannel(pin, 50, 14, 7)`: 50 Hz, 14-bit resolution, channel 7.
- At 14 bits, the largest value is 16383, and it stands for a 20 ms frame.
- `us * 16383 / 20000` turns microseconds into this value.

`analogWrite` makes a signal of about 1 kHz, which does not suit a servo. The servo gets a high channel (7). The motors' `analogWrite` uses the lowest channels first (0, 1, 2). This way, the servo and the motors do not land on the same timer.

The init functions run again at every **Init**. The channel is fixed, so calling `ledcAttachChannel` again does not use up a new channel.

## Move to a set angle with a button {#sabit-aci}

To move the servo to two set angles with buttons instead of the stick, write `teleopLoop()` like this:

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  if (js.getA())      servoAngle(SERVO_PIN, 0.0f);     // A: 0 degrees
  else if (js.getB()) servoAngle(SERVO_PIN, 180.0f);   // B: 180 degrees
}
```

Result: When you press **A**, the servo goes to 0 degrees. When you press **B**, it goes to 180 degrees. When you let go of the button, the servo stays where it is.

## Open and close the gripper in stages {#gripper}

A gripper has a few set positions: closed, half open, fully open. Keep the angles in a list and step between these positions with the D-pad. This is more precise than driving it with the stick.

1. Write the angles in the `GRIPPER_STAGES` list.
2. Call `gripper.init()` in the init functions and `gripper.start()` in `teleopStart()`. At **Start**, the gripper goes to the first position in the list.
3. In `teleopLoop()`, call `gripper.update(js.getDpadUp(), js.getDpadDown())`.
4. Call `gripper.release()` in the stop functions.
5. Upload the code. While **Teleoperated** is selected, press **Init**, then **Start**.

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

  // Init: sets up the channel, no pulse (the gripper does not move at Init)
  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit
  }

  // Start: goes to the first position in the list
  void start() {
    _cursor = 0;
    _apply();
  }

  // Runs once at the moment the button is pressed, does not repeat while held
  void update(bool up, bool down) {
    if (up   && !_prev_up   && _cursor < _count - 1) { _cursor++; _apply(); }
    if (down && !_prev_down && _cursor > 0)          { _cursor--; _apply(); }
    _prev_up   = up;
    _prev_down = down;
  }

  void release() { ledcWrite(_pin, 0); }   // cut the pulse, servo goes limp

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

void autonomousInit() { gripper.init(); }
void autonomousLoop() {}
void autonomousStop() { gripper.release(); }

void teleopInit()  { gripper.init(); }
void teleopStart() { gripper.start(); }   // to the first position at Start

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  gripper.update(js.getDpadUp(), js.getDpadDown());
}

void teleopStop() { gripper.release(); }   // servo goes limp at Stop
```

Result: When you press **Init**, the gripper does not move. When you press **Start**, it goes to 0 degrees. Each press of **D-pad up** moves it to the next angle (45, then 130). Each press of **D-pad down** moves it back to the previous angle.

`update` keeps the button value from the previous pass. The button does something only when it changes from not pressed in one pass to pressed in the next. That is why holding the button down does not take the gripper to the end.

## Add a second servo {#ikinci-servo}

Give each servo its own pin and its own high channel. For example, use pin 5 and channel 6 for the second servo:

```cpp
ledcAttachChannel(5, 50, 14, 6);   // second servo: pin 5, channel 6
```

## Power the servo from a separate supply {#guc}

!!! warning "Warning"
    Do not power the servo from the board's 5V or 3V3 pin. These pins cannot give the current the servo draws, and the servo twitches.

Connect a separate 5-6 V supply (a BEC or UBEC) to the servo. The signal wire goes to the pin on the board. The plus and minus wires go to the supply. Connect the supply's GND to the board's GND.

If you use a servo board such as the PCA9685, set its PWM frequency to 50 Hz. At 1 kHz, it cannot make a servo pulse.

## Having trouble?

- **The servo jitters:** The servo's channel may have landed on the same timer as the motors. Give the servo a high channel such as 7. Check the servo's power supply: [Power the servo from a separate supply](#guc).
- **The servo does not move at all:** Check that the `ledcAttachChannel` line is in the init functions. The servo does not move before **Start**; after **Init**, press **Start**.
- **Compiling fails at the `probot::devices::Servo` line:** This class was removed. Drive the servo with the LEDC code on this page.
- **The servo strains at the ends or does not turn all the way:** Pass `minUs` and `maxUs` to the `servoAngle` call to make the range narrower, keeping it between 500 and 2500. Example: `servoAngle(SERVO_PIN, angle, 600, 2400);`

## Next step

[Add a mechanism](mekanizma-ekle.md)
