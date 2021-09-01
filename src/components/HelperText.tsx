import { ReactNode } from "react";
import { Css } from "src/Css";

/**
 * A helper component for consistently showing helper text below form fields.
 */
export function HelperText(props: { helperText: string | ReactNode; contrast?: boolean }) {
  const { helperText, contrast = false, ...others } = props;
  return (
    <div css={Css.gray700.xs.mtPx(4).if(contrast).gray100.$} {...others}>
      {helperText}
    </div>
  );
}
