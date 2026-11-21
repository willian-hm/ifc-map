(function(root){
  'use strict';
  const RADIUS=6,GRID=12;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const contains=(r,x,y)=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;
  function free(plan,x,y,r=RADIUS){
    if(!Number.isFinite(x)||!Number.isFinite(y))return false;
    for(const [dx,dy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(!plan.floors.some(f=>contains(f,x+dx,y+dy)))return false;
    return !plan.solids.some(s=>x+r>s.x&&x-r<s.x+s.w&&y+r>s.y&&y-r<s.y+s.h);
  }
  function move(plan,p,dx,dy){
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/4));
    for(let i=0;i<steps;i++){
      if(free(plan,p.x+dx/steps,p.y))p.x+=dx/steps;
      if(free(plan,p.x,p.y+dy/steps))p.y+=dy/steps;
    }
    if(Math.abs(dx)+Math.abs(dy)>.01)p.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  }
  function step(plan,p,input,dt){
    const dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0),n=Math.hypot(dx,dy)||1;
    const speed=(input.run?210:138)*clamp(dt,0,.05),oldX=p.x,oldY=p.y;move(plan,p,dx/n*speed,dy/n*speed);
    p.moving=Math.hypot(p.x-oldX,p.y-oldY)>.01;p.walk=p.moving?(p.walk||0)+dt*12:0;
  }
  function makeGrid(plan){
    const cols=Math.ceil(plan.width/GRID),rows=Math.ceil(plan.height/GRID),open=new Uint8Array(cols*rows);
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)open[y*cols+x]=free(plan,x*GRID+GRID/2,y*GRID+GRID/2)?1:0;
    return {cols,rows,open};
  }
  function route(plan,grid,start,end){
    if(!free(plan,end.x,end.y))return null;
    const {cols,rows,open}=grid;
    const nearby=p=>{
      const cx=Math.floor(p.x/GRID),cy=Math.floor(p.y/GRID);let best=-1,distance=Infinity;
      for(let y=Math.max(0,cy-2);y<=Math.min(rows-1,cy+2);y++)for(let x=Math.max(0,cx-2);x<=Math.min(cols-1,cx+2);x++){
        const d=Math.hypot(x*GRID+GRID/2-p.x,y*GRID+GRID/2-p.y);
        if(open[y*cols+x]&&d<distance&&lineFree(plan,p,{x:x*GRID+GRID/2,y:y*GRID+GRID/2})){best=y*cols+x;distance=d;}
      }return best;
    };
    const from=nearby(start),to=nearby(end);if(from<0||to<0)return null;
    const previous=new Int32Array(open.length).fill(-1),queue=new Int32Array(open.length);let head=0,tail=1;
    queue[0]=from;previous[from]=from;
    while(head<tail&&previous[to]<0){
      const i=queue[head++],x=i%cols,y=Math.floor(i/cols);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,ny=y+dy,j=ny*cols+nx;
        if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&open[j]&&previous[j]<0){previous[j]=i;queue[tail++]=j;}
      }
    }
    if(previous[to]<0)return null;
    const path=[end];let i=to;
    while(i!==from){path.push({x:(i%cols)*GRID+GRID/2,y:Math.floor(i/cols)*GRID+GRID/2});i=previous[i];}
    path.push({x:(from%cols)*GRID+GRID/2,y:Math.floor(from/cols)*GRID+GRID/2});path.reverse();
    const reduced=[];let anchor=start;
    for(let i=0;i<path.length;){let last=i;while(last+1<path.length&&lineFree(plan,anchor,path[last+1]))last++;reduced.push(path[last]);anchor=path[last];i=last+1;}
    return reduced;
  }
  function lineFree(plan,a,b){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/3);for(let i=1;i<=steps;i++)if(!free(plan,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;}
  function follow(plan,p,path,dt){
    let travel=138*clamp(dt,0,.05);p.moving=false;
    while(path.length&&travel>0){const n=path[0],dx=n.x-p.x,dy=n.y-p.y,d=Math.hypot(dx,dy);
      if(d<.5){path.shift();continue;}const amount=Math.min(d,travel);move(plan,p,dx/d*amount,dy/d*amount);travel-=amount;p.moving=true;if(amount===d)path.shift();}
    p.walk=p.moving?(p.walk||0)+dt*12:0;
  }
  const roomAt=(plan,x,y)=>plan.rooms.find(r=>contains(r,x,y))||null;
  const nearest=(plan,p)=>plan.portals.filter(a=>Math.hypot(a.x-p.x,a.y-p.y)<48).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null;
  function fitZoom(plan,w,h){return Math.max(.04,Math.min((w-32)/plan.width,(h-32)/plan.height));}
  function camera(plan,p,w,h,z,overview=false){
    const vw=w/z,vh=h/z,axis=(target,world,view)=>view>=world?(world-view)/2:clamp(target-view/2,0,world-view);
    return {x:axis(overview?plan.width/2:p.x,plan.width,vw),y:axis(overview?plan.height/2:p.y,plan.height,vh)};
  }
  const api={RADIUS,GRID,clamp,contains,free,move,step,makeGrid,route,follow,lineFree,roomAt,nearest,fitZoom,camera};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InteriorCore=api;
})(globalThis);
