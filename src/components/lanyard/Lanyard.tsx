import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody as RapierRigidBodyComponent,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

import cardGLB from '../../assets/lanyard/cardv4.glb?url'
import lanyardTex from '../../assets/lanyard/lanyard.png'

extend({ MeshLineGeometry, MeshLineMaterial })

export interface LanyardProps {
  position?: [number, number, number]
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
  className?: string
}

export function Lanyard({
  position = [0, 0, 25],
  gravity = [0, -45, 0],
  fov = 20,
  transparent = true,
  className = '',
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`relative z-0 h-full w-full ${className}`}>
      <Canvas
        className="h-full w-full touch-none"
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Suspense fallback={null}>
          <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
            <Band isMobile={isMobile} />
          </Physics>
        </Suspense>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  )
}

interface BandProps {
  maxSpeed?: number
  minSpeed?: number
  isMobile?: boolean
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false }: BandProps) {
  const band = useRef<THREE.Mesh>(null)
  const fixed = useRef<RapierRigidBody>(null)
  const j1 = useRef<RapierRigidBody>(null)
  const j2 = useRef<RapierRigidBody>(null)
  const j3 = useRef<RapierRigidBody>(null)
  const card = useRef<RapierRigidBody>(null)
  const j1Lerped = useRef(new THREE.Vector3())
  const j2Lerped = useRef(new THREE.Vector3())
  const lerpedInited = useRef(false)
  const target = useRef(new THREE.Vector3())
  const quat = useRef(new THREE.Quaternion())
  const euler = useRef(new THREE.Euler())

  const vec = new THREE.Vector3()
  const dir = new THREE.Vector3()

  // "Chiều dài" của dây (băng) phụ thuộc vào cả:
  // 1) khoảng cách ràng buộc của rope joints
  // 2) vị trí neo ban đầu theo trục X (j1/j2/j3/card)
  const ropeLinkLength = 1.4
  const x0 = 0.7
  const x1 = 1.4
  const x2 = 2.1
  const x3 = 2.8

  const segmentProps = {
    canSleep: true,
    colliders: false as const,
    angularDamping: 4,
    linearDamping: 4,
  } satisfies Omit<RigidBodyProps, 'ref' | 'children' | 'position' | 'type'>

  const gltf = useGLTF(cardGLB)
  const nodes = gltf.nodes as unknown as {
    card: THREE.Mesh
    clip: THREE.Mesh
    clamp: THREE.Mesh
  }
  const materials = gltf.materials as unknown as {
    base: THREE.MeshPhysicalMaterial
    metal: THREE.MeshStandardMaterial
  }
  const texture = useTexture(lanyardTex)
  const bandTexture = useMemo(() => {
    const t = texture.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.needsUpdate = true
    return t
  }, [texture])
  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ])
    c.curveType = 'chordal'
    return c
  })
  const [dragged, drag] = useState<false | THREE.Vector3>(false)
  const [hovered, hover] = useState(false)

  // Joint hooks typings expect RefObject without null; refs are populated by R3F before step.
  useRopeJoint(fixed as never, j1 as never, [[0, 0, 0], [0, 0, 0], ropeLinkLength])
  useRopeJoint(j1 as never, j2 as never, [[0, 0, 0], [0, 0, 0], ropeLinkLength])
  useRopeJoint(j2 as never, j3 as never, [[0, 0, 0], [0, 0, 0], ropeLinkLength])
  useSphericalJoint(j3 as never, card as never, [
    [0, 0, 0],
    [0, 1.45, 0],
  ])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => {
        document.body.style.cursor = 'auto'
      }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      })
    }
    if (fixed.current && band.current && card.current && j1.current && j2.current && j3.current) {
      const stepLerped = (rb: RapierRigidBody, lerped: THREE.Vector3) => {
        const t = rb.translation()
        target.current.set(t.x, t.y, t.z)
        if (!lerpedInited.current) {
          lerped.copy(target.current)
          return
        }
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, lerped.distanceTo(target.current)),
        )
        lerped.lerp(
          target.current,
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        )
      }
      stepLerped(j1.current, j1Lerped.current)
      stepLerped(j2.current, j2Lerped.current)
      lerpedInited.current = true

      const t3 = j3.current.translation()
      curve.points[0].set(t3.x, t3.y, t3.z)
      curve.points[1].copy(j2Lerped.current)
      curve.points[2].copy(j1Lerped.current)
      const tf = fixed.current.translation()
      curve.points[3].set(tf.x, tf.y, tf.z)

      const geom = band.current.geometry as THREE.BufferGeometry & {
        setPoints: (pts: THREE.Vector3[]) => void
      }
      geom.setPoints(curve.getPoints(isMobile ? 16 : 32))

      const av = card.current.angvel()
      const r = card.current.rotation()
      quat.current.set(r.x, r.y, r.z, r.w)
      euler.current.setFromQuaternion(quat.current, 'YXZ')
      card.current.setAngvel(
        {
          x: av.x,
          y: av.y - euler.current.y * 0.25,
          z: av.z,
        },
        true,
      )
    }
  })

  return (
    <>
      <group position={[4, 6, 0]}>
        <RapierRigidBodyComponent ref={fixed} {...segmentProps} position={[0, -0.5, 0]} type="fixed" />
        <RapierRigidBodyComponent position={[x0, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RapierRigidBodyComponent>
        <RapierRigidBodyComponent position={[x1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RapierRigidBodyComponent>
        <RapierRigidBodyComponent position={[x2, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RapierRigidBodyComponent>
        <RapierRigidBodyComponent
          position={[x3, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged ? ('kinematicPosition' as const) : ('dynamic' as const)
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.stopPropagation()
              ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
              drag(false)
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current!.translation())),
              )
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh
              geometry={nodes.clip.geometry}
              material={materials.metal}
              material-roughness={0.3}
            />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RapierRigidBodyComponent>
      </group>
      <mesh ref={band}>
        {/* @ts-expect-error meshline extend */}
        <meshLineGeometry />
        {/* @ts-expect-error meshline extend */}
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}

useGLTF.preload(cardGLB)
