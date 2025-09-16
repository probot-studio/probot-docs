---
title: Kurulum (IDE/Kart/Port)
---

# Kurulum (IDE/Kart/Port) 

Robotu programlayabilmek için belirli programlara, sürücülere ve kütüphanelere ihtiyacımız var. Robota kod yükleyebilmek için bunların kurulumunu yapmalıyız.

Bu kurulumlar esnasında robota ihtiyacınız yok; bilgisayarınıza kurulması gereken şeylerden bahsedeceğiz. Test etmek isterseniz ESP32‑S3’e de ihtiyacınız olacak.

!!! note "İndirme ve kurulum süresi"
    Bilgisayar özelliklerine ve internet hızına bağlı olarak süre değişir. Büyük paketler indirileceği için bu işlem toplamda bir saate kadar sürebilir.

## Gereksinimler
Windows 10 veya 11 yüklü bir bilgisayar ve yönetici yetkisi.

## Eski Sürümleri Kaldırma (Önerilir)
Daha önce kurulu bir Arduino IDE’niz varsa kaldırmanız tavsiye edilir. Başlat menüsünden “Uygulamalar ve Özellikler”i açın, listeden “Arduino IDE”yi bulun ve Kaldır’a tıklayın. Kendi yazdığınız kod klasörlerinizi (örn. Belgeler/Arduino) silmeyin; yalnızca programı kaldırın.

## İndir ve Kur (Arduino IDE)
Arduino IDE’yi resmi siteden indirin: `https://www.arduino.cc/en/software/`. Yükleyiciyi çalıştırın ve varsayılan adımlarla kurulumu tamamlayın. Kurulum bitince IDE’yi açın.

## ESP32 Kart Desteği
IDE’de Araçlar → Kart → Kart Yöneticisi’ni açın. Arama kutusuna “esp32” yazın ve “esp32 by Espressif Systems” paketini kurun. Kurulumdan sonra Araçlar → Kart menüsünden “ESP32S3 Dev Module” (veya kullandığınız S3 tabanlı kart) seçin.

## Port ve Sürücü (Windows)
Kartı USB ile bağlayın. Araçlar → Port menüsünde yeni bir COM portu görünmelidir (ör. COM5). Port görünmüyorsa Aygıt Yöneticisi’ni açıp Bağlantı Noktaları (COM & LPT) bölümünü kontrol edin. Gerekirse üreticinin USB–UART sürücüsünü (ör. CH340/CP210x) kurun ve kabloyu çıkarıp tekrar takın. Ayrıca unutmayın: bazı USB kabloları yalnızca şarj içindir; veri taşımaz. Veri destekli bir USB kablo kullanın.

CH340 sürücüsü için adım adım kurulum: [CH340 Driver Kurulumu](https://akademi.robolinkmarket.com/ch340-driver-kurulumu/){ .u .u--slide .u--external }.

## Adafruit NeoPixel (Gereksinim)
Kütüphanemiz NeoPixel desteği kullanır. IDE’de Araçlar → Kütüphane Yöneticisi’ni açın, “Adafruit NeoPixel” kütüphanesini aratıp yükleyin. Kurulum tamamlandıktan sonra IDE’yi kapatıp açmanız gerekebilir.

## Sorun Giderme (Bağlantı ve Yükleme)
İlk kurulumda en sık karşılaşılan problemler genellikle bağlantıyla ilgilidir. Aşağıdaki kontrol listesi hızlıca teşhis etmenize yardım eder.

### USB kablosu bozuk olabilir
Kablo oynadıkça portun bazen görünüp bazen kaybolması, yükleme sırasında “bağlantı koptu” hataları almanız buna işarettir. Aynı kabloyu farklı bir cihazla (telefon, disk) deneyin; sorun tekrarlıyorsa kabloyu değiştirin. Bilgisayardaki farklı bir USB portunu da test edin.

### USB kablosu veri taşımıyor olabilir
Bazı kablolar sadece şarj içindir. Bu kablolarla telefonunuz şarj olur ama bilgisayar “yeni bir aygıt” algılamaz. IDE’de hiçbir COM port görünmüyorsa ve Aygıt Yöneticisi’nde değişiklik olmuyorsa veri özellikli bir USB kablo kullanın. Genellikle kalın ve kaliteli kablolar veri taşımaya daha uygundur.

### Karta hiçbir şey bağlı olmasın
İlk yükleme sırasında motor sürücüsü, sensör ya da LED şerit gibi ek parçaları çıkarın. Yanlış bağlantı, kısa devre ya da besleme dalgalanması kartın tanınmasını engelleyebilir. Sadece USB ile, çıplak kart halinde deneyin; bağlantı sağlandığında parçaları tek tek geri takın.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 20%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %20</div>
</div> 