# Robotun WiFi ayarlarını yap

Bu sayfada robotun WiFi ağının adını, şifresini ve kanalını kodda ayarlayacak, kanalı gerekirse Driver Station'dan kod yüklemeden değiştireceksin.

![Driver Station Logs sekmesi; WiFi Configuration bölümünde SSID RobotAdi, Channel 1 (macro).](img/core-logs.png)

## Başlamadan önce

- Arduino IDE kurulu ve Probot için ayarlı: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Kodu Blocks'ta üretiyorsan bu ayarları Blocks'ta yaparsın: [Robot WiFi ayarlarını yap](../blocks/probot-wifi-ayarla.md). Kanal planı için [Yarışma günü kanal planı](sinyali-iyilestir.md#kanal-plani) geçerlidir.

## Ağ adını, şifreyi ve kanalı yaz {#ag-adi-sifre-kanal}

!!! warning "Dikkat"
    Üç satır `#include <probot.h>` satırından önce gelir. Kütüphane bu değerleri derlenirken okur. Sonra yazılırsa derleme "[PB-E101] Driver station AP password not provided." hatasıyla durur.

1. Sketch'in en üstüne aşağıdaki üç `#define` satırını yaz.
2. `PROBOT_WIFI_AP_SSID`'ye robotun ağ adını yaz.
3. `PROBOT_WIFI_AP_PASSWORD`'a en az 8 karakterlik bir şifre yaz.
4. `PROBOT_WIFI_AP_CHANNEL`'a 1 ile 13 arası bir kanal yaz. 1, 6 ya da 11 önerilir: [Yarışma günü kanal planı](sinyali-iyilestir.md#kanal-plani).
5. Kodu karta yükle.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // ağ adı, en çok 32 karakter
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13; 1, 6 ya da 11 önerilir
#include <probot.h>
```

Sonuç: Kart açılırken **Serial Monitor**'e (115200 baud) ağın adını ve kanalını yazar. Robotun ağı WiFi listesinde `Probot` adıyla görünür.

```text
[DS   ] WiFi SSID: Probot
[DS   ] Password:  ********
[DS   ] Channel:   1 (macro)
[DS   ] IP Address: 192.168.4.1
```

| Satır | Zorunlu mu | Kural | Yazmazsan |
|---|---|---|---|
| `PROBOT_WIFI_AP_SSID` | Hayır | 1-32 karakter | Ağ adı `Probot-` ve kartın MAC adresinden 6 karakter olur, ör. `Probot-1A2B3C`. Derleme bir uyarı verir. |
| `PROBOT_WIFI_AP_PASSWORD` | Evet | En az 8 karakter | Derleme "[PB-E101] Driver station AP password not provided." hatasıyla durur. |
| `PROBOT_WIFI_AP_CHANNEL` | Evet | 1-13 | Derleme "[PB-E102] WiFi AP channel not provided." hatasıyla durur. |

Şifre ya da kanal kurala uymazsa derleme yine durur: [Derleme hataları](sorunlar.md#derleme-hatalari). Diğer bağlantı ayarları: [Ayar makroları](makro-listesi.md).

## Aynı kodu birden çok robota yükle {#mac-eki}

Aynı kodu yüklediğin robotlar aynı ağ adını yayınlar ve WiFi listesinde birbirine karışır. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` her robotun adına kendi kartından gelen bir ek koyar. Kod aynı kalır.

1. `PROBOT_WIFI_AP_SSID` satırının altına `#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX` satırını ekle.
2. Ağ adını en çok 25 karakter tut. Ek 7 karakter daha ekler.
3. Kodu her robota yükle.
4. Her robotta **Logs** sekmesinden kanalı ayrı ayrı değiştir: [Kanalı kod yüklemeden değiştir](#kanal-degistir).

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX           // ada -XXXXXX ekler
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>
```

Sonuç: Her robot `Probot-` ve 6 karakterlik bir ekle yayın yapar, ör. `Probot-1A2B3C`. Tam ad **Serial Monitor**'deki "WiFi SSID:" satırında ve Driver Station'da **Logs** > **SSID**'de yazar.

Aynı kod tüm robotlara aynı kanalı da verir. 4. adımı atlarsan robotlar aynı kanalda birbirini bozar.

## Kanalı kod yüklemeden değiştir {#kanal-degistir}

Kanal, kodu yeniden yüklemeden Driver Station'dan değiştirilebilir. Robot yeni kanalı karta kaydeder ve sonraki açılışlarda da kullanır.

!!! warning "Dikkat"
    Kanalı maç sırasında değiştirme. Bazı tabletler yeni kanala geçişi izlemez ve birkaç saniye kopar.

1. Robotun ağına bağlan ve Driver Station'ı aç: [İlk 10 dakika](ilk-10-dakika.md#robotun-agina-baglan).
2. **Logs** sekmesine bas.
3. **WiFi Configuration** bölümünde **Kanal Değiştir** listesinden yeni kanalı seç. Listede **Varsayılana dön (açılışta)**'dan sonra önce önerilen 1, 6 ve 11 gelir.
4. **Uygula**'ya bas.

Sonuç: Listenin altında "Kanal 6 (canlı geçiş)" yazar. **Channel** satırı "6 (nvs)" olur. Robot yeni kanala geçer; uyumlu cihazlar bağlantıyı koparmadan izler.

Seçtiğin kanal robotun şu anki kanalıysa robot geçiş yapmaz, kanalı yalnız kaydeder; satırda "Kanal 6" ve "kayıtlı" yazar. Değişiklik **Logs** > **Event Log**'a da düşer.

**Channel** satırındaki parantez kanalın nereden geldiğini gösterir:

| Parantezde | Kanal nereden geliyor |
|---|---|
| macro | Koddaki `PROBOT_WIFI_AP_CHANNEL` |
| nvs | **Kanal Değiştir** ile karta kaydedilen kanal |
| auto | Açılışta otomatik seçilen kanal: [Otomatik kanal seçimi](#otomatik-kanal) |

## Koddaki kanala geri dön {#varsayilana-don}

Karta kaydedilen kanal koddaki kanaldan önce gelir. Yeni kod yüklesen bile robot kayıtlı kanalı kullanır. Koddaki kanala dönmek için kaydı sil.

1. Driver Station'da **Logs** sekmesine bas.
2. **Kanal Değiştir** listesinden **Varsayılana dön (açılışta)**'yı seç.
3. **Uygula**'ya bas. Listenin altında "Varsayılan" diye başlayan bir satır çıkar.
4. Robotu kapatıp aç.

Sonuç: **Channel** satırında koddaki kanal "(macro)" ile yazar, ör. "1 (macro)".

## Otomatik kanal seçimi {#otomatik-kanal}

`#define PROBOT_WIFI_AUTO_CHANNEL 1` yazarsan robot her açılışta bandı tarar. 1, 6 ve 11 arasından en boş görünen kanalı kendisi seçer. Açılış birkaç saniye uzar. `PROBOT_WIFI_AP_CHANNEL` satırı yine yazılmalıdır.

!!! warning "Dikkat"
    Otomatik seçimi birden çok robotun olduğu yerde kullanma. Robotlar birlikte açılınca hiçbiri henüz yayın yapmadığı için hepsi bandı boş görür ve aynı kanala düşebilir. Otomatik seçim evde ya da atölyede tek robot içindir.

Kayıtlı bir **Kanal Değiştir** seçimi varsa robot taramaz, kayıtlı kanalı kullanır.

## Sorun mu var?

- **Robotun ağı listede yok:** Kanal 12 ya da 13 ise bazı cihazlar bu kanalları görmez. Robota 1-11 arası bir kanal ver.
- **Ağ var ama Driver Station açılmıyor:** [Arayüz açılmıyor](sorunlar.md#arayuz-acilmiyor).
- **Bağlantı sık kopuyor:** [Sinyal kalitesini artır](sinyali-iyilestir.md).

## Sonraki adım

[Sinyal kalitesini artır](sinyali-iyilestir.md): yarışma günü kanal planı ve robotun anteni.
