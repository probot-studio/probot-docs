---
baslik: "Robotu, programı ve cihazları seç"
ust: "Probot Studio · Sim · Sunum 4"
alt: "Hazır robot, Builder projesi, dosya, sürüş önü, OpMode, yapılandırma"
sure: 8
muaf: "odev (araç tanıtımı, ödev yok)"
kaynak: "tools/sim/robotu-sec.md, tools/sim/programi-sec.md, tools/sim/cihazlari-porta-bagla.md"
---

# Hoca hazırlığı

## Bu derste

Bu bir ders değil, Sim kullanım dokümanının Robotu seç, Programı seç ve Cihazları porta bağla sayfalarından üretilmiş araç tanıtımı. Sunum videoya dökülür, seslendirilen metin sayfa notlarındaki Söyle satırlarıdır. İzleyen kişi sonunda kendi robotunu ve programını Sim'e getirir ve koddaki cihazları robottaki portlara bağlar.

## Dersten önce

- Canlı anlatılacaksa aynı tarayıcıda Builder ve Blocks da açılabilir olsun.
- Ekran görüntüleri prod'dan alınmış örnek görsellerdir, aynı adla yenilenir.

## Zaman planı

Her sayfa yaklaşık yarım dakika, toplam 8 dakika. Ödev yok.

# Sayfalar

## Robotu, programı ve cihazları seç {kapak sure=0.5}

![](img/sim-arayuz-ana.png)

::: hoca
**Söyle:** "Bu sunumda Sim'e robot ve program getiriyoruz. Hazır robot, Builder projesi ya da dosya seçiyor, sürüş önünü ayarlıyor, programı seçiyor ve koddaki cihazları robottaki portlara bağlıyoruz."
:::

## Hazır robot seçiyoruz {sure=0.5}

- **Robot** bölümünde **Kaynak** listesi
- Hazır robotlar Builder'ın şablonları
- Özette ad, sürüş türü, motor ve servo sayısı

![](img/sim-robot-hazir.png)

::: hoca
**Söyle:** "Ana sayfadaki Robot bölümünde Kaynak listesinden bir robot seçiyoruz. Hazır robotlar Builder'ın şablonları, listede Starter Bot, Omni şasi ve NFR ile WattOS şasileri var. Seçince bölüm başlığının altındaki özette robotun adı, sürüş türü, motor ve servo sayısı yazıyor."
:::

## Önce robot, sonra program {sure=0.5}

- Hazır robota basınca örnek program o robota uyar
- Kendi programın seçiliyse program değişmez
- Bu yüzden önce robot seçilir

![](img/sim-program-ornek.png)

::: hoca
**Söyle:** "Örnek bir program seçiliyken bir hazır robota basarsak, seçili olana bile, program o robotun örneğine dönüyor. Kendi açtığımız ya da Blocks'tan gelen program ise değişmiyor. Bu yüzden önce robotu, sonra programı seçiyoruz."
:::

## Builder'daki robot {sure=0.5}

- Builder ve Sim aynı tarayıcıda
- **Kaynak** listesinde "Builder" rozetli satır
- Builder'da değişince Sim yeniden okur
- Boş proje listeye gelmez

![](img/sim-robot-builder.png)

::: hoca
**Söyle:** "Araç çubuğundaki Builder bağlantısıyla Builder'ı yeni sekmede açıp robotumuzu kuruyoruz. Sim sekmesine dönünce Kaynak listesinde Builder rozetli bir satır görüyoruz, açıklamasında Builder'da açık proje ve parça sayısı yazıyor. Builder'da robotu değiştirdikçe Sim onu yeniden okuyor."
:::

## Proje dosyası açıyoruz {sure=0.5}

- **Proje dosyası aç**
- Builder'dan indirilen `.json` dosyası
- Listede "dosya" rozetiyle seçilir
- Tek dosya robotu durur, yenileyince gider

![](img/sim-robot-dosya-ac.png)

::: hoca
**Söyle:** "Başka bir bilgisayarda kurulan robotu Builder'ın indirdiği json dosyasıyla açıyoruz. Proje dosyası aç düğmesine basıp dosyayı seçince robot dosya rozetiyle listeye ekleniyor. Listede aynı anda tek bir dosya robotu duruyor ve sayfayı yenileyince gidiyor."
:::

## Sürüş önünü ayarlıyoruz {sure=0.5}

- **Builder'daki ön** ya da **Arka taraf**
- Robot ters gidiyorsa değiştirilir
- Starter Bot'ta **Arka taraf**, shooter önde
- Ayar her robot için ayrı saklanır

![](img/sim-robot-surus-onu.png)

::: hoca
**Söyle:** "Robot sahada ters gidiyorsa Sürüş önü seçicisinde Builder'daki ön ya da Arka taraf seçeneğini değiştiriyoruz. Sürüş önü, sol çubuk ileriyken robotun hangi tarafının önde gittiği demek. Starter Bot'ta Arka taraf seçili geliyor ve robot shooter önde sürülüyor."
:::

## Robot notları {gorsel-sol sure=0.5}

- Sim'in kendi tamamladığı eksikler
- **Robot** bölümünün altında madde madde
- Bilgi içindir, bir şey yapılmaz

![](img/sim-ilk-otonom.png)

::: hoca
**Söyle:** "Sim robotu sahaya koyarken bazı eksikleri kendisi tamamlıyor ve bunları Robot bölümünün altında madde madde yazıyor. Starter Bot'ta eklemlerin kendiliğinden kurulduğu ve motor oranlarının nasıl sayıldığı yazıyor. Bu notlar bilgi için, bir şey yapmamız gerekmiyor."
:::

## Örnek program seçiyoruz {sure=0.5}

- **Kod** bölümünde **OpMode** listesi
- Altı örnek program
- Her satırda "Otonom" ya da "TeleOp" rozeti
- Özette programın adı ve türü

![](img/sim-program-ornek.png)

::: hoca
**Söyle:** "Kod bölümündeki OpMode listesinde Sim'in altı örnek programı var. Starter Bot için otonom ve TeleOp örnekleri, şasiler için TeleOp örnekleri duruyor. Bir program seçince bölüm başlığının altındaki özette adı ve türü yazıyor."
:::

## Blocks'taki programı getiriyoruz {sure=0.5}

- **Blocks'ta yaz** Blocks'u yeni sekmede açar
- Program **FTC Blocks** sekmesinde yazılır
- Listenin başında "Blocks'ta açık FTC projesi"
- Programda **runOpMode** bloğu olmalı

![](img/sim-program-blocks.png)

::: hoca
**Söyle:** "Kod bölümündeki Blocks'ta yaz düğmesi Blocks'u yeni sekmede açıyor. Programımızı FTC Blocks sekmesinde yazıp Sim'e dönünce OpMode listesinin başında Blocks'ta açık FTC projesi satırını görüyoruz. Program listeye ancak içinde runOpMode bloğu varsa geliyor."
:::

## .blk dosyası açıyoruz {sure=0.5}

- **.blk dosyası aç**
- Program listenin sonuna eklenir ve seçilir
- Tek dosya programı durur
- Probot Blocks `.ino` dosyası açılmaz

![](img/sim-program-blk-ac.png)

::: hoca
**Söyle:** "Blocks'tan indirdiğimiz blk dosyasını .blk dosyası aç düğmesiyle açıyoruz. Program dosyanın adıyla listenin sonuna ekleniyor ve seçiliyor. Sim yalnız FTC Blocks programlarını çalıştırıyor, Probot Blocks'un ino dosyaları burada açılmıyor."
:::

## Hangi bloklar çalışır {sure=0.5}

- Motor, servo, sürekli servo, IMU
- Motor enkoderi okunur
- Mesafe, renk, dokunma sensörü yok
- myBlocks çalışmaz

![](img/sim-program-sonuc.png)

::: hoca
**Söyle:** "Sim motor, servo, sürekli servo ve Control Hub IMU bloklarını çalıştırıyor, motor enkoderini de okuyor. Mesafe, renk ve dokunma sensörü blokları Sim'de bulunmuyor. Sim'in çalıştıramadığı bir blokta program duruyor ve Driver Station'da o bloğun adı yazıyor."
:::

## Yapılandırma tablosu {sure=0.5}

- Solda koddaki ad ve tür
- Sağda robottaki donanım ve port
- Sürüş tekerini çeviren motorda "teker"
- IMU satırı hep Control Hub IMU

![](img/sim-cihazlari-sonuc.png)

::: hoca
**Söyle:** "Gerçek robotta cihazları Driver Station'daki yapılandırma bağlıyor, Sim'de bu işi Yapılandırma tablosu yapıyor. Solda koddaki ad, sağda bağlı olduğu donanım ve port yazıyor. Sim aynı adlı donanımı, adında left ya da right geçen motorları da sol ve sağ tekerlere kendisi bağlıyor."
:::

## Eşleşmeyen cihazı bağlıyoruz {sure=0.5}

- Hazırlık listesinde sarı uyarı
- Açık sarı satır bağlı değil
- Listeden doğru motor ya da servo seçilir
- Sürüş motorlarında sonu "teker" olan

![](img/sim-yapilandirma-eksik.png)

::: hoca
**Söyle:** "Eşleşmeyen cihaz varsa hazırlık listesinde sarı bir uyarı çıkıyor ve tablodaki satır açık sarı görünüyor. Satırın sağındaki listeyi açıp robottaki doğru motoru ya da servoyu seçiyoruz, sürüş motorları için sonunda teker yazanları seçiyoruz. Robotta boş servo yoksa servo satırı sarı kalıyor, o zaman programa uygun robotu seçiyoruz."
:::

## Yanlış bağlantıyı düzeltiyoruz {sure=0.5}

- Robot ters ya da beklenmedik hareket ediyorsa
- Satırın listesinden doğru donanım
- Otonom kendiliğinden yeniden koşar
- Bağlantılar bu tarayıcıda saklanır

![](img/sim-yapilandirma-duzelt.png)

::: hoca
**Söyle:** "Sim'in kendi kurduğu bağlantı her zaman doğru olmuyor. Robot ters ya da beklenmedik hareket ediyorsa yanlış bağlı satırın listesinden doğru donanımı seçiyoruz. Çalışma alanındaysak otonom program yeni bağlantıyla kendiliğinden yeniden koşuyor."
:::

## Özet ve sıradaki sunum {gorsel-sol sure=0.5}

- Hazır robot, Builder projesi, `.json` dosyası
- Örnek program, Blocks programı, `.blk` dosyası
- Yapılandırma tablosunda her cihaz bağlı

![](img/sim-arayuz-ana.png)

::: hoca
**Söyle:** "Bu sunumda hazır robot, Builder projesi ve dosya ile robot seçtik, sürüş önünü ayarladık, programı seçtik ve cihazları porta bağladık. Sıradaki sunumda sahayı ve başlangıç yerini seçiyor, otonomu çalıştırıp kaydını inceliyoruz."
:::
