import { Meta } from "@storybook/react";
import { withDimensions } from "src/utils/sb";
import { ContextualModal } from "./ContextualModal";

export default {
  component: ContextualModal,
  title: "Workspace/Components/ContextualModal",
  decorators: [withDimensions()],
  parameters: {
    // To better view the hover state
    backgrounds: { default: "white" },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=32720%3A99727",
    }
  },
} as Meta;

export function BasicContextualModal() {
  return <ContextualModal content="Hello" />;
}

export function BasicContextualModalWithTitle() {
  return <ContextualModal content="Hello" title="Modal title" />;
}
