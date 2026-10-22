# Probot Core

Probot Core, ESP32 kartında robotun WiFi ağını açan, tarayıcıda çalışan Driver Station'ı sunan ve kumanda verisini robota taşıyan Arduino kütüphanesidir.

Kütüphanenin Arduino IDE'deki adı `probot`. Bu sayfalar 0.4.0 sürümünü anlatır. 0.3.0 için yazılmış bir kodu taşımak için: [0.3.0 kodunu taşı](hooklari-yaz.md#gecis).

Kaynak kod: [github.com/probot-studio/probot-core](https://github.com/probot-studio/probot-core)

## Kimin için

- Probot kitini Arduino koduyla programlayan takımlar.
- Blocks'ta ürettiği `.ino` kodunu karta yükleyip robotu Driver Station'dan sürmek isteyenler. Blocks probot-core 0.3 için kod üretir; bu kodu 0.4.0'da derlemek için önce taşı: [0.3.0 kodunu taşı](hooklari-yaz.md#gecis).
- Otonom ve teleop bölümlerinden oluşan bir maça robot hazırlayan öğrenci ve öğretmenler.
- Robot kodunu yapay zekâ asistanıyla yazanlar: [Yapay zekâ asistanıyla kod yaz](yapay-zekayla-kod-yaz.md).

## Neyi yapar, neyi yapmaz

| Probot Core yapar | Probot Core yapmaz |
|---|---|
| Robotta bir WiFi erişim noktası açar. Ağın adını, şifresini ve kanalını kodda sen verirsin: [Robotun WiFi ayarlarını yap](wifi-ayarla.md). | Robotu okulun ya da evin WiFi ağına bağlamaz. Robot kendi ağını yayınlar. |
| Driver Station'ı robotun içinden sunar. Tarayıcıda `http://192.168.4.1` adresinden açılır: [Driver Station arayüzü](arayuz.md). | Telefona ya da bilgisayara uygulama kurdurmaz. İnternet de gerekmez. |
| Maçı yönetir: mod seçimi, Init, Start, otonom süresi, Stop ve acil durdurma: [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md). | Kumandayı robota doğrudan bağlamaz. Kumanda, Driver Station'ı açtığın cihaza bağlanır: [Kumanda verisini oku](kumandayi-oku.md). |
| Kumanda verisini robota taşır. Robot çalışmıyorken ya da bağlantı kesilince çubukları ve düğmeleri sıfırlar. | Motor ya da servo sınıfı vermez. Motoru ve servoyu kendi kodunla sürersin: [Motoru sür](motoru-sur.md), [Servoyu sür](servoyu-sur.md). |
| Kodundan Driver Station'daki **Telemetry** paneline yazı yazar. | Kodu derlemez, karta yüklemez. Bunu Arduino IDE yapar: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md). |
| Karttaki durum LED'ini maç durumuna göre yakar: [Durum LED'ini kullan](led-durumu.md). | LED'e elle renk verdirmez. LED'in rengi hep maç durumunu gösterir. |
| Bataryanın gerilimini ölçüp Driver Station'da gösterir. Ölçüm devresini sen kurarsın: [Batarya gerilimini ölç](bataryayi-olc.md). | Blok kodlama yapmaz. Bloklarla kod üretmek için: [Blocks](../blocks/index.md). |

## Nasıl çalışır {#nasil-calisir}

Robot açılınca kendi WiFi ağını yayınlar. Telefon, tablet ya da bilgisayar bu ağa bağlanır ve tarayıcıda Driver Station'ı açar. Kumanda da bu cihaza bağlanır; tarayıcı kumanda verisini WiFi üzerinden robota iletir.

Bir maç iki bölümden oluşur. **Otonom** bölümünde robot kumandasız, yalnız kodla hareket eder. **Teleop** bölümünde sürücü robotu kumandayla kontrol eder. Driver Station'da önce modu seçersin: **Autonomous** ya da **Teleoperated**. Sonra **Init**'e, ardından **Start**'a basarsın. Otonom süresi dolunca robot durur ve teleop seçili hâle gelir. Teleopu başlatmak için yeniden **Init**'e ve **Start**'a basarsın.

Kodda Arduino'nun `setup()` ve `loop()` fonksiyonları yazılmaz; onları kütüphane tanımlar. Sen bunların yerine her mod için üç fonksiyon yazarsın. Loop ve stop fonksiyonları zorunludur, içleri boş kalabilir. Init fonksiyonu isteğe bağlıdır.

| Fonksiyon | Ne zaman çalışır |
|---|---|
| `autonomousInit()` | **Autonomous** seçiliyken **Init**'e basınca, bir kez |
| `autonomousLoop()` | **Start**'tan sonra otonom boyunca, tekrar tekrar |
| `autonomousStop()` | Otonomdan her çıkışta, bir kez: **Stop**, süre sonu, bağlantı kopması, acil durdurma |
| `teleopInit()` | **Teleoperated** seçiliyken **Init**'e basınca, bir kez |
| `teleopLoop()` | **Start**'tan sonra teleop boyunca, tekrar tekrar |
| `teleopStop()` | Teleoptan her çıkışta, bir kez |

Loop fonksiyonu bitince kütüphane 20 ms bekler ve onu yeniden çağırır. Bu yüzden loop saniyede en çok 50 kez çalışır. Her mod için iki isteğe bağlı fonksiyon daha vardır: Init ile Start arasında tekrar çağrılan initLoop ve Start anında bir kez çalışan start. Ayrıntı: [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).

!!! warning "Dikkat"
    Bağlantı kopmalarının önemli bir kısmı koddan değil robotun donanımından gelir. Robotu kurmadan önce [Sinyal kalitesini artır](sinyali-iyilestir.md) sayfasını oku.

## Başla

- [İlk 10 dakika](ilk-10-dakika.md): ilk kodu yükle, robotun ağına bağlan, kumanda değerini ekranda gör.
- [Driver Station arayüzü](arayuz.md): her sekme, her düğme ve gösterge.
- [Hatalar ve sorun giderme](sorunlar.md): derleme hataları, bağlantı sorunları, LED renkleri.

## Kur

- [Arduino IDE'yi Probot için kur](arduino-ide-kur.md): ESP32 kart paketi, `probot` kütüphanesi ve bölümleme ayarı.
- [Robotun WiFi ayarlarını yap](wifi-ayarla.md): ağ adı, şifre ve kanal; kanalı kod yüklemeden değiştirme.
- [Sinyal kalitesini artır](sinyali-iyilestir.md): besleme, anten, kartın yeri ve yarışma günü kanal planı.

## Kodu yaz

- [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md): her modun init, loop ve stop fonksiyonları, maç akışı ve programın iskeleti.
- [Kumanda verisini oku](kumandayi-oku.md): çubuklar, düğmeler, ölü bölge ve kumanda eşlemesi.
- [Motoru sür](motoru-sur.md): tek motoru kumandayla ileri geri sür.
- [Şasiyi sür](sasiyi-sur.md): tank, arcade ve mecanum sürüş.
- [Servoyu sür](servoyu-sur.md): servoyu titremeden istediğin açıya götür.
- [Mekanizma ekle](mekanizma-ekle.md): konveyör, limit switch'li kol ve slider'ı ayrı sınıflar olarak ekle.

## Otonom

- [Otonomu yaz](otonom-yaz.md): robotu kumandasız, süreye ve adımlara göre hareket ettir.

## Donanım

- [Batarya gerilimini ölç](bataryayi-olc.md): batarya gerilimini Driver Station'da göster.
- [Durum LED'ini kullan](led-durumu.md): LED renklerinin anlamı ve ek sinyal lambası.

## Rehber

- [Örnek robotu baştan sona kodla](ornek-robotu-kodla.md): şasiden mekanizmalara bir robotun tam kodu.
- [Hatayı adım adım daralt](hatayi-daralt.md): çalışmayan robotta sorunu bulma yöntemi.
- [Yapay zekâ asistanıyla kod yaz](yapay-zekayla-kod-yaz.md): asistana Probot kurallarını öğretip kod yazdır.

## Başvuru

- [Ayar makroları](makro-listesi.md): `#include <probot.h>` öncesinde tanımlanan tüm makrolar ve varsayılanları.
- [Fonksiyon ve durum listesi](fonksiyon-listesi.md): kütüphanenin tüm fonksiyonları ve robot durumu alanları.

## Sözlük

| Terim | Anlamı |
|---|---|
| Driver Station | Robotun sunduğu, tarayıcıda açılan maç kontrol ekranı. Adresi `http://192.168.4.1`. |
| Erişim noktası (AP) | Robotun yayınladığı WiFi ağı. Adı SSID'dir. |
| SSID | Robotun WiFi ağının adı. `PROBOT_WIFI_AP_SSID` ile verilir. |
| Kanal | Robotun ağının yayın yaptığı 2,4 GHz kanalı, 1-13 arası. Yan yana çalışan robotlar farklı kanal kullanır. |
| Karşılama sayfası | Robotun ağına bağlanınca kendiliğinden açılan küçük sayfa (captive portal). **Driver Station'ı Aç** düğmesini taşır. |
| Makro | `#define` ile yazılan ayar satırı. Probot makroları `#include <probot.h>` satırından önce gelir. |
| Mod | Driver Station'da seçilen bölüm: **Autonomous** (otonom) ya da **Teleoperated** (teleop). Yalnız robot dururken değişir. Kodda OpMode adıyla geçer. |
| Hook | Kütüphanenin maçın belli bir anında çağırdığı fonksiyon, ör. `teleopLoop()`. Hata mesajlarında bu adla geçer. |
| Init | Seçili modu maça hazırlayan komut. Modun init fonksiyonu çalışır. Kumanda 0 okunur. |
| Start | Init'ten sonra seçili modu çalıştıran komut. Modun loop fonksiyonu tekrar tekrar çağrılır. |
| Stop | Çalışan ya da Init'teki modu durduran komut. O anki loop turu bitince modun stop fonksiyonu çalışır. |
| Otonom | Robotun kumandasız, yalnız kodla hareket ettiği bölüm. Süresi **Autonomous süresi** kutusunda yazar. |
| Teleop | Sürücünün robotu kumandayla kontrol ettiği bölüm. |
| Geçiş | Otonom süresi dolduktan sonraki bekleme. **Teleoperated** seçilidir; teleop **Init** ve **Start** ile başlar. Kodda `TRANSITION` adıyla geçer. |
| Acil durdurma | **Emergency Stop** düğmesi. Kodu anında keser, robotu yeniden başlatılana kadar kilitler. |
| Loop turu | Bir loop ya da initLoop fonksiyonunun bir kez çalışıp bitmesi. Bir tur 2 saniyeyi geçmemelidir. |
| Telemetri | Kodun `probot::printf` ile Driver Station'daki **Telemetry** paneline yazdığı yazılar. |
| Ölü bölge | Çubuğun ortasındaki küçük alan. Bu alandaki değerler 0 okunur; varsayılan 0,08. |
