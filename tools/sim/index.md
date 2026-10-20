# Sim

Sim, robotunu ve programını sanal bir FTC sahasında çalıştırdığın araçtır. Builder'da kurduğun robotu
ve Blocks'ta yazdığın FTC programını robota yüklemeden dener, otonomu izler, TeleOp'u klavyeyle
sürersin. Araç tarayıcıda çalışır, hesap ya da kurulum istemez.

Adres: [probotstudio.com/sim](https://probotstudio.com/sim/)

!!! warning "Dikkat"
    Seçimlerin ve ayarların yalnız bu tarayıcıda saklanır. Dosyadan açtığın robot ve program
    saklanmaz: sayfayı yenilersen onları yeniden açman gerekir. Tarayıcı verisini silersen ya da
    başka bilgisayara geçersen her şey varsayılana döner.

## Kimin için

- FTC programını sahaya çıkmadan denemek isteyen takımlar.
- Builder'da kurduğu robotun sahada nasıl hareket ettiğini görmek isteyenler.
- Sürüş tuşlarını ve otonom rotasını robot hazır olmadan prova etmek isteyenler.

<!-- SAY: Programımızı sahaya çıkmadan Sim'de deniyoruz. -->

## Neyi yapar, neyi yapmaz

| Sim yapar | Sim yapmaz |
|---|---|
| Builder robotunu (hazır robot, açık proje ya da `.json`) sahaya koyar. | Robot kurmaz. Robotu Builder'da kurarsın: [Builder](../builder/index.md). |
| Robotu (`.json`) ve programı (`.blk`) **Dosya** menüsünden açar. | Kaydetmez, paylaşmaz; Sim'de bunlar için düğme yoktur. Robotu Builder'da kaydedersin: [Dosyaya kaydet ve aç](../builder/dosyaya-kaydet-ve-ac.md). Programı Blocks'ta kaydedersin: [Programı kaydet, aç ve Java'yı al](../blocks/ftc-programi-kaydet.md). |
| Blocks FTC programını (`.blk`) Control Hub'daki gibi çalıştırır. | Probot Blocks (`.ino`) programını çalıştırmaz. `.ino` Probot kartında çalışır: [Kodu Probot kartına yükle](../blocks/probot-karta-yukle.md). |
| Otonomu 30 saniye, TeleOp'u 120 saniye koşar. | Kaydı ya da videoyu dışa aktarmaz. Otonom kaydını Sim'de ileri geri sararak izlersin: [Otonomu çalıştır ve kaydı incele](otonomu-calistir.md). |
| Motor, servo, sürekli servo, IMU ve motor enkoderini canlandırır. | Mesafe, renk ve dokunma sensörlerini canlandırmaz. Hangi blokların çalıştığı: [Programı seç](programi-sec.md). |
| Klavyeyi ya da bilgisayara bağlı kumandayı **gamepad1** yapar. | İkinci kumandayı (**gamepad2**) desteklemez. Tuş ve kumanda eşlemesi: [Kısayollar](kisayollar.md). |

**Çok oyunculu** ve **Lig** oyun türleri ekranda görünür ama "Çok yakında" rozetiyle kapalıdır.

!!! info "Yakında"
    Bu özellik şu an geliştirme sürümünde; yakında probotstudio.com'a gelecek.
    Sim, Android Studio'da Java ile yazılmış OpMode'ları (`.java`, `TeamCode` klasörü) da çalıştırır; Java programındaki kamera ve Limelight sahadaki AprilTag etiketlerini görür: [Android Studio projesini aç](programi-sec.md#android-studio-projesini-ac).

<!-- SAY: Sim motorları ve IMU'yu canlandırıyor, sensörleri ve ikinci kumandayı ise desteklemiyor. -->

## Başla

- [İlk 10 dakika](ilk-10-dakika.md): hazır robotla ilk otonomu izle, sonra TeleOp'u sür.
- [Arayüz turu](arayuz.md): her bölge, her düğme.
- [Kısayollar](kisayollar.md): sürüş tuşları, kumanda eşlemesi, fare.
- [Sorun giderme](sorunlar.md): belirti, sebep, çözüm.

<!-- SAY: Yeni başlıyorsak ilk on dakika sayfasından başlıyoruz. -->

## Görevler

- [Robotu seç](robotu-sec.md): hazır robot, Builder projesi, `.json` dosyası, sürüş önü.
- [Programı seç](programi-sec.md): örnek program, Blocks'taki program, `.blk` dosyası.
- [Cihazları porta bağla](cihazlari-porta-bagla.md): koddaki adları robottaki motor ve servolara eşle.
- [Sahayı ve başlangıç yerini seç](sahayi-ayarla.md)
- [Otonomu çalıştır ve kaydı incele](otonomu-calistir.md)
- [TeleOp'u klavyeyle ya da kumandayla sür](teleopu-sur.md)
- [Görünümü ve kamerayı değiştir](gorunumu-degistir.md): 2B, 3B, kamera açıları.
- [Motor değerlerini ve kütleyi ayarla](motorlari-ayarla.md)
- [Panelleri düzenle](panelleri-duzenle.md)

<!-- SAY: Her görev sayfasında tek bir işi adım adım yapıyoruz. -->

## Diğer araçlarla

- Robotu Builder'da kurarsın: [Builder](../builder/index.md).
- Builder'daki robotu Sim'e gönderirsin: [Robotu Sim'de dene](../builder/simde-dene.md).
- FTC programını Blocks'ta yazarsın: [Programı Sim'de dene](../blocks/ftc-simde-dene.md).

<!-- SAY: Robotu Builder'da kuruyor, programı Blocks'ta yazıyor, ikisini Sim'de deniyoruz. -->

## Sözlük

| Terim | Anlamı |
|---|---|
| Ana sayfa | Sim'in açılış ekranı. Robot, Kod ve Oyun bölümlerinde seçim yaparsın. |
| Çalışma alanı | **Başlat**'tan sonra açılan ekran: ortada sahne, çevresinde paneller. |
| Araç çubuğu | Menü çubuğunun altındaki şerit: **Ana sayfa**, çalıştırma düğmesi (TeleOp'ta **Başlat**, otonomda **Çalıştır** / **Yeniden çalıştır**; canlı sürüşte yerine **Durdur** gelir), **Durdur**, **Sıfırla**, görünüm seçici (**Hızlı · 2B** / **Detaylı · 3B**), **Builder** ve **Blocks** bağlantıları. |
| Sahne | Robotun ve sahanın çizildiği alan. 2B ya da 3B olur. |
| Zaman çizelgesi | Sahnenin altındaki oynatma çubuğu. |
| Panel | Çalışma alanındaki taşınabilir pencere: **Robot**, **Kod**, **Saha**, **Driver Station**, **Kumanda**. |
| Hazırlık listesi | Ana sayfanın alt şeridinde seçimlerin özeti ve uyarılar. |
| OpMode | FTC'de robotun çalıştırdığı tek program. Sim'de **Kod** bölümünde seçilir. |
| Otonom | Kumandasız çalışan OpMode. Sim'de 30 saniye koşar. |
| TeleOp | Sürücünün kumandayla yönettiği OpMode. Sim'de 120 saniye koşar. |
| Yapılandırma | Koddaki cihaz adının robottaki hangi porta bağlı olduğunu söyleyen eşleme. |
| Sürüş önü | Sol çubuk ileriyken robotun hangi tarafının önde gittiği. |
| gamepad1 | FTC programının okuduğu birinci kumanda. Klavye ve bağlı kumanda buna yazılır. |
| Telemetri | Programın Driver Station'a yazdığı satırlar. |
| `.json` | Builder proje dosyası. |
| `.blk` | FTC Blocks program dosyası. |

<!-- SAY: Sözlükte Sim'de sık geçen terimlerin anlamına bakıyoruz. -->
