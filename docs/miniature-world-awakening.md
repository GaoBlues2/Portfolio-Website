# Miniature World Awakening

The sequence is now: fullscreen 0–100% preparation loader → immediate 3D assembly → hero text → header/menu. HTML content is initially hidden without collapsing its layout, and inert until the sequence completes. Skip Intro remains outside the inert page and works before the lazy 3D module resolves. The old code-symbol boot visual and “Awakening my world” caption have been removed.

## Timeline

`WorldScene.tsx` owns one paused GSAP timeline per mounted hero. It starts after the procedural scene, shader programs, and document fonts are ready. The percentage loader runs during preparation without gating the module load. Scene readiness allows it to reach 100%; dismissing it starts the prepared timeline directly, with the former 0.5-second boot delay removed.

| Label | Desktop time | Work |
| --- | --- | --- |
| preparation | Before timeline | Fullscreen percentage loader; wait for shader/font readiness |
| terrain | 0–1 s | Foundation, terrace, decorations |
| construction | 1–2 s | House, roof, desk, shelves, monitors and code |
| awake | 2–3 s | Characters, vegetation, water, particles and signs |
| books | 1.85–3.56 s | Slide individual books into each shelf, left to right and bottom to top |
| chair + character | 1.85–4.11 s | Chair slides in, spins 360°, then catches the falling character; both settle |
| camera + copy | 4.45–5.55 s | Orbit and pull back from a front-facing cabin close-up while revealing hero text, skills and CTAs |
| menu | 5.6–6.15 s | Reveal header/menu, then remaining sections |

Mobile uses 1.8× timeline speed, smaller displacement and a gentler 12% close-up (22% on desktop). The camera starts directly in front of the cabin, looking along its facade normal. After assembly it follows a deterministic spherical arc back to the exact original isometric position, target, responsive zoom and framing. Reduced motion bypasses the intro. Content layout is reserved throughout; scroll is locked until completion or skip. Secondary canvases mount after completion.

## Ownership and restoration

- `Sculpt.part()` introduces named identity groups without modifying baked vertices or final parent transforms.
- `entrance/awakening.ts` snapshots positions and original material references. Hero-only material clones prevent changes leaking into other canvases. Water and particle shader uniforms keep their shared clock.
- `useGSAP` scopes DOM animation and kills/reverts its timeline on cleanup. The controller belongs to `App` and survives ordinary rerenders. Strict Mode cleanup cancels pending preparation and restores the scene before setup runs again.
- Skip, completion, and reduced-motion changes converge on an idempotent finish operation. It restores the camera and construction transforms and enables existing sign interactions.
- Scene errors dismiss the boot through the error boundary. A 20-second watchdog removes the intro if preparation stalls; hidden content is restored in either case.

## Validation

- `npm run build`
- `node scripts/test-awakening.mjs`: exact matrix restoration after four interruption positions, original materials restored, particle inclusion, and shared water shader time.
- Inspected desktop and 390px mobile previews in-browser; exercised early skip and About dialog open/close without replay; no runtime shader errors observed.
- Temporary browser QA measured zero layout shift. Timing in the embedded browser includes cold shader compilation and is not a controlled hardware performance benchmark. The animation timing begins after the percentage loader completes, not at navigation start.

Changed production files: `App.tsx`, `world/WorldScene.tsx`, `world/entrance/*`, and reconstruction helpers `modeling.ts`, `terrain.ts`, `cabin.ts`, `avatar.ts`, `cat.ts`. IntroLoader replaces the removed AwakeningBoot component.

Hero identity reveal: “HI, I’M” and “Trung Dao” appear after the foundation settles (0.6 seconds after assembly starts). The role, description, skill cards and CTAs wait for the camera-return label; the header/menu follows. Identity is excluded from the later reveal so it never fades out or replays.
