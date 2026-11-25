# Cắt sprite sheet nền magenta: key màu, tách frame theo cột trống, căn chân, xuất 1 hàng frame cùng cỡ
import sys, numpy as np
from PIL import Image
src, dst, n, H = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
m = np.minimum(r, b) - g
alpha = np.clip((140 - m) / 100, 0, 1)
alpha[(r < 120) | (b < 120)] = np.maximum(alpha[(r < 120) | (b < 120)], 1)  # vùng tối không phải magenta
alpha = np.where(m > 140, 0, alpha)
# khử viền hồng: kéo r,b về g theo phần còn magenta
k = 1 - alpha
rgb = a.copy()
spill = np.clip(m / 255, 0, 1)[..., None] * (alpha[..., None] < 1)
rgb[..., 0] = np.where(alpha < 1, np.minimum(r, g + 40), r); rgb[..., 2] = np.where(alpha < 1, np.minimum(b, g + 40), b)
cols = (alpha > 0.5).sum(0) > 2
# các đoạn cột có nội dung
segs = []; x = 0; W = len(cols)
while x < W:
    if cols[x]:
        s = x
        while x < W and cols[x]: x += 1
        segs.append([s, x])
    else: x += 1
# gộp đoạn sát nhau (khe < 12px) cho tới khi còn n đoạn
while len(segs) > n:
    gaps = [segs[i + 1][0] - segs[i][1] for i in range(len(segs) - 1)]
    i = int(np.argmin(gaps)); segs[i][1] = segs[i + 1][1]; del segs[i + 1]
print('segs', segs)
rows = (alpha > 0.5).sum(1) > 0
y0 = int(np.argmax(rows)); y1 = len(rows) - int(np.argmax(rows[::-1]))
frames = []
for s, e in segs:
    sub = alpha[:, s:e] > 0.5
    ys = np.where(sub.any(1))[0]
    # tâm theo phần chân (40% dưới)
    fy0 = ys[-1] - int((ys[-1] - ys[0]) * 0.4)
    xs = np.where(sub[fy0:ys[-1] + 1].any(0))[0]
    cx = s + (xs[0] + xs[-1]) / 2
    frames.append((s, e, ys[-1], cx))
half = int(max(max(cx - s, e - cx) for s, e, _, cx in frames)) + 4
top = y0 - 4; foot = max(f[2] for f in frames)
fh = foot - top + 2; fw = 2 * half
out = Image.new('RGBA', (fw * n, fh), (0, 0, 0, 0))
img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
for i, (s, e, fb, cx) in enumerate(frames):
    crop = img.crop((int(cx - half), top - (foot - fb), int(cx + half), top - (foot - fb) + fh))
    out.paste(crop, (i * fw, 0), crop)
scale = H / fh
out = out.resize((round(fw * n * scale), H), Image.LANCZOS)
out.save(dst); print('frame', round(fw * scale), H, 'n', n)
