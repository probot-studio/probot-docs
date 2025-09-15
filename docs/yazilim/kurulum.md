---
title: Kurulum (IDE/Kart/Port)
---

# Kurulum (IDE/Kart/Port) 

## Bu neyi çözer?
Robotu programlayabilmek için belirli programlara, sürücülere ve kütüphanelere ihtiyacımız var. Robota kod yükleyebilmek için bunların kurulumunu yapmalıyız

!!! warning "Emniyet"
    USB ile başla, bataryayı sök. Motor ve sürücü kablolarını ilk denemelerde bağlı tutma. Acil durdurma (E‑Stop) elinin altında olsun. Yanlış porta yazmamak için bağladığın seri cihaz adını yüklemeden önce bir kez daha kontrol et.

## Hızlı Kurulum (VS Code + PlatformIO)
VS Code’u aç, PlatformIO eklentisini kur ve yeni bir proje başlat: kart olarak ESP32‑S3, çatı olarak Arduino. USB kabloyu taktığında, altta listelenen seri portu görmelisin (Linux’ta genellikle `/dev/ttyACM*` veya `/dev/ttyUSB*`). Derle butonu “check”, yükleme butonu “ok” simgesidir; yükleme bittiğinde seri monitörü 115200 baud ile aç ve sinyali bekle.

Arduino IDE de işe yarar; küçük adımlarda hızlıdır. Proje büyüdükçe PlatformIO’nun bağımlılık ve yapı yönetimi sana zaman kazandırır. Hangi aracı seçersen seç, amaç aynıdır: derlemenin sorunsuz olması, portun stabil görünmesi ve seri hatta anlamlı bir başlangıç mesajının düşmesi.

## Donanım Yapılandırma (Kurulum aşaması)
İlk ayarda kritik olanlar küçük ama etkilidir: Kart türünü ESP32‑S3 (Arduino core) olarak seç; Linux’ta kullanıcıyı `dialout`/`uucp` grubuna al ve yeniden oturum aç; yükleme hızını 115200 (veya kartın desteklediği yüksek hız) olarak ayarla, otomatik reset açık kalsın. Bunlar doğruysa, kalan kısım çoğunlukla kablo kalitesine ve sabit bir USB porta bakar.

## İlk Çalıştırma (Hello Robot)
```cpp
#include <Arduino.h>

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("[BOOT] Hello Robot — baglanti OK");
}

void loop() {
  static uint32_t t0 = millis();
  if (millis() - t0 > 500) {
    t0 = millis();
    Serial.println("tick");
  }
}
```
Seri monitörde önce “[BOOT]” sonra her yarım saniyede bir “tick” görüyorsan, zincirin tüm halkaları—sürücü, port, derleme, yükleme ve çalışma—yerli yerinde demektir. Bu küçük ritim, ileride motor, sensör ve otonom mantığın da aynı ahenkle çalışacağının ilk işaretidir.

## Arduino Ekosistemi: Hızlı Bağlantılar
Kısa yoldan doğru sayfalara inmek, deneme‑yanılmayı kısaltır: Arduino Referans, ESP32 Arduino Core ve PlatformIO dökümantasyonu elinin altında olsun. İhtiyaç duyduğunda bir bakışta fonksiyon imzalarını, örnek kullanımını ve tipik tuzakları görürsün.

## Best Practice ve Yaygın Hatalar
Aynı anda iki uygulamanın aynı portu tutmasına izin verme; seri monitörü bir yerde açıkken başka yerde yükleme yapmak çoğu zaman sessizce başarısız olur. USB kablosunun veri destekli olduğundan emin ol; ince şarj kabloları seni saatlerce oyalatabilir. İlk denemede motorları besleme hattına bağlama; önce sadece yazılım köprüsünün sağlam olduğunu kanıtla. Port görünmüyorsa sürücü/izinleri kontrol et, kabloyu değiştir veya farklı bir USB portu dene—sorunların yarısı bu üçlüde çözülür.

## Topluluk ve Kaynak
Projenin kalbi GitHub’da atıyor. Fikir, istek ve hataları `Issues` üzerinden paylaş; oradan gelecek geri bildirimler, sıradaki sürümde senin ihtiyacını öne çıkarır. Ek araçlara göz atmak istersen, ilgili sayfaya bağlantı bu bölümün altındadır.

## Özet & Yansıtma
Kurulum, robot yazılımının en basit ama en kritik zaferidir: gerçek donanımda görülen bir “merhaba”, bütün sürecin güven testidir. Kendine sor: “Seri monitör çıktım istikrarlı mı?” ve “Motorlar bağlı olmadan güvenle test edebiliyor muyum?” Bu iki “evet”, bir sonraki adıma hazır olduğunun kanıtıdır.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 10%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %10</div>
</div> 