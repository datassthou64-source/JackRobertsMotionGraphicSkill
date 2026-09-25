import React from 'react';
import {Props,Brand,Place,tw,mix,logos,Cursor,cardShadow} from './shared';
import {Win,pressAt} from '../../kit';
import {Website} from './website';

// Magic UI animated-beam: quadratic paths and travelling four-stop gradient.
export const IntegrationBeam:React.FC<Props>=({f,logos:files=logos})=>{
 const draw=tw(f,0,20);const hit=tw(f,65,10);const ys=[410,640,870];
 const point=(y:number,t:number)=>{const u=1-t;return [u*u*235+2*u*t*450+t*t*600,u*u*y+2*u*t*y+t*t*640]};
 return <><svg width={1080} height={1920} style={{position:'absolute',inset:0}}><defs><filter id="packet-glow"><feGaussianBlur stdDeviation={8}/></filter></defs>{ys.map((y,i)=><g key={i}><path d={`M235 ${y} Q450 ${y} 600 640 L850 640`} pathLength={1} fill="none" stroke="#d4d9e3" strokeWidth={7} strokeDasharray={1} strokeDashoffset={1-draw}/>{[0,1].map(j=>{const start=13+i*5+j*21;const q=Math.max(0,Math.min(1,(f-start)/32));const [x,py]=point(y,q);const visible=f>=start&&f<start+32;return <g key={j} opacity={visible?1:0}><circle cx={x} cy={py} r={20} fill={i===1?'#ffaa40':'#9867ef'} opacity={.5} filter="url(#packet-glow)"/><circle cx={x} cy={py} r={9} fill={i===1?'#f5ae52':'#9367e9'}/></g>})}</g>)}{[0,1].map(j=>{const q=Math.max(0,Math.min(1,(f-43-j*19)/23));return <g key={j} opacity={f>=43+j*19&&f<66+j*19?1:0}><circle cx={600+250*q} cy={640} r={22} fill="#9670f4" filter="url(#packet-glow)" opacity={.5}/><circle cx={600+250*q} cy={640} r={10} fill="#9670f4"/></g>})}<circle cx={850} cy={640} r={111} fill="none" stroke="#45af81" strokeWidth={4} opacity={hit}/></svg>{ys.map((y,i)=><Place key={i} x={235} y={y}><Brand i={i} size={138} files={files}/></Place>)}<Place x={600}><div style={{transform:`scale(${1+.055*Math.exp(-Math.max(0,f-44)/12)*(f>=44?1:0)})`}}><Brand i={1} size={190} files={files}/></div></Place><Place x={850}><Brand i={3} size={160} files={files}/></Place></>;
};

// Magic UI dock: distance [-d,0,d] maps to base/magnified/base size.
export const MagneticDock:React.FC<Props>=({f,logos:files=logos,screen})=>{
 const mouse=f<27?mix(170,900,tw(f,3,24)):mix(900,540,tw(f,28,16));const expand=tw(f,51,28);const click=pressAt(f,47);const order=[files[0],files[2],files[1],files[3],files[4]];
 const sizes=order.map((_,i)=>104+54*Math.max(0,1-Math.abs(mouse-(230+i*154))/180));
 return <><Place y={680}><div style={{height:200,display:'flex',alignItems:'center',gap:12,padding:'12px 26px',background:'#fff',border:'2px solid #dfe3e8',borderRadius:38,boxShadow:cardShadow,opacity:1-expand,transform:`scale(${1-expand*.2})`}}>{sizes.map((size,i)=><div key={i} style={{width:size,height:size,display:'grid',placeItems:'center',transform:i===2?`scale(${1-click*.1})`:undefined}}><Brand i={i} size={size-10} files={order}/></div>)}</div></Place>{f>=51&&<Place y={mix(680,670,expand)}><div style={{width:960,height:660,transform:`scale(${mix(.13,1,expand)})`,opacity:Math.min(1,expand*4),borderRadius:28,boxShadow:cardShadow,overflow:'hidden'}}><Win w={960} h={660} title="Preview">{screen??<Website premium/>}</Win></div></Place>}<Cursor x={mouse} y={mix(772,705,tw(f,38,8))} size={64} press={click} opacity={1-expand}/></>;
};

// Magic UI marquee: repeated groups, linear group translation and reverse row.
export const LogoConveyor:React.FC<Props>=({f,logos:files=logos,speed=2})=><Place><div style={{width:960,height:460,overflow:'hidden',position:'relative',maskImage:'linear-gradient(to right,transparent,black 13%,black 87%,transparent)'}}>{[0,1].map(row=><div key={row} style={{position:'absolute',left:0,top:row*240+15,display:'flex',gap:34,transform:`translateX(${row?-580+f*3*speed:-f*3*speed}px)`}}>{Array.from({length:14},(_,i)=><Brand key={i} i={i+row*2} size={175} files={files}/>)}</div>)}</div></Place>;