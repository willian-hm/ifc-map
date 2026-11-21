/* Correspondência única entre as portas do campus e as plantas internas. */
(function(root){
  'use strict';
  const entries=[
    {id:'1',floor:1,label:'Entrada 1 · Ala C',short:'ENTR. 1',canEnter:true,
      outside:{door:[1305,1038],spawn:[1320,1038],dir:'left'},inside:{portal:[2568,1616],spawn:[2528,1616],dir:'left'}},
    {id:'2',floor:1,label:'Entrada 2 · Convivência',short:'ENTR. 2',canEnter:true,
      outside:{door:[905,1123],spawn:[905,1145],dir:'up'},inside:{portal:[1024,1822],spawn:[1024,1792],dir:'up'}},
    {id:'3',floor:1,label:'Entrada 3 · Corredor dos fundos',short:'FUNDOS',canEnter:true,
      outside:{door:[905,931],spawn:[905,913],dir:'down'},inside:{portal:[1024,1406],spawn:[1024,1432],dir:'down'}},
    {id:'4',floor:1,label:'Entrada 4 · Convivência curva',short:'ENTR. 4',canEnter:true,
      outside:{door:[1195,910],spawn:[1183,916],dir:'right'},inside:{portal:[1684,938],spawn:[1712,960],dir:'right'}},
    {id:'emergencia',floor:1,floors:[1,2],label:'Saída de emergência · Ala E / F',short:'EMERG.',canEnter:false,
      outside:{door:[529,1020],spawn:[511,1020],dir:'right'},inside:{portal:[112,1616],spawn:[136,1616],dir:'right'}},
    {id:'superior',floor:2,label:'Saída superior · Ala B',short:'SAÍDA B',canEnter:true,
      outside:{door:[1266,513],spawn:[1276,502],dir:'down'},inside:{portal:[2368,196],spawn:[2368,224],dir:'down'}}
  ];
  const P=typeof module!=='undefined'&&module.exports?require('./places.js'):root.CampusPlaces;
  const entriesFor=(building='principal')=>building==='principal'?entries:P.get(building)?.entries||[];
  const get=(id,building='principal')=>entriesFor(building).find(e=>e.id===String(id))||null;
  const forDoor=(door,building='principal')=>door?entriesFor(building).find(e=>e.outside.door[0]===door[0]&&e.outside.door[1]===door[1])||null:null;
  const interiorURL=(id,building='principal')=>{const e=get(id,building);return e?.canEnter?'interiores/'+(building==='principal'?(e.floor===2?'segundo':'primeiro')+'-andar.html':P.page(building,e.floor))+'?entrada='+encodeURIComponent(e.id):null;};
  const exitURL=(id,building='principal')=>'../index.html?from='+encodeURIComponent(building)+'&saida='+encodeURIComponent(get(id,building)?.id||(building==='principal'?'2':entriesFor(building).find(e=>e.canEnter)?.id)||'2');
  const api={entries,entriesFor,get,forDoor,interiorURL,exitURL};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CampusAccess=api;
})(globalThis);
