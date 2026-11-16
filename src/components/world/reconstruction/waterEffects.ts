import * as T from 'three'
import { rng } from './modeling'
import { waterfallConfig as c } from './waterfallGeometry'

const noise=`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return .57*noise(p)+.28*noise(p*2.07)+.15*noise(p*4.13);}
`
export function waterfallMaterial(){
  return new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.FrontSide,uniforms:{time:{value:0},speed:{value:c.speed},turbulence:{value:c.turbulence},opacity:{value:c.opacity},foam:{value:c.foam}},vertexShader:`
    varying vec2 vUv;varying vec3 vView;uniform float time,speed,turbulence;
    ${noise}
    void main(){vUv=uv;vec3 p=position;float flow=uv.y-time*speed;
      float envelope=smoothstep(.30,.8,uv.y);
      float n=fbm(vec2(uv.x*4.,flow*7.));
      p.x+=envelope*turbulence*(sin(flow*11.+uv.x*3.)+2.*(n-.5));
      p.x+=(uv.x-.5)*envelope*.035*sin(flow*17.+uv.x*9.);
      p.z+=envelope*turbulence*(n-.5)*2.;
      vec4 view=modelViewMatrix*vec4(p,1.);vView=view.xyz;
      gl_Position=projectionMatrix*view;}`,
    fragmentShader:`varying vec2 vUv;varying vec3 vView;uniform float time,speed,opacity,foam;${noise}
    void main(){float flow=vUv.y-time*speed;
      float n=fbm(vec2(vUv.x*5.,flow*6.));
      float detail=fbm(vec2(vUv.x*21.+n,flow*16.));
      vec3 normal=normalize(cross(dFdx(vView),dFdy(vView)));
      float fresnel=pow(1.-abs(dot(normal,normalize(-vView))),3.);
      float streak=smoothstep(.52,.82,n)*.35+smoothstep(.66,.86,detail)*.28;
      float edge=pow(abs(vUv.x-.5)*2.,6.);
      float froth=smoothstep(.60,.82,detail)*foam*(edge+smoothstep(1.,1.28,vUv.y));
      vec3 col=mix(vec3(.035,.24,.30),vec3(.22,.57,.65),n);
      col+=vec3(.23,.35,.38)*fresnel;
      col=mix(col,vec3(.76,.91,.92),streak+froth);
      float inlet=smoothstep(0.,.42,vUv.y);
      gl_FragColor=vec4(col,(opacity+detail*.15-edge*.1-.14*smoothstep(.4,1.1,vUv.y)*smoothstep(.15,.65,n))*inlet);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`})
}

export function waterfallImpact(timeUniform:{value:number},lowQuality=false){
  const group=new T.Group(),rand=rng(629)
  const poolMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:timeUniform},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
    varying vec2 vUv;uniform float time;${noise}
    void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);
      float warped=r+.025*sin(a*5.+time*.8)+.016*sin(a*9.-time);
      float rings=pow(.5+.5*sin(warped*28.-time*2.1),12.);
      float breakup=smoothstep(.22,.72,noise(p*9.+time*.27));
      float fade=(1.-smoothstep(.28,1.,r))*smoothstep(.09,.25,r);
      float churn=fbm(p*13.+vec2(time*.65,-time*.8));
      float foamRadius=length(p/vec2(1.15,.78));
      float foam=(1.-smoothstep(.25,.70,foamRadius+(.5-churn)*.19))*(.72+.28*smoothstep(.28,.65,churn));
      float lace=pow(.5+.5*sin(warped*34.-time*2.1),9.)*(1.-smoothstep(.45,.85,r))*smoothstep(.3,.45,r);
      float wave=rings*breakup*fade*.16;
      vec3 col=mix(vec3(.025,.12,.15),vec3(.52,.84,.89),wave);
      col=mix(col,vec3(.8,.94,.95),clamp(foam*.96+lace*.24,0.,1.));
      gl_FragColor=vec4(col,max((1.-smoothstep(.3,.8,r))*.12+wave*.1,foam*.94+lace*.18));}`})
  const pool=new T.Mesh(new T.PlaneGeometry(1.2,.95),poolMaterial)
  pool.rotation.x=-Math.PI/2;pool.position.set(-.76,-1.48,3.19);group.add(pool)
  // One GPU-instanced draw: launch positions and ballistic arcs stay local to impact.
  const count=(lowQuality?c.mobile:c.desktop).particles
  const base=new T.SphereGeometry(1,6,4),geometry=new T.InstancedBufferGeometry()
  geometry.index=base.index
  for(const [name,attribute] of Object.entries(base.attributes)) geometry.setAttribute(name,attribute)
  const seeds:number[]=[],origins:number[]=[]
  for(let i=0;i<count;i++){
    seeds.push(rand()*Math.PI*2,.12+rand()*.26,.35+rand()*.4,rand()*2)
    origins.push((rand()-.5)*.32,(rand()-.5)*.065,.008+rand()*.01)
  }
  geometry.setAttribute('seed',new T.InstancedBufferAttribute(new Float32Array(seeds),4))
  geometry.setAttribute('origin',new T.InstancedBufferAttribute(new Float32Array(origins),3));geometry.instanceCount=count
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:timeUniform},vertexShader:`
    attribute vec4 seed;attribute vec3 origin;uniform float time;varying float alpha;
    void main(){float duration=2.*seed.z/3.4;float age=mod(time+seed.w,duration+.26);
      float live=1.-step(duration,age);alpha=live*(1.-age/duration*.6);
      vec3 p=position*origin.z*live;
      p+=vec3(-.76+origin.x+cos(seed.x)*seed.y*age,-1.455+max(0.,seed.z*age-1.7*age*age),3.19+origin.y+sin(seed.x)*seed.y*age);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying float alpha;void main(){gl_FragColor=vec4(.65,.88,.93,alpha*.75);}`})
  const drops=new T.Mesh(geometry,material);drops.frustumCulled=false;group.add(drops)
  const bubblesMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:timeUniform},vertexShader:`
    attribute vec4 seed;attribute vec3 origin;uniform float time;varying float shade;varying float alpha;
    void main(){float phase=fract(time*.42+seed.w);float radius=.10+phase*.17;
      float size=(.017+origin.z)*sin(phase*3.14159);
      vec3 p=position*vec3(size*1.5,size*.7,size);
      p+=vec3(-.76+cos(seed.x)*radius*1.15,-1.465+size*.35,3.19+sin(seed.x)*radius*.65);
      shade=.72+.28*normal.y;alpha=sin(phase*3.14159)*.85;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`
      varying float shade;varying float alpha;void main(){gl_FragColor=vec4(vec3(.78,.93,.95)*shade,alpha);}`})
  const bubbles=new T.Mesh(geometry,bubblesMaterial);bubbles.frustumCulled=false;group.add(bubbles)
  return {group,update:(time:number)=>{timeUniform.value=time}}
}

export function pondWaterMaterial(timeUniform:{value:number}) {
  return new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:timeUniform},vertexShader:`
    varying vec2 waterXZ;void main(){waterXZ=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
    varying vec2 waterXZ;uniform float time;${noise}
    void main(){vec2 p=waterXZ;
      float outlet=exp(-pow((p.x+.76)*3.5,2.))*smoothstep(2.4,3.05,p.y);
      float n=fbm(vec2(p.x*8.,p.y*9.-time*(.22+outlet*.25)));
      float glints=smoothstep(.63,.83,n);
      vec3 col=mix(vec3(.035,.24,.30),vec3(.22,.57,.65),n);
      col=mix(col,vec3(.62,.83,.86),glints*.3);
      gl_FragColor=vec4(col,.48+outlet*.10);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`})
}
