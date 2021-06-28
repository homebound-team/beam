import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalProps, useModalContext } from "src/components/index";
import { Css } from "src/Css";
import { withModalDecorator } from "src/utils/sb";
import { withPerformance } from "storybook-addon-performance";

export default {
  component: Modal,
  title: "Components/Modal",
  decorators: [withPerformance, withModalDecorator],
} as Meta;

export const Small = () => <ModalExample size="sm" />;
export const Medium = () => <ModalExample />;
export const Large = () => <ModalExample size="lg" />;
export const WithScroll = () => <ModalExample initNumSentences={50} />;
export const LeftAction = () => <ModalExample showLeftAction />;

interface ModalExampleProps extends Pick<ModalProps, "size"> {
  initNumSentences?: number;
  showLeftAction?: boolean;
}

function ModalExample({ size, showLeftAction, initNumSentences = 1 }: ModalExampleProps) {
  const { openModal } = useModalContext();

  const modalProps = {
    size,
    title: "The title of the modal that might wrap",
    content: <ComponentForModalExample initNumSentences={initNumSentences} showLeftAction={showLeftAction} />,
  };

  // Immediately open the modal for Chromatic snapshots
  useEffect(() => openModal(modalProps), []);

  return <Button label="Open" onClick={() => openModal(modalProps)} />;
}

function ComponentForModalExample({
  initNumSentences = 1,
  showLeftAction,
}: {
  initNumSentences?: number;
  showLeftAction?: boolean;
}) {
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
      <ModalFooter xss={showLeftAction ? Css.justifyBetween.$ : {}}>
        {showLeftAction && (
          <div>
            <Button label="Clear" onClick={action("Clear Action")} variant="tertiary" disabled={leftActionDisabled} />
          </div>
        )}
        <div css={Css.df.childGap1.$}>
          <Button label="Cancel" onClick={action("Cancel action")} variant="tertiary" />
          <Button label="Apply" onClick={action("Primary action")} disabled={primaryDisabled} />
        </div>
      </ModalFooter>
    </>
  );
}
