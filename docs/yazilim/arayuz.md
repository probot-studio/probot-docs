---
title: Arayüz
---

# Arayüz

## Bu Sayfada Ne Anlatıyoruz?
Web arayüzüyle robotu başlatma/durdurma akışını ve saha kenarı kullanım düzenini özetliyoruz. IP'ye erişim, joystick görünürlüğü ve Init/Start/Stop akışı temel odak.

## Giriş
Arayüz, robotun kumanda panelidir. Yenilenen düzen iki kolonlu “stack card” şablonu kullanır: solda maç kontrolü ve joystick kartları, sağda sistem logları ve telemetri yer alır. Üstteki yapışkan başlık (sticky header) mevcut fazı ve kısa açıklamayı her an gösterir.

## Kapsam ve Platformlar
Arayüz, modern bir internet tarayıcısı çalıştırabilen ve joystick bağlanabilen neredeyse her cihazda çalışır: Windows/macOS/Linux dizüstüler, Chromebook’lar ve USB‑OTG destekli telefon ya da tabletler. Joystick’i USB ile takabilir veya Bluetooth üzerinden eşleyebilirsiniz; önemli olan tarayıcının cihazı görmesidir. Ek yazılım kurmadan, yalnızca robotun Wi‑Fi ağına bağlanıp tarayıcıyı açarak işe başlamak hedefimizdir.

## Yarışma Düzeni (Saha Kenarı Senaryosu)
Maç öncesi küçük bir düzen kurarız. Sürücü, joystick ile saha çizgisinin hemen dışında durur; yanında ya da arkasında, dizüstü veya telefonla arayüzü takip eden ikinci bir kişi bulunur. Bu kişi gerekirse Init/Start/Stop gibi tuşlara basar, şüpheli bir durumda da hızlıca durdurur. Böylece sürücünün dikkati oyunda kalırken, teknik görevler güvenli bir şekilde paylaşılmış olur.

<figure markdown>
  <img src="/assets/images/ui.png" alt="Yenilenmiş driver station arayüzü" style="border-radius:12px; box-shadow:0 18px 36px rgba(0,32,77,0.25);">
  <figcaption>Yeni “minimal stack” arayüzünde maç kontrolü solda, Wi‑Fi logging ve sistem logları sağda.</figcaption>
</figure>

## Ağa Bağlanınca Hangi IP’ye Gidilir?
Robotun Wi‑Fi ağına bağlandıktan sonra tarayıcıya robotun IP adresini yazarsınız ve arayüz açılır. IP adresi, bağlanırken gösterilen bilgi ekranında veya seri monitörde görülebilir. Adres satırına sayı noktalarıyla yazılan kısa bir metin gibidir: örneğin 192.168.4.1. Bu adresi yazıp Enter’a bastığınızda ana sayfa gelir ve joystick ile kontrol akışına geçebilirsiniz.

## IP Adresi Analojisi
IP adresi, robotun bulunduğu sokağın ve kapı numarasının sayılarla yazılmış haline benzer. Yanlış sokağa girerseniz başka birine gidersiniz; doğru sokağı ve kapıyı yazdığınızda ise aradığınız kapıya ulaşırsınız. Tarayıcıya doğru IP’yi yazmak, robotun kapısını çalmak gibidir: içeride arayüz sizi bekler.

## Joystick Kartı ve Görselleştirme
“Joystick Check” kartı artık eksenleri iki boyutlu bir grid üzerinde gösterir, +/− yönleri için bir hedef noktası (joy-dot) kullanır ve butonları dairesel etiketlerle renklendirir. Bağlantı kurulmamışsa kart durumu kırmızı “Not Connected” satırıyla bildirir, kumanda etkinleştiğinde otomatik olarak “Connected” yazısı ve eksen/tuş listesi güncellenir. Sağdaki telemetri panelinde seçili gamepad’in ham eksen değerleri (`Axis 0: +0.42`) ve butonlara basıldığında dolan işaretler (●) gözlemlenebilir; böylece joystick izinlerini tarayıcı üstünden anlık doğrularız.

Kartta ayrıca “Press any controller button to activate” ipucu bulunur. Tarayıcı gamepad API’si arka planda bir tuşa basılmasını beklediği için robotu sahaya götürmeden önce bu küçük dokunuşu test edin.

## Wi‑Fi Logging Kartı
Sağ kolondaki **Wi‑Fi Logging** kartı, ESP32 üzerindeki logging yığınıyla haberleşir:

- **Durum hapı** (pill) renk değiştirerek robotun hotspot’una bağlanıp bağlanmadığınızı ve streaming’in açık olup olmadığını gösterir.
- Ağ adı, robot IP’si, bağlı istemci sayısı ve anlık gönderim hızı (KB/s) tek satırda özetlenir.
- `Start Logging / Stop Logging` düğmesi UDP yayınını açıp kapatır (arka planda `setWifiStreamingEnabled`).
- `Refresh`, `Clear` ve `Download` eylemleri sırasıyla `status/stream` endpoint’lerini yeniler, HTTP buffer’ını sıfırlar ve `probot_logs.txt` dosyasını indirir.
- Alt kısımda iki onay kutusu vardır: *Auto-refresh status* 4 saniyede bir sorgu atar, *Auto-scroll log* sistem loglarının son satırda kalmasını sağlar.

Kartın altında `Wi-Fi Log Stream` alanı bulunur; `loggingStream` HTTP aynasından gelen satırları gerçek zamanlı yazdırır. `Tail=200` parametresi son 200 girişi getirir; ihtiyaç halinde sorgudaki `tail` değeri düzenlenebilir.
Bu kartın topladığı verileri detaylı okumayı `Yazılım → Logging ve Telemetri` sayfasında ele alıyoruz; otonom konularından sonra bakmanız öğrenme ritmini kolaylaştırır.

## Init / Start Akışı ve Hızlı Test
Maç düzeni şöyle işler: Robot sahaya konur, herkes hazır olduğunda arayüzden “Init” tuşuna basılır. Bu komut, sistemi güvenli bir bekleme konumuna getirir; motorlar hareket etmez, yalnızca her şey yerli yerinde mi diye kontrol ederiz. Kartın üst kısmındaki `Autonomous Duration` alanı (varsayılan 30 s) ve `Autonomous` anahtarı (toggle) otonom fazın kaç saniye süreceğini belirler.

Hakem “Başla” dediğinde “Start”a basılır. Artık siz dokunmadan otonom bölüm kendi başına çalışır; süre dolunca sistem otomatik olarak sürücü kontrolüne (teleop) geçer. Bir fazdan diğerine geçmek için yeniden tuşa basmanız gerekmez. Sürücü, kumandayı bıraktığı yerden devam eder.

Karttaki “Autonomous Countdown” barı `start` komutundan sonra geriye doğru akar; `autoRemaining` değeri hem saniye olarak yazılır hem de bar doluluğuyla gösterilir. Sürücü “Stop”a bastığında bar sıfırlanır, başlık “Stopped” moduna döner.

“Stop”, acil durumda ya da maç bittiğinde robotu güvenle durdurur. Bu tuş, bütün tarafların aynı anda anlaşabileceği tek net komuttur; gerekli anlarda hızlıca kullanın.

Hızlı test için “Init” ve “Start” adımlarından sonra joystick kartında değer akışını, log panelinde ise `motor_controller`, `scheduler` veya kendi özel kaynaklarınızdan gelen satırları görürsünüz. Böylece bağlantı zincirinin tamamının (joystick → robot → logging → UI) çalıştığı doğrulanır.

## Güvenlik ve Sorumluluk Paylaşımı
Saha kenarında net bir sorumluluk paylaşımı işleri kolaylaştırır. Sürücü sadece oyuna odaklanır; ikinci kişi arayüzü izler, gerekirse “Stop” ile müdahale eder ve hakemle iletişimi takip eder. Maçtan önce “kim ne zaman hangi tuşa basacak?” sorusuna birlikte cevap verin; küçük bir konuşma, büyük karışıklıkları önler.

## Notlar ve İpuçları
Arayüz açıkken tarayıcı sekmesini kapatmayın; bağlantı koparsa veriler durur. Gecikme hissederseniz sayfayı yenileyin ve joystick izinlerini tekrar onaylayın. Wi‑Fi logging kullanımında, masaüstü güvenlik duvarları UDP broadcast’i engelleyebilir; yarışma öncesi whitelist oluşturun. Maç öncesi kısa bir prova yapmak, yarışma stresinde atlanabilecek küçük detayları şimdiden yakalamanızı sağlar.

## Sonraki Adımlar
Arayüz akışı oturduğunda robotu sahada güvenle başlatıp durdurabilir, testleri hızla tekrarlarsınız.

