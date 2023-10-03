import { Meta } from "@storybook/react";
import { IconCardGroup, IconCardGroupItemOption, IconCardGroupProps } from "./IconCardGroup";
import { Chips, IconProps } from "src/components";
import { useState } from "react";

export default {
  component: IconCardGroup,
} as Meta<IconCardGroupProps>;

const categories: IconCardGroupItemOption[] = [
  { icon: "abacus", label: "Math", value: "math" },
  { icon: "archive", label: "History", value: "history" },
  { icon: "dollar", label: "Finance", value: "finance" },
  { icon: "hardHat", label: "Engineering", value: "engineering" },
  { icon: "kanban", label: "Management", value: "management" },
  { icon: "camera", label: "Media", value: "media" },
];

export function Default() {
  const [values, setValues] = useState<string[]>(["math"]);

  return (
    <div>
      <Chips values={values} />
      <IconCardGroup
        label="Icon Card Group"
        // options={Object.values(IconCardGroupValues).map((value, i) => ({
        //   icon: valuesToIconMap[value],
        //   label: value,
        //   value,
        //   disabled: i === 2, // disable the third option
        // }))}
        options={categories}
        onChange={(values) => setValues(values)}
        values={values}
        columns={3}
      />
    </div>
  );
}
