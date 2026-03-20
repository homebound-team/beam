import { mergeProps, TrussStyleHash } from "@homebound/truss/runtime";
import { cloneElement, ReactElement } from "react";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { paddingRight, paddingLeft } = useScrollableParent();
  const { className, style, ...others } = children.props;

  return paddingRight === "0px" && paddingLeft === "0px"
    ? children
    : cloneElement(
        children,
        // The child might already have className/style set, let Css.props also create
        // a className/style, and then mergeProps the two together.
        //
        // ...for some reason this keeps the Layout top padding better than using
        // react-aria's more generic mergeProps.
        {
          ...mergeProps(
            className,
            style,
            // ScrollableParent applies horizontal padding to its content column, so FullBleed
            // inverts that padding with negative margins before re-applying it to the child.
            Css.ml(invertSpacing(paddingLeft))
              .mr(invertSpacing(paddingRight))
              .if(!omitPadding)
              .pl(paddingLeft)
              .pr(paddingRight).$ as TrussStyleHash,
          ),
          ...others,
        },
      );
}

function invertSpacing(value: string) {
  return `calc(${value} * -1)`;
}
