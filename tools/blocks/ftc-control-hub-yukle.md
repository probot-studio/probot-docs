# Programı Control Hub'a yükle

Bu sayfada Blocks'tan aldığın programı Control Hub'a yükleyip Driver Station'dan çalıştıracaksın.
Blocks programı Control Hub'a kendisi göndermez. Control Hub ekranlarının ayrıntısı FTC'nin kendi
dokümanındadır.

!!! note "Not"
    Bu sayfadaki Control Hub adımları FTC dokümanına dayanır. Control Hub yazılım sürümüne göre düğme
    adları değişebilir; emin olmak için bağlantılardaki FTC sayfalarını izle.

## Başlamadan önce

- Blocks'tan indirdiğin `.blk` ya da `.java` dosyası. Bkz. [Programı kaydet](ftc-programi-kaydet.md).
  Programın yoksa hazır bir örnekle başla: [FTC örneğiyle başla](ftc-ornekle-basla.md).
- Açık bir Control Hub ve onun WiFi ağına bağlı bir bilgisayar.
- Control Hub'da etkin bir robot yapılandırması. Cihaz adları Blocks'taki **Robot yapılandırması** ile aynı.

## .blk dosyasını Blocks editörüne yükle

1. Bilgisayar Control Hub'ın ağındayken tarayıcıda Control Hub'ın sayfasını aç.
2. **Blocks** sekmesini seç.
3. **Upload Op Mode**'a bas.
4. Açılan pencerede `.blk` dosyasını seç.
5. Program Control Hub'ın Blocks editöründe açılınca kaydet.

Sonuç: OpMode Driver Station'daki listede, Blocks'ta seçtiğin türün (**TeleOp** ya da **Autonomous**)
altında dosya adıyla görünür (ör. `TankSasiTeleOp`).

Ayrıntı: [FTC Docs: Managing OpModes in Blocks](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/blocks/managing_opmodes/managing-opmodes.html)

<!-- SAY: İndirdiğimiz .blk dosyasını Control Hub'ın Blocks sayfasından yüklüyoruz. -->

## Java kodunu OnBot Java'ya ekle

!!! warning "Dikkat"
    OnBot Java'da dosya adı, koddaki `public class` satırındaki adla aynı olmalı. Bu ad Blocks'ta
    **OnBot Java** başlığının yanında yazar. Ad farklı olursa **Build** başarısız olur.

1. Control Hub'ın sayfasında **OnBot Java** sekmesini seç.
2. `.java` dosyasını yükle. Ya da yeni bir dosya aç ve ona Blocks'ta **OnBot Java** başlığının
   yanında yazan adı ver (ör. `TankSasiTeleOp.java`), sonra **Java kopyala** ile aldığın kodu yapıştır.
3. Anahtar simgeli **Build**'e bas.

Sonuç: Derleme başarılı olur. OpMode Driver Station'daki listede `(Blocks to Java)` ekiyle görünür
(ör. `TankSasiTeleOp (Blocks to Java)`).

Ayrıntı: [FTC Docs: Creating and Running an Op Mode (OnBot Java)](https://ftc-docs.firstinspires.org/en/latest/programming_resources/tutorial_specific/onbot_java/creating_op_modes/Creating-and-Running-an-Op-Mode-%28OnBot-Java%29.html)

<!-- SAY: Java kodunu OnBot Java'ya ekleyip derliyoruz. -->

## OpMode'u çalıştır

!!! warning "Dikkat"
    Blocks'taki bir cihaz adı Control Hub yapılandırmasında yoksa program **INIT**'te hata verir.
    Önce adları harf harf karşılaştır: [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

1. Driver Station'da OpMode'u seç. Listede **OpMode** kutusuna yazdığın ad değil, indirdiğin dosyanın
   adı görünür. Örneğin "Tank Şasi TeleOp" yazdıysan listede `TankSasiTeleOp` görünür. OnBot Java ile
   eklediysen ad `TankSasiTeleOp (Blocks to Java)` olur.
2. **INIT**'e bas.
3. **START**'a bas.

Sonuç: Program **STOP**'a basana kadar çalışır. **Tank Şasi TeleOp** örneğinde gamepad1'in **sol
çubuğu** robotu ileri ve geri götürür, **sağ çubuğu** robotu döndürür.

<!-- SAY: Driver Station'da programı seçip başlatıyoruz. -->

## Sorun mu var?

- **INIT'te cihaz bulunamadı hatası:** Blocks'taki bir cihaz adı Control Hub yapılandırmasında yok ya da
  farklı yazılmış. Adları harf harf karşılaştır. Bkz. [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).
- **Program listede yok:** Blocks editöründe kaydetmeyi ya da OnBot Java'da **Build**'i unutmuş olabilirsin.
  Listede **OpMode** kutusuna yazdığın adı değil, dosya adını ara (ör. `TankSasiTeleOp`).
- **OnBot Java'da Build başarısız:** Dosya adı, koddaki `public class` adıyla aynı değil. Dosyaya Blocks'ta
  **OnBot Java** başlığının yanında yazan adı ver.

## Sonraki adım

[Programı Sim'de dene](ftc-simde-dene.md)
