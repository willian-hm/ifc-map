// Regressões da geometria, câmera e entrada. Sem dependências: node --test tests/map.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const elements = new Map();
const noop = () => {};
function element(id) {
  const listeners = {}, classes = new Set();
  const context = new Proxy({
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    measureText: text => ({ width: text.length * 6 }), createPattern: () => 'pattern'
  }, { get: (o, k) => k in o ? o[k] : noop });
  return { id, style: {}, listeners, classList: {
    add: (...xs) => xs.forEach(x => classes.add(x)), remove: x => classes.delete(x),
    toggle: (x, force) => { const on = force === undefined ? !classes.has(x) : force; on ? classes.add(x) : classes.delete(x); return on; },
    contains: x => classes.has(x)
  }, getContext: () => context, setAttribute: noop, remove: noop,
    addEventListener: (name, fn) => (listeners[name] ||= []).push(fn),
    setPointerCapture: noop,
    getBoundingClientRect: () => id === 'joystick' ? { left: 18, top: 600, width: 108, height: 108 } :
      { left: 0, top: 0, width: 220, height: 144, bottom: sandbox.innerWidth <= 900 ? 107 : 96 },
    emit(name, props = {}) { for (const fn of listeners[name] || []) fn({ type: name, button: 0, preventDefault: noop, ...props }); }
  };
}
const sandbox = { console, performance, CampusAccess:require('../interiores/access'), innerWidth: 1280, innerHeight: 720, devicePixelRatio: 2,
  requestAnimationFrame: noop, setTimeout: noop, addEventListener: noop,
  document: { body: element('body'), getElementById: id => {
    if (!elements.has(id)) elements.set(id, element(id)); return elements.get(id);
  }, createElement: () => element('canvas'), addEventListener: noop }
};
sandbox.window = sandbox;
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'interiores/student.js'), 'utf8'),sandbox);
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
// Acesso apenas na VM de teste: nenhum gancho de depuração é publicado no HTML.
vm.runInNewContext(js.replace('})();', 'globalThis.inspectMap = expression => eval(expression);\n})();'), sandbox);
const run = expression => sandbox.inspectMap(expression);
run('init()');

test('três fileiras longitudinais, dois blocos completos e guarita sem totem', () => {
  assert.equal(run('PARK_ISLANDS.length'), 3);
  assert.equal(run('PARK_ISLANDS.every(r => r[3] > r[2])'), true);
  assert.equal(run('CLASSROOM_BLOCKS.length'), 2);
  assert.equal(run('CLASSROOM_BLOCKS.every(b => b.w === b.h - 20)'), true, 'cobertura quadrada');
  assert.equal(run('CLASSROOM_BLOCKS[0].y === CLASSROOM_BLOCKS[1].y'), true, 'blocos lado a lado');
  assert.ok(run('CLASSROOM_BLOCKS[1].x - (CLASSROOM_BLOCKS[0].x + CLASSROOM_BLOCKS[0].w)') >= 24, 'passagem entre salas');
  for (const id of ['salas-1', 'salas-2', 'almoxarifado']) {
    assert.equal(run(`SOLIDS.some(s => s.tag === '${id}') && WORLD_LABELS.some(l => l.id === '${id}')`), true);
  }
  assert.equal(run("SOLIDS.some(s => s.tag === 'totem')"), false);
  assert.equal(run('LAKE_DEFS[0].inside(COPA.x + COPA.w - 1, COPA.baseY - COPA.h + 2)'), true);
});

test('spawn livre e todas as portas alcançáveis a partir da entrada', () => {
  const solids = run('SOLIDS'), locations = run('LOCATIONS');
  const step = 4, cols = 800, rows = 525;
  const blocked = new Uint8Array(cols * rows), visited = new Uint8Array(cols * rows);
  for (const s of solids) {
    // Dilata cada obstáculo pela hitbox real dos pés (10 × 7).
    const minX = Math.max(0, Math.floor((s.x - 5) / step) + 1);
    const maxX = Math.min(cols - 1, Math.ceil((s.x + s.w + 5) / step) - 1);
    const minY = Math.max(0, Math.floor(s.y / step) + 1);
    const maxY = Math.min(rows - 1, Math.ceil((s.y + s.h + 7) / step) - 1);
    for (let y = minY; y <= maxY; y++) blocked.fill(1, y * cols + minX, y * cols + maxX + 1);
  }
  const start = 452 * cols + 414;
  assert.equal(blocked[start], 0, 'spawn bloqueado');
  const queue = new Int32Array(cols * rows); let head = 0, tail = 1; queue[0] = start; visited[start] = 1;
  while (head < tail) {
    const i = queue[head++], x = i % cols, y = Math.floor(i / cols);
    for (const n of [x > 0 ? i - 1 : -1, x < cols - 1 ? i + 1 : -1, y > 0 ? i - cols : -1, y < rows - 1 ? i + cols : -1]) {
      if (n >= 0 && !blocked[n] && !visited[n]) { visited[n] = 1; queue[tail++] = n; }
    }
  }
  for (const loc of locations) for (const [dx, dy] of loc.doors) {
    let reachable = false;
    for (let y = Math.floor(dy / step) - 5; y <= Math.ceil(dy / step) + 5; y++) {
      for (let x = Math.floor(dx / step) - 5; x <= Math.ceil(dx / step) + 5; x++) {
        if (Math.hypot(x * step - dx, y * step - dy) < 20 && visited[y * cols + x]) reachable = true;
      }
    }
    assert.ok(reachable, `porta sem acesso: ${loc.id} (${dx}, ${dy})`);
  }
});

test('mapa inteiro cabe em desktop, retrato, paisagem e após girar a tela', () => {
  for (const [w, h] of [[1280, 720], [390, 844], [844, 390], [320, 568], [1920, 1080]]) {
    sandbox.innerWidth = w; sandbox.innerHeight = h;
    run('resize(); setZoom(fitZoom()); update(1/60)');
    const state = run('({ x: cam.x, y: cam.y, zoom, r: viewRect(), W, H })');
    const { x, y, zoom: z, r, W, H } = state;
    assert.ok(-x * z >= r.x - 0.01 && (W - x) * z <= r.x + r.w + 0.01, `largura ${w}×${h}`);
    assert.ok(-y * z >= r.y - 0.01 && (H - y) * z <= r.y + r.h + 0.01, `altura ${w}×${h}`);
    run('render(1000)');
    run('setZoom(4); player.x = 2950; player.y = 1060; update(1/60); setZoom(fitZoom()); render(1000)');
  }
  assert.match(html, /#game\{[^}]*width:100%;height:100%/);
});

test('corredores de pedestres livres, com cobertura acima e oclusão parcial do aluno', () => {
  const paths = run('COVERED_PATHS'), solids = run('SOLIDS');
  for (const path of paths) {
    assert.ok(run(`OVERLAYS.some(o => o.pathId === '${path.id}')`), path.id);
    for (let i = 1; i < path.pts.length; i++) {
      const a = path.pts[i - 1], b = path.pts[i], steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4);
      for (let k = 0; k <= steps; k++) {
        const x = a[0] + (b[0] - a[0]) * k / steps, y = a[1] + (b[1] - a[1]) * k / steps;
        const hit = solids.find(s => x + 5 > s.x && x - 5 < s.x + s.w && y > s.y && y - 7 < s.y + s.h);
        assert.ok(!hit, `${path.id}: ${hit?.tag} bloqueia (${x.toFixed(1)}, ${y.toFixed(1)})`);
      }
    }
  }
  const alpha = run("overlayAlpha(OVERLAYS.find(o => o.pathId === 'copa-refeitorio'), 1686, 830)");
  assert.ok(alpha > 0 && alpha < 1, 'aluno parcialmente visível sob cobertura');
  assert.equal(run("overlayAlpha(OVERLAYS.find(o => o.pathId === 'copa-refeitorio'), 1800, 830)"), 1);
  assert.equal(run('COVERED_PATHS.some(p => distToPolyline(1686, 1300, p.pts) < 20)'), false, 'lado do lago sem cobertura antes da copa');
  assert.equal(run("LOCATIONS.some(l => l.id === 'pedagogico' && l.doors[0][0] < 1398)"), true);
});

test('patamar acessível pela direita, escada e conexão reta ao estacionamento', () => {
  const solids = run('SOLIDS');
  const free = (x, y) => !solids.some(s => x + 5 > s.x && x - 5 < s.x + s.w && y > s.y && y - 7 < s.y + s.h);
  for (let x = 905; x <= 1396; x += 4) assert.ok(free(x, 1154), `patamar em ${x}`);
  for (let y = 1154; y <= 1450; y += 4) assert.ok(free(980, y), `ruazinha ao estacionamento em ${y}`);
  for (let x = 832; x <= 980; x += 2) assert.ok(free(x, 1220), `escada à esquerda em ${x}`);
  assert.equal(run('STORE_STAIRS[0] + STORE_STAIRS[2] <= PARK_ACCESS[0]'), true, 'escada fora da ruazinha');
  assert.equal(run("LOCATIONS.find(l => l.id === 'principal').doors.some(d => d[0] === 1160 && d[1] === 1081)"), false, 'porta marcada com X retirada');
  assert.equal(run("LOCATIONS.find(l => l.id === 'principal').doors.some(d => d[0] === 905 && d[1] === 1123)"), true, 'porta curva preservada');
  assert.equal(run('STORE_STAIRS[2] > STORE_STAIRS[3]'), true);
  assert.equal(run('PEDAG_TRIANGLE[2][0] === (PEDAG_TRIANGLE[0][0] + PEDAG_TRIANGLE[1][0]) / 2'), true);
  assert.equal(run('ADMIN_TREES.length === 2 && ADMIN_TREES[0][0] === ADMIN_TREES[1][0]'), true);
});

test('joystick move o aluno e para ao cancelar ou perder foco', () => {
  run('player.x = 1500; player.y = 1450; resetInput()');
  const stick = elements.get('joystick');
  assert.equal(run('joystickEnabled'), false);
  stick.emit('pointerdown', { pointerId: 7, clientX: 104, clientY: 654 });
  assert.equal(run('stick.pointerId'), null, 'controle desativado não recebe movimento');
  elements.get('btn-joystick').emit('click');
  assert.equal(stick.classList.contains('enabled'), true);
  stick.emit('pointerdown', { pointerId: 7, clientX: 104, clientY: 654 });
  const before = run('player.x'); run('update(0.05)'); assert.ok(run('player.x') > before);
  stick.emit('pointercancel', { pointerId: 7 });
  const after = run('player.x'); run('update(0.05)'); assert.equal(run('player.x'), after);
  stick.emit('pointerdown', { pointerId: 8, clientX: 104, clientY: 654 });
  run('resetInput()'); assert.equal(run('stick.x'), 0); assert.equal(run('stick.pointerId'), null);
  elements.get('btn-joystick').emit('click');
  assert.equal(stick.classList.contains('enabled'), false);
  assert.equal(run('joystickEnabled'), false);
});

test('pinça altera zoom sem fazer o aluno caminhar; cancelamento limpa o toque', () => {
  run('resetInput(); setZoom(1)');
  const canvas = elements.get('game');
  canvas.emit('pointerdown', { pointerId: 1, pointerType: 'touch', clientX: 150, clientY: 300 });
  canvas.emit('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 250, clientY: 300 });
  canvas.emit('pointermove', { pointerId: 2, pointerType: 'touch', clientX: 300, clientY: 300 });
  assert.equal(run('zoom'), 1.5);
  for (const id of [1, 2]) canvas.emit('pointerup', { pointerId: id, pointerType: 'touch', clientX: 200, clientY: 300 });
  assert.equal(run('clickTarget'), null); assert.equal(run('pointers.size'), 0);
  canvas.emit('pointerdown', { pointerId: 3, pointerType: 'touch', clientX: 200, clientY: 300 });
  canvas.emit('pointercancel', { pointerId: 3, pointerType: 'touch' });
  assert.equal(run('clickTarget'), null); assert.equal(run('pointerHeld'), false);
});

test('entrada no principal e retorno preservam posição válida com os demais interiores ativos', () => {
  let saved = null;
  sandbox.URLSearchParams=URLSearchParams;
  sandbox.location={search:'?from=principal'};
  sandbox.sessionStorage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}};
  run('player.x=905;player.y=1145;setZoom(2);updateProximity();rememberExterior()');
  assert.equal(elements.get('enter-building').hidden,false);
  run('player.x=1656;player.y=1808;updateProximity()');
  assert.equal(elements.get('enter-building').hidden,false);
  assert.match(elements.get('enter-building').href,/guarita.html/);
  run('restoreExterior()');assert.equal(run('player.x'),905);assert.equal(run('player.y'),1145);assert.equal(run('zoom'),2);
  saved='{"x":-200,"y":4000,"zoom":2}';
  run('restoreExterior()');assert.equal(run('player.x'),905);assert.equal(run('player.y'),1145);
  sandbox.sessionStorage.getItem=()=>{throw new Error('Storage disabled');};
  assert.doesNotThrow(()=>run('restoreExterior()'));
});

test('as portas externas levam ao andar certo e cada saída devolve o aluno à porta escolhida',()=>{
  const A=sandbox.CampusAccess;
  sandbox.URLSearchParams=URLSearchParams;
  sandbox.sessionStorage={getItem:()=>JSON.stringify({x:905,y:1145,entryId:'2',zoom:2}),setItem:noop};
  for(const entry of A.entries){
    sandbox.location={search:'?from=principal&saida='+entry.id};
    run('restoreExterior();updateProximity()');
    assert.equal(run('player.x'),entry.outside.spawn[0]);assert.equal(run('player.y'),entry.outside.spawn[1]);
    assert.equal(run('activeDoor.loc.id'),'principal');
    assert.equal(run('principalInteriorURL()'),A.interiorURL(entry.id));
    assert.equal(elements.get('enter-building').hidden,!entry.canEnter);
    if(entry.canEnter)assert.equal(elements.get('enter-building').href,A.interiorURL(entry.id));
    assert.equal(run('SOLIDS.some(s=>player.x+5>s.x&&player.x-5<s.x+s.w&&player.y>s.y&&player.y-7<s.y+s.h)'),false);
  }
});

test('todos os novos interiores partem de portas reais e retornam a pontos externos livres',()=>{
  const P=require('../interiores/places'),A=sandbox.CampusAccess;
  sandbox.URLSearchParams=URLSearchParams;sandbox.sessionStorage={getItem:()=>null,setItem:noop};
  for(const b of Object.values(P.buildings))for(const entry of b.entries){
    const actual=run('LOCATIONS.find(l=>l.id==='+JSON.stringify(b.id)+').doors');
    assert.ok(actual.some(([x,y])=>x===entry.outside.door[0]&&y===entry.outside.door[1]),b.id+' porta externa');
    sandbox.location={search:'?from='+b.id+'&saida='+entry.id};run('restoreExterior();updateProximity()');
    assert.equal(run('player.x'),entry.outside.spawn[0],b.id+' retorno x');assert.equal(run('player.y'),entry.outside.spawn[1],b.id+' retorno y');
    assert.equal(run('activeDoor.loc.id'),b.id,b.id+' interação');
    assert.equal(run('principalInteriorURL()'),A.interiorURL(entry.id,b.id));
    assert.equal(run('SOLIDS.some(s=>player.x+5>s.x&&player.x-5<s.x+s.w&&player.y>s.y&&player.y-7<s.y+s.h)'),false,b.id+' spawn externo bloqueado');
  }
});
