# Sim sunumları

Sim kullanım dokümanından üretilmiş yedi sunum. Her sunum eğitim deposundaki sayfa sayfa ders biçimindedir:
tek `ders.md`, her `## başlık` bir slayt, seslendirilen metin `::: hoca` bloğundaki `**Söyle:** "..."`
satırı. Bunlar ders değil, araç tanıtımıdır; ödev yoktur (`muaf: "odev"`), hoca hazırlığı biçim kapısının
istediği üç başlığın en kısa hâlidir.

## Liste

| Sunum | Menü grubu | Slayt | Söyle kelime | Tahmini video | Kaynak sayfalar |
|---|---|---|---|---|---|
| [01-basla-ilk-adimlar](01-basla-ilk-adimlar/ders.md) | Başla | 14 | 419 | ~3,3 dk | `index.md`, `ilk-10-dakika.md` |
| [02-basla-arayuz](02-basla-arayuz/ders.md) | Başla | 15 | 471 | ~3,7 dk | `arayuz.md` |
| [03-basla-kisayol-sorun](03-basla-kisayol-sorun/ders.md) | Başla | 14 | 459 | ~3,6 dk | `kisayollar.md`, `sorunlar.md` |
| [04-gorevler-robot-program](04-gorevler-robot-program/ders.md) | Görevler | 16 | 562 | ~4,3 dk | `robotu-sec.md`, `programi-sec.md`, `cihazlari-porta-bagla.md` |
| [05-gorevler-saha-otonom](05-gorevler-saha-otonom/ders.md) | Görevler | 13 | 430 | ~3,3 dk | `sahayi-ayarla.md`, `otonomu-calistir.md` |
| [06-gorevler-teleop-gorunum](06-gorevler-teleop-gorunum/ders.md) | Görevler | 11 | 354 | ~2,7 dk | `teleopu-sur.md`, `gorunumu-degistir.md` |
| [07-gorevler-motor-panel](07-gorevler-motor-panel/ders.md) | Görevler | 11 | 351 | ~2,7 dk | `motorlari-ayarla.md`, `panelleri-duzenle.md` |
| **Toplam** | | **94** | **3046** | **~24 dk** | |

Tahmini süre: Söyle metni dakikada 140 kelime (eğitim deposundaki ders videosu kalibrasyonu) ve slayt başına 1,2 saniye boşluk
(videonun sayfa öncesi ve sonrası). Canlı anlatımda her slaytın `sure=0.5` değeri kullanılır, sunum başına 6-8 dakika.

## Biçim kararları

- Slayt başına bir başlık, bir ekran görüntüsü, en çok 4 kısa madde. Söyle 1-3 cümle, 20-50 kelime.
- İlk slayt (`kapak`) sunumda ne göreceğimizi, son slayt özet ve sıradaki sunumu söyler.
- Görsel yerleşimi: tam ekran görüntüleri `gorsel-sol`, ince şerit görüntüleri (1440×300) `gorsel-alt`,
  dar kırpımlar varsayılan sağ sütun.
- Görseller kopyalanmaz. Her sunumun `img/` klasöründeki dosyalar `../../../img/` altındaki doküman
  görsellerine göreli bağlantıdır (symlink). Doküman görseli aynı adla yenilenince sunum da yenilenir.
  Derleyici bağlantıyı izleyip gerçek dosyayı kopyalar.
- Biçim kapısı mecanum sözcüğünü küçük harfle yasak sayar. Bu yüzden ekrandaki "WattOS mecanum şasi"
  adı sunumda geçmez; "WattOS şasisi" denir, örnekler Starter Bot ve
  Omni şasi üstünden verilir. Biçim kapısı "Java" adını da yasak sayar; Java OpMode'ları sunumda
  "Android Studio'da yazılan OpMode'lar" diye anılır, `.java` uzantısı küçük harfle geçer. Çerez bandındaki ikinci düğmenin adı da yasak sözcük içerdiği için anılmaz.
- Klavye tuşları `<kbd>` ile, kumanda düğmeleri kalın yazılır.

## Denetim

```bash
python3 ders-kontrol.py tools/sim/presentation/0*/
```

`ders-kontrol.py` eğitim deposundaki sayfa sayfa ders biçim kapısıdır.

Yedi sunum da 0 hata, 0 uyarıyla geçer. Envanter (`envanter.yml`) ve sığma ölçümü (`sigma-kontrol.mjs`)
ders hattına ait kapılardır, bu sunumlarda koşulmadı.

## Video

`ders-video.mjs` ders dizinini `hafta-N/ders-K` yolundan tanır. Bu sunumları videoya dökmek için ya
dizin o düzende bir çalışma kopyasına alınır ya da betiğe yol seçeneği eklenir.
