---
title: Sinyal Temizliği
---

# Sinyal Temizliği

ESP32-S3 sinyal gücü açısından güçlü bir cihaz değil. Buna ek olarak yarışma ortamında kullanılabilecek kanal sayısı kısıtlı; aynı anda onlarca robot ve telefon aynı frekans bandını paylaşıyor. Bu koşullarda bağlantı kalitesi büyük ölçüde robotun fiziksel tasarımına bağlı; yazılım ayarlarıyla telafi edilemiyor.

---

## Regülatör

ESP32'yi ana güç hattından beslemek bağlantı sorunlarının en yaygın sebebi. Motor sürücüler ve motorlar açılışta anlık yüksek akım çeker; bu dalgalanma ESP32'nin güç hattına yansırsa WiFi radyosu kararsız çalışır ve bağlantı kopar.

ESP32 için ayrı bir 3.3V veya 5V regülatör kullanılmalı; ana güç hattından izole edilmeli. Küçük bir LDO veya DC-DC dönüştürücü yeterli. ESP32 besleme hattına 100-470 µF elektrolitik kondansatör eklenmesi motor açılışlarındaki gerilim diplerini yumuşatır.

---

## Anten

Antenin konumu sinyali doğrudan etkiler. Tümleşik (PCB trace) antenli modüllerde menzil yarışma koşullarında yetersiz kalabiliyor; harici anten bağlantısı olan ESP32-S3 modülleri tercih edilmeli.

Harici anten kullanılıyorsa antenin uç noktası açık havada olmalı. Metal yüzey, motor ve kablo demeti 2.4 GHz sinyalini emer; anten bu engellerden en az 5 cm uzakta ve serbest konumda tutulmalı.

---

## ESP32 Konumlandırması

Robotun şasisi çoğunlukla metal levhadan yapılıyor. Metal levhanın içine gömülen ESP32, farkında olmadan bir Faraday kafesine alınmış oluyor: sinyal dışarı çıkamaz, dışarıdan gelen sinyal içeri giremez. Bu durumda tam yanı başındaki Driver Station bile bağlantı koparabiliyor.

ESP32, şasinin dışına veya yarı açık bir konuma yerleştirilmeli. Kart içeride kalmak zorundaysa en azından anten, gövde dışına bir kablo veya uzatma aparatıyla çıkarılmalı.

---

## Yarışma Günü Kanal Planı

2.4 GHz'de birbirini etkilemeyen kanallar **1, 6 ve 11**. Yarışmada her robota bu kanallardan biri atanır; aynı kanalda birden fazla robot olursa sinyaller çakışır ve ikisi de etkilenir.

Robota atanan kanala kodda şu şekilde sabitlenir:

```cpp
#define PROBOT_WIFI_AP_CHANNEL 6
```

Kanal atanmadan önce kanal 1 ile koda yüklenmeli. Atama yapıldıktan sonra flash gerekmeden kanalı değiştirmek için Driver Station arayüzünden **Logs > Kanal Değiştir** kullanılabilir; CSA ile canlı geçiş yapar.

Kanalda yoğunluk hissediliyorsa saha görevlilerine danışılabilir; kanal değişikliği talep edilebilir.

!!! warning "Otomatik kanal seçimi filoda çalışmaz"
    `PROBOT_WIFI_AUTO_CHANNEL 1` ayarı her robotun açılışta bandı "boş" görmesine ve hepsinin aynı kanala düşmesine yol açar. Filoda kullanılmamalı.

---

## Kütüphane İçindeki Sinyal Ayarları

Probot aşağıdaki WiFi ayarlarını otomatik olarak yapılandırıyor:

| Ayar | Değer | Açıklama |
|---|---|---|
| TX gücü | `WIFI_POWER_21dBm` (~20 dBm) | Donanımın desteklediği maksimum güç |
| Güç tasarrufu | `WIFI_PS_NONE` | Modem uykusu kapalı; gecikme ve sinyal kararlı kalır |
| Kanal genişliği | HT20 (20 MHz) | Kalabalık bantta 40 MHz'e kıyasla daha az çakışma |
| 802.11b hızları | Kapalı | Beacon trafiği azalır; kanal daha az meşgul kalır |

Bu ayarlar Probot kullanan projelerde otomatik aktif. Probot kullanmadan bare-metal ESP32 yazıyorsanız aynı ayarları manuel olarak yapmanız gerekiyor:

```cpp
WiFi.setTxPower(WIFI_POWER_21dBm);
esp_wifi_set_ps(WIFI_PS_NONE);
esp_wifi_set_bandwidth(WIFI_IF_AP, WIFI_BW_HT20);
```

802.11b'yi kapatmak için `esp_wifi_config_11b_rate()` çağrısı WiFi init ile `softAP()` arasında yapılmalı; sıra önemli.
