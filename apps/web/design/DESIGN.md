---
name: Agent Hands-on Lab Design System
colors:
  surface: '#effdf6'
  surface-dim: '#cfddd7'
  surface-bright: '#effdf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f7f0'
  surface-container: '#e3f1ea'
  surface-container-high: '#ddebe5'
  surface-container-highest: '#d8e6df'
  on-surface: '#121e1a'
  on-surface-variant: '#424936'
  inverse-surface: '#27332f'
  inverse-on-surface: '#e6f4ed'
  outline: '#737a64'
  outline-variant: '#c2cab0'
  surface-tint: '#466800'
  primary: '#466800'
  on-primary: '#ffffff'
  primary-container: '#bafa4b'
  on-primary-container: '#4d7100'
  inverse-primary: '#9bd92a'
  secondary: '#3e6750'
  on-secondary: '#ffffff'
  secondary-container: '#bfedd0'
  on-secondary-container: '#446d56'
  tertiary: '#9c432c'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe0d8'
  on-tertiary-container: '#a74b33'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b6f647'
  primary-fixed-dim: '#9bd92a'
  on-primary-fixed: '#121f00'
  on-primary-fixed-variant: '#344e00'
  secondary-fixed: '#bfedd0'
  secondary-fixed-dim: '#a4d1b5'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#264f3a'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#7d2c17'
  background: '#effdf6'
  on-background: '#121e1a'
  surface-variant: '#d8e6df'
  paper: '#f2efe6'
  card: '#fffdf7'
  border: '#c9cfc7'
  border-muted: '#e2ded5'
  text-ink: '#17231f'
  text-muted: '#68736d'
  terminal-bg: '#13221b'
  terminal-surface: '#1a2e24'
  lime-dim: '#a2e038'
  coral-subtle: '#ffece7'
  green-wash: '#e8efe9'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-reading:
    fontFamily: Noto Serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0em
  body-reading-mobile:
    fontFamily: Noto Serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-ui:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-ui-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  code-terminal:
    fontFamily: JetBrains Mono
    fontSize: 13.5px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  width-reading: 710px
  width-lab: 920px
  width-overview: 1380px
---

## Brand & Style

### Personality & Purpose
The design system positions the product at the precise intersection of an **independent technical print magazine** and an **interactive agent-runtime laboratory**. It deliberately resists generic AI SaaS tropes—avoiding glowing purple nebulas, overblown glassmorphism, faux-holographic interfaces, and template-driven dashboards. Instead, it embodies intellectual rigor, physical tactile presence, and engineering credibility.

The experience serves software developers, systems architects, and technical learners seeking foundational mastery over LangGraph and state-machine-driven agentic architectures. The emotional response is grounded, calm, and empowering: "Read a thesis, step the runtime, mutate state, inspect the diff."

### Aesthetic Philosophy
- **Editorial Tactility:** Warm paper backgrounds, rich dark-green printing ink, and disciplined typographic hierarchy rooted in literary serif body copy and crisp sans-serif headings.
- **Physical Laboratory Instrumentation:** Terminal panels, monospace data readouts, explicit state nodes, directional edges, and physical button affordances accented with sharp acid-lime and cautionary coral.
- **Structural Transparency:** Layouts expose computational mechanics directly. Progress is modeled as an executable directed acyclic graph (DAG) rather than a linear progress bar.

## Colors

The color palette reinforces the tactile technical publication metaphor through disciplined contrast and intentional semantic weighting.

### Key Tokens & Semantic Roles
- **Paper Background (`#f2efe6`)**: The global reading canvas. A low-strain, warm newsprint shade that grounds long-form study.
- **Card Background (`#fffdf7`)**: Warm ivory for elevated reading surfaces, cards, and interactive experiment containers.
- **Text Ink (`#17231f`)**: Deep dark-forest ink replacing harsh pure `#000000`. Ensures maximum contrast while preserving an organic print texture.
- **Muted Text (`#68736d`)**: Secondary editorial text, section meta-labels, sub-captions, and lesson timestamps.
- **Border (`#c9cfc7`)**: Fine technical outlines framing cards, panels, and graph nodes.
- **Primary / Lime Accent (`#bafa4b`)**: High-visibility acid-lime used for primary state activation, interactive control highlights, playheads, and active graph nodes.
- **Secondary / Deep Green (`#355e48`)**: Authoritative forest green used for structural branding marks, node borders, badges, and active section headers.
- **Tertiary / Coral Accent (`#ff8f72`)**: Editorial alert hue reserved for breaking changes, interrupts, edge warnings, and runtime diff deletions.
- **Terminal Background (`#13221b`)**: Inky carbon-green container for live REPL runs, code blocks, state dumps, and CLI simulation outputs.

## Typography

The typographic hierarchy bridges scholarly Chinese long-form exposition with precise systems programming notation.

### Font Roles
- **Headlines & Structural Display (`Inter`)**: Tightly tracked, confident, and direct. Delivers strong editorial anchoring for module names, lesson titles, and section headlines.
- **Long-Form Reading (`Noto Serif` / Chinese Serif fallback)**: Applied to all prose, conceptual rationale, and narrative sections. Set generously at 18px with 32px line height (`lineHeight: 1.77`) to maximize comprehension during deep study.
- **Code, Schema, & Metadata (`JetBrains Mono`)**: Applied to terminal outputs, state diffs, execution pills, lesson indices (e.g., `00`–`30`), node labels, and inline code tags.

### Terminology Formatting Rule
Technical terms must consistently be written in dual format on first introduction per module: `English（中文意思）`. Such terms receive a subtle dotted underline with an interactive popover disclosing execution mechanics.

## Elevation & Depth

Visual hierarchy uses physical tactile layering, crisp 1px borders, and directional hard offset shadows rather than diffuse digital glows.

### Elevation Levels
- **Canvas (Level 0)**: `#f2efe6` Paper background. Flat with optional dot-matrix overlay.
- **Card Panel (Level 1)**: `#fffdf7` Surface bounded by `1px solid #c9cfc7`. Offset drop-shadow: `0 2px 0 0 #c9cfc7`.
- **Interactive Node & Focused Card (Level 2)**: Crisp tactile rise. `1px solid #17231f` accompanied by a distinct physical hard shadow: `2px 3px 0 0 #17231f`.
- **Active Node / Lime Accentuation (Level 3)**: Raised state indicating active runtime execution. `1.5px solid #17231f` with a lime-tinted offset shadow: `3px 4px 0 0 #355e48`.
- **Floating Modals & Glossary Popovers (Level 4)**: Pure `#fffdf7` surface, `1.5px solid #17231f`, shadow: `4px 6px 0 0 rgba(23, 35, 31, 0.25)`.
- **Dark Terminal Chamber**: Deep inky `#13221b` recess inset with an inner hairline border (`1px solid rgba(201, 207, 199, 0.15)`) and dark sunken depth.

## Shapes

The design system employs a **Soft (`1`)** shape language that maintains an understated architectural discipline.

- **Panels, Cards, Terminals (`rounded-lg` / 8px)**: Softened corners that avoid harsh brutalist points while remaining crisply geometric.
- **Buttons, Controls, Inputs (`rounded` / 4px - 6px)**: Tactile mechanical buttons with defined click affordances.
- **Status Pills, Lesson Badges, Takeaway Chips (Pill-shaped / 9999px)**: Full round pill caps providing clear visual contrast against rectangular diagram nodes and content cards.
- **Graph Nodes (`rounded-lg` / 8px)**: Rectangular state containers engineered to display clear header bars and data compartments.
- **Brand Mark**: A signature dark-green rounded square (`rounded-lg` / 10px) enclosing the iconic acid-lime letter **A**.

## Components

### 1. Navigation & Brand Header
- **Brand Badge**: 32x32px rounded square (`#17231f`) with a bold, centered acid-lime (`#bafa4b`) uppercase letter "A".
- **Top Bar**: Sticky fixed header in `#f2efe6` with an ultra-thin bottom rule (`1px solid #c9cfc7`). Houses the brand mark, current lesson breadcrumb, tier indicator (`精简版 · 免费阅读` vs. `完整版`), and catalog drawer toggle.

### 2. 00–30 Lesson Pagination Strip & Status Pills
- **Status Tokens**:
  - `open`: Available for interactive exploration. Ivory background, green border (`#355e48`), ink label.
  - `next`: Immediate next milestone. Inset acid-lime background (`#bafa4b`), ink text, pulsating micro-dot.
  - `planned`: In roadmap pipeline. Muted paper background, dashed border (`#c9cfc7`), text in `#68736d`. Non-interactive with planned tooltip.
- **Pagination Strip**: Monospaced numbered track (`00`, `01`, `02` ... `30`) providing instant jump access and visualizing completed vs. current lesson states.

### 3. Interactive Graph Canvas & Node Types
- **Node Anatomy**: 
  - `START` / `END`: Pill-shaped terminal nodes with `#17231f` background and crisp monospace white/lime labels.
  - `Node (Worker)`: Warm ivory card (`#fffdf7`), `1px solid #17231f`, featuring an upper title strip and a lower state-payload preview.
  - `Active Execution Node`: Highlighted with `2px solid #bafa4b` and a tactile drop shadow.
  - `Edges / Transitions`: Directional vector paths (`#68736d`, active path: `#355e48` with animated dash array). Conditional routing branches labeled with monospace predicates.

### 4. State Diff & Terminal Output
- **Container**: Monolithic dark terminal chamber (`#13221b`).
- **State Diff Presentation**: Color-coded keys showing mutations across the latest node execution. Added keys in `#bafa4b`, interrupted/removed keys in `#ff8f72`, and static context in `#68736d`.
- **Run Controls**: Step-forward button (`Step ▶`), Reset button, and interactive variable sliders placed in a tactile toolbar docked to the terminal top.

### 5. Editorial Callout Cards
- **Misconception Card (`常见误区`)**: Ivory panel with a bold coral left accent border (`3px solid #ff8f72`) and coral eyebrow label.
- **Run It Yourself (`动手试试`)**: Acid-lime accented card (`border: 1px solid #355e48`, header banner in `#bafa4b` with black monospace header) containing step-by-step challenges.
- **Numbered Checklist**: Sequential circled numerals (`01`, `02`, `03`) in `#355e48` paired with concise validation rules.
- **Takeaway Chips**: Horizontal list of pill chips summarizing key architectural principles at the lesson's conclusion.

### 6. Interactive Glossary Terms
- Inline technical terms appear with a fine dotted underline (`border-bottom: 1.5px dotted #355e48`). Hovering or tapping reveals a tactile floating card displaying the precise definition, state-machine impact, and a Python LangGraph code snippet.