/* Nội dung trang LET'S TALK (bảng ghim). Sửa chữ / thông tin liên hệ ở đây.
   note = màu giấy trong assets/talk/papers.png: 0 vàng 1 hồng 2 xanh dương 3 xanh mint · pin: 6 đỏ 7 vàng
   Số điện thoại 0913 558 765: Trung tự cung cấp 25/11 (công khai). Thông tin khác lấy từ ChatGPT (25/11): email theo CV mới nhất; GitHub chỉ biết username; LinkedIn chưa có → để null là ẩn. CẦN TRUNG XÁC NHẬN. */
window.TALK_DATA = {
  email: 'ethanftd@gmail.com',
  title: 'LET’S TALK!',
  subtitle: 'Every great quest starts with a message.',
  form: {
    heading: 'SEND A MESSAGE',
    name: 'FROM', namePh: 'Your name',
    mail: 'YOUR EMAIL', mailPh: 'you@company.com',
    type: 'QUEST TYPE', types: ['Full-time job', 'Freelance', 'Collaboration', 'Just saying hi'],
    msg: 'MESSAGE', msgPh: 'Tell me about your quest…',
    send: 'INSERT COIN ▶ SEND',
    need: 'Please write your name and a message first.',
    sent: 'Your mail app should open with the message ready. Press send there!',
    fallback: 'Nothing opened? Email me directly:',
    subject: '[Portfolio] {type} · from {name}',
  },
  notes: [
    { note: 0, pin: 6, tilt: -3, title: 'EMAIL · PHONE', lines: ['ethanftd@gmail.com', '0913 558 765'], copy: 'ethanftd@gmail.com', action: 'COPY EMAIL', done: 'COPIED!', href: 'tel:+84913558765', hrefAction: 'CALL ▸' },
    { note: 2, pin: 7, tilt: 2, title: 'GITHUB', lines: ['@GaoBlues2'], href: 'https://github.com/GaoBlues2', action: 'OPEN ▸' },
    { note: 3, pin: 6, tilt: 3, title: 'BASE CAMP', lines: ['Hà Nội, Vietnam', 'UTC+7 (ICT)'] },
    { note: 1, pin: 7, tilt: -2, title: 'OPEN TO', lines: ['Full-time · Full-stack', 'Freelance projects', 'Remote work', 'AI & cloud collabs'] },
  ],
  linkedin: null,   // 'https://www.linkedin.com/in/…' khi có
  polaroid: 'See you on the next quest!',
};
