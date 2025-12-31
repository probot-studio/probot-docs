---
title: Şasi Kodlama
---

# Şasi Kodlama

## Bu Sayfada Ne Anlatıyoruz?
Teleop için temel tank sürüşünü kuruyor, ardından ramp, deadband, şekillendirme ve clamp ile sürüşü pürüzsüz ve güvenli hale getiriyoruz. Adım adım iyileştirme yaklaşımını örnekliyoruz.

## Teleop: En basit tank sürüş (özelliksiz)
İlk hedef, joystick’ten iki değeri okuyup doğrudan iki motora yazmak. Soldaki çubuğun dikeyi (Y) ileri‑geri, sağdaki çubuğun yatayı (X) dönüş olarak kullanılsın. Şimdilik “clamp, deadband, şekillendirme” yok; sadece akışı görelim.

> Not: Bu şasi örneklerinde kütüphanenin sağladığı motor sınıflarını kullanmak zorunda değilsiniz. Motor sayfasındaki örneklerde olduğu gibi kendi kontrolcülerinizi veya basit pin tabanlı sürüşü de kullanabilirsiniz.

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"

#include <algorithm>
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// PWM ve yön pinleri (DOLDUR: kartınızdaki gerçek pinler)
static constexpr int PIN_LEFT_INA = /* DOLDUR */;
static constexpr int PIN_LEFT_INB = /* DOLDUR */;
static constexpr int PIN_LEFT_PWM = /* DOLDUR */;
static constexpr int PIN_LEFT_ENA = -1; // ENA pini 3V3'e bağlıysa -1 bırakın
static constexpr int PIN_LEFT_ENB = -1; // ENB pini 3V3'e bağlıysa -1 bırakın

static constexpr int PIN_RIGHT_INA = /* DOLDUR */;
static constexpr int PIN_RIGHT_INB = /* DOLDUR */;
static constexpr int PIN_RIGHT_PWM = /* DOLDUR */;
static constexpr int PIN_RIGHT_ENA = -1;
static constexpr int PIN_RIGHT_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController leftMotor(
  PIN_LEFT_INA, PIN_LEFT_INB, PIN_LEFT_PWM, PIN_LEFT_ENA, PIN_LEFT_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  PIN_RIGHT_INA, PIN_RIGHT_INB, PIN_RIGHT_PWM, PIN_RIGHT_ENA, PIN_RIGHT_ENB);

void robotInit(){
  leftMotor.setPower(0.0f);
  rightMotor.setPower(0.0f);
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
  float leftMix  = forward - turn; // −2..2 olabilir (şimdilik önemsemiyoruz)
  float rightMix = forward + turn;

  float leftCmd  = std::clamp(leftMix,  -1.0f, 1.0f);
  float rightCmd = std::clamp(rightMix, -1.0f, 1.0f);
  leftMotor.setPower(leftCmd);
  rightMotor.setPower(rightCmd);

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
// ... teleopLoop() içinde leftMix/rightMix hesaplandıktan sonra
static float prevL = 0.0f, prevR = 0.0f;
const  float maxStep = 0.08f; // her döngüde en fazla ±8% değişim

auto ramp = [&](float target, float prev){
  float diff = target - prev;
  diff = std::clamp(diff, -maxStep, maxStep);
  return prev + diff;
};

leftMix  = ramp(leftMix,  prevL);
rightMix = ramp(rightMix, prevR);
prevL = leftMix;
prevR = rightMix;
```

Deneyin: Aynı joystick hareketlerini tekrarlayın; kalkış ve dönüşlerin yumuşadığını hissedeceksiniz.

<details>
  <summary>Tüm kodu göster (ramp eklenmiş)</summary>

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"

#include <algorithm>
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int PIN_LEFT_INA = /* DOLDUR */;
static constexpr int PIN_LEFT_INB = /* DOLDUR */;
static constexpr int PIN_LEFT_PWM = /* DOLDUR */;
static constexpr int PIN_LEFT_ENA = -1;
static constexpr int PIN_LEFT_ENB = -1;

static constexpr int PIN_RIGHT_INA = /* DOLDUR */;
static constexpr int PIN_RIGHT_INB = /* DOLDUR */;
static constexpr int PIN_RIGHT_PWM = /* DOLDUR */;
static constexpr int PIN_RIGHT_ENA = -1;
static constexpr int PIN_RIGHT_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController leftMotor(
  PIN_LEFT_INA, PIN_LEFT_INB, PIN_LEFT_PWM, PIN_LEFT_ENA, PIN_LEFT_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  PIN_RIGHT_INA, PIN_RIGHT_INB, PIN_RIGHT_PWM, PIN_RIGHT_ENA, PIN_RIGHT_ENB);

void robotInit(){ leftMotor.setPower(0.0f); rightMotor.setPower(0.0f); }
void teleopInit(){}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();
  float forward = js.getLeftY();
  float turn    = js.getRightX();
  float leftMix  = forward - turn;
  float rightMix = forward + turn;

  static float prevL = 0.0f, prevR = 0.0f;
  constexpr float maxStep = 0.08f;
  auto ramp = [&](float tgt, float prev){
    float d = tgt - prev;
    d = std::clamp(d, -maxStep, maxStep);
    return prev + d;
  };
  float leftRamp  = ramp(leftMix,  prevL);
  float rightRamp = ramp(rightMix, prevR);
  prevL = leftRamp; prevR = rightRamp;

  float leftCmd  = std::clamp(leftRamp,  -1.0f, 1.0f);
  float rightCmd = std::clamp(rightRamp, -1.0f, 1.0f);

  leftMotor.setPower(leftCmd);
  rightMotor.setPower(rightCmd);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){ leftMotor.setPower(0.0f); rightMotor.setPower(0.0f); }
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
const float slopePerSec = 1.6f;                   // saniyede en fazla ±1.6 birim (≈ tam güç / 0.6 s)
float       maxStep     = slopePerSec * (dtMs * 0.001f);
maxStep = std::clamp(maxStep, 0.02f, 1.0f);        // çok küçük dt'lerde 0 olmasın, çok büyük dt'lerde aşırı olmasın

auto rampDt = [&](float target, float prev){
  float diff = target - prev;
  diff = std::clamp(diff, -maxStep, maxStep);
  return prev + diff;
};

leftMix  = rampDt(leftMix,  prevL);
rightMix = rampDt(rightMix, prevR);
prevL = leftMix; prevR = rightMix;
```

Deneyin: Döngü periyodunu değiştirip (ör. 10 ms ↔ 25 ms) aynı sürüş hareketlerini tekrarlayın; ivmenin benzer kaldığını hissedeceksiniz.

<details>
  <summary>Tüm kodu göster (dt tabanlı ramp eklenmiş)</summary>

Temel teleop örneğindeki pin ve motor tanımlarını aynen kullanabilirsiniz.
Yukarıdaki `prevMs/dtMs` ölçümü ile `rampDt` fonksiyonunu, karışımı
(`leftMix/rightMix`) hesapladıktan hemen sonra ekleyip çıkan değeri
`std::clamp` ile {-1, +1} aralığına sıkıştırmanız yeterli olacaktır.

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

Ana teleop kodunun başında paylaşılan pin ve motor tanımlarını koruyun.
`teleopLoop()` içindeki `forward` ve `turn` değişkenlerini, örnekteki
`shape` fonksiyonundan geçirdikten sonra karışım hesabına devam edin.
Motor komutlarını yine `std::clamp` ile {-1, +1} aralığında tutmanız
yeterlidir.

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

Deadband fonksiyonunu `forward` ve `turn` değerlerine uygulayıp devam
etmeniz yeterlidir; kalan kod temel teleop iskeletiyle aynıdır.

</details>

## Clamp nedir? (güvenli sınırlar)
Sorun: Tank karışımında bazı kombinasyonlar sınırları aşabilir. Örneğin ileri tam gaz ve sert dönüşte, bir tekerlek için hesaplanan değer aralığın dışına taşar. Sürücünüz “1000’den büyük güç” diye bir şey istemedi; bu sonuç, yalnızca bizim yaptığımız toplama‑çıkarma hesabının bir yan etkisi.

İlk fikir: “Karışımı daha az agresif yapalım.” Bu, tüm sürüşü zayıflatır; düz gidişte de tepki kaybederiz.

Çözüm: Komutu güvenli sınırlar içinde tutalım. Bir alt sınır (lo) ve üst sınır (hi) belirler, aralığın dışına çıkan değeri en yakın sınıra “kıskaçlarız”. Böylece sürüşün karakterini bozmayız; sadece fiziksel/donanımsal güvenlik sınırını koruruz. Bu işleme clamp denir.

```cpp
auto clamp01 = [](float v){ return std::clamp(v, -1.0f, 1.0f); };
leftMix  = clamp01(leftMix);
rightMix = clamp01(rightMix);
```

Deneyin: Aşırı karışımlarda bile komutların güvenli kaldığını göreceksiniz.

<details>
  <summary>Tüm kodu göster (clamp eklenmiş)</summary>

Karışım sonucunu `std::clamp` ile {-1, +1} aralığına çekmek yeterlidir.
Ekstra örnek için temel teleop kodunda `leftMix/rightMix` yerine
`clamp01(leftMix)` kullanabilirsiniz.

</details>

## Otonom (ön hazırlık)
Teleop’ta sürücü eksenleri verir; otonomda ise “10 cm ileri git”, “15° sola dön” gibi hedefler koyarız. Bunun için kapalı çevrim (PID) yaklaşımı gerekir: hedefi koyar, sensörden geri bildirim alır, gücü hataya göre ayarlarız. Otonomu biraz sonra ayrı bir sayfada ele alacağız; şimdi sıradaki adım, şasiye bağlı mekanizmaları güvenle hareket ettirmek. Bir sonraki sayfa: [Mekanizmalar ve Alt Sistemler](mekanizmalar/index.md).

## Hepsi bir arada (toplam kod)
Küçük titreşimleri yok sayma (deadband), merkezde hassasiyet (v^3), değişim hızını sınırlama (ramp) ve güvenli sınırlar (clamp) bir arada. Bu temel ayarla, sayfanın başındaki düz sürüşe göre farkı hissedin.

```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"

#include <probot.h>
#include <algorithm>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static constexpr int PIN_LEFT_INA  = /* DOLDUR */;
static constexpr int PIN_LEFT_INB  = /* DOLDUR */;
static constexpr int PIN_LEFT_PWM  = /* DOLDUR */;
static constexpr int PIN_LEFT_ENA  = -1;
static constexpr int PIN_LEFT_ENB  = -1;
static constexpr int PIN_RIGHT_INA = /* DOLDUR */;
static constexpr int PIN_RIGHT_INB = /* DOLDUR */;
static constexpr int PIN_RIGHT_PWM = /* DOLDUR */;
static constexpr int PIN_RIGHT_ENA = -1;
static constexpr int PIN_RIGHT_ENB = -1;

static probot::motor::BoardozaVNH5019MotorController leftMotor(
  PIN_LEFT_INA, PIN_LEFT_INB, PIN_LEFT_PWM, PIN_LEFT_ENA, PIN_LEFT_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  PIN_RIGHT_INA, PIN_RIGHT_INB, PIN_RIGHT_PWM, PIN_RIGHT_ENA, PIN_RIGHT_ENB);

void robotInit(){
  leftMotor.setPower(0.0f);
  rightMotor.setPower(0.0f);
}

void teleopInit(){
  // Gerekirse joystick eşlemesi
  // probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop(){
  auto  js = probot::io::joystick_api::makeDefault();

  float forward = js.getLeftY();   // −1..1
  float turn    = js.getRightX();  // −1..1

  auto deadband = [](float v, float dz){ return (fabsf(v) < dz) ? 0.0f : v; };
  forward = deadband(forward, 0.05f);
  turn    = deadband(turn,    0.05f);

  auto shape = [](float v){ return v * v * v; };
  forward = shape(forward);
  turn    = shape(turn);

  float leftMix  = forward - turn;
  float rightMix = forward + turn;

  static float prevL = 0.0f, prevR = 0.0f;
  constexpr float maxStep = 0.08f;
  auto ramp = [&](float tgt, float prev){
    float d = tgt - prev;
    d = std::clamp(d, -maxStep, maxStep);
    return prev + d;
  };
  float leftRamp  = ramp(leftMix,  prevL);
  float rightRamp = ramp(rightMix, prevR);
  prevL = leftRamp;
  prevR = rightRamp;

  float leftCmd  = std::clamp(leftRamp,  -1.0f, 1.0f);
  float rightCmd = std::clamp(rightRamp, -1.0f, 1.0f);

  leftMotor.setPower(leftCmd);
  rightMotor.setPower(rightCmd);

  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }

void robotEnd(){
  leftMotor.setPower(0.0f);
  rightMotor.setPower(0.0f);
}
```

## Sonraki Adımlar
Temel sürüş oturduğunda şasi, mekanizmaları taşıyan güvenilir bir platforma dönüşür. Bu zeminde PID, kalibrasyon ve preset hareketlerle teleop daha hassas; otonom ise daha tekrar edilebilir hâle gelir.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 61%; background: linear-gradient(90deg, #71b62d, #71b62d)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %61</div>
</div> 
