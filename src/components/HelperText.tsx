import { ReactNode } from "react";
import { Css } from "src/Css";
import { BeamTheme } from "src/types";

/**
 * A helper component for consistently showing helper text below form fields.
 */
export function HelperText(props: { helperText: string | ReactNode; theme?: BeamTheme }) {
  const { helperText, theme, ...others } = props;
  return (
    <div css={Css.gray700.sm.mtPx(4).if(theme === BeamTheme.Dark).gray100.$} {...others}>
      {helperText}
    </div>
  );
}
