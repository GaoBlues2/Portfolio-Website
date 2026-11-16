import { TreasureObject } from '../projects/TreasureObject'
import type { Treasure } from '../projects/treasureState'
/* eslint-disable react-hooks/immutability -- R3F cameras and shader uniforms are mutable Three.js objects, updated outside React rendering. */
import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { assemble, driftCloud, dropAndSettle, seatDeveloper, shelveBook, revealGroup } from './entrance/awakening'
import type { Awakening } from './entrance/awakening'
import { sampleEntranceCamera } from './entrance/cameraPath'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ACESFilmicToneMapping, Group, OrthographicCamera, PCFSoftShadowMap, Vector3 } from 'three'
import type { OrbitControls as Controls } from 'three-stdlib'
import { Sculpt } from './reconstruction/modeling'
import { cabin } from './reconstruction/cabin'
import { landscapeBackdrop } from './reconstruction/landscapeBackdrop'
import { terrain, water } from './reconstruction/terrain'
import { avatar } from './reconstruction/avatar'
import { tree, cloud } from './reconstruction/nature'
import { signs } from './reconstruction/signs'
import { referenceCamera as config, lighting } from './reconstruction/config'
import { ContactLife } from './reconstruction/ContactLife'
import { miniature } from './reconstruction/miniatures'
import type { MiniKind } from './reconstruction/miniatures'
import { pondLife } from './reconstruction/pondLife'
import { coffeeSteam } from './reconstruction/coffeeSteam'
import { curledCat } from './reconstruction/cat'
import { Post } from './reconstruction/Post'
export type Region='home'|'products'|'engineering'|'cloud'|'contact'
type Props={entrance:Awakening;active:Region|null;onSelect:(r:Region)=>void;exploring:boolean;paused:boolean;reduced:boolean;reset:number;visible:boolean}
gsap.registerPlugin(useGSAP)
function Assembly({moving,onSelect,entrance,reduced}:{moving:boolean;onSelect:(r:Region)=>void;entrance:Awakening;reduced:boolean}){
 const {camera,invalidate,gl,scene:renderScene}=useThree()
 const timeline=useRef<gsap.core.Timeline|null>(null)
 const introPlaying=useRef(false)
 const typing=useRef({value:entrance.done?1:0})
 const awake=useRef({value:entrance.done?1:0}),elapsed=useRef(0)
 const model=useMemo(()=>{
   const b=new Sculpt();terrain(b);cabin(b)
   const person=b.part('developer');avatar(person);person.finish()
   const vegetation=b.part('vegetation');tree(vegetation);vegetation.finish()
   const sky=b.part('cloud');cloud(sky);sky.finish()
   const group=b.finish(),fall=water();fall.group.name='water';group.add(fall.group)
   const backdrop=landscapeBackdrop(fall.material.uniforms.time);backdrop.name='backdrop';group.add(backdrop)
   const life=pondLife();life.group.name='pond-life';group.add(life.group)
   const cat=curledCat();group.add(cat.group)
   const boards=signs();boards.name='signposts';group.add(boards);group.position.set(.35,.5,0)
   const steam=coffeeSteam();group.getObjectByName('drop-cup')!.add(steam.mesh)
   const arms=[group.getObjectByName('typing-arm--1')!,group.getObjectByName('typing-arm-1')!]
   const crowns=vegetation.group.children.map(o=>({object:o,x:o.position.x}))
   return {group,fall,life,cat,arms,crowns,steam}
 },[])
 useGSAP(()=>{
   const restCamera=new Vector3(...config.position)
   const framing=entrance.cameraReveal??(entrance.cameraReveal={value:0})
   const cleanups:(()=>void)[]=[]
   let finished=false
   const finish=()=>{
     if(finished)return
     finished=true
     introPlaying.current=false
     timeline.current?.progress(1).pause()
     cleanups.splice(0).reverse().forEach(fn=>fn())
     framing.value=1
     camera.position.copy(restCamera);camera.lookAt(...config.target)
     model.steam.material.uniforms.strength.value=reduced?0:1
     typing.current.value=1;awake.current.value=1;entrance.done=true;entrance.complete();invalidate()
   }
   entrance.finish=finish
   if(entrance.done||entrance.skip||reduced){finish();return()=>{entrance.finish=undefined}}
   let cancelled=false
   awake.current.value=0;typing.current.value=0
   model.steam.material.uniforms.strength.value=0
   const mobile=window.matchMedia('(max-width: 767px)').matches
   const tl=gsap.timeline({paused:true,onUpdate:invalidate,onComplete:finish,defaults:{ease:'power2.out'}})
   timeline.current=tl
   tl.addLabel('boot',0).addLabel('terrain',.5).addLabel('construction',1.5).addLabel('awake',2.5)
   const schedule:Record<string,number>={'foundation':.5,'stone-terrace':.7,'rocks-decoration':.9,'house':1.5,'roof':1.68,'roof-garden':2.1,'desk':1.85,'bookshelves':1.9,'workstation':2.05,'lamp':2.1,'facade-leaves':2.45,'developer':2.45,'vegetation':2.5,'water':2.65,'pond-life':2.8,'curled-golden-cat':2.6,'signposts':2.8,'backdrop':.5}
   const drops=['drop-plant-pedestal','drop-plant-terrace','drop-cup','drop-plant-desk']
   for(const child of model.group.children){
     if(child.name==='cloud')continue
     if(child.name==='developer'){
       cleanups.push(seatDeveloper(tl,child,2.35,mobile))
       continue
     }
     if(child.name.startsWith('shelf-book-')){
       const index=Number(child.name.slice('shelf-book-'.length))
       cleanups.push(shelveBook(tl,child,2.35+index*.07,mobile))
       continue
     }
     const dropIndex=drops.indexOf(child.name)
     if(dropIndex!==-1){
       cleanups.push(dropAndSettle(tl,child,2.25+dropIndex*.1,mobile,dropIndex%2===0?1:-1,child.name.startsWith('drop-plant-')))
       continue
     }
     const at=schedule[child.name]??2.5
     cleanups.push(assemble(tl,child,at,at>=1.5&&at<2.45?.4:.6,mobile?.08:.16))
   }
   // Open the framing during the final assembly. Keep the cloud out of the
   // copy column until the camera has reached its resting composition.
   const cameraAt=2.85, cameraDuration=1.25
   const heroAt=cameraAt+cameraDuration
   cleanups.push(driftCloud(tl,model.group.getObjectByName('cloud')!,heroAt,mobile))
   tl.addLabel('hero',heroAt)
   model.group.traverse(child=>{
     if(child.name==='monitor-screen'){
       const screen=revealGroup(child,true);cleanups.push(screen.restore)
       tl.to(screen.progress,{value:1,duration:.4,ease:'none'},2.1)
     }
   })
   tl.to(awake.current,{value:1,duration:.8},2.5)
   tl.to(model.steam.material.uniforms.strength,{value:1,duration:.5},3.35)
   tl.to(typing.current,{value:1,duration:.25},4.65)
   // Orthographic cameras need a real zoom change, not a forward dolly.
   // CameraRig owns projection and target so OrbitControls cannot fight the intro.
   framing.value=0
   tl.to(framing,{value:1,duration:cameraDuration,ease:'sine.inOut'},cameraAt)
   const root=entrance.root
   if(root){
     // Reveal the copy throughout assembly, with the final CTA settling on
     // the same timeline boundary as the last 3D animation (including cloud).
     const foundationReady=schedule.foundation+.6
     tl.addLabel('foundation-ready',foundationReady)
     const copy=root.querySelectorAll('.hero-copy > *')
     const copyAt=.65, copyDuration=1.05, sceneEnd=tl.duration()
     const stagger=copy.length>1?(sceneEnd-copyAt-copyDuration)/(copy.length-1):0
     tl.fromTo(copy,{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:copyDuration,stagger,ease:'sine.inOut'},copyAt)
     tl.fromTo(root.querySelector('.header'),{y:-8,autoAlpha:0},{y:0,autoAlpha:1,duration:.4},foundationReady)
     tl.to(root.querySelectorAll('.world-section, .contact'),{autoAlpha:1,duration:.3},heroAt+.45)
   }
   // Remove the old half-second boot phase: assembly starts on loader dismissal.
   tl.shiftChildren(-.5, true, .5)
   if(mobile)tl.timeScale(1.8)
   entrance.start=()=>{if(!finished&&!cancelled){introPlaying.current=true;invalidate()}}
   Promise.all([gl.compileAsync(renderScene,camera),document.fonts.ready]).then(()=>{
     if(!cancelled&&!finished){entrance.ready()}
   }).catch(()=>{if(!cancelled)finish()})
   return()=>{
     cancelled=true;introPlaying.current=false;tl.kill();timeline.current=null;entrance.finish=undefined;entrance.start=undefined
     cleanups.splice(0).reverse().forEach(fn=>fn())
     if(!finished){camera.position.copy(restCamera);camera.lookAt(...config.target)}
   }
 },{dependencies:[model],revertOnUpdate:true})
 useEffect(()=>{if(reduced)entrance.finish?.()},[reduced,entrance])
 // Advance GSAP inside the render loop, before CameraRig and postprocessing.
 // A slow frame must not skip most of the camera orbit on the next render.
 useFrame((_,delta)=>{
   const tl=timeline.current
   if(introPlaying.current&&tl&&!document.hidden){
     tl.time(Math.min(tl.duration(),tl.time()+Math.min(delta,1/30)*tl.timeScale()),false)
     invalidate()
   }
   model.steam.mesh.quaternion.copy(camera.quaternion)
   if(moving){
     elapsed.current+=Math.min(delta,.05)*awake.current.value
     const time=elapsed.current
     model.steam.material.uniforms.time.value=time
     model.fall.material.uniforms.time.value=time;model.fall.update(time);model.life.update(time);model.cat.update(time)
     model.arms.forEach((arm,i)=>{arm.position.y=Math.sin(time*9+i*Math.PI)*.007*typing.current.value})
     model.crowns.forEach(({object,x},i)=>{object.position.x=x+Math.sin(time*1.2+i*.7)*.008*awake.current.value})
   }
 },-.5)
 const find=(e:ThreeEvent<PointerEvent|MouseEvent>)=>{if(!entrance.done)return;let o=e.object;while(o.parent&&!o.userData.region)o=o.parent;return o.userData.region as Region|undefined}
 return <primitive object={model.group} onClick={(e:ThreeEvent<MouseEvent>)=>{const id=find(e);if(id){e.stopPropagation();onSelect(id)}}} onPointerMove={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();document.body.style.cursor=find(e)?'pointer':''}} onPointerOut={()=>{document.body.style.cursor=''}}/>
}
function CameraRig({active,reset,reduced,exploring,entrance}:{entrance:Awakening;active:Region|null;reset:number;reduced:boolean;exploring:boolean}){
 const controls=useRef<Controls>(null),{camera,size,invalidate}=useThree(),transitioning=useRef(false)
 const destination=useRef(new Vector3(...config.position)),target=useRef(new Vector3(...config.target))
 const baseZoom=useRef(90)
 const applyProjection=()=>{
   if(!(camera instanceof OrthographicCamera))return
   const extra=window.innerWidth>=1031?Math.max(0,size.width-670):0
   const progress=entrance.done?1:(entrance.cameraReveal?.value??0)
   // The front view includes the signs and waterfall instead of cropping them.
   const zoom=baseZoom.current*(.9+.1*progress)
   const left=-size.width/2-extra/(2*zoom),right=size.width/2-extra/(2*zoom)
   if(camera.zoom!==zoom||camera.left!==left||camera.right!==right){
     camera.zoom=zoom;camera.left=left;camera.right=right;camera.updateProjectionMatrix()
   }
 }
 useEffect(()=>{
   const extra=window.innerWidth>=1031?Math.max(0,size.width-670):0
   baseZoom.current=Math.min(size.height/config.frameHeight,(size.width-extra)/6.7)
   // The frame callback also handles resize during the pullback.
   invalidate()
 },[size.width,size.height,invalidate])
 useEffect(()=>{target.current.set(...config.target);destination.current.set(...config.position);if(active){target.current.x+=.35;destination.current.x+=.35}transitioning.current=true;invalidate()},[active,reset,invalidate])
 useFrame((_,delta)=>{
   applyProjection()
   if(!entrance.done){
     // Start face-on to the cabin, then orbit back as the hero copy appears.
     sampleEntranceCamera(entrance.cameraReveal?.value??0,camera.position,target.current)
     controls.current?.target.copy(target.current);camera.lookAt(target.current)
     return
   }
   target.current.set(...config.target);if(active)target.current.x+=.35
   if(!transitioning.current||!controls.current)return;const amount=reduced?1:1-Math.exp(-delta*6);camera.position.lerp(destination.current,amount);controls.current.target.lerp(target.current,amount);controls.current.update();if(camera.position.distanceTo(destination.current)<.001)transitioning.current=false;else invalidate()})
 return <OrbitControls ref={controls} makeDefault enabled={exploring} enablePan={false} enableZoom={false} enableDamping={!reduced} target={config.target} minPolarAngle={.65} maxPolarAngle={1.36} minAzimuthAngle={-.3} maxAzimuthAngle={1.15} onStart={()=>{transitioning.current=false}}/>
}
function Lights(){return <><ambientLight intensity={lighting.ambient}/><hemisphereLight args={['#b9d2db','#28341c',lighting.hemisphere]}/><directionalLight position={lighting.key.position} color={lighting.key.color} intensity={lighting.key.intensity} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={7} shadow-camera-bottom={-5} shadow-normalBias={.025} shadow-bias={-.0001} shadow-radius={3}/><directionalLight position={lighting.fill.position} color={lighting.fill.color} intensity={lighting.fill.intensity}/><pointLight position={lighting.lamp.position} color={lighting.lamp.color} intensity={lighting.lamp.intensity} distance={lighting.lamp.distance} decay={2}/><pointLight position={[-.7,3,-.1]} intensity={1.4} color="#b8ff45" distance={2}/><pointLight position={[-2,1.1,.5]} intensity={1.1} color="#a6ff22" distance={1.7}/></>}
export default function WorldScene({entrance,active,onSelect,exploring,paused,reduced,reset,visible}:Props){
 const moving=!paused&&!reduced&&visible
 return <Canvas orthographic shadows={{type:PCFSoftShadowMap}} dpr={[1,1.5]} frameloop={moving?'always':'demand'} camera={{position:config.position,near:config.near,far:config.far,zoom:90}} gl={{antialias:true,alpha:false,toneMapping:ACESFilmicToneMapping,toneMappingExposure:lighting.exposure}} onCreated={({gl})=>gl.domElement.setAttribute('aria-label','Reconstructed developer cabin on a rocky grass island')} fallback={<p className="world-fallback">3D unavailable. All destinations are available below.</p>}>
  <color attach="background" args={[lighting.background]}/><Lights/><Assembly moving={moving} onSelect={onSelect} entrance={entrance} reduced={reduced}/><CameraRig entrance={entrance} active={active} reset={reset} reduced={reduced} exploring={exploring}/><Post/>
 </Canvas>
}
function MiniCamera({contact}:{contact:boolean}){const {camera,size,invalidate}=useThree();useEffect(()=>{if(camera instanceof OrthographicCamera){camera.zoom=contact?size.width/13:Math.min(size.width/2.35,size.height/2.05);camera.lookAt(contact?0:0,contact?.55:.5,0);camera.updateProjectionMatrix();invalidate()}},[camera,size,contact,invalidate]);return null}
export function MiniScene({kind,treasure,reduced=false,hovered=false}:{kind:MiniKind;treasure?:Treasure;reduced?:boolean;hovered?:boolean}){
 const model=useMemo(()=>miniature(kind),[kind]),contact=kind==='contact',root=useRef<Group>(null)
 return <Canvas style={contact?{pointerEvents:'none'}:undefined} orthographic shadows={{type:PCFSoftShadowMap}} frameloop="demand" dpr={[1,1.5]} camera={{position:contact?[4,5,12]:[3.6,3.1,5],zoom:70}} gl={{alpha:true,antialias:true,toneMapping:ACESFilmicToneMapping,toneMappingExposure:1.05}} aria-hidden="true"><ambientLight intensity={contact?lighting.ambient:.55}/><directionalLight position={contact?lighting.key.position:[-3,6,4]} intensity={contact?lighting.key.intensity:3} color={contact?lighting.key.color:"#e3f0d8"} castShadow shadow-mapSize={[1024,1024]} shadow-normalBias={contact?.018:.06} shadow-bias={-.0005} shadow-camera-left={contact?-8:-5} shadow-camera-right={contact?8:5} shadow-camera-top={5} shadow-camera-bottom={-5}/><hemisphereLight args={contact?['#b9d2db','#28341c',lighting.hemisphere]:['#c0dfb8','#1a2015',.8]}/>{contact&&<directionalLight position={lighting.fill.position} color={lighting.fill.color} intensity={lighting.fill.intensity}/>}<group ref={root}><primitive object={model}/>{kind==='projects'&&treasure&&<TreasureObject pose={treasure} reduced={reduced} hovered={hovered}/>}</group><MiniCamera contact={contact}/>{contact&&<ContactLife/>}</Canvas>
}
