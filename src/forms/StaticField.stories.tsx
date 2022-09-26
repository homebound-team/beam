import { Meta } from "@storybook/react";
import { Chips } from "src/components/Chips";
import { FieldGroup, FormLines } from "src/forms/FormLines";
import { StaticField as StaticFieldComponent } from "src/forms/StaticField";
import { TextField } from "src/inputs";

export default {
  component: StaticFieldComponent,
  title: "Workspace/Forms/Static Field",
} as Meta;

export function StaticField() {
  return (
    <FormLines>
      <StaticFieldComponent label="First" value="Bob" />
      <FieldGroup widths={["100px", "100px", "200px"]}>
        <StaticFieldComponent label="First" value="Bob" />
        <StaticFieldComponent label="First" value="Bob" />
        <TextField label="First (read only TextField)" value="Bob" onChange={() => {}} readOnly />
      </FieldGroup>
      <StaticFieldComponent label="First">
        <Chips values={["First", "Last"]} />
      </StaticFieldComponent>
    </FormLines>
  );
}
