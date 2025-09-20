---
title: Joystick API
---

# Joystick API

Bu sayfada joystick kavramını ve Probot içindeki temel API’yi sade bir dille anlatıyoruz. Hedefimiz, motorlara geçmeden önce girişlerin yapısını anlamak ve çok basit bir `Serial.println` ile verinin geldiğini görmek. Kodu karta yükleyip web arayüzüne bağlanarak canlı test etmeyi bir sonraki sayfada yapacağız.

## Joystick Nedir?
Joystick, robotun uzaktan kumandasıdır. Elinizdeki kumandayı sağa-sola veya ileri-geri oynattıkça robotun ne yapmasını istediğinizi söylersiniz; tuşlara bastığınızda da “şimdi” gerçekleşmesini istediğiniz eylemleri tetiklersiniz. Yarışmada teleop sırasında sürücünün kararını hızlı ve anlaşılır biçimde robota aktarmak için joystick kullanırız.

## Mapping (Eşleme) Nedir ve Ne Zaman Değiştirilir?
Farklı kumandaların tuş ve çubuk sıraları değişebilir. Eşleme, “hangi çubuk/tuş hangi isimle okunacak?” sorusunu standartlaştırır. Varsayılan ayar çoğu Xbox düzeninde çalışır; farklı bir kumanda kullanıyorsanız `teleopInit()` içinde adını vererek değiştirebilirsiniz. Küçük titreşimleri azaltmak için “deadzone” kullanılır; isterseniz Y ekseninin yönünü de ters çevirebilirsiniz. Bu iki ayarı `makeDefault(...)` ile kolayca belirleyebilirsiniz.

```cpp
// teleopInit() içinde eşleme seçimi (gerekirse)
// probot::io::joystick_mapping::setActiveByName("standard");
// veya: probot::io::joystick_mapping::setActiveByName("logitech-f310");

// Deadzone/Y yönü seçenekleri (opsiyonel)
// auto js = probot::io::joystick_api::makeDefault({ 0.08f, true });
```

## Probot’ta Joystick Verisi (Genel Bakış)
Joystick verisi web arayüzünden karttaki “gamepad” servisine ulaşır. Bu servis, o anın eksen ve buton anlık görüntüsünü saklar. `probot::io::joystick_api::Joystick` sınıfını kullandığınızda, bu anlık görüntüden okunmuş ve deadzone gibi küçük düzeltmeler uygulanmış değerler elde edersiniz. Bağlantı kurulana kadar eksenler genellikle 0 görünür; bu normaldir. Bir sonraki sayfada arayüze bağlanınca, kodunuza dokunmadan canlı veriyi göreceksiniz.

## Basit Doğrulama: Serial ile Okuma
Aşağıdaki örnek, teleop döngüsünde sadece üç bilgiyi ekrana yazar: sol Y, sağ Y ve D‑Pad yönü (POV). Bu, girişin akışını ve ölçeklerin doğru geldiğini görmeniz için yeterlidir. Bağlantı yoksa değerler 0 olabilir; arayüz bağlanınca satırlar hareketlenir.

```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]
PROBOT_SET_DRIVER_STATION_PASSWORD("TakiminizIcinGuv3nliBirSifre");

// Pin eşlemeleri (örnek)
#define LEFT_MOTOR_IN1   /* DOLDUR */
#define LEFT_MOTOR_IN2   /* DOLDUR */
#define RIGHT_MOTOR_IN1  /* DOLDUR */
#define RIGHT_MOTOR_IN2  /* DOLDUR */

// Motor tanımları
BoardozaMotorDriver leftMotor(LEFT_MOTOR_IN1, LEFT_MOTOR_IN2);
BoardozaMotorDriver rightMotor(RIGHT_MOTOR_IN1, RIGHT_MOTOR_IN2);

// Zamanlama
const unsigned loopPeriodMs = 20; // her 20 ms'de bir güncelle

void robotInit() {
  // Kart açıldıktan sonra bir kez çalışır: donanımı tanıt, ilk ayarları yap.
}

void robotEnd() {
  // Gün sonunda/kapatırken bir kez çalışır: güvenli durdurma ve temizlik.
}

void autonomousInit() {
  // Otonom moda geçerken bir kez çalışır: başlangıç koşullarını hazırla.
}
void autonomousLoop() {
  // Otonom fazında periyodik çalışır: sensörleri oku, karar ver, uygula.
}

void teleopInit() {
  // Sürücü kontrolüne (teleop) geçerken bir kez çalışır: girişleri hazırla.
}
void teleopLoop() {
  // Teleop fazında periyodik çalışır: joystick'i oku, komutları uygula.
  auto js = probot::io::joystick_api::makeDefault();
  Serial.print("[JS] LY="); Serial.print(js.getLeftY(), 2);
  Serial.print(" RY="); Serial.print(js.getRightY(), 2);
  Serial.print(" POV="); Serial.println(js.getPOV());
  delay(loopPeriodMs);
}
```

## Sonraki Adım: Karta Yükleme ve Arayüzde Doğrulama
Şimdi kodu karta yükleyip web arayüzüne bağlanacağız. Bir sonraki sayfada, gerekli bağlantı adımlarını ve joystick verisini canlı izlemeyi göstereceğiz; böylece bu sayfadaki basit yazdırmanın sahada çalıştığını görmüş olacağız.

## İlerleme
<div class="progress progress--warning">
  <div class="progress__track">
    <div class="progress__bar" style="width: 33%; background: linear-gradient(90deg, #fde68a, #f59e0b)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %33</div>
</div> 