---
 title: Otonom Başlangıç
---

# Otonom Başlangıç

## Bu Sayfada Ne Anlatıyoruz?
Otonomun temellerine giriş yapıyor ve bilmeniz gereken temel konseptlere değiniyoruz. İlk 30 saniyelik akışı sağlam kurmak için sensör doğrulama, kısa adımlar ve geçişleri özetliyoruz.

> Not: Otonomu gerçekten düzgün yapmak istiyorsanız, saha benzeri bir çalışma alanı kurun. Basit bant çizgileri, birkaç hedef maketi ve duvar aralıkları bile planı gerçekçi test etmenizi sağlar.

- Zemin: bantla başlangıç çizgisi ve 1–2 referans çizgi
- Hedef: karton/3B maket; gerçek yüksekliğe yakın
- Duvar/koridor: 2 tahta/straforla dar geçit

## Neden Otonom?
Maçın ilk 30 saniyesinde sürücü yoktur; robot kendi kendine iş yapmak zorundadır. Oyunu kazanmak için bu kısa sürede olabildiğince puan toplamak kritik önemdedir: “alandan çık – obje al – hedefe bırak” gibi net adımları önceden yazarsınız ve her maçta aynı sonuçları alırsınız. İyi bir otonom, basit ama etkili adımlarla ilk puanları garanti eder ve teleop’a sizi önde başlatır.

## Genel Planlama (Robotunuza Göre)
30 saniyeyi düz bir şerit gibi hayal edin: nereden başlıyoruz, nereye gideceğiz, hangi objeyi alıp nereye bırakacağız? Önce bu resim netleşsin; sonra onu kısa, yazılabilir adımlara böleceğiz.

### Mod Tasarımı (Başlangıç Konumlarına Göre)
2–3 otonom modu hazırlayın (ör. sol başlama, orta başlama, sağ başlama). Her mod için aşağıdaki plan adımlarını ayrı ayrı uygulayın ve test edin; maçta seçim ekranından hızlıca değiştirilebilir olsun. Mod seçimi için bkz. [Arayüz](arayuz.md){ .u .u--slide .u--internal } (ekran seçimi) ve [Joystick API](joystick-api.md){ .u .u--slide .u--internal } (tuşla seçim).

### Başlangıç konumu ve yön
Sahayı gözünüzde canlandırın: robotunuzu yerleştirdiğiniz nokta, ilk göreceği hedef ve boş alanlar. Hakem çizgileri ve duvar aralıklarına bakın; robotun ilk bakış yönünü seçin. İlk hamlede en az manevra gerektirecek açı, genelde en güvenlisidir. Eğer duvara yakın başlıyorsanız, ilk komutu “küçük bir çıkış ve geniş bir dönüş” olarak planlayın; erken çarpışmalar otonomda sıkıntılara sebep olur.

### Hedef listesi (puan–mesafe–risk)
Puan getiren işleri bir tablo gibi düşünün: her hedef için “puan, uzaklık, risk” yazın. Önce en kısa ve temiz puanı alın (ör. alandan çıkış veya hazır objeyi bırakma); sonra taşıma ve hizalama isteyen hedeflere geçin. Zor hedefleri sona bırakmak, bitiş düdüğünde yarım kalan işleri azaltır.

### Güzergah (boşluk payı ve duraklar)
Haritada köşe dönüşlerini geniş yapın; duvarı sıyırmak yerine boşluk bırakın. Tek uzun hamle, küçük bir hatada tüm akışı bozar. Bunun yerine kısa duraklar planlayın: yaklaş, kısa dur, hizalan, devam et. Bu ritim, küçük ölçüm hatalarını tolere eder ve atışı/yerleştirmeyi isabetli kılar.

### Zaman bütçesi
Süreyi önceden paylaştırın (ör. 10 sn çıkış, 5 sn alma, 10 sn bırakma) ve 3–5 sn tampon ayırın. Adım süresi dolarsa oyalanmayın: güvenle kapatıp bir sonrakine geçin. Bu sayede son saniyede yarım kalan hareketler azalır, teleop’a düzenli bağlanırsınız.

### Eşzamanlı küçük işler
Zaman kazandıran küçük paralellikler ekleyin: hedefe yaklaşırken intake’i açmak, hizalanırken shooter’ı önden hızlandırmak gibi. Güvenlik kilitlerini unutmayın (ör. shooter hazır değilse besleme yok). Bu ayarları teleop’ta doğrulayın, sonra otonoma taşıyın; sahada sürpriz yaşamazsınız.

Bu plan netleşince “Hazırlık” ile şasiyi/sensörleri doğrulayın; ardından adımları koda çevireceğiz.

## Hazırlık: Şasi ve Sensör Doğrulaması
Önce teleop’ta şasiyi temiz çalıştırın; ardından kısa bir kalibrasyon yapın. Encoder yönü ve ölçüleri doğru değilse otonom tutarlı olmaz. Şasi için ayrıntılar: [Şasi Kodlama](sasi-kodlama.md){ .u .u--slide .u--internal }.

- Encoder ve ölçekler: teker çevresi (cm) ve mm/tık değerlerini doğrulayın. Lineer/rotasyonel mekanizmalar için bkz. [Lineer Hareket](mekanizmalar/lineer-hareket-mekanizmalari.md){ .u .u--slide .u--internal } (ölçü hesabı), [Rotasyonel Mekanizmalar](mekanizmalar/rotasyonel-mekanizmalar.md){ .u .u--slide .u--internal } (açı kontrolü).
  
  mm/tık formülü:  mm/tık = teker çevresi (mm) / CPR  (ör. 314 mm / 1024 ≈ 0.306 mm/tık)
- IMU: sabitken kalibre edin; mümkünse encoder + IMU’yu birleştirerek dönüşleri daha doğru ölçün.
- Homing: slider/kol gibi eksenleri başta referansa alın; güvenli yazılımsal sınırlar (soft limits) açık olsun. PID mantığı için bkz. [Kapalı Çevrim (PID)](kapali-cevrim-pid.md){ .u .u--slide .u--internal } (PID temeli).
- Şasi parametreleri: mesafe/dönüş doğruluğu için teker çevresi ve iz genişliğini sahada ayarlayın.

```cpp
// Şasi kalibrasyonu (örnek)
chassis.setWheelRadius(/* DOLDUR: cm */);
chassis.setTrackWidth(/* DOLDUR: cm (başlangıç: 24–28) */);
```

Kalibrasyon yöntemi (kısa):
- 3 m düz git → ölçülen farkı not et → teker çevresi katsayısını düzelt
- 90° dön → fazla/eksik dönüyorsa iz genişliğini düzelt
- Kapanış eşiği: mesafe ±2–3 cm, açı ±3–5° kabul; düşük pilde fark artabilir

### Diğer şasiler (kalibrasyon ve parametreler)
Kendi şasinizi kullanabilirsiniz; bunun karşılığında daha fazla kalibrasyon gerekir. Aşağıdaki iskelet, doldurmanız gereken tipik parametreleri gösterir. Kullanılan `Boardoza*` kontrolcü/sensör sınıflarının donanım eşleşmeleri için bkz. [Motor Kontrolü](motor-kontrolu.md){ .u .u--slide .u--internal } ve [Şasi Kodlama](sasi-kodlama.md){ .u .u--slide .u--internal }.

!!! note "Not"
    Bu kodlar, yapabilecekleriniz için örneklerdir; doğrudan çalışan üretim kodu değildir.

```cpp
#include <probot/command/examples/tank_drive.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>
#include <probot/devices/sensors/encoder.hpp>
#include <probot/devices/sensors/imu/imu.hpp>
// ... gerekli diğer başlıklar

// Donanım (DOLDUR)
probot::motor::BoardozaVNH5019MotorController leftMotor(/* INA, INB, PWM[, ENA, ENB] */);
probot::motor::BoardozaVNH5019MotorController rightMotor(/* INA, INB, PWM[, ENA, ENB] */);
probot::sensors::IEncoder* leftEnc  = nullptr;  // DOLDUR
probot::sensors::IEncoder* rightEnc = nullptr;  // DOLDUR
probot::sensors::imu::IImu* imu = nullptr; // DOLDUR

probot::command::examples::TankDrive chassis(&leftMotor, &rightMotor, leftEnc, rightEnc);

// Parametreler (DOLDUR)
const float kWheelRadiusCm  = /* DOLDUR: ör. 5.0f */;
const float kTrackWidthCm   = /* DOLDUR: ör. 25.0f */;
const bool  kInvertLeft     = /* DOLDUR: true/false */;
const bool  kInvertRight    = /* DOLDUR: true/false */;

// Basit Kalman benzeri füzyon yer tutucu (DOLDUR: gerçek model/kovaryans)
// Yeni başlayanlar için: ilk etapta sadece IMU yaw değerini kullanabilirsiniz. Gürültü yüksekse hareketli ortalama deneyin.
struct Kalman1D {
  float x;    // durum (açı)
  float P;    // belirsizlik
  float Q;    // süreç gürültüsü
  float R;    // ölçüm gürültüsü
  void predict(float gyroRate, float dt){
    x += gyroRate * dt; P += Q;
  }
  void update(float meas){
    float K = P / (P + R); x = x + K * (meas - x); P = (1 - K) * P;
  }
} kf = { 0, 1, 0.01f, 0.5f };

float fusedYawDeg(float dt){
  float yawDeg = imu ? imu->yaw() : 0.0f;
  kf.predict(0.0f, dt);
  kf.update(yawDeg);
  return kf.x;
}

void robotInit(){
  leftMotor.begin();
  rightMotor.begin();
  leftMotor.setInverted(kInvertLeft);
  rightMotor.setInverted(kInvertRight);
  if (imu) imu->begin();
}
void autonomousInit(){
  chassis.setWheelRadius(kWheelRadiusCm);
  chassis.setTrackWidth(kTrackWidthCm);
}
void autonomousLoop(){
  static uint32_t tPrev = millis();
  uint32_t tNow = millis();
  float dt = (tNow - tPrev) * 0.001f;
  tPrev = tNow;
  float yaw = fusedYawDeg(dt); // IMU+encoder füzyonu ile yön
  (void)yaw;
  chassis.drivePower(/* DOLDUR: left */, /* DOLDUR: right */);
  // setIntake(...); setShooter(...);
}
```

## Durum Makinesi: Nedir, Neden Kullanırız?
Durum makinesi, bir işi küçük adımlara bölen basit bir düşünme biçimidir. Her adım “başla” ve “bitir” koşullarıyla tanımlıdır; bittiğinde sıradaki adıma geçersiniz. Otonomda işimize yarar çünkü 30 saniyeyi anlaşılır parçalara ayırır: “alandan çık”, “objeyi al”, “hedefe bırak” gibi net hedefler yazmamıza yardım eder.

Bu sadece bir yöntemdir; kullanmak zorunda değilsiniz. İsterseniz tek bir zamanlayıcıyla sıralı komutlar yazabilir ya da sensör tabanlı kurallarla (if/else) akışı yönetebilirsiniz. Ancak durum makinesi, planı sahada anlatmayı ve hatayı bulmayı kolaylaştırır: hangi adımın çalıştığını, hangisinin takıldığını anında görürsünüz.

### Örnek akışlar (kavramsal)
- Çık–Bırak: 80 cm ileri → 30° sağa dön → hazır objeyi bırak.
- Çık–Al–Bırak: 60 cm ileri → intake aç + 40 cm ileri → hedefe dön → bırak.

### Sözde kod (mantık)
Aşağıdaki sözde kod, mantığı gösterir; derlenebilir bir örnek değildir.

```text
state = EXIT_ZONE
startTimer()

loop {
  if (state == EXIT_ZONE && distanceReached(80)) {
    state = TURN; resetTimer()
  } else if (state == TURN && angleReached(30)) {
    state = DROP; resetTimer()
  } else if (state == DROP && timePassed(1000)) {
    state = DONE
  }

  if (timeout(5000)) { goSafeNextState() }
}
```

### Gerçek örnek (kısa)
Aşağıdaki örnek, aynı akışı basit komutlarla gösterir. Burada süre tabanlı bitiş koşulları kullanılır. `setConveyor` gibi çağrılar için bkz. [Toplama & Atış](mekanizmalar/toplama-atis.md){ .u .u--slide .u--internal }.

```cpp
void autonomousInit(){
  chassis.setWheelRadius(/* DOLDUR: cm */);
  chassis.setTrackWidth(/* DOLDUR: cm */);
}

void autonomousLoop(){
  static enum { EXIT_ZONE, TURN, DROP, DONE } st = EXIT_ZONE;
  static uint32_t t0 = millis();

  switch (st){
    case EXIT_ZONE:
      chassis.drivePower(0.5f, 0.5f);
      if (millis() - t0 > /* DOLDUR: süre */) { st = TURN; t0 = millis(); }
      break;
    case TURN:
      chassis.drivePower(0.4f, -0.4f);
      if (millis() - t0 > /* DOLDUR: süre */) { st = DROP; t0 = millis(); }
      break;
    case DROP:
      setConveyor(/* DOLDUR: besleme gücü */);
      if (millis() - t0 > 1000) { setConveyor(0); st = DONE; }
      break;
    default:
      // DONE: bekle veya güvenli bekleme
      break;
  }
}
```

Nasıl başlarız? Kâğıda 3–5 kutu çizip oklarla bağlayın; her ok için mesafe/açı ve geçiş koşulunu yazın. Şasi komutları için bkz. [Şasi Kodlama](sasi-kodlama.md){ .u .u--slide .u--internal } (şasi ayarı).

Zaman aşımı ve kurtarma: Her adım için maksimum süre tanımlayın (örn. 5 sn). Süre aşılırsa güvenli duruma geçin veya sıradaki adıma atlayın; sahada kilitlenme yaşamazsınız.

## Sonraki Adımlar
Kısa ve güvenilir bir otonom, maç başında puanı garanti eder ve teleop’a düzenli bir geçiş sağlar. Devamında preset akışlar, sensör füzyonu ve hata kurtarma ile senaryoları genişletirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 89%; background: linear-gradient(90deg, #30a842, #30a842)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %89</div>
</div> 
