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
#include <probot/controllers/BasicTankDrive.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>
// Slider için varsayımsal probot arayüzü
#include <probot/controllers/Slider.hpp>

// Şasi ve slider
static BoardozaRawMotorDriver     leftHW(/* DOLDUR: pin/kanal */);
static BoardozaRawMotorDriver     rightHW(/* DOLDUR: pin/kanal */);
static probot::motor::MotorHandle leftMotor(leftHW);
static probot::motor::MotorHandle rightMotor(rightHW);
static probot::controllers::BasicTankDrive chassis(&leftMotor, &rightMotor);
static probot::controllers::Slider        slider(/* DOLDUR: parametreler */);

// Intake (tek motor)
BoardozaMotorDriver intakeMotor(/* DOLDUR: pin/kanal */);
inline void setIntake(int16_t power){ intakeMotor.setPower(power); } // öneri: −1000..+1000

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
  setIntake(0);
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
      if (!intakeOn) { setIntake(/* DOLDUR: içeri güç (örn. 300–600) */); intakeOn = true; }
      chassis.driveDistance(/* DOLDUR: cm (örn. 80) */);
      if (chassis.distanceDone()) { setIntake(0); intakeOn = false; st = TURN_90; t0 = millis(); }
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
Buraya kadar şasi, intake, slider ve gripper ile çalışan bir otonom iskeleti kurdunuz. Önce adımları tek tek doğruladık; sonra bazı işleri aynı anda yaparak akışı hızlandırdık. Artık top sizde!

Kendi saha senaryonuza göre mesafeleri, açıları ve süreleri doldurun; basit başlayın, küçük dokunuşlarla iyileştirin. Küçük bir saha maketi kurmayı unutmayın; orada test ettiğiniz her küçük adım maçta size saniye kazandırır.

Bir hata gördünüz mü? Korkmayın. Adımı kısa tutun, tolerans ekleyin, süre aşımında güvenli geçiş yapın. Otonom bittiğinde tüm alt sistemleri sakin bir şekilde kapatıp teleop’a tertemiz geçin.

Fikirleriniz, istekleriniz ve sorularınız için kapımız açık. Bize yazın veya GitHub Issues üzerinden bildirin: [GitHub Issues](https://github.com/tunapro1234/probot-lib/issues).

Şimdi sahaya! İyi şanslar, bol puanlar ve keyifli maçlar!

<div class="progress progress--success">
  <div class="progress__track">
    <div class="progress__bar" style="width: 94%; background: linear-gradient(90deg, #86efac, #16a34a)"></div>
  </div>
  <div class="progress__label">Örnek Otonom İlerleme: %94</div>
</div> 