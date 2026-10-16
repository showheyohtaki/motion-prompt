<!-- 由 tools/build.mjs 根据 meta.json 生成。请编辑 meta.json，不要直接修改本文件。 -->

# 落地页与网页效果

24 个术语 · #073–096 · 分类 `lp` · 语言: [English](README.md) / [日本語](README.ja.md)

找到名称后直接告诉 AI。补充时长、幅度和运动对象，可以更接近你想要的效果。

## 滚动效果

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#073](https://showheyohtaki.github.io/motion-prompt/#073) | **视差滚动** | Parallax scrolling | 滚动时背景层比内容移动得慢 | 让首屏背景以滚动距离的 0.3× 移动，形成视差滚动。 |
| [#074](https://showheyohtaki.github.io/motion-prompt/#074) | **滚动淡入** | Fade-in on scroll | 元素进入视口时逐渐出现 | 标题和卡片滚动进入视口时，从下方 30 px 在 0.6 s 内上移淡入。 |
| [#075](https://showheyohtaki.github.io/motion-prompt/#075) | **吸顶页头** | Sticky header | 滚动时页头停留在屏幕顶部 | 把页头设为吸顶，到达顶部后加一层柔和阴影。 |
| [#076](https://showheyohtaki.github.io/motion-prompt/#076) | **滚动固定** | Pinning | 区块固定，滚动推动内部内容变化 | 固定三步骤区块，用户滚动时逐步切换照片和编号。 |
| [#077](https://showheyohtaki.github.io/motion-prompt/#077) | **横向滚动** | Horizontal scroll | 纵向滚动驱动内容横移 | 让作品区随向下滚动而横向向左移动卡片，位移与滚动距离一致。 |
| [#078](https://showheyohtaki.github.io/motion-prompt/#078) | **滚动吸附** | Scroll snap | 滚动结束时自动对齐区块 | 让页面按区块滚动吸附，轻滚一下就落到下一节顶部。 |
| [#079](https://showheyohtaki.github.io/motion-prompt/#079) | **滚动进度条** | Scroll progress bar | 顶部条显示阅读进度 | 文章顶部放 4 px 厚的品牌橙色滚动进度条。 |
| [#080](https://showheyohtaki.github.io/motion-prompt/#080) | **荧光笔标记动画** | Highlighter animation | 重点文字下方逐渐画出色带 | 关键词进入视口时，在下方用 0.8 s 从左向右画出黄色荧光标记。 |

## 悬停与点击交互

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#081](https://showheyohtaki.github.io/motion-prompt/#081) | **悬停抬升** | Hover lift | 悬停时元素抬高并加深阴影 | 卡片悬停时用 0.3 s 抬高 8 px，同时加深阴影。 |
| [#082](https://showheyohtaki.github.io/motion-prompt/#082) | **悬停图片放大** | Image zoom on hover | 图片在固定边框内放大 | 作品照片悬停时用 0.5 s 放大到 1.1×，保持外框不变。 |
| [#083](https://showheyohtaki.github.io/motion-prompt/#083) | **光标跟随** | Cursor follower | 图形略带延迟地跟随指针 | 全站加入一个 30 px 橙色圆，稍有延迟地跟随光标。 |
| [#084](https://showheyohtaki.github.io/motion-prompt/#084) | **磁吸按钮** | Magnetic button | 按钮向附近光标偏移 | 联系按钮向光标方向移动距离的 0.3×，移开后弹回原位。 |
| [#085](https://showheyohtaki.github.io/motion-prompt/#085) | **涟漪效果** | Ripple effect | 从点击位置扩散的圆形波纹 | 提交按钮点击时从点击处扩散白圆，在 0.6 s 内淡去。 |
| [#086](https://showheyohtaki.github.io/motion-prompt/#086) | **下划线动画** | Underline animation | 悬停时链接下划线从左展开 | 菜单链接悬停时下划线用 0.3 s 从左长出，移开时向右收起。 |
| [#087](https://showheyohtaki.github.io/motion-prompt/#087) | **前后对比滑块** | Before/after slider | 拖动分隔线比较处理前后 | 项目照片加入前后对比滑块，拖中线比较左侧处理前与右侧处理后。 |
| [#088](https://showheyohtaki.github.io/motion-prompt/#088) | **离站挽留弹窗** | Exit-intent popup | 访客准备离开时出现的弹窗 | 光标从落地页顶部离开时，展示一次优惠券挽留弹窗。 |

## 加载、导航与循环动效

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#089](https://showheyohtaki.github.io/motion-prompt/#089) | **预加载画面** | Preloader | 页面加载期间显示的过渡界面 | 网站加载时显示标志与百分比，到 100% 后整屏上移退场。 |
| [#090](https://showheyohtaki.github.io/motion-prompt/#090) | **懒加载** | Lazy loading | 图片接近视口时才开始加载 | 图片库使用懒加载，先显示灰色占位，载入后用 0.3 s 淡入。 |
| [#091](https://showheyohtaki.github.io/motion-prompt/#091) | **无限滚动** | Infinite scroll | 滚动到底部时自动加载更多条目 | 新闻列表滚动到底部后显示加载圆环，每次追加十条。 |
| [#092](https://showheyohtaki.github.io/motion-prompt/#092) | **页面转场** | Page transition | 连接两个页面的过渡动画 | 点击链接时橙色面板从左向右扫过，再显示下一页。 |
| [#093](https://showheyohtaki.github.io/motion-prompt/#093) | **平滑滚动** | Smooth scroll | 页内链接平滑移动到目标位置 | 菜单页内链接使用平滑滚动，停止在固定页头下方。 |
| [#094](https://showheyohtaki.github.io/motion-prompt/#094) | **跑马灯** | Marquee | 文字或标志组成连续滚动带 | 服务名称以约 80 px/s 从右向左无缝循环滚动。 |
| [#095](https://showheyohtaki.github.io/motion-prompt/#095) | **动态渐变** | Animated gradient | 背景颜色持续移动和交融 | 首屏用橙蓝缓慢交融的动态渐变背景，每 10 s 循环一次。 |
| [#096](https://showheyohtaki.github.io/motion-prompt/#096) | **悬浮动画** | Floating animation | 元素轻柔地上下浮动 | 让首屏手机图上下浮动 8 px，每 2.4 s 一次。 |

点击编号可打开动态示例。单个术语的时间、缓动数值与参考代码位于： `api/v1/zh-Hans/e/<id>.txt` ([#073](../../api/v1/zh-Hans/e/073.txt)).

[全部分类](../README.md)
