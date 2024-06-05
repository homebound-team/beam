import React, { LabelHTMLAttributes, ReactNode } from "react";
import { VisuallyHidden } from "react-aria";
import { Css, Font, Only, Palette, Xss } from "src/Css";
import { Icon } from "src";

type LabelXss = Font | "color";

interface LabelProps<X> {
  // We don't usually have `fooProps`-style props, but this is for/from react-aria
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  suffix?: string;
  // If set, it is recommended to wrap in an element with `position: relative;` set, as the label will have an absolute position.
  hidden?: boolean;
  contrast?: boolean;
  multiline?: boolean;
  tooltip?: ReactNode;
  // Removes margin bottom if true - This is different from InlineLabel. InlineLabel expects to be rendered visually within the field element. Rather just on the same line.
  inline?: boolean;
  xss?: X;
}

/** An internal helper component for rendering form labels. */
function LabelComponent<X extends Only<Xss<LabelXss>, X>>(props: LabelProps<X>) {
  const { labelProps, label, hidden, suffix, contrast = false, tooltip, inline, xss, ...others } = props;
  const labelEl = (
    <label
      {...labelProps}
      {...others}
      css={{
        ...Css.dif.aic.gap1.sm.gray700
          .mbPx(inline ? 0 : 4)
          .if(contrast)
          .white.if(!inline).asfs.$,
        ...xss,
      }}
    >
      {label}
      {suffix && ` ${suffix}`}
      {tooltip && (
        <span css={Css.fs0.$}>
          <Icon icon="infoCircle" tooltip={tooltip} inc={2} color={contrast ? Palette.White : Palette.Gray700} />
        </span>
      )}
    </label>
  );
  return hidden ? <VisuallyHidden>{labelEl}</VisuallyHidden> : labelEl;
}

export const Label = React.memo(LabelComponent) as typeof LabelComponent;

type InlineLabelProps = Omit<LabelProps<unknown>, "xss" | "inline">;
/** Used for showing labels within text fields. */
export function InlineLabel({ labelProps, label, contrast, multiline = false, ...others }: InlineLabelProps) {
  return (
    <label
      {...labelProps}
      {...others}
      css={Css.smMd.wsnw.gray900.prPx(4).add("color", "currentColor").asc.if(multiline).asfs.pt1.$}
    >
      {label}:
    </label>
  );
}
