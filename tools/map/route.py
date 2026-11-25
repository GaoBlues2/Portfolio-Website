import json, math, heapq
g=json.load(open('raw_geo.json'))
# đồ thị từ các đoạn ray; nối đầu mút gần nhau (<0.03°)
nodes=[];adj={}
def nid(p):
    for i,q in enumerate(nodes):
        if abs(p[0]-q[0])<0.03 and abs(p[1]-q[1])<0.03: return i
    nodes.append(p); return len(nodes)-1
def km(a,b):
    R=6371; la1,la2=math.radians(a[1]),math.radians(b[1]); dl=math.radians(b[0]-a[0])
    return R*2*math.asin(math.sqrt(math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dl/2)**2))
for l in g['rails']:
    ids=[nid(p) for p in l]
    for a,b in zip(ids,ids[1:]):
        if a==b: continue
        w=km(nodes[a],nodes[b]); adj.setdefault(a,[]).append((b,w)); adj.setdefault(b,[]).append((a,w))
# nối đầu mút các đoạn với nút gần nhất của đoạn khác (<0.12°)
ends=set()
for l in g['rails']:
    ends.add(nid(l[0])); ends.add(nid(l[-1]))
for e in ends:
    best=None
    for i,q in enumerate(nodes):
        if i==e or i in [v for v,_ in adj.get(e,[])]: continue
        d=km(nodes[e],q)
        if d<13 and (best is None or d<best[1]): best=(i,d)
    if best: adj.setdefault(e,[]).append(best); adj.setdefault(best[0],[]).append((e,best[1]))
def near(p): return min(range(len(nodes)),key=lambda i:km(nodes[i],p))
NB=(105.975,20.254); NT=(109.183,12.248)
s,t=near(NB),near(NT); print('snap',nodes[s],km(nodes[s],NB),nodes[t],km(nodes[t],NT))
dist={s:0};prev={};pq=[(0,s)]
while pq:
    d,u=heapq.heappop(pq)
    if u==t: break
    if d>dist[u]: continue
    for v,w in adj.get(u,[]):
        if d+w<dist.get(v,1e9): dist[v]=d+w; prev[v]=u; heapq.heappush(pq,(d+w,v))
path=[t]
while path[-1]!=s: path.append(prev[path[-1]])
path=[nodes[i] for i in reversed(path)]
L=sum(km(a,b) for a,b in zip(path,path[1:]))
print('rail km',round(L),'pts',len(path),'straight',round(km(NB,NT)))
json.dump(path,open('route.json','w'))
