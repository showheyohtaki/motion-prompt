# 提示词 1：将现有视频转换为其他语言

将 `<LANGUAGE>` 与 `<lang>` 替换为目标语言与代码，例如“简体中文”和 `zh-Hans`，交给能读取本仓库的编程 AI。

```text
阅读 make-your-own/README.zh-Hans.md 和
make-your-own/examples/camera-moves/en/index.html。

目标：为三段镜头运动视频制作 <LANGUAGE> 版本。
1. 将英文 index.html 复制到 make-your-own/examples/camera-moves/<lang>/index.html。
2. 只翻译屏幕文字：PAGES、ITEMS 的名称与解释、drawPage() 标题，
   以及卡片内 Quiet、LOUD、Audio、Video 等标签。
   不翻译 REC、24mm、1.7m/s 等拍摄读数。
3. 不改变布局、颜色、时间或 CELLS 绘图逻辑。
4. 24 个名称使用该语言影视行业的常见说法，逐项核对来源。
   若业内保留 Dolly zoom、J-cut 等英文，就保留英文；不要生造直译名。
   列出拿不准的名称。
5. 必要时将 JP / EN / MONO 字体常量换为本机已安装、支持该语言的字体，
   并报告字体名称。若目标语言从右向左书写，先说明再调整布局。
6. 检查文字适配：名称必须在宽 539 px 的卡片内保持单行。
   过长时优先选择更短的通用名称，最后才统一缩小全部 24 项字号。
7. 渲染并检查：
   cd make-your-own
   node render.mjs examples/camera-moves/<lang>/index.html --all --sheet
   打开 out/ 中三张联系表，逐项检查裁切、重叠和缺字方框。
8. 交付英文与目标语言的 24 项对照表、存疑名称、使用字体及输出位置。
```

动态图形示例也适用；其文字位于 `SERIES`、`PAGES`、`ITEMS` 和少量卡片内部标签。将术语加入主素材库时，另按[贡献指南](../../../CONTRIBUTING.zh-Hans.md)修改 `packs/`。
