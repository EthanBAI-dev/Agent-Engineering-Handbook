# 设计系统落地记录

`DESIGN.md` 是设计系统的**源头规范**（Stitch 导出，2026-09-10 版，未改动）。
本文件记录它怎么落到代码里，以及哪些地方我们有意没照搬。

来源压缩包：`stitch_ethanmusiclab_design_system (1).zip`
（目录名带 `ethanmusiclab` 是 Stitch 的项目名，内容是 `agent_hands_on_lab`。）

## 落到哪里

全部在 [`src/app/globals.css`](../src/app/globals.css) 的 `:root`，一处定义，全站引用。
字体在 [`src/app/fonts.ts`](../src/app/fonts.ts)，用 `next/font` 自托管。

| 规范 | 变量 | 说明 |
| --- | --- | --- |
| Paper / Card / Ink / Border | `--paper` `--card` `--ink` `--line` | 原本就一致，未改 |
| Lime / Green / Coral / Terminal | `--lime` `--green` `--coral` `--terminal` | 原本就一致，未改 |
| surface 阶梯、`coral-subtle`、`green-wash`、`lime-dim`、`terminal-surface` | `--surface-*` 等 | **本次补齐**，之前缺失 |
| Inter / Noto Serif / JetBrains Mono | `--font-ui` `--font-read` `--font-code` | **本次接入**，之前全是系统字体回退 |
| Soft 圆角（面板 8px / 控件 6px / 胶囊 full） | `--r-card` `--r-btn` `--r-pill` | **本次统一**，之前是 22/26/15px 混用 |
| Elevation 1–4（硬投影） | `--e1`–`--e4` | **本次统一**，之前是弥散阴影 |

## 四项实际改动

1. **字体真正加载。** 规范要求 Inter（标题/UI）、Noto Serif（长文 18px/32px）、
   JetBrains Mono（代码/终端/标签）。之前一个都没加载，全靠系统兜底。
   中文长文用 `Noto Serif SC` 接在 `Noto Serif` 后面。
2. **圆角收到 Soft 尺度。** 规范说的是"克制的建筑感"，之前的 22–26px 偏气泡感。
   面板/卡片/终端/图节点 → 8px，按钮/控件/输入框 → 6px，品牌方块保持规范指定的 10px。
3. **阴影换成硬投影。** 规范明确要"物理层叠 + 硬偏移"，不要弥散数字光晕。
   全站已无一处弥散阴影，只剩 `--e1`–`--e4` 四级和几个焦点环。
4. **纸面去掉光晕。** 之前 body 上有一层柠檬绿径向渐变；规范的 Level 0 是
   "flat paper，可选点阵"，且开篇就写了要避开"发光紫色星云"那类 AI SaaS 套路。

## 第二轮：按设计稿收紧版面

第一轮只动了基础层，首页版式还是旧的。第二轮按设计稿收紧：

5. **hero 从满屏巨标题收成编辑式排版。**
   之前是 `clamp(64px, 9vw, 132px)` 独占一整屏；现在按规范 `display-hero`
   收到 `clamp(32px, 4vw, 48px)`，去掉 `min-height: 100vh`。
   补上设计稿里的两个 eyebrow 药丸、"真正看懂 Agent"下面那条柠檬绿高亮，
   以及右下角的次级链接行。
6. **四张 STEP 卡移进 hero。** 设计稿里它们和 hero 同屏，是第一眼就要看到的东西。
   原来的 `learning-method` 区块因此重复，已删除（它只有这四张卡加一个标题）。
   导航「学习方式」的锚点改指向 hero 里的卡片组。
7. **标题层级重排。** 之前区块标题 68–76px，比 hero 还大，层级是倒的。
   现在按规范：`headline-lg` 32px 用于区块标题，正文内小节 `headline-md` 24px，
   课页标题 38px。字距同步从 -.055em 放宽到 -.02em，否则小字号会挤。
8. **区块间距收紧。** 首页从 4000+ px 收到约 2900px，hero 到 30 课目录之间不再空一大片。

## 第三轮：首页互动实验预览

设计稿 hero 之后那段 "INTERACTIVE LAB PREVIEW" 已实现，见
[`src/components/lab-preview.tsx`](../src/components/lab-preview.tsx)。

左栏是第 01 课的**真实摘录**（原文照搬，没有另写），配一张误区卡，复用
`article-kit` 的 `Misconceptions`；右栏直接挂 `<LessonOneLab />`——
就是第 01 课里那个实验台本体，不是另做的静态示意图。
**首页上点「执行 plan」，State 真的会变。**

这样第二轮删掉的那句标题
"文章不是动画的说明书。它们共同完成一次学习。"也回到了它在设计稿里的位置。

栏宽 5:7，实验台实测 724px（原设计版心 920px），无横向溢出；
1080px 以下堆成单栏。摘录正文用 `body-reading-mobile`（16px/28px），
窄栏里 18px 会挤。

## 主 CTA 按钮

按规范执行：柠檬绿胶囊（`--lime` 底 / `--on-lime` 字 / `--r-pill`）、
JetBrains Mono 标签、墨色硬投影 `0 3px 0 0`，hover 抬起 1px。
中途试过保留原来的墨色大方块按钮，最后仍按设计稿走。

## 第四轮：逐段对齐下半页

前三轮只动了 token 层、hero 和实验预览，**下半页几乎原样**，整体看差距仍然明显。
这一轮拿无头 Chrome 抓整页截图，和设计稿逐段比对后补齐：

9. **顶栏。** 补 `v1.0` 徽章、标语、四项导航（学习方式 / 实验预览 / 30 课目录 / GitHub 仓库）、
   右侧柠檬绿 CTA。高度按规范从 76px 收到 64px。
10. **00–30 分页条**（DESIGN.md §2 专门定义的组件，之前完全没有）。
    三态按规范：`open` 绿描边、`next` 柠檬绿实底 + 脉冲点、`planned` 虚线且不可点。
    脉冲动画在 `prefers-reduced-motion` 下关闭。
11. **状态统计条**，并修掉一处算术错误：原先「全部 30 课 / 已开放 5」把前言算进了正式 30 课，
    5+1+25=31 对不上。现在按站上自己的口径——前言不计入 30 课——是 4+1+25=30。
12. **目录卡片改三栏**，带 `NN · OPEN` 徽章和时长；下一课单独一张 `NEXT` 虚线卡。
13. **未开放的课按阶段合并**，从平铺 26 个空格子变成 4 张阶段卡。
    阶段边界取自课程实际内容，对应 docs 里那条「真实模型 → 状态与可靠性 → 高级模式 → 产品化」。
14. **「不用先装环境」从深色块改成浅色工程声明区**：四阶段路线图（PHASE 01 当前在线 →
    04 长期目标）+ 精简版/完整版对比卡。文案用设计稿原文——它本来就是为这个项目写的，
    PHASE 02 提到的 `/api/agent` 正是课程表第 08 课。
15. **页脚从一条细线改成三栏**：简介 / 学习路径 / 源码与许可。
16. **STEP 卡补图标**，用内联 SVG，不为四个装饰图标加载整套 Material Symbols。

## 第五轮：拿到设计稿真实代码后的修正

前四轮都在照截图猜。拿到 `code.html` 原文后，发现两个**方向性错误**：

17. **背景是通栏色带，不是纸色上的圆角卡片。**
    设计稿的 section 直接带 `bg-*`，整幅铺满：
    `bg-paper`（hero / 目录 / 底部 CTA）→ `bg-surface-container` `#e3f1ea`（实验预览）
    → `bg-surface-container-high` `#ddebe5`（工程声明 + 页脚）。
    之前全站一层 `--paper`，只在局部塞圆角块，所以整页发平、缺呼吸感。
    实现上用 `padding-inline: max(gutter, (100% - 版心)/2)`，
    区块本身满宽、内容仍收在 1380px，不用给每段加 wrapper。

18. **圆角错了一个量级。** 设计稿 `tailwind.config` 覆盖了 Tailwind 默认值：

    | | 真实值 | 之前做成 |
    | --- | --- | --- |
    | `rounded`（徽章、状态标签） | **2px** | 999px 胶囊 |
    | `rounded-lg`（按钮、输入框） | **4px** | 8px |
    | `rounded-xl`（卡片、面板） | 8px | 8px ✓ |
    | `rounded-full`（主 CTA） | **12px** | 999px 胶囊 |

    `DESIGN.md` frontmatter 写的是 `full: 9999px`，和 config 自相矛盾。
    **以真实渲染的 config 为准**——徽章近乎方形正是"技术杂志"和"普通 SaaS"的分界。

19. **补上底部 CTA 区**（READY TO RUN / 不要停在文字里），设计稿有，之前整段漏掉。
20. **页脚按设计稿重做**：品牌简介 / 学习四步法 / 仿真与生产隔离声明卡 + 许可行。
21. **分页条与徽章配色改按设计稿**：已开放格是 `--secondary` 实底白字，
    `NN · OPEN` 徽章是墨底柠檬字，不再是绿描边。

### 这一轮修掉的两个回归

- 旧的裸 `footer {}` 规则（`display:flex; max-width:1240px`）还留着，
  把新页脚的两个子块并排挤在了一起，且色带铺不满。已删除。
- 移除 `.site-shell` 左右内边距做通栏后，课页的侧边导轨贴到了屏幕边缘。
  已给 `.lesson-page-grid` 和课页的裸 `<footer>` 单独补装订线。

## 有意没照搬的

