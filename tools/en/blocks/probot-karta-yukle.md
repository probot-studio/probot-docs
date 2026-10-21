# Upload the code to the Probot board

Blocks generates the code, but it does not upload it to the board. On this page you use Arduino IDE
to upload the downloaded `.ino` file to the Probot board (ESP32), then connect to the robot's WiFi
network. The full setup is in the Probot Core documentation.

## Before you start

- Arduino IDE installed and set up for Probot: the ESP32 board package, the `probot` and `Adafruit NeoPixel`
  libraries, and the **Huge APP (3MB No OTA/1MB SPIFFS)** partition scheme. See [Probot Core: Arduino IDE setup (in Turkish)](../../core/arduino-ide-kur.md).
- The `.ino` file you downloaded from Blocks. See [Copy or download the code](probot-kodu-al.md).
- A Probot board and a USB data cable.

## Open the file in Arduino IDE

1. In Arduino IDE, select **File** > **Open**.
2. Select the `.ino` file you downloaded.
3. If the IDE offers to move the file into a folder with the same name, press **OK**.

Result: The code opens in the IDE. The first line reads `// Generated with Probot Blocks - probotstudio.com/blocks`.

<!-- SAY: We open the file we downloaded in Arduino IDE. -->

## Upload to the board

!!! warning "Warning"
    If the WiFi password in Blocks is shorter than 8 characters, the code will not compile. First fix
    the password in Blocks, then download the `.ino` again.

1. Connect the board to the computer with a USB data cable. With a charging-only cable, the **Port** list stays empty.
2. In **Tools** > **Board**, check that **ESP32S3 Dev Module** is selected.
3. In **Tools** > **Port**, select the board's port.
4. In **Tools** > **Partition Scheme**, check that **Huge APP (3MB No OTA/1MB SPIFFS)** is selected.
5. In the IDE's toolbar, press **Upload** (the right arrow icon).

Result: Compiling and uploading finish, and the IDE shows "Done uploading." The board restarts. After a
few seconds, the robot's network appears in the computer's WiFi list.

<!-- SAY: We connect the board and upload the code from Arduino IDE. -->

## Connect to the robot's network

!!! note "Note"
    These steps are based on the probot-core 0.3 code that Blocks generates. The Driver Station is
    covered in detail in the library's own documentation.

1. In the WiFi list of your computer or phone, select the robot's network. Its name is the one in the
   **Network (empty = auto)** box in Blocks. If you left it empty, the name starts with `Probot-`.
2. Connect with the password from Blocks. The password is also in the `#define PROBOT_WIFI_AP_PASSWORD` line at the top of the code.
3. A welcome page opens by itself. It shows the robot's network name and the **Driver Station'ı Aç**
   button (in Turkish). Press the button. If the Driver Station opens in the same small window, or the welcome page
   does not open at all, close that window. Then open `http://192.168.4.1` in your normal browser.
4. Connect the gamepad to this device.
5. Press any button on the gamepad. On the Driver Station, "Not Connected" changes to "Connected".
6. On the Driver Station, press **Init**. The same button now reads **Start**.
7. Press **Start**.

Result: The button now reads **Stop**. If **Autonomous** is checked, the **Status** field first shows "Autonomous"
and the autonomous phase runs. When the **Autonomous Duration** is over (30 seconds by default), it shows
"Teleop", and you can drive the robot with the gamepad.

<!-- SAY: We connect to the network the robot creates and open the Driver Station. -->

## Having trouble?

- **The port list is empty:** The USB cable may be a charging-only cable. Use a data cable.
- **"Sketch too big":** The **Partition Scheme** is wrong. Select **Huge APP (3MB No OTA/1MB SPIFFS)**.
- **"probot.h: No such file":** The `probot` library is not installed. Install it from the **Library Manager**.
- **"PROBOT_WIFI_AP_PASSWORD must be at least 8 characters.":** The password is shorter than 8 characters. In Blocks,
  fix the **Password (min. 8)** box, then download the `.ino` again. See [Set up the robot WiFi](probot-wifi-ayarla.md).
- **Other compile errors:** See [Probot Core: Arduino IDE setup (in Turkish)](../../core/arduino-ide-kur.md).

## Next step

[Move blocks to FTC Blocks](probot-ftcye-tasi.md)
