import { Value } from "../inputs";
import { noop } from "../utils";
import { DropdownTreeSelect } from "./DropdownTreeSelect";
import { InternalUser } from "./Filters/testDomain";

export default {
  component: DropdownTreeSelect,
  title: "Workspace/Components/DropdownTreeSelect",
};

type TestOption = {
  id: Value;
  name: string;
  children?: any;
};

const options: TestOption[] = [
  { id: "1", name: "Austin Dev 1", children: [{ id: "5", name: "Cohort 1" }] },
  { id: "2", name: "Dallas", children: [{ id: "5", name: "Cohort 1" }] },
  { id: "3", name: "Driftwood", children: [{ id: "5", name: "Cohort 1" }] },
  { id: "4", name: "Headwaters", children: [{ id: "5", name: "Cohort 1" }] },
  { id: "5", name: "Houston Dev 1", children: [{ id: "5", name: "Cohort 1" }] },
];

export function DefaultDropdownTreeSelect() {
  return (
    <DropdownTreeSelect
      values={[options[2].id]}
      options={options}
      getOptionLabel={(o) => o.name}
      getOptionValue={(o) => o.id}
      onSelect={noop}
      label={"Dropdown Tree Component"}
    />
  );
}

const nested = [
  // a parent w/ two children, 1st child has 2 grandchild, 2nd child has 1 grandchild
  {
    ...{ kind: "parent", id: "1", data: { name: `Austin Dev 1` } },
    children: [
      {
        ...{ kind: "child", id: `c1`, data: { name: `Cohort 1` } },
        children: [
          {
            kind: "grandChild",
            id: `c1g1`,
            data: { name: `1207 Casey Street` },
          },
          { kind: "grandChild", id: `c1g2`, data: { name: `1300 Georgian St B` } },
        ],
      },
      {
        ...{ kind: "child", id: `c2`, data: { name: `Cohort 2` } },
        children: [{ kind: "grandChild", id: `c2g1`, data: { name: `205 W Croslin St B` } }],
      },
      // Put this "grandchild" in the 2nd level to show heterogeneous levels
      { kind: "grandChild", id: `g1`, data: { name: `1803 Belford St B` } },
      // Put this "kind" into the 2nd level to show it doesn't have to be a card
      { kind: "add", id: `$add`, pin: "last", data: {} },
    ],
  },
  // a parent with just a child
  {
    ...{ kind: "parent", id: "3", data: { name: `Dallas` } },
    children: [{ kind: "child", id: `c1`, data: { name: `Cohort 1` } }],
  },
  // a parent with no children
  { kind: "parent", id: "3", data: { name: `Driftwood` } },
];

console.log(nested);

const superheros: InternalUser[] = [
  { id: "1", name: "Austin Dev 1", role: "Leader" },
  { id: "2", name: "Captain America", role: "Carries the cool shield" },
  { id: "3", name: "Thor", role: "Hammer thrower" },
  { id: "4", name: "Hulk", role: "The Muscle" },
  { id: "5", name: "Black Widow", role: "Being sneaky" },
  { id: "6", name: "Ant Man", role: "Helps Wasp" },
  { id: "7", name: "Wasp", role: "Does the small jobs" },
  { id: "8", name: "Black Panther", role: "Also being sneaky" },
  { id: "9", name: "Captain Marvel", role: "Does it all" },
  { id: "10", name: "Doctor Strange", role: "Doctor" },
];
