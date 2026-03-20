import { cloneElement, ReactElement } from "react";
import { mergeProps } from "react-aria";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { pr, pl } = useScrollableParent();
  return !pr && !pl
    ? children
    : cloneElement(
        children,
        // The child might already have className/style set, let Css.props also create
        // a className/style, and then mergeProps the two together.
        mergeProps(children.props, Css.props(Css.ml(`-${pl}`).mr(`-${pr}`).if(!omitPadding).pl(pl).pr(pr).$)),
      );
}
