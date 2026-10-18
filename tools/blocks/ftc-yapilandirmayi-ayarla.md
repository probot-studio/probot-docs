# Robot yapılandırmasını ayarla

FTC programı motorları ve sensörleri Control Hub'daki adlarıyla bulur. Bu sayfada **Robot
yapılandırması** listesini Control Hub'daki yapılandırmayla aynı yapacaksın. Ad farklıysa program cihazı
bulamaz.

![FTC Blocks ekranı; Robot yapılandırması listesinde eklenen armMotor satırı görünüyor.](img/blocks-ftc-yapilandirma-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=FTC Blocks, + Cihaz ekle ile armMotor adlı motor eklenmiş | hedef=body | isaret=yok | bekle=text="Robot yapılandırması" -->
<!-- SAY: Sayfanın sonunda robotumuzdaki her cihaz Control Hub'daki adıyla listede duracak. -->

## Başlamadan önce

- Blocks açık ve **FTC Blocks** sekmesi seçili.
- Control Hub'daki yapılandırmanın cihaz adlarını bil (ör. Driver Station'da **Configure Robot** ekranından).

Varsayılan liste dört cihazdır: `solMotor`, `sagMotor` (Motor), `kolServo` (Servo), `imu` (IMU).
Hazır bir listeyle başlamak istersen bir örnek aç; liste örneğin cihazlarıyla dolar. Bkz.
[FTC örneğiyle başla](ftc-ornekle-basla.md).

## Cihaz ekle

**+ Cihaz ekle** her zaman bir motor ekler (`motor1`, `motor2`...). Türü ve adı sonra değiştirirsin.

1. Yan panelde **Robot yapılandırması** bölümünde **+ Cihaz ekle**'ye bas.
2. Yeni satırın türünü listeden seç: **Motor (DcMotor)**, **Servo**, **Sürekli servo (CRServo)** ya da **IMU**.
3. Ad kutusuna Control Hub'daki adı yaz, ör. `armMotor`. Türkçe harf ve boşluk kabul edilmez.
4. <kbd>Enter</kbd>'a bas ya da kutudan çık.
   ![Robot yapılandırması; Cihaz ekle 1, tür listesi 2, ad kutusu 3 numarayla işaretli.](img/blocks-ftc-cihaz-ekle.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=FTC Blocks, Yeni program, bir cihaz eklenmiş | hedef=iframe.ftc-cerceve >> text="+ Cihaz ekle"; role=combobox[name="Cihaz türü"]; role=textbox[name="Yapılandırmadaki ad"] | isaret=1,2,3 | bekle=text="Robot yapılandırması" -->
   <!-- SAY: Robotumuzdaki her cihazı Control Hub'daki adıyla listeye ekliyoruz. -->

Sonuç: Cihaz listeye eklenir. Blok listesinde **Actuators** > **DcMotor** altında cihazın adıyla bir
kategori çıkar (servolar **Servo** ya da **CRServo** altında, IMU **Sensors** > **IMU** altında).

## Cihazın adını değiştir

Ad İngilizce bir harfle (A-Z, a-z) ya da `_` ile başlar; yalnız İngilizce harf, rakam ve `_` içerir.
Türkçe harfler (ç, ğ, ı, İ, ö, ş, ü) ve boşluk kabul edilmez. Örneğin `sagMotor` olur, `sağMotor` olmaz.

1. Yan panelde **Robot yapılandırması** bölümünde cihazın ad kutusuna bas.
2. Kutudaki eski adı sil.
3. Yeni adı yaz, ör. `armMotor`.
4. <kbd>Enter</kbd>'a bas ya da kutudan çık.

Sonuç: O cihazı kullanan tüm bloklar yeni adı alır.

Ad kurala uymuyorsa **+ Cihaz ekle**'nin altında "Ad harfle başlamalı; yalnız harf, rakam ve _ olabilir."
yazar. Aynı ad listede varsa "Bu ad zaten var." yazar. İki durumda da kutuya eski ad geri gelir.

<!-- SAY: Cihaz adını değiştirince bloklardaki ad da kendiliğinden değişiyor. -->

## Cihazı kaldır {#cihazi-kaldir}

!!! warning "Dikkat"
    Cihazı kullanan bloklar alanda kalırsa, sayfa yeniden açılınca cihaz listeye kendiliğinden geri
    eklenir. Cihazı kalıcı olarak kaldırmak için onu kullanan blokları da sil ya da başka bir cihaza çevir.

1. Yan panelde **Robot yapılandırması** bölümünde kaldıracağın cihazın satırındaki **×**'e bas.
   Onu kullanan bloklar silinmez, üstlerinde uyarı simgesi çıkar.
2. Çalışma alanında uyarı simgeli bir bloğu seç.
3. <kbd>Delete</kbd>'e bas. Uyarı simgeli her blok için 2. ve 3. adımı tekrarla.

Sonuç: Cihaz listeden çıkar ve onu kullanan blok kalmaz. Sayfa yeniden açılınca da cihaz listeye geri
gelmez.

Blokları silmek yerine başka bir cihaza çevirmek için bkz.
[Uyarı simgeli blokları düzelt](#uyari-simgeli-bloklari-duzelt).

<!-- SAY: Robotta olmayan bir cihazı listeden kaldırıyoruz. -->

## Uyarı simgeli blokları düzelt {#uyari-simgeli-bloklari-duzelt}

Bir blok listede olmayan bir cihazı kullanıyorsa üstünde uyarı simgesi çıkar ve yanında İngilizce bir
açıklama balonu kendiliğinden açılır: "There is no ... named ... in the current robot configuration".
Simgeye basarak balonu kapatıp yeniden açabilirsin.

1. Balondaki cihaz türünü ve adını oku, ör. `DcMotor` ve `armMotor`.
2. Yan panelde **Robot yapılandırması** bölümünde **+ Cihaz ekle**'ye bas.
3. Yeni satırın türünü balondaki türe göre seç, ör. `DcMotor` için **Motor (DcMotor)**.
4. Ad kutusuna balondaki adı harf harf aynı yaz.
5. <kbd>Enter</kbd>'a bas ya da kutudan çık.

Sonuç: Uyarı simgesi ve balon kaybolur. Blok cihazı tanır.

Control Hub'da bu adla bir cihaz yoksa cihaz eklemek yerine bloktaki açılır listeden var olan bir cihazı
seç. Var olan bir cihazın adını balondaki ada da çevirebilirsin.

<!-- SAY: Uyarı simgesi bir cihazın listede olmadığını gösteriyor. -->

!!! note "Not"
    **.blk yükle** ile açtığın ya da Probot Blocks'tan yapıştırdığın programdaki cihazlar listeye
    kendiliğinden eklenir. **Örnek seç** ile örnek açınca liste tamamen örneğin cihazlarıyla değişir.

## Sorun mu var?

- **Kaldırdığın cihaz listeye geri geldi:** Onu kullanan bir blok alanda kalmış. Bkz.
  [Cihazı kaldır](#cihazi-kaldir).
- **Ad kutusuna eski ad geri geldi:** Ad kurala uymuyor ya da listede aynı ad var. Bkz.
  [Sorun giderme](sorunlar.md#ftc).
- **INIT'te cihaz bulunamadı hatası:** Blocks'taki bir ad Control Hub yapılandırmasındakinden farklı.
  Adları harf harf karşılaştır. Bkz. [Programı Control Hub'a yükle](ftc-control-hub-yukle.md).

## Sonraki adım

[Yeni FTC programı yaz](ftc-program-yaz.md)
