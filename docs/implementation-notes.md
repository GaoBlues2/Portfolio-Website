# Developer World reconstruction

The active entry is `src/App.tsx`; styles are `src/world.css`. `src/components/world/WorldScene.tsx` lazy-loads the Three.js scene. Older hero/studio files are preserved but unused by the new page.

## Configuration and generated assets

`src/components/world/reconstruction/config.ts` contains the orthographic camera, lighting, bloom and material color palette. Camera defaults are inferred from the 2D reference, not recovered source-camera metadata. An explicit reset restores them; orbit is opt-in.

All active 3D assets are authored in source; no bitmap is used as a substitute for the main scene:

| Source | Assets |
| --- | --- |
| cabin.ts | Gabled shell, individual roof tiles/turf, shelf/books, desk, two monitors, keyboard, cup, lamp, wall code panels |
| avatar.ts | Cross-section clothing, bent limbs, shoes/laces, head/hair/headphones, chair/backrest/arms/wheels |
| terrain.ts | Tiered island, path, terrace, waterfall ribbon and flow shader, pool/foam/ripples |
| nature.ts | Grass blades, plants, tapered rocks, tree/trunk/crowns, extruded cloud, small flowers |
| signs.ts | Four beveled arrow boards, posts, text textures and click destinations |
| miniatures.ts | Laptop, stacked layers, briefcase, profile figure, contact rocks/flag tower |
| modeling.ts | Material caching, geometry construction, batching and deterministic random helper |
| Post.tsx | RenderPass, controlled bloom, OutputPass |

Canvas textures are generated locally for IDE screens, keyboard keys, code panels and sign lettering. They carry no external asset/license dependency. Existing `public/studio` assets are not loaded by the reconstruction.

Static geometry is batched by material. DPR is capped at 1.5. Main animation suspends outside viewport/document visibility and for reduced motion; miniatures use demand rendering. The Three module remains large (~253 KB gzip). No 60/30 FPS claim has been measured on target hardware.

## Run and check

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5174
npm run build
npx eslint src/App.tsx src/components/world
```

Use Node 22.12+ or another version supported by Vite 8. Local Node 22.8 emitted a version warning, though the build passed.

Full `npm run lint` also checks older unused components and currently fails in GridScan, Magnet, Shuffle and PixelSnow. The new App and world files pass scoped ESLint. R3F's intentional imperative mutations of cameras/shader uniforms have an explained local exemption from React's immutability rule.

For visual QA use the 1074 × 1508 reference view before enabling orbit. Compare to `docs/comparisons/reference-vs-render.png`; see `docs/visual-comparison.md` for honest visual limitations and tested behavior. `scripts/compare-reference.swift` creates side-by-side, overlay and difference files from two equal-size PNGs.

Project/career/contact content is still pending verified user data. Buttons open honest placeholder content rather than invented project links or contact destinations.
