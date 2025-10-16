---
title: Motor Kontrolü
---

# Motor Kontrolü

## Bu Sayfada Ne Anlatıyoruz?
Joystick eksenini güvenli biçimde motora çevirmenin temelini kuruyoruz. Hızlı L298N testi ve kütüphaneye uyumlu raw sürücüyle aynı fikri temiz ve genişletilebilir hale getiriyoruz.

!!! warning "Önemli uyarı — L298N yarışmada desteklenmez"
    Bu sayfadaki ilk örnek, sahaya çıkmadan önce hızlı test içindir. L298N yaygın ve kolay bulunur ama yarışmada resmi olarak desteklenmez. Bu modülü yalnızca bağlantıyı doğrulamak ve yön/invert kontrolünü test etmek için kullanın; yarışma robotunda destekli bir sürücüye geçeceğiz.

## Neden L298N ile başlıyoruz?
İlk hedef nettir: Joystick’ten gelen bir ekseni, motorda güvenli bir harekete çevirmek. L298N’in basitliği sayesinde temel akışı, kablo yönü ve invert gibi ayarları hızlıca doğrularız. Kütüphanenin destekli sürücülerine geçiş sonra bir dakikalık iştir; bu ilk adım sadece zemini sağlam kılar. Unutmayın: Probot kütüphanesinde her şey “destekli sürücü” olmak zorunda değil; isterseniz doğrudan pin düzeyinde de motor sürebilirsiniz.

## Bağlantı özeti (L298N + seviye dönüştürücü)
ESP32‑S3 kartımız 3.3 V lojik seviyesiyle çalışır; çoğu L298N kartı 5 V lojik bekler. Bu yüzden sinyal hatlarında bir seviye dönüştürücü kullanmanızı öneririz: [4‑kanal logic level converter](https://www.robolinkmarket.com/logic-level-converter-4-kanal){ .u .u--slide .u--external }. ESP’nin GND’sini L298N ve dönüştürücü ile ortaklayın. ENA pinini PWM destekli bir pine bağlayın; IN1/IN2 pinleri yönü belirler (IN1=1/IN2=0 ileri, IN1=0/IN2=1 geri gibi). Motoru teker havadayken deneyin; düşük güçten başlayın. Ayrıntılı şema ve güvenlik notları için elektronik bölümüne bakın.

!!! warning "Yarışma notu"
    L298N bu dokümanda yalnızca test amaçlıdır. Yarışma robotunda destekli, uygun bir motor sürücüsüne geçmeniz gerekir.

## Motor Testi (L298N, schedulersiz)
Aşağıdaki örnek, tek bir motoru joystick’in sol Y eksenine bağlar. Eksen değerini (−1..1) PWM gücüne (−1000..1000) ölçekler; yön bilgisini IN1/IN2’ye yazar. Kodu karta yükleyip arayüzden Init ve Start’a bastıktan sonra seri ekranda eksen/güç değerini görürsünüz.

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <math.h>

// [Global Ayarlar Bölgesi]
// Parolayı takımınıza özel bir değerle değiştirin (en az 8 karakter)
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// L298N sürücü pinleri:
// - ENA: hız için PWM (0..255)
// - IN1/IN2: yön seçimi (IN1=1/IN2=0 ileri, tersi geri)
#define PIN_ENA   /* DOLDUR */
#define PIN_IN1   /* DOLDUR */
#define PIN_IN2   /* DOLDUR */

// PWM 0..255; küçük titreşimleri yok saymak için deadzone kullanacağız
static const int   kPwmMax    = 255;
static const float kDeadzone  = 0.05f; // eksen mutlak değeri 0.05'ten küçükse 0 kabul

void robotInit(){
  // Pinleri çıkış olarak ayarla
  pinMode(PIN_ENA, OUTPUT);
  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);

  // Güvenli başlangıç: hız 0, yön LOW
  digitalWrite(PIN_IN1, LOW);
  digitalWrite(PIN_IN2, LOW);
  analogWrite(PIN_ENA, 0);
}

void robotEnd(){
  // Kapanışta motoru bırak
  analogWrite(PIN_ENA, 0);
}

void teleopInit(){
  // Gerekirse joystick eşlemesini burada ayarlayabilirsiniz
  // probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop(){
  // Joystick'i oku (varsayılan: deadzone uygulayan ve Y eksenini oyun stiline göre çeviren)
  auto  js   = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY(); // −1..1

  // Küçük titreşimleri yok say
  if (fabsf(axis) < kDeadzone) axis = 0.0f;

  // Yön ve büyüklüğü ayır
  bool forward = axis >= 0.0f;
  int  pwm     = (int)(fabsf(axis) * kPwmMax);
  if (pwm > kPwmMax) pwm = kPwmMax;

  // Yön sinyalleri (pwm=0 ise iki pin de LOW)
  if (pwm == 0){
    digitalWrite(PIN_IN1, LOW);
    digitalWrite(PIN_IN2, LOW);
  } else if (forward){
    digitalWrite(PIN_IN1, HIGH);
    digitalWrite(PIN_IN2, LOW);
  } else {
    digitalWrite(PIN_IN1, LOW);
    digitalWrite(PIN_IN2, HIGH);
  }

  // Hız (PWM) uygula
  analogWrite(PIN_ENA, pwm);

  // Hızlı doğrulama (seri)
  Serial.print("[L298N] axis=");
  Serial.print(axis, 2);
  Serial.print(" pwm=");
  Serial.println(pwm);

  // 20 ms döngü (joystick ve motor akıcı olsun)
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }
```

## Kütüphanede destekli sürücüler (hızlı bakış)
Testi geçtikten sonra yarışma robotunda destekli bir sürücüye geçeceğiz. “Raw” sürücü, joystick’ten gelen değeri doğrudan güce çevirir; basit ve hızlıdır. “Closed‑loop” sürücü ise encoder gibi sensörlerden aldığı geri bildirimle gücü anlık ayarlar; hız/konum hedefini daha kararlı tutar.

Bu sayfada yalnızca “raw” yaklaşımı gösterdik; kapalı çevrim örneğine şasi bölümünden sonra döneceğiz. Şimdilik bilmeniz gereken şu: Raw sürücü, doğrudan güç; Closed‑loop sürücü, sensör geri bildirimiyle hedefi tutturmaya çalışan akıllı katmandır. İkisi de kütüphane ile uyumlu şekilde çalışır.

!!! note "Zamanlayıcı (scheduler) notu"
    Basit örneklerimizde merkezi scheduler zorunlu değildir; doğrudan `teleopLoop()` içinde güncelleme yapıyoruz. Kapalı çevrime geçtiğinizde scheduler kullanmak işleri kolaylaştırır; o noktada kısaca değineceğiz.

Bu yaklaşımın güzelliği şu: İster doğrudan pin düzeyinde sürün, ister kütüphane içindeki arayüz ve kontrolcülerle çalışın; temel mantık aynı kalır. Yarışmaya giderken sahada destekli sürücülere geçeriz, ama geliştirme ve doğrulama sırasında bu esneklik hız kazandırır.

## Kütüphanede destekli RAW sürücü (tam örnek)
L298N’yi doğruladıktan sonra gerçek sürücüye geçelim. Aşağıdaki örnek, kütüphanedeki `BoardozaVNHMotorDriver` ile tek motoru joystick eksenine bağlar. EN pinleri kart üzerinde 3V3’e sabitlenmişse -1 bırakabilirsiniz.

```cpp
#include <algorithm>
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// INA/INB/PWM (+ isteğe bağlı EN pinleri)
static constexpr int PIN_INA = /* DOLDUR */;
static constexpr int PIN_INB = /* DOLDUR */;
static constexpr int PIN_PWM = /* DOLDUR */;
static constexpr int PIN_ENA = -1;
static constexpr int PIN_ENB = -1;

static probot::motor::BoardozaVNHMotorDriver leftHW(
  PIN_INA, PIN_INB, PIN_PWM, PIN_ENA, PIN_ENB);
static probot::motor::MotorHandle leftMotor(leftHW);

void robotInit(){
  leftMotor.setPower(0.0f);
  leftMotor.underlying().setBrakeMode(true);  // Boşta fren, isteğe bağlı
}

void robotEnd(){
  leftMotor.setPower(0.0f);
}

void teleopInit(){
  // Gerekirse joystick eşlemesini burada ayarlayabilirsiniz
  // probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop(){
  auto  js   = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY();                   // −1..1
  float cmd  = std::clamp(axis, -1.0f, 1.0f);

  leftMotor.setPower(cmd);

  Serial.printf("[VNH] axis=%.2f power=%.2f\n", axis, cmd);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }
```

## Sonraki Adımlar
Tek motorla doğrulanan akış, şasi ve mekanizmalara taşındığında saha testleri çok hızlanır. Devamında iki motorla sürüş, ardından kapalı çevrim ve güvenli sınırlar eklenerek robot davranışı güçlü bir temele oturur.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 50%; background: linear-gradient(90deg, #8abc25, #8abc25)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %50</div>
</div> 
