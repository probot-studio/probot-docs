# Arduino IDE'yi Probot için kur

Bu sayfada Arduino IDE'ye ESP32 kart paketini ve Probot kütüphanesini kuracak, kartı ve bölümleme ayarını seçecek, ilk örnek kodu karta yükleyeceksin.

## Başlamadan önce

- Windows, macOS ya da Linux bir bilgisayar ve internet bağlantısı.
- ESP32 kart (Probot kartı) ve USB veri kablosu. Yalnız şarj eden kablo kartı bilgisayara tanıtmaz.

Menü adları Arduino IDE'nin İngilizce arayüzüne göredir. Türkçe arayüzde **File** yerine **Dosya**, **Tools** yerine **Araçlar** yazar.

## Arduino IDE'yi kur {#arduino-ide}

Arduino IDE, kodu yazdığın, derlediğin ve USB ile karta gönderdiğin programdır. Probot kodu Arduino C++ ile yazılır.

1. Tarayıcıda [arduino.cc/en/software](https://www.arduino.cc/en/software) adresini aç.
2. İşletim sistemine uygun Arduino IDE 2 kurulum dosyasını indir.
3. Dosyayı çalıştırıp kurulumu bitir. Eski Arduino IDE 1.x kuruluysa kaldır; iki sürüm aynı anda açıkken USB portu çakışır.
4. Arduino IDE'yi aç.

Sonuç: IDE boş bir sketch ile açılır. Sketch'te `setup()` ve `loop()` fonksiyonları durur.

## ESP32 kart paketini kur {#esp32-kart-paketi}

Arduino IDE ESP32 kartlarını kendiliğinden tanımaz. Espressif'in kart paketi IDE'ye ESP32 için derlemeyi ve yüklemeyi öğretir.

!!! warning "Dikkat"
    Probot 0.3.0 kart paketinin 3.x sürümünü ister. 2.x kuruluysa 3.x sürümüne güncelle. Servo
    örneklerindeki `ledcAttachChannel` de 3.x ile gelir.

1. **Tools** > **Board** > **Boards Manager**'ı seç.
2. Arama kutusuna `esp32` yaz.
3. **esp32 by Espressif Systems** satırında 3.x ile başlayan bir sürüm seç.
4. **Install**'a bas ve kurulumun bitmesini bekle.

Sonuç: **esp32 by Espressif Systems** satırında seçtiğin sürüm "installed" olarak görünür.

## Kütüphaneleri kur {#kutuphaneler}

Probot iki kütüphane ister: kütüphanenin kendisi `probot` ve durum LED'ini süren `Adafruit NeoPixel`.

1. **Tools** > **Manage Libraries**'i seç.
2. Arama kutusuna `probot` yaz.
3. **probot** satırında sürüm listesinden **0.3.0**'ı seç ve **Install**'a bas.
4. IDE eksik kütüphaneleri de kurmayı sorarsa **Install all**'a bas.
5. Arama kutusuna `adafruit neopixel` yaz. **Adafruit NeoPixel** kurulu değilse **Install**'a bas.

Sonuç: **File** > **Examples** menüsünde **probot** altında **JoystickTest**, **ServoTest** ve **TankDrive** örnekleri görünür.

## Kartı ve bölümlemeyi seç {#kart-ve-bolumleme}

Kartın belleği bölümlere ayrılır. **Huge APP** düzeni koda en büyük alanı verir, karşılığında kablosuz güncelleme (OTA) kapanır. Probot OTA kullanmaz.

Bölümleme ayarı önerilir. Kütüphane ve arayüz varsayılan bölümlemenin yaklaşık dörtte üçünü kullanır; kod büyüdükçe derleme "Sketch too big" hatasıyla durur. **Huge APP** bu sınırı kaldırır.

!!! warning "Dikkat"
    Örneklerdeki pinler ESP32-S3 içindir. Düz ESP32'de GPIO6-11 flash belleğe, WROVER modüllü kartlarda GPIO16-17 PSRAM'e bağlıdır; örneklerdeki bu pinleri 25, 26, 27 gibi boş pinlerle değiştir, GPIO34-39'u yalnız giriş için kullan.

1. **Tools** > **Board** menüsünü aç.
2. ESP32 kartlarının listesinden **ESP32S3 Dev Module**'ü seç. Kartın ESP32-S3 değil düz ESP32 ise **ESP32 Dev Module**'ü seç.
3. **Tools** > **Partition Scheme**'den **Huge APP (3MB No OTA/1MB SPIFFS)**'ı seç.

Sonuç: **Tools** menüsünde **Board** satırında seçtiğin kart, **Partition Scheme** satırında **Huge APP (3MB No OTA/1MB SPIFFS)** yazar.

Her yüklemeden önce bu iki satırı kontrol et.

## İlk kodu yükle {#ilk-yukleme}

Kurulumu kütüphanenin kendi örneğiyle dene. **JoystickTest** kumanda değerlerini Driver Station'a yazar.

1. **File** > **Examples** > **probot** > **JoystickTest**'i seç.
2. Sınıfta başka kartlar da varsa `PROBOT_WIFI_AP_SSID` satırındaki `"Probot"` adını kendi robotunun adıyla değiştir.
3. Kartı USB veri kablosuyla bilgisayara bağla.
4. **Tools** > **Port** menüsünden kartın portunu seç. Windows'ta `COM3` gibi, Linux ve macOS'ta `/dev/` ile başlayan bir ad görünür.
5. Araç çubuğunda **Upload**'a (sağ ok simgesi) bas.
6. Yükleme bitince **Tools** > **Serial Monitor**'ü aç ve hız listesinden **115200 baud**'u seç.

Sonuç: IDE'de "Done uploading." yazar. Kart açılırken **Serial Monitor**'e şu satırları yazar (ağ adını değiştirdiysen o ad görünür):

```text
[DS   ] ========================================
[DS   ] WiFi SSID: Probot
[DS   ] Password:  ********
[DS   ] Channel:   3 (macro)
[DS   ] IP Address: 192.168.4.1
[DS   ] ========================================
```

Bilgisayarın ya da telefonun WiFi listesinde robotun ağı görünür. Örneğin şifresi `Probot1234`'tür.

## Sorun mu var?

- **Port listesi boş:** [Port listesi boş ya da yükleme başarısız](sorunlar.md#port-yok).
- **"Sketch too big":** Bölümleme yanlış: ["Sketch too big"](sorunlar.md#sketch-too-big).
- **"probot.h: No such file or directory":** Kütüphane kurulu değil: [probot.h bulunamıyor](sorunlar.md#probot-h-yok).
- **"Adafruit_NeoPixel.h: No such file or directory":** [NeoPixel kütüphanesi eksik](sorunlar.md#neopixel-yok).

## Sonraki adım

[İlk 10 dakika](ilk-10-dakika.md): kendi ilk kodunu yaz, robotun ağına bağlan ve kumandayı oku.
