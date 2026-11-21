const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const A=require('../interiores/access'),D=require('../interiores/data'),L=require('../interiores/layout'),C=require('../interiores/core');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const plans=[L.createFloor(1),L.createFloor(2)];

test('duas plantas em L, com as alas corretas e o exterior sem acesso',()=>{
  for(const p of plans){
    assert.ok(p.floors.length>2,'planta inclui a convivência curva');
    assert.ok(p.floors[0].w>p.floors[0].h);
    assert.ok(p.floors[1].h>p.floors[1].w);
    assert.ok(p.floors[1].x>p.floors[0].x);
    assert.ok(C.free(p,p.spawn.x,p.spawn.y));
    for(const [x,y] of [[0,0],[1000,800],[1800,500],[2660,1800],[1024,1870]])assert.equal(C.free(p,x,y),false,'fundo preto é fora do prédio');
  }
  assert.equal(plans[0].rooms.length,25);assert.equal(plans[1].rooms.length,27);
  assert.ok(plans[0].rooms.every(r=>/^[ACE]/.test(r.id)||r.id==='WC-A'));
  assert.ok(plans[1].rooms.every(r=>/^[BDF]/.test(r.id)||r.id==='WC-D'));
});

test('sequência de salas preservada nas duas paredes e nas duas alas',()=>{
  const sequence=(p,g,s)=>p.rooms.filter(r=>r.group===g&&r.side===s).sort((a,b)=>g==='A'||g==='B'?b.y-a.y:b.x-a.x).map(r=>r.id);
  assert.deepEqual(sequence(plans[0],'C','direita'),['C08','C07','C06']);
  assert.deepEqual(sequence(plans[0],'C','esquerda'),['C01','C02','C03','C04','C05']);
  assert.deepEqual(sequence(plans[0],'E','direita'),['E08','E07','E06','E05']);
  assert.deepEqual(sequence(plans[0],'E','esquerda'),['E01','E02','E03','E04']);
  assert.deepEqual(sequence(plans[0],'A','direita'),['A08','A07','A06','A05','A04']);
  assert.deepEqual(sequence(plans[0],'A','esquerda'),['WC-A','A01','A02','A03']);
  assert.deepEqual(sequence(plans[1],'D','direita'),['WC-D','D08','D07','D06']);
  assert.deepEqual(sequence(plans[1],'D','esquerda'),['D01','D02','D03','D04','D05']);
  assert.deepEqual(sequence(plans[1],'F','direita'),['F09','F08','F07','F06','F05']);
  assert.deepEqual(sequence(plans[1],'F','esquerda'),['F01','F02','F03','F04']);
  assert.deepEqual(sequence(plans[1],'B','direita'),['B07','B06','B05','B04','B-nova-direita']);
  assert.deepEqual(sequence(plans[1],'B','esquerda'),['B01','B02','B-nova-esquerda']);
  const p=plans[1],f10=p.rooms.find(r=>r.id==='F10');
  assert.ok(f10.x<p.rooms.find(r=>r.id==='D06').x);
  assert.ok(f10.x>p.rooms.find(r=>r.id==='F09').x+p.rooms.find(r=>r.id==='F09').w);
  const news=p.rooms.filter(r=>r.id.startsWith('B-nova'));
  assert.equal(news[0].y,news[1].y);assert.equal(news[0].door.y,news[1].door.y);
  assert.ok(C.free(p,2368,news[0].door.y));assert.ok(p.portals.some(x=>x.id==='upper-exit'));
  assert.equal(D.rooms.B03,undefined);
});

test('todas as 52 salas são alcançáveis pela porta e permitem voltar pelo mesmo mapa',()=>{
  for(const p of plans){
    const grid=C.makeGrid(p);
    for(const r of p.rooms){
      assert.ok(C.free(p,r.entry.x,r.entry.y),r.id+' entrada');
      assert.ok(C.lineFree(p,r.exterior,r.entry),r.id+' soleira livre');
      const route=C.route(p,grid,p.spawn,r.target);assert.ok(route,r.id+' sem caminho');
      const player={...p.spawn,dir:'down',walk:0};
      let frames=0;while(route.length&&frames++<2000){C.follow(p,player,route,.05);assert.ok(C.free(p,player.x,player.y),r.id+' colidiu durante o trajeto');}
      assert.equal(route.length,0,r.id+' percurso não terminou');assert.equal(C.roomAt(p,player.x,player.y)?.id,r.id);
      assert.ok(Math.hypot(player.x-r.target.x,player.y-r.target.y)<1);
      assert.ok(C.route(p,grid,player,p.spawn),r.id+' sem retorno');
    }
    for(const portal of p.portals)assert.ok(C.route(p,grid,p.spawn,portal),portal.id+' sem acesso');
  }
});

test('paredes e móveis têm colisão; movimento diagonal não acelera nem atravessa parede',()=>{
  for(const p of plans){
    for(const f of p.furniture.filter(f=>f.solid))assert.equal(C.free(p,f.x+f.w/2,f.y+f.h/2),false);
    const player={...p.spawn,walk:0};C.move(p,player,-3000,0);assert.ok(player.x>=86);assert.ok(C.free(p,player.x,player.y));
    const start={x:2368,y:1500,walk:0},a={...start},b={...start};C.step(p,a,{right:true},.05);C.step(p,b,{right:true,up:true},.05);
    assert.ok(Math.abs(Math.hypot(a.x-start.x,a.y-start.y)-Math.hypot(b.x-start.x,b.y-start.y))<.001);
  }
});

test('andar inteiro cabe na câmera em desktop, retrato e paisagem',()=>{
  for(const p of plans)for(const [w,h] of [[1280,573],[390,570],[320,340],[844,245]]){
    const z=C.fitZoom(p,w,h),cam=C.camera(p,p.spawn,w,h,z,true);
    for(const [x,y] of p.outline){assert.ok((x-cam.x)*z>=0&&(x-cam.x)*z<=w);assert.ok((y-cam.y)*z>=0&&(y-cam.y)*z<=h);}
  }
});

test('páginas por andar, dependências locais e entrada externa atualizada',()=>{
  for(const [file,n] of [['primeiro-andar.html',1],['segundo-andar.html',2]]){
    const html=read('interiores/'+file);assert.ok(html.includes('data-floor="'+n+'"'));
    const assets=[...html.matchAll(/(?:src|href)="([^"#?]+\.(?:js|css))(?:\?[^"#]*)?"/g)];
    assert.equal(assets.length,9);
    for(const [,file] of assets)assert.ok(fs.existsSync(path.join(__dirname,'..','interiores',file)));
    assert.ok(!html.includes('id="flip"'));assert.ok(!html.includes('id="jump"'));
  }
  assert.match(read('index.html'),/href="interiores\/primeiro-andar.html"/);
  assert.match(read('interiores/principal.html'),/location.replace/);
  assert.deepEqual(plans[0].pending,['C09']);
});

function engine(floor=1,hash='',search='',saved={},building='principal'){
  const noop=()=>{},elements=new Map(),events={},storage=new Map(Object.entries(saved));
  function el(id=''){
    const handlers={},classes=new Set();
    return {id,style:{},dataset:{},children:[],hidden:id==='dpad',disabled:false,open:false,value:'',tagName:'DIV',
      classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},setAttribute:noop,getContext:()=>({}),
      addEventListener:(event,fn)=>(handlers[event]||=[]).push(fn),
      emit(event,props={}){for(const fn of handlers[event]||[])fn({target:this,preventDefault:noop,...props});},
      append(...xs){this.children.push(...xs);},replaceChildren(){this.children=[];},focus:noop,
      showModal(){this.open=true;},close(){this.open=false;},setPointerCapture:noop,
      getBoundingClientRect:()=>({left:0,top:0,width:1280,height:573})};
  }
  const get=id=>{if(!elements.has(id))elements.set(id,el(id));return elements.get(id);};
  get('dpad');
  const buttons=['up','down','left','right'].map(dir=>{const b=get(dir);b.dataset.direction=dir;return b;});
  const sandbox={console,URLSearchParams,performance:{now:()=>0},devicePixelRatio:1,InteriorCore:C,CampusAccess:A,CampusInteriors:D,InteriorLayout:L,CampusPlaces:require('../interiores/places'),CampusLayout:require('../interiores/campus-layout'),InteriorArt:{background:noop,draw:noop},
    location:{hash,search,assign:url=>sandbox.location.destination=url,replace:url=>sandbox.location.destination=url},
    sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    requestAnimationFrame:noop,ResizeObserver:class{observe(){}},addEventListener:(name,fn)=>(events[name]||=[]).push(fn),
    document:{body:{dataset:{floor:String(floor),building},classList:{toggle:noop}},getElementById:get,createElement:()=>el(),querySelectorAll:q=>q==='[data-direction]'?buttons:[],addEventListener:noop}
  };sandbox.window=sandbox;
  vm.runInNewContext(read('interiores/engine.js').replace(/\}\)\(\);\s*$/,'globalThis.inspect = expression => eval(expression);\n})();'),sandbox);
  return {run:s=>sandbox.inspect(s),elements,emit:(name,e={})=>{for(const fn of events[name]||[])fn(e);}};
}

test('selecionar sala caminha sem trocar página; escada e elevador levam à outra página',()=>{
  const e=engine();e.run("chooseRoom('C02')");
  assert.equal(e.run('player.x'),plans[0].spawn.x,'seleção não teletransporta');
  for(let i=1;i<450;i++)e.run('frame('+i*50+')');
  assert.equal(e.run('C.roomAt(plan,player.x,player.y).id'),'C02');
  assert.equal(e.run('location.destination'),undefined);
  e.run("walkTo(plan.portals.find(p=>p.id==='stairs'))");
  for(let i=450;i<900;i++)e.run('frame('+i*50+')');
  e.run('activate()');assert.equal(e.run('location.destination'),'segundo-andar.html#via=stairs');
  const upper=engine(2,'#via=lift');assert.equal(upper.run('active.id'),'lift');upper.run('activate()');
  assert.equal(upper.run('location.destination'),'primeiro-andar.html#via=lift');
});

test('novos interiores usam a entrada escolhida e não herdam a origem de outro edifício',()=>{
  const P=require('../interiores/places');
  for(const b of Object.values(P.buildings))for(const entry of b.entries){
    const saved={'ifc-interior-origin':'4','ifc-exterior-return':JSON.stringify({buildingId:'principal',entryId:'4'})};
    saved['ifc-topdown-v3-'+b.id+'-'+entry.floor]=JSON.stringify({x:0,y:0,overview:true});
    const e=engine(entry.floor,'','?entrada='+entry.id,saved,b.id);
    assert.equal(e.run('player.x'),entry.inside.spawn[0]);assert.equal(e.run('player.y'),entry.inside.spawn[1]);
    assert.equal(e.run('active.accessId'),entry.id,b.id+' ação na entrada');
    assert.equal(e.elements.get('campus-link').href,A.exitURL(entry.id,b.id));
    e.elements.get('directory-open').emit('click');assert.ok(e.elements.get('room-list').children.length>1);
    e.elements.get('directory').close();e.run('activate()');assert.equal(e.run('location.destination'),A.exitURL(entry.id,b.id));
  }
  for(const [building,via,destination] of [['biblioteca','pedagogico','pedagogico.html#via=biblioteca'],['pedagogico','biblioteca','biblioteca.html#via=pedagogico']]){
    const e=engine(1,'#via='+via,'',{},building);assert.equal(e.run('active.kind'),'link');e.run('activate()');assert.equal(e.run('location.destination'),destination);
  }
});

test('controle começa oculto e para após toque cancelado ou perda de foco',()=>{
  const e=engine();assert.equal(e.elements.get('dpad').hidden,true);e.elements.get('controls').emit('click');assert.equal(e.elements.get('dpad').hidden,false);
  e.elements.get('right').emit('pointerdown',{pointerId:1});e.run('frame(50)');const x=e.run('player.x');assert.ok(x>1024);
  e.elements.get('right').emit('pointercancel',{pointerId:1});e.run('frame(100)');assert.equal(e.run('player.x'),x);
  e.run("chooseRoom('E01')");e.emit('blur');e.run('frame(150)');assert.equal(e.run('path.length'),0);assert.equal(e.run('player.x'),x);
});

test('cada entrada externa coloca o aluno no ponto e no andar correspondentes, antes da posição salva',()=>{
  for(const entry of A.entries.filter(e=>e.canEnter)){
    const e=engine(entry.floor,'','?entrada='+entry.id,{['ifc-topdown-v3-'+entry.floor]:JSON.stringify({x:1024,y:1616,zoom:.3,overview:true})});
    assert.equal(e.run('player.x'),entry.inside.spawn[0]);assert.equal(e.run('player.y'),entry.inside.spawn[1]);
    assert.equal(e.run('player.dir'),entry.inside.dir);assert.equal(e.run('overview'),false);
    assert.equal(e.run('C.free(plan,player.x,player.y)'),true,entry.id+' spawn bloqueado');
    assert.equal(e.elements.get('campus-link').href,A.exitURL(entry.id));
    assert.equal(e.run('active.accessId'),entry.id);
    assert.ok(e.run('C.route(plan,grid,player,plan.spawn)'),entry.id+' sem acesso ao corredor');
    e.run('activate()');assert.equal(e.run('location.destination'),A.exitURL(entry.id));
  }
  const e=engine(1,'','?entrada=superior');assert.equal(e.run('location.destination'),'segundo-andar.html?entrada=superior');
});

test('retorno ao campus conserva a entrada de origem após mudar de andar; saídas locais prevalecem',()=>{
  const e=engine(2,'#via=stairs','',{'ifc-interior-origin':'3'});
  assert.equal(e.elements.get('campus-link').href,A.exitURL('3'));
  e.run("walkTo(plan.portals.find(p=>p.accessId==='emergencia'))");
  for(let i=1;i<400;i++)e.run('frame('+i*50+')');
  e.run('activate()');assert.equal(e.run('location.destination'),A.exitURL('emergencia'));
});

test('origem também viaja na URL entre andares quando não há posição na sessão',()=>{
  const e=engine(1,'#via=stairs','?origem=3');
  assert.equal(e.elements.get('campus-link').href,A.exitURL('3'));
  e.run('activate()');assert.equal(e.run('location.destination'),'segundo-andar.html?origem=3#via=stairs');
});

test('duas escadas e elevador na área curva preservam o acesso entre os andares',()=>{
  for(const p of plans){
    assert.equal(p.portals.filter(x=>x.kind==='stairs').length,2);
    const lift=p.portals.find(x=>x.kind==='lift');assert.ok(lift.x>1900&&lift.y<1100);
    for(const target of [{x:1816,y:1160},{x:1040,y:1772},{x:2390,y:1500}])assert.ok(C.route(p,C.makeGrid(p),p.spawn,target));
  }
  const p=plans[1],f10=p.rooms.find(r=>r.id==='F10');
  assert.equal(p.zones.some(z=>z.label==='CONVIVÊNCIA'&&C.contains(f10,z.x,z.y)),false);
  const e=engine(1,'','?entrada=4');e.run("walkTo(plan.portals.find(p=>p.id==='stairs-east'))");
  for(let i=1;i<600;i++)e.run('frame('+i*50+')');
  assert.equal(e.run('active.id'),'stairs-east');e.run('activate()');
  assert.equal(e.run('location.destination'),'segundo-andar.html?origem=4#via=stairs-east');
  const upper=engine(2,'#via=stairs-east','?origem=4');assert.equal(upper.run('active.id'),'stairs-east');
  assert.equal(upper.elements.get('campus-link').href,A.exitURL('4'));
});
