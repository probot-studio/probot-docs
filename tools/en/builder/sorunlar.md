# Troubleshooting

This page lists the warnings that appear in Builder and the situations where you get stuck,
sorted into groups. Each heading starts with the text on the screen, with the cause and the fix below it. You can
search this page for the text on your screen (<kbd>Ctrl</kbd>+<kbd>F</kbd>).

Most warnings appear as a short notification in the corner of the screen and stay for 3.5 seconds.
If you missed the notification, do the same thing again.

## Check the status indicators first {#durum-gostergeleri}

| Indicator | Meaning | What to do |
|---|---|---|
| "Saved" next to the project name in the **Toolbar** | The robot is in your account, and its latest version is saved. | You do not need to do anything. |
| "Not saved" next to the project name in the **Toolbar** | You changed the robot after you saved it to your account. The share link shows the old version. | Press the text. In the **Save to my account** window, press **Save**. |
| No save text next to the project name | The scene is not tied to a robot in your account. | Select **File** > **Save to my account...**, or open the robot from **My robots...**. |
| "Connecting" or "Not available right now" next to the account items in the **File** menu | Builder is connecting to the account server, or it cannot reach it. | See the first heading in the "Account and sharing" section below. |
| "N parts · N selected" in the status bar | The number of parts in the scene and the number of selected parts. | If a number is not what you expect, make the selection again. |
| "N hidden" in the status bar | Some parts in the scene are hidden. You cannot click a hidden part in the scene. | Right-click an empty spot in the **Scene** and select **Show all (n)**. |
| **Snap** is orange, and the end of the status bar shows "2.5mm · 45° snap · 10 mm grid" | Snap is on. The part moves in 2.5 mm steps and snaps to holes. | To move freely, hold <kbd>Shift</kbd> or turn off **Snap**. |
| The end of the status bar shows "snap off · 10 mm grid" | Snap is off. The part moves freely, and the hole magnet does not work. | To seat the part in a hole, turn on **Snap** in the **Toolbar**. |
| "Mate · click the hole of the part to move" or "Mate · click the target hole" in the status bar | **Mate** is on, and Builder is waiting for you to click a hole. | Click the hole the text asks for. To leave, press <kbd>Esc</kbd>. |
| The **Assembly strip** below the **Scene**, with "Step N / M" in its title | The robot is in assembly mode. You cannot move, add or delete parts. | To make changes, press **Switch to editing**. |
| The "The scene is empty" card in the middle of the **Scene** | There are no parts in the scene. **Try in Sim** is faded, and you cannot save to your account. | On the card, press **Starter Bot**, **Omni chassis** or **WattOS mecanum chassis**, or press **Parts list**. |
| "Build passed" in the **Build** panel | The structure is connected, and there are no collisions. | You do not need to do anything. |
| "Built with warnings" in the **Build** panel | There are no errors, but there is at least one warning. | Look at the findings with a yellow dot. See [Check the robot with Build](robotu-derle.md). |
| "Build failed" in the **Build** panel | There is at least one error. | Press the finding with the red dot, fix the parts and press **Build again**. |

<!-- SAY: When something goes wrong, we first look next to the project name, at the status bar and at the Build panel. -->

## Startup and screen

### "Builder runs on a computer" screen appears {#bilgisayarda-calisir}

Cause: The browser window is 900 px wide or narrower, or narrower than 1100 px on a touch device.
Builder needs a mouse and a large screen.

Fix: On a computer, make the window wider or zoom the browser out. On a phone, press
**Send the link to my computer** (or **Copy link**, if it is there) and open the link on a computer.

See [Builder](index.md), [What you need](../index.md#ne-gerekir).

### A panel disappeared {#panel-kayboldu}

Cause: Someone pressed the panel's close button, or unchecked it in the **View** menu.

Fix: Select the panel from the **PANELS** group in the **View** menu. To put all the panels back
where they started, select **View** > **Reset layout**.

See [Arrange the panels](panelleri-duzenle.md).

### Shortcut keys do not work {#kisayollar-calismiyor}

| Cause | Fix |
|---|---|
| The cursor is in a text box. | Click an empty spot in the **Scene**. |
| Assembly mode is on. | In the **Assembly strip**, press **Switch to editing**. |
| The **Mirror** or **Pattern** window is open. | Close the window with <kbd>Esc</kbd>. |

See [Shortcuts](kisayollar.md).

### Dragging with the left button draws a box instead of rotating the camera {#kamera-donmuyor}

Cause: The left button only selects. The camera moves with the right and middle buttons.

Fix: Drag with the right button. For other controls, select one from the **MOUSE CONTROLS** group in
the **View** menu.

See [Move around the scene](sahnede-gezin.md).

<!-- SAY: When the screen is too narrow or a panel disappears, we find the fix in the View menu. -->

## Adding parts and the shop

### "Could not reach the shop stock - using the static catalog" appears {#magaza-stoguna-ulasilamadi}

This notification appears while Builder is opening.

Cause: Builder could not reach the shop's live stock. You can still add parts, but the stock
information is old.

Fix: Check your connection and refresh the page.

See [Add parts](parca-ekle.md).

### "No results" appears {#sonuc-bulunamadi}

Cause: No part matches the text in the **Search parts...** box.

Fix: Type a shorter word or a product code (SKU).

See [Add parts](parca-ekle.md).

### "The ... model did not load" appears {#parca-modeli-yuklenemedi}

In place of the "...", the text shows the part's name.

Cause: The part's 3D model could not be downloaded.

Fix: Check your connection, delete the part and add it again.

See [Add parts](parca-ekle.md).

### "The part model did not load, nothing was mirrored" appears {#aynalanmadi}

Cause: The model of the part you wanted to mirror could not be downloaded.

Fix: Check your connection and try **Mirror** again.

See [Duplicate, mirror and pattern parts](cogalt-aynala-dizi.md).

### "The selection is on the mirror plane and is its own mirror, no copy needed" appears {#ayna-duzleminde}

With several parts, the text is "N parts are on the mirror plane and are their own mirror, so they
were not copied".

Cause: The part sits exactly in the middle of the mirror plane. Its mirror is the same as the part.

Fix: Under **Where the plane passes**, select another option (such as **Next to the selection**).

See [Duplicate, mirror and pattern parts](cogalt-aynala-dizi.md).

### "No exact mirror part for .... Placed in the closest pose, check it" appears {#tam-ayna-parcasi-yok}

In place of the "...", the text shows the part's name.

Cause: The catalog has no left-right flipped twin of this part. Builder placed the part in the
closest pose.

Fix: Check the copy, and fix it with **Rotate** if needed.

See [Duplicate, mirror and pattern parts](cogalt-aynala-dizi.md).

### "Count must be between 2 and 50" or "Spacing cannot be 0" appears {#dizi-deger-siniri}

A value in the **Pattern** window is out of range.

| Cause | Fix |
|---|---|
| "Count must be between 2 and 50": **Total count** is out of range. | In the **Total count** box, type a number from 2 to 50. |
| "Spacing cannot be 0": **Spacing (mm)** is 0. | In the **Spacing (mm)** box, type a number other than 0. |

See [Duplicate, mirror and pattern parts](cogalt-aynala-dizi.md).

### "This part cannot be cut, so the hole was added as a separate Hole part" appears {#parca-kesilemez}

Cause: In Extrude you selected **Hole** as the **Type**, but the part you opened the sketch on cannot
be cut (for example a catalog part, an imported model or a Hole shape). A hole cuts basic shapes,
combined shapes and Extrude parts.

Fix: The hole stays as a separate part. Delete it if you do not need it. To cut, open the sketch on a
face of a basic shape, a combined shape or an Extrude part.

See [Draw a sketch and make it solid with Extrude](sketch-ve-extrude.md).

### "Imported parts cannot be merged" or "Sketches cannot be merged" appears {#birlestirilemez}

In the same situation, "Select at least one solid shape to merge" can also appear. **Merge** works on
basic shapes, combined shapes and Extrude parts. It appears when at least two parts are selected, and
it needs at least one **Solid** shape.

| Cause | Fix |
|---|---|
| The selection has an imported part. | Take the imported parts out of the selection. |
| The selection has a sketch. | Take the sketches out of the selection. |
| The selection has no **Solid** shape. | Add a solid shape to the selection. |

See [Make a part from basic shapes](temel-sekillerle-parca-yap.md).

### "A sketch opens only on a flat face" appears {#sketch-duz-yuz}

Cause: You clicked a curved face for the sketch.

Fix: Click a flat face or a plane.

See [Draw a sketch and make it solid with Extrude](sketch-ve-extrude.md).

### "The sketch has no closed region" appears {#kapali-bolge-yok}

Cause: Extrude needs a closed shape. The ends of the lines do not meet.

Fix: Close the shape, or draw a rectangle or a circle.

See [Draw a sketch and make it solid with Extrude](sketch-ve-extrude.md).

### "Extra or conflicting constraints, delete the red ones" appears {#celisen-kisit}

Cause: The constraints in the sketch do not agree with each other.

Fix: Delete the constraints that show in red.

See [Draw a sketch and make it solid with Extrude](sketch-ve-extrude.md).

<!-- SAY: Most warnings while we add parts come from the connection or from a wrong selection. -->

## Moving, Mate, Measure

### "Editing is off in assembly mode. Switch to editing to make changes" appears {#montaj-modu}

Cause: The robot is in assembly mode, which you started with **Build step by step**. In this mode
you cannot move, add or delete parts. The **Parts** list is read-only.

Fix: In the **Assembly strip**, press **Switch to editing**.

See [Build the robot step by step](adim-adim-kur.md).

### The part jumps in 2.5 mm steps or sticks to a hole {#snap-acik}

Cause: Snap is on.

Fix: Hold <kbd>Shift</kbd> while you move the part, or turn off **Snap** in the **Toolbar**.

See [Move and rotate a part](tasi-ve-dondur.md).

### "This part is being moved too. Click a part outside the selection" appears {#bu-parca-da-tasiniyor}

Cause: In **Mate**, you clicked a target part that is also in the selection you are moving.

Fix: Click a hole on a part outside the selection.

See [Mate parts by their holes](parcalari-tak.md).

### "The target part is attached to the part being moved. Detach it in Properties first" appears {#hedef-parca-bagli}

Cause: The target part is attached to the part you are moving. They move together.

Fix: Select the target part, press **Detach** in the **Connection** section of the **Properties**
panel, then mate the part again.

See [Group parts and attach them to each other](grupla-ve-bagla.md).

### "The back of this face was not found" appears {#yuzun-arkasi-yok}

Cause: You pressed <kbd>F</kbd> to flip the part, but Builder could not find the part's opposite face.

Fix: Rotate the part with <kbd>R</kbd>, or mate it from another hole.

See [Mate parts by their holes](parcalari-tak.md).

### I pressed <kbd>Esc</kbd> and all the measurements were deleted {#olcumler-silindi}

Cause: While **Measure** is on, <kbd>Esc</kbd> first deletes the unfinished measurement, then all
the measurements.

Fix: To delete one measurement, press **Delete this measurement** in the **Measure** panel.

See [Measure a distance](mesafe-olc.md).

### I pressed <kbd>Del</kbd> and the part was not deleted {#del-parca-silmiyor}

Cause: While **Measure** is on, <kbd>Del</kbd> deletes the last measurement, not the part.

Fix: Turn off **Measure**, select the part and press <kbd>Del</kbd>.

See [Select, hide and delete parts](parcalari-sec-gizle-sil.md).

<!-- SAY: If a part does not move, we first check whether we are in assembly mode and how Snap is set. -->

## Joints and motion

### "This link would make a loop. A part cannot attach to a part that is attached to it" appears {#bag-dongu-kurar}

Cause: The part you selected is already attached to this part.

Fix: Select another part, or press **Detach** first.

See [Group parts and attach them to each other](grupla-ve-bagla.md).

### "No shared axis found" appears {#ortak-eksen-yok}

The full text is "No shared axis found. For a joint, the holes of the two parts must be on the same
axis, or the part must be mounted on a motor or servo shaft".

Cause: The holes of the two parts are not on the same axis.

Fix: Use **Mate** to mate the part to the opposite hole or to a motor shaft.

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

### "No gear to mesh with" or "No pulley to pair with" appears {#eslesecek-disli-yok}

The text goes on with "The other part needs a joint too, and the axes must be parallel".

| Cause | Fix |
|---|---|
| The driving gear or pulley has no joint. | Set up a joint on the other part first. |
| The axes of the two parts are not parallel. | Make the axes parallel. |

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

### "This servo's angle is not in the data, 180° assumed" appears {#servo-acisi-yok}

Cause: The servo's rotation angle is not in the catalog.

Fix: If needed, select **Limited rotation** and type the **Min °** and **Max °** values.

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

### "No motor or servo joint. Use Mate to put the wheel on a motor shaft" appears {#motor-eklemi-yok}

Cause: There is no motor or servo joint to move in the **Motion** panel.

Fix: Use **Mate** to mate the wheel to a motor shaft. The joint is set up by itself.

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

### "The joints are already set up" or "Found no joints to set up" appears {#eklem-bulunamadi}

Cause: **Set up joints automatically** found no new joints.

Fix: Set up the joint by hand in the **Connection** section of the **Properties** panel.

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

<!-- SAY: When a joint cannot be set up, the holes of the two parts are usually not on the same axis. -->

## Belts

### "Select two pulleys for a belt" or "Both parts must be pulleys" appears {#iki-kasnak-sec}

Cause: The selection does not have exactly two pulleys.

Fix: Select the two pulleys with <kbd>Shift</kbd>+click, then press <kbd>K</kbd>.

See [Add a belt to two pulleys](kayis-ekle.md).

### "The pulley axes are not parallel" appears {#kasnak-eksenleri-paralel-degil}

Cause: The pulleys face different directions.

Fix: Rotate one of the pulleys to make the axes parallel.

See [Add a belt to two pulleys](kayis-ekle.md).

### "The pulleys are not in the same plane, N mm off" appears {#kasnaklar-ayni-duzlemde-degil}

Cause: The pulleys are not lined up along the shaft.

Fix: Move one of the pulleys by the distance in the text.

See [Add a belt to two pulleys](kayis-ekle.md).

### "The pulleys are too close" appears {#kasnaklar-cok-yakin}

Cause: There is no room for a belt between the pulleys.

Fix: Move the pulleys farther apart.

See [Add a belt to two pulleys](kayis-ekle.md).

### "These pulleys already have a belt" appears {#zaten-kayis-var}

Cause: A belt was already added to these two pulleys.

Fix: Use the belt that is there, or delete it and add it again.

See [Add a belt to two pulleys](kayis-ekle.md).

### "The pulleys no longer fit the belt" appears {#kayisa-uymuyor}

This text appears while the belt is selected: "The pulleys no longer fit the belt. ... The belt
stays where it last fit".

Cause: After you added the belt, you moved or rotated one of the pulleys. The text in the middle
says why (for example "The pulleys are too close" or "The pulley axes are not parallel").

Fix: Undo the pulley change (<kbd>Ctrl</kbd>+<kbd>Z</kbd>), or delete the belt and add it again.

See [Add a belt to two pulleys](kayis-ekle.md).

<!-- SAY: When a belt is not added, we check that the two pulleys are in the same plane and parallel. -->

## Importing

### "This file type is not supported. Choose STL, STEP, GLB or OBJ" appears {#dosya-turu-desteklenmiyor}

Cause: The file's extension is not supported.

Fix: Export the model as STL, STEP, GLB or OBJ.

See [Import a 3D model](model-ice-aktar.md).

### "The file is too big. At most 25 MB" or "The file is empty" appears {#dosya-cok-buyuk}

Cause: The file is larger than 25 MB, or it is empty.

Fix: Simplify the model and export it again.

See [Import a 3D model](model-ice-aktar.md).

### "The file could not be read. It may be damaged or incomplete" appears {#dosya-okunamadi}

Cause: The file is damaged, or it did not download completely.

Fix: Export the file again from your design program.

See [Import a 3D model](model-ice-aktar.md).

### "The file has no solid model" appears {#kati-model-yok}

In the same situation, "The model looks flat, it has no thickness" or "The file has invalid numbers"
can also appear.

Cause: The file has no solid with a thickness, or the data is damaged.

Fix: In your design program, select the solid body and export it again.

See [Import a 3D model](model-ice-aktar.md).

### "GLB files with Draco compression cannot be opened. Export without compression" appears {#draco-glb}

Cause: The GLB file is compressed with Draco.

Fix: Export the GLB without compression.

See [Import a 3D model](model-ice-aktar.md).

### "This GLTF depends on separate files. Export it as a single GLB" appears {#gltf-ayri-dosyalar}

Cause: The GLTF file depends on separate texture or data files.

Fix: Export the model as a single GLB file.

See [Import a 3D model](model-ice-aktar.md).

### "The model could not be simplified" appears {#model-sadelestirilemedi}

Cause: The model has too many triangles, and simplifying it failed.

Fix: Simplify the model in your design program and export it again.

See [Import a 3D model](model-ice-aktar.md).

### "The STEP reader could not start" or "The STEP reader did not load. Check your connection" appears {#step-okuyucu}

Cause: The STEP reader could not be downloaded to the browser.

Fix: Check your connection, refresh the page and try again.

See [Import a 3D model](model-ice-aktar.md).

### "The STEP file took too long. Try a simpler model" appears {#step-cok-uzun-surdu}

Cause: The STEP file is too complex.

Fix: Try a model with fewer parts, or an STL.

See [Import a 3D model](model-ice-aktar.md).

### "The STEP file could not be read. It may be damaged or incomplete" appears {#step-okunamadi}

Cause: The STEP file is damaged.

Fix: Export the file again.

See [Import a 3D model](model-ice-aktar.md).

### "The models of N imported parts are not in the file. Choose the file again" appears {#model-dosyada-yok}

The imported part looks like a box in the scene.

Cause: The file you opened the project from does not have this part's model data.

Fix: Select the part and press **Choose the file again** in the **Properties** panel.

See [Import a 3D model](model-ice-aktar.md).

<!-- SAY: We fix most import errors by exporting the model again from the design program. -->

## Files and autosave

### "The parts in the scene will be deleted. Start a new project?" appears {#yeni-proje-onayi}

Cause: You selected **File** > **New** while there were parts in the scene.

Fix: If you want to keep your work, cancel. Then select **File** > **Save (download JSON)** before
you start a new project.

See [Save to a file and open it](dosyaya-kaydet-ve-ac.md).

### "Could not read the project file" appears {#proje-dosyasi-okunamadi}

Cause: The file you selected is not a Builder project file, it is damaged, or all the parts in it are
damaged. A file saved with an empty scene does not show this text. It opens with an empty scene.

Fix: Select another `.json` copy that you downloaded with **File** > **Save (download JSON)**.

See [Save to a file and open it](dosyaya-kaydet-ve-ac.md).

### "N damaged parts were skipped" appears {#parca-bozuktu}

Cause: The data of some parts in the file could not be read. The rest of the project opened.

Fix: Add the missing parts again and save the project again.

See [Save to a file and open it](dosyaya-kaydet-ve-ac.md).

### "Autosave failed" appears {#otomatik-kayit-yapilamadi}

When the storage is full, the text is "Autosave failed because the browser storage is full".

Cause: The browser could not keep your work.

Fix: So you do not lose your work, select **File** > **Save (download JSON)**.

See [Save to a file and open it](dosyaya-kaydet-ve-ac.md).

### "The autosave could not fit the imported models" appears {#otomatik-kayit-sigdiramadi}

The text goes on with "Download the project with Save in the File menu".

Cause: The imported models are too big to keep in the browser.

Fix: Select **File** > **Save (download JSON)**. The models are embedded in the file.

See [Save to a file and open it](dosyaya-kaydet-ve-ac.md).

### "The models of N imported parts are not in the autosave. Choose the file again" appears {#model-otomatik-kayitta-yok}

This text appears when you open the page again.

Cause: The autosave could not keep these models.

Fix: Select the part and press **Choose the file again** in the **Properties** panel.

See [Import a 3D model](model-ice-aktar.md).

<!-- SAY: If autosave reports a problem, we download the project as a file. -->

## Account and sharing

### "Connecting" or "Not available right now" appears {#hesap-ogeleri-soluk}

The account items in the **File** menu look faded, with one of these texts next to them.

| Cause | Fix |
|---|---|
| "Connecting": Builder is connecting to the account server. | Wait a little. |
| "Not available right now": The server could not be reached. | Refresh the page. In the meantime, save with **File** > **Save (download JSON)**. |

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Sign in to .... Your robot stays in this tab." appears {#giris-yapmalisin}

Cause: You are not signed in to your Probot account.

Fix: Press **Sign in in a new tab** and sign in (the sign-in page is in Turkish). Then come back to
this tab and try again.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "There must be at least one part in the scene to save" appears {#kaydetmek-icin-parca-yok}

In the same situation, "There are no parts in the scene. Build your robot first, then save." can
also appear.

Cause: The scene is empty.

Fix: Add parts or load a ready-made robot.

See [Start with a ready-made robot](hazir-robotla-basla.md).

### "The robot is X MB, at most Y MB can be saved" appears {#robot-cok-buyuk}

The text goes on with "Use fewer imported models and try again". In the same situation, "The robot
is too big to send to the server. Use fewer imported models and try again" can also appear.

Cause: The robot is bigger than what can be saved to an account. Imported models are usually what
make it big.

Fix: Delete or simplify the imported models. Save the robot to a file with **File** >
**Save (download JSON)**.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Could not reach the server. Check your connection and try again" appears {#sunucuya-ulasilamadi}

In the same situation, "The server is not responding right now. Try again in a little while" or "The
server sent an unexpected response" can also appear.

Cause: The account server could not be reached.

Fix: Check your connection and try again in a little while.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Çok hızlı istek yapıldı. Bir dakika sonra tekrar dene." (Too many requests too fast) appears {#cok-hizli-istek}

The server sends this message in Turkish only (Too many requests too fast. Try again in a minute.). If the
server sends no message, Builder shows "Too many requests. Try again in a minute".

Cause: Too many requests were sent in a short time.

Fix: Wait one minute and try again.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "To create a link, save the robot to your account first." appears {#link-icin-once-kaydet}

Cause: The robot is not saved to your account yet.

Fix: First select **File** > **Save to my account...**.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "The link shows the last saved version" appears {#linkte-son-kaydedilen-hal}

The text goes on with "Save again to show your changes."

Cause: You changed the robot after you saved it. The link shows the old version.

Fix: Save again with **File** > **Save to my account...**.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Link selected, press Ctrl+C to copy" appears {#link-secildi}

Cause: The browser did not allow writing to the clipboard.

Fix: Press <kbd>Ctrl</kbd>+<kbd>C</kbd>.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Could not open the shared robot" appears {#paylasilan-robot-acilamadi}

In the same situation, "This share link is turned off or was not found" or "Robot bulunamadı" (Robot
not found, a server message in Turkish) can also appear.

Cause: The link was turned off, the robot was deleted, or the link is wrong.

Fix: Ask the person who sent you the link for a new link.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Imported parts cannot be shared in the catalog. Remove them first" appears {#katalogda-paylasilamaz}

Cause: The community catalog does not accept imported models.

Fix: Delete the imported parts, then press **Share** in the form again.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Could not share the robot" or "The request could not be completed" appears {#robot-paylasilamadi}

Cause: The share request could not be completed on the server.

Fix: Try again in a little while.

See [Save to your account and share](hesaba-kaydet-ve-paylas.md).

### "Could not load community robots" appears {#topluluk-robotlari-alinamadi}

This text appears in the **Robot catalog**.

Cause: The community list could not be loaded from the server.

Fix: Press **Try again**.

See [Start with a ready-made robot](hazir-robotla-basla.md).

### "Could not load the robot" appears {#robot-yuklenemedi}

This text appears when you open a community robot.

Cause: The robot's file could not be loaded or read.

Fix: Try again in a little while, or select another robot.

See [Start with a ready-made robot](hazir-robotla-basla.md).

<!-- SAY: When we have account or sharing problems, we always save the robot to a file too. -->

## Make it real and the robot check

### "No parts in the scene - design your robot first" appears {#gercege-dok-sahne-bos}

Cause: The scene is empty.

Fix: Add parts or load a ready-made robot.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "No Control Hub", "No battery" or "No power switch" appears {#zorunlu-elektronik-yok}

Cause: The robot is missing a required electronic part that FTC asks for.

Fix: Press **Add the missing parts**, then move the parts that appear onto the robot.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "The robot has N motors, the limit is 8" or "The robot has N servos, the limit is 8" appears {#motor-servo-siniri}

Cause: The robot has more than 8 motors or servos.

Fix: Press **show**, then delete the extra motor or servo.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "At the start the robot is N mm too ..., the limit is 18 in" appears {#boyut-siniri}

Cause: The robot is bigger than 18 inches (457.2 mm) in one direction.

Fix: Press **show**, then move the parts at the edge inward or make them shorter.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "... is not attached to the robot" appears {#robota-bagli-degil}

Cause: Some parts do not touch the rest of the robot.

Fix: Press **show**, then move the parts to the robot or mate them to it.

See [Mate parts by their holes](parcalari-tak.md).

### "Could not reach shop prices right now" appears {#magaza-fiyatlari}

The text goes on with "the list is shown, but adding to the cart is off. Try again in a moment."

Cause: The shop's prices could not be loaded.

Fix: Close the window and open it again in a little while.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "Could not add the parts to the cart. Your current cart is unchanged. Try again." appears {#sepete-ekleme-tamamlanamadi}

Cause: Adding to the cart stopped partway. Your cart in the shop did not change.

Fix: Press **Add to cart and go to the shop** again.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### "Some part models could not be loaded" appears {#bazi-parcalarin-modeli}

Cause: A part model could not be downloaded during **Add the missing parts**.

Fix: Check your connection. Then close the window and open it again to repeat the robot check.

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

### A part does not go to the cart {#sepete-gitmiyor}

Cause: The **UNIT PRICE** column shows "price coming soon", "out of stock" or "N in stock".

Fix: Keep track of this part in the shop separately (the shop is in Turkish).

See [Make it real: send the parts list to the shop cart](gercege-dok.md).

<!-- SAY: For each problem in the robot check, the show button finds the part with the problem in the scene. -->

## Build

### "Build failed" appears {#derleme-basarisiz}

Cause: The findings have at least one error (for example "overlap").

Fix: Press the finding with the red dot, fix the parts and press **Build again**.

See [Check the robot with Build](robotu-derle.md).

### "The scene is empty - there are no parts to build." appears {#derlenecek-parca-yok}

Cause: There are no material parts in the scene.

Fix: Add parts or load a ready-made robot.

See [Check the robot with Build](robotu-derle.md).

### "Separate group: ... - not connected to the main structure." appears {#ayrik-grup}

In the same situation, "No bolted connections - the parts are only resting on each other." can also
appear.

Cause: The parts do not touch each other, or their holes are not lined up.

Fix: Use **Mate** to join the parts by their holes.

See [Mate parts by their holes](parcalari-tak.md).

### "No motor shaft on the axis of N wheel(s)." appears {#motor-mili-yok}

In the same situation, "There are wheels but no motor - the robot cannot move." can also appear.

Cause: There is no motor to turn the wheel.

Fix: Add a motor and mate the wheel to its shaft.

See [Set up joints and try the motion](eklem-kur-ve-oynat.md).

### I fixed the robot but the result did not change {#sonuc-degismedi}

Cause: The Build result does not refresh by itself.

Fix: Press **Build again**.

See [Check the robot with Build](robotu-derle.md).

<!-- SAY: After we fix the robot, we build it again to see the result. -->

## Sim

### **Try in Sim** is faded {#simde-dene-soluk}

Cause: The scene is empty.

Fix: Load a robot.

See [Try the robot in Sim](simde-dene.md).

### **Try in Sim** is missing from the menu and the Robot catalog {#simde-dene-yok}

Cause: Sim is not responding at this address. Builder shows the item only while Sim can be reached.

Fix: Refresh the page. If the problem goes on, save the project to a file.

See [Try the robot in Sim](simde-dene.md).

### I pressed **Try in Sim** and no new tab opened {#yeni-sekme-acilmadi}

Cause: The browser blocked the pop-up window.

Fix: Use the blocked pop-up icon in the address bar to allow this site, then press **Try in Sim** again.

See [Try the robot in Sim](simde-dene.md).

<!-- SAY: If the Sim tab does not open, we check the browser's pop-up blocker. -->

## Report a bug {#hata-bildir}

If you cannot find your problem on this page, you can write to the team without leaving Builder. The
**🐛 Report a bug** button is in the **Site header**, next to the "BUILDER" badge. While the
"The design tool is in development" window from startup is open, an arrow points to this button with
the text "The Report a bug button is always here".

1. In the **Site header**, press **🐛 Report a bug**. If the intro window is still open, press
   **🐛 Report a bug** in that window.
2. In the **Title** box, type a short summary of what happened.
3. In the **Message** box, type the items in the list below.
4. Press **Send**. To cancel, press **Cancel**.

Result: The window shows "Received, thank you! 🎉". Press **Close** to close the window. If sending
fails, "Could not send it. Try again or use the Contact page." appears.

Write these in the message:

- The open robot or the project name, for example "Omni chassis" or the project name in the
  **Toolbar**.
- The last button or key you pressed.
- The text on the screen, word for word, in quotes.
- Your browser, for example Chrome.

<!-- SAY: If we cannot find the problem, we use Report a bug in the site header to send the team the exact text on the screen. -->
