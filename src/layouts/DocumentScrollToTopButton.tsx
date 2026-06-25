import { useCallback, useEffect, useState } from "react";
import { ContrastScope, IconButton } from "src/components";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";
import { zIndices } from "src/utils/zIndices";

export type DocumentScrollToTopButtonProps = {
  /** Measured document viewport height (px); visibility threshold is one full viewport. */
  viewportHeight: number;
};

/** Floating control that returns the user to the top of a document-scroll layout. */
export function DocumentScrollToTopButton({ viewportHeight }: DocumentScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);
  const tid = useTestIds({}, "documentScrollToTop");
  const scrollToTopOffsetPx = 20;

  const syncVisibility = useCallback(() => {
    if (viewportHeight <= 0) return;
    setVisible(window.scrollY > viewportHeight);
  }, [viewportHeight]);

  useEffect(() => {
    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });
    return () => window.removeEventListener("scroll", syncVisibility);
  }, [syncVisibility]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      {...tid.wrapper}
      aria-hidden={!visible}
      {...(!visible ? { inert: "" } : {})}
      css={{
        ...Css.fixed.bottomPx(scrollToTopOffsetPx).rightPx(scrollToTopOffsetPx).z(zIndices.scrollToTop).df.jcfe
          .transitionTransform.$,
        ...(visible
          ? Css.add("transform", "translateY(0)").$
          : Css.add("transform", `translateY(calc(100% + ${scrollToTopOffsetPx}px))`).add("pointerEvents", "none").$),
      }}
    >
      <ContrastScope>
        <IconButton
          icon="arrowUp"
          disabled={!visible}
          variant="outline"
          label="Scroll to top"
          onClick={scrollToTop}
          {...tid}
        />
      </ContrastScope>
    </div>
  );
}
