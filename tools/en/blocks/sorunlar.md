# Troubleshooting

Common problems in Blocks and how to fix them. If your problem is not here, write to the team with
[Report a bug](hata-bildir.md). In the message, include the open example, the last button or key you
pressed, the exact text on the screen and your browser.

## Check the status indicators first {#durum-gostergeleri}

<!-- SAY: When something goes wrong, we first look at which indicator appears on the screen. -->

| Indicator | Meaning | What to do |
|---|---|---|
| Orange notification, for example "Block project downloaded." | The job is done. The notification disappears after 5 seconds. | You do not need to do anything. |
| Red notification, for example "Copy failed." | The job could not be done. The notification disappears after 5 seconds. | Look for its text in the headings on this page. |
| The **Password (min. 8)** box has a dark orange border, with "The password needs at least 8 characters, or the code will not compile." below it | The password has 1-7 characters. | [The password needs at least 8 characters](#sifre-en-az-8) |
| "// No blocks added yet" in **Code Preview** | That lifecycle block is empty. | ["// No blocks added yet" appears](#henuz-blok-eklenmedi) |
| A block that looks faded | The block is disabled and does not go into the code. | Right-click the block and select **Enable Block**. |
| "There is no ... named ..." warning on an FTC block | The block uses a device name that is not in the **Robot configuration**. | [The device is not in the configuration](#cihaz-yapilandirmada-yok) |
| "This name is already in use." or "A name must start with a letter ..." below the **Robot configuration** list | The device name you typed was not accepted, and the old name came back in the box. | [A name must start with a letter](#ad-harfle-baslamali), [This name is already in use](#ad-zaten-var) |
| "// Could not generate Java: ..." in the **OnBot Java** section | FTC Blocks could not generate Java code from this program. | [Could not generate Java](#java-uretilemedi) |

## Project and saving

<!-- SAY: We avoid most saving problems by keeping a lasting file with Download blocks. -->

### A different project came back after a refresh {#yenileyince-proje-degisti}

Cause: If you load an example and do not change any block, the browser does not save the example's
blocks. When the page is refreshed, the previous save comes back, but the **Project** box keeps the
example's name. If you cleared your browser data, the save is deleted too.

Fix: To keep a lasting copy, download the project as a `.probot.json` file.

!!! warning "Warning"
    Before you refresh the page or close the browser, save with **Download blocks**. The save in the
    browser can miss part of your work without a warning.

1. In the toolbar, press **Download blocks** to save your work to a file.
2. Refresh the page, or close the browser and open it again.
3. Press **Load blocks** and select the file you downloaded.

Result: The project comes back the way it was when you downloaded it.

See [Save the project, open it and start over](probot-projeyi-kaydet.md).

### The network name or channel changed after a refresh {#yenileyince-ad-wifi-degisti}

Cause: The network name and channel in a file you open with **Load blocks** are not saved in the
browser. When the page is refreshed, the earlier values come back. The project name and the password
from the file are saved.

Fix: After the refresh, open the same file again with **Load blocks**. To make the values stay,
change the network name and the channel by hand once in the **Robot WiFi** section. A value you type
or select from the list is saved in the browser.

See [How autosave works](probot-projeyi-kaydet.md#otomatik-kayit), [Set up the robot WiFi](probot-wifi-ayarla.md).

### Picking an example deleted my program {#ornek-program-silindi}

Cause: **Pick an example** and **Load blocks** put the new program in place of the open one, and they
do not ask first.

Fix: Before you pick an example or load a file, save with **Download blocks** (Probot) or
**Download .blk** (FTC). In Probot mode this cannot be undone: <kbd>Ctrl</kbd>+<kbd>Z</kbd> does not
bring the old program back. The only way to get the old program back is to open the file you
downloaded with **Load blocks**.

In FTC, you can click the workspace and press <kbd>Ctrl</kbd>+<kbd>Z</kbd> (twice if needed) to bring
the old blocks back. <kbd>Ctrl</kbd>+<kbd>Z</kbd> brings back only the blocks: the
**Robot configuration**, the **OpMode** name, **Type** and **Group** do not come back.

See [Save the project, open it and start over](probot-projeyi-kaydet.md), [Save the program, open it and get the Java code](ftc-programi-kaydet.md).

### "Could not load the block project." appears {#blok-projesi-yuklenemedi}

| Cause | Fix |
|---|---|
| The file you selected is not a `.probot.json` file. | Select a file you saved with **Download blocks**. |
| The file is damaged, or it has a block that the tool does not have. | Try another copy of the file. If you have none, use [Report a bug](hata-bildir.md) to tell us about the file. |

See [Save the project, open it and start over](probot-projeyi-kaydet.md).

### "This file is not an FTC Blocks (.blk) file." appears {#blk-dosyasi-degil}

Cause: In FTC Blocks, **Load .blk** opens only `.blk` files. It cannot open a `.java` file or a
Probot file.

Fix: Select a `.blk` file you saved with **Download .blk**.

See [Open a saved .blk file](ftc-programi-kaydet.md#blk-ac).

## WiFi

<!-- SAY: Blocks keeps the WiFi password in the browser, and another browser generates a different password. -->

### The robot's WiFi password changed {#wifi-sifresi-degisiyor}

| Cause | Fix |
|---|---|
| You downloaded the code from another browser or computer. Each browser generates and keeps its own password. | In that browser too, type the same password by hand into the **Password (min. 8)** box. |
| The saved password in this browser was deleted: you did not open Blocks for 30 days, or you cleared your browser data. Blocks generated a new password. | Type the password you wrote down into the box again. |

See [Set up the robot WiFi](probot-wifi-ayarla.md).

### "The password needs at least 8 characters, or the code will not compile." appears {#sifre-en-az-8}

Cause: The **Password (min. 8)** box has 1-7 characters.

Fix: Type at least 8 characters into the **Password (min. 8)** box. The dark orange border of the box
and the warning text go away.

The box accepts only the letters A to Z, digits and `-`, and it turns lowercase letters into capital
letters (ı becomes I too). Other Turkish letters and spaces cannot be typed, so you may end up with fewer
characters than you expect.

See [Set up the robot WiFi](probot-wifi-ayarla.md).

## Code

<!-- SAY: If something is missing in Code Preview, we first check that the blocks are attached to a lifecycle block. -->

### A block I added is not in the code {#blok-koda-girmiyor}

| Cause | Fix |
|---|---|
| The block is not attached inside a lifecycle block (for example **teleopLoop**). | Drag the block into the slot of the lifecycle block until it snaps into place. |
| The block looks faded, which means it is disabled. | Right-click the block and select **Enable Block**. |

### "// No blocks added yet" appears {#henuz-blok-eklenmedi}

Cause: The lifecycle block for that part of the code in **Code Preview** is empty.

Fix: This is not an error. The robot does nothing in that part. If you want something to happen
there, attach blocks inside the lifecycle block.

### "Copy failed." appears {#kopyalama-basarisiz}

Cause: The browser did not allow writing to the clipboard.

Fix: Download the file instead. In Probot mode, press **Download .ino**. In FTC mode, press **Download .java**.

See [Copy or download the code](probot-kodu-al.md), [Save the program, open it and get the Java code](ftc-programi-kaydet.md).

### Compile error in Arduino IDE {#arduino-derleme-hatasi}

| Cause | Fix |
|---|---|
| The code was changed after you got it from Blocks. | Get the code from Blocks again and paste it without changing it. |
| The probot-core library is not installed. | Install the library: [Upload the code to the Probot board](probot-karta-yukle.md). |
| The WiFi password is shorter than 8 characters. | [The password needs at least 8 characters](#sifre-en-az-8) |

See [Upload the code to the Probot board](probot-karta-yukle.md).

## FTC

<!-- SAY: Most problems on the FTC side come from device names that do not match. -->

### "There is no ... named ... in the current robot configuration" warning {#cihaz-yapilandirmada-yok}

Cause: The block uses a device name that is not in the **Robot configuration**.

Fix: Add a device with the same name, or select an existing device from the dropdown on the block.

See [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md).

### "A name must start with a letter and can only use letters, numbers and _." appears {#ad-harfle-baslamali}

Cause: The device name starts with a digit, or it has a space, a Turkish letter or a hyphen. The old
name comes back in the box.

Fix: Type a name that starts with a letter and has only letters, digits and `_`. For example
`solMotor`.

See [Set up the robot configuration](ftc-yapilandirmayi-ayarla.md).

### "This name is already in use." appears {#ad-zaten-var}

Cause: The configuration already has a device with the same name.

Fix: Type a different name.

### "Could not load the example because the connection dropped. Pick it again." appears {#ornek-yuklenemedi}

Cause: The example file did not download completely from the internet.

Fix: Check your internet connection and pick the example again.

### "// Could not generate Java: ..." appears {#java-uretilemedi}

Cause: FTC Blocks could not generate OnBot Java code from this program. The rest of the
text says what went wrong.

Fix: Click the workspace and undo the last change with <kbd>Ctrl</kbd>+<kbd>Z</kbd>. If the text does
not go away, press **Download .blk** to download the program. Then use
[Report a bug](hata-bildir.md) to send us the exact text.

### The mouse wheel zooms instead of scrolling {#tekerlek-yakinlastiriyor}

Cause: In FTC Blocks, the mouse wheel zooms.

Fix: To move around the workspace, drag an empty spot.

See [Shortcuts](kisayollar.md).

### Sim does not see the program {#sim-programi-gormuyor}

Cause: Blocks and Sim are not open in the same browser.

Fix: Open Sim in the browser where you opened Blocks. If you are in a different browser, get the file
with **Download .blk**, then in Sim press **Dosya aç (.blk, .java)** (Open file). Sim's interface is
in Turkish for now.

See [Try the program in Sim](ftc-simde-dene.md).

## Screen

<!-- SAY: Blocks is made for a computer, so on a phone we only look around. -->

### "Coding tool is in development" card appears every time {#gelistirme-karti}

Cause: The card opens on every visit.

Fix: Press **Got it, continue** or <kbd>Esc</kbd> to close it.

### The blocks do not fit on a phone {#telefonda-sigmiyor}

Cause: Blocks is made for a computer.

Fix: You can look around on a phone, but use a computer to write programs.
