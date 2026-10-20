# Driver Station arayüzü

Driver Station, robotun kendi WiFi ağından tarayıcıda açılan maç kontrol ekranıdır; bu sayfa her sekmeyi, düğmeyi ve göstergeyi tanıtır.

Adres `http://192.168.4.1`. Sayfa robotun içinden gelir, internet gerekmez. Ekrandaki yazılar İngilizcedir; bu sayfada da ekrandaki gibi yazılır. Robota bağlanma adımları: [İlk 10 dakika](ilk-10-dakika.md#robotun-agina-baglan).

Driver Station'ı aynı anda tek bir cihaz kontrol eder. Sayfayı ilk açan cihaz robotun sahibi olur. Başka bir cihaz açmaya çalışırsa "Another client is already connected." yazısını görür. Sahip cihaz 5 saniye sessiz kalırsa yer boşalır.

## Üst şerit {#ust-serit}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| "Probot Driver Station" başlığı | Sayfanın adı. Ekran 900 pikselden darsa gizlenir. | |
| **Dashboard**, **Joystick**, **Logs** | Sekmeyi açar. Sayfa **Dashboard** ile açılır. | |
| Bağlantı göstergesi | Renkli nokta, 4 sinyal çubuğu, gecikme (ms) ve robotun boş / toplam belleği (KB). Nokta 3-4 çubukta yeşil, 2'de sarı, daha azında kırmızıdır. | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |
| **Status** | Maçın hangi aşamada olduğu ve kısa açıklaması (aşağıdaki tablo). Ekran 900 pikselden darsa gizlenir. | [Maç akışı](hooklari-yaz.md#mac-akisi) |

| **Status** | Açıklama | Ne zaman |
|---|---|---|
| Standby | "Awaiting command" | Sayfa ilk açıldığında |
| Init | "Systems primed" | **Init**'ten sonra |
| Autonomous | "Auto running - 12.3 s" (kalan süre) | Otonom sürerken |
| Teleop | "Drivers in control" | Teleop sürerken |
| Stopped | "Motors safe" | **Stop**'tan sonra |

## Dashboard {#dashboard}

![Dashboard sekmesi; Match Control, Joystick ve Telemetry bölümleri.](img/core-dashboard.png)

### Match Control {#match-control}

**Match Control** bölümünde tek bir ana düğme vardır. Üstündeki yazı sırayla **Init**, **Start** ve **Stop** olur.

| Ad | Ne yapar | Karttaki LED | İlgili görev |
|---|---|---|---|
| **Init** | `robotInit()` bir kez çalışır. Robot hazırdır, hareket etmez. Düğmenin yazısı **Start** olur. | Sarı, sabit | [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md#mac-akisi) |
| **Start** | **Autonomous** açıksa `autonomousInit()` ve `autonomousLoop()` çalışır; süre dolunca `teleopInit()` ve `teleopLoop()` başlar. **Autonomous** kapalıysa doğrudan teleop başlar. Düğmenin yazısı **Stop** olur. | Otonomda turuncu, teleopta yeşil yanıp söner | [Otonomu yaz](otonom-yaz.md) |
| **Stop** | O anki loop turu bitince `robotEnd()` bir kez çalışır, robot durur. Düğmenin yazısı yeniden **Init** olur. | Mavi | [Motorları Stop'ta durdur](hooklari-yaz.md#robotend) |
| **Autonomous Duration** | Otonomun süresi, saniye. Varsayılan 30. **Start**'a basınca robota gönderilir. | | [Otonomu yaz](otonom-yaz.md) |
| **Autonomous** | Açıkken **Start** önce otonomu başlatır. Varsayılan açıktır. Otonom sürerken kapatırsan robot teleopa geçer. Teleopta değiştirilemez. | | |
| **EMERGENCY STOP** | Acil durdurma. Robot kodunu loop turunun bitmesini beklemeden keser, sonra `robotEnd()`'i çalıştırır. Robot yeniden başlatılana kadar kilitli kalır; **Init** ve **Start** çalışmaz. | Kırmızı, sabit | ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi) |
| **Autonomous Countdown** | Otonomda kalan süre ve azalan çubuk. | | |

Karttaki LED'in tüm renkleri: [Durum LED'ini kullan](led-durumu.md).

!!! warning "Dikkat"
    **Stop** robot kodunu yarıda kesmez, loop turunun bitmesini bekler. Loop takılırsa **Stop** gecikir. Robotu anında durdurman gerekirse **EMERGENCY STOP**'a bas.

### Joystick {#joystick-karti}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Daire | Kumandanın sol çubuğunu nokta olarak gösterir. | |
| "Connected" / "Not Connected" | Sayfanın bir kumanda görüp görmediği. | [Kumandayı bağla](ilk-10-dakika.md#kumandayi-bagla) |
| **Open Joystick page** | **Joystick** sekmesini açar. | |

### Telemetry {#telemetry}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Telemetry paneli | Kodundaki `probot::print`, `probot::println` ve `probot::printf` yazılarını gösterir. Robot son 256 baytı tutar, eski satırlar düşer. Panel, yazı değiştikçe güncellenir. | [Telemetry paneline yaz](kumandayi-oku.md#telemetri) |
| **Clear** | Paneldeki yazıyı ekrandan siler. Kod yeni bir şey yazınca panel yeniden dolar. | |
| **Auto-scroll: ON** / **Auto-scroll: OFF** | Açıkken panel hep en alttaki satırı gösterir. Kapalıyken yukarı kaydırıp eski satırları okuyabilirsin. | |

## Joystick sekmesi {#joystick-sekmesi}

![Joystick sekmesi; Joystick Check'te A düğmesi basılı, System Logs'ta Axis 1: -0.62.](img/core-joystick.png)

Bu sekme kumandanın tarayıcıya ne gönderdiğini gösterir. Değerler kütüphanenin kodda okuduğu değerlerle aynı değildir; ham değerlerdir.

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **Joystick Check** daire | Sol çubuğun konumu. | |
| Düğme daireleri | Basılan düğme koyu görünür. Etiketler: A, B, X, Y, LB, RB, LT, RT, Back, Start, L3, R3; sonrakiler P13, P14... | [Düğmeleri oku](kumandayi-oku.md#dugmeler) |
| "Connected" / "Not Connected" | Kumandanın görünüp görünmediği. Kumanda hiç görünmediyse altında "Press any controller button to activate." yazar. | [Kumanda "Not Connected"](sorunlar.md#kumanda-baglanmiyor) |
| Kumanda listesi | "No Gamepad" ya da kumandanın adı ve sırası ("... (idx 0)"). İlk görünen kumanda kendiliğinden seçilir. Birden çok kumanda varsa robota gidecek olanı buradan seç. | |
| Kumanda bilgisi | Kumandanın adı, eksen sayısı ve düğme sayısı ("Axes:4 Buttons:17" gibi). | [Kumanda eşlemesini değiştir](kumandayi-oku.md#esleme) |
| Eksen listesi | Her eksenin ham değeri ("Axis 1: -0.62"). Tarayıcı çubuğu ileri ittiğinde eksi değer verir; kodda `js.getLeftY()` ileriyi artı okur. | [Çubukları oku](kumandayi-oku.md#cubuklar) |
| Düğme listesi | Her düğmenin numarası; ● basılı, ○ basılı değil. | |

## Logs sekmesi {#logs}

![Logs sekmesi; WiFi Configuration, Network Status ve ESP32 System bölümleri.](img/core-logs.png)

### WiFi Configuration {#wifi-configuration}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **SSID** | Robotun ağ adı. | [Robotun WiFi ayarlarını yap](wifi-ayarla.md) |
| **Channel** | Kanal ve nereden geldiği: "(macro)" koddan, "(nvs)" karta kayıtlı seçimden, "(auto)" otomatik seçimden. | [Kanalı kod yüklemeden değiştir](wifi-ayarla.md#kanal-degistir) |
| **IP Address** | Robotun adresi, `192.168.4.1`. | |
| **Kanal Değiştir** listesi ve **Uygula** | Seçilen kanala robotu kod yüklemeden geçirir ve kanalı karta kaydeder. **Varsayılana dön (açılışta)** kaydı siler; robot yeniden açılınca koddaki kanala döner. Altındaki satır sonucu yazar. | [Kanalı kod yüklemeden değiştir](wifi-ayarla.md#kanal-degistir) |

### Network Status {#network-status}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **RSSI** | Robotun bağlı cihazdan aldığı sinyal, dBm. | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |
| **Ping** | Sayfanın robota sorup cevap aldığı süre, ms. | |
| **WebSocket** | Sayfayla robot arasındaki canlı kanal: "Connected" ya da "Disconnected". | |
| **Deadline Miss** | "YES": bir loop turu 2 saniyeyi geçti, robot güvenli bekliyor. "No": sorun yok. | [LED kırmızı yanıp sönüyor](sorunlar.md#pb-e301-deadline-miss-loop-takildi) |
| **Joystick Age** | Robota gelen son kumanda verisinin yaşı, ms. | |
| **Clients** | Robotun ağına bağlı cihaz sayısı. | |
| **Last Disconnect** | Son kopan cihazın WiFi neden kodu ("reason 8" gibi). | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |

### ESP32 System {#esp32-system}

| Ad | Ne yapar |
|---|---|
| **Chip**, **CPU**, **SDK** | Kartın çip modeli, işlemci hızı ve ESP-IDF sürümü. |
| **Uptime** | Kartın açık kaldığı süre. |
| **Heap (Free / Total)** | Boş ve toplam bellek. |
| **PSRAM** | Ek bellek; yoksa "None". |
| **Flash (Sketch / Total)** | Kodun kapladığı yer ve kartın toplam flash belleği. |
| **Free Sketch Space** | Kartın bildirdiği boş kod alanı. |

## Telefonda {#telefonda}

![Telefonda dikey Dashboard; Match Control, Joystick ve Telemetry alt alta.](img/core-telefon.png)

Telefonu dikey tuttuğunda bölümler alt alta dizilir. Düğmeler ve sekmeler aynıdır. Üst şeritteki "Probot Driver Station" başlığı ve **Status** alanı dar ekranda gizlenir; maçın durumunu ana düğmenin yazısından ve karttaki LED'den izle.

## Bağlantı koparsa {#baglanti-koparsa}

| Ne olur | Ne zaman | Ne yap |
|---|---|---|
| Kumanda değerleri sıfırlanır, motorlar son komutla kaçmaz. | Robota 500 ms kumanda verisi gelmezse | Bağlantıyı kontrol et. |
| Sayfayı "DISCONNECTED" ve "Trying to reconnect..." yazan bir perde kaplar. Sayfa yeniden bağlanmayı dener. | Sayfaya 6 saniye robottan veri gelmezse | Cihazın hâlâ robotun ağında olduğunu kontrol et. |
| Robot **Stop**'a geçer (varsayılan ayar). | Driver Station 10 saniye tamamen sessiz kalırsa | Yeniden bağlan, **Init** ve **Start**'a bas: [Bağlantı koptu, robot durdu](sorunlar.md#pb-e303-baglanti-kopmasi-robot-durduruldu). |
| Sayfayı "EMERGENCY STOPPED" yazan bir perde kaplar; **Reboot Robot** düğmesi görünür. | **EMERGENCY STOP**'tan sonra | **Reboot Robot**'a bas ya da robotu kapatıp aç: ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi). |

## Sorun mu var?

- **Sayfa açılmıyor ya da "Another client is already connected." yazıyor:** [Arayüz açılmıyor](sorunlar.md#arayuz-acilmiyor).
- **Kumanda "Not Connected":** [Kumanda "Not Connected"](sorunlar.md#kumanda-baglanmiyor).

## Sonraki adım

[Robotun WiFi ayarlarını yap](wifi-ayarla.md): ağ adı, şifre ve kanal.
