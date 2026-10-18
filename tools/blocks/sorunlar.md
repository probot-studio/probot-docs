# Sorun giderme

Blocks'ta sık karşılaşılan sorunlar ve çözümleri. Sorununu burada bulamazsan [Hata bildir](hata-bildir.md)
ile yaz. Mesaja açık örneği, son bastığın düğmeyi ya da tuşu, ekrandaki yazının birebirini ve tarayıcını ekle.

## Önce durum göstergelerine bak {#durum-gostergeleri}

<!-- SAY: Bir sorun olduğunda önce ekranda hangi göstergenin çıktığına bakıyoruz. -->

| Gösterge | Anlamı | Ne yap |
|---|---|---|
| Turuncu bildirim kutusu, ör. "Blok projesi indirildi." | İş tamamlandı. Kutu 5 saniye sonra kaybolur. | Bir şey yapman gerekmez. |
| Kırmızı bildirim kutusu, ör. "Kopyalama başarısız oldu." | İş yapılamadı. Kutu 5 saniye sonra kaybolur. | Kutudaki yazıyı bu sayfadaki başlıklarda ara. |
| **Şifre (en az 8)** kutusunun çerçevesi koyu turuncu, altında "Şifre en az 8 karakter olmalı; yoksa kod derlenmez." | Şifre 1-7 karakter. | [Şifre en az 8 karakter olmalı](#sifre-en-az-8) |
| **Kod Önizleme**'de "// Henüz blok eklenmedi" | O yaşam döngüsü bloğu boş. | ["// Henüz blok eklenmedi" yazıyor](#henuz-blok-eklenmedi) |
| Soluk görünen blok | Blok devre dışı, koda girmez. | Bloğa sağ tıkla, **Bloğu Etkinleştir**'i seç. |
| FTC bloğunda "There is no ... named ..." uyarısı | Blok, **Robot yapılandırması**nda olmayan bir cihaz adı kullanıyor. | [Cihaz yapılandırmada yok](#cihaz-yapilandirmada-yok) |
| **Robot yapılandırması** listesinin altında "Bu ad zaten var." ya da "Ad harfle başlamalı; ..." | Yazdığın cihaz adı kabul edilmedi, kutuya eski ad geri geldi. | [Ad harfle başlamalı](#ad-harfle-baslamali), [Bu ad zaten var](#ad-zaten-var) |
| **OnBot Java** bölümünde "// Java üretilemedi: ..." | FTC Blocks bu programdan Java kodu üretemedi. | [Java üretilemedi](#java-uretilemedi) |

## Proje ve kayıt

<!-- SAY: Kayıtla ilgili sorunların çoğunu Blokları indir ile kalıcı dosya alarak önlüyoruz. -->

### Yenileyince başka proje geldi {#yenileyince-proje-degisti}

Sebep: Probot Blocks çalışmayı tarayıcıda çereze (yaklaşık 4 KB) kaydeder. Bu sınırı aşan proje uyarı
vermeden kaydedilmez; sayfa yenilenince bir önceki kayıt geri gelir. Bir örneği yükleyip hiç
değiştirmediysen o da kaydedilmez.

Çözüm: Kalıcı kayıt için projeyi `.probot.json` dosyasına indir.

!!! warning "Dikkat"
    Sayfayı yenilemeden ya da tarayıcıyı kapatmadan önce **Blokları indir** ile kaydet. Tarayıcıdaki
    kayıt uyarı vermeden eksik kalabilir.

1. Çalışmanı **Blokları indir** ile dosyaya kaydet.
2. Sayfayı yenile ya da tarayıcıyı kapatıp yeniden aç.
3. **Blokları yükle**'ye bas ve indirdiğin dosyayı seç.

Sonuç: Proje, indirdiğin hâliyle geri gelir.

Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md).

### Yenileyince proje adı ya da WiFi ayarı değişti {#yenileyince-ad-wifi-degisti}

Sebep: **Blokları yükle** ile açtığın dosyadaki proje adı, ağ adı, şifre ve kanal tarayıcıya
kaydedilmez. Örnek seçince gelen proje adı da kaydedilmez. Sayfa yenilenince önceki değerler gelir;
kayıtlı şifre yoksa Blocks yeni bir şifre üretir.

Çözüm: Yeniledikten sonra **Blokları yükle** ile aynı dosyayı yeniden aç. Değerlerin kalıcı olması için
**Proje** kutusuna ve **Robot WiFi** bölümündeki kutulara bir kez elle yaz. Elle yazdığın ya da listeden
seçtiğin değer tarayıcıya kaydedilir.

Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md#otomatik-kayit), [Robot WiFi ayarlarını yap](probot-wifi-ayarla.md).

### Örnek seçince programım silindi {#ornek-program-silindi}

Sebep: **Örnek seç** ve **Blokları yükle** açık programın yerine yenisini koyar ve onay sormaz.

Çözüm: Örnek seçmeden ya da dosya yüklemeden önce **Blokları indir** (Probot) ya da **.blk indir** (FTC)
ile kaydet. Probot modunda bu iş geri alınamaz, <kbd>Ctrl</kbd>+<kbd>Z</kbd> eski programı getirmez. Eski
programı ancak indirdiğin dosyayı **Blokları yükle** ile açarak geri getirebilirsin.

FTC'de blok alanına tıklayıp <kbd>Ctrl</kbd>+<kbd>Z</kbd>'ye (gerekirse iki kez) basarak eski blokları
geri getirebilirsin. <kbd>Ctrl</kbd>+<kbd>Z</kbd> yalnız blokları getirir: **Robot yapılandırması**,
**OpMode** adı, **Tür** ve **Grup** geri gelmez.

Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md), [Programı kaydet](ftc-programi-kaydet.md).

### "Blok projesi yüklenemedi." yazıyor {#blok-projesi-yuklenemedi}

| Sebep | Çözüm |
|---|---|
| Seçtiğin dosya `.probot.json` değil. | **Blokları indir** ile alınmış bir dosya seç. |
| Dosya bozuk ya da araçta olmayan bir blok içeriyor. | Dosyanın başka bir kopyasını dene. Yoksa [Hata bildir](hata-bildir.md) ile dosyayı anlat. |

Bkz. [Projeyi kaydet](probot-projeyi-kaydet.md).

### "Bu dosya bir FTC Blocks (.blk) dosyası değil." yazıyor {#blk-dosyasi-degil}

Sebep: FTC Blocks'ta **.blk yükle** yalnız `.blk` dosyası açar. `.java` dosyasını ya da Probot dosyasını
açamaz.

Çözüm: **.blk indir** ile alınmış bir `.blk` dosyası seç.

Bkz. [Programı kaydet](ftc-programi-kaydet.md#blk-ac).

## WiFi

<!-- SAY: WiFi şifresini elle yazarsak her seferinde aynı kalıyor. -->

### Robotun WiFi şifresi her yüklemede değişiyor {#wifi-sifresi-degisiyor}

Sebep: **Şifre (en az 8)** kutusuna hiç yazmadıysan Blocks her açılışta yeni bir şifre üretir. Otomatik
üretilen şifre tarayıcıya kaydedilmez.

Çözüm: Şifreyi bir kez elle yaz; sonra aynı kalır. **↻** (Yeni şifre üret) ile ürettiğin şifre de
saklanır. Dosyadan gelen şifre saklanmaz: [Yenileyince proje adı ya da WiFi ayarı değişti](#yenileyince-ad-wifi-degisti).

Bkz. [WiFi ayarla](probot-wifi-ayarla.md).

### "Şifre en az 8 karakter olmalı; yoksa kod derlenmez." yazıyor {#sifre-en-az-8}

Sebep: **Şifre (en az 8)** kutusunda 1-7 karakter var.

Çözüm: **Şifre (en az 8)** kutusuna en az 8 karakter yaz. Kutunun koyu turuncu çerçevesi ve uyarı yazısı
kalkar.

Kutu yalnız İngilizce harf, rakam ve `-` kabul eder; küçük harfleri büyük harfe çevirir. Türkçe harf
ve boşluk yazılmaz, bu yüzden karakter sayısı beklediğinden az kalabilir.

Bkz. [WiFi ayarla](probot-wifi-ayarla.md).

## Kod

<!-- SAY: Kod önizlemede bir şey eksikse önce blokların yaşam döngüsü bloğuna takılı olduğuna bakıyoruz. -->

### Koyduğum blok koda girmiyor {#blok-koda-girmiyor}

| Sebep | Çözüm |
|---|---|
| Blok bir yaşam döngüsü bloğunun (ör. **teleopLoop**) içine takılı değil. | Bloğu sürükleyip yaşam döngüsü bloğunun içine yerleşene kadar yaklaştır. |
| Blok soluk görünüyor, yani devre dışı. | Bloğa sağ tıkla ve **Bloğu Etkinleştir**'i seç. |

### "// Henüz blok eklenmedi" yazıyor {#henuz-blok-eklenmedi}

Sebep: **Kod Önizleme**'deki o yaşam döngüsü bloğu boş.

Çözüm: Bu bir hata değil; o bölümde robot bir şey yapmaz. O bölümde iş istiyorsan yaşam döngüsü bloğunun
içine blok tak.

### "Kopyalama başarısız oldu." yazıyor {#kopyalama-basarisiz}

Sebep: Tarayıcı panoya yazma izni vermedi.

Çözüm: Probot'ta **.ino indir** ile, FTC'de **.java indir** ile dosyayı indir.

Bkz. [Kodu al](probot-kodu-al.md), [Programı kaydet](ftc-programi-kaydet.md).

### Arduino IDE'de derleme hatası {#arduino-derleme-hatasi}

| Sebep | Çözüm |
|---|---|
| Kod Blocks'tan alındıktan sonra değiştirildi. | Kodu Blocks'tan yeniden al ve değiştirmeden yapıştır. |
| probot-core kütüphanesi kurulu değil. | Kütüphaneyi kur: [Karta yükle](probot-karta-yukle.md). |
| WiFi şifresi 8 karakterden kısa. | [Şifre en az 8 karakter olmalı](#sifre-en-az-8) |

Bkz. [Karta yükle](probot-karta-yukle.md).

## FTC

<!-- SAY: FTC tarafındaki sorunların çoğu cihaz adlarının uyuşmamasından çıkıyor. -->

### "There is no ... named ... in the current robot configuration" uyarısı {#cihaz-yapilandirmada-yok}

Sebep: Blok, **Robot yapılandırması**nda olmayan bir cihaz adı kullanıyor.

Çözüm: Cihazı aynı adla ekle ya da bloktaki listeden var olan bir cihazı seç.

Bkz. [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

### "Ad harfle başlamalı; yalnız harf, rakam ve _ olabilir." yazıyor {#ad-harfle-baslamali}

Sebep: Cihaz adı rakamla başlıyor ya da boşluk, Türkçe harf veya tire içeriyor. Kutuya eski ad geri gelir.

Çözüm: Harfle başlayan, yalnız harf, rakam ve `_` içeren bir ad yaz. Ör. `solMotor`.

Bkz. [Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

### "Bu ad zaten var." yazıyor {#ad-zaten-var}

Sebep: Yapılandırmada aynı adlı bir cihaz var.

Çözüm: Başka bir ad yaz.

### "Örnek yüklenemedi, bağlantı kesildi. Tekrar seç." yazıyor {#ornek-yuklenemedi}

Sebep: Örnek dosyası internetten tam inmedi.

Çözüm: İnternet bağlantını kontrol et ve örneği yeniden seç.

### "// Java üretilemedi: ..." yazıyor {#java-uretilemedi}

Sebep: FTC Blocks bu programdan OnBot Java kodu üretemedi. Hatanın kendisi yazının devamındadır.

Çözüm: Blok alanına tıkla ve son değişikliği <kbd>Ctrl</kbd>+<kbd>Z</kbd> ile geri al. Yazı kalkmazsa
**.blk indir** ile programı indir ve [Hata bildir](hata-bildir.md) ile yazıyı birebir gönder.

### Fare tekerleği kaydırmıyor, yakınlaştırıyor {#tekerlek-yakinlastiriyor}

Sebep: FTC Blocks'ta tekerlek yakınlaştırır.

Çözüm: Çalışma alanını kaydırmak için boş yeri sürükle.

Bkz. [Kısayollar](kisayollar.md).

### Sim programı görmüyor {#sim-programi-gormuyor}

Sebep: Blocks ile Sim aynı tarayıcıda açık değil.

Çözüm: Sim'i Blocks'u açtığın tarayıcıda aç. Başka tarayıcıdaysan **.blk indir** ile dosyayı al ve Sim'de
**.blk dosyası aç**'a bas.

Bkz. [Programı Sim'de dene](ftc-simde-dene.md).

## Ekran

<!-- SAY: Blocks bilgisayar için tasarlandı, telefonda yalnız göz atıyoruz. -->

### "Kodlama aracı geliştirme aşamasında" kartı her açılışta çıkıyor {#gelistirme-karti}

Sebep: Kart her girişte açılır.

Çözüm: **Anladım, devam et**'e basarak ya da <kbd>Esc</kbd> ile kapat.

### Telefonda bloklar sığmıyor {#telefonda-sigmiyor}

Sebep: Blocks bilgisayar için tasarlandı.

Çözüm: Telefonda göz atabilirsin ama program yazmak için bilgisayar kullan.
