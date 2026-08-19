import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { AiSlimBanner } from "src/components/AiSlimBanner";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { viewportModes } from "src/utils/sb";

export default {
  component: AiSlimBanner,
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/DchiwVkssXeYi2Er8sMU2k/H2-2026-Plans---Automated-Construction-Doc-Capture?node-id=1518-51815&m=dev",
    },
  },
} as Meta;

const title = "Review 4 Suggested Changes";
const action = { label: "Ignore All", onClick: noop };

export function Default() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="With an action">
        <AiSlimBanner title={title} action={action} />
      </Sample>

      <Sample title="Without an action">
        <AiSlimBanner title={title} />
      </Sample>

      <Sample title="Long copy">
        <AiSlimBanner
          title={`${title} found across every plan in this project, including the ones you archived last month`}
          action={action}
        />
      </Sample>

      <Sample title="Inline above the content it's about">
        <div css={Css.ba.bcGray200.br8.oh.$}>
          <AiSlimBanner title={title} action={action} />
          <div css={Css.p2.df.fdc.gap1.$}>
            {[0, 1, 2].map((i) => (
              <div key={i} css={Css.hPx(40).br4.bgGray100.$} />
            ))}
          </div>
        </div>
      </Sample>
    </div>
  );
}

function Sample({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 css={Css.lg.mb1.$}>{title}</h2>
      {children}
    </div>
  );
}
