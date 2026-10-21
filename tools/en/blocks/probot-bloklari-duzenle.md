# Add, connect and edit blocks

On this page you learn how to add blocks in Probot Blocks, connect them to each other, delete and
duplicate them, and move around the workspace.

## Before you start

- Blocks is open and the **Probot Blocks** tab is selected.
- Open a ready-made example to try things out: **Pick an example** > **Tank Drive**. See [Start with a ready-made example](probot-ornekle-basla.md).

## Add a block

1. In the block list, select the **Telemetry** category. The block panel opens.
2. Drag the **write to telemetry** block from the panel into the opening of the **teleopLoop** block.
   ![The write to telemetry block being dragged into teleopLoop; the category is marked 1, the block 2.](../../blocks/img/blocks-blok-ekle.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/?dil=en | hazirla=Probot Blocks, empty project, Telemetry panel open | hedef=text="Telemetry"; text="write to telemetry" | isaret=1,2 | bekle=text="clear telemetry" -->
   <!-- SAY: We select a category and drag the block into a lifecycle block. -->
3. Let go of the block when the opening of **teleopLoop** is highlighted.

Result: The block sits inside **teleopLoop**. In **Code Preview**, the line
`probot::println("Hello Probot");` appears inside `void teleopLoop()`.

Hover over a block for a moment and a tooltip explains what it does.

!!! note "Note"
    Only blocks connected inside the six lifecycle blocks go into the code. A block that sits loose
    in the workspace is not written into the code.

Variables are the only exception. A loose variable block ("set ... to ...", "change ... by") or
**count with** loop still adds `double <name> = 0;` to the Definitions section. The block itself
(the assignment, the loop) does not go into the code.

## Plug a block into a slot

Some blocks have value slots (for example the power slot on **drive motor**). You can type a number
into a slot or plug a value block into it.

1. In the block list, select the **Motor & Drive** category.
2. Drag the **drive motor** block into the opening of **teleopLoop**. Its power slot shows `0.5`.
3. In the block list, select the **Gamepad** category.
4. Drag the **js left stick ↕ (forward +)** block into the power slot of **drive motor**. The `0.5` number block pops out of the slot and sits loose next to it.
5. Drag the loose `0.5` number block to the trash can.

Result: **js left stick ↕ (forward +)** sits in the power slot. In **Code Preview**, the `setMotor(...)`
line shows `js.getLeftY()` instead of `0.5`.

<!-- SAY: We build a program by plugging value blocks into the slots of other blocks. -->

## Change a value in a block

1. Press the number or text in the block.
2. Type the new value.
3. Press <kbd>Enter</kbd> or click an empty spot in the workspace.

Result: The block shows the new value, and the code updates right away.

For fields with a dropdown (`▾`), select an option from the list. To check a checkbox (for example
**reversed**), press the box.

<!-- SAY: We press the number in the block and type the new value. -->

## Add an else branch to an if block {#degilse-kolu-ekle}

The **if** block in the block list has one branch. You add **else if** and **else** branches with
the block's gear icon.

1. In the block list, select the **Control** category.
2. Drag the **if** block into the opening of **teleopLoop**.
3. Press the gear icon on the **if** block. A small editing area opens next to it.
4. In the editing area, drag the **else** piece from the list to below the **if** piece.
5. Press the gear icon again. The editing area closes.

Result: A new **else** branch appears on the **if** block. In **Code Preview**, the line `} else {`
comes after the line `if (false) {`.

You can add the **else if** piece more than once. The **else** piece is added only once and stays
at the bottom. You add pieces to the **create text with** block the same way. Press its gear icon, then in the
editing area drag the **item** piece into the **join** piece.

<!-- SAY: We press the gear icon and add an else branch to the if block. -->

## Delete a block

Lifecycle blocks cannot be deleted. You delete other blocks in one of these ways:

- Select the block, then press <kbd>Delete</kbd> or <kbd>Backspace</kbd>.
- Right-click the block and select **Delete Block**. If there are other blocks inside it, the menu
  item shows the count, for example **Delete 3 Blocks**.
- Drag the block to the trash can or onto the block list.

When you delete with <kbd>Delete</kbd>, <kbd>Backspace</kbd> or **Delete Block**, only that block and
the blocks inside it go away. The blocks connected below it join the block above and stay in place.
If you delete a block by dragging it to the trash can or the block list, the blocks connected below
it go with it.

<!-- SAY: To delete a block we drag it to the trash can or press the Delete key. -->

## Bring back a deleted block

1. In the workspace, press the trash can. The deleted blocks are listed in a panel.
   ![The deleted blocks panel that opens when you press the trash can; the deleted block is marked 1.](../../blocks/img/blocks-cop-kutusu.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/?dil=en | hazirla=ornek:Tank Drive, read gamepad deleted, trash can pressed | hedef=.blocklyFlyout >> text="read gamepad" | isaret=1 | bekle=.blocklyFlyout -->
   <!-- SAY: We can take a block we deleted by mistake back out of the trash can. -->
2. Drag the block you want back from the panel to the workspace.
3. Plug the block into the lifecycle block you want.

Result: The block is back in the workspace. A shorter way is to undo your last action with <kbd>Ctrl</kbd>+<kbd>Z</kbd>.

## Undo and redo

- To undo, right-click an empty spot and select **Undo** (<kbd>Ctrl</kbd>+<kbd>Z</kbd>).
- To redo what you undid, right-click an empty spot and select **Redo**
  (<kbd>Ctrl</kbd>+<kbd>Y</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>).

On a Mac, use <kbd>Cmd</kbd> instead of <kbd>Ctrl</kbd>. For Redo, <kbd>Ctrl</kbd>+<kbd>Y</kbd> also works on a Mac.

<!-- SAY: We can undo our last action and redo it if we want. -->

## Duplicate a block

1. Right-click the block you want to duplicate.
2. In the menu, select **Duplicate**.
   ![The block's right-click menu; the Duplicate item is marked 2.](../../blocks/img/blocks-blok-menusu-cogalt.png)
   <!-- CAPTURE: url=https://probotstudio.com/blocks/?dil=en | hazirla=ornek:Tank Drive | hedef=text="define motor" (right-click); .blocklyContextMenu >> text="Duplicate" | isaret=2 | bekle=.blocklyContextMenu -->
   <!-- SAY: The Duplicate command in the block menu copies the block together with what is inside it. -->
3. Drag the copy and plug it in where you want.

Result: A copy of the block appears, together with the blocks inside it.

With the keyboard: select the block, press <kbd>Ctrl</kbd>+<kbd>C</kbd>, then <kbd>Ctrl</kbd>+<kbd>V</kbd>. To cut, press
<kbd>Ctrl</kbd>+<kbd>X</kbd>.

## Disable a block for now

1. Right-click the block.
2. Select **Disable Block**. The block looks faded, and its line disappears from **Code Preview**.
3. To turn the block back on, right-click it again.
4. Select **Enable Block**.

Result: The block looks the way it did before. Its line comes back in **Code Preview**.

<!-- SAY: To try something without deleting a block we can disable it. -->

## Show inputs side by side or stacked

On blocks with more than one value slot (for example **tank drive**), you can change how the slots
are laid out.

- Right-click the block and select **Inline Inputs**. The slots sit side by side in one row.
- To go back, select **External Inputs**. The slots sit one under the other.

<!-- SAY: We can lay out long blocks in one row or one under the other. -->

## Tidy up the blocks

1. Right-click an empty spot in the workspace.
2. Select **Clean up Blocks**. The blocks line up one under the other.
3. In the workspace, press the center button (target icon). The view is centered and the zoom is reset.

Result: The blocks line up on the left without overlapping. Despite its name, this command does not
delete any blocks. It only arranges them.

<!-- SAY: The Clean up Blocks command does not delete any blocks, it lines them up neatly. -->

## Move around the workspace

- **Scroll:** Drag an empty spot in the workspace. The mouse wheel scrolls up and down, and <kbd>Shift</kbd>+wheel scrolls sideways.
- **Zoom in and out:** In the workspace, press **+** or **−**, or use <kbd>Ctrl</kbd>+wheel.
- **Center:** Press the center button (target icon). The view is centered and the zoom is reset.

![The workspace; the center button and the + and − buttons are marked.](../../blocks/img/blocks-yakinlastirma.png)
<!-- CAPTURE: url=https://probotstudio.com/blocks/?dil=en | hazirla=Probot Blocks, empty project | hedef=.blocklyZoom | isaret=1,2,3 | bekle=text="robotInit" -->
<!-- SAY: In big programs we move around the workspace with the zoom buttons. -->

## Widen the side panel

1. Move the mouse over the thin strip between the workspace and the side panel. The pointer turns into a double arrow.
2. Hold the strip and drag it.
3. Let go.

Result: The side panel gets wider or narrower. The browser remembers the width. This strip does not work on a touchscreen.

<!-- SAY: We can widen the side panel to read the code more comfortably. -->

## Next step

[Write a drive program](probot-surus-programi-yaz.md)
