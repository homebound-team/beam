import { Item } from "@react-stately/collections";
import { Meta } from "@storybook/react";
import { SelectField } from "src/components";

export default {
  component: SelectField,
  title: "Components/Select Fields",
} as Meta;

type TestOption = {
  id: string;
  name: string;
};
const options: TestOption[] = [
  { id: "1", name: "Foo" },
  { id: "2", name: "Bar" },
  { id: "3", name: "Baz" },
  { id: "4", name: "Zazz" },
];

export function SelectFields() {
  return (
    <div>
      <SelectField<TestOption> compact items={options} label="Choose something">
        {(item) => <Item key={item.id}>{item.name}</Item>}
      </SelectField>
    </div>
  );
}
