# Probot Core

Probot Core is an Arduino library for the ESP32 board. It opens the robot's WiFi network, serves the Driver Station that runs in the browser and carries the gamepad data to the robot.

The library's name in Arduino IDE is `probot`. These pages describe version 0.4.0. To move code written for 0.3.0: [Move 0.3.0 code](hooklari-yaz.md#gecis).

Source code: [github.com/probot-studio/probot-core](https://github.com/probot-studio/probot-core)

## Who it is for

- Teams that program the Probot kit with Arduino code.
- Anyone who wants to upload the `.ino` code they generated in Blocks to the board and drive the robot from the Driver Station. Blocks generates code for probot-core 0.3. To compile that code with 0.4.0, move it first: [Move 0.3.0 code](hooklari-yaz.md#gecis).
- Students and teachers who get a robot ready for a match made of an autonomous phase and a TeleOp phase.
- Anyone who writes robot code with an AI assistant: [Write code with an AI assistant](yapay-zekayla-kod-yaz.md).

## What it does and does not do

| Probot Core does | Probot Core does not |
|---|---|
| It opens a WiFi access point on the robot. You set the network's name, password and channel in the code: [Set up the robot's WiFi](wifi-ayarla.md). | It does not connect the robot to the school or home WiFi network. The robot broadcasts its own network. |
| It serves the Driver Station from inside the robot. It opens in the browser at `http://192.168.4.1`: [Driver Station interface](arayuz.md). | It does not make you install an app on a phone or computer. It does not need the internet either. |
| It runs the match: mode selection, Init, Start, the autonomous time limit, Stop and the emergency stop: [Write the functions for the match flow](hooklari-yaz.md). | It does not connect the gamepad to the robot directly. The gamepad connects to the device where you open the Driver Station: [Read the gamepad data](kumandayi-oku.md). |
| It carries the gamepad data to the robot. While the robot is not running, or when the connection drops, it resets the sticks and buttons. | It does not give you a motor or servo class. You drive the motor and the servo with your own code: [Drive the motor](motoru-sur.md), [Drive the servo](servoyu-sur.md). |
| It writes text from your code to the **Telemetry** panel on the Driver Station. | It does not compile the code or upload it to the board. Arduino IDE does that: [Set up Arduino IDE for Probot](arduino-ide-kur.md). |
| It lights the status LED on the board according to the match state: [Use the status LED](led-durumu.md). | It does not let you set the LED's color by hand. The LED's color always shows the match state. |
| It measures the battery voltage and shows it on the Driver Station. You build the measuring circuit: [Measure the battery voltage](bataryayi-olc.md). | It does not do block coding. To generate code with blocks: [Blocks](../blocks/index.md). |

## How it works {#nasil-calisir}

When the robot turns on, it broadcasts its own WiFi network. A phone, tablet or computer connects to this network and opens the Driver Station in the browser. The gamepad connects to this device too; the browser sends the gamepad data to the robot over WiFi.

A match has two phases. In the **autonomous** phase, the robot moves with code only, without the gamepad. In the **TeleOp** phase, the driver controls the robot with the gamepad. On the Driver Station, you first select the mode: **Autonomous** or **Teleoperated**. Then you press **Init**, and then **Start**. When the autonomous time is up, the robot stops and **Teleoperated** becomes selected. To start TeleOp, you press **Init** and **Start** again.

In the code, you do not write Arduino's `setup()` and `loop()` functions; the library defines them. Instead, you write three functions for each mode. The loop and stop functions are required, but they can stay empty. The init function is optional.

| Function | When it runs |
|---|---|
| `autonomousInit()` | Once, when you press **Init** while **Autonomous** is selected |
| `autonomousLoop()` | Again and again, during autonomous after **Start** |
| `autonomousStop()` | Once, every time autonomous ends: **Stop**, the time limit, a lost connection, an emergency stop |
| `teleopInit()` | Once, when you press **Init** while **Teleoperated** is selected |
| `teleopLoop()` | Again and again, during TeleOp after **Start** |
| `teleopStop()` | Once, every time TeleOp ends |

When a loop function ends, the library waits 20 ms and calls it again. So a loop runs at most 50 times per second. Each mode has two more optional functions: initLoop, which is called again and again between Init and Start, and start, which runs once at the moment of Start. Details: [Write the functions for the match flow](hooklari-yaz.md).

!!! warning "Warning"
    A large part of connection drops comes from the robot's hardware, not from the code. Before you build the robot, read [Improve the signal quality](sinyali-iyilestir.md).

## Get started

- [First 10 minutes](ilk-10-dakika.md): upload the first code, connect to the robot's network and see a gamepad value on the screen.
- [Driver Station interface](arayuz.md): every tab, every button and indicator.
- [Errors and troubleshooting](sorunlar.md): compile errors, connection problems, LED colors.

## Set up

- [Set up Arduino IDE for Probot](arduino-ide-kur.md): the ESP32 board package, the `probot` library and the partition setting.
- [Set up the robot's WiFi](wifi-ayarla.md): network name, password and channel; changing the channel without uploading code.
- [Improve the signal quality](sinyali-iyilestir.md): power supply, antenna, the board's position and the competition day channel plan.

## Write the code

- [Write the functions for the match flow](hooklari-yaz.md): each mode's init, loop and stop functions, the match flow and the skeleton of the program.
- [Read the gamepad data](kumandayi-oku.md): sticks, buttons, dead zone and gamepad mapping.
- [Drive the motor](motoru-sur.md): drive one motor forward and back with the gamepad.
- [Drive the chassis](sasiyi-sur.md): tank, arcade and mecanum drive.
- [Drive the servo](servoyu-sur.md): move the servo to the angle you want without jitter.
- [Add a mechanism](mekanizma-ekle.md): add a conveyor, an arm with a limit switch and a slider as separate classes.

## Autonomous

- [Write the autonomous](otonom-yaz.md): move the robot without the gamepad, by time and by steps.

## Hardware

- [Measure the battery voltage](bataryayi-olc.md): show the battery voltage on the Driver Station.
- [Use the status LED](led-durumu.md): what the LED colors mean, and an extra signal light.

## Guides

- [Code the example robot from start to finish](ornek-robotu-kodla.md): the full code of a robot, from the chassis to the mechanisms.
- [Narrow down the problem step by step](hatayi-daralt.md): a method to find the problem on a robot that does not work.
- [Write code with an AI assistant](yapay-zekayla-kod-yaz.md): teach the assistant the Probot rules and let it write code.

## Reference

- [Settings macros](makro-listesi.md): all macros you define before `#include <probot.h>`, and their defaults.
- [Functions and state list](fonksiyon-listesi.md): all functions of the library and the robot state fields.

## Glossary

| Term | Meaning |
|---|---|
| Driver Station | The match control screen that the robot serves and that opens in the browser. Its address is `http://192.168.4.1`. |
| Access point (AP) | The WiFi network the robot broadcasts. Its name is the SSID. |
| SSID | The name of the robot's WiFi network. You set it with `PROBOT_WIFI_AP_SSID`. |
| Channel | The 2.4 GHz channel the robot's network broadcasts on, from 1 to 13. Robots that run side by side use different channels. |
| Welcome page | The small page that opens by itself when you connect to the robot's network (captive portal). It has the **Driver Station'ı Aç** (Open Driver Station) button. The welcome page is in Turkish. |
| Macro | A settings line written with `#define`. Probot macros come before the `#include <probot.h>` line. |
| Mode | The phase you select on the Driver Station: **Autonomous** (the autonomous phase) or **Teleoperated** (the TeleOp phase). It changes only while the robot is stopped. In the code it is called OpMode. |
| Hook | A function that the library calls at a given moment of the match, for example `teleopLoop()`. Error messages use this name. |
| Init | The command that gets the selected mode ready for the match. The mode's init function runs. The gamepad reads as 0. |
| Start | The command that runs the selected mode after Init. The mode's loop function is called again and again. |
| Stop | The command that stops the mode that is running or in Init. When the current loop pass ends, the mode's stop function runs. |
| Autonomous | The phase where the robot moves with code only, without the gamepad. Its length is in the **Autonomous süresi** (Autonomous duration) box. Some Driver Station labels are in Turkish. |
| TeleOp | The phase where the driver controls the robot with the gamepad. |
| Transition | The wait after the autonomous time is up. **Teleoperated** is selected; TeleOp starts with **Init** and **Start**. In the code it is called `TRANSITION`. |
| Emergency stop | The **Emergency Stop** button. It cuts the code at once and locks the robot until it restarts. |
| Loop pass | One run of a loop or initLoop function, from start to end. A pass must not take longer than 2 seconds. |
| Telemetry | The text that the code writes with `probot::printf` to the **Telemetry** panel on the Driver Station. |
| Dead zone | The small area in the middle of a stick. Values in this area read as 0; the default is 0.08. |
