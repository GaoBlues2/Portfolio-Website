/* eslint-disable react-hooks/immutability -- Three.js animation objects are updated in the render loop. */
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SphereGeometry, Vector3 } from 'three'
import { Sculpt } from './modeling'
import { contactRightOffset } from './config'

const UP = new Vector3(0, 1, 0)
const smooth = (x:number) => x*x*(3-2*x)
export function ContactLife(){
 const {gl,camera,invalidate}=useThree()
 const active=useRef(false), reduced=useRef(false), time=useRef(0)
 const anchors=useRef<Vector3[]>([])
 const lightSpots=useRef<HTMLElement[]>([])
 const life=useMemo(()=>{
  const root=new Group(), frog=new Sculpt()
  // A low resting silhouette with folded hind legs and tiny splayed toes.
  const abdomen=new Sculpt()
  abdomen.orb([0,.12,0],[.27,.15,.32],'#6c963c',12)
  frog.orb([0,.13,.23],[.26,.13,.2],'#89b64e',12)
  abdomen.orb([0,.065,.29],[.2,.065,.12],'#c5d883',12)
  for(const side of [-1,1]){
   frog.orb([side*.25,.07,-.1],[.15,.1,.2],'#507c34',10)
   frog.orb([side*.2,.025,.24],[.07,.045,.16],'#739a40',10)
   for(let j=0;j<3;j++)frog.orb([side*(.19+j*.035),.01,.36+j*.012],[.027,.018,.07],'#9abd59',8)
   frog.orb([side*.145,.255,.21],[.095,.1,.09],'#719c3e',12)
  }
  frog.tube([[-.19,.12,.365],[0,.095,.415],[.19,.12,.365]],.009,'#314923',12,5)
  const body=frog.finish();body.position.set(4.7+contactRightOffset[0],-.065+contactRightOffset[1],.99+contactRightOffset[2]);body.rotation.y=-.55;root.add(body)
  const belly=abdomen.finish();body.add(belly)
  const eyes=new Group();body.add(eyes)
  for(const side of [-1,1]){
   const eye=new Sculpt();eye.orb([side*.145,0,0],[.066,.072,.039],'#e4db8e',12);eye.orb([side*.145,0,.034],[.026,.048,.014],'#111e12',12);eye.orb([side*.13,.025,.046],[.012,.014,.008],'#ffffff',8)
   eyes.add(eye.finish())
  }
  eyes.position.set(0,.268,.28)
  const cloth=new PlaneGeometry(.55,.31,20,8), pos=cloth.getAttribute('position')
  for(let i=0;i<pos.count;i++){
   const u=pos.getX(i)/.55+.5,v=pos.getY(i)/.31+.5
   // A swallowtail cut into the free end, with the hoist pinned to the pole.
   pos.setXYZ(i,u*(.55-.14*(1-Math.abs(v*2-1))),pos.getY(i)-.155-u*.055,0)
  }
  const rest=Float32Array.from(pos.array)
  const flag=new Mesh(cloth,new MeshStandardMaterial({color:'#ddf58b',side:DoubleSide,roughness:.85,emissive:'#b9d65c',emissiveIntensity:.2}));flag.position.set(-3.75,2.04,.15);flag.castShadow=true;root.add(flag)
  const flies=Array.from({length:3},(_,i)=>{
   const bug=new Group();bug.scale.setScalar(1.4)
   const s=new Sculpt();s.orb([0,0,0],[.022,.04,.022],'#3c4b1d',8)
   const wings=new Group();for(const side of [-1,1]){const wing=new Mesh(new SphereGeometry(1,8,5),new MeshBasicMaterial({color:'#d6edb8',transparent:true,opacity:.5,depthWrite:false}));wing.scale.set(.045,.014,.025);wing.position.x=side*.035;wings.add(wing)}
   bug.add(s.finish(),wings)
   const glow=new Mesh(new SphereGeometry(.026,8,6),new MeshBasicMaterial({color:'#e8ff80'}));glow.position.y=-.025;bug.add(glow)
   const halo=new Mesh(new SphereGeometry(.075,10,8),new MeshBasicMaterial({color:'#c4f961',transparent:true,opacity:.14,depthWrite:false}));bug.add(halo);root.add(bug)
   return {bug,wings,halo,phase:i*6.1}
  })
  const tongue=new Mesh(new CylinderGeometry(.018,.024,1,7),new MeshStandardMaterial({color:'#dc8087',roughness:.65}));tongue.visible=false;root.add(tongue)
  return {root,body,eyes,flag,rest,flies,tongue}
 },[])
 useEffect(()=>{
  const section=gl.domElement.closest('.contact');if(!section)return
  const media=matchMedia('(prefers-reduced-motion: reduce)')
   const measure=()=>{
    const canvas=gl.domElement.getBoundingClientRect()
    const targets=Array.from(section.querySelectorAll<HTMLElement>('.contact-copy h2,.contact-copy p,.contact-copy button'))
    lightSpots.current=Array.from(section.querySelectorAll<HTMLElement>('.firefly-lights i'))
    anchors.current=targets.map((el,i)=>{
    const r=el.getBoundingClientRect(),x=r.left+r.width*[.65,.78,.76][i],y=r.top+2
    const near=new Vector3((x-canvas.left)/canvas.width*2-1,-(y-canvas.top)/canvas.height*2+1,-1).unproject(camera)
    const far=new Vector3((x-canvas.left)/canvas.width*2-1,-(y-canvas.top)/canvas.height*2+1,1).unproject(camera).sub(near).normalize()
    return near.addScaledVector(far,(1.5-near.z)/far.z)
   });invalidate()
  }
  const preference=()=>{reduced.current=media.matches;invalidate()}
  const visibility=()=>{active.current=!document.hidden&&section.getBoundingClientRect().bottom>0&&section.getBoundingClientRect().top<innerHeight;invalidate()}
  const observer=new IntersectionObserver(([entry])=>{active.current=entry.isIntersecting&&!document.hidden;measure();invalidate()});observer.observe(section)
  const resize=new ResizeObserver(measure);resize.observe(section)
  media.addEventListener('change',preference);document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',measure)
  preference();measure()
   return()=>{observer.disconnect();resize.disconnect();media.removeEventListener('change',preference);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',measure)}
 },[camera,gl,invalidate])
 useEffect(()=>()=>{life.root.traverse(o=>{if(o instanceof Mesh)o.geometry.dispose()});life.flag.material.dispose();life.tongue.material.dispose();life.flies.forEach(f=>{f.bug.traverse(o=>{if(o instanceof Mesh&&o.material instanceof MeshBasicMaterial)o.material.dispose()})})},[life])
 const mouth=useMemo(()=>new Vector3(),[]),target=useMemo(()=>new Vector3(),[]),direction=useMemo(()=>new Vector3(),[]),screenPosition=useMemo(()=>new Vector3(),[])
 useFrame((_,delta)=>{
  if(!active.current)return
  if(!reduced.current)time.current+=Math.min(delta,.05)
  const t=time.current, p=life.flag.geometry.getAttribute('position')
  for(let i=0;i<p.count;i++){const x=life.rest[i*3],y=life.rest[i*3+1];p.setXYZ(i,x,y+Math.sin(t*3.6-x*8)*.018*x/.55,Math.sin(t*4.2-x*10+y*3)*.065*x/.55)}
  p.needsUpdate=true;life.flag.geometry.computeVertexNormals()
  const blink=t%5.7;life.eyes.scale.y=reduced.current?1:blink<.19?1-.94*Math.sin(blink/.19*Math.PI):blink>.32&&blink<.47?1-.9*Math.sin((blink-.32)/.15*Math.PI):1
  // Keep the resting silhouette intact; breathing moves the whole frog subtly.
  life.body.scale.y=reduced.current?1:1+Math.sin(t*1.8)*.012
  life.body.updateMatrixWorld();mouth.set(0,.12,.42).applyMatrix4(life.body.matrixWorld)
  const cycle=t%17, strike=cycle>11&&cycle<11.75
   life.flies.forEach((f,i)=>{
   const anchor=anchors.current[i]??new Vector3(1+i,1,1.5),phase=(t+f.phase)%17
   // Long perches alternate with looping flights; the first insect teases the frog.
   if(phase<4||reduced.current){f.bug.position.copy(anchor);f.wings.scale.y=.3}
   else{
    const u=(phase-4)/13,envelope=Math.sin(Math.PI*u)
    f.bug.position.copy(anchor).add(new Vector3(Math.sin(u*Math.PI*2+i)*1.1*envelope,Math.sin(u*Math.PI)*.65+Math.sin(t*2+i)*.07*envelope,Math.sin(u*Math.PI*2)*.3))
    f.wings.scale.y=.7+Math.sin(t*48+i)*.3
   }
   if(i===0&&cycle>8&&cycle<13){
    target.copy(mouth).add(new Vector3(-1.05,1.05,.1))
    const blend=cycle<9?smooth(cycle-8):cycle>12?1-smooth(cycle-12):1
    f.bug.position.lerp(target,blend)
    if(cycle>11){const escape=Math.sin(Math.min(1,(cycle-11)/.65)*Math.PI/2);f.bug.position.x-=escape*.85;f.bug.position.y+=escape*.5}
   }
    f.halo.scale.setScalar(.9+Math.sin(t*3+i*2)*.16)
   })
   // Position a small light pool at the rendered location of each firefly.
   // It sits behind the copy, avoiding a full glow on the entire text or CTA.
   const canvas=gl.domElement.getBoundingClientRect()
   const section=gl.domElement.closest('.contact')?.getBoundingClientRect()
   if(section)life.flies.forEach((f,i)=>{
    const spot=lightSpots.current[i]
    if(!spot)return
    screenPosition.copy(f.bug.position).applyMatrix4(life.root.matrixWorld).project(camera)
    const x=canvas.left+(screenPosition.x+1)*canvas.width/2
    const y=canvas.top+(-screenPosition.y+1)*canvas.height/2
    spot.style.transform=`translate(${x-section.left}px,${y-section.top}px) translate(-50%,-50%)`
    spot.style.opacity=screenPosition.z>1?'0':reduced.current?'.28':'.52'
   })
  life.tongue.visible=strike&&!reduced.current
  if(strike){
   const u=(cycle-11)/.75,reach=u<.28?smooth(u/.28):1-smooth((u-.28)/.72)
   target.copy(mouth).add(new Vector3(-1.05,1.05,.1));direction.copy(target).sub(mouth)
   life.tongue.scale.set(1,direction.length()*reach,1);life.tongue.position.copy(mouth).addScaledVector(direction,reach*.5);life.tongue.quaternion.setFromUnitVectors(UP,direction.normalize())
  }
  if(!reduced.current)invalidate()
 })
 return <primitive object={life.root}/>
}
