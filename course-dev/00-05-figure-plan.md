# 00–05 教学图与互动计划

> 原则：图只承担文字难以同时表达的流程、状态变化或职责边界；不添加装饰性插画。

## 00 · 双轨学习路线

| 字段 | 内容 |
| --- | --- |
| 教学主张 | 学习者可以先在网页建立直觉，也可以在本地验证真实代码，两条路径最终会合。 |
| 数据来源 | `content/lessons/00-preface-and-setup.md` 的课程路径与 `lab/langgraph/README.md` 第 8–36 行。 |
| 形式 | 双轨流程图。 |
| 必要标注 | 网页路径“不安装/无 Key”；本地路径“终端/uv/Python”；会合点“同一实验结果”。 |
| 禁止元素 | 假终端输出、云端沙箱、未经实现的登录或支付界面。 |
| 目标位置 | 00 课“你有两条学习路径”之后。 |
| 移动端 | 两轨上下排列。 |

## 01 · Node、Edge 与 State diff

| 字段 | 内容 |
| --- | --- |
| 教学主张 | 每个 Node 返回局部更新；条件 Edge 根据更新后的 State 决定循环或退出。 |
| 数据来源 | `01_hello_graph.py` 第 21–56 行和脚本实跑输出。 |
| 形式 | 可单步执行流程图 + State 前后差异。 |
| 必要标注 | 当前 Node、刚走过的 Edge、`count` 覆盖、`log` 追加、阈值 4/6。 |
| 禁止元素 | 模型头像、聊天气泡、把 reducer 画成数据库。 |
| 目标位置 | 01 课“互动实验”处。 |
| 移动端 | 流程横向滚动，State diff 放在下方。 |

## 02 · model 与 tools 职责循环

| 字段 | 内容 |
| --- | --- |
| 教学主张 | model 生成 tool call，ToolNode 执行函数，结果必须沿 `tools → model` 返回。 |
| 数据来源 | `02_tool_agent.py` 第 19–55 行；`add=477`、`word_count=5` 来自函数。 |
| 形式 | 循环图 + 同步增长的 MessagesState。 |
| 必要标注 | HumanMessage、AIMessage(tool call)、ToolMessage、最终 AIMessage。 |
| 禁止元素 | 暗示网页模拟正在调用真实模型；把 ToolNode 标成决策者。 |
| 目标位置 | 02 课“互动实验”处。 |
| 移动端 | 图与消息列表上下排列。 |

## 03 · 两个 thread 的隔离

| 字段 | 内容 |
| --- | --- |
| 教学主张 | checkpointer 保存 State，`thread_id` 决定加载哪一组 checkpoint。 |
| 数据来源 | `03_memory.py` 第 24–48 行。 |
| 形式 | thread a / thread b 双列时间线。 |
| 必要标注 | 每次 ask 的目标 thread、各自 messages 数量、切换与返回。 |
| 禁止元素 | 把 `thread_id` 画成登录认证；暗示 InMemorySaver 可跨进程可靠保存。 |
| 目标位置 | 03 课“互动实验”处。 |
| 移动端 | 使用 thread 切换标签，仍显示另一 thread 的消息数量。 |

## 04 · 暂停与恢复

| 字段 | 内容 |
| --- | --- |
| 教学主张 | 危险操作前的 interrupt 会暂停图；同一 thread 的 resume 值让节点重新执行并继续。 |
| 数据来源 | `04_human_in_the_loop.py` 第 25–75 行和脚本实跑输出。 |
| 形式 | 带暂停态的流程图 + yes/no 分支。 |
| 必要标注 | interrupt payload、checkpoint、thread_id、批准/拒绝结果、节点重新执行提示。 |
| 禁止元素 | 真实删除动画；“从代码行原地恢复”的错误表述。 |
| 目标位置 | 04 课“互动实验”处。 |
| 移动端 | 审批卡片覆盖在流程下方，不遮挡路径和目标。 |

## 05 · 完整 Agent 蓝图

| 字段 | 内容 |
| --- | --- |
| 教学主张 | 可信 Agent 通过职责分离组合 State、工具循环、记忆和审批，而不是让 model 包办一切。 |
| 数据来源 | 01–04 课已验证机制的编辑整合。 |
| 形式 | 可拖拽组件蓝图与约束检查清单。 |
| 必要标注 | safe/risky tools 分流、approval 拒绝路径、checkpointer、同一 thread、生产缺口。 |
| 禁止元素 | 声称存在未实现的完整源码；把 InMemorySaver、thread_id 或提示词当安全边界。 |
| 目标位置 | 05 课“完整蓝图”和“互动挑战”处。 |
| 移动端 | 组件改为点选排序，避免小屏拖拽精度问题。 |

