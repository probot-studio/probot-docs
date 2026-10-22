# Driver Station interface

The Driver Station is the match control screen that opens in the browser over the robot's own WiFi network. This page shows every tab, button and indicator.

The address is `http://192.168.4.1`. The page comes from inside the robot, so it does not need the internet. Most section titles and buttons are in English; this page writes them as the screen shows them. Steps to connect to the robot: [Connect to the robot's network](ilk-10-dakika.md#robotun-agina-baglan).

Some Driver Station labels are in Turkish. This page quotes them in Turkish, with their meaning in parentheses.

One device at a time controls the Driver Station. The first device that opens the page becomes the robot's owner. If another device tries to open it, it sees the text "Another client is already connected." If the owner device stays silent for 5 seconds, the place becomes free.

## Top strip {#ust-serit}

| Name | What it does | Related task |
|---|---|---|
| Probot logo, "Probot Studio" and "DRIVER STATION" | The name of the page. The "DRIVER STATION" label is hidden if the screen is narrower than 460 pixels. | |
| **Dashboard**, **Joystick**, **Logs** | Opens the tab. The page opens on **Dashboard**. If the screen is narrower than 760 pixels, the tabs move to a second row below the strip. | |
| Connection indicator | A colored dot, 4 signal bars, the delay (like "12ms") and the robot's free / total memory (like "180/320KB"). The dot is green at 3-4 bars, yellow at 2 and red below that. If the screen is narrower than 460 pixels, the delay and the memory are hidden. | [Measure the signal](sinyali-iyilestir.md#sinyali-olc) |
| PB-E301 band | When a loop pass stalls, a red band appears below the strip. It starts with "PB-E301 · Loop takıldı (deadline miss)" (Loop stalled). It goes away when the pass ends. | [The LED blinks red: the loop stalled](sorunlar.md#pb-e301-deadline-miss-loop-takildi) |

## Dashboard {#dashboard}

![Dashboard tab in TeleOp; Teleoperated selected, Start inactive, three lights green, Battery 12.3 V, Telemetry shows Sol Y: 0.62.](../../core/img/core-dashboard.png)

**Dashboard** has six sections: **Match Phase**, **Match Control**, **System Status**, **Battery**, **Signal** and **Telemetry**.

### Match Phase {#match-phase}

It shows the phase of the match, a short description and the match time.

| Phase | Description | When |
|---|---|---|
| Standby | "Awaiting command" | When the page first opens, and after **Stop** |
| Auto Init | "initLoop çalışıyor" (initLoop is running) and that it waits for Start | After **Init** while **Autonomous** is selected |
| TeleOp Init | "initLoop çalışıyor" and that it waits for Start | After **Init** while **Teleoperated** is selected |
| Autonomous | "Running script · 12.3 s" (the time left) | During autonomous |
| Teleop | "Drivers in control" | During TeleOp |
| Transition | "Auto bitti" (Auto is over) and that it waits for Init for TeleOp | When the autonomous time is up |

**Match Time** is the match clock. When you press **Init** from **Standby**, it goes back to "00:00". It starts counting after **Start**. It does not stop when autonomous ends; it counts through TeleOp. It stops at **Stop**.

### Match Control {#match-control}

The **Match Control** section has the mode list, two buttons, the autonomous time and **Emergency Stop**. The left button's text changes with the match phase: **Init**, **Start**, **Init Teleop** or **Init Auto**.

| Name | What it does | LED on the board | Related task |
|---|---|---|---|
| **Autonomous** / **Teleoperated** | Selects which mode will run. When the robot turns on, **Teleoperated** is selected. You can select it only while the robot is stopped (**Standby** or **Transition**); it locks after **Init**. | | [Follow the match flow](hooklari-yaz.md#mac-akisi) |
| **Init** | The selected mode's `autonomousInit()` or `teleopInit()` function runs once. Then `autonomousInitLoop()` or `teleopInitLoop()` is called again and again. The robot is ready but does not move; the gamepad values read as 0. The button's text becomes **Start**. | Yellow, steady | [Follow the match flow](hooklari-yaz.md#mac-akisi) |
| **Start** | The selected mode's `autonomousStart()` or `teleopStart()` function runs once. Then `autonomousLoop()` or `teleopLoop()` is called again and again. While the robot runs, this button stays inactive. | Orange in autonomous, green in TeleOp, blinking | [Write the autonomous](otonom-yaz.md) |
| **Init Teleop** / **Init Auto** | Appears when the autonomous time is up. TeleOp does not start by itself: press this button first, then **Start**. The robot selects **Teleoperated** by itself; you can change the mode first if you want. | Yellow, blinking | [Write the autonomous](otonom-yaz.md) |
| **Stop** | You can press it while the robot is in **Init** or running. When the current loop pass ends, the selected mode's `autonomousStop()` or `teleopStop()` function runs once and the robot stops. It is also accepted while an **Init** or **Start** command is not yet processed. | Blue, blinking | [Stop the motors on Stop](hooklari-yaz.md#robotend) |
| **Autonomous süresi** (Autonomous duration) | The length of autonomous, in seconds. **−** and **+** change it by 1 second; you can type 1-120. The default is 30. It is sent to the robot when you press **Init** and **Start**. It looks faded while **Teleoperated** is selected. | | [Write the autonomous](otonom-yaz.md) |
| **Countdown** | The time left in autonomous ("12.3 s") and a bar that gets shorter. | | |
| **Emergency Stop** | The emergency stop. It cuts the robot code without waiting for the loop pass to end. If the robot is in **Init** or running, it runs the current mode's `autonomousStop()` or `teleopStop()` function. The robot stays locked until it restarts; **Init** and **Start** do not work. Its shortcut is <kbd>Space</kbd>. | Red, steady | ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi) |

All colors of the LED on the board: [Use the status LED](led-durumu.md).

!!! warning "Warning"
    **Stop** does not cut the robot code in the middle; it waits for the loop pass to end. If the loop stalls, **Stop** is late. If you need to stop the robot at once, press **Emergency Stop** or <kbd>Space</kbd>. <kbd>Space</kbd> works on every tab, and also while you type in a number box; The only time it does not work is while a drop-down list is selected.

If the robot rejects a command (for example, a mode change while the robot runs), **Logs** > **Event Log** gets a line that starts with "Komut reddedildi" (Command rejected) or "Mod değişmedi" (Mode did not change): ["Komut reddedildi": the command is not valid in this phase](sorunlar.md#pb-e409).

<a id="joystick-karti"></a>

### System Status {#system-status}

Three lights show the state of the connection, the robot code and the gamepad. Green means good, yellow means warning, red means a problem.

| Name | Texts | Related task |
|---|---|---|
| **Comms** | "Linked": data comes from the robot. "Degraded": no data for 3 seconds. "Down": no data for 6 seconds. | [If the connection drops](#baglanti-koparsa) |
| **Robot Code** | "Ready": the robot is stopped. "Init": **Init** was done. "Running": autonomous or TeleOp is running. "Waiting": autonomous is over, **Init** is expected. "Stalled": a loop pass stalled. "E-Stop": an emergency stop was done. | [Use the status LED](led-durumu.md) |
| **Joystick** | The gamepad source in use: "Gamepad", "Klavye" (Keyboard) or "Dokunmatik" (Touch). If there is no source, "None". | [Connect the gamepad](ilk-10-dakika.md#kumandayi-bagla) |

### Battery {#battery}

| Name | What it does | Related task |
|---|---|---|
| Indicator | The battery voltage, in volts. It is the average of the last 8 seconds. If no measurement is set up, it shows "--V" and "Veri yok · batarya ölçümü kapalı" (No data · battery measurement off). | [Where you see the value](bataryayi-olc.md#gostergeyi-okumak) |
| Percent and state | The charge of a 3-cell LiPo, in the range 10.5-12.6 V. Above 11.6 V it shows "Nominal", above 11.0 V "Azalıyor" (Getting low), below that it starts with "DÜŞÜK" (LOW). | [Where you see the value](bataryayi-olc.md#gostergeyi-okumak) |

### Signal {#signal}

| Name | What it does | Related task |
|---|---|---|
| Signal bars and dBm | The signal the robot receives from the connected device. | [Measure the signal](sinyali-iyilestir.md#sinyali-olc) |
| **Ping** | The time, in ms, between the page sending a request to the robot and getting the answer. | |
| **Channel** | The robot's WiFi channel. | [Set up the robot's WiFi](wifi-ayarla.md) |
| **Clients** | The number of devices connected to the robot's network. | |

### Telemetry {#telemetry}

| Name | What it does | Related task |
|---|---|---|
| Telemetry panel | Shows the text from `probot::print`, `probot::println` and `probot::printf` in your code. The robot keeps the last 256 bytes; older lines drop off. The panel updates when the text changes. The library's error lines that start with "!!" show in red. While the panel is empty, it shows "probot::telemetry::println() çıktısı burada görünür." (probot::telemetry::println() output appears here.) | [Write to the Telemetry panel](kumandayi-oku.md#telemetri) |
| **Clear** | Removes the text in the panel from the screen. When the code writes something new, the panel fills again. | |
| **Auto-scroll ON** / **Auto-scroll OFF** | When it is on, the panel always shows the last line. When it is off, you can scroll up and read older lines. | |

## Joystick tab {#joystick-sekmesi}

![Joystick tab; in Input Source, Gamepad Etkin (On) and Klavye Kapalı (Off), A pressed in Buttons, Axis 1: -0.62 in Raw Data.](../../core/img/core-joystick.png)

On this tab, you select which source sends data to the robot, and you see what the source sends. The values are not the same as the values the library reads in the code; they are raw values.

### Input Source {#input-source}

| Name | What it does | Related task |
|---|---|---|
| **Gamepad** card | A USB or Bluetooth gamepad. It is selected by itself when you press a button on the gamepad. Its state: "Bağlı değil" (Not connected), "Etkin" (On) or "Bağlı (beklemede)" (Connected, on standby) while the keyboard or touch is on. | [Connect the gamepad](ilk-10-dakika.md#kumandayi-bagla) |
| **Klavye** card | Uses the keyboard like a gamepad. It shows only on a computer. It is not selected by itself; it turns on when you press **Etkinleştir** (Turn on) and turns off when you press **Devre dışı bırak** (Turn off). While it is on, it takes the place of the connected gamepad. | [Drive without a gamepad](kumandayi-oku.md#kumandasiz-sur) |
| **Dokunmatik** card | Turns on driving with sticks on the screen. It shows only on a phone and a tablet. When you press **Etkinleştir**, the [drive screen](#surus-ekrani) opens. The **Sürüş ekranı** (Drive screen) button opens the drive screen again after you close it. | [Drive without a gamepad](kumandayi-oku.md#kumandasiz-sur) |

When the source changes or the gamepad is unplugged, the page sends zero values to the robot at that moment. The motors do not keep running with the last command.

### Keyboard Map {#keyboard-map}

It shows only while the **Klavye** source is on.

| Key | Gamepad equivalent |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Sol çubuk (Left stick) |
| <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Sağ çubuk (Right stick) |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> | **A**, **B**, **X**, **Y** |
| <kbd>Q</kbd> <kbd>E</kbd> | **LB**, **RB** |
| <kbd>Space</kbd> | **Emergency Stop**, always |

### Axes, Buttons and Raw Data {#ham-veri}

| Name | What it does | Related task |
|---|---|---|
| **Axes**: the **SOL** (LEFT) and **SAĞ** (RIGHT) circles | The position of the left and right stick. Below each, the raw X and Y values (like "+0.00 · -0.62"). | [Read the sticks](kumandayi-oku.md#cubuklar) |
| **Buttons** | A pressed button shows in color. Labels: A, B, X, Y, LB, RB, LT, RT, Back, Start, L3, R3; after these P13, P14... | [Read the buttons](kumandayi-oku.md#dugmeler) |
| **Raw Data** gamepad list | The name and order of the connected gamepads ("... (idx 0)"). The first gamepad that shows up is selected by itself. If there are several gamepads, select here the one that sends to the robot. | |
| Source info | The source's name, number of axes and number of buttons (like "Axes: 4  Buttons: 17"). If there is no source, it starts with "Kaynak yok." (No source.) | [Change the gamepad mapping](kumandayi-oku.md#esleme) |
| Axis line | The raw value of each axis ("Axis 1: -0.62"). The browser gives a negative value when you push the stick forward; in the code, `js.getLeftY()` reads forward as positive. | [Read the sticks](kumandayi-oku.md#cubuklar) |
| Button line | The names of the pressed buttons. If none is pressed, "No buttons pressed". | |

## Logs tab {#logs}

![Logs tab; WiFi Configuration, Network Status, History, Event Log and ESP32 System sections.](../../core/img/core-logs.png)

### WiFi Configuration {#wifi-configuration}

| Name | What it does | Related task |
|---|---|---|
| **SSID** | The robot's network name. | [Set up the robot's WiFi](wifi-ayarla.md) |
| **Channel** | The channel and where it comes from: "(macro)" from the code, "(nvs)" from the choice saved on the board, "(auto)" from automatic selection. | [Change the channel without uploading code](wifi-ayarla.md#kanal-degistir) |
| **IP Address** | The robot's address, `192.168.4.1`. | |
| **Kanal Değiştir** (Change channel) list and **Uygula** (Apply) | Moves the robot to the selected channel without uploading code, and saves the channel on the board. The list starts with **Varsayılana dön (açılışta)** (Back to default, at startup), then the recommended 1, 6 and 11. **Varsayılana dön (açılışta)** deletes the saved choice; when the robot turns on again, it goes back to the channel in the code. The line below shows the result. | [Change the channel without uploading code](wifi-ayarla.md#kanal-degistir) |

### Network Status {#network-status}

| Name | What it does | Related task |
|---|---|---|
| **RSSI** | The signal the robot receives from the connected device, in dBm. | [Measure the signal](sinyali-iyilestir.md#sinyali-olc) |
| **Ping** | The time, in ms, between the page sending a request to the robot and getting the answer. | |
| **WebSocket** | The live channel between the page and the robot: "Connected" or "Disconnected". | |
| **Deadline Miss** | "YES": a loop pass stalled, and the robot waits in a safe state. "No": no problem. | [The LED blinks red: the loop stalled](sorunlar.md#pb-e301-deadline-miss-loop-takildi) |
| **Joystick Age** | The age of the last gamepad data that reached the robot, in ms. | |
| **Clients** | The number of devices connected to the robot's network. | |
| **Last Disconnect** | The WiFi reason code of the last device that disconnected (like "reason 8"). | [Measure the signal](sinyali-iyilestir.md#sinyali-olc) |

### History {#history}

The **History · son 2 dk** (History, last 2 min) section draws three charts of the last 2 minutes: **Battery**, **RSSI** and **Ping**. The title of each chart shows the last value. The moments when the connection dropped show as gaps in the chart. The battery chart does not take an average; here you see the voltage drop when the motors start.

### Event Log {#event-log}

| Name | What it does | Related task |
|---|---|---|
| Event Log panel | Writes what happens on the Driver Station, with the time: commands ("Komut: INIT (auto 30s)"), mode selection ("Mod: Teleoperated"), phase changes ("Phase: TeleOp"), a gamepad plugged in or unplugged, a dropped connection and a channel change. The letter at the start of the line shows the level: I info, W warning, E error. It keeps the last 400 lines. | [Errors and troubleshooting](sorunlar.md) |
| **Clear** | Clears the panel. | |

The Event Log is kept only on this page. If you reload the page, it becomes empty.

### ESP32 System {#esp32-system}

| Name | What it does |
|---|---|
| **Chip**, **CPU**, **SDK** | The board's chip model, processor speed and ESP-IDF version. |
| **Uptime** | How long the board has been on. |
| **Heap (Free / Total)** | Free and total memory. |
| **PSRAM** | Extra memory; "None" if there is none. |
| **Flash (Sketch / Total)** | The space the code takes and the board's total flash memory. |
| **Free Sketch Space** | The free code space that the board reports. |

## On a phone {#telefonda}

![Dashboard on a phone held upright; tabs on a second row, Match Phase, Match Control and System Status one below the other.](../../core/img/core-telefon.png)

When you hold the phone upright, the sections of **Dashboard** line up one below the other: **Match Phase**, **Match Control**, **System Status**, **Battery**, **Signal** and **Telemetry**. The tabs move to a second row below the top strip. The buttons are the same.

If you turn the phone sideways, **Dashboard** switches to two columns: **Match Phase** and **Match Control** on the left, the indicators and **Telemetry** on the right.

On a phone, the **Joystick** tab has no **Klavye** card; the **Dokunmatik** card shows in its place.

## Drive screen {#surus-ekrani}

The drive screen is a full-screen view where a driver without a gamepad drives the robot from a phone. It opens when you press **Etkinleştir** on the **Dokunmatik** card in the **Joystick** tab.

| Name | What it does |
|---|---|
| Left and right stick (**SOL**, **SAĞ**) | The sticks in the bottom corners of the screen. Drag your finger; when you let go, the stick goes back to the middle. |
| **A**, **B**, **X**, **Y** | The gamepad buttons with the same names. |
| Top bar | The match phase, the match clock, the time left in autonomous ("AUTO 12.3s") and the battery voltage. On a narrow screen, the clock and the battery are hidden. |
| **Auto** / **Teleop** | Mode selection; it follows the same rule as the mode list in **Match Control**. |
| **Init** | The same as the left button in **Match Control**: it shows **Init**, **Start**, **Init Teleop** or **Init Auto**. |
| **STOP** | The same as **Stop** in **Match Control**. |
| **E-STOP** | The same as **Emergency Stop**. |
| Cross icon (left end of the top bar) | Closes the drive screen and goes back to the normal interface. The touch source stays on; you go back in with the **Sürüş ekranı** button. |

If you hold the phone upright, the view turns 90 degrees; use the phone turned sideways. In browsers that support it, the screen also locks in the sideways position.

## If the connection drops {#baglanti-koparsa}

| What happens | When | What to do |
|---|---|---|
| The gamepad values reset to zero; the motors do not keep running with the last command. | If no gamepad data reaches the robot for 500 ms | Check the connection. |
| In **System Status**, **Comms** becomes "Degraded". | If no data comes from the robot to the page for 3 seconds | Move closer to the robot, and check that the device is on the robot's network. |
| A cover with "DISCONNECTED" and "Trying to reconnect…" covers the page. The page tries to connect again. | If no data comes from the robot to the page for 6 seconds | Check that the device is still on the robot's network. |
| The robot stops; the running mode's stop function runs (the default setting). | If the Driver Station stays fully silent for 10 seconds | Connect again, select the mode, then press **Init** and **Start**: ["DISCONNECTED": connection lost, robot stopped](sorunlar.md#pb-e303-baglanti-kopmasi-robot-durduruldu). |
| A cover with "EMERGENCY STOPPED" covers the page; the **Reboot Robot** button appears. | After **Emergency Stop** | Press **Reboot Robot**, or turn the robot off and on: ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi). |

## Having trouble?

- **The page does not open, or it shows "Another client is already connected.":** [The interface does not open, or "Another client is already connected."](sorunlar.md#arayuz-acilmiyor).
- **The gamepad does not show up, and the Gamepad card shows "Bağlı değil":** [Gamepad not detected: "Bağlı değil" (Not connected)](sorunlar.md#kumanda-baglanmiyor).
- **The selection does not change when you press the mode list:** The robot is in **Init** or running. Press **Stop** first.

## Next step

[Set up the robot's WiFi](wifi-ayarla.md): network name, password and channel.
