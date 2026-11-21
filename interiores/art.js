/* Vista superior: o recorte em L é a única área desenhada; exterior preto. */
(function(root){
  'use strict';
  let c,studentFrames;
  function rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
  function line(x,y,x2,y2,color,w=1){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
  function text(s,x,y,size,color,align='center'){c.fillStyle=color;c.font='600 '+size+'px "Segoe UI",system-ui,sans-serif';c.textAlign=align;c.fillText(s,x,y);}
  function polygon(points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  function object(f){
    const {x,y,w,h,kind:k}=f;
    if(f.solid)rect(x+2,y+3,w,h,'#0d0d1238');
    switch(k){
      case 'counter':case 'serving':
        rect(x,y,w,h,'#68777e');rect(x+3,y+3,w-6,h-7,'#c6d0d5');rect(x+4,y+h-5,w-8,3,'#e9edf0');
        if(k==='serving')for(let i=12;i<w-20;i+=44){rect(x+i,y+9,28,h-18,'#67787b');rect(x+i+3,y+12,22,h-24,['#9ba66d','#c2a16f','#b47a5a'][Math.floor(i/44)%3]);}break;
      case 'stove':
        rect(x,y,w,h,'#c2cbd0');for(const xx of [x+12,x+w-14])for(const yy of [y+10,y+h-12]){rect(xx-6,yy-5,12,10,'#35414d');rect(xx-3,yy-2,6,4,'#64717c');}break;
      case 'seat':
        rect(x+3,y+7,w-6,h-5,'#202c47');rect(x+2,y+2,w-4,12,'#345a83');rect(x+6,y+16,w-12,9,'#46749f');break;
      case 'stage':
        rect(x,y,w,h,'#796452');for(let yy=y+4;yy<y+h;yy+=12)line(x,yy,x+w,yy,'#99816b');rect(x,y+h-6,w,6,'#554940');rect(x,y,w,10,'#254b42');break;
      case 'podium':rect(x,y,w,h,'#7c6550');rect(x+3,y+3,w-6,h-9,'#b39672');rect(x+w/2-1,y-7,2,16,'#263d48');break;
      case 'bookcase':case 'stock':
        rect(x,y,w,h,'#566575');for(let yy=y+5;yy<y+h-3;yy+=22){rect(x+3,yy,w-6,17,'#b9c1c7');for(let xx=x+6;xx<x+w-7;xx+=8)rect(xx,yy+2,k==='stock'?7:5,12,['#528d88','#c19e6b','#5982a8','#9a6272'][(Math.floor(xx/8)+Math.floor(yy/22))%4]);}break;
      case 'chemistry':case 'microscope':
        rect(x,y,w,h,'#6d7b86');rect(x+2,y+2,w-4,h-4,'#d8e2e3');
        if(k==='microscope'){rect(x+12,y+6,6,16,'#32495d');rect(x+9,y+21,18,4,'#576f7d');rect(x+16,y+4,13,5,'#667c88');}
        else for(let i=8;i<w-8;i+=16){rect(x+i,y+9,9,14,'#8fb6c3');rect(x+i+2,y+5,5,7,'#d2e7e8');rect(x+i+2,y+17,5,4,i%3?'#75a18d':'#c6a46f');}break;
      case 'growbed':
        rect(x,y,w,h,'#84999a');rect(x+3,y+3,w-6,h-6,'#705d47');
        for(let yy=y+12;yy<y+h-6;yy+=22)for(let xx=x+12;xx<x+w-5;xx+=22){rect(xx-5,yy-2,10,5,'#3e763c');rect(xx-2,yy-5,5,11,'#639b48');rect(xx,yy,3,3,f.variant===2?'#adbd65':'#8db95d');}break;
      case 'tractor':
        rect(x+5,y+24,14,36,'#252d34');rect(x+w-19,y+24,14,36,'#252d34');rect(x,y+h-48,20,42,'#202b32');rect(x+w-20,y+h-48,20,42,'#202b32');
        rect(x+18,y,w-36,h-8,'#2f7753');rect(x+22,y+8,w-44,42,'#4b986c');rect(x+17,y+h-68,w-34,44,'#a5bcc4');rect(x+23,y+h-62,w-46,30,'#366272');rect(x+24,y-3,w-48,5,'#d3c78d');break;
      case 'ball-rack':rect(x,y,w,h,'#65717c');for(let i=8;i<w-8;i+=22){rect(x+i,y+7,16,16,'#ce9a5d');rect(x+i+7,y+7,2,16,'#705537');}break;
      case 'bleacher':
        rect(x,y,w,h,'#6e7783');for(let xx=x+4;xx<x+w-3;xx+=18){rect(xx,y+3,12,h-6,'#b2bbc4');rect(xx,y+3,12,3,'#e7e9ec');}break;
      case 'court':{
        rect(x,y,w,h,'#446c74');rect(x+10,y+10,w-20,h-20,'#5e8b88');
        c.strokeStyle='#e6d6a6';c.lineWidth=3;c.strokeRect(x+32,y+32,w-64,h-64);line(x+32,y+h/2,x+w-32,y+h/2,'#e6d6a6',3);
        c.beginPath();c.arc(x+w/2,y+h/2,92,0,Math.PI*2);c.stroke();
        for(const yy of [y+32,y+h-192]){c.strokeRect(x+w/2-156,yy,312,160);c.strokeRect(x+w/2-72,yy===y+32?yy-9:yy+160,144,9);}
        c.strokeStyle='#d7e5e3';c.lineWidth=2;c.strokeRect(x+200,y+240,w-400,h-480);break;
      }
      case 'desk':case 'computer':case 'drawing':case 'office':case 'table':{
        rect(x,y,w,h-7,'#606770');rect(x+1,y+1,w-2,h-10,'#d9dde0');rect(x+3,y+2,w-6,2,'#f5f7f8');
        const cy=f.facing==='south'?y-1:y+h-9;rect(x+w/2-7,cy,14,8,'#173a69');rect(x+w/2-6,cy+1,12,3,'#3e6c9c');
        if(k==='computer'||k==='office'){rect(x+7,y+5,w-14,10,'#223e47');rect(x+9,y+6,w-18,6,'#82b9bf');rect(x+w/2-2,y+15,4,3,'#536f70');}
        if(k==='drawing'){rect(x+5,y+5,w-13,11,'#f6f4e5');line(x+8,y+13,x+w-12,y+7,'#8b9eaf');}
        break;
      }
      case 'rack':case 'panel':
        rect(x,y,w,h,'#344d53');rect(x+3,y+3,w-6,h-6,k==='panel'?'#abb8b3':'#192c35');
        for(let j=5;j<h-4;j+=6){rect(x+6,y+j,w-18,3,'#63777b');rect(x+w-8,y+j,2,2,j%2?'#9ce2ab':'#d8c370');}
        if(k==='panel')text('ϟ',x+w/2,y+h*.7,16,'#b1843d');break;
      case 'shelf':case 'lockers':
        rect(x,y,w,h,k==='lockers'?'#94adba':'#7d8978');
        for(let i=3;i<w-5;i+=9){rect(x+i,y+3,7,h-6,k==='lockers'?'#2e6688':['#b87958','#5d8999','#d2c188'][Math.floor(i/9)%3]);if(k==='lockers')rect(x+i+3,y+h/2,2,2,'#e7e2c4');}break;
      case 'sink':case 'bench':case 'physics':case 'safety':
        rect(x,y,w,h,'#839e92');rect(x+2,y+2,w-4,h-4,'#d2dfd1');
        if(k==='sink'){rect(x+7,y+5,w-14,h-12,'#78958c');rect(x+9,y+7,w-18,h-16,'#b4d6cc');line(x+w/2,y+2,x+w/2,y+10,'#587a78',3);}
        else{rect(x+6,y+6,10,12,k==='safety'?'#d3ae5f':'#75a7b0');rect(x+w-17,y+9,10,9,'#7a8c68');}break;
      case 'toilet':
        rect(x,y,w,h,'#dde4e9');rect(x+6,y+3,w-12,9,'#f8fafc');rect(x+9,y+11,w-18,16,'#b3c9bf');rect(x+12,y+13,w-24,10,'#eef1f3');break;
      case 'bed':
        rect(x,y,w,h,'#91a598');rect(x+2,y+2,w-4,h-4,'#e7edf1');rect(x+4,y+4,w-8,8,'#ffffff');break;
      case 'sofa':
        rect(x,y,w,h,'#2e6273');rect(x+5,y+5,w-10,h-9,'#4b8492');rect(x+4,y+h-6,w-8,5,'#264c60');break;
      case 'mat':case 'toys':
        rect(x,y,w,h,'#b9c9a3');for(let j=0;j<2;j++)for(let i=0;i<3;i++)rect(x+3+i*(w-6)/3,y+3+j*(h-6)/2,(w-9)/3,(h-9)/2,['#ce8b69','#80a8aa','#dbbc74'][(j+i)%3]);break;
      case 'coffee':
        rect(x,y,w,h,'#b2a58b');rect(x+4,y+3,w-8,h-6,'#263b42');rect(x+9,y+6,14,7,'#8fb8bd');rect(x+w-12,y+h-12,6,6,'#f6f0d5');break;
      case 'board':rect(x,y,w,h,'#eef1f3');rect(x,y+h-2,w,2,'#416c59');break;
      case 'plant':
        rect(x+5,y+5,w-10,h-10,'#b29776');rect(x+1,y+5,w-2,h-10,'#438362');rect(x+6,y,w-12,h,'#67a36a');break;
      case 'social-table':
        rect(x+5,y+14,w-10,h-28,'#333a43');rect(x+4,y+10,w-8,h-24,'#f0f1f3');
        rect(x+6,y+11,w-12,2,'#ffffff');
        for(let i=16;i<w-12;i+=28){rect(x+i,y+1,14,7,'#173a69');rect(x+i+1,y+1,12,2,'#5282b3');rect(x+i,y+h-8,14,7,'#173a69');rect(x+i+4,y+h-3,6,3,'#252b34');}
        break;
      case 'stairs':
        if(f.variant==='diagonal'){
          const point=(u,v)=>[x+12+u*92+v*62,y+42+u*100-v*36];
          polygon([point(0,0),point(0,1),point(1,1),point(1,0)],'#4b545e');
          for(let i=0;i<10;i++){
            const a=i/10,b=(i+1)/10;
            polygon([point(a,0),point(a,1),point(b,1),point(b,0)],i%2?'#b5bec6':'#d8dfe4');
            const l=point(a,.04),r=point(a,.96);line(...l,...r,'#f8fafc',2);
          }
          for(const side of [0,1]){const a=point(0,side),b=point(1,side);line(...a,...b,'#707d89',5);line(a[0]-1,a[1]-3,b[0]-1,b[1]-3,'#eef1f3',2);
            for(let i=0;i<=4;i++){const q=point(i/4,side);rect(q[0]-1,q[1]-4,2,8,'#dbe3e8');}}
        }else{
          rect(x,y,w,h,'#58636d');rect(x+4,y+3,w-8,h-6,'#aab4be');
          rect(x+7,y+5,w-14,18,'#dce2e7');
          for(let i=0;i<7;i++){const yy=y+26+i*9;
            rect(x+7,yy,w/2-14,8,i%2?'#b0bac4':'#c9d0d6');rect(x+7,yy,w/2-14,2,'#f5f7f9');
            rect(x+w/2+7,yy,w/2-14,8,i%2?'#c9d0d6':'#b0bac4');rect(x+w/2+7,yy+6,w/2-14,2,'#f5f7f9');}
          rect(x+w/2-3,y+22,6,h-24,'#667684');rect(x+w/2-2,y+22,2,h-24,'#f8fafc');
          for(const xx of [x+2,x+w-4]){rect(xx,y+3,3,h-6,'#f0f4f6');for(let j=0;j<4;j++)rect(xx-1,y+8+j*23,5,3,'#8796a2');}
          // Small chevrons show the two flights, keeping the treads visible.
          polygon([[x+29,y+h-10],[x+36,y+h-18],[x+43,y+h-10]],'#0a6640');
          polygon([[x+w-43,y+34],[x+w-36,y+42],[x+w-29,y+34]],'#0a6640');
        }break;
      case 'lift':
        rect(x,y,w,h,'#3b434c');rect(x+4,y+4,w-8,h-4,'#b7c1ca');rect(x+9,y+9,w-18,h-13,'#dbe2e8');
        rect(x+12,y+12,w-24,h-22,'#aebbc5');
        for(let j=18;j<h-12;j+=13)line(x+13,y+j,x+w-13,y+j,'#c1cbd3');
        rect(x+7,y+h-10,w-14,6,'#576574');rect(x+w/2-1,y+h-10,2,6,'#eff4f8');
        rect(x+w-9,y+h-20,5,7,'#1c2d38');rect(x+w-8,y+h-19,2,2,'#10b981');break;
    }
  }
  function background(plan){
    const out=document.createElement('canvas');out.width=plan.width;out.height=plan.height;c=out.getContext('2d');c.imageSmoothingEnabled=false;
    c.save();c.beginPath();for(const r of plan.floors)c.rect(r.x,r.y,r.w,r.h);c.clip();
    rect(0,0,plan.width,plan.height,'#bbc2c9');
    for(let y=0;y<plan.height;y+=24)for(let x=0;x<plan.width;x+=24){
      rect(x+1,y+1,23,23,(x/24+y/24)%5===0?'#d8dde1':'#e0e4e7');
      rect(x+1,y+1,22,1,'#eef1f3');rect(x+1,y+2,1,21,'#e9edf0');
      const n=((x*13+y*7)>>>0)%17;rect(x+4+n,y+6+(n*3)%14,1,1,'#c7cfd6');
      rect(x+6+(n*5)%15,y+5+(n*7)%16,1,1,'#f3f5f6');
    }
    for(const r of plan.rooms){
      if(r.kind==='playroom')rect(r.x+14,r.y+16,r.w-28,r.h-32,'#dce5dc');
      if(r.kind==='datacenter')rect(r.x+14,r.y+16,r.w-28,r.h-32,'#bbc5d0');
    }
    // Piso tátil segue os dois eixos e os acessos da convivência.
    if(plan.tactile){for(const points of plan.tactile){c.strokeStyle='#2c4472';c.lineWidth=10;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}}
    else {
    rect(104,1611,2259,10,'#2c4472');rect(2363,184,10,1437,'#2c4472');rect(1019,1611,10,218,'#2c4472');
    if(plan.floor===1){rect(2363,1611,239,10,'#2c4472');rect(1019,1382,10,234,'#2c4472');}
    rect(879,1640,10,100,'#2c4472');
    rect(2120,1320,10,296,'#2c4472');rect(2039,918,10,402,'#2c4472');rect(2039,1310,90,10,'#2c4472');
    for(let x=104;x<2360;x+=16)rect(x,1614,10,2,'#5e78a2');
    for(let y=184;y<1618;y+=16)rect(2366,y,2,10,'#5e78a2');
    }
    for(const r of plan.rooms){const d=r.door;if(!d)continue;if(d.axis==='x'){rect(d.x-19,d.y-5,38,10,'#8bb9a0');line(d.x-24,d.y-5,d.x-24,d.y+(r.edge==='north'?28:-28),'#6b8c77',3);}else{rect(d.x-5,d.y-19,10,38,'#8bb9a0');line(d.x-5,d.y-24,d.x+(r.edge==='west'?28:-28),d.y-24,'#6b8c77',3);}}
    for(const f of plan.furniture)object(f);
    for(const s of plan.walls){rect(s.x+3,s.y+4,s.w,s.h,'#525c674d');rect(s.x,s.y,s.w,s.h,'#0a6640');rect(s.x+1,s.y+1,Math.max(1,s.w-2),Math.max(1,s.h-2),'#0f8a57');rect(s.x+2,s.y+1,Math.max(1,s.w-4),Math.max(1,s.h-5),'#eef1f3');}
    for(const w of plan.windows){rect(w.x,w.y,w.w,w.h,'#2c4763');if(w.w>w.h)line(w.x,w.y+1,w.x+w.w,w.y+1,'#79a6cc');else line(w.x+1,w.y,w.x+1,w.y+w.h,'#79a6cc');}
    c.restore();studentFrames=CampusStudent.buildFrames();return out;
  }
  function draw(ctx,view,scene){
    c=ctx;const {plan,cache,player,cam,zoom:z,path,selected}=scene;
    c.setTransform(view.dpr,0,0,view.dpr,0,0);rect(0,0,view.w,view.h,'#000000');
    c.save();c.scale(z,z);c.translate(-cam.x,-cam.y);c.drawImage(cache,0,0);
    if(path.length){c.strokeStyle='#26a575';c.lineWidth=3/z;c.setLineDash([6/z,7/z]);c.beginPath();c.moveTo(player.x,player.y);for(const p of path)c.lineTo(p.x,p.y);c.stroke();c.setLineDash([]);}
    for(const r of plan.rooms){
      if(r.x+r.w<cam.x||r.y+r.h<cam.y||r.x>cam.x+view.w/z||r.y>cam.y+view.h/z)continue;
      if(selected===r.id){c.strokeStyle='#30aa79';c.lineWidth=3/z;c.strokeRect(r.x+12,r.y+12,r.w-24,r.h-24);}
      if(z<.16&&selected!==r.id)continue;
      const title=r.shortLabel,fs=10/z;
      const name=r.name.replace('Laboratório','Lab.').replace('Atendimento educacional especializado','Atendimento educacional');
      const lines=z>=.7&&name!==title?wrap(name,Math.min(220/z,r.w-20),10.5/z):[];
      const x=r.x+r.w/2,y=z<.65?r.y+r.h/2:r.y+31;
      c.font='600 '+fs+'px "Segoe UI",sans-serif';
      let width=c.measureText(title).width;
      for(const l of lines){c.font='500 '+10.5/z+'px "Segoe UI",sans-serif';width=Math.max(width,c.measureText(l).width);}
      const bw=width+18/z,bh=(lines.length?22+lines.length*13:18)/z;
      plaque(x-bw/2,y-12/z,bw,bh,selected===r.id,z);
      text(title,x,y,fs,'#ececf4');
      lines.forEach((l,i)=>text(l,x,y+(15+i*13)/z,10.5/z,'#d8d8e5'));
    }
    if(z>=.16)for(const a of plan.portals){const s=Math.max(11,9/z);text(a.kind==='stairs'?'ESCADA':a.kind==='lift'?'ELEVADOR':a.short||'SAÍDA',a.x,a.y+(a.kind==='exit'?5:-54),s,'#0a6640');}
    if(z>.6||z<.16)for(const zone of plan.zones){
      if(z<.16&&zone.label==='CONVIVÊNCIA')continue;
      c.save();c.translate(zone.x,zone.y-18);
      if(z<.16&&['ALA A','ALA B'].includes(zone.label))c.rotate(-Math.PI/2);
      text(zone.label,0,0,Math.max(12,9/z),'#47627b');c.restore();
    }
    if(selected){const r=plan.rooms.find(r=>r.id===selected);if(r){c.strokeStyle='#2fb982';c.lineWidth=2/z;c.beginPath();c.arc(r.target.x,r.target.y,13,0,Math.PI*2);c.stroke();}}
    avatar(player,z);c.restore();
  }
  function wrap(value,maxWidth,size){
    c.font='500 '+size+'px "Segoe UI",sans-serif';const lines=[];let line='';
    for(const word of value.split(' ')){const candidate=line?line+' '+word:word;if(line&&c.measureText(candidate).width>maxWidth){lines.push(line);line=word;}else line=candidate;}
    if(line)lines.push(line);return lines;
  }
  function plaque(x,y,w,h,active,z){
    c.fillStyle=active?'rgba(13,24,20,.94)':'rgba(13,13,18,.86)';c.strokeStyle=active?'#10b981':'rgba(139,92,246,.6)';c.lineWidth=1/z;
    c.beginPath();c.roundRect(x,y,w,h,4/z);c.fill();c.stroke();
    rect(x+4/z,y+7/z,3/z,3/z,active?'#10b981':'#8b5cf6');
  }
  function avatar(p,z){
    const x=Math.round(p.x),y=Math.round(p.y);
    if(z<.6){c.strokeStyle='#10b981';c.lineWidth=2/z;c.strokeRect(x-4/z,y-4/z,8/z,8/z);}
    rect(x-5,y-2,10,3,'rgba(0,0,0,.32)');rect(x-4,y-3,8,5,'rgba(0,0,0,.32)');
    const frame=p.moving?Math.floor((p.walk||0)*7.5/12)&3:0;
    c.drawImage(studentFrames[p.dir||'down'][frame],x-8,y-23);
  }
  root.InteriorArt={background,draw};
})(globalThis);
