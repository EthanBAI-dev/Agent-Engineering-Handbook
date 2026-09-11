# 交接记录

最后更新：2026-09-11 · 对应提交 `189d452`

---

## 一句话

31 课的教学网站已全部上线并通过验证；另外建了两套内容生产工具——
`course-dev/stitch/`（网页版式与配图）和 `course-dev/xiaohongshu/`（小红书图文）。
下一步是拿一课走通「Stitch 产出 → globals.css」的完整流程，做成可复制的样板。

---

## 一、仓库现状

### 分支与部署

| | |
| --- | --- |
| 开发分支 | `claude/pensive-shannon-i0k04c` |
| 默认分支 | `claude/ai-agent-tips-handbook-wcdgws`（Vercel 从这里部署） |
| Vercel Root Directory | `apps/web` |
| 同步方式 | 开发分支验证通过后快进默认分支（用户已在早前一次「合并」中授权） |

### 目录地图

```
apps/web/              Next.js 16 教学网站（唯一的产品）
  src/app/globals.css        设计系统：CSS 变量 + 所有区块样式
  src/lib/course.ts          31 课的目录、slug、状态
  src/components/
    lesson-articles.tsx        课号 → 正文组件的注册表，新开一课只加一行
    lesson-*-article.tsx       31 份课程正文（正文 + 内嵌互动实验）
    lab-kit.tsx                互动实验骨架：ScenarioLab / ClassifyLab / OrderLab
    article-kit.tsx            正文构件：CodeBlock / Callout / Misconceptions / …
    auto-term.tsx              术语自动标注（每一次出现都加，不只第一次）
    term.tsx                   术语弹窗，含视口边界钳制
  src/lib/glossary.ts        50+ 术语，多写法，按长度倒序匹配

content/lessons/*.md   31 课的课程正文（内容的唯一来源）
                       每课内嵌 > **配图 Fxx-x** 和 > **互动 Uxx-x** 规格区块

lab/langgraph/         可实跑的示例代码，前 6 课不需要 API Key
  examples/_fake.py          ScriptedModel：脚本化假模型，保证数字可复现

course-dev/            内容生产工具（不参与部署）
  figure-and-ui-index.md     37 配图 / 31 互动的总览（自动生成）
  stitch/                    网页版式与配图的提示词工具箱
  xiaohongshu/               小红书图文：卡片脚本 → PNG + 提示词
  scripts/
    build-figure-index.py      重建配图索引
    build-stitch-prompts.py    重建 stitch/out/ 的 68 份提示词
```

---

## 二、已完成

### 课程网站（31 课全部上线）

- 00–30 课正文与互动实验全部实现，`course.ts` 里全部 `status: "open"`
- 每课的互动实验都可以真正拨动，通过后写 `localStorage`
- 26 课起复用 `lab-kit.tsx` 的三种骨架，每课只需提供数据和一个纯函数 `compute()`

**验证口径**（每一批都跑过，不是估计）：

```bash
cd apps/web && pnpm lint && pnpm build      # 39 条静态路由
```
再用 Playwright 在 1440px 与 390px 各跑一遍，检查：横向溢出 = 0px、
通过态能达成、`localStorage` 已写入、无 pageerror。

**课程数字的来源**：全部来自 `lab/langgraph/examples/` 的实跑输出，不是编的。
LangGraph 官网在这个环境里是 403，但 PyPI 通，所以能 `uv sync` 后真跑。

### 内容生产工具

**`course-dev/stitch/`** —— 把课程 md 里的配图／互动规格编译成可直接粘贴的提示词。

```bash
python3 course-dev/scripts/build-stitch-prompts.py   # → stitch/out/ 68 份
```

核心判断写在 `README.md` 里：Stitch 把提示词里的文字当成「描述你想要什么设计」，
不当成「这是要排版的内容」，所以喂一篇 3000 字 md 它会先总结再排版——
这就是精简版内容变薄的成因。修法是改任务边界：Stitch 只做版式，文字和交互留在代码里。

**`course-dev/xiaohongshu/`** —— 00–05 课的小红书图文，48 张成品已渲染。

```bash
cd course-dev/xiaohongshu && node build.mjs          # → out/ PNG + prompts/ 提示词
node build.mjs --shoot 你从Stitch导出的.html          # 按 .xhs-card 逐张导出
```

内容源只有 `cards.json`。图片固定 1242×1656（3:4）。

---

## 三、待办（按优先级）

### 1. 走通「Stitch 产出 → globals.css」的样板（用户已同意试）

计划是拿第 28 课（正文和实验都是新写的）走一遍：

1. 用 `course-dev/stitch/out/U28-1.md` 的提示词跑一次 Stitch
2. 拿到 Tailwind HTML 后，**只取版式决策**，翻译成 `globals.css` 的 `.kit-*` 规则
3. 产出一张映射表：Stitch 的每个视觉决策 → 对应改哪一条 CSS
4. 前后对比截图 + `pnpm lint && pnpm build` + 两个宽度的溢出检查
5. 写成 `course-dev/stitch/40-worked-example.md`

**卡在哪**：这个环境里跑不了 Stitch。要么用户自己跑一次把 HTML 贴回来，
要么下一轮先写一份 mock 产出当占位（必须明确标注是占位，不是真实 Stitch 输出）。

### 2. 37 张配图

`course-dev/stitch/out/F*.md` 里每张都有填好的提示词，两条路线：

- **路线 A（推荐，约 35 张）**：让能写代码的模型直接产出 SVG。
  规格里都写死了必须出现的中文标注，而图像模型画中文几乎必错。
- **路线 B（约 2–5 张）**：本身就是界面示意的那几张交给 Stitch。

做完一张要：文件放 `apps/web/public/assets/lessons/`、正文换成图片组件、
`alt` 用规格里的「替代文本」原文、把 md 的配图区块标成已完成、重跑索引脚本。

### 3. 小红书剩下的 25 课

`cards.json` 里现在只有 00–05。补内容的成本主要在写卡片脚本，
渲染和提示词生成都是自动的。

---

## 四、等用户拍板的事

| # | 问题 | 影响 |
| --- | --- | --- |
| 1 | 第 01 课的**精简版 vs 完整版**更喜欢哪个？ | 决定 00/02/03 要不要照着扩写 |
| 2 | 付费层怎么做：账号体系？按课买还是订阅？精简版要不要被搜索引擎收录？ | 决定要不要加账号层 |
| 3 | 小红书账号名现在写死在 `cards.json` 的 `meta.account`（"AI Agent 工程手册"），要改吗？ | 影响已渲染的 48 张图 |

---

## 五、不能违反的约束

- **API Key 永远不进浏览器代码**，不放 `NEXT_PUBLIC_` 变量；`.env` 保持 gitignore
- **课程里的数字必须来自实跑**，不编模型输出；没验证的要标「未验证」
- **不要改 `lab-kit.tsx` 的 DOM 结构**——31 课的实验都挂在那套类名上，
  Playwright 的验证脚本也按类名找元素
- **不要把 Stitch 导出的 HTML 整页搬进仓库**——本站是原生 CSS 变量不是 Tailwind，
  而且正文的术语悬停由 `auto-term.tsx` 在 React 树上自动标注，换裸 HTML 会全丢
- **不要推到设计分支以外的分支**（默认分支的快进已获授权）

---

## 六、常用命令

```bash
# 网站
cd apps/web && pnpm dev -p 3111
cd apps/web && pnpm lint && pnpm build

# 重建索引与提示词
python3 course-dev/scripts/build-figure-index.py
python3 course-dev/scripts/build-stitch-prompts.py

# 小红书图文
cd course-dev/xiaohongshu && node build.mjs

# 浏览器验证（Chromium 已预装）
/opt/pw-browsers/chromium-1194/chrome-linux/chrome
```

---

## 七、这一轮踩过、已经修掉的坑

留个记录，避免重复踩：

- **`.kit-rows` 列宽**：`dd` 用 `auto` 时长文本会把 `dt` 挤成竖排单字。
  改成 `auto + minmax(0,1fr)`，小屏改上下堆叠。
- **提示词被自己的围栏截断**：课程正文里有 ```` ``` ```` 代码块，塞进提示词的
  围栏里会从中间断开。`build-stitch-prompts.py` 里先把围栏降级成缩进。
- **截图尺寸 1244 而不是 1242**：直接截元素会因子像素撑宽。改用 `clip` 精确裁。
- **小红书话题不能有空格**：`#AI Agent` 会从空格断开，统一写 `#AIAgent`。
- **`pkill` 和 heredoc 不能写在同一条 bash 命令里**：会在文件写完之前杀掉 shell。
- **`OrderLab` 不给 `initialOrder` 会一进来就通关**：`items` 的顺序通常就是答案。
