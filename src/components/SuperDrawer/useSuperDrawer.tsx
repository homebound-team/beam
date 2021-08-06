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
  /** Adds a callback that is called _after_ close has definitely happened. */
  onClose?: () => void;
  content: ReactNode;
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
  /** Closes the entire drawer, returns false is the previous drawer can't be closed. */
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
  const {
    drawerContentStack: contentStack,
    modalState,
    drawerCanCloseChecks: canCloseChecks,
    drawerCanCloseDetailsChecks: canCloseDetailsChecks,
  } = useContext(BeamContext);
  const { openModal } = useModal();

  /**
   * Validates whether a new Superdrawer can be opened / whether the current Superdrawer can be closed.
   * Breaking the validation into a separate function allows openInDrawer
   * to validate the drawer's state without closing it
   * */
  function validateDrawerChange (onClose: () => void) {
    const contentStackLength = contentStack.current.length;
    if (contentStackLength === 0) {
      return true;
    }

    // Attempt to close each drawer details
    for (let i = contentStackLength - 2; i >= 0; i--) {
      for (const canCloseDrawerDetail of canCloseDetailsChecks.current[i] ?? []) {
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
    for (const canCloseDrawer of canCloseChecks.current) {
      if (!canCloseDrawer()) {
        openModal({
          title: "Confirm",
          content: <ConfirmCloseModal onClose={onClose} />,
        });
        return false;
      }
    }
  }


  // Separate close actions to reference then in actions
  const closeActions = useMemo(() => {
    return {
      /** Attempts to close the drawer. If any checks fail, a error modal will appear */
      closeDrawer() {
        /** Reset the contentStack, all checks and modalState */
        function onClose() {
          const first = contentStack.current[0];
          if (first.kind === "open" && first.opts.onClose) {
            first.opts.onClose();
          }
          contentStack.current = [];
          canCloseChecks.current = [];
          canCloseDetailsChecks.current = [];
          // Reset Modal state
          modalState.current = undefined;
        }
        const maybeValidated = validateDrawerChange(onClose);
        if (maybeValidated !== undefined) {
          return maybeValidated
        }

        onClose();
        return true;
      },

      closeDrawerDetail() {
        if (!(contentStack.current.length > 1)) return;

        // Attempt to close the current drawer details
        for (const check of canCloseDetailsChecks.current[contentStack.current.length - 2] ?? []) {
          if (!check()) {
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
          canCloseDetailsChecks.current = canCloseDetailsChecks.current.slice(0, -1);
          // Reset Modal state
          modalState.current = undefined;
        }

        onClose();
      },
    };
  }, [canCloseChecks, canCloseDetailsChecks, contentStack, modalState, openModal]);

  // useMemo the actions separately from the dynamic isDrawerOpen value
  const actions = useMemo(() => {
    return {
      // TODO: Maybe we should rename to openDrawer as a breaking change (to match openDrawerDetail)
      openInDrawer(opts: OpenInDrawerOpts) {
        // When opening a new SuperDrawer, check if we can close the previous
        // SuperDrawer content. Bail if it fails
        // TODO: There needs to be try again logic here...
        debugger;
        const maybeValidated = validateDrawerChange(openNewModal);
        if (maybeValidated === false) {
          return maybeValidated
        }
        function openNewModal () {
          // TODO: Check modal open?
          contentStack.current = [{ kind: "open", opts }];
        }
        openNewModal();

      },
      openDrawerDetail(opts: OpenDetailOpts) {
        // TODO: Check modal open?
        if (!contentStack.current.length) {
          throw new Error("openInDrawer was not called before openDrawerDetail");
        }
        contentStack.current = [...contentStack.current, { kind: "detail", opts }];
      },
      /** Add a new close check to SuperDrawer */
      addCanCloseDrawerCheck(canCloseCheck: () => boolean) {
        // Check if we can add a canCloseDrawer check
        const stackLength = contentStack.current.length;
        if (!stackLength) {
          console.error("Cannot add canCloseDrawerCheck when the SuperDrawer is not open");
          return;
        }

        canCloseChecks.current = [...canCloseChecks.current, canCloseCheck];
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
        canCloseDetailsChecks.current[stackLength - 2] = [
          ...(canCloseDetailsChecks.current[stackLength - 2] ?? []),
          canCloseCheck,
        ];
      },
    };
  }, [canCloseChecks, canCloseDetailsChecks, closeActions, contentStack]);

  return {
    ...actions,
    ...closeActions,
    isDrawerOpen: contentStack.current.length > 0,
  };
}
