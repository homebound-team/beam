import { Meta } from "@storybook/react";
import { FormHeading } from "src/forms/FormHeading";
import { FormLines } from "src/forms/FormLines";
import { TextField } from "src/inputs/TextField";

export default {
  component: FormHeading,
} as Meta;

export function Headings() {
  return (
    <FormLines>
      <FormHeading title="First Heading" />
      <TextField label="First" value="first" onChange={() => {}} />
      <FormHeading title="Second Heading" />
      <TextField label="Last" value="last" onChange={() => {}} />
    </FormLines>
  );
}
