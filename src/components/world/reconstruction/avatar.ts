import * as T from 'three'
import { Sculpt, mat } from './modeling'
import type { V3 } from './modeling'
import { colors as c } from './config'
// Elliptical cross-sections form tailored body/clothing, rather than box limbs.
function tailored(b:Sculpt,sections:[number,number,number,number,number][],color:string){
 const positions:number[]=[],indices:number[]=[],n=20
 sections.forEach(([x,y,z,rx,rz])=>{for(let j=0;j<n;j++){const a=j/n*Math.PI*2;positions.push(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz)}})
 for(let i=0;i<sections.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,nn=i*n+(j+1)%n;indices.push(a,a+n,nn,nn,a+n,nn+n)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();b.add(g,mat(color,.95))
}
export function avatar(root:Sculpt){
 let b=root.part("office-chair")
 // Workstation-space coordinates: desk front is z=.64, top y=1.3375.
 // Keep the torso behind the edge; forearms pass ABOVE the top to the keys.
 // Do not rotate this model about the scene origin: that pushes its torso into the desk.
 const x=-.95,z=1.08
 b.lathe([x,.28,z],[[.05,0],[.06,.3],[.045,.52]],c.steel,16)
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,ex=x+Math.sin(a)*.39,ez=z+Math.cos(a)*.39;b.tube([[x,.35,z],[x+Math.sin(a)*.22,.31,z+Math.cos(a)*.22],[ex,.27,ez]],.035,c.black,8,7);b.orb([ex,.235,ez],[.065,.055,.045],c.rubber,12)}
 b.box([x,.79,z],[.66,.14,.56],c.black,.09)
 b.box([x,.86,z-.015],[.55,.085,.47],c.turfBright,.07)
 // Curved ergonomic chair back, narrow waist and broad shoulder wings.
 const back:[number,number][]=[[-.27,0],[-.34,.18],[-.36,.62],[-.27,.8],[.27,.8],[.36,.62],[.31,.17],[.24,0]]
 b.shape(back,.11,c.black,[x, .84,z+.25],[.1,0,0],.07)
 b.shape(back.map(([xx,y])=>[xx*.76,y*.88]),.035,c.lime,[x,.91,z+.37],[.1,0,0],.045)
 for(const s of [-1,1]){b.tube([[x+s*.31,.78,z+.07],[x+s*.35,1.05,z+.08],[x+s*.35,1.13,z-.18]],.034,c.black,9,7);b.box([x+s*.35,1.14,z-.08],[.11,.07,.35],c.black,.04)}
 b.finish();b=root.part("seated-person")
 // Trunk silhouette tapers at waist and shoulders; hoodie bulges above chair.
 tailored(b,[[x,.86,z,.22,.17],[x,1.04,z-.04,.25,.2],[x,1.36,z-.08,.28,.21],[x,1.53,z-.08,.2,.17],[x,1.59,z-.09,.12,.11]],c.hoodie)
 b.orb([x,1.47,z+.075],[.235,.16,.105],c.hoodieLight,24)
 b.tube([[x-.17,1.46,z+.16],[x,1.39,z+.21],[x+.17,1.46,z+.16]],.018,'#30395f',16,6)
 // Sleeves bend toward the keyboard. Seams are subtle curved ridges.
 for(const s of [-1,1]){
   const shoulder:V3=[x+s*.23,1.43,z-.09],elbow:V3=[x+s*.34,1.45,z-.22],wrist:V3=[x+.15+s*.2,1.47,.59]
   const arm=b.part(`typing-arm-${s}`)
   arm.tube([shoulder,elbow,wrist],.105,c.hoodie,16,12)
   arm.tube([[shoulder[0]+s*.04,shoulder[1],shoulder[2]],[elbow[0]+s*.04,elbow[1],elbow[2]],[wrist[0],wrist[1]+.055,wrist[2]]],.011,c.hoodieLight,16,5)
   arm.orb([wrist[0],1.465,wrist[2]-.07],[.075,.05,.1],c.skin,18)
   arm.finish()
   // Visible thighs, bent knees and tapered trouser legs.
   b.tube([[x+s*.15,.9,z-.05],[x+s*.2,.83,z-.37],[x+s*.21,.66,z-.46],[x+s*.23,.4,z-.39]],.105,c.pants,20,12)
   b.tube([[x+s*.23,.45,z-.38],[x+s*.23,.34,z-.39]],.09,c.pants,7,12)
   const shoe:V3=[x+s*.23,.28,z-.48]
   b.shape([[-.105,-.18],[-.12,.06],[-.09,.17],[.07,.2],[.12,.11],[.115,-.17]],.055,c.sole,[shoe[0],shoe[1]-.045,shoe[2]],[-Math.PI/2,0,0],.035)
   b.orb([shoe[0],shoe[1]+.045,shoe[2]-.025],[.115,.085,.21],c.shoe,20)
   for(let j=0;j<3;j++)b.tube([[shoe[0]-.065,shoe[1]+.11,shoe[2]+j*.035],[shoe[0]+.065,shoe[1]+.11,shoe[2]+j*.035]],.006,c.sole,4,4)
 }
 // Head has a cheek/jaw taper, ears, nose, fitted dark hair and individual swept locks.
 b.lathe([x,1.52,z-.1],[[.09,0],[.12,.11],[.09,.19]],c.skin,18)
 b.orb([x,1.8,z-.12],[.235,.28,.225],c.skin,32)
 b.orb([x,1.72,z-.27],[.18,.17,.11],c.skin,24)
 b.orb([x,1.81,z-.34],[.055,.075,.07],c.skin,16)
 // Backwards baseball cap: smooth sewn crown, rear-facing curved bill (+Z).
 const cap=new T.SphereGeometry(1,40,24,0,Math.PI*2,0,Math.PI*.53)
 b.add(cap,mat('#263b50',.82),[x,1.87,z-.1],[0,0,0],[.274,.29,.266])
 b.tube(Array.from({length:41},(_,i)=>{const a=i/40*Math.PI*2;return [x+Math.cos(a)*.272,1.845,z-.1+Math.sin(a)*.265] as V3}),.016,'#192b3e',40,8)
 const bill=new T.Shape();bill.moveTo(-.22,0);bill.bezierCurveTo(-.31,.12,-.29,.35,-.15,.39);bill.quadraticCurveTo(0,.44,.17,.38);bill.bezierCurveTo(.3,.31,.29,.12,.22,0);bill.closePath()
 b.add(new T.ExtrudeGeometry(bill,{depth:.022,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:3,steps:1,curveSegments:20}),mat('#263b50',.8),[x,1.85,z+.07],[Math.PI/2,0,0])
 b.orb([x,2.162,z-.1],[.028,.018,.028],'#344e65',16)
 // Subtle stitched panel seam, flush to the crown rather than raised hair tubes.
 b.tube([[x,1.88,z+.165],[x,2.07,z+.08],[x,2.165,z-.1],[x,2.07,z-.28]],.004,'#50677a',24,5)
 // Headphones headband and visible cup ring.
 b.tube([[x-.26,1.82,z-.09],[x-.25,2.05,z-.08],[x,2.16,z-.08],[x+.26,2.04,z-.08],[x+.27,1.82,z-.08]],.032,'#131a22',24,8)
 for(const s of [-1,1]){b.orb([x+s*.245,1.82,z-.09],[.063,.105,.095],c.skin,20);b.orb([x+s*.283,1.83,z-.07],[.055,.135,.11],c.black,24);b.orb([x+s*.319,1.83,z-.07],[.018,.095,.075],'#334754',20)}
 b.finish()
 // Rock around the chair base rather than the origin of the entire island.
 const pivot=new T.Vector3(x,.25,z)
 root.group.position.copy(pivot)
 for(const child of root.group.children)child.position.sub(pivot)

}
