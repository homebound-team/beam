import { ReactNode } from "react";
import { Css } from "src/Css";

/**
 * A helper component for consistently showing helper text below form fields.
 */
export function HelperText(props: { helperText: string | ReactNode }) {
  const { helperText, ...others } = props;
  return (
    <div css={Css.gray700.sm.mtPx(4).$} {...others}>
      {helperText}
    </div>
  );
}
