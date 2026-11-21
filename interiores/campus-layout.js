/* Plantas exploráveis dos demais edifícios. Divisões e mobiliário provisórios. */
(function(root){
  'use strict';
  const P=typeof module!=='undefined'&&module.exports?require('./places.js'):root.CampusPlaces;
  const box=(x,y,w,h,extra={})=>({x,y,w,h,...extra});
  const NOTE='Planta ilustrativa: divisões, posição dos ambientes e mobiliário a confirmar.';
  function createBuilding(id,floor=1){
    const building=P.get(id);if(!building)throw new Error('Edifício desconhecido: '+id);
    const entries=building.entries.filter(e=>e.floor===floor);
    const plan={building:id,name:building.name,floor,width:1280,height:896,rooms:[],walls:[],furniture:[],windows:[],
      floors:[],halls:[],outline:[],spawn:{x:entries[0].inside.spawn[0],y:entries[0].inside.spawn[1]},pending:[],
      portals:entries.map(e=>({id:'entry-'+e.id,accessId:e.id,kind:'exit',x:e.inside.portal[0],y:e.inside.portal[1],short:'SAÍDA',label:e.label})),
      zones:[],lounges:[],tactile:[],decals:[],note:NOTE};
    const wall=(x,y,w,h)=>{if(w>0&&h>0)plan.walls.push(box(x,y,w,h));};
    const put=(kind,x,y,w,h,extra={})=>{const f=box(x,y,w,h,{kind,solid:true,...extra});plan.furniture.push(f);return f;};
    function shell(w,h,points=null,floors=null){
      plan.width=w;plan.height=h;
      plan.outline=points||[[64,64],[w-64,64],[w-64,h-64],[64,h-64]];
      plan.floors=floors||[box(64,64,w-128,h-128)];
    }
    function area(key,name,x,y,w,h,kind='empty',short=name){
      const r=box(x,y,w,h,{id:id+'-'+key,name,kind,shortLabel:short,group:'Ambientes',note:NOTE,target:{x:x+w/2,y:y+h/2},entry:{x:x+w/2,y:y+h/2}});
      plan.rooms.push(r);return r;
    }
    function room(key,name,x,y,w,h,edge='south',kind='classroom',short=name){
      const r=area(key,name,x,y,w,h,kind,short),cx=x+w/2,cy=y+h/2,gap=64;
      r.edge=edge;r.door=(edge==='north'||edge==='south')?{x:cx,y:edge==='north'?y:y+h,axis:'x'}:{x:edge==='west'?x:x+w,y:cy,axis:'y'};
      const splitH=yy=>{wall(x,yy,w/2-gap/2,8);wall(cx+gap/2,yy,w/2-gap/2,8);};
      const splitV=xx=>{wall(xx,y,8,h/2-gap/2);wall(xx,cy+gap/2,8,h/2-gap/2);};
      edge==='north'?splitH(y):wall(x,y,w,8);edge==='south'?splitH(y+h-8):wall(x,y+h-8,w,8);
      edge==='west'?splitV(x):wall(x,y,8,h);edge==='east'?splitV(x+w-8):wall(x+w-8,y,8,h);
      r.entry={x:r.door.x+(edge==='west'?36:edge==='east'?-36:0),y:r.door.y+(edge==='north'?36:edge==='south'?-36:0)};
      r.exterior={x:r.door.x+(edge==='west'?-28:edge==='east'?28:0),y:r.door.y+(edge==='north'?-28:edge==='south'?28:0)};
      if(edge==='south'||edge==='north')plan.windows.push(box(x+24,edge==='south'?y+2:y+h-5,w-48,3));
      else plan.windows.push(box(edge==='east'?x+2:x+w-5,y+24,3,h-48));
      furnish(r);return r;
    }
    function furnish(r){
      const {x,y,w,h,kind:k}=r;
      const d=r.door,t=r.target,vertical=d.axis==='x';
      const aisle=vertical?box(t.x-28,Math.min(d.y,t.y)-28,56,Math.abs(d.y-t.y)+56):box(Math.min(d.x,t.x)-28,t.y-28,Math.abs(d.x-t.x)+56,56);
      const add=(kind,x,y,w,h,extra={})=>{if(extra.solid!==false&&x<aisle.x+aisle.w&&x+w>aisle.x&&y<aisle.y+aisle.h&&y+h>aisle.y)return;put(kind,x,y,w,h,extra);};
      const xs=[x+24,x+w-74],ys=[y+34,y+h-74];
      if(k==='empty')return;
      if(k==='classroom'||k==='computer'){
        for(const xx of xs)for(let yy=y+40;yy<y+h-42;yy+=62)add(k==='computer'?'computer':'desk',xx,yy,48,30);
        add('board',x+w/2-44,y+13,88,5,{solid:false});
      }else if(k==='office'||k==='study'){
        for(const xx of xs)add(k==='office'?'office':'table',xx,y+40,50,34);
        add('shelf',x+24,y+h-48,w-48,22);
      }else if(k==='restroom'){
        for(const xx of xs){add('sink',xx,y+30,42,30);add('toilet',xx,y+h-68,42,38);}
      }else if(k==='storage'){
        for(const xx of xs)add('shelf',xx,y+28,44,h-56);
      }else if(k==='kitchen'){
        add('counter',x+20,y+20,w-40,34);add('sink',x+24,y+h-64,50,36);add('stove',x+w-82,y+h-64,56,36);
      }else{
        for(const xx of xs)for(const yy of ys)add(k==='chemistry'?'chemistry':k==='biology'?'microscope':k==='changing'?'lockers':'bench',xx,yy,48,34);
        if(k==='changing')add('bench',x+24,y+h/2-16,44,28);
      }
    }
    function guide(points){plan.tactile.push(points);}
    function tables(x,y,cols,rows,dx=150,dy=124){for(let a=0;a<cols;a++)for(let b=0;b<rows;b++)put('social-table',x+a*dx,y+b*dy,88,50);}
    function link(key,label,target,x,y,via){
      put('stairs',x-48,y-80,96,72,{solid:false,variant:'return'});
      plan.portals.push({id:key,kind:'link',label,short:target==='biblioteca'?'BIBLIOTECA':'PEDAGÓGICO',x,y,building:target,via});
    }

    switch(id){
      case 'admin':
        shell(1280,896);
        room('direcao','Direção',80,80,352,300,'south','office');
        room('secretaria','Secretaria acadêmica',448,80,352,300,'south','office','Secretaria');
        room('reuniao','Sala de reuniões',816,80,384,300,'south','study','Reuniões');
        room('administracao','Setores administrativos',80,512,400,304,'north','office','Administração');
        room('arquivo','Arquivo',800,512,224,304,'north','storage');
        room('banheiro','Banheiro',1040,512,160,304,'north','restroom','WC');
        area('recepcao','Recepção',496,512,288,272,'empty');put('counter',524,548,92,38);put('sofa',694,654,64,30);
        guide([[640,812],[640,440],[256,440],[1008,440]]);break;
      case 'pedagogico':
        shell(1408,960);
        room('atendimento','Atendimento pedagógico',80,80,368,344,'south','office','Atendimento');
        room('coordenacao','Coordenação de ensino',464,80,432,344,'south','office','Coordenação');
        room('professores','Sala dos professores',912,80,416,344,'south','study','Professores');
        room('apoio','Apoio ao estudante',80,560,368,320,'north','office','Apoio');
        room('reunioes','Reuniões pedagógicas',464,560,432,320,'north','study','Reuniões');
        room('wc','Banheiro',912,560,184,320,'north','restroom','WC');
        link('biblioteca','Subir para a Biblioteca','biblioteca',1216,792,'pedagogico');
        guide([[96,488],[1216,488],[1216,792]]);break;
      case 'labs':
        shell(1248,1248,[[64,64],[1184,64],[1184,392],[384,392],[384,856],[1184,856],[1184,1184],[64,1184]],
          [box(64,64,1120,328),box(64,392,320,464),box(64,856,1120,328)]);
        room('quimica','Laboratório de Química',80,80,304,184,'south','chemistry','Química');
        room('biologia','Laboratório de Biologia',400,80,304,184,'south','biology','Biologia');
        room('preparo','Preparo de materiais',720,80,304,184,'south','chemistry','Preparo');
        room('apoio','Apoio aos laboratórios',80,408,176,200,'east','storage','Apoio');
        room('wc','Banheiro',80,632,176,200,'east','restroom','WC');
        room('agro','Práticas de agroindústria',80,992,304,176,'north','kitchen','Agroindústria');
        room('alimentos','Laboratório de Alimentos',400,992,304,176,'north','chemistry','Alimentos');
        room('praticas','Bancadas de práticas',720,992,304,176,'north','biology','Práticas');
        put('lockers',512,352,192,24);guide([[1112,366],[1112,320],[320,320],[320,920],[1112,920],[1112,1158]]);break;
      case 'biblioteca':
        shell(1440,1152);
        room('estudo-a','Sala de estudo 1',80,80,240,240,'south','study','Estudo 1');
        room('estudo-b','Sala de estudo 2',336,80,240,240,'south','study','Estudo 2');
        room('processamento','Processamento técnico',592,80,272,240,'south','office','Processamento');
        room('wc-a','Banheiro 1',880,80,232,240,'south','restroom','WC 1');
        room('wc-b','Banheiro 2',1128,80,232,240,'south','restroom','WC 2');
        const acervo=area('acervo','Acervo bibliográfico',80,400,520,352,'empty','Acervo');
        for(const x of [112,264,416])for(const y of [432,632])put('bookcase',x,y,48,96);
        acervo.target={x:340,y:576};
        const reading=area('leitura','Área de leitura',656,400,680,352,'empty','Leitura');tables(688,436,4,2,160,180);reading.target={x:1000,y:584};
        room('copa','Copa de apoio',80,816,176,240,'east','kitchen','Copa');
        room('deposito','Depósito',1104,816,256,240,'west','storage','Depósito');
        const pcs=area('consultas','Consulta e computadores',480,816,560,240,'empty','Consultas');
        for(const x of [504,632,824,952])for(const y of [848,976])put('computer',x,y,48,32);
        pcs.target={x:760,y:936};
        const loan=area('emprestimo','Balcão de empréstimos',640,332,320,60,'empty','Empréstimos');put('counter',880,344,70,30);loan.target={x:800,y:368};
        link('pedagogico','Descer para o Pedagógico','pedagogico',352,1008,'biblioteca');
        guide([[720,1072],[720,784],[624,784],[624,368],[800,368]]);break;
      case 'auditorio':
        shell(1280,1152,[[208,64],[1072,64],[1216,208],[1216,1088],[64,1088],[64,208]],
          [box(208,64,864,144),box(64,208,1152,880)]);
        for(let y=64;y<208;y+=4){const x=272-y;plan.floors.push(box(x,y,1280-2*x,4));wall(x,y,6,4);wall(1280-x-6,y,6,4);}
        const stage=area('palco','Palco',224,88,832,180,'empty','Palco');put('stage',224,88,832,180,{solid:false});put('podium',920,152,40,40);stage.target={x:640,y:184};
        const seats=area('plateia','Plateia',144,328,992,584,'empty','Plateia');
        for(let row=0;row<8;row++)for(const start of [168,744])for(let col=0;col<6;col++)put('seat',start+col*56,360+row*68,28,28);
        seats.target={x:640,y:620};
        room('tecnica','Apoio técnico',80,960,280,112,'north','empty','Apoio');put('office',112,990,58,34);
        room('wc','Banheiro',920,960,280,112,'north','empty','WC');put('sink',944,988,44,30);put('toilet',1112,988,42,38);
        guide([[640,1068],[640,304]]);break;
      case 'ginasio':
        shell(1728,1456,[[64,400],[416,400],[416,64],[1664,64],[1664,1392],[64,1392]],
          [box(416,64,1248,1328),box(64,400,352,992)]);
        const court=area('quadra','Quadra poliesportiva',552,224,984,992,'empty','Quadra');put('court',552,224,984,992,{solid:false});court.target={x:1044,y:720};
        for(let y=272;y<1200;y+=200){put('bleacher',440,y,72,136);put('bleacher',1576,y,64,136);}
        room('vestiario-a','Vestiário 1',80,416,176,256,'east','changing','Vestiário 1');
        room('vestiario-b','Vestiário 2',80,696,176,256,'east','changing','Vestiário 2');
        room('materiais','Materiais esportivos',80,976,176,232,'east','storage','Materiais');
        put('ball-rack',88,1256,96,48);guide([[240,1368],[320,1368],[320,1280],[1080,1280],[1080,1368]]);break;
      case 'refeitorio':
        shell(1536,1088);
        room('cozinha','Cozinha',80,80,688,320,'south','kitchen','Cozinha');
        room('despensa','Despensa',784,80,304,320,'south','storage','Despensa');
        room('apoio','Apoio e recebimento',1104,80,352,320,'south','storage','Apoio');
        const dining=area('refeicoes','Salão de refeições',208,560,1184,432,'empty','Refeições');
        tables(240,600,7,3,156,132);dining.target={x:792,y:812};
        put('serving',416,444,640,48);put('sink',112,888,48,64);guide([[96,744],[176,744],[176,520],[1152,520]]);break;
      case 'copa':
        shell(960,816);
        room('preparo','Preparo de lanches',80,80,512,256,'south','kitchen','Preparo');
        room('apoio','Apoio',608,80,272,256,'south','storage','Apoio');
        const cafe=area('convivencia','Mesas da cantina',112,456,736,256,'empty','Convivência');tables(144,492,4,2,192,132);cafe.target={x:480,y:596};
        put('serving',592,376,256,40);put('coffee',128,372,64,32);guide([[480,744],[480,416],[272,416]]);break;
      case 'almoxarifado':
        shell(1200,752);
        const shelves=area('estoque','Estoque de materiais',80,96,1040,384,'empty','Estoque');
        for(const x of [112,304,496,688,880,1072])for(const y of [144,352])put('stock',x,y,40,96);
        shelves.target={x:600,y:304};
        area('recebimento','Recebimento e separação',368,512,464,152,'empty','Recebimento');put('counter',384,544,112,44);put('office',104,568,80,40);put('stock',1000,544,88,64);
        guide([[600,672],[600,304]]);break;
      case 'barracao':
        shell(1280,896);
        room('ferramentas','Ferramentas e peças',80,80,280,240,'south','storage','Ferramentas');
        room('manutencao','Bancada de manutenção',376,80,480,240,'south','empty','Manutenção');put('bench',400,120,144,44);put('panel',768,120,40,80);
        room('apoio','Apoio',872,80,328,240,'south','office','Apoio');
        const garage=area('garagem','Garagem de máquinas',80,416,1120,376,'empty','Garagem');
        for(const x of [136,376,856,1096])put('tractor',x,480,72,144);
        garage.target={x:640,y:600};guide([[640,808],[640,376]]);break;
      case 'estufas':
        shell(1280,728);
        const beds=area('cultivo','Cultivo protegido · Estufa '+floor,96,104,1088,408,'empty','Cultivo');
        for(const x of [144,320,496,720,896,1072])put('growbed',x,144,64,320,{variant:floor});
        beds.target={x:640,y:320};
        area('preparo','Preparo de mudas',96,560,1088,80,'empty','Mudas');put('bench',128,584,208,36);put('growbed',904,584,208,36,{variant:floor});
        guide([[640,648],[640,112]]);break;
      case 'guarita':
        shell(640,512);
        const control=area('controle','Controle de acesso',96,96,448,304,'empty','Controle');put('office',112,136,100,48);put('shelf',112,344,100,28);put('sofa',448,224,80,32);
        control.target={x:320,y:256};plan.windows.push(box(64,144,4,152),box(572,120,4,96),box(144,64,320,4));guide([[320,432],[320,256]]);break;
      case 'salas-1':case 'salas-2':
        shell(960,912);
        room('sala-a','Sala nova · Lado esquerdo',80,80,336,368,'east','classroom','Sala nova');
        room('sala-b','Sala nova · Lado direito',544,80,336,368,'west','classroom','Sala nova');
        room('sala-c','Sala nova · Frente esquerda',80,480,336,304,'east','classroom','Sala nova');
        room('sala-d','Sala nova · Frente direita',544,480,336,304,'west','classroom','Sala nova');
        guide([[480,840],[480,112]]);break;
    }
    // Contorno externo com vãos nas portas. As saídas só são acionadas pelo jogador.
    for(let i=0;i<plan.outline.length;i++){
      const a=plan.outline[i],b=plan.outline[(i+1)%plan.outline.length];
      if(a[0]!==b[0]&&a[1]!==b[1])continue;
      const horizontal=a[1]===b[1],fixed=horizontal?a[1]:a[0],start=Math.min(horizontal?a[0]:a[1],horizontal?b[0]:b[1]),end=Math.max(horizontal?a[0]:a[1],horizontal?b[0]:b[1]);
      const gaps=plan.portals.filter(p=>p.kind==='exit'&&Math.abs((horizontal?p.y:p.x)-fixed)<36&&(horizontal?p.x:p.y)>start&&(horizontal?p.x:p.y)<end).map(p=>[(horizontal?p.x:p.y)-36,(horizontal?p.x:p.y)+36]).sort((a,b)=>a[0]-b[0]);
      let cursor=start;
      for(const [left,right] of [...gaps,[end,end]]){horizontal?wall(cursor,fixed-3,left-cursor,6):wall(fixed-3,cursor,6,left-cursor);cursor=right;}
    }
    plan.solids=plan.walls.concat(plan.furniture.filter(f=>f.solid));return plan;
  }
  const api={createBuilding};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampusLayout=api;
})(globalThis);
