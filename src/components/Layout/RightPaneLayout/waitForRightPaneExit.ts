/** DOM marker on open pane content; polled after close until the exit animation finishes. */
export const rightPaneContentDataAttribute = "data-right-pane-content";

/**
 * Poll until the pane node leaves the DOM (exit animation finished).
 * Hosts keep the spacer / `--beam-floating-right-offset` until then so chrome does not jump mid-slide.
 * Also used as a jsdom fallback when `onAnimationComplete` does not fire.
 */
export function waitForRightPaneExit(onComplete: () => void): () => void {
  let frame = 0;
  const tick = () => {
    if (document.querySelector(`[${rightPaneContentDataAttribute}]`)) {
      frame = requestAnimationFrame(tick);
      return;
    }
    onComplete();
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
