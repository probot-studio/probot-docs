# Probot Studio araçları

Probot Studio'nun üç aracı var: Blocks, Builder ve Sim. Üçü de tarayıcıda çalışır, kurulum istemez.
Bu sayfalar her aracı adım adım kullanmayı gösterir: hangi düğmeye basacağını, sonunda ekranda ne
göreceğini.

| Araç | Ne yaparsın | Başla |
|---|---|---|
| [**Blocks**](blocks/index.md) | Robot programını blokları dizerek yazarsın. Probot kiti için Arduino kodu (`.ino`), FTC robotu için `.blk` dosyası ve OnBot Java üretir. | [İlk 10 dakika: Tank Sürüş örneğini aç, kodu indir](blocks/ilk-10-dakika.md) |
| [**Builder**](builder/index.md) | Robotunu 3B olarak tasarlarsın. Parçaları katalogdan seçer, deliklerinden takar, eklemleri oynatır, parça listesini mağaza sepetine aktarırsın. | [İlk 10 dakika: hazır robotu aç, parça tak, kaydet](builder/ilk-10-dakika.md) |
| [**Sim**](sim/index.md) | Builder robotunu ve Blocks'taki FTC programını sanal FTC sahasında çalıştırırsın. Otonomu izler, TeleOp'u klavyeyle ya da kumandayla sürersin. | [İlk 10 dakika: hazır robotla otonomu izle, TeleOp'u sür](sim/ilk-10-dakika.md) |

Her araçta önce **İlk 10 dakika** sayfasını izle. Sonra yapmak istediğin işin sayfasını aracın
giriş sayfasından aç.

<!-- SAY: Probot Studio'nun üç aracı da tarayıcıda çalışıyor ve kurulum istemiyor. -->

## Araçlar birlikte nasıl çalışır

1. **Builder**'da robotunu kur ya da hazır bir robot aç.
2. **Builder**'da **Dosya** > **Sim'de dene**'yi seç. Sim yeni sekmede açılır, robotun seçili gelir.
3. **Blocks**'ta **FTC Blocks** sekmesinde programını yaz.
4. **Sim**'de **OpMode** listesinden "Blocks'ta açık FTC projesi" satırını seç ve programı sahada dene.
5. Program hazır olunca **.blk indir** ile dosyayı al ve Control Hub'a yükle.

Probot kiti için yol ayrıdır: **Probot Blocks** sekmesinde **.ino indir** ile kodu alır, Arduino IDE
ile karta yüklersin. Sim Probot Blocks programlarını çalıştırmaz.

Dosyasız geçişler (2. ve 4. adım) için araçlar aynı tarayıcıda ve aynı adreste
(probotstudio.com) açık olmalı. Sim, Builder'ın ve Blocks'un bu tarayıcıda sakladığı çalışmayı okur.

| Dosya | Hangi araç üretir | Nasıl | Hangi araç kullanır | Nasıl |
|---|---|---|---|---|
| Robot (dosyasız) | Builder | **Dosya** > **Sim'de dene** ya da **Robot Kataloğu**'nda **Sim'de dene** | Sim | Yeni sekmede açılır, robot seçili gelir. Bkz. [Robotu Sim'de dene](builder/simde-dene.md) |
| Robot (dosyasız) | Builder | Projeyi kendiliğinden bu tarayıcıya kaydeder | Sim | **Robot** bölümünde **Kaynak** listesinden "Builder" rozetli satırı seç. Bkz. [Robotu seç](sim/robotu-sec.md) |
| Robot (`.json`) | Builder | **Dosya** > **Kaydet (JSON indir)** | Sim | **Robot** bölümünde **Proje dosyası aç** ya da **Dosya** > **Robot proje dosyası aç…**. Bkz. [Builder proje dosyasını aç](sim/robotu-sec.md#builder-proje-dosyasini-ac) |
| Robot (`.json`) | Builder | **Dosya** > **Kaydet (JSON indir)** | Builder | **Dosya** > **Yükle...**. Bkz. [Dosyaya kaydet ve aç](builder/dosyaya-kaydet-ve-ac.md) |
| FTC programı (dosyasız) | Blocks | Program **FTC Blocks** sekmesinde açık | Sim | **OpMode** listesinde "Blocks'ta açık FTC projesi" satırını seç. Bkz. [Programı Sim'de dene](blocks/ftc-simde-dene.md) |
| FTC programı (`.blk`) | Blocks | **FTC Blocks** sekmesinde **.blk indir** | Sim | **Kod** bölümünde **.blk dosyası aç** ya da **Dosya** > **Kod dosyası (.blk) aç…**. Bkz. [.blk dosyasını aç](sim/programi-sec.md#blk-dosyasini-ac) |
| FTC programı (`.blk`) | Blocks | **FTC Blocks** sekmesinde **.blk indir** | Control Hub | **Blocks** sekmesinde **Upload Op Mode**. Bkz. [Programı Control Hub'a yükle](blocks/ftc-control-hub-yukle.md) |
| OnBot Java (`.java`) | Blocks | **FTC Blocks** sekmesinde **.java indir** ya da **Java kopyala** | Control Hub | **OnBot Java** sekmesinde yükle ya da yapıştır, **Build**'e bas. Bkz. [Programı Control Hub'a yükle](blocks/ftc-control-hub-yukle.md) |
| Probot kodu (`.ino`) | Blocks | **Probot Blocks** sekmesinde **.ino indir** ya da **Kodu kopyala** | Arduino IDE | **File** > **Open** ile aç, karta yükle. Bkz. [Kodu Probot kartına yükle](blocks/probot-karta-yukle.md) |
| Probot projesi (`.probot.json`) | Blocks | **Probot Blocks** sekmesinde **Blokları indir** | Blocks | **Blokları yükle**. Bkz. [Projeyi kaydet, aç ve yeniden başla](blocks/probot-projeyi-kaydet.md) |

Sim `.ino` ve `.probot.json` dosyalarını açmaz. Sim'de kaydetme ya da dışa aktarma yoktur;
Sim'deki değişiklikler Builder'a geri gitmez.

<!-- SAY: Robotu Builder'da kuruyor, programı Blocks'ta yazıyor, ikisini Sim'de birlikte deniyoruz. -->

## Ne gerekir {#ne-gerekir}

Araç sayfaları bu değerleri tekrar yazmaz, bu tabloya bağlanır. "-" bilinmeyen değerdir.

| | Blocks | Builder | Sim |
|---|---|---|---|
| Tarayıcı | Chrome, Edge, Firefox ya da Safari, güncel sürüm | Chrome, Edge ya da Firefox, güncel sürüm | Chrome, Edge ya da Firefox, güncel sürüm |
| En dar ekran / dokunmatik | Pencere 860 px ya da daha darsa bölgeler alt alta dizilir. Telefonda giriş kartı uyarır, **Yine de devam et** 3 saniye sonra açılır. Dokunmatikte blok sürükleme ve kaydırma çalışır. | Pencere 900 px ya da daha darsa (dokunmatik ekranda 1100 px'den darsa) Builder açılmaz, "Builder bilgisayarda çalışır" ekranı çıkar. | Pencere 900 px'den darsa ya da dokunmatik ekran 1100 px'den darsa giriş kartı uyarır, **Yine de devam et** 3 saniye sonra açılır. 900 px ya da daha darsa paneller sahnenin altında sekme olur. |
| Fare | Tekerlek kaydırır (FTC Blocks'ta yakınlaştırır). Yan paneli genişletmek Probot Blocks'ta yalnız fareyle olur. | Üç tuşlu fare önerilir: sağ tuş kamerayı döndürür, orta tuş kaydırır. | 3B sahnede sol tuş kamerayı döndürür, sağ tuş kaydırır, tekerlek yakınlaştırır. |
| Klavye | Kısayollar ve blok taşıma (<kbd>Ctrl</kbd>+<kbd>C</kbd>, <kbd>Ctrl</kbd>+<kbd>V</kbd>) için | Kısayollar için. Her işin düğmesi ya da menü öğesi de vardır. | TeleOp'u sürmek için klavye ya da kumanda gerekir. Ekranda dokunmatik kumanda yoktur. |
| Kumanda | Gerekmez | Gerekmez | İsteğe bağlı. USB ya da Bluetooth kumanda **gamepad1** olur; yalnız ilk bağlanan kumanda okunur. |
| Hesap / giriş | Gerekmez. Hesap ve bulut kaydı yoktur. | Gerekmez. **Hesabıma kaydet**, **Robotlarım**, **Paylaşım linki** ve **Robotunu paylaş** için Probot hesabıyla giriş gerekir. | Gerekmez |
| İnternet | Sayfayı açmak için gerekir. FTC örnekleri de internetten yüklenir. | Sayfayı açmak için gerekir. Parça modelleri ve hesap işlemleri de internet ister. | Sayfayı açmak için gerekir. |
| Kayıt yeri | Probot Blocks: proje ve WiFi ayarları tarayıcı çerezinde (yaklaşık 4 KB; aşan proje uyarısız kaydedilmez). FTC Blocks: program tarayıcıda (localStorage). Kalıcı kopya: `.probot.json` ve `.blk` dosyası. | Proje tarayıcıda (localStorage), her değişiklikten 1 saniye sonra kendiliğinden. Kalıcı kopya: `.json` dosyası ya da Probot hesabı. | Seçimler ve ayarlar tarayıcıda (localStorage). Dosyadan açılan robot ve program saklanmaz. Kaydetme ya da paylaşma düğmesi yoktur. |

!!! warning "Dikkat"
    Tarayıcıda saklanan çalışma o tarayıcıya bağlıdır. Tarayıcı verisini silersen, gizli pencerede
    çalışırsan ya da başka bilgisayara geçersen kaybolur. Kalıcı kopya için dosyaya indir.

<!-- SAY: Üç araç için de bir bilgisayar ve güncel bir tarayıcı yetiyor, hesap gerekmiyor. -->

## Nereden başlamalıyım

- **Hiçbir şeyin yoksa** Sim ile başla: [Sim: İlk 10 dakika](sim/ilk-10-dakika.md). Hesap, kurulum
  ya da robot gerekmez; hazır robot ve hazır programla ilk sonucu görürsün.
- **Probot kitin varsa** Blocks'un **Probot Blocks** sekmesiyle başla:
  [Blocks: İlk 10 dakika](blocks/ilk-10-dakika.md).
- **FTC takımındaysan** önce Sim'de hazır robotu sür, sonra Blocks'ta **FTC Blocks** ile kendi
  programını yaz: [FTC örneğiyle başla](blocks/ftc-ornekle-basla.md).
- **Robot tasarlamak ya da parça sipariş etmek istiyorsan** Builder ile başla:
  [Builder: İlk 10 dakika](builder/ilk-10-dakika.md).

<!-- SAY: Robotumuz yoksa Sim ile başlıyor, Probot kitimiz varsa Blocks ile başlıyoruz. -->
