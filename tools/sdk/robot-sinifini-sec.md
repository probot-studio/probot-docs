# Robot sınıfını seç

Bu sayfada robot kodun için üç robot sınıfından birini seçecek, Driver Station'daki düğmelerin hangi fonksiyonları çalıştırdığını ve döngü süresinin nasıl belirlendiğini öğreneceksin.

Bu sayfadaki robot davranışı (döngü süresi, motorlar, acil durdurma, çıkışların kapanması) kaynak koddan yazıldı; prosdk henüz gerçek bir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da denenmedi. Zamanlamaya bağlı kodu robotta deneyerek doğrula.

## Başlamadan önce

- İlk robot kodunu yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Motorlar rehberin pinlerine bağlı: sol BTS7960 RPWM GPIO 38, LPWM GPIO 37, R_EN + L_EN GPIO 36 (hepsi J6); sağ BTS7960 RPWM GPIO 35 (J6), LPWM GPIO 47, R_EN + L_EN GPIO 48 (J8). Bkz. [Rehberin motor ve encoder pinleri](pinleri-kullan.md#rehber-pinleri). Ana kart Pulse; kitin geri kalan elektronik şeması henüz kesin değil. Başka pinler kullanıyorsan koddaki numaraları değiştir.

## Sınıfı seç {#sinif}

| Sınıf | Başlık dosyası | Ne zaman |
|---|---|---|
| `prosdk::TimedRobot` | `<prosdk/framework/TimedRobot.hpp>` | Çoğu robot. Her mod için Init, Periodic ve Exit fonksiyonu; varsayılan döngü 20 ms. Komut tabanlı kod da bunu kullanır. |
| `prosdk::OpModeRobot<Robot>` | `<prosdk/framework/OpModeRobot.hpp>` | Birden çok otonom, teleop ya da utility programı (OpMode) olan robot. OpMode'lar Driver Station'da listeden seçilir. |
| `prosdk::TimesliceRobot` | `<prosdk/framework/TimesliceRobot.hpp>` | Bir denetleyiciyi (ör. kol PID'i) mod fonksiyonlarından daha sık ve sabit aralıkla çalıştırmak isteyen robot. `TimedRobot`'ta `AddPeriodic` ile kaydırmayı kendin seçersin; `TimesliceRobot` her denetleyiciye çakışmayan bir zaman dilimini kendisi verir. |

Her sınıfın hazır bir örneği **File** > **Examples** > **prosdk** altındadır: **TimedRobotDifferential**, **OpModeRobotExample**, **TimesliceRobotExample**. **TemplateOpMode** her OpMode'u ayrı dosyaya koyan bir şablondur. Örnekler: [Robot sınıfı örnekleri](ornek-listesi.md#robot-siniflari), şablonlar: [Şablonlar](ornek-listesi.md#sablonlar).

`RobotBase`'ten doğrudan türeyen bir sınıf derlenir ama kartta çalışmaz: robot açılınca durur ve konsola `derives from RobotBase directly` içeren bir satır yazar. Kendi `StartCompetition()` döngüsünü yazmak yerine yukarıdaki sınıflardan birini kullan.

Her sınıfta kurulum kodu sınıfın kurucusuna (constructor) yazılır. WPILib 2027'de `RobotInit()` yoktur. Kurucu, kart açılınca, Driver Station'a bağlanmadan önce bir kez çalışır.

## Driver Station düğmeleri hangi fonksiyonu çalıştırır {#modlar}

`TimedRobot` ve `TimesliceRobot`'ta robot yalnız **Start**'tan sonra enabled olur. **Init** robotu hazırlar ama çıkışlar kapalı kalır.

| Driver Station'da | Çalışan fonksiyonlar |
|---|---|
| Robot açılır | Kurucu, sonra `DisabledInit()` |
| **Init** | Hiçbir mod fonksiyonu. `DisabledPeriodic()` her turda çalışmaya devam eder. |
| **Start** (**Autonomous** seçili) | `DisabledExit()`, `AutonomousInit()`, sonra her turda `AutonomousPeriodic()` |
| **Start** (**Teleoperated** seçili) | `DisabledExit()`, `TeleopInit()`, sonra her turda `TeleopPeriodic()` |
| **Start** (**Utility** seçili) | `DisabledExit()`, `UtilityInit()`, sonra her turda `UtilityPeriodic()` |
| **Stop**, otonom süresinin bitmesi, bağlantı kopmasından yaklaşık 5 saniye sonra | Modun `...Exit()` fonksiyonu, sonra `DisabledInit()` |
| Her tur, her modda | Mod fonksiyonundan sonra `RobotPeriodic()` |

Bağlantı kopunca Driver Station sayfası 2 saniyede bir kendisi yeniden bağlanmayı dener. 5 saniyeden sonra ama 10 saniye dolmadan yeniden bağlanırsa robot **Start**'a basmadan yeniden enabled olur: `DisabledExit()` ve modun `...Init()` fonksiyonu yeniden çalışır (otonom baştan başlar) ve çıkışlar açılır. 10 saniyeden sonra Probot Core modu durdurur; yeniden **Init** ve **Start** gerekir: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi).

**Emergency Stop** robotu kart yeniden başlatılana kadar kilitler. Robot kodu bir daha çalışmaz, çıkış pinleri LOW'a çekilir. Kilidi açmak için Driver Station'da **Reboot Robot**'a bas ya da kartın gücünü kapatıp aç: [Acil durdurmadan sonra](sorunlar.md#acil-durdurma).

WPILib 2026'daki Test modu 2027'de **Utility** adını aldı (`UtilityInit()`, `UtilityPeriodic()`, `UtilityExit()`). `TimedRobot` ve `TimesliceRobot`'ta prosdk, kurucu bittikten sonra Driver Station'a **Utility** seçeneğini kendisi ekler: **Utility**'yi seç, **Init**'e, sonra **Start**'a bas. `OpModeRobot`'ta **Utility**, kod bir utility OpMode'u ekleyip `PublishOpModes()`'u çağırınca görünür: [Programları listeden seç](#opmoderobot).

## Döngü süresini ayarla {#dongu-suresi}

`TimedRobot` varsayılan olarak her 20 ms'de bir tur atar.

1. Sınıfın kurucusunda temel sınıfa döngü süresini ver: `Robot() : TimedRobot{20_ms}`. Başka bir süre için sayıyı değiştir, ör. `10_ms`.
2. Daha sık çalışması gereken kodu `AddPeriodic(fonksiyon, süre)` ile ekle.
3. Kodu karta yükle.
4. Driver Station'da **Logs** sekmesini seç.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/framework/TimedRobot.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() : TimedRobot{20_ms} {  // 20 ms varsayılandır; ör. 10_ms ile değiştirebilirsin
    // Kol denetleyicisi 5 ms'de bir çalışır.
    AddPeriodic([this] { KolDenetle(); }, 5_ms);
  }

 private:
  void KolDenetle() { /* PID hesabı */ }
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Logs** sekmesindeki **Robot Console**'da `Loop pass of ... ms overrun` ya da `Loop time of ...s overrun` satırı çıkmaz.

Probot Core'un döngüsü, bütün sürelerin ve kaydırmaların milisaniye cinsinden en büyük ortak böleni kadar sık döner. Yukarıdaki örnekte bu 5 ms'dir (20 ve 5'in en büyük ortak böleni).

`AddPeriodic`'e üçüncü değer olarak bir kaydırma (offset) verebilirsin: fonksiyonun ana döngünün başından kaç ms sonra çalışacağı, ör. `AddPeriodic([this] { KolDenetle(); }, 5_ms, 2_ms)`. Süreleri bölmeyen bir kaydırma döngüyü sıklaştırır: kaydırmasız döngü 5 ms'de bir döner, 2 ms kaydırma onu 1 ms'ye indirir (20, 5 ve 2'nin en büyük ortak böleni). Gerek yoksa kaydırma verme.

- Ana döngünün süresi 1 ms ile 1000 ms arasında olmalı. Değilse robot programı açılışta durur ve konsola `Robot loop period ... s is not supported: probot-core runs its loop every 1 ms to 1000 ms.` yazar.
- `AddPeriodic`'e 1 ms'den kısa süre verirsen fonksiyon her turda bir kez çalışır ve konsola `A periodic callback has a period below 1 ms; ...` hata satırı yazılır. 1000 ms'den uzun bir süre (ör. `2_s`) kabul edilir.
- Probot Core'un bir turu geç kalırsa konsolda saniyede en çok bir kez `Loop pass of ... ms overrun (... late passes since boot)` satırı çıkar. Geciken tur telafi edilmez.
- Robotun bir turu (mod fonksiyonu ve `RobotPeriodic()`) döngü süresinden uzun sürerse `Loop time of ...s overrun` hata satırı da çıkar (20 ms'de `0.020000s`). `OpModeRobot`'ta bu yazı konsola gelmez; **Veri** sekmesinde `/Telemetry/Alerts/Alerts` altında uyarı olarak görünür: [Döngü gecikiyor](sorunlar.md#overrun).
- Bir tur 2 saniyeyi geçerse Probot Core bunu takılma sayar ve prosdk'nin çıkış kapısı motor sinyallerini keser: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi). Yalnız Probot Core kullanan kodda motorlar dönmeye devam eder, prosdk'de durur: [Loop takıldı](../core/sorunlar.md#pb-e301-deadline-miss-loop-takildi).
- Fonksiyonlarda `delay()` ya da uzun bekleyen döngü kullanma.

## Programları listeden seç {#opmoderobot}

`OpModeRobot`'ta her otonom, teleop ve utility programı (OpMode) ayrı bir sınıftır. OpMode'lar Driver Station'daki listede görünür.

1. Her OpMode için `prosdk::PeriodicOpMode`'dan türeyen bir sınıf yaz (kurucusu robotu, `Robot&`, alır) ve robotun kurucusunda `AddOpMode<Sınıf>(mod, ad, grup, açıklama)` ile ekle.
2. Kurucunun sonunda `PublishOpModes()`'u çağır.
3. Kodu karta yükle.
4. Driver Station'ın **Dashboard** sekmesinde **Match Control** bölümünde **Autonomous**'u seç.
5. **Match Control** bölümündeki OpMode listesinden **İleri git**'i seç.
6. **Init**'e bas. Düğmenin adı **Start** olur.
7. **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/drive/DifferentialDrive.hpp>
#include <prosdk/drivers/motor/BTS7960.hpp>
#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/OpModeRobot.hpp>
#include <prosdk/opmode/PeriodicOpMode.hpp>
#include <prosdk/system/Timer.hpp>

class Robot : public prosdk::OpModeRobot<Robot> {
 public:
  Robot();

  prosdk::BTS7960 left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN (J6)
  prosdk::BTS7960 right{35, 47, 48};  // RPWM (J6), LPWM, R_EN + L_EN (J8)
  prosdk::DifferentialDrive drive{left, right};
  prosdk::Gamepad gamepad{0};
};

// Otonom: 2 saniye ileri git
class IleriGit : public prosdk::PeriodicOpMode {
 public:
  explicit IleriGit(Robot& robot) : m_robot{robot} {}
  void Start() override { m_timer.Restart(); }  // Start'a basınca
  void Periodic() override {                    // her turda
    if (m_timer.Get() < 2_s) {
      m_robot.drive.ArcadeDrive(0.5, 0.0, false);
    } else {
      m_robot.drive.StopMotor();
    }
  }
  void End() override { m_robot.drive.StopMotor(); }  // Stop'ta

 private:
  Robot& m_robot;
  prosdk::Timer m_timer;
};

// Teleop: arcade sürüş
class ArcadeSurus : public prosdk::PeriodicOpMode {
 public:
  explicit ArcadeSurus(Robot& robot) : m_robot{robot} {}
  void Periodic() override {
    m_robot.drive.ArcadeDrive(-m_robot.gamepad.GetLeftY(), -m_robot.gamepad.GetRightX());
  }
  void End() override { m_robot.drive.StopMotor(); }

 private:
  Robot& m_robot;
};

// Utility: sol motoru tek başına yavaşça dene
class SolMotorTesti : public prosdk::PeriodicOpMode {
 public:
  explicit SolMotorTesti(Robot& robot) : m_robot{robot} {}
  void Periodic() override { m_robot.left.SetThrottle(0.3 * -m_robot.gamepad.GetLeftY()); }
  void End() override { m_robot.left.StopMotor(); }

 private:
  Robot& m_robot;
};

Robot::Robot() {
  right.SetInverted(true);
  AddOpMode<IleriGit>(prosdk::RobotMode::AUTONOMOUS, "İleri git", "Otonom",
                      "2 saniye yarım hızla ileri gider");
  AddOpMode<ArcadeSurus>(prosdk::RobotMode::TELEOPERATED, "Arcade sürüş");
  AddOpMode<SolMotorTesti>(prosdk::RobotMode::UTILITY, "Sol motor testi");
  PublishOpModes();
}

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Match Control** bölümünde **Autonomous**, **Teleoperated** ve **Utility** modları görünür. **Autonomous** seçiliyken listede "İleri git" yazar. **Init** ve **Start**'tan sonra robot 2 saniye ileri gider. **Logs** sekmesindeki **Robot Console**'da `********** Starting OpMode İleri git **********` satırı çıkar.

- OpMode nesnesi, OpMode listeden seçilince robot disabled iken kurulur. `Start()` **Start**'ta, `End()` **Stop**'ta çalışır.
- Liste en çok 64 OpMode taşır. Ad ve grup 63 bayttan, açıklama 255 bayttan uzunsa kesilir ve konsola uyarı yazılır. Türkçe harfler 2 bayt tutar.
- Robota erişmesi gerekmeyen bir OpMode'un kurucusu parametresiz olabilir.
- `AddPeriodic(fonksiyon, süre)` bir OpMode'un kurucusunda da kullanılabilir. Bu fonksiyonlar OpMode listeden seçilip kurulunca kaydolur ve robot disabled iken de çalışır. Yalnız enabled iken çalışması gereken fonksiyonu `if (!prosdk::RobotState::IsEnabled()) return;` ile başlat (`<prosdk/driverstation/RobotState.hpp>`). Motor komutlarını `Periodic()`'e yaz.

## Bir denetleyiciyi sabit aralıkla çalıştır {#timeslice}

`TimesliceRobot`, mod fonksiyonlarına ek olarak verdiğin fonksiyonları bir denetleyici periyodu içinde sırayla çalıştırır. Her fonksiyon, bir öncekine ayrılan süre bitince başlar. Ayrılan süre başlangıç anını belirler, fonksiyonun süresini sınırlamaz.

1. Temel sınıfa robot fonksiyonlarına ayrılan süreyi ve denetleyici periyodunu ver: `TimesliceRobot{4_ms, 10_ms}`.
2. Her denetleyiciyi `Schedule(fonksiyon, ayrılan süre)` ile ekle.
3. Kodu karta yükle.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/framework/TimesliceRobot.hpp>

class Robot : public prosdk::TimesliceRobot {
 public:
  // RobotPeriodic ve mod fonksiyonlarına 4 ms; denetleyiciler 10 ms'de bir.
  Robot() : TimesliceRobot{4_ms, 10_ms} {
    Schedule([this] { KolDenetle(); }, 2_ms);    // 4. ms'de başlar
    Schedule([this] { BilekDenetle(); }, 2_ms);  // 6. ms'de başlar
  }

 private:
  void KolDenetle() { /* ... */ }
  void BilekDenetle() { /* ... */ }
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: `KolDenetle()` ve `BilekDenetle()` her 10 ms'de bir, sırayla çalışır. Mod fonksiyonları ve `RobotPeriodic()` yine 20 ms'de bir, 10 ms'lik denetleyici periyodunun ilk 4 ms'sinde (her ikinci periyotta) çalışır.

Robot fonksiyonlarına ayrılan süre ile bütün `Schedule` sürelerinin toplamı denetleyici periyodunu geçmesin; eşit olabilir (örnekte 4 + 2 + 2 = 8 ms). Geçerse kurucu hata fırlatır, robot programı durur ve konsolda `exceeded controller period` içeren bir satır çıkar. Bu örnekte Probot Core'un döngüsü 2 ms'de bir döner.

## Kod hata fırlatırsa {#halt}

Kurucu ya da bir döngü fonksiyonu C++ istisnası (exception) fırlatırsa robot programı durur. Probot Core çalışmaya devam eder, böylece hata Driver Station'da okunur.

- Konsola hatanın kendisi ve şu satır yazılır (`Robot` yerine sınıfının adı): `[prosdk] robot program Robot halted: its loop threw an exception. Outputs stay disabled until reboot.` Sebep kurucudaysa `its constructor threw an exception` yazar.
- Çıkışlar kart yeniden başlatılana kadar kapalı kalır.
- Sonraki her **Init** ya da **Start** durdurulur ve konsola `... is halted: Driver Station start stopped. Reboot the robot to run it again.` yazılır.

Sık sebepler: kullanılamayan bir pin, aynı pini iki kez kullanmak, kitte olmayan bir donanım sınıfı (pnömatik, `PowerDistribution`): [Kitte olmayan donanımı kullanma](pinleri-kullan.md#desteklenmeyen). Hepsi: [Robot programı durdu](sorunlar.md#halted).

## Sonraki adım

[Komut tabanlı kod yaz](komut-tabanli-yaz.md)
