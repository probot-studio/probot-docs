---
title: Joystick API
---

# Joystick API

## Bu Sayfada Ne Anlatıyoruz?
Joystick kavramına ve Probot içindeki temel API'ye kısa bir giriş yapıyoruz. Mapping, deadzone ve basit Serial doğrulama ile girişlerin yapısını anlamanız için temel zemini hazırlıyoruz.

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
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"

#include <probot.h>
#include <probot/io/joystick_api.hpp>
#include <probot/devices/motors/boardoza_vnh5019_motor_controller.hpp>

// Pin eşlemeleri (örnek – kontrolcünüzde EN pinleri 3V3'e bağlıysa -1 bırakın)
#define LEFT_MOTOR_INA   /* DOLDUR */
#define LEFT_MOTOR_INB   /* DOLDUR */
#define LEFT_MOTOR_PWM   /* DOLDUR */
#define LEFT_MOTOR_ENA   -1
#define LEFT_MOTOR_ENB   -1
#define RIGHT_MOTOR_INA  /* DOLDUR */
#define RIGHT_MOTOR_INB  /* DOLDUR */
#define RIGHT_MOTOR_PWM  /* DOLDUR */
#define RIGHT_MOTOR_ENA  -1
#define RIGHT_MOTOR_ENB  -1

// Motor tanımları (tek eksen okuma için bile gerçek kontrolcuyu örnekleyelim)
static probot::motor::BoardozaVNH5019MotorController leftMotor(
  LEFT_MOTOR_INA, LEFT_MOTOR_INB, LEFT_MOTOR_PWM, LEFT_MOTOR_ENA, LEFT_MOTOR_ENB);
static probot::motor::BoardozaVNH5019MotorController rightMotor(
  RIGHT_MOTOR_INA, RIGHT_MOTOR_INB, RIGHT_MOTOR_PWM, RIGHT_MOTOR_ENA, RIGHT_MOTOR_ENB);

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

## Sonraki Adımlar
Girişleri doğru anladığınızda sürüş ve mekanizma kontrolü çok daha tutarlı ilerler. Bundan sonra bağlantı/arayüz doğrulaması, ardından teleop sürüş ve kapalı çevrim adımlarıyla robot davranışı sahada güvenilir hâle gelir.

## İlerleme
<div class="progress"> 
