# Motion Prompt：分类与 API 格式

**简体中文** | [English](FORMAT.md)

项目为静态 HTML/CSS/JavaScript，无构建框架。Node.js 18+ 脚本将分类源文件生成网页目录、静态 API 与术语列表。

## 源文件与生成文件

| 路径 | 用途 |
|---|---|
| `index.html`、`found.html`、`assets/site.js`、`assets/found.js` | 网页与交互 |
| `assets/zh-Hans.js` | 简体中文界面文案 |
| `assets/runtime.js` | 分类注册与语言切换 |
| `packs/<pack>/pack.js`、`meta.json` | 代码与多语言内容真源 |
| `api/v1/`、`assets/catalog.js`、分类下的 README | 由构建生成并跟随源码提交 |
| `skills/motion-prompt/` | 技能说明、命令行与移植参考 |
| `tools/build.mjs`、`check.mjs`、`check-localization.mjs` | 构建、绘制检查、本地化检查 |

分类按 `order` 连续排列：motion 001–024、camera 025–048、ui 049–072、lp 073–096、photo 097–120。已公开编号不重排、不复用；新分类追加到末尾。

## pack.js

分类调用 `MotionPrompt.pack(id, factory)`，工厂返回 `{ width, height, cycle, cells, fonts? }`。运行时可向工厂传入语言；现有不接收参数的工厂继续可用。

每个 `cells[i](k, w, h, u)` 是时间 `u` 的纯函数。调用者清空画布，并包裹 `save/restore`；`u` 为 `[0, cycle)` 内秒数。不要使用实时时钟、无种子随机数或跨帧状态。

区块标记必须精确为两空格缩进的 `// @kit`、`// @shared`、`// @element NN` 和 `// @end`。一个 `@kit` 必须在最前；`@element` 从 01 连续编号。元素所需的共享常量与辅助函数必须放在 kit 或 shared，方便提取成独立代码。

仅绘制卡片内部，不绘制网页卡框、编号或术语标签。除创建离屏画布外不要依赖 DOM，不加载网络资源。字体使用系统字体；附带字体时须有允许再分发的许可证。

简体中文画布文字由各分类的 `MP_LABELS` 与 `mpText` 处理。`MP_LANG` 在工厂创建时确定，因此不读取 DOM，也不改变时间函数。日英模式保留原版画布文字；简体中文辅助代码默认使用 `zh-Hans`。用于形状演示的 O、拍摄单位等保留原文。

## meta.json

分类包含 `pack`、`order`、多语言 `title`、带 `slug` 的 `categories`，以及 `elements`。元素包含：

| 字段 | 内容 |
|---|---|
| `no`、`slug`、`category` | 分类内编号、稳定英文标识与子类 |
| `name` | 行业内使用的名称 |
| `meaning` | 一句话解释 |
| `ask` | 包含主体、时长或幅度的请求示例 |
| `summary` | 描述动态示例的实际表现 |
| `spec` | 3–6 行规格：对象、次序、秒数、缓动、位移、角度、缩放等 |
| `use` | 适用场景 |
| `tags` | 4–8 个小写英文关键词 |

文本字段按语言代码存储，例如 `{"en":"Pan","ja":"パン","zh-Hans":"水平摇镜头"}`；`spec` 的各语言值是数组，行数相同。英语必需，其余语言缺失时回退英语。规格数字取自代码，不为翻译重新调整。

给分类增加语言后运行构建，会生成 `README.<lang>.md`，并在其他语言列表中加入入口。新增网页语言还需扩展 `tools/build.mjs` 中 `LANGS`、提示词模板、`T`、`DOC`，以及网页和命令行语言支持。

## 静态 API

| 路径 | 内容 |
|---|---|
| `api/v1/catalog.json` | 版本、分类与所有多语言元素 |
| `api/v1/<lang>/catalog.tsv` | 编号、分类、子类、名称、标签、概述 |
| `api/v1/<lang>/e/<id>.txt` | 署名、规格、辅助代码链接与单个元素代码 |
| `api/v1/<lang>/p/<id>.txt` | 与网页“复制提示词”完全一致的文字 |
| `api/v1/kit/<pack>.js` | 原版共享代码 |
| `api/v1/zh-Hans/kit/<pack>.js` | 默认使用中文画布文字的独立共享代码 |

`<lang>` 当前为 `ja`、`en`、`zh-Hans`。元素代码与 kit 首行保留 `Motion Prompt #ID · MIT License (c) 2026 Shohei Ohtaki` 署名。`kit` 和 `get` 应使用相同的 `--lang`。

## 验证

`node tools/build.mjs --check` 只校验，不写文件；不带该参数则重建所有生成文件。`--root <dir>` 可指定其他树；`--partial` 只用于缺少部分分类的开发场景，会改变编号，不应作为正式产物。

`node tools/check.mjs` 在浏览器绘制每个元素，检查异常、空白、纯色、循环接缝和确定性；需 Playwright 与 Python，可用 `MP_PYTHON` 指定 Python 路径，默认 `python3`。`node tools/check-localization.mjs` 检查本地化交互与独立中文代码，需 Playwright。两者均可通过 `MP_PLAYWRIGHT` 指定依赖。

预览单类：本地服务后打开 `dev/preview.html?pack=camera`；`&t=1.2` 固定时间，`&only=5` 只看一个元素。
