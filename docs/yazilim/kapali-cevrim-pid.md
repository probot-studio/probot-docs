---
title: Kapalı Çevrim (PID)
---

# Kapalı Çevrim (PID)

## Bu Sayfada Ne Anlatıyoruz?
PID’in temel kavramlarına sezgisel bir giriş yapıyor ve sahada işe yarayan kısa ayar (tuning) ritmini özetliyoruz. PIDsiz→PID’li farkı hissetmek için gerekli bağlamı hazırlıyoruz.

## Nedir ve neden gerekli?
Motoru yalnızca “güç ver” mantığıyla sürdüğümüzde ona “10 cm ilerle” ya da “kolu 30°’de tut” diyemeyiz. Gücü sabitlesek bile zemin eğimi, sürtünme ve batarya gerilimi değiştikçe robot farklı davranır. Otonom yazabilmek ve kolları belirli açılara sabitleyebilmek için, bir hedef belirleyip o hedefe göre motor gücünü sürekli ayarlayan bir geri bildirim döngüsüne ihtiyaç duyarız: buna kapalı çevrim denir.

## Bunu nasıl çözebiliriz?
Önce düşünelim: Hedef konuma nasıl oturturuz? Aklımıza gelen ilk fikir genelde şudur: hedeften gerideysek ileri tam güç, geçtiysek geri tam güç verelim. Basit bir eşik mantığı:

```pseudo
if (error > 0)    power = +MAX;   // hedefin gerisindeyiz → ileri
else              power = -MAX;   // hedefi geçtik      → geri
```

Bu yaklaşım kısa sürede ileri‑geri sallanmaya döner. Kütle ve gecikmeler yüzünden hedefi geçersiniz, ters güçle bu kez öteki tarafa taşarsınız; döngü sürer gider. Üstelik tam güç darbeleri enerji harcar, parçaları zorlar ve sürüşü sinirli hissettirir.

Peki ne yapabiliriz? Gücü hedefe olan uzaklığa göre ayarlayabiliriz: uzaksa çok, yakınsa az. Böylece yaklaşırken kendiliğinden yavaşlarız. Bunu aşağıdaki Orantısal (P) bölümünde küçük bir formülle düzenleyip bazı sınırlarla güvenli hâle getireceğiz.

## Orantısal (P)
Hedeften ne kadar uzaktaysak o kadar fazla güç vermek mantıklıdır. Uzakken yüksek güç, yaklaşıyorken daha az güç… Böylece hedefe gelirken yavaşlayıp taşıp geçme ihtimalini azaltırız. Basit bir ifade:

```pseudo
power = clamp(Kp * error, -MAX, +MAX)
```

Bu fikir P (Proportional) denetimin özüdür: anlık hatayı bir çarpanla güç komutuna çeviririz. Yine de tek başına P, bazı durumlarda hedefte küçük bir sapma bırakır; örneğin sürtünme veya ağırlık yüzünden “biraz güç” yetmeyebilir ve hedefe tam oturamazsınız. Orada I devreye girer.

## Geçmiş ve eğilimi hesaba katmak: I ve D
I (Integral) bileşeni, geçmişte biriken küçük hataları toplayarak “biraz daha güç” ekler ve o kalıcı sapmayı kapatır. D (Derivative) bileşeni ise hatanın değişim hızına bakar; hedefe çok hızlı yaklaşırken fren etkisi yaratır, böylece taşıp geçmeyi yumuşatır. Kısacası P “şimdi”yi, I “geçmişi”, D ise “gidişatı” hesaba katar. Bu sayfada matematiğe girmeyeceğiz; amacımız sahadaki hissi anlatmak.

## PID katsayıları neyi ayarlar?
P, I ve D katsayıları; anı, geçmişi ve eğilimi ne kadar ciddiye alacağınızı belirler. Her mekanizma farklıdır: sürtünme, kütle, esneklik ve motor gücü değiştikçe “ne kadar” düzeltmeye ihtiyaç duyduğunuz da değişir. Bu yüzden her alt sistemin PID ayarları farklı olur ve kısa bir uyarlama (tuning) şarttır.

## Pratik PID ayarı (kısa rehber)
!!! note "Önerilen kaynak"
    Practical PID Tuning Guide: [https://tlk-energy.de/blog-en/practical-pid-tuning-guide](https://tlk-energy.de/blog-en/practical-pid-tuning-guide). Buradaki adımları izleyerek yapın; biz yine de kısaca üzerinden geçeceğiz.

Başlangıç: Her şeyi sıfırlayın. Kp=0, Ki=0, Kd=0 ile başlayın. Motor/encoder bağlantısını doğrulayın, arayüzden Init/Start adımlarını uygulayın. Küçük adımlarla ilerleyeceğiz: bir ayarı değiştirin, tepkiyi gözleyin, not alın, sonra güncelleyip tekrar deneyin. Bu döngüyü sistem tutarlı çalışana kadar sürdürün.

Genel gidişat: Motoru bağlayın, başlangıç ayarlarını sıfırdan küçük artışlarla değiştirin, kısa denemeler yaparak sistemin hızını, taşırma davranışını ve hedefte kalma yeteneğini gözleyin. Her denemede tek bir değişkeni oynatıp etkisini görün; böylece hangi katsayının neyi düzelttiğini öğrenirsiniz.

P: Küçük bir değerle başlayın. Kademeli olarak arttırın ve tepkinin hızlandığını gözleyin. İlk belirgin salınımlar göründüğünde çok az geri çekin; hedefe hızlı yaklaşırken taşırmayan, ayakta kararlı bir P değeri bulun.

I: Kalan kalıcı hatayı kapatmak için yavaş yavaş ekleyin. Fazla I salınım ve geç toparlanma getirir; az I ise hedefte küçük bir sapma bırakır. Küçük adımlarla artırıp tam oturduğu yeri bulun.

D: Yaklaşırken “fren” etkisi yaratır, taşıp geçmeyi yumuşatır. Küçük bir değerle başlayın; pürüzsüz bir his elde edene kadar artırın. D gürültüye duyarlı olabilir; yeterli olduğunu hissettiğiniz yerde bırakın.

## Başlangıç koşulları ve küçük hatırlatmalar
Kapalı çevrim için hedefinizi tanımlayacak bir geri bildirim gerekir: hız veya konum ölçmek için encoder en yaygın çözümdür. Kablolama ve yön doğrulaması kritik önemdedir; ayrıntıları elektronik bölümünde ele alacağız. Ayrıca motor yönü ters geliyorsa yazılımdaki invert ayarını kullanın; yanlış yönde çalışan bir döngü kararsızlık yaratır.

## Sonraki Adımlar
PID kavrayışı yerleştiğinde robot, yük ve pil koşulları değişse de hedefe daha tutarlı ulaşır. Devamında şasi ve mekanizmada PID uygulayarak teleop akışını yumuşatır, otonom adımlarını güvenilir hâle getirirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 56%; background: linear-gradient(90deg, #7db929, #7db929)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %56</div>
</div> 