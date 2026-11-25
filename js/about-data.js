/* Nội dung trang ABOUT (menu tạm dừng JRPG). Sửa chữ / dữ kiện ở đây.
   icon = chỉ số ô trong assets/about/icons.png (8x4, xem bảng dưới), badge = chỉ số ô trong badges.png.
   ICONS: 0 laptop 1 kính 2 trà 3 hoodie 4 bàn phím 5 server 6 terminal 7 bánh răng
          8 mây 9 database 10 container 11 file code 12 checklist 13 nhánh nút 14 sách 15 cây
          16 bóng đèn 17 mèo ngủ 18 tai nghe 19 bảng vẽ 20 màn hình code 21 đồ nghề 22 balo 23 điện thoại
          24 cửa sổ app 25 robot 26 bong bóng chat 27 phích cắm 28 khối 3D 29 mắt xích 30 GPU 31 mũ tốt nghiệp
   BADGES: 0 VII 1 full-stack 2 platform 3 cloud 4 GPU 5 robot 6 tên lửa 7 sách
           8 khoá (núi) 9 khoá (chân mèo) 10 khoá (tim) 11 con dấu sáp
   Dữ kiện lấy từ docs/profile.md (ChatGPT tổng hợp, Trung đã duyệt timeline 25/11). "where" của kỹ năng là ước đoán → cần xác nhận. */
window.ABOUT_DATA = {
  menu: [
    { id: 'status', label: 'STATUS' },
    { id: 'skills', label: 'SKILLS' },
    { id: 'inventory', label: 'INVENTORY' },
    { id: 'quests', label: 'QUEST LOG' },
    { id: 'achievements', label: 'ACHIEVEMENTS' },
    { id: 'save', label: 'SAVE' },
  ],
  hint: '↑↓ SELECT · ENTER CONFIRM · ESC BACK',
  titles: { status: 'STATUS', skills: 'SKILL TREE', inventory: 'INVENTORY', quests: 'QUEST LOG', achievements: 'ACHIEVEMENTS', save: 'SAVE GAME' },

  status: {
    name: 'TRUNG',
    level: 7,
    next: 'NEXT LV · 2027',
    rows: [
      ['CLASS', 'Full-stack Developer'],
      ['SUBCLASS', 'Cloud & AI'],
      ['GUILD', 'Pictor Lab'],
      ['HOME', 'Hà Nội, Vietnam'],
    ],
    open: 'OPEN TO NEW QUESTS',
    hp: [100, 100],
    mp: [80, 100],
    attrs: [
      { icon: 11, name: 'BACKEND', tag: 'EXPERIENCED', kind: 'exp' },
      { icon: 24, name: 'FRONTEND', tag: 'EXPERIENCED', kind: 'exp' },
      { icon: 8, name: 'CLOUD', tag: 'EXPERIENCED', kind: 'exp' },
      { icon: 23, name: 'MOBILE / DESKTOP', tag: 'EXPERIENCED', kind: 'exp' },
      { icon: 25, name: 'AI', tag: 'PRACTITIONER', kind: 'prac' },
      { icon: 29, name: 'WEB3', tag: 'EXPLORING', kind: 'expl' },
      { icon: 7, name: 'SYSTEM DESIGN', tag: 'LEVELING UP', kind: 'up' },
    ],
    bio: [
      '7 years building web, mobile & desktop apps.',
      'Cloud rendering, GPU farms, AI agents.',
      'Always learning, always building.',
    ],
  },

  skills: {
    center: 'TRUNG',
    branches: [
      { id: 'backend', name: 'BACKEND', icon: 5, nodes: [
        { icon: 6, name: 'PHP · Laravel', m: 1, desc: 'Production since day one.', where: 'MODORO · 2019' },
        { icon: 27, name: 'REST API · OAuth2', m: 1, desc: 'APIs for web, mobile & desktop clients.', where: '3S Cloud · 2020' },
        { icon: 9, name: 'MySQL · Redis', m: 1, desc: 'Plus MariaDB and message queues.', where: '3S Cloud · 2020' },
        { icon: 13, name: 'Node.js · NestJS', m: 1, desc: 'Senior level. APIs and services in production.', where: 'Senior' },
      ] },
      { id: 'frontend', name: 'FRONTEND', icon: 20, nodes: [
        { icon: 11, name: 'JS · TypeScript', m: 1, desc: 'The everyday language.', where: 'Every quest' },
        { icon: 24, name: 'Vue · React', m: 1, desc: 'Dashboards, web apps, admin tools. TailwindCSS.', where: '3S Cloud · 2020' },
        { icon: 0, name: 'Electron', m: 1, desc: 'Desktop apps for render farm clients.', where: '3S Cloud · 2020' },
        { icon: 23, name: 'Flutter', m: 1, desc: 'Android, iOS & desktop builds.', where: 'Shipped apps' },
        { icon: 28, name: 'Three.js', m: 0, desc: 'Exploring 3D on the web.', where: 'In progress' },
      ] },
      { id: 'cloud', name: 'CLOUD & DEVOPS', icon: 8, nodes: [
        { icon: 8, name: 'AWS', m: 1, desc: 'S3, EC2, CloudFront. Also Google & Alibaba Cloud.', where: '3S Cloud · 2020' },
        { icon: 10, name: 'Docker', m: 1, desc: 'Containers everywhere.', where: '3S Cloud · 2020' },
        { icon: 5, name: 'Linux · Nginx', m: 1, desc: 'Servers kept alive at 2 AM.', where: 'Superrender · 2019' },
        { icon: 30, name: 'GPU Farm', m: 1, desc: 'Distributed GPU rendering infrastructure.', where: '3S Cloud · 2020' },
      ] },
      { id: 'web3', name: 'WEB3', icon: 29, nodes: [
        { icon: 29, name: 'Blockchain', m: 1, desc: 'Integrating blockchain into real apps.', where: 'Kite Learning · 2024' },
        { icon: 16, name: 'Solana · Aptos', m: 0, desc: 'Still exploring.', where: 'In progress' },
      ] },
      { id: 'ai', name: 'AI', icon: 25, nodes: [
        { icon: 26, name: 'LLM', m: 1, desc: 'LLM integration, prompts, model APIs.', where: 'Kite Learning · 2024' },
        { icon: 25, name: 'AI Agents', m: 1, desc: 'Practitioner. Agents that actually do work.', where: 'Pictor Lab · 2025' },
        { icon: 27, name: 'MCP', m: 1, desc: 'Connecting agents to real tools.', where: 'Pictor Lab · 2025' },
        { icon: 12, name: 'AI Evaluation', m: 1, desc: 'AI-scored IELTS writing & speaking.', where: 'Kite Learning · 2024' },
        { icon: 28, name: '3D Gen AI', m: 0, desc: 'Generating 3D models with AI.', where: 'In progress' },
      ] },
    ],
    legend: ['MASTERED', 'LEARNING'],
  },

  inventory: [
    { icon: 0, name: 'WORK LAPTOP', desc: 'Main weapon. Seven years of commits.' },
    { icon: 1, name: 'ROUND GLASSES', desc: '+10 Debug vision. Removed only for wedding photos.' },
    { icon: 2, name: 'CUP OF TEA', desc: '+5 FOCUS. Restores MP after 10 PM.' },
    { icon: 3, name: 'ORANGE HOODIE', desc: 'Class armor. Comfort +99.' },
    { icon: 4, name: 'MECHANICAL KEYBOARD', desc: 'Clicky. Teammates may disagree.' },
    { icon: 5, name: 'SERVER RACK', desc: 'From the render farm days. Runs hot.' },
    { icon: 6, name: 'TERMINAL', desc: 'Where things actually get done.' },
    { icon: 7, name: 'SETTINGS', desc: 'Linux, Nginx, CI. Tweaked until it works.' },
    { icon: 8, name: 'CLOUD CREDITS', desc: 'AWS, Google Cloud, Alibaba Cloud. Spend wisely.' },
    { icon: 9, name: 'DATABASE', desc: 'MySQL, MariaDB, Redis. Always keep backups.' },
    { icon: 10, name: 'CONTAINER', desc: 'Docker. Works on my machine, and on yours.' },
    { icon: 13, name: 'GIT BRANCHES', desc: 'Merge conflicts survived: many.' },
    { icon: 14, name: 'STACK OF BOOKS', desc: 'System design, AWS architecture. Still reading.' },
    { icon: 15, name: 'DESK PLANT', desc: 'Still alive. Mostly thanks to my wife.' },
    { icon: 16, name: 'IDEA BULB', desc: 'Side project ideas. Too many to count.' },
    { icon: 17, name: 'SLEEPING CAT', pet: true, desc: 'PET. Cannot be unequipped. Sleeps on the keyboard.' },
    { icon: 18, name: 'HEADPHONES', desc: 'Focus mode: ON.' },
    { icon: 20, name: 'SECOND MONITOR', desc: 'One for code, one for docs.' },
    { icon: 21, name: 'TOOLKIT', desc: 'Fixes production bugs, chairs and routers.' },
    { icon: 22, name: 'OLD BACKPACK', desc: 'Carried from Ninh Bình to Nha Trang to Hà Nội.' },
    { icon: 23, name: 'TEST PHONE', desc: 'For Android & iOS builds.' },
    { icon: 25, name: 'AI AGENT', desc: 'New companion since 2025. Never sleeps.' },
    { icon: 30, name: 'GPU', desc: 'Rendering power. Warms the room in winter.' },
    { icon: 31, name: 'DIPLOMA', desc: 'Graduated in Nha Trang. Rank: GOOD.' },
  ],
  inventorySelect: 2,

  quests: [
    { ch: 'CH.1', title: 'STUDENT', place: 'Nha Trang', icon: 31, items: [
      { icon: 0, years: '2019', name: 'MODORO', role: 'Intern', desc: 'First real code: PHP & Laravel.', replay: 'w2' },
    ] },
    { ch: 'CH.2', title: 'FIRST JOB', place: 'Hà Nội', icon: 22, items: [
      { icon: 5, years: '2019–20', name: 'Superrender Farm', role: 'Web Developer', desc: 'Moved to Hà Nội. Met my current boss.', replay: 'w3' },
    ] },
    { ch: 'CH.3', title: 'SAME BOSS, MANY QUESTS', place: '', icon: 4, party: '★ PARTY: BOSS · since 2020', items: [
      { icon: 8, years: '2020–23', name: '3S Cloud Render Farm', role: 'Co-founded startup', desc: 'Cloud rendering, desktop apps, GPU workers.', replay: 'w3' },
      { icon: 20, years: '2023–24', name: 'WEGOTT', role: 'Full-stack Developer', desc: 'Remote workstation solutions.', replay: 'w3' },
      { icon: 14, years: '2024', name: 'Kite Learning', role: 'Full-stack Developer', desc: 'Education apps, AI-scored IELTS tests.', replay: 'w3' },
      { icon: 30, years: '2024–25', name: 'iRender', role: 'Full-stack Developer', desc: 'Cloud GPU rendering.', replay: 'w3' },
      { icon: 25, years: '2025–NOW', name: 'Pictor Lab', role: 'Full-stack Developer', desc: 'AI agents, GPU computing, Web3, remote gaming.', replay: 'w3', current: true },
    ] },
  ],
  questTitle: 'CAREER JOURNEY · 2019 → NOW',
  questCurrent: 'CURRENT QUEST',

  achievements: [
    { badge: 0, name: 'VETERAN DEV', desc: '7 years of professional development.', when: 'Since 2019' },
    { badge: 1, name: 'FULL-STACK ADVENTURER', desc: 'Frontend, backend and everything between.', when: '' },
    { badge: 2, name: 'PLATFORM EXPLORER', desc: 'Shipped web, mobile & desktop apps.', when: '' },
    { badge: 3, name: 'CLOUD ENGINEER', desc: 'Deployed and ran cloud infrastructure.', when: '3S Cloud · 2020' },
    { badge: 4, name: 'GPU COMMANDER', desc: 'Built distributed GPU render farms.', when: '3S Cloud · 2020' },
    { badge: 5, name: 'AI AGENT BUILDER', desc: 'Builds AI agents and LLM apps.', when: 'Pictor Lab · 2025' },
    { badge: 6, name: 'APP PUBLISHER', desc: 'Delivered Android, iOS & desktop builds.', when: '' },
    { badge: 7, name: 'ETERNAL STUDENT', desc: 'Always learning something new.', when: 'Every day' },
    // khoá: mở bằng hành động của người xem (lưu localStorage)
    { badge: 9, secret: 'cat', name: 'CAT WHISPERER', desc: 'You petted the cat on the desk.', hint: 'Someone on the desk knows.' },
    { badge: 10, secret: 'story', name: 'HAPPILY EVER AFTER', desc: 'Finished MY STORY.', hint: 'Play the whole story.' },
    { badge: 8, secret: 'explorer', name: 'EXPLORER', desc: 'Opened every tab of this menu.', hint: 'Look around this menu.' },
    { badge: 8, secret: 'talk', name: 'FIRST CONTACT', desc: 'Sent me a message. Thank you!', hint: 'Send me a message.' },
  ],
  achSelect: 4,
  achUnlocked: 'UNLOCKED',
  achLocked: '???',

  save: [
    { id: 'cv', title: 'SAVE GAME', sub: 'Download my CV (PDF)', href: 'assets/cv.pdf', soon: 'CV coming soon', icon: 12 },
    { id: 'talk', title: 'CONTINUE', sub: 'Let’s build something together', href: '#contact', icon: 26 },
    { id: 'story', title: 'LOAD', sub: 'Replay my story', href: '#story', icon: 22 },
    { id: 'work', title: 'VIEW PROJECTS', sub: 'My work', href: '#work', icon: 20 },
  ],
};
