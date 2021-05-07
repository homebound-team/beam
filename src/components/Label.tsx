import React, { LabelHTMLAttributes } from "react";
import { Css } from "src/Css";

interface LabelProps {
  // We don't usually have `fooProps`-style props, but this is for/from react-aria
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
}

/** An internal helper component for rendering form labels. */
export function Label({ labelProps, label, ...others }: LabelProps) {
  return (
    <label {...labelProps} {...others} css={Css.sm.gray700.mbPx(4).$}>
      {label}
    </label>
  );
}
