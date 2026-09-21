import type { PressEvent } from "@react-types/shared";
import { useEffect, useRef } from "react";
import { type BlockerFunction, useBlocker } from "react-router-dom";
import { ConfirmCloseModal } from "src/components/Modal/ConfirmCloseModal";
import { useModal } from "src/components/Modal/useModal";

/** The pending in-app navigation, as React Router reports it (pathnames are basename-stripped). */
export type AllowNavigationArgs = Parameters<BlockerFunction>[0];

type UseUnsavedChangesGuardOptions = {
  /** When this returns true, Cancel / in-app route changes / tab close require confirmation. */
  isDirty?: () => boolean;
  /** Consulted only while dirty — return true to allow a route change that stays on this form. */
  allowNavigation?: (args: AllowNavigationArgs) => boolean;
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
  const { isDirty, allowNavigation, onCancel } = options;
  const { openModal } = useModal();

  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;
  const allowNavigationRef = useRef(allowNavigation);
  allowNavigationRef.current = allowNavigation;
  // Set only while a confirmed Cancel runs, so if a navigation redirect happens during onCancel, that redirect is not blocked by useBlocker
  const allowCancelNavigationRef = useRef(false);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current?.()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // Always call the hook; block only when dirty and the app has not allowlisted this navigation.
  const blocker = useBlocker((args) => {
    if (allowCancelNavigationRef.current) {
      return false;
    }
    // Short-circuits, so a clean form is never asked and never blocks.
    return !!isDirtyRef.current?.() && !allowNavigationRef.current?.(args);
  });

  const confirmCancel = (e: PressEvent) => {
    allowCancelNavigationRef.current = true;
    onCancel(e);
    // Only the navigation started from this onCancel is allowlisted.
    allowCancelNavigationRef.current = false;
  };

  const onCancelClick = (e: PressEvent) => {
    if (!isDirty?.()) {
      onCancel(e);
      return;
    }
    openModal({
      allowClosing: false,
      content: <ConfirmCloseModal onClose={() => confirmCancel(e)} />,
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
