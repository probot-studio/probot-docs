# Örnek proje: İlk robot

"Probot ile bir robot yapalım" serisinin bitmiş dosyaları. Üçü de probotstudio.com'dan seride anlatılan
adımlarla indirildi. Builder projeyi proje adıyla `İlk robot.json` olarak indirir, burada boşluksuz
`ilk-robot.json` adıyla duruyor.

| Dosya | Araç | İçerik |
|---|---|---|
| `ilk-robot.json` | Builder | Omni şasi, proje adı İlk robot. Sol motor `solMotor` (Control Hub port 0), sağ motor `sagMotor` (Control Hub port 1). Ters yön işaretsiz. |
| `IlkOtonom.blk` | Blocks (FTC) | Otonom. `sagMotor` yönü REVERSE, iki motor 0.5 güçle 1500 ms ileri, sol 0.5 sağ -0.5 ile 800 ms sağa dönüş, iki motor 0. |
| `IlkSurus.blk` | Blocks (FTC) | TeleOp. `sagMotor` yönü REVERSE, döngüde sol güç `-LeftStickY + RightStickX`, sağ güç `-LeftStickY - RightStickX`. |

## Sim'de açmak

1. probotstudio.com/sim adresini açın.
2. **Robot** kartında **Proje dosyası aç**'a basıp `ilk-robot.json`'u seçin. Listede "Dosyadan: ilk-robot.json" satırı çıkar.
3. **Kod** kartında **.blk dosyası aç**'a basıp `IlkOtonom.blk`'u ya da `IlkSurus.blk`'u seçin.
4. **Yapılandırma** tablosunda `solMotor` Control 0'a, `sagMotor` Control 1'e eşlenmiş görünür.
5. Alt şeritte **Başlat**'a basın.

## Builder ve Blocks'ta açmak

- `.blk` dosyaları Blocks'un **FTC Blocks** sekmesinde **.blk yükle** ile açılır.
- `ilk-robot.json` Builder'da **Dosya** > **Yükle...** ile açılır. **Yükle...** sahnedeki projeyi onay sormadan
  değiştirir, sahnedeki çalışmayı önce kaydedin.

## Yeniden kurmak

Dosyalar elle değil, seri bölümlerindeki adımlarla üretildi. Çekim betikleri ([`../capture/`](../capture/)) de son adımda aynı dosyaları sitenin indirdiği hâliyle bu klasöre yazar. Aynı sonucu almak için:

1. Builder'da Omni şasi, iki REV HD Hex Motor'a ad ve port, proje adı İlk robot, **Dosya** > **Kaydet (JSON indir)**.
2. Blocks'ta **FTC Blocks**, OpMode `Ilk Otonom`, Tür Autonomous, bölüm 2'deki bloklar, **.blk indir**.
3. Blocks'ta **Yeni program**, OpMode `Ilk Surus`, Tür TeleOp, bölüm 4'teki bloklar, **.blk indir**.
