# Doküman Yol Haritası ve İstenen Özellikler

## Kısa Vadeli (v0)
- Nav iskeleti ve boş sayfalar (oluşturuldu)
- Tema renkleri (lacivert/beyaz) ve footer düzeni (tamamlandı)
- Prev/Next footer nav (ekli)
- Manuel preview (mkdocs serve)

## Orta Vadeli (v1)
- Sözlük/terim tooltip’leri (hover ile açıklama)
- Görev kartları (Öğrenme hedefleri/Süre/Önkoşul) bileşeni
- Check-list işaretleme (localStorage, sayfa başına kalıcı)
- “Bu sayfa faydalı mı?” geri bildirim (iki buton, Formspree/Google Forms)
- İlgili sayfalar önerisi (basit kural tabanlı)
- Örnek kod bloklarında “kopyala” + küçük log çıktısı örnekleri

## İleri Vadeli (v2)
- Versiyonlama (stable/dev) ve manuel deploy (GitHub Actions + mike)
- Çoklu dil (i18n) altyapısı (tr/en)
- Wokwi veya benzeri simülasyon gömümleri (uygun sayfalarda)
- Mini quiz/öz-değerlendirme (3 soru, client-side)
- Basit chatbot: sayfa içi arama + cevap önerisi (isteğe bağlı)

## Notlar
- “Was this page helpful?” Material’da çekirdek özellik değil; tema override + küçük JS + form servisi ile eklenecek.
- Versiyonlama için öneri: yalnızca `stable` push/tag’lerinde deploy.

---

## SEO ve Yayın Öncesi İyileştirmeler (önceliklendirilmiş)

1) Sosyal kart görseli (OG/Twitter) – Effort: düşük (5–15 dk), Etki: yüksek
   - `docs/assets/social-card.png` gerçek görselle değiştir; paylaşım önizlemeleri iyileşir.

2) Sayfa bazlı meta açıklamalar – Effort: düşük-orta (30–60 dk başlangıç), Etki: yüksek
   - Önemli sayfalara front matter `description:` ekle (Giriş, Yarışma, Strateji vb.).
   - Not: `mkdocs-seo-plugin` aktif; istersen “mkdocs-meta-descriptions-plugin” değerlendirilir (çakışma olmamasına dikkat).

3) robots.txt – Effort: çok düşük (5 dk), Etki: orta
   - `docs/robots.txt` ekle (prod: index, dev: noindex opsiyonel).

4) Favicon – Effort: çok düşük (5 dk), Etki: düşük
   - `docs/assets/favicon.ico` ekle; tarayıcı sekmesi/marka görünürlüğü.

5) İç bağlantı güçlendirme (footer hızlı linkler) – Effort: düşük-orta (15–30 dk), Etki: orta
   - Footer’a “Yarışma, Strateji, Yazılım, SSS, Referans” kısa yolları.

6) Breadcrumbs / gezinme izi – Effort: orta (30–60 dk), Etki: orta
   - Tema destekliyse `navigation.path`; gelişmiş için JSON-LD breadcrumbs (opsiyonel).

7) Lighthouse denetimi (Performans/SEO/Erişilebilirlik) – Effort: orta-yüksek (1–3+ saat), Etki: yüksek
   - LCP/CLS/kontrast/pwa metriklerine hızlı düzeltmeler.

8) Analytics (GA4/Matomo) – Effort: düşük (10–20 dk), Etki: dolaylı
   - Trafik/arama sorguları için; cookie/policy kontrolü.

9) Arama iyileştirmeleri – Effort: düşük (10 dk), Etki: düşük (UX)
   - Material özellikleri (destekliyse): `search.suggest`, `search.highlight`.

10) 404 Override – Effort: düşük-orta (15–30 dk), Etki: dolaylı
   - “Eve dön / Arama” linkleri; çıkış oranını azaltır.

11) Versiyonlama + canonical – Effort: yüksek (2–4+ saat), Etki: yüksek (SEO hijyeni)
   - `mike` ile sürümler; her sürümde canonical/robots stratejisi.

12) PR/Preview Artifact – Effort: düşük (10–20 dk), Etki: süreç
   - Mevcut manual preview iş akışını PR yorumuna linkle (opsiyonel). 