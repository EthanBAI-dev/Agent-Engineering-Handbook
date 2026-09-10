import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Term } from "@/components/term";
import { createGlossaryPattern, definitionOf } from "@/lib/glossary";

/**
 * 自动术语标注。
 *
 * 正文里每一次出现术语都会带提示，不再只解释第一次——重复出现时读者同样可能忘记。
 * 跳过代码、标题和栏目标签：那些位置加虚线下划线只会变吵，读者也不在那里阅读。
 */
const SKIP_TAGS = new Set(["code", "pre", "kbd", "samp", "h1", "h2", "h3", "h4"]);
const SKIP_CLASS = /(section-label|panel-kicker|chapter-number|eyebrow|state-title|term-)/;

const isAsciiWordChar = (char: string | undefined) => !!char && /[A-Za-z0-9_]/.test(char);

function annotateText(text: string, keyPrefix: string): ReactNode {
  const pattern = createGlossaryPattern();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const surface = match[0];
    const start = match.index;
    const end = start + surface.length;

    // 英文术语要卡词边界，否则 add 会命中 address、State 会命中 Statement。
    const headBlocked = isAsciiWordChar(surface[0]) && isAsciiWordChar(text[start - 1]);
    const tailBlocked = isAsciiWordChar(surface[surface.length - 1]) && isAsciiWordChar(text[end]);
    if (headBlocked || tailBlocked) {
      pattern.lastIndex = start + 1;
      continue;
    }

    const definition = definitionOf(surface);
    if (!definition) {
      pattern.lastIndex = start + 1;
      continue;
    }

    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <Term key={`${keyPrefix}-${index}`} definition={definition}>
        {surface}
      </Term>,
    );
    index += 1;
    cursor = end;
  }

  if (parts.length === 0) return text;
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

type ElementWithChildren = ReactElement<{ children?: ReactNode; className?: string }>;

export function annotate(node: ReactNode, keyPrefix = "term"): ReactNode {
  if (typeof node === "string") return annotateText(node, keyPrefix);
  if (Array.isArray(node)) {
    return Children.map(node, (child, childIndex) => annotate(child, `${keyPrefix}-${childIndex}`));
  }
  if (!isValidElement(node)) return node;

  const element = node as ElementWithChildren;
  if (element.type === Term) return node;

  // 只下钻到原生标签和 Fragment。自定义组件的 children 可能是代码字符串或配置，
  // 由组件自己决定哪部分该标注（见 article-kit.tsx），从外面替换会毁掉它的入参。
  const isIntrinsic = typeof element.type === "string";
  if (!isIntrinsic && element.type !== Fragment) return node;
  if (isIntrinsic && SKIP_TAGS.has(element.type as string)) return node;

  const className = element.props.className;
  if (typeof className === "string" && SKIP_CLASS.test(className)) return node;
  if (element.props.children === undefined) return node;

  return cloneElement(element, undefined, annotate(element.props.children, `${keyPrefix}-c`));
}

/** 一段带自动术语提示的正文区块。 */
export function Prose({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <section className={className ? `prose-block ${className}` : "prose-block"}>
      {label && <p className="section-label">{label}</p>}
      {annotate(children)}
    </section>
  );
}
