import { useContext } from "react";
import { Button, Css } from "src";
import { BeamContext } from "../BeamContext";
interface ConfirmCloseModalProps {
  onClose: () => void;
}

/** Modal content to appear when a close checks fails */
export function ConfirmCloseModal({ onClose }: ConfirmCloseModalProps) {
  const { modalState } = useContext(BeamContext);

  // TODO: Change to closeModal from useModal when canCloseChecks are reset
  function closeModal() {
    // Not using closeModal from useModal since the canClose checks are not reset
    // after a close and could/will cause other close attempts to fail.
    modalState.current = undefined;
  }

  return (
    <div css={Css.wPx(400).df.flexColumn.justifyCenter.itemsCenter.tc.$}>
      <p css={Css.lgEm.gray900.mb2.$}>Are you sure you want to cancel without saving your changes?</p>
      <p css={Css.base.gray700.$}>Any changes you've made so far will be lost.</p>
      <div css={Css.mt4.gap1.$}>
        <Button variant="tertiary" label="Cancel" onClick={closeModal} />
        <Button label="Close" onClick={onClose} />
      </div>
    </div>
  );
}
