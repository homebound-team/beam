import { Meta } from "@storybook/react";
import { FormLines } from "src/forms/FormLines";
import { TextField } from "src/inputs/TextField";

export default {
  component: FormLines,
  title: "Forms/Form Lines",
} as Meta;

export function FlatList() {
  return (
    <FormLines>
      <TextField label={"First"} value={"first"} onChange={() => {}} />
      <TextField label={"Last"} value={"last"} onChange={() => {}} />
    </FormLines>
  );
}

export function SmallFlatList() {
  return (
    <FormLines width="sm">
      <TextField label={"First"} value={"first"} onChange={() => {}} />
      <TextField label={"Last"} value={"last"} onChange={() => {}} />
    </FormLines>
  );
}

export function SideBySide() {
  return (
    <FormLines>
      {[
        <TextField key="a" label={"First"} value={"first"} onChange={() => {}} />,
        <TextField key="b" label={"Middle"} value={"middle"} onChange={() => {}} />,
      ]}
      <TextField label="Address" value="123 Main" onChange={() => {}} />
      {/* Having three is too wide, so not supported.*/}
      {[
        <TextField key="a" label={"First"} value={"first"} onChange={() => {}} />,
        <TextField key="b" label={"Middle"} value={"middle"} onChange={() => {}} />,
        <TextField key="c" label={"Last"} value={"last"} onChange={() => {}} />,
      ]}
    </FormLines>
  );
}
