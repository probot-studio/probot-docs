# Probot Core

Probot Core is the Arduino library on the ESP32 board that opens the robot's WiFi network, serves the Driver Station that runs in the browser and carries the gamepad data to the robot.

The library's name in Arduino IDE is `probot`. These pages describe version 0.3.0. The code that Probot Blocks generates is also compiled with this version.

Source code: [github.com/probot-studio/probot-core](https://github.com/probot-studio/probot-core)

Most pages of this guide are in Turkish for now. Links to them end with "(in Turkish)".

## Who it is for

- Teams that program the Probot kit with Arduino code.
- Anyone who wants to upload the `.ino` code they generated in Blocks to the board and drive the robot from the Driver Station.
- Students and teachers who get a robot ready for a match made of an autonomous part and a teleop part.
- Anyone who writes robot code with an AI assistant: [Write code with an AI assistant (in Turkish)](../../core/yapay-zekayla-kod-yaz.md).

## What it does and does not do

| Probot Core does | Probot Core does not |
|---|---|
| It opens a WiFi access point on the robot. You set the network's name, password and channel in the code: [Set up the robot's WiFi](wifi-ayarla.md). | It does not connect the robot to the school or home WiFi network. The robot broadcasts its own network. |
| It serves the Driver Station from inside the robot. It opens in the browser at `http://192.168.4.1`: [Driver Station interface (in Turkish)](../../core/arayuz.md). | It does not make you install an app on a phone or computer. It does not need the internet either. |
| It runs the match: Init, the autonomous time, the switch from autonomous to teleop, Stop and the emergency stop: [Write the functions for the match flow (in Turkish)](../../core/hooklari-yaz.md). | It does not connect the gamepad to the robot directly. The gamepad connects to the device where you open the Driver Station: [Read the gamepad data (in Turkish)](../../core/kumandayi-oku.md). |
| It carries the gamepad data to the robot. If the connection drops, it resets the sticks and buttons. | It does not give you a motor or servo class. You drive the motor and the servo with your own code: [Drive the motor (in Turkish)](../../core/motoru-sur.md), [Drive the servo (in Turkish)](../../core/servoyu-sur.md). |
| It writes text from your code to the **Telemetry** panel on the Driver Station. | It does not compile the code or upload it to the board. Arduino IDE does that: [Set up Arduino IDE for Probot](arduino-ide-kur.md). |
| It lights the status LED on the board according to the match state: [Use the status LED (in Turkish)](../../core/led-durumu.md). | It does not let you set the LED's color by hand. The LED's color always shows the match state. |
| | It does not do block coding. To generate code with blocks: [Blocks](../blocks/index.md). |

## How it works {#nasil-calisir}

When the robot turns on, it broadcasts its own WiFi network. A phone, tablet or computer connects to this network and opens the Driver Station in the browser. The gamepad connects to this device too; the browser sends the gamepad data to the robot over WiFi.

A match has two parts. In the **autonomous** part, the robot moves with code only, without the gamepad. When the time is up, **teleop** starts and the driver controls the robot with the gamepad. You start and stop both from the Driver Station.

In the code, you do not write Arduino's `setup()` and `loop()` functions; the library defines them. Instead, you write six functions that match the moments of the match. All six are required, but they can stay empty.

| Function | When it runs |
|---|---|
| `robotInit()` | Once, when you press **Init** on the Driver Station |
| `autonomousInit()` | Once, when you press **Start**, if **Autonomous** is on |
| `autonomousLoop()` | Again and again, during autonomous |
| `teleopInit()` | Once, when teleop starts |
| `teleopLoop()` | Again and again, during teleop |
| `robotEnd()` | Once, when you press **Stop** and at an emergency stop |

When a loop function ends, the library waits 20 ms and calls it again. So a loop runs at most 50 times per second. Details: [Write the functions for the match flow (in Turkish)](../../core/hooklari-yaz.md).

!!! warning "Warning"
    A large part of connection drops comes from the robot's hardware, not from the code. Before you build the robot, read [Improve the signal quality](sinyali-iyilestir.md).

## Start

- [First 10 minutes (in Turkish)](../../core/ilk-10-dakika.md): upload the first code, connect to the robot's network and see a gamepad value on the screen.
- [Driver Station interface (in Turkish)](../../core/arayuz.md): every tab, every button and indicator.
- [Errors and troubleshooting (in Turkish)](../../core/sorunlar.md): compile errors, connection problems, LED colors.

## Set up

- [Set up Arduino IDE for Probot](arduino-ide-kur.md): the ESP32 board package, the `probot` library and the partition setting.
- [Set up the robot's WiFi](wifi-ayarla.md): network name, password and channel; changing the channel without uploading code.
- [Improve the signal quality](sinyali-iyilestir.md): power supply, antenna, the board's position and the competition day channel plan.

## Write the code

- [Write the functions for the match flow (in Turkish)](../../core/hooklari-yaz.md): when the six functions run, and the skeleton of the program.
- [Read the gamepad data (in Turkish)](../../core/kumandayi-oku.md): sticks, buttons, dead zone and gamepad mapping.
- [Drive the motor (in Turkish)](../../core/motoru-sur.md): drive one motor forward and back with the gamepad.
- [Drive the chassis (in Turkish)](../../core/sasiyi-sur.md): tank, arcade and mecanum drive.
- [Drive the servo (in Turkish)](../../core/servoyu-sur.md): move the servo to the angle you want without jitter.
- [Add a mechanism (in Turkish)](../../core/mekanizma-ekle.md): add a conveyor, an arm with a limit switch and a slider as separate classes.

## Autonomous

- [Write the autonomous (in Turkish)](../../core/otonom-yaz.md): move the robot without the gamepad, by time and by steps.

## Hardware

- [Measure the battery voltage (in Turkish)](../../core/bataryayi-olc.md): show the battery voltage on the Driver Station.
- [Use the status LED (in Turkish)](../../core/led-durumu.md): what the LED colors mean, and an extra signal light.

## Guides

- [Code the example robot from start to finish (in Turkish)](../../core/ornek-robotu-kodla.md): the full code of a robot, from the chassis to the mechanisms.
- [Narrow down the problem step by step (in Turkish)](../../core/hatayi-daralt.md): a method to find the problem on a robot that does not work.
- [Write code with an AI assistant (in Turkish)](../../core/yapay-zekayla-kod-yaz.md): teach the assistant the Probot rules and let it write code.

## Reference

- [Settings macros (in Turkish)](../../core/makro-listesi.md): all macros you define before `#include <probot.h>`, and their defaults.
- [Functions and state list (in Turkish)](../../core/fonksiyon-listesi.md): all functions of the library and the robot state fields.

## Glossary

| Term | Meaning |
|---|---|
| Driver Station | The match control screen that the robot serves and that opens in the browser. Its address is `http://192.168.4.1`. |
| Access point (AP) | The WiFi network the robot broadcasts. Its name is the SSID. |
| SSID | The name of the robot's WiFi network. You set it with `PROBOT_WIFI_AP_SSID`. |
| Channel | The 2.4 GHz channel the robot's network broadcasts on, from 1 to 13. Robots that run side by side use different channels. |
| Welcome page | The small page that opens by itself when you connect to the robot's network (captive portal). It has the **Driver Station'ı Aç** (Open Driver Station) button. |
| Macro | A settings line written with `#define`. Probot macros come before the `#include <probot.h>` line. |
| Init | The command that gets the robot ready for the match. `robotInit()` runs; the robot does not move. |
| Start | The command that starts the match. If **Autonomous** is on, autonomous runs first, then teleop. |
| Stop | The command that stops the match. When the current loop pass ends, `robotEnd()` runs. |
| Autonomous | The part where the robot moves with code only, without the gamepad. Its length is the **Autonomous Duration**. |
| Teleop | The part where the driver controls the robot with the gamepad. |
| Emergency stop | The **EMERGENCY STOP** button. It cuts the code at once and locks the robot until it restarts. |
| Loop pass | One run of the `teleopLoop()` or `autonomousLoop()` function, from start to end. A pass must not take longer than 2 seconds. |
| Telemetry | The text that the code writes with `probot::printf` to the **Telemetry** panel on the Driver Station. |
| Dead zone | The small area in the middle of a stick. Values in this area read as 0; the default is 0.08. |
