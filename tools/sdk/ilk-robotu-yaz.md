# İlk robot kodunu yaz

Bu sayfada iki motorlu bir robotu `TimedRobot` ile kodlayacaksın. Teleop'ta robot kumandayla arcade sürüşle gider, otonomda 2 saniye yarım hızla ileri gidip durur.

## Başlamadan önce

- Arduino IDE prosdk için ayarlı: [prosdk'yi Arduino IDE'ye kur](kur.md).
- Robotun ana kartı olarak ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartını kullanıyorsun.
- Robotun iki tarafında birer motor var. Her motor bir BTS7960 (IBT-2) motor sürücüye bağlı.
- Driver Station'ı açmayı ve kumandayı bağlamayı biliyorsun: [Robotun ağına bağlan](../core/ilk-10-dakika.md#robotun-agina-baglan), [Kumandayı bağla](../core/ilk-10-dakika.md#kumandayi-bagla).

Bu sayfadaki kod sürücüleri Pulse'un J6 ve J8 konnektörlerindeki şu pinlerden sürer. Her sürücünün R_EN ve L_EN uçlarını birbirine köprüle ve tek bir GPIO'ya bağla.

| Sürücü | RPWM | LPWM | R_EN + L_EN |
|---|---|---|---|
| Sol motor | GPIO 38 (J6) | GPIO 37 (J6) | GPIO 36 (J6) |
| Sağ motor | GPIO 35 (J6) | GPIO 47 (J8) | GPIO 48 (J8) |

Konnektörlerin yeri ve pin sırası: [Pulse'un konnektörlerini tanı](pinleri-kullan.md#pulse-konnektorleri).

Bu plan J7'deki GPIO 39/40 ve 41/42'yi iki encoder için boş bırakır; prosdk örnekleri de encoder'ları orada kullanır. J8'deki GPIO 45 ve 46 açılış (strapping) pinleridir, bu sayfada kullanılmaz: [Açılış pinlerini en son kullan](pinleri-kullan.md#acilis-pinleri).

VCC, GND ve motor besleme bağlantıları: [BTS7960 (IBT-2)](surucu-kullan.md#bts7960). İki BTS7960, prosdk'nin 6 dijital PWM üretecinden 4'ünü kullanır ve bütün üreteçler tek frekansta çalışır: [Donanım birimlerinin sınırına dikkat et](pinleri-kullan.md#kapasite).

Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil. Başka pinler kullanıyorsan koddaki numaraları değiştir: [Kullanılabilir pinleri seç](pinleri-kullan.md#kullanilabilir-pinler). Başka bir ESP32-S3 kartında bus pinlerini, USB ayarını ve sekiz hatlı (octal) PSRAM'li modüllerde 35-37'deki motor pinlerini [Başka bir ESP32-S3 kartı kullan](kur.md#baska-kart) bölümüne göre değiştir.

prosdk henüz gerçek bir kartta, Pulse'ta da denenmedi. Bu sayfadaki yükleme adımları ve robot davranışı kaynak koddan ve kartın belgelerinden yazıldı.

!!! warning "Dikkat"
    İlk denemede tekerlekleri yerden kaldır. Robot beklenmedik hareket ederse Driver Station'da **Emergency Stop**'a bas (<kbd>Space</kbd>). Acil durdurmadan sonra robot, kart yeniden başlatılana kadar çalışmaz: [Acil durdurmadan sonra](sorunlar.md#acil-durdurma).

## Kodu yaz {#kodu-yaz}

prosdk'de `setup()` ve `loop()` yazılmaz. Robotun kodu `prosdk::TimedRobot`'tan türeyen bir sınıftadır. Sketch `PROSDK_ROBOT_MAIN(Robot)` satırıyla biter.

Aynı program **File** > **Examples** menüsünde **prosdk** altındaki **GettingStarted** örneğinde de var. O örnek BTS7960 yerine PWM ile sürülen motor sürücüleri (J6'da GPIO 38 ve 37) kullanır.

Örnekte ağ adı satırı yoktur; Probot Core ağı `Probot-XXXXXX` biçiminde bir adla açar. Bu yüzden örneği derlerken **Output**'ta `PROBOT_WIFI_AP_SSID not defined` geçen bir uyarı (`#warning`) çıkabilir; bu bir hata değildir: ["PROBOT_WIFI_AP_SSID not defined"](sorunlar.md#ssid-yok). Şifre (`probot-robot`) ve kanal (6) örneğin kendi `#define` satırlarındadır.

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil.
3. Aşağıdaki kodu yapıştır.

    ```cpp
    #define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
    #define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
    #define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
    #include <prosdk.h>

    #include <prosdk/drive/DifferentialDrive.hpp>
    #include <prosdk/drivers/motor/BTS7960.hpp>
    #include <prosdk/driverstation/Gamepad.hpp>
    #include <prosdk/framework/TimedRobot.hpp>
    #include <prosdk/system/Timer.hpp>

    class Robot : public prosdk::TimedRobot {
     public:
      Robot() {
        right.SetInverted(true);  // sağ motor ters yöne bakıyor
      }

      // Otonom: Start'a basınca 1 kez
      void AutonomousInit() override { timer.Restart(); }

      // Otonom: Start'tan sonra her 20 ms'de bir
      void AutonomousPeriodic() override {
        if (timer.Get() < 2_s) {
          drive.ArcadeDrive(0.5, 0.0, false);  // yarım hızla ileri
        } else {
          drive.StopMotor();
        }
      }

      // Teleop: Start'tan sonra her 20 ms'de bir
      void TeleopPeriodic() override {
        // Çubuğu ileri itince Y eksi okunur; bu yüzden eksiyle çarpılır.
        // Dönüşte saat yönünün tersi artıdır; sağa itince sağa dönsün diye X de eksiyle çarpılır.
        drive.ArcadeDrive(-gamepad.GetLeftY(), -gamepad.GetRightX());
      }

     private:
      prosdk::BTS7960 left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN (J6)
      prosdk::BTS7960 right{35, 47, 48};  // RPWM (J6), LPWM ve R_EN + L_EN (J8)
      prosdk::DifferentialDrive drive{left, right};
      prosdk::Gamepad gamepad{0};         // Driver Station'daki ilk kumanda
      prosdk::Timer timer;
    };

    PROSDK_ROBOT_MAIN(Robot)
    ```

4. `Probot` yerine robotunun adını, `Probot1234` yerine en az 8 karakterlik bir şifre yaz.
5. **File** > **Save**'i seç ve sketch'e bir ad ver.
6. Araç çubuğunda **Verify**'a (tik simgesi) bas.

Sonuç: **Output** panelinde "Sketch uses" ile başlayan ve "Maximum is 3145728 bytes." ile biten satır görünür.

Üç `#define` satırı `#include <prosdk.h>` satırından önce gelmek zorundadır. Bunlar Probot Core'un ayarlarıdır: [Robotun WiFi ayarlarını yap](../core/wifi-ayarla.md).

## Kodu karta yükle {#kodu-yukle}

Yüklemeden önce **Tools** menüsündeki ayarlar [Kartı ve bölümlemeyi seç](kur.md#kart-ve-bolumleme) bölümündeki gibi olmalı:

| Ayar | Değer |
|---|---|
| **Board** | ESP32S3 Dev Module |
| **Flash Size** | 4MB (32Mb) |
| **Partition Scheme** | Huge APP (3MB No OTA/1MB SPIFFS) |
| **PSRAM** | QSPI PSRAM |
| **USB Mode** | Hardware CDC and JTAG |
| **USB CDC On Boot** | Enabled |
| **Upload Mode** | UART0 / Hardware CDC |

1. Pulse'u USB-C portundan USB veri kablosuyla bilgisayara bağla.
2. **Tools** > **Port** menüsünden kartın portunu seç.
3. **Tools** menüsünde tablodaki yedi ayarı kontrol et.
4. Araç çubuğunda **Upload**'a (sağ ok simgesi) bas.

Sonuç: IDE'de "Done uploading." yazar. Kart yeniden açılır ve WiFi ağını yayınlar.

**USB CDC On Boot** **Enabled** olduğu için Probot Core'un açılış mesajları ve WiFi ağının adı USB-C portundan **Serial Monitor**'e gelir.

## Teleop'ta sür {#teleop}

**Init**'e basınca robot hâlâ disabled'dır; motorlar dönmez. `TeleopPeriodic()` **Start**'tan sonra çalışmaya başlar.

1. Telefonu ya da bilgisayarı robotun ağına bağla ve `http://192.168.4.1` adresini aç.
2. Kumandayı bu cihaza bağla ve bir düğmesine bas.
3. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
4. **Init**'e bas.
5. Aynı düğmede yazan **Start**'a bas.
6. Sol çubuğu ileri it.
7. Sağ çubuğu sağa it.

Sonuç: Sol çubuk ileri itilince iki tekerlek ileri döner. Sağ çubuk sağa itilince sol tekerlek ileri, sağ tekerlek geri döner (robot yerdeyken sağa döner). **Stop**'a basınca motorlar durur.

Sol tekerlek ters dönüyorsa kurucuya `left.SetInverted(true);` satırını ekle. Sağ tekerlek ters dönüyorsa `right.SetInverted(true);` satırını sil.

Motorlar Driver Station bağlıyken döner. Driver Station sayfasını kapatırsan ya da bağlantı koparsa kumanda değerleri yaklaşık 0,5 saniyede sıfırlanır ve teleop'ta robot durur. Kumandadan bağımsız komutlar (ör. otonomdaki sabit hız) yaklaşık 5 saniye daha gider: [Çıkışların ne zaman kapandığını bil](pinleri-kullan.md#cikis-kapisi).

## Otonomu dene {#otonom}

Otonom, **Match Control**'deki **Autonomous süresi** kutusunda yazan süre kadar sürer (varsayılan 30 saniye). Kod robotu ilk 2 saniye sürer, kalan sürede robot durur.

1. Teleop çalışıyorsa **Match Control** bölümünde **Stop**'a bas. Robot durmadan mod seçilemez.
2. **Match Control** bölümünde **Autonomous**'u seç.
3. **Init**'e bas.
4. **Start**'a bas.

Sonuç: Robot 2 saniye yarım hızla ileri gider ve durur. Otonom süresi dolunca **Teleoperated** seçili hâle gelir ve düğmede **Init Teleop** yazar.

## Konsolu oku {#konsol}

prosdk'nin mesajları **Logs** sekmesindeki **Robot Console** kartına gelir. `Serial.print` ve `printf` ile yazılanlar oraya gelmez. Konsola yazmak için: [Konsola yaz](kumandayi-oku.md#konsol).

1. Telefonda ya da bilgisayarda Driver Station'ı aç.
2. **Logs** sekmesine bas.
3. **Robot Console** kartını en başa kaydır.

Sonuç: Kartta `********** Robot program starting **********` ve `********** Robot program startup complete **********` satırları görünür. Ardından `Default DisabledPeriodic() method... Override me!` ve `Default RobotPeriodic() method... Override me!` satırları gelir. Bunlar hata değildir; o iki fonksiyonu yazmadığını söyler.

Kod bir C++ istisnası (exception) fırlatırsa konsolda `[prosdk] robot program Robot halted:` ile başlayan bir satır çıkar. Kurucudaki bir hatada `startup complete` satırı hiç çıkmaz. Motorlar kart yeniden başlatılana kadar çalışmaz: [Robot programı durdu](sorunlar.md#halted).

## Sorun mu var?

- **Port listesinde kart yok ya da yükleme hata veriyor:** kablonun veri kablosu olduğunu kontrol et; yalnız şarj eden bir kabloyla port görünmez. Port varsa ama yükleme yine olmuyorsa kartı indirme moduna al: **BOOT**'u basılı tutarken **RESET**'e basıp bırak, sonra **BOOT**'u bırak. **Tools** > **Port**'tan portu yeniden seç, **Upload**'a bas ve yükleme bitince **RESET**'e bas.
- **Kod yüklendi, robotun WiFi ağı görünmüyor:** kart açılmamış ya da indirme modunda kalmış olabilir. **RESET**'e bas; düzelmezse: [Kod yüklendi ama kart açılmıyor](sorunlar.md#acilis-pinleri).
- **Derleme "'BTS7960' in namespace 'prosdk' does not name a type" diye duruyor:** `#include <prosdk/drivers/motor/BTS7960.hpp>` satırı eksik. `<prosdk.h>` robot, sürücü ve kumanda sınıflarını getirmez; her biri kendi başlık dosyasıyla eklenir: ["does not name a type"](sorunlar.md#tur-yok).
- **Start'a bastım, motorlar dönmüyor:** sürücülerin VCC ve GND uçlarının karta, motor besleme girişlerinin güç kaynağına bağlı olduğunu kontrol et. R_EN ve L_EN pinlerinin koddaki GPIO'ya bağlı olduğunu kontrol et. Konsolda `GPIO` geçen ya da `previously allocated` diyen bir `Error at` satırı ve ardından `[prosdk] robot program Robot halted: its constructor threw an exception` satırı varsa: [Pin kullanılamıyor](sorunlar.md#pin).
- **Kumanda tepki vermiyor:** **Joystick** sekmesindeki **Input Source** kartında **Gamepad** satırında "Etkin" yazdığını kontrol et: [Kumanda tepki vermiyor](sorunlar.md#kumanda).

## Sonraki adım

[Robot sınıfını seç](robot-sinifini-sec.md)
