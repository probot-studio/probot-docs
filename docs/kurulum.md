---
title: Kurulum
---

# Kurulum

Dört adım. Sıra önemli; özellikle partition scheme atlanmamalı.

## 1. Arduino IDE

Arduino IDE, ESP32'ye kod yazmak ve yüklemek için kullanılan geliştirme ortamı. Probot kodu Arduino C++ ile yazılır; IDE bu kodu derler ve USB üzerinden karta gönderir.

[arduino.cc/en/software](https://www.arduino.cc/en/software) adresinden **2.x** sürümünü indir ve kur. Eski 1.x sürümü kuruluysa kaldır; her ikisi aynı anda açıkken USB port çakışması çıkıyor.

## 2. ESP32 Kart Desteği

Arduino IDE varsayılan olarak yalnızca standart Arduino kartlarını tanır. ESP32 için ayrı bir kart paketi kurulması gerekiyor. Bu paket IDE'ye ESP32'nin nasıl programlanacağını, hangi pinlerin ne anlama geldiğini ve WiFi gibi özelliklerin nasıl kullanılacağını öğretiyor.

IDE'yi aç. **Araçlar > Kart Yöneticisi** menüsünü aç. Arama kutusuna `esp32` yaz. Listede **esp32 by Espressif Systems** çıkacak; **3.x** sürümünü seç ve kur. 2.x API uyumsuzlukları nedeniyle derlenmeyebilir; 3.x önerilir.

Kurulum bitince kart seç: **Araçlar > Kart > ESP32 Arduino > ESP32S3 Dev Module**

## 3. Kütüphaneler

Kütüphaneler, başkaları tarafından yazılmış ve tekrar kullanılabilen kod parçaları. Probot'un çalışması için iki kütüphane kurulması gerekiyor.

**Araçlar > Kütüphane Yöneticisi** menüsünü aç.

**Adafruit NeoPixel:** Arama kutusuna `adafruit neopixel` yaz ve kur. Probot durum LED'ini bu kütüphane üzerinden sürüyor; kurulu olmazsa derleme başarısız olur.

**probot:** Arama kutusuna `probot` yaz ve kur. Kütüphanenin kendisi bu; Arduino Library Manager'da adı tam olarak `probot`.

## 4. Partition Scheme

!!! warning "Bu ayarı baştan yapmak önerilir"
    Varsayılan partition yaklaşık 1.3 MB uygulama alanı ayırır. Kütüphane sığar, ama kullanıcı kodu büyüdükçe "Sketch too big" hatasıyla karşılaşılabilir. Huge APP bu alanı yaklaşık 3 MB'a çıkarır; baştan yapılırsa ilerleyen aşamalarda sorun çıkmaz.

**Araçlar > Partition Scheme > Huge APP (3MB No OTA)**

**Neden gerekli?**

ESP32'nin içindeki flash bellek bölümlere ayrılır: bir bölüm uygulama koduna, bir bölüm dosya sistemine, bir bölüm OTA güncellemelerine ayrılır. Varsayılan düzende uygulama koduna yaklaşık 1.3 MB ayrılıyor. Probot WiFi yığını, WebSocket sunucusu ve Driver Station arayüzünü doğrudan karta gömdüğü için bu alan yetmiyor. Huge APP düzeni uygulama alanını yaklaşık 3 MB'a çıkarıyor; bunun karşılığında OTA güncelleme özelliği kapatılıyor. Yarışmada OTA gerekmez.

**Bu ayar kalıcı mı?**

Hayır, Arduino IDE'de sketch'e özgü. Yeni bir sketch açıldığında veya IDE yeniden başlatıldığında varsayılan değere dönebilir. Derleme öncesinde Araçlar menüsünden kontrol edilmeli.

---

## İlk Yükleme

Kurulumu doğrulamak için [İlk Bakış](baslangic.md) sayfasındaki minimal kodu aç.

1. ESP32'yi USB kablosuyla bilgisayara bağla.
2. **Araçlar > Port** menüsünden kartın portunu seç. (Windows'ta `COM3`, `COM4` gibi. Linux/Mac'te `/dev/ttyUSB0` veya `/dev/cu.usbserial-...`)
3. Kodu derle ve yükle.
4. Serial monitörü aç (115200 baud). `[DS   ] IP Address: 192.168.4.1` gibi bir çıktı görünmeli.

---

## Sorun Giderme

| Belirti | En olası sebep | Çözüm |
|---|---|---|
| Port listesi boş | USB kablosu şarj-only | Veri kablosu kullan |
| Port var, yükleme başarısız | CH340/CP210x sürücüsü yok (Windows) | Sürücüyü kur |
| "Sketch too big" | Partition Scheme yanlış | 4. adımı yeniden yap |
| `#error ... PASSWORD` | Makrolar `#include`'dan sonra yazılmış | Makrolar her zaman `#include <probot.h>`'den önce gelmeli |
| "probot.h: No such file" | `probot` kütüphanesi kurulmamış | Kütüphane Yöneticisi'nden kur |
| Yükleme başlayıp takılıyor | Karta bağlı ekstra devre | Devreyi çıkar, çıplak kart dene |

Çalışma zamanı hataları için: [Hatalar](hatalar.md).
