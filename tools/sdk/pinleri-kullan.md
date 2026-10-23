# Pinleri ve donanımı kullan

Bu sayfada prosdk'nin pin sınıflarını ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartının konnektörlerindeki GPIO'lara bağlayacaksın. Hangi pinlerin kullanılabildiğini, her donanım biriminden kaç tane olduğunu ve robot disabled iken hangi çıkışların kapandığını öğreneceksin.

## Başlamadan önce

- İlk robot kodunu yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Bağlayacağın sensörün ya da sürücünün sinyal pinleri 3,3 V ile çalışıyor ya da araya seviye dönüştürücü koydun.
- Kumanda bilgisayara bağlı.

Probot kitinin ana kartı Pulse'tur. Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Bu sayfadaki pin numaraları Pulse'un konnektörlerindeki pinlerdir; kendi kablolamana göre değiştir. Pinlerin ve donanım birimlerinin davranışı kaynak koddan yazıldı; prosdk henüz gerçek bir kartta, Pulse'ta da denenmedi.

## Pin sınıfına GPIO numarasını ver {#kanal}

prosdk'de her pin sınıfı kanal numarası olarak GPIO numarasını alır: `DigitalInput`, `DigitalOutput`, `PWM`, motor sürücüleri, `Encoder`, `AnalogInput`, `DutyCycle`, `AddressableLED`. roboRIO'daki gibi DIO 0-9 ya da PWM 0-9 başlıkları yoktur. `prosdk::DigitalInput input{17};` GPIO 17'yi kullanır; Pulse'ta bu pin J5 konnektöründedir.

Pin sınıflarının hazır örneklerinin adı `Snippet` ile başlar ve **File** > **Examples** > **prosdk** altındadır: [Snippet'ler](ornek-listesi.md#snippetler).

Aşağıdaki örnek bir PWM motor sürücüsünü, bir encoder'ı, bir analog sensörü ve bir anahtarı aynı robotta kullanır.

| Parça | Sınıf | GPIO | Pulse konnektörü |
|---|---|---|---|
| PWM ile sürülen motor sürücüsü (ESC) | `prosdk::PWMSparkMax` | 38 | J6 |
| Encoder A / B | `prosdk::Encoder` | 39 / 40 | J7 |
| Potansiyometre (0-3,1 V) | `prosdk::AnalogInput` | 1 | J3 |
| Anahtar, öbür ucu GND'de | `prosdk::DigitalInput` | 17 | J5 |

1. Parçaları tablodaki pinlere bağla. Potansiyometrenin iki dış ucunu J3'ün GND ve +3V3 pinlerine, anahtarın öbür ucunu J5'in GND pinine, ESC'nin ve encoder'ın GND'sini de kendi konnektörlerinin GND pinine bağla.
2. Arduino IDE'de **File** > **New Sketch**'i seç, açılan sketch'teki her satırı sil ve aşağıdaki kodu yapıştır.
3. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
4. Kodu karta yükle: [Kodu karta yükle](ilk-robotu-yaz.md#kodu-yukle).
5. Robotun ağına bağlan ve `http://192.168.4.1` adresini aç.
6. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
7. **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/drivers/motor/PWMSparkMax.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/hardware/discrete/AnalogInput.hpp>
#include <prosdk/hardware/discrete/DigitalInput.hpp>
#include <prosdk/hardware/rotation/Encoder.hpp>
#include <prosdk/telemetry/Telemetry.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    // turda 360 tık (4X), 6 cm çaplı tekerlek: mesafe santimetre olarak okunur
    encoder.SetDistancePerPulse(3.1416 * 6.0 / 360.0);
  }

  void TeleopPeriodic() override {
    // Anahtar basılıyken (false) motor durur
    if (limitSwitch.Get()) {
      motor.SetThrottle(-gamepad.GetLeftY());
    } else {
      motor.StopMotor();
    }
  }

  void RobotPeriodic() override {
    prosdk::telemetry::Log("Encoder/Mesafe", encoder.GetDistance());
    prosdk::telemetry::Log("Potansiyometre/Volt", pot.GetVoltage());
    prosdk::telemetry::Log("Anahtar", limitSwitch.Get());
  }

 private:
  prosdk::PWMSparkMax motor{38};          // PWM çıkışı, GPIO 38 (J6)
  prosdk::Encoder encoder{39, 40};        // A = GPIO 39, B = GPIO 40 (J7)
  prosdk::AnalogInput pot{1};             // GPIO 1 (J3); analog yalnız GPIO 1-10
  prosdk::DigitalInput limitSwitch{17};   // GPIO 17 (J5), iç pull-up: açık anahtar true okunur
  prosdk::Gamepad gamepad{0};
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Veri** sekmesinde `/Telemetry/Encoder/Mesafe`, `/Telemetry/Potansiyometre/Volt` ve `/Telemetry/Anahtar` görünür. Sol çubuğu ileri itince motor döner; anahtara basınca durur.

- Kendi parçan için [kullanılabilir pinler](#kullanilabilir-pinler) listesinden boş bir GPIO seç. Sınıfın başlık dosyasını `#include <prosdk.h>` satırının altına ekle, parçayı robot sınıfında GPIO numarasıyla üye olarak kur ve değerini `RobotPeriodic()` içinde `prosdk::telemetry::Log` ile gönder.
- `DigitalInput` iç pull-up direncini açar. Anahtarı pin ile GND arasına bağla: anahtar açıkken `Get()` `true`, basılıyken `false` okur.
- Analog giriş 12 bittir: `GetValue()` 0-4095, `GetVoltage()` yaklaşık 0-3,1 V verir.
- J3, I2C port 0'ın da konnektörüdür. Robotta bir I2C cihazı varsa potansiyometreyi GPIO 7'ye (J5) ya da GPIO 10'a (J4) taşı: [Analog pinleri seç](#analog-pinler).
- `Encoder` varsayılan olarak 4X çözümler: A ve B'nin her kenarı bir tık sayılır. Turda 90 darbe (PPR) veren bir encoder turda 360 tık verir.
- Encoder için iki farklı boş GPIO kullan; GPIO 45'i kullanma: [Açılış pinlerini en son kullan](#acilis-pinleri). İki kanala aynı numarayı ya da ESP32-S3'te olmayan bir GPIO'yu (GPIO 22-25 ya da 0-48 aralığının dışı) verirsen kurulum `Encoder channels ... and ... must be two different ESP32-S3 GPIOs` hatasıyla durur.
- Encoder'ın hızı (`GetRate()`) son 50 ms'deki darbelerden hesaplanır. 1 µs'den kısa darbeler gürültü sayılır ve atılır.

## Pulse'un konnektörlerini tanı {#pulse-konnektorleri}

Pulse'ta ESP32-S3'ün yalnız 20 kullanılabilir GPIO'su bir konnektöre çıkar. Kablolamayı bu tablodaki pinlerle yap.

| Konnektör | Pin sırası (1. pinden son pine) | prosdk'de |
|---|---|---|
| J3 (I2C) | GND, SCL (GPIO 2), SDA (GPIO 1), +3V3 | I2C port 0'ın varsayılan pinleri. I2C kullanmıyorsan analog giriş. |
| J4 (UART) | GND, TX (GPIO 43), RX (GPIO 44), F2 (GPIO 11), F1 (GPIO 10), +3V3 | 43 ve 44 açılış konsolunundur, prosdk reddeder. 10 ve 11 `ONBOARD` seri portun varsayılanıdır (RX 10, TX 11). GPIO 10 analog da okur. |
| J5 (SPI) | GND, CLK (GPIO 17), CS (GPIO 7), MISO (GPIO 16), MOSI (GPIO 15), +3V3 | SPI bus 0'ın varsayılan pinleri (SCK 17, MOSI 15, MISO 16); CS 7 cihazındır. GPIO 7 analog da okur. |
| J6 | GND, GPIO 38, 37, 36, 35, +3V3 | Serbest GPIO. Rehberin sol BTS7960'ı ve sağ BTS7960'ın RPWM'i. |
| J7 | GND, GPIO 42, 41, 40, 39, +3V3 | Serbest GPIO, aynı zamanda JTAG pinleri. Rehberin iki encoder'ı. |
| J8 | GND, GPIO 45, 46, 47, 48, +3V3 | Serbest GPIO. 45 ve 46 açılış pinidir: [Açılış pinlerini en son kullan](#acilis-pinleri). 47 ve 48 rehberin sağ BTS7960'ı. |

Her konnektörün ilk pini GND, son pini +3V3'tür. Pin sırası kartın üstündeki yazılardan alındı; kartın devre şeması elimizde yok ve sıra donanımda doğrulanmadı.

Kartın üstünde şunlar var:

- GPIO 0'daki **BOOT** düğmesi ve **RESET** düğmesi,
- GPIO 3'teki RGB LED: Probot Core'un durum LED'i, prosdk bu pini reddeder,
- USB-C portu: kartın görselinden çipin kendi USB'sine (GPIO 19 ve 20) bağlı olduğu anlaşılıyor, donanımda doğrulanmadı; prosdk bu iki pini reddeder,
- J1: 1S batarya girişi. Batarya geriliminin hangi GPIO'dan ölçüldüğü henüz bilinmiyor.

Kartta IMU ya da başka bir I2C sensörü yok. GPIO 4-6, 8, 9, 12-14, 18, 21, 33 ve 34 hiçbir konnektöre çıkmaz.

### Rehberin motor ve encoder pinleri {#rehber-pinleri}

Bu rehberin sayfaları iki BTS7960 motor sürücüsünü ve iki encoder'ı şu pinlere bağlar:

| Parça | Sinyal | GPIO | Konnektör |
|---|---|---|---|
| Sol BTS7960 | RPWM / LPWM / R_EN + L_EN | 38 / 37 / 36 | J6 |
| Sağ BTS7960 | RPWM / LPWM / R_EN + L_EN | 35 / 47 / 48 | J6 / J8 / J8 |
| Sol encoder | A / B | 39 / 40 | J7 |
| Sağ encoder | A / B | 41 / 42 | J7 |

Kodda: `prosdk::BTS7960 left{38, 37, 36};` ve `prosdk::BTS7960 right{35, 47, 48};`. Encoder'lar prosdk örnekleriyle aynı pinlerdedir. Bu bağlantıdan sonra J3, J4'ün 10/11'i, J5 ve J8'in 45/46'sı boş kalır.

## Kullanılabilir pinleri seç {#kullanilabilir-pinler}

ESP32-S3'te GPIO 0-21 ve 26-48 vardır. Bunların bir kısmını kart ya da Probot Core kullanır; prosdk bu pinleri reddeder.

| GPIO | Neden kullanılamaz |
|---|---|
| 22, 23, 24, 25 | ESP32-S3'te yok. |
| 19, 20 | USB D-/D+: çipin kendi USB'si, kod yükleme. Pulse'un USB-C portu büyük olasılıkla bu pinlere bağlı. |
| 43, 44 | UART0: açılış konsolu (Pulse'ta J4'teki TX ve RX). |
| 26-32 | Modülün flash ve PSRAM belleği. |
| 3 | Probot Core'un durum LED'i (`NEOPIXEL_PIN`, varsayılan 3), Pulse'un RGB LED'i. |
| Probot Core ayarlarına yazdığın pinler | `PROBOT_RSL_PIN`, `PROBOT_ESTOP_ENABLE_PIN`, `PROBOT_BATTERY_ADC_PIN`. `PROBOT_BATTERY_INA` tanımlıysa INA sensörünün I2C pinleri (`PROBOT_BATTERY_INA_SDA` ve `PROBOT_BATTERY_INA_SCL`, yazmadıysan 1 ve 2, J3). Bu pinler başka işe verilemez; I2C port 0 ise bu bus'ı INA ile paylaşır. |
| Arduino koduyla kullandığın pinler | `Wire`, `Serial1`, `ledcAttach`, `analogRead` gibi bir Arduino sürücüsüne bağlı pin. |
| 0'dan küçük ya da 48'den büyük | Böyle bir GPIO yok. |

Reddedilen bir pini sınıf üyesi olarak kurarsan robotun kurucusu hata fırlatır ve robot programı durur. Konsolda hata satırı ve ardından `[prosdk] robot program Robot halted: its constructor threw an exception. Outputs stay disabled until reboot.` satırı çıkar. Pini değiştirip kodu yeniden yükle: [Kod hata fırlatırsa](robot-sinifini-sec.md#halt).

Her hata metni ve çözümü: [Pin kullanılamıyor](sorunlar.md#pin).

prosdk geriye kalan pinleri kabul eder. Pulse'ta bunlardan konnektöre çıkanlar şunlardır: **GPIO 1, 2, 7, 10, 11, 15-17, 35-42 ve 45-48**. Pulse'un modülündeki PSRAM dört hatlıdır (quad), bu yüzden GPIO 33-37 boştur; 35-37 J6'dadır.

Durum LED'ini `NEOPIXEL_PIN` ile başka bir pine taşırsan GPIO 3 boşalır. prosdk'de `#define NEOPIXEL_PIN ...` satırını WiFi satırlarının yanına, `#include <prosdk.h>`'den önce yaz: [Durum LED'ini kullan](../core/led-durumu.md#led-pini). Pulse'un RGB LED'i GPIO 3'e bağlı olduğu için LED'i taşırsan kartın LED'i durumu göstermez.

!!! warning "Dikkat"
    ESP32-S3 pinleri 3,3 V'tur ve 5 V'a dayanıklı değildir. 5 V ile beslenen bir kart sinyal pinine 5 V verebilir; araya seviye dönüştürücü (level shifter) koy. 5 V'luk LED şeritlerin veri hattı da seviye dönüştürücü isteyebilir.

### Açılış pinlerini en son kullan {#acilis-pinleri}

ESP32-S3'ün açılış (strapping) pinleri GPIO 0, 3, 45 ve 46'dır. Pulse'ta GPIO 0 **BOOT** düğmesine, GPIO 3 RGB LED'e bağlıdır; 45 ve 46 J8 konnektöründedir. prosdk GPIO 0, 45 ve 46'yı reddetmez ve uyarı da yazmaz, ama çip bu pinlerin seviyesini kart açılırken okur:

- **GPIO 0**: Açılışta LOW tutulursa kart indirme (download) modunda kalır ve kodun başlamaz. **BOOT** düğmesine basılı tutarak kartı açarsan olan budur.
- **GPIO 45**: Açılışta HIGH tutulursa çip flash belleği 1,8 V ile besler ve kart açılmayabilir. Boştayken HIGH veren bir encoder ya da sensör çıkışı, pull-up direnci ya da 3,3 V'a giden bir anahtar buna yol açar. GPIO 45'e encoder ya da boştayken HIGH veren bir giriş bağlama.
- **GPIO 46**: Yalnız GPIO 0 LOW iken önem taşır; normal açılış onu okumaz. J8'deki iki açılış pininin daha güvenlisidir.

45 ve 46'ya açılışta seviyelerini değiştiren bir yük (pull-up ya da pull-down direnci, boştayken HIGH veren bir çıkış) bağlama. Bu iki pini en son kullan ve önce GPIO 46'yı seç.

### Her pini bir kez kullan {#pin-sahibi}

Her pinin tek sahibi olur. Aynı GPIO'yu iki nesneye verirsen ikincisi `PWM 38 previously allocated.` gibi bir hatayla durur. Mesaj pinin ilk nerede kullanıldığını da gösterir.

Açılan bir seri port, başlatılan CAN veriyolu, SPI pinleri ve SD kartın CS pini de pinlerini aynı şekilde tutar. CAN pinleri kart yeniden başlatılana kadar serbest kalmaz.

### Analog pinleri seç {#analog-pinler}

Analog giriş yalnız **GPIO 1-10**'da çalışır (ADC1). GPIO 11-20 ADC2'dir ve WiFi açıkken okunamaz. Driver Station WiFi ile bağlandığı için prosdk onları reddeder.

GPIO 1-10 dışındaki her pin için hata metni: `Invalid Index for Analog (GPIO 1-10, ADC1; ADC2 cannot be used with WiFi)`.

Pulse'un konnektörlerinde bunlardan dördü var: GPIO 1 ve 2 (J3), 7 (J5) ve 10 (J4). J3'ü I2C için kullanıyorsan analog için 7 ve 10 kalır. GPIO 7 SPI cihazının CS pini, GPIO 10 `ONBOARD` seri portun RX pinidir; analog için kullandığın pini bu işlere verme.

### Örneklerin pin planından başla {#ornek-pin-plani}

prosdk örnekleri Pulse'un konnektörlerindeki şu pinleri kullanır. Kendi robotunda başlangıç noktası olarak kullanabilirsin.

| Kullanım | GPIO (Pulse konnektörü) |
|---|---|
| PWM motor sürücüleri | 38, 37, 36, 35 (J6); fazlası: 47, 48 (J8) |
| Encoder A/B | 39/40, 41/42 (J7); 47/48 (J8); 15/16 (J5, SPI kullanılmıyorsa) |
| Dijital giriş/çıkış, görev oranı (duty cycle) | 17, 16 (J5), 10, 11 (J4) |
| Analog giriş | I2C yoksa 1, 2 (J3); J3 I2C ise 7 (J5), 10 (J4) |
| LED şerit | 48 (J8) |
| I2C port 0 (varsayılan) | SDA 1, SCL 2 (J3) |
| I2C port 1 (Boardoza sensör örnekleri) | SDA 17, SCL 16 (J5) |
| SPI bus 0 (varsayılan) | SCK 17, MOSI 15, MISO 16, CS 7 (J5) |
| `ONBOARD` seri port (varsayılan) | RX 10, TX 11 (J4) |

Örnekler GPIO 0 ve 45'i hiç kullanmaz. SwerveBot ve SwerveDrivePoseEstimator 24 sinyal ister ve konnektörlere sığmaz: konnektörde olmayan pinler de kullanır, bir encoder girişi için de GPIO 46'yı kullanır. Bunu iki örnek de bağlantı açıklamasında yazar.

Aynı pin plan içinde birden çok işte geçer; aynı robotta her pine tek iş ver:

- J5'teki 15, 16 ve 17 SPI bus 0'ın pinleridir. Boardoza sensör örnekleri I2C port 1'i de 17/16'ya koyar; I2C port 1'i J5'te kullanırken SPI bus 0'ı kullanamazsın.
- 10 ve 11 hem dijital giriş/çıkış hem `ONBOARD` seri portun varsayılan pinleridir.
- 47 ve 48 fazladan PWM, encoder ve LED şerit (48) olarak geçer.

Bu rehberdeki BTS7960 bağlantısı J6'nın dört pinini ve J8'in 47/48'ini kullanır: [Rehberin motor ve encoder pinleri](#rehber-pinleri). O robotta örneklerin PWM motor pinleri doludur; J7'deki encoder pinleri boş kalır.

ProHub kullanırsan J3'teki GPIO 1 ve 2 (I2C port 0) ile J4'teki 10 ve 11 (`ONBOARD` seri port, encoder verisi) ProHub'a gider. O robotta analog giriş için konnektörlerde GPIO 7 (J5) kalır; dijital girişleri J5'in 16/17'sine ya da J6-J8'deki boş pinlere bağla. Bu pinler Pulse'ta zaten prosdk'nin varsayılanıdır; `prohub::ConfigurePins()` satırı Pulse'ta bir şey değiştirmez: [ProHub kartını kullan](surucu-kullan.md#prohub).

Probot Core 0.5.0'da INA batarya sensörü (`PROBOT_BATTERY_INA`) varsayılan olarak J3'tedir (SDA 1, SCL 2), yani I2C port 0 ile aynı bus'tadır. INA açıkken bu bus 100 kHz'de çalışır. Bus'ı paylaşmak güvenlidir: prosdk'nin I2C okumaları INA'nın okumalarını bozmaz. Robot kodun Arduino `Wire`'ı doğrudan kullanıyorsa Probot Core'un uyarısına uy: [INA219 ya da INA226 sensörü kullan](../core/bataryayi-olc.md#ina-sensoru). INA'nın varsayılan adresi (0x40) ProHub'daki PCA9685'inkiyle aynıdır: [ProHub kartını kullan](surucu-kullan.md#prohub).

### Başka bir ESP32-S3 kartında bus pinlerini taşı {#baska-kart}

prosdk'nin varsayılan bus pinleri (I2C port 0 SDA 1 / SCL 2, `ONBOARD` RX 10 / TX 11, SPI bus 0 SCK 17 / MOSI 15 / MISO 16) Pulse'un konnektörlerine göredir. Başka bir ESP32-S3 kartında bu pinler başka bir işe bağlı olabilir. Bus'ları robot sınıfının ilk üyesinde, hiçbir cihaz kurulmadan önce kendi kartının pinlerine taşı:

```cpp
// Dosyanın başına, diğer #include satırlarının yanına:
#include <prosdk/platform/HalConfig.hpp>

// Robot sınıfının ilk üyesi: bus pinlerini kartına göre yaz
bool m_pinsConfigured = prosdk::platform::SetI2CPins(0, 8, 9) &&       // SDA, SCL
                        prosdk::platform::SetSerialPins(0, 15, 16) &&  // RX, TX
                        prosdk::platform::SetSPIPins(0, 12, 11, 13);   // SCK, MOSI, MISO
```

Sekiz hatlı (octal) PSRAM'li modüllerde (N8R8, N16R8) GPIO 33-37 PSRAM'e bağlıdır ve prosdk bu pinleri reddetmez. Bu kartlarda 33-37'yi kullanma; rehberin 35-37'deki motor pinlerini başka pinlere taşı (ör. 4, 5, 12). Kartın USB portu bir USB-UART köprü yongasından geçiyorsa **USB CDC On Boot**'u **Disabled** yap. Bütün kart ayarları: [Başka bir ESP32-S3 kartı kullan](kur.md#baska-kart). Fonksiyonların ayrıntısı: [Bus pinlerini ayarla](surucu-kullan.md#bus-pinleri).

## Donanım birimlerinin sınırına dikkat et {#kapasite}

Pinler serbestçe seçilir, ama arkalarındaki donanım birimleri sınırlıdır. Bir birim tükenince yeni nesnenin kurulumu hata verir ve robot programı durur. Konsoldaki hata metinleri: [Donanım birimi tükendi](sorunlar.md#kapasite-doldu).

| Kaynak | Sınıflar | Sayı | Not |
|---|---|---|---|
| Dijital giriş/çıkış | `DigitalInput`, `DigitalOutput` | Her boş GPIO | Girişlerde iç pull-up açıktır. |
| PWM çıkışı | `PWM`, `Servo`, PWM motor sürücüleri | 12 | Aynı zamanlayıcıdaki 2 çıkış aynı periyodu paylaşır: en çok 6 farklı periyot grubu. |
| Sayaç ve encoder | `Encoder`, `EdgeCounter`, `Tachometer` | 4, toplam | Her biri bir birim kullanır. |
| Görev oranı girişi | `DutyCycle`, `DutyCycleEncoder` | 6 | 100 ms kenar gelmezse frekans 0 okunur. |
| Analog giriş | `AnalogInput` | 10 | Yalnız GPIO 1-10; Pulse'un konnektörlerinde 1, 2, 7, 10: [Analog pinleri seç](#analog-pinler). |
| LED şerit ve darbe vericisi | `AddressableLED`, `PulseTransmitter` | 3, toplam | 1024 LED'lik tek ortak tampon. Dördüncü kanalı Probot Core'un durum LED'i kullanır. |
| Darbe yakalama | `PulseCapture` | 4 | |
| Dijital PWM üreteci | `DigitalOutput::EnablePWM` (H köprü sürücüleri) | 6 | Bütün üreteçler tek frekansta: 5 Hz-40 kHz, varsayılan 500 Hz. Rehberin iki BTS7960'ı bunların 4'ünü kullanır. |
| I2C portu | `I2C` | 2 | `I2C::Port::PORT_0` varsayılan SDA 1, SCL 2 (J3), 400 kHz. Probot Core'un INA batarya sensörü açıksa `PORT_0` bus'ı INA ile paylaşır ve 100 kHz'de çalışır. `PORT_1`'in varsayılan pini yok. |
| Seri port | `SerialPort` | 2 | `SerialPort::Port::ONBOARD` (UART1) varsayılan RX 10, TX 11 (J4). `MXP` (UART2) portunun varsayılan pini yok. `USB_1` ve `USB_2` robotta yok. |
| SPI veriyolu | `SPI` | 2 | `SPI::kPort0` (SPI2) varsayılan SCK 17, MOSI 15, MISO 16 (J5); CS pinini cihaz verir (Pulse'ta J5'teki GPIO 7). `kPort1` (SPI3) portunun varsayılan pini yok. `kPort0`'da en çok 6, `kPort1`'de en çok 3 cihaz (donanım CS sayısı). CS'siz bir cihaz veriyolunu tek başına kullanır. |
| CAN veriyolu | `CAN` | 1 | Harici bir CAN alıcı-vericisi (transceiver) gerekir. Yalnız klasik CAN. |
| Six-step BLDC motor | `DRV8317H` | 2 | Her motor 12 PWM çıkışından 2'sini kullanır. |

Varsayılan pini olmayan portların pinleri `#include <prosdk/platform/HalConfig.hpp>` ile gelen `prosdk::platform::SetI2CPins`, `SetSerialPins`, `SetSPIPins` ve `SetCanConfig` fonksiyonlarıyla, port açılmadan önce verilir: [Bus pinlerini ayarla](surucu-kullan.md#bus-pinleri).

PWM periyotlarına dikkat et. `Spark`, `PWMSparkMax`, `PWMTalonFX` gibi PWM motor sürücüleri 5 ms (200 Hz), `Servo` ve `Koors40` 20 ms (50 Hz) kullanır. Bir 5 ms'lik sürücü ile bir 20 ms'lik servo aynı zamanlayıcıya giremez.

Çok sayıda karışık periyot, 12 çıkışın hepsi dolmadan zamanlayıcıları bitirebilir. Dijital PWM üreteçleri bu zamanlayıcıları kullanmaz.

`DigitalOutput::SetPWMRate` bütün dijital PWM üreteçlerinin frekansını birlikte değiştirir. prosdk'nin H köprü sürücüleri (BTS7960, VNH5019 ve diğerleri) 20 kHz kullanır.

## Çıkışların ne zaman kapandığını bil {#cikis-kapisi}

prosdk'nin çıkış kapısı (output gate), motorlara giden sinyalleri yalnız robot gerçekten çalışırken geçirir. Kapı şu koşulların hepsi sağlanınca açılır:

- Driver Station robotun kontrolünü tutuyor (bağlantı koptuktan sonra en çok 5 saniye daha tutar),
- Driver Station'da **Start**'a basılmış ve mod çalışıyor,
- döngü takılmamış (Probot Core'un 2 saniyelik sınırı aşılmamış),
- **Emergency Stop**'a basılmamış,
- robot programı durmamış.

Driver Station bağlantısı koparsa kapı o an kapanmaz. Probot Core'un varsayılan ayarlarıyla şunlar olur:

| Bağlantı koptuktan sonra | Ne olur |
|---|---|
| Yaklaşık 0,5 saniye | Kumanda değerleri sıfırlanır: çubuklar ortada, düğmeler bırakılmış okunur. |
| 5 saniye | Probot Core, Driver Station'ı robottan ayrılmış sayar. Robot kodun robotu disabled görür (`DisabledInit()` çalışır) ve kapı kapanır. |
| 10 saniye | Probot Core çalışan modu da durdurur. |

İlk 5 saniyede kodunun kumandadan bağımsız verdiği komutlar (ör. otonomdaki sabit hız) motorlara gitmeye devam eder. Driver Station 5 ile 10 saniye arasında yeniden bağlanırsa robot **Start**'a basmadan yeniden enabled olur: [Driver Station düğmeleri hangi fonksiyonu çalıştırır](robot-sinifini-sec.md#modlar).

Kapı kapalıyken PWM çıkışları LOW'a çekilir; servolar ve ESC'ler sinyal görmez ve durur. Dijital PWM üreteçlerinin görev oranı 0 olur, BTS7960 gibi H köprüleri de böylece durur. Kapalıyken verdiğin değerler saklanır ve **Start**'ta uygulanır.

Kapı her döngü turundan önce ve ayrıca her 10 ms'de bir yeniden denetlenir. Kodun takılsa bile robot disabled olduktan sonra çıkışlar yaklaşık 10 ms içinde kapanır.

Şu çıkışlar kapıdan geçmez; robot disabled iken de son değerlerini korur:

| Çıkış | Disabled iken | Emergency Stop'ta |
|---|---|---|
| `DigitalOutput` seviyesi (ör. röle, sürücü enable pini) | Son değerini korur (roboRIO'daki gibi). | LOW'a çekilir. Yeniden başlatana kadar yazılanlar yok sayılır. |
| `AddressableLED` LED şerit | Çalışmaya devam eder. | Veri hattı LOW'a çekilir. |
| `PulseTransmitter` | Çalışmaya devam eder. | Pin LOW'a çekilir. |
| `I2C`, `SPI`, `SerialPort` | Çalışmaya devam eder. | Pinleri LOW'a çekilmez. |
| `CAN` | Çalışmaya devam eder. | Periyodik mesajlar durur, yeni gönderimler reddedilir. |

Bir röleyi ya da enable pinini robot dururken kapatmak istiyorsan bunu kendin yap:

```cpp
// Dosyanın başına, diğer #include satırlarının yanına:
#include <prosdk/hardware/discrete/DigitalOutput.hpp>

// Robot sınıfının içine:
prosdk::DigitalOutput relay{17};  // röle, GPIO 17 (J5)

// Robot disabled olunca röleyi kapat: DigitalOutput kapıdan geçmez
void DisabledInit() override { relay.Set(false); }
```

Robot programı durursa ya da döngü takılırsa `DisabledInit()` çalışmaz. `DigitalOutput` o zaman seviyesini kart yeniden başlatılana ya da **Emergency Stop**'a basılana kadar korur. Mutlaka kapanması gereken bir çıkış için kapıdan geçen bir çıkış (`PWM` ya da `DigitalOutput::EnablePWM`) ya da gücü kesen bir donanım kullan.

**Emergency Stop**'tan sonra robot kodun bir daha çalışmaz; kartı yeniden başlat. prosdk bütün çıkış pinlerini (PWM, `DigitalOutput`, LED veri hattı, darbe vericisi) LOW'a çeker. Bu roboRIO'dan farklıdır: roboRIO DIO çıkışlarını korur.

Düşük batarya gerilimi (brownout) yalnız bildirilir. roboRIO'daki gibi çıkışları donanımla kesmez.

!!! warning "Dikkat"
    PCA9685 (ProHub) çıkışları I2C üzerinden yazılır. Robot disabled olunca sürücü çipe "hepsini kapat" komutunu gönderir. **Emergency Stop** anında robot kodu I2C veriyolunu tutuyorsa bu komut gidemez ve PCA9685 çıkışları son değerlerinde kalır. Kesin durdurma için gücü kesen bir donanım acil durdurması kullan.

## Kitte olmayan donanımı kullanma {#desteklenmeyen}

WPILib'in bazı sınıfları prosdk'de derlenir ama Probot kitinde karşılığı yoktur. Kod derlenir, hata robotta çalışırken çıkar.

| Sınıf ya da fonksiyon | Robotta ne olur |
|---|---|
| `Solenoid`, `DoubleSolenoid`, `Compressor`, `PneumaticsControlModule`, `PneumaticHub` | Kurulum hata verir, robot programı durur. Mesaj: `CTRE PCM is not supported by the ESP32-S3 HAL (no FRC CAN devices)` ya da `REV PH` ile başlayan aynı metin. |
| `PowerDistribution` | Kurulum hata verir, robot programı durur. Mesaj: `Power distribution (PDP/PDH) is not supported by the ESP32-S3 HAL (no FRC CAN devices)`. |
| `OnboardIMU` | Pulse'ta IMU yok. Sınıf kurulur; `GetYaw()` ve `GetRotation2d()` hep 0 döner, `ResetYaw()` hata vermez. Diğer bütün okumalar (`GetQuaternion()`, `GetRotation3d()`, açı, dönüş hızı, ivme) `The ESP32-S3 Probot board has no onboard IMU` hatasıyla programı durdurur. Yerine kitin IMU'sunu kullan, ör. `prosdk::MPU6050 imu{prosdk::I2C::Port::PORT_0};` (aynı okuma fonksiyonları): [MPU-6050'yi oku](surucu-kullan.md#mpu6050). |
| `DigitalOutput::Pulse()`, `IsPulsing()` | `DIO pulses are not supported by the ESP32-S3 HAL` hatasıyla program durur. |
| `DigitalOutput::EnablePPS()` | `Digital PWM PPS mode is not supported by the ESP32-S3 HAL (use EnablePWM)` hatasıyla program durur. |
| Kesmeler (interrupt) | WPILib 2027'de kesme sınıfı yok, prosdk'de de yok. Girişi her döngü turunda oku ya da darbeleri `EdgeCounter` ile say. |
| `...Sim` sınıfları, `SimDevice` | Robotta hiçbir şey yapmaz. prosdk'de masaüstü simülasyonu yok. |

Bütün farklar: [WPILib'den farklar](wpilib-farklari.md#gelmeyenler).

## Sorun mu var?

- **Konsolda `GPIO`, `previously allocated` ya da `Invalid Index` içeren bir hata var:** pin reddedildi ya da iki kez kullanıldı: [Pin kullanılamıyor](sorunlar.md#pin).
- **Start'a bastım, servo ya da ESC tepki vermiyor:** Driver Station'ın bağlı olduğunu ve modun çalıştığını kontrol et. Çıkış kapısı başka durumda sinyal göndermez.
- **Bağlantı koptu, motorlar birkaç saniye daha döndü:** Kapı, Driver Station 5 saniye sessiz kalınca kapanır. Kumanda değerleri yaklaşık 0,5 saniyede sıfırlanır; kumandadan bağımsız komutlar o 5 saniye boyunca gider: [Çıkışların ne zaman kapandığını bil](#cikis-kapisi).
- **Kart açılmıyor ya da kod başlamıyor:** J8'deki GPIO 45'e ya da 46'ya bağlı bir parça açılışta pinin seviyesini değiştiriyor olabilir. O parçayı başka bir pine taşı: [Açılış pinlerini en son kullan](#acilis-pinleri). **BOOT** düğmesine basılı tutarak açtıysan kartı düğmeye basmadan yeniden başlat.
- **Robot durunca röle açık kalıyor:** `DigitalOutput` kapıdan geçmez; `DisabledInit()` içinde kapat.

## Sonraki adım

[Motor sürücülerini ve sensörleri kullan](surucu-kullan.md)
