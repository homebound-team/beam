import { action } from "@storybook/addon-actions";
import { useState } from "react";
import { Button } from "src/components/Button";
import { ModalBody, ModalFooter } from "src/components/Modal/Modal";
import { useModal } from "src/components/Modal/useModal";
import { Css } from "src/Css";

/** A fake modal content component that we share across the modal and superdrawer stories. */
export function TestModalContent(props: { initNumSentences?: number; showLeftAction?: boolean }) {
  const { closeModal } = useModal();
  const { initNumSentences = 1, showLeftAction } = props;
  const [numSentences, setNumSentences] = useState(initNumSentences);
  const [primaryDisabled, setPrimaryDisabled] = useState(false);
  const [leftActionDisabled, setLeftActionDisabled] = useState(false);
  return (
    <>
      <ModalBody>
        <div css={Css.df.gap1.flexColumn.itemsStart.$}>
          <Button label="Add more text" onClick={() => setNumSentences(numSentences + 2)} />
          <Button label="Toggle Primary Disabled" onClick={() => setPrimaryDisabled(!primaryDisabled)} />
          {showLeftAction && (
            <Button label="Toggle Left Action Disabled" onClick={() => setLeftActionDisabled(!leftActionDisabled)} />
          )}
          <p>{"The body content of the modal. This content can be anything!".repeat(numSentences)}</p>
        </div>
      </ModalBody>
      <ModalFooter xss={showLeftAction ? Css.justifyBetween.$ : undefined}>
        {showLeftAction && (
          <div>
            <Button label="Clear" onClick={action("Clear Action")} variant="tertiary" disabled={leftActionDisabled} />
          </div>
        )}
        <div css={Css.df.childGap1.$}>
          <Button label="Cancel" onClick={closeModal} variant="tertiary" />
          <Button label="Apply" onClick={action("Primary action")} disabled={primaryDisabled} />
        </div>
      </ModalFooter>
    </>
  );
}
