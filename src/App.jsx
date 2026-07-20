import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { experience, projects, skillGroups } from './data.js'

const HeroScene = lazy(() => import('./HeroScene.jsx'))

gsap.registerPlugin(ScrollTrigger, useGSAP)

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  )
}

function useMotionPreferences() {
  const [preferences, setPreferences] = useState(() => ({
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lowPower: (navigator.hardwareConcurrency || 4) < 2 || Boolean(navigator.connection?.saveData),
  }))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPreferences((current) => ({ ...current, reducedMotion: media.matches }))
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return preferences
}

function SectionHeading({ index, eyebrow, children }) {
  return (
    <div className="section-heading reveal">
      <div className="section-kicker"><span>{index}</span>{eyebrow}</div>
      <h2>{children}</h2>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <article className="project-card reveal-item">
      <div className="project-card__top">
        <span className="project-index">[{project.index}]</span>
        <span className="project-label">{project.label}</span>
      </div>
      <div className="project-card__content">
        <h3>{project.title}</h3>
        <div className="project-card__details">
          <p className="project-description">{project.description}</p>
          <p className="project-proof">{project.proof}</p>
        </div>
      </div>
      <div className="project-system" aria-label={`${project.title} system scope`}>
        <span className="project-system__label mono">System scope / {project.index}</span>
        <ul className="project-system__nodes">
          {project.modules.map((module, index) => (
            <li key={module}>
              <span aria-hidden="true">0{index + 1}</span>
              <strong>{module}</strong>
            </li>
          ))}
        </ul>
      </div>
      <ul className="tag-list" aria-label={`${project.title} technologies`}>
        {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
    </article>
  )
}

function TopologyMap() {
  return (
    <svg className="manifesto-topology" viewBox="0 0 1200 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="topology-hub-glow">
          <stop offset="0" stopColor="#C8FF3D" stopOpacity="0.34" />
          <stop offset="1" stopColor="#C8FF3D" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="topology-routes">
        <path className="topology-path topology-path--quiet" pathLength="1" d="M32 176 C194 84 306 111 444 226 S729 310 862 180 S1056 113 1170 164" />
        <path className="topology-path" pathLength="1" d="M54 486 C224 388 337 535 506 432 S758 282 904 393 S1080 478 1184 404" />
        <path className="topology-path topology-path--quiet" pathLength="1" d="M205 116 C244 244 198 340 311 456" />
        <path className="topology-path topology-path--quiet" pathLength="1" d="M444 226 C518 306 512 352 506 432" />
        <path className="topology-path topology-path--quiet" pathLength="1" d="M862 180 C818 269 833 318 904 393" />
        <path className="topology-flow" pathLength="1" d="M54 486 C224 388 337 535 506 432 S758 282 904 393 S1080 478 1184 404" />
      </g>

      <g className="topology-nodes">
        <circle className="topology-halo" cx="506" cy="432" r="92" fill="url(#topology-hub-glow)" />
        <circle className="topology-node" cx="54" cy="486" r="5" />
        <circle className="topology-node" cx="205" cy="116" r="4" />
        <circle className="topology-node" cx="311" cy="456" r="4" />
        <circle className="topology-node topology-node--hub" cx="506" cy="432" r="8" />
        <circle className="topology-node" cx="862" cy="180" r="4" />
        <circle className="topology-node" cx="904" cy="393" r="5" />
        <circle className="topology-node" cx="1184" cy="404" r="5" />
      </g>

      <g className="topology-labels">
        <text x="32" y="525">PRODUCT / INPUT</text>
        <text x="522" y="465">SYSTEM LAYER / 01</text>
        <text x="1006" y="384">PRODUCTION / OUTPUT</text>
      </g>
    </svg>
  )
}

function App() {
  const root = useRef()
  const { reducedMotion, lowPower } = useMotionPreferences()

  useGSAP(() => {
    const revealTargets = gsap.utils.toArray('.reveal')
    const itemGroups = gsap.utils.toArray('.reveal-group')

    if (reducedMotion) {
      gsap.set(['.hero-line > span', '.hero-intro', '.hero-actions', '.hero-meta', revealTargets, '.reveal-item'], { clearProps: 'all', autoAlpha: 1 })
      return
    }

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTimeline
      .from('.site-header', { y: -18, autoAlpha: 0, duration: 0.45 })
      .from('.hero-line > span', { yPercent: 110, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, '-=0.2')
      .from('.hero-intro', { y: 24, autoAlpha: 0, duration: 0.45 }, '-=0.45')
      .from('.hero-actions, .hero-meta', { y: 18, autoAlpha: 0, duration: 0.45, stagger: 0.07 }, '-=0.3')

    revealTargets.forEach((element) => {
      gsap.from(element, {
        y: 36,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 84%', once: true },
      })
    })

    itemGroups.forEach((group) => {
      const items = group.querySelectorAll('.reveal-item')
      gsap.from(items, {
        y: 30,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: group, start: 'top 82%', once: true },
      })
    })

    gsap.to('.scroll-progress__bar', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: 'main', start: 'top top', end: 'bottom bottom', scrub: 0.4 },
    })

    gsap.to('.hero-scene, .scene-fallback', {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    })

    const topologyTimeline = gsap.timeline({
      scrollTrigger: { trigger: '.manifesto', start: 'top 78%', once: true },
    })

    topologyTimeline
      .fromTo('.topology-path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' })
      .from('.topology-node', { scale: 0, transformOrigin: 'center', duration: 0.35, stagger: 0.045, ease: 'back.out(1.35)' }, '-=0.52')
      .from('.topology-labels text', { y: 7, autoAlpha: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '-=0.28')

    const stackMedia = gsap.matchMedia()

    stackMedia.add('(min-width: 64rem)', () => {
      const stack = root.current.querySelector('.project-grid')
      const stackItems = gsap.utils.toArray('.project-stack-item', stack)
      const stackCards = stackItems.map((item) => item.querySelector('.project-card'))

      if (stackItems.length < 2) return

      gsap.set(stackItems, { zIndex: (index) => index + 1, force3D: true })
      gsap.set(stackCards, { scale: 1, y: 0, force3D: true })
      gsap.set(stackItems.slice(1), { yPercent: 106, autoAlpha: 0 })

      const stackTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stack,
          start: 'top 12%',
          end: () => `+=${(stackItems.length - 1) * window.innerHeight * 0.78}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      stackItems.slice(1).forEach((item, index) => {
        const activeIndex = index + 1
        const position = index
        const previousCard = stackCards[activeIndex - 1]

        stackTimeline
          .set(item, { autoAlpha: 1 }, position)
          .to(previousCard, {
            scale: 0.975,
            y: -8,
            force3D: true,
            duration: 1,
          }, position)
          .to(item, { yPercent: 0, y: activeIndex * 18, force3D: true, duration: 1 }, position)
      })
    })

    return () => stackMedia.revert()
  }, { scope: root, dependencies: [reducedMotion], revertOnUpdate: true })

  return (
    <div ref={root} className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true"><span className="scroll-progress__bar" /></div>

      <header className="site-header">
        <a className="monogram" href="#top" aria-label="Dao Ngoc Trung, back to top">DNT<span>.</span></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="header-cta" href="/Dao-Ngoc-Trung.pdf" download>Résumé <span>↘</span></a>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-grid grid-shell">
            <div className="hero-copy">
              <div className="hero-status mono"><span className="status-dot" /> Hanoi, Vietnam · Fullstack Developer</div>
              <h1 id="hero-title">
                <span className="hero-line"><span>BUILDING</span></span>
                <span className="hero-line hero-line--outline"><span>SYSTEMS</span></span>
                <span className="hero-line"><span>THAT SCALE.</span></span>
              </h1>
              <p className="hero-intro">I turn complex infrastructure into products people can actually use — from distributed rendering and GPU platforms to AI-powered learning experiences.</p>
              <div className="hero-actions">
                <a className="button button--primary" href="#work">Explore selected work <ArrowIcon /></a>
                <a className="button button--secondary" href="mailto:ethanftd@gmail.com">Start a conversation</a>
              </div>
            </div>
            <Suspense fallback={null}>
              <HeroScene reducedMotion={reducedMotion} lowPower={lowPower} />
            </Suspense>
          </div>
          <div className="hero-rail mono">
            <span aria-hidden="true">01 / INTRODUCTION</span>
            <div className="hero-meta">
              <span><b>06+</b> years shipping</span>
              <span><b>FULL</b> product stack</span>
              <span><b>AI</b> integrated systems</span>
            </div>
            <span aria-hidden="true">SCROLL TO TRACE THE SYSTEM</span>
          </div>
        </section>

        <section className="manifesto section-shell" id="manifesto" aria-label="Professional statement">
          <TopologyMap />
          <p className="manifesto-label mono reveal">[ PRODUCT THINKING × SYSTEMS ENGINEERING ]</p>
          <p className="manifesto-copy reveal">Not just screens. Not just APIs. I build the connective tissue between <em>product ambition</em> and <em>production reality.</em></p>
        </section>

        <section className="work section-shell" id="work" aria-labelledby="work-title">
          <SectionHeading index="02" eyebrow="Selected systems"><span id="work-title">Proof, not promises.</span></SectionHeading>
          <div className="project-grid">
            {projects.map((project) => (
              <div className="project-stack-item" key={project.title}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>

        <section className="experience section-shell" id="experience" aria-labelledby="experience-title">
          <SectionHeading index="03" eyebrow="Experience log"><span id="experience-title">Six years in production.</span></SectionHeading>
          <div className="timeline reveal-group">
            {experience.map((item, index) => (
              <article className="timeline-row reveal-item" key={`${item.company}-${item.period}`}>
                <div className="timeline-index mono">{String(index + 1).padStart(2, '0')}</div>
                <time className="timeline-period mono">{item.period}</time>
                <div className="timeline-company"><h3>{item.company}</h3><span>{item.role}</span></div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities section-shell" id="capabilities" aria-labelledby="capabilities-title">
          <SectionHeading index="04" eyebrow="Capability map"><span id="capabilities-title">Across the whole stack.</span></SectionHeading>
          <div className="capability-layout">
            <div className="capability-intro reveal">
              <p>My strongest work happens where backend architecture, infrastructure, and product experience meet.</p>
              <div className="capability-axis" aria-hidden="true">
                <span>Product</span>
                <span>Systems</span>
                <span>Infrastructure</span>
              </div>
              <div className="capability-readout mono">
                <span><b>04</b> connected layers</span>
                <span>End-to-end delivery</span>
              </div>
            </div>
            <div className="skill-grid reveal-group">
              {skillGroups.map((group, index) => (
                <article className="skill-group reveal-item" key={group.label}>
                  <span className="skill-group__watermark mono" aria-hidden="true">0{index + 1}</span>
                  <div className="skill-heading">
                    <span className="mono">NODE / 0{index + 1}</span>
                    <span className="skill-scope mono">{group.scope}</span>
                  </div>
                  <h3>{group.label}</h3>
                  <ul>{group.values.map((value) => <li key={value}>{value}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about section-shell" id="about" aria-labelledby="about-title">
          <div className="about-grid">
            <div>
              <p className="section-kicker reveal"><span>05</span>Beyond the code</p>
              <h2 id="about-title" className="reveal">Built for the long run.</h2>
            </div>
            <div className="about-copy reveal">
              <p>I care about systems that stay understandable under pressure: clear architecture, useful monitoring, thoughtful failure modes, and interfaces that respect the people operating them.</p>
              <p>Outside work, I train, swim, run, play badminton and football. The same mindset carries over — consistency, feedback, and getting a little better every cycle.</p>
              <div className="education">
                <span className="mono">EDUCATION / 2015—2019</span>
                <strong>Bachelor’s Degree in Information Technology</strong>
                <span>Nha Trang Telecommunications University · Upper Second-Class Honours equivalent</span>
              </div>
            </div>
          </div>
        </section>

        <section className="contact section-shell" id="contact" aria-labelledby="contact-title">
          <p className="section-kicker reveal"><span>06</span>Open channel</p>
          <div className="contact-grid">
            <div>
              <h2 id="contact-title" className="reveal">Let’s build the<br /><em>next system.</em></h2>
              <p className="contact-note reveal">Looking for a fullstack developer who can move from architecture to interface without losing the thread?</p>
            </div>
            <div className="contact-actions reveal">
              <a className="contact-link" href="mailto:ethanftd@gmail.com"><span>Email</span><strong>ethanftd@gmail.com</strong><ArrowIcon /></a>
              <a className="contact-link" href="tel:+84913558765"><span>Phone</span><strong>+84 913 558 765</strong><ArrowIcon /></a>
              <a className="contact-link" href="/Dao-Ngoc-Trung.pdf" download><span>Document</span><strong>Download résumé</strong><ArrowIcon /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer mono">
        <span>© 2026 Dao Ngoc Trung</span>
        <span>Designed to communicate. Built to perform.</span>
        <a href="#top">Back to top ↑</a>
      </footer>
    </div>
  )
}

export default App
