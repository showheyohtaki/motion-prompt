# 简体中文翻译依据与审阅说明

本译稿直接基于原仓库的英文与日文内容编写，未复制其他中文分叉。原作者的名称、解释、请求示例和实现是逐项语义依据；所有既有日英字段、编号、标签与动画参数保留。

专业中文名称存在地区与软件差异，下表不表示每项都有唯一标准译名。外部资料仅用于核对概念或具体已有译法，没有复制正文、图片或字体。没有直接中文依据的项目保留英文对照供审阅。

## 外部核对资料

- [A](https://ant.design/components/overview-cn/)
- [J](https://helpx.adobe.com/cn/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html)
- [M](https://helpx.adobe.com/cn/after-effects/desktop/work-with-transparency-and-compositing/work-with-track-mattes-and-traveling-mattes/track-mattes-and-traveling-mattes.html)
- [C](https://helpx.adobe.com/cn/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html)
- [L](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/Lazy_loading)
- [S](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/scroll-behavior)
- [B](https://helpx.adobe.com/cn/lightroom/web/edit-photos/apply-effects/apply-lens-blur.html)
- [G](https://blog.adobe.com/en/publish/2021/08/09/how-to-use-natural-light-to-enhance-your-photography)

A 是 UI 组件中文命名参考；J 核对 J/L 剪辑；M 核对遮罩概念；C 核对相机移动与变焦；L/S 核对懒加载与平滑滚动；B 核对散景；G 核对黄金与蓝调时刻（英文概念依据）。这些来源不意味着认可下表所有中文选择。

## 逐项记录

原作者依据均链接至对应分类的 `meta.json`，可按 `no` 核对名称和规格。

| 编号 | 英文 | 中文 | 核对依据 / 审阅备注 |
|---|---|---|---|
| 001 | Pop-in | 弹性入场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=01；描述性译名；也可保留 Pop-in |
| 002 | Stagger | 交错动画 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=02 |
| 003 | Burst | 放射爆发 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=03；描述性译名；Burst 也常直接保留 |
| 004 | Line draw | 线条描绘 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=04 |
| 005 | Mask reveal | 遮罩显现 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=05；[M](https://helpx.adobe.com/cn/after-effects/desktop/work-with-transparency-and-compositing/work-with-track-mattes-and-traveling-mattes/track-mattes-and-traveling-mattes.html) |
| 006 | Typewriter | 打字机效果 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=06 |
| 007 | Count-up | 数字递增 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=07 |
| 008 | Kinetic typography | 动态字体 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=08；亦可称动态文字或动态排版 |
| 009 | Easing | 缓动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=09 |
| 010 | Overshoot | 过冲回弹 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=10 |
| 011 | Squash & stretch | 挤压与拉伸 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=11 |
| 012 | Shape morph | 形状变形 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=12 |
| 013 | Liquid motion | 液态动效 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=13；亦可称液体动画 |
| 014 | Motion trail | 运动拖尾 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=14 |
| 015 | Particles | 粒子效果 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=15 |
| 016 | Parallax | 视差 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=16 |
| 017 | Mask transition | 遮罩转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=17；[M](https://helpx.adobe.com/cn/after-effects/desktop/work-with-transparency-and-compositing/work-with-track-mattes-and-traveling-mattes/track-mattes-and-traveling-mattes.html) |
| 018 | Shape transition | 图形转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=18 |
| 019 | Liquid transition | 液态转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=19 |
| 020 | Zoom through | 穿越缩放 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=20；描述性译名；保留 Zoom through 对照 |
| 021 | Flip | 翻转 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=21 |
| 022 | Light sweep | 扫光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=22 |
| 023 | Glitch | 故障效果 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=23 |
| 024 | Impact shake | 冲击震动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/motion/meta.json) no=24 |
| 025 | Pan | 水平摇镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=01；[C](https://helpx.adobe.com/cn/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) |
| 026 | Tilt | 垂直摇镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=02；[C](https://helpx.adobe.com/cn/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) |
| 027 | Dolly in | 推镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=03；[C](https://helpx.adobe.com/cn/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) |
| 028 | Zoom in | 变焦推近 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=04；[C](https://helpx.adobe.com/cn/after-effects/desktop/work-with-layers/camera-layer/cameras-lights-points-interest.html) |
| 029 | Tracking shot | 跟拍 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=05 |
| 030 | Orbit (Arc shot) | 环绕镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=06 |
| 031 | Crane up | 升镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=07 |
| 032 | Dolly zoom (Vertigo) | 滑动变焦 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=08；滑动变焦 / 希区柯克变焦 / Dolly zoom 并存 |
| 033 | Rack focus | 焦点转移 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=09 |
| 034 | Handheld | 手持镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=10 |
| 035 | FPV drone shot | FPV 穿越机镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=11 |
| 036 | Dutch angle | 荷兰角 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=12；亦称倾斜镜头、荷兰式镜头 |
| 037 | Slow motion | 慢动作 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=13 |
| 038 | Speed ramp | 速度渐变 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=14 |
| 039 | Time-lapse | 延时摄影 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=15 |
| 040 | Freeze frame | 定格 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=16 |
| 041 | Jump cut | 跳切 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=17 |
| 042 | Match cut | 匹配剪辑 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=18 |
| 043 | Whip pan | 甩镜头转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=19；亦称甩镜转场 |
| 044 | Cross dissolve | 交叉溶解 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=20 |
| 045 | Wipe | 划像转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=21 |
| 046 | Smash cut | 突切 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=22；突切 / 猛切 / Smash cut 并存 |
| 047 | J-cut | J 型剪辑 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=23；[J](https://helpx.adobe.com/cn/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html) |
| 048 | L-cut | L 型剪辑 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/camera/meta.json) no=24；[J](https://helpx.adobe.com/cn/premiere/desktop/edit-projects/trim-clips/perform-j-cuts-and-l-cuts.html) |
| 049 | Modal dialog | 模态对话框 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=01；[A](https://ant.design/components/overview-cn/) |
| 050 | Drawer (Off-canvas) | 抽屉面板 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=02；[A](https://ant.design/components/overview-cn/) |
| 051 | Bottom sheet | 底部面板 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=03；[A](https://ant.design/components/overview-cn/)；底部弹出层 / Bottom sheet 并存 |
| 052 | Accordion | 折叠面板 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=04；[A](https://ant.design/components/overview-cn/) |
| 053 | Dropdown (select) | 下拉选择框 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=05；[A](https://ant.design/components/overview-cn/) |
| 054 | Tooltip | 文字提示 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=06；[A](https://ant.design/components/overview-cn/) |
| 055 | Popover | 气泡卡片 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=07；[A](https://ant.design/components/overview-cn/) |
| 056 | Toast notification | 轻提示 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=08；[A](https://ant.design/components/overview-cn/)；轻提示 / Toast 并存 |
| 057 | Tabs | 标签页 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=09；[A](https://ant.design/components/overview-cn/) |
| 058 | Carousel | 轮播图 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=10；[A](https://ant.design/components/overview-cn/)；轮播图；部分库使用走马灯 |
| 059 | Toggle switch | 开关 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=11；[A](https://ant.design/components/overview-cn/) |
| 060 | Segmented control | 分段控制器 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=12；[A](https://ant.design/components/overview-cn/) |
| 061 | Filter chips | 筛选标签 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=13；[A](https://ant.design/components/overview-cn/) |
| 062 | Range slider | 范围滑块 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=14；[A](https://ant.design/components/overview-cn/) |
| 063 | Stepper (+/−) | 步进器 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=15；[A](https://ant.design/components/overview-cn/)；步进器；部分库用数字输入框 |
| 064 | Pagination | 分页 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=16；[A](https://ant.design/components/overview-cn/) |
| 065 | Hamburger menu | 汉堡菜单 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=17；[A](https://ant.design/components/overview-cn/) |
| 066 | Breadcrumbs | 面包屑导航 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=18；[A](https://ant.design/components/overview-cn/) |
| 067 | Mega menu | 巨型菜单 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=19；[A](https://ant.design/components/overview-cn/)；大型下拉菜单 / Mega menu 并存 |
| 068 | Step indicator | 步骤指示器 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=20；[A](https://ant.design/components/overview-cn/) |
| 069 | Skeleton screen | 骨架屏 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=21；[A](https://ant.design/components/overview-cn/) |
| 070 | Spinner | 加载转圈 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=22；[A](https://ant.design/components/overview-cn/)；加载转圈；部分库用加载中或 Spinner |
| 071 | Badge | 徽标 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=23；[A](https://ant.design/components/overview-cn/) |
| 072 | Empty state | 空状态 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/ui/meta.json) no=24；[A](https://ant.design/components/overview-cn/) |
| 073 | Parallax scrolling | 视差滚动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=01 |
| 074 | Fade-in on scroll | 滚动淡入 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=02 |
| 075 | Sticky header | 吸顶页头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=03 |
| 076 | Pinning | 滚动固定 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=04；滚动固定；保留 Pinning 对照 |
| 077 | Horizontal scroll | 横向滚动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=05 |
| 078 | Scroll snap | 滚动吸附 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=06 |
| 079 | Scroll progress bar | 滚动进度条 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=07 |
| 080 | Highlighter animation | 荧光笔标记动画 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=08；描述性译名；亦可称高亮标记动画 |
| 081 | Hover lift | 悬停抬升 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=09 |
| 082 | Image zoom on hover | 悬停图片放大 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=10 |
| 083 | Cursor follower | 光标跟随 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=11 |
| 084 | Magnetic button | 磁吸按钮 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=12 |
| 085 | Ripple effect | 涟漪效果 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=13 |
| 086 | Underline animation | 下划线动画 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=14 |
| 087 | Before/after slider | 前后对比滑块 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=15 |
| 088 | Exit-intent popup | 离站挽留弹窗 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=16；描述性译名；Exit-intent popup 保留对照 |
| 089 | Preloader | 预加载画面 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=17 |
| 090 | Lazy loading | 懒加载 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=18；[L](https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/Lazy_loading) |
| 091 | Infinite scroll | 无限滚动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=19 |
| 092 | Page transition | 页面转场 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=20 |
| 093 | Smooth scroll | 平滑滚动 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=21；[S](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference/Properties/scroll-behavior) |
| 094 | Marquee | 跑马灯 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=22；跑马灯与轮播图区分，保留 Marquee |
| 095 | Animated gradient | 动态渐变 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=23 |
| 096 | Floating animation | 悬浮动画 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/lp/meta.json) no=24 |
| 097 | Backlighting | 逆光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=01 |
| 098 | Rim light | 轮廓光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=02 |
| 099 | Silhouette | 剪影 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=03 |
| 100 | Split lighting | 分割光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=04；分割光 / 分割式布光并存 |
| 101 | Rembrandt lighting | 伦勃朗光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=05 |
| 102 | Butterfly lighting | 蝴蝶光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=06 |
| 103 | Golden hour | 黄金时刻 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=07；[G](https://blog.adobe.com/en/publish/2021/08/09/how-to-use-natural-light-to-enhance-your-photography) |
| 104 | Blue hour | 蓝调时刻 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=08；[G](https://blog.adobe.com/en/publish/2021/08/09/how-to-use-natural-light-to-enhance-your-photography) |
| 105 | Bokeh | 散景 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=09；[B](https://helpx.adobe.com/cn/lightroom/web/edit-photos/apply-effects/apply-lens-blur.html) |
| 106 | Tilt-shift | 移轴效果 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=10 |
| 107 | Long exposure | 长曝光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=11 |
| 108 | Panning shot | 追随拍摄 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=12；追随拍摄 / 追焦摄影并存 |
| 109 | Lens flare | 镜头眩光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=13 |
| 110 | Fisheye lens | 鱼眼镜头 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=14 |
| 111 | Chromatic aberration | 色差 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=15 |
| 112 | Vignette | 暗角 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=16 |
| 113 | High-key | 高调 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=17 |
| 114 | Low-key | 低调 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=18 |
| 115 | Black and white | 黑白 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=19 |
| 116 | Duotone | 双色调 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=20 |
| 117 | Teal and orange | 青橙色调 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=21 |
| 118 | Film grain | 胶片颗粒 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=22 |
| 119 | Light leak | 漏光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=23 |
| 120 | Double exposure | 双重曝光 | [原作者](https://github.com/showheyohtaki/motion-prompt/blob/main/packs/photo/meta.json) no=24 |

## 数值与素材边界

中文规格逐行保留原文参数。自动数字对照中的八处差异是英文拼写数字、中文数字、8 字形表达，以及一句重复区间的合并，已人工核对；未调整任何时间、距离、角度、曲线或色值。

画布只翻译说明、按钮和演示文字。技术单位、REC、O 孔洞等形状示例、品牌与专名保留原文。历史视频、图片和 X 原帖保持发布时语言。本站自己撰写的案例介绍已翻译，未采集或翻译第三方帖子正文。

本地浏览器验证与截图检查不等于领域专家逐项审定。上表列出的多译法请维护者在审阅时确认。
