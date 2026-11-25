/* Điện thoại: site chỉ chơi ở màn NGANG.
   - Lần chạm đầu tiên: thử bật toàn màn hình + khoá xoay ngang (Android Chrome làm được; iPhone Safari không cho → bỏ qua).
   - Còn đang cầm dọc: phủ màn "ROTATE YOUR PHONE" (điện thoại pixel xoay), xoay ngang là tự biến mất.
   Đặt ngay sau loader.js, trước mọi script khác. Thử trên máy tính: index.html?rotate=1 */
(() => {
  const force = /[?&]rotate=1/.test(location.search);
  const coarse = matchMedia('(pointer: coarse)').matches;
  const short = Math.min(screen.width, screen.height) < 820;   // điện thoại (kể cả máy to), không tính iPad
  if (!force && !(coarse && short)) return;
  document.documentElement.classList.add('is-phone');

  const canLock = !!(screen.orientation && screen.orientation.lock && document.documentElement.requestFullscreen);
  const el = document.createElement('div');
  el.className = 'rotate';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Rotate your phone');
  el.innerHTML =
    '<div class="rotate__phone"></div>' +
    '<p class="rotate__title">ROTATE YOUR PHONE</p>' +
    '<p class="rotate__sub">This adventure plays in landscape.</p>' +
    (canLock ? '<button class="rotate__btn" type="button">▶ TAP TO ROTATE</button>' : '');
  document.body.appendChild(el);

  const portrait = matchMedia('(orientation: portrait)');
  const sync = () => {
    const on = force ? true : portrait.matches;
    el.classList.toggle('on', on);
    document.documentElement.classList.toggle('rotate-block', on);
  };
  sync();
  portrait.addEventListener ? portrait.addEventListener('change', sync) : portrait.addListener(sync);
  addEventListener('resize', sync);

  // Android: vào toàn màn hình rồi khoá ngang (phải nằm trong một cú chạm của người dùng)
  let tried = false;
  const lock = () => {
    if (!canLock || document.fullscreenElement) return Promise.resolve();
    return document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation.lock('landscape'))
      .catch(() => {});
  };
  const firstTouch = () => { if (tried) return; tried = true; lock(); };
  if (canLock) {
    addEventListener('pointerup', firstTouch, { once: true, capture: true });
    const btn = el.querySelector('.rotate__btn');
    btn.addEventListener('click', (e) => { e.stopPropagation(); lock(); });
  }
})();
