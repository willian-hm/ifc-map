/* Catálogo separado da arte: posições do principal fornecidas pelo usuário em 13/11/2026. */
(function (root) {
  'use strict';
  const rooms = {};
  const add = (id, name, kind = 'classroom', note = '', source = 'usuario') => {
    rooms[id] = { id, name, kind, note, source }; return id;
  };
  for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const count = { A: 8, B: 7, C: 8, D: 8, E: 8, F: 10 }[letter];
    for (let n = 1; n <= count; n++) {
      const id = letter + String(n).padStart(2, '0'); add(id, 'Sala de aula');
    }
  }
  delete rooms.B03; // O antigo miniauditório foi substituído: correção do usuário.
  const named = [
    ['A08', 'Centro de distribuição de energia', 'energy', 'Painéis elétricos representados de forma ilustrativa.'],
    ['C01', 'Reprografia', 'office', 'À esquerda de quem entra pela Entrada 1 e segue para a ala C.'],
    ['C02', 'Laboratório de alimentos', 'foodlab'], ['C03', 'Assistência social e ambulatório', 'care'],
    ['C04', 'Laboratório de desenho', 'drawing'], ['C05', 'SISAE · Apoio ao estudante', 'office'],
    ['C06', 'Atendimento educacional especializado', 'office'], ['C07', 'Pesquisa, estágio e extensão', 'office'],
    ['C08', 'Registros acadêmicos', 'office'], ['C09', 'Recepção pedagógica', 'reception', 'Posição no corredor a confirmar.'],
    ['D01', 'Atendimento de TI', 'office'], ['D02', 'Laboratório de informática 1', 'computer'],
    ['D03', 'Laboratório de informática 2', 'computer'], ['D04', 'Laboratório de informática 3', 'computer'],
    ['D05', 'Laboratório de informática 4', 'computer'], ['D06', 'Laboratório de redes', 'network'],
    ['D07', 'Laboratório de informática 6', 'computer'], ['D08', 'Laboratório de informática 7', 'computer'],
    ['F01', 'Práticas pedagógicas', 'classroom'], ['F02', 'Brinquedoteca', 'playroom'],
    ['F03', 'Laboratório de física', 'physics'], ['F04', 'Segurança do trabalho', 'safety'],
    ['F05', 'Sala de aula', 'classroom'], ['F06', 'Laboratório de informática', 'computer'],
    ['F07', 'Prática pedagógica · Computação', 'workshop', 'Mesas voltadas para a porta, conforme descrição do usuário.'],
    ['F08', 'Sala de aula pequena', 'smallclass'], ['F09', 'Fábrica de software', 'software'],
    ['F10', 'Datacenter', 'datacenter', 'Na ligação entre D e F. Porta identificada na foto do usuário.']
  ];
  for (const [id, name, kind, note] of named) add(id, name, kind, note || '', 'cic-ppc-fotos');
  add('WC-A', 'Banheiros · Ala A', 'restroom'); add('WC-D', 'Banheiros · Ala D', 'restroom');
  add('B-nova-direita', 'Sala nova · Direita', 'classroom', 'Sem numeração. No antigo espaço do miniauditório.');
  add('B-nova-esquerda', 'Sala nova · Esquerda', 'classroom', 'Sem numeração. Corredor e saída entre as duas salas.');
  const zone = (label, left, right) => ({ label, left, right });
  const lounge = (shared = []) => ({ lounge: true, label: 'Convivência', shared });
  const principal = {
    name: 'Prédio Principal', illustrated: false, start: 'ce',
    areas: {
      ce: { name: 'Ala horizontal · C e E', floor: 1, wing: 'horizontal', stairsTo: 'df', wingTo: 'a',
        sections: [zone('C', ['C02','C03','C04','C05'], ['C08','C07','C06']), lounge(),
          zone('E', ['E01','E02','E03','E04'], ['E08','E07','E06','E05'])] },
      df: { name: 'Ala horizontal · D e F', floor: 2, wing: 'horizontal', stairsTo: 'ce', wingTo: 'b',
        sections: [zone('D', ['D01','D02','D03','D04','D05'], ['WC-D','D08','D07','D06']), lounge(['F10']),
          zone('F', ['F01','F02','F03','F04'], ['F09','F08','F07','F06','F05'])] },
      a: { name: 'Ala vertical · A', floor: 1, wing: 'vertical', stairsTo: 'b', wingTo: 'ce',
        sections: [zone('A', ['WC-A','A01','A02','A03'], ['A08','A07','A06','A05','A04']), lounge()] },
      b: { name: 'Ala vertical · B', floor: 2, wing: 'vertical', stairsTo: 'a', wingTo: 'df', upperExit: true,
        sections: [lounge(), zone('B', ['B01','B02'], ['B07','B06','B05','B04']),
          zone('Salas novas', ['B-nova-esquerda'], ['B-nova-direita'])] }
    },
    extras: [{ id: 'C01', area: 'ce' }, { id: 'C09', area: 'ce' }]
  };
  const buildings = { principal };
  const api = { rooms, buildings };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CampusInteriors = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
