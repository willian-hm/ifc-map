/* Edifícios adicionais. Funções dos ambientes são referências; as plantas são ilustrativas. */
(function(root){
  'use strict';
  const buildings={};
  function add(id,name,file,entries,extra={}){buildings[id]={id,name,file,entries,illustrative:true,...extra};}
  function entry(id,label,door,spawn,portal,inside,dir='up',insideDir='up',floor=1){
    return {id:String(id),label,short:'SAÍDA',floor,canEnter:true,outside:{door,spawn,dir},inside:{portal,spawn:inside,dir:insideDir}};
  }
  add('guarita','Guarita','guarita.html',[entry(1,'Entrada da guarita',[1630,1797],[1630,1819],[320,424],[320,392])]);
  add('admin','Bloco Administrativo','administrativo.html',[entry(1,'Entrada do Administrativo',[1185,1323],[1185,1345],[640,808],[640,776])]);
  add('labs','Laboratórios','laboratorios.html',[
    entry(1,'Laboratórios · Acesso superior',[719,581],[719,603],[1112,366],[1112,334]),
    entry(2,'Laboratórios · Acesso inferior',[719,746],[719,768],[1112,1158],[1112,1126])]);
  add('estufas','Estufas Agrícolas','estufa-1.html',[
    entry(1,'Estufa superior',[424,651],[424,673],[640,640],[640,608]),
    entry(2,'Estufa inferior',[424,723],[424,745],[640,640],[640,608],'up','up',2)
  ],{pages:{1:'estufa-1.html',2:'estufa-2.html'}});
  add('barracao','Barracão / Garagem','barracao.html',[entry(1,'Entrada do barracão',[58,908],[58,930],[640,808],[640,776])]);
  add('auditorio','Auditório','auditorio.html',[entry(1,'Entrada do auditório',[1060,643],[1060,665],[640,1064],[640,1032])]);
  add('biblioteca','Biblioteca','biblioteca.html',[entry(1,'Entrada da biblioteca',[1463,683],[1463,705],[720,1064],[720,1032])]);
  add('copa','Copa / Cantina','copa.html',[entry(1,'Entrada da copa',[1747,847],[1747,869],[480,728],[480,696])]);
  add('refeitorio','Refeitório','refeitorio.html',[entry(1,'Entrada do refeitório',[2336,526],[2314,526],[92,744],[128,744],'right','right')]);
  add('ginasio','Ginásio Poliesportivo','ginasio.html',[
    entry(1,'Ginásio · Entrada da quadra',[2850,1026],[2850,1048],[1080,1368],[1080,1336]),
    entry(2,'Ginásio · Entrada dos vestiários',[2685,1026],[2685,1048],[240,1368],[240,1336])]);
  add('almoxarifado','Almoxarifado','almoxarifado.html',[entry(1,'Entrada do almoxarifado',[660,1135],[660,1157],[600,664],[600,632])]);
  add('pedagogico','Bloco Pedagógico','pedagogico.html',[entry(1,'Entrada lateral do Pedagógico',[1391,654],[1373,654],[92,488],[128,488],'right','right')]);
  add('salas-1','Bloco de Salas 1','bloco-salas-1.html',[entry(1,'Entrada do Bloco de Salas 1',[956,895],[956,917],[480,824],[480,792])]);
  add('salas-2','Bloco de Salas 2','bloco-salas-2.html',[entry(1,'Entrada do Bloco de Salas 2',[1116,895],[1116,917],[480,824],[480,792])]);
  const get=id=>buildings[id]||null;
  const page=(id,floor=1)=>{const b=get(id);return b?(b.pages?.[floor]||b.file):null;};
  const api={buildings,get,page};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampusPlaces=api;
})(globalThis);
