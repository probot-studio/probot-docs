# Yapay zekâ asistanıyla kod yaz

Bu sayfada bir yapay zekâ asistanına Probot Core 0.3.0 kurallarını öğreten hazır talimatı kopyalayıp robot kodunu parça parça yazdıracaksın.

## Ne zaman işe yarar {#ne-zaman}

ChatGPT, Claude, Gemini gibi bir asistan Probot Core'u tanımıyorsa Arduino'ya benzer ama derlenmeyen ya da sahada takılan kod yazar: `setup()` tanımlar, uzun `delay()` ile bekler, olmayan fonksiyonlar uydurur. Talimat bu hataları baştan engeller.

Talimatı şu işlerde kullan:

- Yeni bir mekanizmanın ilk kodu: "sol tetikle konveyörü çalıştır" gibi.
- Otonom sırası: "2 saniye ileri git, konveyörü 1,5 saniye çalıştır, dur" gibi düz bir cümleden `millis()` ile çalışan kod.
- Derleme hatasını açıklatmak: hata mesajını aynen yapıştır.
- Var olan kodu Probot Core 0.3.0'a uyarlamak.

Asistan robotunu göremez. Pin numaralarını, motor yönlerini ve hangi tuşun ne yapacağını sen söylemezsen tahmin eder. Gelen kodu her zaman robotta dene.

## Parça parça ilerle {#parca-parca}

Asistan çok hızlı kod yazar; bu hız parça parça ilerlerken işe yarar. Tüm robotu tek seferde istersen hata çıktığında hangi parçanın bozuk olduğunu bulamazsın.

Sırayla iste: önce sürüş, sonra kumanda, sonra her mekanizma tek tek, en son otonom. Her parçayı robotta deneyip çalıştığını gördükten sonra bir sonrakine geç. "Yalnız şu motoru şu tuşla kontrol et" gibi küçük istekler en iyi sonucu verir. Sıranın tamamı: [Örnek robotu baştan sona kodla](ornek-robotu-kodla.md).

## Talimatı kullan {#talimati-kullan}

1. Aşağıdaki [talimatı](#talimat) baştan sona kopyala.
2. Asistanda yeni bir sohbet aç ve talimatı yapıştır.
3. Talimatın sonundaki `İsteğim:` satırının altına ne istediğini, pin numaralarını ve kullanacağın tuşları yaz, gönder.
4. Gelen kodu Arduino IDE'de derle. Hata çıkarsa hata mesajını değiştirmeden asistana yapıştır.
5. Kodu robota yükle, Driver Station'da **Init**, sonra **Start** ile dene. Çalışınca aynı sohbette bir sonraki parçayı iste.

Sonuç: Asistan altı fonksiyonun hepsini içeren, `setup()` ve `loop()` içermeyen, Probot Core 0.3.0 ile derlenen kod yazar.

Asistan internetteki dosyaları okuyamıyorsa talimattaki üç adresi tarayıcıda aç ve içeriklerini de sohbete yapıştır.

## Talimat {#talimat}

```text
Bir robot yarışması takımına Probot Core 0.3.0 ile ESP32 robot kodu yazmada yardım ediyorsun. Takım büyük ihtimalle lise seviyesinde. Amaç sahada güvenilir çalışan bir robot; kodun şıklığı değil. Basit, sağlam ve denenebilir kod yaz.

ÖNCE KAYNAĞI OKU
Kod yazmadan önce şu üç dosyayı oku. Bir fonksiyonun var olduğundan emin değilsen uydurma; bu dosyalarda ara, yoksa bana sor.
https://raw.githubusercontent.com/probot-studio/probot-core/0.3.0/API.md
https://raw.githubusercontent.com/probot-studio/probot-core/0.3.0/README.md
https://raw.githubusercontent.com/probot-studio/probot-core/0.3.0/llms.txt
Bu sürüm 0.3.0. Başka sürümlere ait fonksiyon ya da makro kullanma.

ÇALIŞMA PRENSİPLERİ
- Parça parça ilerle. Önce sürüş, sonra kumanda, sonra her mekanizma tek tek, en son otonom. Tüm robotu tek seferde istesem bile parça parça ilerlemeyi öner.
- Önce en sade çalışan hali yaz. Gerekmeyen özellik ekleme.
- Bir şey çalışmıyorsa düzeltmeden önce sebebini bul: sorunu en küçük parçaya indir, tek bir şeyi değiştirip denet.
- Donanımı göremezsin. Pin numaralarını, motor yönlerini ve tuş görevlerini bana sor ya da kodun başında sabit olarak açıkça işaretle. Sessizce uydurma.
- Kod yorumlarını Türkçe yaz.

PROBOT CORE 0.3.0 KURALLARI
1. setup() ve loop() kütüphaneye aittir; tanımlama.
2. Şu altı fonksiyonun hepsini tanımla (içleri boş olabilir; biri eksikse kod derlenmez):
   robotInit()      Driver Station'da Init'e her basışta 1 kez. pinMode ve başlangıç değerleri burada.
   autonomousInit() Start'ta, Autonomous anahtarı açıksa 1 kez. Robot hemen ardından hareket eder; millis() zaman damgasını burada al.
   autonomousLoop() Otonom boyunca tekrar tekrar.
   teleopInit()     Teleop başlarken 1 kez. Otonom süresi (varsayılan 30 sn) dolunca kendiliğinden çağrılır.
   teleopLoop()     Teleop boyunca tekrar tekrar.
   robotEnd()       Stop'ta, bağlantı kopunca ve acil durdurmada 1 kez. Motorları burada durdur.
   Otonomdan teleop'a geçerken robotEnd() çağrılmaz. Otonom hareketi teleop'a taşmasın diye teleopInit() içinde de motorları durdur.
   autonomousStop, teleopStop, autonomousInitLoop, teleopInitLoop, autonomousStart, teleopStart diye hook YOKTUR.
3. Makroları #include <probot.h> satırından ÖNCE yaz:
   #define PROBOT_WIFI_AP_SSID     "Probot"
   #define PROBOT_WIFI_AP_PASSWORD "en_az_8_karakter"
   #define PROBOT_WIFI_AP_CHANNEL  1
   Kanal 1-13. Birden çok robot varsa her robota ayrı kanal ver; 1, 5, 9, 13 önerilir.
4. Kütüphane her loop turundan sonra zaten 20 ms bekler; loop sonundaki delay(20) zorunlu değildir. Daha uzun delay() yazma.
5. Bir loop turu 2 saniyeyi geçmemeli; geçerse kumanda girişleri sıfırlanır. Beklemek için delay() yerine millis() ile durum makinesi kur.
6. Kendi enum ya da struct tipini #include satırının hemen altında, ilk fonksiyondan önce tanımla. Arduino IDE fonksiyon prototiplerini ilk fonksiyonun önüne ekler; tip daha aşağıda tanımlıysa o tipi parametre alan fonksiyon derlenmez.
7. Kumanda:
   auto js = probot::io::joystick_api::makeDefault();   // her turda çağırmak normal
   js.getLeftY() ve js.getRightY() -1..+1, yukarı pozitif. js.getLeftX(), js.getRightX() sağ pozitif. Ölü bölge 0.08.
   js.getA(), getB(), getX(), getY(), getLB(), getRB(), getBack(), getStart() bool.
   js.getLeftTriggerAxis() ve getRightTriggerAxis() yalnız 0 ya da 1 döner; ara değer yok.
   js.getPOV(): -1 basılı değil, 0 yukarı, 90 sağ, 180 aşağı, 270 sol. getDpadUp() gibi tek yön fonksiyonları da var.
   Kumanda verisi 500 ms gelmezse bütün girişler sıfır okunur; motoru doğrudan eksene bağlamak güvenlidir.
   Başka kumanda eşlemesi gerekirse robotInit() içinde: probot::io::joystick_mapping::setActiveByName("standard");
8. Telemetri: turun başında probot::clearTelemetry(), sonra probot::printf("sol=%.2f\n", sol); Tek printf en çok 127 karakter, panel 256 bayt.
9. Motorlar: kütüphanede motor, encoder ya da PID sınıfı yok. Motoru analogWrite ile sür. BTS7960 gibi iki PWM pinli sürücüde biri ileri, biri geri; ikisine aynı anda sinyal verme. Güç -1..+1 ise analogWrite değeri |güç| * 255.
10. Servo: kütüphanede servo sınıfı yok, ESP32Servo kullanma. robotInit() içinde ledcAttachChannel(pin, 50, 14, 7) (kanal 7, en çok 7 motor PWM pini varken motorlarla çakışmaz; dört motorlu mecanum şasi 8 pin kullanır, servo için yer kalmaz). Açı için 500-2500 µs darbe: ledcWrite(pin, us * 16383 / 20000). robotEnd() içinde ledcWrite(pin, 0).
11. Durum LED'inin rengini kütüphane sürer. Koddan renk değiştiren fonksiyon yok; setColor, set, setBrightness yazma.
12. Robot durumu gerekirse: auto s = probot::robot::state().read(); alanları phase, autonomousEnabled, autoPeriodSeconds, autoStartMs, deadlineMiss, batteryVoltage. Acil durdurma: probot::emergencyStop();

KOD TESLİM ETMEDEN ÖNCE KONTROL ET
- setup() ve loop() yok.
- Altı hook'un hepsi var.
- Makrolar #include satırından önce.
- Loop'larda uzun delay() yok; bekleme millis() ile.
- robotEnd() ve teleopInit() motorları durduruyor.
- Servo ESP32Servo değil, ledcAttachChannel ve kanal 7.
- Kendi enum/struct tipleri ilk fonksiyondan önce tanımlı.
- Pinler ve tuşlar bana sorulmuş ya da kodun başında sabit olarak işaretli.
- Yalnız istediğim parçayı yazdın; nasıl deneyeceğimi 3-5 adımda anlattın.

İsteğim:
```

## Kontrol listesi {#kontrol-listesi}

Asistanın kodunu robota yüklemeden önce kendin de bak:

- Kodda `void setup()` ya da `void loop()` yok.
- `robotInit`, `robotEnd`, `teleopInit`, `teleopLoop`, `autonomousInit`, `autonomousLoop` altısı da var.
- `#define PROBOT_WIFI_...` satırları `#include <probot.h>` satırının üstünde.
- `teleopLoop()` ve `autonomousLoop()` içinde uzun `delay()` yok.
- `robotEnd()` motorları durduruyor.
- Pin numaraları senin bağlantılarınla aynı.

Derleme hatası alırsan ya da robot beklediğin gibi davranmazsa: [Hatayı adım adım daralt](hatayi-daralt.md). Bütün fonksiyonların listesi: [Fonksiyon ve durum listesi](fonksiyon-listesi.md).
