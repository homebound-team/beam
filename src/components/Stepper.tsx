import { useEffect, useRef, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css } from "src/Css";

export interface Step {
  label: string;
  state: "incomplete" | "complete" | "error";
  disabled?: boolean;
  value: string;
}

interface StepperBarProps {
  steps: Step[];
  // The 'value' of the Step that should be displayed
  currentStep: Step["value"];
  onChange: (stepValue: string) => void;
  resetProgress?: boolean;
}

export function Stepper({ steps, currentStep, onChange, resetProgress }: StepperBarProps) {
  if (steps.length === 0) {
    throw new Error("Stepper must be initialized with at least one step");
  }

  const [progressBarStep, setProgressBarStep] = useState(-1);

  useEffect(() => {
    if (resetProgress) {
      return setProgressBarStep(-1);
    }

    // calc step progress based index of last step that is completed
    const stepProgress = steps.reduce((acc, step, idx) => {
      if (step.state === "complete") {
        acc = idx;
      }
      return acc;
    }, -1);

    setProgressBarStep(stepProgress);
  }, [currentStep, progressBarStep, resetProgress, steps]);

  return (
    <nav aria-label="steps" css={Css.df.fdc.$}>
      <ol css={Css.listReset.df.$}>
        {steps.map((step) => {
          const isCurrent = currentStep === step.value;
          return (
            <li css={Css.df.fdc.wPx(200).$} key={step.label} aria-current={isCurrent}>
              <StepButton {...step} onClick={() => onChange(step.value)} isCurrent={isCurrent} />
            </li>
          );
        })}
      </ol>
      <div css={Css.mt1.bgGray300.hPx(4).w(`${steps.length * 200}px`).$}>
        <div
          css={
            Css.bgLightBlue600
              .add("transition", "width 200ms")
              .h100.w(`${((progressBarStep + 1) / steps.length) * 100}%`).$
          }
        />
      </div>
    </nav>
  );
}

interface StepButtonProps extends Step {
  onClick: VoidFunction;
  isCurrent: boolean;
}

function StepButton({ label, disabled, state, isCurrent, onClick }: StepButtonProps) {
  const ariaProps = { onPress: onClick, isDisabled: disabled };
  const ref = useRef(null);
  const { buttonProps, isPressed } = useButton(ariaProps, ref);
  const { isFocusVisible, focusProps } = useFocusRing();
  const { hoverProps, isHovered } = useHover(ariaProps);
  const focusRingStyles = state === "error" ? Css.bshDanger.$ : Css.bshFocus.$;

  return (
    <button
      ref={ref}
      {...buttonProps}
      {...focusProps}
      {...hoverProps}
      css={{
        ...Css.buttonBase.$,
        ...Css.tl.w100.h100.sm.gray700.add("whiteSpace", "initial").if(state === "error").red600.$,
        ...(isCurrent ? Css.lightBlue700.if(state === "error").red800.$ : {}),
        ...(isHovered && !isPressed ? Css.lightBlue800.if(state === "error").red500.$ : {}),
        ...(isPressed ? Css.lightBlue500.if(state === "error").red900.$ : {}),
        ...(disabled ? Css.gray400.cursorNotAllowed.if(state === "error").red200.$ : {}),
        ...(isFocusVisible ? focusRingStyles : {}),
      }}
    >
      <span css={Css.fs0.mrPx(4).$}>
        <StepIcon state={state} isHovered={isHovered} isPressed={isPressed} isCurrent={isCurrent} />
      </span>
      {label}
    </button>
  );
}

interface StepIconProps {
  state: StepButtonProps["state"];
  isHovered?: boolean;
  isPressed?: boolean;
  isCurrent?: boolean;
}

function StepIcon({ state, isHovered = false, isPressed = false, isCurrent = false }: StepIconProps) {
  if (state === "error") {
    return <Icon icon="errorCircle" />;
  }

  if (state === "complete") {
    return <Icon icon="check" />;
  }

  // Otherwise state is "incomplete", return the custom circle "icon"
  return (
    <div css={Css.wPx(24).hPx(24).df.aic.jcc.$}>
      <div
        css={
          Css.wPx(10)
            .hPx(10)
            .ba.bw2.br100.add("color", "currentColor")
            .if(isHovered || isPressed || isCurrent)
            .add("backgroundColor", "currentColor").$
        }
      />
    </div>
  );
}
