---
title: Mimari: Robot Yaşam Döngüsü
---

# Mimari: Robot Yaşam Döngüsü

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
Robotun ömrü sahada farklı fazlara ayrılır. Kart açıldığında bir kez çalışan bir başlangıç noktası vardır (`robotInit`); burada donanımı tanıtır, ilk ayarları yaparsınız. Otonom başlarken bir kez `autonomousInit`, sürücü kontrolüne geçerken bir kez `teleopInit` çağrılır. Her iki fazda da düzenli aralıklarla çalışan birer döngü bulunur (otonom döngüsü, teleop döngüsü); okuma–karar–uygulama burada yürütülür. Maç bittiğinde veya hakem devre dışı bıraktığında `robotEnd` fonksiyonu çalışır

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

## Robot Init Kullanımı
Otonomdan önce yapılacak kurulum, sahadaki davranışın zeminini hazırlar. Şasi (sürüş), kumanda ve sensörler için güvenli varsayılanlar belirleyin; pin yönlerini, ters yön ayarlarını ve hız sınırlarını burada yapın.

```cpp
// Örnek: robot init öncesi tanımlar (temsili)
// Şasi (sürüş) nesnesi
// Chassis chassis;

// Kumanda/kontrol kaynağı
// Controller controller;

void robotInit() {
  // 1) motor/sürücü pinleri ve yönleri
  // 2) şasi için hız sınırları ve ölü bölge ayarları
  // 3) sensör başlatma (encoder, IMU, mesafe)
  // 4) güvenli varsayılanlar: motorlar kapalı, durumlar sıfır
}
```

## Otonom Kullanım
Kod yazarken önce hangi fazda olduğunuzu netleştirin. Otonom bölümünde basit ve güvenilir bir yöntem, zamanı ölçerek adım adım ilerlemektir: belirli sürelerde belirli hareketleri yapar, sonra bir sonraki adıma geçersiniz.

Örneğin: İlk 2 saniye düz sür ve hızlan; ardından 1 saniye dur ve etrafı kontrol et; sonra 1.5 saniye sağa dön ve sonunda tamamen dur. Zaman dolduğunda bir sonraki adıma geçersin; her adımın net bir başlangıç ve bitiş koşulu vardır. Bu anlattığımız akış, aslında basit bir *durum makinesidir*.

İleride süre yerine “ne kadar yol gittik?” ya da “hedefe kaç santim kaldı?” gibi ölçülere dayalı kararlar ekleyerek daha kararlı bir akış elde edebilirsiniz. Süre yerine sensör verilerine dayanarak hareket etmek daha stabildir çünkü robotun ne kadar sürede istenilen hareketi yapacağını etkileyen çok değişken vardır. Mesela robotunuzu okulunuzda doğru sürelerle kodlasanız bile yarışma alanında istenilen sonucu alamayabilirsiniz çünkü sürtünme kuvvetleri farklı olabilir. Bu yüzden *encoder* gibi sensörlerin verisine dayanmayı tercih ediyoruz çünkü bu sensörler bize ne kadar doğru hareket ettiğimize dair bir bilgi de veriyor.

```cpp
// Otonom akış örneği (zaman tabanlı)
static uint32_t autoStartMs;

void autonomousInit() {
  // süre sayaçlarını sıfırla, başlangıç durumu ayarla
  autoStartMs = millis();
  // motor/sensör başlangıç durumları
}

void autonomousLoop() {
  uint32_t t = millis() - autoStartMs;

  // 0–2000 ms: ileri git
  if (t < 2000) {
    // motor komutları: ileri
    return;
  }

  // 2000–3000 ms: dur ve kontrol et
  if (t < 3000) {
    // motor komutları: dur
    // sensörleri kontrol et (mesafe vb.)
    return;
  }

  // 3000–4500 ms: sağa dön
  if (t < 4500) {
    // motor komutları: sağa dön
    return;
  }

  // 4500+ ms: tamamen dur
  // motor komutları: dur
}
```

## Teleop Kullanım
Teleop bölümünde amaç, kumandadan gelen eksen ve butonları robota temiz bir şekilde aktarmaktır. Sürüş için eksenleri ölçeklemek, küçük titreşimleri görmezden gelmek ve butonları net davranışlara bağlamak işleri sadeleştirir. Güvenlik tarafını da unutmayın: bağlantı kesilirse gücü bırakmak ve ani yön değişimlerinde hız sınırları koymak sürücünün işini kolaylaştırır.

```cpp
// Teleop akış örneği (temsili API)
void teleopInit() {
  // kumanda/joystick kaynağını hazırla (eşleme, ölü bölge, mod seçimi)
  // şasi sürüş modunu ayarla (tank veya arcade)
}

void teleopLoop() {
  // 1) kumandadan eksenleri oku (ileri/geri, sağ/sol)
  //    örn: float ileri = ...; float saga = ...;

  // 2) küçük titreşimleri yok say ve ölçekle
  //    örn: ölü bölge uygula, max hız sınırı belirle

  // 3) şasiye komut ver (tank/arcade benzeri)
  //    örn: chassis.tank(sol, sag); veya chassis.arcade(ileri, saga);

  // 4) tek tuş yardımcıları (kısa hazır hareketler)
  //    örn: A tuşuna basınca "hedefe git ve bırak" yordamını başlat
}
```

## Otonom ve Teleopun Kesişimi
İyi bir otonom, teleopta da işinizi kolaylaştırır. Tek tuşla çalışan küçük yardımcılar ekleyebilirsiniz: “hedefe git ve bırak”, “depoya dön ve al”, “hizalan ve bekle” gibi kısa hazır hareketler sürücünün yükünü azaltır ve hatayı düşürür. Bu hazır hareketler, teleop sırasında sık yaptığınız adımların otomatik hâle getirilmiş sürümüdür; robota yolu tarif edersiniz, kalanını kendisi tamamlar. 

Bu yaklaşım oyuna odaklanmanızı sağlar: sürücü sadece doğru anda doğru tuşa basar, robot da güvenli ve tutarlı bir şekilde geri kalanını yapar. Yarışma ilerledikçe bu yardımcıları küçük adımlarla geliştirip daha akıllı hâle getirebilirsiniz.

!!! warning "Not"
    Bu yaklaşım uygulamada zor olabilir. Sahada güvenle çalıştığından emin olmak için adım adım test edin; test etmeden bu tür otomatik hareketleri eklemeniz önerilmez.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 20%"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %20</div>
</div> 