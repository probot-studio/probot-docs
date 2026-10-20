# Hatayı adım adım daralt

Robot beklediğin gibi davranmadığında bu sırayı izleyerek sebebi tek bir parçaya indirirsin.

Bir robot birçok katmandan oluşur: kod, kütüphane, motor sürücü, motor, kablo, güç. Hepsini aynı anda
test edemezsin. Her adımda bir ihtimali elersin; kalan ihtimal cevaptır.

## Başlamadan önce

- Ekranda, Telemetry panelinde ya da Serial Monitor'de bir hata yazısı varsa önce
  [Hatalar ve sorun giderme](sorunlar.md) sayfasında o yazıyı ara.
- Robotun ağına bağlanıp Driver Station'ı açabiliyorsun. Bkz. [İlk 10 dakika](ilk-10-dakika.md).
- Kodun son çalışan hâlinin bir kopyası elinde.

## Ne değiştiğini bul {#ne-degisti}

Robot dün çalışıyordu, bugün çalışmıyor. İlk soru şudur: ne değişti? Kod değişmediyse koda bakmak zaman
kaybıdır; sebep kablo, konnektör, akü ya da motordadır.

1. Son çalıştığı andan beri değişen her şeyi bir kâğıda yaz: kod, kablo, akü, parça.
2. Kod değiştiyse son çalışan kopyayı karta yükle.
3. Kod değişmediyse konnektörleri tek tek çıkarıp yeniden tak ve gevşek kablo ara.
4. Aküyü şarjlı bir aküyle değiştir.

Sonuç: Son çalışan kopyayla ya da şarjlı aküyle hata kayboluyorsa sebep o değişikliktir. Hata sürüyorsa
sonraki bölüme geç.

## Değerleri ekrana yazdır {#degerleri-yazdir}

Tahmin yürütmek yerine veriyi oku. `probot::printf` yazdığın satırı Driver Station'ın **Telemetry**
paneline gönderir. Önce durum LED'inin rengine bak: [Durum göstergeleri](sorunlar.md#durum-gostergeleri).

Örnekte sol çubuğun değeri yazdırılır:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void robotInit() {}
void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float ileri = js.getLeftY();
  probot::printf("ileri=%.2f\n", ileri);   // Telemetry panelinde görünür
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Şüphelendiğin değeri `probot::printf` ile yazdıran satırı `teleopLoop()`'a ekle, örnekteki gibi.
2. Kodu karta yükle.
3. Driver Station'da **Autonomous** anahtarını kapat. Böylece **Start** doğrudan teleopu başlatır.
4. **Init**'e, sonra **Start**'a bas.
5. Kumandada sol çubuğu ileri it ve bırak.

Sonuç: **Telemetry** panelinde `ileri=` satırları akar. Çubuk ileriyken değer artıdır, bırakınca `ileri=0.00` olur.
Değer beklediğin gibiyse sorun kumandada değil, değeri kullanan koddadır.

Kartı USB ile bilgisayara bağlarsan Serial Monitor'de (115200 baud) kütüphanenin `[DS   ]` ve `[SYS  ]` satırlarını
da okursun. **Logs** sekmesi bağlantının durumunu gösterir: **RSSI**, **Joystick Age**, **Deadline Miss**.

## Sistemi katmanlara böl {#katmanlara-bol}

Motor eskiden dönüyordu, şimdi dönmüyor. Kablo mu, sürücü mü, motor mu? Her ihtimali ayrı test et.

!!! warning "Dikkat"
    Motoru doğrudan güç kaynağına bağlamadan önce robotu takoza al, tekerlekler yere değmesin. Motor tam
    hızda döner.

1. Motoru sürücüden ayır ve doğrudan güç kaynağına bağla.
2. Motor dönüyorsa motoru sürücüye geri bağla. Motor dönmüyorsa sorun motorda ya da güç hattındadır.
3. Sürücünün kablosunu çalıştığını bildiğin başka bir kabloyla değiştir.
4. Sürücüyü kütüphanesiz bir test koduyla dene (aşağıda).

Sonuç: Motor bir katmanda dönüp bir sonrakinde dönmüyorsa sorun o iki katmanın arasındadır.

BTS7960 modülünde R_EN ve L_EN pinleri 5V'a (ya da kartın 3,3 V'una) bağlı olmalı; bağlı değilse motor hiç dönmez.

Kütüphanesiz test kodu `probot.h`'yi eklemez; `setup()` ve `loop()` bu kodda senindir. BTS7960 tarzı bir sürücü
için:

```cpp
// Kütüphanesiz motor testi: probot.h yok.
// Pinleri kendi kartına göre değiştir
#define MOTOR_RPWM 5   // ileri
#define MOTOR_LPWM 6   // geri

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
}

void loop() {
  Serial.println("ileri");
  analogWrite(MOTOR_RPWM, 100);   // düşük hızla ileri
  analogWrite(MOTOR_LPWM, 0);
  delay(2000);

  Serial.println("dur");
  analogWrite(MOTOR_RPWM, 0);
  analogWrite(MOTOR_LPWM, 0);
  delay(2000);
}
```

Motor bu kodla dönüyorsa sürücü, kablo ve motor sağlamdır; sorun Probot kodundadır. Dönmüyorsa sorun kütüphanede
değil, donanımdadır. Kütüphaneyle çalışan sürüş kodu: [Motoru sür](motoru-sur.md).

## Tek seferde bir şeyi değiştir {#tek-degisiklik}

Aynı anda kabloyu, kodu ve aküyü değiştirirsen sorun çözülse bile hangisinin çözdüğünü bilemezsin.

1. Tek bir değişiklik yap: bir kablo, bir satır kod ya da bir parça.
2. Kodu yükle ya da robotu yeniden aç.
3. Aynı testi tekrarla.
4. Sonucu kâğıda yaz, sonra sıradaki değişikliğe geç.

Sonuç: Hatanın kaybolduğu ya da geri geldiği değişiklik kâğıtta tek satırdır.

## Loop'u en sade hâline indir {#en-sade-kod}

LED kırmızı yanıp sönüyorsa ya da robot takılıyorsa sebebi koddaki satırlara kadar daralt. Loop takılması
hakkında: [Loop takıldı](sorunlar.md#pb-e301).

1. `teleopLoop()` içindeki her satırı yorum satırına al (`//`).
2. Kodu yükle. **Autonomous** anahtarı kapalıyken **Init**'e, sonra **Start**'a bas.
3. Hata yalnız otonomda çıkıyorsa **Autonomous** anahtarını aç ve aynı işlemi `autonomousLoop()` için yap. Robot **Init**'te ya da **Start**'ta donup LED kırmızıya dönmüyorsa `robotInit()` ve `teleopInit()` içindeki satırlara bak.
4. Hata kaybolduysa yorum satırlarını birer birer aç, her seferinde yükleyip dene.

Sonuç: Hata, açtığın son satırla geri gelir. Sorun o satırdadır.

Örnekte şüpheli sensör okuması kapalıdır:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>
#include <Wire.h>

#define SENSOR_ADRES 0x29   // kendi sensörünün I2C adresi

void sensorOku() {
  Wire.beginTransmission(SENSOR_ADRES);
  uint8_t sonuc = Wire.endTransmission();
  probot::printf("sensor=%u\n", sonuc);   // 0: sensör yanıt verdi
}

void robotInit() {
  Wire.begin();
}

void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  // sensorOku();   // şüpheli satır: kapalı, sonra tek tek açılacak
}

void autonomousInit() {}
void autonomousLoop() {}
```

## Kökü bulduğundan emin ol {#koku-dogrula}

Sebebi bulduğunu düşündüğünde sorunun başka bir yerden gelmediğini doğrula. Net bir kök sebep, aynı hatanın
tekrar etmesini önler.

1. Bulduğun parçayı düzelt ve test et.
2. Parçayı eski hâline döndür ve aynı testi tekrarla.
3. Parçayı yeniden düzelt.

Sonuç: Hata yalnız o parça eski hâlindeyken çıkıyorsa kök sebep odur.

## Sorun mu var?

- **Hata ekranda bir yazıyla çıkıyor:** Yazıyı [Hatalar ve sorun giderme](sorunlar.md) sayfasında ara.
- **Sebep bulunmuyor:** Hatayı en kısa kodla bildir: [Hata bildir](sorunlar.md#hata-bildir).

## Sonraki adım

[Örnek robotu baştan sona kodla](ornek-robotu-kodla.md)
