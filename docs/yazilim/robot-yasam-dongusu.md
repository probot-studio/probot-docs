---
title: Robot Yaşam Döngüsü
---

# Robot Yaşam Döngüsü

## Bu Sayfada Ne Anlatıyoruz?
Arduino ve Probot yaşam döngüsünü karşılaştırarak robot kodunun fazlarını (init, autonomous, teleop) açıklıyoruz. Her faz için kısa iskeletler ve kullanım notlarıyla akışı netleştiriyoruz.

## Arduino Yaşam Döngüsü
Klasik Arduino akışı iki parçadan oluşur: `setup()` bir kez çalışır, `loop()` ise durmadan tekrar eder. Kurulumlar, başlangıç mesajları ve pin ayarları `setup()` içine; sürekli tekrar etmesini istediğiniz okuma–karar–uygulama döngüsü de `loop()` içine yazılır.

```cpp
void setup() {
  // bir kez: başlatmalar
}

void loop() {
  // tekrar: oku → karar ver → uygula
}
```
Bizim kütüphanede bu akış daha düzenli hale getirilir; farklı yarışma aşamaları için ayrı giriş ve döngüler kullanılır.

## Probot Yaşam Döngüsü
Robotun ömrü sahada farklı fazlara ayrılır. Kart açıldığında bir kez çalışan bir başlangıç noktası vardır (`robotInit`); burada donanımı tanıtır, ilk ayarları yaparsınız. Otonom başlarken bir kez `autonomousInit`, sürücü kontrolüne geçerken bir kez `teleopInit` çağrılır. Her iki fazda da düzenli aralıklarla çalışan birer döngü bulunur (otonom döngüsü, teleop döngüsü); okuma–karar–uygulama burada yürütülür. Maç bittiğinde veya hakem devre dışı bıraktığında “disabled” fazına düşer ve yalnızca güvenli bekleme yapılır; gün sonunda temizlik için `robotEnd` benzeri bir kapanış noktanız olabilir.

Yarışmada tipik olarak maçın başında kısa bir otonom süresi (örneğin 30 saniye) bulunur. Bu sürede robot kendi kendine hareket eder; süre bittiğinde sürücü kontrolüne geçilir. Süre sınırlarına uymayan davranışlar hakem tarafından devre dışı bırakılabilir. Bu yüzden geçişleri açık ve güvenli kurgulamak kritik önemdedir.

```cpp
// Probot yaşam döngüsü iskeleti
void robotInit() {
  // Robot init tuşuna basıldığında çalışacak temel kodlar
}

void robotEnd() {
  // Robot kapatıldığında temizlik için çalışacak kodlar
}


void autonomousInit() {
  // Otonom başlangıcında çalışacak kodlar
}

void autonomousLoop() {
  // Otonom döngüsünde devamlı çalışacak kodlar
}


void teleopInit() {
  // Teleop başlangıcında çalışacak kodlar
}

void teleopLoop() {
  // Teleop döngüsünde devamlı çalışacak kodlar
}
```

## Otonom Kullanım
Kod yazarken önce hangi fazda olduğunuzu netleştirin. Otonom bölümünde basit ve güvenilir bir yöntem, zamanı ölçerek adım adım ilerlemektir: belirli sürelerde belirli hareketleri yapar, sonra bir sonraki adıma geçersiniz.

Örneğin: İlk 2 saniye düz sür ve hızlan; ardından 1 saniye dur ve etrafı kontrol et; sonra 1.5 saniye sağa dön ve sonunda tamamen dur. Zaman dolduğunda bir sonraki adıma geçersin; her adımın net bir başlangıç ve bitiş koşulu vardır. Bu anlattığımız akış, aslında basit bir *durum makinesidir*.

İleride süre yerine “ne kadar yol gittik?” ya da “hedefe kaç santim kaldı?” gibi ölçülere dayalı kararlar ekleyerek daha kararlı bir akış elde edebilirsiniz. Süre yerine sensör verilerine dayanarak hareket etmek daha stabildir çünkü robotun ne kadar sürede istenilen hareketi yapacağını etkileyen çok değişken vardır. Mesela robotunuzu okulunuzda doğru sürelerle kodlasanız bile yarışma alanında istenilen sonucu alamayabilirsiniz çünkü sürtünme kuvvetleri farklı olabilir. Bu yüzden *encoder* gibi sensörlerin verisine dayanmayı tercih ediyoruz çünkü bu sensörler bize ne kadar doğru hareket ettiğimize dair bir bilgi de veriyor.

Teleop bölümünde amaç, kumandadan gelen eksen ve butonları robota temiz bir şekilde aktarmaktır. Sürüş için eksenleri ölçeklemek, küçük titreşimleri görmezden gelmek ve butonları net davranışlara bağlamak işleri sadeleştirir. Güvenlik tarafını da unutmayın: bağlantı kesilirse gücü bırakmak ve ani yön değişimlerinde hız sınırları koymak sürücünün işini kolaylaştırır.

## Otonom ve Teleopun Kesişimi
İyi bir otonom, teleopta da işinizi kolaylaştırır. Tek tuşla çalışan küçük yardımcılar ekleyebilirsiniz: “hedefe git ve bırak”, “depoya dön ve al”, “hizalan ve bekle” gibi kısa hazır hareketler sürücünün yükünü azaltır ve hatayı düşürür. Bu hazır hareketler, teleop sırasında sık yaptığınız adımların otomatik hâle getirilmiş sürümüdür; robota yolu tarif edersiniz, kalanını kendisi tamamlar. 

Bu yaklaşım oyuna odaklanmanızı sağlar: sürücü sadece doğru anda doğru tuşa basar, robot da güvenli ve tutarlı bir şekilde geri kalanını yapar. Yarışma ilerledikçe bu yardımcıları küçük adımlarla geliştirip daha akıllı hâle getirebilirsiniz.

!!! warning "Not"
    Bu yaklaşım uygulamada zor olabilir. Sahada güvenle çalıştığından emin olmak için adım adım test edin; test etmeden bu tür otomatik hareketleri eklemeniz önerilmez.

## Robot Kodunun Son Hali
```cpp
#include <probot.h>

// [Global Ayarlar Bölgesi]

void robotInit() {
  // Kart açıldıktan sonra bir kez çalışır: donanımı tanıt, ilk ayarları yap.
}
void robotEnd() {
  // Gün sonunda/kapatırken bir kez çalışır: güvenli durdurma ve temizlik.
}

void autonomousInit() {
  // Otonom moda geçerken bir kez çalışır: başlangıç koşullarını hazırla.
}
void autonomousLoop() {
  // Otonom fazında periyodik çalışır: sensörleri oku, karar ver, uygula.
}

void teleopInit() {
  // Sürücü kontrolüne (teleop) geçerken bir kez çalışır: girişleri hazırla.
}
void teleopLoop() {
  // Teleop fazında periyodik çalışır: joystick'i oku, komutları uygula.
}
```

## Sonraki Adımlar
Bu yapıyı oturttuktan sonra özellikleri fazlara bölerek geliştirir, riskleri maç geçişlerinde izole edersiniz. Süreç daha öngörülebilir olur; sonraki adımlarda global ayar, girişler ve sürüş daha sorunsuz eklenir.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 22%; background: linear-gradient(90deg, #ccc910, #ccc910)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %22</div>
</div> 