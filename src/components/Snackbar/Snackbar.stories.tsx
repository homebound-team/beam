import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonVariant, useSnackbar } from "src/components";
import { Snackbar } from "src/components/Snackbar/Snackbar";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { withBeamDecorator } from "src/utils/sb";

interface SnackBarStoryProps extends Omit<SnackbarNoticeProps, "action"> {
  actionText?: string;
  actionVariant?: ButtonVariant;
}

export default {
  component: Snackbar,
  title: "Components/Snackbar",
  decorators: [withBeamDecorator],
  args: {
    type: undefined,
    persistent: false,
    hideCloseButton: false,
    message: "Hey there, I am a snackbar notice!",
    actionText: "",
    actionVariant: undefined,
  },
  argTypes: {
    type: { control: { type: "select", options: [undefined, "error", "info", "success", "warning"] } },
    actionVariant: { control: { type: "select", options: ["primary", "secondary", "tertiary", "text", "danger"] } },
  },
  parameters: { controls: { exclude: "notices" } },
} as Meta<SnackBarStoryProps>;

export function Customizable(args: SnackBarStoryProps) {
  const { triggerNotice } = useSnackbar();
  const { actionText, actionVariant, ...noticeProps } = args;

  useEffect(() => {
    triggerNotice({ message: "Initial notice for chromatic diff purposes to ensure proper placement." });
  }, [triggerNotice]);

  return (
    <Button
      onClick={() =>
        triggerNotice({
          ...noticeProps,
          ...(actionText
            ? { action: { label: actionText, variant: actionVariant, onClick: action(`${actionText} clicked`) } }
            : undefined),
        })
      }
      label="Trigger notice"
    />
  );
}

export function SystematicClose(args: SnackBarStoryProps) {
  const { triggerNotice, closeNotice } = useSnackbar();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const noticeId = "customId";
  const { actionText, actionVariant, ...noticeProps } = args;

  const triggerOnClick = useCallback(() => {
    triggerNotice({
      ...noticeProps,
      ...(actionText
        ? { action: { label: actionText, variant: actionVariant, onClick: action(`${actionText} clicked`) } }
        : undefined),
      id: noticeId,
      persistent: true,
      onClose: () => setNoticeOpen(false),
    });
    setNoticeOpen(true);
  }, [noticeId]);

  const closeOnClick = useCallback(() => {
    closeNotice(noticeId);
    setNoticeOpen(false);
  }, [closeNotice]);

  return (
    <div css={Css.df.gap2.$}>
      <Button onClick={triggerOnClick} label="Trigger notice" disabled={noticeOpen} />
      <Button variant="secondary" onClick={closeOnClick} label="Close notice" disabled={!noticeOpen} />
    </div>
  );
}
SystematicClose.parameters = { controls: { exclude: ["notices", "persistent", "hideCloseButton"] } };
