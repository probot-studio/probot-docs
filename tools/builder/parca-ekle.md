# Parça ekle

Bu sayfada katalogdan sahneye parça ekleyeceksin. Parçayı bölümden seçip, arayıp ya da sahneye
sürükleyip koyarsın. Sonra boyunu ve ölçüsünü **Özellikler** panelinden değiştirirsin.

![Omni şasinin yanında yeni eklenmiş, seçili bir Structure.](img/builder-parca-ekle-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi + 3 delik Structure eklendi ve seçili | hedef=body | isaret=yok | bekle=text="69 parça" -->

## Başlamadan önce

- Builder açık ve "Tasarım aracı geliştirme aşamasında" penceresi kapalı (bkz. [İlk 10 dakika](ilk-10-dakika.md)).
- Sahne boş ya da bir hazır robot açık. Örnekler boş sahneyle yazıldı. Hazır robotla da aynı
  adımlar geçerlidir (bkz. [Hazır robotla başla](hazir-robotla-basla.md)).
- **Sol panel**de **Parça Ekle** sekmesi görünüyor. Kapattıysan **Görünüm** menüsündeki
  **PANELLER** grubundan **Parça Ekle**'yi işaretle.

## Bölümden parça ekle

**Parça Ekle** sekmesi parçaları bölümlere ayırır. Her bölüm satırında küçük resimler ve parça
sayısı görünür. Aynı parçanın boy ya da ölçü seçenekleri tek bir aile satırında toplanır.

1. **Sol panel**de **Parça Ekle** sekmesini seç.
2. **Yapı** bölümünü seç. Bölümün parçaları açılır.
3. "11 boy seçeneği" yazan **Structure** satırını seç. Boy seçenekleri açılır.
4. Seçeneklerden **5 delik**'i seç. Parça sahneye eklenir ve seçili olur.
   ![Parça Ekle sekmesi; Structure seçenekleri açık, 5 delik 4 numarayla işaretli.](img/builder-parca-ekle-bolumden.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=temiz tarayıcı, Sahne boş kartında Boş sahne'ye bas, Parça Ekle > Yapı > Structure | hedef=[data-family-folder="structure"] | isaret=4 | bekle=text="11 boy seçeneği" -->
   <!-- SAY: Yapı bölümünden bir Structure seçip istediğimiz boyuna basıyoruz. -->
5. Bir üst düzeye dönmek için listenin başındaki geri satırına bas ("Yapı listesine dön"). Panelde
   bir bölüm açıkken <kbd>Esc</kbd> de bir üst düzeye döner.

Sonuç: Parça sahnede, görünen alanın ortasına yakın boş bir yere konur. **Özellikler** panelinin
başında "Structure" yazar.

Parça Ekle'deki bölümler şunlardır: **Temel şekiller**, **Yapı**, **Tekerlekler**, **Göbek & Mil**,
**Bağlantı**, **Dişliler**, **Motor ve Servo**, **Elektronik**, **Oyun Elemanları**, **Kayış ve
Kasnaklar**. **Elektronik** ve **Motor ve Servo** içinde alt başlıklar vardır (ör. **Control Hub**,
**Pil**, **Güç anahtarı**, **Motor**, **Servo**).

### Bölümleri markaya göre listele

Arama kutusunun altındaki **Gösterim** seçicisinde iki seçenek vardır. **Parça türü** yukarıdaki
bölümleri gösterir. **Marka**'yı seçersen parçalar markaya göre gruplanır. Bir marka bölümünün
içinde parçalar yine türe göre alt başlıklara ayrılır. Seçimin bu tarayıcıda hatırlanır.

<!-- SAY: Aynı listeyi istersek markaya göre de görebiliyoruz. -->

## Boardoza kartı ekle {#boardoza-karti-ekle}

Katalogda Boardoza markasının 21 elektronik kartı bulunur: kontrol kartı, motor sürücüler, IMU,
sensörler, I2C kartları ve voltaj regülatörleri. Kartların mağazada karşılığı yoktur, satırlarında
stok ve fiyat yazmaz.

1. **Sol panel**de **Parça Ekle** sekmesini seç.
2. **Gösterim** seçicisinde **Marka**'yı seç.
3. **Boardoza** bölümünü seç. Satırında "21 kalem" yazar.
   ![Parça Ekle, Marka görünümü; Boardoza bölümü 3 numarayla işaretli, altında kartların listesi.](img/builder-parca-ekle-boardoza.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Parça Ekle > Gösterim Marka > Boardoza açık | hedef=text="Boardoza" | isaret=3 | bekle=text="21 kalem" -->
   <!-- SAY: Marka görünümünde Boardoza bölümünü açıyoruz ve robotumuza uygun kartı seçiyoruz. -->
4. Listeden bir kart seç, ör. **Boardoza BNO055 IMU**. Kart sahneye eklenir ve seçili olur.

Sonuç: Kart sahnede durur. **Özellikler** panelinin başında kartın adı yazar.

Kartların kenarında her 20 mm'de bir yarım delik vardır. **Snap** açıkken kart bu deliklerle 10 mm
ızgaradaki deliklere oturur. **Gerçeğe dök** penceresinde kartın satırında "Probot'ta yok, dışarıdan
temin edilir" yazar. Kartları **Parça türü** görünümünde **Elektronik** bölümünde de bulursun.

## Parçayı adıyla ara

Parçanın adını biliyorsan bölümleri gezmen gerekmez. **Parça Ekle** sekmesinin başındaki **Parça
ara...** kutusuna adın bir kısmını yaz (ör. `dişli`). Arama parçanın adında, açıklamasında
ve ürün kodunda (ör. PRB-WHL-RBR-100) yapılır. Bölüm adları (ör. Elektronik) aramaya dahil değildir;
bir bölümdeki parçaları görmek için o bölümü aç.

Sonuçlar bölüm başlıkları altında, seçenekleriyle birlikte tek tek listelenir. Her sonuç tek
basışla sahneye eklenir. Hiçbir şey bulunmazsa "Sonuç bulunamadı" yazar. Kutudaki çarpı
("Aramayı temizle") aramayı siler. Liste, aramadan önce bulunduğun yere döner.

<!-- SAY: Aradığımız parçanın adını yazıyoruz ve sonuçtan doğrudan ekliyoruz. -->

## Parçayı sahneye sürükle

Parçayı sürükleyip bırakırsan istediğin yere oturur. Bir parçanın üstüne bırakırsan onun yüzeyine
konur.

1. **Parça Ekle** sekmesinde **Yapı** > **Structure** seçeneklerini aç.
2. **5 delik** satırını farenin sol tuşuyla tut.
3. Satırı **Sahne**ye sürükle.
4. Parçayı koymak istediğin yerde fare tuşunu bırak.
   ![5 delik satırı listeden sahneye sürükleniyor; bırakılacak yer 4 numarayla işaretli.](img/builder-parca-ekle-surukle.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, Parça Ekle > Yapı > Structure açık, 5 delik satırı şasinin üst yüzüne sürükleniyor (bırakmadan) | hedef=koordinat:sasi-ust-yuzu | isaret=4 | bekle=canvas -->
   <!-- SAY: Parçayı listeden tutup robotun üstüne sürüklüyoruz, bıraktığımız yüzeye oturuyor. -->

Sonuç: Parça bıraktığın noktada zemine ya da bir parçanın yüzeyine oturur ve seçili olur.
**Snap** açıksa yüzeye bırakılan parça yakındaki deliklere hizalanır.

## Parçanın seçeneğini değiştir

Bir aileden gelen parçanın boyu ya da ölçüsü sonradan değişir. Parçanın yeri ve açısı aynı kalır.

1. **Sahne**de bir Structure parçasını seç.
2. **Özellikler** panelinde **Boy** listesini aç. Seçici parçanın ailesine göre başka adla da
   çıkar: **Ölçü**, **Devir**, **Yön**, **Renk**, **Delik**, **Tip**, **Çap**, **Diş ölçüsü**.
3. Listede **11 delik**'i seç.
4. Bir sonraki boya geçmek için seçicinin yanındaki **+**'ya bas. **−** bir önceki seçeneğe döner.
   ![Özellikler paneli; Boy seçicisi ve + düğmesi 3 ve 4 numarayla işaretli.](img/builder-parca-ekle-secenek.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Yapı > Structure > 5 delik eklendi ve seçili | hedef=[data-testid="varyant"] | isaret=3,4 | bekle=[data-testid="varyant-secim"] -->
   <!-- SAY: Parçanın boyunu Özellikler panelinden değiştiriyoruz, yeri aynı kalıyor. -->

Sonuç: Sahnedeki parça seçtiğin boya geçer. Her değişiklik tek geri alma adımıdır
(<kbd>Ctrl</kbd>+<kbd>Z</kbd>).

Aynı aileden birden çok parça seçiliyse seçici hepsini birlikte değiştirir. Parçaların boyu
farklıysa listede "Farklı seçenekler" yazar.

## Mil ya da spacer uzunluğunu ayarla

Mil, spacer ve çubuk gibi kesilerek kullanılan parçalarda **Özellikler** panelinde **Uzunluk** alanı
çıkar. Örnek parça **Göbek & Mil** bölümündeki **Altıgen Mil 7mm Kit**'tir.

1. **Parça Ekle** sekmesinde **Göbek & Mil** bölümünü seç, sonra **Altıgen Mil 7mm Kit**'i seç.
2. **Özellikler** panelinde **Uzunluk** alanındaki sayıyı sil. Başlığın yanında şu anki boy yazar
   (ör. "120 mm").
3. Alana `150` yaz ve <kbd>Enter</kbd>'a bas. Yazarken mil sahnede canlı uzar.
4. Boyu 0,5 mm kısaltmak ya da uzatmak için alanın yanındaki **−** ya da **+**'ya bas.
   ![Özellikler paneli; Uzunluk alanı 3, + düğmesi 4 numarayla işaretli.](img/builder-parca-ekle-uzunluk.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Göbek & Mil > Altıgen Mil 7mm Kit eklendi ve seçili | hedef=[data-testid="uzunluk"] | isaret=3,4 | bekle=[data-testid="uzunluk-mm"] -->
   <!-- SAY: Milin boyunu milimetre olarak yazıyoruz ve sahnede canlı olarak değiştiğini görüyoruz. -->

Sonuç: Mil 150 mm olur. Alanın altında izin verilen aralık yazar (ör. "1 mm ile 500 mm arası").

- Alanın altındaki boy düğmeleri (ör. **80 mm**, **120 mm**, **250 mm**) sık kullanılan boyları tek
  basışla verir.
- <kbd>Esc</kbd> yazdığını geri alır. Alandan çıkmak da yazdığını uygular.
- Aralığın dışındaki değer en yakın sınıra çekilir.
- Aynı türden birden çok parça seçiliyse alan hepsine uygulanır. Boylar farklıysa başlıkta
  "farklı boylar" yazar.

## Parça satırında ne yazar

Her parça satırında parçanın resmi, adı ve kısa açıklaması bulunur. Mağazada satılan parçalarda
açıklamanın önünde stok ve fiyat yazar.

| Gördüğün | Anlamı |
|---|---|
| "stokta" | Parça mağazada var. Mağazaya bağlanılamadıysa stok bilinmese de bu yazı görünür. |
| "stok N" | Mağazada N adet kaldı. |
| "stok yok" (kırmızı) | Parça şu an mağazada yok. Tasarıma yine eklenir. |
| Fiyat | Mağazadaki birim fiyat. Yalnız mağazaya bağlanınca görünür. |
| Adın önündeki renkli nokta ("Baskı rengi") | Parçanın mağazada basıldığı renk. |
| Satırın sonundaki ok | Satır bir bölüm ya da aile. Basınca içi açılır. |

Satırın üstünde durunca "...: tıkla ya da sahneye sürükle" ipucu çıkar. Panelin altında "Bir bölüm
seç ya da ara" ya da "Tıkla veya sahneye sürükle" yazar.

Builder açılırken mağazaya bağlanır. Bağlanınca ekranın köşesinde "Mağaza bağlandı - N/M parça
canlı stokla listede" bildirimi çıkar. Bağlanamazsa "Mağaza stoğuna ulaşılamadı - statik katalog
kullanılıyor" yazar. Bu durumda parçaları yine eklersin, ama stok canlı değildir ve fiyat görünmez.

<!-- SAY: Her satırda parçanın stokta olup olmadığını ve fiyatını görüyoruz. -->

## Sorun mu var?

- **Parça eklenmiyor, köşede "Montaj modunda düzenleme kapalı" yazıyor:** Robot **Adım adım kur**
  modunda. Alttaki şeritte **Düzenlemeye geç**'e bas. Bkz. [Sorun giderme](sorunlar.md#montaj-modu).
- **Aradığım parça "Sonuç bulunamadı" diyor:** Adın daha kısa bir parçasını yaz (ör. `mil`). Ürün
  kodunu da yazabilirsin. Bkz. [Sorun giderme](sorunlar.md#sonuc-bulunamadi).
- **"Mağaza stoğuna ulaşılamadı - statik katalog kullanılıyor" yazıyor:** Parçaları eklemeye devam
  et. Canlı stok için sayfayı daha sonra yenile.
  Bkz. [Sorun giderme](sorunlar.md#magaza-stoguna-ulasilamadi).
- **<kbd>Esc</kbd> bölümden çıkmıyor, seçimi bırakıyor:** Önce panelin içine bas, sonra <kbd>Esc</kbd>'e
  bas. Ya da listenin başındaki geri satırını kullan.
- **Parça başka bir parçanın içine girdi:** Parçayı seç ve taşı (bkz. [Parçayı taşı ve döndür](tasi-ve-dondur.md)).

## Sonraki adım

- [Parçayı taşı ve döndür](tasi-ve-dondur.md)
- [Parçaları deliklerinden tak](parcalari-tak.md)
