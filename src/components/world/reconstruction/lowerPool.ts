import * as T from 'three'
import { Sculpt } from './modeling'
import { rock } from './nature'
import { colors as c } from './config'

/** A horizontal basin, with an irregular shoreline and an elongated broken reflection. */
export function lowerWaterMaterial(time:{value:number}) {
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time},vertexShader:`
    varying vec2 p;void main(){p=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
    varying vec2 p;uniform float time;
    float hash(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
    void main(){vec2 d=p-vec2(-.76,3.19);float radius=length(d);
      float wave=sin(p.y*38.-time*1.6+sin(p.x*13.+time*.7));
      float crossWave=sin(p.x*23.+p.y*17.-time*.85);
      float reflection=exp(-pow((d.x-.55*d.y+.018*wave)/.18,2.))*exp(-max(d.y,0.)*1.25)*smoothstep(-.08,.12,d.y);
      reflection*=.55+.45*noise(vec2(p.x*19.,p.y*27.-time*.8));
      float rings=pow(.5+.5*sin(radius*28.-time*2.1+crossWave*.14),16.)*exp(-radius*2.4);
      float light=exp(-radius*radius*2.7);
      vec3 col=mix(vec3(.008,.024,.030),vec3(.017,.045,.054),light);
      col+=vec3(.10,.21,.26)*reflection+vec3(.009,.021,.026)*rings;
      col+=vec3(.001,.003,.004)*(wave*.5+.5);
      // Broad dark surface: no radial alpha mask or glowing pond perimeter.
      float alpha=.96;
      float ambientWave=noise(vec2(p.x*3.+time*.09,p.y*7.-time*.18));
      col+=vec3(.009,.018,.021)*smoothstep(.5,.85,ambientWave);
      vec2 rockA=p-vec2(-3.09,5.36),rockB=p-vec2(-2.72,4.50);
      float contactA=max(abs(rockA.x)/.43,abs(rockA.y)/.37);
      float contactB=max(abs(rockB.x)/.42,abs(rockB.y)/.38);
      float contacts=min(contactA,contactB);
      col*=mix(.44,1.,smoothstep(.92,1.5,contacts));
      float wetEdge=exp(-pow((contacts-1.10)*15.,2.));
      col+=vec3(.018,.036,.039)*wetEdge*(.6+.4*ambientWave);
      float bankShadow=exp(-pow((p.y-2.7)*4.,2.))*.65;
      float rockShadow=exp(-length((p-vec2(-1.62,3.13))*vec2(3.,5.)))*.75;
      col*=1.-max(bankShadow,rockShadow);
      gl_FragColor=vec4(col,alpha*.94);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`})
  return material
}

export function lowerPool() {
  const b=new Sculpt()
  // A stepped undercroft preserves the broad waterfall silhouette without a
  // second organic cliff language beneath the tiled pond platform.
  const cells:[number,number,number][]=[
    [-1.58,2.74,0],[.05,2.73,1],
    [-1.53,3.4,2],[.08,3.39,3],
  ]
  cells.forEach(([x,z,seed])=>{
    const top=-.72-(seed%3)*.08
    b.slab([x,top-1.05,z],.66,.63,.52,seed%3===0?c.stoneLight:c.stone,seed+80,.05)
    b.slab([x+.012,top-.53,z],.65,.62,.31,seed%2?c.soil:c.soilLight,seed+93,.045)
    b.slab([x,top-.22,z],.67,.64,.22,c.stoneDark,seed+107,.045)
  })
  // A few loose rocks still soften the waterline; they no longer form the structure.
  rock(b,[-1.78,-1.56,3.16],[.54,.32,.47],332,c.stoneLight)
  rock(b,[.18,-1.54,3.14],[.22,.15,.19],337,c.stone)
  rock(b,[-1.13,-.2,3.02],[.24,.17,.25],338,c.stoneLight)
  rock(b,[-.38,-.21,3.03],[.24,.18,.22],339,c.stone)
  const group=b.finish()

  return group
}
