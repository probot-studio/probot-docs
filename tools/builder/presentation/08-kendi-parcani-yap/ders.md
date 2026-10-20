---
baslik: "Kendi parçanı yap"
ust: Probot Builder · Kendi parçanı yap
alt: Temel şekiller, 3B model içe aktarma, Sketch ve Extrude
sure: 14
kaynak: "Builder kullanım dokümanı, Temel şekillerle parça yap, 3B model içe aktar ve Sketch çiz ve Extrude ile katı yap sayfaları."
---

# Hoca hazırlığı

## Bu derste

Katalogda olmayan parçaları kendimiz yapıyoruz. Kutu, silindir, küre ve tüpten şekil kurup delik açıyoruz, bilgisayardaki bir 3B model dosyasını parça olarak ekliyoruz ve bir yüzeye çizim yapıp ona kalınlık vererek katı parça çıkarıyoruz.

## Dersten önce hazırla

- Dosya > Yeni ile boş bir sahne açın.
- İçe aktarma için bilgisayarda küçük bir STL ya da STEP dosyası hazır olsun, en çok 25 MB.
- Sketch ve Extrude geliştirilmeye devam ediyor, ekranlar zamanla değişebiliyor.

## Zaman planı

| Dakika | Bölüm |
|---|---|
| 0-5 | Kapak, temel şekiller, birleştir, ayır |
| 5-9 | 3B model içe aktarma |
| 9-14 | Sketch, kısıt, Extrude, özet |

# Sayfalar

## Kendi parçanı yap {kapak}

![](img/builder-temel-sonuc.png)

::: hoca
**Söyle:** "Bu sunumda katalogda olmayan parçaları kendimiz yapıyoruz. Temel şekillerden parça kuruyor ve delik açıyoruz, bilgisayarımızdaki bir 3B modeli içe aktarıyoruz ve bir çizime kalınlık vererek katı parça çıkarıyoruz."
:::

## Temel şekil ekle {sure=1}

- **Parça Ekle** > **Temel şekiller**
- **Kutu**, **Silindir**, **Küre**, **Tüp**
- Satıra basın ya da sahneye sürükleyin
- Ölçüler milimetre

![](img/builder-temel-sekiller-listesi.png)

::: hoca
**Söyle:** "Parça Ekle sekmesinde Temel şekiller bölümünü açıyoruz. Kutu satırına bastığımızda sahneye kırk milimetre eninde ve boyunda, yirmi milimetre yüksekliğinde mavi bir kutu geliyor. Tüp içi boş bir silindir, ara parça için kullanılıyor."
:::

## Ölçü, tür ve renk ver {sure=1}

- **Ölçüler (mm)** altında **En**, **Boy**, **Yükseklik**
- **Renk** yedi renkten biri
- **Tür** **Katı** ya da **Delik**
- Delik şekli yarı saydam gri görünür

![](img/builder-temel-ozellikler.png)

::: hoca
**Söyle:** "Kutunun ölçüsünü Özellikler panelinde yazıyoruz, şekil yazarken değişiyor ve tabanı yerinde kalıyor. Sonra rengini seçiyoruz. Şekil başka bir şekli oyacaksa türünü Delik yapıyoruz, o zaman renk satırı kayboluyor."
:::

## Birleştir ve delik aç {sure=1}

- Bir **Kutu** ve **Delik** türünde **Silindir**
- Silindiri kutunun içinden geçirin
- İkisini **Shift** ile seçin
- **Özellikler** > **Birleştir**

![](img/builder-temel-birlestir.png)

::: hoca
**Söyle:** "Kutuyu ve delik silindiri birlikte seçip birleştiriyoruz, kutuda silindir biçiminde bir delik açılıyor. Panelin başında Birleşik şekil yazıyor. Seçimdeki şekillerin hepsi Delik olduğunda Birleştir soluk kalıyor, en az bir katı şekil gerekiyor."
:::

::: hoca
Birleştir yalnız seçimin hepsi temel şekil, birleşik şekil ya da Extrude parçası olduğunda görünüyor. İçe aktarılan model ve sketch birleştirilemiyor.
:::

## Birleşik şekli ayır {sure=1}

- **Parçalar** sekmesinde birleşik şekli seçin
- **Özellikler** > **Ayır**
- Şekiller eski yerlerine döner
- **Ctrl+Z** de birleştirmeyi geri alır

![](img/builder-temel-ayir.png)

::: hoca
**Söyle:** "Ayır düğmesiyle birleşik şekli eski parçalarına döndürüyoruz. Şekiller birleştirmeden önceki yerlerinde, ayrı parçalar olarak duruyor ve hepsi seçili geliyor. Kendi yaptığımız şekiller parça listesinde Özel parçalar bölümünde görünüyor."
:::

## 3B model içe aktar {sure=1}

- **Dosya** > **İçe aktar (STL, STEP, GLB, OBJ)...**
- Dosya en çok 25 MB
- Birden çok dosya seçilebilir
- Delikler kendiliğinden bulunur

![](img/builder-model-dosya-menusu.png)

::: hoca
**Söyle:** "Dosya menüsünden içe aktarı seçip bilgisayarımızdaki model dosyasını açıyoruz. Builder dosyayı tarayıcıda okuyor, büyük modeli sadeleştiriyor ve yuvarlak delikleri kendisi buluyor. Böylece Ölç ve Tak araçları bu deliklere oturuyor."
:::

## Dosyayı sahneye bırak {sure=1}

- Dosya gezgininden dosyayı sürükleyin
- **Sahne**de bir noktaya bırakın
- Model zemine oturur
- Bildirimde **eklendi** yazar

![](img/builder-model-eklendi.png)

::: hoca
**Söyle:** "Model dosyasını dosya gezgininden sürükleyip sahnede istediğimiz yere bırakıyoruz. Model bıraktığımız noktada zemine oturuyor. Bildirim üçgenlerin sadeleştirildiğini ve kaç delik bulunduğunu da yazıyor."
:::

## Birimi, yönü ve ölçüyü düzelt {sure=1}

- **Dosyanın birimi** mm, cm, m ya da inç
- **Yukarı eksen** **Z yukarı** ya da **Y yukarı**
- **Ölçüler (mm)** oranları korur
- **Ad** alanına parçanın adı

![](img/builder-model-ozellikler.png)

::: hoca
**Söyle:** "Model çok küçük ya da yan yatmış göründüğünde birimini ve yukarı eksenini seçiyoruz. CAD dosyaları çoğunlukla Z yukarı, GLB modelleri Y yukarı geliyor. Ölçülerden birini değiştirdiğimizde diğer ikisi de aynı oranda değişiyor."
:::

## Eksik model ve sınırlar {sure=1}

- Verisi kaybolan model kutu görünür
- **Dosyayı yeniden seç** modeli geri getirir
- İçe aktarılan model topluluğa gönderilemez
- Büyük modelde projeyi dosyaya kaydedin

![](img/builder-model-eksik.png)

::: hoca
**Söyle:** "Verisi kaybolan model kutu olarak görünüyor, aynı dosyayı yeniden seçerek gerçek şeklini geri getiriyoruz. Tarayıcının otomatik kaydı büyük modelleri sığdıramayabiliyor. Bu yüzden büyük modeller için projeyi Kaydet ile dosyaya indiriyoruz."
:::

## Sketch'i aç ve düzlem seç {sure=1}

- **Araç çubuğu** > **Sketch** (S)
- Bir parçanın düz yüzüne tıklayın
- Ya da **Standart düzlem** **Üst**, **Ön**, **Sağ**
- Kamera düzleme dik bakar

![](img/builder-sketch-duzlem.png)

::: hoca
**Söyle:** "Sketch aracını açıp kutunun üst yüzüne tıklıyoruz, çizim o yüzde başlıyor ve parçayla birlikte taşınıyor. Boşluğa tıkladığımızda sketch zeminde açılıyor. Eğri bir yüze tıkladığımızda Builder düz bir yüz istiyor."
:::

## Şekli çiz ve bitir {sure=1}

- **Çizgi**, **Dikdörtgen**, **Daire**, **Yay**
- **İzdüşür** ve **Seç** araçları
- İçteki daire Extrude'da delik olur
- **Bitir** (Enter) sketch'i kaydeder

![](img/builder-sketch-cizim.png)

::: hoca
**Söyle:** "Dikdörtgen aracıyla iki köşeye tıklıyoruz ve kapalı bir şekil çiziyoruz. İçine bir daire çizdiğimizde o daire katıda delik oluyor. Bitir düğmesine bastığımızda sketch kaydediliyor ve Parçalar listesinde Sketch adıyla duruyor."
:::

## Ölçü ve kısıt ver {sure=1}

- **Seç** ile bir kenara tıklayın
- **Boy** alanına ölçüyü yazın
- Kısıt düğmeleri seçime göre değişir
- Hedef **Tam tanımlı** durumu

![](img/builder-sketch-kisit.png)

::: hoca
**Söyle:** "Kenarı seçip boyunu yazıyoruz, sonra gereken kısıtları ekliyoruz. Kısıt bir öğenin boyunu, yönünü ya da başka öğeyle ilişkisini sabitliyor. Sekmenin başında Tam tanımlı yazdığında şekil sürüklenince bozulmuyor."
:::

::: hoca
Eksik tanımlı şekil de Extrude ediliyor. Fazla ya da çelişen kısıt yazarsa kırmızı satırlar Kısıtı sil ile kaldırılıyor.
:::

## Extrude ile katı yap {sure=1}

- Sketch'i seçin, **Özellikler** > **Extrude**
- **Kalınlık (mm)**, ilk açılışta 5 mm
- **Tür** **Katı** ya da **Delik**
- **Yön** **Dışa**, **İçe**, **İki yana**

![](img/builder-sketch-extrude.png)

::: hoca
**Söyle:** "Extrude sketch'teki her kapalı bölgeye kalınlık veriyor. Kalınlığı ve yönü seçiyoruz, sahnedeki yarı saydam önizlemeye bakıp Tamam ile katıyı ekliyoruz. Her kapalı bölge ayrı bir katı parça oluyor ve sketch gizleniyor."
:::

## Sonradan değiştir {sure=1}

- Sketch'e çift tık düzenlemeye açar
- Gizli sketch **Parçalar** sekmesinde
- Extrude parçasında **Kalınlık (mm)** ve **Yön**
- Sketch değişince eski parça değişmez

![](img/builder-sketch-sonuc.png)

::: hoca
**Söyle:** "Sketch'i çift tıklayıp düzenlemeye açıyoruz, Extrude parçasının kalınlığını Özellikler panelinden değiştiriyoruz. Extrude parçası sketch'ine bağlı kalmıyor. Yeni şekil için sketch'i düzeltip yeniden Extrude yapıyoruz."
:::

## Özet {sure=1}

- Temel şekiller, **Birleştir** ve **Ayır**
- **İçe aktar** ile STL, STEP, GLB, OBJ
- **Sketch** çizer, **Extrude** kalınlık verir
- Kendi parçalar **Özel parçalar** bölümünde

![](img/builder-model-sonuc.png)

::: hoca
**Söyle:** "Temel şekillerden parça yaptık, bir modeli içe aktardık ve çizimden katı parça çıkardık. Bu parçalar mağazada satılmıyor, onları kendimiz üretiyoruz. Sonraki sunumda robotumuzu dosyaya ve hesabımıza kaydediyor, bir linkle paylaşıyor ve panelleri düzenliyoruz."
:::

# Ödevler

## Delikli ara parça yap {#bld-parca-yap-odev tur=builder}

Boş bir sahneye 60 × 40 × 10 mm bir kutu koyun. Ortasından geçen Delik türünde bir silindir ekleyip ikisini birleştirin. Sonuçta kutuda yuvarlak bir delik olsun.

::: hoca
Tamam: Özellikler panelinin başında Birleşik şekil yazıyor, kutuda delik görünüyor.
Tekrar: silindir kutuya değmiyordu, delik açılmadı. Ayır, silindiri içeri taşı, yeniden Birleştir.
:::
