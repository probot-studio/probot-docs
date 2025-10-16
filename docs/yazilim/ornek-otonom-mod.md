---
title: Örnek Otonom Mod
---

# Örnek Otonom Mod

## Bu Sayfada Ne Anlatıyoruz?
Basit bir otonom iskeletini önce sıralı, ardından paralel alt sistemlerle hızlandırmayı gösteriyoruz. Şasiyle birlikte intake/slider/gripper gibi sistemleri senkron çalıştırmaya giriş yapıyoruz.

<!-- Bu sayfa, otonom akışını önce sıralı olarak doğrulayıp sonra paralel alt sistemlerle hızlandırmayı gösterir. Kodlar örnek niteliğindedir; kendi şasinize ve sensörlerinize göre `DOLDUR` alanlarını tamamlayın. -->

## Genel İskelet (NFR Şasi + Intake, Gripper, Slider)
Bu iskeleti adım adım dolduracağız; her adımda sadece değişen kısımları göstereceğiz.

```cpp
#include <probot/chassis/basic_tank_drive.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
// Slider için varsayımsal probot arayüzü
#include <probot/mechanism/slider.hpp>

// Şasi ve slider
static probot::motor::BoardozaVNHMotorDriver leftHW(/* INA, INB, PWM[, ENA, ENB] */);
static probot::motor::BoardozaVNHMotorDriver rightHW(/* INA, INB, PWM[, ENA, ENB] */);
static probot::motor::MotorHandle leftMotor(leftHW);
static probot::motor::MotorHandle rightMotor(rightHW);
static probot::chassis::BasicTankDrive chassis(&leftMotor, &rightMotor);
static probot::mechanism::Slider       slider(/* DOLDUR: parametreler */);

// Intake (tek motor)
probot::motor::BoardozaVNHMotorDriver intakeMotor(/* INA, INB, PWM[, ENA, ENB] */);
inline void setIntake(float power){ intakeMotor.setPower(power); } // öneri: -1.0 .. +1.0

// Gripper (tek servo)
Servo gripperServo; // DOLDUR: servo pini
const int kGripOpenUs  = /* DOLDUR: ör. 1800–2200 */; // açık
const int kGripCloseUs = /* DOLDUR: ör. 900–1200 */;  // kapalı
inline void gripperOpen(){ gripperServo.writeMicroseconds(kGripOpenUs); }
inline void gripperClose(){ gripperServo.writeMicroseconds(kGripCloseUs); }

// Durum makinesi
enum AutoState { START, DRIVE_FWD, TURN_90, SLIDER_OUT, GRIPPER_OPEN, DONE };

void robotInit(){
  gripperServo.attach(/* DOLDUR: pin */);
  setIntake(0.0f);
}

void teleopInit(){}
void teleopLoop(){ /* boş */ }

void autonomousInit(){
  chassis.init();
  // DOLDUR: gerektiğinde hız/sınır ayarları
}
```


## Paralel Alt Sistemler
Az önceki sıralamayı, bazı alt sistemleri aynı anda çalıştırarak hızlandırabiliriz. Örneğin şasi hedefe yaklaşırken intake’i önden açmak ya da dönüş sürerken slider’ı hedefe doğru yollamak gibi. Aşağıdaki örnek, aynı akışı daha kısa sürede bitirmek için yalnızca `autonomousLoop` bölümünde yapılan değişimi gösterir.

```cpp
void autonomousLoop(){
  static AutoState st = START;
  static uint32_t t0 = millis();
  static bool intakeOn = false;

  switch (st){
    case START:
      st = DRIVE_FWD;
      break;
    case DRIVE_FWD:
      if (!intakeOn) { setIntake(/* DOLDUR: içeri güç (örn. 0.4f) */); intakeOn = true; }
      chassis.driveDistance(/* DOLDUR: cm (örn. 80) */);
      if (chassis.distanceDone()) { setIntake(0.0f); intakeOn = false; st = TURN_90; t0 = millis(); }
      break;
    case TURN_90:
      // Dönüş sürerken slider’ı hedefe yolla (uygunsa)
      slider.setTargetMM(/* DOLDUR: örn. 250–320 mm */);
      chassis.turnDegrees(/* DOLDUR: 90 */);
      if (chassis.turnDone()) { st = GRIPPER_OPEN; t0 = millis(); }
      break;
    case GRIPPER_OPEN:
      gripperOpen();
      if (millis() - t0 > /* DOLDUR: 500–800 ms */) { st = DONE; }
      break;
    default:
      break;
  }
}
```

Not: Güvenlik kilitlerini koruyun. Örneğin slider hareketi için çarpışma alanlarını kontrol edin; shooter hazır olmadan besleme yapmayın; limit switch tetiklenirse ilgili motoru durdurun. 

## Sonraki Adımlar
Doğrulanmış bir örnek mod, maç stratejinizi hızla çeşitlendirmenizi sağlar. Devamında çoklu mod seçimi, saha içi presetler ve alt sistem koordinasyonuyla farklı senaryolara güvenle uyum sağlarsınız.

<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 94%; background: linear-gradient(90deg, #24a646, #24a646)"></div>
  </div>
  <div class="progress__label">Örnek Otonom İlerleme: %94</div>
</div> 
