import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { Sculpt, canvasTexture } from '../world/reconstruction/modeling'
export function buildTreasure(){
 const b=new Sculpt(), wood='#32271e', metal='#79836a'
 // Hollow body: a floor and four walls leave room for the light and cards.
 b.box([0,.23,0],[1.06,.14,.72],wood,.035)
 for(const z of [-.33,.33]){
  b.box([0,.45,z],[1.06,.4,.08],wood,.025)
  for(const y of [.34,.47,.59])b.box([0,y,z+Math.sign(z)*.045],[.98,.012,.008],'#171c13',.002)
 }
 for(const x of [-.5,.5])b.box([x,.45,0],[.09,.4,.64],wood,.025)
 for(const x of [-.35,.35]){
  for(const z of [-.38,.38])b.box([x,.44,z],[.09,.42,.035],metal,.012,undefined,.35,.7)
  b.box([x,.23,0],[.1,.07,.78],metal,.015)
  for(const y of [.3,.58])b.orb([x,y,.405],[.023,.023,.015],'#b4bd8a',8)
 }
 // Fine circuit traces, recessed into the front wood.
 for(const side of [-1,1]){
  b.box([side*.19,.43,.378],[.18,.012,.01],'#7e9b48',.002)
  b.box([side*.27,.48,.378],[.012,.1,.01],'#7e9b48',.002)
  b.orb([side*.27,.53,.384],[.022,.022,.008],'#a7d65e',8)
 }
 const lid=new Sculpt()
 lid.box([0,.095,.36],[1.1,.2,.77],wood,.055)
 lid.box([0,.2,.36],[.98,.07,.64],'#49392a',.025)
 for(const x of [-.35,.35])lid.box([x,.135,.36],[.1,.26,.79],metal,.025,undefined,.32,.7)
 lid.box([0,.015,.75],[1.08,.045,.045],'#9baf72',.012)
 const hinge=lid.finish();hinge.position.set(0,.65,-.36);b.group.add(hinge)
 b.box([0,.55,.415],[.25,.25,.07],'#262f22',.035,undefined,.3,.7)
 const texture=canvasTexture(128,128,c=>{c.clearRect(0,0,128,128);c.fillStyle='#caff72';c.shadowColor='#b8ff35';c.shadowBlur=12;c.textAlign='center';c.font='bold 49px monospace';c.fillText('</>',64,82)})
 const lockMaterial=new MeshBasicMaterial({map:texture,transparent:true,toneMapped:false})
 const lock=new Mesh(new PlaneGeometry(.23,.23),lockMaterial);lock.position.set(0,.55,.454);b.group.add(lock)
 const group=b.finish(),sparks=new Group()
 const sparkMaterial=new MeshBasicMaterial({color:'#c6ff72',transparent:true,opacity:0})
 for(let i=0;i<14;i++){const s=new Mesh(new PlaneGeometry(.018,.04),sparkMaterial);s.position.set(Math.sin(i*7)*.45,.7+(i%5)*.13,Math.cos(i*4)*.22);sparks.add(s)}
 group.add(sparks)
 return {group,hinge,lockMaterial,texture,sparks,sparkMaterial}
}
