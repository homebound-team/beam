import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { AiBanner } from "src/components/AiBanner";
import { Css } from "src/Css";
import { noop } from "src/utils";

export default {
  component: AiBanner,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/DchiwVkssXeYi2Er8sMU2k/H2-2026-Plans---Automated-Construction-Doc-Capture?node-id=1608-25908&m=dev",
    },
  },
} as Meta;

const title = "Review changes to your plan found in your latest document capture.";
const message = "Review the changes highlighted below including 4 warnings.";
const actions = {
  secondaryAction: { label: "Ignore All", onClick: noop },
  primaryAction: { label: "Accept All", onClick: noop },
};

export function Default() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="Title, message, and both actions">
        <AiBanner title={title} message={message} {...actions} />
      </Sample>

      <Sample title="Without a message">
        <AiBanner title={title} {...actions} />
      </Sample>

      <Sample title="Without actions">
        <AiBanner title={title} message={message} />
      </Sample>

      <Sample title="Narrow — the copy wraps, the actions don't shrink" width={640}>
        <AiBanner title={title} message={message} {...actions} />
      </Sample>
    </div>
  );
}

function Sample({ title, width = 1440, children }: { title: string; width?: number; children: ReactNode }) {
  return (
    <div>
      <h2 css={Css.lg.mb1.$}>{title}</h2>
      <div css={Css.wPx(width).$}>{children}</div>
    </div>
  );
}
