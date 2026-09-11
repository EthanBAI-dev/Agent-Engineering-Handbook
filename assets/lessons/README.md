# 课程配图

`content/lessons/` 里每个 `> **配图 Fxx｜...**` 区块对应这里的一个文件。

## 命名

```
assets/lessons/<课号>-<figure-id>.<ext>
例：assets/lessons/01-state-fields.svg
```

课号两位，`figure-id` 用短横线小写，和课文里的 ID 一致。

## 格式

- **流程、状态、职责边界** → Mermaid `.mmd` 源文件 + 导出的 `.svg`，两者一起入库
- **需要手绘布局的示意** → `.excalidraw` 源文件 + 导出的 `.svg`
- **截图** → `.png`，2x，并在课文里写明截取自哪个页面或脚本

源文件必须入库，否则后人改不了。导出用 `bash scripts/render-diagrams.sh`。

## 规范

视觉规范见 [`docs/02-visual-system.md`](../../docs/02-visual-system.md)，
配图与互动 UI 的写法规范见 [`docs/04-figure-and-ui-spec.md`](../../docs/04-figure-and-ui-spec.md)。
