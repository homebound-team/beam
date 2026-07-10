import { StepperTab, StepperTabState } from "src/components/StepperTabs/StepperTab";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { useTestIds } from "src/utils";

export type StepperTabsStep = {
  label: string;
  value: string;
  /** Whether this step's required fields are filled out. Combined with `currentStep` to derive each tab's visual state. */
  completed: boolean;
  disabled?: boolean;
};

export type StepperTabsProps = {
  steps: StepperTabsStep[];
  currentStep: StepperTabsStep["value"];
  onChange: (stepValue: string) => void;
};

export function StepperTabs(props: StepperTabsProps) {
  const { steps, currentStep, onChange } = props;
  const tid = useTestIds(props, "stepperTabs");
  const { sm: collapsed } = useBreakpoint();
  const capWidth = steps.length <= 3;

  return (
    <nav aria-label="steps" css={Css.w100.$} {...tid}>
      <ol css={Css.listReset.df.gapPx(gapPx).w100.bb.bcGray400.$}>
        {steps.map((step) => {
          const isCurrent = step.value === currentStep;
          return (
            <li
              css={Css.df.fg1.fb(0).if(capWidth).maxwPx(maxStepWidthPx).$}
              key={step.value}
              aria-current={isCurrent}
              {...tid.step}
            >
              <StepperTab
                label={step.label}
                value={step.value}
                state={getTabState(step, isCurrent)}
                disabled={step.disabled}
                collapsed={collapsed}
                onClick={onChange}
                {...tid.tab}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function getTabState(step: StepperTabsStep, isCurrent: boolean): StepperTabState {
  if (isCurrent) return step.completed ? "activeCompleted" : "active";
  return step.completed ? "completed" : "notVisited";
}

const maxStepWidthPx = 280;
const gapPx = 6;
