---
title: Giriş
description: Tasarla Geliştir robot yarışmasına yeni başlayan öğrenciler için rehber; yarışma özeti, ilk adımlar, takım ve robot yol haritası.
---

# Giriş

!!! warning "WARNING"
    Bu doküman geliştirme aşamasındadır. Bu sürümün odağı: [Yarışma](yarisma/){ .u .u--slide .u--internal } ve [Yazılım](yazilim/){ .u .u--slide .u--internal }. Diğer bölümler kademeli olarak eklenecektir.


## Bu Doküman Nedir?
Bu rehberi, “nereden başlasak?” sorusuna ilk günden yön veren net bir rota olsun diye hazırladık. Birlikte adım adım ilerleyeceğiz: oyunu inceleyip stratejiyi netleştirir, tasarımları çıkarır, üretimleri yapar, yazılımı yükler ve sahaya çıkmadan önce anlamlı testlerle güveni pekiştiririz. Yol boyunca sadece “nasıl” değil, “neden” sorusuna da kısa, anlaşılır cevaplar veriyoruz.

<b>Probot</b> ise [NFR Products](https://nfrproducts.com){ .u .u--slide .u--external } tarafından geliştirilen ve robot yapım sürecinde sizi hızlandırmak için gerekli araçları, örnekleri ve iyi pratikleri bir araya getiren bir platformdur. [Probot‑lib](https://github.com/tunapro1234/probot-lib){ .u .u--slide .u--external } ise MEB Tasarla Geliştir yarışmasının resmi yazılım kütüphanesidir ve [ESP32‑S3](https://www.ozdisan.com/p/Arduino-Evaluation-Boards-614/boardoza-boardoza-pulse-s32-s3-1473942){ .u .u--slide .u--external } üzerinde çalışmak için tasarlanmıştır. Probot’a dahil diğer projeleri görmek için dokümandaki [Ekstra Araçlar](ekstra-araclar/probot-lib/){ .u .u--slide .u--internal } bölümüne; güncel talepler, hatalar ve yol haritası için de [GitHub Issues](https://github.com/tunapro1234/probot-lib/issues){ .u .u--slide .u--external } sayfasına göz atabilirsiniz.

<br>

## Bu Doküman Ne Değildir?
Kuralları biz yazmıyoruz; sahada düdük de bizde değil. Bu sayfalar, tecrübeyi kısayola çeviren pratik bir yol arkadaşı. Karar mercii ise her zaman resmi [oyun kılavuzu](https://docs.google.com/document/d/1PLTKS3iL0kzOZGYCeuPsYkMkxwMhXy4Tab_f3DnF18g/edit?tab=t.0){ .u .u--slide .u--external } ve hakemlerdir. Bir değişiklik gördüğünüzde önce resmi kılavuzu kontrol edin; sonra bu sayfalara dönün—güncellemeleri kısa sürede yansıtıyoruz.

!!! warning "Önemli not"
    Bu doküman hızlıca gelişiyor ve güncel kuralları ÖZETLER. Her zaman resmi oyun kılavuzunu öncelikle kontrol edin: [İSTANBUL ve SU - OYUN KILAVUZU](https://docs.google.com/document/d/1PLTKS3iL0kzOZGYCeuPsYkMkxwMhXy4Tab_f3DnF18g/edit?tab=t.0)

    
!!! info "Harici Kaynaklar"
    Yarışmayla ilgili diğer bağlantılar ve tamamlayıcı içerikler için [Harici Kaynaklar](referans/harici-kaynaklar/) kısmına göz atabilirsiniz.

<br>

## Size Ne Kazandırır?
Bir robot yarışmasında en değerli şey zamandır. Bu rehber, ekibinizin vaktini “neyi, ne zaman, nasıl yapacağız?” sorusunu aramak yerine üretmeye ayırması için var. Ortak bir dil kurduğunuzda, mekanik bir ölçü ya da yazılımda küçük bir ayar bile bütün takımın hızını artırır.

Okurken fark edeceksiniz: karmaşık işleri küçük, bitebilir parçalara böldük. Önce nefes aldıran ilk başarılar gelir — bir bağlantıyı doğrulamak, ilk sürüşü yapmak, veriyi ekrana düşürmek. Sonra bu küçük zaferler, kısa bir otonom senaryoda birleşir. Her adım sahada işinize yarasın diye net, ağır olmayan ve uygulanabilir tutuldu.

Bir de huzur kısmı var. Teftiş listeleri, güvenli güç dağıtımı ve mimari kontrol noktaları, “acaba”ları azaltır. Maç günü, aklınız puan getiren detaylarda kalır; gerisi yerli yerindedir.

<br>

## Nasıl İlerlemelisiniz?
!!! warning "WARNING"
    Bu doküman geliştirme aşamasındadır. Bu sürümün odağı: [Yarışma](yarisma/){ .u .u--slide .u--internal } ve [Yazılım](yazilim/){ .u .u--slide .u--internal }. Diğer bölümler kademeli olarak eklenecektir.

Önce büyük resmi görerek başlayın: [Yarışma](yarisma/){ .u .u--slide .u--internal }. Hedefler, puanlama ve maç akışı netleştiğinde, atacağınız her adımın neden önemli olduğunu hissedersiniz.

Sonra rolünüze göre yolu kısaltalım. Mekanik için [Mekanik](mekanik/){ .u .u--slide .u--internal }: sağlam şasi, doğru çekiş ve pratik montaj sırları. Elektronik için [Elektronik](elektronik/){ .u .u--slide .u--internal }: güvenli güç, sürücüler, sensörler ve hızlı test. Yazılım için [Yazılım](yazilim/){ .u .u--slide .u--internal }: kurulum, mimari ve ilk otonom adımlar. Öğretmenler ve PR ekipleri ise [Strateji](strateji/){ .u .u--slide .u--internal } bölümünde planı, iletişimi ve jüri beklentilerini bir çerçeveye oturtabilir.

Küçük zaferlerin önüne, kısa bir strateji arası koyun. Bugün 30 dakikanızı [Strateji](strateji/){ .u .u--slide .u--internal } bölümündeki çerçeveyle “oyun hedefleri, görev öncelikleri, roller ve test ritmi”ni not etmeye ayırın. Ardından [Planlama ve Takvim](strateji/planlama-takvim/){ .u .u--slide .u--internal } ile yarın kanıtlayacağınız tek somut hedefi seçin. Net bir plan, ekibin ivmesini hızla yükseltir.

<br>

## İçinde Neler Bulacaksınız?
!!! warning "WARNING"
    Bu doküman geliştirme aşamasındadır. Bu sürümün odağı: [Yarışma](yarisma/){ .u .u--slide .u--internal } ve [Yazılım](yazilim/){ .u .u--slide .u--internal }. Diğer bölümler kademeli olarak eklenecektir.

Elinizde bir rehber değil, bir yol arkadaşınız var. Kurulumdan ilk sürüşe, mimariden kısa otonomlara, hepsi sahada işe yarayan örneklerle anlatıldı. [Mimari ve API](yazilim/mimari-scheduler/){ .u .u--slide .u--internal } bölümü, kodu küçük parçalara ayırarak anlaşılır kılar; [Hata Ayıklama ve Log](yazilim/hata-ayiklama-log/){ .u .u--slide .u--internal } erken sinyalleri yakalamanıza yardım eder. 

Mekanik ve elektronik sayfaları, uzun anlatılar yerine “işi bitiren” özetler sunar: [Mekanik](mekanik/){ .u .u--slide .u--internal }, [Elektronik](elektronik/){ .u .u--slide .u--internal }. Strateji kısmı, ekibin sesini ve ritmini bulmasına yardım eder: [Planlama ve Takvim](strateji/planlama-takvim/){ .u .u--slide .u--internal }, [Risk Yönetimi](strateji/risk-yonetimi/){ .u .u--slide .u--internal }, [PR Ekibi](strateji/ekipler/pr/){ .u .u--slide .u--internal }.

Aradığınız bir tanım mı? [Sözlük](referans/sozluk/){ .u .u--slide .u--internal } imdadınıza yetişir. 

Yol arkadaşlarımız olan araçların bir bölümü hazır, bir bölümü ise hâlâ geliştiriliyor: ayrıntılar için [Ekstra Araçlar](ekstra-araclar/probot-lib/){ .u .u--slide .u--internal } sayfasına bakın. Hangi araca öncelik vereceğimizi siz belirlersiniz; geliştirme gündemini [GitHub Issues](https://github.com/tunapro1234/probot-lib/issues){ .u .u--slide .u--external } üzerinden oylayıp yorum bırakırsanız, ilgili işin tamamlanma hızı artar.

<br>

## Güncellik ve Resmi Kaynaklar
Bu siteyi düzenli olarak güncelliyoruz; yine de ölçüler ve kurallar değişebileceği için sahaya çıkmadan önce resmi kılavuzu mutlaka kontrol edin. Sayfalardaki açıklamalarda son güncelleme bilgisini bulacaksınız.

<br>

<!-- ## Terimler ve Standartlar
Yarışma jargonunu hızlı çözüp ekip içinde aynı dili konuşabilin diye bir sözlük hazırladık. “Bend, sarnıç, su kemeri” gibi oyun terimlerinden yazılımda sık geçen kavramlara kadar hepsini sade bir dille anlattık.

<br> -->

## SSS ve İlgili Sayfalar
Sorular doğaldır; önemli olan, cevaba giden yolu kısaltmaktır. [SSS](sss/){ .u .u--slide .u--internal } bölümünde “Joystick görünmüyor”, “Motor dönmüyor”, “Otonom niye başlamıyor?” gibi en sık yaşanan durumlara kısa, işe yarar yanıtlar bulacaksınız. Takıldığınız yerde sizi doğrudan ilgili sayfaya götüren bağlantılar da orada.

<br>

## Geri Bildirim ve Katkı Notu
Bu rehberi sizinle birlikte büyütüyoruz. Küçük bir düzeltme, başka bir takımın saatlerini kurtarabilir. Düşüncenizi iletin; biz de kısa sürede yansıtalım. Yol haritasını ve açık işleri [GitHub Issues](https://github.com/tunapro1234/probot-lib/issues){ .u .u--slide .u--external } üzerinden takip edebilirsiniz. 
