import { ReactNode, ReactPortal, useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css, Palette } from "src/Css";

interface ScrollableContentProps {
  children: ReactNode;
  virtualized?: boolean;
  omitBottomPadding?: true;
  bgColor?: Palette;
}

/**
 * Helper component for placing scrollable content within a `ScrollableParent`.
 *
 * See the docs on `ScrollableParent.
 *
 * Note that you should not use this "just to get a scrollbar", instead just use `Css.overflowAuto.$`
 * or what not; this is only for implementing page-level patterns that need multiple stickied
 * components (page header, tab bar, table filter & actions).
 */
export function ScrollableContent(props: ScrollableContentProps): ReactPortal | JSX.Element {
  const { children, virtualized = false, omitBottomPadding, bgColor } = props;
  const { scrollableEl, setPortalTick, pl, pr } = useScrollableParent();

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
    <div
      css={{
        ...Css.h100.pr(pr).pl(pl).if(virtualized).pr0.$,
        ...(bgColor && Css.bgColor(bgColor).$),
        ...(!omitBottomPadding && !virtualized && scrollContainerBottomPadding),
      }}
    >
      {children}
    </div>,
    scrollableEl,
  );
}

// Styles to wrap around the scrollable content in order to give padding beneath the content within the scrollable container.
const scrollContainerBottomPadding = Css.addIn("&:after", Css.contentEmpty.db.h2.$).$;
