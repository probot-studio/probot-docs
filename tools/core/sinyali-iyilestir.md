# Sinyal kalitesini artır

Bu sayfada robotla Driver Station arasındaki WiFi bağlantısını ölçecek, sonra besleme, anten, kartın yeri ve kanal planıyla sağlamlaştıracaksın.

Yarışma salonunda onlarca robot ve telefon aynı 2,4 GHz bandını paylaşır. Bu koşulda bağlantının kalitesi büyük ölçüde robotun fiziksel tasarımına bağlıdır; yazılım ayarı bunu telafi edemez.

## Başlamadan önce

- Robot kodu yüklü ve Driver Station'a bağlanabiliyorsun: [İlk 10 dakika](ilk-10-dakika.md).

## Sinyali ölç {#sinyali-olc}

Driver Station robotun, bağlı cihazdan aldığı sinyalin gücünü gösterir. Değişiklik yapmadan önce ve sonra ölç.

1. Driver Station'ı açtığın cihazla sürücülerin duracağı yere geç.
2. **Logs** sekmesine bas.
3. Robotu **Init** ve **Start** ile çalıştır, motorları kumandayla birkaç saniye sür.

Sonuç: **Network Status** bölümünde **RSSI** satırı dBm cinsinden sinyali yazar. Değer 0'a ne kadar yakınsa sinyal o kadar güçlüdür. -70 dBm'den kötüyse (ör. -78 dBm) mesafeye ve antene bak.

| Gösterge | Nerede | Ne söyler |
|---|---|---|
| Sinyal çubukları | Üst şerit | -50 dBm'den iyi 4, -60'tan iyi 3, -70'ten iyi 2, -80'den iyi 1 çubuk. Nokta 3-4 çubukta yeşil, 2'de sarı, daha azında kırmızı. |
| **RSSI** | **Logs** > **Network Status** | Robotun bağlı cihazdan aldığı sinyal. Bağlı cihaz yoksa -100 dBm. |
| **Ping** | **Logs** > **Network Status** | Sayfanın robota sorup cevap aldığı süre, ms. |
| **Last Disconnect** | **Logs** > **Network Status** | Son kopmanın WiFi neden kodu ("reason 8" gibi). Kopma olmadıysa "--". |

## ESP32'yi ayrı regülatörden besle {#regulator}

Motor sürücüler ve motorlar kalkışta anlık yüksek akım çeker. ESP32 aynı hattan beslenirse bu dalgalanma WiFi radyosunu kararsız yapar ve bağlantı kopar. Bağlantı sorunlarının en yaygın sebebi budur.

- ESP32'yi ana güç hattından ayrı bir 3,3 V ya da 5 V regülatörle besle. Küçük bir LDO ya da DC-DC dönüştürücü yeter.
- ESP32'nin besleme hattına 100-470 µF'lık bir elektrolitik kondansatör ekle. Motor kalkışındaki gerilim düşüşlerini yumuşatır.
- Servoyu ESP32'nin 5V ya da 3V3 pininden besleme. Servoya ayrı bir 5-6 V kaynak (BEC) ver ve GND'leri ortak bağla: [Servoyu sür](servoyu-sur.md).

## Anteni açıkta tut {#anten}

Antenin yeri sinyali doğrudan etkiler. Kart üstüne basılı (PCB) antenli modüllerde menzil yarışma koşullarında yetmeyebilir. Harici anten bağlanabilen bir ESP32-S3 modülü tercih et.

- Harici antenin ucunu açıkta tut.
- Anteni metal yüzeylerden, motorlardan ve kablo demetlerinden en az 5 cm uzak tut. Bunlar 2,4 GHz sinyalini emer.

## Kartı metal gövdeye gömme {#kartin-yeri}

Metal levhadan bir gövdenin içine gömülen ESP32 kafese alınmış olur. Sinyal dışarı çıkamaz, dışarıdan gelen içeri giremez. Bu durumda yanı başındaki Driver Station bile bağlantıyı koparabilir.

- ESP32'yi gövdenin dışına ya da yarı açık bir yere koy.
- Kart içeride kalmak zorundaysa en azından anteni bir uzatma kablosuyla gövdenin dışına çıkar.

## Yarışma günü kanal planı {#kanal-plani}

Aynı kanalda yayın yapan iki robot birbirini bozar. 2,4 GHz bandında birbirine karışmayan kanallar **1, 5, 9 ve 13**'tür. Aynı anda çalışan robotlara bu kanalları elle, her robota farklı ve sabit olacak şekilde dağıt.

| Robot | Kanal |
|---|---|
| 1. robot | 1 |
| 2. robot | 5 |
| 3. robot | 9 |
| 4. robot | 13 |

- Kanalı kodda `PROBOT_WIFI_AP_CHANNEL` ile ver ya da yarışma günü kod yüklemeden **Logs** > **Kanal Değiştir** ile değiştir: [Robotun WiFi ayarlarını yap](wifi-ayarla.md#kanal-degistir).
- Kanalı maç sırasında değiştirme. Bazı tabletler geçişi izlemez ve birkaç saniye kopar.
- Bazı dizüstü bilgisayar ve tabletler 12 ve 13. kanalları görmez. Bir cihaz robotu bulamıyorsa o robota 1-11 arası bir kanal ver.
- Otomatik kanal seçimini (`PROBOT_WIFI_AUTO_CHANNEL 1`) yarışmada kullanma. Birlikte açılan robotlar aynı kanala düşebilir: [Otomatik kanal seçimi](wifi-ayarla.md#otomatik-kanal).
- Maç sırasında robotların çevresinde telefondan WiFi paylaşımı (hotspot) açtırma. Hotspotlar da 2,4 GHz bandını doldurur.
- Kanalda yoğunluk varsa saha görevlilerine danış.

## Kütüphanenin yaptığı radyo ayarları {#kutuphane-ayarlari}

Probot robotun WiFi radyosunu açılışta kendisi ayarlar. Bunlar için kod yazman gerekmez.

| Ayar | Değer | Neden |
|---|---|---|
| Yayın gücü | En yüksek (`WIFI_POWER_21dBm` istenir, radyo 20 dBm verir) | Menzil |
| Güç tasarrufu | Kapalı (`WIFI_PS_NONE`) | Radyo uyumaz, gecikme kararlı kalır. |
| Kanal genişliği | 20 MHz (HT20) | Kalabalık bantta komşu kanallarla daha az çakışır. |
| 802.11b hızları | Kapalı | Yayın paketleri bandı daha az meşgul eder. |
| Ülke ayarı | TR, kanal 1-13 | 13. kanala kadar yayın yapılabilir. |

İki ayar makroyla değişir. İkisini de yalnız gerekirse aç:

| Makro | Ne yapar |
|---|---|
| `#define PROBOT_WIFI_ENABLE_11B 1` | 802.11b hızlarını açar. Yalnız 2010 öncesi cihazlar için gerekir; bandı daha çok meşgul eder. |
| `#define PROBOT_WIFI_PMF_REQUIRED 1` | Korumalı yönetim çerçevelerini (PMF) zorunlu yapar. Sahte bağlantı kesme saldırısına karşı korur, eski tabletler bağlanamayabilir. |

## Sorun mu var?

- **"DISCONNECTED" yazıyor, robot durdu:** [Bağlantı koptu, robot durdu](sorunlar.md#pb-e303-baglant-kopmas-robot-durduruldu).
- **Robotun ağı listede yok:** Kanal 12 ya da 13 olabilir. Robota 1-11 arası bir kanal ver.

## Sonraki adım

[Driver Station arayüzü](arayuz.md): **Logs** sekmesindeki diğer göstergeler.
