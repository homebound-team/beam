import { Meta } from "@storybook/react";
import { FieldGroup, FormLines } from "src/forms/FormLines";
import { Switch } from "src/inputs/Switch";
import { TextField } from "src/inputs/TextField";

export default {
  component: FormLines,
  title: "Forms/Form Lines",
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

export function SideBySide() {
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
      <FieldGroup basis={["100%", "30%", "100%"]}>
        <TextField label="First" value="first" onChange={() => {}} />
        <TextField label="Middle" value="M" onChange={() => {}} />
        <TextField label="Last" value="last" onChange={() => {}} />
      </FieldGroup>
    </FormLines>
  );
}
