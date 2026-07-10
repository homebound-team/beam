import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { StepperTab, StepperTabState } from "./StepperTab";

export default {
  component: StepperTab,
} as Meta;

const states: { state: StepperTabState; label: string }[] = [
  { state: "completed", label: "Step Label" },
  { state: "active", label: "Step Label" },
  { state: "activeCompleted", label: "Step Label" },
  { state: "notVisited", label: "Details & Slots" },
];

export function States() {
  return (
    <div css={Css.df.fdc.gap4.bgWhite.$}>
      {states.map(({ state, label }) => (
        <div key={state}>
          <h2>{state}</h2>
          <div css={Css.df.gap1.maxwPx(600).$}>
            <div css={Css.df.fdc.gap1.fg1.$}>
              <div>Default</div>
              <StepperTab label={label} value={state} state={state} onClick={noop} />
            </div>
            <div css={Css.df.fdc.gap1.fg1.$}>
              <div>Disabled</div>
              <StepperTab label={label} value={`${state}-disabled`} state={state} onClick={noop} disabled />
            </div>
            <div css={Css.df.fdc.gap1.fg1.$}>
              <div>Collapsed</div>
              <StepperTab label={label} value={`${state}-collapsed`} state={state} onClick={noop} collapsed />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
