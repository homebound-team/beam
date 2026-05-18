import { ReactNode } from "react";
import { Css, Tokens } from "src/Css";

/**
 * A helper component for consistently showing helper text below form fields.
 */
export function HelperText(props: { helperText: string | ReactNode }) {
  const { helperText, ...others } = props;
  return (
    <div css={Css.color(Tokens.TextHelper).xs.mtPx(4).$} {...others}>
      {helperText}
    </div>
  );
}
