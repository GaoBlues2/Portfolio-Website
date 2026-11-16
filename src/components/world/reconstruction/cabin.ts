import * as T from 'three'
import { Sculpt, mat, canvasTexture, texturedPlane, rng } from './modeling'
import type { V3 } from './modeling'
import { colors as c } from './config'
import { grass, plant } from './nature'
function screenTexture(left:boolean){return canvasTexture(512,384,ctx=>{
 ctx.fillStyle='#12141f';ctx.fillRect(0,0,512,384);ctx.fillStyle='#292939';ctx.fillRect(0,0,512,24);ctx.fillStyle='#373047';ctx.fillRect(0,24,45,360);ctx.fillStyle='#dbab6e';ctx.fillRect(10,9,7,7);ctx.fillStyle='#79aa70';ctx.fillRect(23,9,7,7)
 const random=rng(left?87:42);const colors=['#9e6b9f','#6ca3bd','#cfad72','#859e86','#b9b6c6'];
 for(let row=0;row<24;row++){let x=58+(row%4)*10;const y=38+row*13;ctx.fillStyle='#54576b';ctx.fillRect(28,y,7,3);for(let j=0;j<3+random()*4;j++){ctx.fillStyle=colors[(row+j)%5];const w=10+random()*48;ctx.fillRect(x,y,w,3);x+=w+7;if(x>460)break}}
 if(left){ctx.fillStyle='#1b1828';ctx.fillRect(55,40,185,125);ctx.font='bold 70px monospace';ctx.fillStyle='#c5df74';ctx.fillText('</>',65,128)}
 ctx.fillStyle='#343046';ctx.fillRect(0,370,512,14)
})}
function monitor(b:Sculpt,at:V3,left:boolean,angle=0){
 const sub=new Sculpt();sub.box([0,.04,0],[.37,.06,.3],c.black,.025);sub.box([0,.23,-.015],[.07,.4,.055],c.steel,.02)
 sub.box([0,.59,0],[.94,.77,.085],c.black,.035);const screen=sub.part("monitor-screen");texturedPlane(screen,[0,.59,.048],[.85,.67],screenTexture(left),.5);screen.finish()
 sub.box([0,.235,.05],[.03,.015,.012],c.lime,.002)
 const group=sub.finish();group.position.set(...at);group.rotation.y=angle;b.group.add(group)
}
function book(b:Sculpt,at:V3,height:number,color:string,tilt=0){b.box(at,[.09,height,.24],color,.008,[0,0,tilt]);b.box([at[0],at[1]+height*.32,at[2]+.125],[.05,.012,.004],'#d8cba1',.001);b.box([at[0],at[1]-height*.25,at[2]+.125],[.045,.01,.004],'#d8cba1',.001)}
function codePanel(b:Sculpt,at:V3,size:number){
 b.box(at,[size,size*.86,.12],c.woodDark,.06);b.box([at[0],at[1],at[2]+.066],[size*.88,size*.75,.04],'#27330f',.04)
 const texture=canvasTexture(256,220,ctx=>{ctx.fillStyle='#26320f';ctx.fillRect(0,0,256,220);ctx.shadowColor='#adff21';ctx.shadowBlur=5;ctx.fillStyle='#c5ff4b';ctx.font='bold 100px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('</>',128,111)})
 texturedPlane(b,[at[0],at[1],at[2]+.09],[size*.86,size*.73],texture,.7)
}
export function cabin(root:Sculpt){
 let b=root.part("house")
 const frontZ=-.55,left=-1.87,right=.72,eave=3.05,ridge=3.65,peak=-.93,back=-2.04
 // Gabled facade and real side wall, no low roof obscuring the monitors.
 b.shape([[left,.2],[right,.2],[right,eave],[peak,ridge],[left,eave]],.15,c.wall,[0,0,frontZ], [0,0,0],.035)
 b.box([right,1.75,(back+frontZ)/2],[.17,3.1,1.6],c.sideWall,.025)
 b.box([left,1.73,frontZ+.1],[.15,3.05,.2],c.woodDark,.025)
 b.box([right,1.73,frontZ+.1],[.16,3.05,.22],c.woodDark,.025)
 // Inset window on right exterior; mullions and dark recess.
 b.box([right+.095,2.16,-1.25],[.04,.78,.68],c.woodDark,.02)
 b.box([right+.12,2.16,-1.25],[.025,.64,.54],'#172925',.01)
 b.box([right+.14,2.16,-1.25],[.028,.64,.035],c.stoneLight,.01)
 b.box([right+.14,2.16,-1.25],[.028,.035,.56],c.stoneLight,.01)
 b.finish();b=root.part("roof")
 // Roof custom slopes tiled row-by-row; ridge runs in Z.
 const roofLeft=left-.2,roofRight=right+.22,roofFront=frontZ+.28,roofBack=back-.15
 for(const [a,end] of [[roofLeft,peak],[peak,roofRight]]){
   const y1=a===peak?ridge:eave,y2=end===peak?ridge:eave
   const slope=Math.atan2(y2-y1,end-a),len=Math.hypot(end-a,y2-y1),cx=(a+end)/2,cy=(y1+y2)/2
   b.box([cx,cy,(roofFront+roofBack)/2],[len+.13,.16,roofFront-roofBack],c.roofDark,.025,[0,0,slope])
   const sub=new Sculpt(),random=rng(a<peak?12:34)
   for(let row=0;row<5;row++)for(let col=0;col<5;col++){
     const u=-len/2+(row+.5)*len/5;const v=roofBack+(col+.5)*(roofFront-roofBack)/5
     sub.box([u,.11+row*.004,v],[len/5+.045,.055,(roofFront-roofBack)/5-.018], [c.roof,c.roofLight,c.roof][Math.floor(random()*3)],.026,[0,0,0])
   }
   const group=sub.finish();group.position.set(cx,cy,0);group.rotation.z=slope;b.group.add(group)
 }
 b.box([peak,ridge+.08,(roofFront+roofBack)/2],[.14,.16,roofFront-roofBack+.05],c.roof,.04)
 b.finish();b=root.part("roof-garden")
 // Dense turf on the visible roof slope; short top blades and long draping edge blades.
 const patch=new Sculpt();patch.slab([0,0,0],.86,.72,.08,c.turf,8,.055)
 for(let i=0;i<15;i++)grass(patch,[(i%5-.2)*.16-.29,.08,(Math.floor(i/5)-1)*.22],18,.18,i+71,.25)
 for(let i=0;i<12;i++){const xx=-.4+i*.07;patch.tube([[xx,.02,.35],[xx+.015,-.11,.39],[xx+.045,-.28-(i%3)*.04,.37]],.032,c.grass,7,7)}
 const pg=patch.finish();pg.position.set(-.01,3.49,-1.28);pg.rotation.z=-.33;b.group.add(pg)
 codePanel(b,[-.68,2.98,frontZ+.18],.85)
 b.finish();b=root.part("lamp")
 // Warm lamp, curved neck and modeled conical metal shade.
 b.tube([[.47,2.72,frontZ+.17],[.55,2.85,frontZ+.3],[.62,2.8,frontZ+.43],[.65,2.7,frontZ+.48]],.035,c.steel,15,8)
 b.lathe([.65,2.51,frontZ+.48],[[.17,0],[.16,.035],[.1,.2],[.07,.22]],c.steel,20)
 b.orb([.65,2.52,frontZ+.48],[.11,.065,.11],'#ffe9ad',20)
 b.add(new T.SphereGeometry(.08,16,12),mat('#ffe4a0',.4,0,3),[.65,2.53,frontZ+.48])
 b.finish();b=root.part("desk")
 // Desk with warm thick edge and two dark front legs.
 b.box([-.52,1.22,.13],[2.7,.15,.99],c.woodEdge,.055);b.box([-.52,1.3,.13],[2.76,.075,1.02],c.wood,.045)
 for(const x of [-1.65,.6]){b.box([x,.74,.46],[.09,.98,.1],c.black,.025);b.box([x,.75,-.22],[.09,.96,.1],c.black,.025)}
 b.finish();b=root.part("workstation")
 monitor(b,[-1.04,1.34,-.13],true,.09);monitor(b,[-.06,1.34,-.08],false,-.12)
 b.box([-.55,1.355,.47],[1.1,.018,.39],c.black,.035)
 const keyboard=canvasTexture(420,130,ctx=>{ctx.fillStyle='#43545b';ctx.fillRect(0,0,420,130);for(let y=0;y<5;y++)for(let x=0;x<14;x++){ctx.fillStyle=(x+y)%5?'#9dacb0':'#c9d3d0';ctx.fillRect(8+x*29,7+y*24,23,18)}})
 b.box([-.66,1.38,.49],[.74,.045,.25],c.stoneLight,.02);texturedPlane(b,[-.66,1.407,.49],[.71,.23],keyboard,.06,[-Math.PI/2,0,0])
 b.orb([.03,1.4,.5],[.065,.04,.1],'#526169',20)
 // Blue cup and small desk plant.
 const cup=root.part('drop-cup')
 cup.lathe([0,0,0],[[.09,0],[.12,.025],[.1,.06],[.07,.17],[.07,.19],[.05,.19],[.05,.16]],'#3f6982',20)
 cup.tube([[.06,.09,0],[.12,.1,0],[.12,.16,0],[.06,.17,0]],.013,'#527d9a',12,6)
 cup.finish().position.set(.38,1.34,.36)
 const deskPlant=root.part('drop-plant-desk');plant(deskPlant,[0,0,0],.32,c.woodDark);deskPlant.finish().position.set(.66,1.34,-.02)
 b.box([.61,.38,-.12],[.42,.37,.4],c.wood,.03);grass(b,[.61,.57,-.12],24,.28,83,.23)
 b.finish();b=root.part("bookshelves")
 // Bookshelf stands to the left; broad face visible behind avatar.
 const sx=-2.11,sz=.05
 for(const yy of [.48,1.35,2.2])b.box([sx,yy,sz],[1.14,.1,.43],c.woodEdge,.025)
 for(const xx of [sx-.52,sx+.52])b.box([xx,1.36,sz-.12],[.075,1.86,.34],c.woodDark,.025)
 b.box([sx,1.35,sz-.2],[1.08,1.78,.045],c.woodDark,.01)
 const bookColors=['#8eac35','#c9a858','#3b7779','#ae7447','#a5b479']
 // Independent local pivots preserve the authored book geometry and final tilt.
 let bookIndex=0
 const shelfBook=(at:V3,height:number,color:string,tilt:number)=>{
   const item=root.part(`shelf-book-${bookIndex++}`)
   book(item,[0,height/2,0],height,color,tilt)
   item.finish().position.set(at[0],at[1]-height/2,at[2])
 }
 for(let row=0;row<2;row++)for(let i=0;i<8;i++){const h=.3+(i%3)*.07;shelfBook([sx-.43+i*.12,.54+row*.87+h/2,sz+.07],h,bookColors[(i+row)%5],i===7?-.12:0)}
 for(let i=0;i<4;i++)shelfBook([sx+.03+i*.105,2.47+(i%2)*.035,sz],.43+(i%2)*.07,bookColors[i],i===0?.13:0)
 b.lathe([sx-.37,2.25,sz],[[.07,0],[.08,.18],[.055,.21],[.055,.25]],'#668995',14)
 b.lathe([sx-.2,2.25,sz+.08],[[.065,0],[.07,.1],[.06,.12]],'#b8c4a9',14)
 codePanel(b,[sx,1.02,sz+.27],.46)
 b.finish();b=root.part("facade-leaves")
 // Tiny leaves growing at facade edges, as visible in the reference.
 for(const [xx,yy,zz] of [[.8,1.85,-.35],[.83,2.2,-.4],[-1.92,2.7,-.43]] as V3[])b.orb([xx,yy,zz],[.055,.075,.025],c.turfBright,12)
 b.finish()
}
