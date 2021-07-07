import React from "react";
import { Pill } from "src/components/Pill";
import { Css, Margin, Only, Xss } from "src/Css";

type PillsXss = Xss<Margin>;

export interface PillsProps<X> {
  values: string[];
  xss?: X;
}

/** Renders a list of `Pill`s, with wrapping & appropriate margin between each `Pill`. */
export function Pills<X extends Only<PillsXss, X>>(props: PillsProps<X>) {
  const { values } = props;
  return (
    <div css={Css.df.add({ flexWrap: "wrap" }).my1.$}>
      {values.map((value, i) => (
        <Pill key={i} text={value} xss={Css.mr1.mb1.$} />
      ))}
    </div>
  );
}
