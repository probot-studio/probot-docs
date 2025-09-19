---
title: Mekanizmalar ve Alt Sistemler
---

# Mekanizmalar ve Alt Sistemler

## Bu sayfada ne yapıyoruz?
Bu sayfa, şasinin üstüne eklediğimiz düzenekleri (mekanizmalar) ve onları “görür–karar verir–hareket eder” akışına bağlayan yazılım katmanlarını (alt sistemler) tek çatı altında toplar. Hedefimiz, her mekanizma için aynı şablonu kullanarak hızlı ve güvenli bir şekilde içerik üretmek; sonunda teleop ve otonomda kullanılacak küçük ama etkili akışların temelini atmak.

## Mekanizma ve Alt Sistem (tanım ve bağlantı)
Mekanizma, fiziksel düzenektir: motor, dişli, kayış, kılavuz, teker, besleyici gibi robotun “hareket eden parçaları”. Alt sistem ise bu mekanizmanın yazılımda karşılığıdır: ilgili sürücü sınıfları, sensör okumaları, güvenlik sınırları ve kontrol akışı bir araya gelerek tek bir “kontrol noktası” oluşturur.

Bu ikisini birlikte düşünürüz: Sahada iş, yalnızca gücü vermek değildir. Mekanizma yönde/düzende doğru kurulmalı; alt sistem ise bağlantı, yön ve sınır doğrulamasını yapmalı, girişleri (joystick/otonom hedefleri) güvenli komutlara çevirmelidir. Böylece sürücü için temiz bir arayüz, otonom için tekrarlanabilir bir davranış elde ederiz.

## Robot üzerinde nasıl görünür?
Pratikte üç ana aile görürsünüz: Al–bırak için besleyen/alıcı‑atıcılı düzenekler (intake/shooter), konumlamak için doğrusal kaldırıcılar (elevator/slider) ve yönlendirmek için döner eklemler (kol/taret). Mekanizma gövdededir; alt sistem kodda tek bir “sorumlu” gibi davranır: girişleri alır, sınırları uygular, motor(lar)a komutu verir ve geribildirimi takip eder.

## Bağlam: Teleop/Otonom ve makrolar
Teleop’ta sürücü eksen ve tuşlarla mekanizmayı yönetir; kısa tek‑tuş akışlar (makrolar) işi hızlandırır. Otonomda aynı adımları bloklar halinde tekrar kullanırız: “hazırlan → hedefe git → bırak → çekil” gibi. İyi bir alt sistem, bu iki bağlam arasında kod değiştirmeden geçiş yapabilen net bir arayüz sunar.

## Güvenlik ve test ritmi
Önce güvenlik: Init/Start/Stop akışı net olmalı; gücü varsayılan olarak 0’da başlatır ve biteriz. Hareket aralığını yazılımsal sınırlarla (soft limit) tutar, uçlarda fiziksel limit switch ile doğrularız. İlk testler boşta; sonra hafif yükte; en sonunda saha düzeninde yapılır. Beklenmedik durumda “Stop” her zaman erişilebilir olmalıdır.

!!! warning "Kritik not"
    Homing (sıfır noktasını bulma) yapılmadan konum hedefi verilmemelidir. Yön tersliği ve kablo/kayış limitleri sahada büyük hasar yaratabilir; önce yön ve sınır doğrulaması yapın.

## Her alt sistem için genel şablon
### Ne yapar?
Bu alt sistemin amacı ve oyundaki rolü. Sürücüye/otonom akışa ne kazandırır, hangi problemi çözer?

### Hareket tipi ve sınırlar
Lineer mi döner mi? Menzil/strok, maksimum hız/ivme, güvenli dur‑kalk ve yumuşatma (ramp) ihtiyacı.

### Gerekli sensörler ve geri bildirim
Limit switch, encoder, ToF/IMU gibi hangi geri bildirim gerekli ve neden. Bağlantı ve yön doğrulamasının kısa ölçütleri.

### Dikkat ve güvenlik
Homing zorunluluğu, yazılımsal sınırlar, clamp, invert, ani yön değişimlerinde güç sınırlama. Bağlantı kesilince güvenli bırakma.

### Kod iskeleti ve hızlı doğrulama
Yapıştır‑çalıştır küçük bir örnekle seri çıktıda doğru sinyali görün. Ardından aynı iskeleti teleop/otonom akışına bağlayın.

## Alt sistem başlıkları (bu şablonla doldurulacak)
### Shooter (Atıcı)

### Intake (Alıcı/Besleyici)

### Elevator (Dikey kaldırıcı)

### Slider (Teleskopik kızak)

### Kol (Arm)

### Taret (Turret)

## Sonraki adım
Bu iskeleti şimdi tek tek gerçek koda çevireceğiz. İlk durak: Shooter ve Elevator; ardından Slider, Kol ve Taret. 