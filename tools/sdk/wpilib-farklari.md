# WPILib'den farklar

Bu sayfa, WPILib 2027 C++ kodunu prosdk'ye taşırken en sık karşılaşacağın değişiklikleri listeler. Konular: ad alanları, Arduino yüzünden değişen adlar, robot sınıfı ve zamanlama, gelmeyen parçalar ve bellek sınırları.

Robottaki davranışlar (hata mesajları, kumanda, zamanlama) ve bellek ölçümleri kaynak koddan ve öykünücüden (QEMU) alındı; prosdk henüz gerçek bir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da denenmedi.

## Başlamadan önce

- WPILib 2027 C++ ile robot kodu yazmayı biliyorsun.
- prosdk kurulu: [prosdk'yi Arduino IDE'ye kur](kur.md).

## Ad alanı ve başlık dosyaları {#ad-alani}

prosdk'de kök ad alanı ve başlık dosyalarının kökü değişir. Alt ad alanları (`math`, `units`, `util`, `cmd`, `telemetry`, `tunables`, `hal`, `log`) adını korur.

| WPILib 2027 | prosdk |
|---|---|
| `wpi::` | `prosdk::` |
| `#include <wpi/...>` | `#include <prosdk/...>` |
| `wpi::cmd::` (komut tabanlı) | `prosdk::cmd::` |
| `wpi::math::`, `wpi::units::` | `prosdk::math::`, `prosdk::units::` |
| `fs::` (genel ad alanı) | `prosdk::fs::`. Arduino'nun `FS.h` dosyası zaten genel bir `fs` ad alanı tanımlar. |
| `#include <Eigen/...>` | `#include <prosdk/thirdparty/eigen/Eigen/...>` |
| `#include <unsupported/Eigen/...>` | `#include <prosdk/thirdparty/eigen/unsupported/Eigen/...>` |
| `#include <gcem.hpp>` | `#include <prosdk/thirdparty/gcem/gcem.hpp>` |
| `#include <sleipnir/...>` | `#include <prosdk/thirdparty/sleipnir/sleipnir/...>` |
| `#include <gch/small_vector.hpp>` | `#include <prosdk/thirdparty/sleipnir/gch/small_vector.hpp>` |
| `#include "wpimath/protobuf/<dosya>.npb.h"` | `#include <prosdk/generated/wpimath/protobuf/<dosya>.npb.h>` |
| `std::expected`, `std::unexpected`, `std::unexpect`, `std::bad_expected_access`, `std::print`, `std::println`, `std::byteswap`, `std::to_underlying`, `std::unreachable`, `std::invoke_r` | `prosdk::cxx::` altında aynı adlar. Başlıklar `<prosdk/cxx/expected.hpp>`, `print.hpp`, `bit.hpp`, `utility.hpp`, `functional.hpp`. |

Son satırın sebebi: Arduino ESP32 sketch'leri C++20 (gnu++20) ile derler. WPILib 2027'nin kullandığı C++23 özellikleri prosdk'de `prosdk::cxx` altındadır.

!!! warning "Dikkat"
    C++20'de çok boyutlu `[]` yok: Sleipnir ve Eigen'de `m[i, j]` yerine `m(i, j)` yaz. Sleipnir matrislerinde ve Eigen vektörlerinde `m[i, j]` derleme hatası vermez. Virgül işleci yüzünden `m[j]` olarak derlenir ve yanlış elemanı okur. İki boyutlu bir Eigen matrisinde aynı yazım derlenmez (`THE_BRACKET_OPERATOR_IS_ONLY_FOR_VECTORS__USE_THE_PARENTHESIS_OPERATOR_INSTEAD`).

Sık kullanılan başlıklar:

| Sınıf | WPILib 2027 | prosdk |
|---|---|---|
| `TimedRobot` | `<wpi/framework/TimedRobot.hpp>` | `<prosdk/framework/TimedRobot.hpp>` |
| `Gamepad` | `<wpi/driverstation/Gamepad.hpp>` | `<prosdk/driverstation/Gamepad.hpp>` |
| `DifferentialDrive` | `<wpi/drive/DifferentialDrive.hpp>` | `<prosdk/drive/DifferentialDrive.hpp>` |
| `PIDController` | `<wpi/math/controller/PIDController.hpp>` | `<prosdk/math/controller/PIDController.hpp>` |
| Uzunluk birimleri | `<wpi/units/length.hpp>` | `<prosdk/units/length.hpp>` |
| `Command` | `<wpi/commands2/Command.hpp>` | `<prosdk/commands2/Command.hpp>` |

Değişmeyenler:

- Eigen, gcem ve Sleipnir'in C++ ad alanları: `Eigen`, `gcem`, `slp`.
- `WPI_*` ve `HAL_*` C fonksiyonları, `WPILIB_*` makroları (ör. `WPILIB_ReportError`), `wpi.proto.*` ve `wpi_proto_*` adları.
- Birim sabitleri: `2_s`, `10_ms` gibi yazımlar `using` satırı olmadan çalışır.

Sketch `<prosdk.h>`'yi ilk satırlarda ekler. Giriş noktası farkları: [Robot sınıfı ve zamanlama](#robot-sinifi).

### WPILib 2026 kodundan geliyorsan {#wpilib-2026}

Aşağıdakiler prosdk'nin değil, WPILib 2027'nin değişiklikleridir. 2026 kodunu taşırken önce bunları uygula, sonra yukarıdaki tabloyu.

| WPILib 2026 | WPILib 2027 | prosdk |
|---|---|---|
| `frc::` | `wpi::` | `prosdk::` |
| `frc2::` (komut tabanlı) | `wpi::cmd::` | `prosdk::cmd::` |
| `RobotInit()` | Yok. Kurulum kodu kurucuya yazılır. | Aynı |
| Test modu (`TestInit()`, `TestPeriodic()`) | Utility modu (`UtilityInit()`, `UtilityPeriodic()`) | Aynı adlar: [Utility modu](#robot-sinifi). |
| `FRC_ReportError` | `WPILIB_ReportError` | Aynı |
| `AprilTagFieldLayout`, `AprilTagFields` | `fields` kütüphanesi | `prosdk::fields`, `<prosdk/fields/fields.hpp>` |
| `frc::Servo`, `frc::SPI` | Kaldırıldı | prosdk 2026 biçimiyle geri ekler: `prosdk::Servo`, `prosdk::SPI` (`SPI::kPort0` = SPI2, `kPort1` = SPI3) |

Servo için: [Servoyu sür](surucu-kullan.md#servo).

## Arduino makrolarıyla çakışan adlar {#makro-adlari}

Arduino ve ESP32 başlıkları bazı adları makro yapar. Bunlar `HIGH`, `LOW`, `INPUT`, `OUTPUT`, `RISING`, `FALLING`, `DEFAULT`, `DISABLED`, `ANALOG` ve `PS`'dir. Bu adlardan birini içeren her `enum`'un bütün değerleri prosdk'de `k` önekiyle yazılır.

| WPILib 2027 | prosdk | Çakışan makro |
|---|---|---|
| `wpi::util::Alert::Level::HIGH`, `MEDIUM`, `LOW` | `prosdk::util::Alert::Level::kHigh`, `kMedium`, `kLow` | `HIGH`, `LOW` |
| `wpi::tunables::TunableConfig::Polling::DEFAULT`, `ALWAYS_GET`, `GET_ON_CHANGE` | `prosdk::tunables::TunableConfig::Polling::kDefault`, `kAlwaysGet`, `kGetOnChange` | `DEFAULT` |
| `wpi::hal::SimDevice::Direction::INPUT`, `OUTPUT`, `BIDIR` | `prosdk::hal::SimDevice::Direction::kInput`, `kOutput`, `kBidir` | `INPUT`, `OUTPUT` |
| `wpi::math::Debouncer::DebounceType::RISING`, `FALLING`, `BOTH` | `prosdk::math::Debouncer::DebounceType::kRising`, `kFalling`, `kBoth` | `RISING`, `FALLING` |
| `wpi::CompressorConfigType::DISABLED`, `DIGITAL`, `ANALOG`, `HYBRID` | `prosdk::CompressorConfigType::kDisabled`, `kDigital`, `kAnalog`, `kHybrid` | `DISABLED`, `ANALOG` |
| PlayStation kumandalarında `Button::CROSS` ... `Button::RIGHT_FUNCTION` | `Button::kCross`, `kCircle`, `kSquare`, `kTriangle`, `kShare` (DualShock 4) ya da `kCreate` (DualSense), `kPS`, `kOptions`, `kL1`, `kR1`, `kL3`, `kR3`, `kDpadUp`, `kDpadDown`, `kDpadLeft`, `kDpadRight`, `kTouchpad`, `kMicrophone`, `kRightPaddle1`, `kLeftPaddle1`, `kLeftFunction`, `kRightFunction`. `kL2` ve `kR2` yalnız `NiDsPS4Controller` ve `NiDsPS5Controller`'da vardır. | `PS` |
| PlayStation kumandalarında `BooleanEvent PS(EventLoop*)` | `PSButton(EventLoop*)` | `PS` |
| `Command...` PlayStation sarmalayıcılarında `Trigger PS(EventLoop*)` | `PSButton(EventLoop*)` | `PS` |

- PlayStation satırları beş sınıfı kapsar: `DualShock4Controller`, `DualSenseController`, `DualSenseEdgeController`, `NiDsPS4Controller`, `NiDsPS5Controller` ve bunların `Command...` sarmalayıcıları. Diğer kumandaların düğme adları ve bütün `Axis` adları değişmez (`Gamepad::Button::FACE_DOWN`, `DualShock4Controller::Axis::LEFT_X`). İlk üç sınıfta L2 ve R2 düğme değil eksendir (`Axis::L2`, `Axis::R2`). `NiDs...` sınıflarını Probot Driver Station'da kullanma: [Kumanda farkları](#kumanda-farklari).
- Birimlerde tek fark: petasiemens kısaltması `prosdk::units::PS` yazılamaz. Yerine `prosdk::units::petasiemens_t` ya da `petasiemens` yaz.
- Arduino'nun `Preferences` kütüphanesi genel bir `::Preferences` sınıfı tanımlar. `using namespace prosdk;` ile `<Preferences.h>` aynı sketch'teyse `prosdk::Preferences` yaz.

Eski adı yazarsan derleme `expected unqualified-id before numeric constant` hatasıyla durur. Altındaki `note: in expansion of macro 'HIGH'` satırı çakışan makroyu gösterir.

Yeni adlarla bir örnek: kumanda 0,5 saniye bağlı değil kalırsa **Veri** sekmesinde hata seviyesinde bir uyarı çıkar. Kumanda 500 ms veri göndermeyince bağlı değil sayıldığı için uyarı kopmadan yaklaşık 1 saniye sonra görünür.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/math/filter/Debouncer.hpp>
#include <prosdk/util/Alert.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  void RobotPeriodic() override {
    // Bağlantı durumu 0,5 saniye aynı kalınca uyarı açılır ya da kapanır
    m_uyari.Set(m_baglantiYok.Calculate(!m_gamepad.IsConnected()));
  }

 private:
  prosdk::Gamepad m_gamepad{0};
  // WPILib: DebounceType::BOTH
  prosdk::math::Debouncer m_baglantiYok{0.5_s, prosdk::math::Debouncer::DebounceType::kBoth};
  // WPILib: Alert::Level::HIGH
  prosdk::util::Alert m_uyari{"kumanda", "Kumanda bağlı değil", prosdk::util::Alert::Level::kHigh};
};

PROSDK_ROBOT_MAIN(Robot)
```

Uyarı **Veri** sekmesinde `/Telemetry/Alerts/Alerts` altında görünür: [Widget'la göster](veri-goster.md#widget).

## Robot sınıfı ve zamanlama {#robot-sinifi}

Robot kodu Probot Core'un döngüsünün içinde çalışır. Bu yüzden programın giriş noktası ve döngüsü WPILib'den farklıdır.

| WPILib 2027 | prosdk |
|---|---|
| `int main() { return wpi::StartRobot<Robot>(); }` | Sketch'in son satırı `PROSDK_ROBOT_MAIN(Robot)`. `setup()` ve `loop()` de yazılmaz; onları Probot Core tanımlar. |
| `TimedRobot`, `TimesliceRobot`, `OpModeRobot` | Üçü de desteklenir: [Robot sınıfını seç](robot-sinifini-sec.md#sinif). |
| `RobotBase`'ten doğrudan türeyen sınıf, kendi `StartCompetition()` döngüsü | Derlenir ama robot açılınca durur. Konsola `derives from RobotBase directly` içeren bir satır yazar. |
| Robot nesnesi `StartRobot` içinde kurulur | Kart açılınca, Probot Core'un kullanıcı görevinde (user task) kurulur. |
| Döngü kendi iş parçacığında, kendi zamanlayıcısıyla döner | Döngü Probot Core'un turlarında döner. Tur süresi, bütün periyot ve kaydırmaların milisaniye cinsinden en büyük ortak bölenidir: [Döngü süresini ayarla](robot-sinifini-sec.md#dongu-suresi). |
| Ana döngü süresi | 1 ms ile 1000 ms arasında olmalı. Dışındaysa program açılışta durur. |
| `AddPeriodic` süresi | 1 ms'den kısa bir süre her turda bir kez çalışır. Tam milisaniye olmayan bir süre en çok bir tur geç çalışır. İkisinde de konsola bir kez mesaj yazılır. |
| Geciken tur | Telafi edilmez (WPILib'de de edilmez). Konsola saniyede en çok bir uyarı yazılır. |
| Kurucu ya da döngü istisna fırlatınca program sonlanır | Program durur, çıkışlar kart yeniden başlayana kadar kapalı kalır, Probot Core çalışmaya devam eder: [Kod hata fırlatırsa](robot-sinifini-sec.md#halt). |
| `RobotBase::IsReal()` | Kartta `true`. |
| `RobotBase::GetThreadId()` | Kartta `std::thread::id{}`. |
| Utility modu | `TimedRobot` ve `TimesliceRobot`'ta prosdk, kurucu bittikten sonra Driver Station'a **Utility** seçeneğini kendisi ekler: **Utility**'yi seç, **Init**'e, sonra **Start**'a bas. `OpModeRobot`'ta **Utility**, kod bir utility OpMode'u ekleyip `PublishOpModes()`'u çağırınca görünür: [Programları listeden seç](robot-sinifini-sec.md#opmoderobot). |

## Gelmeyen ya da kısıtlı parçalar {#gelmeyenler}

| WPILib parçası | prosdk'de | Kullanırsan |
|---|---|---|
| NetworkTables (ntcore, wpinet), NT4 sunucusu | Yok. Telemetri ve tunable'lar Driver Station'ın **Veri** sekmesine gider: [Telemetri ve ayar değerlerini göster](veri-goster.md). | NetworkTables başlıkları yok, derleme durur. AdvantageScope ve Elastic robota canlı bağlanamaz. Kayıt (`.wpilog`) dosyalarını indirip AdvantageScope'ta açarsın: [Dosyaları indir](kayit-tut.md#dosyalari-indir). |
| `NetworkButton`, `NetworkBooleanEvent` | Var, tunable üzerinden. Değer **Veri** sekmesinde `/Tunables/<ad>` altında yazılabilir bir doğru/yanlış kutusudur. Tetikleyici, değer doğruyken ve Driver Station bağlıyken doğru olur. | NetworkTables nesnesi alan kurucular kaldırıldı, derleme durur. Ad (yol) alan kurucuyu kullan. |
| Dashboard OpMode seçicisi (`InitializeDashboardOpMode`, `SetDashboardOpModeOptions`, `GetDashboardSelectedOpMode` ...) | Derlenir, bir şey yapmaz. | `GetDashboardSelectedOpMode` hep 0 döner. Program Driver Station'daki listeden seçilir. |
| Kamera (cscore, cameraserver) | Yok, cscore ve cameraserver taşınmadı. AprilTag dedektörü vardır, gri tonlu görüntü alır. | Başlıklar yok, derleme durur. |
| Pnömatik (`Solenoid`, `DoubleSolenoid`, `Compressor`, PCM, PH), `PowerDistribution` (PDP/PDH) | Derlenir. | Nesne kurulurken hata, robot programı durur: [Kitte olmayan donanımı kullanma](pinleri-kullan.md#desteklenmeyen). |
| `OnboardIMU` | Derlenir, kurulur. Pulse kartında IMU ya da başka bir I2C sensörü yok. | `GetYaw()` ve `GetRotation2d()` hep 0 döner, `ResetYaw()` bir şey yapmaz. Diğer okumalar hata fırlatır; yakalanmazsa robot programı durur. Yerine kitin IMU'sunu kullan, ör. J3'e (I2C port 0: SDA 1, SCL 2) bağlı bir MPU-6050: `prosdk::MPU6050 imu{prosdk::I2C::Port::PORT_0};`. Okuma fonksiyonları aynıdır: [MPU-6050'yi oku](surucu-kullan.md#mpu6050). |
| `SerialPort::Port::USB`, `USB_1`, `USB_2` | Robotta yok. Pulse'un USB-C portu kod yüklemeye ve `Serial`'a ayrılmıştır. | Nesne kurulurken hata, robot programı durur. `ONBOARD` (UART1, varsayılan RX 10 / TX 11, Pulse'un J4 konnektörü) ya da `MXP` (UART2, varsayılan pini yok) kullan: [Donanım birimlerinin sınırına dikkat et](pinleri-kullan.md#kapasite). |
| FRC CAN cihazları (Talon, Spark, PCM, PH, PDP, PDH) | CAN, ESP32-S3'ün TWAI birimiyle ve harici bir alıcı-vericiyle (transceiver) çalışır, yalnız klasik CAN. Pinleri ve hızı `prosdk::platform::SetCanConfig(tx, rx, bitrate)` ile ver; vermezsen CAN çağrıları hata verir: [Donanım birimlerinin sınırına dikkat et](pinleri-kullan.md#kapasite). Veriyolu doluluğu hep 0 okunur. FRC CAN heartbeat gönderilmez. | Bu cihazlar devre dışı kalır ya da hata verir. |
| Kesmeler (interrupt) | WPILib 2027'de de yok. | Girişi her turda oku: [Kitte olmayan donanımı kullanma](pinleri-kullan.md#desteklenmeyen). |
| `DigitalOutput::Pulse()`, `EnablePPS()` | Derlenir. | Hata, robot programı durur. |
| REV Expansion Hub, Romi, XRP | Yok. | Başlıklar yok, derleme durur. |
| Saha resimleri | Yok. Sahaların AprilTag konumları vardır (`prosdk::fields`). | `GetFieldImages()` ve `GetFieldImage()` hep boş döner. `GetResource_..._png()` ya da `_jpg()` çağrısı bağlama (link) hatası verir. |
| FMS (saha yönetim sistemi) | Yok. Maç bilgisini Driver Station'da sen yazarsın: [Farklı çalışanlar](#farkli-calisanlar). | `IsFMSAttached()` hep `false` döner. |
| Masaüstü simülasyonu ("Simulate Robot Code"), halsim eklentileri | Yok. Sketch yalnız ESP32-S3 için derlenir. | `...Sim` sınıfları robotta bir şey yapmaz. |
| Glass, OutlineViewer, DataLogTool, SysId uygulaması, wpical | Bilgisayar araçlarıdır, kütüphanede yok. | `SysIdRoutine` ve `SysIdRoutineLog` robotta çalışır; kayıtlar masaüstü SysId aracında açılır. |
| Java, Python, JNI, commandsv3, epilogue, wpiunits | Yok. Yalnız C++. | |

Robot programının durması ve konsol mesajları: [Robot programı durdu](sorunlar.md#halted).

### Kumanda farkları {#kumanda-farklari}

Kumandalar Driver Station'ı açan tarayıcıya bağlanır. prosdk onları WPILib'in `Gamepad` düzenine çevirir.

| Konu | prosdk'de |
|---|---|
| Portlar | Port 0-5, Driver Station'ı açan tarayıcıya bağlı kumandalar. |
| Kumanda sınıfı | `Gamepad`, komut tabanlı kodda `CommandGamepad`. `XboxController`, `DualShock4Controller`, `DualSenseController`, `DualSenseEdgeController` ve `Command...` sürümleri aynı düzenden okur. `NiDsXboxController`, `NiDsPS4Controller`, `NiDsPS5Controller`, `NiDsStadiaController` ve `CommandNiDs...` sınıflarını kullanma: eski NI Driver Station'ın numaralarını beklerler ve Probot Driver Station'da yanlış düğmeleri okurlar. |
| Düğme ve eksen | Her kumanda WPILib'in `Gamepad` düzeninde: 15 düğme, 6 eksen. Düğmeler WPILib 2027'deki gibi 0'dan başlar (`GetRawButton(0)` = `FACE_DOWN`). Y ekseni aşağı itince artı. Tetikler 0 ile 1 arası. `Joystick::GetTrigger()` ve `GetTop()` 1 ve 2 numaralı düğmeyi okur; kumandada bunlar **B** / **Circle** ve **X** / **Square** düğmeleridir. |
| `GUIDE` (`GetGuideButton()`) | Kumandanın ortasındaki Home, Xbox ya da PS düğmesi. 17'den az düğme bildiren kumandada hep `false` okunur. İşletim sistemi, Steam ya da tarayıcı bu düğmeyi kendisi kullanırsa basış robota gelmez; sık kullanılan işlere **Back** ya da **Start**'ı ver. |
| POV | POV 0, kumandanın 8 yönlü D-pad'i. Çaprazda iki D-pad düğmesi birden basılı okunur. |
| Bağlantı kopması | Kumandadan 500 ms veri gelmezse kumanda bağlı değil sayılır. |
| Kumanda adı (`GetName()`) | Tarayıcının verdiği ad, en çok 63 bayt. |
| Kumanda türü (`GetGamepadType()`) | Tarayıcı standart düzeni bildirirse `GenericHID::HIDType::STANDARD`, yoksa `UNKNOWN`. |
| `SetRumble`, `SetLeds`, dokunmatik yüzey | Derlenir, bir şey yapmaz. Dokunmatik yüzey verisi gelmez. |
| 14'ten büyük numaralı düğmeler | Dokunmatik yüzey düğmesi, mikrofon, arka paddle'lar ve fonksiyon düğmeleri (`kTouchpad`, `kMicrophone`, `kRightPaddle1`, `kLeftPaddle1`, `kLeftFunction`, `kRightFunction`) robota gelmez. Hep `false` okunur ve **Veri** sekmesinde `not available` uyarısı çıkar. |

Ayrıntı: [Kumandayı ve Driver Station'ı kullan](kumandayi-oku.md#kumanda-duzeni).

### Farklı çalışanlar {#farkli-calisanlar}

Bu sınıflar derlenir ve çalışır, ama davranışları WPILib'den farklıdır.

| Konu | prosdk'de |
|---|---|
| Konsol çıktısı | Kütüphane mesajları, `WPILIB_ReportError` ve `WPILIB_ReportWarning` Driver Station'daki **Robot Console**'a seviyeleriyle gider: [Konsola yaz](kumandayi-oku.md#konsol). `Serial.print` ve `prosdk::util::print` Driver Station'a gitmez. `Serial.print`, **USB CDC On Boot: Enabled** ayarıyla Pulse'un USB-C portuna yazar (Arduino IDE'de **Serial Monitor**), **Disabled** ayarıyla J4'teki GPIO 43'e (TX): [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). USB-C portu açık kalıp okunmazsa her `Serial` yazması en çok yaklaşık 100 ms bekler; sığmayan metin atılır. `prosdk::util::print` standart çıktıya (stdout), yani ESP-IDF konsoluna yazar ve bu ayardan etkilenmez. Bu konsol J4'teki GPIO 43'tür (TX), ikinci çıkışı USB-C portudur. |
| Driver Station bağlantısı koparsa | Robot o an disabled olmaz. Yaklaşık 0,5 saniye sonra kumanda değerleri sıfırlanır. Probot Core'un varsayılan ayarıyla 5 saniye hiçbir şey gelmezse Driver Station robottan ayrılmış sayılır; robot disabled olur ve çıkışlar kapanır: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi). |
| Maç bilgisi (`MatchState::GetAlliance()`, `GetLocation()`, `GetGameData()`, `GetEventName()`, `GetMatchType()`, `GetMatchNumber()`) | Driver Station'da **Dashboard** sekmesindeki **Maç Bilgisi** kartında yazılır. Robot dururken ya da otonomla teleop arasında değiştirilebilir. Kartın belleğinde tutulur: yeniden başlatınca Driver Station değerleri yeniden gönderene kadar boş kalır. Kayda yazılmaz: [Maç bilgisini oku](kumandayi-oku.md#mac-bilgisi). |
| `Preferences` | Ayarlar kartın kalıcı belleğinde (NVS) tek bir kayıtta tutulur, her değişiklikte yeniden yazılır. Değişen bir değeri her turda yazma: [Preferences ile ayar sakla](veri-goster.md#preferences). |
| Komut ve alt sistem adları | RTTI kapalı olduğu için adlar WPILib C++'tan farklıdır. Ayrıntılar tablonun altında. |
| `prosdk::util::GetTypeName()` | Nesnenin gerçek türünü değil, değişkenin yazılan türünü döner. |
| `DriverStationDisplay` | Metin **Dashboard** sekmesindeki **Robot Ekranı** kartında ve **Veri** sekmesinde `/Telemetry/DriverStationDisplay` altında görünür; konsola ve kayda gitmez: [Robot Ekranı'na yaz](kumandayi-oku.md#metin-ekrani). Ekran 48 satır ve 160 sütundur, renkler atılır. Varsayılan `PROBOT_DASH_MAX_VALUE` ile dolu satırların yalnız son 6'sı sığar: [Robot Ekranı için boyut seç](veri-goster.md#robot-ekrani-boyut). |
| `DataLogManager` | Kayıt LittleFS'e ya da SD karta yazılır; prosdk LittleFS'i kendisi bağlamaz. Ayrıntılar tablonun altında. |
| Eigen matrisini yazdırma | `operator<<` yok. `std::format` ile `<prosdk/math/fmt/Eigen.hpp>` başlığını kullan. |
| `GetStackTrace()` | Yalnız adresler (`0x...`). |
| `SerialPort::SetReadBufferSize()`, `SetWriteBufferSize()` | Etkisi yok. Tamponlar her yönde 1 KiB. |
| `RobotController::GetComments()` | Hep `""`. |
| `RobotController::GetBatteryVoltage()` | Probot Core'un pil okuması. Sketch'te `PROBOT_BATTERY_ADC_PIN` ya da `PROBOT_BATTERY_INA` tanımlı değilse hep 0 V okunur. Pulse'un J1 batarya girişinin hangi GPIO'dan ölçüldüğü henüz bilinmiyor. `PROBOT_BATTERY_INA` ile Probot Core 0.5.0 sensörü J3'te (SDA 1, SCL 2), prosdk'nin I2C port 0'ıyla aynı hatta okur; ikisi birlikte çalışır. Sensör açıkken bu hat 400 kHz yerine 100 kHz'de çalışır. ProHub da bu hattadır, adres çakışmasına dikkat et: [ProHub kartını kullan](surucu-kullan.md#prohub). |
| `RobotController::IsBrownedOut()` | Pil okumasından hesaplanır (varsayılan 6,75 V, toparlanma 7,25 V). Yalnız bildirir, çıkışları kesmez. Pil okuması yoksa hep `false` döner. |

`DataLogManager` için:

- LittleFS'i sınıfın ilk üyesinde bağla: `bool m_fs = LittleFS.begin(true);`. Kurucuda `prosdk::DataLogManager::Start()`'ı çağır: [Kaydı LittleFS'e yaz](kayit-tut.md#littlefs).
- LittleFS bağlı değilse kayıt hiçbir yere yazılmaz, konsola bir satır düşer.
- SD kartı `prosdk::platform::MountSdCard(bus, cs)` ile bağla. Pulse'ta SPI bus 0'ın varsayılan pinleri J5'tedir (SCK 17, MOSI 15, MISO 16). CS pinini `MountSdCard`'a sen verirsin; J5'teki CS pini GPIO 7'dir: `MountSdCard(0, 7)`. Başka pinlerde önce `prosdk::platform::SetSPIPins`'i çağır. Sonra `prosdk::platform::SetLogDirectory("/sd/logs")`'u çağır: [Kaydı SD karta yaz](kayit-tut.md#sd-kart).
- Dosyalar **Logs** sekmesinden robot boştayken indirilir: hiç **Init**'e basılmamışken, **Stop**'tan sonra ya da otonom ile teleop arasında. **Emergency Stop**'tan sonra kartı yeniden başlat, sonra indir; tarihli adlı kayıtlar korunur: [Dosyaları indir](kayit-tut.md#dosyalari-indir).
- Telemetri kayda kendiliğinden kopyalanmaz: [Telemetriyi kayda kopyala](kayit-tut.md#nt-kaydi).

Komut ve alt sistem adları için:

- Komutun adı kendi sınıfının adıdır (ör. `prosdk::cmd::InstantCommand`). WPILib C++'ta her komutun adı `wpi::cmd::Command` olur.
- `Subsystem`'i doğrudan uygulayan sınıfın adı `prosdk::cmd::Subsystem` olur. WPILib'de gerçek sınıf adıdır.
- Ad vermezsen `SubsystemBase`'ten türeyen her alt sistemin adı WPILib'deki gibi `prosdk::cmd::SubsystemBase` olur.
- Adı kurucunun başlatıcısında ver: `Surus() : SubsystemBase{"Surus"} {}`. Gövdede çağrılan `SetName()` bir `SysIdRoutine` üyesi için geç kalır: [Alt sistemi yaz](komut-tabanli-yaz.md#alt-sistem).

## Bellek sınırları {#bellek-sinirlari}

prosdk, WPILib'in roboRIO için seçtiği tampon ve yığın boyutlarını ESP32-S3 için küçültür. Sınırlar aşağıda.

| Kaynak | Sınır | Not |
|---|---|---|
| Program alanı (flash) | 3.145.728 bayt | Pulse'un 4 MB flash belleğinde **Huge APP** bölümlemesiyle: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). Probot Core tek başına yaklaşık 1,08 MB tutar. Örnek sketch'ler 1,6-2,3 MB'tır. |
| Statik RAM | 327.680 bayt | Örneklerin genel değişkenleri yaklaşık 72-78 KB tutar. Robot çalışırken ayrıca heap kullanır. |
| PSRAM | 2 MB | Pulse'un modülündeki dört hatlı (quad) PSRAM. 4 KiB'tan büyük heap ayırmaları buraya gider; DMA tamponları iç RAM'de kalır. |
| Robot kodunun yığını | 24.576 bayt | `PROBOT_USER_STACK`. Kurucu ve döngü fonksiyonları bu yığında çalışır. Probot Core'un kendi varsayılanı 8192 bayttır; `<prosdk.h>` onu 24.576'ya çıkarır. En az 4096 bayt olmalı. |
| Kayıt (DataLog) tamponları | 2 KiB'lık bloklar; 32 KiB bekleyen veride kayıt duraklar | [Kayıt sınırlarını bil](kayit-tut.md#kayit-sinirlari). Sketch'te değiştirilemez. |
| Driver Station topic'leri | 128 topic, değer başına 1024 bayt, toplam 32.768 bayt | [Sınırları büyüt](veri-goster.md#sinirlar). |
| LittleFS dosya alanı | 896 KiB | Pulse'un 4 MB flash belleğinde **Huge APP** bölümlemesiyle. |
| Eigen geçici matrisleri | 4 KiB | Daha büyük dinamik geçici matrisler heap'e gider. 8192 bayttan büyük sabit boyutlu bir Eigen nesnesi derlenmez (`OBJECT_ALLOCATED_ON_STACK_IS_TOO_BIG`). |
| Sleipnir | | Her iş parçacığında yaklaşık 800 KB'lık bellek havuzu yerine her ifade için ayrı `new` kullanır. |
| Saha verisi | 70.239 bayt flash | `prosdk::fields::GetField()` çağrılınca 18 sahanın hepsi programa girer. |
| AprilTag tespiti | Küçültülmüş görüntünün her pikseli için en az 8 bayt heap | 320x240 görüntüde, varsayılan küçültmeyle (`quadDecimate` 2) yaklaşık 150 KB; küçültmesiz yaklaşık 600 KB. Bu büyüklükteki ayırmalar Pulse'un PSRAM'ine gider. |

Yığını değiştirmek için değeri `#include <prosdk.h>` satırından önce yaz:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#define PROBOT_USER_STACK       32768         // robot kodunun yığını, bayt (varsayılan 24576)
#include <prosdk.h>
```

Öykünücüde (QEMU, Probot Core olmadan) ölçülen en yüksek yığın kullanımı: LQR, Kalman filtresi, Sleipnir ve yörünge hesabı yapan kodda 12,5 KB, `TimedRobot` döngüsünde 5,5 KB. Ağır matematik yapan kodda yığını azaltma.

prosdk'nin kendi iş parçacıklarının yığınları kütüphane arşiviyle birlikte derlenmiştir, sketch'te değiştirilemez:

| İş parçacığı | Yığın (bayt) |
|---|---|
| `Notifier` (senin fonksiyonunu çalıştırır) | 8192 |
| `Watchdog` | 6144 |
| Driver Station mod iş parçacığı | 6144 |
| `DataLogManager` | 8192 |
| DataLog yazıcısı | 6144 |
| Diğer `SafeThread`'ler | 4096 |
| AprilTag dedektörü (`numThreads` 1'den büyükse, iş parçacığı başına) | 8192 |

Bu iş parçacıkları işlemcinin 1 numaralı çekirdeğinde çalışır. Öncelikleri Probot Core'un kontrol görevinden düşük, robot kodunun çalıştığı kullanıcı görevinden yüksektir. Bu yüzden bir `Notifier` fonksiyonu robot kodunu bekletip araya girebilir.

## Sonraki adım

[Örnek listesi](ornek-listesi.md)
