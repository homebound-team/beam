/** Whether an interaction outside an overlay should dismiss it. The trigger is the caller's concern. */
export function shouldDismissOverlay(el: Element, trigger: HTMLElement | null): boolean {
  // Tribute.js mention menus (`.tribute-container`) and alerts sit above the overlay, so they must stay open.
  if (el.closest(".tribute-container") || el.closest("[role='alert']")) return false;
  // A dialog layered above the trigger stays up. The dialog that contains the trigger is underneath, so it dismisses.
  const dialog = el.closest("[role='dialog']");
  if (dialog && !dialog.contains(trigger)) return false;
  return true;
}
