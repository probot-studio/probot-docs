---
title: Yazılım
---

# Yazılım

## Yazılım Robotta Ne İşe Yarar?
Yazılım robotun beyni gibidir; mekanikte kurduğunuz “vücuda” aklı burada katarsınız. Hedefler net komutlara dönüşür, sensörlerden gelen bilgiler karara ve güvenli harekete evrilir. Sahada tutarlılık, emniyet ve görünürlük yazılımla mümkün olur.

Duyularımız çevreyi anlamamızı nasıl sağlıyorsa, robot da sensörlerinden aldığı verilerle yönünü bulur. Yazılım bu verileri anlaşılır hale getirir ve davranışa çevirir: “Önünde engel var, yavaşla”, “sağa kaydın, düzelt”, “kol sınırda, dur”.

## Yazılım Neden Önemlidir?
İyi yazılım sessizdir ve robotlarda genelde fark edilmez, fakat kötü yazılıma sahip bir robotu fark etmek zor değildir. Robotun takılmadan düzgün hareket etmesini yazılım sağlar, görevleri verimli ve stabil bir şekilde tamamlayabilmek için iyi bir yazılım şarttır.

Robot üzerinde mekanik değişiklikler yapmak yazılımsal değişiklik yapmaya göre daha zordur, parçaların sökülüp baştan montajlanması ya da baştan üretilmesi gerekebilir. Bundan dolayı robotunuz bir görevi tamamlamada sıkıntı çekiyorsa yazılımı değiştirmek daha mantıklıdır. 

Robotunuzu olabildiğince hızlı bitirip test ve yazılım aşamasına geçmek stabil bir robot için inanılmaz önemlidir. Robotunuz stabilitesi yarışmayı kazanmak ile sonuncu olmak arasındaki fark olabilir. Stabil bir robot için de kusursuz bir yazılım şarttır.


## Yazılım Bölümü Neleri İçerecek?
- Kurulum: IDE, kart ve port ayarları; ilk seri çıktı ile bağlantıyı doğrulama.
- Mimari: Ana döngü, görevler ve scheduler; watchdog/failsafe ile temel emniyet.
- Teleop: Joystick ile elle sürüş; tank/arcade seçenekleri ve buton eşleme.
- Kapalı Çevrim: PID ve kontrol güvenliği; doygunluk, ters tepki ve filtreleme.
- Otonom: Durum makinesiyle kısa bir senaryo yürütme ve geçiş koşulları.
- Hata Ayıklama: Seri log, telemetri, hızlı kontrol listeleri ve sık sorunlar.
- Kod Stili ve Alıştırmalar: Okunabilir kod ve küçük egzersizler.
- Örnekler: Ana robotumuzun basit sürümü ve ilk otonom.


## Kütüphane Tasarım Seçimleri

### ESP32‑S3
Kütüphanenin tabanını esp32s3 yapmamızdaki sebepler, performans açıdan çok daha üstün olması, çok daha ucuz olması, içinde wifi bulundurması ve çift çekirdekli olması.

Kütüphanemiz şu anda sadece ESP32s3 üzerinde test ediliyor fakat zamanla diğer esplerin desteği de eklenecektir. Kütüphanelerimizin gelişmelerini bu dokümandan takip edebilirsiniz.


### Arduino altyapısı
Kütüphanede Arduino altyapısını tercih etmemizin nedeni, yarışmada ilk günden “çalışır” bir deneyim vermek. Bu ekosistem ekiplerin elini güçlendiriyor ve masrafı düşürüyor.

#### Arduino IDE
Yarışma için hızlı ve anlaşılır bir arayüz sunuyor. Her okul bilgisayarında kolayca kurup derleyip karta yükleyebilin diye kütüphanemizi Arduino IDE ile uyumlu tuttuk. İlk hedefimiz: zaman kaybetmeden ürünü sahaya çıkarmak.

#### Arduino Forumları
Yarışmamız yeni, ama birçok sorun yeni değil. Çoğu hata ve soru yıllardır Arduino Forumları’nda konuşuldu. Kütüphaneyi bu bilgi birikiminden faydalanabilecek şekilde kurguladık; aradığınız cevaba orada dakikalar içinde ulaşabilin diye.

#### Arduino Dokümanları
Tahmine gerek kalmasın istedik. Resmi dökümanlar kısa ve net; biz de örneklerimizi ve isimlendirmeyi onlarla uyumlu tuttuk. Böylece “bu fonksiyon ne yapıyor?” sorusunun cevabı tek sayfada, anlaşılır biçimde bulunuyor.

#### Arduino Kütüphaneleri
Geniş bir sensör ve sürücü havuzu sağlıyor. Bazı yarışmalar sizi belirli bir ekosisteme sıkıştırır ve sensör maliyetini yüzlerce dolara çıkarır. Biz bu kısıtı koymuyoruz: Perpa’dan 100 TL’ye alabileceğiniz bir sensör için bile çoğu zaman hazır bir kütüphane bulursunuz. Kütüphane tasarımımız bu esnekliği bilerek destekliyor.


<!-- Ana Robot bağlamı ve ilerleme -->
## Ana Robot (Yolculuk)

Bütün alt sayfalar, aynı ana robotu adım adım tamamlamak için tasarlandı. Bölüm sonlarındaki çubuk toplam ilerlemeyi gösterir.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 10%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %10</div>
</div> 