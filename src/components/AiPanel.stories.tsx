import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { AiPanel } from "src/components/AiPanel";
import { Button } from "src/components/Button";
import { Css, Tokens } from "src/Css";
import { TextField } from "src/inputs";

export default {
  component: AiPanel,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=1199-774&m=dev",
    },
  },
} as Meta;

/** The panel is only chrome — whatever goes inside is the caller's. */
export const Default = () => (
  <div css={Css.wPx(956).$}>
    <AiPanel>
      <div css={Css.sm.color(Tokens.OnSurface).$}>Children go here.</div>
    </AiPanel>
  </div>
);

/** `rounded` for a panel sitting within page content rather than spanning it. */
export const Rounded = () => (
  <div css={Css.wPx(1028).$}>
    <AiPanel rounded>
      <div css={Css.sm.color(Tokens.OnSurface).$}>Children go here.</div>
    </AiPanel>
  </div>
);

/** A form as children — the panel neither knows nor cares. */
export const WithForm = () => {
  const [url, setUrl] = useState<string | undefined>("");
  return (
    <div css={Css.wPx(731).$}>
      <AiPanel>
        <div css={Css.df.fdc.gap2.w100.$}>
          <TextField label="URL" value={url} onChange={setUrl} />
          <div css={Css.df.jcfe.$}>
            <Button label="Import" onClick={() => {}} />
          </div>
        </div>
      </AiPanel>
    </div>
  );
};

/**
 * The background always spans its container. `fullWidth={false}` shrinks the card to its content and
 * centers it, leaving the background full width either way.
 */
export const CardWidth = () => (
  <div css={Css.df.fdc.gap4.wPx(1200).$}>
    {[true, false].map((fullWidth) => (
      <div key={String(fullWidth)}>
        <div css={Css.xsSb.gray700.mb1.$}>fullWidth={String(fullWidth)}</div>
        <AiPanel fullWidth={fullWidth}>
          <div css={Css.sm.color(Tokens.OnSurface).$}>Children go here.</div>
        </AiPanel>
      </div>
    ))}
  </div>
);
