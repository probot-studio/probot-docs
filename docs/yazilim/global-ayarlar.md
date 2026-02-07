---
title: Global Ayarlar
---

# Global Ayarlar

## Bu Sayfada Ne Anlatıyoruz?
Probot kütüphanesinin çalışması için gereken temel yapılandırma ayarlarını tek yerde topluyoruz.

## WiFi Parolası ve Ayarları
Sürücü istasyonu ile kartın konuşabilmesi için WiFi erişim noktası ayarlarını kodun başında tanımlarız. Bu tanımlar `#include <probot.h>` satırından **önce** yazılmalıdır.

!!! warning "Takıma özel parola şart"
    Her takım kendi parolasını belirlemelidir. Varsayılan/ortak parola kullanmak karışıklığa ve yanlış eşleşmeye neden olabilir.

```cpp
#define PROBOT_WIFI_AP_SSID     "TakimAdi"
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"  // en az 8 karakter
#define PROBOT_WIFI_AP_CHANNEL  3                               // 1–13 arası

#include <probot.h>
```

| Makro | Zorunlu | Açıklama |
|-------|---------|----------|
| `PROBOT_WIFI_AP_SSID` | Evet | WiFi ağ adı |
| `PROBOT_WIFI_AP_PASSWORD` | Evet | WiFi parolası (min 8 karakter) |
| `PROBOT_WIFI_AP_CHANNEL` | Evet | WiFi kanalı (1–13) |

## Robot Kodunun Son Hali
Aşağıda, WiFi ayarları eklenmiş sade iskeletin son hâli yer alıyor.

```cpp
#define PROBOT_WIFI_AP_SSID     "TakimAdi"
#define PROBOT_WIFI_AP_PASSWORD "TakiminizIcinGuv3nliBirSifre"
#define PROBOT_WIFI_AP_CHANNEL  3

#include <probot.h>

void robotInit() {}
void robotEnd() {}

void autonomousInit() {}
void autonomousLoop() {}
void autonomousEnd() {}

void teleopInit() {}
void teleopLoop() {}
void teleopEnd() {}
```
