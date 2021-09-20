import { ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";
import { FullBleed } from "src/components/Layout/FullBleed";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Helper component for placing scrollable content within a `NestedScrollProvider`. */
export function ScrollableContent({
  children,
  virtualized = false,
}: {
  children: ReactNode;
  virtualized?: boolean;
}): ReactPortal | JSX.Element {
  const { scrollableEl, pl } = useScrollableParent();

  // Escape hatch specifically for tests where a "ScrollableParent" context may not be present.
  if (!scrollableEl) {
    return <>{children}</>;
  }

  return createPortal(
    !virtualized ? (
      children
    ) : (
      // To prevent Virtuoso's scrollbar from being set in based on the Layout's padding, we will use the FullBleed component w/o padding to push it back over
      <FullBleed omitPadding>
        <div css={Css.h100.pl(pl).$}>{children}</div>
      </FullBleed>
    ),
    scrollableEl,
  );
}
