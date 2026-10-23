# Hatalar ve sorun giderme

prosdk ile derlerken, karta yüklerken ve robot çalışırken çıkan hataların sebebini ve çözümünü bu sayfada bulursun.

Önce aşağıdaki tabloda belirtiyi bul, sonra ilgili bölüme geç. Ekranda bir yazı çıktıysa başlıklar o yazıyla başlar.

Yazılar kaynak koddaki metinlerdir; `...` yerinde pin numarası, ad ya da süre gibi bir değer yazar. Robottaki davranış kaynak koddan yazıldı. prosdk henüz hiçbir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da denenmedi.

Probot Core'un `[PB-E301]` gibi kodla başlayan hataları için: [Probot Core hataları](../core/sorunlar.md).

## Önce nereye bakacağını bil {#gostergeler}

prosdk'nin robottaki mesajları Driver Station'da **Logs** sekmesinin **Robot Console** kartına gelir. Derleme hataları Arduino IDE'nin **Output** panelindedir.

| Gösterge | Anlamı | Ne yap |
|---|---|---|
| **Output** panelinde `error:` geçen bir satır ya da `Sketch too big` | Kod derlenmedi, karta bir şey yüklenmedi. Hata satırı dosya adı ve satır numarasıyla başlar. | [Derleme hataları](#derleme) |
| **Tools** > **Port** listesinde Pulse yok ya da yükleme port hatasıyla durdu | Bilgisayar kartı görmüyor, kod karta gitmedi. | Pulse'un portunu ve indirme modunu [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme) bölümünde bul. Kablo ve USB portu için: [Port listesi boş](../core/sorunlar.md#port-yok). |
| Kod yüklendi, robotun WiFi ağı görünmüyor | Kart açılmadı ya da indirme modunda kaldı. Listede `Probot-` ile başlayan bir ağ varsa kart açılmıştır, ağ adı kodda yok. | [Kod yüklendi ama kart açılmıyor](#acilis-pinleri). `Probot-` ile başlayan ağ için: ["PROBOT_WIFI_AP_SSID not defined"](#ssid-yok) |
| **Robot Console**'da `[prosdk] robot program ... halted:` | Robot programı durdu, çıkışlar kapalı. | [Robot programı durdu](#halted) |
| **Robot Console**'da `already has another framework installed` | prosdk'nin döngüsü çalışmıyor, robot sürülemez. | [Başka bir çerçeve kurulu](#baska-cerceve) |
| **Robot Console**'da `GPIO`, `previously allocated` ya da `Invalid Index for` geçen bir `Error at` satırı | Bir pin reddedildi ya da iki kez kullanıldı. | [Pin kullanılamıyor](#pin) |
| **Robot Console**'da `overrun` geçen satır | Döngünün bir turu süresinde bitmedi. | [Döngü gecikiyor](#overrun) |
| **Robot Console**'da `DataLogManager: no log storage` satırı ya da `[prosdk] LittleFS:` ile başlayıp `formatted and mounted` içermeyen bir satır | Kayıt alanı bağlanmadı, kayıt verisi atılıyor. | ["DataLogManager: no log storage"](#kayit-yok) |
| **Joystick** sekmesinde **Input Source** kartının **Gamepad** satırında "Bağlı değil" | Tarayıcı kumandayı görmüyor. | [Kumanda tepki vermiyor](#kumanda) |
| **Veri** sekmesinde değerin yanında "Güncel değil" | Robot değeri saklayamadı ya da gönderemedi; gösterilen değer eski. | [Veri ve kayıt sorunları](#veri) |
| Robot bir süre sonra kendiliğinden durdu ya da bir mod listede yok | Driver Station bağlantısı koptu ya da mod listeye eklenmedi. | [Driver Station ve modlar](#ds-modlar) |
| Driver Station'ı "Emergency Stopped" yazısı kaplıyor | Acil durdurma kilitli. | [Acil durdurmadan sonra](#acil-durdurma) |

## Derleme hataları {#derleme}

Arduino IDE hatayı **Output** panelinde yazar. Derleme durur ve karta bir şey yüklenmez. Kurulum adımları: [prosdk'yi Arduino IDE'ye kur](kur.md).

!!! note "Not"
    Kart paketi 3.3.10 değilse derleme hata vermeyebilir ama kod kartta yanlış çalışabilir. prosdk, kart paketinin sürümünü derlerken denetlemez: [ESP32 kart paketinin 3.3.10 sürümünü kur](kur.md#kart-paketi).

### "Sketch too big" {#sketch-too-big}

**Output** panelinde şu satırlar görünür (sayılar koduna göre değişir):

```text
Sketch uses 1813118 bytes (138%) of program storage space. Maximum is 1310720 bytes.
Sketch too big; see https://support.arduino.cc/hc/en-us/articles/360013825179 for tips on reducing it.
```

Altında "text section exceeds available space in board" yazar.

Sebep: **Partition Scheme** varsayılan düzende kalmış. Bu düzen koda 1,25 MB (1310720 bayt) bırakır; prosdk ile bir sketch 1,6-2,3 MB tutar.

Çözüm: **Tools** > **Partition Scheme** > **Huge APP (3MB No OTA/1MB SPIFFS)**'ı seç ve yeniden derle. "Maximum is 3145728 bytes" yazıyorsa ayar doğrudur.

Bkz. [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme).

### "prosdk requires probot-core 0.5.0 or later" {#eski-core}

Derleme şu iki satırdan biriyle durur:

```text
error: #error "prosdk requires probot-core 0.5.0 or later (until its release: the probot-core draft PR stack with the framework API, <probot/framework.hpp>). Install that probot-core library and include <prosdk.h> (it includes <probot.h> itself)."
```

```text
error: #error "prosdk requires probot-core 0.5.0 or later (found a PROBOT_VERSION below 0.4.0)."
```

Sebep: Kurulu `probot` kütüphanesi (Probot Core) 0.5.0'dan eski. prosdk, Probot Core 0.5.0 ya da daha yeni bir sürüm ister.

Çözüm: **Tools** > **Manage Libraries**'i seç, `probot` yaz ve **probot** satırında 0.5.0 ya da daha yeni bir sürüm kur. Sonra yeniden derle.

Bkz. [Kütüphaneyi kur](kur.md#kutuphane).

### "Include <prosdk.h> before <probot.h>" {#include-sirasi}

Tam yazı:

```text
error: #error "Include <prosdk.h> before <probot.h> (prosdk must define PROBOT_FRAMEWORK first)."
```

Sebep: Sketch'te `#include <probot.h>` satırı `#include <prosdk.h>` satırından önce geliyor. prosdk, Probot Core'u kendi ayarıyla ekler.

Çözüm: `#include <probot.h>` satırını sil. Probot Core'un ayar makrolarını `#include <prosdk.h>`'den önce yaz:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>                           // <probot.h> satırı yok
```

### "PROBOT_WIFI_AP_SSID not defined" {#ssid-yok}

Robotun WiFi ağı `Probot` yerine `Probot-XXXXXX` biçiminde bir adla çıkar (X'ler kartın MAC adresinden gelir). **File** > **Preferences** > **Compiler warnings** ayarı **None** dışındaysa **Output** panelinde şu uyarı da görünür. Derleme durmaz, kod karta yüklenir:

```text
warning: #warning "PROBOT_WIFI_AP_SSID not defined. Using auto-generated SSID (Probot-XXXXXX). Define a custom SSID for better identification."
```

Sebep: Sketch'te `PROBOT_WIFI_AP_SSID` satırı yok. Probot Core ağ adının sonuna kartın MAC adresinden 6 karakter ekler.

Çözüm: Ağ adını `#include <prosdk.h>`'den önce yaz ve kodu yeniden yükle:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>
```

### "does not name a type" {#tur-yok}

Örnek yazı:

```text
error: 'BTS7960' in namespace 'prosdk' does not name a type
```

Sınıfın bir fonksiyonunu adıyla çağırıyorsan (ör. `prosdk::RobotState::IsEnabled()`) yazı `error: 'prosdk::RobotState' has not been declared` gibi çıkar. Sebep ve çözüm aynıdır.

Sebep: Sınıfın başlık dosyası eklenmemiş. `<prosdk.h>` robot sınıflarını ve donanım sınıflarını eklemez; her sınıf kendi başlık dosyasıyla gelir.

Çözüm: Sınıfın `#include` satırını `#include <prosdk.h>`'nin altına ekle. Sık kullanılanlar:

| Sınıf | Başlık dosyası |
|---|---|
| `prosdk::TimedRobot` | `<prosdk/framework/TimedRobot.hpp>` |
| `prosdk::OpModeRobot` | `<prosdk/framework/OpModeRobot.hpp>` |
| `prosdk::BTS7960` | `<prosdk/drivers/motor/BTS7960.hpp>` |
| `prosdk::DifferentialDrive` | `<prosdk/drive/DifferentialDrive.hpp>` |
| `prosdk::Gamepad` | `<prosdk/driverstation/Gamepad.hpp>` |
| `prosdk::RobotState` | `<prosdk/driverstation/RobotState.hpp>` |
| `prosdk::Timer` | `<prosdk/system/Timer.hpp>` |
| `prosdk::DataLogManager` | `<prosdk/system/DataLogManager.hpp>` |

Bir sınıfın başlığını bulmak için o sınıfı kullanan örneğe bak: [Örnek listesi](ornek-listesi.md).

### "expected unqualified-id before numeric constant" {#makro-cakismasi}

Aynı satırın altında `note: in expansion of macro 'HIGH'` gibi bir satır çıkar. Satır çakışan makronun adını söyler.

Sebep: Kod WPILib'deki bir adı kullanıyor, ama Arduino aynı adı makro olarak tanımlıyor (`HIGH`, `LOW`, `INPUT`, `OUTPUT`, `RISING`, `FALLING`, `DEFAULT`, `DISABLED`, `ANALOG`, `PS`). prosdk bu adları `k` önekiyle yazar. PlayStation kumandalarındaki `PS(...)` fonksiyonu ise `PSButton(...)` olur.

Çözüm: Adı prosdk'deki karşılığıyla değiştir, ör. `Alert::Level::HIGH` yerine `kHigh`:

```cpp
// Yüksek öncelikli uyarı; uyari.Set(true) çağrılınca görünür
prosdk::util::Alert uyari{"kumanda", "Kumanda bağlı değil", prosdk::util::Alert::Level::kHigh};
```

Bkz. [Arduino makrolarıyla çakışan adlar](wpilib-farklari.md#makro-adlari).

### "redefinition of 'void setup()'" {#setup-loop}

Derleme durur. Çıktıda şu satırlar görünür:

```text
error: redefinition of 'void setup()'
note: 'void setup()' previously defined here
```

Aynı yazı `loop()` için de çıkar: "redefinition of 'void loop()'".

Sebep: `setup()` ve `loop()` Probot Core'a aittir. prosdk sketch'inde bu iki fonksiyon yazılmaz.

Çözüm: `setup()` ve `loop()`'u sil. Açılışta çalışacak kodu robot sınıfının kurucusuna, tekrar eden kodu `RobotPeriodic()` ya da bir mod fonksiyonuna taşı. Sketch `PROSDK_ROBOT_MAIN(Robot)` satırıyla biter.

Bkz. [Robot sınıfını seç](robot-sinifini-sec.md#sinif).

### `PROSDK_ROBOT_MAIN` hataları {#robot-main}

| Yazı | Sebep | Çözüm |
|---|---|---|
| `static assertion failed: PROSDK_ROBOT_MAIN needs a robot class derived from prosdk::RobotBase (TimedRobot, TimesliceRobot or OpModeRobot)` | `PROSDK_ROBOT_MAIN`'e verilen sınıf bir robot sınıfından türemiyor. | Sınıfı `prosdk::TimedRobot`, `prosdk::TimesliceRobot` ya da `prosdk::OpModeRobot<Robot>`'tan türet. |
| `redefinition of 'char prosdk_robot_main_defined_twice'` ya da (ikinci satır bir `.cpp` sekmesindeyse) ``multiple definition of `prosdk_robot_main_defined_twice'`` | Sketch'te iki `PROSDK_ROBOT_MAIN` satırı var. Sekmelerden birinde de olabilir. | Bir tanesini sil. Sketch'te tek robot sınıfı çalışır. |

### "Precompiled library in ... not found" {#kart}

**Output** panelinde şu iki satır görünür, ardından derleme dakikalarca sürer:

```text
Library prosdk has been declared precompiled:
Precompiled library in ".../prosdk/src/esp32" not found
```

Satırın sonundaki klasör adı seçili kartın türünü gösterir (`esp32`, `esp32s2` gibi).

Sebep: Seçili kart ESP32-S3 değil. prosdk yalnız ESP32-S3 için derlenmiş gelir. Başka bir kartta IDE kütüphanenin bütün kaynak dosyalarını derlemeye çalışır.

prosdk'de kartı denetleyen ayrı bir hata yazısı yoktur.

Çözüm: Derlemenin bitmesini bekle ya da Arduino IDE'yi kapatıp yeniden aç. Sonra **Tools** > **Board** menüsünden **ESP32S3 Dev Module**'ü seç. Kart değişince **Tools** menüsündeki öteki ayarlar da değişebilir: **Flash Size**, **Partition Scheme**, **PSRAM**, **USB Mode**, **USB CDC On Boot** ve **Upload Mode** satırlarını [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme) bölümündeki tabloya göre ayarla ve yeniden derle. **Output** panelinde "Maximum is 3145728 bytes" yazıyorsa **Partition Scheme** doğrudur.

## Robot programı durdu {#halted}

Robot sınıfının kurucusu ya da bir döngü fonksiyonu hata fırlatırsa robot programı durur. prosdk robotu çalıştıramazsa da (ör. döngü süresi 1-1000 ms dışında) program durur. **Robot Console**'da şu biçimde bir satır çıkar:

```text
[prosdk] robot program Robot halted: its constructor threw an exception. Outputs stay disabled until reboot.
```

Probot Core çalışmaya devam eder. Driver Station bağlı kalır ve konsolu okuyabilirsin.

Çıkışlar kart yeniden başlatılana kadar kapalı kalır. Sonraki her **Init** ya da **Start** durdurulur ve konsola şu satır yazılır:

```text
[prosdk] robot program Robot is halted: Driver Station start stopped. Reboot the robot to run it again.
```

Durmanın asıl sebebi `halted:` satırından önceki hata satırlarındadır. Donanım katmanının hataları `Error at` ile başlar; altında `The robot program quit unexpectedly. This is usually due to a code error.` satırı gelir.

`halted:`'dan sonraki yazı, programın nerede durduğunu söyler:

| `halted:`'dan sonraki yazı | Sebep | Çözüm |
|---|---|---|
| `its constructor threw an exception` | Robot kurulurken bir sınıf üyesi hata verdi. Sık sebepler: reddedilen ya da iki kez kullanılan pin, tükenen donanım birimi, kitte olmayan bir sınıf (pnömatik, `PowerDistribution`). | Önceki satıra göre pini ya da sınıfı değiştir: [Pin kullanılamıyor](#pin), [Kitte olmayan donanımı kullanma](pinleri-kullan.md#desteklenmeyen). |
| `its startup threw an exception` | Robotun döngüsü kurulurken hata çıktı. | Önceki satırdaki hatayı düzelt. |
| `its loop threw an exception` | Bir periyodik fonksiyon, bir `AddPeriodic` fonksiyonu ya da bir komut hata fırlattı. | Önceki satırdaki fonksiyonu düzelt. `OnboardIMU`'nun `GetAngleX/Y/Z()`, `GetQuaternion()`, `GetRotation3d()`, dönüş hızı ve ivme okumaları da bu hatayı verir. `GetYaw()` ve `GetRotation2d()` hata vermez, hep 0 döner. Pulse'un üzerinde IMU ya da başka bir I2C sensörü yok; yerine J3'e (I2C port 0) bağlı bir IMU kullan, ör. `prosdk::MPU6050 imu{prosdk::I2C::Port::PORT_0};`: [MPU-6050'yi oku](surucu-kullan.md#mpu6050). |
| `its robot class has no periodic loop` | Sınıf `RobotBase`'ten doğrudan türüyor. Önceki satırda `derives from RobotBase directly` yazar. | `TimedRobot`, `TimesliceRobot` ya da `OpModeRobot` kullan: [Sınıfı seç](robot-sinifini-sec.md#sinif). |
| `its loop period is outside 1 ms..1000 ms` | Ana döngü süresi 1-1000 ms dışında. Önceki satır: `Robot loop period ... s is not supported: probot-core runs its loop every 1 ms to 1000 ms.` | Kurucuda 1 ile 1000 ms arasında bir süre ver: [Döngü süresini ayarla](robot-sinifini-sec.md#dongu-suresi). |
| `the HAL could not be initialized` | prosdk'nin donanım katmanı başlatılamadı. | Kartı yeniden başlat. Hata sürerse [hatayı bildir](#hata-bildir). |
| `publishing its utility mode threw an exception` | Kurucudan sonra **Utility** modu listeye eklenirken hata çıktı. | Önceki satırdaki hatayı düzelt ya da [hatayı bildir](#hata-bildir). |
| `probot-core's cycle callback table is full` | Probot Core'un döngü çağrı tablosunda yer kalmadı. | [Hatayı bildir](#hata-bildir). |

`TimesliceRobot`'ta ayrılan süreler periyodu aşarsa önceki satırda `exceeded controller period` geçer: [Bir denetleyiciyi sabit aralıkla çalıştır](robot-sinifini-sec.md#timeslice).

Sebebi bulup düzeltmek için:

1. Driver Station'da **Logs** sekmesine bas. **Robot Console** kartında `halted:` satırının üstündeki hata satırı durmanın sebebini söyler.
2. Kodu yukarıdaki tabloya göre düzelt.
3. Kodu karta yeniden yükle. Kart yeniden başlar, robotun WiFi ağı bir süre kaybolur.
4. Bilgisayarı robotun WiFi ağına yeniden bağla. Driver Station sayfası bağlantıyı kendisi yeniden kurar; kurmazsa sayfayı yeniden yükle.
5. **Robot Console**'da `********** Robot program startup complete **********` satırını bul. Sonra modu seç, **Init**'e ve **Start**'a bas.

Sonuç: **Robot Console**'da `halted:` ya da `is halted: Driver Station start stopped` satırı çıkmaz. **Start**'tan sonra seçili modun periyodik fonksiyonu çalışır.

### "probot-core already has another framework installed" {#baska-cerceve}

**Robot Console**'da açılışta şu satır çıkar ve robot sürülemez:

```text
[prosdk] ERROR: probot-core already has another framework installed (probot::framework::install returned false). prosdk's robot loop, Driver Station input and output gate will not run. Use only one framework per sketch.
```

Sebep: Sketch'teki başka bir kütüphane Probot Core'a kendi çerçevesini prosdk'den önce kurdu. Probot Core bir sketch'te tek çerçeve kabul eder.

Çözüm: Probot Core'a çerçeve kuran öteki kütüphaneyi sketch'ten çıkar.

## Pin kullanılamıyor {#pin}

Bir pin sınıfı kurulurken pin reddedilirse kurucu hata fırlatır ve robot programı durur. **Robot Console**'daki hata satırı `Error at` ile başlar ve aşağıdaki yazılardan birini içerir. Ardından `halted:` satırı gelir: [Robot programı durdu](#halted).

Ana kart Pulse'tur; kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Pulse'ta konnektörlere çıkan pinler: [Pulse'un konnektörlerini tanı](pinleri-kullan.md#pulse-konnektorleri). Hangi pinlerin boş olduğu: [Kullanılabilir pinleri seç](pinleri-kullan.md#kullanilabilir-pinler).

`...: GPIO` ve `... previously allocated.` ile başlayan yazılarda baştaki `...`, pini isteyen birimin adıdır: `PWM`, `DIO`, `Encoder`, `Analog`, `Counter`, `DutyCycle`, `AddressableLED`, `Pulse TX`, `Pulse RX`, `Six-step`, `I2C`, `Serial`, `SPI`, `CAN`. `previously allocated` yazısında adın ardından pin numarası gelir.

| Yazı | Sebep | Çözüm |
|---|---|---|
| `...: GPIO ... does not exist on the ESP32-S3 (GPIO 0-21, 26-48)` | GPIO 22-25 ESP32-S3'te yok. | Başka bir pin seç. |
| `...: GPIO ... is reserved for USB (D-/D+: flashing and the USB console)` | GPIO 19 ve 20 USB'ye ayrılmış (Pulse'ta USB-C konnektörü). | Başka bir pin seç. |
| `...: GPIO ... is reserved for UART0 (the ESP-IDF console)` | GPIO 43 ve 44 (Pulse'ta J4'teki TX ve RX) UART0'a, yani ESP-IDF konsoluna ayrılmış. | Başka bir pin seç. Seri cihaz için `prosdk::SerialPort::Port::ONBOARD` kullan; varsayılan pinleri J4'teki F1 (RX, GPIO 10) ve F2 (TX, GPIO 11). |
| `...: GPIO ... is reserved by this module's flash or PSRAM` | Pin modülün flash ya da PSRAM belleğine bağlı. Pulse'ta bu pinler GPIO 26-32'dir ve hiçbiri konnektöre çıkmaz. Pulse'un modülü (ESP32-S3-WROOM-1-N4R2, quad PSRAM) GPIO 33-37'yi boş bırakır; J6'daki 35, 36 ve 37 kullanılabilir. | Başka bir pin seç. Sekiz hatlı (octal) PSRAM'li modüllerde (N8R8, N16R8) GPIO 33-37 PSRAM'e bağlıdır ama prosdk bu pinleri reddetmez; o kartlarda 33-37'yi kullanma: [Başka bir ESP32-S3 kartı kullan](kur.md#baska-kart). |
| `... previously allocated.` ve altında `probot-core (NEOPIXEL_PIN, PROBOT_RSL_PIN, PROBOT_ESTOP_ENABLE_PIN or a battery sensor pin)` | Pin Probot Core'un: durum LED'i (`NEOPIXEL_PIN`, varsayılan GPIO 3; Pulse'ta kartın RGB LED'i) ya da Probot Core ayarına yazdığın bir pin. | Başka bir pin seç ya da Probot Core ayarındaki pini değiştir. |
| `... previously allocated.` ve altında ilk kullanıldığı yer | Aynı GPIO'yu iki prosdk nesnesine verdin, ör. GPIO 17'de bir `DigitalInput` ve SPI bus 0. | Nesnelerden birine başka pin ver. |
| `...: GPIO ... is in use by another Arduino driver (...)` | Pin `Wire`, `Serial1`, `ledcAttach` ya da `analogRead` gibi bir Arduino koduna bağlı. prosdk'nin I2C portları da pinlerini böyle tutar: I2C port 0 başladıktan sonra J3'teki 1 ve 2'ye, I2C port 1'i J5'e (SDA 17, SCL 16) kurduktan sonra 17 ve 16'ya başka nesne kurulamaz. I2C port 1'i J5'e kurduysan SPI bus 0 bu yazıyla durur. SPI bus 0 önce kurulursa yazı çıkmaz ama SPI çalışmaz. | Arduino kodunu kaldır ya da başka bir pin seç. I2C port 1 ile SPI bus 0'ı J5'te birlikte kullanma. |
| `I2C port 0 could not start on probot-core's battery sensor pins (PROBOT_BATTERY_INA_SDA / PROBOT_BATTERY_INA_SCL)` | Probot Core'un INA batarya sensörü açık ve I2C port 0 onun pinlerinde başlatılamadı. Probot Core 0.5.0'da bu pinler varsayılan olarak J3'teki 1 (SDA) ve 2 (SCL) pinleridir. | `PROBOT_BATTERY_INA_SDA` ve `PROBOT_BATTERY_INA_SCL` yazdıysan J3'e göre (1 ve 2) kontrol et. Sketch'te `Wire`'ı başlatıyorsan aynı pinlerde başlat ya da hiç başlatma. |
| `Invalid Index for ...` (pin birimleri: `PWM`, `DIO`, `Encoder` gibi) | GPIO numarası 0-48 dışında. | GPIO numarasını yaz. prosdk'de kanal numarası GPIO numarasıdır. |
| `Invalid Index for I2C`, `Invalid Index for Serial` ya da `Invalid Index for SPI` | Port ya da bus numarası yanlış. | `prosdk::I2C::Port::PORT_0` ya da `PORT_1`, `prosdk::SerialPort::Port::ONBOARD` ya da `MXP`, `prosdk::SPI::kPort0` ya da `kPort1` kullan. |
| `Invalid Index for Analog (GPIO 1-10, ADC1; ADC2 cannot be used with WiFi)` | Analog giriş GPIO 1-10 dışında. | Analog için GPIO 1-10 arasından bir pin seç. Pulse'ta bunlardan konnektörlere çıkanlar 1 ve 2 (J3), 7 (J5) ve 10 (J4). J3'te I2C port 0 kullanılıyorsa 7 ve 10 kalır: [Analog pinleri seç](pinleri-kullan.md#analog-pinler). |
| `Encoder channels ... and ... must be two different ESP32-S3 GPIOs` | Encoder'ın iki kanalına aynı pin verildi. | İki farklı pin ver. |
| `I2C port 1 has no pins: call prosdk::platform::SetI2CPins(1, sda, scl) first`; aynı biçimde `Serial port 1 has no pins: ...`, `SPI bus 1 has no pins: ...` ya da `CAN has no pins: ...` | I2C port 1'in, `MXP` seri portun, SPI bus 1'in (`kPort1`) ve CAN'in varsayılan pini yok. I2C port 0, `ONBOARD` seri port ve SPI bus 0 (`kPort0`) varsayılan olarak Pulse'un J3, J4 ve J5 konnektörlerini kullanır. | `#include <prosdk/platform/HalConfig.hpp>` ekle. Portu kurmadan önce yazıdaki fonksiyonu çağır: `SetI2CPins`, `SetSerialPins`, `SetSPIPins` ya da `SetCanConfig`. Bkz. [Bus pinlerini ayarla](surucu-kullan.md#bus-pinleri). |
| `Serial: USB serial ports do not exist on the ESP32-S3 robot (use SerialPort::Port::ONBOARD or MXP)` | `SerialPort` `USB_1` ya da `USB_2` portuyla kuruldu. Robotta USB seri port yok. | `prosdk::SerialPort::Port::ONBOARD` (UART1) ya da `MXP` (UART2) kullan. |

### Kod yüklendi ama kart açılmıyor {#acilis-pinleri}

Konsolda hata satırı yok. Kart yeniden başlayınca kod çalışmıyor, robotun WiFi ağı görünmüyor.

Kartın açılıp açılmadığını USB-C portundan gör. **USB CDC On Boot: Enabled** ayarıyla Probot Core'un açılış satırları Pulse'un USB-C portuna gelir. Pulse'u USB-C'den bilgisayara bağla, **Tools** > **Port**'tan portunu seç, **Tools** > **Serial Monitor**'ü aç ve kartın **RESET** düğmesine bas. `[DS   ] WiFi SSID:` satırı görünüyorsa kart açılıyor; robotun ağ adı bu satırdadır. Hiç satır gelmiyorsa kart açılmıyor olabilir.

Sebep: Bir açılış (strapping) pini açılışta yanlış seviyede. Çip GPIO 0, 3, 45 ve 46'yı açılışta okur. Pulse'ta GPIO 0 **BOOT** düğmesidir. GPIO 3 kartın RGB LED'idir; Probot Core onu durum LED'i olarak kullanır ve prosdk reddeder. GPIO 45 ve 46 J8 konnektöründedir. prosdk 45 ve 46'yı reddetmez ve uyarı da yazmaz.

GPIO 0 açılışta LOW tutulursa kart indirme (download) modunda kalır: **BOOT** düğmesine basılıyken kartı açma. GPIO 45 açılışta HIGH tutulursa kart açılmayabilir. Boştayken HIGH veren bir encoder ya da sensör çıkışı, pull-up direnci ve 3,3 V'a giden bir anahtar buna yol açar. GPIO 46 yalnız GPIO 0 LOW iken önem taşır.

Çözüm: J8'deki GPIO 45 ya da 46'daki bağlantıyı başka bir konnektörün boş pinine taşı ve kodda pin numarasını değiştir. Kartın gücünü kapatıp aç.

Bkz. [Açılış pinlerini en son kullan](pinleri-kullan.md#acilis-pinleri).

### Donanım birimi tükendi {#kapasite-doldu}

Pinler serbest olsa da arkalarındaki donanım birimleri sınırlıdır. Birim tükenince yeni nesne kurulamaz ve konsolda şu yazılardan biri çıkar:

| Yazı | Sınır |
|---|---|
| `PWM: all 12 MCPWM outputs are in use` | 12 PWM çıkışı |
| `PWM: no MCPWM timer left for a ... ms period on GPIO ... (12 outputs; the 2 outputs of a timer share one period)` | Aynı zamanlayıcıdaki 2 çıkış aynı periyodu paylaşır. |
| `All 4 PCNT units are in use (counters and encoders share them)` | Encoder ve sayaç toplam 4 |
| `DutyCycle: no capture channel left for GPIO ... (6 inputs)` | 6 görev oranı girişi |
| `AddressableLED: all 3 RMT TX channels are in use (LED outputs and pulse transmitters share them)` | LED şerit ve darbe vericisi toplam 3 |
| `pulse TX: all 3 RMT TX channels are in use (LED outputs and pulse transmitters share them)` | LED şerit ve darbe vericisi toplam 3 |
| `Digital PWM: all 6 generators are in use` | 6 dijital PWM üreteci (H köprü sürücüleri), hepsi tek frekansta. Rehberdeki iki BTS7960 bunların 4'ünü kullanır. |
| `Digital PWM: no LEDC channel/timer for GPIO ... at ... Hz (8 LEDC channels and 4 timers are shared with analogWrite and other Arduino LEDC users)` | 8 LEDC kanalı ve 4 zamanlayıcı. Arduino'nun `analogWrite` ve `ledcAttach` kodu da bunları kullanır. |

Sebep: Robot, donanım biriminin sayısından fazla nesne kuruyor. 5 ms'lik PWM motor sürücüleriyle 20 ms'lik servoları karıştırmak zamanlayıcıları 12 çıkış dolmadan bitirebilir.

Çözüm: Nesne sayısını azalt ya da aynı periyottaki çıkışları bir araya topla. Servoları ProHub'a (PCA9685) taşımak PWM çıkışlarını boşaltır. LEDC yazısında sketch'teki `analogWrite` ve `ledcAttach` kodunu kaldır.

Bkz. [Donanım birimlerinin sınırına dikkat et](pinleri-kullan.md#kapasite).

## Döngü gecikiyor {#overrun}

Kodun bir turu döngü süresinden uzun sürerse **Robot Console**'da şu yazılar çıkar:

| Yazı | Kim yazar | Anlamı |
|---|---|---|
| `Loop pass of ... ms overrun (... late passes since boot)` | prosdk, uyarı | Probot Core'un döngü turu geç kaldı. Saniyede en çok bir kez yazılır. |
| `Watchdog not fed within 0.020000s` | Robot sınıfının döngü bekçisi, uyarı | Robotun turu periyodu aştı. Aynı gecikmenin ilk satırıdır; saniyede en çok bir kez yazılır. |
| `Loop time of 0.020000s overrun` | `TimedRobot` ve `TimesliceRobot`, hata | Robotun turu periyodu aştı. Altındaki satırlar her fonksiyonun süresini verir, ör. `TeleopPeriodic(): 0.031250s`. |
| `CommandScheduler loop time overrun.` | Komut zamanlayıcısı | `CommandScheduler::Run()` 20 ms'den uzun sürdü. |
| `A periodic callback has a period below 1 ms; probot-core's loop runs at most every 1 ms, so it runs once per loop pass instead.` | prosdk, hata | `AddPeriodic`'e 1 ms'den kısa süre verildi. Fonksiyon her turda bir kez çalışır. |
| `A periodic callback period is not a whole number of milliseconds; probot-core's loop runs on a 1 ms grid, so it runs up to one loop pass late.` | prosdk, uyarı | Süre tam milisaniye değil. Fonksiyon bir tura kadar geç çalışabilir. |

`OpModeRobot`'ta `Loop time of ...s overrun` yazısı konsola gelmez; **Veri** sekmesinde `/Telemetry/Alerts/Alerts` altında uyarı olarak görünür. `Loop pass of ... ms overrun`, `Watchdog not fed within ...s` ve fonksiyon süreleri (ör. `RobotPeriodic(): ...s`) bu sınıfta da konsolda çıkar.

Geciken tur telafi edilmez. Bir tur 2 saniyeyi geçerse Probot Core çıkışları keser: [Loop takıldı](../core/sorunlar.md#pb-e301-deadline-miss-loop-takildi).

| Sebep | Çözüm |
|---|---|
| Bir periyodik fonksiyonda `delay()` var. | Beklemeyi `prosdk::Timer` ile ölç, turu bitir. |
| Bir periyodik fonksiyonda `Serial.print` var ve kablo USB-C'de takılı kaldı, ama bilgisayar portu okumuyor (ör. **Serial Monitor** açılıp kapatıldı). Probot Core 0.5.0'da her `Serial` yazması yaklaşık 100 ms'ye kadar bekleyebilir; sığmayan metin atılır. | Kabloyu çıkar ya da **Serial Monitor**'ü açık tut. Konsola `prosdk::platform::ConsoleWrite` ile yaz: [Konsola yaz](kumandayi-oku.md#konsol). |
| Bir şeyin olmasını bekleyen `while` döngüsü var. | Koşulu her turda bir kez kontrol et. |
| Konsola ya da `DataLogManager::Log`'a her turda yazılıyor. | Bir olayda bir kez yaz. Değişen değerler için telemetri kullan: [Değerleri Veri sekmesine gönder](veri-goster.md#telemetri). |
| I2C bağlı bir sensör yanıt vermiyor. | Kabloyu ve beslemeyi kontrol et. |
| `AddPeriodic` kaydırmaları çok küçük, Probot Core'un döngüsü 1 ms'ye iniyor. | Kaydırmaya gerek yoksa verme: [Döngü süresini ayarla](robot-sinifini-sec.md#dongu-suresi). |
| Döngü süresi kodun için kısa. | Kurucuda daha uzun bir süre ver, ör. `Robot() : TimedRobot{30_ms} {}`: [Döngü süresini ayarla](robot-sinifini-sec.md#dongu-suresi). |

Zamanlamaya bağlı kodu robotta dene ve konsoldaki `overrun` satırlarını izle.

## Kumanda tepki vermiyor {#kumanda}

| Sebep | Çözüm |
|---|---|
| **Joystick** sekmesindeki **Input Source** kartının **Gamepad** satırında "Bağlı değil" yazıyor. Tarayıcı kumandayı ilk düğme basışında tanır. | Kumandayı Driver Station'ı açtığın cihaza bağla ve bir düğmesine bas. Satırda yine "Bağlı değil" yazıyorsa: [Kumanda görünmüyor](../core/sorunlar.md#kumanda-baglanmiyor). |
| **Init**'e bastın, motorlar dönmüyor. | Beklenen davranış: **Init**'te robot disabled'dır, `TeleopPeriodic()` **Start**'tan sonra çalışır. **Start**'a bas. |
| Kod 1-5 numaralı bir portu okuyor, o portta kumanda yok. **Veri** sekmesinde `/Telemetry/Alerts/DriverStation` altında `Joystick on port 1 not available, check if all controllers are plugged in` yazar. | İkinci kumandayı bağla ya da koddaki port numarasını düzelt: [Kumandaları portlara yerleştir](kumandayi-oku.md#portlar). |
| Klavye ya da dokunmatik etkin. Port 0'ı o kaynak alır, kumanda başka porta geçer. | **Joystick** sekmesinde kaynağı kapat ya da kodu kumandanın portundan oku. |
| Düğmeler ve eksenler yanlış okunuyor. Kod `NiDsXboxController`, `NiDsPS4Controller`, `NiDsPS5Controller`, `NiDsStadiaController` ya da `CommandNiDs...` ile başlayan bir sınıf kullanıyor. | Bu sınıflar eski NI Driver Station'ın düğme numaralarını bekler. Probot Driver Station'da `NiDsXboxController` omuz düğmelerini, **Back**/**Start**'ı, çubuk düğmelerini, sağ çubuğu ve tetikleri yanlış okur (yüz düğmeleri, sol çubuk ve POV doğrudur). `NiDsPS4Controller` ve `NiDsPS5Controller` yüz düğmelerini de yanlış okur. `prosdk::Gamepad`'a, komut tabanlı kodda `prosdk::cmd::CommandGamepad`'a geç. `XboxController`, `DualShock4Controller` ve `DualSenseController` da aynı düzenden doğru okur. |
| Okunan düğme bu kumandada yok. **Veri** sekmesinde `/Telemetry/Alerts/DriverStation` altında `Joystick Button 5 on port 0 not available` gibi bir uyarı çıkar. | Düğme numaraları 0'dan başlar. `GetFaceDownButton()` gibi adlı fonksiyonları kullan: [Düğmeleri ve D-pad'i oku](kumandayi-oku.md#dugmeler). |
| `GetGuideButton()` hep `false` okuyor. | Ortadaki Home, Xbox ya da PS düğmesini 17'den az düğme bildiren kumanda vermez. İşletim sistemi, Steam ya da tarayıcı bu düğmeyi kendisi kullanırsa basış robota gelmez. `GetStartButton()` ya da `GetBackButton()` gibi başka bir düğme kullan. |
| `prosdk::Joystick` ile tetiğe basınca tepki yok. | `GetTrigger()` ham düğme 1'i okur: Xbox'ta **B**, PlayStation'da **Circle**. `GetTop()` ham düğme 2'yi okur: **X** ya da **Square**. O düğmeye bas ya da kodu `prosdk::Gamepad`'ın adlı fonksiyonlarıyla yaz. |
| Robot ileri yerine geri gidiyor. | Çubuk ileri itilince Y eksi okunur. Değeri eksiyle çarp: `-gamepad.GetLeftY()`. |
| Çubuğun küçük hareketlerine tepki yok. | `Gamepad` çubuklarda 0,1'lik ölü bölge uygular. `gamepad.SetLeftYDeadband(0.05)` gibi küçült: [Ölü bölgeyi ayarla](kumandayi-oku.md#olu-bolge). |
| Kumanda bir an kopuyor, robot duruyor. | Kumanda 500 ms veri göndermezse bağlı değil sayılır ve değerleri 0 okunur. Kumandanın pilini ve bağlantısını kontrol et. |
| Kumanda titremiyor. | Probot Driver Station titreşim göndermez. `SetRumble` derlenir ama bir şey yapmaz. |

Kumanda düzeni: [Çubukları ve tetikleri oku](kumandayi-oku.md#kumanda-duzeni).

## Driver Station ve modlar {#ds-modlar}

| Belirti | Sebep ve çözüm |
|---|---|
| Driver Station sayfası kapandı ya da WiFi koptu, robot birkaç saniye sonra durdu. | 5 saniye veri gelmezse Probot Core Driver Station'ı ayrılmış sayar. O an kodun robotu disabled görür (`DisabledInit()` çalışır) ve çıkışlar kapanır. O 5 saniyede kumandadan bağımsız komutlar (ör. otonomdaki sabit hız) motorlara gider. 10 saniye dolmadan yeniden bağlanırsan robot kendiliğinden yeniden enabled olur. 10 saniyede Probot Core modu da durdurur; sayfayı yeniden aç, modu seç, **Init**'e ve **Start**'a bas: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi). |
| **Match Control** listesinde **Utility** yok. | `OpModeRobot`'ta **Utility**, kod bir `UTILITY` OpMode'u ekleyip `PublishOpModes()`'u çağırınca görünür. `TimedRobot` ve `TimesliceRobot`'ta prosdk **Utility**'yi kurucu bittikten sonra kendisi ekler; listede yoksa robot programı durmuştur, **Robot Console**'da `halted:` satırına bak: [Robot programı durdu](#halted). Bkz. [Programları listeden seç](robot-sinifini-sec.md#opmoderobot). |
| Bir OpMode'un `AddPeriodic` fonksiyonu robot disabled iken de çalışıyor. | Bu fonksiyonlar OpMode listeden seçilip kurulunca kaydolur. Yalnız enabled iken çalışması gereken fonksiyonu `if (!prosdk::RobotState::IsEnabled()) return;` ile başlat (`<prosdk/driverstation/RobotState.hpp>`): [Programları listeden seç](robot-sinifini-sec.md#opmoderobot). |
| `prosdk::MatchState::GetAlliance()`, `GetLocation()` ya da `GetGameData()` `std::nullopt` dönüyor. | **Dashboard** sekmesindeki **Maç Bilgisi** kartı boş. Kartı robot dururken doldur: **Init**'ten önce ya da otonom ile teleop arasında. Robot yeniden başlayınca bilgi robotta silinir; açık kalan Driver Station sayfası onu yeniden gönderir. Sayfayı yeniden yüklediysen ya da kapattıysan kartı yeniden doldur. Değeri her modun `Init` fonksiyonunda yeniden oku: [Maç bilgisini oku](kumandayi-oku.md#mac-bilgisi). |

## Veri ve kayıt sorunları {#veri}

### "Robot henüz topic yayınlamadı." {#topic-yok}

**Veri** sekmesi boştur ve bu yazı görünür.

Sebep: Driver Station sayfası robota bağlı değil, kod hiç `prosdk::telemetry::Log` ya da `prosdk::tunables::Publish` çağırmadı, ya da robot programı değer göndermeden durdu.

Çözüm: Robotun WiFi ağındayken Driver Station sayfasını yeniden yükle. Yazı kalkmazsa değerleri `RobotPeriodic()` içinde `Log` ile gönder. **Robot Console**'da `halted:` satırı varsa önce onu çöz: [Robot programı durdu](#halted).

Bkz. [Değerleri Veri sekmesine gönder](veri-goster.md#telemetri).

### "Güncel değil" {#guncel-degil}

Değerin yanında "Güncel değil: değer çok büyük, sınır 1024 bayt", "Güncel değil: robotta bellek yetmedi" ya da "Güncel değil: robot değeri gönderemedi" yazar. **Logs** sekmesindeki **Event Log**'a bir kez `Veri güncellenemedi:` ile başlayan bir satır düşer. **Robot Console**'da şu uyarı bir kez çıkar:

```text
[prosdk] dashboard value not stored (larger than PROBOT_DASH_MAX_VALUE or PROBOT_DASH_POOL_BYTES exhausted); later values are tried again, further failures are not reported: '...'
```

Sebep: Değer `PROBOT_DASH_MAX_VALUE` sınırından büyük (varsayılan 1024 bayt) ya da Probot Core'un veri havuzu (`PROBOT_DASH_POOL_BYTES`) doldu. Robot çalışmaya devam eder, **Veri** sekmesi eski değeri gösterir. 42 konumdan uzun bir `Field2d` yolu bu sınırı aşar.

Çözüm: Sınırı `#include <prosdk.h>`'den önce `#define` ile büyüt. Değer sığınca yazı kalkar.

Bkz. [Sınırları büyüt](veri-goster.md#sinirlar).

### Konsolda "dashboard" ile başlayan başka uyarılar {#dashboard-uyarilari}

| Yazı | Sebep | Çözüm |
|---|---|---|
| `[prosdk] dashboard topic table is full (PROBOT_DASH_MAX_TOPICS); this and later new topics are not shown: '...'` | 128 topic doldu. Bu ve sonraki yeni topic'ler görünmez. `Publish` `false` döner. | `PROBOT_DASH_MAX_TOPICS`'i büyüt (en çok 255) ya da daha az değer gönder. |
| `[prosdk] dashboard schema not stored: '...' has ... bytes, more than PROBOT_DASH_MAX_SCHEMA_BYTES (...)` | Bir yapı türünün şeması sınırdan büyük. Bu türdeki değerler **Veri** sekmesinde çözülemez. | `#define PROBOT_DASH_MAX_SCHEMA_BYTES 8192` gibi büyüt (en çok 32768). |
| `[PB-E308] dashboard: could not store ...` | Kalıcı bir tunable'ın değeri saklanamadı: flash dolu, flash hatası ya da değer 2048 bayttan büyük. | Değeri küçült. Bkz. [Ayarı yeniden başlatmada koru](veri-goster.md#kalici-ayar). |

**Veri** sekmesinde bir kutunun yanında "Tip uyuşmazlığı" ya da "Değiştirilemez" yazıyorsa robot yazmayı reddetti: [Değeri Driver Station'dan değiştir](veri-goster.md#tunable).

### "DataLogManager: no log storage (LittleFS is not mounted); log data is discarded" {#kayit-yok}

Sebep: Kayıt başlarken `/littlefs` klasörüne hiçbir dosya sistemi bağlı (mount) değildi. Kayıt klasörsüz başlar ve bütün kayıt verisi atılır.

prosdk LittleFS'i ilk `DataLogManager` çağrısında kendisi bağlar. Bağlamadıysa **Robot Console**'da bu satırdan önce `[prosdk] LittleFS:` ile başlayan bir satır çıkar ve sebebi yazar. O satırı bul ve tablodaki çözümü uygula.

| Önceki satır şununla başlar | Sebep | Çözüm |
|---|---|---|
| `[prosdk] LittleFS: the "spiffs" partition is not blank and holds no mountable LittleFS` | Alanda başka veri var: SPIFFS dosyaları, başka bir programın verisi ya da bozuk bir dosya sistemi. İlk açılıştaki biçimlendirme sırasında güç kesildiyse de bu satır çıkar. prosdk bu veriyi silmez, kayıt verisi atılır. | Alandaki veri gerekmiyorsa sketch'e `#include <LittleFS.h>` ekle ve sınıfın ilk üyesini `bool m_fs = LittleFS.begin(true);` yap. `begin(true)` alandaki her şeyi siler. |
| `[prosdk] LittleFS: the sketch uses the Arduino LittleFS library, so prosdk does not mount it` | Sketch `<LittleFS.h>`'yi ekliyor ama LittleFS'i ilk `DataLogManager` çağrısından önce bağlamadı. Bu durumda prosdk LittleFS'i bağlamaz. | Sınıfın ilk üyesini `bool m_fs = LittleFS.begin(true);` yap (alt sistemlerin ve kayıt girişlerinin üstünde). LittleFS dosyalarını kodunda kullanmıyorsan bunun yerine `#include <LittleFS.h>` satırını sil; o zaman prosdk alanı kendisi bağlar. |
| `[prosdk] LittleFS: the program uses SPIFFS` | Sketch SPIFFS kullanıyor (`<SPIFFS.h>`). SPIFFS aynı alanı kullanabilir; prosdk oraya LittleFS bağlamaz ve flash'a kayıt yazılmaz. | Kaydı SD karta yaz: [Kaydı SD karta yaz](kayit-tut.md#sd-kart). SPIFFS gerekmiyorsa `#include <SPIFFS.h>` satırını ve SPIFFS çağrılarını sil. Alan daha önce SPIFFS ile kullanıldıysa sonraki açılışta `is not blank and holds no mountable LittleFS` geçen satır çıkar; o satırın çözümünü uygula (`LittleFS.begin(true)` alanı siler). |
| `[prosdk] LittleFS: no "spiffs" data partition (partition scheme); no log storage` | Seçili bölümleme şemasında kayıt alanı yok. | **Tools** > **Partition Scheme**'de **Huge APP (3MB No OTA/1MB SPIFFS)**'i seç ve kodu yeniden yükle: [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme). |
| `[prosdk] LittleFS: mounting the "spiffs" partition at /littlefs failed (...)` | Bağlama başarısız oldu. Parantezin içinde hatanın adı yazar. | Kartı yeniden başlat. Satır yine çıkarsa hatayı bildir: [Hata bildir](#hata-bildir). |
| Satır yok. | Kod ilk `DataLogManager` çağrısından önce `prosdk::platform::SetLogAutoMount(false)`'u çağırdı. prosdk LittleFS'e dokunmaz. | `SetLogAutoMount(false)` satırını sil. Ya da kayıt klasörünü kendin hazırla: LittleFS'i ilk üyede bağla ya da SD kartı bağlayıp `SetLogDirectory("/sd/logs")`'u çağır. |

Kayıt klasörü ilk `DataLogManager` çağrısında seçilir; sonradan bağlanan LittleFS o kaydı değiştirmez. Çözümü uyguladıktan sonra kodu yeniden yükle.

Sorun yokken konsolda ilk açılışta `[prosdk] LittleFS: the "spiffs" partition was blank; formatted and mounted at /littlefs for the logs`, sonraki açılışlarda `[prosdk] LittleFS ("spiffs" partition) mounted at /littlefs for the logs` satırı görünür.

Bkz. [Kaydı LittleFS'e yaz](kayit-tut.md#littlefs).

### Diğer veri ve kayıt sorunları {#veri-diger}

| Belirti | Sebep | Çözüm |
|---|---|---|
| `Serial.print` ile yazdığın satır konsolda yok. | `Serial`, `printf` ve `prosdk::util::print` Driver Station konsoluna gitmez. **USB CDC On Boot: Enabled** ayarıyla `Serial` Pulse'un USB-C portuna gider. | `prosdk::platform::ConsoleWrite` ya da `probot::console::info` kullan: [Konsola yaz](kumandayi-oku.md#konsol). |
| `DriverStationDisplay` metni konsolda yok. | Metin konsola gitmez. **Dashboard** sekmesindeki **Robot Ekranı** kartında ve **Veri** sekmesinde `/Telemetry/DriverStationDisplay` altında görünür. | **Dashboard** sekmesine bas: [Robot Ekranı'na yaz](kumandayi-oku.md#metin-ekrani). |
| **Robot Ekranı**'nda üst satırlar eksik. | Metin `PROBOT_DASH_MAX_VALUE`'dan (varsayılan 1024 bayt) uzun. Sığmayan üst satırlar atılır; 1024 bayt, 160 sütunluk dolu satırların son 6'sını taşır. | `#include <prosdk.h>`'den önce `#define PROBOT_DASH_MAX_VALUE 8192` yaz. Türkçe harfler gibi iki baytlı harflerle dolu bir ekran için 16384 yaz: [Robot Ekranı için boyut seç](veri-goster.md#robot-ekrani-boyut). |
| Bir tunable yeniden başlatınca koddaki değere dönüyor. | Tunable'lar varsayılan olarak saklanmaz. `Selectable` seçimi hiç saklanmaz, her açılışta varsayılana döner. | Tunable'ı kalıcı yap: `TunableConfig`'in `properties` alanına `"persistent": true` yaz: [Ayarı yeniden başlatmada koru](veri-goster.md#kalici-ayar). |
| Koddaki varsayılanı değiştirdin, robot eski değerle açılıyor. | Kalıcı bir tunable'ın kayıtlı değeri koddaki varsayılandan önce gelir. | `prosdk::platform::ClearPersistedTunables()`'ı bir kez çağır: [Kod varsayılanını değiştir](veri-goster.md#kod-varsayilanini-degistir). |
| Konsolda `Error writing to log file '...': ...` geçen satırlar çıkıyor. | LittleFS doldu. `LogNetworkTables(true)` ile sık değişen çok değer kopyalamak alanı yaklaşık bir dakikada doldurabilir. Eski kayıtlar yalnız kayıt başlarken silinir: boş alan 128 KiB'ın altındaysa en eski tarihli kayıtlar, en az 3 dosya kalana kadar. | Daha az ya da seyrek değişen değer kaydet, uzun kayıt için SD kart kullan: [Telemetriyi kayda kopyala](kayit-tut.md#nt-kaydi), [Kayıt sınırlarını bil](kayit-tut.md#kayit-sinirlari). |
| **Dosyalar** kartı görünmüyor ya da hata yazıyor. | Kayıt başlamadı, kayıt alanı bağlanmadı (konsolda `no log storage` satırı: ["DataLogManager: no log storage"](#kayit-yok)) ya da robot çalışıyor. Açılışta `DataLogManager::Start()` çağrılmazsa **logs** klasörü kayda ilk yazan kodla (ör. ilk SysId testiyle) görünür. | [Dosyaları indir](kayit-tut.md#dosyalari-indir) bölümündeki tabloya bak. |
| Kayıt dosyası `WPILIB_TBD_` adıyla kalıyor ya da bir sonraki açılışta kayboluyor. | Driver Station sayfası 1 saniyeden uzun bağlı kalmadı ya da robotun saati ayarlanmadı. Robot bu hâlde yeniden başlarsa kayıt başlarken `WPILIB_TBD_` dosyaları silinir. | Kayıt sürerken Driver Station sayfasını açık tut. Sayfa 1 saniyeden uzun bağlı kalınca dosya `WPILIB_<tarih>.wpilog` adını alır, veri kaybolmaz. Kumanda bağlaman gerekmez: [Dosyanın adını anla](kayit-tut.md#dosya-adi). |
| **Veri** sekmesindeki `Scheduler` widget'ı alt sistemleri ayıramıyor ya da iki `SysIdRoutine` kayda aynı `sysid-test-state` girdisini yazıyor. | Alt sistemlere ad verilmedi; hepsinin adı `prosdk::cmd::SubsystemBase`. | Adı kurucunun başlatıcısında ver: `Surus() : SubsystemBase{"Surus"} {}`. Gövdede çağrılan `SetName()` `SysIdRoutine` üyesi için geç kalır: [Alt sistemi yaz](komut-tabanli-yaz.md#alt-sistem). |

## Acil durdurmadan sonra {#acil-durdurma}

**Emergency Stop**'a basınca robot programı kart yeniden başlatılana kadar çalışmaz. prosdk bütün çıkış pinlerini (PWM, `DigitalOutput`, LED veri hattı) LOW'a çeker.

Kilidi yeniden başlatma açar. **Reboot Robot**'a bas ya da kartın gücünü kapatıp aç.

Tarihli adlı kayıt dosyaları acil durdurmada ve yeniden başlatmada silinmez; adı hâlâ `WPILIB_TBD_` olan kayıt yeniden başlatmada silinir: [Dosyanın adını anla](kayit-tut.md#dosya-adi). Kilitliyken indirilemez; yeniden başlattıktan sonra **Logs** sekmesindeki **Dosyalar** kartından indir: [Dosyaları indir](kayit-tut.md#dosyalari-indir).

Bkz. [Acil durdurma kilidi](../core/sorunlar.md#pb-e302-emergency-stop-kilidi).

## Hata bildir {#hata-bildir}

Bu sayfada çözümü olmayan bir hatayı prosdk'nin GitHub sayfasında bildir: [github.com/probot-studio/probot-sdk/issues](https://github.com/probot-studio/probot-sdk/issues).

Mesaja şunları yaz:

- Hatayı gösteren en kısa kod.
- Seçili mod ve son bastığın düğme (ör. **Teleoperated**, **Start**).
- **Robot Console**'daki ya da **Output** panelindeki yazı, birebir. `halted:` satırından önceki satırları da ekle.
- prosdk sürümü (`2027.0.0-alpha.1`), Probot Core sürümü, kart paketi sürümü ve kullandığın tarayıcı.

Hata Probot Core'dan geliyorsa (yazı `[PB-E` ile başlıyorsa): [Probot Core'da hata bildir](../core/sorunlar.md#hata-bildir).

## Sonraki adım

[WPILib'den farklar](wpilib-farklari.md)
