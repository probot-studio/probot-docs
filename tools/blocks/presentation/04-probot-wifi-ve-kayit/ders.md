---
baslik: "WiFi ayarları ve proje kaydı"
ust: Probot Studio · Blocks · Sunum 4
alt: Probot Blocks, robotun ağı, şifre, kanal, kaydetme, açma, yeniden başlama
sure: 3
kaynak: "Blocks kullanım dokümanı, tools/blocks/probot-wifi-ayarla.md ve probot-projeyi-kaydet.md. Görseller tools/blocks/img klasöründen (prod ekran görüntüleri)."
---

# Hoca hazırlığı

## Bu derste

Bu bir araç tanıtım sunumu, ders değil. Probot Blocks'ta robotun WiFi ayarlarını yapmayı ve projeyi dosyaya kaydedip açmayı anlatır, videoya dönüştürülür. Seslendirilecek metin her sayfanın Söyle satırındadır.

## Dersten önce

- Canlı anlatılacaksa Probot Blocks'ta Arcade Sürüş örneğini açık tutun.
- Ekranda görünen WiFi şifresi robotun kendi ağının şifresidir, hesap şifresi değildir.

## Zaman planı

| Sayfalar | Konu |
|---|---|
| 1-7 | Ağ adı, şifre, kanal, ayarların saklanması |
| 8-12 | Proje adı, kaydetme, açma, yeniden başlama, otomatik kayıt |
| 13 | Özet |

Toplam yaklaşık 3 dakika.

# Sayfalar

## WiFi ayarları ve proje kaydı {kapak}

![](img/blocks-wifi-sonuc.png)

::: hoca
**Söyle:** "Bu sunumda robotun yayınladığı WiFi ağının adını, şifresini ve kanalını ayarlıyoruz. Ardından projemizi dosyaya kaydediyor, kayıtlı dosyayı açıyor ve boş bir projeyle yeniden başlıyoruz."
:::

## Robot kendi ağını yayınlar

- Bilgisayar ya da telefon robotun ağına bağlanır
- Ayarlar kodun başına yazılır
- Kod karta yüklenince geçerli olur
- Elle yazılmayan şifre her açılışta yenilenir

![Robot WiFi bölümü dolu, Kod Önizleme'de WiFi satırları](img/blocks-wifi-sonuc.png)

::: hoca
**Söyle:** "Probot kartı kendi WiFi ağını yayınlıyor, bilgisayarımız ya da telefonumuz bu ağa bağlanıp robotu sürüyor. Ayarlar kodun başına yazılıyor ve kodu karta yükleyince geçerli oluyor. Şifreyi elle yazmazsak Blocks her açılışta yeni bir şifre üretiyor."
:::

## Ağ adını ve şifreyi yazın

- **Ağ adı (boş = otomatik)**, ör. `Probot-Takim7`, en çok 24 karakter
- **Şifre (en az 8)**, 8-24 karakter, ör. `TAKIM-2026`
- Şifrede yalnız büyük harf, rakam ve `-`
- 8 karakterden kısa şifreyle kod derlenmez

![Robot WiFi bölümü, Ağ adı ve Şifre kutuları işaretli](img/blocks-wifi-bolumu.png)

::: hoca
**Söyle:** "Ağ adı kutusuna robotun ağ adını, örneğin Probot-Takim7 yazıyoruz. Şifre kutusuna 8 ile 24 karakter arasında bir şifre yazıp not ediyoruz. Şifre 8 karakterden kısaysa kutu uyarı veriyor ve kod derlenmiyor."
:::

## Ağ adını boş bırakırsanız

- Robot `Probot-XXXXXX` biçiminde kendi adını kullanır
- Kodda ad satırının yerinde bir yorum durur
- Sınıfta her robota ayrı ad verilir

![Probot Blocks ekranı, Ağ adı boş, kodda otomatik ad yorumu](img/blocks-ilk-sonuc.png)

::: hoca
**Söyle:** "Ağ adı kutusunu boş bırakırsak robot Probot ile başlayan kendi adını kullanıyor ve kodda ad satırının yerinde bir yorum duruyor. Sınıfta birden çok robot varsa her robota ayrı bir ad veriyoruz."
:::

## Yeni şifre üretin

- Şifre kutusunun yanındaki **↻**
- `PB-XXX-XXX` biçiminde şifre, tarayıcıda saklanır
- Şifre not edilir, **.ino indir** ile yeni kod alınır

![Robot WiFi bölümü, Şifre kutusu işaretli](img/blocks-ilk-wifi-sifre.png)

::: hoca
**Söyle:** "İstersek şifre kutusunun yanındaki yenile düğmesiyle rastgele bir şifre ürettiriyoruz. Yeni şifreyi not edip .ino dosyasını yeniden indiriyoruz. Robot yeni şifreyi bu kod karta yüklenince kullanıyor."
:::

## Kanalı seçin

- **Kanal** listesinde **1 ★**, **6 ★** ya da **11 ★**
- Aynı odadaki robotlar bu üç kanala dağıtılır
- Driver Station **Logs** sayfasında kanal görünür
- Bazı cihazlar 12 ve 13. kanalı görmez

![Robot WiFi bölümünde 6 yıldızlı kanal seçili](img/blocks-wifi-sonuc.png)

::: hoca
**Söyle:** "Aynı odadaki robotlar birbirini bozmasın diye yıldızlı kanallardan birini seçiyoruz. 1, 6 ve 11 numaralı kanallar birbirini bozmuyor. Kod yüklendikten sonra Driver Station'ın Logs sayfasında robotun hangi kanalda yayın yaptığını görüyoruz."
:::

## Ayarlar nerede saklanır

- Tarayıcıda ve `.probot.json` dosyasında
- **Blokları yükle** ile gelen ayarlar tarayıcıya kaydedilmez
- Kalıcı olması için her ayar bir kez elle değiştirilir
- Dosya WiFi şifresini açık metin taşır

![Robot WiFi bölümü, Ağ adı ve Şifre kutuları](img/blocks-wifi-bolumu.png)

::: hoca
**Söyle:** "Ağ adı, şifre ve kanal hem tarayıcıda hem proje dosyasında saklanıyor. Dosyadan gelen ayarlar tarayıcıya kaydedilmiyor, kalıcı olmaları için her ayarı bir kez elle değiştiriyoruz. Proje dosyası şifreyi açık metin olarak taşıdığı için onu paylaşırken dikkat ediyoruz."
:::

## Projeye ad verin

- Araç çubuğunda **Proje** kutusu, en çok 60 karakter
- `Takım Robotu` adı `takim-robotu` dosya adı olur
- Türkçe harfler sadeleşir, boşluklar `-` olur
- Kutu boşsa dosya adı `probot-projesi`

![Probot araç çubuğu, Proje kutusu işaretli](img/blocks-arayuz-probot-arac-cubugu.png)

::: hoca
**Söyle:** "Önce araç çubuğundaki Proje kutusuna projemizin adını yazıyoruz. İndirilen dosyalar bu adı alıyor, Türkçe harfler sadeleşiyor ve boşluklar tireye dönüyor."
:::

## Projeyi dosyaya kaydedin

- Araç çubuğunda **Blokları indir**
- "Blok projesi indirildi." bildirimi
- Dosyada bloklar, proje adı ve WiFi ayarları
- 4 KB'ı aşan proje tarayıcıya kaydedilmez

![Probot araç çubuğu, Blokları indir işaretli](img/blocks-kaydet-arac-cubugu.png)

::: hoca
**Söyle:** "Projeyi kaybetmemek için Blokları indir ile bilgisayarımıza kaydediyoruz. Tarayıcıdaki otomatik kayıt yaklaşık 4 KB ile sınırlı ve bu sınırı aşan proje uyarı vermeden kaydedilmiyor. Bu yüzden en güvenli kayıt dosyaya indirmek oluyor."
:::

## Kayıtlı projeyi açın

- **Blokları yükle**, dosya seçilir, **Aç**
- "Blok projesi yüklendi." bildirimi
- Dosya açık projenin yerine onay sormadan geçer
- Hatalı dosyada "Blok projesi yüklenemedi." yazar

![Probot araç çubuğu, Blokları yükle işaretli](img/blocks-kaydet-arac-cubugu.png)

::: hoca
**Söyle:** "Kaydettiğimiz projeyi Blokları yükle ile açıyoruz. Dosya, çalışma alanındaki projenin yerine onay sormadan geçiyor, bu yüzden önce açık projeyi indiriyoruz. Dosya bozuksa Blok projesi yüklenemedi yazısı çıkıyor."
:::

## Yeniden başlayın

- Probot Blocks'ta **Yeni** düğmesi yok
- Önce **Blokları indir**
- Boş alana sağ tık, **12 Bloğunu Sil** gibi öğe
- Onay sorusunda **Tamam**, altı blok kalır

![Boş alanın sağ tık menüsü, Bloğunu Sil öğesi işaretli](img/blocks-yeniden-basla.png)

::: hoca
**Söyle:** "Probot Blocks'ta Yeni düğmesi yok, boş projeye blokları silerek dönüyoruz. Önce projeyi indiriyoruz, sonra boş alana sağ tıklayıp blokları silme öğesini seçiyor ve onay sorusunda Tamam diyoruz. Geriye yalnız altı yaşam döngüsü bloğu kalıyor."
:::

## Otomatik kayıt nasıl çalışır

- Bloklar, yan panel genişliği ve sekme kendiliğinden saklanır
- Kayıt son değişiklikten 30 gün sonra silinir
- Başka tarayıcı ya da bilgisayar kaydı görmez
- Önemli proje dosyaya indirilir

![Probot Blocks ekranı, Tank Sürüş programı](img/blocks-ilk-sonuc.png)

::: hoca
**Söyle:** "Blocks projemizi tarayıcıda kendiliğinden saklıyor ve aynı tarayıcıda sayfayı açınca proje geri geliyor. Bu kayıt son değişiklikten 30 gün sonra siliniyor ve başka bir bilgisayardan görünmüyor. Önemli projeyi bu yüzden her zaman dosyaya indiriyoruz."
:::

## Özet

- Ağ adı, şifre ve kanal kodun başına yazılır
- Şifre elle yazılır ve not edilir
- **Blokları indir** ve **Blokları yükle** ile dosya
- Sıradaki sunum kodu alıp karta yüklemek

![Robot WiFi bölümü dolu, Kod Önizleme'de WiFi satırları](img/blocks-wifi-sonuc.png)

::: hoca
**Söyle:** "Bu sunumda robotun WiFi ayarlarını yaptık ve projemizi dosyaya kaydedip yeniden açtık. Sonraki sunumda kodu bilgisayarımıza alıyor, Arduino IDE ile karta yüklüyor ve blokları FTC Blocks'a taşıyoruz."
:::

# Ödevler

## Robotunuzun ağını ayarlayın {#blocks-sunum-04-odev tur=yazi}

Probot Blocks'ta Ağ adı kutusuna takımınıza özel bir ad yazın, şifreyi elle yazın ve kanal olarak 1, 6 ya da 11 seçin. Kod Önizleme'nin başındaki üç WiFi satırını buraya yapıştırın.

::: hoca
Tamam. `PROBOT_WIFI_AP_SSID`, `PROBOT_WIFI_AP_PASSWORD` ve `PROBOT_WIFI_AP_CHANNEL` satırları var, kanal 1, 6 ya da 11.
Tekrar. Ad satırı yerine yorum varsa ağ adı boş bırakılmış.
:::
