---
title: Örnekler
---

# Örnekler 

## Bu Sayfada Ne Anlatıyoruz?
Bu sayfada pratik örneklere ve ilgili doküman bağlantılarına yer vermeyi hedefliyoruz. Bölüm ilerledikçe küçük, çalışır örnekleri burada toplayacağız.

## Örnek Kodlar

### TankDriveDemo
Bu örnek: Teleop tank sürüşünün en basit halini gösterir; iki eksen → iki teker güç.
Nerede kullanılır: İlk sürüş doğrulaması, eşleme/ekseni test, şasi parametrelerine hazırlık.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/command/scheduler.hpp>
#include <probot/command/examples/tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// Tank şasi için iki adet VNH motor kontrolcüsü pin eşlemesi (örnek değerler).
static constexpr int LEFT_INA = /* DOLDUR */;
static constexpr int LEFT_INB = /* DOLDUR */;
static constexpr int LEFT_PWM = /* DOLDUR */;
static constexpr int LEFT_ENA = -1;
static constexpr int LEFT_ENB = -1;

static constexpr int RIGHT_INA = /* DOLDUR */;
static constexpr int RIGHT_INB = /* DOLDUR */;
static constexpr int RIGHT_PWM = /* DOLDUR */;
static constexpr int RIGHT_ENA = -1;
static constexpr int RIGHT_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController leftMotor(
  LEFT_INA, LEFT_INB, LEFT_PWM, LEFT_ENA, LEFT_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  RIGHT_INA, RIGHT_INB, RIGHT_PWM, RIGHT_ENA, RIGHT_ENB);
static probot::command::examples::TankDrive chassis(&leftMotor, &rightMotor);

void robotInit() {
  Serial.begin(115200);
  delay(100);

  leftMotor.begin();
  rightMotor.begin();
  leftMotor.setBrakeMode(true);
  rightMotor.setBrakeMode(true);

  chassis.setWheelRadius(31.4f / (2.0f * 3.1415926535f));
  chassis.setTrackWidth(28.0f);

  probot::command::scheduler::attach(&chassis);
  Serial.println("[TankDriveDemo] robotInit: Tank sürüşü");
}

void robotEnd() {
  probot::command::scheduler::detach(&chassis);
  chassis.stop();
  Serial.println("[TankDriveDemo] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[TankDriveDemo] teleopInit: Joystick ile tank sürüş");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float left_axis  = js.getLeftY();
  float right_axis = js.getRightY();

  chassis.drivePower(left_axis, right_axis);
  Serial.printf("[TankDriveDemo] left=%.2f right=%.2f outL=%.2f outR=%.2f\n",
                left_axis, right_axis,
                leftMotor.getPower(), rightMotor.getPower());
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### JoystickTest
Bu örnek: Web arayüzünden gelen gamepad eksen/tuşlarını seriale yazar ve motora yansıtır.
Nerede kullanılır: Tarayıcı–kart bağlantısını ve gamepad’in okunmasını doğrulama.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// Pin atamalarını kendi kartınıza göre güncelleyin.
static constexpr int PIN_INA = /* DOLDUR */;
static constexpr int PIN_INB = /* DOLDUR */;
static constexpr int PIN_PWM = /* DOLDUR */;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController motor(
  PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);
  motor.setPower(0.0f);

  Serial.println("[JoystickTest] robotInit: Joystick ve motor izleme");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[JoystickTest] robotEnd: Bitti");
}

void teleopInit() {
  Serial.println("[JoystickTest] teleopInit: Ekseni okuyup motora aktaracağız");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY();
  motor.setPower(axis);

  Serial.printf("[JoystickTest] seq=%lu axisY=%.2f motorCmd=%.2f\n",
                static_cast<unsigned long>(js.getSeq()),
                axis,
                motor.getPower());
  delay(50);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### MotorOpenLoopDemo
Bu örnek: Joystick eksenini doğrudan motor gücüne eşler.
Nerede kullanılır: Motor kablolaması, yön/invert ve PWM ölçeği kontrolü.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// Boardoza VNH motor kontrolcusu pinleri (örnek değerler).
static constexpr int PIN_INA = /* DOLDUR */;
static constexpr int PIN_INB = /* DOLDUR */;
static constexpr int PIN_PWM = /* DOLDUR */;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController motor(
  PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(false);
  motor.setInverted(false);
  Serial.println("[MotorOpenLoopDemo] robotInit: Motor testi hazır");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[MotorOpenLoopDemo] robotEnd: Motor durduruldu");
}

void teleopInit() {
  Serial.println("[MotorOpenLoopDemo] teleopInit: Sol eksen güç, sağ tetik yön tersler");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float power = js.getLeftY();
  bool invert = js.getRightTriggerAxis() > 0.5f;

  motor.setInverted(invert);
  motor.setPower(power);

  Serial.printf("[MotorOpenLoopDemo] power=%.2f invert=%d motorOut=%.2f\n",
                power, invert ? 1 : 0, motor.getPower());
  delay(40);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### MotorControllerDemo
Bu örnek: VNH5019 kontrolcüsünün kapalı çevrim hız desteğini test eder (encoder varsa).
Nerede kullanılır: Hız/konum kontrol mantığının doğrulanması ve PID denemeleri.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>
#include <probot/devices/sensors/encoder.hpp>

static constexpr int PIN_INA = /* DOLDUR */;
static constexpr int PIN_INB = /* DOLDUR */;
static constexpr int PIN_PWM = /* DOLDUR */;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController motor(
  PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static const probot::control::PidConfig kVelocityPid{
  .kp = 0.35f, .ki = 0.02f, .kd = 0.0f, .kf = 0.0f, .out_min = -1.0f, .out_max = 1.0f
};
static probot::sensors::IEncoder* encoder = nullptr;

static probot::control::ControlType g_mode = probot::control::ControlType::kVelocity;
static bool g_has_encoder = false;

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);
  motor.setTimeoutMs(0);

  if (encoder) {
    motor.attachEncoder(encoder);
    motor.setVelocityPidConfig(kVelocityPid);
    motor.setVelocity(0.0f);
    g_has_encoder = true;
  } else {
    g_mode = probot::control::ControlType::kPercent;
    g_has_encoder = false;
  }

  Serial.println("[MotorControllerDemo] robotInit: Kapalı çevrim testi hazır");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[MotorControllerDemo] robotEnd: Motor kapatıldı");
}

void teleopInit() {
  Serial.println("[MotorControllerDemo] teleopInit: A butonu mod değiştirir");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  if (js.getRawButton(0)) {
    if (g_has_encoder) {
      g_mode = (g_mode == probot::control::ControlType::kVelocity)
                 ? probot::control::ControlType::kPercent
                 : probot::control::ControlType::kVelocity;
    } else {
      g_mode = probot::control::ControlType::kPercent;
    }
    if (g_mode == probot::control::ControlType::kVelocity) {
      motor.setVelocity(0.0f);
    } else {
      motor.setPower(0.0f);
    }
    delay(200);
  }

  float axis = js.getLeftY();
  float target = axis * (g_mode == probot::control::ControlType::kVelocity ? 100.0f : 1.0f);
  if (g_mode == probot::control::ControlType::kVelocity) {
    motor.setVelocity(target);
  } else {
    motor.setPower(target);
  }
  motor.update(millis(), 20);

  Serial.printf("[MotorControllerDemo] mode=%s target=%.2f meas=%.2f out=%.2f\n",
                g_mode == probot::control::ControlType::kVelocity ? "VEL" : "PCT",
                target,
                motor.lastMeasurement(),
                motor.lastOutput());
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### EncoderTest
Bu örnek: Enkoder tık ve hız bilgisini okur.
Nerede kullanılır: Enkoder bağlantısı, yön/doğruluk kontrolü ve birim ayarı.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/test/null_encoder.hpp>

// Bu örnek, enkoder değerlerini (tik ve hız) Serial Monitör'e yazdırır.
// Donanımı bağlayana kadar NullEncoder kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuyu gerçek enkoder sürücüsüyle değiştirin.

static probot::test::NullEncoder encoderHW; // yer tutucu; gerçek sürücü ile değiştirin

void robotInit() {
  Serial.println("[EncoderTest] robotInit: Enkoder testi");
}

void robotEnd() {
  Serial.println("[EncoderTest] robotEnd: Bitti");
}

void teleopInit() {
  Serial.println("[EncoderTest] teleopInit: Enkoder değerleri yazdırılacak");
}

void teleopLoop() {
  int32_t ticks = encoderHW.readTicks();
  int32_t tps   = encoderHW.readTicksPerSecond();
  Serial.printf("[EncoderTest] ticks=%ld tps=%ld\n", (long)ticks, (long)tps);
  delay(200);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### SliderTest
Bu örnek: D‑Pad ile slider gücü gönderir.
Nerede kullanılır: Lineer mekanizma ilk test, yön/doğruluk kontrolü.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int PIN_INA = /* DOLDUR */;
static constexpr int PIN_INB = /* DOLDUR */;
static constexpr int PIN_PWM = /* DOLDUR */;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController motor(
  PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);
  motor.setPower(0.0f);

  Serial.println("[SliderTest] robotInit: Slider testi");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[SliderTest] robotEnd: Bitti");
}

void teleopInit() {
  Serial.println("[SliderTest] teleopInit: D-Pad ile güç kontrolü");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  int pov = js.getPOV();
  float cmd = 0.0f;
  if (pov == 0) cmd = 0.6f;
  if (pov == 180) cmd = -0.6f;
  motor.setPower(cmd);

  Serial.printf("[SliderTest] cmd=%.2f out=%.2f\n", cmd, motor.getPower());
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### AutonomousDemo
Bu örnek: Kısa bir otonom akışı kurar.
Nerede kullanılır: Maç başı otonom şablonu; zaman tabanlı doğrulamalar.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/command/scheduler.hpp>
#include <probot/command/examples/tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int L_INA = /* DOLDUR */;
static constexpr int L_INB = /* DOLDUR */;
static constexpr int L_PWM = /* DOLDUR */;
static constexpr int L_ENA = -1;
static constexpr int L_ENB = -1;

static constexpr int R_INA = /* DOLDUR */;
static constexpr int R_INB = /* DOLDUR */;
static constexpr int R_PWM = /* DOLDUR */;
static constexpr int R_ENA = -1;
static constexpr int R_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController leftMotor(L_INA, L_INB, L_PWM, L_ENA, L_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(R_INA, R_INB, R_PWM, R_ENA, R_ENB);
static probot::command::examples::TankDrive chassis(&leftMotor, &rightMotor);

enum class AutoStep {
  kDriveForward,
  kPause,
  kTurn,
  kDriveToGoal,
  kFinished
};

static AutoStep g_step = AutoStep::kDriveForward;
static uint32_t g_stepStart = 0;

void robotInit() {
  Serial.begin(115200);
  delay(100);

  leftMotor.begin();
  rightMotor.begin();
  leftMotor.setBrakeMode(true);
  rightMotor.setBrakeMode(true);

  chassis.setWheelRadius(32.0f / (2.0f * 3.1415926535f));
  chassis.setTrackWidth(29.0f);

  probot::command::scheduler::attach(&chassis);
  Serial.println("[AutonomousDemo] robotInit: Otonom örneği hazır");
}

void robotEnd() {
  probot::command::scheduler::detach(&chassis);
  chassis.stop();
}

void teleopInit() {}
void teleopLoop() { delay(20); }

void autonomousInit() {
  g_step = AutoStep::kDriveForward;
  g_stepStart = millis();
  chassis.drivePower(0.5f, 0.5f);
}

void autonomousLoop() {
  uint32_t now = millis();

  switch (g_step) {
    case AutoStep::kDriveForward:
      chassis.drivePower(0.5f, 0.5f);
      if (now - g_stepStart > 2500) {
        g_step = AutoStep::kPause;
        g_stepStart = now;
        chassis.stop();
      }
      break;

    case AutoStep::kPause:
      chassis.stop();
      if (now - g_stepStart > 800) {
        g_step = AutoStep::kTurn;
        g_stepStart = now;
        chassis.drivePower(0.4f, -0.4f);
      }
      break;

    case AutoStep::kTurn:
      chassis.drivePower(0.4f, -0.4f);
      if (now - g_stepStart > 2200) {
        g_step = AutoStep::kDriveToGoal;
        g_stepStart = now;
        chassis.drivePower(0.5f, 0.5f);
      }
      break;

    case AutoStep::kDriveToGoal:
      chassis.drivePower(0.5f, 0.5f);
      if (now - g_stepStart > 2000) {
        g_step = AutoStep::kFinished;
        chassis.stop();
      }
      break;

    case AutoStep::kFinished:
    default:
      chassis.stop();
      break;
  }

  delay(20);
}
```

### PidMotorWrapperTest
Bu örnek: PidMotorWrapper ile hız referansını tutturur.
Nerede kullanılır: PID denemeleri, hız/konum kontrol mantığının doğrulanması.
```cpp
#define PROBOT_WIFI_AP_PASSWORD "ProBot1234"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/test/test_motor.hpp>
#include <probot/test/null_encoder.hpp>
#include <probot/control/pid_motor_wrapper.hpp>

static probot::test::NullEncoder encoderHW; // yer tutucu
static probot::motor::NullMotor  motorHW;   // yer tutucu
static const probot::control::PidConfig kPidCfg{
  .kp=200.0f, .ki=0.0f, .kd=0.0f, .kf=0.0f, .out_min=-1.0f, .out_max=1.0f
};
static probot::control::PidMotorWrapper motor(&encoderHW, &motorHW, 1.0f, 1.0f);

void robotInit() {
  motor.setVelocityPidConfig(kPidCfg);
  Serial.println("[PidMotorWrapperTest] robotInit: Kapalı çevrim testi");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[PidMotorWrapperTest] robotEnd: Bitti");
}

void teleopInit() {
  Serial.println("[PidMotorWrapperTest] teleopInit: Joystick ile hız kontrolü");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY();
  float vel_ref = axis * 100.0f;
  motor.setVelocity(vel_ref);
  motor.update(millis(), 20);
  Serial.printf("[PidMotorWrapperTest] vel_ref=%.2f\n", vel_ref);
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 100%; background: linear-gradient(90deg, #16a34a, #16a34a)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %100</div>
</div> 
