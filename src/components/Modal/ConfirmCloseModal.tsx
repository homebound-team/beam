import { ReactNode } from "react";
import { useBeamContext } from "src/components/BeamContext";
import { Button } from "src/components/Button";
import { ModalBody, ModalFooter, ModalHeader } from "src/components/Modal/Modal";

type ConfirmCloseModalProps = {
  onClose: () => void;
  /** Called when the user chooses to stay (in addition to closing the modal). */
  onContinue?: () => void;
  title?: ReactNode;
  message?: ReactNode;
  discardText?: string;
  continueText?: string;
};

/** Modal content for discarding unsaved changes (SuperDrawer close, WorkflowLayout leave, etc.). */
export function ConfirmCloseModal(props: ConfirmCloseModalProps) {
  const {
    onClose,
    onContinue,
    title = "Are you sure you want to leave?",
    message = "Any changes you've made so far will be lost.",
    discardText = "Discard Changes",
    continueText = "Continue Editing",
  } = props;
  const { modalState } = useBeamContext();

  // TODO: Change to closeModal from useModal when canCloseChecks are reset
  function closeModal() {
    // Not using closeModal from useModal since the canClose checks are not reset
    // after a close and could/will cause other close attempts to fail.
    modalState.current = undefined;
  }

  return (
    <>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p>{message}</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="quaternary"
          label={discardText}
          onClick={() => {
            // The order of these calls doesn't really matter; close this modal and tell the call to do their close
            onClose();
            closeModal();
          }}
        />
        <Button
          label={continueText}
          onClick={() => {
            onContinue?.();
            closeModal();
          }}
        />
      </ModalFooter>
    </>
  );
}
