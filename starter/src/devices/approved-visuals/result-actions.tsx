import React from 'react';
import {Img,staticFile,interpolate,Easing} from 'remotion';
import {Props,Brand,Place,Photo,Cursor,tw,mix,cardShadow,Check} from './shared';
import {Website} from './website';
import {Iphone} from './iphone';
import {CurrentChatComposer} from './media-actions';
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
const press=(f:number,at:number)=>Math.max(0,1-Math.abs(f-at)/5);
const frame:React.CSSProperties={position:'relative',borderRadius:30,overflow:'hidden',boxShadow:cardShadow,border:'2px solid #e0e2e7',background:'#fff'};
/** Actual MagicUI device frame. Replace gallery with a captured app screen via screen. */
export const PhoneReveal=({f,image='scene-a.jpg',imageB='scene-b.jpg',screen}:Props)=>{
 const enter=tw(f,0,16),scroll=p(f,14,37),open=p(f,39,57),swipe=p(f,66,86);
 return <>
  <Place x={540+mix(90,0,enter)} y={820} style={{opacity:enter}}><div style={{width:340,transform:`translateX(${-125*open}px)`}}><Iphone screen={screen||<div style={{position:'absolute',inset:0,background:'#15181e',color:'#fff',padding:'60px 15px 20px'}}><div style={{fontSize:27,fontWeight:650,marginBottom:18}}>Gallery</div><div style={{transform:`translateY(${-190*scroll}px)`}}>{[imageB,image,imageB].map((im,i)=><div key={i} style={{height:275,position:'relative',borderRadius:20,overflow:'hidden',marginBottom:15}}><Photo file={im}/></div>)}</div></div>}/></div></Place>
  {open>0&&<Place x={mix(435,570,open)} y={mix(795,825,open)}><div style={{...frame,width:mix(275,780,open),height:mix(275,500,open),opacity:open}}><div style={{position:'absolute',inset:0,transform:`translateX(${-swipe*100}%)`}}><Photo file={image}/></div><div style={{position:'absolute',inset:0,transform:`translateX(${100-swipe*100}%)`}}><Photo file={imageB}/></div><div style={{position:'absolute',bottom:21,left:0,right:0,display:'flex',gap:8,justifyContent:'center'}}>{[0,1].map(i=><div key={i} style={{width:i===0?mix(28,9,swipe):mix(9,28,swipe),height:9,borderRadius:9,background:'#fff',opacity:i===0?mix(1,.4,swipe):mix(.4,1,swipe)}}/>)}</div></div></Place>}

 </>;
};

/** Result reveal with build, impact, two side bursts, orbiting accents and a handoff. */
export const ConfettiReveal=({f,screen}:Props)=>{
 const fill=p(f,0,25),reveal=p(f,26,47),settle=p(f,61,88);return <>
 <Place y={790}><div style={{position:'relative',width:mix(235,870,reveal),height:mix(235,580,reveal),...frame,borderRadius:mix(118,30,reveal),transform:`translateY(${-25*Math.sin(reveal*Math.PI)}px)`}}><div style={{position:'absolute',inset:0,opacity:reveal}}>{screen||<Website premium/>}<div style={{position:'absolute',inset:0,background:'#fff',transform:`translateY(${-reveal*105}%)`}}/></div>{reveal<1&&<div style={{position:'absolute',inset:0,display:'grid',placeItems:'center',opacity:1-reveal}}><svg width={180} height={180} viewBox="0 0 180 180"><circle cx={90} cy={90} r={75} fill="none" stroke="#e7eaf0" strokeWidth={9}/><circle cx={90} cy={90} r={75} fill="none" stroke="#15a879" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={1-fill} transform="rotate(-90 90 90)" strokeLinecap="round"/></svg><div style={{position:'absolute',opacity:fill}}><Check size={80}/></div></div>}</div></Place>
 {[26,53].flatMap((at,b)=>Array.from({length:38},(_,i)=>{const t=Math.max(0,f-at)/30,a=(i*2.39996)+b,v=160+(i%9)*35;const x=(b===0?540:(i%2?150:930))+Math.cos(a)*v*t;const y=(b===0?780:900)+Math.sin(a)*v*t-300*t+240*t*t;return f>=at?<div key={`${b}-${i}`} style={{position:'absolute',left:x,top:y,width:7+i%4*3,height:9+i%3*5,borderRadius:i%3===0?'50%':2,background:['#20b88a','#f0b74d','#527bf4','#e7816d'][i%4],opacity:1-p(f,at+32,at+58),transform:`rotate(${i*37+t*200}deg)`}}/>:null;}))}
 <Place x={mix(540,915,reveal)} y={mix(790,520,reveal)-settle*16}><div style={{width:100,height:100,borderRadius:'50%',background:'#e3fff0',border:'5px solid #fff',boxShadow:cardShadow,display:'grid',placeItems:'center',opacity:reveal,transform:`rotate(${mix(-25,0,reveal)}deg)`}}><Check size={55}/></div></Place>
 </>;
};

/** New: reference image enters verified composer, then wipes into a website result. */
export const ReferenceToWebsite=({f,image='scene-b.jpg',screen}:Props)=>{
 const drag=p(f,0,24),generate=p(f,31,62),scroll=p(f,65,89);return <><Place y={1040+generate*100} style={{opacity:1-p(f,50,70)}}><CurrentChatComposer/></Place><Place x={mix(245,540,drag)} y={mix(580,880,drag)-generate*120}><div style={{...frame,width:mix(330,900,generate),height:mix(230,600,generate),transform:`rotate(${mix(-9,0,drag)}deg)`}}><Photo file={image}/><div style={{position:'absolute',inset:0,clipPath:`inset(0 ${100-generate*100}% 0 0)`,transform:`translateY(${-scroll*40}px)`}}>{screen||<Website premium/>}</div><div style={{position:'absolute',top:0,bottom:0,width:4,left:`${generate*100}%`,background:'#fff',boxShadow:'0 0 28px #fff',opacity:generate>0&&generate<1?1:0}}/></div></Place><Cursor x={mix(375,650,drag)} y={mix(715,960,drag)} press={press(f,25)} opacity={1-p(f,29,42)}/></>;
};

/** New: a reference asset is handed between tools, then becomes the final canvas. */
export const AssetRelay=({f,image='scene-a.jpg',screen}:Props)=>{
 const first=p(f,0,28),second=p(f,29,57),reveal=p(f,58,85);const x=first<1?mix(190,540,first):mix(540,890,second);return <>
 <svg width={1080} height={1920} style={{position:'absolute'}}><path d="M190 605 Q365 460 540 605 T890 605" stroke="#d9dfe9" strokeWidth={4} fill="none" strokeDasharray="7 12"/></svg>
 {[0,1,2].map((i)=><Place key={i} x={190+i*350} y={600}><div style={{transform:`translateY(${-18*Math.sin(p(f,i*28,i*28+27)*Math.PI)}px)`,opacity:1-reveal*.8}}><Brand i={i} size={135}/></div></Place>)}
 <Place x={mix(x,540,reveal)} y={mix(845,835,reveal)-Math.sin((first<1?first:second)*Math.PI)*70}><div style={{...frame,width:mix(215,900,reveal),height:mix(160,585,reveal)}}><Photo file={image}/><div style={{position:'absolute',inset:0,clipPath:`inset(${100-reveal*100}% 0 0 0)`}}>{screen||<Website premium/>}</div></div></Place>
 {[28,57].map((at,i)=>{const q=p(f,at,at+20);return <Place key={at} x={540+i*350} y={600}><div style={{width:140+q*110,height:140+q*110,border:'3px solid #5b87df',borderRadius:'50%',opacity:f>=at?1-q:0}}/></Place>})}
 </>;
};
