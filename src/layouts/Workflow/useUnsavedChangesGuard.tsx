import type { PressEvent } from "@react-types/shared";
import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { ConfirmCloseModal } from "src/components/Modal/ConfirmCloseModal";
import { useModal } from "src/components/Modal/useModal";

type UseUnsavedChangesGuardOptions = {
  /** When this returns true, Cancel / in-app route changes / tab close require confirmation. */
  isDirty?: () => boolean;
  onCancel: (e: PressEvent) => void;
};

type NavigationBlockerActions = {
  /** Allow the blocked in-app navigation to continue (leave the page). */
  proceed: () => void;
  /** Abort the pending navigation and stay on the current page. */
  cancelNavigation: () => void;
};

/** Gates Cancel, `useBlocker`, and `beforeunload` when `isDirty` reports unsaved changes. */
export function useUnsavedChangesGuard(options: UseUnsavedChangesGuardOptions): {
  onCancelClick: (e: PressEvent) => void;
  navigationBlocker: NavigationBlockerActions | undefined;
} {
  const { isDirty, onCancel } = options;
  const { openModal } = useModal();

  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current?.()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Always call the hook; the callback returns false when `isDirty` is omitted.
  const blocker = useBlocker(() => !!isDirtyRef.current?.());

  const onCancelClick = (e: PressEvent) => {
    if (!isDirty?.()) {
      onCancel(e);
      return;
    }
    openModal({
      allowClosing: false,
      content: <ConfirmCloseModal onClose={() => onCancel(e)} />,
    });
  };

  const navigationBlocker: NavigationBlockerActions | undefined =
    blocker.state === "blocked"
      ? { proceed: () => blocker.proceed?.(), cancelNavigation: () => blocker.reset?.() }
      : undefined;

  return { onCancelClick, navigationBlocker };
}

/** Opens the discard modal while React Router has a blocked navigation. */
export function UnsavedChangesNavigationModal(props: NavigationBlockerActions) {
  const { proceed, cancelNavigation } = props;
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    openModal({
      allowClosing: false,
      content: <ConfirmCloseModal title="Leave page?" onClose={proceed} onContinue={cancelNavigation} />,
    });
    return () => closeModal();
    // Open once when mounted (blocker entered "blocked"); cleanup closes on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
