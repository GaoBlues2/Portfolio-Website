# Reference reconstruction — analysis and pre-edit audit

Date: 2026-11-13. Reference: user-supplied 1074 × 1508 PNG. This audit was written before editing the scene for this reconstruction pass. The screenshot, not the earlier speculative spec, determines visible design. The previous implementation is in `WorldScene.tsx`; its screenshot is `docs/developer-world-preview.png`.

## 1. Image coordinates and composition

Coordinates below are approximate pixel measurements from the supplied image, with origin at upper left. Observed: browser-style frame x7–1070, y10–1500; dark toolbar y13–55; header logo x54/y80, navigation x417–722/y88, CTA x865–1043/y68–110. Main copy x53–443/y188–617. The main diorama occupies x435–1070/y115–819, overlapping vertically with the world heading x53/y757. Main roof ridge approximately (680,136)–(800,116); front left eave (595,235), right eave (852,276). Main grass platform approximately x444–1070/y450–780. Cloud x462–599/y148–235. Tree crown x912–1056/y140–270. Four signboards x881–1056/y318–580. Waterfall x593–676/y560–703; pool x560–714/y682–742. Bottom detached rock x705–785/y765–817.

The hero is not a balanced 50/50 grid. The illustration is larger and overlaps the right portion of the first two sections. The world heading starts before the illustration's bottom edge. Four cards have separate miniature 3D objects at y876–1030. Contact scene is a different rocky beacon composition, not a second copy of the hero.

## 2. Spatial model: observations vs assumptions

**Observed:** almost parallel desk edges and near-uniform front/back scale, top planes visible, front facade and right cabin wall visible, relatively little perspective convergence. Front verticals remain approximately vertical. Front desk edge descends to screen-right. Roof slope and gable silhouette are essential. Reference has one contiguous irregular landmass, one waterfall notch, a winding descending path, and detached rocks, not five separated rectangular pads.

**Inference to test with renders:** orthographic camera is the best initial fit. Camera azimuth about +25–32 degrees from +Z, elevation about 24–30 degrees. World X is facade horizontal, Y up, +Z out from workstation. Cabin front facade at z=-0.45, right wall extends toward negative Z; desk z=0.0, seated person z=0.9. Roof ridge along Z, height about 4.3, eaves about 3.3. Main bounding volume roughly x[-3,3.5], y[-1.8,4.5], z[-2.1,3.0]. No physical dimensions or hidden geometry can be recovered uniquely. All numeric scene dimensions and camera values are estimates, refined against projection.

Initial camera configuration is centralized; it will be locked at the reference view unless exploration is explicitly enabled. No automatic orbit or float shifts the default silhouette.

## 3. Object inventory and required corrections

| Object | Reference | Current | Difference | Required fix | Priority |
|---|---|---|---|---|---|
| Main terrain | Contiguous stepped irregular rocky island; grass only on exposed patches | Flat rectangular central base plus four satellites | Wrong silhouette and topology | Hand-authored terrain cells, different elevations, waterfall notch, path peninsula | P0 |
| Cliff strata | Blue-gray and brown beveled stones with broken edges | Uniform extruded blocks | Flat Minecraft-like repetition | Asymmetric chamfered rock meshes with varied depth, colors and layered joints | P0 |
| Foreground peninsula | Long curved path, lower grass ledge and broad pale end step, bottom-right | Laptop satellite | Wrong object and placement | Connected right terrace and winding stone path | P0 |
| Cabin facade | Tall warm olive gabled wall; workstation against it | Short wide wall, roof cuts into interior | Wrong proportions | Taller gable custom extruded silhouette; full front visibility | P0 |
| Cabin right side | Visible green wall with inset dark window, supports and ivy | Missing | Large empty region | Add side wall, inset window frame, boards and vegetation | P1 |
| Roof | Full pitched slate roof, individual overlapping rectangular tiles, thick fascia | Half roof with longitudinal strips | Wrong roof silhouette and tile direction | Full two-plane tiled roof; correct eaves/ridge and tile offsets | P0 |
| Roof grass | Irregular dense lime turf patch on upper right slope, hanging blades | Missing | Distinctive missing silhouette | Individual curved blades with uneven heights and drooping edges | P1 |
| Code sign | Large luminous </> black/olive panel below gable, lime halo | Small hidden geometry | Scale/readability/glow wrong | Thick beveled frame and crisp emissive original symbol texture | P0 |
| Wall lamp | Black bent bracket and shade, warm white bulb at upper right of desk | Point light only | Visible fixture absent | Curve bracket, tapered shade, bulb, local warm light | P1 |
| Left bookshelf | Three brown shelves and upright supports, visible books and small props | Tiny narrow cubby | Too small and wrong plane | Tall broad shelf left of desk, assorted books, jars, small hanging panel | P0 |
| Books | Different heights, lime/yellow/teal/red spines on shelves and top | Identical bars | Repetition and proportions | Individually arranged spines, pages, spine marks and leaning books | P2 |
| Green shelf panel | Glowing square panel low on bookshelf behind chair | Missing | Light source/detail absent | Framed luminous lime graphic | P1 |
| Desktop | Warm substantial wood slab, slight bevel, visible front/right edge | Pale slab | Desaturated, lacks depth | Warmer walnut/honey top, darker edge and metal legs | P1 |
| Dual monitors | Two dark screens facing viewer at slight different angles, code panels, symbol on left | Identical flat white lines | Wrong content, lighting and angle | Original drawn IDE textures; dark bezels, stands, subtle reflection | P1 |
| Keyboard / mouse / mat | Gray keyboard on black mat, mouse near right hand | Small white slab, no mouse | Missing recognizable details | Individual key texture, mat, shaped mouse | P2 |
| Mug / desk ornament | Small blue cup/rounded blue ornament at desk right | Missing | Missing desk silhouette | Lathed cup and handle, small base and rounded cap | P2 |
| Desktop plant | Small green plant in dark pot at far right | Small generic plant | Incorrect foliage silhouette | Curved tapered leaves and sculpted pot | P2 |
| Floor planter under desk | Wooden cuboid planter with green foliage at right | Missing | Missing local detail | Add open-topped planter and leaf blades | P2 |
| Chair | Black wheeled office chair, lime center upholstery, curved back, armrests | Rectangular green block | Major placeholder silhouette | Extruded shaped back, separate padded inset, arms, five spokes and wheels | P0 |
| Seated developer | Purple hoodie, large dark-haired head, headset, bent elbows, knees and sneakers; back/side view | Box torso and rod limbs | Major placeholder anatomy | Custom tapered body sections, curved bent sleeves/trousers, sculpted hair locks, head/ear/nose, hoodie seams | P0 |
| Headphones | Thick black/blue headband and visible right earcup | Two balls | Wrong shape | Curved headband, layered elliptical earcups | P1 |
| Shoes | Brown/dark uppers, pale sole, visible right shoe facing right | White boxes | Wrong shape and pose | Extruded rounded sole profile and shaped upper/laces | P1 |
| Floor paving | Irregular gray stone tiles underneath chair, edge drops at waterfall | Wide contrasting timber stripes | Wrong material | Hand-cut beveled paving pieces with joints | P0 |
| Signpost | Four dark arrow-shaped boards on two wood stakes, bright lime borders, visible text | Completely absent | Largest missing right-side feature | Extruded arrow boards, raised frames, textures, four accessible hit targets | P0 |
| Tree | Large irregular lobed green crown, forked brown branches, small lower foliage clusters | Four angular spheres on a cylinder | Wrong canopy and trunk shape | Custom branching curves, low-frequency irregular lobed crown clusters | P1 |
| Cloud | One blue-gray puffy cluster left of roof | Two tiny pale clouds | Wrong count, size, color, placement | One custom curved silhouette extrusion, behind shelf/roof | P1 |
| Waterfall | Wide translucent cyan sheet curling over stone lip, white streaks and foam | Parallel straight cylinders | Wrong flow silhouette | Curved ribbon mesh with varying width, highlights along surface and foam at lip/base | P0 |
| Pool | Dark blue reflective water beneath waterfall, irregular ripples and foam | Flat cyan disk | Wrong opacity and surrounding tone | Irregular thin pool mesh, layered ripple curves and small foam patches | P1 |
| Left side pedestal | Small rock slab with green plant and books | Absent | Missing stepped silhouette | Paving pedestal, planter, tilted books | P2 |
| Lower left turf ledge | Small floating-looking connected block with plant and tiny colorful items | Absent | Missing front-left feature | Secondary small terrace, sprout and tiny books/stone | P1 |
| Grass tufts | Sparse at edges, dense roof patch; irregular flat blades | Two regular rows of cones | Wrong density and shape | Curved blade BufferGeometry, deterministic irregular patch placement | P1 |
| Tiny flowers/mushrooms | Purple/pink and yellow small clusters on front terraces | Rocks only | Missing color accents | Small petal/cap forms only where visible | P2 |
| Loose rocks | Multiple asymmetric gray rocks at left, pool and bottom | Two regular dodecahedra | Wrong count and silhouette | Individually scaled chamfered rock meshes | P2 |
| Stepping path | Curving pale slabs descending from signpost to lower right | Sine row of tiny rectangles | Wrong breadth and route | Mesh path ribbon divided into thick irregular stones | P0 |
| Shelf/cabin ivy | Tiny green details on edges and wall | Absent | Missing microstructure | Small leaves at observed edges; do not invent hanging vines | P2 |
| Server racks / isolated terminals | Not present in reference hero | Four prominent server/monitor satellites | Invented content | Remove entirely from reference hero | P0 |
| Beacon in main hero | Not present; beacon belongs in bottom contact scene | Large hero foreground beacon | Wrong content | Remove from hero; reconstruct separate contact decoration | P0 |
| Floating hotspot labels | Not present in image | Five pills overlaying cabin | Occlude key details | Remove default pills; use actual signboard hit areas and optional exploration controls | P0 |
| Cards | Laptop, layered stack, briefcase, lime bust on thick grassy tiles | Flat line SVG icons | Wrong silhouette/material | Actual miniature 3D models rendered independently on demand | P1 |
| Bottom contact rocks | Asymmetric stone outcrops, grass tops, central short beacon tower, flag | CSS plank/flag | Wrong geometry | Separate procedural 3D contact composition | P1 |
| Layout/type | Compact 1074×1508 page, title/role copy as image, world below hero | Longer editorial sections, different copy, spacing and labels | Large overall composition mismatch | Reference layout at target viewport; retain detailed content behind navigation | P0 |

## 4. Materials: initial fitted values (inferred, not measured ground truth)

| Material family | Base color target | Roughness | Metalness | Emission / transparency | Surface/shadow notes |
|---|---|---:|---:|---|---|
| Turf | #72A821 / #92C52A | .95 | 0 | none | Darker roots/edges; scattered blades cast soft occlusion |
| Stone | #4D5D68 / #667078 | .9 | 0 | none | Beveled faces; brighter tops, blue-gray shadow faces |
| Soil | #65513B / #806546 | 1 | 0 | none | Separate brown layer under grass |
| Roof slate | #354451 / #465668 | .82 | .04 | none | Individual overlapping tiles, dark grooves |
| Cabin plaster | #77794B / #5D7352 | .93 | 0 | none | Warm front from lamp, cool exterior side |
| Wood | #946A3B / #63482C | .78 | 0 | none | Soft edge highlights and subtle grain |
| Monitor bezel/chair | #172029 | .45 | .12 | none | Dark readable silhouettes, limited specular |
| Screen | #111521 | .38 | .05 | colored original IDE texture, .5–.9 | Remain dark, no white striped washout |
| Lime sign edges | #B5F52B | .48 | .05 | intensity 1–2.5 | Narrow bloom only on intentional emitters |
| Hoodie fabric | #414A78 | .96 | 0 | none | Smooth folds and seams, dark cavities |
| Skin | #C5956A | .8 | 0 | none | Warm local illumination |
| Water | #49B1CF | .18 | .1 | opacity .65–.85, pale streaks | Dark pool, white foam, broad curved fall |
| Tree leaves | #3F702F / #5C8A38 | .92 | 0 | none | Round irregular lobes, shaded interior |
| Cloud | #779EAA | .96 | 0 | none | Cool upper-left rim, green-gray lower right |

## 5. Lighting diagnosis

Reference: soft cool key from upper-left/front, warm local desk lamp, lime glow on gable sign/boards and shelf panel, dark green-black ambient background. Strong contact shading under objects and at cliff joints. Current: ambient + hemisphere + two high-intensity directional lights flatten all surfaces, bleaching grass and wood; little contact shading. Required: reduce fill, separate cool key from warm lamp, use one soft shadow-casting key, restrained emission/bloom, consistent ACES exposure. Do not apply global haze/vignette to conceal silhouette errors. No baked texture or normal-map details can be inferred exactly.

## 6. Validation plan

Keep a 1074×1508 full-page reference layout and a hero-only calibration view. Save each observed screenshot, crop the same hero region, produce side-by-side and overlay. Compare: (1) cabin/roof silhouette, (2) seated person and desk scale, (3) terrain/path/waterfall edge, (4) signs/tree, (5) lighting/material balance. Metrics, if available, are supporting diagnostics; full-page SSIM is strongly biased by matching black background and text and must not be reported as a 3D fidelity score. Inventory differences and remaining uncertain microdetails honestly.
