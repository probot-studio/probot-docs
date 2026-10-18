# Kısayollar

Sim'deki klavye tuşları, kumanda eşlemesi ve fare hareketleri bu sayfada.

## Sürüş tuşları {#surus-tuslari}

Tuşlar yalnız TeleOp sürülürken (durum rozeti "Canlı · …") çalışır ve programa **gamepad1** olarak gider.

| Tuş | gamepad1'de |
|---|---|
| <kbd>W</kbd> | **Sol çubuk** ileri |
| <kbd>S</kbd> | **Sol çubuk** geri |
| <kbd>A</kbd> | **Sağ çubuk** sola (dönüş) |
| <kbd>D</kbd> | **Sağ çubuk** sağa (dönüş) |
| <kbd>Q</kbd> | **Sol çubuk** sola (yana kayma) |
| <kbd>E</kbd> | **Sol çubuk** sağa (yana kayma) |
| <kbd>K</kbd> | **A** düğmesi |
| <kbd>L</kbd> | **B** düğmesi |
| <kbd>J</kbd> | **X** düğmesi |
| <kbd>I</kbd> | **Y** düğmesi |
| <kbd>↑</kbd> | **D-pad** yukarı |
| <kbd>↓</kbd> | **D-pad** aşağı |
| <kbd>←</kbd> | **D-pad** sol |
| <kbd>→</kbd> | **D-pad** sağ |
| <kbd>U</kbd> | **Sol bumper** |
| <kbd>O</kbd> | **Sağ bumper** |
| <kbd>Y</kbd> | **Sol tetik** (tam basılı) |
| <kbd>P</kbd> | **Sağ tetik** (tam basılı) |

- Tuş basılıyken değer tamdır (1). Yarım çubuk ya da yarım tetik klavyeyle verilemez.
- Aynı anda <kbd>W</kbd> ve <kbd>S</kbd>'ye basarsan birbirini götürür.
- Odak bir yazı ya da sayı kutusunda, açılır listede ya da sahnenin altındaki zaman kaydırıcısındayken tuşlar robota gitmez. Ok tuşları o sırada kaydırıcıyı oynatır. Robot tuşlara tepki vermezse sahneye tıkla, sonra tuşlara yeniden bas.
- Başka pencereye geçince basılı tuşlar bırakılır.

!!! warning "Dikkat"
    Sim tuşun harfine değil klavyedeki yerine bakar. Tablodaki harfler Q klavyeye göredir.
    Türkçe F klavyede Q klavyenin <kbd>W</kbd>'sinin yerindeki tuşa basarsın.

<!-- SAY: Klavyedeki on sekiz tuş kumandanın çubuklarına ve düğmelerine gidiyor. -->

## Diğer tuşlar

| Tuş | Nerede | Ne yapar |
|---|---|---|
| <kbd>Esc</kbd> | Menü açıkken | Menüyü kapatır. |
| <kbd>Enter</kbd> | Motor ve kütle kutusunda | Değeri işler. |
| <kbd>Esc</kbd> | Motor ve kütle kutusunda | Yazdığını siler, eski değere döner. |

Sim'de kaydet ya da geri al kısayolu yoktur.

<!-- SAY: Menüyü Esc ile kapatıyor, sayı kutusundaki değeri Enter ile işliyoruz. -->

## Fare

| Hareket | Nerede | Ne yapar |
|---|---|---|
| Sol tuşla sürükle | 3B sahne | Kamerayı döndürür. |
| Sağ tuşla sürükle | 3B sahne | Kamerayı kaydırır. |
| Tekerlek | 3B sahne | Yaklaştırır, uzaklaştırır. |
| Üstünde gezdir | 2B sahne | İmlecin yerini "x … · y … inç" olarak yazar. |

**Sürücü gözü** kamerasında fare çalışmaz. Bkz. [3B kamerayı kullan](gorunumu-degistir.md#3b-kamerayi-kullan).

<!-- SAY: 3B sahnede fareyle döndürüyor, kaydırıyor ve yaklaştırıyoruz. -->

## Kumanda {#kumanda}

USB ya da Bluetooth kumanda "standart" düzende okunur. Sim yalnız ilk bağlanan kumandayı okur ve onu **gamepad1** yapar.

| Kumandada (Xbox / PlayStation) | Blocks'ta (gamepad1 bloğu) |
|---|---|
| **Sol çubuk** | `LeftStickX`, `LeftStickY` |
| **Sağ çubuk** | `RightStickX`, `RightStickY` |
| **Sol çubuğa** basma | `LeftStickButton` |
| **Sağ çubuğa** basma | `RightStickButton` |
| **A** / **Çarpı (✕)** | `A` |
| **B** / **Daire (○)** | `B` |
| **X** / **Kare (□)** | `X` |
| **Y** / **Üçgen (△)** | `Y` |
| **LB** / **L1** | `LeftBumper` |
| **RB** / **R1** | `RightBumper` |
| **LT** / **L2** | `LeftTrigger` |
| **RT** / **R2** | `RightTrigger` |
| **D-pad** yukarı | `DpadUp` |
| **D-pad** aşağı | `DpadDown` |
| **D-pad** sol | `DpadLeft` |
| **D-pad** sağ | `DpadRight` |
| **Back** / **Share** | `Back` |
| **Start** / **Options** | `Start` |
| **Xbox** / **PS** düğmesi | `Guide` (Sim okur, ama Blocks araç kutusunda bu düğme için hazır blok yok.) |

- Çubuktaki küçük oynamalar (yüzde 6'nın altı) yok sayılır.
- Kumanda bağlıyken klavye de çalışır. İkisi aynı anda aynı düğmeye basarsa kumandanın değeri geçer.
- Sim'de dokunmatik ekran kumandası yoktur.
- Blocks'taki OnBot Java önizlemesinde aynı alanlar `gamepad1.left_stick_x` biçiminde görünür.

<!-- SAY: Bilgisayara bağlı kumandanın her düğmesi FTC programındaki gamepad1 düğmesine gidiyor. -->
