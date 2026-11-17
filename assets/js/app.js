/* =========================================================
   通信原理 · 学习台  —  应用逻辑
   路由 / 笔记 / 公式 / 实验室 / 题库 / 错题本 / 搜索 / 进度
   ========================================================= */
(function () {
  'use strict';

  const NOTES = window.NOTES || [];
  const CHAPTERS = window.CHAPTERS || [];
  const GROUPS = window.FORMULA_GROUPS || [];
  const BANK = window.QUIZ_BANK || [];
  const LABS = window.LABS || [];
  const MD = window.MD;

  const CH = {};
  CHAPTERS.forEach(c => { CH[c.id] = c; });
  const NOTE_BY_SLUG = {};
  NOTES.forEach(n => { NOTE_BY_SLUG[n.slug] = n; });
  const QUIZ_BY_ID = {};
  BANK.forEach(q => { QUIZ_BY_ID[q.id] = q; });

  const NOTES_BY_CH = {};
  NOTES.forEach(n => { (NOTES_BY_CH[n.chapter] = NOTES_BY_CH[n.chapter] || []).push(n); });
  const QUIZ_BY_CH = {};
  BANK.forEach(q => { (QUIZ_BY_CH[q.chapter] = QUIZ_BY_CH[q.chapter] || []).push(q); });

  const FORMULA_COUNT = GROUPS.reduce((s, g) => s + g.items.length, 0);

  /* ---------------- 本地存储 ---------------- */
  const KEY = 'comm.';
  function load(name, fallback) {
    try {
      const raw = localStorage.getItem(KEY + name);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(name, val) {
    try { localStorage.setItem(KEY + name, JSON.stringify(val)); } catch (e) { /* 忽略配额错误 */ }
  }

  let readMap = load('read', {});          // slug -> 时间戳
  let mistakes = load('mistakes', {});     // qid -> {n, ts}
  let attempts = load('attempts', []);     // [{id, ok, ts, ch}]
  let activity = load('activity', {});     // 'YYYY-MM-DD' -> 次数
  let theme = load('theme', 'auto');

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function bumpActivity() {
    const k = todayKey();
    activity[k] = (activity[k] || 0) + 1;
    save('activity', activity);
  }
  function markRead(slug, on) {
    if (on) readMap[slug] = Date.now();
    else delete readMap[slug];
    save('read', readMap);
    updateSidebar();
  }
  function isRead(slug) { return !!readMap[slug]; }

  function recordAnswer(q, ok) {
    attempts.push({ id: q.id, ok: ok ? 1 : 0, ts: Date.now(), ch: q.chapter });
    if (attempts.length > 800) attempts = attempts.slice(-800);
    save('attempts', attempts);

    if (ok) {
      if (mistakes[q.id]) { delete mistakes[q.id]; save('mistakes', mistakes); }
    } else {
      const m = mistakes[q.id] || { n: 0, ts: 0 };
      m.n += 1; m.ts = Date.now();
      mistakes[q.id] = m;
      save('mistakes', mistakes);
    }
    bumpActivity();
    updateSidebar();
  }

  /* ---------------- 主题 ---------------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    save('theme', theme);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.title = theme === 'auto' ? '主题：跟随系统' : theme === 'dark' ? '主题：深色' : '主题：浅色';
    setTimeout(redrawLabs, 30);
  }
  function cycleTheme() {
    theme = theme === 'auto' ? 'light' : theme === 'light' ? 'dark' : 'auto';
    applyTheme();
    toast(theme === 'auto' ? '已切换：跟随系统' : theme === 'dark' ? '已切换：深色' : '已切换：浅色');
  }

  /* ---------------- 小工具 ---------------- */
  const $ = sel => document.querySelector(sel);
  const view = () => document.getElementById('view');

  function esc(s) { return MD.escape(s); }
  function escAttr(s) {
    return MD.escape(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  function chapterName(id) { return (CH[id] && CH[id].name) || '其他'; }
  function chapterNum(id) { return (CH[id] && CH[id].num) || 0; }

  function noteListInOrder() {
    // 按章排序；同章内保持数据文件里的编写顺序（数组排序是稳定的）
    return NOTES.slice().sort((a, b) => chapterNum(a.chapter) - chapterNum(b.chapter));
  }
  const ORDERED = noteListInOrder();

  function percent(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function quizStats() {
    const total = attempts.length;
    const ok = attempts.filter(a => a.ok).length;
    return { total, ok, rate: total ? Math.round((ok / total) * 100) : 0 };
  }

  function refreshData() {
    readMap = load('read', {});
    mistakes = load('mistakes', {});
    attempts = load('attempts', []);
    activity = load('activity', {});
  }

  /* ---------------- 侧栏 ---------------- */
  function updateSidebar() {
    const readCount = Object.keys(readMap).filter(s => NOTE_BY_SLUG[s]).length;
    const pct = percent(readCount, NOTES.length);

    const setCount = (id, n) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = n > 0 ? String(n) : '';
      el.dataset.zero = n > 0 ? '0' : '1';
    };
    setCount('navNoteCount', NOTES.length);
    setCount('navFormulaCount', FORMULA_COUNT);
    setCount('navLabCount', LABS.length);
    setCount('navQuizCount', BANK.length);
    setCount('navMistakeCount', Object.keys(mistakes).length);

    const bar = document.getElementById('sideProgressBar');
    const txt = document.getElementById('sideProgressPct');
    const note = document.getElementById('sideProgressNote');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = pct + '%';
    if (note) {
      if (readCount === 0) note.textContent = '从第一节笔记开始吧';
      else if (readCount >= NOTES.length) note.textContent = '笔记已全部读完，去刷题库';
      else note.textContent = '已读 ' + readCount + ' / ' + NOTES.length + ' 篇 · 继续下一节';
    }
  }

  function setActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active', a.dataset.route === route);
    });
  }

  /* ---------------- 路由 ---------------- */
  function parseHash() {
    let raw = location.hash.replace(/^#/, '');
    if (!raw || raw === '/') raw = '/home';
    const qi = raw.indexOf('?');
    const path = qi >= 0 ? raw.slice(0, qi) : raw;
    const query = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(pair => {
        if (!pair) return;
        const [k, v] = pair.split('=');
        query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }
    return { path, parts: path.split('/').filter(Boolean), query };
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  const ROUTES = {
    home: { nav: 'home' },
    notes: { nav: 'notes' },
    cheatsheet: { nav: 'cheatsheet' },
    labs: { nav: 'labs' },
    quiz: { nav: 'quiz' },
    mistakes: { nav: 'mistakes' },
    progress: { nav: 'progress' },
  };

  function render() {
    const { path, parts, query } = parseHash();
    const root = parts[0] || 'home';
    document.onkeydown = null;
    setActiveNav((ROUTES[root] && ROUTES[root].nav) || root);
    closeSidebar();

    window.scrollTo(0, 0);

    if (root === 'home') viewHome(query);
    else if (root === 'notes') {
      if (parts[1]) viewNote(parts[1]);
      else viewNotesList(query);
    } else if (root === 'cheatsheet') viewCheatsheet(query);
    else if (root === 'labs') {
      if (parts[1]) viewLab(parts[1]);
      else viewLabs();
    } else if (root === 'quiz') {
      if (parts[1] === 'run') viewQuizRun();
      else if (parts[1] === 'result') viewQuizResult();
      else viewQuizSetup(query);
    } else if (root === 'mistakes') viewMistakes();
    else if (root === 'progress') viewProgress();
    else viewHome(query);

    updateSidebar();
    redrawLabs();
  }

  /* ---------------- 首页 ---------------- */
  function viewHome() {
    const readCount = Object.keys(readMap).filter(s => NOTE_BY_SLUG[s]).length;
    const st = quizStats();
    const wrong = Object.keys(mistakes).length;

    let next = ORDERED.find(n => !isRead(n.slug)) || ORDERED[0];

    const cards = CHAPTERS.map(c => {
      const list = NOTES_BY_CH[c.id] || [];
      const done = list.filter(n => isRead(n.slug)).length;
      const pct = percent(done, list.length);
      return '<a class="chapter-card" href="#/notes?ch=' + c.id + '">' +
        '<div class="cc-top"><span class="cc-num">' + String(c.num).padStart(2, '0') + '</span>' +
        '<span class="cc-name">' + esc(c.name) + '</span></div>' +
        '<p class="cc-desc">' + esc(c.desc) + '</p>' +
        '<div class="cc-foot"><span>' + list.length + ' 篇</span><span class="cc-mini"><i style="width:' + pct + '%"></i></span><span>' + pct + '%</span></div>' +
        '</a>';
    }).join('');

    view().innerHTML = '<div class="page">' +
      '<section class="hero">' +
        '<p class="eyebrow">Principles of Communications</p>' +
        '<h1>把通信原理学成<em>一条完整链路</em></h1>' +
        '<p>从信号与随机过程到同步，十三章一条链路。</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn--primary" href="#/notes/' + next.slug + '">' +
            '<svg viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7"/></svg>' +
            (readCount ? '继续：' + esc(next.title) : '从第一篇开始') +
          '</a>' +
          '<a class="btn" href="#/quiz">去刷题</a>' +
          '<a class="btn btn--ghost" href="#/cheatsheet">公式速查</a>' +
        '</div>' +
      '</section>' +

      '<div class="stat-row">' +
        '<div class="stat"><div class="stat-k">笔记进度</div><div class="stat-v">' + readCount + '<small> / ' + NOTES.length + ' 篇</small></div></div>' +
        '<div class="stat"><div class="stat-k">做过题数</div><div class="stat-v">' + st.total + '<small> 次作答</small></div></div>' +
        '<div class="stat"><div class="stat-k">正确率</div><div class="stat-v">' + st.rate + '<small> %</small></div></div>' +
        '<div class="stat"><div class="stat-k">错题待清</div><div class="stat-v">' + wrong + '<small> 道</small></div></div>' +
      '</div>' +

      '<div class="section-head"><h2>十三章主线</h2></div>' +
      '<div class="card-grid">' + cards + '</div>' +
    '</div>';
  }

  /* ---------------- 笔记列表 ---------------- */
  function viewNotesList(query) {
    const chFilter = query.ch || 'all';
    const kw = (query.q || '').trim().toLowerCase();

    const blocks = CHAPTERS.map(c => {
      const list = (NOTES_BY_CH[c.id] || []).filter(n => {
        if (chFilter !== 'all' && c.id !== chFilter) return false;
        if (!kw) return true;
        return (n.title + n.summary + n.tags.join(' ') + n.body).toLowerCase().indexOf(kw) > -1;
      });
      if (!list.length) return '';
      const done = list.filter(n => isRead(n.slug)).length;
      const rows = list.map(n => {
        const badges = ['<span class="badge">' + esc(n.level) + '</span>',
          '<span class="badge">' + n.minutes + ' 分钟</span>'];
        n.tags.slice(0, 2).forEach(t => badges.push('<span class="badge">' + esc(t) + '</span>'));
        return '<a class="note-row' + (isRead(n.slug) ? ' read' : '') + '" href="#/notes/' + n.slug + '">' +
          '<span class="nr-dot"></span>' +
          '<span class="nr-body"><span class="nr-title">' + esc(n.title) + '</span>' +
          '<div class="nr-sum">' + esc(n.summary) + '</div>' +
          '<div class="nr-meta">' + badges.join('') + '</div></span></a>';
      }).join('');
      return '<div class="chapter-block"><div class="chapter-block-head">' +
        '<h3>' + String(c.num).padStart(2, '0') + ' · ' + esc(c.name) + '</h3>' +
        '<span class="badge badge--primary">' + done + '/' + list.length + ' 已读</span>' +
        '</div>' + rows + '</div>';
    }).filter(Boolean).join('');

    const options = ['<option value="all">全部章节</option>'].concat(
      CHAPTERS.map(c => '<option value="' + c.id + '"' + (chFilter === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>')
    ).join('');

    const readCount = Object.keys(readMap).filter(s => NOTE_BY_SLUG[s]).length;

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Notes · ' + NOTES.length + ' 篇</p>' +
        '<h1 class="page-title">章节笔记</h1>' +
      '</header>' +
      '<div class="filter-bar">' +
        '<select id="chFilter">' + options + '</select>' +
        '<input type="search" id="noteSearch" placeholder="在标题、摘要、正文里搜…" value="' + esc(query.q || '') + '">' +
        '<span class="cnt">' + NOTES.length + ' 篇</span>' +
      '</div>' +
      (blocks || '<div class="empty"><b>没有匹配的笔记</b>换个关键词或清空筛选试试。</div>') +
      '</div>';

    const sel = document.getElementById('chFilter');
    if (sel) sel.addEventListener('change', function () {
      go('#/notes?ch=' + this.value);
    });
    const inp = document.getElementById('noteSearch');
    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const v = this.value.trim();
          go('#/notes?ch=' + (chFilter === 'all' ? '' : chFilter) + (v ? '&q=' + encodeURIComponent(v) : ''));
        }
      });
    }
  }

  /* ---------------- 笔记详情 ---------------- */
  function viewNote(slug) {
    const n = NOTE_BY_SLUG[slug];
    if (!n) { viewNotFound('笔记不存在'); return; }

    // 自动标记已读
    if (!isRead(slug)) markRead(slug, true);

    const idx = ORDERED.findIndex(x => x.slug === slug);
    const prev = idx > 0 ? ORDERED[idx - 1] : null;
    const next = idx < ORDERED.length - 1 ? ORDERED[idx + 1] : null;

    const related = (QUIZ_BY_CH[n.chapter] || []).slice(0, 3);

    view().innerHTML = '<div class="page">' +
      '<header class="note-head">' +
        '<div class="crumb"><a href="#/notes">章节笔记</a><span>/</span>' +
          '<a href="#/notes?ch=' + n.chapter + '">' + esc(chapterName(n.chapter)) + '</a>' +
          '<span>/</span><span>' + esc(n.title) + '</span></div>' +
        '<h1>' + esc(n.title) + '</h1>' +
        '<div class="note-meta">' +
          '<span class="badge badge--primary">第 ' + chapterNum(n.chapter) + ' 章</span>' +
          '<span class="badge">' + esc(n.level) + '</span>' +
          '<span class="badge">' + n.minutes + ' 分钟</span>' +
          n.tags.map(t => '<span class="badge">' + esc(t) + '</span>').join('') +
        '</div>' +
      '</header>' +
      '<article class="prose" id="noteBody">' + MD.render(n.body) + '</article>' +

      (related.length ? '<div class="section-head"><h2>本章练习</h2></div>' +
        '<div class="list-stack">' + related.map(q => relatedQuizRow(q)).join('') + '</div>' : '') +

      '<div class="note-foot">' +
        '<button class="btn btn--sm" id="toggleRead">' + (isRead(slug) ? '✓ 已读（点击取消）' : '标记为已读') + '</button>' +
        '<a class="btn btn--sm" href="#/quiz?ch=' + n.chapter + '">刷本章题</a>' +
        '<a class="btn btn--sm btn--ghost" href="#/cheatsheet">公式速查</a>' +
        '<span style="flex:1"></span>' +
        (prev ? '<a class="btn btn--sm btn--ghost" href="#/notes/' + prev.slug + '">← 上一篇</a>' : '') +
        (next ? '<a class="btn btn--sm btn--ghost" href="#/notes/' + next.slug + '">下一篇 →</a>' : '') +
      '</div>' +

      '<div class="note-nav">' +
        (prev ? '<a href="#/notes/' + prev.slug + '"><div class="nn-k">上一篇</div><div class="nn-t">' + esc(prev.title) + '</div></a>' : '<span class="nn-placeholder"></span>') +
        (next ? '<a class="nn-next" href="#/notes/' + next.slug + '"><div class="nn-k">下一篇</div><div class="nn-t">' + esc(next.title) + '</div></a>' : '<span></span>') +
      '</div>' +
      '</div>';

    const btn = document.getElementById('toggleRead');
    if (btn) btn.addEventListener('click', function () {
      markRead(slug, !isRead(slug));
      render();
    });
  }

  function relatedQuizRow(q) {
    return '<a class="note-row" href="#/quiz/run?q=' + q.id + '">' +
      '<span class="nr-dot"></span><span class="nr-body">' +
      '<span class="nr-title">' + MD.renderInline(q.question) + '</span>' +
      '<div class="nr-meta"><span class="badge">' + esc(q.difficulty) + '</span>' +
      '<span class="badge">' + esc(chapterName(q.chapter)) + '</span></div></span></a>';
  }

  function viewNotFound(msg) {
    view().innerHTML = '<div class="page"><div class="empty"><b>' + esc(msg) + '</b>' +
      '<a href="#/notes">返回笔记列表</a></div></div>';
  }

  /* ---------------- 公式速查 ---------------- */
  function viewCheatsheet(query) {
    const kw = (query.q || '').trim();
    let count = 0;

    const groups = GROUPS.map(g => {
      const items = g.items;
      if (!items.length) return '';
      count += items.length;
      return '<section class="fgroup" data-g="' + esc(g.name) + '">' +
        '<h2>' + esc(g.name) + ' <span>' + items.length + ' 条 · 第 ' + chapterNum(g.ch) + ' 章</span></h2>' +
        '<div class="fgrid">' + items.map(it =>
          '<div class="fcard" data-text="' + escAttr((it.name + ' ' + it.note + ' ' + it.tex + ' ' + g.name).toLowerCase()) + '">' +
            '<div class="fcard-name">' + esc(it.name) + '</div>' +
            '<div class="fcard-tex">' + safeTex(it.tex) + '</div>' +
            '<div class="fcard-note">' + MD.renderInline(it.note) + '</div>' +
            '<button class="fcard-copy" data-tex="' + escAttr(it.tex) + '">复制 TeX</button>' +
          '</div>').join('') +
        '</div></section>';
    }).filter(Boolean).join('');

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Cheatsheet · ' + FORMULA_COUNT + ' 条</p>' +
        '<h1 class="page-title">公式速查</h1>' +
      '</header>' +
      '<div class="formula-tools">' +
        '<input type="search" id="fSearch" placeholder="搜公式名或关键词，例如「误码率」「滚降」「汉明」" value="' + esc(query.q || '') + '">' +
        '<button class="btn" id="fClear">清空</button>' +
      '</div>' +
      (groups || '') +
      '<div class="empty" id="fEmpty" style="display:' + (groups ? 'none' : '') + '"><b>没有匹配的公式</b>试试英文缩写（PSK / PCM / CRC）或更短的关键词。</div>' +
      '</div>';

    const inp = document.getElementById('fSearch');
    if (inp) {
      inp.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        let shown = 0;
        document.querySelectorAll('.fgroup').forEach(group => {
          let gShown = 0;
          group.querySelectorAll('.fcard').forEach(card => {
            const text = (card.dataset.text || '').toLowerCase();
            const hit = !q || text.indexOf(q) > -1;
            card.style.display = hit ? '' : 'none';
            if (hit) gShown++;
          });
          group.style.display = gShown ? '' : 'none';
          shown += gShown;
        });
        const empty = document.getElementById('fEmpty');
        if (empty) empty.style.display = shown ? 'none' : '';
      });
      if (kw) inp.dispatchEvent(new Event('input'));
    }
    const clr = document.getElementById('fClear');
    if (clr) clr.addEventListener('click', () => go('#/cheatsheet'));

    document.querySelectorAll('.fcard-copy').forEach(btn => {
      btn.addEventListener('click', function () {
        copyText(this.dataset.tex || '').then(() => toast('TeX 已复制')).catch(() => toast('复制失败，请手动选择'));
      });
    });
  }

  function safeTex(tex) {
    if (!window.katex) return '<code>' + esc(tex) + '</code>';
    try {
      return window.katex.renderToString(tex, { displayMode: true, throwOnError: false, strict: 'ignore', output: 'html' });
    } catch (e) {
      return '<code>' + esc(tex) + '</code>';
    }
  }

  function copyText(s) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = s;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); }
      catch (e) { reject(e); }
      finally { document.body.removeChild(ta); }
    });
  }

  /* ---------------- 实验室列表 ---------------- */
  function viewLabs() {
    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Lab · ' + LABS.length + ' 个实验</p>' +
        '<h1 class="page-title">交互实验室</h1>' +
      '</header>' +
      '<div class="lab-grid">' + LABS.map(l =>
        '<a class="lab-tile" href="#/labs/' + l.id + '">' +
          '<canvas class="mini-canvas" data-preview="' + l.id + '" width="320" height="74"></canvas>' +
          '<h3>' + esc(l.name) + '</h3><p>' + esc(l.short) + '</p>' +
        '</a>').join('') +
      '</div></div>';

    document.querySelectorAll('canvas[data-preview]').forEach(c => drawPreview(c, c.dataset.preview));
  }

  function drawPreview(canvas, id) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 320, h = 74;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const C = { primary: cssVar('--primary', '#0f766e'), accent: cssVar('--accent', '#b45309'), line: cssVar('--line', '#ddd'), ink3: cssVar('--ink-3', '#888') };
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    const rand = (function (seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })(Math.abs(id.length * 977 + 13));

    ctx.strokeStyle = C.primary; ctx.lineWidth = 1.6; ctx.beginPath();
    if (id === 'sampling') {
      for (let x = 0; x <= w; x++) {
        const y = h / 2 - Math.sin((x / w) * Math.PI * 6) * 22;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = C.accent;
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * w, y = h / 2 - Math.sin((i / 10) * Math.PI * 6) * 22;
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    } else if (id === 'am') {
      for (let x = 0; x <= w; x++) {
        const env = 0.55 + 0.45 * Math.cos((x / w) * Math.PI * 4);
        const y = h / 2 - Math.sin((x / w) * Math.PI * 40) * 24 * env;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else if (id === 'eye') {
      const bits = [];
      for (let i = 0; i < 24; i++) bits.push(rand() > 0.5 ? 1 : -1);
      ctx.globalAlpha = 0.35;
      for (let k = 2; k < 22; k++) {
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const t = (i / 40 - 0.5) * 2;
          let v = 0;
          for (let j = -3; j <= 3; j++) {
            const tt = t - j;
            v += bits[k + j] * (Math.abs(tt) < 1e-6 ? 1 : Math.sin(Math.PI * tt) / (Math.PI * tt) * Math.cos(Math.PI * 0.5 * tt) / (1 - Math.pow(tt, 2)));
          }
          const x = (i / 40) * w, y = h / 2 - v * 15;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (id === 'pcm') {
      for (let x = 0; x <= w; x++) {
        const v = Math.sin((x / w) * Math.PI * 4);
        const q = Math.round(v * 5) / 5;
        const y = h / 2 - q * 26;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    } else if (id === 'psk') {
      ctx.fillStyle = C.primary;
      ctx.globalAlpha = 0.35;
      for (let i = 0; i < 80; i++) {
        const p = [[0.32, 0.3], [0.68, 0.3], [0.32, 0.72], [0.68, 0.72]][i % 4];
        ctx.beginPath(); ctx.arc((p[0] + (rand() - 0.5) * 0.09) * w, (p[1] + (rand() - 0.5) * 0.09) * h, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.accent;
      [[0.32, 0.3], [0.68, 0.3], [0.32, 0.72], [0.68, 0.72]].forEach(p => {
        ctx.beginPath(); ctx.arc(p[0] * w, p[1] * h, 3.4, 0, Math.PI * 2); ctx.fill();
      });
    } else {
      ctx.moveTo(0, h - 12);
      ctx.lineTo(w * 0.35, h - 12);
      ctx.lineTo(w * 0.5, 12);
      ctx.lineTo(w * 0.65, h - 12);
      ctx.lineTo(w, h - 12);
      ctx.stroke();
    }
  }

  /* ---------------- 实验室详情 ---------------- */
  let labCtx = null;

  function viewLab(id) {
    const lab = LABS.find(l => l.id === id);
    if (!lab) { viewNotFound('实验不存在'); return; }
    const state = Object.assign({}, lab.defaults);

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<div class="crumb"><a href="#/labs">交互实验室</a><span>/</span><span>' + esc(lab.name) + '</span></div>' +
        '<h1 class="page-title">' + esc(lab.name) + '</h1>' +
        '<p class="page-sub">' + esc(lab.desc) + '</p>' +
      '</header>' +
      '<div class="lab-wrap">' +
        '<div class="lab-canvas-box"><canvas id="labCanvas" width="' + window.LAB_W + '" height="' + window.LAB_H + '"></canvas></div>' +
        '<div class="lab-controls" id="labControls"></div>' +
        '<div class="readouts" id="labReadouts"></div>' +
      '</div>' +
      '<div class="note-foot"><a class="btn btn--sm btn--ghost" href="#/labs">← 返回实验列表</a>' +
        '<a class="btn btn--sm" href="#/quiz">做题巩固</a></div>' +
      '</div>';

    const canvas = document.getElementById('labCanvas');
    const box = canvas.parentElement;
    const ctrls = document.getElementById('labControls');

    lab.controls.forEach(c => {
      const wrap = document.createElement('div');
      wrap.className = 'ctl';
      if (c.type === 'select') {
        wrap.innerHTML = '<div class="ctl-top"><span>' + c.label + '</span></div>' +
          '<select data-key="' + c.key + '">' +
          c.options.map(o => '<option value="' + o + '"' + (state[c.key] === o ? ' selected' : '') + '>' + o + '</option>').join('') +
          '</select>';
      } else {
        wrap.innerHTML = '<div class="ctl-top"><span>' + c.label + '</span><b data-val="' + c.key + '">' + state[c.key] + (c.unit || '') + '</b></div>' +
          '<input type="range" data-key="' + c.key + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + state[c.key] + '">';
      }
      ctrls.appendChild(wrap);
    });

    function updateReadouts() {
      const el = document.getElementById('labReadouts');
      if (lab.readouts) {
        el.innerHTML = lab.readouts(state).map(r =>
          '<div class="readout">' + esc(r.k) + '：<b>' + esc(String(r.v)) + '</b></div>').join('');
      } else el.innerHTML = '';
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = box.clientWidth || window.LAB_W;
      const cssH = cssW * (window.LAB_H / window.LAB_W);
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale((cssW * dpr) / window.LAB_W, (cssW * dpr) / window.LAB_W);
      lab.draw(ctx, state);
    }

    ctrls.querySelectorAll('input[type="range"]').forEach(inp => {
      inp.addEventListener('input', function () {
        state[this.dataset.key] = parseFloat(this.value);
        const val = ctrls.querySelector('[data-val="' + this.dataset.key + '"]');
        const cfg = lab.controls.find(c => c.key === this.dataset.key);
        if (val) val.textContent = this.value + (cfg && cfg.unit ? cfg.unit : '');
        updateReadouts();
        draw();
      });
    });
    ctrls.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', function () {
        state[this.dataset.key] = this.value;
        updateReadouts();
        draw();
      });
    });

    updateReadouts();
    draw();
    labCtx = { canvas, box, lab, state, draw };
  }

  function onResize() {
    if (labCtx && document.body.contains(labCtx.canvas)) labCtx.draw();
  }
  function redrawLabs() {
    if (labCtx && document.body.contains(labCtx.canvas)) labCtx.draw();
    document.querySelectorAll('canvas[data-preview]').forEach(c => drawPreview(c, c.dataset.preview));
  }
  function cssVar(name, fb) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fb;
  }

  /* ---------------- 题库 ---------------- */
  let quiz = null;   // {list:[qid], idx, chosen, answered, okCount, title, chapter}

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz(qids, title) {
    if (!qids.length) { toast('没有可用的题目'); return; }
    quiz = { list: qids, idx: 0, chosen: null, answered: false, ok: 0, title: title };
    go('#/quiz/run');
  }

  function viewQuizSetup(query) {
    const ch = query.ch || '';
    const wrong = Object.keys(mistakes).length;

    const chapterOptions = CHAPTERS.map(c => {
      const n = (QUIZ_BY_CH[c.id] || []).length;
      return '<button class="mode-card" data-mode="chapter" data-ch="' + c.id + '">' +
        '<b>第 ' + c.num + ' 章 · ' + esc(c.name) + '</b>' +
        '<span>' + n + ' 道题</span></button>';
    }).join('');

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Quiz · ' + BANK.length + ' 题</p>' +
        '<h1 class="page-title">题库</h1>' +
      '</header>' +

      '<div class="quiz-setup">' +
        '<button class="mode-card" data-mode="random20"><b>随机 20 题</b></button>' +
        '<button class="mode-card" data-mode="mock"><b>模拟卷 25 题</b></button>' +
        '<button class="mode-card" data-mode="mistakes"><b>错题重做（' + wrong + '）</b></button>' +
        '<button class="mode-card" data-mode="all"><b>全题库顺序刷（' + BANK.length + '）</b></button>' +
      '</div>' +

      '<div class="section-head"><h2>按章练习</h2></div>' +
      '<div class="quiz-setup">' + chapterOptions + '</div>' +
      '</div>';

    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', function () {
        const mode = this.dataset.mode;
        if (mode === 'random20') startQuiz(shuffle(BANK).slice(0, 20).map(q => q.id), '随机 20 题');
        else if (mode === 'mock') {
          // 按章节比例：每章至少 1 题，凑 25
          let pool = [];
          CHAPTERS.forEach(c => {
            const list = shuffle(QUIZ_BY_CH[c.id] || []);
            const take = Math.max(1, Math.round(25 * list.length / BANK.length));
            pool = pool.concat(list.slice(0, take));
          });
          startQuiz(shuffle(pool).slice(0, 25).map(q => q.id), '模拟卷 25 题');
        } else if (mode === 'mistakes') {
          const ids = Object.keys(mistakes).filter(id => QUIZ_BY_ID[id]);
          if (!ids.length) { toast('错题本是空的，先去刷几题'); return; }
          startQuiz(shuffle(ids), '错题重做');
        } else if (mode === 'all') {
          startQuiz(BANK.map(q => q.id), '全题库 ' + BANK.length + ' 题');
        } else if (mode === 'chapter') {
          const c = this.dataset.ch;
          const ids = (QUIZ_BY_CH[c] || []).map(q => q.id);
          startQuiz(shuffle(ids), chapterName(c) + ' · ' + ids.length + ' 题');
        }
      });
    });
  }

  function viewQuizRun() {
    const { query } = parseHash();

    if (query.q) {
      const q = QUIZ_BY_ID[query.q];
      if (!q) { go('#/quiz'); return; }
      if (!quiz || quiz.list.length !== 1 || quiz.list[0] !== query.q) {
        quiz = { list: [q.id], idx: 0, chosen: null, answered: false, ok: 0, title: '单题练习' };
      }
    }

    if (!quiz) { go('#/quiz'); return; }

    const q = QUIZ_BY_ID[quiz.list[quiz.idx]];
    if (!q) { go('#/quiz'); return; }

    const total = quiz.list.length;
    const done = quiz.idx;
    const pct = Math.round(((done + (quiz.answered ? 1 : 0)) / total) * 100);

    const opts = q.options.map((o, i) => {
      let cls = 'opt';
      if (quiz.answered) {
        if (i === q.answer) cls += ' correct';
        else if (i === quiz.chosen) cls += ' wrong';
      } else if (quiz.chosen === i) cls += ' selected';
      return '<button class="' + cls + '" data-opt="' + i + '"' + (quiz.answered ? ' disabled' : '') + '>' +
        '<span class="opt-k">' + 'ABCD'[i] + '</span><span>' + MD.renderInline(o) + '</span></button>';
    }).join('');

    let explain = '';
    if (quiz.answered) {
      const ok = quiz.chosen === q.answer;
      explain = '<div class="explain">' +
        '<div class="explain-head ' + (ok ? 'ok' : 'bad') + '">' +
        (ok ? '✓ 正确' : '✗ 错，正确答案是 ' + 'ABCD'[q.answer]) + '</div>' +
        '<div class="explain-body">' + MD.render(q.explain) + '</div></div>';
    }

    view().innerHTML = '<div class="page">' +
      '<div class="quiz-bar">' +
        '<span>' + esc(quiz.title) + '</span>' +
        '<span>第 <b>' + (quiz.idx + 1) + '</b> / ' + total + ' 题</span>' +
        '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
        '<span>正确 <b>' + quiz.ok + '</b></span>' +
        '<button class="btn btn--sm btn--ghost" id="quitQuiz">退出</button>' +
      '</div>' +
      '<div class="q-card">' +
        '<div class="q-meta">' +
          '<span class="badge badge--primary">第 ' + chapterNum(q.chapter) + ' 章 · ' + esc(chapterName(q.chapter)) + '</span>' +
          '<span class="badge">' + esc(q.difficulty) + '</span>' +
          q.tags.map(t => '<span class="badge">' + esc(t) + '</span>').join('') +
        '</div>' +
        '<div class="q-stem">' + MD.render(q.question) + '</div>' +
        '<div class="q-opts" id="opts">' + opts + '</div>' +
        explain +
        '<div class="q-foot">' +
          (quiz.answered
            ? '<button class="btn btn--primary" id="nextQ">' + (quiz.idx + 1 >= total ? '看结果' : '下一题') + '</button>'
            : '<button class="btn btn--primary" id="submitQ"' + (quiz.chosen === null ? ' disabled style="opacity:.5"' : '') + '>提交答案</button>') +
          '<span class="spacer"></span>' +
        '</div>' +
      '</div>' +
      '</div>';

    const optsWrap = document.getElementById('opts');
    optsWrap.querySelectorAll('.opt').forEach(btn => {
      btn.addEventListener('click', function () {
        if (quiz.answered) return;
        quiz.chosen = parseInt(this.dataset.opt, 10);
        optsWrap.querySelectorAll('.opt').forEach(b => b.classList.toggle('selected', b === this));
        const sb = document.getElementById('submitQ');
        if (sb) { sb.disabled = false; sb.style.opacity = ''; }
      });
    });

    const submit = document.getElementById('submitQ');
    if (submit) submit.addEventListener('click', function () {
      if (quiz.chosen === null) return;
      const ok = quiz.chosen === q.answer;
      quiz.answered = true;
      if (ok) quiz.ok += 1;
      recordAnswer(q, ok);
      render();
      updateSidebar();
    });

    const next = document.getElementById('nextQ');
    if (next) next.addEventListener('click', function () {
      if (quiz.idx + 1 >= total) { go('#/quiz/result'); return; }
      quiz.idx += 1;
      quiz.chosen = null;
      quiz.answered = false;
      render();
    });

    const quit = document.getElementById('quitQuiz');
    if (quit) quit.addEventListener('click', () => { quiz = null; go('#/quiz'); });

    // 键盘：1-4 选项，Enter 提交/下一题
    document.onkeydown = function (e) {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key >= '1' && e.key <= '4' && !quiz.answered) {
        const i = parseInt(e.key, 10) - 1;
        const b = optsWrap.querySelectorAll('.opt')[i];
        if (b) b.click();
      } else if (e.key === 'Enter') {
        if (quiz.answered) { const b = document.getElementById('nextQ'); if (b) b.click(); }
        else { const b = document.getElementById('submitQ'); if (b && !b.disabled) b.click(); }
      }
    };
  }

  function viewQuizResult() {
    if (!quiz) { go('#/quiz'); return; }
    const total = quiz.list.length;
    const pct = Math.round((quiz.ok / total) * 100);

    const wrongList = quiz.list.filter(id => mistakes[id]);

    view().innerHTML = '<div class="page">' +
      '<div class="q-card quiz-done">' +
        '<p class="eyebrow" style="justify-content:center">' + esc(quiz.title) + '</p>' +
        '<div class="score">' + quiz.ok + '<small> / ' + total + '</small></div>' +
        '<h2>正确率 ' + pct + '%</h2>' +
        '<div class="q-foot" style="justify-content:center">' +
          '<button class="btn btn--primary" id="againWrong"' + (wrongList.length ? '' : ' disabled style="opacity:.5"') + '>重做错题（' + wrongList.length + '）</button>' +
          '<a class="btn" href="#/quiz">返回题库</a>' +
          '<a class="btn btn--ghost" href="#/mistakes">打开错题本</a>' +
        '</div>' +
      '</div>' +
      (wrongList.length ? '<div class="section-head"><h2>这组题里的错题</h2></div><div class="list-stack">' +
        wrongList.map(id => mistakeRow(QUIZ_BY_ID[id])).join('') + '</div>' : '') +
      '</div>';

    const again = document.getElementById('againWrong');
    if (again) again.addEventListener('click', function () {
      const ids = quiz.list.filter(id => mistakes[id]);
      if (ids.length) startQuiz(shuffle(ids), '错题重做');
    });
  }

  /* ---------------- 错题本 ---------------- */
  function mistakeRow(q) {
    const m = mistakes[q.id] || { n: 1 };
    return '<div class="mistake">' +
      '<div class="mistake-main">' +
        '<div class="mistake-q">' + MD.renderInline(q.question) + '</div>' +
        '<div class="mistake-meta">' +
          '<span class="badge badge--primary">' + esc(chapterName(q.chapter)) + '</span>' +
          '<span class="badge">' + esc(q.difficulty) + '</span>' +
          '<span class="badge badge--danger">错 ' + m.n + ' 次</span>' +
          '<span>正确答案：' + 'ABCD'[q.answer] + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="mistake-acts">' +
        '<button class="btn btn--sm" data-redo="' + q.id + '">重做</button>' +
        '<button class="btn btn--sm btn--ghost" data-remove="' + q.id + '">移除</button>' +
      '</div>' +
    '</div>';
  }

  function viewMistakes() {
    const ids = Object.keys(mistakes).filter(id => QUIZ_BY_ID[id]);
    ids.sort((a, b) => mistakes[b].n - mistakes[a].n);

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Mistakes · ' + ids.length + ' 道</p>' +
        '<h1 class="page-title">错题本</h1>' +
      '</header>' +
      (ids.length
        ? '<div class="note-foot" style="margin-top:0;border:0;padding-top:0">' +
            '<button class="btn btn--primary btn--sm" id="redoAll">全部重做（' + ids.length + '）</button>' +
            '<button class="btn btn--sm btn--danger" id="clearAll">清空错题本</button>' +
          '</div>' +
          '<div class="list-stack" style="margin-top:14px">' + ids.map(id => mistakeRow(QUIZ_BY_ID[id])).join('') + '</div>'
        : '<div class="empty"><b>错题本是空的</b><a href="#/quiz">去题库</a></div>') +
      '</div>';

    document.querySelectorAll('[data-redo]').forEach(b => b.addEventListener('click', function () {
      startQuiz([this.dataset.redo], '单题重做');
    }));
    document.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', function () {
      delete mistakes[this.dataset.remove];
      save('mistakes', mistakes);
      toast('已移出错题本');
      render();
    }));
    const all = document.getElementById('redoAll');
    if (all) all.addEventListener('click', function () {
      startQuiz(shuffle(ids), '错题重做');
    });
    const clr = document.getElementById('clearAll');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('清空全部错题记录？不可恢复。')) return;
      mistakes = {};
      save('mistakes', mistakes);
      render();
    });
  }

  /* ---------------- 学习进度 ---------------- */
  function viewProgress() {
    const readCount = Object.keys(readMap).filter(s => NOTE_BY_SLUG[s]).length;
    const st = quizStats();
    const days = Object.keys(activity).sort();

    // 连续天数
    let streak = 0;
    const d = new Date();
    for (;;) {
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (activity[k]) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }

    const rows = CHAPTERS.map(c => {
      const list = NOTES_BY_CH[c.id] || [];
      const done = list.filter(n => isRead(n.slug)).length;
      const att = attempts.filter(a => a.ch === c.id);
      const ok = att.filter(a => a.ok).length;
      const rate = att.length ? Math.round((ok / att.length) * 100) : 0;
      const pct = percent(done, list.length);
      return '<tr><td>' + String(c.num).padStart(2, '0') + ' · ' + esc(c.name) + '</td>' +
        '<td class="num">' + done + '/' + list.length + '</td>' +
        '<td><div class="bar mini-bar"><i style="width:' + pct + '%"></i></div></td>' +
        '<td class="num">' + att.length + '</td>' +
        '<td class="num">' + (att.length ? rate + '%' : '—') + '</td></tr>';
    }).join('');

    view().innerHTML = '<div class="page">' +
      '<header class="page-head">' +
        '<p class="eyebrow">Progress</p>' +
        '<h1 class="page-title">学习进度</h1>' +
      '</header>' +
      '<div class="stat-row">' +
        '<div class="stat"><div class="stat-k">笔记已读</div><div class="stat-v">' + readCount + '<small> / ' + NOTES.length + '</small></div></div>' +
        '<div class="stat"><div class="stat-k">累计作答</div><div class="stat-v">' + st.total + '<small> 次</small></div></div>' +
        '<div class="stat"><div class="stat-k">总正确率</div><div class="stat-v">' + st.rate + '<small> %</small></div></div>' +
        '<div class="stat"><div class="stat-k">连续学习</div><div class="stat-v">' + streak + '<small> 天</small></div></div>' +
      '</div>' +
      '<div class="section-head"><h2>按章统计</h2><p>笔记 + 作答</p></div>' +
      '<div style="overflow-x:auto"><table class="progress-table">' +
        '<thead><tr><th>章节</th><th>笔记</th><th>进度</th><th>作答</th><th>正确率</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="section-head"><h2>最近学习日</h2><p>共 ' + days.length + ' 天有记录</p></div>' +
      (days.length
        ? '<div class="tag-row">' + days.slice(-14).map(k => '<span class="badge">' + k + ' · ' + activity[k] + ' 次</span>').join('') + '</div>'
        : '<div class="empty">还没有记录，读完一篇笔记或做一道题就会开始统计。</div>') +
      '<div class="section-head"><h2>数据管理</h2></div>' +
      '<div class="note-foot" style="margin-top:0;border:0;padding-top:0">' +
        '<button class="btn btn--sm btn--danger" id="resetAll">清空全部学习数据</button>' +
      '</div>' +
      '</div>';

    const reset = document.getElementById('resetAll');
    if (reset) reset.addEventListener('click', function () {
      if (!confirm('清空笔记进度、错题本和练习记录？不可恢复。')) return;
      ['read', 'mistakes', 'attempts', 'activity'].forEach(k => localStorage.removeItem(KEY + k));
      refreshData();
      toast('已清空');
      render();
    });
  }

  /* ---------------- 搜索 ---------------- */
  let searchIndex = null;

  function buildIndex() {
    const idx = [];
    NOTES.forEach(n => {
      idx.push({
        kind: '笔记', title: n.title,
        sub: '第 ' + chapterNum(n.chapter) + ' 章 · ' + chapterName(n.chapter) + ' · ' + n.summary,
        hash: '#/notes/' + n.slug,
        text: (n.title + ' ' + n.summary + ' ' + n.tags.join(' ') + ' ' + n.body).toLowerCase(),
      });
    });
    GROUPS.forEach(g => g.items.forEach(it => {
      idx.push({
        kind: '公式', title: it.name, sub: g.name + ' · ' + it.note.replace(/\$[^$]*\$/g, ''),
        hash: '#/cheatsheet?q=' + encodeURIComponent(it.name),
        text: (it.name + ' ' + it.note + ' ' + it.tex + ' ' + g.name).toLowerCase(),
      });
    }));
    BANK.forEach(q => {
      idx.push({
        kind: '题目', title: q.question.replace(/\$[^$]*\$/g, '〔式〕').replace(/[（）]/g, ''),
        sub: chapterName(q.chapter) + ' · ' + q.difficulty + ' · ' + q.tags.join(' '),
        hash: '#/quiz/run?q=' + q.id,
        text: (q.question + ' ' + q.options.join(' ') + ' ' + q.explain + ' ' + q.tags.join(' ')).toLowerCase(),
      });
    });
    return idx;
  }

  function openSearch() {
    const modal = document.getElementById('searchModal');
    modal.hidden = false;
    const input = document.getElementById('searchInput');
    input.value = '';
    input.focus();
    if (!searchIndex) searchIndex = buildIndex();
    renderSearch('');
  }
  function closeSearch() {
    document.getElementById('searchModal').hidden = true;
  }

  let searchActive = 0;
  function renderSearch(kw) {
    const box = document.getElementById('searchResults');
    const q = kw.trim().toLowerCase();
    if (!q) {
      box.innerHTML = '<div class="s-empty">输入关键词</div>';
      return;
    }
    let hits = searchIndex.filter(it => it.text.indexOf(q) > -1);
    // 标题命中优先
    hits.sort((a, b) => (b.title.toLowerCase().indexOf(q) > -1) - (a.title.toLowerCase().indexOf(q) > -1));
    hits = hits.slice(0, 40);
    if (!hits.length) {
      box.innerHTML = '<div class="s-empty">没有找到「' + esc(kw) + '」。试试更短的词或英文缩写。</div>';
      return;
    }
    searchActive = 0;
    box.innerHTML = hits.map((h, i) =>
      '<a class="s-item' + (i === 0 ? ' active' : '') + '" href="' + h.hash + '">' +
        '<span class="s-kind">' + h.kind + '</span>' +
        '<span class="s-text"><span class="s-title">' + esc(h.title) + '</span>' +
        '<div class="s-sub">' + esc(h.sub) + '</div></span></a>').join('');
  }

  (function bindSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', function () { renderSearch(this.value); });
    input.addEventListener('keydown', function (e) {
      const items = Array.from(document.querySelectorAll('#searchResults .s-item'));
      if (!items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        searchActive = (searchActive + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length;
        items.forEach((it, i) => it.classList.toggle('active', i === searchActive));
        items[searchActive].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[searchActive]) {
          const href = items[searchActive].getAttribute('href');
          closeSearch();
          location.hash = href.replace(/^#/, '');
        }
      }
    });
    document.getElementById('searchClose').addEventListener('click', closeSearch);
    document.getElementById('searchModal').addEventListener('click', function (e) {
      if (e.target === this) closeSearch();
    });
    document.getElementById('searchBtn').addEventListener('click', openSearch);
  })();

  /* ---------------- 侧栏 / 顶栏事件 ---------------- */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('scrim').hidden = false;
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('scrim').hidden = true;
  }

  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  document.getElementById('scrim').addEventListener('click', closeSidebar);
  document.getElementById('themeBtn').addEventListener('click', cycleTheme);

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'Escape') {
      if (!document.getElementById('searchModal').hidden) closeSearch();
      else closeSidebar();
      if (location.hash.indexOf('/notes/') === 0) document.onkeydown = null;
    }
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('resize', onResize);

  /* ---------------- 启动 ---------------- */
  applyTheme();
  updateSidebar();
  if (!location.hash) location.hash = '#/home';
  render();

  // 系统主题变化时重绘
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme === 'auto') redrawLabs();
      });
    } catch (e) { /* 旧浏览器忽略 */ }
  }
})();
