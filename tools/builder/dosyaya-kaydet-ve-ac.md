# Dosyaya kaydet ve aç

Bu sayfada projene ad verecek, onu bilgisayarına `.json` dosyası olarak indirecek ve sonra
yeniden açacaksın. Builder'ın tarayıcıdaki otomatik kaydını da öğrenirsin.

![Dosya menüsü açık; Kaydet (JSON indir) ve Yükle... öğeleri.](img/builder-dosya-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, proje adı ilk robot, Dosya menüsü açık | hedef=body | isaret=yok | bekle=text="Kaydet (JSON indir)" -->

## Başlamadan önce

- Builder açık ve sahnede bir robot var. Örnek: "Sahne boş" kartında **Omni şasi**'yi seç
  (bkz. [Hazır robotla başla](hazir-robotla-basla.md)).
- Hesap gerekmez. Hesaba kayıt için bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

## Projeye ad ver

1. **Araç çubuğu**nda proje adına bas. Yeni projede ad "Adsız Robot"tur.
2. Yeni adı yaz, örneğin `Omni deneme`.
3. <kbd>Enter</kbd>'a bas. Vazgeçmek için <kbd>Esc</kbd>'e bas.
   ![Araç çubuğu; proje adı alanı düzenleniyor, 2 numarayla işaretli.](img/builder-dosya-proje-adi.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, proje adına basılmış, alana Omni deneme yazılmış | hedef=title="Proje adını düzenle" | isaret=2 | bekle=text="Omni şasi" -->
   <!-- SAY: Önce projemize bir ad veriyoruz, dosyanın adı da bu oluyor. -->

Sonuç: **Araç çubuğu**nda yeni ad görünür. Alanı boş bırakırsan ad "Adsız Robot" olur.

## Otomatik kaydı anla

Builder çalışmanı bu tarayıcıda kendiliğinden saklar. Ayrıca bir şey yapman gerekmez.

- Her değişiklikten 1 saniye sonra ve sayfa kapanırken kayıt yazılır.
- Builder'ı yeniden açınca son oturum gelir ve "Son oturum geri yüklendi" yazar.
- Geri alma geçmişi kaydedilmez. Sayfayı yenileyince **Geri al** boş başlar.
- Tarayıcı depolaması dolarsa "Otomatik kayıt yapılamadı: tarayıcı depolama alanı dolu" yazar. Başka bir sorunda
  "Otomatik kayıt yapılamadı" yazar. İkisinde de projeyi dosyaya kaydet.
- Büyük içe aktarılan modeller otomatik kayda sığmayabilir. Bkz. [3B model içe aktar](model-ice-aktar.md).

!!! warning "Dikkat"
    Otomatik kayıt yalnız bu tarayıcıdadır. Tarayıcı verisini silersen, gizli pencerede çalışırsan ya da
    başka bilgisayara geçersen kaybolur. Kalıcı kopya için projeyi dosyaya kaydet.

<!-- SAY: Builder çalışmamızı tarayıcıda kendiliğinden saklıyor ama bu kopya yalnız o tarayıcıda kalıyor. -->

## Projeyi dosyaya kaydet

1. **Menü çubuğu**nda **Dosya**'ya bas.
2. **Kaydet (JSON indir)**'i seç.
   ![Dosya menüsü; Kaydet (JSON indir) 2 numarayla işaretli.](img/builder-dosya-kaydet.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, proje adı Omni deneme, Dosya menüsü açık | hedef=text="Kaydet (JSON indir)" | isaret=2 | bekle=text="Kaydet (JSON indir)" -->
   <!-- SAY: Dosya menüsünden projeyi bilgisayarımıza JSON dosyası olarak indiriyoruz. -->
3. Tarayıcı sorarsa dosyanın kaydedileceği klasörü seç.

Sonuç: Tarayıcı `Omni deneme.json` dosyasını indirir.

- Dosya adı proje adıdır. Türk alfabesindeki harfler, İngilizce harfler, rakamlar ve boşluk korunur. Diğer
  karakterler (tire, nokta, â gibi şapkalı harfler) `_` olur. Örneğin `ilk-robot`
  adı `ilk_robot.json` olarak iner.
- İçe aktarılan modeller dosyanın içine gömülür. Dosyayı başka bilgisayarda açınca modeller de gelir.
- Dosyada geri alma geçmişi yoktur.

## Dosyadan proje aç

!!! warning "Dikkat"
    **Yükle...** sahnedeki projeyi onay sormadan değiştirir ve geri alınamaz. Sahnedeki çalışmayı
    korumak istiyorsan önce **Kaydet (JSON indir)** ile indir.

1. **Menü çubuğu**nda **Dosya**'ya bas.
2. **Yükle...**'yi seç.
   ![Dosya menüsü; Yükle... 2 numarayla işaretli.](img/builder-dosya-yukle.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Dosya menüsü açık | hedef=text="Yükle..." | isaret=2 | bekle=text="Yükle..." -->
   <!-- SAY: Kaydettiğimiz dosyayı Yükle ile yeniden açıyoruz. -->
3. Açılan pencerede `.json` proje dosyasını seç.
4. Pencerede **Aç**'a bas.

Sonuç: Proje sahneye gelir. **Araç çubuğu**nda dosyadaki proje adı görünür. Bildirimde proje adı ve "yüklendi" yazar.

Dosyadaki bazı parçalar okunamazsa onlar atlanır ve "N parça bozuktu, atlandı" yazar. Diğer parçalar açılır.

Boş sahneyle kaydedilen dosya da açılır. Sahne boş gelir, proje adı dosyadaki ad olur.

## Yeni proje aç

!!! warning "Dikkat"
    **Yeni** sahnedeki bütün parçaları siler ve bu işlem geri alınamaz. Önce projeyi dosyaya kaydet.

1. **Menü çubuğu**nda **Dosya**'ya bas.
2. **Yeni**'yi seç.
   ![Dosya menüsü; Yeni 2 numarayla işaretli.](img/builder-dosya-yeni.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, Dosya menüsü açık | hedef=text="Yeni" | isaret=2 | bekle=text="Kaydet (JSON indir)" -->
   <!-- SAY: Yeni ile sahneyi boşaltıyoruz, Builder önce onay istiyor. -->
3. Sahnede parça varsa tarayıcı "Sahnedeki parçalar silinecek. Yeni proje açılsın mı?" diye sorar. **Tamam**'a bas.

Sonuç: Sahne boşalır, proje adı "Adsız Robot" olur ve "Yeni proje oluşturuldu" yazar.

**Yeni**, **Yükle...** ve hazır robot yüklemek, sahnenin hesabındaki robotla bağını da keser. Proje
adının yanındaki "Kaydedildi" ya da "Kaydedilmedi" yazısı kaybolur.

## Sorun mu var?

- **"Proje dosyası okunamadı" yazdı:** Dosya Builder proje dosyası değil, bozuk ya da içindeki parçaların hepsi
  bozuk. Başka bir kopyayı dene.
  Bkz. [Sorun giderme](sorunlar.md#proje-dosyasi-okunamadi).
- **"N parça bozuktu, atlandı" yazdı:** Bu parçalar dosyada eksik ya da hatalı. Diğerleri açıldı. Eksikleri yeniden ekle.
  Bkz. [Sorun giderme](sorunlar.md#parca-bozuktu).
- **"N içe aktarılan parçanın modeli dosyada yok. Dosyayı yeniden seç" yazdı:** Bkz.
  [Eksik modeli yeniden seç](model-ice-aktar.md#eksik-modeli-yeniden-sec),
  [Sorun giderme](sorunlar.md#model-dosyada-yok).
- **"Otomatik kayıt yapılamadı: tarayıcı depolama alanı dolu" yazdı:** Önce projeyi **Kaydet (JSON indir)** ile indir.
  Sonra tarayıcıda bu site için yer aç (örneğin probotstudio.com site verisini temizle). Bu işlem otomatik
  kaydı ve bu sitedeki diğer yerel ayarları da siler. Builder bu hatadan önce kaydı modelsiz de dener.
  Bu yüzden içe aktarılan modelleri azaltmak bu hatayı çözmez.
  Bkz. [Sorun giderme](sorunlar.md#otomatik-kayit-yapilamadi).
- **Builder açılınca eski çalışmam yok:** Tarayıcı verisi silinmiş, başka tarayıcı ya da gizli pencere
  kullanılıyor. Kaydettiğin `.json` dosyasını **Yükle...** ile aç.
- **Dosya adı farklı indi:** Proje adındaki tire, nokta, â gibi şapkalı harfler `_` olur.
- **"Montaj modunda düzenleme kapalı" yazdı:** Montaj şeridinde **Düzenlemeye geç**'e bas, sonra yeniden dene.
  Bkz. [Sorun giderme](sorunlar.md#montaj-modu).

## Sonraki adım

- [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md)
- [Robotu Sim'de dene](simde-dene.md)
