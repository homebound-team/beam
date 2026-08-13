import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import { Css } from "src/Css";
import { TextField } from "src/inputs";

export default {
  component: AiPanel,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/igPmWwd7NXOygquKxxj0wa/Material-Import?node-id=310-47688&m=dev",
    },
  },
} as Meta;

/**
 * The loading state, i.e. what `ImportBanner` renders.
 *
 * Story widths throughout are the design's card width plus the panel's own 48px of side padding, so
 * the card itself lands where the designs draw it.
 */
export const Loading = () => (
  <div css={Css.wPx(956).$}>
    <AiPanel
      align="center"
      loading
      title="Importing Details..."
      message="This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving."
    />
  </div>
);

/** The same content given room to breathe, i.e. when the import is the only thing on screen. */
export const LoadingStandalone = () => (
  <div css={Css.wPx(816).$}>
    <AiPanel
      align="center"
      variant="page"
      loading
      title="Importing Details..."
      message="This process can take a few minutes. Feel free to keep working in another tab. Once imported, you may edit or add to content before saving."
    />
  </div>
);

/** The step before the import runs — the same chrome hosting fields instead of a loader. */
export const Form = () => {
  const [type, setType] = useState<string | undefined>("");
  const [url, setUrl] = useState<string | undefined>("");
  return (
    <div css={Css.wPx(731).$}>
      <AiPanel
        variant="page"
        title="Import Material Details"
        message="Select your material type and the manufacturer's URL to import item details. After content is populated you may add or edit it before saving."
      >
        <div css={Css.df.gap2.w100.mt2.$}>
          <div css={Css.wPx(160).$}>
            <TextField label="Type" value={type} onChange={setType} />
          </div>
          <div css={Css.fg1.$}>
            <TextField label="URL" value={url} onChange={setUrl} />
          </div>
        </div>
        <div css={Css.df.jcfe.w100.mt2.$}>
          <Button label="Import" onClick={() => {}} />
        </div>
      </AiPanel>
    </div>
  );
};

/** A result with nothing to action — title and copy only. */
export const Informational = () => (
  <div css={Css.wPx(1440).$}>
    <AiPanel
      title="Merge Duplicate Materials"
      message="Blueprint AI found existing materials for two of the materials in your imported product. Review and edit the merged materials below."
    />
  </div>
);

/**
 * Doc Capture, a different initiative reaching for the same panel — and the reason `rounded` exists,
 * since it sits inside page content rather than spanning it.
 *
 * The only design that fits neither variant, so this is an approximation: `banner` gets its width
 * right, but the design draws the wordmark at `page`'s 24px and pads the card slightly wider. Waiting
 * on design to say whether that's deliberate.
 */
export const Upload = () => (
  <div css={Css.wPx(1028).$}>
    <AiPanel
      rounded
      title="Import Plan Data from your Construction Documents"
      message="Upload your Construction Documents and AI will extract and fill in Elevations, Locations, Options and Program Data to your Plan Package. This process takes about 5 minutes. Then you'll review and accept the results."
    >
      <div css={Css.mt2.$}>
        <Button label="Upload Document" icon="upload" onClick={() => {}} />
      </div>
    </AiPanel>
  </div>
);

/** The review banner — copy left, actions right. */
export const Actions = () => (
  <div css={Css.wPx(1440).$}>
    <AiPanel
      title="Review changes to your plan found in your latest document capture."
      message="Review the changes highlighted below including 4 warnings."
      secondaryAction={{ label: "Ignore All", onClick: () => {} }}
      primaryAction={{ label: "Accept All", onClick: () => {} }}
    />
  </div>
);

/** `align` and `rounded` combined — all four are the same width, `rounded` only changes corners. */
export const AlignAndRounded = () => (
  <div css={Css.df.fdc.gap4.wPx(720).$}>
    {(["left", "center"] as const).map((align) =>
      [false, true].map((rounded) => (
        <div key={`${align}-${rounded}`}>
          <div css={Css.xsSb.gray700.mb1.$}>
            align={align} rounded={String(rounded)}
          </div>
          <AiPanel align={align} rounded={rounded} title="Importing Details..." message="Short body copy." />
        </div>
      )),
    )}
  </div>
);
