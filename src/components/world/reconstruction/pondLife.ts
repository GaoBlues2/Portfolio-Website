import * as T from 'three'
import { Sculpt, mat } from './modeling'

function leaf(b:Sculpt,x:number,z:number,r:number,angle:number){
  // A radial slit and scalloped rim make the floating leaf readable from above.
  const shape=new T.Shape();shape.moveTo(0,0)
  for(let i=0;i<=48;i++){
    const a=.14+i/48*(Math.PI*2-.28),radius=r*(1+.035*Math.sin(a*7))
    shape.lineTo(Math.cos(a)*radius,Math.sin(a)*radius)
  }
  shape.closePath()
  b.add(new T.ShapeGeometry(shape,32),mat('#4d963f',.7),[x,-.078,z],[-Math.PI/2,0,angle])
  for(let i=0;i<7;i++){
    const a=.4+i*.83+angle
    b.tube([[x,-.074,z],[x+Math.cos(a)*r*.46,-.073,z-Math.sin(a)*r*.46],[x+Math.cos(a)*r*.87,-.074,z-Math.sin(a)*r*.87]],.0025,'#80ac56',6,4)
  }
}
function lotus(b:Sculpt,x:number,z:number,size:number){
  b.tube([[x,-.1,z],[x,.005,z]],.01,'#618447',6,6)
  // Pointed, cupped petals in two staggered whorls.
  for(let ring=0;ring<2;ring++)for(let i=0;i<8;i++){
    const shape=new T.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-.44,.25,-.32,.76,0,1);shape.bezierCurveTo(.32,.76,.44,.25,0,0)
    const g=new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2,steps:1,curveSegments:10})
    g.scale(size,size,size)
    g.rotateX(ring===0?1.02:.55);g.rotateY(i*Math.PI/4+ring*.39)
    b.add(g,mat(ring?'#f4a6c5':'#dc7ca9',.65),[x,.005+ring*.015,z])
  }
  b.orb([x,.045,z],[.025,.018,.025],'#edc753',16)
}
function fish(index:number){
  const b=new Sculpt(),color=index===1?'#ffd36a':'#f9a033'
  b.orb([0,0,0],[.09,.029,.035],color,20)
  b.orb([.035,.012,0],[.045,.015,.026],'#ffd685',16)
  for(const side of [-1,1]){
    b.orb([.059,.013,side*.024],[.009,.008,.006],'#1d2929',12)
    b.shape([[0,0],[-.047,.036],[-.035,-.006]],.002,'#f5bd55',[-.005,-.007,side*.021],[-Math.PI/2,0,side*.5],.002)
  }
  const body=b.finish(),tailBuilder=new Sculpt()
  tailBuilder.shape([[0,0],[-.065,.052],[-.053,0],[-.065,-.052]],.003,'#ec942d',[0,0,0],[-Math.PI/2,0,0],.004)
  const tail=tailBuilder.finish();tail.position.x=-.07;body.add(tail)
  body.name=`goldfish-${index+1}`
  return {body,tail}
}
export function pondLife(){
  const b=new Sculpt()
  leaf(b,-1.22,2.29,.16,.5);leaf(b,-1.4,2.45,.11,2)
  leaf(b,-.25,2.55,.15,-.6);leaf(b,-.42,2.37,.1,1.7)
  leaf(b,-1.05,2.8,.11,.2)
  lotus(b,-1.22,2.29,.13);lotus(b,-.25,2.55,.11)
  const group=b.finish(),fishes=Array.from({length:3},(_,i)=>fish(i))
  fishes.forEach(f=>group.add(f.body))
  // Thin petals and leaf veins should not self-shadow into noisy dark patches.
  group.traverse(object=>{if(object instanceof T.Mesh)object.receiveShadow=false})
  const update=(time:number)=>fishes.forEach((f,i)=>{
    const t=time*(.26+i*.035)+i*2.1,rx=.29-i*.025,rz=.14+i*.02
    f.body.position.set(-.82+Math.cos(t)*rx,-.158,2.57+Math.sin(t)*rz)
    f.body.rotation.y=Math.atan2(-Math.cos(t)*rz,-Math.sin(t)*rx)
    f.tail.rotation.y=Math.sin(time*5+i*2)*.3
  })
  update(0)
  return {group,update}
}
