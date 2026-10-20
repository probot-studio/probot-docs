# Blocks sunumları

Blocks kullanım dokümanının slayt sunumları. Her klasörde bir `ders.md` ve o sunumun görselleri (`img/`) var.
Her `## başlık` bir slayttır; seslendirme metni slaytın `::: hoca` bloğundaki **Söyle** satırındadır.

## Sunum listesi

| Sunum | Slayt | Tahmini süre | Kaynak sayfalar |
|---|---|---|---|
| [01 Blocks'a başla](01-basla/ders.md) | 15 | ~3,5 dk | `index.md`, `ilk-10-dakika.md`, `arayuz.md` |
| [02 Örnekler ve bloklarla çalışmak](02-probot-ornek-ve-bloklar/ders.md) | 15 | ~3,5 dk | `probot-ornekle-basla.md`, `probot-bloklari-duzenle.md` |
| [03 Sürüş programı ve değişkenler](03-probot-surus-ve-degisken/ders.md) | 15 | ~3,5 dk | `probot-surus-programi-yaz.md`, `probot-degisken-kullan.md` |
| [04 WiFi ayarları ve proje kaydı](04-probot-wifi-ve-kayit/ders.md) | 13 | ~3 dk | `probot-wifi-ayarla.md`, `probot-projeyi-kaydet.md` |
| [05 Kodu al, karta yükle, FTC'ye taşı](05-probot-kod-ve-yukleme/ders.md) | 15 | ~3,5 dk | `probot-kodu-al.md`, `probot-karta-yukle.md`, `probot-ftcye-tasi.md`, `probot-blok-listesi.md` |
| [06 FTC Blocks ile başla](06-ftc-baslangic/ders.md) | 15 | ~3,5 dk | `ftc-ornekle-basla.md`, `ftc-yapilandirmayi-ayarla.md`, `ftc-program-yaz.md` |
| [07 FTC programını kaydet, yükle, Sim'de dene](07-ftc-kayit-yukleme-sim/ders.md) | 13 | ~3 dk | `ftc-program-yaz.md` (düzenleme, değişken, fonksiyon), `ftc-programi-kaydet.md`, `ftc-control-hub-yukle.md`, `ftc-simde-dene.md`, `ftc-blok-listesi.md` |
| [08 FTC programının OnBot Java karşılığı](08-ftc-onbot-java/ders.md) | 6 | ~1,5 dk | `ftc-program-yaz.md` (sınıf adı), `ftc-programi-kaydet.md` (Java bölümleri), `ftc-control-hub-yukle.md` (OnBot Java) |
| [09 Hata bildirimi, kısayollar, sorun giderme](09-ortak/ders.md) | 10 | ~2,5 dk | `hata-bildir.md`, `kisayollar.md`, `sorunlar.md`, `arayuz.md` (Dar ekranda) |
| **Toplam** | **117** | **~26 dk** | Dokümanın 23 sayfasının hepsi |

Süre tahmini Söyle metninin kelime sayısından hesaplandı: dakikada 140 kelime, video hızı 1,1 kat, slayt
başına 1,2 saniye geçiş. Her `ders.md`'deki `sure` ve zaman planı bu tahmine göre yukarı yuvarlanmıştır.

## Biçim kararları

- **Araç tanıtımı, ders değil.** Ders biçimi hoca hazırlığı ve ödev bölümlerini zorunlu tutar. Bu yüzden her
  sunumda kısa bir hazırlık bölümü ve tek bir yazılı ödev var.
- **Bir slayt, bir fikir.** Her slaytta tek başlık, tek ekran görüntüsü ve en çok dört madde var. Söyle metni
  bir ile üç cümledir ve slayttaki maddeleri konuşma diliyle anlatır.
- **Görseller kopya.** Her sunumun `img/` klasöründeki dosyalar, dokümanın `img/` klasöründeki
  (`tools/blocks/img/`) prod ekran görüntülerinin kopyasıdır. Doküman görselleri yeniden çekilirse sunum
  klasörlerine yeniden kopyalanmalıdır.
- **Yalnız prod.** Sunumlar probotstudio.com'daki sürümü anlatır. Dokümandaki "Yakında" kutuları (geliştirme
  sürümündeki değişiklikler) sunumlarda yoktur; o özellikler prod'a gelince ilgili slaytlar güncellenmelidir.
  20 Ekim 2026 sürümüyle o güne kadarki kutuların hepsi prod'a geçti ve slaytlar buna göre güncellendi
  (site başlığındaki **Hata bildir**, soldaki mod sekmeleri, **Çoğalt**, tarayıcı kaydı).
- **Ekran görüntüsü olmayan konular.** Dokümanda Arduino IDE, FTC Driver Station ve Control Hub ekran
  görüntüsü yok. Bu konuların slaytlarında Blocks ekranından ilgili görüntü (araç çubuğu, WiFi bölümü,
  Robot yapılandırması) kullanıldı. Probot Driver Station için Core kılavuzunun, Sim için Sim kılavuzunun
  görselleri kullanıldı.
- **"Java" adı tek sunumda.** Ders denetimi "Java" adını yasak ad sayar. Arayüzde **Java kopyala**,
  **.java indir** ve **OnBot Java** etiketleri olduğu için bu konu 08 numaralı sunumda toplandı. Diğer sekiz
  sunum bu adı yalnız ekrandaki dosya uzantısında kullanır (`IlkSurus.java`, **Dosya aç (.blk, .java)**). 08 numaralı sunumda ad yalnız ekrandaki etiketlerde geçer (**OnBot Java**,
  **Java kopyala**, **.java indir**, listedeki "Blocks to Java" eki). Sunum denetimde bu ad yüzünden bilerek kalır.
- **Söyle metninde arayüz etiketleri.** Ekrandaki etiket slaytta birebir yazılır. Söyle metninde iki nokta,
  ünlem ve işaretli etiketler okunabilir biçimde söylenir (ör. "Motor & Sürüş" yerine "Motor ve Sürüş").

## Video aracıyla kullanım

Videoya dönüştürme aracı ders yolunu `hafta-N/ders-K` biçiminde bekler. Bu klasör yapısı o biçimde değil;
sunumları videoya çevirmeden önce araca yol parametresi eklenmeli ya da sunumlar o biçimde bir klasöre
kopyalanmalıdır. Slayt sığma denetimi (tarayıcıyla) bu sunumlarda çalıştırılmadı.
