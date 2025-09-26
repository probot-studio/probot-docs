---
title: Probot Lib
---

# Probot Lib

## Bu Araç Sizin İçin Ne Yapar?
Probot Lib, robotunuzun Init → Start → autonomous → teleop → Stop akışını tek bir standarda oturtur ve tüm ekiplerin aynı dili konuşmasını sağlar. Kütüphane; joystick okumadan motor sürmeye, PID döngülerinden saha üstü telemetriye kadar temel işlevleri güvenli varsayılanlarla sunarak sizi iletişim ve stratejiye odaklanmaya teşvik eder.

## Hangi Dertten Kurtarır?
Her sprintte “Bu pini nereye bağlamıştık?” ya da “Wi‑Fi niçin yine çöktü?” sorularına veda edersiniz. Probot Lib, sürücü istasyonu parolasından log seviyelerine kadar kritik ayarları modüler hale getirir. Tekrarlayan bağlantı, joystick kalibrasyonu ve acil durdurma rutinlerini hazır şablonlarla çözerek atölye zamanını geri kazandırır.

## Kime Ne Fayda Sağlar?
Yazılım lideri için bu kütüphane, ekibe mentorluk ederken anlatacağı ortak bir çerçeve sunar. Mekanik ekip, pin eşlemelerini net dokümantasyon sayesinde hızlıca doğrular. Mentörler ise sahada risk analizlerini yürütürken güvenlik bloklarının hepsinin aynı yerden çağrıldığını bilir; takım yeni üyeleri oyuna dahil etmekte zorlanmaz.

## 5 Dakikada İlk Başarı
1. Kartı bilgisayara bağlayın, Arduino IDE’de `ESP32S3 Dev Module` seçin ve `PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre")` satırını takımınıza özel bir değerle güncelleyin.
2. Aşağıdaki örnek kodu yeni bir eskize yapıştırın; bu kod joystick okumayı ve seri logu hazırlar.

```cpp
#include <probot.h>
#include <probot/io/joystick_api.hpp>

PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

void robotInit() {
  Serial.begin(115200);
  Serial.println("Init tamamlandı, teleop için hazır.");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  Serial.printf("[Teleop] LY=%.2f RY=%.2f\n", js.getLeftY(), js.getRightY());
  delay(20);
}
```

3. Upload tuşuna basın, robotun “ProBot‑xxxxxx” ağını açtığından emin olun ve Init → Start sırasını web arayüzünden takip edin.
4. Seri monitörde joystick eksenlerinin aktığını gördüğünüzde ilk kilometre taşını tamamlamış olursunuz.

## Şimdi Neler Yapabilirsiniz?
Motor sürücülerini `docs/yazilim/motor-kontrolu.md` rehberini izleyerek ekleyin, ardından kapalı çevrim denemeleri için `docs/yazilim/kapali-cevrim-pid.md` sayfasındaki örnekleri Probot Lib’in PID yardımcıları ile eşleyin. Telemetriyi seri loglarla renklendirip review toplantısında dağıtılacak çıktı haline getirin.

## En Çok Sevilen 3 Özellik
- **Tek komutla bağlantı:** `PROBOT_SET_DRIVER_STATION_PASSWORD` ile Wi‑Fi erişim noktası açmak bir satıra indirgenir.
- **Hazır joystick katmanı:** `probot::io::joystick_api::makeDefault()` tüm deadzone ve eksen dengelemesini sizin yerinize yapar.
- **Tutarlı döngü yapısı:** autonomous/teleop fonksiyonları sprint retrosunda kimin neyi değiştirdiğini hızlıca görmenizi sağlar.

## Sık Düşülen Tuzaklar ve Hızlı Çözümler
- Seri monitörde veri görmüyorsanız `Serial.begin(115200);` satırının `robotInit()` içinde çalıştığını kontrol edin.
- Wi‑Fi ağı açılmadıysa parola 8 karakterden kısa olabilir; şifreyi uzatıp kartı yeniden başlatın.
- Joystick eksenleri sabit 0 okuyorsa arayüzde Init → Start dizisini tamamlamadan teleop’a geçtiğiniz için olabilir; düzeni bozmadan ilerleyin.

## Bugünden Yarına
Kütüphane takviminde; PID tuner’ın arayüzle entegre edilmesi, simülasyon bağlantıları ve sürücü geri bildirim panelleri (ROADMAP’de “Örnek kod blokları” ve “İlgili sayfalar önerisi”) sıradaki adımlar. Sizden gelecek sahadaki her başarı hikâyesi bu özelliklerin önceliğini belirliyor.

## Yarışma Dışı Nerede İşinize Yarar?
Takım içi eğitim kamplarında yeni üyelerle hızla prototip üretmek, STEM atölyelerinde yarışma sahası dışında demo robotları kurmak ve sponsorlara canlı gösterimler yapmak için Probot Lib en kestirme yol olur. Aynı kod tabanı sayesinde saha dışındaki iterasyonlar sahaya doğrudan taşınır.

## Başarının Kısayolları
Sürümler arası farkı yönetmek için her sprint sonunda `docs/assets/` altındaki diyagramları güncelleyin, kod ile dokümanın senkron kaldığını teyit edin. `scripts/update_progress.py` komutunu alışkanlık haline getirin ki ilerleme çubukları motivasyonu canlı tutsun.

## Kaynaklar ve Topluluk
- `docs/yazilim/index.md` : ana öğrenme patikasını izleyin.
- `referans/index.md` : API detaylarına hızlı erişim sağlayın.
- Haftalık review notlarını `review/` klasöründe paylaşarak çözümlerinizi diğer ekiplerle eşitleyin.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 20%; background: linear-gradient(90deg, #f1d104, #f1d104)"></div>
  </div>
  <div class="progress__label">Probot Lib İlerleme: %20</div>
</div>
