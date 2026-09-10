import Link from "next/link";

const REPO = "https://github.com/EthanBAI-dev/Agent-Engineering-Handbook";

const phases = [
  {
    id: "PHASE 01",
    title: "浏览器内仿真",
    body: "当前实现：纯前端状态机，零依赖、零配置，打开就能单步执行。",
    status: "● 当前在线",
    state: "live" as const,
  },
  {
    id: "PHASE 02",
    title: "真图后端介入",
    body: "下一步：/api/agent 接上真实 Python LangGraph，流式回传节点事件。",
    status: "○ 研发阶段",
    state: "next" as const,
  },
  {
    id: "PHASE 03",
    title: "限额与熔断",
    body: "规划中：Token 预算熔断、沙盒执行防护与调用审计。",
    status: "○ 规范制定",
    state: "planned" as const,
  },
  {
    id: "PHASE 04",
    title: "云持久化",
    body: "远期：进度跨端漫游、多轮状态分支存档与评测报告。",
    status: "○ 长期目标",
    state: "planned" as const,
  },
];

export function Disclosure({ fullLessonHref }: { fullLessonHref: string }) {
  return (
    <section className="disclosure" id="disclosure" aria-labelledby="disclosure-title">
      <div className="disclosure-head">
        <p className="eyebrow">ENGINEERING DISCLOSURE</p>
        <h2 id="disclosure-title">不用先装环境。<br />从看见 Agent 走第一步开始。</h2>
        <p>
          页面上跑的是仿真器，不是真实 LangGraph 运行时——这一点我们写在明面上，
          不玩文字游戏。真实代码在每一课的「展开真实 Python 代码」里，也在仓库中。
        </p>
      </div>

      <div className="disclosure-split">
        <div className="roadmap-panel">
          <div className="panel-head">
            <h3>演进路线图 <span>Technical Roadmap</span></h3>
            <span className="panel-badge">已发布 v1.0</span>
          </div>

          <ol className="phase-flow">
            {phases.map((phase) => (
              <li className={`phase phase-${phase.state}`} key={phase.id}>
                <div className="phase-top">
                  <span className="phase-id">{phase.id}</span>
                  <i aria-hidden="true" />
                </div>
                <strong>{phase.title}</strong>
                <p>{phase.body}</p>
                <span className="phase-status">{phase.status}</span>
              </li>
            ))}
          </ol>

          <div className="panel-foot">
            <span>Runtime：浏览器端状态机仿真 · 非 LangGraph 运行时</span>
            <a href={REPO} rel="noopener noreferrer" target="_blank">
              在 GitHub 看 Python 原始工程 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <aside className="tier-panel">
          <div className="panel-head">
            <span className="panel-kicker">透明度对比</span>
            <span className="panel-badge">公平声明</span>
          </div>
          <h3>精简版 vs 完整版</h3>
          <p className="tier-lede">
            互动实验两版完全一样。完整版另外补上真实代码、边界条件、常见误区和排查清单。
          </p>

          <div className="tier-item">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>精简版（当前免费阅读）</strong>
              <small>核心心智模型短文、全套交互流程图、单步仿真器，零门槛直接操作。</small>
            </div>
          </div>
          <div className="tier-item">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>完整版</strong>
              <small>逐行 Python 代码、常见误区、排查清单，以及本地跑通的完整步骤。</small>
            </div>
          </div>

          <Link className="tier-cta" href={fullLessonHref}>
            读完整版第 01 课 <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>
    </section>
  );
}
