import * as T from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Sculpt, blade, mat, rng } from './modeling'
import type { V3 } from './modeling'
import { colors as c } from './config'
export function grass(b:Sculpt,at:V3,count=12,spread=.14,seed=5,height=.23){const random=rng(seed);for(let i=0;i<count;i++){const x=(random()-.5)*spread,z=(random()-.5)*spread;blade(b,[at[0]+x,at[1],at[2]+z],height*(.45+random()*.8),.015+random()*.014,random()*Math.PI*2,(random()-.5)*.18,[c.grass,c.turf,c.grassTip][i%3])}}
export function rock(b:Sculpt,at:V3,size:V3,seed=1,color=c.stone){
  const random=rng(seed),n=7,verts:number[]=[],indices:number[]=[]
  const rings=[[0,.8],[.12,1],[.78,.93],[1,.68]]
  const outline=Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [Math.cos(a)*(.8+random()*.2),Math.sin(a)*(.8+random()*.2)]})
  for(const [y,r] of rings)for(const [x,z] of outline)verts.push(x*size[0]/2*r,y*size[1],z*size[2]/2*r)
  for(let ring=0;ring<3;ring++)for(let j=0;j<n;j++){const a=ring*n+j,nn=ring*n+(j+1)%n;indices.push(a,a+n,nn,nn,a+n,nn+n)}
  for(let j=1;j<n-1;j++)indices.push(3*n,3*n+j+1,3*n+j)
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();b.add(g,mat(color),at)

}
export function plant(b:Sculpt,at:V3,size=.4,potColor=c.woodDark){
  b.lathe(at,[[.08,0],[.13,.03],[.17,.25],[.18,.27],[.14,.27],[.13,.22]],potColor)
  const random=rng(103)
  for(let i=0;i<10;i++){const angle=i/10*Math.PI*2,spread=.1+random()*.15;const p:V3=[at[0],at[1]+.23,at[2]];b.tube([p,[p[0]+Math.cos(angle)*spread,p[1]+size*.65,p[2]+Math.sin(angle)*spread],[p[0]+Math.cos(angle)*spread*.8,p[1]+size,p[2]+Math.sin(angle)*spread*.8]],.035,[c.leaf,c.leafLight,c.grass][i%3],8,6)}
}
export function tree(b:Sculpt){
  const at:V3=[1.6,.8,-1.4]
  const branches:V3[][]=[[[0,0,0],[.04,1.1,0],[.02,2.05,0],[.1,2.75,0]],[[0,1.2,0],[-.3,1.7,.03],[-.5,2.1,.06]],[[.02,1.6,0],[.38,2,.05],[.65,2.35,0]],[[0,1,0],[.35,1.3,.04],[.55,1.6,.1]]]
  branches.forEach((points,i)=>b.tube(points.map(p=>[p[0]+at[0],p[1]+at[1],p[2]+at[2]] as V3),i===0?.11:.065,c.woodDark,14,7))
  const crowns:[V3,V3,string][]=[[[.02,3,0],[.58,.43,.52],c.leafLight],[[-.38,2.7,.1],[.56,.4,.5],c.leaf],[[.43,2.65,0],[.55,.4,.5],c.leaf],[[0,2.65,.38],[.54,.4,.4],c.leafLight],[[-.65,2.4,.04],[.38,.31,.4],c.leafDark],[[.67,2.4,.04],[.37,.3,.35],c.leafLight],[[-.43,1.62,.12],[.28,.22,.25],c.leafLight],[[.65,1.35,.1],[.2,.17,.2],c.leaf]]
  crowns.forEach(([p,s,color],i)=>{const g=mergeVertices(new T.IcosahedronGeometry(1,2)),pos=g.getAttribute('position');for(let j=0;j<pos.count;j++){const x=pos.getX(j),y=pos.getY(j),z=pos.getZ(j);const f=1+.035*Math.sin(x*8+z*7+i)*Math.cos(y*6);pos.setXYZ(j,x*f,y*f,z*f)}g.computeVertexNormals();b.add(g,mat(color),[p[0]+at[0],p[1]+at[1],p[2]+at[2]],[0,.3*i,0],[s[0]*.86,s[1],s[2]*.86])})
}
export function cloud(b:Sculpt){
  const shape=new T.Shape();shape.moveTo(-.7,-.2);shape.bezierCurveTo(-1.08,-.15,-.96,.35,-.65,.35);shape.bezierCurveTo(-.65,.94,.17,1.02,.27,.49);shape.bezierCurveTo(.52,.57,.65,.4,.63,.21);shape.bezierCurveTo(.99,.3,1.02,-.13,.71,-.2);shape.lineTo(-.7,-.2)
  b.add(new T.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:true,bevelSize:.09,bevelThickness:.09,bevelSegments:4,steps:1,curveSegments:16}),mat(c.cloud),[-3,2.83,-.8],[0,.12,0],[.72,.72,.72])
}
export function flowers(b:Sculpt,at:V3){
  b.lathe(at,[[.045,0],[.055,.12],[.045,.16]],'#a89a72',8)
  b.orb([at[0],at[1]+.17,at[2]],[.12,.07,.1],'#a68ec6',12)
  b.orb([at[0]+.02,at[1]+.21,at[2]],[.05,.025,.045],'#e2a3ac',10)
}
