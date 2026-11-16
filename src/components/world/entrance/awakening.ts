import { Material, Mesh, Points, Line, Object3D, ShaderMaterial } from 'three'

export type Awakening = {
  done: boolean
  skip: boolean
  finish?: () => void
  start?: () => void
  ready: () => void
  cameraReveal?: { value: number }
  complete: () => void
  root: HTMLElement | null
}

// A separate material instance prevents the hero reveal affecting miniature scenes.
// Fade both meshes and particles; preserve shader time uniforms and blending modes.
export function revealGroup(object: Object3D, screens = false) {
  const fades: { material: Material; opacity: number; depthWrite: boolean }[] = []
  let value = 0
  const progress = { get value() { return value }, set value(next: number) {
    value = next
    for (const fade of fades) {
      fade.material.opacity = fade.opacity * next
      fade.material.depthWrite = next >= 1 && fade.depthWrite
    }
  } }
  const originals: { mesh: Mesh | Points | Line; material: Material | Material[]; clones: Material[] }[] = []
  object.traverse(child => {
    if (!(child instanceof Mesh || child instanceof Points || child instanceof Line) || (!screens && child.parent?.name === "monitor-screen")) return
    const material: Material | Material[] = child.material
    const clones = (Array.isArray(material) ? material : [material]).map(source => {
      const clone: Material = source.clone()
      clone.transparent = true
      clone.forceSinglePass = true
      if (clone instanceof ShaderMaterial && source instanceof ShaderMaterial) clone.uniforms = source.uniforms
      if (!(source instanceof ShaderMaterial) && !screens) {
        fades.push({ material: clone, opacity: source.opacity, depthWrite: source.depthWrite })
        clone.depthWrite = false
        clone.opacity = 0
        // Reuse Three's built-in material programs instead of compiling a custom
        // reveal shader for every standard-material variant in the island.
        clone.onBeforeCompile = source.onBeforeCompile
        clone.customProgramCacheKey = () => source.customProgramCacheKey()
        return clone
      }
      const compile = source.onBeforeCompile
      clone.onBeforeCompile = (shader, renderer) => {
        compile.call(clone, shader, renderer)
        shader.uniforms.awakeningReveal = progress
        shader.fragmentShader = 'uniform float awakeningReveal;\n' + shader.fragmentShader
        shader.fragmentShader = shader.fragmentShader.replace(/void main\s*\(\s*\)\s*\{/, `void main() {
          if (awakeningReveal <= 0.0) discard;
          ${screens ? 'if (vMapUv.y < 1.0 - awakeningReveal) discard;' : ''}
        `)
        const end = shader.fragmentShader.lastIndexOf('}')
        shader.fragmentShader = shader.fragmentShader.slice(0, end) + '\ngl_FragColor.a *= awakeningReveal;\n' + shader.fragmentShader.slice(end)
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= awakeningReveal;')
      }
      clone.customProgramCacheKey = () => `awakening-${source.customProgramCacheKey()}-${screens}`
      return clone
    })
    child.material = Array.isArray(material) ? clones : clones[0]
    originals.push({ mesh: child, material, clones })
  })
  return { progress, restore: () => originals.forEach(({ mesh, material, clones }) => {
    mesh.material = material
    clones.forEach(clone => clone.dispose())
  }) }
}

export function seatDeveloper(timeline: gsap.core.Timeline, object: Object3D, at: number, mobile = false) {
  const chair = object.getObjectByName('office-chair')!
  const person = object.getObjectByName('seated-person')!
  const chairPosition = chair.position.clone(), personPosition = person.position.clone()
  const rotation = object.rotation.clone()
  const chairReveal = revealGroup(chair), personReveal = revealGroup(person)
  chair.position.z += mobile ? .45 : .8
  person.position.y += mobile ? .85 : 1.35
  timeline.to(chairReveal.progress, { value: 1, duration: .15 }, at)
  timeline.to(chair.position, { z: chairPosition.z, duration: .45, ease: 'power3.out' }, at)
  // The shared base pivot keeps the chair spinning around its own column.
  // The person is still fully hidden during this turn.
  timeline.to(object.rotation, { y: rotation.y + Math.PI * 2, duration: .8, ease: 'power2.inOut' }, at + .45)
  const fall = at + 1.25, impact = fall + .36
  timeline.set(object.rotation, { y: rotation.y }, fall)
  timeline.to(personReveal.progress, { value: 1, duration: .12 }, fall)
  timeline.to(person.position, { y: personPosition.y, duration: .36, ease: 'power2.in' }, fall)
  // The seated body compresses on contact; the shared pivot rocks both together.
  timeline.to(person.position, { y: personPosition.y - .045, duration: .07, ease: 'power1.out' }, impact)
  timeline.to(person.position, { y: personPosition.y + .025, duration: .13, ease: 'power2.out' }, impact + .07)
  timeline.to(person.position, { y: personPosition.y, duration: .18, ease: 'sine.inOut' }, impact + .2)
  const strength = mobile ? .6 : 1
  timeline.to(object.rotation, { x: rotation.x + .055 * strength, z: rotation.z + .04 * strength, duration: .09, ease: 'power2.out' }, impact)
  timeline.to(object.rotation, { x: rotation.x - .035 * strength, z: rotation.z - .026 * strength, duration: .18, ease: 'sine.inOut' }, impact + .09)
  timeline.to(object.rotation, { x: rotation.x + .014 * strength, z: rotation.z + .01 * strength, duration: .17, ease: 'sine.inOut' }, impact + .27)
  timeline.to(object.rotation, { x: rotation.x, z: rotation.z, duration: .21, ease: 'sine.out' }, impact + .44)
  return () => {
    chair.position.copy(chairPosition); person.position.copy(personPosition); object.rotation.copy(rotation)
    chairReveal.restore(); personReveal.restore()
  }
}

export function shelveBook(timeline: gsap.core.Timeline, object: Object3D, at: number, mobile = false) {
  const position = object.position.clone()
  const rotation = object.rotation.clone()
  const reveal = revealGroup(object)
  // Approach from the open front of the shelf, then lower onto its surface.
  object.position.z += mobile ? .2 : .4
  object.position.y += .055
  object.rotation.z -= mobile ? .045 : .085
  timeline.to(reveal.progress, { value: 1, duration: .1, ease: 'power1.out' }, at)
  timeline.to(object.position, { z: position.z, duration: .28, ease: 'power2.out' }, at)
  timeline.to(object.rotation, { z: rotation.z, duration: .28, ease: 'sine.inOut' }, at)
  timeline.to(object.position, { y: position.y, duration: .12, ease: 'power2.inOut' }, at + .26)
  return () => { object.position.copy(position); object.rotation.copy(rotation); reveal.restore() }
}

export function driftCloud(timeline: gsap.core.Timeline, object: Object3D, at: number, mobile = false) {
  const position = object.position.clone()
  const reveal = revealGroup(object)
  // +X is screen-right during the initial front-facing camera shot.
  object.position.x += mobile ? .45 : .7
  timeline.to(reveal.progress, { value: 1, duration: .35, ease: 'sine.out' }, at)
  timeline.to(object.position, { x: position.x, duration: .85, ease: 'power2.out' }, at)
  return () => { object.position.copy(position); reveal.restore() }
}

export function assemble(timeline: gsap.core.Timeline, object: Object3D, at: number, duration = .65, distance = .16) {
  const position = object.position.clone()
  const reveal = revealGroup(object)
  object.position.y -= distance
  timeline.to(object.position, { y: position.y, duration, ease: 'back.out(0.35)' }, at)
  timeline.to(reveal.progress, { value: 1, duration: duration * .75, ease: 'power1.out' }, at)
  return () => { object.position.copy(position); reveal.restore() }
}

// Props have their origin at the base, so rocking stays local to the pot/cup.
export function dropAndSettle(timeline: gsap.core.Timeline, object: Object3D, at: number, mobile = false, direction = 1, spin = false) {
  const position = object.position.clone()
  const rotation = object.rotation.clone()
  const reveal = revealGroup(object)
  const tilt = (mobile ? .075 : .14) * direction
  object.position.y += mobile ? .3 : .55
  object.rotation.z += tilt
  if (spin) {
    timeline.to(object.rotation, { y: rotation.y + Math.PI * 2 * direction, duration: .72, ease: 'power2.inOut' }, at)
    timeline.set(object.rotation, { y: rotation.y }, at + .72)
  }
  timeline.to(reveal.progress, { value: 1, duration: .16, ease: 'power1.out' }, at)
  timeline.to(object.position, { y: position.y, duration: .32, ease: 'power2.in' }, at)
  timeline.to(object.rotation, { z: rotation.z - tilt * .5, duration: .32, ease: 'power1.inOut' }, at)
  timeline.to(object.position, { y: position.y + .025, duration: .1, ease: 'power2.out' }, at + .32)
  timeline.to(object.position, { y: position.y, duration: .14, ease: 'power2.in' }, at + .42)
  timeline.to(object.rotation, { z: rotation.z + tilt * .28, duration: .17, ease: 'sine.inOut' }, at + .32)
  timeline.to(object.rotation, { z: rotation.z - tilt * .1, duration: .15, ease: 'sine.inOut' }, at + .49)
  timeline.to(object.rotation, { z: rotation.z, duration: .2, ease: 'sine.out' }, at + .64)
  return () => { object.position.copy(position); object.rotation.copy(rotation); reveal.restore() }
}
