/* =========================================================
   题库 1/4：第 1–4 章（绪论、确知信号、随机过程、信道）
   ========================================================= */

window.QUIZ_BANK = window.QUIZ_BANK || [];

window.QUIZ_BANK.push(

/* ---------------- 第 1 章 绪论 ---------------- */
{
  id: 'q001', chapter: 'intro', difficulty: '基础', tags: ['信息量'],
  question: String.raw`某符号出现的概率为 $1/8$，它携带的信息量是（　）。`,
  options: ['1 bit', '3 bit', '8 bit', '0.125 bit'],
  answer: 1,
  explain: String.raw`$I=-\log_2(1/8)=\log_2 8=3$ bit。信息量看的是概率的倒数，概率越小信息越多。记住三个锚点：$P=1/2\to1$ bit，$P=1/4\to2$ bit，$P=1/8\to3$ bit。`,
},
{
  id: 'q002', chapter: 'intro', difficulty: '基础', tags: ['码元速率'],
  question: String.raw`某 16 进制数字系统的码元速率为 2000 Baud，其信息速率为（　）。`,
  options: ['2000 bit/s', '4000 bit/s', '8000 bit/s', '32000 bit/s'],
  answer: 2,
  explain: String.raw`$R_b=R_B\log_2M=2000\times\log_2 16=2000\times4=8000$ bit/s。关键在先把进制数换成「每码元多少比特」，再去乘波特率。反过来给比特率求波特率时，是除以 $\log_2M$。`,
},
{
  id: 'q003', chapter: 'intro', difficulty: '基础', tags: ['香农公式'],
  question: String.raw`带宽 $B=4$ kHz、信噪比 $S/N=15$ 的加性高斯白噪声信道，其容量约为（　）。`,
  options: ['16 kb/s', '4 kb/s', '60 kb/s', '64 kb/s'],
  answer: 0,
  explain: String.raw`$C=B\log_2(1+S/N)=4000\times\log_2 16=4000\times4=16$ kb/s。注意 $S/N=15$ 时 $1+S/N=16$，正好是 2 的 4 次方，这是出题人最爱凑的数。若给的是 15 dB，则要先换成 31.6 倍，别直接代入。`,
},
{
  id: 'q004', chapter: 'intro', difficulty: '进阶', tags: ['香农公式', '带宽'],
  question: String.raw`关于香农公式 $C=B\log_2(1+S/N)$，下列说法**错误**的是（　）。`,
  options: [
    '带宽与信噪比可以互换，但两者对容量的贡献速率不同',
    '带宽趋于无穷时，容量趋于一个有限值',
    '只要带宽足够大，容量可以无限增大',
    '信噪比用 dB 给出时必须先换算成倍数',
  ],
  answer: 2,
  explain: String.raw`噪声功率 $N=n_0B$ 随带宽一起增长，所以 $B\to\infty$ 时 $C\to1.44S/n_0$，是有限值。选「容量无限增大」就是把噪声当成了与带宽无关的常数，这是最典型的错误。其余三项都正确。`,
},
{
  id: 'q005', chapter: 'intro', difficulty: '基础', tags: ['数字通信优点'],
  question: String.raw`下列**不属于**数字通信相对模拟通信优点的是（　）。`,
  options: [
    '抗干扰能力强，噪声不累积',
    '便于加密与存储处理',
    '占用传输带宽更窄',
    '便于集成化，设备体积小',
  ],
  answer: 2,
  explain: String.raw`数字通信的代价恰恰是占带宽更宽（同样质量下通常需要更多带宽），这也是它早期推广慢的原因。其余三项都是标准优点。答题时把「优点 + 代价」一起写，简答题才不会丢分。`,
},
{
  id: 'q006', chapter: 'intro', difficulty: '基础', tags: ['dB 换算'],
  question: String.raw`某接收机输入信噪比为 20 dB，对应的功率比是（　）。`,
  options: ['2', '20', '100', '1000'],
  answer: 2,
  explain: String.raw`$(S/N)_{\rm dB}=10\lg(S/N)$，所以 $20=10\lg x$，$\lg x=2$，$x=100$。记牢三个常用值：10 dB=10、20 dB=100、30 dB=1000。注意功率比用 10lg，电压/电流比才用 20lg。`,
},
{
  id: 'q007', chapter: 'intro', difficulty: '基础', tags: ['频带利用率'],
  question: String.raw`2PSK 信号的码元速率为 $R_B$、带宽为 $2R_B$，其频带利用率为（　）。`,
  options: ['0.5 bit/(s·Hz)', '1 bit/(s·Hz)', '2 bit/(s·Hz)', '0.25 bit/(s·Hz)'],
  answer: 0,
  explain: String.raw`二进制时 $R_b=R_B$，所以 $\eta=R_b/B=R_B/(2R_B)=0.5$ bit/(s·Hz)。QPSK 同样带宽下每符号带 2 bit，$\eta$ 翻倍到 1；16QAM 到 2。比较不同调制一律换算到 bit/(s·Hz)。`,
},
{
  id: 'q008', chapter: 'intro', difficulty: '基础', tags: ['通信方式'],
  question: String.raw`对讲机按下发射键时不能同时接收，松开才能听，这种通信方式属于（　）。`,
  options: ['单工通信', '半双工通信', '全双工通信', '并行通信'],
  answer: 1,
  explain: String.raw`半双工 = 双向但不同时；单工 = 只能单向；全双工 = 双向同时（电话）。判断口诀：能不能双向、能不能同时。并行/串行是另一维度的分类（码元排列方式），别混。`,
},

/* ---------------- 第 2 章 确知信号 ---------------- */
{
  id: 'q009', chapter: 'signal', difficulty: '基础', tags: ['带宽'],
  question: String.raw`宽度为 $\tau$ 的矩形脉冲，其频谱的第一零点带宽为（　）。`,
  options: ['$1/\tau$', '$2/\tau$', '$\tau$', '$1/(2\tau)$'],
  answer: 1,
  explain: String.raw`矩形脉冲频谱为 $\tau{\rm Sa}(\pi f\tau)$，第一个零点在 $\pi f\tau=\pi$，即 $f=1/\tau$。零点带宽指主瓣两侧零点之间的宽度，所以是 $2\times(1/\tau)=2/\tau$。若题目问「单边零点位置」则是 $1/\tau$，看清问的是宽度还是位置。`,
},
{
  id: 'q010', chapter: 'signal', difficulty: '基础', tags: ['能量信号', '功率信号'],
  question: String.raw`下列信号中属于**功率信号**的是（　）。`,
  options: ['单个矩形脉冲', '衰减指数信号 $e^{-at}u(t)$', '周期方波', '三角脉冲'],
  answer: 2,
  explain: String.raw`能在时间上「结束」的是能量信号（单脉冲、衰减指数），无限持续的是功率信号（周期信号、随机过程）。周期方波能量无穷、平均功率有限，所以是功率信号，用功率谱描述。`,
},
{
  id: 'q011', chapter: 'signal', difficulty: '基础', tags: ['帕塞瓦尔'],
  question: String.raw`帕塞瓦尔定理说明（　）。`,
  options: [
    '时域能量等于频域能量',
    '时域平均功率等于频域平均功率',
    '信号带宽与脉宽成反比',
    '卷积在频域变成乘法',
  ],
  answer: 0,
  explain: String.raw`$\int s^2(t)dt=\int|S(f)|^2df$，即能量守恒。它成立的前提是能量信号。选项 C 是时宽带宽积，D 是卷积定理，三个结论常被混在一起出选择题，要分清各自的条件。`,
},
{
  id: 'q012', chapter: 'signal', difficulty: '基础', tags: ['冲激函数'],
  question: String.raw`单位冲激信号 $\delta(t)$ 的频谱是（　）。`,
  options: ['$\delta(f)$', '$1$（全频带平坦）', '$1/f$', '${\rm Sa}(\pi f)$'],
  answer: 1,
  explain: String.raw`$\delta(t)$ 的傅里叶变换为 1，表示所有频率分量等幅。反过来，常数 1 的频谱是 $\delta(f)$。这对变换是「时域越集中、频域越分散」的极端例子，也是白噪声模型的数学来源。`,
},
{
  id: 'q013', chapter: 'signal', difficulty: '基础', tags: ['自相关'],
  question: String.raw`能量信号的自相关函数 $R(\tau)$ 在 $\tau=0$ 处的值等于（　）。`,
  options: ['信号的平均功率', '信号的总能量', '信号的直流分量', '信号的带宽'],
  answer: 1,
  explain: String.raw`$R(0)=\int s^2(t)dt=E$。自相关峰值出现在零时移，因为此时信号与自身完全重合。对功率信号则 $R(0)$ 是平均功率。这条性质是匹配滤波器「输出峰值在抽样时刻」的基础。`,
},
{
  id: 'q014', chapter: 'signal', difficulty: '进阶', tags: ['卷积定理'],
  question: String.raw`若 $y(t)=s(t)*h(t)$，则 $Y(f)$ 等于（　）。`,
  options: ['$S(f)+H(f)$', '$S(f)H(f)$', '$S(f)*H(f)$', '$S(f)/H(f)$'],
  answer: 1,
  explain: String.raw`时域卷积对应频域相乘。这是「滤波」的数学定义：输出频谱 = 输入频谱 × 系统频响。反过来，时域相乘对应频域卷积——调制就是这一条。两个方向别记反。`,
},
{
  id: 'q015', chapter: 'signal', difficulty: '进阶', tags: ['白噪声', '噪声功率'],
  question: String.raw`双边功率谱密度为 $n_0/2$ 的白噪声通过带宽为 $B$ 的理想低通滤波器，输出噪声功率为（　）。`,
  options: ['$n_0B/2$', '$n_0B$', '$2n_0B$', '$n_0/(2B)$'],
  answer: 1,
  explain: String.raw`双边谱在 $[-B,B]$ 上积分：$\int_{-B}^{B}(n_0/2)df=n_0B$。等价地，单边谱为 $n_0$，带宽 $B$，也是 $n_0B$。**最高频的失分点是把双边谱当成单边**：若题目给单边谱 $N_0$，功率也是 $N_0B$，数值一样但含义不同，别重复乘 2。`,
},
{
  id: 'q016', chapter: 'signal', difficulty: '基础', tags: ['时宽带宽积'],
  question: String.raw`把矩形脉冲的宽度压缩一半，其频谱带宽将（　）。`,
  options: ['变窄一半', '不变', '变宽一倍', '变为四倍'],
  answer: 2,
  explain: String.raw`零点带宽 $2/\tau$，$\tau$ 减半则带宽加倍。这就是时宽带宽积为常数的直观含义：想传得更快（脉冲更窄），就必须占更宽的频带。第 6 章滚降和第 9 章 PCM 带宽都是这条的直接推论。`,
},

/* ---------------- 第 3 章 随机过程 ---------------- */
{
  id: 'q017', chapter: 'random', difficulty: '基础', tags: ['广义平稳'],
  question: String.raw`随机过程 $X(t)$ 为广义平稳过程的条件是（　）。`,
  options: [
    '任意维联合分布与时间起点无关',
    '均值为常数，且自相关只与时间差有关',
    '所有样本函数都相同',
    '方差为零',
  ],
  answer: 1,
  explain: String.raw`广义平稳只要求一阶、二阶矩：均值常数 + 自相关只依赖 $\tau$。选项 A 是严平稳。通信原理里不特别说明时，「平稳」默认指广义平稳。高斯过程特殊：广义平稳可推出严平稳。`,
},
{
  id: 'q018', chapter: 'random', difficulty: '基础', tags: ['各态历经'],
  question: String.raw`「各态历经」的含义是（　）。`,
  options: [
    '不同时刻的随机变量相互独立',
    '时间平均等于统计平均',
    '过程一定是高斯的',
    '自相关函数为常数',
  ],
  answer: 1,
  explain: String.raw`各态历经指用一条足够长的样本做时间平均，就能得到整个过程的统计平均。工程意义：只能测一台设备的噪声，却想推断总体特性。注意「各态历经 ⇒ 平稳」，反之不成立。`,
},
{
  id: 'q019', chapter: 'random', difficulty: '重点', tags: ['维纳-辛钦'],
  question: String.raw`维纳–辛钦定理表明，平稳随机过程的功率谱密度是其自相关函数的（　）。`,
  options: ['导数', '积分', '傅里叶变换', '希尔伯特变换'],
  answer: 2,
  explain: String.raw`$P_X(f)=\int R_X(\tau)e^{-j2\pi f\tau}d\tau$，两者是傅里叶变换对。所以求功率谱不必去截短取极限，只要先求自相关再变换。反过来，已知功率谱也能求自相关，这是噪声分析的标准套路。`,
},
{
  id: 'q020', chapter: 'random', difficulty: '基础', tags: ['白噪声'],
  question: String.raw`白噪声的自相关函数是（　）。`,
  options: [
    '常数',
    '冲激函数 $\frac{n_0}{2}\delta(\tau)$',
    'sinc 函数',
    '指数函数',
  ],
  answer: 1,
  explain: String.raw`白噪声功率谱平坦，其傅里叶反变换就是冲激。物理含义：只有 $\tau=0$ 时相关，不同时刻取样互不相关（高斯时为独立），即「无记忆」。经过带宽限制后自相关变成 sinc 型，相邻样点开始相关。`,
},
{
  id: 'q021', chapter: 'random', difficulty: '重点', tags: ['窄带噪声', '瑞利分布'],
  question: String.raw`零均值平稳窄带高斯噪声的包络服从（　）。`,
  options: ['高斯分布', '均匀分布', '瑞利分布', '莱斯分布'],
  answer: 2,
  explain: String.raw`窄带高斯噪声的两个正交分量独立同分布高斯，合成包络 $a=\sqrt{X_c^2+X_s^2}$ 服从瑞利分布，相位均匀分布且与包络独立。若再叠加一个正弦信号，包络变成莱斯分布——这就是「有直达分量」与「纯散射」的区别。`,
},
{
  id: 'q022', chapter: 'random', difficulty: '进阶', tags: ['莱斯分布'],
  question: String.raw`正弦波加窄带高斯噪声的合成包络服从（　）。`,
  options: ['瑞利分布', '莱斯分布（广义瑞利）', '正态分布', '指数分布'],
  answer: 1,
  explain: String.raw`存在确定正弦分量 $A$ 时，包络服从莱斯分布，含零阶修正贝塞尔函数 $I_0$。两个极限要记：$A\to0$ 退化为瑞利（信号淹没）；$A$ 很大时近似均值为 $A$ 的高斯。2ASK 包络检波的门限效应就源于此。`,
},
{
  id: 'q023', chapter: 'random', difficulty: '进阶', tags: ['高斯过程'],
  question: String.raw`高斯过程通过线性时不变系统后，输出（　）。`,
  options: [
    '一般不再是高斯过程',
    '仍是高斯过程',
    '一定是白噪声',
    '一定成为瑞利过程',
  ],
  answer: 1,
  explain: String.raw`高斯性对线性变换封闭：高斯输入 + 线性系统 = 高斯输出。所以整条接收链路（滤波器、相干解调）都可以只用均值和方差算到底。注意「线性」是前提，经过包络检波这种非线性环节后就不再是高斯了。`,
},
{
  id: 'q024', chapter: 'random', difficulty: '重点', tags: ['线性系统', '功率谱'],
  question: String.raw`平稳随机过程通过频响为 $H(f)$ 的线性系统，输出功率谱为（　）。`,
  options: [
    '$P_X(f)|H(f)|$',
    '$P_X(f)|H(f)|^2$',
    '$|P_X(f)|^2H(f)$',
    '$P_X(f)/|H(f)|^2$',
  ],
  answer: 1,
  explain: String.raw`$P_Y(f)=P_X(f)|H(f)|^2$。幅度平方是因为功率正比于幅度平方，且相位在功率里被消掉。求输出噪声功率就是对这个式子积分。记住它是「功率谱」的传递关系，不是「频谱」的。`,
},
{
  id: 'q025', chapter: 'random', difficulty: '基础', tags: ['平均功率'],
  question: String.raw`平稳过程 $X(t)$ 的均值为 $\mu$、方差为 $\sigma^2$，则 $R_X(0)$ 等于（　）。`,
  options: ['$\sigma^2$', '$\mu^2$', '$\mu^2+\sigma^2$', '$\mu\sigma$'],
  answer: 2,
  explain: String.raw`$R_X(0)=E[X^2]=\mu^2+\sigma^2$，即「直流功率 + 交流功率」。若均值为零则 $R(0)=\sigma^2$。这条在做噪声功率计算（尤其是有直流分量时）经常用到。`,
},
{
  id: 'q026', chapter: 'random', difficulty: '进阶', tags: ['随机过程', '功率谱'],
  question: String.raw`某平稳过程的功率谱为 $P(f)=\frac{n_0}{2}$（全频带平坦），其自相关函数在 $\tau\ne0$ 时（　）。`,
  options: ['等于 $n_0/2$', '等于零', '线性下降', '按 sinc 衰减'],
  answer: 1,
  explain: String.raw`平坦谱的傅里叶反变换是冲激，所以 $\tau\ne0$ 处自相关为零——这就是白噪声「任意不同时刻不相关」的数学表达。严格说白噪声是数学理想化，实际带限后旁瓣不为零，但在带宽远大于信号带宽时可近似为白。`,
},

/* ---------------- 第 4 章 信道 ---------------- */
{
  id: 'q027', chapter: 'channel', difficulty: '基础', tags: ['无失真传输'],
  question: String.raw`恒参信道无失真传输的条件是（　）。`,
  options: [
    '幅频特性为常数，相频特性为线性',
    '幅频特性为线性，相频特性为常数',
    '幅频特性和相频特性都为常数',
    '幅频特性平坦即可，相位无所谓',
  ],
  answer: 0,
  explain: String.raw`两个条件缺一不可：$|H(f)|=K$ 保证各频率等幅通过，$\varphi(f)=-2\pi ft_d$ 保证各频率等时延到达。只满足幅度会留下相位失真（色散），对数字信号直接造成码间串扰。等价说法是「群时延为常数」。`,
},
{
  id: 'q028', chapter: 'channel', difficulty: '进阶', tags: ['群时延'],
  question: String.raw`群时延 $\tau_g(f)$ 的定义是（　）。`,
  options: [
    '$-\dfrac{1}{2\pi}\dfrac{d\varphi(f)}{df}$',
    '$\dfrac{1}{2\pi}\dfrac{d\varphi(f)}{df}$',
    '$-\varphi(f)/(2\pi f)$',
    '$\dfrac{d|H(f)|}{df}$',
  ],
  answer: 0,
  explain: String.raw`$\tau_g=-\frac{1}{2\pi}\frac{d\varphi}{df}$，负号来自相位的滞后约定。物理意义是一个窄带包络通过信道的延迟。相频线性 ⇔ 群时延常数 ⇔ 无相位失真。考试常给一个带二次项的相位函数，让你说明存在群时延失真。`,
},
{
  id: 'q029', chapter: 'channel', difficulty: '重点', tags: ['相关带宽', '多径'],
  question: String.raw`多径信道的最大时延差 $\tau_{\max}=5\ \mu s$，其相关带宽约为（　）。`,
  options: ['5 kHz', '50 kHz', '200 kHz', '5 MHz'],
  answer: 2,
  explain: String.raw`$B_c\approx1/\tau_{\max}=1/(5\times10^{-6})=200$ kHz。判断衰落类型：信号带宽远小于 $B_c$ 是平坦衰落，大于 $B_c$ 是频率选择性衰落。这里 200 kHz 就是分界线，不是「信道能传 200 kHz」的意思。`,
},
{
  id: 'q030', chapter: 'channel', difficulty: '进阶', tags: ['频率选择性衰落'],
  question: String.raw`信号带宽 $B$ 与信道相关带宽 $B_c$ 满足什么关系时会出现频率选择性衰落？（　）`,
  options: ['$B\ll B_c$', '$B\approx B_c/2$', '$B>B_c$', '与 $B_c$ 无关'],
  answer: 2,
  explain: String.raw`$B>B_c$ 时不同频率分量经历不同的衰落，波形被扭曲，产生码间串扰，这就是频率选择性衰落。$B\ll B_c$ 时全带一起涨落，是平坦衰落，只需一个复数系数均衡。OFDM 的思路就是把宽带切成许多远小于 $B_c$ 的子带。`,
},
{
  id: 'q031', chapter: 'channel', difficulty: '基础', tags: ['多普勒'],
  question: String.raw`运动速度 $v$、波长 $\lambda$ 时，最大多普勒频移为（　）。`,
  options: ['$v\lambda$', '$v/\lambda$', '$\lambda/v$', '$v/(2\lambda)$'],
  answer: 1,
  explain: String.raw`$f_m=v/\lambda$，$\cos\theta=1$ 时取最大。相干时间 $T_c\approx1/f_m$，信道在 $T_c$ 内近似不变。速度越快，$f_m$ 越大，$T_c$ 越短，信道估计必须越频繁——这是高铁场景的难点。`,
},
{
  id: 'q032', chapter: 'channel', difficulty: '进阶', tags: ['分集', '均衡'],
  question: String.raw`关于分集与均衡，下列说法正确的是（　）。`,
  options: [
    '分集是事后补救，均衡是事前预防',
    '分集让深衰落不同时发生并合并，均衡用来消除已产生的码间串扰',
    '两者作用完全相同，可以互相替代',
    '分集只适用于恒参信道',
  ],
  answer: 1,
  explain: String.raw`分集是「预防」：多条独立路径同时深衰落的概率小，合并后平均掉衰落。均衡是「补救」：已经串扰了，用横向滤波器反卷积消除。两者常常一起用，不是替代关系。OFDM 则是从结构上把频率选择性衰落化成平坦衰落。`,
},
{
  id: 'q033', chapter: 'channel', difficulty: '进阶', tags: ['信道容量'],
  question: String.raw`连续信道容量 $C=B\log_2(1+S/n_0B)$ 中，当 $B\to\infty$ 时 $C$（　）。`,
  options: [
    '趋于无穷',
    '趋于零',
    '趋于有限值 $1.44S/n_0$',
    '线性增长',
  ],
  answer: 2,
  explain: String.raw`噪声功率 $N=n_0B$ 随带宽增长，抵消了带宽的收益，极限为 $C_\infty=1.44S/n_0$。这条说明「无限加带宽」不是万能药；同时也解释了低信噪比时容量几乎与带宽无关，只能靠提高信号功率或编码增益。`,
},
{
  id: 'q034', chapter: 'channel', difficulty: '基础', tags: ['信道分类'],
  question: String.raw`短波电离层反射信道属于（　）。`,
  options: ['恒参信道', '变参信道', '理想信道', '无噪声信道'],
  answer: 1,
  explain: String.raw`电离层随昼夜、季节变化，传输特性随机快速变化，属于典型的变参信道（乘性干扰 $k(t)$ 不可忽略），伴随严重多径与衰落。明线、电缆、光纤、视距微波属于恒参信道。判断依据是「信道特性是否随时间随机变化」。`,
}

);
