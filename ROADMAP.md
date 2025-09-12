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