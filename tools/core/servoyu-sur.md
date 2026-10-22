# Servoyu sür

Bu sayfada bir hobi servosunu ESP32'nin LEDC donanımıyla titremeden sürecek, kumandayla açısını değiştirecek ve aşamalı bir tutucu (gripper) kuracaksın.

## Başlamadan önce

- Servonun sinyal kablosu karttaki bir pine bağlı. Bu sayfa 4 numaralı pini kullanır.
- Servo ayrı bir 5-6 V kaynaktan besleniyor. Bkz. [Servoyu ayrı kaynaktan besle](#guc).
- Kumanda okumayı biliyorsun. Bkz. [Kumanda verisini oku](kumandayi-oku.md).

Kütüphanede servo sınıfı yoktur. Eski sürümlerdeki `probot::devices::Servo` sınıfı kaldırıldı; onu kullanan kod derlenmez. Servo, ESP32'nin LEDC donanımıyla doğrudan sürülür. Probot Blocks'taki **servo tanımla** bloğu da aynı satırları üretir, ama 0.3.0 kodu olarak `robotInit()` içine koyar; 0.4.0'da bu satırlar init fonksiyonlarına gider ([0.3.0 kodunu taşı](hooklari-yaz.md#gecis)).

## Servoyu kumandayla sür {#servo-kumanda}

Servo 50 Hz sinyal bekler: her 20 ms'de bir darbe gelir. Darbenin genişliği açıyı belirler. Bu sayfadaki kod 0 ile 180 dereceyi 500 ile 2500 µs arası darbeye çevirir.

1. `setupServo()` içinde `ledcAttachChannel(SERVO_PIN, 50, 14, 7)` satırını yaz. Bu fonksiyonu iki init fonksiyonundan çağır.
2. `servoAngle` fonksiyonunu programa ekle.
3. `teleopLoop()` içinde çubuk değerini açıya çevir ve `servoAngle`'a ver.
4. `stopServo()` içinde `ledcWrite(SERVO_PIN, 0)` ile darbeyi kes. Bu fonksiyonu iki stop fonksiyonundan çağır.
5. Kodu yükle. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

#define SERVO_PIN      4
#define SERVO_LEDC_CH  7   // yüksek kanal: en çok 7 motor PWM pini varken çakışmaz

// Hobi servosunu 0-180 dereceye götürür (50 Hz / 14-bit LEDC)
void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
  deg = constrain(deg, 0.0f, 180.0f);
  uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
  ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

// Init'te çalışır: 50 Hz, 14-bit, sabit kanal.
// İlk yazmaya kadar darbe yok: servo Init'te kıpırdamaz
void setupServo() {
  ledcAttachChannel(SERVO_PIN, 50, 14, SERVO_LEDC_CH);
}

void stopServo() {
  ledcWrite(SERVO_PIN, 0);   // darbeyi kes, güvenli durum
}

void autonomousInit() { setupServo(); }
void autonomousLoop() {}
void autonomousStop() { stopServo(); }

void teleopInit() { setupServo(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  float angle = (js.getLeftY() + 1.0f) * 90.0f;   // -1..+1 -> 0-180
  if (js.getA()) angle = 90.0f;                    // A ortalar
  servoAngle(SERVO_PIN, angle);

  probot::clearTelemetry();
  probot::printf("Servo: %.0f derece\n", angle);
}

void teleopStop() { stopServo(); }
```

Sonuç: **Init**'ten sonra servo kıpırdamaz. **Start**'tan sonra sol çubuk ortadayken servo 90 dereceye gider ve **Telemetry** panelinde "Servo: 90 derece" yazar. Çubuğu tam ileri itince servo 180, tam geri çekince 0 dereceye döner.

Koddaki sayılar:

- `ledcAttachChannel(pin, 50, 14, 7)`: 50 Hz, 14 bit çözünürlük, 7 numaralı kanal.
- 14 bitte en büyük değer 16383'tür ve 20 ms'lik bir çerçeveye karşılık gelir.
- `us * 16383 / 20000`, mikrosaniyeyi bu değere çevirir.

`analogWrite` yaklaşık 1 kHz sinyal üretir, servoya uymaz. Servoya yüksek bir kanal (7) verilir. Motorların `analogWrite`'ı kanalları alttan (0, 1, 2) kullanır, böylece servo ile motorlar aynı zamanlayıcıya düşmez.

Init fonksiyonları her **Init**'te yeniden çalışır. Kanal sabit olduğu için `ledcAttachChannel` tekrar çağrılınca yeni kanal harcanmaz.

## Düğmeyle belirli açıya götür {#sabit-aci}

Servoyu çubuk yerine düğmelerle iki sabit açıya götürmek için `teleopLoop()`'u şöyle yaz:

```cpp
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  if (js.getA())      servoAngle(SERVO_PIN, 0.0f);     // A: 0 derece
  else if (js.getB()) servoAngle(SERVO_PIN, 180.0f);   // B: 180 derece
}
```

Sonuç: **A**'ya basınca servo 0, **B**'ye basınca 180 dereceye gider. Düğmeyi bırakınca servo olduğu yerde kalır.

## Tutucuyu aşamalarla aç ve kapat {#gripper}

Tutucunun birkaç sabit konumu olur: kapalı, yarı açık, tam açık. Açıları bir listede tutup D-pad ile bu konumlar arasında geçmek, çubukla sürmekten daha kesindir.

1. Açıları `GRIPPER_STAGES` listesine yaz.
2. Init fonksiyonlarında `gripper.init()`, `teleopStart()` içinde `gripper.start()` çağır. Tutucu **Start**'ta listedeki ilk konuma gider.
3. `teleopLoop()` içinde `gripper.update(js.getDpadUp(), js.getDpadDown())` çağır.
4. Stop fonksiyonlarında `gripper.release()` çağır.
5. Kodu yükle. **Teleoperated** seçiliyken **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

// Hobi servosunu 0-180 dereceye götürür (50 Hz / 14-bit LEDC)
void servoAngle(uint8_t pin, float deg, uint16_t minUs = 500, uint16_t maxUs = 2500) {
  deg = constrain(deg, 0.0f, 180.0f);
  uint16_t us = minUs + (uint16_t)(deg / 180.0f * (maxUs - minUs));
  ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

class gripper_t {
public:
  gripper_t(uint8_t pin, uint8_t channel, const float* stages, int stage_count)
    : _pin(pin), _channel(channel), _stages(stages), _count(stage_count) {}

  // Init: kanalı kurar, darbe yok (Init'te tutucu kıpırdamaz)
  void init() {
    ledcAttachChannel(_pin, 50, 14, _channel);   // 50 Hz, 14-bit
  }

  // Start: listedeki ilk konuma gider
  void start() {
    _cursor = 0;
    _apply();
  }

  // Düğmeye basıldığı anda bir kez çalışır, basılı tutunca tekrarlamaz
  void update(bool up, bool down) {
    if (up   && !_prev_up   && _cursor < _count - 1) { _cursor++; _apply(); }
    if (down && !_prev_down && _cursor > 0)          { _cursor--; _apply(); }
    _prev_up   = up;
    _prev_down = down;
  }

  void release() { ledcWrite(_pin, 0); }   // darbeyi kes, servo serbest

private:
  void _apply() { servoAngle(_pin, _stages[_cursor]); }

  uint8_t      _pin, _channel;
  const float* _stages;
  int          _count;
  int          _cursor = 0;
  bool         _prev_up = false, _prev_down = false;
};

const float GRIPPER_STAGES[] = { 0.0f, 45.0f, 130.0f };   // kapalı, yarı açık, açık
gripper_t   gripper(4, 7, GRIPPER_STAGES, 3);              // pin 4, kanal 7

void autonomousInit() { gripper.init(); }
void autonomousLoop() {}
void autonomousStop() { gripper.release(); }

void teleopInit()  { gripper.init(); }
void teleopStart() { gripper.start(); }   // Start'ta ilk konuma

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  gripper.update(js.getDpadUp(), js.getDpadDown());
}

void teleopStop() { gripper.release(); }   // Stop'ta servo serbest
```

Sonuç: **Init**'e basınca tutucu kıpırdamaz. **Start**'a basınca 0 dereceye gider. **D-pad yukarı**'ya her basışta bir sonraki açıya (45, sonra 130), **D-pad aşağı**'ya her basışta bir öncekine geçer.

`update` önceki turdaki düğme değerini saklar. Düğme yalnız basılmadığı turdan basıldığı tura geçerken iş yapar. Bu yüzden düğmeyi basılı tutmak tutucuyu sona kadar götürmez.

## İkinci servo ekle {#ikinci-servo}

Her servoya ayrı bir pin ve ayrı bir yüksek kanal ver. Örneğin ikinci servo için 5 numaralı pin ve 6 numaralı kanalı kullan:

```cpp
ledcAttachChannel(5, 50, 14, 6);   // ikinci servo: pin 5, kanal 6
```

## Servoyu ayrı kaynaktan besle {#guc}

!!! warning "Dikkat"
    Servoyu kartın 5V ya da 3V3 pininden besleme. Bu pinler servonun çektiği akımı veremez ve servo seğirir.

Servoya ayrı bir 5-6 V kaynak (BEC ya da UBEC) bağla. Sinyal kablosu karttaki pine, artı ve eksi kabloları kaynağa gider. Kaynağın GND'si ile kartın GND'sini birbirine bağla.

PCA9685 gibi bir servo kartı kullanıyorsan PWM frekansını 50 Hz yap. 1 kHz'te servo darbesi üretilemez.

## Sorun mu var?

- **Servo titriyor:** Servonun kanalı motorlarla aynı zamanlayıcıya düşmüş olabilir. Servoya 7 gibi yüksek bir kanal ver. Servonun beslemesini kontrol et: [Servoyu ayrı kaynaktan besle](#guc).
- **Servo hiç hareket etmiyor:** `ledcAttachChannel` satırı init fonksiyonlarında mı bak. Servo **Start**'tan önce hareket etmez; **Init**'ten sonra **Start**'a bas.
- **Derlemede `probot::devices::Servo` satırında hata çıkıyor:** Bu sınıf kaldırıldı. Servoyu bu sayfadaki LEDC koduyla sür.
- **Servo uçlarda zorlanıyor ya da tam dönmüyor:** `servoAngle` çağrısına `minUs` ve `maxUs` ver ve aralığı 500 ile 2500 arasında daralt. Örnek: `servoAngle(SERVO_PIN, angle, 600, 2400);`

## Sonraki adım

[Mekanizma ekle](mekanizma-ekle.md)
