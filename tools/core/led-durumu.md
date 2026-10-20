# Durum LED'ini kullan

Kartın üstündeki renkli LED robotun durumunu gösterir; bu sayfada renklerin anlamını, LED ayarlarını ve ek sinyal lambasını bulacaksın.

## Renkler ne demek {#renkler}

LED'in rengini kütüphane sürer ve her renk bir anlam taşır. Yanıp sönen renkler yarım saniye yanar, yarım saniye söner.

| Renk | Anlamı | Ne yap |
|---|---|---|
| Mavi sabit | Robot açık, Driver Station bağlı değil | Robotun ağına bağlan ve Driver Station'ı aç: [İlk 10 dakika](ilk-10-dakika.md) |
| Mavi yanıp sönüyor | Driver Station bağlı, Init bekleniyor | **Init**'e bas |
| Sarı sabit | Init yapıldı, Start bekleniyor | **Start**'a bas |
| Turuncu yanıp sönüyor | Otonom çalışıyor | Otonom süresi dolunca teleop kendiliğinden başlar |
| Yeşil yanıp sönüyor | Teleop çalışıyor | Robotu kumandayla sür |
| Kırmızı yanıp sönüyor | Bir loop turu 2 saniyeden uzun sürdü; kumanda girişleri sıfırlandı | Uzun `delay()` ya da yanıt vermeyen bir sensör çağrısı ara: [Hatayı adım adım daralt](hatayi-daralt.md) |
| Kırmızı sabit | Acil durdurma yapıldı, robot kilitli | **Reboot Robot**'a bas ya da robotun gücünü kapatıp aç |

**Stop**'tan sonra LED yeniden mavi yanıp söner. Kırmızı yanıp sönme, takılan tur bitince kendiliğinden geçer.

Kodda LED'in rengini değiştiren bir fonksiyon yoktur. Eski sürümlerin `setColor`, `set` ve `setBrightness` çağrıları derlenmez; bu satırları sil. Kendi göstergen için [sinyal lambası](#rsl) kullan.

## LED pinini ve parlaklığını ayarla {#led-pini}

LED varsayılan olarak GPIO 3'tedir, parlaklığı 32'dir (0-255). İkisi de `#include <probot.h>` satırından önce yazılan makrolarla değişir.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#define NEOPIXEL_PIN        48   // durum LED'i bu pinde
#define NEOPIXEL_BRIGHTNESS 16   // 0-255, varsayılan 32

#include <probot.h>

void robotInit() {}
void robotEnd() {}
void teleopInit() {}
void teleopLoop() {}
void autonomousInit() {}
void autonomousLoop() {}
```

1. Kartının pin şemasından LED'in bağlı olduğu GPIO numarasını öğren.
2. `#include <probot.h>` satırından önce `#define NEOPIXEL_PIN` satırını kendi numaranla yaz.
3. Parlaklığı değiştirmek için `#define NEOPIXEL_BRIGHTNESS` satırına 0-255 arası bir değer yaz.
4. Kodu karta yükle.

Sonuç: Robot açılınca LED yazdığın parlaklıkta mavi yanar.

Kütüphane şeritteki yalnız ilk LED'i boyar. `NEOPIXEL_COUNT` (varsayılan 1) LED sayısını belirtir ama diğer LED'lere renk vermez.

## Sinyal lambası (RSL) bağla {#rsl}

Sinyal lambası (RSL) robotun hareket edip edemeyeceğini uzaktan gösterir. `PROBOT_RSL_PIN` ile bir dijital pin verirsen kütüphane o pini sürer:

| Robotun durumu | Lamba |
|---|---|
| Otonom ya da teleop çalışıyor | Yanıp söner |
| Init bekleniyor, Init yapıldı, Stop, acil durdurma | Sabit yanar |

Lamba, pin HIGH olunca yanar. Bir loop turu takıldığında da (kırmızı LED) lamba yanıp sönmeye devam eder, çünkü robot hâlâ otonomda ya da teleoptadır.

1. Lambayı, pin HIGH olunca yanacak şekilde boş bir dijital pine bağla. ESP32 pini 3,3 V sinyal verir; lamban daha fazla güç istiyorsa araya bir sürücü koy.
2. `#include <probot.h>` satırından önce `#define PROBOT_RSL_PIN 10` yaz (10 yerine kendi pinin).
3. Kodu karta yükle.
4. Driver Station'da **Init**'e, sonra **Start**'a bas.

Sonuç: Lamba açılışta sabit yanar, **Start**'tan sonra yanıp söner, **Stop**'ta yeniden sabit yanar.

## Sorun mu var?

- **LED hiç yanmıyor:** `NEOPIXEL_PIN` kartındaki LED'in pinine uymuyor. Pin şemasına bakıp makroyu düzelt.
- **LED kırmızı yanıp sönüyor:** Bir tur 2 saniyeden uzun sürdü: [Hatalar ve sorun giderme](sorunlar.md).
- **Eski kod `setColor` satırında derlenmiyor:** LED rengi koddan değiştirilemez; satırı sil.

## Sonraki adım

[Ayar makroları](makro-listesi.md)
