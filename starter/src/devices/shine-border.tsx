import React from 'react';
import {useCurrentFrame,useVideoConfig} from 'remotion';
/** Magic UI Shine Border (MIT), approved by the user 2026-09-24.
 * Original radial-gradient/exclusion mask, explicit frame clock. */
export const ShineBorder: React.FC<{f?:number;duration?:number;borderWidth?:number;colors?:string[];style?:React.CSSProperties}>=({f,duration=3,borderWidth=4,colors=['#A07CFE','#FE8FB5','#FFBE7B'],style})=>{
 const local=useCurrentFrame();const {fps}=useVideoConfig();const t=((f??local)/fps/duration)%1;
 const position=100*Math.cos(t*Math.PI*2);
 return <div style={{position:'absolute',inset:0,width:'100%',height:'100%',boxSizing:'border-box',borderRadius:'inherit',pointerEvents:'none',padding:borderWidth,backgroundImage:`radial-gradient(transparent,transparent,${colors.join(',')},transparent,transparent)`,backgroundSize:'300% 300%',backgroundPosition:`${position}% ${position}%`,mask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',WebkitMaskComposite:'xor',maskComposite:'exclude',...style}}/>;
};
