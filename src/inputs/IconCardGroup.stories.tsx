import { Meta } from "@storybook/react";
import { IconCardGroup, IconCardGroupItemOption, IconCardGroupProps } from "./IconCardGroup";
import { Chips } from "src/components";
import { useState } from "react";
import { Css } from "src/Css";

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
      <div css={Css.df.wPx(500).$}>
        <IconCardGroup
          label="Icon Card Group"
          options={categories}
          onChange={(values) => setValues(values)}
          values={values}
        />
      </div>
    </div>
  );
}
