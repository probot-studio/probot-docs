---
title: Örnekler
---

# Örnekler

## Başlarken
Bu sayfa, `probot-lib` kütüphanesinin ana örneklerini betiklerken hangi problemi çözdüklerini, nasıl yapılandırıldıklarını ve sahada hangi testlere yardımcı olduklarını anlatır. Her örnek `examples/<OrnekAdi>/<OrnekAdi>.ino` altında bulunur ve aynı klasör yapısı hem bu depoda (`probot-lib-2`) hem de çalışma kopyamız olan `../probot-lib` içinde korunur. Bu doküman, `../probot-lib/examples` dizinindeki güncel kaynakları baz alır.

Örnekleri denemeden önce:
- Kartınızı USB veya Wi-Fi üzerinden sürücü istasyonuna bağlayın.
- `platformio.ini` ya da kullandığınız IDE ayarlarında kart hedefini seçin.
- Pin eşleşmelerini kendi kablo tesisatınıza göre güncelleyin; dosyadaki pinler referans niteliğindedir.
- Çoğu örnek `PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234")` makrosuyla sürücü istasyonuna şifre gönderir. Kendi takımınızın şifresi farklıysa güncelleyin.

Her bölümde üç soruya yanıt vermeye çalıştık:
1. **Ne yapar?** – Senaryonun hedefi nedir?
2. **Nasıl yapar?** – Hangi sınıf/arabirimlerle problemi çözer?
3. **Neden böyle?** – Uygulamada hangi kontrol, güvenlik veya debug ihtiyacını karşılar?

## Örnekler
### AutonomousDemo – Basit Otonom Görev Akışı
- **Ne yapar?** Tank şasinizi zaman tabanlı dört adımdan (ileri, dur, 90° dönüş, hedefe itiş) geçirir.
- **Nasıl yapar?** `probot::drive::BasicTankDrive` ile iki `ClosedLoopMotor` nesnesini sürer. Her motor VNH tabanlı sürücü (`BoardozaVNHMotorDriver`) ve sahte enkoder (`NullEncoder`) ile kuruludur. Otonom döngüsü, `enum class AutoStep` ve milis zaman damgaları kullanarak adım ilerletir.
- **Neden böyle?** Öğrencilerin joystick olmadan da robotu hareket ettirebileceğini görselleştirir. Gerçek enkoder takıldığında `driveDistance` ve `turnDegrees` fonksiyonları kapalı çevrim görevleri yerine getirir; enkodersiz kullanımda dahi zamanlama tabanlı prototip yapılabilir.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>
#include <probot/chassis/basic_tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>

// Otonom tank demo için iki adet VNH sürücüsü.
static constexpr int L_INA = 33;
static constexpr int L_INB = 34;
static constexpr int L_PWM = 35;
static constexpr int L_ENA = -1;
static constexpr int L_ENB = -1;

static constexpr int R_INA = 36;
static constexpr int R_INB = 37;
static constexpr int R_PWM = 38;
static constexpr int R_ENA = -1;
static constexpr int R_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver leftDriver(L_INA, L_INB, L_PWM, L_ENA, L_ENB);
static probot::motor::BoardozaVNHMotorDriver rightDriver(R_INA, R_INB, R_PWM, R_ENA, R_ENB);
static probot::sensors::NullEncoder          leftEncoder;
static probot::sensors::NullEncoder          rightEncoder;

static const probot::control::PidConfig      kPid{.kp = 0.32f, .ki = 0.015f, .kd = 0.0f, .kf = 0.0f,
                                                  .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pidLeft(kPid);
static probot::control::PID                  pidRight(kPid);
static probot::control::ClosedLoopMotor      motorLeft(&leftEncoder, &pidLeft, &leftDriver, 1.0f, 1.0f);
static probot::control::ClosedLoopMotor      motorRight(&rightEncoder, &pidRight, &rightDriver, 1.0f, 1.0f);
static probot::drive::BasicTankDrive         chassis(&motorLeft, &motorRight);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

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

  leftDriver.begin();
  rightDriver.begin();
  leftDriver.setBrakeMode(true);
  rightDriver.setBrakeMode(true);

  motorLeft.setTimeoutMs(0);
  motorRight.setTimeoutMs(0);

  chassis.setWheelCircumference(32.0f);
  chassis.setTrackWidth(29.0f);

  Serial.println("[AutonomousDemo] robotInit: Otonom örneği hazır");
}

void robotEnd() {
  chassis.setVelocity(0.0f, 0.0f);
  Serial.println("[AutonomousDemo] robotEnd: Motorlar durdu");
}

void teleopInit() {
  Serial.println("[AutonomousDemo] teleopInit: Bu örnekte teleop, tank sürüşü sağlar");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float left = js.getLeftY() * 100.0f;
  float right = js.getRightY() * 100.0f;
  chassis.setVelocity(left, right);
  chassis.update(millis(), 20);
  delay(20);
}

void autonomousInit() {
  Serial.println("[AutonomousDemo] autonomousInit: İleri -> Bekle -> 90° dön -> Hedefe git");
  g_step = AutoStep::kDriveForward;
  g_stepStart = millis();
  chassis.driveDistance(80.0f); // 80 cm ileri
}

void autonomousLoop() {
  uint32_t now = millis();

  switch (g_step) {
    case AutoStep::kDriveForward:
      if (now - g_stepStart > 2500) {
        g_step = AutoStep::kPause;
        g_stepStart = now;
        chassis.setVelocity(0.0f, 0.0f);
        Serial.println("[AutonomousDemo] Duraklama");
      }
      break;

    case AutoStep::kPause:
      if (now - g_stepStart > 800) {
        g_step = AutoStep::kTurn;
        g_stepStart = now;
        chassis.turnDegrees(90.0f);
        Serial.println("[AutonomousDemo] 90 derece dönüş başlıyor");
      }
      break;

    case AutoStep::kTurn:
      if (now - g_stepStart > 2200) {
        g_step = AutoStep::kDriveToGoal;
        g_stepStart = now;
        chassis.driveDistance(40.0f);
        Serial.println("[AutonomousDemo] Hedefe son itiş");
      }
      break;

    case AutoStep::kDriveToGoal:
      if (now - g_stepStart > 2000) {
        g_step = AutoStep::kFinished;
        chassis.setVelocity(0.0f, 0.0f);
        Serial.println("[AutonomousDemo] Otonom tamamlandı");
      }
      break;

    case AutoStep::kFinished:
    default:
      chassis.setVelocity(0.0f, 0.0f);
      break;
  }

  chassis.update(now, 20);
  delay(20);
}

```
### TankDriveDemo – Çift Joystick ile Teleop Tank Sürüşü
- **Ne yapar?** Teleop modunda sol/sağ joystick eksenlerini doğrudan şasi hızına eşler, otonomda kısa bir ileri–dön–ileri profili koşturur.
- **Nasıl yapar?** `BasicTankDrive::setVelocity` çağrıları üzerinden cm/s cinsinden hedef hız gönderir ve her döngüde `chassis.update(now, 20)` ile kapalı çevrim PID’leri çalıştırır. Seri log satırları, komut ile gerçek motor çıkışı arasındaki farkı gözlemlemeyi sağlar.
- **Neden böyle?** İlk sürüş testinde yönlerin doğru bağlandığını, PID sınırlarının aşılmadığını ve fren modlarının uygun ayarlandığını teyit etmek için idealdir.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>
#include <probot/chassis/basic_tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>

// Tank şasi için iki adet VNH sürücünün pin eşlemesi (örnek değerler).
static constexpr int LEFT_INA = 1;
static constexpr int LEFT_INB = 2;
static constexpr int LEFT_PWM = 3;
static constexpr int LEFT_ENA = -1;
static constexpr int LEFT_ENB = -1;

static constexpr int RIGHT_INA = 4;
static constexpr int RIGHT_INB = 5;
static constexpr int RIGHT_PWM = 6;
static constexpr int RIGHT_ENA = -1;
static constexpr int RIGHT_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver leftDriver(LEFT_INA, LEFT_INB, LEFT_PWM, LEFT_ENA, LEFT_ENB);
static probot::motor::BoardozaVNHMotorDriver rightDriver(RIGHT_INA, RIGHT_INB, RIGHT_PWM, RIGHT_ENA, RIGHT_ENB);
static probot::sensors::NullEncoder          leftEncoder;
static probot::sensors::NullEncoder          rightEncoder;

static const probot::control::PidConfig      kPidCfg{.kp = 0.28f, .ki = 0.01f, .kd = 0.0f, .kf = 0.0f,
                                                     .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pidLeft(kPidCfg);
static probot::control::PID                  pidRight(kPidCfg);
static probot::control::ClosedLoopMotor      motorLeft(&leftEncoder, &pidLeft, &leftDriver, 1.0f, 1.0f);
static probot::control::ClosedLoopMotor      motorRight(&rightEncoder, &pidRight, &rightDriver, 1.0f, 1.0f);
static probot::drive::BasicTankDrive         chassis(&motorLeft, &motorRight);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  leftDriver.begin();
  rightDriver.begin();
  leftDriver.setBrakeMode(true);
  rightDriver.setBrakeMode(true);

  motorLeft.setTimeoutMs(0);
  motorRight.setTimeoutMs(0);

  chassis.setWheelCircumference(31.4f);  // örnek teker çapı ayarı
  chassis.setTrackWidth(28.0f);          // örnek şasi genişliği

  Serial.println("[TankDriveDemo] robotInit: Tank şasi hazır");
}

void robotEnd() {
  chassis.setVelocity(0.0f, 0.0f);
  motorLeft.setPowerDirect(0.0f);
  motorRight.setPowerDirect(0.0f);
  Serial.println("[TankDriveDemo] robotEnd: Motorlar kapandı");
}

void teleopInit() {
  Serial.println("[TankDriveDemo] teleopInit: Sol/Sağ joystick ile tank sürüşü");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float leftCmd = js.getLeftY() * 120.0f;   // cm/s cinsinden hedef hız
  float rightCmd = js.getRightY() * 120.0f;

  chassis.setVelocity(leftCmd, rightCmd);

  uint32_t now = millis();
  chassis.update(now, 20);

  Serial.printf("[TankDriveDemo] left=%.1f right=%.1f outL=%.2f outR=%.2f\n",
                leftCmd, rightCmd,
                motorLeft.lastOutput(), motorRight.lastOutput());

  delay(20);
}

void autonomousInit() {
  Serial.println("[TankDriveDemo] autonomousInit: 3 adımda ilerleme testi");
}

void autonomousLoop() {
  static uint32_t stateStart = millis();
  static int state = 0;

  uint32_t now = millis();
  switch (state) {
    case 0: // 1 metre ileri
      chassis.driveDistance(100.0f);
      stateStart = now;
      state = 1;
      break;
    case 1:
      if (now - stateStart > 3000) {
        chassis.turnDegrees(90.0f);
        stateStart = now;
        state = 2;
      }
      break;
    case 2:
      if (now - stateStart > 2500) {
        chassis.driveDistance(50.0f);
        state = 3;
      }
      break;
    default:
      chassis.setVelocity(0.0f, 0.0f);
      break;
  }

  chassis.update(now, 20);
  delay(20);
}

```
### JoystickTest – Gamepad Yeteneği Sağlık Kontrolü
- **Ne yapar?** Web arayüzünden gelen joystick eksen ve butonlarını okur, aynı anda tek bir VNH motoru doğrudan sürer.
- **Nasıl yapar?** `probot::io::joystick_api::makeDefault()` ile standart eşlemeyi kullanır. Sol çubuk Y eksenini `ClosedLoopMotor::setPowerDirect` ile motora iletir, seri logda okunan eksen değerini ve gönderilen komutu birlikte gösterir.
- **Neden böyle?** Hem driver station bağlantısının canlı olduğunu hem de PWM doğrultma sürücünüzün doğru yönde tepki verdiğini hızlıca doğrularsınız.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>

// Pin atamalarını kendi kartınıza göre güncelleyin.
static constexpr int PIN_INA = 47;
static constexpr int PIN_INB = 46;
static constexpr int PIN_PWM = 48;
static constexpr int PIN_ENA = -1; // EN pinleri 3V3'e bağlıysa -1 bırakmak yeterli.
static constexpr int PIN_ENB = -1;

// Tüm örneklerde aynı temel motor-stub setini kullanıyoruz.
static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kPid{.kp = 0.25f, .ki = 0.0f, .kd = 0.0f, .kf = 0.0f,
                                                  .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kPid);
static probot::control::ClosedLoopMotor      controller(&encoder, &pid, &motor, 1.0f, 1.0f);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  // Kart ve sürücüyü hazırla.
  motor.begin();
  motor.setBrakeMode(true);         // boşta tam fren uygula
  controller.setSetpoint(0.0f, probot::control::ControlType::kPercent);

  Serial.println("[JoystickTest] robotInit: Joystick ve motor izleme başlatıldı");
}

void robotEnd() {
  controller.setPowerDirect(0.0f);  // çıkışları güvenle sıfırla
  Serial.println("[JoystickTest] robotEnd: Motor sıfırlandı");
}

void teleopInit() {
  Serial.println("[JoystickTest] teleopInit: Ekseni okuyup motora aktaracağız");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Sol çubuk Y eksenini oku (varsayılan eşleme).
  float axis = js.getLeftY();

  // Okuduğumuz değeri doğrudan motora gönderiyoruz.
  controller.setPowerDirect(axis);

  // Seri log ile joystick verisini ve motor komutunu gözlemleyin.
  Serial.printf("[JoystickTest] seq=%lu axisY=%.2f motorCmd=%.2f\n",
                static_cast<unsigned long>(js.getSeq()),
                axis,
                controller.lastOutput());

  delay(50);
}

void autonomousInit() {
  Serial.println("[JoystickTest] autonomousInit: Bu örnek otonomda motoru durdurur");
  controller.setPowerDirect(0.0f);
}

void autonomousLoop() {
  // Joystick okumadığımız için otonomda motoru sıfırda tutuyoruz.
  controller.update(millis(), 20);
  delay(20);
}

```
### LoggingDemo – Seri + Wi-Fi Telemetri Pratiği
- **Ne yapar?** Bir logging kaynağı kaydeder, her 500 ms’de artan sayaç ve çalışma süresi yayımlar, hem seri porttan hem Wi-Fi üzerinden gözlemlenebilir hale getirir.
- **Nasıl yapar?** `probot::logging::configureDefaults()` ile altyapıyı hazırlar; `SourceRegistration` yapısını doldurur, `manager.enqueueValue` çağrılarıyla iki integer değer yollar. `demoStaticInfo` fonksiyonu, statik telemetri anlık görüntüsü sağlar.
- **Neden böyle?** Öğrencilere logging’in temellerini (kaynak kaydı, öncelik seviyeleri, seri vs Wi-Fi aktarımı) deneyimletir. Ağ bağlantısı olmadığı durumda bile serial monitor üzerinden ham çerçeveler analiz edilebilir.
```cpp
/**
 * LoggingDemo.ino
 *
 * Quick check for the serial/Wi-Fi logging stack.  Registers a demo source,
 * pushes a heartbeat counter every 500 ms, and exposes a static snapshot. Use
 * the driver station UI (minimal stack) to see Wi-Fi log streaming, or watch
 * the binary frames on the serial monitor.
 */

#include <Arduino.h>
#include <probot.h>

namespace {

struct DemoSource {
  const probot::logging::SourceRegistration* reg{nullptr};
  uint32_t boot_ms{0};
  uint32_t counter{0};
} demo;

void demoStaticInfo(const void* object,
                    probot::logging::TelemetryCollector& collector) {
  auto src = static_cast<const DemoSource*>(object);
  collector.addInt("boot_ms", src->boot_ms, probot::logging::Priority::kSystemCritical);
  collector.addString("note", "Demo static snapshot", probot::logging::Priority::kUserMarked);
}

void publishCounter(uint32_t now_ms) {
  if (!demo.reg) return;
  demo.counter++;
  auto& mgr = probot::logging::manager();
  mgr.enqueueValue(*demo.reg,
                   &demo,
                   "counter",
                   probot::logging::ValueType::kInt,
                   probot::logging::Priority::kUserMarked,
                   static_cast<int32_t>(demo.counter),
                   0.0f,
                   false,
                   nullptr,
                   now_ms);
  mgr.enqueueValue(*demo.reg,
                   &demo,
                   "uptime_ms",
                   probot::logging::ValueType::kInt,
                   probot::logging::Priority::kBackground,
                   static_cast<int32_t>(now_ms),
                   0.0f,
                   false,
                   nullptr,
                   now_ms);
}

} // namespace

static uint32_t last_publish_ms = 0;

void robotInit(){
  Serial.begin(115200);
  delay(200);

  probot::logging::configureDefaults();
  probot::logging::enableSerialLogging(true);
  probot::logging::setSerialBandwidthMode(probot::logging::BandwidthMode::kNormal);
  probot::logging::enableWifiLogging(true);
  probot::logging::setWifiStreamingEnabled(true);

  demo.boot_ms = millis();

  probot::logging::SourceRegistration reg{
    "demo",
    "logging",
    probot::logging::Priority::kUserMarked,
    true,
    true,
    nullptr,
    demoStaticInfo
  };
  demo.reg = probot::logging::registerSource(&demo, reg);

  Serial.println();
  Serial.println(F("[LoggingDemo] Logging configured. Check the driver UI"));
}

void robotEnd(){
  if (demo.reg){
    probot::logging::unregisterSource(&demo);
    demo.reg = nullptr;
  }
}

void teleopInit(){
  last_publish_ms = millis();
}

void teleopLoop(){
  uint32_t now = millis();
  if (now - last_publish_ms >= 500){
    publishCounter(now);
    last_publish_ms = now;
  }
  vTaskDelay(pdMS_TO_TICKS(5));
}

void autonomousInit(){
  teleopInit();
}

void autonomousLoop(){
  teleopLoop();
}

```
### MotorControllerDemo – Kapalı Çevrim Mod Seçimi
- **Ne yapar?** Sol joystick ekseni ile motor hız/percent referansını sürer, A butonuyla modlar arasında geçiş yapar, otonomda kısa bir hız profili uygular.
- **Nasıl yapar?** `ClosedLoopMotor` örneği `ControlType::kVelocity` ve `ControlType::kPercent` arasında runtime geçiş yapar. `controller.setTimeoutMs(0)` joystick bırakıldığında motorun aniden durmasını engeller. Seri log, hedef, ölçüm ve çıkış değerlerini birlikte yazar.
- **Neden böyle?** PID ayarı veya sürücü davranışı üzerinde çalışırken öğrencilerin modlar arasındaki farkı sezgisel olarak görmesini sağlar. Aynı motoru farklı kontrol tipleriyle sürme altyapısını test eder.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>

// Kullanılan Boardoza VNH sürücü pinleri (kendi kartınıza göre güncelleyin).
static constexpr int PIN_INA = 9;
static constexpr int PIN_INB = 10;
static constexpr int PIN_PWM = 11;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kVelocityPid{.kp = 0.35f, .ki = 0.02f, .kd = 0.0f,
                                                          .kf = 0.0f, .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kVelocityPid);
static probot::control::ClosedLoopMotor      controller(&encoder, &pid, &motor, 1.0f, 1.0f);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

static probot::control::ControlType g_mode = probot::control::ControlType::kVelocity;

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);

  controller.setTimeoutMs(0); // joystick bırakıldığında çıkış sıfırlanmasın
  controller.setSetpoint(0.0f, g_mode);

  Serial.println("[MotorControllerDemo] robotInit: Kapalı çevrim denemesi için hazır");
}

void robotEnd() {
  controller.setPowerDirect(0.0f);
  Serial.println("[MotorControllerDemo] robotEnd: Motor kapatıldı");
}

void teleopInit() {
  Serial.println("[MotorControllerDemo] teleopInit:"
                 " sol eksen referans, A butonu mod değiştirir (yüzde/velocity)");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  if (js.getRawButton(0)) {
    g_mode = (g_mode == probot::control::ControlType::kVelocity)
               ? probot::control::ControlType::kPercent
               : probot::control::ControlType::kVelocity;
    controller.setSetpoint(0.0f, g_mode);
    Serial.printf("[MotorControllerDemo] Mod değişti: %s\n",
                  g_mode == probot::control::ControlType::kVelocity ? "HIZ" : "YÜZDE");
    delay(200); // buton debouncing
  }

  float axis = js.getLeftY();
  float target = axis * (g_mode == probot::control::ControlType::kVelocity ? 100.0f : 1.0f);
  controller.setSetpoint(target, g_mode);
  controller.update(millis(), 20);

  Serial.printf("[MotorControllerDemo] mode=%s target=%.2f measurement=%.2f out=%.2f\n",
                g_mode == probot::control::ControlType::kVelocity ? "VEL" : "PCT",
                target,
                controller.lastMeasurement(),
                controller.lastOutput());

  delay(20);
}

void autonomousInit() {
  Serial.println("[MotorControllerDemo] autonomousInit: 2 saniyelik hız profili");
  controller.setSetpoint(80.0f, probot::control::ControlType::kVelocity);
}

void autonomousLoop() {
  static uint32_t start = millis();
  controller.update(millis(), 20);
  if (millis() - start > 2000) {
    controller.setSetpoint(0.0f, probot::control::ControlType::kVelocity);
  }
  delay(20);
}

```
### MotorDriverDemo – Ham PWM ile Sürücü Kontrolü
- **Ne yapar?** Sol joystick eksenini doğrudan VNH motor sürücüsünün güç çıkışına bağlar, sağ tetikle motor yönünü tersler.
- **Nasıl yapar?** `BoardozaVNHMotorDriver::setPower` ve `setInverted` çağrılarını kullanır. `ClosedLoopMotor::setPowerDirect` yalnızca telemetri amaçlıdır, gerçek PWM’i `motor.setPower` verir.
- **Neden böyle?** Kapalı çevrim karmaşıklığı eklemeden önce kablolama, polarite ve sürücünün sağlıklı çalıştığından emin olmak için kullanılır. Öğrenciler tetikle invert kavramını öğrenir.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>

// Boardoza VNH sürücüsünü kullanırken kendi pinlerinizi mutlaka kontrol edin.
static constexpr int PIN_INA = 39;
static constexpr int PIN_INB = 40;
static constexpr int PIN_PWM = 41;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kPid{.kp = 0.30f, .ki = 0.0f, .kd = 0.0f, .kf = 0.0f,
                                                  .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kPid);
static probot::control::ClosedLoopMotor      controller(&encoder, &pid, &motor, 1.0f, 1.0f);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(false);  // sürücü serbest bırakıldı, coast modunda
  controller.setInverted(false);

  Serial.println("[MotorDriverDemo] robotInit: IMotorDriver arayüzünü test etmek için hazır");
}

void robotEnd() {
  motor.setPower(0.0f);
  Serial.println("[MotorDriverDemo] robotEnd: Motor durduruldu");
}

void teleopInit() {
  Serial.println("[MotorDriverDemo] teleopInit:"
                 " sol eksen gücü, sağ tetik ise yön tersleme yapar");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Sol çubuktan ham güç, sağ tetikten tersleme isteği okuyoruz.
  float power = js.getLeftY();
  bool invert = js.getRightTriggerAxis() > 0.5f;

  motor.setInverted(invert);

  // IMotorDriver doğrudan PWM uygular; ClosedLoopMotor'u sadece izleme için kullanıyoruz.
  motor.setPower(power);
  controller.setPowerDirect(power); // lastOutput() bilgisi için eşleştiriyoruz.

  Serial.printf("[MotorDriverDemo] power=%.2f invert=%d motorOut=%.2f\n",
                power, invert ? 1 : 0, controller.lastOutput());

  delay(40);
}

void autonomousInit() {
  Serial.println("[MotorDriverDemo] autonomousInit: Motoru yavaşça durduruyoruz");
}

void autonomousLoop() {
  motor.setPower(0.0f);
  controller.update(millis(), 20);
  delay(20);
}

```
### SliderDemo – Konumlu Lineer Mekanizma
- **Ne yapar?** D-Pad yönleriyle slider hedef uzunluklarını seçer, otonomda üç preset arasında dolaşır.
- **Nasıl yapar?** `probot::mechanism::Slider` sınıfı `ClosedLoopMotor` üzerinden konum kontrolü yapar. `slider.setLengthToTicks` ve `setLengthLimits` ile fiziksel ölçüler tanımlanmıştır. `controller.update` ve `slider.update` çağrıları döngüsel olarak yapılır.
- **Neden böyle?** Tırmanma ya da teleskopik mekanizmalarda güvenli aralıkları korumak, preset’ler arasında yumuşak geçişler yapmak için bu yapı gereklidir.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/mechanism/slider.hpp>

// Slider mekanizması için kullanılan VNH sürücü pinleri.
static constexpr int PIN_INA = 12;
static constexpr int PIN_INB = 13;
static constexpr int PIN_PWM = 14;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kPositionPid{.kp = 0.5f, .ki = 0.0f, .kd = 0.0f, .kf = 0.0f,
                                                          .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kPositionPid);
static probot::control::ClosedLoopMotor      controller(&encoder, &pid, &motor, 1.0f, 1.0f);
static probot::mechanism::Slider             slider(&controller);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);

  controller.selectDefaultSlot(probot::control::ControlType::kPosition, 0);
  controller.setPidSlotConfig(0, kPositionPid);
  controller.setSetpoint(0.0f, probot::control::ControlType::kPosition);

  slider.setLengthToTicks(200.0f);     // 1 cm için 200 encoder tıkı varsayalım
  slider.setLengthLimits(0.0f, 50.0f); // 0 - 50 cm arası güvenli bölge

  Serial.println("[SliderDemo] robotInit: Slider kontrolü hazır");
}

void robotEnd() {
  controller.setPowerDirect(0.0f);
  Serial.println("[SliderDemo] robotEnd: Motor sıfırlandı");
}

void teleopInit() {
  Serial.println("[SliderDemo] teleopInit:"
                 " D-pad ile 0/15/30/45 cm hedefleri seçilir");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  int pov = js.getPOV();

  if (pov == 0)   slider.setTargetLength(45.0f);  // yukarı
  if (pov == 90)  slider.setTargetLength(30.0f);  // sağ
  if (pov == 180) slider.setTargetLength(0.0f);   // aşağı
  if (pov == 270) slider.setTargetLength(15.0f);  // sol

  slider.update(millis(), 20);
  controller.update(millis(), 20);

  Serial.printf("[SliderDemo] hedef=%.1f cm ölçüm=%.1f cm çıkış=%.2f\n",
                slider.getTargetLength(),
                slider.getCurrentLength(),
                controller.lastOutput());

  delay(20);
}

void autonomousInit() {
  Serial.println("[SliderDemo] autonomousInit: 3 adımda preset dolaşımı");
}

void autonomousLoop() {
  static uint32_t stateStart = millis();
  static int state = 0;
  uint32_t now = millis();

  if (state == 0) {
    slider.setTargetLength(10.0f);
    stateStart = now;
    state = 1;
  } else if (state == 1 && now - stateStart > 1500) {
    slider.setTargetLength(40.0f);
    stateStart = now;
    state = 2;
  } else if (state == 2 && now - stateStart > 1500) {
    slider.setTargetLength(0.0f);
    state = 3;
  }

  slider.update(now, 20);
  controller.update(now, 20);
  delay(20);
}

```
### ShooterDemo – RPM Kontrollü Fırlatıcı
- **Ne yapar?** Sağ tetik gaz verip hedef RPM’e çıkarır, sol tetik fren yapar; otonomda iki saniyelik spool-up/durdur döngüsü gerçekleşir.
- **Nasıl yapar?** `probot::mechanism::nfr::NfrShooter` ile `ClosedLoopMotor` birlikte kullanılır. `setPrimaryRpm` çağrısı `ClosedLoopMotor`’un hız modunu hedefler, `setTicksPerRevolution` enkoder ölçeklemesini yapar.
- **Neden böyle?** Fırlatma mekanizmalarında RPM’i tutturmanın ve tetiklerle ani durdurma yapmanın pratiğini sunar. Log satırları hedef ve ölçülen hızların karşılaştırılmasını sağlar.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/mechanism/nfr/shooter.hpp>

// Shooter tekeri için Boardoza VNH pin konfigürasyonu.
static constexpr int PIN_INA = 15;
static constexpr int PIN_INB = 16;
static constexpr int PIN_PWM = 17;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kVelocityPid{.kp = 0.4f, .ki = 0.02f, .kd = 0.0f,
                                                          .kf = 0.0f, .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kVelocityPid);
static probot::control::ClosedLoopMotor      shooterMotor(&encoder, &pid, &motor, 1.0f, 1.0f);
static probot::mechanism::nfr::NfrShooter    shooter(&shooterMotor);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(false); // shooter çarkında coast tercihi yapılabilir

  shooterMotor.setTimeoutMs(0);
  shooterMotor.selectDefaultSlot(probot::control::ControlType::kVelocity, 0);
  shooterMotor.setPidSlotConfig(0, kVelocityPid);
  shooter.setTicksPerRevolution(4096.0f); // kullandığınız enkoder değerini girin
  shooter.setRpm(0.0f, 0.0f);

  Serial.println("[ShooterDemo] robotInit: Shooter kontrolü başlatıldı");
}

void robotEnd() {
  shooter.stop();
  Serial.println("[ShooterDemo] robotEnd: Teker kapatıldı");
}

void teleopInit() {
  Serial.println("[ShooterDemo] teleopInit:"
                 " sağ tetik hızlandırır, sol tetik fren yapar");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float accel = js.getRightTriggerAxis(); // 0..1
  float brake = js.getLeftTriggerAxis();  // 0..1

  float targetRpm = accel * 3200.0f;      // istenen maksimum RPM
  if (brake > 0.2f) targetRpm = 0.0f;     // fren tetiklendiğinde durdur

  shooter.setPrimaryRpm(targetRpm);
  shooterMotor.update(millis(), 20);

  Serial.printf("[ShooterDemo] hedef=%.0f rpm ölçüm=%.1f rpm çıkış=%.2f\n",
                targetRpm,
                shooterMotor.lastMeasurement(),
                shooterMotor.lastOutput());

  delay(20);
}

void autonomousInit() {
  Serial.println("[ShooterDemo] autonomousInit: 2 saniye spool, sonra durdur");
  shooter.setPrimaryRpm(3000.0f);
}

void autonomousLoop() {
  static uint32_t start = millis();
  shooterMotor.update(millis(), 20);
  if (millis() - start > 2000) {
    shooter.stop();
  }
  delay(20);
}

```
### TurretDemo – Açısal Presetli Taret
- **Ne yapar?** Sağ çubuk X eksenini ±90° hedef açıya map eder, B butonu turreti sıfırlar, otonomda üç preset arasında gezinir.
- **Nasıl yapar?** `probot::mechanism::Turret` sınıfı, `ClosedLoopMotor` ile pozisyon modunda çalışır. `setDegreesToTicks`, `setAngleLimits` ve `setSlewRateLimit` ile fiziksel sınırlar ve hız limiti tanımlıdır.
- **Neden böyle?** Öğrenciler hedef açı seçimini yumuşatma/kısıtlama ile birlikte öğrenir, ayrıca preset taraması ile otonom hedeflemeye giriş yapar.
```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/control/closed_loop_motor.hpp>
#include <probot/control/pid.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>
#include <probot/mechanism/turret.hpp>

// Taret döndürme motoru için Boardoza VNH pinleri.
static constexpr int PIN_INA = 30;
static constexpr int PIN_INB = 31;
static constexpr int PIN_PWM = 32;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver motor(PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::sensors::NullEncoder          encoder;
static const probot::control::PidConfig      kPositionPid{.kp = 0.6f, .ki = 0.0f, .kd = 0.0f,
                                                          .kf = 0.0f, .out_min = -1.0f, .out_max = 1.0f};
static probot::control::PID                  pid(kPositionPid);
static probot::control::ClosedLoopMotor      turretMotor(&encoder, &pid, &motor, 1.0f, 1.0f);
static probot::mechanism::Turret             turret(&turretMotor);

PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");

void robotInit() {
  Serial.begin(115200);
  delay(100);

  motor.begin();
  motor.setBrakeMode(true);

  turretMotor.selectDefaultSlot(probot::control::ControlType::kPosition, 0);
  turretMotor.setPidSlotConfig(0, kPositionPid);
  turretMotor.setTimeoutMs(0);

  turret.setDegreesToTicks(100.0f);       // encoder dönüşümünü kendi mekanizmanıza göre ayarlayın
  turret.setAngleLimits(-120.0f, 120.0f); // güvenli dönüş aralığı
  turret.setTargetAngleDeg(0.0f);
  turret.setSlewRateLimit(150.0f);        // hızlı bile olsa yumuşatma olsun

  Serial.println("[TurretDemo] robotInit: Taret kontrolü hazır");
}

void robotEnd() {
  turretMotor.setPowerDirect(0.0f);
  Serial.println("[TurretDemo] robotEnd: Taret durduruldu");
}

void teleopInit() {
  Serial.println("[TurretDemo] teleopInit:"
                 " sağ çubuk X hedef açıyı belirler, B butonu sıfırlar");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  if (js.getRawButton(1)) { // B butonu
    turret.setTargetAngleDeg(0.0f);
  } else {
    float stick = js.getRightX();        // -1..1
    turret.setTargetAngleDeg(stick * 90.0f); // ±90 derece
  }

  turret.update(millis(), 20);
  turretMotor.update(millis(), 20);

  Serial.printf("[TurretDemo] hedef=%.1f ölçüm=%.1f çıkış=%.2f\n",
                turret.getTargetAngleDeg(),
                turret.getCurrentAngleDeg(),
                turretMotor.lastOutput());

  delay(20);
}

void autonomousInit() {
  Serial.println("[TurretDemo] autonomousInit: Rastgele preset taraması");
}

void autonomousLoop() {
  static uint32_t stateStart = millis();
  static int state = 0;
  uint32_t now = millis();

  if (state == 0) {
    turret.setTargetAngleDeg(-60.0f);
    stateStart = now;
    state = 1;
  } else if (state == 1 && now - stateStart > 1500) {
    turret.setTargetAngleDeg(60.0f);
    stateStart = now;
    state = 2;
  } else if (state == 2 && now - stateStart > 1500) {
    turret.setTargetAngleDeg(0.0f);
    state = 3;
  }

  turret.update(now, 20);
  turretMotor.update(now, 20);
  delay(20);
}

```
### Autonomous + Logging Kombinasyonu – Şasi Takibi için Telemetri
- **Ne yapar?** Tank sürüşüne log kaynağı ekleyerek sürüş esnasında sol/sağ hız verisini Wi-Fi üzerinden toplamanın temellerini gösterir. (Bu senaryoyu oluşturmak için `AutonomousDemo` ve `LoggingDemo` kodlarını birleştirmeniz önerilir.)
- **Nasıl yapar?** `AutonomousDemo` içindeki `ClosedLoopMotor::lastOutput()` ve `BasicTankDrive::setVelocity` verileri `probot::logging::manager()` ile yeni bir kaynakta paylaşılabilir. Öğrenciler log kaynağına şasi parametrelerini (ör. hedef hız, gerçek çıkış) ekleyip UI’de canlı izlemeyi öğrenir.
- **Neden böyle?** Maç öncesi otonom denemelerinde robotun çizgi dışına sapmasını analiz etmek için log tasarımı yapılmasını teşvik eder. Logging’in yalnızca tekil demo olmadığını, gerçek senaryoya nasıl gömüleceğini anlatır.

## Çalıştırma İpuçları
- Örnekleri PlatformIO ile derlerken `lib_deps` satırının `probot-lib`’in bulunduğu klasöre işaret ettiğinden emin olun.
- Seri port loglarında Türkçe karakter kullanmamaya dikkat edin; IDE’nizde UTF-8 değilse kodlamada sorun çıkabilir.
- Enkoder yerine `NullEncoder` kullanıyorsanız `driveDistance`, `turnDegrees`, `setTargetLength` gibi fonksiyonlar hedefe varmayı simüle etmez. Fiziksel ölçüm için gerçek sensör bağlamalısınız.
- Wi-Fi logging’i deneyecekseniz sürücü istasyonu arayüzünün `gh-pages-dev` dalındaki yeni UI sürümünü açın ve `LoggingDemo`daki kaynak adını (ör. `logging/demo`) filtreleyin.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 100%; background: linear-gradient(90deg, #16a34a, #16a34a)"></div>
  </div>
  <div class="progress__label">Örnekler Belgelendi: %100</div>
</div>
