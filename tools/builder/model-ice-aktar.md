# 3B model içe aktar

Bu sayfada bilgisayarındaki bir 3B model dosyasını Builder'a parça olarak ekleyeceksin. Sonra
modelin birimini, yönünü ve ölçüsünü düzeltirsin.

![Omni şasinin yanında içe aktarılmış model.](img/builder-model-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, örnek kup.stl içe aktarılmış ve seçili | hedef=body | isaret=yok | bekle=canvas -->

## Başlamadan önce

- Bilgisayarında bir model dosyası var. Kabul edilen uzantılar: `.stl`, `.step`, `.stp`, `.glb`, `.gltf`, `.obj`.
- Dosya en çok 25 MB.
- Modeli bir robotun yanına koymak istersen **Omni şasi**'yi yükle (bkz. [Hazır robotla başla](hazir-robotla-basla.md)).

Builder dosyayı tarayıcıda okur. 50.000 üçgenden büyük model bu sayıya sadeleştirilir. STEP dosyası
en çok 120 saniye okunur. Modeldeki yuvarlak delikler kendiliğinden bulunur, **Ölç** ve **Tak**
bu deliklere oturur.

## Dosyayı seçerek içe aktar

1. **Menü çubuğu**nda **Dosya** > **İçe aktar (STL, STEP, GLB, OBJ)...**'yı seç.
   ![Dosya menüsü açık; İçe aktar (STL, STEP, GLB, OBJ)... 1 numarayla işaretli.](img/builder-model-dosya-menusu.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, Dosya menüsü açık | hedef=text="İçe aktar (STL, STEP, GLB, OBJ)..." | isaret=1 | bekle=text="Kaydet (JSON indir)" -->
   <!-- SAY: Dosya menüsünden içe aktarı seçip bilgisayarımızdaki model dosyasını açıyoruz. -->
2. Açılan dosya penceresinde model dosyasını seç. Birden çok dosya da seçebilirsin.
3. Pencerede **Aç**'a bas.
4. "<dosya adı> okunuyor" bildirimini bekle. STEP dosyasında "STEP biraz sürebilir" yazar.

Sonuç: Model görünümün ortasına en yakın boş yerde, zeminin üstünde durur ve seçili olur. Bildirimde "<ad> eklendi"
yazar. Model sadeleştiyse "N üçgen sadeleştirildi", delik bulunduysa "N delik bulundu" eklenir.

Aynı dosya penceresini **Sol panel**deki **Parça Ekle** sekmesi de açar: **Temel şekiller**
bölümünün sonundaki **İçe aktar** satırını seç. Marka görünümünde **Genel** bölümünün sonundadır.

## Dosyayı sahneye bırak

1. Bilgisayarının dosya gezginini aç ve model dosyasının klasörüne git.
2. Dosyayı Builder'ın **Sahne**sine sürükle.
3. Modelin durmasını istediğin zemin noktasında bırak.
   ![Sahnede içe aktarılan model; köşede "eklendi" bildirimi.](img/builder-model-eklendi.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, örnek kup.stl (40 mm küp, Z yukarı) şasinin yanına bırakılmış | hedef=koordinat:sahne-ortasi | isaret=yok | bekle=text="kup eklendi" -->
   <!-- SAY: Model dosyasını sürükleyip sahnede istediğimiz yere bırakıyoruz. -->

Sonuç: Model bıraktığın noktada zemine oturur. Zemine denk gelmeyen bir yere bırakırsan görünümün
ortasına en yakın boş yere konur. Birden çok dosya bırakırsan ilki o noktaya, diğerleri görünüm
ortasının yakınındaki boş yerlere gelir.

## Birimi, yönü ve ölçüyü düzelt

Model çok küçük, çok büyük ya da yan yatmış görünebilir. Dosya birimini ve yukarı eksenini
**Özellikler**'den değiştirirsin.

1. **Sahne**de içe aktarılan modeli seç. **Özellikler** panelinin başında "İçe aktarılan parça" yazar.
2. **Dosyanın birimi** satırında dosyanın çizildiği birimi seç: **mm**, **cm**, **m** ya da **inç**.
3. Model yan yatmışsa **Yukarı eksen** satırında **Z yukarı** ya da **Y yukarı**'yı seç. CAD dosyaları
   çoğunlukla Z yukarı, GLB ve oyun modelleri Y yukarıdır.
4. Belli bir boy istersen **Ölçüler (mm)** altında **En**, **Boy** ya da **Yükseklik**'e değeri yaz ve <kbd>Enter</kbd>'a bas.
   ![Özellikler paneli; Dosyanın birimi, Yukarı eksen ve Ölçüler 2-4 numaralarla işaretli.](img/builder-model-ozellikler.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=boş sahne, örnek kup.stl içe aktarılmış ve seçili | hedef=[data-testid="ozel-birim-mm"];[data-testid="ozel-yukari-z"];[data-testid="ozel-olcu-en"] | isaret=2-4 | bekle=[data-testid="ozel-dosya"] -->
   <!-- SAY: Modelin birimini ve yukarı eksenini seçiyoruz, gerekirse ölçüsünü yazıyoruz. -->
5. Gerekirse **Ad** alanına parçanın adını yaz (en çok 80 karakter) ve <kbd>Enter</kbd>'a bas.

Sonuç: Model doğru boyda ve dik durur. Panelin altında dosya adı, üçgen sayısı ve delik sayısı yazar.

Ölçülerden birini değiştirince diğer ikisi de aynı oranda değişir ("Oranlar korunur"). Birimi
değiştirmek yazdığın ölçüyü sıfırlar. Builder açılışta bir birim tahmin eder: STL, OBJ ve STEP için
mm, GLB için çoğunlukla m.

## Eksik modeli yeniden seç

Bazı durumlarda parçanın yeri ve boyu kalır ama model verisi kaybolur. Parça kutu olarak görünür.

1. **Sahne**de kutu gibi görünen içe aktarılan parçayı seç. **Özellikler** panelinde "Modelin verisi
   bu kayıtta yok, kutu olarak gösteriliyor" uyarısı çıkar.
2. Uyarının altındaki **Dosyayı yeniden seç**'e bas.
   ![Özellikler paneli; eksik model uyarısı ve Dosyayı yeniden seç 2 numarayla işaretli.](img/builder-model-eksik.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=Dosya > Yükle... ile modeli silinmiş proje (içe aktarılan parçalı bir JSON'dan assets alanı çıkarılmış) açılmış, o parça seçili | hedef=[data-testid="ozel-model-sec"] | isaret=2 | bekle=[data-testid="ozel-model-eksik"] -->
   <!-- SAY: Verisi kaybolan modeli aynı dosyayı yeniden seçerek geri getiriyoruz. -->
3. Dosya penceresinde aynı model dosyasını seç ve **Aç**'a bas.

Sonuç: Bildirimde "<ad> modeli yenilendi" yazar. Bu modeli kullanan bütün parçalar gerçek şekliyle görünür.

## İçe aktarılan parçanın sınırları

- **Otomatik kayıt:** Tarayıcıdaki otomatik kayıt en çok yaklaşık 3.000.000 karakter tutar (parçalar ve
  modeller birlikte). Sığmazsa en büyük modeller otomatik kayda girmez. Tarayıcının depolama alanı dolarsa
  hiçbir model girmez. İki durumda da "Otomatik kayıt içe aktarılan modelleri sığdıramadı.
  Projeyi Dosya menüsünden Kaydet ile indir" yazar. **Dosya** > **Kaydet (JSON indir)** modelleri
  dosyanın içine koyar. Bkz. [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md).
- **Hesaba kayıt:** Robot, modelleriyle birlikte en çok 5 MB olabilir.
- **Topluluk:** İçinde içe aktarılan parça olan robot **Robotunu paylaş** ile topluluğa gönderilemez.
  Önce bu parçaları sil. Paylaşım linki ise modelleri taşır. Bkz. [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md).
- **Birleştir:** İçe aktarılan model temel şekillerle birleştirilemez, **Delik** yapılamaz.
- **Parça listesi:** Model **Gerçeğe dök** penceresinde **Özel parçalar** bölümünde dosya adıyla görünür.

<!-- SAY: Büyük modeller için projeyi dosyaya kaydetmek en güvenli yol oluyor. -->

## Sorun mu var?

Hata bildirimleri ekranın köşesinde çıkar.

| Bildirim | Ne yapmalı |
|---|---|
| "Bu dosya türü desteklenmiyor. STL, STEP, GLB ya da OBJ seç" | Dosyayı bu biçimlerden birinde dışa aktar. Bkz. [Sorun giderme](sorunlar.md#dosya-turu-desteklenmiyor). |
| "Dosya çok büyük. En fazla 25 MB" | Modeli sadeleştir ya da parçalara bölüp ayrı aktar. Bkz. [Sorun giderme](sorunlar.md#dosya-cok-buyuk). |
| "Dosya boş" | Dosya 0 bayt. Modeli yeniden dışa aktar. Bkz. [Sorun giderme](sorunlar.md#dosya-cok-buyuk). |
| "Dosya okunamadı. Bozuk ya da eksik olabilir" | Dosyayı yeniden dışa aktar. GLB'yi tek dosya olarak kaydet. Bkz. [Sorun giderme](sorunlar.md#dosya-okunamadi). |
| "Dosyada katı bir model yok" | Dosyada yüzey yok, yalnız çizgi ya da nokta var. Katı modeli dışa aktar. Bkz. [Sorun giderme](sorunlar.md#kati-model-yok). |
| "Model düz görünüyor, kalınlığı yok" | Model tek bir yüzey. Kalınlığı olan bir katı aktar. Bkz. [Sorun giderme](sorunlar.md#kati-model-yok). |
| "Dosyada geçersiz sayılar var" | Dosya bozuk. CAD programından yeniden dışa aktar. Bkz. [Sorun giderme](sorunlar.md#kati-model-yok). |
| "Draco sıkıştırmalı GLB açılamıyor. Sıkıştırmadan dışa aktar" | GLB'yi Draco sıkıştırması kapalı dışa aktar. Bkz. [Sorun giderme](sorunlar.md#draco-glb). |
| "Bu GLTF ayrı dosyalara bağlı. Tek parça GLB olarak dışa aktar" | `.gltf` yanındaki `.bin` dosyasını okuyamaz. Tek dosya `.glb` seç. Bkz. [Sorun giderme](sorunlar.md#gltf-ayri-dosyalar). |
| "Model sadeleştirilemedi" | Modeli CAD programında sadeleştirip yeniden aktar. Bkz. [Sorun giderme](sorunlar.md#model-sadelestirilemedi). |
| "STEP okuyucu yüklenemedi. Bağlantını kontrol et" | İnternet bağlantını kontrol et, yeniden dene. Bkz. [Sorun giderme](sorunlar.md#step-okuyucu). |
| "STEP okuyucu açılamadı" | Sayfayı yenile ve yeniden dene. Bkz. [Sorun giderme](sorunlar.md#step-okuyucu). |
| "STEP dosyası çok uzun sürdü. Daha sade bir model dene" | 120 saniye doldu. Daha az parçalı bir STEP ya da STL dene. Bkz. [Sorun giderme](sorunlar.md#step-cok-uzun-surdu). |
| "STEP dosyası okunamadı. Bozuk ya da eksik olabilir" | STEP'i yeniden dışa aktar ya da STL kullan. Bkz. [Sorun giderme](sorunlar.md#step-okunamadi). |
| "Montaj modunda düzenleme kapalı. Değiştirmek için Düzenlemeye geç" | Montaj şeridinde **Düzenlemeye geç**'e bas. Bkz. [Sorun giderme](sorunlar.md#montaj-modu). |
| "N içe aktarılan parçanın modeli dosyada yok. Dosyayı yeniden seç" | Proje dosyasında model yok. [Eksik modeli yeniden seç](#eksik-modeli-yeniden-sec). Bkz. [Sorun giderme](sorunlar.md#model-dosyada-yok). |
| "N içe aktarılan parçanın modeli otomatik kayıtta yok. Dosyayı yeniden seç" | Model otomatik kayda sığmadı. Aynı yolla yeniden seç. Bkz. [Sorun giderme](sorunlar.md#model-otomatik-kayitta-yok). |
| "İçe aktarılan parçalar katalogda paylaşılamaz. Önce onları kaldır" | Topluluğa göndermeden önce içe aktarılan parçaları sil. Bkz. [Sorun giderme](sorunlar.md#katalogda-paylasilamaz). |

- **Model çok küçük ya da dev görünüyor:** **Dosyanın birimi**'ni değiştir.
- **Model yan yatmış:** **Yukarı eksen**'i değiştir.

## Sonraki adım

- [Parçaları deliklerinden tak](parcalari-tak.md)
- [Temel şekillerle parça yap](temel-sekillerle-parca-yap.md)
- [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md)
