import React from "react";
import { Chip } from "src/components/Chip";
import { Css, Margin, Only, Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type ChipXss = Xss<Margin>;

export interface ChipsProps<T, X> {
  values: T[];
  getLabel: (value: T) => string;
  onRemove: (value: T) => void;
  xss?: X;
}

/** Renders a list of `Chip`s, with wrapping & appropriate margin between each `Chip`. */
export function Chips<T, X extends Only<ChipXss, X>>(props: ChipsProps<T, X>) {
  const { values, getLabel, onRemove, xss } = props;
  const tid = useTestIds(props, "chip");
  return (
    <div css={{ ...Css.df.add({ flexWrap: "wrap" }).my1.$, xss }}>
      {values.map((value, i) => (
        <Chip key={i} text={getLabel(value)} onClick={() => onRemove(value)} xss={Css.mr1.mb1.$} {...tid} />
      ))}
    </div>
  );
}
