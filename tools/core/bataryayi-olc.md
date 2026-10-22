# Batarya gerilimini ölç

Bu sayfada iki dirençle bataryanın gerilimini ölçecek ve değeri Driver Station'ın **Battery** göstergesinde göreceksin.

Probot Core bataryayı kendisi ölçer. Bölücünün pinini ve dirençleri makroyla yazarsın; kütüphane gerilimi 250 ms'de bir okur, yumuşatır ve robot durumuna kaydeder. Ölçüm için loop fonksiyonuna kod yazman gerekmez. Ölçüm kaynağı tanımlı değilse gösterge "Veri yok · batarya ölçümü kapalı" der ve değer her yerde 0'dır.

Üç kaynaktan birini seçersin: gerilim bölücü (bu sayfanın ana yolu), [INA219 ya da INA226 sensörü](#ina-sensoru) ya da [kendi ölçümün](#kendi-olcumun).

## Başlamadan önce

- Robot kodu Arduino IDE'den yükleniyor: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Bir 100 kΩ direncin, bir 22 kΩ direncin ve bir 100 nF kondansatörün var. Bu direnç değerleri 3S LiPo (dolu iken 12,6 V) içindir.
- Kartın ESP32-S3. Kütüphane bölücü pini olarak yalnız GPIO1-10'u kabul eder; düz ESP32'de bölücü yöntemi çalışmaz. Orada [INA sensörünü](#ina-sensoru) ya da [kendi ölçümünü](#kendi-olcumun) kullan.
- İnce ayar için bir multimetre.

<a id="1-gerilim-bolucu-adc"></a>
## Gerilim bölücüyü bağla {#gerilim-bolucu}

ESP32 pini 3,3 V'tan yüksek gerilim ölçemez. İki direnç bataryanın gerilimini sabit bir oranla küçültür: pindeki gerilim = batarya × 22 / (100 + 22). 12,6 V'luk bir batarya pinde 2,27 V olur.

```text
BAT+ ──[100k]──┬──[22k]── GND
               │
             GPIO1 ── 100nF ── GND
```

Ölçüm pini GPIO1-10 arasından seçilir; bunlar ESP32-S3'ün ADC1 pinleridir. ADC2 pinleri (GPIO11-20) WiFi açıkken okunamaz ve Probot'un WiFi'ı hep açıktır. Başka bir pin yazarsan program derlenmez.

!!! warning "Dikkat"
    Bölücüyü ana anahtarın arkasına bağla. Anahtarın önüne bağlarsan robot kapalıyken de bataryadan akım çeker (12,6 V'ta yaklaşık 0,1 mA).

1. 100 kΩ direncin bir ucunu bataryanın artı hattına, ana anahtardan sonra bağla.
2. 100 kΩ'un öbür ucunu 22 kΩ'a, 22 kΩ'un öbür ucunu GND'ye bağla.
3. İki direncin birleştiği noktayı GPIO1'e bağla.
4. Aynı noktadan GND'ye 100 nF kondansatörü bağla.
5. Bataryanın eksi ucuyla ESP32'nin GND'si ortak olsun.

Sonuç: Robot açıkken multimetre GPIO1 ile GND arasında batarya geriliminin yaklaşık 0,18 katını gösterir (12,6 V'ta 2,27 V).

Başka bir batarya için dirençleri, bataryanın en yüksek geriliminde pin 3,3 V'u geçmeyecek şekilde seç.

## Ölçümü koda ekle {#olcumu-koda-ekle}

Ölçüm üç makroyla açılır: pin, batarya tarafındaki direnç ve GND tarafındaki direnç. Dirençler kΩ olarak yazılır. Makrolar `#include <probot.h>` satırından önce gelir.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

// Batarya ölçümü: gerilim bölücünün orta ucu ve dirençler
#define PROBOT_BATTERY_ADC_PIN  1     // ADC1 pini: GPIO1-10
#define PROBOT_BATTERY_R_TOP_K  100   // batarya tarafındaki direnç (kΩ)
#define PROBOT_BATTERY_R_BOT_K  22    // GND tarafındaki direnç (kΩ)

#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}

void teleopLoop() {
  // Kütüphanenin ölçtüğü değeri telemetriye yaz
  probot::clearTelemetry();
  probot::printf("Batarya: %.1f V\n", probot::robot::state().read().batteryVoltage);
}

void teleopStop() {}
```

1. Kodu yapıştır ve `PROBOT_BATTERY_ADC_PIN`'i bölücüyü bağladığın pine göre değiştir.
2. Başka dirençler kullandıysan `PROBOT_BATTERY_R_TOP_K` ve `PROBOT_BATTERY_R_BOT_K` değerlerini kΩ olarak yaz.
3. Kodu karta yükle ve Driver Station'ı aç.
4. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.

Sonuç: **Dashboard**'daki **Battery** göstergesi gerilimi volt olarak gösterir, ör. `12.4V`. **Telemetry** panelinde `Batarya: 12.4 V` gibi bir satır çıkar.

Gösterge **Init** ve **Start** beklemez: robot açıldığı andan beri ölçüm sürer. Telemetri satırı yalnız `teleopLoop()` çalışırken güncellenir.

Değer 0,1 V adımlarla değişir. Kütüphane her okumada 8 örneğin ortalamasını alır ve sonucu yumuşatır; doğruluk yaklaşık %1-2'dir.

## Multimetreyle ince ayar yap {#ince-ayar}

Direnç toleransları ölçümü birkaç yüzde kaydırabilir. `PROBOT_BATTERY_TRIM` çarpanı bunu düzeltir. Varsayılanı 1,0'dır ve 0,5 ile 2,0 arasında olmalıdır.

1. Robot açıkken multimetreyle batarya uçlarındaki gerilimi ölç.
2. **Telemetry** panelindeki `Batarya:` değerini not et.
3. Makroların yanına `#define PROBOT_BATTERY_TRIM 1.016f` gibi bir satır ekle. Değer multimetre / telemetri olsun. Ör. multimetre 12,50 V, telemetri 12,30 V ise `12.50 / 12.30 = 1.016` yaz.
4. Kodu yeniden yükle, **Init**'e ve **Start**'a bas.

Sonuç: **Telemetry** panelindeki değer multimetrenin gösterdiği değere eşit ya da en çok 0,1 V uzaktır.

Fark yüzde birkaçtan büyükse çarpanı büyütme. `R_TOP_K` ve `R_BOT_K` değerlerinin taktığın dirençlerle aynı olduğunu kontrol et.

## INA219 ya da INA226 sensörü kullan {#ina-sensoru}

INA219 ve INA226, gerilimi I2C üzerinden veren hazır modüllerdir. Bölücü lehimlemen gerekmez. Sensör akımı da ölçer.

1. Sensör modülünün VCC ve GND'sini karta, SDA ve SCL'sini kartın I2C pinlerine bağla.
2. Bataryanın artı hattını modülün VIN+ ucuna, robotun güç hattını VIN- ucuna bağla.
3. Makroların yerine `#define PROBOT_BATTERY_INA 226` yaz (INA219 için `219`).
4. Modülündeki şönt direncini mΩ olarak `#define PROBOT_BATTERY_INA_SHUNT_MOHM 2` gibi yaz.
5. Kodu yükle ve Driver Station'ı aç.

Sonuç: **Battery** göstergesi gerilimi gösterir. `probot::io::battery::currentAmps()` bataryadan çekilen akımı amper olarak verir.

Kartın varsayılan I2C pinleri dışında bir pin kullanıyorsan `PROBOT_BATTERY_INA_SDA` ve `PROBOT_BATTERY_INA_SCL` makrolarını birlikte yaz. Sensörün adresi 0x40 değilse `PROBOT_BATTERY_INA_ADDR` ile yaz. Şönt değeri yalnız akım hesabını etkiler; varsayılanı 100 mΩ'dur.

Kütüphane sensörü kendi görevinden okur. Aynı `Wire` hattına robot kodundan ikinci bir I2C cihazı (IMU, ekran) bağlama. Kendi I2C cihazın varsa bölücüyü kullan ya da cihazını `Wire1`'e, ayrı pinlere taşı.

Bölücü ile INA aynı anda tanımlanamaz; program derlenmez.

<a id="3-elle-besleme"></a>
## Kendi ölçümünü ver {#kendi-olcumun}

Gerilimi başka bir yolla ölçüyorsan değeri `probot::setBatteryVoltage()` ile kütüphaneye verirsin. Gösterge ve diğer yerler bu değeri okur. Bu yöntemde `PROBOT_BATTERY_ADC_PIN` ve `PROBOT_BATTERY_INA` yazılmaz; ikisinden biri tanımlıysa otomatik ölçüm senin değerinin üzerine yazar.

```cpp
void teleopLoop() {
  float v = readMyBattery();       // kendi ölçüm fonksiyonun (volt)
  probot::setBatteryVoltage(v);    // göstergeye ve robot durumuna yaz
}
```

Değer bir önceki değerle aynı 0,1 V'a yuvarlanıyorsa kaydedilmez. Bu yüzden her turda çağırmak gereksiz trafik üretmez. Değer yalnız çağrının yapıldığı fonksiyon çalışırken güncellenir.

## Değeri nerede görürsün {#gostergeyi-okumak}

| Yer | Nasıl |
|---|---|
| Driver Station, **Dashboard** > **Battery** | Yaklaşık son 8 saniyenin ortalaması, yüzde ve durum yazısı |
| Driver Station, **Logs** > **History** > **Battery** grafiği | Son 2 dakikanın ortalamasız ölçümleri; motor yükünde gerilimin düşüşü burada görünür |
| Kendi kodun | `probot::robot::state().read().batteryVoltage` |
| Probot Blocks | **robot: pil gerilimi (V)** bloğu aynı değeri okur |
| Robotun ağına bağlı bir cihaz | `http://192.168.4.1/getBattery` gerilimi tek ondalıkla verir |

Göstergedeki yüzde 3S LiPo'ya göredir: 10,5 V %0, 12,6 V %100'dür. Durum yazısı 11,6 V'un üstünde "Nominal", 11,0 V'un üstünde "Azalıyor" olur. Daha düşük gerilimde gösterge kırmızı yanar; bataryayı değiştir.

## Sorun mu var?

- **Gösterge "Veri yok" diyor:** Ölçüm makroları `#include <probot.h>` satırından sonra yazılmış ya da hiç yok. Makroları include satırının üstüne taşı.
- **Derleme hatasında "[PB-E104]" yazıyor:** Pin GPIO1-10 dışında ya da dirençlerden biri yazılmamış. Bkz. [PB-E104](sorunlar.md#pb-e104).
- **Derleme hatasında "[PB-E105]" yazıyor:** Bölücü ile INA birlikte tanımlı ya da INA ayarlarından biri geçersiz. Bkz. [PB-E105](sorunlar.md#pb-e105).
- **Telemetride "[PB-E306]" satırı çıkıyor, gösterge "Veri yok"a döndü:** INA sensörü I2C'de yanıt vermiyor. Kabloyu ve adresi kontrol et. Bkz. [PB-E306](sorunlar.md#pb-e306).
- **Gösterge 0 V'a yakın gösteriyor:** Bölücünün orta ucu `PROBOT_BATTERY_ADC_PIN`'deki pine bağlı değil.
- **Değer gerçek gerilimden çok farklı:** Koddaki `R_TOP_K` ve `R_BOT_K` taktığın dirençlerle aynı değil. Küçük farklar için [ince ayar](#ince-ayar) yap.

## Sonraki adım

[Durum LED'ini kullan](led-durumu.md)
