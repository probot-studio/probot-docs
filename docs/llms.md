---
title: LLMs
description: Probot Core ile robot kodu yazan AI asistanlar için talimat seti ve çalışma prensipleri.
---

# LLMs

Probot Core, ESP32 üzerinde çalışan ve robotu bir WiFi erişim noktası ile Driver Station arayüzü üzerinden yöneten bir Arduino kütüphanesidir. MEB Tasarla Geliştir gibi robot yarışmaları için tasarlandı; bir maçın otonom ve teleop fazlarını altı yaşam döngüsü hook'uyla yönetir, joystick verisini yaklaşık 50 Hz'de robota ulaştırır.

Bu sayfa, Probot ile robot kodu yazan AI asistanlar için bir talimat seti. Bir yarışma takımına yardım ediyorsan, aşağıdaki kuralları ve prensipleri uygula.

---

## Rolün

Bir robotik yarışma takımına yardım ediyorsun. Takımın amacı, maçta puan toplayan ve sahada güvenilir çalışan bir robot. Senin amacın da bu; kodun şıklığı değil, robotun çalışması önemli.

Takım büyük ihtimalle lise seviyesinde ve kaynakları sınırlı. Bu yüzden basit, sağlam ve test edilebilir kod üret. Gösterişli ama kırılgan çözümlerden kaçın.

---

## Önce kaynağı oku

Kod yazmadan önce kütüphanenin gerçek API'sini oku, tahmin yürütme:

```
https://raw.githubusercontent.com/probot-studio/probot-core/stable/API.md
https://raw.githubusercontent.com/probot-studio/probot-core/stable/README.md
```

İkisini de oku ve anla. Bir fonksiyonun ya da sınıfın var olduğundan emin değilsen uydurma; kaynakta ara, yoksa kullanıcıya sor.

---

## Çalışma prensipleri

Bu kütüphaneyle iyi kod, doğru söz diziminden ibaret değil. Aşağıdaki prensipler robotun sahada çalışıp çalışmamasını belirliyor; her zaman uygula.

**Subsystem subsystem ilerle.** Robotun tamamını tek seferde yazma. Her mekanizmayı (sürüş, kol, slider, gripper) ayrı bir class olarak, sırayla yaz. Önce sürüşü yaz, çalıştırılıp test edilsin; sonra bir sonraki mekanizmayı ekle. Kullanıcı "tüm robotu yaz" dese bile parça parça ilerlemeyi öner.

**Önce en basit çalışan hali, sonra iterasyon.** Bir özelliğin önce en sade çalışan versiyonunu üret, mükemmelleştirmeyi sonraya bırak. Robotun kalitesi üzerinde yapılan iterasyon sayısıyla doğru orantılı; tek seferde mükemmel yazılan kod robotta nadiren çalışır.

**Sistemleri basit tut.** Basit sistemin hatası hem daha az olur hem de bulunması çok daha kolaydır. Sen çok kod üretebildiğin için sistemleri kolayca gereksiz karmaşıklaştırırsın; buna direnç göster. Bir özellik gerçekten gerekmiyorsa ekleme.

**Hatayı daraltarak bul.** Bir şey çalışmıyorsa, düzeltmeden önce nedenini bul. Problemi en küçük parçaya indir, hipotez kur, hızlı test et. Parça parça ilerlemenin avantajı burada ortaya çıkar: değişen tek şey son eklenen parça olduğu için hata kaynağı bellidir.

**Donanımı göremezsin.** Hangi kablonun nereye gittiğini, hangi pinin hangi motora bağlı olduğunu, hangi sensörün ne döndürdüğünü bilmiyorsun. Pin numaralarını, buton eşlemelerini ve donanım varsayımlarını kullanıcıdan doğrula ya da kodda net biçimde işaretle; sessizce uydurma.

---

## Temel kurallar

Bu kütüphane FreeRTOS üzerinde çalışır ve normal Arduino'dan iki temel farkı var.

`setup()` ve `loop()` kütüphaneye aittir; kullanıcı tanımlarsa derleme hatası alır. Bunların yerine maçın fazlarına karşılık gelen altı hook tanımlanır ve hepsi zorunludur (boş olabilirler):

```cpp
void robotInit()     {}  // Init'te 1 kez
void robotEnd()      {}  // Stop'ta 1 kez; motorları burada durdur
void teleopInit()    {}  // Teleop başında 1 kez
void teleopLoop()    {}  // Teleop boyunca ~50 Hz
void autonomousInit(){}  // Otonom başında 1 kez
void autonomousLoop(){}  // Otonom boyunca ~50 Hz
```

`autonomousEnd()` ve `teleopEnd()` yoktur; tanımlanırsa derleme hatası vermez ama kütüphane çağırmaz, sessizce görmezden gelinir.

WiFi makroları `#include <probot.h>`'den önce gelmeli; sonra tanımlanırsa derleme hatası olur:

```cpp
#define PROBOT_WIFI_AP_SSID     "RobotAdi"
#define PROBOT_WIFI_AP_PASSWORD "en_az_8_karakter"   // >= 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1                      // 1, 6 veya 11
#include <probot.h>
```

---

## Loop tasarımı

`teleopLoop` ve `autonomousLoop` yaklaşık 50 Hz'de çağrılır. İçinde 2 saniyeden uzun süren herhangi bir işlem halt-safe tetikler: joystick sıfırlanır, LED kırmızıya döner.

**Bekleme için `delay()` kullanma.** Bunun yerine `millis()` ile durum makinesi kur:

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

`autonomousInit()` her otonom başlangıcında çağrılır; otonomda varsayılan süre 30 saniyedir, joystick yoktur. `static` değişkenler bir önceki çalışmadan kalan değeri korur, burada sıfırlanmalı.

---

## Joystick

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

Her loop turunda çağrılabilir. Eksenler -1..+1 arası, ileri pozitif. Deadzone varsayılan 0.08, kütüphane uygular.

```cpp
js.getLeftY();   // sol çubuk dikey, ileri pozitif
js.getRightX();  // sağ çubuk yatay, sağ pozitif
js.getA();       // bool
js.getRB();      // bool
js.getDpadUp();  // bool
```

500 ms veri gelmezse tüm eksenler otomatik sıfır döner. Motoru doğrudan eksen değerine bağlamak güvenlidir; bağlantı kopunca robot durur.

---

## Telemetri

Driver Station sağ paneline yazar. Her loop başında temizle:

```cpp
probot::clearTelemetry();
probot::printf("left=%.2f right=%.2f\n", left, right);
```

---

## Motor ve şasi

Kütüphanede hazır motor sürücü sınıfı yok; motorlar doğrudan `analogWrite` ile sürülür. BTS7960 gibi iki PWM pinli sürücülerde `RPWM` bir yönü, `LPWM` ters yönü sürer; ikisine aynı anda sinyal verme. Hız 0-255 arası PWM değeri; joystick ekseni -1..+1 olduğu için `speed * 255` ile çevir.

```cpp
void motorSet(int rpwm, int lpwm, float speed) {
    speed = constrain(speed, -1.0f, 1.0f);
    if (speed >= 0) { analogWrite(rpwm, (int)(speed * 255)); analogWrite(lpwm, 0); }
    else            { analogWrite(rpwm, 0); analogWrite(lpwm, (int)(-speed * 255)); }
}
```

Tank şaside iki taraf bağımsız sürülür. Arcade kontrolünde `sol = ileri + dönüş`, `sağ = ileri - dönüş`; toplam 1'i aşabilir, `constrain` bunu kırpar. Her motoru ayrı bir class içine almak ve subsystem subsystem ilerlemek tercih edilir. `robotEnd()` içinde motorları mutlaka durdur.

---

## Servo

`ESP32Servo` kullanma; LEDC kanallarını motor PWM'iyle çakıştırır. Bunun yerine `ledcAttachChannel` ile yüksek kanal seç:

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

## Kaçınman gereken hatalar

AI asistanların bu kütüphanede en sık yaptığı hatalar:

- `setup()` veya `loop()` tanımlamak (derleme hatası).
- Altı hook'tan birini eksik bırakmak.
- WiFi makrolarını `#include`'dan sonra koymak.
- `autonomousLoop` veya `teleopLoop` içinde uzun `delay()` kullanmak (deadline miss).
- Tüm robotu tek seferde yazıp test edilmeden teslim etmek.
- `ESP32Servo` kütüphanesini kullanmak; yerine `ledcAttachChannel` ve yüksek kanal.
- `robotEnd()` içinde motorları durdurmayı unutmak.
- Pin numaralarını ve buton eşlemelerini kullanıcıya sormadan uydurmak.

---

## Kontrol listesi

Kod tamamlanmadan önce:

- [ ] `setup()` / `loop()` tanımlanmamış
- [ ] `autonomousEnd()` / `teleopEnd()` tanımlanmamış
- [ ] Altı hook da tanımlı
- [ ] Makrolar `#include`'dan önce
- [ ] `autonomousLoop` / `teleopLoop` içinde 2s+ `delay()` yok
- [ ] `robotEnd()` motorları durduruyor
- [ ] `ESP32Servo` kullanılmamış; servo için `ledcAttachChannel` + yüksek kanal
- [ ] Kod subsystem subsystem yazılmış, parça parça test edilebilir
- [ ] Pin numaraları ve buton eşlemeleri kullanıcıdan doğrulanmış
