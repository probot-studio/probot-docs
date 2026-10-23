# Motor sürücülerini ve sensörleri kullan

Bu sayfada motor sürücülerini, servoyu, ProHub kartını, IMU'yu ve Boardoza kartlarını prosdk sınıflarıyla süreceksin. Her bölüm bağlantıyı, kurucuyu ve sınırları verir.

!!! warning "Dikkat"
    Bu sayfadaki sürücülerin hiçbiri gerçek bir kartta denenmedi; ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da hiçbir şey çalıştırılmadı. Bağlantılar, frekanslar ve davranışlar kaynak koddan yazıldı. İlk denemede tekerlekleri yerden kaldır ve **Emergency Stop**'a basmaya hazır ol.

## Başlamadan önce

- İlk robot kodunu yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Hangi GPIO'ların kullanılabildiğini biliyorsun: [Kullanılabilir pinleri seç](pinleri-kullan.md#kullanilabilir-pinler).
- Kumandanı Driver Station'a bağlamayı biliyorsun: [Teleop'ta sür](ilk-robotu-yaz.md#teleop).

Robotun ana kartı Pulse'tur. Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Bu sayfadaki pin numaraları Pulse'un konnektörlerindeki pinlerden seçilmiş örneklerdir; kendi bağlantına göre değiştir. Doğrudan karta bağlanan sınıflarda kanal numarası GPIO numarasıdır. PCA9685 ve ProHub sınıflarında çipin kanal ya da port numarasıdır.

Konnektörlerin yeri ve pin sırası: [Pulse'un konnektörlerini tanı](pinleri-kullan.md#pulse-konnektorleri).

## Sınıfı seç {#siniflar}

Her sınıfın kendi başlık dosyası vardır. Sketch'e `#include <prosdk.h>` satırından sonra kullandığın sınıfın başlığını ekle.

| Donanım | Sınıf | Başlık dosyası |
|---|---|---|
| PWM ile sürülen motor sürücüsü (Spark, Talon, Victor...) | `prosdk::Spark` ve diğerleri | `<prosdk/drivers/motor/Spark.hpp>` ve diğerleri |
| BTS7960 (IBT-2) H köprüsü | `prosdk::BTS7960` | `<prosdk/drivers/motor/BTS7960.hpp>` |
| VNH5019 H köprüsü | `prosdk::VNH5019` | `<prosdk/drivers/motor/VNH5019.hpp>` |
| Hobi servosu | `prosdk::Servo` | `<prosdk/drivers/servo/Servo.hpp>` |
| PCA9685 PWM denetleyicisi | `prosdk::PCA9685` | `<prosdk/drivers/pwm/PCA9685.hpp>` |
| ProHub motor portu | `prosdk::ProHubMotor` | `<prosdk/drivers/motor/ProHubMotor.hpp>` |
| ProHub encoder'ları | `prosdk::ProHubEncoders`, `prosdk::ProHubEncoder` | `<prosdk/drivers/encoder/ProHubEncoders.hpp>` |
| goBILDA Pinpoint odometri bilgisayarı | `prosdk::GoBildaPinpoint` | `<prosdk/drivers/odometry/GoBildaPinpoint.hpp>` |
| MPU-6050 IMU | `prosdk::MPU6050` | `<prosdk/drivers/imu/MPU6050.hpp>` |
| Boardoza kartları | [Boardoza kartlarını kullan](#boardoza) | |

PWM motor sürücüleri ve `GoBildaPinpoint` WPILib 2027'den değiştirilmeden alındı. Diğer sınıflar prosdk için yazıldı.

Bütün motor sınıflarında şunlar ortaktır:

- `SetThrottle(değer)` -1 ile 1 arası değer alır. Dışındaki değerler sınıra çekilir, NaN 0 sayılır.
- `SetInverted(true)` yönü çevirir. `Disable()` ve `StopMotor()` motoru durdurur.
- Robot disabled iken PWM darbesi gitmez ve H köprülerinin PWM görev oranı 0 olur. Driver Station bağlantısı koparsa robot yaklaşık 5 saniye sonra disabled olur. Enable ve yön pinleri gibi düz dijital çıkışlar ise son seviyelerini korur; varsayılan bağlantıdaki BTS7960 bu yüzden fren yapar. **Emergency Stop** bu pinleri de LOW'a çeker. Ayrıntı: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi).
- Motor güvenlik zamanlayıcısı (`MotorSafety`) motor sınıflarında varsayılan olarak kapalıdır. Açmak için `SetSafetyEnabled(true)` çağır. `DifferentialDrive` kendi zamanlayıcısını açar.
- `prosdk::telemetry::Log("Ad", motor)` motoru **Veri** sekmesine `Value` girdisiyle yazar: [Değerleri Veri sekmesine gönder](veri-goster.md#telemetri).

## Hazır örneği aç {#hazir-ornek}

`DriversShowcase` örneği sürücülerin bir kısmını bir `TimedRobot`'ta birlikte kullanır: ProHub kartı (motor portu, servo, encoder akışı, MPU-6050, goBILDA Pinpoint) ile Spark, servo, BTS7960 ve VNH5019 çıkışları. Boardoza kartları kendi örneklerindedir: [Boardoza örneklerini aç](#boardoza-ornekleri). Kendi kodunu yazmadan önce bağlantıları ve sınıfları orada görebilirsin.

Örnek şifreyi `probot-robot`, kanalı 6 olarak tanımlar. Ağ adı satırı yoktur; bu yüzden Probot Core ağa `Probot-XXXXXX` biçiminde bir ad verir.

1. **File** > **Examples** > **prosdk** > **DriversShowcase**'i seç.
2. `PROBOT_WIFI_AP_PASSWORD` satırındaki şifreyi en az 8 karakterlik kendi şifrenle değiştir. Ağa kendi adını vermek için bu satırın üstüne `#define PROBOT_WIFI_AP_SSID "Probot"` satırını ekle.
3. Koddaki pin numaralarını kendi bağlantına göre değiştir. Örnekteki bağlantı listesi dosyanın başındaki "Wiring" yorumundadır.
4. **File** > **Save As**'i seç ve sketch'i kendi klasörüne kaydet.
5. Araç çubuğunda **Verify**'a bas.

Sonuç: **Output** panelinde `Sketch uses` ile başlayan satır görünür. Ağ adı satırını eklemediysen ve **File** > **Preferences**'ta **Compiler warnings** **None** değilse, `PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX).` ile başlayan bir uyarı da görünür. Bu bir hata değildir.

Örneklerin kaynağı: [probot-sdk deposundaki `examples` klasörü](https://github.com/probot-studio/probot-sdk/tree/dev/examples).

## Sürüş, servo ve IMU'yu birlikte kullan {#ornek}

Bu örnekte robot iki BTS7960 ile arcade sürüşle gider, GPIO 7'deki servo bir tutucuyu açıp kapatır, MPU-6050 robotun yönünü **Veri** sekmesine yazar.

| Parça | Bağlantı |
|---|---|
| Sol BTS7960 | RPWM GPIO 38, LPWM GPIO 37, R_EN + L_EN GPIO 36 (J6) |
| Sağ BTS7960 | RPWM GPIO 35 (J6), LPWM GPIO 47, R_EN + L_EN GPIO 48 (J8) |
| Servo | Sinyal GPIO 7 (J5); besleme harici 5-6 V, GND kartın GND'siyle ortak |
| MPU-6050 | SDA GPIO 1, SCL GPIO 2 (J3, I2C port 0'ın varsayılan pinleri); VCC 3,3 V, GND kartın GND'si |

1. Arduino IDE'de **File** > **New Sketch**'i seç ve açılan sketch'teki her satırı sil.
2. Aşağıdaki kodu yapıştır.
3. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
4. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle). Kart açılırken robotu 1 saniye kıpırdatma; bu sürede IMU kalibre edilir.
5. Robotun ağına bağlan, `http://192.168.4.1` adresini aç ve kumandayı bağlayıp bir düğmesine bas.
6. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
7. **Init**'e bas, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/drive/DifferentialDrive.hpp>
#include <prosdk/drivers/imu/MPU6050.hpp>
#include <prosdk/drivers/motor/BTS7960.hpp>
#include <prosdk/drivers/servo/Servo.hpp>
#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    right.SetInverted(true);  // sağ motor ters yöne bakıyor
    imu.Calibrate();          // yaklaşık 1 saniye; robot kıpırdamamalı
  }

  // Her modda, her turda
  void RobotPeriodic() override {
    prosdk::telemetry::Log("IMU", imu);  // yaw, roll, pitch, dönüş hızı
    prosdk::telemetry::Log("IMU/Bağlı", imu.IsConnected());
    prosdk::telemetry::Log("Tutucu", gripper);
  }

  void TeleopPeriodic() override {
    // Dönüş saat yönünün tersine pozitif: eksi işaretiyle sağa itince sağa döner
    drive.ArcadeDrive(-gamepad.GetLeftY(), -gamepad.GetRightX());

    if (gamepad.GetFaceDownButtonPressed()) {
      gripper.SetAngle(30);   // tutucuyu aç
    }
    if (gamepad.GetFaceRightButtonPressed()) {
      gripper.SetAngle(120);  // tutucuyu kapat
    }
    if (gamepad.GetFaceUpButtonPressed()) {
      imu.ResetYaw();         // robotun şu anki yönü 0 olur
    }
  }

 private:
  prosdk::BTS7960 left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN
  prosdk::BTS7960 right{35, 47, 48};
  prosdk::DifferentialDrive drive{left, right};
  prosdk::Servo gripper{7};           // servo sinyali GPIO 7'de (J5)
  prosdk::MPU6050 imu{prosdk::I2C::Port::PORT_0};  // adres 0x68
  prosdk::Gamepad gamepad{0};
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: Sol çubukla robot ileri gider. Sağ çubuğu sağa itince robot sağa döner. Xbox düzenindeki **A** düğmesi servoyu 30 dereceye, **B** düğmesi 120 dereceye götürür. **Veri** sekmesinde `/Telemetry/IMU` altında `Value` (yaw, derece), `Roll`, `Pitch` ve `Rate` görünür; robotu sola çevirince `Value` artar.

## Motor sürücüsünü bağla {#motor-surucu}

prosdk iki tür motor sürücüsü sürer. Spark gibi hazır sürücüler 1-2 ms'lik servo tipi darbeyle sürülür. BTS7960 ve VNH5019 gibi H köprüleri ise kHz düzeyinde PWM ister; prosdk bunu ESP32-S3'ün LEDC birimiyle üretir.

### PWM motor sürücüleri {#pwm-motor}

Dokuz sınıfın kurucusu aynıdır: sinyal pininin GPIO numarasını alır. Başlık dosyası sınıfın adıyla aynıdır, ör. `<prosdk/drivers/motor/PWMSparkMax.hpp>`.

| Sınıf | Darbe aralığı | Darbe periyodu |
|---|---|---|
| `Spark`, `PWMSparkMax`, `PWMSparkFlex` | 0,999-2,003 ms | 5 ms |
| `PWMTalonFX`, `PWMTalonSRX`, `PWMVenom`, `PWMVictorSPX` | 0,997-2,004 ms | 5 ms |
| `Koors40` | 0,997-2,004 ms | 20 ms |
| `SparkMini` | 0,5-2,5 ms | 5 ms |

```cpp
prosdk::Spark arm{38};              // sinyal GPIO 38'de (J6)
prosdk::PWMVictorSPX intake{37};    // sinyal GPIO 37'de (J6)
```

- Kartta 12 PWM çıkışı var. Servolar da bu çıkışları kullanır.
- Çıkışlar ikişerli gruplar hâlinde aynı periyodu paylaşır. 5 ms'lik sürücüler ile 20 ms'lik servolar ve `Koors40` ayrı gruplara düşer. En çok 6 farklı periyot grubu olur. Boş grup kalmazsa robot programı `PWM: no MCPWM timer left for a ... ms period on GPIO ...` hatasıyla durur: [Donanım birimlerinin sınırına dikkat et](pinleri-kullan.md#kapasite).
- Sınıfların başlık yorumlarında geçen "SmartIO channel" WPILib'den kalmadır. prosdk'de bu numara GPIO'dur.

### BTS7960 (IBT-2) {#bts7960}

`BTS7960(rpwm, lpwm, enable)` üç GPIO alır. Dördüncü parametre isteğe bağlı bağlantı türüdür.

| BTS7960 pini | Bağlantı |
|---|---|
| RPWM | Bir GPIO (ileri) |
| LPWM | Bir GPIO (geri) |
| R_EN ve L_EN | Birbirine köprülü, tek bir GPIO |
| VCC | 5 V ya da 3,3 V. Girişler 3,3 V lojiği kabul eder. |
| GND | Kartın GND'si |
| R_IS, L_IS | Boş. Akım ölçümü okunmaz. |

| Bağlantı türü | PWM nereye gider | Gaz 0 | `Disable()` | PWM üreteci |
|---|---|---|---|---|
| `Wiring::PWM_ON_INPUTS` (varsayılan) | RPWM ya da LPWM | Fren | Serbest dönüş | 2 |
| `Wiring::PWM_ON_ENABLE` | Köprülü R_EN + L_EN; yönü RPWM/LPWM seçer | Serbest dönüş | Serbest dönüş | 1 |

`PWM_ON_ENABLE`, eski Probot Lib kodunun kullandığı bağlantıdır. BTS7960'ların bu kablolamayla bağlıysa ya da üreteç yetmiyorsa bunu seç. Bir motora tek üreteç harcar.

```cpp
// PWM köprülü EN hattında; RPWM ve LPWM yalnız yönü seçer
prosdk::BTS7960 left{38, 37, 36, prosdk::BTS7960::Wiring::PWM_ON_ENABLE};
```

BTS7960 en çok 25 kHz kabul eder. Kurucunun kullandığı frekans: [PWM üreteci sınırları](#pwm-ureteci). Arıza girişi okunmaz.

### VNH5019 {#vnh5019}

`VNH5019(ina, inb, pwm)` üç GPIO alır. Bu kurucu, EN/DIAG pinleri kartta pull-up ile HIGH tutulan kartlar içindir. EN/DIAG pinlerini de sürmek istersen `VNH5019(ina, inb, pwm, ena, enb)` kullan. `enb`, `ena` ile aynı olabilir ya da -1 olabilir.

| VNH5019 pini | Bağlantı |
|---|---|
| INA | Bir GPIO |
| INB | Bir GPIO |
| PWM | Bir GPIO |
| EN/DIAG A ve B | İsteğe bağlı: bir ya da iki GPIO, araya en az 1 kΩ seri direnç |
| CS | Boş. Akım ölçümü okunmaz. |

EN/DIAG, çipin arızada LOW'a çektiği açık-drenaj bir hattır. Seri direnç yoksa arıza anında GPIO kısa devre olabilir.

```cpp
// J5: INA 16, INB 17, PWM 15; EN/DIAG A ve B köprülü, GPIO 7'de (1 kΩ dirençle)
prosdk::VNH5019 lift{16, 17, 15, 7, 7};
```

Bu dört pin J5'tedir: SPI bus 0'ın varsayılan pinleri ve sürüş örneğindeki servo pini (7). SPI bus 0'ı ya da I2C port 1'i kullanan robotta başka boş pinler seç.

- Gaz 0'da motor varsayılan olarak fren yapar. `lift.SetBrakeMode(false)` serbest dönüşe geçirir.
- `SetBrakeStrength(0.5)` freni yumuşatır. Değer 0 ile 1 arasıdır, varsayılan 1'dir (tam fren).
- `Disable()` serbest dönüşe geçer ve EN pinlerini LOW'a çeker.
- VNH5019 en çok 20 kHz kabul eder. Arıza okunmaz.

### PWM üreteci sınırları {#pwm-ureteci}

H köprüsü sürücüleri prosdk'nin 6 dijital PWM üretecini paylaşır. Üreteçler ESP32-S3'ün LEDC biriminde, yani Arduino'nun `ledcAttach` ile kullandığı PWM biriminde çalışır. Bütün üreteçler tek bir frekansta çalışır (5 Hz ile 40 kHz arası).

| Sürücü | Motor başına üreteç | En çok motor |
|---|---|---|
| `BTS7960`, varsayılan bağlantı | 2 | 3 |
| `BTS7960`, `PWM_ON_ENABLE` | 1 | 6 |
| `VNH5019`, `VNH7070AS`, `DRV8307` | 1 | 6 |
| `TwoPinHBridge` (L9110S, BA6208) | 2 | 3 |

- Her H köprüsü kurucusu frekansı 20 kHz yapar. Son kurulan sürücü bütün üreteçlerin frekansını belirler.
- Kodda başka bir `DigitalOutput::SetPWMRate` çağrısı bütün motorların frekansını değiştirir.
- Yedinci üreteç istenince kurucu durur ve konsola `Digital PWM: all 6 generators are in use` yazılır.
- Arduino'nun `analogWrite` ve `ledcAttach` fonksiyonları aynı LEDC birimini kullanır. prosdk sınıflarıyla birlikte kullanma. Birimin 8 kanalı ve 4 zamanlayıcısı bunlarla paylaşılır; 6 üreteç dolmadan `Digital PWM: no LEDC channel/timer for GPIO ...` hatası çıkabilir.

### Diğer H köprüleri ve fırçasız motor sürücüleri {#diger-suruculer}

Bunlar Boardoza kartları için yazıldı. Başlık dosyaları `<prosdk/drivers/motor/...>` altındadır.

| Sınıf | Kurucu | Not |
|---|---|---|
| `TwoPinHBridge` (`L9110S`, `BA6208` diğer adları) | `(inA, inB, zeroBehavior = kBrake)` | Motor başına 2 pin. `SetZeroBehavior` gaz 0'da fren ya da serbest dönüş seçer. L9110 veri sayfasına göre serbest dönüş durumu yok; serbest dönüş de fren yapar (Boardoza kartındaki çipte doğrulanmadı). Çiplerin en yüksek PWM frekansı doğrulanmadı. |
| `VNH7070AS` | `(ina, inb, pwm, sel0 = -1, csAnalog = -1)` | VNH5019 gibi sürülür. `csAnalog` bir ADC1 pini olmalı (GPIO 1-10; Pulse'un konnektörlerinde 1, 2, 7, 10). `SetCurrentSense`, `GetCurrent()`, `IsFault()` ekler. Bölücü yoksa akım 3,2 A civarında doyar ve `IsFault()` hep `false` döner. 20 kHz bu çipin üst sınırıdır; frekansı yükseltme. |
| `DRV8307` | `(pwm, enableN, dir, brake, lockN = -1, hallOut = -1, faultN = -1)` | Hall sensörlü fırçasız motor; komütasyonu çip yapar. `SetBrakeMode` (BRAKE pini gerekir), `IsLocked()`, `IsFault()`, `SetPolePairs`, `GetRpm()` (HALLOUT gerekir). Gaz 0'dan sonra motor ancak durunca yeniden sürülür. `dir` -1 ise eksi gaz motoru durdurur. |
| `DRV8317H` | `(Pins)`: `inhA/B/C`, `inlA/B/C`, `hallA/B/C`, `nSleep`, `nFault` | Hall sensörlü altı adımlı komütasyon; DRV8317H kartının MODE köprüsü J10 3x PWM'de olmalı. En çok 2 motor; her motor 12 PWM çıkışından 2'sini harcar. `SetCommutationTable`, `GetPosition()`, `GetRpm()`, `GetHallState()`. Varsayılan komütasyon tablosu motorda doğrulanmadı. |

```cpp
prosdk::L9110S conveyor{39, 40};                       // A girişi 39, B girişi 40 (J7)
prosdk::VNH7070AS winch{41, 42, 47, /*sel0=*/48, /*csAnalog=*/10};
```

Bu satırlardaki pinler örnektir ve sayfanın diğer bağlantılarıyla çakışır: 39-42 encoder'lar için ayrılan J7 pinleri, 47 ve 48 sağ BTS7960'ın pinleri, GPIO 10 da ProHub'ın encoder verisi pinidir. Kendi robotunda boş pinler seç; `csAnalog` için GPIO 1, 2, 7 ve 10 arasında boş bir pin bul. J8'deki GPIO 45 ve 46 açılış pinleridir; kart açılırken bunlara yük bağlama: [Açılış pinlerini en son kullan](pinleri-kullan.md#acilis-pinleri).

## Servoyu sür {#servo}

`prosdk::Servo`, WPILib 2026'daki `frc::Servo` arayüzünü taşır. WPILib 2027 bu sınıfı kaldırdı; prosdk geri ekledi.

| Kurucu | Çıkış |
|---|---|
| `Servo(gpio)` | Bir GPIO, 20 ms periyotlu PWM |
| `Servo(pca, kanal)` | Bir PCA9685 çıkışı, kanal 0-15 (ProHub'da 12-15) |

- `Set(0.0 ... 1.0)` konumu verir. 0 en kısa darbe, 1 en uzun darbedir.
- `SetAngle(0 ... 180)` açıyı derece olarak verir. `Get()` ve `GetAngle()` son verilen değeri döndürür.
- Varsayılan darbe aralığı 600-2400 µs'dir (HS-322HD servosu).
- `SetOffline()` darbeyi keser; servo gevşer. `Set(NaN)` de aynı işi yapar. Gevşekken `Get()` 0, `GetAngle()` 0 döndürür.
- Yeni kurulan servo gevşek başlar; ilk `Set` ya da `SetAngle` çağrısına kadar darbe almaz.

Başka bir servo için darbe aralığını `SetBounds(max, deadbandMax, center, deadbandMin, min)` ile ver. Yalnız `max` ve `min` kullanılır; ortadaki üç değer yok sayılır.

```cpp
// 500-2500 µs aralığında çalışan bir servo
gripper.SetBounds(2500_us, 0_us, 0_us, 0_us, 500_us);
```

`min` 0'dan büyük, `max` `min`'den büyük ve 4096 µs'den küçük olmalı. Değilse `SetBounds` `Servo bounds min ... us, max ... us (need 0 < min < max < 4096)` hatasını fırlatır ve robot programı durur.

## ProHub kartını kullan {#prohub}

ProHub genişleme kartı iki parça taşır: motor portlarını ve servo çıkışlarını süren bir PCA9685 PWM denetleyicisi, ve sekiz encoder'ı sayıp seri porttan gönderen bir yardımcı işlemci. Aşağıdaki değerler ProHub'ın mevcut tanımından alındı; kitin elektroniği kesinleşince değişebilir.

| ProHub | Değer |
|---|---|
| I2C | SDA GPIO 1, SCL GPIO 2 (J3), 400 kHz, I2C port 0 |
| PCA9685 adresi | 0x40 (`prohub::kPcaAddress0`) |
| Motor portları | Port 1: kanal 0/1, port 2: 3/4, port 3: 6/7, port 4: 9/10 |
| Servo çıkışları | Kanal 12-15 (`prohub::kFirstServoChannel` = 12) |
| Encoder akışı | RX GPIO 10, TX GPIO 11 (J4'te F1 ve F2), 921600 baud, seri port `ONBOARD` |

Portlar 5-8 için 0x41 adresinde ikinci bir PCA9685 planlanıyor. Bu portları henüz kullanma.

ProHub'ın pinleri Pulse'ta prosdk'nin varsayılan pinleridir: I2C port 0 J3'te (GPIO 1/2), `ONBOARD` seri port J4'te (GPIO 10/11). `prohub::ConfigurePins()` I2C port 0'ı ve `ONBOARD` seri portu bu pinlere ayarlar; Pulse'ta bir şey değiştirmez, başka bir ESP32-S3 kartında pinleri ProHub'a taşır. ProHub'lı robotta MPU-6050'yi ve Pinpoint'i de bu I2C hattına bağla. Port 0'ı daha önce Arduino'nun `Wire`'ı başlattıysa port, `Wire`'ın pinlerinde kalır.

Probot Core'un INA batarya sensörü (`PROBOT_BATTERY_INA`) de bu hattı kullanır: Probot Core 0.5.0'da INA'nın varsayılan pinleri SDA 1, SCL 2'dir (J3), yani I2C port 0 ve ProHub hattı. INA ile port 0'daki cihazlar aynı hatta birlikte çalışır. INA'nın varsayılan adresi 0x40'tır, yani PCA9685'in adresi. ProHub'lı robotta A0/A1 pinleriyle INA'ya 0x40 ve 0x41 dışında bir adres ver ve bu adresi `PROBOT_BATTERY_INA_ADDR` ile tanımla. INA açıkken hat 400 kHz yerine 100 kHz'de çalışır; port 0'daki her aktarım yaklaşık 4 kat uzun sürer. Robot kodun Arduino'nun `Wire`'ını doğrudan kullanıyorsa `Wire`'ı aynı pinlerle (`Wire.begin(1, 2)`) başlat ya da hiç başlatma; her okuması önemli olan bir cihazı `Wire1`'e (başka pinlere) koy.

Aşağıdaki sketch ProHub'ı şöyle kurar:

- `bool m_pinsConfigured = prosdk::prohub::ConfigurePins();` sınıfın **ilk üyesidir**. Üyeler kurucunun gövdesinden önce kurulur; bu yüzden çağrı kurucuda değil, sürücülerin üstündeki bir üyededir. Bu satır I2C port 0'ı ve `ONBOARD` seri portu ProHub pinlerine bağlar. Pulse'ta bu pinler zaten varsayılandır; satır, kod başka bir karta taşınınca da çalışsın diye durur.
- PCA9685 yalnız motor sürdüğü için frekansı `prohub::kMotorPwmFrequency`'dir (872 Hz). Aynı çipte servo da varsa en çok 400 Hz kullan; analog servolar 50 Hz bekler.
- Her motor için bir `ProHubMotor(pca, port)` kurulur.
- Encoder'lar için bir `ProHubEncoders`, her motor için bir `ProHubEncoder(encoders, index)` kurulur. Encoder `index`'i, motor portu `index + 1`'e aittir.

1. Arduino IDE'de **File** > **New Sketch**'i seç ve açılan sketch'teki her satırı sil.
2. Aşağıdaki kodu yapıştır.
3. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
4. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
5. Robotun ağına bağlan, `http://192.168.4.1` adresini aç ve kumandayı bağlayıp bir düğmesine bas.
6. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
7. **Init**'e bas, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/drivers/ProHub.hpp>
#include <prosdk/drivers/encoder/ProHubEncoders.hpp>
#include <prosdk/drivers/motor/ProHubMotor.hpp>
#include <prosdk/drivers/pwm/PCA9685.hpp>
#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>

namespace prohub = prosdk::prohub;

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    wheel.SetDistancePerPulse(0.065 * 3.14159 / 1440.0);  // 65 mm tekerlek, turda 1440 tık
  }

  void RobotPeriodic() override {
    prosdk::telemetry::Log("PCA9685/Bağlı", hub.IsConnected());
    prosdk::telemetry::Log("Encoder/Bağlı", encoders.IsConnected());
    prosdk::telemetry::Log("Encoder/Teker", wheel);
  }

  void TeleopPeriodic() override { motor1.SetThrottle(-gamepad.GetLeftY()); }

 private:
  // İlk üye: sürücüler bus'ı açmadan önce pinler ayarlanır
  bool m_pinsConfigured = prosdk::prohub::ConfigurePins();

  prosdk::PCA9685 hub{prosdk::I2C::Port::PORT_0, prohub::kPcaAddress0,
                      prohub::kMotorPwmFrequency};
  prosdk::ProHubMotor motor1{hub, 1};  // motor portu 1
  prosdk::ProHubEncoders encoders;     // ONBOARD seri port, 921600 baud
  prosdk::ProHubEncoder wheel{encoders, 0};  // motor portu 1'in encoder'ı
  prosdk::Gamepad gamepad{0};
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: Kart ve ProHub doğru bağlıysa **Veri** sekmesinde `PCA9685/Bağlı` ve `Encoder/Bağlı` `true` olur. **Start**'tan sonra sol çubuk 1 numaralı porttaki motoru döndürür.

- `ProHubMotor`'da gaz 0 ve `Disable()` serbest dönüş yapar; fren yoktur.
- Komut çipe en geç PCA9685'in güncelleme periyodu (varsayılan 10 ms) sonra ulaşır.
- Turdaki tık sayısı yardımcı işlemcinin yazılımına bağlıdır. 1440 yalnız bir örnektir; kendi motorunda ölç.
- `ProHubEncoders::IsConnected()` 100 ms geçerli çerçeve gelmezse `false` olur. `GetCrcErrors()` bozuk çerçeveleri sayar.

!!! warning "Dikkat"
    **Emergency Stop** PCA9685 çıkışlarını her durumda kapatamaz. Acil stop anında I2C hattı meşgulse PCA9685 son değerlerini korur ve ProHub motorları dönmeye devam edebilir. ProHub motorları olan robotta gücü kesen bir donanım acil stop düğmesi kullan.

### PCA9685'i tek başına kullan {#pca9685}

`PCA9685(port, adres = 0x40, frekans = 50_Hz, güncellemePeriyodu = 10_ms)` herhangi bir PCA9685 kartını sürer.

- Frekans 24-1526 Hz arasıdır ve çipin 16 kanalı için tektir. Aralık dışında kurucu `PCA9685 frequency ... Hz (valid: 24 to 1526 Hz)` hatasıyla durur.
- `SetDutyCycle(kanal, 0...1)`, `SetPulseWidth(kanal, süre)` ve `SetOff(kanal)` değeri saklar. Bir iş parçacığı değişen kanalları her 10 ms'de çipe yazar. `güncellemePeriyodu` 0 ise `Update()`'i kendin çağır.
- Robot disabled iken, acil stoptan sonra ve robot programı durunca bütün çıkışlar bir güncelleme periyodu içinde kapanır. Acil stop anında I2C hattı meşgulse çıkışlar son değerinde kalabilir (yukarıdaki Dikkat kutusu). `OutputsEnabled()` kapının açık olup olmadığını gösterir, çıkışların gerçekten kapandığını göstermez.
- Çip yanıt vermezse kurucu durmaz. Konsola `[prosdk] PCA9685 0x40: no answer on I2C port 0; retrying` yazılır ve sürücü her periyotta yeniden dener. `IsConnected()` son aktarımın sonucunu verir.
- Sürücü her PCA9685'te 0x70 genel çağrı (all-call) adresini açar. Aynı porta 0x70'te başka bir kart takma.

Aşağıdaki üyeler I2C port 1'i kullanır. Port 1'in varsayılan pini yoktur; pinleri ilk üyede ayarla ve `<prosdk/platform/HalConfig.hpp>`'yi ekle: [Bus pinlerini ayarla](#bus-pinleri). Burada port 1, Boardoza örnekleri gibi J5'teki GPIO 17 ve 16'dadır; bu pinler SPI bus 0'ın da varsayılan pinleri olduğu için o robotta SPI bus 0'ı kullanma.

```cpp
// İlk üye: I2C port 1 GPIO 17 (SDA) ve 16 (SCL) üzerinde (J5)
bool m_pinsConfigured = prosdk::platform::SetI2CPins(1, 17, 16);
prosdk::PCA9685 pca{prosdk::I2C::Port::PORT_1, 0x41, 50_Hz};
prosdk::Servo pan{pca, 0};   // PCA9685 kanal 0'da servo
// Bir LED'i yarı parlaklıkta yak: pca.SetDutyCycle(15, 0.5);
```

## Pinpoint'ten konum oku {#pinpoint}

`GoBildaPinpoint(port, adres = 0x31)` goBILDA Pinpoint odometri bilgisayarını I2C üzerinden okur. Sınıf WPILib 2027'deki ile aynıdır.

Aşağıdaki sketch Pinpoint'i I2C port 0'ın varsayılan pinlerinde (J3: SDA 1, SCL 2) okur. Pulse'ta ProHub'ın I2C hattı da bu pinlerdedir. Pinpoint port 1'deyse ilk üyede `platform::SetI2CPins(1, sda, scl)` çağır. Kurucu bölme ofsetlerini, encoder çözünürlüğünü ve yönlerini verir. `RobotPeriodic()` her turda `Update()`'i çağırır ve konumu `GetPose()` ile okur.

1. Arduino IDE'de **File** > **New Sketch**'i seç ve açılan sketch'teki her satırı sil.
2. Aşağıdaki kodu yapıştır.
3. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
4. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle). Kart açılırken robotu kıpırdatma; kurucu Pinpoint'in IMU'sunu sıfırlar.
5. Robotun ağına bağlan ve `http://192.168.4.1` adresini aç.
6. **Veri** sekmesini seç.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/drivers/odometry/GoBildaPinpoint.hpp>
#include <prosdk/framework/TimedRobot.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    pinpoint.SetOffsets(-0.084_m, -0.168_m);  // bölmelerin izleme noktasına uzaklığı
    pinpoint.SetEncoderResolution(prosdk::GoBildaPinpoint::OdometryPod::FOUR_BAR);
    pinpoint.SetEncoderDirections(prosdk::GoBildaPinpoint::EncoderDirection::FORWARD,
                                  prosdk::GoBildaPinpoint::EncoderDirection::FORWARD);
    pinpoint.ResetPositionAndIMU();  // robot kıpırdamamalı
  }

  void RobotPeriodic() override {
    pinpoint.Update();
    const auto pose = pinpoint.GetPose();
    prosdk::telemetry::Log("Pinpoint/X (m)", pose.X().value());
    prosdk::telemetry::Log("Pinpoint/Y (m)", pose.Y().value());
  }

 private:
  prosdk::GoBildaPinpoint pinpoint{prosdk::I2C::Port::PORT_0};  // adres 0x31
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: Robotu elle ileri itince **Veri** sekmesinde `Pinpoint/X (m)` artar. `RobotPeriodic()` her modda çalıştığı için **Start**'a basman gerekmez.

## MPU-6050'yi oku {#mpu6050}

`MPU6050(port, adres = 0x68, güncellemePeriyodu = 5_ms)` bir MPU-6050 IMU'yu okur. AD0 pini HIGH ise adres 0x69'dur. Bir iş parçacığı sensörü 5 ms'de bir okur; `güncellemePeriyodu` 0 ise `Update()`'i kendin çağır.

| Konu | Değer |
|---|---|
| Montaj | Çip düz, Z yukarı, X ileri, Y sola. Saat yönünün tersi pozitif. |
| Ölçüm aralığı | ±1000 °/s, ±4 g, 44 Hz alçak geçiren süzgeç |
| Kabul edilen çipler | WHO_AM_I 0x68 (MPU-6050), 0x70, 0x71, 0x73 (MPU-6500/9250 ailesi) |
| Başka montaj | Eksenleri kodda kendin çevir. |

Fonksiyonlar WPILib'in `OnboardIMU` sınıfıyla aynıdır: `GetYaw()`, `GetRotation2d()`, `GetRotation3d()`, `GetQuaternion()`, `GetAngleX/Y/Z()`, `GetGyroRateX/Y/Z()`, `GetAccelX/Y/Z()`. `ResetYaw()` de ikisinde vardır. `MPU6050`'de ek olarak `GetTemperature()`, `Calibrate()` ve `IsConnected()` vardır. Kartta dahili IMU yoktur. `OnboardIMU` derlenir ve kurulur; `GetYaw()` ve `GetRotation2d()` hep 0 döner, `ResetYaw()` hata vermez. Diğer bütün okumalar (`GetAngleZ()` dahil) programı durdurur. WPILib kodunda `OnboardIMU` yerine `prosdk::MPU6050 imu{prosdk::I2C::Port::PORT_0};` yaz.

- `Calibrate()` 500 örnek alır, yaklaşık 1 saniye sürer ve bu sürede kodu bekletir. Robot kıpırdamamalı. Kurucuda bir kez çağır.
- `Calibrate()` çağrılmazsa ya da robot bu sırada kıpırdarsa yaw saniyede birkaç dereceye kadar kayar.
- Manyetometre yok; yaw kalibrasyondan sonra da yavaş yavaş kayar. Roll ve pitch ivmeölçerle düzeltilir, kaymaz.
- Sensör yanıt vermezse konsola `[prosdk] MPU6050 0x68 on I2C port 0: no answer (WHO_AM_I 0x00)` gibi bir satır yazılır. Başka bir çip yanıt verirse `no answer` yerine `unexpected chip` yazar.

Tam örnek: [Sürüş, servo ve IMU'yu birlikte kullan](#ornek).

## Boardoza kartlarını kullan {#boardoza}

prosdk, Boardoza'nın açık donanım devre kartları için sürücüler içerir. Sürücüler veri sayfalarından ve kart şemalarından yazıldı.

### Bus pinlerini ayarla {#bus-pinleri}

prosdk'nin varsayılan pinleri Pulse'un konnektörleridir: I2C port 0 J3'te (SDA 1, SCL 2, 400 kHz), `ONBOARD` seri port J4'te (RX 10, TX 11), SPI bus 0 J5'te (SCK 17, MOSI 15, MISO 16; CS 7 cihazındır). I2C port 1'in, SPI bus 1'in, `MXP` seri portun ve CAN'in varsayılan pini yoktur. Bunların pinlerini, başka bir kartta varsayılanları da, sürücü kurulmadan önce sınıfın ilk üyesinde ayarla. Fonksiyonlar `<prosdk/platform/HalConfig.hpp>` içindedir.

| Fonksiyon | Ne yapar |
|---|---|
| `platform::SetI2CPins(port, sda, scl, frekansHz = 400000)` | `port`: 0 (`PORT_0`) ya da 1 (`PORT_1`). Sayı olarak yaz; `I2C::Port::PORT_1` gibi enum değerleri derlenmez. Port 0'ın varsayılanı GPIO 1/2 (J3), 400 kHz. |
| `platform::SetSerialPins(port, rx, tx)` | `port`: 0 (`ONBOARD`, varsayılan RX 10 / TX 11, J4'te F1 ve F2) ya da 1 (`MXP`). Sayı olarak yaz. `USB_1` ve `USB_2` robotta yoktur. |
| `platform::SetSPIPins(bus, sck, mosi, miso)` | SPI bus 0 (`SPI::kPort0`, varsayılan SCK 17 / MOSI 15 / MISO 16, J5) ya da 1 (`SPI::kPort1`). Yalnız gönderen bir bus için `miso` -1. |
| `platform::SetCanConfig(tx, rx, bitHızı = 1000000)` | CAN (TWAI) pinleri ve bit hızı: 125000, 250000, 500000 ya da 1000000. Harici bir 3,3 V CAN alıcı-vericisi gerekir; yalnız klasik CAN. |

Pin ayarlanmamış bir bus açılınca robot programı `... has no pins: call prosdk::platform::Set...(...) first` hatasıyla durur. I2C port 1 için yazı `I2C port 1 has no pins: call prosdk::platform::SetI2CPins(1, sda, scl) first` olur.

Aşağıdaki sketch I2C port 1'deki bir LM75ADP kartını okur. Kartı J5'te SDA GPIO 17'ye, SCL GPIO 16'ya bağla ve 3,3 V ile besle. Bu iki pin SPI bus 0'ın da varsayılan pinleridir; bu sketch'te SPI bus 0 kullanılmaz.

1. Arduino IDE'de **File** > **New Sketch**'i seç ve açılan sketch'teki her satırı sil.
2. Aşağıdaki kodu yapıştır.
3. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
4. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
5. Robotun ağına bağlan ve `http://192.168.4.1` adresini aç.
6. **Veri** sekmesini seç.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/drivers/environment/LM75A.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/platform/HalConfig.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  void RobotPeriodic() override {
    prosdk::telemetry::Log("Sıcaklık (C)", thermometer.GetTemperature().value());
  }

 private:
  // İlk üye: I2C port 1 GPIO 17 (SDA) ve 16 (SCL) üzerinde (J5), 100 kHz
  bool m_pinsConfigured = prosdk::platform::SetI2CPins(1, 17, 16, 100000);
  prosdk::LM75A thermometer{prosdk::I2C::Port::PORT_1};  // adres 0x48
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Veri** sekmesinde `Sıcaklık (C)` oda sıcaklığını gösterir. `RobotPeriodic()` her modda çalıştığı için **Start**'a basman gerekmez.

### Kart listesi {#kart-listesi}

ESP32-S3'ün pinleri yalnız 3,3 V kaldırır. Birçok Boardoza kartı 5 V ile beslenince denetleyiciye giden hatta 5 V verir. Tablodaki "5 V uyarısı" sütunu boşsa bu kart için bilinen bir 5 V tehlikesi yok; yine de kartı 3,3 V ile beslemek en güvenli yoldur.

| Kart | Sınıf | Arayüz | I2C adresi | 5 V uyarısı |
|---|---|---|---|---|
| LM75ADP | `LM75A` | I2C | 0x48-0x4F | Pull-up'lar belgelenmemiş; 3,3 V ile besle. |
| HIH8131 | `HIH8000` | I2C | 0x27 | Pull-up'lar belgelenmemiş; 3,3 V ile besle. |
| TH09C | `ENS210` | I2C | 0x43 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| MS5611 | `MS5611` | I2C | 0x77, 0x76 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| HP303B | `DPS310` | I2C | 0x77, 0x76 | Yalnız 3,3 V. |
| BME688 | `BME688` | I2C | 0x77, 0x76 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| OPT3001 | `OPT3001` | I2C | 0x44-0x47 | Pull-up gerilimi (3,3 V ya da VCC) doğrulanmadı; 3,3 V ile besle. |
| OPT4048 | `OPT4048` | I2C | 0x44-0x47 | Pull-up gerilimi (3,3 V ya da VCC) doğrulanmadı; 3,3 V ile besle. |
| TPiS-1S-1385 | `CaliPile` | I2C | 0x0C (kartta sabit) | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| TPiS-1T-1386 | `CaliPile` | I2C | 0x0C (doğrulanmadı, 0x0E olabilir) | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| MLX90640, MLX90641 | `MLX90640`, `MLX90641` | I2C, 400 kHz | 0x33 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| BNO055 | `BNO055` | I2C | 0x28, 0x29 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| BMI088 | `BMI088` | I2C (JP1'i kısa devre yap; kartın varsayılanı SPI) | İvme 0x19, jiroskop 0x69 (JP2 ile 0x18, 0x68) | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| LSM303AGR | `LSM303AGR` | I2C | İvme 0x19, manyetometre 0x1E | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| VL53L7CX-1 | `VL53L7CX` | I2C | 0x29 | Yalnız 3,3 V. |
| VL53L7CX-2, -3 | `VL53L7CX` | I2C | 0x29 | Seviye çevirici hatları beslemeye çeker; 3,3 V ile besle. |
| VL53L7CX-4 | `VL53L7CX` | I2C | 0x29 | 5 V ile beslenebilir; sinyaller 3,3 V kalır. |
| DRV2605L | `DRV2605L` | I2C | 0x5A | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| PCF8563 | `PCF8563` | I2C | 0x51 | I2C pull-up'ları büyük olasılıkla VCC'ye (doğrulanmadı); 3,3 V ile besle. |
| GP8403 | `GP8403` | I2C | 0x58-0x5F | I2C pull-up'ları VCC'ye. VOUT 10 V'a çıkar; hiçbir ADC pinine bağlama. |
| TPT29545 | `I2CSwitch` | I2C | 0x70-0x73 | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| NT3H2111 | `NT3H2111` | I2C | 0x55 | Kartın pin dizilimi doğrulanmadı. |
| NAU7802 | `NAU7802` + `LoadCell` | I2C | 0x2A | I2C pull-up'ları VCC'ye; 3,3 V ile besle. |
| HX711 | `HX711` + `LoadCell` | 2 GPIO (DAT, CLK) | | DOUT kartın DVDD gerilimine çıkar; 3,3 V ile besle. |
| SAM-M8Q, SAM-M10Q | `UbloxGnss` | I2C ya da UART | 0x42 | I2C pull-up'ları VCC'ye, seviye çeviriciler hatları 5 V'a çekebilir; 3,3 V ile besle. |
| GP-02 | `NmeaGnss` | UART | | Seviye çevirici hatları 5 V'a çekebilir; 3,3 V ile besle. |
| L9110S | `TwoPinHBridge` (`L9110S`) | 2 GPIO / motor | | R1-R4 girişleri motor beslemesine çeker. |
| BA6208 | `TwoPinHBridge` (`BA6208`) | 2 GPIO | | Giriş dirençleri ve VCC bağlantısı doğrulanmadı. |
| VNH7070AS | `VNH7070AS` | GPIO, CS için ADC1 | | CS arızada 5-7 V'a çıkar; bölücü kullan. |
| DRV8307 | `DRV8307` | GPIO | | Açık-drenaj çıkışlar 5 V'a çekilmiş olabilir. |
| DRV8317H | `DRV8317H` | 9 GPIO + nSLEEP, nFAULT | | Hall beslemesi "Ext" konumundaysa Hall hatlarında 5 V olabilir; DRV8317H kartının J3-2 pini bir 5 V girişidir. |
| W25Q40 | `W25QFlash` | SPI | | |
| W25N01GV | `W25NFlash` | SPI | | 3,3 V ile besle; 5 V'ta MISO 5 V olabilir. |
| MicroSD | `platform::MountSdCard` | SPI | | 5 V besleme (pin 6), kart hatları 3,3 V. |
| TMAG5170 | `TMAG5170` | SPI | | 5 V'ta MISO'yu 5 V sürer. |
| Phoenix4, 6, 12, 24 | `ClockedAddressableLED` | SPI (saat + veri, CS yok) | | DOUT/COUT kartın VDD geriliminde. |
| Phoenix12-WENC, Phoenix24-WENC, RotaryEncoder-ARGB | `ClockedAddressableLED` + `Encoder` + `DigitalInput` | SPI + GPIO | | Encoder ve düğme pull-up'ları VCC'ye; 3,3 V ile besle. |
| E22-900M22S | `SX126x` | SPI + BUSY, DIO1, NRST | | |
| IrDA-38kHz | `IRTransceiver` | GPIO (darbe gönderme ve yakalama) | | RXD VCC seviyesinde. |
| CMT2210LH | `OokReceiver` | GPIO (darbe yakalama) | | Yalnız 3,3 V. |
| PYD1598 | `PYD1598` | 2 GPIO | | Yalnız 3,3 V (en çok 3,6 V). |
| FT800, FT810 ve TFT paketleri | `FT8xx` | SPI | | 5 V besleme. FT8xx kartının J1 pin 1'i (3V3) bir çıkıştır; ona gerilim verme. |
| INA250A1 | `AnalogCurrentSensor` (`INA250A1`) | ADC1 pini | | |
| ACS758 | `AnalogCurrentSensor` (`ACS758LCB050B`) | ADC1 pini | | 5 V'ta bölücü gerekir. |

Bazı Boardoza kartlarını prosdk'nin var olan sınıfları sürer. Örnekler:

- ADXL345: `ADXL345_I2C`, adres 0x53 (sınıfın varsayılanı 0x1D değil).
- VNH5019 kartları: `VNH5019`. Encoder'lı VNH5019 kartında J1 pin 1 VIN'dir.
- RS485 kartları: `SerialPort`. RS485-5V kartının RXD hattı 5 V'tur.
- ATA6561 ve TPT71050 CAN alıcı-vericileri: `CAN`, yalnız klasik CAN.
- MQ4 gaz sensörü: `AnalogInput` ve `DigitalInput`. AO ve DO 5 V sinyaldir.

EN ya da SD pini olan güç kartları ve ses yükselteçleri `DigitalOutput` ile açılıp kapatılır. Regülatörler, şarj kartları, mikrodenetleyici kartları ve antenler için sınıf yoktur.

### Adres ve kaynak çakışmaları {#cakismalar}

Aynı I2C portunda aynı adresi kullanan iki kart çalışmaz. Kartları farklı portlara koy, adres pinleriyle birini taşı ya da TPT29545 anahtarını (`I2CSwitch`) kullan.

| Adres | Çakışan kartlar |
|---|---|
| 0x19 | BMI088 ivmeölçeri, LSM303AGR ivmeölçeri |
| 0x29 | VL53L7CX, ADR pini HIGH olan BNO055 |
| 0x40 | PCA9685 (ProHub), Probot Core'un INA batarya sensörü: [ProHub kartını kullan](#prohub) |
| 0x33 | MLX90640, MLX90641 |
| 0x44-0x47 | OPT3001, OPT4048 |
| 0x5A | DRV2605L, A2-A0 = 010 olan GP8403 |
| 0x68, 0x69 | BMI088 jiroskobu, MPU-6050 |
| 0x70 | TPT29545, PCA9685'in genel çağrı adresi (ProHub) |
| 0x76, 0x77 | MS5611, HP303B, BME688: bir portta en çok ikisi |
| 0x00 | CaliPile (TPiS) porttaki her cihaza genel çağrı gönderir. |

- Kendi okuma iş parçacığı olan bir sürücüyü `I2CSwitch` arkasına koyma.
- SPI'da çip seçme (CS) pini olmayan bir cihaz bütün bus'ı alır. Saatli LED kartları bir bus'ı tek başına kullanır; CS'li cihazlar diğer bus'ı paylaşır. Bus 0'da 6, bus 1'de 3 CS vardır.
- LED şeritleri, IR ve darbe vericileri toplam 3 gönderme kanalını paylaşır. Darbe yakalama için 4 kanal vardır.
- Encoder'lar, sayaçlar ve DRV8307'nin HALLOUT girişi toplam 4 sayaç birimini paylaşır.
- Analog girişler yalnız GPIO 1-10'dadır (ADC1). Pulse'un konnektörlerinde bunlar 1, 2, 7 ve 10'dur; J3'te I2C port 0 kullanılırken 7 ve 10 kalır.
- `VL53L7CX` her sketch'e yaklaşık 84 KiB yazılım ekler ve ilk `IsReady()` çağrısında bunu sensöre yükler (yaklaşık 2 saniye).
- Birçok sürücünün aynı anda çalıştığı bir robotta bellek ve işlemci yükü ölçülmedi.

### Boardoza örneklerini aç {#boardoza-ornekleri}

Dokuz örnek **File** > **Examples** > **prosdk** altındadır. Her örneğin bağlantısı `.ino` dosyasının başındaki yorumdadır.

| Örnek | Kartlar | Bağlantı |
|---|---|---|
| `BoardozaClimate` | LM75ADP, HIH8131, TH09C, MS5611, HP303B (port 1); BME688 (port 0) | Port 1: SDA 17, SCL 16 (J5), 100 kHz; port 0: SDA 1, SCL 2 (J3) |
| `BoardozaThermalCamera` | MLX90640, 32x24 görüntü, 8 Hz yenileme (saniyede 4 tam kare) | Port 1: SDA 17, SCL 16 (J5), 400 kHz |
| `BoardozaMultizoneToF` | VL53L7CX, 8x8 bölge, 15 Hz | Port 1: SDA 17, SCL 16 (J5), 400 kHz |
| `BoardozaLoadCell` | NAU7802 ve HX711, her biri bir `LoadCell` ile | NAU7802 port 1: SDA 17, SCL 16 (J5); HX711 DAT 38, CLK 37 (J6) |
| `BoardozaGnss` | SAM-M8Q/M10Q (I2C 0x42) ve GP-02 (UART, 9600 baud) | Port 1: SDA 17, SCL 16 (J5), 100 kHz; GP-02 `ONBOARD` seri portta: TX → GPIO 10, RX → GPIO 11 (J4) |
| `BoardozaSdLog` | MicroSD; `.wpilog` kayıtları `/sd/logs`'a | SPI bus 0 (J5): MISO 16, SCK 17, MOSI 15, CS 7; kartın pin 6'sına 5 V |
| `BoardozaRotaryArgb` | RotaryEncoder-ARGB: 14 LED, encoder, düğme | SPI bus 1: CIN 39, DIN 40 (J7); A 41, B 42 (J7), SW 38 (J6) |
| `BoardozaLoRa` | E22-900M22S, 868,1 MHz, 14 dBm | SPI bus 0 (J5): MISO 16, MOSI 15, SCK 17, nCS 7; NRST 36, BUSY 38, DIO1 37, RXEN 35 (J6), TXEN 39 (J7) |
| `BoardozaEveDisplay` | FT810 paketi, 800x480 ekran; batarya göstergesi ve dokunmatik düğme | SPI bus 0 (J5): CS 7, MISO 16, MOSI 15, SCK 17; PD 38, INT 37 (J6); 5 V besleme |

Örneklerin bazı pinleri bu rehberin sürüş ve servo pinleriyle (35-38, 47, 48 ve 7), encoder pinleriyle (39-42) ve ProHub pinleriyle (1, 2, 10, 11) çakışır. I2C port 1 ile SPI bus 0 J5'te aynı pinleri kullandığı için iki grubun örnekleri bir robotta birleşmez. Bir örneği robot koduna eklerken pinleri birbirinden ayır.

- `BoardozaLoRa` 868 MHz bandında yayın yapar. Frekansı ya da gücü değiştirmeden önce ülkendeki kuralları kontrol et ve antensiz yayın yapma.
- `BoardozaEveDisplay`'de **Emergency Stop** PD pinini LOW'a çeker. Ekran kart yeniden başlatılana kadar karanlık kalır.
- `BoardozaSdLog`'da kart FAT16 ya da FAT32 olmalı; exFAT desteklenmez. Kart yoksa kayıt `/littlefs/logs`'a gider; LittleFS'i örnek değil, prosdk ilk `DataLogManager` çağrısında bağlar. Kayıtlar: [Kaydı SD karta yaz](kayit-tut.md#sd-kart).

## Sorun mu var?

- **Konsolda `PCA9685 0x40: no answer on I2C port 0; retrying` yazıyor, ProHub motorları dönmüyor:** PCA9685 yanıt vermiyor. `prohub::ConfigurePins()` satırının sınıfın ilk üyesi olduğunu ve SDA/SCL kablolarını kontrol et.
- **Probot Core'un INA batarya sensörü açık, ProHub motorları dönmüyor:** INA varsayılan olarak PCA9685'in adresini (0x40) kullanır. A0/A1 pinleriyle INA'ya 0x40 ve 0x41 dışında bir adres ver (`PROBOT_BATTERY_INA_ADDR`): [ProHub kartını kullan](#prohub).
- **Konsolda `MPU6050 0x68 on I2C port 0: no answer` yazıyor:** I2C pinlerini ve sensörün beslemesini kontrol et. Sensör I2C port 0'ın hattında, Pulse'un J3 konnektöründe (GPIO 1/2) olmalı. AD0 pini HIGH ise kurucuya `0x69` ver.
- **Robot programı `Digital PWM: all 6 generators are in use` ile durdu:** H köprüleri 6'dan çok üreteç istiyor. [PWM üreteci sınırları](#pwm-ureteci) tablosuna göre motor sayısını azalt ya da BTS7960'ları `PWM_ON_ENABLE` ile bağla.
- **Robot programı `runs at ... Hz: its period (... us) is shorter than the servo pulse` ile durdu:** Servo, periyodu servonun en uzun darbesinden kısa olan bir PCA9685'te. Varsayılan servo aralığında bu, yaklaşık 417 Hz ve üstüdür. Servolu çipin frekansını en çok 400 Hz yap.
- **Yaw kendi kendine artıyor:** Kart açılırken robot kıpırdadı ya da `Calibrate()` çağrılmadı. [MPU-6050'yi oku](#mpu6050).
- **Robot programı `GPIO ...` ya da `has no pins` içeren bir pin hatasıyla durdu:** [Pin kullanılamıyor](sorunlar.md#pin).

## Sonraki adım

[Kayıt tut ve dosyaları indir](kayit-tut.md)
