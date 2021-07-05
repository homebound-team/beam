import { ReactNode, useContext, useMemo } from "react";
import { BeamContext } from "src/components/BeamContext";

export interface OpenInDrawerOpts {
  /** Title of the SuperDrawer */
  title: string;
  /** Optional content to place next to the prev/next buttons. */
  titleRightContent?: ReactNode;
  /** Invokes left, disabled if undefined. */
  onPrevClick?: () => void;
  /** Invokes right, disabled if undefined. */
  onNextClick?: () => void;
  content: ReactNode;
  /**
   * Handler when clicking on the following elements:
   * - `X` icon
   * - Background overlay
   *
   * @default Closes the SuperDrawer by calling `closeDrawer()`
   */
  onClose?: () => void;
}

export interface OpenDetailOpts {
  /** Title of the SuperDrawer for this detail page (replaces the original title). */
  title?: string;
  content: ReactNode;
}

export type ContentStack = { kind: "open"; opts: OpenInDrawerOpts } | { kind: "detail"; opts: OpenDetailOpts };

/** The public API for interacting with `useSuperDrawer`. */
export interface SuperDrawerHook {
  /** Opens a new drawer, throwing away the current drawer is one exists. */
  openInDrawer: (opts: OpenInDrawerOpts) => void;
  /** Closes the entire drawer. */
  closeDrawer: () => void;
  /** Opens a detail view in the current drawer. */
  openDrawerDetail: (opts: OpenDetailOpts) => void;
  /** Closes the detail view, or the entire drawer if there was no detail view. */
  closeDrawerDetail: () => void;
  /** Returns whether the drawer is currently open. */
  isDrawerOpen: boolean;
}

export function useSuperDrawer(): SuperDrawerHook {
  const { contentStack, modalState } = useContext(BeamContext);

  // useMemo the actions separately from the dynamic isDrawerOpen value
  const actions = useMemo(
    () => ({
      openInDrawer(opts: OpenInDrawerOpts) {
        // TODO Check canClose
        // TODO Check modal open?
        contentStack.current = [{ kind: "open", opts }];
      },
      openDrawerDetail(opts: OpenDetailOpts) {
        // TODO Check modal open?
        if (contentStack.current.length === 0) {
          throw new Error("openInDrawer was not called before openDrawerDetail");
        }
        contentStack.current = [...contentStack.current, { kind: "detail", opts }];
      },
      closeDrawer() {
        // TODO Check can close?
        contentStack.current = [];
        modalState.current = undefined;
      },
      closeDrawerDetail() {
        // TODO Check can close?
        contentStack.current = contentStack.current.slice(0, -1);
        modalState.current = undefined;
      },
    }),
    [contentStack],
  );

  return {
    ...actions,
    isDrawerOpen: contentStack.current.length > 0,
  };
}
