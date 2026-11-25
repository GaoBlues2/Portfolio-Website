/* =========================================================
   MY STORY – World 1: The Departure (ga Ninh Bình)
   - Chuyển cảnh: khói pixel lấp kín màn hình → tan ra lộ ga tàu
   - Scroll dọc = camera trượt ngang + kể chuyện bằng hộp thoại
   - Cuối chương: còi tàu, tàu lăn bánh rời ga
   Toạ độ thế giới = ảnh gốc 2172 x 724
   ========================================================= */
(() => {
  const WORLD = { w: 2172, h: 724 };
  const V = '?v=11';
  const A = (n) => `assets/story/${n}.png${V}`;
  // vị trí các lớp tách từ ảnh gốc (xem assets/story/meta.json)
  const META = {
    // nhân vật = sprite sheet ChatGPT vẽ (4 frame vẫy kiểu cần gạt nước, chạy ping-pong, nền đã key trong suốt); toạ độ thế giới
    sprites: {
      // lùi bố mẹ về sau (thu 0.8 quanh điểm tụ 60,445 rồi dịch phải 20px) để khớp tầm nhìn của Trung
      dad: { src: 'w1_dad', n: 4, w: 96, h: 205, x: 250, y: 447, fps: 9, shadow: 56 },
      mom: { src: 'w1_mom', n: 4, w: 94, h: 178, x: 328, y: 476, fps: 8, shadow: 48 },
      boy: { src: 'w1_boy', n: 4, w: 101, h: 176, fps: 11, footX: 0.675, footY: 0.99 },  // đứng ở cửa toa, quay mặt về phía bố mẹ, vẽ trong canvas tàu
    },
    // cửa toa mở (tỉ lệ trên sprite w1_car_door): tâm cửa, sàn cửa, chiều cao nhân vật so với toa
    door: { fx: 0.935, fy: 0.335, boyH: 0.58 },
  };

  const $ = (s, r = document) => r.querySelector(s);
  // chữ trong game lấy từ kịch bản (js/story-script.js)
  const SC = window.STORY_SCRIPT || { lines: {}, ui: {} };
  const LN = (k, d = '') => SC.lines[k] || d;
  const UIT = (k, n) => { const u = SC.ui[k] || {}; const f = (v) => String(v || '').replace('{n}', n); return typeof u === 'string' ? f(u) : { title: f(u.title), sub: f(u.sub) }; };
  const popUI = (k, n) => { const u = UIT(k, n); showPopup(u.title, u.sub); };
  const titleUI = (k) => { const u = UIT(k); showTitle(u.title, u.sub); };
  const endUI = (k) => { const u = UIT(k); setEndCard(u.title, u.sub); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const easeOutBack = (t) => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rand = (a, b) => a + Math.random() * (b - a);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(r));

  /* =========================================================
     Vẽ mây/khói kiểu pixel: viền đậm + bóng + thân + điểm sáng
     list: [{x, y, r}] theo pixel của canvas (canvas độ phân giải thấp)
     ========================================================= */
  function drawClouds(ctx, list, col) {
    const pass = (color, f) => {
      ctx.fillStyle = color; ctx.beginPath();
      for (const p of list) {
        const [dx, dy, rr] = f(p);
        if (rr <= 0.4) continue;
        ctx.moveTo(p.x + dx + rr, p.y + dy);
        ctx.arc(p.x + dx, p.y + dy, rr, 0, Math.PI * 2);
      }
      ctx.fill();
    };
    pass(col.ink, (p) => [0, 0, p.r + 1]);
    pass(col.shade, (p) => [0, 0, p.r]);
    pass(col.body, (p) => [-p.r * 0.12, -p.r * 0.16, p.r * 0.84]);
    pass(col.hi, (p) => [-p.r * 0.34, -p.r * 0.38, p.hi === false ? 0 : p.r * 0.26]);
  }
  const CREAM = { ink: '#6b5440', shade: '#dccbb0', body: '#f6efe2', hi: '#fffaf0' };
  const EXHAUST = { ink: '#9a9088', shade: '#d6d0c9', body: '#f3f0ec', hi: '#ffffff' };

  /* =========================================================
     ÂM THANH – tổng hợp bằng WebAudio (không cần file)
     ========================================================= */
  const Sound = (() => {
    let ctx = null, master = null, idle = null, noise = null;
    let muted = false;
    try { muted = localStorage.getItem('pf_mute') === '1'; } catch (e) { /* bỏ qua */ }
    const VOL = 0.8;
    function unlock() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = muted ? 0 : VOL; master.connect(ctx.destination);
        const len = ctx.sampleRate * 2;
        noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    }
    // Còi tàu diesel: hợp âm 3 nốt, 2 hồi "tút… tút—"
    function horn(at = 0) {
      if (!ctx) return;
      const t0 = ctx.currentTime + at;
      const out = ctx.createGain(); out.gain.value = 0;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000; lp.Q.value = 0.8;
      out.connect(lp); lp.connect(master);
      [311, 370, 466].forEach((f) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
        const vib = ctx.createOscillator(); vib.frequency.value = 5.2;
        const vg = ctx.createGain(); vg.gain.value = f * 0.004; vib.connect(vg); vg.connect(o.frequency);
        const g = ctx.createGain(); g.gain.value = 0.11; o.connect(g); g.connect(out);
        o.start(t0); vib.start(t0); o.stop(t0 + 1.5); vib.stop(t0 + 1.5);
      });
      for (const [s, e] of [[0, 0.32], [0.44, 1.2]]) {
        out.gain.setValueAtTime(0, t0 + s);
        out.gain.linearRampToValueAtTime(1, t0 + s + 0.04);
        out.gain.setValueAtTime(1, t0 + e - 0.08);
        out.gain.linearRampToValueAtTime(0, t0 + e);
      }
    }
    // Máy nổ xập xình khi tàu đứng chờ
    function startIdle() {
      if (!ctx || idle) return;
      const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150;
      const am = ctx.createGain(); am.gain.value = 0.55;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 7;
      const lg = ctx.createGain(); lg.gain.value = 0.45; lfo.connect(lg); lg.connect(am.gain);
      const eng = ctx.createOscillator(); eng.type = 'triangle'; eng.frequency.value = 46;
      const eg = ctx.createGain(); eg.gain.value = 0.35; eng.connect(eg); eg.connect(am);
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(lp); lp.connect(am); am.connect(g); g.connect(master);
      src.start(); lfo.start(); eng.start();
      g.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.2);
      idle = { src, lp, lfo, eng, g };
    }
    function setSpeed(v) {
      if (!idle) return;
      const t = ctx.currentTime;
      idle.lfo.frequency.setTargetAtTime(7 + v * 9, t, 0.25);
      idle.eng.frequency.setTargetAtTime(46 + v * 34, t, 0.25);
      idle.lp.frequency.setTargetAtTime(150 + v * 260, t, 0.25);
    }
    // Tiếng bánh xe qua mối ray: "cạch-cạch"
    function clack(v = 1) {
      if (!ctx || !noise) return;
      const t = ctx.currentTime;
      for (const dt of [0, 0.085]) {
        const s = ctx.createBufferSource(); s.buffer = noise;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 2.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + dt);
        g.gain.exponentialRampToValueAtTime(0.3 * v + 0.0002, t + dt + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.07);
        s.connect(bp); bp.connect(g); g.connect(master);
        s.start(t + dt, Math.random()); s.stop(t + dt + 0.1);
      }
    }
    // xì hơi phanh
    function hiss() {
      if (!ctx || !noise) return;
      const t = ctx.currentTime;
      const s = ctx.createBufferSource(); s.buffer = noise;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      s.connect(hp); hp.connect(g); g.connect(master); s.start(t, Math.random()); s.stop(t + 1);
    }
    // "cạch" khớp nối toa
    function clunk() {
      if (!ctx || !noise) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
      const s = ctx.createBufferSource(); s.buffer = noise;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.5;
      const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.25, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      s.connect(bp); bp.connect(g2); g2.connect(master); s.start(t, Math.random()); s.stop(t + 0.1);
    }
    function stopIdle() {
      if (!idle) return;
      const i = idle; idle = null;
      i.g.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      setTimeout(() => { try { i.src.stop(); i.lfo.stop(); i.eng.stop(); } catch (e) { /* đã dừng */ } }, 1500);
    }
    function setMuted(m) {
      muted = m;
      try { localStorage.setItem('pf_mute', m ? '1' : '0'); } catch (e) { /* bỏ qua */ }
      if (master) master.gain.setTargetAtTime(m ? 0 : VOL, ctx.currentTime, 0.05);
    }
    return {
      unlock, horn, hiss, clunk, startIdle, stopIdle, setSpeed, clack, setMuted,
      get muted() { return muted; },
      get running() { return !!ctx && ctx.state === 'running'; },
    };
  })();

  /* =========================================================
     CHUYỂN CẢNH KHÓI – canvas phủ toàn màn hình, độ phân giải thấp
     ========================================================= */
  const Smoke = (() => {
    const cv = document.createElement('canvas');
    cv.className = 'smoke-fx'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let PX = 6, w = 0, h = 0, puffs = [];
    function size() {
      PX = Math.max(4, Math.round(Math.max(innerWidth / 2, innerHeight) / 150));
      w = Math.ceil(innerWidth / PX); h = Math.ceil(innerHeight / PX);
      cv.width = w; cv.height = h;
    }
    // Lưới tổ ong các cụm khói phủ kín màn hình, thời điểm xuất hiện tính theo khoảng cách tới điểm gốc
    function build(ox, oy) {
      size();
      puffs = [];
      const R = Math.max(w, h) * 0.085, g = R * 1.3;
      let row = 0;
      for (let y = -g * 0.3; y < h + g; y += g * 0.86, row++) {
        for (let x = -g * 0.5 + (row % 2) * g * 0.5; x < w + g; x += g) {
          const gx = x + rand(-g, g) * 0.18, gy = y + rand(-g, g) * 0.18;
          const dist = Math.hypot(gx - ox, (gy - oy) * 1.25) / Math.hypot(w, h);
          puffs.push({ gx, gy, R: R * rand(1, 1.22), d1: dist * 1.25 + rand(0, 0.2), d2: rand(0, 0.25), side: Math.sign(gx - w / 2) || 1, hi: Math.random() < 0.3 });
        }
      }
    }
    async function run(dur, step) {
      cv.classList.add('on');
      const t0 = performance.now();
      while (true) {
        const t = (performance.now() - t0) / 1000;
        ctx.clearRect(0, 0, w, h);
        const list = step(Math.min(t, dur));
        drawClouds(ctx, list, CREAM);
        if (t >= dur) break;
        await frame();
      }
    }
    // Khói cuộn lên từ điểm gốc (ly trà) rồi lấp kín màn hình
    async function cover(origin) {
      size();
      build(origin ? origin.x / PX : w / 2, origin ? origin.y / PX : h);
      if (reduce) { fill(); return; }
      const dur = Math.max(...puffs.map((p) => p.d1)) + 0.6;
      await run(dur, (t) => puffs.map((p) => {
        const k = clamp((t - p.d1) / 0.6);
        return { x: p.gx, y: p.gy + (1 - ease(k)) * p.R * 2, r: p.R * (k <= 0 ? 0 : easeOutBack(k)), hi: p.hi && k < 0.8 };
      }));
      fill();
    }
    function fill() {
      if (!w) size();
      if (!puffs.length) build(w / 2, h);
      cv.classList.add('on');
      ctx.fillStyle = CREAM.body; ctx.fillRect(0, 0, w, h);
    }
    // Khói tách đôi trôi sang hai bên, thu nhỏ dần → lộ cảnh mới
    async function reveal() {
      if (!puffs.length) build(w / 2, h / 2);
      if (!reduce) {
        await run(1.25, (t) => puffs.map((p) => {
          const center = 1 - Math.abs(p.gx - w / 2) / (w / 2);   // giữa tan trước
          const k = clamp((t - p.d2 - (1 - center) * 0.25) / 0.85);
          const e = k * k;
          return { x: p.gx + p.side * e * w * 0.75, y: p.gy - k * p.R * 0.8, r: p.R * (1 - k * 0.7), hi: p.hi };
        }));
      }
      ctx.clearRect(0, 0, w, h);
      cv.classList.remove('on');
    }
    addEventListener('resize', () => { if (!cv.classList.contains('on')) size(); });
    return { cover, reveal, fill };
  })();

  /* =========================================================
     DỰNG DOM CỦA STORY
     ========================================================= */
  const root = $('#story');
  if (!root) return;
  const scroller = $('.story__scroll', root);
  const world = $('.world', root);
  const smokeCv = $('.w-smoke', root);
  const sctx = smokeCv.getContext('2d');
  const FX_RES = 3;                                   // canvas hiệu ứng = thế giới / 3 → khói pixel to
  smokeCv.width = WORLD.w / FX_RES; smokeCv.height = WORLD.h / FX_RES;

  const place = (el, m) => Object.assign(el.style, { left: m.x + 'px', top: m.y + 'px', width: m.w + 'px', height: m.h + 'px' });
  $('.w-base', root).src = A('w1_base');

  /* =========================================================
     ĐOÀN TÀU – mỗi toa là 1 sprite ChatGPT vẽ SẴN GÓC NGHIÊNG (3/4, đúng góc
     nhìn của ảnh ga). Mỗi toa đặt lên ray bằng 1 phép biến đổi affine
     (co giãn đều + xô nhẹ cho đáy bánh nằm đúng đường ray), toa sau móc vào
     đuôi toa trước → các toa tách rời, giật/nảy riêng, càng lại gần càng to.
     ========================================================= */
  // Đường ray đo trên ảnh nền: đáy bánh y = vy + bot·(x − vx); chiều cao 1 toa ≈ unit·(x − vx)
  const TRACK = { vx: 60, vy: 445, bot: 0.181, unit: 0.25 };   // đo lại theo mép trên thanh ray gần (y = 0.181x + 434)
  const baseY = (x) => TRACK.vy + TRACK.bot * (x - TRACK.vx);
  const unitH = (x) => TRACK.unit * (x - TRACK.vx);

  const trainCv = $('.w-train', root);
  const tctx = trainCv.getContext('2d');
  const TRAIN_RES = Math.min(1.6, Math.max(1, window.devicePixelRatio || 1));
  trainCv.width = Math.round(WORLD.w * TRAIN_RES); trainCv.height = Math.round(WORLD.h * TRAIN_RES);
  const loadImgP = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  // Toạ độ trên sprite (px của file đã thu nhỏ): c1/c2 = đáy bánh giá sau/giá trước, fx = góc nối mặt hông–mặt đầu,
  // rx = đuôi toa, H = chiều cao tại góc fx; h = chiều cao thật (đơn vị); chimney = ống xả; door = sàn cửa mở
  const CAR_DEF = {
    loco: { src: 'w1_loco', c1: [180, 379], c2: [540, 420], fx: 600, rx: 6, H: 430, h: 1.0, chimney: [414, 36] },
    door: { src: 'w1_car_door', c1: [177, 382], c2: [520, 410], fx: 720, rx: 6, H: 408, h: 0.95, door: [635, 300] },
    car: { src: 'w1_car', c1: [120, 342], c2: [720, 421], fx: 873, rx: 6, H: 384, h: 0.95 },
  };
  const ORDER = ['loco', 'door', 'car', 'car', 'car', 'car', 'car'];
  const GAP = 14;                       // khe giữa 2 toa (px sprite)
  const LOCO_X0 = 1300;                  // góc mũi đầu máy lúc đứng ở ga
  const TAIL_MIN = 300;                  // nối toa tới khi mũi toa ra sau lưng bố (x≈300); phần xa hơn tan vào sương
  const train = { cars: [], ready: false };
  Promise.all(Object.values(CAR_DEF).map(async (d) => {
    d.img = await loadImgP(A(d.src));
    d.slope = (d.c2[1] - d.c1[1]) / (d.c2[0] - d.c1[0]);
  })).then(async () => {
    if (!CAR_DEF.car.img) CAR_DEF.car.img = CAR_DEF.door.img;
    train.cars = ORDER.map((k, i) => ({ k, d: CAR_DEF[k], i, bobPh: Math.random() * 6 }));
    train.boyImg = await loadImgP(A(META.sprites.boy.src));
    train.ready = true;
  });

  // ma trận đặt sprite: góc fx (đáy) nằm tại X trên ray, cỡ theo phối cảnh tại X
  function carMatrix(d, X, lift) {
    const k = unitH(X) * d.h / d.H;
    const sh = (TRACK.bot - d.slope) * k;                 // xô dọc để đường đáy bánh trùng đường ray
    const yc = d.c2[1] + d.slope * (d.fx - d.c2[0]);      // đáy bánh tại cột fx
    const e = X - k * d.fx;
    const f = baseY(X) - k * yc - sh * d.fx - lift * k * d.H;
    return { k, a: k, b: sh, d: k, e, f, map: (x, y) => [k * x + e, sh * x + k * y + f] };
  }

  function drawTrain(st) {
    tctx.setTransform(TRAIN_RES, 0, 0, TRAIN_RES, 0, 0);
    tctx.clearRect(0, 0, WORLD.w, WORLD.h);
    if (!train.ready) return null;
    tctx.imageSmoothingEnabled = true; tctx.imageSmoothingQuality = 'high';
    // vị trí: đầu máy chạy trên ray theo hàm mũ (khoảng cách tới điểm tụ nhân e^L) → càng gần càng nhanh, càng to
    let X = TRACK.vx + (LOCO_X0 - TRACK.vx) * Math.exp(st.lead + st.jolt(0) * 0.15);
    // số toa: chỉ giữ những toa mà lúc đứng ở ga mũi toa còn ở bên phải bố mẹ (x ≥ TAIL_MIN)
    // → toa cuối khuất sau lưng bố mẹ, không có đuôi tàu nhỏ dần thành sợi kim
    if (!train.n) {
      let Xr = LOCO_X0, n = 1;
      for (let i = 1; i < train.cars.length; i++) {
        const pd = train.cars[i - 1].d, p = carMatrix(pd, Xr, 0);
        Xr = p.map(pd.rx, 0)[0] - p.k * GAP;
        if (Xr < TAIL_MIN) break;
        n++;
      }
      train.n = n;
    }
    const cars = train.cars.slice(0, train.n);
    const mats = [];
    cars.forEach((c, i) => {
      if (i > 0) {
        const p = mats[i - 1], pd = train.cars[i - 1].d;
        const gap = Math.max(4, GAP + 260 * (st.jolt(i - 1) - st.jolt(i)));   // giật → khe co giãn
        X = p.map(pd.rx, 0)[0] - p.k * gap;
      }
      const lift = (st.moving ? 0.006 * Math.sin(st.t * 19 + c.bobPh) + 0.004 * Math.sin(st.t * 7.3 + i) : 0) + st.hum;
      mats.push(carMatrix(c.d, X, lift));
    });
    // vẽ từ toa cuối lên đầu máy (toa gần đè toa xa)
    for (let i = cars.length - 1; i >= 0; i--) {
      const c = cars[i], m = mats[i], img = c.d.img;
      if (!img) continue;
      const left = m.map(0, 0)[0], right = m.map(img.width, 0)[0];
      if (left > WORLD.w + 20 || right < -20) continue;
      tctx.setTransform(m.a * TRAIN_RES, m.b * TRAIN_RES, 0, m.d * TRAIN_RES, m.e * TRAIN_RES, m.f * TRAIN_RES);
      tctx.drawImage(img, 0, 0);
      if (c.d.door && train.boyImg && (st.boyOut || 0) < 1) drawBoy(c.d.door, st);
    }
    tctx.setTransform(TRAIN_RES, 0, 0, TRAIN_RES, 0, 0);
    // sương mù xa: các toa xa nhạt dần vào sương như ảnh gốc
    tctx.globalCompositeOperation = 'source-atop';
    const g = tctx.createLinearGradient(250, 0, 820, 0);
    g.addColorStop(0, 'rgba(222,206,214,.7)'); g.addColorStop(1, 'rgba(222,206,214,0)');
    tctx.fillStyle = g; tctx.fillRect(0, 0, 820, WORLD.h);
    // đuôi tàu tan hẳn vào sương sau lưng bố (không có đuôi cụt / sợi kim)
    tctx.globalCompositeOperation = 'destination-out';
    const g2 = tctx.createLinearGradient(290, 0, 400, 0);
    g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
    tctx.fillStyle = g2; tctx.fillRect(0, 0, 400, WORLD.h);
    tctx.globalCompositeOperation = 'source-over';
    // điểm phục vụ hiệu ứng (toạ độ thế giới)
    const L = mats[0], ld = train.cars[0].d;
    const [cx, cy] = L.map(...ld.chimney);
    const bogies = [];
    cars.forEach((c, i) => [c.d.c1, c.d.c2].forEach(([bx, by]) => {
      const [x, y] = mats[i].map(bx, by);
      if (x > 0 && x < WORLD.w) bogies.push({ x, y, h: mats[i].k * c.d.H });
    }));
    const tail = mats[mats.length - 1].map(0, 0)[0];   // mép trái toa cuối (toạ độ thế giới)
    return { chimney: { x: cx, y: cy, h: L.k * ld.H }, bogies, tail };
  }

  // nhân vật chính đứng ở cửa toa (vẽ trong hệ toạ độ của sprite toa → cùng phối cảnh)
  const boyAnim = { ph: Math.random() * 10, seq: [0, 1, 2, 3, 2, 1] };
  function drawBoy(door, st) {
    const B = META.sprites.boy, h = 250, w = h * B.w / B.h;
    const fps = st.moving ? B.fps * 1.4 : B.fps;
    const f = reduce ? 0 : boyAnim.seq[Math.floor((st.t + boyAnim.ph) * fps) % boyAnim.seq.length];
    const o = st.boyOut || 0;
    tctx.save(); tctx.globalAlpha = 1 - o;
    tctx.translate(0, -6 * o);               // bước lên vào trong toa rồi khuất
    tctx.drawImage(train.boyImg, f * B.w, 0, B.w, B.h, door[0] - w * B.footX, door[1] - h * B.footY, w, h);
    tctx.restore();
  }

  // Sprite: 1 div, ảnh nền là cả hàng frame, đổi background-position để chạy hoạt ảnh
  const parentsBox = $('.w-parents', root);
  function makeSprite(cfg, parent, ox = 0, oy = 0) {
    const el = document.createElement('div');
    el.className = 'w-sprite';
    Object.assign(el.style, {
      left: cfg.x - ox + 'px', top: cfg.y - oy + 'px', width: cfg.w + 'px', height: cfg.h + 'px',
      backgroundImage: `url(${A(cfg.src)})`, backgroundSize: `${cfg.w * cfg.n}px ${cfg.h}px`,
    });
    if (cfg.shadow) {           // bóng mờ dưới chân (vẽ trước để nằm dưới nhân vật)
      const sh = document.createElement('div'); sh.className = 'w-shadow';
      Object.assign(sh.style, { left: cfg.x - ox + cfg.w * 0.36 - cfg.shadow / 2 + 'px', top: cfg.y - oy + cfg.h - 9 + 'px', width: cfg.shadow + 'px' });
      parent.appendChild(sh);
    }
    parent.appendChild(el);
    return { ...cfg, el, f: -1, ph: Math.random() * 10 };
  }
  const dad = makeSprite(META.sprites.dad, parentsBox);
  const mom = makeSprite(META.sprites.mom, parentsBox);
  const animate = (sp, t, fps) => {
    // vẫy kiểu cần gạt nước: đi 0→1→2→3 rồi quay 3→2→1 (ping-pong)
    const seq = sp.seq || (sp.seq = [...Array(sp.n).keys(), ...[...Array(sp.n).keys()].slice(1, -1).reverse()]);
    const f = reduce ? 0 : seq[Math.floor((t + sp.ph) * fps) % seq.length];
    if (f !== sp.f) { sp.f = f; sp.el.style.backgroundPosition = `${-f * sp.w}px 0`; }
  };

  const dialogText = $('.dialog__text', root);
  const dialogMore = $('.dialog__more', root);
  const titleCard = $('.title-card', root);
  const popup = $('.popup', root);
  const endCard = $('.end-card', root);
  const soundBtn = $('.hud__sound', root);
  const journeyMarker = $('.journey__marker', root);
  const toot = $('.toot', root);
  const scrollHint = $('.scroll-hint', root);
  const flash = $('.flash', root);
  const dialog = $('.dialog', root);
  const kmChip = $('.km', root);
  const kmNum = $('.km b', root);
  const kmLabel = $('.km__l', root);
  const stops = [...root.querySelectorAll('.journey__stop')];
  const smap = window.StoryMap && window.MAP_DATA ? window.StoryMap.create({ root, drawClouds, Sound, clamp, ease }) : null;
  const track = $('.story__track', root);
  const zoomCv = $('.zoomfx', root);
  const partyNum = $('.party b', root);
  const setParty = (n) => { partyNum.textContent = n; };

  /* ---------- Kịch bản phần scroll: mỗi câu thoại bắt đầu ở một mốc ---------- */
  const LINES = [
    { at: 0.0, text: LN('w1_1') },
    { at: 0.25, text: LN('w1_2') },
    { at: 0.5, text: LN('w1_3'), more: UIT('depart_hint') || 'SCROLL ▼ TO DEPART' },
  ];
  const TRIGGER = 0.8;            // kéo tới đây → cảnh tàu chạy tự diễn
  // Kịch bản cảnh tàu chạy (giây tính từ lúc kích hoạt)
  const CUT = {
    hiss: 0.85, go: 1.55, accel: 0.27,  // gia tốc theo thang log khoảng cách (xem drawTrain)   // xì hơi phanh, bắt đầu lăn bánh, gia tốc (px/s²)
    boyIn: 0.35,                         // Trung bước vào trong toa ngay trước khi tàu lăn bánh (giây trước CUT.go)
    end: 9,                              // dự phòng: quá mốc này mà tàu chưa khuất thì vẫn chuyển cảnh
    lines: [
      { at: 0, text: LN('w1_go') },
    ],
  };

  let lineKey = '', typing = 0;
  async function say(key, text, more = 'SCROLL ▼') {
    if (key === lineKey) return;
    lineKey = key;
    const my = ++typing;
    dialogMore.classList.remove('on'); dialogMore.textContent = more;
    if (reduce) { dialogText.textContent = text; dialogMore.classList.add('on'); return; }
    for (let n = 0; n <= text.length; n++) {
      if (my !== typing) return;
      dialogText.textContent = text.slice(0, n);
      await sleep(text[n - 1] === '.' || text[n - 1] === ',' ? 90 : 24);
    }
    dialogMore.classList.toggle('on', !!more);
  }

  let popTimer = 0;
  function showPopup(title, sub) {
    popup.innerHTML = `<b>${title}</b><span>${sub}</span>`;
    popup.classList.remove('on'); void popup.offsetWidth; popup.classList.add('on');
    clearTimeout(popTimer); popTimer = setTimeout(() => popup.classList.remove('on'), 3200);
  }
  const retrigger = (el) => { el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); };

  /* =========================================================
     HIỆU ỨNG CHUYỂN CẢNH (cảnh đã đổi ngay, lớp phủ "mở" ra để lộ cảnh mới)
     iris · night · blinds · bolt · dissolve · page · flash
     ========================================================= */
  const transEl = $('.trans', root), transCv = $('.trans-cv', root);
  let transRun = 0;
  function transit(kind = 'flash') {
    if (reduce) kind = 'flash';
    if (kind === 'flash') { retrigger($('.flash', root)); return; }
    if (kind === 'bolt') { retrigger($('.flash', root)); const b = $('.w3__bolt', root); if (b) retrigger(b); Sound.clunk(); return; }
    if (kind === 'dissolve' || kind === 'page') { canvasTrans(kind); return; }
    transEl.className = 'trans'; void transEl.offsetWidth; transEl.className = 'trans on t-' + kind;
  }
  // tan ô pixel / lật trang: vẽ bằng canvas độ phân giải thấp
  function canvasTrans(kind) {
    const my = ++transRun, PX = Math.max(8, Math.round(innerWidth / 48));
    const w = Math.ceil(innerWidth / PX), h = Math.ceil(innerHeight / PX);
    transCv.width = w; transCv.height = h;
    const c = transCv.getContext('2d');
    const order = [...Array(w * h).keys()].map((i) => [i, Math.random()]).sort((a, b) => a[1] - b[1]).map((a) => a[0]);
    const dur = kind === 'page' ? 0.7 : 0.75, t0 = performance.now();
    transCv.classList.add('on');
    const step = () => {
      if (my !== transRun) return;
      const k = Math.min(1, (performance.now() - t0) / 1000 / dur);
      c.clearRect(0, 0, w, h);
      if (kind === 'dissolve') {
        c.fillStyle = '#f6efe2';
        const keep = Math.floor(order.length * (1 - k));
        for (let n = 0; n < keep; n++) { const i = order[n]; c.fillRect(i % w, (i / w) | 0, 1, 1); }
      } else {
        // tấm giấy trượt sang trái, mép phải răng cưa pixel + bóng
        const e = k * k * (3 - 2 * k), edge = Math.round(w * (1 - e) * 1.1);
        for (let y = 0; y < h; y++) {
          const jag = (y * 7 % 5) - 2, x1 = edge + jag;
          if (x1 <= 0) continue;
          c.fillStyle = 'rgba(42,26,16,.35)'; c.fillRect(0, y, Math.min(w, x1 + 1), 1);
          c.fillStyle = '#f6efe2'; c.fillRect(0, y, Math.min(w, x1), 1);
        }
      }
      if (k < 1) requestAnimationFrame(step); else transCv.classList.remove('on');
    };
    step();
  }
  window.__storyTransit = transit;
  const w3 = window.StoryW3 ? window.StoryW3.create({ root, Sound, drawClouds, clamp, ease, say, showPopup, setParty, retrigger, LN, UIT, onDone: () => homeEnding() }) : null;
  const w2 = window.StoryW2 ? window.StoryW2.create({ root, Sound, drawClouds, clamp, ease, say, showPopup, showTitle, setParty, retrigger, LN, UIT, onDone: () => w2ToFlight() }) : null;

  /* ---------- Scale & camera ---------- */
  let S = 1, VW = 0, VH = 0;
  function fit() {
    VW = innerWidth; VH = innerHeight; S = Math.max(VW / WORLD.w, VH / WORLD.h);
    const us = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) || 1;
    if (smap) smap.fit(us);
    if (w2) w2.fit();
    if (w3) w3.fit();
  }
  addEventListener('resize', fit);

  /* =========================================================
     HIỆU ỨNG (toạ độ thế giới): khói ống xả, hơi phanh, tia lửa, bụi
     ========================================================= */
  const clouds = [];   // {x,y,vx,vy,r0,grow,born,life,pal,hi,drag}
  const sparks = [];   // {x,y,vx,vy,born,life,c}
  const DIESEL = { ink: '#6a625b', shade: '#968f88', body: '#b3ada6', hi: '#cfcac4' };
  const DUST = { ink: '#8b7a66', shade: '#c9b89c', body: '#dfd1b8', hi: '#efe5d2' };
  const STEAM = { ink: '#a9a4a0', shade: '#e2dfdc', body: '#f8f7f5', hi: '#ffffff' };
  // đáy bánh xe theo phối cảnh (đo trên ảnh gốc)
  const WHEEL = [[600, 550], [900, 604], [1100, 631], [1500, 654]];
  const wheelY = (x) => {
    for (let k = 1; k < WHEEL.length; k++) if (x <= WHEEL[k][0] || k === WHEEL.length - 1) {
      const [x0, y0] = WHEEL[k - 1], [x1, y1] = WHEEL[k];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
    return 640;
  };
  const addCloud = (o) => clouds.push({ hi: Math.random() < 0.5, drag: 0, grow: 30, ...o });

  function drawFx(t, dt) {
    sctx.clearRect(0, 0, smokeCv.width, smokeCv.height);
    // gom theo bảng màu để vẽ một lượt (giữ kiểu mây pixel liền khối)
    const groups = new Map();
    for (let i = clouds.length - 1; i >= 0; i--) {
      const p = clouds[i];
      const a = (t - p.born) / p.life;
      if (a >= 1) { clouds.splice(i, 1); continue; }
      const k = Math.max(0, 1 - p.drag * dt);
      p.vx *= k; p.vy *= k;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const r = (p.r0 + p.grow * Math.sqrt(a)) * (a > 0.7 ? (1 - a) / 0.3 : 1);
      if (!groups.has(p.pal)) groups.set(p.pal, []);
      groups.get(p.pal).push({ x: p.x / FX_RES, y: p.y / FX_RES, r: r / FX_RES, hi: p.hi });
    }
    for (const [pal, list] of groups) { list.reverse(); drawClouds(sctx, list, pal); }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const a = (t - s.born) / s.life;
      if (a >= 1) { sparks.splice(i, 1); continue; }
      s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      sctx.fillStyle = a < 0.5 ? s.c : '#f26a2e';
      sctx.fillRect(Math.round(s.x / FX_RES), Math.round(s.y / FX_RES), 1, 1);
    }
  }

  /* ---------- Trạng thái cảnh tàu chạy ---------- */
  let mode = 'idle';      // idle → depart → leaving (khói phủ) → done (màn tiếp theo)
  let tCut = 0;           // thời điểm kích hoạt
  let lastPuff = 0, lastPuffX = 0, clackAcc = 0, lastLead = 0, steamDone = false, burstDone = false;
  const clunked = new Set();

  // vị trí đầu tàu theo thời gian: đứng yên → lăn bánh nhanh dần
  const leadAt = (tau) => (tau < CUT.go ? 0 : 0.5 * CUT.accel * (tau - CUT.go) ** 2);
  // cú giật toa: mỗi toa giật trễ hơn toa trước 0.09s, lò xo tắt dần
  const joltAt = (tau, i) => {
    const u = tau - CUT.go - i * 0.11;
    if (u < 0) return 0;
    return 0.1 * Math.sin(u * 20) * Math.exp(-u * 4.5);
  };

  function resetScene() {
    mode = 'idle'; lastLead = 0; clackAcc = 0; steamDone = false; burstDone = false; clunked.clear();
    clouds.length = 0; sparks.length = 0;
    endCard.classList.remove('on'); root.classList.remove('is-next', 'is-map');
    lineKey = '';
    if (smap) smap.reset();
    if (w2) w2.reset();
    root.classList.remove('is-w2', 'is-fly', 'is-w3');
    if (w3) w3.reset();
    if (smap) smap.flightOff();
    kmLabel.textContent = 'FROM HOME';
    track.style.height = '';
    setEndCard('WORLD 1 CLEAR!', 'Next: WORLD 2 · Nha Trang');
    setParty(1);
    setJourney(0, 0);
  }
  function setEndCard(h, p) { endCard.querySelector('h3').textContent = h; endCard.querySelector('p').textContent = p; }

  // thanh hành trình HUD: k = vị trí mũi tên (0 Ninh Bình … 0.5 Nha Trang … 1 Hà Nội), here = chỉ số ga hiện tại
  function setJourney(k, here) {
    journeyMarker.style.setProperty('--k', k.toFixed(3));
    stops.forEach((el, i) => { el.classList.toggle('here', i === here); el.classList.toggle('been', i < here); });
  }

  // tàu khuất → khói phủ → bản đồ Việt Nam (không có bản đồ thì hiện thẻ WORLD 1 CLEAR như cũ)
  async function nextScreen() {
    mode = 'leaving';
    await Smoke.cover({ x: innerWidth / 2, y: innerHeight });
    if (mode !== 'leaving') return;
    if (!smap) {
      root.classList.add('is-next');
      endCard.classList.add('on');
      mode = 'done';
      await Smoke.reveal();
      return;
    }
    enterMap();
    await Smoke.reveal();
    titleUI('title_map');
  }

  /* =========================================================
     MÀN BẢN ĐỒ: scroll → đoàn tàu chạy Ninh Bình → Nha Trang
     ========================================================= */
  const MAP_LINES = [
    { at: 0.0, text: LN('map_1') },
    { at: 0.1, text: LN('map_2') },
    { at: 0.5, text: LN('map_3') },
    { at: 0.86, text: LN('map_4') },
  ];
  const MAP_END = 0.97;           // kéo tới đây → thẻ kết chương
  function enterMap() {
    clouds.length = 0; sparks.length = 0;
    sctx.clearRect(0, 0, smokeCv.width, smokeCv.height);
    tctx.setTransform(1, 0, 0, 1, 0, 0); tctx.clearRect(0, 0, trainCv.width, trainCv.height);
    smap.reset();
    root.classList.remove('is-next');
    root.classList.add('is-map');
    endCard.classList.remove('on');
    scroller.scrollTop = 0; pv = 0; lineKey = '';
    mode = 'map';
    fit();
  }
  function showTitle(h, p) {
    titleCard.querySelector('h2').textContent = h;
    titleCard.querySelector('p').textContent = p;
    retrigger(titleCard);
  }
  const mapEvents = {
    arrive() {
      Sound.horn(); Sound.hiss();
      popUI('popup_arrive_nt');
    },
    leave() {},
  };
  function mapFrame(t, dt) {
    const r = smap.frame(t, dt, pv, mapEvents);
    kmNum.textContent = Math.round(r.km).toLocaleString('en-US');
    setJourney(r.u * 0.5, r.u >= 0.999 ? 1 : 0);
    let li = 0;
    for (let i = 0; i < MAP_LINES.length; i++) if (pv + 0.0001 >= MAP_LINES[i].at) li = i;
    say('m' + li, MAP_LINES[li].text, li === MAP_LINES.length - 1 ? '' : 'SCROLL ▼');
    if (w2) {
      // tới Nha Trang + kéo gần hết → zoom thẳng vào Nha Trang sang World 2
      if (r.arrived && pv >= MAP_END - 0.05) { if (!arriveT) arriveT = t; if (t - arriveT > 0.9) zoomToW2(); }
      else arriveT = 0;
    } else endCard.classList.toggle('on', pv >= MAP_END);
    scrollHint.classList.toggle('gone', pv > 0.03);
  }
  let arriveT = 0;

  /* =========================================================
     CHUYỂN CẢNH bản đồ → World 2: zoom mạnh vào Nha Trang (ô pixel to dần),
     rồi cảnh mới hiện ra từ ô pixel thô mịn dần
     ========================================================= */
  let zoomT0 = 0;
  const ZOOM_IN = 1.0, DEPIX = 0.9;
  function zoomToW2() {
    if (mode !== 'map') return;
    mode = 'zoom'; zoomT0 = performance.now() / 1000;
    Sound.hiss();
  }
  function zoomFrame(t, dt) {
    const k = t - zoomT0;
    const zctx = zoomCv.getContext('2d');
    if (k < ZOOM_IN) {
      const e = k / ZOOM_IN;
      smap.frame(t, dt, 1, mapEvents, Math.exp(e * e * 3.6));      // tăng tốc zoom tới ~36x
      return;
    }
    if (!root.classList.contains('is-w2')) {
      enterW2();
      zoomCv.classList.add('on');
    }
    const e = clamp((k - ZOOM_IN) / DEPIX);
    const block = Math.max(1, Math.round(96 * Math.pow(1 - e, 2.2)));
    const w = Math.max(1, Math.ceil(innerWidth / block)), h = Math.max(1, Math.ceil(innerHeight / block));
    if (zoomCv.width !== w || zoomCv.height !== h) { zoomCv.width = w; zoomCv.height = h; }
    zctx.imageSmoothingEnabled = true;
    w2.drawFirst(zctx, w, h);
    w2.frame(t, dt, 0);
    if (e >= 1) {
      zoomCv.classList.remove('on');
      mode = 'w2';
      titleUI('title_w2');
    }
  }
  /* =========================================================
     CHUYỂN CẢNH World 2 → bản đồ: cảnh sân trường vỡ thành ô pixel to dần,
     rồi bản đồ hiện ra ở độ zoom rất lớn quanh Nha Trang và lùi ra xa
     → scroll: máy bay bay Nha Trang (Cam Ranh) → Hà Nội (Nội Bài)
     ========================================================= */
  const PIX_OUT = 0.7, UNZOOM = 1.3;
  let fxT0 = 0;
  // World 2 xong → khói trắng phủ màn → bản đồ (chuyến bay) → khói tan
  async function w2ToFlight() {
    if (mode !== 'w2' || !smap) return;
    mode = 'w2out';
    await Smoke.cover({ x: innerWidth / 2, y: innerHeight });
    if (mode !== 'w2out') return;
    const pol = $('.polaroid', root);
    pol.style.transition = 'none'; pol.classList.remove('on');
    requestAnimationFrame(() => requestAnimationFrame(() => { pol.style.transition = ''; }));
    enterFlight(); mode = 'fly';
    say('f0', FLY_LINES[0].text, 'SCROLL ▼');
    await Smoke.reveal();
    titleUI('title_fly');
  }
  function unzoomFrame(t, dt) {
    const k = t - fxT0;
    const zctx = zoomCv.getContext('2d');
    if (k < PIX_OUT) {
      const e = k / PIX_OUT;
      const block = Math.max(1, Math.round(1 + 95 * e * e));
      const w = Math.max(1, Math.ceil(innerWidth / block)), h = Math.max(1, Math.ceil(innerHeight / block));
      if (zoomCv.width !== w || zoomCv.height !== h) { zoomCv.width = w; zoomCv.height = h; }
      zctx.imageSmoothingEnabled = true;
      w2.drawView(zctx, w, h);
      w2.frame(t, dt, pv);
      return;
    }
    if (!root.classList.contains('is-fly')) { enterFlight(); zoomCv.classList.remove('on'); say('f0', FLY_LINES[0].text, 'SCROLL ▼'); }
    const e = clamp((k - PIX_OUT) / UNZOOM);
    smap.flightFrame(t, dt, 0, flyEvents, Math.exp((1 - e) * (1 - e) * 3.6));   // ~36x → 1x
    if (e >= 1) { mode = 'fly'; titleUI('title_fly'); }
  }
  function enterFlight() {
    root.classList.remove('is-w2', 'is-next');
    root.classList.add('is-map', 'is-fly');
    endCard.classList.remove('on'); popup.classList.remove('on');
    track.style.height = '';
    scroller.scrollTop = 0; pv = 0; lineKey = '';
    smap.flightReset();
    kmLabel.textContent = 'NHA TRANG ▸';
    setParty(4); leftParty = 0;
    setJourney(0.5, 1);
    endUI('endcard');
    fit();
  }
  const FLY_LINES = [
    { at: 0.0, text: LN('fly_1') },
    { at: 0.1, text: LN('fly_2') },
    { at: 0.45, text: LN('fly_3') },
    { at: 0.84, text: LN('fly_4') },
  ];
  let leftParty = 0;
  const flyEvents = {
    arrive() { Sound.hiss(); popUI('popup_arrive_hn'); },
    leave() {},
  };
  function flyFrame(t, dt) {
    const r = smap.flightFrame(t, dt, pv, flyEvents);
    kmNum.textContent = Math.round(r.km).toLocaleString('en-US');
    setJourney(0.5 + 0.5 * r.k, r.k >= 0.999 ? 2 : 1);
    // cất cánh: từng người bạn rời nhóm
    const want = r.k > 0.015 ? 3 : 0;
    if (want > leftParty) {
      const i = leftParty++;
      setTimeout(() => { if (leftParty > i) { popUI('popup_party_leave', 3 - i); setParty(3 - i); } }, i * 700);
      if (i === 0) Sound.horn();
    } else if (want < leftParty) { leftParty = 0; setParty(4); }
    let li = 0;
    for (let i = 0; i < FLY_LINES.length; i++) if (pv + 0.0001 >= FLY_LINES[i].at) li = i;
    say('f' + li, FLY_LINES[li].text, li === FLY_LINES.length - 1 ? '' : 'SCROLL ▼');
    if (w3) {
      if (r.arrived && pv >= 0.9) { if (!arriveT) arriveT = t; if (t - arriveT > 0.9) zoomToW3(); }
      else arriveT = 0;
    } else endCard.classList.toggle('on', r.arrived && pv >= 0.97);
    scrollHint.classList.toggle('gone', pv > 0.03);
  }

  /* =========================================================
     Chuyến bay → World 3: zoom mạnh vào Hà Nội → cảnh mới hiện từ ô pixel thô mịn dần
     ========================================================= */
  function zoomToW3() {
    if (mode !== 'fly') return;
    mode = 'zoom3'; zoomT0 = performance.now() / 1000; arriveT = 0;
    Sound.hiss();
  }
  function zoom3Frame(t, dt) {
    const k = t - zoomT0;
    if (k < ZOOM_IN) { const e = k / ZOOM_IN; smap.flightFrame(t, dt, 1, flyEvents, Math.exp(e * e * 3.6)); return; }
    if (!root.classList.contains('is-w3')) { enterW3(); zoomCv.classList.add('on'); }
    const e = clamp((k - ZOOM_IN) / DEPIX);
    const block = Math.max(1, Math.round(96 * Math.pow(1 - e, 2.2)));
    const w = Math.max(1, Math.ceil(innerWidth / block)), h = Math.max(1, Math.ceil(innerHeight / block));
    if (zoomCv.width !== w || zoomCv.height !== h) { zoomCv.width = w; zoomCv.height = h; }
    const zctx = zoomCv.getContext('2d'); zctx.imageSmoothingEnabled = true;
    w3.drawFirst(zctx, w, h);
    w3.frame(t, dt, 0);
    if (e >= 1) { zoomCv.classList.remove('on'); mode = 'w3'; titleUI('title_w3'); }
  }
  function enterW3() {
    root.classList.remove('is-map', 'is-fly', 'is-w2', 'is-next');
    root.classList.add('is-w3');
    endCard.classList.remove('on'); popup.classList.remove('on');
    if (smap) smap.flightOff();
    track.style.height = w3.trackVh + 'vh';
    scroller.scrollTop = 0; pv = 0; lineKey = '';
    w3.reset(); setParty(1);
    setJourney(1, 2);
    fit();
  }

  /* =========================================================
     KẾT: khói phủ → về đúng căn phòng ở trang chủ (hiện tại) + bảng nhân vật
     ========================================================= */
  const sheet = document.querySelector('.sheet');
  async function homeEnding() {
    if (mode !== 'w3') return;
    mode = 'ending';
    retrigger(flash); Sound.clunk();                          // "tách" – chụp ảnh cưới
    await sleep(700);
    await Smoke.cover({ x: innerWidth / 2, y: innerHeight });
    running = false; Sound.stopIdle();
    root.hidden = true; document.body.classList.remove('in-story'); open = false;
    if (['#story', '#map', '#w2', '#fly', '#w3'].includes(location.hash)) history.pushState({}, '', location.pathname + location.search);
    showSheet();
    await Smoke.reveal();
    playSheet();
  }
  function showSheet() {
    if (!sheet) return;
    const ui = SC.ui;
    sheet.querySelector('.sheet__title').textContent = ui.sheet_title || 'CHARACTER SHEET';
    sheet.querySelector('.sheet__class').textContent = ui.sheet_class || '';
    sheet.querySelector('.sheet__quote').textContent = ui.sheet_quote || '';
    sheet.querySelector('.sheet__cta').textContent = ui.sheet_cta || "LET'S TALK";
    const vals = ui.sheet_values || {};
    sheet.querySelector('.sheet__stats').innerHTML = (ui.sheet_stats || []).map((k) =>
      `<li><span>${k}</span><b style="--v:${(vals[k] ?? 80) / 100}"><i></i></b><em>${vals[k] ?? 80}</em></li>`).join('');
    sheet.querySelectorAll('.sheet__line').forEach((p) => { p.textContent = ''; });
    sheet.classList.remove('play'); sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add('on'));
  }
  async function playSheet() {
    const ps = [...sheet.querySelectorAll('.sheet__line')];
    const keys = ['w3_16', 'w3_17', 'w3_18'];
    await sleep(300);
    const u = UIT('popup_family'); const bd = sheet.querySelector('.sheet__badge');
    bd.innerHTML = `<b>${u.title}</b> · ${u.sub}`;
    sheet.classList.add('play');
    for (let i = 0; i < ps.length; i++) {
      const text = LN(keys[i]);
      for (let n = 0; n <= text.length; n++) { ps[i].textContent = text.slice(0, n); await sleep(reduce ? 0 : 22); }
      await sleep(350);
    }
  }
  if (sheet) {
    sheet.querySelector('.sheet__close').addEventListener('click', () => { sheet.classList.remove('on'); setTimeout(() => { sheet.hidden = true; }, 300); });
    sheet.querySelector('.sheet__replay').addEventListener('click', () => { sheet.classList.remove('on'); sheet.hidden = true; openStory(null, {}); });
    sheet.querySelectorAll('a[href^="#"]:not(.sheet__replay)').forEach((a) => a.addEventListener('click', () => { sheet.classList.remove('on'); setTimeout(() => { sheet.hidden = true; }, 300); }));
  }

  function enterW2() {
    root.classList.remove('is-map', 'is-next');
    root.classList.add('is-w2');
    endCard.classList.remove('on');
    track.style.height = w2.trackVh + 'vh';
    scroller.scrollTop = 0; pv = 0; lineKey = '';
    w2.reset();
    setParty(1);
    setJourney(0.5, 1);
    endUI('endcard');
    fit();
  }

  async function rewind() {
    // quay lại ga: chớp trắng nhanh rồi đặt tàu về chỗ cũ
    retrigger(flash);
    await sleep(140);
    resetScene();
  }

  /* ---------- Vòng lặp chính của story ---------- */
  let running = false, pv = 0, lastT = 0;
  function progress() {
    const max = scroller.scrollHeight - scroller.clientHeight;
    return max > 0 ? scroller.scrollTop / max : 0;
  }

  function loop(now) {
    if (!running) return;
    const t = now / 1000;
    const dt = Math.min(0.05, t - (lastT || t)); lastT = t;
    const p = progress();
    pv += (p - pv) * Math.min(1, dt * 7);
    if (Math.abs(p - pv) < 0.0005) pv = p;
    if (mode === 'map') { mapFrame(t, dt); requestAnimationFrame(loop); return; }
    if (mode === 'zoom') { zoomFrame(t, dt); requestAnimationFrame(loop); return; }
    if (mode === 'unzoom') { unzoomFrame(t, dt); requestAnimationFrame(loop); return; }
    if (mode === 'fly') { flyFrame(t, dt); requestAnimationFrame(loop); return; }
    if (mode === 'zoom3') { zoom3Frame(t, dt); requestAnimationFrame(loop); return; }
    if (mode === 'w3' || mode === 'ending') { w3.frame(t, dt, pv); scrollHint.classList.toggle('gone', pv > 0.02); requestAnimationFrame(loop); return; }
    if (mode === 'w2out') { w2.frame(t, dt, pv); requestAnimationFrame(loop); return; }
    if (mode === 'w2') { w2.frame(t, dt, pv); scrollHint.classList.toggle('gone', pv > 0.02); requestAnimationFrame(loop); return; }

    // kích hoạt / tua lại cảnh tàu chạy
    if (mode === 'idle' && pv >= TRIGGER) {
      mode = 'depart'; tCut = t;
      Sound.horn();
      if (!reduce) retrigger(toot);
      popUI('popup_quest_start');
    } else if ((mode === 'depart' || mode === 'done') && pv < TRIGGER - 0.12) {
      rewind();
    }
    const tau = mode === 'idle' ? -1 : t - tCut;

    // ---------- camera ----------
    const camMax = Math.max(0, WORLD.w - VW / S);
    let cam = camMax * ease(clamp((pv - 0.25) / 0.3));
    if (mode !== 'idle') cam = camMax;   // tàu chạy → camera đứng yên, tàu khuất là chuyển cảnh luôn
    let shakeX = 0, shakeY = 0;
    if (!reduce && tau >= 0) {
      const jolt = tau > CUT.go && tau < CUT.go + 0.45 ? 1 - (tau - CUT.go) / 0.45 : 0;
      const rev = tau < CUT.go ? clamp(tau / CUT.go) * 0.6 : 0;
      const amp = 6 * jolt + 2 * rev;
      shakeX = Math.round(Math.sin(t * 61) * amp); shakeY = Math.round(Math.cos(t * 53) * amp * 0.6);
    }
    const oy = (VH - WORLD.h * S) / 2;
    world.style.transform = `translate(${(-cam * S + shakeX).toFixed(1)}px, ${(oy + shakeY).toFixed(1)}px) scale(${S})`;

    // ---------- đoàn tàu ----------
    const lead = tau >= 0 ? leadAt(tau) : 0;                       // quãng đường (thang log)
    const v = tau >= CUT.go ? CUT.accel * (tau - CUT.go) : 0;
    const sp01 = clamp(v / 1.1);
    const idleRumble = reduce ? 0 : (pv > 0.55 || tau >= 0) ? 0.006 : 0.003;
    const hum = lead < 0.002 ? Math.sin(t * 47) * idleRumble : 0;
    const boyOut = tau >= 0 ? clamp((tau - (CUT.go - CUT.boyIn)) / 0.3) : 0;   // Trung lùi vào trong toa
    const tr = drawTrain({ lead, t, hum, boyOut, moving: lead > 0.002, jolt: (i) => (tau >= 0 ? joltAt(tau, i) : 0) });

    // ---------- hiệu ứng ----------
    const chX = tr ? tr.chimney.x : 1374, chY = tr ? tr.chimney.y : 334;
    const bogies = tr ? tr.bogies : [];
    const sc = tr ? tr.chimney.h / 300 : 1;                         // hiệu ứng to dần theo phối cảnh
    // khói ống xả: lúc chờ thì phụt nhẹ, lúc kéo còi + tăng ga thì phụt dày & to
    const revving = tau >= 0 && tau < CUT.go + 3;
    const every = revving ? 0.06 : 0.16;
    if (tr && chX < WORLD.w && (t - lastPuff > every || Math.abs(chX - lastPuffX) > 20)) {
      lastPuff = t; lastPuffX = chX;
      addCloud({ x: chX + rand(-3, 3), y: chY, born: t, life: revving ? rand(1.8, 2.4) : rand(1.3, 1.8), r0: (revving ? rand(7, 10) : rand(4, 6)) * sc, grow: (revving ? 38 : 20) * sc,
        vx: rand(-30, -14) - sp01 * 60, vy: revving ? rand(-95, -70) : rand(-70, -52), pal: EXHAUST, drag: 0.6 });
    }
    // phụt khói đen khi nổ máy
    if (tr && tau >= 0.15 && !burstDone) {
      burstDone = true;
      for (let k = 0; k < 16; k++) addCloud({ x: chX + rand(-8, 8), y: chY - rand(0, 10), born: t, life: rand(1.4, 2.2), r0: rand(5, 9) * sc, grow: rand(26, 40) * sc, vx: rand(-110, 70), vy: rand(-260, -110), pal: k % 3 ? EXHAUST : DIESEL, drag: 1.8, hi: k % 3 !== 0 });
    }
    // xì hơi phanh dưới gầm toa
    if (tr && tau >= CUT.hiss && !steamDone) {
      steamDone = true; Sound.hiss();
      for (const b of bogies) {
        const k2 = b.h / 250;
        for (let k = 0; k < 5; k++) {
          const dir = k % 2 ? 1 : -1;
          addCloud({ x: b.x + dir * rand(0, 20), y: b.y - 14 * k2 + rand(-6, 6), born: t, life: rand(1, 1.6), r0: rand(7, 11) * k2, grow: rand(34, 50) * k2, vx: dir * rand(120, 300) * k2, vy: rand(-70, -15), pal: STEAM, drag: 2.6 });
        }
      }
    }
    // tiếng "cạch" khi từng toa giật
    if (tr) train.cars.slice(0, train.n).forEach((c) => {
      if (tau >= CUT.go + c.i * 0.11 && !clunked.has(c.i)) { clunked.add(c.i); Sound.clunk(); }
    });
    // tia lửa ở bánh lúc mới lăn bánh
    if (lead > 0.002 && sp01 < 0.7 && !reduce) {
      for (const b of bogies) {
        if (Math.random() < 0.5) sparks.push({ x: b.x, y: b.y, vx: rand(-260, -60), vy: rand(-260, -90), born: t, life: rand(0.25, 0.5), c: Math.random() < 0.5 ? '#fff3a0' : '#ffd23f' });
      }
    }
    // bụi bay sau gầm khi đã chạy nhanh
    if (sp01 > 0.25 && bogies.length && Math.random() < sp01 * 0.5) {
      const b = bogies[Math.floor(Math.random() * bogies.length)], k2 = b.h / 250;
      addCloud({ x: b.x - 30 * k2, y: b.y - 6, born: t, life: rand(0.7, 1.1), r0: rand(2, 4) * k2, grow: 14 * k2, vx: rand(-160, -60) * k2, vy: rand(-30, -10), pal: DUST, drag: 2, hi: false });
    }
    drawFx(t, dt);

    // âm thanh chạy tàu
    clackAcc += lead - lastLead;
    if (clackAcc > 0.07) { clackAcc = 0; if (lead < 5) Sound.clack(clamp(0.4 + sp01)); }
    Sound.setSpeed(tau >= 0 ? clamp(Math.max(sp01, tau < CUT.go ? tau / CUT.go * 0.5 : 0)) : 0);
    lastLead = lead;

    // ---------- vẫy tay (sprite sheet 6 frame, mỗi người một nhịp) ----------
    animate(dad, t, dad.fps);
    animate(mom, t, mom.fps);

    // ---------- HUD, hộp thoại, kết chương ----------
    setJourney(clamp(lead / 4) * 0.12, 0);
    scrollHint.classList.toggle('gone', pv > 0.03 || mode !== 'idle');
    if (mode === 'idle') {
      let li = 0;
      for (let i = 0; i < LINES.length; i++) if (pv + 0.0001 >= LINES[i].at) li = i;
      say('s' + li, LINES[li].text, LINES[li].more || 'SCROLL ▼');
    } else {
      let li = 0;
      for (let i = 0; i < CUT.lines.length; i++) if (tau >= CUT.lines[i].at) li = i;
      say('c' + li, CUT.lines[li].text, '');
      const gone = tr && tr.tail > cam + VW / S - 160;    // toa cuối sắp ra khỏi khung
      if (mode === 'depart' && (gone || tau >= CUT.end)) nextScreen();
    }

    // chữ TOOT TOOT bám theo đầu tàu
    toot.style.transform = `translate(${((chX - cam) * S + shakeX).toFixed(0)}px, ${((chY - 150) * S + oy).toFixed(0)}px)`;

    requestAnimationFrame(loop);
  }

  /* ---------- Mở / đóng story ---------- */
  let busy = false, open = false;
  const imgsReady = () => Promise.all([...root.querySelectorAll('img')].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));

  function syncSoundBtn() {
    const on = Sound.running && !Sound.muted;
    soundBtn.textContent = on ? '♪ SOUND ON' : (Sound.running ? '♪ SOUND OFF' : '♪ TAP FOR SOUND');
    soundBtn.classList.toggle('off', !on);
  }

  async function openStory(origin, { gesture = false, instant = false, map = false, world2 = false, fly = false, world3 = false } = {}) {
    if (busy || open) return;
    if (sheet && !sheet.hidden) { sheet.classList.remove('on', 'play'); sheet.hidden = true; }   // vào story thì đóng bảng nhân vật
    busy = true;
    if (gesture) { Sound.unlock(); if (!Sound.muted) Sound.horn(0.05); }
    if (instant) Smoke.fill(); else await Smoke.cover(origin);
    root.hidden = false;
    document.body.classList.add('in-story');
    if (!['#story', '#map', '#w2', '#fly', '#w3'].includes(location.hash)) history.pushState({ story: 1 }, '', '#story');
    scroller.scrollTop = 0; pv = 0; resetScene();
    fit();
    await imgsReady();
    running = true; lastT = 0; requestAnimationFrame(loop);
    if (Sound.running) Sound.startIdle();
    syncSoundBtn();
    open = true;
    titleCard.classList.remove('on'); void titleCard.offsetWidth;
    if (world3 && w3) { enterW3(); mode = 'w3'; }
    else if (fly && smap) { enterFlight(); mode = 'fly'; }
    else if (world2 && w2) { enterW2(); mode = 'w2'; }
    else if (map && smap) enterMap();
    await Smoke.reveal();
    if (world3 && w3) titleUI('title_w3');
    else if (fly && smap) titleUI('title_fly');
    else if (world2 && w2) titleUI('title_w2');
    else if (map && smap) titleUI('title_map');
    else titleUI('title_w1');
    busy = false;
  }

  async function closeStory({ fromPop = false } = {}) {
    if (busy || !open) return;
    busy = true;
    await Smoke.cover({ x: innerWidth / 2, y: innerHeight });
    running = false;
    Sound.stopIdle();
    root.hidden = true;
    document.body.classList.remove('in-story');
    if (!fromPop && ['#story', '#map', '#w2', '#fly', '#w3'].includes(location.hash)) history.pushState({}, '', location.pathname + location.search);
    open = false;
    await Smoke.reveal();
    busy = false;
  }

  /* ---------- Nút & sự kiện ---------- */
  soundBtn.addEventListener('click', () => {
    if (!Sound.running) { Sound.unlock(); Sound.setMuted(false); Sound.startIdle(); }
    else { Sound.setMuted(!Sound.muted); if (!Sound.muted) Sound.startIdle(); }
    syncSoundBtn();
  });
  // click bất kỳ trong story cũng mở khoá âm thanh (trình duyệt chặn tự phát)
  root.addEventListener('pointerdown', () => {
    if (!Sound.running && !Sound.muted) { Sound.unlock(); Sound.startIdle(); setTimeout(syncSoundBtn, 50); }
  });
  root.querySelectorAll('[data-home]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); closeStory(); }));
  $('.end-card__replay', root).addEventListener('click', async () => {
    await Smoke.cover({ x: innerWidth / 2, y: innerHeight });
    scroller.scrollTop = 0; pv = 0; resetScene();
    if (['#map', '#w2', '#fly', '#w3'].includes(location.hash)) history.replaceState({ story: 1 }, '', '#story');
    await Smoke.reveal();
    titleUI('title_w1');
  });
  addEventListener('keydown', (e) => { if (open && e.key === 'Escape') closeStory(); });

  // Cửa vào từ trang chủ: ảnh cưới, nav "MY STORY" → khói bốc lên từ ly trà
  const cupPoint = () => {
    const s = document.getElementById('steam');
    if (!s) return { x: innerWidth / 2, y: innerHeight };
    const r = s.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.bottom };
  };
  document.querySelectorAll('a[href="#story"]').forEach((a) => {
    if (root.contains(a)) return;
    a.addEventListener('click', (e) => { e.preventDefault(); openStory(cupPoint(), { gesture: true }); });
  });
  // Lăn chuột / vuốt lên ở trang chủ = bắt đầu phiêu lưu
  const home = document.querySelector('.viewport');
  let wheelAcc = 0;
  const sheetOpen = () => sheet && !sheet.hidden;
  home.addEventListener('wheel', (e) => {
    if (open || busy || sheetOpen()) { wheelAcc = 0; return; }
    wheelAcc = Math.max(0, wheelAcc + e.deltaY);
    if (wheelAcc > 120) { wheelAcc = 0; openStory(cupPoint()); }
  }, { passive: true });
  let touchY = null;
  home.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  home.addEventListener('touchend', (e) => {
    if (touchY != null && !sheetOpen() && touchY - e.changedTouches[0].clientY > 60) openStory(cupPoint(), { gesture: true });
    touchY = null;
  });
  addEventListener('popstate', () => {
    if (location.hash === '#story') openStory(cupPoint());
    else if (open) closeStory({ fromPop: true });
  });

  // Vào thẳng bằng link …/#story
  if (['#story', '#map', '#w2', '#fly', '#w3'].includes(location.hash)) openStory(null, { instant: true, map: location.hash === '#map', world2: location.hash === '#w2', fly: location.hash === '#fly', world3: location.hash === '#w3' });
  else {
    // tải trước ảnh story khi trang chủ đã rảnh
    const pre = () => root.querySelectorAll('img').forEach((im) => im.decode && im.decode().catch(() => {}));
    ('requestIdleCallback' in window) ? requestIdleCallback(pre, { timeout: 3000 }) : setTimeout(pre, 2000);
  }

  fit();
  window.__story = { open: openStory, close: closeStory, get pv() { return pv; } };
})();
