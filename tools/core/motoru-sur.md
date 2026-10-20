# Motoru sür

Bu sayfada BTS7960 tarzı bir motor sürücüye bağlı tek motoru kumandanın sol çubuğuyla sürecek, sonra motor kodunu tekrar kullanılabilir bir sınıfa taşıyacaksın.

## Başlamadan önce

- Motor, bir motor sürücü üzerinden karta bağlı. Kart pini motoru tek başına döndüremez.
- Sürücünün iki PWM girişinin (RPWM ve LPWM) karttaki pin numaralarını biliyorsun. Bu sayfa 16 ve 17'yi kullanır.
- BTS7960 modülünde R_EN ve L_EN pinleri 5V'a (ya da kartın 3,3 V'una) bağlı. Bağlı değilse motor hiç dönmez.
- Kumanda okumayı biliyorsun. Bkz. [Kumanda verisini oku](kumandayi-oku.md).

Motoru koda bağlamadan önce sürücüyü ve motoru tek başına dene. Motor dönmüyorsa sorun koddan önce kabloda ya da sürücüdedir.

Kütüphanede hazır motor sınıfı yoktur. Motor `analogWrite` ile sürülür. Probot Blocks da aynı `setMotor` kodunu üretir.

## Tek motoru kumandayla sür {#tek-motor}

BTS7960 tarzı sürücüde RPWM motoru ileri, LPWM geri döndürür. `analogWrite` pine 0 ile 255 arası bir değer yazar: 0 durur, 255 tam güçtür.

1. Pin numaralarını `MOTOR_RPWM` ve `MOTOR_LPWM` satırlarına yaz.
2. `setMotor` fonksiyonunu programa ekle.
3. `robotInit()` içinde pinleri çıkış yap ve motoru durdur.
4. `robotEnd()` içinde motoru durdur.
5. `teleopLoop()` içinde sol çubuğun değerini `setMotor`'a ver.
6. Kodu yükle, Driver Station'da **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Pinleri kendi kartına göre değiştir
#define MOTOR_RPWM  16
#define MOTOR_LPWM  17

// Motor ters dönüyorsa true yap
#define MOTOR_INVERTED false

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
  setMotor(MOTOR_RPWM, MOTOR_LPWM, 0.0f, false);
}

void robotInit() {
  pinMode(MOTOR_RPWM, OUTPUT);
  pinMode(MOTOR_LPWM, OUTPUT);
  stopMotors();
}

void robotEnd() {
  stopMotors();   // Stop'ta motor güvenli konuma
}

void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Bağlantı koptuğunda kütüphane eksenleri sıfırlar, motor durur
  setMotor(MOTOR_RPWM, MOTOR_LPWM, js.getLeftY(), MOTOR_INVERTED);
}
```

Sonuç: Sol çubuğu ileri itince motor bir yöne, geri çekince ters yöne döner. Çubuğu bırakınca ya da **Stop**'a basınca motor durur.

`setMotor` gücü -1 ile +1 arasında alır. Değeri 255 ile çarpıp en çok 255'e sınırlar. -0,02 ile +0,02 arasındaki güçte iki pine de 0 yazar.

Robotta birden fazla motor varsa şasiye geçmeden önce her motoru bu kodla tek tek dene.

## Motorun yönünü düzelt {#yon}

Çubuğu ileri ittiğinde motor geri dönüyorsa kabloları değiştirmen gerekmez.

1. `#define MOTOR_INVERTED false` satırını bul.
2. `false` yerine `true` yaz.
3. Kodu yeniden yükle.

Sonuç: Sol çubuğu ileri itince motor öbür yöne döner.

## Başka bir sürücü kullan {#baska-surucu}

L298N ya da TB6612 gibi sürücülerde bir PWM ve bir yön (DIR) pini vardır. Bu sürücülerde `setMotor` içindeki `analogWrite` satırlarını kendi sürücüne göre değiştir: hızı PWM pinine `analogWrite` ile, yönü DIR pinine `digitalWrite` ile yaz.

## Motoru bir sınıfa taşı {#motor-sinifi}

Motor kodunu bir sınıfa almak pin numaralarını tek yerde toplar. Şasi ve mekanizma kodu motoru bu sınıf üzerinden kullanır. Sınıf adları `_t` ile biter.

```cpp
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

motor_t motor(16, 17);   // ters dönüyorsa: motor(16, 17, true)
```

Sınıfı `setMotor` fonksiyonunun altına yaz. Fonksiyonlarda şöyle kullan:

```cpp
void robotInit() { motor.init(); }
void robotEnd()  { motor.stop(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  motor.set(js.getLeftY());
}
```

## Sorun mu var?

- **Motor hiç dönmüyor:** Sürücüyü ve motoru koddan bağımsız dene. Pin numaralarını kontrol et. Kumanda değerlerini [Kumanda verisini oku](kumandayi-oku.md#kumandayi-oku) sayfasındaki kodla gör.
- **Stop'tan sonra motor dönmeye devam ediyor:** `robotEnd()` içinde `stopMotors()` yok. Bkz. [Motorları Stop'ta durdur](hooklari-yaz.md#robotend).
- **Çubuk bırakılınca motor yavaşça dönüyor:** Ölü bölgeyi büyüt. Bkz. [Ölü bölgeyi ayarla](kumandayi-oku.md#olu-bolge).

## Sonraki adım

[Şasiyi sür](sasiyi-sur.md)
