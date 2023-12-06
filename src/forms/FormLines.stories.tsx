import { Meta } from "@storybook/react";
import { FieldGroup, FormDivider, FormLines } from "src/forms/FormLines";
import { DateField, MultiSelectField, RichTextField, SelectField, TextAreaField, TreeSelectField } from "src/inputs";
import { NumberField } from "src/inputs/NumberField";
import { Switch } from "src/inputs/Switch";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/index";

export default {
  component: FormLines,
} as Meta;

export function FlatList() {
  return (
    <FormLines>
      <TextField label="Text Field" value="first" onChange={noop} />
      <NumberField label="Number Field" value={1} onChange={noop} />
      <DateField label="Date FIeld" value={undefined} onChange={noop} />
      <SelectField<Options, number>
        label="Single Select Field"
        value={1}
        options={[
          { id: 1, name: "Green" },
          { id: 2, name: "Red" },
        ]}
        onSelect={noop}
      />
      <MultiSelectField<Options, number>
        label="Multiselect Field"
        values={[1]}
        options={[
          { id: 1, name: "Soccer" },
          { id: 2, name: "Basketball" },
          { id: 3, name: "Football" },
        ]}
        onSelect={noop}
      />
      <TreeSelectField
        values={[]}
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Tree Select Field"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />
      <TextAreaField label="Text Area Field" value="" onChange={noop} />
      <RichTextField label="Rich Text Field" value="" onChange={noop} />
    </FormLines>
  );
}

export function SmallFlatList() {
  return (
    <FormLines width="sm">
      <TextField label="Text Field" value="first" onChange={noop} />
      <NumberField label="Number Field" value={1} onChange={noop} />
      <DateField label="Date FIeld" value={undefined} onChange={noop} />
      <SelectField<Options, number>
        label="Single Select Field"
        value={1}
        options={[
          { id: 1, name: "Green" },
          { id: 2, name: "Red" },
        ]}
        onSelect={noop}
      />
      <MultiSelectField<Options, number>
        label="Multiselect Field"
        values={[1]}
        options={[
          { id: 1, name: "Soccer" },
          { id: 2, name: "Basketball" },
          { id: 3, name: "Football" },
        ]}
        onSelect={noop}
      />
      <TreeSelectField
        values={[]}
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Tree Select Field"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />
      <TextAreaField label="Text Area Field" value="" onChange={noop} />
      <RichTextField label="Rich Text Field" value="" onChange={noop} />
    </FormLines>
  );
}

export function FullFlatList() {
  return (
    <FormLines width="full">
      <TextField label="Text Field" value="first" onChange={noop} />
      <NumberField label="Number Field" value={1} onChange={noop} />
      <DateField label="Date FIeld" value={undefined} onChange={noop} />
      <SelectField<Options, number>
        label="Single Select Field"
        value={1}
        options={[
          { id: 1, name: "Green" },
          { id: 2, name: "Red" },
        ]}
        onSelect={noop}
      />
      <MultiSelectField<Options, number>
        label="Multiselect Field"
        values={[1]}
        options={[
          { id: 1, name: "Soccer" },
          { id: 2, name: "Basketball" },
          { id: 3, name: "Football" },
        ]}
        onSelect={noop}
      />
      <TreeSelectField
        values={[]}
        onSelect={noop}
        options={[{ id: "1", name: "One" }]}
        label="Tree Select Field"
        getOptionValue={(o) => o.id}
        getOptionLabel={(o) => o.name}
      />
      <TextAreaField label="Text Area Field" value="" onChange={noop} />
      <RichTextField label="Rich Text Field" value="" onChange={noop} />
    </FormLines>
  );
}

export function SideBySideMedium() {
  return (
    <FormLines>
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
      </FieldGroup>
      <TextField label="Address" value="123 Main" onChange={() => {}} />
      <FieldGroup>
        <Switch label="Primary" labelStyle="form" selected={false} onChange={() => {}} />
        <Switch label="Signatory" labelStyle="form" selected={true} onChange={() => {}} />
      </FieldGroup>
      <FieldGroup>
        <TextField label="Title" value="Engineer" onChange={() => {}} />
        <span />
      </FieldGroup>
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup widths={[2, 1, 2]}>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="M" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup>
        <NumberField label="Qty" value={1} onChange={() => {}} />
        <SelectField<Options, number>
          label="Unit of Measure"
          value={1}
          options={[
            { id: 1, name: "Each" },
            { id: 2, name: "Square Feet" },
          ]}
          onSelect={noop}
        />
      </FieldGroup>
    </FormLines>
  );
}
export function SideBySideLarge() {
  return (
    <FormLines width="lg">
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
      </FieldGroup>
      <TextField label="Address" value="123 Main" onChange={() => {}} />
      <FieldGroup>
        <Switch label="Primary" labelStyle="form" selected={false} onChange={() => {}} />
        <Switch label="Signatory" labelStyle="form" selected={true} onChange={() => {}} />
      </FieldGroup>
      <FieldGroup>
        <TextField label="Title" value="Engineer" onChange={() => {}} />
        <span />
      </FieldGroup>
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup widths={[2, 1, 2]}>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="M" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FormDivider />
      <FieldGroup widths={[3, 1]}>
        <TextField label="Street" value="" onChange={noop} />
        <div />
      </FieldGroup>
      <FieldGroup widths={[2, 1, 1]}>
        <TextField label="City" value="" onChange={noop} />
        <TextField label="State" value="" onChange={noop} />
        <TextField label="Postal Code" value="" onChange={noop} />
      </FieldGroup>
      <FieldGroup>
        <NumberField label="Qty" value={1} onChange={() => {}} />
        <SelectField<Options, number>
          label="Unit of Measure"
          value={1}
          options={[
            { id: 1, name: "Each" },
            { id: 2, name: "Square Feet" },
          ]}
          onSelect={noop}
        />
      </FieldGroup>
    </FormLines>
  );
}
export function SideBySideSmall() {
  return (
    <FormLines width="sm">
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
      </FieldGroup>
      <TextField label="Address" value="123 Main" onChange={() => {}} />
      <FieldGroup>
        <Switch label="Primary" labelStyle="form" selected={false} onChange={() => {}} />
        <Switch label="Signatory" labelStyle="form" selected={true} onChange={() => {}} />
      </FieldGroup>
      <FieldGroup>
        <TextField label="Title" value="Engineer" onChange={() => {}} />
        <span />
      </FieldGroup>
      <FieldGroup>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="middle" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup widths={[2, 1, 2]}>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="M" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
      <FieldGroup>
        <NumberField label="Qty" value={1} onChange={() => {}} />
        <SelectField<Options, number>
          label="Unit of Measure"
          value={1}
          options={[
            { id: 1, name: "Each" },
            { id: 2, name: "Square Feet" },
          ]}
          onSelect={noop}
        />
      </FieldGroup>
    </FormLines>
  );
}

export function WithFieldProps() {
  return (
    <FormLines compact labelSuffix={{ required: "*", optional: "(optional)" }}>
      <TextField label="First" value="first" onChange={() => {}} required />
      <TextField label="Last" value="last" onChange={() => {}} required={false} />
    </FormLines>
  );
}

export function WithHorizontalLayout() {
  return (
    <FormLines width="lg" labelStyle="left">
      <TextField label="First" value="first" onChange={noop} />
      <SelectField<Options, number>
        label="Second"
        value={1}
        options={[
          { id: 1, name: "Each" },
          { id: 2, name: "Square Feet" },
        ]}
        onSelect={noop}
      />
      <TextField label="Read only" readOnly value="read only" onChange={noop} />
      <Switch label="Last" labelStyle="left" selected={true} onChange={noop} />
    </FormLines>
  );
}

type Options = {
  id: number;
  name: string;
};
