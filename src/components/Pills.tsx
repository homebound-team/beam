import React from "react";
import { Pill } from "src/components/Pill";
import { Css } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

export interface PillsProps {
  values: string[];
}

/** Kinda like a chip, but read-only, so no `onClick` or `hover`. */
export function Pills(props: PillsProps) {
  const { values } = props;
  const tid = useTestIds(props, "pills");
  return (
    <div css={Css.df.add({ flexWrap: "wrap" }).$}>
      {values.map((value, i) => (
        <Pill key={i} text={value} xss={Css.mr1.mb1.$} />
      ))}
    </div>
  );
}
