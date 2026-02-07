---
title: Joystick API
---

# Joystick API

## Bu Sayfada Ne Anlatıyoruz?
Joystick kavramına ve Probot içindeki temel API'ye kısa bir giriş yapıyoruz. Mapping, deadzone ve basit doğrulama ile girişlerin yapısını anlamanız için temel zemini hazırlıyoruz.

## Joystick Nedir?
Joystick, robotun uzaktan kumandasıdır. Elinizdeki kumandayı sağa-sola veya ileri-geri oynattıkça robotun ne yapmasını istediğinizi söylersiniz; tuşlara bastığınızda da "şimdi" gerçekleşmesini istediğiniz eylemleri tetiklersiniz. Yarışmada teleop sırasında sürücünün kararını hızlı ve anlaşılır biçimde robota aktarmak için joystick kullanırız.

## Mapping (Eşleme) Nedir ve Ne Zaman Değiştirilir?
Farklı kumandaların tuş ve çubuk sıraları değişebilir. Eşleme, "hangi çubuk/tuş hangi isimle okunacak?" sorusunu standartlaştırır. Varsayılan ayar çoğu Xbox düzeninde çalışır; farklı bir kumanda kullanıyorsanız `teleopInit()` içinde adını vererek değiştirebilirsiniz. Küçük titreşimleri azaltmak için "deadzone" kullanılır; isterseniz Y ekseninin yönünü de ters çevirebilirsiniz. Bu iki ayarı `makeDefault(...)` ile kolayca belirleyebilirsiniz.

```cpp
// teleopInit() içinde eşleme seçimi (gerekirse)
// probot::io::joystick_mapping::setActiveByName("standard");
// veya: probot::io::joystick_mapping::setActiveByName("logitech-f310");

// Deadzone/Y yönü seçenekleri (opsiyonel)
// auto js = probot::io::joystick_api::makeDefault({ 0.08f, true });
```

## Probot'ta Joystick Verisi (Genel Bakış)
Joystick verisi web arayüzünden karttaki "gamepad" servisine ulaşır. Bu servis, o anın eksen ve buton anlık görüntüsünü saklar. `probot::io::joystick_api::Joystick` sınıfını kullandığınızda, bu anlık görüntüden okunmuş ve deadzone gibi küçük düzeltmeler uygulanmış değerler elde edersiniz. Bağlantı kurulana kadar eksenler genellikle 0 görünür; bu normaldir.

## Basit Doğrulama: Serial ile Okuma
Aşağıdaki örnek, teleop döngüsünde sadece üç bilgiyi ekrana yazar: sol Y, sağ Y ve D‑Pad yönü (POV). Bağlantı yoksa değerler 0 olabilir; arayüz bağlanınca satırlar hareketlenir.

```cpp
#define PROBOT_WIFI_AP_SSID     "TakimAdi"
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"
#define PROBOT_WIFI_AP_CHANNEL  3

#include <probot.h>
#include <probot/io/joystick_api.hpp>

void robotInit() {}
void robotEnd() {}

void autonomousInit() {}
void autonomousLoop() {}
void autonomousEnd() {}

void teleopInit() {}
void teleopLoop() {
  auto js = probot::io::joystick_api::makeDefault();
  Serial.print("[JS] LY="); Serial.print(js.getLeftY(), 2);
  Serial.print(" RY="); Serial.print(js.getRightY(), 2);
  Serial.print(" POV="); Serial.println(js.getPOV());
}
void teleopEnd() {}
```
