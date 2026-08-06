import type { PressEvent } from "@react-types/shared";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";

export type WorkflowActionsProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  isMobile: boolean;
  onBack: () => void;
  /** Leaves the workflow without saving. Always shown. */
  onCancel: (e: PressEvent) => void;
  /** Saves partial progress and exits. Used whenever canExitEarly is true. */
  onSaveAndExit?: (e: PressEvent) => void | Promise<void>;
  /** Label for the completion button shown on the last step. */
  completeLabel: "Create" | "Save";
  /** Called when the completion button is clicked. Only shown on the last step. */
  onComplete: (e: PressEvent) => void | Promise<void>;
  /** Runs before continuing to the next step. Return `false` to stay put, like when the save failed. */
  onContinue: () => boolean | void | Promise<boolean | void>;
  /** Disables whichever of Continue/Complete is currently shown, e.g. while the active step is invalid. */
  primaryDisabled?: boolean;
};

/** The workflow's fixed CTA set (Back/Cancel/Save & Exit/Continue-or-Complete); shared by `WorkflowLayout`'s header and mobile footer. */
export function WorkflowActions(props: WorkflowActionsProps) {
  const {
    isFirstStep,
    isLastStep,
    isMobile,
    onBack,
    onCancel,
    onSaveAndExit,
    completeLabel,
    onComplete,
    onContinue,
    primaryDisabled,
  } = props;

  return (
    <div css={Css.df.aic.jcsb.ifSm.w100.$}>
      <div css={Css.df.aic.$}>
        {!isFirstStep && isMobile && <IconButton icon="arrowBack" label="Back" onClick={onBack} />}
      </div>
      <div css={Css.df.aic.gap1.$}>
        <Button label="Cancel" variant="quaternary" onClick={onCancel} />
        {onSaveAndExit && <Button label="Save & Exit" variant="secondary" onClick={onSaveAndExit} />}
        {isLastStep ? (
          <Button label={completeLabel} variant="primary" onClick={onComplete} disabled={primaryDisabled} />
        ) : (
          <Button label="Continue" variant="primary" onClick={onContinue} disabled={primaryDisabled} />
        )}
      </div>
    </div>
  );
}
