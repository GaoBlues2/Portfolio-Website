# Portfolio của Trung — ghi chú cho agent

> File này là bộ nhớ của dự án. Đọc hết trước khi làm section mới, cập nhật lại sau mỗi phiên làm việc.
> Người dùng nói tiếng Việt, xưng "tao – mày", thích làm nhanh, soi kỹ chi tiết hình ảnh.

---

## 1. Ý tưởng tổng thể

- Kết hợp 2 site tham khảo:
  - **paulfey.me** (và /story): bố cục + cách kể chuyện — câu ngắn từng nhịp, giọng ngôi thứ nhất, ấm, tự trêu mình, đời sống thật (vợ, nhà, mèo).
  - **jld2nd.dev**: phong cách **pixel art** / retro game (hộp thoại RPG, boot sequence, Pac-Man, Tetris, LVL badge).
- Ý tưởng chính: **kể cuộc đời Trung như một game phiêu lưu pixel**.
- Trang chủ = bàn làm việc ấm cúng cạnh cửa sổ (Hà Nội lúc hoàng hôn). Mỗi đồ vật là một cửa vào section:
  - Ảnh cưới → **MY STORY** (`#story`)
  - Giấy khen → **ABOUT ME** (`#about`)
  - Bảng ghim note → **LET'S TALK** (`#contact`)
  - ~~Laptop~~ → **Máy chơi game cổ** trước kệ màn hình → **MY WORK** (`#work`) (25/11: người dùng muốn thêm máy chơi game cho hợp ý tưởng kệ băng game)
  - Con mèo → **???** (easter egg)

## 2. Câu chuyện đời (dùng cho section MY STORY)

Đã chốt **hướng A: side-scroller** — một thế giới pixel nằm ngang liền mạch, scroll dọc thì màn hình trượt ngang, nhân vật đi bộ qua từng chặng; lời kể hiện bằng **hộp thoại RPG gõ chữ** (HTML, không nằm trong ảnh), mốc năm là **biển báo gỗ**; HUD có thanh hành trình Ninh Bình → Nha Trang → Hà Nội và chỉ số `PARTY`; popup kiểu game ("NEW PARTY MEMBER", "LEFT THE PARTY", "NEW GAME+"); màn chuyển chương "WORLD n".
Người dùng **không thích** layout panel truyện tranh và **không thích** layout blog 2 cột đơn giản.

Các chặng (năm cụ thể chưa có — hỏi người dùng):
1. **Ra đi**: tốt nghiệp cấp 3 ở **Ninh Bình**, chưa từng xa nhà → đi tàu gần **1000 km** vào **Nha Trang** học đại học. Muốn animation bản đồ Việt Nam có đường tàu chạy Ninh Bình → Nha Trang (bản đồ phải đúng, có **Hoàng Sa, Trường Sa**; khi code nên dùng SVG chuẩn).
2. **Đại học ở Nha Trang**: bạn mới, cuộc sống mới, đi phượt xe máy với bạn, thực tập từ năm 2, tốt nghiệp loại khá.
3. **Ra Hà Nội**: chia tay bạn, bay ra Hà Nội, làm ở **Superrender Farm** với sếp cũ, gặp sếp hiện tại.
4. **Startup** (cao trào): cùng sếp mở **3S Cloud Render Farm** — làm tới 10h đêm → công ty đông người → đi xuống vì covid, chiến tranh, kinh tế → đồng nghiệp lần lượt rời đi → Trung ở lại với sếp → mở **Kite Learning**.
5. **Level up**: học blockchain / web3 ở Kite Learning → sếp mở **Pictor Lab** (công ty hiện tại) → AI bùng nổ, làm nhiều dự án.
6. **Side quests**: đang tự làm các dự án cá nhân.

Prompt mẫu cho từng World đã viết trong chat cũ (style khoá: side view, panorama rộng ≥21:9, parallax 3 lớp, cùng avatar, chỉ có chữ trên biển báo/biển công ty, không UI, không nhân vật có bản quyền).

## 3. Nhân vật & quy ước hình ảnh

- Avatar pixel: tóc đen rối, **đeo kính**, áo hoodie cam, balo.
- **Ảnh cưới: Trung KHÔNG đeo kính.** Cô dâu tóc nâu búi, hoa trắng trên tóc, váy trễ vai, voan ren dài, cầm bó hoa.
- Mèo: mèo cam mập cuộn tròn ngủ.
- Bảng màu: be cát `#E6D8C0`, giấy `#f6efe2`, mực `#2a1a10`, cam `#f26a2e` / `#b8461a`, vàng `#ffd23f`.
- Font: **Pixelify Sans**. Chữ C/c gốc chỉ hở 1 ô pixel → ở cỡ nhỏ đọc thành O (người dùng bắt "OLOUD"). Dùng bản **tự host đã sửa** `assets/fonts/pixelify-fix.ttf` (family "Pixelify Fix", @font-face đầu style.css, `--pixel` ưu tiên nó; sinh bằng `tools/fonts/fix_pixelify.py` từ google/fonts `ofl/pixelifysans`; giấy phép OFL kèm theo). Đã bỏ Silkscreen vì quá rộng. **25/11 vá thêm**: số 2/3/5 + chữ S/G/B ở cỡ nhỏ đọc thành 8 (người dùng bắt "2023" thành "8083") → thu ngắn móc, vuông góc 5 và B (xem đầu fix_pixelify.py). Font `?v=2`, `style.css?v=9`.
- Cửa sổ phải **mở ra ngoài** (người dùng bắt lỗi khi cánh cửa mở vào trong).
- Không dùng nhân vật/thương hiệu có bản quyền (đã gặp Totoro trong ảnh mockup — loại bỏ).

## 4. Cấu trúc code (trang chủ — ĐÃ XONG)

```
index.html          nav + stage (bg_wide) > scene (1672x941) chứa mọi lớp động
css/style.css       toàn bộ style, biến --s (scale), --sw/--sh, --ox/--oy
js/main.js          scale, rèm, khói trà, mèo, ảnh cưới, nhãn + dây chấm, chớp mắt avatar
package.json        vite (npm run dev) — hoặc mở thẳng index.html
assets/             ảnh dùng trên web
assets/raw/         ảnh gốc ChatGPT tạo (pf_00 … pf_14) — giữ để làm lại khi cần
```

### Hệ toạ độ
- `scene` = khung ảnh gốc **1672×941**. Mọi toạ độ đồ vật (rèm, ảnh cưới, mèo, nhãn, hotspot) tính theo khung này.
- `stage` = ảnh nền mở rộng **`assets/bg_wide.png` 2060×941**; scene nằm ở `ox=194, oy=0` (`WIDE` trong main.js). Hai dải bên là phần nối thêm từ ảnh ChatGPT vẽ góc rộng (`pf_14`), căn bằng SIFT + căn riêng kệ sách bên phải.
- `fit()`: `s = max(W/2060, H/941)` → phủ kín màn hình, khớp màn ~2:1 của người dùng. Nav và hint `position: fixed`, kích thước nhân `var(--s)`.

### Vị trí chính (toạ độ scene)
- Lòng khung ảnh cưới: `left 977, top 158, 210×180`, `clip-path` cắt mép trên nghiêng 10px (khung trong ảnh nền hơi nghiêng).
- Rèm trái `x 40`, rèm phải `x 718`, `y 28`, cao `575` (bằng nhau, treo đè hai mép khung cửa x≈98…805). Rèm phải chui **sau màn hình** nhờ `.occluder--monitor` (phủ lại mảng nền 700,474 → 308×166).
- Mèo: `left 1180, top 655, 190×125`; zzz `1296,618`.
- Máy chơi game (MY WORK): sprite `assets/console.png` (raw `assets/raw/console_sprite.png`, chat "Create Portfolio Homepage") đặt `left 668, top 676, 196×106` trước gầm kệ màn hình (che 2 hộp gỗ), đèn LED đỏ nháy (`.console__led`), rê chuột vào hotspot → băng sáng + nhích lên (main.js thêm `.lit`). Hotspot work `660,668 212×120`, nhãn `--bx 688 --by 604`, chấm `772,700`. `style.css?v=10`, `main.js?v=3`. Ghép vào ảnh nền bằng sửa ảnh của ChatGPT KHÔNG được: ChatGPT vẽ lại cả phòng theo bố cục cũ (ảnh `pf_15_console.png`) → luôn xin sprite nền magenta rồi đặt lên.
- Khói trà: canvas tại `856,560`, 110×150.
- Hero: `left 100, top 165, width 710` (trong ô cửa sổ).

### Animation
- **Rèm**: canvas, cắt ảnh thành dải 1px, uốn theo hàm `wind(t)` (có quãng lặng rồi mới có cơn gió), đỉnh cố định, gấu phồng/nhấc; nếp sáng-tối; `opacity .86` áp cả canvas (áp từng dải sẽ bị sọc). Rèm phải `lag 0.7`, `amp 0.85`. Test gió mạnh: `index.html?t=94`.
- **Ảnh cưới**: 1 ảnh tĩnh `photo_base` (đã xoá voan) + lớp `photo_veil` (voan tách riêng, uốn theo cùng cơn gió) + 2 miếng vá `photo_laugh` (cả hai cười tít mắt), `photo_cover` (cô dâu che miệng, tay trái rời bó hoa, cẳng tay đưa từ eo lên). Chuyển biểu cảm mờ dần ~0.18s. Kịch bản: cười nhẹ là chính, 7–12s lại cười → che miệng.
- **Khói trà**: các cụm khói mềm (radial gradient) bay lên, phình, uốn, tan; `filter: blur(.8px)`.
- **Mèo**: 4 frame `cat_0..3` vẫy đuôi mỗi 3.5–8s, thở nhẹ (CSS), click → vẫy nhanh + bong bóng "mrrp?".
- **Avatar nav**: `avatar_blink.png` hiện 110ms mỗi 2.5–5.5s, 25% chớp đôi.
- **Hero**: "Hi, I'm Trung." 86px chữ kem viền mực 4px + bóng cam, "Trung" vàng nhảy nhẹ; tagline trên nhãn giấy, chấm kim cương cam, con trỏ nhấp nháy.
- `prefers-reduced-motion` tắt bớt chuyển động.

## 4a. Màn chờ (25/11, giống paulfey.me)
- `#loader` ngay đầu `<body>` + `js/loader.js` (chạy trước mọi script): nền be `#E6D8C0`, số năm pixel to (mực + bóng cam) GIỮ 1996 (năm sinh – người dùng chọn thay 2015) 0.7s rồi đếm từ từ tới 2026 trong 2.2s (ease-in-out, đồng hồ cộng tối đa 50ms/khung để không nhảy cóc), dừng 0.45s, chờ `window.load` (tối đa 7s), rồi XÉ ĐÔI: nửa trên trượt sang trái, nửa dưới sang phải (0.75s, cubic-bezier(.7,0,.84,0), nửa dưới trễ .05s) lộ căn phòng. CSS cuối style.css (`.loader`). Font được preload. `style.css?v=11`, `loader.js?v=4`.

## 4b. MY STORY – World 1 "The Departure" (ĐÃ XONG bản đầu)

- Mở từ trang chủ: click ảnh cưới / nav MY STORY (hoặc lăn chuột xuống, vuốt lên trên mobile) → còi "tút tút" + **khói pixel** cuộn lên từ ly trà phủ kín màn → tan sang hai bên lộ ga Ninh Bình. Vào thẳng: `index.html#story`. ESC / ◀ HOME = khói phủ rồi về trang chủ.
- Cùng một trang (không tách story.html) để âm thanh từ cú click không bị trình duyệt chặn. Khi `body.in-story`, main.js ngừng vẽ rèm/khói trà/ảnh cưới.
- File: `css/story.css`, `js/story.js` (Smoke = chuyển cảnh, Sound = WebAudio tự tổng hợp: còi, máy nổ, cạch-cạch bánh xe; nút ♪ ở HUD, lưu `localStorage pf_mute`). Markup `<section id="story">` trong index.html.
- Ảnh gốc ChatGPT (chat "Pixel Art Scene"): `assets/raw/st1_full.png` (2172×724, đã chốt), `st1_plate.png` (xoá tàu+khói), `st1_wave.png` (bố mẹ vẫy frame 2), `st1_boy.png` (tay Trung frame 2), `st1_platewave.png` (bố mẹ frame 2 trên sân ga trống), `st1_clean.png` (sân ga trống, không tàu, không người).
- Lớp (toạ độ thế giới 2172×724): `w1_base` (nền ga KHÔNG có tàu, không có bố mẹ). **Đoàn tàu = sprite ChatGPT vẽ SẴN GÓC NGHIÊNG 3/4** (đúng góc nhìn ảnh ga, mũi/đầu toa quay về phía người xem bên phải): `w1_loco` (raw `tr3_loco.png`), `w1_car_door` (`tr3_car.png`, cửa mở), `w1_car` (`tr3_carc.png`, cửa đóng); lưu ở 0.6×. Canvas `.w-train`, mỗi toa đặt lên ray bằng 1 ma trận affine (`carMatrix`): co giãn đều theo phối cảnh tại góc nối hông–đầu (`fx`) + xô dọc để đường đáy bánh (c1→c2) trùng ray; toa sau móc vào đuôi (`rx`) toa trước, khe `GAP` 14px sprite co giãn khi giật. Đầu máy chạy theo hàm mũ: khoảng cách tới điểm tụ × e^L, L = ½·0.27·t² → càng gần càng nhanh, càng to. Ray: `TRACK {vx 60, vy 445, bot .181, unit .25}`, đầu máy đứng ở `LOCO_X0` 1300. Toạ độ mốc từng sprite trong `CAR_DEF` — **c1/c2 phải là đáy BÁNH XE thật** (đo profile alpha, bỏ qua bậc cửa/cản thấp hơn bánh): loco (180,379)/(540,420), toa cửa (177,382)/(520,410), toa đóng (120,342)/(720,421). Đo sai ~15px → người dùng bắt lỗi "tàu trật đường ray". Thanh ray GẦN của đường tàu (mép trên, đo bằng đỉnh sáng từng cột x 550–1550) ≈ y = 0.181x + 434 (khớp TRACK). Bản cũ 0.152 làm toa xa bên trái lún ~15px, đầu máy nổi ~12px → người dùng bắt "trệch ray". **Đã thử & bỏ**: sprite nhìn thẳng + tự bẻ phối cảnh / ghép mặt đầu riêng → người dùng chê "mỏng dính", "ảnh thẳng rồi làm nghiêng không oke" → luôn bảo ChatGPT vẽ sẵn đúng góc. Đoàn = loco + toa cửa + toa thường, nối toa tới khi mũi toa ra sau lưng bố (`TAIL_MIN` 300); phần x<290 xoá hẳn, 290–400 mờ dần (destination-out) → đuôi tàu tan vào sương sau lưng bố (lỗi cũ: "sợi kim" nhỏ dần tới điểm tụ, rồi đuôi cụt lòi sau đầu bố); sương mù nhạt dần ở toa xa (x<820). Trung vẽ trong hệ toạ độ sprite toa cửa (`door` [635,300], cao 250px sprite). Bố mẹ là sprite DOM (`w1_dad`, `w1_mom`) từ `raw/sp2_*` — đã lùi về sau (thu 0.8 quanh điểm tụ, chân y≈652) theo yêu cầu cho khớp tầm nhìn của Trung: dad 250,447 96×205, mom 328,476 94×178; Trung `w1_boy` từ `raw/sp3_boy.png` (quay mặt sang trái nhìn bố mẹ). Sprite vẫy 4 frame kiểu cần gạt nước, chạy ping-pong.
- Bài học: người dùng muốn **mọi vật động (người, từng toa tàu) là sprite riêng do ChatGPT vẽ**, agent chỉ ghép + làm chuyển động. **Không tự cắt/ghép tay chân** (nhìn chán, lộ vệt). Nhân vật cần động → **bảo ChatGPT vẽ sprite sheet riêng cho từng nhân vật** + nền sạch không có nhân vật, rồi ghép.
- Phần scroll (700vh): 0–0.25 khung bố mẹ, 0.25–0.55 camera lia sang đầu tàu, câu thoại trong `LINES`. Kéo tới **0.8** → **cảnh cắt tự diễn theo thời gian** (`CUT` trong story.js): 0s còi + "TOOT TOOT!" bám ống xả + phụt khói đen/xám, 0.85s xì hơi phanh dưới gầm (khói trắng bắn ngang), 1.55s từng toa giật lần lượt (lò xo tắt dần, tiếng "cạch", rung màn) rồi tăng tốc có tia lửa ở bánh, bụi, vệt khói dài, toa to dần khi lao về phía người xem; hộp thoại lên góc trên trái để không che bánh xe. Trung **bước vào trong toa** (mờ dần 0.3s, bắt đầu 0.35s trước khi lăn bánh — người dùng không muốn nhân vật đứng ngoài khi tàu chạy). Camera **không** quay lại bố mẹ nữa: khi toa cuối gần ra khỏi khung (`tr.tail`, dự phòng `CUT.end` 9s) → `nextScreen()`: khói phủ → `.story.is-next` (ẩn thế giới, nền giấy) + thẻ "WORLD 1 CLEAR!" → khói tan. Sau này thay bằng bản đồ / World 2. Kéo ngược dưới 0.68 → chớp trắng, tàu về ga. REPLAY = khói phủ rồi chơi lại.
- Người dùng chê bản đầu (tàu chỉ trượt theo scroll) là "chán" → giữ hướng cảnh cắt có nhịp, nhiều hiệu ứng.
- Khói/hơi/bụi: canvas 1/3 độ phân giải, vẽ mây pixel (viền + bóng + thân + điểm sáng) theo bảng màu EXHAUST / DIESEL / STEAM / DUST.
- Asset story `?v=11`, `story.css?v=8`, `story.js?v=15`. Quy tắc: nhân vật vẫy chào phải **nhìn về phía người được chào**. Hộp thoại luôn ở góc trên trái (`dialog--top`) để không che nhân vật/bánh xe. Lời thoại tiếng Anh, NGẮN GỌN theo ý người dùng: chỉ nói 18 tuổi rời nhà gần 1000 km vào Nha Trang học đại học, lần đầu xa nhà; cảnh tàu chạy chỉ 1 câu "Next stop: Nha Trang." **Không** kể lể cảm xúc bố mẹ khóc/vẫy (người dùng chê "dườm rà").
- Khi chép PNG sang máy người dùng, md5 file khác (bị thêm metadata) nhưng pixel giống hệt → so md5 của `Image.tobytes()`.

## 4c. MY STORY – Màn bản đồ Ninh Bình → Nha Trang (ĐÃ XONG bản đầu)

- Nối sau World 1: tàu khuất → khói phủ → `enterMap()` → khói tan lộ bản đồ + title "954 KM / NINH BÌNH ▸ NHA TRANG". Vào thẳng: `index.html#map`. Scroll (dùng lại `.story__scroll` 700vh, reset về 0) → đoàn tàu chạy dọc tuyến; `body .story.is-map`.
- **Hình bản đồ KHÔNG do ChatGPT vẽ** (ChatGPT vẽ sai bờ biển, đảo). Nền `assets/story/m_base.png` (1376×850, 0.04°/px, chiếu equirect cos15°, lon 80–137, lat −2–32) sinh bằng `tools/map/` từ **Natural Earth 10m** (clone sparse github `nvkelso/natural-earth-vector` trong container; máy người dùng & raw.githubusercontent bị chặn mạng): `extract.py` → `route.py` (đường ngắn nhất trên đồ thị ray, 1.146 km) → `render.py` (pixel art: biển 3 dải + gợn sóng, VN xanh + núi + đồng bằng, láng giềng màu giấy) → `data.py` (ghi `js/map-data.js`). Ảnh ChatGPT (chat "Create Vietnam Map") chỉ dùng tham khảo màu/không khí; sprite tàu ChatGPT tạo bị lỗi → tàu vẽ bằng code.
- **Hoàng Sa, Trường Sa**: NE gán Hoàng Sa cho TQ → `extract.py` lấy các đa giác TQ có tâm lat<17.6, lon>110.5 làm Hoàng Sa, `PGA` + đảo nhỏ làm Trường Sa; tô màu VN, khung nét đứt + nhãn "QĐ. HOÀNG SA / QĐ. TRƯỜNG SA (VIỆT NAM)". Không vẽ đường kẻ nào khác trên biển.
- `js/story-map.js` (`StoryMap.create`): canvas `.map__rail` 1x (ray + tà vẹt, phần đã đi tô vàng), `.map__fx` 2x (tàu vẽ từng pixel xoay nearest → giữ nét; khói `drawClouds`; chỉ xoá vùng bẩn). Đoàn = đầu máy (L22×W11 px fx) + 2 toa (L20), toa bám theo đường cong. Camera: tổng quan (VN + 2 quần đảo) → zoom 1.85 bám tàu (pv 0.03–0.17) → zoom thêm vào Nha Trang (pv 0.86–0.96). Tàu chạy pv 0.10→0.86 (gần đều, mềm 2 đầu). Nhãn ga HTML (`.mpin`, đặt bên trái điểm = phía đất liền) sáng + nảy khi tàu qua; đích nhấp nháy.
- HUD: chip `FROM HOME n KM` = **khoảng cách đường chim bay** tới Ninh Bình (tới Nha Trang = 954 km, khớp câu "almost 1,000 km"; ray thật ~1.150–1.200 km). Mũi tên thanh hành trình chạy 0 → 0.5 (Nha Trang). Tới nơi: còi + xì hơi + popup "ARRIVED!". pv ≥ 0.97 → thẻ WORLD 1 CLEAR (bên phải, trên biển). REPLAY = về World 1.
- Lời thoại `MAP_LINES` trong story.js: "Home was Ninh Bình." / "Then south. Almost 1,000 km of rails." / "Further from home than I had ever been." / "Nha Trang. Hello, sea."
- Version: `story.js?v=16`, `story-map.js?v=1`, `map-data.js?v=1`, `story.css?v=9`, `m_base.png?v=1`.
- Đã biết: HUD story trên màn dọc (mobile) bị chật/tràn chữ — lỗi có từ World 1.

## 4d. MY STORY – World 2 "Nha Trang" (ĐÃ XONG bản đầu)

- Nối từ bản đồ: tàu tới Nha Trang + scroll ≥ 0.92 → chờ 0.9s → `zoomToW2()`: bản đồ zoom mũ tới ~36x vào Nha Trang (1s, `smap.frame(..., boost)`) → canvas `.zoomfx` vẽ khung đầu World 2 với ô pixel 96px → 1px (0.9s) → title "WORLD 2 / NHA TRANG". Vào thẳng: `index.html#w2`. Track scroll đổi thành 1000vh khi ở World 2.
- **Bản 2 (người dùng chê đi chơi nhiều hơn đi học → học + làm phải chiếm phần lớn):** thứ tự cảnh: ga + biển + cổng trường (`w2_a`) → **lớp học / phòng máy / thư viện** (`w2_c` từ raw `w2_plateC2`, cutaway, Trung + 3 bạn VẼ SẴN trong nền; **giảng viên là sĩ quan quân đội mặc quân phục xanh ô liu có cầu vai** — trường quân đội, người dùng yêu cầu) → **văn phòng ngày + ký túc đêm** (`w2_b` cắt x 0–1440, Trung vẽ sẵn ngồi code có anh senior chỉ bài, và ngồi học bên cửa sổ ký túc) → 4 cung đường phượt `w2_dl/py/qn/dn` (Đà Lạt, Phú Yên, Quy Nhơn, **Đà Nẵng** — người dùng đổi Nha Trang thành Đà Nẵng: đèo Hải Vân, Mỹ Khê, cầu Rồng, Sơn Trà; raw `w2_road_danang`; `w2_nt` không dùng nữa) → **sân trường** (`w2_b` cắt x 1300–2172). Tấm cắt bằng `{x0, w}` trong `PANELS`.
- Phân bổ scroll (`txAt`): mở màn 0–0.15, lớp học 0.15–0.42, văn phòng/ký túc 0.42–0.66, đi phượt 0.66–0.80 (xe chạy nhanh), sân trường 0.8–0.9, ≥0.94 tốt nghiệp. Khi Trung ở trong nhà (`INSIDE`) thì ẩn sprite đi bộ + khói "bụp" lúc vào/ra (vì đã vẽ sẵn trong nền).
- QUEST LOG hiện từ lớp học tới hết ký túc: MAIN Graduate (XP đầy dần), cuối lớp học popup "LEVEL UP! Side quest unlocked: Internship" (trước đó dòng side quest ẩn), qua văn phòng "SIDE QUEST ✓". Bạn bè đi theo ở cổng trường và sân trường; đi phượt = 2 xe máy; nhập hội ở cổng: 3 popup NEW PARTY MEMBER, PARTY 1→4.
- Sprite (key magenta bằng `tools/sprites/sheet.py src dst n H`): `w2_trung` 4 frame đi bộ, `w2_friends` 3 bạn đi thành hàng (nam tóc nâu, nữ tóc dài, nam mũ xanh) 4 frame, `w2_bikes` 2 frame (xe đỏ: Trung lái + bạn tóc nâu; xe kem: bạn mũ xanh lái + bạn nữ). Bước chân theo quãng đường (44px/frame).
- Kết màn: pv ≥ 0.94 → chớp, polaroid `w2_grad` + "QUEST COMPLETE · Rank: GOOD" → thẻ "WORLD 2 CLEAR! Next: WORLD 3 · Hà Nội".
- Ảnh webp q90, gốc PNG `assets/raw/w2_*` (`w2_plateA2`, `w2_plateC`, `w2_plateB2`, `w2_road_*`, `w2_sp_*`).
- Lời thoại `LINES` trong story-w2.js. `INFO` trong story-w2.js: tên trường, `yearIn`/`yearOut` (để trống → ẩn biển năm) — **chưa có năm, chưa có tên công ty thực tập** (đang ghi chung "Internships").
- Đã biết: chỗ nối các tấm nền (nhất là ga→đường, Đà Lạt→Phú Yên) nhìn thấy bóng mờ chồng hình; xe máy không đội mũ bảo hiểm (sprite ChatGPT).
- Version: `story.js?v=17`, `story-w2.js?v=4`, `story-map.js?v=2`, `story.css?v=11`, ảnh w2 `?v=4`.
- Quy trình tải ảnh ChatGPT phiên này: `fetch(img.src)→blob→<a download>` vào `~/Downloads` (đã cấp quyền thư mục cho phiên), `cp` sang `assets/raw/`. ChatGPT list ảnh kiểu ảo hoá — lấy ảnh cuối `main img` sau khi hết nút stop. Lệnh JS trong tab bị giới hạn 45s.

## 4d-2. World 2 – cắt cảnh phượt → sân trường (25/11)
- Lỗi cũ: tấm sân trường (cắt 872px từ `w2_b`) hẹp hơn màn hình nên dính liền đường Đà Nẵng → "cả lũ đi bộ từ Đà Nẵng vào sân trường". Sửa: tấm mới `w2_y` (raw `w2_plateYard`, sân trường lễ tốt nghiệp đủ 3:1, phượng đỏ, ghế, sân khấu), `cut: true` → đặt cách tấm Đà Nẵng 600px, không mask mờ. `txAt`: xe chạy tới hết đường Đà Nẵng (pv 0.8) rồi NHẢY sang đầu sân trường + chớp trắng `.flash` (câu w2_9 "four years had gone by" = nhảy thời gian). Quy tắc: hai bối cảnh khác địa điểm thì CẮT CẢNH, không nối liền.

## 4e. MY STORY – Chuyến bay Nha Trang → Hà Nội (ĐÃ XONG bản đầu)

- Nối từ World 2: polaroid tốt nghiệp hiện 3.6s → `onDone` → `w2ToFlight()`: **khói trắng `Smoke.cover` phủ màn → bản đồ → `Smoke.reveal`** (người dùng muốn dùng lại hiệu ứng khói; bản pixel-hoá + lùi zoom `unzoomFrame` vẫn còn trong code nhưng không dùng) → title "1,060 KM / NHA TRANG ▸ HÀ NỘI".
- **Mây trên bản đồ** (`drawSky` trong story-map.js, cả màn tàu lẫn chuyến bay): người dùng chê mây tự vẽ "xấu" → dùng **6 sprite mây ChatGPT vẽ** (raw `map_sp_clouds.png`, atlas `assets/story/m_clouds.png` 1776×313, toạ độ `CL_RECTS`). 15 đám mây là `<div>` trong `.map__sky` (nằm trong `.map__world`), tỉ lệ 0.10–0.15 sprite→px bản đồ, bóng = cùng sprite `filter: brightness(0)` opacity .16 lệch (+10,+13); trôi về tây nam, quay vòng. Thứ tự lớp: nền → rail → fx (tàu, nét đường bay, bóng máy bay) → sky (mây) → air (máy bay + vệt khói) ⇒ tàu dưới mây, máy bay trên mây.
- `story-map.js` `flightReset/flightFrame/flightOff`: đường bay bezier bậc 2 từ **sân bay Cam Ranh** (109.219, 11.998) tới **Nội Bài** (105.807, 21.221), điểm điều khiển lệch ra biển. Nét đứt trắng (đã bay đậm, chưa bay mờ). Máy bay vẽ từng pixel (trắng, sọc cam, cánh mút cam, đuôi cam đậm), `PS` 1.5, bóng đổ xa dần theo độ cao sin(πk), 2 vệt khói trắng sau động cơ. Camera bám máy bay (zoom 1.7, lúc cao lùi ra 0.35), cuối zoom vào Hà Nội. Tuyến tàu đã đi giữ vệt vàng; ghim Hà Nội thành đích (`mpin--dest`, sao vàng nhấp nháy).
- story.js `flyFrame`: bay theo pv 0.10→0.84 (smoothstep). Chip HUD đổi nhãn "NHA TRANG ▸ n KM" (1.060 km đường chim bay). Thanh hành trình 0.5→1, tới nơi chọn ga HÀ NỘI. Cất cánh: 3 popup **LEFT THE PARTY**, PARTY 4→1 (kéo ngược về đầu thì trả lại 4). Lời thoại `FLY_LINES`: "Graduated. Time to leave Nha Trang." / "Goodbye, friends. Goodbye, sea." / "This time, no train. One flight, straight north." / "Hà Nội. A new level begins." Tới nơi: popup "ARRIVED! Hà Nội · Nội Bài", pv ≥ 0.97 → thẻ "WORLD 2 CLEAR! Next: WORLD 3 · Hà Nội".
- Sửa kèm World 2: `ROAD1 = PY_.x − 220` (xuống xe trước khi vào sân trường; trước đó kéo nhanh tới cuối thì xe máy vẫn chạy trong sân); `.w2` dùng `display:none` khi không ở World 2 (sprite có `visibility: visible` inline sẽ lòi ra trên bản đồ nếu chỉ ẩn bằng visibility).
- Version: `story.js?v=21`, `story-map.js?v=5`, `story-w2.js?v=7`, `story-script.js?v=1`, `story.css?v=14`, `m_clouds.png?v=1`.

## 4g. MY STORY – World 3 "Hà Nội" (ĐÃ XONG bản đầu, phần trọng tâm cho nhà tuyển dụng)

- Ý người dùng: phỏng vấn chỉ là nhịp nhẹ (sếp cũ không đánh giá cao bài phỏng vấn, nhận vì THÁI ĐỘ); **nhấn mạnh giai đoạn khó khăn & sự kiên trì**. Màn dài nhất (track 1300vh).
- Nối từ chuyến bay: tới Nội Bài + pv ≥ 0.9 → chờ 0.9s → `zoomToW3()` (zoom ~36x vào Hà Nội → khử pixel khung đầu World 3, giống bản đồ → World 2) → title WORLD 3 / HÀ NỘI. Vào thẳng: `index.html#w3`. Class `.story.is-w3`.
- `js/story-w3.js` (`StoryW3.create`): 5 tấm nền ChatGPT (chat "Create Pixel Panorama", raw `assets/raw/w3_plateA..E`, web `w3_a..e.webp`), chồng 160px như World 2:
  - A: phố cổ + Hồ Gươm → công ty đầu (phòng phỏng vấn kính: Trung + sếp cũ đeo kính áo polo đọc CV; phòng render server).
  - B: sếp hiện tại (áo blazer tối, tóc ngắn — mô tả tự đặt, CHƯA hỏi người dùng ngoại hình thật) giảng whiteboard → startup nhỏ → văn phòng đông, high-five, biểu đồ xanh.
  - C: thức đêm, đồng hồ 2h, cầu Long Biên, sếp cũng thức trong phòng kính (raw `w3_plateC3`: sếp gõ laptop, mặt hiền, hơi cười, nhìn màn hình; bản C2 mặt "như sát thủ" bị chê). **Người dùng ghét cảnh sếp chống cằm nhìn Trung cười ("nhìn như gay") → sếp và Trung KHÔNG bao giờ nhìn nhau tình cảm; luôn mỗi người tập trung việc của mình hoặc cùng nhìn về một hướng (bảng, màn hình, cửa sổ).**
  - D: Covid 2020 – phố cổ mưa vắng, Trung làm ở nhà sau cửa sổ (video call), văn phòng ghế úp.
  - E: bão 2022 (bàn trống, biểu đồ đỏ) → Trung + sếp hai bàn duy nhất sáng đèn → bình minh, hai người đứng nhìn ra cửa sổ, màn hình AI.
  Trung đã VẼ SẴN trong phòng → sprite đi bộ (`w2_trung`) chỉ hiện ở đoạn ngoài đường (`INSIDE`). Sprite `w3_leavers` (3 đồng nghiệp ôm thùng đồ đi sang trái, raw `w3_sp_leavers`) diễn theo thời gian 4.2s khi tới đoạn bão.
- **Bảng tên RPG** (`.w3-tag`, `TAGS` trong story-w3.js, toạ độ đỉnh đầu theo ảnh): TRUNG (cam), ★ BOSS (vàng), 1ST BOSS (be), ♥ WIFE (hồng) lơ lửng trên đầu nhân vật vẽ sẵn ở mọi tấm → người xem biết ai là sếp, ai là Trung (người dùng sợ bị nhầm). Chữ ở `ui.tag_*` trong story-script.js. Đổi ảnh nền thì phải đo lại toạ độ đầu.
- **Cắt cảnh giữa MỌI tấm World 3 (25/11)**: các tấm đặt cách nhau 600px, không mask mờ; `SEG` chia scroll theo tấm (A .15, B .29, C .38, D .5, E .74, F .82, G .9), trong mỗi tấm tx chạy mép trái→phải, camera kẹp trong tấm đang đứng (`panelOf`) → không bao giờ thấy chỗ nối; sang tấm mới = chớp trắng `.flash`. Lý do: chỗ nối mờ làm lộ "bóng ma" người trong suốt và sprite đi bộ hiện ra rồi biến mất giữa hai văn phòng. Sprite đi bộ chỉ hiện ở phố (tấm A trước x 1120, tấm D trước x 990).
- **Hiệu ứng chuyển cảnh đa dạng (25/11, người dùng chê chớp mãi)**: `transit(kind)` trong story.js (`window.__storyTransit`), lớp `.trans` (CSS: iris – vòng tròn mở, night – tối sầm rồi sáng, blinds – rèm mưa) + `.trans-cv` (canvas: dissolve – tan ô pixel, page – lật trang giấy) + bolt (chớp + tia sét) + flash. World 3: sang B iris, C night, D blinds, E bolt, F dissolve, G page; đi ngược = flash. World 2 phượt→sân trường: dissolve.
- Phân bổ scroll `txAt`: A 0–0.16, B 0.16–0.3, C 0.3–0.4, D 0.4–0.55, E 0.55–0.88 (khó khăn ≈ một nửa). Thời tiết theo vị trí: lớp `.w3__dark` (multiply) + mưa pixel canvas `.w3__fx` từ Covid tới bão, sấm chớp `.w3__bolt` ngẫu nhiên 3.5–7s ở đoạn bão, bình minh `.w3__glow` + hạt sáng xanh-tím (AI). Banner năm dùng `.area` (2020 THE WORLD STOOD STILL / 2022 UNCERTAIN TIMES / 2023 A NEW ERA). HUD **RESILIENCE** (`.meter`) đầy dần qua Covid→bão, chạm max thì vàng. PARTY: 1 → 2 (sếp, MENTOR FOUND) → 3,4,5 (team) → đồng nghiệp rời đi 5→2 (LEFT THE PARTY) → "QUEST ONGOING · Still here. Still building." → "SKILL TREE EXPANDED · AI".
- **Đám cưới (nhịp cuối World 3)**: người dùng ra Hà Nội năm **2019**, cưới **tháng 5/2026 ở NINH BÌNH** (quê, nơi câu chuyện bắt đầu → khép vòng). **Vẫn sống & làm ở Hà Nội, chỉ về quê làm đám cưới** — lời thoại không được gợi ý là chuyển về quê; nhà hiện tại (phòng trang chủ) ở Hà Nội. Tấm `w3_f` (raw `w3_plateF_nb`; bản `w3_plateF` nền Hồ Gươm là SAI địa điểm, không dùng): cổng hoa, chú rể KHÔNG đeo kính áo vest xanh than, cô dâu tóc nâu búi + hoa trắng + váy trễ vai + voan ren dài + bó hoa (khớp ảnh cưới trang chủ), bố mẹ áo dài, nền núi đá vôi, sông có đò, đồng lúa, cổng chùa. Banner `era_hn` "2019 · A NEW CITY. A NEW CAREER." (ở tx 640), `era_wedding` "MAY 2026 · NINH BÌNH · BACK WHERE IT ALL BEGAN", popup "LIFELONG PARTY MEMBER! · PARTY 3", cánh hoa hồng/trắng rơi (canvas). Kết thúc: chớp trắng "tách" như chụp ảnh → khói → trang chủ (tấm ảnh cưới trên bàn = cửa vào MY STORY).
- **Lời kết (sửa 25/11)**: người dùng tháng nào cũng về quê (HN–NB chỉ ~60 km) → KHÔNG viết kiểu "rời nhà lâu rồi quay về". Ý chính: sau 6 năm đi làm học được nhiều → kết hôn, có gia đình → hiện tại ấp ủ nhiều ý tưởng, tiếp tục cố gắng tìm cơ hội mới để lo cho gia đình. Banner cưới "MAY 2026 · NINH BÌNH · A FAMILY OF MY OWN".
- **Cảnh ở nhà (PG, tấm cuối, sửa 25/11)**: `w3_g` (raw `w3_plateG2`) — hai vợ chồng cùng cố gắng vì gia đình: VỢ đi làm công ty, tối về học may và có startup nhỏ làm **dây buộc tóc (scrunchies) handmade** để bán (máy may, kệ scrunchies, hộp đóng gói, chân máy chụp sản phẩm); TRUNG học khoá online, ấp ủ ý tưởng, tìm hướng đi mới. Popup "NEW SIDE QUEST! · Her handmade scrunchie business". Banner "NOW · HÀ NỘI · BUILDING OUR FUTURE". PG là `cut: true` → chớp trắng cắt cảnh từ đám cưới (Ninh Bình) sang nhà (Hà Nội), không nối mờ. Track 1600vh, CAM_END 0.9, HOME_AT 0.95.
- **Kết**: pv ≥ 0.95 → `homeEnding()`: khói phủ → đóng story, về **trang chủ thật** (= hiện tại) + `.sheet` **CHARACTER SHEET** (ngoài `#story`, z 60): avatar, CLASS, quote, thanh chỉ số chạy (`sheet_stats` + `sheet_values` trong story-script.js: ATTITUDE 99, RESILIENCE 99, BACKEND 85, FRONTEND 80, CLOUD 75, AI 80, TEAMWORK 90 — **số tự đặt, cần người dùng xác nhận**), badge "NEW CHAPTER · A family of my own", gõ 3 câu w3_16–18, nút LET'S BUILD SOMETHING (#contact) / VIEW PROJECTS (#work) / ↺ REPLAY STORY / ✕.
- Bảng nhân vật đang mở → lăn chuột / vuốt ở trang chủ KHÔNG mở story (`sheetOpen()`); `openStory` luôn đóng `.sheet` trước (lỗi cũ: lỡ lăn chuột quay lại story mà bảng vẫn đè lên).
- Lời thoại + UI World 3: ChatGPT viết (chat "Rewrite Game Dialogue"), nằm trong `js/story-script.js` (w3_1..w3_18, title_w3, popup_*, era_*, sheet_*).
- Version: `story.js?v=25`, `story-w3.js?v=5`, `story-script.js?v=6`, `story.css?v=17`, ảnh w3 `?v=1`.
- **Timeline thật (25/11)**: thực tập MODORO hồi sinh viên → Superrender (HN) → gặp sếp, cùng mở 3S Cloud → vẫn làm cho sếp đó qua WEGOTT, Kite Learning, iRender, Pictor Lab (hiện tại). Profile đầy đủ: `docs/profile.md`.
- Còn thiếu từ người dùng: ngoại hình sếp hiện tại (có muốn xuất hiện không), mốc năm, chức danh, dự án tiêu biểu + kết quả, bộ công nghệ thật, file CV. #work và #contact chưa có trang.

## 4f. Kịch bản (ChatGPT viết, 24/11/2026)

- Người dùng muốn **ChatGPT viết toàn bộ chữ** ("nó hiểu về tao") — chat ChatGPT **"Rewrite Game Dialogue"**. Kịch bản đầy đủ (World 1 → bay ra Hà Nội + **nháp World 3–6**: The First Job / The Startup / The Next Frontier / My Own Quests, motif "Next stop", popup gợi ý) lưu ở **`docs/kich-ban.md`** — dùng làm gốc khi làm World 3 trở đi (chi tiết trong nháp như PHP/Laravel, IELTS Test Hub, side quest concept là ChatGPT đề xuất, cần người dùng xác nhận).
- **Mọi chữ trong game nằm ở `js/story-script.js`** (`window.STORY_SCRIPT = { lines, ui }`): `lines` w1_1..w1_go, map_1..4, w2_1..9, w2_grad, fly_1..4; `ui` = tiêu đề (title_w1/map/w2/fly), popup (quest_start, arrive_nt, party_join {n}, side_unlock, side_done, achievement, grad, party_leave {n}, arrive_hn), quest_main/side, polaroid_caption, endcard, depart_hint. story.js dùng `LN(k)`, `UIT(k, n)`, `popUI`, `titleUI`, `endUI` (khai báo ngay đầu IIFE — LINES dùng trước khi tới phần giữa file); story-w2.js nhận `LN`, `UIT` qua `create`. Sửa chữ = sửa story-script.js. Cảnh mới: thêm key, nhờ ChatGPT viết theo đúng giọng.
- Lưu ý: tài khoản ChatGPT báo "Plus plan failed to renew" (hộp thoại thanh toán) — KHÔNG bấm thanh toán, chỉ đóng hộp thoại.

## 5. Quy trình làm asset với ChatGPT (đã kiểm chứng)

- Dùng tab ChatGPT "Create Portfolio Homepage" trong Chrome (Claude in Chrome). Tải ảnh bằng JS: `fetch(img.src) → blob → <a download>` vào `~/Downloads`, rồi `cp` sang `assets/raw/`.
- **Sửa một vùng ảnh**: mở ảnh → nút **Comment** → ghim chỉ dẫn lên đúng chỗ → Send. Cách này giữ nguyên bố cục (mô tả bằng chat thường thì ChatGPT hay vẽ lại cả bức).
- **Sprite cần tách nền**: yêu cầu nền magenta phẳng `#FF00FF`, rồi key màu bằng Python (unmix alpha cho vật mờ như rèm; key cứng cho mèo).
- **Biến thể biểu cảm**: chỉ ghép **vùng đặc** (ellipse mặt + polygon cánh tay, viền mờ) từ ảnh sửa vào ảnh gốc. **Không** ghép theo "pixel khác màu" — vùng cùng màu da bị bỏ sót → tay/mặt thủng.
- ChatGPT dễ sai giải phẫu (tay mọc từ cổ áo) → mô tả rõ vai–cánh tay–khuỷu–cẳng tay, kiểm tra phóng to trước khi dùng.
- **Sprite sheet nhân vật** (đã kiểm chứng, ra rất sạch): với động tác vẫy tay phải mô tả cơ học rõ ("arm raised and stays still, elbow fixed, only forearm + palm swing side to side like a windshield wiper", liệt kê từng frame: far left, slightly left, slightly right, far right) — nếu chỉ nói "waving" thì ChatGPT vẽ giơ tay lên hạ xuống. Prompt chung: "SPRITE SHEET … same pixel-art style … N frames … one single horizontal row, same size, evenly spaced with clear gaps, feet on the same baseline, full body … flat solid magenta #FF00FF, no shadow, no floor, no text". Cắt frame theo cột trống, căn theo tâm phần chân (40% dưới) + đáy chân. Script mẫu: key `min(r,b)-g` (40→140 = alpha 1→0).
- Công cụ Resize của ChatGPT tối đa 16:9; không upload file local được qua extension.

## 6. Kiểm tra & bàn giao (bắt buộc)

- Quay frame bằng Playwright (Chrome headless ở `/usr/bin/google-chrome`), soi từng frame / đo chênh lệch giữa các frame để bắt giật, chồng hình. Máy test không có mạng nên font hiện là font dự phòng.
- Ghi file sang máy người dùng: chép vào `/mnt/user-data/outputs/site/…` → **đợi ~25s** → so md5 bản trung chuyển → `device_commit_files` → **so md5 trên máy người dùng**. Đã nhiều lần bị ghi nhầm bản cũ nếu không đợi.
- Đổi asset thì tăng `?v=` trong đường dẫn để trình duyệt không dùng cache. Hiện tại: `bg_wide v=7` (index.html, style.css), ảnh cưới `photo_* v=5` và rèm `curtain_* v=5` (main.js), `avatar* v=8` (index.html).
- Nhắc người dùng **Cmd+Shift+R**.

## 4h. ABOUT – menu tạm dừng JRPG (ĐÃ XONG bản đầu, 25/11)
- Mở: click giấy khen (hotspot about) / nav ABOUT / `index.html#about`. Trang chủ zoom 2.6x vào giấy khen + mờ (`body.about-zoom`) → tờ giấy bung ra từ tâm giấy khen (steps) → con dấu sáp đập "cộp" (rung) → STATUS. ESC / ✕ / click nền / nút Back = gập lại. Khi `body.about-open` (không trong lúc chuyển) main.js ngừng vẽ rèm/khói/ảnh cưới.
- File: `js/about.js` (dựng DOM `<section id="about-menu">`, âm 8-bit WebAudio theo `pf_mute`), `js/about-data.js` (**mọi chữ + dữ kiện**), `css/about.src.css` → chạy `python3 tools/about_css.py` sinh `css/about.css` (U(n) = n px thiết kế khung 1600×900 × `--u`; màn dọc `.about--narrow`: lệnh thành hàng tab ngang, giấy cuộn dọc). **Không sửa about.css trực tiếp.**
- Tab: STATUS (chân dung, LV 7, nhãn EXPERIENCED/PRACTITIONER… thay số, HP/MP, bio gõ chữ) · SKILL TREE (5 nhánh, nối dây SVG tính theo vị trí thật, sáng = thạo, mờ nét đứt = đang học) · INVENTORY 6×4 · QUEST LOG 3 chương (sprite Trung + sếp đi bộ 4 frame; nút ▶ REPLAY IN STORY → `__story.open(..., {world2/world3})`) · ACHIEVEMENTS 8 mở + 4 bí mật lưu localStorage (`pf_ach_cat` vuốt mèo, `pf_ach_story` xem hết story, `pf_ach_explorer` mở đủ 6 tab, `pf_ach_talk` chưa dùng) · SAVE (CV tải `assets/cv.pdf` — **chưa có file → hiện "CV coming soon"**; CONTINUE #contact, LOAD replay story, VIEW PROJECTS #work).
- Phím: ↑↓ đổi tab, Enter/→ vào ô, mũi tên đi theo vị trí thật trên màn, ← ở mép / ESC ra cột lệnh. Chuột: rê (mousemove, không dùng mouseover vì layout đổi dưới con trỏ đứng yên sẽ tự chọn nhầm).
- Asset (chat ChatGPT "Create pixel UI mockup", raw `assets/raw/about/ab_*.png`, mockup `mock_*.png`): `assets/about/icons.png` (atlas 32 ô 96px, bảng chỉ số ở đầu about-data.js), `badges.png` (12 ô 160px, ô 11 = con dấu sáp), `portrait.webp`, `duo.png` (4 frame 250×200, cắt bằng sheet.py). Cắt lưới: `tools/sprites/grid.py src dst cols rows cell` (key magenta, bỏ mảnh lẹm của ô bên).
- **Khung/viền = ảnh ChatGPT vẽ, ghép bằng 9-slice `border-image`** (người dùng chê bản viền CSS trơn "không giống preview"): `frame_cmd.png` (cột lệnh nâu, hoa văn trên + nhành nguyệt quế dưới, slice 90 28 100 28), `frame_paper.png` (giấy da rách mép, slice 64), `deco_bar` (thanh chọn lệnh), `deco_cursor` ▶, `deco_card` (thẻ: thuộc tính, nhánh kỹ năng, quest, save), `deco_dialog` (hộp mô tả), `deco_slot` (ô inventory), `deco_check`, `deco_laurel_l/r` (2 bên tiêu đề). Raw `ab_frames.png`, `ab_decor.png`. Nền: trang chủ chỉ zoom 1.35x + blur 2px (giống mockup, vẫn thấy phòng).
- Version: `about.css?v=2`, `about.js?v=1`, `about-data.js?v=2`, `main.js?v=2`, ảnh about `?v=1`.
- Cần người dùng xác nhận: "Learned at" của từng kỹ năng (đang ước đoán), file CV, ngoại hình sếp trong sprite đi bộ.

## 4i. MY WORK – kệ băng game (ĐÃ XONG bản đầu, 25/11)
- Mở: click máy chơi game trên bàn / nav MY WORK / `index.html#work` (cũng nghe `hashchange`, nên nút VIEW PROJECTS của ABOUT dẫn sang được). Trang chủ zoom 3.2x vào máy (`body.work-zoom`, dùng chung `about-open/about-anim` để main.js nghỉ vẽ) → màn CRT bật (vạch ngang → mở dọc) → GAME LIBRARY. ESC/✕ = CRT tắt → về phòng.
- Kệ: ảnh `assets/work/library.webp` (raw `wk_bg.png`) 3 tầng, mặt kệ `ROW_Y [250, 444, 640]`, bảng đồng `PLAQUE_Y [281, 478, 681]` (chữ FEATURED / MORE QUESTS / HOMEBREW đè lên). Băng = vỏ `carts.png` (5 màu: cam 3S, xanh ngọc Pictor, vàng Kite, tím công ty khác, trắng tự chế; ô nhãn 14.9%/30.8%, 71.2%×43.3%; dải tên 75.6%) + tranh `labels.webp` (9 ô 320×240). Bộ lọc thể loại làm mờ băng không khớp. Chọn băng → thanh thông tin trên bàn; Enter/click → băng bay vào khe máy (`.work__console` thunk) → màn PRESS START (1.5s, click bỏ qua) → bìa sau hộp game (khung giấy da của ABOUT): ảnh màn hình CRT (chưa có ảnh thật → hiện tranh nhãn + "SCREENSHOTS COMING SOON"), STORY / YOUR ROLE / PARTY (icon ABOUT) / HIGH SCORE, ▶ PLAY (link) / ⏏ EJECT.
- File: `js/work.js`, `js/work-data.js` (**mọi chữ + dữ kiện**, thêm ảnh thật bằng `shots: ['assets/work/shots/pictor-1.webp', …]`), `css/work.src.css` → `python3 tools/about_css.py` (giờ sinh mọi `*.src.css`). Âm thanh dùng `window.__sfx` của about.js (thêm `insert`, `power`).
- Dữ kiện dự án: `docs/projects.md` (ChatGPT tổng hợp, CẦN Trung xác nhận; số liệu kết quả hầu hết "?"). Băng bí mật CAT SERVANT SIM ở HOMEBREW.
- Version: `work.css?v=1`, `work.js?v=1`, `work-data.js?v=1`, `about.js?v=2`.
- Cần người dùng: ảnh chụp màn hình thật từng dự án, số liệu, xác nhận link + NDA.

## 4j. LET'S TALK – bảng ghim (ĐÃ XONG bản đầu, 25/11)
- Mở: click bảng ghim / nút LET'S TALK (nav, bảng nhân vật, CONTINUE của ABOUT) / `index.html#contact` (nghe cả hashchange). Trang chủ zoom 2.4x vào bảng ghim (`body.talk-zoom`) → bảng phóng ra từ chỗ bảng ghim (steps) → giấy ghim lần lượt hiện. ESC / ✕ / click nền = gập lại.
- Bố cục (toạ độ ảnh bảng 1672×941, `assets/talk/board.webp`, raw `assets/raw/talk/tk_board.png`): dải tiêu đề (730,70), tờ giấy kẻ dòng = form (110,150 570×745), 4 note 2×2 (730,250), polaroid chân dung (1330,250). Giấy/ghim/đồng xu: `assets/talk/*.png` từ raw `tk_papers.png` (chat "Create pixel UI mockup").
- Form KHÔNG có máy chủ: INSERT COIN = đồng xu rơi vào nút + tiếng cạch → `mailto:` soạn sẵn tiêu đề "[Portfolio] {loại} · from {tên}" + nội dung, rồi hiện dòng dự phòng ghi email. Gửi → mở khoá thành tựu FIRST CONTACT (`pf_ach_talk`) ở ABOUT. Note EMAIL có nút COPY.
- File: `js/talk.js`, `js/talk-data.js` (chữ + liên hệ), `css/talk.src.css` → `python3 tools/about_css.py`. Version `talk.css?v=2`, `talk.js?v=2`, `talk-data.js?v=2`, `about-data.js?v=3`.
- Liên hệ: điện thoại 0913 558 765 (Trung đưa 25/11, note EMAIL · PHONE có nút CALL `tel:+84913558765`); (ChatGPT, CẦN XÁC NHẬN) email ethanftd@gmail.com, GitHub @GaoBlues2 (chỉ biết username), LinkedIn chưa có (`linkedin: null` = ẩn note), trình độ tiếng Anh chưa rõ.

## 7. Việc còn tồn / bước tiếp theo

- Xoá tay `assets/photo_0.png … photo_7.png` (bản ảnh cưới cũ, không dùng — agent không có quyền xoá).
- Đủ 4 cửa trang chủ: #story, #about (4h), #work (4i), #contact (4j). Còn easter egg con mèo. (`#story` đã xong World 1).
- Chưa thấy chân ghế + chậu cây góc phải dưới (nối phía dưới bị bóng ghế chồng — cần ChatGPT vẽ riêng phần sàn khớp ghế hiện tại).
- Đã xong bản đồ (4c) và World 2 (4d). Cần hỏi: năm vào/ra trường, tên công ty thực tập. Đã xong chuyến bay ra Hà Nội (4e) và **World 3 Hà Nội + bảng nhân vật** (4g) — MY STORY đã chạy trọn từ ga Ninh Bình tới hiện tại. **Tiếp theo**: bổ sung dữ kiện thật cho World 3 (dự án, năm, công nghệ, CV), rồi các trang MY WORK (#work), LET'S TALK (#contact), ABOUT. Dùng tiếp chat ChatGPT "Create Pixel Panorama" để giữ nhân vật.
- Sau đó: ABOUT (character card / stat RPG), MY WORK (dự án dạng băng game), LET'S TALK (form "INSERT COIN"), easter egg con mèo.
