---
title: Yazılım
---

# Yazılım

## Yaşam Döngüsü

Bir maçta iki faz var. Önce **otonom**: joystick yok, robot yalnızca koda göre hareket eder; varsayılan süre 30 saniye, arayüzden ayarlanabilir. Otonom süresi dolunca robot durur ve **teleop** otomatik seçilir ama başlamaz; sürücü Init ile Start yapınca teleop başlar: kumandayla kontrol edilir, maç sonuna kadar devam eder.

Bu iki fazın dışında robotun iki durumu daha var. Maç başlamadan önce Driver Station'dan mod seçilir (Otonom / TeleOp), sonra **Init** yapılır: robot hazır hale gelir ama hareket etmez. Maç bitince **Stop** ile robot durur; acil durum için ayrı bir **Emergency Stop** var (aşağıda). Bu akış — mod seç, Init, Start, Stop — FTC'deki OpMode modelinin aynısıdır.

Kodda maçın fazlarına karşılık gelen hook'lar var. Normal Arduino'da `setup()` ve `loop()` yazılır; Probot'ta bunların yerine aşağıdaki fonksiyonlar tanımlanır:

```cpp
void autonomousInit() {}                 // Otonom: Init'te 1 kez
void autonomousLoop() {}                 // Otonom: Start sonrası ~50 Hz (ZORUNLU)
void autonomousStop() {}                 // Otonomdan her çıkışta 1 kez (ZORUNLU)
void teleopInit()     {}                 // TeleOp: Init'te 1 kez
void teleopLoop()     {}                 // TeleOp: Start sonrası ~50 Hz (ZORUNLU)
void teleopStop()     {}                 // TeleOp'tan her çıkışta 1 kez (ZORUNLU)
```

Bu fonksiyonlardan dördü zorunludur (`autonomousLoop`, `autonomousStop`, `teleopLoop`, `teleopStop`); kalanlar opsiyoneldir, tanımlanmazsa boş sayılır. Zorunlu bir hook tanımsızsa bağlama (link) hatası alınır. `setup()` ve `loop()` tanımlanmaz; kütüphane sahip, tanımlanırsa derleme hatası verir.

**Faz akışı:**

```
            mod seç (Otonom | TeleOp | Utility)
               │
STOPPED ──Init──> INIT[mod] ──Start──> RUN[mod] ──Stop──> STOPPED
               (modInit 1 kez,        (modStart 1 kez,
                sonra modInitLoop)     sonra modLoop ~50 Hz)

RUN[Otonom] ─süre dolunca─> autonomousStop() → TRANSITION
   (TeleOp otomatik seçilir ama BAŞLAMAZ; sürücü Init + Start yapar)
```

Otonom süresi arayüzden ayarlanır ve yalnızca otonom fazını sınırlar. Süre dolunca robot durur; teleop otomatik seçilir ama sürücü Init ile Start yapana kadar başlamaz. Otonomsuz bir maç için doğrudan teleop modu seçilir.

Bunlara ek olarak üçüncü bir mod var: **Utility**. Kurulum ve bakım kodu (sensör kalibrasyonu, mekanizma homing'i, test) içindir. Driver Station'da yalnız kod `utilityLoop()` tanımladıysa ya da bir framework utility seçeneği listelediyse görünür. Süresi yoktur ve TRANSITION'a geçmez; kumanda girişleri RUN'da açıktır. Hook'ları (`utilityInit`, `utilityInitLoop`, `utilityStart`, `utilityLoop`, `utilityStop`) TeleOp karşılıklarıyla aynı zamanlarda çağrılır ve hepsi opsiyoneldir.

Tüm hook'lar **tek kalıcı task** üzerinde çalışır; task boot'ta açılır ve normal işleyişte asla öldürülmez (`static`/global değişkenler bu yüzden fazlar arasında yaşar). Faz geçişleri kooperatiftir ve her zaman **loop turu sınırında** yapılır — Stop ya da faz değişimi kodu iş ortasında kesemez.

**Loop sözleşmesi:** Turlar sabit bir takvimde, varsayılan olarak 20 ms'de bir başlar ve turun süresi bu periyoda dahildir; loop'a `delay()` koyma, turlar arasında kütüphane bekler ([Loop Periyodu](#loop-periyodu)). Her tur bir gün mutlaka dönmeli. Bloke eden çağrı serbest, *sonsuz* bloke yasak — I2C/sensör çağrılarına timeout koy (`Wire.setTimeOut(50)` gibi). Bir tur 2 saniyeden uzun sürerse halt-safe devreye girer: joystick sıfırlanır, LED kırmızı yanıp söner. Task öldürülmez; tur bitince temizlenir. Tek seferlik `init`/`start`/`stop` hook'larının sınırı 10 saniyedir (`PROBOT_HOOK_DEADLINE_MS`); `init`'te sensör/gyro kalibrasyonu yapılabilir. Bkz. [Hatalar - PB-E301 Deadline Miss](hatalar.md#pb-e301).

Stop kooperatiftir: o anki tur bittikten sonra aktif modun stop hook'u (`autonomousStop()` ya da `teleopStop()`) çalışır. Anında kesme için arayüzdeki **Emergency Stop** (kısayolu **Space** — arayüz açıkken her zaman çalışır; yalnız robot STOPPED iken odaktaki açılır liste ya da **Veri** sekmesindeki metin kutusu Space'i kendisi alır).

**Emergency Stop** terminaldir ve donmuş bir loop'u bile durdurur: kullanıcı task'ı öldürülür, aktif modun stop hook'u taze bir task'ta watchdog'lu çalıştırılır (`PROBOT_ESTOP_END_MS`, 500 ms; aşılırsa çip reboot eder), varsa `PROBOT_ESTOP_ENABLE_PIN` LOW'a çekilir ve robot **reboot'a kadar kilitlenir** — Init/Start reddedilir, kilidi arayüzdeki reboot ya da güç döngüsü açar.

Koddan tetiklemek için `probot::emergencyStop()` çağrılır. Her task'tan — kullanıcı hook'ları dahil — güvenlidir: sadece bir bayrak set eder, gerçek sırayı kütüphane yürütür.

Robotu kilitlemeden durdurmak için (Driver Station'daki **Stop** gibi) `probot::requestStop()` çağrılır. O da her task'tan güvenlidir. Çalışan hook bölünmez: döner, en fazla bir loop turu daha çalışabilir, sonra aktif modun stop hook'u çalışır ve robot STOPPED'a geçer; Driver Station yeniden Init yapabilir. Kabul edilmiş ama başlamamış bir Init ya da Start'ı da iptal eder. Durdurulacak bir şey yoksa, durdurma zaten sürüyorsa ya da acil durdurma kilitliyse `false` döner.

```cpp
if (kolSikisti && probot::requestStop()) {
    probot::console::error("Kol sıkıştı, robot durduruluyor");   // yalnız istek kabul edilince, bir kez
}
```

!!! warning "Yazılım E-stop'u donanım E-stop'un yerini tutmaz"
    Enable pini yazılım kontrolündedir; çip tamamen kilitlenirse çalışmayabilir. Gerçek güvenlik garantisi, güç hattına konan bağımsız **fiziksel E-stop**'tur.

### İleri Seviye: initLoop ve start

Zorunlu init/loop/stop üçlüsünün yanında, her mod için iki opsiyonel hook daha var; çoğu robot bunlara ihtiyaç duymaz.

`autonomousInitLoop()` / `teleopInitLoop()`: Init ile Start arasında sürekli çağrılır. Robot kımıldamadan (girişler nötr, RSL sabit) kod koşturmak için — kamerayla saha randomizasyonu okuma, gyro/sensör kalibrasyon durumunu telemetriye yayınlama, maç öncesi kontrol. Deadline (stall) denetimi bu evrede de işler.

`autonomousStart()` / `teleopStart()`: Start anında bir kezlik iş (zaman damgası, state reset) için. Çoğu durumda loop'un ilk turu yeterli olduğundan nadiren gerekir.

!!! info "0.4.0 notu"
    `robotInit()` ve `robotEnd()` 0.4.0'da kaldırıldı. Kurulum kodunu mod init'lerine taşı (tekrarına dayanıklı işler için ortak bir `setupHardware()` fonksiyonu yazıp iki init'ten çağır), durdurma kodunu iki stop hook'una taşı (ortak `stopMotors()`). Eski bir sketch derlenirse `robotInit`/`robotEnd` tanımlı kaldığı için önce derleme hatası alınır ([PB-E106](hatalar.md#pb-e106)); onlar kaldırılınca `autonomousStop`/`teleopStop` eksikse bağlama (link) hatası gelir ([PB-E201](hatalar.md#pb-e201)). Otonom aç/kapa ayarı da kalktı: otonomsuz başlamak için teleop modunu seç.

---

## Joystick API

Kumanda, USB veya Bluetooth üzerinden tabletteki tarayıcıya bağlanır. Tarayıcı kumandanın çubuk ve buton değerlerini sürekli alır, Driver Station arayüzü bu değerleri WebSocket bağlantısı üzerinden ESP32'ye gönderir. `probot::io::joystick_api` bu veriye ESP32 tarafından erişmek için kullanılan arayüz.

Her loop turunda aşağıdaki satırla joystick nesnesi alınır:

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

Sonra `js.getLeftY()`, `js.getA()` gibi metodlarla değerler okunur. Bu nesneyi her tur yeniden almak normaldir; arka planda herhangi bir bağlantı işlemi yapmaz, sadece en güncel değerleri getirir.

### Eksenler

Kumandadaki analog çubuklar eksen değeri döner. Değer -1 ile +1 arasında bir ondalık sayıdır: tam ileri +1, tam geri -1, ortada 0.

Sol çubuğu ileri itince `getLeftY()` pozitif değer verir, geri çekince negatif. Sağa yatırınca `getLeftX()` pozitif olur. Sağ çubuk da aynı mantıkla çalışır.

| Metod | Açıklama |
|---|---|
| `getLeftX()` | Sol çubuk yatay. Sağ = pozitif |
| `getLeftY()` | Sol çubuk dikey. İleri = pozitif |
| `getRightX()` | Sağ çubuk yatay. Sağ = pozitif |
| `getRightY()` | Sağ çubuk dikey. İleri = pozitif |
| `getLeftTriggerAxis()` | Sol tetik, 0 ile 1 arası. Bırakılmış = 0.0, sonuna kadar basılı = 1.0 |
| `getRightTriggerAxis()` | Sağ tetik, 0 ile 1 arası |

Tarayıcı tetiği analog bildiriyorsa (standart düzendeki çoğu kumanda) yarım basış 0.5 civarı okunur. Dijital tetikli kumandada, klavye ve dokunmatik kaynakta ve WebSocket koptuğunda devreye giren HTTP yedeğinde tetik yalnız 0.0 ya da 1.0 olur. Çubukların deadzone'u tetiklere de uygulanır, bu yüzden bırakılmış tetik 0.0 okunur.

**Deadzone nedir?** Fiziksel kumandalar mekanik olarak tam sıfıra dönmez. Çubuğu bıraksan bile sensör 0.02, 0.03 gibi küçük bir değer okuyabilir. Bu değer motor koduna direkt beslenirse motor çok yavaş da olsa döner. Deadzone bu sorunu çözer: belirli bir eşiğin altındaki değerleri sıfır kabul eder. Varsayılan eşik 0.08; çubuğu bıraktığında -0.08 ile +0.08 arasında kalan her değer sıfır döner.

### Butonlar

Buton metodları `bool` döner: basılıysa `true`, bırakılmışsa `false`.

Buton isimleri Xbox standardını esas alır. PlayStation kumandası kullanılıyorsa karşılık gelen isimler de çalışır; aynı fiziksel butona karşılık gelir.

| Xbox | PlayStation | Metod |
|---|---|---|
| A | Cross (×) | `getA()` / `getCross()` |
| B | Circle (○) | `getB()` / `getCircle()` |
| X | Square (□) | `getX()` / `getSquare()` |
| Y | Triangle (△) | `getY()` / `getTriangle()` |
| LB | L1 | `getLB()` |
| RB | R1 | `getRB()` |
| Back / View | Select | `getBack()` |
| Start / Menu | Options | `getStart()` |
| L3 (sol çubuğa bas) | L3 | `getLeftStickButton()` |
| R3 (sağ çubuğa bas) | R3 | `getRightStickButton()` |

D-Pad (yön tuşları) iki şekilde okunabilir:

```cpp
// Her yön ayrı ayrı bool olarak:
js.getDpadUp();
js.getDpadRight();
js.getDpadDown();
js.getDpadLeft();

// Tek değer olarak açı (derece):
js.getPOV();  // -1 = hiçbiri, 0 = yukarı, 90 = sağ, 180 = aşağı, 270 = sol
```

D-Pad'i butondan okuyan profillerde (`logitech-f310` ve `standard`) çaprazlar da okunur: yukarı+sağ `getPOV()` 45 verir; 135, 225 ve 315 öbür çaprazlardır. Çaprazda iki yön birden `true` olur: yukarı+sağda hem `getDpadUp()` hem `getDpadRight()`. Zıt iki yöne birlikte basılırsa (yukarı+aşağı) ikisi birbirini siler. `"axis9-dpad"` profili D-Pad'i eksenden okur: çapraz yoktur, `getPOV()` yalnız 0, 90, 180 ya da 270 verir.

Bir butonun analog değeri gerekiyorsa `js.getRawButtonValue(i)` 0 ile 1 arası döner. `i` ham buton numarasıdır, profil uygulanmaz. Driver Station o buton için analog değer göndermediyse basılıyken 1.0, değilken 0.0 döner.

### Deadzone Ayarı

Varsayılan 0.08 çoğu kumanda için yeterlidir. Çubuk bırakıldığında motor hâlâ yavaşça dönüyorsa deadzone değeri artırılabilir:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;
auto js = probot::io::joystick_api::makeDefault(opt);
```

### Kumanda Profili

Farklı kumanda modelleri buton ve eksen numaralarını farklı sıralar. Logitech F310'da A butonu tarayıcıya "buton 0" olarak gelirken başka bir kumandada farklı gelebilir. Kütüphane bu farkı profil sistemiyle çözer: hangi numara hangi butona karşılık geliyor sorusunun cevabı profilde tanımlı.

Varsayılan profil `logitech-f310`; Logitech F310 ve yarışmalarda sık kullanılan kumandaların büyük çoğunluğu için çalışır. Xbox One ve DualShock 4 gibi modern kumandalar genellikle `standard` profiliyle çalışır.

Profil değiştirmek için `teleopInit()` içinde:

```cpp
void teleopInit() {
    probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Profil | Kumanda |
|---|---|
| `"logitech-f310"` / `"f310"` | Logitech F310 (varsayılan) |
| `"standard"` / `"xbox"` / `"ds4"` / `"ps"` | Xbox One, DualShock 4 ve W3C standardına uyan diğerleri |
| `"axis9-dpad"` | D-Pad'i eksen olarak değil 9. eksen üzerinden gönderen bazı kumandalar |

Kumanda düğmelere basıldığında hiç tanınmıyorsa ya da yanlış buton tetikleniyorsa profil uyumsuzluğu olabilir.

Hangi kumandanın bağlı olduğunu telemetriye yazdırarak profili seçebilirsin. `getName()` tarayıcının verdiği kumanda adını (en çok 63 bayt) yazar; kumanda bağlı değilse `false` döner ve metin boş kalır. Klavye ve dokunmatik kaynağın adı `Keyboard` ve `Touch`'tır. `isStandardMapping()` tarayıcı kumandayı W3C standart düzeninde bildiriyorsa `true` döner; bu durumda `"standard"` profili uyar.

```cpp
void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    char ad[64];
    probot::clearTelemetry();
    if (js.getName(ad, sizeof ad)) {
        probot::printf("%s standart=%d\n", ad, js.isStandardMapping());
    }
}
```

### Birden Çok Kumanda

Driver Station robota altı porta kadar kumanda gönderir. Port 0, Joystick sekmesinde seçili kaynaktır (kumanda, klavye ya da dokunmatik); `makeDefault()` bunu okur. Aynı cihaza bağlı diğer kumandalar boş olan en küçük port 1-5'i alır ve çıkarılana ya da port 0 için seçilene kadar o portta kalır. Joystick sekmesindeki Gamepad kartı bu kumandaları "Port 1: <kumanda adı>" satırlarıyla listeler.

Port 1-5'teki kumanda `makeForPort(port)` ile okunur:

```cpp
void teleopLoop() {
    auto surucu = probot::io::joystick_api::makeDefault();   // port 0: şasiyi süren
    auto op     = probot::io::joystick_api::makeForPort(1);  // port 1: mekanizmayı süren
    probot::clearTelemetry();
    probot::printf("surucu Y=%.2f\n", surucu.getLeftY());
    probot::printf("op RT=%.2f\n", op.getRightTriggerAxis());
}
```

- Bir kumanda çıkarılırsa portu hemen nötr okunur ve boş kalır; diğer kumandaların portu değişmez.
- Port 0'daki kumanda koparsa port 1-5'teki bir kumanda port 0'a geçmez. Port 0, yeni takılan kumandaya ya da Joystick sekmesinde yeni bir seçime kadar boştur.
- Klavye ya da dokunmatik port 0'dayken seçili kumanda da bir port 1-5 alır; Gamepad kartında "Bağlı (port N)" görünür. Böylece sürücü klavyeyle, operatör kumandayla sürebilir. Klavye ya da dokunmatik kapanınca kumanda port 0'a döner.
- Boşalan port yaklaşık 0,6 saniye başka kumandaya verilmez. O portu bekleyen kumanda daha büyük bir porta geçmez, süre bitince aynı portu alır: kısa bir Bluetooth kopması ya da Joystick sekmesinde seçim değişikliği kumandayı aynı porta döndürür.
- Her port aynı failsafe'i ve aynı kumanda profilini kullanır. 0-5 dışındaki bir port her zaman nötr okunur.

### Failsafe

Joystick verisi 500 ms kesilirse tüm eksen ve buton değerleri otomatik olarak sıfır okunur. Motor hızını doğrudan eksen değerine bağlamak güvenlidir; bağlantı kopunca eksenler sıfıra döner ve motor durur.

---

## Telemetri

Telemetri, kodun içinden Driver Station ekranına metin göndermek için kullanılır. Robot çalışırken değişkenleri, sensör okumalarını veya durum bilgilerini ekranda canlı görmek mümkün. Debug için Serial monitörüne yazmak yerine telemetri kullanmak sahada çok daha pratik; bilgisayar bağlı olmak zorunda değil.

```cpp
probot::print("merhaba");
probot::println("satır sonu ekler");
probot::printf("speed=%.2f load=%d\n", speed, load);
probot::clearTelemetry();
```

Arka planda 256 baytlık bir tampon var; tek bir `printf` çağrısı tamponun tamamını doldurabilir. Her loop turunda önce `clearTelemetry()` çağır, sonra yazmak istediğin değerleri yaz. Yoksa önceki turdan kalan değerler ekranda birikir ve okuması güçleşir.

### Konsol

Telemetri paneli her turda silinip yeniden yazılan bir ekrandır: bir turda yazdığın uyarı sonraki turda kaybolur. Kalıcı kalması gereken mesajları (uyarı, hata, olay) konsola yaz. Driver Station bunları **Logs** sekmesinin en üstündeki **Robot Console** kartında gösterir. Aynı sekmedeki **Event Log** kartı ise Driver Station'ın kendi olaylarını (bağlantı, komutlar, loop aşımı, güncellenemeyen ya da reddedilen dashboard değerleri) gösterir; robot kodu oraya yazamaz.

```cpp
probot::console::info("Otonom: %s", "Sol");
probot::console::warning("Batarya düşük: %.1f V", v);
probot::console::error("Kol motoru takıldı");
probot::console::write(probot::console::Level::Error, metin, uzunluk);   // biçimsiz
```

| Çağrı | Açıklama |
|---|---|
| `console::info/warning/error(fmt, ...)` | `printf` biçimiyle bir satır; en çok 512 bayt, fazlası kesilir |
| `console::write(level, text, len)` | Biçimsiz metin, uzunluk sınırı yok: 512 bayttan uzunsa birkaç satıra bölünür (mümkünse satır sonundan, bir UTF-8 karakterin ortasından asla) |
| `console::print(level, text)` | `write` ile aynı, NUL ile biten metin için |

Seviye `probot::console::Level::Info`, `Warning` ya da `Error`'dır. Sondaki `\n` atılır, satır sonu eklemen gerekmez. İki görev aynı anda 159 bayttan uzun bir satır biçimlendirirse biri 159 baytta kesilir.

Konsolu bir olayda bir kez yaz, loop'ta her tur yazma: tampon birkaç saniyede dolar ve eski uyarılar silinir. Sürekli değişen değerler telemetriye gider.

```cpp
const int LIMIT_PIN = 22;   // switch'in diğer ucu GND'de

void teleopInit() {
    pinMode(LIMIT_PIN, INPUT_PULLUP);   // basılı = LOW
}

void teleopLoop() {
    static bool limitUyarildi = false;
    bool limit = digitalRead(LIMIT_PIN) == LOW;
    if (limit && !limitUyarildi) probot::console::warning("Kol üst limitte");
    limitUyarildi = limit;   // switch bırakılınca bir sonraki basışta yine yazar
}
```

- Satırlar robotta `PROBOT_CONSOLE_BYTES` baytlık bir tamponda durur (varsayılan 4096, 2048-65536; dışı [PB-E110](hatalar.md#pb-e110)). Dolunca en eski satırlar silinir. Tampon heap'ten alınır, yetmezse açılışta Serial'e [PB-E307](hatalar.md#pb-e307) yazılır.
- Konsol her görevden çağrılabilir; kesme (ISR) içinden çağırma. Sketch dışındaki `.cpp` dosyalarında `#include <probot/api.hpp>` yeterli.
- Kart her satırda kendi satır numarasını (robottaki sıra değildir; **Clear** ve sayfa yenileme 0001'den başlatır), seviyeyi (**I** bilgi, **W** uyarı, **E** hata), robotun açılıştan beri geçen süresini (dakika:saniye.onda) ve metni gösterir; hata satırları kırmızıdır.
- Sayfa robota bağlanınca robotta duran satırların hepsi gelir; sayfayı sonradan açmak geçmişi kaçırmaz. Robot yeniden başlarsa araya "Robot yeniden başladı", tampon dolup satır kaçırıldıysa "N satır kaçırıldı (robot konsolu doldu)" satırı girer. Kart en çok 500 satır tutar.
- Başka sekmedeyken uyarı ya da hata gelirse menüdeki **Logs** sekmesinde okunmamış sayısı belirir: hata varsa kırmızı, yalnız uyarı varsa sarı. Bilgi satırları sayılmaz. Sayfa açılınca ya da yenilenince robotta duran satırlar yeniden gelir; bu tarayıcıda **Logs**'ta görülmüş olanlar yeniden sayılmaz, başka bir cihazda ya da tarayıcıda sayılır. **Logs** açılınca ya da **Clear**'a basınca sayı sıfırlanır.
- **Clear** yalnız bu sayfadaki görünümü temizler, robottaki satırlar kalır; sayfayı yenileyince geri gelir.

---

## Motor Kontrolü

Motor sürücüler (H-köprü), ESP32'nin GPIO pinlerini robot motorlarını döndürmeye yetecek akıma dönüştürür. BTS7960, yarışmalarda sık kullanılan ve yüksek akım taşıyabilen bir sürücü. Kütüphanede hazır motor sürücü sınıfı yok; doğrudan `analogWrite` kullanılır.

BTS7960 iki PWM pini üzerinden çalışır: `RPWM` motoru bir yöne, `LPWM` diğer yöne sürer. İkisine aynı anda sinyal verilmez; sürücü hasar görür. Hız `analogWrite` ile 0-255 arası bir PWM değeriyle ayarlanır, yön ise hangi pine sinyal verildiğiyle belirlenir:

```cpp
const int LEFT_RPWM = 16;
const int LEFT_LPWM = 17;

void motorLeft(float speed) {
    speed = constrain(speed, -1.0f, 1.0f);
    if (speed >= 0) {
        analogWrite(LEFT_RPWM, (int)(speed * 255));
        analogWrite(LEFT_LPWM, 0);
    } else {
        analogWrite(LEFT_RPWM, 0);
        analogWrite(LEFT_LPWM, (int)(-speed * 255));
    }
}

void teleopInit() {
    pinMode(LEFT_RPWM, OUTPUT);
    pinMode(LEFT_LPWM, OUTPUT);
}

void stopMotors() {
    analogWrite(LEFT_RPWM, 0);
    analogWrite(LEFT_LPWM, 0);
}

void teleopStop()     { stopMotors(); }
void autonomousStop() { stopMotors(); }

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    motorLeft(js.getLeftY());
}
```

Joystick ekseni -1..+1 arası döner; fonksiyon bunu yön ve hıza dönüştürür. Joystick bağlantısı kopunca eksen sıfıra döner ve motor durur.

Motorları durdurma kodunu **her iki stop hook'una da** yaz; yukarıdaki gibi ortak bir `stopMotors()` fonksiyonu yazıp `autonomousStop()` ile `teleopStop()`'tan çağırmak en temizi. Stop yapılınca loop bir daha çağrılmaz; durdurma kodu stop hook'larında yoksa motorlar dönmeye devam eder.

Sağ motor için aynı fonksiyonu farklı pinlerle tekrarla (`motorRight`) ve `teleopLoop()`'ta `motorRight(js.getRightY())` olarak çağır.

---

## Şasi Tipleri

Şasi, birden fazla motorun birlikte robotu hareket ettirmesi. Aynı fiziksel taban farklı kumanda eşlemeleriyle sürülebilir; tekerlek tipi de robotun neler yapabileceğini belirler. [Örnek Robot](ornekler.md#tank-sasi) sayfasında bu şasiler adım adım class hâline getiriliyor; burada hangi durumda hangisinin seçileceği ve kumanda eşlemeleri ele alınıyor.

**Tank (diferansiyel).** İki taraf bağımsız sürülür. En basit ve en sağlam şasi. İki kumanda tarzı yaygın:

```cpp
// Tank kontrolü: her çubuk bir tarafı sürer
motorLeft(js.getLeftY());
motorRight(js.getRightY());

// Arcade kontrolü: bir çubuk ileri/geri, diğeri dönüş
float fwd  = js.getLeftY();
float turn = js.getRightX();
motorLeft(fwd + turn);
motorRight(fwd - turn);
```

Tank kontrolünde sürücü her tarafı ayrı düşünür; arcade çoğu sürücü için daha sezgisel. Aynı donanım, sadece eşleme farklı.

**Mecanum.** Dört mecanum tekerlek; robot ileri/geri ve dönüşün yanında yana da kayabilir (strafe). Daha çevik ama mekanik olarak karmaşık ve kaymaya açık. Üç eksen birden sürülür; tekerlek hız formülleri ve normalizasyon [Örnek Robot - Mecanum Şasi](ornekler.md#mecanum-sasi) sayfasında.

**Hangisi seçilmeli?** Çoğu yarışma görevi için tank yeter ve en az sorun çıkarır. Yana kayma gerçekten gerekiyorsa (dar alanda hizalanma gibi) mecanum düşünülür; aksi halde ek karmaşıklık genellikle değmez.

---

## Sürüşü İyileştirmek

Çubuk değerini doğrudan motora vermek çalışır ama sürüş kaba olur. Birkaç basit teknik kontrolü belirgin biçimde iyileştirir.

**Üs alma.** Çubuğun küçük hareketleri robotu sert tepki verdirir; hassas manevra zorlaşır. Değerin küpünü almak, işareti koruyarak düşük bölgeyi yumuşatır: çubuk yarıdayken çıkış `0.5³ = 0.125`, yani çok daha yavaş; sona doğru hızla artar. Düşük hızda hassas, yüksek hızda tam güç.

```cpp
float shape(float x) { return x * x * x; }   // küp; işaret korunur

motorLeft(shape(js.getLeftY()));
```

Daha hafif bir seçenek değeri mutlak değeriyle çarpmak (`x * fabs(x)`): yine işaret korunur, etki küpten daha az olur.

**Slew rate.** Çubuk aniden tam ileri itilince motora bir anda tam güç gider; bu sıçrama tekerleği patinaj yaptırır veya robotu sarsar. Slew rate, çıkışın bir turdan diğerine ne kadar değişebileceğini sınırlar; komut yumuşar.

```cpp
float slew(float target, float current, float max_step) {
    float diff = constrain(target - current, -max_step, max_step);
    return current + diff;
}

static float drive_out = 0.0f;
drive_out = slew(js.getLeftY(), drive_out, 0.05f);  // tur başına en fazla 0.05
motorLeft(drive_out);
```

`max_step` küçüldükçe yumuşama artar ama tepki gecikir; deneyerek dengelenir.

**Deadzone.** Çubuk merkezde tam sıfıra dönmez; küçük artık değerler motoru hafifçe döndürür. Kütüphane bunu varsayılan 0.08 eşikle zaten temizliyor, ayarı [Joystick API](#joystick-api) bölümünde.

---

## Servo

Hobi servoları 50 Hz PWM sinyali bekler: her 20 ms'de bir darbe gelir, darbe genişliği açıyı belirler. 1000 µs ≈ 0°, 1500 µs ≈ 90°, 2000 µs ≈ 180°. Gerçek uçlar servoya göre değişir; kalibrasyon gerekebilir.

!!! info "0.3.0 notu"
    Eski sürümlerdeki `probot::devices::Servo` sınıfı 0.3.0'da kaldırıldı; kütüphane servo sınıfı sağlamaz. Servo aşağıdaki ham LEDC kalıbıyla sürülür.

Bu sinyali üretmek için ESP32'nin LEDC donanımı kullanılır. `analogWrite` (motorlar) yaklaşık 1 kHz çalışır, servo için çok hızlıdır. Servo için LEDC'yi ayrıca 50 Hz'e kurmak gerekir.

```cpp
const uint8_t SERVO_PIN = 4;

void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
    deg = constrain(deg, 0.0f, 180.0f);
    uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
    ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

void teleopInit() {
    // analogWrite (motorlar) düşük LEDC kanallarını kullanır (0, 1, 2…).
    // Kanal 7 seçmek timer çakışmasını önler.
    ledcAttachChannel(SERVO_PIN, 50, 14, 7);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    if (js.getA())      servoAngle(SERVO_PIN, 0.0f);
    else if (js.getB()) servoAngle(SERVO_PIN, 180.0f);
}
```

`ledcAttachChannel(pin, frekans, çözünürlük_bit, kanal)`: 50 Hz frekans, 14 bit çözünürlük. 14 bit → 16383 = tam 20 ms'lik period. `us * 16383 / 20000` dönüşümü µs'yi duty değerine çevirir.

Birden fazla servo için her birine ayrı pin ve **yüksek** kanal ver (7, 6, 5… gibi üstten aşağı); motorlar `analogWrite` ile kanalları alttan (0, 1, 2…) aldığından timer çakışması olmaz. Hepsi 50 Hz olduğundan servolar aynı timer'ı paylaşabilir.

`teleopInit()`'te `ledcAttachChannel` çağrıldıktan sonra ilk `servoAngle()` çağrısına kadar servo sinyal bekler; robot açılışta servo aniden zıplamaz.

**Güç:** Servoyu ESP32 kartının 5V/3.3V pininden besleme. Bu pinler yüksek akımı karşılamaz; servo seğirir veya ESP32 sıfırlanır. Ayrı 5-6V kaynak (BEC/UBEC) kullan. Sinyal kablosu ESP32 pinine, güç ve GND BEC'e bağlanır; BEC GND ile ESP32 GND ortak tutulmalı.

---

## Subsystem Deseni

Robot büyüdükçe tüm mantığı `teleopLoop` içine yığmak yönetilemez hâle gelir. Önerilen yapı: her mekanizmayı (şasi, kol, slider, gripper) ayrı bir class olarak yazmak. Her subsystem aynı arayüzü paylaşır:

- `init()`: pinleri ayarlar; her modun init'inde (`teleopInit()` / `autonomousInit()`) çağrılır.
- Eylem metodları: `up()`, `set()`, `open()` gibi dışarıdan verilen komutlar.
- `stop()`: mekanizmayı güvenli hâle getirir; her iki stop hook'unda (`teleopStop()` / `autonomousStop()`) çağrılır.
- Gerekiyorsa `periodic()`: her loop turunda çağrılan, sensör okuyan veya hedefe yaklaşan iç mantık.

Bu desende `teleopLoop` yalnızca girişleri subsystem metodlarına bağlar; donanım detayı subsystem'in içinde kalır:

```cpp
void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();

    drive.arcade(js.getLeftY(), js.getRightX());
    if (js.getRB()) intake.run(); else intake.stop();
    slider.periodic();   // sensör tabanlı subsystem'ler her tur güncellenir
}
```

Bir mekanizmayı değiştirmek diğerlerini etkilemez ve otonom da aynı metodları çağırır. [Örnek Robot](ornekler.md) sayfasındaki tüm sistemler bu desenle yazılı.

---

## Subsystem Örnekleri: Slider

Slider (lineer hareket eden kızak), yarışmalarda en sık kullanılan mekanizmalardan. Aynı slider üç farklı şekilde sürülebilir; karmaşıklık ve hassasiyet arttıkça farklı yöntemler gerekir. Sırayla en basitten gelişmişe.

### 1. Limit Switch ve Sabit Güç

En basit yaklaşım: butona basıldıkça sabit güçle hareket et, uçtaki limit switch tetiklenince dur. Konum bilgisi yok; sadece "yukarı git" ve "aşağı git" var. Çoğu görev için bu yeterli.

```cpp
class slider_t {
public:
    slider_t(int rpwm, int lpwm, int limit_low, int limit_high)
        : _rpwm(rpwm), _lpwm(lpwm), _limit_low(limit_low), _limit_high(limit_high) {}

    void init() {
        pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
        pinMode(_limit_low, INPUT_PULLUP); pinMode(_limit_high, INPUT_PULLUP);
    }

    void up()   { if (digitalRead(_limit_high) == LOW) { stop(); return; } _drive(0.8f); }
    void down() { if (digitalRead(_limit_low)  == LOW) { stop(); return; } _drive(-0.8f); }
    void stop() { _drive(0.0f); }

private:
    void _drive(float speed) {
        if (speed >= 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else            { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }
    int _rpwm, _lpwm, _limit_low, _limit_high;
};

slider_t slider(20, 21, 22, 23);
```

Kullanımı [Örnek Robot - Kol](ornekler.md#kol-limit-switchli-mekanizma) ile aynı mantık: limit switch `INPUT_PULLUP` ile okunur, basılı = `LOW` = o yönde dur.

### 2. Limit Switch Yoksa: Süreyle

Limit switch takılı değilse konum süreyle tahmin edilir: bir komut sliderı sabit süre boyunca sürer. `periodic()` her turda süreyi kontrol eder ve dolduğunda durur; loop bloke edilmez.

```cpp
class timed_slider_t {
public:
    timed_slider_t(int rpwm, int lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

    void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); }

    void raise() { _start( 0.8f, 1200); }   // 1.2 sn yukarı
    void lower() { _start(-0.8f, 1200); }   // 1.2 sn aşağı

    void periodic() {
        if (_running && millis() - _t0 >= _dur) stop();
    }

    void stop() { _running = false; _drive(0.0f); }

private:
    void _start(float speed, uint32_t dur) {
        _t0 = millis(); _dur = dur; _running = true; _drive(speed);
    }
    void _drive(float speed) {
        if (speed >= 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else            { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }
    int      _rpwm, _lpwm;
    bool     _running = false;
    uint32_t _t0 = 0, _dur = 0;
};
```

Buton basımında `raise()` veya `lower()` çağrılır, `teleopLoop` her turda `periodic()` çağırır. Süre yöntemi limit switch koruması içermez; süreyi mekanizma ucuna çarpmayacak şekilde ayarlamak gerekir.

### 3. Encoder Varsa: PID Şablonu

Encoder, sliderın gerçek konumunu (tick sayısı) verir. Bununla bir hedef konuma gidilebilir: hata (hedef eksi mevcut konum) hesaplanır, motora hatayla orantılı bir güç verilir. Bu geri besleme döngüsü PID olarak bilinir.

probot-core encoder veya PID sağlamaz; aşağıdaki yalnızca bir başlangıç şablonu. Encoder okuma ve kazanç kalibrasyonu (kp, ardından gerekirse ki ve kd) size kalıyor.

```cpp
class pid_slider_t {
public:
    pid_slider_t(int rpwm, int lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

    void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); }

    void setTarget(long ticks) { _target = ticks; }

    void periodic() {
        long pos   = readEncoder();          // kendi encoder okumanız
        float error = (float)(_target - pos);

        float out = _kp * error;             // basit P; ki, kd eklenebilir
        out = constrain(out, -1.0f, 1.0f);
        _drive(out);
    }

    void stop() { _drive(0.0f); }

private:
    long readEncoder() { return 0; }         // TODO: encoder tick sayısı döndür
    void _drive(float speed) {
        if (speed >= 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else            { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }
    int   _rpwm, _lpwm;
    long  _target = 0;
    float _kp = 0.0f;                        // kalibrasyon: önce sadece kp artırılır
};
```

Kalibrasyon kabaca şöyle: `_kp` sıfırdan başlanıp slider hedefe doğru hareket edene kadar küçük adımlarla artırılır. Hedefin etrafında salınıyorsa fazla; çok yavaş yaklaşıyorsa az. İnce ayar (salınımı söndürme, kalıcı hatayı kapatma) için ki ve kd terimleri eklenir. Bu ayar deneme gerektirir ve mekanizmaya özeldir.

---

## LED Durumu

Kütüphane ESP32'deki NeoPixel LED'i otomatik yönetir; müdahale gerekmez. LED rengi robotun o anki durumunu gösterir. (Eski sürümlerdeki `setColor` / `set` / `setBrightness` API'si 0.3.0'da kaldırıldı; LED tamamen kütüphanenin kontrolündedir.)

Robota harici bir sinyal lambası (RSL) bağlanabilir: `#define PROBOT_RSL_PIN <gpio>` verilirse kütüphane o pini de yönetir — robot hareket edebilirken (otonom, teleop ya da utility çalışırken) yanıp söner, hareket edemezken (durdurulmuş, Init evresi ya da acil durdurma) sabit yanar.

| Renk | Anlam |
|---|---|
| Mavi sabit | Robot durdurulmuş, Driver Station bağlı değil. Init, çalışma ve otonom bitişinde Driver Station bağlı olmasa da o fazın rengi görünür |
| Mavi yanıp sönüyor | Driver Station bağlı, robot durduruldu; mod seçimi ve Init bekleniyor |
| Sarı sabit | Init yapıldı (Otonom, TeleOp ya da Utility), Start bekleniyor |
| Sarı yanıp sönüyor | Otonom bitti; TeleOp için Init bekleniyor |
| Turuncu yanıp sönüyor | Otonom çalışıyor |
| Yeşil yanıp sönüyor | Teleop çalışıyor |
| Mor yanıp sönüyor | Utility çalışıyor (kurulum ve bakım modu) |
| Kırmızı yanıp sönüyor | Deadline miss, loop bloke oldu |
| Kırmızı sabit | Emergency stop aktif |

Varsayılan pin GPIO 3. Farklı bir pine bağlıysa `#include <probot.h>`'den önce tanımla:

```cpp
#define NEOPIXEL_PIN 48
```

---

<a id="batarya-olcumu"></a>
## Batarya Ölçümü

Arayüzdeki batarya göstergesini besleyecek gerilimi kütüphaneye üç yoldan verebilirsin. Hiçbiri açık değilse gösterge **"Veri yok"** der. Bir yöntem seç; ADC ile INA aynı anda kullanılamaz (derlemede [PB-E105](hatalar.md#pb-e105) ile yakalanır).

### 1. Gerilim Bölücü + ADC

En ucuz yöntem: iki dirençle bataryayı ADC'nin okuyabileceği aralığa indirirsin.

```
BAT+ ──[100k]──┬──[22k]── GND
               │
             GPIO5 (ADC1) ── 100nF ── GND
```

```cpp
#define PROBOT_BATTERY_ADC_PIN  5     // GPIO1-10 arası ŞART (ADC1)
#define PROBOT_BATTERY_R_TOP_K  100
#define PROBOT_BATTERY_R_BOT_K  22
```

Pin **GPIO1-10** arasından seçilmeli: ADC2 pinleri (GPIO11-20) WiFi açıkken çalışmaz; yanlış pin derlemede [PB-E104](hatalar.md#pb-e104) ile yakalanır. 100k/22k, 3S LiPo'nun 12.6 V tepesini 2.27 V'a indirir (ADC'nin doğrusal bölgesi). Orta uca 100nF kondansatör koy; bölücüyü **ana anahtarın sonrasına** bağla ki robot kapalıyken pili süzmesin (~0.1 mA).

Okuma eFuse kalibrasyonlu, 8 örnek ortalama + yumuşatma ile ~%1-2 doğruluktadır. Multimetreyle fark görürsen `PROBOT_BATTERY_TRIM` ile ince ayar yap.

### 2. INA219 / INA226 I2C Sensörü

Daha hassas ve lehim istemez:

```cpp
#define PROBOT_BATTERY_INA       226   // ya da 219
// opsiyonel: PROBOT_BATTERY_INA_ADDR / _SDA / _SCL
```

INA'nın shunt'ı üzerinden anlık akım da okunur: `probot::io::battery::currentAmps()` ([Koddan okumak](#batarya-koddan)). Sensöre çalışma zamanında ulaşılamazsa [PB-E306](hatalar.md#pb-e306) uyarısı düşer ve gösterge "Veri yok"a döner.

!!! warning "INA'nın I2C bus'ını kullanıcı kodundan kullanma"
    Kütüphane INA'yı kendi görev döngüsünden okur; aynı `Wire` bus'ına robot kodundan ikinci bir cihaz (IMU, OLED...) bağlarsan okumalar karışabilir. Kendi I2C cihazın varsa ya batarya için ADC yöntemini seç ya da cihazını `Wire1`'e (ayrı pinler) taşı.

!!! info "Shunt notu"
    Akım hesabı `PROBOT_BATTERY_INA_SHUNT_MOHM` (varsayılan 100) ile yapılır. INA226'nın ±81.92 mV shunt aralığı 100 mΩ ile ±0.82 A'da doyar — modülündeki shunt değerini (örn. 2 mΩ) tanımla. Gerilim ölçümü shunt'tan bağımsızdır.

### 3. Elle Besleme

Kendi ölçümün varsa gerilimi doğrudan verebilirsin:

```cpp
probot::setBatteryVoltage(v);
```

ADC ya da INA tanımlıyken bunu kullanma; otomatik okuma değeri düzenli üzerine yazar.

### Göstergeyi Okumak

Dashboard göstergesi son ~8 saniyenin ortalamasını gösterir. **Logs → History** grafiği ise örnekleri ortalamasız çizer; motor yükünde gerilim çöküşünü (sag) oradan izle. Hata durumları için: [PB-E104](hatalar.md#pb-e104) / [PB-E105](hatalar.md#pb-e105) / [PB-E306](hatalar.md#pb-e306).

<a id="batarya-koddan"></a>
**Koddan okumak.** `probot::io::battery` her yapılandırmada vardır; sketch dışındaki `.cpp` dosyalarında `#include <probot/api.hpp>` yeterli.

| Fonksiyon | Ne yapar |
|---|---|
| `currentAmps()` | Bataryadan çekilen akım, amper (INA'nın VIN+ ucu batarya, VIN- ucu yük tarafında). INA tanımlı değilse, ilk örnekten önce ya da sensör yanıt vermiyorsa `NaN`: `isnan()` ile bak |
| `setLowVoltage(volt)` | `isLowVoltage()` için eşik. Yalnız bir bayrak kurar, motorları kapatmaz. `0` kapatır (varsayılan). Negatif, `NaN` ya da 100 V ve üstü değerde `false` döner, eşik değişmez |
| `isLowVoltage()` | Robotun yayınladığı batarya gerilimi (ölçülen ya da `setBatteryVoltage()` ile verilen; **Logs → History**'deki değer, göstergenin ~8 saniyelik ortalaması değil) eşiğin altında. Eşik kapalıyken ya da okuma yokken `false` |

ADC ya da INA okuması yumuşatılır ve 0,1 V adımlarla değişir; yük altındaki kısa bir çökme `isLowVoltage()`'da görünmeyebilir. `setBatteryVoltage()` ile verilen değer olduğu gibi kullanılır.

```cpp
void teleopInit() {
    probot::io::battery::setLowVoltage(11.0f);   // 3S LiPo için uyarı eşiği
}

void teleopLoop() {
    static bool uyarildi = false;
    bool dusuk = probot::io::battery::isLowVoltage();
    if (dusuk && !uyarildi) probot::console::warning("Batarya düşük");
    uyarildi = dusuk;

    float akim = probot::io::battery::currentAmps();
    probot::clearTelemetry();
    if (!isnan(akim)) probot::printf("akim=%.2f A\n", akim);
}
```

!!! warning "currentAmps() artık NaN döner"
    Önceki sürümlerde `currentAmps()` akım okuması yokken `0` dönerdi. `0`'la karşılaştıran kod `isnan()` kullanmalı.

---

## WiFi Yapılandırması

Robot bir WiFi erişim noktası (AP) açar. Bu erişim noktasının adı, şifresi ve kanalı `#include <probot.h>`'den **önce** makrolarla tanımlanır. Sonrasında tanımlanırsa derleme hatasına yol açar.

### Zorunlu Makrolar

```cpp
#define PROBOT_WIFI_AP_PASSWORD "en_az_8_karakter"
#define PROBOT_WIFI_AP_CHANNEL  1    // 1, 6 veya 11 önerilir
```

### Opsiyonel

```cpp
#define PROBOT_WIFI_AP_SSID "RobotAdi"   // tanımsız bırakılırsa "Probot-XXXXXX"
```

### Tüm Makrolar

| Makro | Varsayılan | Açıklama |
|---|---|---|
| `PROBOT_WIFI_AP_SSID` | `Probot-XXXXXX` | WiFi ağ adı. Tanımsız = MAC adresinden otomatik |
| `PROBOT_WIFI_AP_PASSWORD` | zorunlu | ≥8 karakter |
| `PROBOT_WIFI_AP_CHANNEL` | zorunlu | 1-13 serbest; varsayılan öneri 1, 6 veya 11 |
| `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` | kapalı | SSID sonuna `-XXXXXX` ekler |
| `PROBOT_DS_TIMEOUT_MS` | `10000` | DS sessizlik timeout'u (ms) |
| `PROBOT_DS_TIMEOUT_FORCE_STOP` | `1` | `1`: timeout'ta STOP. `0`: joystick nötr, loop sürer |
| `PROBOT_DS_OWNER_TIMEOUT_MS` | `5000` | Sahip client sessiz kalınca slot boşalma süresi (ms) |
| `PROBOT_INPUT_TIMEOUT_MS` | `500` | Joystick verisi kesilince eksen sıfırlama süresi (ms) |
| `PROBOT_CAPTIVE_PORTAL` | `1` | `0`: captive portal devre dışı |
| `PROBOT_WIFI_ENABLE_11B` | `0` | `1`: 802.11b aç (eski cihazlar, önerilmez) |
| `PROBOT_WIFI_PMF_REQUIRED` | `0` | `1`: PMF zorunlu, eski tabletlerle uyumsuz olabilir |
| `NEOPIXEL_PIN` / `NEOPIXEL_COUNT` | `3` / `1` | LED pin ve adedi |
| `NEOPIXEL_BRIGHTNESS` | `32` | LED parlaklığı (0-255) |
| `PROBOT_LOOP_DEADLINE_MS` | `2000` | Bu süreyi aşan tur halt-safe'e girer |
| `PROBOT_HOOK_DEADLINE_MS` | `10000` | Tek seferlik `init`/`start`/`stop` hook'ları için aynı sınır; `PROBOT_LOOP_DEADLINE_MS`'den küçük olamaz |
| `PROBOT_WDT_TIMEOUT_S` | `8` | Donanım watchdog; yalnız kütüphane task'ını izler, kullanıcı loop'u reboot ettirmez |
| `PROBOT_ESTOP_END_MS` | `500` | Acil durdurmada aktif modun stop hook'una tanınan süre; aşılırsa çip reboot eder |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | Kütüphanenin sürdüğü enable GPIO'su (motor sürücü enable). Boot'ta HIGH, acil durdurmada LOW |
| `PROBOT_RSL_PIN` | `-1` | Sinyal lambası (RSL) pini: robot hareket edebilirken yanıp söner, edemezken sabit yanar |
| `PROBOT_BATTERY_ADC_PIN` | kapalı | Batarya ölçümü, yöntem 1: gerilim bölücünün orta ucu. **ADC1 pini şart (GPIO1-10)** — ADC2 WiFi açıkken çalışmaz [PB-E104] |
| `PROBOT_BATTERY_R_TOP_K` / `_R_BOT_K` | — | Bölücü dirençleri, kΩ (batarya tarafı / GND tarafı). 3S için öneri: 100k/22k → 12.6 V'ta 2.27 V |
| `PROBOT_BATTERY_INA` | kapalı | Batarya ölçümü, yöntem 2: I2C sensör — `219` ya da `226`. ADC yöntemiyle birlikte kullanılamaz [PB-E105] |
| `PROBOT_BATTERY_INA_ADDR` | `0x40` | INA I2C adresi (0x08-0x77) |
| `PROBOT_BATTERY_INA_SDA` / `_SCL` | kart default'u | INA için I2C pinleri (ikisi birlikte verilir) |
| `PROBOT_BATTERY_INA_SHUNT_MOHM` | `100` | INA shunt değeri, mΩ; anlık akım hesabı için |
| `PROBOT_BATTERY_TRIM` | `1.0f` | Multimetreyle ince ayar çarpanı (0.5-2.0) |
| `USER_LOOP_PERIOD_MS` | `20` | Loop çağrı periyodu, ms (~50 Hz); sabit hızlı, 1-1000 [PB-E109]. Çalışırken [`probot::setLoopPeriodMs()`](#loop-periyodu) |
| `PROBOT_USER_STACK` | `8192` | Hook'ların çalıştığı user task'ın stack'i, bayt (en az 4096) [PB-E107] |
| `PROBOT_DASH_MAX_TOPICS` | `128` | Dashboard topic sayısı (1-255) [PB-E108] |
| `PROBOT_DASH_MAX_SCHEMAS` | `32` | Şema sayısı (0-255) [PB-E108] |
| `PROBOT_DASH_MAX_VALUE` | `1024` | Değer / özellik başına bayt (16-16384) [PB-E108]. Havuzun dışında iki tampon RAM'den alınır: WebSocket alma tamponu (değer + 4 bayt) ve çerçeve tamponu (değer ile `PROBOT_DASH_MAX_SCHEMA_BYTES`'tan büyük olanı + ~520 bayt). Varsayılanlarla ~5,6 KB, 16384'te ~33 KB; değeri 4096'nın altında küçültmek yalnız alma tamponunu küçültür |
| `PROBOT_DASH_MAX_SCHEMA_BYTES` | `4096` | Şema başına bayt (16-32768) [PB-E108]; protobuf tanımları bir değerden büyük olabilir. Çerçeve tamponu da bu boyutla büyür (32768'de ~33 KB RAM) |
| `PROBOT_DASH_POOL_BYTES` | `32768` | Ad, tip, özellik, değer ve şemalar için toplam bayt |
| `PROBOT_DASH_WRITE_QUEUE` | `2048` | Bekleyen Driver Station yazmaları için bayt |
| `PROBOT_DASH_PERIOD_MS` | `50` | Dashboard gönderim periyodu, ms (10-250) [PB-E108] |
| `PROBOT_DASH_MAX_BYTES_PER_TICK` | `8192` | Periyot başına en çok dashboard baytı |
| `PROBOT_CONSOLE_BYTES` | `4096` | Robot konsolu tamponu, bayt (2048-65536) [PB-E110]. Bkz. [Konsol](#konsol) |
| `PROBOT_FRAMEWORK` | tanımsız | Tanımlıysa OpMode hook'larının hepsi isteğe bağlı olur. Bkz. [Framework Katmanı](#framework-katmani) |
| `PROBOT_ESTOP_ENABLE_PIN` | `-1` | Motor sürücü enable pini; acil durdurmada LOW çeker |

### Pratik Senaryolar

**Aynı kodu birden çok robota yüklemek.** Tüm robotlar aynı SSID ile açılırsa ağlar birbirine karışır. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` her robotun SSID'sine kendi MAC adresinin son baytlarını ekler: "RobotAdi" → "RobotAdi-A1B2C3". Böylece her robot benzersiz görünür, kod aynı kalır.

```cpp
#define PROBOT_WIFI_AP_SSID            "RobotAdi"
#define PROBOT_WIFI_AP_SSID_MAC_SUFFIX
#include <probot.h>
```

**Tezgahta Driver Station olmadan test.** Varsayılanda Driver Station 10 saniye sessiz kalınca robot STOP'a geçer (`PROBOT_DS_TIMEOUT_FORCE_STOP 1`). DS bağlamadan motor veya sensör denemek için bunu `0` yaparsan robot STOP'a geçmez; bağlantı kesik olsa bile joystick nötrlenir ama loop dönmeye devam eder. Yarışmada `1` kalmalı, bu yalnızca test için.

```cpp
#define PROBOT_DS_TIMEOUT_FORCE_STOP 0   // SADECE tezgah testi
#include <probot.h>
```

**Donanımsal acil durdurma.** BTS7960'ın `EN` (enable) pinlerini tek bir GPIO'ya bağlayıp bu pini `PROBOT_ESTOP_ENABLE_PIN`'e verirsen, kütüphane pini normalde `HIGH` (enable) tutar, acil durdurmada `LOW` çeker. Böylece motorlar yalnızca yazılımla değil, sürücü seviyesinde de kesilir; kod kilitlense bile motor durur.

```cpp
#define PROBOT_ESTOP_ENABLE_PIN 25   // BTS7960 EN pinlerine bağlı GPIO
#include <probot.h>
```

**LED'i kısmak veya pinini değiştirmek.** Varsayılan parlaklık 32; gözü rahatsız ediyorsa düşür. LED farklı bir pine bağlıysa pini değiştir.

```cpp
#define NEOPIXEL_BRIGHTNESS 16
#define NEOPIXEL_PIN        48
#include <probot.h>
```

---

## Otonom

Otonom fazda joystick yok. Robot tamamen koda bağlı. Bunu yapmanın yolu: `autonomousInit()`'te başlangıç durumunu ayarla, `autonomousLoop()`'ta her turda ne yapacağına karar ver.

`autonomousLoop` ~50 Hz'de çağrılır, yani her tur yaklaşık 20 ms'de bir geliyor. İçinde `delay(2000)` gibi uzun bir bekleme varsa o tur 2 saniye boyunca dönmez; kütüphane bu durumu tespit eder ve **deadline miss** hatası oluşur. Deadline miss'te joystick sıfırlanır ve LED kırmızı yanıp söner; task öldürülmez, faz değişmez, tur dönünce hata kendiliğinden temizlenir. Daha fazla bilgi için [Hatalar - PB-E301 Deadline Miss](hatalar.md#pb-e301) sayfasına bakılabilir.

Bunun yerine bekleme için `millis()` kullanılır: her turda geçen zamanı kontrol et, süre dolunca bir sonraki adıma geç.

### Durum Makinesi

En basit otonom, sabit süreli fazlardan oluşan bir durum makinesi. Aşağıdaki örnek ileri gider, sola döner ve durur.

```cpp
enum class Phase { FORWARD, TURN_LEFT, DONE };
static Phase phase;
static uint32_t t_ref;

void autonomousInit() {
    phase = Phase::FORWARD;
    t_ref = 0;
}

void autonomousLoop() {
    if (t_ref == 0) t_ref = millis();   // ilk tur = Start anı
    uint32_t elapsed = millis() - t_ref;

    switch (phase) {
        case Phase::FORWARD:
            // motorLeft(0.6f); motorRight(0.6f);
            if (elapsed > 2000) { phase = Phase::TURN_LEFT; t_ref = millis(); }
            break;
        case Phase::TURN_LEFT:
            // motorLeft(-0.4f); motorRight(0.4f);
            if (elapsed > 800) { phase = Phase::DONE; }
            break;
        case Phase::DONE:
            // motorLeft(0); motorRight(0);
            break;
    }
}

void autonomousStop() { stopMotors(); }
```

`static` değişkenler program boyunca değerlerini korur. `autonomousInit()` her otonom başlangıcında çağrıldığı için bu değişkenleri burada sıfırla; yoksa bir önceki çalışmadan kalan değerle başlar. Zaman damgası ise Init'te alınmaz: Init ile Start arasında süre geçebilir ve Init'te robot kımıldamaz; bu yüzden `t_ref`, loop'un ilk turunda — yani Start anında — ayarlanır (`t_ref == 0` kalıbı).

### Mesafe ve Açıyla Hareket

Süre yerine mesafe cinsinden düşünmek daha kolaydır: "1 metre ileri, 90 derece sağa, 0.5 metre ileri". Encoder olmadan robot gerçek mesafeyi bilemez ama sabit güçte geçen süre kabaca sabit mesafeye karşılık gelir. İki katsayı deneyerek bulunur: 1 metrenin kaç saniye, 1 derecenin kaç saniye sürdüğü. Bu yöntemin adım listesine dayalı temel kurulumu [Örnek Robot - Mesafe ve Açıyla Hareket](ornekler.md#mesafe-ve-acyla-hareket) sayfasında; aşağıda aynı fikir koordinatlara genişletiliyor.

### Koordinata Gitme

Robotun başlangıç konumu ve yönü biliniyorsa, saha üzerinde koordinat noktaları tanımlanıp "şu noktaya git" denebilir. Robot her nokta için önce hedefe döner, sonra aradaki mesafeyi gider. Konum metre, yön derece cinsinden tutulur; yön 0, başlangıçta bakılan ileri yön, pozitif yön saat yönünde (sağa) artar.

Her nokta için iki şey hesaplanır: hedefe bakan yön ve aradaki mesafe. Yön, konum farkından `atan2(dx, dy)` ile bulunur; argüman sırası `dx, dy`, çünkü yön 0 ileri (`+Y`) yönüne karşılık gelir. Robotun o anki yönüyle hedef yön arasındaki fark, ne kadar dönüleceğini verir. `normalizeDeg` bu farkı -180 ile +180 arasına çeker; böylece robot 350 derece dönmek yerine kısa yoldan ters yöne 10 derece döner. Mesafe ise iki nokta arası düz çizgi uzunluğu (`sqrt(dx² + dy²)`).

```cpp
void drive(float fwd, float turn) {
    motorLeft(fwd + turn);
    motorRight(fwd - turn);
}

const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;

enum class Move { GO, TURN };
struct Step { Move type; float amount; };

struct Point { float x, y; };
Point waypoints[] = { { 1.0f, 1.0f }, { 1.0f, 2.0f }, { 0.0f, 2.0f } };
const int WP_COUNT = sizeof(waypoints) / sizeof(waypoints[0]);

float robot_x = 0.0f, robot_y = 0.0f, robot_deg = 0.0f;

Step     plan[2 * WP_COUNT];
int      step_count = 0, step_i = 0;
uint32_t step_start = 0, step_dur = 0;

float normalizeDeg(float d) {
    while (d >  180.0f) d -= 360.0f;
    while (d < -180.0f) d += 360.0f;
    return d;
}

void buildPlan() {
    step_count = 0;
    float x = robot_x, y = robot_y, heading = robot_deg;
    for (int i = 0; i < WP_COUNT; i++) {
        float dx = waypoints[i].x - x;
        float dy = waypoints[i].y - y;
        float target = degrees(atan2(dx, dy));
        plan[step_count++] = { Move::TURN, normalizeDeg(target - heading) };
        plan[step_count++] = { Move::GO,   sqrt(dx * dx + dy * dy) };
        x = waypoints[i].x; y = waypoints[i].y; heading = target;
    }
}

void startStep(int i) {
    step_i = i; step_start = millis();
    if (i >= step_count) { drive(0.0f, 0.0f); return; }
    Step s = plan[i];
    if (s.type == Move::GO) {
        step_dur = (uint32_t)(fabs(s.amount) * SEC_PER_METER * 1000);   // saniye -> ms
        drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
    } else {
        step_dur = (uint32_t)(fabs(s.amount) * SEC_PER_DEGREE * 1000);  // saniye -> ms
        drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
    }
}

void autonomousInit() { buildPlan(); startStep(0); }

void autonomousLoop() {
    if (step_i < step_count && millis() - step_start >= step_dur) startStep(step_i + 1);
}

void autonomousStop() { stopMotors(); }
```

Bu yöntem tank şaside makul çalışır; mecanumda kayma yüzünden daha az güvenilir. Yine de tahmine dayanır ve her adımda biraz sapma birikir. Sapmayı gerçekten ölçüp düzeltmek encoder ve jiroskop gerektirir; bu rehber bu katmanlara girmiyor.

### Hareketi Mekanizmalarla Birleştirmek

Gerçek bir otonom yalnızca sürmez; mekanizmaları da çalıştırır. Subsystem deseni bunu kolaylaştırır: her faz hem sürüşü hem mekanizmayı kumanda eder, sensör tabanlı subsystem'ler her turda `periodic()` ile güncellenir. Aşağıda robot ileri gider, sliderı hedefe kaldırır ve intake'i çalıştırır.

```cpp
enum class Phase { DRIVE_TO, RAISE, INTAKE, DONE };
static Phase phase;
static uint32_t t_ref;

void autonomousInit() {
    phase = Phase::DRIVE_TO;
    t_ref = 0;
}

void autonomousLoop() {
    if (t_ref == 0) t_ref = millis();   // ilk tur = Start anı
    uint32_t elapsed = millis() - t_ref;
    slider.periodic();   // PID slider hedefe her turda yaklaşır

    switch (phase) {
        case Phase::DRIVE_TO:
            drive(0.6f, 0.0f);
            if (elapsed > 1500) { drive(0.0f, 0.0f); slider.setTarget(800); phase = Phase::RAISE; t_ref = millis(); }
            break;
        case Phase::RAISE:
            if (elapsed > 1000) { phase = Phase::INTAKE; t_ref = millis(); }
            break;
        case Phase::INTAKE:
            intake.run();
            if (elapsed > 1200) { intake.stop(); phase = Phase::DONE; }
            break;
        case Phase::DONE:
            break;
    }
}

void autonomousStop() { stopMotors(); }
```

Her faz bir komut gibi davranır: bir koşul sağlanınca (süre dolunca veya hedefe ulaşınca) sıradakine geçer. Karmaşık otonomlar bu desenin uzamış hâli.

---

## Robot Durumu (İleri Seviye)

Robotun o anki fazını ve durumunu kod içinden okumak gerekirse:

```cpp
auto s = probot::robot::state().read();
```

| Alan | Tip | Açıklama |
|---|---|---|
| `s.status` | `Status::INIT/START/STOP` | Son kabul edilen komut |
| `s.phase` | `Phase::STOPPED/AUTO_INIT/AUTO_RUN/TELEOP_INIT/TELEOP_RUN/TRANSITION/UTILITY_INIT/UTILITY_RUN` | Mevcut faz (hook'u tamamlanmış gerçek evre) |
| `s.selectedMode` | `OpMode::AUTO/TELEOP/UTILITY` | Seçili mod (Otonom / TeleOp / Utility) |
| `s.opModeId` | uint64_t | Seçili OpMode seçeneğinin id'si (`0` = yok). Bkz. [OpMode Listesi](#opmode-listesi) |
| `s.deadlineMiss` | bool | Halt-safe aktif mi |
| `s.autoPeriodSeconds` | int32_t | Otonom süresi (sn) |
| `s.clientCount` | int32_t | Bağlı DS istemcisi |
| `s.batteryVoltage` | float | Batarya ölçümünden gelen gerilim; `0.0` = veri yok. Bkz. [Batarya Ölçümü](#batarya-olcumu) |

Aynı durum robot **dışından** da okunabilir (kendi izleme aracını ya da DS istemcisini yazanlar için): `GET /getState` şu JSON'u döner: `{"status":N,"phase":N,"selectedMode":"auto"|"teleop"|"utility","autoPeriodSeconds":N,"autoRemainingMs":N,"batt":V.V,"estop":b,"opMode":"N","omv":N,"util":b}` — `opMode` seçili OpMode seçeneğini (`"0"` = yok), `omv` OpMode listesinin sürüm sayacını, `util` Utility'nin seçilebilir olduğunu, `estop` alanı acil durdurma kilidini, `batt` alanı batarya ölçümünden gelen pil gerilimini gösterir (`0.0` = veri yok; bkz. [Batarya Ölçümü](#batarya-olcumu)). WebSocket bağlantısında robot aynı bilgiyi `'S'` çerçevesiyle kendisi push eder (alanlar `/getState` + `/health` birleşimi; `dash*` sayaçları yalnız `/health`'te, `dashMax` yalnız `'S'`'te; değişiklikte ~250 ms içinde, değişiklik yoksa ~1.25 sn'de bir heartbeat olarak). Endpoint'lerin ve çerçeve formatlarının tam listesi core deposundaki `API.md`'de.

### Tipli Durum: probot::ds

`probot::ds` aynı durumu hazır sorularla verir. `#include <probot/api.hpp>` ile her `.cpp` dosyasından kullanılabilir.

| Fonksiyon | Döner |
|---|---|
| `ds::phase()` | Çalışan faz; acil durdurma kilitlendiyse `Phase::STOPPED` |
| `ds::selectedMode()` | Driver Station'da seçili mod (`OpMode::AUTO` / `TELEOP` / `UTILITY`) |
| `ds::selectedOpModeId()` | Driver Station'da seçili OpMode seçeneğinin id'si; seçili modda seçenek yoksa `0`. Otonom süresi dolunca, koşu bitmeden TeleOp seçimine döner |
| `ds::activeOpModeId()` | Şu anki (ya da son) koşunun Init'te aldığı seçenek id'si; ilk Init'ten önce `0`. Hook'larda bunu kullan |
| `ds::utilityAvailable()` | Utility seçilebilir: `utilityLoop()` tanımlı ya da utility seçeneği listelenmiş |
| `ds::outputsEnabled()` | Motor ve mekanizmalar sürülebilir: başlamış RUN fazı, stall yok, acil durdurma yok |
| `ds::isEStopped()` | Acil durdurma kilitli (reboot'a kadar) |
| `ds::isAttached()` | Robotu sahiplenmiş bir Driver Station istemcisi var |
| `ds::matchTimeSeconds()` | Otonom süresinden kalan saniye (AUTO_RUN'da); zamanlı dönem yoksa `-1` |
| `ds::packetSeq()` | Tek sayaç: hangi porttan gelirse gelsin her joystick (`'J'`) paketinde (iki kumandayla her gönderimde iki kez) ve kabul edilen mod/OpMode/Init/Start/Stop komutunda artar (acil durdurma ve reboot isteğinde artmaz) |
| `ds::rslState()` | Sinyal lambası (RSL) şu an yanık mı: robot hareket edebilen RUN fazında yanıp söner, diğer durumlarda sürekli yanar. `PROBOT_RSL_PIN` bağlı olmasa da izlenir; çalışma zamanı başlamadan `false` |
| `ds::commsDisableCount()` | Açılıştan beri Driver Station bağlantısı koptuğu için çalışan (Start verilmiş) robotun kaç kez durdurulduğu ([PB-E303](hatalar.md#pb-e303)). Init sırasındaki kopma ve `PROBOT_DS_TIMEOUT_FORCE_STOP 0` iken kopma ([PB-E304](hatalar.md#pb-e304)) sayılmaz |
| `ds::rawGamepad(port, out)` | Kapısız son joystick karesi, her fazda (`port` 0-5). Port yoksa ya da kare gelmediyse `false` |
| `ds::systemTimeValid()` | Sistem saati (`time()`, `gettimeofday()`) gerçek zamanı tutuyor: açılıştan beri bir Driver Station saati kurdu. Bkz. [Saat](#saat) |

`ds::rawGamepad()` (ve aynı kaynağı veren `probot::io::rawGamepad(port)`; `port` verilmezse 0) menü, otonom seçimi ve buton eşlemesi içindir. Motor **sürmek için kullanma**: motor ve mekanizmalar için kapılı `probot::io::gamepad()` / joystick API'sini kullan. Kapısız veri de bağlantı kesilince `PROBOT_INPUT_TIMEOUT_MS` sonra sıfırlanır.

<a id="saat"></a>
**Saat.** Robotta pilli bir saat yok: güç verilince `time()` 1970'ten saymaya başlar (yazılımla yeniden başlatmada önceki saatten devam edebilir, yine de geçerli sayılmaz). Driver Station sayfası robota her bağlandığında tarayıcının saatini gönderir ve robot sistem saatini ona göre kurar. Saat, sayfayı açan cihazın saati kadar doğrudur.

- İlk geçerli saat her zaman kurulur. Sonrakiler yalnız robot durmuşken (STOPPED, bekleyen komut yokken) kurulur; otonom ile TeleOp arası da maçtan sayılır. Böylece maç sırasında saat atlamaz.
- Saat kurulana kadar `ds::systemTimeValid()` `false` döner. Dosya adı ya da kayıt zamanı yazmadan önce buna bak.
- Saat yalnız sayfanın WebSocket bağlantısıyla gelir. Init ise HTTP ile gider: sayfa WebSocket'e bağlanamadıysa ya da cihazın saati 2024-2100 dışındaysa robot saatsiz Init alabilir.
- Saat UTC'dir. Yerel saat için saat dilimini bir kez kur: `setenv("TZ", "<+03>-3", 1); tzset();` (Türkiye, UTC+3).

```cpp
#include <time.h>

void autonomousInit() {
    setenv("TZ", "<+03>-3", 1);   // Türkiye saati, UTC+3
    tzset();
    if (!probot::ds::systemTimeValid()) {
        probot::console::warning("Saat gelmedi: WebSocket bağlantısını ve cihaz saatini kontrol et");
        return;
    }
    time_t simdi = time(nullptr);
    struct tm t;
    localtime_r(&simdi, &t);
    char ad[32];
    strftime(ad, sizeof ad, "oto-%Y%m%d-%H%M%S.csv", &t);
    probot::console::info("Kayıt dosyası: %s", ad);
}
```

### OpMode Listesi

Birden çok otonom ya da teleop programı olan kod (ör. bir framework) seçenekleri Driver Station'a listeler. Seçili modda seçenek varsa Driver Station onları mod listesinin altında bir açılır listede gösterir (gruplar alt başlık olur); seçenek yoksa liste görünmez. Listeyi açılışta, ilk Init'ten önce ver: Init'ten önce çalışan bir sketch hook'u olmadığı için statik ilklendirme kullan ([framework](#framework-katmani) kullanıyorsan `onBoot` da olur):

```cpp
static const probot::ds::OpModeOption kOptions[] = {
  // id (0 olmaz, benzersiz), mod, ad, grup (opsiyonel), açıklama (opsiyonel)
  {101, probot::ds::OpMode::AUTO,    "Sol",    "Otonom", "Topla ve çık"},
  {102, probot::ds::OpMode::AUTO,    "Sağ",    "Otonom", nullptr},
  {201, probot::ds::OpMode::TELEOP,  "Arcade", nullptr,  nullptr},
  {301, probot::ds::OpMode::UTILITY, "Kol homing", nullptr, nullptr},
};
static const bool kListed = probot::ds::setOpModeOptions(kOptions, 4);   // açılışta; metinler kopyalanır

void autonomousInit() {
  uint64_t id = probot::ds::activeOpModeId(); // bu koşunun seçeneği
}
```

- En çok 64 seçenek; ad ve grup en çok 63, açıklama 255 bayt. Liste ve JSON'u heap'te tutulur; uzun açıklamalı büyük bir liste onlarca KB yer.
- Geçersiz liste (`id` 0 ya da tekrarlı, boş ya da sınırı aşan metin, 64'ten fazla seçenek, bilinmeyen mod) ya da bellek yetmezse `false` döner, eski liste kalır; metin kısaltılmaz. Liste her an değiştirilebilir.
- Mod seçilince o modun son seçilen (yoksa ilk) seçeneği seçilir. Otonom süresi dolup TeleOp önseçildiğinde de aynı kural geçerlidir.
- Robot STOPPED iken seçili seçenek yeni listede yoksa o modun son seçilen (yoksa ilk) seçeneğine geçer. Init/Run sırasında seçim değişmez; liste o sırada değiştiyse düzeltme bir sonraki Init'te yapılır. Utility seçiliyken Utility artık sunulmuyorsa seçim TeleOp'a geçer.
- Hook'larda `ds::activeOpModeId()` kullan: Init'te alınan seçeneği verir, koşu sırasında değişmez.

Kendi istemcini yazıyorsan: `GET /opmodes` listeyi `{"options":[{"id":"101","mode":"auto","name":"Sol","group":"Otonom","description":"..."}]}` olarak döner (`id` 64 bitlik olabildiği için metindir; liste hiç verilmediyse `{"options":[]}`). Liste değişince `/getState` ve `'S'` çerçevesindeki `omv` artar; yanıt sırasında değişirse bağlantı kapanır, yeniden iste. Seçim `/robotControl?cmd=opmode&id=N` ile yapılır (`id` ondalık metin): listede yoksa 400, Init/Run sırasında 409 ([PB-E409](hatalar.md#pb-e409)). Utility modu `cmd=mode&val=utility` ile, yalnız `util` true iken seçilir.

### Loop Periyodu

`initLoop` ve `loop` hook'ları sabit hızda çağrılır: turlar periyot aralıklı sabit bir takvimde başlar ve hook'un kendi süresi periyoda dahildir. 20 ms periyotta 5 ms süren bir tur, sonraki tura kadar 15 ms bekler. Bu yüzden loop'a `delay()` koyma: turlar arasındaki beklemeyi kütüphane yapar, loop'taki bekleme turun süresine eklenir ve tur periyodu geçerse aşım sayılır. Geç uyanan bir tur sonrakilerin planlı başlangıcını kaydırmaz.

| Fonksiyon | Açıklama |
|---|---|
| `probot::setLoopPeriodMs(ms)` | Periyodu 1-1000 ms yapar, bir sonraki turdan geçerli; `0` varsayılana (`USER_LOOP_PERIOD_MS`) döner. Aralık dışında `false` döner, periyot değişmez |
| `probot::loopPeriodMs()` | Geçerli periyot (ms) |
| `probot::loopOverruns()` | Açılıştan beri periyodunu aşan tur sayısı |
| `probot::loopGridRestarts()` | Açılıştan beri takvimin yeniden başlama sayısı: geç biten her tur, Init/Start/Stop turları dahil |

```cpp
void utilityInit() { probot::setLoopPeriodMs(5); }   // kalibrasyonda 200 Hz
void utilityLoop() { /* kalibrasyon adımı */ }        // Utility'nin görünmesi için gerekli
void utilityStop() { probot::setLoopPeriodMs(0); }   // varsayılana dön
```

- Periyot modlar arasında korunur; bir moda özelse o modun stop hook'unda `0` ile geri al. Açılıştaki değeri `USER_LOOP_PERIOD_MS` makrosu belirler ([Tüm Makrolar](#tum-makrolar)).
- Periyodunu aşan bir turdan sonra kaçırılan turlar art arda çalıştırılmaz; takvim kısa bir beklemeden sonra yeniden başlar.
- Init, Start ya da Stop hook'unu çalıştıran turlar aşım sayılmaz; onların sınırı `PROBOT_HOOK_DEADLINE_MS`'tir. Geç biterlerse takvim yine yeniden başlar: `loopGridRestarts()` bunları da sayar. Kendi zamanlamasını turlara göre ayarlayan kod (ör. bir framework) bu sayıyı her turun başında bir önceki turdakiyle karşılaştırmalı: değiştiyse takvim bu turla yeniden başlamıştır, zamanlamanı bu turun başından say.
- Aşım deadline miss değildir: yalnız sayılır, girişler kesilmez. Bir tur 2 saniyeyi (`PROBOT_LOOP_DEADLINE_MS`) aşarsa [PB-E301](hatalar.md#pb-e301) devreye girer. Turlar arasındaki bekleme bu süreye sayılmaz; 1000 ms'lik bir periyot da takılma sayılmaz.

`GET /health` ve WebSocket `'S'` çerçevesi `loopMs` (geçerli periyot) ve `overruns` (aşım sayısı) alanlarını taşır. Driver Station bunları **Logs** sekmesindeki Network Status kartında **Loop** satırında gösterir (ör. `20 ms, 0 overrun`); açılıştan beri aşım olduysa değer sarıya döner ve olay kaydına en çok 10 saniyede bir `Loop periyodu N kez aşıldı` uyarısı düşer.

<a id="framework-katmani"></a>
## Framework Katmanı (İleri Seviye)

Kendi döngüsünü süren bir katman (ör. bir robot framework SDK'sı) user task'ta her fazda çalışabilir. Normal robot kodu için gerekmez.

```cpp
#include <probot/api.hpp>
static const bool kInstalled = probot::framework::install({
  &onBoot,          // user task'ta, ilk turdan önce bir kez
  &onPreCycle,      // her turda, TÜM fazlarda, OpMode hook'undan önce
  &onPostCycle,     // her turda, TÜM fazlarda, OpMode hook'undan sonra
  &onEmergencyStop  // acil durdurmada, user task silindikten sonra
});
```

- `install()` bir kez ve runtime başlamadan önce kabul edilir (statik ilklendirme uygundur); sonraki çağrılar `false` döner. Her alan `nullptr` olabilir.
- `preCycle`/`postCycle` Init ve Run fazlarında OpMode hook'larıyla aynı stall sınırına tabidir (`PROBOT_LOOP_DEADLINE_MS`, [PB-E301](hatalar.md#pb-e301)). STOPPED ve TRANSITION'da stall denetimi yoktur; orada takılma algılanmaz.
- `emergencyStop` user task silindikten sonra core 1'de yeni bir task'ta, aktif `stop()` hook'undan önce çalışır. Stop hook'uyla birlikte `PROBOT_ESTOP_END_MS` içinde bitmezse çip reboot eder ([PB-E305](hatalar.md#pb-e305)). Kısa olmalı, user kodunun tutmuş olabileceği kilitleri almamalı: çıkışları güvenli duruma alıp dönmeli.
- Kaydı sketch'ten referans et (ya da PlatformIO'da `lib_archive = no` kullan): arşivlenmiş bir kütüphane nesnesine hiçbir şey referans vermiyorsa linker onu statik ilklendiricisiyle birlikte atabilir.
- Sketch `#include <probot.h>`'den önce `PROBOT_FRAMEWORK` tanımlarsa OpMode hook'larının hepsi isteğe bağlı olur ([PB-E201](hatalar.md#pb-e201) çıkmaz). Tanımlanan hook'lar framework turunun içinde çalışmaya devam eder. Bu modda yanlış yazılmış bir hook adı hata vermez, sadece çalışmaz.

### Başka .cpp Dosyaları ve Sürüm Makroları

`<probot/api.hpp>` WiFi ve batarya makrolarını istemez; sketch dışındaki `.cpp` dosyalarına bu eklenir. Durumu, `probot::ds`, `probot::framework`, telemetri, gamepad/joystick tiplerini, batarya okumalarını (`probot::io::battery`), dosya paylaşımını (`probot::files`) ve sürüm makrolarını içerir. `<probot.h>` bunu da ekler ve runtime'ı (WiFi AP, Driver Station, `setup()`/`loop()`) kurar; yalnız sketch'te bir kez eklenir.

Kodun belirli bir kütüphane sürümü gerektiriyorsa:

```cpp
#if defined(PROBOT_VERSION) && PROBOT_VERSION >= PROBOT_VERSION_OF(0, 5, 0)
// ...
#endif
```

`PROBOT_VERSION_MAJOR`, `PROBOT_VERSION_MINOR`, `PROBOT_VERSION_PATCH` ve `PROBOT_VERSION_STRING` de tanımlıdır.

<a id="dosya-paylasimi"></a>
## Dosya Paylaşımı (İleri Seviye)

Robot programının LittleFS'e ya da SD karta yazdığı dosyalar (maç kaydı, CSV, `.wpilog`) Driver Station'da **Logs** sekmesindeki **Dosyalar** kartında listelenir ve tarayıcıya indirilir. Kodda klasörü `probot::files::share()` ile bir kez paylaşırsın; dosyaya yazmak programın işidir.

`setup()`'ı kütüphane tanımlar. Dosya sistemini açılışta bağlayıp paylaşmak için [Framework Katmanı](#framework-katmani)'nın `boot` alanını kullan:

```cpp
#include <LittleFS.h>

void dosyalariPaylas() {                 // açılışta, ilk turdan önce bir kez çalışır
    if (!LittleFS.begin(true)) {         // bağlanamazsa bölümü biçimlendirir (ilk kullanımda boş bölüm böyle hazırlanır)
        probot::console::error("LittleFS bağlanamadı");
        return;
    }
    LittleFS.mkdir("/kayit");
    if (!probot::files::share("kayit", LittleFS, "/kayit")) {
        probot::console::error("kayit paylaşılamadı");
    }
}

static const bool kAcilis = probot::framework::install({ &dosyalariPaylas, nullptr, nullptr, nullptr });
```

`install()` yalnız bir kez kabul edilir. Kodun ya da kullandığın bir framework onu zaten çağırıyorsa `dosyalariPaylas()`'ı o `boot` fonksiyonunun içinden çağır. O da yoksa `autonomousInit()`, `teleopInit()` ve `utilityInit()` başında çağır ve bir `static bool` ile yalnız ilk seferde çalıştır. Bu durumda paylaşım ilk Init'e kadar yoktur: robot her açıldığında kart ancak bir Init ve Stop'tan sonra görünür.

LittleFS, `spiffs` adlı bölümü kullanır. Önerilen **Huge APP** bölümlemesinde bu bölüm 896 KB'tır (menüde "1MB SPIFFS" yazar).

`bool probot::files::share(ad, fs, klasor = "/")`:

| Parametre | Kural |
|---|---|
| `ad` | Kartta görünen başlık: 1-15 karakter, `A-Z a-z 0-9 _ -`. En fazla 4 paylaşım |
| `fs` | Bağlanmış bir Arduino dosya sistemi (`LittleFS`, `SD`, `SD_MMC`...). Paylaşım sürdükçe bağlı kalmalı |
| `klasor` | `/` ile başlayan yol (en çok 95 bayt). `.` ya da `..` adlı bir parça içeremez (`/a/./b` olmaz, `/kayit.v2` olur); sondaki `/` atılır. Yalnız doğrudan bu klasördeki dosyalar sunulur, alt klasörler sunulmaz |

Geçersiz ad ya da klasörde ve 4 paylaşım doluyken yeni bir adda `false` döner. Aynı adla yeniden çağırmak paylaşımı değiştirir (ör. kayıtlar LittleFS'ten SD karta taşınınca). Klasörün var olup olmadığına bakmaz: yoksa kart "klasör açılamadı" der. Kart paylaşım başına en çok 256 dosya gösterir (klasördeki ilk 512 girişe bakılır). Adı 127 bayttan uzun ya da kontrol karakteri içeren dosyalar listelenmez.

`fs::FS` nesnesi olmayan, ESP-IDF VFS ile bağlanmış bir dosya sistemi (ör. `esp_vfs_fat_sdspi_mount` ile `/sd`) mutlak yoluyla paylaşılır: `probot::files::share("sd", "/sd/logs")`. Kurallar aynıdır.

`probot::files::unshare(ad)` paylaşımı kaldırır (o adda paylaşım yoksa `false`). Kaldırılan ya da değiştirilen paylaşımdan süren indirme kesilir; `unshare()` ve değiştiren `share()` bunu en çok 1 saniye bekler. Takılan bir kart ya da okumayı bırakan bir tarayıcı indirmeyi birkaç saniye daha sürdürebilir: `probot::files::busy()` bir listeleme ya da indirme herhangi bir paylaşımdan klasör ya da dosya açık tuttuğu sürece `true` döner. Dosya sistemini ayırmadan (`LittleFS.end()`, SD kartı çıkarmadan) önce `unshare()` çağır ve `busy()` `false` olana dek bekle. Bunu bir stop ya da Init hook'unda yap: robot çalışırken aktarım olmaz, Init verilince süren aktarım kesilir; robot dururken OpMode hook'ları çalışmaz. Stop hook'unda `busy()` genelde hemen `false` döner. Init'te hâlâ `true` ise hook'ta `while` ile bekleme: `teleopInitLoop()` / `teleopLoop()` içinde her turda bak, `false` olunca ayır. `PROBOT_HAS_FILES_SHARE` makrosu bu fonksiyonların kütüphanede olduğunu derleme anında bildirir.

**Kart.** Her paylaşım adıyla, altında dosyaları en yenisi üstte, boyut ve tarihiyle görünür. Dosyanın adına tıklayınca indirilir; **Yenile** listeyi yeniden alır. Dosyaları yalnız robotu kontrol eden cihaz listeler ve indirir.

Kod paylaşım yapmadıysa kart görünmez. Paylaşım varsa liste gelemediğinde de (robot çalışırken, acil durdurmadan sonra, başka bir indirme sürerken ya da bu cihaz robotu kontrol etmiyorsa) kart açılır ve altında nedeni yazar. Robot durunca, **Logs** açıksa liste kendiliğinden gelir. Bağlantı hatasında kart daha önce açılmadıysa hiçbir şey görünmez: **Logs** sekmesini yeniden aç.

- Liste ve indirme yalnız robot dururken çalışır (STOPPED/TRANSITION, bekleyen komut yok): flash/SD okuması robot programıyla ve kontrol bağlantısıyla yarışmasın diye. Robot çalışırken bağlantılar soluklaşır ve tıklanmaz.
- Acil durdurmadan sonra da indirilmez: durdurulan kod dosya sistemini kilitli bırakmış olabilir. Robotu yeniden başlat; dosyalar silinmez.
- Acil durdurmada kod kapatma fırsatı bulamaz: açık kayıt dosyasının son `flush()`'tan sonra yazılan kısmı kaybolur. Kayıt sürerken dosyayı düzenli `flush()` et (ör. saniyede bir) ve stop hook'unda kapat.
- Hâlâ yazılan bir dosya, indirmenin başladığı andaki boyutuyla gelir; `flush()` edilmemiş son satırlar listede ve indirmede görünmez.
- Aynı anda tek aktarım olur. İndirme sürerken Init verilirse indirme kesilir; tarayıcı indirmeyi başarısız gösterir, yarım dosya bırakmaz.
- Kayıt dosyasını Init'te açıyorsan her çalıştırmaya yeni bir ad ver (sayaç ya da tarih): sabit adı `"w"` ile açmak önceki kaydın üstüne yazar.
- Dosyanın tarihi, dosya zamanı 2024 ve sonrasıysa görünür. Güç verildikten sonra saat gelmeden yazılan dosya tarihsiz listelenir. Yazılımla yeniden başlatmadan sonra saat önceki değerden sürebilir; o arada yazılan dosyanın tarihi kayık olabilir. Dosya adına tarih koymak için: [Saat](#saat).

Kartın altındaki notlar (`kayit` paylaşım adı):

| Not | Anlamı |
|---|---|
| `kayit: dosya yok` | Klasör boş |
| `kayit: klasör açılamadı` | Klasör yok ya da dosya sistemi bağlı değil |
| `kayit: ilk N dosya gösteriliyor` | Klasörde 256'dan fazla dosya (ya da alt klasörlerle 512'den fazla giriş) var. Gösterilenler klasör sırasındaki ilk dosyalardır, en yeniler olmayabilir; eskileri sil ya da başka klasöre taşı |
| `Robot çalışırken dosyalar listelenemez; durdurunca yenileyin.` | Robot dururken değil ([PB-E409](hatalar.md#pb-e409)) |
| `Acil durdurmadan sonra dosyalar robot yeniden başlatılınca indirilir.` | Acil durdurma sürüyor; robotu yeniden başlat |
| `Robotu başka bir sürücü istasyonu kullanıyor; dosyalar oradan indirilir.` | Bu cihaz robotu kontrol etmiyor (403); dosyaları robotu kontrol eden cihazdan indir |
| `Bir dosya aktarımı sürüyor; bitince yenileyin.` | Başka bir indirme sürüyor |
| `Dosya listesi alınamadı.` | İstek 10 saniyede yanıt almadı ya da bağlantı koptu (liste alınırken Init verildiyse de) |

Kendi istemcini yazıyorsan: `GET /files` paylaşımları `{"shares":[{"name":"kayit","ok":true,"truncated":false,"files":[{"name":"a.csv","size":N,"mtime":T}]}]}` olarak döner (`mtime` Unix saniye, bilinmiyorsa `0`; `ok: false` = klasör açılamadı). `GET /files/get?share=S&name=N` dosyanın içeriğini döner; `name` `encodeURIComponent` ile kodlanır. Hiç paylaşım yoksa `GET /files` her istemciye ve her durumda 404 döner. Robotu kontrol etmeyen cihaz 403, geçersiz ad 400, olmayan dosya 404, robot dururken değilse ya da acil durdurmadan sonra 409, başka aktarım sürerken 503 alır.

<a id="dashboard-topic-deposu"></a>
## Dashboard Topic Deposu (İleri Seviye)

Telemetri ve ayarlanabilir değerler (tunable) için adlı, tipli değerler. `#include <probot/api.hpp>` (ya da `<probot/dashboard/dashboard.hpp>`) ile kullanılır.

Driver Station'ın **Veri** sekmesi topic'leri `/` ile ayrılmış bir ağaçta canlı gösterir:

- `TUNABLE | MUTABLE` topic'ler oradan değiştirilir. Raw / `struct:X` değerler ağaçta düzenlenmez; istisna `Field2d` nesneleridir, onlar widget'ta düzenlenir ([Widget'lar](#veri-widgetlari)). Değer Enter'a basınca ya da kutudan çıkınca gönderilir; robot değeri geri yollayana dek "bekliyor" görünür, reddedilirse sebebi görünür.
- Özellik JSON'undaki `min`, `max`, `step`, `unit` editöre uygulanır.
- `struct:X` değerleri `structschema` şemasıyla alanlarına ayrılır.
- Bir klasördeki `.type` metin topic'i (WPILib düzeni) klasörü bir widget olarak çizer; aşağıdaki [Widget'lar](#veri-widgetlari) tablosu.
- Metin kutularına boşluk yalnız robot STOPPED iken yazılır; diğer fazlarda Space yine acil durdurmadır.
- Robotun `set()`'i reddedilirse (değer `PROBOT_DASH_MAX_VALUE`'dan uzun ya da robotta yer yok) Driver Station son kaydedilen değeri (hiç yoksa boş) gösterir ve satırın durum yazısı kırmızıyla `Güncel değil: değer çok büyük, sınır N bayt` ya da `Güncel değil: robotta bellek yetmedi` olur (bekleyen yazma ya da ret yazısı varsa önce o görünür). Kendi satırı olmayan widget topic'leri (ör. Scheduler'ın `Names`/`Ids`'i, Alerts listeleri, Mechanism2d parçaları) widget'ın altında `Güncel değil: ad (sebep)` olarak listelenir. **Logs** sekmesindeki **Event Log**'a bir kez `Veri güncellenemedi: /yol (sebep, N bayt)` düşer. Kod sonraki değeri kaydedince işaret kalkar. Kodda `set()`'in dönüşüne bakarak da anlarsın. `değer çok büyük` görürsen değeri küçült ya da `PROBOT_DASH_MAX_VALUE`'yu büyüt (RAM kullanımı artar). `robotta bellek yetmedi` görürsen `stats()`'a bak: `bytesUsed` `bytesMax`'a yakınsa `PROBOT_DASH_POOL_BYTES`'ı büyüt; değilse heap dolmuştur, değerleri ya da topic sayısını azalt ([Tüm Makrolar](#tum-makrolar)).

```cpp
using namespace probot::dashboard;
TopicId kp = publish("/Tunables/kP", ValueType::Double, "double",
                     "{\"min\":0}", TUNABLE | MUTABLE);
double v = 0.5;
set(kp, &v, sizeof(v));               // aynı değer tekrar gönderilmez
drainWrites([](const Write& w, void*) {
  // DS'ten gelen değer: w.id, w.vt, w.data[0..w.len)
}, nullptr);
```

| Fonksiyon | Anlamı |
|---|---|
| `publish(path, vt, typeString, propsJson, flags)` | Topic açar; aynı yol + tip için aynı id. Tip çakışması, dolu tablo ya da havuz aşımında `kInvalid`. Runtime başlamadan önce de `kInvalid` |
| `unpublish(id)` | Topic'i kaldırır (Driver Station'a `'R'`) |
| `set(id, data, len)` | Değeri kopyalar; aynıysa düşer (`KEEP_DUPLICATES` hariç). Değer havuzdan bir tamponda tutulur: boyu 16'dan başlayıp 2'nin kuvvetine yuvarlanır, en çok `PROBOT_DASH_MAX_VALUE` olur (ör. 600 bayt için 1024). Tampon küçülmez; topic en büyük değerinin yerini tutar. Değer `PROBOT_DASH_MAX_VALUE`'dan uzunsa ya da daha büyük tampona havuzda/heap'te yer yoksa `false` döner (yalnız yer yokluğu `dashDropped`'a sayılır) ve Driver Station eski değeri "Güncel değil" diye işaretler; kaydedilen sonraki `set()` işareti kaldırır. Bilinmeyen id'de ya da `len > 0` iken `data == nullptr` ise de `false` döner (işaretsiz) |
| `setProperties(id, json)` / `setFlags(id, flags)` | Yeniden duyurur |
| `addSchema(name, type, data, len)` / `hasSchema(name)` | `struct:X` ve `proto:X` şemaları. Şema en çok `PROBOT_DASH_MAX_SCHEMA_BYTES` bayttır ve havuzdan (`PROBOT_DASH_POOL_BYTES`) yer alır. Daha uzunsa, şema yeri kalmadıysa ya da havuz doluysa `false` |
| `drainWrites(fn, ctx)` | Driver Station yazmalarını sırayla `fn`'e verir; `data` yalnız `fn` içinde geçerli. Tek bir task'tan çağır |
| `rejectWrite(id, reason)` | Driver Station'a `'K'` reddi gönderir; topic'e başka yazma verilmeden önce çağır. `PERSISTENT` yazmayı callback içinde ya da 2 saniye içinde reddedersen saklanmaz; daha geç reddedersen `'K'` gider ama değer saklanır. Kayıttan geri yüklenen değerde ret gitmez, kayıt silinir |
| `clearPersisted()` | Kayıtlı bütün `PERSISTENT` değerleri, henüz alınmamış geri yüklemeleri ve henüz saklanmamış Driver Station değerlerini siler ([Kalıcı değer](#kalici-deger)). Saklama yoksa ya da silinemezse `false` |
| `stats()` | Topic sayısı, bayt kullanımı, düşürülenler |
| `limits()` | Geçerli sınırlar (`Limits`: `maxTopics`, `maxSchemas`, `maxValue`, `poolBytes`, `writeQueueBytes`, `maxSchemaBytes`; `PROBOT_DASH_*` değerleri, üst sınırlara kırpılmış). Runtime başlamadan önce hepsi 0 |

**Değer tipleri** (`ValueType`, little-endian): 1 boolean (u8), 2 int (i64), 3 float (f32), 4 double (f64), 5 string (UTF-8), 6 raw / `struct:X`, 7-10 boolean/int/float/double dizisi, 11 string dizisi (her eleman u16 uzunluk + baytlar).

**Bayraklar:** `TELEMETRY` 1, `TUNABLE` 2, `MUTABLE` 4, `ROBUST` 8, `KEEP_DUPLICATES` 16, `PERSISTENT` 32.

<a id="veri-widgetlari"></a>
**Widget'lar.** Klasördeki `.type` topic'inin değeri klasörün nasıl çizileceğini seçer. Düzenler WPILib 2027'ninkidir:

| `.type` | Klasörde beklenen | Veri sekmesinde |
|---|---|---|
| `Selectable` | `options` (string[]), `selected` (string); isteğe bağlı `default`, `active` | `options`'tan seçip `selected`'a yazan kutu; yanında "Varsayılan: …" ve "Aktif: …" (değer varsa) |
| `Command` | `running` (boolean); isteğe bağlı `name` | `running`'i çeviren **Çalıştır** / **Durdur** düğmesi |
| `Alerts` | `errors`, `warnings`, `infos` (string[]; en az biri) | Etkin uyarılar seviyesiyle (hata, uyarı, bilgi); yoksa "Aktif uyarı yok" |
| `Scheduler` | `Names` (string[]) ve `Ids` (int[]) aynı sırada (i. ad, i. id'nin komutu); isteğe bağlı `Cancel` (int[]) | Çalışan komutlar ("Çalışan komut: N", yoksa "Çalışan komut yok"). `Cancel` varsa her komutun yanında **İptal** düğmesi |
| `Field2d` | Her nesne için bir `struct:Pose2d[]` topic (`ValueType::Raw`): poz başına 24 bayt, `x` (m), `y` (m), açı (radyan), üçü de `double` | Nesneler metre ızgarasında (`Robot` listede ilk); görünüm (0, 0)'ı tutar ve bütün pozları alacak kadar büyür. Salt okunur nesnenin altında tek pozun x, y'si ve açısı (derece) ya da poz sayısı ile ilk ve son noktanın x, y'si; yazılabilir nesnede yerine düzenleme kutusu. Değer yoksa ya da dizi boşsa `--`, boyu 24'ün katı değilse `Geçersiz uzunluk`. 8'den çok pozu olan nesne yol olarak çizilir, 1 km'den uzak pozlar çizilmez |
| `Mechanism2d` | `dims` (double[]: genişlik, yükseklik; ikisi de 0'dan büyük); isteğe bağlı `backgroundColor` (`#rrggbb`); her kök için `.type`'ı olmayan ve `position` (double[]: x, y) taşıyan bir alt klasör; kökün altında `.type`'ı `line` olan, iç içe geçebilen kollar: `angle` (derece, üst kola göre), `length` (`dims` biriminde), `color` (`#rrggbb`), `weight` (piksel) | Kolların çizimi |

- Beklenen alt topic'ler eksik ya da tipi yanlışsa klasör düz ağaç olarak gösterilir.
- Widget çizilen klasörde tablodakiler dışındaki topic'ler görünmez (`Field2d`'de `struct:Pose2d[]` olmayanlar da); başka değerleri ayrı bir klasöre koy.
- `selected` ya da `running` `TUNABLE | MUTABLE` değilse kutu ya da düğme pasif görünür; `Cancel` öyle değilse **İptal** düğmesi çıkmaz.
- **İptal**, komutun id'sini `Cancel`'a yazar; komutu durdurmak robot kodunun işidir (`drainWrites()` ile alır). Düğme "İptal ediliyor" yazar. Komut listeden düşünce ya da tıkladığın andan 2 saniye geçmiş ve robot yazmayı almışsa (hangisi sonraysa) hâlâ çalışan komutun düğmesi yeniden **İptal** olur; ret ya da bağlantı hatasında hemen döner. Bu sürede sonraki yazmalar önceki id'leri de taşır: robot alınmamış bir yazmanın yerine yenisini koyar.
- `Field2d` nesnesi `TUNABLE | MUTABLE` ise altındaki kutuda düzenlenir: her poz için `x,y,derece`, pozlar `;` ile ayrılır (ör. `2,1,90;3.5,1,0`). Boşluk koyma: robot STOPPED değilken kutuda Space acil durdurmadır. Ondalık için nokta kullan, virgül ayırıcıdır; sona `;` koyma. Enter ya da kutudan çıkmak gönderir, boş kutu nesneyi temizler (0 poz). Yazım hatalıysa değer gitmez, yanında sebep görünür (`Geçersiz sayı`, `Her poz için x, y, açı girin`). Driver Station dereceyi radyana çevirip yazar: kodda gelen açı radyandır. Sahada x sağa, y yukarı artar; açı 0 +x yönüdür ve saat yönünün tersine artar. En çok 8 pozu olan nesnenin pozları sahada fareyle sürüklenebilir; sürükleme açıyı korur. Dokunmatik ekranda önce **Dokunarak sürükle** düğmesini aç: kapalıyken saha sayfayı kaydırır. Her düzenlemede dizinin tamamı yazılır. Kod yazmayı kabul edince yeni pozu `set()` etmeli: `drainWrites()` değeri kendisi uygulamaz, robotta duran değeri geri gönderir. `set()` etmezsen ya da `rejectWrite()` ile reddedersen poz hemen eski yerine döner (retteki sebep yanında yazar). Kod sonraki turda kendi pozunu yeniden `set()` ederse de poz geri döner; bu hata değildir.
- `Mechanism2d` yalnız çizer, Driver Station'dan düzenlenmez. Kök +x yönüne bakar; ilk kolun `angle`'ı buna göredir.
- `PIDController` bir widget değildir, klasörü sıralar: `p`, `i`, `d`, `izone`, `setpoint`, `measurement`, `error`, `error derivative`, `previous error`, `total error`, sonra diğerleri alfabetik. Klasör `/Tunables/<ad>` altındaysa aynı adlı `/Telemetry/<ad>` klasöründeki `measurement` ve `error` de orada canlı görünür.

Örnek: robotun konumunu sahada göstermek.

```cpp
using namespace probot::dashboard;

TopicId robotPoz = kInvalid;

void sahaAc() {                           // ilk Init'te bir kez
    if (robotPoz != kInvalid) return;
    TopicId tip = publish("/Telemetry/Saha/.type", ValueType::String, "string", "", TELEMETRY);
    set(tip, "Field2d", 7);
    robotPoz = publish("/Telemetry/Saha/Robot", ValueType::Raw, "struct:Pose2d[]", "", TELEMETRY);
}

void robotuCiz(double x, double y, double aciRad) {   // loop'ta: metre, metre, radyan
    double poz[3] = { x, y, aciRad };                 // bir poz = 24 bayt
    set(robotPoz, poz, sizeof(poz));
}
```

Sahadan hedef seçmek için aynı klasöre yazılabilir bir nesne ekle ve yazmayı loop'ta al. Hedefi Start'tan önce seçmek istiyorsan aynı `drainWrites()` çağrısını `autonomousInitLoop()` / `teleopInitLoop()` içine de koy; yazmayı alan kod çalışana dek satır "Bekliyor" görünür:

```cpp
TopicId hedefId = kInvalid;
double hedef[3] = { 2.0, 1.0, 0.0 };       // x m, y m, açı radyan

void hedefAc() {                           // sahaAc()'tan sonra, bir kez
    if (hedefId != kInvalid) return;
    hedefId = publish("/Telemetry/Saha/Hedef", ValueType::Raw, "struct:Pose2d[]", "",
                      TUNABLE | MUTABLE);
    set(hedefId, hedef, sizeof(hedef));
}

void hedefYaz(const Write& w, void*) {     // loop'ta: drainWrites(hedefYaz, nullptr);
    if (w.id != hedefId) return;
    if (w.len != sizeof(hedef)) {          // yalnız tek poz kabul et
        rejectWrite(w.id, (uint8_t)WriteStatus::DecodeError);
        return;
    }
    memcpy(hedef, w.data, sizeof(hedef));
    set(hedefId, hedef, sizeof(hedef));
}
```

- Kutuya birden çok poz yazarsan ya da kutuyu boşaltırsan robot reddeder: satırda `Değer çözümlenemedi` çıkar, kutu ve işaretçi robotun pozuna döner.
- `drainWrites()` kuyruktaki bütün yazmaları tek seferde verir. Başka yazılabilir topic'lerin de varsa (ör. kP), hepsini aynı callback'te `w.id`'ye bakarak işle ve loop'ta tek bir `drainWrites()` çağır: callback'te atladığın yazma uygulanmadan kaybolur.

Driver Station yalnız `TUNABLE | MUTABLE` topic'lere yazabilir. Uzunluğu tipine uymayan yazma (ör. 8 bayt olmayan double) `'K'` 4 ile reddedilir. Raw / `struct:X` yazmalarında uzunluk denetlenmez: `w.len`'i kendin kontrol et (yukarıdaki `hedefYaz` gibi). Yazma kuyruğunda topic başına en son değer kalır; uygulanan her yazmadan sonra robotun değeri Driver Station'a yeniden gönderilir.

Sınırlar `PROBOT_DASH_*` makrolarıyla ayarlanır ([Tüm Makrolar](#tum-makrolar)); aralık dışı değer derlemede [PB-E108](hatalar.md#pb-e108) verir.

<a id="kalici-deger"></a>
**Kalıcı değer (`PERSISTENT`).** Bayraklarına `PERSISTENT` eklenen topic'in değeri yeniden başlatmada korunur: Driver Station'dan ayarladığın kP gibi bir değer robot kapanıp açılınca geri gelir. Değer robotun flash'ında (NVS) saklanır.

```cpp
using namespace probot::dashboard;

TopicId kpId = kInvalid;
double kP = 0.5;                          // kayıt yoksa bu kullanılır

void degerYaz(const Write& w, void*) {    // Driver Station yazması ya da kayıttan gelen değer
    if (w.id == kpId && w.len == sizeof(kP)) {
        memcpy(&kP, w.data, sizeof(kP));
        set(kpId, &kP, sizeof(kP));
    }
}

void kpAc() {                             // ilk Init'te topic'i açar, kayıtlı değer kuyruğa girer
    if (kpId != kInvalid) return;
    kpId = publish("/Tunables/kP", ValueType::Double, "double", "{\"min\":0}",
                   TUNABLE | MUTABLE | PERSISTENT);
    set(kpId, &kP, sizeof(kP));
}

void autonomousInit() { kpAc(); }
void teleopInit()     { kpAc(); }

void autonomousLoop() {
    drainWrites(degerYaz, nullptr);       // ilk turda kayıtlı değer gelir
    // kP ile git...
}

void teleopLoop() {
    drainWrites(degerYaz, nullptr);
    // kP ile sür...
}
```

- Kayıtlı değer, topic'i açan kod çalışınca gelir (örnekte ilk Init). Geri yükleme topic ilk açılırken olur: `publish()` kayıtlı değeri (yol, değer tipi ve tip yazısı tutuyorsa) bir Driver Station yazması gibi kuyruğa koyar. Sonraki ilk `drainWrites()` onu verir; kod uygular ve `set()` ile yayınlar. Ayrı bir okuma fonksiyonu yok.
- Saklanan, Driver Station'ın yazdığı ve senin `rejectWrite()` ile reddetmediğin değerdir. Callback'te yazmayı yok saymak ya da değeri değiştirip `set()` etmek reddetmek sayılmaz: Driver Station'ın değeri yine saklanır. Robotun `set()` ile verdiği değer hiç saklanmaz ve kaydı değiştirmez. Yazmayı reddetmek için `rejectWrite()`'ı yazmayı alan callback içinde çağır. Daha sonra çağırırsan da yazma saklanmaz, yeter ki topic'e sonraki yazma verilmemiş ve 2 saniye geçmemiş olsun.
- Kayıt robot bir OpMode çalıştırmıyorken (durmuş ya da acil durdurulmuşken) yazılır: flash'a yazma iki çekirdeği de kısa süre durdurur. Yazma, kod onu `drainWrites()` ile alana dek saklanmaz. Sürüş sırasında yaptığın ayar robot durunca kaydedilir. Örnekteki gibi `drainWrites()` yalnız loop'lardaysa robot dururken girdiğin değer bir sonraki çalıştırmada uygulanır ve robot yeniden durunca saklanır. Kayıt için robotu durdurduktan sonra birkaç saniye bekle, sonra kapat; o arada güç giderse ya da topic `unpublish()` edilirse ayar kaybolur.
- Kayıttan gelen değeri kabul etmezsen (`rejectWrite()`, bu topic için `drainWrites()` başka bir yazma vermeden önce; en kolayı aynı callback içinde) kayıt silinir; Driver Station'a ret gitmez.
- `setFlags()` ile sonradan eklenen `PERSISTENT` yalnız sonraki Driver Station yazmalarını saklar, geri yüklemez.
- Kayıt okunamazsa silinmez ve bir kez bildirilir ([PB-E308](hatalar.md#pb-e308)); Driver Station'dan yeni değer yazılınca üstüne yazılır.
- Yer küçüktür (~20 KB; ESP32'nin WiFi sürücüsü ve robotun kayıtlı WiFi kanalı gibi başka kullanıcılarla ortak). Kalıcı değer her dashboard değeri gibi `PROBOT_DASH_MAX_VALUE`'yu (varsayılan 1024 bayt) aşamaz; makroyu büyütsen de en çok 2048 bayt saklanır: daha büyük değer saklanmaz ve yazıldığı anda [PB-E308](hatalar.md#pb-e308) olarak bildirilir. Makroyu kayıtlı bir değerin boyunun altına indirirsen o değer geri yüklenmez. ~20 KB ve 2048 bayt makroyla değişmez; sayı ve kısa metin tut.
- Saklanmayı bekleyen değerler topic başına en çok iki değer (her biri en çok 2048 bayt) kadar bellek kullanır; saklama task'ı da bir kez 2 × (516 + değer sınırı) bayt alır. Bunlar dashboard havuzuna (`PROBOT_DASH_POOL_BYTES`) sayılmaz.
- `clearPersisted()` kayıtlı bütün değerleri, henüz alınmamış geri yüklemeleri ve henüz saklanmamış Driver Station değerlerini siler. Topic'ler değerini korur; Driver Station'ın sonraki yazması yeniden saklanır. Flash'a yazdığı için robot dururken ya da bir Init hook'unda çağır (Init'te çıkışlar nötrdür). Kodda kalıcı bir satır olarak bırakma: her çağrıldığında bütün kayıtları siler.
- `PROBOT_HAS_DASH_PERSIST` makrosu bu özelliğin kütüphanede olduğunu derleme anında bildirir.

### Durum Alanları ve WS Çerçeveleri

`GET /health` üç alan daha döner: `dashTopics` (topic sayısı), `dashBytes` (kullanılan bayt) ve `dashDropped` (düşürülen yazma/değer). WebSocket `'S'` çerçevesindeki `dashMax` alanı bir dashboard değerinin en çok bayt sayısıdır.

Kendi Driver Station istemcini yazıyorsan yeni çerçeveler şunlar (tüm çok baytlı alanlar little-endian):

| Çerçeve | Yön | Anlamı |
|---|---|---|
| `'W'` 0x57 | istemci → robot | Dashboard yazma: u16 topic id, u8 değer tipi, değer baytları (en çok `dashMax`). Yalnız kuyruğa girer; robot kodu `drainWrites()` ile uygular. Değer kısmı `dashMax`'ı aşarsa `'K'` 4 ile reddedilir; çerçeve hem 68 hem `4 + dashMax` bayttan uzunsa robot bağlantıyı kapatır |
| `'Q'` 0x51 | istemci → robot | Yeniden eşitleme (tek bayt): tüm dashboard şema, duyuru ve değerleri ile robotta duran tüm konsol satırları yeniden gönderilir. Sayfa her bağlantıda, bilmediği bir dashboard id'si ya da konsolda boşluk gördüğünde yollar |
| `'U'` 0x55 | istemci → robot | [Saat](#saat): 9 bayt, tip baytından sonra i64 tarayıcının UTC zamanı (Unix ms). Sayfa her bağlantıda yollar; 2024-2100 dışı ya da 9 bayt olmayan çerçeve yok sayılır. Yalnız sahibin bağlantısından gelir |
| `'C'` 0x43 | robot → istemci | Şema (ör. `struct:Pose2d`, `structschema`) |
| `'A'` 0x41 | robot → istemci | Topic duyurusu: id, değer tipi, bayraklar, ad, tip, özellik JSON'u |
| `'V'` 0x56 | robot → istemci | Değerler: robot ms + değişen topic'lerin id/uzunluk/baytları. `PROBOT_DASH_PERIOD_MS`'de bir (varsayılan 50 ms), ~1400 baytta bölünür |
| `'R'` 0x52 | robot → istemci | Topic kaldırıldı |
| `'K'` 0x4B | robot → istemci | Yazma reddi: id + durum (1 bilinmeyen id, 2 değiştirilemez, 3 tip uyuşmazlığı, 4 çözümlenemedi, 5 kuyruk dolu) |
| `'E'` 0x45 | robot → istemci | Robotun son `set()`'i reddedildi, tekrarlı: u16 id, u8 sebep (1 değer `dashMax`'tan uzun, 2 havuzda ya da heap'te yer yok), u32 reddedilen son değerin uzunluğu. Topic'in Driver Station'da kalan değerinden sonra gelir (sebep değişince hemen, sonra o değer her yeniden gönderildiğinde); topic'in sonraki `'V'` kaydı işareti kaldırır. Eski sayfalar çerçeveyi yok sayar |
| `'L'` 0x4C | robot → istemci | [Konsol](#konsol) satırları: u32 boot kimliği (her açılışta rastgele), u32 robotta duran en eski satırın sırası, sonra tekrarlı u32 sıra, u32 robot ms, u8 seviye (0 bilgi, 1 uyarı, 2 hata), u16 uzunluk, UTF-8 metin. `PROBOT_DASH_PERIOD_MS`'de bir en çok 4 çerçeve; aynı sırayı ikinci kez alan istemci satırı atlar |

`'J'`/`'N'`/`'P'`/`'U'` en çok 68 bayttır; yalnız `'W'` bundan uzun olabilir. Robot açılışta büyük çerçeve tamponunu ayıramadıysa 68 bayttan uzun her çerçeve bağlantıyı kapatır.

Joystick çerçevesi `'J'` 0x4A'da `[3]` baytı porttur (tip baytı `[0]`, ardından eksen ve buton sayısı; port 0-5, eski sayfalar 0 yollar). Eksenler yukarıdaki tablonun aksine big-endian int16'dır (değer × 32767). Butonlardan sonra isteğe bağlı bir analog değer bloğu gelebilir. `'N'` 0x4E kumandanın adını ve standart düzen bayrağını taşır; port atanınca ya da değişince ve 2 saniyede bir gelir. Kuralsız bir `'J'`/`'N'` (port 5'ten büyük, 20'den çok eksen ya da buton, 63 bayttan uzun ad, uzunluğu tutmuyor ya da butonlardan sonra geçerli değer bloğu olmayan fazladan bayt) sessizce atılır. HTTP yedeği `/updateController` yalnız port 0'ı taşır. Bayt bayt alan düzeni core deposundaki `API.md`'de.
