# Kumanda verisini oku

Bu sayfada kumandanın çubuk, düğme ve D-pad değerlerini kodda okuyacak, okuduğun değerleri Driver Station'ın **Telemetry** panelinde göreceksin.

## Başlamadan önce

- Programın fonksiyonları hazır. Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).
- Kumanda, Driver Station'ı açtığın tablete ya da bilgisayara USB veya Bluetooth ile bağlı. Bkz. [İlk 10 dakika](ilk-10-dakika.md). Kumandan yoksa klavyeyi ya da dokunmatik ekranı kullan: [Kumandasız sür](#kumandasiz-sur).

Kumanda verisi tarayıcıdan robota WiFi üzerinden gider. Kodda bu veriyi `probot::io::joystick_api` okur.

Kumanda değerleri koda yalnız **Start**'tan sonra, otonom ya da teleop çalışırken ulaşır. **Init** sırasında, `teleopInitLoop()` ve `autonomousInitLoop()` içinde bütün çubuk ve düğmeler 0 okunur. Böylece robot **Start**'tan önce kumandayla kımıldamaz.

## Kumandayı oku ve ekrana yaz {#kumandayi-oku}

1. `teleopLoop()` içinde ilk satıra `auto js = probot::io::joystick_api::makeDefault();` yaz.
2. Altına `probot::clearTelemetry();` yaz. Panel her turda temizlenir.
3. Okumak istediğin değerleri `probot::printf` ile yaz.
4. Kodu robota yükle. Driver Station'da **Teleoperated**'ı seç, **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void autonomousLoop() {}
void autonomousStop() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();   // her turda yeniden al

  probot::clearTelemetry();
  probot::printf("Sol: X=%.2f Y=%.2f\n", js.getLeftX(), js.getLeftY());
  probot::printf("Sag: X=%.2f Y=%.2f\n", js.getRightX(), js.getRightY());
  probot::printf("A=%d B=%d POV=%d\n", js.getA(), js.getB(), js.getPOV());
}

void teleopStop() {}
```

Sonuç: **Telemetry** panelinde "Sol: X=0.00 Y=0.00" satırı görünür. Sol çubuğu ileri itince Y değeri artı olur ve tam itince 1.00'a yaklaşır. **A**'ya basınca "A=1" yazar.

`makeDefault()` bağlantı kurmaz, en son gelen değerleri getirir. Her turda yeniden çağırmak normaldir.

## Çubukları oku {#cubuklar}

Çubuk değerleri -1 ile +1 arasında bir `float` sayıdır. Çubuk ortadayken 0 okunur.

| Fonksiyon | Ne okur |
|---|---|
| `getLeftX()` | Sol çubuk yatay. Sağa yatırınca artı |
| `getLeftY()` | Sol çubuk dikey. İleri itince artı |
| `getRightX()` | Sağ çubuk yatay. Sağa yatırınca artı |
| `getRightY()` | Sağ çubuk dikey. İleri itince artı |
| `getLeftTriggerAxis()` | Sol tetik. Basılıyken 1, bırakılınca 0 |
| `getRightTriggerAxis()` | Sağ tetik. Basılıyken 1, bırakılınca 0 |

Tetikler düğme gibi okunur. Ara değer vermez, yalnız 0 ya da 1 döner.

## Düğmeleri oku {#dugmeler}

Düğme fonksiyonları `bool` döner: basılıyken `true`, değilken `false`. PlayStation adları aynı düğmeyi okur.

| Xbox | PlayStation | Fonksiyon |
|---|---|---|
| **A** | **Cross** | `getA()` / `getCross()` |
| **B** | **Circle** | `getB()` / `getCircle()` |
| **X** | **Square** | `getX()` / `getSquare()` |
| **Y** | **Triangle** | `getY()` / `getTriangle()` |
| **LB** (sol omuz) | | `getLB()` |
| **RB** (sağ omuz) | | `getRB()` |
| **Back** | | `getBack()` |
| **Start** | | `getStart()` |
| **L3** (sol çubuğa bas) | **L3** | `getLeftStickButton()` |
| **R3** (sağ çubuğa bas) | **R3** | `getRightStickButton()` |

D-pad iki yoldan okunur:

```cpp
// Her yön ayrı bool
js.getDpadUp();
js.getDpadRight();
js.getDpadDown();
js.getDpadLeft();

// Tek sayı olarak açı
js.getPOV();   // -1 = basılı değil, 0 = yukarı, 90 = sağ, 180 = aşağı, 270 = sol
```

Eşlemeye takılmadan ham değer okumak için `getRawAxis(i)` ve `getRawButton(i)` var. En fazla 20 eksen ve 20 düğme okunur.

## Ölü bölgeyi ayarla {#olu-bolge}

Çubuk bırakılınca tam 0'a dönmeyebilir. Kütüphane mutlak değeri ölü bölgenin altında kalan değeri 0 yapar. Varsayılan ölü bölge 0,08'dir.

Çubuk bırakıldığı hâlde motor yavaşça dönüyorsa ölü bölgeyi büyüt:

```cpp
probot::io::joystick_api::Options opt;
opt.deadzone = 0.12f;   // varsayılan 0.08
auto js = probot::io::joystick_api::makeDefault(opt);
```

Ölü bölgenin üstündeki değerler olduğu gibi gelir, yeniden ölçeklenmez.

## Kumanda eşlemesini değiştir {#esleme}

Eşleme, kumandanın hangi numaralı düğmesinin hangi ada karşılık geldiğini belirler. Varsayılan eşleme `logitech-f310`'dur ve W3C standart düzeniyle aynıdır.

1. `teleopInit()` ve `autonomousInit()` içine `setActiveByName` satırını ekle.
2. Tırnak içine tablodaki adlardan birini yaz.
3. Kodu yükle. Driver Station'da modu seç ve **Init**'e bas.

```cpp
void autonomousInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}

void teleopInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Ad | Ne zaman |
|---|---|
| `"logitech-f310"` / `"f310"` | Varsayılan |
| `"standard"` / `"xbox"` / `"xbox-one"` / `"ds4"` / `"dualshock-4"` / `"ps"` | W3C standart düzenini kullanan kumandalar |
| `"axis9-dpad"` | D-pad'i düğme yerine 9 numaralı eksenden gönderen kumandalar |
| `"tuna-default"` / `"tuna"` | Eski TunaGamepad düzeni. `getOptions()` yalnız bu eşlemede çalışır |

Sonuç: Düğmeler seçtiğin eşlemeye göre okunur. [Kumandayı oku ve ekrana yaz](#kumandayi-oku) bölümündeki kodla dene: **Start**'tan sonra **A**'ya basınca **Telemetry** panelinde "A=1" yazar.

Eşleme robot kapanana kadar geçerli kalır. İki init fonksiyonuna da yazarsan hangi modla başlarsan başla aynı eşleme kullanılır. Tanınmayan bir ad yazarsan kütüphane uyarı vermeden `logitech-f310`'u kullanır.

## Kumandasız sür {#kumandasiz-sur}

Kumandan yoksa Driver Station'ı açtığın cihazın klavyesi ya da dokunmatik ekranı kumandanın yerine geçer. Kod değişmez; değerler aynı fonksiyonlarla okunur. İki kaynak da kendiliğinden açılmaz, elle açılır.

1. Driver Station'da **Joystick** sekmesine bas.
2. Bilgisayardaysan **Input Source** bölümünde **Klavye** kartındaki **Etkinleştir**'e bas. Telefondaysan **Dokunmatik** kartındaki **Etkinleştir**'e bas.
3. **Dashboard**'da modu seç, **Init**'e, sonra **Start**'a bas. Dokunmatikte bunlar [sürüş ekranının](arayuz.md#surus-ekrani) üst barındadır.
4. Klavyede <kbd>W</kbd>'ye basılı tut. Dokunmatikte sol çubuğu yukarı sürükle.

Sonuç: Kartta "Etkin" yazar. **System Status**'ta **Joystick** "Klavye" ya da "Dokunmatik" olur. [Kumandayı oku ve ekrana yaz](#kumandayi-oku) bölümündeki kodla **Telemetry** panelinde Y değeri 1.00'a yaklaşır.

| Kaynak | Çubuklar | Düğmeler |
|---|---|---|
| **Klavye** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> sol çubuk, ok tuşları sağ çubuk. Tuşa basılı tuttukça değer kısa sürede 1'e çıkar. | <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>: **A**, **B**, **X**, **Y**. <kbd>Q</kbd> <kbd>E</kbd>: **LB**, **RB**. |
| **Dokunmatik** | Ekranın alt köşelerinde iki çubuk. | **A**, **B**, **X**, **Y**. |

İki kaynakta da tetik, D-pad, **Back** ve **Start** yoktur. Klavye, imleç bir yazı kutusundayken (ör. **Autonomous süresi**) tuşları robota göndermez. <kbd>Space</kbd> her iki durumda da **Emergency Stop**'tur.

## Bağlantı koparsa {#baglanti-koparsa}

Kumanda verisi 500 ms gelmezse bütün çubuk ve düğmeler 0 okunur. Bu yüzden motor gücünü doğrudan çubuk değerine bağlamak güvenlidir: bağlantı kopunca motor durur. Kumandayı çıkarırsan ya da kaynağı değiştirirsen Driver Station robota o anda sıfır değer gönderir; 500 ms beklenmez.

Kumanda verisinin koda ulaşıp ulaşmadığını `js.isConnected()` ile sorabilirsin. Robot çalışırken son 500 ms içinde veri geldiyse `true` döner. **Init** sırasında `false` döner.

Süreyi `#include <probot.h>` satırından önce `#define PROBOT_INPUT_TIMEOUT_MS 300` gibi bir satırla değiştirebilirsin. Varsayılan 500'dür.

## Telemetry paneline yaz {#telemetri}

Telemetri, koddan Driver Station'daki **Telemetry** paneline yazı gönderir. Bilgisayarı robota bağlamadan değerleri sahada görürsün.

```cpp
probot::print("merhaba");
probot::println("satır sonu ekler");
probot::printf("hiz=%.2f\n", hiz);
probot::clearTelemetry();
```

- Panelin arkasında 256 baytlık bir tampon var. Tampon dolunca en eski yazı silinir.
- Bir `printf` çağrısı en fazla 127 karakter yazar. Fazlası kesilir.
- Her turun başında `clearTelemetry()` çağır. Çağırmazsan eski satırlar birikir.
- Telemetri `teleopInitLoop()` ve `autonomousInitLoop()` içinde de çalışır. **Start**'tan önce sensör değerlerini panelde görmek için kullanabilirsin.

## Sorun mu var?

- **Değerler hep 0 kalıyor:** Kumandada herhangi bir düğmeye bas; tarayıcı kumandayı ilk düğme basışında tanır. Robotun **Init**'te değil, **Start**'tan sonra çalıştığını kontrol et.
- **Yanlış düğme tetikleniyor ya da D-pad çalışmıyor:** Eşlemeyi değiştir. Bkz. [Kumanda eşlemesini değiştir](#esleme).
- **Çubuk bırakılınca motor yavaşça dönüyor:** Ölü bölgeyi büyüt. Bkz. [Ölü bölgeyi ayarla](#olu-bolge).
- **Klavye tuşları robota gitmiyor:** **Klavye** kartında "Etkin" yazdığını kontrol et. İmleç bir yazı kutusundaysa sayfanın boş bir yerine tıkla.
- **Panelde yazılar üst üste birikiyor:** Turun başına `probot::clearTelemetry();` ekle.

## Sonraki adım

[Motoru sür](motoru-sur.md)
