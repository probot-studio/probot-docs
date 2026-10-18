# Hazır örnekle başla

Bu sayfada Probot Blocks'taki altı hazır örnekten birini açacaksın. Örnek, altı yaşam döngüsü bloğuyla
gelir ve işi yapan bloklar bunların içine takılıdır. Sıfırdan başlamak zorunda kalmazsın.

![Probot Blocks ekranı; Tank Sürüş örneği yüklü, Kod Önizleme'de kod görünüyor.](img/blocks-ilk-sonuc.png)
<!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=ornek:Tank Sürüş, Probot Blocks sekmesi | hedef=body | isaret=yok | bekle=text="Örnek: Tank Sürüş" -->
<!-- SAY: Örnek yüklenince bloklar ve kodu hazır olarak ekrana geliyor. -->

## Başlamadan önce

- Bilgisayar ve tarayıcı: [Ne gerekir](../index.md#ne-gerekir).
- Blocks açık. Bkz. [İlk 10 dakika](ilk-10-dakika.md).

## Örnek aç

!!! warning "Dikkat"
    Örnek, çalışma alanındaki projenin yerine geçer ve onay sormaz. Projeni korumak için önce
    **Blokları indir**'e bas. Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md).

1. Araç çubuğunda **Probot Blocks** sekmesine bas. **FTC Blocks** sekmesindeki **Örnek seç** FTC
   örneklerini açar: [Hazır FTC örneğiyle başla](ftc-ornekle-basla.md).
2. Araç çubuğunda **Örnek seç**'e bas.
3. "Probot örnekleri" penceresinde **Arcade Sürüş** kartını seç. Köşede "Arcade Sürüş örneği
   yüklendi." bildirimi çıkar ve 5 saniye sonra kaybolur.
   ![Probot örnekleri penceresi; Arcade Sürüş kartı 3 numarayla işaretli.](img/blocks-ornek-pencere.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/ | hazirla=Probot Blocks sekmesi, Örnek seç açık | hedef=role=dialog >> text="Arcade Sürüş" | isaret=3 | bekle=text="Probot örnekleri" -->
   <!-- SAY: Örnek seç penceresinde altı hazır program bizi bekliyor. -->

Sonuç: Örneğin blokları çalışma alanına gelir. Araç çubuğunda **Proje** kutusunda "Arcade Sürüş",
düğmede "Örnek: Arcade Sürüş" yazar.

## Örnek ara

1. **Probot Blocks** sekmesinde, araç çubuğunda **Örnek seç**'e bas. İmleç **Örnek ara...**
   kutusuna gelir.
2. Kutuya `servo` yaz. Listede **Servo Testi** kartı kalır.
3. **Servo Testi** kartını seç.

Sonuç: "Servo Testi örneği yüklendi." bildirimi çıkar. Araç çubuğunda düğme "Örnek: Servo Testi" yazar.

Arama, örneğin adında ve kartta yazan açıklamada arar, büyük ve küçük harfi ayırmaz. Eşleşme yoksa
liste yerine "Eşleşen örnek bulunamadı." yazar.

<!-- SAY: Aradığımız örneği adından ya da açıklamasından bulabiliyoruz. -->

Pencereyi örnek seçmeden kapatmak için **×**'e bas, pencere dışına tıkla ya da <kbd>Esc</kbd>'ye bas.
Pencere kapanınca arama kutusu boşalır.

## Hangi örnek ne yapar

| Örnek | Ne yapar | Dolu bloklar |
|---|---|---|
| **Tank Sürüş** | İki motor, iki çubuk: sol çubuk sol motoru, sağ çubuk sağ motoru sürer. | **robotInit**, **robotEnd**, **teleopLoop** |
| **Arcade Sürüş** | Sol çubuk ileri/geri, sağ çubuk dönüş. **hassas güç** bloğu düşük hızda ince kontrol sağlar. | **robotInit**, **robotEnd**, **teleopLoop** |
| **Kumanda Testi** | Sol çubuğun Y değerini "sol Y", sağ çubuğun X değerini "sag X" satırıyla telemetriye yazar. **A** düğmesine basınca "A basili!" yazar. | **teleopLoop** |
| **Servo Testi** | **A** düğmesi servoyu 0 dereceye, **B** düğmesi 180 dereceye götürür. | **robotInit**, **robotEnd**, **teleopLoop** |
| **Otonom: İleri Git ve Dur** | Otonom başlayınca iki motoru 0.4 güçle sürer, 2 saniye sonra durdurur. Süreyi **geçen süre (ms)** bloğuyla ölçer. | **robotInit**, **robotEnd**, **autonomousInit**, **autonomousLoop** |
| **Robot Durumu** | Pil gerilimini "pil (V)", bağlı istemci sayısını "istemci" satırıyla telemetriye yazar. | **teleopLoop** |

Örneklerde **motor tanımla** blokları sol motoru RPWM 16 ve LPWM 17, sağ motoru 18 ve 19 pinine bağlar.
Sağ motorda **ters** işaretlidir. **servo tanımla** bloğu servoyu pin 4, LEDC kanal 7'ye bağlar.

Robotunda kablolar farklıysa bu iki bloktaki pin sayılarını değiştir.

<!-- SAY: Her örnek farklı bir işi gösteriyor, sürüşten servoya ve otonoma kadar. -->

## Değiştirdiğin örneği kaydet

!!! warning "Dikkat"
    Tarayıcı, yüklenen örneği sen bir bloğu değiştirene kadar kaydetmez. Bu arada sayfayı yenilersen
    önceki proje geri gelir. Tarayıcıdaki kayıt yaklaşık 4 KB ile sınırlıdır, aşan proje uyarı vermeden kaydedilmez.

1. Araç çubuğunda **Proje** kutusundaki örnek adını sil.
2. Kutuya kendi proje adını yaz, ör. `Takım Arcade`.
3. Araç çubuğunda **Blokları indir**'e bas.

Sonuç: "Blok projesi indirildi." bildirimi çıkar. İndirilenler klasörüne `takim-arcade.probot.json`
dosyası gelir.

<!-- SAY: Değiştirdiğimiz örneği kendi adımızla bilgisayarımıza kaydediyoruz. -->

## Sorun mu var?

- **"Örnek yüklenemedi." yazısı çıktı:** Sayfayı yenile ve örneği yeniden seç.
- **Yenileyince başka bir proje geldi:** Bkz. [Sorun giderme](sorunlar.md#yenileyince-proje-degisti).
- **"Eşleşen örnek bulunamadı." yazıyor:** Arama kutusundaki sözcük hiçbir örneğin adında ya da açıklamasında yok. Kutuyu temizle ve listeye bak.
- **Örnek seçince programım silindi:** Bkz. [Sorun giderme](sorunlar.md).

## Sonraki adım

[Kodu kopyala ya da indir](probot-kodu-al.md)
