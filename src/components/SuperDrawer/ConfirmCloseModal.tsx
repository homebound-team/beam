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
  const { internalModalApi } = useBeamContext();

  // Force-close without canClose checks — same as the old modalState.current = undefined path.
  function closeModal() {
    internalModalApi.current?.forceClose();
  }

  return (
    <>
      <ModalHeader>Are you sure you want to cancel?</ModalHeader>
      <ModalBody>
        <p>Any changes you've made so far will be lost.</p>
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
        <Button label={continueText} onClick={closeModal} />
      </ModalFooter>
    </>
  );
}
