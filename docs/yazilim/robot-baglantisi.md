---
title: Robot Bağlantısı
---

# Robot Bağlantısı

## Bu Sayfada Ne Anlatıyoruz?
Kodu karta yükleyip robotun Wi‑Fi ağına bağlanmayı ve arayüze geçmeden bağlantıyı doğrulamayı anlatıyoruz. Port seçimi, parola ve temel seri çıktı ile hazır olduğunuzu kontrol edersiniz.

Bu sayfada joystick doğrulama kodumuzu karta yükleyip robotun Wi‑Fi ağına bağlanacağız. Hedef, arayüze geçmeden önce bağlantının kurulduğunu ve robotun hazır olduğunu görmek.

## Donanımı Bağlayın
[Boardoza Pulse S32‑S3](https://boardoza.com/product/boardoza-pulse-s32-s3-breakout-board/){ .u .u--slide .u--external } kartınızı alın ve veri taşıyan bir USB kabloyla bilgisayara bağlayın. Sadece şarj kabloları veri iletmez; bağlantı görünmüyorsa kabloyu değiştirin veya bilgisayarınızdaki farklı bir USB girişini deneyin.

## IDE’yi Açın ve Portu Seçin
Arduino IDE’yi açın. Araçlar → Kart → ESP32 Arduino → “ESP32S3 Dev Module” seçin. Ardından Araçlar → Port menüsünden kartın bağlı olduğu portu seçin (Windows: COMx, macOS: /dev/tty.usb…, Linux: /dev/ttyUSBx veya /dev/ttyACMx).

## Kodu Hazırlayın (Şifreyi Belirleyin)
Aşağıdaki ana kodu kullanacağız. Üst kısımdaki `PROBOT_SET_DRIVER_STATION_PASSWORD("...")` satırındaki parolayı takımınıza özel, en az 8 karakter olacak şekilde değiştirin. Bu parola, robotun oluşturacağı Wi‑Fi ağına bağlanırken kullanılacaktır.

## Ana Kodun Son Hali
!!! note "Bu aşamada"
    Motor tanımlarını yorum satırına aldık; sadece joystick verisini doğruluyoruz.

```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// Pin eşlemeleri (örnek)
// #define LEFT_MOTOR_IN1   /* DOLDUR */
// #define LEFT_MOTOR_IN2   /* DOLDUR */
// #define RIGHT_MOTOR_IN1  /* DOLDUR */
// #define RIGHT_MOTOR_IN2  /* DOLDUR */

// Motor tanımları (bu aşamada kapalı)
// BoardozaMotorDriver leftMotor(LEFT_MOTOR_IN1, LEFT_MOTOR_IN2);
// BoardozaMotorDriver rightMotor(RIGHT_MOTOR_IN1, RIGHT_MOTOR_IN2);

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
  auto js = probot::io::joystick_api::makeDefault();
  Serial.print("[JS] LY="); Serial.print(js.getLeftY(), 2);
  Serial.print(" RY="); Serial.print(js.getRightY(), 2);
  Serial.print(" POV="); Serial.println(js.getPOV());
  delay(loopPeriodMs);
}
```

!!! warning "Parolayı mutlaka değiştirin"
    `PROBOT_SET_DRIVER_STATION_PASSWORD` içinde yazan örnek parolayı takımınıza özel bir değerle değiştirin. Parola en az 8 karakter olmalıdır; aksi halde erişim noktası açılmaz.

## Kodu Yükleyin
IDE’de doğru kart ve port seçiliyken Yükle butonuna tıklayın. Yükleme tamamlanınca kart üzerindeki LED mavi yanmalıdır; karta güç kesmeyin. Bir sonraki adımda ağ bağlantısı açılacaktır.

## Robotun Wi‑Fi Ağına Bağlanın
Kısa bir süre sonra robot, “ProBot‑xxxxxx” benzeri bir Wi‑Fi ağı oluşturur. Bilgisayarınızı bu ağa, az önce belirlediğiniz parola ile bağlayın. Bağlantı kurulduysa bir sonraki sayfaya geçerek web arayüzünü açacağız ve canlı olarak joystick verisini izleyeceğiz.

## İlerleme
<div class="progress progress--warning">
  <div class="progress__track">
    <div class="progress__bar" style="width: 39%; background: linear-gradient(90deg, #fde68a, #f59e0b)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %39</div>
</div> 