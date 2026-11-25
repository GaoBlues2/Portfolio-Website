/* Màn chờ kiểu paulfey.me: số năm đếm 2015 → 2026 (nhanh rồi chậm dần), dừng một nhịp,
   rồi xé đôi theo chiều ngang: nửa trên trượt sang trái, nửa dưới sang phải, lộ căn phòng.
   Đặt ngay sau <div class="loader"> trong index.html để chạy trước mọi script khác. */
(() => {
  const el = document.getElementById('loader');
  if (!el) return;
  const FROM = 2015, TO = 2026, COUNT_MS = 1600, HOLD_MS = 450, MAX_WAIT = 6000;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const spans = el.querySelectorAll('span');
  const set = (y) => spans.forEach((s) => { s.textContent = y; });
  const t0 = performance.now();
  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; }, { once: true });
  const done = () => {
    el.classList.add('split');
    document.documentElement.classList.remove('is-loading');
    setTimeout(() => el.remove(), reduce ? 50 : 1000);
  };
  if (reduce) { set(TO); setTimeout(done, 300); return; }
  (function tick(now) {
    const k = Math.min(1, (now - t0) / COUNT_MS);
    set(FROM + Math.round((TO - FROM) * (1 - (1 - k) ** 2)));   // ease-out: chạy nhanh, chậm dần ở cuối
    if (k < 1) return requestAnimationFrame(tick);
    const go = () => (loaded || performance.now() - t0 > MAX_WAIT ? done() : setTimeout(go, 100));
    setTimeout(go, HOLD_MS);
  })(t0);
})();
