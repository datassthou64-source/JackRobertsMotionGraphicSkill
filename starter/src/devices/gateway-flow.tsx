import React, {useLayoutEffect, useRef} from 'react';
import {Img, staticFile} from 'remotion';
import {tw, mix} from '../kit';

/** Gateway Flow by Meng To / ThreeUI, MIT. Source: 21st.dev component 25589.
 * Canvas geometry, paths, particles and shockwave force ported from upstream.
 * Browser lifecycle replaced with a seeded simulation evaluated at an exact frame.
 * Original source is archived in the test project's upstream/ folder. */
export const GatewayFlow: React.FC<{
  f: number; width?: number; height?: number; top?: number;
  logo?: string; logoSize?: number; speed?: number; pulseAt?: number;
}> = ({f, width = 1080, height = 900, top = 250,
  logo = 'chatgpt.svg', logoSize = 184, speed = 1, pulseAt = 72}) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    let seed = 25589;
    const seeded = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const numPaths = 80;
    const paths = Array.from({length: numPaths}, (_, i) => ({
      isLeft: i % 2 === 0,
      startY: (i / numPaths) * height * 1.4 - height * 0.2,
      particles: [{t: seeded(), speed: 0.0015 + seeded() * 0.002}],
    }));
    // Upstream advances once per browser tick; simulate its 60 Hz clock at 30 fps.
    const ticks = Math.max(0, Math.floor(f * 2));
    for (let tick = 0; tick <= ticks; tick++) {
      paths.forEach(path => path.particles.forEach(p => {
        p.t += p.speed * speed;
        if (p.t > 1) {p.t = 0; path.startY += (seeded() - 0.5) * 10;}
      }));
    }
    const centerX = width / 2, centerY = height / 2;
    const age = Math.max(0, (f - pulseAt) * 2);
    const explosions = f >= pulseAt && age < 67
      ? [{x: centerX, y: centerY, radius: age * 15, life: 1 - age * 0.015}] : [];
    type Point = {x: number; y: number};
    const getBezierPoint = (t: number, p0: Point, p1: Point, p2: Point, p3: Point) => {
      const u = 1 - t;
      return {
        x: u**3*p0.x + 3*u**2*t*p1.x + 3*u*t**2*p2.x + t**3*p3.x,
        y: u**3*p0.y + 3*u**2*t*p1.y + 3*u*t**2*p2.y + t**3*p3.y,
      };
    };
    ctx.clearRect(0, 0, width, height);
    paths.forEach(path => {
      const p0 = {x: path.isLeft ? 0 : width, y: path.startY};
      const p1 = {x: path.isLeft ? centerX*0.5 : width-centerX*0.5, y: path.startY};
      const p2 = {x: path.isLeft ? centerX*0.8 : width-centerX*0.8, y: centerY};
      const p3 = {x: centerX, y: centerY};
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([1, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      path.particles.forEach(p => {
        const pos = getBezierPoint(p.t, p0, p1, p2, p3);
        let dxTotal = 0, dyTotal = 0;
        explosions.forEach(exp => {
          const dx = pos.x-exp.x, dy = pos.y-exp.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < exp.radius+120 && dist > exp.radius-120) {
            const force = (1-Math.abs(dist-exp.radius)/120)*exp.life;
            dxTotal += (dx/dist)*force*80;
            dyTotal += (dy/dist)*force*80;
          }
        });
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(pos.x+dxTotal-1.5, pos.y+dyTotal-1.5, 3, 3);
      });
    });
  }, [f, width, height, speed, pulseAt]);
  const reveal = tw(f, 0, 18);
  const pulse = tw(f, pulseAt, 24);
  const pulseScale = f >= pulseAt ? 1 + 0.025*(1-pulse) : 1;
  return <div style={{position:'absolute', inset:0, background:'#000'}}>
    <div style={{position:'absolute', top, width, height, overflow:'hidden',
      maskImage:'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)'}}>
      <canvas ref={canvas} width={width} height={height} style={{display:'block'}}/>
    </div>
    <div style={{position:'absolute', left:width/2-126, top:top+height/2-126,
      width:252, height:252, borderRadius:'50%', background:'#000',
      boxShadow:'0 0 50px 22px #000', opacity:reveal,
      display:'flex', alignItems:'center', justifyContent:'center',
      transform:`scale(${mix(0.86, 1, reveal)*pulseScale})`}}>
      <Img src={staticFile(`logos/${logo}`)} style={{width:logoSize, height:logoSize}}/>
    </div>
  </div>;
};
