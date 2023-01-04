import { Css } from "src/Css";
import { ChildrenOnly } from "src/types";

/** Intended to wrap the whole application to prevent the browser's native scrolling behavior while also taking the full height of the viewport */
export function PreventBrowserScroll({ children }: ChildrenOnly) {
  return (
    // Take over the full viewport and hide any overflown content.
    <div css={Css.overflowHidden.vh100.$}>
      {/* Provides a fallback for scrolling the application if nested scrolling isn't needed, or forgotten */}
      <div css={Css.h100.df.fdc.mh0.overflowAuto.$}>{children}</div>
    </div>
  );
}
