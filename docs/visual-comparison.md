# Reference reconstruction — visual verification

Status: implemented and visually iterated; **not a pixel-accurate match**. The current render still fails the strict requirement that every noticeable shape and detail match the reference. Do not interpret a successful build as visual acceptance.

## Reference and capture

Reference: `~/Downloads/option-c-developer-world.png`, visually verified as the supplied 1074 × 1508 screenshot. The original temporary clipboard path disappeared during the session; the Downloads copy was used for the comparison artifacts.

Desktop DOM viewport: 1074 × 1508. Browser capture output included extra blank pixels at right/bottom. `scripts/crop-comparison.swift` extracts the top-left 1074 × 1508 without scaling, warping, or changing the rendered content. Captures are actual browser WebGL output, not a generated mockup.

- `comparisons/final.png`: latest rendered page.
- `comparisons/reference-vs-render.png`: reference left, render right, equal dimensions.
- `comparisons/overlay.png`: 50% reference/render overlay.
- `comparisons/difference.png`: absolute channel difference using CoreGraphics difference compositing. This is diagnostic, not a similarity score.
- `comparisons/round-01.png` through `round-03.png`: intermediate renders.

No SSIM, LPIPS, or percentage accuracy is claimed.

## Iterations

| Round | Largest observed deviations | Changes made |
| --- | --- | --- |
| 1 | Unreadable sign text; excessive emission; tall blank gable; scene too low; contact section too low | Moved lettering in front of board bevel; reduced bloom; lowered roof ridge; moved assembly; corrected vertical spacing |
| 2 | Flat faceted foliage; harsh light; black rectangular canvas edge; visible shadow acne; rigid waterfall/pool | Welded foliage normals; adjusted key/fill; matched background and softened canvas boundary; corrected miniature shadow bias; added fading transparent pool |
| 3 | Character orientation; repeated rectangular contact cliffs; flat cylindrical rocks; stepping path; roof grass too thin | Rotated/scaled character; rebuilt contact cluster; added tapered custom rock geometry; widened path sections; thickened roof vegetation |
| 4 | Custom rock side winding caused missing surfaces | Corrected winding, rendered again, generated final comparison |

## Remaining deviations, by priority

1. **Character and chair:** silhouette, seated pose, clothing folds and face proportions still differ. The head and chair are not the sculpted source asset. This is an implementation fidelity gap, not proof that reconstruction is impossible.
2. **Island and path:** the procedural cell perimeter is too regular. Reference cliff faces have larger, differently arranged broken blocks, a wider right peninsula and irregular material transitions. Individual pebbles/grass clumps do not correspond one-for-one.
3. **Cabin:** roof pitch, tile layout, shelf spacing, monitor and desk projection still differ. The lamp is darker than reference. Roof grass looks more like narrow blades than the thick hanging tufts in the source.
4. **Lighting:** the reference has softer ambient occlusion, richer reflected light and glow. Current PBR/shadow/bloom setup is simpler; no baked indirect illumination or AO map is used. Avoid raising bloom to hide these differences.
5. **Water:** flow is a modeled ribbon with a shader; foam and splash geometry remain less organic than reference.
6. **Cloud, tree, miniatures and contact:** simplified surfaces, different small silhouettes and missing fine texture. The bottom landscape is too sparse and lacks the reference's continuous rolling grass/wire-like highlight field.
7. **Typography:** live Arial text and SVG icons approximate the raster typography but are not exact. Text baseline, weight and button proportions retain small offsets.

A single image leaves hidden surfaces, true dimensions and lighting unconstrained. Those parts are explicitly inferred. Visible differences above should still be reduced through further asset sculpting and landmark fitting; they should not be excused merely by the lack of source models.

## Behavior verified

- Projects CTA opens the correct native modal.
- Escape closes modal and restores focus to View Projects.
- Exploration exposes controls; pause changes to Resume water; reset exits exploration.
- Mobile layout checked at actual DOM width 480 px, with no horizontal overflow; mobile navigation opens/closes.
- Six canvases render; browser error log empty during tested flows.
- Scene sign picking is implemented with Three.js event raycasting; no automated raycast-click assertion or physical-device FPS measurement was performed.
- Reduced-motion and out-of-view rendering controls are implemented; not hardware benchmarked.

## Follow-up: workstation intersection, 2026-11-14

Fixed the avatar's scene-origin rotation/translation that pushed the torso into the desk. Authored the chair and person directly in workstation coordinates, behind the desk front (`z=.64`), with forearms above the tabletop (`y=1.3375`). Corrected inverted triangle winding on the tailored torso mesh, which had made its outward-facing surfaces disappear.

Verified in the live browser at the default view and two orbit angles: torso/chair remain outside the desktop, forearms reach over its edge, and legs remain below. Reset restores the default camera. Browser error log was empty; build and scoped ESLint passed. Existing Node-version/chunk-size warnings remain. This fixes the reported intersection; it does not establish full reference fidelity.

Latest evidence: `comparisons/workstation-fixed.png` (close-up) and `comparisons/workstation-full.png` (viewport). Earlier final/reference comparison files predate this avatar fix.

## User-directed changes: cap, foundation and pond — 2026-11-14

The user explicitly changed the visual brief for these elements, superseding strict reference matching for them:

- Replaced swept hair tubes with a smooth backwards baseball cap, curved rear bill, crown button and fine seam. Headphones remain.
- Expanded the stone foundation through the cabin rear to z=-2.55 and beyond the chair area to z=1.97; tiled floor covers x=-2.43..0.91 and z=-2.33..1.97. The chair's rear caster is around z=1.515, leaving approximately 0.45 scene units of dry floor behind it.
- Added a separate lowered garden pond past the floor, with stone back bank and grass side banks. Pond water is y=-0.1, dry terrace top is approximately y=0.263. A visible water outlet at z=2.94 joins the waterfall; it no longer originates under the chair or inside the floor.

Verified default and side-orbit browser renders, then reset camera. Build and scoped ESLint passed; browser error log empty. Evidence: `comparisons/cap-floor-pond.png` and `comparisons/cap-floor-side.png`. Earlier reference comparisons predate these intentional changes.

## Organic pond bank — 2026-11-14

User-directed revision replaces rectangular basin and parallel turf strips with a shared Bezier outline for the submerged bed and water surface. Three staggered courses of varied pebbles follow an asymmetric bank, with loose gravel, moss, grass and small mushroom clusters in the gaps. Curved highlights replace the evenly spaced straight water lines. Spillway still connects to the existing waterfall at the same height. Implementation is isolated in `reconstruction/pond.ts`. Browser visual check and error log were clean; evidence: `comparisons/organic-pond-full.png`.

## Pond life — 2026-11-14

Added three modeled goldfish with animated heading and tail wag, five veined floating leaves and two pink layered lotus blossoms (`reconstruction/pondLife.ts`). Fish follow small deterministic elliptical routes inside the pond, away from the spillway. Water surface is translucent so fish sit physically below it; leaves and flowers are above it. Animation uses the existing elapsed-time uniform and honors pause, reduced-motion and offscreen/document visibility handling.

Browser checked with pause/resume and default-camera reset; two successive paused screenshots have identical SHA-1 `9ffc5956fcdc21f41d54b33a054cd4203c87cae8`. No browser errors. Evidence: `comparisons/pond-life.png`, `comparisons/pond-life-full.png`. Existing reference-matching limitations remain unrelated to this user-directed addition.

## Curled golden cat — 2026-11-14

Added a curled ginger cat on the user-marked dry tile next to the desk (`cat.ts`, position [.05,.265,1.18]). Modeled tucked paws, ears, muzzle, whiskers, tabby markings and a separate curled tail. Eyes blink briefly every 7.3 seconds; the tail has a 2.3-second swish window within an 11.7-second cycle. Shared scene time respects pause, reduced motion and visibility. Renamed animation control to Pause/Resume scene animation. Moved nearby mushroom/grass to avoid intersecting the cat.

Verified live default view and empty browser error log. A geometry-module check asserted eye closure/reopening, tail movement/rest, and placement. Build and scoped ESLint passed. Evidence: `comparisons/golden-cat.png` and `comparisons/golden-cat-full.png`.

## Soft tail revision — 2026-11-14

Replaced rigid tail pivot with a continuously tapered 56-segment mesh (`catTail.ts`). A smooth upward pulse bends progressively toward the tip, which follows with a short delay, then settles back to its exact rest shape. Root remains stationary; there is no whole-tail rotation. Cream tip blends into the fur instead of overlapping a second thick tube. Geometry buffers are reused, with updates skipped while resting.

Checked live render and empty browser error log. Numeric checks passed for fixed root, >0.12 tip lift during the gesture, exact return to rest and zero rigid rotation. Evidence: `comparisons/soft-tail.png`.

## Dynamic waterfall and impact — 2026-11-14

Replaced fixed vertical stripes and static ring/tube foam with advected multi-scale noise, a deformed two-layer translucent water curtain, expanding broken wave fronts, fading radial ripples and animated foam. Added 64 instanced droplets using upward launch velocity and gravity, recycling only after landing. All effects share scene time and stop for pause/reduced motion/hidden scenes. This is a real-time stylized water effect, not a full fluid simulation. New source: `reconstruction/waterEffects.ts`. Browser shader/runtime error log empty; latest screenshot: `comparisons/waterfall-dynamic.png`.

## Gentle pond overflow — 2026-11-14

User requested substantially less flow. Replaced the full-width two-layer curtain with three separated narrow streams, removed the back layer, slowed texture flow and reduced displacement, whitening and opacity. Reduced impact pool to 1.2 × 0.95, softened/slowed ripples and foam, and reduced droplets from 64 to 16 with much lower launch height and longer intervals. Shared pause/reduced-motion behavior unchanged. Evidence: `comparisons/gentle-streams.png`; browser error log empty.


### Cohesive waterfall rebuild
Replaced the three isolated ribbons with a closed, flattened water cross-section and a small separating edge filament. The inlet starts over the pond surface, then follows a curved gravity-based fall. UV travel time, rather than uniform vertical distance, advects noise and highlights so they accelerate down the sheet. GPU displacement varies width/depth without rebuilding geometry. Small GPU-instanced droplets use ballistic arcs at the impact, with localized foam and expanding fading ripples. Mobile reduces geometry and particle counts; existing pause, visibility, and reduced-motion gates still control the shared clock.

Verified in the running default isometric view: connected inlet, curved lip, continuous narrow body, aligned impact. Inspected 24 actual browser captures over approximately two seconds and a four-frame contact sheet; surface details, edge deformation and splash change between frames. Saved `comparisons/waterfall-motion.gif` (browser captures, not an offline simulation) and `waterfall-rebuilt-full.png`. This is a procedural gravity-informed effect, not a fluid solver or real environment refraction. Build and scoped ESLint passed; existing Node-version and chunk-size warnings remain.

### Connected waterfall environment revision
Replaced the isolated rock pillars and ring of pebbles with three overlapping cliff masses underneath the existing pond bed, a left talus group and smaller right outcrop. Replaced the radially masked basin with a broad horizontal water surface fading independently along its edges. Reduced circular wave contrast and kept white foam local to impact; extended a broken, view-aligned procedural reflection into the foreground. The sheet now narrows through the fall, changes thickness and spreads at impact.

Compared the running default-camera capture directly against the original reference in `comparisons/waterfall-reference-comparison.png` (reference left, current right). This exposed the initially short, sideways reflection, which was revised. The cliff connection and dark-water composition are closer; the retained fishpond rim remains rounder than the original square grassy outlet. Reflection is an art-directed shader approximation, not a mirrored scene render. UI/camera unchanged by this revision. Actual browser animation captures saved in `waterfall-environment-motion.gif`; build and scoped lint checked.
