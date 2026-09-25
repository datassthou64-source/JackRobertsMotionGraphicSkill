import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
/** Magic UI Orbiting Circles (MIT); approved 2026-09-24. Flat orbit, counter-rotated icons. */
export const OrbitingCircles:React.FC<{children:React.ReactNode;f?:number;radius?:number;duration?:number;reverse?:boolean;iconSize?:number;path?:boolean}>=({children,f,radius=260,duration=20,reverse=false,iconSize=80,path=true})=>{
 const local=useCurrentFrame();const {fps}=useVideoConfig();const frame=f??local;const n=React.Children.count(children);
 return <>{path&&<svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}><circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(90,100,110,.18)" strokeWidth={2}/></svg>}{React.Children.map(children,(child,i)=>{const angle=(frame/fps/duration*360+360/n*i)*(reverse?-1:1);return <div style={{position:'absolute',left:'50%',top:'50%',width:iconSize,height:iconSize,display:'flex',alignItems:'center',justifyContent:'center',transform:`translate(-50%,-50%) rotate(${angle}deg) translateY(${radius}px) rotate(${-angle}deg)`}}>{child}</div>})}</>;
};
