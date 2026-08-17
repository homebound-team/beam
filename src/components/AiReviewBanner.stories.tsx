import { Meta } from "@storybook/react-vite";
import { AiReviewBanner } from "src/components/AiReviewBanner";
import { Css } from "src/Css";
import { noop } from "src/utils";

export default {
  component: AiReviewBanner,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-45421&m=dev",
    },
  },
} as Meta;

export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiReviewBanner
      title="Review updates found in your import."
      message="Blueprint AI captured a change to the name of your product, added a description, and added 1 additional variant."
      secondaryAction={{ label: "Clear Import", onClick: noop }}
      primaryAction={{ label: "Accept Import", onClick: noop }}
    />
  </div>
);

/** Copy only — the actions row drops out entirely. */
export const WithoutActions = () => (
  <div css={Css.wPx(956).$}>
    <AiReviewBanner
      title="Merge Duplicate Materials"
      message="Blueprint AI found existing materials for two of the materials in your imported product. Review and edit the merged materials below."
    />
  </div>
);

/** The Doc Capture flow's review — same shape, different copy and verbs. */
export const DocCapture = () => (
  <div css={Css.wPx(1440).$}>
    <AiReviewBanner
      title="Review changes to your plan found in your latest document capture."
      message="Review the changes highlighted below including 4 warnings."
      secondaryAction={{ label: "Ignore All", onClick: noop }}
      primaryAction={{ label: "Accept All", onClick: noop }}
    />
  </div>
);

/** The copy column shrinks before the actions do, so the row stays intact. */
export const Narrow = () => (
  <div css={Css.wPx(620).$}>
    <AiReviewBanner
      title="Review updates found in your import."
      message="Blueprint AI captured a change to the name of your product, added a description, and added 1 additional variant."
      secondaryAction={{ label: "Clear Import", onClick: noop }}
      primaryAction={{ label: "Accept Import", onClick: noop }}
    />
  </div>
);
