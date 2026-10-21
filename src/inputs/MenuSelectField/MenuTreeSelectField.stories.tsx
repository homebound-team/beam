import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { MenuTreeSelectField, type MenuTreeSelectFieldProps } from "src/inputs/MenuSelectField/MenuTreeSelectField";
import { type OptionTreeItem, optionTreeItems, optionTreeLabel } from "src/inputs/MenuSelectField/storyHelpers";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/helpers";
import { LabeledExamples, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Menu Tree Select Field",
  component: MenuTreeSelectField,
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop") },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/62R8KiDklvgBBSH0mQGWHo/BEAM_27_LIBRARY?node-id=2828-4332",
    },
  },
} as Meta;

/** Sizes and states, beside a text field. The count badge follows `selectionDisplay`. */
export function Examples() {
  return (
    <LabeledExamples
      labelWidth={140}
      exampleWidth={360}
      examples={[
        { label: "Text field", children: <TextField label="Name" value="Kitchen" onChange={noop} /> },
        { label: "All count", children: <Example label="Options" initial={["spkr", "o8"]} /> },
        { label: "Leaf count", children: <Example label="Options" initial={["spkr", "o8"]} selectionDisplay="leaf" /> },
        { label: "Root count", children: <Example label="Options" initial={["spkr", "o8"]} selectionDisplay="root" /> },
        { label: "Inline label", children: <Example label="Options" labelStyle="inline" initial={["spkr"]} /> },
        { label: "Compact", children: <Example label="Options" compact initial={["spkr-109"]} /> },
        { label: "Disabled", children: <Example label="Options" disabled initial={["spkr"]} /> },
        { label: "Read only", children: <Example label="Options" readOnly initial={["spkr", "o8"]} /> },
        {
          label: "AI mode",
          children: <Example label="Options" initial={["o1"]} proposedValues={["spkr-109", "o8"]} />,
        },
        { label: "Error", children: <Example label="Options" errorMsg="Required" /> },
        { label: "Nothing selected", children: <Example label="Options" nothingSelectedText="All" /> },
        { label: "Placeholder", children: <Example label="Options" placeholder="Select options" /> },
      ]}
    />
  );
}

function Example(
  props: Omit<MenuTreeSelectFieldProps<OptionTreeItem, string>, "options" | "values" | "onSelect"> & {
    initial?: string[];
  },
) {
  const { initial, ...rest } = props;
  const [values, setValues] = useState(initial ?? []);
  return (
    <MenuTreeSelectField
      options={optionTreeItems()}
      values={values}
      onSelect={({ all }) => setValues(all.values)}
      getOptionMenuLabel={optionTreeLabel}
      {...rest}
    />
  );
}
