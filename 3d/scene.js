// Pink Lagoon 가상 부스 3D — 전시장 안의 아일랜드 부스. 세 벽에 제품 사진 패널을 걸고, 뒤쪽 위에 2층 라운지를 둔다.
// Three.js(MIT)만 쓴다. 모델 파일 없이 코드로 만들고, 제품 사진만 주소로 받아 벽 패널에 붙인다.
// 조작: 끌어서 돌려 보기, 사진 패널을 눌러 제품 열기, goto(view)로 벽 앞으로 이동, zoom(±1).
import * as THREE from './vendor/three.module.min.js';

const INK = 0x4a3d36, D2R = Math.PI / 180;
export function createBooth(canvas, opts = {}) {
  const FONT = opts.font || 'Poppins';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!opts.capture, powerPreference: 'high-performance' });
  let pr = Math.min(opts.pixelRatio || window.devicePixelRatio || 1, 1.5); renderer.setPixelRatio(pr);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;   // 그림자는 한 번만 굽는다(가구는 움직이지 않는다)
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b2233); scene.fog = new THREE.Fog(0x1b2233, 40, 95);
  const camera = new THREE.PerspectiveCamera(32, 1.6, 0.1, 200);

  // ── 도우미 ──
  const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '30,30,40'},${Math.random() * a})`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3); } };
  const ramp = new THREE.DataTexture(new Uint8Array([130, 130, 130, 255, 186, 186, 186, 255, 230, 230, 230, 255, 255, 255, 255, 255]), 4, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
  const mats = {}; const toon = (color, o) => o ? new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o }) : (mats[color] || (mats[color] = new THREE.MeshToonMaterial({ color, gradientMap: ramp })));
  const flat = (o) => new THREE.MeshBasicMaterial(o);
  const add = (geo, mat, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false; if (o.rot) m.rotation.set(...o.rot); if (o.scale) m.scale.set(...o.scale); (o.parent || scene).add(m); if (o.ink) { const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), inkMat); m.add(l); } return m; };
  const inkMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: .45 });
  const box = (w, h, d, mat, x, y, z, o = {}) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, o);
  const plane = (w, h, mat, x, y, z, o = {}) => add(new THREE.PlaneGeometry(w, h), mat, x, y, z, { cast: false, receive: false, ...o });
  const text = (str, w, h, o = {}) => tex(o.px || 512, Math.round((o.px || 512) * h / w), (g, W, H) => { if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, W, H); } g.fillStyle = o.fg || '#1b1f2a'; g.font = `${o.weight || 600} ${o.size || Math.round(H * .5)}px ${FONT}, "Noto Sans KR", sans-serif`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; if (o.spacing) g.letterSpacing = o.spacing; g.fillText(str, o.align === 'left' ? (o.pad || 16) : W / 2, H / 2 + 2, W - 16); });
  const anim = []; const Q = (g) => ({ parent: g });

  // ── 전시장 ──
  scene.add(new THREE.HemisphereLight(0xf2f6ff, 0x8a8f9c, 1.5));
  const key = new THREE.DirectionalLight(0xfff4e2, 2.1); key.position.set(-9, 22, 16); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 14, bottom: -10, near: 1, far: 60 }); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.04; key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, .6); fill.position.set(12, 10, 14); scene.add(fill);
  const floorT = tex(512, 512, (g, W, H) => { g.fillStyle = '#8f96a6'; g.fillRect(0, 0, W, H); noise(g, W, H, 2600, .05); g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 2; g.strokeRect(0, 0, W, H); }, [22, 22]);
  plane(110, 110, new THREE.MeshToonMaterial({ map: floorT, gradientMap: ramp }), 0, 0, -8, { rot: [-Math.PI / 2, 0, 0], receive: true });
  const carpetT = tex(256, 256, (g, W, H) => { g.fillStyle = '#b7475f'; g.fillRect(0, 0, W, H); noise(g, W, H, 1800, .06); }, [6, 16]);
  const aisle = new THREE.MeshToonMaterial({ map: carpetT, gradientMap: ramp });
  plane(40, 4.4, aisle, 0, .012, 10.4, { rot: [-Math.PI / 2, 0, 0], receive: true }); plane(4.4, 60, aisle, -12.6, .012, -10, { rot: [-Math.PI / 2, 0, 0], receive: true }); plane(4.4, 60, aisle, 12.6, .012, -10, { rot: [-Math.PI / 2, 0, 0], receive: true });
  // 천장 트러스와 조명(멀리 어둡게)
  const trussM = flat({ color: 0x3a4358 }), lampM = flat({ color: 0xfff6dc });
  for (let z = -40; z <= 16; z += 8) box(100, .25, .25, trussM, 0, 15.5, z, { cast: false, receive: false });
  for (let x = -40; x <= 40; x += 10) box(.25, .25, 70, trussM, x, 15.7, -10, { cast: false, receive: false });
  for (let x = -30; x <= 30; x += 10) for (let z = -32; z <= 12; z += 8) box(2.6, .1, .7, lampM, x + 5, 15.2, z + 4, { cast: false, receive: false });
  // 이웃 부스(단순한 상자와 간판)
  const nb = (x, z, w, d, c, h = 3.6) => { box(w, h, .2, toon(0xe9edf5), x, h / 2, z - d / 2, { cast: false }); box(.2, h, d, toon(0xdfe5ef), x - w / 2, h / 2, z, { cast: false }); box(.2, h, d, toon(0xdfe5ef), x + w / 2, h / 2, z, { cast: false }); box(w + .3, .7, .3, toon(c), x, h + .35, z + d / 2, { cast: false }); plane(w, d, toon(0x6f7890), x, .02, z, { rot: [-Math.PI / 2, 0, 0] }); };
  [[-24, 2, 9, 7, 0x2f7d54], [-24, -9, 9, 7, 0xd8a23c], [24, 2, 9, 7, 0x3566b0], [24, -9, 9, 7, 0xd8745a], [-9, -22, 12, 7, 0x6d86c9], [6, -22, 12, 7, 0x3f9d94], [-24, -20, 9, 7, 0x8f7fc4], [24, -20, 9, 7, 0xc94f6d]].forEach((a) => nb(...a));

  // ── 부스 ──
  const B = new THREE.Group(); scene.add(B); const P = { parent: B };
  const WH = 4.5, X0 = -7, X1 = 7, Z0 = -3, Z1 = 4.2;                 // 벽 높이, 좌우 벽, 뒷벽, 앞 끝
  const boothFloorT = tex(256, 256, (g, W, H) => { g.fillStyle = '#f1ece2'; g.fillRect(0, 0, W, H); noise(g, W, H, 900, .04); g.strokeStyle = 'rgba(120,100,80,.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } }, [7, 4]);
  box(14.6, .14, 7.8, new THREE.MeshToonMaterial({ map: boothFloorT, gradientMap: ramp }), 0, .07, .6, { parent: B, ink: true });
  const wallM = toon(0xfbfaf6), trim = toon(0x27324f), pink = toon(0xe56fab);
  box(14.4, WH, .22, wallM, 0, WH / 2 + .14, Z0 - .11, P); box(.22, WH, 7.2, wallM, X0 - .11, WH / 2 + .14, .6, P); box(.22, WH, 7.2, wallM, X1 + .11, WH / 2 + .14, .6, P);
  // 벽 위 색 띠(브랜드 그러데이션)
  const bandT = tex(512, 16, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#ef86bd'); gr.addColorStop(.55, '#8f7fc4'); gr.addColorStop(1, '#3566b0'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  const bandM = flat({ map: bandT }); box(14.5, .32, .3, bandM, 0, WH + .3, Z0 - .11, { parent: B, cast: false }); box(.3, .32, 7.3, bandM, X0 - .11, WH + .3, .6, { parent: B, cast: false }); box(.3, .32, 7.3, bandM, X1 + .11, WH + .3, .6, { parent: B, cast: false });
  for (const [x, z] of [[X0 - .11, Z1 + .1], [X1 + .11, Z1 + .1]]) box(.34, WH + .5, .34, trim, x, (WH + .5) / 2 + .14, z, P);
  // 2층 라운지(뒷벽 뒤 위쪽 데크)
  const deckY = WH + .46;
  box(14.6, .3, 4.2, toon(0x9a6844), 0, deckY, Z0 - 2.2, { parent: B, ink: true });
  for (const x of [-7, -2.4, 2.4, 7]) box(.3, deckY, .3, trim, x, deckY / 2, Z0 - 4.1, P);
  box(14.6, .1, .1, trim, 0, deckY + 1.15, Z0 - .2, P); for (let x = -7; x <= 7; x += .7) box(.06, 1.0, .06, toon(0xc5ccdb), x, deckY + .62, Z0 - .2, { parent: B, cast: false });
  box(14.6, 2.6, .16, toon(0xf3efe6), 0, deckY + 1.45, Z0 - 4.2, P);                                        // 라운지 뒷벽
  box(4.4, 1.5, .1, [trim, trim, trim, trim, flat({ map: tex(512, 176, (g, W, H) => { const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#7cc4e8'); s.addColorStop(1, '#2f7fa8'); g.fillStyle = s; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.moveTo(232, 58); g.lineTo(292, 88); g.lineTo(232, 118); g.fill(); g.font = `600 22px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText('COMPANY FILM', W / 2, 156); }) }), trim], -4.2, deckY + 1.5, Z0 - 4.05, P);
  [['HACCP', '#6d86c9'], ['EU', '#3f9d94'], ['FDA', '#d8745a'], ['KITA', '#e0a23c']].forEach(([n, c], i) => box(.8, 1.0, .06, [trim, trim, trim, trim, flat({ map: tex(160, 200, (g, W, H) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, W, H); g.fillStyle = c; g.beginPath(); g.arc(W / 2, 76, 40, 0, 7); g.fill(); g.fillStyle = '#4a3d36'; g.font = `600 26px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText(n, W / 2, 166); }) }), trim], 2.6 + i * 1.05, deckY + 1.5, Z0 - 4.08, P));
  add(new THREE.CylinderGeometry(1.0, 1.0, .08, 24), toon(0x9a6844), 0, deckY + .95, Z0 - 2.3, { parent: B, ink: true }); add(new THREE.CylinderGeometry(.1, .2, .8, 10), trim, 0, deckY + .55, Z0 - 2.3, P);
  // 계단(오른쪽 바깥)
  for (let i = 0; i < 12; i++) box(1.5, .2, .52, toon(0x9a6844), X1 + 1.15, .2 + i * .41, Z1 - 2.2 - i * .52, { parent: B, ink: i % 3 === 0 });
  box(.08, .08, 7.9, pink, X1 + 1.9, 3.5, .1, { parent: B, rot: [-.665, 0, 0], cast: false });
  // 걸린 간판(천장에서 내려온 사각 배너)
  const signT = tex(1024, 256, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#ef86bd'); gr.addColorStop(.55, '#8f7fc4'); gr.addColorStop(1, '#3566b0'); g.fillStyle = gr; g.fillRect(0, 0, W, 22); g.fillRect(0, H - 22, W, 22);
    g.beginPath(); g.arc(160, 128, 60, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(160, 136, 40, 15, 0, 0, 7); g.fill();
    g.fillStyle = '#1b1f2a'; g.font = `600 88px ${FONT}, sans-serif`; g.textBaseline = 'middle'; g.fillText('PINK LAGOON', 256, 112); g.font = `600 28px ${FONT}, sans-serif`; g.fillStyle = '#5b6478'; g.fillText('P R E M I U M   S E A F O O D   F R O M   K O R E A', 260, 182); });
  const signM = flat({ map: signT }), sideM = toon(0xffffff);
  const sign = new THREE.Group(); box(8.6, 2.15, 4.2, [sideM, sideM, sideM, sideM, signM, signM], 0, 0, 0, { parent: sign, cast: false }); for (const sx of [-1, 1]) { const m = plane(4.2, 2.15, signM, sx * 4.31, 0, 0, { parent: sign, rot: [0, sx * Math.PI / 2, 0] }); }
  sign.position.set(0, 9.0, .8); B.add(sign); for (const [x, z] of [[-4, -1], [4, -1], [-4, 2.6], [4, 2.6]]) box(.04, 5.5, .04, trussM, x, 12.8, z, { parent: B, cast: false, receive: false });

  // ── 가구: 냉동 쇼케이스, 시식 카운터, 문의 데스크, 상담 테이블 ──
  const S2 = new THREE.Group(); S2.position.set(-3.6, .14, 5.5); B.add(S2);
  box(3.4, .85, 1.25, toon(0xe7edf2), 0, .43, 0, { parent: S2, ink: true }); box(3.4, .08, 1.25, toon(0xc5d3db), 0, 1.72, 0, Q(S2)); for (const x of [-1.66, 1.66]) box(.08, .86, 1.25, toon(0xc5d3db), x, 1.27, 0, Q(S2));
  add(new THREE.BoxGeometry(3.24, .84, 1.16), new THREE.MeshPhysicalMaterial({ color: 0xdff3ff, transparent: true, opacity: .2, roughness: .05, clearcoat: 1 }), 0, 1.27, 0, { parent: S2, cast: false });
  [['OYSTER', '#2b4f9a'], ['FRY', '#27324f'], ['CRAB', '#e56fab'], ['ROE', '#d9632d'], ['SALAD', '#2f7d54'], ['FISH', '#3f9d94']].forEach(([n, c], i) => box(.44, .62, .16, [toon(c), toon(c), toon(c), toon(c), flat({ map: tex(128, 192, (g, W, H) => { g.fillStyle = c; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(14, 22, W - 28, 44); g.fillStyle = c; g.font = `600 22px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText(n, W / 2, 52); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(W / 2, 128, 34, 0, 7); g.fill(); }) }), toon(c)], -1.28 + i * .51, 1.18, .1, { parent: S2, rot: [-.12, 0, 0], cast: false }));
  plane(2.0, .4, flat({ map: text('FROZEN  -18°C', 2.0, .4, { bg: '#27324f', fg: '#ffffff' }) }), 0, .45, .635, Q(S2));
  const S3 = new THREE.Group(); S3.position.set(3.7, .14, 5.5); B.add(S3);
  box(3.4, 1.0, 1.2, toon(0xffffff), 0, .5, 0, { parent: S3, ink: true }); box(3.6, .1, 1.4, pink, 0, 1.05, 0, Q(S3));
  plane(2.3, .42, flat({ map: text('TASTING · SAMPLES', 2.3, .42, { bg: '#ffffff', fg: '#1b1f2a', size: 40 }) }), 0, .5, .605, Q(S3));
  const pan = new THREE.Group(); add(new THREE.CylinderGeometry(.4, .34, .1, 18), toon(0x3b3f4a), 0, 0, 0, Q(pan)); box(.5, .05, .08, trim, .62, .02, 0, Q(pan)); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(.1, 10, 8), toon(0xe0913a), -.15 + (i % 2) * .3, .08, -.11 + Math.floor(i / 2) * .22, { parent: pan, scale: [1.2, .7, 1], cast: false });
  pan.position.set(-.9, 1.16, 0); S3.add(pan); anim.push((t) => { pan.position.y = 1.16 + Math.max(0, Math.sin(t * 3)) * .05; pan.rotation.z = Math.sin(t * 3) * .05; });
  [0xe0913a, 0xd8745a, 0x6fa86a].forEach((c, i) => { add(new THREE.CylinderGeometry(.26, .22, .05, 16), toon(0xfffdf6), .2 + i * .6, 1.13, .1, { parent: S3, cast: false }); add(new THREE.SphereGeometry(.12, 10, 8), toon(c), .2 + i * .6, 1.19, .1, { parent: S3, scale: [1.2, .6, 1], cast: false }); });
  const steamT = tex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false })); S3.add(s); anim.push((t) => { const k = (t * .35 + i / 5) % 1; s.position.set(-.9 + Math.sin(k * 6 + i) * .12, 1.3 + k * 1.2, 0); s.scale.setScalar(.25 + k * .5); s.material.opacity = (1 - k) * .5; }); }
  const DK = new THREE.Group(); DK.position.set(0, .14, 2.9); B.add(DK);
  box(2.6, 1.0, .9, trim, 0, .5, 0, { parent: DK, ink: true }); box(2.8, .1, 1.1, pink, 0, 1.05, 0, Q(DK));
  plane(1.9, .4, flat({ map: text('INQUIRY DESK', 1.9, .4, { bg: '#27324f', fg: '#ffffff' }) }), 0, .5, .455, Q(DK));
  for (const [x, z] of [[-4.6, 1.2], [4.6, 1.2]]) { add(new THREE.CylinderGeometry(.75, .75, .07, 22), toon(0xffffff), x, .95, z, { parent: B, ink: true }); add(new THREE.CylinderGeometry(.07, .3, .8, 10), trim, x, .55, z, P); for (const a of [0, 2.1, 4.2]) add(new THREE.CylinderGeometry(.24, .2, .5, 12), toon(0xdfe5ef), x + Math.cos(a) * 1.15, .4, z + Math.sin(a) * 1.15, P); }
  const plant = (x, z, s = 1) => { add(new THREE.CylinderGeometry(.34, .26, .5, 12), toon(0xffffff), x, .4, z, { parent: B, scale: [s, s, s] }); for (let i = 0; i < 7; i++) add(new THREE.ConeGeometry(.15, 1.3, 5), toon(i % 2 ? 0x6fa86a : 0x5a9a5c), x + Math.cos(i) * .15 * s, 1.1 * s, z + Math.sin(i) * .15 * s, { parent: B, rot: [Math.sin(i) * .5, 0, -Math.cos(i) * .5], scale: [s, s, s * .4], cast: false }); };
  plant(-6.4, 3.7, 1.1); plant(6.4, 3.7, 1.1);

  // ── 사람 ──
  const skin = toon(0xf6d3b3), dark = flat({ color: 0x3a2a22 }), blush = flat({ color: 0xf4a9a0, transparent: true, opacity: .8 });
  const G = { body: new THREE.CapsuleGeometry(.27, .34, 5, 12), leg: new THREE.CapsuleGeometry(.09, .22, 3, 8), arm: new THREE.CapsuleGeometry(.075, .26, 3, 8), hand: new THREE.SphereGeometry(.085, 8, 6), head: new THREE.SphereGeometry(.36, 18, 14), hair: new THREE.SphereGeometry(.385, 18, 12, 0, 6.3, 0, 1.75), eye: new THREE.SphereGeometry(.045, 6, 6), cheek: new THREE.SphereGeometry(.06, 6, 6) };
  function person(x, y, z, shirt, o = {}) {
    const g = new THREE.Group(), s = o.s || 1, N = { parent: g, cast: false };
    add(G.body, toon(shirt), 0, .62, 0, Q(g));
    for (const sx of [-1, 1]) { add(G.leg, toon(0x4a5a78), sx * .13, .2, 0, N); const arm = add(G.arm, toon(shirt), sx * .34, .66, 0, { ...N, rot: [0, 0, sx * .28] }); add(G.hand, skin, sx * .4, .46, 0, N); if (o.wave && sx === 1) anim.push((t) => { arm.rotation.z = 2.3 + Math.sin(t * 5) * .35; arm.position.set(.42, .98, 0); }); }
    if (o.apron) add(new THREE.BoxGeometry(.4, .46, .06), toon(0xfffaf0), 0, .56, .26, N);
    const head = new THREE.Group(); head.position.y = 1.28; g.add(head); const HN = { parent: head, cast: false };
    add(G.head, skin, 0, 0, 0, Q(head)); add(G.hair, toon(o.hair || 0x3a2a22), 0, .03, -.05, { ...HN, rot: [-.32, 0, 0] });
    for (const sx of [-1, 1]) { add(G.eye, dark, sx * .13, -.02, .335, { ...HN, scale: [1, 1.35, .5] }); add(G.cheek, blush, sx * .22, -.11, .29, { ...HN, scale: [1, .6, .3] }); }
    if (o.hat === 'chef') { add(new THREE.CylinderGeometry(.24, .26, .22, 14), toon(0xfffdf6), 0, .36, 0, HN); add(new THREE.SphereGeometry(.31, 14, 10), toon(0xfffdf6), 0, .56, 0, { ...HN, scale: [1, .7, 1] }); }
    if (o.hat === 'cap') { add(new THREE.SphereGeometry(.39, 16, 10, 0, 6.3, 0, 1.45), pink, 0, .05, 0, HN); add(new THREE.CylinderGeometry(.3, .3, .04, 14, 1, false, -1.2, 2.4), toon(0xd85a9a), 0, .12, .2, HN); }
    if (o.bag) box(.3, .36, .2, toon(0x3f9d94), .5, .26, .1, N);
    g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = o.ry || 0; B.add(g);
    const ph = (x * 7 + z * 3) % 6; anim.push((t) => { g.position.y = y + Math.abs(Math.sin(t * 1.6 + ph)) * .03 * s; head.rotation.z = Math.sin(t * .9 + ph) * .06; head.rotation.y = Math.sin(t * .5 + ph) * .18; });
    return g;
  }
  person(0, .14, 2.2, 0xf08fb7, { hat: 'cap', wave: true });                          // 문의 데스크 직원
  person(3.2, .14, 4.7, 0xfffdf6, { hat: 'chef', apron: true });                      // 시식 카운터 셰프
  person(-3.6, .14, 4.6, 0x6d86c9, { hair: 0x6b4a36 });                               // 쇼케이스 직원
  person(-1.6, .14, 7.4, 0xf4efe2, { hair: 0x2f2a35, bag: true, ry: 2.9, s: 1.05 }); person(5.6, .14, 7.2, 0x3f9d94, { hair: 0x2f2a35, ry: 3.4 });   // 바이어
  person(-1.1, deckY + .15, Z0 - 2.3, 0x6d86c9, { ry: 1.2, s: .95 }); person(1.1, deckY + .15, Z0 - 2.3, 0xe0a23c, { hair: 0x6b4a36, ry: -1.2, s: .95 });   // 2층 상담

  // ── 벽의 제품 사진 패널 ──
  const WALLS = { left: { o: [X0 + .012, 0, .6], dir: [0, 0, -1], ry: Math.PI / 2, w: 7.0 }, back: { o: [0, 0, Z0 + .012], dir: [1, 0, 0], ry: 0, w: 13.6 }, right: { o: [X1 - .012, 0, .6], dir: [0, 0, 1], ry: -Math.PI / 2, w: 7.0 } };
  const panels = new THREE.Group(); B.add(panels); let pickable = [], hovered = null; const loader = new THREE.TextureLoader(); loader.setCrossOrigin('anonymous');
  const BADGE = { ok: ['#dff5e8', '#17603a'], cond: ['#fff0cf', '#7a5200'], check: ['#e6ebf5', '#3a4764'], no: ['#fde2e2', '#8d1f1f'] };
  function setPanels(zones) {                                           // zones: [{ wall, title, items: [{ id, title, photo, badge, badgeText, tag }] }]
    for (const m of [...panels.children]) { m.traverse((c) => { if (c.material && c.material.map && c.material.userData.own) c.material.map.dispose(); }); panels.remove(m); }
    pickable = []; hovered = null;
    for (const zn of zones) {
      const W = WALLS[zn.wall]; if (!W) continue; const g = new THREE.Group(); g.position.set(...W.o); g.rotation.y = W.ry; panels.add(g);
      const n = zn.items.length, rows = n > 3 ? 2 : 1, cols = Math.ceil(n / rows), gap = .28, pw = Math.min(2.15, (W.w - .5 - gap * (cols - 1)) / cols), ph = pw * 9 / 16, lh = .36, rowH = ph + lh + .22;
      const gw = cols * pw + (cols - 1) * gap; { const tm = flat({ map: text(zn.title, gw, .5, { px: 1024, align: 'left', fg: '#1b1f2a', size: Math.round(1024 * .5 / gw * .62), pad: 4 }), transparent: true }); tm.userData.own = true; plane(gw, .5, tm, 0, WH - .2, .02, Q(g)); }   // 벽 제목은 사진 묶음의 왼쪽 끝에 맞춘다
      const y0 = .42 + (rows === 2 ? rowH : (WH - 1.2 - rowH) / 2) + lh + ph / 2;
      zn.items.forEach((it, i) => {
        const c = i % cols, r = Math.floor(i / cols), x = (c - (cols - 1) / 2) * (pw + gap), y = y0 - r * rowH, card = new THREE.Group(); card.position.set(x, y, 0); g.add(card);
        box(pw + .1, ph + lh + .12, .05, toon(0xffffff), 0, -lh / 2, .01, { parent: card, cast: false, ink: true });
        const fallback = () => tex(512, 288, (gx, Wd, Hd) => { const gr = gx.createLinearGradient(0, 0, Wd, Hd); gr.addColorStop(0, '#e98abf'); gr.addColorStop(.6, '#7f86c9'); gr.addColorStop(1, '#3566b0'); gx.fillStyle = gr; gx.fillRect(0, 0, Wd, Hd); gx.fillStyle = '#fff'; gx.font = `600 34px ${FONT}, "Noto Sans KR", sans-serif`; gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.fillText(it.title, Wd / 2, Hd / 2 - 10, Wd - 40); gx.font = `500 18px ${FONT}, "Noto Sans KR", sans-serif`; gx.globalAlpha = .85; gx.fillText(it.note || '', Wd / 2, Hd / 2 + 30, Wd - 40); });
        const pm = flat({ map: fallback() }); pm.userData.own = true; const pic = plane(pw, ph, pm, 0, 0, .04, Q(card)); pic.userData.id = it.id; pic.userData.card = card; pickable.push(pic);
        if (it.photo) loader.load(it.photo, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; pm.map.dispose(); pm.map = t; pm.needsUpdate = true; }, undefined, () => {});
        const b = BADGE[it.badge];
        const lab = tex(640, Math.round(640 * lh / pw), (gx, Wd, Hd) => { gx.fillStyle = '#fff'; gx.fillRect(0, 0, Wd, Hd); gx.textBaseline = 'middle'; gx.fillStyle = '#1b1f2a'; gx.font = `600 ${Math.round(Hd * .42)}px ${FONT}, "Noto Sans KR", sans-serif`; let tw = Wd - 20;
          if (b && it.badgeText) { gx.font = `600 ${Math.round(Hd * .3)}px ${FONT}, "Noto Sans KR", sans-serif`; const bw = gx.measureText(it.badgeText).width + 26; gx.fillStyle = b[0]; gx.beginPath(); gx.roundRect(Wd - bw - 8, Hd * .2, bw, Hd * .6, Hd * .3); gx.fill(); gx.fillStyle = b[1]; gx.textAlign = 'center'; gx.fillText(it.badgeText, Wd - bw / 2 - 8, Hd / 2 + 1); tw = Wd - bw - 30; gx.fillStyle = '#1b1f2a'; gx.font = `600 ${Math.round(Hd * .42)}px ${FONT}, "Noto Sans KR", sans-serif`; }
          gx.textAlign = 'left'; gx.fillText(it.title, 10, Hd / 2 + 1, tw); });
        const lm = flat({ map: lab }); lm.userData.own = true; const lp = plane(pw, lh, lm, 0, -ph / 2 - lh / 2 - .03, .04, Q(card)); lp.userData.id = it.id; lp.userData.card = card; pickable.push(lp);
        if (it.tag) { const tm = flat({ map: text(it.tag, 1.0, .22, { bg: '#0d1424', fg: '#ffffff', size: 30, px: 256 }) }); tm.userData.own = true; plane(1.0, .22, tm, -pw / 2 + .58, ph / 2 - .19, .05, Q(card)); }
      });
    }
    renderer.shadowMap.needsUpdate = true;
  }

  // ── 카메라: 중심점을 두고 도는 방식. 끌면 돌고, goto로 시점을 옮긴다 ──
  const VIEWS = { all: { c: [0, 4.0, .2], yaw: 0, pitch: 12, dist: 36, span: 62 }, left: { c: [X0, 2.35, .6], yaw: 74, pitch: 9, dist: 11.8, span: 20, wall: 1 }, back: { c: [0, 2.35, Z0], yaw: 0, pitch: 10, dist: 12.4, span: 24, wall: 1 }, right: { c: [X1, 2.35, .6], yaw: -74, pitch: 9, dist: 11.8, span: 20, wall: 1 }, f2: { c: [0, deckY + 1.5, Z0 - 2.3], yaw: 0, pitch: 9, dist: 14.5, span: 30 }, front: { c: [0, 1.3, 4.6], yaw: 0, pitch: 12, dist: 13, span: 40 } };
  const cur = { c: new THREE.Vector3(), yaw: 0, pitch: 13, dist: 31 }, tgt = { c: new THREE.Vector3(), yaw: 0, pitch: 13, dist: 31 }; let view = VIEWS.all, off = { yaw: 0, pitch: 0, zoom: 1 }, portrait = false;
  const fitDist = (d) => d * (portrait ? (view.wall ? 1.12 : 1.5) : 1);   // 세로 화면: 전체 보기는 멀리, 벽 보기는 가까이 두고 끌어서 옆 사진을 본다
  function goto(name, instant) { view = VIEWS[name] || VIEWS.all; off = { yaw: 0, pitch: 0, zoom: 1 }; tgt.c.set(...view.c); tgt.yaw = view.yaw; tgt.pitch = view.pitch; tgt.dist = view.dist; if (instant) { cur.c.copy(tgt.c); cur.yaw = tgt.yaw; cur.pitch = tgt.pitch; cur.dist = fitDist(tgt.dist); } }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let drag = null, moved = false;
  const hit = (e) => { const r = canvas.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera); const h = ray.intersectObjects(pickable, false)[0]; return h ? h.object : null; };
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw: off.yaw, pitch: off.pitch }; moved = false; });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; const sp = view.span * (portrait && view.wall ? 1.5 : 1); off.yaw = Math.max(-sp, Math.min(sp, drag.yaw - dx * .22)); off.pitch = Math.max(-4, Math.min(16, drag.pitch + dy * .12)); canvas.style.cursor = 'grabbing'; return; }
    if (e.pointerType === 'mouse') { const h = hit(e); if ((h && h.userData.card) !== hovered) { if (hovered) hovered.userData.to = 1; hovered = h ? h.userData.card : null; if (hovered) hovered.userData.to = 1.05; } canvas.style.cursor = hovered ? 'pointer' : 'grab'; }
  });
  const up = (e) => { const was = drag; drag = null; canvas.style.cursor = 'grab'; if (was && !moved && e.type === 'pointerup') { const h = hit(e); if (h && api.onPick) api.onPick(h.userData.id); } };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('pointerleave', () => { drag = null; if (hovered) { hovered.userData.to = 1; hovered = null; } });
  canvas.style.cursor = 'grab'; canvas.style.touchAction = 'pan-y';

  let slow = 0, frames = 0, acc = 0, lastT;
  const api = { VIEWS, goto, setPanels, renderer, scene, camera, onPick: null, onFrame: null,
    zoom(dir) { off.zoom = Math.max(.6, Math.min(1.35, off.zoom * (dir > 0 ? .85 : 1.18))); },
    resize() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; portrait = w / h < .9; camera.fov = portrait ? 40 : 32; camera.updateProjectionMatrix(); },
    frame(t) {
      const dt = Math.min(Math.max(t - (lastT ?? t), 0), .25); lastT = t; const k = 1 - Math.exp(-dt * 4.2);
      anim.forEach((f) => f(t));
      cur.c.lerp(tgt.c, k); cur.yaw += (tgt.yaw + off.yaw - cur.yaw) * k; cur.pitch += (tgt.pitch + off.pitch - cur.pitch) * k; cur.dist += (fitDist(tgt.dist) * off.zoom - cur.dist) * k;
      const y = cur.yaw * D2R, p = cur.pitch * D2R; camera.position.set(cur.c.x + Math.sin(y) * Math.cos(p) * cur.dist, cur.c.y + Math.sin(p) * cur.dist, cur.c.z + Math.cos(y) * Math.cos(p) * cur.dist); camera.lookAt(cur.c);
      for (const m of pickable) { const c = m.userData.card, to = c.userData.to || 1; if (Math.abs(c.scale.x - to) > .001) { const s = c.scale.x + (to - c.scale.x) * Math.min(1, dt * 12); c.scale.set(s, s, 1); } }
      renderer.render(scene, camera); if (api.onFrame) api.onFrame(t);
      // 느린 기기에서는 해상도를 낮추고, 그래도 느리면 그림자를 끈다
      if (dt > 0) { acc += dt; if (++frames >= 45) { const avg = acc / frames; frames = 0; acc = 0; if (avg > .034 && !opts.capture) { if (pr > .8) { pr = Math.max(.75, pr * .8); renderer.setPixelRatio(pr); api.resize(); } else if (renderer.shadowMap.enabled && ++slow > 1) { renderer.shadowMap.enabled = false; key.castShadow = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); } } } }
    },
    project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(camera), w = canvas.clientWidth, h = canvas.clientHeight; return { x: (v.x * .5 + .5) * w, y: (-v.y * .5 + .5) * h, visible: v.z < 1 && Math.abs(v.x) < 1.02 && Math.abs(v.y) < 1.02 }; },
    spots: { desk: [0, 1.75, 2.9], tasting: [3.7, 1.75, 5.5], lounge: [3.4, deckY + 1.3, Z0 - .3], showcase: [-3.6, 2.35, 5.5] } };
  goto('all', true); api.resize(); renderer.shadowMap.needsUpdate = true;
  if (!opts.manual) { const t0 = performance.now(); let sw = 0, sh = 0;
    const onScreen = () => { const r = canvas.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight; };   // 붙어 있고 화면 안에 있을 때만 그린다
    const loop = () => { if (canvas.isConnected && !document.hidden && onScreen()) { if (canvas.clientWidth !== sw || canvas.clientHeight !== sh) { sw = canvas.clientWidth; sh = canvas.clientHeight; api.resize(); } api.frame((performance.now() - t0) / 1000); } requestAnimationFrame(loop); }; loop(); }
  return api;
}
