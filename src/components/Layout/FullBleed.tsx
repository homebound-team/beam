import { cloneElement, ReactElement } from "react";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css, px } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { paddingX } = useScrollableParent();
  return !paddingX
    ? children
    : cloneElement(children, {
        style: Css.mlPx(paddingX * -1)
          .w(`calc(100% + ${px(paddingX * 2)})`)
          .if(!omitPadding)
          .pxPx(paddingX).$,
      });
}
