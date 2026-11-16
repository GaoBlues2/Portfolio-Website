import { Sculpt } from './modeling'
import type { V3 } from './modeling'
import { colors as c } from './config'
import { grass, rock } from './nature'
import { contactIslands } from './contactIslands'
export type MiniKind='projects'|'cases'|'experience'|'about'|'contact'
export function miniature(kind:MiniKind){
 const b=new Sculpt()
 if(kind==='contact'){
   contactIslands(b)
   const tower:V3=[-3.75,.14,.15]
   b.lathe(tower,[[.46,0],[.5,.12],[.34,.22],[.22,.65],[.21,.81],[.3,.85]],c.stone,7)
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2;b.box([tower[0]+Math.sin(a)*.29,.51,tower[2]+Math.cos(a)*.29],[.09,.28,.06],c.stoneDark,.025,[0,a,0])}
   b.lathe([tower[0],.99,tower[2]],[[.22,0],[.27,.04],[.21,.08]],'#d7aa4a',20)
   b.tube([[tower[0],1.05,tower[2]],[tower[0],2.08,tower[2]]],.023,'#d9e977',10,8)
 }else{
   b.slab([0,-.2,0],1.65,1.4,.25,c.soil,8,.08);b.slab([0,.05,0],1.69,1.44,.09,c.turf,9,.06)
   grass(b,[.62,.15,-.38],11,.18,9,.15);rock(b,[-.57,.14,.38],[.1,.06,.09],4,c.path)
   if(kind==='cases'){
     b.box([0,.23,0],[.95,.18,.85],c.stoneDark,.04)
     b.box([0,.38,0],[.8,.12,.72],c.stone,.03)
     for(let i=0;i<3;i++){b.box([0,.56+i*.2,0],[.68,.13,.6],i===2?'#a8e841':c.turfBright,.045);b.box([0,.5+i*.2,0],[.5,.07,.44],c.turfDark,.02)}
   }
   if(kind==='experience'){
     b.box([0,.64,0],[.95,.82,.34],'#685b3e',.08)
     b.box([0,.81,.19],[.89,.42,.065],'#807453',.035)
     for(const x of [-.35,.35])b.box([x,.64,.2],[.065,.7,.028],'#c5aa70',.016)
     b.tube([[-.22,1.06,0],[-.22,1.26,0],[.19,1.26,0],[.22,1.06,0]],.038,c.wood,14,7)
     b.box([0,.62,.24],[.14,.17,.045],c.lime,.02)
   }
   if(kind==='about'){
     b.lathe([0,.15,0],[[.37,0],[.42,.05],[.38,.25],[.27,.46],[.16,.53]],c.turfBright,28)
     b.orb([0,.94,0],[.235,.28,.23],c.lime,32)
   }
 }
 return b.finish()
}
