---
title: Lineer Hareket Mekanizmaları (Slider + Elevator)
---

# Lineer Hareket Mekanizmaları

## Bu Sayfada Ne Anlatıyoruz?
Slider ve Elevator mekanizmalarının temel yapısını ve open-loop (açık çevrim) kontrolünü ele alıyoruz. Motor kurulumu, test ve güvenlik konularına giriş yapıyoruz.

## Giriş
Lineer hareket mekanizmalarında ilk adım, motoru güvenli şekilde sürmektir. Bu sayfada open-loop (doğrudan güç) kontrolünü öğreneceksiniz: joystick veya butonlarla mekanizmayı ileri-geri hareket ettirmek. Encoder ve PID ile kapalı çevrim kontrol ileride eklenecektir.

!!! warning "Değerleri doldurun"
    Aşağıdaki kod bloklarında pin numaraları `/* DOLDUR */` olarak işaretlenmiştir. Robotunuza uygun değerleri girmeden bu kodları çalıştırmayın.

## Slider (Kızak Kiti)

### Ne Yapar?
Slider, bir noktadan diğerine uzayıp kısalan doğrusal bir kızaktır. Objeyi ileri-geri konumlamak, kolun menzilini arttırmak veya atış yüksekliğini ayarlamak için kullanılır.

### Donanım Kurulumu
Tek bir motor, kasnak ve kayışla arabayı ileri-geri taşır.

```cpp
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// Motor pin tanımları (DOLDUR)
static constexpr int SLIDER_INA = /* DOLDUR */;
static constexpr int SLIDER_INB = /* DOLDUR */;
static constexpr int SLIDER_PWM = /* DOLDUR */;
static constexpr int SLIDER_ENA = -1;  // 3V3'e bağlıysa -1
static constexpr int SLIDER_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController sliderMotor(
  SLIDER_INA, SLIDER_INB, SLIDER_PWM, SLIDER_ENA, SLIDER_ENB);

void robotInit() {
  sliderMotor.setPower(0.0f);
}
```

### Open-Loop Kontrol (Test)
İlk olarak butonlarla manuel test yapın: bir tuşla ileri, bir tuşla geri.

```cpp
#include <probot/io/joystick_api.hpp>

void handleSliderTest(const probot::io::joystick_api::Joystick& js) {
  float power = 0.0f;
  if (js.getButtonY())      power = +0.6f;  // ileri
  else if (js.getButtonB()) power = -0.6f;  // geri
  sliderMotor.setPower(power);
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  handleSliderTest(js);
  delay(20);
}
```

### Joystick Ekseni ile Kontrol
Daha hassas kontrol için joystick eksenini kullanın:

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Sağ Y ekseni ile slider kontrolü
  float axis = js.getRightY();
  sliderMotor.setPower(axis);

  delay(20);
}
```

### Kurulum ve Güvenlik
- **İlk test:** Kayış takılı değilken motorun doğru yönde döndüğünü kontrol edin.
- **Düşük güçle başlayın:** İlk testlerde 0.3-0.4 güç kullanın.
- **Mekanik sınırlar:** Uçlarda fiziksel tampon bırakın; yüksek hızda duvara vurmak kayışı kırabilir.
- **İnvert:** Motor ters dönüyorsa `sliderMotor.setInverted(true)` kullanın.

!!! note "Kapalı çevrim kontrol"
    Encoder ile konum kontrolü (PID) ileride eklenecektir. Şimdilik open-loop kontrol ile temel testi tamamlayın.

---

## Elevator (Dikey Kaldırıcı)

### Ne Yapar?
Elevator, yükü yukarı-aşağı taşıyan dikey bir kaldırma mekanizmasıdır. Objeyi istenen yüksekliğe getirip bırakmak için kullanılır.

### Donanım Kurulumu

#### Tek Motor
```cpp
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int ELEV_INA = /* DOLDUR */;
static constexpr int ELEV_INB = /* DOLDUR */;
static constexpr int ELEV_PWM = /* DOLDUR */;
static constexpr int ELEV_ENA = -1;
static constexpr int ELEV_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController elevatorMotor(
  ELEV_INA, ELEV_INB, ELEV_PWM, ELEV_ENA, ELEV_ENB);

void robotInit() {
  elevatorMotor.setPower(0.0f);
  elevatorMotor.setBrakeMode(true);  // Yerçekimine karşı fren modu
}
```

#### İki Motor (Daha Fazla Tork)
Yük ağırsa iki motor kullanabilirsiniz:

```cpp
static probot::motor::BoardozaVNH5019MotorController elevLeftMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);
static probot::motor::BoardozaVNH5019MotorController elevRightMotor(
  /* INA */, /* INB */, /* PWM */, -1, -1);

void setElevatorPower(float power) {
  elevLeftMotor.setPower(power);
  elevRightMotor.setPower(power);
}
```

### Open-Loop Kontrol (Test)
Butonlarla manuel test:

```cpp
void handleElevatorTest(const probot::io::joystick_api::Joystick& js) {
  float power = 0.0f;
  if (js.getButtonA())      power = +0.6f;  // yukarı
  else if (js.getButtonB()) power = -0.4f;  // aşağı (yerçekimi yardımcı)
  elevatorMotor.setPower(power);
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  handleElevatorTest(js);
  delay(20);
}
```

### Kurulum ve Güvenlik
- **Yerçekimi:** Aşağı inerken daha az güç gerekir; yukarı çıkarken daha fazla.
- **Fren modu:** `setBrakeMode(true)` ile güç kesildiğinde sarkma azalır.
- **Mekanik sınırlar:** Üst ve alt sınırlarda fiziksel durdurucu kullanın.
- **Düşük güçle başlayın:** İlk testlerde 0.3-0.5 güç kullanın.

!!! warning "Güvenlik"
    Elevator testlerinde robot sabitlenmiş olmalı. Yük düşerse yaralanma riski vardır.

!!! note "Kapalı çevrim kontrol"
    Encoder ile yükseklik kontrolü (PID) ileride eklenecektir. Preset yükseklikler ve otomatik homing bu aşamada mümkün olacak.

## Sonraki Adımlar
Open-loop kontrol ile mekanizmanızın doğru çalıştığını doğruladıktan sonra, encoder ekleyerek kapalı çevrim kontrole geçebilirsiniz. Bu sayede "şu yüksekliğe git" gibi komutlar verebilirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 74%; background: linear-gradient(90deg, #53b037, #53b037)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %74</div>
</div>
