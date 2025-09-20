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

Deneyin: Bu saf sürüş çalışır ama serttir. Şimdi adım adım yumuşatacağız.

## Değişim hızını sınırlamak (ramp)
Sorun: Joystick’ten gelen değeri doğrudan motora aktardığımızda, ani değişimler motora aynen taşınır. Bir anda köklenen eksen, tekerleklerde sıçrama, patinaj ve robot gövdesinde yalpalama yapar; sürüş kırçıllı ve güvensiz hissedilir.

İlk fikir: “Biraz geciktirelim.” Döngüye ek gecikme (delay) koymak ilk bakışta yumuşatır; fakat tüm sistemi hantallaştırır ve komutlar geç ulaşır.

Başka bir fikir: “Ortalama alalım.” Hareketli ortalama (yani birkaç ölçümü toplayıp ortalamak) sinyali pürüzsüzleştirir ama hep “arkadan gelen” bir his yaratır; sürücünün verdiği komutla robot tepkisi arasında esneme oluşur.

Çözüm: “Ne kadar hızlı değişebileceğini” sınırla. Her döngüde komutun sadece belirli bir adım kadar hedefe yaklaşmasına izin verelim. Böylece ani sıçramalar kaybolur, ama sürücü hâlâ yönü ve büyüklüğü net hisseder. Bu sınırlayıcıya ramp diyeceğiz.

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

Deneyin: Aynı joystick hareketlerini tekrarlayın; kalkış ve dönüşlerin yumuşadığını hissedeceksiniz.

<details>
  <summary>Tüm kodu göster (ramp eklenmiş)</summary>

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver      leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver      rightHW(/* pin/kanal */);
static probot::motor::MotorHandle  leftMotor(leftHW);
static probot::motor::MotorHandle  rightMotor(rightHW);

void robotInit(){ leftMotor.setPower(0); rightMotor.setPower(0); }
void teleopInit(){}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  float leftMix  = forward - turn;
  float rightMix = forward + turn;
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);

  static int16_t prevL = 0, prevR = 0;
  const  int16_t maxStep = 40;
  auto ramp = [&](int16_t tgt, int16_t prev){
    int16_t d = tgt - prev;
    if (d >  maxStep) d =  maxStep;
    if (d < -maxStep) d = -maxStep;
    return (int16_t)(prev + d);
  };
  leftPower  = ramp(leftPower,  prevL);
  rightPower = ramp(rightPower, prevR);
  prevL = leftPower; prevR = rightPower;

  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0); rightMotor.setPower(0); }
```

</details>

## Zamana bağlı ramp (dt tabanlı)
Sorun: Ramp adımı “her döngüde şu kadar artsın” dediğimizde, döngü süresi değişirse (ör. 10 ms ↔ 25 ms) hissedilen ivme de değişir. Bir anda daha atak ya da daha uyuşuk hissetmeye başlarız; sürüş hızınız koddaki gecikmeye bağımlı olur. Bu, farklı kartlarda/ayarlarda tutarsız bir deneyim demektir.

Geliştirme: Ramp adımını zamana bağlayalım. Her döngüde geçen süreyi (dt) ölçüp saniye başına sabit bir değişim eğimi tanımlayalım. Böylece döngü süresi oynasa da ivme algısı aynı kalır; farklı cihaz ve ayarlarda benzer sürüş hissi elde ederiz.

!!! warning
    Bu bölüm daha ileri kullanıcılar içindir. Döngü/scheduler frekansını değiştirmeyi planlamıyorsanız sabit adımlı ramp yeterlidir; bu dt tabanlı yaklaşımı atlayabilirsiniz. Bundan sonraki tam kod örneklerinde dt tabanlı ramp yer almayacaktır.

```cpp
// teleopLoop() başında zamanı ölç
static uint32_t prevMs = 0;
uint32_t now = millis();
if (prevMs == 0) prevMs = now;
uint32_t dtMs = now - prevMs;
prevMs = now;

// ... karışımı hesapladıktan sonra
const float   slopePerSec = 800.0f;                  // saniyede en fazla 800 birim değişim
int16_t       maxStep     = (int16_t)(slopePerSec * (dtMs * 0.001f));
if (maxStep < 1) maxStep = 1;                        // çok küçük dt'lerde 0 olmasın

auto rampDt = [&](int16_t target, int16_t prev){
  int16_t diff = target - prev;
  if (diff >  maxStep) diff =  maxStep;
  if (diff < -maxStep) diff = -maxStep;
  return (int16_t)(prev + diff);
};

leftPower  = rampDt(leftPower,  prevL);
rightPower = rampDt(rightPower, prevR);
prevL = leftPower; prevR = rightPower;
```

Deneyin: Döngü periyodunu değiştirip (ör. 10 ms ↔ 25 ms) aynı sürüş hareketlerini tekrarlayın; ivmenin benzer kaldığını hissedeceksiniz.

<details>
  <summary>Tüm kodu göster (dt tabanlı ramp eklenmiş)</summary>

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver rightHW(/* pin/kanal */);
static probot::motor::MotorHandle leftMotor(leftHW);
static probot::motor::MotorHandle rightMotor(rightHW);

void robotInit(){ leftMotor.setPower(0); rightMotor.setPower(0); }
void teleopInit(){}

void teleopLoop(){
  static uint32_t prevMs = 0;
  uint32_t now = millis();
  if (prevMs == 0) prevMs = now;
  uint32_t dtMs = now - prevMs;
  prevMs = now;

  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  float leftMix  = forward - turn;
  float rightMix = forward + turn;
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);

  static int16_t prevL = 0, prevR = 0;
  const  float   slopePerSec = 800.0f;
  int16_t maxStep = (int16_t)(slopePerSec * (dtMs * 0.001f));
  if (maxStep < 1) maxStep = 1;

  auto rampDt = [&](int16_t tgt, int16_t prev){
    int16_t d = tgt - prev;
    if (d >  maxStep) d =  maxStep;
    if (d < -maxStep) d = -maxStep;
    return (int16_t)(prev + d);
  };
  leftPower  = rampDt(leftPower,  prevL);
  rightPower = rampDt(rightPower, prevR);
  prevL = leftPower; prevR = rightPower;

  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0); rightMotor.setPower(0); }
```

</details>

## Merkezde hassasiyet (kübik şekillendirme)
Sorun: Duvarda hizalama yaparken ya da bir objeye yaklaşırken, joystick’e minicik dokunuşlar bile tekerleğe “fazla” güç olarak gidiyor; robot gereğinden fazla kıpırdıyor. Merkez çevresinde daha ince bir hareket isteyen sürücüler için bu yıpratıcıdır.

İlk fikir: “Sinyali ikiye bölelim.” Joystick’ten gelen değeri 2’ye bölürsek daha hassas oluruz. Ama bu kez gazı köklediğimizde de en fazla yarım güce çıkabiliyoruz. Yani maksimum hızımız kalıcı olarak düşüyor; fikir doğru olsa da doğurduğu sorunlar bizim için çok ağır.

Başka bir fikir: “Küçükken daha çok, büyüyünce daha az azaltalım.” Matematikte karesini almak (v^2), 0’a yakın değerleri hızla küçültür; 1’e yakınken neredeyse 1 kalır. Tam da istediğimiz gibi… Bu işlem neredeyse istediğimiz şeyi yapıyor da, fakat v^2 işareti kaybeder; −0.3 de +0.3’e dönüşür. Bu da demek oluyor ki robotla geri gitmeye çalışsak bile kare alma işlemi negatifi pozitife çevireceğinden robot ileri gidecek.

Çözüm: İşareti koruyan ve merkezde hassasiyeti artıran, tek dereceli bir eğri kullanmak. En basit aday v^3’tür. v^3, küçük değerleri daha da küçültürken (+/−) yön bilgisini aynen taşır; uca yaklaştıkça yine tam güce ulaşır. İsterseniz daha da yumuşak bir merkez için v^5 gibi daha yüksek tek kuvvetler de kullanılabilir.

```cpp
auto shape = [](float v){ return v * v * v; }; // v^3: işaret korunur, merkez hassaslaşır
forward = shape(forward);
turn    = shape(turn);
```

Deneyin: Önce düz (doğrudan) sürüşü kullanın, sonra “yarıya bölme”yi deneyin, ardından v^3’e geçin. Merkezdeki ince kontrol ile tam gazdaki güç arasındaki farkları karşılaştırın. Daha da yumuşak bir his istiyorsanız v^5’i deneyip farkı hissedin.

<details>
  <summary>Tüm kodu göster (kübik şekillendirme eklenmiş)</summary>

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver      leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver      rightHW(/* pin/kanal */);
static probot::motor::MotorHandle  leftMotor(leftHW);
static probot::motor::MotorHandle  rightMotor(rightHW);

void robotInit(){ leftMotor.setPower(0); rightMotor.setPower(0); }
void teleopInit(){}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  auto shape = [](float v){ return v * v * v; };
  forward = shape(forward);
  turn    = shape(turn);
  float leftMix  = forward - turn;
  float rightMix = forward + turn;
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);
  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0); rightMotor.setPower(0); }
```

</details>

## Küçük titreşimleri yok saymak (deadband)
Sorun: Joystick’ler mekaniktir; merkezde yay gerilimi ve sensör toleransları nedeniyle hafif oynarlar. Sürücünün eli sabitken bile 0’a çok yakın küçük salınımlar üretirler; bu titreşim motora taşındığında robot “minik kıpırdanmalar” yapar.

İlk fikir: “Daha hassas motor.” Donanımı değiştirmek çoğu zaman mümkün değildir; yazılımla çözelim.

Çözüm: Merkeze yakın küçük değerleri “yok sayalım”. Mutlak değer belirlediğimiz bir eşiğin altında ise 0 kabul ederiz. Sürücünün eli titrerken robot sabit kalır; eşiği aşınca komutlar normal akar. Bu tekniğe deadband diyoruz.

```cpp
auto deadband = [](float v, float dz){ return (fabsf(v) < dz) ? 0.0f : v; };
forward = deadband(forward, 0.05f);
turn    = deadband(turn,    0.05f);
```

Deneyin: Merkezde küçük titreşimler artık motorlara taşınmayacak.

<details>
  <summary>Tüm kodu göster (deadband eklenmiş)</summary>

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver rightHW(/* pin/kanal */);
static probot::motor::MotorHandle leftMotor(leftHW);
static probot::motor::MotorHandle rightMotor(rightHW);

void robotInit(){ leftMotor.setPower(0); rightMotor.setPower(0); }
void teleopInit(){}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  auto deadband = [](float v, float dz){ return (fabsf(v) < dz) ? 0.0f : v; };
  forward = deadband(forward, 0.05f);
  turn    = deadband(turn,    0.05f);
  float leftMix  = forward - turn;
  float rightMix = forward + turn;
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);
  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0); rightMotor.setPower(0); }
```

</details>

## Clamp nedir? (güvenli sınırlar)
Sorun: Tank karışımında bazı kombinasyonlar sınırları aşabilir. Örneğin ileri tam gaz ve sert dönüşte, bir tekerlek için hesaplanan değer aralığın dışına taşar. Sürücünüz “1000’den büyük güç” diye bir şey istemedi; bu sonuç, yalnızca bizim yaptığımız toplama‑çıkarma hesabının bir yan etkisi.

İlk fikir: “Karışımı daha az agresif yapalım.” Bu, tüm sürüşü zayıflatır; düz gidişte de tepki kaybederiz.

Çözüm: Komutu güvenli sınırlar içinde tutalım. Bir alt sınır (lo) ve üst sınır (hi) belirler, aralığın dışına çıkan değeri en yakın sınıra “kıskaçlarız”. Böylece sürüşün karakterini bozmayız; sadece fiziksel/donanımsal güvenlik sınırını koruruz. Bu işleme clamp denir.

```cpp
auto clamp = [](int16_t v, int16_t lo, int16_t hi){
  return (v < lo) ? lo : (v > hi) ? hi : v;
};
leftPower  = clamp(leftPower,  -1000, 1000);
rightPower = clamp(rightPower, -1000, 1000);
```

Deneyin: Aşırı karışımlarda bile komutların güvenli kaldığını göreceksiniz.

<details>
  <summary>Tüm kodu göster (clamp eklenmiş)</summary>

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

static BoardozaRawMotorDriver leftHW(/* pin/kanal */);
static BoardozaRawMotorDriver rightHW(/* pin/kanal */);
static probot::motor::MotorHandle leftMotor(leftHW);
static probot::motor::MotorHandle rightMotor(rightHW);

void robotInit(){ leftMotor.setPower(0); rightMotor.setPower(0); }
void teleopInit(){}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  float leftMix  = forward - turn;
  float rightMix = forward + turn;
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);

  auto clamp = [](int16_t v, int16_t lo, int16_t hi){
    return (v < lo) ? lo : (v > hi) ? hi : v;
  };
  leftPower  = clamp(leftPower,  -1000, 1000);
  rightPower = clamp(rightPower, -1000, 1000);

  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0); rightMotor.setPower(0); }
```

</details>

## Otonom (ön hazırlık)
Teleop’ta sürücü eksenleri verir; otonomda ise “10 cm ileri git”, “15° sola dön” gibi hedefler koyarız. Bunun için kapalı çevrim (PID) yaklaşımı gerekir: hedefi koyar, sensörden geri bildirim alır, gücü hataya göre ayarlarız. Otonomu biraz sonra ayrı bir sayfada ele alacağız; şimdi sıradaki adım, şasiye bağlı mekanizmaları güvenle hareket ettirmek. Bir sonraki sayfa: [Mekanizmalar ve Alt Sistemler](mekanizmalar-ve-alt-sistemler.md).

## Hepsi bir arada (toplam kod)
Küçük titreşimleri yok sayma (deadband), merkezde hassasiyet (v^3), değişim hızını sınırlama (ramp) ve güvenli sınırlar (clamp) bir arada. Bu temel ayarla, sayfanın başındaki düz sürüşe göre farkı hissedin.

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
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

  float forward = js.getLeftY();   // −1..1
  float turn    = js.getRightX();  // −1..1

  // Deadband: küçük titreşimleri yok say
  auto deadband = [](float v, float dz){ return (fabsf(v) < dz) ? 0.0f : v; };
  forward = deadband(forward, 0.05f);
  turn    = deadband(turn,    0.05f);

  // Merkezde hassasiyet: kübik şekillendirme
  auto shape = [](float v){ return v * v * v; };
  forward = shape(forward);
  turn    = shape(turn);

  // Tank karışımı
  float leftMix  = forward - turn;
  float rightMix = forward + turn;

  // Ölçekle
  int16_t leftPower  = (int16_t)(leftMix  * 1000.0f);
  int16_t rightPower = (int16_t)(rightMix * 1000.0f);

  // Ramp: değişim hızını sınırla (dt tabanlı değil)
  static int16_t prevL = 0, prevR = 0;
  const  int16_t maxStep = 40;
  auto ramp = [&](int16_t tgt, int16_t prev){
    int16_t d = tgt - prev;
    if (d >  maxStep) d =  maxStep;
    if (d < -maxStep) d = -maxStep;
    return (int16_t)(prev + d);
  };
  leftPower  = ramp(leftPower,  prevL);
  rightPower = ramp(rightPower, prevR);
  prevL = leftPower; prevR = rightPower;

  // Clamp: güvenli sınırlar
  auto clamp = [](int16_t v, int16_t lo, int16_t hi){
    return (v < lo) ? lo : (v > hi) ? hi : v;
  };
  leftPower  = clamp(leftPower,  -1000, 1000);
  rightPower = clamp(rightPower, -1000, 1000);

  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);

  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){
  leftMotor.setPower(0);
  rightMotor.setPower(0);
}
```

## İlerleme
<div class="progress progress--info">
  <div class="progress__track">
    <div class="progress__bar" style="width: 61%; background: linear-gradient(90deg, #93c5fd, #3b82f6)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %61</div>
</div> 