import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";
import { useEffect, useState } from "react";
import { Button, Modal, ModalAction, ModalContent, ModalProps, useModalContext } from "src/components/index";
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
export const LeftAction = () => <ModalExample leftAction={{ label: "Clear", onClick: action("Left Action") }} />;

interface ModalExampleProps extends Pick<ModalProps, "size"> {
  initNumSentences?: number;
  leftAction?: ModalAction;
}

function ModalExample({ size, leftAction, initNumSentences = 1 }: ModalExampleProps) {
  const { openModal } = useModalContext();

  const modalProps = {
    size,
    title: "The title of the modal that might wrap",
    content: <ModalContentExample initNumSentences={initNumSentences} leftAction={leftAction} />,
  };

  // Immediately open the modal for Chromatic snapshots
  useEffect(() => openModal(modalProps), []);

  return <Button label="Open" onClick={() => openModal(modalProps)} />;
}

function ModalContentExample({
  initNumSentences = 1,
  leftAction,
}: {
  initNumSentences?: number;
  leftAction?: ModalAction;
}) {
  const [numSentences, setNumSentences] = useState(initNumSentences);
  const [primaryDisabled, setPrimaryDisabled] = useState(false);
  const [leftActionDisabled, setLeftActionDisabled] = useState(false);
  const { setOnClose } = useModalContext();

  return (
    <ModalContent
      leftAction={leftAction ? { ...leftAction, disabled: leftActionDisabled } : undefined}
      primaryAction={{ label: "Apply", disabled: primaryDisabled, onClick: action("Primary action") }}
    >
      <div css={Css.df.gap1.flexColumn.itemsStart.$}>
        <Button label="Add more text" onClick={() => setNumSentences(numSentences + 2)} />
        <Button label="Toggle Primary Disabled" onClick={() => setPrimaryDisabled(!primaryDisabled)} />
        {leftAction && (
          <Button label="Toggle Left Action Disabled" onClick={() => setLeftActionDisabled(!leftActionDisabled)} />
        )}
        <p>{"The body content of the modal. This content can be anything!".repeat(numSentences)}</p>
      </div>
    </ModalContent>
  );
}
