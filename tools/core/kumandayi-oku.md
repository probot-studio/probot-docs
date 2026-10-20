# Kumanda verisini oku

Bu sayfada kumandanın çubuk, düğme ve D-pad değerlerini kodda okuyacak, okuduğun değerleri Driver Station'ın **Telemetry** panelinde göreceksin.

## Başlamadan önce

- Programın altı fonksiyonu hazır. Bkz. [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).
- Kumanda, Driver Station'ı açtığın tablete ya da bilgisayara USB veya Bluetooth ile bağlı. Bkz. [İlk 10 dakika](ilk-10-dakika.md).

Kumanda verisi tarayıcıdan robota WiFi üzerinden gider. Kodda bu veriyi `probot::io::joystick_api` okur.

## Kumandayı oku ve ekrana yaz {#kumandayi-oku}

1. `teleopLoop()` içinde ilk satıra `auto js = probot::io::joystick_api::makeDefault();` yaz.
2. Altına `probot::clearTelemetry();` yaz. Panel her turda temizlenir.
3. Okumak istediğin değerleri `probot::printf` ile yaz.
4. Kodu robota yükle, Driver Station'da **Init**'e, sonra **Start**'a bas.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1
#include <probot.h>

void robotInit() {}
void robotEnd() {}
void autonomousInit() {}
void autonomousLoop() {}
void teleopInit() {}

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();   // her turda yeniden al

  probot::clearTelemetry();
  probot::printf("Sol: X=%.2f Y=%.2f\n", js.getLeftX(), js.getLeftY());
  probot::printf("Sag: X=%.2f Y=%.2f\n", js.getRightX(), js.getRightY());
  probot::printf("A=%d B=%d POV=%d\n", js.getA(), js.getB(), js.getPOV());
}
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

1. `robotInit()` içine `setActiveByName` satırını ekle.
2. Tırnak içine tablodaki adlardan birini yaz.
3. Kodu yükle ve **Init**'e bas.

```cpp
void robotInit() {
  probot::io::joystick_mapping::setActiveByName("standard");
}
```

| Ad | Ne zaman |
|---|---|
| `"logitech-f310"` / `"f310"` | Varsayılan |
| `"standard"` / `"xbox"` / `"xbox-one"` / `"ds4"` / `"dualshock-4"` / `"ps"` | W3C standart düzenini kullanan kumandalar |
| `"axis9-dpad"` | D-pad'i düğme yerine 9 numaralı eksenden gönderen kumandalar |
| `"tuna-default"` / `"tuna"` | Eski TunaGamepad düzeni. `getOptions()` yalnız bu eşlemede çalışır |

Sonuç: Düğmeler seçtiğin eşlemeye göre okunur. [Kumandayı oku ve ekrana yaz](#kumandayi-oku) bölümündeki kodla dene: **A**'ya basınca **Telemetry** panelinde "A=1" yazar.

Tanınmayan bir ad yazarsan kütüphane uyarı vermeden `logitech-f310`'u kullanır.

## Bağlantı koparsa {#baglanti-koparsa}

Kumanda verisi 500 ms gelmezse bütün çubuk ve düğmeler 0 okunur. Bu yüzden motor gücünü doğrudan çubuk değerine bağlamak güvenlidir: bağlantı kopunca motor durur.

Kumandanın bağlı olup olmadığını `js.isConnected()` ile sorabilirsin. Son 500 ms içinde veri geldiyse `true` döner.

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

## Sorun mu var?

- **Değerler hep 0 kalıyor:** Kumandada herhangi bir düğmeye bas. Tarayıcı kumandayı ilk düğme basışında tanır.
- **Yanlış düğme tetikleniyor ya da D-pad çalışmıyor:** Eşlemeyi değiştir. Bkz. [Kumanda eşlemesini değiştir](#esleme).
- **Çubuk bırakılınca motor yavaşça dönüyor:** Ölü bölgeyi büyüt. Bkz. [Ölü bölgeyi ayarla](#olu-bolge).
- **Panelde yazılar üst üste birikiyor:** Turun başına `probot::clearTelemetry();` ekle.

## Sonraki adım

[Motoru sür](motoru-sur.md)
