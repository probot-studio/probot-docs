---
baslik: "Sahayı seç, otonomu çalıştır"
ust: "Probot Studio · Sim · Sunum 5"
alt: "Saha, başlangıç yeri, otonom koşusu, kaydı incelemek"
sure: 7
muaf: "odev (araç tanıtımı, ödev yok)"
kaynak: "tools/sim/sahayi-ayarla.md, tools/sim/otonomu-calistir.md"
---

# Hoca hazırlığı

## Bu derste

Bu bir ders değil, Sim kullanım dokümanının Sahayı ve başlangıç yerini seç ile Otonomu çalıştır sayfalarından üretilmiş araç tanıtımı. Sunum videoya dökülür, seslendirilen metin sayfa notlarındaki Söyle satırlarıdır. İzleyen kişi sonunda sahayı ve başlangıç yerini seçer, otonomu koşturur ve kaydını inceler.

## Dersten önce

- Canlı anlatılacaksa Sim'de Starter Bot ve Starter Bot otonom (CRServo) seçili olsun.
- Ekran görüntüleri prod'dan alınmış örnek görsellerdir, aynı adla yenilenir.

## Zaman planı

Her sayfa yaklaşık yarım dakika, toplam 7 dakika. Ödev yok.

# Sayfalar

## Sahayı seç, otonomu çalıştır {kapak sure=0.5}

![](img/sim-ilk-otonom.png)

::: hoca
**Söyle:** "Bu sunumda robotun koşacağı sahayı ve robotun sahadaki ilk yerini seçiyoruz. Sonra otonom programı çalıştırıyor, kaydını ileri geri sararak inceliyor ve otonomu temiz bir şekilde baştan başlatmayı görüyoruz."
:::

## Dört saha {sure=0.5}

- **FTC sahası (boş)**
- **Deneme sahası (engel bulunan)**
- **BIOBUZZ 2026-27 (maç başı)**, varsayılan
- **BIOBUZZ antrenman (zeminde nektar)**

![](img/sim-saha-sec.png)

::: hoca
**Söyle:** "Oyun bölümünde Tek başına oyun türü seçiliyken Saha listesinde dört saha var. Boş FTC sahasını rota denemesinde, üç engelli deneme sahasını çarpışma denemesinde kullanıyoruz. BIOBUZZ maç başı sahası varsayılan saha, antrenman sahasında ise zemine yirmi dört oyun elemanı daha eklenmiş."
:::

## Sahada 2B ve 3B farkı {sure=0.5}

- **Detaylı · 3B**'de robot oyun elemanlarını iter
- Üst hücreye yeterince eleman girince HIVE devrilir
- **Hızlı · 2B**'de HIVE ve FLOWER sabit
- Sahaya eleman eklenip silinemez

![](img/sim-saha-sonuc.png)

::: hoca
**Söyle:** "Detaylı 3B görünümde robot oyun elemanlarını itebiliyor ve HIVE'ın üst hücresine yeterince eleman girince HIVE kendiliğinden devriliyor. Robot HIVE'ı iterek deviremiyor. Hızlı 2B görünümde HIVE ve FLOWER sabit kalıyor, yalnız zeminde başlayan elemanlar itiliyor."
:::

## Hazır başlangıç yeri {sure=0.5}

- Beş hazır düğme
- Kırmızı ve mavi, seyirci ya da ittifak duvarı
- **Saha ortası**
- Seçilen düğme koyulaşır

![](img/sim-saha-baslangic.png)

::: hoca
**Söyle:** "Başlangıç yeri satırında beş hazır düğme var. Dördü robotu kırmızı ya da mavi ittifakın seyirci ya da ittifak duvarına, biri saha ortasına koyuyor. Bir düğme seçince düğme koyulaşıyor ve x, y ve yön kutuları onun değerlerini gösteriyor. Başlat'a basınca robot sahada bu yerden başlıyor."
:::

## Başlangıç yerini elle giriyoruz {sure=0.5}

- Saha 144 × 144 inç, ortası (0, 0)
- **x** ve **y** inç, kenarlar -72 ile 72
- **yön** derece, oklarla 15'er derece
- 2B'de imlecin yeri köşede yazar

![](img/sim-saha-elle.png)

::: hoca
**Söyle:** "Sahanın ortası sıfır sıfır noktası ve saha her yöne yetmiş iki inç uzanıyor. x ve y kutularına yeri inç olarak, yön kutusuna derece olarak yazıyoruz, kutunun oklarıyla yön on beşer derece değişiyor. 2B sahnede fareyi gezdirince köşede imlecin yeri yazıyor, bu değeri kutulara yazabiliyoruz."
:::

## Çalışma alanında saha {sure=0.5}

- Sol panellerde **Saha** sekmesi
- Ana sayfadaki seçimlerin aynısı
- Otonom kendiliğinden yeniden koşar
- TeleOp sürerken değişirse sürüş sıfırlanır

![](img/sim-saha-panel.png)

::: hoca
**Söyle:** "Çalışma alanında sol panellerdeki Saha sekmesi ana sayfadaki Oyun bölümünün aynı seçimlerini taşıyor. Sahayı ya da başlangıç yerini burada değiştirince otonom kendiliğinden yeniden koşuyor. TeleOp sürerken değiştirirsek sürüş duruyor ve sıfırlanıyor."
:::

## Saha notu {sure=0.5}

- Yalnız BIOBUZZ sahalarında
- Sahnenin köşesinde açılır kutu
- Hangi ölçünün yaklaşık olduğunu yazar

![](img/sim-saha-notu.png)

::: hoca
**Söyle:** "BIOBUZZ sahalarında sahnenin köşesinde Saha notu kutusu duruyor. Kutuya basınca ölçülerin kılavuzdan geldiği ve hangilerinin yaklaşık olduğu yazıyor. Kutuya yeniden basınca kapanıyor."
:::

## Otonomu başlatıyoruz {gorsel-alt sure=0.5}

- "Otonom" rozetli program
- Alt şeritte **Başlat**
- Sim önce hesaplar, hesap sürerken oynatır
- Düğme **Yeniden çalıştır** olur

![](img/sim-otonom-baslat.png)

::: hoca
**Söyle:** "Otonom rozetli bir program seçip alt şeritteki Başlat düğmesine basıyoruz. Sim önce hareketi hesaplıyor ve hesap sürerken kaydı oynatmaya başlıyor. Koşu bitince rozet Bitti oluyor ve araç çubuğundaki düğme Yeniden çalıştır'a dönüyor."
:::

## Otonom kendiliğinden yeniden koşar {gorsel-alt sure=0.5}

- Program, saha, başlangıç yeri değişince
- Görünüm, motor değeri, yapılandırma değişince
- **Simülasyon** > **Yeniden çalıştır**

![](img/sim-arayuz-menu-simulasyon.png)

::: hoca
**Söyle:** "Çalışma alanında programı, sahayı, başlangıç yerini, görünümü, motor değerlerini ya da yapılandırmayı değiştirince otonom kendiliğinden yeniden koşuyor. Elle baştan koşturmak için Simülasyon menüsünden Yeniden çalıştır komutunu da seçebiliyoruz."
:::

## Kaydı inceliyoruz {sure=0.5}

- ▶ oynatır, ❚❚ duraklatır
- **Zaman** kaydırıcısıyla bir ana gidilir
- **Oynatma hızı** yalnız izleme hızı
- **Driver Station** o anın telemetrisi

![](img/sim-otonom-zaman.png)

::: hoca
**Söyle:** "Zaman çizelgesindeki oynat düğmesiyle kaydı izliyor, kaydırıcıyı sürükleyerek istediğimiz ana gidiyoruz. Oynatma hızını çeyrek hıza kadar düşürebiliyoruz, bu robotun hareketini değil izleme hızını değiştiriyor. Driver Station o andaki telemetri satırlarını gösteriyor."
:::

## Bilgi satırı {gorsel-sol sure=0.5}

- "OpMode 30.0 sn sürdü"
- "Çarpışma …" ve "Hesap … ms"
- 3B'de BIOBUZZ'da HIVE devrilme sayısı
- "Robot duvara ya da engele değiyor"

![](img/sim-ilk-otonom.png)

::: hoca
**Söyle:** "Koşu bitince zaman çizelgesinin altında programın kaç saniye sürdüğü, robotun kaç ayrı kez bir şeye çarptığı ve Sim'in hesabı kaç milisaniyede yaptığı yazıyor. Detaylı 3B görünümde BIOBUZZ sahalarında HIVE'ların kaç kez devrildiği de yazıyor."
:::

## Durdur, Sıfırla, Çalıştır {gorsel-alt sure=0.5}

- **Durdur** hesabı ya da oynatmayı keser
- Koşu bittiyse **Durdur** soluktur, atlanır
- **Sıfırla** kaydı siler, robot başa döner
- **Çalıştır** otonomu baştan koşar

![](img/sim-otonom-sifirla.png)

::: hoca
**Söyle:** "Hesap ya da oynatma sürüyorsa önce Durdur düğmesine basıyoruz. Koşu bittiyse Durdur soluk kalıyor, doğrudan Sıfırla ile devam ediyoruz. Sıfırla kaydı siliyor, saati sıfıra alıyor ve robotu başlangıç yerine koyuyor, ardından Çalıştır otonomu baştan koşturuyor."
:::

## Özet ve sıradaki sunum {gorsel-sol sure=0.5}

- Saha ve başlangıç yeri seçildi
- Otonom koştu, kayıt incelendi
- Durdur, Sıfırla, Çalıştır ile baştan

![](img/sim-gorunum-sonuc.png)

::: hoca
**Söyle:** "Bu sunumda sahayı ve başlangıç yerini seçtik, otonomu çalıştırıp kaydını inceledik ve otonomu baştan başlatmayı gördük. Sıradaki sunumda TeleOp ile robotu kendimiz sürüyor, görünümü ve kamerayı değiştiriyoruz."
:::
