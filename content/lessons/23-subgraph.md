---
title: "Subgraph：封装很简单，State 对接才是坑"
slug: "23-subgraph"
order: 23
status: "draft"
interactive: "shared-field-trap"
verified_at: "2026-09-10"
runtime_note: "父子共享累加字段导致重复计数的行为，及两种修法均已在 langgraph 1.2.11 实跑验证；不需要 API Key"
---

# Subgraph：封装很简单，State 对接才是坑

> 本课结果：你能把一段流程抽成可复用的子图，并避开父子共享字段被重复计数的陷阱。

## 只看一句话的话

把编译好的图当节点加进去就行——真正会咬人的是父子两张图共享字段时的合并行为。

> **术语说明**
>
> - **子图（subgraph）**：一张独立编译的图，被当作另一张图里的一个节点使用。
> - **共享字段**：父图和子图的 schema 里同名的字段，它们会自动对接。

审批流程在第 16、20 课出现了两次，两次都是复制粘贴。第三次再复制，就该抽成子图了。

## 语法只有一行

```python
approval = approval_graph.compile()      # 子图，单独编译

main.add_node("approval", approval)      # 直接当节点用
```

没有特殊 API，也不用注册。子图和普通节点在父图眼里没有区别。

**难的不在这里。**

## 先看那个坑

父子两张图都有一个 `audit` 字段，都带 `operator.add`：

```python
class Shared(TypedDict):
    audit: Annotated[list[str], operator.add]
```

父图写一次，子图写一次。实跑结果：

```text
{'audit': ['父图做了一件事', '父图做了一件事', '子图做了一件事']}
```

「父图做了一件事」出现了**两次**。父图只写过一次。

## 更糟的是：子图什么都不写，照样重复

把子图的节点改成 `lambda s: {}`——一个字都不写：

```text
{'audit': ['父图做了一件事', '父图做了一件事']}
```

还是重复了。

**子图只是在自己的 schema 里声明了这个字段，就足以触发。**

机制是这样：子图执行时会拿到父图当前的完整值（`['父图做了一件事']`），结束时把它看到的值写回父图，而父图的 `operator.add` reducer 又把它累加了一次。

> 这个行为和 `interrupt` 无关，也和子图写不写这个字段无关。只要**共享字段带 reducer**，就会发生。

## 修法一：子图用自己的字段名

```python
class SubOwn(TypedDict):
    sub_audit: Annotated[list[str], operator.add]     # 换个名字
```

实跑结果：

```text
{'audit': ['父图做了一件事'], 'sub_audit': ['子图做了一件事']}
```

各写各的，谁也不碰谁。需要合并时在父图里显式合并——**显式比隐式安全**。

## 修法二：共享字段用覆盖型

```python
class SubStatus(TypedDict):
    status: str          # 没有 reducer，覆盖型
```

实跑结果：

```text
{'audit': ['父图做了一件事'], 'status': 'done'}
```

覆盖型字段不会被累加，所以可以安全共享。

**这也给出了一条设计原则：父子之间的接口用覆盖型字段传，累加型字段各留各的。**

## 一个真正能用的审批子图

```python
class ApprovalState(TypedDict):
    action: str                                    # 输入：覆盖型，安全共享
    approved: bool                                 # 输出：覆盖型，安全共享
    sub_audit: Annotated[list[str], operator.add]  # 子图私有的累加字段
```

三个字段分成两类，正好对应上面两条修法。实跑结果：

```text
子图把整张图停住了：批准 删除缓存 吗？ → 'yes'
结果：已执行 删除缓存
父图轨迹：['准备执行', '执行完成']
子图轨迹：['提出申请：删除缓存', '人工批准']
```

父图轨迹干净了，两条轨迹各自完整。

注意「子图把**整张图**停住了」：子图里的 `interrupt` 会让父图一起暂停，checkpointer 在父图上编译即可，子图不用单独配。

## 子图能单独跑、单独测

```python
solo = approval_graph.compile(checkpointer=InMemorySaver())
```

实跑结果：

```text
只跑子图：approved=True sub_audit=['提出申请：单独测试', '人工批准']
```

**这是抽子图最实在的好处。**审批逻辑可以脱离业务流程单独验收——第 20 课那五条验收路径，现在可以只针对审批子图写一遍，业务流程改了也不用重跑。

> **配图 F23-1｜共享累加字段会被计两次**
> **形式**：对照图 · `assets/lessons/23-shared-field-trap.svg`
> **画什么**：上栏父子共享 `audit`——子图把看到的完整值写回，父图 reducer 再累加一次，
> 结果里「父图做了一件事」出现两次并标红；下栏子图改用自己的字段名，两条轨迹各自干净。
> **必须标注**：触发条件是「在 schema 里声明」，与子图写不写、与 interrupt 都无关。
> **不要出现**：把它画成 LangGraph 的 bug——这是共享字段合并语义的自然结果。
> **替代文本**：父子图共享带 reducer 的字段时，父图已有的值会被回写并再累加一次，改用不同字段名可避免。

## 什么时候该抽子图

| | 判断 |
| --- | --- |
| 该抽 | 同一段流程出现第三次 |
| 该抽 | 这段流程需要单独测试 |
| 该抽 | 它有自己的失败与重试逻辑 |
| 不该抽 | 只是想让主图看起来短一点 |

最后一条值得展开：把节点从主图挪进子图，复杂度没有消失，只是换了个地方，而且多了一层 State 对接要操心。**行数不是复杂度。**

## 互动实验：找出重复的那一条

网页实验给你一个父图和一个子图，运行后审计轨迹里有一条重复了。你要：

```text
1. 指出是哪一条重复
2. 说出它为什么重复（提示：看两张图的 schema）
3. 用两种修法各修一次
```

通过条件：两种修法都让轨迹正确，并说出各自适合什么场景。

> **互动 U23-1｜找出重复的那一条**
> **状态**：待开发 · 建议 `apps/web/src/components/lesson-twentythree-lab.tsx`
> **用户做什么**：跑一遍父图，找出审计轨迹里重复的那一条，再用两种修法各修一次。
> **屏幕上变什么**：并排显示父子两张图的 schema，共享且带 reducer 的字段自动标黄；
> 修法生效后轨迹里的重复项消失。
> **通过条件**：两种修法都让轨迹正确，并说出各自适合什么场景。
> **小屏**：两张 schema 上下排列，轨迹在最下方。

## 自己运行真实代码

完整代码位于 [`lab/langgraph/examples/23_subgraph.py`](../../lab/langgraph/examples/23_subgraph.py)，**不需要 API Key**：

```powershell
uv run python examples/23_subgraph.py
```

这一课的坑是写脚本时真的踩到的：原本的审批子图和父图共享 `audit`，跑出来轨迹里「准备执行」出现两次。查清楚之后，整个例子围绕这个发现重写了。

## 本课挑战：这个子图会怎样出错

```python
class MainState(TypedDict):
    messages: Annotated[list, add_messages]
    result: str

class SubState(TypedDict):
    messages: Annotated[list, add_messages]     # 和父图共享
    draft: str
```

问题：`messages` 是父子共享的累加字段。

子图跑完之后，父图已有的消息会被再追加一遍——对话历史里每条消息都出现两次。而且因为 `add_messages` 按 id 合并，具体表现取决于消息 id 是否相同，可能是重复，也可能是部分覆盖，**比列表重复更难查**。

修法：子图用自己的字段名（比如 `sub_messages`），或者只把需要的那几条消息作为覆盖型字段传进去。

## 三个常见误区

### 「子图不写那个字段就不会有问题」

实跑证明只要在 schema 里声明就会触发。判断依据是 schema，不是节点代码。

### 「抽成子图之后主图更简单了」

主图的行数少了，但多了一层 State 对接。只有在需要复用或需要单独测试时，这个代价才划算。

### 「子图需要自己的 checkpointer」

子图里的 `interrupt` 会让整张图暂停，checkpointer 在父图上编译即可。只有单独跑子图时才需要给它配一个。

## 本课带走三句话

- 父子共享的累加字段会被重复计数，只要在 schema 里声明就会触发
- 接口用覆盖型字段传，累加型字段各留各的
- 抽子图的理由是复用和单独测试，不是让主图看起来短

## 下一课

图的结构工具齐了：并行、扇出、封装。下一课换个角度——先把计划写下来，再执行。

[进入第 24 课：Planner–Executor，先规划再执行](24-planner-executor.md)
