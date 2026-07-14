import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { StepperTab } from "./StepperTab";

export default {
  component: StepperTab,
} as Meta;

const combos: { active: boolean; completed: boolean; label: string }[] = [
  { active: false, completed: true, label: "Step Label" },
  { active: true, completed: false, label: "Step Label" },
  { active: true, completed: true, label: "Step Label" },
  { active: false, completed: false, label: "Details & Slots" },
];

export function States() {
  return (
    <div css={Css.df.fdc.gap4.bgWhite.$}>
      {combos.map(({ active, completed, label }) => {
        const key = `active-${active}-completed-${completed}`;
        return (
          <div key={key}>
            <h2>
              active={String(active)}, completed={String(completed)}
            </h2>
            <div css={Css.df.gap1.maxwPx(600).$}>
              <div css={Css.df.fdc.gap1.fg1.$}>
                <div>Default</div>
                <StepperTab label={label} value={key} active={active} completed={completed} onClick={noop} />
              </div>
              <div css={Css.df.fdc.gap1.fg1.$}>
                <div>Disabled</div>
                <StepperTab
                  label={label}
                  value={`${key}-disabled`}
                  active={active}
                  completed={completed}
                  onClick={noop}
                  disabled
                />
              </div>
              <div css={Css.df.fdc.gap1.fg1.$}>
                <div>Collapsed</div>
                <StepperTab
                  label={label}
                  value={`${key}-collapsed`}
                  active={active}
                  completed={completed}
                  onClick={noop}
                  collapsed
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
