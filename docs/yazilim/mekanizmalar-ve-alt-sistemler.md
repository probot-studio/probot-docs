---
title: Mekanizmalar ve Alt Sistemler
---

# Mekanizmalar ve Alt Sistemler

## Bu sayfada ne yapıyoruz?
Şasi oturduktan sonra oyunu kazandıran detaylara geçiyoruz: al‑bırak mekanizmaları (intake, shooter), kaldırma sistemleri (slider/kol) ve kısa yardımcı hareketler. Amacımız, teleop’ta sürücünün yükünü azaltan ve otonomda kararlı çalışan küçük ama etkili akışlar kurmak.

## Temel yaklaşım
Her mekanizma için önce “ham güç” ile güvenli doğrulama yapılır, ardından kapalı çevrime geçilerek hedefe göre çalışması sağlanır (ör. belirli açı/uzunluk). Bağlantı ve yön doğrulaması elektronik sayfalarında; burada akış ve kullanım örneklerine odaklanacağız.

## Yardımcı hareket (macro) fikri
Sürücüye tek tuşla yapılan kısa akışlar tanımlayacağız: “topu al”, “hedefe hizalan”, “bırak ve çekil” gibi. Teleop’ta oyunu kolaylaştırır, otonomda da bloklar hâlinde tekrar kullanılabilir.

## Güvenlik ve test ritmi
Her eklemeden sonra küçük testler yapın: önce boşta, sonra hafif yükte, en son sahada. Beklenmedik hareketlere karşı her zaman “Stop”a uzanan bir eliniz olsun.

## Shooter (Atıcı)
Sahada işimiz hız ve tekrarlanabilirliktir. Bu bölümde önce “butona basılı tut → motorlar dönsün” fikrini gösterip, neden her atışta farklı sonuç verdiğini konuşacağız (ısınma, besleme süresi, pil durumu). Ardından iki pratik kullanım modelini türeteceğiz: tek tuşla zamanlanmış akış (ör. 3 sn hızlan, sonra besle) ve basılıyken çalış modu. Son aşamada kapalı çevrim hız kontrolü (hedef RPM’e tutunma) fikrini tanıtacağız; böylece her atış benzer hızda çıkar.

## Elevator (Dikey kaldırıcı)
“Yukarı/Aşağı” iki tuşa güç vermek başlangıç için işe yarar; ama mekanizma bırakınca aşağı kayar ve kesin bir yüksekliği tutturmak zordur. Bu bölümde önce bu basit kontrolü deneriz, sonra önceden tanımlı duraklara (alt/orta/üst) tek tuşla gitmeyi, en sonunda da bu yüksekliği PID ile korumayı anlatırız. Mekanik uçlarda limit switch ve yazılımsal sınır (soft limit) ekleme motivasyonunu da hazırlayacağız.

## Slider (Teleskopik kızak)
Slider doğrusal uzar-kısalır. İlk fikir olarak “ileri/geri güç” ile süreriz; sürtünme ve yük değişince konum tutmak zorlaşır. Burada önce basit manuel kontrolü kurup, ardından hedef uzunluklara gitme ve konumu tutma fikrine geçeceğiz. Başlangıçta sıfır noktası bulma (homing), hareket aralığını sınırlama ve aşırı uzamayı engelleme gibi korumaların neden gerekli olduğunu çerçeveleyeceğiz.

## Kol (Arm)
Kollar yerçekimine karşı çalışır; açı büyüdükçe ihtiyaç duyulan kuvvet değişir. “Sabit bir güç ver” yaklaşımı bazı açılarda yetersiz, bazılarında aşırı olur. Bu bölümde önce açı hedefi olmadan sürmeyi görüp, ardından açı hedefiyle (ör. yerden alma, besleme, skorlama) çalışma fikrini ve bir açıda sabit kalma ihtiyacını konuşacağız. PID ile açı tutma ve isteğe bağlı olarak yerçekimi telafisi (feedforward) kavramlarını koddan önce kavratacağız.

## Taret (Turret)
Taret, gövde bağımsız yönlenmek içindir. Elle çevirmek kolaydır ama hedefte sabit kalmak zordur. Bu bölümde önce manuel döndürmeyi kurup neden hassas hedef tutamadığımızı tartışacağız; sonra belli bir açıya dön ve orada kal hedefiyle kapalı çevrime geçmenin mantığını anlatacağız. Güvenlik için dönüş sınırları, kablo bölgelerinden kaçınma ve dönüş hızını sınırlama gibi koruma fikirlerini de hazırlayacağız. İleride görüntü/POV ile otomatik hedefleme fikrine giriş yapacağız.

## Sonraki adım
Bu iskeleti şimdi tek tek gerçek koda çevireceğiz. İlk durak: Shooter ve Elevator; ardından Slider, Kol ve Taret. 