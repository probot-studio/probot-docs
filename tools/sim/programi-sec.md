# Programı seç

Bu sayfada robotun çalıştıracağı FTC programını (OpMode) seçeceksin: Sim'in örnek programlarından
biri, Blocks'ta açık programın ya da bir `.blk` dosyası.

![Kod bölümü; OpMode listesinde Starter Bot otonom (CRServo) seçili, özette Otonom yazıyor.](img/sim-program-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=Starter Bot + Starter Bot otonom (CRServo) | hedef=#ana-kod | isaret=yok | bekle=text="Starter Bot otonom (CRServo) · Otonom" -->
<!-- SAY: Sonunda robotun çalıştıracağı program Kod bölümünde seçili oluyor. -->

Program seçimi ana sayfadaki **Kod** bölümünde ve çalışma alanındaki **Kod** panelinde aynıdır.
Birinde seçtiğin program ötekinde de seçili olur.

Sim yalnız FTC Blocks programlarını çalıştırır. Program Control Hub'daki gibi FTC bloklarıyla koşar.
Probot Blocks'un `.ino` ve `.probot.json` dosyaları Sim'de açılmaz.

## Başlamadan önce

- Sim açık: [probotstudio.com/sim](https://probotstudio.com/sim/).
- Kendi programını getireceksen program Blocks'un **FTC Blocks** modunda yazılmış olmalı:
  [Yeni FTC programı yaz](../blocks/ftc-program-yaz.md).

<!-- SAY: Kendi programımızı getireceksek onu Blocks'un FTC modunda yazıyoruz. -->

## Örnek programı seç {#ornek-programi-sec}

| Örnek | Tür | Hangi robot için |
|---|---|---|
| **Starter Bot TeleOp (CRServo)** | TeleOp | Starter Bot, sürekli servolu besleyici |
| **Starter Bot otonom (CRServo)** | Otonom | Starter Bot, atış ve park |
| **Starter Bot TeleOp** | TeleOp | Servo kapılı besleyicili Starter Bot |
| **Starter Bot otonom** | Otonom | Servo kapılı besleyicili Starter Bot, atış ve park |
| **Mecanum Şasi TeleOp** | TeleOp | NFR mecanum şasi ve WattOS mecanum şasi |
| **Tank Şasi TeleOp** | TeleOp | NFR omni şasi ve Omni şasi |

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

1. **Kod** bölümünde **.blk dosyası aç**'a bas (ya da **Dosya** > **Kod dosyası (.blk) aç…**'ı seç).
   <!-- CAPTURE: url=https://probotstudio.com/sim/ | hazirla=giriş kartı ve çerez bandı kapalı | hedef=role=button[name=".blk dosyası aç"] | isaret=1 | bekle=text="OpMode" -->
   ![Kod bölümü; .blk dosyası aç düğmesi 1 numarayla işaretli.](img/sim-program-blk-ac.png)
2. Açılan pencerede `.blk` dosyasını seç.
3. **Aç**'a bas.

Sonuç: Program "Dosyadan: <dosya adı>" açıklamasıyla listenin sonuna eklenir ve seçilir. Satırın adı,
`.blk` uzantısı olmadan dosyanın adıdır.

Dosyada **runOpMode** bloğu yoksa program yine listeye eklenir ama **Kod** bölümünde kırmızı kutuda
"Programda runOpMode bloğu yok" yazar.

`.blk` dosyasını Blocks'tan indirirsin: [Programı kaydet, aç ve Java'yı al](../blocks/ftc-programi-kaydet.md).

<!-- SAY: Blocks'tan indirdiğimiz blk dosyasını Sim'de açabiliyoruz. -->

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
- **"Bu dosya FTC Blocks (.blk) değil." yazıyor:** Bkz. [Sorun giderme](sorunlar.md#robot-dosyasi-acilmiyor).
- **"Sim bu bloğu henüz çalıştırmıyor: <blok>" yazıyor:** Bkz. [Sorun giderme](sorunlar.md#program-hatasi).
- **Blocks'taki program listede yok:** Programda **runOpMode** bloğu olmalı, Blocks ile Sim aynı tarayıcıda açık olmalı. Bkz. [Blocks'taki programı seç](#blocks-programini-sec).

<!-- SAY: Kod çevrilemezse programda runOpMode bloğu olup olmadığına bakıyoruz. -->

## Sonraki adım

[Cihazları porta bağla](cihazlari-porta-bagla.md)

<!-- SAY: Programı seçtikten sonra cihazları porta bağlıyoruz. -->
