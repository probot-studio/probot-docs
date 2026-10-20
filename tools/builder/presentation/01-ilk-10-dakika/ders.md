---
baslik: "Builder ile ilk 10 dakika"
ust: Probot Builder · Başla
alt: Hazır robotu aç, etrafında gezin, parça tak, kaydet
sure: 9
kaynak: "Builder kullanım dokümanı, İlk 10 dakika sayfası."
---

# Hoca hazırlığı

## Bu derste

Builder'ı ilk kez açan biri için kısa bir tur. Hazır Omni şasiyi açıyoruz, kamerayla robotun etrafında geziyoruz, bir Structure parçası ekleyip şasiye takıyoruz ve projeyi dosya olarak kaydediyoruz. Hesap gerekmiyor.

## Dersten önce hazırla

- Builder'ı tarayıcıda bir kez açın. Açılış penceresini ve çerez bildirimini önceden kapatın.
- Sahne boş değilse önceki çalışmayı Dosya > Kaydet (JSON indir) ile saklayıp Dosya > Yeni'yi seçin.
- Fare kullanın, dokunmatik yüzeyde kamera zor oynuyor.

## Zaman planı

| Dakika | Bölüm |
|---|---|
| 0-1 | Kapak, Builder'ı aç |
| 1-3 | Hazır robot, gezinme |
| 3-6 | Parça ekle, tak, ince ayar |
| 6-9 | Kaydet, özet |

# Sayfalar

## Builder ile ilk 10 dakika {kapak}

![](img/builder-ilk-sonuc.png)

::: hoca
**Söyle:** "Bu sunumda Builder ile ilk on dakikamızı geçiriyoruz. Hazır bir robotu açıyoruz, etrafında geziyoruz, ona bir parça takıyoruz ve projemizi kaydediyoruz. Sonunda ekrandaki robotun aynısı bizim bilgisayarımızda da duruyor olacak."
:::

## Builder'ı aç {sure=1}

- Adres **probotstudio.com/builder**
- **Anladım, devam et** ile uyarıyı kapatın
- Çerez bildirimini kapatın
- Ortada **Sahne boş** kartı görünür

![](img/builder-ilk-acilis.png)

::: hoca
**Söyle:** "Builder'ı tarayıcıda açıyoruz, kurulum ve hesap gerekmiyor. Geliştirme aşaması uyarısını ve çerez bildirimini kapattığımızda sahnenin ortasında Sahne boş kartını görüyoruz. Kart yoksa bu tarayıcıdaki önceki çalışma açılmış demektir."
:::

## Hazır robotu yükle {sure=1}

- **Sahne boş** kartının altında hazır robot kartları
- **Omni şasi** kartına basın
- Robot birkaç saniyede sahneye gelir
- **Boş sahne** kartı robot yüklemez

![](img/builder-ilk-omni-sasi-karti.png)

::: hoca
**Söyle:** "Sıfırdan başlamak yerine hazır bir şasiyi açıyoruz. Sahne boş kartının altındaki Omni şasi kartına bastığımızda dört tekerli robot birkaç saniyede sahneye geliyor. Boş sahne kartı ise robot yüklemiyor, kartı kapatıp Parça Ekle sekmesini açıyor."
:::

::: hoca
Robot gelince Görünüm > Sığdır robotun tamamını kadraja alıyor, durum şeridinde 68 parça yazıyor. Daha fazla hazır robot sol paneldeki Robot Kataloğu sekmesinde duruyor.
:::

## Robotun etrafında gezin {sure=1}

- Sağ tuşla sürükle, kamera döner
- Tekerlek yaklaştırır ve uzaklaştırır
- Orta tuşla sürükle, görüntü kayar
- Görünüm küpünde **ÜST** robota üstten baktırır

![](img/builder-gezin-fare.png)

::: hoca
**Söyle:** "Kamerayı fareyle oynatıyoruz. Sağ tuşla döndürüyoruz, tekerlekle yaklaşıyoruz, orta tuşla görüntüyü kaydırıyoruz. Sol tuş yalnız seçim yapıyor. Köşedeki küpün ÜST yüzüne bastığımızda robotu tam üstten görüyoruz."
:::

::: hoca
Tuşlar alışılmış programa uymuyorsa Görünüm menüsündeki FARE DÜZENİ grubundan SolidWorks ya da Fusion 360 seçilebiliyor.
:::

## Robota bir parça ekle {sure=1}

- **Sol panel** > **Parça Ekle**
- **Yapı** > **Structure**
- Boy listesinden bir boy seçin
- Parça sahneye gelir ve seçili olur

![](img/builder-ilk-structure-ekle.png)

::: hoca
**Söyle:** "Sol paneldeki Parça Ekle sekmesinden Yapı bölümünü açıyoruz ve Structure satırını seçiyoruz. Listeden bir boya bastığımızda parça sahneye geliyor. Özellikler panelinin başında Structure yazıyor, durum şeridinde 69 parça ve 1 seçili görüyoruz."
:::

## Parçayı robota tak {sure=1}

- **Araç çubuğu** > **Tak** (B)
- Önce parçanın bir deliği
- Sonra şasinin üstündeki bir delik
- Parça deliğe eksen eksene oturur

![](img/builder-ilk-tak-sonuc.png)

::: hoca
**Söyle:** "Tak aracı bir parçanın deliğini başka bir parçanın deliğine oturtuyor. Önce eklediğimiz Structure parçasının bir deliğine, sonra şasinin üst yüzündeki bir deliğe tıklıyoruz. Parça o deliğe yerleşiyor."
:::

## İnce ayar ve aracı kapatma {sure=1}

- **R** parçayı delik ekseninde döndürür
- **F** parçayı ters çevirir
- **Esc** iki kez, aracı kapatır
- Yanlış takıldıysa **Ctrl+Z**

![](img/builder-ilk-tak-sonuc.png)

::: hoca
**Söyle:** "Parça istediğimiz gibi durmuyorsa R ile delik ekseni etrafında döndürüyoruz, F ile ters çeviriyoruz. Esc tuşuna ilk basış ince ayarı bitiriyor, ikinci basış aracı kapatıyor. Yanlış bir deliğe taktıysak Ctrl Z ile geri alıyoruz."
:::

## Projeyi kaydet {sure=1}

- **Araç çubuğu**nda proje adına basın
- **ilk robot** yazıp Enter
- **Dosya** > **Kaydet (JSON indir)**
- Bilgisayara **ilk robot.json** iner

![](img/builder-ilk-kaydet.png)

::: hoca
**Söyle:** "Builder çalışmamızı bu tarayıcıda kendiliğinden saklıyor. Başka bir bilgisayarda açmak için projeye ad veriyoruz ve Dosya menüsünden JSON dosyası olarak indiriyoruz. Bu dosyayı sonra Dosya menüsündeki Yükle ile yeniden açıyoruz."
:::

## Özet {sure=1}

- Hazır robot **Sahne boş** kartından gelir
- Kamera sağ tuş, tekerlek ve orta tuşla oynar
- **Parça Ekle** ve **Tak** ile parça eklenir
- **Kaydet (JSON indir)** projeyi dosyaya alır

![](img/builder-ilk-sonuc.png)

::: hoca
**Söyle:** "İlk on dakikada hazır bir robot açtık, etrafında gezdik, bir parça takıp projeyi kaydettik. Sonraki sunumda Builder ekranının bölgelerini, menüleri ve kısayol tuşlarını tek tek tanıyoruz."
:::

# Ödevler

## İlk robotunu kaydet {#bld-ilk-odev tur=builder}

Omni şasiyi açın, üstüne bir Structure parçası takın. Projeye kendi adınızı verin ve Dosya > Kaydet (JSON indir) ile indirin.

::: hoca
Tamam: şasinin üstünde delikleri hizalı bir Structure var, proje adı değiştirilmiş.
Tekrar: parça şasiye değmiyor ya da havada duruyor.
:::
