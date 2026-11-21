const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const P=require('../interiores/places'),A=require('../interiores/access'),L=require('../interiores/campus-layout'),C=require('../interiores/core');
const plans=Object.values(P.buildings).flatMap(b=>[...new Set(b.entries.map(e=>e.floor))].map(floor=>L.createBuilding(b.id,floor)));

test('todos os edifícios adicionais têm página própria, portas correspondentes e dependências locais',()=>{
  assert.equal(plans.length,15);
  for(const p of plans){
    const page=P.page(p.building,p.floor),html=fs.readFileSync(path.join(__dirname,'../interiores',page),'utf8');
    assert.ok(html.includes('data-building="'+p.building+'"'));
    assert.ok(html.includes('data-floor="'+p.floor+'"'));
    for(const [,asset] of html.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css))(?:\?[^"#]*)?"/g))assert.ok(fs.existsSync(path.join(__dirname,'../interiores',asset)));
    assert.equal(C.free(p,0,0),false);assert.equal(C.free(p,p.width-1,p.height-1),false);
    assert.ok(p.rooms.every(r=>r.note.includes('ilustrativa')));
    for(const e of A.entriesFor(p.building).filter(e=>e.floor===p.floor)){
      assert.equal(A.forDoor(e.outside.door,p.building).id,e.id);
      assert.equal(A.interiorURL(e.id,p.building),'interiores/'+page+'?entrada='+e.id);
      assert.ok(C.free(p,...e.inside.spawn),p.building+' spawn '+e.id);
    }
  }
});

test('66 ambientes acessíveis: trajetos entram pelas portas, contornam móveis e voltam a todas as saídas',()=>{
  assert.equal(plans.reduce((n,p)=>n+p.rooms.length,0),66);
  for(const p of plans){
    const grid=C.makeGrid(p);
    for(const r of p.rooms){
      assert.ok(C.free(p,r.target.x,r.target.y),r.id+' destino bloqueado');
      if(r.door)assert.ok(C.lineFree(p,r.exterior,r.entry),r.id+' soleira bloqueada');
      const route=C.route(p,grid,p.spawn,r.target);assert.ok(route,r.id+' sem rota');
      const player={...p.spawn,dir:'up',walk:0};let frames=0;
      while(route.length&&frames++<2000){C.follow(p,player,route,.05);assert.ok(C.free(p,player.x,player.y),r.id+' colisão');}
      assert.equal(route.length,0,r.id+' trajeto interrompido');
      assert.ok(Math.hypot(player.x-r.target.x,player.y-r.target.y)<1,r.id+' não chegou');
      for(const exit of p.portals)assert.ok(C.route(p,grid,player,exit),r.id+' sem acesso a '+exit.id);
    }
    for(const f of p.furniture.filter(f=>f.solid))assert.equal(C.free(p,f.x+f.w/2,f.y+f.h/2),false);
    for(const portal of p.portals){
      assert.ok(C.free(p,portal.x,portal.y),p.building+' portal '+portal.id);
      if(portal.kind==='link'){
        const other=L.createBuilding(portal.building);
        assert.ok(other.portals.find(t=>t.id===portal.via&&t.building===p.building),'conexão de ida e volta');
      }
    }
  }
});

test('plantas completas cabem em retrato, paisagem e desktop',()=>{
  for(const p of plans)for(const [w,h] of [[320,320],[390,420],[844,160],[1280,550]]){
    const z=C.fitZoom(p,w,h),cam=C.camera(p,p.spawn,w,h,z,true);
    for(const [x,y] of p.outline){assert.ok((x-cam.x)*z>=0&&(x-cam.x)*z<=w);assert.ok((y-cam.y)*z>=0&&(y-cam.y)*z<=h);}
  }
});
