import { cloneElement, ReactElement } from "react";
import { useScrollableParent } from "src/components/Layout/ScrollableParent";
import { Css } from "src/Css";

/** Provides a way to extend the full width of the ScrollableParent */
export function FullBleed({ children, omitPadding = false }: { children: ReactElement; omitPadding?: boolean }) {
  const { pr, pl } = useScrollableParent();
  return !pr && !pl
    ? children
    : cloneElement(children, {
        style: Css.ml(`-${pl}`).mr(`-${pr}`).if(!omitPadding).pl(pl).pr(pr).$,
      });
}
