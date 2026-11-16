import * as T from 'three'
import { Sculpt } from './modeling'
import { lowerWaterMaterial } from './lowerPool'
import { grass } from './nature'

/** Inspection surface aligned to the user's two annotated screen-space edges. */
export function landscapeBackdrop(time:{value:number}){
  const group=new T.Group()
  // Back corner sits under the island; the two long edges extend left/right
  // along the marked diagonals. All four vertices share the impact water level.
  const geometry=new T.BufferGeometry()
  geometry.setAttribute('position',new T.Float32BufferAttribute([
    -2.664267,-1.51,-2.719351,
    -6.925628,-1.51,10.836006,
    6.169615,-1.51,13.210880,
    8.930976,-1.51,-.344477,
  ],3))
  geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals()
  const material=lowerWaterMaterial(time);material.side=T.DoubleSide
  const surface=new T.Mesh(geometry,material);surface.renderOrder=-1;group.add(surface)
  const stones=new Sculpt()
  function block(x:number,y:number,z:number,w:number,h:number,d:number,color:string,seed:number){
    stones.box([x,y+h/2,z],[w,h,d],color,.055,[0,(seed%3-1)*.035,0])
    stones.slab([x,y+h-.012,z],w*.89,d*.87,.035,'#426022',seed,.025)
    // Moss spills over a corner and leaves exposed stone on the sides.
    stones.orb([x-w*.28,y+h-.015,z+d*.32],[w*.19,.035,d*.15],'#354f1d',12)
  }
  // Bases rest at the common surface; staggered upper blocks overlap their supports.
  block(-3.32,-1.51,4.96,.78,.36,.65,'#3f4e49',811)
  block(-3.37,-1.16,4.93,.63,.29,.55,'#566154',812)
  block(-2.95,-1.51,4.10,.75,.35,.67,'#3d4d46',813)
  block(-2.92,-1.17,4.10,.66,.26,.59,'#53614e',814)
  block(-2.98,-.92,4.07,.55,.17,.49,'#5b6851',815)
  grass(stones,[-3.55,-.84,4.95],9,.13,816,.14)
  grass(stones,[-2.81,-.72,4.04],10,.13,817,.16)
  grass(stones,[-2.66,-1.14,4.33],7,.10,818,.12)
  function mushroom(x:number,y:number,z:number,size:number,color:string){
    stones.lathe([x,y,z],[[.018,0],[.015,size*.65],[.022,size*.72]],'#b8ae8a',8)
    stones.lathe([x,y+size*.58,z],[[0,0],[size*.43,0],[size*.48,size*.10],[size*.36,size*.32],[0,size*.43]],color,12)
  }
  mushroom(-3.19,-.84,5.03,.17,'#ae8b98')
  mushroom(-3.08,-.84,4.99,.11,'#bb9a77')
  mushroom(-3.10,-.72,4.12,.16,'#a68aa3')
  const outcrop=stones.finish()
  // Move the full footprints inside the diagonal ground edge, not just their centers.
  // Slight burial removes the rounded-box underside gap at the contact line.
  outcrop.position.set(.23,-.035,.40)
  group.add(outcrop)
  return group
}
