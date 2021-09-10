import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Button, ModalFooter, ModalHeader, ModalProps, useModal } from "src/components/index";
import { Modal } from "src/components/Modal/Modal";
import { TestModalContent, TestModalFilterTable } from "src/components/Modal/TestModalContent";
import { noop } from "src/utils/index";
import { withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  component: Modal,
  title: "Components/Modal",
  decorators: [withBeamDecorator, withDimensions()],
} as Meta;

export const Small = () => <ModalExample size="sm" />;
export const Medium = () => <ModalExample />;
export const Large = () => <ModalExample size="lg" />;
export const LargeFixedHeight = () => <ModalExample size={{ width: "lg", height: 300 }} forceScrolling={true} />;
export const WithScroll = () => <ModalExample initNumSentences={50} />;
export const LeftAction = () => <ModalExample showLeftAction />;
export const FilterableDynamicHeight = () => <ModalFilterTableExample />;
export const FilterableStaticHeight = () => (
  <ModalFilterTableExample size={{ width: "md", height: 600 }} forceScrolling={true} />
);
export const HeaderWithComponents = () => <ModalExample size="lg" withTag />;
export const ButtonsInFooter = () => {
  const { openModal } = useModal();
  const open = () =>
    openModal({
      content: (
        <>
          <ModalHeader>Add</ModalHeader>
          <ModalFooter>
            <Button variant="tertiary" label="Cancel" onClick={noop} />
            <Button variant="primary" label="Add" onClick={noop} />
          </ModalFooter>
        </>
      ),
    });
  // Immediately open the modal for Chromatic snapshots
  useEffect(open, [openModal]);
  return <Button label="Open" onClick={open} />;
};

interface ModalExampleProps extends Pick<ModalProps, "size" | "forceScrolling"> {
  initNumSentences?: number;
  showLeftAction?: boolean;
  withTag?: boolean;
}

function ModalExample(props: ModalExampleProps) {
  const { size, showLeftAction, initNumSentences = 1, forceScrolling, withTag } = props;
  const { openModal } = useModal();
  const open = () =>
    openModal({
      size,
      forceScrolling,
      content: (
        <TestModalContent initNumSentences={initNumSentences} showLeftAction={showLeftAction} withTag={withTag} />
      ),
    });
  // Immediately open the modal for Chromatic snapshots
  useEffect(open, [openModal]);
  return <Button label="Open" onClick={open} />;
}

function ModalFilterTableExample({ size, forceScrolling }: Pick<ModalProps, "size" | "forceScrolling">) {
  const { openModal } = useModal();
  const modalProps = {
    size,
    forceScrolling,
    content: <TestModalFilterTable />,
  };

  // Immediately open the modal for Chromatic snapshots
  const open = () => openModal(modalProps);
  useEffect(open, [openModal]);

  return <Button label="Open" onClick={open} />;
}
