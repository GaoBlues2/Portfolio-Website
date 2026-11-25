/* =========================================================
   Trang chủ – bàn làm việc pixel
   Toạ độ mọi thứ tính theo ảnh gốc 1672 x 941
   ========================================================= */
(() => {
  const STAGE_W = 1672, STAGE_H = 941;          // vùng ảnh gốc (scene)
  // Ảnh nền mở rộng: kích thước & vị trí của scene bên trong nó
  const WIDE = { w: 2060, h: 941, ox: 194, oy: 0 };
  const root = document.documentElement.style;
  root.setProperty('--sw', WIDE.w + 'px'); root.setProperty('--sh', WIDE.h + 'px');
  root.setProperty('--ox', WIDE.ox + 'px'); root.setProperty('--oy', WIDE.oy + 'px');
  const stage = document.getElementById('scene');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Scale stage phủ kín màn hình ---------- */
  function fit() {
    // Phủ kín màn hình bằng ảnh nền mở rộng 2060x941 (≈ 2.2:1).
    // Thừa chiều dọc thì cắt ở sàn; thừa chiều ngang thì cắt đều hai bên.
    const W = innerWidth, H = innerHeight;
    const s = Math.max(W / WIDE.w, H / WIDE.h);
    root.setProperty('--s', s);
    root.setProperty('--ty', '0px');
  }
  addEventListener('resize', fit);
  fit();

  const loadImg = (src) => new Promise((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
  });

  /* =========================================================
     1. RÈM CỬA – cắt ảnh thành từng dải ngang, mỗi dải lệch
        theo sóng sin + gió giật → vải bay mềm, đỉnh rèm cố định
     ========================================================= */
  const curtains = [
    // x,y = điểm treo (góc trên trái), h = chiều cao rèm, out = hướng gió đẩy gấu rèm ra (-1 trái, 1 phải)
    { el: document.getElementById('curtainL'), src: 'assets/curtain_l.png?v=5', x: 40, y: 28, h: 575, out: -1, ph: 0.0, lag: 0, amp: 1 },
    { el: document.getElementById('curtainR'), src: 'assets/curtain_r.png?v=5', x: 718, y: 28, h: 575, out: 1, ph: 2.7, lag: 0.7, amp: 0.85 },
  ];
  const MARGIN = 70;          // chỗ trống hai bên để gấu rèm bay ra
  const CURTAIN_ALPHA = 0.86; // rèm voan mỏng, nhìn xuyên được
  let RES = 1;                // độ phân giải canvas so với toạ độ stage

  async function initCurtains() {
    RES = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s') || 1)));
    for (const c of curtains) {
      c.img = c.img || await loadImg(c.src);
      c.w = c.img.width * (c.h / c.img.height);
      c.cw = Math.ceil(c.w + MARGIN * 2);
      c.ch = Math.ceil(c.h + 10);
      c.el.width = Math.ceil(c.cw * RES);
      c.el.height = Math.ceil(c.ch * RES);
      Object.assign(c.el.style, { left: c.x - MARGIN + 'px', top: c.y + 'px', width: c.cw + 'px', height: c.ch + 'px' });
      c.el.style.opacity = CURTAIN_ALPHA; // trong suốt áp cho cả tấm, tránh sọc do các dải chồng nhau
      c.ctx = c.el.getContext('2d');
      // lớp phụ: ảnh rèm đã thu nhỏ + tô nếp gấp, rồi mới uốn
      c.buf = c.buf || document.createElement('canvas');
      c.buf.width = Math.ceil(c.w * RES); c.buf.height = Math.ceil(c.h * RES);
      c.bctx = c.buf.getContext('2d');
    }
  }
  addEventListener('resize', () => { if (curtains[0].ctx) { initCurtains(); initPhoto(); } });

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v) => v * v * (3 - 2 * v);
  // Gió: có những quãng lặng hẳn rồi mới có cơn thổi, chu kỳ dài & không đều
  const wind = (t, ph) => {
    const a = 0.5 + 0.5 * Math.sin(t * 0.21 + ph);
    const b = 0.5 + 0.5 * Math.sin(t * 0.083 + ph * 1.9);
    const c = 0.5 + 0.5 * Math.sin(t * 0.47 + ph * 0.7);
    return smooth(clamp01((a * 0.65 + b * 0.35) * (0.75 + 0.25 * c) * 1.35 - 0.25));
  };

  function drawCurtain(c, t) {
    const { ctx, bctx, buf, img, w, h, out, ph } = c;
    const e = wind(t - c.lag, 0); // cùng một cơn gió, rèm phải đón gió trễ hơn chút
    // 1) vẽ rèm vào lớp phụ + nếp gấp sáng/tối mở ra khép lại theo gió
    bctx.setTransform(RES, 0, 0, RES, 0, 0);
    bctx.clearRect(0, 0, w, h);
    bctx.globalCompositeOperation = 'source-over';
    bctx.imageSmoothingEnabled = true;
    bctx.drawImage(img, 0, 0, w, h);
    bctx.globalCompositeOperation = 'source-atop';
    const FOLDS = 4;
    for (let i = 0; i < FOLDS; i++) {
      const k = Math.sin(t * 0.55 + i * 1.7 + ph) * (0.35 + 0.65 * e);
      const x0 = (i / FOLDS) * w, bw = w / FOLDS;
      const g = bctx.createLinearGradient(x0, 0, x0 + bw, 0);
      const col = k > 0 ? '255,255,250' : '120,80,40';
      const a = Math.abs(k) * (k > 0 ? 0.1 : 0.08);
      g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`);
      bctx.fillStyle = g; bctx.fillRect(x0, 0, bw, h);
    }

    // 2) uốn từng dải 1px: đỉnh cố định, càng xuống càng bay; gấu rèm phồng & hơi nhấc lên khi gió mạnh
    ctx.setTransform(RES, 0, 0, RES, 0, 0);
    ctx.clearRect(0, 0, c.cw, c.ch);
    ctx.imageSmoothingEnabled = true;
    const STRIP = 1;
    const lift = 0.06 * e;                        // gấu rèm nhấc lên tối đa 6%
    for (let y = 0; y < h; y += STRIP) {
      const p = y / h;
      const sway = out * 20 * (c.amp || 1) * e * Math.pow(p, 1.8);                                  // gió đẩy gấu rèm ra ngoài
      const ripple = (2.5 + 9 * e) * Math.pow(p, 1.4) * Math.sin(t * 0.9 + ph - 6.2 * p); // sóng chạy dọc tấm vải
      const flutter = (0.6 + 2.2 * e) * p * Math.sin(t * 1.9 + ph * 1.3 - 13 * p);      // rung nhẹ ở mép
      const dx = sway + ripple + flutter;
      const widen = 1 + 0.2 * (c.amp || 1) * e * Math.pow(p, 1.6) + 0.035 * p * Math.sin(t * 1.1 - 5 * p + ph);
      const sw = w * widen;
      // phồng về phía gió thổi tới (mép trong giữ, mép ngoài bung ra)
      const x = MARGIN + dx - (out > 0 ? 0 : sw - w);
      const dy = y * (1 - lift * p);
      ctx.drawImage(buf, 0, y * RES, buf.width, STRIP * RES, x, dy, sw, STRIP + 0.6);
    }
  }

  /* =========================================================
     2. KHÓI TRÀ – vài sợi khói làm từ ô pixel, uốn lượn bay lên
     ========================================================= */
  const steam = document.getElementById('steam');
  const sctx = steam.getContext('2d');
  steam.width = 110; steam.height = 150;
  // Hơi nước: các "cụm" khói mềm bay lên, phình to, uốn lượn rồi tan dần
  const puffs = [];
  const CUP_X = 55, CUP_Y = 146;           // miệng ly trong canvas
  let lastSpawn = 0;
  function drawSteam(t) {
    const W = steam.width, H = steam.height;
    sctx.clearRect(0, 0, W, H);
    if (t - lastSpawn > 0.16) {              // ~6 cụm/giây
      lastSpawn = t;
      puffs.push({ born: t, x0: CUP_X + rand(-12, 12), life: rand(2.6, 3.6), seed: rand(0, 6.28), drift: rand(-6, 6) });
    }
    for (let i = puffs.length - 1; i >= 0; i--) {
      const p = puffs[i];
      const a = (t - p.born) / p.life;       // 0 → 1
      if (a >= 1) { puffs.splice(i, 1); continue; }
      const y = CUP_Y - a * 135;
      const x = p.x0 + p.drift * a + Math.sin(t * 1.3 + p.seed + a * 5) * (2 + 9 * a);
      const r = 4 + 12 * a;
      const alpha = 0.6 * Math.sin(Math.PI * Math.min(1, a * 1.15)) * (1 - a * 0.4);
      const g = sctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,252,246,${alpha.toFixed(3)})`);
      g.addColorStop(1, 'rgba(255,252,246,0)');
      sctx.fillStyle = g;
      sctx.beginPath(); sctx.arc(x, y, r, 0, Math.PI * 2); sctx.fill();
    }
  }

  /* =========================================================
     3. MÈO – thỉnh thoảng phe phẩy đuôi
     ========================================================= */
  const catEl = document.getElementById('cat');
  const catBody = document.createElement('div');
  catBody.className = 'body';
  catEl.appendChild(catBody);
  const catFrames = [0, 1, 2, 3].map((i) => {
    const im = document.createElement('img');
    im.src = `assets/cat_${i}.png`; im.alt = '';
    catBody.appendChild(im);
    return im;
  });
  let catBusy = false;
  const showCat = (i) => catFrames.forEach((f, j) => f.classList.toggle('on', i === j));
  showCat(0);

  async function tailFlick(times = 1, speed = 170) {
    if (catBusy) return; catBusy = true;
    for (let n = 0; n < times; n++) {
      for (const f of [1, 2, 3, 2, 1, 0]) { showCat(f); await sleep(speed); }
    }
    catBusy = false;
  }
  async function catLoop() {
    while (true) {
      await sleep(rand(3500, 8000));
      await tailFlick(Math.random() < 0.35 ? 2 : 1);
    }
  }

  // Click vào mèo: đuôi vẫy nhanh + bong bóng "mrrp?"
  document.querySelector('.hot--cat').addEventListener('click', async () => {
    const b = document.createElement('div');
    b.className = 'meow'; b.textContent = ['mrrp?', 'meow~', '...purr', '5 more minutes'][Math.floor(Math.random() * 4)];
    stage.appendChild(b);
    setTimeout(() => b.remove(), 1800);
    tailFlick(2, 110);
  });

  /* =========================================================
     4. ẢNH CƯỚI
        - photo_base: ảnh tĩnh (không có voan)
        - photo_veil: lớp voan tách riêng → uốn theo cùng cơn gió với rèm
        - photo_laugh / photo_cover: miếng vá chỉ vùng mặt + tay,
          bật/tắt tức thì nên không bao giờ bị chồng hình
     ========================================================= */
  const photoEl = document.getElementById('photo');
  const PW = 210, PH = 180;                 // kích thước khung ảnh trên stage
  const photo = { canvas: document.createElement('canvas'), state: 'smile' };
  photoEl.appendChild(photo.canvas);
  Object.assign(photo.canvas.style, { width: '100%', height: '100%', display: 'block' });
  const VEIL_TOP = 0.355;                    // voan bắt đầu từ búi tóc (tỉ lệ theo chiều cao ảnh)

  async function initPhoto() {
    const [base, veil, laugh, cover] = await Promise.all(
      ['photo_base', 'photo_veil', 'photo_laugh', 'photo_cover'].map((n) => loadImg(`assets/${n}.png?v=5`)));
    Object.assign(photo, { base, veil, laugh, cover });
    const r = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s') || 1)));
    photo.canvas.width = Math.round(PW * r); photo.canvas.height = Math.round(PH * r);
    photo.ctx = photo.canvas.getContext('2d');
    photo.r = r;
  }

  // độ hiện của từng biểu cảm (0..1), chạy mượt về đích → không bật/tắt giật cục
  const mood = { laugh: 0, cover: 0 };
  let lastT = 0;
  function drawPhoto(t) {
    const { ctx, base, veil } = photo;
    if (!ctx) return;
    const dt = Math.min(0.1, t - lastT); lastT = t;
    const target = { laugh: photo.state === 'laugh' || photo.state === 'cover' ? 1 : 0, cover: photo.state === 'cover' ? 1 : 0 };
    for (const k in mood) {
      const d = target[k] - mood[k];
      mood[k] += Math.sign(d) * Math.min(Math.abs(d), dt / 0.18); // ~0.18s mỗi lần chuyển
    }
    const W = photo.canvas.width, H = photo.canvas.height;
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(base, 0, 0, W, H);
    const ease = (v) => v * v * (3 - 2 * v);
    if (mood.laugh > 0) { ctx.globalAlpha = ease(mood.laugh); ctx.drawImage(photo.laugh, 0, 0, W, H); }
    if (mood.cover > 0) { ctx.globalAlpha = ease(mood.cover); ctx.drawImage(photo.cover, 0, 0, W, H); }
    ctx.globalAlpha = 1;
    // voan: phần trên (búi tóc) đứng yên, phần dưới uốn theo gió.
    // Vẽ từng hàng ĐÚNG 1px thiết bị, không chồng lên nhau → không nhấp nháy sọc
    const e = wind(t - 0.3, 0);
    const vy0 = Math.round(H * VEIL_TOP);
    ctx.drawImage(veil, 0, 0, veil.width, veil.height * (vy0 / H), 0, 0, W, vy0);
    const sh = veil.height / H, r = photo.r;
    for (let y = vy0; y < H; y++) {
      const p = (y - vy0) / (H - vy0);
      const dx = r * (
        (0.5 + 1.7 * e) * Math.pow(p, 1.3) * Math.sin(t * 0.8 - 3.6 * p) +   // sóng chạy dọc tấm voan
        1.5 * e * Math.pow(p, 1.6) +                                            // gió đẩy voan sang phải
        0.2 * p * Math.sin(t * 1.7 - 8 * p));                                  // gợn nhỏ
      ctx.drawImage(veil, 0, y * sh, veil.width, sh, dx, y, W, 1);
    }
  }

  // Kịch bản: cười nhẹ là chính; thỉnh thoảng cười tít mắt, rồi vợ đưa tay che miệng
  async function photoLoop() {
    await sleep(rand(3000, 5000));
    while (true) {
      photo.state = 'laugh'; await sleep(rand(900, 1300));
      if (Math.random() < 0.75) { photo.state = 'cover'; await sleep(rand(1400, 2000)); photo.state = 'laugh'; await sleep(500); }
      photo.state = 'smile';
      await sleep(rand(7000, 12000));
    }
  }

  /* =========================================================
     5. NHÃN + ĐƯỜNG CHẤM NỐI VÀO ĐỒ VẬT
     ========================================================= */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'links');
  svg.setAttribute('viewBox', `0 0 ${STAGE_W} ${STAGE_H}`);
  stage.insertBefore(svg, document.querySelector('.tag'));

  function drawLinks() {
    svg.innerHTML = '';
    document.querySelectorAll('.tag').forEach((tag) => {
      const cs = getComputedStyle(tag);
      const dx = parseFloat(cs.getPropertyValue('--dx'));
      const dy = parseFloat(cs.getPropertyValue('--dy'));
      const bx = tag.offsetLeft, by = tag.offsetTop, bw = tag.offsetWidth, bh = tag.offsetHeight;
      // điểm gần nhất trên hộp nhãn
      const corners = [[bx + 10, by + bh], [bx + bw - 10, by + bh], [bx + 10, by], [bx + bw - 10, by], [bx, by + bh / 2], [bx + bw, by + bh / 2]];
      const [ex, ey] = corners.reduce((best, c) => (Math.hypot(c[0] - dx, c[1] - dy) < Math.hypot(best[0] - dx, best[1] - dy) ? c : best));
      const line = document.createElementNS(SVGNS, 'line');
      Object.entries({ x1: dx, y1: dy, x2: ex, y2: ey, stroke: '#2a1a10', 'stroke-width': 3 }).forEach(([k, v]) => line.setAttribute(k, v));
      const dot = document.createElementNS(SVGNS, 'circle');
      Object.entries({ cx: dx, cy: dy, r: 6, fill: '#f6efe2', stroke: '#2a1a10', 'stroke-width': 3 }).forEach(([k, v]) => dot.setAttribute(k, v));
      dot.dataset.for = tag.dataset.for;
      svg.append(line, dot);
    });
  }
  document.fonts.ready.then(drawLinks);
  drawLinks();

  // Rê chuột vào đồ vật → nhãn sáng lên
  document.querySelectorAll('.hot').forEach((h) => {
    const tag = document.querySelector(`.tag[data-for="${h.dataset.label}"]`);
    const obj = h.dataset.label === 'work' ? document.querySelector('.console') : null;   // đồ vật sáng theo
    const on = () => { tag && tag.classList.add('lit'); obj && obj.classList.add('lit'); };
    const off = () => { tag && tag.classList.remove('lit'); obj && obj.classList.remove('lit'); };
    h.addEventListener('mouseenter', on); h.addEventListener('mouseleave', off);
    h.addEventListener('focus', on); h.addEventListener('blur', off);
  });

  /* =========================================================
     Vòng lặp chính
     ========================================================= */
  Promise.all([initCurtains(), initPhoto()]).then(() => {
    const t0 = performance.now() - (+new URLSearchParams(location.search).get('t') || 0) * 1000; // ?t=30 để test
    const frame = (now) => {
      const t = (now - t0) / 1000;
      const bc = document.body.classList;
      if (!bc.contains('in-story') && !(bc.contains('about-open') && !bc.contains('about-anim'))) {   // đang ở MY STORY / menu ABOUT (trang chủ đã mờ) thì tạm nghỉ vẽ trang chủ
        curtains.forEach((c) => drawCurtain(c, t));
        drawSteam(t);
        drawPhoto(t);
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  /* ---------- Avatar chớp mắt ---------- */
  const av = document.querySelector('.nav__avatar');
  async function blinkLoop() {
    while (true) {
      await sleep(rand(2500, 5500));
      const times = Math.random() < 0.25 ? 2 : 1;      // thỉnh thoảng chớp 2 lần liền
      for (let i = 0; i < times; i++) {
        av.classList.add('closed'); await sleep(110);
        av.classList.remove('closed'); if (i < times - 1) await sleep(140);
      }
    }
  }

  if (!reduceMotion) { catLoop(); photoLoop(); blinkLoop(); }
})();
