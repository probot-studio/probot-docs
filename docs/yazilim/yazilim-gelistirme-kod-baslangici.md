---
title: Yazılım Geliştirme ve Kod Başlangıcı
---

# Yazılım Geliştirme ve Kod Başlangıcı

Bu sayfa, robot yazarken nasıl ilerleyeceğimizi netleştirir. Amacımız, basit ve güvenilir bir ritimle kodu parça parça kurmak, her adımda test etmek ve hatayı hızlıca bulabilmektir. En iyi pratikleri (best practices) kısaca gösterecek, işe yarayan yöntemleri elinizin altında tutacağız.

## Yazılım süreci ve hata ayıklama
Robot kodu yazarken bazen hatalar yapabiliriz; bu çok normal. Aynı zamanda eklediğimiz özellikler veya yaptığımız değişiklikler öngörülemeyen sonuçlara yol açabilir. Hata çözmek ve yeni hataların çıkmasını önlemek için hata ayıklama (debugging) yapmalıyız. Robotlarda bu özellikle önemlidir; çünkü hatalı bir yazılım tüm robota zarar verebilir.

Bilgisayarda geliştirme yaparken hata ayıklama araçlarıyla kodu durdurabilir, satır satır ilerleyebilir, değişkenleri anlık görebilir ve deneme yaparak düzeltebiliriz. Robotta ise kod gerçek zamanda çalışır; sistemi durdurmak her zaman güvenli değildir ve kaynaklar sınırlıdır. Bu yüzden pratik ve güvenli yöntemlere yaslanırız: simülasyon, logging ve parça parça geliştirme.

## Simülasyon
Simülasyon, kodu bilgisayarda çalıştırıp robotun ve çevrenin basit bir kopyasını canlandırmaktır. Motorlara verdiğiniz komutlar sanal motorlara gider; hız/konum ve enkoder değerleri yazılımla hesaplanır; sensörler de benzetimden veri üretir. Yani “fiziksel robot yokken” sanki varmış gibi akışı görür, kablo takmadan ve donanıma zarar vermeden deneme yaparsınız.

Bu yaklaşım mantık hatalarını erken yakalamaya, birden çok kişinin aynı projede paralel çalışmasına ve hızlı deneme–yanılmaya imkân verir. Not: Simülasyon gerçek dünyanın birebir karşılığı değildir; sürtünme, kayma, gecikme gibi etkiler farklı olabilir. Bu yüzden simülasyonda doğruladığınız akışı sahada kısa testlerle mutlaka teyit edin.

!!! warning "Simülasyon notu"
    Probot simülasyon projesi geliştirme aşamasındadır. İlerlemeyi ve açılışı takip etmek için Ekstra Araçlar → [Probot Simülasyon](/ekstra-araclar/probot-sim/){ .u .u--slide .u--internal } sayfasını işaretleyin; açıldığında duyuracağız.

## Logging
Kayıt (logging) yöntemiyle, önemli değişkenleri robottan bilgisayara yazdırırız. Bu, “adım adım durdurma” kadar güçlü değildir ama pratik ve hızlıdır: belirlediğiniz noktalarda değerleri görür, gidişatı anlarsınız. Çıktıları okunur tutmak ve yalnızca kritik bilgiyi yazmak bu yöntemi etkili kılar.

Basit bir başlangıç için `Serial.println`/`Serial.printf` yeterlidir:

```cpp
// Teleop/otonom döngüsünde kritik noktaları yazdırın
Serial.printf("[Loop] t=%lu\n", (unsigned long)millis());
```

Gürültüyü azaltmak için bölüme özel anahtarlarla log’u açıp kapatabilirsiniz:

```cpp
// [Global Ayarlar Bölgesi]
//#define DBG_LOG      1
//#define DBG_CHASSIS  1
//#define DBG_SLIDER   1

// ...
#ifdef DBG_LOG
  Serial.printf("[Loop] t=%lu\n", (unsigned long)millis());
#endif

#ifdef DBG_CHASSIS
  // Örn: şasi komutlarını/süreçlerini takip edin
  // Serial.printf("[Chassis] vL=%.1f vR=%.1f\n", vL, vR);
#endif

#ifdef DBG_SLIDER
  // Örn: slider hedef/konum yazdırın
  // Serial.printf("[Slider] target=%.1f pos=%.1f\n", target, pos);
#endif
```

## Parça parça geliştirme
Robotlarda en güvenilir yaklaşım, kodu küçük parçalar halinde eklemek ve her defasında test etmektir. Önce boş bir iskelet yükleyin. Çalışıyorsa sıradaki adıma geçin: joystick’i görün; ardından tek motoru doğrulayın; sonra iki motoru şasi sürüşüne bağlayın; en son mekanizmayı ekleyin. Böylece yeni eklediğiniz kodda bir sorun olursa, hemen bir önceki çalışan sürüme dönüp farkı görürsünüz. Hataların kaynağını daraltmak kolaylaşır, zaman kaybı azalır.

Gerçek bir projede bu üç yöntem birlikte kullanılır: sim ile akışı doğrular, logging ile sahada olanı görür, parçalı ilerleyerek her adımı güvenceye alırsınız.

## Robot Kodu Başlangıcı
Artık koda başlayabiliriz. Robot yaşam döngüsü ve geliştirme yöntemlerini öğrendik; şimdi bunları birleştirip parça parça ilerleyeceğiz. İlk adımda sade bir iskelet kuruyoruz: yalnızca Probot’u içe aktarır ve zorunlu yaşam döngüsü fonksiyonlarını boş bırakırız. Sonraki bölümlerde bu iskeleti adım adım dolduracağız.

```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]

void robotInit() {}
void robotEnd() {}

void autonomousInit() {}
void autonomousLoop() {}

void teleopInit() {}
void teleopLoop() {}
```

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 40%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %40</div>
</div> 