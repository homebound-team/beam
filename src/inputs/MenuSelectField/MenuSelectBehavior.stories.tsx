import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { FieldFrame, groupByOptions, open } from "src/inputs/MenuSelectField/storyHelpers";
import { newStory, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Behavior/Single Selection",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop", "mobile1") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2828-5144",
    },
  },
} as Meta;

/** A check on the selected row. Choosing an option closes the menu. */
export const Menu = newStory(() => <SingleField initial="cc" />, { play: open("groupBy") });

/** Disabled rows, including one with a reason. */
export const DisabledOptions = newStory(
  () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <FieldFrame>
        <MenuSelectField
          label="Group by"
          options={groupByOptions()}
          disabledOptions={["feature", { value: "level", reason: "Levels aren't configured for this project" }]}
          value={value}
          onSelect={setValue}
        />
      </FieldFrame>
    );
  },
  { play: open("groupBy") },
);

/** `unsetLabel` stays first and is selected when the value is empty. */
export const UnsetLabel = newStory(
  () => {
    const [value, setValue] = useState<string | undefined>();
    return (
      <FieldFrame>
        <MenuSelectField
          label="Group by"
          options={groupByOptions()}
          unsetLabel="None"
          value={value}
          onSelect={setValue}
        />
      </FieldFrame>
    );
  },
  { play: open("groupBy") },
);

/** `getOptionMenuLabel` replaces the row. The closed field still shows the option name. */
export const CustomLabel = newStory(
  () => {
    const [value, setValue] = useState<string | undefined>("cc");
    return (
      <FieldFrame>
        <MenuSelectField
          label="Group by"
          options={groupByOptions()}
          value={value}
          onSelect={setValue}
          getOptionMenuLabel={(option) => (
            <span css={Css.df.aic.gap1.$}>
              <span css={Css.xsSb.$}>{option.id.toUpperCase()}</span>
              <span>{option.name}</span>
            </span>
          )}
        />
      </FieldFrame>
    );
  },
  { play: open("groupBy") },
);

function SingleField(props: { initial?: string }) {
  const [value, setValue] = useState(props.initial);
  return (
    <FieldFrame>
      <MenuSelectField label="Group by" options={groupByOptions()} value={value} onSelect={setValue} />
    </FieldFrame>
  );
}
