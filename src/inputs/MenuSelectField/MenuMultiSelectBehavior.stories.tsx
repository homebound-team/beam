import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { MenuMultiSelectField } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import { FieldFrame, groupByOptions, open } from "src/inputs/MenuSelectField/storyHelpers";
import { newStory, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Behavior/Multi Selection",
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

/** A checkbox on each row. The menu stays open while options are toggled. */
export const Menu = newStory(() => <MultiField initial={["cc", "room"]} />, { play: open("groupBy") });

/** Disabled rows, including one with a reason. */
export const DisabledOptions = newStory(
  () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <FieldFrame>
        <MenuMultiSelectField
          label="Group by"
          options={groupByOptions()}
          disabledOptions={["feature", { value: "level", reason: "Levels aren't configured for this project" }]}
          values={values}
          onSelect={setValues}
        />
      </FieldFrame>
    );
  },
  { play: open("groupBy") },
);

/** `getOptionMenuLabel` replaces the row. The closed field still shows option names. */
export const CustomLabel = newStory(
  () => {
    const [values, setValues] = useState<string[]>(["cc"]);
    return (
      <FieldFrame>
        <MenuMultiSelectField
          label="Group by"
          options={groupByOptions()}
          values={values}
          onSelect={setValues}
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

function MultiField(props: { initial?: string[] }) {
  const [values, setValues] = useState(props.initial ?? []);
  return (
    <FieldFrame>
      <MenuMultiSelectField label="Group by" options={groupByOptions()} values={values} onSelect={setValues} />
    </FieldFrame>
  );
}
