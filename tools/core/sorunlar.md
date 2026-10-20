# Hatalar ve sorun giderme

Probot Core ile kurulumda, derlemede ve maç sırasında çıkan hataların sebebini ve çözümünü bu sayfada bulursun.

Sayfa probot-core 0.3.0'ı anlatır. Probot Blocks da 0.3.0 kodu üretir. Önce durum göstergelerine bak,
sonra belirtinin başlığını bul. Ekranda bir yazı çıktıysa başlıklar o yazıyla başlar.

<a id="hata-kodlar-pb-exxx"></a>
<a id="pb-e104"></a>
<a id="pb-e104-batarya-adc-konfigurasyonu-gecersiz"></a>
<a id="pb-e105"></a>
<a id="pb-e105-batarya-kaynak-secimi-gecersiz"></a>
<a id="pb-e306"></a>
<a id="pb-e306-batarya-sensorune-ulaslamyor"></a>
<a id="pb-e409"></a>
<a id="pb-e409-gecersiz-evrede-komut"></a>
## Önce durum göstergelerine bak {#durum-gostergeleri}

Kartın üstündeki durum LED'i robotun o anki durumunu gösterir. Rengini kütüphane sürer; koddan
değiştirilemez. Driver Station da bazı durumları ekranın tamamını kaplayan bir yazıyla gösterir.

| Gösterge | Anlamı | Ne yap |
|---|---|---|
| LED mavi, sabit | Robot açık, Driver Station bağlı değil. | Robotun ağına bağlan ve tarayıcıda `http://192.168.4.1` adresini aç: [İlk 10 dakika](ilk-10-dakika.md). |
| LED mavi, yanıp sönüyor | Driver Station bağlı, Init bekleniyor. | Driver Station'da **Init**'e bas. |
| LED sarı, sabit | Init tamam, Start bekleniyor. | **Start**'a bas. |
| LED turuncu, yanıp sönüyor | Otonom çalışıyor. | Otonom süresi dolunca teleop kendiliğinden başlar. |
| LED yeşil, yanıp sönüyor | Teleop çalışıyor. | Robotu kumandayla sür. |
| LED kırmızı, yanıp sönüyor | Bir loop turu 2 saniyede bitmedi. | [Loop takıldı](#pb-e301) bölümüne bak. |
| LED kırmızı, sabit | Acil durdurma kilitli. | [Acil durdurma kilidi](#pb-e302) bölümüne bak. |
| Driver Station'da "DISCONNECTED" | Arayüz 6 saniyedir robottan veri alamıyor. | [Bağlantı koptu](#pb-e303) bölümüne bak. |
| Driver Station'da "EMERGENCY STOPPED" | Acil durdurma kilitli. | [Acil durdurma kilidi](#pb-e302) bölümüne bak. |
| Kumanda durumu "Not Connected" | Tarayıcı kumandayı görmüyor. | [Kumanda "Not Connected"](#kumanda-baglanmiyor) bölümüne bak. |
| **Logs** sekmesinde **Deadline Miss** "YES" | Bir loop turu takıldı. | [Loop takıldı](#pb-e301) bölümüne bak. |

LED'in tüm renkleri ve ek sinyal lambası (RSL) için: [Durum LED'ini kullan](led-durumu.md).

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

Sebep: Kod, varsayılan bölümlemenin (Partition Scheme) uygulama alanına sığmıyor. Kütüphane bu alanın yaklaşık
dörtte üçünü kullanır; büyük kodlarda alan yetmez.

Çözüm: **Tools** > **Partition Scheme**'den **Huge APP (3MB No OTA/1MB SPIFFS)**'ı seç ve yeniden yükle.
Yeni bir sketch açınca ya da kartı yeniden seçince bu ayarı kontrol et.

Bkz. [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).

### "probot.h: No such file or directory" {#probot-h-yok}

Sebep: `probot` kütüphanesi kurulu değil.

Çözüm: **Tools** > **Manage Libraries**'i seç, `probot` yaz ve **Install**'a bas.

### "Adafruit_NeoPixel.h: No such file or directory" {#neopixel-yok}

Sebep: Durum LED'ini süren `Adafruit NeoPixel` kütüphanesi kurulu değil. `probot` bu kütüphaneye bağlıdır.

Çözüm: **Manage Libraries**'te `adafruit neopixel` yaz ve kur. `probot`'u kurarken IDE bağımlılıkları
sorarsa **Install all**'a bas.

## Derleme hataları {#derleme-hatalari}

Bu hatalar kodundaki ayarlardan gelir. Derleme durur, karta bir şey yüklenmez.

!!! note "Not"
    Ayar makroları her zaman `#include <probot.h>` satırından önce yazılır. Sonra yazılan makroyu
    kütüphane görmez. Tüm makrolar: [Ayar makroları](makro-listesi.md).

<a id="pb-e101"></a>
<a id="pb-e101-wifi-sifresi-eksik-veya-ksa"></a>
### "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." {#pb-e101-wifi-sifresi-eksik-veya-kisa}

Şifre makrosu hiç yoksa ya da `#include` satırından sonra yazıldıysa yazı şudur:

```text
Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h.
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

Tam yazı: "PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only)."

Kanal makrosu hiç yoksa yazı şudur:

```text
WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h.
```

Sebep: Robotun yayın yapacağı 2,4 GHz kanalı derlemede belli olmalı. `PROBOT_WIFI_AP_CHANNEL` eksik ya da
1-13 dışında.

Çözüm: `#define PROBOT_WIFI_AP_CHANNEL 1` gibi 1 ile 13 arasında bir kanal yaz. Aynı salonda birden çok
robot varsa her robota 1, 5, 9 ve 13 arasından farklı bir kanal ver.

Bkz. [Sinyal kalitesini artır](sinyali-iyilestir.md).

<a id="pb-e103"></a>
### "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." {#pb-e103-ssid-uzunlugu}

Aynı başlıkta iki yazı daha çıkabilir:

```text
PROBOT_WIFI_AP_SSID must be 32 characters or fewer.
PROBOT_WIFI_AP_SSID must be at least 1 character.
```

Sebep: Ağ adı (SSID) en çok 32 karakter olabilir. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` tanımlıysa kütüphane adın
sonuna `-XXXXXX` biçiminde 7 karakterlik bir ek koyar; bu yüzden ad en çok 25 karakter olur. Ağ adını hiç
yazmazsan ad `Probot` olur ve ek kendiliğinden açılır.

Çözüm: Ağ adını kısalt. Ek açıksa en çok 25, kapalıysa en çok 32 karakter yaz. Boş ad (`""`) yazma.

<a id="pb-e201"></a>
<a id="pb-e201-zorunlu-hook-tanmsz-undefined-reference"></a>
### "undefined reference to `robotEnd()'" {#pb-e201-zorunlu-hook-tanimsiz-undefined-reference}

Derleme geçer, bağlama (link) aşamasında durur. Eksik fonksiyona göre ad değişir: `robotInit()`,
`teleopInit()`, `teleopLoop()`, `autonomousInit()` ya da `autonomousLoop()`.

Sebep: 0.3.0'da altı fonksiyonun altısı da zorunludur. Biri eksikse kod bağlanmaz.

Çözüm: Altı fonksiyonu da yaz; gövdesi boş olabilir. En kısa doğru iskelet:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void robotInit() {}        // Init'e basınca 1 kez
void robotEnd() {}         // Stop'ta 1 kez: motorları burada durdur
void teleopInit() {}       // teleop başlarken 1 kez
void teleopLoop() {}       // teleop boyunca tekrar tekrar
void autonomousInit() {}   // otonom başlarken 1 kez
void autonomousLoop() {}   // otonom boyunca tekrar tekrar
```

Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).

<a id="pb-e202"></a>
<a id="pb-e202-setuploop-caksmas-multiple-definition"></a>
### "redefinition of 'void setup()'" {#pb-e202-setuploop-cakismasi-multiple-definition}

Aynı yazı `loop()` için de çıkar: "redefinition of 'void loop()'".

Sebep: `setup()` ve `loop()` kütüphaneye aittir. Kütüphane ikisini `probot.h` içinde tanımlar. Kodunda bir kez daha
tanımlanınca derleyici durur.

Çözüm: Kodundan `setup()` ve `loop()` fonksiyonlarını sil. Açılışta çalışacak kodu `robotInit()`'e, tekrar
eden kodu `teleopLoop()` ya da `autonomousLoop()`'a taşı.

Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).

## Bağlantı ve kumanda {#baglanti-ve-kumanda}

### Arayüz açılmıyor ya da "Another client is already connected." {#arayuz-acilmiyor}

Robot aynı anda tek cihaz kabul eder. Arayüzü ilk açan cihaz sahip olur; diğer cihazlar bu yazıyı görür (HTTP 403).

| Sebep | Çözüm |
|---|---|
| Başka bir cihazda Driver Station açık. | Öbür cihazda sekmeyi kapat ya da cihazı robotun ağından çıkar. 5 saniye sonra sayfayı yenile. |
| Cihaz robotun ağına bağlı değil. | WiFi listesinde robotun ağını seç, sonra `http://192.168.4.1` adresini aç. |
| Tarayıcı adresi `https://` ile açtı. | Adres çubuğuna `http://192.168.4.1` yaz. |

Bkz. [Driver Station arayüzü](arayuz.md).

### Kumanda "Not Connected" {#kumanda-baglanmiyor}

Driver Station'da kumanda durumu "Not Connected" yazar ya da eksen değerleri hiç değişmez.

| Sebep | Çözüm |
|---|---|
| Kumandada henüz bir düğmeye basılmadı. Tarayıcı kumandayı ilk düğme basışında tanır. **Joystick** sekmesinde "Press any controller button to activate." yazar. | Kumandada herhangi bir düğmeye bas. |
| Kumanda başka bir cihaza bağlı. | Kumandayı Driver Station'ı açtığın telefona ya da tablete bağla. |
| Kumanda bağlı ama eksenler ya da düğmeler karışık. | `robotInit()` içinde kumandana uyan eşlemeyi seç, ör. `probot::io::joystick_mapping::setActiveByName("standard");`. Bkz. [Kumanda verisini oku](kumandayi-oku.md). |

### Servo titriyor {#servo-titriyor}

Servo konumunu tutmaz, aralıklı seğirir ya da komut olmadan kıpırdar.

| Sebep | Çözüm |
|---|---|
| Servo ESP32'nin 5V ya da 3V3 pininden besleniyor; bu pinler servonun çektiği akımı veremez. | Servoya ayrı 5-6 V kaynak (BEC/UBEC) ver, toprakları (GND) ortak bağla. |
| Servo ile motorlar aynı LEDC zamanlayıcısını paylaşıyor. Motorların `analogWrite`'ı alt kanalları kullanır. | Servoya yüksek bir kanal ver: `ledcAttachChannel(SERVO_PIN, 50, 14, 7);` |
| PCA9685 kartında frekans 50 Hz değil. | Servo çıkışları için frekansı 50 Hz yap. |
| Servo kolu sıkışıyor ya da yük fazla. | Mekanizmayı elle oynat, sürtünmeyi gider. |

Bkz. [Servoyu sür](servoyu-sur.md).

## Maç sırasında {#mac-sirasinda}

<a id="pb-e301"></a>
<a id="deadline-miss"></a>
<a id="pb-e301-deadline-miss-loop-takld"></a>
### LED kırmızı yanıp sönüyor: loop takıldı {#pb-e301-deadline-miss-loop-takildi}

Driver Station'ın **Telemetry** panelinde şu satır çıkar. **Logs** sekmesinde **Deadline Miss** "YES" olur.

```text
!! LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

Sebep: `teleopLoop()` ya da `autonomousLoop()` 2 saniye içinde bitmedi. Bu süre `PROBOT_LOOP_DEADLINE_MS`
makrosudur (varsayılan 2000 ms).

Kütüphane kumanda girişlerini sıfırlar ve LED'i kırmızıya alır. Görevini öldürmez, kartı yeniden başlatmaz. Faz
değişmez: otonom otonomda, teleop teleopta kalır. Tur bitince hata kendiliğinden temizlenir.

!!! warning "Dikkat"
    Kütüphane motor pinlerine dokunmaz. Tur takılınca motorlar son verdiğin komutla dönmeye devam eder.
    Robotu durdurmak için **EMERGENCY STOP**'a bas.

| Sebep | Çözüm |
|---|---|
| Loop içinde 2 saniye ya da daha uzun bir `delay()` var. | Bekleme yerine zamanı `millis()` ile ölç. Bkz. [Otonomu yaz](otonom-yaz.md). |
| Loop içinde bir şeyi bekleyen `while` döngüsü var. | Koşulu her turda bir kez kontrol et, turu bitir. |
| I2C bağlı bir sensör yanıt vermiyor, çağrı dönmüyor. | Sensörün kablosunu ve beslemesini kontrol et. Şüpheli çağrıyı kapatıp yeniden dene. |
| Turda 2 saniyeden uzun süren bir hesap var. | Hesabı birkaç tura böl. |

Sebep bulunmuyorsa loop'u adım adım sadeleştir: [Hatayı adım adım daralt](hatayi-daralt.md#en-sade-kod).

<a id="pb-e302"></a>
### "EMERGENCY STOPPED" {#pb-e302-emergency-stop-kilidi}

Driver Station'ı şu yazı kaplar, altında **Reboot Robot** düğmesi durur. LED kırmızı yanar ve sönmez.

```text
EMERGENCY STOPPED
Robot disabled — reboot required to clear
```

**Telemetry** panelinde ve Serial Monitor'de şu satırlar çıkar:

```text
!! EMERGENCY STOP — robot disabled, reboot required
[SYS  ] EMERGENCY STOP
```

Sebep: Driver Station'da **EMERGENCY STOP**'a basıldı ya da kod `probot::emergencyStop()` çağırdı. Bu bir arıza
değil, güvenlik davranışıdır. Kütüphane kullanıcı görevini durdurur, `robotEnd()`'i bir kez çalıştırır ve
`PROBOT_ESTOP_ENABLE_PIN` tanımlıysa o pini LOW yapar. Robot yeniden başlatılana kadar **EMERGENCY STOP** ve
**Reboot Robot** dışındaki komutları reddeder (HTTP 409).

Çözüm: Kilidi yalnız yeniden başlatma açar. **Reboot Robot**'a bas ya da robotun gücünü kapatıp aç. Sonra
**Init** ve **Start**'a yeniden bas.

<a id="pb-e303"></a>
<a id="pb-e303-baglant-kopmas-robot-durduruldu"></a>
### "DISCONNECTED": bağlantı koptu, robot durdu {#pb-e303-baglanti-kopmasi-robot-durduruldu}

Driver Station'ı "DISCONNECTED" ve "Trying to reconnect..." yazısı kaplar. Serial Monitor'de
"DS timeout: no activity for" ile başlayan bir satır çıkar. Kütüphane **Telemetry** paneline de şu satırı yazar:

```text
!! DS CONNECTION LOST — stopping robot
```

Bağlantı kopunca kütüphane sırayla şunları yapar:

1. Kumanda verisi 500 ms gelmezse eksenler ve düğmeler sıfır okunur (`PROBOT_INPUT_TIMEOUT_MS`).
2. Sahip cihaz 5 saniye sessiz kalırsa sahiplik boşalır, kumanda verisi sıfırlanır (`PROBOT_DS_OWNER_TIMEOUT_MS`).
3. Driver Station 10 saniye sessiz kalırsa robot durur ve `robotEnd()` çalışır (`PROBOT_DS_TIMEOUT_MS`).

Bağlantı dönünce robot kendiliğinden başlamaz. **Init** ve **Start**'a yeniden bas.

| Sebep | Çözüm |
|---|---|
| Yakında aynı kanalda yayın yapan başka bir robot var. | Robotlara 1, 5, 9 ve 13 arasından farklı sabit kanallar ver. Kanalı yeniden yüklemeden **Logs** sekmesindeki **Kanal Değiştir**'den de değiştirebilirsin; maç sırasında değiştirme. |
| Çevrede açık telefon hotspot'ları var. | Maç sırasında robotun yakınında hotspot açtırma. |
| Tablet robottan uzak ya da arada engel var. | **Logs** sekmesindeki **RSSI** -70 dBm'den kötüyse tableti yaklaştır, anteni kontrol et. |
| Tablet kanal 12 ya da 13'ü görmüyor. | Robota 1-11 arası bir kanal ver. |

Bkz. [Sinyal kalitesini artır](sinyali-iyilestir.md).

<a id="pb-e304"></a>
<a id="pb-e304-baglant-kopmas-notr-bekleme"></a>
### Bağlantı koptu, robot durmadı {#pb-e304-baglanti-kopmasi-notr-bekleme}

**Telemetry** panelinde şu satır görünür:

```text
!! DS CONNECTION LOST — joystick neutral, waiting reconnect
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
[SYS  ] estop robotEnd timed out -> restart
```

Sebep: Acil durdurmada `robotEnd()` 500 ms içinde bitmedi (`PROBOT_ESTOP_END_MS`). Kütüphane beklemek yerine
kartı yeniden başlatır. Acil durdurma kullanıcı görevini işin ortasında keser; bu yüzden `robotEnd()` içindeki bir
I2C çağrısı da takılabilir.

Çözüm: `robotEnd()` kısa olsun: motor pinlerini sıfırla ve çık. İçine `delay()`, uzun döngü ya da zaman aşımsız
I2C çağrısı koyma.

### Stop'tan sonra motorlar durmuyor {#motorlar-durmuyor}

Stop'ta kütüphane `robotEnd()`'i çağırır. Motorları durdurmak senin kodunun işidir. `robotEnd()`, o anki
loop turu bittikten sonra çalışır.

| Sebep | Çözüm |
|---|---|
| `robotEnd()` boş ya da motorları durdurmuyor. | Motorları durduran kodu `robotEnd()`'e yaz. Örnek aşağıda. |
| Loop turu uzun sürüyor; `robotEnd()` turun bitmesini bekliyor. | Loop'taki uzun beklemeleri kaldır. Anında durdurmak için **EMERGENCY STOP**'a bas. |

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

void robotInit() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  motorSur(0);
}

void robotEnd() {
  motorSur(0);   // Stop'ta motor durur
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motorSur(js.getLeftY());   // sol çubuk ileri: motor ileri
}

void autonomousInit() {}
void autonomousLoop() {}
```

Bkz. [Motoru sür](motoru-sur.md).

## Hata bildir {#hata-bildir}

Bu sayfada çözümü olmayan bir hatayı kütüphanenin GitHub sayfasında bildir:
[github.com/probot-studio/probot-core/issues](https://github.com/probot-studio/probot-core/issues).

Mesaja şunları yaz:

- Hatayı gösteren en kısa kod.
- Son bastığın düğme (ör. **Init**, **Start**).
- Ekrandaki, Telemetry panelindeki ya da Serial Monitor'deki yazı, birebir.
- Kütüphane sürümü (0.3.0) ve kullandığın tarayıcı.
