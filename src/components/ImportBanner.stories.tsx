import { Meta } from "@storybook/react-vite";
import { ImportBanner } from "src/components/ImportBanner";
import { Css } from "src/Css";

export default {
  component: ImportBanner,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-47688&m=dev",
    },
  },
} as Meta;

/** The page-level banner, i.e. pinned above content the user can keep working in. Width is the design's. */
export const Small = () => (
  <div css={Css.wPx(956).$}>
    <ImportBanner />
  </div>
);

/**
 * The standalone card, i.e. the import is the only thing on screen.
 *
 * 816px, not the design's 768px — the banner's own 24px of side padding sits outside the card, so
 * this is the width that lands the card itself on 768.
 */
export const Large = () => (
  <div css={Css.wPx(816).$}>
    <ImportBanner size="lg" />
  </div>
);

/** Both sizes shrink with their container — the copy wraps, the loader doesn't. */
export const Narrow = () => (
  <div css={Css.df.fdc.gap4.$}>
    <div css={Css.wPx(420).$}>
      <ImportBanner />
    </div>
    <div css={Css.wPx(420).$}>
      <ImportBanner size="lg" />
    </div>
  </div>
);

/** `title` and `message` default to the import copy, but either can be swapped per flow. */
export const CustomCopy = () => (
  <div css={Css.wPx(956).$}>
    <ImportBanner title="Reading your spec..." message="We'll email you when this finishes." />
  </div>
);
