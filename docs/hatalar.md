---
title: Hatalar
---

# Hatalar

## Hata Ayıklama Yöntemi

Belirli bir hataya bakmadan önce bu prensipler okunmalı. Çoğu hata bu yaklaşımla çok daha hızlı çözülür.

### Kodda değişiklik yoksa sorun elektronikte

Robot dün çalışıyordu, bugün çalışmıyor ama kod değişmedi. Bu durumda koda bakmak zaman kaybı. Sorun kablodan, konektörden, akü geriliminden veya motordan kaynaklanıyor.

Kodun aynı kaldığı hata senaryolarının büyük çoğunluğu fiziksel sebepli.

### Problemi daralt, parçalara böl

Bir robot çok parçadan oluşur: kütüphane, kod, motor sürücü, motor, kablo, güç. Bunların hepsi aynı anda test edilemez. Problemi olabildiğince küçük bir parçaya indirgemek gerekir.

Motor eskiden dönüyordu, şimdi dönmüyor. İlk soru: **ne değişti?** Kod değişmediyse sorun fiziksel; kablo gevşemiş, konektör ayrılmış, akü bitmiş veya motor sürücü yanmış olabilir. Kod değiştiyse sorun yazılımsal; ama o zaman da hangi değişiklikle başladığı sorusu önemli.

Cevap bilinemiyorsa sistemi parçalara böl. Motorun sorunlu olup olmadığını anlamak için motor sürücüyü devre dışı bırak ve motoru doğrudan bir güç kaynağına bağla. Motor dönüyorsa motor sağlam; sorun üstündeki katmanda. Motor dönmüyorsa sorun motorda veya güç hattında. Bu şekilde her katman sırayla elenir.

### Tek seferde bir şeyi değiştir

Aynı anda hem kablo hem kod hem de güç kaynağı değiştirilirse hangisinin sorunu çözdüğü anlaşılamaz. Bir değişiklik yapılır, test edilir, sonuca bakılır. Birden fazla şeyi aynı anda değiştirmek mevcut sorun çözülse bile neyin çözdüğünü gizler.

### Şüphelenilen her ihtimali sırayla ele al

"Kablo mı, sürücü mü, motor mu bozuk?" sorusu varsa önce her birini ayrı ayrı test et. Kabloyu başka bir çalışan devreden geçir. Sürücünün LED'ine bak. Motoru doğrudan pil ucuna bağla. Bu testlerin her biri bir ihtimali elendir; kalan tek ihtimal cevaptır.

### LED rengine ve seri porta bak

Probot'un LED'i robotun o anki durumunu söylüyor. Joystick yanlış görünüyorsa, otonom beklediği gibi çalışmıyorsa; önce LED rengi kontrol edilmeli, sonra `probot::printf()` ile değerleri ekrana yaz. Görmeden tahmin yürütmek yerine veriyi okumak her zaman daha hızlı.

---

## Hata Kodları (PB-Exxx)

Kütüphanenin ürettiği her hata kalıcı bir kod taşır. Bir hata mesajının içinde gördüğün `PB-Exxx` kodu doğrudan bu sayfadaki ilgili bölüme götürür; kod hem derleme/seri port çıktısında hem de arayüz ve telemetride aynı kalır.

Bantlar:

- **E1xx** — derleme (compile)
- **E2xx** — bağlama (linker)
- **E3xx** — çalışma zamanı (runtime)
- **E4xx** — protokol/HTTP (E409 bilerek HTTP 409 ile aynı numaradadır)

| Kod | Yüzey | Anlamı |
|---|---|---|
| PB-E101 | Derleme | `PROBOT_WIFI_AP_PASSWORD` eksik ya da 8 karakterden kısa |
| PB-E102 | Derleme | `PROBOT_WIFI_AP_CHANNEL` eksik ya da 1-13 dışında |
| PB-E103 | Derleme | SSID uzunluk kuralları (MAC ekiyle ≤25, eksiz ≤32) |
| PB-E104 | Derleme | Batarya ADC konfigürasyonu geçersiz — pin ADC1 dışında (S3'te GPIO1-10 şart; ADC2 WiFi açıkken çalışmaz) ya da bölücü dirençleri (`_R_TOP_K`/`_R_BOT_K`) eksik |
| PB-E105 | Derleme | Batarya kaynak çakışması/geçersiz seçim — hem `PROBOT_BATTERY_ADC_PIN` hem `PROBOT_BATTERY_INA` tanımlı; ya da `_INA` 219/226 değil; ya da `_TRIM` 0.5-2.0 dışında |
| PB-E201 | Bağlama | Zorunlu hook tanımsız — `undefined reference to teleopLoop()` vb. Dördü de (boş olsa bile) tanımlanmalı |
| PB-E202 | Bağlama | `setup()`/`loop()` sketch'te tanımlanmış — kütüphaneye aittir, hook'ları kullanın |
| PB-E301 | Çalışma | Deadline miss / stall — bir `initLoop`/`loop` turu `PROBOT_LOOP_DEADLINE_MS`'i aştı; girişler sıfır, halt-safe |
| PB-E302 | Çalışma | Emergency stop kilitli — reboot gerekli |
| PB-E303 | Çalışma | DS bağlantısı koptu → robot durduruldu (`PROBOT_DS_TIMEOUT_FORCE_STOP=1`) |
| PB-E304 | Çalışma | DS bağlantısı koptu → joystick nötr, yeniden bağlanma bekleniyor (`FORCE_STOP=0`) |
| PB-E305 | Çalışma | E-stop'ta `stop()` hook'u `PROBOT_ESTOP_END_MS` içinde dönmedi → çip reboot |
| PB-E306 | Çalışma | Batarya sensörüne (INA219/INA226) I2C'de ulaşılamıyor — arayüz "Veri yok"a düşer, bağlantı/adres kontrol edin |
| PB-E409 | HTTP | Komut geçersiz evrede (409) — `mode`/`init`/`start`/`stop` evre kuralları |

---

<a id="pb-e101"></a>
### PB-E101 — WiFi Şifresi Eksik veya Kısa

**Belirti:** Derleme başlamadan durur. IDE `#include <probot.h>` satırında şu hatayı verir:

```
[PB-E101] Driver station AP password not provided. Define PROBOT_WIFI_AP_PASSWORD (>=8 chars) before including probot.h.
```

Şifre tanımlı ama 8 karakterden kısaysa hata şu olur:

```
[PB-E101] PROBOT_WIFI_AP_PASSWORD must be at least 8 characters.
```

**Sebep:** Robotun WiFi erişim noktası (AP) parolasız açılamaz. Kütüphane, `PROBOT_WIFI_AP_PASSWORD` makrosu tanımlı değilse veya en az 8 karakter değilse derlemeyi baştan durdurur.

**Çözüm:** Makroyu `#include <probot.h>`'den **önce**, en az 8 karakterle tanımla:

```cpp
#define PROBOT_WIFI_AP_PASSWORD "sifre1234"   // en az 8 karakter
#include <probot.h>
```

Doğru sıralı minimal iskelet için: [İlk Bakış - Minimal Kod](baslangic.md#minimal-kod).

---

<a id="pb-e102"></a>
### PB-E102 — WiFi Kanalı Eksik veya Geçersiz

**Belirti:** Derleme durur. Kanal makrosu hiç tanımlı değilse:

```
[PB-E102] WiFi AP channel not provided. Define PROBOT_WIFI_AP_CHANNEL (1-13) before including probot.h.
```

Kanal 1-13 aralığının dışındaysa:

```
[PB-E102] PROBOT_WIFI_AP_CHANNEL must be 1-13. To auto-pick the channel at boot, set PROBOT_WIFI_AUTO_CHANNEL 1 (single-robot use only).
```

**Sebep:** AP'nin çalışacağı 2.4 GHz kanalı derleme anında belli olmalı. `PROBOT_WIFI_AP_CHANNEL` eksik ya da geçersiz. Açılışta kanalı otomatik seçtirmek istersen `PROBOT_WIFI_AUTO_CHANNEL 1` tanımlanır — ancak bu yalnız tek robot kullanımı içindir; filoda önerilmez.

**Çözüm:** Kanalı `#include <probot.h>`'den önce, 1-13 arasında tanımla:

```cpp
#define PROBOT_WIFI_AP_CHANNEL  1   // 1, 6 veya 11 önerilir
#include <probot.h>
```

Yarışmada birden fazla robot varken kanalların çakışmaması için: [Sinyal Temizliği - Yarışma Günü Kanal Planı](saha.md#yarsma-gunu-kanal-plan).

---

<a id="pb-e103"></a>
### PB-E103 — SSID Uzunluğu

**Belirti:** Derleme durur. SSID hiç yoksa veya boşsa:

```
[PB-E103] PROBOT_WIFI_AP_SSID must be at least 1 character.
```

MAC eki açıkken SSID 25 karakterden uzunsa:

```
[PB-E103] PROBOT_WIFI_AP_SSID must be 25 characters or fewer when MAC suffix is enabled.
```

MAC eki yokken SSID 32 karakterden uzunsa:

```
[PB-E103] PROBOT_WIFI_AP_SSID must be 32 characters or fewer.
```

**Sebep:** WiFi standardı SSID'yi en fazla 32 karakterle sınırlar. `PROBOT_WIFI_AP_SSID_MAC_SUFFIX` açıksa kütüphane sonuna MAC eki ekler; bu ek için yer bırakmak adına isim en fazla 25 karakter olabilir.

**Çözüm:** SSID makrosunu sınır içinde tut. MAC eki kullanıyorsan ismi 25 karaktere kadar kısalt:

```cpp
#define PROBOT_WIFI_AP_SSID     "RobotAdi"   // MAC eki açıkken ≤25, eksiz ≤32
#include <probot.h>
```

---

<a id="pb-e104"></a>
### PB-E104 — Batarya ADC Konfigürasyonu Geçersiz

**Belirti:** Batarya gerilimini gerilim bölücü + ADC ile okuma (`PROBOT_BATTERY_ADC_PIN`) tanımlandığında derleme durur. Pin ADC1 dışındaysa:

```
[PB-E104] PROBOT_BATTERY_ADC_PIN ADC1 pini olmali (ESP32-S3: GPIO1-10). ADC2 (GPIO11-20) WiFi acikken calismaz.
```

Bölücü dirençleri tanımlı değilse:

```
[PB-E104] Gerilim bolucu direncleri eksik: PROBOT_BATTERY_R_TOP_K ve PROBOT_BATTERY_R_BOT_K (kilo-ohm) tanimlanmali.
```

Ayrıca dirençler pozitif değilse ve ADC pini bir güvenlik/durum pini (`PROBOT_ESTOP_ENABLE_PIN`, `PROBOT_RSL_PIN`, `NEOPIXEL_PIN`) ile çakışırsa aynı kod ilgili mesajla çıkar.

**Sebep:** ADC yöntemiyle batarya ölçümü açıldı ama konfigürasyon geçersiz. ADC2 pinleri (GPIO11-20) WiFi açıkken çalışmaz; bu yüzden pin ADC1'den (GPIO1-10) seçilmek zorundadır. Bölücü dirençleri (`PROBOT_BATTERY_R_TOP_K` / `PROBOT_BATTERY_R_BOT_K`) gerilimi ADC aralığına indirmek için gereklidir; eksik olamazlar. Batarya pini acil durdurma, RSL ya da durum LED'i pinine devredilirse o güvenlik çıkışı susar.

**Çözüm:** Pini GPIO1-10 arasından seç ve iki direnci de tanımla:

```cpp
#define PROBOT_BATTERY_ADC_PIN  5     // GPIO1-10 arası ŞART (ADC1)
#define PROBOT_BATTERY_R_TOP_K  100
#define PROBOT_BATTERY_R_BOT_K  22
#include <probot.h>
```

Devre şeması, doğruluk ve `PROBOT_BATTERY_TRIM` ince ayarı için: [Yazılım - Batarya Ölçümü](yazilim.md#batarya-olcumu).

---

<a id="pb-e105"></a>
### PB-E105 — Batarya Kaynak Seçimi Geçersiz

**Belirti:** Derleme durur. İki batarya kaynağı birden tanımlıysa:

```
[PB-E105] Tek batarya kaynagi secin: PROBOT_BATTERY_ADC_PIN (bolucu) VEYA PROBOT_BATTERY_INA (I2C sensor), ikisi birden degil.
```

`PROBOT_BATTERY_INA` 219 ya da 226 değilse:

```
[PB-E105] PROBOT_BATTERY_INA 219 ya da 226 olmali (desteklenen sensorler: INA219, INA226).
```

Ayrıca INA I2C pinleri yarım tanımlıysa (`_SDA`/`_SCL` biri eksik ya da ikisi aynı pin), `PROBOT_BATTERY_TRIM` 0.5-2.0 dışındaysa, shunt pozitif değilse veya INA adresi geçerli 7-bit aralıkta (0x08-0x77) değilse aynı kod ilgili mesajla çıkar.

**Sebep:** Batarya kaynağı geçersiz seçildi. ADC bölücü ile INA sensörü aynı anda kullanılamaz — tek kaynak seç. INA yalnız INA219 veya INA226 olabilir; I2C pinleri ya birlikte verilir ya hiç; TRIM oran düzeltmesi değil ince ayar içindir, bu yüzden 0.5-2.0 ile sınırlıdır (oran yanlışsa bölücü dirençlerini düzelt).

**Çözüm:** Tek kaynak bırak ve değerleri sınır içinde ver:

```cpp
#define PROBOT_BATTERY_INA       226   // ya da 219 — ADC ile birlikte DEĞİL
#define PROBOT_BATTERY_TRIM      1.0f  // 0.5-2.0 arası
#include <probot.h>
```

Üç ölçüm yöntemi ve INA ayrıntıları için: [Yazılım - Batarya Ölçümü](yazilim.md#batarya-olcumu).

---

<a id="pb-e201"></a>
### PB-E201 — Zorunlu Hook Tanımsız (undefined reference)

**Belirti:** Derleme geçer ama bağlama (link) aşamasında durur:

```
undefined reference to `teleopLoop()'
```

Aynı hata eksik olan hook'a göre `autonomousLoop()`, `autonomousStop()` veya `teleopStop()` için de çıkabilir.

**Sebep:** `autonomousLoop`, `autonomousStop`, `teleopLoop` ve `teleopStop` zorunludur; boş da olsalar tanımlanmazlarsa linker bağlayamaz. `init`/`start`/`initLoop` hook'ları opsiyoneldir (weak) ve eksik kalabilir, ama bu dördü kalamaz.

**Çözüm:** Dört zorunlu hook'un dördünü de, gövdesi boş olsa bile tanımla:

```cpp
void autonomousLoop() {}
void autonomousStop() {}
void teleopLoop() {}
void teleopStop() {}
```

Eski `robotInit()`/`robotEnd()` iskeletiyle yazılmış sketch'ler tam olarak bu hatayı alır: `autonomousStop`/`teleopStop` tanımlı olmadığı için bağlama başarısız olur. Geçiş için: [Yazılım - Yaşam Döngüsü](yazilim.md#yasam-dongusu).

---

<a id="pb-e202"></a>
### PB-E202 — setup()/loop() Çakışması (multiple definition)

**Belirti:** Bağlama aşamasında:

```
multiple definition of `setup()'
```

Aynısı `loop()` için de çıkar:

```
multiple definition of `loop()'
```

**Sebep:** `setup()` ve Arduino `loop()` kütüphaneye aittir; kütüphane bunları kendi içinde tanımlar. Sketch'te ayrıca tanımlanırsa aynı sembol iki kez tanımlanmış olur ve linker çakışmayı bağlayamaz.

**Çözüm:** Sketch'ten `setup()` ve `loop()` tanımlarını sil; onların yerine mod hook'larını (`autonomousInit`/`autonomousLoop`/…, `teleopInit`/`teleopLoop`/…) kullan.

---

<a id="pb-e301"></a>
<a id="deadline-miss"></a>
### PB-E301 — Deadline Miss / Loop Takıldı

**Belirti:** LED kırmızı yanıp sönüyor, joystick sıfır okunuyor. Faz değişmez: otonom otonomda, teleop teleopta kalır; tur tamamlanınca hata kendiliğinden temizlenir. Telemetri panelinde şu satır görünür:

```
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot)
```

Driver Station arayüzünde de başlık altında bir uyarı bandı belirir: `PB-E301 · Loop takıldı (deadline miss) — girişler sıfırlandı, robot güvende tutuluyor.`

**Ne anlama geliyor?** `teleopLoop` veya `autonomousLoop` fonksiyonu 2 saniyeden uzun süre dönmeden çıkmadı. Kütüphane bu durumu tespit edince joystick değerlerini sıfırlar ve LED'i kırmızıya alır. Fonksiyon task'ı öldürülmez, çip reboot edilmez; homing/pozisyon gibi state korunur ve tur kendi kendine bitince hata temizlenir. (Donanım watchdog'u yalnız kütüphane task'ını izler — kullanıcı loop'unun uzun sürmesi reboot ettirmez.)

**Sebepler:**

| Olasılık | Sebep |
|---|---|
| ~%60 | Loop içinde `delay(2000)` veya daha uzun bir bekleme var |
| ~%20 | I2C veya sensör yanıt vermiyor; kütüphane timeout olmadan sonsuza bekliyor |
| ~%15 | `Serial.println()` çok sık çağrılıyor; buffer dolunca çağrı bloke oluyor |
| ~%5 | Görüntü işleme gibi gerçek hesaplama yükü |

**Daha önce çalışan kodda aniden deadline miss başladıysa:**

Kod değişmedi ama hata çıkmaya başladı. Bu durumda bakmak gereken yer kod değil, ona bağlı sistemler.

İlk adım: loop içinde herhangi bir `delay(2000)` veya daha uzun çağrı olmadığına emin ol. Varsa `millis()` ile zamanlama yapılmalı; örnek: [Yazılım - Otonom](yazilim.md#otonom).

Yoksa I2C ve harici cihazları kontrol et. I2C bağlı bir sensör veya ekran varsa; kablo gevşemesi, güç dalgalanması veya cihazın kilitlenmesi kütüphaneyi sonsuza bekletir. Timeout ekle:

```cpp
Wire.setTimeOut(50);  // 50 ms sonra vazgeç
```

Bunlar da sorun değilse looptan tüm harici cihaz çağrılarını geçici olarak kaldır ve hata devam ediyor mu bak. Kaldırınca geçiyorsa sorun o kaldırılan bileşende.

**Problemi izole edemiyorsan olabilecek en basit kodu yaz:**

Loop içinde yalnızca `delay(20)` bırak, geri kalanı yorum satırına al. Deadline miss devam ediyorsa sorun kodda değil, başka yerde. Geçiyorsa yorum satırlarını birer birer geri aç; hata hangi satırda geri geliyorsa sorun orada.

Son çare olarak kütüphaneyi denklemden çıkar. Kütüphanesiz saf Arduino koduyla motor veya sensörü test et. Orada da bloke oluyorsa sorun kütüphaneden değil, donanım veya harici kütüphaneden kaynaklanıyor demektir.

---

<a id="pb-e302"></a>
### PB-E302 — Emergency Stop Kilidi

**Belirti:** LED kırmızı sabit yanıyor. Telemetri panelinde:

```
!! [PB-E302] EMERGENCY STOP — robot disabled, reboot required
```

Seri portta:

```
[SYS  ] [PB-E302] EMERGENCY STOP
```

Driver Station arayüzü tam ekran bir uyarı gösterir: `EMERGENCY STOPPED — Robot disabled — reboot required to clear`. Robot artık `init`/`start` komutlarını reddeder.

**Sebep:** Acil durdurma (`cmd=estop` ya da arayüzdeki EMERGENCY STOP butonu) tetiklendi. Bu bilinçli, terminal bir durumdur: kullanıcı task'ı öldürülür, enable pini kesilir ve robot reboot'a kadar kilitli kalır. Hata değil, güvenlik davranışıdır.

**Çözüm:** Kilidi yalnız yeniden başlatma temizler. Arayüzdeki **Reboot Robot** düğmesini kullan (`cmd=reboot`) ya da robotu güç döngüsünden geçir (kapat-aç).

---

<a id="pb-e303"></a>
### PB-E303 — Bağlantı Kopması: Robot Durduruldu

**Belirti:** Robot durduruluyor, joystick yanıt vermiyor, LED mavi yanıp sönüyor. Telemetride:

```
!! [PB-E303] DS CONNECTION LOST — stopping robot
```

Driver Station arayüzü `DISCONNECTED — Trying to reconnect...` katmanını gösterir.

Bağlantı kopunca kütüphane sırayla şunları yapar:

1. Joystick verisi 500 ms kesilince eksenler sıfır okunmaya başlar.
2. Sahip cihaz 5 saniye sessiz kalırsa sahiplik slotu boşalır, gamepad sıfırlanır.
3. Driver Station 10 saniye boyunca tamamen sessiz kalırsa aktif modun stop hook'u çağrılır ve robot durdurulur (STOPPED). Bu davranış varsayılandır (`PROBOT_DS_TIMEOUT_FORCE_STOP=1`).

**Sebepler (saha koşullarında):**

| Olasılık | Sebep |
|---|---|
| ~%40 | Kanal çakışması; yakında aynı WiFi kanalında başka bir robot var |
| ~%25 | Tablet arka planda WiFi taraması yaptı, bağlantıyı kısa süreliğine kesti |
| ~%15 | Akü gerilimi düştü; ESP32'nin RF gücü azaldı |
| ~%10 | Mesafe veya engel; kalabalık ortamda insan kütlesi 2.4 GHz sinyalini emer |
| ~%10 | Diğer: eski tablet, yüksek DS timeout değeri, vb. |

Kanal planı ve sinyal kalitesi için: [Sinyal Temizliği](saha.md).

---

<a id="pb-e304"></a>
### PB-E304 — Bağlantı Kopması: Nötr Bekleme

**Belirti:** LED mavi yanıp sönüyor ama robot durmuyor; joystick nötr okunuyor. Telemetride:

```
!! [PB-E304] DS CONNECTION LOST — joystick neutral, waiting reconnect
```

**Sebep:** DS 10 saniye sessiz kaldı ama `PROBOT_DS_TIMEOUT_FORCE_STOP` makrosu `0` yapılmış. Bu durumda makro `0` yapılırsa robot durdurulmaz — joystick nötr kalır, loop çalışmaya devam eder, bağlantı dönünce kaldığı yerden sürer.

**Çözüm:** Bu, `FORCE_STOP=0` seçilmişse beklenen davranıştır. Bağlantının neden koptuğuna dair saha sebepleri ve çözümler için [PB-E303](#pb-e303) bölümündeki tabloya bak.

---

<a id="pb-e305"></a>
### PB-E305 — E-stop Stop Hook Zaman Aşımı

**Belirti:** Acil durdurma sonrası robot kendini yeniden başlatır. Seri portta:

```
[SYS  ] [PB-E305] estop stop hook timed out -> restart
```

**Sebep:** Acil durdurma sırasında aktif modun `stop()` hook'u `PROBOT_ESTOP_END_MS` (500 ms) içinde dönmedi. Kütüphane takılan hook'u beklemek yerine çipi reboot eder.

**Çözüm:** Stop hook'u hızlı dönmeli; içinde bekleme, uzun döngü veya bloke eden çağrı (`delay`, timeout'suz I2C vb.) olmamalı. Motorları kesip hemen çıkacak kadar kısa tut.

---

<a id="pb-e306"></a>
### PB-E306 — Batarya Sensörüne Ulaşılamıyor

**Belirti:** INA219/INA226 sensörü tanımlı ama çalışma zamanında okunamıyor. Telemetri panelinde:

```
!! [PB-E306] BATTERY SENSOR UNREACHABLE — INA I2C yanit vermiyor — docs/hatalar#pb-e306
```

Seri portta:

```
[BATT ] [PB-E306] sensor unreachable — docs: probotstudio.com/docs/hatalar/#pb-e306
```

Batarya göstergesi arayüzde "Veri yok"a döner.

**Sebep:** Kütüphane INA sensörünü I2C'de bulamıyor; birkaç ardışık okuma başarısız olunca kaynak düşmüş sayılır. Genelde kablo (SDA/SCL veya güç) gevşemiş, yanlış I2C adresi verilmiş (`PROBOT_BATTERY_INA_ADDR`) ya da bus'ta pull-up direnci yok.

**Çözüm:** SDA/SCL ve güç kablolarını, adresi (`PROBOT_BATTERY_INA_ADDR`) ve I2C pull-up dirençlerini kontrol et. Bu terminal bir hata değildir: sensör tekrar yanıt vermeye başlayınca ölçüm kendiliğinden toparlanır ve gösterge yeniden gerilimi gösterir; sensör susarken arayüz "Veri yok" gösterir. Ölçüm yöntemi ve INA ayrıntıları için: [Yazılım - Batarya Ölçümü](yazilim.md#batarya-olcumu).

---

<a id="pb-e409"></a>
### PB-E409 — Geçersiz Evrede Komut

**Belirti:** Arayüzden verilen komut HTTP 409 ile reddedilir. Komuta göre dört mesajdan biri döner:

```
[PB-E409] STOP before changing mode
[PB-E409] INIT requires STOPPED
[PB-E409] START requires INIT
[PB-E409] STOP requires INIT or RUN
```

**Sebep:** Komut, robotun o anki evresinde geçerli değil. Evre kuralları: mod yalnız STOPPED/TRANSITION'da seçilir; `init` yalnız STOPPED/TRANSITION'da; `start` yalnız ilgili INIT fazında; `stop` yalnız INIT/RUN'da kabul edilir.

**Çözüm:** Akış sırasına uy. Modu yalnız robot dururken seç; INIT/RUN'dayken önce Stop ver, sonra mod değiştir. Sıra: mod seç → init → start → stop.

---

## Diğer Sorunlar

Kalıcı bir PB-Exxx kodu taşımayan yaygın sorunlar aşağıdadır.

### "Sketch too big"

Derleme tamamlanmıyor, IDE hata veriyor.

**Sebep:** Varsayılan Arduino partition yaklaşık 1.3 MB uygulama alanı ayırır. Kütüphane bu alana sığar; ancak kullanıcı kodu büyüdükçe toplam boyut sınırı aşabilir. Başka sebebi yok.

**Çözüm:** **Araçlar > Partition Scheme > Huge APP (3MB No OTA)**

Bu ayar Arduino IDE'de sketch'e özgüdür; her yeni projede kontrol edilmeli. Ayrıntı: [Kurulum - Partition Scheme](kurulum.md#4-partition-scheme).

### Port Görünmüyor / Yükleme Başarısız

**Belirti:** Araçlar > Port listesi boş veya yükleme "could not open port" hatasıyla başarısız oluyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%50 | USB kablosu şarj-only; veri pini yok | Farklı kablo dene |
| ~%30 | CH340/CP210x sürücüsü kurulu değil (Windows) | Üreticinin sitesinden sürücüyü kur |
| ~%15 | USB portunda sorun | Farklı port veya doğrudan bilgisayar portuna tak |
| ~%5 | Devrede kısa devre; kart kendini korumak için USB'yi kesiyor | Bağlı devreyi çıkar, çıplak kartı dene |

### Joystick Görünmüyor / Çalışmıyor

**Belirti:** Arayüzde joystick "Not Connected" yazıyor veya eksen değerleri 0'dan hiç değişmiyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%70 | Henüz hiçbir butona basılmadı | Kumandada herhangi bir butona bas; tarayıcı Gamepad API'si güvenlik kısıtı nedeniyle buton basılana kadar joystick'i tanımaz |
| ~%20 | Kumanda arayüzü açan cihaza değil başka bir cihaza bağlı | Joystick'i Driver Station'ı açan telefon veya tablete bağla |
| ~%10 | Kumanda modeli varsayılan profille uyumsuz | `setActiveByName()` ile uygun profili seç; bkz. [Yazılım - Kumanda Profili](yazilim.md#kumanda-profili) |

### Servo Titrüyor / Düzensiz Hareket

**Belirti:** Servo pozisyon tutmuyor, aralıklı seğiriyor veya komut verilmeden hareket ediyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%55 | Güç sorunu | Servo ESP32'nin 5V/3.3V pininden besleniyor; bu pinler yeterli akımı veremez. Ayrı 5-6V kaynak (BEC/UBEC) kullan, toprakları ortak bağla |
| ~%35 | LEDC timer çakışması | Motor `analogWrite()` düşük LEDC kanallarını kullanır (0, 1, 2…); servo için yüksek kanal ver: `ledcAttachChannel(servoPin, 50, 14, 7)` |
| ~%10 | Mekanik | Servo kolu sıkışıyor veya taşıdığı yük çok fazla |

### Arayüz Açılmıyor / 403 Hatası

**Belirti:** `192.168.4.1` açılmıyor ya da tarayıcı "403 Forbidden" gösteriyor.

Probot tek cihaz kuralı uygular: robota ilk bağlanan cihaz sahip olur. Diğer cihazlar bağlanabilir ama 403 alır; arayüzü açamaz.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%60 | Başka bir cihaz sahip | Diğer cihazı WiFi'den çıkar ve yaklaşık 5 saniye bekle; sahiplik slotu boşalır |
| ~%30 | Yanlış WiFi ağına bağlı | Telefon veya tabletin bağlı olduğu ağı kontrol et; robotun SSID'sine bağlı olmalı |
| ~%10 | Tarayıcı adresi https'e çevirdi | Adres çubuğuna `http://192.168.4.1` olarak yaz; `https` değil |

### Motorlar Stop'ta Durmuyor

**Belirti:** Arayüzden Stop'a basıldıktan sonra motorlar dönmeye devam ediyor.

Stop kooperatiftir: o anki loop turu bittikten sonra aktif modun stop hook'u (`autonomousStop()` veya `teleopStop()`) çağrılır. Motorların durması için bu hook içine durdurma komutu yazılmış olması gerekir. Durdurma kodu her iki stop hook'una da yazılmalı; ortak bir `stopMotors()` fonksiyonu yazıp ikisinden de çağırmak en temizi.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%80 | `autonomousStop()` / `teleopStop()` boş veya motor durdurma kodu yok | İlgili stop hook'una motor pinlerini LOW'a çeken kod ekle; ortak bir `stopMotors()` yazıp ikisinden de çağır |
| ~%20 | Stop hook'u çok uzun sürdü; blocking işlem var | Stop hook'u hızlı dönmeli; içinde bekleme olmamalı |
