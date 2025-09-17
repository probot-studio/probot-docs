---
title: Kapalı Çevrim (PID)
---

# Kapalı Çevrim (PID)

## Nedir ve Neden Gerekli?
Kapalı çevrim, sensörlerden gelen geri bildirimle robota hedefini tutturmayı öğretir. Eğim, sürtünme, batarya gerilimi gibi değişen koşullarda, yalnızca “güç ver” demek yetmez; hedef hız/konum için sürekli düzeltme gerekir.

## PID’i Bir Cümlede
PID, gücü akıllıca ayarlayan bir yardımcıdır: P anlık hatayı düzeltir, I küçük kalıcı hataları temizler, D ise ani değişimleri yumuşatır. Bu sayfada formül yok; sahadaki hissi konuşacağız.

## Ne Beklemeliyim?
Hedef hızda daha tutarlı sürüş, daha kısa duruş mesafeleri ve sürücüden daha az “elle düzeltme”. Robotun davranışı daha öngörülebilir hâle gelir.

## Başlangıç Koşulları
Encoder kablolaması ve yön doğrulaması gereklidir. Detaylı bağlantılar elektronik bölümünde; bu sayfada sadece yazılım akışına odaklanacağız.

## Sonraki Adım
Şasi sayfasında önce PIDsiz, sonra PID’li sürüşü yan yana göreceğiz ve farkı hissedeceğiz. 