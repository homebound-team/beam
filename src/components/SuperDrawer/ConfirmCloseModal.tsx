import { Button, ModalBody, ModalFooter, ModalHeader } from "src/components";
import { useBeamContext } from "../BeamContext";

interface ConfirmCloseModalProps {
  onClose: () => void;
  discardText?: string;
  continueText?: string;
}

/** Modal content to appear when a close checks fails */
export function ConfirmCloseModal(props: ConfirmCloseModalProps) {
  const { onClose, discardText = "Discard Changes", continueText = "Continue Editing" } = props;
  const { modalState } = useBeamContext();

  // TODO: Change to closeModal from useModal when canCloseChecks are reset
  function closeModal() {
    // Not using closeModal from useModal since the canClose checks are not reset
    // after a close and could/will cause other close attempts to fail.
    modalState.current = undefined;
  }

  return (
    <>
      <ModalHeader>Are you sure you want to cancel?</ModalHeader>
      <ModalBody>
        <p>Any changes you've made so far will be lost.</p>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="tertiary"
          label={discardText}
          onClick={() => {
            // The order of these calls doesn't really matter; close this modal and tell the call to do their close
            onClose();
            closeModal();
          }}
        />
        <Button label={continueText} onClick={closeModal} />
      </ModalFooter>
    </>
  );
}
