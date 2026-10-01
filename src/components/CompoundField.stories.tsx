import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { CompoundField } from "src/components/CompoundField";
import { SelectField } from "src/inputs/SelectField";
import { TextField } from "src/inputs/TextField";
import { LabeledExamples, newStory } from "src/utils/sb";

export default {
  title: "Components/Compound Field",
  component: CompoundField,
} as Meta;

export const Examples = newStory(
  () => (
    <LabeledExamples
      labelWidth={120}
      exampleWidth={480}
      examples={[
        { label: "Min and max", children: <MinAndMaxFields /> },
        { label: "Select and text", children: <SelectAndTextFields /> },
        { label: "Focused", children: <MinAndMaxFields autoFocus /> },
      ]}
    />
  ),
  {},
);

function MinAndMaxFields(props: { autoFocus?: boolean }) {
  const [min, setMin] = useState<string | undefined>("10");
  const [max, setMax] = useState<string | undefined>("50");

  return (
    <CompoundField>
      <TextField label="Min" labelStyle="inline" value={min} onChange={setMin} autoFocus={props.autoFocus} />
      <TextField label="Max" labelStyle="inline" value={max} onChange={setMax} />
    </CompoundField>
  );
}

function SelectAndTextFields() {
  const [type, setType] = useState<string | undefined>("task");
  const [name, setName] = useState<string | undefined>();
  const options = [
    { id: "task", name: "Task" },
    { id: "milestone", name: "Milestone" },
  ];

  return (
    <CompoundField>
      <SelectField label="Type" labelStyle="inline" options={options} value={type} onSelect={setType} sizeToContent />
      <TextField label="Name" labelStyle="inline" value={name} onChange={setName} placeholder="Add new" />
    </CompoundField>
  );
}
