/* MY WORK – kệ băng game mở ra từ máy chơi game cổ trên bàn.
   Click máy chơi game / nav MY WORK / index.html#work → trang chủ zoom vào máy → màn CRT bật → GAME LIBRARY.
   Chọn băng → băng bay vào khe máy (cạch) → màn tiêu đề PRESS START → bìa sau hộp game (chi tiết dự án).
   Nội dung: js/work-data.js. Style: css/work.src.css (→ css/work.css bằng tools/about_css.py). */
(() => {
  const D = window.WORK_DATA;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sfx = new Proxy({}, { get: (_, k) => () => window.__sfx && window.__sfx[k] && window.__sfx[k]() });
  const SHELL_C = ['#f26a2e', '#2fb3a5', '#e8b23a', '#a77bd8', '#d9cdb8'];
  const ROW_Y = [250, 444, 640];        // mặt trên 3 tầng kệ trong ảnh library (1672x941)
  const PLAQUE_Y = [281, 478, 681];     // tâm bảng đồng
  const ic = (i) => `<i class="ic" style="--i:${i}" aria-hidden="true"></i>`;

  /* ---------- DOM ---------- */
  const root = document.createElement('section');
  root.className = 'work'; root.id = 'work-menu'; root.hidden = true;
  root.setAttribute('aria-label', 'My work'); root.setAttribute('role', 'dialog');
  const cartHTML = (g, k) => `<button type="button" class="cart${g.shelf === 0 ? ' cart--big' : ''}" data-k="${k}" style="--sh:${g.shell};--a:${g.art}" aria-label="${g.name}">
      <i class="cart__art"></i><b class="cart__name">${g.short || g.name}</b>${g.shelf === 0 ? '<em class="cart__tag">★</em>' : ''}${g.wip ? '<em class="cart__tag cart__tag--wip">WIP</em>' : ''}</button>`;
  root.innerHTML = `
    <div class="work__crt">
      <div class="work__lib"></div>
      <div class="work__top">
        <h2 class="work__title">${D.title}</h2>
        <div class="work__filters">${D.filters.map((f, i) => `<button type="button" class="work__f${i ? '' : ' on'}" data-f="${f}">${f}</button>`).join('')}</div>
      </div>
      ${D.shelves.map((s, i) => `<span class="work__plaque" style="left:calc(846px * var(--u));top:calc(${PLAQUE_Y[i] - 17}px * var(--u))">${s}</span>
        <div class="work__row" style="top:calc(${ROW_Y[i] - 170}px * var(--u))">${D.games.map((g, k) => (g.shelf === i ? cartHTML(g, k) : '')).join('')}</div>`).join('')}
      <div class="work__info" aria-live="polite"></div>
      <div class="work__console"><i></i></div>
      <button class="work__close" type="button" aria-label="Close">✕</button>
      <div class="work__boot" aria-hidden="true"><i></i><b></b><span>${D.pressStart}</span></div>
      <article class="work__detail" aria-live="polite"></article>
    </div>`;
  document.body.appendChild(root);
  const crt = $('.work__crt', root), info = $('.work__info', root), boot = $('.work__boot', root), detail = $('.work__detail', root), consoleEl = $('.work__console', root);
  const carts = [...root.querySelectorAll('.cart')];

  let open = false, busy = false, view = 'lib', sel = 0, filter = 'ALL', shot = 0, cur = null;

  function fit() {
    const W = innerWidth, H = innerHeight, narrow = W / H < 1.05;
    root.classList.toggle('work--narrow', narrow);
    const u = narrow ? Math.min(W / 760, 1.2) : Math.min(W / 1672, H / 941);
    root.style.setProperty('--u', u.toFixed(4));
  }
  addEventListener('resize', fit);

  /* ---------- Kệ ---------- */
  const visible = () => carts.filter((c) => !c.classList.contains('dim'));
  function select(k, { sound = true } = {}) {
    const el = carts[k]; if (!el || el.classList.contains('dim')) return;
    sel = k; carts.forEach((c) => c.classList.toggle('sel', c === el));
    const g = D.games[k];
    info.innerHTML = `<span class="wd__cart" style="--sh:${g.shell};--a:${g.art};width:calc(70px * var(--u))"><i></i></span><div><b>${g.name}</b><small>${g.year} · ${g.publisher}${g.tags.length ? ' · ' + g.tags.join(' / ') : ''}${g.wip ? ' · ' + D.labels.wip : ''}</small></div><em>ENTER ▶ INSERT</em>`;
    if (sound) sfx.move();
    if (root.classList.contains('work--narrow') && view === 'lib') el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function setFilter(f) {
    filter = f;
    root.querySelectorAll('.work__f').forEach((b) => b.classList.toggle('on', b.dataset.f === f));
    carts.forEach((c, k) => c.classList.toggle('dim', f !== 'ALL' && !D.games[k].tags.includes(f)));
    if (carts[sel].classList.contains('dim')) { const v = visible()[0]; if (v) select(+v.dataset.k, { sound: false }); }
    sfx.ok();
  }
  function move(dx, dy) {
    const list = visible(); const a = carts[sel].getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bs = Infinity;
    for (const e of list) {
      if (e === carts[sel]) continue;
      const b = e.getBoundingClientRect(), vx = b.left + b.width / 2 - ax, vy = b.top + b.height / 2 - ay;
      const along = dx ? vx * dx : vy * dy, across = dx ? Math.abs(vy) : Math.abs(vx);
      if (along <= 4) continue;
      const sc = along + across * (dx ? 3 : 0.6);
      if (sc < bs) { bs = sc; best = e; }
    }
    if (best) select(+best.dataset.k);
  }

  /* ---------- Cắm băng ---------- */
  async function insert(k) {
    if (busy) return;
    const g = D.games[k], el = carts[k]; busy = true; cur = k;
    const narrow = root.classList.contains('work--narrow');
    if (!narrow && !reduce) {
      const r = el.getBoundingClientRect(), c = consoleEl.getBoundingClientRect(), box = crt.getBoundingClientRect();
      const fly = el.cloneNode(true); fly.className = 'cart work__fly' + (g.shelf === 0 ? ' cart--big' : '');
      Object.assign(fly.style, { left: `${r.left - box.left}px`, top: `${r.top - box.top}px` });
      crt.appendChild(fly); el.style.visibility = 'hidden';
      const tx = c.left + c.width * 0.66 - (r.left + r.width / 2), ty = c.top + c.height * 0.12 - (r.top + r.height);
      await fly.animate([{ transform: 'none' }, { transform: `translate(${tx * 0.5}px, ${ty * 0.5 - 120}px) rotate(-8deg)`, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty + r.height * 0.6}px) scale(.62)` }], { duration: 650, easing: 'steps(10)' }).finished;
      fly.remove(); el.style.visibility = '';
      consoleEl.classList.remove('thunk'); void consoleEl.offsetWidth; consoleEl.classList.add('thunk');
    }
    sfx.insert();
    boot.style.setProperty('--a', g.art); boot.style.setProperty('--c', SHELL_C[g.shell]);
    $('i', boot).style.setProperty('--a', g.art); $('b', boot).textContent = g.name;
    boot.classList.add('on'); view = 'boot';
    await wait(150); sfx.ok();
    busy = false;
    bootTimer = setTimeout(showDetail, reduce ? 300 : 1500);
  }
  let bootTimer = 0;
  function showDetail() {
    clearTimeout(bootTimer);
    if (view !== 'boot') return;
    boot.classList.remove('on'); view = 'detail'; shot = 0;
    renderDetail(); detail.classList.add('on'); sfx.ok();
    $('.wd__btns .chip:last-child', detail).focus({ preventScroll: true });
  }
  function renderDetail() {
    const g = D.games[cur], L = D.labels, shots = g.shots || [];
    const screen = shots.length ? `url(${shots[shot]})` : 'url(assets/work/labels.webp?v=1)';
    const pos = shots.length ? 'center / cover' : `${g.art * 12.5}% 0 / 900% 100%`;
    detail.style.setProperty('--c', SHELL_C[g.shell]);
    detail.innerHTML = `
      <div class="wd__head"><div class="wd__cart" style="--sh:${g.shell};--a:${g.art}"><i></i></div>
        <div><h2>${g.name}</h2><div class="wd__meta"><span>${L.publisher}: ${g.publisher}</span><span>${L.year}: ${g.year}</span>
          ${g.tags.map((t) => `<span class="t">${t}</span>`).join('')}${g.wip ? `<span class="w">${L.wip}</span>` : ''}</div></div></div>
      <div class="wd__body">
        <div class="wd__screen"><div style="background:${screen} ${pos} no-repeat"></div>
          ${shots.length > 1 ? '<button class="wd__nav wd__nav--l" type="button" data-shot="-1">◀</button><button class="wd__nav wd__nav--r" type="button" data-shot="1">▶</button>' : ''}
          <p>${shots.length ? `${shot + 1} / ${shots.length}` : L.noShots}</p></div>
        <div class="wd__info">
          <section class="wd__sec"><h4>${ic(14)}${L.story}</h4><p>${g.story}</p></section>
          <section class="wd__sec"><h4>${ic(0)}${L.role}</h4><p>${g.role}</p></section>
          <section class="wd__sec"><h4>${ic(13)}${L.party}</h4><div class="wd__party">${g.party.map(([i, n]) => `<span>${ic(i)}${n}</span>`).join('')}</div></section>
          <section class="wd__sec"><h4>${ic(16)}${L.score}</h4><p class="wd__score">${g.score || L.unknown}</p></section>
          ${g.nda ? `<p class="wd__nda">${L.nda}</p>` : ''}
        </div>
      </div>
      <div class="wd__btns">
        <a class="chip play" ${g.link ? `href="${g.link}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>${L.play}</a>
        <button class="chip" type="button" data-eject>${L.eject}</button>
      </div>`;
  }
  function eject() {
    if (view === 'boot') { clearTimeout(bootTimer); boot.classList.remove('on'); }
    detail.classList.remove('on'); view = 'lib'; sfx.back();
    carts[sel] && carts[sel].focus({ preventScroll: true });
  }

  /* ---------- Sự kiện ---------- */
  carts.forEach((c) => {
    c.addEventListener('mousemove', () => { if (sel !== +c.dataset.k && view === 'lib') select(+c.dataset.k); });
    c.addEventListener('click', () => { if (view !== 'lib') return; if (sel !== +c.dataset.k) select(+c.dataset.k, { sound: false }); insert(+c.dataset.k); });
  });
  root.querySelectorAll('.work__f').forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.f)));
  boot.addEventListener('click', showDetail);
  detail.addEventListener('click', (e) => {
    if (e.target.closest('[data-eject]')) eject();
    const s = e.target.closest('[data-shot]');
    if (s) { const n = (D.games[cur].shots || []).length; shot = (shot + +s.dataset.shot + n) % n; renderDetail(); sfx.move(); }
  });
  $('.work__close', root).addEventListener('click', () => close());

  addEventListener('keydown', (e) => {
    if (!open || busy) return;
    const k = e.key;
    if (view === 'boot') { if (['Enter', ' ', 'Escape'].includes(k)) { e.preventDefault(); k === 'Escape' ? eject() : showDetail(); } return; }
    if (view === 'detail') {
      if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); eject(); }
      else if ((k === 'ArrowLeft' || k === 'ArrowRight') && (D.games[cur].shots || []).length > 1) { e.preventDefault(); $(`[data-shot="${k === 'ArrowLeft' ? -1 : 1}"]`, detail).click(); }
      return;
    }
    if (k === 'Escape') { e.preventDefault(); close(); }
    else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); move(k === 'ArrowLeft' ? -1 : 1, 0); }
    else if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); move(0, k === 'ArrowUp' ? -1 : 1); }
    else if (k === 'Enter' || k === ' ') { if (document.activeElement && document.activeElement.classList.contains('work__f')) return; e.preventDefault(); insert(sel); }
  });

  /* ---------- Mở / đóng ---------- */
  async function openWork({ fromPop = false } = {}) {
    if (open || busy || document.body.classList.contains('in-story')) return;
    if (window.__about && window.__about.open_) await window.__about.close();
    busy = true;
    const sheet = document.querySelector('.sheet');
    if (sheet && !sheet.hidden) { sheet.classList.remove('on', 'play'); sheet.hidden = true; }
    if (!fromPop && location.hash !== '#work') history.pushState({ work: 1 }, '', '#work');
    const h = document.querySelector('.hot[data-label="work"]'), r = h ? h.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const vp = document.querySelector('.viewport');
    vp.style.setProperty('--zx', `${r.left + r.width * 0.55}px`); vp.style.setProperty('--zy', `${r.top + r.height * 0.4}px`);
    document.body.classList.add('work-zoom', 'about-open', 'about-anim');
    await wait(reduce ? 0 : 650);
    fit(); view = 'lib'; detail.classList.remove('on'); boot.classList.remove('on');
    root.hidden = false; root.classList.remove('off'); void root.offsetWidth; root.classList.add('on');
    sfx.power();
    select(sel, { sound: false });
    await wait(reduce ? 0 : 520);
    document.body.classList.remove('about-anim');
    open = true; busy = false;
    carts[sel].focus({ preventScroll: true });
  }
  async function close({ fromPop = false } = {}) {
    if (!open || busy) return;
    busy = true; clearTimeout(bootTimer);
    document.body.classList.add('about-anim');
    sfx.back();
    root.classList.remove('on'); root.classList.add('off');
    if (!fromPop && location.hash === '#work') history.pushState({}, '', location.pathname + location.search);
    await wait(reduce ? 0 : 420);
    root.hidden = true; root.classList.remove('off');
    document.body.classList.remove('work-zoom');
    await wait(reduce ? 0 : 700);
    document.body.classList.remove('about-open', 'about-anim');
    open = false; busy = false;
  }

  document.querySelectorAll('a[href="#work"]').forEach((a) => {
    if (root.contains(a)) return;
    a.addEventListener('click', (e) => { e.preventDefault(); window.__sfx && window.__sfx.ok && window.__sfx.ok(); openWork(); });
  });
  addEventListener('popstate', () => { if (location.hash === '#work') openWork({ fromPop: true }); else if (open) close({ fromPop: true }); });
  addEventListener('hashchange', () => { if (location.hash === '#work' && !open) openWork({ fromPop: true }); });
  if (location.hash === '#work') setTimeout(() => openWork({ fromPop: true }), 350);

  window.__work = { open: openWork, close, insert, get open_() { return open; }, setFilter, select };
})();
