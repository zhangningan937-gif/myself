/* =========================================================
   交互实验室：每个实验 = 元信息 + 控件定义 + 绘制函数
   统一画布逻辑尺寸 760 × 320（CSS 负责缩放）
   ========================================================= */
(function () {
  'use strict';

  const W = 760, H = 320;

  /* ---------------- 通用绘图工具 ---------------- */
  function css(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  function colors() {
    return {
      ink: css('--ink', '#111'),
      ink2: css('--ink-2', '#445'),
      ink3: css('--ink-3', '#889'),
      line: css('--line', '#ddd'),
      lineStrong: css('--line-strong', '#bbb'),
      primary: css('--primary', '#0f766e'),
      accent: css('--accent', '#b45309'),
      danger: css('--danger', '#b42318'),
      info: css('--info', '#1d4ed8'),
      panel2: css('--panel-2', '#f3f5f8'),
    };
  }

  function box(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  }

  function panel(ctx, x, y, w, h, label, C) {
    box(ctx, x, y, w, h, 8, null, C.line);
    if (label) {
      ctx.fillStyle = C.ink3;
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + 10, y + 8);
    }
  }

  function grid(ctx, x, y, w, h, cols, rows, C) {
    ctx.save();
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.75;
    for (let i = 0; i <= cols; i++) {
      const px = x + (w * i) / cols;
      ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + h); ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      const py = y + (h * j) / rows;
      ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
    }
    ctx.restore();
  }

  function axes(ctx, x, y, w, h, C, xLabel, yLabel) {
    ctx.strokeStyle = C.lineStrong;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y - 6); ctx.lineTo(x, y + h); ctx.lineTo(x + w + 6, y + h);
    ctx.stroke();
    ctx.fillStyle = C.ink3;
    ctx.font = '10.5px system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    if (xLabel) ctx.fillText(xLabel, x + w, y + h + 8);
    ctx.textAlign = 'left';
    if (yLabel) ctx.fillText(yLabel, x + 4, y - 16);
  }

  function text(ctx, s, x, y, C, align, size, color) {
    ctx.fillStyle = color || C.ink2;
    ctx.font = (size || 11) + 'px system-ui, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  function line(ctx, pts, color, width, dash) {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.8;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  }

  /* ---------------- 数学工具 ---------------- */
  function erfc(x) {
    // Abramowitz & Stegun 7.1.26
    const z = Math.abs(x);
    const t = 1 / (1 + 0.5 * z);
    const a = [0.17087277, -0.82215223, 1.48851587, -1.13520398, 0.27886807,
      -0.18628806, 0.09678418, 0.37409196, 1.00002368];
    let s = a[0];
    for (let i = 1; i < a.length; i++) s = s * t + a[i];
    const ans = t * Math.exp(-z * z - 1.26551223 + t * s);
    return x >= 0 ? ans : 2 - ans;
  }
  function Q(x) { return 0.5 * erfc(x / Math.SQRT2); }

  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function gauss(rand) {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function fmt(x, d) {
    if (!isFinite(x)) return '—';
    return x.toFixed(d === undefined ? 2 : d);
  }
  function peStr(p) {
    if (p <= 0) return '< 1e-12';
    if (p >= 1) return '1';
    const e = Math.floor(Math.log10(p));
    const m = p / Math.pow(10, e);
    return m.toFixed(1) + '×10^' + e;
  }

  /* =========================================================
     实验 1：抽样与混叠
     ========================================================= */
  const labSampling = {
    id: 'sampling',
    name: '抽样与混叠',
    short: '改抽样率，看高频怎么折回低频',
    desc: '抽样率低于信号最高频率两倍时，样点会拟合出一条更低频的假正弦——混叠。',
    height: H,
    defaults: { f0: 3, fs: 8 },
    controls: [
      { key: 'f0', label: '信号频率 f₀', min: 0.5, max: 15, step: 0.1, unit: 'kHz' },
      { key: 'fs', label: '抽样率 fₛ', min: 2, max: 20, step: 0.1, unit: 'kHz' },
    ],
    readouts(s) {
      const nyq = s.fs / 2;
      let fr = s.f0 % s.fs;
      if (fr > nyq) fr = s.fs - fr;
      const alias = fr;
      return [
        { k: '奈奎斯特频率 fₛ/2', v: fmt(nyq, 2) + ' kHz' },
        { k: '恢复频率', v: fmt(alias, 2) + ' kHz' },
        { k: '状态', v: s.f0 < nyq ? '无混叠' : '发生混叠' },
      ];
    },
    draw(ctx, s) {
      const C = colors();
      const padL = 54, padR = 20, padT = 34, padB = 34;
      const w = W - padL - padR, h = H - padT - padB;
      const y0 = padT + h / 2;
      const T = 2.4;                       // 显示 2.4 ms
      const X = t => padL + (t / T) * w;
      const Y = a => y0 - (a * h) / 2.6;

      panel(ctx, padL - 10, padT - 8, w + 20, h + 16, '', C);
      grid(ctx, padL, padT, w, h, 12, 4, C);
      axes(ctx, padL, padT, w, h, C, 't / ms', '幅度');

      // 原始正弦
      let pts = [];
      for (let i = 0; i <= 600; i++) {
        const t = (i / 600) * T;
        pts.push([X(t), Y(Math.sin(2 * Math.PI * s.f0 * t))]);
      }
      line(ctx, pts, C.primary, 2);

      // 混叠正弦（只在真的发生混叠时画）
      let fr = s.f0 % s.fs;
      if (fr > s.fs / 2) fr = s.fs - fr;
      if (Math.abs(fr - s.f0) > 1e-6) {
        let pa = [];
        for (let i = 0; i <= 600; i++) {
          const t = (i / 600) * T;
          pa.push([X(t), Y(Math.sin(2 * Math.PI * fr * t))]);
        }
        line(ctx, pa, C.accent, 1.6, [5, 4]);
      }

      // 抽样点
      const nMax = Math.floor(T * s.fs);
      for (let n = 0; n <= nMax; n++) {
        const t = n / s.fs;
        const a = Math.sin(2 * Math.PI * s.f0 * t);
        ctx.fillStyle = C.danger;
        ctx.beginPath();
        ctx.arc(X(t), Y(a), 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = C.danger;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(X(t), y0);
        ctx.lineTo(X(t), Y(a));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // 折叠频率线
      ctx.save();
      ctx.strokeStyle = C.ink3;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, padT + 4); ctx.lineTo(padL + w, padT + 4);
      ctx.stroke();
      ctx.restore();
      text(ctx, '奈奎斯特频率 ' + fmt(s.fs / 2, 2) + ' kHz 以上无法无混叠恢复', padL + w - 8, padT + 16, C, 'right', 10.5, C.ink3);

      // 图例
      const lg = [[C.primary, '原信号'], [C.accent, '样点拟合出的假信号'], [C.danger, '样点']];
      lg.forEach((item, i) => {
        const lx = padL + i * 190;
        ctx.strokeStyle = item[0]; ctx.lineWidth = 2;
        if (i === 1) ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(lx, padT + h + 18); ctx.lineTo(lx + 22, padT + h + 18); ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, item[1], lx + 28, padT + h + 18, C, 'left', 10.5, C.ink3);
      });
    },
  };

  /* =========================================================
     实验 2：模拟调制波形与频谱
     ========================================================= */
  const labAM = {
    id: 'am',
    name: 'AM / DSB / SSB / FM',
    short: '四种模拟调制的波形与谱线对比',
    desc: '四种模拟调制的波形与谱线：AM 的载波谱线不携带信息，却占掉大部分功率。',
    height: H,
    defaults: { mode: 'AM', m: 0.6, beta: 2 },
    controls: [
      { key: 'mode', label: '调制方式', type: 'select', options: ['AM', 'DSB', 'SSB', 'FM'] },
      { key: 'm', label: '调幅度 m（AM/DSB/SSB）', min: 0.1, max: 1.2, step: 0.05, unit: '' },
      { key: 'beta', label: '调频指数 β（FM）', min: 0.2, max: 8, step: 0.1, unit: '' },
    ],
    readouts(s) {
      const out = [];
      if (s.mode === 'AM') {
        out.push({ k: '带宽', v: '2fₘ' });
        out.push({ k: '功率效率 η', v: fmt((s.m * s.m) / (2 + s.m * s.m), 3) });
        out.push({ k: '包络', v: s.m > 1 ? '过调制（会失真）' : '可包络检波' });
      } else if (s.mode === 'DSB') {
        out.push({ k: '带宽', v: '2fₘ' });
        out.push({ k: '载波', v: '抑制' });
        out.push({ k: '解调', v: '必须相干' });
      } else if (s.mode === 'SSB') {
        out.push({ k: '带宽', v: 'fₘ' });
        out.push({ k: '频带利用率', v: 'DSB 的 2 倍' });
        out.push({ k: '解调', v: '相干' });
      } else {
        out.push({ k: '带宽 2(β+1)fₘ', v: fmt(2 * (s.beta + 1), 1) + ' fₘ' });
        out.push({ k: '窄带/宽带', v: s.beta < 0.5 ? '窄带 FM' : '宽带 FM' });
        out.push({ k: '包络', v: '恒定，可限幅' });
      }
      return out;
    },
    draw(ctx, s) {
      const C = colors();
      const padL = 46, padR = 22, padT = 30, padB = 26;
      const half = (H - padT - padB - 18) / 2;
      const w = W - padL - padR;

      // ---- 上：时域 ----
      const y0 = padT + half / 2;
      panel(ctx, padL - 8, padT - 6, w + 16, half + 12, '', C);
      grid(ctx, padL, padT, w, half, 12, 4, C);
      axes(ctx, padL, padT, w, half, C, '', '');

      const fm = 1, fc = 9, T = 2;   // 归一化：显示 2 个调制周期？这里显示 2/fm
      const Tspan = 2;               // 2 个 fm 周期
      const X = t => padL + (t / Tspan) * w;
      const Y = a => y0 - a * half * 0.36;

      // 消息（虚线）
      let msg = [];
      for (let i = 0; i <= 400; i++) {
        const t = (i / 400) * Tspan;
        msg.push([X(t), Y(s.m * Math.cos(2 * Math.PI * fm * t))]);
      }
      line(ctx, msg, C.ink3, 1.3, [4, 4]);

      let pts = [];
      for (let i = 0; i <= 1600; i++) {
        const t = (i / 1600) * Tspan;
        let v;
        if (s.mode === 'AM') v = (1 + s.m * Math.cos(2 * Math.PI * fm * t)) * Math.cos(2 * Math.PI * fc * t);
        else if (s.mode === 'DSB') v = s.m * Math.cos(2 * Math.PI * fm * t) * Math.cos(2 * Math.PI * fc * t);
        else if (s.mode === 'SSB') v = 0.5 * s.m * Math.cos(2 * Math.PI * (fc + fm) * t);
        else v = Math.cos(2 * Math.PI * fc * t + s.beta * Math.sin(2 * Math.PI * fm * t));
        pts.push([X(t), Y(v)]);
      }
      line(ctx, pts, C.primary, 1.6);

      // ---- 下：频谱 ----
      const sy = padT + half + 18;
      const sy0 = sy + half / 2;
      panel(ctx, padL - 8, sy - 6, w + 16, half + 12, '', C);
      grid(ctx, padL, sy, w, half, 12, 2, C);
      axes(ctx, padL, sy, w, half, C, 'f − f_c  (× fₘ)', '');
      const SX = f => padL + w / 2 + (f / 3) * (w / 2);
      const SY = a => sy0 - a * half * 0.33;

      // 零轴
      line(ctx, [[padL, sy0], [padL + w, sy0]], C.lineStrong, 1.2);

      function stick(f, a, color) {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(SX(f), sy0); ctx.lineTo(SX(f), SY(a)); ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(SX(f), SY(a), 3, 0, Math.PI * 2); ctx.fill();
        if (Math.abs(f) > 0.01) {
          text(ctx, (f > 0 ? '+' : '') + f + 'fₘ', SX(f), sy + half - 8, C, 'center', 9.5, C.ink3);
        }
      }

      if (s.mode === 'AM') {
        stick(0, 0.85, C.danger);
        stick(1, 0.85 * s.m / 2, C.primary);
        stick(-1, 0.85 * s.m / 2, C.primary);
        text(ctx, '载波', SX(0), SY(0.95), C, 'center', 10, C.danger);
      } else if (s.mode === 'DSB') {
        stick(1, 0.85 * s.m / 2, C.primary);
        stick(-1, 0.85 * s.m / 2, C.primary);
      } else if (s.mode === 'SSB') {
        stick(1, 0.85 * s.m / 2, C.primary);
        text(ctx, '只留一个边带', SX(1.5), SY(0.5), C, 'left', 10, C.ink3);
      } else {
        // FM：画带宽包络 + 载波
        const bw = (s.beta + 1);
        ctx.save();
        ctx.fillStyle = C.primary; ctx.globalAlpha = 0.12;
        ctx.fillRect(SX(-bw), sy + 8, (2 * bw / 3) * (w / 2), half - 16);
        ctx.restore();
        stick(0, 0.8, C.danger);
        text(ctx, 'B = 2(β+1)fₘ = ' + fmt(2 * bw, 1) + ' fₘ', SX(0), sy + 14, C, 'center', 10.5, C.primary);
      }

      text(ctx, s.mode === 'FM' ? '频谱占用（示意）' : '频谱（相对载频）', padL + 8, sy + 12, C, 'left', 10.5, C.ink3);
    },
  };

  /* =========================================================
     实验 3：眼图与滚降
     ========================================================= */
  const labEye = {
    id: 'eye',
    name: '眼图与滚降',
    short: '滚降系数和噪声如何改变眼睛张开度',
    desc: '升余弦成形的眼图：滚降系数决定带宽与拖尾，噪声决定眼睛何时闭合。',
    height: H,
    defaults: { alpha: 0.5, noise: 0.05 },
    controls: [
      { key: 'alpha', label: '滚降系数 α', min: 0, max: 1, step: 0.05, unit: '' },
      { key: 'noise', label: '噪声强度', min: 0, max: 0.3, step: 0.01, unit: '' },
    ],
    readouts(s) {
      const B = (1 + s.alpha) / 2;
      return [
        { k: '带宽 B/R_B', v: fmt(B, 2) },
        { k: '频带利用率 (Baud/Hz)', v: fmt(2 / (1 + s.alpha), 2) },
        { k: '拖尾衰减', v: s.alpha < 0.2 ? '慢（接近 1/t）' : s.alpha < 0.7 ? '较快' : '快（1/t³）' },
      ];
    },
    draw(ctx, s) {
      const C = colors();
      const padL = 50, padR = 22, padT = 30, padB = 32;
      const w = W - padL - padR, h = H - padT - padB;
      const mid = padT + h / 2;
      panel(ctx, padL - 10, padT - 10, w + 20, h + 20, '', C);
      grid(ctx, padL, padT, w, h, 4, 4, C);
      axes(ctx, padL, padT, w, h, C, 't / T_b（2 个码元窗口）', '幅度');

      const T = 1, sps = 30, N = 44;
      const rand = rng(20261117);
      const bits = [];
      for (let i = 0; i < N; i++) bits.push(rand() < 0.5 ? -1 : 1);

      // 升余弦冲激响应
      function hrc(t, a) {
        if (Math.abs(t) < 1e-9) return 1;
        const x = t / T;
        const sinc = Math.sin(Math.PI * x) / (Math.PI * x);
        const den = 1 - Math.pow(2 * a * x, 2);
        if (Math.abs(den) < 1e-7) return (Math.PI / 4) * sinc;
        return sinc * Math.cos(Math.PI * a * x) / den;
      }

      // 逐样点合成
      function wave(t) {
        let v = 0;
        const k0 = Math.floor(t / T) - 5, k1 = Math.ceil(t / T) + 5;
        for (let k = k0; k <= k1; k++) {
          if (k < 0 || k >= N) continue;
          v += bits[k] * hrc(t - k * T, s.alpha);
        }
        return v;
      }

      const startK = 10, endK = N - 10;
      const tMax = 1.0;   // 显示 ±1 T_b
      const X = t => padL + ((t + tMax) / (2 * tMax)) * w;
      const A = 1.7;
      const Y = a => mid - (a / A) * (h / 2);

      // 叠加上百条轨迹
      ctx.save();
      ctx.globalAlpha = 0.24;
      for (let k = startK; k < endK; k++) {
        let pts = [];
        for (let i = -sps; i <= sps; i++) {
          const t = (i / sps) * tMax;
          const v = wave(k * T + t) + s.noise * gauss(rand);
          pts.push([X(t), Y(v)]);
        }
        line(ctx, pts, C.primary, 1.1);
      }
      ctx.restore();

      // 抽样时刻标记
      ctx.save();
      ctx.strokeStyle = C.accent;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(X(0), padT); ctx.lineTo(X(0), padT + h); ctx.stroke();
      ctx.restore();
      text(ctx, '最佳抽样时刻', X(0) + 6, padT + 12, C, 'left', 10, C.accent);

      // 眼开度测量
      const vals = [];
      for (let k = startK; k < endK; k++) vals.push(wave(k * T) + s.noise * gauss(rand));
      let mn = Infinity, mx = -Infinity;
      let nMin = Infinity, nMax = -Infinity;
      vals.forEach(v => {
        if (v > 0) { mx = Math.max(mx, v); mn = Math.min(mn, v); }
        else { nMax = Math.max(nMax, v); nMin = Math.min(nMin, v); }
      });
      const opening = Math.max(0, (mn - nMax) / 2);
      ctx.save();
      ctx.fillStyle = C.accent;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(X(0), Y(0), 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      text(ctx, '眼开度 ≈ ' + fmt(opening, 2) + '（理想 1.0）', padL + w - 8, padT + 12, C, 'right', 11, C.ink2);
    },
  };

  /* =========================================================
     实验 4：A 律 13 折线与量化
     ========================================================= */
  const labPCM = {
    id: 'pcm',
    name: 'A 律 13 折线与量化',
    short: '小信号为什么值钱：压缩特性 + 量化台阶',
    desc: 'A 律压缩特性与 13 折线逼近，右侧是均匀量化的台阶与误差。',
    height: H,
    defaults: { n: 4, amp: 0.7 },
    controls: [
      { key: 'n', label: '编码位数 n', min: 4, max: 10, step: 1, unit: 'bit' },
      { key: 'amp', label: '输入幅度（相对满幅）', min: 0.05, max: 1, step: 0.05, unit: '' },
    ],
    readouts(s) {
      const sqnr = 6.02 * s.n + 1.76 + 20 * Math.log10(s.amp);
      return [
        { k: '均匀量化 SQNR（正弦）', v: fmt(sqnr, 1) + ' dB' },
        { k: '量化级数', v: String(Math.pow(2, s.n)) },
        { k: '量化间隔 Δ', v: fmt(2 / Math.pow(2, s.n), 4) },
      ];
    },
    draw(ctx, s) {
      const C = colors();
      const padT = 34, padB = 34, gap = 26;
      const w = (W - 60 - gap) / 2;
      const h = H - padT - padB;
      const A = 87.6;

      // ---------- 左：压缩特性 ----------
      const x0 = 40, y0 = padT;
      panel(ctx, x0 - 10, y0 - 10, w + 20, h + 20, '', C);
      text(ctx, 'A 律压缩特性（A = 87.6）', x0, y0 - 18, C, 'left', 11, C.ink2);
      grid(ctx, x0, y0, w, h, 4, 4, C);
      axes(ctx, x0, y0, w, h, C, 'x = m/m_max', '');
      const X = x => x0 + x * w;
      const Y = y => y0 + h - y * h;

      // A 律曲线
      let curve = [];
      for (let i = 0; i <= 300; i++) {
        const x = i / 300;
        let y;
        if (x < 1 / A) y = (A * x) / (1 + Math.log(A));
        else y = (1 + Math.log(A * x)) / (1 + Math.log(A));
        curve.push([X(x), Y(y)]);
      }
      line(ctx, curve, C.primary, 2);

      // 13 折线（正半轴 8 段）
      const xs = [0, 1 / 128, 1 / 64, 1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1];
      let poly = [];
      for (let i = 0; i < xs.length; i++) poly.push([X(xs[i]), Y(i / 8)]);
      line(ctx, poly, C.accent, 1.8, [5, 4]);

      // 线性参考
      line(ctx, [[X(0), Y(0)], [X(1), Y(1)]], C.lineStrong, 1, [3, 4]);

      const lx = x0 + 8;
      text(ctx, '— A 律曲线', lx, y0 + 14, C, 'left', 10, C.primary);
      text(ctx, '-- 13 折线', lx, y0 + 30, C, 'left', 10, C.accent);
      text(ctx, '··· 线性', lx, y0 + 46, C, 'left', 10, C.ink3);

      // ---------- 右：量化台阶 ----------
      const x1 = x0 + w + gap;
      panel(ctx, x1 - 10, y0 - 10, w + 20, h + 20, '', C);
      text(ctx, '均匀量化：' + s.n + ' 位', x1, y0 - 18, C, 'left', 11, C.ink2);
      grid(ctx, x1, y0, w, h, 4, 4, C);
      axes(ctx, x1, y0, w, h, C, 't', '');
      const X2 = t => x1 + t * w;
      const Y2 = a => y0 + h / 2 - (a / 1.25) * (h / 2);

      const M = Math.pow(2, s.n), d = 2 / M;
      // 原信号
      let sig = [];
      for (let i = 0; i <= 300; i++) {
        const t = i / 300;
        sig.push([X2(t), Y2(s.amp * Math.sin(2 * Math.PI * 2 * t))]);
      }
      line(ctx, sig, C.primary, 2);

      // 量化阶梯
      let stair = [], prev = null;
      for (let i = 0; i <= 160; i++) {
        const t = i / 160;
        const v = s.amp * Math.sin(2 * Math.PI * 2 * t);
        const q = Math.max(-1, Math.min(1, Math.round(v / d) * d));
        stair.push([X2(t), Y2(q)]);
      }
      line(ctx, stair, C.accent, 1.4);

      // 误差条（放大显示）
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const v = s.amp * Math.sin(2 * Math.PI * 2 * t);
        const q = Math.round(v / d) * d;
        ctx.strokeStyle = C.danger;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(X2(t), Y2(q));
        ctx.lineTo(X2(t), Y2(q + (v - q) * 6));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      text(ctx, '阶梯 = 量化值，红线 = 误差（放大 6×）', x1 + 6, y0 + h - 4, C, 'left', 9.5, C.ink3);
    },
  };

  /* =========================================================
     实验 5：星座图与误码率
     ========================================================= */
  const labPSK = {
    id: 'psk',
    name: '星座图与误码率',
    short: 'BPSK/QPSK 的噪声云和 Pe 曲线',
    desc: '星座图上的散点是加噪后的接收样本，越过判决边界即出错；右侧为理论误码率。',
    height: H,
    defaults: { ebn0: 7, scheme: 'BPSK' },
    controls: [
      { key: 'scheme', label: '调制方式', type: 'select', options: ['BPSK', 'QPSK'] },
      { key: 'ebn0', label: 'Eb/N0', min: 0, max: 14, step: 0.5, unit: 'dB' },
    ],
    readouts(s) {
      const lin = Math.pow(10, s.ebn0 / 10);
      const pb = Q(Math.sqrt(2 * lin));
      return [
        { k: 'Eb/N0（线性）', v: fmt(lin, 1) },
        { k: '理论 Pb', v: peStr(pb) },
        { k: '判决边界', v: s.scheme === 'BPSK' ? 'x = 0' : 'I = 0 与 Q = 0' },
      ];
    },
    draw(ctx, s) {
      const C = colors();
      const padT = 30, padB = 34;
      const h = H - padT - padB;
      const leftW = 300, gap = 40, rightX = 60 + leftW + gap;
      const rightW = W - rightX - 30;

      // ---------- 星座图 ----------
      const cx = 60 + leftW / 2, cy = padT + h / 2, R = Math.min(leftW, h) * 0.38;
      panel(ctx, 50, padT - 10, leftW + 20, h + 20, s.scheme + ' 星座图（带噪声）', C);
      // 轴
      line(ctx, [[cx - R - 12, cy], [cx + R + 12, cy]], C.lineStrong, 1.2);
      line(ctx, [[cx, cy - R - 12], [cx, cy + R + 12]], C.lineStrong, 1.2);
      text(ctx, 'I', cx + R + 18, cy, C, 'left', 10.5, C.ink3);
      text(ctx, 'Q', cx, cy - R - 20, C, 'center', 10.5, C.ink3);

      const lin = Math.pow(10, s.ebn0 / 10);
      const sigma = 1 / Math.sqrt(2 * lin);   // 归一化符号能量 1
      const rand = rng(7717);

      const pts = s.scheme === 'BPSK'
        ? [[1, 0], [-1, 0]]
        : [[1, 1], [-1, 1], [-1, -1], [1, -1]];

      // 判决边界
      ctx.save();
      ctx.strokeStyle = C.accent; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
      if (s.scheme === 'BPSK') {
        ctx.beginPath(); ctx.moveTo(cx, cy - R - 10); ctx.lineTo(cx, cy + R + 10); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(cx - R - 10, cy); ctx.lineTo(cx + R + 10, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R - 10); ctx.lineTo(cx, cy + R + 10); ctx.stroke();
      }
      ctx.restore();

      // 噪声散点
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = C.info;
      for (let i = 0; i < 220; i++) {
        const p = pts[Math.floor(rand() * pts.length)];
        const x = p[0] + sigma * gauss(rand);
        const y = p[1] + sigma * gauss(rand);
        const px = cx + (x / 1.9) * R;
        const py = cy - (y / 1.9) * R;
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // 星座点
      pts.forEach(p => {
        const px = cx + (p[0] / 1.9) * R, py = cy - (p[1] / 1.9) * R;
        ctx.fillStyle = C.primary;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      });

      // ---------- 误码率曲线 ----------
      panel(ctx, rightX - 10, padT - 10, rightW + 20, h + 20, 'Pb 随 Eb/N0 变化', C);
      const gx = rightX + 6, gy = padT + 6, gw = rightW - 22, gh = h - 26;
      grid(ctx, gx, gy, gw, gh, 4, 4, C);
      axes(ctx, gx, gy, gw, gh, C, 'Eb/N0 (dB)', 'log₁₀Pb');

      const eMin = 0, eMax = 14, pMax = 0, pMin = -8;
      const PX = e => gx + ((e - eMin) / (eMax - eMin)) * gw;
      const PY = p => gy + ((pMax - p) / (pMax - pMin)) * gh;

      // 网格标签
      [0, 7, 14].forEach(e => text(ctx, String(e), PX(e), gy + gh + 12, C, 'center', 9.5, C.ink3));
      [0, -4, -8].forEach(p => text(ctx, String(p), gx - 8, PY(p), C, 'right', 9.5, C.ink3));

      // BPSK 曲线
      let curve = [];
      for (let e = eMin; e <= eMax; e += 0.2) {
        const l = Math.pow(10, e / 10);
        const pb = Q(Math.sqrt(2 * l));
        if (pb > 0) curve.push([PX(e), PY(Math.max(pMin, Math.log10(pb)))]);
      }
      line(ctx, curve, C.primary, 2);

      // 当前点
      const pbNow = Q(Math.sqrt(2 * lin));
      const logp = Math.max(pMin, Math.log10(pbNow));
      ctx.fillStyle = C.accent;
      ctx.beginPath(); ctx.arc(PX(s.ebn0), PY(logp), 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = C.accent; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PX(s.ebn0), PY(logp)); ctx.lineTo(PX(s.ebn0), gy + gh); ctx.stroke();
      ctx.setLineDash([]);

      text(ctx, 'Pb = ' + peStr(pbNow), PX(s.ebn0) - 6, PY(logp) - 14, C, 'right', 10.5, C.accent);
    },
  };

  /* =========================================================
     实验 6：匹配滤波器
     ========================================================= */
  const labMF = {
    id: 'mf',
    name: '匹配滤波器',
    short: '噪声里的矩形脉冲，怎么被「凑」出峰值',
    desc: '上为带噪输入，下为匹配滤波输出；信号能量在 t=T 处同相叠加成峰值。',
    height: H,
    defaults: { noise: 0.6, width: 0.25 },
    controls: [
      { key: 'width', label: '脉冲宽度 τ/T', min: 0.1, max: 0.5, step: 0.02, unit: '' },
      { key: 'noise', label: '噪声强度 σ', min: 0, max: 1.5, step: 0.05, unit: '' },
    ],
    readouts(s) {
      const E = s.width;                       // 归一化能量（幅度 1）
      const snrMax = (2 * E) / Math.max(1e-6, s.noise * s.noise * 0.25);
      return [
        { k: '信号能量 E', v: fmt(E, 3) },
        { k: '理论最大 SNR = 2E/N₀', v: fmt(snrMax, 1) },
        { k: '输出峰值位置', v: 't = T' },
      ];
    },
    draw(ctx, s) {
      const C = colors();
      const padL = 50, padR = 22, padT = 28, padB = 26;
      const half = (H - padT - padB - 16) / 2;
      const w = W - padL - padR;
      const T = 1;

      // ---------- 上：输入 ----------
      const y0 = padT + half / 2;
      panel(ctx, padL - 8, padT - 6, w + 16, half + 12, '带噪输入 r(t) = s(t) + n(t)', C);
      grid(ctx, padL, padT, w, half, 10, 4, C);
      axes(ctx, padL, padT, w, half, C, '', '');
      const X = t => padL + (t / T) * w;
      const Y = a => y0 - (a / 2) * half;

      const rand = rng(424242);
      let inp = [], clean = [];
      for (let i = 0; i <= 500; i++) {
        const t = (i / 500) * T;
        const sig = (t > 0.2 && t < 0.2 + s.width) ? 1 : 0;
        clean.push([X(t), Y(sig * 0.9)]);
        inp.push([X(t), Y(sig + s.noise * gauss(rand))]);
      }
      line(ctx, clean, C.lineStrong, 1.2, [4, 4]);
      line(ctx, inp, C.primary, 1.3);

      // ---------- 下：输出 ----------
      const sy = padT + half + 16;
      const sy0 = sy + half / 2;
      panel(ctx, padL - 8, sy - 6, w + 16, half + 12, '匹配滤波输出 y(t) = r(t) * s(T−t)', C);
      grid(ctx, padL, sy, w, half, 10, 4, C);
      axes(ctx, padL, sy, w, half, C, 't / T', '');
      const Y2 = a => sy0 - (a / 2.2) * half;

      // 数值卷积：输出 = 输入与反转脉冲的卷积（离散）
      const N = 400;
      const dt = T / N;
      const sigArr = [], inArr = [];
      for (let i = 0; i < N; i++) {
        const t = i * dt;
        sigArr.push((t > 0.2 && t < 0.2 + s.width) ? 1 : 0);
      }
      for (let i = 0; i < N; i++) inArr.push(sigArr[i] + s.noise * gauss(rand));

      const L = Math.max(1, Math.round(s.width * N));
      let out = [];
      for (let n = 0; n < N; n++) {
        let v = 0;
        for (let k = 0; k < L; k++) {
          const idx = n - (L - 1 - k);
          if (idx >= 0 && idx < N) v += inArr[idx] * sigArr[k];
        }
        out.push(v / L);
      }

      let pts = [];
      for (let i = 0; i < N; i++) pts.push([X(i / N), Y2(out[i])]);
      line(ctx, pts, C.accent, 1.8);

      // 峰值标记
      let peak = -Infinity, pi = 0;
      out.forEach((v, i) => { if (v > peak) { peak = v; pi = i; } });
      ctx.fillStyle = C.danger;
      ctx.beginPath(); ctx.arc(X(pi / N), Y2(peak), 4, 0, Math.PI * 2); ctx.fill();
      text(ctx, '峰值（最佳抽样点）', X(pi / N) + 8, Y2(peak) - 12, C, 'left', 10.5, C.accent);

      // 输出波形就是自相关：理论三角
      let tri = [];
      const p0 = 0.2;
      for (let i = 0; i <= 400; i++) {
        const t = (i / 400) * T;
        let v = 0;
        // 矩形自相关（忽略噪声的理想输出）
        const d = Math.abs(t - (p0 + s.width));
        v = Math.max(0, s.width - d) / s.width;
        tri.push([X(t), Y2(v)]);
      }
      line(ctx, tri, C.ink3, 1.1, [3, 4]);
    },
  };

  window.LABS = [labSampling, labAM, labEye, labPCM, labPSK, labMF];

  const EXPLAIN = {
    sampling: '实线是真实信号，红点是抽样值，虚线是用这些样点能唯一拟合出的最低频正弦。当 f₀ 超过 fₛ/2，虚线就和实线分家了——它才是接收端「以为」收到的信号。把 f₀ 拖过奈奎斯特频率，看混叠频率读数怎么折回去：这正是抗混叠滤波器必须放在采样之前的原因。',
    am: '上半部是时域：虚线是消息，实线是已调波。AM 的包络直接抄写消息，所以能包络检波；DSB 过零点反相，包络不再等于消息；SSB 只有一个边带，波形看起来像单一正弦。下半部是谱线：载波那条红柱就是 AM 白烧掉的功率，m 越小它占比越大。切到 FM 看带宽随 β 怎么涨。',
    eye: '每一段灰色轨迹是一个码元窗口内的接收波形，叠在一起就是眼图。中间那条竖线是最佳抽样时刻，眼睛在这一点张开最大。把 α 调到 0，拖尾变长、眼睛边缘发散；把噪声调大，眼睛上下沿变厚直到闭合。工程上「眼睛还能睁开多少」就是噪声容限。',
    pcm: '左图实线是 A 律压缩曲线，虚线是 13 折线逼近：小信号段斜率大（等效放大小信号），大信号段斜率小。右图是均匀量化：正弦被切成台阶，红线是误差（放大 6 倍显示）。把输入幅度调小，看 SQNR 读数怎么掉——这就是非均匀量化要解决的问题。',
    psk: '蓝点是加噪后的接收样本，散开程度由 Eb/N0 决定；虚线是判决边界，越过就判错。右侧是理论 Pb 曲线，橙点标出当前工作点。把 Eb/N0 从 4 dB 拖到 10 dB，看散点收紧、Pb 掉几个数量级——这就是「瀑布曲线」的来历。',
    mf: '上图虚线是干净的矩形脉冲，实线是带噪输入。下图是匹配滤波输出：它把脉冲能量在 t=T 处同相叠加成一个尖峰，噪声却因相位随机互相抵消。注意输出是三角波——那是矩形脉冲的自相关。拖动脉冲宽度，峰值高度随之变化；加大噪声，峰值仍然立得住，这就是匹配滤波的意义。',
  };
  window.LABS.forEach(l => { if (!l.explain) l.explain = EXPLAIN[l.id] || ''; });

  window.LAB_W = W;
  window.LAB_H = H;
})();
