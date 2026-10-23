# Kayıt tut ve dosyaları indir

Bu sayfada robotun verisini `DataLogManager` ile `.wpilog` dosyasına kaydedecek, dosyayı Driver Station'dan indirip AdvantageScope'ta açacaksın. Kayıt, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartının flash belleğindeki LittleFS alanına ya da bir SD karta yazılır.

## Başlamadan önce

- **Tools** > **Partition Scheme**'de **Huge APP (3MB No OTA/1MB SPIFFS)** seçili: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). Menüdeki "1MB SPIFFS" alanını LittleFS kullanır. Bu alan 896 KiB'tır ve kayıtlar oraya yazılır.
- İlk robot kodunu yükleyebiliyorsun: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Bilgisayarda AdvantageScope ya da WPILib'in DataLogTool aracı kurulu. prosdk bu masaüstü araçlarını içermez.

Bu sayfadaki kayıt, dosya adı ve indirme davranışı kaynak koddan yazıldı; prosdk henüz gerçek bir kartta, Pulse'ta da denenmedi. İlk denemede **Robot Console**'daki satırları bu sayfadakilerle karşılaştır.

## Kaydı LittleFS'e yaz {#littlefs}

`DataLogManager` kayıt klasörünü ilk çağrıldığı anda seçer. İlk çağrı `Start()`, `GetLog()`, `Log()`, `LogNetworkTables()`, bir `DoubleLogEntry` üyesi ya da bir SysId testi (`SysIdRoutine`) olabilir. `/littlefs` noktasına bağlı (mount) bir dosya sistemi yoksa ve `SetLogDirectory()` başka bir klasör vermediyse prosdk LittleFS'i bu ilk çağrıda kendisi bağlar. Kayıt `/littlefs/logs` klasörüne yazılır.

İlk açılışta alan boştur. prosdk alanı biçimlendirir, bağlar ve konsola şu satırı yazar:

```text
[prosdk] LittleFS: the "spiffs" partition was blank; formatted and mounted at /littlefs for the logs
```

Sonraki açılışlarda alan biçimlendirilmeden bağlanır ve eski kayıtlar yerinde kalır:

```text
[prosdk] LittleFS ("spiffs" partition) mounted at /littlefs for the logs
```

prosdk başka veri tutan bir alanı hiçbir zaman silmez. Alan bağlanamazsa bütün kayıt verisi atılır ve konsola şu satır düşer:

```text
DataLogManager: no log storage (LittleFS is not mounted); log data is discarded
```

Nedenini bu satırdan önceki `[prosdk] LittleFS:` satırı söyler: [LittleFS satırlarını oku](#littlefs-satirlari).

`Start()`'ı açılışta çağırınca `logs` klasörü her açılışta Driver Station'da görünür. `Start()` çağrılmazsa klasör, kayda ilk yazan kodla (ör. ilk SysId testiyle) birlikte görünür.

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil.
3. Aşağıdaki kodu yapıştır.
4. Kodu Pulse kartına yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
5. Telefonu ya da bilgisayarı robotun ağına bağla ve `http://192.168.4.1` adresini aç.
6. Driver Station'da **Logs** sekmesine bas.
7. **Robot Console** kartını en başa kaydır.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/datalog/DataLog.hpp>
#include <prosdk/drive/DifferentialDrive.hpp>
#include <prosdk/drivers/motor/BTS7960.hpp>
#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/system/DataLogManager.hpp>
#include <prosdk/system/RobotController.hpp>

namespace {

// Kaydı başlatır. prosdk LittleFS'i bu ilk çağrıda kendisi bağlar.
bool KaydiBaslat() {
  prosdk::DataLogManager::Start();
  // klasör adı boşsa kayıt alanı yoktur ve kayıt verisi atılır
  bool alanVar = !prosdk::DataLogManager::GetLogDir().empty();
  prosdk::DataLogManager::Log(alanVar ? "Kayıt alanı hazır, kayıt başladı"
                                      : "Kayıt alanı yok, kayıt verisi atılıyor");
  return alanVar;
}

}  // namespace

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    right.SetInverted(true);  // sağ motor ters yöne bakıyor
  }

  void TeleopPeriodic() override {
    double ileri = -gamepad.GetLeftY();
    drive.ArcadeDrive(ileri, -gamepad.GetRightX());
    ileriKaydi.Update(ileri);  // yalnız değer değişince yazar
  }

  void RobotPeriodic() override {
    pilKaydi.Update(prosdk::RobotController::GetBatteryVoltage().value());
  }

 private:
  // İlk üye: kayda yazan her şeyden önce çalışır.
  bool kayitHazir = KaydiBaslat();

  prosdk::log::DoubleLogEntry pilKaydi{prosdk::DataLogManager::GetLog(), "/robot/pil"};
  prosdk::log::DoubleLogEntry ileriKaydi{prosdk::DataLogManager::GetLog(), "/surus/ileri"};

  prosdk::BTS7960 left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN (J6)
  prosdk::BTS7960 right{35, 47, 48};  // RPWM (J6), LPWM ve R_EN + L_EN (J8)
  prosdk::DifferentialDrive drive{left, right};
  prosdk::Gamepad gamepad{0};        // Driver Station'daki ilk kumanda
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: İlk açılışta **Robot Console** kartında `[prosdk] LittleFS: the "spiffs" partition was blank; formatted and mounted at /littlefs for the logs`, `DataLog: Logging to '/littlefs/logs/WPILIB_TBD_...wpilog'` ve `Kayıt alanı hazır, kayıt başladı` satırları görünür. Sonraki açılışlarda ilk satır `[prosdk] LittleFS ("spiffs" partition) mounted at /littlefs for the logs` olur.

`KaydiBaslat()` Robot sınıfının ilk üyesidir; kayıt girişleri (`prosdk::log::DoubleLogEntry`) onun altında tanımlanır. Kayıt alanı yoksa `GetLogDir()` boş döner ve konsola `Kayıt alanı yok, kayıt verisi atılıyor` satırı düşer.

Kayıt klasörü ve kayıt parametreleri ilk `DataLogManager` çağrısında belirlenir; sonraki bir `Start()` çağrısı onları değiştirmez. Kaydı varsayılan ayarlarla LittleFS'e yazıyorsan sınıf üyelerinin sırası kaydın yerini değiştirmez: ilk gelen `DataLogManager` çağrısı LittleFS'i bağlar ve `/littlefs/logs` klasörünü seçer. Şunlar ise ilk `DataLogManager` çağrısından önce, sınıfın ilk üyesinde çalışmalı:

- Kaydı SD karta yazıyorsan `SetLogDirectory()`: [Kaydı SD karta yaz](#sd-kart).
- LittleFS'i Arduino'nun `LittleFS` kütüphanesiyle kendin bağlıyorsan `LittleFS.begin(true)`: [LittleFS satırlarını oku](#littlefs-satirlari).
- `Start()`'a parametre veriyorsan (ör. yazma aralığı) `Start()`. Bu örnek `Start()`'ı ilk üyede çağırır; [Kayıt sınırlarını bil](#kayit-sinirlari) bölümündeki parametreli `Start()` de bu yüzden çalışır.

Motor pinleri [İlk robot kodunu yaz](ilk-robotu-yaz.md#kodu-yaz) sayfasındakilerle aynıdır: sol BTS7960 J6'da GPIO 38, 37, 36; sağ BTS7960 GPIO 35 (J6), 47 ve 48 (J8). Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil; başka pinler kullanıyorsan koddaki numaraları değiştir.

Tarihli adlı kayıtlar flash'ta kalır. Yeniden başlatma, acil durdurma ve kodu yeniden yükleme onları silmez; yalnız LittleFS'te 128 KiB'tan az boş alan varsa kayıt başlarken en eskileri silinir: [Kayıt sınırlarını bil](#kayit-sinirlari). Adı hâlâ `WPILIB_TBD_` olan kayıt için: [Dosyanın adını anla](#dosya-adi). Kayıt her 0,25 saniyede bir flash'a yazılır. Kodu **Tools** > **Erase All Flash Before Sketch Upload** açıkken yüklersen ya da **Partition Scheme**'i değiştirirsen kayıtlar silinir.

`Append()` her çağrıda bir kayıt yazar, `Update()` yalnız değer değiştiğinde. Kaynak koddaki tahmine göre bir `double` kaydı yaklaşık 15 bayttır. Her 20 ms'de değişen tek bir değer saniyede yaklaşık 750 bayt yazar ve 896 KiB'lık alanı yaklaşık 20 dakikada doldurur.

### LittleFS satırlarını oku {#littlefs-satirlari}

prosdk LittleFS'i bağlamayı denediğinde **Robot Console**'a bu satırlardan birini yazar. Sketch LittleFS'i kendisi bağladıysa, `SetLogDirectory()` kaydı başka bir klasöre (ör. SD karta) yönlendirdiyse ya da `SetLogAutoMount(false)` çağrıldıysa bu satırlardan hiçbiri çıkmaz.

| Satır şununla başlar | Anlamı | Ne yap |
|---|---|---|
| `[prosdk] LittleFS: the "spiffs" partition was blank; formatted and mounted at /littlefs for the logs` | Alan boştu (ilk açılış ya da **Erase All Flash** sonrası). prosdk alanı biçimlendirdi ve bağladı. | Bir şey yapman gerekmez. Kayıt `/littlefs/logs` klasörüne yazılır. |
| `[prosdk] LittleFS ("spiffs" partition) mounted at /littlefs for the logs` | Alandaki LittleFS biçimlendirilmeden bağlandı. Eski kayıtlar yerinde. | Bir şey yapman gerekmez. |
| `[prosdk] LittleFS: the "spiffs" partition is not blank and holds no mountable LittleFS` | Alanda başka veri var: SPIFFS dosyaları, başka bir programın verisi ya da bozuk bir dosya sistemi. İlk açılıştaki biçimlendirme sırasında güç kesildiyse de bu satır çıkar. prosdk bu veriyi silmez, kayıt verisi atılır. | Alandaki veri gerekmiyorsa sketch'e `#include <LittleFS.h>` ekle ve sınıfın ilk üyesini `bool m_fs = LittleFS.begin(true);` yap. `begin(true)` alandaki her şeyi siler. |
| `[prosdk] LittleFS: the sketch uses the Arduino LittleFS library, so prosdk does not mount it` | Sketch `<LittleFS.h>`'yi ekliyor ama LittleFS'i ilk `DataLogManager` çağrısından önce bağlamadı. Bu durumda prosdk LittleFS'i bağlamaz. | Sınıfın ilk üyesini `bool m_fs = LittleFS.begin(true);` yap (alt sistemlerin ve kayıt girişlerinin üstünde). LittleFS dosyalarını kodunda kullanmıyorsan bunun yerine `#include <LittleFS.h>` satırını sil; o zaman prosdk alanı kendisi bağlar. |
| `[prosdk] LittleFS: the program uses SPIFFS` | Sketch SPIFFS kullanıyor (`<SPIFFS.h>`). SPIFFS aynı alanı kullanabilir; prosdk oraya LittleFS bağlamaz ve flash'a kayıt yazılmaz. | Kaydı SD karta yaz: [Kaydı SD karta yaz](#sd-kart). SPIFFS gerekmiyorsa `#include <SPIFFS.h>` satırını ve SPIFFS çağrılarını sil. Alan daha önce SPIFFS ile kullanıldıysa sonraki açılışta `is not blank and holds no mountable LittleFS` geçen satır çıkar; o satırın çözümünü uygula (`LittleFS.begin(true)` alanı siler). |
| `[prosdk] LittleFS: no "spiffs" data partition (partition scheme); no log storage` | Seçili bölümleme şemasında kayıt alanı yok. | **Tools** > **Partition Scheme**'de **Huge APP (3MB No OTA/1MB SPIFFS)**'i seç ve kodu yeniden yükle: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). |
| `[prosdk] LittleFS: mounting the "spiffs" partition at /littlefs failed (...)` | Bağlama başarısız oldu. Parantezin içinde hatanın adı yazar. | Kartı yeniden başlat. Satır yine çıkarsa hatayı bildir: [Hata bildir](sorunlar.md#hata-bildir). |

Sketch Arduino'nun `LittleFS` kütüphanesini kullanıyorsa (`#include <LittleFS.h>`), prosdk LittleFS'i bağlamaz; sketch onu kendisi bağlar. Sınıfın ilk üyesi `bool m_fs = LittleFS.begin(true);` olsun (alt sistemlerin ve kayıt girişlerinin üstünde). Nedeni: prosdk alanı bağladıktan sonra `LittleFS.begin()` `true` döner ama `LittleFS` ile dosya açılamaz.

prosdk'nin LittleFS alanına hiç dokunmamasını istiyorsan `#include <prosdk/platform/Storage.hpp>` ekle ve ilk `DataLogManager` çağrısından önce `prosdk::platform::SetLogAutoMount(false);` çağır. Kayıt o zaman yalnız sketch'in bağladığı ya da `SetLogDirectory()` ile verdiği klasöre yazılır; ikisi de yoksa kayıt verisi atılır.

!!! warning "Dikkat"
    `LittleFS.begin(true)` yalnız boş alanı değil, bağlayamadığı her alanı biçimlendirir. Alandaki her şey silinir: SPIFFS dosyaları, başka bir programın verisi ve eski kayıtlar. Alandaki veri sana gerekiyorsa bu satırı ekleme; kaydı SD karta yaz. Alan biçimlendirildikten sonra `#include <LittleFS.h>` ve `bool m_fs = LittleFS.begin(true);` satırlarını silebilirsin; prosdk sonraki açılışlarda alanı kendisi bağlar. `#include <LittleFS.h>` satırı sketch'te hiçbir yerde kalmamalı: bu satır kaldıkça prosdk alanı bağlamaz.

## Kaydı SD karta yaz {#sd-kart}

Uzun kayıtlar için bir SD kart kullan. SD kart SPI ile bağlanır ve FAT16 ya da FAT32 biçimli olmalıdır; exFAT desteklenmez. 32 GB ya da daha küçük bir kart kullan: daha büyük kartlar exFAT biçimli gelir ve Windows'un biçimlendirme penceresi onları FAT32 olarak biçimlendirmez. prosdk SD kartı hiçbir zaman biçimlendirmez.

Örnek, Boardoza MicroSD modülünü Pulse'un J5 konnektörüne bağlar. J5'teki pinler prosdk'nin SPI bus 0 (SPI2) için varsayılan pinleridir. Modül yalnız 5 V ile beslenir, 3,3 V girişi yoktur. Pulse'un konnektörlerinde 5 V pini yoktur; J5'te +3V3 ve GND pinleri vardır. Modülün +5V pinini J5'e bağlama: 5 V'u robotundaki bir 5 V kaynağından al ve bu kaynağın GND'sini Pulse'un GND'siyle birleştir. Kitin geri kalan elektronik şeması henüz kesin değil. Modülde SD kart takma algılama hattı yoktur: SD kartı robota güç vermeden önce tak. Konnektördeki pin sırası kartın baskısından alındı ve denenmedi; kabloları pin numarasına göre değil, karttaki GPIO ve GND yazılarına göre bağla.

| Boardoza MicroSD modülü | Pulse |
|---|---|
| 1 MISO | GPIO 16 (J5 MISO) |
| 2 SCK | GPIO 17 (J5 CLK) |
| 3 MOSI | GPIO 15 (J5 MOSI) |
| 4 CS | GPIO 7 (J5 CS) |
| 5 GND | GND (J5 GND) |
| 6 +5V | Robotun 5 V kaynağı (Pulse'ta 5 V pini yok) |

!!! note "Not"
    prosdk'nin Boardoza sensör örnekleri I2C port 1'i J5'teki GPIO 17 (SDA) ve 16 (SCL) üzerinde kullanır. SD kart J5'teyken sensörleri J3'e (I2C port 0, GPIO 1 ve 2) bağla ve koddaki portu `prosdk::I2C::Port::PORT_0` yap. Bu kılavuzdaki motor pinleri J5'i kullanmaz. Boş pinler: [Kullanılabilir pinleri seç](pinleri-kullan.md#kullanilabilir-pinler).

1. SD kartın FAT16 ya da FAT32 biçimli olduğunu bilgisayarda kontrol et. exFAT ise 32 GB ya da daha küçük bir kart al ve onu FAT32 olarak biçimlendir.
2. SD kartı Boardoza MicroSD modülüne tak.
3. Modülün GND, MISO, SCK, MOSI ve CS pinlerini tabloya göre Pulse'un J5 konnektörüne, +5V pinini robotun 5 V kaynağına bağla.
4. Aşağıdaki kodu yeni bir sketch'e yapıştır.
5. Kodu Pulse kartına yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
6. Telefonu ya da bilgisayarı robotun ağına bağla ve `http://192.168.4.1` adresini aç.
7. Driver Station'da **Logs** sekmesine bas ve **Robot Console** kartını en başa kaydır.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/datalog/DataLog.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/platform/HalConfig.hpp>
#include <prosdk/platform/SdCard.hpp>
#include <prosdk/platform/Storage.hpp>
#include <prosdk/system/DataLogManager.hpp>
#include <prosdk/system/RobotController.hpp>

namespace {

// Pulse'un J5 konnektörü (SPI bus 0'ın varsayılan pinleri)
constexpr int kSpiBus = 0;  // SPI2
constexpr int kSck = 17;
constexpr int kMosi = 15;
constexpr int kMiso = 16;
constexpr int kSdCs = 7;

// SD kartı bağlar, kayıt klasörünü karta yönlendirir, sonra kaydı başlatır.
bool SdKaydiBaslat() {
  bool sd = prosdk::platform::SetSPIPins(kSpiBus, kSck, kMosi, kMiso) &&
            prosdk::platform::MountSdCard(kSpiBus, kSdCs, "/sd");
  if (sd) {
    prosdk::platform::SetLogDirectory("/sd/logs");
  }
  // SD kart yoksa prosdk LittleFS'i bağlar, kayıt /littlefs/logs klasörüne gider
  prosdk::DataLogManager::Start();
  prosdk::DataLogManager::Log(sd ? "SD karta kayıt" : "SD kart yok");
  return sd;
}

}  // namespace

class Robot : public prosdk::TimedRobot {
 public:
  void RobotPeriodic() override {
    pilKaydi.Update(prosdk::RobotController::GetBatteryVoltage().value());
    prosdk::telemetry::Log("SD kart/Bağlı", sdBagli);
  }

 private:
  // İlk üye: SD kart ve kayıt, kayda yazan her şeyden önce hazır olur.
  bool sdBagli = SdKaydiBaslat();

  prosdk::log::DoubleLogEntry pilKaydi{prosdk::DataLogManager::GetLog(), "/robot/pil"};
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Robot Console** kartında `[prosdk] SD card mounted at /sd (... MB)`, `DataLog: Logging to '/sd/logs/WPILIB_TBD_...wpilog'` ve `SD karta kayıt` satırları görünür.

Kod, ilk üyede `SetSPIPins` ve `MountSdCard` ile SD kartı `/sd` noktasına bağlar. Bağlandıysa önce `SetLogDirectory("/sd/logs")`'u, sonra `DataLogManager::Start()`'ı çağırır; bu durumda prosdk LittleFS'i bağlamaz. Pulse'ta `SetSPIPins` varsayılan pinleri yeniden yazar; modülü başka pinlere ya da başka bir ESP32-S3 kartına bağlıyorsan sabitlerdeki numaraları değiştir.

SD kart okunamazsa `[prosdk] MountSdCard /sd: no card or no FAT file system (SPI bus 0 CS 7: ...)` satırı çıkar. `Start()` o zaman LittleFS'i bağlar ve kayıt `/littlefs/logs` klasörüne yazılır: [Kaydı LittleFS'e yaz](#littlefs). Hazır örnek: [`examples` klasöründeki](https://github.com/probot-studio/probot-sdk/tree/dev/examples) `BoardozaSdLog`. Bu örnekte de SD kart yoksa prosdk LittleFS'i bağlar ve kayıt `/littlefs/logs` klasörüne gider.

SD kartta tarihli eski kayıtlar kendiliğinden silinmez; yalnız `WPILIB_TBD_` dosyaları her açılışta silinir. SD kart dolmadan önce onu bilgisayara takıp eski dosyaları sil. Çok dosyalı bir klasörde liste kısalır: [Dosyaları indir](#dosyalari-indir).

## Telemetriyi kayda kopyala {#nt-kaydi}

`prosdk::telemetry::Log(...)` ile gönderdiğin değerler kayda da yazılabilir. Robotta bu kopya varsayılan olarak kapalıdır, çünkü flash alanını hızla doldurur. Kayıttaki adı `NT:/Telemetry/<yol>` olur; AdvantageScope WPILib robotlarının kayıtlarındaki bu adları tanır.

1. [Kaydı LittleFS'e yaz](#littlefs) bölümündeki `KaydiBaslat()` fonksiyonunda `Start()` satırının altına `prosdk::DataLogManager::LogNetworkTables(true);` satırını ekle.
2. `TeleopPeriodic()` içinde `ileriKaydi.Update(ileri);` satırının altına `prosdk::telemetry::Log("Sürüş/İleri", ileri);` satırını ekle.
3. Kodu Pulse kartına yükle.
4. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç, **Init**'e ve **Start**'a bas, robotu birkaç saniye sür, sonra **Stop**'a bas: [Teleop'ta sür](ilk-robotu-yaz.md#teleop).
5. Dosyayı indir ve AdvantageScope'ta aç: [Dosyaları indir](#dosyalari-indir).

Sonuç: Kayıt dosyasında `NT:/Telemetry/Sürüş/İleri` adlı bir giriş bulunur.

Art arda gelen eşit değerler bir kez yazılır. Bir değer, kopya açıldıktan sonra ilk gönderildiğinde kayda girer; kopya açılmadan önce bir kez gönderilen değer kayda girmez. Değerleri döngüde göndermeye devam et. Kaynak koddaki tahmine göre her 20 ms'de değişen 20 `double` değer saniyede yaklaşık 15 KB yazar ve 896 KiB'lık alanı yaklaşık bir dakikada doldurur. Az değer ya da seyrek değişen değerler kopyala, uzun kayıt için SD kart kullan.

| Kayda girer | Kayda girmez |
|---|---|
| Telemetri değerleri (`LogNetworkTables(true)` ile): `NT:/Telemetry/<yol>` | Tunable değerleri |
| Uyarılar (`prosdk::util::Alert`, `LogNetworkTables(true)` ile): `NT:/Telemetry/Alerts/<grup>` | Preferences |
| prosdk konsol çıktısı (`prosdk::platform::ConsoleWrite` ve kütüphane mesajları; `console` girişi, robotta varsayılan açık) | `DriverStationDisplay` metin ekranı |
| `DataLogManager::Log()` mesajları (`messages` girişi) | `Serial.print`, `printf`, `prosdk::util::print` ve `probot::console` çıktısı |
| `DoubleLogEntry` gibi kendi kayıt girişlerin | |

Konsol çıktısı 2048 baytlık bir tamponla kayda aktarılır. Tampon taşarsa kayda `[DataLogManager: ... bytes of console output dropped]` satırı yazılır.

## Dosyanın adını anla {#dosya-adi}

Kayıt dosyası önce `WPILIB_TBD_` ile başlayan geçici bir adla açılır. Robotun pil destekli saati yoktur. Driver Station sayfası bağlanınca tarayıcının saatini (UTC) robota gönderir.

Driver Station sayfası 1 saniyeden uzun bağlı kaldığında ve robotun saati ayarlıyken dosyanın adı `WPILIB_yyyyMMdd_HHmmss.wpilog` olur (ör. `WPILIB_20261023_141530.wpilog`). Dosya yeniden adlandırılır, içindeki veri kaybolmaz. Bunun için Driver Station sayfasının açık olması yeter; kumanda bağlaman gerekmez. Saat UTC'dir; Türkiye saatinden 3 saat geridir.

!!! warning "Dikkat"
    Kayıt başlarken robot, kayıt klasöründeki `WPILIB_TBD_` ile başlayan bütün dosyaları siler. Driver Station sayfası 1 saniyeden uzun bağlı kalmadan ya da robotun saati ayarlanmadan kapattığın oturumun kaydı (adı hâlâ `WPILIB_TBD_` olan dosya) bir sonraki açılışta silinir. Robotu kapatmadan önce dosya adının tarihe döndüğünü **Dosyalar** kartında kontrol et.

## Dosyaları indir {#dosyalari-indir}

`DataLogManager` kayıt klasörünü Driver Station'a `logs` adıyla sunar. Dosyalar **Logs** sekmesindeki **Dosyalar** kartında, **LOGS** başlığının altında listelenir; kartın altındaki yazılarda klasör `logs` olarak geçer. Liste ve indirme yalnız robot boştayken çalışır: hiç **Init**'e basılmamışken, **Stop**'tan sonra ya da otonom bitip teleop için **Init**'e basılmadan önce.

1. Driver Station'da **Stop**'a bas. Robot zaten duruyorsa bu adımı geç.
2. **Logs** sekmesine bas.
3. **Dosyalar** kartında **Yenile**'ye bas.
4. **LOGS** başlığının altında indirmek istediğin dosyanın adına bas.
5. İndirilen `.wpilog` dosyasını AdvantageScope penceresine sürükle ya da DataLogTool ile aç.

Sonuç: **Dosyalar** kartında her dosyanın boyutu, saat ayarlıyken yazılmış dosyalarda tarihi de görünür. Tarayıcı dosyayı aynı adla indirir.

Robot çalışırken dosya adları soluk görünür ve basılmaz. Kayıt sürerken indirdiğin dosya, indirme başladığı andaki boyutuyla gelir. **Init**'e basmak süren bir indirmeyi keser.

**Dosyalar** kartının altındaki yazılar:

| Yazı | Anlamı | Ne yap |
|---|---|---|
| "Robot çalışırken dosyalar listelenemez; durdurunca yenileyin." | Robot **Init** ya da **Start** durumunda. | **Stop**'a bas. **Dosyalar** kartı robot durunca kendini yeniler. |
| "Acil durdurmadan sonra dosyalar robot yeniden başlatılınca indirilir." | **Emergency Stop**'a basıldı. | **Reboot Robot**'a bas ya da Pulse kartının gücünü kapatıp aç. Tarihli adlı kayıtlar korunur, ama LittleFS'te alan azsa açılışta en eskileri silinebilir. Adı hâlâ `WPILIB_TBD_` olan kayıt silinir. |
| "Bir dosya aktarımı sürüyor; bitince yenileyin." | Aynı anda tek dosya indirilir. | İndirme bitince **Yenile**'ye bas. |
| "logs: dosya yok" | Klasör var ama kayıt dosyası açılamadı. | **Robot Console**'da `DataLog: Could not open log file` ile başlayan satıra bak. |
| "logs: klasör açılamadı" | Robot kayıt klasörünü açamadı. | SD kartın ya da LittleFS'in bağlı olduğunu kontrol et: **Robot Console**'da `[prosdk] LittleFS:` ile başlayan satıra bak ([LittleFS satırlarını oku](#littlefs-satirlari)). |
| "logs: ilk ... dosya gösteriliyor" | Klasörde çok dosya var, liste kısaltıldı. En yeni kayıtlar listede olmayabilir. | SD karttaki eski kayıtları bilgisayarda sil. |
| "Robotu başka bir sürücü istasyonu kullanıyor; dosyalar oradan indirilir." | Robotu başka bir cihaz kullanıyor. | Dosyaları o cihazdan indir. |
| "Dosya listesi alınamadı." | Robot yanıt vermedi. | Bağlantıyı kontrol et ve **Yenile**'ye bas. |

**Dosyalar** kartı hiç görünmüyorsa robot paylaşılan klasör sunmuyordur: LittleFS bağlanamamıştır ([LittleFS satırlarını oku](#littlefs-satirlari)) ya da kayıt başlamamıştır. Probot Core klasörü reddettiyse **Robot Console**'da `DataLogManager: the Driver Station cannot offer the logs in ...` ile başlayan bir satır çıkar; klasör yolu `/` ile başlasın, `.` ya da `..` adlı bir klasör içermesin ve en çok 95 bayt olsun. Sketch'in kendisi de Probot Core ile klasör paylaşıyorsa `logs` ile birlikte toplam en çok 4 klasör olabilir.

**Dosyalar** kartı bir klasörde en çok 256 dosya gösterir ve klasördeki ilk 512 girişe bakar.

## Dosya sistemini ayırmadan önce kaydı durdur {#ayirmadan-once}

prosdk bir dosya sistemini hiç ayırmaz (unmount). `MountSdCard` ile bağlanan SD kart da program bitene kadar bağlı kalır. Kodunla bir dosya sistemini ayırıyorsan (ör. `LittleFS.end()`), önce kaydı durdur, sonra Driver Station'daki indirme dosyayı bırakınca ayır.

LittleFS'i ayıran sketch onu kendisi de bağlamalı. `LittleFS.end()` çağıran sketch `<LittleFS.h>`'yi ekler ve prosdk böyle bir sketch için LittleFS'i bağlamaz: [LittleFS satırlarını oku](#littlefs-satirlari).

Aşağıdaki kod [Kaydı LittleFS'e yaz](#littlefs) bölümündeki sketch'e göredir. Sketch LittleFS'i `Start()`'tan önce kendisi bağlar. Robot dururken kumandanın **Back** düğmesi kaydı kapatır.

1. [Kaydı LittleFS'e yaz](#littlefs) bölümündeki sketch'te `#include <prosdk.h>` satırının altına `#include <LittleFS.h>` satırını ekle.
2. `KaydiBaslat()` fonksiyonunu aşağıdaki ilk kodla değiştir.
3. `TeleopPeriodic()` ve `RobotPeriodic()` fonksiyonlarını ikinci kodla değiştir.
4. İkinci koddaki `DisabledPeriodic()` ve `KaydiKapat()` fonksiyonlarını `public:` altına, iki `bool` satırını `private:` altındaki üyelerin en sonuna ekle. `kayitHazir` ilk üye olarak kalmalı.
5. Kodu Pulse kartına yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
6. Robot dururken kumandanın **Back** düğmesine bas.
7. Driver Station'da **Logs** sekmesindeki **Dosyalar** kartında **Yenile**'ye bas.

İlk kod, `KaydiBaslat()`:

```cpp
// LittleFS'i bağlar, sonra kaydı başlatır. Sıra değişmemeli.
bool KaydiBaslat() {
  // true: bağlanamayan alan biçimlendirilir, içindeki her şey silinir
  bool bagli = LittleFS.begin(true);
  prosdk::DataLogManager::Start();  // LittleFS bağlıysa kayıt /littlefs/logs klasörüne yazılır
  prosdk::DataLogManager::Log(bagli ? "LittleFS bağlı, kayıt başladı"
                                    : "LittleFS bağlanamadı, kayıt verisi atılıyor");
  return bagli;
}
```

İkinci kod, Robot sınıfının üyeleri:

```cpp
void TeleopPeriodic() override {
  double ileri = -gamepad.GetLeftY();
  drive.ArcadeDrive(ileri, -gamepad.GetRightX());
  if (kayitAcik) {
    ileriKaydi.Update(ileri);  // kayıt kapanınca girişe yazılmaz
  }
}

void DisabledPeriodic() override {
  // robot dururken Back düğmesi kaydı kapatır
  if (kayitAcik && gamepad.GetBackButtonPressed()) {
    KaydiKapat();
  }
}

void RobotPeriodic() override {
  if (kayitAcik) {
    pilKaydi.Update(prosdk::RobotController::GetBatteryVoltage().value());
  }
  // süren bir listeleme ya da indirme varsa sonraki döngüde yeniden bak
  if (ayrilacak && !probot::files::busy()) {
    LittleFS.end();
    ayrilacak = false;
  }
}

// Kaydı durdurur; LittleFS'i indirme bitince ayırır.
void KaydiKapat() {
  prosdk::DataLogManager::Stop();  // kaydı kapatır, klasörü Driver Station'dan kaldırır
  kayitAcik = false;
  ayrilacak = true;
}

bool kayitAcik = true;
bool ayrilacak = false;
```

Sonuç: **LOGS** başlığı **Dosyalar** kartından kalkar. Sketch başka klasör paylaşmıyorsa **Dosyalar** kartı da kaybolur.

`Stop()` süren bir indirmeyi en çok 1 saniye bekler. Yavaş bir tarayıcı dosyayı daha uzun açık tutabilir; Probot Core'un `probot::files::busy()` fonksiyonu bunu gösterir. Döngüde `delay()` ile bekleme, robot döngüsü durur.

!!! warning "Dikkat"
    `Stop()`'tan sonra `GetLog()` ile kurulan kayıt girişlerini (`DoubleLogEntry` gibi) kullanma; silinmiş bir kayda yazarlar. Başka bir `DataLogManager` fonksiyonunu da çağırma: her biri yeni bir kayıt başlatır, LittleFS ayrıldıysa bu kaydın verisi atılır.

## Kayıt sınırlarını bil {#kayit-sinirlari}

ESP32-S3'ün belleği roboRIO'dan çok küçüktür. prosdk kayıt tamponlarını ve eski kayıtları silme sınırlarını buna göre küçültür.

| | WPILib (roboRIO) | prosdk (ESP32-S3) |
|---|---|---|
| Tampon bloğu | 16 KiB | 2 KiB |
| Kayıt duraklamadan önce bekleyen tampon | 64 (1 MiB) | 16 (32 KiB) |
| Yazarken korunan boş alan | 5 MiB | Denetlenmez |
| Eski kayıtların silindiği boş alan | 50 MB | 128 KiB (en çok alanın yarısı) |
| Silinmeden kalan en az dosya | 10 | 3 |
| Uyarı | 100 MB altında | 256 KiB altında |

- Eski kayıtlar yalnız kayıt başlarken ve yalnız `/littlefs` altında silinir. En eski `WPILIB_*.wpilog` dosyası önce gider; `WPILIB_TBD_` dosyaları bu sıraya girmez, onlar her açılışta silinir.
- Driver Station bağlantısı kopsa da kayıt sürer. Kayıt yalnız robot döngüsü 10 saniye çalışmazsa duraklar, döngü yeniden çalışınca sürer.
- Yazarken boş alan denetlenmez. Alan dolunca her yazma başarısız olur ve konsolda `DataLog: Error writing to log file '...': ...` satırları çıkar.
- Flash yazmaya yetişemezse konsolda `DataLog: outgoing buffers exceeded threshold, pausing logging--consider flushing to disk more frequently (smaller period)` satırı çıkar. Daha az değer kaydet ya da diske yazma aralığını `Start()`'ın üçüncü parametresiyle (saniye, varsayılan 0,25) kısalt: `KaydiBaslat()`'taki `Start()` satırını `prosdk::DataLogManager::Start("", "", 0.1);` ile değiştir. İlk iki parametre boş kalmalı; dolu bir klasör adı LittleFS varsayılanını atlar: prosdk LittleFS'i bağlamaz ve klasörü oluşturmaz.
- Tampon değerleri kütüphane arşiviyle birlikte derlenmiştir. Sketch'te `#define` ile değiştirilemez.

!!! warning "Dikkat"
    Silme sırasında en az 3 tarihli kayıt kalır. Kayıtlar büyükse LittleFS açılışta da boşalmaz ve her yeni kayıt ilk yazmada başarısız olur. Driver Station dosya silemez. LittleFS'i boşaltmak için kodu bir kez **Tools** > **Erase All Flash Before Sketch Upload** > **Enabled** ile yükle, sonra bu seçeneği **Disabled** yap. Bu yükleme flash'taki her şeyi siler: bütün kayıtları, Preferences değerlerini ve kalıcı tunable'ları. Alan bundan sonra boştur; prosdk onu kayıt bir sonraki başladığında biçimlendirir ve konsolda `[prosdk] LittleFS: the "spiffs" partition was blank; formatted and mounted at /littlefs for the logs` satırı çıkar.

## Sorun mu var?

- **Konsolda "DataLogManager: no log storage (LittleFS is not mounted); log data is discarded" var:** Kayıt alanı bağlanamadı. Nedenini bu satırdan önceki `[prosdk] LittleFS:` satırı söyler: alanda başka veri var, sketch Arduino'nun `LittleFS` kütüphanesini ya da SPIFFS'i kullanıyor ya da **Partition Scheme** yanlış. `SetLogAutoMount(false)` çağrıldıysa önceki satır çıkmaz; LittleFS'i sketch bağlamalı. Ne yapacağın: [LittleFS satırlarını oku](#littlefs-satirlari).
- **Dosya adı `WPILIB_TBD_` olarak kalıyor:** Driver Station sayfası açık olmalı; ad, saat ayarlandıktan yaklaşık 1 saniye sonra değişir: [Dosyanın adını anla](#dosya-adi).
- **Dosyalar kartında hata yazısı var:** [Dosyaları indir](#dosyalari-indir) bölümündeki tabloya bak.
- Diğer kayıt sorunları: [Veri ve kayıt sorunları](sorunlar.md#veri).

## Sonraki adım

[WPILib'den farklar](wpilib-farklari.md)
