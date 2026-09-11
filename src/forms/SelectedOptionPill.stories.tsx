import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Css } from "src/Css";
import { SelectedOptionPill } from "src/forms/SelectedOptionPill";
import { action } from "storybook/actions";

export default {
  component: SelectedOptionPill,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/DchiwVkssXeYi2Er8sMU2k/H2-2026-Plans---Automated-Construction-Doc-Capture?node-id=1462-46208",
    },
  },
} as Meta;

export function Default() {
  return (
    <div css={Css.df.fdc.gap3.maxwPx(592).$}>
      <SelectedOptionPill value={optionValue()} onRemove={action("onRemove")} />
    </div>
  );
}

export function WithHelperText() {
  return (
    <div css={Css.df.fdc.gap3.maxwPx(592).$}>
      <SelectedOptionPill value={optionValue()} helperText={sourcesHelperText()} onRemove={action("onRemove")} />
    </div>
  );
}

export function AiMode() {
  return (
    <div css={Css.df.fdc.gap3.maxwPx(592).$}>
      <SelectedOptionPill value={optionValue()} helperText={sourcesHelperText()} onRemove={action("onRemove")} aiMode />
    </div>
  );
}

export function Disabled() {
  return (
    <div css={Css.df.fdc.gap3.maxwPx(592).$}>
      <SelectedOptionPill value={optionValue()} onRemove={action("onRemove")} disabled />
    </div>
  );
}

function optionValue(): ReactNode {
  return (
    <span css={Css.sm.$}>
      CEILBEAM01 <span css={Css.smSb.$}>Faux Ceiling Beams</span> Living Room 101
    </span>
  );
}

function sourcesHelperText(): ReactNode {
  return (
    <span css={Css.xs.$}>
      Sources:{" "}
      <a href="#page-3" css={Css.blue600.$}>
        Page 3
      </a>
      ,{" "}
      <a href="#page-76" css={Css.blue600.$}>
        Page 76
      </a>
      ,{" "}
      <a href="#page-50" css={Css.blue600.$}>
        Page 50
      </a>
    </span>
  );
}
