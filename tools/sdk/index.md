# Probot SDK

Probot SDK, Probot kitinin ana kartı olan ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartı için robot programlama kütüphanesidir. C++ arayüzü WPILib 2027 ile uyumludur: sınıf ve fonksiyon adları büyük ölçüde aynıdır.

Kök ad alanı `wpi::` (WPILib 2026'da `frc::`) yerine `prosdk::`, başlıkların kökü `<wpi/...>` yerine `<prosdk/...>` olur: [Ad alanı ve başlık dosyaları](wpilib-farklari.md#ad-alani). Arduino makrolarıyla çakışan birkaç ad da değişir, ör. `Alert::Level::HIGH` yerine `kHigh`: [Arduino makrolarıyla çakışan adlar](wpilib-farklari.md#makro-adlari).

Kütüphanenin Arduino IDE'deki adı `prosdk`. Probot Core'un üstünde çalışır: WiFi ağını, tarayıcıdaki Driver Station'ı ve maç akışını Probot Core yönetir, robot sınıfını ve donanım sınıflarını prosdk verir.

Kaynak kod: [github.com/probot-studio/probot-sdk](https://github.com/probot-studio/probot-sdk). Örnek sketch'ler deponun [`examples` klasöründe](https://github.com/probot-studio/probot-sdk/tree/dev/examples).

## Durum {#durum}

| | |
|---|---|
| Sürüm | `2027.0.0-alpha.1` (alfa, henüz yayınlanmadı) |
| Temel aldığı WPILib | WPILib 2027, allwpilib `b68effca` |
| Gereken Probot Core | Probot Core 0.5.0 ya da daha yeni: [Kütüphaneyi kur](kur.md#kutuphane). |
| Kart | Pulse, şimdilik Probot kitinin ana kartı (ESP32-S3-WROOM-1-N4R2 modülü: 4 MB flash, 2 MB dört hatlı (quad) PSRAM, USB-C). Arduino IDE ayarları: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). Başka bir ESP32-S3 kartında bus pinlerini robot sınıfının ilk üyesinde taşırsın; sekiz hatlı (octal) PSRAM'li modüllerde motor pinleri de değişir: [Başka bir ESP32-S3 kartı kullan](kur.md#baska-kart). Düz ESP32 ve diğer çipler desteklenmez. |
| Doğrulananlar | Bilgisayarda birim testleri (WPILib'in kendi testleri ve prosdk testleri), 79 örneğin hepsi Pulse'un kart ayarlarıyla derleniyor, ESP32-S3 öykünücüsünde (QEMU) çalışma testi: matematik, iş parçacıkları, kalıcı depolama, komut zamanlayıcı ve `TimedRobot`'un mod geçişleri. |
| Doğrulanmayanlar | Gerçek kartta hiçbir şey denenmedi, Pulse'ta da: pinler ve çevre birimleri, Driver Station bağlantısı uçtan uca, döngü zamanlaması, sürücüler. Bu sayfalardaki donanım davranışı (pin, motor, sensör, süre) kaynak koddan yazıldı. |

!!! warning "Dikkat"
    Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Robotu ilk kez çalıştırırken tekerlekleri yerden kaldır ve Driver Station'da **Emergency Stop**'a (<kbd>Space</kbd>) basmaya hazır ol. Acil durdurmadan sonra robot kart yeniden başlatılana kadar çalışmaz: [Acil durdurmadan sonra](sorunlar.md#acil-durdurma).

## Kimin için

- WPILib ile FRC robotu programlamış, aynı C++ arayüzünü Probot kitinde kullanmak isteyen takımlar.
- Komut tabanlı (command-based) programlama, PID, profil, odometri ve durum uzayı denetimi gibi WPILib araçlarını Probot robotunda kullanmak isteyenler.
- Robotun sensör verisini `.wpilog` dosyasına kaydedip AdvantageScope ile incelemek isteyenler.

Robotu ilk kez programlıyorsan ve WPILib bilmiyorsan Probot Core ile başla: [Probot Core](../core/index.md). Probot Core'da her mod için init, loop ve stop fonksiyonlarını yazarsın; daha az kavram ister.

## Neyi yapar, neyi yapmaz

| prosdk yapar | prosdk yapmaz |
|---|---|
| WPILib'in `TimedRobot`, `TimesliceRobot` ve `OpModeRobot` sınıflarını Probot Core'un döngüsünde çalıştırır: [Robot sınıfını seç](robot-sinifini-sec.md). | `RobotBase`'ten doğrudan türeyen bir sınıfı çalıştırmaz: [Robot sınıfını seç](robot-sinifini-sec.md#sinif). |
| Pin sınıflarını (PWM, encoder, analog giriş, LED şerit, I2C, seri port, SPI ve harici alıcı-vericiyle CAN) ESP32-S3'ün GPIO'larına bağlar: [Pinleri ve donanımı kullan](pinleri-kullan.md). | roboRIO'daki PWM 0-9, DIO 0-9 ve analog 0-3 numaralarını kullanmaz. Kanal numarası GPIO numarasıdır: [Pin sınıfına GPIO numarasını ver](pinleri-kullan.md#kanal). |
| BTS7960 gibi motor sürücülerini, PWM ile sürülen FRC motor sürücülerini (`PWMSparkMax`, `PWMTalonSRX` gibi), servoları, MPU-6050 IMU'yu ve Boardoza sensör ve modül kartlarını sürer: [Motor sürücülerini ve sensörleri kullan](surucu-kullan.md). | CAN ile sürülen FRC cihazlarını (Talon FX, Spark MAX gibi), kamerayı, pnömatiği, güç dağıtım panosunu (PDP/PDH), Romi ve XRP'yi desteklemez: [Gelmeyenler](wpilib-farklari.md#gelmeyenler). |
| Kumandayı WPILib'in `Gamepad` düzenine çevirir. Driver Station'ın **Dashboard** sekmesindeki **Maç Bilgisi** kartına yazılan ittifak, istasyon, maç ve oyun bilgisini `prosdk::MatchState` ile okur: [Kumandayı ve Driver Station'ı kullan](kumandayi-oku.md). | Kumandayı titretmez (rumble), kumanda ışığını ve dokunmatik yüzeyi kullanmaz. Probot Driver Station'da bunlar yok: [Probot Driver Station'da olmayanlar](kumandayi-oku.md#olmayanlar). |
| Telemetriyi ve tunable'ları Driver Station'ın **Veri** sekmesinde gösterir: [Telemetri ve ayar değerlerini göster](veri-goster.md). | NetworkTables sunucusu açmaz. AdvantageScope ve Elastic robota canlı bağlanamaz: [Gelmeyenler](wpilib-farklari.md#gelmeyenler). |
| `DataLogManager` ile `.wpilog` kaydı tutar; kayıtlar Driver Station'dan indirilir: [Kayıt tut ve dosyaları indir](kayit-tut.md). | Masaüstü araçlarını (Glass, SysId uygulaması, DataLogTool) içermez. SysId kayıtları masaüstü SysId aracında açılır: [Gelmeyenler](wpilib-farklari.md#gelmeyenler). |
| Komut tabanlı programlamayı `prosdk::cmd` ile verir: [Komut tabanlı kod yaz](komut-tabanli-yaz.md). | Java ve Python desteklemez, yalnız C++. Java'ya özgü commandsv3 de yok: [Gelmeyenler](wpilib-farklari.md#gelmeyenler). |

## Nasıl çalışır {#nasil-calisir}

Robot açılınca Probot Core WiFi ağını yayınlar ve Driver Station'ı sunar. Ardından prosdk robot sınıfının bir nesnesini kurar (constructor çalışır). Robotun döngüsü Probot Core'un döngüsünün içinde döner.

Sketch'te `setup()`, `loop()` ve `main()` yazılmaz; `setup()` ve `loop()` Probot Core'dadır. Sketch bir WPILib robot sınıfı tanımlar ve en sonda `PROSDK_ROBOT_MAIN(Robot)` satırıyla biter.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/framework/TimedRobot.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  void TeleopPeriodic() override { /* sürüş kodu */ }
};

PROSDK_ROBOT_MAIN(Robot)
```

Mod seçimi, **Init**, **Start**, **Stop** ve **Emergency Stop** Driver Station'ın **Dashboard** sekmesindeki **Match Control** bölümündedir. **Init**'e basınca robot hâlâ devre dışıdır (disabled); WPILib'in `AutonomousInit()` ya da `TeleopInit()` fonksiyonu **Start**'a basınca çalışır. Ayrıntı: [Robot sınıfını seç](robot-sinifini-sec.md#modlar).

## Başla

- [prosdk'yi Arduino IDE'ye kur](kur.md): kart paketinin tam sürümü, Pulse'un kart ve bölümleme ayarları, kütüphane.
- [İlk robot kodunu yaz](ilk-robotu-yaz.md): iki motorlu bir robotu kumandayla sür, otonomda 2 saniye ileri git.
- [Hatalar ve sorun giderme](sorunlar.md): derleme hataları ve Driver Station konsolundaki mesajlar.

## Kodu yaz

- [Robot sınıfını seç](robot-sinifini-sec.md): `TimedRobot`, `TimesliceRobot`, `OpModeRobot`; modlar, döngü süresi, hata durumunda ne olur.
- [Komut tabanlı kod yaz](komut-tabanli-yaz.md): alt sistem, komut, kumanda tetikleyicileri ve Driver Station'daki komut listesi.
- [Kumandayı ve Driver Station'ı kullan](kumandayi-oku.md): kumanda düzeni, maç bilgisi, konsol, **Robot Ekranı**.
- [Telemetri ve ayar değerlerini göster](veri-goster.md): **Veri** sekmesi, widget'lar, Preferences ve kalıcı ayarlar.

## Donanım

- [Pinleri ve donanımı kullan](pinleri-kullan.md): Pulse'un konnektörlerindeki GPIO'lar, varsayılan bus pinleri, kapasiteler, çıkış güvenliği.
- [Motor sürücülerini ve sensörleri kullan](surucu-kullan.md): PWM motor sürücüleri, H köprüleri, servo, ProHub, Pinpoint, MPU-6050, Boardoza sensör ve modül kartları.
- [Kayıt tut ve dosyaları indir](kayit-tut.md): `.wpilog` kaydı, LittleFS ve SD kart, **Logs** sekmesindeki **Dosyalar** kartı.

## Başvuru

- [WPILib'den farklar](wpilib-farklari.md): ad değişiklikleri, gelmeyen parçalar, bellek sınırları.
- [Örnek listesi](ornek-listesi.md): 79 örneğin her biri ne yapar.

## Sözlük

| Terim | Anlamı |
|---|---|
| prosdk | Probot SDK'nın kütüphane adı ve C++ ad alanı (`prosdk::`). |
| Probot Core | WiFi'yi, Driver Station'ı ve maç akışını yöneten alt kütüphane. Arduino IDE'deki adı `probot`. |
| WPILib | FRC robotları için yazılmış açık kaynak kütüphane. prosdk onun 2027 sürümünün C++ kısmını taşır. |
| Robot sınıfı | `TimedRobot`, `TimesliceRobot` ya da `OpModeRobot`'tan türeyen, robotun bütün kodunu taşıyan sınıf. |
| Disabled | Robotun çıkışlarının kapalı olduğu hâl. Robot açıldığında, **Init**'ten sonra **Start**'a kadar, **Stop**'tan sonra ve Driver Station bağlantısı kopunca robot disabled'dır. Probot Core'un varsayılan ayarıyla Driver Station'dan 5 saniye hiçbir şey gelmezse Probot Core, Driver Station'ı robottan ayrılmış sayar; prosdk robotu disabled görür ve çıkışları kapatır. 10 saniyede Probot Core çalışan modu da durdurur (**Dashboard** sekmesindeki **Telemetry** kartında `PB-E303`); yeniden **Init** ve **Start** gerekir. |
| Enabled | Robotun motorlara sinyal gönderebildiği hâl. Yalnız **Start**'tan sonra, Driver Station bağlıyken, **Emergency Stop**'a basılmamışken ve döngü takılmamışken: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi). |
| Utility | Kurulum ve bakım kodu için üçüncü mod (WPILib 2026'daki Test modu). Her robot sınıfında çalışır. `TimedRobot` ve `TimesliceRobot`'ta Driver Station'ın **Match Control** bölümünde **Autonomous** ve **Teleoperated**'ın yanına **Utility** seçeneği kendiliğinden eklenir. `OpModeRobot`'ta kod bir utility OpMode'u ekleyip `PublishOpModes()`'u çağırınca görünür. |
| OpMode | `OpModeRobot`'ta Driver Station'daki listeden seçilen tek bir program (ör. bir otonom rutin). |
| Kanal | Pin sınıflarına verilen numara. prosdk'de kanal = GPIO numarası. |
| Telemetri | Robotun Driver Station'a gönderdiği, yalnız okunan değerler. **Veri** sekmesinde `/Telemetry` altında görünür. |
| Tunable | Driver Station'dan değiştirilebilen değer. **Veri** sekmesinde `/Tunables` altında görünür. |
| Çıkış kapısı | Robot disabled iken (bağlantı koptuktan yaklaşık 5 saniye sonra dahil), **Emergency Stop**'ta, döngü takılınca ya da program durunca PWM sinyallerini ve motor sürücü görev oranını kesen koruma: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi). |
| Durma (halt) | Robot kodu bir hata fırlatınca ya da robot programı başlatılamayınca (ör. döngüsü olmayan sınıf, 1-1000 ms dışında döngü süresi) programın durması. Driver Station'dan gelen her **Init** ve **Start** durdurulur. Çıkış kapısından geçen çıkışlar (PWM, motor sürücü görev oranı) kart yeniden başlatılana kadar kapalı kalır; `DigitalOutput` seviyesini korur: [Kod hata fırlatırsa](robot-sinifini-sec.md#halt). |
