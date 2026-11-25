import json, math, random
import numpy as np, cv2
from PIL import Image, ImageDraw
random.seed(7); rng=np.random.default_rng(7)
g=json.load(open('raw_geo.json')); B=g['bounds']
RES=0.04; K=math.cos(math.radians(15))
W=int(round((B[1]-B[0])*K/RES)); H=int(round((B[3]-B[2])/RES))
def P(x,y): return ((x-B[0])*K/RES,(B[3]-y)/RES)
def mask(polys,dil=0):
    im=Image.new('L',(W,H),0); d=ImageDraw.Draw(im)
    for r in polys:
        pts=[P(*p) for p in r]
        if len(pts)>=3: d.polygon(pts,fill=255)
    m=np.array(im)>0
    return m
vn=mask(g['vn']); nb=mask(g['nb'])&~vn
# đảo Hoàng Sa / Trường Sa: tối thiểu 2x2 px mỗi đảo
isl=np.zeros((H,W),bool)
for r in g['hs']+g['ts']:
    xs=[P(*p)[0] for p in r]; ys=[P(*p)[1] for p in r]
    cx,cy=int(round(sum(xs)/len(xs))),int(round(sum(ys)/len(ys)))
    isl[cy-1:cy+2,cx-1:cx+2]=True
isl|=mask(g['hs']+g['ts'])
land=vn|nb|isl
vn|=isl
# ---- màu ----
C=lambda h: tuple(int(h[i:i+2],16) for i in (1,3,5))
img=np.zeros((H,W,3),np.uint8)
# biển: theo khoảng cách tới đất
dist=cv2.distanceTransform((~land).astype(np.uint8),cv2.DIST_L2,3)
deep=C('#22609e'); mid=C('#2c71ad'); shal=C('#4b93c2'); rim=C('#84c1d6'); foam=C('#d6eef0')
img[:]=deep
img[dist<26]=mid
# dither ranh giới các dải
yy,xx=np.mgrid[0:H,0:W]; chk=((xx+yy)%2==0)
img[(dist>=26)&(dist<29)&chk]=mid
img[dist<9]=shal
img[(dist>=9)&(dist<11)&chk]=shal
img[dist<3.2]=rim
img[(dist<1.6)]=foam
# gợn sóng: gạch ngang 3-4px sáng ở biển sâu/giữa
for _ in range(1400):
    x=random.randrange(W); y=random.randrange(H)
    if dist[y,x]<14: continue
    L=random.choice([3,3,4,5])
    if x+L>=W or not (dist[y,x:x+L]>=14).all(): continue
    c=C('#3f80ba') if dist[y,x]>=26 else C('#4b8ec4')
    img[y,x:x+L]=c
    if random.random()<0.5 and y>0: img[y-1,x+1:x+L-1]=c
# lưới kinh/vĩ độ mờ trên biển (mỗi 5 độ), nét chấm
for lon in range(80,140,5):
    x=int(round(P(lon,0)[0]))
    if 0<=x<W:
        sel=(~land[:,x])&(yy[:,0]%4<2); img[sel,x]=(img[sel,x]*0.85+np.array(C('#bfe3ef'))*0.15).astype(np.uint8)
for lat in range(0,35,5):
    y=int(round(P(100,lat)[1]))
    if 0<=y<H:
        sel=(~land[y,:])&(xx[0]%4<2); img[y,sel]=(img[y,sel]*0.85+np.array(C('#bfe3ef'))*0.15).astype(np.uint8)
# đất láng giềng: be giấy, nhiễu nhẹ
nbc=C('#e3d3b4'); nbd=C('#d4c19d')
img[nb]=nbc
noise=rng.random((H,W))
img[nb&(noise<0.08)]=nbd
# Việt Nam: xanh, vùng núi đậm hơn (dither), đồng bằng vàng xanh
vg=C('#86b85a'); vgd=C('#6a9d47'); vgl=C('#a8c96a'); vgdd=C('#4f7f39')
img[vn]=vg
lon=B[0]+xx*RES/K; lat=B[3]-yy*RES
# độ "núi": khoảng cách vào trong đất liền tính từ bờ biển (đo theo px), nhưng chỉ phía tây
dl=cv2.distanceTransform(vn.astype(np.uint8),cv2.DIST_L2,3)
coast=cv2.distanceTransform((~land).astype(np.uint8)*0+(land).astype(np.uint8),cv2.DIST_L2,3)
seaDist=dist  # khoảng cách tới đất (ngược) — dùng distance tới biển cho đất:
toSea=cv2.distanceTransform(land.astype(np.uint8),cv2.DIST_L2,3)
hill=vn&(toSea>7)
hill2=vn&(toSea>14)
img[hill&chk]=vgd
img[hill2]=vgd
img[hill2&chk&(noise<0.5)]=vgdd
# đồng bằng sông Hồng & Cửu Long
e1=((lon-106.2)/0.95)**2+((lat-20.6)/0.75)**2
e2=((lon-105.6)/1.35)**2+((lat-9.9)/1.25)**2
nz=cv2.GaussianBlur(rng.random((H,W)).astype(np.float32),(0,0),3)*1.2
delta=vn&((e1+nz*0.6<1.25)|(e2+nz*0.6<1.3))
delta2=vn&((e1+nz*0.6<1.45)|(e2+nz*0.6<1.5))&~delta
img[delta2&chk]=vgl
img[delta]=vgl
img[delta&(noise<0.12)]=vg
# Tây Nguyên cao nguyên (đất đỏ bazan lốm đốm)
th=vn&(lat>11.6)&(lat<15.2)&(lon<108.6)&(toSea>8)
img[th&(noise<0.07)]=C('#b8794a')
# viền bãi cát dọc bờ đất (1px) & viền mực
edge=land&(toSea<1.5)
img[vn&edge]=C('#e9d89a')
img[nb&edge]=C('#efe3c8')
# đường viền ngoài (phía biển, sát đất) màu mực
out=(~land)&(dist<1.5)
img[out]=C('#1f3b55')
# biên giới VN – láng giềng: chấm mực
vd=cv2.dilate(vn.astype(np.uint8),np.ones((3,3),np.uint8))>0
border=nb&vd
img[border&chk]=C('#7a5a3a')
img[border&~chk]=C('#c9b28a')
# núi (icon 5x4) rải trên vùng núi VN & láng giềng
MT=["..#..",".#^#.","#^^^#","#####"]
def stamp(x,y,col,hi):
    for j,row in enumerate(MT):
        for i,ch in enumerate(row):
            X,Y=x+i-2,y+j-3
            if 0<=X<W and 0<=Y<H and ch!='.':
                img[Y,X]=hi if ch=='^' else col
cand=list(zip(*np.where(hill2&(toSea>18))))
random.shuffle(cand); placed=[]
for (y,x) in cand:
    if all(abs(x-a)+abs(y-b)>11 for a,b in placed):
        placed.append((x,y)); stamp(x,y,C('#3f6a2e'),C('#9cc36b'))
    if len(placed)>140: break
cand=list(zip(*np.where(nb&(toSea>25))))
random.shuffle(cand); placed=[]
for (y,x) in cand:
    if all(abs(x-a)+abs(y-b)>16 for a,b in placed):
        placed.append((x,y)); stamp(x,y,C('#c2ab82'),C('#efe3c8'))
    if len(placed)>260: break
# đảo: 3x3, lõi xanh, viền cát + mực
for r in g['hs']+g['ts']:
    xs=[P(*p)[0] for p in r]; ys=[P(*p)[1] for p in r]
    cx,cy=int(round(sum(xs)/len(xs))),int(round(sum(ys)/len(ys)))
    img[cy-2:cy+3,cx-2:cx+3]=np.where(land[cy-2:cy+3,cx-2:cx+3,None],img[cy-2:cy+3,cx-2:cx+3],img[cy-2:cy+3,cx-2:cx+3])
    img[cy-1:cy+2,cx-1:cx+2]=C('#e9d89a'); img[cy,cx]=vg
# khung nét đứt quanh 2 quần đảo (quy ước bản đồ VN)
def dbox(l0,l1,a0,a1,col=C('#d6eef0')):
    x0,y0=map(int,P(l0,a1)); x1,y1=map(int,P(l1,a0))
    for x in range(x0,x1+1):
        if (x//3)%2==0: img[y0,x]=col; img[y1,x]=col
    for y in range(y0,y1+1):
        if (y//3)%2==0: img[y,x0]=col; img[y,x1]=col
    return x0,y0,x1,y1
def bbox(rs):
    xs=[p[0] for r in rs for p in r]; ys=[p[1] for r in rs for p in r]; return min(xs),max(xs),min(ys),max(ys)
hb=bbox(g['hs']); tb=bbox(g['ts'])
BOX={'hs':dbox(hb[0]-0.45,hb[1]+0.45,hb[2]-0.4,hb[3]+0.4),'ts':dbox(tb[0]-0.45,tb[1]+0.45,tb[2]-0.4,tb[3]+0.4)}
print('hs',hb,'ts',tb,BOX)
Image.fromarray(img).save('map_base.png')
json.dump({'B':B,'RES':RES,'K':K,'W':W,'H':H},open('map_meta.json','w'))
print(W,H)
