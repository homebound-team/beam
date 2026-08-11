import { StepperTab, StepperTabProps } from "src/components/StepperTabs/StepperTab";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";
import { WorkflowActionsProps } from "src/layouts/WorkflowLayout/WorkflowActions";
import { useTestIds } from "src/utils";

export type StepperTabsStep = Pick<StepperTabProps, "label" | "value" | "disabled"> &
  Partial<Pick<WorkflowActionsProps, "onContinue">>;

export type StepperTabsProps = {
  steps: StepperTabsStep[];
  currentStep: StepperTabsStep["value"];
  onChange: (stepValue: string) => void;
  /** Forces the condensed look regardless of viewport width. OR'd with the mobile-breakpoint collapse. */
  collapsed?: boolean;
};

export function StepperTabs(props: StepperTabsProps) {
  const { steps, currentStep, onChange, collapsed: forceCollapsed } = props;
  const tid = useTestIds(props, "stepperTabs");
  const { sm: isMobile } = useBreakpoint();
  const collapsed = isMobile || !!forceCollapsed;
  const capWidth = steps.length <= 3;
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.value === currentStep),
  );

  return (
    <nav aria-label="steps" css={Css.w100.$} {...tid}>
      <ol css={Css.listReset.df.gapPx(gapPx).w100.bb.bcGray400.$}>
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <li
              css={Css.df.fg1.fb(0).if(collapsed).mw0.if(capWidth).maxwPx(maxStepWidthPx).$}
              key={step.value}
              aria-current={isCurrent}
              {...tid.step}
            >
              <StepperTab
                label={step.label}
                value={step.value}
                active={isCurrent}
                completed={isCompleted}
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

const maxStepWidthPx = 280;
const gapPx = 6;
