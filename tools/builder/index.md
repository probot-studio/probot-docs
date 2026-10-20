# Builder

Builder, robotunu tarayıcıda 3B olarak tasarladığın araçtır. Parçaları katalogdan seçer,
deliklerinden birbirine takar, eklemleri oynatır ve parça listesini mağaza sepetine aktarırsın.
Kurulum gerekmez: `https://probotstudio.com/builder/` adresini açman yeter.

Bu doküman Builder'ın her düğmesini ve her tuşunu anlatır. Sayfalar bir işi baştan sona, adım adım
yaptırır. Hazır bir robotla başlayıp kendi tasarımına geçebilirsin.

## Kimin için

- Robotunu parçaları almadan önce bilgisayarda tasarlamak isteyen öğrenciler ve takımlar.
- Hazır bir robotun montajını derste adım adım göstermek isteyen öğretmenler.
- Tasarımın parça listesini çıkarıp sipariş vermek isteyen takım kaptanları ve koçlar.

<!-- SAY: Builder robotunu almadan önce tasarlamak isteyen herkes için. -->

## Başlamadan önce

- Tarayıcı, en dar ekran, fare ve hesap: [Ne gerekir](../index.md#ne-gerekir).
- **Telefonda ve tablette çalışmaz.** Tarayıcı penceresi 900 px ya da daha darsa (dokunmatik
  cihazda 1100 px'den darsa) Builder yerine "Builder bilgisayarda çalışır" ekranı çıkar.
  Bilgisayardaysan pencereyi genişlet ya da tarayıcı yakınlaştırmasını azalt, Builder geri gelir.
- Bu ekranda **Linki bilgisayarıma gönder** düğmesi ve **Ana sayfaya dön** bağlantısı vardır.
  Tarayıcın paylaşmayı desteklemiyorsa **Linki kopyala** düğmesi de çıkar.
- Kamerayı döndürmek ve kaydırmak için farenin sağ ve orta tuşu kullanılır.
- Hesap yalnız **Hesabıma kaydet**, **Robotlarım**, **Paylaşım linki** ve **Robotunu paylaş** için
  gerekir.
- Arayüz Türkçedir. Bazı terimler İngilizce kalır: **Snap**, **Sketch**, **Extrude**, **Rim**.

!!! warning "Dikkat"
    Çalışman bu tarayıcıda kendiliğinden saklanır. Tarayıcı verisini silersen ya da başka bir
    bilgisayara geçersen kaybolur. Kalıcı kopya için **Dosya** > **Kaydet (JSON indir)**'i seç ya da
    hesabına kaydet.

## İçindekiler

**Başla**

- [İlk 10 dakika](ilk-10-dakika.md): Hazır robotu aç, parça ekle, tak, kaydet.
- [Arayüz turu](arayuz.md): Her bölge, her düğme.
- [Kısayollar](kisayollar.md): Tüm tuşlar ve fare hareketleri.
- [Sorun giderme](sorunlar.md): Ekrandaki uyarılar ve çözümleri.

**Robotu kur**

- [Hazır robotla başla](hazir-robotla-basla.md)
- [Robotu adım adım kur](adim-adim-kur.md)
- [Sahnede gezin](sahnede-gezin.md)
- [Parça ekle](parca-ekle.md)
- [Parçaları seç, gizle ve sil](parcalari-sec-gizle-sil.md)
- [Parçayı taşı ve döndür](tasi-ve-dondur.md)
- [Parçaları deliklerinden tak](parcalari-tak.md)
- [Parçaları çoğalt, aynala ve diz](cogalt-aynala-dizi.md)
- [Parçaları grupla ve birbirine bağla](grupla-ve-bagla.md)
- [Mesafe ölç](mesafe-olc.md)

**Robotu hareket ettir**

- [Eklem kur ve hareketi dene](eklem-kur-ve-oynat.md)
- [İki kasnağa kayış ekle](kayis-ekle.md)
- [Motor ve servoya ad ve port ver](motor-ve-servo-ayarla.md)

**Kendi parçanı yap**

- [Temel şekillerle parça yap](temel-sekillerle-parca-yap.md)
- [3B model içe aktar](model-ice-aktar.md)
- [Sketch çiz ve Extrude ile katı yap](sketch-ve-extrude.md)

**Kaydet, paylaş, üret**

- [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md)
- [Hesabına kaydet ve paylaş](hesaba-kaydet-ve-paylas.md)
- [Robotu derle](robotu-derle.md)
- [Gerçeğe dök: parça listesini sepete aktar](gercege-dok.md)
- [Robotu Sim'de dene](simde-dene.md)
- [Panelleri düzenle](panelleri-duzenle.md)

## Neyi yapar, neyi yapmaz

| Builder yapar | Builder yapmaz |
|---|---|
| Parçaları katalogdan sahneye ekler, deliklerinden birbirine takar. | Robotu sahada sürmez. Sürmek için: [Robotu Sim'de dene](simde-dene.md). |
| Hazır robotların montajını adım adım gösterir. | Kendi robotun için montaj adımı üretmez: [Robotu adım adım kur](adim-adim-kur.md). |
| Parça listesini fiyatıyla gösterir ve mağaza sepetine aktarır. | Parça listesini CSV ya da PDF olarak indirmez. Liste ve fiyat: [Gerçeğe dök](gercege-dok.md). |
| Projeyi `.json` dosyasına ve hesabına kaydeder. | Modeli STL, GLB ya da STEP olarak dışa aktarmaz. Tek dışa aktarma proje dosyasıdır: [Dosyaya kaydet ve aç](dosyaya-kaydet-ve-ac.md). |
| STL, STEP, GLB ve OBJ modelini içe aktarır. | Ekran görüntüsü almaz. Tarayıcının ya da işletim sisteminin ekran görüntüsü aracını kullan. |
| Bağlantıları ve çarpışmaları denetler. | Mağaza parçalarının çoğunda iç içe girmeyi çarpışma saymaz: [Hazır robotu derle](robotu-derle.md#hazir-robotu-derle). |

<!-- SAY: Builder tasarlar ve sipariş listesini çıkarır, robotu sürmek Sim'in işi. -->

## Sözlük

| Terim | Anlamı |
|---|---|
| Sahne | Robotun durduğu 3B alan. Ortadaki büyük bölge. |
| Parça | Sahnedeki her nesne: katalog parçası, temel şekil, içe aktarılan model. |
| Hazır robot | **Robot Kataloğu**'ndan tek tıkla gelen, montajı bitmiş robot. |
| Aile | Aynı parçanın boy ya da ölçü seçenekleri (ör. Structure, **Boy** 8 delik). |
| Snap | Taşırken 2,5 mm adıma ve deliklere oturtma. Araç çubuğundan açılıp kapanır. |
| Tak | Bir parçanın deliğini başka bir parçanın deliğine eksen eksene oturtan araç. |
| Bağ | Bir parçanın başka bir parçaya bağlı olması. Bağlı parça onunla birlikte taşınır. |
| Grup | **Sabitle** ile tek parça gibi davranan parça topluluğu. |
| Eklem | İki parça arasında dönme hareketi. **Sürekli dönüş** ya da **Sınırlı dönüş**. |
| Montaj modu | Hazır robotu adım adım kurarak gösteren mod. Bu modda düzenleme kapalıdır. |
| Sketch | Bir düzlem üstüne çizilen 2B çizim. Parça değildir, parça listesine girmez. |
| Extrude | Sketch'teki kapalı şekle kalınlık verip katı parça yapan işlem. |
| Gerçeğe dök | Tasarımdaki parçaları mağaza sepetine aktaran pencere. |
| Derleme | Robotun bağlantılarını ve çarpışmalarını kontrol eden panel. |
