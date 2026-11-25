# Sửa Pixelify Sans (google/fonts: ofl/pixelifysans/PixelifySans[wght].ttf) cho dễ đọc ở cỡ nhỏ:
#  - C/c: bản gốc chỉ hở 1 ô pixel bên phải → nhìn như O. Nới chỗ hở ra 3 ô.
#  - 2/3/S/G (25/11): móc trên/dưới chỉ cách nét giữa 1 ô → cỡ nhỏ đọc thành 8. Thu ngắn móc.
#  - 5: bỏ cột phải phía trên + vuông 2 góc trên (khác chữ S).  B: vuông 2 góc trái (khác số 8).
# Dùng: python3 fix_pixelify.py PixelifySans[wght].ttf ../../assets/fonts/pixelify-fix.ttf
# Chỉ đổi toạ độ điểm (giữ số điểm) nên bảng gvar (độ đậm 400–700) vẫn dùng được.
import sys
from fontTools.ttLib import TTFont
f = TTFont(sys.argv[1]); G = f['glyf']
def patch(name, m):
    c = G[name].coordinates
    for i, (x, y) in enumerate(c):
        if x >= 423 and y in m: c[i] = (x, m[y])
def sety(name, idx, y):
    c = G[name].coordinates
    for i in idx: c[i] = (c[i][0], y)
def setp(name, idx, p):
    c = G[name].coordinates
    for i in idx: c[i] = p
patch('C', {350: 450, 270: 169})
patch('c', {260: 300, 179: 140})
sety('two', (9, 10), 495); sety('two', (23, 24), 124)
sety('three', (13, 14), 495); sety('three', (3, 4), 124)
sety('S', (17, 18), 495); sety('S', (3, 4), 124)
sety('G', (9, 10), 495)
sety('five', (19, 20), 540); sety('five', (3, 4), 124)
setp('five', (13, 14, 15), (60, 631)); setp('five', (16, 17), (525, 631))
setp('B', (0, 1, 2), (60, -12)); setp('B', (4, 5), (60, 631))
f['name'].setName('Pixelify Fix', 1, 3, 1, 0x409)
f.save(sys.argv[2])
