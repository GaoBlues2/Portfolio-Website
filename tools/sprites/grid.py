# Cắt sprite sheet dạng lưới đều (cols x rows) nền magenta → atlas ô vuông cùng cỡ (1 hàng ngang).
# python3 grid.py src.png dst.png cols rows cell [pad]
#   - key magenta giống sheet.py (unmix nhẹ + khử viền hồng)
#   - mỗi ô lưới: cắt theo alpha, giữ TỈ LỆ TƯƠNG ĐỐI giữa các icon (cùng một hệ số scale)
#   - atlas: n ô cell×cell xếp 1 hàng, icon căn giữa, đáy… căn giữa theo cả 2 chiều
import sys, numpy as np
from PIL import Image
from scipy import ndimage

src, dst, cols, rows, cell = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
pad = int(sys.argv[6]) if len(sys.argv) > 6 else 4

a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
m = np.minimum(r, b) - g
alpha = np.clip((140 - m) / 100, 0, 1)
alpha = np.where(m > 140, 0, alpha)
rgb = a.copy()
edge = alpha < 1
rgb[..., 0] = np.where(edge, np.minimum(r, g + 40), r)
rgb[..., 2] = np.where(edge, np.minimum(b, g + 40), b)

H, W = alpha.shape
boxes = []
for j in range(rows):
    for i in range(cols):
        x0, x1 = int(W * i / cols), int(W * (i + 1) / cols)
        y0, y1 = int(H * j / rows), int(H * (j + 1) / rows)
        sub = alpha[y0:y1, x0:x1] > 0.35
        # bỏ mảnh lẹm của icon ô bên cạnh: thành phần chạm mép ô và nhỏ (< 20% mảnh lớn nhất)
        lab, nl = ndimage.label(ndimage.binary_dilation(sub, iterations=3))
        if nl > 1:
            areas = ndimage.sum(sub, lab, range(1, nl + 1)); big_a = areas.max()
            for q in range(1, nl + 1):
                comp = lab == q
                touch = comp[0].any() or comp[-1].any() or comp[:, 0].any() or comp[:, -1].any()
                if touch and areas[q - 1] < 0.2 * big_a:
                    sub &= ~comp; alpha[y0:y1, x0:x1][comp] = 0
        ys, xs = np.where(sub)
        if len(xs) == 0:
            boxes.append(None); continue
        boxes.append((x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1))

img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
big = max(max(bx[2] - bx[0], bx[3] - bx[1]) for bx in boxes if bx)
k = (cell - 2 * pad) / big
out = Image.new('RGBA', (cell * len(boxes), cell), (0, 0, 0, 0))
for n, bx in enumerate(boxes):
    if not bx: continue
    c = img.crop(bx)
    w, h = max(1, round(c.width * k)), max(1, round(c.height * k))
    c = c.resize((w, h), Image.BOX)
    out.paste(c, (n * cell + (cell - w) // 2, (cell - h) // 2), c)
out.save(dst, optimize=True)
print('atlas', out.size, 'n', len(boxes), 'scale', round(k, 3))
