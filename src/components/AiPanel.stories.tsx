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

/** It fills whatever it's given, so the container decides the width. */
export const Widths = () => (
  <div css={Css.df.fdc.gap4.$}>
    {[1440, 956, 640].map((w) => (
      <div key={w} css={Css.wPx(w).$}>
        <AiPanel>
          <div css={Css.sm.color(Tokens.OnSurface).$}>{w}px container</div>
        </AiPanel>
      </div>
    ))}
  </div>
);
