# Blocks

Blocks, robot programını blokları dizerek yazdığın araçtır. Bloklardan hazır kod üretir: Probot kiti
için Arduino kodu (`.ino`), FTC robotu için `.blk` dosyası ve OnBot Java. Araç tarayıcıda çalışır,
hesap ya da kurulum istemez.

Adres: [probotstudio.com/blocks](https://probotstudio.com/blocks/)

!!! warning "Dikkat"
    Blocks'ta hesap ve bulut kaydı yoktur; çalışman yalnız bu tarayıcıda saklanır. Kalıcı kopya için
    **Blokları indir** (Probot) ya da **.blk indir** (FTC) ile dosyaya kaydet.

## Kimin için

- Probot kitini programlamak isteyenler. Blocks kartın Arduino kodunu üretir.
- Control Hub için Blocks ya da OnBot Java programı hazırlayan FTC takımları.
- FTC programını robota yüklemeden Sim'de denemek isteyenler.
- Blokların hangi kodu ürettiğini yan yana görmek isteyenler.

<!-- SAY: Blocks hem Probot kiti hem FTC robotu için program yazmak isteyenlere yönelik. -->

## Neyi yapar, neyi yapmaz

| Blocks yapar | Blocks yapmaz |
|---|---|
| Probot bloklarından Arduino kodu (`.ino`) üretir, **Kod Önizleme**'de gösterir. | Kodu derlemez, karta göndermez. Derleme ve yükleme Arduino IDE'de yapılır: [Kodu Probot kartına yükle](probot-karta-yukle.md). |
| FTC bloklarından `.blk` dosyası ve OnBot Java (`.java`) üretir. | Programı Control Hub'a kendisi göndermez: [Programı Control Hub'a yükle](ftc-control-hub-yukle.md). |
| FTC programını aynı tarayıcıda açık Sim'e verir. | Programı kendisi çalıştırmaz. Probot Blocks programı Sim'de de çalışmaz. FTC programını sanal sahada denemek için: [Programı Sim'de dene](ftc-simde-dene.md). |
| Probot projesini `.probot.json`, FTC programını `.blk` dosyası olarak indirir. | Hesaba ya da buluta kaydetmez. Tarayıcıdaki Probot kaydı yaklaşık 4 KB ile sınırlı, aşan proje uyarı vermeden kaydedilmez: [Yenileyince başka proje geldi](sorunlar.md#yenileyince-proje-degisti). |
| FTC programındaki cihaz adlarını **Robot yapılandırması**'nda tanımlar. | Robot tasarlamaz. Robotu Builder'da kurarsın: [probotstudio.com/builder](https://probotstudio.com/builder/). |

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek.
    Tarayıcıdaki Probot kaydının 4 KB sınırı kalkar; büyük proje de otomatik kaydedilir. Hesap ve bulut kaydı
    yine yoktur: [Otomatik kayıt nasıl çalışır](probot-projeyi-kaydet.md#otomatik-kayit).

<!-- SAY: Blocks kod üretiyor, derleme ve yükleme başka araçlarda yapılıyor. -->

## İki mod

Araç çubuğundaki iki sekmeden biriyle çalışırsın.

| Sekme | Ne için | Ne üretir |
|---|---|---|
| **Probot Blocks** | Probot kiti (ESP32 kart) | `.ino` kodu, `.probot.json` proje dosyası |
| **FTC Blocks** | FTC robotu (REV Control Hub) | `.blk` dosyası, OnBot Java (`.java`) |

Araç ilk açılışta **FTC Blocks** sekmesinde açılır. Seçtiğin sekme sonraki ziyarette hatırlanır.

<!-- SAY: Blocks'ta Probot kiti ve FTC robotu için iki ayrı mod var. -->

## Başla

Robotuna göre başlangıç sayfasını seç.

| Robotun | Buradan başla |
|---|---|
| Probot kiti | [İlk 10 dakika](ilk-10-dakika.md): hazır örnekle ilk Probot kodunu al. Sonra [Robot WiFi ayarlarını yap](probot-wifi-ayarla.md), [Kodu kopyala ya da indir](probot-kodu-al.md), [Kodu Probot kartına yükle](probot-karta-yukle.md). |
| FTC robotu | [FTC örneğiyle başla](ftc-ornekle-basla.md): hazır FTC programını aç. Sonra [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md), [Yeni FTC programı yaz](ftc-program-yaz.md), [Programı kaydet, aç ve Java'yı al](ftc-programi-kaydet.md), [Programı Control Hub'a yükle](ftc-control-hub-yukle.md). |

- [Arayüz turu](arayuz.md): her bölge, her düğme.
- [Kısayollar](kisayollar.md): klavye ve fare.
- [Sorun giderme](sorunlar.md): belirti, sebep, çözüm.

<!-- SAY: Probot kitimiz varsa ilk on dakika sayfasından, FTC robotumuz varsa FTC örneğinden başlıyoruz. -->

## Probot Blocks görevleri

- [Hazır örnekle başla](probot-ornekle-basla.md)
- [Blok ekle, bağla ve düzenle](probot-bloklari-duzenle.md)
- [Sürüş programı yaz](probot-surus-programi-yaz.md)
- [Değişken oluştur ve kullan](probot-degisken-kullan.md)
- [Robot WiFi ayarlarını yap](probot-wifi-ayarla.md)
- [Projeyi kaydet, aç ve yeniden başla](probot-projeyi-kaydet.md)
- [Kodu kopyala ya da indir](probot-kodu-al.md)
- [Kodu Probot kartına yükle](probot-karta-yukle.md)
- [Blokları FTC Blocks'a taşı](probot-ftcye-tasi.md)
- [Probot blok listesi](probot-blok-listesi.md) (başvuru)

<!-- SAY: Probot görevleri örnekten başlayıp kodu karta yüklemeye kadar gidiyor. -->

## FTC Blocks görevleri

- [FTC örneğiyle başla](ftc-ornekle-basla.md)
- [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md)
- [Yeni FTC programı yaz](ftc-program-yaz.md)
- [Programı kaydet, aç ve Java'yı al](ftc-programi-kaydet.md)
- [Programı Control Hub'a yükle](ftc-control-hub-yukle.md)
- [Programı Sim'de dene](ftc-simde-dene.md)
- [FTC blok listesi](ftc-blok-listesi.md) (başvuru)

<!-- SAY: FTC görevleri yapılandırmadan Control Hub ve Sim'e kadar gidiyor. -->

## Ortak

- [Hata bildir](hata-bildir.md)

<!-- SAY: Bir hata görürsek araçtan çıkmadan ekibe bildiriyoruz. -->

## Sözlük

| Terim | Anlamı |
|---|---|
| Araç çubuğu | Mod sekmelerinin, proje adının ve dosya düğmelerinin durduğu üst şerit. |
| Blok listesi | Çalışma alanının yanındaki kategori listesi (**Kumanda**, **Motor & Sürüş**...). |
| Blok paneli | Bir kategoriye basınca açılan, o kategorinin bloklarını gösteren panel. |
| Çalışma alanı | Blokları dizdiğin geniş alan. Probot modunda zemin noktalı, FTC modunda düz beyaz. |
| Yan panel | Çalışma alanının yanındaki ayar ve kod paneli. |
| Yaşam döngüsü blokları | Probot modunda hazır gelen ve silinemeyen altı blok (**robotInit**, **teleopLoop**...). Robotun hangi anda ne yapacağını belirler. |
| Değişken | Değer saklayan ad. Motor, servo ve kumanda adları da değişken olarak tutulur. |
| OpMode | FTC'de robotun çalıştırdığı tek program. Driver Station'da adıyla seçilir. |
| Robot yapılandırması | Control Hub'a bağlı motor, servo ve sensörlerin adları. |
| `.ino` | Arduino IDE'nin açtığı kod dosyası. |
| `.probot.json` | Probot Blocks proje dosyası: bloklar, proje adı, WiFi ayarları. |
| `.blk` | FTC Blocks program dosyası. Control Hub'daki Blocks editörü de bu biçimi kullanır. |
| OnBot Java | Control Hub'daki Java editörü. Blocks bu editöre yapıştırılacak Java kodunu üretir. |

<!-- SAY: Dokümanda geçen bölge adları ekrandaki yerleriyle aynı. -->
