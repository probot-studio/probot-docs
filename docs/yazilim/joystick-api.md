---
title: Joystick API
---

# Joystick API

Bu bölümde joystick verisini nasıl okuyacağınızı anlatıyoruz. Amaç, motorlara geçmeden önce girişlerin yapısını anlamanız ve basit bir doğrulamayla değerleri görmeniz. Bağlantıyı kurma ve web arayüzünü kullanma adımlarını bir sonraki sayfada yapacağız.

Joystick verisi sürücü istasyonundan (web arayüzü) gelir ve kütüphane içindeki `Gamepad` servisine yazılır. Siz bu veriye `probot::io::joystick_api::Joystick` sınıfı ile erişirsiniz. Varsayılan eşleme çoğu Xbox düzenindeki kumandaya uygundur; gerekirse `logitech-f310` veya `standard` gibi başka eşlemelere geçilebilir. Küçük titreşimleri yok saymak için deadzone kullanılır ve Y ekseni varsayılan olarak ters çevrilidir (yukarı +1 için). Bu ayrıntıları, akışı bozmadan, gerektiğinde `makeDefault({deadzone, invertY})` ile ayarlayabilirsiniz.

İlk doğrulama için teleop döngüsünde birkaç değeri ekrana yazdıralım. Şimdilik yalnızca `LeftY`, `RightY` ve `POV` (D‑Pad yönü) değerlerini göreceğiz. Sürücü istasyonuna bağlanmadığınız sürece bu değerler 0 gibi görünebilir; bir sonraki sayfada bağlantıyı kurup bu çıktıları canlı olarak izleyeceğiz.

## Ana Robot Kodunun Son Hali
Aşağıdaki kod, önceki sayfalardaki iskelete joystick okumasını ve basit yazdırmayı ekler. Sürücü istasyonuna bağlanma adımı bir sonraki sayfadadır.

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
  // Başlangıç ayarları (gerekirse)
}

void robotEnd() { }

void autonomousInit() { }
void autonomousLoop() { }

void teleopInit() { }
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Basit okuma ve yazdırma (değerler, bağlantı yoksa 0 görünebilir)
  Serial.print("[JS] LY="); Serial.print(js.getLeftY(), 2);
  Serial.print(" RY="); Serial.print(js.getRightY(), 2);
  Serial.print(" POV="); Serial.println(js.getPOV());

  delay(loopPeriodMs);
}
```

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 60%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %60</div>
</div> 