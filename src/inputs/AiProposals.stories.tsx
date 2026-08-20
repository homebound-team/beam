import { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { FormLines } from "src/forms";
import { Autocomplete } from "src/inputs/Autocomplete";
import { DateField } from "src/inputs/DateFields/DateField";
import { DateRangeField } from "src/inputs/DateFields/DateRangeField";
import { MultiSelectField } from "src/inputs/MultiSelectField";
import { NumberField } from "src/inputs/NumberField";
import { SelectField } from "src/inputs/SelectField";
import { TextAreaField } from "src/inputs/TextAreaField";
import { TextField } from "src/inputs/TextField";
import { DateRange, HasIdAndName, PlainDate } from "src/types";
import { jan1, jan10, jan19, jan2, jan29 } from "src/utils/testDates";

export default {
  title: "Inputs/AI Proposals",
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/DchiwVkssXeYi2Er8sMU2k/H2-2026-Plans---Automated-Construction-Doc-Capture?node-id=1518-51629",
    },
  },
} as Meta;

const locations: HasIdAndName[] = [
  { id: "up", name: "Up" },
  { id: "down", name: "Down" },
  { id: "sideways", name: "Sideways" },
];

/**
 * Every field type in AI mode, so the treatment can be compared across them.
 *
 * These are live: engaging with a field commits the proposal through its normal `onChange` and the
 * AI treatment drops, which is the behavior to check as much as the static look.
 */
export function AllFields() {
  return (
    <div css={Css.df.fdc.gap4.$}>
      <Section title="With an original value, i.e. the AI is proposing a change">
        <AiTextField />
        <AiNumberField />
        <AiSelectField />
        <AiMultiSelectField />
        <AiDateField />
        <AiDateRangeField />
        <AiAutocomplete />
        <AiTextAreaField />
      </Section>

      <Section title="With no original value, i.e. the AI filled in a blank">
        <AiTextField original={undefined} />
        <AiNumberField original={undefined} />
        <AiSelectField original={undefined} />
      </Section>

      <Section title="Read only">
        <AiTextField readOnly />
        <AiSelectField readOnly />
      </Section>

      <Section title="Beside a normal field, to check alignment is unchanged">
        <AiTextField />
        <PlainTextField />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div css={Css.df.fdc.gap2.$}>
      <h1 css={Css.lg.$}>{title}</h1>
      <FormLines width="md">{children}</FormLines>
    </div>
  );
}

function AiTextField({ original = "Old Cottage", readOnly }: { original?: string; readOnly?: boolean }) {
  const [value, setValue] = useState<string | undefined>(original);
  return (
    <TextField
      label="Name"
      required
      value={value}
      proposedValue="Janes Cottage"
      onChange={setValue}
      readOnly={readOnly}
    />
  );
}

function PlainTextField() {
  const [value, setValue] = useState<string | undefined>("Untouched");
  return <TextField label="Lot" value={value} onChange={setValue} />;
}

function AiNumberField({ original = 20 }: { original?: number }) {
  const [value, setValue] = useState<number | undefined>(original);
  return <NumberField label="Ceiling Height" value={value} proposedValue={25} onChange={setValue} />;
}

function AiSelectField({ original = "up", readOnly }: { original?: string; readOnly?: boolean }) {
  const [value, setValue] = useState<string | undefined>(original);
  return (
    <SelectField
      label="Primary Bedroom Location"
      value={value}
      proposedValue="down"
      options={locations}
      onSelect={setValue}
      readOnly={readOnly}
    />
  );
}

function AiMultiSelectField() {
  const [values, setValues] = useState<string[]>(["up"]);
  return (
    <MultiSelectField
      label="Bedroom Locations"
      values={values}
      proposedValues={["down", "sideways"]}
      options={locations}
      onSelect={setValues}
    />
  );
}

function AiDateField() {
  const [value, setValue] = useState<PlainDate | undefined>(jan2);
  return <DateField label="Start Date" value={value} proposedValue={jan29} onChange={setValue} />;
}

function AiDateRangeField() {
  const [value, setValue] = useState<DateRange | undefined>({ from: jan2, to: jan10 });
  return (
    <DateRangeField label="Build Window" value={value} proposedValue={{ from: jan1, to: jan19 }} onChange={setValue} />
  );
}

function AiAutocomplete() {
  const [value, setValue] = useState<string | undefined>("Old Supplier");
  return (
    <Autocomplete<HasIdAndName>
      label="Supplier"
      value={value}
      proposedValue="Acme Lumber"
      options={[{ id: "1", name: "Acme Lumber" }]}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      onInputChange={setValue}
      onSelect={() => {}}
    />
  );
}

function AiTextAreaField() {
  const [value, setValue] = useState<string | undefined>("Old note about the framing.");
  return (
    <TextAreaField label="Notes" value={value} proposedValue="Framing inspection passed on 1/19." onChange={setValue} />
  );
}
