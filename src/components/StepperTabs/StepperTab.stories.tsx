import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { noop } from "src/utils";
import { StepperTab, StepperTabProps } from "./StepperTab";

export default {
  component: StepperTab,
  argTypes: { __storyState: { control: false } },
} as Meta;

export function States() {
  const states: { visited: boolean; active: boolean; completed: boolean; label: string }[] = [
    { visited: true, active: false, completed: true, label: "Visited, Inactive, and Completed" },
    { visited: true, active: true, completed: false, label: "Visited, Active, and Not Completed" },
    { visited: true, active: true, completed: true, label: "Visited, Active, and Completed" },
    { visited: false, active: false, completed: false, label: "Not Visited" },
  ];

  const rows: {
    name: string;
    storyState?: StepperTabProps["__storyState"];
    disabled?: boolean;
    collapsed?: boolean;
  }[] = [
    { name: "Default" },
    { name: "Hover", storyState: { hovered: true } },
    { name: "Focus", storyState: { focusVisible: true } },
    { name: "Disabled", disabled: true },
    { name: "Collapsed", collapsed: true },
  ];

  const labelColumnWidthPx = 160;

  return (
    <div css={Css.df.fdc.gap2.bgWhite.$}>
      <div css={Css.df.gap2.$}>
        <div css={Css.wPx(labelColumnWidthPx).fs0.$} />
        {states.map(({ label }) => (
          <div key={label} css={Css.fg1.fb(0).smSb.$}>
            {label}
          </div>
        ))}
      </div>

      {rows.map(({ name, storyState, disabled, collapsed }) => (
        <div key={name} css={Css.df.aife.gap2.$}>
          <div css={Css.wPx(labelColumnWidthPx).fs0.smSb.$}>{name}</div>
          {states.map(({ visited, active, completed, label }) => {
            const key = `${name}-${label}`;
            return (
              <div key={key} css={Css.df.fg1.fb(0).$}>
                <StepperTab
                  label="Step Label"
                  value={key}
                  active={active}
                  completed={completed}
                  visited={visited}
                  onClick={noop}
                  disabled={disabled}
                  collapsed={collapsed}
                  __storyState={storyState}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
