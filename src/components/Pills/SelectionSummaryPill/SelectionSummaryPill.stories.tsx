import type { Meta } from "@storybook/react-vite";
import { SelectionSummaryPill } from "src/components/Pills/SelectionSummaryPill/SelectionSummaryPill";
import { LabeledExamples, newStory } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Pills/Selection Summary Pill",
  component: SelectionSummaryPill,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2741-2094",
    },
  },
} as Meta;

export const Examples = newStory(
  () => (
    <LabeledExamples
      examples={[
        {
          label: "Default",
          children: <SelectionSummaryPill text="3 Rows Selected" onClick={action("onClick")} />,
        },
        {
          label: "Hovered",
          children: (
            <SelectionSummaryPill text="3 Rows Selected" onClick={action("onClick")} __storyState={{ hovered: true }} />
          ),
        },
        {
          label: "Disabled",
          children: (
            <SelectionSummaryPill text="3 Rows Selected" onClick={action("onClick")} disabled="Selections are locked" />
          ),
        },
        {
          label: "Compact",
          children: <SelectionSummaryPill text="3 Rows Selected" onClick={action("onClick")} compactCount={3} />,
        },
        {
          label: "Compact hovered",
          children: (
            <SelectionSummaryPill
              text="3 Rows Selected"
              onClick={action("onClick")}
              compactCount={3}
              __storyState={{ hovered: true }}
            />
          ),
        },
      ]}
    />
  ),
  {},
);
