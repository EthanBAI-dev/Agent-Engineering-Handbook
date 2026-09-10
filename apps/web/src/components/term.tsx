"use client";

import { useId, useState, type ReactNode } from "react";

type TermProps = {
  children: ReactNode;
  definition: string;
};

export function Term({ children, definition }: TermProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`term ${open ? "is-open" : ""}`}
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
        onClick={() => setOpen((value) => !value)}
      >
        {children}
      </button>
      <span className="term-popover" id={tooltipId} role="tooltip">
        <span>术语说明</span>
        {definition}
      </span>
    </span>
  );
}
