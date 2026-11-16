import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import './HeroSection.css'
const HeroScene = lazy(() => import('../hero/HeroScene'))
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <div className="studio-loading">A space for ideas.</div> : this.props.children }
}
export function HeroSection() {
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [rotation, setRotation] = useState(0)
  const section = useRef<HTMLElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (section.current) observer.observe(section.current)
    return () => observer.disconnect()
  }, [])
  return <section ref={section} id="top" className="studio-hero" aria-labelledby="hero-title">
    <div className="studio-scene" role="group" aria-label="Interactive sculpture studio. Drag the flower to rotate it, or use the rotation buttons.">
      <SceneBoundary><Suspense fallback={<div className="studio-loading">Building a world<span>...</span></div>}><HeroScene paused={paused || !!reducedMotion || !visible} rotation={rotation} /></Suspense></SceneBoundary>
    </div>
    <div className="studio-grain" aria-hidden="true" />
    <header className="studio-header">
      <h1 id="hero-title"><a href="#top">Ethan</a></h1>
      <p>Fullstack developer,<br className="mobile-break" /> creative technologist</p>
      <nav aria-label="Main navigation"><a href="#projects">Work</a><a href="#about">About</a><button onClick={() => setToolsOpen(p => !p)} aria-expanded={toolsOpen} aria-controls="scene-controls">Playground</button><button className="studio-more" onClick={() => setToolsOpen(p => !p)} aria-label="Scene controls" aria-expanded={toolsOpen} aria-controls="scene-controls">····</button></nav>
    </header>
    <div className="studio-intro"><h2>Driven by detail.<br />Obsessed with<br />seamless motion.</h2><a href="#projects">Scroll down</a></div>
    <div id="scene-controls" className={`studio-interaction${toolsOpen ? " is-open" : ""}`} inert={!toolsOpen}><span>DRAG THE SCULPTURE TO EXPLORE</span><div>
      <button aria-label="Rotate sculpture left" onClick={() => setRotation(r => r - .3)}>←</button>
      <button aria-label="Rotate sculpture right" onClick={() => setRotation(r => r + .3)}>→</button>
      <button aria-label={paused ? 'Play animation' : 'Pause animation'} aria-pressed={paused} onClick={() => setPaused(p => !p)} disabled={!!reducedMotion}>{paused || reducedMotion ? '▷' : 'Ⅱ'}</button>
    </div></div>
  </section>
}
