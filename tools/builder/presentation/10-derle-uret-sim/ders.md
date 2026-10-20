---
baslik: "Derle, gerçeğe dök ve Sim'de dene"
ust: Probot Builder · Kaydet, paylaş, üret 2
alt: Derleme paneli, robot kontrolü, parça listesi ve sepet, Sim'e gönderme
sure: 13
kaynak: "Builder kullanım dokümanı, Robotu derle, Gerçeğe dök ve Robotu Sim'de dene sayfaları."
---

# Hoca hazırlığı

## Bu derste

Tasarımı gerçeğe hazırlıyoruz. Derleme paneliyle parçaların bağlı olup olmadığını ve çarpışmaları görüyoruz. Gerçeğe dök penceresinde robot kontrolünü okuyor, eksik elektroniği ekliyor ve parça listesini mağaza sepetine aktarıyoruz. Son olarak robotu Sim'e gönderiyoruz.

## Dersten önce hazırla

- Builder'da Omni şasiyi açın. Bu şaside Control Hub, pil ve güç anahtarı yok, robot kontrolü için uygun.
- Omni şasi derlemede çarpışma gösteriyor ve Derleme başarısız çıkıyor. Derleme her mağaza parçasını tek dolu kutu sayıyor, sorulursa bu söyleniyor.
- Sepete ekle mağazaya aynı sekmede geçiyor. Gösterimde basmayın ya da Builder'a geri dönmeyi planlayın.
- Tarayıcıda bu site için yeni sekme açma izni olsun.

## Zaman planı

| Dakika | Bölüm |
|---|---|
| 0-5 | Kapak, Derleme paneli, sonuç, bulgular, fiyat teklifi |
| 5-10 | Gerçeğe dök, robot kontrolü, eksik parçalar, tablo, sepet |
| 10-13 | Sim'de dene, özet |

# Sayfalar

## Derle, gerçeğe dök ve Sim'de dene {kapak}

![](img/builder-derle-sonuc-ac.png)

::: hoca
**Söyle:** "Bu sunumda tasarladığımız robotu gerçeğe hazırlıyoruz. Önce robotu derleyip parçaların birbirine bağlı olup olmadığını görüyoruz. Sonra parça listesini ve fiyatını açıp sepete aktarıyoruz, en sonda robotu Sim'de deniyoruz."
:::

## Derleme panelini aç {sure=1}

- **Görünüm** > **Derleme**
- Panel **Özellikler**'in altında açılır
- İlk açılışta **Henüz derleme yok**
- Seçim tarayıcıda hatırlanır

![](img/builder-derle-panel-ac.png)

::: hoca
**Söyle:** "Derleme paneli ilk açılışta kapalı geliyor, onu Görünüm menüsündeki PANELLER grubundan açıyoruz. Panel Özellikler panelinin altına yerleşiyor ve içinde Derle düğmesi duruyor."
:::

## Robotu derle {sure=1}

- **Derle**'ye basın
- **Derleme başarılı**, **Uyarılarla derlendi** ya da **Derleme başarısız**
- Robot değişince **Yeniden derle**
- Sonuç kendiliğinden yenilenmez

![](img/builder-derle-sonuc.png)

::: hoca
**Söyle:** "Derle düğmesine basıyoruz ve en üstteki başlıktan robotun durumunu okuyoruz. Hata ve uyarı yoksa derleme başarılı oluyor. Robotu değiştirdikten sonra sonucu görmek için Yeniden derle düğmesine basıyoruz."
:::

## Sayaçları oku {sure=1}

- **parça** ve **grup**
- **cıvata** hizalı delik çiftleri
- **temas** değen ama hizasız çiftler
- **çarpışma** iç içe giren çiftler

![](img/builder-derle-sonuc-ac.png)

::: hoca
**Söyle:** "Başlığın altında beş sayaç duruyor. Robotun tamamı birbirine bağlıysa grup sayısı bir oluyor. Cıvata hizalı delikleri, temas değen ama hizalı olmayan parçaları, çarpışma ise birbirinin içine iki milimetreden fazla giren parçaları sayıyor."
:::

## Bulguları incele {sure=1}

- Kırmızı nokta hata, sarı nokta uyarı
- Satıra basınca parçalar seçilir
- Parçayı **Tak** ile düzeltin
- **Yeniden derle**

![](img/builder-derle-bulgular.png)

::: hoca
**Söyle:** "Bir bulguya bastığımızda ilgili parçalar sahnede seçiliyor. Sağ tıklayıp Ortala ile kameraya alıyoruz, parçayı Tak ile doğru deliğine oturtuyoruz ve yeniden derliyoruz. Düzelttiğimiz bulgu listeden çıkıyor."
:::

::: hoca
Sık bulgular iç içe giren parçalar, ana yapıya bağlı olmayan ayrık grup ve ekseninde motor mili olmayan tekerlek. Bulguların altında fiyatsız bir Parça Listesi tablosu duruyor.
:::

## Fiyat teklifi al {sure=1}

- Derleme sonucunun altında
- **Fiyat teklifi al**
- **Gerçeğe dök** penceresi açılır
- Boş sahnede soluk

![](img/builder-derle-fiyat-teklifi.png)

::: hoca
**Söyle:** "Derleme panelinden doğrudan fiyat ve sepet penceresine geçiyoruz. Fiyat teklifi al düğmesinin açtığı pencere Üst şeritteki Gerçeğe dök düğmesinin açtığıyla aynı oluyor."
:::

## Gerçeğe dök penceresi {sure=1}

- **Üst şerit** > **Gerçeğe dök →**
- Önce **Robot kontrol ediliyor**
- Üstte robot kontrolü, altta parça tablosu
- Fiyat ve stok mağazadan canlı gelir

![](img/builder-gercege-dok-pencere.png)

::: hoca
**Söyle:** "Gerçeğe dök düğmesiyle tasarımdaki parçaların listesini açıyoruz. Pencere önce robotu birkaç saniyede kontrol ediyor. Builder için hesap gerekmiyor, siparişi mağazada tamamlıyoruz."
:::

## Robot kontrolü {sure=1}

- FTC kurallarının temel maddeleri
- Control Hub, pil, güç anahtarı
- Motor ve servo sınırı 8, boyut 18 inç
- **göster** sorunlu parçaları seçer

![](img/builder-gercege-dok-goster.png)

::: hoca
**Söyle:** "Robot kontrolü FTC yarışma kurallarının temel maddelerine bakıyor ama sepete eklemeyi engellemiyor. Göster yazısına bastığımızda pencere kapanıyor ve sorunlu parçalar sahnede seçiliyor. Düzeltip pencereyi yeniden açtığımızda satır listeden kalkıyor."
:::

## Eksik parçaları ekle {sure=1}

- Control Hub, pil ya da güç anahtarı yoksa çıkar
- Parçalar robotun yanına eklenir
- **Taşı** ile robotun üstüne yerleştirin
- Pencereyi yeniden açın

![](img/builder-gercege-dok-eksik-ekle.png)

::: hoca
**Söyle:** "Eksik parçaları tek düğmeyle robotun yanına ekliyoruz. Yerlerini biz seçiyoruz, bu yüzden pencereyi kapatıp parçaları Taşı ile robotun üstüne yerleştiriyoruz. Taşımadığımız sürece kontrolde bu parçaların yerini sormaya devam ediyor."
:::

## Parça tablosu {sure=1}

- **PARÇA**, **ADET**, **BİRİM**, **TUTAR**
- Paketli parçada paket sayısı yukarı yuvarlanır
- Stokta olmayan satır sepete gitmez
- Kendi parçalar **ÖZEL PARÇALAR** bölümünde

![](img/builder-gercege-dok-sonuc.png)

::: hoca
**Söyle:** "Tabloda her parçanın adedini, birim fiyatını ve tutarını görüyoruz. Cıvata ve somun gibi paketle satılan parçalarda paket sayısı yukarı yuvarlanıyor. Kendi yaptığımız parçalar ayrı bölümde duruyor ve toplama girmiyor."
:::

## Sepete ekle ve mağazaya git {sure=1}

- **Sepete ekle ve mağazaya git (N parça)**
- Fiyatı ve stoğu olan satırlar gider
- Mağaza aynı sekmede açılır
- Builder'a dönünce son oturum gelir

![](img/builder-gercege-dok-sepete-ekle.png)

::: hoca
**Söyle:** "Fiyatı ve stoğu olan bütün parçaları tek seferde mağaza sepetine ekliyoruz. Sepette önceden ürün varsa onlar da kalıyor. Builder çalışmamızı tarayıcıda sakladığı için geri döndüğümüzde son oturum açılıyor."
:::

## Sim'de dene {sure=1}

- **Dosya** > **Sim'de dene**
- Sim yeni sekmede açılır
- Robot proje adıyla seçili gelir
- Builder sekmesi açık kalır

![](img/builder-sim-dosya-menusu.png)

::: hoca
**Söyle:** "Dosya menüsünden Sim'de dene diyoruz ve robotumuz yeni sekmede açılıyor. Robot Sim'de proje adıyla seçili geliyor. Builder sekmesi açık kalıyor ve çalışmamız orada duruyor."
:::

## Sim'e ne gider {sure=1}

- Parçalar, yerleri ve açıları
- Bağlar ve eklemler
- Motorların ad, hub, port ve yönü
- Robot değişince yeniden basın

![](img/builder-sim-katalog.png)

::: hoca
**Söyle:** "Aynı işi Robot Kataloğu'ndaki Sim'de dene ile de yapıyoruz. Bastığımız andaki robot parçaları, eklemleri ve motor portlarıyla birlikte gidiyor. Sim'deki değişiklikler Builder'a geri gelmiyor, sahne boşken düğme soluk kalıyor."
:::

## Özet {sure=1}

- **Derleme** bağları, temasları ve çarpışmaları gösterir
- **Gerçeğe dök** robotu kontrol eder ve fiyatlar
- **Sepete ekle** listeyi mağazaya aktarır
- **Sim'de dene** robotu yeni sekmede açar

![](img/builder-sim-sonuc.png)

::: hoca
**Söyle:** "Robotu derledik, kontrolden geçirdik, parça listesini sepete aktardık ve Sim'e gönderdik. Builder sunumları burada bitiyor. Robotumuzu sürmek ve kodlamak için Sim ile devam ediyoruz."
:::

# Ödevler

## Robotunu kontrolden geçir {#bld-uret-odev tur=builder}

Omni şasiyi açın ve Gerçeğe dök penceresini açın. Eksik parçaları ekle ile Control Hub, pil ve güç anahtarını ekleyin, üçünü de Taşı ile robotun üstüne yerleştirin. Pencereyi yeniden açıp kontrol listesine bakın.

::: hoca
Tamam: kontrol listesinde Control Hub yok, Pil yok ve Güç anahtarı yok satırları kalkmış, yerlerini sen seç satırı yok.
Tekrar: parçalar eklenmiş ama robotun yanında bırakılmış.
:::
