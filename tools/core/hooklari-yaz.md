# Maç akışına göre fonksiyonları yaz

Probot programı `setup()` ve `loop()` yerine her mod için init, loop ve stop fonksiyonlarıyla yazılır; bu sayfada her birinin ne zaman çalıştığını görüp programın iskeletini kuracaksın.

## Başlamadan önce

- Arduino IDE kurulu ve Probot kütüphanesi yüklü. Bkz. [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
- Robotun WiFi adını, şifresini ve kanalını biliyorsun. Bkz. [Robotun WiFi ayarlarını yap](wifi-ayarla.md).

Bu sayfadaki kod Probot kütüphanesinin 0.4.0 sürümüne göredir. Elinde 0.3.0 için yazılmış, `robotInit()` ve `robotEnd()` kullanan bir kod varsa önce [0.3.0 kodunu taşı](#gecis) bölümüne bak.

## Mod fonksiyonlarını tanı {#alti-fonksiyon}

Kütüphane `setup()` ve `loop()` fonksiyonlarını kendisi tanımlar. Sen bunların yerine her mod için fonksiyon yazarsın. Mod Driver Station'da seçilir: **Autonomous** otonom, **Teleoperated** teleop demektir.

| Fonksiyon | Ne zaman çalışır | Buraya ne konur | Zorunlu |
|---|---|---|---|
| `autonomousInit()` | **Autonomous** seçiliyken **Init**'e her basışta, bir kez | Pin ayarları, motorları durdurma, başlangıç değerleri | Hayır |
| `autonomousLoop()` | **Start**'tan sonra otonom boyunca, saniyede yaklaşık 50 kez | Otonom hareketler | Evet |
| `autonomousStop()` | Otonomdan her çıkışta, bir kez | Motorları ve servoları güvenli konuma alma | Evet |
| `teleopInit()` | **Teleoperated** seçiliyken **Init**'e her basışta, bir kez | Pin ayarları, motorları durdurma, kumanda eşlemesi | Hayır |
| `teleopLoop()` | **Start**'tan sonra teleop boyunca, saniyede yaklaşık 50 kez | Kumandayı okuma ve sürüş | Evet |
| `teleopStop()` | Teleoptan her çıkışta, bir kez | Motorları ve servoları güvenli konuma alma | Evet |

Dört zorunlu fonksiyon boş da olsa programda bulunmalıdır; biri eksikse program bağlanmaz. Yazmadığın init fonksiyonu boş sayılır. `setup()` ya da `loop()` yazarsan program derlenmez.

Her mod için iki isteğe bağlı fonksiyon daha vardır: `autonomousInitLoop()`, `autonomousStart()`, `teleopInitLoop()` ve `teleopStart()`. Çoğu robot bunlara ihtiyaç duymaz. Ayrıntı: [Init ile Start arasında kod çalıştır](#initloop-start).

## Programın iskeletini yaz {#iskelet}

1. Arduino IDE'de yeni bir sketch aç ve içindeki `setup()` ile `loop()` fonksiyonlarını sil.
2. En üste üç WiFi makrosunu yaz. Makrolar `#include <probot.h>` satırından önce gelir.
3. Altına `#include <probot.h>` satırını yaz.
4. İki modun fonksiyonlarını aşağıdaki gibi ekle.
5. Kodu derle.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"   // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  1             // 1-13
#include <probot.h>

void autonomousInit() {}   // Autonomous seçiliyken Init'e basınca 1 kez
void autonomousLoop() {}   // otonom boyunca tekrar çağrılır (zorunlu)
void autonomousStop() {}   // otonomdan her çıkışta 1 kez (zorunlu)

void teleopInit() {}       // Teleoperated seçiliyken Init'e basınca 1 kez
void teleopLoop() {}       // teleop boyunca tekrar çağrılır (zorunlu)
void teleopStop() {}       // teleoptan her çıkışta 1 kez (zorunlu)
```

Sonuç: Derleme hatasız biter. Kodu robota yükleyip Driver Station'da **Init**'e basınca durum LED'i sarı yanar.

## Maç akışını izle {#mac-akisi}

Driver Station'ın **Match Control** bölümünde mod listesi, **Init** düğmesi ve **Stop** düğmesi vardır. Listede **Autonomous** ve **Teleoperated** yazar. **Init**'e bastıktan sonra düğmenin yazısı **Start** olur.

```text
mod seç: Autonomous
Init  ──> autonomousInit() ──> autonomousInitLoop() ... (Start'a kadar)
Start ──> autonomousStart() ──> autonomousLoop() ... (Autonomous süresi kadar)
                                    │ süre dolunca, kendiliğinden
                                    v
                               autonomousStop() ──> geçiş: Teleoperated seçili, bekler
Init  ──> teleopInit() ──> teleopInitLoop() ... (Start'a kadar)
Start ──> teleopStart() ──> teleopLoop() ...
Stop  ──> teleopStop()
```

- Mod yalnız robot dururken değişir: Init'ten önce ya da otonom süresi dolduktan sonra. Init ya da çalışma sırasında liste kilitlidir; önce **Stop**'a bas.
- **Init** seçili modun init fonksiyonunu bir kez çalıştırır. Robot hareket etmez: kumanda değerleri 0 okunur, sinyal lambası sabit yanar.
- **Start** modun loop fonksiyonunu başlatır. Kumanda yalnız bu evrede okunur.
- Otonom **Autonomous süresi** kutusundaki süre kadar sürer. Varsayılan 30 saniyedir; kutu 1-120 arası bir değer için tasarlanmıştır, tam sayı yaz. Süre `autonomousStart()` bitince başlar.
- Süre dolunca `autonomousStop()` çalışır ve **Teleoperated** kendiliğinden seçilir. Teleop kendiliğinden başlamaz: düğmenin yazısı **Init Teleop** olur. Önce ona, sonra **Start**'a bas.
- Otonomsuz bir maç için baştan **Teleoperated**'ı seç.
- **Init**'e her basışta init fonksiyonu yeniden çalışır. İçindeki kod tekrar çalışmaya dayanıklı olmalı.

Bütün fonksiyonlar tek bir görevde sırayla çalışır. Global ve `static` değişkenler bu yüzden modlar arasında değerini korur. Bir modun başlangıç değerlerini o modun init fonksiyonunda sıfırla.

Her geçişte kütüphane kumanda değerlerini sıfırlar. Init evresinde ve robot dururken bütün çubuklar 0, bütün düğmeler `false` okunur.

## Motorları Stop'ta durdur {#robotend}

**Stop**'tan sonra loop fonksiyonu bir daha çağrılmaz. Motoru durduran kod modun stop fonksiyonunda değilse motor son aldığı güçle dönmeye devam eder.

Mod Init ya da çalışma evresindeyken stop fonksiyonu şu durumlarda bir kez çalışır:

- **Stop**'a basınca. Loop çalışıyorsa o anki tur bittikten sonra çalışır. Init evresinde basarsan da çalışır.
- Otonom süresi dolunca. Bu durumda `autonomousStop()` çalışır.
- Driver Station 10 saniye hiç veri göndermezse. Kütüphane robotu kendisi durdurur.
- **Emergency Stop**'a basınca. Bu durumda stop fonksiyonu için 500 ms süre vardır. Süre aşılırsa kart yeniden başlar. Robot yeniden başlatılana kadar **Emergency Stop** ve **Reboot Robot** dışındaki komutları kabul etmez.

Robot dururken ya da otonom süresi dolduktan sonraki geçişte stop fonksiyonu çağrılmaz; o anda çalışan bir mod yoktur.

Durdurma kodunu tek bir fonksiyonda topla ve iki modun init ve stop fonksiyonlarından çağır:

```cpp
void stopMotors() {
  analogWrite(16, 0);   // sol motor RPWM
  analogWrite(17, 0);   // sol motor LPWM
}

void setupMotors() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
  stopMotors();
}

void autonomousInit() { setupMotors(); }
void autonomousStop() { stopMotors(); }   // otonomdan her çıkışta motorlar durur

void teleopInit() { setupMotors(); }
void teleopStop() { stopMotors(); }       // teleoptan her çıkışta motorlar durur
```

Stop fonksiyonu kısa olmalı. İçinde bekleme ya da sensör okuma yapma.

Acil durdurmayı koddan başlatmak için `probot::emergencyStop();` çağır. Bu çağrı her fonksiyonun içinden güvenle yapılır. Sonrası **Emergency Stop** düğmesiyle aynıdır.

!!! warning "Dikkat"
    Yazılımla durdurma, güç hattındaki fiziksel acil durdurma anahtarının yerini tutmaz. Kart tamamen kilitlenirse yalnız fiziksel anahtar çalışır.

## Init ile Start arasında kod çalıştır {#initloop-start}

`autonomousInitLoop()` ve `teleopInitLoop()`, **Init** ile **Start** arasında loop gibi tekrar tekrar çağrılır. Maç öncesi kontrol, sensör ya da kalibrasyon durumunu ekrana yazmak için kullanılır. Bu evrede robotu hareket ettirme; kumanda 0 okunur.

`autonomousStart()` ve `teleopStart()`, **Start**'a basınca loop'tan önce bir kez çalışır. Zaman damgası almak ve sayaçları sıfırlamak için kullanılır.

Aşağıdaki kod Init'ten sonra kolun aşağıda olup olmadığını gösterir ve otonomda sol motoru 2 saniye ileri sürer:

1. Kodun en üstüne WiFi makrolarını ve `#include <probot.h>` satırını yaz.
2. `autonomousInitLoop()` içinde limit switch'i okuyup **Telemetry** paneline yaz.
3. `autonomousStart()` içinde `millis()` ile Start anını kaydet.
4. `autonomousLoop()` içinde geçen süreye göre motoru sür.
5. Kodu yükle, **Autonomous**'u seç ve **Init**'e bas.

```cpp
const int LIMIT_PIN = 4;   // kolun alt limit switch'i
uint32_t startMs = 0;      // otonomun başladığı an

void stopMotors() {
  analogWrite(16, 0);   // sol motor RPWM
  analogWrite(17, 0);   // sol motor LPWM
}

void autonomousInit() {
  pinMode(16, OUTPUT);
  pinMode(17, OUTPUT);
  stopMotors();
  pinMode(LIMIT_PIN, INPUT_PULLUP);
}

void autonomousInitLoop() {
  // Init ile Start arasında tekrar çağrılır; burada motor sürme
  probot::clearTelemetry();
  probot::printf("Kol altta: %s\n", digitalRead(LIMIT_PIN) == LOW ? "evet" : "hayir");
}

void autonomousStart() {
  startMs = millis();   // Start anı
}

void autonomousLoop() {
  uint32_t elapsed = millis() - startMs;   // Start'tan beri geçen süre (ms)
  if (elapsed < 2000) analogWrite(16, 100);  // ilk 2 saniye ileri
  else stopMotors();
}

void autonomousStop() { stopMotors(); }

// Teleop bu örnekte boş; bu iki fonksiyon programda bulunmak zorunda
void teleopLoop() {}
void teleopStop() { stopMotors(); }
```

Sonuç: **Telemetry** panelinde "Kol altta: evet" ya da "Kol altta: hayir" satırı görünür ve switch'e basınca değişir. **Start**'a basınca motor 2 saniye döner ve durur.

Init, start ve stop fonksiyonları bir kez çalıştığı için loop'tan uzun süre tanır: 10 saniye. Gyro kalibrasyonu gibi birkaç saniyelik bir işi init fonksiyonunda yapabilirsin.

## Loop'u kısa tut {#loop-kurali}

Kütüphane loop fonksiyonunu çağırır, fonksiyon dönünce 20 ms bekler ve yeniden çağırır. InitLoop fonksiyonları da böyle çağrılır. Loop'un sonuna `delay(20)` koymak zorunlu değildir.

Bir loop ya da initLoop turu 2 saniyede dönmezse kütüphane robotu güvene alır. Init, start ve stop fonksiyonları için bu sınır 10 saniyedir.

- Kumanda değerleri sıfırlanır.
- Durum LED'i kırmızı yanıp söner.
- **Telemetry** panelinde şu satır çıkar:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

Program öldürülmez, kart yeniden başlamaz. Tur dönünce robot normale döner.

Bekleme gerekiyorsa `delay()` yerine `millis()` ile geçen süreyi ölç. Örnek: [Otonomu yaz](otonom-yaz.md). Sınırları değiştiren makrolar: [Ayar makroları](makro-listesi.md#dongu).

## 0.3.0 kodunu taşı {#gecis}

0.3.0'daki `robotInit()` ve `robotEnd()` 0.4.0'da kaldırıldı. Bu iki fonksiyonu içeren bir kod derlenmez ve şu hatayı verir:

```text
error: redefinition of 'void robotInit()'
note: 'void robotInit()' previously defined here
void robotInit() = delete; // [PB-E106] removed in 0.4.0: move this code into teleopInit()/autonomousInit()
```

Not satırı kütüphanedeki bildirimi gösterir ve kodun nereye taşınacağını yazar. Aynı hata `robotEnd()` için de çıkar.

Kodu taşımak için:

1. `robotInit()` içindeki kodu `autonomousInit()` ve `teleopInit()` içine taşı. İkisinde aynı olan kodu tek bir fonksiyona topla ve iki init'ten çağır.
2. `robotEnd()` içindeki kodu `autonomousStop()` ve `teleopStop()` içine taşı.
3. `robotInit()` ve `robotEnd()` fonksiyonlarını sil.
4. `autonomousStop()` ya da `teleopStop()` yoksa boş da olsa ekle.
5. Kodu derle.

Sonuç: Derleme hatasız biter. **Init**'e basınca seçili modun init fonksiyonu, **Stop**'a basınca stop fonksiyonu çalışır.

Davranış da değişti:

- **Autonomous** anahtarı kalktı. Otonomsuz başlamak için listeden **Teleoperated**'ı seç.
- **Init** artık yalnız hazırlık yapar. Kod **Start**'tan sonra çalışmaya başlar.
- Otonom süresi dolunca teleop kendiliğinden başlamaz. **Init**'e ve **Start**'a yeniden bas.
- Robot durumunun faz adları değişti ve `autonomousEnabled` alanı kalktı: [Robot durumu](fonksiyon-listesi.md#robot-durumu).

## Sorun mu var?

- **Derlemede "undefined reference to" ve bir fonksiyon adı çıkıyor:** Dört zorunlu fonksiyondan biri eksik. Bağlayıcı adı kodlanmış yazabilir: "undefined reference to `_Z10teleopStopv'" satırı `teleopStop()` eksik demektir. Adı geçen fonksiyonu boş da olsa ekle.
- **Derlemede "redefinition of 'void robotInit()'" ya da "robotEnd()" çıkıyor:** Kod 0.3.0 için yazılmış. Bkz. [0.3.0 kodunu taşı](#gecis).
- **Derlemede "redefinition of 'void setup()'" çıkıyor:** Programda `setup()` ya da `loop()` var. Onları sil, içlerindeki kodu init ve loop fonksiyonlarına taşı.
- **Init'ten sonra kumanda değerleri 0 okunuyor:** Beklenen davranış. Kumanda **Start**'tan sonra okunur.
- **Mod listesi tıklanmıyor:** Robot Init ya da çalışma evresinde. Önce **Stop**'a bas.
- **Otonom bitti, teleop başlamadı:** Beklenen davranış. **Init Teleop**'a, sonra **Start**'a bas.
- **Stop'tan sonra motor dönmeye devam ediyor:** Modun stop fonksiyonunda motoru durduran kod yok.
- **LED kırmızı yanıp sönüyor:** Bir loop ya da initLoop turu 2 saniyeyi ya da bir init, start veya stop fonksiyonu 10 saniyeyi geçti. Bkz. [Hatalar ve sorun giderme](sorunlar.md#pb-e301-deadline-miss-loop-takildi).

## Sonraki adım

[Kumanda verisini oku](kumandayi-oku.md)
