import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const FIELD_CONFIG = {
  back: {
    count: 20,
    color: '#7D877A',
    roughness: 0.9,
    spreadX: 5.9,
    spreadY: 2.35,
    baseZ: -0.8,
    depth: 1.15,
    sizeMin: 0.34,
    sizeMax: 0.78,
    seed: 31,
  },
  front: {
    count: 14,
    color: '#D7FF73',
    roughness: 0.68,
    spreadX: 6.05,
    spreadY: 2.55,
    baseZ: 0.55,
    depth: 0.9,
    sizeMin: 0.42,
    sizeMax: 0.92,
    seed: 79,
  },
}

function random(seed) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createSphereField(config) {
  return Array.from({ length: config.count }, (_, index) => {
    const seed = config.seed + index * 17.17
    const edgeBias = index % 4 === 0 ? 1.16 : 1

    return {
      x: (random(seed) * 2 - 1) * config.spreadX * edgeBias,
      y: (random(seed + 1) * 2 - 1) * config.spreadY,
      z: config.baseZ + (random(seed + 2) * 2 - 1) * config.depth,
      size: THREE.MathUtils.lerp(config.sizeMin, config.sizeMax, random(seed + 3)),
      ampX: THREE.MathUtils.lerp(0.18, 0.7, random(seed + 4)),
      ampY: THREE.MathUtils.lerp(0.14, 0.56, random(seed + 5)),
      ampZ: THREE.MathUtils.lerp(0.12, 0.46, random(seed + 6)),
      speedX: THREE.MathUtils.lerp(0.11, 0.27, random(seed + 7)),
      speedY: THREE.MathUtils.lerp(0.09, 0.23, random(seed + 8)),
      speedZ: THREE.MathUtils.lerp(0.08, 0.19, random(seed + 9)),
      phaseX: random(seed + 10) * Math.PI * 2,
      phaseY: random(seed + 11) * Math.PI * 2,
      phaseZ: random(seed + 12) * Math.PI * 2,
      breath: THREE.MathUtils.lerp(0.07, 0.17, random(seed + 13)),
    }
  })
}

function FloatingSphereField({ layer, reducedMotion, pointerRef }) {
  const mesh = useRef()
  const invalidate = useThree((state) => state.invalidate)
  const viewport = useThree((state) => state.viewport)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const config = FIELD_CONFIG[layer]
  const spheres = useMemo(() => createSphereField(config), [config])
  const repelX = useMemo(() => new Float32Array(config.count), [config.count])
  const repelY = useMemo(() => new Float32Array(config.count), [config.count])

  const updateMatrices = (time = 0, delta = 0) => {
    const pointer = pointerRef.current
    const pointerX = pointer.x * viewport.width * 0.5
    const pointerY = pointer.y * viewport.height * 0.5

    spheres.forEach((sphere, index) => {
      const x = sphere.x
        + Math.sin(time * sphere.speedX + sphere.phaseX) * sphere.ampX
        + Math.cos(time * sphere.speedY * 0.43 + sphere.phaseZ) * sphere.ampX * 0.28
      const y = sphere.y
        + Math.cos(time * sphere.speedY + sphere.phaseY) * sphere.ampY
        + Math.sin(time * sphere.speedZ * 0.61 + sphere.phaseX) * sphere.ampY * 0.34
      const z = sphere.z
        + Math.sin(time * sphere.speedZ + sphere.phaseZ) * sphere.ampZ
        + Math.cos(time * sphere.speedX * 0.37 + sphere.phaseY) * sphere.ampZ * 0.3
      const scale = sphere.size * (1 + Math.sin(time * (sphere.speedY + 0.13) + sphere.phaseZ) * sphere.breath)
      const dx = x - pointerX
      const dy = y - pointerY
      const distance = Math.hypot(dx, dy)
      const radius = 1.15 + sphere.size * 0.55
      const influence = pointer.active
        ? 1 - THREE.MathUtils.smoothstep(distance, radius * 0.18, radius)
        : 0
      const push = influence * (layer === 'front' ? 0.72 : 0.48)
      const directionX = distance > 0.001 ? dx / distance : Math.cos(sphere.phaseX)
      const directionY = distance > 0.001 ? dy / distance : Math.sin(sphere.phaseY)
      const response = influence > 0 ? 11 : 3.6

      repelX[index] = THREE.MathUtils.damp(repelX[index], directionX * push, response, delta)
      repelY[index] = THREE.MathUtils.damp(repelY[index], directionY * push, response, delta)

      dummy.position.set(x + repelX[index], y + repelY[index], z + influence * 0.08)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(index, dummy.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    mesh.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    updateMatrices(0)
    invalidate()
  })

  useFrame((_, delta) => {
    if (reducedMotion) return
    updateMatrices(performance.now() * 0.001, delta)
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, config.count]} frustumCulled={false}>
      <sphereGeometry args={[1, 28, 22]} />
      <meshStandardMaterial color={config.color} roughness={config.roughness} metalness={0.02} />
    </instancedMesh>
  )
}

function SphereCanvas({ layer, reducedMotion, pointerRef }) {
  return (
    <div className={`hero-scene hero-scene--${layer}`} aria-hidden="true">
      <Canvas
        role="presentation"
        camera={{ position: [0, 0, 7.6], fov: 42 }}
        dpr={[1, 1.5]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={layer === 'front' ? 1.15 : 0.7} />
        <directionalLight position={[-3, 5, 6]} color="#F2F5EF" intensity={layer === 'front' ? 3.2 : 1.9} />
        <pointLight position={[4, -1, 4]} color="#C8FF3D" intensity={layer === 'front' ? 10 : 4} distance={11} />
        <pointLight position={[-4, 1, 3]} color="#64E7E0" intensity={layer === 'front' ? 5 : 3} distance={10} />
        <FloatingSphereField layer={layer} reducedMotion={reducedMotion} pointerRef={pointerRef} />
      </Canvas>
    </div>
  )
}

function StaticSphereField({ layer }) {
  return (
    <div className={`scene-fallback scene-fallback--${layer}`} aria-hidden="true">
      {Array.from({ length: layer === 'front' ? 9 : 13 }, (_, index) => <span key={index} />)}
    </div>
  )
}

export default function HeroScene({ reducedMotion, lowPower }) {
  const pointerRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (lowPower || reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined

    const handlePointerMove = (event) => {
      const scene = document.querySelector('.hero-scene--front')
      if (!scene) return

      const bounds = scene.getBoundingClientRect()
      const isInside = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom

      pointerRef.current.active = isInside
      if (isInside) {
        pointerRef.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
        pointerRef.current.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
      }
    }

    const resetPointer = () => { pointerRef.current.active = false }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('blur', resetPointer)
    document.documentElement.addEventListener('pointerleave', resetPointer)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('blur', resetPointer)
      document.documentElement.removeEventListener('pointerleave', resetPointer)
    }
  }, [lowPower, reducedMotion])

  if (lowPower) {
    return (
      <>
        <StaticSphereField layer="back" />
        <StaticSphereField layer="front" />
      </>
    )
  }

  return (
    <>
      <SphereCanvas layer="back" reducedMotion={reducedMotion} pointerRef={pointerRef} />
      <SphereCanvas layer="front" reducedMotion={reducedMotion} pointerRef={pointerRef} />
    </>
  )
}
