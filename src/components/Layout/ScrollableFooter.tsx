import { ReactNode, ReactPortal } from "react";
import { createPortal } from "react-dom";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";

type ScrollableFooterProps = {
  children: ReactNode;
};

/**
 * Renders content into the `ScrollableParent`'s footer slot — a sibling of the scrollable region
 * that sits at the bottom of the page. The scroll region above shrinks to make room, so the
 * last row of a long table is never hidden behind the footer.
 *
 * Symmetric with `ScrollableContent`: place it anywhere in the tree below `ScrollableParent`
 * and it portals to the parent's footer container. Style the children directly (e.g. background,
 * shadow, padding) — the slot itself adds no visuals.
 *
 * Typical usage:
 * ```tsx
 * <ScrollableParent>
 *   <PageHeader />
 *   <ScrollableContent virtualized>
 *     <GridTable as="virtual" columns={columns} rows={rows} />
 *   </ScrollableContent>
 *   {isEditing && (
 *     <ScrollableFooter>
 *       <ActionBar onCancel={...} onSave={...} />
 *     </ScrollableFooter>
 *   )}
 * </ScrollableParent>
 * ```
 */
export function ScrollableFooter(props: ScrollableFooterProps): ReactPortal | JSX.Element {
  const { children } = props;
  const { footerEl } = useScrollableParent();

  // Escape hatch for tests / callers without a `ScrollableParent` context.
  if (!footerEl) {
    return <>{children}</>;
  }

  return createPortal(<>{children}</>, footerEl);
}
