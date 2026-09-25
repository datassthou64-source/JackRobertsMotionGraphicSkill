import React from 'react';
import {useCurrentFrame} from 'remotion';
import {tw,UI} from '../kit';
/** Motion Primitives selected-background mechanism; approved 2026-09-24. */
export const AnimatedTabs:React.FC<{items:React.ReactNode[];f?:number;selectAt?:number[];size?:number}>=({items,f,selectAt=[0,20,44,68],size=100})=>{
 const local=useCurrentFrame();const frame=f??local;let x=0;for(let i=1;i<items.length;i++)x+=(size+12)*tw(frame,selectAt[i]??i*24,11);
 return <div style={{display:'flex',position:'relative',gap:12,padding:12,borderRadius:28,border:'2px solid #e4e4e7',background:'#fff',fontFamily:UI}}><div style={{position:'absolute',left:12+x,top:12,width:size,height:size,borderRadius:20,background:'#eeeef1'}}/>{items.map((item,i)=><div key={i} style={{position:'relative',width:size,height:size,display:'flex',alignItems:'center',justifyContent:'center'}}>{item}</div>)}</div>;
};
