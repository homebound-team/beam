import { Icon } from "src/components";
import { Css, Palette } from "src/Css";

/**
 * A helper component for consistently showing error messages across form fields.
 *
 * Not currently exported as part of our public API.
 */
export function ErrorMessage(props: { id?: string; errorMsg: string | undefined }) {
  const { id, errorMsg, ...others } = props;
  // Put `...others` on the span b/c it's probably the data-testid
  return errorMsg ? (
    <div css={Css.red600.sm.df.mtPx(4).$}>
      <span css={Css.fs0.$}>
        <Icon icon="error" color={Palette.Red600} />
      </span>
      <span css={Css.ml1.mtPx(2).$} {...others}>
        {errorMsg}
      </span>
    </div>
  ) : (
    <></>
  );
}
