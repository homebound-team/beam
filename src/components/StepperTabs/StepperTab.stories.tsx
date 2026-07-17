import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { StepperTab } from "./StepperTab";

export default {
  component: StepperTab,
} as Meta;

export function States() {
  const combos: { active: boolean; completed: boolean; label: string }[] = [
    { active: false, completed: true, label: "Step Label" },
    { active: true, completed: false, label: "Step Label" },
    { active: true, completed: true, label: "Step Label" },
    { active: false, completed: false, label: "Details & Slots" },
  ];

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
            </div>
          </div>
        );
      })}
      <div>
        <h2>Collapsed (No Active State Difference)</h2>
        <div css={Css.df.gap1.maxwPx(600).$}>
          <div css={Css.df.fdc.gap1.fg1.$}>
            <div>Completed</div>
            <div css={Css.h0.df.aife.$}>
              <StepperTab
                label="Step Label"
                value="collapsed-completed"
                active={false}
                completed={true}
                onClick={noop}
                collapsed
              />
            </div>
          </div>
          <div css={Css.df.fdc.gap1.fg1.$}>
            <div>Not Completed</div>
            <div css={Css.h0.df.aife.$}>
              <StepperTab
                label="Step Label"
                value="collapsed-not-completed"
                active={false}
                completed={false}
                onClick={noop}
                collapsed
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
