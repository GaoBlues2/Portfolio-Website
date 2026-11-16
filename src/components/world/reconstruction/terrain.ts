import * as T from 'three'
import { Sculpt, rng } from './modeling'
import type { V3 } from './modeling'
import { colors as c } from './config'
import { grass, rock, plant, flowers } from './nature'
import { lowerPool } from './lowerPool'
import { pondBanks, pondSurface } from './pond'
import { waterfallGeometry } from './waterfallGeometry'
import { waterfallMaterial, waterfallImpact } from './waterEffects'
// Author-defined footprint. Missing cells carve the fall and irregular perimeter.
const cells:[number,number,number][]=[
[-2,-1,0],[-1,-1,.03],[0,-1,.03],[1,-1,.02],[2,-1,-.04],
[-3,0,-.12],[-2,0,.02],[-1,0,.05],[0,0,.05],[1,0,.04],[2,0,-.04],[3,0,-.1],
[-3,1,-.16],[-2,1,.02],[-1,1,.02],[0,1,.03],[1,1,.04],[2,1,.02],[3,1,-.08],
[-2,2,-.45],[0,2,-.1],[1,2,-.04],[2,2,-.16],[3,2,-.25],
[2,3,-.43],[3,3,-.38],
]
export function terrain(root:Sculpt){
 let b=root.part("foundation")
  // Continuous load-bearing foundation under the entire cabin and chair area.
  const footprint=cells.map(cell=>[...cell] as [number,number,number])
  for(let z=-3;z<=2;z++)for(let x=-3;x<=1;x++){
    const existing=footprint.find(cell=>cell[0]===x&&cell[1]===z)
    if(existing)existing[2]=.02
    else footprint.push([x,z,.02])
  }

  footprint.forEach(([x,z,y],i)=>{
    const xx=x*.73,zz=z*.73,random=rng(i+41),height=.72+random()*.39
    b.slab([xx,y-height,zz],.7,.7,height*.58,i%4===0?c.stoneLight:c.stone,i,.045)
    b.slab([xx+.015,y-height*.42,zz],.7,.7,height*.42,i%3===0?c.stone:c.soilLight,i+3,.05)
    const paved=x<=1&&z<=2&&x>=-3
    b.slab([xx,y,zz],.71,.71,.12,paved?c.path:c.turf,i,.055)
    if(!paved&&i%3===0)grass(b,[xx+.24,y+.16,zz-.2],9,.16,i+20,.19)
  })
  b.finish();b=root.part("stone-terrace")
  // Cabin stone terrace fills the middle without a rectangular floating pad.
  for(let x=0;x<7;x++)for(let z=0;z<10;z++)b.slab([-2.2+x*.48,.16,-2.12+z*.43],.455,.41,.085,(x+z)%3?c.path:c.pathLight,x*4+z,.018)
  // Broad winding walkway, each section has its own wedge silhouette.
  const path:V3[]=[[.7,.17,.25],[.74,.17,.65],[.82,.14,1],[1.05,.1,1.32],[1.43,.02,1.52],[1.72,-.04,1.79],[1.92,-.15,2.11],[2.04,-.26,2.38]]
  path.forEach((p,i)=>{b.slab(p,.64,.49,.055,i%2?c.path:c.pathLight,42+i,.025)})
  b.slab([2.16,-.31,2.54],.95,.49,.16,c.stoneLight,8,.025)
  b.slab([2.16,-.16,2.55],.92,.44,.07,c.pathLight,9,.025)
  b.finish();b=root.part("rocks-decoration")
  pondBanks(b)
  // Left pedestal, lower grass ledge, isolated boulders, stones in pool.
  b.slab([-2.15,.08,.94],.75,.66,.38,c.stone,3,.05)
  b.slab([-2.15,.47,.94],.72,.63,.1,c.path,4,.03)
  const pedestalPlant=root.part("drop-plant-pedestal");plant(pedestalPlant,[0,0,0],.38);pedestalPlant.finish().position.set(-2.3,.57,.92)
  b.box([-2.03,.6,1.05],[.27,.055,.19],'#aa6977',.02,[0,.2,0]);b.box([-2.02,.66,1.06],[.28,.05,.16],'#849ba9',.01,[0,-.16,0])
  const terracePlant=root.part("drop-plant-terrace");plant(terracePlant,[0,0,0],.28,c.turfDark);terracePlant.finish().position.set(-1.85,.25,1.58)
  b.box([-1.65,.28,1.64],[.19,.1,.14],'#a66a87',.01)
  flowers(b,[-.35,.25,1.78]);flowers(b,[2.4,-.24,2.04])
  rock(b,[-2.15,-1.25,2.02],[.68,.48,.58],6,c.stoneLight)
  rock(b,[.72,-1.65,3.2],[.69,.42,.6],4,c.stoneLight)
  rock(b,[-1.68,-1.34,2.48],[.18,.11,.16],8)
  rock(b,[-.03,-1.3,2.83],[.14,.08,.12],12,c.soil)
  rock(b,[.34,.08,1.68],[.18,.12,.16],34,c.stoneLight)
  rock(b,[1.52,-.3,2.57],[.16,.11,.15],17,c.path)
  grass(b,[.55,.25,1.66],16,.15,90,.24)
  b.finish()
}
export function water(){
  const b=new Sculpt()
  const lowQuality=typeof window!=='undefined' && window.matchMedia('(max-width: 700px)').matches
  const geometry=waterfallGeometry(lowQuality)
  const material=waterfallMaterial()
  // Water surface and its outlet join the waterfall with no dry-floor overlap.
  pondSurface(b,material.uniforms.time)
  const sheet=new T.Mesh(geometry,material);sheet.name='water-sheet';b.group.add(sheet)
  const filament=new T.Mesh(waterfallGeometry(lowQuality,true),material);filament.name='water-edge-filament';b.group.add(filament)
  const impact=waterfallImpact(material.uniforms.time,lowQuality);b.group.add(impact.group)
  b.group.add(lowerPool())
  return {group:b.finish(),material,update:impact.update}
}
