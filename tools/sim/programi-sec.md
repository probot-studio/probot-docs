# Programı seç

Bu sayfada robotun çalıştıracağı FTC programını (OpMode) seçeceksin: Sim'in örnek programlarından
biri, Blocks'ta açık programın, bir `.blk` dosyası ya da Android Studio projendeki Java OpMode'ları.

![Kod bölümü; OpMode listesinde Starter Bot otonom (CRServo) seçili, özette Otonom yazıyor.](img/sim-program-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=Starter Bot + Starter Bot otonom (CRServo) | hedef=#ana-kod | isaret=yok | bekle=text="Starter Bot otonom (CRServo) · Otonom" -->
<!-- SAY: Sonunda robotun çalıştıracağı program Kod bölümünde seçili oluyor. -->

Program seçimi ana sayfadaki **Kod** bölümünde ve çalışma alanındaki **Kod** panelinde aynıdır.
Birinde seçtiğin program ötekinde de seçili olur.

Sim FTC Blocks programlarını ve Android Studio'da Java ile yazılmış OpMode'ları çalıştırır. Program
Control Hub'daki gibi koşar. Probot Blocks'un `.ino` ve `.probot.json` dosyaları Sim'de açılmaz.

## Başlamadan önce

- Sim açık: [probotstudio.com/sim](https://probotstudio.com/sim/).
- Kendi programını getireceksen program Blocks'un **FTC Blocks** modunda
  ([Yeni FTC programı yaz](../blocks/ftc-program-yaz.md)) ya da Android Studio'da Java ile yazılmış olmalı.

<!-- SAY: Kendi programımızı getireceksek onu Blocks'un FTC modunda ya da Android Studio'da yazıyoruz. -->

## Örnek programı seç {#ornek-programi-sec}

| Örnek | Tür | Hangi robot için |
|---|---|---|
| **Starter Bot TeleOp (CRServo)** | TeleOp | Starter Bot, sürekli servolu besleyici |
| **Starter Bot otonom (CRServo)** | Otonom | Starter Bot, atış ve park |
| **Starter Bot TeleOp** | TeleOp | Servo kapılı besleyicili Starter Bot |
| **Starter Bot otonom** | Otonom | Servo kapılı besleyicili Starter Bot, atış ve park |
| **Mecanum Şasi TeleOp** | TeleOp | WattOS mecanum şasi |
| **Tank Şasi TeleOp** | TeleOp | Omni şasi (tank sürüş, her yanda bir motor) |

**OpMode** listesinde her satırın sağında "Otonom" ya da "TeleOp" rozeti durur.

1. Ana sayfada **Robot** bölümünün **Kaynak** listesinden örneğe uygun robotu seç, örneğin **Starter Bot**.
   Çalışma alanında aynı liste **Robot** panelindedir.
2. **Kod** bölümüne in. Çalışma alanındaysan bunun yerine **Kod** panelinin sekmesine bas.
3. **OpMode** listesinden bir program seç, örneğin **Starter Bot otonom (CRServo)**.
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=Starter Bot seçili | hedef=role=button[name=/^Starter Bot otonom \(CRServo\)/] | isaret=3 | bekle=text="OpMode" -->
   ![Kod bölümü; OpMode listesinde Starter Bot otonom (CRServo) 3 numarayla işaretli.](img/sim-program-ornek.png)

Sonuç: Bölüm başlığının altındaki özette "Starter Bot otonom (CRServo) · Otonom" yazar. Ana sayfanın
hazırlık listesinde "Kod: Starter Bot otonom (CRServo) (Otonom)" maddesi yeşil onaylıdır.

<!-- SAY: Örnek programlardan birini seçiyoruz, rozet programın otonom mu TeleOp mu olduğunu söylüyor. -->

!!! tip "İpucu"
    Seçili program bir örnekse, hazır robot seçince Sim o robota uygun örneğe (varsa) kendiliğinden geçer. Blocks'taki ya da dosyadan açtığın program seçiliyse program değişmez. Bkz. [Robotu seç](robotu-sec.md#hazir-robot-sec).

## Blocks'taki programı seç {#blocks-programini-sec}

Blocks ve Sim aynı tarayıcıda açıksa Sim, Blocks'ta açık FTC programını kendisi görür.

!!! tip "İpucu"
    Blocks'taki program listeye yalnız içinde **runOpMode** bloğu varsa gelir.

1. **Kod** bölümünde **Blocks'ta yaz**'a bas (ya da **Dosya** > **Blocks'u aç**'ı seç). Blocks yeni sekmede açılır.
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=giriş kartı ve çerez bandı kapalı | hedef=role=link[name="Blocks'ta yaz"] | isaret=1 | bekle=text="OpMode" -->
   ![Kod bölümü; Blocks'ta yaz düğmesi 1 numarayla işaretli.](img/sim-program-blocks.png)
2. Blocks'ta **FTC Blocks** sekmesinde programını yaz ya da aç.
3. Sim sekmesine dön.
4. **OpMode** listesinin başında "Blocks'ta açık FTC projesi" açıklamalı satırı seç.

Sonuç: Satırın adı Blocks'taki OpMode adıdır. Blocks'ta programı değiştirdikçe Sim listedeki programı yeniden okur.

<!-- SAY: Blocks'ta yazdığımız FTC programı aynı tarayıcıdaki Sim'in listesine kendiliğinden geliyor. -->

## .blk dosyasını aç {#blk-dosyasini-ac}

!!! warning "Dikkat"
    Listede aynı anda tek bir dosya programı durur. Yeni bir `.blk` açınca ya da sayfayı yenileyince önceki dosya programı listeden çıkar.

1. **Kod** bölümünde **Dosya aç (.blk, .java)**'ya bas (ya da **Dosya** > **Kod dosyası (.blk, .java) aç…**'ı seç).
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=giriş kartı ve çerez bandı kapalı | hedef=role=button[name="Dosya aç (.blk, .java)"] | isaret=1 | bekle=text="OpMode" -->
   ![Kod bölümü; Dosya aç (.blk, .java) düğmesi 1 numarayla işaretli.](img/sim-program-blk-ac.png)
2. Açılan pencerede `.blk` dosyasını seç. Aynı pencerede `.java` dosyası da seçebilirsin: [Android Studio projesini aç](#android-studio-projesini-ac).
3. **Aç**'a bas.

Sonuç: Program "Dosyadan: <dosya adı>" açıklamasıyla listenin sonuna eklenir ve seçilir. Satırın adı,
`.blk` uzantısı olmadan dosyanın adıdır.

Dosyada **runOpMode** bloğu yoksa program yine listeye eklenir ama **Kod** bölümünde kırmızı kutuda
"Programda runOpMode bloğu yok" yazar.

`.blk` dosyasını Blocks'tan indirirsin: [Programı kaydet, aç ve Java'yı al](../blocks/ftc-programi-kaydet.md).

<!-- SAY: Blocks'tan indirdiğimiz blk dosyasını Sim'de açabiliyoruz. -->

## Android Studio projesini aç {#android-studio-projesini-ac}

Android Studio'da Java ile yazdığın OpMode'ları da Sim'de çalıştırabilirsin. Sim projenin `TeamCode`
klasörünü okur ve `@TeleOp` ya da `@Autonomous` ile işaretli her sınıfı **OpMode** listesine ekler.
Java desteği deneyseldir: Sim'in tanımadığı bir sınıf ya da metot satır numaralı hata verir.

1. **Kod** bölümünde **Android Studio klasörü aç**'a bas (ya da **Dosya** > **Android Studio klasörü aç…**'ı seç).
   Tek tek dosya açmak için **Dosya aç (.blk, .java)**'ya bas; birden çok `.java` dosyası seçebilirsin.
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=giriş kartı ve çerez bandı kapalı, Starter Bot + Starter Bot otonom (CRServo) | hedef=role=button[name="Android Studio klasörü aç"] | isaret=1 | bekle=text="OpMode" -->
   ![Kod bölümü; Android Studio klasörü aç düğmesi 1 numarayla işaretli.](img/sim-program-java-ac.png)
2. Açılan pencerede Android Studio projendeki `TeamCode` klasörünü seç.
3. Tarayıcı klasörü okumak için izin isterse izin ver.
4. **OpMode** listesinde "Java TeleOp" ya da "Java Otonom" rozetli bir satır seç.
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=Starter Bot seçili, StarterBotTeleop.java (FTC örneği) Dosya aç ile açılmış | hedef=role=button[name=/^StarterBotTeleop/] | isaret=4 | bekle=text="Java TeleOp" -->
   ![OpMode listesi; Java TeleOp rozetli StarterBotTeleop satırı 4 numarayla işaretli.](img/sim-program-java-sonuc.png)

Sonuç: **Kod** bölümünde "Android Studio: <klasör> · <sayı> Java dosyası · <sayı> OpMode." yazar. Java
OpMode'ları listenin başına gelir; açıklamada dosya adı ve OpMode grubu yazar. İlk OpMode kendiliğinden
seçilir. Proje bu tarayıcıda saklanır, sayfayı yenileyince de listede kalır.

<!-- SAY: Android Studio projesinin TeamCode klasörünü açınca Java OpMode'ları listeye geliyor. -->

Koddaki cihaz adları Blocks programındaki gibi porta bağlanır: [Cihazları porta bağla](cihazlari-porta-bagla.md).
Sim adları koddan okur; adı `hardwareMap.get(DcMotor.class, "left_drive")` gibi doğrudan metin ya da sabit olarak yaz.

## Değişikliği Sim'e al {#java-yeniden-oku}

1. Android Studio'da dosyayı kaydet.
2. Sim'de **Kod** bölümüne in. "Android Studio: …" satırı projeyi nasıl yeniden okuyacağını söyler.
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=Starter Bot seçili, StarterBotTeleop.java (FTC örneği) Dosya aç ile açılmış | hedef=text=/^Android Studio: / | isaret=2 | bekle=text="Java projesini kaldır" -->
   ![Kod bölümü; Android Studio satırı 2 numarayla işaretli, altında Java projesini kaldır düğmesi.](img/sim-program-java-yeniden.png)
3. **Yeniden oku**'ya bas (ya da **Dosya** > **Java projesini yeniden oku**'yu seç).
   **Yeniden oku** yalnız Chrome ve Edge'de, klasörü **Android Studio klasörü aç** ile açtıysan görünür.
   Sayfayı yenileyince proje listede kalır ama **Yeniden oku** kalkar.
   Öteki durumlarda satırda "klasörü yeniden aç" yazar; klasörü ya da dosyaları yeniden aç.
4. Çalışma alanında TeleOp seçiliyse araç çubuğunda **Başlat**'a bas. Otonom seçiliyse koşu yeni kodla kendiliğinden yeniden başlar.

Sonuç: Seçili OpMode seçili kalır ve yeni kodla çalışır. Projeyi listeden çıkarmak için **Java projesini kaldır**'a bas;
seçili program Java ise Sim robotun örnek programına döner.

<!-- SAY: Android Studio'da kaydettikten sonra Yeniden oku ile değişikliği Sim'e alıyoruz. -->

## Java'da ne çalışır {#java-calisanlar}

- `LinearOpMode` ve `OpMode`, `hardwareMap`, motorlar, servolar, sürekli servolar, IMU, `gamepad1`, `telemetry`, `ElapsedTime`, `Range`.
- goBILDA Pinpoint ve SparkFun OTOS konumu, Sim'deki robotun konumundan okunur.
- Pedro Pathing 2.x kütüphanesini kullanan projeler çevrilir ve çalışır.
- Kamera (`VisionPortal` ile AprilTag ve renk işlemcileri) ve Limelight 3A sonuç verir. Görüntü işlenmez; sonuçlar sahadaki
  AprilTag etiketlerinin ve oyun elemanlarının yerinden hesaplanır. Kamera robotun önünde, 8 inç yüksekte ve ileri bakar.
  AprilTag için **FTC sahası (boş)** ya da **Deneme sahası (engel bulunan)**'nı seç: [Sahayı seç](sahayi-ayarla.md).
- Mesafe, renk ve dokunma sensörleri sabit bir değer okur; Driver Station'da sarı uyarı çıkar.
- `System.out` çıktısı görünmez, `telemetry` kullan. Aynı anda çalışan `Thread`'ler desteklenmez.
- `build`, `.gradle`, `libs`, `res` gibi klasörler okunmaz. Proje çok büyükse yalnız `TeamCode` klasörünü seç.

<!-- SAY: Sim Java'da motorları, IMU'yu, Pedro Pathing'i ve kamerayı çalıştırıyor, gerçek görüntü ise işlemiyor. -->

## Programın hangi blokları çalışır {#calisan-bloklar}

- Motor (DcMotor), servo (Servo), sürekli servo (CRServo) ve Control Hub IMU blokları çalışır.
- Motor enkoderi okunur; tik/tur değeri [motor ayarından](motorlari-ayarla.md) gelir.
- Mesafe, renk ve dokunma sensörü blokları Sim'de yok; Blocks'un FTC modunda da bulunmaz. Bu blokları içeren bir `.blk` dosyası (örneğin gerçek Control Hub'dan) açarsan kod çevrilmez ve program çalışmaz: **Kod** bölümündeki kırmızı kutuda içinde "Unknown block type" geçen bir hata, Hazırlık listesinde de "Kod çevrilemedi: …" yazar.
- Sim'in çalıştıramadığı bir blokta program durur ve Driver Station'da "Sim bu bloğu henüz çalıştırmıyor: <blok>" hatası çıkar.
- Kumanda bloklarında Sim'in desteklemediği bir komut (örneğin titreşim) programı durdurmaz; komut atlanır. Driver Station'daki sarı kutuda "gamepad1.<komut> sim'de yok sayılıyor" uyarısı çıkar.
- Java çağıran özel bloklar (myBlocks) çalışmaz.

Programdaki her cihaz adı robottaki bir porta bağlanmalıdır: [Cihazları porta bağla](cihazlari-porta-bagla.md).

<!-- SAY: Sim motor servo ve IMU bloklarını çalıştırıyor, mesafe renk ve dokunma sensörü blokları ise Sim'de bulunmuyor. -->

## Sorun mu var?

- **"Kod çevrilemedi: …" hatası:** Bkz. [Sorun giderme](sorunlar.md#kod-cevrilemedi).
- **"Programda runOpMode bloğu yok" yazıyor:** `.blk` dosyasında **runOpMode** bloğu yok. Blocks'ta programı FTC örneğinden başlat. Bkz. [Sorun giderme](sorunlar.md#kod-cevrilemedi).
- **"Bu dosya FTC Blocks (.blk) ya da Java (.java) değil." yazıyor:** Bkz. [Sorun giderme](sorunlar.md#robot-dosyasi-acilmiyor).
- **"Sim bu bloğu henüz çalıştırmıyor: <blok>" yazıyor:** Bkz. [Sorun giderme](sorunlar.md#program-hatasi).
- **Java projesi açılmıyor ya da OpMode listede yok:** Bkz. [Java projesi açılmıyor](sorunlar.md#java-acilmiyor).
- **Blocks'taki program listede yok:** Programda **runOpMode** bloğu olmalı, Blocks ile Sim aynı tarayıcıda açık olmalı. Bkz. [Blocks'taki programı seç](#blocks-programini-sec).

<!-- SAY: Kod çevrilemezse programda runOpMode bloğu olup olmadığına bakıyoruz. -->

## Sonraki adım

[Cihazları porta bağla](cihazlari-porta-bagla.md)

<!-- SAY: Programı seçtikten sonra cihazları porta bağlıyoruz. -->
