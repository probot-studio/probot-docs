---
title: Global Ayarlar ve Örnek Kod Başlangıcı
---

# Global Ayarlar ve Örnek Kod Başlangıcı

Bu sayfa, ana koda geçmeden önce robotun ortak ayarlarını tek yerde toplamayı amaçlar. Şasi yönleri ve hız sınırları, kumanda ölçekleri, döngü süresi, pin eşlemeleri ve temel güvenlik eşikleri gibi "takımın birlikte karar vereceği" değerleri burada tanımlarız. Böylece sahada "nereden düzelteceğiz?" sorusunun net bir cevabı olur.

Geçen bölümde oluşturduğumuz kod üzerinden ilerleyeceğiz, parça parça neler ekleyebileceğimizi konuşup en son bazılarını ekleyeceğiz.

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
#define LEFT_MOTOR_IN1   /* DOLDUR */
#define LEFT_MOTOR_IN2   /* DOLDUR */
#define RIGHT_MOTOR_IN1  /* DOLDUR */
#define RIGHT_MOTOR_IN2  /* DOLDUR */
// Gerekirse sensör pinleri de burada tanımlanır.
```

## Motorlar ve Sürüş (genel)
Motorları global bölümde tanımlarız; bu aşamada güç vermeyiz. "Hangi motorlar var, nereye bağlılar, yönleri doğru mu?" gibi bilgiler burada dursun ki, sürüş eklerken doğrudan kullanalım.

```cpp
// [Global Ayarlar Bölgesi]
// Motor tanımları
BoardozaMotorDriver leftMotor(LEFT_MOTOR_IN1, LEFT_MOTOR_IN2);
BoardozaMotorDriver rightMotor(RIGHT_MOTOR_IN1, RIGHT_MOTOR_IN2);
```

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

// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// Pin eşlemeleri (örnek)
#define LEFT_MOTOR_IN1   /* DOLDUR */
#define LEFT_MOTOR_IN2   /* DOLDUR */
#define RIGHT_MOTOR_IN1  /* DOLDUR */
#define RIGHT_MOTOR_IN2  /* DOLDUR */

// Motor tanımları
BoardozaMotorDriver leftMotor(LEFT_MOTOR_IN1, LEFT_MOTOR_IN2);
BoardozaMotorDriver rightMotor(RIGHT_MOTOR_IN1, RIGHT_MOTOR_IN2);

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

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 50%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %50</div>
</div> 