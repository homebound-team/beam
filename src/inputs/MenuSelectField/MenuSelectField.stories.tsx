import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { MenuSelectField, type MenuSelectFieldProps } from "src/inputs/MenuSelectField/MenuSelectField";
import { groupByOptions } from "src/inputs/MenuSelectField/storyOptions";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/helpers";
import { LabeledExamples, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Select Field",
  component: MenuSelectField,
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

/** Sizes and states, beside a text field. */
export function Examples() {
  return (
    <LabeledExamples
      labelWidth={120}
      exampleWidth={360}
      examples={[
        { label: "Text field", children: <TextField label="Name" value="Kitchen" onChange={noop} /> },
        { label: "Label above", children: <Example label="Group by" initial="cc" /> },
        { label: "Inline label", children: <Example label="Group by" labelStyle="inline" initial="cc" /> },
        { label: "Compact", children: <Example label="Group by" compact initial="cc" /> },
        { label: "Disabled", children: <Example label="Group by" disabled initial="cc" /> },
        { label: "Read only", children: <Example label="Group by" readOnly initial="cc" /> },
        { label: "AI mode", children: <Example label="Group by" initial="cc" proposedValue="level" /> },
        { label: "Error", children: <Example label="Group by" errorMsg="Required" /> },
        {
          label: "Helper text",
          children: <Example label="Group by" helperText="Choose how rows are grouped." initial="cc" />,
        },
        { label: "Placeholder", children: <Example label="Group by" placeholder="Select a group" /> },
      ]}
    />
  );
}

function Example(
  props: Omit<MenuSelectFieldProps<{ id: string; name: string }, string>, "options" | "value" | "onSelect"> & {
    initial?: string;
  },
) {
  const { initial, ...rest } = props;
  const [value, setValue] = useState(initial);
  return <MenuSelectField options={groupByOptions()} value={value} onSelect={setValue} {...rest} />;
}
