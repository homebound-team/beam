import React from "react";
import { Chip } from "src/components/Chip";
import { usePresentationContext } from "src/components/PresentationContext";
import { Css, Margin, Only, Xss } from "src/Css";

type ChipsXss = Xss<Margin>;

export interface ChipsProps<X> {
  values: string[];
  xss?: X;
}

/** Renders a list of `Chip`s, with wrapping & appropriate margin between each `Chip`. */
export function Chips<X extends Only<ChipsXss, X>>(props: ChipsProps<X>) {
  const { tableStyle } = usePresentationContext();
  const { values, xss = {} } = props;
  // Do not allow Chips to wrap if within a `fixed` style table
  const wrap = tableStyle !== "fixed";
  return (
    <div css={{ ...Css.df.gap1.whiteSpace("normal").$, ...(wrap ? Css.add({ flexWrap: "wrap" }).$ : {}), ...xss }}>
      {values.map((value, i) => (
        <Chip key={i} text={value} />
      ))}
    </div>
  );
}
