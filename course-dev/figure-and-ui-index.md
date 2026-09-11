# 配图与互动 UI 索引

> 本文件由 `content/lessons/*.md` 自动汇总，**不是需求的来源**。
> 每一项的完整需求（画什么、必须标注、不要出现、替代文本、通过条件）写在课程正文里它该出现的位置，
> 写法规范见 [`docs/04-figure-and-ui-spec.md`](../docs/04-figure-and-ui-spec.md)。

当前共 **37 张配图**（全部待制作）、**31 个互动实验**（17 个已实现，14 个待开发）。

## 配图

| ID | 课 | 讲什么 | 形式与目标文件 |
| --- | ---: | --- | --- |
| `F00-1` | 00 | 两条学习路径最后会合 | 双轨流程图 · `assets/lessons/00-two-tracks.svg` |
| `F00-2` | 00 | 终端里你看到的三样东西 | 带标注的终端截图 · `assets/lessons/00-terminal-anatomy.png` |
| `F01-1` | 01 | State 的三个字段，两种命运 | 静态示意图 · `assets/lessons/01-state-fields.svg` |
| `F01-2` | 01 | 循环不是能力，是一条边 | 流程图 · `assets/lessons/01-conditional-edge.svg` |
| `F02-1` | 02 | 谁决定，谁执行 | 职责对照图 · `assets/lessons/02-who-does-what.svg` |
| `F02-2` | 02 | 一次工具调用产生四条消息 | 消息序列图 · `assets/lessons/02-message-sequence.svg` |
| `F03-1` | 03 | checkpointer 存的是快照，不是聊天记录 | 对照图 · `assets/lessons/03-checkpoint-vs-log.svg` |
| `F03-2` | 03 | 三种「记忆」不是一回事 | 分层对照图 · `assets/lessons/03-memory-layers.svg` |
| `F04-1` | 04 | 图真的停住了 | 带暂停态的流程图 · `assets/lessons/04-paused-graph.svg` |
| `F04-2` | 04 | 副作用写在哪一侧，差一倍 | 对照图 · `assets/lessons/04-side-effect-placement.svg` |
| `F05-1` | 05 | 四个部件拼成的完整蓝图 | 总览流程图 · `assets/lessons/05-blueprint.svg` |
| `F05-2` | 05 | 教学版与生产版的差距 | 并列对照表图 · `assets/lessons/05-teaching-vs-production.svg` |
| `F06-1` | 06 | 同一张图，换个模型只有一处会变 | 对照图 · `assets/lessons/06-same-graph-two-models.svg` |
| `F07-1` | 07 | 密钥只存在于中间那一层 | 三层时序图 · `assets/lessons/07-key-layers.svg` |
| `F08-1` | 08 | 一次请求走过的全程 | 泳道图 · `assets/lessons/08-request-path.svg` |
| `F09-1` | 09 | 三种粒度看到的是不同的东西 | 三列对照图 · `assets/lessons/09-stream-modes.svg` |
| `F10-1` | 10 | 预算判断必须在第一位 | 对照图 · `assets/lessons/10-route-order.svg` |
| `F11-1` | 11 | 两层防线 | 串联关卡图 · `assets/lessons/11-two-guards.svg` |
| `F12-1` | 12 | 两种静默失败 | 对照图 · `assets/lessons/12-silent-drops.svg` |
| `F13-1` | 13 | 并行时「覆盖」失去意义 | 对照图 · `assets/lessons/13-parallel-merge.svg` |
| `F14-1` | 14 | 三种方式各丢掉什么 | 三列对照图 · `assets/lessons/14-three-strategies.svg` |
| `F15-1` | 15 | 换个进程还在不在 | 对照图 · `assets/lessons/15-across-processes.svg` |
| `F16-1` | 16 | 三档风险，两条硬规则 | 分级表图 · `assets/lessons/16-risk-tiers.svg` |
| `F17-1` | 17 | 改字段不会重算依赖它的字段 | 对照图 · `assets/lessons/17-edit-vs-rerun.svg` |
| `F18-1` | 18 | 快照是位置，不只是数据 | 时间轴图 · `assets/lessons/18-snapshots.svg` |
| `F19-1` | 19 | 重试把一次失败放大成三次扣款 | 对照时序图 · `assets/lessons/19-retry-side-effect.svg` |
| `F20-1` | 20 | 五条验收路径 | 路径矩阵图 · `assets/lessons/20-acceptance-paths.svg` |
| `F21-1` | 21 | 串行 0.91 秒对并行 0.31 秒 | 时间线对照图 · `assets/lessons/21-serial-vs-parallel.svg` |
| `F22-1` | 22 | 扇出为 0 时下游整条被跳过 | 对照图 · `assets/lessons/22-empty-fanout.svg` |
| `F23-1` | 23 | 共享累加字段会被计两次 | 对照图 · `assets/lessons/23-shared-field-trap.svg` |
| `F24-1` | 24 | 校验夹在规划和执行之间 | 流程图 · `assets/lessons/24-plan-validate-execute.svg` |
| `F25-1` | 25 | 交接一定会丢东西 | 对照图 · `assets/lessons/25-handoff-loss.svg` |
| `F26-1` | 26 | 拒绝路径上模型根本不在场 | 流程图 · `assets/lessons/26-cite-or-refuse.svg` |
| `F27-1` | 27 | 总分会掩盖回归 | 逐例对照图 · `assets/lessons/27-per-case-diff.svg` |
| `F28-1` | 28 | 只有第二层是结构性的 | 同心防线图 · `assets/lessons/28-three-layers.svg` |
| `F29-1` | 29 | thread_id 不是身份 | 对照图 · `assets/lessons/29-ownership-check.svg` |
| `F30-1` | 30 | 三层记忆，三种生命周期 | 分层图 · `assets/lessons/30-three-memory-layers.svg` |

## 互动实验

| ID | 课 | 做什么 | 状态 |
| --- | ---: | --- | --- |
| `U00-1` | 00 | 五步流程预演 + 双轨步骤器 | 已实现 · `apps/web/src/components/lesson-zero-lab.tsx` |
| `U01-1` | 01 | 每点一次，只走一个节点 | 已实现 · `apps/web/src/components/lesson-one-lab.tsx` |
| `U02-1` | 02 | 跟着一条消息走完闭环 | 已实现 · `apps/web/src/components/lesson-two-lab.tsx` |
| `U03-1` | 03 | 把三条消息分配到正确的 thread | 已实现 · `apps/web/src/components/lesson-three-lab.tsx` |
| `U04-1` | 04 | 批准一条，拒绝一条 | 已实现 · `apps/web/src/components/lesson-four-lab.tsx` |
| `U05-1` | 05 | 把打乱的卡片排回去 | 已实现 · `apps/web/src/components/lesson-five-lab.tsx` |
| `U06-1` | 06 | 把每个决定分给模型或代码 | 已实现 · `apps/web/src/components/lesson-six-article.tsx`（用 `lab-kit` 的 ClassifyLab） |
| `U07-1` | 07 | 密钥该放在哪一层 | 已实现 · `apps/web/src/components/lesson-seven-article.tsx`（用 `lab-kit` 的 ScenarioLab） |
| `U08-1` | 08 | 把请求路径排回去 | 已实现 · `apps/web/src/components/lesson-eight-article.tsx`（用 `lab-kit` 的 OrderLab） |
| `U09-1` | 09 | 给同一次运行换粒度 | 已实现 · `apps/web/src/components/lesson-nine-article.tsx`（ScenarioLab） |
| `U10-1` | 10 | 调上限，看两条路径 | 已实现 · `apps/web/src/components/lesson-ten-article.tsx`（ScenarioLab） |
| `U11-1` | 11 | 让路由挡住三种坏输入 | 已实现 · `apps/web/src/components/lesson-eleven-article.tsx`（ScenarioLab） |
| `U12-1` | 12 | 找出消失的字段 | 已实现 · `apps/web/src/components/lesson-twelve-article.tsx`（ClassifyLab） |
| `U13-1` | 13 | 给字段配一条合并规则 | 已实现 · `apps/web/src/components/lesson-thirteen-article.tsx`（ScenarioLab） |
| `U14-1` | 14 | 在预算内保住关键事实 | 已实现 · `apps/web/src/components/lesson-fourteen-article.tsx`（ScenarioLab） |
| `U15-1` | 15 | 重启之后还在不在 | 已实现 · `apps/web/src/components/lesson-fifteen-article.tsx`（ScenarioLab） |
| `U16-1` | 16 | 给八个工具分级 | 已实现 · `apps/web/src/components/lesson-sixteen-article.tsx`（ClassifyLab） |
| `U17-1` | 17 | 三种反应 | 待开发 · 建议 `apps/web/src/components/lesson-seventeen-lab.tsx` |
| `U18-1` | 18 | 找出分岔点 | 待开发 · 建议 `apps/web/src/components/lesson-eighteen-lab.tsx` |
| `U19-1` | 19 | 让重试变安全 | 待开发 · 建议 `apps/web/src/components/lesson-nineteen-lab.tsx` |
| `U20-1` | 20 | 给验收清单挑漏洞 | 待开发 · 建议 `apps/web/src/components/lesson-twenty-lab.tsx` |
| `U21-1` | 21 | 把六个步骤排进两层 | 待开发 · 建议 `apps/web/src/components/lesson-twentyone-lab.tsx` |
| `U22-1` | 22 | 处理三种数量 | 待开发 · 建议 `apps/web/src/components/lesson-twentytwo-lab.tsx` |
| `U23-1` | 23 | 找出重复的那一条 | 待开发 · 建议 `apps/web/src/components/lesson-twentythree-lab.tsx` |
| `U24-1` | 24 | 审一份计划 | 待开发 · 建议 `apps/web/src/components/lesson-twentyfour-lab.tsx` |
| `U25-1` | 25 | 数一数丢了什么 | 待开发 · 建议 `apps/web/src/components/lesson-twentyfive-lab.tsx` |
| `U26-1` | 26 | 三个问题，三种结果 | 待开发 · 建议 `apps/web/src/components/lesson-twentysix-lab.tsx` |
| `U27-1` | 27 | 找出被弄坏的那一条 | 待开发 · 建议 `apps/web/src/components/lesson-twentyseven-lab.tsx` |
| `U28-1` | 28 | 三种注入，三层防线 | 待开发 · 建议 `apps/web/src/components/lesson-twentyeight-lab.tsx` |
| `U29-1` | 29 | 用两个账号试一次 | 待开发 · 建议 `apps/web/src/components/lesson-twentynine-lab.tsx` |
| `U30-1` | 30 | 三层记忆各管一段 | 待开发 · 建议 `apps/web/src/components/lesson-thirty-lab.tsx` |

## 怎样更新这份索引

```bash
python3 course-dev/scripts/build-figure-index.py
```

改了课程正文里的配图或互动区块之后重跑一次即可。
