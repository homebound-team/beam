import React, { ReactNode, useMemo } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { CanCloseCheck } from "src/types";
import { useModal } from "../Modal";
import { ConfirmCloseModal } from "./ConfirmCloseModal";
import { SuperDrawerWidth } from "./utils";

export interface OpenInDrawerOpts {
  /** Invokes left, disabled if undefined. */
  onPrevClick?: () => void;
  /** Invokes right, disabled if undefined. */
  onNextClick?: () => void;
  /** Adds a callback that is called _after_ close has definitely happened. */
  onClose?: () => void;
  content: ReactNode;
  /** Adds the ability to change the SuperDrawer width based on some pre-defined values */
  width?: SuperDrawerWidth;
}

export interface OpenDetailOpts {
  content: ReactNode;
}

export type ContentStack = { kind: "open"; opts: OpenInDrawerOpts } | { kind: "detail"; opts: OpenDetailOpts };

/** The public API for interacting with `useSuperDrawer`. */
export interface UseSuperDrawerHook {
  /** Opens a new drawer, throwing away the current drawer is one exists. */
  openInDrawer: (opts: OpenInDrawerOpts) => void;
  /** Closes the entire drawer, returns false is the previous drawer can't be closed. */
  closeDrawer: () => void;
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
  addCanCloseDrawerCheck: (canCloseCheck: CanCloseCheck) => void;
  /**
   * Adds a check when attempting to close a SuperDrawer detail by clicking the
   * "back" button or calling `closeDrawerDetail()`. If any checks returns
   * false, a confirmation modal will appear allowing the user to confirm
   * the action.
   */
  addCanCloseDrawerDetailCheck: (canCloseCheck: CanCloseCheck) => void;
}

export function useSuperDrawer(): UseSuperDrawerHook {
  const {
    drawerContentStack: contentStack,
    modalState,
    drawerCanCloseChecks: canCloseChecks,
    drawerCanCloseDetailsChecks: canCloseDetailsChecks,
  } = useBeamContext();
  const { openModal } = useModal();

  function canCloseDrawerDetails(i: number, doChange: VoidFunction) {
    for (const canCloseDrawerDetail of canCloseDetailsChecks.current[i] ?? []) {
      if (!canClose(canCloseDrawerDetail)) {
        openModal({ content: <ConfirmCloseModal onClose={doChange} {...canCloseDrawerDetail} /> });
        return false;
      }
    }
    return true;
  }

  /**
   * Validates whether a new Superdrawer can be opened / whether the current Superdrawer can be closed, performing an
   * action to "do on change"  when all validations (or close confirmations from the user) have passed.
   * Breaking the validation into a separate function allows openInDrawer
   * to validate the drawer's state without closing it
   * @param doChange - A lambda to run once all validations have passed (or once the user has confirmed that they want to close)
   * */
  function maybeChangeDrawer(doChange: VoidFunction) {
    const contentStackLength = contentStack.current.length;
    if (contentStackLength === 0) {
      doChange();
      return;
    }

    // Attempt to close each drawer details
    for (let i = contentStackLength - 2; i >= 0; i--) {
      if (!canCloseDrawerDetails(i, doChange)) {
        return;
      }
    }

    // Attempt to close the drawer
    for (const canCloseDrawer of canCloseChecks.current) {
      if (!canClose(canCloseDrawer)) {
        openModal({
          content: <ConfirmCloseModal onClose={doChange} {...canCloseDrawer} />,
        });
        return;
      }
    }
    doChange();
  }

  // Separate close actions to reference then in actions
  const closeActions = useMemo(() => {
    return {
      /** Attempts to close the drawer. If any checks fail, a confirmation modal will appear */
      closeDrawer() {
        /** Reset the contentStack, all checks and modalState */
        function onClose() {
          const first = contentStack.current[0];
          if (first?.kind === "open" && first.opts.onClose) {
            first.opts.onClose();
          }
          contentStack.current = [];
          canCloseChecks.current = [];
          canCloseDetailsChecks.current = [];
        }
        maybeChangeDrawer(onClose);
        return;
      },

      closeDrawerDetail() {
        if (contentStack.current.length < 2) return;

        // Attempt to close the current drawer details
        if (!canCloseDrawerDetails(contentStack.current.length - 2, onClose)) {
          return;
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
        maybeChangeDrawer(() => {
          contentStack.current = [{ kind: "open", opts }];
        });
      },
      openDrawerDetail(opts: OpenDetailOpts) {
        // TODO: Check modal open?
        if (!contentStack.current.length) {
          throw new Error("openInDrawer was not called before openDrawerDetail");
        }
        contentStack.current = [...contentStack.current, { kind: "detail", opts }];
      },
      /** Add a new close check to SuperDrawer */
      addCanCloseDrawerCheck(canCloseCheck: CanCloseCheck) {
        // Check if we can add a canCloseDrawer check
        const stackLength = contentStack.current.length;
        if (!stackLength) {
          console.error("Cannot add canCloseDrawerCheck when the SuperDrawer is not open");
          return;
        }

        canCloseChecks.current = [...canCloseChecks.current, canCloseCheck];
      },
      /** Add a new close check to the current SuperDrawer detail */
      addCanCloseDrawerDetailCheck(canCloseCheck: CanCloseCheck) {
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

function canClose(canCloseCheck: CanCloseCheck): boolean {
  return (
    (typeof canCloseCheck === "function" && canCloseCheck()) ||
    (typeof canCloseCheck !== "function" && canCloseCheck.check())
  );
}
