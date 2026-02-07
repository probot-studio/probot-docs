---
title: Otonom Başlangıç
---

# Otonom Başlangıç

## Bu Sayfada Ne Anlatıyoruz?
Otonomun temellerine giriş yapıyor ve bilmeniz gereken temel konseptlere değiniyoruz. İlk 30 saniyelik akışı sağlam kurmak için kısa adımlar ve geçişleri özetliyoruz.

> Not: Otonomu gerçekten düzgün yapmak istiyorsanız, saha benzeri bir çalışma alanı kurun. Basit bant çizgileri, birkaç hedef maketi ve duvar aralıkları bile planı gerçekçi test etmenizi sağlar.

- Zemin: bantla başlangıç çizgisi ve 1–2 referans çizgi
- Hedef: karton/3B maket; gerçek yüksekliğe yakın
- Duvar/koridor: 2 tahta/straforla dar geçit

## Neden Otonom?
Maçın ilk 30 saniyesinde sürücü yoktur; robot kendi kendine iş yapmak zorundadır. Oyunu kazanmak için bu kısa sürede olabildiğince puan toplamak kritik önemdedir: "alandan çık – obje al – hedefe bırak" gibi net adımları önceden yazarsınız ve her maçta aynı sonuçları alırsınız. İyi bir otonom, basit ama etkili adımlarla ilk puanları garanti eder ve teleop'a sizi önde başlatır.

## Genel Planlama (Robotunuza Göre)
30 saniyeyi düz bir şerit gibi hayal edin: nereden başlıyoruz, nereye gideceğiz, hangi objeyi alıp nereye bırakacağız? Önce bu resim netleşsin; sonra onu kısa, yazılabilir adımlara böleceğiz.

### Mod Tasarımı (Başlangıç Konumlarına Göre)
2–3 otonom modu hazırlayın (ör. sol başlama, orta başlama, sağ başlama). Her mod için plan adımlarını ayrı ayrı uygulayın ve test edin; maçta seçim ekranından hızlıca değiştirilebilir olsun.

### Başlangıç konumu ve yön
Sahayı gözünüzde canlandırın: robotunuzu yerleştirdiğiniz nokta, ilk göreceği hedef ve boş alanlar. Hakem çizgileri ve duvar aralıklarına bakın; robotun ilk bakış yönünü seçin. İlk hamlede en az manevra gerektirecek açı, genelde en güvenlisidir.

### Hedef listesi (puan–mesafe–risk)
Puan getiren işleri bir tablo gibi düşünün: her hedef için "puan, uzaklık, risk" yazın. Önce en kısa ve temiz puanı alın; sonra taşıma ve hizalama isteyen hedeflere geçin.

### Güzergah (boşluk payı ve duraklar)
Haritada köşe dönüşlerini geniş yapın; duvarı sıyırmak yerine boşluk bırakın. Kısa duraklar planlayın: yaklaş, kısa dur, hizalan, devam et.

### Zaman bütçesi
Süreyi önceden paylaştırın (ör. 10 sn çıkış, 5 sn alma, 10 sn bırakma) ve 3–5 sn tampon ayırın. Adım süresi dolarsa oyalanmayın: güvenle kapatıp bir sonrakine geçin.

## Durum Makinesi: Nedir, Neden Kullanırız?
Durum makinesi, bir işi küçük adımlara bölen basit bir düşünme biçimidir. Her adım "başla" ve "bitir" koşullarıyla tanımlıdır; bittiğinde sıradaki adıma geçersiniz. Otonomda işimize yarar çünkü 30 saniyeyi anlaşılır parçalara ayırır.

Bu sadece bir yöntemdir; kullanmak zorunda değilsiniz. Ancak durum makinesi, planı sahada anlatmayı ve hatayı bulmayı kolaylaştırır: hangi adımın çalıştığını, hangisinin takıldığını anında görürsünüz.

### Örnek akışlar (kavramsal)
- Çık–Bırak: 80 cm ileri → 30° sağa dön → hazır objeyi bırak.
- Çık–Al–Bırak: 60 cm ileri → intake aç + 40 cm ileri → hedefe dön → bırak.

### Sözde kod (mantık)
Aşağıdaki sözde kod, mantığı gösterir; derlenebilir bir örnek değildir.

```text
state = EXIT_ZONE
startTimer()

loop {
  if (state == EXIT_ZONE && distanceReached(80)) {
    state = TURN; resetTimer()
  } else if (state == TURN && angleReached(30)) {
    state = DROP; resetTimer()
  } else if (state == DROP && timePassed(1000)) {
    state = DONE
  }

  if (timeout(5000)) { goSafeNextState() }
}
```

### Zaman tabanlı örnek (kısa)
Aşağıdaki örnek, süre tabanlı bitiş koşulları kullanan basit bir otonom akışı gösterir. Motor sürme komutlarını kendi donanımınıza göre doldurun.

```cpp
void autonomousLoop() {
  static enum { EXIT_ZONE, TURN, DONE } st = EXIT_ZONE;
  static uint32_t t0 = millis();

  switch (st) {
    case EXIT_ZONE:
      // İleri sür (motor komutlarınızı buraya yazın)
      if (millis() - t0 > 2000) { st = TURN; t0 = millis(); }
      break;
    case TURN:
      // Dön (motor komutlarınızı buraya yazın)
      if (millis() - t0 > 1000) { st = DONE; }
      break;
    default:
      // DONE: motorları durdur
      break;
  }
}
```

Nasıl başlarız? Kâğıda 3–5 kutu çizip oklarla bağlayın; her ok için mesafe/açı ve geçiş koşulunu yazın.

Zaman aşımı ve kurtarma: Her adım için maksimum süre tanımlayın (örn. 5 sn). Süre aşılırsa güvenli duruma geçin veya sıradaki adıma atlayın; sahada kilitlenme yaşamazsınız.
