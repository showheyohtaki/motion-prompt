# Motion Prompt

**简体中文** | [English](README.md) | [日本語](README.ja.md)

与 AI 沟通创意的术语库。每个术语都有动态示例、一句话解释、请求示例、详细规格和参考代码。当前有五类，每类 24 个，共 120 个术语：动态图形、镜头运动、UI 组件、落地页效果、摄影效果。

- [打开简体中文素材库](https://showheyohtaki.github.io/motion-prompt/?lang=zh-Hans)
- [在 GitHub 查看术语列表](packs/README.md)
- [精选案例](https://showheyohtaki.github.io/motion-prompt/found.html?lang=zh-Hans)
- [贡献指南](CONTRIBUTING.zh-Hans.md) · [数据格式](FORMAT.zh-Hans.md) · [翻译依据与待核对名称](docs/translation-notes.zh-Hans.md)

## 创作缘由

作者发布了一些介绍动态图形和镜头运动名称的短视频。随后收到的反馈让他意识到：有时限制创作的并不是想象力，而是不知道所需效果叫什么。

因此，这个项目将专业领域的共同语言与可观看的示例放在一起，让更多人能与 AI 合作表达创意。你也可以为自己的领域、语言和风格制作同类术语库。

作者：大滝昇平 / Shohei Ohtaki。

## 当前内容

| 编号 | 分类 | 中文列表 |
|---|---|---|
| 001–024 | `motion` 动态图形 | [查看](packs/motion/README.zh-Hans.md) |
| 025–048 | `camera` 镜头运动与转场 | [查看](packs/camera/README.zh-Hans.md) |
| 049–072 | `ui` UI 组件 | [查看](packs/ui/README.zh-Hans.md) |
| 073–096 | `lp` 落地页与网页效果 | [查看](packs/lp/README.zh-Hans.md) |
| 097–120 | `photo` 摄影效果、光线与风格 | [查看](packs/photo/README.zh-Hans.md) |

## 浏览、选择并交给 AI

安装技能需要 Node.js 18 或更新版本：

```sh
npx skills add showheyohtaki/motion-prompt
```

也可以把这句话交给编程 AI：

> 阅读 https://github.com/showheyohtaki/motion-prompt，在当前环境安装 motion-prompt 技能。安装后用三句话介绍用法。

1. 告诉 AI：“打开 motion-prompt 素材库，用简体中文显示。”
2. 浏览并点击“选择”，可选多个示例；备注中可写“用于片头标题”等说明。
3. 点击“发送给 AI”，再说明要完成什么，例如“按这个效果修改视频片头”。

“发送给 AI”只在 AI 通过技能打开素材库并等待接收时出现。没有技能时，可点击“复制已选内容”或详情中的“复制提示词”，再粘贴给 AI。已知编号时，可直接说“使用 #012 和 #045”。

也可以只查名称，不安装任何内容。例如：“标题从下方通过遮罩显现，0.6 s，各行稍微错开。”或“缓慢推镜头靠近人物，移动相机，不要变焦。”这些名称也可用于视频生成模型或给人的制作说明。

## 语言与本地使用

网页提供日语、英语、简体中文。语言按钮会记住选择；`?lang=zh-Hans` 指定本次访问语言，`zh-CN` 等简体中文地区代码也会归一化到 `zh-Hans`。首次访问时根据浏览器语言选择，不改变原版日英默认逻辑。

```sh
git clone https://github.com/showheyohtaki/motion-prompt.git
cd motion-prompt
python -m http.server 8000
```

打开 `http://localhost:8000/?lang=zh-Hans`。

```sh
node skills/motion-prompt/scripts/motion-prompt.mjs pick --local --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs search 推镜头
node skills/motion-prompt/scripts/motion-prompt.mjs list --pack camera --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs get 027 --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 027 --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs kit camera --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs --help --lang zh-Hans
```

`get` 每次最多八项。获取中文代码后，对相应分类使用同语言的 `kit`。中文辅助代码在 `api/v1/zh-Hans/kit/`，不依赖网页运行时，也不需要读取 DOM 语言。

默认命令行语言仍为英语；含假名的搜索使用日语，仅含汉字的搜索使用中文。日文纯汉字查询可显式加 `--lang ja`。`--lang zh-CN` 是 `zh-Hans` 的别名。

完整克隆优先读取本地 `api/v1`；仅安装技能时从原项目网站读取，失败后尝试 GitHub 原始文件，并保留本地缓存。不会上传项目内容。`pick` 临时监听 `127.0.0.1`，仅接受带随机令牌的选择。

| 环境变量 | 用途 |
|---|---|
| `MOTION_PROMPT_BASE` | 替代默认来源的本地目录或 URL，多个来源以逗号分隔 |
| `MOTION_PROMPT_CACHE` | 缓存目录 |
| `MOTION_PROMPT_TTL` | 缓存有效秒数，默认 21600，即六小时 |

## 为自己的领域制作

[make-your-own](make-your-own/README.zh-Hans.md) 提供制作术语视频、速查表和新分类的提示词。领域不限于视频，也可以是声音、烹饪、建筑等。

## 修改与验证

源文件为 `packs/<pack>/meta.json` 与 `pack.js`。中文界面文本位于 `assets/zh-Hans.js`；画布文本位于各分类的 `MP_LABELS`，语言只影响文字，不改变动画参数。诸如 ZOOM 中用于穿越的 O、拍摄单位、专有名词和第三方原帖保留原文。

```sh
node tools/build.mjs --check
node tools/build.mjs
node tools/check.mjs
node tools/check-localization.mjs
```

后两个检查需要 Playwright，可通过 `MP_PLAYWRIGHT` 指定其安装路径。`check.mjs` 还需要 Python，默认使用 `python3`；Windows 等环境可通过 `MP_PYTHON` 指定可执行文件。本地化检查验证三种语言的提示词、中文内容、复制和分享、移动端宽度、独立参考代码与 AI 选择回传。它使用模拟的 X 嵌入验证本站语言设置，不代表验证了第三方帖子服务。

## 许可证

[MIT](LICENSE) © 2026 Shohei Ohtaki。代码、项目原创视频和图片可用于包括商业在内的用途。使用示例代码时保留首行 `// Motion Prompt #ID · MIT License ...` 署名。第三方帖子及其内容权利属于各作者，不因本站收录而转为 MIT。
