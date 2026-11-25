/* =========================================================
   MY STORY – World 2: Nha Trang (đại học)
   Một thế giới nằm ngang ghép từ các tấm nền ChatGPT vẽ (cùng chiều cao 724):
   ga + biển + cổng trường → 4 cung đường phượt → văn phòng / ký túc xá / sân trường.
   Scroll dọc = camera trượt ngang; nhân vật đứng ~38% màn hình, bước chân theo quãng đường.
   Gọi từ story.js: StoryW2.create({...})
   ========================================================= */
window.StoryW2 = (() => {
  const V = '?v=5';
  const IMG = (n, ext = 'webp') => `assets/story/${n}.${ext}${V}`;
  const H = 724;                 // chiều cao thế giới
  const OV = 160;                // các tấm nền chồng lên nhau 160px, mép trái tấm sau mờ dần
  // Thứ tự: ga + cổng trường → lớp học/lab/thư viện → văn phòng + ký túc xá → 4 cung đường phượt → sân trường
  // x0/w: cắt một phần ảnh (tấm b dùng 2 lần: văn phòng + ký túc, rồi sân trường)
  const PANELS = [
    { k: 'a', w: 2172 }, { k: 'c', w: 2172 }, { k: 'b', x0: 0, w: 1440, id: 'work' },
    { k: 'dl', w: 1686, place: 'ĐÀ LẠT' }, { k: 'py', w: 1685, place: 'PHÚ YÊN' },
    { k: 'qn', w: 1685, place: 'QUY NHƠN' }, { k: 'dn', w: 1685, place: 'ĐÀ NẴNG' },
    { k: 'y', w: 2172, id: 'yard', cut: true },        // sân trường: CẮT CẢNH (chớp trắng), không nối liền với đường Đà Nẵng
  ];
  let x = 0;
  for (const p of PANELS) { if (p.cut) x += OV + 600; p.x = x; x += p.w - OV; }
  const WORLD_W = x + OV;
  const PC = PANELS[1], PW = PANELS[2], PY_ = PANELS[7];
  const PDN = PANELS[6], DN_END = PDN.x + PDN.w;
  const ROAD0 = PANELS[3].x + 60, ROAD1 = PY_.x;          // đoạn đi xe máy
  const GATE_X = 1600;                                          // giữa cổng trường (tấm a)
  const YARD_X = PY_.x + 500;                                   // sân khấu tốt nghiệp
  // Trung "ở trong nhà" (đã vẽ sẵn trong ảnh nền) → ẩn sprite đi bộ
  const INSIDE = [[PC.x + 70, PC.x + PC.w - 70], [PW.x + 40, PW.x + 640], [PW.x + 1100, PW.x + PW.w]];
  const inside = (tx) => INSIDE.some(([a, b]) => tx >= a && tx < b);

  // Thông tin để mày tự sửa
  const INFO = {
    school: 'TRƯỜNG ĐẠI HỌC THÔNG TIN LIÊN LẠC',
    schoolEn: 'Telecommunications University',
    yearIn: '',        // ví dụ '2012' – để trống thì ẩn biển năm
    yearOut: '',       // ví dụ '2016'
  };

  const SPR = {
    trung: { src: IMG('w2_trung', 'png'), fw: 197, fh: 300, n: 4, h: 196, foot: 660 },
    friends: { src: IMG('w2_friends', 'png'), fw: 0, fh: 300, n: 4, h: 190, foot: 656 },     // fw đọc từ ảnh
    bikes: { src: IMG('w2_bikes', 'png'), fw: 0, fh: 330, n: 2, h: 222, foot: 662 },
  };

  function create({ root, Sound, drawClouds, clamp, ease, say, showPopup, showTitle, setParty, retrigger, LN, UIT, onDone }) {
    const box = root.querySelector('.w2');
    const wd = root.querySelector('.w2__world');
    const fxCv = root.querySelector('.w2__fx');
    const fctx = fxCv.getContext('2d');
    const stampsEl = root.querySelector('.stamps');
    const questEl = root.querySelector('.quest');
    const areaEl = root.querySelector('.area');
    const polaroid = root.querySelector('.polaroid');
    const endCard = root.querySelector('.end-card');
    wd.style.width = WORLD_W + 'px'; wd.style.height = H + 'px';

    /* ---------- nền ---------- */
    PANELS.forEach((p, i) => {
      const box = document.createElement('div');
      box.className = 'w2-panel' + (i && !p.cut ? ' w2-panel--fade' : '');
      Object.assign(box.style, { left: p.x + 'px', width: p.w + 'px', height: H + 'px', zIndex: i });
      const im = document.createElement('img');
      im.alt = ''; im.src = IMG('w2_' + p.k);
      im.style.left = -(p.x0 || 0) + 'px';
      p.img = im;
      box.appendChild(im);
      wd.appendChild(box);
    });
    // biển gỗ: tên cung đường + năm
    const sign = (x0, text, cls = '') => {
      const s = document.createElement('div');
      s.className = 'w2-sign ' + cls; s.style.left = x0 + 'px';
      s.innerHTML = `<b>${text}</b><i></i>`;
      wd.appendChild(s); return s;
    };
    PANELS.forEach((p) => { if (p.place) sign(p.x + 420, p.place); });
    if (INFO.yearIn) sign(560, INFO.yearIn, 'w2-sign--year');
    if (INFO.yearOut) sign(YARD_X - 260, INFO.yearOut, 'w2-sign--year');
    // bảng tên trường đặt dưới mái cổng
    const plaque = document.createElement('div');
    plaque.className = 'w2-plaque'; plaque.style.left = GATE_X + 'px';
    plaque.textContent = INFO.school;
    wd.appendChild(plaque);

    /* ---------- sprite ---------- */
    const mk = (cfg, cls) => {
      const el = document.createElement('div');
      el.className = 'w2-sprite ' + cls;
      wd.appendChild(el);
      const s = { cfg, el, f: -1, x: 0, shown: true };
      const im = new Image();
      im.onload = () => {
        cfg.fw = cfg.fw || im.width / cfg.n; cfg.fh = im.height;
        s.w = cfg.h * cfg.fw / cfg.fh;
        Object.assign(el.style, { width: s.w + 'px', height: cfg.h + 'px', top: cfg.foot - cfg.h + 'px',
          backgroundImage: `url(${cfg.src})`, backgroundSize: `${s.w * cfg.n}px ${cfg.h}px` });
      };
      im.src = cfg.src;
      return s;
    };
    const trung = mk(SPR.trung, 'w2-trung');
    const friends = mk(SPR.friends, 'w2-friends');
    const bike1 = mk(SPR.bikes, 'w2-bike');
    const bike2 = mk(SPR.bikes, 'w2-bike');
    const setFrame = (s, f, xc, bob = 0) => {
      if (!s.w) return;
      if (f !== s.f) { s.f = f; s.el.style.backgroundPosition = `${-f * s.w}px 0`; }
      s.el.style.transform = `translate(${(xc - s.w / 2).toFixed(1)}px, ${bob.toFixed(1)}px)`;
    };
    const show = (s, on) => { if (s.shown !== on) { s.shown = on; s.el.style.visibility = on ? 'visible' : 'hidden'; } };

    /* ---------- tem phượt ---------- */
    const ROADS = PANELS.filter((p) => p.place);
    questEl.querySelector('.quest__main').lastChild.textContent = UIT('quest_main') || 'MAIN QUEST · Graduate';
    questEl.querySelector('.quest__side').lastChild.textContent = UIT('quest_side') || 'SIDE QUEST · Internship';
    polaroid.querySelector('figcaption').textContent = UIT('polaroid_caption') || 'GRADUATED';
    stampsEl.innerHTML = ROADS.map((p) => `<span class="stamp"><i></i>${p.place}</span>`).join('');
    const stampEls = [...stampsEl.querySelectorAll('.stamp')];

    /* ---------- khói "bụp" khi lên/xuống xe + bụi đường (toạ độ màn hình, canvas 1/3) ---------- */
    const FXR = 3;
    const puffs = [];
    const POOF = { ink: '#6b5440', shade: '#dccbb0', body: '#f6efe2', hi: '#fffaf0' };
    const DUST = { ink: '#8b7a66', shade: '#c9b89c', body: '#dfd1b8', hi: '#efe5d2' };
    const rand = (a, b) => a + Math.random() * (b - a);
    function poof(wx, t, n = 14) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        puffs.push({ wx: wx + Math.cos(a) * 20, wy: SPR.trung.foot - 70 + Math.sin(a) * 40, vx: Math.cos(a) * rand(60, 160), vy: Math.sin(a) * rand(40, 120) - 30,
          r0: rand(14, 22), g: rand(16, 26), born: t, life: rand(0.5, 0.8), pal: POOF, hi: i % 2 === 0 });
      }
    }

    /* ---------- camera & trạng thái ---------- */
    let VW = 0, VH = 0, S = 1, VWw = 0;
    function fit() {
      VW = innerWidth; VH = innerHeight; S = VH / H; VWw = VW / S;
      fxCv.width = Math.ceil(VW / FXR); fxCv.height = Math.ceil(VH / FXR);
    }
    const CAM_END = 0.9;                 // scroll tới đây là camera tới cuối thế giới
    // phân bổ scroll: học + làm chiếm phần lớn, đi phượt lướt nhanh (xe máy chạy vèo)
    const txAt = (pv) => {
      const t0 = VWw * 0.38, t1 = WORLD_W - VWw * 0.62;
      const rideEnd = DN_END - VWw * 0.62 - 1, yard0 = PY_.x + VWw * 0.38;   // xe chạy tới hết đường Đà Nẵng → nhảy sang sân trường
      const K = [[0, t0], [0.15, PC.x + 60], [0.42, PW.x + 40], [0.66, ROAD0], [0.8, rideEnd], [0.8001, yard0], [CAM_END, Math.max(t1, yard0 + 1)]];
      if (pv >= CAM_END) return t1;
      for (let i = 1; i < K.length; i++) if (pv <= K[i][0]) {
        const [p0, x0] = K[i - 1], [p1, x1] = K[i];
        return x0 + (x1 - x0) * (pv - p0) / (p1 - p0);
      }
      return t1;
    };
    const GRAD_AT = 0.94;                // tới đây → cảnh tốt nghiệp
    const st = { party: 1, riding: false, joined: false, stamps: 0, intern: false, grad: false, gradT: 0, lastTx: 0, lineKey: '' };

    function reset() {
      Object.assign(st, { party: 1, riding: false, joined: false, stamps: 0, intern: false, unlock: false, inDoors: undefined, grad: false, gradT: 0, lastTx: 0, area: false, achv: false, doneFired: false });
      stampEls.forEach((s) => s.classList.remove('on'));
      stampsEl.classList.remove('on'); questEl.classList.remove('on', 'intern', 'done', 'unlock'); polaroid.classList.remove('on');
      areaEl.classList.remove('on');
      puffs.length = 0;
      setParty(1);
    }

    // tx = vị trí Trung trên thế giới → các mốc kể chuyện
    const LINES = [
      { at: 0, text: LN('w2_1') },
      { at: 1150, text: LN('w2_2') },
      { at: 1760, text: LN('w2_3') },
      { at: PC.x + 60, text: LN('w2_4') },
      { at: PC.x + 1350, text: LN('w2_5') },
      { at: PW.x + 40, text: LN('w2_6') },
      { at: PW.x + 700, text: LN('w2_7') },
      { at: ROAD0 + 40, text: LN('w2_8') },
      { at: ROAD1, text: LN('w2_9') },
    ];

    function frame(t, dt, pv) {
      const tx = txAt(clamp(pv));
      const cam = clamp(tx - VWw * 0.38, 0, WORLD_W - VWw);
      // vừa nhảy qua mốc cắt cảnh → chớp trắng (nhảy thời gian tới lễ tốt nghiệp)
      if ((st.lastTx < PY_.x) !== (tx < PY_.x) && st.lastTx) { (window.__storyTransit || (() => retrigger(root.querySelector('.flash'))))('dissolve'); Sound.clunk(); }
      const moved = Math.abs(tx - st.lastTx) > 400 ? 0 : tx - st.lastTx; st.lastTx = tx;
      wd.style.transform = `translate(${(-cam * S).toFixed(1)}px, 0) scale(${S})`;

      /* --- nhập hội ở cổng trường --- */
      if (!st.area && tx >= GATE_X - 500) { st.area = true; retrigger(areaEl); areaEl.querySelector('b').textContent = INFO.school; }
      if (st.area && (tx > GATE_X + 1400 || tx < GATE_X - 700)) { st.area = tx > GATE_X; areaEl.classList.remove('on'); }
      if (!st.joined && tx >= GATE_X + 120) {
        st.joined = true; st.joinT = t; poof(GATE_X - 40, t, 10); Sound.clunk();
        [0, 1, 2].forEach((i) => setTimeout(() => { if (!st.joined) return; const u = UIT('popup_party_join', 2 + i); showPopup(u.title, u.sub); setParty(2 + i); }, i * 650));
      } else if (st.joined && tx < GATE_X + 60) { st.joined = false; setParty(1); }

      /* --- lên / xuống xe --- */
      const riding = tx >= ROAD0 && tx < ROAD1;
      if (riding !== st.riding) { st.riding = riding; poof(tx - 60, t); Sound.clunk(); stampsEl.classList.toggle('on', riding || st.stamps > 0); }

      /* --- tem --- */
      let ns = 0;
      ROADS.forEach((p, i) => { const on = tx >= p.x + 300; if (on) ns++; stampEls[i].classList.toggle('on', on); });
      if (ns !== st.stamps) {
        if (ns > st.stamps) Sound.clack(1);
        st.stamps = ns;
        if (ns === 4 && !st.achv) { st.achv = true; { const u = UIT('popup_achievement'); showPopup(u.title, u.sub); } }
      }

      /* --- nhiệm vụ: học + thực tập --- */
      questEl.classList.toggle('on', tx >= PC.x + 60 && tx < ROAD0);
      const unlock = tx >= PC.x + PC.w - 200;
      if (unlock !== st.unlock) { st.unlock = unlock; questEl.classList.toggle('unlock', unlock); if (unlock) { const u = UIT('popup_side_unlock'); showPopup(u.title, u.sub); } }
      const intern = tx >= PW.x + 600;
      if (intern !== st.intern) { st.intern = intern; questEl.classList.toggle('intern', intern); if (intern) { const u = UIT('popup_side_done'); showPopup(u.title, u.sub); } }
      questEl.style.setProperty('--xp', clamp((tx - PC.x) / (ROAD0 - PC.x)).toFixed(3));

      /* --- tốt nghiệp --- */
      if (!st.grad && pv >= GRAD_AT) {
        st.grad = true; st.gradT = t; questEl.classList.add('done');
        retrigger(root.querySelector('.flash')); Sound.horn();
        setTimeout(() => { if (st.grad) { polaroid.classList.add('on'); { const u = UIT('popup_grad'); showPopup(u.title, u.sub); } } }, 250);
      } else if (st.grad && pv < GRAD_AT - 0.04) { st.grad = false; polaroid.classList.remove('on'); questEl.classList.remove('done'); }
      // ảnh tốt nghiệp hiện đủ lâu → quay lại bản đồ (chuyến bay ra Hà Nội)
      if (st.grad && !st.doneFired && t - st.gradT > 3.6) { st.doneFired = true; if (onDone) onDone(); else endCard.classList.add('on'); }
      if (!st.grad) st.doneFired = false;
      st.cam = cam;

      /* --- nhân vật --- */
      const stride = Math.floor(tx / 44) % 4;
      const walkF = Math.abs(moved) > 0.05 ? stride : 1;
      const onFoot = !riding;
      const inDoors = inside(tx);
      if (inDoors !== st.inDoors) { if (st.inDoors !== undefined && onFoot) poof(tx, t, 8); st.inDoors = inDoors; }
      show(trung, onFoot && !inDoors); show(bike1, riding); show(bike2, riding);
      const friendsOn = st.joined && onFoot && !inDoors && (tx < PC.x + 100 || tx >= ROAD1);
      show(friends, friendsOn);
      setFrame(trung, walkF, tx);
      if (friendsOn) {
        const fx = tx - 200 + (st.joinT && t - st.joinT < 0.5 ? (1 - (t - st.joinT) / 0.5) * 80 : 0);
        setFrame(friends, walkF, fx);
      }
      if (riding) {
        const bob = (k) => (Math.abs(moved) > 0.05 ? (Math.floor((tx + k) / 22) % 2) * -2 : 0);
        setFrame(bike1, 0, tx + 40, bob(0));
        setFrame(bike2, 1, tx - 270, bob(11));
        if (Math.abs(moved) > 0.5 && Math.random() < 0.6) {
          for (const bx of [tx + 40 - 90, tx - 270 - 90]) puffs.push({ wx: bx, wy: SPR.bikes.foot - 8, vx: rand(-140, -60), vy: rand(-30, -8), r0: rand(5, 8), g: 12, born: t, life: rand(0.4, 0.7), pal: DUST, hi: false });
        }
      }
      Sound.setSpeed(clamp(Math.abs(moved) / 30) * (riding ? 1 : 0.3));

      /* --- khói / bụi --- */
      fctx.clearRect(0, 0, fxCv.width, fxCv.height);
      const groups = new Map();
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i], a = (t - p.born) / p.life;
        if (a >= 1) { puffs.splice(i, 1); continue; }
        p.wx += p.vx * dt; p.wy += p.vy * dt; p.vx *= 1 - 3 * dt; p.vy *= 1 - 3 * dt;
        const r = (p.r0 + p.g * Math.sqrt(a)) * (a > 0.6 ? (1 - a) / 0.4 : 1);
        if (!groups.has(p.pal)) groups.set(p.pal, []);
        groups.get(p.pal).push({ x: (p.wx - cam) * S / FXR, y: p.wy * S / FXR, r: r * S / FXR, hi: p.hi });
      }
      for (const [pal, list] of groups) drawClouds(fctx, list, pal);

      /* --- lời thoại --- */
      if (!st.grad) {
        let li = 0;
        for (let i = 0; i < LINES.length; i++) if (tx >= LINES[i].at) li = i;
        say('w' + li, LINES[li].text, 'SCROLL ▼');
      } else say('wg', LN('w2_grad'), '');
    }

    // ảnh đầu tiên của World 2 (để chuyển cảnh từ bản đồ "khử pixel" dần)
    const firstImg = new Image(); firstImg.src = IMG('w2_a');
    function drawFirst(ctx, w, h) {
      if (!firstImg.complete || !firstImg.naturalWidth) return false;
      const sw = Math.min(firstImg.naturalWidth, (w / h) * H);
      ctx.drawImage(firstImg, 0, 0, sw, H, 0, 0, w, h);
      return true;
    }

    // khung hình hiện tại (chỉ ảnh nền) – để "pixel hoá" khi chuyển cảnh sang bản đồ
    function drawView(ctx, w, h) {
      const cam = st.cam || 0;
      for (const p of PANELS) {
        const a = Math.max(p.x, cam), b = Math.min(p.x + p.w, cam + VWw);
        if (b <= a || !p.img || !p.img.complete) continue;
        ctx.drawImage(p.img, (p.x0 || 0) + a - p.x, 0, b - a, H, (a - cam) / VWw * w, 0, (b - a) / VWw * w, h);
      }
    }

    return { fit, frame, reset, drawFirst, drawView, INFO, get trackVh() { return 1000; } };
  }
  return { create };
})();
