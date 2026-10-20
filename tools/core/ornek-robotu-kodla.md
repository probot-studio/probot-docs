# Örnek robotu baştan sona kodla

Bu sayfada tek bir motordan başlayıp şasi, konveyör, limit switch'li kol ve servolu gripper ekleyerek bir yarışma robotunun kodunu parça parça yazacaksın.

Amaç sıfırdan çalışan bir robota en kısa ve güvenilir yoldan ulaşmak. Encoder ya da PID gibi ileri kontrol yöntemleri bu sayfada yok. Kodların hepsi Probot Core ile derlenir; pin numaraları ESP32-S3 kartına göre seçildi, kendi kartına göre değiştir. Düz ESP32 için: [Kartı ve bölümlemeyi seç](arduino-ide-kur.md#kart-ve-bolumleme).

## Başlamadan önce

- Arduino IDE kurulu ve Probot Core yüklü: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Robotun ağına bağlanıp Driver Station'ı açabiliyorsun: [İlk 10 dakika](ilk-10-dakika.md).
- Motorlar BTS7960 tarzı, iki PWM girişli (RPWM ve LPWM) sürücülere bağlı.

## Sistemleri planla {#sistemleri-planlamak}

Kod yazmadan önce robotun her sisteminin nasıl çalışacağını düşün. Üç seviye vardır:

- **Hep açık sistemler:** Güç verilince çalışır, açıp kapamak gerekmez. Fan, sabit hızlı konveyör, ışık. Çoğu zaman doğrudan güç bağlantısı yeter; her mekanik sistem yazılım istemez.
- **Açılıp kapanan sistemler:** Robot ne zaman başlatıp durduracağına karar verir. Karar sürücüden (bir tuş), zamandan (2 saniye ileri git) ya da sensörden (limit switch'e değince dur) gelir. Bunu baştan netleştirmek kodun nasıl yazılacağını belirler.
- **Hassas kontrol isteyen sistemler:** Hız ya da konum hassas tutulacaksa encoder ve PID gerekir. Bu seviyeye daha basit yöntemler yetmeyince geç; erken karmaşıklık zaman kaybettirir ve hata ayıklamayı zorlaştırır.

Bu sayfadaki örnekler ilk iki seviyeyi kapsar.

## Donanımı önce tek başına dene {#temel-sistemi-once-dogrula}

Kod yazmadan önce mekanik ve elektroniğin çalıştığından emin ol. Motor kodunu yazıp motor dönmezse sorunun kablo, sürücü, motor ya da kod olduğunu bulmak uzun sürer.

Sürücüyü ve motoru doğrudan güç kaynağına bağlayıp motorun döndüğünü gör. Dönüyorsa elektronik sağlamdır, sorun kodda ya da bağlantıdadır. Dönmüyorsa koda geçmeden donanımı çöz. Servo, sensör ve diğer her parça için de aynısını yap: birleştirmeden önce tek başına dene.

## Parça parça ilerle {#subsystem-subsystem-kodla}

Robotun bütün kodu bir kerede yazılıp denenirse çalışmaz ve neyin bozuk olduğunu bulmak zorlaşır. Gall Yasası bunu şöyle söyler: çalışan karmaşık bir sistem, çalışan basit bir sistemden gelişir.

Her alt sistemi ayrı kodla ve tek başına dene. Sıra genelde şöyledir:

- **Sürüş:** Robot hareket edebilsin.
- **Kumanda:** Sürüş kumandayla yapılsın.
- **Mekanizmalar:** Kol, kepçe, konveyör; her biri sırayla eklenir.
- **Otonom:** Teleop tamamen çalışınca yazılır.

Her adımda robot sahaya çıkabilecek durumda kalsın. İkinci mekanizma çalışmıyor diye sürüş beklemesin. Yapay zekâ asistanı kullanıyorsan da aynı sırayla ilerle: [Yapay zekâ asistanıyla kod yaz](yapay-zekayla-kod-yaz.md).

<a id="ornek-surusten-tam-robota"></a>
## Tek motoru döndür {#tek-motor}

İlk hedef en basit olanı: tek bir motor dönüyor mu, yönü doğru mu? Bunu bilmeden şasiye geçmek hata ayıklamayı zorlaştırır.

Motor ESP32 pinine doğrudan bağlanmaz; pin motoru döndürecek akımı veremez. Araya bir motor sürücü girer. BTS7960'ta `RPWM` pinine sinyal verince motor ileri, `LPWM` pinine verince geri döner. İkisine aynı anda sinyal verme. `analogWrite` pine 0 (dur) ile 255 (tam güç) arası bir değer yazar; çubuk değeri -1 ile +1 arası geldiği için 255 ile çarpılır. Ayrıntı: [Motoru sür](motoru-sur.md).

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Pinleri kendi kartına göre değiştir
#define RPWM 5   // bu pine sinyal: motor ileri
#define LPWM 6   // bu pine sinyal: motor geri

void stopMotor() {
  analogWrite(RPWM, 0);
  analogWrite(LPWM, 0);
}

void robotInit() {
  pinMode(RPWM, OUTPUT);
  pinMode(LPWM, OUTPUT);
  stopMotor();
}

void robotEnd() {
  stopMotor();   // Stop'ta motor durur
}

void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  float speed = js.getLeftY();   // -1..+1, ileri pozitif

  // İki pine aynı anda sinyal verme: biri her zaman 0
  if (speed > 0) { analogWrite(RPWM, (int)(speed * 255));  analogWrite(LPWM, 0); }
  else           { analogWrite(RPWM, 0); analogWrite(LPWM, (int)(-speed * 255)); }
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Kodu Arduino IDE'de yeni bir sketch'e yapıştır; `RPWM` ve `LPWM`'yi kendi pinlerine göre değiştir.
2. Kodu karta yükle.
3. Driver Station'da **Autonomous** anahtarını kapat. Böylece **Start** doğrudan teleopu başlatır.
4. **Init**'e, sonra **Start**'a bas.
5. Sol çubuğu ileri it, sonra geri çek.

Sonuç: Motor çubuk ileriyken bir yöne, geriyken öbür yöne döner; çubuğu bırakınca durur.

Motor ters yöne dönüyorsa motorun iki kablosunu ya da koddaki `RPWM` ve `LPWM` numaralarını yer değiştir. Motor hiç tepki vermiyorsa önce Driver Station'ın **Joystick** sekmesinde çubuğun hareketini gör: [Kumanda verisini oku](kumandayi-oku.md).

Robotta birden çok motor varsa şasiye geçmeden hepsini bu kodla tek tek dene.

### motor_t sınıfına taşı {#motor_t}

Tek motoru bir sınıfa almak pin numaralarını ve motorun yönünü tek yerde toplar; kod [Motoru sür](motoru-sur.md#motor-sinifi) sayfasındakiyle aynıdır. Sonraki her alt sistem motoru `motor_t` üzerinden kullanır. Sınıf adları `_t` ile biter.

```cpp
// ---- Motor: BTS7960 tarzı çift PWM'li sürücü ----
// -1 (geri) .. +1 (ileri)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

class motor_t {
public:
  motor_t(uint8_t rpwm, uint8_t lpwm, bool inverted = false)
    : _rpwm(rpwm), _lpwm(lpwm), _inverted(inverted) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void set(float power) { setMotor(_rpwm, _lpwm, power, _inverted); }
  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm;
  bool    _inverted;
};
```

## Tank şasiyi sür {#tank-sasi}

İki `motor_t` yan yana. Bu sürüşe **arcade** denir: sol çubuk ileri/geri, sağ çubuğun yatay ekseni dönüşü sürer. Sol tekerlek `ileri + dönüş`, sağ tekerlek `ileri - dönüş` alır. Dönüş pozitifse robot sağa, negatifse sola döner. Çubuklar bırakılınca iki değer de sıfıra döner ve robot durur.

Toplam 1'i aşabilir: tam ileri giderken sağa kırınca sol tekerlek 1'den büyük değer ister. `setMotor` bu değeri 255'e sınırlar, ayrıca sınır koymaya gerek yok.

Şasiyi bir sınıfa almak otonom ve diğer sistemlerin pin numarası ya da formül görmeden `arcade()` çağırmasını sağlar. Ters monte edilen motorun `motor_t` satırına üçüncü değer olarak `true` yaz.

```cpp
// ---- Şasi: iki motorlu tank, arcade sürüş ----
class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: ileri/geri, turn: dönüş (pozitif = sağa)
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

motor_t      left_motor(5, 6);
motor_t      right_motor(7, 8);   // sağ motor tersse: right_motor(7, 8, true)
drive_base_t drive_base(left_motor, right_motor);
```

Fonksiyonlar artık pin numarası ya da formül görmez:

```cpp
void robotInit()  { drive_base.init(); }
void robotEnd()   { drive_base.stop(); }
void teleopInit() { drive_base.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Tek motor kodundaki `RPWM`, `LPWM` ve `stopMotor` satırlarını sil.
2. `#include <probot.h>` satırının altına `setMotor` fonksiyonunu, `motor_t` ve `drive_base_t` sınıflarını, motor tanımlarını koy.
3. Altı fonksiyonu yukarıdakilerle değiştir.
4. Kodu yükle; **Autonomous** kapalıyken **Init**'e, sonra **Start**'a bas.
5. Sol çubuğu ileri it, sonra sağ çubuğu sağa yatır.

Sonuç: Robot sol çubukla ileri gider, sağ çubuk sağa yatınca sağa döner. Bir taraf ters gidiyorsa o tarafın `motor_t` satırına üçüncü değer olarak `true` ekle.

Şasi seçimi ve diğer sürüş biçimleri: [Şasiyi sür](sasiyi-sur.md).

## Mecanum şasiyi sür {#mecanum-sasi}

Mecanum şaside dört motor vardır ve tekerleklerin makaraları açılıdır. Robot ileri/geri gitmenin yanında yana kayabilir ve yerinde dönebilir. Üç eksen ayrı ayrı sürülür: sol çubuk ileri/geri ve yana kaymayı, sağ çubuk dönüşü sürer.

Her motorun hızı tekerleğin konumuna göre farklı formülle hesaplanır. Dört değerden biri 1'i aşarsa hepsi aynı oranda küçültülür; böylece hareketin yönü korunur. Ters monte edilen motorun `motor_t` satırına üçüncü değer olarak `true` yazılır.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// BTS7960 tarzı çift PWM'li sürücüyü sürer: -1 (geri) .. +1 (ileri)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

class motor_t {
public:
  motor_t(uint8_t rpwm, uint8_t lpwm, bool inverted = false)
    : _rpwm(rpwm), _lpwm(lpwm), _inverted(inverted) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void set(float power) { setMotor(_rpwm, _lpwm, power, _inverted); }
  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm;
  bool    _inverted;
};

// ---- Mecanum şasi: dört motor ----
class mecanum_t {
public:
  mecanum_t(motor_t& fl, motor_t& fr, motor_t& bl, motor_t& br)
    : _fl(fl), _fr(fr), _bl(bl), _br(br) {}

  void init() { _fl.init(); _fr.init(); _bl.init(); _br.init(); }
  void stop() { _fl.stop(); _fr.stop(); _bl.stop(); _br.stop(); }

  // fwd: ileri/geri, strafe: yana kayma (pozitif = sağa), rotate: dönüş (pozitif = sağa)
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // En büyük değer 1'i aşarsa hepsini aynı oranda küçült: yön korunur
    float mx = fmaxf(fmaxf(fabsf(fl), fabsf(fr)), fmaxf(fabsf(bl), fabsf(br)));
    if (mx > 1.0f) { fl /= mx; fr /= mx; bl /= mx; br /= mx; }

    _fl.set(fl); _fr.set(fr);
    _bl.set(bl); _br.set(br);
  }

private:
  motor_t& _fl;
  motor_t& _fr;
  motor_t& _bl;
  motor_t& _br;
};

// Pinleri kendi kartına göre değiştir
motor_t   fl_motor(5, 6);     // ön sol
motor_t   fr_motor(7, 8);     // ön sağ
motor_t   bl_motor(15, 16);   // arka sol
motor_t   br_motor(17, 18);   // arka sağ
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void robotInit()  { mecanum.init(); }
void robotEnd()   { mecanum.stop(); }
void teleopInit() { mecanum.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  // Sol çubuk: ileri/geri ve yana kayma. Sağ çubuk: dönüş.
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}

void autonomousInit() {}
void autonomousLoop() {}
```

1. Kodu yeni bir sketch'e yapıştır, dört motorun pinlerini değiştir.
2. Kodu yükle; **Autonomous** kapalıyken **Init**'e, sonra **Start**'a bas.
3. Robotu yerden kaldır ve sol çubuğu ileri it. Dört tekerleğin de ileri döndüğünü gör; ters dönen motorun `motor_t` satırına üçüncü değer olarak `true` ekle.
4. Robotu yere koy ve sol çubuğu sağa yatır.

Sonuç: Robot sol çubuk ileriyken ileri gider, sağa yatınca sağa kayar, sağ çubukla yerinde döner.

Robot kaymak yerine dönüyor ya da çapraz gidiyorsa tekerleklerin takılış yönünü ve motor satırlarındaki `true` değerlerini kontrol et.

Dört motor sekiz PWM pini kullanır ve ESP32-S3'ün sekiz LEDC kanalını doldurur. Bu şasiye servo eklenemez.

## Konveyör ekle {#konveyor}

Sürüş çalışınca ilk mekanizmayı ekle. Konveyör en basit örnek: tek pin, açık ya da kapalı. **RB** basılıyken çalışır, bırakınca durur.

Bu örnek konveyörün bir röleyle ya da tek yönde tam hızla dönen bir sürücüyle çalıştığını varsayar; hız yok, `digitalWrite` ile aç/kapa var. Konveyör de BTS7960'a bağlıysa ve hız gerekiyorsa `conveyor_t` yerine bir `motor_t` kullan.

```cpp
// ---- Konveyör: tek pin, aç/kapa (röle ya da tek yönlü sürücü) ----
class conveyor_t {
public:
  conveyor_t(int pin) : _pin(pin) {}
  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }
private:
  int _pin;
};

conveyor_t conveyor(9);
```

1. `conveyor_t` sınıfını `drive_base_t`'nin altına, `conveyor(9)` satırını motor tanımlarının altına koy.
2. `robotInit()` içine `conveyor.init();` ekle.
3. `robotEnd()` ve `teleopInit()` içine `conveyor.stop();` ekle.
4. `teleopLoop()` içine `if (js.getRB()) conveyor.run(); else conveyor.stop();` ekle.
5. Kodu yükle, **Init** ve **Start**'a bas, **RB**'ye basılı tut.

Sonuç: **RB** basılıyken konveyör döner, bırakınca durur. **Stop**'a basınca da durur.

Durdurma satırı `robotEnd()` içinde olmazsa **Stop**'tan sonra konveyör dönmeye devam eder. `teleopInit()` içinde olmazsa otonomda başlattığın konveyör teleopta da döner.

## Kolu limit switch'le sür {#kol-limit-switchli-mekanizma}

İki yönde hareket eden bir mekanizmanın uçlarına limit switch konur; mekanizma sınırına çarpmadan motor durur. Switch olmadan motor mekaniği zorlar ve hasar verir.

Switch'in bir ucu ESP32 pinine, öbür ucu GND'ye bağlanır. `INPUT_PULLUP` pini normalde `HIGH` tutar; switch'e basılınca pin GND'ye bağlanır ve `LOW` okunur. Yani basılı = `LOW` = o yöne gitme. Ayrı bir direnç gerekmez. Her hareket komutundan önce ilgili switch okunur.

```cpp
// ---- Kol: iki uçta limit switch ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // Switch basılıysa (LOW) o yöne gitme
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

arm_t arm(10, 11, 12, 13);   // RPWM, LPWM, üst switch, alt switch
```

1. `arm_t` sınıfını ve `arm(...)` satırını koda ekle.
2. `robotInit()` içine `arm.init();`, `robotEnd()` ve `teleopInit()` içine `arm.stop();` ekle.
3. `teleopLoop()` içine şunu ekle: `if (js.getLB()) arm.up(); else if (js.getA()) arm.down(); else arm.stop();`
4. Kodu yükle, **Init** ve **Start**'a bas, **LB**'ye basılı tut.

Sonuç: **LB** basılıyken kol kalkar ve üst switch'e değince durur. **A** basılıyken iner, alt switch'te durur.

Bu en basit kol sistemidir. Yüke ve konuma göre farklı tork isteyen kollarda feedforward ve PID gerekebilir; bu sayfa onları kapsamaz. Süreyle ya da encoder'la çalışan mekanizmalar: [Mekanizma ekle](mekanizma-ekle.md).

<a id="gripper-asamal-servo-kontrolu"></a>
## Gripper'ı aşamalarla sür {#gripper-asamali-servo-kontrolu}

Bazı mekanizmaların birkaç sabit konumu vardır: gripper kapalı, yarı açık, tam açık. Bunları çubukla sürmek yerine önceden belirlenmiş açılar arasında geçmek daha kesindir.

Açılar bir dizide durur, bir imleç (`_cursor`) hangisinde olduğunu tutar. **D-pad** yukarı imleci ileri, aşağı geri alır ve servo yeni açıya gider. Tuş basılı tutulunca her turda tetiklenmesin diye yalnız basıldığı an sayılır: önceki turdaki değer (`_prev_up`) tutulur. Servo sinyalinin nasıl üretildiği: [Servoyu sür](servoyu-sur.md).

```cpp
// ---- Gripper: servo, sabit açılar arasında aşama aşama ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, yüksek kanal
    _cursor = 0;
    _apply();
  }

  // D-Pad yukarı: sonraki aşama, aşağı: önceki aşama. Basıldığı an bir kez.
  void update(bool dpad_up, bool dpad_down) {
    if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
    if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
    _prev_up   = dpad_up;
    _prev_down = dpad_down;
  }

  void release() { ledcWrite(_pin, 0); }   // darbeyi kes

private:
  void _apply() {
    float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);   // 0-180° -> 500-2500 µs
    ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
  }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);   // pin 4, LEDC kanalı 7, 3 aşama
```

!!! warning "Dikkat"
    Servoyu ESP32 kartının 5V ya da 3V3 pininden besleme. Ayrı bir 5-6 V kaynak (BEC) kullan ve GND'leri ortak bağla.

1. `gripper_t` sınıfını ve `gripper(...)` satırını koda ekle.
2. `robotInit()` içine `gripper.init();`, `robotEnd()` içine `gripper.release();` ekle.
3. `teleopLoop()` içine `gripper.update(js.getDpadUp(), js.getDpadDown());` ekle.
4. Kodu yükle, **Init** ve **Start**'a bas, **D-pad** yukarıya üç kez bas.

Sonuç: **Init**'e her basışta gripper 0 dereceye gider. **D-pad** yukarı her basışta 45 ve 130 dereceye geçer, aşağı her basışta bir aşama geri döner.

Aynı imleç ve liste fikri gripper'la sınırlı değil. Konumu encoder'la okunan bir kol ya da asansörde hedef konum listesi tutulabilir.

## Tam kod {#tam-kod}

Bütün parçalar bir arada. Otonom bölümü bir sonraki başlıkta anlatılıyor.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// ---- Motor: BTS7960 tarzı çift PWM'li sürücü ----
// -1 (geri) .. +1 (ileri)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

class motor_t {
public:
  motor_t(uint8_t rpwm, uint8_t lpwm, bool inverted = false)
    : _rpwm(rpwm), _lpwm(lpwm), _inverted(inverted) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void set(float power) { setMotor(_rpwm, _lpwm, power, _inverted); }
  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm;
  bool    _inverted;
};

// ---- Şasi: iki motorlu tank, arcade sürüş ----
class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: ileri/geri, turn: dönüş (pozitif = sağa)
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

// ---- Konveyör: tek pin, aç/kapa (röle ya da tek yönlü sürücü) ----
class conveyor_t {
public:
  conveyor_t(int pin) : _pin(pin) {}
  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }
private:
  int _pin;
};

// ---- Kol: iki uçta limit switch ----
class arm_t {
public:
  arm_t(int rpwm, int lpwm, int limit_top, int limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // Switch basılıysa (LOW) o yöne gitme
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

// ---- Gripper: servo, sabit açılar arasında aşama aşama ----
class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit, yüksek kanal
    _cursor = 0;
    _apply();
  }

  // D-Pad yukarı: sonraki aşama, aşağı: önceki aşama. Basıldığı an bir kez.
  void update(bool dpad_up, bool dpad_down) {
    if (dpad_up   && !_prev_up)   { if (_cursor < _count - 1) { _cursor++; _apply(); } }
    if (dpad_down && !_prev_down) { if (_cursor > 0)          { _cursor--; _apply(); } }
    _prev_up   = dpad_up;
    _prev_down = dpad_down;
  }

  void release() { ledcWrite(_pin, 0); }   // darbeyi kes

private:
  void _apply() {
    float deg = constrain(_stages[_cursor], 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);   // 0-180° -> 500-2500 µs
    ledcWrite(_pin, (uint32_t)us * 16383 / 20000);
  }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

// ---- Robotun parçaları (pinleri kendi kartına göre değiştir) ----
motor_t      left_motor(5, 6);
motor_t      right_motor(7, 8);   // sağ motor tersse: right_motor(7, 8, true)
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(9);
arm_t        arm(10, 11, 12, 13);

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);

void stopAll() {
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void robotInit() {
  drive_base.init();
  conveyor.init();
  arm.init();
  gripper.init();
}

void robotEnd() {
  stopAll();
  gripper.release();
}

void teleopInit() {
  stopAll();   // otonomdan kalan komutları sil
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();

  gripper.update(js.getDpadUp(), js.getDpadDown());
}

// ---- Otonom: ileri git, topla, dur ----
enum class Stage { FORWARD, COLLECT, DONE };
Stage    stage      = Stage::FORWARD;
uint32_t stageStart = 0;

void autonomousInit() {
  stage = Stage::FORWARD;
  stageStart = millis();   // Start anı
}

void autonomousLoop() {
  uint32_t elapsed = millis() - stageStart;   // bu aşamada geçen süre (ms)

  switch (stage) {
    case Stage::FORWARD:
      drive_base.arcade(0.7f, 0.0f);
      if (elapsed >= 2000) { stage = Stage::COLLECT; stageStart = millis(); }
      break;
    case Stage::COLLECT:
      drive_base.stop();
      conveyor.run();
      if (elapsed >= 1500) { stage = Stage::DONE; stageStart = millis(); }
      break;
    case Stage::DONE:
      stopAll();
      break;
  }
}
```

1. Kodu yeni bir sketch'e yapıştır ve pin numaralarını kendi kartına göre değiştir.
2. Kodu karta yükle.
3. **Autonomous** kapalıyken **Init**'e, sonra **Start**'a bas.
4. Tablodaki kontrolleri tek tek dene.

Sonuç: Robot kumandaya şu tabloya göre yanıt verir. **Stop**'a basınca bütün motorlar durur ve gripper servosu serbest kalır.

| Kumanda | Ne yapar |
|---|---|
| **sol çubuk** ileri/geri | Robot ileri/geri gider |
| **sağ çubuk** sağa/sola | Robot sağa/sola döner |
| **RB** basılı | Konveyör döner |
| **LB** basılı | Kol kalkar, üst switch'te durur |
| **A** basılı | Kol iner, alt switch'te durur |
| **D-pad** yukarı / aşağı | Gripper bir sonraki / önceki açıya geçer |

<a id="faz-faz-ilerleyen-otonom"></a>
## Otonomu ekle {#otonom}

Otonomda kumanda yok; robot önceden yazılmış koda göre hareket eder. Teleop için yazdığın sınıflar burada da kullanılır, komutlar kumandadan değil koddan gelir. Tam koddaki otonom üç aşamalıdır: ileri git, dur ve konveyörü çalıştır, dur.

Zamanlama `millis()` ile yapılır. `delay()` ile beklemek, tur 2 saniyeyi geçince kumanda girişlerinin sıfırlanmasına ve durum LED'inin kırmızı yanıp sönmesine yol açar. `autonomousInit()` her Start'ta çalışır; aşamayı ve zamanı burada sıfırla. Her aşama değişiminde `stageStart` yenilenir, `elapsed` o aşamada geçen süreyi ölçer.

1. Robotu boş bir alana koy.
2. Driver Station'da **Autonomous** anahtarını aç.
3. **Init**'e, sonra **Start**'a bas.

Sonuç: Robot 2 saniye ileri gider ve durur, konveyör 1,5 saniye döner ve durur. Otonom süresi dolunca teleop başlar ve robot kumandayla sürülür.

Mesafe ve açıyla hareket, saha noktalarına gitme ve otonomun sınırları: [Otonomu yaz](otonom-yaz.md).

## Sonraki adım

[Hatayı adım adım daralt](hatayi-daralt.md)
