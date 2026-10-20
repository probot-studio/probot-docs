# Builder sunumları

Builder kullanım dokümanından türetilmiş anlatımlı sunumlar. Her klasör bir sunumdur: `ders.md`
(sayfa sayfa ders biçimi) ve yanında `img/`. Her `## başlık` bir slayttır, slaytın anlatımı
`::: hoca` bloğundaki `**Söyle:** "..."` satırındadır. Video bu anlatımdan seslendirilir.

## Sunumlar

Süreler tahminidir. Video süresi = Söyle kelimeleri / dakikada 140 kelime + slayt başına 1,5 sn geçiş.
Canlı süre ön bilgideki `sure` alanıdır (kapak dışında slayt başına 1 dk).

| No | Klasör | Menü grubu | Slayt | Söyle kelime | Video (dk) | Canlı (dk) | Kaynak sayfalar |
|---|---|---|---|---|---|---|---|
| 1 | `01-ilk-10-dakika` | Başla | 9 | 258 | 2,1 | 9 | ilk-10-dakika |
| 2 | `02-arayuz-ve-kisayollar` | Başla | 13 | 414 | 3,3 | 12 | arayuz, kisayollar, sorunlar (durum göstergeleri, Hata bildir) |
| 3 | `03-hazir-robot-ve-gezinme` | Robotu kur 1 | 15 | 423 | 3,4 | 14 | hazir-robotla-basla, adim-adim-kur, sahnede-gezin |
| 4 | `04-parca-ekle-ve-sec` | Robotu kur 2 | 13 | 391 | 3,1 | 12 | parca-ekle, parcalari-sec-gizle-sil |
| 5 | `05-tasi-dondur-tak` | Robotu kur 3 | 13 | 393 | 3,1 | 12 | tasi-ve-dondur, parcalari-tak |
| 6 | `06-cogalt-grupla-olc` | Robotu kur 4 | 15 | 429 | 3,4 | 14 | cogalt-aynala-dizi, grupla-ve-bagla, mesafe-olc |
| 7 | `07-robotu-hareket-ettir` | Robotu hareket ettir | 14 | 417 | 3,3 | 14 | eklem-kur-ve-oynat, kayis-ekle, motor-ve-servo-ayarla |
| 8 | `08-kendi-parcani-yap` | Kendi parçanı yap | 15 | 436 | 3,5 | 14 | temel-sekillerle-parca-yap, model-ice-aktar, sketch-ve-extrude |
| 9 | `09-kaydet-ve-paylas` | Kaydet, paylaş, üret 1 | 14 | 392 | 3,1 | 14 | dosyaya-kaydet-ve-ac, hesaba-kaydet-ve-paylas, panelleri-duzenle |
| 10 | `10-derle-uret-sim` | Kaydet, paylaş, üret 2 | 14 | 370 | 3,0 | 13 | robotu-derle, gercege-dok, simde-dene |
| | | **Toplam** | **135** | **3923** | **~31** | **128** | 26 sayfa |

Her sunum bir kapakla başlar, kapakta neyi öğreneceğimiz söylenir. Son slayt özettir ve sonraki
sunumun konusunu söyler.

## Biçim kararları

- **Hoca hazırlığı ve ödev.** Ders denetimi her derste `Bu derste`, `Dersten önce hazırla`,
  `Zaman planı` başlıklarını ve en az bir ödevi zorunlu tutar. Bunlar en kısa hâlleriyle eklendi:
  hazırlık birkaç madde, ödev o sunumun işini Builder'da tekrar ettiren tek bir `tur=builder` ödevi.
  Öğrenci ekranı ve uzun hazırlık bölümleri yok.
- **Görseller.** Slaytlar dokümanın ekran görüntülerini kullanır. `img/` içindeki dosyalar
  `../../../img/` altındaki görsellere göreli sembolik bağdır, görsel kopyalanmadı. Doküman görseli
  yenilenince sunum da yenisini gösterir. Sunumu başka yere taşırken bağları izleyerek kopyalayın
  (`cp -rL`).
- **Video aracı.** Video aracı ders adresini `hafta-N/ders-N` yolundan çıkarır. Bu klasörler o
  düzende değil, video çekmeden önce sunum `hafta-N/ders-N` biçiminde bir yola `cp -rL` ile
  kopyalanır. Builder bir WebGL sahnesi olduğu için slaytlarda canlı Builder kutusu yok, ekran
  görüntüsü var.
- **Anlatım.** Söyle satırları 1-3 cümle, "-iyoruz" kipinde, emir kipi, iki nokta, noktalı virgül ve
  uzun tire olmadan yazıldı. Her satır 20-40 kelime arası. Sayıların okunuşu slaytta değil Söyle'de.
- **Adlar.** Düğme ve menü adları arayüzdeki gibidir. Kit adlarında denetimin yasak saydığı tekerlek
  türü adı geçmez, o tür tekerlekler "sağ ve sol modeli olan teker" diye anlatılır. Ekrandaki
  ünlemli bildirimler (derleme başarılı açıklaması, Hata bildir teşekkürü) alıntılanmadı.

## Denetim

Her sunum ders denetiminden hatasız ve uyarısız geçer:

```
python3 ders-kontrol.py tools/builder/presentation/*/
```

`ders-kontrol.py` eğitim deposundaki sayfa sayfa ders biçim kapısıdır.

## Bilinen eksikler

- `hesaba-kaydet-ve-paylas` sayfasının sonuç görseli henüz çekilmedi. Paylaşım linki slaytı Hesabıma
  kaydet penceresinin görselini kullanır, Robotlarım penceresi yalnız hoca notunda geçer.
- Sunum 2'de Hata bildir durum şeridi görseliyle anlatılır. Üst şeritteki düğmenin görseli dokümanda
  var (`builder-hata-bildir-baslik.png`), slayta eklenmedi.
