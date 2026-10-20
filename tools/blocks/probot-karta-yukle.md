# Kodu Probot kartına yükle

Blocks kodu üretir ama karta yüklemez. Bu sayfada indirdiğin `.ino` dosyasını Arduino IDE ile Probot
kartına (ESP32) yükleyecek ve robotun WiFi ağına bağlanacaksın. Ayrıntılı kurulum Probot Core
dokümanındadır.

## Başlamadan önce

- Arduino IDE kurulu ve Probot için ayarlı: ESP32 kart paketi, `probot` ve `Adafruit NeoPixel`
  kütüphaneleri, **Huge APP (3MB No OTA)** bölümleme. Bkz. [Probot Core: Arduino IDE kurulumu](../core/arduino-ide-kur.md).
- Blocks'tan indirdiğin `.ino` dosyası. Bkz. [Kodu kopyala ya da indir](probot-kodu-al.md).
- Probot kartı ve USB veri kablosu.

## Dosyayı Arduino IDE'de aç

1. Arduino IDE'de **File** > **Open** (Türkçe arayüzde **Dosya** > **Aç**) menüsünü seç.
2. İndirdiğin `.ino` dosyasını seç.
3. IDE dosyayı aynı adlı bir klasöre taşımayı önerirse **OK**'a bas.

Sonuç: Kod IDE'de açılır. İlk satırda `// Probot Blocks ile üretildi - probotstudio.com/blocks` yazar.

<!-- SAY: İndirdiğimiz dosyayı Arduino IDE ile açıyoruz. -->

## Karta yükle

!!! warning "Dikkat"
    Blocks'taki WiFi şifresi 8 karakterden kısaysa kod derlenmez. Önce şifreyi Blocks'ta düzelt,
    `.ino`'yu yeniden indir.

1. Kartı USB veri kablosuyla bilgisayara bağla. Şarj kablosunda **Port** listesi boş kalır.
2. **Araçlar** > **Kart** menüsünde **ESP32S3 Dev Module**'ün seçili olduğunu kontrol et.
3. **Araçlar** > **Port** menüsünden kartın portunu seç.
4. **Araçlar** > **Partition Scheme**'de **Huge APP (3MB No OTA)**'nın seçili olduğunu kontrol et.
5. IDE'nin araç çubuğunda **Upload**'a (Türkçe arayüzde **Yükle**, sağ ok simgesi) bas.

Sonuç: Derleme ve yükleme biter, IDE'de "Done uploading." yazar. Kart yeniden başlar. Birkaç saniye
sonra bilgisayarın WiFi listesinde robotun ağı görünür.

<!-- SAY: Kartı bağlayıp Arduino IDE'den kodu yüklüyoruz. -->

## Robotun ağına bağlan

!!! note "Not"
    Bu adımlar Blocks'un ürettiği probot-core 0.3 koduna göredir. Driver Station'ın ayrıntısı kütüphanenin
    kendi dokümanındadır.

1. Bilgisayarın ya da telefonun WiFi listesinde robotun ağını seç. Ad, Blocks'taki **Ağ adı**'dır; boş
   bıraktıysan `Probot-` ile başlar.
2. Blocks'taki şifreyle bağlan. Şifre, kodun başındaki `#define PROBOT_WIFI_AP_PASSWORD` satırında da yazar.
3. Bir karşılama sayfası kendiliğinden açılır. Bu sayfada robotun ağ adı ve **Driver Station'ı Aç**
   düğmesi görünür. Düğmeye bas. Driver Station aynı küçük pencerede açılırsa ya da karşılama sayfası
   hiç açılmazsa o pencereyi kapat ve normal tarayıcıda `http://192.168.4.1` adresini aç.
4. Kumandayı bu cihaza bağla.
5. Kumandada herhangi bir düğmeye bas. Driver Station'da "Not Connected" yazısı "Connected" olur.
6. Driver Station'da **Init**'e bas. Aynı düğmenin yazısı **Start** olur.
7. **Start**'a bas.

Sonuç: Düğmenin yazısı **Stop** olur. **Autonomous** işaretliyse **Status** alanında önce "Autonomous"
yazar ve otonom bölümü çalışır. **Autonomous Duration** süresi (varsayılan 30 saniye) dolunca "Teleop"
yazar; robotu kumandayla sürersin.

<!-- SAY: Robotun yayınladığı ağa bağlanıp Driver Station'ı açıyoruz. -->

## Sorun mu var?

- **Port listesi boş:** USB kablosu yalnız şarj kablosu olabilir. Veri kablosu kullan.
- **"Sketch too big":** **Partition Scheme** yanlış. **Huge APP (3MB No OTA)**'yı seç.
- **"probot.h: No such file":** `probot` kütüphanesi kurulu değil. **Kütüphane Yöneticisi**'nden kur.
- **"PROBOT_WIFI_AP_PASSWORD must be at least 8 characters.":** Şifre 8 karakterden kısa. Blocks'ta
  **Şifre (en az 8)** kutusunu düzelt, `.ino`'yu yeniden indir. Bkz. [Robot WiFi ayarlarını yap](probot-wifi-ayarla.md).
- **Diğer derleme hataları:** Bkz. [Probot Core: Arduino IDE kurulumu](../core/arduino-ide-kur.md).

## Sonraki adım

[Blokları FTC Blocks'a taşı](probot-ftcye-tasi.md)
