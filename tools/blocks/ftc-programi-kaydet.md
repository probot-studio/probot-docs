# Programı kaydet, aç ve Java'yı al

Bu sayfada FTC programını `.blk` dosyası olarak kaydedecek, kayıtlı bir `.blk` dosyasını açacak ve
programın OnBot Java karşılığını alacaksın.

## Başlamadan önce

- Blocks açık ve **FTC Blocks** sekmesi seçili.
- Denemek için **Örnek seç** > **Tank Şasi TeleOp**'u aç.

## Programı .blk olarak kaydet

1. Araç çubuğunda **OpMode** kutusuna programın adını yaz, ör. `Tank Şasi TeleOp`. En çok 60 karakter.
2. Araç çubuğunda **.blk indir**'e bas. "TankSasiTeleOp.blk indirildi." bildirimi çıkar.
   ![FTC araç çubuğu; .blk indir 2 numarayla işaretli.](img/blocks-ftc-blk-indir.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=FTC Blocks, ornek:Tank Şasi TeleOp | hedef=role=button[name=".blk indir"] | isaret=2 | bekle=text="Java kopyala" -->
   <!-- SAY: FTC programını Control Hub'ın da tanıdığı .blk dosyası olarak indiriyoruz. -->
3. İndirilenler klasöründeki `TankSasiTeleOp.blk` dosyasını güvenli bir yere taşı.

Sonuç: Elinde `TankSasiTeleOp.blk` dosyası var. Dosyada bloklar ile yan paneldeki **Tür** ve **Grup**
bilgisi vardır.

Dosya adı **OpMode** kutusundaki addan türetilir. Türkçe harfler sadeleşir, boşluk ve işaretler kalkar,
her kelime büyük harfle başlar. Kutu boşsa ad `ProbotOpMode` olur, rakamla başlıyorsa başına `Op` eklenir.

Bu dosyayı Control Hub'a yüklersin. Bkz. [Programı Control Hub'a yükle](ftc-control-hub-yukle.md).

## Kayıtlı .blk dosyasını aç {#blk-ac}

!!! warning "Dikkat"
    Dosya açmak çalışma alanındaki programın yerine geçer ve onay sormaz. Açılamayan bir dosya da
    ekrandaki programı silebilir.

1. Araç çubuğunda **.blk yükle**'ye bas.
2. Açılan pencerede `.blk` dosyasını seç.
3. **Aç**'a bas.

Sonuç: "<dosya> yüklendi." bildirimi çıkar. **OpMode** adı dosya adından gelir. Programda geçen ama
listede olmayan cihazlar **Robot yapılandırması**na eklenir.

Control Hub'daki Blocks editöründen indirilmiş `.blk` dosyalarını da açabilirsin, ama yalnız Blocks'ta
olan blokları (motor, servo, sürekli servo, IMU, gamepad, telemetri vb.) kullanıyorsa.

Renk, mesafe ya da dokunma sensörü, dijital/analog giriş veya AprilTag/görüntü işleme blokları olan bir
dosya açılmaz ve "Bu dosya bir FTC Blocks (.blk) dosyası değil." yazar. Bu durumda ekrandaki program
silinir ya da yarım yüklenir. O yüzden dosya açmadan önce çalışmanı **.blk indir** ile kaydet.

<!-- SAY: Daha önce kaydettiğimiz ya da Control Hub'dan aldığımız .blk dosyasını açıyoruz. -->

## Java kodunu kopyala

!!! tip "İpucu"
    Tarayıcı panoya erişim izni vermezse "Kopyalama başarısız oldu." yazar. Bu durumda **.java indir**'i
    kullan.

1. Yan panelde **OnBot Java** başlığının yanındaki dosya adını not et, ör. `TankSasiTeleOp.java`.
2. Araç çubuğunda **Java kopyala**'ya bas. "OnBot Java panoya kopyalandı." bildirimi çıkar.
3. Control Hub'daki OnBot Java dosyasına <kbd>Ctrl</kbd>+<kbd>V</kbd> ile yapıştır.

Sonuç: Java kodunun tamamı OnBot Java dosyasına geçer. Mac'te <kbd>Cmd</kbd>+<kbd>V</kbd> kullan.
Dosyayı açma ve derleme: [Programı Control Hub'a yükle](ftc-control-hub-yukle.md).

<!-- SAY: Aynı programın Java karşılığını tek düğmeyle kopyalıyoruz. -->

## Java kodunu dosya olarak indir

1. Araç çubuğunda **OpMode** kutusuna programın adını yaz, ör. `Tank Şasi TeleOp`.
2. Araç çubuğunda **.java indir**'e bas. "TankSasiTeleOp.java indirildi." bildirimi çıkar.
3. İndirilenler klasöründeki `TankSasiTeleOp.java` dosyasını güvenli bir yere taşı.

Sonuç: Dosya adı ve içindeki sınıf adı aynıdır (`TankSasiTeleOp`). OnBot Java bu eşleşmeyi ister.

<!-- SAY: Java kodunu dosya olarak da indirebiliyoruz. -->

## Otomatik kayıt

FTC programı, **Robot yapılandırması**, OpMode adı ve yan panel genişliği tarayıcıda kendiliğinden
saklanır. Probot Blocks sekmesine geçip dönünce program yerinde kalır. Başka bir tarayıcı ya da bilgisayar
bu kaydı görmez; programı taşımak için **.blk indir**'i kullan.

<!-- SAY: Tarayıcı FTC programını saklıyor ama başka bilgisayara taşımak için dosyaya indiriyoruz. -->

## Sorun mu var?

- **"Bu dosya bir FTC Blocks (.blk) dosyası değil." yazıyor:** Seçtiğin dosya `.blk` değil ya da Blocks'ta
  olmayan bloklar içeriyor. Bkz. [Kayıtlı .blk dosyasını aç](#blk-ac).
- **"Kopyalama başarısız oldu." yazıyor:** Tarayıcı panoya yazma izni vermedi. **.java indir** ile dosyayı
  indir.
- Diğer sorunlar: [Sorun giderme](sorunlar.md).

## Sonraki adım

[Programı Control Hub'a yükle](ftc-control-hub-yukle.md)
