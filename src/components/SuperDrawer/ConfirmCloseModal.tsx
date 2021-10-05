import { Button, Css, ModalBody, ModalFooter, ModalHeader } from "src";
import { useBeamContext } from "../BeamContext";

interface ConfirmCloseModalProps {
  onClose: () => void;
}

/** Modal content to appear when a close checks fails */
export function ConfirmCloseModal({ onClose }: ConfirmCloseModalProps) {
  const { modalState } = useBeamContext();

  // TODO: Change to closeModal from useModal when canCloseChecks are reset
  function closeModal() {
    // Not using closeModal from useModal since the canClose checks are not reset
    // after a close and could/will cause other close attempts to fail.
    modalState.current = undefined;
  }

  return (
    <>
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>
        <div css={Css.tc.wPx(400).$}>
          <p css={Css.lgEm.gray900.mb2.$}>Are you sure you want to cancel without saving your changes?</p>
          <p css={Css.base.gray700.$}>Any changes you've made so far will be lost.</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="tertiary" label="Cancel" onClick={closeModal} />
        <Button
          label="Close"
          onClick={() => {
            // The order of these calls doesn't really matter; close this modal and tell the call to do their close
            onClose();
            closeModal();
          }}
        />
      </ModalFooter>
    </>
  );
}
