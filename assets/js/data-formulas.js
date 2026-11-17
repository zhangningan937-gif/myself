/* =========================================================
   公式速查：按主题分组，每条形如 {name, tex, note}
   ========================================================= */

window.FORMULA_GROUPS = [

{
  name: '信息量与信道容量',
  ch: 'intro',
  items: [
    { name: '信息量', tex: String.raw`I(x_i)=-\log_2 P(x_i)`, note: '单位 bit；必然事件信息量为 0。' },
    { name: '信源熵', tex: String.raw`H=-\sum_{i=1}^{M}P(x_i)\log_2 P(x_i)`, note: '平均每符号信息量，等概时最大。' },
    { name: '最大熵', tex: String.raw`H_{\max}=\log_2 M`, note: 'M 进制等概分布。' },
    { name: '码元与信息速率', tex: String.raw`R_b=R_B\log_2 M`, note: 'RB 单位 Baud，Rb 单位 bit/s。' },
    { name: '频带利用率', tex: String.raw`\eta=\frac{R_b}{B}`, note: '单位 bit/(s·Hz)，跨调制方式比较必须用它。' },
    { name: '香农公式', tex: String.raw`C=B\log_2\left(1+\frac{S}{N}\right)`, note: 'AWGN 信道容量，是上限不是保证。' },
    { name: '信噪比换算', tex: String.raw`(S/N)_{\rm dB}=10\lg\frac{S}{N}`, note: '30 dB 即 1000 倍。' },
    { name: 'Eb/N0 与 S/N', tex: String.raw`\frac{S}{N}=\frac{E_b}{N_0}\cdot\frac{R_b}{B}`, note: '比较不同调制前先统一到 Eb/N0。' },
    { name: '香农限', tex: String.raw`\frac{E_b}{N_0}\ge\ln 2\approx-1.59\ \rm dB`, note: '无误码传输的绝对下限。' },
    { name: '带宽趋于无穷的容量', tex: String.raw`C_\infty=\frac{S}{n_0}\log_2 e\approx1.44\frac{S}{n_0}`, note: '因为噪声功率随带宽增长。' },
  ],
},

{
  name: '信号与频谱',
  ch: 'signal',
  items: [
    { name: '傅里叶变换', tex: String.raw`S(f)=\int_{-\infty}^{\infty}s(t)e^{-j2\pi ft}dt`, note: '通信里统一用频率 f，不写角频率 ω。' },
    { name: '周期信号级数', tex: String.raw`s(t)=\sum_{n=-\infty}^{\infty}C_ne^{j2\pi nf_0t}`, note: '周期信号频谱是离散线谱，间隔 f0。' },
    { name: '矩形脉冲频谱', tex: String.raw`G(f)=\tau\,{\rm Sa}(\pi f\tau)`, note: '第一零点在 f=1/τ。' },
    { name: '帕塞瓦尔定理', tex: String.raw`E=\int s^2(t)dt=\int|S(f)|^2df`, note: '时域能量 = 频域能量。' },
    { name: '能量谱密度', tex: String.raw`E(f)=|S(f)|^2`, note: '丢掉相位，不能唯一还原波形。' },
    { name: '功率谱密度', tex: String.raw`P(f)=\lim_{T\to\infty}\frac{|S_T(f)|^2}{T}`, note: '周期/随机信号用功率谱描述。' },
    { name: '自相关', tex: String.raw`R(\tau)=\int s(t)s(t+\tau)dt`, note: 'R(0) 等于能量；偶函数，峰值在零时移。' },
    { name: '互相关', tex: String.raw`R_{12}(\tau)=\int s_1(t)s_2(t+\tau)dt`, note: '衡量两个波形的相似程度。' },
    { name: '维纳–辛钦定理', tex: String.raw`P_X(f)=\int_{-\infty}^{\infty}R_X(\tau)e^{-j2\pi f\tau}d\tau`, note: '自相关与功率谱是傅里叶变换对。' },
    { name: '卷积定理', tex: String.raw`s_1(t)*s_2(t)\ \longleftrightarrow\ S_1(f)S_2(f)`, note: '滤波 = 频域相乘。' },
    { name: '频移定理', tex: String.raw`s(t)e^{j2\pi f_0t}\ \longleftrightarrow\ S(f-f_0)`, note: '调制的数学本质。' },
    { name: '等效噪声带宽', tex: String.raw`B_{\rm eq}=\frac{1}{|H(f_0)|^2}\int_0^\infty|H(f)|^2df`, note: '算噪声功率时用。' },
  ],
},

{
  name: '随机过程',
  ch: 'random',
  items: [
    { name: '均值与方差', tex: String.raw`\mu_X(t)=E[X(t)],\quad \sigma_X^2(t)=E[(X-\mu_X)^2]`, note: '一阶、二阶中心矩。' },
    { name: '自相关函数', tex: String.raw`R_X(t_1,t_2)=E[X(t_1)X(t_2)]`, note: '广义平稳时只与 τ=t2−t1 有关。' },
    { name: '平均功率', tex: String.raw`P=R_X(0)=\mu_X^2+\sigma_X^2`, note: '直流功率加交流功率。' },
    { name: '线性系统输出谱', tex: String.raw`P_Y(f)=P_X(f)|H(f)|^2`, note: '全书最高频公式之一。' },
    { name: '输出均值', tex: String.raw`\mu_Y=\mu_XH(0)`, note: '直流增益乘输入均值。' },
    { name: '白噪声自相关', tex: String.raw`R_n(\tau)=\frac{n_0}{2}\delta(\tau)`, note: '不同时刻不相关，双边谱 n0/2。' },
    { name: '带限噪声功率', tex: String.raw`N=n_0B`, note: '双边谱 n0/2 通过带宽 B 的结果。' },
    { name: '瑞利分布', tex: String.raw`f(a)=\frac{a}{\sigma^2}e^{-a^2/(2\sigma^2)}`, note: '窄带高斯噪声的包络。' },
    { name: '莱斯分布', tex: String.raw`f(a)=\frac{a}{\sigma^2}e^{-(a^2+A^2)/(2\sigma^2)}I_0\!\left(\frac{aA}{\sigma^2}\right)`, note: '正弦加窄带噪声的包络。' },
    { name: '窄带过程分解', tex: String.raw`X(t)=X_c(t)\cos 2\pi f_ct-X_s(t)\sin 2\pi f_ct`, note: '同相与正交分量独立同分布。' },
  ],
},

{
  name: '信道',
  ch: 'channel',
  items: [
    { name: '无失真传输条件', tex: String.raw`|H(f)|=K,\quad \varphi(f)=-2\pi ft_d`, note: '幅度平坦 + 相位线性。' },
    { name: '群时延', tex: String.raw`\tau_g(f)=-\frac{1}{2\pi}\frac{d\varphi(f)}{df}`, note: '常数才无相位失真。' },
    { name: '相关带宽', tex: String.raw`B_c\approx\frac{1}{\tau_{\max}}`, note: 'B≪Bc 为平坦衰落，B>Bc 为频率选择性衰落。' },
    { name: '多普勒频移', tex: String.raw`f_d=\frac{v}{\lambda}\cos\theta`, note: '最大频偏 fm=v/λ。' },
    { name: '相干时间', tex: String.raw`T_c\approx\frac{1}{f_m}`, note: '信道在此时间内近似不变。' },
    { name: '连续信道容量', tex: String.raw`C=B\log_2\left(1+\frac{S}{n_0B}\right)`, note: '低信噪比时容量与带宽近似无关。' },
  ],
},

{
  name: '模拟调制',
  ch: 'analog',
  items: [
    { name: 'AM 表达式', tex: String.raw`s_{\rm AM}(t)=[A_0+m(t)]\cos 2\pi f_ct`, note: '要求 A0 ≥ |m(t)|max。' },
    { name: 'AM 带宽', tex: String.raw`B_{\rm AM}=2f_m`, note: '上下边带各占 fm。' },
    { name: 'AM 功率效率', tex: String.raw`\eta=\frac{m^2}{2+m^2}`, note: '满调幅 m=1 时仅 1/3。' },
    { name: 'DSB 表达式', tex: String.raw`s_{\rm DSB}(t)=m(t)\cos 2\pi f_ct`, note: '抑制载波，包络不再正比于消息。' },
    { name: 'SSB 带宽', tex: String.raw`B_{\rm SSB}=f_m`, note: '比 DSB 省一半带宽。' },
    { name: 'VSB 带宽', tex: String.raw`f_m<B_{\rm VSB}<2f_m`, note: '电视图像信号的标准选择。' },
    { name: 'FM 瞬时频率', tex: String.raw`f(t)=f_c+K_fm(t)`, note: 'PM 则是相位正比于 m(t)。' },
    { name: '调频指数', tex: String.raw`\beta=\frac{\Delta f}{f_m}`, note: '单音调制；与 fm 成反比。' },
    { name: '卡森带宽', tex: String.raw`B_{\rm FM}=2(\beta+1)f_m=2(\Delta f+f_m)`, note: 'β≫1 时约 2Δf。' },
    { name: 'DSB / SSB 制度增益', tex: String.raw`G_{\rm DSB}=2,\qquad G_{\rm SSB}=1`, note: '带宽不同，不能直接横比。' },
    { name: 'FM 制度增益', tex: String.raw`G_{\rm FM}\approx3\beta^2(\beta+1)\approx3\beta^3`, note: '大调频指数近似。' },
    { name: 'AM 制度增益', tex: String.raw`G_{\rm AM}=\frac{2m^2}{2+m^2}`, note: '包络检波，m=1 时为 2/3。' },
  ],
},

{
  name: '数字基带传输',
  ch: 'baseband',
  items: [
    { name: '无 ISI 时域条件', tex: String.raw`h(kT_s)=\begin{cases}1,&k=0\\0,&k\ne0\end{cases}`, note: '抽样点只有本码元贡献。' },
    { name: '奈奎斯特第一准则', tex: String.raw`\sum_{n}H\left(f+\frac{n}{T_s}\right)=T_s,\ |f|\le\frac{1}{2T_s}`, note: '频域搬移叠加为常数。' },
    { name: '理想低通码元速率', tex: String.raw`R_B=\frac{1}{T_s}=2B`, note: '频带利用率上限 2 Baud/Hz。' },
    { name: '升余弦带宽', tex: String.raw`B=\frac{(1+\alpha)R_B}{2}`, note: 'α 为滚降系数，0 到 1。' },
    { name: '滚降频带利用率', tex: String.raw`\eta=\frac{2}{1+\alpha}\ \rm Baud/Hz`, note: 'α=1 时降到 1。' },
    { name: '基带功率谱', tex: String.raw`P_s(f)=f_sP(1-P)|G_1-G_2|^2+\sum_n\left|f_s[PG_1+(1-P)G_2]\right|^2\delta(f-nf_s)`, note: '连续谱 + 离散谱。' },
    { name: '等概双极性 NRZ 谱', tex: String.raw`P_s(f)=T_s{\rm Sa}^2(\pi fT_s)`, note: '无离散谱，不能直接提取定时。' },
    { name: '部分响应 I 类', tex: String.raw`c_k=a_k+a_{k-1}`, note: '引入 1 个码元可控串扰，换取 2 Baud/Hz。' },
    { name: '部分响应成形波形', tex: String.raw`g(t)={\rm Sa}\!\left(\frac{\pi t}{T_s}\right)+{\rm Sa}\!\left(\frac{\pi(t-T_s)}{T_s}\right)`, note: '两个相隔 Ts 的 sinc 相加。' },
    { name: '预编码', tex: String.raw`b_k=a_k\oplus b_{k-1}`, note: '防止部分响应的误码传播。' },
    { name: '时域均衡输出', tex: String.raw`y(t)=\sum_{n=-N}^{N}c_nx(t-nT_s)`, note: '横向滤波器，迫零或 LMS 定抽头。' },
  ],
},

{
  name: '二进制带通调制',
  ch: 'bandpass',
  items: [
    { name: '2ASK 带宽', tex: String.raw`B_{2\rm ASK}=2R_B`, note: '基带带宽搬移成双边。' },
    { name: '2ASK 相干误码率', tex: String.raw`P_e=\frac12{\rm erfc}\left(\sqrt{\frac{r}{4}}\right)`, note: 'r 为输入信噪比。' },
    { name: '2ASK 包络检波误码率', tex: String.raw`P_e\approx\frac12e^{-r/4}`, note: '大信噪比近似，与相干差约 3 dB。' },
    { name: '2FSK 带宽', tex: String.raw`B_{2\rm FSK}=|f_2-f_1|+2R_B`, note: '正交最小间隔取 RB/2 或 RB。' },
    { name: '2FSK 相干误码率', tex: String.raw`P_e=\frac12{\rm erfc}\left(\sqrt{\frac{r}{2}}\right)`, note: '相同 r 下比 2ASK 好 3 dB。' },
    { name: '2FSK 包络检波误码率', tex: String.raw`P_e\approx\frac12e^{-r/2}`, note: '大信噪比近似。' },
    { name: '2PSK 误码率', tex: String.raw`P_e=\frac12{\rm erfc}\left(\sqrt{r}\right)=Q\left(\sqrt{2r}\right)`, note: '二进制调制中性能最好。' },
    { name: '2PSK 距离与 Eb/N0', tex: String.raw`P_e=Q\left(\sqrt{\frac{2E_b}{N_0}}\right)`, note: '比 2ASK/2FSK 好 3 dB。' },
    { name: '2DPSK 差分检测误码率', tex: String.raw`P_e=\frac12e^{-r}`, note: '无需载波恢复，比相干差 2–3 dB。' },
    { name: '2DPSK 极性比较法', tex: String.raw`P_e=2P_e'(1-P_e')`, note: "Pe' 为 2PSK 相干误码率，误码率约翻倍。" },
    { name: '2FSK 正交条件', tex: String.raw`|f_2-f_1|=\frac{n}{2T_s}\ ({\rm 相干}),\quad \frac{n}{T_s}\ ({\rm 非相干})`, note: '取 n=1 得最小间隔。' },
  ],
},

{
  name: '多进制与新型调制',
  ch: 'advanced',
  items: [
    { name: 'QPSK 符号率', tex: String.raw`R_s=\frac{R_b}{2}`, note: '每符号 2 bit。' },
    { name: 'QPSK 带宽', tex: String.raw`B=2R_s=R_b`, note: '频带利用率 1 bit/s/Hz。' },
    { name: 'QPSK 比特误码率', tex: String.raw`P_b=Q\left(\sqrt{\frac{2E_b}{N_0}}\right)`, note: '与 2PSK 相同，但速率翻倍。' },
    { name: 'M 进制频带利用率', tex: String.raw`\eta=\frac{\log_2M}{2}\ \ ({\rm 理想基带成形})`, note: '16QAM 为 2，64QAM 为 3。' },
    { name: 'MSK 调制指数', tex: String.raw`h=2\Delta fT_s=0.5`, note: '频偏 Δf=1/(4Ts)，相位连续。' },
    { name: 'MSK 主瓣宽度', tex: String.raw`B\approx1.5R_B`, note: '比 2PSK 的 2RB 窄。' },
    { name: 'OFDM 子载波间隔', tex: String.raw`\Delta f=\frac{1}{T}`, note: 'T 为符号周期，保证正交。' },
    { name: '循环前缀条件', tex: String.raw`T_{cp}>\tau_{\max}`, note: '吸收多径时延，消除 ISI/ICI。' },
    { name: 'M 进制最小距离（QAM）', tex: String.raw`d_{\min}=\sqrt{\frac{6E_s}{M-1}}`, note: '方格星座的近似结果。' },
  ],
},

{
  name: '抽样、量化与 PCM',
  ch: 'digit',
  items: [
    { name: '低通抽样定理', tex: String.raw`f_s\ge2f_H`, note: '奈奎斯特速率 2fH。' },
    { name: '带通抽样', tex: String.raw`f_s=\frac{2f_H}{n}=2B\left(1+\frac{k}{n}\right),\ n=\left\lfloor\frac{f_H}{B}\right\rfloor`, note: '极限可接近 2B；k=fH/B−n。' },
    { name: '混叠频率', tex: String.raw`f_{\rm alias}=|f_0-nf_s|\in[0,f_s/2]`, note: '高频折回低频，不可恢复。' },
    { name: '均匀量化间隔', tex: String.raw`\Delta=\frac{2V}{2^n}`, note: 'n 为编码位数。' },
    { name: '量化噪声功率', tex: String.raw`N_q=\frac{\Delta^2}{12}`, note: '误差在 ±Δ/2 内均匀分布。' },
    { name: '满幅正弦量化信噪比', tex: String.raw`(S/N_q)_{\rm dB}=6.02n+1.76`, note: '每加 1 位约 +6 dB。' },
    { name: 'A 律压缩', tex: String.raw`y=\frac{Ax}{1+\ln A},\quad \frac1A\le x\le1`, note: 'A=87.6；小信号段为线性。' },
    { name: 'PCM 速率', tex: String.raw`R_b=f_s\times n`, note: '语音 8000×8=64 kb/s。' },
    { name: 'ΔM 不过载条件', tex: String.raw`\left|\frac{dm}{dt}\right|_{\max}\le\Delta f_s`, note: '违反则产生斜率过载噪声。' },
    { name: 'ΔM 信噪比标度', tex: String.raw`(S/N_q)\propto f_s^3`, note: '抽样率翻倍约 +9 dB。' },
    { name: 'E1 速率', tex: String.raw`R_b=32\times8\times8000=2.048\ \rm Mb/s`, note: '30 路话音 + 同步 + 信令。' },
    { name: 'T1 速率', tex: String.raw`R_b=(24\times8+1)\times8000=1.544\ \rm Mb/s`, note: '北美标准，与 E1 不兼容。' },
  ],
},

{
  name: '最佳接收',
  ch: 'optimal',
  items: [
    { name: '匹配滤波器冲激响应', tex: String.raw`h(t)=s(T-t)`, note: '输入信号的时间反转加平移。' },
    { name: '匹配滤波器频响', tex: String.raw`H(f)=S^*(f)e^{-j2\pi fT}`, note: '相位与信号共轭，使各分量同相叠加。' },
    { name: '最大输出信噪比', tex: String.raw`\left(\frac{S}{N}\right)_{\max}=\frac{2E}{N_0}`, note: 'N0 为单边功率谱密度。' },
    { name: '匹配滤波输出波形', tex: String.raw`s_o(t)=R_s(t-T)`, note: '输出是输入的自相关函数。' },
    { name: '最小距离判决', tex: String.raw`\hat{s}=\arg\min_i\int_0^T[r(t)-s_i(t)]^2dt`, note: '高斯白噪声下的最大似然准则。' },
    { name: '二进制误码率与距离', tex: String.raw`P_e=Q\left(\frac{d}{\sqrt{2N_0}}\right)`, note: 'd 为两波形欧氏距离，越大越好。' },
    { name: '2PSK 最佳误码率', tex: String.raw`P_e=Q\left(\sqrt{\frac{2E_b}{N_0}}\right)`, note: 'd=2√Eb。' },
    { name: '2FSK 最佳误码率', tex: String.raw`P_e=Q\left(\sqrt{\frac{E_b}{N_0}}\right)`, note: '正交波形，d=√(2Eb)。' },
  ],
},

{
  name: '差错控制编码',
  ch: 'coding',
  items: [
    { name: '码率', tex: String.raw`R=\frac{k}{n}=1-\frac{r}{n}`, note: 'r 为监督位数。' },
    { name: '最小距离界', tex: String.raw`d_{\min}\ge e+1,\quad \ge2t+1,\quad \ge e+t+1`, note: '分别对应检错、纠错、混合。' },
    { name: '生成矩阵', tex: String.raw`\mathbf{c}=\mathbf{m}\mathbf{G},\quad \mathbf{G}=[\mathbf{I}_k|\mathbf{P}]`, note: '系统码前 k 位为信息。' },
    { name: '校验关系', tex: String.raw`\mathbf{G}\mathbf{H}^T=\mathbf{0},\quad \mathbf{S}=\mathbf{r}\mathbf{H}^T`, note: '伴随式只与错误图样有关。' },
    { name: '汉明码参数', tex: String.raw`n=2^m-1,\quad k=n-m,\quad d_{\min}=3`, note: '纠 1 位错、检 2 位错。' },
    { name: '循环码生成多项式', tex: String.raw`g(x)\ |\ (x^n+1),\quad \deg g=r`, note: '所有码字都是 g(x) 的倍式。' },
    { name: '系统循环码编码', tex: String.raw`c(x)=x^rm(x)+\left[x^rm(x)\bmod g(x)\right]`, note: '编码即一次模 2 除法。' },
    { name: 'CRC 检错条件', tex: String.raw`r(x)\bmod g(x)=0`, note: '余数为零判为无错，只检不纠。' },
    { name: '卷积码状态数', tex: String.raw`2^{k(N-1)}`, note: 'N 为约束长度，决定维特比复杂度。' },
    { name: '卷积码渐近误码率', tex: String.raw`P_e\approx\frac12{\rm erfc}\left(\sqrt{\frac{d_fE_b}{2N_0}}\right)`, note: 'df 为自由距离，越大越好。' },
  ],
},

{
  name: '伪随机序列与同步',
  ch: 'pn',
  items: [
    { name: '正交条件', tex: String.raw`\sum_{i=1}^{n}u_iv_i=0`, note: '等长码组逐位相乘求和为零。' },
    { name: 'Hadamard 递归', tex: String.raw`H_{2n}=\begin{bmatrix}H_n&H_n\\H_n&-H_n\end{bmatrix}`, note: '行向量构成 Walsh 正交码。' },
    { name: 'm 序列周期', tex: String.raw`N=2^n-1`, note: 'n 级线性反馈移位寄存器。' },
    { name: 'm 序列自相关', tex: String.raw`R(\tau)=1\ (\tau=0),\quad -\frac1N\ (\tau\ne0)`, note: '归一化后双值，主峰尖锐。' },
    { name: 'm 序列平衡性', tex: String.raw`N_1=\frac{N+1}{2},\quad N_0=\frac{N-1}{2}`, note: '一个周期内 1 比 0 多一个。' },
    { name: 'Gold 序列互相关', tex: String.raw`\{-1,\,-t,\,t-2\},\quad t=2^{\lfloor(n+2)/2\rfloor}+1`, note: 'n 为奇数时 t=2^{(n+1)/2}+1。' },
    { name: '处理增益', tex: String.raw`G_p=10\lg\frac{R_c}{R_b}\ \rm dB`, note: '扩频增益，码片速率与比特率之比。' },
    { name: '巴克码旁瓣', tex: String.raw`|R(\tau)|\le1,\quad R(0)=n`, note: '长度 13 的巴克码旁瓣不超过 1。' },
    { name: '平方环提取载波', tex: String.raw`s^2(t)=\frac{A^2}{2}\left[1+\cos(4\pi f_ct+2\varphi)\right]`, note: '二倍频后二分频，存在相位模糊。' },
    { name: '相干解调相位损失', tex: String.raw`y(t)=\frac12m(t)\cos\Delta\varphi`, note: 'Δφ=90° 时输出为零。' },
  ],
},

];
