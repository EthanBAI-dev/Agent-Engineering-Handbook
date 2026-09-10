"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type TermProps = {
  children: ReactNode;
  definition: string;
};

/** 浮层与视口边缘至少留这么多。 */
const EDGE_MARGIN = 12;

/**
 * 浮层默认以词为中心。词靠近视口边缘时，居中定位一定会把它顶出去，纯 CSS 夹不住。
 *
 * 注意：`visibility: hidden` 的浮层仍然占布局，照样会把页面撑宽。
 * 所以每个浮层在挂载时就要先归位，不能等到用户碰它。
 */
function clamp(element: HTMLElement | null) {
  if (!element) return;
  element.style.setProperty("--term-shift", "0px");
  const rect = element.getBoundingClientRect();
  if (!rect.width) return;
  const viewport = document.documentElement.clientWidth;
  let shift = 0;
  if (rect.left < EDGE_MARGIN) shift = EDGE_MARGIN - rect.left;
  else if (rect.right > viewport - EDGE_MARGIN) shift = viewport - EDGE_MARGIN - rect.right;
  element.style.setProperty("--term-shift", `${Math.round(shift)}px`);
}

/** 视口变化时所有浮层都要重算。一个页面只挂一个监听，用引用计数管生命周期。 */
let listeners = 0;
let frame = 0;
const clampAll = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>(".term-popover").forEach(clamp);
  });
};

export function Term({ children, definition }: TermProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    clamp(popoverRef.current);
    listeners += 1;
    if (listeners === 1) window.addEventListener("resize", clampAll);
    return () => {
      listeners -= 1;
      if (listeners === 0) {
        window.removeEventListener("resize", clampAll);
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  const reposition = () => clamp(popoverRef.current);

  return (
    <span
      className={`term ${open ? "is-open" : ""}`}
      onMouseEnter={reposition}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        className="term-trigger"
        aria-expanded={open}
        aria-describedby={tooltipId}
        onFocus={reposition}
        onClick={() => {
          reposition();
          setOpen((value) => !value);
        }}
      >
        {children}
      </button>
      <span className="term-popover" id={tooltipId} role="tooltip" ref={popoverRef}>
        <span>术语说明</span>
        {definition}
      </span>
    </span>
  );
}
