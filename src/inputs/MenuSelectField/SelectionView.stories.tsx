import type { Meta } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { MenuMultiSelectField } from "src/inputs/MenuSelectField/MenuMultiSelectField";
import { optionItems, optionTreeLabel } from "src/inputs/MenuSelectField/storyHelpers";
import type { SelectionView } from "src/inputs/MenuSelectField/types";
import { LabeledExamples, viewportModes, withBeamDecorator, withDimensions } from "src/utils/sb";

export default {
  title: "Inputs/Select Fields (new)/Selection View",
  decorators: [withBeamDecorator, withDimensions()],
  parameters: {
    layout: "fullscreen",
    chromatic: { modes: viewportModes("desktop") },
  },
} as Meta;

/**
 * Each `selectionView` on a multi select. A tree select draws the closed field the same way,
 * so it is not repeated here.
 */
export function Examples() {
  return (
    <LabeledExamples
      labelWidth={140}
      exampleWidth={360}
      examples={[
        {
          label: "Badge only",
          children: <Example options={colors()} initial={colorIds()} selectionView="badgeOnly" labelStyle="inline" />,
        },
        {
          label: "In field",
          children: <Example options={colors()} initial={colors().map((color) => color.id)} selectionView="inField" />,
        },
        {
          label: "Selection list",
          children: (
            <Example
              options={optionItems()}
              initial={["o1", "o4"]}
              getOptionMenuLabel={optionTreeLabel}
              placeholder="Add an option"
              selectionView="selectionList"
            />
          ),
        },
      ]}
    />
  );
}

type Item = { id: string; name: string; code?: string };

type ExampleProps = {
  options: Item[];
  initial: string[];
  selectionView: SelectionView;
  placeholder?: string;
  labelStyle?: "inline";
  getOptionMenuLabel?: (option: Item) => ReactNode;
};

function Example(props: ExampleProps) {
  const { options, initial, ...rest } = props;
  const [values, setValues] = useState(initial);
  return <MenuMultiSelectField label="Options" options={options} values={values} onSelect={setValues} {...rest} />;
}

/** Short names, so several pills fit on a row and wrap in the field. */
function colors(): Item[] {
  return [
    { id: "red", name: "Red" },
    { id: "blue", name: "Blue" },
    { id: "black", name: "Black" },
    { id: "green", name: "Green" },
    { id: "yellow", name: "Yellow" },
    { id: "orange", name: "Orange" },
    { id: "purple", name: "Purple" },
    { id: "white", name: "White" },
    { id: "gray", name: "Gray" },
    { id: "brown", name: "Brown" },
    { id: "pink", name: "Pink" },
    { id: "teal", name: "Teal" },
    { id: "navy", name: "Navy" },
    { id: "gold", name: "Gold" },
    { id: "ivory", name: "Ivory" },
    { id: "olive", name: "Olive" },
  ];
}

function colorIds(): string[] {
  return ["red", "blue", "black", "green", "yellow", "orange"];
}
