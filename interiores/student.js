/* Mesmo estudante, paleta e quadros de animação no campus e nos interiores. */
(function(root){
'use strict';
function makeCanvas(w, h, willRead) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  const g = c.getContext('2d', willRead ? { willReadFrequently: true } : undefined);
  g.imageSmoothingEnabled = false;
  return [c, g];
}
function addOuterOutline(g, w, h, col) {
  const img = g.getImageData(0, 0, w, h), d = img.data;
  const a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (a[i]) continue;
    if ((x > 0 && a[i - 1]) || (x < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) {
      d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}
function drawStudent(g, dir, f) {
  const Px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const SK = '#f2c28c', SKD = '#d79a62', HA = '#3a2618', HAL = '#6b4529', SH = '#10b981', SHD = '#0a8a5f', SHL = '#6ee7b7',
    PA = '#2c4472', PAD = '#1d2f55', SO = '#1d1d24', SOH = '#3a3a46', BG = '#8b5cf6', BGD = '#6d3fe0', BGL = '#b69cff', EYE = '#1a1a22', WH = '#f8fafc';
  const step = f === 1 ? 1 : (f === 3 ? -1 : 0);
  if (dir === 'down' || dir === 'up') {
    const hL = step === 1 ? 4 : (step === -1 ? 2 : 3), hR = step === -1 ? 4 : (step === 1 ? 2 : 3);
    Px(4, 17, 8, 1, PA);
    Px(4, 18, 3, hL, PA); Px(6, 18, 1, hL, PAD); Px(4, 18 + hL, 3, 2, SO); Px(4, 18 + hL, 1, 1, SOH);
    Px(9, 18, 3, hR, PA); Px(9, 18, 1, hR, PAD); Px(9, 18 + hR, 3, 2, SO); Px(9, 18 + hR, 1, 1, SOH);
    Px(4, 11, 8, 6, SH); Px(4, 15, 8, 2, SHD);
    const aL = step === 1 ? 2 : (step === -1 ? 4 : 3), aR = step === -1 ? 2 : (step === 1 ? 4 : 3);
    Px(2, 11, 2, 2, SH); Px(2, 13, 2, aL, SK); Px(2, 12 + aL, 2, 1, SKD);
    Px(12, 11, 2, 2, SH); Px(12, 13, 2, aR, SK); Px(12, 12 + aR, 2, 1, SKD);
    if (dir === 'down') {
      Px(6, 11, 4, 1, WH); Px(7, 12, 2, 1, SHL);
      Px(5, 11, 1, 5, BG); Px(10, 11, 1, 5, BG);
      Px(4, 2, 8, 8, SK); Px(4, 9, 8, 1, SKD);
      Px(4, 1, 8, 4, HA); Px(3, 2, 1, 6, HA); Px(12, 2, 1, 6, HA); Px(5, 5, 2, 1, HA); Px(9, 5, 2, 1, HA); Px(6, 1, 3, 1, HAL);
      Px(6, 7, 1, 2, EYE); Px(9, 7, 1, 2, EYE); Px(7, 9, 2, 1, '#c0704a');
      Px(7, 10, 2, 1, SKD);
    } else {
      Px(5, 11, 6, 6, BG); Px(5, 11, 6, 1, BGL); Px(5, 16, 6, 1, BGD); Px(6, 13, 4, 2, BGD);
      Px(4, 1, 8, 9, HA); Px(6, 1, 3, 1, HAL); Px(5, 3, 1, 2, HAL);
      Px(3, 5, 1, 2, SK); Px(12, 5, 1, 2, SK); Px(6, 10, 4, 1, SKD);
    }
  } else { // 'right' (a esquerda é o espelho)
    if (step === 0) { Px(6, 17, 4, 1, PA); Px(6, 18, 4, 3, PA); Px(6, 18, 1, 3, PAD); Px(6, 21, 5, 2, SO); Px(6, 21, 1, 1, SOH); }
    else {
      const a = step === 1 ? PA : PAD, b = step === 1 ? PAD : PA;
      Px(6, 17, 4, 1, PA);
      Px(4, 18, 3, 3, b); Px(3, 21, 3, 2, SO);
      Px(8, 18, 3, 3, a); Px(9, 21, 3, 2, SO); Px(9, 21, 1, 1, SOH);
    }
    Px(5, 11, 6, 6, SH); Px(5, 15, 6, 2, SHD);
    Px(3, 11, 3, 6, BG); Px(3, 11, 3, 1, BGL); Px(3, 16, 3, 1, BGD);
    if (step === 0) { Px(7, 11, 2, 3, SHD); Px(7, 14, 2, 2, SK); }
    else if (step === 1) { Px(8, 11, 2, 2, SHD); Px(9, 13, 2, 2, SK); }
    else { Px(6, 11, 2, 2, SHD); Px(5, 13, 2, 2, SK); }
    Px(5, 2, 7, 8, SK); Px(5, 9, 7, 1, SKD);
    Px(5, 1, 7, 4, HA); Px(5, 5, 3, 3, HA); Px(11, 4, 1, 1, HA); Px(7, 1, 3, 1, HAL);
    Px(10, 6, 1, 2, EYE); Px(12, 7, 1, 1, SK); Px(8, 6, 1, 2, SKD); Px(6, 10, 3, 1, SKD);
  }
}
function buildPlayerFrames() {
  const F = {};
  for (const d of ['down', 'up', 'right']) {
    F[d] = [];
    for (let f = 0; f < 4; f++) { const [c, g] = makeCanvas(16, 24); drawStudent(g, d, f); addOuterOutline(g, 16, 24, [20, 20, 28]); F[d].push(c); }
  }
  F.left = F.right.map(src => { const [m, g] = makeCanvas(16, 24); g.translate(16, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return m; });
  return F;
}
root.CampusStudent={buildFrames:buildPlayerFrames};
})(globalThis);
