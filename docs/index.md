---
title: Giriş
description: Probot kütüphanesi dokümantasyonu — ESP32‑S3 üzerinde WiFi driver station, joystick ve robot yaşam döngüsü.
---

# Giriş

!!! warning "WARNING"
    Bu doküman geliştirme aşamasındadır.

**Probot**, robot yapım sürecinde sizi hızlandırmak için gerekli araçları, örnekleri ve iyi pratikleri bir araya getiren bir platformdur. [Probot‑lib](https://github.com/nfrproducts/probot-lib){ .u .u--slide .u--external } ise MEB Tasarla Geliştir yarışmasının resmi yazılım kütüphanesidir ve [ESP32‑S3](https://www.ozdisan.com/p/Arduino-Evaluation-Boards-614/boardoza-boardoza-pulse-s32-s3-1473942){ .u .u--slide .u--external } üzerinde çalışmak için tasarlanmıştır.

Probot‑lib şu temel yapıları sağlar:

- **WiFi Driver Station** — ESP32‑S3 üzerinde erişim noktası ve web arayüzü
- **Joystick API** — gamepad eksen ve buton okuma
- **Robot Yaşam Döngüsü** — init / autonomous / teleop fazları
- **Telemetry** — WiFi üzerinden canlı veri izleme

Probot'a dahil diğer projeleri görmek için [Ekstra Araçlar](ekstra-araclar/probot-lib.md){ .u .u--slide .u--internal } bölümüne; güncel talepler, hatalar ve yol haritası için [GitHub Issues](https://github.com/nfrproducts/probot-lib/issues){ .u .u--slide .u--external } sayfasına göz atabilirsiniz.

## Geri Bildirim
Düşüncelerinizi ve hata bildirimlerinizi [GitHub Issues](https://github.com/nfrproducts/probot-lib/issues){ .u .u--slide .u--external } üzerinden iletebilirsiniz.
