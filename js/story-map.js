/* =========================================================
   MY STORY – Màn bản đồ: Ninh Bình → Nha Trang
   Nền: assets/story/m_base.png (pixel art sinh từ Natural Earth 10m, đúng hình dạng,
   có Hoàng Sa, Trường Sa). Đường ray = tuyến Bắc–Nam thật. Scroll → đoàn tàu chạy.
   Toạ độ = px của ảnh nền (W x H trong MAP_DATA). Canvas hiệu ứng = 2x độ phân giải nền.
   Gọi từ story.js: StoryMap.create({ root, drawClouds, Sound, clamp, ease })
   ========================================================= */
window.StoryMap = (() => {
  function create({ root, drawClouds, Sound, clamp, ease }) {
    const D = window.MAP_DATA;
    const FX = 2;
    const rand = (a, b) => a + Math.random() * (b - a);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const box = root.querySelector('.map');
    const mw = root.querySelector('.map__world');
    const base = root.querySelector('.map__base');
    const rail = root.querySelector('.map__rail');
    const fx = root.querySelector('.map__fx');
    const sky = root.querySelector('.map__sky');      // mây (1x, nằm trên tàu)
    const air = root.querySelector('.map__air');      // máy bay + vệt khói (2x, nằm trên mây)
    const labelsBox = root.querySelector('.map__labels');
    base.src = 'assets/story/m_base.png?v=1';
    for (const el of [mw, base, rail]) { el.style.width = D.W + 'px'; el.style.height = D.H + 'px'; }
    for (const c of [fx, sky, air]) { c.style.width = D.W + 'px'; c.style.height = D.H + 'px'; }
    air.width = D.W * FX; air.height = D.H * FX;
    const actx = air.getContext('2d');
    rail.width = D.W; rail.height = D.H;
    fx.width = D.W * FX; fx.height = D.H * FX;
    const rctx = rail.getContext('2d');
    const fctx = fx.getContext('2d');

    /* ---------- tuyến đường: độ dài theo px ---------- */
    const R = D.route;
    const len = [0];
    for (let i = 1; i < R.length; i++) len.push(len[i - 1] + Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]));
    const TOTAL = len[len.length - 1];
    function posAt(d) {
      if (d <= 0) {           // trước ga đầu: kéo dài theo hướng đoạn đầu (đuôi tàu không bị dồn cục)
        const [a, b] = [R[0], R[1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
        return [a[0] + (b[0] - a[0]) / l * d, a[1] + (b[1] - a[1]) / l * d];
      }
      if (d >= TOTAL) return R[R.length - 1].slice();
      let lo = 0, hi = len.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (len[m] <= d) lo = m; else hi = m; }
      const k = (d - len[lo]) / (len[hi] - len[lo] || 1);
      return [R[lo][0] + (R[hi][0] - R[lo][0]) * k, R[lo][1] + (R[hi][1] - R[lo][1]) * k];
    }
    // km "cách nhà" (đường chim bay từ Ninh Bình) theo vị trí trên tuyến
    function homeKm(d) {
      const f = clamp(d / TOTAL);
      // nội suy theo các điểm tuyến (D.home tính sẵn bằng haversine)
      let lo = 0, hi = len.length - 1;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (len[m] <= f * TOTAL) lo = m; else hi = m; }
      const k = (f * TOTAL - len[lo]) / (len[hi] - len[lo] || 1);
      return D.home[lo] + (D.home[hi] - D.home[lo]) * k;
    }

    /* ---------- đường ray pixel (canvas nền 1x): tà vẹt + ray, phần đã đi tô cam ---------- */
    const pix = [];   // danh sách pixel ray theo thứ tự đi: {x,y,d}
    {
      const seen = new Set();
      for (let d = 0; d <= TOTAL; d += 0.35) {
        const [x, y] = posAt(d), X = Math.round(x), Y = Math.round(y), key = X + ',' + Y;
        if (seen.has(key)) continue;
        seen.add(key); pix.push({ x: X, y: Y, d });
      }
      // tà vẹt: mỗi 3px một thanh vuông góc
      rctx.fillStyle = '#5a3418';
      let next = 0;
      for (let d = 0; d <= TOTAL; d += 0.5) {
        if (d < next) continue;
        next = d + 3;
        const [x0, y0] = posAt(d - 0.5), [x1, y1] = posAt(d + 0.5);
        const l = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
        const [x, y] = posAt(d);
        for (const s of [-1, 1]) rctx.fillRect(Math.round(x + nx * s), Math.round(y + ny * s), 1, 1);
      }
    }
    const RAIL = '#7a4422', DONE = '#ffd23f';
    let drawnUpto = -1;     // chỉ số pixel cuối đã tô "đã đi"
    function paintRail(upto) {
      if (upto === drawnUpto) return;
      const a = Math.min(upto, drawnUpto) + 1, b = Math.max(upto, drawnUpto);
      for (let i = Math.max(0, a); i <= Math.min(pix.length - 1, b); i++) {
        rctx.fillStyle = i <= upto ? DONE : RAIL;
        rctx.fillRect(pix[i].x, pix[i].y, 1, 1);
      }
      drawnUpto = upto;
    }
    paintRail(-1); drawnUpto = -1;
    for (const p of pix) { rctx.fillStyle = RAIL; rctx.fillRect(p.x, p.y, 1, 1); }

    /* ---------- nhãn HTML (đặt theo toạ độ màn hình mỗi frame) ---------- */
    const labels = [];
    for (const c of D.cities) {
      const el = document.createElement('div');
      el.className = 'mpin mpin--' + (c.kind || 'stop');
      el.innerHTML = `<i></i><span>${c.name}</span>`;
      if (c.kind === 'start') el.innerHTML = '<i></i><span><small>HOME</small>NINH BÌNH</span>';
      if (c.kind === 'cap') el.innerHTML = '<i>★</i><span>HÀ NỘI</span>';
      labelsBox.appendChild(el);
      labels.push({ el, p: c.p, s: c.s, kind: c.kind, on: false });
    }
    for (const l of D.labels) {
      const el = document.createElement('div');
      el.className = 'mlabel' + (l.sea ? ' mlabel--sea' : '');
      el.innerHTML = l.sea ? l.name : `<b>QĐ. ${l.name}</b><span>${l.sub}</span>`;
      labelsBox.appendChild(el);
      labels.push({ el, p: l.p, s: null });
    }

    /* ---------- đoàn tàu nhìn từ trên xuống, vẽ từng pixel (xoay kiểu nearest → giữ nét pixel) ---------- */
    const INK = '#2a1a10';
    const CARS = [
      { L: 22, Wd: 11, pat: (u, v, L, Wd) => {
        if (u < 1 || u >= L - 1 || v < 1 || v >= Wd - 1) return INK;
        if (u >= L - 5 && u < L - 2 && v >= 2 && v < Wd - 2) return v === 2 || u === L - 3 && v === 3 ? '#bfe6f2' : '#35576b';   // kính lái
        if (u >= L - 9 && u < L - 7 && v >= 4 && v < 7) return u === L - 9 && v === 4 ? '#6b5440' : INK;            // ống xả
        if (v >= 3 && v < 8 && u >= 3 && u < L - 10) return u % 4 === 1 ? '#e8dcc6' : '#f6efe2';      // nóc kem
        if (v >= Wd - 2) return '#b8461a';
        if (v < 2) return '#ff8f5a';
        return '#f26a2e';
      } },
      { L: 20, Wd: 11, pat: (u, v, L, Wd) => {
        if (u < 1 || u >= L - 1 || v < 1 || v >= Wd - 1) return INK;
        if (v === 1) return '#ff8f5a';
        if (v === Wd - 2) return '#b8461a';
        if (v === 2 || v === Wd - 3) return '#f26a2e';
        if (v === 5 && u % 5 === 2) return '#a89a84';
        if ((v === 3 || v === Wd - 4) && u % 4 === 2 && u > 2 && u < L - 3) return '#cfe9f2';   // cửa sổ nhìn qua mép nóc
        return '#efe3c8';
      } },
    ];
    const CONSIST = [CARS[0], CARS[1], CARS[1]];
    const GAP = 2;   // px FX

    let dirty = null;
    const grow = (x0, y0, x1, y1) => {
      if (!dirty) dirty = [x0, y0, x1, y1];
      else { dirty[0] = Math.min(dirty[0], x0); dirty[1] = Math.min(dirty[1], y0); dirty[2] = Math.max(dirty[2], x1); dirty[3] = Math.max(dirty[3], y1); }
    };

    function drawCar(car, front, back, bob) {
      const dx = front[0] - back[0], dy = front[1] - back[1], l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
      const cx = (front[0] + back[0]) / 2, cy = (front[1] + back[1]) / 2 + bob;
      const r = Math.ceil(car.L / 2 + car.Wd / 2) + 2;
      const x0 = Math.floor(cx - r), y0 = Math.floor(cy - r), x1 = Math.ceil(cx + r), y1 = Math.ceil(cy + r);
      grow(x0, y0, x1 + 3, y1 + 3);
      const bx = cx - ux * car.L / 2 - nx * car.Wd / 2, by = cy - uy * car.L / 2 - ny * car.Wd / 2;
      const cols = [];
      for (let Y = y0; Y <= y1; Y++) for (let X = x0; X <= x1; X++) {
        const px = X + 0.5 - bx, py = Y + 0.5 - by;
        const u = Math.floor(px * ux + py * uy), v = Math.floor(px * nx + py * ny);
        if (u < 0 || u >= car.L || v < 0 || v >= car.Wd) continue;
        cols.push(X, Y, car.pat(u, v, car.L, car.Wd));
      }
      fctx.fillStyle = 'rgba(16,36,60,.35)';                 // bóng đổ
      for (let i = 0; i < cols.length; i += 3) fctx.fillRect(cols[i] + 2, cols[i + 1] + 2, 1, 1);
      for (let i = 0; i < cols.length; i += 3) { fctx.fillStyle = cols[i + 2]; fctx.fillRect(cols[i], cols[i + 1], 1, 1); }
      return { ux, uy, cx, cy };
    }

    /* ---------- khói đầu máy ---------- */
    const puffs = [];
    const SMOKE = { ink: '#7d7671', shade: '#cfcac4', body: '#f3f0ec', hi: '#ffffff' };
    let lastPuff = 0, lastD = 0, clackAcc = 0;

    /* ---------- mây bay trên bản đồ: 6 sprite ChatGPT vẽ (assets/story/m_clouds.png), bóng mờ in xuống đất,
       trôi theo gió đông bắc → tây nam, quay vòng trong khung VN ---------- */
    const P0 = (lon, lat) => [(lon - 80) * Math.cos(15 * Math.PI / 180) / 0.04, (32 - lat) / 0.04];
    const [cx0, cy0] = P0(99.5, 25.5), [cx1, cy1] = P0(119, 5);
    const CL_SRC = 'assets/story/m_clouds.png?v=1', CL_W = 1776, CL_H = 313;
    const CL_RECTS = [[0, 0, 165, 143], [169, 0, 280, 199], [453, 0, 382, 313], [839, 0, 242, 227], [1085, 0, 401, 198], [1490, 0, 282, 240]];
    const clouds = [];
    for (let i = 0; i < 15; i++) {
      const r = CL_RECTS[i % CL_RECTS.length], k = rand(0.1, 0.15);        // tỉ lệ sprite → px bản đồ
      const w = r[2] * k, h = r[3] * k;
      const mk = (cls) => {
        const el = document.createElement('div');
        el.className = cls;
        Object.assign(el.style, { width: w + 'px', height: h + 'px', backgroundImage: `url(${CL_SRC})`,
          backgroundSize: `${CL_W * k}px ${CL_H * k}px`, backgroundPosition: `${-r[0] * k}px ${-r[1] * k}px` });
        sky.appendChild(el); return el;
      };
      const sh = mk('mcloud mcloud--sh'), el = mk('mcloud');
      clouds.push({ x: rand(cx0, cx1), y: rand(cy0, cy1), w, h, v: rand(3, 6.5), el, sh });
    }
    let skyT = 0;
    function drawSky(t) {
      const dt = skyT ? Math.min(0.1, t - skyT) : 0; skyT = t;
      for (const c of clouds) {
        if (!reduce) { c.x -= c.v * dt * 0.8; c.y += c.v * dt * 0.35; }
        if (c.x < cx0 - c.w) { c.x = cx1; c.y = rand(cy0, cy1); }
        if (c.y > cy1) { c.y = cy0 - c.h; c.x = rand(cx0, cx1); }
        c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
        c.sh.style.transform = `translate(${(c.x + 10).toFixed(1)}px, ${(c.y + 13).toFixed(1)}px)`;
      }
    }

    /* ---------- camera ---------- */
    // khung tổng quan: toàn bộ VN + Hoàng Sa + Trường Sa
    const P = (lon, lat) => [(lon - 80) * Math.cos(15 * Math.PI / 180) / 0.04, (32 - lat) / 0.04];
    const [bx0, by0] = P(101.4, 23.9), [bx1, by1] = P(116.8, 6.6);
    let VW = 0, VH = 0, s0 = 1, US = 1;
    function fit(uiScale) {
      VW = innerWidth; VH = innerHeight; US = uiScale || 1;
      s0 = Math.min(VW / (bx1 - bx0), (VH - 40 * US) / (by1 - by0));
    }

    /* ---------- trạng thái ---------- */
    let arrived = false, t0 = 0;
    const state = { u: 0, arrivedAt: 0 };
    function reset() {
      puffs.length = 0; arrived = false; lastD = 0; state.u = 0; state.arrivedAt = 0;
      labels.forEach((l) => { l.on = false; l.el.classList.remove('on', 'pop'); });
      paintRail(-1);
      fctx.clearRect(0, 0, fx.width, fx.height); dirty = null;
      if (hn) hn.el.classList.remove('mpin--dest', 'on');
    }

    // pv: tiến độ scroll 0..1 → u: tiến độ tàu 0..1
    const T0 = 0.1, T1 = 0.86;
    const progressToU = (pv) => {
      const k = clamp((pv - T0) / (T1 - T0));
      return k + (k * k * (3 - 2 * k) - k) * 0.6;   // gần đều, nhanh dần lúc đầu & chậm dần lúc tới
    };

    function frame(t, dt, pv, events, boost = 1) {
      const u = progressToU(pv);
      state.u = u;
      const d = u * TOTAL;
      const moving = Math.abs(d - lastD) > 0.02;
      const speed = Math.min(1, Math.abs(d - lastD) / Math.max(dt, 0.001) / 60);

      /* --- camera: tổng quan → bám tàu (zoom) → zoom vào Nha Trang --- */
      const [tx, ty] = posAt(d);
      const follow = ease(clamp((pv - 0.03) / 0.14));
      const arrive = ease(clamp((pv - 0.86) / 0.1));
      const z = (1 + 0.85 * follow + 0.55 * arrive) * boost;
      const S = s0 * z;
      const ox = (bx0 + bx1) / 2, oy = (by0 + by1) / 2;
      const camX = ox + (tx - ox) * follow, camY = oy + (ty - oy) * follow;
      const scx = VW * (0.56 - 0.08 * arrive), scy = VH * (0.53 - 0.02 * follow) + 20 * US;                        // né hộp thoại góc trên trái
      const ex = scx - camX * S, ey = scy - camY * S;
      mw.style.transform = `translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px) scale(${S.toFixed(4)})`;

      /* --- ray đã đi --- */
      let upto = -1;
      for (let i = 0; i < pix.length && pix[i].d <= d; i++) upto = i;
      paintRail(upto);

      /* --- xoá vùng bẩn frame trước --- */
      if (dirty) fctx.clearRect(dirty[0] - 2, dirty[1] - 2, dirty[2] - dirty[0] + 4, dirty[3] - dirty[1] + 4);
      dirty = null;

      /* --- khói --- */
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i], a = (t - p.born) / p.life;
        if (a >= 1) { puffs.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - 1.4 * dt; p.vy *= 1 - 1.4 * dt;
      }
      const list = puffs.map((p) => {
        const a = (t - p.born) / p.life;
        const r = (p.r0 + p.g * Math.sqrt(a)) * (a > 0.7 ? (1 - a) / 0.3 : 1);
        grow(p.x - r - 2, p.y - r - 2, p.x + r + 2, p.y + r + 2);
        return { x: p.x, y: p.y, r, hi: p.hi };
      });
      if (list.length) drawClouds(fctx, list.reverse(), SMOKE);

      /* --- tàu --- */
      const bob = moving && !reduce ? (Math.sin(t * 30) > 0 ? -0.5 : 0) : 0;
      let front = d * FX;
      let stack = null;
      CONSIST.forEach((car, i) => {
        const back = front - car.L;
        const pf = posAt(front / FX).map((v) => v * FX), pb = posAt(back / FX).map((v) => v * FX);
        const r = drawCar(car, pf, pb, i === 0 ? bob : 0);
        if (i === 0) stack = [r.cx + r.ux * (car.L / 2 - 8), r.cy + r.uy * (car.L / 2 - 8) + bob, r.ux, r.uy];
        front = back - GAP;
      });

      // phụt khói: nhiều hơn khi chạy, lúc đứng thì lững lờ
      const every = moving ? 0.07 : 0.35;
      if (stack && !reduce && t - lastPuff > every && u < 1) {
        lastPuff = t;
        puffs.push({ x: stack[0], y: stack[1] - 1, vx: -stack[2] * rand(6, 16) + rand(-3, 3), vy: -stack[3] * rand(6, 16) - rand(8, 16),
          r0: rand(2, 3), g: moving ? rand(7, 10) : rand(4, 6), born: t, life: moving ? rand(0.9, 1.3) : rand(1.2, 1.6), hi: Math.random() < 0.5 });
      }

      /* --- âm thanh: cạch-cạch theo quãng đường --- */
      clackAcc += Math.abs(d - lastD);
      if (clackAcc > 9) { clackAcc = 0; Sound.clack(0.35 + speed * 0.6); }
      Sound.setSpeed(speed);
      lastD = d;

      /* --- nhãn --- */
      for (const l of labels) {
        const x = l.p[0] * S + ex, y = l.p[1] * S + ey;
        l.el.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
        if (l.s != null) {
          const on = u >= l.s - 0.002;
          if (on !== l.on) {
            l.on = on; l.el.classList.toggle('on', on);
            if (on && l.s > 0 && l.s < 1) { l.el.classList.remove('pop'); void l.el.offsetWidth; l.el.classList.add('pop'); }
          }
        }
      }

      /* --- tới nơi --- */
      if (!arrived && u >= 0.999) { arrived = true; state.arrivedAt = t; events.arrive(); }
      else if (arrived && u < 0.97) { arrived = false; events.leave(); }

      drawSky(t);
      return { km: homeKm(d), u, arrived };
    }

    /* =========================================================
       CHUYẾN BAY Nha Trang (sân bay Cam Ranh) → Hà Nội (Nội Bài)
       Đường bay = cung bezier bậc 2 hơi lệch ra biển; máy bay vẽ từng pixel như đoàn tàu,
       bóng đổ xa dần khi lên cao, vệt khói trắng sau 2 động cơ.
       ========================================================= */
    const FA = P(109.219, 11.998), FB = P(105.807, 21.221);
    const FC = [(FA[0] + FB[0]) / 2 + 70, (FA[1] + FB[1]) / 2 + 10];          // điểm điều khiển: cong ra phía biển
    const bez = (k) => {
      const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
      return [a * FA[0] + b * FC[0] + c * FB[0], a * FA[1] + b * FC[1] + c * FB[1]];
    };
    const FLIGHT_KM = 1060;      // Cam Ranh – Nội Bài, đường chim bay ~1.060 km
    const W = '#f6efe2', O = '#f26a2e', OD = '#b8461a', G = '#cfc6b6';
    // máy bay nhìn từ trên xuống, mũi hướng +u. L dài, Wd sải cánh (px canvas fx)
    const PLANE = { L: 30, Wd: 30, pat: (u, v) => {
      const c = v - 14.5, a = Math.abs(c);
      const body = a <= 2.5 && u >= 1 && u <= 28 - Math.max(0, u - 25) * 0;
      const nose = u > 26 && a <= 2.5 - (u - 26) * 0.9;
      const wing = u >= 12 && u <= 18 && a <= 14 - (u - 12) * 0.2 && u - 12 >= (a - 3) * 0.35;
      const tail = u >= 1 && u <= 5 && a <= 7 && u - 1 >= (a - 2) * 0.45;
      const eng = (u === 14 || u === 15 || u === 16) && (Math.round(a) === 7);
      const inside = (body || nose || wing || tail || eng);
      if (!inside) return null;
      // viền: điểm kề không thuộc máy bay
      return { c, a, wing, tail, eng, body: body || nose };
    } };
    function planeColor(u, v) {
      const p = PLANE.pat(u, v);
      if (!p) return null;
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([du, dv]) => !PLANE.pat(u + du, v + dv));
      if (edge) return INK;
      if (p.eng) return '#6b5440';
      if (p.body) {
        if (u >= 24 && u <= 25 && p.a <= 1.5) return '#35576b';                 // kính buồng lái
        if (Math.round(p.c) === 0) return O;                                  // sọc cam dọc thân
        return (u % 3 === 0 && p.a <= 1.5) ? '#bfe6f2' : W;                    // cửa sổ
      }
      if (p.wing) return p.a > 11 ? O : (p.c > 0 ? G : W);
      if (p.tail) return p.a > 5 ? OD : W;
      return W;
    }
    const PS = 1.5;   // phóng to máy bay (mỗi pixel thiết kế = 1.5 px canvas)
    function drawPlane(cx, cy, ux, uy, alt) {
      const nx = -uy, ny = ux, r = 24 * PS;
      const x0 = Math.floor(cx - r), y0 = Math.floor(cy - r), x1 = Math.ceil(cx + r), y1 = Math.ceil(cy + r);
      const sh = 3 + alt * 16;                                                // bóng xa dần khi lên cao
      grow(x0, y0, x1 + sh + 2, y1 + sh + 2);
      const bx = cx - (ux * PLANE.L / 2 + nx * PLANE.Wd / 2) * PS, by = cy - (uy * PLANE.L / 2 + ny * PLANE.Wd / 2) * PS;
      const cols = [];
      for (let Y = y0; Y <= y1; Y++) for (let X = x0; X <= x1; X++) {
        const px = X + 0.5 - bx, py = Y + 0.5 - by;
        const u = Math.floor((px * ux + py * uy) / PS), v = Math.floor((px * nx + py * ny) / PS);
        if (u < 0 || u >= PLANE.L || v < 0 || v >= PLANE.Wd) continue;
        const col = planeColor(u, v);
        if (col) cols.push(X, Y, col);
      }
      fctx.fillStyle = `rgba(16,36,60,${(0.35 - alt * 0.15).toFixed(2)})`;       // bóng trên mặt đất (dưới mây)
      for (let i = 0; i < cols.length; i += 3) fctx.fillRect(cols[i] + sh, cols[i + 1] + sh * 0.8, 1, 1);
      for (let i = 0; i < cols.length; i += 3) { actx.fillStyle = cols[i + 2]; actx.fillRect(cols[i], cols[i + 1], 1, 1); }
    }
    const TRAIL = { ink: '#c9d6de', shade: '#e6edf1', body: '#ffffff', hi: '#ffffff' };
    let flyArrived = false, lastK = 0, flyPuff = 0;
    const hn = labels.find((l) => l.kind === 'cap');
    function flightReset() {
      flyArrived = false; lastK = 0; puffs.length = 0;
      paintRail(pix.length - 1);                                             // tuyến tàu đã đi: giữ vệt vàng
      labels.forEach((l) => { if (l.s != null) { l.on = true; l.el.classList.add('on'); l.el.classList.remove('pop'); } });
      if (hn) hn.el.classList.add('mpin--dest');
      fctx.clearRect(0, 0, fx.width, fx.height); dirty = null;
    }
    function flightOff() { if (hn) hn.el.classList.remove('mpin--dest', 'on'); actx.clearRect(0, 0, air.width, air.height); }
    const FT0 = 0.1, FT1 = 0.84;
    function flightFrame(t, dt, pv, events, boost = 1) {
      const kk = clamp((pv - FT0) / (FT1 - FT0));
      const k = kk * kk * (3 - 2 * kk);                                        // cất cánh chậm → bay → hạ cánh chậm
      const [px, py] = bez(k), [qx, qy] = bez(Math.min(1, k + 0.01)), [rx, ry] = bez(Math.max(0, k - 0.01));
      let ux = qx - rx, uy = qy - ry; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
      if (k <= 0) { const [ax, ay] = bez(0.01); ux = ax - FA[0]; uy = ay - FA[1]; const l = Math.hypot(ux, uy); ux /= l; uy /= l; }
      const alt = Math.sin(Math.PI * k);                                       // độ cao 0 → 1 → 0
      const moving = Math.abs(k - lastK) > 0.0005;

      /* camera: bám máy bay, lúc cao thì lùi ra xa hơn một chút */
      const z = (1.7 - 0.35 * alt + 0.6 * ease(clamp((pv - 0.84) / 0.1))) * boost;
      const S = s0 * z;
      const scx = VW * 0.55, scy = VH * 0.55 + 20 * US;
      const ex = scx - px * S, ey = scy - py * S;
      mw.style.transform = `translate(${ex.toFixed(1)}px, ${ey.toFixed(1)}px) scale(${S.toFixed(4)})`;

      if (dirty) fctx.clearRect(dirty[0] - 2, dirty[1] - 2, dirty[2] - dirty[0] + 4, dirty[3] - dirty[1] + 4);
      dirty = null;

      /* đường bay nét đứt: phần đã bay trắng đậm, phần còn lại mờ */
      for (let s = 0; s <= 1.0001; s += 0.004) {
        if (Math.floor(s / 0.004) % 3 === 2) continue;
        const [x, y] = bez(s);
        fctx.fillStyle = s <= k ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.4)';
        fctx.fillRect(Math.round(x * FX), Math.round(y * FX), 2, 2);
      }
      grow(Math.min(FA[0], FB[0], FC[0]) * FX - 4, Math.min(FA[1], FB[1]) * FX - 4, Math.max(FA[0], FB[0], FC[0]) * FX + 6, Math.max(FA[1], FB[1]) * FX + 6);

      /* vệt khói trắng sau 2 động cơ */
      for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; if ((t - p.born) / p.life >= 1) puffs.splice(i, 1); }
      const cx = px * FX, cy = py * FX, nx = -uy, ny = ux;
      if (!reduce && moving && alt > 0.08 && t - flyPuff > 0.03) {
        flyPuff = t;
        for (const sgn of [-1, 1]) puffs.push({ x: cx - ux * 6 + nx * 10 * sgn, y: cy - uy * 6 + ny * 10 * sgn, r0: 1.2, g: 2.5, born: t, life: 1.6, hi: false });
      }
      const list = puffs.map((p) => {
        const a = (t - p.born) / p.life;
        const r = (p.r0 + p.g * Math.sqrt(a)) * (a > 0.6 ? (1 - a) / 0.4 : 1);
        grow(p.x - r - 2, p.y - r - 2, p.x + r + 2, p.y + r + 2);
        return { x: p.x, y: p.y, r, hi: false };
      });
      actx.clearRect(0, 0, air.width, air.height);
      if (list.length) drawClouds(actx, list.reverse(), TRAIL);

      /* máy bay: to hơn chút khi lên cao */
      drawPlane(cx, cy - alt * 3, ux, uy, alt);
      Sound.setSpeed(clamp(Math.abs(k - lastK) / Math.max(dt, 0.001) * 3));
      lastK = k;

      for (const l of labels) {
        const x = l.p[0] * S + ex, y = l.p[1] * S + ey;
        l.el.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
      }
      if (hn) hn.el.classList.toggle('on', k >= 0.999);

      drawSky(t);
      if (!flyArrived && k >= 0.999) { flyArrived = true; events.arrive(); }
      else if (flyArrived && k < 0.97) { flyArrived = false; events.leave(); }
      return { km: FLIGHT_KM * k, k, alt, arrived: flyArrived };
    }

    return { fit, frame, reset, state, flightReset, flightFrame, flightOff, get total() { return TOTAL; } };
  }
  return { create };
})();
