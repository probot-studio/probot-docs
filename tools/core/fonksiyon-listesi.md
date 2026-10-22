# Fonksiyon ve durum listesi

Bu sayfa Probot Core 0.4.0'ın koddan kullanabileceğin bütün fonksiyonlarını, robot durumu alanlarını ve HTTP adreslerini listeler.

Hepsi `#include <probot.h>` ile gelir.

## Mod fonksiyonları {#hooklar}

`setup()` ve `loop()` kütüphaneye aittir; kodunda yazma. Kütüphane maçın belli anlarında aşağıdaki fonksiyonları çağırır. Zorunlu olanlar boş da olsa tanımlanmalıdır; biri eksikse kod bağlanmaz. Tanımlamadığın isteğe bağlı fonksiyon boş sayılır.

| Fonksiyon | Ne zaman çağrılır | Zorunlu |
|---|---|---|
| `autonomousInit()` | **Autonomous** seçiliyken **Init**'e her basışta bir kez. Pin ayarları ve başlangıç değerleri buraya. | Hayır |
| `autonomousInitLoop()` | Otonomun **Init**'i ile **Start**'ı arasında tekrar tekrar. Kumanda 0 okunur; burada robotu hareket ettirme. | Hayır |
| `autonomousStart()` | **Start**'ta, `autonomousLoop()`'tan önce bir kez. Otonom süresi bu fonksiyon bitince başlar. | Hayır |
| `autonomousLoop()` | Otonom boyunca tekrar tekrar. Her turdan sonra kütüphane 20 ms bekler. | Evet |
| `autonomousStop()` | Otonomun Init ya da çalışma evresinden her çıkışta bir kez: **Stop**, otonom süresinin dolması, Driver Station bağlantısının 10 saniye kopması (varsayılan ayarla), acil durdurma. | Evet |
| `teleopInit()` | **Teleoperated** seçiliyken **Init**'e her basışta bir kez. | Hayır |
| `teleopInitLoop()` | Teleopun **Init**'i ile **Start**'ı arasında tekrar tekrar. | Hayır |
| `teleopStart()` | **Start**'ta, `teleopLoop()`'tan önce bir kez. | Hayır |
| `teleopLoop()` | Teleop boyunca tekrar tekrar, her turdan sonra 20 ms beklenerek. | Evet |
| `teleopStop()` | Teleopun Init ya da çalışma evresinden her çıkışta bir kez: **Stop**, bağlantı kopması, acil durdurma. | Evet |

Otonom süresi dolunca `autonomousStop()` çalışır ve **Teleoperated** seçilir. Teleop kendiliğinden başlamaz; **Init** ve **Start** gerekir.

Bütün fonksiyonlar aynı görevde sırayla çalışır. Bir faz değişikliği o anki tur bitince uygulanır. Global değişkenler modlar arasında değerini korur.

Bir initLoop ya da loop turu 2 saniyeyi geçerse kumanda girişleri sıfırlanır ve durum LED'i kırmızı yanıp söner. Init, start ve stop fonksiyonları için sınır 10 saniyedir. Kod durdurulmaz; tur bitince her şey normale döner. Ayrıntı: [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md#loop-kurali).

0.3.0'daki `robotInit()` ve `robotEnd()` kaldırıldı. Kodunda kalırsa derleme "redefinition of 'void robotInit()'" hatasıyla durur: [0.3.0 kodunu taşı](hooklari-yaz.md#gecis).

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

Kumanda verisi yalnız bir mod çalışırken, yani **Start**'tan sonra koda ulaşır. Init evresinde, robot dururken ve bir loop turu takıldığında bütün eksenler 0, bütün tuşlar `false` okunur; `isConnected()` `false` döner.

Kumanda verisi 500 ms gelmezse de bütün eksenler 0, bütün tuşlar `false` okunur. Bu süre `PROBOT_INPUT_TIMEOUT_MS` ile değişir: [Ayar makroları](makro-listesi.md#baglanti).

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

**Kumanda eşlemesi.** Varsayılan `logitech-f310`'dur. Başka bir kumanda için modun init fonksiyonunda eşlemeyi seç, ör. `teleopInit()` içinde:

```cpp
probot::io::joystick_mapping::setActiveByName("standard");
```

| Ad | Eşleme |
|---|---|
| `"logitech-f310"`, `"f310"` | Logitech F310 (varsayılan) |
| `"standard"`, `"xbox"`, `"xbox-one"`, `"ds4"`, `"dualshock-4"`, `"ps"` | Tarayıcının standart düzeni |
| `"axis9-dpad"` | Yön tuşlarını 9. eksenden okuyan kumandalar |
| `"tuna-default"`, `"tuna"` | Tuna düzeni (`getOptions()` yalnız bunda çalışır) |

Tanınmayan bir ad yazarsan hata çıkmaz; `logitech-f310` kullanılır. Seçilen eşleme modlar arasında korunur.

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
| `s.status` | `Status` | Driver Station'ın son kabul edilen komutu: `INIT`, `START`, `STOP`. Otonom süresi dolunca `STOP` olur. |
| `s.phase` | `Phase` | Kütüphanenin geçişini tamamladığı faz. Değerler aşağıdaki tabloda. |
| `s.selectedMode` | `OpMode` | Driver Station'da seçili mod: `AUTO` ya da `TELEOP`. Otonom süresi dolunca `TELEOP` olur. |
| `s.autoPeriodSeconds` | `int32_t` | Otonom süresi (saniye). Varsayılan 30. |
| `s.autoStartMs` | `uint32_t` | Otonomun çalışmaya başladığı an (`millis()` cinsinden). `autonomousStart()` bittikten sonra yazılır; `autonomousLoop()` içinde günceldir. |
| `s.clientCount` | `int32_t` | Robotu yöneten bir Driver Station varsa 1, yoksa 0. |
| `s.deadlineMiss` | `bool` | Şu an bir tur süre sınırını aşmış durumda mı. |
| `s.batteryVoltage` | `float` | Son batarya gerilimi (V), 0,1 V adımla. 0 veri yok demektir. |
| `s.ms`, `s.seq` | `uint32_t` | Son değişikliğin zamanı ve değişiklik sayacı. |

| `Phase` | Sayı | Anlamı |
|---|---|---|
| `STOPPED` | 0 | Robot duruyor. Mod seçilebilir. |
| `AUTO_INIT` | 1 | Otonomun Init evresi. |
| `AUTO_RUN` | 2 | Otonom çalışıyor. |
| `TELEOP_INIT` | 3 | Teleopun Init evresi. |
| `TELEOP_RUN` | 4 | Teleop çalışıyor. |
| `TRANSITION` | 5 | Otonom süresi doldu; teleop seçili, **Init** bekleniyor. |

Sayılar Driver Station'ın aldığı `phase` değeridir. `Status` sayıları: 0 `INIT`, 1 `START`, 2 `STOP`.

Enum değerleri tam adla yazılır, ör. `s.phase == probot::robot::Phase::TELEOP_RUN` ya da `s.selectedMode == probot::robot::OpMode::AUTO`.

Tek alan için kısa yollar: `probot::robot::state().phase()`, `.status()`, `.selectedMode()`, `.autoPeriodSeconds()`, `.autoStartMs()`.

Robot durumundaki `set...` fonksiyonlarını kütüphane kullanır; kodundan çağırırsan Driver Station'la çelişir. Batarya gerilimi için aşağıdaki fonksiyonu kullan.

## Batarya {#batarya}

Kütüphane batarya gerilimini iki yoldan kendisi ölçebilir: gerilim bölücü ya da INA219 / INA226 sensörü. Yöntemi makroyla seçersin: [Ayar makroları](makro-listesi.md#batarya). Ölçüm devresi: [Batarya gerilimini ölç](bataryayi-olc.md).

| Fonksiyon | Ne yapar |
|---|---|
| `probot::setBatteryVoltage(volt)` | Kendi ölçtüğün gerilimi (V) robot durumuna yazar. Değer 0,1 V adıma yuvarlanınca değişmiyorsa yazmaz; her turda çağırmak sorun değildir. |
| `probot::io::battery::currentAmps()` | INA sensöründen okunan anlık akım (A). Yalnız `PROBOT_BATTERY_INA` tanımlıyken vardır. |

`PROBOT_BATTERY_ADC_PIN` ya da `PROBOT_BATTERY_INA` tanımlıyken `probot::setBatteryVoltage()` çağırma. Kütüphanenin ölçümü yaklaşık 250 ms'de bir değerin üzerine yazar.

## Acil durdurma {#acil-durdurma}

`probot::emergencyStop()` Driver Station'daki **Emergency Stop** ile aynı işi yapar ve bütün mod fonksiyonlarının içinden çağrılabilir.

Acil durdurmada sırasıyla:

1. Robot kilitlenir.
2. `PROBOT_ESTOP_ENABLE_PIN` tanımlıysa LOW olur.
3. Çalışan kodun durdurulur.
4. Bir mod Init ya da çalışma evresindeyse o modun stop fonksiyonu en çok 500 ms içinde çalıştırılır; bitmezse kart yeniden başlar. Robot dururken ya da geçiş evresindeyse stop fonksiyonu çağrılmaz.

**Telemetry** panelinde şu satır çıkar:

```text
!! [PB-E302] EMERGENCY STOP — robot disabled, reboot required — docs/hatalar#pb-e302
```

Robot yeniden başlatılana kadar **Emergency Stop** ve **Reboot Robot** dışındaki komutlar çalışmaz. Kilidi açmak için **Reboot Robot**'a bas ya da gücü kapatıp aç.

Aşağıdaki kod Back ve Start birlikte basılınca acil durdurma yapar ve otonomda kalan süreyi telemetriye yazar:

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

void teleopInit() {
  // Kumanda eşlemesini seç
  probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();

  // Back ve Start birlikte basılırsa acil durdurma
  if (js.getBack() && js.getStart()) {
    probot::emergencyStop();
  }
}

void teleopStop() {}

void autonomousLoop() {
  auto s = probot::robot::state().read();

  // Otonomun bitmesine kalan süre (ms)
  int32_t elapsed = (int32_t)(millis() - s.autoStartMs);
  int32_t remaining = s.autoPeriodSeconds * 1000 - elapsed;

  probot::clearTelemetry();
  probot::printf("Kalan: %ld ms\n", (long)remaining);
}

void autonomousStop() {}
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
| `/robotControl?cmd=mode&val=auto`, `val=teleop` | evet | Modu seçer. Yalnız robot dururken ya da geçiş evresinde kabul edilir. |
| `/robotControl?cmd=init`, `start`, `stop` | evet | Faz komutları. `autoLen=N` ile otonom süresi (saniye) verilir. `init` yalnız robot dururken ya da geçişte, `start` yalnız Init evresinde kabul edilir. `stop` Init ya da çalışma evresinde, ayrıca kabul edilmiş ama henüz uygulanmamış bir `init` ya da `start` varken kabul edilir. |
| `/robotControl?cmd=estop` | evet | Acil durdurma |
| `/robotControl?cmd=reboot` | evet | Kartı yeniden başlatır |
| `/setChannel?ch=N` | evet | Kanalı kaydeder. 1-13 ise robot CSA duyurusuyla o kanala geçer; çoğu cihaz bağlantıyı korur, bazıları kopup yeniden bağlanır. `0` kaydı siler. |
| `/getState` | evet | Komut, faz, seçili mod, otonom ve batarya durumu (JSON) |
| `/telemetry` | evet | Telemetri metni |
| `/getBattery` | hayır | Batarya gerilimi, tek ondalık |
| `/health` | hayır | Sinyal ve bağlantı bilgisi (JSON) |
| `/info` | hayır | Ağ adı, kanal ve kanalın kaynağı, IP, kart bilgisi |
| `/portal` | hayır | Ağa katılınca açılan karşılama sayfası |

Geçersiz evredeki bir komut `409` döner. Cevabın gövdesi sebebi yazar:

```text
[PB-E409] STOP before changing mode — docs/hatalar#pb-e409
[PB-E409] INIT requires STOPPED — docs/hatalar#pb-e409
[PB-E409] START requires INIT — docs/hatalar#pb-e409
[PB-E409] STOP requires INIT or RUN — docs/hatalar#pb-e409
EMERGENCY STOPPED — reboot required
```

Son satır acil durdurma kilidindedir; `estop` ve `reboot` dışındaki bütün komutlar bu cevabı alır. Ayrıntı: [Hatalar ve sorun giderme](sorunlar.md#pb-e409).

`/getState` cevabı:

```json
{"status":1,"phase":4,"selectedMode":"teleop","autoPeriodSeconds":30,"autoRemainingMs":0,"batt":12.4,"estop":false}
```

`status` ve `phase` sayıları [Robot durumu](#robot-durumu) bölümündeki gibidir. `batt` 0.0 ise batarya verisi yoktur. `autoRemainingMs` yalnız otonom çalışırken 0'dan büyüktür.

`/health` alanları: `rssi` sinyal gücü, `up` açık kalma süresi (ms), `heap` boş bellek, `dm` bir tur süre sınırını aştı mı, `joyAgeMs` son kumanda paketinin yaşı (-1 hiç gelmedi), `sta` bağlı cihaz sayısı, `disc` son bağlantı kopmasının sebep kodu.

`/info` içindeki `chSource` kanalın nereden geldiğini yazar: `macro` koddaki makro, `nvs` **Kanal Değiştir** ile kaydedilen kanal, `auto` otomatik kanal seçimi.

WebSocket çerçevelerinin bayt düzeni: [Probot Core 0.4.0 API referansı](https://github.com/probot-studio/probot-core/blob/0.4.0/API.md).
