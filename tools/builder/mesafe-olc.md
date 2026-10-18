# Mesafe ölç

Bu sayfada **Ölç** aracıyla iki nokta arasındaki mesafeyi milimetre olarak ölçeceksin. Delikler
arası, yüzeyler arası ya da zemine olan mesafeyi okuyabilirsin.

![İki delik arasında ölçüm çizgisi ve mm değeri.](img/builder-olc-genel.png)
<!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi, Ölç açık, iki delik arası bir ölçüm | hedef=body | isaret=yok | bekle=text="mm" -->

## Başlamadan önce

- Sahnede Omni şasi açık (bkz. [Hazır robotla başla](hazir-robotla-basla.md)).
- Ölçümler projeye kaydedilmez ve geri alma geçmişine girmez. Araç kapanınca hepsi silinir.

## İki nokta arasını ölç

1. **Araç çubuğu**nda **Ölç**'e bas (<kbd>Ö</kbd> ya da <kbd>I</kbd>). **Sahne**nin köşesinde
   **Ölçüm** paneli açılır ve "Ölçmek için ilk noktaya tıkla" yazar.
2. **Sahne**de şasinin bir deliğine tıkla. Nokta deliğin merkezine oturur. Panelde "İkinci noktaya
   tıkla" ve "İlk nokta delik merkezi" yazar.
3. Başka bir deliğe tıkla.
   ![Ölçüm paneli ve sahnede ölçüm çizgisi; ikinci delik 3 numarayla işaretli.](img/builder-olc-sonuc.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi; Görünüm küpünde ÜST; Ölç açık; şasinin iki deliği arasında bir ölçüm | hedef=koordinat:ikinci-delik;text="Ölçüm" | isaret=3 | bekle=text="ΔX" -->
   <!-- SAY: İki deliğe tıklıyoruz ve aralarındaki mesafeyi milimetre olarak okuyoruz. -->

Sonuç: Panelde mesafe "mm" ile yazar. Altında renkli ΔX, ΔY, ΔZ değerleri ve "delik merkezi ile
delik merkezi" satırı görünür. **Sahne**de iki nokta arasında çizgi ve etiket çıkar.

İmlecin altındaki nokta şu sırayla seçilir: delik merkezi, yüzey, zemin. Gizli parçalara nokta
konmaz. **Ölç** açıkken parça seçilmez ve taşınmaz, sağ tık menüsü de açılmaz.

## Delik merkezine oturmadan ölç

Deliğin kenarını ya da deliğe yakın bir yüzey noktasını ölçmek için <kbd>Shift</kbd> kullan.

1. **Ölçüm** paneli açıkken imleci **Sahne**de bir deliğin kenarına getir.
2. <kbd>Shift</kbd> tuşunu basılı tut.
3. Tıkla.
   ![Ölçüm paneli; İlk nokta yüzey yazısı 3 numarayla işaretli.](img/builder-olc-shift.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi; Ölç açık; Shift basılıyken bir deliğin kenarına tek tık | hedef=text="İlk nokta yüzey" | isaret=3 | bekle=text="İkinci noktaya tıkla" -->
   <!-- SAY: Shift tuşunu basılı tutunca nokta deliğin merkezine kaymıyor, tıkladığımız yerde kalıyor. -->

Sonuç: Nokta tıkladığın yerde kalır. Panelde "İlk nokta yüzey" yazar (boşluğa tıkladıysan "İlk
nokta zemin").

## Birden çok ölçüm yap ve birini sil

Bir ölçüm bitince sonraki iki tık yeni bir ölçüm açar. Panelde en yeni ölçüm en üstte ve vurgulu
durur. Aynı anda en çok 5 ölçüm kalır, altıncı ölçüm en eskisini siler.

1. **Sahne**de iki nokta daha tıkla. Listeye ikinci ölçüm gelir.
2. **Ölçüm** panelinde silmek istediğin ölçümün satırında çarpıya (**Bu ölçümü sil**) bas.
3. En son ölçümü silmek için <kbd>Del</kbd> ya da <kbd>Backspace</kbd>'e bas.
   ![Ölçüm paneli iki ölçümle; Bu ölçümü sil çarpısı 2 numarayla işaretli.](img/builder-olc-liste.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi; Ölç açık; iki ölçüm yapılmış | hedef=title="Bu ölçümü sil" | isaret=2 | bekle=text="Ölçüm" -->
   <!-- SAY: Birkaç ölçümü yan yana tutuyoruz ve işimize yaramayanı tek tek siliyoruz. -->

Sonuç: Seçtiğin ölçüm listeden ve **Sahne**den kalkar, ötekiler kalır.

**Ölç** açıkken <kbd>Del</kbd> parça silmez, yalnız son ölçümü siler.

## Ölçümleri temizle ve aracı kapat

!!! warning "Dikkat"
    <kbd>Esc</kbd> tek ölçümü değil, **bütün** ölçümleri siler. Aracı kapatmak da bütün ölçümleri
    siler. Yalnız birini silmek için **Bu ölçümü sil**'i kullan.

<kbd>Esc</kbd> her basışta sıradaki işi yapar:

1. İlk noktaya tıklamış, ikinciyi beklerken <kbd>Esc</kbd>'e bas. Bekleyen nokta silinir.
2. Yeniden <kbd>Esc</kbd>'e bas. Bütün ölçümler silinir, panel açık kalır.
3. Bir kez daha <kbd>Esc</kbd>'e bas. **Ölçüm** paneli kapanır.
   ![Ölçüm paneli; kapat çarpısı 3 numarayla işaretli.](img/builder-olc-kapat.png)
   <!-- CAPTURE: url=https://probotstudio.com/builder/ | hazirla=hazir:Omni şasi; Ölç açık; ölçüm yok | hedef=title="Ölçümü kapat (Esc)" | isaret=3 | bekle=text="Ölçmek için ilk noktaya tıkla" -->
   <!-- SAY: Esc tuşu önce bekleyen noktayı, sonra bütün ölçümleri siliyor, en sonunda aracı kapatıyor. -->

Sonuç: Panel kapanır, **Araç çubuğu**nda **Ölç** artık seçili değildir.

Aracı şu yollarla da kapatırsın: paneldeki çarpı (**Ölçümü kapat (Esc)**), **Ölç**'e yeniden basmak
(<kbd>Ö</kbd>) ya da **Taşı**, **Döndür**, **Tak** ya da **Hareket**'i seçmek.

## Sorun mu var?

- **Nokta istemediğim deliğin merkezine kayıyor:** Tıklarken <kbd>Shift</kbd>'i basılı tut.
- **Ölç açıkken parçayı seçemiyorum ya da sağ tık menüsü açılmıyor:** Araç açıkken seçim ve bağlam
  menüsü kapalıdır. Önce aracı kapat.
- **<kbd>Del</kbd> parçayı silmedi:** **Ölç** açıkken <kbd>Del</kbd> son ölçümü siler. Aracı kapatıp
  yeniden dene. Bkz. [Sorun giderme](sorunlar.md#del-parca-silmiyor).
- **Ölçümlerim kayboldu:** <kbd>Esc</kbd>'e bastın ya da aracı kapattın. Ölçümler kaydedilmez,
  yeniden ölç. Bkz. [Sorun giderme](sorunlar.md#olcumler-silindi).
- **En eski ölçüm kendiliğinden silindi:** Aynı anda en çok 5 ölçüm durur.
- **Gizli bir parçaya nokta konmuyor:** Gizli parçalar ölçülmez. Parçayı göster (bkz.
  [Parçaları seç, gizle ve sil](parcalari-sec-gizle-sil.md)).

## Sonraki adım

- Ölçtüğün yere parça tak: [Parçaları deliklerinden tak](parcalari-tak.md)
- Kayışın gereken boyunu gör: [İki kasnağa kayış ekle](kayis-ekle.md)
