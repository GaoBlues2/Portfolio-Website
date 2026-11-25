/* ABOUT – menu tạm dừng JRPG mở ra từ tấm giấy khen trên tường.
   Click giấy khen / nav ABOUT → trang chủ zoom vào giấy khen + mờ đi → tờ giấy bung ra (steps) → con dấu sáp đập "cộp" → STATUS.
   Nội dung: js/about-data.js. Style: css/about.src.css (→ css/about.css bằng tools/about_css.py). Vào thẳng: index.html#about */
(() => {
  const D = window.ABOUT_DATA;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } } };
  const ic = (i, cls = '') => `<i class="ic ${cls}" style="--i:${i}" aria-hidden="true"></i>`;
  const bd = (i) => `<i class="bd" style="--i:${i}" aria-hidden="true"></i>`;

  /* ---------- Âm thanh 8-bit nhỏ (tôn trọng nút ♪ của story: localStorage pf_mute) ---------- */
  let ac = null;
  const muted = () => ls.get('pf_mute') === '1';
  function ctx() {
    if (muted()) return null;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, d = 0.05, type = 'square', v = 0.05, at = 0, f2 = 0) {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.02);
  }
  function noise(d = 0.2, v = 0.2, freq = 900, at = 0) {
    const c = ctx(); if (!c) return;
    const t = c.currentTime + at, n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = v;
    s.buffer = buf; s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  const sfx = {
    move: () => tone(660, 0.04, 'square', 0.035),
    ok: () => { tone(880, 0.05, 'square', 0.04); tone(1320, 0.07, 'square', 0.04, 0.05); },
    back: () => tone(520, 0.08, 'square', 0.035, 0, 330),
    paper: () => noise(0.35, 0.18, 2600),
    thud: () => { tone(120, 0.22, 'sine', 0.35, 0, 45); noise(0.12, 0.35, 500); },
    unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.09, 'square', 0.04, i * 0.08)),
    insert: () => { noise(0.08, 0.4, 700); tone(160, 0.12, 'square', 0.08, 0, 70); tone(90, 0.18, 'sine', 0.3, 0.04, 50); },
    power: () => { tone(60, 0.35, 'sawtooth', 0.04, 0, 900); noise(0.25, 0.08, 4000, 0.05); },
  };
  window.__sfx = sfx;   // MY WORK (work.js) dùng chung

  /* ---------- Thành tựu bí mật ---------- */
  const SECRET = { cat: 'pf_ach_cat', story: 'pf_ach_story', explorer: 'pf_ach_explorer', talk: 'pf_ach_talk' };
  const unlocked = (a) => !a.secret || ls.get(SECRET[a.secret]) === '1';
  document.querySelector('.hot--cat')?.addEventListener('click', () => ls.set(SECRET.cat, '1'));
  const sheetEl = document.querySelector('.sheet');
  if (sheetEl) new MutationObserver(() => { if (!sheetEl.hidden) ls.set(SECRET.story, '1'); }).observe(sheetEl, { attributes: true, attributeFilter: ['hidden'] });

  /* ---------- DOM ---------- */
  const root = document.createElement('section');
  root.className = 'about'; root.id = 'about-menu'; root.hidden = true;
  root.setAttribute('aria-label', 'About me'); root.setAttribute('role', 'dialog');
  root.innerHTML = `
    <div class="about__dim"></div>
    <div class="about__frame">
      <nav class="about__cmds" role="tablist">${D.menu.map((m, i) => `<button class="about__cmd" type="button" role="tab" data-i="${i}">${m.label}</button>`).join('')}</nav>
      <div class="about__paper">
        <div class="about__page"></div>
        <p class="about__hint">${D.hint}</p>
        <div class="about__seal bd" style="--i:11" aria-hidden="true"></div>
      </div>
      <button class="about__close" type="button" aria-label="Close">✕</button>
    </div>`;
  document.body.appendChild(root);
  const frame = $('.about__frame', root), cmds = $('.about__cmds', root), page = $('.about__page', root);
  const cmdBtns = [...cmds.children];

  let open = false, busy = false, tab = 0, focus = 'cmds';
  const sel = { skills: '4-1', inventory: D.inventorySelect, quests: 6, achievements: D.achSelect, save: 0 };
  const seen = new Set();

  function fit() {
    const W = innerWidth, H = innerHeight, narrow = W / H < 1.05;
    root.classList.toggle('about--narrow', narrow);
    const u = narrow ? Math.min(W / 760, H / 1100) : Math.min(W / 1600, H / 900) * 0.98;
    root.style.setProperty('--u', u.toFixed(4));
    if (open && D.menu[tab].id === 'skills') drawLines();
  }
  addEventListener('resize', fit);

  /* ---------- Từng tab ---------- */
  const R = {
    status() {
      const s = D.status;
      return `<div class="st">
        <div class="st__face"><img src="assets/about/portrait.webp?v=1" alt="Trung" /></div>
        <div class="st__who">
          <h3>${s.name}</h3>
          <span class="st__lv">LV ${s.level} <small>${s.next}</small></span>
          <ul class="st__rows">${s.rows.map(([k, v]) => `<li><span>${k}</span>${v}</li>`).join('')}</ul>
          <span class="st__open"><i></i>${s.open}</span>
        </div>
        <ul class="st__attrs">${s.attrs.map((a, k) => `<li style="--k:${k}">${ic(a.icon)}<span>${a.name}</span><em class="k-${a.kind}">${a.tag}</em></li>`).join('')}</ul>
        <div class="st__bars">
          <div class="st__bar st__bar--hp"><span>HP</span><b><i style="--v:${s.hp[0] / s.hp[1] * 100}%"></i></b><em>${s.hp[0]} / ${s.hp[1]}</em></div>
          <div class="st__bar st__bar--mp"><span>MP</span><b><i style="--v:${s.mp[0] / s.mp[1] * 100}%"></i></b><em>${ic(2)} ${s.mp[0]} / ${s.mp[1]}</em></div>
        </div>
      </div>
      <div class="about__desc st__bio">${ic(19)}<div>${s.bio.map(() => '<p></p>').join('')}</div></div>`;
    },
    skills() {
      const S = D.skills;
      return `<div class="sk"><svg class="sk__lines" aria-hidden="true"></svg>
        <div class="sk__core"><img src="assets/about/portrait.webp?v=1" alt="" /><b>LV ${D.status.level}</b></div>
        ${S.branches.map((b, bi) => `<div class="sk__br sk__br--${b.id}"><h4>${ic(b.icon)}${b.name}</h4><div class="sk__nodes">
          ${b.nodes.map((n, ni) => `<button type="button" class="sk__n ${n.m ? 'm' : 'l'}" data-k="${bi}-${ni}">${ic(n.icon)}<span>${n.name}</span></button>`).join('')}
        </div></div>`).join('')}
        <div class="sk__legend"><span><i></i>${S.legend[0]}</span><span><i></i>${S.legend[1]}</span></div>
      </div><div class="about__desc"></div>`;
    },
    inventory() {
      return `<div class="inv">${D.inventory.map((it, k) => `<button type="button" class="inv__s" data-k="${k}" aria-label="${it.name}">${ic(it.icon)}${it.pet ? '<em>PET</em>' : ''}</button>`).join('')}</div>
        <div class="about__desc"></div>`;
    },
    quests() {
      let k = 0;
      const card = (q) => `<button type="button" class="qs__c${q.current ? ' cur' : ''}" data-k="${k++}">${ic(q.icon)}<b>${q.years} · ${q.name}<small>${q.role}</small></b><span>${q.desc}</span></button>`;
      const [c1, c2, c3] = D.quests;
      const head = (c) => `<h4>${ic(c.icon)}${c.ch} ${c.title}${c.place ? ` <small>· ${c.place}</small>` : ''}</h4>`;
      return `<div class="qs">
        <div class="qs__top">
          <div class="qs__ch">${head(c1)}<div class="qs__list">${c1.items.map(card).join('')}</div></div>
          <div class="qs__ch">${head(c2)}<div class="qs__list">${c2.items.map(card).join('')}</div></div>
        </div>
        <div class="qs__ch qs__ch--big">${head(c3)}
          <div class="qs__duo"><i></i><span>${c3.party}</span></div>
          <div class="qs__list">${c3.items.map(card).join('')}</div>
        </div>
      </div><div class="about__desc"></div>`;
    },
    achievements() {
      const n = D.achievements.filter(unlocked).length;
      return `<span class="ac__count">🏆 ${n} / ${D.achievements.length} ${D.achUnlocked}</span>
        <div class="ac">${D.achievements.map((a, k) => {
          const u = unlocked(a), fresh = u && a.secret && ls.get(SECRET[a.secret] + '_seen') !== '1';
          if (fresh) ls.set(SECRET[a.secret] + '_seen', '1');
          return `<button type="button" class="ac__b${u ? '' : ' lock'}${a.secret ? ' secret' : ''}${fresh ? ' new' : ''}" data-k="${k}">${bd(a.badge)}<b>${u ? a.name : D.achLocked}</b></button>`;
        }).join('')}</div>
        <div class="about__desc"></div>`;
    },
    save() {
      return `<div class="sv">${D.save.map((s, k) => `<a class="sv__s" data-k="${k}" data-id="${s.id}" href="${s.href}"${s.id === 'cv' ? ' download' : ''}>${ic(s.icon)}<b>${s.title}</b><span>${s.sub}</span></a>`).join('')}</div>
        <p class="sv__note">♥ Thanks for playing. Progress saved.</p>`;
    },
  };

  /* mô tả của mục đang chọn */
  const DESC = {
    skills(k) {
      const [bi, ni] = String(k).split('-').map(Number), n = D.skills.branches[bi].nodes[ni];
      return `${ic(n.icon)}<div><b>${n.name.toUpperCase()}</b> — ${n.desc}<small>${n.m ? 'MASTERED' : 'LEARNING'} · ${n.where}</small></div>`;
    },
    inventory(k) { const it = D.inventory[k]; return `${ic(it.icon)}<div><b>${it.name}</b> — ${it.desc}</div>`; },
    quests(k) {
      const q = D.quests.flatMap((c) => c.items)[k];
      return `${ic(q.icon)}<div><b>${q.name.toUpperCase()}</b> · ${q.years}${q.current ? ` · ★ ${D.questCurrent}` : ''}<small>${q.role} — ${q.desc}</small></div><button type="button" class="chip" data-replay="${q.replay}">▶ REPLAY IN STORY</button>`;
    },
    achievements(k) {
      const a = D.achievements[k], u = unlocked(a);
      return `${bd(a.badge)}<div>${u ? `<b>${a.name}</b> — ${a.desc}<small>${D.achUnlocked}${a.when ? ` · ${a.when}` : ''}</small>` : `<b>${D.achLocked}</b> — ${a.hint}`}</div>`;
    },
  };

  function items() { return [...page.querySelectorAll('[data-k]')]; }
  function pick(k, { sound = true } = {}) {
    const id = D.menu[tab].id, list = items();
    if (!list.length) return;
    const el = list.find((e) => e.dataset.k === String(k)) || list[0];
    list.forEach((e) => e.classList.toggle('sel', e === el));
    sel[id] = id === 'skills' ? el.dataset.k : Number(el.dataset.k);
    const box = $('.about__desc', page);
    if (box && DESC[id]) box.innerHTML = DESC[id](el.dataset.k);
    if (sound) sfx.move();
    if (root.classList.contains('about--narrow')) el.scrollIntoView({ block: 'nearest' });
  }

  let typeTok = 0;
  async function typeBio() {
    const tok = ++typeTok, ps = [...page.querySelectorAll('.st__bio p')];
    for (let i = 0; i < ps.length; i++) {
      const s = D.status.bio[i];
      if (reduce) { ps[i].textContent = s; continue; }
      for (let c = 1; c <= s.length; c++) { if (tok !== typeTok) return; ps[i].textContent = s.slice(0, c); await wait(16); }
      await wait(120);
    }
  }

  function drawLines() {
    const svg = $('.sk__lines', page), core = $('.sk__core', page);
    if (!svg || !core || root.classList.contains('about--narrow')) return;
    const box = svg.getBoundingClientRect(), u = parseFloat(root.style.getPropertyValue('--u')) || 1;
    const c = core.getBoundingClientRect(), cx = c.left + c.width / 2 - box.left, cy = c.top + c.height / 2 - box.top;
    const d = [...page.querySelectorAll('.sk__br')].map((b) => {
      const r = b.getBoundingClientRect(), l = r.left - box.left, t = r.top - box.top, rr = r.right - box.left, bb = r.bottom - box.top, mx = (l + rr) / 2, my = (t + bb) / 2;
      if (bb < cy - c.height / 2) return `M${cx} ${cy}L${mx} ${cy}L${mx} ${bb}`;         // nhánh trên: rẽ góc
      if (t > cy + c.height / 2) return `M${cx} ${cy}L${cx} ${t}`;                         // nhánh dưới (AI)
      return `M${cx} ${cy}L${mx < cx ? rr : l} ${cy}`;                                      // hai bên
    });
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = d.map((p) => `<path d="${p}"/>`).join('') + `<circle cx="${cx}" cy="${cy}" r="${6 * u}" fill="#b8461a"/>`;
  }

  function render(i, { sound = true, type = true } = {}) {
    tab = (i + D.menu.length) % D.menu.length;
    const id = D.menu[tab].id;
    cmdBtns.forEach((b, k) => { b.classList.toggle('sel', k === tab); b.setAttribute('aria-selected', k === tab); });
    seen.add(id); cmdBtns[tab].classList.add('seen');
    if (root.classList.contains('about--narrow')) cmdBtns[tab].scrollIntoView({ block: 'nearest', inline: 'center' });
    page.className = `about__page about__page--${id}`;
    void page.offsetWidth;
    page.innerHTML = `<h2 class="about__title">${D.titles[id]}</h2>` + R[id]();
    root.classList.remove('play'); void page.offsetWidth; root.classList.add('play');
    if (sound) sfx.move();
    if (id === 'status' && type) typeBio(); else typeTok++;
    if (id === 'skills') requestAnimationFrame(drawLines);
    if (DESC[id] || id === 'save') pick(sel[id], { sound: false });
    if (id === 'save') checkCv();
    if (seen.size === D.menu.length && ls.get(SECRET.explorer) !== '1') { ls.set(SECRET.explorer, '1'); setTimeout(sfx.unlock, 300); }
  }

  let cvOk = null;
  async function checkCv() {
    const a = page.querySelector('[data-id="cv"]'); if (!a) return;
    if (cvOk === null) { try { cvOk = (await fetch(a.getAttribute('href'), { method: 'HEAD' })).ok; } catch (e) { cvOk = false; } }
    if (!cvOk) { a.classList.add('off'); a.removeAttribute('href'); a.removeAttribute('download'); $('span', a).textContent = D.save[0].soon; }
  }

  function setFocus(f) { focus = f; cmds.classList.toggle('dim', f === 'panel'); }

  /* ---------- Hành động ---------- */
  async function act(el) {
    const id = D.menu[tab].id;
    if (id === 'quests') { replay(D.quests.flatMap((c) => c.items)[Number(el.dataset.k)].replay); return; }
    if (id === 'save') {
      if (el.classList.contains('off')) { sfx.back(); return; }
      const href = el.getAttribute('href');
      if (href === '#story') { sfx.ok(); replay('w1'); return; }
      if (href.startsWith('#')) { sfx.ok(); await close(); location.hash = href; return; }
      sfx.ok(); el.click();
    }
  }
  async function replay(w) {
    sfx.ok();
    await close();
    const st = window.__story; if (!st) return;
    const steam = document.getElementById('steam'), r = steam && steam.getBoundingClientRect();
    st.open(r ? { x: r.left + r.width / 2, y: r.bottom } : null, { gesture: true, world2: w === 'w2', world3: w === 'w3' });
  }

  page.addEventListener('mousemove', (e) => {
    const el = e.target.closest('[data-k]'); if (!el || el.classList.contains('sel')) return;
    setFocus('panel'); pick(el.dataset.k);
  });
  page.addEventListener('click', (e) => {
    const rp = e.target.closest('[data-replay]'); if (rp) { replay(rp.dataset.replay); return; }
    const el = e.target.closest('[data-k]'); if (!el) return;
    const id = D.menu[tab].id;
    if (id === 'save') { e.preventDefault(); act(el); return; }
    if (!el.classList.contains('sel')) { setFocus('panel'); pick(el.dataset.k); } else if (id === 'quests') act(el); else sfx.ok();
  });
  cmds.addEventListener('click', (e) => {
    const b = e.target.closest('.about__cmd'); if (!b) return;
    setFocus('cmds'); if (Number(b.dataset.i) !== tab) render(Number(b.dataset.i)); else sfx.ok();
  });
  $('.about__close', root).addEventListener('click', () => close());
  $('.about__dim', root).addEventListener('click', () => close());

  /* di chuyển trong lưới theo vị trí thật trên màn hình */
  function move(dx, dy) {
    const list = items(); if (!list.length) return false;
    const cur = list.find((e) => e.classList.contains('sel')) || list[0];
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bs = Infinity;
    for (const e of list) {
      if (e === cur) continue;
      const b = e.getBoundingClientRect(), vx = b.left + b.width / 2 - ax, vy = b.top + b.height / 2 - ay;
      const along = dx ? vx * dx : vy * dy, across = dx ? Math.abs(vy) : Math.abs(vx);
      if (along <= 4) continue;
      const score = along + across * 2.5;
      if (score < bs) { bs = score; best = e; }
    }
    if (best) { pick(best.dataset.k); return true; }
    return false;
  }

  addEventListener('keydown', (e) => {
    if (!open || busy) return;
    const k = e.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Escape'].includes(k)) return;
    e.preventDefault();
    const hasItems = items().length > 0;
    if (focus === 'cmds') {
      if (k === 'ArrowUp') render(tab - 1);
      else if (k === 'ArrowDown') render(tab + 1);
      else if ((k === 'Enter' || k === ' ' || k === 'ArrowRight') && hasItems) { setFocus('panel'); sfx.ok(); }
      else if (k === 'Escape') close();
    } else {
      if (k === 'Escape') { setFocus('cmds'); sfx.back(); }
      else if (k === 'Enter' || k === ' ') { const el = page.querySelector('[data-k].sel'); if (el) act(el); }
      else {
        const ok = move(k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0, k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0);
        if (!ok && k === 'ArrowLeft') { setFocus('cmds'); sfx.back(); }
      }
    }
  });

  /* ---------- Mở / đóng ---------- */
  const hot = () => document.querySelector('.hot[data-label="about"]');
  async function openAbout({ fromPop = false } = {}) {
    if (open || busy || document.body.classList.contains('in-story')) return;
    busy = true;
    const sheet = document.querySelector('.sheet');
    if (sheet && !sheet.hidden) { sheet.classList.remove('on', 'play'); sheet.hidden = true; }
    if (!fromPop && location.hash !== '#about') history.pushState({ about: 1 }, '', '#about');
    const h = hot(), r = h ? h.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const vp = document.querySelector('.viewport');
    vp.style.setProperty('--zx', `${cx}px`); vp.style.setProperty('--zy', `${cy}px`);
    root.hidden = false; root.classList.remove('fold', 'unfold', 'sealed', 'play', 'on');
    fit();
    frame.style.setProperty('--fx', `${cx - (innerWidth - frame.offsetWidth) / 2}px`);
    frame.style.setProperty('--fy', `${cy - (innerHeight - frame.offsetHeight) / 2}px`);
    setFocus('cmds'); render(0, { sound: false, type: false }); root.classList.remove('play');
    document.body.classList.add('about-zoom', 'about-open', 'about-anim');
    root.classList.add('on');
    await wait(reduce ? 0 : 420);
    sfx.paper();
    root.classList.add('unfold');
    await wait(reduce ? 0 : 560);
    root.classList.add('sealed');
    await wait(reduce ? 0 : 200);
    sfx.thud(); root.classList.add('thud'); setTimeout(() => root.classList.remove('thud'), 400);
    root.classList.add('play'); typeBio();
    document.body.classList.remove('about-anim');
    open = true; busy = false;
    cmdBtns[0].focus({ preventScroll: true });
  }
  async function close({ fromPop = false } = {}) {
    if (!open || busy) return;
    busy = true; typeTok++;
    document.body.classList.add('about-anim');
    sfx.back();
    root.classList.remove('play', 'sealed', 'unfold'); root.classList.add('fold');
    document.body.classList.remove('about-zoom');
    if (!fromPop && location.hash === '#about') history.pushState({}, '', location.pathname + location.search);
    await wait(reduce ? 0 : 480);
    root.classList.remove('on');
    await wait(reduce ? 0 : 250);
    root.hidden = true; root.classList.remove('fold');
    document.body.classList.remove('about-open', 'about-anim');
    open = false; busy = false;
  }

  document.querySelectorAll('a[href="#about"]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); ctx(); openAbout(); }));
  addEventListener('popstate', () => {
    if (location.hash === '#about') openAbout({ fromPop: true });
    else if (open) close({ fromPop: true });
  });
  if (location.hash === '#about') setTimeout(() => openAbout({ fromPop: true }), 350);

  window.__about = { open: openAbout, close, get open_() { return open; }, render, pick };
})();
