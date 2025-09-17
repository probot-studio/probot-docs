---
title: Mekanizmalar ve Yardımcı Hareketler
---

# Mekanizmalar ve Yardımcı Hareketler

## Bu sayfada ne yapıyoruz?
Şasi oturduktan sonra oyunu kazandıran detaylara geçiyoruz: al‑bırak mekanizmaları (intake, shooter), kaldırma sistemleri (slider/kol) ve kısa yardımcı hareketler. Amacımız, teleop’ta sürücünün yükünü azaltan ve otonomda kararlı çalışan küçük ama etkili akışlar kurmak.

## Temel yaklaşım
Her mekanizma için önce “ham güç” ile güvenli doğrulama yapılır, ardından kapalı çevrime geçilerek hedefe göre çalışması sağlanır (ör. belirli açı/uzunluk). Bağlantı ve yön doğrulaması elektronik sayfalarında; burada akış ve kullanım örneklerine odaklanacağız.

## Yardımcı hareket (macro) fikri
Sürücüye tek tuşla yapılan kısa akışlar tanımlayacağız: “topu al”, “hedefe hizalan”, “bırak ve çekil” gibi. Teleop’ta oyunu kolaylaştırır, otonomda da bloklar hâlinde tekrar kullanılabilir.

## Güvenlik ve test ritmi
Her eklemeden sonra küçük testler yapın: önce boşta, sonra hafif yükte, en son sahada. Beklenmedik hareketlere karşı her zaman “Stop”a uzanan bir eliniz olsun.

## Sonraki adım
Önce intake/shooter örnekleriyle başlayıp ardından slider/kol gibi konum kontrolü gerektiren mekanizmalara geçeceğiz. 