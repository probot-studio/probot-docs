---
title: Logging ve Telemetri
---

# Logging ve Telemetri

## Bu Sayfada Ne Anlatıyoruz?
Bu doküman lisede yeni başlamış bir ekibi düşünerek yazıldı. Üç adımdan geçeceğiz:

1. `Serial.println` ile en temel log.
2. Aynı bilgiyi `probot::logging` ile seri hat üzerinde düzenli hale getirmek.
3. Tek satırla Wi‑Fi yayınını açıp driver station’daki **Wi‑Fi Logging** kartına aktarmak.

Aralarda sık sorulan sorulara kısa cevaplar, sonda da saha günü kontrol listesi var.

---

## Adım 0 – Log Tutmaya Neden İhtiyacımız Var?
Robot sahada beklenmedik bir hareket yaptığında “şu an ne oldu?” diye sormak yetmez. Motor akımı, PID hatası veya joystick değeri gözümüzün önündeyse cevabı saniyeler içinde buluruz. Log yoksa sadece tahmin yürütürüz. O yüzden ilk günden basit bir log alışkanlığı kuruyoruz.

---

## Adım 1 – Sadece `Serial.println`
İlk sprintte hedefimiz USB kablosuyla ham veriyi görmek. Arduino IDE’de **Tools → Serial Monitor** açıkken aşağıdaki gibi satırlar yazdırıyoruz:

```cpp
void teleopLoop(){
  float left  = joystick.getAxis(0);
  float right = joystick.getAxis(1);
  Serial.print("L=");
  Serial.print(left, 3);
  Serial.print(" R=");
  Serial.println(right, 3);
  vTaskDelay(pdMS_TO_TICKS(20));
}
```

Bu kadar. Bu adımda ekip:

- Seri monitörü kullanmayı öğrenir.
- Sensör veya joystick kablosu kopmuş mu hızlıca anlar.
- Kodun sırayla nasıl çalıştığını gözlemler.

Eksik kalanlar: Satırlar karışık, hız ölçümü yok, kabloyu çıkarınca loglar da gider. Şimdi kütüphaneyi devreye sokuyoruz.

---

## Adım 2 – `probot::logging` ile Seri Log
Hâlâ USB kablosundayız ama satırlar artık etiketli ve sıralı. Üç küçük parça gerekiyor:

1. **Kurulum** – `configureDefaults()`.
2. **Kaynak kaydı** – “şu nesne için log tut” demek.
3. **Değer yollamak** – her döngüde sayıları kuyruğa atmak.

```cpp
#include <probot.h>

namespace {
  struct ShooterLog {
    const probot::logging::SourceRegistration* reg{nullptr};
    float rpm{0};
    bool  ready{false};
  } shooter;
}

void robotInit(){
  probot::logging::configureDefaults();          // Seri logging otomatik açılır (kNormal).

  probot::logging::SourceRegistration reg{
    .type_name                = "shooter",
    .instance_name            = "main",
    .default_priority         = probot::logging::Priority::kUserMarked,
    .allow_background_on_wifi = true,
    .supports_static_dump     = false,
    .dynamic_collector        = nullptr,
    .static_collector         = nullptr,
  };

  shooter.reg = probot::logging::registerSource(&shooter, reg);
}

void teleopLoop(){
  if (!shooter.reg) return;

  shooter.rpm   = motor.readRpm();
  shooter.ready = shooter.rpm > 1800.0f;

  auto& mgr = probot::logging::manager();

  mgr.enqueueValue(*shooter.reg,
                   &shooter,
                   "rpm",
                   probot::logging::ValueType::kFloat,
                   probot::logging::Priority::kUseDefault,
                   0,
                   shooter.rpm,
                   false,
                   nullptr,
                   millis());

  mgr.enqueueValue(*shooter.reg,
                   &shooter,
                   "ready",
                   probot::logging::ValueType::kBool,
                   probot::logging::Priority::kUserMarked,
                   0,
                   0.0f,
                   shooter.ready,
                   nullptr,
                   millis());

  vTaskDelay(pdMS_TO_TICKS(20));
}
```

Seri monitörde artık şöyle satırlar görürsünüz:

```
[123456] USR shooter:main rpm=1824.50
[123456] USR shooter:main ready=true
```

> **Öncelik notu:** `kSystemCritical` en kritik, `kUserMarked` günlük kullanım, `kBackground` önemsiz veriler içindir. Kodda `kUserMarked` varsayılanı çoğu senaryoya yeter.

Seri hattı dolarsa `recordDrop()` sayaçları artar. Hızlı çözüm olarak bant genişliğini düşürebilirsiniz:

```cpp
probot::logging::setSerialBandwidthMode(probot::logging::BandwidthMode::kLow);
```

---

## Adım 3 – Aynı Logları Wi‑Fi’ya Taşımak
USB kablosu olmadan da log görmek için Wi‑Fi taşıyıcısını açıyoruz. Kodun başına iki satır ekleyin:

```cpp
void robotInit(){
  probot::logging::configureDefaults();

  probot::logging::enableWifiLogging(true);        // UDP gönderimini aç
  probot::logging::setWifiStreamingEnabled(true);  // Driver station'daki Start Logging butonuna eşdeğer

  // ... (üstteki register kodu)
}
```

Saha kenarında yapılacaklar:

1. Driver station’ı robotun Wi‑Fi ağına bağlayın.
2. Arayüzde **Wi‑Fi Logging** kartı “Connected” olduğunda `Start Logging`e basın.
3. Aynı satırlar `Wi-Fi Log Stream` alanında akar, hız/istemci sayısı da kartta görünür.
4. `Download` deyip `.txt` olarak saklayabilirsiniz.

> Firewall hatırlatması: Bilgisayarda UDP broadcast engellenmişse hız hep 0 görünür. Gerekirse güvenlik duvarında izin verin.

---

## Saha Günü Kontrol Listesi
1. `configureDefaults()` gerçekten çağrılıyor mu?
2. Seri monitörde veriler görünüyor mu? (USB takılıyken hızlı test)
3. **Wi‑Fi Logging** kartı “Streaming” yazıyor mu? Yazmıyorsa Start’a basın.
4. `serial_drop` veya `wifi_drop` hızla artıyorsa bant modunu düşürün:
   ```cpp
   probot::logging::setSerialBandwidthMode(probot::logging::BandwidthMode::kLow);
   probot::logging::setWifiBandwidthMode(probot::logging::BandwidthMode::kLow);
   ```
5. Maç sonunda `Stop Logging → Clear → Download` sırasını çalıştırın.

---

## Merak Edenler İçin
Daha derine inmek isterseniz ilgili kaynak dosyalar:

- `src/probot/logging/logger.cpp` → Kuyruk ve seri/Wi‑Fi paketleyici.
- `src/probot/logging/wifi_transport_esp32.cpp` → Wi‑Fi gönderimini başlatır.
- `src/platform/esp32s3/web/driver_station_esp32.hpp` → `/logging/status`, `/logging/stream`, `/logging/toggle` uç noktalarını sağlar.

İleride özelleştirme gerekirsen bu dosyaları inceleyebilirsiniz, ancak temel kullanım için şart değiller.

---

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 52%; background: linear-gradient(90deg, #98be21, #98be21)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %52</div>
</div>
