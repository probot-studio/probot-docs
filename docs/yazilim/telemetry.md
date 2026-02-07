---
title: Telemetry
---

# Telemetry

## Bu Sayfada Ne Anlatıyoruz?
Robot kodundan driver station'a anlık veri göndermeyi ve bu verileri web arayüzünde görüntülemeyi öğreniyoruz. Telemetry, hata ayıklama ve saha testlerinde hayat kurtarır.

## Telemetry Nedir?
Telemetry, robotun iç durumunu driver station'a gönderen basit bir metin tabanlı sistemdir. Serial monitöre benzer ama WiFi üzerinden çalışır; böylece robota kablo bağlamadan canlı veri izleyebilirsiniz.

## Temel Kullanım

### Include
```cpp
#include <probot.h>  // telemetry otomatik dahil
```

### API

| Fonksiyon | Açıklama |
|-----------|----------|
| `probot::print(msg)` | Metin yazdır (satır sonu yok) |
| `probot::println(msg)` | Metin yazdır + satır sonu |
| `probot::printf(fmt, ...)` | Formatlı yazdırma (C printf stili) |
| `probot::clearTelemetry()` | Buffer'ı temizle |

### Örnek: Joystick Değerlerini İzleme
```cpp
#define PROBOT_WIFI_AP_SSID     "TakimAdi"
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"
#define PROBOT_WIFI_AP_CHANNEL  3

#include <probot.h>
#include <probot/io/joystick_api.hpp>

void robotInit() {}
void robotEnd() {}

void autonomousInit() {}
void autonomousLoop() {}
void autonomousEnd() {}

void teleopInit() {
  probot::clearTelemetry();
  probot::println("Teleop basladi");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float leftY = js.getLeftY();
  float rightY = js.getRightY();

  probot::clearTelemetry();
  probot::printf("Sol Y: %.2f\n", leftY);
  probot::printf("Sag Y: %.2f\n", rightY);
}

void teleopEnd() {}
```

## Driver Station'da Görüntüleme
Telemetry verileri, driver station web arayüzünde otomatik olarak görüntülenir. `http://192.168.4.1` adresine bağlandığınızda, telemetry panelinde robot kodunuzdan gönderilen metinleri göreceksiniz.

## İpuçları

### Buffer Boyutu
Telemetry buffer'ı 256 karakter ile sınırlıdır. Uzun mesajlar kesilir. Her döngüde `clearTelemetry()` çağırıp güncel veriyi yazmak iyi bir pratiktir.

### Performans
Telemetry çağrıları hafiftir ve robot döngüsünü yavaşlatmaz. Ancak çok sık ve uzun mesajlar WiFi trafiğini artırabilir.

### Hata Ayıklama
Saha testlerinde telemetry, Serial monitörün yerini alır. Joystick değerleri ve state geçişlerini izleyerek hataları hızlıca bulabilirsiniz.

```cpp
// State machine debug örneği
probot::clearTelemetry();
probot::printf("State: %d\n", currentState);
probot::printf("Hedef: %.1f mm\n", targetPosition);
probot::printf("Gercek: %.1f mm\n", actualPosition);
```

## Serial ile Farkı
| Özellik | Serial | Telemetry |
|---------|--------|-----------|
| Bağlantı | USB kablo | WiFi |
| Mesafe | Kabloya bağlı | ~30m |
| Görüntüleme | Serial monitör | Driver station web |
| Kullanım | Geliştirme | Saha testi |

Geliştirme sırasında Serial, sahada Telemetry kullanın. İkisi birlikte de çalışabilir.
