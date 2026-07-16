---
title: Probot Core
description: ESP32 tabanlı robot yarışması yazılım kütüphanesi.
---

# Probot Core

*Bu doküman Probot Core **v0.4.0**'ı anlatır.*

MEB Tasarla Geliştir yarışmasında bir maç iki fazdan oluşur. İlk faz **otonom**: kumanda yok, robot yalnızca önceden yazılmış koda göre hareket eder, varsayılan süre 30 saniyedir. Süre dolunca robot durur ve **teleop** fazına geçilir: bir kumandayla kontrol edilir, maç sonuna kadar devam eder.

Probot, bu iki fazı ESP32 üzerinde yönetmek için yazılmış bir Arduino kütüphanesidir. Robot açılınca bir WiFi erişim noktası oluşturur. Tablet veya telefon bu ağa bağlanır; tarayıcıda açılan Driver Station arayüzünden mod seçilir (otonom veya teleop), Init ve Start yapılır. Otonom süresi dolunca teleop otomatik seçilir ama başlamaz; sürücü yeniden Init ve Start yapar. Joystick verisi ~50 Hz'de robota ulaşır.

Kod tarafında normal Arduino'daki `setup()` ve `loop()` yok; kütüphane sahip. Bunların yerine maçın fazlarına karşılık gelen hook'lar tanımlanır:

| Hook | Ne zaman çağrılır |
|---|---|
| `autonomousInit` | Otonom seçiliyken Init'e basılınca, bir kez |
| `autonomousLoop` | Otonom boyunca, ~50 Hz (zorunlu) |
| `autonomousStop` | Otonomdan her çıkışta, bir kez (zorunlu) |
| `teleopInit` | Teleop seçiliyken Init'e basılınca, bir kez |
| `teleopLoop` | Teleop boyunca, ~50 Hz (zorunlu) |
| `teleopStop` | Teleop'tan her çıkışta, bir kez (zorunlu) |

Dördü zorunludur (`autonomousLoop`, `autonomousStop`, `teleopLoop`, `teleopStop`), kalanlar opsiyoneldir; tanımlananların gövdesi boş olabilir.

!!! warning "Sinyal kalitesi maç sonucunu belirler"
    Yarışmada bağlantı kaybı en yaygın arıza sebebidir ve büyük çoğunluğu yazılımla değil donanımla çözülür. Robot kurmadan önce [sinyal temizliği rehberini](saha.md) oku.

---

Arduino IDE, ESP32 kart desteği ve kütüphane kurulumu.

[Kurulum](kurulum.md){ .md-button .md-button--primary }

İlk çalışan kod, Driver Station bağlantısı ve joystick verisi.

[İlk Bakış](baslangic.md){ .md-button }

Hook'lar, joystick API'si, şasi ve mekanizmalar, subsystem deseni, derin otonom.

[Yazılım](yazilim.md){ .md-button }

Takım ve robot süreci üzerine yarışma deneyiminden notlar.

[Tuna'nın Yarışma Notları](notlar.md){ .md-button }

Sıfırdan çalışan robota: subsystem subsystem kodlama rehberi.

[Örnek Robot](ornekler.md){ .md-button }

Derleme hataları, bağlantı sorunları ve hata ayıklama yöntemi.

[Hatalar](hatalar.md){ .md-button }

WiFi sinyal kalitesi, anten konumlandırması ve yarışma günü kanal planı.

[Sinyal Temizliği](saha.md){ .md-button }

Probot'u AI asistanlara tanıtan teknik özet.

[LLMs](llms.md){ .md-button }
