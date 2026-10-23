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

IDE'yi aç. **Araçlar > Kart > Kart Yöneticisi** (**Tools > Board > Boards Manager**) menüsünü aç. Arama kutusuna `esp32` yaz. Listede **esp32 by Espressif Systems** çıkacak; **3.x** sürümünü seç ve kur. 2.x API uyumsuzlukları nedeniyle derlenmeyebilir; 3.x önerilir.

Kurulum bitince kart seç: **Araçlar > Kart > ESP32 Arduino > ESP32S3 Dev Module**

Önerilen kart ESP32-S3 tabanlı Boardoza Pulse S32-S3 (ESP32-S3-WROOM-1-N4R2 modülü: 4 MB flash, 2 MB quad PSRAM, doğrudan USB-C). Pulse için **Araçlar** menüsünde şu ayarları yap:

| Ayar | Değer |
|---|---|
| **Kart** | **ESP32S3 Dev Module** |
| **Flash Size** | **4MB (32Mb)** |
| **Partition Scheme** | **Huge APP (3MB No OTA/1MB SPIFFS)** (4. adım) |
| **PSRAM** | **QSPI PSRAM** |
| **USB Mode** | **Hardware CDC and JTAG** |
| **USB CDC On Boot** | **Enabled** |

**Flash Size** ve **USB Mode** bu kartta zaten varsayılan değerdedir; değiştirmen gerekenler **Partition Scheme**, **PSRAM** ve **USB CDC On Boot**. **PSRAM** ayarı karttaki 2 MB PSRAM'i programa açar. **Upload Mode** varsayılan değerinde (**UART0 / Hardware CDC**) kalır.

**Neden USB CDC On Boot: Enabled?**

Bu ayar kapalıyken (**Disabled**) `Serial` çıktısı (kütüphanenin açılış yazısı, WiFi adı, kayıtlar) USB-C'ye değil J4 konnektöründeki UART0 pinlerine (IO43/IO44) gider; USB üzerinden açılan seri monitör boş kalır.

!!! note "Port açık ama okunmuyorsa"
    Kart paketi (**esp32 by Espressif Systems**) 3.3.9 ya da sonrasıysa ve bilgisayarda port açık kalıp okunmuyorsa (ör. seri monitör kapandı, kablo takılı), kütüphane bekleyişi kısa tutar: bir `Serial` yazması en çok yaklaşık 100 ms bekler, sığmayan yazı atılır.

!!! note "Başka kart"
    Başka bir ESP32-S3 kartında da **ESP32S3 Dev Module** seçilir; **Flash Size**, **PSRAM**, **USB Mode** ve **USB CDC On Boot** o kartın belgesine göre ayarlanır, pinler de o kartın kendi pinleridir. Kart bilgisayara USB-seri çip (CH340 ya da CP210x) üzerinden bağlanıyorsa **USB CDC On Boot** **Disabled** kalır; yoksa seri monitör boş kalır. Düz ESP32 resmi destek dışındadır: **ESP32 Dev Module** seçilir, pinler yine o kartın kendi pinleridir.

## 3. Kütüphaneler

Kütüphaneler, başkaları tarafından yazılmış ve tekrar kullanılabilen kod parçaları. Probot'un çalışması için iki kütüphane kurulması gerekiyor.

**Araçlar > Kütüphaneleri Yönet** (**Tools > Manage Libraries**) menüsünü aç.

**Adafruit NeoPixel:** Arama kutusuna `adafruit neopixel` yaz ve kur. Probot durum LED'ini bu kütüphane üzerinden sürüyor; kurulu olmazsa derleme başarısız olur.

**probot:** Arama kutusuna `probot` yaz ve kur. Kütüphanenin kendisi bu; Arduino Library Manager'da adı tam olarak `probot`.

## 4. Partition Scheme

!!! warning "Bu ayarı baştan yapmak önerilir"
    Varsayılan partition yaklaşık 1.2 MB uygulama alanı ayırır (menüde "1.2MB APP"). Kütüphane sığar, ama kullanıcı kodu büyüdükçe "Sketch too big" hatasıyla karşılaşılabilir. Huge APP bu alanı yaklaşık 3 MB'a çıkarır; baştan yapılırsa ilerleyen aşamalarda sorun çıkmaz.

**Araçlar > Partition Scheme > Huge APP (3MB No OTA/1MB SPIFFS)**

**Neden gerekli?**

ESP32'nin içindeki flash bellek bölümlere ayrılır: bir bölüm uygulama koduna, bir bölüm dosya sistemine, bir bölüm OTA güncellemelerine ayrılır. Varsayılan düzende uygulama koduna yaklaşık 1.2 MB ayrılıyor. Probot WiFi yığını, WebSocket sunucusu ve Driver Station arayüzünü doğrudan karta gömdüğü için bu alanın yaklaşık %80'i kütüphaneyle dolar; robot kodu büyüyünce alan yetmez. Huge APP düzeni uygulama alanını yaklaşık 3 MB'a çıkarıyor; bunun karşılığında OTA güncelleme özelliği kapatılıyor. Yarışmada OTA gerekmez.

**Bu ayar kalıcı mı?**

Hayır, Arduino IDE'de sketch'e özgü. Yeni bir sketch açıldığında veya IDE yeniden başlatıldığında varsayılan değere dönebilir. Derleme öncesinde **Araçlar** menüsünde 2. adımdaki tablonun tamamı kontrol edilmeli; **PSRAM** ve **USB CDC On Boot** da varsayılanda **Disabled** gelir.

---

## İlk Yükleme

Kurulumu doğrulamak için [İlk Bakış](baslangic.md) sayfasındaki minimal kodu aç.

1. Kartı USB kablosuyla bilgisayara bağla (Pulse'ta USB-C).
2. **Araçlar > Port** menüsünden kartın portunu seç. (Windows'ta `COM3`, `COM4` gibi. Pulse doğrudan USB kullandığı için Linux'ta `/dev/ttyACM0`, Mac'te `/dev/cu.usbmodem...` gibi görünür; USB-seri çipli kartlarda `/dev/ttyUSB0` veya `/dev/cu.usbserial-...`)
3. **Araçlar** menüsündeki satırları 2. adımdaki tabloyla karşılaştır.
4. Kodu derle ve yükle.
5. Serial monitörü aç (115200 baud). `[DS   ] IP Address: 192.168.4.1` gibi bir çıktı görünmeli. Hiçbir şey görünmüyorsa **USB CDC On Boot** ayarının **Enabled** olduğunu kontrol et. Ayar doğruysa monitörü kart açıldıktan sonra açmış olabilirsin; Pulse'ta bu satırlar o anda kaybolabilir. Monitör açıkken kodu yeniden yükle ya da kartı yeniden başlat.

---

## Sorun Giderme

| Belirti | En olası sebep | Çözüm |
|---|---|---|
| Port listesi boş | USB kablosu şarj-only | Veri kablosu kullan |
| Port var, yükleme başarısız | CH340/CP210x sürücüsü yok (Windows, USB-seri çipli kartlarda; Pulse'ta bu çip yok) | Sürücüyü kur |
| Port var, yükleme başarısız (Pulse) | USB portu ya da çoklayıcı sorunlu | Kartı bilgisayarın kendi USB portuna tak |
| Seri monitör boş | **USB CDC On Boot** kapalı (**Disabled**) | **Enabled** yap, yeniden yükle |
| Seri monitör boş, ayar **Enabled** | Monitör kart açıldıktan sonra açıldı, açılış satırları kayboldu | Monitör açıkken yeniden yükle ya da kartı yeniden başlat |
| "Sketch too big" | Partition Scheme yanlış | 4. adımı yeniden yap |
| `#error ... PASSWORD` | Makrolar `#include`'dan sonra yazılmış | Makrolar her zaman `#include <probot.h>`'den önce gelmeli |
| "probot.h: No such file" | `probot` kütüphanesi kurulmamış | **Kütüphaneleri Yönet**'ten kur (3. adım) |
| Yükleme başlayıp takılıyor | Karta bağlı ekstra devre | Devreyi çıkar, çıplak kart dene |

Çalışma zamanı hataları için: [Hatalar](hatalar.md).
