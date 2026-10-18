# FTC blok listesi

Bu sayfa FTC Blocks'taki kategorileri ve içlerindeki blokları listeler. Bloklar FTC'nin kendi Blocks
editöründen alınmıştır ve İngilizcedir; Control Hub'daki aynı adlı bloklarla aynı çalışır. Ayrıntılı
açıklama için FTC dokümanına bak: [FTC Docs: Blocks](https://ftc-docs.firstinspires.org/en/latest/programming_resources/blocks/Blocks-Tutorial.html).

Araç kutusunda yalnız okul robotu için gereken bloklar vardır. Cihaz türleri DcMotor, Servo, CRServo ve
IMU ile sınırlıdır; renk, mesafe ve dokunma sensörleri yoktur.

**Ürettiği kod** sütunu, bloğun **OnBot Java** bölümünde ürettiği satırı gösterir. `<ad>` yerine
**Robot yapılandırması**ndaki cihaz adı yazılır.

<!-- SAY: Bloklar Control Hub'dakilerle aynı çalışıyor ve burada okul robotu için gerekenler var. -->

## Cihaz kategorileri nasıl oluşur

**Actuators** ve **Sensors** altındaki kategoriler **Robot yapılandırması**ndan kurulur. Her cihaz için
kendi adıyla bir kategori çıkar. Yapılandırmada o türde cihaz yoksa kategori görünmez. Bkz.
[Robot yapılandırmasını ayarla](ftc-yapilandirmayi-ayarla.md).

<!-- SAY: Motor ve sensör kategorileri yapılandırmadaki cihaz adlarıyla oluşuyor. -->

## LinearOpMode

| Blok | Ne yapar | Ürettiği kod |
|---|---|---|
| **call waitForStart** | **START**'a basılana kadar bekler. | `waitForStart();` |
| **call idle** | Döngüde işlemciyi kısa süre bırakır. | `idle();` |
| **call sleep** `1000` | Verilen milisaniye kadar bekler. | `sleep(1000);` |
| **call opModeInInit** | **INIT** ile **START** arasındaysa doğru verir. | `opModeInInit()` |
| **call opModeIsActive** | Program çalışıyorsa doğru verir. Ana döngünün koşuludur. | `opModeIsActive()` |
| **call isStarted** / **call isStopRequested** | **START**'a basıldı mı / **STOP** istendi mi. | `isStarted()` / `isStopRequested()` |
| **call getRuntime** / **call resetRuntime** | OpMode süresini verir / sıfırlar. | `getRuntime()` / `resetRuntime();` |
| **call requestOpModeStop** | Programı durdurur. | `requestOpModeStop();` |

<!-- SAY: LinearOpMode blokları programın akışını yönetiyor. -->

## Gamepad

| Grup | Bloklar | Ürettiği kod |
|---|---|---|
| Çubuk ve tetik (sayı) | `gamepad1.LeftStickX`, `LeftStickY`, `RightStickX`, `RightStickY`, `LeftTrigger`, `RightTrigger` | `gamepad1.left_stick_x`, `gamepad1.left_stick_y`, `gamepad1.left_trigger` |
| Tuşlar (doğru/yanlış) | `A`, `B`, `X`, `Y`, `LeftBumper`, `RightBumper`, `DpadUp`, `DpadDown`, `DpadLeft`, `DpadRight`, `Back`, `Start`, `LeftStickButton`, `RightStickButton` | `gamepad1.a`, `gamepad1.left_bumper`, `gamepad1.dpad_up` |
| **Pressed** | `AWasPressed` ... `DpadRightWasPressed`: tuşa yeni basıldıysa bir kez doğru verir. | `gamepad1.a_was_pressed()` |
| **Rumble** | `rumble` (500 ms), `rumbleBlips` (3), `isRumbling`, `stopRumble`: kumandayı titretir. | `gamepad1.rumble(500);`, `gamepad1.rumbleBlips(3);`, `gamepad1.isRumbling()`, `gamepad1.stopRumble();` |

Tüm Gamepad blokları `gamepad1` ile gelir. İkinci kumanda için bloktaki listeden `gamepad2`'yi seç.
Bloğun özellik listesinde araç kutusunda olmayan seçenekler de vardır: `AWasReleased` gibi bırakma
seçenekleri, `Circle`, `Cross` gibi PlayStation adları ve `Touchpad`.

<!-- SAY: Gamepad blokları kumandanın çubuklarını ve tuşlarını okuyor. -->

## Actuators

| Alt kategori | Bloklar | Ürettiği kod |
|---|---|---|
| **DcMotor** > `<ad>` | `Power` yaz (1 ve 0), `Power` oku. | `<ad>.setPower(1);`, `<ad>.getPower()` |
| **DcMotor** > `<ad>` | `Direction`, `ZeroPowerBehavior`, `Mode` (RunMode) yaz. | `<ad>.setDirection(DcMotor.Direction.REVERSE);`, `<ad>.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);`, `<ad>.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);` |
| **DcMotor** > `<ad>` | `CurrentPosition` oku, `TargetPosition` yaz ve oku, `isBusy`. | `<ad>.getCurrentPosition()`, `<ad>.setTargetPosition(0);`, `<ad>.isBusy()` |
| **DcMotor** > `<ad>` | İki motora aynı anda `Power` veren blok. Yapılandırmada en az iki motor varsa çıkar. | `<ad1>.setPower(1);` ve `<ad2>.setPower(1);` |
| **DcMotor** > `<ad>` > **Extended** | `Velocity` yaz ve oku, `getCurrent`. | `((DcMotorEx) <ad>).setVelocity(0);`, `((DcMotorEx) <ad>).getVelocity()` |
| **Servo** > `<ad>` | `Position` yaz (0.5) ve oku, `Direction`, `scaleRange` (0.2-0.8). | `<ad>.setPosition(0.5);`, `<ad>.getPosition()`, `<ad>.setDirection(Servo.Direction.REVERSE);`, `<ad>.scaleRange(0.2, 0.8);` |
| **CRServo** > `<ad>` | `Power` yaz (1 ve 0), `Direction`. | `<ad>.setPower(1);`, `<ad>.setDirection(CRServo.Direction.REVERSE);` |

<!-- SAY: Actuators blokları motorları ve servoları sürüyor. -->

## Sensors

| Alt kategori | Bloklar | Ürettiği kod |
|---|---|---|
| **IMU** > `<ad>` | `initialize` (REV hub yönüyle), `resetYaw`. | `<ad>.initialize(new IMU.Parameters(...));`, `<ad>.resetYaw();` |
| **IMU** > `<ad>` | `RobotYawPitchRollAngles`, `Yaw` (açı birimiyle). | `<ad>.getRobotYawPitchRollAngles()`, `orientation.getYaw(AngleUnit.DEGREES)` |
| **IMU** > `<ad>` | `getRobotAngularVelocity`, `ZRotationRate`. | `<ad>.getRobotAngularVelocity(AngleUnit.DEGREES)`, `angularVelocity.zRotationRate` |

<!-- SAY: IMU blokları robotun yönünü ölçüyor. -->

## Utilities

| Alt kategori | Bloklar | Ürettiği kod |
|---|---|---|
| **ElapsedTime** | Zamanlayıcı oluştur, `Seconds`, `Milliseconds`, `reset`. | `new ElapsedTime()`, `myElapsedTime.seconds()`, `myElapsedTime.milliseconds()`, `myElapsedTime.reset();` |
| **Range** | `clip` (değeri sınırlar), `scale` (değeri başka aralığa çevirir). | `Range.clip(0, -1, 1)`, `Range.scale(0, 0, 1, 0, 100)` |
| **Telemetry** | `addData` (sayı), `addData` (metin), `addLine`, `update`. | `telemetry.addData("key", 123);`, `telemetry.addData("key", "text");`, `telemetry.addLine("text");`, `telemetry.update();` |
| **Time** | `currentTimeMillis`, `nanoTime`. | `System.currentTimeMillis()`, `System.nanoTime()` |

<!-- SAY: Utilities blokları zaman, aralık ve telemetri işlerini yapıyor. -->

## Genel programlama blokları

| Kategori | Bloklar |
|---|---|
| **Logic** | `if`, `if-else`, `if-else if-else`, karşılaştırma, `and` / `or`, `not`, `true` / `false`, üçlü seçim. |
| **Loops** | `repeat 10 times`, `repeat while`, `count with` (1-10), `for each item`, `break out of loop` (listeden `continue with next iteration of loop` seçilebilir). |
| **Math** | Sayı, + − × ÷ ^, eksi, mutlak değer, karekök, trigonometri, `atan2`, sabitler, yuvarlama, `min` / `max`, kalan, sınırlama, rastgele sayı. |
| **Text** | Metin, birleştirme, uzunluk, `formatNumber`. |
| **Lists** | Boş liste, liste oluştur, uzunluk, öğe al, öğe yaz. |
| **Variables** | **Create variable...** ve değişken blokları. |
| **Functions** | Fonksiyon tanımlama (`to do something`), değer döndüren fonksiyon, `if return`, çağırma blokları. |

Bu blokların ürettiği kodu **OnBot Java** bölümünde görürsün.

<!-- SAY: Mantık, döngü ve matematik blokları her programda kullanılıyor. -->
