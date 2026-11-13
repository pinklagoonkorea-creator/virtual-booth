// Pink Lagoon 가상 부스 3D 시제품 — 바닷가 부두의 2층 목조 수산 시장.
// Three.js(MIT)만 쓴다. 모델·사진 파일 없이 전부 코드로 만든다(무늬는 캔버스로 그린다).
import * as THREE from './vendor/three.module.min.js';

const INK = 0x5a4334;
export function createBooth(canvas, opts = {}) {
  const FONT = opts.font || 'Poppins';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: !!opts.capture });
  renderer.setPixelRatio(Math.min(opts.pixelRatio || window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xd9ecf5, 46, 150);
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.1, 400);

  // ── 도우미 ──
  const tex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const noise = (g, w, h, n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,250,235' : '70,45,25'},${Math.random() * a})`; const s = 1 + Math.random() * 3; g.fillRect(Math.random() * w, Math.random() * h, s * (1 + Math.random() * 6), s); } };
  const ramp = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 178, 178, 178, 255, 226, 226, 226, 255, 255, 255, 255, 255]), 4, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
  const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o });
  const add = (geo, mat, x, y, z, o = {}) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = o.receive !== false; if (o.rot) m.rotation.set(...o.rot); if (o.scale) m.scale.set(...o.scale); (o.parent || scene).add(m); if (o.ink) ink(m, o.ink === true ? .5 : o.ink); return m; };
  const ink = (m, op = .5) => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: op })); m.add(l); return l; };
  const box = (w, h, d, mat, x, y, z, o = {}) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, { ink: true, ...o });
  const label = (text, w, h, o = {}) => tex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = o.bg || '#fff8e6'; g.fillRect(0, 0, W, H); if (o.border !== false) { g.strokeStyle = o.line || '#5a4334'; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10); } g.fillStyle = o.fg || '#4a3528'; g.font = `600 ${o.size || Math.round(H * .46)}px ${FONT}, "Noto Sans KR", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 2); });
  const anim = [];

  // ── 하늘, 빛 ──
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'varying vec3 p; void main(){ float h = normalize(p).y; vec3 top = vec3(.30,.60,.90), mid = vec3(.62,.83,.95), hor = vec3(1.,.95,.84); vec3 c = mix(hor, mid, smoothstep(-.02,.22,h)); c = mix(c, top, smoothstep(.2,.75,h)); gl_FragColor = vec4(c,1.); }' }));
  scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0xf0d2a8, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0cf, 2.6); sun.position.set(-14, 26, 18); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 20, bottom: -12, near: 1, far: 80 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 5; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffd9c2, .55); fill.position.set(16, 8, 10); scene.add(fill);

  // ── 뭉게구름 ──
  const cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: ramp, fog: false, emissive: 0x9fb6c8, emissiveIntensity: .32 });
  const puff = new THREE.SphereGeometry(1, 14, 10);
  [[-52, 30, -90, 1.5], [38, 36, -110, 2.0], [-8, 44, -130, 1.3], [84, 24, -80, 1.2], [-100, 22, -70, 1.1], [10, 20, -150, 1.6]].forEach(([x, y, z, s], k) => {
    const c = new THREE.Group(); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(puff, cloudMat); const a = i / 9 * 6.28; m.position.set(Math.cos(a) * 7 * (.4 + (i % 3) * .3), (i % 4) * 1.6 - 1, Math.sin(a) * 2.5); const r = 3.2 + ((i * 7) % 5) * .8; m.scale.set(r * 1.25, r * .82, r); c.add(m); }
    c.position.set(x, y, z); c.scale.setScalar(s); scene.add(c); anim.push((t) => { c.position.x = x + Math.sin(t * .02 + k) * 6; });
  });

  // ── 바다 ──
  const seaU = { t: { value: 0 } };
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 400, 160, 100), new THREE.ShaderMaterial({ uniforms: seaU, fog: false,
    vertexShader: 'uniform float t; varying vec2 v; varying float w; void main(){ v = uv; vec3 p = position; w = sin(p.x*.22+t*.9)*.16 + sin(p.y*.31+t*1.2)*.12 + sin((p.x+p.y)*.6+t*1.7)*.05; p.z += w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.); }',
    fragmentShader: 'uniform float t; varying vec2 v; varying float w; void main(){ vec3 deep = vec3(.11,.42,.60), shal = vec3(.30,.72,.80), far = vec3(.72,.88,.94); float d = v.y; vec3 c = mix(shal, deep, smoothstep(.0,.55,d)); c = mix(c, far, smoothstep(.62,1.,d)); float s = sin(v.x*900.+sin(v.y*260.+t*.8)*3.+t*.6)*sin(v.y*700.-t*1.1); c += smoothstep(.93,1.,s)*.22*(1.-d); c += w*.22; gl_FragColor = vec4(c,1.); }' }));
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -1.1, -150); scene.add(sea); anim.push((t) => { seaU.t.value = t; });
  const isl = toon(0x77b08a, { fog: true }); [[-70, -4, -120, 26, 9, 14], [95, -5, -140, 34, 12, 16], [150, -5, -110, 18, 7, 10]].forEach(([x, y, z, a, b, c]) => add(new THREE.SphereGeometry(1, 18, 12), isl, x, y, z, { scale: [a, b, c], cast: false }));
  // 돛단배
  const boat = new THREE.Group(); box(3.2, .7, 1.2, toon(0xf4efe2), 0, 0, 0, { parent: boat }); add(new THREE.ConeGeometry(1.1, 2.6, 3), toon(0xffffff), .2, 1.9, 0, { parent: boat, scale: [1, 1, .08] }); add(new THREE.ConeGeometry(.8, 2, 3), toon(0xf08fb7), -.7, 1.6, 0, { parent: boat, scale: [1, 1, .08] });
  boat.position.set(-30, -.8, -34); scene.add(boat); anim.push((t) => { boat.position.x = -30 + t * .25 % 60; boat.rotation.z = Math.sin(t * 1.3) * .05; boat.position.y = -.8 + Math.sin(t * 1.1) * .08; });

  // ── 부두 ──
  const plank = tex(512, 512, (g, W, H) => { g.fillStyle = '#cfa877'; g.fillRect(0, 0, W, H); for (let r = 0; r < 8; r++) { g.fillStyle = ['#d6b081', '#c79f6d', '#d2aa7a', '#c49a67'][r % 4]; g.fillRect(0, r * 64 + 2, W, 60); g.fillStyle = 'rgba(90,60,35,.5)'; g.fillRect(0, r * 64, W, 3); g.fillRect((r * 173) % W, r * 64, 3, 64); } noise(g, W, H, 900, .1); }, [7, 4]);
  box(44, 1.2, 22, new THREE.MeshToonMaterial({ map: plank, gradientMap: ramp }), 0, -.6, 3, { ink: .35 });
  for (let x = -20; x <= 20; x += 8) add(new THREE.CylinderGeometry(.45, .5, 3.4, 10), toon(0x7c5236), x, -2.2, 13.4);

  // ── 건물 ──
  const wood = tex(256, 256, (g, W, H) => { g.fillStyle = '#9a6844'; g.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${60 + Math.random() * 40},${35 + Math.random() * 25},20,${.08 + Math.random() * .12})`; g.fillRect(0, Math.random() * H, W, 2 + Math.random() * 5); } });
  const woodM = new THREE.MeshToonMaterial({ map: wood, gradientMap: ramp }), woodD = toon(0x6f4a31);
  const plaster = tex(512, 512, (g, W, H) => { g.fillStyle = '#f6e9cc'; g.fillRect(0, 0, W, H); noise(g, W, H, 1400, .06); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(190,150,90,.20)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  const wall = new THREE.MeshToonMaterial({ map: plaster, gradientMap: ramp });
  const B = new THREE.Group(); scene.add(B); const P = { parent: B };
  box(12.6, .3, 6.6, woodM, 0, .15, 0, P);                         // 1층 바닥
  box(12.2, 3.0, .2, wall, 0, 1.8, -3.0, P); box(12.2, 3.0, .2, wall, 0, 5.1, -3.0, P);   // 뒷벽
  box(.2, 3.0, 6, wall, -6.0, 1.8, 0, P); box(.2, 3.0, 6, wall, -6.0, 5.1, 0, P);      // 왼벽
  box(.2, 3.0, 3, wall, 6.0, 5.1, -1.5, P);
  box(13, .34, 7, woodM, 0, 3.47, 0, P);                           // 2층 바닥
  for (const x of [-6, -2, 2, 6]) for (const z of [-3, 3]) box(.36, 6.6, .36, woodM, x, 3.6, z, P);
  for (const y of [3.3, 6.75]) { box(12.4, .3, .3, woodD, 0, y, 3, P); box(12.4, .3, .3, woodD, 0, y, -3, P); }
  // 난간(2층 앞·왼쪽)
  box(12, .12, .12, woodD, 0, 4.55, 3.1, P); for (let x = -5.6; x <= 5.6; x += .56) box(.08, .9, .08, woodM, x, 4.1, 3.1, { parent: B, ink: false });
  box(.12, .12, 5.8, woodD, -6.1, 4.55, 0, P);
  // 지붕
  const tile = tex(512, 256, (g, W, H) => { g.fillStyle = '#34877f'; g.fillRect(0, 0, W, H); for (let r = 0; r < 8; r++) for (let c = -1; c < 17; c++) { const x = c * 32 + (r % 2) * 16, y = r * 32; g.fillStyle = ['#3d968d', '#317f78', '#3a9087'][(c + r) % 3]; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 32, y); g.lineTo(x + 32, y + 18); g.quadraticCurveTo(x + 16, y + 38, x, y + 18); g.closePath(); g.fill(); g.strokeStyle = 'rgba(20,70,65,.55)'; g.lineWidth = 2; g.stroke(); } }, [6, 2]);
  const roof = add(new THREE.CylinderGeometry(.62, 1, 1, 4, 1), new THREE.MeshToonMaterial({ map: tile, gradientMap: ramp }), 0, 7.75, 0, { parent: B, rot: [0, Math.PI / 4, 0] });
  roof.scale.set(10.4, 1.7, 10.4); roof.geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(0)); const rg = new THREE.Group(); B.remove(roof); rg.add(roof); rg.scale.set(1, 1, .56); rg.position.y = 0; B.add(rg); roof.position.y = 7.75; ink(roof, .45);
  box(14.9, .22, 8.5, toon(0x255f59), 0, 6.92, 0, P);
  // 간판
  const signT = tex(1024, 256, (g, W, H) => { g.fillStyle = '#fff8e6'; g.fillRect(0, 0, W, H); g.strokeStyle = '#5a4334'; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12); g.setLineDash([6, 14]); g.strokeStyle = '#e56fab'; g.lineWidth = 4; g.strokeRect(26, 26, W - 52, H - 52); g.setLineDash([]);
    g.fillStyle = '#f08fb7'; g.beginPath(); g.arc(150, 128, 62, 0, 7); g.fill(); g.fillStyle = '#6d86c9'; g.beginPath(); g.arc(150, 128, 62, -1.57, 1.57); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(150, 136, 40, 16, 0, 0, 7); g.fill();
    g.fillStyle = '#4a3528'; g.font = `600 92px ${FONT}, sans-serif`; g.textBaseline = 'middle'; g.fillText('PINK LAGOON', 250, 108); g.font = `600 30px ${FONT}, sans-serif`; g.fillStyle = '#9a7b5e'; g.fillText('P R E M I U M   S E A F O O D   F R O M   K O R E A', 254, 188); });
  box(7.2, 1.8, .22, [woodD, woodD, woodD, woodD, new THREE.MeshBasicMaterial({ map: signT }), woodD], 0, 9.45, 2.2, P);
  box(.2, 1.3, .2, woodM, -2.6, 8.4, 2.2, P); box(.2, 1.3, .2, woodM, 2.6, 8.4, 2.2, P);
  // 차양(줄무늬)
  const stripe = tex(512, 64, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#fff6e6' : '#f08fb7'; g.fillRect(i * 32, 0, 32, H); } }, [1, 1]);
  const aw = box(13.2, .1, 1.3, new THREE.MeshToonMaterial({ map: stripe, gradientMap: ramp, side: THREE.DoubleSide }), 0, 3.22, 3.72, { parent: B, rot: [.3, 0, 0] });
  for (let i = 0; i < 16; i++) add(new THREE.SphereGeometry(.42, 12, 8, 0, 6.3, 1.57, 1.57), new THREE.MeshToonMaterial({ color: i % 2 ? 0xfff6e6 : 0xf08fb7, gradientMap: ramp, side: THREE.DoubleSide }), -6.19 + i * .825, 3.03, 4.33, { parent: B, scale: [1, .55, .25] });

  // ── 1층: 얼음 진열대 ──
  const S1 = new THREE.Group(); S1.position.set(-4, .3, 1.6); B.add(S1); const Q = (g) => ({ parent: g });
  box(3.2, 1.0, 1.3, toon(0x7fb9c9), 0, .5, 0, Q(S1)); box(3.4, .14, 1.5, toon(0xa9d7e3), 0, 1.06, 0, Q(S1));
  const iceM = new THREE.MeshToonMaterial({ color: 0xf4fbff, gradientMap: ramp, emissive: 0x9fd0e6, emissiveIntensity: .25, flatShading: true });
  for (let i = 0; i < 46; i++) add(new THREE.IcosahedronGeometry(.16 + (i % 4) * .04, 0), iceM, -1.45 + (i % 12) * .26 + ((i * 7) % 5) * .02, 1.2 + Math.floor(i / 12) * .1 - Math.abs((i % 12) - 5.5) * .012, -.5 + Math.floor(i / 12) * .3 + ((i * 3) % 4) * .03, { parent: S1, rot: [i, i * 2, i * 3], cast: false });
  const shellM = toon(0xe9dfc8), meatM = toon(0xfaf3e3);
  [[-1.1, .1], [-.5, -.2], [.1, .15], [.7, -.15], [1.2, .2], [-.8, .42], [.4, .45]].forEach(([x, z], i) => { const o = new THREE.Group(); add(new THREE.SphereGeometry(.26, 14, 8, 0, 6.3, 1.2, 1.9), shellM, 0, 0, 0, { parent: o, scale: [1.25, .45, .85] }); add(new THREE.SphereGeometry(.15, 10, 8), meatM, .02, -.02, 0, { parent: o, scale: [1.2, .35, .8] }); o.position.set(x, 1.5, z); o.rotation.set(-.25, i * .9, .1); S1.add(o); });
  add(new THREE.SphereGeometry(.17, 12, 10), toon(0xf7d44c), 1.35, 1.52, -.3, Q(S1));
  box(1.7, .44, .04, new THREE.MeshBasicMaterial({ map: label('OYSTER BAR', 1.7, .44) }), 0, .52, .67, { parent: S1, ink: false });
  // ── 1층: 냉동 쇼케이스 ──
  const S2 = new THREE.Group(); S2.position.set(0, .3, 1.5); B.add(S2);
  box(3.3, .8, 1.3, toon(0xdfe9ee), 0, .4, 0, Q(S2)); box(3.3, .1, 1.3, toon(0xc5d3db), 0, 1.75, 0, Q(S2));
  for (const x of [-1.6, 1.6]) box(.1, .9, 1.3, toon(0xc5d3db), x, 1.25, 0, Q(S2)); box(3.3, .9, .08, toon(0xc5d3db), 0, 1.25, -.61, Q(S2));
  add(new THREE.BoxGeometry(3.1, .86, .04), new THREE.MeshPhysicalMaterial({ color: 0xdff3ff, transparent: true, opacity: .28, roughness: .05, metalness: 0, clearcoat: 1 }), 0, 1.25, .63, { parent: S2, cast: false });
  [['OYSTER', '#2b4f9a'], ['FRY', '#27324f'], ['CRAB', '#e56fab'], ['ROE', '#d9632d'], ['SALAD', '#2f7d54'], ['FISH', '#3f9d94']].forEach(([n, c], i) => box(.42, .62, .16, [toon(c), toon(c), toon(c), toon(c), new THREE.MeshBasicMaterial({ map: tex(128, 192, (g, W, H) => { g.fillStyle = c; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(14, 22, W - 28, 44); g.fillStyle = c; g.font = `600 22px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText(n, W / 2, 52); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(W / 2, 128, 34, 0, 7); g.fill(); }) }), toon(c)], -1.25 + i * .5, 1.16, .2, { parent: S2, rot: [-.12, 0, 0] }));
  box(1.9, .4, .04, new THREE.MeshBasicMaterial({ map: label('FROZEN  -18°C', 1.9, .4, { bg: '#27324f', fg: '#ffffff', border: false }) }), 0, .42, .67, { parent: S2, ink: false });
  // ── 1층: 조리대 ──
  const S3 = new THREE.Group(); S3.position.set(4, .3, 1.5); B.add(S3);
  const brick = tex(256, 128, (g, W, H) => { g.fillStyle = '#b5653f'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(120,60,35,.7)'; g.lineWidth = 3; for (let r = 0; r < 4; r++) { g.strokeRect(-2, r * 32, W + 4, 32); for (let c = 0; c < 5; c++) g.strokeRect(c * 64 + (r % 2) * 32, r * 32, 64, 32); } noise(g, W, H, 200, .1); });
  box(3.3, 1.0, 1.2, new THREE.MeshToonMaterial({ map: brick, gradientMap: ramp }), 0, .5, 0, Q(S3)); box(3.5, .12, 1.4, toon(0xe9dcc3), 0, 1.06, 0, Q(S3));
  const pan = new THREE.Group(); add(new THREE.CylinderGeometry(.42, .36, .1, 20), toon(0x3b3f4a), 0, 0, 0, Q(pan)); box(.5, .05, .08, woodD, .64, .02, 0, Q(pan)); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(.11, 10, 8), toon(0xe0913a), -.16 + (i % 2) * .3, .08, -.12 + Math.floor(i / 2) * .24, { parent: pan, scale: [1.2, .7, 1] });
  pan.position.set(-.8, 1.18, .1); S3.add(pan); anim.push((t) => { pan.position.y = 1.18 + Math.max(0, Math.sin(t * 3)) * .06; pan.rotation.z = Math.sin(t * 3) * .05; });
  add(new THREE.CylinderGeometry(.34, .3, .05, 20), toon(0xfffdf6), .9, 1.15, .1, Q(S3)); add(new THREE.SphereGeometry(.2, 12, 8, 0, 6.3, 0, 1.57), toon(0xd8745a), .9, 1.17, .1, { parent: S3, scale: [1.1, .6, 1] });
  box(1.9, .4, .06, new THREE.MeshBasicMaterial({ map: label('LIVE COOKING', 1.9, .4, { bg: '#4a3528', fg: '#fff8e6', border: false }) }), 0, 2.72, 1.45, { parent: S3, ink: false });
  // 김(스팀)
  const steamT = tex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false })); S3.add(s); anim.push((t) => { const k = (t * .35 + i / 7) % 1; s.position.set(-.8 + Math.sin(k * 6 + i) * .14, 1.3 + k * 1.3, .1); s.scale.setScalar(.25 + k * .5); s.material.opacity = (1 - k) * .55; }); }
  // 벽 선반(김·상온 제품)
  box(3.2, .08, .4, woodM, -4, 2.2, -2.7, P); ['#2d4a36', '#3b5a40', '#e56fab', '#2d4a36', '#e0a23c', '#3b5a40'].forEach((c, i) => box(.36, .46 + (i % 2) * .1, .2, toon(c), -5.2 + i * .48, 2.5 + (i % 2) * .05, -2.7, P));
  box(3.2, .08, .4, woodM, 0, 2.2, -2.7, P); for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(.17, .17, .4, 12), toon(['#d8745a', '#f7d44c', '#6d86c9', '#f08fb7', '#3f9d94'][i]), -1.2 + i * .6, 2.44, -2.7, P);

  // ── 계단(오른쪽 바깥) ──
  for (let i = 0; i < 9; i++) box(1.5, .2, .62, woodM, 6.95, .28 + i * .4, 2.6 - i * .62, P), box(1.5, .28 + i * .4, .62, toon(0x8b5c3d), 6.95, (.28 + i * .4) / 2 - .05, 2.6 - i * .62, { parent: B, ink: false });
  const rail = box(.1, .1, 6.6, toon(0xe56fab), 7.7, 3.1, .1, { parent: B, rot: [-.575, 0, 0] });
  for (const [y, z] of [[1.4, 2.7], [3.1, .1], [4.75, -2.4]]) box(.1, 1.3, .1, woodD, 7.7, y - .45, z, P);
  box(1.6, .2, 1.4, woodM, 6.95, 3.5, -2.7, P);

  // ── 2층 ──
  const scr = tex(512, 288, (g, W, H) => { const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#7cc4e8'); s.addColorStop(1, '#3f93bd'); g.fillStyle = s; g.fillRect(0, 0, W, H); g.fillStyle = '#fff6cf'; g.beginPath(); g.arc(400, 70, 30, 0, 7); g.fill(); g.fillStyle = '#2f7fa8'; g.beginPath(); g.moveTo(0, 200); g.quadraticCurveTo(130, 140, 260, 200); g.quadraticCurveTo(390, 150, 512, 205); g.lineTo(512, 288); g.lineTo(0, 288); g.fill(); g.fillStyle = 'rgba(255,255,255,.92)'; g.beginPath(); g.moveTo(226, 110); g.lineTo(300, 148); g.lineTo(226, 186); g.fill(); });
  box(3.0, 1.75, .12, [toon(0x2c3550), toon(0x2c3550), toon(0x2c3550), toon(0x2c3550), new THREE.MeshBasicMaterial({ map: scr }), toon(0x2c3550)], -3.9, 5.2, -2.82, P);
  [['HACCP', '#6d86c9'], ['EU', '#3f9d94'], ['FDA', '#d8745a'], ['KITA', '#e0a23c']].forEach(([n, c], i) => box(.72, .92, .06, [woodD, woodD, woodD, woodD, new THREE.MeshBasicMaterial({ map: tex(160, 204, (g, W, H) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, W, H); g.fillStyle = c; g.beginPath(); g.arc(W / 2, 78, 40, 0, 7); g.fill(); g.fillStyle = '#5a4334'; g.font = `600 26px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText(n, W / 2, 168); }) }), woodD], 2.55 + i * .92, 5.3, -2.85, P));
  add(new THREE.CylinderGeometry(1.0, 1.0, .1, 24), woodM, 0, 4.5, .3, { parent: B, ink: .4 }); add(new THREE.CylinderGeometry(.1, .16, .85, 10), woodD, 0, 4.06, .3, P);
  add(new THREE.CylinderGeometry(.13, .1, .18, 12), toon(0xffffff), .35, 4.64, .2, P); box(.5, .03, .36, toon(0xffffff), -.3, 4.57, .4, P);

  // ── 등불, 깃발 ──
  const lanterns = [[-4, 2.55, 3.2, 0xf4a259], [0, 2.55, 3.2, 0xf08fb7], [4, 2.55, 3.2, 0xf4a259], [-3, 6.2, 2.9, 0xf08fb7], [3, 6.2, 2.9, 0xf4a259]];
  lanterns.forEach(([x, y, z, c], i) => { const L = new THREE.Group(); add(new THREE.SphereGeometry(.24, 14, 12), new THREE.MeshToonMaterial({ color: c, gradientMap: ramp, emissive: c, emissiveIntensity: .55 }), 0, -.36, 0, { parent: L, scale: [1, 1.2, 1], cast: false }); add(new THREE.CylinderGeometry(.012, .012, .3, 4), woodD, 0, -.08, 0, { parent: L, cast: false }); for (const yy of [-.1, -.63]) add(new THREE.CylinderGeometry(.13, .13, .06, 10), woodD, 0, yy, 0, { parent: L, cast: false }); L.position.set(x, y + .35, z); B.add(L); anim.push((t) => { L.rotation.z = Math.sin(t * 1.4 + i) * .09; L.rotation.x = Math.sin(t * 1.1 + i * 2) * .05; }); });
  const lampA = new THREE.PointLight(0xffc98a, 7, 9, 2); lampA.position.set(-2, 2.7, 2.2); B.add(lampA); const lampB = new THREE.PointLight(0xffc98a, 7, 9, 2); lampB.position.set(3, 2.7, 2.2); B.add(lampB);
  const flagC = [0xf08fb7, 0x6d86c9, 0xf7d44c, 0x3f9d94, 0xf4a259];
  for (const dir of [-1, 1]) for (let i = 1; i < 9; i++) { const k = i / 9, x = dir * (3.6 + k * 5.6), y = 9.3 - k * 2.4 - Math.sin(k * 3.14) * .7; const f = add(new THREE.ConeGeometry(.2, .42, 3), new THREE.MeshToonMaterial({ color: flagC[i % 5], gradientMap: ramp, side: THREE.DoubleSide }), x, y, 2.3 + k * 1.2, { parent: B, rot: [Math.PI, 0, 0], scale: [1, 1, .06], cast: false }); anim.push((t) => { f.rotation.z = Math.sin(t * 2.2 + i) * .22; }); }

  // ── 사람(등신 낮은 캐릭터) ──
  const skin = toon(0xf6d3b3), dark = new THREE.MeshBasicMaterial({ color: 0x3a2a22 }), blush = new THREE.MeshBasicMaterial({ color: 0xf4a9a0, transparent: true, opacity: .8 });
  function person(x, y, z, shirt, o = {}) {
    const g = new THREE.Group(), s = o.s || 1;
    add(new THREE.CapsuleGeometry(.27, .34, 6, 14), toon(shirt), 0, .62, 0, Q(g));
    for (const sx of [-1, 1]) { add(new THREE.CapsuleGeometry(.09, .22, 4, 8), toon(0x4a5a78), sx * .13, .2, 0, Q(g)); const arm = add(new THREE.CapsuleGeometry(.075, .26, 4, 8), toon(shirt), sx * .34, .66, 0, { parent: g, rot: [0, 0, sx * .28] }); add(new THREE.SphereGeometry(.085, 10, 8), skin, sx * .4, .46, 0, Q(g)); if (o.wave && sx === 1) anim.push((t) => { arm.rotation.z = 2.3 + Math.sin(t * 5) * .35; arm.position.set(.42, .98, 0); }); }
    if (o.apron) add(new THREE.BoxGeometry(.4, .46, .06), toon(0xfffaf0), 0, .56, .26, Q(g));
    const head = new THREE.Group(); head.position.y = 1.28; g.add(head);
    add(new THREE.SphereGeometry(.36, 22, 18), skin, 0, 0, 0, Q(head));
    add(new THREE.SphereGeometry(.385, 22, 16, 0, 6.3, 0, 1.75), toon(o.hair || 0x3a2a22), 0, .03, -.05, { parent: head, rot: [-.32, 0, 0] });
    for (const sx of [-1, 1]) { add(new THREE.SphereGeometry(.045, 8, 8), dark, sx * .13, -.02, .335, { parent: head, scale: [1, 1.35, .5], cast: false }); add(new THREE.SphereGeometry(.06, 8, 8), blush, sx * .22, -.11, .29, { parent: head, scale: [1, .6, .3], cast: false }); }
    if (o.hat === 'chef') { add(new THREE.CylinderGeometry(.24, .26, .22, 16), toon(0xfffdf6), 0, .36, 0, Q(head)); add(new THREE.SphereGeometry(.31, 16, 12), toon(0xfffdf6), 0, .56, 0, { parent: head, scale: [1, .7, 1] }); }
    if (o.hat === 'cap') { add(new THREE.SphereGeometry(.39, 18, 12, 0, 6.3, 0, 1.45), toon(0xe56fab), 0, .05, 0, Q(head)); add(new THREE.CylinderGeometry(.3, .3, .04, 16, 1, false, -1.2, 2.4), toon(0xd85a9a), 0, .12, .2, Q(head)); }
    if (o.bag) { box(.3, .36, .2, toon(0x3f9d94), .5, .26, .1, Q(g)); }
    g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = o.ry || 0; (o.parent || B).add(g);
    const ph = Math.random() * 6; anim.push((t) => { g.position.y = y + Math.abs(Math.sin(t * 1.6 + ph)) * .035 * s; head.rotation.z = Math.sin(t * .9 + ph) * .06; head.rotation.y = Math.sin(t * .5 + ph) * .18; });
    if (o.mark) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(128, 128, (c) => { c.fillStyle = '#fff8e1'; c.strokeStyle = '#5a4334'; c.lineWidth = 7; c.beginPath(); c.roundRect(14, 8, 100, 84, 22); c.fill(); c.stroke(); c.beginPath(); c.moveTo(50, 90); c.lineTo(64, 118); c.lineTo(78, 90); c.fill(); c.stroke(); c.fillStyle = '#fff8e1'; c.fillRect(46, 80, 36, 12); c.fillStyle = '#d85a2a'; c.font = `700 60px ${FONT}, sans-serif`; c.textAlign = 'center'; c.fillText(o.mark, 64, 72); }), depthTest: false })); m.scale.setScalar(.7); m.position.set(0, 2.25, 0); g.add(m); anim.push((t) => { m.position.y = 2.25 + Math.sin(t * 2.4 + ph) * .07; }); }
    return g;
  }
  person(-4, .3, .5, 0x6d86c9, { hair: 0x6b4a36, mark: '?', wave: true });               // 굴 바 직원
  person(4.2, .3, .55, 0xfffdf6, { hat: 'chef', apron: true, mark: '!' });               // 셰프
  person(-1.1, 3.64, .5, 0x6d86c9, { ry: 1.1, s: .95 }); person(1.1, 3.64, .5, 0xe0a23c, { hair: 0x6b4a36, ry: -1.1, s: .95, mark: '…' });   // 2층 상담
  // 부두 위: 문의 데스크, 시식대, 바이어
  const D = new THREE.Group(); D.position.set(-5.6, 0, 6.0); scene.add(D);
  box(3.0, 1.0, 1.0, toon(0x4a3528), 0, .5, 0, Q(D)); box(3.2, .14, 1.2, toon(0xe56fab), 0, 1.07, 0, Q(D));
  box(1.9, .42, .04, new THREE.MeshBasicMaterial({ map: label('INQUIRY DESK', 1.9, .42, { bg: '#4a3528', fg: '#fff8e6', border: false }) }), 0, .52, .52, { parent: D, ink: false });
  box(.34, .44, .04, new THREE.MeshBasicMaterial({ map: tex(96, 124, (g, W, H) => { g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.fillStyle = '#231f20'; for (let i = 0; i < 49; i++) if ((i * 7 + (i % 5) * 3) % 3) g.fillRect(14 + (i % 7) * 10, 14 + Math.floor(i / 7) * 10, 9, 9); g.font = `600 13px ${FONT}, sans-serif`; g.textAlign = 'center'; g.fillText('WhatsApp', W / 2, 110); }) }), 1.1, 1.38, .1, { parent: D, rot: [-.2, 0, 0], ink: false });
  box(1.2, .3, .7, woodM, 0, .15, -.8, Q(D)); person(0, .3, -.8, 0xf08fb7, { parent: D, hat: 'cap', mark: '!', wave: true });
  const T = new THREE.Group(); T.position.set(4.0, 0, 6.2); scene.add(T);
  box(2.6, .9, 1.0, toon(0xfff8e6), 0, .45, 0, Q(T)); box(2.8, .1, 1.2, new THREE.MeshToonMaterial({ map: stripe, gradientMap: ramp }), 0, .95, 0, Q(T));
  [0xe0913a, 0xd8745a, 0x6fa86a].forEach((c, i) => { add(new THREE.CylinderGeometry(.28, .24, .05, 18), toon(0xfffdf6), -.8 + i * .8, 1.03, 0, Q(T)); add(new THREE.SphereGeometry(.13, 10, 8), toon(c), -.8 + i * .8, 1.1, 0, { parent: T, scale: [1.2, .6, 1] }); });
  box(1.9, .4, .04, new THREE.MeshBasicMaterial({ map: label('TASTING · SAMPLES', 1.9, .4, { size: 44 }) }), 0, .45, .52, { parent: T, ink: false });
  person(1.9, 0, .1, 0x3f9d94, { parent: T, hair: 0x2f2a35, ry: -.5 });
  const buyer = person(-.6, 0, 7.4, 0xf4efe2, { parent: scene, hair: 0x2f2a35, bag: true, s: 1.08, ry: 3.14 });
  const arrow = add(new THREE.ConeGeometry(.16, .3, 4), new THREE.MeshBasicMaterial({ color: 0xf7d44c }), -.6, 2.35, 7.4, { rot: [Math.PI, 0, 0], cast: false }); anim.push((t) => { arrow.position.y = 2.35 + Math.sin(t * 3) * .08; arrow.rotation.y = t * 2; });

  // ── 소품 ──
  const crateT = tex(128, 128, (g, W, H) => { g.fillStyle = '#c99a63'; g.fillRect(0, 0, W, H); g.strokeStyle = '#7c5236'; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.beginPath(); g.moveTo(8, 8); g.lineTo(W - 8, H - 8); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke(); });
  const crateM = new THREE.MeshToonMaterial({ map: crateT, gradientMap: ramp });
  [[-8.6, .5, 2.2, 1], [-9.7, .5, 2.6, 1], [-9.1, 1.45, 2.4, .9], [9.6, .45, 4.6, .9], [10.6, .45, 5.0, .9]].forEach(([x, y, z, s], i) => box(s, s, s, crateM, x, y, z, { rot: [0, i * .4, 0] }));
  const barrel = (x, z) => { add(new THREE.CylinderGeometry(.5, .44, 1.1, 16), woodM, x, .55, z); for (const y of [.25, .85]) add(new THREE.TorusGeometry(.5, .04, 6, 20), toon(0x5f6b7a), x, y, z, { rot: [Math.PI / 2, 0, 0] }); add(new THREE.CylinderGeometry(.44, .44, .04, 16), toon(0x7fb9c9), x, 1.08, z); };
  barrel(-11, 4.2); barrel(-11.9, 5.2);
  const plant = (x, z, s = 1) => { add(new THREE.CylinderGeometry(.36, .28, .5, 12), toon(0xc9764f), x, .25, z, { scale: [s, s, s] }); for (let i = 0; i < 7; i++) add(new THREE.ConeGeometry(.16, 1.3, 5), toon(i % 2 ? 0x6fa86a : 0x5a9a5c), x + Math.cos(i) * .16 * s, .95 * s, z + Math.sin(i) * .16 * s, { rot: [Math.sin(i) * .5, 0, -Math.cos(i) * .5], scale: [s, s, s * .4] }); };
  plant(-7.4, 4.3, 1.2); plant(8.9, 4.0, 1.1); plant(-7.2, -2.0, 1); plant(11.4, 1.2, 1.2);
  // 고양이
  const cat = new THREE.Group(); const catM = toon(0xf2b56b); add(new THREE.SphereGeometry(.24, 14, 10), catM, 0, .22, 0, { parent: cat, scale: [1.3, .9, 1] }); add(new THREE.SphereGeometry(.19, 14, 10), catM, .26, .42, 0, Q(cat)); for (const z of [-.09, .09]) add(new THREE.ConeGeometry(.07, .14, 4), catM, .28, .6, z, Q(cat)); const tail = add(new THREE.CapsuleGeometry(.04, .34, 4, 6), catM, -.34, .4, 0, { parent: cat, rot: [0, 0, .6] }); cat.position.set(1.3, 0, 7.9); cat.rotation.y = -.6; scene.add(cat); anim.push((t) => { tail.rotation.z = .6 + Math.sin(t * 2) * .3; });
  // 갈매기
  const gulls = []; for (let i = 0; i < 3; i++) { const g = new THREE.Group(); const w1 = add(new THREE.BoxGeometry(.9, .03, .22), new THREE.MeshBasicMaterial({ color: 0xffffff }), -.45, 0, 0, { parent: g, cast: false }); const w2 = add(new THREE.BoxGeometry(.9, .03, .22), new THREE.MeshBasicMaterial({ color: 0xffffff }), .45, 0, 0, { parent: g, cast: false }); w1.geometry.translate(-.0, 0, 0); scene.add(g); anim.push((t) => { const a = t * .25 + i * 2.1; g.position.set(Math.cos(a) * (16 + i * 3), 13 + i * 1.4 + Math.sin(t + i), -8 + Math.sin(a) * 10); g.rotation.y = -a; w1.rotation.z = Math.sin(t * 6 + i) * .5; w2.rotation.z = -Math.sin(t * 6 + i) * .5; }); }

  // ── 카메라 ──
  const VIEWS = { all: { pos: [11, 6.4, 31], look: [0.2, 4.4, 0] }, f1: { pos: [2.5, 3.6, 18.5], look: [0, 1.9, 1.5] }, f2: { pos: [-2.5, 7.6, 15.5], look: [0, 5.0, 0] }, close: { pos: [-1.6, 2.7, 8.6], look: [-4.0, 1.55, 1.4] } };
  let cur = { pos: new THREE.Vector3(...VIEWS.all.pos), look: new THREE.Vector3(...VIEWS.all.look) }, target = { pos: cur.pos.clone(), look: cur.look.clone() }, orbit = { x: 0, y: 0 };
  const api = { VIEWS, goto(name, instant) { const v = VIEWS[name]; target.pos.set(...v.pos); target.look.set(...v.look); if (instant) { cur.pos.copy(target.pos); cur.look.copy(target.look); } }, renderer, scene, camera,
    resize() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1 ? 46 : 30; camera.updateProjectionMatrix(); },
    frame(t) { anim.forEach((f) => f(t)); cur.pos.lerp(target.pos, .06); cur.look.lerp(target.look, .06); camera.position.copy(cur.pos).add(new THREE.Vector3(orbit.x * 5 + Math.sin(t * .15) * .5, orbit.y * 2.2, 0)); camera.lookAt(cur.look); renderer.render(scene, camera); } };
  canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); orbit.x = (e.clientX - r.left) / r.width - .5; orbit.y = .5 - (e.clientY - r.top) / r.height; });
  api.resize(); window.addEventListener('resize', api.resize);
  if (!opts.manual) { const t0 = performance.now(); let seen = true; if (window.IntersectionObserver) new IntersectionObserver((e) => { seen = e[0].isIntersecting; }).observe(canvas); const loop = () => { if (seen && !document.hidden) api.frame((performance.now() - t0) / 1000); requestAnimationFrame(loop); }; loop(); }
  return api;
}
