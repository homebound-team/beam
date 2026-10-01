import type { Meta } from "@storybook/react-vite";
import { FilterPill } from "src/components/Pills/FilterPill/FilterPill";
import { LabeledExamples, newStory } from "src/utils/sb";
import { action } from "storybook/actions";

export default {
  title: "Components/Pills/Filter Pill",
  component: FilterPill,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2741-2053",
    },
  },
} as Meta;

export const Examples = newStory(
  () => (
    <LabeledExamples
      examples={[
        {
          label: "Default",
          children: <FilterPill text="M1 - English Transitional" onClick={action("onClick")} />,
        },
        {
          label: "Hovered",
          children: (
            <FilterPill text="M1 - English Transitional" onClick={action("onClick")} __storyState={{ hovered: true }} />
          ),
        },
        {
          label: "Disabled",
          children: (
            <FilterPill
              text="M1 - English Transitional"
              onClick={action("onClick")}
              disabled="Required by the template"
            />
          ),
        },
      ]}
    />
  ),
  {},
);
