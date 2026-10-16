# 制作自己的术语库

**简体中文** | [English](README.md) | [日本語](README.ja.md)

这里有提示词、渲染脚本和两个已完成示例，可用于制作自己领域、语言和风格的术语库：三段循环视频，每段八张动态卡片，以及一张速查表。

镜头运动示例采用浅灰、单蓝色、象形图风格；动态图形示例采用藏蓝卡片和四色。风格不同是有意的，共同规则是每张卡片展示名称所指的效果本身。

## 从提示词开始

| 目标 | 提示词 |
|---|---|
| 将现有视频转换为其他语言 | [翻译现有示例](prompts/zh-Hans/01-translate.md) |
| 为自己的领域创建术语与示例 | [制作新领域](prompts/zh-Hans/02-your-own-field.md) |
| 生成单页速查表图片 | [制作速查表](prompts/zh-Hans/03-cheatsheet-image.md) |

原始 HTML 位于 `examples/camera-moves/en/`、`examples/camera-moves/ja/` 和 `examples/motion-graphics/ja/`。历史视频和图片保留发布时语言，不会因网页语言切换而改变。新中文内容位于主素材库的 `packs/`；本次本地化不重新渲染历史媒体。

手动编辑 HTML 时，`PAGES` 与 `ITEMS` 控制标题和名称，`CELLS` 是各卡片绘制函数，`C` 是颜色，`JP`、`EN`、`MONO` 或 `DISP` 是字体。

## 预览与渲染

用 Chromium 浏览器打开示例 HTML 可播放循环；`?page=2` 显示第二页，`?t=3.5` 固定在 3.5 s。

渲染需要 Node.js 18+、Playwright 与 PATH 中的 ffmpeg。在此目录执行：

```sh
npm install
npx playwright install chromium
node render.mjs examples/camera-moves/en/index.html --page 1
node render.mjs examples/motion-graphics/ja/index.html --all --sheet
```

输出在 `out/`，不纳入源码。常用选项为 `--page`、`--all`、`--pages`、`--out`、`--out-dir`、`--fps`、`--crf`、`--sheet`。联系表每秒抽取一帧，便于检查卡片内容、文字溢出与循环。

成片为 1200×1350、30 fps、H.264/yuv420p、无音轨、9.4 s 循环。渲染器逐帧调用 `window.renderFrame(i)` 并把 PNG 输入 ffmpeg，不依赖实时播放速度。HTML 需提供 `N_FRAMES`、`renderFrame(i)`、`READY`，可选异步 `prepareFrame(i)`；支持 `?page=N` 和 `?render=1`。

## 字体与检查

示例不从网络载入字体或图片。原视频在 macOS 渲染，Windows/Linux 的字体回退可能不同；中文需本机有合适的中文字体，例如微软雅黑、苹方或 Noto Sans CJK SC。更换字体后检查缺字、换行和重叠。

代码使用近期 Chromium 的 `roundRect` 和 `letterSpacing`。历史日文 HTML 与已发布媒体在硬切处可能相差一帧，代码注释也保留日文。

完成后可按[贡献指南](../CONTRIBUTING.zh-Hans.md)加入主素材库。代码与本站原创媒体采用 [MIT](../LICENSE)，允许包括商业在内的用途，需保留适用署名与许可声明。
