import { useResizeObserver } from "@react-aria/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "src/components/Icon";
import { Css } from "src/Css";

type UseExpandCollapseOptions = {
  defaultExpanded?: boolean;
  /** Stays collapsed and ignores `defaultExpanded`. */
  disabled?: boolean;
};

export type UseExpandCollapseResult = {
  expanded: boolean;
  toggle: () => void;
  /** Callback ref for the measured content. Keep it mounted so the close animation clips it; unmounting also collapses the panel. */
  contentRef: (el: HTMLDivElement | null) => void;
  /** `"auto"` on first paint when already open (no intro animation), otherwise a px height or `"0"`. */
  contentHeight: string;
};

/** Clipping wrapper styles: overflow hidden and an animated height. */
export function expandCollapsePanelStyles(contentHeight: string) {
  return Css.oh.h(contentHeight).transitionHeight.$;
}

/** Open/close state and a measured panel height, so a wrapper can animate between `0` and the content. */
export function useExpandCollapse(options: UseExpandCollapseOptions = {}): UseExpandCollapseResult {
  const { defaultExpanded = false, disabled = false } = options;
  const [expanded, setExpanded] = useState(defaultExpanded && !disabled);
  // State-based ref so useResizeObserver re-subscribes when the content div mounts. A plain useRef
  // never changes identity, so the observer would not be created when the content appears.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);
  const observerRef = useMemo(() => ({ current: contentEl }), [contentEl]);
  // Already-open panels start at `auto` so the first paint does not animate.
  const [contentHeight, setContentHeight] = useState(expanded ? "auto" : "0");

  useEffect(() => {
    setExpanded(defaultExpanded && !disabled);
  }, [defaultExpanded, disabled]);

  useEffect(() => {
    setContentHeight(expanded && contentEl ? `${contentEl.scrollHeight}px` : "0");
  }, [expanded, contentEl]);

  // Keep the measured height in sync when open content resizes (lazy images, growing fields).
  // react-aria wraps onResize in useEffectEvent, so only `ref` changes re-subscribe.
  const onResize = useCallback(() => {
    if (contentEl && expanded) {
      setContentHeight(`${contentEl.scrollHeight}px`);
    }
  }, [expanded, contentEl]);
  useResizeObserver({ ref: observerRef, onResize });

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return { expanded, toggle, contentRef: setContentEl, contentHeight };
}

/** Chevron that rotates with the panel instead of swapping icons. */
export function ExpandChevron(props: { expanded: boolean }) {
  return (
    <span css={Css.fs0.transitionTransform.add("transform", props.expanded ? "rotate(180deg)" : "rotate(0deg)").$}>
      <Icon icon="chevronDown" />
    </span>
  );
}
