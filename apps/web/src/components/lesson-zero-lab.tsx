"use client";

import { useMemo, useState } from "react";

type Track = "browser" | "local";
type SetupStep = { title: string; detail: string; command?: string };

const flowSteps = [
  { node: "输入", note: "任务进入图。现在还没有任何节点执行。" },
  { node: "Node", note: "节点读取当前 State，只完成一小步工作。" },
  { node: "State", note: "节点返回的变化被写回 State，现场因此得到更新。" },
  { node: "Edge", note: "Edge 读取当前结果，选择下一站或结束。" },
  { node: "输出", note: "图到达 END。之后还可以保存、恢复或等待人类。" },
];

const tracks: Record<Track, SetupStep[]> = {
  browser: [
    { title: "认识流程", detail: "点击上方的“让图走一步”，看 Node、State 和 Edge 怎样接力。" },
    { title: "进入第 01 课", detail: "逐步运行确定性动画，不安装软件，也不需要 API Key。" },
    { title: "完成挑战", detail: "把循环阈值改成 6，用结果证明自己看懂了。" },
  ],
  local: [
    { title: "打开 PowerShell", detail: "按 Win 键，搜索 PowerShell，然后打开。", command: "PowerShell" },
    { title: "检查工具", detail: "三行应分别显示 Python、uv 和 Git 的版本。", command: "python --version\nuv --version\ngit --version" },
    { title: "进入实验目录", detail: "命令必须在包含 pyproject.toml 的目录运行。", command: "Set-Location -LiteralPath 'D:\\Projects\\AIagent\\Agent-Engineering-Handbook\\lab\\langgraph'\nGet-Location" },
    { title: "准备依赖", detail: "uv 会按项目清单准备可复现的 Python 环境。", command: "uv sync" },
    { title: "运行第一个图", detail: "它不调用模型；看到“最终 state”就成功了。", command: "uv run python examples/01_hello_graph.py" },
  ],
};

export function LessonZeroLab() {
  const [flowStep, setFlowStep] = useState(0);
  const [track, setTrack] = useState<Track>("browser");
  const [setupStep, setSetupStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const selectedSteps = tracks[track];
  const setupComplete = setupStep >= selectedSteps.length;
  const activeSetup = selectedSteps[Math.min(setupStep, selectedSteps.length - 1)];
  const flowComplete = flowStep === flowSteps.length - 1;
  const progress = useMemo(
    () => Math.round((Math.min(setupStep, selectedSteps.length) / selectedSteps.length) * 100),
    [selectedSteps.length, setupStep],
  );

  const chooseTrack = (next: Track) => {
    setTrack(next);
    setSetupStep(0);
    setCopied(false);
  };

  const copyCommand = async () => {
    if (!activeSetup.command || !navigator.clipboard) return;
    await navigator.clipboard.writeText(activeSetup.command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="chapter-lab zero-lab" aria-label="第 00 课起步互动实验">
      <div className="lab-toolbar">
        <div>
          <p className="panel-kicker">INTERACTIVE 00</p>
          <h3>先让一张最小的图走起来</h3>
        </div>
        <span className={`status-pill ${flowComplete ? "status-end" : ""}`} aria-live="polite">
          {flowComplete ? "第一次运行完成" : `步骤 ${flowStep + 1} / ${flowSteps.length}`}
        </span>
      </div>

      <div className="zero-flow" aria-label="LangGraph 最小运行流程">
        {flowSteps.map((step, index) => (
          <div className="zero-flow-part" key={step.node}>
            <div className={`zero-flow-node ${index === flowStep ? "current" : ""} ${index < flowStep ? "visited" : ""}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.node}</strong>
            </div>
            {index < flowSteps.length - 1 && <i className={index < flowStep ? "active" : ""}>→</i>}
          </div>
        ))}
      </div>

      <div className="zero-explanation" aria-live="polite">
        <span>这一刻发生了什么？</span>
        <p>{flowSteps[flowStep].note}</p>
      </div>

      <div className="lab-controls zero-flow-controls">
        <button
          className="primary-button"
          type="button"
          onClick={() => setFlowStep((value) => Math.min(value + 1, flowSteps.length - 1))}
          disabled={flowComplete}
        >
          {flowComplete ? "这条图已经走完" : "让图走一步"}<span aria-hidden="true">→</span>
        </button>
        <button type="button" onClick={() => setFlowStep(0)}>重新开始</button>
      </div>

      <section className="track-picker" aria-labelledby="track-title">
        <div className="track-picker-heading">
          <div>
            <p className="panel-kicker">CHOOSE YOUR TRACK</p>
            <h4 id="track-title">现在选择你的起步方式</h4>
          </div>
          <div className="track-tabs" role="tablist" aria-label="选择学习路径">
            <button type="button" role="tab" aria-selected={track === "browser"} className={track === "browser" ? "selected" : ""} onClick={() => chooseTrack("browser")}>只用网页</button>
            <button type="button" role="tab" aria-selected={track === "local"} className={track === "local" ? "selected" : ""} onClick={() => chooseTrack("local")}>本地运行</button>
          </div>
        </div>

        <div className="setup-workspace">
          <ol className="setup-steps">
            {selectedSteps.map((step, index) => (
              <li key={step.title} className={index === setupStep ? "current" : index < setupStep ? "complete" : ""}>
                <span>{index < setupStep ? "✓" : index + 1}</span>
                <div><strong>{step.title}</strong><small>{index < setupStep ? "已完成" : index === setupStep ? "正在进行" : "稍后"}</small></div>
              </li>
            ))}
          </ol>

          <div className="setup-panel">
            <div className="setup-progress"><i style={{ width: `${progress}%` }} /></div>
            {setupComplete ? (
              <div className="setup-success" aria-live="polite">
                <span>✓</span>
                <h4>{track === "browser" ? "可以进入第 01 课了" : "本地环境已经够用"}</h4>
                <p>{track === "browser" ? "先学流程，等课程需要真实模型时再配置 API。" : "网页无法读取你的终端；这里记录的是你的自检结果。"}</p>
              </div>
            ) : (
              <>
                <p className="panel-kicker">STEP {String(setupStep + 1).padStart(2, "0")}</p>
                <h4>{activeSetup.title}</h4>
                <p>{activeSetup.detail}</p>
                {activeSetup.command && (
                  <div className="command-card">
                    <pre><code>{activeSetup.command}</code></pre>
                    {activeSetup.command !== "PowerShell" && <button type="button" onClick={copyCommand}>{copied ? "已复制 ✓" : "复制命令"}</button>}
                  </div>
                )}
                <button className="primary-button setup-next" type="button" onClick={() => setSetupStep((value) => value + 1)}>
                  {track === "local" ? "我已在终端完成" : "我理解了"}<span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>
        </div>
        <p className="simulation-note">提示：网页只能教你命令和判断标准，不能自动读取你的电脑或终端结果。</p>
      </section>
    </div>
  );
}
