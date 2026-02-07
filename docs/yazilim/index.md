---
title: Yazılım
---

# Yazılım

## Bu Sayfada Ne Anlatıyoruz?
Yazılım bölümüne genel bir giriş yapıyor, robotta yazılımın rolünü, bölüm kapsamını ve ESP32‑S3/Arduino tercihlerini özetliyoruz.

## Yazılım Robotta Ne İşe Yarar?
Yazılım robotun beyni gibidir; mekanikte kurduğunuz "vücuda" aklı burada katarsınız. Hedefler net komutlara dönüşür, sensörlerden gelen bilgiler karara ve güvenli harekete evrilir. Sahada tutarlılık, emniyet ve görünürlük yazılımla mümkün olur.

## Yazılım Neden Önemlidir?
İyi yazılım sessizdir ve robotlarda genelde fark edilmez, fakat kötü yazılıma sahip bir robotu fark etmek zor değildir. Robotun takılmadan düzgün hareket etmesini yazılım sağlar, görevleri verimli ve stabil bir şekilde tamamlayabilmek için iyi bir yazılım şarttır.

Robot üzerinde mekanik değişiklikler yapmak yazılımsal değişiklik yapmaya göre daha zordur, parçaların sökülüp baştan montajlanması ya da baştan üretilmesi gerekebilir. Bundan dolayı robotunuz bir görevi tamamlamada sıkıntı çekiyorsa yazılımı değiştirmek daha mantıklıdır.

Robotunuzu olabildiğince hızlı bitirip test ve yazılım aşamasına geçmek stabil bir robot için inanılmaz önemlidir. Robotunuz stabilitesi yarışmayı kazanmak ile sonuncu olmak arasındaki fark olabilir. Stabil bir robot için de kusursuz bir yazılım şarttır.

## Yazılım Bölümü Neleri İçerir?
- **Kurulum:** IDE, kart ve port ayarları; ilk seri çıktı ile bağlantıyı doğrulama.
- **Robot Yaşam Döngüsü:** Fazlar (init, autonomous, teleop) ve geçişler.
- **Global Ayarlar:** WiFi parolası ve temel yapılandırma.
- **Joystick API:** Kumandadan eksen ve buton okuma.
- **Robot Bağlantısı:** Kodu yükleme, WiFi ağına bağlanma.
- **Arayüz:** Driver station web arayüzü ve maç akışı.
- **Otonom Başlangıç:** Durum makinesiyle kısa senaryo yürütme.
- **Telemetry:** WiFi üzerinden canlı veri izleme.

## Kütüphane Tasarım Seçimleri

### ESP32‑S3
Kütüphanenin tabanını ESP32‑S3 yapmamızdaki sebepler, performans açıdan çok daha üstün olması, çok daha ucuz olması, içinde WiFi bulundurması ve çift çekirdekli olması.

Kütüphanemiz şu anda sadece ESP32‑S3 üzerinde test ediliyor fakat zamanla diğer ESP'lerin desteği de eklenecektir.

### Arduino altyapısı
Kütüphanede Arduino altyapısını tercih etmemizin nedeni, yarışmada ilk günden "çalışır" bir deneyim vermek. Bu ekosistem ekiplerin elini güçlendiriyor ve masrafı düşürüyor.

#### Arduino IDE
Yarışma için hızlı ve anlaşılır bir arayüz sunuyor. Her okul bilgisayarında kolayca kurup derleyip karta yükleyebilin diye kütüphanemizi Arduino IDE ile uyumlu tuttuk.

#### Arduino Forumları
Yarışmamız yeni, ama birçok sorun yeni değil. Çoğu hata ve soru yıllardır Arduino Forumları'nda konuşuldu. Kütüphaneyi bu bilgi birikiminden faydalanabilecek şekilde kurguladık.

#### Arduino Dokümanları
Resmi dökümanlar kısa ve net; biz de örneklerimizi ve isimlendirmeyi onlarla uyumlu tuttuk. Böylece "bu fonksiyon ne yapıyor?" sorusunun cevabı tek sayfada, anlaşılır biçimde bulunuyor.

#### Arduino Kütüphaneleri
Geniş bir sensör ve sürücü havuzu sağlıyor. Biz ekosistem kısıtı koymuyoruz: Perpa'dan 100 TL'ye alabileceğiniz bir sensör için bile çoğu zaman hazır bir kütüphane bulursunuz. Kütüphane tasarımımız bu esnekliği bilerek destekliyor.
