---
title: Global Ayarlar ve Örnek Kod Başlangıcı
---

# Global Ayarlar ve Örnek Kod Başlangıcı

## Bu Sayfada Ne Anlatıyoruz?
Takımın ortak değiştireceği ayarları (parola, pin eşlemeleri, motor tanımları, döngü periyodu) tek yerde topluyoruz. Bu sayfa, sahada hızlı ayar ve güvenli başlangıç için temel zemini hazırlar.

<!-- Bu sayfa, ana koda geçmeden önce robotun ortak ayarlarını tek yerde toplamayı amaçlar. Şasi yönleri ve hız sınırları, kumanda ölçekleri, döngü süresi, pin eşlemeleri ve temel güvenlik eşikleri gibi "takımın birlikte karar vereceği" değerleri burada tanımlarız. Böylece sahada "nereden düzelteceğiz?" sorusunun net bir cevabı olur. -->

<!-- Geçen bölümde oluşturduğumuz kod üzerinden ilerleyeceğiz, parça parça neler ekleyebileceğimizi konuşup en son bazılarını ekleyeceğiz. -->

## PROBOT Parolası ve Sürücü İstasyonu
Sürücü istasyonu ile kartın konuşabilmesi için parolayı başlangıçta tanımlarız. Parola, ekip içinde sabit ve bilinir olmalı; değiştirirseniz istasyon tarafını da güncelleyin.

!!! warning "Takıma özel parola şart"
    Her takım kendi parolasını belirlemelidir. Varsayılan/ortak parola kullanmak karışıklığa ve yanlış eşleşmeye neden olabilir. Parolayı takımınızla paylaşın, depo dışında güvenle saklayın.

Parola, global ayarları yaptığımız kodun tepesindeki bölgeye eklenir:

```cpp
// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");
```

## Pin Eşlemeleri (Motor/Sensör/LED)
Tüm pin ve yön eşlemelerini tek başlıkta toplayabilirsiniz. Sahada hızlı düzeltme için derleme öncesi değerleri burada tutmak pratiktir.

```cpp
// [Global Ayarlar Bölgesi]
// Pin eşlemeleri (örnek)
#define LEFT_MOTOR_INA   /* DOLDUR */
#define LEFT_MOTOR_INB   /* DOLDUR */
#define LEFT_MOTOR_PWM   /* DOLDUR */
#define LEFT_MOTOR_ENA   -1   // ENA pini 3V3'e bağlıysa -1 bırakabilirsiniz
#define LEFT_MOTOR_ENB   -1   // ENB pini 3V3'e bağlıysa -1 bırakabilirsiniz
#define RIGHT_MOTOR_INA  /* DOLDUR */
#define RIGHT_MOTOR_INB  /* DOLDUR */
#define RIGHT_MOTOR_PWM  /* DOLDUR */
#define RIGHT_MOTOR_ENA  -1
#define RIGHT_MOTOR_ENB  -1
// Gerekirse sensör pinleri de burada tanımlanır.
```

## Motorlar ve Sürüş (genel)
Motorları global bölümde tanımlarız; bu aşamada güç vermeyiz. "Hangi motorlar var, nereye bağlılar, yönleri doğru mu?" gibi bilgiler burada dursun ki, sürüş eklerken doğrudan kullanalım.

```cpp
// [Global Ayarlar Bölgesi]
// Motor tanımları (Boardoza VNH5019 sürücüsü)
static probot::motor::BoardozaVNHMotorDriver leftMotor(
  LEFT_MOTOR_INA, LEFT_MOTOR_INB, LEFT_MOTOR_PWM, LEFT_MOTOR_ENA, LEFT_MOTOR_ENB);
static probot::motor::BoardozaVNHMotorDriver rightMotor(
  RIGHT_MOTOR_INA, RIGHT_MOTOR_INB, RIGHT_MOTOR_PWM, RIGHT_MOTOR_ENA, RIGHT_MOTOR_ENB);
```

> İpucu: ENA/ENB uçları sürücü kartında 3V3'e lehimliyse -1 bırakabilirsiniz.
> Kütüphane sürücüleri başlangıçta fren modunda bekler; dilerseniz
> `setBrakeMode(false)` ile coast davranışına geçebilirsiniz.

## Joystick (özet)
Joystick bilgilerini bu dosyada sadece tanımlarız; veriyi okuma ve sürüşe çevirme bir sonraki bölümde yapılır. Şimdilik sadece "hangi joystick" ve gerekirse "hangi eşleme" kullanılacağını not edebilirsiniz.

> Not: Probot kütüphanesinde joystick verisini almak için hazır bir API vardır. Kullanımı Teleop bölümünde anlatılacaktır.

## Zamanlama ve Döngü Periyodu
Döngü periyodu, motorları ve sensörleri ne sıklıkla güncelleyeceğimizi belirler. Basit ve güvenli bir değerle başlarız (ör. 20 ms) ve tüm döngüler bu ritmi kullanır. Böylece sürüş "akıcı" ve öngörülebilir olur.

```cpp
// [Global Ayarlar Bölgesi]
// Zamanlama (örnek başlangıç değeri)
const unsigned loopPeriodMs = 20; // her 20 ms'de bir güncelle
```

Normal şartlar altında bu değeri güncellemeniz gerekmez, fakat çok karmaşık bir robotunuz varsa ve esp üzerindeki işlemlerin daha çok zamana ihtiyacı oluyorsa 20ms süresini artırıp tüm işlemlerin doğru yapıldığına emin olabilirsiniz. Bu ayar ve kütüphane içindeki scheduler yapısı ileride detaylı olarak anlatılacak.

## Robot Init ile ilişki
İlk aşamada motorları ve pinleri global bölümde tanımlarız. robotInit içinde bu motorları güvenli başlangıç konumunda/sıfır güçte tutar, gerekirse yön düzeltmelerini uygular ve döngü periyodu gibi temel ayarları aktive ederiz. Otonom ve Teleop bu sağlam zemin üzerinde çalışır.

## Robot Kodunun Son Hali
Aşağıda, şimdilik parola eklenmiş sade iskeletin son hâli yer alıyor. İlerleyen sayfalarda bu dosyayı birlikte dolduracağız.

```cpp
#include <probot.h>
#include <probot/devices/motors/boardoza_vnh_motor_driver.hpp>

// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// Pin eşlemeleri (örnek)
#define LEFT_MOTOR_INA   /* DOLDUR */
#define LEFT_MOTOR_INB   /* DOLDUR */
#define LEFT_MOTOR_PWM   /* DOLDUR */
#define LEFT_MOTOR_ENA   -1
#define LEFT_MOTOR_ENB   -1
#define RIGHT_MOTOR_INA  /* DOLDUR */
#define RIGHT_MOTOR_INB  /* DOLDUR */
#define RIGHT_MOTOR_PWM  /* DOLDUR */
#define RIGHT_MOTOR_ENA  -1
#define RIGHT_MOTOR_ENB  -1

// Motor tanımları
static probot::motor::BoardozaVNHMotorDriver leftMotor(
  LEFT_MOTOR_INA, LEFT_MOTOR_INB, LEFT_MOTOR_PWM, LEFT_MOTOR_ENA, LEFT_MOTOR_ENB);
static probot::motor::BoardozaVNHMotorDriver rightMotor(
  RIGHT_MOTOR_INA, RIGHT_MOTOR_INB, RIGHT_MOTOR_PWM, RIGHT_MOTOR_ENA, RIGHT_MOTOR_ENB);

// Zamanlama
const unsigned loopPeriodMs = 20; // her 20 ms'de bir güncelle

void robotInit() {
  // Kart açıldıktan sonra bir kez çalışır: donanımı tanıt, ilk ayarları yap.
}

void robotEnd() {
  // Gün sonunda/kapatırken bir kez çalışır: güvenli durdurma ve temizlik.
}

void autonomousInit() {
  // Otonom moda geçerken bir kez çalışır: başlangıç koşullarını hazırla.
}
void autonomousLoop() {
  // Otonom fazında periyodik çalışır: sensörleri oku, karar ver, uygula.
}

void teleopInit() {
  // Sürücü kontrolüne (teleop) geçerken bir kez çalışır: girişleri hazırla.
}
void teleopLoop() {
  // Teleop fazında periyodik çalışır: joystick'i oku, komutları uygula.
}
```

## Teleop (özet)
Teleop aşamasında joystickten okunan değerler sürüş komutlarına çevrilir. Bu dosyada sadece hazırlık ve notlar bulunur; ayrıntılı kullanım bir sonraki sayfada anlatılacaktır.

## Sonraki Adımlar
Bu bölüm tamamlanınca sahada ayar yapmak hızlı ve izlenebilir hale gelir; tek kaynaktan tüm takım aynı dili konuşur. Sonraki adımlarda joystick, sürüş ve mekanizmaları bu zemine oturtur, kalibrasyonları dakikalar içinde yaparsınız.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 28%; background: linear-gradient(90deg, #bec615, #bec615)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %28</div>
</div> 
