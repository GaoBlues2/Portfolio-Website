/* R3F owns mutable Three.js camera objects; updating them in effects/frame callbacks is intentional. */
/* eslint-disable react-hooks/immutability */
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { Box3, Group, Mesh, MeshBasicMaterial, NoToneMapping, SRGBColorSpace, TextureLoader, Vector3 } from 'three'

const textureNames = ['TexFleur', 'TexProps', 'TexMobilier', 'TexTableaux', 'TexBibli', 'TexFloor', 'TexWalls']
const textureLoaders = new WeakMap<import('three').WebGLRenderer, KTX2Loader>()
function getTextureLoader(gl: import('three').WebGLRenderer) {
  let loader = textureLoaders.get(gl)
  if (!loader) {
    loader = new KTX2Loader().setTranscoderPath('/studio/basis/').detectSupport(gl)
    textureLoaders.set(gl, loader)
  }
  return loader
}
const draco = new DRACOLoader().setDecoderPath('/studio/draco/')

function Studio({ paused, rotation }: { paused: boolean; rotation: number }) {
  const { gl, camera, size, invalidate } = useThree()
  const ktx = getTextureLoader(gl)
  const textures = useLoader(ktx, textureNames.map(name => `/studio/${name}.ktx2`))
  const gltf = useLoader(GLTFLoader, '/studio/scene.glb', loader => loader.setDRACOLoader(draco))
  const dragging = useRef(false)
  const dragStart = useRef(0)
  const turn = useRef(0)
  const flower = useRef<Mesh | null>(null)
  const prepared = useMemo(() => {
    const scene = gltf.scene.clone(true)
    const materials: MeshBasicMaterial[] = []
    const geometries: Mesh['geometry'][] = []
    scene.traverse(object => {
      if (!(object instanceof Mesh)) return
      const index = textureNames.findIndex(name => object.name.startsWith(name))
      if (index < 0) return
      const texture = textures[index]
      texture.colorSpace = SRGBColorSpace
      texture.flipY = false
      const material = new MeshBasicMaterial({ map: texture, toneMapped: false })
      // Expand bright atlas texels by one pixel to avoid dark UV-island seams.
      material.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
          #ifdef USE_MAP
            vec2 px = vec2(1.0 / 4096.0);
            vec4 texel = texture2D(map, vMapUv);
            texel = max(texel, texture2D(map, vMapUv + vec2(px.x, 0.0)));
            texel = max(texel, texture2D(map, vMapUv - vec2(px.x, 0.0)));
            texel = max(texel, texture2D(map, vMapUv + vec2(0.0, px.y)));
            texel = max(texel, texture2D(map, vMapUv - vec2(0.0, px.y)));
            diffuseColor *= texel;
          #endif
        `)
      }
      materials.push(material)
      object.material = material
      if (object.name.startsWith('TexFleur')) {
        object.geometry = object.geometry.clone()
        const center = new Box3().setFromBufferAttribute(object.geometry.attributes.position).getCenter(new Vector3())
        object.geometry.translate(-center.x, -center.y, -center.z)
        object.position.copy(center)
        geometries.push(object.geometry)
      }
    })
    return { scene, materials, geometries }
  }, [gltf, textures])
  useEffect(() => {
    flower.current = prepared.scene.getObjectByName('TexFleur') as Mesh
    return () => { prepared.materials.forEach(m => m.dispose()); prepared.geometries.forEach(g => g.dispose()) }
  }, [prepared])
  useEffect(() => {
    const source = gltf.cameras[0]
    camera.position.copy(source.position)
    camera.quaternion.copy(source.quaternion)
    if ('fov' in camera) {
      const cam = camera as import('three').PerspectiveCamera
      cam.fov = 22.895
      cam.zoom = size.width < 768 ? .67 : 1
      cam.updateProjectionMatrix()
    }
  }, [camera, gltf, size.width])
  useFrame(({ pointer }, delta) => {
    if (flower.current) flower.current.rotation.y = rotation + turn.current
    if (!paused) {
      const amount = Math.min(delta * 2, 1)
      camera.position.z += (pointer.x * -.1 - camera.position.z) * amount
      camera.position.y += (2.310757 + pointer.y * .035 - camera.position.y) * amount
    }
  })
  function down(event: ThreeEvent<PointerEvent>) {
    if (!event.object.name.startsWith('TexFleur')) return
    event.stopPropagation()
    dragging.current = true
    dragStart.current = event.clientX
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  }
  function move(event: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return
    turn.current = Math.max(-.35, Math.min(.35, (event.clientX - dragStart.current) * .003))
    invalidate()
  }
  function up(event: ThreeEvent<PointerEvent>) {
    dragging.current = false
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
  }
  return <primitive object={prepared.scene} dispose={null} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
}

function Clouds({ paused }: { paused: boolean }) {
  const textures = useLoader(TextureLoader, [1, 2, 3, 4, 5, 6].map(i => `/studio/cloud${i}.png`))
  const clouds = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!paused && clouds.current) clouds.current.position.z = Math.sin(clock.elapsedTime * .035) * .8
  })
  return <group ref={clouds}>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-8 - i % 3, -1 + (i % 4) * 2.7, -12 + Math.floor(i / 4) * 7]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[9 + i % 3, 6]} />
      <meshBasicMaterial map={textures[i % 6]} color="#f7efe4" transparent depthWrite={false} toneMapped={false} />
    </mesh>)}
  </group>
}
export default function HeroScene(props: { paused: boolean; rotation: number }) {
  return <Canvas camera={{ position: [14.7564, 2.310757, 0], rotation: [0, Math.PI / 2, 0], fov: 22.895, near: .1, far: 1000 }} dpr={[1, 2]} gl={{ antialias: true, toneMapping: NoToneMapping }} frameloop={props.paused ? 'demand' : 'always'}>
    <color attach="background" args={['#b1c3cb']} />
    <Suspense fallback={null}><Studio {...props} /><Clouds paused={props.paused} /></Suspense>
  </Canvas>
}
