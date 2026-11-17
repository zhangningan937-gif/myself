/* =========================================================
   轻量 Markdown + KaTeX 渲染器
   只覆盖笔记里用到的语法：标题、列表、表格、引用提示框、
   代码块、粗斜体、行内代码、链接、$行内公式$、$$独立公式$$
   ========================================================= */
(function () {
  'use strict';

  const T = '\u0001';           // 数学占位符边界
  const TOKEN_RE = /\u0001(\d+)\u0001/g;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---------- 1. 抽离公式，避免被 Markdown 和转义破坏 ---------- */
  function extractMath(src) {
    const math = [];
    let out = '';
    let i = 0;

    while (i < src.length) {
      const ch = src[i];
      if (ch === '\\') {                      // 转义的 \$ 不当作公式起点
        out += src.slice(i, i + 2);
        i += 2;
        continue;
      }
      if (ch !== '$') { out += ch; i++; continue; }

      const isBlock = src[i + 1] === '$';
      const fence = isBlock ? '$$' : '$';
      const start = i + fence.length;
      let j = start, found = -1;

      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue; }
        if (isBlock) {
          if (src[j] === '$' && src[j + 1] === '$') { found = j; break; }
        } else if (src[j] === '$') {
          if (src[j + 1] === '$') { j += 2; continue; }
          found = j; break;
        }
        j++;
      }

      if (found < 0) { out += ch; i++; continue; }   // 没有闭合，按普通字符处理

      const tex = src.slice(start, found).trim();
      if (!tex) { out += src.slice(i, found + fence.length); i = found + fence.length; continue; }

      const idx = math.push({ tex, display: isBlock }) - 1;
      out += T + idx + T;
      i = found + fence.length;
    }
    return { text: out, math };
  }

  function renderTex(tex, display) {
    if (!window.katex) return '<code>' + escapeHtml(tex) + '</code>';
    try {
      return window.katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        trust: false,
        output: 'html',
      });
    } catch (e) {
      return '<code>' + escapeHtml(tex) + '</code>';
    }
  }

  function putMath(html, math) {
    return html.replace(TOKEN_RE, function (_, n) {
      const m = math[+n];
      return m ? renderTex(m.tex, m.display) : '';
    });
  }

  /* ---------- 2. 行内格式 ---------- */
  function inline(raw) {
    let s = escapeHtml(raw);

    // 行内代码先占位，避免里面的星号被当成粗体
    const codes = [];
    s = s.replace(/`([^`]+)`/g, function (_, c) {
      codes.push(c);
      return '\u0002' + (codes.length - 1) + '\u0002';
    });

    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, function (_, t, u) {
      return '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + t + '</a>';
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

    s = s.replace(/\u0002(\d+)\u0002/g, function (_, n) {
      return '<code>' + codes[+n] + '</code>';
    });

    return s;
  }

  /* ---------- 3. 块级解析 ---------- */
  const CALLOUTS = {
    tip:  'callout--tip',
    key:  'callout--key',
    warn: 'callout--warn',
    exam: 'callout--exam',
    note: '',
  };

  function isTableSep(line) {
    return /^\s*\|?[\s:*-]+\|[\s:*-|]*$/.test(line) && /-/.test(line);
  }

  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith('|')) s = s.slice(1);
    if (s.endsWith('|')) s = s.slice(0, -1);
    return s.split('|').map(function (c) { return c.trim(); });
  }

  function renderTable(lines) {
    const head = splitRow(lines[0]);
    const rows = lines.slice(2).map(splitRow);
    let out = '<table><thead><tr>';
    head.forEach(function (c) { out += '<th>' + inline(c) + '</th>'; });
    out += '</tr></thead><tbody>';
    rows.forEach(function (r) {
      out += '<tr>';
      for (let k = 0; k < head.length; k++) out += '<td>' + inline(r[k] || '') + '</td>';
      out += '</tr>';
    });
    return out + '</tbody></table>';
  }

  function renderList(lines) {
    const ordered = /^\s*\d+[.)]\s+/.test(lines[0]);
    let out = ordered ? '<ol>' : '<ul>';
    let open = false;

    lines.forEach(function (line) {
      const m = line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);
      if (!m) return;
      const indent = m[1].length;
      const body = inline(m[2]);
      if (indent >= 2) {
        out += '<li class="li-sub">' + body + '</li>';
      } else {
        if (open) out += '</li>';
        out += '<li>' + body;
        open = true;
      }
    });
    if (open) out += '</li>';
    return out + (ordered ? '</ol>' : '</ul>');
  }

  function renderQuote(lines) {
    let body = lines.map(function (l) { return l.replace(/^\s*>\s?/, ''); });
    let cls = 'callout';
    let title = '';
    const first = body[0] || '';
    const m = first.match(/^\[!(\w+)\]\s*(.*)$/);
    if (m) {
      cls = 'callout ' + (CALLOUTS[m[1].toLowerCase()] || '');
      title = m[2].trim();
      body = body.slice(1);
    }
    const inner = parseBlocks(body);
    const head = title ? '<span class="co-title">' + inline(title) + '</span>' : '';
    return '<div class="' + cls + '">' + head + inner + '</div>';
  }

  const isBlockStart = function (line, next) {
    return /^\s*(#{2,4})\s+/.test(line) ||
      /^\s*```/.test(line) ||
      /^\s*---+\s*$/.test(line) ||
      /^\s*>/.test(line) ||
      /^\s*[-*+]\s+/.test(line) ||
      /^\s*\d+[.)]\s+/.test(line) ||
      (line.indexOf('|') > -1 && next && isTableSep(next));
  };

  function parseBlocks(lines) {
    let out = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      // 代码块
      if (/^\s*```/.test(line)) {
        const lang = line.replace(/^\s*```/, '').trim();
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out += '<pre data-lang="' + escapeHtml(lang) + '"><code>' + escapeHtml(buf.join('\n')) + '</code></pre>';
        continue;
      }

      // 标题
      const h = line.match(/^\s*(#{2,4})\s+(.*)$/);
      if (h) {
        const lv = h[1].length;
        out += '<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>';
        i++;
        continue;
      }

      // 分隔线
      if (/^\s*---+\s*$/.test(line)) { out += '<hr>'; i++; continue; }

      // 表格
      if (line.indexOf('|') > -1 && lines[i + 1] && isTableSep(lines[i + 1])) {
        const buf = [line, lines[i + 1]];
        i += 2;
        while (i < lines.length && lines[i].indexOf('|') > -1 && lines[i].trim()) { buf.push(lines[i]); i++; }
        out += renderTable(buf);
        continue;
      }

      // 引用 / 提示框
      if (/^\s*>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i]); i++; }
        out += renderQuote(buf);
        continue;
      }

      // 列表
      if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && (/^\s*([-*+]|\d+[.)])\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && lines[i].trim()))) {
          buf.push(lines[i]); i++;
        }
        out += renderList(buf);
        continue;
      }

      // 段落
      const buf = [];
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) {
        buf.push(lines[i]); i++;
      }
      const joined = buf.join('\n').trim();
      // 独占一行的公式块不要包进 <p>，否则 display 数学块会破坏段落
      if (/^\u0001\d+\u0001$/.test(joined)) out += joined;
      else out += '<p>' + buf.map(inline).join('<br>') + '</p>';
    }
    return out;
  }

  function render(src) {
    const ex = extractMath(String(src || ''));
    const html = parseBlocks(ex.text.replace(/\r\n/g, '\n').split('\n'));
    return putMath(html, ex.math);
  }

  function renderInline(src) {
    const ex = extractMath(String(src || ''));
    return putMath(inline(ex.text.replace(/\s*\n\s*/g, ' ')), ex.math);
  }

  window.MD = { render: render, renderInline: renderInline, escape: escapeHtml };
})();
