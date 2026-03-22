import { cloneElement, ReactElement } from "react";
import { mergeProps } from "react-aria";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { paddingRight, paddingLeft } = useScrollableParent();
  return paddingRight === "0px" && paddingLeft === "0px"
    ? children
    : cloneElement(
        children,
        // The child might already have className/style set, let Css.props also create
        // a className/style, and then mergeProps the two together.
        mergeProps(
          children.props,
          Css.props(
            // ScrollableParent applies horizontal padding to its content column, so FullBleed
            // inverts that padding with negative margins before re-applying it to the child.
            Css.ml(invertSpacing(paddingLeft))
              .mr(invertSpacing(paddingRight))
              .if(!omitPadding)
              .pl(paddingLeft)
              .pr(paddingRight).$,
          ),
        ),
      );
}

function invertSpacing(value: string) {
  return `calc(${value} * -1)`;
}
