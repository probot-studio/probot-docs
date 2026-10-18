# Programı Sim'de dene

Probot Sim, FTC programını robota yüklemeden sanal sahada çalıştırır. Bu sayfada FTC Blocks'ta yazdığın
programı Sim'de açacaksın. Sim'in kendi kullanımı Sim dokümanındadır.

Sim yalnız FTC Blocks programlarını çalıştırır. Probot Blocks'un `.ino` ve `.probot.json` dosyaları Sim'de açılmaz.

## Başlamadan önce

- FTC Blocks'ta bir program açık. Hazır örnekle başlamak için **Örnek seç** penceresinden
  **Tank Şasi TeleOp**'u aç: [FTC örneğiyle başla](ftc-ornekle-basla.md).

<!-- SAY: Denemek için FTC Blocks'ta Tank Şasi TeleOp örneğini açıyoruz. -->

## Açık programı Sim'de seç

Blocks ve Sim aynı tarayıcıda açıksa Sim, Blocks'taki FTC programını kendisi görür.

!!! tip "İpucu"
    Blocks başka bir tarayıcıda ya da başka bir bilgisayarda açıksa Sim programı görmez. Bu durumda
    programı [.blk dosyasıyla aç](#blk-dosyasini-simde-ac).

1. Blocks'ta araç çubuğunda **FTC Blocks** sekmesine bas.
2. Aynı tarayıcıda yeni bir sekmede [probotstudio.com/sim](https://probotstudio.com/sim/) adresini aç.
3. Sim'de **Kod** bölümündeki **OpMode** listesinde "Blocks'ta açık FTC projesi" açıklamalı satırı seç.
   Bu satır listenin başında durur. Adı Blocks'taki **OpMode** kutusunda yazan addır (ör. "Tank Sasi TeleOp").

Sonuç: **Kod** bölümünün özetinde "Tank Sasi TeleOp · TeleOp" yazar. Hazırlık listesinde
"Kod: Tank Sasi TeleOp (TeleOp)" maddesi yeşil onaylıdır.

Blocks'ta programı değiştirirsen Sim listedeki programı yeniden okur.

<!-- SAY: Blocks ile Sim aynı tarayıcıda açıksa Sim programımızı kendiliğinden buluyor. -->

## .blk dosyasını Sim'de aç {#blk-dosyasini-simde-ac}

Programı başka bir tarayıcıya ya da bilgisayara taşırken `.blk` dosyasını kullan.

!!! tip "İpucu"
    Seçtiğin dosya bir FTC Blocks programı değilse **Kod** bölümünde kırmızı kutuda
    "Bu dosya FTC Blocks (.blk) değil." yazar. Dosyayı Blocks'ta **.blk indir** ile al.

1. Blocks'ta araç çubuğunda **.blk indir**'e bas. "TankSasiTeleOp.blk indirildi." bildirimi çıkar.
   Ayrıntı: [Programı kaydet](ftc-programi-kaydet.md).
2. Sim'de **Kod** bölümünde **.blk dosyası aç**'a bas (ya da **Dosya** > **Kod dosyası (.blk) aç…**'ı seç).
3. Açılan pencerede indirdiğin `.blk` dosyasını seç.
4. **Aç**'a bas.

Sonuç: Program "Dosyadan: TankSasiTeleOp.blk" açıklamasıyla **OpMode** listesinin sonuna eklenir ve seçilir.
Satırın adı, `.blk` uzantısı olmadan dosya adıdır (ör. "TankSasiTeleOp").

Listede aynı anda tek bir dosya programı durur. Yeni bir `.blk` açınca önceki dosya programı listeden çıkar.

<!-- SAY: Başka bir bilgisayardan gelen .blk dosyasını da Sim'de açabiliyoruz. -->

## Sim'den Blocks'a dön

Sim'de **Kod** bölümünde **Blocks'ta yaz**'a basınca Blocks yeni sekmede açılır. Aynı işi
**Dosya** > **Blocks'u aç** da yapar.

<!-- SAY: Sim'den Blocks'a tek düğmeyle dönebiliyoruz. -->

## Sorun mu var?

- **Listede "Blocks'ta açık FTC projesi" satırı yok:** Blocks ile Sim aynı tarayıcıda açık olmalı ve
  Blocks'ta **FTC Blocks** sekmesi seçilmiş olmalı. Olmuyorsa programı `.blk` dosyasıyla aç.
  Bkz. [Sorun giderme](sorunlar.md), "Sim programı görmüyor".
- **"Bu dosya FTC Blocks (.blk) değil." yazıyor:** Seçtiğin dosya FTC Blocks programı değil. Blocks'ta
  **.blk indir**'e bas ve inen dosyayı aç.

<!-- SAY: Sim programı görmüyorsa iki sekmenin aynı tarayıcıda olup olmadığına bakıyoruz. -->

## Sonraki adım

- Programdaki cihaz adlarını Sim'deki robotun portlarına bağla: Sim dokümanında "Cihazları porta bağla" sayfası.
- Programına blok eklemek için: [FTC blok listesi](ftc-blok-listesi.md).

<!-- SAY: Programı seçtikten sonra cihaz adlarını Sim'deki robotun portlarına bağlıyoruz. -->
