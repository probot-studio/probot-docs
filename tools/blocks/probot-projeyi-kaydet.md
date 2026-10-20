# Projeyi kaydet, aç ve yeniden başla

Bu sayfada Probot projeni bilgisayarına dosya olarak kaydedecek, kaydettiğin dosyayı açacak ve boş bir
projeyle yeniden başlayacaksın.

Blocks'ta hesap ve bulut kaydı yoktur. Projeni korumanın güvenilir yolu **Blokları indir** ile dosyaya
kaydetmektir.

## Başlamadan önce

- Blocks açık ve **Probot Blocks** sekmesi seçili.
- Denemek için bir örnek aç: **Örnek seç** > **Arcade Sürüş**.

## Projeye ad ver

1. Araç çubuğunda **Proje** kutusuna bas.
2. Kutudaki adı sil ve yeni adı yaz, ör. `Takım Robotu`. En çok 60 karakter.
3. Kutudan çık.

Sonuç: İndireceğin dosyalar bu adı taşır: `takim-robotu.probot.json`, `takim-robotu.ino`. Türkçe harfler
sadeleşir, boşluklar `-` olur. Kutu boşsa dosya adı `probot-projesi` olur.

<!-- SAY: Önce projemize bir ad veriyoruz, indirilen dosyalar bu adı alıyor. -->

## Projeyi dosyaya kaydet

!!! warning "Dikkat"
    Blocks projeni tarayıcıda küçük bir alana (çereze, yaklaşık 4 KB) otomatik kaydeder. Bu alanı aşan
    proje **uyarı vermeden** kaydedilmez; sayfa yenilenince eski proje gelir. Çözüm projeyi aşağıdaki
    adımlarla `.probot.json` dosyasına indirmektir.

1. Araç çubuğunda **Blokları indir**'e bas. "Blok projesi indirildi." bildirimi çıkar.
   ![Araç çubuğu; Blokları indir 1, Blokları yükle 2 numarayla işaretli.](img/blocks-kaydet-arac-cubugu.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Arcade Sürüş | hedef=role=button[name="Blokları indir"]; role=button[name="Blokları yükle"] | isaret=1,2 | bekle=text="Blokları indir" -->
   <!-- SAY: Projeyi kaybetmemek için Blokları indir ile bilgisayarımıza kaydediyoruz. -->
2. Tarayıcının indirilenler klasörünü aç.
3. `<proje-adı>.probot.json` dosyasını güvenli bir yere taşı.

Sonuç: Dosyada bloklar, proje adı ve WiFi ayarları vardır. WiFi şifresi dosyada açık metin olarak durur.

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek.
    Otomatik kayıt çerez yerine tarayıcının yerel deposunu kullanır; 4 KB sınırı kalkar, büyük proje de
    kaydedilir. Kalıcı ve taşınabilir kopya için dosyaya indirmek yine önerilir.

## Kayıtlı projeyi aç

!!! warning "Dikkat"
    Dosya açmak çalışma alanındaki projenin yerine geçer ve onay sormaz. Hatalı bir dosya da mevcut
    projeni silebilir. Önce projeni **Blokları indir** ile kaydet.

1. Araç çubuğunda **Blokları yükle**'ye bas.
2. Açılan pencerede `.probot.json` dosyasını seç.
3. **Aç**'a bas.

Sonuç: "Blok projesi yüklendi." bildirimi çıkar. Bloklar, proje adı ve WiFi ayarları dosyadan gelir.
Dosyadan gelen ad ve WiFi ayarları otomatik kayda girmez: [Otomatik kayıt](#otomatik-kayit).

Dosya JSON değilse ya da Probot Blocks proje yapısında değilse "Blok projesi yüklenemedi." yazar ve
mevcut proje değişmez.

Dosya yapı olarak doğru ama içinde araçta olmayan bir blok türü varsa aynı uyarı çıkar. Bu, başka bir
Blockly uygulamasının dosyasında ya da elle değiştirilmiş bir `.probot.json`'da olur. Bu durumda mevcut
proje silinir, çalışma alanı boş ya da yarım kalır, proje adı ve WiFi ayarları da dosyadakilerle
değişmiş olabilir.

<!-- SAY: Kaydettiğimiz projeyi Blokları yükle ile geri açıyoruz. -->

## Yeniden başla {#yeniden-basla}

Probot Blocks'ta **Yeni** düğmesi yoktur. Boş projeye çalışma alanındaki blokları silerek dönersin.

!!! warning "Dikkat"
    Bu iş çalışma alanındaki tüm blokları siler. Projeni saklamak istiyorsan 1. adımı atlama.

1. Araç çubuğunda **Blokları indir**'e bas.
2. Çalışma alanında boş bir yere sağ tıkla.
3. **<n> Bloğunu Sil**'i seç (ör. "12 Bloğunu Sil").
   ![Boş alanın sağ tık menüsü; Bloğunu Sil öğesi 3 numarayla işaretli.](img/blocks-yeniden-basla.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Arcade Sürüş | hedef=.blocklySvg (boş alan, sağ tık); .blocklyContextMenu >> text=/Bloğunu Sil/ | isaret=3 | bekle=.blocklyContextMenu -->
   <!-- SAY: Boş bir projeye dönmek için çalışma alanındaki tüm blokları siliyoruz. -->
4. "Tüm <n> blokları silinsin mi?" sorusunda **Tamam**'a bas.
5. **Proje** kutusuna yeni projenin adını yaz.

Sonuç: Yalnız altı yaşam döngüsü bloğu kalır. Bunlar silinmez.

## Otomatik kayıt nasıl çalışır {#otomatik-kayit}

Blocks projeni tarayıcıda kendiliğinden saklar: bloklar, yan panel genişliği ve seçili sekme. Proje adı
ile WiFi ayarları, kutulara elle yazınca ya da listeden seçince saklanır. Aynı tarayıcıda sayfayı yeniden
açınca proje geri gelir.

Bloklar, proje adı ve WiFi ayarları son değiştiği günden 30 gün sonra silinir. Bloklar her değişiklikte
yeniden saklanır. Proje adı ve WiFi ayarlarının süresi ise yalnız o kutuyu değiştirince yenilenir.

!!! warning "Dikkat"
    Otomatik kayıt şu durumlarda uyarı vermeden eksik kalır:

    - Proje yaklaşık 4 KB'ı aşarsa bloklar kaydedilmez. Sayfa yenilenince önceki proje gelir.
    - **Şifre (en az 8)** kutusuna hiç yazmadıysan otomatik şifre kaydedilmez. Blocks her açılışta yeni
      şifre üretir. **↻** (Yeni şifre üret) ile ürettiğin şifre kaydedilir.
    - **Blokları yükle** ile gelen proje adı, ağ adı, şifre ve kanal ile örnekten gelen proje adı, o kutuyu
      bir kez elle değiştirene kadar kaydedilmez: [Dosyadan gelen ayarları tarayıcıya kaydet](probot-wifi-ayarla.md#dosyadan-gelen-ayarlar).

    Başka bir tarayıcı ya da bilgisayar kaydı görmez. Önemli projeyi **Blokları indir** ile dosyaya kaydet.

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek.
    Bloklar çerez yerine tarayıcının yerel deposunda saklanır: 4 KB sınırı ve 30 günlük süre kalkar. Çereze
    kaydedilmiş eski proje ilk açılışta bir kez yerel depoya aktarılır. Örnekten ya da dosyadan gelen proje
    adı, otomatik üretilen şifre ve dosyadan gelen şifre de kaydedilir. Dosyadan gelen ağ adı ve kanal ise
    kutuyu elle değiştirene kadar yine kaydedilmez.

<!-- SAY: Tarayıcı projeyi saklıyor ama asıl güvenli kayıt dosyaya indirmek. -->

## Sorun mu var?

- **"Blok projesi yüklenemedi." yazıyor:** Dosya `.probot.json` değil, bozuk ya da araçta olmayan bir
  blok içeriyor. **Blokları indir** ile alınmış bir dosya seç.
- **Yenileyince başka proje geldi:** Bkz. [Sorun giderme](sorunlar.md#yenileyince-proje-degisti).
- **Yenileyince proje adı ya da WiFi şifresi değişti:** Elle yazılmamış otomatik şifre ile dosyadan ya da
  örnekten gelen değerler otomatik kayda girmez. **Proje** kutusuna ve WiFi kutularına bir kez elle yaz ya
  da dosyayı yeniden yükle. Bkz. [Sorun giderme](sorunlar.md#yenileyince-ad-wifi-degisti).

## Sonraki adım

[Kodu kopyala ya da indir](probot-kodu-al.md)
