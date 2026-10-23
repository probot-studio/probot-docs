# Komut tabanlı kod yaz

Bu sayfada iki motorlu robotu WPILib'in komut tabanlı (command-based) yapısıyla kodlayacaksın. Sürüş bir alt sistem olur, kumanda onu varsayılan komutla sürer. **A** robotu 1 saniye ileri götürür, **B** yerinde döndürür; otonomu bir komut dizisi yapar.

## Başlamadan önce

- İlk robot kodunu yazıp yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md). Bu sayfa aynı bağlantıyı ve aynı pinleri kullanır: sol BTS7960 GPIO 38/37/36 (J6), sağ BTS7960 GPIO 35 (J6) ve 47/48 (J8).
- **Tools** menüsündeki kart ayarları yapıldı (**ESP32S3 Dev Module**, **Huge APP (3MB No OTA/1MB SPIFFS)**, **QSPI PSRAM** ve tablodaki diğerleri): [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme).
- WPILib'de alt sistem, komut ve tetikleyici kavramlarını biliyorsun: [WPILib komut tabanlı programlama](https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html). Bu kavramlar olmadan da `TimedRobot` ile robot yazabilirsin.

Ana kart, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartıdır; kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Başka pinler kullanıyorsan koddaki numaraları değiştir: [Kullanılabilir pinleri seç](pinleri-kullan.md#kullanilabilir-pinler).

Bu sayfadaki robot davranışı (motorlar, süreler, Driver Station listesi) kaynak koddan yazıldı; prosdk henüz gerçek bir kartta, Pulse'ta da denenmedi. İlk denemede tekerlekleri yerden kaldır.

## Hazır örnekle başla

prosdk birkaç komut tabanlı örnekle gelir. **TemplateCommandV2**, WPILib'in "Command v2" proje şablonudur: `Robot`, `RobotContainer`, örnek alt sistem ve örnek komut ayrı dosyalardadır.

**CommandBasedRobot** tek dosyada sürüş, PID'li komut, SysId ve otonom seçimi gösterir. Bu rehberin BTS7960'lı robotunda olduğu gibi çalışmaz.

Örneğin motor sürücüleri BTS7960 değil, PWM ile sürülen hobi ESC'leridir. Sol ESC GPIO 38'de, sağ ESC GPIO 37'dedir (J6). Bu rehberde 38 ve 37 sol BTS7960'ın RPWM ve LPWM pinleridir.

!!! warning "Dikkat"
    CommandBasedRobot'u bu rehberin robotuna olduğu gibi yükleme. Örnek her motor pinine servo darbeleri (1000-2000 µs) gönderir. Bu darbeler sol BTS7960'ın RPWM ve LPWM pinlerine gider, EN pini (GPIO 36) hiç sürülmez. Pin numaralarını değiştirmek yetmez.

Örneği okumak için kullan ya da PWM ile sürülen ESC'li bir robota yükle. BTS7960'a taşırsan motorları `prosdk::BTS7960` yap. SysId kaydındaki `GetVoltage()` satırlarını da değiştir, çünkü `BTS7960` bu fonksiyonu vermez.

Örnekteki encoder'lar J7'deki GPIO 39/40 ve 41/42'ye bağlıdır. Bu rehber de encoder'lar için bu pinleri boş bırakır.

Örnek LittleFS'i bağlamaz, bu yüzden SysId verisi kaydedilmez. İlk SysId testinde konsolda `DataLogManager: no log storage` ile başlayan uyarı çıkar. Veriyi kaydetmek için [Kaydı LittleFS'e yaz](kayit-tut.md#littlefs) bölümündeki satırları ekle.

**TemplateCommandItems**, WPILib'in komut ve alt sistem sınıfı şablonlarını verir, her biri ayrı sekmededir. Bütün örnekler: [Şablonlar](ornek-listesi.md#sablonlar), [Komut tabanlı ve SysId](ornek-listesi.md#komut-tabanli).

1. Arduino IDE'de **File** > **Examples** > **prosdk** > **TemplateCommandV2**'yi seç.
2. `.ino` sekmesinde `PROBOT_WIFI_AP_PASSWORD` satırındaki şifreyi en az 8 karakterlik kendi şifrenle değiştir.
3. **File** > **Save As**'i seç ve sketch'i kendi klasörüne kaydet.
4. Araç çubuğunda **Verify**'a bas.

Sonuç: **Output** panelinde "Using precompiled library in" ile başlayan bir satır ve şu iki satır görünür:

```text
Sketch uses 1871674 bytes (59%) of program storage space. Maximum is 3145728 bytes.
Global variables use 73696 bytes (22%) of dynamic memory, leaving 253984 bytes for local variables. Maximum is 327680 bytes.
```

Sayılar sürüme ve yazdığın şifreye göre biraz değişir. "Maximum is 3145728 bytes" yazıyorsa **Huge APP** seçilidir.

Örnekte ağ adı satırı yoktur. Probot Core ağı `Probot-XXXXXX` biçiminde bir adla açar. Bu yüzden **Output**'ta `PROBOT_WIFI_AP_SSID not defined` geçen bir uyarı (`#warning`) çıkabilir; bu bir hata değildir: ["PROBOT_WIFI_AP_SSID not defined"](sorunlar.md#ssid-yok).

Kanal örneğin kendi `#define` satırında 6'dır. Ağa kendi adını vermek için `#include <prosdk.h>` satırının üstüne `#define PROBOT_WIFI_AP_SSID "Probot"` ekle.

Örneklerin kaynağı: [probot-sdk deposundaki `examples` klasörü](https://github.com/probot-studio/probot-sdk/tree/dev/examples).

## Kodu yaz {#kodu-yaz}

Aşağıdaki sketch üç parçadan oluşur: `Surus` alt sistemi, `SabitSur` komutu ve komutları bağlayan `Robot` sınıfı. Robot sınıfı yine `TimedRobot`'tur: [Robot sınıfını seç](robot-sinifini-sec.md#sinif).

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil.
3. Aşağıdaki kodu yapıştır.
4. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
5. **File** > **Save**'i seç ve sketch'e bir ad ver.
6. Araç çubuğunda **Verify**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/commands2/CommandHelper.hpp>
#include <prosdk/commands2/CommandScheduler.hpp>
#include <prosdk/commands2/Commands.hpp>
#include <prosdk/commands2/SubsystemBase.hpp>
#include <prosdk/commands2/button/CommandGamepad.hpp>
#include <prosdk/drive/DifferentialDrive.hpp>
#include <prosdk/drivers/motor/BTS7960.hpp>
#include <prosdk/framework/TimedRobot.hpp>

// Alt sistem: iki motorlu sürüş
class Surus : public prosdk::cmd::SubsystemBase {
 public:
  Surus() : SubsystemBase{"Surus"} {
    m_right.SetInverted(true);  // sağ motor ters yöne bakıyor
  }

  // kareAl: kumanda girişlerinin karesini alır, küçük hareketleri yumuşatır
  void Arcade(double ileri, double donus, bool kareAl = true) {
    m_drive.ArcadeDrive(ileri, donus, kareAl);
  }
  void Durdur() { m_drive.StopMotor(); }

  // Komut fabrikası: verilen fonksiyonlarla her turda arcade sürüş
  prosdk::cmd::CommandPtr ArcadeKomutu(std::function<double()> ileri,
                                       std::function<double()> donus) {
    return Run([this, ileri, donus] { Arcade(ileri(), donus()); }).WithName("Arcade");
  }

 private:
  prosdk::BTS7960 m_left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN (J6)
  prosdk::BTS7960 m_right{35, 47, 48};  // RPWM (J6), LPWM ve R_EN + L_EN (J8)
  prosdk::DifferentialDrive m_drive{m_left, m_right};
};

// Komut: sabit hızla sür. Süreyi WithTimeout belirler.
class SabitSur : public prosdk::cmd::CommandHelper<prosdk::cmd::Command, SabitSur> {
 public:
  SabitSur(Surus& surus, double ileri, double donus)
      : m_surus{surus}, m_ileri{ileri}, m_donus{donus} {
    AddRequirements(&surus);  // bu komut çalışırken Surus'u başka komut kullanamaz
  }

  void Execute() override { m_surus.Arcade(m_ileri, m_donus, false); }
  void End(bool interrupted) override { m_surus.Durdur(); }

 private:
  Surus& m_surus;
  double m_ileri;
  double m_donus;
};

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    // Başka komut Surus'u kullanmıyorsa kumandayla sür
    m_surus.SetDefaultCommand(m_surus.ArcadeKomutu(
        [this] { return -m_gamepad.GetLeftY(); },
        [this] { return -m_gamepad.GetRightX(); }));

    // A'ya basınca 1 saniye yarım hızla ileri
    m_gamepad.FaceDown().OnTrue(
        SabitSur{m_surus, 0.5, 0.0}.ToPtr().WithTimeout(1_s).WithName("1 sn ileri"));

    // B'ye her basış yavaş dönüşü başlatır ya da durdurur
    m_gamepad.FaceRight().ToggleOnTrue(
        SabitSur{m_surus, 0.0, 0.3}.ToPtr().WithName("Yavaş dön"));

    // Çalışan komutlar ve İptal düğmeleri Veri sekmesinde
    prosdk::tunables::Publish("Scheduler", prosdk::cmd::CommandScheduler::GetInstance());
  }

  // Her turda, her modda: düğmeleri oku, komutları çalıştır
  void RobotPeriodic() override { prosdk::cmd::CommandScheduler::GetInstance().Run(); }

  void AutonomousInit() override {
    prosdk::cmd::CommandScheduler::GetInstance().Schedule(m_otonom);
  }
  void AutonomousExit() override { m_otonom.Cancel(); }

 private:
  Surus m_surus;
  prosdk::cmd::CommandGamepad m_gamepad{0};  // Driver Station'daki ilk kumanda

  // Otonom: 2 saniye yarım hızla ileri, sonra 1 saniye yerinde sola dön
  prosdk::cmd::CommandPtr m_otonom =
      prosdk::cmd::Sequence(SabitSur{m_surus, 0.5, 0.0}.ToPtr().WithTimeout(2_s),
                            SabitSur{m_surus, 0.0, 0.5}.ToPtr().WithTimeout(1_s))
          .WithName("Otonom");
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Output** panelinde "Sketch uses" ile başlayan ve "Maximum is 3145728 bytes." ile biten satır görünür.

Kodu karta yüklemek için [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle) bölümündeki adımları izle.

### WPILib'den farkı

| WPILib 2027 | prosdk |
|---|---|
| `wpi::cmd::` (WPILib 2026'da `frc2::`) | `prosdk::cmd::` |
| `#include <wpi/commands2/...>` | `#include <prosdk/commands2/...>` |

WPILib 2026'daki `CommandPS4Controller` ve `CommandPS5Controller`, WPILib 2027'de ve prosdk'de `CommandDualShock4Controller` ve `CommandDualSenseController` adını taşır.

`<prosdk.h>` komut sınıflarını getirmez; kullandığın her sınıfın başlığını ayrıca ekle. Komut fabrikaları doğrudan `prosdk::cmd` içindedir: `prosdk::cmd::Sequence(...)`, `prosdk::cmd::Wait(1_s)`.

`RobotContainer` sınıfı isteğe bağlıdır; **TemplateCommandV2** onu kullanır, bu sayfadaki sketch kullanmaz.

## Alt sistemi yaz {#alt-sistem}

Alt sistem, bir mekanizmanın donanımını ve o donanımı süren fonksiyonları bir arada tutar. Komutlar donanıma alt sistem üzerinden ulaşır.

- `prosdk::cmd::SubsystemBase`'ten türet. Kurucusu alt sistemi zamanlayıcıya (scheduler) kendisi kaydeder.
- Adı kurucunun başlatıcısında ver: `Surus() : SubsystemBase{"Surus"} {}`. Kurucunun gövdesinde çağrılan `SetName("Surus")` geç kalır. `SysIdRoutine` gibi üyeler adı gövdeden önce alır.
- Ad vermezsen her alt sistemin adı `prosdk::cmd::SubsystemBase` olur (WPILib'de de böyledir). O zaman iki alt sistemdeki `SysIdRoutine`'ler kayda aynı `sysid-test-state` girdisini yazar. Driver Station'da da alt sistemleri adlarından ayıramazsın.
- Motorları ve sensörleri `private` üye yap. Dışarıya `Arcade()` ve `Durdur()` gibi fonksiyonlar aç.
- `Periodic()`'i ezersen, zamanlayıcı her `Run()` çağrısında onu bir kez çalıştırır. Telemetri yazmak için uygun yer burasıdır: [Telemetri ve ayar değerlerini göster](veri-goster.md#telemetri).

Alt sistemin içindeki `Run`, `RunOnce`, `StartEnd`, `RunEnd`, `StartRun`, `Idle` ve `Defer` fabrikaları komutu bu alt sisteme bağlı (requirement) olarak kurar. `ArcadeKomutu` bu yüzden `AddRequirements` çağırmaz.

## Komut yaz {#komut}

Komutu iki yolla yazarsın: kendi sınıfınla ya da fabrika fonksiyonlarıyla.

**Sınıfla.** `prosdk::cmd::CommandHelper<prosdk::cmd::Command, SınıfAdı>`'ndan türet. Doğrudan `Command`'dan türetirsen sınıf soyut kalır ve derleme `invalid cast to abstract class type` hatasıyla durur; `.ToPtr()` ve dekoratörleri `CommandHelper` verir. Kurucuda kullandığın alt sistemi `AddRequirements(&surus)` ile bildir.

| Fonksiyon | Ne zaman çalışır | Varsayılan |
|---|---|---|
| `Initialize()` | Komut başlarken bir kez | Boş |
| `Execute()` | Komut çalıştıkça her turda | Boş |
| `IsFinished()` | Her `Execute()`'tan sonra; `true` dönerse komut biter | `false` |
| `End(bool interrupted)` | Komut bitince ya da kesilince bir kez | Boş |
| `RunsWhenDisabled()` | Robot disabled iken komut çalışsın mı | `false` |

**Fabrikayla.** Tek satırlık işler için sınıf yazma:

| Fabrika | Ne yapar |
|---|---|
| `RunOnce(f)` | `f`'yi bir kez çalıştırır ve biter. |
| `Run(f)` | `f`'yi her turda çalıştırır, kendiliğinden bitmez. |
| `StartEnd(a, b)` | Başlarken `a`'yı, biterken `b`'yi çalıştırır. |
| `RunEnd(f, b)` | Her turda `f`'yi, biterken `b`'yi çalıştırır. |
| `Wait(süre)` | Süre dolunca biter. |
| `Sequence(...)`, `Parallel(...)`, `Race(...)`, `Deadline(...)` | Komutları sırayla ya da birlikte çalıştırır. |

Dekoratörleri (`WithTimeout`, `Until`, `AndThen`, `WithName` ve diğerleri) komutu bir değişkene atamadan önce, aynı zincirde yaz: `SabitSur{...}.ToPtr().WithTimeout(1_s)`. Bir `CommandPtr` değişkenine eklemek için `std::move(komut).WithTimeout(1_s)` yaz.

`std::move`'dan sonra eski değişken boş kalır. Onu yeniden kullanırsan kod `Moved-from CommandPtr object used!` hatası fırlatır ve robot programı durur.

Komut adları Driver Station'daki listede görünür:

- Kendi sınıfın sınıf adını alır: `SabitSur`.
- Fabrikalar ve dekoratörler sınıf adı verir: `Run(...)` `prosdk::cmd::RunCommand`, `WithTimeout(...)` `prosdk::cmd::ParallelRaceGroup` olarak görünür.
- Okunur bir ad için zincirin sonuna `.WithName("1 sn ileri")` ekle.

!!! note "Not"
    Bir komut yanlış kullanılırsa (ör. bir gruba girmiş komutu ayrıca zamanlamak) kod `Illegal use of Command:` ile başlayan bir hata fırlatır. Bu hata kurucuda ya da bir döngü fonksiyonunda (düğme bağlamaları dahil) çıkarsa robot programı durur: [Kod hata fırlatırsa](robot-sinifini-sec.md#halt).

## Komutu kumandaya bağla {#tetikleyici}

`prosdk::cmd::CommandGamepad` Driver Station'daki kumandanın düğmelerini tetikleyici (`Trigger`) olarak verir. prosdk, Driver Station'dan gelen kumanda verisini WPILib'in `Gamepad` düzenine çevirir: [Düğmeleri ve D-pad'i oku](kumandayi-oku.md#dugmeler).

| Driver Station'da | PlayStation | `CommandGamepad` | `CommandXboxController` |
|---|---|---|---|
| **A** | **Cross** | `FaceDown()` | `A()` |
| **B** | **Circle** | `FaceRight()` | `B()` |
| **X** | **Square** | `FaceLeft()` | `X()` |
| **Y** | **Triangle** | `FaceUp()` | `Y()` |
| **LB**, **RB** | **L1**, **R1** | `LeftBumper()`, `RightBumper()` | `LeftBumper()`, `RightBumper()` |
| **LT**, **RT** | **L2**, **R2** | `LeftTrigger()`, `RightTrigger()` | `LeftTrigger()`, `RightTrigger()` |
| **Back**, **Start** | **Share** (PS4) / **Create** (PS5), **Options** | `Back()`, `Start()` | `View()`, `Menu()` |

`LeftTrigger()` tetik 0,5'i geçince `true` olur. Eşiği `LeftTrigger(0.2)` gibi verebilirsin.

`CommandXboxController`, `CommandDualShock4Controller` ve `CommandDualSenseController` da `CommandGamepad` ile aynı düğme düzenini okur. Düğme adları sana hangisinde tanıdık geliyorsa onu seç. **TemplateCommandV2** `CommandGamepad`, **CommandBasedRobot** `CommandXboxController` kullanır.

`CommandNiDs...` ile başlayan sınıfları kullanma: eski NI Driver Station'ın düğme numaralarını beklerler ve Probot Driver Station'da yanlış düğmeleri okurlar: [Çubukları ve tetikleri oku](kumandayi-oku.md#kumanda-duzeni).

Bir tetikleyiciye komutu şu fonksiyonlarla bağlarsın:

| Bağlama | Ne yapar |
|---|---|
| `OnTrue(komut)` | Düğmeye basılınca komutu başlatır. |
| `WhileTrue(komut)` | Basılı tuttukça çalıştırır, bırakınca iptal eder. |
| `ToggleOnTrue(komut)` | Her basışta başlatır ya da iptal eder. |
| `OnFalse(komut)` | Düğme bırakılınca başlatır. |

Varsayılan komut, alt sistemi başka komut kullanmadığında çalışır. Bu yüzden **A**'ya basınca `1 sn ileri` arcade sürüşü keser; bitince arcade kendiliğinden geri gelir. `SetDefaultCommand`'a verilen komut alt sistemi kullanmak zorundadır; kullanmıyorsa kurucu `Default commands must require their subsystem!` hatasını fırlatır.

Bağlamayı denemek için:

1. Kodu karta yükle.
2. Robotun WiFi ağına bağlanıp Driver Station'ı aç: [Robotun ağına bağlan](../core/ilk-10-dakika.md#robotun-agina-baglan).
3. Kumandayı bağla: [Kumandayı bağla](../core/ilk-10-dakika.md#kumandayi-bagla).
4. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
5. **Init**'e, sonra **Start**'a bas.
6. Kumandada **A**'ya bas.

Sonuç: Robot 1 saniye yarım hızla ileri gider ve durur. Bu sürede çubuklar robotu sürmez; sonra çubuklar yine sürer.

Kumanda yoksa **Joystick** sekmesinde **Input Source** bölümünde **Klavye** kartındaki **Etkinleştir**'e bas; <kbd>1</kbd> tuşu **A**, <kbd>2</kbd> tuşu **B** olur: [Kumandasız sür](../core/kumandayi-oku.md#kumandasiz-sur).

## Otonom komutu başlat {#otonom}

Otonom komutu `AutonomousInit()`'te zamanlanır, `AutonomousExit()`'te iptal edilir. Robot disabled iken `Schedule()` komutu sessizce yok sayar. Bu yüzden otonom komutu kurucuda ya da `DisabledInit()`'te değil, `AutonomousInit()`'te zamanla.

1. Driver Station'da **Stop**'a bas. Robot zaten duruyorsa bu adımı geç.
2. **Dashboard** sekmesinde **Match Control** bölümünde **Autonomous**'u seç.
3. **Init**'e bas.
4. **Start**'a bas.

Sonuç: Robot 2 saniye yarım hızla ileri gider, sonra 1 saniye yerinde sola döner ve durur. Otonom süresi dolunca **Teleoperated** seçili olur ve düğmenin yazısı **Init Teleop** olur.

Otonom komut bitince sürüş yeniden varsayılan komuta geçer. Otonom süresi dolmadan çubuklara dokunursan robot hareket eder.

## Çalışan komutları gör ve iptal et {#komut-listesi}

`prosdk::tunables::Publish("Scheduler", ...)` satırı zamanlayıcıyı Driver Station'ın **Veri** sekmesine koyar. Her çalışan komutun yanında bir **İptal** düğmesi çıkar.

1. Driver Station'da **Stop**'a bas. Robot zaten duruyorsa bu adımı geç.
2. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
3. **Init**'e, sonra **Start**'a bas. Otonomdan sonra bu düğmenin yazısı **Init Teleop**'tur.
4. **Veri** sekmesine bas. **Tunables** altında **Scheduler** grubu görünür.
5. Kumandada **B**'ye bas.
6. Listede **Yavaş dön** satırındaki **İptal**'e bas.

Sonuç: Grupta "Çalışan komut: 1" ve **Arcade** satırı görünür. **B**'den sonra **Arcade** yerine **Yavaş dön** gelir ve robot yerinde döner. **İptal**'e basınca düğme "İptal ediliyor" olur, robot durur ve liste yeniden **Arcade**'i gösterir.

- Robot disabled iken liste "Çalışan komut yok" gösterir. Zamanlayıcı disabled olunca komutları iptal eder.
- Varsayılan komutu iptal edersen zamanlayıcı onu sonraki turda yeniden başlatır.
- Listeyi yalnız göstermek için `RobotPeriodic()` içinde, `Run()` satırından sonra `prosdk::telemetry::Log("Scheduler", prosdk::cmd::CommandScheduler::GetInstance());` yaz. **Telemetry** altında aynı liste çıkar ama **İptal** düğmesi olmaz.
- `Log` değeri yazıldığı an kaydeder. Bu yüzden onu her turda çağır.
- Tek bir komutu **Çalıştır** / **Durdur** düğmesiyle Driver Station'dan başlatmak da mümkündür: [Widget'la göster](veri-goster.md#widget).

`CommandScheduler::GetInstance().Run()` 20 ms'den uzun sürerse konsola `CommandScheduler loop time overrun.` yazılır. Sebep çoğunlukla uzun süren bir `Execute()`'tur: [Döngü gecikiyor](sorunlar.md#overrun).

Bu 20 ms robotun döngü süresine bağlı değildir. `TimedRobot{10_ms}` onu değiştirmez; eşiği `prosdk::cmd::CommandScheduler::GetInstance().SetPeriod(10_ms)` ile değiştirirsin.

## Değişen adları kullan {#makro-adlari}

`Arduino.h` ve onun eklediği ESP32 başlıkları `HIGH`, `LOW`, `RISING`, `FALLING`, `DEFAULT` ve `PS` gibi adları makro olarak tanımlar. Bu adlardan birini içeren her `enum`'un bütün değerleri prosdk'de `k` önekini alır; `PS()` fonksiyonu ise `PSButton()` olur. Komut tabanlı kodda karşına çıkanlar:

| WPILib 2027 | prosdk |
|---|---|
| `Debouncer::DebounceType::RISING`, `FALLING`, `BOTH` | `kRising`, `kFalling`, `kBoth` |
| `DualShock4Controller::Button::CROSS`, `CIRCLE`, `SQUARE`, `TRIANGLE`, `L1`, `R1` ... | `kCross`, `kCircle`, `kSquare`, `kTriangle`, `kL1`, `kR1` ... |
| `CommandDualShock4Controller` ve `CommandDualSenseController`'da `PS()` | `PSButton()` |
| `Alert::Level::HIGH`, `MEDIUM`, `LOW` | `kHigh`, `kMedium`, `kLow` |

PlayStation sınıflarının `Cross()`, `Circle()`, `L1()` gibi tetikleyici fonksiyonları adını korur. `XboxController` ve `Gamepad` düğme adları da değişmez (`Gamepad::Button::FACE_DOWN`).

```cpp
// Düğmenin durumu ancak 0,1 saniye aynı kalırsa değişir
m_gamepad.FaceUp()
    .Debounce(0.1_s, prosdk::math::Debouncer::DebounceType::kBoth)
    .OnTrue(prosdk::cmd::Print("Y basılı"));

// PlayStation kumandasında PS düğmesi. m_ps şöyle tanımlı:
// #include <prosdk/commands2/button/CommandDualShock4Controller.hpp>
// prosdk::cmd::CommandDualShock4Controller m_ps{1};
m_ps.PSButton().OnTrue(prosdk::cmd::Print("PS"));
```

Her kumanda PS düğmesini vermez: 17'den az düğme bildiren kumandada tetikleyici hep `false` okunur. İşletim sistemi, Steam ya da tarayıcı bu düğmeyi kendisi için yakalayabilir; o zaman tetikleyici hiç `true` olmaz: [Düğmeleri ve D-pad'i oku](kumandayi-oku.md#dugmeler).

Bütün liste: [WPILib'den farklar](wpilib-farklari.md#makro-adlari).

## Sorun mu var?

- **Derleme "'prosdk::cmd' has not been declared" diye duruyor:** komut başlıkları eksik. `<prosdk.h>` komut sınıflarını getirmez; `<prosdk/commands2/...>` satırlarını ekle.
- **"invalid cast to abstract class type" hatası:** komut sınıfı `Command`'dan türüyor. `CommandHelper<prosdk::cmd::Command, SınıfAdı>`'ndan türet.
- **Düğmeye basınca hiçbir şey olmuyor:** `RobotPeriodic()` içinde `CommandScheduler::GetInstance().Run()` satırını kontrol et. O satır olmadan düğmeler okunmaz, komutlar çalışmaz.
- **Listede İptal düğmesi yok:** zamanlayıcıyı `telemetry::Log` ile yayımlıyorsun. `tunables::Publish("Scheduler", ...)` kullan.
- **Robot programı duruyor:** konsolda `Illegal use of Command:` satırını oku: [Robot programı durdu](sorunlar.md#halted).

## Sonraki adım

[Kumandayı ve Driver Station'ı kullan](kumandayi-oku.md)
