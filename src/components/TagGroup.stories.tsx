import { Meta } from "@storybook/react-vite";
import { Css } from "src/Css";
import { newStory, withRouter } from "src/utils/sb";
import { action } from "storybook/actions";
import { TagGroup, TagGroupProps } from "./TagGroup";

export default {
  component: TagGroup,
  // Explicit undefined avoids Storybook auto-injecting an `on*` action handler (see preview `actions.argTypesRegex`).
  args: { onEdit: undefined },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=238-2165",
    },
  },
} as Meta<TagGroupProps>;

export const List = newStory(TagGroupStory, {});

export const WithEditButton = newStory(TagGroupStory, {
  args: { onEdit: action("onEdit") },
});

export const WithEditLink = newStory(TagGroupStory, {
  args: { onEdit: "/edit-path" },
  decorators: [withRouter()],
});

function TagGroupStory(args: TagGroupProps) {
  const tags = [
    { text: "Plan 6 - The Elm" },
    { text: "Plan 6X - The Glenview" },
    { text: "Plan 7 - The Willow" },
    { text: "Plan 8 - The Vista" },
    { text: "Plan 9 - The Alder" },
    { text: "Plan 10 - The Ambrose" },
    { text: "Carriage House ADU" },
    { text: "Two Story ADU" },
    { text: "Secondary Label" },
  ];
  return (
    <div css={Css.wPx(667).$}>
      <TagGroup {...args} tags={tags} />
    </div>
  );
}
