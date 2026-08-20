import { useResizeObserver } from "@react-aria/utils";
import { Children, ReactNode, useCallback, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "src/components/Icon";
import { Css, increment, Tokens } from "src/Css";
import { useTestIds } from "src/utils";

export type CarouselProps = {
  /** The items to scroll through; each one snaps into place as the strip scrolls. */
  children: ReactNode;
  /** Space between items, in px. Defaults to 8. */
  gap?: number;
  /** Label for the scroll-back button. */
  prevLabel?: string;
  /** Label for the scroll-forward button. */
  nextLabel?: string;
  /** The chevrons' `Icon` size, i.e. an increment rather than px. Defaults to 3, so 24px. */
  chevronInc?: number;
};

/**
 * A horizontally scrolling strip of items, with chevrons that appear only when the strip overflows.
 *
 * The chevrons scroll a "page" (the strip's visible width) at a time, and items snap into place so
 * scrolling never leaves an item half-shown.
 */
export function Carousel(props: CarouselProps) {
  const { children, gap = 8, prevLabel = "Scroll left", nextLabel = "Scroll right", chevronInc = 3 } = props;
  const tid = useTestIds(props, "carousel");
  const itemCount = Children.count(children);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const { clearWidth, fadeWidth } = chevronSizes(chevronInc);

  const updateOverflow = useCallback(() => {
    const el = stripRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollBack(scrollLeft > 0);
    // Sub-pixel widths can leave a fraction of a px scrollable, so don't call that "more to see".
    setCanScrollForward(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useResizeObserver({ ref: stripRef, onResize: updateOverflow });

  useLayoutEffect(() => {
    updateOverflow();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateOverflow);
    return () => el.removeEventListener("scroll", updateOverflow);
  }, [updateOverflow, itemCount]);

  // Fade the strip's own content out under whichever chevron is showing. Masking the items means the
  // fade works on any background without being told what it is.
  const maskImage = [
    "linear-gradient(90deg,",
    canScrollBack ? `transparent 0, transparent ${clearWidth}px, black ${fadeWidth}px,` : "black 0,",
    canScrollForward
      ? `black calc(100% - ${fadeWidth}px), transparent calc(100% - ${clearWidth}px), transparent 100%)`
      : "black 100%)",
  ].join(" ");

  // Advance by what the user can currently see, rather than a fixed guess at the item width.
  function scrollByPage(dir: -1 | 1) {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  return (
    // The chevrons overlay the strip's edges, rather than taking a gutter that sits empty whenever they are hidden.
    <div css={Css.df.aic.relative.$} {...tid}>
      <ScrollButton
        direction="back"
        label={prevLabel}
        inc={chevronInc}
        visible={canScrollBack}
        onClick={() => scrollByPage(-1)}
        {...tid.prev}
      />
      <div
        ref={stripRef}
        css={
          Css.df.fg1.mw0.oxa.sbwn
            .sst("x mandatory")
            .gapPx(gap)
            // Padding so the focus ring isn't clipped
            .pPx(4)
            .mPx(-4)
            .add("scrollPaddingInline", `${4}px`)
            .add("maskImage", maskImage).$
        }
        {...tid.items}
      >
        {Children.map(children, (child) => (
          <div css={Css.fs0.ssa("start").$}>{child}</div>
        ))}
      </div>
      <ScrollButton
        direction="forward"
        label={nextLabel}
        inc={chevronInc}
        visible={canScrollForward}
        onClick={() => scrollByPage(1)}
        {...tid.next}
      />
    </div>
  );
}

type ScrollButtonProps = {
  direction: "back" | "forward";
  label: string;
  /** The chevron's `Icon` size; its box is derived from this. */
  inc: number;
  visible: boolean;
  onClick: () => void;
  "data-testid"?: string;
};

/**
 * A chevron overlaying one end of the strip, sitting over the stretch that the strip's mask has
 * faded out. Absent entirely when there is nothing to scroll to, so the strip keeps the full width
 * rather than holding a gutter open for it.
 */
function ScrollButton(props: ScrollButtonProps) {
  const { direction, label, inc, visible, onClick, ...others } = props;
  const { chevronWidth } = chevronSizes(inc);
  const back = direction === "back";
  if (!visible) return null;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      css={
        Css.absolute.top0.bottom0.z1.df.aic.jcc
          .wPx(chevronWidth)
          .bn.bgTransparent.p0.cursorPointer.color(Tokens.OnSurface)
          .outline(0)
          .if(back).left0.else.right0.end.onFocusVisible.bshFocus.$
      }
      {...others}
    >
      <Icon icon={back ? "chevronLeft" : "chevronRight"} inc={inc} color={Tokens.OnSurface} />
    </button>
  );
}

/** The chevron's box and the strip's fade both come from the icon's size, so they can't drift apart. */
function chevronSizes(inc: number) {
  const iconSize = increment(inc);
  // The icon's own footprint, i.e. how far in the strip's content is fully hidden behind it.
  const clearWidth = iconSize / 2;
  // The button's box, i.e. the icon plus a little breathing room.
  const chevronWidth = iconSize + increment(1);
  // `fadeWidth` is where the fade finishes.
  const fadeWidth = chevronWidth;
  return { clearWidth, chevronWidth, fadeWidth };
}
