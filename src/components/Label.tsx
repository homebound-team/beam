import React, { LabelHTMLAttributes } from "react";
import { VisuallyHidden } from "react-aria";
import { Css } from "src/Css";

interface LabelProps {
  // We don't usually have `fooProps`-style props, but this is for/from react-aria
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  suffix?: string;
  // If set, it is recommended to wrap in an element with `position: relative;` set, as the label will have an absolute position.
  hidden?: boolean;
  contrast?: boolean;
  multiline?: boolean;
}

/** An internal helper component for rendering form labels. */
export const Label = React.memo((props: LabelProps) => {
  const { labelProps, label, hidden, suffix, contrast = false, ...others } = props;
  const labelEl = (
    <label {...labelProps} {...others} css={Css.dib.sm.gray700.mbPx(4).if(contrast).white.$}>
      {label}
      {suffix && ` ${suffix}`}
    </label>
  );
  return hidden ? <VisuallyHidden>{labelEl}</VisuallyHidden> : labelEl;
});

/** Used for showing labels within text fields. */
export function InlineLabel({ labelProps, label, contrast, multiline = false, ...others }: LabelProps) {
  return (
    <label
      {...labelProps}
      {...others}
      css={Css.smMd.nowrap.gray900.prPx(4).add("color", "currentColor").asc.if(multiline).asfs.pt1.$}
    >
      {label}:
    </label>
  );
}
