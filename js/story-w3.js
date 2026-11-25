/* =========================================================
   MY STORY – World 3: Hà Nội (đi làm → biến cố → kiên trì → hiện tại)
   Ghép 5 tấm nền ChatGPT vẽ (cao 724): tới Hà Nội + công ty đầu → sếp mới + startup
   → thức đêm → Covid → bão & bình minh AI. Trung đã vẽ sẵn bên trong các phòng.
   Trọng tâm: giai đoạn khó khăn (mưa, sấm, đồng nghiệp rời đi, thanh RESILIENCE).
   Kết: khói phủ → về đúng căn phòng ở trang chủ + bảng nhân vật cho nhà tuyển dụng.
   ========================================================= */
window.StoryW3 = (() => {
  const V = '?v=7';
  const IMG = (n, ext = 'webp') => `assets/story/${n}.${ext}${V}`;
  const H = 724, OV = 160;
  const PANELS = [{ k: 'a', w: 2172 }, { k: 'b', w: 2172 }, { k: 'c', w: 2172 }, { k: 'd', w: 2172 }, { k: 'e', w: 2172 }, { k: 'f', w: 2172 }, { k: 'g', w: 2172 }];
  // Mỗi tấm là một mốc thời gian/địa điểm → CẮT CẢNH (chớp trắng) giữa các tấm, camera không bao giờ thấy chỗ nối
  for (const p of PANELS) p.cut = true;
  let x = 0;
  for (const p of PANELS) { p.x = x; x += p.w + 600; }
  const WORLD_W = x - 600;
  const [PA, PB, PC, PD, PE, PF, PG] = PANELS;   // PF: đám cưới tháng 5/2026 · PG: làm việc ở nhà (hiện tại)
  // Trung đã vẽ sẵn trong phòng → ẩn sprite đi bộ ở các đoạn này
  const INSIDE = [[PA.x + 1120, PD.x], [PD.x + 990, PG.x + PG.w]];   // chỉ đi bộ ngoài phố (đầu tấm A, đầu tấm D)
  const inside = (tx) => INSIDE.some(([a, b]) => tx >= a && tx < b);
  // thời tiết theo vị trí: 0 = trời đẹp, 1 = bão
  const STORM0 = PD.x - 200, STORM1 = PE.x + 880, DAWN1 = PE.x + 1200;

  const SPR = {
    trung: { src: IMG('w2_trung', 'png'), n: 4, h: 196, foot: 660 },
    leavers: { src: IMG('w3_leavers', 'png'), n: 4, h: 190, foot: 640 },
  };

  function create({ root, Sound, drawClouds, clamp, ease, say, showPopup, setParty, retrigger, LN, UIT, onDone }) {
    const wd = root.querySelector('.w3__world');
    const fxCv = root.querySelector('.w3__fx');
    const fctx = fxCv.getContext('2d');
    const dark = root.querySelector('.w3__dark');
    const glow = root.querySelector('.w3__glow');
    const bolt = root.querySelector('.w3__bolt');
    const areaEl = root.querySelector('.area');
    const meter = root.querySelector('.meter');
    wd.style.width = WORLD_W + 'px'; wd.style.height = H + 'px';
    const pop = (k, n) => { const u = UIT(k, n); showPopup(u.title, u.sub); };

    PANELS.forEach((p, i) => {
      const box = document.createElement('div');
      box.className = 'w2-panel' + (i && !p.cut ? ' w2-panel--fade' : '');
      Object.assign(box.style, { left: p.x + 'px', width: p.w + 'px', height: H + 'px', zIndex: i });
      const im = document.createElement('img');
      im.alt = ''; im.src = IMG('w3_' + p.k);
      box.appendChild(im); wd.appendChild(box); p.img = im;
    });

    /* ---------- bảng tên kiểu RPG trên đầu nhân vật vẽ sẵn: ai là Trung, ai là sếp ---------- */
    // [tấm, x, y đỉnh đầu (toạ độ ảnh), loại]
    const TAGS = [
      [PA, 1304, 340, 'me'], [PA, 1514, 340, 'boss1'],
      [PB, 184, 400, 'me'], [PB, 360, 315, 'boss'], [PB, 880, 392, 'me'], [PB, 994, 335, 'boss'], [PB, 1824, 312, 'me'], [PB, 2060, 318, 'boss'],
      [PC, 1200, 372, 'me'], [PC, 1850, 366, 'boss'],
      [PD, 1158, 314, 'me'],
      [PE, 940, 360, 'me'], [PE, 1146, 368, 'boss'], [PE, 1684, 282, 'me'], [PE, 1780, 272, 'boss'],
      [PF, 980, 196, 'me'], [PF, 1144, 224, 'wife'],
      [PG, 468, 312, 'wife'], [PG, 1046, 290, 'me'],
    ];
    const TS = (k, d) => { const v = UIT(k); return typeof v === 'string' && v ? v : d; };
    const tagText = { me: TS('tag_me', 'TRUNG'), boss: TS('tag_boss', '★ BOSS'), boss1: TS('tag_boss1', '1ST BOSS'), wife: TS('tag_wife', '♥ WIFE') };
    for (const [p, x, y, kind] of TAGS) {
      const el = document.createElement('div');
      el.className = 'w3-tag w3-tag--' + kind;
      el.textContent = tagText[kind];
      Object.assign(el.style, { left: p.x + x + 'px', top: y - 14 + 'px' });
      wd.appendChild(el);
    }

    /* ---------- sprite ---------- */
    const mk = (cfg, cls) => {
      const el = document.createElement('div');
      el.className = 'w2-sprite ' + cls; wd.appendChild(el);
      const s = { cfg, el, f: -1, shown: true };
      const im = new Image();
      im.onload = () => {
        cfg.fw = im.width / cfg.n; cfg.fh = im.height; s.w = cfg.h * cfg.fw / cfg.fh;
        Object.assign(el.style, { width: s.w + 'px', height: cfg.h + 'px', top: cfg.foot - cfg.h + 'px',
          backgroundImage: `url(${cfg.src})`, backgroundSize: `${s.w * cfg.n}px ${cfg.h}px` });
      };
      im.src = cfg.src;
      return s;
    };
    const trung = mk(SPR.trung, 'w3-trung');
    const leavers = mk(SPR.leavers, 'w3-leavers');
    const setFrame = (s, f, xc, extra = '') => {
      if (!s.w) return;
      if (f !== s.f) { s.f = f; s.el.style.backgroundPosition = `${-f * s.w}px 0`; }
      s.el.style.transform = `translate(${(xc - s.w / 2).toFixed(1)}px, 0) ${extra}`;
    };
    const show = (s, on) => { if (s.shown !== on) { s.shown = on; s.el.style.visibility = on ? 'visible' : 'hidden'; } };

    /* ---------- camera ---------- */
    let VW = 0, VH = 0, S = 1, VWw = 0;
    const FXR = 3;
    function fit() {
      VW = innerWidth; VH = innerHeight; S = VH / H; VWw = VW / S;
      fxCv.width = Math.ceil(VW / FXR); fxCv.height = Math.ceil(VH / FXR);
    }
    const CAM_END = 0.9, HOME_AT = 0.95;
    // phân bổ scroll: phần khó khăn (Covid + bão) chiếm gần một nửa
    // phân bổ scroll theo tấm (khó khăn D+E chiếm nhiều); trong mỗi tấm tx đi từ mép trái tới mép phải
    const SEG = [0.15, 0.29, 0.38, 0.5, 0.74, 0.82, CAM_END];
    const txAt = (pv) => {
      let p0 = 0;
      for (let i = 0; i < PANELS.length; i++) {
        const p1 = SEG[i], P = PANELS[i];
        if (pv <= p1 || i === PANELS.length - 1) return P.x + P.w * clamp((pv - p0) / (p1 - p0), 0, 0.9999);
        p0 = p1;
      }
      return WORLD_W - 1;
    };
    const panelOf = (tx) => { for (let i = PANELS.length - 1; i >= 0; i--) if (tx >= PANELS[i].x) return i; return 0; };

    /* ---------- mốc kể chuyện (theo vị trí Trung) ---------- */
    const LINES = [
      ['w3_1', 0], ['w3_2', PA.x + 1000], ['w3_3', PA.x + 1300], ['w3_4', PA.x + 1650],
      ['w3_5', PB.x + 100], ['w3_6', PB.x + 650], ['w3_7', PB.x + 1450],
      ['w3_8', PC.x + 300],
      ['w3_9', PD.x + 100], ['w3_10', PE.x + 0], ['w3_11', PE.x + 250], ['w3_12', PE.x + 500], ['w3_13', PE.x + 700],
      ['w3_14', PE.x + 940], ['w3_15', PE.x + 1180],
      ['w3_wed1', PF.x + 0], ['w3_wed2', PF.x + 500], ['w3_wed3', PF.x + 950],
      ['w3_home1', PG.x + 0], ['w3_home2', PG.x + 820], ['w3_home3', PG.x + 1120],
    ];
    const ERAS = [['era_hn', 640], ['era_covid', PD.x + 60], ['era_war', PE.x - 60], ['era_ai', PE.x + 900], ['era_wedding', PF.x - 40], ['era_now', PG.x - 40]];
    // sự kiện một lần (có trả lại khi kéo ngược)
    const EVENTS = [
      { at: PA.x + 1330, on: () => pop('popup_hired') },
      { at: PB.x + 160, on: () => { pop('popup_mentor'); }, party: 2 },
      { at: PB.x + 700, on: () => pop('popup_startup') },
      { at: PB.x + 860, on: () => pop('popup_team', 3), party: 3 },
      { at: PB.x + 1000, on: () => pop('popup_team', 4), party: 4 },
      { at: PB.x + 1140, on: () => pop('popup_team', 5), party: 5 },
      { at: PC.x + 1100, on: () => pop('popup_nightowl') },
      { at: PE.x + 260, on: (t) => { leaveT = t; }, party: 5 },
      { at: PE.x + 720, on: () => pop('popup_stayed') },
      { at: PE.x + 980, on: () => pop('popup_ai') },
      { at: PF.x + 640, on: () => pop('popup_wife', 3) },
      { at: PG.x + 500, on: () => pop('popup_wife_startup') },
    ];
    let leaveT = -1, fired = 0, eraIdx = -1, lastTx = 0, homeFired = false, lightT = 0;
    const st = { cam: 0 };

    function partyAt(tx, t) {
      let p = 1;
      for (const e of EVENTS) if (e.party && tx >= e.at) p = e.party;
      if (leaveT >= 0 && tx >= PE.x + 260) p = Math.max(2, 5 - Math.floor((t - leaveT) / 0.9));
      if (tx >= PF.x + 640) p = 3;                      // sau bão: thêm vợ
      return p;
    }

    function reset() {
      fired = 0; eraIdx = -1; leaveT = -1; lastTx = 0; homeFired = false; lightT = 0;
      areaEl.classList.remove('on'); meter.classList.remove('on'); meter.style.setProperty('--v', 0);
      rain.length = 0; sparks.length = 0; petals.length = 0;
      setParty(1);
    }

    /* ---------- mưa / sấm / hạt sáng AI (canvas màn hình, 1/3 độ phân giải) ---------- */
    const rain = [], sparks = [], petals = [];
    const rand = (a, b) => a + Math.random() * (b - a);
    let lastParty = 1;

    function frame(t, dt, pv) {
      const tx = txAt(clamp(pv));
      const PP = PANELS[panelOf(tx)];
      const cam = clamp(tx - VWw * 0.38, PP.x, PP.x + Math.max(0, PP.w - VWw));
      st.cam = cam;
      if (lastTx && panelOf(lastTx) !== panelOf(tx)) {   // sang tấm mới: mỗi chỗ một hiệu ứng chuyển cảnh
        const TR = ['iris', 'iris', 'night', 'blinds', 'bolt', 'dissolve', 'page'];
        const to = panelOf(tx), kind = to > panelOf(lastTx) ? TR[to] : 'flash';
        (window.__storyTransit || (() => retrigger(root.querySelector('.flash'))))(kind);
        if (kind !== 'bolt') Sound.clunk();
      }
      const moved = Math.abs(tx - lastTx) > 400 ? 0 : tx - lastTx; lastTx = tx;
      wd.style.transform = `translate(${(-cam * S).toFixed(1)}px, 0) scale(${S})`;

      /* --- sự kiện --- */
      let nf = 0;
      for (let i = 0; i < EVENTS.length; i++) if (tx >= EVENTS[i].at) nf = i + 1;
      if (nf > fired) { for (let i = fired; i < nf; i++) EVENTS[i].on(t); }
      if (tx < PE.x + 260) leaveT = -1;
      fired = nf;
      const party = partyAt(tx, t);
      if (party !== lastParty) {
        if (party < lastParty && leaveT >= 0 && tx < PF.x) pop('popup_left', party);
        lastParty = party; setParty(party);
      }

      /* --- mốc năm (banner) --- */
      let ei = -1;
      for (let i = 0; i < ERAS.length; i++) if (tx >= ERAS[i][1]) ei = i;
      if (ei !== eraIdx) {
        eraIdx = ei;
        if (ei >= 0) {
          const u = UIT(ERAS[ei][0]);
          areaEl.querySelector('small').textContent = u.title;
          areaEl.querySelector('b').textContent = u.sub;
          retrigger(areaEl);
        } else areaEl.classList.remove('on');
      }

      /* --- thời tiết --- */
      const storm = clamp((tx - STORM0) / 500) * (1 - clamp((tx - STORM1) / (DAWN1 - STORM1)));
      const thunder = tx >= PE.x - 200 && tx < STORM1 ? 1 : 0;
      dark.style.opacity = (storm * (0.25 + 0.2 * thunder)).toFixed(3);
      glow.style.opacity = (clamp((tx - STORM1) / (DAWN1 - STORM1)) * (1 - clamp((tx - PF.x + 100) / 400))).toFixed(3);
      if (thunder && t - lightT > rand(3.5, 7)) { lightT = t; retrigger(bolt); Sound.clunk(); }
      // RESILIENCE: đầy dần qua giai đoạn khó khăn
      const res = clamp((tx - STORM0) / (PE.x + 880 - STORM0));
      meter.classList.toggle('on', tx >= STORM0 - 100);
      meter.style.setProperty('--v', res.toFixed(3));
      meter.classList.toggle('max', res >= 0.999);

      /* --- nhân vật --- */
      const inDoors = inside(tx);
      show(trung, !inDoors);
      setFrame(trung, Math.abs(moved) > 0.05 ? Math.floor(tx / 44) % 4 : 1, tx);
      // đồng nghiệp ôm thùng đồ rời văn phòng (đi sang trái)
      const lk = leaveT >= 0 ? t - leaveT : -1;
      show(leavers, lk >= 0 && lk < 4.2);
      if (lk >= 0 && lk < 4.2) {
        leavers.el.style.opacity = (lk > 3.4 ? (4.2 - lk) / 0.8 : 1).toFixed(2);
        setFrame(leavers, Math.floor(lk * 7) % 4, PE.x + 640 - lk * 130);
      }

      /* --- mưa + hạt sáng --- */
      const W = fxCv.width, Hh = fxCv.height;
      fctx.clearRect(0, 0, W, Hh);
      const rainK = storm * (reduce ? 0 : 1);
      const want = Math.floor(rainK * 260);
      while (rain.length < want) rain.push({ x: rand(0, W), y: rand(-Hh, Hh), v: rand(160, 240) });
      if (rain.length > want) rain.length = want;
      fctx.fillStyle = 'rgba(200,215,235,.55)';
      for (const d of rain) {
        d.y += d.v * dt; d.x -= d.v * 0.25 * dt;
        if (d.y > Hh) { d.y = rand(-20, 0); d.x = rand(0, W + 40); }
        fctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 4);
      }
      const ai = clamp((tx - (PE.x + 900)) / 300) * (1 - clamp((tx - PF.x + 200) / 300));
      const wed = clamp((tx - PF.x + 200) / 400) * (1 - clamp((tx - PG.x + 100) / 300));
      if (ai > 0 && !reduce && Math.random() < ai * 0.8) sparks.push({ x: rand(0, W), y: Hh + 2, v: rand(10, 30), born: t, life: rand(2, 4), c: Math.random() < 0.5 ? '#9fd3ff' : '#c9a8ff' });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i], a = (t - s.born) / s.life;
        if (a >= 1) { sparks.splice(i, 1); continue; }
        s.y -= s.v * dt; s.x += Math.sin((t + i) * 2) * 0.2;
        fctx.globalAlpha = (1 - a) * ai; fctx.fillStyle = s.c;
        fctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
      }
      fctx.globalAlpha = 1;
      if (wed > 0 && !reduce && Math.random() < wed * 0.6) petals.push({ x: rand(0, W), y: -2, vx: rand(-6, 4), v: rand(8, 16), ph: rand(0, 6), c: Math.random() < 0.5 ? '#ffd1dc' : '#fffaf0' });
      for (let i = petals.length - 1; i >= 0; i--) {
        const pt = petals[i];
        pt.y += pt.v * dt; pt.x += (pt.vx + Math.sin(t * 2 + pt.ph) * 6) * dt;
        if (pt.y > Hh || wed <= 0) { petals.splice(i, 1); continue; }
        fctx.fillStyle = pt.c; fctx.fillRect(Math.round(pt.x), Math.round(pt.y), Math.sin(t * 4 + pt.ph) > 0 ? 2 : 1, 1);
      }

      /* --- lời thoại --- */
      let li = 0;
      for (let i = 0; i < LINES.length; i++) if (tx >= LINES[i][1]) li = i;
      say('x' + li, LN(LINES[li][0]), 'SCROLL ▼');

      Sound.setSpeed(0);
      if (!homeFired && pv >= HOME_AT) { homeFired = true; if (onDone) onDone(); }
      if (pv < HOME_AT - 0.05) homeFired = false;
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // khung hình đầu (để "khử pixel" khi zoom từ bản đồ vào Hà Nội)
    function drawFirst(ctx, w, h) {
      const im = PA.img;
      if (!im || !im.complete || !im.naturalWidth) return false;
      ctx.drawImage(im, 0, 0, Math.min(im.naturalWidth, (w / h) * H), H, 0, 0, w, h);
      return true;
    }
    return { fit, frame, reset, drawFirst, get trackVh() { return 1600; } };
  }
  return { create };
})();
