# Shortcuts

The keyboard keys, the gamepad mapping and the mouse actions in Sim are on this page.

## Driving keys {#surus-tuslari}

The keys work only while you drive TeleOp (status badge "Live · …") and go to the program as **gamepad1**.

| Key | On gamepad1 |
|---|---|
| <kbd>W</kbd> | **Left stick** forward |
| <kbd>S</kbd> | **Left stick** back |
| <kbd>A</kbd> | **Right stick** left (turn) |
| <kbd>D</kbd> | **Right stick** right (turn) |
| <kbd>Q</kbd> | **Left stick** left (strafe) |
| <kbd>E</kbd> | **Left stick** right (strafe) |
| <kbd>K</kbd> | **A** button |
| <kbd>L</kbd> | **B** button |
| <kbd>J</kbd> | **X** button |
| <kbd>I</kbd> | **Y** button |
| <kbd>↑</kbd> | **D-pad** up |
| <kbd>↓</kbd> | **D-pad** down |
| <kbd>←</kbd> | **D-pad** left |
| <kbd>→</kbd> | **D-pad** right |
| <kbd>U</kbd> | **Left bumper** |
| <kbd>O</kbd> | **Right bumper** |
| <kbd>Y</kbd> | **Left trigger** (fully pressed) |
| <kbd>P</kbd> | **Right trigger** (fully pressed) |

- While a key is held down, the value is full (1). You cannot give half a stick or half a trigger with the keyboard.
- If you press <kbd>W</kbd> and <kbd>S</kbd> at the same time, they cancel each other out.
- While the focus is in a text or number box, a drop-down list or the time slider under the scene, the keys do not reach the robot. The arrow keys move the slider at that time. If the robot does not react to the keys, click the scene, then press the keys again.
- When you switch to another window, the keys you hold down are released.

!!! warning "Warning"
    Sim looks at where a key is on the keyboard, not at its letter. The letters in the table are for a QWERTY keyboard.
    On a Turkish F keyboard, you press the key in the place of <kbd>W</kbd> on a QWERTY keyboard.

<!-- SAY: Eighteen keys on the keyboard go to the sticks and buttons of the gamepad, and we drive with them. -->

## Other keys

| Key | Where | What it does |
|---|---|---|
| <kbd>Esc</kbd> | While a menu is open | Closes the menu. |
| <kbd>Enter</kbd> | In a motor or mass box | Applies the value. |
| <kbd>Esc</kbd> | In a motor or mass box | Clears what you typed and goes back to the old value. |

Sim has no save or undo shortcut.

<!-- SAY: We close the menu with Esc and apply the value in a number box with Enter. -->

## Mouse

| Action | Where | What it does |
|---|---|---|
| Drag with the left button | 3D scene | Rotates the camera. |
| Drag with the right button | 3D scene | Pans the camera. |
| Wheel | 3D scene | Zooms in and out. |
| Hover | 2D scene | Shows the position of the pointer as "x … · y … in". |

The mouse does not work in the **Driver's-eye view** camera. See [Use the 3D camera](gorunumu-degistir.md#3b-kamerayi-kullan).

<!-- SAY: On the 3D scene we rotate, pan and zoom with the mouse. -->

## Gamepad {#kumanda}

A USB or Bluetooth gamepad is read in the "standard" layout. Sim reads only the first gamepad that connects and makes it **gamepad1**.

| On the gamepad (Xbox / PlayStation) | In Blocks (gamepad1 block) |
|---|---|
| **Left stick** | `LeftStickX`, `LeftStickY` |
| **Right stick** | `RightStickX`, `RightStickY` |
| Pressing the **left stick** | `LeftStickButton` |
| Pressing the **right stick** | `RightStickButton` |
| **A** / **Cross (✕)** | `A` |
| **B** / **Circle (○)** | `B` |
| **X** / **Square (□)** | `X` |
| **Y** / **Triangle (△)** | `Y` |
| **LB** / **L1** | `LeftBumper` |
| **RB** / **R1** | `RightBumper` |
| **LT** / **L2** | `LeftTrigger` |
| **RT** / **R2** | `RightTrigger` |
| **D-pad** up | `DpadUp` |
| **D-pad** down | `DpadDown` |
| **D-pad** left | `DpadLeft` |
| **D-pad** right | `DpadRight` |
| **Back** / **Share** | `Back` |
| **Start** / **Options** | `Start` |
| **Xbox** / **PS** button | `Guide` (Sim reads it, but the Blocks toolbox has no ready-made block for this button.) |

- Small movements of a stick (under 6 percent) are ignored.
- While a gamepad is connected, the keyboard works too. If both press the same button at the same time, the gamepad's value wins.
- Sim has no touch-screen gamepad.
- In the OnBot Java preview in Blocks, the same fields appear in the form `gamepad1.left_stick_x`.

<!-- SAY: Every button of the gamepad connected to the computer goes to the gamepad1 button in the FTC program. -->
