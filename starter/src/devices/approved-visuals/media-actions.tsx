import React from 'react';
import {Img,staticFile,interpolate,Easing} from 'remotion';
import {Props,Place,Photo,Cursor,tw,mix,cardShadow} from './shared';
import {Website} from './website';
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
const press=(f:number,at:number)=>Math.max(0,1-Math.abs(f-at)/5);
const frame:React.CSSProperties={position:'relative',borderRadius:30,overflow:'hidden',boxShadow:cardShadow,border:'2px solid #e0e2e7',background:'#fff'};
export const CurrentChatComposer=({width=900,src='ui/chatgpt-composer-20260924.jpg'}:{width?:number;src?:string})=><Img src={staticFile(src)} style={{display:'block',width,height:width*56/640,borderRadius:width*28/640}}/>;

/** Real verified ChatGPT composer; attachment expands to the same exact width. */
export const AttachmentPopover=({f,image='scene-a.jpg',composerSrc}:Props&{composerSrc?:string})=>{
 const open=p(f,13,37);const w=mix(150,900,open); const h=mix(106,540,open);
 return <><Place y={1090}><CurrentChatComposer src={composerSrc}/></Place><Place x={mix(170,540,open)} y={mix(970,740,open)}><div style={{...frame,width:w,height:h,borderRadius:mix(18,26,open)}}><Photo file={image} style={{objectPosition:`${mix(40,60,p(f,40,89))}% 50%`}}/><div style={{position:'absolute',right:17,top:17,width:34,height:34,borderRadius:30,background:'#15181dcc',color:'#fff',display:'grid',placeItems:'center',fontSize:23,opacity:open}}>×</div></div></Place><Cursor x={mix(250,194,p(f,0,12))+mix(0,460,p(f,35,79))} y={mix(1100,986,p(f,0,12))-mix(0,230,p(f,35,79))} press={press(f,13)} opacity={1-p(f,78,90)}/></>;
};

/** One-second reflective sweep. */
export const GlareSweep=({f,image='scene-b.jpg',screen}:Props)=><Place y={790}><div style={{...frame,width:850,height:680,transform:`translateY(${mix(28,0,tw(f,0,14))}px)`}}>{screen||<Photo file={image}/>}<div style={{position:'absolute',inset:0,background:'linear-gradient(112deg, transparent 27%,rgba(255,255,255,.08) 37%,rgba(255,255,255,.66) 48%,rgba(255,255,255,.12) 59%,transparent 68%)',width:1100,transform:`translateX(${mix(-1000,850,(f%30)/30)}px)`}}/><div style={{position:'absolute',inset:10,borderRadius:22,border:'1px solid #ffffff66'}}/></div></Place>;

/** Six image or website tiles converge, then a useful scroll/selection carries the beat. */
export const MosaicAssembly=({f,mode='website',screen,image='scene-a.jpg',imageB='scene-b.jpg'}:Props&{mode?:'website'|'images'})=>{
 const assembled=p(f,30,54),pick=p(f,62,82),scroll=p(f,56,89);
 return <><Place y={790}><div style={{position:'relative',width:900,height:600}}>{Array.from({length:6},(_,i)=>{const c=i%3,r=Math.floor(i/3),a=p(f,i*5,i*5+25);const dx=(c-1)*150*(1-a),dy=(r===0?-125:125)*(1-a);return <div key={i} style={{position:'absolute',left:c*300+dx,top:r*300+dy,width:300,height:300,opacity:mix(.15,1,a),borderRadius:mix(24,0,assembled),overflow:'hidden',transform:`rotate(${(i%2?9:-9)*(1-a)}deg)`,border:mode==='images'?'5px solid #f6f7f7':undefined}}>{mode==='website'?<div style={{position:'absolute',width:900,height:600,left:-c*300,top:-r*300-scroll*65}}>{screen||<Website premium/>}</div>:<Photo file={i%2?imageB:image}/>}</div>})}</div></Place>{mode==='images'&&pick>0&&<Place x={mix(390,540,pick)} y={mix(640,790,pick)}><div style={{...frame,width:mix(290,900,pick),height:mix(290,600,pick)}}><Photo file={imageB}/></div></Place>}<Cursor x={mix(860,mode==='website'?290:390,p(f,38,61))} y={mix(1100,mode==='website'?920:640,p(f,38,61))-50*scroll} press={press(f,62)} opacity={p(f,36,45)*(1-p(f,80,90))}/></>;
};

/** Transparent asset-agnostic annotation. Coordinates are in the 1080x1920 scene. */
export const DrawnEmphasis=({f,cx=540,cy=790,rx=170,ry=105,start=0,duration=25,color='#e6523b',rotation=-7,opacity=1}:{f:number;cx?:number;cy?:number;rx?:number;ry?:number;start?:number;duration?:number;color?:string;rotation?:number;opacity?:number})=>{
 const a=interpolate(f,[start,start+duration],[0,1],{extrapolateLeft:"clamp",extrapolateRight:"clamp"});return <svg style={{position:'absolute',inset:0,width:1080,height:1920,overflow:'visible',opacity}} viewBox="0 0 1080 1920"><g transform={`translate(${cx} ${cy}) rotate(${rotation})`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"><path d={`M ${rx*.88} ${-ry*.4} C ${rx*.52} ${-ry*1.25} ${-rx*.87} ${-ry*1.22} ${-rx} ${-ry*.08} C ${-rx*1.1} ${ry*.98} ${rx*.7} ${ry*1.25} ${rx*1.03} ${ry*.05} C ${rx*1.09} ${-ry*.45} ${rx*.65} ${-ry*.87} ${rx*.4} ${-ry*.85}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1-a}/></g></svg>;
};
