import { WorldProfile } from './components/profile/WorldProfile'
import type { ProfileView } from './components/profile/WorldProfile'
import { profile } from './data/profile'
import { ProjectGallery } from './components/projects/ProjectGallery'
import { restingTreasure } from './components/projects/treasureState'
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Code, DeviceMobile, Desktop, Cloud, GameController, EnvelopeSimple, X, List, ArrowCounterClockwise, Pause, Play, Compass } from '@phosphor-icons/react'
import { useReducedMotion } from 'motion/react'
import type { Region } from './components/world/WorldScene'
import type { MiniKind } from './components/world/reconstruction/miniatures'
import './world.css'
import { IntroLoader } from './components/world/entrance/IntroLoader'
import type { Awakening } from './components/world/entrance/awakening'
const WorldScene=lazy(()=>import('./components/world/WorldScene'))
const MiniScene=lazy(()=>import('./components/world/WorldScene').then(m=>({default:m.MiniScene})))
const destinations:{title:string;kind:MiniKind;region:Region;description:ReactNode}[]=[
 {title:'Projects',kind:'projects',region:'products',description:<>Real products I’ve built<br/>(web · mobile · desktop · cloud)</>},
 {title:'Case Studies',kind:'cases',region:'engineering',description:<>In-depth stories from<br/>ideas to production</>},
 {title:'Experience',kind:'experience',region:'cloud',description:<>My professional journey<br/>and key contributions</>},
 {title:'About Me',kind:'about',region:'home',description:<>More about me, my skills,<br/>and what I enjoy building</>},
]
class SceneBoundary extends Component<{children:ReactNode;onFailure?:()=>void},{failed:boolean}>{state={failed:false};componentDidCatch(){this.props.onFailure?.()}static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<p className="fallback">The 3D scene is unavailable. All sections remain accessible below.</p>:this.props.children}}
function App(){
 const [profileView,setProfileView]=useState<ProfileView|null>(null)
 const closeProfile=useCallback(()=>setProfileView(null),[])

 const treasure=useRef(restingTreasure()),projectOrigin=useRef<HTMLButtonElement>(null)
 const [projectsOpen,setProjectsOpen]=useState(false),[chestHovered,setChestHovered]=useState(false)
 const closeProjects=useCallback(()=>{setProjectsOpen(false);setChestHovered(false)},[])

 const [introDone,setIntroDone]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
 const [sceneReady,setSceneReady]=useState(false),[loading,setLoading]=useState(true)
 const entrance=useRef<Awakening>({done:introDone,skip:introDone,root:null,ready:()=>setSceneReady(true),complete:()=>setIntroDone(true)})
 const startWorld=useCallback(()=>{setLoading(false);entrance.current.start?.()},[])
 const skipIntro=useCallback(()=>{entrance.current.skip=true;entrance.current.done=true;entrance.current.finish?.();setIntroDone(true)},[])
 useEffect(()=>{if(introDone)return;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=overflow}},[introDone])
 useEffect(()=>{if(introDone)return;const timer=setTimeout(skipIntro,20000);return()=>clearTimeout(timer)},[skipIntro,introDone])
 const reduced=!!useReducedMotion(),[exploring,setExploring]=useState(false),[paused,setPaused]=useState(false),[reset,setReset]=useState(0),[active,setActive]=useState<Region|null>(null),[menu,setMenu]=useState(false),[visible,setVisible]=useState(true)
 const scene=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),lastFocus=useRef<HTMLElement|null>(null)
 useEffect(()=>{let inView=true;const update=()=>setVisible(inView&&!document.hidden);const observer=new IntersectionObserver(([e])=>{inView=e.isIntersecting;update()});if(scene.current)observer.observe(scene.current);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)}},[])
 useEffect(()=>{if(active){dialog.current?.showModal()}else if(dialog.current?.open){dialog.current.close();lastFocus.current?.focus()}},[active])
 const open=(region:Region)=>{if(region==='engineering'||region==='cloud'||region==='home'){setMenu(false);setProfileView(region);return}if(region==='products'){setMenu(false);setProjectsOpen(true);return}lastFocus.current=document.activeElement as HTMLElement;setActive(region);setMenu(false)}
 const enter=()=>{skipIntro();setExploring(!exploring);scene.current?.scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'})}
 return <>
 {!introDone&&loading&&<IntroLoader ready={sceneReady} onComplete={startWorld}/>}
 {!introDone&&<button className="awakening-skip" onClick={skipIntro}>Skip intro ↗</button>}
 <div className={`reference-page${introDone?'':' intro-running'}`} inert={!introDone} ref={node=>{entrance.current.root=node}}>
   <a className="skip-link" href="#main">Skip to content</a>
  <header className="header"><a className="wordmark" href="#home">Trung Dao</a><nav className={menu?'nav open':'nav'} aria-label="Main navigation"><a href="#home" onClick={()=>setMenu(false)}>Home</a><button onClick={()=>open('products')}>Projects</button><a href="#world" onClick={()=>setMenu(false)}>World</a><button onClick={()=>open('home')}>About</button></nav><button className="button header-cta" onClick={()=>open('contact')}>Let’s Build Together</button><button className="icon-button mobile-menu" aria-label="Toggle navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}><List size={24}/></button></header>
  <main id="main">
   <section className="hero" id="home">
    <div className="hero-copy"><p className="hello">HI, I’M</p><h1>Trung Dao</h1><h2>Full-stack Developer</h2><p className="hero-intro">I craft end-to-end digital experiences across<br className="desktop-break"/> web, mobile, desktop, and cloud systems.</p><div className="platforms">{[{label:'Web',icon:Code},{label:'Mobile',icon:DeviceMobile},{label:'Desktop',icon:Desktop},{label:'Cloud',icon:Cloud}].map(({label,icon:Icon})=><div key={label}><Icon size={31}/><span>{label}</span></div>)}</div><div className="hero-actions"><button className="button" onClick={enter}><GameController size={24}/>Enter My World <ArrowRight size={21}/></button><button className="button secondary" onClick={()=>open('products')}>View Projects</button></div></div>
    <div ref={scene} className={`scene-shell ${exploring?'exploring':''}`}><SceneBoundary onFailure={skipIntro}><Suspense fallback={<p className="fallback">Loading developer world…</p>}><WorldScene entrance={entrance.current} active={null} onSelect={open} exploring={exploring} paused={paused} reduced={reduced} reset={reset} visible={visible}/></Suspense></SceneBoundary><div inert={!exploring} className={`scene-toolbar ${exploring?'visible':''}`}><span>Drag to explore</span><button className="icon-button" aria-label="Reset reference camera" onClick={()=>{setReset(v=>v+1);setExploring(false)}}><ArrowCounterClockwise size={20}/></button><button className="icon-button" aria-label={paused?'Resume scene animation':'Pause scene animation'} onClick={()=>setPaused(!paused)}>{paused?<Play size={18}/>:<Pause size={18}/>}</button><button className="icon-button" aria-label="Exit exploration" onClick={()=>{setExploring(false);setReset(v=>v+1)}}><X size={18}/></button></div><button className="explore-access" aria-label="Enable 3D camera exploration" onClick={()=>{skipIntro();setExploring(true)}}><Compass size={20}/></button></div>
   </section>
   <section id="world" className="world-section"><h2>My Developer World</h2><p>Explore my projects, case studies, and the engineering<br className="desktop-break"/> journey behind the products.</p><div className="destination-grid">{destinations.map(d=><button key={d.kind} ref={d.kind==='projects'?projectOrigin:undefined} className={`destination ${d.kind==='projects'?'treasure-destination':''}`} onPointerEnter={()=>{if(d.kind==='projects')setChestHovered(true)}} onPointerLeave={()=>setChestHovered(false)} onFocus={()=>{if(d.kind==='projects')setChestHovered(true)}} onBlur={()=>setChestHovered(false)} onClick={()=>open(d.region)}><div className="miniature"><SceneBoundary><Suspense fallback={null}>{introDone&&<MiniScene kind={d.kind} treasure={treasure.current} reduced={reduced} hovered={chestHovered&&!projectsOpen}/>}</Suspense></SceneBoundary></div><h3>{d.title}</h3><p>{d.description}</p><span className="circle-arrow"><ArrowRight size={20}/></span></button>)}</div></section>
     <section className="contact" id="contact" aria-labelledby="contact-title"><div className="contact-scenery" aria-hidden="true"><SceneBoundary><Suspense fallback={null}>{introDone&&<MiniScene kind="contact"/>}</Suspense></SceneBoundary></div><div className="firefly-lights" aria-hidden="true"><i/><i/><i/></div><div className="contact-copy"><h2 id="contact-title">Let’s Build Something Great</h2><p>Have an idea, a project, or an opportunity?<br/>I’d love to hear from you.</p><button className="button" onClick={()=>open('contact')}><EnvelopeSimple size={26} weight="regular"/>Contact Me <ArrowRight size={23} weight="regular"/></button></div></section>
  </main>
  <dialog aria-labelledby="detail-title" ref={dialog} className="detail-dialog" onCancel={()=>setActive(null)} onClick={e=>{if(e.target===dialog.current)setActive(null)}}><div className="detail-content"><button className="icon-button dialog-close" aria-label="Close details" onClick={()=>setActive(null)}><X size={22}/></button><p className="detail-label">TRUNG DAO / DEVELOPER WORLD</p><h2 id="detail-title">Let’s Build Something Great</h2><p>Have an idea or a remote opportunity? I’d love to hear from you.</p><a className="button" href={`mailto:${profile.email}`}>{profile.email} <ArrowRight size={20}/></a></div></dialog>
 </div>
 {profileView&&<WorldProfile initialView={profileView} reduced={reduced} onClosed={closeProfile}/>}
 {projectsOpen&&<ProjectGallery pose={treasure.current} origin={projectOrigin.current} reduced={reduced} onClosed={closeProjects}/>}
 </>
}
export default App
