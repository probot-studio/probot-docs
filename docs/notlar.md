---
title: Tuna'nın Yarışma Notları
---

# Tuna'nın Yarışma Notları

Selam. Bu sayfa dokümanın geri kalanına benzemiyor; burada ne kod var ne kural. Sadece ben varım ve bu yarışmalarda gördüklerim.

Baştan söyleyeyim: genel geçer tavsiye vermeyi pek sevmem. Çünkü bir tavsiyenin işe yarayıp yaramaması tamamen takıma bağlı. Bir takıma "tasarımı ciddiye alın, oturun düzgün bir CAD çizin" derken, başka bir takıma "bu kadar mükemmeliyetçi olmayın, CAD'e daha az zaman harcayın, çıkın sahaya bir şeyler deneyin" dememin gerektiği oluyor. Aynı cümle bir takımı toparlar, diğerini batırır.

O yüzden burada size kesin kurallar vermiyorum. Bunun yerine, katıldığım yarışmalar boyunca bizim takımlarda en sık tosladığımız problemleri, bunlardan çıkardığımız dersleri ve bir takımın çalışma sürecinin aşağı yukarı nasıl ilerlediğini anlatıyorum. Amacım kafanızda bir resim oluşturmak; o resmi kendi takımınıza göre siz netleştirirsiniz.

Yani aşağıdakileri birebir uygulamanız gerekmiyor. Ama çoğu takımın aynı duvarlara toslayıp aynı dersleri geç öğrendiğini gördüm; bari siz o duvarları önceden bilin.

Bu yazıyı iki parçaya ayırdım. İlki takımla ilgili: insanlar, kültür, kararlar. İkincisi robotla ilgili: işin teknik gidişatı nasıl ilerlemeli. İkisi de en az diğeri kadar önemli.

---

## Takım

Önce takımdan başlıyorum, çünkü her şeyin temeli o. İyi bir robot kötü bir takımdan çıkmaz; ama iyi bir takım, ortalama imkanlarla bile iş çıkarır.

### Takım ruhu en önemli şey

Bir yarışma takımının sahip olabileceği en değerli şey parçalar ya da bütçe değil; herkesin ortak bir şekilde sorumluluk alıp birlikte ilerlediği o ruh.

Lise takımımda bu inanılmaz iyiydi. Keskin bir hiyerarşi yoktu; bir şeylerden ben sorumluydum ve onları istediğim gibi şekillendirebiliyordum. Bu özgürlük her ortamın sağlayabildiği bir şey değil. Üstüne bir yandan teknik olarak da kendinizi geliştiriyorsunuz, yani hem üretiyor hem öğreniyorsunuz.

Özellikle mentörleriniz sizi biraz serbest bırakıyorsa, içinde bulunduğunuz ortam küçük bir startup gibi olabiliyor. Ben o zamanlar bunu pek göremiyordum ama takım olarak çalışmanın verdiği heyecanın herhangi bir şirkette bulacağımdan fazlası olduğunu seziyordum.

İşte bu yüzden takım ruhu bu sayfadaki her şeyin önünde geliyor; geri kalan her şey bu temel sağlamsa anlam kazanıyor.

Bunun bir parçası da rollere fazla takılmamak. "Ben yazılımcıyım" ya da "ben mekanikçiyim" diye kendinizi bir kutuya koymayın. Robotu kazandırmak için ne gerekiyorsa onu yapın; yazılımcı gelir kablo bağlar, mekanikçi oturur kod okur. Ne kadar çok sorumluluk alıp sonucu sahiplenirseniz takıma o kadar faydanız olur.

### Gerçekçi olun, birkaç şeyi çok iyi yapın

Her takımın insanları, o insanların yetenekleri, ayırabilecekleri zaman ve üretim imkanları farklı. Robot yapmaya başlamadan önce bu imkanları iyi tartıp gerçekçi bir yol seçmek çok kritik.

Gerçekçiliği negatiflikle karıştırmayın. Düzgün bir robot yapmak kolay iş değil ve bir lise takımı olarak elinizdeki kaynaklar aslında oldukça az. Durum böyleyken her şeyi aynı anda yapmaya çalışmak yerine birkaç şeyi çok iyi yapmak, yani **odaklanmak** çok önemli. Bu kelimeyi bu yazıda daha çok okuyacaksınız.

Yarışmalarda puan dağılımı da genelde eşit olmuyor. Bir işi çok iyi yapan bir robot, iki işi ortalama yapan bir robottan daha fazla puan topluyor. Dağılıp her şeye az dokunmak yerine en çok puanı getiren işi seçip onu hakkıyla yapmak daha akıllıca.

### Skordan geriye doğru düşünün

FRC gibi yarışmalarda rekabet çok yüksek olduğu için strateji çok daha fazla önem taşıyor. MEB'in yarışmasındaki robotlar henüz o kadar olgunlaşmadığı için şu an çok strateji yapmadan da başarı elde etmeniz mümkün. Yine de mantığı baştan kurmak ileride işinize yarar.

Robot üzerinde verdiğiniz her karar, yarışmada topladığınız puana etkisi kadar önemli. Burada skordan geriye doğru gitmek işe yarıyor; bunu backpropagation gibi düşünmek bana karar vermede yardımcı oluyor. Önce oyunda puanı nasıl topladığınıza bakın, sonra o puanı en çok artıran kararları geriye doğru çözün.

Mesela 2026 FRC sezonuna bakınca robotu doğrudan yapmaya başlamak yerine önce şunları sormak çok şey kazandırıyor: robot topu alıp atabileceği yere ne kadar sürede gidiyor? Atması ne kadar sürüyor? Kaç top toplayabiliyor, ne kadar süre atabiliyor? Oyun stratejisini önce kurup robotu ona göre şekillendirmek, sizi sezon ortasında robotu baştan yapmaktan kurtarır.

Bu tahminlerin kesin olması gerekmiyor, kabaca doğru olması yeter. Fermi tahmini (büyüklük mertebesi tahmini) tam bu işe yarar: elinizde veri yokken makul varsayımlarla bir sayıya ulaşırsınız. Robotların saha içindeki hızlarını tahmin etmek için "Robot in 3 Days" (RI3D) videolarını takip edin; takımların üç günde çalışan robot çıkardığı bu videolar, gerçekçi tur ve hareket sürelerine dair iyi bir fikir verir.

Bir de şu var: tüm ekibinizi robot yapımına yönlendirip diğer takımlarla strateji konuşmayı ve scouting'i tamamen ihmal ederseniz, aralarındaki ilişkiler iyi olan takımlar anlaşıp sizi geçebilir. Çok sık yaşanan bir şey değil ama gerçek: bazen politika ve takımlar arası ilişkiler, robotların topladığı puandan daha belirleyici olabiliyor. İnsanlar sosyal hayvanlar, ve bu işin içinde de sosyal olmanın ağırlığı sandığınızdan fazla.

### Herkes kendi başına karar alabilmeli

Robotta neyin ne kadar önemli olduğunu herkesin bilmesi, herkesin kendi başına karar alabilmesi için çok değerli.

Herkesin karar almayı ve sorumluluk yüklenmeyi sevmesi gerekmiyor; sevenlerin daha yetkili olması normal, hatta gerekli. Ama burada key man riskine dikkat edin. Takım liderlerine ve mentörlere önemli konularda danışmak gerekse de, her şeyin bir iki kişiye bağlı olması takımın hareket hızını çok düşürür. Takım, başındaki insanlar olmasa da yürüyebilecek bir yapıda olmalı. Bir hidra gibi düşünün: bir başı kesilince iki başı çıkmalı. Bu da dönüp dolaşıp en baştaki takım ruhuna bağlanıyor.

### Takım kültürü

Bütün bunların yanında takım içindeki kültür de çok önemli.

Çalışmayıp üstüne başkalarının çalışmasına da engel olan insanları takımda tutmanızı önermem; bu tip insanlar enerjiyi aşağı çeker. Ama bunun tersi de doğru değil: herkesin takıma her şeyini vermesi gerekmiyor.

Buradaki ölçü biraz sübjektif: kişi elinden geleni yapıyor mu? Birinin "eli" ne kadar büyük, bu değişir; kimisinin imkanı azdır ama azına göre çok verir, kimisinin imkanı boldur ama az verir. Bana sorarsanız, az emek harcayıp takım için elinden gelenin arkasında olan biri, mutlak olarak daha çok çalışıp elinden geleni vermeyen birinden çok daha fazla "takımın bir parçası". Mesele harcanan emeğin büyüklüğü değil, kişinin kendi imkanına göre o emeğin gerçekten arkasında olması.

## Robot

Yukarıda anlattığım "bu, kazanmaya ne katıyor?" bakış açısı, mekanik çalışırken de yazılım yazarken de aklınızdan çıkmamalı. Bir özelliğe harcadığınız zaman, o özelliğin oyunda getireceği puanla doğru orantılı olmalı.

Bunu kendim için söylüyorum: oyunda neredeyse hiçbir şeyi değiştirmeyecek bir detaya saatlerce takıldığım çok oldu. Bazı işler diğerlerinden daha zevkli ve insan kolayca detaya kapılıyor. Bir şeye başlamadan önce "bu gerçekten skorumu artırıyor mu, yoksa sadece hoşuma mı gidiyor?" diye sormak çok şey kazandırıyor.

### Önce köprüyü kurun

Robotu bir köprü gibi düşünün. Amaç karşıya geçmek. Köprünün tamamlanmamış olması, ilk bloğunuzun mükemmel olmamasından çok daha büyük bir problem. Önce köprüyü karşıdan karşıya bağlayın, sonra zayıf noktaları güçlendirin. Mühendisler optimize etmeye yatkın olduğu için ilk bloğu cilalamaya zaman harcanıyor; oysa tamamlanmamış bir köprüde optimizasyonun değeri sıfır.

> *"Premature optimization is the root of all evil."* (Donald Knuth)

En basit çalışan robotu erkenden çıkarmanın asıl sebebi de bu: bir an önce bitirmek, bir an önce iterasyona başlamak demek. Robotun kalitesini belirleyen şey de iterasyon.

### İterasyonla büyütün

İterasyon kısaca adım adım ilerlemek: küçük bir şey ekleyin, test edin, değiştirin, tekrar test edin. Bu döngüyü ne kadar çok dönerseniz robot o kadar iyi olur. Tek seferde mükemmel çıkan robot yok; iyi robotlar çok kez baştan denenmiş robotlar.

Adım adım gitmenin iki büyük getirisi var. Birincisi, her adımda sizi neyin kısıtladığını net görürsünüz; yani neye odaklanmanız gerektiğini robot size kendi söyler. İkincisi, hata ayıklamaya neredeyse hiç zaman harcamazsınız: önceki her adımdan emin olduğunuz için, bir şey bozulduğunda sebep neredeyse her zaman en son eklediğiniz parça olur.

Karmaşık bir sistemi çok sayıda adımı aynı anda atarak kuramazsınız; öyle yaparsanız hata çıktığında nereden geldiğini bulmak imkansızlaşır. Bu yüzden robot bir sarmaşık gibi büyümeli: sağlam olana tutunarak, parça parça. Sürüş temeli oturmuşsa mekanizmalar üstüne biner, mekanizmalar çalışıyorsa otonom onların üstüne. Kök olmadan dal olmaz.

> *"Çalışan karmaşık bir sistem, çalışan basit bir sistemden evrilmiştir. Sıfırdan karmaşık tasarlanan sistem hiçbir zaman çalışmaz."* (Gall Yasası)

Kendi hatamızdan örnek: biz "robotu çok iyi yapacağız" diye sarmaşık gibi gitmedik, her şeyi en baştan büyük kurmaya çalıştık. Robot defalarca asimetrik çıktı, mekanik anca son anda bitti, yazılımın stabilizasyona zamanı kalmadı ve robot stabil çalışmadı. "Yarışma esnasındaki skor" fonksiyonumuza bakınca işin mantıksızlığı ortada: uğruna kaliteyi kovaladığımız yöntem tam da kaliteyi öldürdü. Üstelik erken çıkan basit bir robot, yazılım ekibinin üretim bitmeden çalışmaya başlamasını da sağlar; yoksa yazılım hep en sona kalıyor.

Aynı sebeple AI'a tüm robotu tek seferde yazdırıp körü körüne güvenmeyin. AI inanılmaz kod yazıyor ama sizin robotunuzu görmüyor; üstelik çok kod yazdığı için sistemler hızla karmaşıklaşıyor ve hatayı görmek zorlaşıyor. Parça parça ilerleyin: "sadece sürüşü yaz", çalıştır, test et; sonra "şimdi konveyörü ekle".

### Constraint'e odaklanın

İterasyon her adımda **constraint'inizi** gösterir: robotu o an geri tutan tek sistem. Tüm enerji oraya gitmeli, çünkü zaten güçlü olan bir şeyi biraz daha iyileştirmenin değeri, en kırılgan halkayı güçlendirmenin yanında çok düşük.

Bunu kişi kişi hesaplayın: her insan için "bu kişiyi nereye koyarsam takım en çok ilerler?" diye sorun. En kritik problem genelde o kadar baskın olur ki, aklınızdakinden daha fazla insanı aynı işe koymak bile mantıklı olur. Ama eklenen her kişinin o probleme marjinal katkısı azalır; bu katkı ikinci en önemli işe kaydırmaya değecek seviyeye inince, kişiyi oraya yönlendirin.

Çoğu takım bunun tersini yapıp dağılır: biri sürüşü kurcalarken başkası önemsiz bir detaya gömülür. Bu dağılmayı fark etmek zor ama sonucu belirleyen en büyük kayıp. Kazanan takımlar çoğu zaman teknik olarak en iyi ekip değil; **odağını** kaybetmeden en kritik problemi en hızlı çözen takım kazanıyor. Bunun için biraz acımasız olmak gerekiyor: öncelikli olmayan bir şey ertelenebilmeli, hatta tamamen bırakılabilmeli.

### Mümkünse kendi atölyenizde üretin

İmkanlarınızı değerlendirin demiştik; üretim bunun en kritik parçası. Üretimi dışarıda yaptırıyorsanız ve yaptıran kişi tanıdığınızsa, size verdiği teslim süresini 2 ile çarpın. Az para veriyorsanız ya da hiç vermiyorsanız 3 ile, hatta daha fazlasıyla. Üretim hattının çıkmasını beklerken robotu yetiştiremediğimiz kaç sefer oldu anlatamam.

İşte bu yüzden in-house üretimin, yani kendi atölyenizde üretmenin önemi katlanarak artıyor. Sadece üretim süresi kısaldığı için değil: asıl kazanç, robot üzerinde yapabileceğiniz iterasyon sayısının artması. Bir parçayı aynı gün kesip aynı gün deneyebiliyorsanız, bir hafta beklemek zorunda olan takımdan çok daha hızlı öğreniyorsunuz.

### Robotu subsystem'lara bölün

Robotu bağımsız parçalara (sürüş, kol, slider, gripper) bölmek sadece yazılımı kolaylaştırmak için değil. Aynı zamanda mekaniğin tasarım yükünü insanlar arasında dağıtmanızı sağlıyor: biri şasiyle uğraşırken bir başkası kolu tasarlayabiliyor, kimse kimseyi beklemiyor. Net sınırları olan parçalar hem paralel çalışmayı hem de bağımsız test etmeyi mümkün kılıyor; iterasyon döngüsü her parça için ayrı ayrı, hızlıca dönüyor.

### Hatayı bulmanın prensipleri

Bir hatanın çözümünü zaten biliyorsanız oturun düzeltin, mesele yok. Ama çoğu zaman asıl iş hatayı bulmakta; çözebilmek için önce nereden kaynaklandığını tespit etmeniz gerekiyor. Adım adım ilerlediğinizde bu nadiren dert olur, çünkü sebep genelde son eklediğiniz parça olur. Yine de büyük bir sistemde bir hata çıktığında prensipler hep aynı.

Problemi daraltın: nereden kaynaklanabileceğine dair hipotezler atın ve her birini olabildiğince hızlı test edin. Mesela shooter yeterince hızlı dönmüyor ve iki motoru var. Neden olabilir? Yazılım tam hız vermiyor olabilir, kontrol algoritmasından olabilir, bir motor arızalı olabilir. Bir motoru sökün, shooter hızı aynı mı kalıyor bakın; sonra diğerini deneyin. Kaynağı bulana kadar ihtimalleri tek tek eleyin, ve bulduğunuzda problemin başka bir şeyden kaynaklanmadığına da emin olun.

Kaynağı bulmak iki şeyi birden çözer: gelecekte aynı hatayı yapma ihtimalini düşürür ve "acaba neydi" belirsizliğini ortadan kaldırır. Bu tarz belirsizlikler takım içinde gereksiz atışmalara da yol açabiliyor; net bir kök sebep bunları kapatır.

### Karar alındıysa uygulandığından emin olun

Takım içinde bir karar alındıysa, o kararın gerçekten uygulandığına emin olun. Bir şeyin sessizce unutulduğunu görüyorsanız ya da yanlış yapıldığını düşünüyorsanız öyle yapılmasına izin vermeyin. Kararı kimin ve neden aldığını herkes bilmeli.

Takım başıboş hareket eder konumda olmamalı. Her zaman bir paralı asker gibi: hedefe odaklı, hızlı ve net. Bu, daha önce konuştuğumuz takım ruhu ve herkesin kendi başına karar alabilmesiyle birleşince ortaya gerçekten hızlı hareket eden bir takım çıkıyor.

### Elon'un algoritmasından birkaç parça

Elon Musk'ın bir tasarım algoritması var. Tamamı sürekli, seri üretim için düşünülmüş; yarışma robotu tek seferlik bir iş olduğu için bazı adımları (döngüyü hızlandırma, otomasyon) bizde pek karşılık bulmuyor. Ama baştaki birkaç adım tam bize göre:

1. **Her gereksinimi sorgulayın.** "Bu parça neden var?" diye sorun. En tehlikeli gereksinimler, akıllı birinden geldiği için sorgulamadan kabul ettikleriniz. Her gereksinimin arkasında bir departman değil, bir isim olmalı.
2. **Silin, silin, silin.** Çıkarabileceğiniz her parçayı ve adımı çıkarın. Sonradan bir kısmını geri eklemeniz gerekebilir, ama sildiklerinizin en az %10'unu geri eklemiyorsanız yeterince silmemişsiniz demektir. Sadeleştirmenin en sert hali zaten silmek; o yüzden ayrı bir "sadeleştir" adımı koymuyorum.
3. **İtere edin.** Kalanı test edin, değiştirin, tekrar test edin. Yukarıda anlattığım iterasyon döngüsü, bu algoritmanın da en doğal devamı.

Özü şu: bir şeyi iyileştirmeden önce, o şeyin gerçekten var olması gerektiğine emin olun. Yarışma robotunda karşılığı en baştaki cümle: en çok puanı getiren işe **odaklanın**, gerisini silin.
