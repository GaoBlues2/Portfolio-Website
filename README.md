# Dao Ngoc Trung — Portfolio Website

An experimental, motion-led portfolio for **Dao Ngoc Trung**, a Fullstack Developer based in Hanoi, Vietnam. The site presents selected systems, production experience, technical capabilities, and contact information through an editorial dark interface with interactive 3D elements.

## Highlights

- Interactive Three.js hero with floating spheres and pointer repulsion
- Layered typography that lets 3D objects move in front of and behind the headline
- GSAP-powered editorial reveals and a reversible scroll-linked work carousel
- Project case studies covering decentralized rendering, GPU rental for AI, and AI-assisted 3D creation
- Responsive capability architecture across backend, frontend, data, cloud, and operations
- Reduced-motion and lower-power fallbacks
- Downloadable résumé

## Featured Work

- **Pictor Network** — decentralized 3D rendering and multi-provider GPU rental for AI, integrated with Aptos
- **Blender Agent** — an AI agent for creating and modifying Blender scenes with natural-language instructions

## Tech Stack

- React 19
- Vite 6
- Three.js and React Three Fiber
- GSAP, ScrollTrigger, and `@gsap/react`
- Modern CSS with responsive layouts and motion accessibility

## Getting Started

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Project Structure

```text
src/
├── App.jsx         # Page structure and GSAP timelines
├── HeroScene.jsx   # Interactive Three.js sphere scene
├── data.js         # Projects, experience, and capability data
├── main.jsx        # React entry point
└── styles.css      # Design system, layouts, and responsive styles

public/
└── Dao-Ngoc-Trung.pdf
```

## Performance and Accessibility

The 3D scene is loaded lazily, while motion preferences and device capabilities are used to reduce visual workload where appropriate. The interface supports `prefers-reduced-motion`, semantic section structure, and responsive layouts for desktop and mobile.

## Author

**Dao Ngoc Trung** — Fullstack Developer

Contact details and the complete work history are available on the website and in the included résumé.
