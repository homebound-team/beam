import React, { ReactNode, useContext, useMemo } from "react";
import { BeamContext } from "src/components/BeamContext";
import { useModal } from "../Modal";
import { ConfirmCloseModal } from "./ConfirmCloseModal";

export interface OpenInDrawerOpts {
  /** Title of the SuperDrawer */
  title: string;
  /** Optional content to place left of the prev/next buttons, i.e. a "Manage" link. */
  titleRightContent?: ReactNode;
  /** Optional content to place right of the title, i.e. a status badge. */
  titleLeftContent?: ReactNode;
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
   * @deprecated use `addCanCloseDrawer`
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
export interface UseSuperDrawerHook {
  /** Opens a new drawer, throwing away the current drawer is one exists. */
  openInDrawer: (opts: OpenInDrawerOpts) => void;
  /** Closes the entire drawer. */
  closeDrawer: () => boolean;
  /** Opens a detail view in the current drawer. */
  openDrawerDetail: (opts: OpenDetailOpts) => void;
  /** Closes the detail view, or the entire drawer if there was no detail view. */
  closeDrawerDetail: () => void;
  /** Returns whether the drawer is currently open. */
  isDrawerOpen: boolean;
  /**
   * Adds a check when attempting to close the SuperDrawer by clicking on the
   * overlay, the "X" button or calling `closeDrawer()`. If any checks returns
   * false, a confirmation modal will appear allowing the user to confirm
   * the action.
   */
  addCanCloseDrawerCheck: (canCloseCheck: () => boolean) => void;
  /**
   * Adds a check when attempting to close a SuperDrawer detail by clicking the
   * "back" button or calling `closeDrawerDetail()`. If any checks returns
   * false, a confirmation modal will appear allowing the user to confirm
   * the action.
   */
  addCanCloseDrawerDetailCheck: (canCloseCheck: () => boolean) => void;
}

export function useSuperDrawer(): UseSuperDrawerHook {
  const { contentStack, modalState, canCloseDrawerChecks, canCloseDrawerDetailsChecks } = useContext(BeamContext);
  const { openModal } = useModal();

  // Separate close actions to reference then in actions
  const closeActions = useMemo(() => {
    return {
      /** Attempts to close the drawer. If any checks fail, a error modal will appear */
      closeDrawer() {
        const contentStackLength = contentStack.current.length;
        // Attempt to close each drawer details
        for (let i = contentStackLength - 2; i >= 0; i--) {
          for (const canCloseDrawerDetail of canCloseDrawerDetailsChecks.current[i] ?? []) {
            if (!canCloseDrawerDetail()) {
              openModal({
                title: "Confirm",
                content: <ConfirmCloseModal onClose={onClose} />,
              });
              return false;
            }
          }
        }

        // Attempt to close the drawer
        for (const canCloseDrawer of canCloseDrawerChecks.current) {
          if (!canCloseDrawer()) {
            openModal({
              title: "Confirm",
              content: <ConfirmCloseModal onClose={onClose} />,
            });
            return false;
          }
        }

        /** Reset the contentStack, all checks and modalState */
        function onClose() {
          contentStack.current = [];
          canCloseDrawerChecks.current = [];
          canCloseDrawerDetailsChecks.current = [];
          // Reset Modal state
          modalState.current = undefined;
        }

        onClose();
        return true;
      },
      closeDrawerDetail() {
        if (!(contentStack.current.length > 1)) return;

        // Attempt to close the current drawer details
        for (const canCloseDrawerDetail of canCloseDrawerDetailsChecks.current[contentStack.current.length - 2] ?? []) {
          if (!canCloseDrawerDetail()) {
            openModal({
              title: "Confirm",
              content: <ConfirmCloseModal onClose={onClose} />,
            });
            return;
          }
        }

        /** Pop an element from the contentStacks and details checks */
        function onClose() {
          // Pop contentStack and the current canCloseDrawerDetailsCheck
          contentStack.current = contentStack.current.slice(0, -1);
          canCloseDrawerDetailsChecks.current = canCloseDrawerDetailsChecks.current.slice(0, -1);
          // Reset Modal state
          modalState.current = undefined;
        }

        onClose();
      },
    };
  }, [canCloseDrawerChecks, canCloseDrawerDetailsChecks, contentStack, modalState, openModal]);

  // useMemo the actions separately from the dynamic isDrawerOpen value
  const actions = useMemo(() => {
    return {
      // TODO: Maybe we should rename to openDrawer as a breaking change (to match openDrawerDetail)
      openInDrawer(opts: OpenInDrawerOpts) {
        // When opening a new SuperDrawer, check if we can close the previous
        // SuperDrawer content. Bail if it fails
        // TODO: There needs to be try again logic here...
        if (!closeActions.closeDrawer()) {
          return false;
        }

        // TODO: Check modal open?
        contentStack.current = [{ kind: "open", opts }];
      },
      openDrawerDetail(opts: OpenDetailOpts) {
        // TODO: Check modal open?
        if (!contentStack.current.length) {
          throw new Error("openInDrawer was not called before openDrawerDetail");
        }
        contentStack.current.push({ kind: "detail", opts });
      },
      /** Add a new close check to SuperDrawer */
      addCanCloseDrawerCheck(canCloseCheck: () => boolean) {
        // Check if we can add a canCloseDrawer check
        const stackLength = contentStack.current.length;
        if (!stackLength) {
          console.error("Cannot add canCloseDrawerCheck when the SuperDrawer is not open");
          return;
        }

        canCloseDrawerChecks.current.push(canCloseCheck);
      },
      /** Add a new close check to the current SuperDrawer detail */
      addCanCloseDrawerDetailCheck(canCloseCheck: () => boolean) {
        // Check if we can add a canCloseDrawerDetailCheck
        const stackLength = contentStack.current.length;
        if (stackLength <= 1) {
          console.error("Cannot add canCloseDrawerDetailCheck when no SuperDrawer details drawer is open");
          return;
        }

        // Add canCloseDetails check to the current details content
        canCloseDrawerDetailsChecks.current[stackLength - 2] = [
          ...(canCloseDrawerDetailsChecks.current[stackLength - 2] ?? []),
          canCloseCheck,
        ];
      },
    };
  }, [canCloseDrawerChecks, canCloseDrawerDetailsChecks, closeActions, contentStack]);

  return {
    ...actions,
    ...closeActions,
    isDrawerOpen: contentStack.current.length > 0,
  };
}
