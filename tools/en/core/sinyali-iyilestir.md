# Improve the signal quality

On this page, you measure the WiFi connection between the robot and the Driver Station. Then you make it stronger with the power supply, the antenna, the board's position and the channel plan.

In a competition hall, dozens of robots and phones share the same 2.4 GHz band. In these conditions, the quality of the connection depends mostly on the robot's physical design; software settings cannot make up for it.

## Before you start

- The robot code is uploaded and you can connect to the Driver Station: [First 10 minutes](ilk-10-dakika.md).

## Measure the signal {#sinyali-olc}

The Driver Station shows the strength of the signal that the robot receives from the connected device. Measure before and after a change.

1. Take the device that runs the Driver Station to the place where the drivers will stand.
2. Select the **Logs** tab.
3. Run the robot with **Init** and **Start**, and drive the motors with the gamepad for a few seconds.

Result: In the **Network Status** section, the **RSSI** row shows the signal in dBm. The closer the value is to 0, the stronger the signal. If it is worse than -70 dBm (for example -78 dBm), check the distance and the antenna.

| Indicator | Where | What it tells you |
|---|---|---|
| Signal bars | Top strip | 4 bars if better than -50 dBm, 3 if better than -60, 2 if better than -70, 1 if better than -80. The dot is green at 3-4 bars, yellow at 2 and red below that. |
| **RSSI** | **Logs** > **Network Status** | The signal the robot receives from the connected device. -100 dBm if no device is connected. |
| **Ping** | **Logs** > **Network Status** | The time, in ms, between the page sending a request to the robot and getting the answer. |
| **Last Disconnect** | **Logs** > **Network Status** | The WiFi reason code of the last disconnect (like "reason 8"). "--" if there was no disconnect. |

## Power the ESP32 from a separate regulator {#regulator}

Motor drivers and motors draw a high current for a moment when they start. If the ESP32 is powered from the same line, this surge makes the WiFi radio unstable and the connection drops. This is the most common cause of connection problems.

- Power the ESP32 with a separate 3.3 V or 5 V regulator, apart from the main power line. A small LDO or DC-DC converter is enough.
- Add a 100-470 µF electrolytic capacitor to the ESP32's power line. It smooths the voltage drops when the motors start.
- Do not power a servo from the ESP32's 5V or 3V3 pin. Give the servo a separate 5-6 V source (BEC) and connect the GNDs together: [Drive the servo](servoyu-sur.md).

## Keep the antenna in the open {#anten}

The antenna's position has a direct effect on the signal. On modules with an antenna printed on the board (PCB antenna), the range may not be enough in competition conditions. Prefer an ESP32-S3 module that takes an external antenna.

- Keep the tip of the external antenna in the open.
- Keep the antenna at least 5 cm away from metal surfaces, motors and cable bundles. They absorb the 2.4 GHz signal.

## Do not bury the board in a metal body {#kartin-yeri}

An ESP32 buried inside a sheet metal body is in a cage. The signal cannot get out, and signals from outside cannot get in. Then even a Driver Station right next to it can lose the connection.

- Put the ESP32 outside the body or in a half-open spot.
- If the board has to stay inside, at least bring the antenna outside the body with an extension cable.

## Competition day channel plan {#kanal-plani}

Two robots that broadcast on the same channel interfere with each other. The channels that do not overlap in the 2.4 GHz band are **1, 5, 9 and 13**. Assign these channels by hand to the robots that run at the same time. Give each robot a different, fixed channel.

| Robot | Channel |
|---|---|
| Robot 1 | 1 |
| Robot 2 | 5 |
| Robot 3 | 9 |
| Robot 4 | 13 |

The channel controls in the **Logs** tab are in Turkish.

- Set the channel in the code with `PROBOT_WIFI_AP_CHANNEL`, or change it on competition day without uploading code with **Logs** > **Kanal Değiştir** (Change channel): [Set up the robot's WiFi](wifi-ayarla.md#kanal-degistir).
- Do not change the channel during a match. Some tablets do not follow the switch and lose the connection for a few seconds.
- Some laptops and tablets do not see channels 12 and 13. If a device cannot find a robot, give that robot a channel from 1 to 11.
- Do not use automatic channel selection (`PROBOT_WIFI_AUTO_CHANNEL 1`) at a competition. Robots that start together can end up on the same channel: [Automatic channel selection](wifi-ayarla.md#otomatik-kanal).
- During a match, do not let anyone turn on WiFi sharing (a hotspot) on a phone near the robots. Hotspots fill the 2.4 GHz band too.
- If the channel is crowded, ask the field staff.

## Radio settings the library makes {#kutuphane-ayarlari}

Probot sets up the robot's WiFi radio by itself at startup. You do not have to write code for these.

| Setting | Value | Why |
|---|---|---|
| Transmit power | Highest (`WIFI_POWER_21dBm` is requested, the radio gives 20 dBm) | Range |
| Power saving | Off (`WIFI_PS_NONE`) | The radio does not sleep, so the delay stays steady. |
| Channel width | 20 MHz (HT20) | Overlaps less with neighbor channels in a crowded band. |
| 802.11b rates | Off | The robot's packets take less airtime, so the band stays less busy. |
| Country setting | TR, channels 1-13 | Broadcasting is allowed up to channel 13. |

Two settings change with a macro. Turn them on only if you need them:

| Macro | What it does |
|---|---|
| `#define PROBOT_WIFI_ENABLE_11B 1` | Turns on the 802.11b rates. Needed only for devices from before 2010; it keeps the band busier. |
| `#define PROBOT_WIFI_PMF_REQUIRED 1` | Makes protected management frames (PMF) required. It protects against fake disconnect attacks; old tablets may not be able to connect. |

## Having trouble?

- **"DISCONNECTED" is shown and the robot stopped:** See [The connection dropped and the robot stopped](sorunlar.md#pb-e303-baglanti-kopmasi-robot-durduruldu).
- **The robot's network is not in the list:** The channel may be 12 or 13. Give the robot a channel from 1 to 11.

## Next step

[Driver Station interface](arayuz.md): the other indicators in the **Logs** tab.
