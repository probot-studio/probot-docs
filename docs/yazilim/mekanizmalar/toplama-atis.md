---
title: Toplama ve Atış (Intake + Shooter + Gripper + Taşıyıcı)
---

# Toplama ve Atış

Bu sayfa, oyun objesini robota alıp hatta taşımayı ve atışı ele alır. Önce Intake’i kuracağız; ardından Shooter ve Gripper’ı özetleyecek, Taşıyıcı’yı iskelet olarak bırakacağız.

## Intake (Alıcı/Besleyici)
### Ne Yapar?
Oyun objesini (top, küp, disk vb.) yerden ya da besleme istasyonundan alıp robotun içine taşır ve bir sonraki sisteme teslim eder (taşıyıcı ya da atıcı). Hızlı ve temiz toplama, maç akışında en çok zaman kazandıran adımdır; iyi bir intake, sürücünün işiyle oyunun hızına yetişmesini sağlar.

### Yapı ve Seçenekler

#### Tek motor, iki roller (kayış/dişli aktarım)
Roller’ı tek bir motordan döndürürüz; mekanik basit, kablolama temizdir. Kodda tek motor tanımlar, iki yöne göre gücü veririz; rollerlar mekanik olarak birlikte döner.

```cpp
// Tek motorlu intake (örnek tanım)
BoardozaMotorDriver intakeMotor(/* PIN/kanal */);

// Intake fonksiyonu: içeri (+), dışarı (−), dur (0)
// power beklenen aralık: −1000..+1000
void setIntake(int16_t power){
  intakeMotor.setPower(power);
}
```

#### İki motor, iki bağımsız roller
Her roller kendi motoruna sahiptir; farklı hız/kompanzasyon gerekirse esneklik sağlar. İçeri almak için rollerların birbirine doğru dönmesi gerekir; bu yüzden motorlardan birine ters işaret vermeliyiz. İlk denemede oyun objesini dışarı atıyorsa pozitif/negatif işaretlerini değiştirmeliyiz.

```cpp
// Çift motorlu intake (örnek tanımlar)
BoardozaMotorDriver intakeLeft(/* PIN/kanal */);
BoardozaMotorDriver intakeRight(/* PIN/kanal */);

// Intake fonksiyonu: içeri (+), dışarı (−), dur (0)
// power beklenen aralık: −1000..+1000
void setIntake(int16_t power){
  intakeLeft.setPower(power);   // sol roller
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

#### Kendi tasarımınızı ekleyin
Bu seçeneklerle sınırlı değiliz. Kendi intake yapınızı kurabilirsiniz; örneğin ağız aralığını ayarlayan ek bir motor ekleyip (aç/kapa mekanizması) burada olmayan bir düzen tasarlayabilirsiniz. Kod tarafında prensip aynı kalır: ilgili motor(lar) için tanım yapacağız ve `setIntake(power)` benzeri net bir fonksiyonla davranışı yöneteceğiz.

### Çalıştırma Yöntemleri
Bu bölümü tek bir yardımcı üzerinden yazacağız. `handleIntake(js)` fonksiyonu, joystick durumuna göre `setIntake(power)` çağrılarını yapar; teleop’ta sadece bu fonksiyonu çağıracağız.

#### Basılı tut (hold)
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
```cpp
void handleIntake(const probot::io::joystick_api::Joystick& js){
  static bool on = false;
  if (js.getButtonAPressed()) on = !on;
  if (js.getButtonBPressed()) { setIntake(-600); return; }
  setIntake(on ? 600 : 0);
}
```

#### Süreli ve küçük akışlar (pre‑out → slow‑in)
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

## Shooter (Atıcı)
### Ne Yapar?
Oyun objesini hedefe fırlatır ya da bırakır; sabit hız ve tekrar edilebilirlik önemlidir.

### Yapı ve Seçenekler
- Çift teker (flywheel) ya da tambur; tek/çift motor; besleme kapısı (gate)
- Hız kontrolü (RPM) için encoder eklenebilir; basit sürümde sabit güç

### Çalıştırma Yöntemleri
- Basılı tut: hızlan → besle; bırakınca dur
- Zamanlamalı makro: X ms hızlan, sonra besle; süre bitince dur
- Güvenlik: intake ile eşzamanlama; geri taşıma riskinde beslemeyi kilitle

## Gripper (Tutan/Bırakan)
### Ne Yapar?
Objeyi tutar ve gerektiğinde bırakır; hassas yerleştirme ve güvenli taşıma için kullanılır.

### Yapı ve Seçenekler
- Paralel çene (servo/dişli), elastik kavrama, tek/çift servo
- Baskı ayarı için servo konumuna sınırlama; yay destekli hafif kavrama

### Çalıştırma Yöntemleri
- Basılı tut: kapat; bırakınca aç
- Toggle: bir kez bas—kapat, tekrar bas—aç
- Süreli: kısa sıkıştır, sonra nominal pozisyona dön

## Taşıyıcı (Konveyör/Bant)
Bu bölüm iskelet olarak bırakılmıştır; Intake tamamlandıktan sonra doldurulacaktır. 