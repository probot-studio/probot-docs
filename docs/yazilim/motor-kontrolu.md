---
title: Motor Kontrolü
---

# Motor Kontrolü

Bu sayfada, joystick’ten gelen bir ekseni güvenli biçimde motora çevirmeyi adım adım yapacağız: önce L298N ile hızlı bir test (yarışmada desteklenmez, yalnızca doğrulama), ardından aynı fikri kütüphaneye uyumlu bir RAW sürücü ile göstereceğiz. 3.3 V → 5 V için seviye dönüştürücü kullanımını hatırlatacak, kodu schedulersiz çalıştıracağız; ileride şasi ve kapalı çevrime ilerlediğimizde aynı mantığı genişleteceğiz.

!!! warning "Önemli uyarı — L298N yarışmada desteklenmez"
    Bu sayfadaki ilk örnek, sahaya çıkmadan önce hızlı test içindir. L298N yaygın ve kolay bulunur ama yarışmada resmi olarak desteklenmez. Bu modülü yalnızca bağlantıyı doğrulamak ve yön/invert kontrolünü test etmek için kullanın; yarışma robotunda destekli bir sürücüye geçeceğiz.

## Neden L298N ile başlıyoruz?
İlk günün hedefi nettir: Joystick’ten gelen bir ekseni, motorda güvenli bir harekete çevirmek. L298N’in basitliği sayesinde temel akışı, kablo yönü ve invert gibi ayarları hızlıca doğrularız. Kütüphanenin destekli sürücülerine geçiş sonra bir dakikalık iştir; bu ilk adım sadece zemini sağlam kılar. Unutmayın: Probot kütüphanesinde her şey “destekli sürücü” olmak zorunda değil; isterseniz doğrudan pin düzeyinde de motor sürebilirsiniz.

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
Aşağıdaki örnek, kütüphaneye uyumlu “raw” bir sürücünün (ör. `BoardozaRawMotorDriver`) nasıl kullanılacağını gösterir. Joystick ekseni doğrudan güce çevrilir; scheduler şart değildir. Sınıf ve başlık adları temsilidir; gerçek sürücü için ilgili donanım sayfasına bakacağız.

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/motor_handle.hpp>
// Örnek: BoardozaRawMotorDriver (temsilidir)
#include <boardoza/raw_motor_driver.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// Donanım sürücüsü + güvenli sahiplik
static BoardozaRawMotorDriver     leftHW(/* kanal/pin bilgisi */);
static probot::motor::MotorHandle leftMotor(leftHW);

void robotInit(){
  // Güvenli başlangıç
  leftMotor.setPower(0);
}

void robotEnd(){
  leftMotor.setPower(0);
}

void teleopInit(){
  // Gerekirse joystick eşlemesini burada ayarlayabilirsiniz
  // probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop(){
  auto  js   = probot::io::joystick_api::makeDefault();
  float axis = js.getLeftY();                   // −1..1
  int16_t power = (int16_t)(axis * 1000.0f);    // −1000..1000

  leftMotor.setPower(power);

  Serial.printf("[RAW] axis=%.2f power=%d\n", axis, (int)power);
  delay(20);
}

void autonomousInit(){}
void autonomousLoop(){ delay(1000); }
```

## Sonraki adım
İki motoru birlikte ele alıp temel şasi sürüşüne geçeceğiz. Aynı güvenlik ilkelerini koruyarak yön/eşleme ayarlarını düzenleyecek, sürücüye güvenli sınırlar ekleyeceğiz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 80%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %80</div>
</div> 