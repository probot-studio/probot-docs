# Panelleri düzenle

Bu sayfada çalışma alanındaki panelleri taşıyacak, kapatıp açacak ve düzeni sıfırlayacaksın.

![Çalışma alanı varsayılan düzende; solda Robot, Kod, Saha, ortada sahne, sağda Driver Station ve Kumanda.](img/sim-ilk-otonom.png)
<!-- CAPTURE: url=https://probotstudio.com/sim/#calis | hazirla=Starter Bot + Starter Bot otonom (CRServo), BIOBUZZ 2026-27 (maç başı), Kırmızı seyirci duvarı, Hızlı · 2B; otonom bitmiş, saat 12 sn | hedef=body | isaret=yok | bekle=text="OpMode 30.0 sn sürdü" -->
<!-- SAY: Çalışma alanında sahne ortada duruyor, paneller de iki yanında diziliyor. -->

Çalışma alanında sahne ortadadır. Solda **Robot**, **Kod** ve **Saha** sekmeleri, sağda
**Driver Station** ile altında **Kumanda** durur. Sahne sabittir; taşınmaz, kapanmaz.

## Başlamadan önce

- Çalışma alanı açık. Hazır örnek: **Starter Bot** robotu ve **Starter Bot otonom (CRServo)**
  programı ([İlk 10 dakika](ilk-10-dakika.md)).
- Ana sayfada **Görünüm** menüsündeki panel adları soluktur ve yanlarında "çalışma alanında" yazar.
  Ana sayfada **Başlat**'a basınca çalışma alanı açılır.

<!-- SAY: Panelleri düzenlemek için önce çalışma alanını açıyoruz. -->

## Paneli taşı ve boyutlandır

1. Panelin sekmesini (başlığını) tut.
   <!-- CAPTURE: url=https://probotstudio.com/sim/#calis | hazirla=varsayılan düzen | hedef=.dv-tab:has-text("Kod") | isaret=1 | bekle=.dv-tab -->
   ![Sol panel grubu; Kod sekmesi 1 numarayla işaretli.](img/sim-panel-tasi.png)
2. Sekmeyi başka bir grubun sekme satırına ya da bir grubun kenarına sürükle, bırak.
3. Panelin genişliğini değiştirmek için iki panel arasındaki çizgiyi sürükle.

Sonuç: Panel yeni yerinde durur.

Bir sekmeye basınca o panel grubun önüne gelir. **Robot** ve **Driver Station** panelleri ile
**Görünüm** menüsünden yeniden açılan paneller 240 pikselden dar olmaz. Bu paneller öndeyken
grubu daha fazla daraltamazsın.

<!-- SAY: Panelleri sekmesinden tutup sürükleyerek çalışma alanını istediğimiz gibi diziyoruz. -->

## Paneli kapat ve yeniden aç

1. Panelin sekmesindeki **×**'e bas.
2. Yeniden açmak için menü çubuğunda **Görünüm** menüsünü aç.
3. **Paneller** başlığı altındaki panel adını seç.
   <!-- CAPTURE: url=https://probotstudio.com/sim/#calis | hazirla=Kumanda paneli kapalı, Görünüm menüsü açık | hedef=role=menuitemcheckbox[name="Kumanda"] | isaret=3 | bekle=role=menu -->
   ![Görünüm menüsü; Paneller altında Kumanda 3 numarayla işaretli.](img/sim-panel-menu.png)

Sonuç: Panel yeniden açılır. Menüde açık panellerin yanında onay işareti durur.

Menüde onaylı bir paneli seçersen o panel kapanır. **Yardım** > **Kumanda tuşları** da
**Kumanda** panelini açar.

<!-- SAY: Kapattığımız paneli Görünüm menüsünden yeniden açıyoruz. -->

## Düzeni sıfırla {#duzeni-sifirla}

1. Ana sayfadaysan alt şeritte **Başlat**'a bas. Ana sayfada **Pencere düzenini sıfırla** soluktur.
2. Menü çubuğunda **Görünüm** menüsünü aç.
3. **Pencere düzenini sıfırla**'yı seç.
   <!-- CAPTURE: url=https://probotstudio.com/sim/#calis | hazirla=Görünüm menüsü açık | hedef=role=menuitem[name="Pencere düzenini sıfırla"] | isaret=3 | bekle=role=menu -->
   ![Görünüm menüsü; Pencere düzenini sıfırla 3 numarayla işaretli.](img/sim-panel-sifirla.png)

Sonuç: Tüm paneller ilk yerlerine döner, kapalı paneller açılır. Sol grupta **Robot** sekmesi öndedir.

Düzen bu tarayıcıda saklanır. Sim'i yeniden açınca en son düzen gelir.

<!-- SAY: Pencere düzenini sıfırla ile panelleri ilk hâline döndürüyoruz. -->

## Dar ekranda çalış {#dar-ekranda-calis}

Pencere 900 piksel ya da daha darsa paneller taşınmaz. Sahne üstte, paneller altta sekme olarak durur.
İlk açılışta **Driver Station** sekmesi seçilidir.

!!! note "Not"
    Sim'i bu genişlikte açınca giriş kartında "Simülasyon aracı bilgisayarda kullanım için tasarlandı" yazar.
    **Yine de devam et** 3 saniyelik geri sayımdan sonra açılır, ona bas.

1. Tarayıcı penceresini 900 piksel ya da daha dar yap. Tablette Sim'i dikey tutarak aç; genişlik
   900 pikseli geçerse (yatay tablet, büyük iPad) taşınabilir düzen açılır.
2. Sahnenin altındaki sekme satırında **Kumanda** sekmesine bas. **Kumanda** paneli sahnenin altında açılır.
   <!-- CAPTURE: url=https://probotstudio.com/sim/#calis | hazirla=pencere 820×900 | hedef=.dar-duzen__sekmeler | isaret=2 | bekle=.dar-duzen__sekmeler -->
   ![Dar ekran düzeni; sahnenin altındaki sekme satırı 2 numarayla işaretli.](img/sim-panel-dar.png)
3. Taşınabilir düzene dönmek için pencereyi 900 pikselden geniş yap.

Sonuç: Sahnenin altındaki sekme satırı kaybolur, taşınabilir düzen geri gelir.

Sekme satırında sırayla **Driver Station**, **Kumanda**, **Robot**, **Kod** ve **Saha** durur. Dar ekranda
**Görünüm** > **Paneller**, **Pencere düzenini sıfırla** ve **Yardım** > **Kumanda tuşları** bir şey
değiştirmez. Kumanda tuşlarını görmek için sahnenin altındaki **Kumanda** sekmesine bas.

<!-- SAY: Dar ekranda paneller sahnenin altında sekme oluyor. -->

## Sorun mu var?

- **Görünüm menüsünde panel adları soluk, yanında "çalışma alanında" yazıyor:** Ana sayfadasın.
  **Başlat**'a bas, çalışma alanı açılınca menüyü yeniden aç.
- **Paneller dağıldı ya da bir panel kayboldu:** [Düzeni sıfırla](#duzeni-sifirla).

<!-- SAY: Paneller dağılırsa düzeni sıfırlayıp baştan başlıyoruz. -->

## Sonraki adım

- [Kısayollar](kisayollar.md)
- [Sorun giderme](sorunlar.md)

<!-- SAY: Kısayollar ve sorun giderme sayfaları elimizin altında duruyor. -->
