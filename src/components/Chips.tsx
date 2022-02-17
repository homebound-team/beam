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
  const { wrap } = usePresentationContext();
  const { values, xss = {} } = props;
  return (
    <div
      css={{
        ...Css.df.aifs.gap1.whiteSpace("normal").$,
        ...(wrap !== false ? Css.add({ flexWrap: "wrap" }).$ : {}),
        ...xss,
      }}
    >
      {values.map((value, i) => (
        <Chip key={i} text={value} />
      ))}
    </div>
  );
}
