# Otonomu yaz

Bu sayfada robotun Start'tan sonra kumandasız yaptığı hareketleri süreli adımlar, mesafe ve saha noktalarıyla koda dökeceksin.

## Başlamadan önce

- Robot kumandayla sürülebiliyor: [Şasiyi sür](sasiyi-sur.md).
- Maç akışındaki fonksiyonları tanıyorsun: [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md).

## Otonom nasıl çalışır {#otonom}

Driver Station'ın **Match Control** bölümünde önce modu seçersin: **Autonomous** ya da **Teleoperated**. Otonomda robotu kumanda değil kod sürer.

| Olay | Çalışan fonksiyon |
|---|---|
| **Autonomous** seçiliyken **Init**'e basıldı | `autonomousInit()` bir kez, sonra **Start**'a kadar `autonomousInitLoop()` tekrar tekrar |
| **Start**'a basıldı | `autonomousStart()` bir kez, sonra `autonomousLoop()` tekrar tekrar |
| **Autonomous süresi** doldu | `autonomousStop()` bir kez. **Teleoperated** seçilir, teleop başlamaz |
| **Init**'ten ya da **Start**'tan sonra **Stop**'a basıldı | `autonomousStop()` bir kez |
| Otonomdan sonra **Init Teleop**'a, sonra **Start**'a basıldı | `teleopInit()`, `teleopStart()`, sonra `teleopLoop()` tekrar tekrar |

`autonomousInitLoop()` ve `autonomousStart()` isteğe bağlıdır; yazmazsan boş sayılır. `autonomousLoop()` ve `autonomousStop()` her programda bulunmalıdır.

Init ile Start arasında robot hareket etmemeli. Kütüphane bu sırada kumanda değerlerini sıfır tutar. Motor komutlarını `autonomousInit()`'e değil, `autonomousStart()`'a ya da `autonomousLoop()`'a yaz.

Kütüphane `autonomousLoop()`'un her turundan sonra 20 ms bekler ve fonksiyonu yeniden çağırır. Otonom süresi `autonomousStart()` bitince başlar.

Süre dolunca `autonomousStop()` çalışır ve robot durur. Teleop kendiliğinden başlamaz: sürücü **Init Teleop**'a, sonra **Start**'a basar. Otonomda çalıştırdığın her motoru ve mekanizmayı `autonomousStop()` içinde durdur.

## Otonom süresini ayarla {#otonom-suresi}

1. Driver Station'da **Dashboard** sekmesine bas.
2. **Match Control** bölümünde **Autonomous**'u seç.
3. **Autonomous süresi** kutusuna saniyeyi yaz, ör. `15`. Robot 30 saniyeyle açılır.
4. **Init**'e, sonra **Start**'a bas.

Sonuç: **Countdown** sayacı geri sayar. Sayaç sıfıra inince robot durur, **Teleoperated** seçili olur ve düğmenin yazısı **Init Teleop** olur. Teleop için **Init Teleop**'a, sonra **Start**'a bas.

Mod yalnız robot dururken seçilir. Otonomsuz bir deneme için 2. adımda **Teleoperated**'ı seç.

## Beklemeyi millis() ile yap {#bekleme}

Bir `autonomousLoop()` turu 2 saniyeden (`PROBOT_LOOP_DEADLINE_MS`, 2000 ms) uzun sürerse kütüphane turu takılmış sayar. Kumanda girişlerini sıfırlar, durum LED'i kırmızı yanıp söner ve **Telemetry** paneline şu satır düşer:

```text
!! [PB-E301] LOOP STALLED — inputs zeroed, holding safe (no reboot) — docs/hatalar#pb-e301
```

Tur dönünce kırmızı ışık kendiliğinden söner. Kütüphane bu sırada görevi durdurmaz, kartı yeniden başlatmaz.

Bir kez çalışan `autonomousInit()`, `autonomousStart()` ve `autonomousStop()` için sınır 10 saniyedir (`PROBOT_HOOK_DEADLINE_MS`). Sensör kalibrasyonu gibi uzun bir hazırlığı `autonomousInit()`'e koyabilirsin.

!!! warning "Dikkat"
    Kütüphane senin motor pinlerine dokunmaz. `delay(3000)` gibi uzun bir beklemede motorlar son verdiğin komutla dönmeye devam eder. **Stop** ve otonom süresinin bitişi de turun bitmesini bekler.

Bu yüzden uzun `delay()` yazma. Her turda `millis()` ile o adımda geçen süreye bak, süre dolunca sıradaki adıma geç.

## Süreli adımlarla otonom yaz {#durum-makinesi}

En basit otonom, sabit süreli adımlardan oluşur. Her adım bir iş yapar, süresi dolunca sıradakine devreder. Aşağıdaki kod robotu 2 saniye ileri sürer, 0,8 saniye sağa döndürür ve durdurur. Teleopta sol çubuk ileri/geri, sağ çubuk dönüşü sürer.

```cpp
#define PROBOT_WIFI_AP_SSID     "Probot"
#define PROBOT_WIFI_AP_PASSWORD "Probot1234"
#define PROBOT_WIFI_AP_CHANNEL  1

#include <probot.h>

// Pinleri kendi kartına göre değiştir
#define LEFT_RPWM   5
#define LEFT_LPWM   6
#define RIGHT_RPWM  7
#define RIGHT_LPWM  8

// Motor yönü ters ise true yap
#define LEFT_INVERTED  false
#define RIGHT_INVERTED true

void setMotor(uint8_t rpwmPin, uint8_t lpwmPin, float power, bool inverted) {
  if (inverted) power = -power;
  int duty = (int)(fabsf(power) * 255.0f);
  if (duty > 255) duty = 255;
  if (power > 0.02f)       { analogWrite(rpwmPin, duty); analogWrite(lpwmPin, 0); }
  else if (power < -0.02f) { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, duty); }
  else                     { analogWrite(rpwmPin, 0);    analogWrite(lpwmPin, 0); }
}

// İleri/geri + dönüş. Pozitif dönüş robotu sağa çevirir.
void drive(float fwd, float turn) {
  setMotor(LEFT_RPWM,  LEFT_LPWM,  fwd + turn, LEFT_INVERTED);
  setMotor(RIGHT_RPWM, RIGHT_LPWM, fwd - turn, RIGHT_INVERTED);
}

void stopMotors() {
  drive(0.0f, 0.0f);
}

// Init'te çalışır: pinleri hazırlar, motorlar durur
void setupHardware() {
  pinMode(LEFT_RPWM, OUTPUT);
  pinMode(LEFT_LPWM, OUTPUT);
  pinMode(RIGHT_RPWM, OUTPUT);
  pinMode(RIGHT_LPWM, OUTPUT);
  stopMotors();
}

void teleopInit() { setupHardware(); }

void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  drive(js.getLeftY(), js.getRightX());
}

void teleopStop() { stopMotors(); }   // Stop'ta motorlar durur

// ---- Otonom: adım adım ----
enum class Stage { FORWARD, TURN_RIGHT, DONE };
Stage stage = Stage::FORWARD;
uint32_t stageStart = 0;   // içinde bulunulan adımın başladığı an (ms)

void autonomousInit() {
  setupHardware();          // Init: robot kıpırdamaz, yalnız hazırlık
  stage = Stage::FORWARD;   // her denemede baştan başla
}

void autonomousStart() {
  stageStart = millis();    // süre Start anında başlar
}

void autonomousLoop() {
  uint32_t elapsed = millis() - stageStart;   // bu adımda geçen süre (ms)

  switch (stage) {
    case Stage::FORWARD:
      drive(0.6f, 0.0f);
      if (elapsed >= 2000) { stage = Stage::TURN_RIGHT; stageStart = millis(); }
      break;
    case Stage::TURN_RIGHT:
      drive(0.0f, 0.4f);
      if (elapsed >= 800) { stage = Stage::DONE; stageStart = millis(); }
      break;
    case Stage::DONE:
      stopMotors();
      break;
  }
}

void autonomousStop() {
  stopMotors();   // süre sonunda da Stop'ta da motorlar durur
}
```

1. Kodu Arduino IDE'de yeni bir sketch'e yapıştır.
2. Pin ve `_INVERTED` satırlarını kendi robotuna göre değiştir.
3. Kodu karta yükle: [Arduino IDE'yi Probot için kur](arduino-ide-kur.md).
4. Robotu boş bir alana koy. Driver Station'da **Autonomous**'u seç.
5. **Init**'e, sonra **Start**'a bas.

Sonuç: **Init**'te robot kıpırdamaz. **Start**'tan sonra 2 saniye ileri gider, 0,8 saniye sağa döner ve durur. Otonom süresi dolunca düğmenin yazısı **Init Teleop** olur; **Init Teleop**'a, sonra **Start**'a basınca robot kumandayla sürülür.

`autonomousInit()` her **Init**'te çalışır. Değişkenler bir önceki denemeden kalan değeri korur, bu yüzden adımı burada sıfırla. Zamanı `autonomousStart()`'ta al: Init ile Start arasında süre geçebilir. Her adım değişiminde `stageStart` yenilenir, böylece `elapsed` otonomun başından değil o adımın başından beri geçen süreyi ölçer.

Robot ileri yerine geri gidiyorsa ya da ters dönüyorsa o tarafın `_INVERTED` değerini değiştir.

<a id="mesafe-ve-acyla-hareket"></a>
## Mesafe ve açıyla hareket et {#mesafe-ve-aciyla-hareket}

Encoder yokken robot gerçekte ne kadar gittiğini bilemez. Sabit güçte geçen süre ise kabaca sabit bir mesafeye karşılık gelir. İki katsayıyı kendi robotunda ölçersen otonomu "1 metre ileri, 90 derece sağa" diye yazabilirsin.

Otonom, adım listesine bölünür. `GO` adımı metre (pozitif ileri, negatif geri), `TURN` adımı derece (pozitif sağa, negatif sola) alır. Bir adımın süresi katsayılardan hesaplanır. İlk adım `autonomousStart()`'ta başlar. Önceki koddaki `// ---- Otonom: adım adım ----` satırından sonrasını sil ve yerine bunu yaz:

```cpp
// ---- Otonom: mesafe ve açıyla ----
// Kendi robotunda ölç: sabit güçte 1 metre ve 1 derece kaç saniye sürüyor
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // örnek değer
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // örnek değer

enum class Move { GO, TURN };
struct Step { Move type; float amount; };

// GO: metre (+ ileri, - geri). TURN: derece (+ sağa, - sola).
Step plan[] = {
  { Move::GO,   1.0f },    // 1 metre ileri
  { Move::TURN, 90.0f },   // 90 derece sağa
  { Move::GO,   0.5f },    // 0.5 metre ileri
};
const int STEP_COUNT = sizeof(plan) / sizeof(plan[0]);

int      stepIndex    = 0;
uint32_t stepStart    = 0;
uint32_t stepDuration = 0;

// Bir adımı başlatır: motorları sürer, adımın süresini hesaplar
void startStep(int i) {
  stepIndex = i;
  stepStart = millis();
  if (i >= STEP_COUNT) { stopMotors(); return; }   // plan bitti

  Step s = plan[i];
  if (s.type == Move::GO) {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_METER * 1000);    // saniye -> ms
    drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
  } else {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_DEGREE * 1000);   // saniye -> ms
    drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
  }
}

void autonomousInit() {
  setupHardware();   // Init: robot kıpırdamaz
}

void autonomousStart() {
  startStep(0);      // Start anı: ilk adım
}

void autonomousLoop() {
  if (stepIndex < STEP_COUNT && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}

void autonomousStop() {
  stopMotors();
}
```

Katsayıları kendi robotunda ölç:

1. `plan` dizisinde yalnız `{ Move::GO, 1.0f }` satırını bırak, kodu karta yükle.
2. **Autonomous** seçiliyken **Init**'e, sonra **Start**'a bas. Robotun gittiği yolu metreyle ölç.
3. `SEC_PER_METER` değerini eski değer / ölçülen metre olarak değiştir. Ör. 2,3 ile 0,8 m gittiyse `2.3 / 0.8 = 2.875` yaz.
4. Aynısını `{ Move::TURN, 90.0f }` ile yap: `SEC_PER_DEGREE` = eski değer × 90 / ölçülen açı.
5. Asıl planı geri yaz, kodu yükle, **Init**'e ve **Start**'a bas.

Sonuç: Robot 1 metre ileri gider, 90 derece sağa döner, 0,5 metre ileri gider ve durur.

Bu yöntem tank şaside makul çalışır. Mecanum şasinin tekerlekleri kaymaya açık olduğu için süreyle mesafe arasındaki ilişki orada daha az güvenilir.

## Saha noktalarına git {#koordinata-gitme}

Robotun başlangıç konumunu ve yönünü biliyorsan sahada noktalar tanımlayıp robotu sırayla onlara gönderebilirsin. Robot her nokta için önce hedefe döner, sonra aradaki mesafeyi gider. Konum metre, yön derece cinsindendir. Yön 0, başlangıçta bakılan ileri yöndür (+y) ve sağa doğru artar.

Hedef yön `atan2(dx, dy)` ile bulunur. Argüman sırası `dx, dy`'dir, çünkü yön 0 ileriye (+y) karşılık gelir. `normalizeDeg` dönüş açısını -180 ile +180 arasına çeker; robot 350 derece dönmek yerine kısa yoldan 10 derece döner. Mesafe iki nokta arasındaki düz çizginin uzunluğudur.

Önceki koddaki otonom bölümünün yerine bunu yaz:

```cpp
// ---- Otonom: noktalara git ----
const float DRIVE_POWER    = 0.6f;
const float SEC_PER_METER  = 2.3f;     // örnek değer, kendi robotunda ölç
const float TURN_POWER     = 0.6f;
const float SEC_PER_DEGREE = 0.011f;   // örnek değer, kendi robotunda ölç

enum class Move { GO, TURN };
struct Step  { Move type; float amount; };
struct Point { float x, y; };   // metre

// Başlangıç: (0, 0), yön 0 = ileri (+y). Açı saat yönünde (sağa) artar.
Point waypoints[] = { { 1.0f, 1.0f }, { 1.0f, 2.0f }, { 0.0f, 2.0f } };
const int WP_COUNT = sizeof(waypoints) / sizeof(waypoints[0]);

Step     plan[2 * WP_COUNT];   // her nokta için bir dönüş + bir ileri gitme
int      stepCount = 0, stepIndex = 0;
uint32_t stepStart = 0, stepDuration = 0;

// Açı farkını -180..+180 aralığına çeker: robot kısa yoldan döner
float normalizeDeg(float d) {
  while (d >  180.0f) d -= 360.0f;
  while (d < -180.0f) d += 360.0f;
  return d;
}

// Noktalardan dönüş + ileri gitme adımlarını üretir
void buildPlan() {
  stepCount = 0;
  float x = 0.0f, y = 0.0f, heading = 0.0f;
  for (int i = 0; i < WP_COUNT; i++) {
    float dx = waypoints[i].x - x;
    float dy = waypoints[i].y - y;
    float target = degrees(atan2f(dx, dy));   // yön 0 = +y olduğu için (dx, dy)
    plan[stepCount++] = { Move::TURN, normalizeDeg(target - heading) };
    plan[stepCount++] = { Move::GO,   sqrtf(dx * dx + dy * dy) };
    x = waypoints[i].x; y = waypoints[i].y; heading = target;
  }
}

void startStep(int i) {
  stepIndex = i;
  stepStart = millis();
  if (i >= stepCount) { stopMotors(); return; }

  Step s = plan[i];
  if (s.type == Move::GO) {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_METER * 1000);
    drive(s.amount > 0 ? DRIVE_POWER : -DRIVE_POWER, 0.0f);
  } else {
    stepDuration = (uint32_t)(fabsf(s.amount) * SEC_PER_DEGREE * 1000);
    drive(0.0f, s.amount > 0 ? TURN_POWER : -TURN_POWER);
  }
}

void autonomousInit() {
  setupHardware();
  buildPlan();       // hesap Init'te yapılır, robot kıpırdamaz
}

void autonomousStart() {
  startStep(0);      // Start anı: ilk adım
}

void autonomousLoop() {
  if (stepIndex < stepCount && millis() - stepStart >= stepDuration) {
    startStep(stepIndex + 1);
  }
}

void autonomousStop() {
  stopMotors();
}
```

1. `SEC_PER_METER` ve `SEC_PER_DEGREE`'yi önceki bölümde ölçtüğün değerlerle değiştir.
2. `waypoints` dizisine gidilecek noktaları metre cinsinden yaz.
3. Kodu karta yükle.
4. Robotu başlangıç noktasına, ileri yöne bakacak şekilde koy.
5. **Autonomous** seçiliyken **Init**'e, sonra **Start**'a bas.

Sonuç: Robot 45 derece sağa dönüp (1, 1) noktasına gider. Sonra (1, 2) ve (0, 2) noktalarına geçer ve durur.

## Otonomda mekanizma çalıştır {#hareketi-mekanizmalarla-birlestirmek}

Gerçek bir otonom yalnız sürmez, mekanizmaları da çalıştırır. Her adım hem şasiye hem mekanizmaya komut verir. Adım değişimi süreye ya da bir sensöre bağlanabilir, ör. `digitalRead(LIMIT_TOP) == LOW` olunca sıradaki adıma geç.

Mekanizmaları iki yerde durdur: son adımda ve `autonomousStop()` içinde. `autonomousStop()` hem **Stop**'ta hem otonom süresi dolunca çalışır; böylece teleopa hiçbir mekanizma çalışır hâlde geçmez. Şasiyi sürüp konveyör çalıştıran tam bir örnek: [Örnek robotu baştan sona kodla](ornek-robotu-kodla.md#otonom).

## Sınırlar {#sinirlar}

Bu sayfadaki yöntemlerin hepsi tahmine dayanır. Tekerlek kayar, batarya zayıfladıkça hız düşer, zemin değişir. Robot gerçekte nereye gittiğini ölçmediği için her adımda biraz sapma birikir. Kısa otonomlarda işe yarar, uzun ve hassas hareketlerde güvenilir değildir.

Gerçek hassasiyet için robotun kendi hareketini ölçmesi gerekir: encoder tekerleğin döndüğü yolu, jiroskop robotun açısını verir. Probot Core robotla Driver Station arasındaki iletişimi ve maç akışını sağlar. Encoder okuma, odometri ve PID içermez.

## Sorun mu var?

- **Start'tan sonra robot otonomu yapmıyor, kumandaya yanıt veriyor:** **Teleoperated** seçili. **Stop**'a bas, **Autonomous**'u seç, yeniden **Init** ve **Start**'a bas.
- **Robot Init'e basınca hareket ediyor:** Motor komutu `autonomousInit()` içinde. Komutu `autonomousStart()`'a ya da `autonomousLoop()`'a taşı.
- **Otonom bitti, robot kumandaya yanıt vermiyor:** Teleop kendiliğinden başlamaz. **Init Teleop**'a, sonra **Start**'a bas.
- **Durum LED'i kırmızı yanıp sönüyor:** Bir loop ya da initLoop turu 2 saniyeyi ya da bir init, start veya stop fonksiyonu 10 saniyeyi geçti. Uzun `delay()` ya da yanıt vermeyen bir sensör çağrısı ara: [Hatayı adım adım daralt](hatayi-daralt.md).
- **İkinci denemede otonom son adımdan başlıyor:** Adım değişkenini `autonomousInit()` içinde sıfırla.
- **Otonom bitince bir mekanizma çalışmaya devam ediyor:** O mekanizmayı `autonomousStop()` içinde durdur.

## Sonraki adım

[Örnek robotu baştan sona kodla](ornek-robotu-kodla.md)
