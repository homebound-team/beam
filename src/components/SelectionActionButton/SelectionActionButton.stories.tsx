import type { Meta } from "@storybook/react-vite";
import { SelectionActionButton } from "src/components/SelectionActionButton/SelectionActionButton";
import { LabeledExamples, newStory } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Selection Action Button",
  component: SelectionActionButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=4286-6",
    },
  },
} as Meta;

const props = { label: "Edit", count: 3, onClick: action("onClick"), onClear: action("onClear") };

export const Examples = newStory(
  () => (
    <LabeledExamples
      examples={[
        { label: "Default", children: <SelectionActionButton {...props} /> },
        {
          label: "Hover Action",
          children: <SelectionActionButton {...props} __storyState={{ hovered: "action" }} />,
        },
        { label: "Hover Clear", children: <SelectionActionButton {...props} __storyState={{ hovered: "clear" }} /> },
        {
          label: "Focus Action",
          children: <SelectionActionButton {...props} __storyState={{ focused: "action" }} />,
        },
        { label: "Focus Clear", children: <SelectionActionButton {...props} __storyState={{ focused: "clear" }} /> },
        { label: "Compact", children: <SelectionActionButton {...props} compact /> },
        {
          label: "Compact Hover Clear",
          children: <SelectionActionButton {...props} compact __storyState={{ hovered: "clear" }} />,
        },
      ]}
    />
  ),
  {},
);
