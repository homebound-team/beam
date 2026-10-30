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

/** A nested list with no chevrons. The trigger shows the path, and the selected row has a check. */
export const Hierarchy = newStory(
  () => {
    const [value, setValue] = useState<string | undefined>("drench");
    return (
      <FieldFrame>
        <MenuSelectField
          label="Location"
          options={locationTree()}
          getChildren={(option) => option.children}
          value={value}
          onSelect={setValue}
        />
      </FieldFrame>
    );
  },
  { play: open("location") },
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

type LocationOption = { id: string; name: string; children?: LocationOption[] };

function locationTree(): LocationOption[] {
  return [
    {
      id: "bath-207",
      name: "Bath 207",
      children: [
        {
          id: "walls",
          name: "Walls",
          children: [
            { id: "drench", name: "Drench" },
            { id: "tile", name: "Tile" },
          ],
        },
      ],
    },
  ];
}
