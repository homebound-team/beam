import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { MenuTreeSelectField } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import { FieldFrame, open, optionTreeItems, optionTreeLabel } from "src/inputs/MenuSelectField/storyHelpers";
import { newStory, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";
import { userEvent, waitFor, within } from "storybook/test";

export default {
  title: "Inputs/Select Fields (new)/Menu Behavior/Tree Selection",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2828-4332",
    },
  },
} as Meta;

/** Groups holding a selection open expanded, with a partial check on the parent. Other groups start collapsed. */
export const Menu = newStory(() => <TreeField initial={["spkr-109", "o8", "o9"]} />, { play: open("options") });

/** Every group collapsed when nothing nested is selected. */
export const Collapsed = newStory(() => <TreeField initial={["o8"]} />, { play: open("options") });

/** A fully selected parent, and a deeper group expanded from its chevron. */
export const Expanded = newStory(() => <TreeField initial={["bath"]} />, {
  play: async (context) => {
    open("options")(context);
    const body = within(document.body);
    await waitFor(() => body.getByTestId("options_expand_din"));
    await userEvent.click(body.getByTestId("options_expand_din"));
    await userEvent.click(await body.findByTestId("options_expand_din-l"));
  },
});

/** Searching a code that isn't in the name still finds the group, and keeps its children. */
export const Search = newStory(() => <TreeField />, {
  play: async (context) => {
    open("options")(context);
    const body = within(document.body);
    await userEvent.type(await body.findByTestId("options_search"), "cabdin");
  },
});

/** Disabled rows, including a child that a parent selection skips. */
export const DisabledOptions = newStory(
  () => (
    <TreeField
      initial={["bath"]}
      disabledOptions={["o3", { value: "bath-210", reason: "This bath already has a shower" }]}
    />
  ),
  { play: open("options") },
);

function TreeField(props: { initial?: string[]; disabledOptions?: (string | { value: string; reason: string })[] }) {
  const [values, setValues] = useState(props.initial ?? []);
  return (
    <FieldFrame>
      <MenuTreeSelectField
        label="Options"
        options={optionTreeItems()}
        values={values}
        onSelect={({ all }) => setValues(all.values)}
        getOptionMenuLabel={optionTreeLabel}
        getOptionSearchText={(option) => option.code ?? []}
        disabledOptions={props.disabledOptions}
      />
    </FieldFrame>
  );
}
