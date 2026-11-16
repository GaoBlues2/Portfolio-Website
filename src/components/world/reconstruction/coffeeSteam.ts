import { DoubleSide, Mesh, PlaneGeometry, ShaderMaterial } from 'three'

export function coffeeSteam() {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
    uniforms: { time: { value: 0 }, strength: { value: 0 } },
    vertexShader: `
      varying vec2 steamUv;
      void main() {
        steamUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float strength;
      varying vec2 steamUv;
      void main() {
        float h = steamUv.y;
        float drift = sin(h * 9.0 - time * 1.5) * (0.025 + h * 0.12);
        float width = mix(0.025, 0.085, h);
        float a = (steamUv.x - 0.41 - drift) / width;
        float b = (steamUv.x - 0.59 - sin(h * 11.0 - time * 1.3 + 2.0) * h * 0.12) / (width * 0.8);
        float wisps = exp(-a * a) + exp(-b * b) * 0.65;
        float fade = smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.4, 1.0, h));
        float flow = 0.7 + 0.3 * sin(h * 16.0 - time * 2.2);
        gl_FragColor = vec4(0.88, 0.93, 0.94, wisps * fade * flow * 0.3 * strength);
      }
    `,
  })
  const mesh = new Mesh(new PlaneGeometry(.27, .55), material)
  mesh.name = 'coffee-steam'
  mesh.position.set(0, .19 + .55 / 2, 0)
  mesh.raycast = () => {} // Decorative steam must not intercept interactions.
  return { mesh, material }
}
