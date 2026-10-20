# Parçayı taşı ve döndür

Bu sayfada bir parçayı fareyle taşıyacak ve döndüreceksin. Kesin yer ve açı için sayı gireceksin.
Snap'in parçayı nasıl ızgaraya ve deliklere oturttuğunu da göreceksin.

![Seçili parçanın üstünde Taşı okları.](img/builder-tasi-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, bir Structure seçili, Taşı açık | hedef=body | isaret=yok | bekle=canvas -->

## Başlamadan önce

- Sahne boş. **Parça Ekle** > **Yapı** > **Structure** > **5 delik** eklendi ve seçili
  (bkz. [Parça ekle](parca-ekle.md)).
- Birlikte taşıma bölümü için sahnede **Omni şasi** açık (bkz. [Hazır robotla başla](hazir-robotla-basla.md)).
- **Ölç**, **Tak**, **Sketch** ve **Hareket** kapalı. Bunlar açıkken tutamaç görünmez.

## Snap ve ızgara

**Araç çubuğu**ndaki **Snap** parçanın nasıl ilerleyeceğini belirler. Turuncuysa açıktır. Basınca
açılır ya da kapanır. Seçimin bu tarayıcıda hatırlanır.

| Snap açık | Snap kapalı |
|---|---|
| Parça 2,5 mm adımla ilerler. | Parça serbest ilerler. |
| Taşınan parçanın deliği yakındaki bir deliğe gelince ona ortalanır (delik mıknatısı). | Delik mıknatısı çalışmaz. |
| Döndürme, döndürme adımı kadar (varsayılan 45°) kilitlenir. | Döndürme serbesttir. |

Taşırken ya da döndürürken <kbd>Shift</kbd>'i basılı tutarsan Snap o an için kapanır.

Zemindeki ızgaranın ince çizgileri 2,5 mm, kalın çizgileri 10 mm aralıklıdır.
**Sahne**nin altındaki durum şeridinin sağ ucu bu ayarları yazar: "2.5mm · 45° snap · 10 mm ızgara".
Snap kapalıyken "snap kapalı · 10 mm ızgara" yazar.

<!-- SAY: Snap açıkken parça iki buçuk milimetre adımla ilerliyor ve deliklere kendiliğinden oturuyor. -->

## Parçayı tutamaçla taşı

1. **Araç çubuğu**nda **Taşı**'ya bas (<kbd>T</kbd> ya da <kbd>M</kbd>). Seçili parçanın üstünde üç
   renkli ok çıkar.
2. Kırmızı oku sol tuşla tut ve sürükle. Parça o eksen boyunca 2,5 mm adımla ilerler.
3. Fare tuşunu bırak.
4. Parçayı serbest kaydırmak için <kbd>Shift</kbd>'i basılı tutarak yeşil oku sürükle.
   ![Structure üstünde taşıma okları; kırmızı ok 2 numarayla işaretli.](img/builder-tasi-tutamac.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Yapı > Structure > 5 delik eklendi ve seçili, Taşı seçili | hedef=koordinat:tasima-oku-kirmizi | isaret=2 | bekle=canvas -->
   <!-- SAY: Oku tutup sürüklüyoruz, parça o eksende adım adım ilerliyor. -->

Sonuç: Parça yeni yerinde durur. **Özellikler** panelinde **Konum (mm)** değerleri değişir.

- Oklar parçanın kendi eksenlerini gösterir. Döndürülmüş parçada oklar da döner.
- Okların ortasındaki kareler parçayı iki eksende birlikte kaydırır.
- Her bırakış tek geri alma adımıdır (<kbd>Ctrl</kbd>+<kbd>Z</kbd>).

## Parçayı döndür

1. **Araç çubuğu**nda **Döndür**'e bas (<kbd>R</kbd>). Seçili parçanın çevresinde üç renkli halka çıkar.
2. **Araç çubuğu**nda **Snap**'in yanındaki döndürme adımı listesinden **90°**'yi seç. Seçenekler
   5°, 15°, 30°, 45° ve 90°'dir.
3. Yeşil halkayı sol tuşla tut ve sürükle. Parça 90° adımlarla döner.
4. Fare tuşunu bırak.
   ![Structure çevresinde döndürme halkaları; adım listesi 2, yeşil halka 3 numarayla işaretli.](img/builder-tasi-dondur.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Structure 5 delik seçili, Döndür seçili, adım 90° | hedef=[data-testid="donus-adimi"];koordinat:dondurme-halkasi-yesil | isaret=2,3 | bekle=canvas -->
   <!-- SAY: Halkayı tutup çeviriyoruz, parça seçtiğimiz açı adımıyla dönüyor. -->

Sonuç: Parça dikey eksen etrafında döner. Durum şeridinde açı adımı "90°" vurgulu yazar.

Döndürme adımı Snap kapalıyken soluk görünür, ama seçilebilir. Snap açılınca geçerli olur. Seçtiğin
adım bu tarayıcıda hatırlanır.

## Yeri ve açıyı sayıyla gir

Tek parça seçiliyken **Özellikler** panelinde **Konum (mm)** ve **Dönüş (°)** alanları bulunur. Her
birinde X, Y ve Z kutusu vardır. Y yüksekliktir.

1. **Özellikler** panelinde **Konum (mm)** altındaki **X** kutusuna bas.
2. `40` yaz. Yazarken parça sahnede yer değiştirir.
3. <kbd>Enter</kbd>'a bas. Değer uygulanır.
4. **Dönüş (°)** başlığının yanındaki **Y ekseninde +90°** simgesine bas. Parça dikey eksen
   etrafında 90° döner.
   ![Özellikler paneli; Konum X kutusu 1, Y ekseninde +90° simgesi 4 numarayla işaretli.](img/builder-tasi-sayiyla.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, Structure 5 delik seçili, Konum X=40 | hedef=text="Konum (mm)";title="Y ekseninde +90°" | isaret=1,4 | bekle=text="Dönüş (°)" -->
   <!-- SAY: Kesin yer için konumu milimetre olarak yazıyoruz, çeyrek tur için simgeye basıyoruz. -->

Sonuç: Parçanın X konumu 40 mm olur ve parça çeyrek tur döner.

- <kbd>Esc</kbd> yazdığını geri alır ve kutudan çıkar. Kutudan başka yere basmak yazdığını uygular.
- **Dönüş (°)** kutularına derece yazılır.
- **Y ekseninde -90°** ve **Y ekseninde +90°** her zaman 90° döndürür. Snap'e ve döndürme adımına
  bağlı değildir.
- Birden çok parça seçiliyken bu alanlar görünmez. Seçimi tutamaçla taşı.

## Birden çok parçayı birlikte taşı

Birden çok parça seçiliyken tutamaç parçaların ortasında tek bir tane olarak çıkar. Seçim tek bir
katı gibi taşınır ve döner.

1. **Sol panel**de **Parçalar** sekmesine bas.
2. "Omni şasi" satırına bas. Robotun 68 parçasının hepsi seçilir.
3. **Araç çubuğu**nda **Taşı**'ya bas (<kbd>T</kbd>).
4. Okların ortasında duran tutamacın mavi okunu sürükle.
   ![Omni şasinin tamamı seçili; ortadaki taşıma tutamacı 4 numarayla işaretli.](img/builder-tasi-coklu.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, Parçalar sekmesinde Omni şasi satırına basıldı, Taşı seçili | hedef=koordinat:coklu-tutamac-mavi-ok | isaret=4 | bekle=text="68 seçili" -->
   <!-- SAY: Robotun bütün parçalarını seçip tek tutamaçla birlikte kaydırıyoruz. -->

Sonuç: Şasinin bütün parçaları aradaki mesafeyi koruyarak birlikte kayar.

Seçimde gizli bir parça varsa tutamaç çıkmaz. Önce gizli parçaları göster ya da seçimden çıkar
(bkz. [Parçaları seç, gizle ve sil](parcalari-sec-gizle-sil.md)).

## Sorun mu var?

- **Seçili parçada ok ya da halka çıkmıyor:** **Ölç**, **Tak**, **Sketch** ya da **Hareket** açık
  olabilir. **Ölç** ya da **Tak** açıksa **Taşı**'ya bas. **Sketch** açıksa **Sketch**'e basıp çizimi
  bitir. **Hareket** açıksa **Hareket**'e basıp kapat. Parça gizliyse önce göster.
- **Parça ince ayar yapmıyor, hep aynı yere atlıyor:** Snap açık. <kbd>Shift</kbd>'i basılı tutarak
  sürükle ya da **Snap**'i kapat. Bkz. [Sorun giderme](sorunlar.md#snap-acik).
- **Parça istemediğim bir deliğe kayıyor:** Delik mıknatısı çalışıyor. <kbd>Shift</kbd>'i basılı tut.
  Bkz. [Sorun giderme](sorunlar.md#snap-acik).
- **Döndürme adımı listesi soluk:** Snap kapalı. Snap'i aç.
- **Konum kutusuna yazdığım geri döndü:** <kbd>Esc</kbd>'e basmış ya da sayı olmayan bir şey yazmış
  olabilirsin. Sayıyı yeniden yaz ve <kbd>Enter</kbd>'a bas.
- **Köşede "Montaj modunda düzenleme kapalı" yazıyor:** Montaj şeridinde **Düzenlemeye geç**'e bas.
  Bkz. [Sorun giderme](sorunlar.md#montaj-modu).

## Sonraki adım

- [Parçaları deliklerinden tak](parcalari-tak.md)
- [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md)
