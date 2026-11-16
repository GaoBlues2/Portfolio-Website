import type { BookPose } from '../cases/bookState'
import { Component, lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { caseStudies, experience, profile, skills } from '../../data/profile'
import './profile.css'
const MiniScene = lazy(()=>import('../world/WorldScene').then(m=>({default:m.MiniScene})))
class LandmarkBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?null:this.props.children}}
export type ProfileView = 'engineering' | 'cloud' | 'home'
const sections: {id:ProfileView;label:string;index:string;title:string;intro:string}[] = [
 {id:'engineering',label:'Case Studies',index:'02',title:'Behind the Engineering',intro:'A closer look at the systems I’ve worked on and the responsibilities I took on.'},
 {id:'cloud',label:'Experience',index:'03',title:'My Journey',intro:'From web applications to AI products, distributed rendering and cross-platform delivery.'},
 {id:'home',label:'About Me',index:'04',title:'The Developer Behind the Code',intro:'Full-stack developer. Practical problem solver. Always learning.'},
]
export function WorldProfile({initialView,reduced,onClosed,book,origin}:{initialView:ProfileView;reduced:boolean;onClosed:()=>void;book:BookPose;origin:HTMLElement|null}){
 const [view,setView]=useState(initialView),[closing,setClosing]=useState(false),[ready,setReady]=useState(false)
 const fromBook=initialView==='engineering'
 const dialog=useRef<HTMLDialogElement>(null),timeline=useRef<gsap.core.Timeline|null>(null),isClosing=useRef(false)
 const focusBefore=useRef(document.activeElement as HTMLElement|null),body=useRef<HTMLDivElement>(null)
 const section=sections.find(s=>s.id===view)!
 const close=()=>{if(isClosing.current)return;isClosing.current=true;setClosing(true);if(reduced)onClosed();else timeline.current?.timeScale(1.3).reverse()}
 useLayoutEffect(()=>{
  const el=dialog.current!;el.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden'
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({onReverseComplete:onClosed,onComplete:()=>{setReady(true);el.querySelector<HTMLButtonElement>('.profile-back')?.focus({preventScroll:true})},onUpdate:()=>book.invalidate?.()})
   timeline.current=tl
   if(fromBook&&!reduced){
    const rect=origin?.querySelector('.miniature')?.getBoundingClientRect()
    const ox=rect?rect.left+rect.width*.5:innerWidth/2,oy=rect?rect.top+rect.height*.32:innerHeight*.6
    const sheet=el.querySelector('.case-flight')!
    tl.to(book,{lift:.045,duration:.18,ease:'power2.out'},0)
     .to(book,{opening:1,duration:.65,ease:'power2.inOut'},.12)
     .fromTo(sheet,{x:ox-innerWidth/2,y:oy-innerHeight/2,scale:.035,rotation:-9,autoAlpha:0},{autoAlpha:1,scale:.15,y:oy-innerHeight/2-70,rotation:-5,duration:.38,ease:'power2.out'},.58)
     .to(sheet,{x:0,y:0,scale:1,rotation:0,duration:.65,ease:'power3.inOut'},.96)
     .fromTo('.profile-surface',{opacity:0},{opacity:1,duration:.45},1.15)
     .fromTo('.profile-layout',{opacity:0,scale:.94,y:24},{opacity:1,scale:1,y:0,duration:.45,ease:'power2.out'},1.4)
     .to(sheet,{autoAlpha:0,duration:.25},1.45)
     .fromTo('.profile-bar',{opacity:0,y:-10},{opacity:1,y:0,duration:.25},1.6)
   }else{
    tl.fromTo(el,{opacity:0,y:reduced?0:18},{opacity:1,y:0,duration:reduced?0:.35,ease:'power2.out'})
   }
  },el)
  return()=>{ctx.revert();book.opening=0;book.lift=0;book.invalidate?.();el.close();document.body.style.overflow=overflow;focusBefore.current?.focus({preventScroll:true})}
 },[reduced,onClosed,book,origin,fromBook])

 useLayoutEffect(()=>{
  body.current?.scrollTo({top:0})
  const ctx=gsap.context(()=>{gsap.fromTo('.profile-reveal',{opacity:0,y:reduced?0:14},{opacity:1,y:0,duration:reduced?0:.4,stagger:reduced?0:.05,ease:'power2.out'})},body)
  return()=>ctx.revert()
 },[view,reduced])
 return <dialog ref={dialog} className={`world-profile view-${view}${fromBook?' book-profile':''}`} aria-labelledby="profile-title" onCancel={e=>{e.preventDefault();close()}}>
  {fromBook&&<><div className="profile-surface"/><div className="case-flight" aria-hidden="true"><span>FIELD NOTES / 02</span><strong>Behind the<br/>Engineering</strong><i/><small>TRUNG DAO — CASE STUDIES</small></div></>}
  <header className="profile-bar"><span className="profile-wordmark">Trung Dao</span><nav inert={!ready||closing} aria-label="Portfolio sections">{sections.map(s=><button key={s.id} aria-current={view===s.id?'page':undefined} onClick={()=>setView(s.id)}>{s.label}</button>)}</nav><button className="profile-back" autoFocus onClick={close} aria-label="Close developer profile"><span aria-hidden>←</span> My World</button></header>
  <div className="profile-layout" inert={closing||!ready}>
   <div className="profile-body" ref={body}>
    <header className="profile-intro profile-reveal"><div className="profile-intro-copy"><p className="profile-kicker">MY DEVELOPER WORLD / {section.label.toUpperCase()}</p><h2 id="profile-title">{section.title}</h2><p>{section.intro}</p></div><div className="profile-landmark" aria-hidden="true"><LandmarkBoundary><Suspense fallback={null}><MiniScene kind={view==='engineering'?'cases':view==='cloud'?'experience':'about'} reduced={reduced}/></Suspense></LandmarkBoundary><span className="landmark-halo"/></div></header>
    {view==='engineering'?<CaseStudies/>:view==='cloud'?<Experience/>:<About/>}
    <footer className="profile-footer">Trung Dao <span>Full-stack Developer / Hanoi, Vietnam</span></footer>
   </div>
  </div>
 </dialog>
}
function CaseStudies(){
 const [selected,setSelected]=useState(0),[area,setArea]=useState(0)
 const study=caseStudies[selected]
 return <div className="profile-reveal case-layout">
  <nav className="case-index" aria-label="Choose a case study">{caseStudies.map((item,i)=><button key={item.id} aria-pressed={selected===i} onClick={()=>{setSelected(i);setArea(0)}}><span>{item.number}</span><div><strong>{item.title}</strong><small>{item.company}</small></div><span aria-hidden>↗</span></button>)}</nav>
  <article className="case-story" aria-labelledby="case-title"><div className="case-meta"><span>{study.category}</span><span>{study.period}</span></div><h3 id="case-title">{study.title}</h3><p className="case-lead">{study.intro}</p>
   <div className="case-context"><section><h4>The context</h4><p>{study.context}</p></section><section><h4>My contribution</h4><p>{study.responsibility}</p></section></div>
   <section className="case-work"><h4>Inside the project</h4><p className="case-hint">Select an area to see my contribution.</p><div className="case-nodes" role="group" aria-label="Contribution areas">{study.areas.map((node,i)=><button key={node.name} aria-pressed={area===i} aria-controls="contribution-description" onClick={()=>setArea(i)}><span>0{i+1}</span>{node.name}</button>)}</div><div className="case-explanation" id="contribution-description" aria-live="polite"><span aria-hidden>↳</span><div><h5>{study.areas[area].name}</h5><p>{study.areas[area].text}</p></div></div></section>
   <section className="case-related"><h4>The bigger picture</h4><p>{study.related}</p><div className="profile-tags">{study.technologies.map(t=><span key={t}>{t}</span>)}</div></section>
   <details className="case-source"><summary>About this case study</summary><p>{study.scope} This summary is based on my CV and does not imply sole ownership of the product.</p></details>
  </article>
 </div>
}
function Experience(){
 return <div className="career-list profile-reveal">{experience.map((job,i)=><article className="career-stop" key={job.id}>
  <div className="career-date"><span>{job.period}</span>{job.current&&<strong>Current role</strong>}</div>
  <div className="career-marker" aria-hidden><span>{String(i+1).padStart(2,'0')}</span></div>
  <div className="career-card"><header><div><p>{job.role}</p><h3>{job.company}</h3></div><span aria-hidden>↗</span></header><p className="career-summary">{job.summary}</p><div className="profile-tags">{job.projects.map(p=><span key={p}>{p}</span>)}</div><details open={job.current}><summary>Responsibilities & contributions</summary><ul>{job.contributions.map(c=><li key={c}>{c}</li>)}</ul></details></div>
 </article>)}</div>
}
function About(){
 const [selected,setSelected]=useState(0),skill=skills[selected]
 return <div className="about-content">
  <section className="about-lead profile-reveal"><div><p className="profile-kicker">{profile.name} / {profile.location}</p><h3>Building across the stack.</h3><p>{profile.introduction}</p><p>{profile.approach}</p><a className="profile-email button" href={`mailto:${profile.email}`}>Let’s talk <span aria-hidden>↗</span></a></div></section>
  <section className="skill-section profile-reveal" aria-labelledby="skill-heading"><div className="profile-section-heading"><p className="profile-kicker">MY TOOLKIT</p><h3 id="skill-heading">From interface to infrastructure.</h3></div><div className="skill-layout"><div className="skill-menu" role="group" aria-label="Skill categories">{skills.map((s,i)=><button key={s.name} aria-pressed={selected===i} aria-controls="skill-description" onClick={()=>setSelected(i)}><span aria-hidden>{s.symbol}</span>{s.name}<span aria-hidden>↗</span></button>)}</div><div className="skill-detail" id="skill-description" aria-live="polite"><p className="profile-kicker">0{selected+1} / CAPABILITY</p><h4>{skill.name}</h4><p>{skill.description}</p><div className="profile-tags">{skill.items.map(item=><span key={item}>{item}</span>)}</div><p className="skill-connection">{skill.connection}</p></div></div></section>
  <div className="about-bottom profile-reveal"><section><p className="profile-kicker">EDUCATION / {profile.education.period}</p><h3>{profile.education.degree}</h3><p>{profile.education.school}</p><small>{profile.education.detail}</small></section><section><p className="profile-kicker">BEYOND THE SCREEN</p><h3>Staying active.</h3><p>Sports, fitness and a consistent routine are part of my life outside development.</p><div className="profile-tags">{profile.interests.map(interest=><span key={interest}>{interest}</span>)}</div></section></div>
  <section className="about-contact profile-reveal"><div><p className="profile-kicker">LET’S BUILD SOMETHING USEFUL</p><h3>Have a remote opportunity?</h3></div><a href={`mailto:${profile.email}`}>{profile.email} <span aria-hidden>↗</span></a></section>
 </div>
}
