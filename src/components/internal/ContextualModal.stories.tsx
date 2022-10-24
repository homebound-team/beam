import { Meta } from "@storybook/react";
import { withDimensions } from "src/utils/sb";
import { ButtonModal } from "../ButtonModal";
import { ContextualModal } from "./ContextualModal";

export default {
  component: ContextualModal,
  title: "Workspace/Components/ContextualModal",
  decorators: [withDimensions()],
} as Meta;

export function BasicContextualModal() {
  return <ButtonModal defaultOpen trigger={{ label: "Menu Trigger" }} content={"Hello"} />;
}

export function BasicContextualModalWithTitle() {
  return <ButtonModal defaultOpen trigger={{ label: "Menu Trigger" }} content={"Hello"} title={"Modal title"} />;
}
