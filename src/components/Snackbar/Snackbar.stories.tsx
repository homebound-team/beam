import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonVariant, useSnackbar } from "src/components";
import { Snackbar } from "src/components/Snackbar/Snackbar";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { withBeamDecorator } from "src/utils/sb";
import { SnackbarProvider } from "./SnackbarContext";

interface SnackBarStoryProps extends Omit<SnackbarNoticeProps, "action"> {
  actionLabel?: string;
  actionVariant?: ButtonVariant;
  bottomOffset?: number;
}

export default {
  component: Snackbar,
  title: "Components/Snackbar",
  decorators: [withBeamDecorator],
  args: {
    icon: undefined,
    persistent: false,
    hideCloseButton: false,
    message: "Hey there, I am a snackbar notice!",
    actionLabel: "",
    actionVariant: undefined,
    bottomOffset: 24,
  },
  argTypes: {
    icon: { control: { type: "select", options: [undefined, "error", "info", "success", "warning"] } },
    actionVariant: {
      control: { type: "select", options: ["primary", "secondary", "tertiary", "text", "danger"] },
      name: "action.variant",
    },
    actionLabel: { name: "action.label" },
  },
  parameters: { controls: { exclude: "notices" } },
} as Meta<SnackBarStoryProps>;

/**
 * Defining specific provider to set bottomOffset
 * instead of using the one from BeamProvider
 */
export function Customizable(args: SnackBarStoryProps) {
  return (
    <SnackbarProvider bottomOffset={args.bottomOffset}>
      <Custom {...args} />
    </SnackbarProvider>
  );
}

function Custom(args: SnackBarStoryProps) {
  const { triggerNotice } = useSnackbar();
  const { actionLabel, actionVariant, ...noticeProps } = args;

  useEffect(() => {
    triggerNotice({
      message: "Initial notice for chromatic diff purposes to ensure proper placement.",
    });
  }, [triggerNotice]);

  return (
    <Button
      onClick={() =>
        triggerNotice({
          ...noticeProps,
          ...(actionLabel
            ? { action: { label: actionLabel, variant: actionVariant, onClick: action(`${actionLabel} clicked`) } }
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
  const { actionLabel, actionVariant, ...noticeProps } = args;

  const triggerOnClick = useCallback(() => {
    triggerNotice({
      ...noticeProps,
      ...(actionLabel
        ? { action: { label: actionLabel, variant: actionVariant, onClick: action(`${actionLabel} clicked`) } }
        : undefined),
      id: noticeId,
      persistent: true,
      onClose: () => setNoticeOpen(false),
    });
    setNoticeOpen(true);
  }, [actionLabel, actionVariant, noticeId, noticeProps, triggerNotice]);

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
