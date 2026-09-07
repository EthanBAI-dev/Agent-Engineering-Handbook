# 常用图表起手式

直接复制改。配色令牌见 `docs/02-visual-system.md` §3。

## 1. Agent 执行循环（flowchart）

```mermaid
flowchart LR
    U[用户指令] --> P{信息够吗}
    P -->|不够| T[调用工具]
    T --> O[观察结果]
    O --> P
    P -->|够| A[产出变更]
    A --> V{验证通过}
    V -->|否| P
    V -->|是| D[交付]

    classDef primary fill:#2563EB,stroke:#1E40AF,color:#fff
    classDef muted fill:#F1F5F9,stroke:#CBD5E1,color:#0F172A
    class P,V primary
    class T,O muted
```

## 2. 多方交互（sequenceDiagram）

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as Claude Code
    participant M as MCP Server
    participant R as 仓库
    U->>C: 描述任务
    C->>R: 读取相关文件
    C->>M: 调用外部工具
    M-->>C: 返回结果
    C->>R: 写入变更
    C->>C: 运行测试
    C-->>U: 汇报 + diff
```

## 3. 分层加载（flowchart + subgraph）

```mermaid
flowchart TB
    subgraph G[全局层 ~/.claude/]
        G1[settings.json]
        G2[CLAUDE.md]
    end
    subgraph P[项目层 ./.claude/]
        P1[settings.json]
        P2[CLAUDE.md]
    end
    subgraph D[目录层 ./src/module/]
        D1[CLAUDE.md]
    end
    G --> P --> D --> S[本次会话的有效配置]
```

## 4. 取舍象限（quadrantChart）

```mermaid
quadrantChart
    title 任务该交给谁
    x-axis 低确定性 --> 高确定性
    y-axis 低复杂度 --> 高复杂度
    quadrant-1 人工设计 + Agent 执行
    quadrant-2 纯人工
    quadrant-3 脚本自动化
    quadrant-4 Agent 全自动
    "重构模块": [0.35, 0.75]
    "批量重命名": [0.9, 0.3]
    "架构决策": [0.2, 0.9]
    "写单测": [0.75, 0.45]
```

## 5. 演进时间线（timeline）

```mermaid
timeline
    title 编码 Agent 的能力演进
    补全时代 : 单行补全 : 无上下文
    对话时代 : 多轮对话 : 手工粘贴上下文
    Agent 时代 : 自主读写文件 : 自主执行验证
    协议时代 : MCP 标准化 : 跨工具复用
```

## 6. 终端演示（VHS `.tape`）

```tape
Output assets/diagrams/demo.gif
Set FontSize 20
Set Width 1200
Set Height 700
Set Theme "Catppuccin Mocha"
Set TypingSpeed 40ms
Set Padding 24

Type "claude"
Enter
Sleep 2s
Type "先给我一个方案，别改代码"
Enter
Sleep 8s
```

## 7. HTML 数据图骨架（配 Playwright 截图）

```html
<!-- assets/diagrams/src/context-budget.html -->
<style>
  :root { --ink:#0F172A; --line:#CBD5E1; --primary:#2563EB; --warn:#D97706; }
  body { margin:0; width:1200px; height:630px; display:grid; place-items:center;
         font:14px/1.6 "Noto Sans SC", system-ui; color:var(--ink); background:#fff; }
  .bar { display:flex; width:900px; height:64px; border-radius:8px; overflow:hidden; }
  .seg { display:grid; place-items:center; color:#fff; font-size:12px; }
</style>
<div class="bar">
  <div class="seg" style="flex:3;background:var(--primary)">系统提示词</div>
  <div class="seg" style="flex:5;background:var(--warn)">MCP 工具定义</div>
  <div class="seg" style="flex:12;background:var(--ink)">对话历史</div>
  <div class="seg" style="flex:6;background:var(--line);color:var(--ink)">可用余量</div>
</div>
```
