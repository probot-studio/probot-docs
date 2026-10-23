# Kumandayı ve Driver Station'ı kullan

Bu sayfada kumandanın çubuk, tetik ve düğmelerini `prosdk::Gamepad` ile okuyacaksın. Driver Station'ın maç bilgisini okuyacak, konsoluna ve **Robot Ekranı**'na yazacaksın.

## Başlamadan önce

- İlk robot kodunu yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Probot Core 0.5.0 ya da daha yeni kurulu: [Kütüphaneyi kur](kur.md#kutuphane).
- Driver Station'ı açmayı ve kumandayı bağlamayı biliyorsun: [Robotun ağına bağlan](../core/ilk-10-dakika.md#robotun-agina-baglan), [Kumandayı bağla](../core/ilk-10-dakika.md#kumandayi-bagla).

Bu sayfadaki davranış kaynak koddan yazıldı. prosdk henüz gerçek bir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da denenmedi; gerçek bir kumandayla da denenmedi.

Probot Core ile kod yazdıysan dikkat et: prosdk kumandayı WPILib'in düzeninde verir. Çubuğu ileri itince Y değeri **eksi** okunur ve düğme numaraları farklıdır.

## Kumandaları portlara yerleştir {#portlar}

prosdk 0'dan 5'e kadar 6 port okur. Port numarasını `prosdk::Gamepad gamepad{0};` satırındaki sayı belirler.

Driver Station port 0'a etkin kaynağı koyar: **Raw Data** listesinde seçili kumanda ya da açtığın klavye veya dokunmatik. Öteki kumandalar boş olan en küçük porta (1-5) yerleşir ve çıkarılana kadar orada kalır.

1. Kumandaları Driver Station'ı açtığın cihaza bağla.
2. Her kumandada bir düğmeye bas. Tarayıcı kumandayı ilk basışta tanır.
3. **Joystick** sekmesine bas.
4. **Raw Data** kartındaki listeden sürücü kumandasını seç.

Sonuç: **Input Source** kartında **Gamepad**'in yanında "Etkin" yazar. Öteki kumandalar onun altında "Port 1: ...", "Port 2: ..." diye listelenir. `prosdk::Gamepad ikinci{1};` "Port 1:" satırındaki kumandayı okur.

Klavye ya da dokunmatik açıkken port 0'ı o kaynak alır ve seçili kumanda da 1-5 arasındaki bir porta geçer. Klavye tuşları: [Kumandasız sür](../core/kumandayi-oku.md#kumandasiz-sur).

Bir kumandadan 500 ms veri gelmezse o port bağlı değil sayılır. Bu durumda bütün eksenler 0, bütün düğmeler `false` okunur. Bluetooth bağlantısı kopan kumanda böyle görünür.

`gamepad.GetHID().GetName()` tarayıcının kumandaya verdiği adı döner. Ad en çok 63 bayttır.

## Düğmeye basınca konsola yaz {#ornek}

Bu örnek **A**'ya her basışta konsola bir bilgi satırı, **B**'ye basınca sol çubuğun Y değerini uyarı olarak yazar. Motor sürmez, Pulse kartı tek başına yeter.

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil ve aşağıdaki kodu yapıştır.
3. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
4. Driver Station'da **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
5. **Init**'e bas.
6. Aynı düğmede yazan **Start**'a bas.
7. Kumandada **A**'ya, sonra **B**'ye bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/platform/Console.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  void TeleopPeriodic() override {
    // Basıldığı turda bir kez true döner; basılı tutmak tekrar yazmaz.
    if (gamepad.GetFaceDownButtonPressed()) {
      prosdk::platform::ConsoleWrite("A'ya basıldı");  // bilgi seviyesi
    }

    if (gamepad.GetFaceRightButtonPressed()) {
      // printf biçimi; uyarı seviyesi
      probot::console::warning("Sol çubuk Y = %.2f", gamepad.GetLeftY());
    }
  }

 private:
  prosdk::Gamepad gamepad{0};  // port 0
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Logs** sekmesindeki **Robot Console** kartında `A'ya basıldı` satırı çıkar. **B**'ye basınca `Sol çubuk Y = 0.00` satırı çıkar. Sol çubuğu ileri itip **B**'ye basarsan değer eksi olur.

`probot::console` Probot Core'un konsoludur. `<prosdk.h>` onu da getirir, ayrıca bir satır eklemen gerekmez.

## Çubukları ve tetikleri oku {#kumanda-duzeni}

prosdk her kumandayı WPILib'in `Gamepad` düzenine çevirir: 6 eksen, 15 düğme (D-pad'in dört yönü 11-14 numaralı düğmelerdir) ve D-pad'i tek değer olarak veren bir POV. Eksenler `double` döner.

Bu rehber `prosdk::Gamepad`'ı, komut tabanlı kodda `prosdk::cmd::CommandGamepad`'ı kullanır. `XboxController`, `DualShock4Controller`, `DualSenseController`, `DualSenseEdgeController` ve bunların `Command...` sürümleri aynı düzenden okur, onlar da çalışır. Düğme numaraları aşağıdaki tabloyla aynıdır.

!!! warning "Dikkat"
    `NiDsXboxController`, `NiDsPS4Controller`, `NiDsPS5Controller`, `NiDsStadiaController` ve `CommandNiDs...` sınıflarını kullanma. Bunlar eski NI Driver Station'ın düğme numaralarını bekler. Probot Driver Station'da `NiDsXboxController` dört yüz düğmesi dışında her şeyi yanlış okur. `NiDsPS4Controller` ve `NiDsPS5Controller` yüz düğmelerini de yanlış okur.

| Eksen numarası | `Gamepad::Axis` | Fonksiyon | Değer |
|---|---|---|---|
| 0 | `LEFT_X` | `GetLeftX()` | -1 ile 1 arası. Sağa yatırınca artı. |
| 1 | `LEFT_Y` | `GetLeftY()` | -1 ile 1 arası. İleri itince **eksi**, geri çekince artı. |
| 2 | `RIGHT_X` | `GetRightX()` | -1 ile 1 arası. Sağa yatırınca artı. |
| 3 | `RIGHT_Y` | `GetRightY()` | -1 ile 1 arası. İleri itince **eksi**. |
| 4 | `LEFT_TRIGGER` | `GetLeftTrigger()` | 0 ile 1 arası. Bıraktığında 0, sonuna kadar basınca 1. |
| 5 | `RIGHT_TRIGGER` | `GetRightTrigger()` | 0 ile 1 arası. |

```cpp
double ileri = -gamepad.GetLeftY();           // ileri itince artı olsun diye eksiyle çarp
double sagTetik = gamepad.GetRightTrigger();  // ara değerler de gelir
```

Tetikler analogdur. Çubuk ve tetik değerlerine ölü bölge uygulanır: [Ölü bölgeyi ayarla](#olu-bolge).

Eksenin ham değeri `gamepad.GetAxis(prosdk::Gamepad::Axis::LEFT_Y)` ya da `gamepad.GetHID().GetRawAxis(1)` ile okunur. Bunlara prosdk'nin ölü bölgesi uygulanmaz.

## Düğmeleri ve D-pad'i oku {#dugmeler}

Her düğmenin üç fonksiyonu vardır. Örneğin **A** için:

- `GetFaceDownButton()`: basılıyken `true`.
- `GetFaceDownButtonPressed()`: son çağrıdan beri basıldıysa bir kez `true`.
- `GetFaceDownButtonReleased()`: son çağrıdan beri bırakıldıysa bir kez `true`.

| Numara | `Gamepad::Button` | Xbox | PlayStation | Fonksiyon |
|---|---|---|---|---|
| 0 | `FACE_DOWN` | **A** | **Cross** | `GetFaceDownButton()` |
| 1 | `FACE_RIGHT` | **B** | **Circle** | `GetFaceRightButton()` |
| 2 | `FACE_LEFT` | **X** | **Square** | `GetFaceLeftButton()` |
| 3 | `FACE_UP` | **Y** | **Triangle** | `GetFaceUpButton()` |
| 4 | `BACK` | **Back** | **Share** (DualSense'te **Create**) | `GetBackButton()` |
| 5 | `GUIDE` | **Xbox** (ortadaki düğme) | **PS** (ortadaki düğme) | `GetGuideButton()` |
| 6 | `START` | **Start** | **Options** | `GetStartButton()` |
| 7 | `LEFT_STICK` | **L3** (sol çubuğa bas) | **L3** | `GetLeftStickButton()` |
| 8 | `RIGHT_STICK` | **R3** (sağ çubuğa bas) | **R3** | `GetRightStickButton()` |
| 9 | `LEFT_BUMPER` | **LB** (sol omuz) | **L1** | `GetLeftBumperButton()` |
| 10 | `RIGHT_BUMPER` | **RB** (sağ omuz) | **R1** | `GetRightBumperButton()` |
| 11-14 | `DPAD_UP`, `DPAD_DOWN`, `DPAD_LEFT`, `DPAD_RIGHT` | D-pad | D-pad | `GetDpadUpButton()`, `GetDpadDownButton()`, `GetDpadLeftButton()`, `GetDpadRightButton()` |

15 ve üstü (`MISC_1`-`MISC_6`, kanatçıklar, `TOUCHPAD`) hiçbir kumandada gelmez.

Tablo Probot Core'un varsayılan kumanda eşlemesine göredir. Eşlemeyi `setActiveByName` ile değiştirirsen düğmeler de değişir: [Kumanda eşlemesini değiştir](../core/kumandayi-oku.md#esleme).

`GUIDE` ortadaki Home düğmesidir. Tarayıcı onu 16 numaralı düğme olarak verir, bu yüzden 17'den az düğme bildiren kumandada `false` okunur. İşletim sistemi, Steam ya da tarayıcı bu düğmeyi kendisi kullanabilir; o zaman basış robota gelmez. Sürücünün sık bastığı işler için **Back** ya da **Start**'ı seç.

Düğme numaraları **0'dan** başlar. `GetRawButton(0)` **A**'yı okur. Eski WPILib kodundaki `GetRawButton(1)` artık **B**'yi okur.

```cpp
bool a = gamepad.GetHID().GetRawButton(0);              // 0 = FACE_DOWN (A)
prosdk::POVDirection pov = gamepad.GetHID().GetPOV();   // D-pad tek değer olarak
if (pov == prosdk::POVDirection::UP_RIGHT) {
  // sağ üst çapraz
}
```

D-pad 8 yön verir, bırakılınca `CENTER` döner. Yönler: `UP`, `UP_RIGHT`, `RIGHT`, `DOWN_RIGHT`, `DOWN`, `DOWN_LEFT`, `LEFT`, `UP_LEFT`. Çapraz basışta iki D-pad düğmesi birlikte `true` olur.

`prosdk::Joystick` de aynı numaraları okur: `GetTrigger()` 1 numaralı düğmeyi (**B** / **Circle**), `GetTop()` 2 numaralı düğmeyi (**X** / **Square**) okur.

Kumandada olmayan bir düğmeyi okursan kod durmaz, `false` döner. **Veri** sekmesinde `/Telemetry/Alerts/DriverStation` altında `Joystick Button 5 on port 0 not available` gibi bir uyarı çıkar.

Komut tabanlı kodda düğmeler komut başlatır: [Komutu kumandaya bağla](komut-tabanli-yaz.md#tetikleyici).

## Ölü bölgeyi ayarla {#olu-bolge}

Çubuk bırakılınca tam 0'a dönmeyebilir. `Gamepad` mutlak değeri ölü bölgenin altında kalan değeri 0 yapar. Varsayılan ölü bölge çubuklarda 0,1, tetiklerde 0,01'dir.

Tetiklere önce Probot Core'un 0,08'lik ölü bölgesi uygulanır, prosdk'ninki onun üstüne gelir. Bu yüzden tetik 0,08'in altında ham değerde de 0 okunur ve 0,08'den küçük bir tetik ölü bölgesi bu sınırı düşürmez. Çubuklarda yalnız prosdk'nin ölü bölgesi vardır.

1. [Düğmeye basınca konsola yaz](#ornek) örneğinde `public:` satırının altına aşağıdaki kurucuyu (constructor) ekle.
2. Kodu karta yükle.
3. Driver Station'da **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
4. **Init**'e bas.
5. Aynı düğmede yazan **Start**'a bas.
6. **Joystick** sekmesinde sol çubuğu, **Axes** kartında **SOL**'un ikinci değeri yaklaşık `-0.12` olana kadar ileri it.
7. Çubuğu öyle tutarken kumandada **B**'ye bas.

```cpp
Robot() {
  gamepad.SetLeftYDeadband(0.15);   // sol çubuk Y: 0.1 yerine 0.15
  gamepad.SetRightXDeadband(0.05);
}
```

Sonuç: **Logs** sekmesindeki **Robot Console** kartında `Sol çubuk Y = 0.00` satırı çıkar. Varsayılan 0,1 ile aynı itiş `-0.02` okunurdu. Çubuk 0,15'i geçince değer eksi olur.

Fonksiyonlar: `SetLeftXDeadband`, `SetLeftYDeadband`, `SetRightXDeadband`, `SetRightYDeadband`, `SetLeftTriggerDeadband`, `SetRightTriggerDeadband`. Değer 0 ile 1 arasına sıkıştırılır. Ölü bölgenin üstündeki değerler 0'dan 1'e yeniden ölçeklenir.

## Maç bilgisini oku {#mac-bilgisi}

Driver Station'da **Dashboard** sekmesindeki **Maç Bilgisi** kartında ittifak istasyonunu, oyun verisini ve maç bilgisini yazarsın. Kod bunları `prosdk::MatchState` ile okur.

1. Aşağıdaki kodu yeni bir sketch'e yapıştır.
2. Kodu karta yükle.
3. Driver Station'da **Dashboard** sekmesinde **Maç Bilgisi** kartındaki **İstasyon** listesinden **Kırmızı 1**'i seç.
4. **Oyun verisi** kutusuna `L` yaz ve <kbd>Enter</kbd>'a bas.
5. **Match Control** bölümünde **Autonomous**'u seç.
6. **Init**'e bas.
7. Aynı düğmede yazan **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/driverstation/MatchState.hpp>
#include <prosdk/framework/TimedRobot.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  void AutonomousInit() override {
    // Maç bilgisi robot dururken değişir; her modun Init'inde yeniden oku.
    auto ittifak = prosdk::MatchState::GetAlliance();
    auto istasyon = prosdk::MatchState::GetLocation();
    auto oyunVerisi = prosdk::MatchState::GetGameData();

    const char* renk = "yok";
    if (ittifak == prosdk::Alliance::RED) {
      renk = "kırmızı";
    } else if (ittifak == prosdk::Alliance::BLUE) {
      renk = "mavi";
    }
    probot::console::info("İttifak: %s, istasyon %d, oyun verisi: %s", renk,
                          istasyon.value_or(0), oyunVerisi.value_or("yok").c_str());
  }
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Logs** sekmesindeki **Robot Console** kartında `İttifak: kırmızı, istasyon 1, oyun verisi: L` satırı çıkar.

| **Maç Bilgisi** kartında | Fonksiyon | Boşken döndüğü |
|---|---|---|
| **İstasyon** (**Kırmızı 1**-**3**, **Mavi 1**-**3**) | `GetAlliance()`: `Alliance::RED` ya da `BLUE`. `GetLocation()`: 1, 2 ya da 3. | `std::nullopt` |
| **Oyun verisi** | `GetGameData()` | `std::nullopt` |
| **Maç türü** (**Antrenman**, **Sıralama**, **Eleme**) | `GetMatchType()`: `MatchType::PRACTICE`, `QUALIFICATION` ya da `ELIMINATION` | `MatchType::NONE` |
| **Etkinlik** | `GetEventName()` | `""` |
| **Maç no** (0-65535) | `GetMatchNumber()` | `0` |
| **Tekrar no** (0-255) | `GetReplayNumber()` | `0` |

- Kart yalnız robot dururken değişir: **Init**'ten önce ya da otonom ile teleop arasında. Robot çalışırken alanlar kilitlidir. Kod, değişikliği bir sonraki turda görür; otonom ile teleop arasındaki değişikliği almak için değeri her modun `Init` fonksiyonunda oku.
- **Oyun verisi** ve **Etkinlik** en çok 64 bayttır. **ç**, **ş**, **ğ**, **ı**, **ö**, **ü** ikişer bayt sayılır.
- Bilgi robotun belleğinde durur. Robot yeniden başlayınca boşalır. Driver Station açık kaldıysa son bilgiyi aynı robota yeniden gönderir.
- Maç bilgisi `.wpilog` kaydına girmez.

## Konsola yaz {#konsol}

Kodun yazdığı satırlar Driver Station'da **Logs** sekmesindeki **Robot Console** kartında görünür. `Serial.print`, `printf` ve `prosdk::util::print` oraya gelmez; bunlar kartın seri çıkışına yazar. **USB CDC On Boot: Enabled** ayarıyla `Serial.print` Pulse'un USB-C portundan Arduino IDE'nin **Serial Monitor**'üne gelir: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme).

| Çağrı | Seviye | Not |
|---|---|---|
| `prosdk::platform::ConsoleWrite(metin)` | Bilgi | `<prosdk/platform/Console.hpp>` ister. İkinci parametre `prosdk::platform::ConsoleLevel::kWarning` ya da `kError` olabilir. |
| `probot::console::info(biçim, ...)` | Bilgi | `printf` biçimi. Satır en çok 512 bayt, fazlası kesilir. |
| `probot::console::warning(biçim, ...)` | Uyarı | Aynı. |
| `probot::console::error(biçim, ...)` | Hata | Aynı. |
| `WPILIB_ReportWarning(biçim, ...)` | Uyarı | `<prosdk/system/Errors.hpp>` ister. Biçim `{}` yer tutucularıyla yazılır. |
| `WPILIB_ReportError(prosdk::err::Error, biçim, ...)` | Hata | Aynı. |

```cpp
prosdk::platform::ConsoleWrite("Kol sınırda", prosdk::platform::ConsoleLevel::kWarning);
probot::console::info("Hız: %.2f", hiz);
WPILIB_ReportError(prosdk::err::Error, "Kol sınırda: {}", aci);
```

- Her çağrı konsolda bir satırdır ve sondaki `\n` atılır. `ConsoleWrite` ile yazılan 512 bayttan uzun metin ise birkaç satıra bölünür.
- Kart en son 500 satırı gösterir; **Clear** kartı temizler.
- Satırın başında sıra numarası (`0001` gibi), seviye harfi (**I** bilgi, **W** uyarı, **E** hata) ve robotun açık kaldığı süre yazar.
- Uyarı ya da hata gelince, başka bir sekmedeysen **Logs** sekmesinde okunmamış sayısı belirir.
- `WPILIB_ReportError` satırı `Error at ...: Error: ...` diye, `WPILIB_ReportWarning` satırı `Warning at ...: Warning: ...` diye başlar. Altında `at 0x...` adres satırları gelir. Aynı metin 1 saniye içinde tekrar yazılmaz.
- WPILib 2026 ve öncesindeki `FRC_ReportError`'ın WPILib 2027'deki adı `WPILIB_ReportError`'dır; prosdk de bu adı kullanır: [WPILib 2026 kodundan geliyorsan](wpilib-farklari.md#wpilib-2026).
- Kesme (ISR) fonksiyonundan `ConsoleWrite` ile yazılan satır atılır. `probot::console`'u kesmeden hiç çağırma.

`DataLogManager`'ı başlattıysan `ConsoleWrite` ile yazılan satırlar `.wpilog` kaydına da girer. `probot::console` ile yazılanlar girmez: [Kayıt tut ve dosyaları indir](kayit-tut.md).

!!! warning "Dikkat"
    Konsola her turda yazma. Robottaki konsol tamponu varsayılan olarak 4096 bayttır ve dolunca en eski satırlar düşer. Driver Station onları alamadıysa "12 satır kaçırıldı (robot konsolu doldu)" gibi bir satır yazar; sayı kaçan satır sayısıdır. Tamponu büyütmek için sketch'in en üstüne, `#include <prosdk.h>` satırından önce `#define PROBOT_CONSOLE_BYTES 8192` ekle; değer 2048 ile 65536 arasında olmalı. Bir olayda bir kez yaz (ör. `...Pressed()` ile), değişen değerler için telemetri kullan: [Değerleri Veri sekmesine gönder](veri-goster.md#telemetri).

## Robot Ekranı'na yaz {#metin-ekrani}

WPILib'in `DriverStationDisplay` sınıfı Driver Station'a satır satır metin gönderir. Probot Driver Station bu metni **Dashboard** sekmesinde **Match Control** bölümünün altındaki **Robot Ekranı** kartında gösterir. Kart, robot bir metin gönderince açılır. Metin **Veri** sekmesinde `/Telemetry/DriverStationDisplay` altında da aynı biçimde görünür. Konsola ve `.wpilog` kaydına gitmez.

1. [Düğmeye basınca konsola yaz](#ornek) örneğini aç.
2. `#include` satırlarının altına `#include <prosdk/driverstation/DriverStationDisplay.hpp>` ve `#include <format>` satırlarını ekle.
3. Aşağıdaki `DisabledPeriodic()` fonksiyonunu `TeleopPeriodic()`'in altına ekle.
4. Kodu karta yükle.
5. Driver Station'da **Dashboard** sekmesine bas.

```cpp
// Robot disabled iken her turda (robot açılınca da çalışır)
void DisabledPeriodic() override {
  prosdk::DriverStationDisplay::AddData("Sol Y", std::format("{:.2f}", gamepad.GetLeftY()));
  prosdk::DriverStationDisplay::AddLine("A: otonom 1, B: otonom 2");
  prosdk::DriverStationDisplay::UpdateLines();
}
```

Sonuç: **Robot Ekranı** kartında `Sol Y : 0.00` ve `A: otonom 1, B: otonom 2` satırları görünür.

- `AddData(başlık, satır)` satırı `başlık : satır` diye yazar. Aynı başlık `UpdateLines()`'tan önce tekrar gelirse eski satırın yerine geçer.
- `UpdateLines()` en çok 230 ms'de bir gönderir. Daha erken çağrının satırları gönderilmeden silinir. Her turda çağırmak normaldir.
- Ekran 48 satır ve 160 sütundur. Yazı eşit genişlikli harflerle çıkar ve boşluklar korunur. Renkler atılır.
- Ham ANSI için `SetMode(prosdk::DriverStationDisplay::Mode::RawAnsi)`, `WriteRawAnsi(metin)` ve `ClearRaw()` var.

Metin en çok `PROBOT_DASH_MAX_VALUE` bayt olur. Varsayılan 1024 bayt, 160 sütunluk dolu satırlardan son 6'sını tutar; sığmayan üst satırlar atılır. Ekranın tamamı için sketch'in en üstüne, `#include <prosdk.h>` satırından önce `#define PROBOT_DASH_MAX_VALUE 8192` ekle; metinde Türkçe harfler varsa 16384 yaz: [Robot Ekranı için boyut seç](veri-goster.md#robot-ekrani-boyut).

Kumanda robot disabled iken de okunur. `DSGamepadChooser` bu sayede otonom seçeneklerini D-pad ile seçtirir ve **Robot Ekranı**'nda gösterir. D-pad yukarı ve aşağı listeyi, sol ve sağ seçeneği değiştirir: [Sensörler ve Driver Station](ornek-listesi.md#sensorler).

## Probot Driver Station'da olmayanlar {#olmayanlar}

- **Titreşim, kumanda ışığı, dokunmatik yüzey:** `SetRumble` ve `SetLeds` derlenir ama bir şey yapmaz. Dokunmatik yüzey verisi gelmez.
- **FMS (saha yönetim sistemi):** Robot hiçbir zaman FMS'e bağlı sayılmaz, `prosdk::RobotState::IsFMSAttached()` hep `false` döner. Maç bilgisini sen **Maç Bilgisi** kartında yazarsın: [Maç bilgisini oku](#mac-bilgisi).

## Sorun mu var?

- **Kumanda tepki vermiyor:** **Joystick** sekmesinde **Input Source** kartında **Gamepad**'in yanında "Etkin" yazdığını kontrol et. Kumandada bir düğmeye bas. Ayrıntı: [Kumanda tepki vermiyor](sorunlar.md#kumanda).
- **Veri sekmesinde `/Telemetry/Alerts/DriverStation` altında "Joystick on port 1 not available, check if all controllers are plugged in" yazıyor:** Kod port 1'i okuyor ama o portta kumanda yok. İkinci kumandayı bağla ya da koddaki port numarasını düzelt.
- **Robot ileri yerine geri gidiyor:** `GetLeftY()` ileri itince eksi döner. Değeri eksiyle çarp: `-gamepad.GetLeftY()`.
- **Yanlış düğme tetikleniyor:** Numaralar 0'dan başlar. `GetRawButton` yerine `GetFaceDownButton()` gibi adlı fonksiyonları kullan. `NiDs...` ile başlayan bir kumanda sınıfı kullanıyorsan `prosdk::Gamepad`'a geç.
- **Maç Bilgisi kartındaki alanlar soluk, değişmiyor:** Kart robot çalışırken kilitlidir. **Stop**'a bas ya da otonomun bitmesini bekle, sonra değiştir. **Emergency Stop**'a bastıysan kart robot yeniden başlayana kadar kilitli kalır: [Acil durdurmadan sonra](sorunlar.md#acil-durdurma).
- **Robot Ekranı'nda yalnız son satırlar var:** Metin `PROBOT_DASH_MAX_VALUE`'ya sığmıyor. Değeri 8192 yap; metinde Türkçe harfler varsa 16384 yap: [Robot Ekranı için boyut seç](veri-goster.md#robot-ekrani-boyut).
- **Konsolda yazdığım satır yok:** `Serial.print` konsola gelmez. `prosdk::platform::ConsoleWrite` ya da `probot::console::info` kullan.

## Sonraki adım

[Telemetri ve ayar değerlerini göster](veri-goster.md)
