# Intro motion update — 2026-11-15

- Advance the paused GSAP timeline from R3F before camera projection and postprocessing. Cap each render's timeline increment at 1/30 second (before mobile speed scaling) so a delayed frame cannot consume the camera orbit. Skip/cleanup still seek to the exact final transforms.
- Move the front-facing target down to include the island and signs; start zoom at 90% of the resting zoom, preserving the original final composition.
- Overlap the camera orbit with final assembly, using sine easing over 1.25 timeline seconds. Reveal the cloud only after the orbit completes. Reduce cloud travel and drift duration to 0.85 seconds.
- Reveal all six hero-copy blocks progressively from top to bottom throughout assembly. Each block fades/slides for 1.05 timeline seconds; stagger is calculated from the final 3D tween so the CTA finishes at exactly the same boundary as the scene. Navigation reveals earlier. Nominal desktop intro remains 4.45 seconds after loader dismissal; mobile uses the existing 1.8× speed.
- Replace simulated percentage updates with an indeterminate CSS loader and short ready fade. This removes misleading progress; it does not eliminate the cost of constructing/compiling the 3D scene.

Validation:

- `npm run build`: passed (existing Node version / large bundle warnings).
- `node scripts/test-awakening.mjs`: passed camera continuity, exact final camera, transform/material restoration, chair/person choreography and shader uniform tests.
- Chrome headed, desktop 1440×900: loader dismissed at 3.23 seconds from navigation; intro done at 7.77 seconds (~4.54 seconds animation).
- Mobile viewport 390×844: loader dismissed at 2.00 seconds; intro done at 4.65 seconds (~2.65 seconds animation).
- Reduced motion and early Skip: intro completes, loader removed, root no longer inert, Projects dialog opens. All four browser runs had zero page errors.
- Recorded desktop video at 25 fps and reviewed overview sheets plus consecutive orbit frames. Signs/waterfall remain inside the composition, cloud is clear of copy, and orbit progresses continuously. This is visual QA, not a measurement of 60 fps rendering performance.
