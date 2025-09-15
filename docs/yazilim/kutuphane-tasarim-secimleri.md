---
title: Kütüphane Tasarım Seçimleri
---

# Kütüphane Tasarım Seçimleri

## Neden Arduino tabanı?
Amaç, takımı hızlıca çalışır bir temele oturtmak. Arduino ekosistemi; geniş topluluk, bol örnek ve sade API sayesinde öğrenme eğrisini yumuşatır. İleriye gittikçe alt seviyeye inmek mümkün; başlangıçta ise netlik ve hız öne çıkar. Probot‑lib, Arduino tabanını bu yüzden tercih eder: “hemen dene, sonra derinleş.”

## Neden ESP32‑S3?
ESP32‑S3, güçlü işlemci, bol GPIO, yerleşik Wi‑Fi/BLE ve yaygın kart desteği sunar. Yarışma senaryosunda; telemetri, uzaktan güncelleme ve sensör çeşitliliğiyle rahat çalışırız. Fiyat/performans dengesi ve ekiplerin temin kolaylığı da kararımızı pekiştirir. Kısacası: yeterince güçlü, erişilebilir ve uzun vadede esnektir.

## Yazılım neden bu kadar kritik?
Robot sahada donanım sınırlamaları, sürtünme, gecikme ve belirsizlikle karşılaşır. Yazılım, bu gerçek dünya hatalarını yönetmenin tek sürdürülebilir yoludur: emniyet (watchdog, failsafe), kontrol (PID ve sınırlar), senkronizasyon (scheduler) ve görünürlük (log/telemetri). İyi yazılım, mekanik ve elektronik emeğin sahada puana dönüşmesini sağlar.

## Tasarım ilkeleri (kısa)
- Basit başla, katmanlı büyüt: önce güvenilir temel, sonra özellik.
- Emniyeti öne al: her modülde korumayı yerleştir.
- Gözle görünür yap: log ve telemetriyi baştan kur.
- Bağımlılıkları sade tut: örnekler üzerinden ilerle, sonra genelle.

## Özet & Yansıtma
- Özet: Arduino + ESP32‑S3, hızlı öğrenme ve sahada yeterli güç dengesi sunar. Yazılım, robotun belirsizlikle başa çıkma aracıdır.
- Sorular: “Takımım bu temelle bugün neyi çalıştırabilir?” “Sahadaki riskleri yazılımda nasıl sönümleyeceğim?”

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 10%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %10</div>
</div> 