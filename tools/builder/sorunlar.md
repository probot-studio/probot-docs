# Sorun giderme

Bu sayfa Builder'da çıkan uyarıları ve takıldığın durumları gruplar hâlinde listeler. Her başlık
ekrandaki yazıyla başlar, altında sebep ve çözüm vardır. Ekrandaki metni bu sayfada arayabilirsin
(<kbd>Ctrl</kbd>+<kbd>F</kbd>).

Uyarıların çoğu ekranın köşesinde kısa bildirim olarak çıkar ve 3,5 saniye kalır. Bildirimi
kaçırdıysan aynı işi yeniden dene.

## Önce durum göstergelerine bak {#durum-gostergeleri}

| Gösterge | Anlamı | Ne yap |
|---|---|---|
| **Araç çubuğu**nda proje adının yanında "Kaydedildi" | Robot hesabına kayıtlı, son hâli kaydedildi. | Bir şey yapma. |
| **Araç çubuğu**nda proje adının yanında "Kaydedilmedi" | Hesaba kaydettikten sonra robotu değiştirdin. Paylaşım linki eski hâli gösterir. | Yazıya bas. **Hesabıma kaydet** penceresinde **Kaydet**'e bas. |
| Proje adının yanında kayıt yazısı yok | Sahne hesaptaki bir robota bağlı değil. | **Dosya** > **Hesabıma kaydet...**'i seç ya da **Robotlarım...**'dan robotu aç. |
| **Dosya** menüsünde hesap öğelerinin yanında "Bağlanıyor" ya da "Şu an kullanılamıyor" | Hesap sunucusuna bağlanılıyor ya da ulaşılamıyor. | Aşağıda "Hesap ve paylaşım" bölümündeki ilk başlığa bak. |
| Durum şeridinde "N parça · N seçili" | Sahnedeki parça sayısı ve seçili parça sayısı. | Sayı beklediğin gibi değilse seçimi yeniden yap. |
| Durum şeridinde "N gizli" | Sahnede gizlenmiş parça var. Gizli parça sahnede tıklanmaz. | **Sahne**de boş bir yere sağ tıkla, **Tümünü göster (n)**'i seç. |
| **Snap** turuncu, durum şeridinin ucunda "2.5mm · 45° snap · 10mm delik · M5" | Snap açık. Parça 2,5 mm adımla ilerler, deliklere mıknatıslanır. | Serbest taşımak için <kbd>Shift</kbd>'i basılı tut ya da **Snap**'i kapat. |
| Durum şeridinin ucunda "snap kapalı · 10mm delik · M5" | Snap kapalı. Parça serbest ilerler, delik mıknatısı çalışmaz. | Parçayı deliğe oturtmak için **Araç çubuğu**nda **Snap**'i aç. |
| Durum şeridinde "Tak · taşınacak deliğe tıkla" ya da "Tak · hedef deliğe tıkla" | **Tak** açık, Builder senden bir delik bekliyor. | Yazan deliğe tıkla. Çıkmak için <kbd>Esc</kbd>'e bas. |
| **Sahne**nin altında **Montaj şeridi**, başlıkta "Adım N / M" | Robot montaj modunda. Parça taşınmaz, eklenmez, silinmez. | Değiştirmek için **Düzenlemeye geç**'e bas. |
| **Sahne**nin ortasında "Sahne boş" kartı | Sahnede parça yok. **Sim'de dene** soluktur, hesaba kayıt yapılmaz. | Kartta **Starter Bot**, **Omni şasi** ya da **WattOS mecanum şasi**'ye bas ya da **Parça listesi**'ne bas. |
| **Derleme** panelinde "Derleme başarılı" | Yapı bağlı, çarpışma yok. | Bir şey yapma. |
| **Derleme** panelinde "Uyarılarla derlendi" | Hata yok, en az bir uyarı var. | Sarı noktalı bulgulara bak. Bkz. [Robotu derle](robotu-derle.md). |
| **Derleme** panelinde "Derleme başarısız" | En az bir hata var. | Kırmızı noktalı bulguya bas, parçaları düzelt, **Yeniden derle**'ye bas. |

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek. Durum şeridindeki snap yazısında "10mm delik · M5"
    yerine "10 mm ızgara" yazar: "2.5mm · 45° snap · 10 mm ızgara" ya da "snap kapalı · 10 mm ızgara".

<!-- SAY: Bir sorun olduğunda önce proje adının yanına, durum şeridine ve Derleme paneline bakıyoruz. -->

## Açılış ve ekran

### "Builder bilgisayarda çalışır" ekranı çıkıyor {#bilgisayarda-calisir}

Sebep: Tarayıcı penceresi 900 px ya da daha dar, ya da dokunmatik cihazda 1100 px'den dar. Builder fare ve
büyük ekran ister.

Çözüm: Bilgisayardaysan pencereyi genişlet ya da tarayıcı yakınlaştırmasını azalt. Telefondaysan
**Linki bilgisayarıma gönder**'e bas (varsa **Linki kopyala**'ya) ve linki bilgisayarda aç.

Bkz. [Builder](index.md), [Ne gerekir](../index.md#ne-gerekir).

### Bir panel kayboldu {#panel-kayboldu}

Sebep: Panelin çarpısına basıldı ya da **Görünüm** menüsünde işareti kaldırıldı.

Çözüm: **Görünüm** menüsündeki **PANELLER** grubundan paneli seç. Hepsini ilk yerine almak için
**Görünüm** > **Yerleşimi sıfırla**'yı seç.

Bkz. [Panelleri düzenle](panelleri-duzenle.md).

### Kısayol tuşları çalışmıyor {#kisayollar-calismiyor}

| Sebep | Çözüm |
|---|---|
| İmleç bir metin kutusunda. | **Sahne**de boş bir yere tıkla. |
| Montaj modu açık. | **Montaj şeridi**nde **Düzenlemeye geç**'e bas. |
| **Aynala** ya da **Dizi** penceresi açık. | Pencereyi <kbd>Esc</kbd> ile kapat. |

Bkz. [Kısayollar](kisayollar.md).

### Sol tuşla sürükleyince kamera dönmüyor, kutu çıkıyor {#kamera-donmuyor}

Sebep: Sol tuş yalnız seçim yapar. Kamera sağ ve orta tuşla oynar.

Çözüm: Sağ tuşla sürükle. Başka bir düzen için **Görünüm** menüsündeki **FARE DÜZENİ** grubundan seç.

Bkz. [Sahnede gezin](sahnede-gezin.md).

<!-- SAY: Ekran dar geldiğinde ya da bir panel kaybolduğunda çözüm Görünüm menüsünde duruyor. -->

## Parça ekleme ve mağaza

### "Mağaza stoğuna ulaşılamadı - statik katalog kullanılıyor" yazıyor {#magaza-stoguna-ulasilamadi}

Bu bildirim Builder açılırken çıkar.

Sebep: Builder mağazanın canlı stoğuna ulaşamadı. Parçalar yine eklenir, stok bilgisi eskidir.

Çözüm: Bağlantını kontrol et ve sayfayı yenile.

Bkz. [Parça ekle](parca-ekle.md).

### "Sonuç bulunamadı" yazıyor {#sonuc-bulunamadi}

Sebep: **Parça ara...** kutusundaki metne uyan parça yok.

Çözüm: Daha kısa bir sözcük ya da ürün kodu yaz.

Bkz. [Parça ekle](parca-ekle.md).

### "... modeli yüklenemedi" yazıyor {#parca-modeli-yuklenemedi}

Yazının başında parçanın adı durur.

Sebep: Parçanın 3B modeli indirilemedi.

Çözüm: Bağlantını kontrol et, parçayı sil ve yeniden ekle.

Bkz. [Parça ekle](parca-ekle.md).

### "Parça modeli yüklenemedi, aynalanmadı" yazıyor {#aynalanmadi}

Sebep: Aynalanacak parçanın modeli indirilemedi.

Çözüm: Bağlantını kontrol et ve **Aynala**'yı yeniden dene.

Bkz. [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md).

### "Seçim ayna düzleminde ve kendi aynası, kopya gerekmedi" yazıyor {#ayna-duzleminde}

Birden çok parçada "N parça ayna düzleminde, kendi aynası olduğu için kopyalanmadı" yazar.

Sebep: Parça ayna düzleminin tam ortasında duruyor. Aynası kendisiyle aynı.

Çözüm: Başka bir ayna merkezi seç (**Seçimin yanı** gibi).

Bkz. [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md).

### "... için tam ayna parçası yok. En yakın duruşla kondu, kontrol et" yazıyor {#tam-ayna-parcasi-yok}

Yazının başında parçanın adı durur.

Sebep: Parçanın sağ-sol ters bir eşi katalogda yok. Builder parçayı en yakın duruşla koydu.

Çözüm: Kopyayı kontrol et, gerekirse **Döndür** ile düzelt.

Bkz. [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md).

### "Adet 2 ile 50 arasında olmalı" ya da "Aralık 0 olamaz" yazıyor {#dizi-deger-siniri}

**Dizi** penceresindeki bir değer sınır dışında.

| Sebep | Çözüm |
|---|---|
| "Adet 2 ile 50 arasında olmalı": **Toplam adet** sınır dışında. | **Toplam adet** kutusuna 2 ile 50 arası bir sayı yaz. |
| "Aralık 0 olamaz": **Aralık (mm)** 0. | **Aralık (mm)** kutusuna 0 dışında bir sayı yaz. |

Bkz. [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md).

### "Bu parça kesilemez, delik ayrı Delik parçası olarak eklendi" yazıyor {#parca-kesilemez}

Sebep: Extrude'da **Tür** olarak **Delik**'i seçtin ama sketch'i açtığın parça kesilemiyor (ör. katalog
parçası ya da içe aktarılan model). Delik yalnız temel şekilleri keser.

Çözüm: Delik ayrı parça olarak durur, gerekmiyorsa sil. Kesmek için sketch'i bir temel şeklin yüzünde
aç.

Bkz. [Sketch çiz ve Extrude ile katı yap](sketch-ve-extrude.md).

### "İçe aktarılan parçalar birleştirilemez" ya da "Sketch birleştirilemez" yazıyor {#birlestirilemez}

Aynı durumda "Birleştirmek için en az bir katı şekil seç" de yazabilir. **Birleştir** yalnız temel
şekillerde çalışır ve en az bir **Katı** şekil ister.

| Sebep | Çözüm |
|---|---|
| Seçimde içe aktarılan parça var. | İçe aktarılan parçaları seçimden çıkar. |
| Seçimde sketch var. | Sketch'leri seçimden çıkar. |
| Seçimde **Katı** şekil yok. | Seçime bir katı şekil ekle. |

Bkz. [Temel şekillerle parça yap](temel-sekillerle-parca-yap.md).

### "Sketch yalnız düz bir yüzde açılır" yazıyor {#sketch-duz-yuz}

Sebep: Sketch için eğri bir yüze tıkladın.

Çözüm: Düz bir yüze ya da bir düzleme tıkla.

Bkz. [Sketch çiz ve Extrude ile katı yap](sketch-ve-extrude.md).

### "Sketch içinde kapalı bölge yok" yazıyor {#kapali-bolge-yok}

Sebep: Extrude kapalı bir şekil ister. Çizgilerin uçları birleşmiyor.

Çözüm: Şekli kapat ya da dikdörtgen veya daire çiz.

Bkz. [Sketch çiz ve Extrude ile katı yap](sketch-ve-extrude.md).

### "Fazla ya da çelişen kısıt var, kırmızıları sil" yazıyor {#celisen-kisit}

Sebep: Sketch'teki kısıtlar birbirine uymuyor.

Çözüm: Kırmızı görünen kısıtları sil.

Bkz. [Sketch çiz ve Extrude ile katı yap](sketch-ve-extrude.md).

<!-- SAY: Parça eklerken çıkan uyarıların çoğu bağlantı ya da yanlış seçimle ilgili. -->

## Taşıma, Tak, Ölç

### "Montaj modunda düzenleme kapalı. Değiştirmek için Düzenlemeye geç" yazıyor {#montaj-modu}

Sebep: Robot **Adım adım kur** ile montaj modunda açık. Bu modda parça taşınmaz, eklenmez, silinmez.
**Parçalar** listesi yalnız okunur.

Çözüm: **Montaj şeridi**nde **Düzenlemeye geç**'e bas.

Bkz. [Robotu adım adım kur](adim-adim-kur.md).

### Parça 2,5 mm adımla zıplıyor ya da deliğe yapışıyor {#snap-acik}

Sebep: Snap açık.

Çözüm: Taşırken <kbd>Shift</kbd>'i basılı tut ya da **Araç çubuğu**nda **Snap**'i kapat.

Bkz. [Parçayı taşı ve döndür](tasi-ve-dondur.md).

### "Bu parça da taşınıyor. Seçim dışındaki bir parçaya tıkla" yazıyor {#bu-parca-da-tasiniyor}

Sebep: **Tak**'ta hedef olarak taşınan seçimin içindeki bir parçaya tıkladın.

Çözüm: Seçimin dışındaki bir parçanın deliğine tıkla.

Bkz. [Parçaları deliklerinden tak](parcalari-tak.md).

### "Hedef parça taşınan parçaya bağlı. Önce Özelliklerden bağı çöz" yazıyor {#hedef-parca-bagli}

Sebep: Hedef parça, taşıdığın parçaya bağlı. Birlikte hareket ederler.

Çözüm: Hedef parçayı seç, **Özellikler** panelinin **Bağlantı** alanında **Bağı çöz**'e bas, sonra
yeniden tak.

Bkz. [Parçaları grupla ve birbirine bağla](grupla-ve-bagla.md).

### "Bu yüzün arkası bulunamadı" yazıyor {#yuzun-arkasi-yok}

Sebep: <kbd>F</kbd> ile ters çevirmek için parçanın karşı yüzü bulunamadı.

Çözüm: Parçayı <kbd>R</kbd> ile döndür ya da başka bir delikten tak.

Bkz. [Parçaları deliklerinden tak](parcalari-tak.md).

### <kbd>Esc</kbd>'e bastım, bütün ölçümler silindi {#olcumler-silindi}

Sebep: **Ölç** açıkken <kbd>Esc</kbd> önce yarım ölçümü, sonra bütün ölçümleri siler.

Çözüm: Tek ölçümü silmek için **Ölçüm** panelinde **Bu ölçümü sil**'e bas.

Bkz. [Mesafe ölç](mesafe-olc.md).

### <kbd>Del</kbd>'e bastım, parça silinmedi {#del-parca-silmiyor}

Sebep: **Ölç** açıkken <kbd>Del</kbd> parçayı değil son ölçümü siler.

Çözüm: **Ölç**'ü kapat, parçayı seç ve <kbd>Del</kbd>'e bas.

Bkz. [Parçaları seç, gizle ve sil](parcalari-sec-gizle-sil.md).

<!-- SAY: Parça yerinden oynamıyorsa önce montaj modunda olup olmadığımıza ve Snap ayarına bakıyoruz. -->

## Eklem ve hareket

### "Bu bağ döngü kurar. Parça kendi bağlı parçasına bağlanamaz" yazıyor {#bag-dongu-kurar}

Sebep: Seçtiğin parça zaten bu parçaya bağlı.

Çözüm: Başka bir parça seç ya da önce **Bağı çöz**'e bas.

Bkz. [Parçaları grupla ve birbirine bağla](grupla-ve-bagla.md).

### "Ortak eksen bulunamadı" yazıyor {#ortak-eksen-yok}

Yazının tamamı: "Ortak eksen bulunamadı. Eklem için iki parçanın deliği aynı eksende olmalı ya da
parça motor veya servo miline takılı olmalı".

Sebep: İki parçanın delikleri aynı eksende değil.

Çözüm: Parçayı **Tak** ile karşı deliğe ya da motor miline tak.

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

### "Eşleşecek dişli yok" ya da "Eşleşecek kasnak yok" yazıyor {#eslesecek-disli-yok}

Yazının devamında "Diğer parçanın da eklemi olmalı ve eksenleri paralel olmalı" yazar.

| Sebep | Çözüm |
|---|---|
| Süren dişlinin ya da kasnağın eklemi yok. | Önce diğer parçaya eklem kur. |
| İki parçanın eksenleri paralel değil. | Eksenleri paralel yap. |

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

### "Bu servonun açısı veride yok, 180° varsayıldı" yazıyor {#servo-acisi-yok}

Sebep: Servonun dönüş açısı katalogda yok.

Çözüm: Gerekirse **Sınırlı dönüş**'ü seç, **En az °** ve **En çok °** değerlerini yaz.

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

### "Motor ya da servo eklemi yok. Tekeri motor miline Tak ile bağla" yazıyor {#motor-eklemi-yok}

Sebep: **Hareket** panelinde oynatılacak motor ya da servo eklemi yok.

Çözüm: Tekeri **Tak** ile motor miline tak. Eklem kendiliğinden kurulur.

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

### "Eklemler zaten kurulu" ya da "Kurulacak eklem bulunamadı" yazıyor {#eklem-bulunamadi}

Sebep: **Eklemleri otomatik kur** yeni eklem bulamadı.

Çözüm: Eklemi **Özellikler** panelinin **Bağlantı** alanından elle kur.

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

<!-- SAY: Eklem kurulamıyorsa çoğunlukla iki parçanın delikleri aynı eksende değil. -->

## Kayış

### "Kayış için iki kasnak seç" ya da "İki parça da kasnak olmalı" yazıyor {#iki-kasnak-sec}

Sebep: Seçimde tam iki kasnak yok.

Çözüm: İki kasnağı <kbd>Shift</kbd>+tık ile seç, sonra <kbd>K</kbd>'ye bas.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

### "Kasnak eksenleri paralel değil" yazıyor {#kasnak-eksenleri-paralel-degil}

Sebep: Kasnaklar farklı yönlere bakıyor.

Çözüm: Kasnaklardan birini döndür, eksenleri paralel yap.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

### "Kasnaklar aynı düzlemde değil, N mm kayık" yazıyor {#kasnaklar-ayni-duzlemde-degil}

Sebep: Kasnaklar mil boyunca hizalı değil.

Çözüm: Kasnaklardan birini yazan mesafe kadar kaydır.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

### "Kasnaklar çok yakın" yazıyor {#kasnaklar-cok-yakin}

Sebep: Kasnaklar arasında kayışa yer yok.

Çözüm: Kasnakları birbirinden uzaklaştır.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

### "Bu kasnaklar arasında zaten kayış var" yazıyor {#zaten-kayis-var}

Sebep: Bu iki kasnağa daha önce kayış eklendi.

Çözüm: Var olan kayışı kullan ya da silip yeniden ekle.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

### "Kasnaklar kayışa artık uymuyor" yazıyor {#kayisa-uymuyor}

Bu yazı kayış seçiliyken çıkar: "Kasnaklar kayışa artık uymuyor. ... Kayış son uyduğu yerde duruyor".

Sebep: Kayışı ekledikten sonra kasnaklardan birini taşıdın ya da döndürdün. Ortadaki metin nedeni
söyler (ör. "Kasnaklar çok yakın" ya da "Kasnak eksenleri paralel değil").

Çözüm: Kasnağı geri al (<kbd>Ctrl</kbd>+<kbd>Z</kbd>) ya da kayışı silip yeniden ekle.

Bkz. [İki kasnağa kayış ekle](kayis-ekle.md).

<!-- SAY: Kayış eklenmiyorsa iki kasnağın aynı düzlemde ve paralel olduğunu kontrol ediyoruz. -->

## İçe aktarma

### "Bu dosya türü desteklenmiyor. STL, STEP, GLB ya da OBJ seç" yazıyor {#dosya-turu-desteklenmiyor}

Sebep: Dosyanın uzantısı desteklenmiyor.

Çözüm: Modeli STL, STEP, GLB ya da OBJ olarak dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Dosya çok büyük. En fazla 25 MB" ya da "Dosya boş" yazıyor {#dosya-cok-buyuk}

Sebep: Dosya 25 MB'tan büyük ya da içi boş.

Çözüm: Modeli sadeleştirip yeniden dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Dosya okunamadı. Bozuk ya da eksik olabilir" yazıyor {#dosya-okunamadi}

Sebep: Dosya bozuk ya da yarım inmiş.

Çözüm: Dosyayı tasarım programından yeniden dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Dosyada katı bir model yok" yazıyor {#kati-model-yok}

Aynı durumda "Model düz görünüyor, kalınlığı yok" ya da "Dosyada geçersiz sayılar var" da yazabilir.

Sebep: Dosyada kalınlığı olan bir katı yok ya da veri bozuk.

Çözüm: Tasarım programında katı gövdeyi seç ve yeniden dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Draco sıkıştırmalı GLB açılamıyor. Sıkıştırmadan dışa aktar" yazıyor {#draco-glb}

Sebep: GLB dosyası Draco ile sıkıştırılmış.

Çözüm: GLB'yi sıkıştırmasız dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Bu GLTF ayrı dosyalara bağlı. Tek parça GLB olarak dışa aktar" yazıyor {#gltf-ayri-dosyalar}

Sebep: GLTF dosyası ayrı doku ya da veri dosyalarına bağlı.

Çözüm: Modeli tek dosya GLB olarak dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "Model sadeleştirilemedi" yazıyor {#model-sadelestirilemedi}

Sebep: Model çok fazla üçgen içeriyor ve sadeleştirme başarısız oldu.

Çözüm: Modeli tasarım programında sadeleştirip yeniden dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "STEP okuyucu açılamadı" ya da "STEP okuyucu yüklenemedi. Bağlantını kontrol et" yazıyor {#step-okuyucu}

Sebep: STEP okuyucu tarayıcıya indirilemedi.

Çözüm: Bağlantını kontrol et, sayfayı yenile ve yeniden dene.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "STEP dosyası çok uzun sürdü. Daha sade bir model dene" yazıyor {#step-cok-uzun-surdu}

Sebep: STEP dosyası çok karmaşık.

Çözüm: Daha az parçalı bir model ya da STL dene.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "STEP dosyası okunamadı. Bozuk ya da eksik olabilir" yazıyor {#step-okunamadi}

Sebep: STEP dosyası bozuk.

Çözüm: Dosyayı yeniden dışa aktar.

Bkz. [3B model içe aktar](model-ice-aktar.md).

### "N içe aktarılan parçanın modeli dosyada yok. Dosyayı yeniden seç" yazıyor {#model-dosyada-yok}

İçe aktarılan parça sahnede kutu gibi görünür.

Sebep: Projeyi açtığın dosyada bu parçanın model verisi yok.

Çözüm: Parçayı seç ve **Özellikler** panelinde **Dosyayı yeniden seç**'e bas.

Bkz. [3B model içe aktar](model-ice-aktar.md).

<!-- SAY: İçe aktarma hatalarının çoğu modeli tasarım programından yeniden dışa aktararak çözülüyor. -->

## Dosya ve otomatik kayıt

### "Sahnedeki parçalar silinecek. Yeni proje açılsın mı?" soruluyor {#yeni-proje-onayi}

Sebep: Sahnede parça varken **Dosya** > **Yeni**'yi seçtin.

Çözüm: Çalışmayı saklamak istiyorsan vazgeç ve önce **Dosya** > **Kaydet (JSON indir)**'i seç.

Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).

### "Proje dosyası okunamadı" yazıyor {#proje-dosyasi-okunamadi}

Sebep: Seçtiğin dosya Builder proje dosyası değil, bozuk ya da boş sahneyle kaydedilmiş (içinde
parça yok).

Çözüm: **Dosya** > **Kaydet (JSON indir)** ile, sahnede en az bir parça varken indirilmiş bir `.json`
dosyası seç. Boş sahneyle kaydedilen dosya açılmaz, başka bir kopyayı dene.
<!-- PROD-ONLY: boş sahne JSON düzeltmesi yayına çıkınca boş sahne kısmını kaldır (dosyaya-kaydet-ve-ac.md ile birlikte). -->

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek. Boş sahneyle kaydedilen dosya da açılır;
    sahne boş gelir. Bu yazı yalnız dosyadaki parçaların hepsi bozuksa çıkar.

Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).

### "N parça bozuktu, atlandı" yazıyor {#parca-bozuktu}

Sebep: Dosyadaki bazı parçaların verisi okunamadı. Geri kalanı açıldı.

Çözüm: Eksik parçaları yeniden ekle ve projeyi yeniden kaydet.

Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).

### "Otomatik kayıt yapılamadı" yazıyor {#otomatik-kayit-yapilamadi}

Depolama dolduğunda yazı "Otomatik kayıt yapılamadı: tarayıcı depolama alanı dolu" olur.

Sebep: Tarayıcı çalışmanı saklayamadı.

Çözüm: Kaybetmemek için **Dosya** > **Kaydet (JSON indir)**'i seç.

Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).

### "Otomatik kayıt içe aktarılan modelleri sığdıramadı" yazıyor {#otomatik-kayit-sigdiramadi}

Yazının devamı: "Projeyi Dosya menüsünden Kaydet ile indir".

Sebep: İçe aktarılan modeller tarayıcıda saklanamayacak kadar büyük.

Çözüm: **Dosya** > **Kaydet (JSON indir)**'i seç. Modeller dosyaya gömülür.

Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).

### "N içe aktarılan parçanın modeli otomatik kayıtta yok. Dosyayı yeniden seç" yazıyor {#model-otomatik-kayitta-yok}

Bu yazı sayfayı yeniden açınca çıkar.

Sebep: Otomatik kayıt bu modelleri saklayamadı.

Çözüm: Parçayı seç ve **Özellikler** panelinde **Dosyayı yeniden seç**'e bas.

Bkz. [3B model içe aktar](model-ice-aktar.md).

<!-- SAY: Otomatik kayıt bir sorun bildirirse projeyi dosya olarak indiriyoruz. -->

## Hesap ve paylaşım

### "Bağlanıyor" ya da "Şu an kullanılamıyor" yazıyor {#hesap-ogeleri-soluk}

**Dosya** menüsündeki hesap öğeleri soluk görünür, yanında bu yazılardan biri durur.

| Sebep | Çözüm |
|---|---|
| "Bağlanıyor": Builder hesap sunucusuna bağlanıyor. | Biraz bekle. |
| "Şu an kullanılamıyor": Sunucuya ulaşılamadı. | Sayfayı yenile. Bu arada **Dosya** > **Kaydet (JSON indir)** ile kaydet. |

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "... için giriş yapmalısın. Robotun bu sekmede kalır." yazıyor {#giris-yapmalisin}

Sebep: Probot hesabına giriş yapmadın.

Çözüm: **Yeni sekmede giriş yap**'a bas ve giriş yap. Sonra bu sekmeye dön ve yeniden dene.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Kaydetmek için sahnede en az bir parça olmalı" yazıyor {#kaydetmek-icin-parca-yok}

Aynı durumda "Sahnede parça yok. Önce robotunu kur, sonra kaydet." de yazabilir.

Sebep: Sahne boş.

Çözüm: Parça ekle ya da hazır robot yükle.

Bkz. [Hazır robotla başla](hazir-robotla-basla.md).

### "Robot X MB, en fazla Y MB kaydedilebilir" yazıyor {#robot-cok-buyuk}

Yazının devamı: "İçe aktarılan modelleri azaltıp tekrar dene". Aynı durumda "Robot sunucuya göndermek
için çok büyük. İçe aktarılan modelleri azaltıp tekrar dene" de yazabilir.

Sebep: Robot, hesaba kaydedilebilecek boyuttan büyük. Boyutu çoğunlukla içe aktarılan modeller büyütür.

Çözüm: İçe aktarılan modelleri sil ya da sadeleştir. Robotu **Dosya** > **Kaydet (JSON indir)** ile
dosyaya kaydet.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene" yazıyor {#sunucuya-ulasilamadi}

Aynı durumda "Sunucu şu an cevap vermiyor. Biraz sonra tekrar dene" ya da "Sunucudan beklenmeyen
cevap geldi" de yazabilir.

Sebep: Hesap sunucusuna ulaşılamadı.

Çözüm: Bağlantını kontrol et, biraz sonra yeniden dene.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Çok hızlı istek yapıldı. Bir dakika sonra tekrar dene" yazıyor {#cok-hizli-istek}

Sebep: Kısa sürede çok fazla istek gönderildi.

Çözüm: Bir dakika bekle ve yeniden dene.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Link oluşturmak için robotu önce hesabına kaydet." yazıyor {#link-icin-once-kaydet}

Sebep: Robot henüz hesabına kayıtlı değil.

Çözüm: Önce **Dosya** > **Hesabıma kaydet...**'i seç.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Linkte son kaydedilen hali görünür" yazıyor {#linkte-son-kaydedilen-hal}

Yazının devamı: "Değişikliklerini göstermek için tekrar kaydet."

Sebep: Kaydettikten sonra robotu değiştirdin. Link eski hâli gösterir.

Çözüm: **Dosya** > **Hesabıma kaydet...** ile yeniden kaydet.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Link seçildi, Ctrl+C ile kopyala" yazıyor {#link-secildi}

Sebep: Tarayıcı panoya yazmaya izin vermedi.

Çözüm: <kbd>Ctrl</kbd>+<kbd>C</kbd>'ye bas.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Paylaşılan robot açılamadı" yazıyor {#paylasilan-robot-acilamadi}

Aynı durumda "Bu paylaşım linki kapalı ya da bulunamadı" ya da "Robot bulunamadı" da yazabilir.

Sebep: Link kapatıldı, robot silindi ya da link yanlış.

Çözüm: Linki gönderen kişiden yeni link iste.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "İçe aktarılan parçalar katalogda paylaşılamaz. Önce onları kaldır" yazıyor {#katalogda-paylasilamaz}

Sebep: Topluluk kataloğu içe aktarılan modelleri kabul etmez.

Çözüm: İçe aktarılan parçaları sil, sonra formda **Paylaş**'a yeniden bas.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Robot paylaşılamadı" ya da "İstek tamamlanamadı" yazıyor {#robot-paylasilamadi}

Sebep: Paylaşım isteği sunucuda tamamlanamadı.

Çözüm: Biraz sonra yeniden dene.

Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).

### "Topluluk robotları alınamadı" yazıyor {#topluluk-robotlari-alinamadi}

Bu yazı **Robot Kataloğu**'nda çıkar.

Sebep: Topluluk listesi sunucudan alınamadı.

Çözüm: **Tekrar dene**'ye bas.

Bkz. [Hazır robotla başla](hazir-robotla-basla.md).

### "Robot yüklenemedi" yazıyor {#robot-yuklenemedi}

Bu yazı topluluk robotunu açarken çıkar.

Sebep: Robotun dosyası alınamadı ya da okunamadı.

Çözüm: Biraz sonra yeniden dene ya da başka bir robot seç.

Bkz. [Hazır robotla başla](hazir-robotla-basla.md).

<!-- SAY: Hesap ve paylaşım sorunlarında robotu her zaman dosyaya da kaydediyoruz. -->

## Gerçeğe dök ve robot kontrolü

### "Sahnede parça yok - önce robotunu tasarla" yazıyor {#gercege-dok-sahne-bos}

Sebep: Sahne boş.

Çözüm: Parça ekle ya da hazır robot yükle.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "Control Hub yok", "Pil yok" ya da "Güç anahtarı yok" yazıyor {#zorunlu-elektronik-yok}

Sebep: Robotta FTC'nin istediği zorunlu elektronik parça eksik.

Çözüm: **Eksik parçaları ekle**'ye bas, gelen parçaları robotun üstüne taşı.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "Robotta N motor var, sınır 8" ya da "Robotta N servo var, sınır 8" yazıyor {#motor-servo-siniri}

Sebep: Robotta 8'den fazla motor ya da servo var.

Çözüm: **göster**'e bas, fazla motor ya da servoyu sil.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "Robot başlangıçta ... N mm fazla, sınır 18 inç" yazıyor {#boyut-siniri}

Sebep: Robot bir yönde 18 inçi (457,2 mm) aşıyor.

Çözüm: **göster**'e bas, uçtaki parçaları içeri al ya da kısalt.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "... robota bağlı değil" yazıyor {#robota-bagli-degil}

Sebep: Bazı parçalar robotun geri kalanına değmiyor.

Çözüm: **göster**'e bas, parçaları robota taşı ya da tak.

Bkz. [Parçaları deliklerinden tak](parcalari-tak.md).

### "Mağaza fiyatlarına şu an ulaşılamıyor" yazıyor {#magaza-fiyatlari}

Yazının devamı: "liste görünür ama sepete ekleme kapalı. Birazdan tekrar dene."

Sebep: Mağazanın fiyat bilgisi alınamadı.

Çözüm: Pencereyi kapat, biraz sonra yeniden aç.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "Sepete ekleme tamamlanamadı. Mevcut sepetin korunuyor; tekrar dene." yazıyor {#sepete-ekleme-tamamlanamadi}

Sebep: Sepete ekleme yarıda kaldı. Mağazadaki sepetin değişmedi.

Çözüm: **Sepete ekle ve mağazaya git**'e yeniden bas.

Bkz. [Gerçeğe dök](gercege-dok.md).

### "Bazı parçaların modeli yüklenemedi" yazıyor {#bazi-parcalarin-modeli}

Sebep: **Eksik parçaları ekle** sırasında bir parça modeli indirilemedi.

Çözüm: Bağlantını kontrol et. Robot kontrolünü pencereyi yeniden açarak tekrarla.

Bkz. [Gerçeğe dök](gercege-dok.md).

### Bir parça sepete gitmiyor {#sepete-gitmiyor}

Sebep: **Birim** sütununda "fiyat yakında", "stokta yok" ya da "stokta N" yazıyor.

Çözüm: Bu parçayı mağazadan ayrıca takip et.

Bkz. [Gerçeğe dök](gercege-dok.md).

<!-- SAY: Robot kontrolündeki her eksikte göster düğmesi sorunlu parçayı sahnede buluyor. -->

## Derleme

### "Derleme başarısız" yazıyor {#derleme-basarisiz}

Sebep: Bulgularda en az bir hata var (ör. "iç içe girmiş").

Çözüm: Kırmızı noktalı bulguya bas, parçaları düzelt, **Yeniden derle**'ye bas.

Bkz. [Robotu derle](robotu-derle.md).

### "Sahne boş - derlenecek parça yok." yazıyor {#derlenecek-parca-yok}

Sebep: Sahnede malzeme parçası yok.

Çözüm: Parça ekle ya da hazır robot yükle.

Bkz. [Robotu derle](robotu-derle.md).

### "Ayrık grup: ... - ana yapıya bağlı değil." yazıyor {#ayrik-grup}

Aynı durumda "Hiç cıvata bağlantısı yok - parçalar sadece üst üste duruyor." de yazabilir.

Sebep: Parçalar birbirine değmiyor ya da delikleri hizalı değil.

Çözüm: Parçaları **Tak** ile deliklerinden birleştir.

Bkz. [Parçaları deliklerinden tak](parcalari-tak.md).

### "N tekerleğin ekseninde motor mili yok." yazıyor {#motor-mili-yok}

Aynı durumda "Tekerlek var ama motor yok - robot hareket edemez." de yazabilir.

Sebep: Tekerleği döndürecek motor yok.

Çözüm: Motor ekle ve tekerleği miline tak.

Bkz. [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md).

### Robotu düzelttim ama sonuç değişmedi {#sonuc-degismedi}

Sebep: Derleme sonucu kendiliğinden yenilenmez.

Çözüm: **Yeniden derle**'ye bas.

Bkz. [Robotu derle](robotu-derle.md).

<!-- SAY: Robotu düzelttikten sonra sonucu görmek için yeniden derliyoruz. -->

## Sim

### **Sim'de dene** soluk {#simde-dene-soluk}

Sebep: Sahne boş.

Çözüm: Bir robot yükle.

Bkz. [Robotu Sim'de dene](simde-dene.md).

### Menüde ve Robot Kataloğu'nda **Sim'de dene** hiç yok {#simde-dene-yok}

Sebep: Sim bu adreste yanıt vermiyor. Builder öğeyi yalnız Sim erişilebilirken gösterir.

Çözüm: Sayfayı yenile. Sorun sürerse projeyi dosyaya kaydet.

Bkz. [Robotu Sim'de dene](simde-dene.md).

### **Sim'de dene**'ye bastım, yeni sekme açılmadı {#yeni-sekme-acilmadi}

Sebep: Tarayıcı açılır pencereyi engelledi.

Çözüm: Adres çubuğundaki engelleme simgesinden bu siteye izin ver ve yeniden bas.

Bkz. [Robotu Sim'de dene](simde-dene.md).

<!-- SAY: Sim sekmesi açılmıyorsa tarayıcının açılır pencere engeline bakıyoruz. -->

## Hata bildir {#hata-bildir}

Sorunu bu sayfada bulamazsan ekibe Builder'dan çıkmadan yazabilirsin. Açılıştaki "Tasarım aracı
geliştirme aşamasında" penceresini kapattıktan sonra ekranın sağ altında **🐛 Hata bildir** düğmesi
durur.

1. Ekranın sağ altındaki **🐛 Hata bildir**'e bas. Açılış penceresi hâlâ açıksa oradaki
   **🐛 Hata bildir**'e bas.
2. **Başlık** kutusuna kısaca ne olduğunu yaz.
3. **Mesaj** kutusuna aşağıdaki listeyi yaz.
4. **Gönder**'e bas. Vazgeçmek için **Vazgeç**'e bas.

Sonuç: Pencerede "Alındı, teşekkürler! 🎉" yazar. **Kapat**'a basarak pencereyi kapat. Gönderim
başarısız olursa "Gönderilemedi - tekrar dene" yazar.

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek. 1. adımdaki
    **🐛 Hata bildir** sağ altta durmaz, **Üst şerit**te "BUILDER" rozetinin yanında durur. Açılış penceresi
    açıkken bir ok bu düğmeyi "Hata bildir tuşu hep burada" yazısıyla gösterir.

Mesaja şunları yaz:

- Açık robot ya da proje adı, ör. "Omni şasi" ya da **Araç çubuğu**ndaki proje adı.
- Son bastığın düğme ya da tuş.
- Ekrandaki yazı, tırnak içinde birebir.
- Tarayıcın, ör. Chrome.

<!-- SAY: Sorunu bulamazsak açılış penceresindeki Hata bildir ile ekibe ekrandaki yazıyı birebir gönderiyoruz. -->
