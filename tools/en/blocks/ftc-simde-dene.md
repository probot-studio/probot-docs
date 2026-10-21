# Try the program in Sim

Probot Sim runs an FTC program on a virtual field, without uploading it to a robot. On this page you
open your FTC Blocks program in Sim. The Sim docs explain how to use Sim itself.

Sim runs FTC Blocks programs and OpModes written in Java in Android Studio. Probot Blocks files (`.ino` and `.probot.json`) do not open in Sim.

Sim's interface is in Turkish for now. This page quotes Sim's labels in Turkish, with their meaning in
parentheses.

## Before you start

- A program is open in FTC Blocks. To start with a ready-made example, press **Pick an example** and open
  **Tank Chassis TeleOp** from the "FTC examples" window: [Start with an FTC example](ftc-ornekle-basla.md).

<!-- SAY: To try it out we open the Tank Chassis TeleOp example in FTC Blocks. -->

## Select the open program in Sim

If Blocks and Sim are open in the same browser, Sim finds the FTC program in Blocks by itself.

!!! tip "Tip"
    If Blocks is open in another browser or on another computer, Sim does not see the program. In
    that case, [open the program with a .blk file](#blk-dosyasini-simde-ac).

1. In Blocks, in the toolbar, select the **FTC Blocks** tab.
2. In the same browser, open [probotstudio.com/sim](https://probotstudio.com/sim/?dil=en) in a new tab.
3. In Sim, in the **Kod** (Code) section's **OpMode** list, select the row marked "Blocks'ta açık FTC projesi"
   (FTC project open in Blocks).
   This row is at the top of the list. Its name is whatever the **OpMode** box in Blocks says (for example "Tank Sasi TeleOp").

Result: The summary of the **Kod** section reads "Tank Sasi TeleOp · TeleOp". In the checklist,
the "Kod: Tank Sasi TeleOp (TeleOp)" item has a green check mark.

If you change the program in Blocks, Sim reads the program in the list again.

<!-- SAY: When Blocks and Sim are open in the same browser, Sim finds our program by itself. -->

## Open the .blk file in Sim {#blk-dosyasini-simde-ac}

Use the `.blk` file when you move the program to another browser or computer.

!!! tip "Tip"
    If the file you select is not an FTC Blocks program, the **Kod** section shows
    "Bu dosya FTC Blocks (.blk) ya da Java (.java) değil." (This file is not FTC Blocks or Java) in a red box. Get the file from Blocks with **Download .blk**.

1. In Blocks, in the toolbar, press **Download .blk**. A "TankSasiTeleOp.blk downloaded." notification appears.
   Details: [Save the program, open it and get the Java code](ftc-programi-kaydet.md).
2. In Sim, in the **Kod** section, press **Dosya aç (.blk, .java)** (Open file). You can also select
   **Dosya** > **Kod dosyası (.blk, .java) aç…** (File > Open code file).
3. In the window that opens, select the `.blk` file you downloaded.
4. Press **Open**.

Result: The program appears at the end of the **OpMode** list, marked "Dosyadan: TankSasiTeleOp.blk" (From file), and is selected.
The row's name is the file name without the `.blk` extension (for example "TankSasiTeleOp").

The list holds only one program from a file at a time. When you open a new `.blk` file, the program from the previous file leaves the list.

<!-- SAY: In Sim we can also open a .blk file that comes from another computer. -->

## Go back from Sim to Blocks

In Sim, in the **Kod** section, press **Blocks'ta yaz** (Write in Blocks). Blocks opens in a new tab.
**Dosya** > **Blocks'u aç** (File > Open Blocks) does the same.

<!-- SAY: We can go back from Sim to Blocks with one button. -->

## Having trouble?

- **The list has no "Blocks'ta açık FTC projesi" row:** Blocks and Sim must be open in the same browser, and
  the **FTC Blocks** tab must be selected in Blocks. If that does not help, open the program with a `.blk` file.
  See [Troubleshooting](sorunlar.md), "Sim does not see the program".
- **"Bu dosya FTC Blocks (.blk) ya da Java (.java) değil." appears:** The file you selected is not an FTC Blocks program. In Blocks,
  press **Download .blk** and open the file it downloads.

<!-- SAY: If Sim does not see the program we check that both tabs are open in the same browser. -->

## Next step

- Connect the device names in the program to the ports of the robot in Sim: the "Connect devices to ports" page in the Sim docs (in Turkish).
- To add blocks to your program: [FTC block reference](ftc-blok-listesi.md).

<!-- SAY: After we select the program we connect the device names to the ports of the robot in Sim. -->
