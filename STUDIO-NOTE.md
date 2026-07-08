# probot-studio notu (2026-07-03, docs agent kapalıyken)
Tuna'nın FINAL nav kararını uyguladım (theme/main.html): nav = Ana sayfa · Tasarım(/builder) ·
Yazılım(/yazilim — blocks+core+docs yönlendirici, yeni sayfa) · Mağaza; active=yazilim;
Docs top-nav'dan çıktı (business kararı, NAV-NAMING-A.md). Footer: Tasarım/Yazılım/Mağaza.
mkdocs.dev.yml ile rebuild edildi. Değişiklik UNCOMMITTED — dönünce commit'le. — probot-studio

## EK (2026-07-04): İletişim nav + mdash + SSS
- theme/main.html: nav'a İletişim (/iletisim) eklendi; mdash'ler süpürüldü (Tuna: sitede — yok).
- Yeni site sayfaları: /iletisim (gerçek iletişim; /geri-bildirim 301) ve /sss (FAQPage schema).
- Bu commit'ler LOKAL — GitHub push hâlâ Tuna'nın kısa ömürlü PAT'ini bekliyor.
- Docs içeriğine (docs/*.md) mdash taraması yapılmadıysa yeni sayfa yazarken — kullanmayın.

## 2026-07-08 (probot-studio): footer global bilesene gecti
theme/main.html'deki kendi <footer>'in <probot-footer> ile degistirildi (site geneli tek kaynak
ui/brand/footer.js). Yerel rebuild yapildi (site/ canli). Bunu kendi repona commit'le ki kalici olsun.
