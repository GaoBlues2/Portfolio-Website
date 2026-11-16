import { Vector3 } from 'three'
import { referenceCamera as config } from '../reconstruction/config'

// Keep the whole island in frame while facing the facade.
const cabinFocus = new Vector3(.35, 1.5, .25)
const restPosition = new Vector3(...config.position)
const restTarget = new Vector3(...config.target)
const offset = restPosition.clone().sub(restTarget)
const radius = offset.length()
const finalYaw = Math.atan2(offset.x, offset.z)
const finalElevation = Math.asin(offset.y / radius)

/** Allocation-free orbit: a straight-on cabin view to the exact saved camera. */
export function sampleEntranceCamera(progress: number, position: Vector3, target: Vector3) {
  const t = Math.max(0, Math.min(1, progress))
  if (t === 1) {
    position.copy(restPosition)
    target.copy(restTarget)
    return
  }
  target.copy(cabinFocus).lerp(restTarget, t)
  const yaw = finalYaw * t
  const elevation = finalElevation * t
  const horizontal = radius * Math.cos(elevation)
  position.set(
    target.x + horizontal * Math.sin(yaw),
    target.y + radius * Math.sin(elevation),
    target.z + horizontal * Math.cos(yaw),
  )
}
