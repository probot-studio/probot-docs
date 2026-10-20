# Probot ile bir robot yapalım

Tek bir robotu baştan sona götüren sunum serisi. Robot **Builder**'da toplanır, **Blocks**'ta FTC bloklarıyla
programlanır ve **Sim**'de çalıştırılır. Her bölüm bir `ders.md`; her `##` başlığı bir slayt, her slaytın
`::: hoca` bloğunda okunacak **Söyle** metni var. Bölümler video çekimine hazır sunum olarak yazıldı.

## Seride sabit kalan adlar

| Ne | Ad |
|---|---|
| Robot | Omni şasi (Builder'da boş sahnedeki hazır robot) |
| Proje | İlk robot |
| Sol motor | `solMotor`, Control Hub port 0 |
| Sağ motor | `sagMotor`, Control Hub port 1, yönü programda REVERSE |
| Otonom program | Ilk Otonom (Autonomous) |
| TeleOp program | Ilk Surus (TeleOp) |

Neden Omni şasi: iki motorlu ve Builder'ın boş sahnesinde tek tıkla geliyor. Blocks'un varsayılan robot
yapılandırmasında `solMotor` ve `sagMotor` adları hazır, Sim'in hazır örnekleri arasında da bu şasiye uygun
iki motorlu bir tank sürüşü var.

## Bölümler

| Bölüm | Konu | Slayt | Söyle okuma | Plan süresi |
|---|---|---|---|---|
| [00 Tanıtım](00-tanitim/ders.md) | Sonuç sahnesi, üç araç, robot ve motor adları | 10 | 3 dk | 4 dk |
| [01 Builder'da robotu topla](01-builder-robotu-topla/ders.md) | Omni şasi, motorlara ad ve port, kaydet, Sim'e gönder | 12 | 3 dk | 5 dk |
| [02 Blocks'ta programı yaz](02-blocks-programi-yaz/ders.md) | FTC Blocks, yapılandırma, Ilk Otonom | 15 | 3,5 dk | 6 dk |
| [03 Sim'de çalıştır](03-sim-calistir/ders.md) | Robot ve program seçimi, otonom, zaman çizelgesi | 12 | 3 dk | 5 dk |
| [04 Final](04-final/ders.md) | Ilk Surus TeleOp, klavyeyle sürüş, özet | 14 | 3 dk | 6 dk |
| **Toplam** | | **63** | **16 dk** | **26 dk** |

Söyle okuma süresi metnin dakikada 140 kelimeyle okunmasına ve slayt başına yaklaşık 1,2 saniyelik geçişe
dayanıyor. Plan süresi slaytlardaki `sure` değerlerinin toplamı. Ekranda tıklama ve sürüş gösterimi için
pay bırakıyor.

## Dayandığı doküman sayfaları

- Builder: [Hazır robotla başla](../builder/hazir-robotla-basla.md), [Parçaları seç, gizle ve sil](../builder/parcalari-sec-gizle-sil.md), [Motor ve servoya ad ve port ver](../builder/motor-ve-servo-ayarla.md), [Dosyaya kaydet ve aç](../builder/dosyaya-kaydet-ve-ac.md), [Robotu Sim'de dene](../builder/simde-dene.md)
- Blocks: [FTC programı yaz](../blocks/ftc-program-yaz.md), [FTC yapılandırmayı ayarla](../blocks/ftc-yapilandirmayi-ayarla.md), [FTC programı kaydet](../blocks/ftc-programi-kaydet.md), [Sim'de dene](../blocks/ftc-simde-dene.md)
- Sim: [Robotu seç](../sim/robotu-sec.md), [Programı seç](../sim/programi-sec.md), [Cihazları porta bağla](../sim/cihazlari-porta-bagla.md), [Otonomu çalıştır](../sim/otonomu-calistir.md), [TeleOp'u sür](../sim/teleopu-sur.md)

## Örnek proje

[`example/`](example/README.md) klasöründe serinin bitmiş dosyaları var.

- `ilk-robot.json`, Builder projesi
- `IlkOtonom.blk`, otonom program
- `IlkSurus.blk`, TeleOp program

## Görseller

Görseller probotstudio.com'dan 1440×900, `deviceScaleFactor: 1` ile çekildi, işaretler magenta `#E6007E`
numaralı rozetle. Çekim betikleri [`capture/`](capture/) klasöründe, ortak yardımcılar `capture/lib.mjs` içinde.
Betikler Playwright ile uzak bir tarayıcıya bağlanır (`PW_WS` ortam değişkeni) ve her parça ayrı çalışır.

| Betik | Parçalar | Ürettiği |
|---|---|---|
| `capture/builder.mjs` | `a1`, `a2`, `a2b`, `a2c`, `a3`, `b1`, `b2` | Builder görselleri, `ilk-robot.json`, Sim için tarayıcı kaydı |
| `capture/blocks.mjs` | `auto`, `teleop` | Blocks görselleri, iki `.blk` dosyası, Sim için tarayıcı kaydı |
| `capture/sim.mjs` | `home-auto`, `run-auto`, `home-teleop`, `run-teleop` | Sim görselleri |

Kullanım: `node capture/<betik>.mjs <çıktı-klasörü> <parça> [example-klasörü]`. `builder.mjs` için örnek klasörü
isteğe bağlı (yalnız `b1` kullanır), `blocks.mjs` için zorunlu. Tarayıcı kayıtları çıktı klasörüne
`seed-*.json` adıyla yazılır.

Sim çekimleri, Builder ve Blocks çekimlerinin bıraktığı tarayıcı kaydıyla açılır. Böylece Sim aynı tarayıcıda
açık robotu ve programı görür.
