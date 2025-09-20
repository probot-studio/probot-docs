---
title: Arayüz
---

# Arayüz

## Bu Sayfada Ne Anlatıyoruz?
Web arayüzüyle robotu başlatma/durdurma akışını ve saha kenarı kullanım düzenini özetliyoruz. IP'ye erişim, joystick görünürlüğü ve Init/Start/Stop akışı temel odak.

Arayüz, robotun kumanda paneli gibidir; bir web sayfası üzerinden robota "Init" (hazır ol), "Start" (başla) ve "Stop" (dur) dersiniz, joystick'i bağlayıp canlı veriyi görürsünüz.

## Kapsam ve Platformlar
Arayüz, modern bir internet tarayıcısı çalıştırabilen ve joystick bağlanabilen neredeyse her cihazda çalışır: Windows/macOS/Linux dizüstüler, Chromebook’lar ve USB‑OTG destekli telefon ya da tabletler. Joystick’i USB ile takabilir veya Bluetooth üzerinden eşleyebilirsiniz; önemli olan tarayıcının cihazı görmesidir. Ek yazılım kurmadan, yalnızca robotun Wi‑Fi ağına bağlanıp tarayıcıyı açarak işe başlamak hedefimizdir.

## Yarışma Düzeni (Saha Kenarı Senaryosu)
Maç öncesi küçük bir düzen kurarız. Sürücü, joystick ile saha çizgisinin hemen dışında durur; yanında ya da arkasında, dizüstü veya telefonla arayüzü takip eden ikinci bir kişi bulunur. Bu kişi gerekirse Init/Start/Stop gibi tuşlara basar, şüpheli bir durumda da hızlıca durdurur. Böylece sürücünün dikkati oyunda kalırken, teknik görevler güvenli bir şekilde paylaşılmış olur.

## Ağa Bağlanınca Hangi IP’ye Gidilir?
Robotun Wi‑Fi ağına bağlandıktan sonra tarayıcıya robotun IP adresini yazarsınız ve arayüz açılır. IP adresi, bağlanırken gösterilen bilgi ekranında veya seri monitörde görülebilir. Adres satırına sayı noktalarıyla yazılan kısa bir metin gibidir: örneğin 192.168.4.1. Bu adresi yazıp Enter’a bastığınızda ana sayfa gelir ve joystick ile kontrol akışına geçebilirsiniz.

## IP Adresi Analojisi
IP adresi, robotun bulunduğu sokağın ve kapı numarasının sayılarla yazılmış haline benzer. Yanlış sokağa girerseniz başka birine gidersiniz; doğru sokağı ve kapıyı yazdığınızda ise aradığınız kapıya ulaşırsınız. Tarayıcıya doğru IP’yi yazmak, robotun kapısını çalmak gibidir: içeride arayüz sizi bekler.

## Joystick Eşleştirme (Tarayıcı Üzerinden)
Ana sayfa açıldığında joystick durumunu gösteren küçük bir gösterge görürsünüz. Joystick takılı değilse kırmızı renkte “not connected” yazar; kumandayı bağladığınızda gösterge yeşile döner ve “connected” olur. Şimdilik arayüzde eksen/tuş grafikleri yok; canlı değerleri Serial Monitör’de göreceğiz. Bu aşamada amaç, tarayıcının joystick’i görüp görmediğini hızlıca doğrulamaktır.

## Init / Start Akışı ve Hızlı Test
Maç düzeni şöyle işler: Robot sahaya konur, herkes hazır olduğunda arayüzden “Init” tuşuna basılır. Bu komut, sistemi güvenli bir bekleme konumuna getirir; motorlar hareket etmez, yalnızca her şey yerli yerinde mi diye kontrol ederiz.

Hakem “Başla” dediğinde “Start”a basılır. Artık siz dokunmadan otonom bölüm kendi başına çalışır; süre dolunca sistem otomatik olarak sürücü kontrolüne (teleop) geçer. Bir fazdan diğerine geçmek için yeniden tuşa basmanız gerekmez. Sürücü, kumandayı bıraktığı yerden devam eder.

“Stop”, acil durumda ya da maç bittiğinde robotu güvenle durdurur. Bu tuş, bütün tarafların aynı anda anlaşabileceği tek net komuttur; gerekli anlarda hızlıca kullanın.

Hızlı test için “Init” ve “Start” adımlarından sonra seri ekranda joystick değerlerinin aktığını görürsünüz. Bu görüntü, bağlantının kurulduğunu ve akışın doğru çalıştığını teyit eder.

## Güvenlik ve Sorumluluk Paylaşımı
Saha kenarında net bir sorumluluk paylaşımı işleri kolaylaştırır. Sürücü sadece oyuna odaklanır; ikinci kişi arayüzü izler, gerekirse “Stop” ile müdahale eder ve hakemle iletişimi takip eder. Maçtan önce “kim ne zaman hangi tuşa basacak?” sorusuna birlikte cevap verin; küçük bir konuşma, büyük karışıklıkları önler.

## Notlar ve İpuçları
Arayüz açıkken tarayıcı sekmesini kapatmayın; bağlantı koparsa veriler durur. Gecikme hissederseniz sayfayı yenileyin ve joystick izinlerini tekrar onaylayın. Maç öncesi kısa bir prova yapmak, yarışma stresinde atlanabilecek küçük detayları şimdiden yakalamanızı sağlar.

## İlerleme
<div class="progress progress--warning">
  <div class="progress__track">
    <div class="progress__bar" style="width: 44%; background: linear-gradient(90deg, #fde68a, #f59e0b)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %44</div>
</div> 