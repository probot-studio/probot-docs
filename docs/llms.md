---
title: LLMs
---

# LLMs

Bu sayfa AI asistanlar için yazıldı.

---

## Kütüphaneyi Anlamak

Kod yazmadan önce kaynağı oku:

```
https://raw.githubusercontent.com/probot-studio/probot-core/stable/API.md
https://raw.githubusercontent.com/probot-studio/probot-core/stable/README.md
```

İkisini oku ve anla. Sonra kod yaz. Tahmin yürütme.

---

## Temel Tasarım

Bu kütüphane FreeRTOS üzerinde çalışır. `setup()` ve `loop()` kütüphanenin kendisine ait; kullanıcı tanımlarsa derleme hatası alır. Bunların yerine altı hook tanımlanır ve hepsi zorunludur:

```cpp
void robotInit()     {}
void robotEnd()      {}
void teleopInit()    {}
void teleopLoop()    {}
void autonomousInit(){}
void autonomousLoop(){}
```

`autonomousEnd()` ve `teleopEnd()` yok; tanımlanırsa kütüphane tarafından çağrılmaz, sessizce görmezden gelinir.

WiFi makroları `#include <probot.h>`'den önce gelmeli:

```cpp
#define PROBOT_WIFI_AP_SSID     "RobotAdi"
#define PROBOT_WIFI_AP_PASSWORD "en_az_8_karakter"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>
```

---

## Loop Tasarımı

`teleopLoop` ve `autonomousLoop` yaklaşık 50 Hz'de çağrılır. İçinde 2 saniyeden uzun süren herhangi bir işlem halt-safe tetikler: joystick sıfırlanır, LED kırmızıya döner.

**Bekleme için `delay()` kullanılmaz.** Bunun yerine `millis()` ile durum makinesi kurulur:

```cpp
enum class Phase { FORWARD, STOP };
static Phase phase = Phase::FORWARD;
static uint32_t t0;

void autonomousInit() {
    phase = Phase::FORWARD;
    t0  = millis();
}

void autonomousLoop() {
    switch (phase) {
        case Phase::FORWARD:
            // motorları sür
            if (millis() - t0 > 2000) phase = Phase::STOP;
            break;
        case Phase::STOP:
            // motorları durdur
            break;
    }
    delay(20);
}
```

`autonomousInit()` her otonom başlangıcında çağrılır. `static` değişkenler bir önceki çalışmadan kalan değeri korur; burada sıfırlanmalı.

---

## Joystick

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

Her loop turunda çağrılabilir. Eksenler -1..+1, ileri pozitif. Deadzone varsayılan 0.08, kütüphane uygular.

```cpp
js.getLeftY();   // sol çubuk dikey
js.getRightY();  // sağ çubuk dikey
js.getA();       // bool
```

500 ms veri gelmezse eksenler otomatik sıfır döner. Motoru doğrudan eksen değerine bağlamak güvenlidir.

---

## Telemetri

Driver Station sağ paneline yazar. Her loop başında temizle:

```cpp
probot::clearTelemetry();
probot::printf("left=%.2f right=%.2f\n", left, right);
```

---

## Motor Kontrolü

Kütüphanede hazır motor sürücü sınıfı yok; motorlar doğrudan `analogWrite` ile sürülür. BTS7960 gibi iki PWM pinli sürücülerde bir pin (`RPWM`) bir yönü, diğeri (`LPWM`) ters yönü sürer; ikisine aynı anda sinyal verilmez.

`robotEnd()` içinde mutlaka motorları durdur; yoksa Stop sonrası motorlar dönmeye devam eder.

---

## Servo

`ESP32Servo` kullanılmaz; LEDC kanallarını motor PWM'iyle çakıştırır. Bunun yerine `ledcAttachChannel` ile yüksek kanal seç:

```cpp
const uint8_t SERVO_PIN = 4;

void servoAngle(uint8_t pin, float deg) {
    deg = constrain(deg, 0.0f, 180.0f);
    uint16_t us = 500 + (uint16_t)(deg / 180.0f * 2000);
    ledcWrite(pin, (uint32_t)us * 16383 / 20000);
}

void robotInit() {
    ledcAttachChannel(SERVO_PIN, 50, 14, 7);  // kanal 7: motorlarla çakışmaz
}

void teleopLoop() { servoAngle(SERVO_PIN, 90.0f); }
```

---

## Kontrol Listesi

Kod tamamlanmadan önce:

- [ ] `setup()` / `loop()` tanımlanmamış
- [ ] `autonomousEnd()` / `teleopEnd()` tanımlanmamış
- [ ] Altı hook da tanımlı
- [ ] Makrolar `#include`'dan önce
- [ ] `autonomousLoop` içinde 2s+ `delay()` yok
- [ ] `robotEnd()` motorları durduruyor
- [ ] `ESP32Servo` kullanılmamış; servo için `ledcAttachChannel` + yüksek kanal
