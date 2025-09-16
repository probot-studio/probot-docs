---
title: Joystick API ve Teleop
---

# Joystick API ve Teleop 

## Joystick
Bu bölümde joystick API'sinin temel kullanımı ve eşleme tercihleri anlatılacaktır.

### Neyi Tamamlayacağız?
- Joystick API'yi etkinleştirmeyi ve varsayılan joystick'i seçmeyi öğrenmek
- Eksen (Left/Right X-Y) ve buton verilerini okumayı öğrenmek
- Deadband ve ölçek uygulayarak titreşimi azaltmak ve hassasiyeti ayarlamak
- Seri log ile hızlı doğrulama yapmayı öğrenmek

### Adımlar
1) Joystick'i etkinleştir ve eşleme seç: Gerekirse `joystick_mapping` içinden uygun eşlemeyi seç.
2) Eksenleri oku: solX, solY, sağX, sağY değerlerini periyodik olarak al.
3) Butonları oku: ihtiyaç duyulan butonların ham durumlarını (basılı/basılı değil) al.
4) Deadband ve ölçek uygula: küçük titreşimleri sıfırla, kalan değeri takımın tercihine göre ölçekle.
5) Seri log ile doğrula: eksen ve buton değerlerini kısa süreli yazdırarak doğru okunduğunu teyit et.

### Yapın / Yapmayın
- Yapın: Eşlemeyi takımınızın kullandığı gamepad modeline göre ayarlayın.
- Yapın: Deadband'i küçük ama yeterli bir aralıkta tutun (ör. 0.05–0.10).
- Yapmayın: İlk denemede motorları bağlamadan joystick okumayı test etmeyi atlamayın.
- Yapmayın: Ters eksen sorunlarını sahada bırakmayın; yön düzeltmelerini erkenden belirleyin.

### Sık Hata Senaryoları
- Joystick tanınmıyor: Bağlı olup olmadığını ve sürücülerin kurulu olduğunu kontrol edin.
- Eksenler ters: Eşleme veya yön düzeltmesini kontrol edin; sahada karışıklık yaratır.
- Değerler zıplıyor: Deadband yok veya çok küçük; küçük bir eşik ekleyin.
- Butonlar çalışmıyor: Farklı gamepadlerde buton indeksleri değişebilir; eşlemeyi doğru seçin.

## Teleop
Bu bölümde, joystick verisini sürüş komutlarına çeviren teleop akışı anlatılacaktır.

### Neyi Tamamlayacağız?
- Teleop modunun ne zaman çalıştığını ve genel akışını anlamak
- Joystick eksenlerini sürüş girişine dönüştürmek (ör. tank veya arcade tarzı)
- Butonları hız modları veya özel fonksiyonlar için kullanmak
- Serbest alan testinde güvenli doğrulama yapmak

### Adımlar
1) Teleop başlangıcı (init): Gerekirse geçici durumları sıfırla, güvenli başlangıç değeri ata.
2) Eksenleri sürüşe çevir: sol/sağ teker güçlerini hesaplayan basit bir eşleme seç (tank/arcade).
3) Butonlarla mod seç: örneğin “yavaş mod” veya “hızlı mod” gibi ölçek değişimleri uygula.
4) Güvenli çıkış: loop sonunda sınırları uygula (0..1 aralığı, doygunluk), motor komutlarını gönder.
5) Kısa saha testi: düz çizgide ileri/geri ve sağ/sol dönüş; yön ve ölçek doğru mu bak.

### Yapın / Yapmayın
- Yapın: İlk testleri tekerler havadayken veya geniş boş alanda yapın.
- Yapın: Hız ölçeğini düşükten başlayıp kademeli artırın.
- Yapmayın: Joystick okunur okunmaz maksimum hızla sürmeyin.
- Yapmayın: Ters yön sorunlarını maç gününe bırakmayın; hemen düzeltin.

### Sık Hata Senaryoları
- Robot sağ/solu karıştı: Teker bağlantıları veya yön eşleme hatalı; eşlemeyi ters çevirin.
- Çok sinirli sürüş: Deadband yok veya hız ölçeği çok yüksek; değerleri yumuşatın.
- Buton modları çalışmıyor: Buton indeksleri veya durum okuma hatalı; log ile doğrulayın.
- Teleop donuyor gibi: Döngü süresi çok uzun; karmaşık hesapları azaltın veya periyodu ayarlayın.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 60%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %60</div>
</div> 