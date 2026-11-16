import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { Group, Mesh, Points, BoxGeometry, MeshStandardMaterial, ShaderMaterial, Vector3 } from 'three'
import { gsap } from 'gsap'

const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
try {
  const { sampleEntranceCamera } = await server.ssrLoadModule('/src/components/world/entrance/cameraPath.ts')
  const { referenceCamera } = await server.ssrLoadModule('/src/components/world/reconstruction/config.ts')
  const eye = new Vector3(), focus = new Vector3()
  sampleEntranceCamera(0, eye, focus)
  assert.equal(eye.x, focus.x, 'initial camera faces the facade directly')
  assert.equal(eye.y, focus.y, 'initial camera is straight-on, not isometric')
  assert.ok(eye.z > focus.z)
  const distance = eye.distanceTo(focus)
  let previousYaw = -1
  for (let i = 0; i <= 100; i++) {
    sampleEntranceCamera(i / 100, eye, focus)
    assert.ok(Math.abs(eye.distanceTo(focus) - distance) < 1e-10, 'orbit radius remains stable')
    const yaw = Math.atan2(eye.x - focus.x, eye.z - focus.z)
    assert.ok(yaw >= previousYaw, 'orbit rotates monotonically toward the resting angle')
    previousYaw = yaw
  }
  assert.deepEqual(eye.toArray(), referenceCamera.position, 'exact final camera position')
  assert.deepEqual(focus.toArray(), referenceCamera.target, 'exact final camera target')
  console.log('PASS: front-facing camera, continuous orbit, exact resting camera.')
  const { assemble, driftCloud, dropAndSettle, seatDeveloper, shelveBook, revealGroup } = await server.ssrLoadModule('/src/components/world/entrance/awakening.ts')
  for (const animate of [assemble, driftCloud, dropAndSettle, (tl, object, at) => dropAndSettle(tl, object, at, false, 1, true), shelveBook]) for (const seek of [0, .25, .6, 1]) {
    const group = new Group()
    group.position.set(.35, .5, -.2)
    group.rotation.set(.1, .2, .3)
    group.scale.set(.7, 1.2, .9)
    const material = new MeshStandardMaterial()
    const mesh = new Mesh(new BoxGeometry(), material)
    group.add(mesh)
    group.updateMatrix()
    const rest = group.matrix.toArray()
    const timeline = gsap.timeline({ paused: true })
    const restore = animate(timeline, group, .1)
    timeline.progress(seek)
    timeline.kill()
    restore()
    group.updateMatrix()
    assert.deepEqual(group.matrix.toArray(), rest, `exact transform after interruption at ${seek}`)
    assert.equal(mesh.material, material, 'original shared material restored')
    mesh.geometry.dispose(); material.dispose()
  }
  const { Sculpt } = await server.ssrLoadModule('/src/components/world/reconstruction/modeling.ts')
  const { avatar } = await server.ssrLoadModule('/src/components/world/reconstruction/avatar.ts')
  for (const seek of [0, .3, .6, 1]) {
    const builder = new Sculpt()
    avatar(builder)
    const rig = builder.finish()
    const snapshots = []
    rig.traverse(object => { object.updateMatrix(); snapshots.push([object, object.matrix.toArray()]) })
    const timeline = gsap.timeline({ paused: true })
    const restore = seatDeveloper(timeline, rig, .1)
    timeline.progress(seek)
    if (seek === 1) for (const [object, matrix] of snapshots) {
      object.updateMatrix()
      assert.deepEqual(object.matrix.toArray(), matrix, 'seated rig returns exactly at timeline end')
    }
    timeline.kill(); restore()
    for (const [object, matrix] of snapshots) {
      object.updateMatrix()
      assert.deepEqual(object.matrix.toArray(), matrix, 'chair and person restore on skip/cleanup')
      if (object.geometry) object.geometry.dispose()
    }
  }
  console.log('PASS: chair/person choreography restores exact nested transforms on completion and interruption.')
  const time = { value: 12 }
  const source = new ShaderMaterial({ uniforms: { time }, transparent: true, depthWrite: false })
  const particle = new Points(new BoxGeometry(), source)
  const reveal = revealGroup(particle)
  assert.notEqual(particle.material, source)
  assert.equal(particle.material.uniforms.time, time, 'water/particle clock remains shared')
  assert.equal(particle.material.depthWrite, false)
  reveal.restore()
  assert.equal(particle.material, source)
  particle.geometry.dispose(); source.dispose()
  console.log('PASS: exact transforms at four interruption points; material restoration; particle reveal; shared water time.')
} finally {
  await server.close()
  gsap.ticker.sleep()
}
