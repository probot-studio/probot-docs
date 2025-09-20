---
title: Örnekler
---

# Örnekler 

## Bu Sayfada Ne Anlatıyoruz?
Bu sayfada pratik örneklere ve ilgili doküman bağlantılarına yer vermeyi hedefliyoruz. Bölüm ilerledikçe küçük, çalışır örnekleri burada toplayacağız.

## Sonraki Adımlar
Örnekler büyüdükçe ekip içinde öğrenme ve tekrar kullanım kolaylaşır; ortak kalıplar standardize edilir. Devamında bu örnekleri kendi robotunuza uyarlayarak geliştirme hızınızı artırırsınız.

## Örnek Kodlar

### BasicTankDrive
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/sim/null_encoder.hpp>
// Not: Donanımı bağlayana kadar NullMotor/NullEncoder kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuları gerçek sürücülerle (örn. NFRMotor) değiştirin.
// Desteklenen sürücüler için: https://docs.probotstudio.com/

// Bu örnek, tank şasi (BasicTankDrive) ile teleop sürüşünü gösterir.
// Sol çubuk Y sol teker, sağ çubuk Y sağ teker hızını belirler.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static const probot::control::PidConfig kPidCfg{ .kp=200.0f, .ki=0.0f, .kd=0.0f, .out_min=-1000.0f, .out_max=1000.0f };
static probot::control::PID pidL(kPidCfg), pidR(kPidCfg);
static probot::sensors::NullEncoder leftEnc, rightEnc;   // yer tutucu
static probot::motor::NullMotor     leftHW, rightHW;     // yer tutucu
static probot::controllers::ClosedLoopMotor left(&leftEnc, &pidL, &leftHW, 1.0f, 1.0f);
static probot::controllers::ClosedLoopMotor right(&rightEnc, &pidR, &rightHW, 1.0f, 1.0f);
static probot::controllers::BasicTankDrive  chassis(&left, &right);

void robotInit() {
  Serial.println("[TankTeleop] robotInit: Tank sürüşü");
  // Örnek bağlama (gerçek sürücüler ile değiştirin):
  // chassis.setWheelCircumference(31.4f);
  // chassis.setTrackWidth(25.0f);
}

void robotEnd() {
  Serial.println("[TankTeleop] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[TankTeleop] teleopInit: Joystick ile tank sürüş");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float left_axis  = js.getLeftY();  // sol Y
  float right_axis = js.getRightY(); // sağ Y

  float max_vel = 100.0f; // birim/s örnek
  chassis.setVelocity(left_axis*max_vel, right_axis*max_vel);
  chassis.update(millis(), 20);
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### JoystickTest
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>

// Bu örnek, web arayüzünden gelen joystick verilerini okuyup
// Serial Monitör'e yazdırır.
// Not: Artık joystick verisi her durumda gönderilir.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.println("[JoystickTest] robotInit: Başlatılıyor");
}

void robotEnd() {
  Serial.println("[JoystickTest] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[JoystickTest] teleopInit: Yeni joystick_api ile test");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  Serial.printf("[JoystickTest] seq=%lu axes=%lu buttons=%lu\n",
                (unsigned long)js.getSeq(),
                (unsigned long)js.getAxisCount(),
                (unsigned long)js.getButtonCount());

  Serial.printf("  L(%.2f, %.2f)  R(%.2f, %.2f)  LT=%.0f RT=%.0f  POV=%d\n",
                js.getLeftX(), js.getLeftY(),
                js.getRightX(), js.getRightY(),
                js.getLeftTriggerAxis(), js.getRightTriggerAxis(),
                js.getPOV());

  // Ham eksen/tuş örneği
  if (js.getAxisCount() > 0) {
    Serial.printf("  raw axis[0]=%.2f\n", js.getRawAxis(0));
  }
  if (js.getButtonCount() > 0) {
    Serial.printf("  raw button[0]=%s\n", js.getRawButton(0) ? "ON" : "OFF");
  }

  delay(150);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### MotorTest
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/devices/motors/motor_handle.hpp>
// Not: Donanımı bağlayana kadar NullMotor kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuyu gerçek sürücülerle (örn. NFRMotor) değiştirin.
// Desteklenen sürücüler için: https://docs.probotstudio.com/

// Bu örnek, joystick'ten gelen bir eksen değerini (-1..1)
// ham motor gücüne (PWM ölçeği -1000..1000) direkt olarak eşler.
// Amaç: Motor bağlantısını test etmek ve yön/invert kontrolünü doğrulamak.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static probot::motor::NullMotor motorHW;           // yer tutucu; gerçek sürücü ile değiştirin
static probot::motor::MotorHandle motor(motorHW);  // sahipliği içeride yönetir

void robotInit() {
  Serial.println("[MotorTest] robotInit: Motor testi başlıyor");
}

void robotEnd() {
  motor.setPower(0);
  Serial.println("[MotorTest] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[MotorTest] teleopInit: Joystick ekseni motora güç olarak yazılacak");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY(); // Örn: sol çubuk Y
  int16_t power = (int16_t)(axis * 1000.0f);
  motor.setPower(power);
  Serial.printf("[MotorTest] axis=%.2f power=%d\n", axis, (int)power);
  delay(50);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### EncoderTest
```cpp
#include <probot.h>
#include <probot/sim/null_encoder.hpp>

// Bu örnek, enkoder değerlerini (tik ve hız) Serial Monitör'e yazdırır.
// Donanımı bağlayana kadar NullEncoder kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuyu gerçek enkoder sürücüsüyle değiştirin.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static probot::sensors::NullEncoder encoderHW; // yer tutucu; gerçek sürücü ile değiştirin

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
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/sim/null_encoder.hpp>
// Not: Donanımı bağlayana kadar NullMotor/NullEncoder kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuları gerçek sürücülerle (örn. NFRMotor) değiştirin.
// Desteklenen sürücüler için: https://docs.probotstudio.com/

// Bu örnek, Slider nesnesini D-Pad ile 10/20/30/40 cm hedeflerine taşımayı dener.
// Slider, bir ClosedLoopMotor üzerinden konum modunda sürülür.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static const probot::control::PidConfig kPidCfg{ .kp=200.0f, .ki=0.0f, .kd=0.0f, .out_min=-1000.0f, .out_max=1000.0f };
static probot::control::PID pid(kPidCfg);
static probot::sensors::NullEncoder encHW;  // yer tutucu
static probot::motor::NullMotor     motHW;  // yer tutucu
static probot::controllers::ClosedLoopMotor clm(&encHW, &pid, &motHW, 1.0f, 1.0f);
static probot::controllers::Slider  slider(&clm);

void robotInit() {
  Serial.println("[SliderTest] robotInit: Slider testi");
  // slider.setLengthToTicks(...);
}

void robotEnd() {
  Serial.println("[SliderTest] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[SliderTest] teleopInit: D-Pad ile 10/20/30/40 cm hedefleri");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Basit D-Pad: Up/Down/Left/Right (POV 0/180/270/90)
  int pov = js.getPOV();
  bool up    = (pov == 0);
  bool down  = (pov == 180);
  bool left  = (pov == 270);
  bool right = (pov == 90);

  if (up)    { slider.setTargetLength(10.0f); Serial.println("[SliderTest] Hedef: 10 cm"); }
  if (down)  { slider.setTargetLength(20.0f); Serial.println("[SliderTest] Hedef: 20 cm"); }
  if (left)  { slider.setTargetLength(30.0f); Serial.println("[SliderTest] Hedef: 30 cm"); }
  if (right) { slider.setTargetLength(40.0f); Serial.println("[SliderTest] Hedef: 40 cm"); }

  slider.update(millis(), 20);
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### TankDriveAuto
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/sim/null_encoder.hpp>

// Bu örnek, tank sürüş şasesi için basit bir otonom senaryoyu gösterir.
// Sırasıyla: X cm ileri git, Y derece dön, tekrar X cm ileri git gibi bir akış.
// driveDistance ve turnDegrees komutları konum hedeflerini gönderir.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static const probot::control::PidConfig kPidCfg{ .kp=200.0f, .ki=0.0f, .kd=0.0f, .out_min=-1000.0f, .out_max=1000.0f };
static probot::control::PID pidL(kPidCfg), pidR(kPidCfg);
static probot::sensors::NullEncoder leftEnc, rightEnc;
static probot::motor::NullMotor     leftHW, rightHW;
static probot::controllers::ClosedLoopMotor left(&leftEnc, &pidL, &leftHW, 1.0f, 1.0f);
static probot::controllers::ClosedLoopMotor right(&rightEnc, &pidR, &rightHW, 1.0f, 1.0f);
static probot::controllers::BasicTankDrive  chassis(&left, &right);

static uint32_t g_step = 0;
static uint32_t g_last_ms = 0;

void robotInit() {
  Serial.println("[TankAuto] robotInit");
  // chassis.setWheelCircumference(...); chassis.setTrackWidth(...);
}

void robotEnd() { Serial.println("[TankAuto] robotEnd"); }

void teleopInit() { Serial.println("[TankAuto] teleopInit"); }
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float left_axis  = js.getLeftY();
  float right_axis = js.getRightY();
  chassis.setVelocity(left_axis*100.0f, right_axis*100.0f);
  chassis.update(millis(), 20);
  delay(20);
}

void autonomousInit() { Serial.println("[TankAuto] autonomousInit"); }
void autonomousLoop() {
  chassis.driveDistance(50.0f);
  delay(1000);
}
```

### ClosedLoopMotorTest
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/sim/null_encoder.hpp>
// Not: Donanımı bağlayana kadar NullMotor/NullEncoder kullanabilirsiniz (yer tutucu).
// Gerçek projede bu yer tutucuları gerçek sürücülerle (örn. NFRMotor) değiştirin.
// Desteklenen sürücüler için: https://docs.probotstudio.com/

// Bu örnek, kapalı çevrim (ClosedLoopMotor) bir motoru joystick ile sürer.
// Sol çubuk Y ekseni hız referansı, D-Pad (ör. butonlar) ise mod geçişi gibi kullanılabilir.

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static probot::sensors::NullEncoder encoderHW;   // yer tutucu
static probot::motor::NullMotor     motorHW;     // yer tutucu
static const probot::control::PidConfig kPidCfg{ .kp=200.0f, .ki=0.0f, .kd=0.0f, .out_min=-1000.0f, .out_max=1000.0f };
static probot::control::PID         pid(kPidCfg);
static probot::controllers::ClosedLoopMotor clm(&encoderHW, &pid, &motorHW, 1.0f, 1.0f);

void robotInit() {
  Serial.println("[CLMTest] robotInit: ClosedLoopMotor testi");
}

void robotEnd() {
  Serial.println("[CLMTest] robotEnd: Bitti");
}

void teleopInit() {
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[CLMTest] teleopInit: Joystick ile hız/konum kontrolü");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY(); // sol çubuk Y
  float vel_ref = axis * 100.0f; // örnek: 100 birim/s maksimum hız
  clm.setSetpoint(vel_ref, probot::controllers::ControlType::kVelocity);
  clm.update(millis(), 20);
  Serial.printf("[CLMTest] vel_ref=%.2f\n", vel_ref);
  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

### FullRobotDemo
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/sim/null_motor.hpp>
#include <probot/sim/null_encoder.hpp>
#include <probot/devices/motors/motor_handle.hpp>

// Bu örnek, daha tamamlanmış bir robot iskeleti gösterir:
// - TankDrive şasi (teleop + otonom)
// - Intake (içeri alma) ve Shooter (fırlatma)
// - İki adet Slider ile tırmanma mekanizması (aç/kapa senaryosu)
// Not: NullMotor/NullEncoder yer tutucu (no-op) sürücülerdir.
// Gerçek projede bunları gerçek sürücülerle (örn. NFRMotor) değiştirin.
// Desteklenen motorlar için: https://docs.probotstudio.com/

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

// --- Dosya-üstü kurulum (sıralı, güvenli) ---
static const probot::control::PidConfig kPidCfg{ .kp=200.0f, .ki=0.0f, .kd=0.0f, .out_min=-1000.0f, .out_max=1000.0f };
static probot::control::PID pidL(kPidCfg), pidR(kPidCfg);
static probot::sensors::NullEncoder leftEnc, rightEnc;   // yer tutucu
static probot::motor::NullMotor   leftHW, rightHW;       // yer tutucu
static probot::controllers::ClosedLoopMotor left(&leftEnc, &pidL, &leftHW, 1.0f, 1.0f);
static probot::controllers::ClosedLoopMotor right(&rightEnc, &pidR, &rightHW, 1.0f, 1.0f);
static probot::controllers::BasicTankDrive chassis(&left, &right);

// Tırmanma sliderları (örnek amaçlı aynı motor/encoder ile)
static probot::controllers::Slider sliderL(&left);
static probot::controllers::Slider sliderR(&right);

// Intake/Shooter (no-op); gerçek projede gerçek motorla değiştirin
static probot::motor::NullMotor intakeHW;
static probot::motor::NullMotor shooterHW;
static probot::motor::MotorHandle intake(intakeHW);
static probot::motor::MotorHandle shooter(shooterHW);

// Tuş atamaları (UI tarafındaki buton indeksleri örnektir)
static const int BTN_INTAKE_IN   = 0; // A
static const int BTN_SHOOT       = 1; // B
static const int BTN_CLIMB_OPEN  = 8; // LB
static const int BTN_CLIMB_CLOSE = 9; // LT

// Otonom senaryo adımları
static uint32_t g_autoStep = 0;
static uint32_t g_autoMs   = 0;

void robotInit(){
  Serial.println("[FullRobot] robotInit: Başlatılıyor");
  // Örn: chassis.setWheelCircumference(31.4f); chassis.setTrackWidth(25.0f);
}

void robotEnd(){
  intake.setPower(0);
  shooter.setPower(0);
  Serial.println("[FullRobot] robotEnd: Bitti");
}

static void handleIntakeAndShooter(const probot::io::joystick_api::Joystick& js){
  bool intake_in  = js.getRawButton(BTN_INTAKE_IN);
  bool shoot_btn  = js.getRawButton(BTN_SHOOT);
  intake.setPower(intake_in ? 800 : 0);
  shooter.setPower(shoot_btn ? 1000 : 0);
}

static void handleClimb(const probot::io::joystick_api::Joystick& js){
  bool open  = js.getRawButton(BTN_CLIMB_OPEN);
  bool close = js.getRawButton(BTN_CLIMB_CLOSE);

  if (open){
    sliderL.setTargetLength(40.0f); sliderR.setTargetLength(40.0f);
    uint32_t t0 = millis(); while (millis()-t0 < 2000){ sliderL.update(millis(), 20); sliderR.update(millis(), 20); delay(20);} 
    sliderL.setTargetLength(0.0f);  sliderR.setTargetLength(0.0f);
  }
  if (close){
    sliderL.setTargetLength(0.0f); sliderR.setTargetLength(0.0f);
  }

  sliderL.update(millis(), 20);
  sliderR.update(millis(), 20);
}

void teleopInit(){
  // Mapping değiştirmek için (varsayılan: "logitech-f310"):
  // probot::io::joystick_mapping::setActiveByName("standard");
  // probot::io::joystick_mapping::setActiveByName("logitech-f310");
  // probot::io::joystick_mapping::setActiveByName("axis9-dpad");
  Serial.println("[FullRobot] teleopInit: Tank sürüş + intake/shooter + climb");
}

void teleopLoop(){
  auto js = probot::io::joystick_api::makeDefault();
  float left_axis  = js.getLeftY();
  float right_axis = js.getRightY();
  float max_vel = 100.0f;
  chassis.setVelocity(left_axis*max_vel, right_axis*max_vel);
  chassis.update(millis(), 20);
  handleIntakeAndShooter(js);
  handleClimb(js);
  delay(20);
}

void autonomousInit(){
  Serial.println("[FullRobot] autonomousInit: Otonom başlayacak");
  g_autoStep = 0; g_autoMs = millis();
}

void autonomousLoop(){
  uint32_t now = millis();
  switch (g_autoStep){
    case 0:
      Serial.println("[FullRobot/Auto] 1) 50 cm ileri");
      chassis.driveDistance(50.0f);
      g_autoStep=1; g_autoMs=now; break;
    case 1:
      if (now - g_autoMs > 3000){
        Serial.println("[FullRobot/Auto] 2) Shooter çalıştır");
        shooter.setPower(1000);
        g_autoStep=2; g_autoMs=now;
      }
      break;
    case 2:
      if (now - g_autoMs > 2000){
        Serial.println("[FullRobot/Auto] 3) Shooter durdur");
        shooter.setPower(0);
        g_autoStep=3; g_autoMs=now;
      }
      break;
    case 3:
      if (now - g_autoMs > 500){
        Serial.println("[FullRobot/Auto] 4) 30 cm ileri");
        chassis.driveDistance(30.0f);
        g_autoStep=4; g_autoMs=now;
      }
      break;
    default:
      break;
  }
  delay(20);
}
```

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 100%; background: linear-gradient(90deg, #16a34a, #16a34a)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %100</div>
</div> 