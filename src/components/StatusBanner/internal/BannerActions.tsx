import { Button, type ButtonVariant } from "src/components/Button";
import type { ActionButtonProps } from "src/components/Layout/layoutTypes";
import { Css } from "src/Css";

type BannerActionsProps = {
  actions: { action: ActionButtonProps; variant: ButtonVariant }[];
};

/** Banner buttons. On small screens they take their own row: one is full width, several split it. */
export function BannerActions(props: BannerActionsProps) {
  const { actions } = props;
  return (
    <div css={Css.df.aic.gap1.fs0.ifSm.w100.add("order", "3").add("flexBasis", "100%").$}>
      {actions.map(({ action, variant }, index) => (
        <div
          key={`${typeof action.label === "string" ? action.label : variant}-${index}`}
          css={Css.df.ifSm.fg1.fb(0).$}
        >
          <Button {...action} variant={variant} fullWidth />
        </div>
      ))}
    </div>
  );
}
