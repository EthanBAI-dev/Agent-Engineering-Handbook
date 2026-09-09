# 第 1 课 · 半小时跑通 LangGraph 的两个核心概念

**这节课不需要任何 API Key，不花钱，不联网调模型。**
先把「图」跑起来，模型是后面的事。

学完你会有两个能跑的文件，和一句能对别人讲清楚的话：

> LangGraph 就是一个「带存档的状态机」。你写普通函数当节点，
> 它负责按边调度、把每一步存下来、允许中途停下来问人。

---

## Step 0 · 装环境（5 分钟）

```bash
python3 --version          # 需要 3.11 / 3.12 / 3.13
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -U langgraph
```

验证：

```bash
python -c "from langgraph.graph import StateGraph; print('ok')"
```

打印 `ok` 就成了。**本轨道验证过的版本是 langgraph 1.2.11 + Python 3.11。**

> 先别急着装 `langchain-openai`、配 Key。第 1、2 课都用不上。

---

## Step 1 · 最小的一张图（15 分钟）

先跑，再读。

```bash
python code/l01_simple_graph.py
```

你会看到三段输出：一段 Mermaid 图代码、两次调用的执行路径和结果。

代码在 [`code/l01_simple_graph.py`](code/l01_simple_graph.py)。下面拆开讲。

### 1）State：一块所有节点共用的白板

```python
class State(TypedDict):
    text: str
```

一整张图从头到尾只有这一份数据。节点读它，节点改它。
**别把它想成「参数」，想成「白板」。** 谁都能看，谁都能写。

### 2）Node：就是个普通函数

```python
def node_hello(state: State) -> dict:
    return {"text": state["text"] + " 你好"}
```

两条规矩，记死：

- **入参是完整的 state。**
- **返回值只写「要改的字段」，不是完整 state。** 没提到的字段原样保留。

### 3）Edge：连线。条件边靠一个「返回节点名」的函数

```python
def route(state: State) -> Literal["node_happy", "node_sad"]:
    return "node_happy" if "开心" in state["text"] else "node_sad"
```

**最容易搞混的一点：路由函数返回的是「下一个节点的名字」，不是状态。**
它不改数据，只做决定。

### 4）组装：四步，顺序固定

```python
builder = StateGraph(State)          # ① 声明白板长什么样
builder.add_node("node_hello", ...)  # ② 加节点
builder.add_edge(START, "node_hello")# ③ 连边
graph = builder.compile()            # ④ 编译成可运行的图
```

`START` 和 `END` 是两个内置的特殊节点，代表入口和出口。

### 打个比方

一张图就是**一条流水线上的工位表**。

- State = 传送带上那个箱子，所有工位都往里放东西。
- Node = 工位上的师傅，只管拿箱子、放东西、传下去。
- 条件边 = 质检员，他不动箱子，只喊「往左走」还是「往右走」。

### 练习（必做）

改 `l01_simple_graph.py`：

1. 给 State 加一个 `count: int` 字段，每个节点让它 +1，跑完打印。
2. 把 `node_happy` 的下一步从 `END` 改成回到 `node_hello`，跑一下会发生什么？

第 2 题会跑成死循环，最后抛 `GraphRecursionError`。
**这就是 LangGraph 的循环保护。** 我在 langgraph 1.2.11 上实测，默认上限是 10007 步
（不同版本不一样，别记数字，记住「有上限」就行）。
想快速看到效果就把它调小：`graph.invoke(x, {"recursion_limit": 5})`。

Agent 之所以能「反复思考」，靠的正是这种环，而不是 for 循环。

---

## Step 2 · 记忆和「停下来问人」（15 分钟）

```bash
python code/l02_state_memory.py
```

代码在 [`code/l02_state_memory.py`](code/l02_state_memory.py)。这节引入三个东西。

### 1）Reducer：决定「覆盖」还是「累加」

```python
class State(TypedDict):
    logs: Annotated[list[str], operator.add]   # 累加
    approved: bool                             # 覆盖
```

- **没有 reducer 的字段：后写的盖掉先写的。**
- **有 reducer 的字段：新旧两份按 reducer 合并。**

`logs` 用了 `operator.add`，所以四个节点各返回一条，最后攒成一个列表。
如果不写 `Annotated[...]`，最后只会剩最后一条。

> 后面聊天机器人里的 `add_messages`，本质就是一个更聪明的 reducer：
> 按 message id 判断是「追加新消息」还是「更新已有消息」。
> **Module 2 一整章都在讲这件事，因为大多数人就卡在这。**

### 2）Checkpointer：每一步都存档

```python
graph = builder.compile(checkpointer=InMemorySaver())
config = {"configurable": {"thread_id": "demo-1"}}
graph.invoke(..., config)
```

- **`checkpointer` = 存档功能本身。** 不加它，图跑完就忘光。
- **`thread_id` = 一条会话的身份证。** 同一个 id 接着上次的记忆走，换 id 就是重开一局。

`InMemorySaver` 存在内存里，进程一关就没了，学习够用。
上生产要换 SQLite / Postgres 的 saver——那是 Module 2 最后一节。

### 3）interrupt：把图停在半路，等人回话

```python
def review(state):
    decision = interrupt({"question": "这版草稿通过吗？(yes/no)"})
    ...
```

跑起来是这样：

```
第一次 invoke  →  停在 review，返回 __interrupt__，图没跑完
graph.invoke(Command(resume="yes"), config)  →  从 review 里面继续往下
```

**注意它是「函数中间停住、之后从原地继续」，不是重跑一遍。**
能做到这点，全靠上面那个 checkpointer——状态存下来了，才能恢复。

这就是所谓 human-in-the-loop：审批、纠错、确认，全是这一个机制。

### 时间旅行

```python
for snap in graph.get_state_history(config):
    print(snap.next, snap.values)
```

每一个存档点都还在，可以挑一个回去、改掉状态、换条路重跑。
Module 3 的 `time-travel.ipynb` 讲的就是这个。

### 练习（必做）

1. 把 `interrupt` 的回答改成 `"no"`，看是不是走到 `rewrite`。
2. 换一个 `thread_id` 再跑一次，观察 logs 是不是从空开始——**理解 thread_id 的作用全靠这一步。**
3. 把 `logs` 的 `Annotated[list[str], operator.add]` 改成普通 `list[str]`，看输出少了什么。

---

## Step 3 · 接上官方课程（5 分钟）

现在你已经理解了 State / Node / Edge / Reducer / Checkpointer / interrupt。
官方 Module 1 和 Module 2 的一大半你其实已经会了，去把剩下的补齐：

```bash
git clone https://github.com/langchain-ai/langchain-academy.git
cd langchain-academy
python3 -m venv lc-academy-env && source lc-academy-env/bin/activate
pip install -r requirements.txt
```

需要三个 Key：

| Key | 干什么 | 必需吗 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 调模型 | 是 |
| `LANGSMITH_API_KEY` | 看每一步的调用链路，调试全靠它 | **强烈建议**，免费额度够学 |
| `TAVILY_API_KEY` | 联网搜索工具 | Module 4 才用到 |

再顺手把 Studio 跑起来，它能把图画出来、点着跑：

```bash
cd module-1/studio
langgraph dev     # 打开 http://127.0.0.1:2024
```

**下一节按 [`01-syllabus.md`](01-syllabus.md) 的排期走：Module 1 的 `chain` → `router` → `agent`。**
那三节讲的是同一件事：把「路由」这条边接回它自己，就得到了一个 Agent。

---

## 这一课的速查表

| 概念 | 一句话 | 不用它会怎样 |
| --- | --- | --- |
| `State` | 全图共用的白板 | — |
| Node | 普通函数，返回「要改的字段」 | — |
| 条件边 | 返回下一个节点的名字，不改数据 | 图只能直线跑 |
| Reducer | 决定字段是覆盖还是合并 | 消息列表只剩最后一条 |
| `checkpointer` | 每一步存档 | 没记忆，不能中断恢复，不能时间旅行 |
| `thread_id` | 一条会话的身份证 | 所有用户共用一份记忆 |
| `interrupt` | 停在半路问人，之后原地继续 | 没法做审批和人工纠错 |

## 最后再说一遍

**LangGraph 的全部价值，是把「状态」和「控制流」从模型手里拿回到你手里。**
模型只负责在某个节点里做判断，走哪条边、存什么、什么时候停下来问你，都是你写死的。
这就是它跟「一个大 prompt 硬扛」的根本区别。
