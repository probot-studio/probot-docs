# FTC örneğiyle başla

Bu sayfada FTC Blocks'taki sekiz hazır programdan birini açacaksın. Örnek kendi cihaz listesiyle gelir;
çalışma alanı ve **Robot yapılandırması** örneğe göre dolar.

## Başlamadan önce

- Blocks açık. Bkz. [İlk 10 dakika](ilk-10-dakika.md), "Blocks'u aç" bölümü.

## Örnek aç

!!! warning "Dikkat"
    Örnek, FTC çalışma alanındaki programın yerine geçer ve onay sormaz. **Robot yapılandırması** da
    örneğin cihazlarıyla değişir (ör. **Tank Şasi TeleOp**'ta `left_drive`, `right_drive`). Programını
    korumak için önce **.blk indir**'e bas.

1. Araç çubuğunda **FTC Blocks** sekmesine bas.
2. Araç çubuğunda **Örnek seç**'e bas.
3. "FTC örnekleri" penceresinde bir örnek kartı seç, ör. **Tank Şasi TeleOp**.
   Köşede "Tank Şasi TeleOp örneği yüklendi." bildirimi çıkar.
   ![FTC örnekleri penceresi; Tank Şasi TeleOp kartı 3 numarayla işaretli.](img/blocks-ftc-ornek-pencere.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=FTC Blocks sekmesi, Örnek seç açık | hedef=role=dialog >> text="Tank Şasi TeleOp" | isaret=3 | bekle=text="FTC örnekleri" -->
   <!-- SAY: FTC örnekleri arasından hazır bir sürüş programı seçiyoruz. -->

Sonuç: Program çalışma alanına gelir. **OpMode** kutusunda örneğin adı yazar (ör. "Tank Sasi TeleOp").
**Robot yapılandırması** yalnız örneğin kullandığı cihazları gösterir.

Pencerede **Örnek ara...** kutusuna yazınca liste, adında ya da açıklamasında o sözcük geçen örneklere
iner. Pencereyi kapatmak için **×**'e ya da <kbd>Esc</kbd>'ye bas.

## Cihaz adlarını robotuna uydur

Örnekteki cihaz adları senin Control Hub yapılandırmanla aynı olmalı.

1. Yan panelde **Robot yapılandırması**'ndaki adları oku (ör. `left_drive`, `right_drive`).
2. Control Hub'daki yapılandırmanda aynı adların olup olmadığını kontrol et.
3. Farklıysa adı Blocks'ta değiştir. Bkz. [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

Sonuç: Program Control Hub'daki cihazları adıyla bulur.

<!-- SAY: Örnekteki motor adlarını kendi robotumuzdaki adlarla aynı yapıyoruz. -->

## Hangi örnek ne yapar

| Örnek | Ne yapar |
|---|---|
| **Starter Bot (Gated Feeder)** | Starter Bot TeleOp'u. Feeder konum servosuyla kapı gibi açılır. POV sürüş, **LT** basılıyken intake, **RT** basılıyken shooter, **Y** feeder'ı iter, **B** basılıyken sıkışma açma. **D-Pad** sağ ve sol ayar seçer, yukarı ve aşağı değeri artırır ya da azaltır. |
| **Starter Bot (Continuous Feeder)** | Aynı program; feeder sürekli dönen servo. |
| **Starter Bot Otonom (Gated Feeder)** | Tekerlek encoder'larıyla konum takibi yapan otonom. `ileriGit`, `don`, `noktayaGit`, `at` gibi fonksiyonlarla yazılır. |
| **Starter Bot Otonom (Continuous Feeder)** | Aynı otonom; feeder sürekli dönen servo. |
| **Starter Bot Otonom RunPos (Gated Feeder)** | Aynı otonom; şasi `RUN_TO_POSITION` ile sürülür. |
| **Starter Bot Otonom RunPos (Continuous Feeder)** | RunPos otonom; feeder sürekli dönen servo. |
| **Mecanum Şasi TeleOp** | Dört motorlu şasi sürüşü. **Sol çubuk** ileri, geri ve yana kayma; **sağ çubuk** dönüş. Motor adları `frontLeft`, `backLeft`, `frontRight`, `backRight`. |
| **Tank Şasi TeleOp** | Her yanda bir motorlu şasi sürüşü. **Sol çubuk** ileri ve geri, **sağ çubuk** dönüş. Motor adları `left_drive`, `right_drive`. |

Kartlardaki açıklamanın tamamı pencerede yazar.

<!-- SAY: Starter Bot için hem teleop hem otonom örnekleri var. -->

## Sorun mu var?

- **"Örnek yüklenemedi, bağlantı kesildi. Tekrar seç." yazıyor:** İnternet bağlantını kontrol et, örneği yeniden seç.
- **"Eşleşen örnek bulunamadı." yazıyor:** **Örnek ara...** kutusundaki sözcük hiçbir örneğin adında ya da açıklamasında yok. Kutuyu temizle.
- **Örnek seçince programım silindi:** Örnek, açık programın yerine onay sormadan geçer. Sonraki sefer örnekten önce **.blk indir**'e bas. Bkz. [Programı kaydet](ftc-programi-kaydet.md).

## Sonraki adım

[Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md)
