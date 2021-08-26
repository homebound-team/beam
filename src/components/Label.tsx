import React, { LabelHTMLAttributes } from "react";
import { VisuallyHidden } from "react-aria";
import { Css } from "src/Css";
import { BeamTheme } from "src/types";

interface LabelProps {
  // We don't usually have `fooProps`-style props, but this is for/from react-aria
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  suffix?: string;
  // If set, it is recommended to wrap in an element with `position: relative;` set, as the label will have an absolute position.
  hidden?: boolean;
  // At some point the Theme should be inherited from a Context
  theme?: BeamTheme;
}

/** An internal helper component for rendering form labels. */
export function Label(props: LabelProps) {
  const { labelProps, label, hidden, suffix, theme, ...others } = props;
  const labelEl = (
    <label {...labelProps} {...others} css={Css.dib.sm.gray700.mbPx(4).if(theme === BeamTheme.Dark).white.$}>
      {label}
      {suffix && ` ${suffix}`}
    </label>
  );
  return hidden ? <VisuallyHidden>{labelEl}</VisuallyHidden> : labelEl;
}

/** Used for showing labels within text fields. */
export function InlineLabel({ labelProps, label, ...others }: LabelProps) {
  return (
    <label {...labelProps} {...others} css={Css.smEm.nowrap.gray900.prPx(4).add("color", "currentColor").$}>
      {label}:
    </label>
  );
}
