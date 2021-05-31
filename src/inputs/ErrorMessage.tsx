import { Icon } from "src/components";
import { Css, Palette } from "src/Css";

interface ErrorMessageProps {
  /** The dom id for `aria-errormessage` to point to us. */
  id?: string;
  errorMsg: string;
}
/**
 * A helper component for consistently showing error messages across form fields.
 *
 * Not currently exported as part of our public API.
 */
export function ErrorMessage(props: ErrorMessageProps) {
  const { id, errorMsg, ...others } = props;
  return errorMsg ? (
    <div css={Css.red600.sm.df.mtPx(4).$}>
      <span css={Css.fs0.$}>
        <Icon icon="error" color={Palette.Red600} />
      </span>
      {/* Put `...others` on the span b/c it's probably the data-testid. */}
      <span id={id} css={Css.ml1.mtPx(2).$} {...others}>
        {errorMsg}
      </span>
    </div>
  ) : (
    <></>
  );
}
