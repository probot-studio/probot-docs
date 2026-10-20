# Maç akışına göre fonksiyonları yaz

Probot programı `setup()` ve `loop()` yerine altı fonksiyonla yazılır; bu sayfada her birinin ne zaman çalıştığını görüp programın iskeletini kuracaksın.

## Başlamadan önce

- Arduino IDE kurulu ve Probot kütüphanesi yüklü. Bkz. [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Robotun WiFi adını, şifresini ve kanalını biliyorsun. Bkz. [Robotun WiFi ayarlarını yap](wifi-ayarla.md).

Bu sayfadaki kod Probot kütüphanesinin 0.3.0 sürümüne göredir. Probot Blocks da aynı altı fonksiyonu üretir: [Sürüş programı yaz](../blocks/probot-surus-programi-yaz.md).

## Altı fonksiyonu tanı {#alti-fonksiyon}

Kütüphane `setup()` ve `loop()` fonksiyonlarını kendisi tanımlar. Sen bunların yerine aşağıdaki altı fonksiyonu yazarsın.

| Fonksiyon | Ne zaman çalışır | Buraya ne konur |
|---|---|---|
| `robotInit()` | Driver Station'da **Init**'e her basışta, bir kez | Pin ayarları, motorları durdurma, kumanda eşlemesi |
| `robotEnd()` | **Stop**'a basınca ve acil durdurmada, bir kez | Motorları ve servoları güvenli konuma alma |
| `autonomousInit()` | Otonom başlarken, bir kez | Otonomun başlangıç değerleri |
| `autonomousLoop()` | Otonom boyunca, saniyede yaklaşık 50 kez | Otonom hareketler |
| `teleopInit()` | Teleop başlarken, bir kez | Teleop hazırlığı |
| `teleopLoop()` | Teleop boyunca, saniyede yaklaşık 50 kez | Kumandayı okuma ve sürüş |

Altısı da programda bulunmak zorundadır. İçi boş kalabilir. `setup()` ya da `loop()` yazarsan program derlenmez.

## Programın iskeletini yaz {#iskelet}

1. Arduino IDE'de yeni bir sketch aç ve içindeki `setup()` ile `loop()` fonksiyonlarını sil.
2. En üste üç WiFi makrosunu yaz. Makrolar `#include <probot.h>` satırından önce gelir.
3. Altına `#include <probot.h>` satırını yaz.
4. Altı fonksiyonu aşağıdaki gibi ekle.
5. Kodu derle.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void robotInit() {}        // Init'e basınca 1 kez
void robotEnd() {}         // Stop'ta 1 kez: motorları burada durdur

void autonomousInit() {}   // otonom başlarken 1 kez
void autonomousLoop() {}   // otonom boyunca tekrar çağrılır

void teleopInit() {}       // teleop başlarken 1 kez
void teleopLoop() {}       // teleop boyunca tekrar çağrılır
```

Sonuç: Derleme hatasız biter. Kodu robota yükleyip Driver Station'da **Init**'e basınca durum LED'i sarı yanar.

## Maç akışını izle {#mac-akisi}

Driver Station'ın **Match Control** bölümünde tek bir düğme vardır. Üstündeki yazı sırayla **Init**, **Start** ve **Stop** olur.

```text
Init ──> robotInit()
Start ──> autonomousInit() ──> autonomousLoop() ... (Autonomous Duration saniye)
                                   │ süre dolunca, kendiliğinden
                                   v
                              teleopInit() ──> teleopLoop() ...
Stop ──> robotEnd()
```

- **Autonomous** anahtarı açıkken **Start** otonomu başlatır. Anahtar varsayılan olarak açıktır.
- Otonom **Autonomous Duration** kutusundaki süre kadar sürer. Varsayılan 30 saniyedir; kutu 1-120 arası bir değer için tasarlanmıştır, tam sayı yaz.
- Süre dolunca teleop kendiliğinden başlar: önce `teleopInit()`, sonra `teleopLoop()` çalışır. Arada `robotEnd()` çağrılmaz.
- **Autonomous** anahtarı kapalıyken **Start** doğrudan teleopu başlatır.
- Otonom sürerken anahtarı kapatırsan robot teleopa geçer.
- **Init**'e her basışta `robotInit()` yeniden çalışır. İçindeki kod tekrar çalışmaya dayanıklı olmalı.

Her geçişte kütüphane kumanda değerlerini sıfırlar. Yeni fazın ilk turunda çubuklar 0 okunabilir.

## Motorları Stop'ta durdur {#robotend}

**Stop**'tan sonra loop fonksiyonları bir daha çağrılmaz. Motoru durduran kod `robotEnd()` içinde değilse motor son aldığı güçle dönmeye devam eder.

`robotEnd()` şu durumlarda çalışır:

- **Stop**'a basınca. O anki loop turu bittikten sonra çalışır.
- Driver Station 10 saniye hiç veri göndermezse. Kütüphane robotu kendisi durdurur.
- **EMERGENCY STOP**'a basınca. Bu durumda `robotEnd()` için 500 ms süre vardır. Süre aşılırsa kart yeniden başlar. Robot yeniden başlatılana kadar **EMERGENCY STOP** ve **Reboot Robot** dışındaki komutları kabul etmez.

Durdurma kodunu tek bir fonksiyonda topla ve hem `robotInit()` hem `robotEnd()` içinden çağır:

```cpp
void stopMotors() {
  analogWrite(16, 0);   // sol motor RPWM
  analogWrite(17, 0);   // sol motor LPWM
}

void robotInit() { pinMode(16, OUTPUT); pinMode(17, OUTPUT); stopMotors(); }
void robotEnd()  { stopMotors(); }   // Stop'ta motorlar güvenli konuma
```

`robotEnd()` kısa olmalı. İçinde bekleme ya da sensör okuma yapma.

Acil durdurmayı koddan başlatmak için `probot::emergencyStop();` çağır. Bu çağrı her fonksiyonun içinden güvenle yapılır. Sonrası **EMERGENCY STOP** düğmesiyle aynıdır.

!!! warning "Dikkat"
    Yazılımla durdurma, güç hattındaki fiziksel acil durdurma anahtarının yerini tutmaz. Kart tamamen kilitlenirse yalnız fiziksel anahtar çalışır.

## Loop'u kısa tut {#loop-kurali}

Kütüphane loop fonksiyonunu çağırır, fonksiyon dönünce 20 ms bekler ve yeniden çağırır. Loop'un sonuna `delay(20)` koymak zorunlu değildir.

Bir tur 2 saniyede dönmezse kütüphane robotu güvene alır:

- Kumanda değerleri sıfırlanır.
- Durum LED'i kırmızı yanıp söner.
- **Telemetry** panelinde şu satır çıkar:

```text
!! LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

Program öldürülmez, kart yeniden başlamaz. Tur dönünce robot normale döner.

Bekleme gerekiyorsa `delay()` yerine `millis()` ile geçen süreyi ölç. Örnek: [Otonomu yaz](otonom-yaz.md).

## Sorun mu var?

- **Derlemede "undefined reference to" ve bir fonksiyon adı çıkıyor** ("undefined reference to `robotEnd()'" gibi): Altı fonksiyondan biri eksik. Adı hatadaki fonksiyonu boş da olsa ekle.
- **Derlemede "redefinition of 'void setup()'" çıkıyor:** Programda `setup()` ya da `loop()` var. Onları sil, içlerindeki kodu `robotInit()` ve loop fonksiyonlarına taşı.
- **Stop'tan sonra motor dönmeye devam ediyor:** `robotEnd()` içinde motoru durduran kod yok.
- **LED kırmızı yanıp sönüyor:** Bir loop turu 2 saniyeyi geçti. Bkz. [Hatalar ve sorun giderme](sorunlar.md).

## Sonraki adım

[Kumanda verisini oku](kumandayi-oku.md)
