/** DOM marker on open pane content; polled after close until the exit animation finishes. */
export const rightPaneContentDataAttribute = "data-right-pane-content";

/**
 * Poll until the pane node leaves the DOM (exit animation finished).
 * Hosts keep `--beam-right-pane-width` / `--beam-floating-right-offset` until then so sticky-right
 * columns do not jump mid-slide. The overlay spacer width follows open state and CSS-transitions.
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
