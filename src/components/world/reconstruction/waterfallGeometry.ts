import * as T from 'three'

export const waterfallConfig = {
  centerX: -.76, width: .48, surfaceY: -.098, impactY: -1.46,
  lipZ: 2.97, gravity: 3.4, speed: .65, thickness: .022,
  turbulence: .012, opacity: .66, foam: .22, rippleSpeed: 2.1,
  desktop: { rows: 96, columns: 18, particles: 48 },
  mobile: { rows: 48, columns: 10, particles: 24 },
}

// UV.y is travel time, not distance: equal texture intervals accelerate under gravity.
export function waterfallGeometry(lowQuality = false, filament = false) {
  const c = waterfallConfig, q = lowQuality ? c.mobile : c.desktop
  const pos:number[]=[], uv:number[]=[], indices:number[]=[]
  const entrance=.4, duration=Math.sqrt(2*(c.surfaceY-c.impactY)/c.gravity)
  for(let i=0;i<=q.rows;i++) {
    const age=filament?.58+i/q.rows*(entrance+duration-.58):i/q.rows*(entrance+duration), falling=Math.max(0,age-entrance)
    const y=c.surfaceY-.5*c.gravity*falling*falling
    const z=age<entrance?c.lipZ-.24+.24*age/entrance:c.lipZ+.24*(1-Math.exp(-falling*3))
    const landing=Math.max(0,(falling/duration-.83)/.17)
    const width=filament?.027:c.width*(1-.34*Math.sin(Math.min(falling/duration,1)*Math.PI*.74)+.19*landing*landing)
    // Closed, flattened cross section gives the sheet real edge thickness.
    for(let j=0;j<=q.columns;j++) {
      const a=j/q.columns*Math.PI*2, x=Math.cos(a)*.5
      const split=filament?-.22-.014*Math.sin(falling*9):0
      // Cross-section follows the path normal, including the horizontal inlet.
      const dy=-c.gravity*falling, dz=age<entrance?.6:.72*Math.exp(-falling*3)
      const length=Math.hypot(dy,dz), ramp=Math.min(1,age/entrance)
      const thickness=(filament?.009:c.thickness*(1+.35*Math.sin(falling*8)))*ramp
      pos.push(c.centerX+split+.025*Math.sin(falling*5)+x*width,y+Math.sin(a)*thickness*dz/length,z-Math.sin(a)*thickness*dy/length)
      uv.push(x+.5,age)
      if(i<q.rows&&j<q.columns){const k=i*(q.columns+1)+j;indices.push(k,k+1,k+q.columns+1,k+1,k+q.columns+2,k+q.columns+1)}
    }
  }
  const g=new T.BufferGeometry()
  g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals()
  return g
}
