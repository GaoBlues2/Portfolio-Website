import * as T from 'three'
import { Sculpt, rng } from './modeling'
import { pondWaterMaterial } from './waterEffects'
import { grass } from './nature'
import { colors as c } from './config'

// Shared curved outline for water and bed, ending at the unchanged spillway.
export function pondOutline() {
  const s = new T.Shape()
  s.moveTo(-1.11, -3.04)
  s.bezierCurveTo(-1.26,-3.05,-1.37,-2.94,-1.46,-2.87)
  s.bezierCurveTo(-1.76,-2.84,-1.82,-2.59,-1.65,-2.43)
  s.bezierCurveTo(-1.74,-2.15,-1.42,-2.04,-1.19,-2.13)
  s.bezierCurveTo(-.96,-2.02,-.75,-2.16,-.58,-2.12)
  s.bezierCurveTo(-.28,-2.02,.04,-2.18,-.04,-2.44)
  s.bezierCurveTo(.17,-2.63,.03,-2.86,-.17,-2.89)
  s.bezierCurveTo(-.26,-3.04,-.34,-3.06,-.41,-3.04)
  s.closePath()
  return s
}

function mushroom(b:Sculpt,x:number,y:number,z:number,size:number,color:string){
  b.tube([[x,y,z],[x+.015,y+size*.45,z],[x+.025,y+size*.7,z]],size*.12,'#d1bca0',8,7)
  b.lathe([x+.025,y+size*.58,z],[[0,.02],[size*.4,0],[size*.5,.06*size],[size*.42,.28*size],[size*.2,.45*size],[0,.49*size]],color,18)
  for(const [dx,dz] of [[-.15,.12],[.18,.05],[0,-.2]])b.orb([x+.025+dx*size,y+size*.98,z+dz*size],[size*.055,size*.018,size*.05],'#ddd0b5',10)
}

export function pondBanks(b:Sculpt){
  // The pond keeps its irregular rim, but its load-bearing mass now follows the
  // same stacked tile language as the rest of the island.
  // Keep the center open for the waterfall. Only the two side shoulders carry
  // the pond, so the block construction reads as a support, not a plinth.
  const foundation:[number,number,number][]=[
    [-1.5,2.37,0],[-.08,2.36,1],
    [-1.56,2.91,2],[-.02,2.88,3],
  ]
  foundation.forEach(([x,z,seed])=>{
    b.slab([x,-1.42,z],.67,.62,.46,seed%3===0?c.stoneLight:c.stone,seed,.045)
    b.slab([x+.012,-.96,z],.66,.61,.32,seed%2?c.soil:c.soilLight,seed+17,.045)
    b.slab([x,-.64,z],.68,.63,.29,c.stoneDark,seed+31,.05)
  })
  const bank:[number,number][]=[[-1.32,3.02],[-1.57,2.88],[-1.78,2.67],[-1.76,2.4],[-1.61,2.19],[-1.38,2.06],[-1.08,2.06],[-.82,2.08],[-.53,2.05],[-.23,2.11],[.02,2.29],[.14,2.54],[.05,2.8],[-.16,2.97]]
  const random=rng(907)
  bank.forEach(([x,z],i)=>{
    const dx=(random()-.5)*.07,dz=(random()-.5)*.07
    const width=.33+random()*.12,depth=.28+random()*.09
    // A two-step tiled rim follows the organic pond outline without returning
    // to the rounded boulder language used before the terrain conversion.
    b.slab([x+dx,-.39,z+dz],width+.06,depth+.05,.17,i%3?c.stone:c.stoneLight,170+i,.04)
    b.slab([x+dx,-.17,z+dz],width,depth,.15,i%2?c.stoneLight:c.stone,210+i,.04)
    if(i%3!==1)b.slab([x+dx,-.075,z+dz],width*.78,depth*.75,.055,i%2?c.turfDark:c.turf,250+i,.028)
    // Bright, raised moss clusters sit on the outward stone caps so they remain
    // readable beside the water plants instead of disappearing into the tile.
    if([0,3,6,10,12].includes(i)){
      const mossX=x+dx+(i%2?.11:-.1),mossZ=z+dz+(i<7?.09:-.08)
      b.orb([mossX,.012,mossZ],[width*.26,.035,depth*.23],c.turfBright,12)
      b.orb([mossX+(i%2?.06:-.055),.024,mossZ-.025],[width*.14,.025,depth*.15],c.grass,10)
    }
    if([1,3,4,7,10,12].includes(i))grass(b,[x,-.025,z],12,.16,170+i,.16+random()*.14)
  })
  mushroom(b,-1.73,.015,2.46,.24,'#ab839e')
  mushroom(b,-1.56,.015,2.39,.15,'#c597ac')
  mushroom(b,.12,.015,2.68,.25,'#b88c59')
  mushroom(b,.02,.015,2.82,.16,'#c7a071')
  mushroom(b,-.47,.015,2.04,.13,'#b49aba')
}

export function pondSurface(b:Sculpt,timeUniform:{value:number}){
  b.add(new T.ShapeGeometry(pondOutline(),32),pondWaterMaterial(timeUniform),[0,-.1,0],[-Math.PI/2,0,0])
}
