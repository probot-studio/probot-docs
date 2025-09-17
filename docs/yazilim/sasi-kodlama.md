---
title: Şasi Kodlama
---

# Şasi Kodlama

## Bu sayfada ne yapıyoruz?
En basit hâliyle tank sürüşünü kuruyoruz: bir eksen ileri‑geri, diğer eksen sağa‑sol dönüş. Önce tamamen düz, “hiç özellik yok” sürüşle başlıyoruz. Sonra sahada karşılaşacağımız sorunları görünür kılıp küçük dokunuşlarla sürüşü pürüzsüzleştiriyoruz: değişim hızını sınırlamak, merkezde hassasiyet, küçük titreşimleri yok saymak ve en sonunda güvenli sınırlar.

## Teleop: En basit tank sürüş (özelliksiz)
İlk hedef, joystick’ten iki değeri okuyup doğrudan iki motora yazmak. Soldaki çubuğun dikeyi (Y) ileri‑geri, sağdaki çubuğun yatayı (X) dönüş olarak kullanılsın. Şimdilik “clamp, deadband, şekillendirme” yok; sadece akışı görelim.

> Not: Bu şasi örneklerinde kütüphanenin sağladığı motor sınıflarını kullanmak zorunda değilsiniz. Motor sayfasındaki örneklerde olduğu gibi kendi sürücülerinizi veya basit pin tabanlı sürüşü de kullanabilirsiniz.

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
// Varsayımsal: BoardozaRawMotorDriver
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver      leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver      rightHW(/* pin/kanal */);
static probot::motor::MotorHandle  leftMotor(leftHW);
static probot::motor::MotorHandle  rightMotor(rightHW);

void robotInit(){
  leftMotor.setPower(0);
  rightMotor.setPower(0);
}

void teleopInit(){
  // Gerekirse joystick eşlemesi
  // probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();   // −1..1  (ileri +)
  float turn    = js.getRightX();  // −1..1  (sağ +)

  // Basit tank karışımı (özelliksiz)
  float left  = forward - turn;    // −2..2 olabilir (şimdilik önemsemiyoruz)
  float right = forward + turn;

  int16_t leftPower  = (int16_t)(left  * 1000.0f);
  int16_t rightPower = (int16_t)(right * 1000.0f);
  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);

  delay(20); // 20 ms döngü
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }
```

## Değişim hızını sınırlamak (ramp)
Sürücünün gazı bir anda kökledirmesini değil, motor gücünün akıllıca yükselmesini isteriz. Saniyede ne kadar değişebileceğini sınırlayalım; sürüş bir anda zıplamaz, patinaj ve yalpalama azalır.

```cpp
// ... teleopLoop() içinde karışımı hesapladıktan sonra
static int16_t prevL = 0, prevR = 0;
const  int16_t maxStep = 40; // her döngüde en fazla ±40 birim değişim

auto ramp = [&](int16_t target, int16_t prev){
  int16_t diff = target - prev;
  if (diff >  maxStep) diff =  maxStep;
  if (diff < -maxStep) diff = -maxStep;
  return (int16_t)(prev + diff);
};

leftPower  = ramp(leftPower,  prevL);
rightPower = ramp(rightPower, prevR);
prevL = leftPower; prevR = rightPower;
```

## Merkezde hassasiyet (kübik şekillendirme)
Sürücü ortalarda milimetrik dokunuşlarla hassas sürmek ister; uçlara yaklaşınca güç net artsın. Bunun için joystick değerinin kübünü almak işe yarar: küçük değerler iyice küçülür, büyük değerler korunur.

```cpp
auto shape = [](float v){ return v * v * v; };
forward = shape(forward);
turn    = shape(turn);
```

## Küçük titreşimleri yok saymak (deadband)
Joystickler merkezde çok küçük oynar. Bu titreşimi motorlara taşımamak için küçük değerleri sıfır sayalım.

```cpp
auto deadband = [](float v, float dz){ return (fabsf(v) < dz) ? 0.0f : v; };
forward = deadband(forward, 0.05f);
turn    = deadband(turn,    0.05f);
```

## Clamp nedir? (güvenli sınırlar)
Karışım sonrası sol/sağ komutlar −1000..1000 dışına taşabilir. “Clamp”, değeri alt‑üst sınırlara sıkıştırmak demektir.

```cpp
auto clamp = [](int16_t v, int16_t lo, int16_t hi){
  return (v < lo) ? lo : (v > hi) ? hi : v;
};
leftPower  = clamp(leftPower,  -1000, 1000);
rightPower = clamp(rightPower, -1000, 1000);
```

## Otonom (ön hazırlık)
Teleop’ta sürücü eksenleri verir; otonomda ise “10 cm ileri git”, “15° sola dön” gibi hedefler koyarız. Bunun için geçen sayfadaki kapalı çevrim (PID) yaklaşımına ihtiyaç duyarız: hedef tanımlanır, encoder gibi bir sensörle geri bildirim alınır ve güç, hataya göre ayarlanır. Otonomun ayrıntılarına bir sonraki adımda gireceğiz; burada sadece şasi sürüşünün o dünyaya hazır bir temel olduğunu bilmek yeterli.

## Mekanizmalar (ayrı sayfa mı?)
Sürüş oturduktan sonra al‑bırak mekanizmaları (intake, shooter), kaldırma sistemleri (slider, kol) ve tutucular gelir. Akışı sade tutmak için bu mekanizmaları ayrı bir sayfada toplamak genellikle daha temiz olur. Bu sayfada şasiye odaklanıp, mekanizmaları “Mekanizmalar ve Yardımcı Hareketler” adımı altında ele almayı öneririz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 90%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %90</div>
</div> 