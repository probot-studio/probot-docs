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
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>
#include <probot/devices/sensors/encoder.hpp>
#include <probot/control/pid.hpp>

// Intake sabitleri (doldurmanız gerekir)
const int16_t kIntakeIn  = /* DOLDUR: ör. 500–800 */;
const int16_t kIntakeOut = /* DOLDUR: ör. −800..−500 */;

// Donanım
static probot::motor::BoardozaVNH5019MotorController intakeMotor(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: içeri (+), dışarı (−), dur (0)
// Kullanım: setIntake(kIntakeIn) / setIntake(kIntakeOut) / setIntake(0)
void setIntake(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  intakeMotor.setPower(normalized);
}
```

#### İki motor, iki bağımsız roller
Her roller kendi motoruna sahiptir; farklı hız/kompanzasyon gerekirse esneklik sağlar. İçeri almak için rollerların birbirine doğru dönmesi gerekir; bu yüzden motorlardan birine ters işaret vermeliyiz. İlk denemede oyun objesini dışarı atıyorsa pozitif/negatif işaretlerini değiştirmeliyiz.

```cpp
// Intake sabitleri (doldurmanız gerekir)
const int16_t kIntakeIn  = /* DOLDUR: ör. 500–800 */;
const int16_t kIntakeOut = /* DOLDUR: ör. −800..−500 */;

// Donanım (çift motor)
static probot::motor::BoardozaVNH5019MotorController intakeLeftHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::motor::BoardozaVNH5019MotorController intakeRightHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: içeri (+), dışarı (−), dur (0)
// Kullanım: setIntake(kIntakeIn) / setIntake(kIntakeOut) / setIntake(0)
void setIntake(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  intakeLeftHW.setPower(normalized);     // sol roller
  intakeRightHW.setPower(-normalized);   // sağ roller (ters işaret)
}
```

!!! warning "İlk denemede obje dışarı çıkıyorsa"
    Motor işaretlerini ters çevirmeliyiz. Örnek: solda `-power`, sağda `+power` kullanın. Amaç, rollerların birbirine doğru dönmesidir.

#### Yere bakan tek roller
Objeyi yerden doğrudan alır. Ağız yüksekliği ve yumuşak malzeme kritik olur. Kod tarafı tek motorlu yapı ile aynıdır; yalnızca başlangıç gücünü düşük tutmalıyız.

```cpp
// Tek motorlu yapı ile aynı setIntake() kullanılabilir
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
static probot::motor::BoardozaVNH5019MotorController shooterMotor(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: atıcı gücü
// Kullanım: setShooter(kShootPower) / setShooter(0)
void setShooter(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  shooterMotor.setPower(normalized);
}
```

#### Çift teker (karşılıklı)
Tekerler karşılıklı durur; içeri bakan yüzeyler birbirine doğru döner. Bir motoru ters işaretle sürmeliyiz.
```cpp
// Shooter sabitleri (doldurmanız gerekir)
const int16_t kShootPower = /* DOLDUR: ör. 700–900 */;

// Donanım (karşılıklı iki motor)
static probot::motor::BoardozaVNH5019MotorController shooterLeftHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::motor::BoardozaVNH5019MotorController shooterRightHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: iki teker; biri ters işaret
void setShooter(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  shooterLeftHW.setPower(+normalized);
  shooterRightHW.setPower(-normalized);
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
static probot::motor::BoardozaVNH5019MotorController shooterLeftSameHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::motor::BoardozaVNH5019MotorController shooterRightSameHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: iki teker aynı yönde
void setShooter(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  shooterLeftSameHW.setPower(normalized);
  shooterRightSameHW.setPower(normalized);
}
```

!!! note "RPM kontrollü atış"
    Encoder ile hız kontrolü (PID) ileride eklenecektir. Şimdilik sabit güç ile test yapın.

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
static probot::motor::BoardozaVNH5019MotorController conveyor(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: ileri (+), geri (−), dur (0)
void setConveyor(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  conveyor.setPower(normalized);
}
```

#### İki kademeli hat (iki motor)
Ön bant objeyi içeri alır, arka bant atıcıya taşır; ikisini birlikte sürebiliriz.
```cpp
// Taşıyıcı sabitleri
const int16_t kConvIn  = 600;
const int16_t kConvOut = -600;

// Donanım (iki kademeli)
static probot::motor::BoardozaVNH5019MotorController convFrontHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::motor::BoardozaVNH5019MotorController convRearHW(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);

// Yardımcı: iki bant birlikte
void setConveyor(int16_t power){
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  convFrontHW.setPower(normalized);
  convRearHW .setPower(normalized);
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
