<!-- 由 tools/build.mjs 根据 meta.json 生成。请编辑 meta.json，不要直接修改本文件。 -->

# UI 组件

24 个术语 · #049–072 · 分类 `ui` · 语言: [English](README.md) / [日本語](README.ja.md)

找到名称后直接告诉 AI。补充时长、幅度和运动对象，可以更接近你想要的效果。

## 浮层与展开

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#049](https://showheyohtaki.github.io/motion-prompt/#049) | **模态对话框** | Modal dialog | 打开浮窗并暂时阻止操作背景 | 点击删除按钮后显示模态确认对话框，页面变暗约 40%，用 0.3 s 淡入并略微放大。 |
| [#050](https://showheyohtaki.github.io/motion-prompt/#050) | **抽屉面板** | Drawer (Off-canvas) | 从屏幕侧边滑出的面板 | 点击菜单按钮后从左侧打开抽屉，宽度占屏幕 40%，用 0.4 s 滑入，页面略微变暗。 |
| [#051](https://showheyohtaki.github.io/motion-prompt/#051) | **底部面板** | Bottom sheet | 从屏幕底部升起的面板 | 点击查看详情后弹出高度占屏幕 40% 的底部面板，0.4 s 升起，向下拖动关闭。 |
| [#052](https://showheyohtaki.github.io/motion-prompt/#052) | **折叠面板** | Accordion | 点击标题展开或收起内容 | 把常见问题做成折叠面板，点击后在 0.35 s 内展开，箭头旋转 180°。 |
| [#053](https://showheyohtaki.github.io/motion-prompt/#053) | **下拉选择框** | Dropdown (select) | 点击字段展开选项列表 | 把地区字段做成下拉选择框，0.25 s 展开下方选项，选中后回填并收起。 |
| [#054](https://showheyohtaki.github.io/motion-prompt/#054) | **文字提示** | Tooltip | 悬停时显示简短说明 | 给问号图标加文字提示，悬停 0.2 s 后在上方显示，移开即隐藏。 |
| [#055](https://showheyohtaki.github.io/motion-prompt/#055) | **气泡卡片** | Popover | 点击后显示指向触发按钮的小面板 | 给详情按钮加右侧气泡卡片，0.3 s 展开，点击确定关闭。 |
| [#056](https://showheyohtaki.github.io/motion-prompt/#056) | **轻提示** | Toast notification | 短消息出现后自动消失 | 保存后在右下显示已保存轻提示，0.35 s 从右侧滑入，2 s 后自动消失。 |

## 切换与输入

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#057](https://showheyohtaki.github.io/motion-prompt/#057) | **标签页** | Tabs | 点击标签切换内容面板 | 价格页顶部放三个标签页，下划线用 0.25 s 滑动，内容用 0.2 s 叠化。 |
| [#058](https://showheyohtaki.github.io/motion-prompt/#058) | **轮播图** | Carousel | 横向滑动切换展示项 | 把顶部图片做成轮播图，右箭头每次用 0.4 s 切一张，下方显示位置圆点。 |
| [#059](https://showheyohtaki.github.io/motion-prompt/#059) | **开关** | Toggle switch | 切换设置的开启与关闭状态 | 通知设置使用开关，滑块用 0.2 s 移动，开启时轨道变蓝。 |
| [#060](https://showheyohtaki.github.io/motion-prompt/#060) | **分段控制器** | Segmented control | 一排相连按钮用于切换视图 | 图表上方加日、周、月分段控制器，选中背景用 0.25 s 滑动，图表同步变化。 |
| [#061](https://showheyohtaki.github.io/motion-prompt/#061) | **筛选标签** | Filter chips | 点击小标签组合筛选条件 | 列表上方加入筛选标签，选中后打勾并变蓝，0.15 s 内更新列表。 |
| [#062](https://showheyohtaki.github.io/motion-prompt/#062) | **范围滑块** | Range slider | 双滑块选择最小值与最大值 | 价格筛选使用双滑块，拖动时在气泡中显示各自数值。 |
| [#063](https://showheyohtaki.github.io/motion-prompt/#063) | **步进器** | Stepper (+/−) | 通过加减按钮逐次修改数值 | 数量字段使用步进器，加减每次变化 1，数字每次用 0.25 s 轻弹一下。 |
| [#064](https://showheyohtaki.github.io/motion-prompt/#064) | **分页** | Pagination | 通过页码切换列表页面 | 搜索结果下方加分页，当前页蓝色圆圈用 0.2 s 移动，并替换列表内容。 |

## 导航与状态反馈

| 编号 | 名称 | 英文名 | 含义 | 向 AI 提出需求的示例 |
|---|---|---|---|---|
| [#065](https://showheyohtaki.github.io/motion-prompt/#065) | **汉堡菜单** | Hamburger menu | 三横线图标点击后展开菜单 | 移动端页头右侧放汉堡菜单，点击后用 0.3 s 变成 ×，菜单从顶部展开。 |
| [#066](https://showheyohtaki.github.io/motion-prompt/#066) | **面包屑导航** | Breadcrumbs | 显示页面层级位置的链接路径 | 文章上方加首页 › 课程 › 网页设计面包屑，当前页加粗且不作为链接。 |
| [#067](https://showheyohtaki.github.io/motion-prompt/#067) | **巨型菜单** | Mega menu | 主导航展开的宽幅分组链接面板 | 页头产品项悬停后用 0.25 s 展开全宽菜单，包含三列链接和一张图。 |
| [#068](https://showheyohtaki.github.io/motion-prompt/#068) | **步骤指示器** | Step indicator | 显示流程的当前步骤与进度 | 注册表单顶部放信息、确认、支付、完成四步指示器，已完成步骤显示勾。 |
| [#069](https://showheyohtaki.github.io/motion-prompt/#069) | **骨架屏** | Skeleton screen | 加载时以灰色块预示内容布局 | 列表加载时显示骨架屏，灰块形状对应内容，每 0.9 s 从左向右扫一道光。 |
| [#070](https://showheyohtaki.github.io/motion-prompt/#070) | **加载转圈** | Spinner | 旋转圆环表示等待 | 发送时在表单上方显示每秒转一圈多的加载圆环，完成后换成蓝色勾。 |
| [#071](https://showheyohtaki.github.io/motion-prompt/#071) | **徽标** | Badge | 用小圆点或数字显示数量 | 页头铃铛上显示未读数徽标，数量增加时弹跳 0.3 s，打开后消失。 |
| [#072](https://showheyohtaki.github.io/motion-prompt/#072) | **空状态** | Empty state | 列表没有内容时显示的界面 | 列表为空时显示线描图标、暂无内容和添加按钮，用 0.35 s 淡入。 |

点击编号可打开动态示例。单个术语的时间、缓动数值与参考代码位于： `api/v1/zh-Hans/e/<id>.txt` ([#049](../../api/v1/zh-Hans/e/049.txt)).

[全部分类](../README.md)
