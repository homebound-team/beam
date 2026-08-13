import { GridSelectCard } from "./GridSelectCard";
import { SelectCardGroup } from "./SelectCardGroup";

function GridSelectCard_test() {
  return (
    <GridSelectCard
      label="Test"
      icon="columns"
      tag={{ text: "Test", type: "info" as const }}
      inputProps={{ readOnly: true, "aria-hidden": true }}
    />
  );
}

function SelectCardGroup_test() {
  return (
    <SelectCardGroup
      label="Test"
      options={[{ icon: "columns", tag: { text: "Test", type: "info" as const }, label: "Test", value: "test" }]}
      onChange={() => {}}
      value="test"
      view="grid"
    />
  );
}
