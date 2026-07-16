import { MouseEvent, ReactNode, useRef } from "react";
import { mergeProps, useFocusRing, useHover } from "react-aria";
import { Css, Tokens } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export type JumpLinkProps = {
  label: ReactNode;
  active: boolean;
  /** The section to scroll to on click, e.g. "#section-1" - used as the anchor's href and resolved via `getElementById` for the smooth scroll target. */
  href: string;
  disabled?: boolean;
  /** Storybook-only visual state overrides for snapshotting pseudo-interactions. */
  __storyState?: { hovered?: boolean; focusVisible?: boolean };
};

/** A link that smooth-scrolls the page to a section, e.g. for "on this page" tables of contents. */
export function JumpLink(props: JumpLinkProps) {
  const { label, active, href, disabled, __storyState, ...otherProps } = props;
  const isDisabled = !!disabled;
  const ref = useRef<HTMLAnchorElement>(null);
  const { isFocusVisible: isFocusVisibleFromEvents, focusProps } = useFocusRing();
  const { hoverProps, isHovered: isHoveredFromEvents } = useHover({ isDisabled });
  const isHovered = __storyState?.hovered ?? isHoveredFromEvents;
  const isFocusVisible = __storyState?.focusVisible ?? isFocusVisibleFromEvents;
  const tid = useTestIds(otherProps, "jumpLink");

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    // Let modifier/non-primary clicks fall through to native anchor behavior (open in new tab, etc).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const target = document.getElementById(href.replace(/^#/, ""));
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    }
  }

  return (
    <a
      ref={ref}
      href={isDisabled ? undefined : href}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      {...mergeProps(focusProps, hoverProps)}
      {...tid}
      css={{
        ...jumpLinkStyles.baseStyles,
        ...(active && jumpLinkStyles.activeStyles),
        ...(isHovered && !isDisabled && jumpLinkStyles.hoverStyles),
        ...(isFocusVisible && jumpLinkStyles.focusStyles),
        ...(isDisabled && jumpLinkStyles.disabledStyles),
      }}
    >
      {label}
    </a>
  );
}

const jumpLinkStyles = {
  baseStyles: Css.w100.tal.md.px3.py1.color(Tokens.TextLinkDefault).bl.add("borderLeftWidth", "3px").bcTransparent
    .lineClamp2.$,
  activeStyles: Css.mdSb.bcBlue600.$,
  hoverStyles: Css.bgColor(Tokens.NeutralFillHoverSubtle).color(Tokens.TextLinkHover).$,
  focusStyles: Css.bshFocus.$,
  disabledStyles: Css.color(Tokens.TextLinkDisabled).bcBlue200.cursorNotAllowed.bcTransparent.$,
};
