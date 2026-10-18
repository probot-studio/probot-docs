# Probot blok listesi

Bu sayfa Probot Blocks'taki her bloğu kategori sırasıyla listeler. Blok etiketleri ekrandaki gibidir.
Bir bloğun üstünde beklersen ekranda da kısa açıklaması çıkar.

`▾` işaretli alanlar açılır listedir. Köşeli parantezli alanlar (`[0.5]`) yuva ya da sayı kutusudur.

**Ürettiği kod** sütunu, bloğun **Kod Önizleme**'de ürettiği kodu araç kutusundaki varsayılan değerlerle
gösterir. Boş koşul yuvası kodda `false`, boş sayı yuvası `0` ya da `0.0f` olur. İçine blok alan
bloklarda yalnız ilk satır yazılır.

<!-- SAY: Bu sayfada her bloğun ne işe yaradığını bulabiliyoruz. -->

## Yaşam döngüsü blokları

Çalışma alanında hazır gelir, blok listesinde yoktur, silinemez. Her biri koddaki bir fonksiyondur.

| Blok | Ne zaman çalışır | Ürettiği kod |
|---|---|---|
| **robotInit** | **Init**'e basılınca bir kez. Pin ve motor tanımları buraya konur. | `void robotInit()` |
| **robotEnd** | **Stop**'ta bir kez. Motorlar burada durdurulur. | `void robotEnd()` |
| **autonomousInit** | Otonom başlarken bir kez. | `void autonomousInit()` |
| **autonomousLoop** | Otonom boyunca saniyede yaklaşık 50 kez. 2 saniyeden uzun bekleme yapılmaz. | `void autonomousLoop()` |
| **teleopInit** | Teleop başlarken bir kez. | `void teleopInit()` |
| **teleopLoop** | Teleop boyunca saniyede yaklaşık 50 kez. Kumanda okuma ve sürüş buraya konur. | `void teleopLoop()` |

<!-- SAY: Altı yaşam döngüsü bloğu robotun hangi anda ne yapacağını belirliyor. -->

## Kumanda

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **kumandayı oku** `js ▾` **ölü bölge** `[0.08]` | Kumandanın güncel değerlerini alır. Döngüde her turda okunur. Ölü bölge (0-0,5) çubuk bırakılınca kalan küçük değerleri sıfır sayar. | `auto js = probot::io::joystick_api::makeDefault();` |
| `js ▾` `sol çubuk ↕ (ileri +) ▾` | Çubuk -1 ile +1 arası değer verir. Tetik yalnız 1 (basılı) ya da 0 (basılı değil) verir; yarım basış ara değer vermez. Seçenekler: sol/sağ çubuk ↕ ve ↔, sol/sağ tetik. | `js.getLeftY()` |
| `js ▾` `A (×) ▾` **basılı mı?** | Tuş basılıysa doğru verir. Seçenekler: **A**, **B**, **X**, **Y**, **LB**, **RB**, **Back / Select**, **Start / Options**, **L3**, **R3**. Parantezde PlayStation karşılığı yazar. | `js.getA()` |
| `js ▾` **D-Pad** `yukarı ▾` **basılı mı?** | Yön tuşu basılıysa doğru verir: yukarı, sağ, aşağı, sol. | `js.getDpadUp()` |
| `js ▾` **D-Pad açısı** | D-Pad yönünü tek sayıyla verir: -1 hiçbiri, 0 yukarı, 90 sağ, 180 aşağı, 270 sol. | `js.getPOV()` |
| `js ▾` **bağlı mı?** | Kumandadan veri geldiyse doğru verir. | `js.isConnected()` |
| **kumanda eşlemesi** `▾` | Kumanda modelini seçer: "Logitech F310 (varsayılan)", "Standart (Xbox One, DS4)", "Axis9 D-Pad", "Tuna varsayılan". "Tuna varsayılan" kütüphanedeki eski bir eşlemeyi kullanır; kumandan ilk üç modelden biriyse onu seçme. **robotInit** içine konur. | `probot::io::joystick_mapping::setActiveByName("logitech-f310");` |
| `js ▾` **ham eksen no** `[0]` | Eşlemesiz ham eksen değeri (ileri seviye). | `js.getRawAxis((int)(0))` |
| `js ▾` **ham buton no** `[0]` | Eşlemesiz ham tuş değeri (ileri seviye). | `js.getRawButton((int)(0))` |

<!-- SAY: Kumanda blokları çubukların ve tuşların değerini okuyor. -->

## Motor & Sürüş

Bloklar iki PWM girişli motor sürücüler (BTS7960 türü) için kod üretir. **motor tanımla**, kodun
başına pin sabitlerini (`const uint8_t solMotor_RPWM = 16;`) ve `setMotor` fonksiyonunu ekler.

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **motor tanımla** `solMotor ▾` **RPWM pin** `16` **LPWM pin** `17` **ters** ☐ | Motoru iki pinle tanımlar. **ters** işaretliyse yön tersine döner. **robotInit** içine konur. | `pinMode(solMotor_RPWM, OUTPUT);`<br>`pinMode(solMotor_LPWM, OUTPUT);`<br>`setMotor(solMotor_RPWM, solMotor_LPWM, 0.0f, false);` |
| **motoru sür** `solMotor ▾` **güç** `[0.5]` | Motoru -1 (tam geri) ile +1 (tam ileri) arası güçle sürer. 0 durdurur. | `setMotor(solMotor_RPWM, solMotor_LPWM, (float)(0.5), solMotor_INVERTED);` |
| **motoru durdur** `solMotor ▾` | Motoru durdurur. **robotEnd** içine her motor için konur. | `setMotor(solMotor_RPWM, solMotor_LPWM, 0.0f, false);` |
| **tank sürüş - sol motor** `▾` **sağ motor** `▾` **sol güç** `[0]` **sağ güç** `[0]` | Her taraf kendi gücüyle sürülür. Genelde sol çubuk sol güce, sağ çubuk sağ güce takılır. | `setMotor(solMotor_RPWM, solMotor_LPWM, (float)(0), solMotor_INVERTED);`<br>`setMotor(sagMotor_RPWM, sagMotor_LPWM, (float)(0), sagMotor_INVERTED);` |
| **arcade sürüş - sol motor** `▾` **sağ motor** `▾` **ileri/geri** `[0]` **dönüş** `[0]` | Bir değer ileri/geri, diğeri dönüş verir. Sol motora ileri/geri + dönüş, sağ motora ileri/geri - dönüş gider. | `setMotor(solMotor_RPWM, solMotor_LPWM, fwd + turn, solMotor_INVERTED);`<br>`setMotor(sagMotor_RPWM, sagMotor_LPWM, fwd - turn, sagMotor_INVERTED);` |
| **hassas güç** `[x]` | Değerin küpünü verir. Düşük hızda ince kontrol sağlar; -1, 0 ve +1 değişmez. | `hassasGuc((float)(0.0f))` |

<!-- SAY: Motor blokları motorları tanımlıyor, sürüyor ve durduruyor. -->

## Servo

**servo tanımla**, kodun başına `const uint8_t kolServo_PIN = 4;` satırını ve `servoAngle` fonksiyonunu
ekler.

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **servo tanımla** `kolServo ▾` **pin** `4` **LEDC kanal** `7` | Servoyu bir pin ve PWM kanalıyla (0-15) tanımlar. **robotInit** içine konur. | `ledcAttachChannel(kolServo_PIN, 50, 14, 7);` |
| **servo açısı** `kolServo ▾` `[90]` **derece** | Servoyu 0-180 derece arası bir açıya götürür. | `servoAngle(kolServo_PIN, (float)(90));` |
| **servo sinyalini kes** `kolServo ▾` | Servo sinyalini keser, servo serbest kalır. **robotEnd** için uygundur. | `ledcWrite(kolServo_PIN, 0);` |

Her servoya ayrı bir LEDC kanalı ver.

<!-- SAY: Servo blokları servoyu istediğimiz açıya götürüyor. -->

## Telemetri

Driver Station ekranındaki telemetri paneline yazar.

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **telemetriye yaz** `["Merhaba Probot"]` | Bir satır metin yazar. | `probot::println("Merhaba Probot");` |
| **telemetriye değer yaz - etiket** `hız` **değer** `[x]` | Bir sayıyı etiketiyle yazar, ör. "hız: 0.42". | `probot::printf("hız: %.2f\n", (double)(0));` |
| **telemetriyi temizle** | Paneli temizler. Döngünün başında kullanılır. | `probot::clearTelemetry();` |

<!-- SAY: Telemetri blokları Driver Station ekranına bilgi yazıyor. -->

## Zaman

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **geçen süre (ms)** | Robot açıldığından beri geçen milisaniye. Otonomda beklemeyi bununla ölç. | `millis()` |
| **bekle** `[20]` **ms** | Programı verilen süre kadar durdurur. Döngüde 2000 ms'yi geçme. | `delay(20);` |

<!-- SAY: Zaman blokları süreyi ölçüyor ya da programı bekletiyor. -->

## Pinler

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **pin** `2` **modu** `ÇIKIŞ ▾` | Pini çıkış, giriş ya da pull-up'lı giriş yapar. **robotInit** içine konur. | `pinMode(2, OUTPUT);` |
| **dijital pin** `2` **→** `HIGH (açık) ▾` | Pini açık ya da kapalı yapar. | `digitalWrite(2, HIGH);` |
| **dijital pin** `2` **oku** | Pin açıksa doğru verir. Pull-up girişte basılı buton kapalı okunur. | `(digitalRead(2) == HIGH)` |
| **PWM pin** `16` **değer** `[128]` **(0-255)** | Pine 0-255 arası PWM yazar. | `analogWrite(16, (int)(128));` |
| **analog pin** `1` **oku** | Analog değeri okur (0-4095). | `analogRead(1)` |
| **Serial yaz (satır)** `["debug"]` | USB seri porta satır yazar. Bilgisayara bağlıyken hata ayıklamak için. | `Serial.println("debug");` |
| **Serial yaz** `[ ]` | USB seri porta satır sonu eklemeden yazar. | `Serial.print("");` |

<!-- SAY: Pin blokları kartın pinlerini doğrudan okuyup yazıyor. -->

## Robot

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **robot:** `pil gerilimi (V) ▾` | Robotun durumundan bir sayı: pil gerilimi (V), bağlı istemci sayısı, otonom süresi (sn). | `probot::robot::state().read().batteryVoltage` |
| **robot** `otonomda ▾` **mı?** | Robotun durumunu sorar: otonomda mı, teleopta mı, deadline kaçırdı mı (ileri seviye). | `(probot::robot::state().read().phase == probot::robot::Phase::AUTONOMOUS)` |

<!-- SAY: Robot blokları pil gerilimi gibi bilgileri okuyor. -->

## Kontrol

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **eğer** ... **yap** | Koşul doğruysa içindeki blokları çalıştırır. Kol eklemek için dişli simgesine bas, açılan küçük düzenleme alanında **değilse eğer** ya da **değilse** parçasını **eğer** parçasının altına sürükle: [Eğer bloğuna değilse kolu ekle](probot-bloklari-duzenle.md#degilse-kolu-ekle). | `if (false) {` |
| `[5]` **kez tekrarla** | İçindeki blokları verilen sayı kadar çalıştırır. | `for (int i = 0; i < 5; i++) {` |
| **tekrar ederken** / **kadar tekrarla** | Koşul doğru olduğu sürece ya da doğru olana kadar tekrarlar. | `while (false) {` / `while (!false) {` |
| **döngüden çık** / **döngünün sonraki adımından devam et** | Döngüyü bitirir ya da sonraki tura geçer. | `break;` / `continue;` |
| **ile sayılır** `i ▾` ... | Değişkeni bir sayıdan diğerine adım adım sayarak tekrarlar. | `for (i = 0; i <= 10; i++) {` |

Döngü bloklarını **autonomousLoop** ya da **teleopLoop** içinde uzun süre çalıştırma. Bu bloklar zaten
saniyede yaklaşık 50 kez tekrarlanır.

<!-- SAY: Kontrol blokları koşula göre karar veriyor ve tekrar ediyor. -->

## Mantık

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| `[ ] = [ ]` | İki değeri karşılaştırır: =, ≠, <, ≤, >, ≥. | `0 == 0` |
| `[ ]` **ve** `[ ]` | İki koşulu birleştirir: **ve**, **veya**. | `false && false` |
| **true** / **false** | Doğru ya da yanlış değeri. | `true` |
| `[ ]` **değil** | Koşulun tersini verir. | `!true` |
| **deneme** / **if true** / **if false** | Koşula göre iki değerden birini verir. Etiket yarı İngilizcedir. Örnek kodda yuvalara **true**, `1` ve `0` takılıdır. | `true ? 1 : 0` |

<!-- SAY: Mantık blokları doğru ya da yanlış sonuç veriyor. -->

## Matematik

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| `0` | Sayı. | `0` |
| `[1]` **+** `[1]` | Dört işlem ve üs alma: +, -, x, ÷, **üst alma**. | `1 + 1` |
| **kare kök** `[ ]` | Tek sayılı işlem: kare kök, **kesin** (mutlak değer), -, ln, log10, e^, 10^. | `sqrt(0)` |
| **Sinüs** `[ ]` | Trigonometri, açı derece cinsinden. | `sin((double)(0) * DEG_TO_RAD)` |
| **yuvarla** `[ ]` | Yuvarlar: yuvarla, yukarı yuvarla, aşağı yuvarla. | `round(0)` |
| `[ ]` **÷** `[ ]` **geri kalan kısım** | Bölmeden kalanı verir. | `fmod((double)(0), (double)(1))` |
| `[ ]` **en düşük** `[ ]` **en yüksek** `[ ]` **ile sınırla** | Değeri iki sınır arasında tutar. | `constrain((double)(0), (double)(0), (double)(0))` |
| `[ ]` **çift** `▾` | Sayının özelliğini sorar: çift, tek, asal, bütün, pozitif, negatif, bölünebilir. | `(fmod((double)(0), 2) == 0)` |

<!-- SAY: Matematik blokları hesap yapıyor. -->

## Metin

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| `["  "]` | Metin. | `""` |
| **ile metin oluştur** | Birden çok parçayı tek metinde birleştirir. Örnek kodda `"hız "` metni ve `hiz` değişkeni takılıdır. | `"hız " + String(hiz)` |
| `[ ]` **uzunluğu** | Metnin karakter sayısını verir. | `(int)String("").length()` |

**ile metin oluştur** bloğuna parça eklemek için dişli simgesine bas. Açılan küçük düzenleme alanında
**öge** parçasını **katıl** parçasının içine sürükle; çıkarmak için dışarı sürükle. Bkz.
[Eğer bloğuna değilse kolu ekle](probot-bloklari-duzenle.md#degilse-kolu-ekle).

<!-- SAY: Metin blokları yazı oluşturuyor. -->

## Değişkenler

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **Değişken oluştur...** | Yeni değişken adı sorar. | Kod üretmez. |
| `ad ▾` `[ ]` **ayarla** | Değişkene değer verir. | `ad = 0;` |
| `ad ▾` `[1]` **göre değiştir** | Değişkenin değerini verilen miktar kadar artırır. | `ad += 1;` |
| `ad ▾` | Değişkenin değerini verir. | `ad` |

Bir değişkeni kullanan blok varsa kodun "// --- Tanımlar (bloklardan) ---" bölümüne
`double ad = 0;  // Blockly değişkeni` satırı eklenir.

Ayrıntı: [Değişken oluştur ve kullan](probot-degisken-kullan.md).

<!-- SAY: Değişken blokları değer saklıyor ve okuyor. -->
