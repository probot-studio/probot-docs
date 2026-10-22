# Driver Station arayüzü

Driver Station, robotun kendi WiFi ağından tarayıcıda açılan maç kontrol ekranıdır; bu sayfa her sekmeyi, düğmeyi ve göstergeyi tanıtır.

Adres `http://192.168.4.1`. Sayfa robotun içinden gelir, internet gerekmez. Bölüm başlıkları ve düğmeler çoğunlukla İngilizcedir; bu sayfada da ekrandaki gibi yazılır. Robota bağlanma adımları: [İlk 10 dakika](ilk-10-dakika.md#robotun-agina-baglan).

Driver Station'ı aynı anda tek bir cihaz kontrol eder. Sayfayı ilk açan cihaz robotun sahibi olur. Başka bir cihaz açmaya çalışırsa "Another client is already connected." yazısını görür. Sahip cihaz 5 saniye sessiz kalırsa yer boşalır.

## Üst şerit {#ust-serit}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Probot logosu, "Probot Studio" ve "DRIVER STATION" | Sayfanın adı. "DRIVER STATION" etiketi ekran 460 pikselden darsa gizlenir. | |
| **Dashboard**, **Joystick**, **Logs** | Sekmeyi açar. Sayfa **Dashboard** ile açılır. Ekran 760 pikselden darsa sekmeler şeridin altında ikinci satıra iner. | |
| Bağlantı göstergesi | Renkli nokta, 4 sinyal çubuğu, gecikme ("12ms" gibi) ve robotun boş / toplam belleği ("180/320KB" gibi). Nokta 3-4 çubukta yeşil, 2'de sarı, daha azında kırmızıdır. Ekran 460 pikselden darsa gecikme ve bellek gizlenir. | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |
| PB-E301 bandı | Bir loop turu takılınca şeridin altında "PB-E301 · Loop takıldı (deadline miss)" diye başlayan kırmızı bir bant çıkar. Tur bitince kaybolur. | [LED kırmızı yanıp sönüyor](sorunlar.md#pb-e301-deadline-miss-loop-takildi) |

## Dashboard {#dashboard}

![Dashboard sekmesi teleopta; Teleoperated seçili, Start pasif, üç ışık yeşil, Battery 12.3 V, Telemetry'de Sol Y: 0.62.](img/core-dashboard.png)

**Dashboard** altı bölümden oluşur: **Match Phase**, **Match Control**, **System Status**, **Battery**, **Signal** ve **Telemetry**.

### Match Phase {#match-phase}

Maçın hangi aşamada olduğunu, kısa bir açıklamayı ve maç saatini gösterir.

| Aşama | Açıklama | Ne zaman |
|---|---|---|
| Standby | "Awaiting command" | Sayfa ilk açıldığında ve **Stop**'tan sonra |
| Auto Init | "initLoop çalışıyor" ve Start beklendiği | **Autonomous** seçiliyken **Init**'ten sonra |
| TeleOp Init | "initLoop çalışıyor" ve Start beklendiği | **Teleoperated** seçiliyken **Init**'ten sonra |
| Autonomous | "Running script · 12.3 s" (kalan süre) | Otonom sürerken |
| Teleop | "Drivers in control" | Teleop sürerken |
| Transition | "Auto bitti" ve TeleOp için Init beklendiği | Otonom süresi dolunca |

**Match Time** maç saatidir. **Standby**'dan **Init**'e basınca "00:00"a döner, **Start**'tan sonra saymaya başlar. Otonom bitince durmaz, teleop boyunca sayar. **Stop**'ta durur.

### Match Control {#match-control}

**Match Control** bölümünde mod listesi, iki düğme, otonom süresi ve **Emergency Stop** vardır. Sol düğmenin yazısı maçın aşamasına göre **Init**, **Start**, **Init Teleop** ya da **Init Auto** olur.

| Ad | Ne yapar | Karttaki LED | İlgili görev |
|---|---|---|---|
| **Autonomous** / **Teleoperated** | Hangi modun çalışacağını seçer. Robot açıldığında **Teleoperated** seçilidir. Yalnız robot dururken (**Standby** ya da **Transition**) seçilebilir; **Init**'ten sonra kilitlenir. | | [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md#mac-akisi) |
| **Init** | Seçili modun `autonomousInit()` ya da `teleopInit()` fonksiyonu bir kez çalışır. Sonra `autonomousInitLoop()` ya da `teleopInitLoop()` tekrar tekrar çağrılır. Robot hazırdır ama hareket etmez; kumanda değerleri 0 okunur. Düğmenin yazısı **Start** olur. | Sarı, sabit | [Maç akışına göre fonksiyonları yaz](hooklari-yaz.md#mac-akisi) |
| **Start** | Seçili modun `autonomousStart()` ya da `teleopStart()` fonksiyonu bir kez çalışır. Sonra `autonomousLoop()` ya da `teleopLoop()` tekrar tekrar çağrılır. Robot çalışırken bu düğme pasif kalır. | Otonomda turuncu, teleopta yeşil yanıp söner | [Otonomu yaz](otonom-yaz.md) |
| **Init Teleop** / **Init Auto** | Otonom süresi dolunca görünür. Teleop kendiliğinden başlamaz: önce bu düğmeye, sonra **Start**'a bas. Robot **Teleoperated**'ı kendisi seçer; istersen önce modu değiştirebilirsin. | Sarı yanıp söner | [Otonomu yaz](otonom-yaz.md) |
| **Stop** | Robot **Init**'teyken ya da çalışırken basılabilir. O anki loop turu bitince seçili modun `autonomousStop()` ya da `teleopStop()` fonksiyonu bir kez çalışır, robot durur. **Init** ya da **Start** komutu henüz işlenmemişken de kabul edilir. | Mavi yanıp söner | [Motorları Stop'ta durdur](hooklari-yaz.md#robotend) |
| **Autonomous süresi** | Otonomun süresi, saniye. **−** ve **+** 1 saniye değiştirir; 1-120 arası yazılabilir. Varsayılan 30. **Init** ve **Start**'a basınca robota gönderilir. **Teleoperated** seçiliyken soluk görünür. | | [Otonomu yaz](otonom-yaz.md) |
| **Countdown** | Otonomda kalan süre ("12.3 s") ve azalan çubuk. | | |
| **Emergency Stop** | Acil durdurma. Robot kodunu loop turunun bitmesini beklemeden keser. Robot **Init**'te ya da çalışıyorsa o anki modun `autonomousStop()` ya da `teleopStop()` fonksiyonunu çalıştırır. Robot yeniden başlatılana kadar kilitli kalır; **Init** ve **Start** çalışmaz. Kısayolu <kbd>Space</kbd> (boşluk tuşu). | Kırmızı, sabit | ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi) |

Karttaki LED'in tüm renkleri: [Durum LED'ini kullan](led-durumu.md).

!!! warning "Dikkat"
    **Stop** robot kodunu yarıda kesmez, loop turunun bitmesini bekler. Loop takılırsa **Stop** gecikir. Robotu anında durdurman gerekirse **Emergency Stop**'a ya da <kbd>Space</kbd>'e bas. <kbd>Space</kbd> her sekmede ve sayı kutusuna yazarken de çalışır; yalnız bir açılır liste seçiliyken çalışmaz.

Robot bir komutu reddederse (ör. robot çalışırken mod değiştirmek) **Logs** > **Event Log**'a "Komut reddedildi" ya da "Mod değişmedi" diye başlayan bir satır düşer: [Geçersiz evrede komut](sorunlar.md#pb-e409).

<a id="joystick-karti"></a>

### System Status {#system-status}

Üç ışık, bağlantının, robot kodunun ve kumandanın durumunu gösterir. Yeşil iyi, sarı dikkat, kırmızı sorun demektir.

| Ad | Yazılar | İlgili görev |
|---|---|---|
| **Comms** | "Linked": robottan veri geliyor. "Degraded": 3 saniyedir veri yok. "Down": 6 saniyedir veri yok. | [Bağlantı koparsa](#baglanti-koparsa) |
| **Robot Code** | "Ready": robot duruyor. "Init": **Init** yapıldı. "Running": otonom ya da teleop çalışıyor. "Waiting": otonom bitti, **Init** bekleniyor. "Stalled": bir loop turu takıldı. "E-Stop": acil durdurma yapıldı. | [Durum LED'ini kullan](led-durumu.md) |
| **Joystick** | Kullanılan kumanda kaynağı: "Gamepad", "Klavye" ya da "Dokunmatik". Kaynak yoksa "None". | [Kumandayı bağla](ilk-10-dakika.md#kumandayi-bagla) |

### Battery {#battery}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Gösterge | Batarya gerilimi, volt. Son 8 saniyenin ortalamasıdır. Ölçüm kurulu değilse "--V" ve "Veri yok" yazar. | [Batarya gerilimini ölç](bataryayi-olc.md#gostergeyi-okumak) |
| Yüzde ve durum | 3 hücreli LiPo için 10,5-12,6 V aralığında doluluk. 11,6 V üstü "Nominal", 11,0 V üstü "Azalıyor", altı "DÜŞÜK" diye başlar. | [Batarya gerilimini ölç](bataryayi-olc.md#gostergeyi-okumak) |

### Signal {#signal}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Sinyal çubukları ve dBm | Robotun bağlı cihazdan aldığı sinyal. | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |
| **Ping** | Sayfanın robota sorup cevap aldığı süre, ms. | |
| **Channel** | Robotun WiFi kanalı. | [Robotun WiFi ayarlarını yap](wifi-ayarla.md) |
| **Clients** | Robotun ağına bağlı cihaz sayısı. | |

### Telemetry {#telemetry}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Telemetry paneli | Kodundaki `probot::print`, `probot::println` ve `probot::printf` yazılarını gösterir. Robot son 256 baytı tutar, eski satırlar düşer. Panel, yazı değiştikçe güncellenir. Kütüphanenin "!!" ile başlayan hata satırları kırmızı görünür. Panel boşken "probot::telemetry::println() çıktısı burada görünür." yazar. | [Telemetry paneline yaz](kumandayi-oku.md#telemetri) |
| **Clear** | Paneldeki yazıyı ekrandan siler. Kod yeni bir şey yazınca panel yeniden dolar. | |
| **Auto-scroll ON** / **Auto-scroll OFF** | Açıkken panel hep en alttaki satırı gösterir. Kapalıyken yukarı kaydırıp eski satırları okuyabilirsin. | |

## Joystick sekmesi {#joystick-sekmesi}

![Joystick sekmesi; Input Source'ta Gamepad Etkin, Klavye Kapalı, Buttons'ta A basılı, Raw Data'da Axis 1: -0.62.](img/core-joystick.png)

Bu sekmede robota hangi kaynağın veri göndereceğini seçersin ve kaynağın ne gönderdiğini görürsün. Değerler kütüphanenin kodda okuduğu değerlerle aynı değildir; ham değerlerdir.

### Input Source {#input-source}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **Gamepad** kartı | USB ya da Bluetooth kumanda. Kumandada bir düğmeye basınca kendiliğinden seçilir. Durumu: "Bağlı değil", "Etkin" ya da "Bağlı (beklemede)" (klavye ya da dokunmatik açıkken). | [Kumandayı bağla](ilk-10-dakika.md#kumandayi-bagla) |
| **Klavye** kartı | Klavyeyi kumanda gibi kullanır. Yalnız bilgisayarda görünür. Kendiliğinden seçilmez; **Etkinleştir**'e basınca açılır, **Devre dışı bırak**'a basınca kapanır. Açıkken bağlı kumandanın yerine geçer. | [Kumandasız sür](kumandayi-oku.md#kumandasiz-sur) |
| **Dokunmatik** kartı | Ekrandaki çubuklarla sürmeyi açar. Yalnız telefonda ve tablette görünür. **Etkinleştir**'e basınca [sürüş ekranı](#surus-ekrani) açılır. **Sürüş ekranı** düğmesi kapattığın sürüş ekranını yeniden açar. | [Kumandasız sür](kumandayi-oku.md#kumandasiz-sur) |

Kaynak değişince ya da kumanda çıkarılınca sayfa robota o anda sıfır değer gönderir; motorlar son komutla kaçmaz.

### Keyboard Map {#keyboard-map}

Yalnız **Klavye** kaynağı açıkken görünür.

| Tuş | Kumandada karşılığı |
|---|---|
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | Sol çubuk |
| <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Sağ çubuk |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> | **A**, **B**, **X**, **Y** |
| <kbd>Q</kbd> <kbd>E</kbd> | **LB**, **RB** |
| <kbd>Space</kbd> | **Emergency Stop**, her zaman |

### Axes, Buttons ve Raw Data {#ham-veri}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **Axes**: **SOL** ve **SAĞ** daireleri | Sol ve sağ çubuğun konumu. Altında ham X ve Y değeri ("+0.00 · -0.62" gibi). | [Çubukları oku](kumandayi-oku.md#cubuklar) |
| **Buttons** | Basılan düğme renkli görünür. Etiketler: A, B, X, Y, LB, RB, LT, RT, Back, Start, L3, R3; sonrakiler P13, P14... | [Düğmeleri oku](kumandayi-oku.md#dugmeler) |
| **Raw Data** kumanda listesi | Bağlı kumandaların adı ve sırası ("... (idx 0)"). İlk görünen kumanda kendiliğinden seçilir. Birden çok kumanda varsa robota gidecek olanı buradan seç. | |
| Kaynak bilgisi | Kaynağın adı, eksen sayısı ve düğme sayısı ("Axes: 4  Buttons: 17" gibi). Kaynak yoksa "Kaynak yok." diye başlar. | [Kumanda eşlemesini değiştir](kumandayi-oku.md#esleme) |
| Eksen satırı | Her eksenin ham değeri ("Axis 1: -0.62"). Tarayıcı çubuğu ileri ittiğinde eksi değer verir; kodda `js.getLeftY()` ileriyi artı okur. | [Çubukları oku](kumandayi-oku.md#cubuklar) |
| Düğme satırı | Basılı düğmelerin adı. Hiçbiri basılı değilse "No buttons pressed". | |

## Logs sekmesi {#logs}

![Logs sekmesi; WiFi Configuration, Network Status, History, Event Log ve ESP32 System bölümleri.](img/core-logs.png)

### WiFi Configuration {#wifi-configuration}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **SSID** | Robotun ağ adı. | [Robotun WiFi ayarlarını yap](wifi-ayarla.md) |
| **Channel** | Kanal ve nereden geldiği: "(macro)" koddan, "(nvs)" karta kayıtlı seçimden, "(auto)" otomatik seçimden. | [Kanalı kod yüklemeden değiştir](wifi-ayarla.md#kanal-degistir) |
| **IP Address** | Robotun adresi, `192.168.4.1`. | |
| **Kanal Değiştir** listesi ve **Uygula** | Seçilen kanala robotu kod yüklemeden geçirir ve kanalı karta kaydeder. Listede önce 1, 6 ve 11 gelir. **Varsayılana dön (açılışta)** kaydı siler; robot yeniden açılınca koddaki kanala döner. Altındaki satır sonucu yazar. | [Kanalı kod yüklemeden değiştir](wifi-ayarla.md#kanal-degistir) |

### Network Status {#network-status}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| **RSSI** | Robotun bağlı cihazdan aldığı sinyal, dBm. | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |
| **Ping** | Sayfanın robota sorup cevap aldığı süre, ms. | |
| **WebSocket** | Sayfayla robot arasındaki canlı kanal: "Connected" ya da "Disconnected". | |
| **Deadline Miss** | "YES": bir loop turu takıldı, robot güvenli bekliyor. "No": sorun yok. | [LED kırmızı yanıp sönüyor](sorunlar.md#pb-e301-deadline-miss-loop-takildi) |
| **Joystick Age** | Robota gelen son kumanda verisinin yaşı, ms. | |
| **Clients** | Robotun ağına bağlı cihaz sayısı. | |
| **Last Disconnect** | Son kopan cihazın WiFi neden kodu ("reason 8" gibi). | [Sinyali ölç](sinyali-iyilestir.md#sinyali-olc) |

### History {#history}

**History · son 2 dk** bölümü son 2 dakikanın üç grafiğini çizer: **Battery**, **RSSI** ve **Ping**. Her grafiğin başlığında son değer yazar. Bağlantının koptuğu anlar grafikte boşluk olarak görünür. Batarya grafiği ortalama almaz; motor kalkışındaki gerilim düşüşünü burada görürsün.

### Event Log {#event-log}

| Ad | Ne yapar | İlgili görev |
|---|---|---|
| Event Log paneli | Driver Station'da olanları saatiyle yazar: komutlar ("Komut: INIT (auto 30s)"), mod seçimi ("Mod: Teleoperated"), aşama değişimleri ("Phase: TeleOp"), kumanda takılıp çıkarılması, bağlantı kopması ve kanal değişimi. Satırın başındaki harf seviyeyi gösterir: I bilgi, W uyarı, E hata. Son 400 satırı tutar. | [Hatalar ve sorun giderme](sorunlar.md) |
| **Clear** | Paneli temizler. | |

Event Log yalnız bu sayfada tutulur. Sayfayı yenilersen boşalır.

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

![Telefonda dikey Dashboard; sekmeler ikinci satırda, Match Phase, Match Control ve System Status alt alta.](img/core-telefon.png)

Telefonu dikey tuttuğunda **Dashboard**'un bölümleri alt alta dizilir: **Match Phase**, **Match Control**, **System Status**, **Battery**, **Signal** ve **Telemetry**. Sekmeler üst şeridin altında ikinci satıra iner. Düğmeler aynıdır.

Telefonu yatay çevirirsen **Dashboard** iki sütuna geçer: solda **Match Phase** ve **Match Control**, sağda göstergeler ve **Telemetry**.

**Joystick** sekmesinde telefonda **Klavye** kartı yoktur, yerine **Dokunmatik** kartı görünür.

## Sürüş ekranı {#surus-ekrani}

Sürüş ekranı, kumandası olmayan sürücünün robotu telefondan sürdüğü tam ekran görünümdür. **Joystick** sekmesinde **Dokunmatik** kartındaki **Etkinleştir**'e basınca açılır.

| Ad | Ne yapar |
|---|---|
| Sol ve sağ çubuk (**SOL**, **SAĞ**) | Ekranın alt köşelerindeki çubuklar. Parmağını sürükle; bırakınca çubuk ortaya döner. |
| **A**, **B**, **X**, **Y** | Kumandanın aynı adlı düğmeleri. |
| Üst bar | Maçın aşaması, maç saati, otonomda kalan süre ("AUTO 12.3s") ve batarya gerilimi. Dar ekranda saat ve batarya gizlenir. |
| **Auto** / **Teleop** | Mod seçimi; **Match Control**'deki mod listesiyle aynı kurala uyar. |
| **Init** | **Match Control**'deki sol düğmenin aynısı: **Init**, **Start**, **Init Teleop** ya da **Init Auto** yazar. |
| **STOP** | **Match Control**'deki **Stop** ile aynı. |
| **E-STOP** | **Emergency Stop** ile aynı. |
| **X** | Sürüş ekranını kapatır ve normal arayüze döner. Dokunmatik kaynak açık kalır; **Sürüş ekranı** düğmesiyle yeniden girersin. |

Telefonu dik tutarsan görünüm 90 derece döner; telefonu yan çevirerek kullan. Destekleyen tarayıcılarda ekran yatay konumda da kilitlenir.

## Bağlantı koparsa {#baglanti-koparsa}

| Ne olur | Ne zaman | Ne yap |
|---|---|---|
| Kumanda değerleri sıfırlanır, motorlar son komutla kaçmaz. | Robota 500 ms kumanda verisi gelmezse | Bağlantıyı kontrol et. |
| **System Status**'ta **Comms** "Degraded" olur. | Sayfaya 3 saniye robottan veri gelmezse | Robota yaklaş, cihazın robotun ağında olduğunu kontrol et. |
| Sayfayı "DISCONNECTED" ve "Trying to reconnect…" yazan bir perde kaplar. Sayfa yeniden bağlanmayı dener. | Sayfaya 6 saniye robottan veri gelmezse | Cihazın hâlâ robotun ağında olduğunu kontrol et. |
| Robot durur; çalışan modun stop fonksiyonu çalışır (varsayılan ayar). | Driver Station 10 saniye tamamen sessiz kalırsa | Yeniden bağlan, modu seç, **Init** ve **Start**'a bas: [Bağlantı koptu, robot durdu](sorunlar.md#pb-e303-baglanti-kopmasi-robot-durduruldu). |
| Sayfayı "EMERGENCY STOPPED" yazan bir perde kaplar; **Reboot Robot** düğmesi görünür. | **Emergency Stop**'tan sonra | **Reboot Robot**'a bas ya da robotu kapatıp aç: ["EMERGENCY STOPPED"](sorunlar.md#pb-e302-emergency-stop-kilidi). |

## Sorun mu var?

- **Sayfa açılmıyor ya da "Another client is already connected." yazıyor:** [Arayüz açılmıyor](sorunlar.md#arayuz-acilmiyor).
- **Kumanda görünmüyor, Gamepad kartında "Bağlı değil" yazıyor:** [Kumanda görünmüyor](sorunlar.md#kumanda-baglanmiyor).
- **Mod listesine basınca seçim değişmiyor:** Robot **Init**'te ya da çalışıyor. Önce **Stop**'a bas.

## Sonraki adım

[Robotun WiFi ayarlarını yap](wifi-ayarla.md): ağ adı, şifre ve kanal.
