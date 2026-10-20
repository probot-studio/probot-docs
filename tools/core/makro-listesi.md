# Ayar makroları

Bu sayfa Probot Core'un `#define` ile değiştirilen bütün ayarlarını varsayılan değerleri ve ne işe yaradıklarıyla listeler.

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
| `PROBOT_WIFI_AUTO_CHANNEL` | `0` | `1`: robot her açılışta bandı tarar ve 1, 5, 9, 13 kanallarından en boşunu seçer; açılış 2-3 saniye uzar. Bu modda da `PROBOT_WIFI_AP_CHANNEL` yazılmalıdır (0-13 kabul edilir). Aynı anda açılan robotlar aynı kanala düşebileceği için birden çok robotta önerilmez. |
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
| `PROBOT_DS_TIMEOUT_FORCE_STOP` | `1` | `1`: bağlantı kopunca robot Stop'a geçer ve `robotEnd()` çalışır. `0`: loop'lar sürer, kumanda nötr okunur, bağlantı dönünce kaldığı yerden devam eder. `0` bağlantı kopunca robotu durdurmadan bekletmek içindir (tezgahta deneme); yarışmada `1` kalmalı. |

## Döngü ve acil durdurma {#dongu}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `USER_LOOP_PERIOD_MS` | `20` | `teleopLoop()` ve `autonomousLoop()` çağrıları arasında kütüphanenin beklediği süre (ms). |
| `PROBOT_LOOP_DEADLINE_MS` | `2000` | Bir loop turu bu süreyi aşarsa kumanda girişleri sıfırlanır ve durum LED'i kırmızı yanıp söner. Görev durdurulmaz, kart yeniden başlamaz; tur bitince temizlenir. |
| `PROBOT_WDT_TIMEOUT_S` | `8` | Donanım watchdog süresi (saniye). Yalnız kütüphanenin kendi görevini izler; senin loop'un kartı yeniden başlatmaz. `PROBOT_LOOP_DEADLINE_MS`'den uzun kalmalı. |
| `PROBOT_ESTOP_END_MS` | `500` | Acil durdurmada `robotEnd()`'e verilen süre (ms). Aşılırsa kart yeniden başlar. |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | Kütüphanenin sürdüğü enable pini; `-1` kapalı. Açılışta HIGH, acil durdurmada LOW olur. Motor sürücülerinin enable hattına bağlarsan acil durdurma motorları sürücü seviyesinde de keser. |

## LED {#led}

| Makro | Varsayılan | Ne yapar |
|---|---|---|
| `NEOPIXEL_PIN` | `3` | Durum LED'inin pini. Renklerin anlamı: [Durum LED'ini kullan](led-durumu.md). |
| `NEOPIXEL_COUNT` | `1` | LED sayısı. Kütüphane yalnız ilk LED'i boyar. |
| `NEOPIXEL_BRIGHTNESS` | `32` | Durum LED'inin parlaklığı, 0-255. |
| `PROBOT_RSL_PIN` | `-1` | Sinyal lambası (RSL) pini; `-1` kapalı. Robot çalışırken yanıp söner, diğer durumlarda sabit yanar. |

## Derleme mesajları {#derleme-mesajlari}

Makro eksik ya da hatalıysa Arduino IDE derlemeyi şu mesajlarla durdurur. Mesajlar İngilizcedir.

| Mesaj | Sebep |
|---|---|
| "Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h." | Şifre makrosu yok ya da `#include` satırından sonra yazılmış. |
| "PROBOT_WIFI_AP_PASSWORD must be at least 8 characters." | Şifre 8 karakterden kısa. |
| "WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h." | Kanal makrosu yok ya da `#include` satırından sonra yazılmış. |
| "PROBOT_WIFI_AP_CHANNEL must be 1-13. ..." | Kanal 1-13 dışında. |
| "PROBOT_WIFI_AP_CHANNEL must be 0-13 ..." | `PROBOT_WIFI_AUTO_CHANNEL 1` iken kanal 0-13 dışında. |
| "PROBOT_WIFI_AP_SSID must be 32 characters or fewer." | Ağ adı 32 karakterden uzun. |
| "PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled." | MAC eki açıkken ağ adı 25 karakterden uzun. |

`PROBOT_WIFI_AP_SSID` hiç yazılmazsa derleme durmaz; "PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX)." uyarısı çıkar.
