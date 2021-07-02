import { useEffect, useRef, useState } from "react";
import { useButton, useFocusRing, useHover } from "react-aria";
import { Icon } from "src/components/Icon";
import { Css } from "src/Css";
import { Callback } from "src/types";

export interface Step {
  label: string;
  state: "incomplete" | "complete" | "error";
  disabled?: boolean;
}

interface StepperBarProps {
  steps: Step[];
  // The 0 based index number of which step is active.
  activeStepIndex: number;
  onChange: (idx: number) => void;
}

export function Stepper({ steps, activeStepIndex, onChange }: StepperBarProps) {
  if (steps.length === 0) {
    throw new Error("Stepper must be initialized with at least one step");
  }

  const [progressBarStep, setProgressBarStep] = useState(0);
  useEffect(() => {
    if (activeStepIndex > progressBarStep) {
      setProgressBarStep(activeStepIndex);
    }
  }, [activeStepIndex]);

  return (
    <nav aria-label="steps" css={Css.df.flexColumn.$}>
      <ol css={Css.listReset.df.$}>
        {steps.map((step, idx) => {
          const isActive = activeStepIndex === idx;
          return (
            <li css={Css.df.flexColumn.wPx(200).$} key={step.label} aria-current={isActive}>
              <StepButton {...step} onClick={() => onChange(idx)} isActive={isActive} />
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
  onClick: Callback;
  isActive: boolean;
}

function StepButton({ label, disabled: isDisabled, state, isActive, onClick: onPress }: StepButtonProps) {
  const ariaProps = { onPress, isDisabled };
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
        ...Css.tl.w100.h100.sm.gray700.if(state === "error").red600.$,
        ...(isActive ? Css.lightBlue700.if(state === "error").red800.$ : {}),
        ...(isHovered && !isPressed ? Css.lightBlue800.if(state === "error").red500.$ : {}),
        ...(isPressed ? Css.lightBlue500.if(state === "error").red900.$ : {}),
        ...(isDisabled ? Css.gray400.cursorNotAllowed.if(state === "error").red200.$ : {}),
        ...(isFocusVisible ? focusRingStyles : {}),
      }}
    >
      <span css={Css.fs0.mrPx(4).$}>
        <StepIcon state={state} isHovered={isHovered} isPressed={isPressed} isActive={isActive} />
      </span>
      {label}
    </button>
  );
}

interface StepIconProps {
  state: StepButtonProps["state"];
  isHovered?: boolean;
  isPressed?: boolean;
  isActive?: boolean;
}

function StepIcon({ state, isHovered = false, isPressed = false, isActive = false }: StepIconProps) {
  if (state === "error") {
    return <Icon icon="errorCircle" />;
  }

  if (state === "complete") {
    return <Icon icon="check" />;
  }

  // Otherwise state is "incomplete", return the custom circle "icon"
  return (
    <div css={Css.wPx(24).hPx(24).df.itemsCenter.justifyCenter.$}>
      <div
        css={
          Css.wPx(10)
            .hPx(10)
            .ba.bw2.br100.add("color", "currentColor")
            .if(isHovered || isPressed || isActive)
            .add("backgroundColor", "currentColor").$
        }
      />
    </div>
  );
}
