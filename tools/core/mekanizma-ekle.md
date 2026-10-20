# Mekanizma ekle

Bu sayfada konveyör, limit switch'li kol ve slider gibi mekanizmaları ayrı sınıflar olarak yazıp sürüş koduyla birlikte kumandaya bağlayacaksın.

## Başlamadan önce

- Şasi kumandayla sürülüyor ve `drive_base_t` sınıfı hazır. Bkz. [Şasiyi sür](sasiyi-sur.md#drive-base-t).
- Her mekanizmanın motorunu ya da rölesini önce tek başına denedin. Bkz. [Motoru sür](motoru-sur.md#tek-motor).

Mekanizmaları birer birer ekle. Biri çalışınca sıradakine geç. Her adımda robot sahaya çıkabilecek durumda kalsın.

## Her mekanizmayı bir sınıf yap {#alt-sistem}

Robot büyüdükçe bütün kodu `teleopLoop()` içine yazmak işi zorlaştırır. Her mekanizmayı (şasi, kol, slider, tutucu) ayrı bir sınıf olarak yaz. Bu sınıflara alt sistem denir. Hepsi aynı düzende olur:

| Fonksiyon | Ne yapar | Nereden çağrılır |
|---|---|---|
| `init()` | Pinleri ayarlar, mekanizmayı durdurur | `robotInit()` |
| `up()`, `run()` gibi | Mekanizmaya bir iş yaptırır | `teleopLoop()`, `autonomousLoop()` |
| `stop()` | Mekanizmayı güvenli konuma alır | `robotEnd()` |
| `periodic()` (gerekirse) | Her turda süreyi ya da sensörü kontrol eder | `teleopLoop()`, `autonomousLoop()` |

Böylece loop fonksiyonu yalnız kumandayı mekanizmalara bağlar. Pin ve sensör ayrıntısı sınıfın içinde kalır. Otonom da aynı fonksiyonları çağırır.

## Konveyörü düğmeyle çalıştır {#konveyor}

Bu örnek konveyörün bir röleyle ya da tek yönde tam hızda dönen bir sürücüyle çalıştığını varsayar. Bu yüzden hız yoktur, yalnız aç ve kapat vardır. Konveyör BTS7960'a bağlıysa ve hız gerekiyorsa `motor_t` kullan.

1. `conveyor_t` sınıfını programa ekle ve pinini yaz.
2. `robotInit()` içinde `conveyor.init()`, `robotEnd()` içinde `conveyor.stop()` çağır.
3. `teleopLoop()` içinde **RB** basılıyken `conveyor.run()`, değilken `conveyor.stop()` çağır.

```cpp
class conveyor_t {
public:
  conveyor_t(uint8_t pin) : _pin(pin) {}

  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }

private:
  uint8_t _pin;
};

conveyor_t conveyor(5);   // röle ya da sürücü pini
```

Sonuç: **RB** basılıyken konveyör döner, bırakınca durur. **Stop**'a basınca da durur.

## Kolu limit switch ile sınırla {#kol}

İki yönde hareket eden bir kolun iki ucuna limit switch konur. Switch'e basılınca motor o yönde durur. Switch olmazsa motor kolu mekanik sınırına zorlar ve hasar verir.

Limit switch'in bir ucu karttaki pine, öbür ucu GND'ye bağlanır. `INPUT_PULLUP` pini normalde `HIGH` tutar. Switch'e basılınca pin GND'ye bağlanır ve `LOW` okunur. Ayrı bir direnç gerekmez.

1. `arm_t` sınıfını programa ekle. Sınıf [Motoru sür](motoru-sur.md#tek-motor) sayfasındaki `setMotor` fonksiyonunu kullanır.
2. Motor pinlerini ve iki switch pinini yaz.
3. `teleopLoop()` içinde **LB** ile `arm.up()`, **A** ile `arm.down()` çağır. İkisi de basılı değilse `arm.stop()` çağır.

```cpp
class arm_t {
public:
  arm_t(uint8_t rpwm, uint8_t lpwm, uint8_t limit_top, uint8_t limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // Switch basılıysa (LOW) o yöne gitme
  void up(float power = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, power, false);
  }

  void down(float power = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, -power, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm, _limit_top, _limit_bottom;
};

arm_t arm(12, 13, 14, 15);   // motor RPWM, LPWM, üst switch, alt switch
```

Sonuç: **LB** basılıyken kol yukarı, **A** basılıyken aşağı gider. Üst switch'e değince kol yukarı gitmez, alt switch'e değince aşağı gitmez.

Slider (doğrusal kızak) da aynı sınıfla sürülür. Switch'leri kızağın iki ucuna koy.

Bu en basit kol düzenidir. Yük altında konum tutan kollarda geri beslemeli kontrol gerekir.

## Slider'ı süreyle sür {#slider-sure}

Limit switch yoksa konumu süreyle tahmin edersin. Bir düğmeye basınca slider sabit süre boyunca hareket eder. `periodic()` her turda süreyi kontrol eder ve süre dolunca durdurur. Loop beklemez.

```cpp
class timed_slider_t {
public:
  timed_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }

  void raise() { _start( 0.8f, 1200); }   // 1.2 sn yukarı
  void lower() { _start(-0.8f, 1200); }   // 1.2 sn aşağı

  // Her turda çağır: süre dolunca durdurur
  void periodic() {
    if (_running && millis() - _t0 >= _dur) stop();
  }

  void stop() { _running = false; setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  void _start(float power, uint32_t dur) {
    _t0 = millis(); _dur = dur; _running = true;
    setMotor(_rpwm, _lpwm, power, false);
  }

  uint8_t  _rpwm, _lpwm;
  bool     _running = false;
  uint32_t _t0 = 0, _dur = 0;
};

timed_slider_t slider(12, 13);

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  if (js.getY()) slider.raise();
  if (js.getX()) slider.lower();
  slider.periodic();   // süreyi her turda kontrol et
}
```

Sonuç: **Y**'ye basınca slider 1,2 saniye yukarı, **X**'e basınca 1,2 saniye aşağı gider ve durur.

!!! warning "Dikkat"
    Süreyle sürmek mekanizmanın ucunu korumaz. Süreyi slider'ın ucuna çarpmayacağı kadar kısa seç ve önce düşük güçte dene.

## Encoder ile hedefe git {#encoder-sablonu}

Encoder, mekanizmanın gerçek konumunu sayı olarak verir. Hedef konum ile şimdiki konum arasındaki farka göre motora güç verilirse mekanizma hedefe gider. Bu geri besleme döngüsüne PID denir.

Probot kütüphanesi encoder okuma ya da PID sağlamaz. Aşağıdaki sınıf yalnız bir başlangıç şablonudur. `readEncoder()` fonksiyonunu kendi encoder'ına göre yazman ve `_kp` değerini robotta ayarlaman gerekir.

```cpp
class pid_slider_t {
public:
  pid_slider_t(uint8_t rpwm, uint8_t lpwm) : _rpwm(rpwm), _lpwm(lpwm) {}

  void init() { pinMode(_rpwm, OUTPUT); pinMode(_lpwm, OUTPUT); stop(); }
  void setTarget(long ticks) { _target = ticks; }

  // Her turda çağır: hedefe doğru güç verir
  void periodic() {
    long  pos   = readEncoder();
    float error = (float)(_target - pos);
    float out   = constrain(_kp * error, -1.0f, 1.0f);   // yalnız P; ki ve kd eklenebilir
    setMotor(_rpwm, _lpwm, out, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  long readEncoder() { return 0; }   // TODO: encoder sayısını döndür

  uint8_t _rpwm, _lpwm;
  long    _target = 0;
  float   _kp = 0.0f;                // önce yalnız kp'yi küçük adımlarla artır
};
```

`_kp`'yi 0'dan başlat ve slider hedefe doğru hareket edene kadar küçük adımlarla artır. Hedefin çevresinde gidip geliyorsa değer büyüktür. Çok yavaş yaklaşıyorsa değer küçüktür.

## Mekanizmaları birlikte kullan {#birlikte}

Aşağıdaki program tank şasiyi, konveyörü ve kolu bir arada sürer. Her sınıfın `init()` fonksiyonu `robotInit()`'ten, `stop()` fonksiyonu `robotEnd()`'den çağrılır.

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

class conveyor_t {
public:
  conveyor_t(uint8_t pin) : _pin(pin) {}

  void init() { pinMode(_pin, OUTPUT); stop(); }
  void run()  { digitalWrite(_pin, HIGH); }
  void stop() { digitalWrite(_pin, LOW); }

private:
  uint8_t _pin;
};

class arm_t {
public:
  arm_t(uint8_t rpwm, uint8_t lpwm, uint8_t limit_top, uint8_t limit_bottom)
    : _rpwm(rpwm), _lpwm(lpwm), _limit_top(limit_top), _limit_bottom(limit_bottom) {}

  void init() {
    pinMode(_rpwm, OUTPUT);            pinMode(_lpwm, OUTPUT);
    pinMode(_limit_top, INPUT_PULLUP); pinMode(_limit_bottom, INPUT_PULLUP);
    stop();
  }

  // Switch basılıysa (LOW) o yöne gitme
  void up(float power = 0.8f) {
    if (digitalRead(_limit_top) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, power, false);
  }

  void down(float power = 0.8f) {
    if (digitalRead(_limit_bottom) == LOW) { stop(); return; }
    setMotor(_rpwm, _lpwm, -power, false);
  }

  void stop() { setMotor(_rpwm, _lpwm, 0.0f, false); }

private:
  uint8_t _rpwm, _lpwm, _limit_top, _limit_bottom;
};

// Pinleri kendi kartına göre değiştir
motor_t      left_motor(16, 17);
motor_t      right_motor(18, 21, true);   // sağ motor ters monte
drive_base_t drive_base(left_motor, right_motor);
conveyor_t   conveyor(5);
arm_t        arm(12, 13, 14, 15);

void robotInit() {
  drive_base.init();
  conveyor.init();
  arm.init();
}

void robotEnd() {   // Stop'ta her şey güvenli konuma
  drive_base.stop();
  conveyor.stop();
  arm.stop();
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  drive_base.arcade(js.getLeftY(), js.getRightX());

  if (js.getRB()) conveyor.run(); else conveyor.stop();

  if      (js.getLB()) arm.up();
  else if (js.getA())  arm.down();
  else                 arm.stop();
}
```

Sonuç: Robot çubuklarla sürülür, **RB** konveyörü, **LB** ve **A** kolu çalıştırır. **Stop**'a basınca şasi, konveyör ve kol birlikte durur.

Tutucu eklemek için [Servoyu sür](servoyu-sur.md#gripper) sayfasındaki `gripper_t` sınıfını kullan. Otonomu ve tam robotu [Örnek robotu baştan sona kodla](ornek-robotu-kodla.md) sayfasında bulursun.

## Sorun mu var?

- **Kol üst switch'e değince durmuyor:** Switch pinleri yer değiştirmiş olabilir. `arm_t` satırında üst ve alt switch pinlerinin yerini değiştir.
- **Kol bir yöne hiç gitmiyor:** O yöndeki switch hep basılı okunuyor olabilir. Switch kablosunu ve pin numarasını kontrol et. Değeri görmek için `probot::printf("ust=%d\n", digitalRead(14));` gibi bir satırla **Telemetry** paneline yaz.
- **Stop'tan sonra bir mekanizma çalışmaya devam ediyor:** O mekanizmanın `stop()` çağrısı `robotEnd()` içinde yok.

## Sonraki adım

[Otonomu yaz](otonom-yaz.md)
