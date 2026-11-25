import json, math
G='/tmp/ne/geojson/'
B=(80.0,137.0,-2.0,32.0)
def inb(x,y,m=1): return B[0]-m<x<B[1]+m and B[2]-m<y<B[3]+m
def polys(g):
    c=g['coordinates']
    return [c] if g['type']=='Polygon' else c
def thin(ring,eps):
    out=[ring[0]]
    for p in ring[1:]:
        if math.hypot(p[0]-out[-1][0],p[1]-out[-1][1])>=eps: out.append(p)
    return [[round(x,3),round(y,3)] for x,y in out]
d=json.load(open(G+'ne_10m_admin_0_countries.geojson'))
vn=[];nb=[];hs=[];ts=[]
for f in d['features']:
    a=f['properties']['ADM0_A3']
    for poly in polys(f['geometry']):
        ring=poly[0]
        xs=[p[0] for p in ring]; ys=[p[1] for p in ring]
        cx=sum(xs)/len(xs); cy=sum(ys)/len(ys)
        if not any(inb(x,y) for x,y in ring): continue
        if a=='VNM': vn.append(thin(ring,0.01))
        elif a=='CHN' and cy<17.6 and cx>110.5: hs.append(thin(ring,0.002))   # quần đảo Hoàng Sa (NE gán sai cho TQ)
        elif a=='PGA': ts.append(thin(ring,0.002))
        elif a in ('SCR',): continue
        else:
            r=thin(ring,0.03)
            if len(r)>=3: nb.append(r)
# đảo nhỏ trong file minor islands thuộc vùng Trường Sa / Hoàng Sa
try:
    mi=json.load(open(G+'ne_10m_minor_islands.geojson'))
    for f in mi['features']:
        for poly in polys(f['geometry']):
            ring=poly[0]; xs=[p[0] for p in ring]; ys=[p[1] for p in ring]
            cx=sum(xs)/len(xs); cy=sum(ys)/len(ys)
            if 111<cx<113.2 and 15.6<cy<17.3: hs.append(thin(ring,0.002))
            elif 111<cx<117 and 6.5<cy<11.6: ts.append(thin(ring,0.002))
except Exception as e: print('mi',e)
# đường sắt
r=json.load(open(G+'ne_10m_railroads.geojson'))
rails=[]
for f in r['features']:
    g=f['geometry']; ls=g['coordinates'] if g['type']=='MultiLineString' else [g['coordinates']]
    for l in ls:
        if any(102<x<110 and 10<y<23.5 for x,y in l): rails.append(thin(l,0.01))
json.dump({'bounds':B,'vn':vn,'nb':nb,'hs':hs,'ts':ts,'rails':rails},open('raw_geo.json','w'))
print(len(vn),len(nb),len(hs),len(ts),len(rails), sum(len(x) for x in vn))
