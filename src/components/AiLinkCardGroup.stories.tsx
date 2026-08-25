import { Meta } from "@storybook/react-vite";
import { ReactNode } from "react";
import { AiLinkCardGroup } from "src/components/AiLinkCardGroup";
import { LinkCardProps } from "src/components/LinkCard";
import { Css } from "src/Css";
import { viewportModes, withRouter } from "src/utils/sb";

export default {
  component: AiLinkCardGroup,
  decorators: [withRouter()],
  parameters: {
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1634-2123&m=dev",
    },
  },
} as Meta;

const summary = (
  <>
    According to the latest document upload <a href="/documents/1">Document Name Here</a> uploaded by Drew Whiting on
    July 15th 2026, here is a summary of changes to option configuration.
  </>
);

const cards: LinkCardProps[] = [
  {
    title: "Review 1 changed elevation.",
    message: (
      <>
        According to the latest document upload <a href="/documents/1">Document Name Here</a> describe change
      </>
    ),
    onClick: "/plans/1/elevations",
  },
  {
    title: "Review location changes: 1 added, 1 renumbered, 1 removed.",
    message: summary,
    onClick: "/plans/1/locations",
  },
  { title: "Review 2 new options, 1 changed, 1 removed.", message: summary, onClick: "/plans/1/options" },
  { title: "Review 1 changed program value.", message: summary, onClick: "/plans/1/program" },
];

export function Default() {
  return (
    <div css={Css.df.fdc.gap5.$}>
      <Sample title="Several findings">
        <AiLinkCardGroup cards={cards} />
      </Sample>

      <Sample title="A single finding">
        <AiLinkCardGroup cards={cards.slice(0, 1)} />
      </Sample>

      <Sample title="Narrow container">
        <div css={Css.wPx(480).$}>
          <AiLinkCardGroup cards={cards.slice(0, 2)} />
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
