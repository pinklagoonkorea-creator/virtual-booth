// 3D 부스를 페이지의 한 칸 안에 붙인다: import { mount } from '.../embed.js'; mount(element)
// 게임 화면(위치, 층 이동, 지도, 퀘스트, 대화창)을 장면 위에 얹는다. 지금은 시제품이라 버튼 대부분은 보여주기용이다.
import { createBooth } from './scene.js';
const HERE = new URL('.', import.meta.url).href;
const CSS = `
:host{display:block}*{box-sizing:border-box}
.w{position:relative;width:100%;height:100%;min-height:420px;overflow:hidden;border-radius:var(--plb-radius,14px);background:#9fd0ea;font-family:'PLB Poppins',Poppins,'Pretendard','Noto Sans KR',sans-serif;color:#4a3528;touch-action:pan-y}
canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hud{position:absolute;inset:0;pointer-events:none}.hud>*{pointer-events:auto}
.card{background:linear-gradient(#fff9e8,#f3e3bf);border:3px solid #5a4334;border-radius:16px;box-shadow:0 6px 0 rgba(90,67,52,.18),0 14px 28px rgba(40,30,20,.18)}
.loc{position:absolute;left:18px;top:16px;display:flex;gap:12px;align-items:center;padding:9px 18px 9px 11px}
.loc i{width:44px;height:44px;border-radius:50%;background:#3f9d94;border:3px solid #5a4334;display:grid;place-items:center;color:#fff8e6;font-style:normal;font-size:21px}
.loc b{display:block;font-size:16px;line-height:1.2;font-weight:600}.loc small{font:500 12.5px 'Noto Sans KR',sans-serif;color:#9a7b5e}
.floors{position:absolute;left:18px;top:90px;display:flex;gap:8px}
button{font:600 14px 'PLB Poppins',Poppins,'Noto Sans KR',sans-serif;color:#4a3528;cursor:pointer;padding:8px 15px}
button.on{background:#e56fab;color:#fff}
.right{position:absolute;right:18px;top:16px;display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.tag{padding:6px 14px;font-size:12px;font-weight:600;color:#d85a2a}
.map{width:140px;height:140px;border-radius:50%;display:grid;place-items:center}
.quest{width:262px;padding:13px 15px}.quest h4{margin:0 0 7px;font-size:13px;color:#d85a2a;letter-spacing:.06em}
.quest p{margin:0 0 5px;font:500 13.5px 'Noto Sans KR',sans-serif}.quest .pg{height:8px;border-radius:4px;background:#e8d2a6;margin-top:9px;overflow:hidden}.quest .pg i{display:block;width:38%;height:100%;background:#e56fab}
.talk{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:min(900px,calc(100% - 36px));display:flex;gap:15px;align-items:center;padding:13px 18px}
.face{flex:none;width:60px;height:60px;border-radius:50%;border:3px solid #5a4334;background:#cfe6f2 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M14 64q0-20 18-20t18 20z' fill='%23f08fb7'/%3E%3Ccircle cx='32' cy='30' r='15' fill='%23f6d3b3'/%3E%3Cpath d='M16 26q2-16 16-16t16 16q-8-8-16-8t-16 8z' fill='%23e56fab'/%3E%3Ccircle cx='26' cy='31' r='2.2' fill='%233a2a22'/%3E%3Ccircle cx='38' cy='31' r='2.2' fill='%233a2a22'/%3E%3Cpath d='M28 37q4 3 8 0' fill='none' stroke='%235a4334' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E") center/cover}
.talk b{display:block;font-size:13px;color:#d85a2a;margin-bottom:2px;font-weight:600}.talk p{margin:0;font:500 15.5px/1.5 'Noto Sans KR',sans-serif}
.err{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font:500 15px/1.6 'Noto Sans KR',sans-serif;background:#f3e3bf}
@media(max-width:760px){.quest,.map{display:none}.talk p{font-size:13.5px}.loc b{font-size:14px}.face{width:46px;height:46px}button{padding:7px 11px;font-size:13px}}
`;
const HUD = `
<div class="card loc"><i>★</i><div><b>Pink Lagoon Booth</b><small id="where">전체 보기 · 수산 시장 부두</small></div></div>
<div class="floors"><button class="card on" data-v="all">전체</button><button class="card" data-v="f1">1층</button><button class="card" data-v="f2">2층</button><button class="card" data-v="close">굴 바</button></div>
<div class="right"><div class="card tag">3D PROTOTYPE</div>
<div class="card map"><svg width="110" height="110" viewBox="-60 -60 120 120"><circle r="56" fill="#cfe6d8" stroke="#5a4334" stroke-width="1.5"/><rect x="-36" y="-28" width="72" height="42" rx="4" fill="#f6e8c9" stroke="#5a4334" stroke-width="2"/><rect x="-36" y="-28" width="72" height="9" fill="#3f9d94"/><rect x="36" y="-14" width="13" height="28" fill="#a06c48" stroke="#5a4334"/><circle cx="-22" cy="2" r="5" fill="#7fb9c9"/><circle cx="0" cy="2" r="5" fill="#dfe9ee" stroke="#5a4334"/><circle cx="22" cy="2" r="5" fill="#d8745a"/><circle cx="-26" cy="30" r="5" fill="#e56fab"/><circle cx="24" cy="32" r="5" fill="#f08fb7"/><path d="M2 36l-6 10h12z" fill="#f7d44c" stroke="#5a4334"/></svg></div>
<div class="card quest"><h4>QUEST</h4><p>☐ 수입 국가 고르기</p><p>☐ 제품 3개 살펴보기</p><p>☐ 샘플 요청 또는 문의 남기기</p><div class="pg"><i style="width:0"></i></div></div></div>
<div class="card talk"><div class="face"></div><div><b>Mina · Booth staff</b><p>어서 오세요! 핑크라군 부스의 3D 시제품입니다. 위쪽 버튼으로 1층과 2층을 둘러보세요. 제품 보기와 문의는 다음 단계에서 연결됩니다.</p></div></div>`;
const NAMES = { all: '전체 보기 · 수산 시장 부두', f1: '1층 · 진열과 시식', f2: '2층 · 상담 라운지', close: '1층 · 굴 바' };

export async function mount(host, opts = {}) {
  if (!document.getElementById('plb-fonts')) { const fs = document.createElement('style'); fs.id = 'plb-fonts'; fs.textContent = [600, 700].map((w) => `@font-face{font-family:'PLB Poppins';font-weight:${w};font-display:swap;src:url('${HERE}fonts/poppins-latin-${w}-normal.woff2') format('woff2')}`).join(''); document.head.appendChild(fs); }
  const root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  root.innerHTML = `<style>${CSS}</style><div class="w"><canvas></canvas><div class="hud">${opts.hud === false ? '' : HUD}</div></div>`;
  const wrap = root.querySelector('.w'), canvas = root.querySelector('canvas');
  try { await document.fonts.load("600 40px 'PLB Poppins'"); } catch (e) { /* 글꼴이 늦어도 장면은 그린다 */ }
  let booth;
  try { const t = document.createElement('canvas'); if (!(t.getContext('webgl2') || t.getContext('webgl'))) throw new Error('no webgl'); booth = createBooth(canvas, { ...opts, font: "'PLB Poppins'" }); }
  catch (e) { wrap.innerHTML = '<div class="err">이 기기에서는 3D 부스를 열 수 없습니다.<br>This device cannot show the 3D booth.</div>'; return null; }
  if (window.ResizeObserver) new ResizeObserver(() => booth.resize()).observe(wrap);
  root.querySelectorAll('[data-v]').forEach((b) => { b.onclick = () => { booth.goto(b.dataset.v); root.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('on', x === b)); root.getElementById('where').textContent = NAMES[b.dataset.v]; }; });
  if (opts.view) booth.goto(opts.view, true);
  return booth;
}
