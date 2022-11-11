import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { SnackbarNotice, SnackbarNoticeProps } from "src/components/Snackbar/SnackbarNotice";
import { Css } from "src/Css";
import { withBeamDecorator } from "src/utils/sb";

export default {
  component: SnackbarNotice,
  title: "Workspace/Components/Snackbar",
  decorators: [withBeamDecorator],
} as Meta;

export function NoticeExamples() {
  const propVariations: Partial<SnackbarNoticeProps>[] = [
    { hideCloseButton: true },
    {},
    { hideCloseButton: true, action: { label: "Action", onClick: action("Action clicked"), variant: "tertiary" } },
    { action: { label: "Action", onClick: action("Action clicked"), variant: "tertiary" } },
    { icon: "success", action: { label: "Action", onClick: action("Action clicked"), variant: "primary" } },
    { icon: "error" },
  ];
  return (
    <div css={Css.dg.gtc("repeat(3, 420px)").jifs.aifs.gap("64px 16px").$}>
      {propVariations.map((props, idx) => (
        <div key={idx} css={Css.df.aifs.fdc.gap2.$}>
          <SnackbarNotice onClose={action("Close notice")} id="1" message="Notice with one line of text." {...props} />
          <SnackbarNotice
            onClose={action("Close notice")}
            id="2"
            message="Snackbar notice with more that will wrap to two lines."
            {...props}
          />
          <SnackbarNotice
            onClose={action("Close notice")}
            id="3"
            message={"Snackbar notice that will truncate past three lines. ".repeat(3)}
            {...props}
          />
        </div>
      ))}
    </div>
  );
}

export function NoticeIconExamples() {
  // export type SnackbarNoticeTypes = "error" | "warning" | "success" | "info";
  const propVariations: Partial<SnackbarNoticeProps>[] = [
    { icon: "success" },
    { icon: "error" },
    { icon: "warning" },
    { icon: "info" },
  ];
  return propVariations.map((props) => {
    return (
      <div css={Css.mb1.$}>
        <SnackbarNotice onClose={action("Close notice")} id="1" message="Notice with one line of text." {...props} />
      </div>
    );
  });
}
