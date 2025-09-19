---
title: İçerik Yazım Rehberi ve Prompt (Dahili)
---

# İçerik Yazım Rehberi ve Prompt (Dahili)

Bu sayfa, bu depoda yazı üretecek yapay zekâ asistanlarına yol göstermek için hazırlandı. Metnin kendisi de bir örnek olacak şekilde, sıcak ve yönlendirici bir dille yazıldı. Hedef kitle, yarışmaya yeni başlayan öğrenciler ve onlara rehberlik eden öğretmenlerdir.

## Amaç ve Okur Zihni
Okur, hızlıca işe koyulmak ve sahada güvenle ilerlemek ister. Metin, öğrencinin sıradaki doğal sorusunu önceden tahmin etmeli ve bir sonraki adıma nazikçe kılavuzluk etmelidir. Önce “neden?”, sonra “nasıl?” anlatılır; gereksiz teknik ayrıntıdan kaçınılır, ama kritik güvenlik ve doğrulama noktaları atlanmaz.

## Başlık Tasarımı
Başlıklar, okurun yolculuğunu yansıtır. Önce büyük çerçeve (ör. “Arayüz”), ardından niyet ve bağlam (“Kapsam ve Platformlar”), sonra uygulama ve akış (“Init / Start Akışı ve Hızlı Test”). Başlıklar tek bakışta “nereye varacağımızı” söyler; okur daha okumadan zihninde bir harita kurar.

## Paragraf Dili
Paragraflar kısa, sıcak ve sahaya dönüktür. Analogiler, kavramı sezdirir; terimi verdiğimizde bir cümlede açıklayıp geçeriz. Listeleri ve okları (→, ->) mecbur kalmadıkça kullanmayız; mümkün olduğunca akıcı paragraflarla ilerleriz. Gereksiz jargon yerine yalın kelimeler seçeriz.

## Bağlantılar ve Kodlar
Ürün/sayfa bağlantıları isimleriyle verilir ve tıklanınca nereye gidileceği anlaşılır. Dosya ve API adları backtick ile gösterilir (örn. `teleopLoop()`, `joystick_api`). Kod blokları, okurun hemen çalıştırabileceği bütünlükte verilir; sadece “değişecek parça” paylaşılmaz.

## Örnekler (Bu Depodan)
Aşağıdaki örnekler, doğru yaklaşımın nasıl göründüğünü gösterir. Metinler bu depoda yer alan sayfalardan uyarlanmıştır.

### Örnek 1: Arayüz açılışı
Doğru: “Arayüz, robotun kumanda paneli gibidir; bir web sayfası üzerinden robota "Init" (hazır ol), "Start" (başla) ve "Stop" (dur) dersiniz, joystick'i bağlayıp canlı veriyi görürsünüz.”

Neden doğru? İlk cümle, analogiyle ne olduğunu sezdirir; daha okumadan okurun zihninde doğru kutu açılır. Teknik ayrıntı yok, ama yetmezlik de yok: üç temel işlemi tek cümlede hatırlatır.

Yanlış: “Arayüz, ESP32 üzerinde çalışan HTTP server ile sağlanır.”

Neden yanlış? Doğru ama okurun bu aşamadaki sorusu bu değil. Okur önce “Bu bana ne sağlar?”ı duymalı.

### Örnek 2: Joystick eşleştirme durumu
Doğru: “Ana sayfa açıldığında joystick durumunu gösteren küçük bir gösterge görürsünüz. Joystick takılı değilse kırmızı renkte ‘not connected’ yazar; kumandayı bağladığınızda gösterge yeşile döner ve ‘connected’ olur. Şimdilik arayüzde eksen/tuş grafikleri yok; canlı değerleri Serial Monitör’de göreceğiz.”

Neden doğru? Gerçeğe tam uygun, beklentiyi doğru kuruyor, okuru kandırmıyor. Kısa, net ve eyleme geçiriyor.

Yanlış: “Ekranda eksen grafiklerini göreceksiniz, hepsini oradan test edin.”

Neden yanlış? Mevcut özellikleri abartıyor; sahada hayal kırıklığı yaratır.

### Örnek 3: Init/Start/Stop akışı
Doğru: “Robot sahaya konur, herkes hazır olduğunda arayüzden ‘Init’e basılır. Hakem ‘Başla’ dediğinde ‘Start’a basılır; otonom kendi kendine çalışır, süre dolunca sistem otomatik olarak teleop’a geçer. ‘Stop’, acil durumda ya da maç bittiğinde robotu güvenle durdurur.”

Neden doğru? Öğrencinin kafasındaki sırayı kurar; kimse ‘şimdi hangi tuşa basacağız?’ diye kalmaz.

## Yapma / Yap
Yap: analogi, sade cümle, kısa doğrulama, bir sonraki adıma kanca.

Yapma: aşırı madde işaretleri, oklar (->), gereksiz jargon, eksik kod parçası, muğlak “muhtemelen”ler.

## Türetme ve İçgörü (Derive & Insight)
Bu dokümanın kalbinde “öğrenciyle birlikte çözümü türetmek” vardır. Önce problemi sahaya taşı, sonra doğal ilk fikirleri dene, neden yetmediğini göster ve çözümü birlikte bul. Böylece öğrenci sadece “ne yapacağını” değil, “neden öyle yaptığını” da öğrenir ve gerektiğinde yeniden türetebilir.

Ritmi şöyle kur:
- Sorun: Gerçek sahada hissedilen dert (kısa, somut). 
- İlk fikir(ler): Naif çözümler; avantajı ve sınırları.
- Çözüm: Neyi koruyup neyi değiştirdiğimizi açıkla; isim ver (ör. ramp, deadband).
- Deneyin: Kısa bir deney/karşılaştırma öner.

Örnek – Merkezde hassasiyet:
- Sorun: Küçük joystick dokunuşları bile robota fazla güç, hassas hizalama zor.
- İlk fikir: Sinyali ikiye böl → merkez hassas, ama tam gazda yarım güç; istemiyoruz.
- Alternatif: Kare (v^2) küçük değerleri güzel küçültür ama işareti kaybeder.
- Çözüm: İşareti koruyan tek dereceden eğri: v^3. Merkez hassas, uçta tam güç. (Daha da yumuşak his için v^5 de olur.)

Bu yaklaşımı her teknik geliştirmede uygula (ramp, deadband, clamp, PID vb.). Başlıkların altına 2–4 kısa paragrafla akışı kur; gerekmiyorsa maddeleme yapma.

## Şablon (Bölüm Yazarken Kullan)
Aşağıdaki şablon, yeni bir sayfayı baştan yazarken izlenecek ritmi verir.

```markdown
# [Bölüm Başlığı]

[1 paragraf] Ne bu? Kime ne kazandırır? (gerekirse analogi)

## [Bağlam/Büyük Resim]
[1 paragraf] Neden bunu yapıyoruz? Sahnede nerede duruyor?

## [Uygulama/Temel Akış]
[1–2 paragraf] Okurun yapacağı şeyler; kısa doğrulama ölçütleri.

## [Kritik Akış veya Güvenlik]
[1 paragraf] Init/Start/Stop gibi kritik akışlar; açık ve emir kipinden kaçınan nazik yönlendirme.

## [Notlar ve Sonraki Adım]
[1 paragraf] Küçük ipuçları; bir sonraki sayfaya doğal geçiş.
```

## AI Prompt (Kopyala/Kullan)
Aşağıdaki prompt, bu depoda yazı üretecek yapay zekâlar için hazırlandı. Aynen kopyalayıp kullanabilirsiniz.

```markdown
You are writing documentation for rookie robotics students and their teachers.
Tone: warm, straightforward, field‑oriented. Use short paragraphs; avoid bullet lists unless strictly necessary. Do not use arrows like "->".
Headings: design them to reflect the learner’s journey (context → action → validation → next step). Start with an analogy when introducing a new UI or concept if helpful.

Rules:
- Explain “why” in one short paragraph before “how”.
- Anticipate the learner’s next question and answer it proactively.
- Prefer concrete, current behavior over hypothetical features.
- Show complete, pasteable code blocks when giving code.
- Use backticks for file/API names; add clear, named links.
- Keep safety and match flow (Init/Start/Stop, autonomous→teleop) precise.
- Minimize jargon; define terms in one sentence when first used.
- Apply Derive & Insight: Problem → naive idea(s) → why not enough → solution → try.
- Avoid unexplained technical terms; replace with plain Turkish or explain briefly (e.g., “hareketli ortalama: birkaç ölçümün ortalaması”).

When rewriting, imitate these examples from our docs:
- UI intro: “Arayüz, robotun kumanda paneli gibidir; … Init/Start/Stop …”
- Joystick status: only red/green “connected / not connected”; no axis graphs yet.
- Match flow: Init → wait → Start → autonomous → automatic teleop → Stop.

Output format:
- Front matter (title), H1, then 4–6 sections with the structure above.
- Use friendly Turkish. Be concise but not terse.
```

## Son Söz
Yazdığınız her paragraf, sahada bir öğrencinin elini tutmalı. Onların ne düşüneceğini ve nereye varmak istediğimizi planlayarak yazın: önce güven, sonra hız ve netlik. Gereksiz hiçbir süs, eksik hiçbir adım. 