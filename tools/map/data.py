import json, math
m=json.load(open('map_meta.json')); B=m['B']; RES=m['RES']; K=m['K']
P=lambda x,y:[round((x-B[0])*K/RES,1),round((B[3]-y)/RES,1)]
route=json.load(open('route.json'))
# ép điểm đầu/cuối đúng ga
route[0]=[105.975,20.254]; route[-1]=[109.183,12.248]
def km(a,b):
    R=6371; la1,la2=math.radians(a[1]),math.radians(b[1]); dl=math.radians(b[0]-a[0])
    return R*2*math.asin(math.sqrt(math.sin((la2-la1)/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dl/2)**2))
cum=[0]
for a,b in zip(route,route[1:]): cum.append(cum[-1]+km(a,b))
home=[round(km(route[0],p)) for p in route]
CITIES=[('NINH BÌNH',105.975,20.254,'start'),('HÀ NỘI',105.854,21.028,'cap'),('VINH',105.672,18.679,''),('HUẾ',107.585,16.463,''),
        ('ĐÀ NẴNG',108.206,16.068,''),('QUY NHƠN',109.219,13.776,''),('NHA TRANG',109.183,12.248,'end')]
cities=[]
for n,x,y,k in CITIES:
    i=min(range(len(route)),key=lambda j:km(route[j],(x,y)))
    cities.append({'name':n,'p':P(x,y),'s':round(cum[i]/cum[-1],4) if k!='cap' else None,'kind':k})
labels=[{'name':'HOÀNG SA','sub':'(VIỆT NAM)','p':P(111.95,17.75)},{'name':'TRƯỜNG SA','sub':'(VIỆT NAM)','p':P(114.6,11.95)},{'name':'BIỂN ĐÔNG','p':P(112.3,13.9),'sea':1}]
out={'W':m['W'],'H':m['H'],'route':[P(*p) for p in route],'cum':[round(c/cum[-1],4) for c in cum],'home':home,'railKm':round(cum[-1]),'cities':cities,'labels':labels}
open('../../js/map-data.js','w').write('/* Bản đồ VN cho MY STORY – sinh tự động từ Natural Earth 10m (map/render.py, data.py). Toạ độ = px của assets/story/m_base.png */\nwindow.MAP_DATA = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n')
print(out['railKm'],home[-1],[ (c['name'],c['s']) for c in cities])
