import { Meta } from "@storybook/react";
import { withDimensions } from "src/utils/sb";
import { ContextualModal } from "./ContextualModal";

export default {
  component: ContextualModal,
  title: "Workspace/Components/ContextualModal",
  decorators: [withDimensions()],
} as Meta;

export function BasicContextualModal() {
  return <ContextualModal content="Hello" />;
}

export function BasicContextualModalWithTitle() {
  return <ContextualModal content={"Hello"} title={"Modal title"} />;
}
