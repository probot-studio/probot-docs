---
title: Robot Bağlantısı
---

# Robot Bağlantısı

Bu sayfada, bir önceki bölümde hazırladığımız joystick doğrulama kodunu karta yükleyip robotun Wi‑Fi ağına bağlanacağız. Amaç, arayüze geçmeden önce bağlantının kurulduğunu görmek.

## Kodu Yükleyin
Arduino IDE’de projeyi açın ve kart/port ayarlarını kontrol edin. Bir önceki sayfadaki “Serial ile Okuma” örneğini derleyip karta yükleyin.

## Wi‑Fi Ağına Bağlanın
Kodu yükledikten sonra robot kendi erişim noktasını (AP) açar. Ağ adında genellikle “ProBot‑xxxxxx” gibi bir ifade görürsünüz; şifreyi `.ino` dosyasındaki `PROBOT_SET_DRIVER_STATION_PASSWORD("...")` satırında belirlemiştik. Bilgisayarınızı bu ağa bağlayın.

Bağlantı tamamlandığında bir sonraki sayfaya geçip web arayüzüne gireceğiz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 70%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %70</div>
</div> 