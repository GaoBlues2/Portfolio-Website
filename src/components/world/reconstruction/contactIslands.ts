import { Sculpt } from './modeling'
import type { V3 } from './modeling'
import { grass, rock, flowers } from './nature'
import { colors as c, contactRightOffset } from './config'

// The same beveled turf / soil / bedrock construction used by the hero.
// Explicit cells give each island an irregular outline and stepped front edge.
type Cell = [number, number, number]
function terrain(b:Sculpt, origin:V3, cells:Cell[], seed:number) {
 cells.forEach(([x,z,top],i)=>{
  const xx=origin[0]+x*.57, zz=origin[2]+z*.56, y=origin[1]+top
  const depth=.9+((i*7+seed)%5)*.085
  b.slab([xx,y-depth,zz],.55,.54,depth*.56,i%4===0?c.stoneLight:c.stone,seed+i,.035)
  b.slab([xx+.008,y-depth*.44,zz],.55,.54,depth*.44-.1,i%3===0?c.soil:c.soilLight,seed+i+3,.035)
  b.slab([xx,y-.1,zz],.57,.56,.075,i%4===0?c.turfBright:c.turf,seed+i,.035)
 })
}
// A restrained opaque soil inset grounds each prop without transparent shadow cards.
function bed(b:Sculpt,at:V3,w:number,d:number){
 const points:[number,number][]=[[-.5,-.22],[-.28,-.48],[.22,-.43],[.51,-.08],[.35,.36],[-.1,.47],[-.46,.23]]
 b.shape(points.map(([x,z])=>[x*w,z*d]),.012,'#6d8230',at,[-Math.PI/2,0,.13],.012)
}
export function contactIslands(b:Sculpt){
 const right=b.part('contact-right-island')
 right.group.position.set(...contactRightOffset)
 terrain(b,[-3.85,.16,.4],[
  [-1,-2,.08],[0,-2,.08],[1,-2,.02],
  [-2,-1,.08],[-1,-1,.08],[0,-1,.03],[1,-1,.02],[2,-1,-.04],
  [-2,0,.02],[-1,0,.02],[0,0,0],[1,0,-.02],[2,0,-.06],
  [-2,1,-.03],[-1,1,-.04],[0,1,-.04],[1,1,-.08],[2,1,-.12],
  [-1,2,-.1],[0,2,-.12],[1,2,-.2],
 ],31)
 terrain(right,[5.02,-.02,.64],[
  [0,-2,.25],[1,-2,.25],
  [-1,-1,.12],[0,-1,.17],[1,-1,.18],
  [-2,0,-.08],[-1,0,-.04],[0,0,-.04],[1,0,-.08],
  [-2,1,-.17],[-1,1,-.07],[0,1,-.13],[1,1,-.17],
  [-1,2,-.23],[0,2,-.25],
 ],57)
 // Small pale stepping stones echo the winding walkway on the hero.
 const path:V3[]=[[-3.95,.17,.65],[-3.74,.13,.95],[-3.45,.09,1.22],[-3.22,-.02,1.49]]
 path.forEach((at,i)=>b.slab(at,.43,.34,.065,i%2?c.path:c.pathLight,82+i,.025))
 right.slab([4.69,-.1,.98],.6,.46,.055,c.path,91,.025)
 right.slab([4.52,-.2,1.35],.43,.33,.06,c.pathLight,92,.025)
 // Left: a lower shoulder frames the flag, leaving its bright silhouette unobstructed.
 bed(b,[-4.55,.25,-.28],1.03,.76)
  // Stepped stone tiles replace the isolated monolith while retaining a tall
  // backdrop for the flag.
  b.slab([-4.65,.23,-.37],.76,.66,.3,c.stone,32,.05)
  b.slab([-4.7,.51,-.37],.62,.55,.28,c.stoneLight,33,.05)
  b.slab([-4.74,.78,-.37],.47,.44,.25,c.stone,34,.045)
 rock(b,[-4.92,.17,-.03],[.55,.49,.49],14,c.stoneLight)
 rock(b,[-4.32,.19,-.35],[.35,.3,.39],21,c.stoneLight)
 bed(b,[-3.75,.17,.15],1.18,.98)
 rock(b,[-3.76,.12,.15],[1.09,.21,.86],43,c.stoneLight)
 rock(b,[-2.87,.01,.72],[.47,.28,.38],22,c.stone)
 rock(b,[-2.66,-.025,.84],[.21,.13,.22],15,c.stoneLight)
 flowers(b,[-4.18,.15,.64]);flowers(b,[-4.36,.17,.57])
  // Right: a stepped tile stack matches the island and pond construction.
  bed(right,[5.3,.12,.03],1.12,.82)
  right.slab([5.39,.15,-.03],.78,.65,.31,c.stone,54,.05)
  right.slab([5.44,.44,-.03],.64,.54,.28,c.stoneLight,55,.05)
  right.slab([5.49,.7,-.03],.49,.43,.24,c.stone,56,.045)
 rock(right,[4.87,.02,.28],[.66,.52,.57],18,c.stoneLight)
 rock(right,[5.05,.03,.48],[.26,.2,.24],29,c.stone)
 rock(right,[4.28,-.26,1.21],[.33,.18,.3],33,c.stoneLight)
 flowers(right,[5.65,-.11,.74])
 const tufts:[V3,number,number][]=[
 [[-5.05,.15,.46],.23,.27],[[-4.84,.24,-.65],.25,.24],[[-4.22,.29,-.53],.18,.2],
 [[-3.15,.12,-.38],.25,.27],[[-2.83,.03,.96],.2,.19],[[-4.51,.1,1.22],.25,.26],
 [[-3.93,.11,1.32],.16,.17],[[5.65,.18,-.16],.28,.29],[[4.69,-.03,.5],.23,.23],
 [[5.48,-.22,1.14],.22,.22],[[4.18,-.25,.89],.24,.24]]
 tufts.forEach(([at,spread,height],i)=>grass(at[0]>0?right:b,at,9+i%5,spread,71+i,height))
 right.finish()
}
