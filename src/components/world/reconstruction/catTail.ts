import * as T from 'three'

export function softCatTail(){
  const curve=new T.CatmullRomCurve3([
    new T.Vector3(0,0,0),new T.Vector3(-.08,.006,.14),
    new T.Vector3(-.04,.008,.28),new T.Vector3(.1,.01,.35),
    new T.Vector3(.22,.016,.33),
  ])
  const segments=56,radial=12
  const geometry=new T.TubeGeometry(curve,segments,1,radial,false)
  const positions=geometry.getAttribute('position') as T.BufferAttribute
  const colors=new Float32Array(positions.count*3)
  const gold=new T.Color('#dba039'),cream=new T.Color('#f3d59a'),color=new T.Color()
  for(let i=0;i<=segments;i++){
    const s=i/segments,center=curve.getPointAt(s)
    // Keep a full feline tail, with only gentle narrowing toward a rounded cap.
    const radius=.036-.01*T.MathUtils.smoothstep(s,.2,1)
    color.copy(gold).lerp(cream,T.MathUtils.smoothstep(s,.72,1))
    for(let j=0;j<=radial;j++){
      const index=i*(radial+1)+j
      positions.setXYZ(index,center.x+(positions.getX(index)-center.x)*radius,center.y+(positions.getY(index)-center.y)*radius,center.z+(positions.getZ(index)-center.z)*radius)
      colors.set([color.r,color.g,color.b],index*3)
    }
  }
  const rest=new Float32Array(positions.array)
  geometry.setAttribute('color',new T.BufferAttribute(colors,3))
  positions.setUsage(T.DynamicDrawUsage)
  geometry.computeVertexNormals()
  const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:.85}))
  mesh.name='soft-curled-tail';mesh.position.set(-.22,.05,-.12);mesh.castShadow=true
  const end=curve.getPointAt(1)
  const tip=new T.Mesh(new T.SphereGeometry(.026,20,14),new T.MeshStandardMaterial({color:cream,roughness:.85}))
  tip.position.copy(end);tip.castShadow=true;tip.name='rounded-tail-tip';mesh.add(tip)
  let wasActive=false
  function update(time:number){
    const phase=(time%11.7-7.5)/2.9
    const active=phase>0&&phase<1.12
    if(!active&&!wasActive)return
    for(let i=0;i<=segments;i++){
      const s=i/segments,t=(phase-.12*s)
      // Raised-cosine pulse: zero velocity at rest, with a delayed tip.
      const lift=t>0&&t<1?Math.sin(Math.PI*t)**2:0
      const y=.145*s*s*lift
      for(let j=0;j<=radial;j++){
        const index=i*(radial+1)+j,k=index*3
        positions.setXYZ(index,rest[k]-.012*s*s*lift,rest[k+1]+y,rest[k+2]+.018*s*s*lift)
      }
    }
    const tipPhase=phase-.12
    const tipLift=tipPhase>0&&tipPhase<1?Math.sin(Math.PI*tipPhase)**2:0
    tip.position.set(end.x-.012*tipLift,end.y+.145*tipLift,end.z+.018*tipLift)
    positions.needsUpdate=true
    geometry.computeVertexNormals()
    geometry.computeBoundingSphere()
    wasActive=active
  }
  return {mesh,update}
}
