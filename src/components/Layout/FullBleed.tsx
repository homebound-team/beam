import { cloneElement, ReactElement } from "react";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { paddingX } = useScrollableParent();
  return !paddingX
    ? children
    : cloneElement(children, {
        style: Css.mxPx(paddingX * -1)
          .if(!omitPadding)
          .pxPx(paddingX).$,
      });
}
