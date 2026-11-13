import type { Meta } from "@storybook/react-vite";
import { Pill } from "src/components/Pills/Pill/Pill";
import { Css } from "src/Css";
import { LabeledExamples, newStory } from "src/utils/sb";

export default {
  title: "Components/Pills/Pill",
  component: Pill,
} as Meta;

export const Examples = newStory(
  () => (
    <LabeledExamples
      examples={[
        { label: "Default", children: <Pill text="M1 - English Transitional" /> },
        {
          label: "Long label",
          children: (
            <div css={Css.wPx(200).$}>
              <Pill text="Add Speakers to 5.1 Surround - Great Room 109" />
            </div>
          ),
        },
      ]}
    />
  ),
  {},
);
