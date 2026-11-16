import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { projects } from '../../data/projects'
import { restingTreasure } from './treasureState'
import type { Treasure } from './treasureState'
import './projects.css'
type Props={pose:Treasure;origin:HTMLElement|null;reduced:boolean;onClosed:()=>void}
export function ProjectGallery({pose,origin,reduced,onClosed}:Props){
 const dialog=useRef<HTMLDialogElement>(null),timeline=useRef<gsap.core.Timeline|null>(null)
 const [phase,setPhase]=useState<'opening'|'open'|'closing'>('opening'),[selected,setSelected]=useState<number|null>(null)
 const closing=useRef(false),returnFocus=useRef(document.activeElement as HTMLElement|null)
 const close=()=>{if(closing.current)return;closing.current=true;setSelected(null);setPhase('closing');const scroll=dialog.current?.querySelector('.treasure-scroll');if(scroll)scroll.scrollTop=0;if(reduced){timeline.current?.progress(0,true);Object.assign(pose,restingTreasure());onClosed()}else timeline.current?.reverse()}
 useLayoutEffect(()=>{
  const el=dialog.current!;el.showModal();const overflow=document.body.style.overflow;document.body.style.overflow='hidden'
  const rect=origin?.querySelector('.miniature')?.getBoundingClientRect()??origin?.getBoundingClientRect()
  const ox=rect?rect.left+rect.width/2:innerWidth/2,oy=rect?rect.top+rect.height*.45:innerHeight*.6
  const cards=Array.from(el.querySelectorAll<HTMLElement>('.treasure-card'))
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({paused:true,onComplete:()=>{setPhase('open');el.querySelector<HTMLButtonElement>('[aria-label="Close project gallery"]')?.focus({preventScroll:true})},onReverseComplete:()=>{Object.assign(pose,restingTreasure());onClosed()},defaults:{ease:'power2.out'}})
   timeline.current=tl
   tl.to(pose,{glow:3,lift:.055,duration:.22},0)
    .to(pose,{hinge:-1.95,duration:.7,ease:'back.out(1.4)'},.2)
    .to(pose,{particles:1,duration:.35},.4)
   cards.forEach((card,i)=>{
    const r=card.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2
    // Every card leaves the chest, pauses in its own slot, then settles into the grid.
    const slot=(i-1.5)*Math.min(125,innerWidth/4.5)
    tl.fromTo(card,{x:ox-cx,y:oy-cy,scale:.025,autoAlpha:0},{x:innerWidth/2+slot-cx,y:Math.max(130,oy-140)-cy,scale:.22,autoAlpha:1,duration:.48},.55+i*.09)
    tl.to(card,{x:0,y:0,scale:1,duration:.65,ease:'power3.inOut'},1.1+i*.06)
   })
   tl.fromTo('.treasure-surface',{opacity:0},{opacity:1,duration:.65},.95)
    .fromTo('.treasure-heading, .treasure-footnote',{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.4},1.35)
    .to(pose,{particles:.35,duration:.4},1.6)
   tl.play();if(reduced)tl.progress(1)
  },el)
  return()=>{ctx.revert();Object.assign(pose,restingTreasure());el.close();document.body.style.overflow=overflow;returnFocus.current?.focus({preventScroll:true})}
 },[pose,origin,reduced,onClosed])
 return <dialog ref={dialog} className="treasure-dialog" aria-labelledby="treasure-title" onCancel={e=>{e.preventDefault();close()}}>
  <div className="treasure-surface"/>
  <div className="treasure-controls"><span>TRUNG DAO / PROJECT ARCHIVE</span><div>{phase!=='open'&&<button onClick={()=>{if(closing.current){timeline.current?.progress(0,true);Object.assign(pose,restingTreasure());onClosed()}else timeline.current?.progress(1)}}>Skip animation ↗</button>}<button aria-label="Close project gallery" onClick={close}>Close <span aria-hidden>×</span></button></div></div>
  <div className="treasure-scroll"><header className="treasure-heading"><p className="treasure-eyebrow">THE DEVELOPER’S TREASURE CHEST</p><h2 id="treasure-title">Ideas made real<span>.</span></h2><p>Selected projects across web, mobile, desktop and cloud.<br/>Products I’ve worked on, and the engineering inside.</p></header>
   <div className="treasure-grid" inert={phase!=='open'} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.project-copy>button'));const current=buttons.indexOf(document.activeElement as HTMLButtonElement);if(current<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus()}}>{projects.map((p,i)=><article className={`treasure-card project-${i}`} key={p.name}>
    <div className="project-art" aria-hidden="true"><span>{p.mark}</span><div className="project-glyph">{['{ AI }','/ 3D /','↗ ↙','[ GPU ]'][i]}</div><small>{p.platform}</small></div>
    <div className="project-copy"><p className="treasure-eyebrow">{p.category}</p><h3>{p.name}</h3><p>{p.description}</p><div className="project-tags">{p.stack.slice(0,4).map(t=><span key={t}>{t}</span>)}</div><button aria-expanded={selected===i} aria-controls={`project-detail-${i}`} onClick={()=>setSelected(selected===i?null:i)}> {selected===i?'Close details −':'Explore project ↗'}</button>
    {selected===i&&<section id={`project-detail-${i}`} className="project-details"><h4>Contribution</h4><p>{p.contribution}</p><h4>Inside the project</h4><ul>{p.features.map(f=><li key={f}>{f}</li>)}</ul><h4>Technology</h4><p>{p.stack.join(' · ')}</p><p className="media-note">Project screenshots and public demo links are not available in this portfolio yet.</p></section>}</div>
   </article>)}</div><p className="treasure-footnote">Professional and collaborative work · Illustrations are symbolic, not product screenshots.</p>
  </div>
 </dialog>
}
