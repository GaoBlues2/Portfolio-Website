import * as T from 'three'
import { Sculpt, mat } from './modeling'
import { softCatTail } from './catTail'

// Resting on the dry tile in front of the desk, clear of chair wheels and pond.
export const catPlacement: [number,number,number] = [.05,.265,1.18]
export function curledCat(){
  const b=new Sculpt(),fur='#dba039',stripe='#ae7027',cream='#f3d59a'
  // Curled haunch and tucked chest; low silhouette rather than an upright pet.
  const breathing=b.part('cat-breathing')
  breathing.orb([-.055,.145,-.035],[.265,.145,.22],fur,32)
  breathing.orb([.115,.105,.08],[.15,.1,.15],fur,24)
  breathing.finish()
  b.orb([.1,.04,.215],[.105,.035,.06],cream,20)
  b.orb([.235,.045,.16],[.06,.034,.075],cream,20)
  for(let i=0;i<3;i++)b.tube([[-.2+i*.09,.25,-.13],[-.18+i*.09,.285,-.04],[-.18+i*.09,.266,.025]],.013,stripe,12,6)
  const head=new Sculpt()
  head.orb([0,0,0],[.13,.11,.115],fur,28)
  for(const side of [-1,1]){
    head.shape([[-.043,0],[.043,0],[side*.015,.115]],.04,fur,[side*.083,.065,-.015],[0,0,-side*.12],.012)
    head.shape([[-.023,0],[.023,0],[side*.008,.07]],.005,'#d39280',[side*.083,.084,.034],[0,0,-side*.12],.005)
    head.orb([side*.032,-.04,.096],[.042,.028,.025],cream,18)
    head.tube([[side*.018,.06,.09],[side*.027,.035,.108],[side*.034,.02,.111]],.006,stripe,8,5)
    for(let i=0;i<2;i++)head.tube([[side*.048,-.03-i*.012,.112],[side*.105,-.025-i*.022,.12],[side*.15,-.02-i*.029,.112]],.0025,'#e6c799',8,4)
  }
  head.orb([0,-.026,.121],[.013,.009,.007],'#865548',14)
  head.tube([[0,-.034,.119],[0,-.05,.12],[.018,-.055,.113]],.003,'#805c3a',8,4)
  const face=head.finish();face.position.set(.15,.15,.13);face.rotation.set(-.12,.3,-.12)
  const eyes:T.Mesh[]=[]
  for(const side of [-1,1]){
    const eye=new T.Mesh(new T.SphereGeometry(1,16,10),mat('#302e20',.55))
    eye.position.set(side*.052,.006,.106);eye.scale.set(.023,.012,.008);face.add(eye);eyes.push(eye)
  }
  b.group.add(face)
  const tail=softCatTail();b.group.add(tail.mesh)
  const group=b.finish();group.position.set(...catPlacement);group.name='curled-golden-cat'
  // Tiny facial geometry must not acquire shadow-map acne.
  group.traverse(o=>{if(o instanceof T.Mesh)o.receiveShadow=false})
  function update(time:number){
    breathing.group.scale.y=1+Math.sin(time*1.5)*.008
    face.position.y=.15+Math.sin(time*1.5)*.003
    const blink=time%7.3
    const closure=blink>4.9&&blink<5.18?Math.sin((blink-4.9)/.28*Math.PI):0
    for(const eye of eyes)eye.scale.y=.012*(1-.95*closure)
    tail.update(time)
  }
  update(0)
  return {group,update}
}
