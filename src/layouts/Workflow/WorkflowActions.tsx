import type { PressEvent } from "@react-types/shared";
import type { ReactNode } from "react";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";
import { useBreakpoint } from "src/hooks/useBreakpoint";

export type WorkflowDestructiveAction = {
  /** Runs once the user confirms. The dirty guard is suspended while it runs, so its own navigation is not blocked. */
  onConfirm: (e: PressEvent) => void | Promise<void>;
  /** Button and confirm label. Defaults to "Remove". */
  label?: string;
  /** Confirm modal copy. Defaults to "Are you sure?" / "This can't be undone." */
  confirmTitle?: ReactNode;
  confirmMessage?: ReactNode;
};

export type WorkflowCompleteLabel = "Create" | "Save" | "Publish";

export type WorkflowActionsProps = {
  /** Leaves the workflow without saving. Always shown. */
  onCancel: (e: PressEvent) => void;
  /** Saves partial progress and exits. Used whenever canExitEarly is true. */
  onSaveAndExit?: (e: PressEvent) => void | Promise<void>;
  /** Destructive action on the workflow, rendered as a `danger` button before Continue/Complete. */
  destructiveAction?: WorkflowDestructiveAction;
  /** Called when the completion button is clicked. */
  onComplete: (e: PressEvent) => void | Promise<void>;
  /** `"Create"`, `"Save"`, or `"Publish"`. Defaults to `"Save"`. */
  completeLabel?: WorkflowCompleteLabel;
  /** One-off label. Wins over `completeLabel`. Confirm with product and/or design first. */
  nonStandardCompleteLabel?: string;
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

/** The workflow's fixed CTA set (Back/Cancel/Save & Exit/destructive/Continue-or-Complete); shared by stepper and focused-form chrome. */
export function WorkflowActions(props: WorkflowActionsProps) {
  const {
    onCancel,
    onSaveAndExit,
    destructiveAction,
    onComplete,
    primaryDisabled,
    aiMode = false,
    isFirstStep = true,
    isLastStep = true,
    onBack,
    onContinue,
    completeLabel,
    nonStandardCompleteLabel,
  } = props;
  const { sm: isMobile } = useBreakpoint();
  const primaryVariant = aiMode ? "ai" : "primary";
  const completeButtonLabel = nonStandardCompleteLabel ?? completeLabel ?? "Save";

  return (
    <div css={Css.df.aic.jcsb.ifSm.w100.$}>
      <div css={Css.df.aic.$}>
        {!isFirstStep && isMobile && onBack && <IconButton icon="arrowBack" label="Back" onClick={onBack} />}
      </div>
      <div css={Css.df.aic.gap1.$}>
        <Button label="Cancel" variant="quaternary" onClick={onCancel} />
        {onSaveAndExit && <Button label="Save & Exit" variant="secondary" onClick={onSaveAndExit} />}
        {destructiveAction && (
          <Button label={destructiveAction.label ?? "Remove"} variant="danger" onClick={destructiveAction.onConfirm} />
        )}
        {isLastStep ? (
          <Button
            label={completeButtonLabel}
            variant={primaryVariant}
            onClick={onComplete}
            disabled={primaryDisabled}
          />
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
