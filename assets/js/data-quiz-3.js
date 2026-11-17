/* =========================================================
   题库 3/4：第 8–9 章（新型调制、模拟信号数字传输）
   ========================================================= */

window.QUIZ_BANK.push(

/* ---------------- 第 8 章 新型调制 ---------------- */
{
  id: 'q069', chapter: 'advanced', difficulty: '基础', tags: ['QPSK', '频带利用率'],
  question: String.raw`QPSK 的频带利用率为（　）。`,
  options: ['0.5 bit/(s·Hz)', '1 bit/(s·Hz)', '2 bit/(s·Hz)', '4 bit/(s·Hz)'],
  answer: 1,
  explain: String.raw`QPSK 每符号带 2 bit，符号率 $R_s=R_b/2$，带宽 $B=2R_s=R_b$，所以 $\eta=R_b/B=1$，是 2PSK 的两倍。它的比特误码率与 2PSK 相同，相当于「免费」提速一倍——这是 QPSK 最重要的价值。`,
},
{
  id: 'q070', chapter: 'advanced', difficulty: '进阶', tags: ['QPSK', '符号率'],
  question: String.raw`某 QPSK 系统比特率为 10 Mb/s，其符号率为（　）。`,
  options: ['2.5 Mbaud', '5 Mbaud', '10 Mbaud', '20 Mbaud'],
  answer: 1,
  explain: String.raw`$R_s=R_b/\log_2M=10/2=5$ Mbaud。符号率减半意味着同样带宽下能传两倍比特。带通带宽 $B=2R_s=10$ MHz，恰好等于比特率——所以 QPSK 的 $\eta=1$ bit/(s·Hz)。`,
},
{
  id: 'q071', chapter: 'advanced', difficulty: '进阶', tags: ['OQPSK', '相位跳变'],
  question: String.raw`OQPSK 相比 QPSK，最大相位跳变从 $180^\circ$ 降到（　）。`,
  options: ['$45^\circ$', '$90^\circ$', '$135^\circ$', '$0^\circ$'],
  answer: 1,
  explain: String.raw`OQPSK 把 Q 路延迟半个符号 $T_s/2$，I、Q 不会同时跳变，所以相位一次最多变 $90^\circ$。好处是包络起伏小、经非线性功放后频谱旁瓣低。代价是需要精确的半符号定时，且差分检测变困难。`,
},
{
  id: 'q072', chapter: 'advanced', difficulty: '进阶', tags: ['π/4-QPSK'],
  question: String.raw`π/4-QPSK 相对 OQPSK 的优势是（　）。`,
  options: [
    '频带利用率更高',
    '可以用差分检测，同时包络起伏较小',
    '完全消除码间串扰',
    '不需要任何同步',
  ],
  answer: 1,
  explain: String.raw`π/4-QPSK 在两套相差 $45^\circ$ 的星座间交替，相位跳变只能取 $\pm45^\circ$ 或 $\pm135^\circ$，包络起伏介于 QPSK 与 OQPSK 之间；因为星座交替，相位差仍可判，所以支持差分检测。频带利用率与 QPSK 相同（都是 1 bit/(s·Hz)）。`,
},
{
  id: 'q073', chapter: 'advanced', difficulty: '基础', tags: ['MSK', '调制指数'],
  question: String.raw`MSK 的调制指数 $h$ 为（　）。`,
  options: ['0.25', '0.5', '1', '2'],
  answer: 1,
  explain: String.raw`$h=2\Delta fT_s=0.5$，即频偏 $\Delta f=1/(4T_s)$。$h=0.5$ 是「最小频移」的由来：在保证两频率正交的前提下取最小间隔，因此频谱最紧凑。MSK 相位连续、恒包络，主瓣约 $1.5R_B$。`,
},
{
  id: 'q074', chapter: 'advanced', difficulty: '基础', tags: ['GMSK', 'GSM'],
  question: String.raw`GSM 系统采用的调制方式是（　）。`,
  options: ['QPSK', 'GMSK', '16QAM', 'OFDM'],
  answer: 1,
  explain: String.raw`GSM 用 GMSK，高斯滤波器 $BT_s=0.3$。选它的原因是旁瓣低、邻道干扰小，且恒包络可用高效非线性功放，省手机电量。代价是引入可控 ISI、误码率略差，用均衡和信道编码补回来。`,
},
{
  id: 'q075', chapter: 'advanced', difficulty: '基础', tags: ['16QAM', '频带利用率'],
  question: String.raw`16QAM 的理论频带利用率为（　）。`,
  options: ['1 bit/(s·Hz)', '2 bit/(s·Hz)', '3 bit/(s·Hz)', '4 bit/(s·Hz)'],
  answer: 1,
  explain: String.raw`每符号 4 bit，$R_s=R_b/4$，带通带宽 $B=2R_s=R_b/2$，所以 $\eta=2$ bit/(s·Hz)。64QAM 是 3，256QAM 是 4。代价是星座点变密、最小距离变小，同样误码率需要更高信噪比（16QAM 比 QPSK 差约 4 dB）。`,
},
{
  id: 'q076', chapter: 'advanced', difficulty: '进阶', tags: ['QAM', 'PSK 对比'],
  question: String.raw`$M>4$ 时，QAM 比同阶 PSK 性能好，主要原因是（　）。`,
  options: [
    'QAM 的带宽更窄',
    'QAM 星座点可以更均匀地铺满平面，最小距离更大',
    'QAM 不需要载波同步',
    'QAM 是恒包络调制',
  ],
  answer: 1,
  explain: String.raw`PSK 把所有点放在一个圆上，点数一多就挤在一起；QAM 用方格排布，能更有效地利用二维平面，同样平均功率下最小距离更大。16QAM 比 16PSK 好约 4 dB。这也是高阶系统清一色用 QAM 的原因。`,
},
{
  id: 'q077', chapter: 'advanced', difficulty: '重点', tags: ['OFDM', '循环前缀'],
  question: String.raw`OFDM 中循环前缀（CP）的作用是（　）。`,
  options: [
    '提高发射功率',
    '吸收多径时延，消除 ISI 与 ICI',
    '降低峰均比',
    '实现载波同步',
  ],
  answer: 1,
  explain: String.raw`只要 $T_{cp}>\tau_{\max}$，多径造成的线性卷积就变成循环卷积，FFT 后每个子载波只乘一个复数，符号间干扰被完全吸收。代价是损失 $N_{cp}/(N+N_{cp})$ 的速率。注意 CP 不能降低 PAPR，反而略微增加开销。`,
},
{
  id: 'q078', chapter: 'advanced', difficulty: '进阶', tags: ['OFDM', 'PAPR'],
  question: String.raw`OFDM 系统最主要的问题之一是（　）。`,
  options: [
    '频带利用率太低',
    '峰均功率比（PAPR）高，对功放线性度要求高',
    '无法对抗多径',
    '不能使用 FFT',
  ],
  answer: 1,
  explain: String.raw`$N$ 个子载波同相叠加时瞬时峰值可达平均值的 $N$ 倍，PAPR 很高，功放必须留大余量否则产生非线性失真和带外辐射。对策有削峰、预失真、选择性映射等。5G 上行改用 DFT-s-OFDM 就是为了降 PAPR、省手机电量。`,
},

/* ---------------- 第 9 章 模拟信号数字传输 ---------------- */
{
  id: 'q079', chapter: 'digit', difficulty: '基础', tags: ['抽样定理'],
  question: String.raw`最高频率为 4 kHz 的带限信号，无失真恢复所需的最低抽样率为（　）。`,
  options: ['2 kHz', '4 kHz', '8 kHz', '16 kHz'],
  answer: 2,
  explain: String.raw`$f_s\ge2f_H=8$ kHz。这就是电话 PCM 取 8 kHz 的来源。实际系统会略高于 2 倍（留过渡带），因为理想抗混叠滤波器不可实现——工程上常说取 $2.2\sim2.5$ 倍。`,
},
{
  id: 'q080', chapter: 'digit', difficulty: '进阶', tags: ['混叠'],
  question: String.raw`频率 7 kHz 的信号以 8 kHz 抽样，恢复后出现的假信号频率为（　）。`,
  options: ['1 kHz', '3 kHz', '7 kHz', '15 kHz'],
  answer: 0,
  explain: String.raw`混叠频率 $|f_0-nf_s|=|7-8|=1$ kHz，落在 $[0,f_s/2]$ 内。这就是「采样率不够时高频变低频」的现象，且**不可逆**——原信号已被折叠，任何滤波器都救不回来。所以采样前必须加抗混叠低通。`,
},
{
  id: 'q081', chapter: 'digit', difficulty: '进阶', tags: ['带通抽样'],
  question: String.raw`最高频率 10 MHz、带宽 1 MHz 的带通信号，采用带通抽样时最低抽样率约为（　）。`,
  options: ['1 MHz', '2 MHz', '10 MHz', '20 MHz'],
  answer: 1,
  explain: String.raw`$f_H/B=10$ 为整数，取 $n=10$、$k=0$，$f_s=2f_H/n=2B=2$ MHz，远低于 $2f_H=20$ MHz。一般式为 $f_s=2f_H/n$，$n=\lfloor f_H/B\rfloor$，只要 $f_s\ge2B$ 就不混叠。这是软件无线电「中频直接采样」的理论依据。`,
},
{
  id: 'q082', chapter: 'digit', difficulty: '基础', tags: ['量化间隔'],
  question: String.raw`量化范围 $[-V,V]$、编码位数 $n=8$，均匀量化的量化间隔为（　）。`,
  options: ['$V/128$', '$V/256$', '$2V/255$', '$2V/256$'],
  answer: 3,
  explain: String.raw`$\Delta=2V/2^n=2V/256$。注意分母是 $2^n$ 而不是 $2^n-1$（均匀量化是等分区间，不是等分电平）。$n$ 每加 1，$\Delta$ 减半，量化噪声降到 1/4，信噪比提高 6 dB。`,
},
{
  id: 'q083', chapter: 'digit', difficulty: '基础', tags: ['量化噪声'],
  question: String.raw`量化间隔为 $\Delta$ 的均匀量化器，其量化噪声功率为（　）。`,
  options: ['$\Delta^2/12$', '$\Delta^2/6$', '$\Delta^2/3$', '$\Delta^2$'],
  answer: 0,
  explain: String.raw`量化误差在 $[-\Delta/2,\Delta/2]$ 内均匀分布，方差 $=\Delta^2/12$。这是全书最常用的噪声公式之一，PCM 信噪比、ΔM 分析都从它出发。记住系数 1/12，来源是均匀分布方差公式 $(b-a)^2/12$。`,
},
{
  id: 'q084', chapter: 'digit', difficulty: '进阶', tags: ['量化信噪比'],
  question: String.raw`8 位均匀量化、满幅正弦输入，量化信噪比约为（　）。`,
  options: ['38 dB', '44 dB', '50 dB', '56 dB'],
  answer: 2,
  explain: String.raw`$6.02n+1.76=6.02\times8+1.76=49.9\approx50$ dB。每加 1 位 +6 dB，这个规律要能口算：12 位约 74 dB，16 位约 98 dB。注意这是「满幅正弦」的结果，小信号时信噪比会低很多——这正是要用 A 律压扩的原因。`,
},
{
  id: 'q085', chapter: 'digit', difficulty: '基础', tags: ['13折线', '编码'],
  question: String.raw`A 律 13 折线 PCM 8 位编码中，段落码占（　）位。`,
  options: ['1', '2', '3', '4'],
  answer: 2,
  explain: String.raw`8 位 = 极性码 1 位 + 段落码 3 位 + 段内码 4 位。3 位段落码正好对应正半轴 8 段（000–111），4 位段内码对应每段 16 个量化级。这个拆分是必背的，计算题全靠它。`,
},
{
  id: 'q086', chapter: 'digit', difficulty: '进阶', tags: ['13折线', '量化间隔'],
  question: String.raw`A 律 13 折线中，第 8 段的量化间隔是第 1 段的（　）倍。`,
  options: ['8 倍', '16 倍', '32 倍', '64 倍'],
  answer: 3,
  explain: String.raw`各段量化间隔为 1、1、2、4、8、16、32、64（以最小间隔 $\Delta_1=1/2048$ 为单位），第 8 段是第 1 段的 64 倍。起点电平则是 0、16、32、64、128、256、512、1024，从第 3 段起翻倍。大信号间隔大、小信号间隔小，这就是非均匀量化的本质。`,
},
{
  id: 'q087', chapter: 'digit', difficulty: '基础', tags: ['PCM', '速率'],
  question: String.raw`语音信号按 8 kHz 抽样、8 位 PCM 编码，其比特率为（　）。`,
  options: ['8 kb/s', '32 kb/s', '64 kb/s', '128 kb/s'],
  answer: 2,
  explain: String.raw`$8000\times8=64$ kb/s，这是一路数字电话的标准速率，也是 E1 一个时隙的容量。若改用 4 位 ADPCM，可压到 32 kb/s 而保持接近的话音质量，这就是压缩编码的价值。`,
},
{
  id: 'q088', chapter: 'digit', difficulty: '重点', tags: ['ΔM', '过载'],
  question: String.raw`增量调制（ΔM）不发生斜率过载的条件是（　）。`,
  options: [
    '$|dm/dt|_{\max}\le\Delta f_s$',
    '$|dm/dt|_{\max}\ge\Delta f_s$',
    '$f_s\ge2f_H$',
    '$\Delta\le2V/2^n$',
  ],
  answer: 0,
  explain: String.raw`阶梯每 $T_s$ 最多变化 $\Delta$，所以最大跟踪斜率是 $\Delta f_s$。信号斜率超过它就「跟不上」，产生斜率过载噪声。对策是提高 $f_s$ 或增大 $\Delta$；但 $\Delta$ 太大会增大颗粒噪声——这是 ΔM 的核心折中。`,
},
{
  id: 'q089', chapter: 'digit', difficulty: '进阶', tags: ['ΔM', '信噪比'],
  question: String.raw`ΔM 的量化信噪比随抽样率提高而改善，抽样率每翻一倍约改善（　）。`,
  options: ['3 dB', '6 dB', '9 dB', '12 dB'],
  answer: 2,
  explain: String.raw`ΔM 信噪比正比于 $f_s^3$，所以抽样率翻倍（$2^3=8$ 倍）约改善 9 dB。对比 PCM：每加 1 位改善 6 dB。这就是「ΔM 用带宽换精度」的定量表达，也是它抽样率必须远高于 $2f_H$ 的原因。`,
},
{
  id: 'q090', chapter: 'digit', difficulty: '基础', tags: ['E1', 'TDM'],
  question: String.raw`E1 一次群的比特率为 2.048 Mb/s，其帧结构中时隙数为（　）。`,
  options: ['24', '30', '32', '64'],
  answer: 2,
  explain: String.raw`32 个时隙 × 8 bit × 8000 帧/秒 = 2.048 Mb/s。其中 TS0 传帧同步，TS16 传信令，其余 30 个时隙传话音，所以叫「30/32 路」。T1 是 24 路、1.544 Mb/s，别混。`,
}

);
