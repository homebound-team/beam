import React, { type LabelHTMLAttributes, type ReactNode } from "react";
import { VisuallyHidden } from "react-aria";
import { Icon } from "src/components/Icon";
import { maybeTooltip } from "src/components/Tooltip";
import { Css, type Font, type Only, Tokens, type Xss } from "src/Css";
import { useTestIds } from "src/utils/useTestIds";

type LabelXss = Font | "color";

type LabelProps<X> = {
  // We don't usually have `fooProps`-style props, but this is for/from react-aria
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
  label: string;
  suffix?: string;
  // If set, it is recommended to wrap in an element with `position: relative;` set, as the label will have an absolute position.
  hidden?: boolean;
  multiline?: boolean;
  tooltip?: ReactNode;
  // Removes margin bottom if true - This is different from InlineLabel. InlineLabel expects to be rendered visually within the field element. Rather just on the same line.
  inline?: boolean;
  xss?: X;
};

/** An internal helper component for rendering form labels. */
function LabelComponent<X extends Only<Xss<LabelXss>, X>>(props: LabelProps<X>) {
  const { labelProps, label, hidden, suffix, tooltip, inline, xss, ...others } = props;
  const tid = useTestIds(props, label);
  const labelEl = (
    <label
      {...labelProps}
      {...others}
      css={{
        ...Css.dif.aic.gap1.sm
          .mbPx(inline ? 0 : 4)
          .color(Tokens.TextLabel)
          .if(!inline).asfs.$,
        ...xss,
      }}
    >
      {label}
      {suffix && ` ${suffix}`}
      {tooltip && (
        <span css={Css.fs0.$}>
          {maybeTooltip({
            ...tid.tooltip,
            title: tooltip,
            placement: "top",
            children: <Icon icon="infoCircle" inc={2} color={Tokens.TextLabel} />,
          })}
        </span>
      )}
    </label>
  );
  return hidden ? <VisuallyHidden>{labelEl}</VisuallyHidden> : labelEl;
}

export const Label = React.memo(LabelComponent) as typeof LabelComponent;

type InlineLabelProps = Omit<LabelProps<unknown>, "xss" | "inline"> & {
  /** Inherit the field's disabled ink instead of OnSurface. */
  disabled?: boolean;
};

/** Label inside a field. OnSurface and semibold; the value stays regular. */
export function InlineLabel({ labelProps, label, multiline = false, disabled = false, ...others }: InlineLabelProps) {
  return (
    <label
      {...labelProps}
      {...others}
      css={
        Css.smSb.wsnw
          .prPx(4)
          .color(disabled ? "currentColor" : Tokens.OnSurface)
          .asc.if(multiline).asfs.pt1.$
      }
    >
      {label}:
    </label>
  );
}
