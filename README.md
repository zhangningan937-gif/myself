# 通信原理 · 学习台

一个纯静态的《通信原理》学习网站：十三章笔记、公式速查、Canvas 交互实验、题库与错题本。

- 无需后端、无需数据库、无需构建工具
- 中文界面，响应式，浅色 / 深色 / 跟随系统
- 公式用本地 KaTeX 渲染，断网也能显示
- 学习进度、错题、练习记录保存在浏览器 `localStorage`

**当前规模**：40 篇笔记 · 121 条公式 · 125 道选择题 · 6 个交互实验

---

## 1. 在本机打开

> 不要直接双击 `index.html`。部分浏览器在 `file://` 下会限制字体、存储或脚本，建议用本地服务器。

### 方法 A：双击启动脚本（推荐）

双击 `start-server.bat`，它会：

1. 在当前目录启动 Python 静态服务器；
2. 自动打开 <http://127.0.0.1:8000/>。

关闭黑色命令行窗口即停止服务。

### 方法 B：命令行

```bash
cd comm-site
python -m http.server 8000 --bind 127.0.0.1
```

然后浏览器访问 <http://127.0.0.1:8000/>。

> 需要 Python 3。没有 Python 也可以用 VS Code 的 Live Server 插件，或 `npx serve`。

### 同一 Wi-Fi 下给别人看

双击 `start-server-lan.bat`，它会显示本机 IP（例如 `http://192.168.1.23:8000/`）。同一个 Wi-Fi 下的电脑/手机可以访问。注意：

- Windows 防火墙弹窗要允许「专用网络」；
- 你的电脑必须一直开着；
- 这不是公网地址，外网访问不了。

---

## 2. 部署到公网

### 方案 A：GitHub Pages（推荐，长期维护）

1. 在 GitHub 新建仓库；
2. 把**本文件夹里面的内容**上传到仓库根目录，确保根目录能看到 `index.html`、`assets/`；
3. 仓库 `Settings → Pages`：Source 选 `Deploy from a branch`，Branch 选 `main`，目录选 `/ (root)`；
4. 访问 `https://你的用户名.github.io/仓库名/`。

本项目使用 hash 路由（地址形如 `#/notes/am-basic`），不需要服务器重写规则。

### 方案 B：Netlify Drop（最快）

1. 打开 <https://app.netlify.com/drop>；
2. 把整个文件夹拖进去（不是只拖 `index.html`）；
3. 得到 `https://随机名字.netlify.app`，手机也能打开。

### 方案 C：Vercel / Cloudflare Pages

- Framework Preset：`Other` 或 `None`
- Build Command：留空
- Output Directory：`.`（仓库根目录）

> 部署后建议把 `index.html` 里的 `?v=20261120` 改成当天日期，方便刷新缓存。

---

## 3. 目录结构

```text
comm-site/
├─ index.html                 # 页面外壳、侧栏、顶栏、脚本入口
├─ start-server.bat           # 本机启动脚本
├─ start-server-lan.bat       # 局域网临时演示脚本
├─ .nojekyll                  # GitHub Pages 用
├─ README.md
└─ assets/
   ├─ css/style.css           # 设计系统、布局、深浅色、响应式
   ├─ img/favicon.svg
   ├─ js/
   │  ├─ data-notes-1.js      # 第 1–4 章笔记
   │  ├─ data-notes-2.js      # 第 5–8 章笔记
   │  ├─ data-notes-3.js      # 第 9–13 章笔记
   │  ├─ data-formulas.js     # 12 组共 121 条公式
   │  ├─ data-quiz-1..4.js    # 125 道题（按章分四个文件）
   │  ├─ markdown.js          # 轻量 Markdown + KaTeX 渲染
   │  ├─ lab.js               # 6 个 Canvas 实验
   │  └─ app.js               # 路由、视图、题库、错题本、搜索
   └─ vendor/katex/           # 本地 KaTeX（含字体，MIT）
```

没有 `node_modules`，没有打包产物。改完文件刷新浏览器即可。

---

## 4. 内容范围

按国内《通信原理》教材（樊昌信体系）的十三章组织：

| 章 | 主题 | 笔记 |
| --- | --- | --- |
| 1 | 绪论 | 系统模型、信息量与香农公式 |
| 2 | 确知信号 | 频谱、能量谱/功率谱、相关 |
| 3 | 随机过程 | 数字特征、平稳性、维纳–辛钦、窄带噪声 |
| 4 | 信道 | 恒参/变参、多径衰落、信道容量 |
| 5 | 模拟调制 | AM/DSB/SSB/VSB、FM/PM、抗噪与门限 |
| 6 | 数字基带传输 | 码型、功率谱、奈奎斯特准则、眼图、均衡 |
| 7 | 数字带通传输 | 2ASK/2FSK/2PSK/2DPSK |
| 8 | 新型数字调制 | QPSK/OQPSK、MSK/GMSK、QAM、OFDM |
| 9 | 模拟信号数字传输 | 抽样、量化、13 折线、PCM、ΔM、TDM |
| 10 | 最佳接收 | 匹配滤波、相关接收、误码率对比 |
| 11 | 差错控制编码 | 汉明码、循环码/CRC、卷积码、交织 |
| 12 | 正交编码与伪随机 | Walsh、m 序列、Gold、扩频 |
| 13 | 同步原理 | 载波同步、位同步、群同步、网同步 |

笔记写法固定为：**结论先行 → 条件与推导 → 考试易错**。每篇末尾可直接跳到本章练习。

---

## 5. 怎么改内容

### 改笔记

编辑 `assets/js/data-notes-*.js`，每个对象形如：

```js
{
  slug: "my-note",              // 唯一，会出现在 #/notes/my-note
  chapter: "baseband",          // 必须是 CHAPTERS 里的 id
  title: "笔记标题",
  summary: "列表页显示的一句话摘要",
  minutes: 8,
  level: "重点",                 // 基础 / 重点 / 进阶
  tags: ["标签1", "标签2"],
  body: String.raw`
## 小节标题

正文支持 **粗体**、*斜体*、列表、表格、引用块。

行内公式：$x[n]=\cos(\omega_0 n)$

独立公式：

$$
X[k]=\sum_{n=0}^{N-1}x[n]e^{-j2\pi kn/N}
$$

> [!tip] 提示
> 支持 tip / key / warn / exam 四种提示框。
`,
}
```

注意：

- `body` 必须用 `String.raw` 包住，否则 `\n`、`\t`、`\frac` 会被 JavaScript 转义；
- 正文里不要写反引号 `` ` ``（会截断模板字符串），行内代码改用「」或加粗；
- 新增章节时在 `data-notes-1.js` 顶部的 `CHAPTERS` 里加对象，并让笔记引用同一个 `chapter` id。

### 改公式

编辑 `assets/js/data-formulas.js` 的 `FORMULA_GROUPS`：

```js
{ name: "公式名", tex: String.raw`H(e^{j\omega})=\sum_n h[n]e^{-j\omega n}`, note: "一句话解释" }
```

### 改题库

编辑 `assets/js/data-quiz-*.js` 的 `QUIZ_BANK`：

```js
{
  id: "q126",                  // 唯一
  chapter: "filters",          // CHAPTERS 的 id
  difficulty: "进阶",          // 基础 / 进阶
  tags: ["误码率"],
  question: String.raw`题干，支持 $公式$`,
  options: ["选项 A", "选项 B", "选项 C", "选项 D"],
  answer: 2,                   // 正确选项下标，从 0 开始
  explain: String.raw`解析，支持公式，可多段。`,
}
```

### 改交互实验

编辑 `assets/js/lab.js`。每个实验包含元信息、`controls`、`readouts(state)` 和 `draw(ctx, state)`；画布逻辑尺寸固定 760×320，CSS 负责缩放。

### 改完不生效？

浏览器缓存。`index.html` 给 CSS/JS 加了版本参数：

```html
<script src="assets/js/app.js?v=20261120"></script>
```

每次改动后把 `?v=20261120` 换成新值（例如当天日期），再强制刷新（`Ctrl + F5`）。

---

## 6. 数据说明

学习数据只存在当前浏览器、当前域名下，键名都以 `comm.` 开头：

| 键 | 内容 |
| --- | --- |
| `comm.read` | 已读笔记与时间 |
| `comm.mistakes` | 错题及错误次数 |
| `comm.attempts` | 练习记录 |
| `comm.activity` | 每日学习次数 |
| `comm.theme` | 主题偏好 |

注意：

- 换浏览器、换设备、清理浏览器数据都会丢失进度；
- `http://127.0.0.1:8000` 和 `https://xxx.github.io` 是两个域，进度不互通；
- 没有账号系统，不会上传任何数据。

---

## 7. 快捷键

| 键 | 作用 |
| --- | --- |
| `Ctrl + K` | 打开全站搜索（笔记 / 公式 / 题目） |
| `↑` `↓` `Enter` | 搜索面板内选择与打开 |
| `1`–`4` | 答题时选择 A–D |
| `Enter` | 提交答案 / 下一题 |
| `Esc` | 关闭搜索或侧栏 |

---

## 8. 说明与致谢

- 站点结构参考了「不止EE」的《DSP 学习台》（<https://sxw94117-hash.github.io/EE_dsp/>）的**信息架构**：章节笔记 + 公式速查 + 交互实验 + 题库 + 错题本。本项目的代码与文字内容均为独立编写，未复制其源码或笔记正文。
- 公式体系以国内《通信原理》（樊昌信、曹丽娜）教材的常用结论为准；不同教材的符号约定（如 $n_0$ 单/双边、$r$ 的定义）可能不同，做题时以老师口径为准。
- KaTeX 使用 MIT 许可证，许可证原文见 `assets/vendor/katex/LICENSE`。
- 笔记用于复习，不保证覆盖你所在学校的考试范围；有疑问以教材和老师讲解为准。
