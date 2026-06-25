---
title: Hatalar
---

# Hatalar

## Hata Ayıklama Yöntemi

Belirli bir hataya bakmadan önce bu prensipler okunmalı. Çoğu hata bu yaklaşımla çok daha hızlı çözülür.

### Kodda değişiklik yoksa sorun elektronikte

Robot dün çalışıyordu, bugün çalışmıyor ama kod değişmedi. Bu durumda koda bakmak zaman kaybı. Sorun kablodan, konektörden, akü geriliminden veya motordan kaynaklanıyor.

Kodun aynı kaldığı hata senaryolarının büyük çoğunluğu fiziksel sebepli.

### Problemi daralt, parçalara böl

Bir robot çok parçadan oluşur: kütüphane, kod, motor sürücü, motor, kablo, güç. Bunların hepsi aynı anda test edilemez. Problemi olabildiğince küçük bir parçaya indirgemek gerekir.

Motor eskiden dönüyordu, şimdi dönmüyor. İlk soru: **ne değişti?** Kod değişmediyse sorun fiziksel; kablo gevşemiş, konektör ayrılmış, akü bitmiş veya motor sürücü yanmış olabilir. Kod değiştiyse sorun yazılımsal; ama o zaman da hangi değişiklikle başladığı sorusu önemli.

Cevap bilinemiyorsa sistemi parçalara böl. Motorun sorunlu olup olmadığını anlamak için motor sürücüyü devre dışı bırak ve motoru doğrudan bir güç kaynağına bağla. Motor dönüyorsa motor sağlam; sorun üstündeki katmanda. Motor dönmüyorsa sorun motorda veya güç hattında. Bu şekilde her katman sırayla elenir.

### Tek seferde bir şeyi değiştir

Aynı anda hem kablo hem kod hem de güç kaynağı değiştirilirse hangisinin sorunu çözdüğü anlaşılamaz. Bir değişiklik yapılır, test edilir, sonuca bakılır. Birden fazla şeyi aynı anda değiştirmek mevcut sorun çözülse bile neyin çözdüğünü gizler.

### Şüphelenilen her ihtimali sırayla ele al

"Kablo mı, sürücü mü, motor mu bozuk?" sorusu varsa önce her birini ayrı ayrı test et. Kabloyu başka bir çalışan devreden geçir. Sürücünün LED'ine bak. Motoru doğrudan pil ucuna bağla. Bu testlerin her biri bir ihtimali elendir; kalan tek ihtimal cevaptır.

### LED rengine ve seri porta bak

Probot'un LED'i robotun o anki durumunu söylüyor. Joystick yanlış görünüyorsa, otonom beklediği gibi çalışmıyorsa; önce LED rengi kontrol edilmeli, sonra `probot::printf()` ile değerleri ekrana yaz. Görmeden tahmin yürütmek yerine veriyi okumak her zaman daha hızlı.

---

## "Sketch too big"

Derleme tamamlanmıyor, IDE hata veriyor.

**Sebep:** Varsayılan Arduino partition yaklaşık 1.3 MB uygulama alanı ayırır. Kütüphane bu alana sığar; ancak kullanıcı kodu büyüdükçe toplam boyut sınırı aşabilir. Başka sebebi yok.

**Çözüm:** **Araçlar > Partition Scheme > Huge APP (3MB No OTA)**

Bu ayar Arduino IDE'de sketch'e özgüdür; her yeni projede kontrol edilmeli. Ayrıntı: [Kurulum - Partition Scheme](kurulum.md#4-partition-scheme).

---

## Deadline Miss

**Belirti:** LED kırmızı yanıp sönüyor. Otonom çalışıyorsa otonom kesilip teleop'a geçiyor.

**Ne anlama geliyor?** `teleopLoop` veya `autonomousLoop` fonksiyonu 2 saniyeden uzun süre dönmeden çıkmadı. Kütüphane bu durumu tespit edince joystick değerlerini sıfırlar ve LED'i kırmızıya alır. Fonksiyon task'ı öldürülmez; tur kendi kendine bitince hata temizlenir.

**Sebepler:**

| Olasılık | Sebep |
|---|---|
| ~%60 | Loop içinde `delay(2000)` veya daha uzun bir bekleme var |
| ~%20 | I2C veya sensör yanıt vermiyor; kütüphane timeout olmadan sonsuza bekliyor |
| ~%15 | `Serial.println()` çok sık çağrılıyor; buffer dolunca çağrı bloke oluyor |
| ~%5 | Görüntü işleme gibi gerçek hesaplama yükü |

**Daha önce çalışan kodda aniden deadline miss başladıysa:**

Kod değişmedi ama hata çıkmaya başladı. Bu durumda bakmak gereken yer kod değil, ona bağlı sistemler.

İlk adım: loop içinde herhangi bir `delay(2000)` veya daha uzun çağrı olmadığına emin ol. Varsa `millis()` ile zamanlama yapılmalı; örnek: [Yazılım - Otonom](yazilim.md#otonom).

Yoksa I2C ve harici cihazları kontrol et. I2C bağlı bir sensör veya ekran varsa; kablo gevşemesi, güç dalgalanması veya cihazın kilitlenmesi kütüphaneyi sonsuza bekletir. Timeout ekle:

```cpp
Wire.setTimeOut(50);  // 50 ms sonra vazgeç
```

Bunlar da sorun değilse looptan tüm harici cihaz çağrılarını geçici olarak kaldır ve hata devam ediyor mu bak. Kaldırınca geçiyorsa sorun o kaldırılan bileşende.

**Problemi izole edemiyorsan olabilecek en basit kodu yaz:**

Loop içinde yalnızca `delay(20)` bırak, geri kalanı yorum satırına al. Deadline miss devam ediyorsa sorun kodda değil, başka yerde. Geçiyorsa yorum satırlarını birer birer geri aç; hata hangi satırda geri geliyorsa sorun orada.

Son çare olarak kütüphaneyi denklemden çıkar. Kütüphanesiz saf Arduino koduyla motor veya sensörü test et. Orada da bloke oluyorsa sorun kütüphaneden değil, donanım veya harici kütüphaneden kaynaklanıyor demektir.

---

## Bağlantı Kopması / DS Timeout

**Belirti:** Robot STOP'a geçiyor, joystick yanıt vermiyor, LED mavi yanıp sönüyor.

Bağlantı kopunca kütüphane sırayla şunları yapar:

1. Joystick verisi 500 ms kesilince eksenler sıfır okunmaya başlar.
2. Sahip cihaz 5 saniye sessiz kalırsa sahiplik slotu boşalır, gamepad sıfırlanır.
3. Driver Station 10 saniye boyunca tamamen sessiz kalırsa robot STOP'a geçer.

**Sebepler (saha koşullarında):**

| Olasılık | Sebep |
|---|---|
| ~%40 | Kanal çakışması; yakında aynı WiFi kanalında başka bir robot var |
| ~%25 | Tablet arka planda WiFi taraması yaptı, bağlantıyı kısa süreliğine kesti |
| ~%15 | Akü gerilimi düştü; ESP32'nin RF gücü azaldı |
| ~%10 | Mesafe veya engel; kalabalık ortamda insan kütlesi 2.4 GHz sinyalini emer |
| ~%10 | Diğer: eski tablet, yüksek DS timeout değeri, vb. |

Kanal planı ve sinyal kalitesi için: [Sinyal Temizliği](saha.md).

---

## Port Görünmüyor / Yükleme Başarısız

**Belirti:** Araçlar > Port listesi boş veya yükleme "could not open port" hatasıyla başarısız oluyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%50 | USB kablosu şarj-only; veri pini yok | Farklı kablo dene |
| ~%30 | CH340/CP210x sürücüsü kurulu değil (Windows) | Üreticinin sitesinden sürücüyü kur |
| ~%15 | USB portunda sorun | Farklı port veya doğrudan bilgisayar portuna tak |
| ~%5 | Devrede kısa devre; kart kendini korumak için USB'yi kesiyor | Bağlı devreyi çıkar, çıplak kartı dene |

---

## Joystick Görünmüyor / Çalışmıyor

**Belirti:** Arayüzde joystick "Not Connected" yazıyor veya eksen değerleri 0'dan hiç değişmiyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%70 | Henüz hiçbir butona basılmadı | Kumandada herhangi bir butona bas; tarayıcı Gamepad API'si güvenlik kısıtı nedeniyle buton basılana kadar joystick'i tanımaz |
| ~%20 | Kumanda arayüzü açan cihaza değil başka bir cihaza bağlı | Joystick'i Driver Station'ı açan telefon veya tablete bağla |
| ~%10 | Kumanda modeli varsayılan profille uyumsuz | `setActiveByName()` ile uygun profili seç; bkz. [Yazılım - Kumanda Profili](yazilim.md#kumanda-profili) |

---

## Servo Titrüyor / Düzensiz Hareket

**Belirti:** Servo pozisyon tutmuyor, aralıklı seğiriyor veya komut verilmeden hareket ediyor.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%55 | Güç sorunu | Servo ESP32'nin 5V/3.3V pininden besleniyor; bu pinler yeterli akımı veremez. Ayrı 5-6V kaynak (BEC/UBEC) kullan, toprakları ortak bağla |
| ~%35 | LEDC timer çakışması | Motor `analogWrite()` düşük LEDC kanallarını kullanır (0, 1, 2…); servo için yüksek kanal ver: `ledcAttachChannel(servoPin, 50, 14, 7)` |
| ~%10 | Mekanik | Servo kolu sıkışıyor veya taşıdığı yük çok fazla |

---

## Arayüz Açılmıyor / 403 Hatası

**Belirti:** `192.168.4.1` açılmıyor ya da tarayıcı "403 Forbidden" gösteriyor.

Probot tek cihaz kuralı uygular: robota ilk bağlanan cihaz sahip olur. Diğer cihazlar bağlanabilir ama 403 alır; arayüzü açamaz.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%60 | Başka bir cihaz sahip | Diğer cihazı WiFi'den çıkar ve yaklaşık 5 saniye bekle; sahiplik slotu boşalır |
| ~%30 | Yanlış WiFi ağına bağlı | Telefon veya tabletin bağlı olduğu ağı kontrol et; robotun SSID'sine bağlı olmalı |
| ~%10 | Tarayıcı adresi https'e çevirdi | Adres çubuğuna `http://192.168.4.1` olarak yaz; `https` değil |

---

## Motorlar Stop'ta Durmuyor

**Belirti:** Arayüzden Stop'a basıldıktan sonra motorlar dönmeye devam ediyor.

Stop kooperatiftir: o anki loop turu bittikten sonra `robotEnd()` çağrılır. Motorların durması için `robotEnd()` içine durdurma komutu yazılmış olması gerekir.

| Olasılık | Sebep | Çözüm |
|---|---|---|
| ~%80 | `robotEnd()` boş veya motor durdurma kodu yok | `robotEnd()` içine motor pinlerini LOW'a çeken kod ekle |
| ~%20 | `robotEnd()` çok uzun sürdü; blocking işlem var | `robotEnd()` hızlı dönmeli; içinde bekleme olmamalı |
