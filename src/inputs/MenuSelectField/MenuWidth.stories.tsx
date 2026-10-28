import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { MenuSelectField } from "src/inputs/MenuSelectField/MenuSelectField";
import { groupByOptions, open } from "src/inputs/MenuSelectField/storyHelpers";
import { newStory, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Behavior/Width",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2828-5144",
    },
  },
} as Meta;

/** A field narrower than 320px. The menu opens at that minimum. */
export const NarrowField = newStory(() => <WidthExample label="Narrow" width={160} />, { play: open("narrow") });

/** A field wider than 320px. The menu matches the field. */
export const WideField = newStory(() => <WidthExample label="Wide" width={480} />, { play: open("wide") });

/** A narrow field on the right edge. The menu stays inside the viewport. */
export const RightEdge = newStory(() => <WidthExample label="Edge" width={160} pin="end" />, { play: open("edge") });

function WidthExample(props: { label: string; width: number; pin?: "end" }) {
  const [value, setValue] = useState<string | undefined>();
  return (
    <div css={Css.p2.df.if(props.pin === "end").jcfe.$}>
      <div css={Css.wPx(props.width).$}>
        <MenuSelectField label={props.label} options={groupByOptions()} value={value} onSelect={setValue} />
      </div>
    </div>
  );
}
