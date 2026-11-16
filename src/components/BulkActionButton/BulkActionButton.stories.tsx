import type { Meta } from "@storybook/react-vite";
import { BulkActionButton } from "src/components/BulkActionButton/BulkActionButton";
import { LabeledExamples, newStory } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Bulk Action Button",
  component: BulkActionButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=4286-6",
    },
  },
} as Meta;

const props = { count: 3, onClick: action("onClick"), onClear: action("onClear") };

export const Examples = newStory(
  () => (
    <LabeledExamples
      examples={[
        { label: "Default", children: <BulkActionButton {...props} /> },
        {
          label: "Hover Action",
          children: <BulkActionButton {...props} __storyState={{ hovered: "action" }} />,
        },
        { label: "Hover Clear", children: <BulkActionButton {...props} __storyState={{ hovered: "clear" }} /> },
        {
          label: "Focus Action",
          children: <BulkActionButton {...props} __storyState={{ focused: "action" }} />,
        },
        { label: "Focus Clear", children: <BulkActionButton {...props} __storyState={{ focused: "clear" }} /> },
        { label: "Compact", children: <BulkActionButton {...props} compact /> },
        {
          label: "Compact Hover Clear",
          children: <BulkActionButton {...props} compact __storyState={{ hovered: "clear" }} />,
        },
      ]}
    />
  ),
  {},
);
