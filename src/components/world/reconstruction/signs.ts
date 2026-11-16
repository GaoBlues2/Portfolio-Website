import * as T from 'three'
import { Sculpt, mat, canvasTexture } from './modeling'
import { colors as c } from './config'
export const signDestinations=[{label:'Projects',id:'products'},{label:'Case Studies',id:'engineering'},{label:'Experience',id:'cloud'},{label:'About Me',id:'home'}] as const
export function signs(){
 const group=new T.Group(),posts=new Sculpt()
 for(const x of [1.54,2.72])posts.box([x,1.25,.26],[.11,2.6,.12],c.woodDark,.035,[0,0,-.015])
 group.add(posts.finish())
 signDestinations.forEach((s,i)=>{
   const b=new Sculpt(),w=1.72,h=.45,outline:[number,number][]=[[-w/2,-h/2],[w/2-.22,-h/2],[w/2,0],[w/2-.22,h/2],[-w/2,h/2]]
   b.shape(outline,.11,c.lime,[0,0,0],[0,0,0],.045,mat(c.lime,.5,0,.3))
   b.shape(outline.map(([x,y])=>[x*.91,y*.78]),.025,'#2b3716',[0,0,.115],[0,0,0],.025)
   const texture=canvasTexture(768,180,ctx=>{ctx.clearRect(0,0,768,180);ctx.fillStyle='#eff4d5';ctx.font=`600 ${i===0?112:94}px Arial`;ctx.textBaseline='middle';ctx.fillText(s.label,26,94);ctx.font='84px Arial';ctx.fillText('→',635,95)})
   const tm=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});b.add(new T.PlaneGeometry(1.43,.34),tm,[-.035,0,.195])
   const board=b.finish();board.position.set(2.43,2.62-i*.57,.41+i*.012);board.rotation.z=-.035+i*.014;board.userData.region=s.id;board.name=`sign-${s.id}`;group.add(board)
 })
 return group
}
