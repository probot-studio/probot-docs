---
title: Örnek Robot
---

# Örnek Robot

Bu sayfa bir yarışma robotunun nasıl kodlanması gerektiğini anlatır. PID veya encoder tabanlı kontrol gibi ileri algoritmalara girilmez; amaç sıfırdan çalışan bir robota ulaşmanın en kısa ve güvenilir yolunu göstermek.

Kod örnekleri açıklayıcı amaçlıdır, kopyala-yapıştır değil. Gerçek çalışan örnekler kütüphane içindeki `examples/` klasöründe yer alır.

!!! tip "Başlamadan önce"
    Robot yarışmalarında süreç yönetimi, takım dinamikleri ve geliştirme prensipleri için [Tuna'nın Yarışma Notları](notlar.md) okunması önerilir.

---

## Sistemleri Planlamak

Kod yazmadan önce robotun her sisteminin nasıl çalışacağını hayal etmek gerekir. Üç seviye vardır:

**Her zaman açık sistemler.** Bazı mekanizmalar sadece güç verilince çalışır; açma-kapama kontrolü gerekmez. Fan, sabit hızlı bir konveyör, ışık. Bunlar için karmaşık kod yazmak yerine doğrudan güç bağlantısı da çoğu zaman yeterlidir. Mekanik bir sistemi kontrol etmek için her zaman yazılım gerekmez.

**Açılıp kapanan sistemler.** Bir mekanizmanın başlatılması ve durdurulması gerekiyorsa robotun bunu ne zaman yapacağına karar vermesi lazım. Bu karar ya sürücüden gelir (bir buton), ya bir zamanlayıcıdan (2 saniye ileri git, dur), ya da bir sensörden (limit switch tetiklenince dur). Bunları baştan netleştirmek kodun nasıl yazılacağını doğrudan belirler.

**Hassas kontrol gerektiren sistemler.** Motor hızının veya pozisyonun hassas kontrolü gerekiyorsa encoder ve PID gibi algoritmalar devreye girer. Bu seviyeye ancak daha basit yöntemler yetersiz kaldığında geçilmeli; erken karmaşıklaştırmak hem zaman kaybettirir hem de hata ayıklamayı zorlaştırır.

Bu rehberde yalnızca ilk iki seviyeyi kapsayan örnekler var.

---

## Temel Sistemi Önce Doğrula

Kod yazmadan önce mekanik ve elektronik sistemin çalıştığına emin olmak gerekir. Motor kodu yazıp motor dönmüyorsa sorunun kablo mu, sürücü mü, motor mu, yoksa kod mu olduğunu bulmak çok daha uzun sürer.

Sürücüyü ve motoru doğrudan güç kaynağına bağlayıp döndüğüne bakın. Dönüyorsa elektronik sağlam; sorun kod veya bağlantıda. Dönmüyorsa koda geçmeden önce donanımı çözün.

Aynı prensip servo, sensör ve her bileşen için geçerlidir. Entegre etmeden önce tek başına test et.

---

## Subsystem Subsystem Kodla

Bir robotun tüm kodu aynı anda yazılıp tek seferde test edilirse çalışmaz; ve neyin çalışmadığını bulmak çok zor olur. Gall Yasası bunu şöyle ifade eder:

> *"Çalışan karmaşık bir sistem, çalışan basit bir sistemden evrilmiştir. Sıfırdan karmaşık tasarlanan sistem hiçbir zaman çalışmaz."*

Pratik karşılığı: her subsystem ayrı ayrı kodlanır ve tek başına test edilir. Birlikte çalıştırılmadan önce her parçanın bağımsız olarak doğru çalıştığına emin olunur.

Tipik sıra:

1. **Sürüş sistemi:** robot hareket edebilsin.
2. **Kumanda bağlantısı:** joystick ile sürüş kontrol edilsin.
3. **İkincil mekanizmalar:** kol, kepçe, konveyör; her biri sırayla eklenir.
4. **Otonom:** teleop tamamen çalışırken otonom sekansı yazılır.

Her adımda robot sahaya çıkabilecek durumda olmalı. İkinci mekanizma çalışmıyor diye sürüş sistemi bloke edilmemelidir.

!!! tip "AI varsa"
    AI'ın verimliliği özellikle bu yöntemle birlikte ortaya çıkıyor. Parça parça ilerlediğinizde çok hızlı kod generate edip çok hızlı test alabiliyorsunuz; yeni bir özelliği dakikalar içinde ekleyip robotta deneyebiliyorsunuz. Tüm sistemi tek seferde yazdırmak yerine "sadece şu motoru bu butonla kontrol et" deyip o parçayı test ettikten sonra bir sonrakine geçin.

---

## Örnek: Sürüşten Tam Robota

Her subsystem aynı sırayla işlenir: önce en basit çalışan kod, sonra class. Her adımda robot sahaya çıkabilecek durumda olmalı.

---

### Tek Motor

İlk hedef mümkün olan en basitidir: tek bir motor dönüyor mu, yön doğru mu? Bunları bilmeden şasiye geçmek hata ayıklamayı çok zorlaştırır.

Motor doğrudan ESP32 pinine bağlanmaz; pinler bir motoru döndürecek akımı veremez, bu yüzden araya bir **motor sürücü** girer. Buradaki sürücü BTS7960. İki PWM pini üzerinden çalışır: `RPWM` pinine sinyal verilince motor ileri döner, `LPWM` pinine sinyal verilince geri döner. Her ikisine birden sinyal verilmez; sürücü hasar görür. Soldaki çubuk motoru sürer; yukarı ileri, aşağı geri.

`analogWrite` pine 0-255 arası bir PWM değeri yazar: 0 durur, 255 tam güç. Joystick ekseni -1 ile +1 arası geldiği için `speed * 255` ile bu aralığa çevrilir. Motor sürücüler ve PWM hakkında ayrıntı [Yazılım - Motor Kontrolü](yazilim.md#motor-kontrolu) sayfasında.

```cpp
#define PROBOT_WIFI_AP_SSID     "RobotAdi"
#define PROBOT_WIFI_AP_PASSWORD "sifre1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

const int RPWM = 16;
const int LPWM = 17;

void robotInit() { pinMode(RPWM, OUTPUT); pinMode(LPWM, OUTPUT); }
void robotEnd()  { analogWrite(RPWM, 0); analogWrite(LPWM, 0); }
void teleopInit() {}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    float speed = js.getLeftY();
    if (speed > 0) { analogWrite(RPWM, (int)(speed * 255)); analogWrite(LPWM, 0); }
    else           { analogWrite(RPWM, 0); analogWrite(LPWM, (int)(-speed * 255)); }
    delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(20); }
```

Joystick yanıt vermiyorsa Driver Station'daki joystick test bölümüne bakın; kumanda takılıysa eksen hareketlerinin orada görünmesi gerekir. Orada da hareket göremiyorsanız sorun joystick veya tarayıcı bağlantısındadır.

Motor dönüyor mu? Yön doğru mu? Bu iki soruya cevap alındıktan sonra class'a geçilir. Robotta birden fazla motor varsa şasiye geçmeden önce hepsini bu şekilde ayrı ayrı test etmek, sonradan hangi motorun sorunlu olduğunu bulmaya çalışmaktan çok daha hızlıdır.

#### motor_t

Tek motorun kontrolünü bir class içine almak birkaç şeyi sağlar: pin numaraları dışarıdan görünmez, `constrain` gibi güvenlik kontrolleri tek yerde oturur ve ileride her subsystem aynı motoru `motor_t` üzerinden kullanır. İsimlendirme standardı `_t` ile biter; tüm subsystem class'ları bunu takip eder.

```cpp
class motor_t {
public:
    motor_t(int rpwm, int lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

    void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); }

    void set(float speed) {
        speed = constrain(speed, -1.0f, 1.0f);
        if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }

    void stop() { set(0.0f); }

private:
    int _rpwm, _lpwm;
};
```

---

### Tank Şasi

İki `motor_t` yan yana. Bu sürüş tarzına **arcade** (ya da POV) denir: bir çubuk ileri/geri hareketi, diğer çubuğun yatay ekseni dönüşü kontrol eder; aşağıda sol çubuk ileri/geri, sağ çubuğun yatay ekseni dönüş. Formül basit: sol tekerlek `ileri + dönüş`, sağ tekerlek `ileri - dönüş`. Dönüş değeri pozitifse robot sağa döner, negatifse sola. Çubuklar bırakıldığında her iki değer de sıfıra döner ve robot durur.

Toplam 1'i aşabilir: robot tam ileri giderken (`ileri = 1`) sağa kırılınca sol tekerlek `1 + dönüş` ister, yani 1'den büyük bir değer. `motor_t::set` içindeki `constrain` bu değeri 1'e sabitler; motor en fazla tam güçte döner, taşan kısım kırpılır. Bu yüzden formüle ayrı bir sınır koymaya gerek yok.

```cpp
motor_t left_motor(16, 17);
motor_t right_motor(18, 19);

void robotInit() { left_motor.init(); right_motor.init(); }
void robotEnd()  { left_motor.stop(); right_motor.stop(); }
void teleopInit() {}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    float fwd  = js.getLeftY();
    float turn = js.getRightX();
    left_motor.set(fwd + turn);
    right_motor.set(fwd - turn);
    delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(20); }
```

Sürüş doğrulandıktan sonra şasi düzeyinde komut verebilmek için `drive_base_t` yazılır. Böylece otonom ve diğer sistemler pin numarası ya da formül görmek zorunda kalmaz; sadece `arcade()` çağırır. Motorlar montaj yönüne göre ters dönebilir; `invert_left` ve `invert_right` parametreleri bunu düzeltir.

#### drive_base_t

```cpp
class drive_base_t {
public:
    drive_base_t(motor_t& left, motor_t& right,
                 bool invert_left = false, bool invert_right = false)
        : _left(left), _right(right),
          _invert_left(invert_left), _invert_right(invert_right) {}

    void init() { _left.init(); _right.init(); }
    void stop() { _left.stop(); _right.stop(); }

    void arcade(float fwd, float turn) {
        float l = fwd + turn;
        float r = fwd - turn;
        _left.set(_invert_left   ? -l : l);
        _right.set(_invert_right ? -r : r);
    }

private:
    motor_t& _left;
    motor_t& _right;
    bool     _invert_left, _invert_right;
};

motor_t      left_motor(16, 17);
motor_t      right_motor(18, 19);
drive_base_t drive_base(left_motor, right_motor);  // sağ motor terseyse: (left_motor, right_motor, false, true)
```

Hook'lar artık pin numarası ya da formül görmez:

```cpp
void robotInit() { drive_base.init(); }
void robotEnd()  { drive_base.stop(); }
void teleopInit() {}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    drive_base.arcade(js.getLeftY(), js.getRightX());
    delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(20); }
```

---

### Mecanum Şasi

Mecanum tekerlekli şaside dört motor var ve her tekerleğin yönü farklı açıda. Bu sayede robot ileri/geri hareketin yanında sağa-sola kayabilir (strafe) ve yerinde dönebilir. Üç eksen bağımsız olarak kontrol edilir: sol çubuk ileri/geri ve yatay kaydırmayı, sağ çubuk dönüşü sürer.

Her motor için hız formülü tekerleğin konumuna ve hareket eksenine göre değişir. Dört motorun toplamı birden büyük çıkabilir; normalizasyon bunu 1.0 sınırına çeker ve hareket yönü korunur.

```cpp
motor_t fl_motor(10, 11);  // front-left
motor_t fr_motor(12, 13);  // front-right
motor_t bl_motor(14, 15);  // back-left
motor_t br_motor(16, 17);  // back-right

void robotInit() { fl_motor.init(); fr_motor.init(); bl_motor.init(); br_motor.init(); }
void robotEnd()  { fl_motor.stop(); fr_motor.stop(); bl_motor.stop(); br_motor.stop(); }
void teleopInit() {}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    float fwd    = js.getLeftY();
    float strafe = js.getLeftX();
    float rotate = js.getRightX();

    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    float mx = max(max(abs(fl), abs(fr)), max(abs(bl), abs(br)));
    if (mx > 1.0f) { fl /= mx; fr /= mx; bl /= mx; br /= mx; }

    fl_motor.set(fl); fr_motor.set(fr);
    bl_motor.set(bl); br_motor.set(br);
    delay(20);
}
```

Aynı mantığı class içine taşıyalım. Mecanum'da her motorun yönü bağımsız olarak farklılık gösterebilir; her biri için ayrı invert bayrağı var.

#### mecanum_t

```cpp
class mecanum_t {
public:
    mecanum_t(motor_t& fl, motor_t& fr, motor_t& bl, motor_t& br,
              bool inv_fl = false, bool inv_fr = false,
              bool inv_bl = false, bool inv_br = false)
        : _fl(fl), _fr(fr), _bl(bl), _br(br),
          _inv_fl(inv_fl), _inv_fr(inv_fr), _inv_bl(inv_bl), _inv_br(inv_br) {}

    void init() { _fl.init(); _fr.init(); _bl.init(); _br.init(); }
    void stop() { _fl.stop(); _fr.stop(); _bl.stop(); _br.stop(); }

    void drive(float fwd, float strafe, float rotate) {
        float fl = fwd + strafe + rotate;
        float fr = fwd - strafe - rotate;
        float bl = fwd - strafe + rotate;
        float br = fwd + strafe - rotate;
        float mx = max(max(abs(fl), abs(fr)), max(abs(bl), abs(br)));
        if (mx > 1.0f) { fl /= mx; fr /= mx; bl /= mx; br /= mx; }
        _fl.set(_inv_fl ? -fl : fl); _fr.set(_inv_fr ? -fr : fr);
        _bl.set(_inv_bl ? -bl : bl); _br.set(_inv_br ? -br : br);
    }

private:
    motor_t& _fl, &_fr, &_bl, &_br;
    bool     _inv_fl, _inv_fr, _inv_bl, _inv_br;
};

motor_t   fl_motor(10, 11), fr_motor(12, 13);
motor_t   bl_motor(14, 15), br_motor(16, 17);
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);
```

Hook'larda kullanımı:

```cpp
void robotInit() { mecanum.init(); }
void robotEnd()  { mecanum.stop(); }

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
    delay(20);
}
```

---

### Konveyör

Sürüş doğrulandıktan sonra ilk mekanizma eklenir. Konveyör burada en basit örnek: tek pin, açık veya kapalı. RB butonuna basılınca çalışır, bırakılınca durur.

Bu örnek konveyörün bir röle veya tek yönde tam hızda dönen basit bir sürücüyle çalıştığını varsayar; o yüzden hız yok, sadece `digitalWrite` ile aç/kapa var. Konveyör sürüş motorları gibi BTS7960'a bağlıysa ve hız kontrolü gerekiyorsa, aç/kapa yerine `motor_t` kullanılır.

Konveyör doğrudan `robotInit` içinde `drive_base` ile birlikte başlatılır. Önemli olan `robotEnd` içinde de durdurulması; aksi halde Stop'tan sonra konveyör dönmeye devam eder.

```cpp
const int CONVEYOR_PIN = 5;

void robotInit() {
    drive_base.init();
    pinMode(CONVEYOR_PIN, OUTPUT);
}

void robotEnd() {
    drive_base.stop();
    digitalWrite(CONVEYOR_PIN, LOW);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    drive_base.arcade(js.getLeftY(), js.getRightX());
    digitalWrite(CONVEYOR_PIN, js.getRB());
    delay(20);
}
```

Class'a taşıyalım; konveyörle ilgili her şey tek yerde toplanmış olur ve otonom da aynı `conveyor.stop()` çağrısını kullanır.

#### conveyor_t

```cpp
class conveyor_t {
public:
    conveyor_t(int pin) : _pin(pin) {}

    void init() { pinMode(_pin, OUTPUT); }
    void run()  { digitalWrite(_pin, HIGH); }
    void stop() { digitalWrite(_pin, LOW); }

private:
    int _pin;
};

conveyor_t conveyor(5);
```

Hook'larda kullanımı:

```cpp
void robotInit() { drive_base.init(); conveyor.init(); }
void robotEnd()  { drive_base.stop(); conveyor.stop(); }

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    drive_base.arcade(js.getLeftY(), js.getRightX());
    if (js.getRB()) conveyor.run(); else conveyor.stop();
    delay(20);
}
```

---

### Kol (Limit Switch'li Mekanizma)

İki yönde hareket eden mekanizmaların ucuna limit switch konur; mekanizma fiziksel sınırına çarpmadan önce motor durdurulur. Switch olmadan motor mekanik sistemi zorlayarak hasar verir.

Limit switch'in bir ucu ESP32 pinine, diğer ucu GND'ye bağlanır. `INPUT_PULLUP` modu pini normalde `HIGH` tutar; switch'e basılınca pin GND'ye bağlanır ve `LOW` okunur. Yani basılı = `LOW` = dur, basılı değil = `HIGH` = geçilebilir. Bu mod sayesinde devreye ayrı bir direnç eklemek gerekmez. Her hareket komutundan önce ilgili switch kontrol edilir; switch tetiklenmişse komut yok sayılır.

Motor gücü doğrudan 0-255 arası `analogWrite` değeriyle verilir; aşağıdaki `200`, tam gücün (255) yaklaşık %80'i.

```cpp
const int ARM_RPWM    = 20, ARM_LPWM     = 21;
const int LIMIT_TOP   = 22, LIMIT_BOTTOM = 23;

void robotInit() {
    drive_base.init(); conveyor.init();
    pinMode(ARM_RPWM, OUTPUT);        pinMode(ARM_LPWM, OUTPUT);
    pinMode(LIMIT_TOP, INPUT_PULLUP); pinMode(LIMIT_BOTTOM, INPUT_PULLUP);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    drive_base.arcade(js.getLeftY(), js.getRightX());
    if (js.getRB()) conveyor.run(); else conveyor.stop();

    bool can_go_up   = digitalRead(LIMIT_TOP)    == HIGH;
    bool can_go_down = digitalRead(LIMIT_BOTTOM) == HIGH;

    if      (js.getLB() && can_go_up)   { analogWrite(ARM_RPWM, 200); analogWrite(ARM_LPWM, 0); }
    else if (js.getA()  && can_go_down) { analogWrite(ARM_RPWM, 0);   analogWrite(ARM_LPWM, 200); }
    else                                { analogWrite(ARM_RPWM, 0);   analogWrite(ARM_LPWM, 0); }

    delay(20);
}
```

Class'a taşıyalım; limit switch mantığı içeride kalır, dışarıdan sadece `arm.up()` ve `arm.down()` görünür.

#### arm_t

```cpp
class arm_t {
public:
    arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
        : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

    void init() {
        pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
        pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    }

    void up(float speed = 0.8f) {
        if (digitalRead(_limit_top) == LOW) { stop(); return; }
        _drive(speed);
    }

    void down(float speed = 0.8f) {
        if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
        _drive(-speed);
    }

    void stop() { _drive(0.0f); }

private:
    void _drive(float speed) {
        speed = constrain(speed, -1.0f, 1.0f);
        if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }

    int _rpwm, _lpwm, _limit_top, _limit_bottom;
};

arm_t arm(20, 21, 22, 23);
```

Hook'larda kullanımı:

```cpp
void robotInit() { drive_base.init(); conveyor.init(); arm.init(); }
void robotEnd()  { drive_base.stop(); conveyor.stop(); arm.stop(); }

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    drive_base.arcade(js.getLeftY(), js.getRightX());
    if (js.getRB()) conveyor.run(); else conveyor.stop();
    if      (js.getLB()) arm.up();
    else if (js.getA())  arm.down();
    else                 arm.stop();
    delay(20);
}
```

Bu, olabilecek en basit kol sistemidir. Gerçek yarışma robotlarında kol yük ve pozisyona göre farklı tork gerektirir; bu tür sistemlerde feedforward ve PID kontrolü gerekebilir. Bu rehberde ele alınmıyor.

---

### Gripper (Aşamalı Servo Kontrolü)

Bazı mekanizmaların birden fazla sabit pozisyonu vardır: gripper tamamen kapalı, yarı açık veya tamamen açık gibi. Bunu sürekli eksen değeriyle sürmek yerine önceden tanımlanmış aşamalar arasında geçiş yapmak hem daha kesin hem de daha kolay kontrol sağlar.

Yöntem: aşama açılarını bir diziye alın, bir imleç (index) tutun, DPad yukarı/aşağı ile imleci kaydırın ve her değişiklikte servoyu yeni açıya götürün. Buton basımı edge detection ile algılanır; butona basılı tutulduğunda her loop turunda tetiklenmez, yalnızca basıldığı anda bir kez çalışır.

Servo sinyalinin nasıl üretildiği (`servoAngle`, `ledcAttachChannel` ve içindeki sayılar) [Yazılım - Servo](yazilim.md#servo) sayfasında anlatılıyor; burada hazır kabul edilir.

```cpp
const uint8_t GRIPPER_PIN    = 4;
const float   STAGES[]       = { 0.0f, 45.0f, 130.0f };
const int     STAGE_COUNT    = 3;
int           cursor         = 0;

void servoAngle(uint8_t pin, float deg) {
    deg = constrain(deg, 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);
    ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

void robotInit() {
    // ... diğer init'ler ...
    ledcAttachChannel(GRIPPER_PIN, 50, 14, 7);
    servoAngle(GRIPPER_PIN, STAGES[cursor]);
}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    // ... sürüş ve diğer kontroller ...

    static bool prev_up = false, prev_down = false;
    bool up   = js.getDpadUp();
    bool down = js.getDpadDown();
    if (up   && !prev_up)   { if (cursor < STAGE_COUNT - 1) { cursor++; servoAngle(GRIPPER_PIN, STAGES[cursor]); } }
    if (down && !prev_down) { if (cursor > 0)               { cursor--; servoAngle(GRIPPER_PIN, STAGES[cursor]); } }
    prev_up   = up;
    prev_down = down;

    delay(20);
}
```

Class'a taşıyalım; edge detection ve servo yazımı içeride kalır, dışarıdan `gripper.update(up, down)` yeterli.

#### gripper_t

```cpp
class gripper_t {
public:
    gripper_t(uint8_t pin, const float* stages, int stage_count)
        : _pin(pin), _stages(stages), _count(stage_count), _cursor(0),
          _prev_up(false), _prev_down(false) {}

    void init() {
        ledcAttachChannel(_pin, 50, 14, 7);
        _apply();
    }

    void update(bool dpad_up, bool dpad_down) {
        if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
        if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
        _prev_up   = dpad_up;
        _prev_down = dpad_down;
    }

private:
    void _apply() {
        float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
        uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);
        ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
    }

    uint8_t      _pin;
    const float* _stages;
    int          _count, _cursor;
    bool         _prev_up, _prev_down;
};

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, GRIPPER_STAGES, 3);
```

Hook'larda kullanımı:

```cpp
void robotInit() { /* ... */ gripper.init(); }

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();
    // ... sürüş ve diğer kontroller ...
    gripper.update(js.getDpadUp(), js.getDpadDown());
    delay(20);
}
```

Aynı imleç-liste mantığı gripper ile sınırlı değildir. Encoder ile konumu okunan bir kol veya asansörde hedef pozisyon listesi tutulabilir; imleç değiştiğinde PID o hedefe doğru motoru sürer.

---

## Dokümana Ne Eklenmesini İstersiniz?

Eksik gördüğünüz bir konu varsa aşağıya yorum bırakın.

<script src="https://giscus.app/client.js"
    data-repo="probot-studio/probot-docs"
    data-repo-id="R_kgDOTCljHg"
    data-category="Ideas"
    data-category-id="DIC_kwDOTCljHs4C_4UX"
    data-mapping="number"
    data-term="1"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="top"
    data-theme="light"
    data-lang="tr"
    crossorigin="anonymous"
    async>
</script>

---

## Tam Kod

Tüm parçalar bir arada. Pin numaraları kullanılan karta göre değiştirilmeli.

```cpp
#define PROBOT_WIFI_AP_SSID     "RobotAdi"
#define PROBOT_WIFI_AP_PASSWORD "sifre1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

class motor_t {
public:
    motor_t(int rpwm, int lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

    void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); }

    void set(float speed) {
        speed = constrain(speed, -1.0f, 1.0f);
        if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }

    void stop() { set(0.0f); }

private:
    int _rpwm, _lpwm;
};

class drive_base_t {
public:
    drive_base_t(motor_t& left, motor_t& right,
                 bool invert_left = false, bool invert_right = false)
        : _left(left), _right(right),
          _invert_left(invert_left), _invert_right(invert_right) {}

    void init() { _left.init(); _right.init(); }
    void stop() { _left.stop(); _right.stop(); }

    void arcade(float fwd, float turn) {
        float l = fwd + turn;
        float r = fwd - turn;
        _left.set(_invert_left   ? -l : l);
        _right.set(_invert_right ? -r : r);
    }

private:
    motor_t& _left;
    motor_t& _right;
    bool     _invert_left, _invert_right;
};

class conveyor_t {
public:
    conveyor_t(int pin) : _pin(pin) {}
    void init() { pinMode(_pin, OUTPUT); }
    void run()  { digitalWrite(_pin, HIGH); }
    void stop() { digitalWrite(_pin, LOW); }
private:
    int _pin;
};

class arm_t {
public:
    arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
        : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

    void init() {
        pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
        pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    }

    void up(float speed = 0.8f) {
        if (digitalRead(_limit_top) == LOW) { stop(); return; }
        _drive(speed);
    }

    void down(float speed = 0.8f) {
        if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
        _drive(-speed);
    }

    void stop() { _drive(0.0f); }

private:
    void _drive(float speed) {
        speed = constrain(speed, -1.0f, 1.0f);
        if (speed > 0) { analogWrite(_rpwm, (int)(speed * 255)); analogWrite(_lpwm, 0); }
        else           { analogWrite(_rpwm, 0); analogWrite(_lpwm, (int)(-speed * 255)); }
    }

    int _rpwm, _lpwm, _limit_top, _limit_bottom;
};

class gripper_t {
public:
    gripper_t(uint8_t pin, const float* stages, int stage_count)
        : _pin(pin), _stages(stages), _count(stage_count), _cursor(0),
          _prev_up(false), _prev_down(false) {}

    void init() {
        ledcAttachChannel(_pin, 50, 14, 7);
        _apply();
    }

    void update(bool dpad_up, bool dpad_down) {
        if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
        if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
        _prev_up   = dpad_up;
        _prev_down = dpad_down;
    }

private:
    void _apply() {
        float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
        uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);
        ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
    }

    uint8_t      _pin;
    const float* _stages;
    int          _count, _cursor;
    bool         _prev_up, _prev_down;
};

motor_t      left_motor(16, 17);
motor_t      right_motor(18, 19);
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(5);
arm_t        arm(20, 21, 22, 23);

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, GRIPPER_STAGES, 3);

void robotInit() {
    drive_base.init();
    conveyor.init();
    arm.init();
    gripper.init();
}

void robotEnd() {
    drive_base.stop();
    conveyor.stop();
    arm.stop();
}

void teleopInit() {}

void teleopLoop() {
    auto js = probot::io::joystick_api::makeDefault();

    drive_base.arcade(js.getLeftY(), js.getRightX());

    if (js.getRB()) conveyor.run(); else conveyor.stop();

    if      (js.getLB()) arm.up();
    else if (js.getA())  arm.down();
    else                 arm.stop();

    gripper.update(js.getDpadUp(), js.getDpadDown());

    delay(20);
}

void autonomousInit() {}
void autonomousLoop() { delay(20); }
```

---

## Otonom

Otonom fazda kumanda yok; robot yalnızca önceden yazılmış koda göre hareket eder, varsayılan süre 30 saniyedir. Teleop için yazılan class'lar burada da kullanılır; tek fark, komutların joystickten değil koddan gelmesi.

Zamanlama için `millis()` kullanılır. `delay()` ile bekleme yapılırsa 2 saniyeyi aşan çağrı deadline miss hatasına neden olur ve otonom kesilir. Bunun yerine her `autonomousLoop` turunda o ana kadar geçen süre kontrol edilir; eşik aşılınca bir sonraki adıma geçilir.

`autonomousInit()` her otonom başlangıcında çağrılır. `static` ve global değişkenler bir önceki çalışmadan kalan değeri korur; bu yüzden başlangıç durumu burada sıfırlanmalı.

### Faz Faz İlerleyen Otonom

En basit otonom, sabit süreli fazlardan oluşan bir durum makinesi kurularak yazılır. Her faz bir işi yapar ve süresi dolunca bir sonrakine devreder. Aşağıdaki örnek ileri gider, durup konveyörü çalıştırır, sonra durur.

```cpp
enum class Phase { FORWARD, COLLECT, STOP, DONE };
static Phase    phase;
static uint32_t t_ref;

void autonomousInit() {
    phase = Phase::FORWARD;
    t_ref = millis();
    conveyor.stop();
}

void autonomousLoop() {
    uint32_t elapsed = millis() - t_ref;

    switch (phase) {
        case Phase::FORWARD:
            drive_base.arcade(0.7f, 0.0f);
            if (elapsed > 2000) { phase = Phase::COLLECT; t_ref = millis(); }
            break;

        case Phase::COLLECT:
            drive_base.stop();
            conveyor.run();
            if (elapsed > 1500) { phase = Phase::STOP; t_ref = millis(); }
            break;

        case Phase::STOP:
            conveyor.stop();
            phase = Phase::DONE;
            break;

        case Phase::DONE:
            break;
    }

    delay(20);
}
```

Her faz geçişinde `t_ref` yeniden `millis()`'e ayarlanır; böylece `elapsed` her zaman içinde bulunulan fazda geçen süreyi ölçer, otonomun başından beri değil.

!!! tip "AI varsa"
    Otonom sırası için AI'a "2 saniye ileri git, konveyörü 1.5 saniye çalıştır, dur" gibi doğal dil talimatı verilip millis tabanlı durum makinesi istenebilir. Üretilen kodda `delay()` varsa durum makinesine dönüştürülmesi gerekir.

### Mesafe ve Açıyla Hareket

"2 saniye ileri git" çalışır ama mesafe cinsinden düşünmek daha kolaydır: "1 metre ileri git, 90 derece sağa dön, 0.5 metre ileri git" gibi. Encoder olmadan robot gerçekte ne kadar gittiğini bilemez; ancak sabit bir güçte geçen sürenin kabaca sabit bir mesafeye karşılık geldiği varsayılabilir.

Bu varsayımın iki katsayısı deneyerek bulunur: robotu sabit güçte sürüp 1 metre gitmesinin kaç saniye sürdüğü ölçülür, aynısı 1 derece dönüş için yapılır. Örnek değerler aşağıda; her robot için ayrı ölçülmeli.

```cpp
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;    // 0.6 güçle 1 metre ≈ 2.3 sn
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;  // 0.6 güçle 1 derece ≈ 0.011 sn
```

Akla gelen ilk yöntem `go(1.0)` gibi bir fonksiyon yazıp içinde beklemektir; ama 1 metre 2.3 saniye sürer ve loop içinde bu kadar uzun bir bekleme deadline miss'e yol açar. Bunun yerine otonom bir adım listesine bölünür ve her adım, durum makinesindeki gibi süresi dolunca bir sonrakine devreder. Her adım ya ileri gitmedir (`GO`, metre) ya da dönüştür (`TURN`, derece). Pozitif değer ileri veya sağa, negatif değer geri veya sola. Bir adımın ne kadar süreceği katsayılardan hesaplanır.

```cpp
enum class Move { GO, TURN };
struct Step { Move type; float amount; };

Step plan[] = {
    { Move::GO,    1.0f },   // 1 metre ileri
    { Move::TURN,  90.0f },  // 90 derece sağa
    { Move::GO,    0.5f },   // 0.5 metre ileri
};
int step_count = sizeof(plan) / sizeof(plan[0]);

int      step_i;
uint32_t step_start;
uint32_t step_dur;

// Bir adımı başlatır: motorları o adıma göre sürer, süresini hesaplar.
void startStep(int i) {
    step_i     = i;
    step_start = millis();
    if (i >= step_count) { drive_base.stop(); return; }

    Step s = plan[i];
    if (s.type == Move::GO) {
        step_dur = (uint32_t)(fabs(s.amount) * SEC_PER_METER * 1000);  // saniye -> ms
        drive_base.arcade(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
    } else {
        step_dur = (uint32_t)(fabs(s.amount) * SEC_PER_DEGREE * 1000); // saniye -> ms
        drive_base.arcade(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
    }
}

void autonomousInit() {
    startStep(0);
}

void autonomousLoop() {
    if (step_i < step_count && millis() - step_start >= step_dur) {
        startStep(step_i + 1);
    }
    delay(20);
}
```

Bu yöntem tank şaside makul çalışır. Mecanum şaside tekerlekler kayma eğiliminde olduğu için süreyle mesafe ilişkisi daha az güvenilir.

Bundan sonrası, örneğin robotu saha üzerinde belirli bir koordinata gönderme veya hareketleri sıralı komutlar hâlinde dizme, örnek robotun kapsamı dışında. Otonomu bu noktadan ileri götürmek için [Yazılım - Otonom](yazilim.md#otonom) sayfasına bak; orada koordinata gitme ve daha derin otonom desenleri anlatılıyor.

### Sonraki Adımlar

Buradaki yöntemlerin hepsi tahmine dayanır: tekerlek kayabilir, akü zayıfladıkça hız düşer, zemin değişir. Robotun gerçekte nereye gittiğini ölçemediği için her tur biraz daha sapma birikir. Kısa otonom sekanslarında işe yarar; uzun ve hassas hareketlerde güvenilir değil.

Gerçek hassasiyet için robotun kendi hareketini ölçmesi gerekir: encoder tekerleklerin ne kadar döndüğünü okuyarak gerçek mesafeyi, bir jiroskop ise robotun gerçek açısını verir. Bu veriler bir geri besleme döngüsüne (PID) bağlandığında robot hedefle arasındaki farkı görüp düzeltebilir. Bu rehber bu katmanlara girmiyor.

Probot, robot ile sürücü istasyonu arasındaki iletişimi sağlar; encoder okuma, odometri ve PID gibi kontrol katmanları kapsamı dışında kalır. Bu özellikleri içeren ayrı bir kütüphanenin (probot-sdk) geliştirilmesini istiyorsanız, sayfadaki [tartışma bölümünden](#dokumana-ne-eklenmesini-istersiniz) talepte bulunabilirsiniz.
