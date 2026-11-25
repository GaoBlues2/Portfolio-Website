/* Màn chờ kiểu paulfey.me: giữ 2015 một lúc, rồi đếm từ từ tới 2026 (chậm – nhanh – chậm), dừng một nhịp,
   rồi xé đôi theo chiều ngang: nửa trên trượt sang trái, nửa dưới sang phải, lộ căn phòng.
   Đặt ngay sau <div class="loader"> trong index.html để chạy trước mọi script khác. */
(() => {
  const el = document.getElementById('loader');
  if (!el) return;
  const FROM = 2015, TO = 2026, START_MS = 700, COUNT_MS = 1800, HOLD_MS = 450, MAX_WAIT = 7000;
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
  // đồng hồ riêng, mỗi khung hình cộng tối đa 50ms: lúc trang đang tải nặng (khung hình bị kẹt) số vẫn chạy từng năm, không nhảy cóc
  let clock = 0, last = 0;
  (function tick(now) {
    clock += last ? Math.min(50, now - last) : 0; last = now;
    const k = Math.max(0, Math.min(1, (clock - START_MS) / COUNT_MS));
    set(FROM + Math.round((TO - FROM) * (0.5 - 0.5 * Math.cos(Math.PI * k))));   // ease-in-out: khởi động từ từ, nhanh giữa, chậm dần cuối
    if (k < 1) return requestAnimationFrame(tick);
    const go = () => (loaded || performance.now() - t0 > MAX_WAIT ? done() : setTimeout(go, 100));
    setTimeout(go, HOLD_MS);
  })(0);
})();
