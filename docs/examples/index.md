---
title: Örnekler
---

# Örnekler

Aşağıda bazı temel örneklerin kısa özetleri yer alır. Ayrıntılı kodlar, mevcut sitedeki `content/sections/ornekler` sayfasında yer alır; bu sayfalar zamanla Markdown'a taşınacaktır.

## JoystickTest
- Joystick verisini okur ve Serial'e yazdırır.

```cpp
PROBOT_SET_DRIVER_STATION_PASSWORD("ProBot1234");
void teleopLoop(){
  auto js = probot::io::joystick_api::makeDefault();
  // Serial.printf("axes=%lu buttons=%lu\n", ...);
}
```

## BasicTankDrive
- İki eksenli kapalı çevrim tank sürüş.

```cpp
static probot::controllers::BasicTankDrive chassis(&left, &right);
void teleopLoop(){
  chassis.setVelocity(js.getLeftY()*100.0f, js.getRightY()*100.0f);
}
```

## SliderTest
- D‑Pad ile 10/20/30/40 cm hedeflerine gider.

```cpp
int pov = js.getPOV();
if(pov==0) slider.setTargetLength(10.0f);
``` 