import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useCallback, useEffect, useState } from "react";
import { Button, ButtonVariant, useSnackbar } from "src/components";
import { Offset, Snackbar } from "src/components/Snackbar/Snackbar";
import { SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { withBeamDecorator } from "src/utils/sb";

interface SnackBarStoryProps extends Omit<SnackbarNoticeProps, "action"> {
  actionLabel?: string;
  actionVariant?: ButtonVariant;
  offset?: Offset;
  notices: SnackbarNoticeProps[];
}

export default {
  component: Snackbar,
  decorators: [withBeamDecorator],
  args: {
    icon: undefined,
    persistent: false,
    hideCloseButton: false,
    message: "Hey there, I am a snackbar notice!",
    actionLabel: "",
    actionVariant: undefined,
    offset: { bottom: 200 },
  },
  argTypes: {
    icon: { control: { type: "select" }, options: [undefined, "error", "info", "success", "warning"] },
    actionVariant: {
      options: ["primary", "secondary", "tertiary", "text", "danger"],
      control: { type: "select" },
      name: "action.variant",
    },
    actionLabel: { name: "action.label" },
    offset: { name: "offset" },
  },
  parameters: {
    controls: { exclude: "notices" },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36152%3A102047",
    },
  },
} as Meta<SnackBarStoryProps>;

export function Customizable(args: SnackBarStoryProps) {
  const { triggerNotice } = useSnackbar();
  const { actionLabel, actionVariant, ...noticeProps } = args;

  useEffect(() => {
    triggerNotice({ message: "Initial notice for chromatic diff purposes to ensure proper placement." });
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

export function CustomOffset(args: SnackBarStoryProps) {
  const [show, setShow] = useState(true);

  return (
    <div css={Css.df.fdc.aifs.gap3.$}>
      <Button label={show ? "Dismount Triggerer" : "Re-mount Triggerer"} onClick={() => setShow(!show)} />
      {show && <CustomOffsetComponent {...args} />}
    </div>
  );
}

function CustomOffsetComponent(props: SnackBarStoryProps) {
  const { triggerNotice, useSnackbarOffset } = useSnackbar();
  const { actionLabel, actionVariant, offset, ...noticeProps } = props;

  useSnackbarOffset(offset ?? {});
  useEffect(() => {
    triggerNotice({ message: "Initial notice for chromatic diff purposes to ensure proper placement." });
  }, []);

  return (
    <Button
      label="Trigger Notice"
      onClick={() =>
        triggerNotice({
          ...noticeProps,
          ...(actionLabel
            ? { action: { label: actionLabel, variant: actionVariant, onClick: action(`${actionLabel} clicked`) } }
            : undefined),
        })
      }
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
