---
title: Telemetry
---

# Telemetry

## Bu Sayfada Ne Anlatıyoruz?
Robot kodundan driver station'a anlık veri göndermeyi ve bu verileri web arayüzünde görüntülemeyi öğreniyoruz. Telemetry, hata ayıklama ve saha testlerinde hayat kurtarır.

## Telemetry Nedir?
Telemetry, robotun iç durumunu (motor güçleri, sensör değerleri, state bilgisi vb.) driver station'a gönderen basit bir metin tabanlı sistemdir. Serial monitöre benzer ama WiFi üzerinden çalışır; böylece robota kablo bağlamadan canlı veri izleyebilirsiniz.

## Temel Kullanım

### Include
```cpp
#include <probot.h>  // telemetry otomatik dahil
// veya doğrudan:
// #include <probot/telemetry/telemetry.hpp>
```

### API

| Fonksiyon | Açıklama |
|-----------|----------|
| `probot::telemetry::print(msg)` | Metin yazdır (satır sonu yok) |
| `probot::telemetry::println(msg)` | Metin yazdır + satır sonu |
| `probot::telemetry::printf(fmt, ...)` | Formatlı yazdırma (C printf stili) |
| `probot::telemetry::clear()` | Buffer'ı temizle |

### Örnek: Motor Değerlerini İzleme
```cpp
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

static probot::motor::BoardozaVNH5019MotorController leftMotor(1, 2, 3, -1, -1);
static probot::motor::BoardozaVNH5019MotorController rightMotor(4, 5, 6, -1, -1);

void robotInit() {
  leftMotor.setPower(0.0f);
  rightMotor.setPower(0.0f);
}

void teleopInit() {
  probot::telemetry::clear();
  probot::telemetry::println("Teleop basladi");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float leftPower = js.getLeftY();
  float rightPower = js.getRightY();

  leftMotor.setPower(leftPower);
  rightMotor.setPower(rightPower);

  // Her döngüde telemetry güncelle
  probot::telemetry::clear();
  probot::telemetry::printf("Sol: %.2f\n", leftPower);
  probot::telemetry::printf("Sag: %.2f\n", rightPower);

  delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(1000); }
```

## Driver Station'da Görüntüleme
Telemetry verileri, driver station web arayüzünde otomatik olarak görüntülenir. `http://192.168.4.1` adresine bağlandığınızda, telemetry panelinde robot kodunuzdan gönderilen metinleri göreceksiniz.

## İpuçları

### Buffer Boyutu
Telemetry buffer'ı 256 karakter ile sınırlıdır. Uzun mesajlar kesilir. Her döngüde `clear()` çağırıp güncel veriyi yazmak iyi bir pratiktir.

### Performans
Telemetry çağrıları hafiftir ve robot döngüsünü yavaşlatmaz. Ancak çok sık ve uzun mesajlar WiFi trafiğini artırabilir.

### Hata Ayıklama
Saha testlerinde telemetry, Serial monitörün yerini alır. Joystick değerleri, motor çıkışları ve state geçişlerini izleyerek hataları hızlıca bulabilirsiniz.

```cpp
// State machine debug örneği
probot::telemetry::clear();
probot::telemetry::printf("State: %d\n", currentState);
probot::telemetry::printf("Hedef: %.1f mm\n", targetPosition);
probot::telemetry::printf("Gercek: %.1f mm\n", actualPosition);
probot::telemetry::printf("Hata: %.1f\n", targetPosition - actualPosition);
```

## Serial ile Farkı
| Özellik | Serial | Telemetry |
|---------|--------|-----------|
| Bağlantı | USB kablo | WiFi |
| Mesafe | Kabloya bağlı | ~30m |
| Görüntüleme | Serial monitör | Driver station web |
| Kullanım | Geliştirme | Saha testi |

Geliştirme sırasında Serial, sahada Telemetry kullanın. İkisi birlikte de çalışabilir.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 72%; background: linear-gradient(90deg, #5ab030, #5ab030)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %72</div>
</div>
