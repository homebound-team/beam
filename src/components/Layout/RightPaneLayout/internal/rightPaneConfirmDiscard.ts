/** Runs `proceed` now, or after the user confirms discarding the open panel's changes. */
export type RightPaneConfirmDiscard = (proceed: VoidFunction) => void;

/** Set by the open `RightPanePanel`'s `isDirty`. */
let confirmDiscard: RightPaneConfirmDiscard | undefined;

/** Registers the open panel's discard check; returns its unregister. */
export function setRightPaneConfirmDiscard(fn: RightPaneConfirmDiscard): VoidFunction {
  confirmDiscard = fn;
  return () => {
    // Don't clear a check that a swapped-in panel already set
    if (confirmDiscard === fn) confirmDiscard = undefined;
  };
}

export function getRightPaneConfirmDiscard(): RightPaneConfirmDiscard | undefined {
  return confirmDiscard;
}

export function resetRightPaneConfirmDiscard(): void {
  confirmDiscard = undefined;
}
