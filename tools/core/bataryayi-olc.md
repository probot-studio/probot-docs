# Batarya gerilimini ölç

Bu sayfada iki dirençle bataryanın gerilimini ölçüp Driver Station'ın **Telemetry** paneline yazdıracak ve değeri robot durumuna kaydedeceksin.

Probot Core bataryayı kendisi ölçmez. Ölçümü kodun yapar; kütüphane değeri saklar, Blocks'un pil bloğuna ve robotun `/getBattery` adresine verir. Değeri kaydetmezsen her yerde 0 görünür.

## Başlamadan önce

- Robot kodu Arduino IDE'den yükleniyor: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Bir 100 kΩ ve bir 22 kΩ direncin var. Bu değerler 3S LiPo (dolu iken 12,6 V) içindir.
- İnce ayar için bir multimetre.

<a id="1-gerilim-bolucu-adc"></a>
## Gerilim bölücüyü bağla {#gerilim-bolucu}

ESP32 pini 3,3 V'tan yüksek gerilim ölçemez. İki direnç bataryanın gerilimini sabit bir oranla küçültür: pindeki gerilim = batarya × 22 / (100 + 22). 12,6 V'luk bir batarya pinde 2,27 V olur.

```text
BAT+ ──[100k]──┬──[22k]── GND
               │
             GPIO1
```

Ölçüm pini bir ADC1 pini olmalı. ESP32-S3'te ADC1 pinleri GPIO1-10, ESP32'de GPIO32-39'dur. ADC2 pinleri WiFi açıkken okunamaz ve Probot'un WiFi'ı hep açıktır.

!!! warning "Dikkat"
    Bölücüyü ana anahtarın arkasına bağla. Anahtarın önüne bağlarsan robot kapalıyken de bataryadan akım çeker (12,6 V'ta yaklaşık 0,1 mA).

1. 100 kΩ direncin bir ucunu bataryanın artı hattına, ana anahtardan sonra bağla.
2. 100 kΩ'un öbür ucunu 22 kΩ'a, 22 kΩ'un öbür ucunu GND'ye bağla.
3. İki direncin birleştiği noktayı GPIO1'e bağla.
4. Bataryanın eksi ucuyla ESP32'nin GND'si ortak olsun.

Sonuç: Robot açıkken multimetre GPIO1 ile GND arasında batarya geriliminin yaklaşık 0,18 katını gösterir (12,6 V'ta 2,27 V).

Başka bir batarya için dirençleri, bataryanın en yüksek geriliminde pin 3,3 V'u geçmeyecek şekilde seç.

<a id="3-elle-besleme"></a>
## Ölçümü koda ekle {#olcumu-koda-ekle}

`analogReadMilliVolts()` ESP32 Arduino çekirdeğinin fonksiyonudur ve pindeki gerilimi milivolt olarak verir. Kod bunu bölücü oranıyla çarpıp bataryanın gerilimini bulur. `probot::robot::state().setBatteryVoltage()` değeri robot durumuna kaydeder.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Gerilim bölücünün orta ucu (ADC1 pini: ESP32-S3'te GPIO1-10)
#define BATTERY_PIN 1

const float R_TOP_K = 100.0f;   // batarya tarafındaki direnç (kΩ)
const float R_BOT_K = 22.0f;    // GND tarafındaki direnç (kΩ)
const float TRIM    = 1.0f;     // multimetreyle ince ayar çarpanı

// Pindeki gerilimi okuyup bataryanın gerilimine çevirir (volt)
float readBatteryVolts() {
  float pinVolts = analogReadMilliVolts(BATTERY_PIN) / 1000.0f;
  return pinVolts * (R_TOP_K + R_BOT_K) / R_BOT_K * TRIM;
}

// Ölçümü telemetriye yazar ve robot durumuna kaydeder
void reportBattery() {
  float v = readBatteryVolts();
  probot::robot::state().setBatteryVoltage(millis(), v);
  probot::clearTelemetry();
  probot::printf("Batarya: %.2f V\n", v);
}

void robotInit() {}
void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  reportBattery();
  // sürüş kodun burada
}

void autonomousInit() {}

void autonomousLoop() {
  reportBattery();
  // otonom kodun burada
}
```

1. Kodu yapıştır ve `BATTERY_PIN`'i bölücüyü bağladığın pine göre değiştir.
2. Başka dirençler kullandıysan `R_TOP_K` ve `R_BOT_K` değerlerini kΩ olarak yaz.
3. Kodu karta yükle.
4. Driver Station'da **Init**'e, sonra **Start**'a bas.

Sonuç: **Dashboard**'daki **Telemetry** panelinde `Batarya:` ile başlayan satır bataryanın gerilimini volt olarak gösterir.

Ölçüm yalnız `teleopLoop()` ya da `autonomousLoop()` çalışırken güncellenir. Init beklerken ya da Stop'tan sonra son kaydedilen değer kalır.

## Multimetreyle ince ayar yap {#ince-ayar}

Direnç toleransları ölçümü birkaç yüzde kaydırabilir. `TRIM` çarpanı bunu düzeltir.

1. Robot açıkken multimetreyle batarya uçlarındaki gerilimi ölç.
2. **Telemetry** panelindeki değeri not et.
3. Koddaki `TRIM` değerini multimetre / telemetri olarak değiştir. Ör. multimetre 12,50 V, telemetri 12,30 V ise `12.50 / 12.30 = 1.016` yaz.
4. Kodu yeniden yükle ve **Init**, **Start**'a bas.

Sonuç: **Telemetry** panelindeki değer multimetrenin gösterdiği değere eşit ya da çok yakındır.

## Değeri nerede görürsün {#gostergeyi-okumak}

| Yer | Nasıl |
|---|---|
| Driver Station, **Telemetry** paneli | Koddaki `probot::printf` satırı |
| Kendi kodun | `probot::robot::state().read().batteryVoltage` |
| Probot Blocks | **robot: pil gerilimi (V)** bloğu aynı değeri okur |
| Robotun ağına bağlı bir cihaz | `http://192.168.4.1/getBattery` gerilimi tek ondalıkla verir |

`setBatteryVoltage` hiç çağrılmazsa üç yerde de değer 0'dır. Driver Station'da ayrı bir pil göstergesi yoktur; değeri telemetriyle yazdır.

## Sorun mu var?

- **Telemetri 0.00 V gösteriyor:** Bölücünün orta ucu `BATTERY_PIN`'deki pine bağlı değil ya da pin bir ADC1 pini değil.
- **Değer gerçek gerilimden çok farklı:** Koddaki `R_TOP_K` ve `R_BOT_K` taktığın dirençlerle aynı değil. Küçük farklar için [ince ayar](#ince-ayar) yap.
- **Blocks'taki pil bloğu 0 veriyor:** Kodda `setBatteryVoltage` çağrısı yok. Bu sayfadaki `reportBattery()` fonksiyonunu ekle.

## Sonraki adım

[Durum LED'ini kullan](led-durumu.md)
