---
title: Global Ayarlar ve Örnek Kod Başlangıcı
---

# Global Ayarlar ve Örnek Kod Başlangıcı

Bu sayfa, ana koda geçmeden önce robotun ortak ayarlarını tek yerde toplamayı amaçlar. Şasi yönleri ve hız sınırları, kumanda ölçekleri, döngü süresi, pin eşlemeleri ve temel güvenlik eşikleri gibi “takımın birlikte karar vereceği” değerleri burada tanımlarız. Böylece sahada “nereden düzelteceğiz?” sorusunun net bir cevabı olur.

## Geliştirme Akışı: Parça Parça Yaz ve Test Et
Robotu tek seferde yazmaya çalışmak neredeyse hiçbir zaman mantıklı değildir. Küçük bir parça ekle, hemen test et, sonra bir parça daha ekle. Böyle ilerlediğinizde hata çıktığında “nereden geldi?” sorusunun cevabı çok daha kısa sürede bulunur.

Önerilen adımlar:
- Önce kumandayı gör: Joystick verisi düzgün geliyor mu? (eksensayısı, butonlar, değer aralığı)
- Sonra motoru doğrula: Tek motoru bağla, doğru pine mi bağlı, yön doğru mu?
- Ardından şasiye dönüştür: Sol/sağ motoru şasiye bağla, basit ileri/geri/sağ/sol sürüşü dene.
- En son mekanizma ekle: Örn. slider gibi parçaları adım adım ekle ve her adımı test et.

Bu ritim, hem zamanı verimli kullanmanızı sağlar hem de sahada sürprizleri azaltır.

## Örnek Kod Başlangıcı
Bu bölümle birlikte tek bir örnek robot dosyası üzerinden gideceğiz. Her adımda bu dosyaya küçük eklemeler yapacağız ve sayfalar ilerledikçe elinizde çalışan, anlaşılır bir robot kodu oluşacak.

Aşağıdaki iskelet, nereye ne koyacağınızı göstermek içindir.

```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]
// Buraya takımınıza özel ayarları ve makroları ekleyeceğiz (ör. parola).

// Ana robot dosyası iskeleti
// Adım adım dolduracağız. Şimdilik sadece boş fonksiyonlar var.

void robotInit() {
  // Başlangıç ayarları (ileride eklenecek)
}

void robotEnd() {
  // Kapanış (ileride eklenecek)
}

void autonomousInit() {
  // Otonom başlangıcı (ileride eklenecek)
}

void autonomousLoop() {
  // Otonom döngüsü (ileride eklenecek)
}

void teleopInit() {
  // Elle sürüş başlangıcı (ileride eklenecek)
}

void teleopLoop() {
  // Elle sürüş döngüsü (ileride eklenecek)
}
```

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
Tüm pin ve yön eşlemelerini tek başlıkta toplayın. Sahada hızlı düzeltme için derleme öncesi değerleri burada tutmak pratiktir.

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
Motorları global bölümde tanımlarız; bu aşamada güç vermeyiz. “Hangi motorlar var, nereye bağlılar, yönleri doğru mu?” gibi bilgiler burada dursun ki, sürüş eklerken doğrudan kullanalım.

```cpp
// [Global Ayarlar Bölgesi]
// Motor tanımları (sadece tanım, güç verilmez)
// // MotorHandle leftMotor(/* pinler */);
// // MotorHandle rightMotor(/* pinler */);
```

## Zamanlama ve Döngü Periyodu
Döngü periyodu, motorları ve sensörleri ne sıklıkla güncelleyeceğimizi belirler. Basit ve güvenli bir değerle başlarız (ör. 20 ms) ve tüm döngüler bu ritmi kullanır. Böylece sürüş “akıcı” ve öngörülebilir olur.

```cpp
// [Global Ayarlar Bölgesi]
// Zamanlama (örnek başlangıç değeri)
const unsigned loopPeriodMs = 20; // her 20 ms’de bir güncelle
```

## Robot Init ile ilişki
İlk aşamada motorları ve pinleri global bölümde tanımlarız. robotInit içinde bu motorları güvenli başlangıç konumunda/sıfır güçte tutar, gerekirse yön düzeltmelerini uygular ve döngü periyodu gibi temel ayarları aktive ederiz. Otonom ve Teleop bu sağlam zemin üzerinde çalışır.

## Test ve doğrulama
Her değişiklikten sonra küçük bir alan testinde ileri–geri ve sağ–sol denemeleri yapın. Teker yönü doğru mu, deadband titreşimi kesiyor mu, döngü periyodu akıcı bir sürüş sağlıyor mu? Ufak düzeltmeleri yine bu sayfadaki ayarlardan yapın.

## Robot Kodunun Son Hali
Aşağıda, şimdilik parola eklenmiş sade iskeletin son hâli yer alıyor. İlerleyen sayfalarda bu dosyayı birlikte dolduracağız.

```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");
// Buraya pin eşlemeleri, motor tanımları ve loopPeriodMs eklenecek.

void robotInit() {
  // Başlangıçta motorları güvenli duruma al (güç=0), yön düzeltmelerini uygula.
}

void robotEnd() {
}

void autonomousInit() {
}

void autonomousLoop() {
}

void teleopInit() {
}

void teleopLoop() {
}
```

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 50%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %50</div>
</div> 