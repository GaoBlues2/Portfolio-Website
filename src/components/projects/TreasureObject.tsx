import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { PointLight } from 'three'
import { buildTreasure } from './treasure'
import type { Treasure } from './treasureState'
export function TreasureObject({pose,reduced,hovered}:{pose:Treasure;reduced:boolean;hovered:boolean}){
 const {gl,invalidate}=useThree(),visible=useRef(true)
 useEffect(()=>{let inView=true;const update=()=>{visible.current=inView&&!document.hidden;invalidate()};const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;update()});observer.observe(gl.domElement);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)}},[gl,invalidate])
 const model=useMemo(buildTreasure,[]),light=useRef<PointLight>(null)
 useEffect(()=>()=>{model.group.traverse(o=>{if('geometry' in o)(o.geometry as {dispose:()=>void}).dispose()});model.texture.dispose();model.lockMaterial.dispose();model.sparkMaterial.dispose()},[model])
 useFrame(({clock,camera,invalidate})=>{
  const t=clock.elapsedTime,idle=pose.hinge===0&&pose.lift===0
  model.group.position.y=pose.lift+(idle&&!reduced?Math.sin(t*1.4)*.008:0)+(hovered&&idle&&!reduced?.035:0)
  model.hinge.rotation.x=pose.hinge+(hovered&&idle&&!reduced?Math.sin(t*22)*.012:0)
  model.lockMaterial.color.setScalar(hovered?1.7:1+pose.glow*.25)
  model.sparkMaterial.opacity=reduced?0:pose.particles*.85
  model.sparks.children.forEach((s,i)=>{s.position.y=.68+((t*.27+i*.091)%1)*1.2;s.quaternion.copy(camera.quaternion)})
  if(light.current)light.current.intensity=pose.glow*(hovered?2:1)
  if(!reduced&&visible.current)invalidate()
 })
 return <><primitive object={model.group}/><pointLight ref={light} position={[0,.74,.15]} color="#b8ff35" intensity={.3} distance={2} decay={2}/><mesh position={[0,.651,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.85,.54]}/><meshBasicMaterial color="#baff55" toneMapped={false}/></mesh></>
}
