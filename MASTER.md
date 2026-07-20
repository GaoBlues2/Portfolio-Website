# Dao Ngoc Trung — Portfolio Design System

## Direction

**Visual thesis:** A dark, bold experimental portfolio with near-black surfaces, an electric-lime accent, oversized soft-geometric typography paired with technical monospace, spacious 8px rhythm, and generously rounded layered components defined by quiet borders. The final contact chapter is the sole paper-sage light surface, creating a decisive visual destination for the primary conversion moment.

**Interaction thesis:** Energetic motion from 120–450ms, restrained translate/border hover feedback, GSAP scroll reveals and subtle parallax, plus an autonomous field of matte Three.js spheres drifting at mismatched frequencies in front of and behind the hero headline; a soft local pointer force nudges nearby spheres outward before a damped return, with no excessive bounce or effects that interfere with reading.

## Design tokens

### Color

- Ink 950 / page: `#080A08`
- Ink 900 / raised surface: `#0F120F`
- Ink 800 / card: `#151915`
- Ink 700 / strong border: `#2C342C`
- Ink 600 / border: `#222922`
- Paper 50 / primary text: `#F2F5EF`
- Paper 300 / secondary text: `#B7C0B4`
- Paper 500 / quiet text: `#818A7E`
- Signal / primary accent: `#C8FF3D`
- Signal dark: `#8CB817`
- Cyan / secondary accent: `#64E7E0`
- Success: `#62E698`
- Warning: `#F6C85F`
- Error: `#FF6B6B`
- Info: `#64E7E0`

All body copy uses Paper 300 or brighter on Ink 950. Signal is reserved for focus, calls to action, and small proof markers.

### Typography

- Display/heading: `Space Grotesk`, `Helvetica Neue`, sans-serif
- Body: `DM Sans`, `Helvetica Neue`, Arial, sans-serif
- Mono: `Space Mono`, `SFMono-Regular`, Consolas, monospace
- Display: `clamp(4rem, 11.5vw, 10.5rem)`, 800, 0.82 line-height, -0.07em tracking
- H1 support: `clamp(2.4rem, 5vw, 5rem)`, 750, 0.94, -0.045em
- H2: `clamp(2.25rem, 5.8vw, 5.4rem)`, 750, 0.94, -0.05em
- H3: `clamp(1.25rem, 2.2vw, 1.8rem)`, 700, 1.1, -0.025em
- Body lead: `clamp(1.1rem, 1.6vw, 1.4rem)`, 400, 1.5
- Body: `1rem`, 400, 1.65
- Small: `0.875rem`, 400, 1.55
- Caption/overline: `0.72rem`, 700, 1.2, 0.12em tracking, uppercase

### Spacing

- Base unit: 8px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192px
- Page gutter: `clamp(20px, 4vw, 64px)`
- Section rhythm: `clamp(96px, 14vw, 192px)`
- Content max-width: 1440px
- Reading width: 720px
- Grid: 12 columns desktop, 6 tablet, 4 mobile

### Shape, border, elevation

- Radius small: 10px
- Radius medium: 18px
- Radius large: 30px
- Radius pill: 999px
- Default border: 1px Paper 50 at 11% opacity
- Strong border: 1px Paper 50 at 16% opacity
- Low elevation: none; use border/color separation
- Medium: `0 20px 80px rgba(0,0,0,.28)`
- High: `0 32px 120px rgba(0,0,0,.42)`
- Texture: very low-opacity grid and noise-like CSS pattern

### Components

- Primary button: Signal background, Ink text, 48px minimum height, pill radius, arrow shifts 4px on hover
- Secondary button: translucent surface, quiet border, Paper text, pill radius
- Cards: softly layered Ink 900/800 gradient, quiet border, 18–30px radius, asymmetric content grid
- Contact chapter: singular Paper/Sage light panel with Ink text, concentric system rings, and light contact rows that invert to Ink on hover
- Navigation: floating translucent horizontal pill across the top on desktop, with a compact always-visible variant on mobile
- Selected work: four full-width project cards form a page-scroll-driven GSAP stack above 1024px; incoming cards rise from below while earlier cards retain a slim visible edge, with static two-column/list fallbacks for reduced motion and smaller screens
- Timeline: vertical system log with status index, period, company, role, and selected outcomes
- Tags: mono, uppercase, outlined pill, never the primary signal
- Focus: 2px Signal outline, 3px offset

### Motion

- Quick: 120ms
- Standard: 240ms
- Slow: 450ms
- Hero reveal: 800ms one-time dramatic sequence
- Signature easing: `cubic-bezier(0.2, 0, 0, 1)` / GSAP `power3.out`
- Ambient easing: `sine.inOut`
- Manifesto topology: 900ms one-time path draw, staggered node reveal, then a 13s continuous low-opacity data-flow dash
- Exit easing: `power2.in`
- Entrance: translateY 24–40px + opacity, staged under 500ms total stagger
- Scroll scrub: `ease: none`
- Reduced motion: disable scrub/ambient loops and render all content immediately

## Responsive behavior

- 1440+: full asymmetric hero, two-column systems cards, generous negative space
- Desktop hero: exactly one viewport high; statement and actions share a two-column support row, while proof metrics sit in the bottom system rail
- 1024–1439: retain split hero and condensed type
- 768–1023: stack 3D behind/under hero copy; timeline becomes 2-column
- 375–767: single column, visible CTAs, 44px touch targets, no hover-dependent content, static lightweight 3D fallback on reduced/low-end mode

## Accessibility and performance

- WCAG AA contrast for text
- Semantic landmarks and heading order
- Visible keyboard focus, skip link, 44px mobile targets
- Decorative WebGL is hidden from assistive technology
- Decorative manifesto SVG is hidden from assistive technology and its ambient flow is disabled by `prefers-reduced-motion`
- `prefers-reduced-motion` disables GSAP and continuous Three.js motion
- WebGL DPR clamped to 1.5; no models/textures, no post-processing, low draw-call scene
- Hero depth field uses two low-draw-call instanced sphere meshes that sandwich the real HTML headline; each sphere follows a deterministic multi-frequency drift and receives a lightweight proximity-based pointer displacement with a slower damped return
- All UI movement uses transforms and opacity
