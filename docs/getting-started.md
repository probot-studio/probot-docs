---
title: Programlama
---

# Programlama

Bu bölümde proje yapısı, yaşam döngüsü ve temel API hakkında kısa bir özet verilir.

## Yaşam Döngüsü
- `robotInit()` – başlatma
- `teleopInit()` / `teleopLoop()` – manuel kontrol
- `autonomousInit()` / `autonomousLoop()` – adım/zaman tabanlı akış

## Joystick API
Basit örnek:

```cpp
#include <probot/io/joystick_api.hpp>

void teleopLoop(){
  auto js = probot::io::joystick_api::makeDefault();
  float left  = js.getLeftY();
  float right = js.getRightY();
  // chassis.setVelocity(left*100.0f, right*100.0f);
}
``` 