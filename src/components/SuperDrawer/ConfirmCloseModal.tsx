import { Button, Css, ModalBody, ModalFooter, ModalHeader } from "src";
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
      <ModalHeader>Confirm</ModalHeader>
      <ModalBody>
        <div css={Css.tc.wPx(400).$}>
          <p css={Css.lgEm.gray900.mb2.$}>Are you sure you want to cancel?</p>
          <p css={Css.base.gray700.$}>Any data you've entered so far will be lost.</p>
        </div>
      </ModalBody>
      <ModalFooter xss={Css.jcc.$}>
        <div css={Css.df.fdc.childGap1.aic.$}>
          <Button label={continueText} onClick={closeModal} />
          <Button
            variant="tertiary"
            label={discardText}
            onClick={() => {
              // The order of these calls doesn't really matter; close this modal and tell the call to do their close
              onClose();
              closeModal();
            }}
          />
        </div>
      </ModalFooter>
    </>
  );
}
