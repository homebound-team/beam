import { Meta } from "@storybook/react";
import { FieldGroup, FormDivider, FormLines } from "src/forms/FormLines";
import { SelectField } from "src/inputs";
import { NumberField } from "src/inputs/NumberField";
import { Switch } from "src/inputs/Switch";
import { TextField } from "src/inputs/TextField";
import { noop } from "src/utils/index";

export default {
  component: FormLines,
  title: "Workspace/Forms/Form Lines",
} as Meta;

export function FlatList() {
  return (
    <FormLines>
      <TextField label="First" value="first" onChange={() => {}} />
      <TextField label="Last" value="last" onChange={() => {}} />
    </FormLines>
  );
}

export function SmallFlatList() {
  return (
    <FormLines width="sm">
      <TextField label="First" value="first" onChange={() => {}} />
      <TextField label="Last" value="last" onChange={() => {}} />
    </FormLines>
  );
}

export function FullFlatList() {
  return (
    <FormLines width="full">
      <TextField label="First" value="first" onChange={() => {}} />
      <TextField label="Last" value="last" onChange={() => {}} />
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
    <FormLines horizontalLayout width="lg">
      <TextField label="Name" value="first" labelStyle="hidden" onChange={noop} />
      <SelectField<Options, number>
        label="Unit of Measure"
        value={1}
        labelStyle="hidden"
        options={[
          { id: 1, name: "Each" },
          { id: 2, name: "Square Feet" },
        ]}
        onSelect={noop}
      />
      <Switch label="Signatory" labelStyle="hidden" selected={true} onChange={noop} />
    </FormLines>
  );
}

type Options = {
  id: number;
  name: string;
};
