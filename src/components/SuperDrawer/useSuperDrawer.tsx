import { ReactNode, useMemo } from "react";
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
  /** Returns whether the drawer is currently open. */
  isDrawerOpen: boolean;
  /**
   * Adds a check when attempting to close the SuperDrawer by clicking on the
   * overlay, the "X" button or calling `closeDrawer()`. If any checks returns
   * false, a confirmation modal will appear allowing the user to confirm
   * the action.
   */
  addCanCloseDrawerCheck: (canCloseCheck: CanCloseCheck) => void;
}

export function useSuperDrawer(): UseSuperDrawerHook {
  const { drawerContentStack: contentStack, modalState, drawerCanCloseChecks: canCloseChecks } = useBeamContext();
  const { openModal } = useModal();

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
  const closeActions = useMemo(
    () => {
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
          }
          maybeChangeDrawer(onClose);
          return;
        },
      };
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canCloseChecks, contentStack, modalState, openModal],
  );

  // useMemo the actions separately from the dynamic isDrawerOpen value
  const actions = useMemo(
    () => {
      return {
        openInDrawer(opts: OpenInDrawerOpts) {
          // When opening a new SuperDrawer, check if we can close the previous
          // SuperDrawer content. Bail if it fails
          // TODO: There needs to be try again logic here...
          maybeChangeDrawer(() => {
            contentStack.current = [{ kind: "open", opts }];
          });
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
      };
    },
    // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canCloseChecks, closeActions, contentStack],
  );

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
