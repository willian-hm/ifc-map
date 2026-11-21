(function(){
  'use strict';
  const C=InteriorCore,D=CampusInteriors,A=CampusAccess,$=id=>document.getElementById(id);
  const building=document.body.dataset.building||'principal',main=building==='principal';
  const floor=Number(document.body.dataset.floor),plan=main?InteriorLayout.createFloor(floor):CampusLayout.createBuilding(building,floor),grid=C.makeGrid(plan);
  const canvas=$('interior'),ctx=canvas.getContext('2d'),cache=InteriorArt.background(plan);
  const player={...plan.spawn,dir:'down',walk:0,moving:false};
  const view={w:1,h:1,dpr:1},keys=new Set(),held=new Map(),pointers=new Map();
  const storageKey='ifc-topdown-v3-'+(main?'':building+'-')+floor,originKey=main?'ifc-interior-origin':'ifc-interior-origin-'+building;
  const query=new URLSearchParams(location.search||''),entrance=A.get(query.get('entrada'),building);
  let origin=entrance||A.get(query.get('origem'),building);
  try{const back=JSON.parse(sessionStorage.getItem('ifc-exterior-return'));origin=origin||A.get(sessionStorage.getItem(originKey),building)||((back?.buildingId||'principal')===building?A.get(back?.entryId,building):null);}catch(_){}
  if(!main&&(!origin||origin.floor!==floor))origin=A.entriesFor(building).find(e=>e.floor===floor);
  if(entrance)try{sessionStorage.setItem(originKey,entrance.id);}catch(_){}
  $('campus-link').href=A.exitURL(origin?.id,building);
  const originQuery=origin?'?origem='+encodeURIComponent(origin.id):'';
  if(main)for(const link of document.querySelectorAll('.floors a'))link.href=link.getAttribute('href').split('?')[0]+originQuery;
  let path=[],selected=null,active=null,overview=true,following=true,zoom=1,cam={x:0,y:0};
  let gesture=null,dragged=false,lastRoomId=null,lastTime=performance.now();
  const page=n=>main?(n===1?'primeiro-andar.html':'segundo-andar.html'):CampusPlaces.page(building,n);
  const defaultZoom=()=>view.w<700?1.5:1.6;
  const safeView=()=>overview&&(!main||view.w<700)?{x:0,y:82,w:view.w,h:Math.max(80,view.h-180)}:{x:0,y:0,w:view.w,h:view.h};
  const minZoom=()=>{const r=safeView();return C.fitZoom(plan,r.w,r.h);};
  function cameraTarget(){const r=safeView(),p=C.camera(plan,player,r.w,r.h,zoom,overview);return {x:p.x-r.x/zoom,y:p.y-r.y/zoom};}
  const modalOpen=()=>$('directory').open||$('help').open;
  function tell(message){$('status').textContent=message;$('announcement').textContent=message;}
  function resetInput(){
    keys.clear();held.clear();pointers.clear();gesture=null;dragged=false;
    for(const b of document.querySelectorAll('[data-direction]'))b.classList.remove('held');
    player.moving=false;
  }
  function stop(){path=[];$('cancel-route').hidden=true;resetInput();}
  function save(){
    try{sessionStorage.setItem(storageKey,JSON.stringify({x:player.x,y:player.y,zoom,overview}));}catch(_){}
  }
  function resize(){
    const bounds=canvas.getBoundingClientRect();view.w=Math.max(1,bounds.width);view.h=Math.max(1,bounds.height);view.dpr=Math.min(2,devicePixelRatio||1);
    canvas.width=Math.round(view.w*view.dpr);canvas.height=Math.round(view.h*view.dpr);ctx.imageSmoothingEnabled=false;
    if(overview)zoom=minZoom();else zoom=C.clamp(zoom,minZoom(),3);
    cam=cameraTarget();refreshView();
  }
  function refreshView(){document.body.classList.toggle('overview',overview);$('overview-note').hidden=!overview;$('fit').setAttribute('aria-pressed',String(overview));}
  function follow(){overview=false;following=true;zoom=defaultZoom();cam=C.camera(plan,player,view.w,view.h,zoom);refreshView();}
  function fit(){overview=true;following=true;zoom=minZoom();cam=cameraTarget();refreshView();}
  function setZoom(value){
    const min=C.fitZoom(plan,view.w,view.h);zoom=C.clamp(value,min,3);overview=zoom<=min*1.01;following=true;
    if(overview)zoom=minZoom();cam=cameraTarget();refreshView();
  }
  function walkTo(target,roomId=null){
    const result=C.route(plan,grid,player,target);
    if(!result){tell('Escolha uma porta ou um ponto livre dentro do prédio.');return false;}
    stop();path=result;selected=roomId;$('cancel-route').hidden=false;
    tell(roomId?'Indo até '+roomTitle(roomId)+'…':'Seguindo pelo piso livre…');follow();return true;
  }
  function roomTitle(id){const r=plan.rooms.find(r=>r.id===id)||D.rooms[id];return /^[A-F]\d\d$/.test(id)?id+' · '+r.name:r.name;}
  function chooseRoom(id){const r=plan.rooms.find(r=>r.id===id);if(r)walkTo(r.target,r.id);}
  function world(clientX,clientY){const r=canvas.getBoundingClientRect();return {x:cam.x+(clientX-r.left)/zoom,y:cam.y+(clientY-r.top)/zoom};}
  function activate(){
    if(!active||modalOpen())return;
    save();stop();
    if(active.kind==='exit')location.assign(A.exitURL(active.accessId,building));
    else if(active.kind==='link')location.assign(CampusPlaces.page(active.building)+'#via='+encodeURIComponent(active.via));
    else location.assign(page(floor===1?2:1)+originQuery+'#via='+active.id);
  }
  function updateLocation(){
    const room=C.roomAt(plan,player.x,player.y),id=room?.id||'';
    if(id!==lastRoomId){
      lastRoomId=id;
      $('current-location').textContent=room?roomTitle(room.id):corridorName();
      $('location-description').textContent=room?(room.door?'Dentro da sala · saída pela porta aberta':'Ambiente aberto · continue pelo piso livre'):'Todos os ambientes neste mesmo mapa';
      $('room-note').textContent=room?.note||plan.note||'Posições conforme suas referências; medidas e mobiliário ilustrativos.';
      if(room)$('announcement').textContent='Você entrou em '+roomTitle(room.id);
    }else if(!room){
      $('current-location').textContent=corridorName();
    }
    const next=C.nearest(plan,player);
    if(next?.id!==active?.id){
      active=next;$('action').disabled=!active;
      $('action').textContent=!active?'Explorar':active.kind==='exit'?'Sair':active.kind==='link'?'Acessar':active.kind==='lift'?'Elevador':floor===1?'Subir':'Descer';
      if(active&&!path.length)tell(active.label+' · E ou botão de ação');
    }
  }
  function corridorName(){
    if(!main)return 'Circulação · '+plan.name;
    const lounge=plan.lounges.find(r=>C.contains(r,player.x,player.y));
    return lounge?lounge.name:player.x>2320&&player.y<1376?'Ala '+(floor===1?'A':'B'):player.x>816&&player.x<1232?'Ligação entre as alas':'Corredor '+(player.x<816?(floor===1?'E':'F'):(floor===1?'C':'D'));
  }
  function renderDirectory(){
    const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),q=norm($('search').value);
    $('room-list').replaceChildren();let found=0;
    const groups=main?(floor===1?['C','E','A']:['D','D / F','F','B']):[...new Set(plan.rooms.map(r=>r.group))];
    for(const group of groups){
      const matches=plan.rooms.filter(r=>r.group===group&&norm(r.id+' '+r.name).includes(q)).sort((a,b)=>group==='A'||group==='B'?b.y-a.y:b.x-a.x);if(!matches.length)continue;
      const h=document.createElement('h3');h.textContent=main?(group==='D / F'?'Ligação D / F':'Ala '+group):group;$('room-list').append(h);
      for(const r of matches){
        const button=document.createElement('button'),code=document.createElement('span'),info=document.createElement('span'),note=document.createElement('small');
        button.type='button';button.dataset.room=r.id;code.className='room-code';code.textContent=r.shortLabel;
        info.className='room-info';info.textContent=r.name;note.textContent=main?'Caminhar até a sala · '+floor+'º andar':'Caminhar até este ambiente';
        info.append(note);button.append(code,info);button.addEventListener('click',()=>{$('directory').close();chooseRoom(r.id);canvas.focus({preventScroll:true});});$('room-list').append(button);found++;
      }
    }
    const destinations=plan.portals;
    for(const point of destinations)if(norm(point.label).includes(q)){
      const b=document.createElement('button');b.type='button';b.textContent=point.label;
      b.addEventListener('click',()=>{$('directory').close();walkTo(point);canvas.focus({preventScroll:true});});$('room-list').append(b);found++;
    }
    for(const lounge of plan.lounges)if(norm(lounge.name).includes(q)){
      const target=lounge.id==='curva'?{x:1816,y:1160}:lounge.id==='central'?{x:1040,y:1772}:{x:2390,y:1500};
      const b=document.createElement('button');b.type='button';b.textContent=lounge.name;
      b.addEventListener('click',()=>{$('directory').close();walkTo(target);canvas.focus({preventScroll:true});});$('room-list').append(b);found++;
    }
    for(const id of plan.pending)if(norm(id+' '+D.rooms[id].name).includes(q)){
      const p=document.createElement('p');p.textContent=id+' · '+D.rooms[id].name+' — posição a confirmar.';$('room-list').append(p);found++;
    }
    if(!found){const p=document.createElement('p');p.textContent=main?'Nenhuma sala neste andar com esse nome. Confira também a outra página.':'Nenhum ambiente com esse nome neste prédio.';$('room-list').append(p);}
  }
  $('directory-open').addEventListener('click',()=>{stop();renderDirectory();$('directory').showModal();$('search').focus();});
  $('help-open').addEventListener('click',()=>{stop();$('help').showModal();});
  $('search').addEventListener('input',renderDirectory);
  $('controls').addEventListener('click',()=>{const enable=$('dpad').hidden;resetInput();if(enable&&overview)follow();$('dpad').hidden=!enable;$('controls').setAttribute('aria-pressed',String(enable));});
  $('fit').addEventListener('click',fit);$('follow').addEventListener('click',follow);
  $('zoom-in').addEventListener('click',()=>setZoom(zoom*1.3));$('zoom-out').addEventListener('click',()=>setZoom(zoom/1.3));
  $('action').addEventListener('click',activate);$('cancel-route').addEventListener('click',()=>{stop();tell('Percurso interrompido.');});
  for(const b of document.querySelectorAll('[data-direction]')){
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(modalOpen())return;path=[];$('cancel-route').hidden=true;if(overview)follow();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.direction);b.classList.add('held');});
    const release=e=>{held.delete(e.pointerId);if(![...held.values()].includes(b.dataset.direction))b.classList.remove('held');};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,release);
  }
  canvas.addEventListener('pointerdown',e=>{
    if(modalOpen())return;canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY});
    if(pointers.size===1)dragged=false;
    if(pointers.size===2){const [a,b]=[...pointers.values()];gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};dragged=true;stopRouteOnly();}
  });
  function stopRouteOnly(){path=[];$('cancel-route').hidden=true;}
  canvas.addEventListener('pointermove',e=>{
    const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pointers.size>=2&&gesture){const [a,b]=[...pointers.values()];setZoom(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,gesture.distance));return;}
    if(Math.hypot(p.x-p.startX,p.y-p.startY)>6)dragged=true;
    if(dragged){stopRouteOnly();overview=false;following=false;cam.x-=dx/zoom;cam.y-=dy/zoom;refreshView();}
  });
  canvas.addEventListener('pointerup',e=>{
    const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);
    if(!dragged&&!gesture){const point=world(e.clientX,e.clientY),room=C.roomAt(plan,point.x,point.y);room?chooseRoom(room.id):walkTo(point);}
    if(pointers.size===0){gesture=null;dragged=false;}
  });
  canvas.addEventListener('pointercancel',()=>{stop();});
  canvas.addEventListener('lostpointercapture',e=>{pointers.delete(e.pointerId);if(!pointers.size){gesture=null;dragged=false;}});
  canvas.addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom*(e.deltaY<0?1.12:1/1.12));},{passive:false});
  window.addEventListener('keydown',e=>{
    if(modalOpen()||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
    const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
    if(['a','d','s','w','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){stopRouteOnly();if(overview||!following)follow();}
    keys.add(k);if(e.repeat)return;
    if(k==='e')activate();else if(k==='0')fit();else if(k==='+'||k==='=')setZoom(zoom*1.3);else if(k==='-')setZoom(zoom/1.3);else if(k==='escape')stop();
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',stop);window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();save();}});
  for(const a of document.querySelectorAll('a'))a.addEventListener('click',save);
  window.addEventListener('resize',resize);new ResizeObserver(resize).observe(canvas);

  function initialPosition(){
    const params=new URLSearchParams(location.hash.slice(1)),roomId=params.get('sala'),via=params.get('via');
    if(entrance?.canEnter){
      if(entrance.floor!==floor){location.replace(page(entrance.floor)+'?entrada='+encodeURIComponent(entrance.id));return;}
      [player.x,player.y]=entrance.inside.spawn;player.dir=entrance.inside.dir;overview=false;zoom=1.6;
      tell(entrance.label+' · Explore pelas portas abertas.');return;
    }
    if(main&&roomId&&D.rooms[roomId]&&!plan.rooms.some(r=>r.id===roomId)&&!plan.pending.includes(roomId)){
      const other=InteriorLayout.createFloor(floor===1?2:1);
      if(other.rooms.some(r=>r.id===roomId)){location.replace(page(other.floor)+originQuery+'#sala='+encodeURIComponent(roomId));return;}
    }
    const portal=plan.portals.find(p=>p.id===via&&p.kind!=='exit'),room=plan.rooms.find(r=>r.id===roomId);
    if(portal){player.x=portal.x;player.y=portal.y;overview=false;zoom=1.6;}
    else if(room){player.x=room.entry.x;player.y=room.entry.y;selected=room.id;overview=false;zoom=1.6;}
    else{
      try{const saved=JSON.parse(sessionStorage.getItem(storageKey));if(saved&&C.free(plan,saved.x,saved.y)){player.x=saved.x;player.y=saved.y;overview=saved.overview!==false;zoom=Number.isFinite(saved.zoom)?saved.zoom:1.6;}}catch(_){}
    }
  }
  function frame(now){
    const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;
    if(!modalOpen()){
      const directions=[...held.values()],input={up:keys.has('w')||keys.has('arrowup')||directions.includes('up'),down:keys.has('s')||keys.has('arrowdown')||directions.includes('down'),left:keys.has('a')||keys.has('arrowleft')||directions.includes('left'),right:keys.has('d')||keys.has('arrowright')||directions.includes('right'),run:keys.has('shift')};
      if(path.length){C.follow(plan,player,path,dt);if(!path.length){$('cancel-route').hidden=true;tell(selected?'Você chegou a '+roomTitle(selected)+'.':'Você chegou ao destino.');save();}}
      else C.step(plan,player,input,dt);
      updateLocation();
    }
    if(following){const target=cameraTarget();const factor=1-Math.exp(-dt*12);cam.x+=(target.x-cam.x)*factor;cam.y+=(target.y-cam.y)*factor;}
    InteriorArt.draw(ctx,view,{plan,cache,player,cam,zoom,path,selected});
    requestAnimationFrame(frame);
  }
  initialPosition();resize();updateLocation();requestAnimationFrame(frame);
})();
