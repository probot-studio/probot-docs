# Builder

Builder is the tool where you design your robot in 3D in the browser. You pick parts from the
catalog, mate them by their holes, move the joints and send the parts list to the shop cart.
There is nothing to install: open `https://probotstudio.com/builder/?dil=en` in your browser.

This guide covers every button and every key in Builder. Each page walks you through one job from
start to finish, step by step. You can start with a ready-made robot and move on to your own design.

## Who it is for

- Students and teams who want to design their robot on a computer before they buy the parts.
- Teachers who want to show the assembly of a ready-made robot step by step in class.
- Team captains and coaches who want to get the parts list of a design and place an order.

<!-- SAY: Builder is for everyone who wants to design a robot before buying it. -->

## Before you start

- Browser, narrowest screen, mouse and account: [What you need](../index.md#ne-gerekir).
- **It does not work on phones or tablets.** If the browser window is 900 px wide or narrower
  (under 1100 px on a touchscreen), you see the "Builder runs on a computer" screen instead of
  Builder. On a computer, make the window wider or zoom the browser out, and Builder
  comes back.
- This screen has a **Send the link to my computer** button and a **Back to the home page** link.
  If your browser does not support sharing, a **Copy link** button appears too.
- The right and middle mouse buttons rotate and pan the camera.
- You need an account only for **Save to my account**, **My robots**, **Share link** and
  **Share your robot**.
- The interface is in English. **Snap**, **Sketch**, **Extrude** and **Rim** appear under these
  names.

!!! warning "Warning"
    Builder saves your work in this browser automatically. It is lost if you clear your browser
    data or move to another computer. For a lasting copy, select **File** > **Save (download
    JSON)** or save it to your account.

## Contents

**Get started**

- [First 10 minutes](ilk-10-dakika.md): open a ready-made robot, add a part, mate it, save.
- [Interface tour](arayuz.md): every region, every button.
- [Shortcuts](kisayollar.md): all keys and mouse movements.
- [Troubleshooting](sorunlar.md): warnings on screen and how to fix them.

**Build the robot**

- [Start with a ready-made robot](hazir-robotla-basla.md)
- [Build the robot step by step](adim-adim-kur.md)
- [Move around the scene](sahnede-gezin.md)
- [Add parts](parca-ekle.md)
- [Select, hide and delete parts](parcalari-sec-gizle-sil.md)
- [Move and rotate a part](tasi-ve-dondur.md)
- [Mate parts by their holes](parcalari-tak.md)
- [Duplicate, mirror and pattern parts](cogalt-aynala-dizi.md)
- [Group parts and attach them to each other](grupla-ve-bagla.md)
- [Measure a distance](mesafe-olc.md)

**Make the robot move**

- [Set up joints and try the motion](eklem-kur-ve-oynat.md)
- [Add a belt to two pulleys](kayis-ekle.md)
- [Give motors and servos a name and a port](motor-ve-servo-ayarla.md)

**Make your own parts**

- [Make a part from basic shapes](temel-sekillerle-parca-yap.md)
- [Import a 3D model](model-ice-aktar.md)
- [Draw a sketch and make it solid with Extrude](sketch-ve-extrude.md)

**Save, share, make**

- [Save to a file and open it](dosyaya-kaydet-ve-ac.md)
- [Save to your account and share](hesaba-kaydet-ve-paylas.md)
- [Check the robot with Build](robotu-derle.md)
- [Make it real: send the parts list to the shop cart](gercege-dok.md)
- [Try the robot in Sim](simde-dene.md)
- [Arrange the panels](panelleri-duzenle.md)

## What it does and does not do

| Builder does | Builder does not |
|---|---|
| Adds parts from the catalog to the scene and mates them by their holes. | It does not drive the robot on a field. To drive it: [Try the robot in Sim](simde-dene.md). |
| Shows the assembly of the ready-made robots step by step. | It does not make assembly steps for your own robot: [Build the robot step by step](adim-adim-kur.md). |
| Shows the parts list with prices and sends it to the shop cart. | It does not download the parts list as a CSV or PDF file. List and prices: [Make it real: send the parts list to the shop cart](gercege-dok.md). |
| Saves the project to a `.json` file and to your account. | It does not export the model as STL, GLB or STEP. The only export is the project file: [Save to a file and open it](dosyaya-kaydet-ve-ac.md). |
| Imports STL, STEP, GLB and OBJ models. | It does not take screenshots. Use the screenshot tool of your browser or operating system. |
| Checks connections and collisions. | For most shop parts, it does not count an overlap as a collision: [Run Build on a ready-made robot](robotu-derle.md#hazir-robotu-derle). |

<!-- SAY: We design the robot and get the order list in Builder, and we drive the robot in Sim. -->

## Glossary

| Term | Meaning |
|---|---|
| Scene | The 3D area where the robot stands. The large region in the middle. |
| Part | Every object in the scene: a catalog part, a basic shape, an imported model. |
| Ready-made robot | A fully assembled robot that you load from the **Robot catalog** with one click. |
| Family | The length or size options of the same part (for example a Structure with **Length** set to 8 holes). |
| Snap | Moving in 2.5 mm steps and snapping to holes while you move a part. You turn it on and off in the toolbar. |
| Mate | The tool that puts a hole of one part onto a hole of another part, so their axes line up. |
| Attachment | The way one part is attached to another part. When the other part moves, the attached part moves with it. |
| Group | A set of parts that acts as one part after you press **Group**. |
| Joint | A turning movement between two parts. **Continuous rotation** or **Limited rotation**. |
| Assembly mode | The mode that shows a ready-made robot being built step by step. Editing is off in this mode. |
| Sketch | A 2D drawing on a plane. It is not a part and does not go into the parts list. |
| Extrude | The action that gives a closed shape in a sketch a thickness and makes it a solid part. |
| Make it real | The window that sends the parts in the design to the shop cart. |
| Build | The panel that checks the robot's connections and collisions. |
