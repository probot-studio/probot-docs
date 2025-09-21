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
Bu mini simülasyon, tek eklemli bir çubuğu hedef açıda tutarken PID katsayılarının etkisini hızla hissettirir. Sayfa açılır açılmaz çubuk serbest bırakılır; `Hedefi Değiştir` butonuyla 45° ↔ 135° arasında gidip gelin, Kp/Ki/Kd, güç limiti ve sürtünmeyle oynayın. Hedefe kaç saniyede oturduğunuzu ve ne kadar overshoot yaptığınızı sağdaki sayaçlardan takip edebilirsiniz. Bu blok yalnızca masaüstünde görünür; mobilde yer açmak için gizlenir.

<div class="pid-demo" data-title="PID Demo" style="margin:16px 0; padding:16px; border:1px solid #e5e4e2; border-radius:10px; background:#00204d; color:#e5e4e2;">
  <style>
    .pid-demo input[type=range]{ accent-color:#e5e4e2; }
    .pid-demo input[type=number]{ -moz-appearance:textfield; }
    .pid-demo input[type=number]::-webkit-inner-spin-button,
    .pid-demo input[type=number]::-webkit-outer-spin-button{ filter:invert(20%); }
    @media (max-width: 768px){
      .pid-demo{ display:none !important; }
    }
  </style>
  <div class="pid-demo-layout" style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start;">
    <canvas id="pid-demo-canvas" width="360" height="200" style="flex:0 0 auto; max-width:100%; background:#001838; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.35);"></canvas>
    <div class="pid-demo-metrics" style="flex:1 1 220px; min-width:210px; padding:14px 16px; background:rgba(0, 32, 77, 0.82); border-radius:10px; border:1px solid rgba(229, 228, 226, 0.18); display:flex; flex-direction:column; gap:10px;">
      <div style="font-weight:700; letter-spacing:0.01em;">Anlık Ölçümler</div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
        <span id="pid-demo-settling" style="font-weight:600;">Dengeye gelme süresi: --</span>
        <span id="pid-demo-overshoot" style="font-weight:600;">En büyük overshoot: --</span>
      </div>
      <div style="height:1px; background:rgba(229, 228, 226, 0.18);"></div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; line-height:1.4;">
        <button id="pid-demo-target" style="align-self:flex-start; padding:6px 16px; border:none; border-radius:6px; background:#e5e4e2; color:#00204d; font-weight:600; cursor:pointer;">Hedefi Değiştir (şu an: 45°)</button>
      </div>
    </div>
  </div>
  <div class="pid-controls" style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="pid-demo-kp-input" type="number" min="0" max="8" step="0.05" value="3.00" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kp</span>
      <input id="pid-demo-kp" class="pid-slider" type="range" min="0" max="8" step="0.05" value="3.0" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="pid-demo-ki-input" type="number" min="0" max="1.5" step="0.01" value="0.00" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Ki</span>
      <input id="pid-demo-ki" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.00" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="pid-demo-kd-input" type="number" min="0" max="2.5" step="0.01" value="0.25" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kd</span>
      <input id="pid-demo-kd" class="pid-slider" type="range" min="0" max="2.5" step="0.01" value="0.25" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="pid-demo-power-input" type="number" min="0.2" max="3.5" step="0.05" value="3.00" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Güç Limiti</span>
      <input id="pid-demo-power" class="pid-slider" type="range" min="0.2" max="3.5" step="0.05" value="3.0" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="pid-demo-damping-input" type="number" min="0" max="2.0" step="0.05" value="1.50" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Sürtünme</span>
      <input id="pid-demo-damping" class="pid-slider" type="range" min="0" max="2.0" step="0.05" value="1.5" style="flex:1;">
    </label>
  </div>
</div>

<script>
(function(){
  const canvas = document.getElementById('pid-demo-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches){
    return;
  }
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
  const targetBtn = document.getElementById('pid-demo-target');
  const settlingLabel = document.getElementById('pid-demo-settling');
  const overshootLabel = document.getElementById('pid-demo-overshoot');

  let angle = 90;
  let velocity = 0;
  let integral = 0;
  let lastError = 0;
  let running = true;
  let target = 45;
  let lastControl = 0;
  let initialErrorSign = 0;
  let crossedTarget = false;
  let gravity = parseFloat(gravitySlider.value);

  const dt = 0.02;
  const settleBand = 2.5;
  const settleTime = 0.6;

  let lastTargetSwitch = performance.now() / 1000;
  let maxOvershoot = 0;
  let settled = false;
  let timeWithinBand = 0;

  function fmt(v){ return (Math.round(v * 100) / 100).toFixed(2); }

  function updateTargetLabel(){
    if (targetBtn){
      targetBtn.textContent = 'Hedefi Değiştir (şu an: ' + target + '°)';
    }
  }

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

  bindInput(kpInput, kpSlider, 0, 1.5);
  bindInput(kiInput, kiSlider, 0, 1.5);
  bindInput(kdInput, kdSlider, 0, 1.5);
  bindInput(powerInput, powerSlider, 0.2, 3.5);
  bindInput(dampingInput, dampingSlider, 0, 2.0);

  syncDisplay();
  ['input','change'].forEach(evt => {
    kpSlider.addEventListener(evt, syncDisplay);
    kiSlider.addEventListener(evt, syncDisplay);
    kdSlider.addEventListener(evt, syncDisplay);
    powerSlider.addEventListener(evt, syncDisplay);
    dampingSlider.addEventListener(evt, syncDisplay);
  });

  function resetState(options = {}){
    const keepPose = options.keepPose === true;
    if (!keepPose){
      angle = 90;
      velocity = 0;
    }
    integral = 0;
    lastControl = 0;
    lastError = target - angle;
    running = true;
    lastTargetSwitch = performance.now() / 1000;
    maxOvershoot = 0;
    settled = false;
    timeWithinBand = 0;
    settlingLabel.textContent = 'Dengeye gelme süresi: --';
    overshootLabel.textContent = 'En büyük overshoot: --';
    initialErrorSign = Math.sign(lastError);
    crossedTarget = false;
  }

  targetBtn.addEventListener('click', () => {
    target = target === 45 ? 135 : 45;
    updateTargetLabel();
    resetState({ keepPose: true });
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
    ctx.fillText('Güç: ' + fmt(lastControl), 12, 62);
  }

  function step(){
    if (!running){ draw(); return; }

    const kp = parseFloat(kpSlider.value);
    const ki = parseFloat(kiSlider.value);
    const kd = parseFloat(kdSlider.value);
    const powerLimit = parseFloat(powerSlider.value);
    const damping = parseFloat(dampingSlider.value);

    const error = target - angle;
    const absError = Math.abs(error);
    integral += error * dt;
    integral = clamp(integral, -80, 80);
    const derivative = (error - lastError) / dt;

    let control = kp * error + ki * integral + kd * derivative;
    control = clamp(control, -powerLimit, powerLimit);
    lastControl = control;

    velocity += control * dt;
    velocity *= Math.max(0, 1 - damping * dt);
    angle += velocity * dt * 60;
    angle += 0.015 * (Math.random() - 0.5);
    angle = clamp(angle, 0, 180);

    const errorSign = Math.sign(error);
    if (!crossedTarget){
      if (initialErrorSign === 0 && errorSign !== 0){
        initialErrorSign = errorSign;
      } else if (errorSign !== 0 && errorSign !== initialErrorSign){
        crossedTarget = true;
      }
    }
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
      if (crossedTarget){
        if (absError > maxOvershoot){
          maxOvershoot = absError;
          overshootLabel.textContent = 'En büyük overshoot: ' + fmt(maxOvershoot) + '°';
        }
      }
    }

    lastError = error;
    draw();
  }

  resetState();
  updateTargetLabel();
  setInterval(step, dt * 1000);
})();
</script>

### Slider PID Deney Alanı
Aynı PID ayarlarını doğrusal bir slider üzerinde hissetmek için ikinci bir alan hazırladık. Bu kez kol yerine ray üzerinde ileri-geri giden bir kızak var; hedefi her değiştirdiğinizde rayın iç/dış duraklarına doğru hızlanıyor. Hedefler uçlardan içeri alındı ki overshoot’u net görebilesiniz. Yine masaüstünde çalışıyor; mobilde gizli.

<div class="pid-demo" data-title="PID Demo" style="margin:16px 0; padding:16px; border:1px solid #e5e4e2; border-radius:10px; background:#00204d; color:#e5e4e2;">
  <style>
    .pid-demo input[type=range]{ accent-color:#e5e4e2; }
    .pid-demo input[type=number]{ -moz-appearance:textfield; }
    .pid-demo input[type=number]::-webkit-inner-spin-button,
    .pid-demo input[type=number]::-webkit-outer-spin-button{ filter:invert(20%); }
    @media (max-width: 768px){
      .pid-demo{ display:none !important; }
    }
  </style>
  <div class="pid-demo-layout" style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start;">
    <canvas id="slider-demo-canvas" width="360" height="180" style="flex:0 0 auto; max-width:100%; background:#001838; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.35);"></canvas>
    <div class="pid-demo-metrics" style="flex:1 1 220px; min-width:210px; padding:14px 16px; background:rgba(0, 32, 77, 0.82); border-radius:10px; border:1px solid rgba(229, 228, 226, 0.18); display:flex; flex-direction:column; gap:10px;">
      <div style="font-weight:700; letter-spacing:0.01em;">Anlık Ölçümler</div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
        <span id="slider-demo-settling" style="font-weight:600;">Dengeye gelme süresi: --</span>
        <span id="slider-demo-overshoot" style="font-weight:600;">En büyük overshoot: --</span>
      </div>
      <div style="height:1px; background:rgba(229, 228, 226, 0.18);"></div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; line-height:1.4;">
        <button id="slider-demo-target" style="align-self:flex-start; padding:6px 16px; border:none; border-radius:6px; background:#e5e4e2; color:#00204d; font-weight:600; cursor:pointer;">Hedefi Değiştir (şu an: İçeride)</button>
      </div>
    </div>
  </div>
  <div class="pid-controls" style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="slider-demo-kp-input" type="number" min="0" max="1.5" step="0.02" value="0.50" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kp</span>
      <input id="slider-demo-kp" class="pid-slider" type="range" min="0" max="1.5" step="0.02" value="0.50" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="slider-demo-ki-input" type="number" min="0" max="1.5" step="0.01" value="0.00" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Ki</span>
      <input id="slider-demo-ki" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.00" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="slider-demo-kd-input" type="number" min="0" max="1.5" step="0.01" value="0.02" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kd</span>
      <input id="slider-demo-kd" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.02" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="slider-demo-power-input" type="number" min="0.2" max="3.5" step="0.05" value="3.00" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Güç Limiti</span>
      <input id="slider-demo-power" class="pid-slider" type="range" min="0.2" max="3.5" step="0.05" value="3.0" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="slider-demo-damping-input" type="number" min="0" max="2.0" step="0.05" value="1.50" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Sürtünme</span>
      <input id="slider-demo-damping" class="pid-slider" type="range" min="0" max="2.0" step="0.05" value="1.5" style="flex:1;">
    </label>
  </div>
</div>

<script>
(function(){
  const canvas = document.getElementById('slider-demo-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches){
    return;
  }
  const ctx = canvas.getContext('2d');
  const kpSlider = document.getElementById('slider-demo-kp');
  const kiSlider = document.getElementById('slider-demo-ki');
  const kdSlider = document.getElementById('slider-demo-kd');
  const powerSlider = document.getElementById('slider-demo-power');
  const dampingSlider = document.getElementById('slider-demo-damping');
  const kpInput = document.getElementById('slider-demo-kp-input');
  const kiInput = document.getElementById('slider-demo-ki-input');
  const kdInput = document.getElementById('slider-demo-kd-input');
  const powerInput = document.getElementById('slider-demo-power-input');
  const dampingInput = document.getElementById('slider-demo-damping-input');
  const targetBtn = document.getElementById('slider-demo-target');
  const settlingLabel = document.getElementById('slider-demo-settling');
  const overshootLabel = document.getElementById('slider-demo-overshoot');

  let position = 60;
  let velocity = 0;
  let integral = 0;
  let lastError = 0;
  let running = true;
  let target = 60;
  let targetIndex = 0;
  let lastControl = 0;
  let initialErrorSign = 0;
  let crossedTarget = false;

  const dt = 0.02;
  const settleBand = 3.0;
  const settleTime = 0.6;
  const trackStart = 60;
  const trackEnd = 300;
  const targetOffset = 40;
  const targetPositions = [trackStart + targetOffset, trackEnd - targetOffset];

  let lastTargetSwitch = performance.now() / 1000;
  let maxOvershoot = 0;
  let settled = false;
  let timeWithinBand = 0;

  function fmt(v){ return (Math.round(v * 100) / 100).toFixed(2); }

  function updateTargetLabel(){
    const label = targetIndex === 0 ? 'şu an: İç durak' : 'şu an: Dış durak';
    targetBtn.textContent = 'Hedefi Değiştir (' + label + ')';
  }

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

  bindInput(kpInput, kpSlider, 0, 1.5);
  bindInput(kiInput, kiSlider, 0, 1.5);
  bindInput(kdInput, kdSlider, 0, 1.5);
  bindInput(powerInput, powerSlider, 0.2, 3.5);
  bindInput(dampingInput, dampingSlider, 0, 2.0);

  syncDisplay();
  ['input','change'].forEach(evt => {
    kpSlider.addEventListener(evt, syncDisplay);
    kiSlider.addEventListener(evt, syncDisplay);
    kdSlider.addEventListener(evt, syncDisplay);
    powerSlider.addEventListener(evt, syncDisplay);
    dampingSlider.addEventListener(evt, syncDisplay);
  });

  function resetState(options = {}){
    const keepPose = options.keepPose === true;
    if (!keepPose){
      position = targetPositions[0];
      velocity = 0;
    }
    integral = 0;
    lastControl = 0;
    gravity = parseFloat(gravitySlider.value);
    lastError = target - position;
    running = true;
    lastTargetSwitch = performance.now() / 1000;
    maxOvershoot = 0;
    settled = false;
    timeWithinBand = 0;
    settlingLabel.textContent = 'Dengeye gelme süresi: --';
    overshootLabel.textContent = 'En büyük overshoot: --';
    initialErrorSign = Math.sign(lastError);
    crossedTarget = false;
  }

  targetBtn.addEventListener('click', () => {
    targetIndex = 1 - targetIndex;
    target = targetPositions[targetIndex];
    updateTargetLabel();
    resetState({ keepPose: true });
  });

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#001838';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Track
    ctx.fillStyle = '#173a70';
    ctx.fillRect(trackStart - 12, canvas.height/2 - 6, (trackEnd - trackStart) + 24, 12);

    // Target marker
    ctx.fillStyle = '#e5e4e2';
    const targetX = clamp(target, trackStart, trackEnd);
    ctx.fillRect(targetX - 4, canvas.height/2 - 16, 8, 32);

    // Slider carriage
    const sliderX = clamp(position, trackStart, trackEnd);
    ctx.fillStyle = '#e5e4e2';
    ctx.fillRect(sliderX - 12, canvas.height/2 - 18, 24, 36);

    ctx.fillStyle = '#e5e4e2';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Pozisyon: ' + fmt(position) + ' px', 12, 22);
    ctx.fillText('Hedef: ' + fmt(target) + ' px', 12, 42);
    ctx.fillText('Güç: ' + fmt(lastControl), 12, 62);
  }

  function step(){
    if (!running){ draw(); return; }

    const kp = parseFloat(kpSlider.value);
    const ki = parseFloat(kiSlider.value);
    const kd = parseFloat(kdSlider.value);
    const powerLimit = parseFloat(powerSlider.value);
    const damping = parseFloat(dampingSlider.value);

    const error = target - position;
    const absError = Math.abs(error);
    integral += error * dt;
    integral = clamp(integral, -80, 80);
    const derivative = (error - lastError) / dt;

    let control = kp * error + ki * integral + kd * derivative;
    control = clamp(control, -powerLimit, powerLimit);
    lastControl = control;

    velocity += control * dt * 40;
    velocity *= Math.max(0, 1 - damping * dt);
    position += velocity * dt * 60;
    position += 0.02 * (Math.random() - 0.5);
    position = clamp(position, trackStart, trackEnd);

    const errorSign = Math.sign(error);
    if (!crossedTarget){
      if (initialErrorSign === 0 && errorSign !== 0){
        initialErrorSign = errorSign;
      } else if (errorSign !== 0 && errorSign !== initialErrorSign){
        crossedTarget = true;
      }
    }

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
      if (crossedTarget){
        if (absError > maxOvershoot){
          maxOvershoot = absError;
          overshootLabel.textContent = 'En büyük overshoot: ' + fmt(maxOvershoot) + ' px';
        }
      }
    }

    lastError = error;
    draw();
  }

  targetIndex = 0;
  target = targetPositions[targetIndex];
  position = target;
  resetState({ keepPose: true });
  updateTargetLabel();
  setInterval(step, dt * 1000);
})();
</script>

### Elevator PID Deney Alanı
Kızak örneğine ek olarak, PID ayarlarının dikey bir elevator’da nasıl hissedildiğini de deneyebilirsiniz. Ağırlık aşağı çekmeye çalışırken hedef, ray boyunca alt/üst durakların biraz içinde konumlanıyor; böylece overshoot ve dengeleme süresi net gözlenir. `Yerçekimi` kaydırıcısıyla kabinin ağırlığını artırıp PID’in bunu nasıl dengelediğini gözleyebilirsiniz. Blok yalnızca masaüstünde görünür.

<div class="pid-demo" data-title="PID Demo" style="margin:16px 0; padding:16px; border:1px solid #e5e4e2; border-radius:10px; background:#00204d; color:#e5e4e2;">
  <style>
    .pid-demo input[type=range]{ accent-color:#e5e4e2; }
    .pid-demo input[type=number]{ -moz-appearance:textfield; }
    .pid-demo input[type=number]::-webkit-inner-spin-button,
    .pid-demo input[type=number]::-webkit-outer-spin-button{ filter:invert(20%); }
    @media (max-width: 768px){
      .pid-demo{ display:none !important; }
    }
  </style>
  <div class="pid-demo-layout" style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-start;">
    <canvas id="elevator-demo-canvas" width="280" height="280" style="flex:0 0 auto; max-width:100%; background:#001838; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,0.35);"></canvas>
    <div class="pid-demo-metrics" style="flex:1 1 220px; min-width:210px; padding:14px 16px; background:rgba(0, 32, 77, 0.82); border-radius:10px; border:1px solid rgba(229, 228, 226, 0.18); display:flex; flex-direction:column; gap:10px;">
      <div style="font-weight:700; letter-spacing:0.01em;">Anlık Ölçümler</div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:14px;">
        <span id="elevator-demo-settling" style="font-weight:600;">Dengeye gelme süresi: --</span>
        <span id="elevator-demo-overshoot" style="font-weight:600;">En büyük overshoot: --</span>
      </div>
      <div style="height:1px; background:rgba(229, 228, 226, 0.18);"></div>
      <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; line-height:1.4;">
        <button id="elevator-demo-target" style="align-self:flex-start; padding:6px 16px; border:none; border-radius:6px; background:#e5e4e2; color:#00204d; font-weight:600; cursor:pointer;">Hedefi Değiştir (şu an: Alt durak)</button>
      </div>
    </div>
  </div>
  <div class="pid-controls" style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-kp-input" type="number" min="0" max="1.5" step="0.02" value="0.60" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kp</span>
      <input id="elevator-demo-kp" class="pid-slider" type="range" min="0" max="1.5" step="0.02" value="0.60" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-ki-input" type="number" min="0" max="1.5" step="0.01" value="0.05" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Ki</span>
      <input id="elevator-demo-ki" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.05" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-kd-input" type="number" min="0" max="1.5" step="0.01" value="0.08" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Kd</span>
      <input id="elevator-demo-kd" class="pid-slider" type="range" min="0" max="1.5" step="0.01" value="0.08" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-power-input" type="number" min="0.2" max="3.5" step="0.05" value="2.40" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Güç Limiti</span>
      <input id="elevator-demo-power" class="pid-slider" type="range" min="0.2" max="3.5" step="0.05" value="2.40" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-damping-input" type="number" min="0" max="2.0" step="0.05" value="1.20" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Sürtünme</span>
      <input id="elevator-demo-damping" class="pid-slider" type="range" min="0" max="2.0" step="0.05" value="1.20" style="flex:1;">
    </label>
    <label style="display:flex; align-items:center; gap:12px; font-weight:600;">
      <input id="elevator-demo-gravity-input" type="number" min="0" max="1.2" step="0.05" value="0.40" style="width:78px; padding:4px; background:#e5e4e2; border:1px solid #00204d; color:#00204d; border-radius:4px;">
      <span style="min-width:68px;">Yerçekimi</span>
      <input id="elevator-demo-gravity" class="pid-slider" type="range" min="0" max="1.2" step="0.05" value="0.40" style="flex:1;">
    </label>
  </div>
</div>

<script>
(function(){
  const canvas = document.getElementById('elevator-demo-canvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches){
    return;
  }
  const ctx = canvas.getContext('2d');
  const kpSlider = document.getElementById('elevator-demo-kp');
  const kiSlider = document.getElementById('elevator-demo-ki');
  const kdSlider = document.getElementById('elevator-demo-kd');
  const powerSlider = document.getElementById('elevator-demo-power');
  const dampingSlider = document.getElementById('elevator-demo-damping');
  const gravitySlider = document.getElementById('elevator-demo-gravity');
  const kpInput = document.getElementById('elevator-demo-kp-input');
  const kiInput = document.getElementById('elevator-demo-ki-input');
  const kdInput = document.getElementById('elevator-demo-kd-input');
  const powerInput = document.getElementById('elevator-demo-power-input');
  const dampingInput = document.getElementById('elevator-demo-damping-input');
  const gravityInput = document.getElementById('elevator-demo-gravity-input');
  const targetBtn = document.getElementById('elevator-demo-target');
  const settlingLabel = document.getElementById('elevator-demo-settling');
  const overshootLabel = document.getElementById('elevator-demo-overshoot');

  let position = 200;
  let velocity = 0;
  let integral = 0;
  let lastError = 0;
  let running = true;
  let targetIndex = 0;
  let target = 200;
  let lastControl = 0;
  let initialErrorSign = 0;
  let crossedTarget = false;

  const dt = 0.02;
  const settleBand = 4.0;
  const settleTime = 0.6;
  const trackTop = 70;
  const trackBottom = 250;
  const targetOffset = 40;
  const targetPositions = [trackBottom - targetOffset, trackTop + targetOffset]; // Alt, üst

  let lastTargetSwitch = performance.now() / 1000;
  let maxOvershoot = 0;
  let settled = false;
  let timeWithinBand = 0;

  function fmt(v){ return (Math.round(v * 100) / 100).toFixed(2); }

  function updateTargetLabel(){
    const label = targetIndex === 0 ? 'şu an: Alt durak' : 'şu an: Üst durak';
    targetBtn.textContent = 'Hedefi Değiştir (' + label + ')';
  }

  function syncDisplay(){
    kpInput.value = fmt(parseFloat(kpSlider.value));
    kiInput.value = fmt(parseFloat(kiSlider.value));
    kdInput.value = fmt(parseFloat(kdSlider.value));
    powerInput.value = fmt(parseFloat(powerSlider.value));
    dampingInput.value = fmt(parseFloat(dampingSlider.value));
    gravityInput.value = fmt(parseFloat(gravitySlider.value));
    gravity = parseFloat(gravitySlider.value);
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

  bindInput(kpInput, kpSlider, 0, 1.5);
  bindInput(kiInput, kiSlider, 0, 1.5);
  bindInput(kdInput, kdSlider, 0, 1.5);
  bindInput(powerInput, powerSlider, 0.2, 3.5);
  bindInput(dampingInput, dampingSlider, 0, 2.0);
  bindInput(gravityInput, gravitySlider, 0, 1.2);

  syncDisplay();
  ['input','change'].forEach(evt => {
    kpSlider.addEventListener(evt, syncDisplay);
    kiSlider.addEventListener(evt, syncDisplay);
    kdSlider.addEventListener(evt, syncDisplay);
    powerSlider.addEventListener(evt, syncDisplay);
    dampingSlider.addEventListener(evt, syncDisplay);
    gravitySlider.addEventListener(evt, syncDisplay);
  });

  function resetState(options = {}){
    const keepPose = options.keepPose === true;
    if (!keepPose){
      position = targetPositions[0];
      velocity = 0;
    }
    integral = 0;
    lastControl = 0;
    gravity = parseFloat(gravitySlider.value);
    lastError = target - position;
    running = true;
    lastTargetSwitch = performance.now() / 1000;
    maxOvershoot = 0;
    settled = false;
    timeWithinBand = 0;
    settlingLabel.textContent = 'Dengeye gelme süresi: --';
    overshootLabel.textContent = 'En büyük overshoot: --';
    initialErrorSign = Math.sign(lastError);
    crossedTarget = false;
  }

  targetBtn.addEventListener('click', () => {
    targetIndex = 1 - targetIndex;
    target = targetPositions[targetIndex];
    updateTargetLabel();
    resetState({ keepPose: true });
  });

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#001838';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Ray ve kılavuz raylar
    ctx.fillStyle = '#0f2c5e';
    ctx.fillRect(canvas.width/2 - 40, trackTop - 18, 6, (trackBottom - trackTop) + 36);
    ctx.fillRect(canvas.width/2 + 34, trackTop - 18, 6, (trackBottom - trackTop) + 36);
    ctx.fillStyle = '#173a70';
    ctx.fillRect(canvas.width/2 - 4, trackTop - 20, 8, (trackBottom - trackTop) + 40);

    // Üst makara bloğu
    ctx.fillStyle = '#0f2c5e';
    ctx.fillRect(canvas.width/2 - 48, trackTop - 40, 96, 12);
    ctx.fillStyle = '#e5e4e2';
    ctx.fillRect(canvas.width/2 - 12, trackTop - 36, 24, 6);

    // Hedef işareti (stoper)
    ctx.fillStyle = '#e5e4e2';
    const targetY = clamp(target, trackTop, trackBottom);
    ctx.fillRect(canvas.width/2 - 34, targetY - 3, 68, 6);

    // Kabin ve kablo
    const cabY = clamp(position, trackTop, trackBottom);
    ctx.strokeStyle = '#e5e4e2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, trackTop - 34);
    ctx.lineTo(canvas.width/2, cabY - 20);
    ctx.stroke();
    ctx.fillStyle = '#e5e4e2';
    ctx.fillRect(canvas.width/2 - 30, cabY - 20, 60, 40);
    ctx.fillStyle = '#001838';
    ctx.fillRect(canvas.width/2 - 24, cabY - 12, 48, 24);
    ctx.fillStyle = '#e5e4e2';
    ctx.fillRect(canvas.width/2 - 34, cabY - 26, 68, 6);

    ctx.fillStyle = '#e5e4e2';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('Yükseklik: ' + fmt(position) + ' px', 12, 22);
    ctx.fillText('Hedef: ' + fmt(target) + ' px', 12, 42);
    ctx.fillText('Güç: ' + fmt(lastControl), 12, 62);
    ctx.fillText('Yerçekimi: ' + fmt(gravity), 12, 82);
  }

  function step(){
    if (!running){ draw(); return; }

    const kp = parseFloat(kpSlider.value);
    const ki = parseFloat(kiSlider.value);
    const kd = parseFloat(kdSlider.value);
    const powerLimit = parseFloat(powerSlider.value);
    const damping = parseFloat(dampingSlider.value);

    const error = target - position;
    const absError = Math.abs(error);
    integral += error * dt;
    integral = clamp(integral, -80, 80);
    const derivative = (error - lastError) / dt;

    const rawControl = kp * error + ki * integral + kd * derivative;
    const motor = clamp(rawControl, -powerLimit, powerLimit);
    lastControl = motor;

    const netForce = motor - gravity;
    velocity += netForce * dt * 35;
    velocity *= Math.max(0, 1 - damping * dt);
    position += velocity * dt * 60;
    position += 0.02 * (Math.random() - 0.5);
    position = clamp(position, trackTop, trackBottom);

    const errorSign = Math.sign(error);
    if (!crossedTarget){
      if (initialErrorSign === 0 && errorSign !== 0){
        initialErrorSign = errorSign;
      } else if (errorSign !== 0 && errorSign !== initialErrorSign){
        crossedTarget = true;
      }
    }

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
      if (crossedTarget){
        if (absError > maxOvershoot){
          maxOvershoot = absError;
          overshootLabel.textContent = 'En büyük overshoot: ' + fmt(maxOvershoot) + ' px';
        }
      }
    }

    lastError = error;
    draw();
  }

  targetIndex = 0;
  target = targetPositions[targetIndex];
  position = target;
  resetState({ keepPose: true });
  updateTargetLabel();
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
    <div class="progress__bar" style="width: 28%; background: linear-gradient(90deg, #bec615, #bec615)"></div>
  </div>
  <div class="progress__label">Ana Robot İlerleme: %28</div>
</div> 
