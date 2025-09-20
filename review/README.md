# Review Pipeline

Bu klasör, `docs/yazilim/` altındaki sayfaları GPT-5 High Thinking ile otomatik olarak puanlamak için gerekli prompt ve scriptleri içerir.

## Dosyalar
- `metrics.yaml`: Metrik tanımları, ağırlıklar ve prompt sürümü.
- `prompts/system.md`: Modele verilen sabit rol ve çıktı sözleşmesi.
- `prompts/user_template.md`: Çalıştırma sırasında dosya içerikleriyle doldurulan kullanıcı promptu.
- `run_review.py`: Tüm sayfaları okuyup API’yi çağıran Python betiği.
- `logs/`: Her çalıştırma sonrası oluşturulan tarih/saat damgalı JSON yanıtları.

## Kullanım
```bash
python review/run_review.py --print --dry-run   # Promptu gör, API çağrısı yapma
python review/run_review.py                    # Gerçek çalıştırma, log oluşturur
```

Varsayılan olarak betik `docs/yazilim/*.md` dosyalarının tamamını aynı çağrıda modele gönderir. Yanıt, modeli tarafından üretilen JSON ve reasoning alanlarını içeren bir log dosyasına kaydedilir.

API anahtarını `OPENAI_API_KEY` ortam değişkeniyle sağlamayı unutmayın.
