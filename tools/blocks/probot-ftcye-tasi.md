# Blokları FTC Blocks'a taşı

Probot Blocks'ta yazdığın blokları FTC Blocks'a kopyalayabilirsin. Blocks, kopyaladığın bloğun FTC
karşılığını da panoya yazar. Bu sayfada bir sürüş bloğunu FTC programına taşıyacaksın.

![FTC çalışma alanı; Probot'tan yapıştırılan iki motor bloğu ve Robot yapılandırması görünüyor.](img/blocks-ftcye-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş, teleopLoop içindeki tank sürüş kopyalandı, FTC Blocks Yeni program | hedef=body | isaret=yok | bekle=text="gamepad1" -->
<!-- SAY: Sonunda Probot'taki sürüş bloğu FTC programında karşılığıyla duruyor olacak. -->

## Başlamadan önce

- Blocks açık.
- Hazır bir blokla denemek istersen **Örnek seç** > **Tank Sürüş**'ü aç. Bkz. [Probot örneğiyle başla](probot-ornekle-basla.md).

!!! warning "Dikkat"
    Örnek, çalışma alanındaki projenin yerine geçer ve onay sormaz. Kendi projeni korumak için önce
    **Blokları indir**'e bas. Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md).

## Probot bloğunu kopyala

!!! note "Not"
    FTC'de karşılığı olmayan bir bloğu tek başına kopyalarsan panoya bir şey yazılmaz ve bildirim
    çıkmaz. Hangi blokların karşılığı olduğu [Neyin karşılığı ne olur](#karsiliklar) tablosunda.

1. Araç çubuğunda **Probot Blocks** sekmesine bas.
2. Çalışma alanında taşımak istediğin bloğu seç, ör. **teleopLoop** içindeki **tank sürüş**.
3. <kbd>Ctrl</kbd>+<kbd>C</kbd>'ye bas (Mac'te <kbd>Cmd</kbd>+<kbd>C</kbd>). "Blok kopyalandı. FTC
   Blocks seçeneğinde de yapıştırabilirsin." bildirimi çıkar. Bu bildirim sayfa başına bir kez çıkar.

Sonuç: Seçili blok, yuvalarına takılı bloklarla birlikte panoya kopyalanır. Altına bağlı bloklar
kopyalanmaz.

Bir bölümün tamamını taşımak için **teleopLoop** gibi bölüm bloğunu seç; içindeki blokların hepsi
kopyalanır. Bloğu Probot'tan kaldırarak taşımak için <kbd>Ctrl</kbd>+<kbd>X</kbd>'e bas.

<!-- SAY: Probot modunda bir bloğu seçip her zamanki gibi kopyalıyoruz. -->

## FTC Blocks'a yapıştır

1. Araç çubuğunda **FTC Blocks** sekmesine bas.
2. Fareyi FTC çalışma alanında bloğun gideceği yere getir ve bir kez tıkla.
3. <kbd>Ctrl</kbd>+<kbd>V</kbd>'ye bas (Mac'te <kbd>Cmd</kbd>+<kbd>V</kbd>). Bloklar farenin olduğu yere gelir.
   ![FTC çalışma alanı; Probot'tan yapıştırılan bloklar 3 numarayla işaretli.](img/blocks-ftcye-yapistir.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş, teleopLoop içindeki tank sürüş kopyalandı, FTC Blocks Yeni program | hedef=iframe.ftc-cerceve >> .blocklySvg; text="Robot yapılandırması" | isaret=3 | bekle=text="gamepad1" -->
   <!-- SAY: FTC sekmesine geçip bloğu farenin olduğu yere yapıştırıyoruz. -->
4. Yapıştırılan blokları **to runOpMode** bloğunun içinde doğru yere sürükle. Hangi bölümün nereye
   gittiği aşağıdaki tabloda.

Sonuç: Bloklar FTC karşılıklarıyla **to runOpMode** içinde durur. Tank Sürüş örneğinde `solMotor` ve
`sagMotor` için iki **set ... Power to** bloğu gelir. Bloklarda geçen motor ve servo adları listede
yoksa **Robot yapılandırması**na eklenir.

| Probot bölümü | FTC'de yeri |
|---|---|
| **robotInit** | **call waitForStart**'tan önce |
| **teleopInit**, **autonomousInit** | **call waitForStart**'tan sonra, döngüden önce |
| **teleopLoop**, **autonomousLoop** | **repeat while call opModeIsActive** bloğunun **do** ağzı |
| **robotEnd** | Döngüden sonra |

<!-- SAY: FTC sekmesine geçip bloğu runOpMode içinde doğru yere yerleştiriyoruz. -->

## Neyin karşılığı ne olur {#karsiliklar}

| Probot bloğu | FTC karşılığı |
|---|---|
| **motoru sür** | Aynı adlı **DcMotor**'un **Power** bloğu (`solMotor.Power`) |
| **motoru durdur** | Aynı motorun **Power** bloğu, değer `0` |
| **tank sürüş** | İki **Power** bloğu: sol motora sol güç, sağ motora sağ güç |
| **arcade sürüş** | İki **Power** bloğu: sol motora ileri/geri + dönüş, sağ motora ileri/geri - dönüş |
| **motor tanımla** | **ters** işaretliyse motorun **Direction** değeri `REVERSE` olur. İşaretli değilse atlanır. |
| **servo açısı** | Aynı adlı **Servo**'nun **Position** bloğu. Açı 180'e bölünür: 90 derece `0.5` olur. |
| **hassas güç** | Değerin küpü (`^ 3`) |
| Kumanda blokları (`js`): çubuk, tetik, buton ve D-Pad yönü | **gamepad1** |
| **sol çubuk ↕ (ileri +)**, **sağ çubuk ↕ (ileri +)** | `- gamepad1.LeftStickY`, `- gamepad1.RightStickY`: FTC'de ileri eksi olduğu için eksi bloğu kendiliğinden eklenir |
| **telemetriye yaz**, **Serial yaz (satır)**, **Serial yaz** | Telemetri metin bloğu (`telemetry.addData`) |
| **telemetriye değer yaz** | Aynı etiketle telemetri bloğu (`telemetry.addData`) |
| **bekle ... ms** | **sleep** |
| **geçen süre (ms)** | `getRuntime` × 1000 |
| **robot** bloğunun **otonomda mı?**, **teleopta mı?**, **deadline kaçırdı mı?** seçenekleri | `false` |
| **Kontrol**, **Mantık**, **Matematik**, **Metin**, **Değişkenler** blokları | Aynı blok |
| Pin blokları (**Serial yaz** hariç), **servo sinyalini kes**, **telemetriyi temizle**, **kumandayı oku**, **D-Pad açısı**, **bağlı mı?**, **ham eksen no**, **ham buton no**, **kumanda eşlemesi**, **robot:** bloğu (ör. **pil gerilimi (V)**) | Karşılığı yok, atlanır |

Telemetri bloklarının arkasına **call Telemetry.update** kendiliğinden eklenir. Karşılığı
olmayan değer bloğu bir Probot bloğunun girişindeyse yerine `0` gelir. **Kontrol**, **Mantık** ya da
**Matematik** bloğunun içindeyse o yuva boş kalır.

Yapıştırdıktan sonra motor adlarının Control Hub'daki adlarla aynı olduğunu kontrol et. Bkz.
[Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

<!-- SAY: Motorlar aynı adlı FTC motorlarına, kumanda da gamepad1'e dönüşüyor. -->

## Sorun mu var?

- **Yapıştırınca blok gelmiyor ya da önceki kopya geliyor:** Seçtiğin bloğun FTC'de karşılığı yok,
  panoya bir şey yazılmadı. [Neyin karşılığı ne olur](#karsiliklar) tablosuna bak ve bu işi FTC'nin
  kendi bloğuyla yap.
- **İkinci kopyada bildirim çıkmadı:** "Blok kopyalandı" bildirimi sayfa başına bir kez çıkar. Blok
  yine panoya kopyalanır.
- **Boş bir yuva kaldı:** Yuvadaki Probot bloğunun FTC'de karşılığı yok. Yuvaya FTC'nin kendi
  bloğunu tak.

## Sonraki adım

[Yeni FTC programı yaz](ftc-program-yaz.md)
