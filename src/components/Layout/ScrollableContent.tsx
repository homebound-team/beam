import { ReactNode, ReactPortal, useEffect } from "react";
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
  const { scrollableEl, setPortalTick, pl } = useScrollableParent();

  useEffect(() => {
    // The below `tick` logic is a way to detect whether the ScrollableContent is being used.
    // The ScrollableParent sets scrolling style based on whether or not there are children inside of the `scrollableEl` portal.
    setPortalTick((prev) => prev + 1);
    // Ensure a tick happens on unmount in the event the next component loaded does not utilize `ScrollableContent`
    return () => setPortalTick((prev) => prev + 1);
  }, [setPortalTick]);

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
