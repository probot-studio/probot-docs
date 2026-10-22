# Ayar makroları

Bu sayfa Probot Core 0.4.0'ın `#define` ile değiştirilen bütün ayarlarını varsayılan değerleri ve ne işe yaradıklarıyla listeler.

## Makro nasıl yazılır {#nasil-yazilir}

Makrolar `#include <probot.h>` satırından **önce** yazılır. Sonra yazılan bir makro etkisiz kalır; şifre ve kanal ise hiç tanımlanmamış sayılır ve kod derlenmez.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"       // ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // zorunlu, en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1              // zorunlu, 1-13

#include <probot.h>
```

Değeri olmayan bir makro (ör. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX`) değersiz yazılır: `#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX`.

<a id="tum-makrolar"></a>
## WiFi {#wifi}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `PROBOT_WIFI_AP_SSID` | `Probot-XXXXXX` | Robotun ağ adı. Tanımsızsa `Probot` adına MAC adresinden 6 karakter eklenir ve derlemede uyarı çıkar. En çok 32 karakter; MAC eki açıkken en çok 25. |
| `PROBOT_WIFI_AP_PASSWORD` | yok (zorunlu) | Ağ şifresi, en az 8 karakter. |
| `PROBOT_WIFI_AP_CHANNEL` | yok (zorunlu) | WiFi kanalı, 1-13. Driver Station'ın **Logs** sekmesindeki **Kanal Değiştir** ile kaydedilen kanal bu makronun önüne geçer. Kanal seçimi: [Robotun WiFi ayarlarını yap](wifi-ayarla.md). |
| `PROBOT_WIFI_AUTO_CHANNEL` | `0` | `1`: robot her açılışta bandı tarar ve 1, 6, 11 kanallarından en boşunu seçer; açılış 2-3 saniye uzar. Bu modda da `PROBOT_WIFI_AP_CHANNEL` yazılmalıdır (0-13 kabul edilir). Aynı anda açılan robotlar aynı kanala düşebileceği için birden çok robotta önerilmez. |
| `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` | kapalı | Değersiz yazılır. Ağ adının sonuna `-XXXXXX` (MAC adresinden 6 karakter) ekler. Aynı kodu birden çok robota yüklerken ağ adları ayrı olur. |
| `PROBOT_WIFI_ENABLE_11B` | `0` | `1`: 802.11b hızlarını açar. Yalnız 802.11g'den eski cihazlar için. |
| `PROBOT_WIFI_PMF_REQUIRED` | `0` | `1`: PMF (802.11w) zorunlu olur. Sahte bağlantı kesme saldırısını engeller; eski tabletler bağlanamayabilir. |
| `PROBOT_CAPTIVE_PORTAL` | `1` | Robotun ağına katılan cihazda karşılama sayfası kendiliğinden açılır. `0` kapatır. |

## Bağlantı güvenliği {#baglanti}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `PROBOT_INPUT_TIMEOUT_MS` | `500` | Kumanda verisi bu kadar milisaniye gelmezse bütün eksen ve tuşlar sıfır okunur. |
| `PROBOT_DS_OWNER_TIMEOUT_MS` | `5000` | Robotu yöneten cihaz bu süre hiç istek göndermezse yeri boşalır; başka bir cihaz Driver Station'ı açabilir. |
| `PROBOT_DS_TIMEOUT_MS` | `10000` | Driver Station bu süre tamamen sessiz kalırsa bağlantı kopmuş sayılır. |
| `PROBOT_DS_TIMEOUT_FORCE_STOP` | `1` | `1`: bağlantı kopunca robot Stop'a geçer ve çalışan modun stop fonksiyonu çalışır. `0`: loop'lar sürer, kumanda nötr okunur, bağlantı dönünce kaldığı yerden devam eder. `0` bağlantı kopunca robotu durdurmadan bekletmek içindir (tezgahta deneme); yarışmada `1` kalmalı. |

## Döngü ve acil durdurma {#dongu}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `USER_LOOP_PERIOD_MS` | `20` | Loop ve initLoop fonksiyonlarının çağrıları arasında kütüphanenin beklediği süre (ms). |
| `PROBOT_LOOP_DEADLINE_MS` | `2000` | Bir loop ya da initLoop turu bu süreyi aşarsa kumanda girişleri sıfırlanır ve durum LED'i kırmızı yanıp söner. Görev durdurulmaz, kart yeniden başlamaz; tur bitince temizlenir. |
| `PROBOT_HOOK_DEADLINE_MS` | `10000` | Bir kez çalışan init, start ve stop fonksiyonları için aynı sınır (ms). Sensör kalibrasyonu gibi uzun işlere yer bırakır. `PROBOT_LOOP_DEADLINE_MS`'den küçük olamaz; küçük yazarsan kod derlenmez. |
| `PROBOT_WDT_TIMEOUT_S` | `8` | Donanım watchdog süresi (saniye). Yalnız kütüphanenin kendi görevini izler; senin loop'un kartı yeniden başlatmaz. `PROBOT_LOOP_DEADLINE_MS`'den uzun kalmalı. |
| `PROBOT_ESTOP_END_MS` | `500` | Acil durdurmada çalışan modun stop fonksiyonuna verilen süre (ms). Aşılırsa kart yeniden başlar. |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | Kütüphanenin sürdüğü enable pini; `-1` kapalı. Açılışta HIGH, acil durdurmada LOW olur. Motor sürücülerinin enable hattına bağlarsan acil durdurma motorları sürücü seviyesinde de keser. |

## LED {#led}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `NEOPIXEL_PIN` | `3` | Durum LED'inin pini. Renklerin anlamı: [Durum LED'ini kullan](led-durumu.md). |
| `NEOPIXEL_COUNT` | `1` | LED sayısı. Kütüphane yalnız ilk LED'i boyar. |
| `NEOPIXEL_BRIGHTNESS` | `32` | Durum LED'inin parlaklığı, 0-255. |
| `PROBOT_RSL_PIN` | `-1` | Sinyal lambası (RSL) pini; `-1` kapalı. Bir mod çalışırken (**Start**'tan sonra) yanıp söner. Init evresinde, robot dururken, geçişte ve acil durdurmada sabit yanar. |

## Batarya {#batarya}

Bu makrolar kütüphanenin batarya gerilimini kendisi ölçmesini sağlar. İki yöntemden birini seç: gerilim bölücü (`PROBOT_BATTERY_ADC_PIN`) ya da INA219 / INA226 sensörü (`PROBOT_BATTERY_INA`). İkisi birden yazılırsa kod derlenmez. Hiçbiri yoksa ölçüm kapalıdır. Devre ve kod: [Batarya gerilimini ölç](bataryayi-olc.md).

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `PROBOT_BATTERY_ADC_PIN` | kapalı | Gerilim bölücünün orta ucunun bağlı olduğu pin. ESP32-S3'te bir ADC1 pini olmalı (GPIO1-10); ADC2 pinleri WiFi açıkken okunamaz. |
| `PROBOT_BATTERY_R_TOP_K` | yok | Bölücünün batarya tarafındaki direnci (kΩ). `PROBOT_BATTERY_ADC_PIN` ile zorunlu. 3S LiPo için `100`. |
| `PROBOT_BATTERY_R_BOT_K` | yok | Bölücünün GND tarafındaki direnci (kΩ). `PROBOT_BATTERY_ADC_PIN` ile zorunlu. 3S LiPo için `22`. |
| `PROBOT_BATTERY_INA` | kapalı | I2C gerilim sensörü: `219` ya da `226`. |
| `PROBOT_BATTERY_INA_ADDR` | `0x40` | Sensörün I2C adresi, `0x08`-`0x77`. |
| `PROBOT_BATTERY_INA_SDA`, `PROBOT_BATTERY_INA_SCL` | kartın varsayılan I2C pinleri | Sensörün I2C pinleri. İkisi birlikte yazılır. |
| `PROBOT_BATTERY_INA_SHUNT_MOHM` | `100` | Sensör modülündeki şönt direnci (mΩ). Yalnız akım hesabını etkiler. |
| `PROBOT_BATTERY_TRIM` | `1.0f` | Multimetreyle ince ayar çarpanı, 0.5-2.0. |

Kütüphane ölçümü ayrı bir görevde 250 ms'de bir yapar ve değeri 0,1 V adımla Driver Station'a verir. Sensöre ulaşamazsa **Telemetry** panelinde şu satır çıkar ve gösterge "Veri yok"a döner:

```text
!! [PB-E306] BATTERY SENSOR UNREACHABLE — INA I2C yanit vermiyor — docs/hatalar#pb-e306
```

## Derleme mesajları {#derleme-mesajlari}

Makro eksik ya da hatalıysa Arduino IDE derlemeyi durdurur. Her mesaj bir hata koduyla başlar ve hata sayfasının adresiyle biter, ör. `Docs: probotstudio.com/docs/hatalar/#pb-e101`. Aşağıdaki tablolarda bu adres kısmı yazılmadı. Çözümler: [Derleme hataları](sorunlar.md#derleme-hatalari).

WiFi mesajları İngilizcedir:

| Mesaj | Sebep |
|---|---|
| "[PB-E101] Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h." | Şifre makrosu yok ya da `#include` satırından sonra yazılmış. |
| "[PB-E101] PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." | Şifre 8 karakterden kısa. |
| "[PB-E102] WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h." | Kanal makrosu yok ya da `#include` satırından sonra yazılmış. |
| "[PB-E102] PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only)." | Kanal 1-13 dışında. |
| "[PB-E102] PROBOT_WIFI_AP_CHANNEL must be 0-13 (used as the fallback when the auto-select scan finds nothing)." | `PROBOT_WIFI_AUTO_CHANNEL 1` iken kanal 0-13 dışında. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be at least 1 character." | Ağ adı boş. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be 32 characters or fewer." | Ağ adı 32 karakterden uzun. |
| "[PB-E103] PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." | MAC eki açıkken ağ adı 25 karakterden uzun. |

`PROBOT_WIFI_AP_SSID` hiç yazılmazsa derleme durmaz; şu uyarı çıkar: "PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX). Define a custom SSID for better identification."

Batarya mesajları Türkçe karakter kullanmadan yazılmıştır:

| Mesaj | Sebep |
|---|---|
| "[PB-E104] Gerilim bolucu direncleri eksik: PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K (kilo-ohm) tanimlanmali." | `PROBOT_BATTERY_ADC_PIN` var, dirençlerden biri yok. |
| "[PB-E104] Bolucu direncleri pozitif olmali (kilo-ohm)." | Direnç değeri 0 ya da negatif. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN ADC1 pini olmali (ESP32-S3: GPIO1-10). ADC2 (GPIO11-20) WiFi acikken calismaz." | Pin GPIO1-10 dışında. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_RSL_PIN ile cakisiyor." | Ölçüm pini sinyal lambası pini ile aynı. |
| "[PB-E104] PROBOT_BATTERY_ADC_PIN, NEOPIXEL_PIN ile cakisiyor." | Ölçüm pini durum LED'i pini ile aynı. |
| "[PB-E105] Tek batarya kaynagi secin: PROBOT_BATTERY_ADC_PIN (bolucu) VEYA PROBOT_BATTERY_INA (I2C sensor), ikisi birden degil." | İki yöntem birden yazılmış. |
| "[PB-E105] PROBOT_BATTERY_INA 219 ya da 226 olmali (desteklenen sensorler: INA219, INA226)." | Sensör numarası yanlış. |
| "[PB-E105] I2C pinleri yarim tanimli: PROBOT_BATTERY_INA_SDA ve PROBOT_BATTERY_INA_SCL birlikte verilmeli (ya ikisi ya hicbiri)." | SDA ve SCL'den yalnız biri yazılmış. |
| "[PB-E105] SDA ve SCL ayni pin olamaz." | SDA ve SCL aynı pin. |
| "[PB-E105] INA I2C pini PROBOT_RSL_PIN ile cakisiyor." | I2C pinlerinden biri sinyal lambası pini ile aynı. |
| "[PB-E105] PROBOT_BATTERY_INA_SHUNT_MOHM pozitif olmali (mili-ohm)." | Şönt değeri 0 ya da negatif. |
| "[PB-E105] PROBOT_BATTERY_INA_ADDR gecerli 7-bit I2C adresi olmali (0x08-0x77)." | I2C adresi aralık dışında. |

Üç batarya mesajı uzundur ve tabloya sığmaz. İlk ikisi ölçüm pini ya da I2C pinlerinden biri `PROBOT_ESTOP_ENABLE_PIN` ile aynıysa, üçüncüsü `PROBOT_BATTERY_TRIM` 0.5-2.0 dışındaysa çıkar:

```text
[PB-E104] PROBOT_BATTERY_ADC_PIN, PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti ADC'ye devredilemez.
[PB-E105] INA I2C pini PROBOT_ESTOP_ENABLE_PIN ile cakisiyor — acil durdurma hatti I2C'ye devredilemez.
[PB-E105] PROBOT_BATTERY_TRIM makul araligin disinda (0.5-2.0) — trim ince ayar icindir, oran duzeltmesi icin bolucu direnclerini duzeltin.
```

Süre sınırı mesajı adres taşımaz:

| Mesaj | Sebep |
|---|---|
| "PROBOT_HOOK_DEADLINE_MS must be >= PROBOT_LOOP_DEADLINE_MS" | `PROBOT_HOOK_DEADLINE_MS`, `PROBOT_LOOP_DEADLINE_MS`'den küçük. |
