import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Button, ModalProps, useModal } from "src/components/index";
import { Modal } from "src/components/Modal/Modal";
import { TestModalContent, TestModalFilterTable } from "src/components/Modal/TestModalContent";
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

interface ModalExampleProps extends Pick<ModalProps, "size" | "forceScrolling"> {
  initNumSentences?: number;
  showLeftAction?: boolean;
}

function ModalExample(props: ModalExampleProps) {
  const { size, showLeftAction, initNumSentences = 1, forceScrolling } = props;
  const { openModal } = useModal();

  const modalProps = {
    size,
    forceScrolling,
    content: <TestModalContent initNumSentences={initNumSentences} showLeftAction={showLeftAction} />,
  };

  // Immediately open the modal for Chromatic snapshots
  const open = () => openModal(modalProps);
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
