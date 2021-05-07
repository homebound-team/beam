import React, { LabelHTMLAttributes } from "react";
import { Css } from "src/Css";

interface LabelProps {
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
}
export function Label({ labelProps, label, ...others }: LabelProps) {
  return (
    <label {...labelProps} {...others} css={Css.sm.gray700.mbPx(4).$}>
      {label}
    </label>
  );
}
