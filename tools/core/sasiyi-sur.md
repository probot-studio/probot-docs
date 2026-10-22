# Şasiyi sür

Bu sayfada iki motorlu şasiyi tank ve arcade kontrolüyle, dört motorlu mecanum şasiyi üç eksenle sürecek ve sürüşü yumuşatacaksın.

## Başlamadan önce

- Her motoru tek başına denedin ve yönünü düzelttin. Bkz. [Motoru sür](motoru-sur.md).
- Bu sayfa iki motorlu şaside sol motor için 16 ve 17, sağ motor için 18 ve 21 numaralı pinleri kullanır. Pinleri kendi kartına göre değiştir.

Şasi, robotu birlikte hareket ettiren motorlardır. Aynı şasi farklı kumanda düzenleriyle sürülebilir. Probot Blocks'ta **tank sürüş** ve **arcade sürüş** blokları aynı kodu üretir: [Sürüş programı yaz](../blocks/probot-surus-programi-yaz.md).

## Tank kontrolüyle sür {#tank}

Tank kontrolünde her çubuk bir tarafı sürer: sol çubuk sol motoru, sağ çubuk sağ motoru.

1. Dört pin numarasını programın başına yaz.
2. Sağ motor ters monte edildiyse `RIGHT_INVERTED` değerini `true` bırak, değilse `false` yap.
3. `teleopLoop()` içinde iki çubuğun Y değerini iki motora ver.
4. Kodu yükle. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Pinleri kendi kartına göre değiştir
#define LEFT_RPWM   16
#define LEFT_LPWM   17
#define RIGHT_RPWM  18
#define RIGHT_LPWM  21

// Motor yönü ters ise true yap
#define LEFT_INVERTED  false
#define RIGHT_INVERTED true

// BTS7960 tarzı çift PWM'li sürücüyü sürer: -1 (geri) .. +1 (ileri)
void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

void stopMotors() {
  setMotor(LEFT_RPWM, LEFT_LPWM, 0.0f, false);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, 0.0f, false);
}

// Init'te çalışır: pinleri hazırlar, motorlar durur
void setupHardware() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void autonomousInit() { setupHardware(); }
void autonomousLoop() {}
void autonomousStop() { stopMotors(); }   // Stop'ta motorlar güvenli konuma

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Her çubuk bir tarafı sürer
  setMotor(LEFT_RPWM,  LEFT_LPWM,  js.getLeftY(),  LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, js.getRightY(), RIGHT_INVERTED);
}

void teleopStop() { stopMotors(); }      // Stop'ta motorlar güvenli konuma
```

Sonuç: İki çubuğu birlikte ileri itince robot ileri gider. Yalnız sol çubuğu itince robot sağa döner. Çubukları bırakınca robot durur.

## Arcade kontrolüyle sür {#arcade}

Arcade kontrolünde bir çubuk ileri-geri, öbür çubuk dönüşü sürer. Çoğu sürücüye tanktan daha tanıdık gelir.

1. [Tank kontrolüyle sür](#tank) bölümündeki programı aç.
2. Programdaki `teleopLoop()`'u aşağıdakiyle değiştir.
3. Kodu yükle. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float fwd  = js.getLeftY();    // sol çubuk: ileri / geri
  float turn = js.getRightX();   // sağ çubuk: dönüş, sağa artı

  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}
```

Sonuç: Sol çubuğu itince robot ileri gider. Sağ çubuğu sağa yatırınca robot sağa döner.

Toplam 1'i geçebilir. Örneğin tam ileri giderken sağa kırınca sol motora 1'den büyük bir değer gider. `setMotor` bu değeri 255'e sınırlar, motor en çok tam güçte döner.

## Şasiyi bir sınıfa taşı {#drive-base-t}

Şasi bir sınıfta olunca otonom ve öbür kodlar pin ya da formül görmez, yalnız `arcade()` çağırır. Aşağıdaki program [Motoru sür](motoru-sur.md#motor-sinifi) sayfasındaki `motor_t` sınıfını kullanır.

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

class drive_base_t {
public:
  drive_base_t(motor_t& left, motor_t& right) : _left(left), _right(right) {}

  void init() { _left.init(); _right.init(); }
  void stop() { _left.stop(); _right.stop(); }

  // fwd: ileri artı, turn: sağa artı
  void arcade(float fwd, float turn) {
    _left.set(fwd + turn);
    _right.set(fwd - turn);
  }

private:
  motor_t& _left;
  motor_t& _right;
};

motor_t      left_motor(16, 17);
motor_t      right_motor(18, 21, true);   // sağ motor ters monte
drive_base_t drive_base(left_motor, right_motor);

void autonomousInit() { drive_base.init(); }
void autonomousLoop() {}
void autonomousStop() { drive_base.stop(); }   // Stop'ta şasi durur

void teleopInit() { drive_base.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(js.getLeftY(), js.getRightX());
}

void teleopStop() { drive_base.stop(); }       // Stop'ta şasi durur
```

Sonuç: Robot arcade örneğindeki gibi sürülür. Fonksiyonlarda pin numarası kalmaz.

## Mecanum şasiyi sür {#mecanum}

Mecanum tekerlekli şasinin dört motoru vardır. Robot ileri-geri gider, yerinde döner ve yana kayar. Sol çubuk ileri-geri ve yana kaymayı, sağ çubuk dönüşü sürer.

1. Dört motorun pinlerini `motor_t` satırlarına yaz.
2. Ters dönen motorun satırına üçüncü değer olarak `true` ekle.
3. Kodu yükle. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.
4. Robotu önce yalnız ileri, sonra yalnız yana, sonra yalnız dönerek dene.

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

class mecanum_t {
public:
  mecanum_t(motor_t& fl, motor_t& fr, motor_t& bl, motor_t& br)
    : _fl(fl), _fr(fr), _bl(bl), _br(br) {}

  void init() { _fl.init(); _fr.init(); _bl.init(); _br.init(); }
  void stop() { _fl.stop(); _fr.stop(); _bl.stop(); _br.stop(); }

  // fwd: ileri artı, strafe: sağa kayma artı, rotate: sağa dönüş artı
  void drive(float fwd, float strafe, float rotate) {
    float fl = fwd + strafe + rotate;
    float fr = fwd - strafe - rotate;
    float bl = fwd - strafe + rotate;
    float br = fwd + strafe - rotate;

    // En büyük değer 1'i geçerse hepsini aynı oranda küçült, yön korunur
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
motor_t   fl_motor(10, 11);   // ön sol
motor_t   fr_motor(12, 13);   // ön sağ
motor_t   bl_motor(14, 15);   // arka sol
motor_t   br_motor(16, 17);   // arka sağ
mecanum_t mecanum(fl_motor, fr_motor, bl_motor, br_motor);

void autonomousInit() { mecanum.init(); }
void autonomousLoop() {}
void autonomousStop() { mecanum.stop(); }   // Stop'ta dört motor durur

void teleopInit() { mecanum.init(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  mecanum.drive(js.getLeftY(), js.getLeftX(), js.getRightX());
}

void teleopStop() { mecanum.stop(); }       // Stop'ta dört motor durur
```

!!! warning "Dikkat"
    Bu pinler ESP32-S3 içindir; düz ESP32'de GPIO6-11 flash belleğe bağlıdır, kullanma. Dört motor sekiz PWM pini kullanır ve ESP32-S3'ün sekiz LEDC kanalını doldurur; bu şasiye servo eklenemez.

Sonuç: Sol çubuğu ileri itince robot ileri gider, sağa yatırınca sağa kayar. Sağ çubuğu sağa yatırınca robot yerinde sağa döner. Bir hareket ters çıkarsa o harekette yanlış dönen motorun satırına `true` ekle.

Dört motorun toplamı 1'i geçebilir. Kod bu durumda dört değeri de en büyüğüne böler. Böylece motorlar arasındaki oran ve hareketin yönü korunur.

## Sürüşü yumuşat {#yumusat}

Çubuk değerini olduğu gibi motora vermek çalışır ama sürüş sert olur. Aşağıdaki iki yöntem hassas manevrayı kolaylaştırır.

**Değerin küpünü al.** Çubuğun küçük hareketleri motora daha az güç verir, uca doğru güç hızla artar. Çubuk yarıdayken çıkış 0,125 olur. Probot Blocks'taki **hassas güç** bloğu aynı fonksiyonu üretir.

```cpp
// Çubuk değerinin küpü: düşük hızda hassas, yüksekte tam güç (işaret korunur)
float hassasGuc(float x) { return x * x * x; }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_base.arcade(hassasGuc(js.getLeftY()), hassasGuc(js.getRightX()));
}
```

`hassasGuc` fonksiyonunu `teleopLoop()`'un dışına, üstüne yaz.

Daha hafif bir etki için `x * fabsf(x)` kullan. İşaret yine korunur.

**Değişimi sınırla.** Çubuk bir anda tam ileri itilince motora bir anda tam güç gider. Tekerlek patinaj yapar ya da robot sarsılır. Aşağıdaki kod çıkışın bir turda en çok 0,05 değişmesine izin verir.

```cpp
// Hedefe en fazla max_step kadar yaklaş
float slew(float target, float current, float max_step) {
  float diff = constrain(target - current, -max_step, max_step);
  return current + diff;
}

float drive_out = 0.0f;

void teleopStart() { drive_out = 0.0f; }  // her Start'ta sıfırdan başla

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive_out = slew(js.getLeftY(), drive_out, 0.05f);   // tur başına en fazla 0.05
  drive_base.arcade(drive_out, js.getRightX());
}
```

`teleopStart()` **Start**'a basınca bir kez çalışır. Programda henüz yoksa bu satırı ekle; varsa `drive_out = 0.0f;` satırını onun içine yaz.

`max_step` küçüldükçe sürüş yumuşar ama robot geç tepki verir. Değeri robotta deneyerek seç.

## Hangi şasiyi seçmeli {#hangisi}

Çoğu yarışma görevi için tank şasi yeter ve en az sorun çıkarır. Tank ile arcade arasındaki fark yalnız kumanda düzenidir, donanım aynıdır. Yana kayma gerçekten gerekiyorsa mecanum düşün. Mecanum mekanik olarak daha karmaşıktır ve tekerlekler kaymaya daha yatkındır.

## Sorun mu var?

- **Robot ileri yerine dönüyor:** Bir motor ters dönüyor. O motorun ters değerini değiştir. Bkz. [Motorun yönünü düzelt](motoru-sur.md#yon).
- **Robot dönüşte ters tarafa gidiyor:** Arcade formülünde `turn` işaretini değiştir ya da sol ve sağ motorun yerini değiştir.
- **Çubuk bırakılınca robot kayıyor:** Ölü bölgeyi büyüt. Bkz. [Ölü bölgeyi ayarla](kumandayi-oku.md#olu-bolge).

## Sonraki adım

[Servoyu sür](servoyu-sur.md)
