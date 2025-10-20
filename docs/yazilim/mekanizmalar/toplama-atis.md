---
title: Toplama ve Atış (Intake + Shooter + Taşıyıcı + Gripper)
---

# Toplama ve Atış

## Bu Sayfada Ne Anlatıyoruz?
Intake, shooter, konveyör ve gripper için pratik kullanım kalıplarını ve küçük eşleştirme akışlarını özetliyoruz. Basılı tut, toggle ve süreli akışlar gibi sahada işe yarayan kalıplara giriş yapıyoruz.

<!-- Bu sayfada bazı çalışma yöntemlerini birlikte kullanacağız (ör. basılı tut + kısa ters gibi) ve bazı alt sistemleri eşleştireceğiz (ör. shooter hazırken konveyörle besleme). Aşağıda her sistemi kendi içinde sade tutacağız; gerektiğinde sayfa sonlarında küçük eşleştirme notları göreceksiniz. -->

!!! warning "Değerleri doldurun"
    Aşağıdaki kod bloklarında güç/RPM gibi sabitler `DOLDUR` olarak işaretlenmiştir. Robotunuza uygun değerleri girmeden bu kodları çalıştırmayın. Güç değerlerini logluyorsanız (önerilir) bu log satırlarını silmeyin.

## Intake (Alıcı/Besleyici)
### Ne Yapar?
Oyun objesini (top, küp, disk vb.) yerden ya da besleme istasyonundan alıp robotun içine taşır ve bir sonraki sisteme teslim eder (taşıyıcı ya da atıcı). Hızlı ve temiz toplama, maç akışında en çok zaman kazandıran adımdır; iyi bir intake, sürücünün işiyle oyunun hızına yetişmesini sağlar.

### Yapı ve Seçenekler

#### Tek motor, iki roller (kayış/dişli aktarım)
Roller’ı tek bir motordan döndürürüz; mekanik basit, kablolama temizdir. Kodda tek motor tanımlar, iki yöne göre gücü veririz; rollerlar mekanik olarak birlikte döner.

```cpp
// Intake sabitleri (doldurmanız gerekir)
const int16_t kIntakeIn  = /* DOLDUR: ör. 500–800 */;
const int16_t kIntakeOut = /* DOLDUR: ör. −800..−500 */;

// Donanım
BoardozaMotorDriver intakeMotor(/* PIN/kanal */);

// Yardımcı: içeri (+), dışarı (−), dur (0)
// Kullanım: setIntake(kIntakeIn) / setIntake(kIntakeOut) / setIntake(0)
void setIntake(int16_t power){
  intakeMotor.setPower(power);
}
```

#### İki motor, iki bağımsız roller
Her roller kendi motoruna sahiptir; farklı hız/kompanzasyon gerekirse esneklik sağlar. İçeri almak için rollerların birbirine doğru dönmesi gerekir; bu yüzden motorlardan birine ters işaret vermeliyiz. İlk denemede oyun objesini dışarı atıyorsa pozitif/negatif işaretlerini değiştirmeliyiz.

```cpp
// Intake sabitleri (doldurmanız gerekir)
const int16_t kIntakeIn  = /* DOLDUR: ör. 500–800 */;
const int16_t kIntakeOut = /* DOLDUR: ör. −800..−500 */;

// Donanım (çift motor)
BoardozaMotorDriver intakeLeft(/* PIN/kanal */);
BoardozaMotorDriver intakeRight(/* PIN/kanal */);

// Yardımcı: içeri (+), dışarı (−), dur (0)
// Kullanım: setIntake(kIntakeIn) / setIntake(kIntakeOut) / setIntake(0)
void setIntake(int16_t power){
  intakeLeft.setPower(power);    // sol roller
  intakeRight.setPower(-power);  // sağ roller (ters işaret)
}
```

!!! warning "İlk denemede obje dışarı çıkıyorsa"
    Motor işaretlerini ters çevirmeliyiz. Örnek: solda `-power`, sağda `+power` kullanın. Amaç, rollerların birbirine doğru dönmesidir.

#### Yere bakan tek roller
Objeyi yerden doğrudan alır. Ağız yüksekliği ve yumuşak malzeme kritik olur. Kod tarafı tek motorlu yapı ile aynıdır; yalnızca başlangıç gücünü düşük tutmalıyız.

```cpp
// Tek motorlu yapı ile aynı setIntake() kullanılabilir
```

#### RPM kontrollü (kütüphane ile)
Daha sabit bir çekiş için hedef bir hız (RPM) veririz; motor bu hıza tutunur, küçük değişimlerde hız korunur. Bu, objenin “takıla‑kalma” ve hız dalgalanması olmadan içeri alınmasını kolaylaştırır.
```cpp
// Hedef hız (RPM)
const int16_t kIntakeRPM = /* DOLDUR: ör. 800–1500 RPM */;

// Donanım (encoder destekli)
BoardozaRpmMotorDriver intakeMotor(/* PIN/kanal */);

// Yardımcı: hedef RPM ver
void setIntakeRPM(int16_t rpm){
  intakeMotor.setRPM(rpm);
}

int16_t getIntakeRPM(){
  return intakeMotor.getRPM();
}
```

#### Kendi tasarımınızı ekleyin
Bu seçeneklerle sınırlı değiliz. Kendi intake yapınızı kurabilirsiniz; örneğin ağız aralığını ayarlayan ek bir motor ekleyip (aç/kapa mekanizması) burada olmayan bir düzen tasarlayabilirsiniz. Kod tarafında prensip aynı kalır: ilgili motor(lar) için tanım yapacağız ve `setIntake(power)` benzeri net bir fonksiyonla davranışı yöneteceğiz.

### Çalıştırma Yöntemleri
Bu bölümü tek bir yardımcı üzerinden yazacağız. `handleIntake(js)` fonksiyonu, joystick durumuna göre `setIntake(power)` çağrılarını yapar; teleop’ta sadece bu fonksiyonu çağıracağız.

#### Basılı tut (hold)
Tuş basılıyken içeri alır; bırakınca durur. İlk doğrulamalar için idealdir.

!!! note "Ne yapar? Ne zaman kullanılır?"
    Sağ tetik içeri alır, sol tetik ters çalıştırır. Eşik (0.2) üstünde basılı kaldıkça `setIntake(kIntakeIn)` çağrılır; bırakınca `setIntake(0)`. Hızlı test ve ilk sürüş için basit ve güvenlidir.
```cpp
void handleIntake(const probot::io::joystick_api::Joystick& js){
  float rt = js.getRightTrigger();
  float lt = js.getLeftTrigger();
  if (rt > 0.2f) { setIntake(700); return; }
  if (lt > 0.2f) { setIntake(-700); return; }
  setIntake(0);
}
```

#### Aç/Kapat (toggle)
Bir kez bas—çalış, tekrar bas—dur; ikinci tuşla kısa ters verebiliriz.
```cpp
void handleIntake(const probot::io::joystick_api::Joystick& js){
  static bool on = false;
  if (js.getButtonAPressed()) on = !on;
  if (js.getButtonBPressed()) { setIntake(-600); return; }
  setIntake(on ? 600 : 0);
}
```

#### Süreli ve küçük akışlar (pre‑out → slow‑in)
Mekanik tam kusursuz değilse, almadan hemen önce kısa dışarı sonra daha yavaş içeri yöntemi sıkışmayı azaltır.
```cpp
void handleIntake(const probot::io::joystick_api::Joystick& js){
  enum class Phase { Idle, PreOut, SlowIn };
  static Phase phase = Phase::Idle;
  static uint32_t t0 = 0;
  if (js.getButtonYPressed()) { phase = Phase::PreOut; t0 = millis(); }
  switch (phase){
    case Phase::PreOut:
      setIntake(-400);
      if (millis() - t0 >= 150) { phase = Phase::SlowIn; t0 = millis(); }
      break;
    case Phase::SlowIn:
      setIntake(500);
      if (millis() - t0 >= 800) { phase = Phase::Idle; setIntake(0); }
      break;
    default: {
      float rt = js.getRightTrigger();
      float lt = js.getLeftTrigger();
      if (rt > 0.2f)      setIntake(700);
      else if (lt > 0.2f) setIntake(-700);
      else                setIntake(0);
    }
  }
}
```

---
<br>

## Shooter (Atıcı)
### Ne Yapar?
Atıcı, oyunun nesnesini hedefe gönderir. En basit sürümde motora sabit bir güç veririz; bu çalışır ama pil durumu, sürtünme ve ısınma değiştikçe atış hızı da değişir. Daha tutarlı sonuç için bir hedef hız (RPM) belirleyip önce bu hıza çıkmalı, hız kararlı olduğunda beslemeliyiz; bunu hız geri bildirimiyle (PID: hedef hız ile mevcut hız arasındaki farkı sürekli azaltan ayar) yaparız. Bu sayfada sabit güçle başlayacağız; hız kontrollü sürümü ileride ekleyeceğiz.

### Yapı ve Seçenekler

#### Tek motor, tek teker (basit)
Sabit güçle tek tekeri döndürür; hızlı ve basit başlamak için yeterlidir.
```cpp
// Shooter sabitleri (doldurmanız gerekir)
const int16_t kShootPower = /* DOLDUR: ör. 700–900 */;

// Donanım
BoardozaMotorDriver shooterMotor(/* PIN/kanal */);

// Yardımcı: atıcı gücü
// Kullanım: setShooter(kShootPower) / setShooter(0)
void setShooter(int16_t power){
  shooterMotor.setPower(power);
}
```

#### Çift teker (karşılıklı)
Tekerler karşılıklı durur; içeri bakan yüzeyler birbirine doğru döner. Bir motoru ters işaretle sürmeliyiz.
```cpp
// Shooter sabitleri (doldurmanız gerekir)
const int16_t kShootPower = /* DOLDUR: ör. 700–900 */;

// Donanım (karşılıklı iki motor)
BoardozaMotorDriver leftWheel(/* PIN/kanal */);
BoardozaMotorDriver rightWheel(/* PIN/kanal */);

// Yardımcı: iki teker; biri ters işaret
void setShooter(int16_t power){
  leftWheel.setPower(+power);
  rightWheel.setPower(-power);
}
```

!!! warning "Dışarı fırlatıyorsa"
    İşaretleri ters çevirelim; amaç, iç yüzlerin birbirine doğru dönmesi.

#### Çift teker (aynı tarafta)
Tekerler aynı tarafta konumlanır; kayış/dişli ile aynı yönde döndürürüz.
```cpp
// Shooter sabitleri (doldurmanız gerekir)
const int16_t kShootPower = /* DOLDUR: ör. 700–900 */;

// Donanım (aynı tarafta iki motor)
BoardozaMotorDriver leftWheel(/* PIN/kanal */);
BoardozaMotorDriver rightWheel(/* PIN/kanal */);

// Yardımcı: iki teker aynı yönde
void setShooter(int16_t power){
  leftWheel.setPower(power);
  rightWheel.setPower(power);
}
```

#### Çift teker (RPM kontrollü, kütüphane ile)
Kütüphane hız (RPM) hedefini içeride PID ile tutar. Biz yalnızca hedef RPM’i verir ve hazır olunca besleriz.
```cpp
// Hedef hız (RPM)
const int16_t kShootRPM = /* DOLDUR: ör. 2500–4000 RPM */;

// Donanım (encoder destekli)
BoardozaRpmMotorDriver leftWheel(/* PIN/kanal */);
BoardozaRpmMotorDriver rightWheel(/* PIN/kanal */);

// Yardımcı: hedef RPM ver
void setShooterRPM(int16_t rpm){
  leftWheel.setRPM(+rpm);   // karşılıklı düzende biri ters işaretli olabilir
  rightWheel.setRPM(-rpm);
}

int16_t getShooterRPM(){
  // Örn. iki tekerin ortalaması
  return (leftWheel.getRPM() + rightWheel.getRPM()) / 2;
}

// handleShooterRPM: Y tuşu ile spin‑up; hedefe gelince besleme noktasına yorum
void handleShooterRPM(const probot::io::joystick_api::Joystick& js){
  static bool spinUp = false;
  if (js.getButtonYPressed()) { spinUp = true; setShooterRPM(kShootRPM); }
  if (!spinUp) { setShooterRPM(0); return; }

  if (getShooterRPM() >= kShootRPM - 50){
    // TODO: burada konveyöre besleme komutu göndereceğiz (ör. setConveyor(kFeedPower))
    // Besleme kısa sürmeli; sonra hız hedefini korumaya devam ederiz
  }
}
```

### Çalıştırma Yöntemleri
Aşağıdaki yöntemler sahada pratik kullanılan kalıplardır.

#### Basılı tut (sabit güç)
Sağ omuz tuşuna basılıyken atıcı çalışır; bırakınca durur. Hızlanma süresi olduğu için atış mesafesi ilk saniyelerde değişebilir; hızlı doğrulama ve basit test için uygundur.
```cpp
void handleShooter(const probot::io::joystick_api::Joystick& js){
  if (js.getRightBumper()) setShooter(kShootPower); else setShooter(0);
}
```

#### Aç/Kapat (sabit güç)
Bir kez bas—çalış, tekrar bas—dur. Sürücü uzun süre basılı tutmak zorunda kalmaz; sabit atış hızları için eliniz rahat eder.
```cpp
bool shootOn = false;
void handleShooter(const probot::io::joystick_api::Joystick& js){
  if (js.getButtonXPressed()) shootOn = !shootOn;
  setShooter(shootOn ? kShootPower : 0);
}
```

#### Hız kontrollü (RPM)
Y tuşuyla “hızlan” komutunu veririz; hedef RPM’e ulaştığında kısa bir besleme yapılır. Bu yöntem atışları birbirine benzer hale getirir; sabit mesafe/irade gerektiren görevlerde faydalıdır.
```cpp
void handleShooterRPM(const probot::io::joystick_api::Joystick& js){
  static bool spinUp = false;
  if (js.getButtonYPressed()) { spinUp = true; setShooterRPM(kShootRPM); }
  if (!spinUp) { setShooterRPM(0); return; }
  if (getShooterRPM() >= kShootRPM - 50){
    // TODO: burada konveyöre besleme komutu göndereceğiz (ör. setConveyor(kFeedPower))
  }
}
```

---
<br>

## Taşıyıcı (Konveyör/Bant)
### Ne Yapar?
Taşıyıcı, intake’ten gelen oyun objesini robotun içinde doğru noktaya taşır: atıcıya götürür, depolama bölgesine yığar ya da gripper’a teslim eder. En basit haliyle sürekli dönen bir bant/merdane hattıdır; tek parça olabilir veya iki‑üç parçalı “katmanlı” bir hat kurabiliriz. Çok parçalı tasarımda hatlar birbirini besler: ön taşıyıcı objeyi orta banda aktarır, orta bant atıcıya kadar taşır. Bu sayede şasi içinde yolu kısaltabilir, tıkanmaları azaltabilir ve atış anında “hazırda bekleyen” bir nesne bırakabiliriz. İhtiyaca göre dar‑geniş, hızlı‑yavaş bölümler tasarlanır; amaç, objeyi kontrol altında ve aynı yönde akıtmaktır.

### Yapı ve Seçenekler

#### Tek bant, tek motor (basit)
Tek bir bant/merdane ile objeyi ilerletiriz; ilk gün için idealdir.
```cpp
// Taşıyıcı sabitleri
const int16_t kConvIn  = 600;   // ileri/taşı
const int16_t kConvOut = -600;  // geri/boşalt

// Donanım
BoardozaMotorDriver conveyor(/* PIN/kanal */);

// Yardımcı: ileri (+), geri (−), dur (0)
void setConveyor(int16_t power){
  conveyor.setPower(power);
}
```

#### RPM kontrollü (kütüphane ile)
Hedef hız (RPM) ile taşıma sabitlenir; bant hızı doldukça ya da piller zayıfladıkça dahi korunur. Bu, objenin hat içinde takılmadan, titremeden “akmasını” sağlar.
```cpp
// Hedef hız (RPM)
const int16_t kConvRPM = 900;

// Donanım (encoder destekli)
BoardozaRpmMotorDriver conveyor(/* PIN/kanal */);

void setConveyorRPM(int16_t rpm){ conveyor.setRPM(rpm); }
int16_t getConveyorRPM(){ return conveyor.getRPM(); }
```

#### İki kademeli hat (iki motor)
Ön bant objeyi içeri alır, arka bant atıcıya taşır; ikisini birlikte sürebiliriz.
```cpp
// Taşıyıcı sabitleri
const int16_t kConvIn  = 600;
const int16_t kConvOut = -600;

// Donanım (iki kademeli)
BoardozaMotorDriver convFront(/* PIN/kanal */);
BoardozaMotorDriver convRear (/* PIN/kanal */);

// Yardımcı: iki bant birlikte
void setConveyor(int16_t power){
  convFront.setPower(power);
  convRear .setPower(power);
}
```

#### Kendi tasarımınızı ekleyin
Hat genişliğini, silindir kaplamasını (silikon/lastik) ve hızını oyuna göre seçebiliriz. İhtiyaç olursa üçüncü bir kademeyi ekleyip aynı `setConveyor(power)` içinde sürebiliriz.

### Çalıştırma Yöntemleri
Taşıyıcı için ayrı bir tuş atamak zorunda değiliz. Sürücü için daha rahat olan akış şudur: “Al” tuşu intake’i çalıştırırken taşıyıcıyı da ileri sürer; “At” tuşu shooter’ı çalıştırırken taşıyıcıyı kısa süre besleme için kullanır. Bu yüzden burada yalnızca yardımcı fonksiyonu gösteriyoruz; çağrıyı intake/shooter akışlarında yaparız.

```cpp
// Örnek kullanım yerleri (özet):
// handleIntake(js) içinde → setConveyor(kConvIn)
// handleShooterRPM(js) hedefe ulaşınca → setConveyor(kFeedPower) // kısa besleme
// Aksi halde → setConveyor(0)
```

---
<br>

## Gripper (Tutan/Bırakan)
### Ne Yapar?
Gripper, oyunun objesini tutup gerektiğinde bırakır. Kol ucunda “el” gibi çalışır; hizalanmış objeyi nazikçe kavrar, taşıma sırasında düşmesini engeller ve hedefte kontrollü bırakır. Tek veya çift çene olabilir; çoğu tasarımda bir ya da iki servo ile aç‑kapa yapılır. Kavrama gücünü abartmamak önemlidir: yumuşak malzeme (silikon/lastik) ve sınırlı kapanma mesafesi objeyi ezmeden, kaydırmadan tutmayı sağlar. Birden fazla gripper da kullanılabilir; biri hızlı al‑bırak için, diğeri hassas yerleştirme için. Amaç her zaman aynıdır: objeyi kontrollü, tekrarlanabilir ve güvenli şekilde ele almak.

### Yapı ve Seçenekler

#### Tek servo (tek çene ya da paralel mekanizma)
Tek bir servo ile aç‑kapa yaparız; paralel bağlantı varsa iki çene birlikte hareket eder.
```cpp
// Gripper sabitleri
const int16_t kGripOpen  = 30;  // açık pozisyon
const int16_t kGripClose = 90;  // kapalı pozisyon

// Donanım
BoardozaServo gripServo(/* PIN */);

// Yardımcı: konuma git (derece)
void setGripper(int16_t pos){
  gripServo.write(pos);
}
```

#### Çift servo (karşılıklı çene)
Karşılıklı iki çene vardır; biri saat yönünde, diğeri ters yönde kapanır.
```cpp
// Gripper sabitleri
const int16_t kGripOpen  = 30;
const int16_t kGripClose = 90;

// Donanım (iki servo)
BoardozaServo leftGrip(/* PIN */);
BoardozaServo rightGrip(/* PIN */);

// Yardımcı: karşılıklı çeneler (biri ayna görüntüsü)
void setGripper(int16_t pos){
  leftGrip.write(pos);
  rightGrip.write(180 - pos); // ayna yönü için tersle
}
```

### Kurulum ve Güvenlik
Gripper’ı servolar bağlıyken rastgele açılara göndermek tehlikelidir. Önce servoları mekanik bağlantı (kol/çene) takılı değilken güvenli bir nötr açıya (ör. 90°) getirmeliyiz; horn’u bu açıdayken takıp çeneleri ortalamalıyız. Böylece ilk komutta büyük bir savrulma yaşamayız.

Karşılıklı iki servo kullanıyorsak ayna yönlerini netleştirmeliyiz: biri saat yönünde kapanırken diğeri ters yönde kapanır. Çeneler “kapalı” pozisyonda birbirine çarpmamalı; gerekirse kapalı açı aralığını daraltmalıyız. Yazılımsal sınır koymak faydalıdır: açık/kapalı için güvenli min‑max açıları belirleyip komutu bu aralığa sıkıştırırız.

```cpp
// Opsiyonel: güvenli aralığa sıkıştırma örneği
// pos = std::max<int16_t>(kGripOpen, std::min<int16_t>(kGripClose, pos));
```

İlk çalıştırmada küçük adımlarla ilerleyelim: bağlantı yokken 5‑10°’lik hareketlerle boşta test; sonra bağlantıyı takıp düşük hızla aynı hareketi tekrar. Objeyle denemeyi en sona bırakıp çarpma/sıkıştırma riskini azaltırız.

!!! warning "İlk kurulumda büyük salınım riski"
    Servoyu bilmediğiniz bir başlangıç pozisyonunda (ör. 180°) bırakıp kodda doğrudan 0→30° gibi bir komut verirseniz, servo geniş bir yay çizerek hızla hareket edebilir; çeneler veya kollar çarpışıp kırılabilir. Her zaman önce servoyu güvenli nötr açıya getirip horn’u o açıdayken takın; sonra küçük adımlarla sınırları belirleyin.

### Çalıştırma Yöntemleri

#### Toggle (tek tuşla aç/kapa)
Bir kez bas—kapat, tekrar bas—aç. Sürücü için en rahat kalıp.
```cpp
bool gripClosed = false;
void handleGripper(const probot::io::joystick_api::Joystick& js){
  if (js.getButtonAPressed()) gripClosed = !gripClosed; // A: toggle
  setGripper(gripClosed ? kGripClose : kGripOpen);
}
```

#### İki tuşlu (ayrı aç ve kapat)
Bir tuş “aç”, diğer tuş “kapat” olarak atanır; bilinçli kontrol isteyen sürücüler için.
```cpp
void handleGripper(const probot::io::joystick_api::Joystick& js){
  if (js.getButtonXPressed()) setGripper(kGripOpen);   // X: aç
  if (js.getButtonBPressed()) setGripper(kGripClose);  // B: kapat
}
```


---
<br>

## Sonraki Adımlar
Toplama–taşıma–atış zinciri oturduğunda maç ritminiz hızlanır; sürücü daha az tuşla daha çok işi güvenle yapar. Devamında preset akışlar ve hazır koşullar ekleyerek otonom ve teleop entegrasyonunu güçlendirirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 68%; background: linear-gradient(90deg, #61b332, #61b332)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %68</div>
</div> 
