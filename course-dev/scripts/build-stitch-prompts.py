#!/usr/bin/env python3
"""把课程正文里的配图／互动规格，编译成可以直接粘进 Stitch 的提示词。

需求的来源永远是 content/lessons/*.md 里的区块本身；这个脚本只是把它们
和 course-dev/stitch/00-style-contract.md 的契约拼在一起，省掉手工复制。
改完正文重跑一次即可。

用法：python3 course-dev/scripts/build-stitch-prompts.py
产出：course-dev/stitch/out/F??-?.md 与 U??-?.md
"""
import io, os, re, glob, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LESSONS = os.path.join(ROOT, "content", "lessons")
STITCH = os.path.join(ROOT, "course-dev", "stitch")
OUT = os.path.join(STITCH, "out")

BLOCK = re.compile(r"> \*\*(配图|互动) ([FU]\d\d-\d)｜([^\n*]+)\*\*\n((?:> [^\n]*\n)*)")
FIELD = re.compile(r"\*\*([^*]+)\*\*：(.*)")


def contract() -> str:
    """从 00-style-contract.md 里取出那段用 ``` 围起来的契约正文。"""
    text = io.open(os.path.join(STITCH, "00-style-contract.md"), encoding="utf-8").read()
    m = re.search(r"```text\n(.*?)```", text, re.S)
    return m.group(1).rstrip() if m else ""


def fields(body: str) -> dict:
    """把区块里的 `> **键**：值` 逐行解析出来，续行并进上一个键。"""
    out, key = {}, None
    for line in body.splitlines():
        line = line[2:] if line.startswith("> ") else line.lstrip(">").strip()
        m = FIELD.match(line.strip())
        if m:
            key = m.group(1).strip()
            out[key] = m.group(2).strip()
        elif key and line.strip():
            out[key] += " " + line.strip()
    return out


def lead_in(text: str, at: int, chars: int = 700) -> str:
    """区块之前那一段正文——让模型知道这张图／这个实验在讲什么。

    产出会被塞进提示词的围栏代码块里，所以这里必须先把正文里的 ``` 围栏
    降级成缩进，否则贴出去的提示词会从中间断开。
    """
    head = text[:at].rstrip()
    # 回退到最近的一个二级标题，最多取 chars 个字
    cut = head.rfind("\n## ")
    seg = head[cut + 1:] if cut >= 0 else head
    seg = seg[-chars:]

    lines, inside = [], False
    for line in seg.splitlines():
        if line.lstrip().startswith("```"):
            inside = not inside
            continue
        if line.startswith("> "):          # 其它配图／互动区块，不要混进来
            continue
        lines.append(("    " + line) if inside and line.strip() else line)
    return "\n".join(lines).strip()


def render_figure(num, title, fid, label, f, lead):
    target = ""
    m = re.search(r"`([^`]+)`", f.get("形式", ""))
    if m:
        target = m.group(1)
    return f"""# {fid}｜{label}

- 课：第 {num} 课 · {title}
- 形式：{f.get('形式', '（未写）')}
- 目标文件：`{target or '（未写）'}`

## 路线 A（推荐）· 让能写代码的模型直接产出 SVG

把下面整段贴给 Claude / Codex：

```text
【任务】写一个 SVG，落到 apps/web/public/{target or 'assets/lessons/'}

【这张图在讲什么】
{lead}

【画什么】
{f.get('画什么', '（未写）')}

【必须标注】
{f.get('必须标注', '（未写）')}

【不要出现】
{f.get('不要出现', '（未写）')}

【替代文本（原样写进 <title> 与 <desc>）】
{f.get('替代文本', '（未写）')}

【硬约束】
  - viewBox="0 0 720 H"，width="100%" height="auto"，不写固定 px 宽度
  - 颜色写成带兜底值的 CSS 变量：
      --ink #17231f  --muted #68736d  --card #fffdf7  --line #c9cfc7
      --lime #bafa4b（配 --on-lime #4d7100）  --green #355e48  --tertiary #9c432c
  - 圆角 rx="8"（小徽章 rx="2"）
  - 不用滤镜／渐变／blur；要立体感就用 2px 3px 的实心偏移矩形
  - font-family="var(--font-ui)"，正文 13px、标签 11px、标题 15px
  - 箭头用统一的 <marker>
  - 中文直接写在 <text> 里，不要转曲线

【自检】
  - 「必须标注」的每一条都能在 <text> 里找到
  - 「不要出现」的每一条确实没有出现
```

## 路线 B · Stitch（仅当这张图本身就是界面示意）

先粘 `../00-style-contract.md` 的契约文本，再粘：

```text
【任务】
画一张界面示意图，它会作为插图嵌在文章里，不是一个可用的页面。

【画什么】
{f.get('画什么', '（未写）')}

【必须能看清这些文字】
{f.get('必须标注', '（未写）')}

【不要出现】
{f.get('不要出现', '（未写）')}

【尺寸】
宽 920px，高度自适应；四周内边距 24px；底色 #fffdf7，外面一圈 1px #c9cfc7 描边、8px 圆角。
不要标题栏，不要浏览器窗口装饰。
```
"""


SHELL = """1. 工具条：左边等宽小字「INTERACTIVE {num}」+ 下面一行组件标题；
   右边一枚状态药丸（未达成：浅底描边；达成：#bafa4b 实底 + #4d7100 字）"""

FOOT = """9. 判定条：整宽一条，未达成时浅底 + 次要色文字；达成时 #bafa4b 实底 + 深色文字 + 末尾 ✓
10. 脚注：12px 次要色一行，说明数据来自真实运行
11. 折叠的「展开代码」，收起时只是一行带三角的小标题"""

KINDS = {
    "ScenarioLab": {
        "states": "① 初始态  ② 改了控件但还没达成  ③ 达成态  ④ 结果里出现失败行（珊瑚色）",
        "body": """2. 控件区：左侧标签列 + 右侧控件列；720px 以下改上下堆叠
   分段按钮：并排方角按钮（4px 圆角），选中项 #bafa4b 实底 + 2px 3px 0 0 硬投影
   开关：方形复选框 + 一行说明文字，包在描边小卡里，打开时描边变 #355e48
   滑杆：细轨道 + 方形滑块，右侧一个等宽数值
3. 结果区：左右等宽两栏，720px 以下改上下堆叠
   左栏是定义列表，每行「标签 — 值」：标签 13px 次要色，值等宽加粗 13px 右对齐，
   行间虚线分隔，值有绿／珊瑚／灰三种色调；**标签不许被挤成竖排单字**
   右栏是 1–3 段说明，好的一段浅绿底圆角块，坏的一段珊瑚浅底圆角块，中性的是纯文字""",
    },
    "ClassifyLab": {
        "states": "① 全未答  ② 答对一部分（对与错各有样式）  ③ 全部答对",
        "body": """2. 题干：一小段说明文字，包在浅底圆角块里
3. 条目列表：每个条目是一张描边卡，卡内上方是条目文字（14px），
   下方是一排可选的归属按钮（方角 4px）。
   选对：按钮 #bafa4b 实底 + #4d7100 字，卡片描边变 #355e48，浅绿底
   选错：按钮珊瑚浅底 #ffe0d8 + #9c432c 字，卡片描边变珊瑚
   选完之后，卡片下方展开一行 13px 次要色的「依据」说明——对错都要显示
4. 顶部状态药丸显示「N / M 正确（已答 K）」，全对时变成「全部判断正确」""",
    },
    "OrderLab": {
        "states": "① 乱序（起始态）  ② 部分位置已正确  ③ 全部正确",
        "body": """2. 题干：一小段说明文字，包在浅底圆角块里
3. 有序列表：每一项是一张描边卡，左边一个 26px 方角序号块（等宽字），
   中间是条目标题 + 一行 12px 次要色补充说明，右边是上移／下移两个 32px 方形按钮。
   位置正确的那一项：描边 #355e48，底色 #e8efe9，序号块 #bafa4b 实底
   首项的上移与末项的下移按钮是禁用态（透明度 0.35）
4. 顶部状态药丸显示「N / M 个位置正确」，全对时变成「顺序正确」""",
    },
}


def render_ui(num, title, uid, label, f, lead, contract_text):
    state = f.get("状态", "")
    done = "已实现" in state
    kind = next((k for k in KINDS if k in state), "ScenarioLab")
    spec = KINDS[kind]
    banner = (
        f"> ⚠️ 这个实验**已经实现**（{state}）。\n"
        "> 下面的提示词只用于**换皮**：让 Stitch 出状态图，再把版式改进 `globals.css` 的 `.kit-*` 规则，\n"
        "> **不要**据此重写 `lab-kit.tsx` 的 DOM 结构——31 课的实验都挂在那套类名上，\n"
        "> 改结构等于同时改 31 课，Playwright 的验证脚本也是按这些类名找元素的。\n"
        if done else
        f"> 这个实验**还没实现**（{state}）。\n"
        "> 先让 Stitch 出状态图定版式，再用 `lab-kit.tsx` 里现成的骨架接数据与 compute()。\n"
    )
    kind_note = (
        f"- 骨架：`{kind}`（`apps/web/src/components/lab-kit.tsx`）"
        if done else
        f"- 建议骨架：`{kind}`（`apps/web/src/components/lab-kit.tsx`）"
    )
    return f"""# {uid}｜{label}

- 课：第 {num} 课 · {title}
- 状态：{state or '（未写）'}
{kind_note}

{banner}
## 可直接粘贴（契约 + 任务，已拼好；记得附 `../reference/` 里的截图）

```text
{contract_text}

【任务】
为第 {num} 课的互动实验「{label}」出**状态图**，不要做交互。
同一个组件画下面几个状态，纵向排列，每个状态上方标一行小字说明它是什么状态：
  {spec['states']}

【这个实验在教什么】
{lead}

【用户做什么】
{f.get('用户做什么', '（未写）')}

【屏幕上变什么】
{f.get('屏幕上变什么', '（未写）')}

【通过条件】
{f.get('通过条件', '（未写）')}

【小屏怎么排】
{f.get('小屏', '（未写）')}

【组件结构 · 从上到下】
{SHELL.format(num=num)}
{spec['body']}
{FOOT}

【硬约束】
  - 这个区块是全页唯一允许加宽到 920px 的部分，正文其余部分是 710px
  - 任何宽度下都不许出现整页横向滚动
  - 不要画鼠标指针、不要画「点击这里」的箭头引导

【输出】
桌面 1440px 和移动 390px 各一版。
```
"""


def main():
    contract_text = contract()
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    figs = uis = 0
    for path in sorted(glob.glob(os.path.join(LESSONS, "[0-9]*.md"))):
        text = io.open(path, encoding="utf-8").read()
        num = os.path.basename(path)[:2]
        tm = re.search(r'^title:\s*"([^"]+)"', text, re.M)
        title = tm.group(1) if tm else os.path.basename(path)
        for m in BLOCK.finditer(text):
            kind, ident, label, body = m.groups()
            f = fields(body)
            lead = lead_in(text, m.start())
            if kind == "配图":
                doc = render_figure(num, title, ident, label.strip(), f, lead)
                figs += 1
            else:
                doc = render_ui(num, title, ident, label.strip(), f, lead, contract_text)
                uis += 1
            io.open(os.path.join(OUT, f"{ident}.md"), "w", encoding="utf-8").write(doc)
    print(f"{OUT}\n  {figs} 张配图提示词 / {uis} 个互动提示词")


if __name__ == "__main__":
    main()
