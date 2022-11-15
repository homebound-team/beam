import { Meta } from "@storybook/react";
import { withDimensions, withRouter } from "src/utils/sb";
import { ButtonModal } from "./ButtonModal";
import { Chip } from "./Chip";

export default {
  component: ButtonModal,
  title: "Workspace/Components/Button Modal",
  decorators: [withRouter(), withDimensions()],
} as Meta;

export function ButtonModalWithTitle() {
  return (
    <ButtonModal
      storybookDefaultOpen
      title={"Modal Title"}
      content={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus, bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus consequat. Suspendisse lacinia tellus a libero volutpat maximus."
      }
      trigger={{ label: "Button Modal trigger" }}
    />
  );
}

export function ButtonModalWithoutTitle() {
  return (
    <ButtonModal
      storybookDefaultOpen
      content={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus, bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus consequat. Suspendisse lacinia tellus a libero volutpat maximus."
      }
      trigger={{ label: "Button Modal trigger" }}
    />
  );
}

export function ButtonModalInteractive() {
  return (
    <ButtonModal
      title={"Modal Title"}
      content={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus, bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus consequat. Suspendisse lacinia tellus a libero volutpat maximus."
      }
      trigger={{ label: "Button Modal trigger" }}
    />
  );
}

export function ButtonModalWithVariantAndHideEndAdornment() {
  return (
    <ButtonModal
      storybookDefaultOpen
      content={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus, bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus consequat. Suspendisse lacinia tellus a libero volutpat maximus."
      }
      trigger={{ label: "Button Modal trigger" }}
      variant="text"
      hideEndAdornment
    />
  );
}

export function ButtonModalWithActiveBorder() {
  return (
    <ButtonModal
      storybookDefaultOpen
      title={"Modal Title"}
      content={
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus, bibendum sit amet vulputate eget, porta semper ligula."
      }
      trigger={{ label: "Button Modal trigger" }}
      hideEndAdornment
      showActiveBorder
    />
  );
}

export function ButtonModalWithChipAndTooltip() {
  return (
    <ButtonModal
      storybookDefaultOpen
      title={"Modal Title"}
      content={
        <Chip
          text="Chip text content, hover me"
          title="Chip has a custom title, different than the content Chip has a custom title, different than the content"
        />
      }
      trigger={{ label: "Button Modal trigger" }}
    />
  );
}
