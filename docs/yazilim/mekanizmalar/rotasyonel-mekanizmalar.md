---
title: Rotasyonel Mekanizmalar (Taret + Kol)
---

# Rotasyonel Mekanizmalar

## Bu Sayfada Ne Anlatıyoruz?
Bu sayfa, taret ve kolu özet ve güvenilir bir ritimle kurmamızı netleştirir. Amacımız yalnızca açı tabanlı kontrolle hedefe baktırmak: küçük adımlarla kur, her adımda test et, sahada tekrarlanabilir sonuç al. Homing, yazılımsal sınırlar ve hazır hedefleri kısaca gösterip elinizin altında tutacağız.

!!! warning "Değerleri doldurun"
    Aşağıdaki kod bloklarında encoder CPR, açı ölçekleri ve PID sabitleri gibi alanlar `DOLDUR` olarak işaretlenmiştir. Robotunuza uygun değerleri girmeden bu kodları çalıştırmayın.

## Taret (Turret)
### Ne Yapar?
Bir güvenlik kamerasının döner tabanı ya da sergi standındaki döner platform gibi düşünün: taret, üstteki modülü yatayda çevirerek hedefe baktırır. Teleopta joystick’i az oynattığınızda platform yumuşakça döner; otonomda verilen açıya gidip orada sabit kalır. Başlangıçta homing yaparak referans alır, yazılımsal sınırlarla uçlara çarpmayı önler ve ramp ile ani hareketleri yumuşatır. Shooter/gripper gibi üst bileşenleri hızlıca hizalamanızı sağlar.
### Yapı ve Seçenekler
İki ana seçenek vardır: tek motor + encoder (tam aralık ve geri bildirim) ya da RC servo (hızlı kurulum, 0–180° aralık, sınırlı tork). Aktarım doğrudan kaplin, kayış/dişli ya da döner tabla rulmanı ile yapılır; encoder şaftta veya mafsalda açı bilgisi verir, uçlarda limit switch güvenlik sınırı koyar. Not: Ağır üst yapılarda servo yerine motor+encoder önerilir. Çok motor da kullanabilirsiniz; kod aynı kalır, yalnızca aynı hedefi tüm motorlara uygularsınız.

!!! note "IMU önerisi"
    Encoder ile birlikte bir IMU (jire/ivmeölçer) kullanmak, sarsıntı ve kayma anlarında daha kararlı açı tahmini sağlar. Basit bir füzyon (ör. düşük geçiren filtre + tamamlayıcı filtre) ile encoder ve IMU’yu birleştirerek hedefte daha sakin kalabilirsiniz.

#### Tek Motor (Basit Döner Platform)
Basit ve hafif bir kurulum; bir motor, bir halka/kaplin ve açı ölçümü.
```cpp
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>
#include <probot/devices/sensors/encoder.hpp>

// Taret sabitleri (doldurmanız gerekir)
const int    kEncCPR        = /* DOLDUR: ör. 1024, 2048, 4096 */;
const float  kDegPerTick    = 360.0f / (float)kEncCPR;

// Donanım (örnek arayüzler)
static probot::motor::BoardozaVNH5019MotorController turretMotor(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::sensors::IEncoder* turretEnc = nullptr; // DOLDUR: encoder nesneniz

// Yardımcılar: güç ver, ölçü dönüşümü
void setTurretPower(int16_t power){ // −1000..+1000 → −1..+1
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  turretMotor.setPower(normalized);
}
float ticksToDeg(int32_t ticks){ return (float)ticks * kDegPerTick; }
int32_t degToTicks(float deg){ return (int32_t)(deg / kDegPerTick); }

// PID: kontrolcü içi mod ile hedef açıya git
#include <probot/control/pid.hpp>

static probot::control::PidConfig g_turretPidCfg{
  /* kp */, /* ki */, /* kd */, /* kf */ 0.0f, -1.0f, 1.0f
};

void setTurretPID(float kp, float ki, float kd){
  turretMotor.attachEncoder(turretEnc, kDegPerTick, kDegPerTick);
  g_turretPidCfg.kp = kp;
  g_turretPidCfg.ki = ki;
  g_turretPidCfg.kd = kd;
  turretMotor.setPositionPidConfig(g_turretPidCfg);
}

void setTurretAngleDeg(float deg){
  turretMotor.setPosition(deg);
}

// Örnek kullanım: D-Pad sağ/sol ile açıyı 10° adımla değiştir
static float g_turretTargetDeg = 0.0f;
void handleTurretTargetStep(const probot::io::joystick_api::Joystick& js){
  int pov = js.getPOV();
  static int last = -1;
  if (pov == 90  && last != 90)  g_turretTargetDeg += 10.0f; // right
  if (pov == 270 && last != 270) g_turretTargetDeg -= 10.0f; // left
  setTurretAngleDeg(g_turretTargetDeg);
  last = pov;
}
```

#### İki Motor (Yüksek Tork / Simetrik Tahrik)
Aynı halkayı iki motor ortak mile/kayışa sürer; ağır üst yapılar için idealdir. Ayrıca kod yazmanız gerekmez: motor sayısını artırın ve aynı `setTurretPID(...)` / `setTurretAngleDeg(...)` çağrılarını her iki motora uygulayın. Mantık aynıdır; fark tork ve simetridir.

### Çalıştırma Yöntemleri

!!! warning "Açı tabanlı kontrol"
    Taret için hız/velocity tabanlı döndürme kullanılmaz. Her zaman hedef açı verin; yumuşatma ramp ve yazılımsal sınırlarla sağlanır.

#### Test (manuel sağ/sol)
İlk olarak yalnızca test için, bir tuşla sağa, bir tuşla sola süreriz.

!!! note "Sadece test içindir"
    Bu yöntem hedefte “tam oturma” sağlamaz; pil/sürtünme değişince farklı davranır. Saha öncesi PID/hedef tabanına geçeceğiz.

```cpp
// handleTurretTest: Y/B ile sağ/sol (örnek)
void handleTurretTest(const probot::io::joystick_api::Joystick& js){
  int16_t cmd = 0;
  if (js.getButtonY())      cmd = +600;  // sağa döndür
  else if (js.getButtonB()) cmd = -600;  // sola döndür
  setTurretPower(cmd);
}
```

#### Hedefe git (kontrolcü içi PID ile açı)
Encoder + kontrolcü içi PID kombinasyonu ile hedef açıyı derece cinsinden iletiriz; `BoardozaVNH5019MotorController` modlar arasında geçişi kendisi yönetir.

```cpp
// PID sabitleri (doldurmanız gerekir)
const float kTurretKp = /* DOLDUR: başlangıç için küçük değer */;
const float kTurretKi = /* DOLDUR: çoğu durumda 0 ile başlayın */;
const float kTurretKd = /* DOLDUR: küçük bir fren etkisi için düşük değer */;

// Ayarla ve hedefe git
void handleTurretGotoAngle(const probot::io::joystick_api::Joystick& js){
  setTurretPID(kTurretKp, kTurretKi, kTurretKd);
  static float tgtDeg = 0.0f;
  if (js.getButtonAPressed()) tgtDeg += 10.0f;
  if (js.getButtonXPressed()) tgtDeg -= 10.0f;
  setTurretAngleDeg(tgtDeg);
}
```
Açıklama: `setTurretPID(Kp,Ki,Kd)` ile PID kazançlarını güncelliyoruz; `setTurretAngleDeg(deg)` hedefi doğrudan kontrolcüye gönderir. Mekanik yük/denge değiştikçe tuning gerekir.

#### İki Tuş, Çok Açı (Önceden Tanımlı Duraklar)
Aynı yardımcıları kullanarak çok sayıda sabit açıyı iki tuşla yönetebiliriz. D‑Pad sağ/sol ile listedeki bir sonraki/önceki hedefe geçeriz; hedefler kontrolcü PID modunda olduğu için encoder geri bildirimiyle yumuşak ve tutarlı şekilde gider.

```cpp
// Önceden tanımlı duraklar (derece) ve durum
const float kTurretStopsDeg[] = { -90.0f, -45.0f, 0.0f, 45.0f, 90.0f };
static int  g_turretStopIdx  = 2;   // ortadan başla (0°)
static int  g_turretLastPov  = -1;  // POV açı: 90=sağ, 270=sol, -1=none

// D-Pad ile duraklar arasında gez: sağ -> sonraki, sol -> önceki
void handleTurretTwoButtonTargets(const probot::io::joystick_api::Joystick& js){
  int pov = js.getPOV();
  int last = (int)(sizeof(kTurretStopsDeg)/sizeof(kTurretStopsDeg[0])) - 1;
  if (pov == 90  && g_turretLastPov != 90)  { // right edge
    if (g_turretStopIdx < last) g_turretStopIdx++;
    setTurretAngleDeg(kTurretStopsDeg[g_turretStopIdx]);
  }
  if (pov == 270 && g_turretLastPov != 270) { // left edge
    if (g_turretStopIdx > 0)    g_turretStopIdx--;
    setTurretAngleDeg(kTurretStopsDeg[g_turretStopIdx]);
  }
  g_turretLastPov = pov;
}
```

## Kol (Arm)
### Ne Yapar?
Bir vinç kolunun kontrollü versiyonu gibi düşünün: kol, belirli açılara gidip orada sarsılmadan kalır; yük değişse bile hedefi korumaya çalışır. Teleopta küçük düzeltmeler, otonomda hazır açıya gitme ve bekleme işlerini üstlenir; başlangıçta homing yapar, yazılımsal sınırlar ve ramp ile güvenli hareket eder.

### Yapı ve Seçenekler
İki ana seçenek vardır: motor+encoder (tam aralık, yüksek tork) ya da RC servo (hızlı kurulum, 0–180° aralık, sınırlı tork). Aktarım dişli/kayış ya da doğrudan kaplin olabilir; açı ölçümü için encoder (şafta ya da mafsalda) ve uçlarda limit switch önerilir. Not: Yük arttıkça servo yerine motor+encoder tercih edin. Çok motor da kullanabilirsiniz; kod aynı kalır, yalnızca aynı hedefi tüm motorlara uygularsınız.

!!! note "IMU önerisi"
    Encoder ile birlikte bir IMU’dan (ivmeölçer/jire) gelen açı tahmini, sarsıntı ve dişli boşluklarında konumu daha kararlı tutar. Basit bir tamamlayıcı filtre ile IMU ve encoder bilgisini birleştirerek hedefte daha sakin ve doğru sonuç alırsınız.

### Çalıştırma Yöntemleri

!!! warning "Açı tabanlı kontrol"
    Kol için de hız/velocity tabanlı döndürme kullanılmaz. Hedef açı verin; yumuşatma ramp ve yazılımsal sınırlarla sağlanır.

#### Test (manuel yukarı/aşağı)
İlk olarak yalnızca test için, bir tuşla yukarı, bir tuşla aşağı süreriz.

!!! note "Sadece test içindir"
    Bu yöntem hedefe “tam oturma” sağlamaz; pil/sürtünme değişince farklı davranır. Saha öncesi PID/hedef tabanına geçeceğiz.

```cpp
// Donanım örnekleri (temsilidir)
static probot::motor::BoardozaVNH5019MotorController armMotor(
  /* INA */, /* INB */, /* PWM */, /* ENA veya -1 */, /* ENB veya -1 */);
static probot::sensors::IEncoder* armEnc = nullptr; // DOLDUR: encoder nesneniz

void setArmPower(int16_t power){ // −1000..+1000 → −1..+1
  float normalized = power / 1000.0f;
  if (normalized > 1.0f) normalized = 1.0f;
  if (normalized < -1.0f) normalized = -1.0f;
  armMotor.setPower(normalized);
}

void handleArmTest(const probot::io::joystick_api::Joystick& js){
  int16_t cmd = 0;
  if (js.getButtonY())      cmd = +600;  // yukarı
  else if (js.getButtonB()) cmd = -600;  // aşağı
  setArmPower(cmd);
}
```

#### Hedefe git (PID ile açı)
Hazır açıları adım adım dener ve tekrarlanabilir pozlara güvenle gidersiniz. Hedefe yaklaşırken sistem yumuşar; durduğunda sarkmayı azaltır. Güvenlik için yazılımsal sınırları açık tutun.

```cpp
// Ölçekler (doldurmanız gerekir)
const int   kArmEncCPR     = /* DOLDUR: ör. 1024, 2048, 4096 */;
const float kArmDegPerTick = 360.0f / (float)kArmEncCPR;
int32_t armDegToTicks(float deg){ return (int32_t)(deg / kArmDegPerTick); }

// PID sabitleri (doldurmanız gerekir)
const float kArmKp = /* DOLDUR: başlangıç için küçük değer */;
const float kArmKi = /* DOLDUR: çoğu durumda 0 ile başlayın */;
const float kArmKd = /* DOLDUR: küçük bir fren etkisi için düşük değer */;

static probot::control::PidConfig g_armPidCfg{
  /* kp */, /* ki */, /* kd */, /* kf */ 0.0f, -1.0f, 1.0f
};

void setArmPID(float kp, float ki, float kd){
  armMotor.attachEncoder(armEnc, kArmDegPerTick, kArmDegPerTick);
  g_armPidCfg.kp = kp;
  g_armPidCfg.ki = ki;
  g_armPidCfg.kd = kd;
  armMotor.setPositionPidConfig(g_armPidCfg);
}

void setArmAngleDeg(float deg){
  armMotor.setPosition(deg);
}

void handleArmGotoAngle(const probot::io::joystick_api::Joystick& js){
  setArmPID(kArmKp, kArmKi, kArmKd);
  static float tgtDeg = 0.0f;
  if (js.getButtonAPressed()) tgtDeg += 5.0f;
  if (js.getButtonXPressed()) tgtDeg -= 5.0f;
  setArmAngleDeg(tgtDeg);
}
```

#### İki Tuş, Çok Açı (Önceden Tanımlı Duraklar)
D‑Pad ile hızlı preset seçimi yaparsınız: sağ/sol ile listedeki bir sonraki/önceki açıya gidilir. Sürücü için pratik bir akış sağlar; teleopta aynı hareketleri tekrar eder.

```cpp
const float kArmStopsDeg[] = { -10.0f, 0.0f, 30.0f, 60.0f, 90.0f };
static int  g_armStopIdx  = 1;   // 0°
static int  g_armLastPov  = -1;  // POV: 0=yukarı, 180=aşağı

void handleArmTwoButtonTargets(const probot::io::joystick_api::Joystick& js){
  int pov = js.getPOV();
  int last = (int)(sizeof(kArmStopsDeg)/sizeof(kArmStopsDeg[0])) - 1;
  if (pov == 0   && g_armLastPov != 0)   { // up edge
    if (g_armStopIdx < last) g_armStopIdx++;
    setArmAngleDeg(kArmStopsDeg[g_armStopIdx]);
  }
  if (pov == 180 && g_armLastPov != 180) { // down edge
    if (g_armStopIdx > 0)    g_armStopIdx--;
    setArmAngleDeg(kArmStopsDeg[g_armStopIdx]);
  }
  g_armLastPov = pov;
}
```

## Sonraki Adımlar
Yönlendirme eksenleri hedefe güvenle bakabildiğinde hizalama ve atış daha hızlı ve isabetli olur. Devamında preset açı listeleri ve güvenlik sınırlarıyla teleop/otonom entegrasyonunu sadeleştirirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 83%; background: linear-gradient(90deg, #3eab3d, #3eab3d)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %83</div>
</div> 
