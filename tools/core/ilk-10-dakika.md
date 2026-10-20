# İlk 10 dakika

Bu sayfanın sonunda ilk Probot kodun kartta çalışacak, telefonun robotun ağına bağlanacak ve kumandanın sol çubuğu Driver Station'da değer değiştirecek.

![Driver Station Dashboard sekmesi; Status Teleop, Telemetry panelinde Sol Y: 0.62 yazıyor.](img/core-dashboard.png)

## Başlamadan önce

- Arduino IDE kurulu ve Probot için ayarlı: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- ESP32 kart ve USB veri kablosu.
- WiFi'si olan bir telefon, tablet ya da bilgisayar. Driver Station bunun tarayıcısında açılır.
- USB ya da Bluetooth bir kumanda. Bu cihaza bağlanabiliyor olmalı.

Menü adları Arduino IDE'nin İngilizce arayüzüne göredir. Türkçe arayüzde **File** yerine **Dosya**, **Tools** yerine **Araçlar** yazar.

Kodu Blocks'ta ürettiysen ilk iki bölümün yerine [Kodu Probot kartına yükle](../blocks/probot-karta-yukle.md) sayfasını izle, sonra [Robotun ağına bağlan](#robotun-agina-baglan) bölümünden devam et.

## Kodu yaz {#kodu-yaz}

Probot kodunda `setup()` ve `loop()` yazılmaz. Onların yerine maçın anlarına göre çalışan altı fonksiyon yazılır ([Sözlük](index.md#sozluk)). Altısı da programda bulunmalıdır, içleri boş kalabilir.

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil.
3. Aşağıdaki kodu yapıştır.
4. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
5. **File** > **Save**'i seç ve sketch'e bir ad ver.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void robotInit() {}        // Init'e basınca 1 kez
void robotEnd() {}         // Stop'ta 1 kez

void autonomousInit() {}   // otonom başlarken 1 kez
void autonomousLoop() {}   // otonom boyunca tekrar çağrılır

void teleopInit() {}       // teleop başlarken 1 kez

void teleopLoop() {        // teleop boyunca tekrar çağrılır
  auto js = probot::io::joystick_api::makeDefault();
  probot::clearTelemetry();                        // önceki yazıyı sil
  probot::printf("Sol Y: %.2f\n", js.getLeftY());  // -1..+1, ileri pozitif
}
```

Üç `#define` satırı `#include <probot.h>` satırından önce gelmek zorundadır. Kütüphane bu değerleri derlenirken okur. Sonra yazılırlarsa kod derlenmez.

Kontrol et: Sketch kayıtlı. Kodda `setup()` ya da `loop()` yok.

## Kodu karta yükle {#kodu-yukle}

1. Kartı USB veri kablosuyla bilgisayara bağla.
2. **Tools** > **Port** menüsünden kartın portunu seç.
3. **Tools** > **Partition Scheme**'de **Huge APP (3MB No OTA/1MB SPIFFS)**'ın seçili olduğunu kontrol et.
4. Araç çubuğunda **Upload**'a (sağ ok simgesi) bas.
5. Yükleme bitince **Tools** > **Serial Monitor**'ü aç ve hız listesinden **115200 baud**'u seç.

Kontrol et: IDE'de "Done uploading." yazar. Kart açılırken **Serial Monitor**'e şu satırları yazar:

```text
[DS   ] ========================================
[DS   ] WiFi SSID: Probot
[DS   ] Password:  ********
[DS   ] Channel:   1 (macro)
[DS   ] IP Address: 192.168.4.1
[DS   ] ========================================
```

Satırlar ekranı açmadan önce geçtiyse sorun değil; sonraki bölümde ağı WiFi listesinde görürsün. Derleme hatası alırsan: [Hatalar ve sorun giderme](sorunlar.md#derleme-hatalari).

## Robotun ağına bağlan {#robotun-agina-baglan}

!!! note "Not"
    Driver Station'ı aynı anda tek bir cihaz kontrol eder. İkinci cihaz sayfayı açamaz: [Arayüz açılmıyor](sorunlar.md#arayuz-acilmiyor).

1. Telefonun WiFi ayarlarında `Probot` ağını (adını değiştirdiysen o adı) seç ve şifreyi yaz.
2. Karşılama sayfası açılırsa **Driver Station'ı Aç**'a bas.
   ![Karşılama sayfası; robotun adı ve yeşil Driver Station'ı Aç düğmesi.](img/core-portal.png)
3. Driver Station aynı küçük pencerede açılırsa ya da karşılama sayfası hiç açılmazsa pencereyi kapat.
4. Tarayıcıda `http://192.168.4.1` adresini aç. Adres `https` değil `http` ile başlar. Sayfanın açılması birkaç saniye sürebilir.

Kontrol et: Sayfada **Dashboard**, **Joystick** ve **Logs** sekmeleri görünür. Karttaki LED mavi yanıp söner.

## Kumandayı bağla {#kumandayi-bagla}

Tarayıcı kumandayı, üzerinde bir düğmeye basılana kadar sayfaya göstermez. Kumanda robota değil, Driver Station'ı açtığın cihaza bağlanır.

1. Kumandayı Driver Station'ı açtığın cihaza USB ya da Bluetooth ile bağla.
2. Kumandada herhangi bir düğmeye bas.
3. Driver Station'da **Joystick** sekmesine bas.
4. Sol çubuğu oynat.

Kontrol et: **Joystick Check** bölümünde "Connected" yazar. Dairedeki nokta sol çubukla birlikte hareket eder.

## Robotu başlat ve değeri oku {#kumandayi-oku}

1. **Dashboard** sekmesine bas.
2. **Match Control** bölümünde **Autonomous** anahtarını kapat. Böylece **Start** doğrudan teleopu başlatır.
3. **Init**'e bas. Aynı düğmenin yazısı **Start** olur, LED sarı yanar.
4. **Start**'a bas. Düğmenin yazısı **Stop** olur.
5. Sol çubuğu ileri it, sonra geri çek.
6. **Stop**'a bas.

Kontrol et: **Start**'tan sonra LED yeşil yanıp söner. **Telemetry** panelinde çubuk ortadayken `Sol Y: 0.00` yazar. İleri ittikçe değer `1.00`'e kadar artar, geri çektikçe `-1.00`'e kadar azalır. **Stop**'tan sonra LED yeniden mavi yanıp söner.

## Sonraki adım

- [Driver Station arayüzü](arayuz.md): ekrandaki her düğme ve gösterge.
- [Robotun WiFi ayarlarını yap](wifi-ayarla.md): sınıfta birden çok robot varken ağ adı ve kanal.
- [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md): altı fonksiyonun ayrıntısı.
- [Motoru sür](motoru-sur.md): çubuk değerini motora ver.
