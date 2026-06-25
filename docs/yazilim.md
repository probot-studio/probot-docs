---
title: Yazılım
---

# Yazılım

## Yaşam Döngüsü

Bir maçta iki faz var. Önce **otonom**: joystick yok, robot yalnızca koda göre hareket eder; varsayılan süre 30 saniye, arayüzden ayarlanabilir. Otonom bitince **teleop** başlar: kumandayla kontrol edilir, maç sonuna kadar devam eder.

Bu iki fazın dışında robotun iki durumu daha var. Maç başlamadan önce Driver Station'dan **Init** yapılır: robot hazır hale gelir ama hareket etmez. Maç bitince veya acil durumda **Stop** ile her şey sıfırlanır.

Kodda bu dört durumun her birine karşılık gelen hook'lar var. Normal Arduino'da `setup()` ve `loop()` yazılır; Probot'ta bunların yerine bu altı fonksiyon tanımlanır:

```cpp
void robotInit()     {}   // Init'e basılınca 1 kez
void robotEnd()      {}   // Stop'ta 1 kez; motorları burada durdur
void teleopInit()    {}   // Teleop başlarken 1 kez
void teleopLoop()    {}   // Teleop boyunca ~50 Hz
void autonomousInit(){}   // Otonom başlarken 1 kez
void autonomousLoop(){}   // Otonom boyunca ~50 Hz
```

Altısı da tanımlı olmak zorunda; boş olabilirler. `setup()` ve `loop()` tanımlanmaz; kütüphane sahip, tanımlanırsa derleme hatası verir. `autonomousEnd()` ve `teleopEnd()` de yok; tanımlanırsa kütüphane çağırmaz.

**Faz akışı:**

```
STOP ──Init──> INITED ──Start──> [AUTONOMOUS (N sn) >] TELEOP ──Stop──> STOP
```

Otonom açık/kapalı ve süresi arayüzden ayarlanır. Süre bitince teleop'a otomatik geçer.

**Loop sözleşmesi:** Her tur kısa sürmeli. `teleopLoop` veya `autonomousLoop` 2 saniyeden uzun bloke olursa halt-safe devreye girer: joystick sıfırlanır, LED kırmızı yanıp söner. Task öldürülmez; tur bitince temizlenir. Bkz. [Hatalar - Deadline Miss](hatalar.md#deadline-miss).

Stop kooperatiftir: o anki tur bittikten sonra `robotEnd()` çalışır. Anında kesme için arayüzdeki **Emergency Stop**.

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
| `getLeftTriggerAxis()` | Sol tetik. Basılı = 1.0, bırakılmış = 0.0 |
| `getRightTriggerAxis()` | Sağ tetik. Basılı = 1.0, bırakılmış = 0.0 |

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

Profil değiştirmek için `robotInit()` içinde:

```cpp
void robotInit() {
    probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Profil | Kumanda |
|---|---|
| `"logitech-f310"` / `"f310"` | Logitech F310 (varsayılan) |
| `"standard"` / `"xbox"` / `"ds4"` / `"ps"` | Xbox One, DualShock 4 ve W3C standardına uyan diğerleri |
| `"axis9-dpad"` | D-Pad'i eksen olarak değil 9. eksen üzerinden gönderen bazı kumandalar |

Kumanda düğmelere basıldığında hiç tanınmıyorsa ya da yanlış buton tetikleniyorsa profil uyumsuzluğu olabilir.

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

Arka planda 256 baytlık bir tampon var. Her loop turunda önce `clearTelemetry()` çağır, sonra yazmak istediğin değerleri yaz. Yoksa önceki turdan kalan değerler ekranda birikir ve okuması güçleşir.

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

void robotInit() {
    pinMode(LEFT_RPWM, OUTPUT);
    pinMode(LEFT_LPWM, OUTPUT);
}

void robotEnd() {
    analogWrite(LEFT_RPWM, 0);
    analogWrite(LEFT_LPWM, 0);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    motorLeft(js.getLeftY());
    delay(20);
}
```

Joystick ekseni -1..+1 arası döner; fonksiyon bunu yön ve hıza dönüştürür. Joystick bağlantısı kopunca eksen sıfıra döner ve motor durur.

`robotEnd()` içinde motorları mutlaka durdur. Stop yapılınca loop bir daha çağrılmaz; durdurma kodu `robotEnd()`'de yoksa motorlar dönmeye devam eder.

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

Bu sinyali üretmek için ESP32'nin LEDC donanımı kullanılır. `analogWrite` (motorlar) yaklaşık 1 kHz çalışır, servo için çok hızlıdır. Servo için LEDC'yi ayrıca 50 Hz'e kurmak gerekir.

```cpp
const uint8_t SERVO_PIN = 4;

void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
    deg = constrain(deg, 0.0f, 180.0f);
    uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
    ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

void robotInit() {
    // analogWrite (motorlar) düşük LEDC kanallarını kullanır (0, 1, 2…).
    // Kanal 7 seçmek timer çakışmasını önler.
    ledcAttachChannel(SERVO_PIN, 50, 14, 7);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    if (js.getA())      servoAngle(SERVO_PIN, 0.0f);
    else if (js.getB()) servoAngle(SERVO_PIN, 180.0f);
    delay(20);
}
```

`ledcAttachChannel(pin, frekans, çözünürlük_bit, kanal)`: 50 Hz frekans, 14 bit çözünürlük. 14 bit → 16383 = tam 20 ms'lik period. `us * 16383 / 20000` dönüşümü µs'yi duty değerine çevirir.

Birden fazla servo için her birine ayrı pin ve düşük kanal ver (6, 5, 4…); hepsi 50 Hz olduğundan aynı timer'ı paylaşabilirler.

`robotInit()`'te `ledcAttachChannel` çağrıldıktan sonra ilk `servoAngle()` çağrısına kadar servo sinyal bekler; robot açılışta servo aniden zıplamaz.

**Güç:** Servoyu ESP32 kartının 5V/3.3V pininden besleme. Bu pinler yüksek akımı karşılamaz; servo seğirir veya ESP32 sıfırlanır. Ayrı 5-6V kaynak (BEC/UBEC) kullan. Sinyal kablosu ESP32 pinine, güç ve GND BEC'e bağlanır; BEC GND ile ESP32 GND ortak tutulmalı.

---

## Subsystem Deseni

Robot büyüdükçe tüm mantığı `teleopLoop` içine yığmak yönetilemez hâle gelir. Önerilen yapı: her mekanizmayı (şasi, kol, slider, gripper) ayrı bir class olarak yazmak. Her subsystem aynı arayüzü paylaşır:

- `init()`: pinleri ayarlar; `robotInit()` içinde bir kez çağrılır.
- Eylem metodları: `up()`, `set()`, `open()` gibi dışarıdan verilen komutlar.
- `stop()`: mekanizmayı güvenli hâle getirir; `robotEnd()` içinde çağrılır.
- Gerekiyorsa `periodic()`: her loop turunda çağrılan, sensör okuyan veya hedefe yaklaşan iç mantık.

Bu desende `teleopLoop` yalnızca girişleri subsystem metodlarına bağlar; donanım detayı subsystem'in içinde kalır:

```cpp
void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();

    drive.arcade(js.getLeftY(), js.getRightX());
    if (js.getRB()) intake.run(); else intake.stop();
    slider.periodic();   // sensör tabanlı subsystem'ler her tur güncellenir

    delay(20);
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

Kütüphane ESP32'deki NeoPixel LED'i otomatik yönetir; müdahale gerekmez. LED rengi robotun o anki durumunu gösterir.

| Renk | Anlam |
|---|---|
| Mavi sabit | Robot açık, Driver Station bağlı değil |
| Mavi yanıp sönüyor | Driver Station bağlı, Init bekleniyor |
| Sarı sabit | Init yapıldı, Start bekleniyor |
| Turuncu yanıp sönüyor | Otonom çalışıyor |
| Yeşil yanıp sönüyor | Teleop çalışıyor |
| Kırmızı yanıp sönüyor | Deadline miss, loop bloke oldu |
| Kırmızı sabit | Emergency stop aktif |

Varsayılan pin GPIO 3. Farklı bir pine bağlıysa `#include <probot.h>`'den önce tanımla:

```cpp
#define NEOPIXEL_PIN 48
```

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
| `PROBOT_WIFI_AP_CHANNEL` | zorunlu | 1-13; filoda 1, 6 veya 11 kullan |
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

`autonomousLoop` ~50 Hz'de çağrılır, yani her tur yaklaşık 20 ms'de bir geliyor. İçinde `delay(2000)` gibi uzun bir bekleme varsa o tur 2 saniye boyunca dönmez; kütüphane bu durumu tespit eder ve **deadline miss** hatası oluşur. Deadline miss'te joystick sıfırlanır, LED kırmızı yanıp söner ve otonom kesilebilir. Daha fazla bilgi için [Hatalar - Deadline Miss](hatalar.md#deadline-miss) sayfasına bakılabilir.

Bunun yerine bekleme için `millis()` kullanılır: her turda geçen zamanı kontrol et, süre dolunca bir sonraki adıma geç.

### Durum Makinesi

En basit otonom, sabit süreli fazlardan oluşan bir durum makinesi. Aşağıdaki örnek ileri gider, sola döner ve durur.

```cpp
enum class Phase { FORWARD, TURN_LEFT, DONE };
static Phase phase;
static uint32_t t_ref;

void autonomousInit() {
    phase = Phase::FORWARD;
    t_ref = millis();
}

void autonomousLoop() {
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

    delay(20);
}
```

`static` değişkenler program boyunca değerlerini korur. `autonomousInit()` her otonom başlangıcında çağrıldığı için bu değişkenleri burada sıfırla; yoksa bir önceki çalışmadan kalan değerle başlar.

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
    delay(20);
}
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
    t_ref = millis();
}

void autonomousLoop() {
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

    delay(20);
}
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
| `s.status` | `Status::INIT/START/STOP` | Mevcut durum |
| `s.phase` | `Phase::NOT_INIT/INITED/AUTONOMOUS/TELEOP` | Mevcut faz |
| `s.deadlineMiss` | bool | Halt-safe aktif mi |
| `s.autonomousEnabled` | bool | Otonom açık mı |
| `s.autoPeriodSeconds` | int32_t | Otonom süresi (sn) |
| `s.clientCount` | int32_t | Bağlı DS istemcisi |
| `s.batteryVoltage` | float | Pil gerilimi (kullanıcı beslemeli) |
