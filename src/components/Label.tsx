import React, { LabelHTMLAttributes } from "react";
import { Css } from "src/Css";

interface LabelProps {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
}
export function Label({ labelProps, label }: LabelProps) {
  return (
    <label {...labelProps} css={Css.sm.coolGray500.mbPx(4).$}>
      {label}
    </label>
  );
}
