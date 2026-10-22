# Hatalar ve sorun giderme

Probot Core ile kurulumda, derlemede ve maç sırasında çıkan hataların sebebini ve çözümünü bu sayfada bulursun.

Sayfa probot-core 0.4.0'ı anlatır. Önce durum göstergelerine bak, sonra belirtinin başlığını bul. Ekranda bir yazı
çıktıysa başlıklar o yazıyla başlar. Kütüphanenin yazıları `[PB-E301]` gibi bir hata koduyla başlar; kodu
[Hata kodları](#hata-kodlari) tablosunda bul.

## Önce durum göstergelerine bak {#durum-gostergeleri}

Kartın üstündeki durum LED'i robotun o anki durumunu gösterir. Rengini kütüphane sürer; koddan
değiştirilemez. Driver Station da bazı durumları ekranın tamamını kaplayan bir yazıyla gösterir.

| Gösterge | Anlamı | Ne yap |
|---|---|---|
| LED mavi, sabit | Robot açık, Driver Station bağlı değil. | Robotun ağına bağlan ve tarayıcıda `http://192.168.4.1` adresini aç: [İlk 10 dakika](ilk-10-dakika.md). |
| LED mavi, yanıp sönüyor | Driver Station bağlı, robot duruyor. | **Match Control**'da **Autonomous** ya da **Teleoperated**'ı seç, sonra **Init**'e bas. |
| LED sarı, sabit | Init tamam, Start bekleniyor. | **Start**'a bas. |
| LED sarı, yanıp sönüyor | Otonom süresi doldu, teleop seçili, Init bekleniyor. | [Otonom bitti, teleop başlamıyor](#teleop-baslamiyor) bölümüne bak. |
| LED turuncu, yanıp sönüyor | Otonom çalışıyor. | Süre dolunca otonom durur. Teleop kendiliğinden başlamaz. |
| LED yeşil, yanıp sönüyor | Teleop çalışıyor. | Robotu kumandayla sür. |
| LED kırmızı, yanıp sönüyor | Kodun bir turu süresinde bitmedi. | [Loop takıldı](#pb-e301) bölümüne bak. |
| LED kırmızı, sabit | Acil durdurma kilitli. | [Acil durdurma kilidi](#pb-e302) bölümüne bak. |
| Sayfanın üstünde "PB-E301" bandı | Kodun bir turu takıldı. | [Loop takıldı](#pb-e301) bölümüne bak. |
| Driver Station'da "DISCONNECTED" | Arayüz 6 saniyedir robottan veri alamıyor. | [Bağlantı koptu](#pb-e303) bölümüne bak. |
| Driver Station'da "EMERGENCY STOPPED" | Acil durdurma kilitli. | [Acil durdurma kilidi](#pb-e302) bölümüne bak. |
| **System Status**'ta **Joystick** "None" | Sayfa kumanda görmüyor. | [Kumanda görünmüyor](#kumanda-baglanmiyor) bölümüne bak. |
| **Battery**'de "Veri yok" | Batarya ölçümü kurulu değil ya da sensör yanıt vermiyor. | [Batarya gerilimini ölç](bataryayi-olc.md), sensör varsa [PB-E306](#pb-e306). |
| **Event Log**'da "Komut reddedildi" | Komut robotun o anki aşamasında geçersiz. | [Komut reddedildi](#pb-e409) bölümüne bak. |

LED'in tüm renkleri ve ek sinyal lambası (RSL) için: [Durum LED'ini kullan](led-durumu.md).

<a id="hata-kodlar-pb-exxx"></a>
## Hata kodları {#hata-kodlari}

Kütüphanenin her hata yazısı kalıcı bir kod taşır. Kod derleme çıktısında, Telemetry panelinde, Serial
Monitor'de ve Driver Station'da aynıdır. İlk rakam hatanın nerede çıktığını söyler: 1 derleme, 2 bağlama
(link), 3 maç sırası, 4 Driver Station komutu.

| Kod | Nerede görünür | Anlamı |
|---|---|---|
| [PB-E101](#pb-e101) | Derleme | WiFi şifresi yok ya da 8 karakterden kısa. |
| [PB-E102](#pb-e102) | Derleme | WiFi kanalı yok ya da 1-13 dışında. |
| [PB-E103](#pb-e103) | Derleme | WiFi ağ adı boş ya da çok uzun. |
| [PB-E104](#pb-e104) | Derleme | Batarya gerilim bölücüsünün pini ya da dirençleri hatalı. |
| [PB-E105](#pb-e105) | Derleme | Batarya kaynağı ya da INA sensörü ayarı hatalı. |
| [PB-E106](#pb-e106) | Derleme | Kodda 0.4.0'da kaldırılan `robotInit()` ya da `robotEnd()` var. |
| [PB-E201](#pb-e201) | Bağlama | Zorunlu bir mod fonksiyonu eksik. |
| [PB-E202](#pb-e202) | Derleme | Kodda `setup()` ya da `loop()` var. |
| [PB-E301](#pb-e301) | Telemetry, Driver Station | Kodun bir turu süresinde bitmedi. |
| [PB-E302](#pb-e302) | Telemetry, Serial Monitor, Driver Station | Acil durdurma kilitli. |
| [PB-E303](#pb-e303) | Telemetry | Bağlantı koptu, robot durdu. |
| [PB-E304](#pb-e304) | Telemetry | Bağlantı koptu, robot durmadı. |
| [PB-E305](#pb-e305) | Serial Monitor | Acil durdurmada stop fonksiyonu bitmedi, kart yeniden başladı. |
| [PB-E306](#pb-e306) | Telemetry, Serial Monitor | Batarya sensörü yanıt vermiyor. |
| [PB-E409](#pb-e409) | Driver Station (**Event Log**) | Komut robotun o anki aşamasında geçersiz. |

## Kurulum ve yükleme {#kurulum-ve-yukleme}

Arduino IDE hatayı alt paneldeki çıktıda yazar. Kurulum adımları: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).

### Port listesi boş ya da yükleme başarısız {#port-yok}

**Tools** > **Port** listesi boş kalır ya da yükleme port hatasıyla durur.

| Sebep | Çözüm |
|---|---|
| USB kablosu yalnız şarj kablosu, veri taşımıyor. | Veri kablosu kullan. |
| Windows'ta USB sürücüsü (CH340 ya da CP210x) kurulu değil. | Sürücüyü üreticinin sitesinden kur. |
| USB portu ya da çoklayıcı sorunlu. | Kartı bilgisayarın kendi USB portuna tak. |
| Karta bağlı devre yüklemeyi bozuyor. | Devreyi sök, çıplak kartla yeniden dene. |

### "Sketch too big" {#sketch-too-big}

Sebep: Kod, varsayılan bölümlemenin (Partition Scheme) uygulama alanına sığmıyor. Kütüphane bu alanın büyük
kısmını kullanır; kodun büyüdükçe alan yetmez.

Çözüm: **Tools** > **Partition Scheme**'den **Huge APP (3MB No OTA/1MB SPIFFS)**'ı seç ve yeniden yükle.
Yeni bir sketch açınca ya da kartı yeniden seçince bu ayarı kontrol et.

Bkz. [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).

### "probot.h: No such file or directory" {#probot-h-yok}

Sebep: `probot` kütüphanesi kurulu değil.

Çözüm: **Tools** > **Manage Libraries**'i seç, `probot` yaz ve **Install**'a bas. Kütüphane sürümünün 0.4.0
olduğunu kontrol et.

### "Adafruit_NeoPixel.h: No such file or directory" {#neopixel-yok}

Sebep: Durum LED'ini süren `Adafruit NeoPixel` kütüphanesi kurulu değil. `probot` bu kütüphaneye bağlıdır.

Çözüm: **Manage Libraries**'te `adafruit neopixel` yaz ve kur. `probot`'u kurarken IDE bağımlılıkları
sorarsa **Install all**'a bas.

## Derleme hataları {#derleme-hatalari}

Bu hatalar kodundaki ayarlardan gelir. Derleme durur, karta bir şey yüklenmez. Hata satırı `error:` ile başlar;
kodu ve açıklamayı o satırda bulursun.

!!! note "Not"
    Ayar makroları her zaman `#include <probot.h>` satırından önce yazılır. Sonra yazılan makroyu
    kütüphane görmez. Tüm makrolar: [Ayar makroları](makro-listesi.md).

<a id="pb-e101"></a>
<a id="pb-e101-wifi-sifresi-eksik-veya-ksa"></a>
### "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." {#pb-e101-wifi-sifresi-eksik-veya-kisa}

Tam yazı:

```text
error: static assertion failed: [PB-E101] PROBOT_WIFI_AP_PASSWORD must be at least 8 characters. Docs: probotstudio.com/docs/hatalar/#pb-e101
```

Şifre makrosu hiç yoksa ya da `#include` satırından sonra yazıldıysa yazı şudur:

```text
error: #error "[PB-E101] Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h. Docs: probotstudio.com/docs/hatalar/#pb-e101"
```

Sebep: Robotun WiFi ağı şifresiz açılmaz. Şifre en az 8 karakter olmalı.

Çözüm: Şifreyi `#include <probot.h>`'den önce, en az 8 karakterle yaz:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>
```

Bkz. [Robotun WiFi ayarlarını yap](wifi-ayarla.md).

<a id="pb-e102"></a>
<a id="pb-e102-wifi-kanal-eksik-veya-gecersiz"></a>
### "PROBOT_WIFI_AP_CHANNEL must be 1-13." {#pb-e102-wifi-kanali-eksik-veya-gecersiz}

Tam yazı:

```text
error: static assertion failed: [PB-E102] PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only). Docs: probotstudio.com/docs/hatalar/#pb-e102
```

Kanal makrosu hiç yoksa yazı şudur:

```text
error: #error "[PB-E102] WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h. Docs: probotstudio.com/docs/hatalar/#pb-e102"
```

`PROBOT_WIFI_AUTO_CHANNEL 1` yazılıysa kanal 0-13 olabilir; dışındaysa yazı "PROBOT_WIFI_AP_CHANNEL must be 0-13"
ile başlar.

Sebep: Robotun yayın yapacağı 2,4 GHz kanalı derlemede belli olmalı. `PROBOT_WIFI_AP_CHANNEL` eksik ya da
1-13 dışında.

Çözüm: `#define PROBOT_WIFI_AP_CHANNEL 1` gibi 1 ile 13 arasında bir kanal yaz. Aynı salonda birden çok
robot varsa her robota farklı, sabit bir kanal ver; 1, 6 ve 11 önerilir.

Bkz. [Sinyal kalitesini artır](sinyali-iyilestir.md#kanal-plani).

<a id="pb-e103"></a>
### "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." {#pb-e103-ssid-uzunlugu}

Aynı kodla iki yazı daha çıkabilir:

```text
[PB-E103] PROBOT_WIFI_AP_SSID must be 32 characters or fewer.
[PB-E103] PROBOT_WIFI_AP_SSID must be at least 1 character.
```

Sebep: Ağ adı (SSID) en çok 32 karakter olabilir. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` tanımlıysa kütüphane adın
sonuna `-XXXXXX` biçiminde 7 karakterlik bir ek koyar; bu yüzden ad en çok 25 karakter olur. Ağ adını hiç
yazmazsan ad `Probot` olur ve ek kendiliğinden açılır.

Çözüm: Ağ adını kısalt. Ek açıksa en çok 25, kapalıysa en çok 32 karakter yaz. Boş ad (`""`) yazma.

<a id="pb-e104"></a>
<a id="pb-e104-batarya-adc-konfigurasyonu-gecersiz"></a>
### "PROBOT_BATTERY_ADC_PIN ADC1 pini olmali" {#batarya-adc-ayari}

Tam yazı:

```text
error: static assertion failed: [PB-E104] PROBOT_BATTERY_ADC_PIN ADC1 pini olmali (ESP32-S3: GPIO1-10). ADC2 (GPIO11-20) WiFi acikken calismaz. Docs: probotstudio.com/docs/hatalar/#pb-e104
```

Aynı kodla başka yazılar da çıkabilir:

```text
[PB-E104] Gerilim bolucu direncleri eksik: PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K (kilo-ohm) tanimlanmali.
[PB-E104] Bolucu direncleri pozitif olmali (kilo-ohm).
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti ADC'ye devredilemez.
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_RSL_PIN ile cakisiyor.
[PB-E104] PROBOT_BATTERY_ADC_PIN, NEOPIXEL_PIN ile cakisiyor.
```

Bu hatalar bataryayı gerilim bölücüyle ölçerken (`PROBOT_BATTERY_ADC_PIN`) çıkar.

| Sebep | Çözüm |
|---|---|
| Pin GPIO1-10 dışında. GPIO11-20 pinleri WiFi açıkken ölçüm yapamaz. | GPIO1-10 arasından bir pin seç. |
| `PROBOT_BATTERY_R_TOP_K` ya da `PROBOT_BATTERY_R_BOT_K` yazılmamış ya da 0. | İki direnci de kilo-ohm olarak yaz, ör. `100` ve `22`. |
| Batarya pini acil durdurma, sinyal lambası ya da durum LED'i pini ile aynı. | Bataryaya başka bir pin ver. |

```cpp
#define PROBOT_BATTERY_ADC_PIN  5     // GPIO1-10 arası
#define PROBOT_BATTERY_R_TOP_K  100   // bataryaya bağlı direnç, kilo-ohm
#define PROBOT_BATTERY_R_BOT_K  22    // GND'ye bağlı direnç, kilo-ohm
#include <probot.h>
```

Bkz. [Batarya gerilimini ölç](bataryayi-olc.md#gerilim-bolucu).

<a id="pb-e105"></a>
<a id="pb-e105-batarya-kaynak-secimi-gecersiz"></a>
### "Tek batarya kaynagi secin" {#batarya-kaynagi}

Tam yazı:

```text
error: #error "[PB-E105] Tek batarya kaynagi secin: PROBOT_BATTERY_ADC_PIN (bolucu) VEYA PROBOT_BATTERY_INA (I2C sensor), ikisi birden degil. Docs: probotstudio.com/docs/hatalar/#pb-e105"
```

Aynı kod INA sensörü ve ince ayar makroları hatalıyken de çıkar. Yazı makronun adını söyler.

| Sebep | Çözüm |
|---|---|
| Hem `PROBOT_BATTERY_ADC_PIN` hem `PROBOT_BATTERY_INA` yazılmış. | Yalnız birini bırak. |
| `PROBOT_BATTERY_INA` 219 ya da 226 değil. | Sensörünün numarasını yaz: `219` ya da `226`. |
| `PROBOT_BATTERY_INA_SDA` ile `PROBOT_BATTERY_INA_SCL`'den yalnız biri yazılmış ya da ikisi aynı pin. | İkisini de farklı pinlerle yaz ya da ikisini de sil. |
| INA'nın I2C pini acil durdurma ya da sinyal lambası pini ile aynı. | Sensöre başka pinler ver. |
| `PROBOT_BATTERY_TRIM` 0,5-2,0 dışında. | Oran çok farklıysa dirençlerin değerini düzelt; ince ayarı 0,5-2,0 arasında tut. |
| `PROBOT_BATTERY_INA_SHUNT_MOHM` 0 ya da eksi. | Modüldeki şönt direncini mili-ohm olarak yaz. |
| `PROBOT_BATTERY_INA_ADDR` 0x08-0x77 dışında. | Sensörün I2C adresini yaz; varsayılan `0x40`. |

```cpp
#define PROBOT_BATTERY_INA   226    // ya da 219; PROBOT_BATTERY_ADC_PIN ile birlikte yazılmaz
#include <probot.h>
```

Bkz. [INA sensörüyle ölç](bataryayi-olc.md#ina-sensoru).

<a id="pb-e106"></a>
<a id="pb-e106-kaldrlms-hook-robotinitrobotend"></a>
### "redefinition of 'void robotInit()'" {#pb-e106-kaldirilmis-hook-robotinit-robotend}

Derleme durur. Çıktıda şu satırlar görünür:

```text
error: redefinition of 'void robotInit()'
note: 'void robotInit()' previously defined here
void robotInit() = delete; // [PB-E106] removed in 0.4.0: move this code into teleopInit()/autonomousInit()
```

`note:` satırı `probot.h`'yi gösterir; PB-E106 kodu ve ne yapılacağı orada yazar. Aynı hata `robotEnd()` için de
çıkar: "move this code into teleopStop()/autonomousStop()".

Sebep: `robotInit()` ve `robotEnd()` 0.3.0'ın fonksiyonlarıdır, 0.4.0'da kaldırıldı. Kodun 0.3.0 için yazılmış.
Kütüphane eski kodun derlenip bu fonksiyonları hiç çağırmadan çalışmasını önlemek için derlemeyi durdurur.

Çözüm: İki fonksiyonu sil ve içlerindeki kodu taşı:

| 0.3.0'daki fonksiyon | Kodu nereye taşı |
|---|---|
| `robotInit()`: `pinMode`, başlangıç değerleri, kumanda eşlemesi | `autonomousInit()` ve `teleopInit()`; ikisi de aynı ortak fonksiyonu çağırsın |
| `robotEnd()`: motorları durdurma | `autonomousStop()` ve `teleopStop()`; ikisi de aynı ortak fonksiyonu çağırsın |

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

#define MOTOR_PIN 16   // pini kendi kartına göre değiştir

void motorlariDurdur() {   // eski robotEnd() içindeki kod
  analogWrite(MOTOR_PIN, 0);
}

void hazirla() {           // eski robotInit() içindeki kod
  pinMode(MOTOR_PIN, OUTPUT);
  motorlariDurdur();
}

void autonomousInit() { hazirla(); }           // Autonomous seçiliyken Init'te 1 kez
void autonomousLoop() {}                       // otonom boyunca tekrar tekrar
void autonomousStop() { motorlariDurdur(); }   // otonomdan her çıkışta 1 kez

void teleopInit() { hazirla(); }               // Teleoperated seçiliyken Init'te 1 kez
void teleopLoop() {}                           // teleop boyunca tekrar tekrar
void teleopStop() { motorlariDurdur(); }       // teleoptan her çıkışta 1 kez
```

Stop fonksiyonlarından biri eksikse PB-E106 düzeldikten sonra bağlama [PB-E201](#pb-e201) ile durur.
Bkz. [0.3.0 kodunu taşı](hooklari-yaz.md#gecis).

<a id="pb-e201"></a>
<a id="pb-e201-zorunlu-hook-tanmsz-undefined-reference"></a>
### "undefined reference to": zorunlu fonksiyon eksik {#pb-e201-zorunlu-hook-tanimsiz-undefined-reference}

Derleme geçer, bağlama (link) aşamasında durur. Çıktıda şu satırlar görünür:

```text
undefined reference to `_Z14autonomousStopv'
collect2: error: ld returned 1 exit status
```

`_Z14autonomousStopv`, derleyicinin `autonomousStop()` için kullandığı addır. Eksik fonksiyona göre ad değişir:
`_Z14autonomousLoopv`, `_Z10teleopLoopv` ya da `_Z10teleopStopv`.

Sebep: `autonomousLoop()`, `autonomousStop()`, `teleopLoop()` ve `teleopStop()` zorunludur. Biri eksikse kod
bağlanmaz. Init fonksiyonları ve ileri seviye fonksiyonlar isteğe bağlıdır; yazmazsan boş sayılır.

Çözüm: Dört zorunlu fonksiyonu da yaz; gövdesi boş olabilir. En kısa doğru iskelet:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void autonomousInit() {}   // isteğe bağlı: Init'te 1 kez
void autonomousLoop() {}   // zorunlu
void autonomousStop() {}   // zorunlu: motorları burada durdur

void teleopInit() {}       // isteğe bağlı: Init'te 1 kez
void teleopLoop() {}       // zorunlu
void teleopStop() {}       // zorunlu: motorları burada durdur
```

Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md#iskelet).

<a id="pb-e202"></a>
<a id="pb-e202-setuploop-caksmas-multiple-definition"></a>
### "redefinition of 'void setup()'" {#pb-e202-setuploop-cakismasi-multiple-definition}

Derleme durur. Çıktıda şu satırlar görünür:

```text
error: redefinition of 'void setup()'
note: 'void setup()' previously defined here
```

Aynı yazı `loop()` için de çıkar: "redefinition of 'void loop()'".

Sebep: `setup()` ve `loop()` kütüphaneye aittir. Kütüphane ikisini `probot.h` içinde tanımlar. Kodunda bir kez daha
tanımlanınca derleyici durur.

Çözüm: Kodundan `setup()` ve `loop()` fonksiyonlarını sil. Açılışta çalışacak kodu `autonomousInit()` ve
`teleopInit()`'e, tekrar eden kodu `autonomousLoop()` ya da `teleopLoop()`'a taşı.

Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).

## Bağlantı ve kumanda {#baglanti-ve-kumanda}

### Arayüz açılmıyor ya da "Another client is already connected." {#arayuz-acilmiyor}

Robot aynı anda tek cihaz kabul eder. Arayüzü ilk açan cihaz sahip olur; diğer cihazlar bu yazıyı görür (HTTP 403).

| Sebep | Çözüm |
|---|---|
| Başka bir cihazda Driver Station açık. | Öbür cihazda sekmeyi kapat ya da cihazı robotun ağından çıkar. 5 saniye sonra sayfayı yenile. |
| Cihaz robotun ağına bağlı değil. | WiFi listesinde robotun ağını seç, sonra `http://192.168.4.1` adresini aç. |
| Ağa bağlanınca karşılama sayfası açılmadı. | Tarayıcıda `http://192.168.4.1` adresini kendin aç. |
| Tarayıcı adresi `https://` ile açtı. | Adres çubuğuna `http://192.168.4.1` yaz. |

Bkz. [Driver Station arayüzü](arayuz.md).

### Kumanda görünmüyor: "Bağlı değil" {#kumanda-baglanmiyor}

**Dashboard**'daki **System Status**'ta **Joystick** "None" yazar ya da **Joystick** sekmesinde **Gamepad** kartı
"Bağlı değil" der. Eksen değerleri hiç değişmez.

| Sebep | Çözüm |
|---|---|
| Kumandada henüz bir düğmeye basılmadı. Tarayıcı kumandayı ilk düğme basışında tanır. | Kumandada herhangi bir düğmeye bas. |
| Kumanda başka bir cihaza bağlı. | Kumandayı Driver Station'ı açtığın telefona ya da tablete bağla. |
| Elinde kumanda yok. | **Joystick** sekmesindeki **Klavye** ya da **Dokunmatik** kartında **Etkinleştir**'e bas. Bkz. [Kumandasız sür](kumandayi-oku.md#kumandasiz-sur). |
| Kumanda bağlı ama robot **Init**'te tepki vermiyor. | Beklenen davranış: kumanda değerleri koda yalnız **Start**'tan sonra ulaşır. **Start**'a bas. |
| Kumanda bağlı ama eksenler ya da düğmeler karışık. | `teleopInit()` içinde kumandana uyan eşlemeyi seç, ör. `probot::io::joystick_mapping::setActiveByName("standard");`. Bkz. [Kumanda eşlemesini değiştir](kumandayi-oku.md#esleme). |

### Servo titriyor {#servo-titriyor}

Servo konumunu tutmaz, aralıklı seğirir ya da komut olmadan kıpırdar.

| Sebep | Çözüm |
|---|---|
| Servo ESP32'nin 5V ya da 3V3 pininden besleniyor; bu pinler servonun çektiği akımı veremez. | Servoya ayrı 5-6 V kaynak (BEC/UBEC) ver, toprakları (GND) ortak bağla. |
| Servo ile motorlar aynı LEDC zamanlayıcısını paylaşıyor. Motorların `analogWrite`'ı alt kanalları kullanır. | Servoya yüksek bir kanal ver: `teleopInit()` ve `autonomousInit()` içinde `ledcAttachChannel(SERVO_PIN, 50, 14, 7);` |
| PCA9685 kartında frekans 50 Hz değil. | Servo çıkışları için frekansı 50 Hz yap. |
| Servo kolu sıkışıyor ya da yük fazla. | Mekanizmayı elle oynat, sürtünmeyi gider. |

Bkz. [Servoyu sür](servoyu-sur.md).

## Maç sırasında {#mac-sirasinda}

<a id="pb-e301"></a>
<a id="deadline-miss"></a>
<a id="pb-e301-deadline-miss-loop-takld"></a>
### LED kırmızı yanıp sönüyor: loop takıldı {#pb-e301-deadline-miss-loop-takildi}

Driver Station'ın **Telemetry** panelinde şu satır çıkar:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

Sayfanın üstünde "PB-E301" ile başlayan kırmızı bir bant görünür. **System Status**'ta **Robot Code** "Stalled",
**Logs** sekmesinde **Deadline Miss** "YES" olur.

Sebep: Kodun bir turu süresinde bitmedi. İki süre vardır:

| Fonksiyon | Süre | Makro |
|---|---|---|
| Tekrar çağrılanlar: `autonomousLoop()`, `teleopLoop()`, `autonomousInitLoop()`, `teleopInitLoop()` | 2 saniye | `PROBOT_LOOP_DEADLINE_MS` (2000) |
| Bir kez çağrılanlar: init, start ve stop fonksiyonları | 10 saniye | `PROBOT_HOOK_DEADLINE_MS` (10000) |

`autonomousInit()` içinde birkaç saniye süren bir sensör kalibrasyonu bu yüzden hata vermez.

Kütüphane kumanda girişlerini sıfırlar ve LED'i kırmızıya alır. Kodunu durdurmaz, kartı yeniden başlatmaz.
Aşama değişmez: otonom otonomda, teleop teleopta kalır. Tur bitince hata kendiliğinden temizlenir.

!!! warning "Dikkat"
    Kütüphane motor pinlerine dokunmaz. Tur takılınca motorlar son verdiğin komutla dönmeye devam eder.
    **Stop** turun bitmesini bekler. Robotu anında durdurmak için **Emergency Stop**'a bas.

| Sebep | Çözüm |
|---|---|
| Loop içinde 2 saniye ya da daha uzun bir `delay()` var. | Bekleme yerine zamanı `millis()` ile ölç. Bkz. [Beklemeyi millis() ile yap](otonom-yaz.md#bekleme). |
| Loop içinde bir şeyi bekleyen `while` döngüsü var. | Koşulu her turda bir kez kontrol et, turu bitir. |
| I2C bağlı bir sensör yanıt vermiyor, çağrı dönmüyor. | `Wire.begin()`'den sonra `Wire.setTimeOut(50);` yaz. Sensörün kablosunu ve beslemesini kontrol et. |
| `Serial.println()` her turda çok yazı gönderiyor. | Serial yazılarını azalt ya da `probot::printf` kullan. |
| Init fonksiyonundaki kalibrasyon 10 saniyeden uzun sürüyor. | Kalibrasyonu kısalt ya da `autonomousInitLoop()` içinde turlara böl. |

Sebep bulunmuyorsa kodu adım adım sadeleştir: [Hatayı adım adım daralt](hatayi-daralt.md#en-sade-kod).

<a id="pb-e302"></a>
### "EMERGENCY STOPPED" {#pb-e302-emergency-stop-kilidi}

Driver Station'ı şu yazı kaplar, altında **Reboot Robot** düğmesi durur. LED kırmızı yanar ve sönmez.

```text
EMERGENCY STOPPED
Robot disabled — reboot required to clear · PB-E302 — docs/hatalar#pb-e302
```

**Telemetry** panelinde ve Serial Monitor'de şu satırlar çıkar:

```text
!! [PB-E302] EMERGENCY STOP — robot disabled, reboot required — docs/hatalar#pb-e302
[SYS  ] [PB-E302] EMERGENCY STOP — docs: probotstudio.com/docs/hatalar/#pb-e302
```

Sebep: Driver Station'da **Emergency Stop**'a ya da klavyede <kbd>Space</kbd>'e basıldı ya da kod
`probot::emergencyStop()` çağırdı. Bu bir arıza değil, güvenlik davranışıdır. Kütüphane kodunu keser. Robot
**Init**'te ya da çalışıyorsa o anki modun stop fonksiyonunu (`autonomousStop()` ya da `teleopStop()`) bir kez
çalıştırır. `PROBOT_ESTOP_ENABLE_PIN` tanımlıysa o pini LOW yapar.

Robot yeniden başlatılana kadar **Emergency Stop** ve **Reboot Robot** dışındaki komutları reddeder (HTTP 409).
Ret yazısı şudur:

```text
EMERGENCY STOPPED — reboot required
```

Çözüm: Kilidi yalnız yeniden başlatma açar. **Reboot Robot**'a bas ya da robotun gücünü kapatıp aç. Sonra
modu seç, **Init** ve **Start**'a yeniden bas.

<a id="pb-e303"></a>
<a id="pb-e303-baglant-kopmas-robot-durduruldu"></a>
### "DISCONNECTED": bağlantı koptu, robot durdu {#pb-e303-baglanti-kopmasi-robot-durduruldu}

Driver Station'ı "DISCONNECTED" ve "Trying to reconnect…" yazısı kaplar. Serial Monitor'de
"DS timeout: no activity for" ile başlayan bir satır çıkar. Kütüphane **Telemetry** paneline de şu satırı yazar:

```text
!! [PB-E303] DS CONNECTION LOST — stopping robot — docs/hatalar#pb-e303
```

Bağlantı kopunca kütüphane sırayla şunları yapar:

1. Kumanda verisi 500 ms gelmezse eksenler ve düğmeler sıfır okunur (`PROBOT_INPUT_TIMEOUT_MS`).
2. Sahip cihaz 5 saniye sessiz kalırsa sahiplik boşalır, kumanda verisi sıfırlanır (`PROBOT_DS_OWNER_TIMEOUT_MS`).
3. Driver Station 10 saniye sessiz kalırsa robot durur ve o anki modun stop fonksiyonu çalışır (`PROBOT_DS_TIMEOUT_MS`).

Bağlantı dönünce robot kendiliğinden başlamaz. Modu seç, **Init** ve **Start**'a yeniden bas.

| Sebep | Çözüm |
|---|---|
| Yakında aynı kanalda yayın yapan başka bir robot var. | Robotlara farklı, sabit kanallar ver; 1, 6 ve 11 önerilir. Kanalı kod yüklemeden **Logs** sekmesindeki **Kanal Değiştir**'den de değiştirebilirsin; maç sırasında değiştirme. |
| Çevrede açık telefon hotspot'ları var. | Maç sırasında robotun yakınında hotspot açtırma. |
| Tablet robottan uzak ya da arada engel var. | **Logs** sekmesindeki **RSSI** -70 dBm'den kötüyse tableti yaklaştır, anteni kontrol et. |
| Tablet kanal 12 ya da 13'ü görmüyor. | Robota 1-11 arası bir kanal ver. |

Bkz. [Sinyal kalitesini artır](sinyali-iyilestir.md).

<a id="pb-e304"></a>
<a id="pb-e304-baglant-kopmas-notr-bekleme"></a>
### Bağlantı koptu, robot durmadı {#pb-e304-baglanti-kopmasi-notr-bekleme}

**Telemetry** panelinde şu satır görünür:

```text
!! [PB-E304] DS CONNECTION LOST — joystick neutral, waiting reconnect — docs/hatalar#pb-e304
```

Sebep: Kodda `#define PROBOT_DS_TIMEOUT_FORCE_STOP 0` var. Bu ayarla robot 10 saniyelik sessizlikte durmaz.
Kumanda verisi sıfır okunur, `teleopLoop()` ya da `autonomousLoop()` çalışmaya devam eder. Bağlantı dönünce
robot kaldığı yerden sürer.

Çözüm: Bu ayarı seçtiysen davranış beklenendir. Otonom bu sürede de çalışır; robotun bağlantısız hareket
etmesini istemiyorsan makroyu sil (varsayılan `1`). Kopmanın sebepleri için: [Bağlantı koptu, robot durdu](#pb-e303).

<a id="pb-e305"></a>
<a id="pb-e305-e-stop-stop-hook-zaman-asm"></a>
### Acil durdurmadan sonra robot yeniden başladı {#pb-e305-e-stop-stop-hook-zaman-asimi}

Serial Monitor'de şu satır çıkar:

```text
[SYS  ] [PB-E305] estop stop hook timed out -> restart — docs: probotstudio.com/docs/hatalar/#pb-e305
```

Sebep: Acil durdurmada `autonomousStop()` ya da `teleopStop()` 500 ms içinde bitmedi (`PROBOT_ESTOP_END_MS`).
Kütüphane beklemek yerine kartı yeniden başlatır. Acil durdurma kodunu işin ortasında keser; bu yüzden stop
fonksiyonundaki bir I2C çağrısı da takılabilir.

Çözüm: Stop fonksiyonları kısa olsun: motor pinlerini sıfırla ve çık. İçine `delay()`, uzun döngü ya da zaman
aşımsız I2C çağrısı koyma.

<a id="pb-e306"></a>
<a id="pb-e306-batarya-sensorune-ulaslamyor"></a>
### "BATTERY SENSOR UNREACHABLE": batarya sensörü yanıt vermiyor {#pb-e306-batarya-sensorune-ulasilamiyor}

**Telemetry** panelinde ve Serial Monitor'de şu satırlar çıkar:

```text
!! [PB-E306] BATTERY SENSOR UNREACHABLE — INA I2C yanit vermiyor — docs/hatalar#pb-e306
[BATT ] [PB-E306] sensor unreachable — docs: probotstudio.com/docs/hatalar/#pb-e306
```

**Dashboard**'daki **Battery** göstergesi "Veri yok" der.

Sebep: Kodda `PROBOT_BATTERY_INA` var ama kütüphane INA219 ya da INA226 sensörünü I2C'de bulamıyor. Art arda dört
okuma başarısız olunca ölçüm düşer.

| Sebep | Çözüm |
|---|---|
| SDA, SCL ya da besleme kablosu gevşek. | Kabloları ve lehimleri kontrol et. |
| Sensörün adresi farklı. | Adresi `PROBOT_BATTERY_INA_ADDR` ile yaz; varsayılan `0x40`. |
| I2C hattında pull-up direnci yok. | Pull-up dirençleri olan bir modül kullan ya da dirençleri ekle. |
| Kodun aynı I2C hattına başka bir cihaz bağlıyor. | Kendi cihazını `Wire1`'e taşı ya da bataryayı gerilim bölücüyle ölç. |

Çözüm: Sensör yeniden yanıt verince ölçüm kendiliğinden döner. Serial Monitor'de `[BATT ] sensor recovered`
satırı çıkar. Bkz. [INA sensörüyle ölç](bataryayi-olc.md#ina-sensoru).

<a id="pb-e409"></a>
<a id="pb-e409-gecersiz-evrede-komut"></a>
### "Komut reddedildi": komut bu aşamada geçersiz {#komut-reddedildi}

**Logs** sekmesindeki **Event Log**'da şu biçimde bir satır çıkar (HTTP 409):

```text
Komut reddedildi (init): 409 [PB-E409] INIT requires STOPPED — docs/hatalar#pb-e409
```

Mod seçimi reddedilince satır "Mod değişmedi:" ile başlar. Arayüz bu durumlarda düğmeleri kapatır; yazı çoğunlukla
bir düğmeye art arda hızlı basınca çıkar.

| Yazı | Sebep | Çözüm |
|---|---|---|
| `STOP before changing mode` | Robot **Init**'teyken ya da çalışırken mod değiştirildi. | Önce **Stop**'a bas, sonra modu seç. |
| `INIT requires STOPPED` | Robot durmadan **Init** gönderildi. | **Stop**'a bas, sonra **Init**'e bas. |
| `START requires INIT` | Robot Init evresinde değil (**Init**'e basılmadı, robot zaten çalışıyor ya da otonom yeni bitti) veya **Start** zaten kabul edildi. | Önce **Init**'e bas; LED sarı sabit olunca **Start**'a bas. Init fonksiyonunun bitmesini beklemen gerekmez; **Start** sıraya alınır. |
| `STOP requires INIT or RUN` | Robot zaten duruyor. | Bir şey yapma. Modu seç ve **Init**'e bas. |

Bkz. [Maç akışını izle](hooklari-yaz.md#mac-akisi).

### Otonom bitti, teleop başlamıyor {#teleop-baslamiyor}

Otonom süresi dolunca robot durur, LED sarı yanıp söner. **Match Control**'daki düğmenin yazısı **Init Teleop** olur.

Sebep: Bu bir arıza değildir. 0.4.0'da otonom süresi dolunca `autonomousStop()` bir kez çalışır ve **Teleoperated**
seçilir. Teleop kendiliğinden başlamaz.

Çözüm: **Init Teleop**'a, sonra **Start**'a bas. Bkz. [Maç akışını izle](hooklari-yaz.md#mac-akisi).

### Stop'tan sonra motorlar durmuyor {#motorlar-durmuyor}

Stop'ta kütüphane o anki modun stop fonksiyonunu çağırır: otonomda `autonomousStop()`, teleopta `teleopStop()`.
Otonom süresi dolunca, bağlantı kopunca ve acil durdurmada da aynı fonksiyon çalışır. Motorları durdurmak
senin kodunun işidir. Stop fonksiyonu, o anki loop turu bittikten sonra çalışır.

| Sebep | Çözüm |
|---|---|
| Stop fonksiyonu boş ya da motorları durdurmuyor. | Motorları durduran kodu stop fonksiyonuna yaz. Örnek aşağıda. |
| Durdurma kodu yalnız bir modun stop fonksiyonunda. | Ortak bir durdurma fonksiyonu yaz, `autonomousStop()` ve `teleopStop()` ikisi de onu çağırsın. |
| Loop turu uzun sürüyor; stop fonksiyonu turun bitmesini bekliyor. | Loop'taki uzun beklemeleri kaldır. Anında durdurmak için **Emergency Stop**'a bas. |

Tek motorlu, BTS7960 tarzı sürücüyle örnek:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Pinleri kendi kartına göre değiştir
#define MOTOR_RPWM 5   // ileri
#define MOTOR_LPWM 6   // geri

void motorSur(float guc) {
  int duty = (int)(fabsf(guc) * 255.0f);
  if (duty > 255) duty = 255;
  if (guc > 0.02f)       { analogWrite(MOTOR_RPWM, duty); analogWrite(MOTOR_LPWM, 0); }
  else if (guc < -0.02f) { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, duty); }
  else                   { analogWrite(MOTOR_RPWM, 0);    analogWrite(MOTOR_LPWM, 0); }
}

void motorHazirla() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  motorSur(0);
}

void autonomousInit() { motorHazirla(); }
void autonomousLoop() {}
void autonomousStop() { motorSur(0); }   // otonom bitince ya da Stop'ta motor durur

void teleopInit() { motorHazirla(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motorSur(js.getLeftY());   // sol çubuk ileri: motor ileri
}

void teleopStop() { motorSur(0); }       // Stop'ta motor durur
```

Bkz. [Motorları Stop'ta durdur](hooklari-yaz.md#robotend).

## Hata bildir {#hata-bildir}

Bu sayfada çözümü olmayan bir hatayı kütüphanenin GitHub sayfasında bildir:
[github.com/probot-studio/probot-core/issues](https://github.com/probot-studio/probot-core/issues).

Mesaja şunları yaz:

- Hatayı gösteren en kısa kod.
- Seçili mod ve son bastığın düğme (ör. **Teleoperated**, **Start**).
- Ekrandaki, Telemetry panelindeki ya da Serial Monitor'deki yazı, birebir. Hata kodu varsa onu da yaz.
- Kütüphane sürümü (0.4.0) ve kullandığın tarayıcı.
