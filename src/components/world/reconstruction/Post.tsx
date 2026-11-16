import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { Vector2 } from 'three'
import { lighting } from './config'
export function Post(){
 const {gl,scene,camera,size}=useThree()
 const composer=useMemo(()=>{
   const comp=new EffectComposer(gl);comp.addPass(new RenderPass(scene,camera));comp.addPass(new UnrealBloomPass(new Vector2(512,512),lighting.bloom.strength,lighting.bloom.radius,lighting.bloom.threshold));comp.addPass(new OutputPass());return comp
 },[gl,scene,camera])
 useEffect(()=>{composer.setSize(size.width,size.height)},[composer,size.width,size.height])
 useEffect(()=>()=>{composer.passes.forEach(p=>p.dispose());composer.dispose()},[composer])
 useFrame((_,dt)=>composer.render(dt),1)
 return null
}
