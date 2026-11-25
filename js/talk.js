/* LET'S TALK – bảng ghim trên tường phóng to thành trang liên hệ.
   Click bảng ghim / nút LET'S TALK / index.html#contact → trang chủ zoom vào bảng → bảng phóng ra → giấy ghim lần lượt "tách".
   Form không có máy chủ: INSERT COIN = đồng xu rơi vào nút → mở app mail (mailto) với nội dung soạn sẵn. Gửi xong mở khoá thành tựu FIRST CONTACT (pf_ach_talk).
   Nội dung: js/talk-data.js. Style: css/talk.src.css (→ css/talk.css bằng tools/about_css.py). */
(() => {
  const D = window.TALK_DATA;
  if (!D) return;
  const $ = (s, r = document) => r.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sfx = (k) => window.__sfx && window.__sfx[k] && window.__sfx[k]();
  const F = D.form;
  let k = 0;
  const pin = (p) => `<i class="pin pin--${p}" aria-hidden="true"></i>`;

  const root = document.createElement('section');
  root.className = 'talk'; root.id = 'talk-menu'; root.hidden = true;
  root.setAttribute('aria-label', 'Let’s talk'); root.setAttribute('role', 'dialog');
  root.innerHTML = `
    <div class="talk__dim"></div>
    <div class="talk__board">
      <div class="talk__title pin-it" style="--k:${k++}"><h2>${D.title}</h2><p>${D.subtitle}</p></div>
      <form class="talk__form pin-it" style="--k:${k++}" novalidate>
        ${pin(6)}
        <h3>${F.heading}</h3>
        <label>${F.name}<input name="name" autocomplete="name" placeholder="${F.namePh}" maxlength="80" /></label>
        <label>${F.mail}<input name="mail" type="email" autocomplete="email" placeholder="${F.mailPh}" maxlength="120" /></label>
        <div><label>${F.type}</label><div class="talk__types">${F.types.map((t, i) => `<button type="button" data-t="${i}"${i ? '' : ' class="on"'}>${t}</button>`).join('')}</div></div>
        <label>${F.msg}<textarea name="msg" placeholder="${F.msgPh}" maxlength="2000"></textarea></label>
        <button class="talk__send" type="submit"><i aria-hidden="true"></i>${F.send}</button>
        <p class="talk__msg" aria-live="polite"></p>
      </form>
      <div class="talk__notes">${D.notes.map((n) => `
        <div class="note note--${n.note} pin-it" style="--k:${k++};--t:${n.tilt}deg">${pin(n.pin)}
          <h4>${n.title}</h4>${n.lines.map((l) => `<p>${l}</p>`).join('')}
          ${n.copy ? `<button class="chip" type="button" data-copy="${n.copy}">${n.action}</button>` : ''}
          ${n.href ? `<a class="chip" href="${n.href}"${n.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${n.hrefAction || n.action}</a>` : ''}
        </div>`).join('')}
        ${D.linkedin ? `<div class="note note--2 pin-it" style="--k:${k++};--t:-2deg">${pin(6)}<h4>LINKEDIN</h4><p>Let’s connect</p><a class="chip" href="${D.linkedin}" target="_blank" rel="noopener">OPEN ▸</a></div>` : ''}
      </div>
      <figure class="talk__pola pin-it" style="--k:${k++}">${pin(7)}<img src="assets/about/portrait.webp?v=1" alt="Trung" /><p>${D.polaroid}</p></figure>
      <button class="talk__close" type="button" aria-label="Close">✕</button>
    </div>`;
  document.body.appendChild(root);
  const board = $('.talk__board', root), form = $('.talk__form', root), msg = $('.talk__msg', root);
  let open = false, busy = false, type = 0;

  function fit() {
    const W = innerWidth, H = innerHeight, narrow = W / H < 1.05;
    root.classList.toggle('talk--narrow', narrow);
    root.style.setProperty('--u', (narrow ? Math.min(W / 700, 1.2) : Math.min(W / 1672, H / 941)).toFixed(4));
  }
  addEventListener('resize', fit);

  /* ---------- Form ---------- */
  root.querySelectorAll('.talk__types button').forEach((b) => b.addEventListener('click', () => {
    type = +b.dataset.t; root.querySelectorAll('.talk__types button').forEach((x) => x.classList.toggle('on', x === b)); sfx('move');
  }));
  root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const t = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) {
      const r = document.createRange(); r.selectNodeContents(b.parentElement.querySelector('p')); getSelection().removeAllRanges(); getSelection().addRange(r);
    }
    b.textContent = D.notes.find((n) => n.copy === b.dataset.copy).done; sfx('ok');
    setTimeout(() => { b.textContent = t; }, 1600);
  }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fld = (n) => form.elements.namedItem(n);
    const name = fld('name').value.trim(), mail = fld('mail').value.trim(), body = fld('msg').value.trim();
    if (!name || !body) { msg.className = 'talk__msg err'; msg.textContent = F.need; sfx('back'); (name ? fld('msg') : fld('name')).focus(); return; }
    // đồng xu rơi vào nút
    const btn = $('.talk__send', root), r = btn.getBoundingClientRect(), b = board.getBoundingClientRect(), s = parseFloat(root.style.getPropertyValue('--u')) || 1;
    if (!reduce) {
      const coin = document.createElement('i'); coin.className = 'talk__coin';
      const x = r.left - b.left + 16 * s, y = r.top - b.top;
      Object.assign(coin.style, { left: `${x}px`, top: `${y - 160 * s}px` }); board.appendChild(coin);
      await coin.animate([{ transform: 'translateY(0) scaleX(1)' }, { transform: `translateY(${100 * s}px) scaleX(.3)`, offset: .6 }, { transform: `translateY(${165 * s}px) scaleX(1)`, opacity: 0 }],
        { duration: 500, easing: 'steps(8)' }).finished;
      coin.remove();
    }
    sfx('insert');
    const subject = F.subject.replace('{type}', F.types[type]).replace('{name}', name);
    const text = `${body}\n\n— ${name}${mail ? ` (${mail})` : ''}\n${F.types[type]}`;
    location.href = `mailto:${D.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    try { localStorage.setItem('pf_ach_talk', '1'); } catch (er) { /* bỏ qua */ }
    setTimeout(() => sfx('unlock'), 400);
    msg.className = 'talk__msg';
    msg.innerHTML = `${F.sent}<br>${F.fallback} <a href="mailto:${D.email}">${D.email}</a>`;
  });

  /* ---------- Mở / đóng ---------- */
  async function openTalk({ fromPop = false } = {}) {
    if (open || busy || document.body.classList.contains('in-story')) return;
    if (window.__about && window.__about.open_) await window.__about.close();
    if (window.__work && window.__work.open_) await window.__work.close();
    busy = true;
    const sheet = document.querySelector('.sheet');
    if (sheet && !sheet.hidden) { sheet.classList.remove('on', 'play'); sheet.hidden = true; }
    if (!fromPop && location.hash !== '#contact') history.pushState({ talk: 1 }, '', '#contact');
    const h = document.querySelector('.hot[data-label="contact"]'), r = h ? h.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, vp = document.querySelector('.viewport');
    vp.style.setProperty('--zx', `${cx}px`); vp.style.setProperty('--zy', `${cy}px`);
    root.hidden = false; root.classList.remove('fold', 'unfold', 'play', 'on'); fit();
    if (!root.classList.contains('talk--narrow')) {
      board.style.setProperty('--fx', `${cx - (innerWidth - board.offsetWidth) / 2}px`);
      board.style.setProperty('--fy', `${cy - (innerHeight - board.offsetHeight) / 2}px`);
    }
    document.body.classList.add('talk-zoom', 'about-open', 'about-anim');
    root.classList.add('on');
    await wait(reduce ? 0 : 380);
    sfx('paper'); root.classList.add('unfold');
    await wait(reduce ? 0 : 520);
    root.classList.add('play');
    if (!reduce) for (let i = 0; i < k; i++) setTimeout(() => sfx('move'), i * 110);
    document.body.classList.remove('about-anim');
    open = true; busy = false;
    setTimeout(() => form.elements.namedItem('name').focus({ preventScroll: true }), reduce ? 0 : 600);
  }
  async function close({ fromPop = false } = {}) {
    if (!open || busy) return;
    busy = true; sfx('back');
    document.body.classList.add('about-anim');
    root.classList.remove('play', 'unfold'); root.classList.add('fold');
    document.body.classList.remove('talk-zoom');
    if (!fromPop && location.hash === '#contact') history.pushState({}, '', location.pathname + location.search);
    await wait(reduce ? 0 : 450);
    root.classList.remove('on');
    await wait(reduce ? 0 : 300);
    root.hidden = true; root.classList.remove('fold');
    document.body.classList.remove('about-open', 'about-anim');
    open = false; busy = false;
  }
  $('.talk__close', root).addEventListener('click', () => close());
  $('.talk__dim', root).addEventListener('click', () => close());
  addEventListener('keydown', (e) => { if (open && !busy && e.key === 'Escape') { e.preventDefault(); close(); } });

  document.querySelectorAll('a[href="#contact"]').forEach((a) => {
    if (root.contains(a)) return;
    a.addEventListener('click', (e) => { e.preventDefault(); sfx('ok'); openTalk(); });
  });
  addEventListener('popstate', () => { if (location.hash === '#contact') openTalk({ fromPop: true }); else if (open) close({ fromPop: true }); });
  addEventListener('hashchange', () => { if (location.hash === '#contact' && !open) openTalk({ fromPop: true }); });
  if (location.hash === '#contact') setTimeout(() => openTalk({ fromPop: true }), 350);

  window.__talk = { open: openTalk, close, get open_() { return open; } };
})();
