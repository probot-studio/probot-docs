---
title: Lineer Hareket Mekanizmaları (Slider + Elevator)
---

# Lineer Hareket Mekanizmaları

## Bu Sayfada Ne Anlatıyoruz?
Slider ve Elevator için konum/hız geri bildirimiyle hedefe gitmeyi ve orada kalmayı ele alıyoruz. mm/tık hesabı, test, dahili PID ve güvenlik (homing, soft limit) konularına kısa bir giriş yapıyoruz.

## Giriş
Lineer hareket mekanizmalarında ilk akla gelen yaklaşım genellikle oldukça basittir: “Motora biraz güç ver, mekanizma istediğimiz yerde dursun.” Ancak pratikte işler bu kadar kolay değildir. Örneğin, pilin şarjı azaldığında veya mekanizmadaki sürtünme arttığında, dün aynı güçle duran mekanizma bugün aşağıya sarkabilir ya da hedefte kalamayabilir. Bu yüzden, sadece motora güç vermek yeterli olmaz.

Bunun yerine, mekanizmanın gerçek konumunu ve hızını sürekli olarak ölçmek gerekir. Bu amaçla genellikle bir encoder (konum/hız sensörü) kullanılır. Ayrıca, sistem ilk açıldığında mekanizmanın nerede olduğunu anlamak için bir “homing” (referans alma) işlemi yapılır. Güvenli çalışma için de mekanizmanın hareket edebileceği sınırları yazılımsal olarak belirleriz (soft limit). Şimdi, bu temel kavramları kısa bir donanım tanımı ve iki yardımcı fonksiyonla pratiğe dökeceğiz: böylece mekanizma hem hedefe gidecek hem de orada güvenle kalacak.

!!! warning "Değerleri doldurun"
    Aşağıdaki kod bloklarında tambur çapı, kasnak dişi, encoder CPR ve PID sabitleri gibi alanlar `DOLDUR` olarak işaretlenmiştir. Robotunuza uygun değerleri girmeden bu kodları çalıştırmayın.

## Slider (Kızak Kiti)
### Ne Yapar?
Slider, bir noktadan diğerine uzayıp kısalan doğrusal bir kızaktır. Sahada sık gördüğümüz işler için kullanırız: objeyi ileri‑geri konumlamak, kolun ulaştığı menzili arttırmak, atış yüksekliğini ayarlamak gibi. İyi bir slider, “şuraya git ve orada kal” cümlesini güvenle yerine getirir: hedefe yaklaşırken yumuşar, yerine oturduğunda sarkmadan bekler; sürücü de gözünü oyundan ayırmaz.

### Yapı ve Seçenekler

#### Tek motor + kayış (GT2 benzeri aktarım)
Tek bir motor, kasnak ve kayışla arabayı ileri‑geri taşır. Basit, hafif ve hızlıdır.
```cpp
// Slider sabitleri (doldurmanız gerekir)
const float  kPulleyPitchMM      = /* DOLDUR: GT2 genelde 2.0f mm/diş */;
const int    kPulleyTeeth        = /* DOLDUR: ör. 16, 20, 24 diş */;
const float  kPulleyCircMM       = kPulleyPitchMM * kPulleyTeeth; // mm/tur
const int    kEncoderCPR         = /* DOLDUR: ör. 1024, 2048, 4096 */;
const float  kMmPerTick          = kPulleyCircMM / (float)kEncoderCPR; // mm/tık

// Donanım (örnek arayüzler)
BoardozaMotorDriver sliderMotor(/* PIN/kanal */);
BoardozaEncoder     sliderEnc  (/* PIN A/B  */);

// Yardımcılar: güç ver, ölçü birimi dönüşümleri
void setSliderPower(int16_t power){ // −1000..+1000
  sliderMotor.setPower(power);
}

float  ticksToMm(int32_t ticks){ return (float)ticks * kMmPerTick; }
int32_t mmToTicks(float mm){ return (int32_t)(mm / kMmPerTick); }
```

### Çalıştırma Yöntemleri

#### Test (manuel yukarı/aşağı)
İlk olarak yalnızca test için, bir tuşla ileri (yukarı), bir tuşla geri (aşağı) süreriz.

!!! note "Sadece test içindir"
    Bu yöntem hedefe “tam oturma” sağlamaz; pil/sürtünme değişince farklı davranır. Saha öncesi PID/hedef tabanına geçeceğiz.

```cpp
// handleSliderTest: B/Y ile aşağı/yukarı (örnek)
void handleSliderTest(const probot::io::joystick_api::Joystick& js){
  int16_t cmd = 0;
  if (js.getButtonY())      cmd = +600;  // yukarı/ileri
  else if (js.getButtonB()) cmd = -600;  // aşağı/geri
  setSliderPower(cmd);
}
```

#### Hedefe git (PID ile uzunluk)
Motor sürücünün dahili PID’ini kullanırız: sürücüye Kp/Ki/Kd verip hedef konumu (mm) iletiriz. Hedefe yaklaşırken sürücü yumuşatır; durunca sarkmayı azaltır.
```cpp
// PID sabitleri (doldurmanız gerekir)
const float kKp = /* DOLDUR: başlangıç için küçük değer */;
const float kKi = /* DOLDUR: çoğu durumda 0 ile başlayın */;
const float kKd = /* DOLDUR: küçük bir fren etkisi için düşük değer */;

// Yardımcı: sürücünün pozisyon PID'ini ayarla
void setSliderPID(float kp, float ki, float kd){
  sliderMotor.setPIDConstants(kp, ki, kd);
}

// Yardımcı: dahili PID ile hedefe git (mm)
void setSliderPosMM(float mm){
  sliderMotor.setPositionTicks(mmToTicks(mm));
}

// Örnek kullanım: A ile +50 mm, X ile −50 mm adımla hedef değiştir
static float g_sliderTargetMM = 0.0f;
void handleSliderTargetStep(const probot::io::joystick_api::Joystick& js){
  if (js.getButtonAPressed()) g_sliderTargetMM += 50.0f;
  if (js.getButtonXPressed()) g_sliderTargetMM -= 50.0f;
  setSliderPosMM(g_sliderTargetMM);
}
```
Açıklama: `setSliderPID(Kp,Ki,Kd)` ile sürücüye ayarları veriyoruz; `setSliderPosMM(mm)` dahili PID ile hedefe gider. Mekanik yük/denge değiştikçe tuning gerekir.

#### İki Tuş, Çok Hedef (Önceden Tanımlı Yükseklikler)
Aynı yardımcıları kullanarak (setSliderPID / setSliderPosMM), çok sayıda sabit yüksekliği iki tuşla yönetebiliriz. D‑Pad yukarı/aşağı ile listedeki bir sonraki/önceki hedefe geçeriz; motor sürücüsünün dahili PID’i hedefe yumuşak ve tutarlı şekilde gider.

```cpp
// Önceden tanımlı duraklar (mm) ve durum
const float kSliderStopsMM[] = { 0.0f, 120.0f, 240.0f, 370.0f };
static int  g_sliderStopIdx  = 0;
static int  g_lastPov        = -1; // POV açı: 0=up, 180=down, -1=none

// D-Pad ile duraklar arasında gez: yukarı -> sonraki, aşağı -> önceki
void handleSliderTwoButtonTargets(const probot::io::joystick_api::Joystick& js){
  int pov = js.getPOV();
  if (pov == 0   && g_lastPov != 0)   { // up edge
    int last = (int)(sizeof(kSliderStopsMM)/sizeof(kSliderStopsMM[0])) - 1;
    if (g_sliderStopIdx < last) g_sliderStopIdx++;
    setSliderPosMM(kSliderStopsMM[g_sliderStopIdx]);
  }
  if (pov == 180 && g_lastPov != 180) { // down edge
    if (g_sliderStopIdx > 0) g_sliderStopIdx--;
    setSliderPosMM(kSliderStopsMM[g_sliderStopIdx]);
  }
  g_lastPov = pov;
}
```

### Kurulum ve Güvenlik
Slider’da küçük bir hata büyük bir harekete dönüşebilir; kurulumda şu adımlar hayat kurtarır:

 - İlk kurulumda “boşta” başlatın: kayış takılı değilken motor/encoder doğru yönde mi görün, küçük adımlarla test edin.
 - Bir turda kaç mm gittiğini ölçün: kasnak diş sayısı × hatve (mm). Encoder CPR’ı biliyorsanız mm/tık hesaplayın; koda bu değeri girin.
 - Homing yapın: açılışta yavaşça referans anahtarına gidip “0 mm” tanımlayın; ondan sonra hedef verin.
 - Soft limit koyun: güvenli min‑max uzunluk tanımlayıp PID hedefini bu aralığa sıkıştırın.
 - Mekanik sınırlar: uçlarda çarpma/çakma olmaması için fiziksel tampon ve esneme payı bırakın; yüksek hızda duvara vurmak kayış/arabayı kırabilir.
 - PID ayarı (tuning) sabır ister: önce Kp ile başlayın; küçük adımlarla artırıp hızlı ama taşırmayan bir tepki bulun. Kalan sarkmayı kapatmak için az miktarda Ki ekleyin; yaklaşırken fren etkisi için bir miktar Kd kullanın. Her değişiklikten sonra kısa test yapın ve not alın; “tek değişken” kuralını bozmayın. Bazen mükemmel yoktur; sahada güvenli ve tutarlı olanı seçmek en iyisidir. Ayrıntılı rehber için bkz. [Kapalı Çevrim (PID)](../kapali-cevrim-pid.md){ .u .u--slide .u--internal }.

## Sonraki Adımlar
Konumlandırma eksenleri güvenle çalıştığında, atış ve yerleştirme gibi hassas görevler tutarlı hâle gelir. Devamında preset konumlar ve çakışma korumalarıyla otonom/teleop akışlarını sadeleştirirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 78%; background: linear-gradient(90deg, #49ae3a, #49ae3a)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %78</div>
</div> 

---
<br>

## Elevator (Dikey kaldırıcı)
### Ne Yapar?
Elevator, yükü güvenle yukarı‑aşağı taşıyan dikey bir kaldırma mekanizmasıdır. Sahada genellikle iki iş için kullanırız: oyunu oynarken objeyi istenen yüksekliğe getirip bırakmak ve robot içindeki akışı bir kattan diğerine aktarmak. İyi bir elevator, “şu yüksekliğe çık ve orada sarsılmadan bekle” isteğini yerine getirir: hızlanırken sallanmayı büyütmez, hedefe yaklaşırken yumuşar, durunca aşağı sarkmaz. Zincir/kayış/halat gibi aktarımlarla çalışabilir; tek kademeli (kısa mesafe) ya da teleskopik (uzun mesafe) tasarımlar yaygındır. Encoder ile konum ölçümü ve yazılımda yumuşak duruş (PID) bu sistemin kalbidir.

### Yapı ve Seçenekler

#### Rulmanlı Blok + İp/Halat (Tambur Aktarımı)
Rulmanlı bir kızak bloğu dikey ray üzerinde kayar; hareket, tambura sarılan ip/halat ile sağlanır. Basit, rijit ve bakımı kolaydır. Tambur çapı ve encoder CPR’ına göre mm/tık oranını belirleriz.
```cpp
// Elevator sabitleri (doldurmanız gerekir)
const float  kDrumDiameterMM = /* DOLDUR: ör. 20–40 mm */;
const float  kDrumCircMM     = 3.1416f * kDrumDiameterMM; // mm/tur
const int    kEncoderCPR     = /* DOLDUR: ör. 1024, 2048, 4096 */;
const float  kMmPerTick      = kDrumCircMM / (float)kEncoderCPR; // mm/tık

// Donanım (örnek arayüzler)
BoardozaMotorDriver elevatorMotor(/* PIN/kanal */);
BoardozaEncoder     elevatorEnc  (/* PIN A/B  */);

// Yardımcılar: güç ver, ölçü birimi dönüşümleri
void setElevatorPower(int16_t power){ // −1000..+1000
  elevatorMotor.setPower(power);
}

float  elevTicksToMm(int32_t ticks){ return (float)ticks * kMmPerTick; }
int32_t elevMmToTicks(float mm){ return (int32_t)(mm / kMmPerTick); }
```

#### İki Motor (Daha Fazla Tork)
Yük ağırsa aynı tamburu ortak mile bağlayıp iki motor kullanabilirsiniz. Her iki motor da aynı hedefe gider; sürücülerin dahili PID’i yükü paylaşır.
```cpp
// Donanım (iki motor)
BoardozaMotorDriver elevLeft (/* PIN/kanal */);
BoardozaMotorDriver elevRight(/* PIN/kanal */);

// Yardımcı: güç ver
void setElevatorPower(int16_t power){
  elevLeft.setPower(power);
  elevRight.setPower(power);
}

// Yardımcı: dahili PID ile hedefe git (mm)
void setElevatorPosMM(float mm){
  int32_t tgt = elevMmToTicks(mm);
  elevLeft .setPositionTicks(tgt);
  elevRight.setPositionTicks(tgt);
}
```

### Çalıştırma Yöntemleri

#### Test (manuel yukarı/aşağı)
İlk olarak yalnızca test için, bir tuşla yukarı, bir tuşla aşağı süreriz.

!!! note "Sadece test içindir"
    Bu yöntem hedefe “tam oturma” sağlamaz; pil/sürtünme değişince farklı davranır. Saha öncesi PID/hedef tabanına geçeceğiz.

```cpp
// handleElevatorTest: A/B ile yukarı/aşağı (örnek)
void handleElevatorTest(const probot::io::joystick_api::Joystick& js){
  int16_t cmd = 0;
  if (js.getButtonA())      cmd = +600;  // yukarı
  else if (js.getButtonB()) cmd = -600;  // aşağı
  setElevatorPower(cmd);
}
```

#### Hedefe git (PID ile uzunluk)
Motor sürücünün dahili PID’ini kullanırız: sürücüye Kp/Ki/Kd verip hedef konumu (mm) iletiriz.
```cpp
// PID sabitleri (doldurmanız gerekir)
const float kElevKp = /* DOLDUR: başlangıç için küçük değer */;
const float kElevKi = /* DOLDUR: çoğu durumda 0 ile başlayın */;
const float kElevKd = /* DOLDUR: küçük bir fren etkisi için düşük değer */;

// Yardımcı: sürücünün pozisyon PID'ini ayarla
void setElevatorPID(float kp, float ki, float kd){
  elevatorMotor.setPIDConstants(kp, ki, kd);
}

// Yardımcı: dahili PID ile hedefe git (mm)
void setElevatorPosMM(float mm){
  elevatorMotor.setPositionTicks(elevMmToTicks(mm));
}

// Örnek kullanım: A ile +60 mm, B ile −60 mm adımla hedef değiştir
static float g_elevatorTargetMM = 0.0f;
void handleElevatorTargetStep(const probot::io::joystick_api::Joystick& js){
  if (js.getButtonAPressed()) g_elevatorTargetMM += 60.0f;
  if (js.getButtonBPressed()) g_elevatorTargetMM -= 60.0f;
  setElevatorPosMM(g_elevatorTargetMM);
}
```
Açıklama: `setElevatorPID(Kp,Ki,Kd)` ile sürücüye ayarları veriyoruz; `setElevatorPosMM(mm)` dahili PID ile hedefe gider. Mekanik yük/denge değiştikçe tuning gerekir.

#### İki Tuş, Çok Hedef (Önceden Tanımlı Yükseklikler)
Aynı yardımcıları kullanarak, çok sayıda sabit yüksekliği iki tuşla yönetebiliriz. D‑Pad yukarı/aşağı ile listedeki bir sonraki/önceki hedefe geçeriz; motor sürücüsünün dahili PID’i hedefe yumuşak ve tutarlı şekilde gider.

```cpp
// Önceden tanımlı duraklar (mm) ve durum
const float kElevStopsMM[] = { 0.0f, 150.0f, 300.0f, 450.0f };
static int  g_elevStopIdx  = 0;
static int  g_elevLastPov  = -1; // POV açı: 0=up, 180=down, -1=none

// D-Pad ile duraklar arasında gez: yukarı -> sonraki, aşağı -> önceki
void handleElevatorTwoButtonTargets(const probot::io::joystick_api::Joystick& js){
  int pov = js.getPOV();
  if (pov == 0   && g_elevLastPov != 0)   { // up edge
    int last = (int)(sizeof(kElevStopsMM)/sizeof(kElevStopsMM[0])) - 1;
    if (g_elevStopIdx < last) g_elevStopIdx++;
    setElevatorPosMM(kElevStopsMM[g_elevStopIdx]);
  }
  if (pov == 180 && g_elevLastPov != 180) { // down edge
    if (g_elevStopIdx > 0) g_elevStopIdx--;
    setElevatorPosMM(kElevStopsMM[g_elevStopIdx]);
  }
  g_elevLastPov = pov;
}
```

### Kurulum ve Güvenlik
Elevator’da küçük bir hata büyük bir harekete dönüşebilir; kurulumda şu adımlar hayat kurtarır:
- İlk kurulumda “boşta” başlatın: kayış/halat takılı değilken motor/encoder doğru yönde mi görün, küçük adımlarla test edin.
- Bir turda kaç mm gittiğini ölçün: kasnak diş sayısı × hatve (mm). Encoder CPR’ı biliyorsanız mm/tık hesaplayın; koda bu değeri girin.
- Homing yapın: açılışta yavaşça referans anahtarına gidip “0 mm” tanımlayın; ondan sonra hedef verin.
- Soft limit koyun: güvenli min‑max uzunluk tanımlayıp PID hedefini bu aralığa sıkıştırın.
- Mekanik sınırlar: uçlarda çarpma/çakma olmaması için fiziksel tampon ve esneme payı bırakın; yük ağırsa aşağı yönde sarkmayı engellemek için fren/dişli oranını gözden geçirin.
- PID ayarı (tuning) sabır ister: önce Kp ile başlayın; küçük adımlarla artırıp hızlı ama taşırmayan bir tepki bulun. Kalan sarkmayı kapatmak için az miktarda Ki ekleyin; yaklaşırken fren etkisi için bir miktar Kd kullanın. Ayrıntılı rehber için bkz. [Kapalı Çevrim (PID)](../kapali-cevrim-pid.md){ .u .u--slide .u--internal }.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 78%; background: linear-gradient(90deg, #49ae3a, #49ae3a)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %78</div>
</div> 