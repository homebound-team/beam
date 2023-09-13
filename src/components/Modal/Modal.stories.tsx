import { Meta } from "@storybook/react";
import { useEffect } from "react";
import { Button, ModalBody, ModalFooter, ModalHeader, ModalProps, OpenModal, useModal } from "src/components/index";
import { Modal } from "src/components/Modal/Modal";
import {
  TestModalContent,
  TestModalContentProps,
  TestModalFilterTable,
  VirtualizedTable,
} from "src/components/Modal/TestModalContent";
import { FormStateApp } from "src/forms/FormStateApp";
import { noop } from "src/utils/index";
import { withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  component: Modal,
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=36070%3A105724",
    },
  },
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
export const WithDatePicker = () => <ModalExample withDateField />;
export const WithFieldInHeader = () => <ModalExample withTextArea />;
export const WithDrawHeaderBorder = () => <ModalExample drawHeaderBorder={true} />;
export const VirtualizedTableInBody = () => {
  const { openModal } = useModal();
  const open = () =>
    openModal({
      content: <VirtualizedTable />,
      size: { width: "xl", height: 800 },
    });
  // Immediately open the modal for Chromatic snapshots
  useEffect(open, [openModal]);
  return <Button label="Open" onClick={open} />;
};

export const ButtonsInFooter = () => {
  const { openModal, setSize } = useModal();
  const open = () =>
    openModal({
      content: (
        <>
          <ModalHeader>Add</ModalHeader>
          <ModalFooter>
            <Button label="Change Size" onClick={() => setSize("sm")} />
            <Button variant="tertiary" label="Cancel" onClick={noop} />
            <Button variant="primary" label="Add" onClick={noop} />
          </ModalFooter>
        </>
      ),
    });
  // Immediately open the modal for Chromatic snapshots
  // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(open, [openModal]);
  return <Button label="Open" onClick={open} />;
};

export const OpenModalTest = () => {
  return (
    <OpenModal>
      <>
        <ModalHeader>Add</ModalHeader>
        <ModalBody>Body</ModalBody>
        <ModalFooter>Footer</ModalFooter>
      </>
    </OpenModal>
  );
};

export const OpenModalKeepOpen = () => {
  return (
    <OpenModal keepOpen={true}>
      <>
        <ModalHeader>Add</ModalHeader>
        <ModalBody>Body</ModalBody>
        <ModalFooter> Footer </ModalFooter>
      </>
    </OpenModal>
  );
};

export function ModalForm() {
  return (
    <OpenModal size="xl">
      <>
        <ModalHeader>Form Example</ModalHeader>
        <ModalBody>
          <FormStateApp />
        </ModalBody>
        <ModalFooter>
          <Button label="Submit" onClick={noop} />
        </ModalFooter>
      </>
    </OpenModal>
  );
}

interface ModalExampleProps
  extends Pick<ModalProps, "size" | "forceScrolling" | "drawHeaderBorder">,
    TestModalContentProps {}

function ModalExample(props: ModalExampleProps) {
  const {
    size,
    showLeftAction,
    initNumSentences = 1,
    forceScrolling,
    withTag,
    withDateField,
    drawHeaderBorder = false,
  } = props;
  const { openModal } = useModal();
  const open = () =>
    openModal({
      size,
      forceScrolling,
      content: <TestModalContent {...props} />,
      drawHeaderBorder,
    });
  // Immediately open the modal for Chromatic snapshots
  // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // TODO: validate this eslint-disable. It was automatically ignored as part of https://app.shortcut.com/homebound-team/story/40033/enable-react-hooks-exhaustive-deps-for-react-projects
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(open, [openModal]);

  return <Button label="Open" onClick={open} />;
}
