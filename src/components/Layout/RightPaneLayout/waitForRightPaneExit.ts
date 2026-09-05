import { rightPaneContentDataAttribute } from "./types";

/** Poll until {@link rightPaneContentDataAttribute} leaves the DOM (exit animation done). */
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
