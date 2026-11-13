/* Pink Lagoon 가상 부스 — 2D 이미지를 CSS 3D 공간에 세운 전시 부스.
   붙이는 법은 README.md 참고. 외부 라이브러리 없음. Shadow DOM 안에 그려서 홈페이지 스타일과 섞이지 않는다.
   설정(스크립트 태그의 data-* 또는 PinkLagoonBooth.mount(el, opts)):
     base      : 이 폴더의 주소(끝에 /). 기본값은 booth.js가 있는 곳
     endpoint  : 문의를 받을 주소(POST, JSON). 없으면 메일 프로그램을 연다
     email     : 받는 메일. 기본 info@pinklagoonkorea.com
     lang      : en | ko. 기본 en
*/
(function () {
  'use strict';
  var SELF = document.currentScript;
  var T = {
    en: {
      gate_title: 'Welcome to the Pink Lagoon Virtual Booth', gate_sub: 'Tell us where you import to. We will show a preliminary import check for each product.',
      gate_pick: 'Select your import country', gate_go: 'Enter the booth', change: 'Change',
      importing: 'Importing to', hint: 'Drag to look around · Tap a product', list: 'List view', booth: 'Booth view',
      v_ok: 'Preliminary check: OK', v_cond: 'Conditions apply', v_check: 'To be confirmed', v_no: 'Not available now',
      m_ok: 'Based on our preliminary check, this product can be imported into {c}. Final specifications, documents and labelling are confirmed per order.',
      m_cond: 'Import into {c} is possible when certain conditions are met (for example facility registration, permits, labelling or formulation). We will confirm what applies to your order.',
      m_check: 'We have not yet confirmed the import requirements for this product in {c}. Our trade compliance team will check and reply.',
      m_no: 'Based on our preliminary check, this product cannot currently be imported into {c}. Please ask us about alternatives.',
      disclaimer: 'This is a preliminary check only, not a guarantee of import clearance. Requirements change. Please contact Pink Lagoon for details.',
      origin: 'Origin', latin: 'Scientific name', add: 'Add to inquiry', added: 'Added ✓', remove: 'Remove', photo_soon: 'Photo on request', sourcing: 'Global sourcing',
      inquiry: 'Inquiry', inquiry_n: 'Inquiry ({n})', form_title: 'Send an inquiry', form_sub: 'We reply within 1–2 business days.',
      f_name: 'Name', f_company: 'Company', f_email: 'Email', f_phone: 'Phone / WhatsApp (optional)', f_country: 'Import country', f_products: 'Products of interest',
      f_none: 'No products selected yet. You can still send a general inquiry.', f_msg: 'Message (volume, specification, target price, timing)',
      f_consent: 'I agree that Pink Lagoon may use these details to reply to my inquiry.', send: 'Send inquiry', sending: 'Sending…',
      sent_title: 'Thank you.', sent_body: 'Your inquiry has been received. We will reply to {e} shortly.',
      mail_title: 'One more step', mail_body: 'Your email program has been opened with the inquiry filled in. Please press send. If nothing opened, copy the text below and email it to {m}.',
      copy: 'Copy text', copied: 'Copied', err: 'Sending failed. Please email us at {m}.', req: 'Please fill in name, company and a valid email, and tick the consent box.',
      desk: 'Inquiry Desk', close: 'Close', tagline: 'Premium Seafood from Korea', prev: 'Previous wall', next: 'Next wall'
    },
    ko: {
      gate_title: '핑크라군 가상 부스에 오신 것을 환영합니다', gate_sub: '수입하실 국가를 알려주세요. 제품별 1차 수입 가능 여부를 함께 보여드립니다.',
      gate_pick: '수입 희망 국가 선택', gate_go: '부스 입장', change: '변경',
      importing: '수입 국가', hint: '끌어서 둘러보기 · 제품을 눌러 보세요', list: '목록 보기', booth: '부스 보기',
      v_ok: '1차 확인: 가능', v_cond: '조건부 가능', v_check: '확인 필요', v_no: '현재 불가',
      m_ok: '수입 국가 {c} 기준, 1차 확인 결과 수입이 가능한 품목입니다. 최종 규격·서류·라벨은 주문별로 확정합니다.',
      m_cond: '수입 국가 {c} 기준, 일정 조건(시설 등록, 허가, 라벨, 배합 등)을 충족하면 수입이 가능합니다. 주문에 해당하는 조건을 확인해 드립니다.',
      m_check: '수입 국가 {c} 기준, 이 품목의 수입 요건은 아직 확인하지 못했습니다. 무역법규팀이 확인 후 회신드립니다.',
      m_no: '수입 국가 {c} 기준, 1차 확인 결과 현재는 수입이 어렵습니다. 대체 품목을 문의해 주세요.',
      disclaimer: '이 결과는 1차 확인이며 통관을 보장하지 않습니다. 규정은 바뀔 수 있으니 자세한 내용은 핑크라군에 문의해 주세요.',
      origin: '원산지', latin: '학명', add: '문의에 담기', added: '담음 ✓', remove: '빼기', photo_soon: '사진은 요청 시 제공', sourcing: '해외 소싱',
      inquiry: '문의하기', inquiry_n: '문의하기 ({n})', form_title: '문의 남기기', form_sub: '영업일 기준 1~2일 안에 회신드립니다.',
      f_name: '이름', f_company: '회사명', f_email: '이메일', f_phone: '전화 / WhatsApp (선택)', f_country: '수입 국가', f_products: '관심 제품',
      f_none: '아직 담은 제품이 없습니다. 일반 문의로 보내셔도 됩니다.', f_msg: '문의 내용 (물량, 규격, 희망 가격, 시기)',
      f_consent: '문의 회신을 위해 핑크라군이 위 정보를 사용하는 데 동의합니다.', send: '문의 보내기', sending: '보내는 중…',
      sent_title: '감사합니다.', sent_body: '문의가 접수되었습니다. {e} 주소로 곧 회신드리겠습니다.',
      mail_title: '한 단계 남았습니다', mail_body: '문의 내용이 채워진 메일 창을 열었습니다. 보내기를 눌러 주세요. 창이 열리지 않았다면 아래 내용을 복사해 {m} 주소로 보내 주세요.',
      copy: '내용 복사', copied: '복사됨', err: '전송에 실패했습니다. {m} 주소로 메일 주세요.', req: '이름, 회사명, 올바른 이메일을 입력하고 동의란에 체크해 주세요.',
      desk: '문의 데스크', close: '닫기', tagline: 'Premium Seafood from Korea', prev: '이전 벽', next: '다음 벽'
    }
  };
  function h(tag, attrs, kids) {
    var e = document.createElement(tag), k;
    for (k in attrs || {}) { if (k === 'text') e.textContent = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function getJSON(u, ms) { var o = {}; if (ms && window.AbortController) { var c = new AbortController(); o.signal = c.signal; setTimeout(function () { c.abort(); }, ms); } return fetch(u, o).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }

  function mount(host, opts) {
    opts = opts || {};
    var base = opts.base || (SELF && SELF.src ? SELF.src.replace(/[^/]*$/, '') : './');
    var email = opts.email || 'info@pinklagoonkorea.com';
    var S = { lang: opts.lang === 'ko' ? 'ko' : 'en', country: null, cart: [], wall: 1, view: host.clientWidth && host.clientWidth < 700 ? 'list' : 'booth', data: null, elig: {} };
    if (!document.getElementById('plb-fonts')) {                       // 글꼴은 Shadow DOM 밖(문서)에 등록해야 적용된다
      var fs = document.createElement('style'); fs.id = 'plb-fonts';
      fs.textContent = [300, 400, 500, 600, 700].map(function (w) { return "@font-face{font-family:'PLB Poppins';font-weight:" + w + ";font-display:swap;src:url('" + base + "assets/fonts/poppins-latin-" + w + "-normal.woff2') format('woff2')}"; }).join('');
      document.head.appendChild(fs);
    }
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    root.appendChild(h('link', { rel: 'stylesheet', href: base + 'booth.css' }));
    var app = h('div', { class: 'plb', lang: S.lang }); root.appendChild(app);
    var t = function (k, v) { var s = T[S.lang][k] || T.en[k] || k; for (var x in v || {}) s = s.replace('{' + x + '}', v[x]); return s; };
    var L = function (o, k) { return o[(k ? k + '_' : '') + S.lang] || o[(k ? k + '_' : '') + 'en'] || ''; };
    var photo = function (id) { return (opts.photos && opts.photos[id]) || ((remote && S.remoteOk !== false) ? remote : base) + 'assets/products/' + id + '.jpg'; };   // 사진·데이터는 붙이는 쪽에서 덮어쓸 수 있다
    var cName = function () { return S.country ? L(S.country) : ''; };
    function verdict(pid) { var m = S.country && S.country.market && S.elig.markets && S.elig.markets[S.country.market]; var c = m && m[pid]; return c && /^(ok|cond|check|no)$/.test(c.v) ? c : { v: 'check' }; }

    // 바깥 주소(remote)가 있으면 거기서 먼저 읽고, 실패하면 이 폴더에 든 것을 쓴다.
    var remote = opts.remote ? String(opts.remote).replace(/\/?$/, '/') : '';
    var load = function (name, over) { var local = base + 'data/' + name; var first = over || (remote ? remote + 'data/' + name : local); return first === local ? getJSON(local) : getJSON(first, 6000).catch(function () { S.remoteOk = false; return getJSON(local); }); };
    Promise.all([load('products.json', opts.productsUrl), load('eligibility.json', opts.eligibilityUrl).catch(function () { return { markets: {} }; })]).then(function (r) {
      S.data = r[0]; S.elig = r[1];
      try { var c = sessionStorage.getItem('plb-country'); if (c) S.country = S.data.countries.filter(function (x) { return x.code === c; })[0] || null; } catch (e) {}
      render();
    }).catch(function (e) { app.textContent = 'Booth failed to load: ' + e.message; });

    /* ───────── 그리기 ───────── */
    var world, worldBg, yaw = 0, pitch = 0, drag = null, dx = 0, dy = 0, px = 0, py = 0, raf = 0, moved = false;
    var WALLS = ['left', 'back', 'right'], YAW = { left: -62, back: 0, right: 62 };
    function render() {
      app.innerHTML = ''; app.lang = S.lang;
      app.appendChild(topbar());
      var stage = h('div', { class: 'stage' }); app.appendChild(stage);
      if (S.view === 'booth') stage.appendChild(scene()); else stage.appendChild(listView());
      if (S.view === 'booth') {
        stage.appendChild(h('button', { class: 'nav prev', 'aria-label': t('prev'), onclick: function () { turn(-1); } }, ['‹']));
        stage.appendChild(h('button', { class: 'nav next', 'aria-label': t('next'), onclick: function () { turn(1); } }, ['›']));
        stage.appendChild(h('div', { class: 'dots' }, WALLS.map(function (w, i) { return h('button', { class: 'dot' + (i === S.wall ? ' on' : ''), 'aria-label': zoneOf(w), onclick: function () { S.wall = i; aim(); syncDots(); } }, [h('span', { text: zoneOf(w) })]); })));
        stage.appendChild(h('div', { class: 'hint', text: t('hint') }));
      }
      if (!S.country) app.appendChild(gate());
      fit(); aim(true);
    }
    function zoneOf(w) { var z = S.data.zones.filter(function (z) { return z.wall === w; })[0]; return z ? L(z) : ''; }
    function syncDots() { [].forEach.call(app.querySelectorAll('.dot'), function (d, i) { d.classList.toggle('on', i === S.wall); }); }
    function turn(d) { S.wall = Math.max(0, Math.min(2, S.wall + d)); aim(); syncDots(); }

    function topbar() {
      var n = S.cart.length;
      return h('div', { class: 'top' }, [
        h('div', { class: 'brand' }, [h('img', { src: base + 'assets/logo-mark.png', alt: '' }), h('div', {}, [h('b', { text: 'PINK LAGOON' }), h('small', { text: 'Global · International' })])]),
        h('div', { class: 'tools' }, [
          S.country ? h('button', { class: 'chip', onclick: function () { S.country = null; render(); } }, [h('small', { text: t('importing') }), h('b', { text: cName() }), h('i', { text: t('change') })]) : null,
          h('button', { class: 'ghost', onclick: function () { S.view = S.view === 'booth' ? 'list' : 'booth'; render(); }, text: S.view === 'booth' ? t('list') : t('booth') }),
          h('button', { class: 'ghost lang', onclick: function () { S.lang = S.lang === 'en' ? 'ko' : 'en'; render(); }, text: S.lang === 'en' ? '한국어' : 'English' }),
          h('button', { class: 'cta', onclick: openForm, text: n ? t('inquiry_n', { n: n }) : t('inquiry') })
        ])
      ]);
    }

    function card(p) {
      var v = verdict(p.id), inCart = S.cart.indexOf(p.id) >= 0;
      var pic = (p.photo || (opts.photos && opts.photos[p.id])) ? h('img', { src: photo(p.id), alt: L(p), loading: 'lazy', draggable: 'false' })
        : h('div', { class: 'noimg' }, [h('b', { text: L(p) }), h('small', { text: t('photo_soon') })]);
      return h('button', { class: 'card' + (inCart ? ' in' : ''), 'data-id': p.id, onclick: function () { if (!moved) openProduct(p); } }, [
        h('span', { class: 'pic' }, [pic, p.brand === 'stellamaris' ? h('img', { class: 'sm', src: base + 'assets/stellamaris-logo.png', alt: 'Stella Maris' }) : null, p.sourcing ? h('em', { text: t('sourcing') }) : null]),
        h('span', { class: 'cap' }, [h('b', { text: L(p) }), S.country ? h('i', { class: 'v ' + v.v, text: t('v_' + v.v) }) : null])
      ]);
    }
    function wall(name) {
      var z = S.data.zones.filter(function (z) { return z.wall === name; })[0], ps = S.data.products.filter(function (p) { return z && p.zone === z.id; });
      var cols = Math.max(2, Math.ceil(ps.length / 2));
      return h('div', { class: 'wall ' + name }, [
        h('div', { class: 'zone', text: z ? L(z) : '' }),
        h('div', { class: 'grid', style: '--cols:' + cols }, ps.map(card))
      ]);
    }
    function scene() {
      world = h('div', { class: 'world' }, [
        wall('back'), wall('left'), wall('right'),
        h('div', { class: 'sign' }, [h('img', { src: base + 'assets/logo-mark.png', alt: '' }), h('div', {}, [h('b', { text: 'PINK LAGOON' }), h('span', { text: t('tagline') })])]),
        h('button', { class: 'desk', onclick: function () { if (!moved) openForm(); } }, [h('b', { text: t('desk') }), h('span', { text: email })])
      ]);
      worldBg = h('div', { class: 'world' }, [h('div', { class: 'floor' }), h('div', { class: 'ceil' })]);   // 바닥·천장은 따로 둔다(벽과 한 공간에 두면 크롬이 잘못 가린다)
      var sc = h('div', { class: 'scene' }, [h('div', { class: 'cam' }, [worldBg, world])]);
      sc.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; moved = false; });
      sc.addEventListener('pointermove', function (e) {
        var r = sc.getBoundingClientRect(); px = (e.clientX - r.left) / r.width - .5; py = (e.clientY - r.top) / r.height - .5;
        if (drag) { dx = (e.clientX - drag.x) * .18; dy = (e.clientY - drag.y) * .05; if (Math.abs(e.clientX - drag.x) > 6) moved = true; }
        aim();
      });
      var up = function () {
        if (drag && Math.abs(dx) > 14) { S.wall = Math.max(0, Math.min(2, S.wall + (dx > 0 ? -1 : 1))); syncDots(); }
        drag = null; dx = dy = 0; aim(); setTimeout(function () { moved = false; }, 0);
      };
      sc.addEventListener('pointerup', up); sc.addEventListener('pointerleave', function () { px = py = 0; if (drag) up(); else aim(); });
      return sc;
    }
    function aim(now) {
      if (!world) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        yaw = YAW[WALLS[S.wall]] + dx + px * 9; pitch = -py * 5 - dy;
        var tf = 'translateZ(' + (S.wall === 1 ? -80 : 120) + 'px) rotateX(' + pitch.toFixed(2) + 'deg) rotateY(' + yaw.toFixed(2) + 'deg)';
        [world, worldBg].forEach(function (w) { w.style.transition = now || drag ? 'none' : ''; w.style.transform = tf; });
        world.setAttribute('data-wall', WALLS[S.wall]);
      });
    }
    function fit() {
      var st = app.querySelector('.stage'), cam = app.querySelector('.cam'); if (!st || !cam) return;
      var w = st.clientWidth, hh = st.clientHeight; cam.style.transform = 'scale(' + Math.min(w / 1280, hh / 720).toFixed(4) + ')';
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(host); else window.addEventListener('resize', fit);

    function listView() {
      return h('div', { class: 'list' }, S.data.zones.map(function (z) {
        return h('section', {}, [h('h3', { text: L(z) }), h('div', { class: 'lgrid' }, S.data.products.filter(function (p) { return p.zone === z.id; }).map(card))]);
      }));
    }

    /* ───────── 국가 선택 ───────── */
    function gate() {
      var sel = h('select', { 'aria-label': t('gate_pick') }, [h('option', { value: '', text: t('gate_pick') })].concat(S.data.countries.map(function (c) { return h('option', { value: c.code, text: L(c) }); })));
      var go = h('button', { class: 'cta big', disabled: 'disabled', text: t('gate_go'), onclick: function () {
        S.country = S.data.countries.filter(function (c) { return c.code === sel.value; })[0]; try { sessionStorage.setItem('plb-country', S.country.code); } catch (e) {} render();
      } });
      sel.addEventListener('change', function () { if (sel.value) go.removeAttribute('disabled'); else go.setAttribute('disabled', 'disabled'); });
      return h('div', { class: 'veil gate' }, [h('div', { class: 'panel' }, [
        h('img', { class: 'glogo', src: base + 'assets/logo-mark.png', alt: 'Pink Lagoon' }), h('h2', { text: t('gate_title') }), h('p', { text: t('gate_sub') }), sel, go, h('small', { text: t('disclaimer') })
      ])]);
    }

    /* ───────── 제품 상세 ───────── */
    function closeVeil() { var v = app.querySelector('.veil:not(.gate)'); if (v) v.remove(); }
    function veil(panel, cls) {
      closeVeil();
      var v = h('div', { class: 'veil ' + (cls || ''), onclick: function (e) { if (e.target === v) closeVeil(); } }, [panel]);
      panel.insertBefore(h('button', { class: 'x', 'aria-label': t('close'), onclick: closeVeil, text: '×' }), panel.firstChild);
      app.appendChild(v); var f = panel.querySelector('button.cta, input'); if (f) f.focus({ preventScroll: true });
    }
    function openProduct(p) {
      var v = verdict(p.id), cell = v, note = cell['note_' + S.lang] || cell.note_en;
      var btn = h('button', { class: 'cta', onclick: function () {
        var i = S.cart.indexOf(p.id); if (i >= 0) S.cart.splice(i, 1); else S.cart.push(p.id);
        var keep = S.wall; closeVeil(); render(); S.wall = keep; aim(true); syncDots();
      }, text: S.cart.indexOf(p.id) >= 0 ? t('remove') : t('add') });
      veil(h('div', { class: 'panel prod' }, [
        (p.photo || (opts.photos && opts.photos[p.id])) ? h('img', { class: 'hero', src: photo(p.id), alt: L(p) }) : h('div', { class: 'hero noimg' }, [h('small', { text: t('photo_soon') })]),
        h('div', { class: 'body' }, [
          h('h2', { text: L(p) }), h('p', { text: L(p, 'desc') }),
          h('dl', {}, [h('dt', { text: t('origin') }), h('dd', { text: L(p, 'origin') }), h('dt', { text: t('latin') }), h('dd', {}, [h('i', { text: p.latin })])]),
          S.country ? h('div', { class: 'pcheck ' + v.v }, [h('b', { text: cName() + ' — ' + t('v_' + v.v) }), h('p', { text: t('m_' + v.v, { c: cName() }) }), note ? h('p', { class: 'note', text: note }) : null, h('small', { text: t('disclaimer') })]) : null,
          h('div', { class: 'row' }, [btn, h('button', { class: 'ghost', onclick: function () { if (S.cart.indexOf(p.id) < 0) S.cart.push(p.id); openForm(); }, text: t('inquiry') })])
        ])
      ]), 'side');
    }

    /* ───────── 문의 양식 ───────── */
    function openForm() {
      var chips = h('div', { class: 'chips' }, S.cart.length ? S.cart.map(function (id) {
        var p = S.data.products.filter(function (x) { return x.id === id; })[0];
        return h('span', {}, [L(p), h('button', { 'aria-label': t('remove'), onclick: function () { S.cart.splice(S.cart.indexOf(id), 1); openForm(); }, text: '×' })]);
      }) : [h('small', { text: t('f_none') })]);
      var f = {}, fld = function (k, type, req) { f[k] = h(type === 'area' ? 'textarea' : 'input', { type: type === 'area' ? null : type, name: k, required: req ? 'required' : null, rows: type === 'area' ? 4 : null, autocomplete: { name: 'name', company: 'organization', email: 'email', phone: 'tel' }[k] || 'off' }); return h('label', {}, [h('span', { text: t('f_' + k) + (req ? ' *' : '') }), f[k]]); };
      var hp = h('input', { class: 'hp', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
      var ok = h('input', { type: 'checkbox' }), msg = h('p', { class: 'msg', role: 'status' }), send = h('button', { class: 'cta big', type: 'submit', text: t('send') });
      var form = h('form', { class: 'panel form', novalidate: 'novalidate', onsubmit: function (e) {
        e.preventDefault();
        if (hp.value) return;
        if (!f.name.value.trim() || !f.company.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim()) || !ok.checked) { msg.textContent = t('req'); msg.className = 'msg bad'; return; }
        var payload = {
          source: 'virtual-booth', sent_at: new Date().toISOString(), lang: S.lang, page: location.href,
          name: f.name.value.trim(), company: f.company.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
          import_country: S.country ? S.country.en : '', import_country_code: S.country ? S.country.code : '',
          products: S.cart.map(function (id) { var p = S.data.products.filter(function (x) { return x.id === id; })[0]; return { id: id, name: p.en, preliminary_check: verdict(id).v }; }),
          message: f.msg.value.trim()
        };
        if (opts.endpoint) {
          send.disabled = true; send.textContent = t('sending');
          fetch(opts.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(function (r) { if (!r.ok) throw new Error(r.status); done('sent', payload); })
            .catch(function () { send.disabled = false; send.textContent = t('send'); msg.textContent = t('err', { m: email }); msg.className = 'msg bad'; });
        } else { done('mail', payload); }
      } }, [
        h('h2', { text: t('form_title') }), h('p', { text: t('form_sub') }),
        h('label', {}, [h('span', { text: t('f_products') }), chips]),
        h('div', { class: 'two' }, [fld('name', 'text', 1), fld('company', 'text', 1)]), h('div', { class: 'two' }, [fld('email', 'email', 1), fld('phone', 'tel')]),
        h('label', {}, [h('span', { text: t('f_country') }), h('input', { value: cName(), readonly: 'readonly' })]),
        fld('msg', 'area'), hp, h('label', { class: 'ck' }, [ok, h('span', { text: t('f_consent') })]), msg, send
      ]);
      veil(form);
    }
    function mailText(p) {
      return ['[Virtual Booth Inquiry]', 'Name: ' + p.name, 'Company: ' + p.company, 'Email: ' + p.email, 'Phone: ' + (p.phone || '-'), 'Import country: ' + (p.import_country || '-'),
        'Products:', p.products.length ? p.products.map(function (x) { return ' - ' + x.name + ' (preliminary check: ' + x.preliminary_check + ')'; }).join('\n') : ' - (general inquiry)', '', 'Message:', p.message || '-'].join('\n');
    }
    function done(kind, p) {
      host.dispatchEvent(new CustomEvent('plbooth:inquiry', { detail: p, bubbles: true }));
      var kids = [h('h2', { text: t(kind === 'sent' ? 'sent_title' : 'mail_title') }), h('p', { text: t(kind === 'sent' ? 'sent_body' : 'mail_body', { e: p.email, m: email }) })];
      if (kind === 'mail') {
        var body = mailText(p), ta = h('textarea', { readonly: 'readonly', rows: 9 }); ta.value = body;
        var cp = h('button', { class: 'ghost', text: t('copy'), onclick: function () { ta.select(); try { (navigator.clipboard ? navigator.clipboard.writeText(body) : Promise.reject()).catch(function () { document.execCommand('copy'); }); } catch (e) { document.execCommand('copy'); } cp.textContent = t('copied'); } });
        kids.push(ta, h('div', { class: 'row' }, [cp, h('a', { class: 'cta', href: 'mailto:' + email + '?subject=' + encodeURIComponent('Virtual Booth Inquiry — ' + p.company) + '&body=' + encodeURIComponent(body), text: email })]));
        if (!opts.noAutoMail) location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Virtual Booth Inquiry — ' + p.company) + '&body=' + encodeURIComponent(body);
      } else { S.cart = []; }
      veil(h('div', { class: 'panel done' }, kids));
    }
    return { state: S, render: render };
  }

  window.PinkLagoonBooth = { mount: mount };
  if (SELF && SELF.dataset && SELF.dataset.mount !== 'manual') {
    var go = function () {
      var el = document.querySelector(SELF.dataset.target || '#pink-lagoon-booth'); if (!el) { el = document.createElement('div'); el.id = 'pink-lagoon-booth'; SELF.parentNode.insertBefore(el, SELF); }
      mount(el, { base: SELF.dataset.base, endpoint: SELF.dataset.endpoint, email: SELF.dataset.email, lang: SELF.dataset.lang, noAutoMail: SELF.dataset.noAutoMail === 'true' });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})();
