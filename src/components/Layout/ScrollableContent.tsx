import { createContext, ReactNode, ReactPortal, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css, Palette } from "src/Css";

const VirtualizedScrollParentContext = createContext<HTMLElement | null>(null);

type ScrollableContentProps = {
  children: ReactNode;
  /**
   * Use when the content contains a `<GridTable as="virtual" />` or `<QueryTable as="virtual" />`
   * inside a `ScrollableParent` layout.
   *
   * `ScrollableParent` creates the page's single bounded scroll container. `ScrollableContent`
   * portals its children into that container's scrollable region so content rendered before it
   * (page headers, filters, toolbars, etc.) stays pinned above the scroll area.
   *
   * Without `virtualized`, a virtual table inside `ScrollableContent` ends up with two competing
   * scroll containers: `ScrollableParent`'s outer scroll area and react-virtuoso's internal
   * scroller. That can show double scrollbars or leave the virtual table with 0px height because
   * it cannot find the bounded scroll parent it should measure against.
   *
   * With `virtualized`, `ScrollableContent` shares `ScrollableParent`'s scroll element with
   * react-virtuoso, so the table delegates scrolling to the same container instead of rendering
   * its own `overflow: auto` wrapper. The result is one scrollbar for the whole page.
   *
   * Typical usage:
   * ```tsx
   * <ScrollableParent>
   *   <PageHeader />
   *   <Filters />
   *   <ScrollableContent virtualized>
   *     <GridTable as="virtual" columns={columns} rows={rows} />
   *   </ScrollableContent>
   * </ScrollableParent>
   * ```
   *
   * Common mistakes:
   * - Omitting `virtualized` around a virtual `GridTable`/`QueryTable`, which causes double scrollbars.
   * - Adding extra `div css={Css.df.fdc.fg1.oh.$}` wrappers to force height; `ScrollableContent`
   *   already sizes itself to the remaining viewport space.
   * - Removing `ScrollableContent` to avoid double scrollbars; the virtual table can then lose its
   *   bounded height and render empty.
   */
  virtualized?: boolean;
  omitBottomPadding?: true;
  bgColor?: Palette;
};

/**
 * Helper for the `ScrollableParent` / `ScrollableContent` page-layout pattern.
 *
 * `ScrollableParent` creates a single scroll container for the page. `ScrollableContent` then uses
 * a React portal to place its children into that container's scrollable area, while content
 * rendered outside `ScrollableContent` stays pinned above the scroll region.
 *
 * Note that you should not use this "just to get a scrollbar", instead just use `Css.oa.$`
 * or what not; this is only for implementing page-level patterns that need multiple stickied
 * components (page header, tab bar, table filter & actions).
 */
export function ScrollableContent(props: ScrollableContentProps): ReactPortal | JSX.Element {
  const { children, virtualized = false, omitBottomPadding, bgColor } = props;
  const { scrollableEl, setPortalTick, paddingLeft, paddingRight } = useScrollableParent();

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

  const showBottomSpacer = !omitBottomPadding && !virtualized;
  const virtualizedScrollParent = virtualized ? scrollableEl.parentElement : null;

  return createPortal(
    <VirtualizedScrollParentContext.Provider value={virtualizedScrollParent}>
      <div
        css={{
          ...Css.h100.pr(paddingRight).pl(paddingLeft).if(virtualized).pr0.$,
          ...(bgColor && Css.bgColor(bgColor).$),
        }}
      >
        {children}
        {showBottomSpacer && <div css={Css.h2.$} />}
      </div>
    </VirtualizedScrollParentContext.Provider>,
    scrollableEl,
  );
}

export function useVirtualizedScrollParent(): HTMLElement | null {
  return useContext(VirtualizedScrollParentContext);
}
