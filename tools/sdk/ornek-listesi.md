# Örnek listesi

prosdk 79 hazır örnekle gelir: WPILib'in C++ örneklerinden, snippet'lerinden ve şablonlarından taşınan 63 sketch, prosdk'ye özgü 7 örnek ve Boardoza kartları için 9 örnek. Bu sayfa her örneğin ne yaptığını tek satırda anlatır.

Örneklerin 79'u da derleme testinden geçiyor. Hiçbiri gerçek bir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da çalıştırılmadı: tablolardaki pin, motor ve sensör davranışı kaynak koddan okundu.

Örnekleri GitHub'da da okuyabilirsin: [probot-sdk deposundaki `examples` klasörü](https://github.com/probot-studio/probot-sdk/tree/dev/examples).

## Başlamadan önce

- prosdk kurulu: [Kütüphaneyi kur](kur.md#kutuphane).
- Kart ve bölümleme seçili: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme).

## Bir örneği aç {#ornegi-ac}

Örnekler salt okunurdur. Değiştirmeden önce kendi klasörüne kaydet.

1. Arduino IDE'de **File** > **Examples**'ı seç.
2. **prosdk** alt menüsünde örneğin adını seç, ör. **GettingStarted**. Örnek yeni bir pencerede açılır.
3. **File** > **Save As**'i seç ve sketch'i kendi klasörüne kaydet.
4. `.ino` sekmesinde `PROBOT_WIFI_AP_PASSWORD` satırındaki `probot-robot` şifresini en az 8 karakterlik kendi şifrenle değiştir. HalSmoke'ta bu şifre `halsmoke1`'dir.
5. Şifre satırının üstüne `#define PROBOT_WIFI_AP_SSID "Probot"` satırını ekle, `Probot` yerine robotunun adını yaz. Örnekler ağ adı tanımlamaz; bu satır yoksa Probot Core ağı `Probot-XXXXXX` biçiminde bir adla açar ve derlemede `PROBOT_WIFI_AP_SSID not defined` uyarısı çıkabilir: ["PROBOT_WIFI_AP_SSID not defined"](sorunlar.md#ssid-yok).
6. Koddaki pin numaralarını kendi bağlantına göre değiştir. Her örnek kullandığı pinleri `.ino` dosyasının başındaki yorumda yazar. Çok sekmeli örneklerde pin numaraları `Constants.hpp` ya da alt sistem sekmesindedir (ör. `Drivetrain.hpp`).
7. Araç çubuğunda **Verify**'a bas.

Sonuç: **Output** panelinde "Sketch uses" ile başlayan satır görünür. Kendi kopyan ayrı klasörde durur, örnek değişmez.

Örneği karta yüklemek ve Driver Station'dan çalıştırmak için: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).

Örneklerin hepsi WiFi kanalını `PROBOT_WIFI_AP_CHANNEL 6` ile seçer. Kanal 6 geçerlidir; bu kılavuzdaki sayfalar kanal 1 kullanır. İstersen 1-13 arasında başka bir kanal yaz.

## Örneklerin pinleri {#pinler}

Kanal numarası GPIO numarasıdır. Örnekler Probot'un ana kartı Pulse'un konnektörlerindeki pinleri kullanır: PWM motorlar GPIO 38, 37, 36 ve 35'te (J6), encoder'lar 39/40 ve 41/42'de (J7). Dört encoder'lı örnekler (MecanumBot, MecanumDrivePoseEstimator) 47/48 (J8) ve 15/16'yı (J5) da kullanır. I2C port 0 J3'tedir (SDA 1, SCL 2). Planın tamamı: [Örneklerin pin planından başla](pinleri-kullan.md#ornek-pin-plani).

Örnekler GPIO 0 ve 45'i kullanmaz. SwerveBot ve SwerveDrivePoseEstimator 24 sinyal ister ve Pulse'un konnektörlerine sığmaz: konnektörde olmayan pinler de kullanır, bir encoder girişi de açılış (strapping) pini GPIO 46'dadır.

Bu örneklerdeki motorlar PWM sinyaliyle sürülen motor sürücüleridir (`PWMSparkMax` ya da başka bir PWM ESC); her motor tek pin kullanır. Bu kılavuzun sayfaları ise BTS7960 sürücüsü kullanır: sol BTS7960 J6'da GPIO 38, 37, 36; sağ BTS7960 GPIO 35 (J6), 47 ve 48 (J8). Bağlantı: [Rehberin motor ve encoder pinleri](pinleri-kullan.md#rehber-pinleri).

Örnekler rehberin BTS7960'lı robotunu olduğu gibi sürmez: PWM motor pinleri (38, 37, 36, 35) BTS7960 bağlantısının pinleridir. Encoder pinleri 39/40 ve 41/42 rehberinkilerle aynıdır; 47/48'deki encoder'ı ise sağ BTS7960 kullandığı için taşı. Bir örneği BTS7960'lı robotta denemek için motor sınıflarını `prosdk::BTS7960` ile değiştir ve aynı dosyadaki `#include <prosdk/drivers/motor/PWMSparkMax.hpp>` satırını `#include <prosdk/drivers/motor/BTS7960.hpp>` yap: `prosdk::BTS7960 left{38, 37, 36};` ve `prosdk::BTS7960 right{35, 47, 48};`. Her tarafı iki motorlu örneklerde (ör. DifferentialDriveBot) taraf başına tek BTS7960 kalır: ikinci motorun satırını ve `AddFollower` satırlarını sil. Ayrıntı: [BTS7960 (IBT-2)](surucu-kullan.md#bts7960).

Boardoza sensör örnekleri I2C port 1'i J5'e koyar (SDA 17, SCL 16); BoardozaClimate'teki BME688 ise J3'teki I2C port 0'dadır (SDA 1, SCL 2). SD kart, LoRa ve ekran örnekleri J5'te SPI bus 0'ı varsayılan pinleriyle kullanır (SCK 17, MOSI 15, MISO 16, CS 7). I2C port 1'i J5'te kullanırken SPI bus 0'ı kullanamazsın.

LoRa, ekran ve döner encoder örnekleri J6 ve J7'deki motor ve encoder pinlerini de kullanır (GPIO 35-42). BoardozaLoadCell, HX711'i sol motorun pinlerine bağlar (DAT 38, CLK 37). BoardozaRotaryArgb LED'leri için J7'de SPI bus 1'i açar (GPIO 39, 40). Bu kartları sürüş motorlarıyla birlikte kullanacaksan pinlerini taşı. Her örneğin bağlantısı kendi `.ino` başlığındadır.

Ana kart Pulse; kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Sekiz hatlı (octal) PSRAM'li başka bir ESP32-S3 kartında GPIO 35-37'deki motor pinlerini taşı: [Başka bir ESP32-S3 kartı kullan](kur.md#baska-kart).

## Şablonlar {#sablonlar}

Yeni bir robota bunlardan biriyle başla. Şablonlar donanım kullanmaz.

| Örnek | Ne yapar |
|---|---|
| TemplateTimed | Her mod fonksiyonunu içeren `TimedRobot` (20 ms döngü). **Veri** sekmesinde `/Tunables/Auto Modes` otonom seçicisi var. Önerilen başlangıç noktası. |
| TemplateTimedSkeleton | Bütün mod fonksiyonları boş bir `TimedRobot`. |
| TemplateTimeslice | `TimesliceRobot`: her 10 ms'lik periyotta robot fonksiyonlarına 5 ms, ardından 2'şer ms'lik iki denetleyici dilimi. `/Tunables/Auto Modes` otonom seçicisi var. |
| TemplateTimesliceSkeleton | Aynı dilimlerle boş bir `TimesliceRobot`. |
| TemplateOpMode | Bir teleop ("My Teleop") ve bir otonom ("My Auto") programı olan `OpModeRobot`. Programlar `PublishOpModes()`'tan sonra Driver Station'daki listede görünür. |
| TemplateCommandV2 | Komut tabanlı robot: `RobotContainer`, örnek alt sistem, örnek komut ve otonom komutu. Bir örnek komut kumanda 0'ın sağ yüz düğmesine (Xbox'ta **B**), diğeri alt sistemin bir koşuluna bağlı. |
| TemplateCommandV2Skeleton | Komut zamanlayıcısını (`CommandScheduler`) çalıştıran `TimedRobot` ve boş bir `RobotContainer`. |
| TemplateCommandItems | WPILib'in sekiz komut sınıfı şablonu, her biri ayrı bir `.hpp` ve `.cpp` sekme çiftinde: boş sınıf, `Command`, `InstantCommand`, `ParallelCommandGroup`, `ParallelDeadlineGroup`, `ParallelRaceGroup`, `SequentialCommandGroup`, `Subsystem`. Gereken iki sekmeyi (`.hpp` ve `.cpp`) kendi sketch'ine kopyala ve `ReplaceMe...` adını değiştir. |

!!! note "Not"
    TemplateTimed ve TemplateTimeslice seçilen otonomu WPILib'deki gibi `prosdk::util::print` ile stdout'a yazar. Robotta stdout USB seri porttur (Pulse'un USB-C portu, Arduino IDE'de **Serial Monitor**), Driver Station'daki **Robot Console** değildir. Konsola yazmak için: [Konsola yaz](kumandayi-oku.md#konsol).

## Robot sınıfı örnekleri {#robot-siniflari}

Üç robot sınıfının örnekleri. TimedRobot için iki örnek var: GettingStarted ve TimedRobotDifferential. Sınıf seçimi: [Robot sınıfını seç](robot-sinifini-sec.md#sinif).

| Örnek | Ne yapar |
|---|---|
| GettingStarted | İki motorlu robot: teleop'ta kumanda 0 ile arcade sürüş, otonomda 2 saniye yarım hızla ileri. Motorlar GPIO 38 (sol) ve 37'de (sağ), J6. |
| TimedRobotDifferential | İki motor, tekerlek encoder'ları ve odometri ile `TimedRobot`. Alt yüz düğmesi (Xbox'ta **A**) basılıyken robot yönünü PID ile korur; kazançlar `/Tunables/Heading PID` altında değişir. Otonomda 2 saniye ileri gider. |
| OpModeRobotExample | `OpModeRobot` ile dört program: iki otonom ("Drive Forward", "Turn In Place"), bir teleop ("Arcade Drive") ve bir utility ("Zero Encoder"). |
| TimesliceRobotExample | `TimesliceRobot`: robot döngüsü 20 ms. Kol denetleyicisi ve ikinci bir dilim her 10 ms'de 2'şer ms çalışır. Probot Core'un döngüsü 2 ms'de bir döner. |

## Komut tabanlı ve SysId {#komut-tabanli}

Komut tabanlı programlama: [Komut tabanlı kod yaz](komut-tabanli-yaz.md).

| Örnek | Ne yapar |
|---|---|
| CommandBasedRobot | `prosdk::cmd` ile sürüş alt sistemi ve Xbox kumandası. **A** robotu PID komutuyla 1 m ileri götürür; kazançlar `/Tunables/Drive Distance PID` altında. **LB** basılıyken **A**, **B**, **X**, **Y** SysId testlerini çalıştırır. Otonom `/Tunables/Auto` seçicisinden seçilir. |
| SysIdRoutine | Sürüş ve atıcı (shooter) için SysId karakterizasyon komutları. **RB** ile yüz düğmeleri sürüşün, **LB** ile yüz düğmeleri atıcının testlerini çalıştırır. |
| DriveDistanceOffboard | Komut tabanlı sürüş: trapez profilin ara hedeflerini "akıllı" bir motor sürücüsüne gönderir. Bu sürücü sınıfı boş bir yer tutucudur; örnek motor sürmez, yalnız yapıyı gösterir. |

CommandBasedRobot ve SysIdRoutine SysId verisini `.wpilog` kaydına yazar. prosdk LittleFS'i ilk `DataLogManager` çağrısında kendisi bağlar; kayıt `/littlefs/logs` klasörüne gider.

SysIdRoutine kaydı `Robot` kurucusunda `DataLogManager::Start()` ile başlatır. **logs** klasörü her açılışta Driver Station'ın **Logs** sekmesinde görünür. CommandBasedRobot `Start()`'ı çağırmaz: kaydı ilk SysId testi başlatır, klasör de o testten sonra görünür. Ayrıntı: [Kaydı LittleFS'e yaz](kayit-tut.md#littlefs).

## Sürüş {#surus}

| Örnek | Ne yapar |
|---|---|
| ArcadeDriveGamepad | Kumanda 0 ile arcade sürüş: sol çubuk Y ileri ve geri, sağ çubuk X dönüş. |
| TankDriveGamepad | Kumanda 0 ile tank sürüş: sol çubuk sol tarafı, sağ çubuk sağ tarafı sürer. |
| DifferentialDriveBot | Her tarafı iki motorlu robot: diferansiyel kinematik, tekerlek hızı PID'i ve ileri besleme (feedforward), odometri. İki encoder ve MPU-6050 kullanır. |
| MecanumBot | `MecanumDriveKinematics` ile dört tekerlekli robot: kinematik, tekerlek hızı PID'i, odometri. Dört encoder, ESP32-S3'ün dört sayaç biriminin hepsini kullanır. |
| MecanumDrive | `MecanumDrive` sınıfı ve MPU-6050 ile sahaya göre (field-oriented) sürüş. Kumanda 0'ın sol çubuğu (X ve Y eksenleri) ileri, geri ve yana sürer; sağ çubuğun X ekseni (Z) döndürür. |
| SwerveBot | Swerve kinematiği, modül PID'i ve odometri. 8 encoder ister; ESP32-S3'te 4 sayaç birimi olduğu için kartta beşinci encoder'da program durur. Kartta dönüş için mutlak encoder (`DutyCycleEncoder`, `AnalogEncoder`) kullan. |
| Gyro | MPU-6050 ile düz sürüş: kumanda 0'ın Y ekseni (sol çubuk Y) ileri ve geri sürer, jiroskop yönü tutar. |

Kartta yerleşik IMU yok. WPILib'in `OnboardIMU`'su kullanılan yerlerde örnekler kitin IMU'sunu, I2C port 0'daki (J3: SDA 1, SCL 2) `prosdk::MPU6050`'yi kullanır: [MPU-6050'yi oku](surucu-kullan.md#mpu6050).

## Mekanizma ve denetim {#mekanizma}

| Örnek | Ne yapar |
|---|---|
| ElevatorProfiledPID | Asansör: `ProfiledPIDController` ve `ElevatorFeedforward`. Kumanda 1'in 2. düğmesi (Xbox'ta **X**) 5 m'ye, 3. düğmesi (Xbox'ta **Y**) 0 m'ye götürür. |
| ElevatorTrapezoidProfile | Asansör: `TrapezoidProfile` ara hedeflerini akıllı motor sürücüsü yer tutucusuna gönderir. Motor sürmez. Düğmeler ElevatorProfiledPID'deki gibi. |
| ElevatorExponentialProfile | Aynı yapı `ExponentialProfile` ile. Motor sürmez. Düğmeler ElevatorProfiledPID'deki gibi. |
| ElevatorSimulation | Asansör: `ProfiledPIDController`, `ElevatorFeedforward` ve Mechanism2d görünümü. Kumanda 0'ın tetiği (Xbox'ta **B**) basılıyken 0,75 m'ye çıkar, bırakınca 0'a iner. |
| ElevatorExponentialSimulation | Asansör: `ExponentialProfile`, PID, `ElevatorFeedforward` ve Mechanism2d. Tetik (Xbox'ta **B**) basılıyken üst hedefe, bırakınca alt hedefe gider. |
| ArmSimulation | Tek eklemli kol: PID ve Mechanism2d. Hedef açı ve kP Preferences'tan okunur (`/Preferences` altında `ArmPosition`, `ArmP`). Değerler teleop başlarken okunur; değiştirince teleop'u yeniden başlat. Tetik (Xbox'ta **B**) basılıyken kol hedefe gider. |
| Mechanism2d | Bilekli bir asansörü Mechanism2d olarak `/Telemetry/Mech2d` altına yazar; **Veri** sekmesi onu Mechanism2d widget'ı olarak çizer. Kumanda 0'ın eksen 0'ı (sol çubuk X) asansörü, eksen 1'i (sol çubuk Y) bileği sürer. Bilek açısı GPIO 1'deki (J3) potansiyometreden. |

Bu örnekler kumandayı WPILib'in `Joystick` sınıfıyla okur. Probot Driver Station'da tetik (`GetTrigger()`, ham düğme 1) sağ yüz düğmesidir: Xbox'ta **B**, PlayStation'da **Circle**.

Ham düğme 2 sol yüz düğmesi (**X** / **Square**), ham düğme 3 üst yüz düğmesidir (**Y** / **Triangle**). Düğme düzeni: [Düğmeleri ve D-pad'i oku](kumandayi-oku.md#dugmeler).

Adında "Simulation" geçen örneklerde, DifferentialDrivePoseEstimator'da ve SnippetFlywheelBangBangController'da fizik modeli (`SimulationPeriodic`) kartta çalışmaz. Kartta gerçek motor ve encoder kullanılır. Sketch'i bilgisayarda simüle etmek desteklenmez.

## Durum uzayı ve konum kestirimi {#durum-uzayi}

| Örnek | Ne yapar |
|---|---|
| StateSpaceArm | LQR ve Kalman filtresiyle (`LinearSystemLoop`) kol konum döngüsü, trapez profil. **RB** basılıyken kol 90°'ye kalkar, bırakınca iner. |
| StateSpaceElevator | Aynı yapı asansör için. **RB** basılıyken asansör kalkar, bırakınca iner. |
| StateSpaceFlywheel | Fizik modelinden kurulan volan (flywheel) hız döngüsü. **RB** basılıyken 500 rpm'e çıkar. |
| StateSpaceFlywheelSysId | Aynı volan döngüsü, SysId ile ölçülen kV ve kA değerlerinden kurulur. |
| DifferentialDrivePoseEstimator | Diferansiyel sürüş odometrisi, 2024 sahasındaki 1 numaralı AprilTag'e bakan simüle bir kameranın ölçümleriyle birleştirilir. Simüle kamera, kartta çalışmayan fizik modelinden okur: ölçüm hep aynı başlangıç konumunu verir ve kestirimi oraya çeker. Örnek yalnız yapıyı gösterir; gerçek robotta ölçümü kendi görüntü sisteminden al. **Veri** sekmesinde iki Field2d saha widget'ı var: `Field` fizik modelinin konumunu (kartta hareket etmez), `Approximation` kestirimi gösterir. |
| MecanumDrivePoseEstimator | Dört tekerlekli odometri, gürültülü bir global ölçümle birleştirilir. `ExampleGlobalMeasurementSensor` görüntü sisteminin yerini tutar. |
| SwerveDrivePoseEstimator | Aynısı swerve için. SwerveBot gibi 8 encoder ister; yazıldığı hâliyle kartta çalışmaz. |
| SimpleDifferentialDriveSimulation | Diferansiyel sürüş, otonomda LTV unicycle denetleyicisiyle bir yörünge izler. Yörünge tek noktalık bir yer tutucudur; yerine kendi yörüngeni koy. Konum **Veri** sekmesinde Field2d saha widget'ında görünür. |
| AprilTagFieldPose | Varsayılan sahayı `prosdk::fields` ile yükler, bir AprilTag algılamasından robotun saha konumunu hesaplar. Sonuç `/Telemetry/Vision` altında. Kitte kamera yok; algılama koda gömülü sabit veridir. |

## Sensörler ve Driver Station {#sensorler}

| Örnek | Ne yapar |
|---|---|
| Encoder | GPIO 39/40'taki (J7) quadrature encoder'ın mesafe ve hızını teleop'ta `/Telemetry` altında gösterir. |
| DutyCycleEncoder | GPIO 17'deki (J5) mutlak duty-cycle encoder: aralık, sıfır kaydırma ve sarma (wrap). |
| DriverStationDisplayLines | `OpModeRobot`: "Default Teleop" programı `DriverStationDisplay` satır modunda çalışma süresini ve döngü sayısını (`Loop Count`) yazar. |
| DriverStationDisplayAnsi | Aynı program ham ANSI ekranla. Saniye sayacı yerinde güncellenir, renkler görünmez. |
| DSGamepadChooser | İki otonom program ("Score Auto", "Balance Auto"). Robot disabled iken programın seçeneklerini kumanda 0'ın D-pad'iyle seçersin; seçenekler **Robot Ekranı**'nda görünür. |

`DriverStationDisplay` metni Driver Station'da **Dashboard** sekmesindeki **Robot Ekranı** kartında görünür, **Veri** sekmesinde de `/Telemetry/DriverStationDisplay` altında. Bu üç örneğin ekranı varsayılan `PROBOT_DASH_MAX_VALUE` değerine (1024 bayt) sığar. Ayrıntı: [Robot Ekranı'na yaz](kumandayi-oku.md#metin-ekrani).

## Sürücüler ve HAL {#suruculer}

| Örnek | Ne yapar |
|---|---|
| DriversShowcase | prosdk sürücülerinden bir seçki: Spark, servo, BTS7960, VNH5019 ve ProHub (PCA9685, ProHub motoru ve servosu, MPU-6050, goBILDA Pinpoint, encoder akışı). Kumanda 0 hepsini birden sürer; sensörler `/Telemetry` altında. |
| HalSmoke | Robot programı değil, kartın donanım denetimi: WPILib HAL C arayüzüyle dijital giriş ve çıkış, PWM, encoder, analog giriş, LED şerit ve Notifier'ı dener. Okuduğu değerleri USB seri porta yazar. |

DriversShowcase'te Spark GPIO 38'de, servo 37'de (J6); BTS7960 J7'deki GPIO 39/40/41'de, VNH5019 GPIO 16/17 (J5) ve 47/48'de (J8). ProHub kartı J3'teki I2C port 0'a (GPIO 1/2), encoder verisi J4'teki GPIO 10/11'e bağlanır. Bu bağlantı rehberin encoder pinlerini (39-41) ve sağ BTS7960'ın 47/48'ini kullanır; örneği rehberin robotunda denerken pinleri taşı.

Probot Core'un INA batarya sensörünü (`PROBOT_BATTERY_INA`) açtıysan sensör J3'te ProHub ile aynı hattadır ve varsayılan adresi DriversShowcase'teki PCA9685'inkiyle (0x40) aynıdır. INA'ya 0x40 ve 0x41 dışında bir adres ver: [ProHub kartını kullan](surucu-kullan.md#prohub).

Sürücülerin kullanımı: [Motor sürücülerini ve sensörleri kullan](surucu-kullan.md).

## Boardoza kartları {#boardoza}

Her örnek bir `TimedRobot`'tur ve okumaları `/Telemetry` altında gösterir. Kartların bağlantısı ve besleme kuralı `.ino` başlığındadır.

!!! warning "Dikkat"
    ESP32-S3 pinleri 5 V'a dayanıklı değil. Kartı `.ino` başlığında yazan gerilimle besle; çoğu kart 3,3 V ister.

| Örnek | Ne yapar |
|---|---|
| BoardozaClimate | Sıcaklık, nem, basınç ve gaz kartları: LM75ADP, HIH8131, TH09C, MS5611, HP303B, BME688. Kartlardan istediğin kadarını kullan. |
| BoardozaThermalCamera | MLX90640 termal kamera: 32x24 kare, ortam, en düşük ve en yüksek sıcaklık. 16x12'lik MLX90641 kartı için koddaki `MLX90640`'ı `MLX90641` yap; adres ve fonksiyonlar aynıdır. |
| BoardozaMultizoneToF | VL53L7CX uçuş süresi (ToF) sensörü: 8x8 bölgenin mesafesi, saniyede 15 kare, en yakın geçerli mesafe. |
| BoardozaLoadCell | NAU7802 ve HX711 yük hücresi kartları: dara, ölçek ve kütle. |
| BoardozaGnss | SAM-M8Q ya da SAM-M10Q (I2C) ve GP-02 (UART) GNSS kartları: konum, hız, yön ve uydu sayısı. |
| BoardozaSdLog | MicroSD kartına `.wpilog` kaydı (`/sd/logs`). Kart yoksa ya da okunamazsa kayıt, prosdk'nin kendisi bağladığı LittleFS'e (`/littlefs/logs`) gider. Driver Station, SD kartın takılı ve okunabilir olup olmadığını `/Telemetry` altında (`SD card/Mounted`) gösterir. |
| BoardozaRotaryArgb | Döner encoder ve 14 LED'lik halka: düğme döndükçe yanan LED halkada döner, basınca renk değişir. |
| BoardozaLoRa | E22-900M22S LoRa kartıyla iki robot kısa metin mesajı alıp verir. Varsayılan 868,1 MHz ve 14 dBm; frekansı ya da gücü değiştirmeden önce yerel kuralları denetle. |
| BoardozaEveDisplay | FT810 ya da FT800 ekran kartında durum ekranı: pil gerilimi, robot durumu ve basıldıkça sayan bir düğme. |

Kartların listesi ve sürücüleri: [Boardoza kartlarını kullan](surucu-kullan.md#boardoza). SD kart kaydı: [Kaydı SD karta yaz](kayit-tut.md#sd-kart).

## Snippet'ler {#snippetler}

Snippet'ler tek bir sınıfı ya da tekniği gösteren kısa örneklerdir. Adları `Snippet` ile başlar.

| Örnek | Ne yapar |
|---|---|
| SnippetEncoder | `Encoder` kullanımı: GPIO 39/40'ta 4X, GPIO 41/42'de 2X çözümlü iki encoder (J7). |
| SnippetDutyCycleEncoder | `DutyCycleEncoder` kullanımı: GPIO 17 ve 16'da (J5) iki mutlak encoder. |
| SnippetAnalogEncoder | `AnalogEncoder` kullanımı: GPIO 1 ve 2'de (J3) iki analog mutlak encoder. |
| SnippetEncoderDrive | Encoder ile robotu belirli bir mesafeye sürer. |
| SnippetEncoderHoming | Otonomda motoru yarım hızla geri sürer; GPIO 17'deki (J5) normalde açık (NO) sınır anahtarına değince durur ve encoder'ı sıfırlar. |
| SnippetLimitSwitch | Kumanda 0'ın eksen 2'siyle (sağ çubuk X) motor sürer; J5'te GPIO 17'deki üst ya da GPIO 16'daki alt sınır anahtarına (ikisi de normalde açık) değince o yönde durur. |
| SnippetDigitalInput | `DigitalInput` kullanımı: GPIO 17'den (J5) GND'ye bağlı anahtar, iç pull-up. |
| SnippetAnalogInput | `AnalogInput` kullanımı: GPIO 1 (J3), 0-3,1 V. |
| SnippetAnalogPotentiometer | `AnalogPotentiometer` kullanımı: GPIO 1 ve 2'de (J3) potansiyometre. |
| SnippetAnalogAccelerometer | `AnalogAccelerometer` kullanımı: GPIO 1 (J3). |
| SnippetADXLAccelerometers | I2C port 0'daki ADXL345 ivmeölçer. |
| SnippetAccelerometerCollision | Çarpışma algılamak için MPU-6050 ivmesinin değişimini (jerk) hesaplar; X ve Y jerk değerleri `/Telemetry` altında. |
| SnippetAccelerometerFilter | MPU-6050 ivmesine kayan ortalama filtresi; ham ve süzülmüş değer `/Telemetry` altında. |
| SnippetOnboardIMU | IMU okuma fonksiyonları, WPILib'deki `OnboardIMU` yerine MPU-6050 ile. |
| SnippetProfiledPIDFeedforward | `ProfiledPIDController` ile `SimpleMotorFeedforward`. |
| SnippetAddressableLED | GPIO 48'deki (J8) 60 LED'lik WS2812 şeritte kayan gökkuşağı. |
| SnippetDigitalCommunication | Robot durumunu dijital çıkışlarla dış bir ışık denetleyicisine (ör. Arduino) bildirir. |
| SnippetI2CCommunication | Robot durumunu I2C ile 4 adresindeki bir denetleyiciye (ör. Arduino) gönderir. |
| SnippetDutyCycleInput | GPIO 17'deki (J5) PWM sinyalinin frekansı ve doluluk oranı, `/Telemetry` altında. |
| SnippetEventLoop | `EventLoop` ve `BooleanEvent` ile top atıcı: kumanda 0'ın 2. düğmesi (Xbox'ta **X**) topu alır, tetik (Xbox'ta **B**) atıcıyı hızlandırıp atar. |
| SnippetFlywheelBangBangController | `BangBangController` ve ileri besleme ile volan hızı. Kumanda 0'ın eksen 0'ı (sol çubuk X) hızı belirler. |
| SnippetMotorControl | Kumanda 0'ın Y ekseniyle (sol çubuk Y) tek motor sürer, encoder mesafesini Driver Station'da gösterir. |
| SnippetSelectCommand | `SelectCommand` ile otonom seçimi (`/Tunables/Auto Chooser`). Seçilen komut Driver Station'da **Logs** sekmesindeki **Robot Console** kartına yazar. Donanım kullanmaz. |
| SnippetMecanumDrive | `MecanumDrive` ile kartezyen ve kutupsal sürüş, MPU-6050 ile sahaya göre. |
| SnippetDifferentialDrive | Tank, arcade ve curvature sürüş. |

SnippetEncoderHoming ve SnippetLimitSwitch'te anahtar GND'ye bağlıdır ve girişin iç pull-up'ı açıktır: açık anahtar `true`, basılı anahtar `false` okur. İki örneğin kodu buna göre yazılmıştır.

Analog örnekler GPIO 1 ve 2'yi (J3), yani I2C port 0'ın pinlerini kullanır. J3'ü I2C için (ör. MPU-6050) kullanırken analog girişi GPIO 7'ye (J5) ya da 10'a (J4) taşı: [Analog pinleri seç](pinleri-kullan.md#analog-pinler).

SnippetDigitalCommunication ve SnippetI2CCommunication ittifakı (alliance) Driver Station'ın **Maç Bilgisi** kartından okur. Kartta istasyon seçilene kadar ittifak yoktur: SnippetDigitalCommunication'ın ittifak çıkışı LOW kalır, SnippetI2CCommunication `U` gönderir. İstasyonu robot dururken seçersin: [Maç bilgisini oku](kumandayi-oku.md#mac-bilgisi).

## Taşınmayan WPILib örnekleri {#tasinmayanlar}

WPILib'in 89 C++ örneği, snippet'i ve şablonundan 18'i taşınmadı. Çoğunun sebebi, kitte karşılığı olan donanımın olmaması:

| Neden | WPILib örnekleri |
|---|---|
| Pnömatik | HatchbotTraditional, HatchbotInlined, RapidReactCommandBot ve UnitTest örnekleri, Solenoid snippet'i |
| Romi ve XRP | RomiReference, XRPReference ve Xrptimed örnekleri; Romi ve XRP için Command Robot ve Timed Robot şablonları (4) |
| Kamera | AprilTagsVision, HttpCamera, IntermediateVision ve QuickVision snippet'leri. AprilTag ile saha konumu için AprilTagFieldPose'a bak. |
| Güç dağıtım panosu | CANPDP snippet'i |
| `RobotBase`'ten doğrudan türeyen sınıf | robotbaseskeleton şablonu. Kendi `StartCompetition()` döngüsü Probot Core'un döngüsünde çalışamaz. |

Dokuz WPILib öğesi başka bir örneğe katıldı: HAL örneği HalSmoke'a, sekiz komut sınıfı şablonu TemplateCommandItems'a. HalSmoke prosdk'ye özgü 7 örnekten biri sayılır, TemplateCommandItems ise 63 sketch'in içindedir. HAL örneği kendi `main()` döngüsü olan bir C programıdır; HAL C arayüzünü HalSmoke gösterir.

Gelmeyen kütüphane parçalarının tamamı: [WPILib'den farklar](wpilib-farklari.md#gelmeyenler).

## Sonraki adım

[Hatalar ve sorun giderme](sorunlar.md)
