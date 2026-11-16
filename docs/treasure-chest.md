# Developer’s Treasure Chest

Projects now uses a hollow low-poly chest on the existing miniature island. The lid is a separate group hinged at the rear edge (`[0, .65, -.36]`); only its X rotation opens it. The existing miniature camera stays fixed.

`ProjectGallery` owns the GSAP opening/reverse timeline. Its shared numeric pose drives the R3F chest, lock lighting and particles. HTML project cards emerge from the miniature bounds, spread into separate slots, then settle into a responsive gallery. Closing resets the pose, restores body scrolling and returns focus to the trigger. Repeated close calls are ignored; timelines are reverted on cleanup. Idle rendering pauses offscreen and when the document is hidden.

The gallery uses native dialog semantics for focus containment and Escape handling, with Tab and arrow-key navigation, reduced-motion completion, and skip controls for both directions. Project details are native buttons and readable HTML, accessible independently of WebGL.

Content is drawn from the supplied brief, with collaborative contribution wording. Product imagery, unprovided demo links, metrics and detailed architecture claims have not been fabricated.

## Validation

- Production TypeScript/Vite build passed.
- Visually inspected closed chest, rear-hinged open lid and full gallery in the local browser.
- Verified project detail expansion, Escape, focus restoration, opening/closing skip and arrow-key navigation.
- Repeated opening and closing worked; browser error log was empty.
- Checked responsive two-column and single-column layouts through browser viewport overrides and rendered DOM measurements. The browser's narrow-viewport screenshot capture had an offset artifact, so phone screenshot verification remains limited.
- Reduced motion is implemented but was not emulated in the browser session.
- Build reports the environment's Node 22.8/Vite version warning and a large 3D chunk warning.

Screenshots: `treasure-chest-closed.png`, `treasure-gallery-open.png`.
