/* Planta contínua em L. Medidas proporcionais; sequência de salas informada pelo usuário. */
(function(root){
  'use strict';
  const D=typeof module!=='undefined'&&module.exports?require('./data.js'):root.CampusInteriors;
  const A=typeof module!=='undefined'&&module.exports?require('./access.js'):root.CampusAccess;
  const rect=(x,y,w,h,extra={})=>({x,y,w,h,...extra});
  function createFloor(number){
    const floor=number===2?2:1;
    const plan={floor,width:2688,height:1936,rooms:[],walls:[],furniture:[],windows:[],
      floors:[rect(80,1376,2528,480),rect(2128,160,480,1696)],
      halls:[rect(92,1568,2504,96),rect(2320,172,96,1672),rect(816,1388,416,456)],
      outline:[[80,1376],[2128,1376],[2128,160],[2608,160],[2608,1856],[80,1856]],
      spawn:{x:1024,y:1616},pending:floor===1?['C09']:[],
      portals:[{id:'stairs',kind:'stairs',x:884,y:1740,label:'Escada central · '+(floor===1?'Subir ao 2º andar':'Descer ao 1º andar')},
        {id:'stairs-east',kind:'stairs',x:2258,y:1518,label:'Escada da junção · '+(floor===1?'Subir ao 2º andar':'Descer ao 1º andar')},
        {id:'lift',kind:'lift',x:2044,y:900,label:'Elevador · '+(floor===1?'2º andar':'1º andar')}],
      lounges:[rect(816,1664,416,180,{id:'central',name:'Convivência · Entrada central'}),
        rect(1424,776,704,600,{id:'curva',name:'Convivência · Área curva'}),
        rect(2144,1376,448,192,{id:'escada',name:'Convivência · Escada da junção'})],
      zones:[{label:floor===1?'ALA E':'ALA F',x:448,y:1616},{label:'CONVIVÊNCIA',x:1144,y:1678},
        {label:'CONVIVÊNCIA',x:1800,y:1120},{label:'CONVIVÊNCIA',x:2464,y:1536},
        {label:floor===1?'ALA C':'ALA D',x:1680,y:1616},{label:floor===1?'ALA A':'ALA B',x:2368,y:760}]};
    for(const e of A.entries.filter(e=>(e.floors||[e.floor]).includes(floor)))plan.portals.push({id:e.id==='superior'?'upper-exit':'entry-'+e.id,accessId:e.id,kind:'exit',x:e.inside.portal[0],y:e.inside.portal[1],label:e.label,short:e.short});
    const wall=(x,y,w,h)=>{if(w>0&&h>0)plan.walls.push(rect(x,y,w,h));};
    const furniture=(kind,x,y,w,h,extra={})=>{const item=rect(x,y,w,h,{kind,solid:true,...extra});plan.furniture.push(item);return item;};
    // Faixas curtas e conectadas preservam o contorno pixelado da fachada curva.
    plan.curve=[];
    let previousX=2128;
    for(let y=776;y<1376;y+=4){
      const x=Math.round(2128-704*Math.sqrt(Math.max(0,1-((y+2-1376)/600)**2)));
      plan.curve.push({x,y,w:2144-x,h:4});plan.floors.push(rect(x,y,2144-x,4));
      const entryGap=floor===1&&y>=908&&y<968;
      if(!entryGap){wall(x,y,previousX-x+6,4);plan.windows.push(rect(x+1,y+1,previousX-x+3,2));}
      previousX=x;
    }
    plan.outline.splice(1,0,...plan.curve.slice().reverse().map(r=>[r.x,r.y]));
    wall(80,1376,12,212);wall(80,1644,12,212);wall(2128,160,12,616);
    if(floor===1){wall(80,1376,916,12);wall(1052,1376,372,12);wall(2596,160,12,1428);wall(2596,1644,12,212);wall(80,1844,916,12);wall(1052,1844,1556,12);}
    else{wall(80,1376,1344,12);wall(2596,160,12,1696);wall(80,1844,2528,12);}
    if(floor===2){wall(2128,160,212,12);wall(2396,160,212,12);}
    else wall(2128,160,480,12);
    function room(id,r,edge,group,side){
      const doorWidth=52,cx=r.x+r.w/2,cy=r.y+r.h/2,horizontal=edge==='north'||edge==='south';
      const door=horizontal?{x:cx,y:edge==='north'?r.y:r.y+r.h,w:doorWidth,h:12,axis:'x'}:
        {x:edge==='west'?r.x:r.x+r.w,y:cy,w:12,h:doorWidth,axis:'y'};
      const entry=horizontal?{x:cx,y:door.y+(edge==='north'?38:-38)}:{x:door.x+(edge==='west'?38:-38),y:cy};
      const exterior=horizontal?{x:cx,y:door.y+(edge==='north'?-26:26)}:{x:door.x+(edge==='west'?-26:26),y:cy};
      const item={...r,...D.rooms[id],group,side,edge,door,entry,exterior,target:{x:cx,y:cy}};plan.rooms.push(item);
      const splitH=y=>{wall(r.x,y,(r.w-doorWidth)/2,10);wall(cx+doorWidth/2,y,(r.w-doorWidth)/2,10);};
      const splitV=x=>{wall(x,r.y,10,(r.h-doorWidth)/2);wall(x,cy+doorWidth/2,10,(r.h-doorWidth)/2);};
      edge==='north'?splitH(r.y):wall(r.x,r.y,r.w,10);
      edge==='south'?splitH(r.y+r.h-10):wall(r.x,r.y+r.h-10,r.w,10);
      edge==='west'?splitV(r.x):wall(r.x,r.y,10,r.h);
      edge==='east'?splitV(r.x+r.w-10):wall(r.x+r.w-10,r.y,10,r.h);
      furnish(item,horizontal,furniture);return item;
    }
    function row(ids,x,w,y,edge,group,side){ids.forEach((id,i)=>{const a=Math.round(i*w/ids.length),b=Math.round((i+1)*w/ids.length);room(id,rect(x+a,y,b-a,176),edge,group,side);});}
    const first=D.buildings.principal.areas[floor===1?'ce':'df'].sections[0],last=D.buildings.principal.areas[floor===1?'ce':'df'].sections[2];
    // Quem entra pela direita percorre C/D, convivência, E/F indo para oeste.
    row([...last.right].reverse(),92,724,1392,'south',last.label,'direita');row([...last.left].reverse(),92,724,1664,'north',last.label,'esquerda');
    row([...first.right].reverse(),1232,872,1392,'south',first.label,'direita');row([...first.left].reverse(),1232,896,1664,'north',first.label,'esquerda');
    if(floor===1)room('C01',rect(2144,1664,176,176),'north','C','esquerda');
    if(floor===2)room('F10',rect(940,1392,176,176),'south','D / F','ligação');
    const a=D.buildings.principal.areas[floor===1?'a':'b'],ordinary=a.sections.find(s=>!s.lounge);
    function column(ids,x,edge,side,bottom=1376,total=1200){ids.forEach((id,i)=>{const a=Math.round(i*total/ids.length),b=Math.round((i+1)*total/ids.length);room(id,rect(x,bottom-b,176,b-a),edge,floor===1?'A':'B',side);});}
    if(floor===1){column(ordinary.right,2416,'west','direita');column(ordinary.left,2144,'east','esquerda');}
    else{column(ordinary.right,2416,'west','direita',1376,960);column(ordinary.left,2144,'east','esquerda',1376,960);
      room('B-nova-direita',rect(2416,176,176,240),'west','B','direita');room('B-nova-esquerda',rect(2144,176,176,240),'east','B','esquerda');}
    for(const r of plan.rooms){
      if(r.edge==='north')plan.windows.push(rect(r.x+r.w*.2,r.y+r.h-8,r.w*.6,5));
      if(r.edge==='south')plan.windows.push(rect(r.x+r.w*.2,r.y+3,r.w*.6,5));
      if(r.edge==='east')plan.windows.push(rect(r.x+3,r.y+r.h*.25,5,r.h*.5));
      if(r.edge==='west')plan.windows.push(rect(r.x+r.w-8,r.y+r.h*.25,5,r.h*.5));
    }
    furniture('stairs',848,1668,160,96,{solid:false,variant:'return'});
    furniture('stairs',2152,1380,172,152,{solid:false,variant:'diagonal'});
    furniture('lift',1992,820,104,96,{solid:false});
    if(floor===1){furniture('table',850,1430,62,40);furniture('sofa',1136,1430,66,32);furniture('coffee',1136,1488,42,26);}
    furniture('plant',832,1810,22,22);furniture('plant',1200,1810,22,22);
    furniture('social-table',850,1788,96,32);furniture('social-table',1104,1732,96,48);
    furniture('social-table',1576,1220,112,52);furniture('social-table',1880,1004,100,52);
    furniture('sofa',1884,1272,112,34);furniture('coffee',2070,1268,42,26);
    furniture('social-table',2420,1404,112,48);
    furniture('plant',1460,1320,22,22);furniture('plant',2070,1040,22,22);
    plan.solids=plan.walls.concat(plan.furniture.filter(f=>f.solid));return plan;
  }
  function furnish(r,horizontal,add){
    const k=r.kind,put=(kind,x,y,w,h,extra={})=>add(kind,x,y,w,h,{room:r.id,...extra});
    const surface=['computer','software','network'].includes(k)?'computer':k==='drawing'?'drawing':k==='workshop'?'computer':'desk';
    if(horizontal){
      const deskW=Math.min(44,(r.w-78)/2),xs=[r.x+20,r.x+r.w-20-deskW];
      for(const x of xs)for(let j=0;j<(k==='smallclass'?2:3);j++){
        const y=r.y+26+j*43;
        if(['classroom','smallclass','drawing','workshop','computer','software','network'].includes(k))put(surface,x,y,deskW,27,{facing:r.id==='F07'?(r.edge==='north'?'north':'south'):'north'});
        else if(['office','reception','care'].includes(k)){if(j===0)put('office',x,y,deskW,34);else if(j===2)put(k==='care'?'bed':'shelf',x,y,deskW,32);}
        else if(k==='playroom')put(j===0?'shelf':j===1?'toys':'mat',x,y,deskW,30);
        else if(k==='datacenter')put('rack',x,y,deskW,31);
        else if(k==='restroom')put(j===0?'sink':'toilet',x,y,deskW,30);
        else put(k==='energy'?'panel':k==='foodlab'?'sink':k==='safety'?'safety':k==='physics'?'physics':'bench',x,y,deskW,29);
      }
      put('board',r.x+20,r.edge==='north'?r.y+r.h-18:r.y+12,Math.max(35,r.w-40),5,{solid:false});
    }else{
      for(const y of [r.y+24,r.y+r.h-61])for(const x of [r.x+22,r.x+110])put(k==='restroom'?(y<r.y+r.h/2?'sink':'toilet'):k==='energy'?'panel':'desk',x,y,38,32);
      if(r.h>310)for(const y of [r.y+85,r.y+r.h-120])for(const x of [r.x+22,r.x+110])put('desk',x,y,38,32);
      put('board',r.x+30,r.y+12,116,5,{solid:false});
    }
    r.shortLabel=/^[A-F]\d\d$/.test(r.id)?r.id:r.id.startsWith('WC')?'WC':'NOVA';
  }
  const api={createFloor};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.InteriorLayout=api;
})(globalThis);
