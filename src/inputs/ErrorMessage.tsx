import { VisuallyHidden } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css, Tokens } from "src/Css";

type ErrorMessageProps = {
  /** The dom id for `aria-errormessage` to point to us. */
  id?: string;
  errorMsg: string;
  hidden?: boolean;
};
/**
 * The error line, with its icon, that Beam fields show under the input.
 *
 * Use it standalone for an error that no single field owns, such as a missing comment in a custom form.
 */
export function ErrorMessage(props: ErrorMessageProps) {
  const { id, errorMsg, hidden = false, ...others } = props;
  const errorEl = errorMsg ? (
    <div css={Css.color(Tokens.Danger).sm.df.mtPx(4).$}>
      <span css={Css.fs0.$}>
        <Icon icon="error" />
      </span>
      {/* Put `...others` on the span b/c it's probably the data-testid. */}
      <span id={id} css={Css.ml1.mtPx(2).$} {...others}>
        {errorMsg}
      </span>
    </div>
  ) : (
    <></>
  );
  return hidden ? <VisuallyHidden>{errorEl}</VisuallyHidden> : errorEl;
}
