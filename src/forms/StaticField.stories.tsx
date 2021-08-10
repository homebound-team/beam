import { Meta } from "@storybook/react";
import { Pills } from "src/components/Pills";
import { FieldGroup, FormLines } from "src/forms/FormLines";
import { StaticField as StaticFieldComponent } from "src/forms/StaticField";

export default {
  component: StaticFieldComponent,
  title: "Forms/Static Field",
} as Meta;

export function StaticField() {
  return (
    <FormLines>
      <StaticFieldComponent label="First" value="Bob" />
      <FieldGroup>
        <StaticFieldComponent label="First" value="Bob" />
        <StaticFieldComponent label="First" value="Bob" />
      </FieldGroup>
      <StaticFieldComponent label="First">
        <Pills values={["First", "Last"]} />
      </StaticFieldComponent>
    </FormLines>
  );
}
