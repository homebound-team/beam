import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { AiBadge } from "src/components/AiBadge";
import { Css } from "src/Css";

export default {
  component: AiBadge,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1739-2814&m=dev",
    },
  },
} as Meta;

export function Default() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="Sizes">
        <div css={Css.df.aic.gap2.$}>
          {[1, 2, 3, 4, 6].map((inc) => (
            <div key={inc} css={Css.df.fdc.aic.gap1.$}>
              <AiBadge inc={inc} />
              <span css={Css.xs2.$}>{`inc={${inc}}`}</span>
            </div>
          ))}
        </div>
      </Sample>

      <Sample title="Against text, at the 16px default">
        <span css={Css.df.aic.gap1.sm.$}>
          Program Data
          <AiBadge />
        </span>
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
