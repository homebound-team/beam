import { Css } from "src/Css";
import { ChildrenOnly } from "src/types";

/** Intended to wrap the whole application to prevent the browser's native scrolling behavior while also taking the full height of the viewport */
export function PreventBrowserScroll({ children }: ChildrenOnly) {
  return (
    // Take over the full viewport and hide any overflown content.
    // Using `-webkit-fill-available`, otherwise `height: 100vh` includes the app bars in mobile Safari. See https://allthingssmitty.com/2020/05/11/css-fix-for-100vh-in-mobile-webkit/
    // Setting the multiple "(min|max-)height" properties is necessary, as Truss will turn this into an object and there can only be one `height` property.
    <div css={Css.overflowHidden.vh100.mh("-webkit-fill-available").maxh("-webkit-fill-available").$}>
      {/* Provides a fallback for scrolling the application if nested scrolling isn't needed, or forgotten */}
      <div css={Css.h100.df.fdc.mh0.overflowAuto.$}>{children}</div>
    </div>
  );
}
