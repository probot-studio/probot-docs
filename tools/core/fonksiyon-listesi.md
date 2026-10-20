# Fonksiyon ve durum listesi

Bu sayfa Probot Core 0.3.0'ın koddan kullanabileceğin bütün fonksiyonlarını, robot durumu alanlarını ve HTTP adreslerini listeler.

Hepsi `#include <probot.h>` ile gelir.

## Altı fonksiyon {#hooklar}

`setup()` ve `loop()` kütüphaneye aittir; kodunda yazma. Kodun şu altı fonksiyonu tanımlamak zorundadır. İçleri boş olabilir ama biri eksikse kod derlenmez.

| Fonksiyon | Ne zaman çağrılır |
|---|---|
| `robotInit()` | Driver Station'da **Init**'e her basışta bir kez. Pin ayarları ve başlangıç değerleri buraya. |
| `autonomousInit()` | **Start**'ta, **Autonomous** anahtarı açıksa bir kez. |
| `autonomousLoop()` | Otonom boyunca tekrar tekrar. Her turdan sonra kütüphane 20 ms bekler. |
| `teleopInit()` | Teleop başlarken bir kez: otonom süresi dolunca, otonom çalışırken **Autonomous** anahtarı kapatılınca ya da anahtar kapalıyken **Start**'a basılınca. |
| `teleopLoop()` | Teleop boyunca tekrar tekrar, her turdan sonra 20 ms beklenerek. |
| `robotEnd()` | **Stop**'ta, Driver Station bağlantısı 10 saniye kopunca (varsayılan ayarla) ve acil durdurmada bir kez. Motorları burada durdur. |

Otonomdan teleopa geçerken `robotEnd()` çağrılmaz. Altı fonksiyonun hepsi aynı görevde sırayla çalışır; bir faz değişikliği o anki tur bitince uygulanır.

Bir loop turu 2 saniyeyi geçerse kumanda girişleri sıfırlanır ve durum LED'i kırmızı yanıp söner. Kod durdurulmaz; tur bitince her şey normale döner. Ayrıntı: [Otonomu yaz](otonom-yaz.md).

## Kumanda {#kumanda}

```cpp
auto js = probot::io::joystick_api::makeDefault();
```

`makeDefault()` hafif bir nesne döndürür; her loop turunda yeniden çağırmak normaldir.

| Fonksiyon | Dönüş | Açıklama |
|---|---|---|
| `getLeftX()`, `getLeftY()` | `float` -1..+1 | Sol çubuk. Y yukarı itilince pozitif. |
| `getRightX()`, `getRightY()` | `float` -1..+1 | Sağ çubuk. |
| `getLeftTriggerAxis()`, `getRightTriggerAxis()` | `float` 0 ya da 1 | Tetikler. Basılıysa 1, değilse 0; ara değer yok. |
| `getA()`, `getB()`, `getX()`, `getY()` | `bool` | Xbox adlarıyla tuşlar. |
| `getCross()`, `getCircle()`, `getSquare()`, `getTriangle()` | `bool` | PlayStation adlarıyla aynı tuşlar (A, B, X, Y). |
| `getLB()`, `getRB()` | `bool` | Omuz tuşları. |
| `getBack()`, `getStart()` | `bool` | Orta tuşlar. |
| `getOptions()` | `bool` | Yalnız `tuna-default` eşlemesinde çalışır. |
| `getLeftStickButton()`, `getRightStickButton()` | `bool` | Çubuğa basma (L3, R3). |
| `getPOV()` | `int` | Yön tuşları: -1 basılı değil, 0 yukarı, 90 sağ, 180 aşağı, 270 sol. |
| `getDpadUp()`, `getDpadRight()`, `getDpadDown()`, `getDpadLeft()` | `bool` | Tek bir yön tuşu. |
| `getRawAxis(i)`, `getRawButton(i)` | `float` / `bool` | Eşlemesiz ham eksen ve tuş. Olmayan numara 0 / `false` döner. |
| `isConnected()` | `bool` | Son 500 ms içinde kumandadan veri geldiyse `true`. |
| `getAxisCount()`, `getButtonCount()` | `uint32_t` | Kumandanın gönderdiği eksen ve tuş sayısı. |
| `getSeq()`, `getMs()` | `uint32_t` | Gelen paket sayacı ve son paketin zamanı. |

Kumanda verisi 500 ms gelmezse bütün eksenler 0, bütün tuşlar `false` okunur. Bu süre `PROBOT_INPUT_TIMEOUT_MS` ile değişir: [Ayar makroları](makro-listesi.md).

**Ayarlar.** `Options` ile ölü bölgeyi ve Y yönünü değiştirebilirsin:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // varsayılan 0.08: bu değerin altı 0 okunur
auto js = probot::io::joystick_api::makeDefault(opt);
```

| Alan | Varsayılan | Anlamı |
|---|---|---|
| `deadzone` | `0.08f` | Mutlak değeri bunun altında kalan eksen 0 okunur. |
| `invertY` | `true` | Y eksenini çevirir, böylece yukarı pozitif olur. |
| `useMappingInvert` | `true` | Eşlemenin kendi Y çevirme ayarını da uygular. |

Yerleşik eşlemelerin hepsi Y'yi kendisi çevirir. Y yönünü gerçekten değiştirmek için `invertY` ve `useMappingInvert` ikisini birden `false` yap.

**Kumanda eşlemesi.** Varsayılan `logitech-f310`'dur. Başka bir kumanda için `robotInit()` içinde eşlemeyi seç:

```cpp
probot::io::joystick_mapping::setActiveByName("standard");
```

| Ad | Eşleme |
|---|---|
| `"logitech-f310"`, `"f310"` | Logitech F310 (varsayılan) |
| `"standard"`, `"xbox"`, `"xbox-one"`, `"ds4"`, `"dualshock-4"`, `"ps"` | Tarayıcının standart düzeni |
| `"axis9-dpad"` | Yön tuşlarını 9. eksenden okuyan kumandalar |
| `"tuna-default"`, `"tuna"` | Tuna düzeni (`getOptions()` yalnız bunda çalışır) |

Tanınmayan bir ad yazarsan hata çıkmaz; `logitech-f310` kullanılır.

## Telemetri {#telemetri}

Telemetri, Driver Station'ın **Dashboard** sekmesindeki **Telemetry** paneline yazar.

| Fonksiyon | Ne yapar |
|---|---|
| `probot::print("metin")` | Metni yazar, satır atlamaz. |
| `probot::println("metin")` | Metni yazar ve satır atlar. Boş çağrı yalnız satır atlar. |
| `probot::printf("hiz=%.2f\n", hiz)` | Biçimli yazar. Tek çağrıda en çok 127 karakter. |
| `probot::clearTelemetry()` | Paneli temizler. |

Panel 256 baytlık bir tampon gösterir; dolunca en eski satırlar düşer. Her turda güncellenen bir değer için turun başında `clearTelemetry()` çağır.

<a id="robot-durumu-ileri-seviye"></a>
## Robot durumu {#robot-durumu}

`probot::robot::state().read()` robotun o anki durumunun bir kopyasını verir. Kopya tek seferde alınır; alanlar birbiriyle tutarlıdır.

```cpp
auto s = probot::robot::state().read();
```

| Alan | Tür | Anlamı |
|---|---|---|
| `s.status` | `Status` | Driver Station'ın son komutu: `INIT`, `START`, `STOP`. |
| `s.phase` | `Phase` | Robotun şu anki fazı: `NOT_INIT`, `INITED`, `AUTONOMOUS`, `TELEOP`. |
| `s.autonomousEnabled` | `bool` | **Autonomous** anahtarı açık mı. Otonom süresi dolunca `false` olur. |
| `s.autoPeriodSeconds` | `int32_t` | Otonom süresi (saniye). Varsayılan 30. |
| `s.autoStartMs` | `uint32_t` | Otonomun başladığı an (`millis()` cinsinden). `autonomousInit()` çağrılmadan önce yazılır. |
| `s.clientCount` | `int32_t` | Robotu yöneten bir Driver Station varsa 1, yoksa 0. |
| `s.deadlineMiss` | `bool` | Şu an bir loop turu 2 saniyeyi aşmış durumda mı. |
| `s.batteryVoltage` | `float` | Kodun kaydettiği batarya gerilimi (V). Kaydetmezsen 0. |
| `s.ms`, `s.seq` | `uint32_t` | Son değişikliğin zamanı ve değişiklik sayacı. |

Enum değerleri tam adla yazılır, ör. `s.phase == probot::robot::Phase::TELEOP`.

Tek alan için kısa yollar: `probot::robot::state().phase()`, `.status()`, `.autonomousEnabled()`, `.autoPeriodSeconds()`, `.autoStartMs()`.

Koddan yazılabilen tek alan batarya gerilimidir:

```cpp
probot::robot::state().setBatteryVoltage(millis(), volt);
```

Ölçüm devresi ve tam kod: [Batarya gerilimini ölç](bataryayi-olc.md). Diğer `set...` fonksiyonlarını kütüphane kullanır; kodundan çağırırsan Driver Station'la çelişir.

## Acil durdurma {#acil-durdurma}

`probot::emergencyStop()` Driver Station'daki **EMERGENCY STOP** ile aynı işi yapar ve altı fonksiyonun herhangi birinin içinden çağrılabilir.

Acil durdurmada sırasıyla:

1. Robot kilitlenir.
2. `PROBOT_ESTOP_ENABLE_PIN` tanımlıysa LOW olur.
3. Çalışan kodun durdurulur.
4. `robotEnd()` en çok 500 ms içinde çalıştırılır; bitmezse kart yeniden başlar.

Robot yeniden başlatılana kadar **EMERGENCY STOP** ve **Reboot Robot** dışındaki komutlar çalışmaz. Kilidi açmak için **Reboot Robot**'a bas ya da gücü kapatıp aç.

Aşağıdaki kod Back ve Start birlikte basılınca acil durdurma yapar ve otonomda kalan süreyi telemetriye yazar:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

void robotInit() {
  // Kumanda eşlemesini seç
  probot::io::joystick_mapping::setActiveByName("standard");
}

void robotEnd() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Back ve Start birlikte basılırsa acil durdurma
  if (js.getBack() && js.getStart()) {
    probot::emergencyStop();
  }
}

void autonomousInit() {}

void autonomousLoop() {
  auto s = probot::robot::state().read();

  // Otonomun bitmesine kalan süre (ms)
  int32_t elapsed = (int32_t)(millis() - s.autoStartMs);
  int32_t remaining = s.autoPeriodSeconds * 1000 - elapsed;

  probot::clearTelemetry();
  probot::printf("Kalan: %ld ms\n", (long)remaining);
}
```

!!! warning "Dikkat"
    Kart tamamen kilitlenirse yazılımla acil durdurma çalışmaz. Gerçek güvenlik için motorların güç hattına donanım bir acil durdurma anahtarı koy.

## HTTP adresleri {#http}

Robot `192.168.4.1` adresinde tek bir sunucu çalıştırır. Driver Station bu adresleri kullanır; kendi aracını yazmıyorsan bunlara ihtiyacın yoktur.

"Sahip" sütunu: robota ilk istek atan cihaz sahip olur ve korumalı adresler yalnız ona cevap verir. Diğer cihazlar `403` alır. Sahip 5 saniye istek atmazsa yer boşalır.

| Adres | Sahip gerekir | Ne verir |
|---|---|---|
| `/` | evet | Driver Station arayüzü |
| `/joystick` (WebSocket) | evet | Kumanda verisi, durum ve telemetri |
| `/updateController` (POST) | evet | WebSocket yokken kumanda verisi |
| `/robotControl?cmd=init`, `start`, `stop`, `cancelAuto` | evet | Faz komutları. `auto=0/1` ve `autoLen=N` ile otonom ayarı. Acil durdurma kilidinde `estop` ve `reboot` dışındaki bütün komutlar `409` döner. |
| `/robotControl?cmd=estop` | evet | Acil durdurma |
| `/robotControl?cmd=reboot` | evet | Kartı yeniden başlatır |
| `/setChannel?ch=N` | evet | Kanalı kaydeder. 1-13 ise robot CSA duyurusuyla o kanala geçer; çoğu cihaz bağlantıyı korur, bazıları kopup yeniden bağlanır. `0` kaydı siler. |
| `/getState` | evet | Faz ve otonom durumu (JSON) |
| `/telemetry` | evet | Telemetri metni |
| `/getBattery` | hayır | Batarya gerilimi, tek ondalık |
| `/health` | hayır | Sinyal ve bağlantı bilgisi (JSON) |
| `/info` | hayır | Ağ adı, kanal, IP, kart bilgisi |
| `/portal` | hayır | Ağa katılınca açılan karşılama sayfası |

`/getState` cevabı:

```json
{"phase":3,"autonomousEnabled":false,"autoPeriodSeconds":30,"autoRemainingMs":0,"estop":false}
```

`phase` sayısı: 0 `NOT_INIT`, 1 `INITED`, 2 `AUTONOMOUS`, 3 `TELEOP`.

`/health` alanları: `rssi` sinyal gücü, `up` açık kalma süresi (ms), `heap` boş bellek, `dm` loop turu 2 saniyeyi aştı mı, `joyAgeMs` son kumanda paketinin yaşı (-1 hiç gelmedi), `sta` bağlı cihaz sayısı, `disc` son bağlantı kopmasının sebep kodu.

WebSocket çerçevelerinin bayt düzeni: [Probot Core 0.3.0 API referansı](https://github.com/probot-studio/probot-core/blob/0.3.0/API.md).
