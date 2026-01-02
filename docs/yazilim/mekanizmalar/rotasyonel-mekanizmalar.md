---
title: Rotasyonel Mekanizmalar (Taret + Kol)
---

# Rotasyonel Mekanizmalar

## Bu Sayfada Ne Anlatıyoruz?
Taret ve kol mekanizmalarının temel yapısını ve open-loop (açık çevrim) kontrolünü ele alıyoruz. Motor kurulumu, test ve güvenlik konularına giriş yapıyoruz.

## Giriş
Rotasyonel mekanizmalarda ilk adım, motoru güvenli şekilde döndürmektir. Bu sayfada open-loop (doğrudan güç) kontrolünü öğreneceksiniz: joystick veya butonlarla mekanizmayı sağa-sola ya da yukarı-aşağı döndürmek. Encoder ve PID ile kapalı çevrim kontrol ileride eklenecektir.

!!! warning "Değerleri doldurun"
    Aşağıdaki kod bloklarında pin numaraları `/* DOLDUR */` olarak işaretlenmiştir. Robotunuza uygun değerleri girmeden bu kodları çalıştırmayın.

## Taret (Turret)

### Ne Yapar?
Taret, üstteki modülü yatayda çevirerek hedefe baktırır. Shooter veya gripper gibi üst bileşenleri hızlıca hizalamanızı sağlar.

### Donanım Kurulumu

#### Tek Motor
```cpp
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int TURRET_INA = /* DOLDUR */;
static constexpr int TURRET_INB = /* DOLDUR */;
static constexpr int TURRET_PWM = /* DOLDUR */;
static constexpr int TURRET_ENA = -1;
static constexpr int TURRET_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController turretMotor(
  TURRET_INA, TURRET_INB, TURRET_PWM, TURRET_ENA, TURRET_ENB);

void robotInit() {
  turretMotor.setPower(0.0f);
}
```

#### İki Motor (Yüksek Tork)
Ağır üst yapılar için iki motor kullanabilirsiniz:

```cpp
static probot::motor::BoardozaVNH5019MotorController turretLeftMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);
static probot::motor::BoardozaVNH5019MotorController turretRightMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);

void setTurretPower(float power) {
  turretLeftMotor.setPower(power);
  turretRightMotor.setPower(-power);  // Karşılıklı dönsünler
}
```

### Open-Loop Kontrol (Test)
Butonlarla manuel test:

```cpp
#include <probot/io/joystick_api.hpp>

void handleTurretTest(const probot::io::joystick_api::Joystick& js) {
  float power = 0.0f;
  if (js.getButtonY())      power = +0.5f;  // sağa döndür
  else if (js.getButtonB()) power = -0.5f;  // sola döndür
  turretMotor.setPower(power);
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  handleTurretTest(js);
  delay(20);
}
```

### Joystick Ekseni ile Kontrol
Daha hassas kontrol için joystick eksenini kullanın:

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Sağ X ekseni ile taret kontrolü
  float axis = js.getRightX();
  turretMotor.setPower(axis * 0.6f);  // Hız sınırla

  delay(20);
}
```

### Kurulum ve Güvenlik
- **Dönüş sınırları:** Kablolar ve mekanik sınırlar nedeniyle sonsuz dönüş genellikle mümkün değildir.
- **Düşük güçle başlayın:** İlk testlerde 0.3-0.5 güç kullanın.
- **Mekanik durdurucu:** Uçlarda fiziksel sınır koyun.
- **İnvert:** Motor ters dönüyorsa `turretMotor.setInverted(true)` kullanın.

!!! note "Kapalı çevrim kontrol"
    Encoder ile açı kontrolü (PID) ileride eklenecektir. Preset açılar ve otomatik homing bu aşamada mümkün olacak.

---

## Kol (Arm)

### Ne Yapar?
Kol, belirli açılara gidip orada sarsılmadan kalır. Objeleri almak veya bırakmak için farklı yüksekliklere ulaşmayı sağlar.

### Donanım Kurulumu

#### Tek Motor
```cpp
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int ARM_INA = /* DOLDUR */;
static constexpr int ARM_INB = /* DOLDUR */;
static constexpr int ARM_PWM = /* DOLDUR */;
static constexpr int ARM_ENA = -1;
static constexpr int ARM_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController armMotor(
  ARM_INA, ARM_INB, ARM_PWM, ARM_ENA, ARM_ENB);

void robotInit() {
  armMotor.setPower(0.0f);
  armMotor.setBrakeMode(true);  // Yerçekimine karşı fren modu
}
```

#### İki Motor (Yüksek Tork)
Ağır kollar için iki motor:

```cpp
static probot::motor::BoardozaVNH5019MotorController armLeftMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);
static probot::motor::BoardozaVNH5019MotorController armRightMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);

void setArmPower(float power) {
  armLeftMotor.setPower(power);
  armRightMotor.setPower(power);
}
```

### Open-Loop Kontrol (Test)
Butonlarla manuel test:

```cpp
void handleArmTest(const probot::io::joystick_api::Joystick& js) {
  float power = 0.0f;
  if (js.getButtonY())      power = +0.6f;  // yukarı
  else if (js.getButtonB()) power = -0.4f;  // aşağı (yerçekimi yardımcı)
  armMotor.setPower(power);
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  handleArmTest(js);
  delay(20);
}
```

### Joystick Ekseni ile Kontrol
```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Sol Y ekseni ile kol kontrolü
  float axis = js.getLeftY();
  armMotor.setPower(axis * 0.7f);  // Hız sınırla

  delay(20);
}
```

### Kurulum ve Güvenlik
- **Yerçekimi:** Aşağı inerken daha az güç gerekir; yukarı çıkarken daha fazla.
- **Fren modu:** `setBrakeMode(true)` ile güç kesildiğinde sarkma azalır.
- **Mekanik sınırlar:** Üst ve alt sınırlarda fiziksel durdurucu kullanın.
- **Düşük güçle başlayın:** İlk testlerde 0.3-0.5 güç kullanın.
- **Denge noktası:** Kolun denge noktasını bulun; bu noktada minimum güç gerekir.

!!! warning "Güvenlik"
    Kol testlerinde robot sabitlenmiş olmalı. Kol düşerse yaralanma riski vardır.

!!! note "Kapalı çevrim kontrol"
    Encoder ile açı kontrolü (PID) ileride eklenecektir. Preset açılar ve otomatik homing bu aşamada mümkün olacak.

## Sonraki Adımlar
Open-loop kontrol ile mekanizmanızın doğru çalıştığını doğruladıktan sonra, encoder ekleyerek kapalı çevrim kontrole geçebilirsiniz. Bu sayede "şu açıya git" gibi komutlar verebilirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 83%; background: linear-gradient(90deg, #3eab3d, #3eab3d)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %83</div>
</div>
