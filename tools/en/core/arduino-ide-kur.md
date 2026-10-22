# Set up Arduino IDE for Probot

On this page, you install the ESP32 board package and the Probot library in Arduino IDE. Then you select the board and the partition scheme, and upload the first example code to the board.

## Before you start

- A Windows, macOS or Linux computer and an internet connection.
- An ESP32 board (the Probot board) and a USB data cable. A charging-only cable does not let the computer see the board.

## Install Arduino IDE {#arduino-ide}

Arduino IDE is the program where you write the code, compile it and send it to the board over USB. Probot code is written in Arduino C++.

1. In your browser, open [arduino.cc/en/software](https://www.arduino.cc/en/software).
2. Download the Arduino IDE 2 installer for your operating system.
3. Run the file and finish the installation. If the old Arduino IDE 1.x is installed, remove it. When both versions are open, they both try to use the USB port.
4. Open Arduino IDE.

Result: The IDE opens with an empty sketch. The sketch contains the `setup()` and `loop()` functions.

## Install the ESP32 board package {#esp32-kart-paketi}

Arduino IDE does not know ESP32 boards on its own. Espressif's board package teaches the IDE how to compile and upload for ESP32.

!!! warning "Warning"
    Probot 0.4.0 needs version 3.x of the board package. If 2.x is installed, update it to 3.x. The
    `ledcAttachChannel` function in the servo examples also comes with 3.x.

1. Select **Tools** > **Board** > **Boards Manager**.
2. In the search box, type `esp32`.
3. In the **esp32 by Espressif Systems** row, select a version that starts with 3.x.
4. Press **Install** and wait for the installation to finish.

Result: The **esp32 by Espressif Systems** row shows the version you selected as "installed".

## Install the libraries {#kutuphaneler}

Probot needs two libraries: the library itself, `probot`, and `Adafruit NeoPixel`, which drives the status LED.

If you generate the code in Blocks, select **0.3.0** in step 3. Blocks generates code for probot-core 0.3, and this code does not compile with 0.4.0. To stay on 0.4.0, move the code: [Move 0.3.0 code](hooklari-yaz.md#gecis).

1. Select **Tools** > **Manage Libraries**.
2. In the search box, type `probot`.
3. In the **probot** row, select **0.4.0** in the version list and press **Install**.
4. If the IDE asks whether to install the missing libraries too, press **Install all**.
5. In the search box, type `adafruit neopixel`. If **Adafruit NeoPixel** is not installed, press **Install**.

Result: In the **File** > **Examples** menu, the **JoystickTest**, **ServoTest** and **TankDrive** examples appear under **probot**.

## Select the board and the partition scheme {#kart-ve-bolumleme}

The board's memory is split into partitions. The **Huge APP** layout gives the code the most space; in return, wireless updates (OTA) are turned off. Probot does not use OTA.

The partition setting is recommended. On the ESP32-S3, the library and the Driver Station use about 80% of the default partition. As your code grows, compiling stops with the "Sketch too big" error. **Huge APP** removes this limit.

!!! warning "Warning"
    The pins in the examples are for the ESP32-S3. On a plain ESP32, GPIO6-11 are connected to the flash memory, and on boards with a WROVER module, GPIO16-17 are connected to the PSRAM. Replace these pins in the examples with free pins such as 25, 26 and 27, and use GPIO34-39 for inputs only.

1. Open the **Tools** > **Board** menu.
2. In the list of ESP32 boards, select **ESP32S3 Dev Module**. If your board is a plain ESP32 and not an ESP32-S3, select **ESP32 Dev Module**.
3. In **Tools** > **Partition Scheme**, select **Huge APP (3MB No OTA/1MB SPIFFS)**.

Result: In the **Tools** menu, the **Board** row shows the board you selected, and the **Partition Scheme** row shows **Huge APP (3MB No OTA/1MB SPIFFS)**.

Check these two rows before every upload.

## Upload the first code {#ilk-yukleme}

Test your setup with the library's own example. While TeleOp runs, **JoystickTest** writes the gamepad values to the **Telemetry** panel of the Driver Station and to the **Serial Monitor**.

1. Select **File** > **Examples** > **probot** > **JoystickTest**.
2. If there are other boards in the classroom, replace the name `"Probot"` in the `PROBOT_WIFI_AP_SSID` line with your robot's name.
3. Connect the board to the computer with the USB data cable.
4. In the **Tools** > **Port** menu, select the board's port. On Windows, a name like `COM3` appears; on Linux and macOS, a name that starts with `/dev/`.
5. In the toolbar, press **Upload** (the right arrow icon).
6. When the upload is done, open **Tools** > **Serial Monitor** and select **115200 baud** in the speed list.

Result: The IDE shows "Done uploading." When the board starts, it writes these lines to the **Serial Monitor** (if you changed the network name, that name appears):

```text
[DS   ] ========================================
[DS   ] WiFi SSID: Probot
[DS   ] Password:  ********
[DS   ] Channel:   3 (macro)
[DS   ] IP Address: 192.168.4.1
[DS   ] ========================================
```

The robot's network appears in the WiFi list of your computer or phone. The example's password is `Probot1234`.

## Having trouble?

- **The port list is empty:** See [The port list is empty or the upload fails](sorunlar.md#port-yok).
- **"Sketch too big":** The partition scheme is wrong. See ["Sketch too big"](sorunlar.md#sketch-too-big).
- **"probot.h: No such file or directory":** The library is not installed. See ["probot.h: No such file or directory"](sorunlar.md#probot-h-yok).
- **"Adafruit_NeoPixel.h: No such file or directory":** See ["Adafruit_NeoPixel.h: No such file or directory"](sorunlar.md#neopixel-yok).

## Next step

[First 10 minutes](ilk-10-dakika.md): write your own first code, connect to the robot's network and read the gamepad.
