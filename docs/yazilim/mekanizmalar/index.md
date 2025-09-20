---
title: Mekanizmalar ve Alt Sistemler
---

# Mekanizmalar ve Alt Sistemler

## Bu Sayfada Ne Anlatıyoruz?
Bu sayfa, şasinin üstüne kuracağınız düzeneklerin (mekanizmalar) ne olduğunu ve onları yöneten yazılım katmanını (alt sistem) kısaca anlatır. Amacımız, “önce neyi kuracağız, sonra nereye geçeceğiz?” sorusuna net bir başlangıç vermek.

## Mekanizmalar ve Alt Sistemler Nelerdir?
Mekanizma, sahada iş yapan mekanik bütündür: `Intake`, `Shooter`, `Gripper`, `Slider (Kızak Kiti)`, `Elevator`, `Taret`, `Kol` gibi. Alt sistem ise bu mekanizmayı yöneten yazılımdır: sürücüyü ve sensörleri okur, güvenlik sınırlarını korur, motora/servoya komut verir. Kısacası mekanik el ile yazılım beyin birlikte çalışır.

## Alt Sistem ve Mekanizma Örnekleri
Kısaca özet geçeceğiz; ayrıntıları ilgili aile sayfalarında adım adım vereceğiz.

### Slider (Kızak Kiti)
Bir motorla uzayıp kısalan bir yapı düşünün. Konumu bilmek için genelde encoder kullanırız; uçlarda küçük bir “sınır anahtarı” (limit switch) olabilir. Alt sistem; bu sensörleri okuyup istediğimiz uzunluğa gitmeyi ve orada kalmayı sağlar.

### Kol (Arm)
Gövdeye bağlı döner bir eklemdir; aşağı‑yukarı bakar. Açı bilgisini okuyup belirli pozisyonlara gitmek ve orada sabit kalmak isteriz. Yerçekimi işi zorlaştırır; yazılımda buna göre güç vermek gerekir.

### Gripper (Tutan/Bırakan)
Uçta objeyi tutup bırakır. Çeneleri bir veya iki servo ile kapatıp açarız; baskıyı abartmadan, güvenli bir kavrama hedefleriz.

Bu üçü bir araya geldiğinde; dönen bir kol, üzerinde uzayıp kısalan bir kızak ve ucunda objeyi tutan bir el gibi çalışır. Şasiyle birlikte düşündüğümüzde, robotun “topla–taşı–yerleştir” akışı ortaya çıkar.

## Sonraki Adımlar
Bu bölümle birlikte robotun üst yapısı planlı şekilde oluşur; her mekanizma kendi alt sistemiyle güvenli sınırlar ve ölçüyle yönetilir. Sonraki adımlarda bu mekanizmalar senkron çalışarak sahada hızlı, tekrarlanabilir akışlar sağlar.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 67%; background: linear-gradient(90deg, #63b332, #63b332)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %67</div>
</div>