---
title: Robot Bağlantısı
---

# Robot Bağlantısı

## Bu Sayfada Ne Anlatıyoruz?
Kodu karta yükleyip robotun Wi‑Fi ağına bağlanmayı ve arayüze geçmeden bağlantıyı doğrulamayı anlatıyoruz.

## Donanımı Bağlayın
[Boardoza Pulse S32‑S3](https://boardoza.com/product/boardoza-pulse-s32-s3-breakout-board/){ .u .u--slide .u--external } kartınızı alın ve veri taşıyan bir USB kabloyla bilgisayara bağlayın. Sadece şarj kabloları veri iletmez; bağlantı görünmüyorsa kabloyu değiştirin veya bilgisayarınızdaki farklı bir USB girişini deneyin.

## IDE'yi Açın ve Portu Seçin
Arduino IDE'yi açın. Araçlar → Kart → ESP32 Arduino → "ESP32S3 Dev Module" seçin. Ardından Araçlar → Port menüsünden kartın bağlı olduğu portu seçin (Windows: COMx, macOS: /dev/tty.usb…, Linux: /dev/ttyUSBx veya /dev/ttyACMx).

## Kodu Hazırlayın (Şifreyi Belirleyin)
WiFi ayarlarını `#include <probot.h>` satırından önce tanımlayın. Parolayı takımınıza özel, en az 8 karakter olacak şekilde değiştirin.

## Ana Kodun Son Hali

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

void teleopInit() {}
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  Serial.print("[JS] LY="); Serial.print(js.getLeftY(), 2);
  Serial.print(" RY="); Serial.print(js.getRightY(), 2);
  Serial.print(" POV="); Serial.println(js.getPOV());
}
void teleopEnd() {}
```

!!! warning "Parolayı mutlaka değiştirin"
    `PROBOT_WIFI_AP_PASSWORD` içinde yazan örnek parolayı takımınıza özel bir değerle değiştirin. Parola en az 8 karakter olmalıdır; aksi halde erişim noktası açılmaz.

## Kodu Yükleyin
IDE'de doğru kart ve port seçiliyken Yükle butonuna tıklayın. Yükleme tamamlanınca kart üzerindeki LED mavi yanmalıdır; karta güç kesmeyin.

## Robotun Wi‑Fi Ağına Bağlanın
Kısa bir süre sonra robot, tanımladığınız SSID ile bir Wi‑Fi ağı oluşturur. Bilgisayarınızı bu ağa, belirlediğiniz parola ile bağlayın. Bağlantı kurulduysa bir sonraki sayfaya geçerek web arayüzünü açacağız ve canlı olarak joystick verisini izleyeceğiz.
