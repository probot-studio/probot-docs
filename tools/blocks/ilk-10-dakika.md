# İlk 10 dakika

Bu sayfanın sonunda Probot kitin için hazır bir sürüş programını açmış, kodunu görmüş ve
bilgisayarına indirmiş olacaksın. Kurulum ya da hesap gerekmez.

![Probot Blocks ekranı; Tank Sürüş örneği yüklü, Kod Önizleme'de kod görünüyor.](img/blocks-ilk-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş, Probot Blocks sekmesi | hedef=body | isaret=yok | bekle=text="Örnek: Tank Sürüş" -->
<!-- SAY: On dakika sonra ekranımız böyle görünecek, hazır bir sürüş programı ve kodu. -->

## Başlamadan önce

- Bilgisayar ve tarayıcı: [Ne gerekir](../index.md#ne-gerekir).
- Probot kiti şimdilik gerekmez. Kodu karta yükleme [Kodu Probot kartına yükle](probot-karta-yukle.md)
  sayfasında anlatılır.
- FTC takımıysan bu sayfa yerine şu sırayı izle: [FTC örneğiyle başla](ftc-ornekle-basla.md),
  [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md), [Yeni FTC programı yaz](ftc-program-yaz.md),
  [Programı kaydet, aç ve Java'yı al](ftc-programi-kaydet.md), [Programı Control Hub'a yükle](ftc-control-hub-yukle.md).

## Blocks'u aç

1. Tarayıcıda [probotstudio.com/blocks](https://probotstudio.com/blocks/) adresini aç.
2. "Kodlama aracı geliştirme aşamasında" kartında **Anladım, devam et**'e bas.
   ![Giriş kartı; Anladım, devam et düğmesi 2 numarayla işaretli.](img/blocks-ilk-giris-karti.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=temiz tarayıcı | hedef=text="Anladım, devam et" | isaret=2 | bekle=text="Kodlama aracı geliştirme aşamasında" -->
   <!-- SAY: Blocks'u açtığımızda bir bilgi kartı çıkıyor, devam et diyerek kapatıyoruz. -->
3. Çerez bandı çıkarsa **Kabul et**'e ya da **Sadece zorunlu**'ya bas.

Kontrol et: Ekranda kart yok. Araç çubuğu ve çalışma alanı görünüyor.

## Tank Sürüş örneğini yükle

Probot programında altı hazır blok vardır. **robotInit** Driver Station'da **Init**'e basınca bir
kez, **teleopLoop** Teleop boyunca saniyede yaklaşık 50 kez çalışır. Yalnız bu blokların içine
taktığın bloklar koda girer ([Sözlük](index.md#sozluk)).

!!! warning "Dikkat"
    Örnek yüklemek çalışma alanındaki projenin yerine geçer ve onay sormaz. Önceden bir proje
    yaptıysan önce [Blokları indir](probot-projeyi-kaydet.md) ile kaydet.

1. Araç çubuğunda **Probot Blocks** sekmesine bas. Araç ilk ziyarette **FTC Blocks** sekmesiyle,
   sonraki ziyaretlerde son seçtiğin sekmeyle açılır.
   ![Araç çubuğu; Probot Blocks sekmesi 1 numarayla işaretli.](img/blocks-mod-anahtari.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=giriş kartı kapalı, FTC Blocks seçili | hedef=role=tab[name="Probot Blocks"] | isaret=1 | bekle=role=tab[name="Probot Blocks"] -->
   <!-- SAY: Probot kiti için araç çubuğunda Probot Blocks sekmesini seçiyoruz. -->
2. Araç çubuğunda **Örnek seç**'e bas.
3. "Probot örnekleri" penceresinde **Tank Sürüş** kartını seç. Köşede "Tank Sürüş örneği
   yüklendi." bildirimi çıkar.
   ![Probot örnekleri penceresi; Tank Sürüş kartı 3 numarayla işaretli.](img/blocks-ilk-tank-karti.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=Probot Blocks sekmesi, Örnek seç açık | hedef=role=dialog >> text="Tank Sürüş" | isaret=3 | bekle=text="Probot örnekleri" -->
   <!-- SAY: Örnekler arasından en sağlam başlangıç olan Tank Sürüş'ü seçiyoruz. -->

Kontrol et: **Probot Blocks** sekmesi turuncu. Araç çubuğunda düğme "Örnek: Tank Sürüş" yazıyor.
**robotInit** içinde iki **motor tanımla** bloğu, **teleopLoop** içinde **kumandayı oku** ve
**tank sürüş** blokları var.

## Kodu incele

1. Fareyi yan paneldeki **Kod Önizleme**'nin üstüne getir.
2. Tekerleği aşağı çevir. Kod satırları yukarı kayar.
3. `void teleopLoop()` satırı görününce tekerleği bırak.
   ![Kod Önizleme; teleopLoop fonksiyonu 3 numarayla işaretli.](img/blocks-ilk-kod-onizleme.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş | hedef=.code-preview >> text="void teleopLoop()" | isaret=3 | bekle=text="void teleopLoop()" -->
   <!-- SAY: Yan paneldeki kod önizlemesinde blokların karşılığı olan kodu görüyoruz. -->

Kontrol et: `void teleopLoop()` içinde `setMotor(` ile başlayan iki satır var. Sol çubuk sol motoru,
sağ çubuk sağ motoru sürer. Bir bloğu değiştirince kod anında değişir.

## WiFi şifresini yaz

Robot kendi WiFi ağını yayınlar. Blocks şifreyi bu tarayıcıda saklar. Blocks'u bu tarayıcıda 30 gün hiç
açmazsan kayıt silinir ve araç yeni bir şifre üretir; o zaman not ettiğin şifreyi kutuya yeniden yaz.

1. **Robot WiFi** bölümünde **Şifre (en az 8)** kutusunu temizle.
2. Kutuya `TAKIM-2026` yaz. Kutu küçük harfi büyüğe çevirir (ı da I olur), Türkçe harfleri,
   boşluğu ve `-` dışındaki işaretleri siler.
   ![Robot WiFi bölümü; Şifre kutusu 2 numarayla işaretli.](img/blocks-ilk-wifi-sifre.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş | hedef=role=textbox[name="Şifre (en az 8)"] | isaret=2 | bekle=text="Robot WiFi" -->
   <!-- SAY: Robotun WiFi şifresini kendimiz yazıyoruz ve bir kenara not ediyoruz. -->
3. Şifreyi bir yere not et. Robota bağlanırken gerekir.

Kontrol et: **Kod Önizleme**'nin başında `#define PROBOT_WIFI_AP_PASSWORD "TAKIM-2026"` satırı var.

## Projeyi ve kodu indir

1. Araç çubuğunda **Blokları indir**'e bas. `tank-surus.probot.json` iner.
2. Araç çubuğunda **.ino indir**'e bas. `tank-surus.ino` iner.
   ![Araç çubuğu; Blokları indir 1, .ino indir 2 numarayla işaretli.](img/blocks-ilk-indir.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş | hedef=role=button[name="Blokları indir"]; role=button[name=".ino indir"] | isaret=1,2 | bekle=text="Kodu kopyala" -->
   <!-- SAY: Son olarak projeyi ve kodu bilgisayarımıza indiriyoruz. -->
3. Bilgisayarında İndirilenler klasörünü aç.

Kontrol et: "Blok projesi indirildi." ve ".ino dosyası indirildi." bildirimleri çıktı. İndirilenler
klasöründe `tank-surus.probot.json` ve `tank-surus.ino` var.

`.probot.json` projeyi sonra açmak içindir. `.ino` karta yüklenecek koddur.

## Sonraki adım

- [Kodu Probot kartına yükle](probot-karta-yukle.md)
- [Sürüş programını sıfırdan yaz](probot-surus-programi-yaz.md)
