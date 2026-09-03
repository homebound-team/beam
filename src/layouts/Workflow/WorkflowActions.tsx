import type { PressEvent } from "@react-types/shared";
import { ReactNode } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";

export type WorkflowActionsProps = {
  /** Leaves the workflow without saving. Always shown. */
  onCancel: (e: PressEvent) => void;
  /** Saves partial progress and exits. Used whenever canExitEarly is true. */
  onSaveAndExit?: (e: PressEvent) => void | Promise<void>;
  /** Label for the completion button shown on the last step (or when there is no next step). */
  completeLabel: "Create" | "Save";
  /** Called when the completion button is clicked. */
  onComplete: (e: PressEvent) => void | Promise<void>;
  /** Continue/Complete is disabled. A ReactNode is shown in Beam's tooltip. */
  primaryDisabled?: boolean | ReactNode;
  /** When true, Continue/Complete use the `ai` button variant instead of `primary`. */
  aiMode?: boolean;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  onBack?: () => void;
  /** Runs before continuing to the next step. Return `false` to stay put, like when the save failed. */
  onContinue?: () => boolean | void | Promise<boolean | void>;
};

/** The workflow's fixed CTA set (Back/Cancel/Save & Exit/Continue-or-Complete); shared by stepper and focused-form chrome. */
export function WorkflowActions(props: WorkflowActionsProps) {
  const {
    onCancel,
    onSaveAndExit,
    completeLabel,
    onComplete,
    primaryDisabled,
    aiMode = false,
    isFirstStep = true,
    isLastStep = true,
    onBack,
    onContinue,
  } = props;
  const { sm: isMobile } = useBreakpoint();
  const primaryVariant = aiMode ? "ai" : "primary";

  return (
    <div css={Css.df.aic.jcsb.ifSm.w100.$}>
      <div css={Css.df.aic.$}>
        {!isFirstStep && isMobile && onBack && <IconButton icon="arrowBack" label="Back" onClick={onBack} />}
      </div>
      <div css={Css.df.aic.gap1.$}>
        <Button label="Cancel" variant="quaternary" onClick={onCancel} />
        {onSaveAndExit && <Button label="Save & Exit" variant="secondary" onClick={onSaveAndExit} />}
        {isLastStep ? (
          <Button label={completeLabel} variant={primaryVariant} onClick={onComplete} disabled={primaryDisabled} />
        ) : (
          <Button
            label="Continue"
            variant={primaryVariant}
            onClick={async () => {
              await onContinue?.();
            }}
            disabled={primaryDisabled}
          />
        )}
      </div>
    </div>
  );
}
