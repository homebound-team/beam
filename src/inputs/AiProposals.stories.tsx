import type { Meta } from "@storybook/react-vite";
import { useState } from "react";
import { Css } from "src/Css";
import { FormLines } from "src/forms/FormLines";
import { Autocomplete } from "src/inputs/Autocomplete";
import { DateField } from "src/inputs/DateFields/DateField";
import { DateRangeField } from "src/inputs/DateFields/DateRangeField";
import { MultiSelectField } from "src/inputs/MultiSelectField";
import { NumberField } from "src/inputs/NumberField";
import { SelectField } from "src/inputs/SelectField";
import { TextAreaField } from "src/inputs/TextAreaField";
import { TextField } from "src/inputs/TextField";
import type { DateRange, HasIdAndName, PlainDate } from "src/types";
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
 * What the model proposes for each field, shared with the "already matches the proposal" section
 * below so that editing a proposal can't quietly leave that section demonstrating the wrong thing.
 */
const proposed = {
  name: "Janes Cottage",
  ceilingHeight: 25,
  bedroomLocation: "down",
  bedroomLocations: ["down", "sideways"],
  startDate: jan29,
  buildWindow: { from: jan1, to: jan19 },
  supplier: "Acme Lumber",
  notes: "Framing inspection passed on 1/19.",
};

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
        <AiTextField original="Old Cottage" />
        <AiNumberField original={20} />
        <AiSelectField original="up" />
        <AiMultiSelectField original={["up"]} />
        <AiDateField original={jan2} />
        <AiDateRangeField original={{ from: jan2, to: jan10 }} />
        <AiAutocomplete original="Old Supplier" />
        <AiTextAreaField original="Old note about the framing." />
      </Section>

      <Section title="With no original value, i.e. the AI filled in a blank">
        <AiTextField original={undefined} />
        <AiNumberField original={undefined} />
        <AiSelectField original={undefined} />
        <AiMultiSelectField original={[]} />
        <AiDateField original={undefined} />
        <AiDateRangeField original={undefined} />
        <AiAutocomplete original={undefined} />
        <AiTextAreaField original={undefined} />
      </Section>

      <Section title="With an original value that already matches the proposal">
        <AiTextField original={proposed.name} />
        <AiNumberField original={proposed.ceilingHeight} />
        <AiSelectField original={proposed.bedroomLocation} />
        <AiMultiSelectField original={proposed.bedroomLocations} />
        <AiDateField original={proposed.startDate} />
        <AiDateRangeField original={proposed.buildWindow} />
        <AiAutocomplete original={proposed.supplier} />
        <AiTextAreaField original={proposed.notes} />
      </Section>

      <Section title="Read only">
        <AiTextField original="Old Cottage" readOnly />
        <AiSelectField original="up" readOnly />
      </Section>

      <Section title="Beside a normal field, to check alignment is unchanged">
        <AiTextField original="Old Cottage" />
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

function AiTextField({ original, readOnly }: { original: string | undefined; readOnly?: boolean }) {
  const [value, setValue] = useState<string | undefined>(original);
  return (
    <TextField
      label="Name"
      required
      value={value}
      proposedValue={proposed.name}
      onChange={setValue}
      readOnly={readOnly}
    />
  );
}

function PlainTextField() {
  const [value, setValue] = useState<string | undefined>("Untouched");
  return <TextField label="Lot" value={value} onChange={setValue} />;
}

function AiNumberField({ original }: { original: number | undefined }) {
  const [value, setValue] = useState<number | undefined>(original);
  return (
    <NumberField label="Ceiling Height" value={value} proposedValue={proposed.ceilingHeight} onChange={setValue} />
  );
}

function AiSelectField({ original, readOnly }: { original: string | undefined; readOnly?: boolean }) {
  const [value, setValue] = useState<string | undefined>(original);
  return (
    <SelectField
      label="Primary Bedroom Location"
      value={value}
      proposedValue={proposed.bedroomLocation}
      options={locations}
      onSelect={setValue}
      readOnly={readOnly}
    />
  );
}

function AiMultiSelectField({ original }: { original: string[] }) {
  const [values, setValues] = useState<string[]>(original);
  return (
    <MultiSelectField
      label="Bedroom Locations"
      values={values}
      proposedValues={proposed.bedroomLocations}
      options={locations}
      onSelect={setValues}
    />
  );
}

function AiDateField({ original }: { original: PlainDate | undefined }) {
  const [value, setValue] = useState<PlainDate | undefined>(original);
  return <DateField label="Start Date" value={value} proposedValue={proposed.startDate} onChange={setValue} />;
}

function AiDateRangeField({ original }: { original: DateRange | undefined }) {
  const [value, setValue] = useState<DateRange | undefined>(original);
  return <DateRangeField label="Build Window" value={value} proposedValue={proposed.buildWindow} onChange={setValue} />;
}

function AiAutocomplete({ original }: { original: string | undefined }) {
  const [value, setValue] = useState<string | undefined>(original);
  return (
    <Autocomplete<HasIdAndName>
      label="Supplier"
      value={value}
      proposedValue={proposed.supplier}
      options={[{ id: "1", name: "Acme Lumber" }]}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      onInputChange={setValue}
      onSelect={() => {}}
    />
  );
}

function AiTextAreaField({ original }: { original: string | undefined }) {
  const [value, setValue] = useState<string | undefined>(original);
  return <TextAreaField label="Notes" value={value} proposedValue={proposed.notes} onChange={setValue} />;
}
