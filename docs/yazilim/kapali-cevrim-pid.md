---
title: Kapalı Çevrim (PID)
---

# Kapalı Çevrim (PID)

## Bu Sayfada Ne Anlatıyoruz?
PID’in temel kavramlarına sezgisel bir giriş yapıyor ve sahada işe yarayan kısa ayar (tuning) ritmini özetliyoruz. PIDsiz→PID’li farkı hissetmek için gerekli bağlamı hazırlıyoruz.

## Nedir ve neden gerekli?
Motoru yalnızca “güç ver” mantığıyla sürdüğümüzde ona “10 cm ilerle” ya da “kolu 30°’de tut” diyemeyiz. Gücü sabitlesek bile zemin eğimi, sürtünme ve batarya gerilimi değiştikçe robot farklı davranır. Otonom yazabilmek ve kolları belirli açılara sabitleyebilmek için, bir hedef belirleyip o hedefe göre motor gücünü sürekli ayarlayan bir geri bildirim döngüsüne ihtiyaç duyarız: buna kapalı çevrim denir.

## Bunu nasıl çözebiliriz?
Önce düşünelim: Hedef konuma nasıl oturturuz? Aklımıza gelen ilk fikir genelde şudur: hedeften gerideysek ileri tam güç, geçtiysek geri tam güç verelim. Basit bir eşik mantığı:

```pseudo
if (error > 0)    power = +MAX;   // hedefin gerisindeyiz → ileri
else              power = -MAX;   // hedefi geçtik      → geri
```

Bu yaklaşım kısa sürede ileri‑geri sallanmaya döner. Kütle ve gecikmeler yüzünden hedefi geçersiniz, ters güçle bu kez öteki tarafa taşarsınız; döngü sürer gider. Üstelik tam güç darbeleri enerji harcar, parçaları zorlar ve sürüşü sinirli hissettirir.

Peki ne yapabiliriz? Gücü hedefe olan uzaklığa göre ayarlayabiliriz: uzaksa çok, yakınsa az. Böylece yaklaşırken kendiliğinden yavaşlarız. Bunu aşağıdaki Orantısal (P) bölümünde küçük bir formülle düzenleyip bazı sınırlarla güvenli hâle getireceğiz.

## Orantısal (P)
Hedeften ne kadar uzaktaysak o kadar fazla güç vermek mantıklıdır. Uzakken yüksek güç, yaklaşıyorken daha az güç… Böylece hedefe gelirken yavaşlayıp taşıp geçme ihtimalini azaltırız. Basit bir ifade:

```pseudo
power = clamp(Kp * error, -MAX, +MAX)
```

Bu fikir P (Proportional) denetimin özüdür: anlık hatayı bir çarpanla güç komutuna çeviririz. Yine de tek başına P, bazı durumlarda hedefte küçük bir sapma bırakır; örneğin sürtünme veya ağırlık yüzünden “biraz güç” yetmeyebilir ve hedefe tam oturamazsınız. Orada I devreye girer.

## Geçmiş ve eğilimi hesaba katmak: I ve D
I (Integral) bileşeni, geçmişte biriken küçük hataları toplayarak “biraz daha güç” ekler ve o kalıcı sapmayı kapatır. D (Derivative) bileşeni ise hatanın değişim hızına bakar; hedefe çok hızlı yaklaşırken fren etkisi yaratır, böylece taşıp geçmeyi yumuşatır. Kısacası P “şimdi”yi, I “geçmişi”, D ise “gidişatı” hesaba katar. Bu sayfada matematiğe girmeyeceğiz; amacımız sahadaki hissi anlatmak.

## PID katsayıları neyi ayarlar?
P, I ve D katsayıları; anı, geçmişi ve eğilimi ne kadar ciddiye alacağınızı belirler. Her mekanizma farklıdır: sürtünme, kütle, esneklik ve motor gücü değiştikçe “ne kadar” düzeltmeye ihtiyaç duyduğunuz da değişir. Bu yüzden her alt sistemin PID ayarları farklı olur ve kısa bir uyarlama (tuning) şarttır.

## Pratik PID ayarı (kısa rehber)
!!! note "Önerilen kaynak"
    Practical PID Tuning Guide: [https://tlk-energy.de/blog-en/practical-pid-tuning-guide](https://tlk-energy.de/blog-en/practical-pid-tuning-guide). Buradaki adımları izleyerek yapın; biz yine de kısaca üzerinden geçeceğiz.

Başlangıç: Her şeyi sıfırlayın. Kp=0, Ki=0, Kd=0 ile başlayın. Motor/encoder bağlantısını doğrulayın, arayüzden Init/Start adımlarını uygulayın. Küçük adımlarla ilerleyeceğiz: bir ayarı değiştirin, tepkiyi gözleyin, not alın, sonra güncelleyip tekrar deneyin. Bu döngüyü sistem tutarlı çalışana kadar sürdürün.

Genel gidişat: Motoru bağlayın, başlangıç ayarlarını sıfırdan küçük artışlarla değiştirin, kısa denemeler yaparak sistemin hızını, taşırma davranışını ve hedefte kalma yeteneğini gözleyin. Her denemede tek bir değişkeni oynatıp etkisini görün; böylece hangi katsayının neyi düzelttiğini öğrenirsiniz.

P: Küçük bir değerle başlayın. Kademeli olarak arttırın ve tepkinin hızlandığını gözleyin. İlk belirgin salınımlar göründüğünde çok az geri çekin; hedefe hızlı yaklaşırken taşırmayan, ayakta kararlı bir P değeri bulun.

I: Kalan kalıcı hatayı kapatmak için yavaş yavaş ekleyin. Fazla I salınım ve geç toparlanma getirir; az I ise hedefte küçük bir sapma bırakır. Küçük adımlarla artırıp tam oturduğu yeri bulun.

D: Yaklaşırken “fren” etkisi yaratır, taşıp geçmeyi yumuşatır. Küçük bir değerle başlayın; pürüzsüz bir his elde edene kadar artırın. D gürültüye duyarlı olabilir; yeterli olduğunu hissettiğiniz yerde bırakın.

## Canlı PID Deney Alanı
Bu mini simülasyon, tek eklemli bir çubuğu hedef açıda tutarken PID katsayılarının etkisini hızla hissettirir. “Başlat” ile çubuğu bırakın, ardından hedefi 45° ↔ 135° arasında değiştirip Kp/Ki/Kd, güç limiti ve sürtünmeyle oynayın. Hedefe kaç saniyede oturduğunuzu ve ne kadar overshoot yaptığınızı aşağıdaki sayaçlardan takip edebilirsiniz.

<div class="pid-demo" data-title="PID Demo" style="margin:16px 0; padding:16px; border:1px solid #e5e4e2; border-radius:10px; background:#00204d; color:#e5e4e2;">
  <style>
    .pid-demo input[type=range]{ accent-color:#e5e4e2; }
    .pid-demo input[type=number]{ -moz-appearance:textfield; }
    .pid-demo input[type=number]::-webkit-inner-spin-button,
    .pid-demo input[type=number]::-webkit-outer-spin-button{ filter:invert(20%); }
  </style>
  <canvas id="pid-demo-canvas" width="360" height="200" style="max-width:100%; background:#001838; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.35);"></canvas>
  <div class="pid-controls" style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <span style="min-width:72px;">Kp</span>
      <input id="pid-demo-kp-input" type="number" min="0" max="8" step="0.05" value="3.00" style="width:80px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <input id="pid-demo-kp" class="pid-slider" type="range" min="0" max="8" step="0.05" value="3.0" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <span style="min-width:72px;">Ki</span>
      <input id="pid-demo-ki-input" type="number" min="0" max="1.5" step="0.01" value="0.00" style="width:80px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <input id="pid-demo-ki" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.00" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <span style="min-width:72px;">Kd</span>
      <input id="pid-demo-kd-input" type="number" min="0" max="2.5" step="0.01" value="0.25" style="width:80px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <input id="pid-demo-kd" class="pid-slider" type="range" min="0" max="2.5" step="0.01" value="0.25" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <span style="min-width:72px;">Güç Limiti</span>
      <input id="pid-demo-power-input" type="number" min="0.2" max="1.5" step="0.02" value="0.50" style="width:80px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <input id="pid-demo-power" class="pid-slider" type="range" min="0.2" max="1.5" step="0.02" value="0.50" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <span style="min-width:72px;">Sürtünme</span>
      <input id="pid-demo-damping-input" type="number" min="0" max="1.0" step="0.02" value="0.18" style="width:80px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <input id="pid-demo-damping" class="pid-slider" type="range" min="0" max="1.0" step="0.02" value="0.18" style="flex:1;">
    </label>
    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <button id="pid-demo-start" style="padding:6px 14px; border:none; border-radius:6px; background:#e5e4e2; color:#00204d; font-weight:600; cursor:pointer;">Başlat / Sıfırla</button>
      <button id="pid-demo-target" style="padding:6px 14px; border:none; border-radius:6px; background:#e5e4e2; color:#00204d; font-weight:600; cursor:pointer;">Hedef: 45°</button>
    </div>
    <p style="margin:0; color:#e5e4e2; font-size:14px;">Kp hızlı toparlar, Ki kalıcı hatayı kapatır, Kd yaklaşırken fren olur. Güç limiti PWM’i kısar; sürtünme kaydırıcısı sistemi daha sönümlü yapar.</p>
    <div style="margin-top:4px; color:#e5e4e2; font-size:13px; display:flex; flex-direction:column; gap:4px;">
      <span>Hedef değiştikten sonra:</span>
      <span id="pid-demo-settling" style="font-weight:600;">Dengeye gelme süresi: --</span>
      <span id="pid-demo-overshoot" style="font-weight:600;">En büyük overshoot: --</span>
    </div>
  </div>
</div>

<script>
(function(){
  const canvas = document.getElementById('pid-demo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const kpSlider = document.getElementById('pid-demo-kp');
  const kiSlider = document.getElementById('pid-demo-ki');
  const kdSlider = document.getElementById('pid-demo-kd');
  const powerSlider = document.getElementById('pid-demo-power');
  const dampingSlider = document.getElementById('pid-demo-damping');
  const kpInput = document.getElementById('pid-demo-kp-input');
  const kiInput = document.getElementById('pid-demo-ki-input');
  const kdInput = document.getElementById('pid-demo-kd-input');
  const powerInput = document.getElementById('pid-demo-power-input');
  const dampingInput = document.getElementById('pid-demo-damping-input');
  const startBtn = document.getElementById('pid-demo-start');
  const targetBtn = document.getElementById('pid-demo-target');
  const settlingLabel = document.getElementById('pid-demo-settling');
  const overshootLabel = document.getElementById('pid-demo-overshoot');

  let angle = 90;
  let velocity = 0;
  let integral = 0;
  let lastError = 0;
  let running = false;
  let target = 45;

  const dt = 0.02;
  const settleBand = 2.5;
  const settleTime = 0.6;

  let lastTargetSwitch = performance.now() / 1000;
  let maxOvershoot = 0;
  let settled = false;
  let timeWithinBand = 0;

  function fmt(v){ return (Math.round(v * 100) / 100).toFixed(2); }

  function syncDisplay(){
    kpInput.value = fmt(parseFloat(kpSlider.value));
    kiInput.value = fmt(parseFloat(kiSlider.value));
    kdInput.value = fmt(parseFloat(kdSlider.value));
    powerInput.value = fmt(parseFloat(powerSlider.value));
    dampingInput.value = fmt(parseFloat(dampingSlider.value));
  }

  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }

  function bindInput(input, slider, min, max){
    const handler = () => {
      const raw = parseFloat(input.value);
      const value = clamp(isNaN(raw) ? parseFloat(slider.value) : raw, min, max);
      slider.value = value;
      input.value = fmt(value);
      syncDisplay();
    };
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);
  }

  bindInput(kpInput, kpSlider, 0, 8);
  bindInput(kiInput, kiSlider, 0, 1.5);
  bindInput(kdInput, kdSlider, 0, 2.5);
  bindInput(powerInput, powerSlider, 0.2, 1.5);
  bindInput(dampingInput, dampingSlider, 0, 1.0);

  syncDisplay();
  ['input','change'].forEach(evt => {
    kpSlider.addEventListener(evt, syncDisplay);
    kiSlider.addEventListener(evt, syncDisplay);
    kdSlider.addEventListener(evt, syncDisplay);
    powerSlider.addEventListener(evt, syncDisplay);
    dampingSlider.addEventListener(evt, syncDisplay);
  });

  function resetState(){
    angle = 90;
    velocity = 0;
    integral = 0;
    lastError = 0;
    running = true;
    lastTargetSwitch = performance.now() / 1000;
    maxOvershoot = 0;
    settled = false;
    timeWithinBand = 0;
    settlingLabel.textContent = 'Dengeye gelme süresi: --';
    overshootLabel.textContent = 'En büyük overshoot: --';
  }

  startBtn.addEventListener('click', resetState);

  targetBtn.addEventListener('click', () => {
    target = target === 45 ? 135 : 45;
    targetBtn.textContent = 'Hedef: ' + target + '°';
    resetState();
  });

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#001838';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = '#173a70';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height-24, 90, Math.PI, 2*Math.PI);
    ctx.stroke();

    const targetRad = (target - 90) * Math.PI / 180;
    const tx = canvas.width/2 + Math.sin(targetRad) * 90;
    const ty = canvas.height-24 - Math.cos(targetRad) * 90;
    ctx.fillStyle = '#e5e4e2';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, 2*Math.PI);
    ctx.fill();

    const rad = (angle - 90) * Math.PI / 180;
    const x = canvas.width/2 + Math.sin(rad) * 90;
    const y = canvas.height-24 - Math.cos(rad) * 90;
    ctx.strokeStyle = '#e5e4e2';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height-24);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = '#e5e4e2';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Açı: ' + fmt(angle) + '°', 12, 22);
    ctx.fillText('Hedef: ' + target + '°', 12, 42);
  }

  function step(){
    if (!running){ draw(); return; }

    const kp = parseFloat(kpSlider.value);
    const ki = parseFloat(kiSlider.value);
    const kd = parseFloat(kdSlider.value);
    const powerLimit = parseFloat(powerSlider.value);
    const damping = parseFloat(dampingSlider.value);

    const error = target - angle;
    integral += error * dt;
    integral = clamp(integral, -80, 80);
    const derivative = (error - lastError) / dt;

    let control = kp * error + ki * integral + kd * derivative;
    control = clamp(control, -powerLimit, powerLimit);

    velocity += control * dt;
    velocity *= (1 - damping * dt);
    angle += velocity * dt * 60;
    angle += 0.015 * (Math.random() - 0.5);
    angle = clamp(angle, 0, 180);

    const absError = Math.abs(target - angle);
    const elapsed = performance.now() / 1000 - lastTargetSwitch;
    if (!settled){
      if (absError <= settleBand){
        timeWithinBand += dt;
        if (timeWithinBand >= settleTime){
          settled = true;
          settlingLabel.textContent = 'Dengeye gelme süresi: ' + fmt(elapsed) + ' s';
        }
      } else {
        timeWithinBand = 0;
      }
      const overshoot = Math.abs(angle - target);
      if (overshoot > maxOvershoot){
        maxOvershoot = overshoot;
        overshootLabel.textContent = 'En büyük overshoot: ' + fmt(maxOvershoot) + '°';
      }
    }

    lastError = error;
    draw();
  }

  resetState();
  setInterval(step, dt * 1000);
})();
</script>

## Başlangıç koşulları ve küçük hatırlatmalar
Kapalı çevrim için hedefinizi tanımlayacak bir geri bildirim gerekir: hız veya konum ölçmek için encoder en yaygın çözümdür. Kablolama ve yön doğrulaması kritik önemdedir; ayrıntıları elektronik bölümünde ele alacağız. Ayrıca motor yönü ters geliyorsa yazılımdaki invert ayarını kullanın; yanlış yönde çalışan bir döngü kararsızlık yaratır.

## Sonraki Adımlar
PID kavrayışı yerleştiğinde robot, yük ve pil koşulları değişse de hedefe daha tutarlı ulaşır. Devamında şasi ve mekanizmada PID uygulayarak teleop akışını yumuşatır, otonom adımlarını güvenilir hâle getirirsiniz.

## İlerleme
<div class="progress">
  <div class="progress__track">
    <div class="progress__bar" style="width: 56%; background: linear-gradient(90deg, #7db929, #7db929)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %56</div>
</div> 
