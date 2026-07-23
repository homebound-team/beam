import type { PressEvent } from "@react-types/shared";
import { Button } from "src/components/Button";
import { IconButton } from "src/components/IconButton";
import { Css } from "src/Css";
import { TestIds } from "src/utils";

export type WorkflowActionsProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  isMobile: boolean;
  onBack: () => void;
  /** Leaves the workflow without saving. Always shown. */
  onCancel: (e: PressEvent) => void;
  /** Whether Save & Exit is available on the current step. Default false. */
  canExitEarly?: boolean;
  /** Saves partial progress and exits. Used whenever canExitEarly is true. */
  onSaveAndExit?: (e: PressEvent) => void | Promise<void>;
  /** Label for the completion button shown on the last step. */
  completeLabel: "Create" | "Save";
  /** Called when the completion button is clicked. Only shown on the last step. */
  onComplete: (e: PressEvent) => void | Promise<void>;
  onContinue: () => void;
  tid: TestIds;
};

/** The workflow's fixed CTA set (Back/Cancel/Save & Exit/Continue-or-Complete); shared by `WorkflowLayout`'s header and mobile footer. */
export function WorkflowActions(props: WorkflowActionsProps) {
  const {
    isFirstStep,
    isLastStep,
    isMobile,
    onBack,
    onCancel,
    canExitEarly = false,
    onSaveAndExit,
    completeLabel,
    onComplete,
    onContinue,
    tid,
  } = props;

  return (
    <div css={Css.df.aic.jcsb.ifSm.w100.$}>
      <div css={Css.df.aic.$}>
        {!isFirstStep &&
          (isMobile ? (
            <IconButton icon="arrowBack" label="Back" onClick={onBack} {...tid.back} />
          ) : (
            <Button label="Back" icon="chevronLeft" variant="tertiary" onClick={onBack} {...tid.back} />
          ))}
      </div>
      <div css={Css.df.aic.gap1.$}>
        <Button label="Cancel" variant="quaternary" onClick={onCancel} {...tid.cancel} />
        {canExitEarly && onSaveAndExit && (
          <Button label="Save & Exit" variant="secondary" onClick={onSaveAndExit} {...tid.saveAndExit} />
        )}
        {isLastStep ? (
          <Button label={completeLabel} variant="primary" onClick={onComplete} {...tid.complete} />
        ) : (
          <Button label="Continue" variant="primary" onClick={onContinue} {...tid.continue} />
        )}
      </div>
    </div>
  );
}
