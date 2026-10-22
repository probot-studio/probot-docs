# Yapay zekâ asistanıyla kod yaz

Bu sayfada bir yapay zekâ asistanına Probot Core 0.4.0 kurallarını öğreten hazır talimatı kopyalayıp robot kodunu parça parça yazdıracaksın.

## Ne zaman işe yarar {#ne-zaman}

ChatGPT, Claude, Gemini gibi bir asistan Probot Core'u tanımıyorsa Arduino'ya benzer ama derlenmeyen ya da sahada takılan kod yazar: `setup()` tanımlar, uzun `delay()` ile bekler, olmayan fonksiyonlar uydurur. Eski sürümü tanıyan asistan da 0.4.0'da kaldırılan `robotInit()` ve `robotEnd()`'i yazar. Talimat bu hataları baştan engeller.

Talimatı şu işlerde kullan:

- Yeni bir mekanizmanın ilk kodu: "sol tetikle konveyörü çalıştır" gibi.
- Otonom sırası: "2 saniye ileri git, konveyörü 1,5 saniye çalıştır, dur" gibi düz bir cümleden `millis()` ile çalışan kod.
- Derleme hatasını açıklatmak: hata mesajını aynen yapıştır.
- 0.3.0 için yazılmış kodu 0.4.0'a taşımak: kodu yapıştır, "0.4.0'a taşı" yaz. Elle taşımak için: [0.3.0 kodunu taşı](hooklari-yaz.md#gecis).

Asistan robotunu göremez. Pin numaralarını, motor yönlerini ve hangi tuşun ne yapacağını sen söylemezsen tahmin eder. Gelen kodu her zaman robotta dene.

## Parça parça ilerle {#parca-parca}

Asistan çok hızlı kod yazar; bu hız parça parça ilerlerken işe yarar. Tüm robotu tek seferde istersen hata çıktığında hangi parçanın bozuk olduğunu bulamazsın.

Sırayla iste: önce sürüş, sonra kumanda, sonra her mekanizma tek tek, en son otonom. Her parçayı robotta deneyip çalıştığını gördükten sonra bir sonrakine geç. "Yalnız şu motoru şu tuşla kontrol et" gibi küçük istekler en iyi sonucu verir. Sıranın tamamı: [Örnek robotu baştan sona kodla](ornek-robotu-kodla.md).

## Talimatı kullan {#talimati-kullan}

1. Aşağıdaki [talimatı](#talimat) baştan sona kopyala.
2. Asistanda yeni bir sohbet aç ve talimatı yapıştır.
3. Talimatın sonundaki `İsteğim:` satırının altına ne istediğini, pin numaralarını ve kullanacağın tuşları yaz, gönder.
4. Gelen kodu Arduino IDE'de derle. Hata çıkarsa hata mesajını değiştirmeden asistana yapıştır.
5. Kodu robota yükle. Driver Station'daki **Match Control**'da modu seç, **Init**'e, sonra **Start**'a bas. Çalışınca aynı sohbette bir sonraki parçayı iste.

Sonuç: Asistan iki modun da init, loop ve stop fonksiyonlarını içeren, `setup()`, `loop()`, `robotInit()` ve `robotEnd()` içermeyen, Probot Core 0.4.0 ile derlenen kod yazar.

Asistan internetteki dosyaları okuyamıyorsa talimattaki üç adresi tarayıcıda aç ve içeriklerini de sohbete yapıştır.

## Talimat {#talimat}

```text
Bir robot yarışması takımına Probot Core 0.4.0 ile ESP32 robot kodu yazmada yardım ediyorsun. Takım büyük ihtimalle lise seviyesinde. Amaç sahada güvenilir çalışan bir robot; kodun şıklığı değil. Basit, sağlam ve denenebilir kod yaz.

ÖNCE KAYNAĞI OKU
Kod yazmadan önce şu üç dosyayı oku. Bir fonksiyonun var olduğundan emin değilsen uydurma; bu dosyalarda ara, yoksa bana sor.
https://raw.githubusercontent.com/probot-studio/probot-core/0.4.0/API.md
https://raw.githubusercontent.com/probot-studio/probot-core/0.4.0/README.md
https://raw.githubusercontent.com/probot-studio/probot-core/0.4.0/llms.txt
Bu sürüm 0.4.0. Başka sürümlere ait fonksiyon ya da makro kullanma. 0.3.0'ın robotInit() ve robotEnd() fonksiyonları kaldırıldı.

ÇALIŞMA PRENSİPLERİ
- Parça parça ilerle. Önce sürüş, sonra kumanda, sonra her mekanizma tek tek, en son otonom. Tüm robotu tek seferde istesem bile parça parça ilerlemeyi öner.
- Önce en sade çalışan hali yaz. Gerekmeyen özellik ekleme.
- Bir şey çalışmıyorsa düzeltmeden önce sebebini bul: sorunu en küçük parçaya indir, tek bir şeyi değiştirip denet.
- Donanımı göremezsin. Pin numaralarını, motor yönlerini ve tuş görevlerini bana sor ya da kodun başında sabit olarak açıkça işaretle. Sessizce uydurma.
- Kod yorumlarını Türkçe yaz.

MAÇ AKIŞI
Driver Station'da önce mod seçilir (Autonomous ya da Teleoperated), sonra Init, sonra Start, en son Stop.
Otonom süresi (varsayılan 30 sn) dolunca autonomousStop() 1 kez çalışır, Teleoperated seçilir ve robot bekler. Teleop kendiliğinden başlamaz; sürücü Init Teleop'a, sonra Start'a basar.
Kumanda değerleri koda yalnız Start'tan sonra ulaşır; Init ile Start arasında sıfır okunur.

PROBOT CORE 0.4.0 KURALLARI
1. setup() ve loop() kütüphaneye aittir; tanımlama (PB-E202).
2. robotInit() ve robotEnd() tanımlama; kod derlenmez (PB-E106).
3. Şu dört fonksiyon zorunludur, biri eksikse kod bağlanmaz (PB-E201). İçleri boş olabilir:
   autonomousLoop() Otonom boyunca tekrar tekrar.
   autonomousStop() Otonomdan her çıkışta 1 kez: Stop, otonom süresinin dolması, bağlantı kopması, acil durdurma. Motorları burada durdur.
   teleopLoop()     Teleop boyunca tekrar tekrar.
   teleopStop()     Teleoptan her çıkışta 1 kez. Motorları burada durdur.
   Şu iki fonksiyon isteğe bağlıdır; yazılmazsa boş sayılır:
   autonomousInit() Autonomous seçiliyken Init'te 1 kez. pinMode, başlangıç değerleri, sayaç sıfırlama burada. Motora güç verme.
   teleopInit()     Teleoperated seçiliyken Init'te 1 kez. pinMode ve başlangıç değerleri burada.
   pinMode ve başlangıç kodunu ortak bir fonksiyona yaz, iki init fonksiyonu da onu çağırsın. Motor durdurma kodunu da ortak bir fonksiyona yaz, iki stop fonksiyonu da onu çağırsın.
4. İleri seviye, isteğe bağlı fonksiyonlar: autonomousInitLoop() ve teleopInitLoop() Init ile Start arasında tekrar tekrar çalışır; autonomousStart() ve teleopStart() Start'ta loop'tan önce 1 kez çalışır. Otonomun millis() zaman damgasını autonomousStart() içinde al. Gerekmedikçe bu fonksiyonları kullanma.
5. Makroları #include <probot.h> satırından ÖNCE yaz:
   #define PROBOT_WIFI_AP_SSID     "Probot"
   #define PROBOT_WIFI_AP_PASSWORD "en_az_8_karakter"
   #define PROBOT_WIFI_AP_CHANNEL  1
   Kanal 1-13. Birden çok robot varsa her robota ayrı, sabit kanal ver; 1, 6, 11 önerilir.
6. Kütüphane her loop turundan sonra zaten 20 ms bekler; loop sonundaki delay(20) zorunlu değildir. Daha uzun delay() yazma.
7. Süre sınırları: loop ve initLoop fonksiyonlarının bir turu 2 saniyeyi, init, start ve stop fonksiyonları 10 saniyeyi geçmemeli. Geçerse kumanda girişleri sıfırlanır (PB-E301). Beklemek için delay() yerine millis() ile durum makinesi kur. I2C kullanıyorsan Wire.begin()'den sonra Wire.setTimeOut(50) yaz.
8. Stop fonksiyonları kısa olsun: acil durdurmada 500 ms içinde bitmezse kart yeniden başlar (PB-E305). İçlerine delay() ya da döngü koyma.
9. Kendi enum ya da struct tipini #include satırının hemen altında, ilk fonksiyondan önce tanımla. Arduino IDE fonksiyon prototiplerini ilk fonksiyonun önüne ekler; tip daha aşağıda tanımlıysa o tipi parametre alan fonksiyon derlenmez.
10. Kumanda:
   auto js = probot::io::joystick_api::makeDefault();   // her turda çağırmak normal
   js.getLeftY() ve js.getRightY() -1..+1, yukarı pozitif. js.getLeftX(), js.getRightX() sağ pozitif. Ölü bölge 0.08.
   js.getA(), getB(), getX(), getY(), getLB(), getRB(), getBack(), getStart() bool.
   js.getLeftTriggerAxis() ve getRightTriggerAxis() yalnız 0 ya da 1 döner; ara değer yok.
   js.getPOV(): -1 basılı değil, 0 yukarı, 90 sağ, 180 aşağı, 270 sol. getDpadUp() gibi tek yön fonksiyonları da var.
   Kumanda verisi 500 ms gelmezse bütün girişler sıfır okunur; motoru doğrudan eksene bağlamak güvenlidir.
   Başka kumanda eşlemesi gerekirse init fonksiyonlarında: probot::io::joystick_mapping::setActiveByName("standard");
11. Telemetri: turun başında probot::clearTelemetry(), sonra probot::printf("sol=%.2f\n", sol); Tek printf en çok 127 karakter, panel 256 bayt.
12. Motorlar: kütüphanede motor, encoder ya da PID sınıfı yok. Motoru analogWrite ile sür. BTS7960 gibi iki PWM pinli sürücüde biri ileri, biri geri; ikisine aynı anda sinyal verme. Güç -1..+1 ise analogWrite değeri |güç| * 255.
13. Servo: kütüphanede servo sınıfı yok, ESP32Servo kullanma. Init fonksiyonlarında ledcAttachChannel(pin, 50, 14, 7) (kanal 7, en çok 7 motor PWM pini varken motorlarla çakışmaz; iki PWM pinli sürücüyle dört motorlu şasi 8 pin kullanır, servo için yer kalmaz). Açıyı Start'tan sonra ver: 500-2500 µs darbe için ledcWrite(pin, us * 16383 / 20000). Stop fonksiyonlarında ledcWrite(pin, 0).
14. Durum LED'inin rengini kütüphane sürer. Koddan renk değiştiren fonksiyon yok; setColor, set, setBrightness yazma.
15. Robot durumu gerekirse: auto s = probot::robot::state().read(); alanları status, phase (STOPPED, AUTO_INIT, AUTO_RUN, TELEOP_INIT, TELEOP_RUN, TRANSITION), selectedMode, autoPeriodSeconds, autoStartMs, clientCount, deadlineMiss, batteryVoltage. Acil durdurma: probot::emergencyStop();
16. Batarya: ya gerilim bölücü (PROBOT_BATTERY_ADC_PIN yalnız GPIO1-10, PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K kilo-ohm) ya da I2C sensör (PROBOT_BATTERY_INA 219 ya da 226); ikisi birden yazılmaz. İkisi de yoksa gerilimi probot::setBatteryVoltage(v) ile ver.

KOD TESLİM ETMEDEN ÖNCE KONTROL ET
- setup(), loop(), robotInit() ve robotEnd() yok.
- autonomousLoop, autonomousStop, teleopLoop, teleopStop var.
- Makrolar #include satırından önce.
- Loop'larda uzun delay() yok; bekleme millis() ile.
- autonomousStop() ve teleopStop() motorları durduruyor.
- Init fonksiyonları motora güç vermiyor.
- Servo ESP32Servo değil, ledcAttachChannel ve kanal 7.
- Kendi enum/struct tipleri ilk fonksiyondan önce tanımlı.
- Pinler ve tuşlar bana sorulmuş ya da kodun başında sabit olarak işaretli.
- Yalnız istediğim parçayı yazdın; nasıl deneyeceğimi 3-5 adımda anlattın.

İsteğim:
```

## Kontrol listesi {#kontrol-listesi}

Asistanın kodunu robota yüklemeden önce kendin de bak:

- Kodda `void setup()`, `void loop()`, `void robotInit()` ya da `void robotEnd()` yok.
- `autonomousLoop`, `autonomousStop`, `teleopLoop`, `teleopStop` dördü de var.
- `#define PROBOT_WIFI_...` satırları `#include <probot.h>` satırının üstünde.
- `teleopLoop()` ve `autonomousLoop()` içinde uzun `delay()` yok.
- `autonomousStop()` ve `teleopStop()` motorları durduruyor.
- `autonomousInit()` ve `teleopInit()` motora güç vermiyor.
- Pin numaraları senin bağlantılarınla aynı.

Derleme hatası alırsan ya da robot beklediğin gibi davranmazsa: [Hatayı adım adım daralt](hatayi-daralt.md). Hata yazısında `[PB-E106]` gibi bir kod varsa: [Hata kodları](sorunlar.md#hata-kodlari). Bütün fonksiyonların listesi: [Fonksiyon ve durum listesi](fonksiyon-listesi.md).
