# prosdk'yi Arduino IDE'ye kur

Bu sayfada ESP32 kart paketinin 3.3.10 sürümünü ve `prosdk` kütüphanesini kuracak, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartı için kart ayarlarını yapacak, hazır bir örneği derleyeceksin.

prosdk alfa sürümündedir ve yayınlanmadı. Bu sayfadaki adımlar derlemeyle biter; prosdk gerçek bir kartta, Pulse'ta da henüz denenmedi. Neyin denendiğini ve neyin denenmediğini [Durum](index.md#durum) tablosunda görürsün.

## Başlamadan önce

- Arduino IDE 2 kurulu: [Arduino IDE'yi kur](../core/arduino-ide-kur.md#arduino-ide).
- Pulse (Probot kitinin ana kartı) ve USB-C veri kablosu. Başka bir ESP32-S3 kartı da olur: [Başka bir ESP32-S3 kartı kullan](#baska-kart). prosdk düz ESP32'de ve diğer ESP32 türlerinde çalışmaz.
- İnternet bağlantısı. `prosdk` paketi yaklaşık 21 MB indirilir, kurulunca yaklaşık 85 MB yer tutar.

Menü adları Arduino IDE'nin İngilizce arayüzüne göredir. Türkçe arayüzde **File** yerine **Dosya**, **Tools** yerine **Araçlar** yazar.

## ESP32 kart paketinin 3.3.10 sürümünü kur {#kart-paketi}

prosdk önceden derlenmiş bir kütüphane olarak gelir ve ESP32 kart paketinin **3.3.10** sürümüyle hazırlandı.

!!! warning "Dikkat"
    prosdk, kart paketinin başka bir sürümüyle denenmedi ve derlerken kart paketinin sürümünü denetlemez. Yalnız 3.3.10'u kullan.

Kart paketinin başka bir sürümü kuruluysa da aynı adımları izle: 3.3.10'u kurduğunda IDE kurulu sürümün yerine onu koyar.

1. **Tools** > **Board** > **Boards Manager**'ı seç.
2. Arama kutusuna `esp32` yaz.
3. **esp32 by Espressif Systems** satırındaki sürüm listesinden **3.3.10**'u seç.
4. **Install**'a bas.

Sonuç: **esp32 by Espressif Systems** satırında "3.3.10 installed" yazar.

IDE sonradan kart paketini güncellemeyi önerirse kabul etme. Güncellediysen bu bölümü tekrarla.

## Kartı ve bölümlemeyi seç {#kart-ve-bolumleme}

Probot kitinin ana kartı Pulse'tur. Kartın modülü ESP32-S3-WROOM-1-N4R2'dir: 4 MB flash, 2 MB PSRAM. Kart paketinde Pulse için ayrı bir girdi yoktur; **ESP32S3 Dev Module**'ü seçer, ayarları bu tabloya göre yaparsın:

| Ayar | Değer | Neden |
|---|---|---|
| **Board** | ESP32S3 Dev Module | Kart paketinde Pulse girdisi yok. |
| **Flash Size** | 4MB (32Mb) | Pulse'un modülünde 4 MB flash var. |
| **Partition Scheme** | Huge APP (3MB No OTA/1MB SPIFFS) | prosdk ile bir sketch 1,6-2,3 MB tutar. Varsayılan bölümleme koda 1,25 MB bırakır, **Huge APP** 3 MB verir. |
| **PSRAM** | QSPI PSRAM | Pulse'un modülündeki PSRAM dört hatlıdır (quad). |
| **USB Mode** | Hardware CDC and JTAG | USB-C portu bilgisayarda seri port olarak görünür. |
| **USB CDC On Boot** | Enabled | `Serial` çıkışı USB-C portuna gelir. |
| **Upload Mode** | UART0 / Hardware CDC | Kod USB-C portundan yüklenir. |

1. Pulse'u USB-C portundan USB veri kablosuyla bilgisayara bağla.
2. **Tools** > **Board** > **esp32** menüsünden **ESP32S3 Dev Module**'ü seç.
3. **Tools** > **Partition Scheme** menüsünden **Huge APP (3MB No OTA/1MB SPIFFS)** seçeneğini seç.
4. **Tools** > **PSRAM** menüsünden **QSPI PSRAM** seçeneğini seç.
5. **Tools** > **USB CDC On Boot** menüsünden **Enabled** seçeneğini seç.
6. **Tools** menüsündeki **Flash Size**, **USB Mode** ve **Upload Mode** satırlarını tablodakiyle karşılaştır; farklı olanı tablodaki değere getir.
7. **Tools** > **Port** menüsünden Pulse'u taktığında beliren yeni portu seç.

Sonuç: **Tools** menüsündeki yedi ayar satırı tablodaki değerleri, **Port** satırı Pulse'un portunu gösterir.

**ESP32S3 Dev Module**'ü ilk kez seçtiğinde **Flash Size**, **USB Mode** ve **Upload Mode** genelde tablodaki değerlerdedir. IDE her kart için son seçtiğin değerleri hatırlar; bu kartı daha önce başka ayarlarla kullandıysan bu üç satır da farklı olabilir.

Pulse'un portu, kartı taktığında listeye eklenen porttur: Windows'ta `COM3` gibi bir **COM** portu, Linux'ta `/dev/ttyACM0` gibi bir ad, macOS'ta `/dev/cu.usbmodem` ile başlayan bir ad. Liste değişmiyorsa önce kablonun veri taşıdığından emin ol; yalnız şarj eden kablolar port göstermez. Port yine çıkmazsa kartı indirme moduna al: **BOOT** düğmesini basılı tut, **RESET** düğmesine basıp bırak, sonra **BOOT**'u bırak. Bu adımlar Pulse'ta denenmedi.

**USB CDC On Boot** **Enabled** iken Probot Core'un açılış mesajları, WiFi ağının adı ve `Serial.print` USB-C portundan **Serial Monitor**'e gelir. **Disabled** iken bu yazılar J4 konnektöründeki GPIO 43 (TX) ve GPIO 44 (RX) pinlerine gider. Bu ayar, Pulse'un USB-C portunun ESP32-S3'ün kendi USB pinlerine (GPIO 19 ve 20) bağlı olduğunu varsayar.

**Huge APP** kablosuz güncellemeyi (OTA) kapatır. prosdk ve Probot Core OTA kullanmaz.

Menüde "1MB SPIFFS" yazan alanı LittleFS kullanır. Bu alan 896 KiB'tır ve kayıtlar oraya yazılır: [Kayıt tut ve dosyaları indir](kayit-tut.md). prosdk bu alanı her açılışta ilk `DataLogManager` çağrısında kendisi bağlar; alan boşsa (ilk açılışta) önce biçimlendirir, içinde başka veri varsa ona dokunmaz. Kodu yeniden yüklemek bu alandaki kayıtları silmez. **Tools** > **Erase All Flash Before Sketch Upload** **Enabled** ise ya da **Partition Scheme**'i değiştirirsen kayıtlar silinir.

### Başka bir ESP32-S3 kartı kullan {#baska-kart}

Başka bir ESP32-S3 kartında da tablodaki ayarları kullan. Üç fark var:

- Kartın USB portu bir USB-UART köprü yongasından geçiyorsa **USB CDC On Boot**'u **Disabled** yap. `Serial` çıkışı o porta gelir.
- prosdk'nin varsayılan bus pinleri Pulse'un konnektörlerine göredir. Başka kartta bunları robot sınıfının ilk üyesinde kendi kartının pinlerine taşı. Hazır kod: [Başka bir ESP32-S3 kartında bus pinlerini taşı](pinleri-kullan.md#baska-kart). Fonksiyonların ayrıntısı: [Bus pinlerini ayarla](surucu-kullan.md#bus-pinleri).
- Sekiz hatlı (octal) PSRAM'li modüller (N8R8, N16R8) bu ayarlarla PSRAM'siz çalışır; **PSRAM** menüsündeki **OPI PSRAM** desteklenmez. Bu modüllerde GPIO 33-37 PSRAM'e bağlıdır ama prosdk bu pinleri reddetmez; kullanma. Bu rehberin ve örneklerin motor pinleri 35, 36 ve 37'yi kullanır; bu kartlarda onları başka pinlere taşı (örneğin 4, 5, 12). Bu durum gerçek bir kartta denenmedi.

## Kütüphaneyi kur {#kutuphane}

prosdk yayınlanana kadar Kütüphane Yöneticisi'nde görünmez; o zamana kadar [ZIP dosyasıyla kur](#zip). Bu bölümdeki adımlar yayından sonra geçerlidir.

`prosdk` iki kütüphaneye dayanır: Probot Core (`probot`) ve onun durum LED'i için kullandığı `Adafruit NeoPixel`. Kütüphane Yöneticisi prosdk'yi bu ikisiyle birlikte kurar.

prosdk, Probot Core 0.5.0 ya da daha yeni bir sürüm ister. prosdk'nin `probot` bağımlılığında sürüm şartı yoktur, bu yüzden daha önce kurduğun bir `probot` kendiliğinden güncellenmez. Kurulu Probot Core daha eskiyse derleme `prosdk requires probot-core 0.5.0 or later` ile başlayan bir hatayla durur.

!!! warning "Dikkat"
    Arduino IDE bir kütüphanenin tek sürümünü kurulu tutar. `probot`'u 0.5.0 ya da daha yeni bir sürüme güncellediğinde Blocks'un ürettiği Probot Core kodu derlenmez: [Kütüphaneleri kur](../core/arduino-ide-kur.md#kutuphaneler).

1. **Tools** > **Manage Libraries**'i seç.
2. Arama kutusuna `probot` yaz.
3. **probot** satırında 0.5.0 ya da daha yeni bir sürüm kur.
4. Arama kutusuna `prosdk` yaz.
5. **prosdk** satırında **Install**'a bas.
6. IDE eksik kütüphaneleri de kurmayı sorarsa **Install all**'a bas.

Sonuç: **File** > **Examples** menüsünde **prosdk** altında **TemplateTimed**, **GettingStarted** ve diğer örnekler görünür.

## Kütüphaneyi ZIP dosyasıyla kur {#zip}

prosdk yayınlanana kadar kurmanın yolu budur. Yayından önce ZIP dosyasının herkese açık bir indirme adresi yoktur; dosyayı Probot ekibinden iste. Dosyanın adı `prosdk-` ile başlar ve `.zip` ile biter.

prosdk'nin istediği Probot Core da yayından önce Kütüphane Yöneticisi'nde yoktur; oradaki `probot` sürümleri prosdk için eskidir. Probot Core'un ZIP dosyasını da Probot ekibinden iste. ZIP ile kurarken IDE bağımlı kütüphaneleri kurmaz; Probot Core'un durum LED'i için kullandığı `Adafruit NeoPixel`'i Kütüphane Yöneticisi'nden kurarsın. [Kütüphaneyi kur](#kutuphane) bölümündeki Blocks uyarısı burada da geçerlidir.

Daha önce Kütüphane Yöneticisi'nden bir `probot` kurduysan başlamadan önce onu kaldır.

1. prosdk'nin ve Probot Core'un ZIP dosyalarını bilgisayarına kaydet. Dosyaları arşivden çıkarma.
2. Arduino IDE'de **Sketch** > **Include Library** > **Add .ZIP Library...**'yi seç.
3. Açılan pencerede Probot Core'un ZIP dosyasını seç.
4. 2. ve 3. adımı prosdk'nin ZIP dosyasıyla tekrarla.
5. **Tools** > **Manage Libraries**'i seç.
6. Arama kutusuna `Adafruit NeoPixel` yaz.
7. **Adafruit NeoPixel** satırında **Install**'a bas.

Sonuç: **File** > **Examples** menüsünde **prosdk** altında **TemplateTimed** ve diğer örnekler görünür.

## Örneği derle {#ornegi-derle}

İlk derleme, kütüphanenin derlenmiş dosyası büyük olduğu için bir dakikadan uzun sürebilir. Sonraki derlemeler daha kısadır.

1. **File** > **Examples** > **prosdk** > **TemplateTimed**'ı seç. Örnek yeni bir pencerede açılır.
2. **File** > **Save As**'i seç ve sketch'i kendi klasörüne kaydet. Örnekler salt okunurdur.
3. Araç çubuğunda **Verify**'a (tik simgesi) bas.

Sonuç: **Output** panelinde "Using precompiled library in" ile başlayan bir satır ve şu iki satır görünür:

```text
Sketch uses 1813118 bytes (57%) of program storage space. Maximum is 3145728 bytes.
Global variables use 73448 bytes (22%) of dynamic memory, leaving 254232 bytes for local variables. Maximum is 327680 bytes.
```

Sayılar sürüme ve kütüphanelerin kurulu olduğu klasöre göre biraz değişir. "Maximum is 3145728 bytes" yazıyorsa **Huge APP** seçilidir.

TemplateTimed ağ adını (`PROBOT_WIFI_AP_SSID`) tanımlamaz. Bu yüzden Probot Core ağa `Probot-XXXXXX` biçiminde bir ad verir. Ağ adını ve şifreyi [İlk robot kodunu yaz](ilk-robotu-yaz.md) sayfasında kendin verirsin.

**File** > **Preferences**'ta **Compiler warnings** **None** dışında bir değerdeyse (**Default**, **More** ya da **All**) **Output** panelinde `PROBOT_WIFI_AP_SSID not defined` ile başlayan bir uyarı görürsün. Bu uyarı derlemeyi durdurmaz: ["PROBOT_WIFI_AP_SSID not defined"](sorunlar.md#ssid-yok).

## Sorun mu var?

- **"Sketch too big":** Bölümleme yanlış: ["Sketch too big"](sorunlar.md#sketch-too-big).
- **"prosdk requires probot-core 0.5.0 or later":** Probot Core eski: ["prosdk requires probot-core 0.5.0 or later"](sorunlar.md#eski-core).
- **`Include <prosdk.h> before <probot.h>`:** Başlık sırası yanlış: [`Include <prosdk.h> before <probot.h>`](sorunlar.md#include-sirasi).
- **"Precompiled library in ... not found":** Kart yanlış seçili: ["Precompiled library in ... not found"](sorunlar.md#kart).
- Diğer hatalar: [Derleme hataları](sorunlar.md#derleme).

## Sonraki adım

[İlk robot kodunu yaz](ilk-robotu-yaz.md)
