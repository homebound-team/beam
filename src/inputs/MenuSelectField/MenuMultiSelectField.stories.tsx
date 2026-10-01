import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { MenuMultiSelectField, type MenuMultiSelectFieldProps } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import { optionItems } from "src/inputs/MenuSelectField/storyOptions";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/helpers";
import { LabeledExamples, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Multi Select Field",
  component: MenuMultiSelectField,
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

/** Sizes and states, beside a text field. A selection shows as a count badge. */
export function Examples() {
  return (
    <LabeledExamples
      labelWidth={120}
      exampleWidth={360}
      examples={[
        { label: "Text field", children: <TextField label="Name" value="Kitchen" onChange={noop} /> },
        { label: "Label above", children: <Example label="Options" initial={["o4", "o8"]} /> },
        { label: "Inline label", children: <Example label="Options" labelStyle="inline" initial={["o4", "o8"]} /> },
        { label: "Compact", children: <Example label="Options" compact initial={["o4"]} /> },
        { label: "Disabled", children: <Example label="Options" disabled initial={["o4", "o8"]} /> },
        { label: "Read only", children: <Example label="Options" readOnly initial={["o4", "o8"]} /> },
        { label: "AI mode", children: <Example label="Options" initial={["o4"]} proposedValues={["o1", "o8"]} /> },
        { label: "Error", children: <Example label="Options" errorMsg="Required" /> },
        {
          label: "Helper text",
          children: <Example label="Options" helperText="Select every option that applies." initial={["o4"]} />,
        },
        { label: "Nothing selected", children: <Example label="Options" nothingSelectedText="All" /> },
        { label: "Placeholder", children: <Example label="Options" placeholder="Select options" /> },
      ]}
    />
  );
}

function Example(
  props: Omit<
    MenuMultiSelectFieldProps<{ id: string; name: string; code: string }, string>,
    "options" | "values" | "onSelect"
  > & {
    initial?: string[];
  },
) {
  const { initial, ...rest } = props;
  const [values, setValues] = useState(initial ?? []);
  return <MenuMultiSelectField options={optionItems()} values={values} onSelect={setValues} {...rest} />;
}
