import { ReactNode } from "react";
import { Button, ButtonProps } from "src/components/Button";
import { Icon, IconProps } from "src/components/Icon";
import { IconButton } from "src/components/IconButton";
import { Css, Palette } from "src/Css";
import { useTestIds } from "src/utils";

export type SnackbarNoticeTypes = "error" | "warning" | "success" | "info" | "alert";
export interface SnackbarNoticeProps {
  /** Adds action button to the right of the notice */
  action?: Pick<ButtonProps, "label" | "onClick" | "variant">;
  /** Does not allow the user to close the notice manually. Notice will fade away in 10s. Value will be ignored if 'persistent' is set to 'true'. */
  hideCloseButton?: boolean;
  message: ReactNode;
  /** This notice will persist on the screen until systematically closed by the app or by the user clicking the close button. */
  persistent?: boolean;
  /** Defines the icon that will show on the left side of the notification. */
  icon?: SnackbarNoticeTypes;
  /** Unique identifier to allow notice to close itself */
  id: string;
  /** Removes the snackbar notice from the stack */
  onClose: () => void;
}

export function SnackbarNotice(props: SnackbarNoticeProps) {
  const { icon, message, action, hideCloseButton, persistent, onClose } = props;
  const tid = useTestIds(props, "snackbar");
  // Only allow the "close" button to be hidden if not a `persistent` notice. Otherwise we could get in a state where the user cannot remove the notice from the screen.
  const reallyHideClose = hideCloseButton && !persistent;
  return (
    <div css={Css.white.bgGray800.br4.base.df.aic.maxwPx(420).$} {...tid} role="alert">
      {icon && (
        <span css={Css.fs0.plPx(12).$}>
          <Icon {...typeToIcon[icon]} {...tid.icon} />
        </span>
      )}

      <span
        css={Css.lineClamp3.pr2.myPx(12).plPx(icon ? 8 : 16).$}
        // Provide a 'title' attribute if we can in case the text is truncated
        {...(typeof message === "string" ? { title: message } : undefined)}
        {...tid.message}
      >
        {message}
      </span>

      {(action || !reallyHideClose) && (
        <span css={Css.fs0.df.aic.$}>
          {action && (
            <span css={Css.ttu.sm.prPx(!reallyHideClose && action.variant !== "text" ? 4 : 8).$}>
              <Button contrast {...action} {...tid.action} />
            </span>
          )}
          {!reallyHideClose && (
            <span css={Css.pr1.add("lineHeight", 0).$}>
              <IconButton icon="x" contrast onClick={onClose} {...tid.close} />
            </span>
          )}
        </span>
      )}
    </div>
  );
}

const typeToIcon: Record<SnackbarNoticeTypes, Pick<IconProps, "icon" | "color">> = {
  // Can change to a Tupple with IconKey and color?
  error: { icon: "xCircle", color: Palette.Red300 },
  warning: { icon: "error", color: Palette.Yellow300 },
  success: { icon: "checkCircle", color: Palette.Green300 },
  info: { icon: "infoCircle", color: Palette.LightBlue200 },
  alert: { icon: "errorCircle", color: Palette.White },
};
