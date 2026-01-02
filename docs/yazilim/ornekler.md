---
title: Örnekler
---

# Örnekler

## Başlarken
Bu sayfa, `probot-lib` kütüphanesinin ana örneklerini tanıtır. Her örnek `examples/` dizini altında bulunur.

Örnekleri denemeden önce:
- Kartınızı USB veya Wi-Fi üzerinden bağlayın
- Pin eşleşmelerini kendi donanımınıza göre güncelleyin
- `PROBOT_WIFI_AP_PASSWORD` makrosunu kendi şifrenizle değiştirin

## Örnek Listesi

| Örnek | Konum | Açıklama |
|-------|-------|----------|
| JoystickTest | `examples/JoystickTest/` | Joystick bağlantı ve eksen testi |
| MotorOpenLoopDemo | `examples/MotorOpenLoopDemo/` | Tek motor open-loop kontrol |
| IBT2MotorDemo | `examples/IBT2MotorDemo/` | IBT2 motor kontrolcü testi |
| TankDriveDemo | `examples/command_based/TankDriveDemo/` | Tank şasi sürüşü |
| MecanumDriveDemo | `examples/command_based/MecanumDriveDemo/` | Mecanum şasi sürüşü |
| AutonomousDemo | `examples/command_based/AutonomousDemo/` | Basit otonom akış |
| SliderDemo | `examples/command_based/SliderDemo/` | Slider mekanizma testi |
| ShooterDemo | `examples/command_based/ShooterDemo/` | Shooter mekanizma testi |
| TurretDemo | `examples/command_based/TurretDemo/` | Taret mekanizma testi |

---

## JoystickTest
**Ne yapar?** Driver station bağlantısını ve joystick eksenlerini test eder.

**Kullanım:**
1. Kodu yükleyin
2. WiFi'ye bağlanın (`Probot-XXXX`)
3. `http://192.168.4.1` adresinden joystick'i test edin
4. Serial monitörde eksen değerlerini görün

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakimSifreniz"

#include <probot.h>
#include <probot/io/joystick_api.hpp>

void robotInit() {
  Serial.begin(115200);
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  Serial.printf("LX:%.2f LY:%.2f RX:%.2f RY:%.2f\n",
    js.getLeftX(), js.getLeftY(),
    js.getRightX(), js.getRightY());

  delay(100);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

---

## MotorOpenLoopDemo
**Ne yapar?** Tek bir VNH5019 motor kontrolcüsünü joystick ile sürer.

**Kullanım:**
1. Motor pinlerini ayarlayın
2. Sol Y ekseni ile motoru kontrol edin

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakimSifreniz"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int INA = 1, INB = 2, PWM = 3;

static probot::motor::BoardozaVNH5019MotorController motor(INA, INB, PWM, -1, -1);

void robotInit() {
  Serial.begin(115200);
  motor.setPower(0.0f);
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float power = js.getLeftY();

  motor.setPower(power);
  Serial.printf("Power: %.2f\n", power);

  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

---

## TankDriveDemo
**Ne yapar?** İki motorlu tank şasisini joystick ile sürer.

**Konum:** `examples/command_based/TankDriveDemo/`

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakimSifreniz"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/command.hpp>
#include <probot/command/examples/tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int LEFT_INA = 1, LEFT_INB = 2, LEFT_PWM = 3;
static constexpr int RIGHT_INA = 4, RIGHT_INB = 5, RIGHT_PWM = 6;

static probot::motor::BoardozaVNH5019MotorController leftMotor(
  LEFT_INA, LEFT_INB, LEFT_PWM, -1, -1);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  RIGHT_INA, RIGHT_INB, RIGHT_PWM, -1, -1);

static probot::command::examples::TankDrive chassis(&leftMotor, &rightMotor);

void robotInit() {
  Serial.begin(115200);
  leftMotor.begin();
  rightMotor.begin();
  leftMotor.setBrakeMode(true);
  rightMotor.setBrakeMode(true);
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float left = js.getLeftY();
  float right = js.getRightY();

  chassis.drivePower(left, right);

  Serial.printf("L:%.2f R:%.2f\n", left, right);
  delay(20);
}

void autonomousInit() {}

void autonomousLoop() {
  // Basit otonom: 2 saniye ileri, 1 saniye dönüş
  static int state = 0;
  static uint32_t t0 = millis();

  uint32_t elapsed = millis() - t0;

  switch (state) {
    case 0:
      chassis.drivePower(0.5f, 0.5f);
      if (elapsed > 2000) { state = 1; t0 = millis(); }
      break;
    case 1:
      chassis.drivePower(0.4f, -0.4f);
      if (elapsed > 1000) { state = 2; }
      break;
    default:
      chassis.stop();
      break;
  }
  delay(20);
}
```

---

## MecanumDriveDemo
**Ne yapar?** Dört motorlu mecanum şasisini joystick ile sürer.

**Konum:** `examples/command_based/MecanumDriveDemo/`

**Özellikler:**
- Sol stick: İleri/geri ve yan kayma
- Sağ stick X: Yerinde dönüş
- Omnidirectional hareket

---

## IBT2MotorDemo
**Ne yapar?** IBT2 (BTS7960) motor kontrolcüsünü test eder.

**Konum:** `examples/IBT2MotorDemo/`

IBT2, yüksek akım uygulamaları için uygundur. Pin bağlantısı VNH5019'dan farklıdır.

---

## Sonraki Adımlar
- Temel örnekleri çalıştırarak bağlantıları doğrulayın
- Pin numaralarını kendi donanımınıza göre güncelleyin
- Mekanizma örneklerini (Slider, Shooter, Turret) inceleyin

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 100%; background: linear-gradient(90deg, #16a34a, #16a34a)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %100</div>
</div>
