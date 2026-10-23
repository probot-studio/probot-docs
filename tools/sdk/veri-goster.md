# Telemetri ve ayar değerlerini göster

Bu sayfada robotun değerlerini Driver Station'ın **Veri** sekmesinde göstereceksin. Hız gibi bir ayarı kodu yeniden yüklemeden değiştireceksin. Otonomu listeden seçecek, ayarları yeniden başlatmada koruyacaksın.

## Başlamadan önce

- İlk robot kodunu yükledin: [İlk robot kodunu yaz](ilk-robotu-yaz.md).
- Driver Station'ı açmayı ve kumandayı bağlamayı biliyorsun: [Robotun ağına bağlan](../core/ilk-10-dakika.md#robotun-agina-baglan), [Kumandayı bağla](../core/ilk-10-dakika.md#kumandayi-bagla).

Bu sayfadaki Driver Station davranışı kaynak koddan yazıldı; prosdk henüz gerçek bir kartta, ESP32-S3 tabanlı Boardoza Pulse S32-S3 kartında da denenmedi. Örnek, [İlk robot kodunu yaz](ilk-robotu-yaz.md) sayfasındaki BTS7960 pinlerini kullanır: sol sürücü J6'da GPIO 38, 37, 36; sağ sürücü GPIO 35 (J6), 47 ve 48 (J8). Kitin geri kalan elektronik şeması (motor sürücüleri, batarya, kablolama) henüz kesin değil; başka pinler kullanıyorsan koddaki numaraları değiştir.

## Hazır örneği yükle {#ornek}

Örnek üç şeyi birlikte gösterir: Driver Station'dan seçilen bir otonom, Driver Station'dan değiştirilen bir hız çarpanı ve robotun gönderdiği iki değer.

1. Arduino IDE'de **File** > **New Sketch**'i seç.
2. Açılan sketch'teki her satırı sil ve aşağıdaki kodu yapıştır.
3. Araç çubuğunda **Upload**'a bas.
4. Telefonda ya da bilgisayarda Driver Station'ı aç.
5. **Veri** sekmesine bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <prosdk.h>

#include <string>

#include <prosdk/drive/DifferentialDrive.hpp>
#include <prosdk/drivers/motor/BTS7960.hpp>
#include <prosdk/driverstation/Gamepad.hpp>
#include <prosdk/framework/TimedRobot.hpp>
#include <prosdk/system/Timer.hpp>
#include <prosdk/tunables/Selectable.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    right.SetInverted(true);

    // Otonom seçici: Veri sekmesinde açılır liste olur
    otonom.AddDefault("Bekle", "Bekle");
    otonom.Add("İleri git", "İleri git");
    prosdk::tunables::Publish("Otonom", otonom);

    // Hız çarpanı: Veri sekmesinde değiştirilebilir
    prosdk::tunables::Publish("Sürüş/Hız", hiz);
  }

  // Her modda, her turda: değerleri Veri sekmesine gönder
  void RobotPeriodic() override {
    prosdk::telemetry::Log("Sürüş/İleri", ileri);
    prosdk::telemetry::Log("Sürüş/Otonom", secilen);
  }

  void AutonomousInit() override {
    secilen = otonom.GetSelected();  // listede seçili olan seçenek
    timer.Restart();
  }

  void AutonomousPeriodic() override {
    if (secilen == "İleri git" && timer.Get() < 2_s) {
      ileri = 0.5;
    } else {
      ileri = 0.0;
    }
    drive.ArcadeDrive(ileri, 0.0, false);
  }

  void TeleopPeriodic() override {
    // Hız çarpanını her turda yeniden oku: Driver Station'daki değişiklik bir sonraki turda etkiler.
    ileri = -gamepad.GetLeftY() * hiz.Get();
    // false: çubuk değerinin karesi alınmaz, çarpan çıkışı doğrudan ölçekler
    drive.ArcadeDrive(ileri, -gamepad.GetRightX() * hiz.Get(), false);
  }

 private:
  prosdk::BTS7960 left{38, 37, 36};   // RPWM, LPWM, R_EN + L_EN (J6)
  prosdk::BTS7960 right{35, 47, 48};  // RPWM (J6), LPWM ve R_EN + L_EN (J8)
  prosdk::DifferentialDrive drive{left, right};
  prosdk::Gamepad gamepad{0};
  prosdk::Timer timer;

  prosdk::tunables::Selectable<std::string> otonom;
  prosdk::tunables::TunableDouble hiz{0.6};  // kod varsayılanı
  std::string secilen;
  double ileri = 0.0;
};

PROSDK_ROBOT_MAIN(Robot)
```

Sonuç: **Veri** sekmesinde **Telemetry** ve **Tunables** grupları açılır. **Tunables** > **Otonom** satırında "Bekle" seçili bir açılır liste ve "Varsayılan: Bekle" yazısı, **Tunables** > **Sürüş** > **Hız** satırında `0.6` yazan bir sayı kutusu görünür. **Telemetry** > **Sürüş** > **İleri** satırında `0` yazar. **Telemetry** > **Sürüş** > **Otonom** satırı otonom başlayana kadar boş kalır.

Benzer bir otonom seçici kütüphanenin TemplateTimed örneğinde de var: [Şablonlar](ornek-listesi.md#sablonlar).

## Otonomu listeden seç {#otonom-sec}

`Selectable` **Veri** sekmesinde bir açılır liste olur. Kod seçimi `AutonomousInit()` içinde `GetSelected()` ile okur; seçimi otonomu başlatmadan önce yap.

!!! warning "Dikkat"
    Bu adımlarda motorlar döner. İlk denemede tekerlekleri yerden kaldır.

1. **Veri** sekmesinde **Tunables** > **Otonom** listesinden "İleri git"'i seç.
2. **Dashboard** sekmesinde **Match Control** bölümünde **Autonomous**'u seç.
3. **Init**'e bas, sonra **Start**'a bas.
4. **Veri** sekmesine bas.

Sonuç: Robot 2 saniye yarım hızla ileri gider ve durur. **Telemetry** > **Sürüş** > **Otonom** satırında "İleri git" yazar. **Telemetry** > **Sürüş** > **İleri** satırı bu 2 saniyede `0.5`'tir; sekmeyi açtığında süre geçtiyse `0` yazar.

## Değerleri Veri sekmesine gönder {#telemetri}

`prosdk::telemetry::Log(ad, değer)` bir değeri robottan Driver Station'a gönderir. `Log("Sürüş/İleri", x)` **Veri** sekmesinde `/Telemetry/Sürüş/İleri` olarak görünür ve yalnız okunur. Adın içindeki `/` işaretleri ağaçta bir alt grup açar.

1. Göndermek istediğin değer için `RobotPeriodic()` içine bir `prosdk::telemetry::Log` satırı yaz.
2. Kodu yükle.
3. Driver Station'da **Veri** sekmesine bas ve **Telemetry** grubunu aç.

Sonuç: Değer **Telemetry** altında, adındaki gruplara bölünmüş olarak görünür. Robot değeri değiştirdikçe satır güncellenir.

- `RobotPeriodic()` her modda ve robot disabled iken de çalışır. Değeri yalnız teleop'ta göndermek istiyorsan `TeleopPeriodic()`'e yaz.
- Robot değerleri 50 ms'de bir gönderir ve yalnız değişenleri yollar. Bu aralığı `PROBOT_DASH_PERIOD_MS` (10-250) ile değiştirebilirsin. Bir turda aynı ada birden çok değer yazarsan en sonuncusu görünür.
- `Log` için `#include` gerekmez: `<prosdk.h>` telemetriyi ve tunable'ları içerir.

`Log` şu türleri kabul eder:

| Tür | Örnek | **Veri** sekmesinde |
|---|---|---|
| `bool` | `Log("Hazır", true)` | `true` ya da `false` |
| Tam sayı, `float`, `double` | `Log("Tur", sayac)` | Sayı |
| Metin | `Log("Durum", "bekliyor")` | Metin |
| Dizi: `bool`, tam sayı, `float`, `double` ya da metin | `Log("Hızlar", {0.5, 0.4})` | Virgülle ayrılmış değerler |
| Yapı (struct) türleri: `Pose2d`, `Rotation2d` ve diğerleri, dizileri de | `Log("Konum", pose)` | Her alan için `ad = değer` satırı |
| Kendi widget'ı olan sınıflar | `Log("Kol PID", pid)` | Widget: [Widget'la göster](#widget) |

WPILib'deki NetworkTables robotta yoktur. `SmartDashboard` ve `SendableChooser` sınıfları prosdk'de bulunmaz: değer göndermek için `telemetry::Log`, değer almak için tunable, seçici için `Selectable` kullan. AdvantageScope ve Elastic robota canlı bağlanamaz; veriyi sonradan incelemek için `.wpilog` kaydı tut: [Kayıt tut ve dosyaları indir](kayit-tut.md).

## Değeri Driver Station'dan değiştir {#tunable}

Tunable, Driver Station'dan değiştirilebilen bir değişkendir. `prosdk::tunables::Publish(ad, tunable)` onu **Veri** sekmesinde `/Tunables/<ad>` altında düzenlenebilir hâle getirir. Kod değeri `Get()` ile okur.

!!! warning "Dikkat"
    Bu adımlarda motorlar döner. İlk denemede tekerlekleri yerden kaldır.

1. **Veri** sekmesinde **Tunables** > **Sürüş** > **Hız** kutusuna `0.3` yaz.
2. <kbd>Enter</kbd>'a bas.
3. **Dashboard** sekmesinde **Match Control** bölümünde **Teleoperated**'ı seç.
4. **Init**'e bas, sonra **Start**'a bas.
5. **Sol çubuğu** sonuna kadar ileri it.
6. **Veri** sekmesine bas.

Sonuç: Kutunun yanında kısa bir süre "Bekliyor" yazar, sonra kutu robotun kabul ettiği `0.3`'ü gösterir. **Telemetry** > **Sürüş** > **İleri** satırı en çok `0.3` olur ve robot `0.6`'dakinden yavaş gider.

Driver Station'ın yazdığı değer, robot döngüsünün bir sonraki turunda tunable'a yazılır. Bu yüzden tunable'ı bir kez kurucuda değil, kullandığın her turda `Get()` ile oku. Kart yeniden başlayınca tunable kod varsayılanından başlar; değeri korumak için: [Ayarı yeniden başlatmada koru](#kalici-ayar).

| Tür | Driver Station'da |
|---|---|
| `prosdk::tunables::TunableBool` | Onay kutusu. İşaretlemek ya da işareti kaldırmak değeri gönderir. |
| `TunableInt32`, `TunableInt64`, `TunableFloat`, `TunableDouble` | Sayı kutusu. <kbd>Enter</kbd> ya da kutudan çıkmak gönderir. |
| `TunableString` | Metin kutusu. |
| `bool`, tam sayı, `float`, `double` ve metin dizileri (`TunableDoubleVector` vb.) | Metin kutusu. Değerleri virgülle ayırarak yaz: `1,2.5,3`. |

`TunableRaw` ve yapı (struct) tunable'ları Driver Station'da düz satır olarak yalnız okunur. `Field2d` widget'ı bunun dışındadır: `Publish` ile yayınlanan `Field2d`'de konumları sürükleyerek ya da yazarak değiştirebilirsin.

Metin kutularında (metin, dizi, `Field2d`) <kbd>Space</kbd> yalnız robot durmuşken yazılır. Diğer anlarda <kbd>Space</kbd> acil durdurmadır ve robot yeniden başlatılana kadar kilitlenir: [Acil durdurmadan sonra](sorunlar.md#acil-durdurma).

Robot yazmayı reddederse kutunun yanında sebebi yazar: "Tip uyuşmazlığı", "Değiştirilemez", "Değer çözümlenemedi" ya da "Yazma kuyruğu dolu". Aynı satır **Logs** sekmesindeki **Event Log** kartına `Veri yazması reddedildi:` ile başlayarak düşer.

`Publish` bir `bool` döndürür. Topic tablosu doluysa `false` döner ve tunable Driver Station'da görünmez: [Sınırları büyüt](#sinirlar).

## Sayı kutusuna sınır ve birim ver {#sinir-birim}

Sayı kutusuna sınır ve birim vermek için tunable'ı bir `TunableConfig` ile kur. Driver Station sınır dışındaki değeri göndermez ve "Aralık dışı" yazar. Robot bu sınırı kendisi denetlemez.

1. [Hazır örnekteki](#ornek) sketch'te aşağıdaki `#include` satırını diğer `#include` satırlarının yanına ekle.
2. Sınıftaki `hiz` satırını aşağıdaki `HizAyari()` fonksiyonu ve yeni `hiz` satırıyla değiştir. Kurucu ve diğer fonksiyonlar olduğu gibi kalır.
3. Kodu yükle.
4. **Veri** sekmesinde **Tunables** > **Sürüş** > **Hız** kutusuna `2` yaz ve <kbd>Enter</kbd>'a bas.

```cpp
#include <prosdk/tunables/TunableConfig.hpp>

class Robot : public prosdk::TimedRobot {
  // Kurucu, fonksiyonlar ve diğer üyeler hazır örnekteki gibi kalır.

 private:
  static prosdk::tunables::TunableConfig HizAyari() {
    prosdk::tunables::TunableConfig config;
    config.properties["min"] = 0.0;   // en küçük değer
    config.properties["max"] = 1.0;   // en büyük değer
    config.properties["unit"] = "x";  // kutunun yanında görünen birim
    return config;
  }

  prosdk::tunables::TunableDouble hiz{0.6, HizAyari()};
};
```

Sonuç: **Hız** kutusunun yanında `x` birimi görünür. `2` yazınca kutunun yanında "Aralık dışı" yazar ve değer robota gönderilmez.

## Widget'la göster {#widget}

Bazı sınıflar **Veri** sekmesinde düz bir değer yerine bir widget olarak görünür. Driver Station grubun türüne göre bir widget çizer ve türü grubun adının yanına yazar.

| Tür | Nasıl gönderilir | **Veri** sekmesinde |
|---|---|---|
| `Selectable` | `tunables::Publish("Otonom", secici)` | Açılır liste ve "Varsayılan: ..." yazısı. Kod seçimi `GetSelected()` ile okur. |
| `Command` | `tunables::Publish("Kolu kaldır", komut)` | **Çalıştır** düğmesi. Komut çalışırken düğme **Durdur** olur ve "Çalışıyor" yazar. |
| `PIDController` | Ayar için `tunables::Publish("Kol PID", pid)`, izleme için `telemetry::Log("Kol PID", pid)` | `p`, `i`, `d`, `izone`, `setpoint` kutuları bu sırayla. İkisini de yaparsan `measurement` ve `error` aynı grupta canlı görünür. |
| `Alerts` | Bir `prosdk::util::Alert` nesnesi ve `Set(true)` | `/Telemetry/Alerts/<grup>` altında uyarı listesi; hata, uyarı ve bilgi için ayrı simge. Uyarı yoksa "Aktif uyarı yok" yazar. |
| `Scheduler` | **İptal** düğmeleri için `tunables::Publish("Scheduler", zamanlayici)`, yalnız izlemek için `telemetry::Log("Scheduler", zamanlayici)` | "Çalışan komut: 2" yazısı ve her komutun yanında **İptal** düğmesi. |
| `Field2d` | İzleme için `telemetry::Log("Saha", saha)`, sürükleme için `tunables::Publish("Saha", saha)` | Robot konumları bir çizimde. 8 konuma kadar olan nesneler robot olarak çizilir ve sürüklenebilir, daha uzunları yol olarak çizilir. |
| `Mechanism2d` | `telemetry::Log("Mekanizma", mekanizma)` | Kol ve asansör parçalarının çizimi. Yalnız izlenir. |
| `DriverStationDisplay` | `prosdk::DriverStationDisplay` ile satır ekle: [Robot Ekranı'na yaz](kumandayi-oku.md#metin-ekrani) | `/Telemetry/DriverStationDisplay` altında eş aralıklı metin; boşluklar korunur. Aynı metin **Dashboard** sekmesinde **Robot Ekranı** kartında da görünür. |
| Diğer yapılar | `telemetry::Log("Konum", pose)` | Her alan için ayrı satır. |

- `Selectable`'ın seçimi kart yeniden başlayınca varsayılan seçeneğe döner.
- `Field2d` çiziminde saha resmi yoktur. Çizim, görülen bütün konumları içine alacak kadar büyür. Dokunmatik ekranda sürüklemek için önce **Dokunarak sürükle**'ye bas.
- `Alert` nesnesini `prosdk::util::Alert kolUyarisi{"kolSinir", "Kol sınırda", prosdk::util::Alert::Level::kMedium};` gibi kur. Grup vermezsen grup "Alerts" olur ve uyarı `/Telemetry/Alerts/Alerts` altında görünür.
- Komut ve zamanlayıcı widget'larının kullanımı: [Komut tabanlı kod yaz](komut-tabanli-yaz.md#komut-listesi).
- Bu widget'ları kullanan hazır örnekler: Mechanism2d ([Mekanizma ve denetim](ornek-listesi.md#mekanizma)), CommandBasedRobot ([Komut tabanlı ve SysId](ornek-listesi.md#komut-tabanli)), `Field2d` için SimpleDifferentialDriveSimulation ([Durum uzayı ve konum kestirimi](ornek-listesi.md#durum-uzayi)).

## Preferences ile ayar sakla {#preferences}

`prosdk::Preferences` anahtar ve değer çiftlerini kartın kalıcı belleğinde (NVS) saklar. Değerler kart yeniden başlayınca da durur. Her anahtar **Veri** sekmesinde `/Preferences/<anahtar>` olarak düzenlenebilir görünür.

1. [Hazır örnekteki](#ornek) sketch'te `#include` satırını diğer `#include` satırlarının yanına ekle.
2. Kurucuya `InitDouble` satırını ekle. Anahtar zaten varsa `InitDouble` bir şey yapmaz.
3. `TeleopInit()` fonksiyonunu ve `kp` değişkenini sınıfa ekle. `TeleopInit()` değeri `GetDouble` ile okur.
4. Kodu yükle.
5. **Veri** sekmesinde **Preferences** > **KolP** kutusuna `2.5` yaz ve <kbd>Enter</kbd>'a bas.
6. Pulse'taki **RESET** düğmesine bas ya da kartın gücünü kapatıp aç.

```cpp
#include <prosdk/preferences/Preferences.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    // Anahtar yoksa 2.0 ile oluştur; varsa kayıtlı değere dokunma
    prosdk::Preferences::InitDouble("KolP", 2.0);
  }

  void TeleopInit() override {
    // Kayıtlı değeri oku; anahtar yoksa 2.0
    kp = prosdk::Preferences::GetDouble("KolP", 2.0);
  }

 private:
  double kp = 2.0;
};
```

Sonuç: Kart yeniden açılınca **Preferences** > **KolP** kutusu `2.5` gösterir.

- Bütün anahtarlar tek bir NVS kaydında durur ve her değişiklikte yeniden yazılır. `Set...` fonksiyonlarını her turda değişen bir değerle çağırma: flash belleği yıpratır. Aynı değeri yeniden yazmak bir şey yazmaz.
- Sayı okuyan fonksiyonlar (`GetInt`, `GetLong`, `GetFloat`, `GetDouble`) sayı türleri arasında çevirir. Başka türdeki bir anahtar varsayılan değeri döndürür.
- Arduino'nun kendi `Preferences` kütüphanesi de aynı adı kullanır. Karışmaması için her zaman `prosdk::Preferences` yaz.

NVS'e yazılamazsa konsolda `Preferences: writing NVS failed; the change is not persisted` ya da `Preferences: cannot open NVS; the change is not persisted` çıkar. Kayıt okunamazsa `Preferences: stored data is not readable; starting empty` çıkar ve bütün anahtarlar boş başlar.

## Ayarı yeniden başlatmada koru {#kalici-ayar}

Bir tunable'ın Driver Station'da ayarlanan değerini yeniden başlatmada korumak için onu kalıcı yap: `TunableConfig`'in `properties` alanına `"persistent": true` yaz. Kayıt Probot Core'un NVS alanına yazılır.

1. [Hazır örnekteki](#ornek) sketch'e aşağıdaki `#include` satırını, `KaliciAyar()` fonksiyonunu ve `kazanc` satırını ekle; `Publish` satırını kurucuya yaz.
2. Kodu yükle. Robotu durmuş bırak: **Init**'e basma.
3. **Veri** sekmesinde **Tunables** > **Kol** > **Kazanç** kutusuna `0.8` yaz ve <kbd>Enter</kbd>'a bas. Probot Core değeri yaklaşık 2 saniye sonra kaydeder; kartı yeniden başlatmadan önce bekle.
4. Pulse'taki **RESET** düğmesine bas ya da kartın gücünü kapatıp aç.

```cpp
#include <prosdk/tunables/TunableConfig.hpp>

class Robot : public prosdk::TimedRobot {
 public:
  Robot() {
    // Kayıtlı bir değer varsa Publish onu kod varsayılanının yerine koyar.
    prosdk::tunables::Publish("Kol/Kazanç", kazanc);
  }

 private:
  static prosdk::tunables::TunableConfig KaliciAyar() {
    prosdk::tunables::TunableConfig config;
    config.properties["persistent"] = true;  // yeniden başlatmada koru
    return config;
  }

  prosdk::tunables::TunableDouble kazanc{0.6, KaliciAyar()};  // kod varsayılanı 0.6
};
```

Sonuç: Kart açılınca **Kazanç** kutusu `0.6` değil `0.8` gösterir. Kod `kazanc.Get()` ile `0.8` okur.

Driver Station'dan yazdığın değer, robot çalışmıyorken kaydedilir: **Init**'ten önce, **Stop**'tan sonra, otonom ile teleop arasında ya da acil durdurmadan sonra. Sürüş sırasında yaptığın ayar **Stop**'tan sonra kaydedilir; o arada güç giderse kaybolur.

- Değiştirilemez (`isMutable = false`) tunable'lar ve widget'ların (ör. `Selectable`) kendi topic'leri saklanmaz.
- Saklanan değer en çok 2048 bayt olabilir. Sayı ve kısa metin sakla.
- `PROBOT_DASH_MAX_VALUE`'dan uzun bir değeri Driver Station göndermez ve "Değer çok uzun" yazar.
- Robotun kabul ettiği bir değer 2048 bayttan uzunsa, NVS doluysa ya da flash hatası olursa saklanmaz. Bu durumlarda konsola `[PB-E308] dashboard: could not store ... (NVS full, flash error or value over 2048 bytes)` ile başlayan bir satır yazılır.
- `OpModeRobot`'ta kalıcı tunable'ı bir OpMode'un içinde değil, robot sınıfında yayınla. Probot Core ayarı robot durunca kaydeder; OpMode bitince kaldırılan bir tunable'ın o OpMode çalışırken yapılan ayarı saklanmaz: [Programları listeden seç](robot-sinifini-sec.md#opmoderobot).

| | Preferences | Kalıcı tunable |
|---|---|---|
| **Veri** sekmesindeki yeri | `/Preferences/<anahtar>` | `/Tunables/<ad>` |
| Ne saklanır | Kodun `Set` ile verdiği ve Driver Station'ın yazdığı her değer | Yalnız Driver Station'ın yazdığı, robotun kabul ettiği değer |
| Ne zaman yazılır | Her değişiklikte | Robot çalışmıyorken |
| Koddaki varsayılan değişince | `Init...` kayıtlı anahtara dokunmaz | Kayıtlı değer kazanır, `ClearPersistedTunables()` gerekir |

### Kod varsayılanını değiştir {#kod-varsayilanini-degistir}

!!! warning "Dikkat"
    Kayıtlı bir değer, koddaki varsayılandan önce gelir. Kodda `0.6`'yı `0.7` yapıp yüklesen de robot Driver Station'da en son ayarlanan değerle açılır.

Varsayılanı değiştirdikten sonra kayıtları bir kez silmek için `prosdk::platform::ClearPersistedTunables()` kullan. Fonksiyon flash'a yazar; robot durmuşken çağır.

1. Kurucunun en başına `prosdk::platform::ClearPersistedTunables();` satırını ekle.
2. Kodu yükle. Kart açılırken kayıtlar silinir.
3. Satırı sil ve kodu yeniden yükle.

Sonuç: Tunable'lar kod varsayılanıyla açılır. Driver Station'dan yazılan bir sonraki değer yeniden saklanır.

Satırı silmeyi unutursan kayıtlar her açılışta silinir ve hiçbir ayar korunmaz. `ClearPersistedTunables()` silme başarısız olursa `false` döndürür.

## Sınırları büyüt {#sinirlar}

Driver Station'a giden bütün topic'ler Probot Core'un sabit boyutlu bir deposunda tutulur. Bir widget birden çok topic kullanır; **Veri** kartının başlığında toplam topic sayısı yazar. Sınırları sketch'te, `#include <prosdk.h>` satırından önce `#define` ile büyüt.

| Makro | Varsayılan | Aralık | Ne sınırlar |
|---|---|---|---|
| `PROBOT_DASH_MAX_TOPICS` | 128 | 1-255 | Topic sayısı |
| `PROBOT_DASH_MAX_VALUE` | 1024 | 16-16384 | Bir değerin bayt sayısı |
| `PROBOT_DASH_POOL_BYTES` | 32768 | | Adlar, türler, değerler ve şemalar için toplam bayt |
| `PROBOT_DASH_MAX_SCHEMAS` | 32 | 0-255 | Yapı türü (şema) sayısı |
| `PROBOT_DASH_MAX_SCHEMA_BYTES` | 4096 | 16-32768 | Bir şemanın bayt sayısı |
| `PROBOT_DASH_WRITE_QUEUE` | 2048 | | Driver Station'dan bekleyen yazmalar için bayt |

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"      // WiFi ağ adı
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#define PROBOT_DASH_MAX_VALUE   4096   // 170 konuma kadar Field2d nesnesi
#define PROBOT_DASH_POOL_BYTES  65536  // büyük değerler için daha çok yer
#include <prosdk.h>
```

Aralık dışındaki bir değerde derleme `[PB-E108]` ile başlayan bir hatayla durur. Büyük sınırlar daha çok bellek kullanır: `PROBOT_DASH_MAX_VALUE` 16384'te havuzun dışında yaklaşık 33 KB gider.

### Sınır aşılınca ne olur

Sınırı aşan değer saklanmaz ve robot çalışmaya devam eder.

- **Veri** sekmesinde topic'in eski değeri kalır, yanında "Güncel değil: değer çok büyük, sınır 1024 bayt" yazar. Havuz dolduysa sebep "robotta bellek yetmedi" olur. Satırı olmayan widget parçaları widget'ın altında listelenir.
- **Logs** sekmesindeki **Event Log** kartına bir kez `Veri güncellenemedi:` ile başlayan bir satır düşer.
- **Robot Console**'a her sınır türü için bir kez uyarı yazılır; kart yeniden başlayana kadar sonrakiler yazılmaz. Değer için: `[prosdk] dashboard value not stored (larger than PROBOT_DASH_MAX_VALUE or PROBOT_DASH_POOL_BYTES exhausted); later values are tried again, further failures are not reported: '...'`.
- Topic tablosu doluysa: `[prosdk] dashboard topic table is full (PROBOT_DASH_MAX_TOPICS); this and later new topics are not shown: '...'`.
- Bir yapı türünün şeması çok büyükse konsol şemanın boyutunu ve şu anki `PROBOT_DASH_MAX_SCHEMA_BYTES` sınırını yazar. Sınırı şemanın boyutundan büyük yap, en çok 32768: örneğin `#define PROBOT_DASH_MAX_SCHEMA_BYTES 8192`.

Daha sonra sığan bir değer gelince "Güncel değil" yazısı kalkar.

### Field2d için boyut seç

`Field2d`'deki her nesne, konum başına 24 bayt tutan tek bir değerdir. Varsayılan 1024 bayt 42 konum taşır; daha uzun bir yol güncellenmez ve "Güncel değil" olur.

1. En uzun nesnenin konum sayısını 24 ile çarp.
2. `PROBOT_DASH_MAX_VALUE`'yu en az bu sayı yap (en çok 16384). Örnekler: 4096 (170 konum), 8192 (341 konum), 16384 (682 konum).
3. `Field2d`'yi hem `Log` hem `Publish` ile gönderiyorsan her nesne havuzda iki kez yer tutar. `PROBOT_DASH_POOL_BYTES`'ı büyük değerlerin toplamı kadar artır, örneğin 65536 yap.
4. Driver Station'dan uzun bir konum listesi yazacaksan `PROBOT_DASH_WRITE_QUEUE`'yu da 24 × konum sayısına çıkar. Varsayılan 2048 bayt 85 konum yazar.

Sonuç: Yol **Veri** sekmesinde güncellenir ve yanında "Güncel değil" yazmaz.

### Robot Ekranı için boyut seç {#robot-ekrani-boyut}

`DriverStationDisplay` metni de tek bir değerdir ve `PROBOT_DASH_MAX_VALUE`'ya sığacak kadar gönderilir. Sığmayan üst satırlar gönderilmez. Varsayılan 1024 bayt, 160 sütunluk dolu satırların son 6'sını taşır.

- 48 satır ve 160 sütunluk tam ekran ASCII metin 7727 bayttır: `#define PROBOT_DASH_MAX_VALUE 8192` yaz.
- Metinde Türkçe harfler gibi iki baytlık karakterler varsa 16384 yaz.
- Tam ekran metin havuzda 8192'de 8 KB, 16384'te 16 KB yer tutar. 16384 kullanıyorsan ya da çok topic'in varsa `PROBOT_DASH_POOL_BYTES`'ı da artır, örneğin `#define PROBOT_DASH_POOL_BYTES 49152`.

## Sorun mu var?

- **Veri sekmesinde "Robot henüz topic yayınlamadı." yazıyor:** Kod hiç `Log` ya da `Publish` çağırmadı, ya da Driver Station robota bağlı değil.
- **Değerin yanında "Güncel değil" yazıyor:** Değer sınırı aşıyor: [Sınırları büyüt](#sinirlar).
- **Robot Ekranı'nda üst satırlar eksik:** Metin `PROBOT_DASH_MAX_VALUE`'ya sığmıyor: [Robot Ekranı için boyut seç](#robot-ekrani-boyut).
- **Kutunun yanında "Tip uyuşmazlığı" ya da "Değiştirilemez" yazıyor:** Sayfa açıkken robot bu değeri başka bir türle ya da yalnız okunur olarak yeniden yayınladı. Driver Station sayfasını tarayıcıda yenile ve değeri yeniden yaz.
- **Koddaki varsayılanı değiştirdim, robot eski değeri kullanıyor:** Tunable kalıcı ve kayıtlı bir değeri var: [Kod varsayılanını değiştir](#kod-varsayilanini-degistir).
- **Derleme "incomplete type 'struct prosdk::tunables::TunableConfig'" diye duruyor:** `#include <prosdk/tunables/TunableConfig.hpp>` satırı eksik.
- **Derleme "... is not a member of 'Preferences'" ya da "reference to 'Preferences' is ambiguous" diye duruyor:** `Preferences` yerine `prosdk::Preferences` yaz.

## Sonraki adım

[Pinleri ve donanımı kullan](pinleri-kullan.md)
