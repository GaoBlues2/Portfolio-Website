import * as T from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
export type V3=[number,number,number]
const materials=new Map<string,T.MeshStandardMaterial>()
export function mat(color:string,roughness=.82,metalness=0,emission=0){
  const key=`${color}/${roughness}/${metalness}/${emission}`
  if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness,emissive:emission?color:'#000000',emissiveIntensity:emission}))
  return materials.get(key)!
}
export class Sculpt {
  group=new T.Group()
  pieces=new Map<T.Material,T.BufferGeometry[]>()
  add(g:T.BufferGeometry,m:T.Material,at:V3=[0,0,0],rot:V3=[0,0,0],scale:V3=[1,1,1]){
    const matrix=new T.Matrix4().compose(new T.Vector3(...at),new T.Quaternion().setFromEuler(new T.Euler(...rot)),new T.Vector3(...scale))
    g.applyMatrix4(matrix)
    // Normalize attribute layout before batching static meshes by material.
    const geometry=g.index?g.toNonIndexed():g
    if(geometry!==g)g.dispose()
    if(!geometry.getAttribute('uv'))geometry.setAttribute('uv',new T.BufferAttribute(new Float32Array(geometry.getAttribute('position').count*2),2))
    for(const name of Object.keys(geometry.attributes))if(!['position','normal','uv'].includes(name))geometry.deleteAttribute(name)
    if(!geometry.getAttribute('normal'))geometry.computeVertexNormals()
    if(!this.pieces.has(m))this.pieces.set(m,[])
    this.pieces.get(m)!.push(geometry)
  }
  box(at:V3,size:V3,color:string,r=.04,rot:V3=[0,0,0],rough=.82,metal=0){this.add(new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(n=>n/3))),mat(color,rough,metal),at,rot)}
  orb(at:V3,size:V3,color:string,detail=20){this.add(new T.SphereGeometry(1,detail,Math.max(10,detail/2)),mat(color),at,[0,0,0],size)}
  lathe(at:V3,profile:[number,number][],color:string,segments=20){this.add(new T.LatheGeometry(profile.map(v=>new T.Vector2(...v)),segments),mat(color,.6),at)}
  tube(points:V3[],radius:number,color:string,segments=20,radial=8){this.add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,radius,radial,false),mat(color,.7))}
  shape(points:[number,number][],depth:number,color:string,at:V3=[0,0,0],rot:V3=[0,0,0],bevel=.035,material?:T.Material){
    const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath()
    this.add(new T.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,steps:1,curveSegments:16}),material||mat(color),at,rot)
  }
  slab(at:V3,w:number,d:number,h:number,color:string,seed=0,bevel=.04){
    const c=.1; const skew=Math.sin(seed*7)*.045
    this.shape([[-w/2+c,-d/2], [w/2-c,-d/2+skew], [w/2,-d/2+c],[w/2,d/2-c],[w/2-c,d/2],[-w/2+c,d/2-skew],[-w/2,d/2-c],[-w/2,-d/2+c]],h,color,at,[-Math.PI/2,0,0],bevel)
  }
  part(name:string){
    const child=new Sculpt();child.group.name=name;this.group.add(child.group);return child
  }
  finish(){
    for(const [m,gs] of this.pieces){const merged=mergeGeometries(gs,false);if(merged){const mesh=new T.Mesh(merged,m);mesh.castShadow=true;mesh.receiveShadow=true;this.group.add(mesh)}for(const g of gs)g.dispose()}
    this.pieces.clear();return this.group
  }
}
export function canvasTexture(width:number,height:number,draw:(c:CanvasRenderingContext2D)=>void){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d')!;draw(ctx)
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture
}
export function texturedPlane(b:Sculpt,at:V3,size:[number,number],texture:T.Texture,emissive=.3,rot:V3=[0,0,0]){
  const material=new T.MeshStandardMaterial({map:texture,roughness:.6,emissive:'#ffffff',emissiveMap:texture,emissiveIntensity:emissive})
  b.add(new T.PlaneGeometry(...size),material,at,rot)
}
export function rng(seed:number){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
export function blade(b:Sculpt,at:V3,height:number,width:number,angle:number,bend:number,color:string){
  const vertices:number[]=[],uv:number[]=[]
  for(let i=0;i<4;i++){
    const t=i/3, xx=bend*t*t, yy=height*t, ww=width*(1-t*.9)
    vertices.push(xx-ww,yy,0,xx+ww,yy,0);uv.push(0,t,1,t)
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6,5,7,6]);g.computeVertexNormals();const m=mat(color);m.side=T.DoubleSide;b.add(g,m,at,[0,angle,0])
}
