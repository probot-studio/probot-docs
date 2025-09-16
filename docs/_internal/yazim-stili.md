---
title: İç Yazım Stili (Dahili)
---

# İç Yazım Stili (Dahili)

Bu sayfa, düzenleyicilere yön vermek içindir. Navigasyonda listelenmez.

## Ton ve Yaklaşım
- Sade ve yönlendirici: "Önce şunu yapın, sonra bunu doğrulayın."
- Öğrenci dostu: Teknik terimi verin, bir cümlede açıklayın.
- Pratik ve sahaya dönük: Neden? bir cümle; ağırlık nasıl/adalım.
- Motivasyon: Küçük zaferler, ilerleme çubukları, kısa başarı adımları.

## Başlık Hiyerarşisi
- Sayfa başlığı: `#` tekil ve açık.
- Alt başlıklar: `##`, alt kırılımlar: `###`.
- Bölüm sonuna "İlerleme" bloğu eklenir.

## Bölüm Kalıbı
- Açılış özeti (1–2 cümle): Bu sayfa ne yaptırır?
- Neden? (opsiyonel, 1 paragraf).
- Adımlar: 3–6 maddelik liste; her adım 1–3 cümle; doğrulama ölçütü ekle.
- Sık hata/çözüm: 2–4 madde (varsa).
- İlerleme bileşeni.

## Dil Kullanımı
- Hitap: siz/ekibiniz; kibar emir: "Açın, seçin, doğrulayın."
- Yabancı terimler: Türkçe + orijinal: "durum makinesi (state machine)".
- Kısa cümleler; gereksiz jargon yok; pasiften kaçının.
- Birimler ve aralıklar: "20 ms", "-1..1", "-1000..1000".

## Biçimlendirme
- Uyarılar: `!!! warning`, ipuçları: `!!! info`/`!!! note`.
- Kod/API adları backtick: `teleopLoop()`, `ClosedLoopMotor`.
- Dosya/klasör adları backtick: `examples/`, `src/probot/...`.

## Kod Parçaları
- Çalışır minimal örnek; üstünde kısa bağlam cümlesi.
- Sadece ilgili satırları gösterin; gerekirse "..." ile kırpın.
- Değişken adları anlamlı; yorumlar "neden"e odaklı.

## Tutarlılık Kuralları
- Joystick tuşları: A, B, X, Y; D‑Pad: Up/Down/Left/Right.
- Varsayılan döngü periyodu: 20 ms.
- Parola makrosu: `PROBOT_SET_DRIVER_STATION_PASSWORD("...")`.
- Eksen aralığı: `-1..1`, PWM: `-1000..1000`.

## Örnek Anlatım Şablonu
- Ne yapacağız? (1 cümle)
- Neden? (1 cümle)
- Adımlar (3–6 madde)
- Doğrulama (1–2 madde)
- Sık sorunlar (2–3 madde) 