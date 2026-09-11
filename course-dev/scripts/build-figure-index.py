#!/usr/bin/env python3
"""从课程正文汇总配图与互动 UI 索引。

需求的来源永远是 content/lessons/*.md 里的区块本身；这个脚本只生成一份总览，
方便看还剩多少没做。改完正文重跑一次即可。

用法：python3 course-dev/scripts/build-figure-index.py
"""
import io, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "course-dev", "figure-and-ui-index.md")

BLOCK = re.compile(r"> \*\*(配图|互动) ([FU]\d\d-\d)｜([^\n*]+)\*\*\n((?:> [^\n]*\n)*)")


def collect():
    rows = []
    for path in sorted(glob.glob(os.path.join(ROOT, "content", "lessons", "[0-9]*.md"))):
        num = os.path.basename(path)[:2]
        text = io.open(path, encoding="utf-8").read()
        for kind, fid, label, body in BLOCK.findall(text):
            form = re.search(r"\*\*(?:形式|状态)\*\*：([^\n]+)", body)
            rows.append((num, kind, fid, label.strip(), form.group(1).strip() if form else ""))
    return rows


def render(rows):
    figs = [r for r in rows if r[1] == "配图"]
    uis = [r for r in rows if r[1] == "互动"]
    done = sum(1 for r in uis if "已实现" in r[4])
    out = [
        "# 配图与互动 UI 索引", "",
        "> 本文件由 `content/lessons/*.md` 自动汇总，**不是需求的来源**。",
        "> 每一项的完整需求（画什么、必须标注、不要出现、替代文本、通过条件）写在课程正文里它该出现的位置，",
        "> 写法规范见 [`docs/04-figure-and-ui-spec.md`](../docs/04-figure-and-ui-spec.md)。", "",
        f"当前共 **{len(figs)} 张配图**（全部待制作）、**{len(uis)} 个互动实验**"
        f"（{done} 个已实现，{len(uis) - done} 个待开发）。", "",
        "## 配图", "", "| ID | 课 | 讲什么 | 形式与目标文件 |", "| --- | ---: | --- | --- |",
    ]
    out += [f"| `{fid}` | {num} | {label} | {form} |" for num, _, fid, label, form in figs]
    out += ["", "## 互动实验", "", "| ID | 课 | 做什么 | 状态 |", "| --- | ---: | --- | --- |"]
    out += [f"| `{fid}` | {num} | {label} | {form} |" for num, _, fid, label, form in uis]
    out += ["", "## 怎样更新这份索引", "", "```bash",
            "python3 course-dev/scripts/build-figure-index.py", "```", "",
            "改了课程正文里的配图或互动区块之后重跑一次即可。"]
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    rows = collect()
    io.open(OUT, "w", encoding="utf-8").write(render(rows))
    figs = sum(1 for r in rows if r[1] == "配图")
    print(f"{OUT}\n  {figs} 张配图 / {len(rows) - figs} 个互动")
