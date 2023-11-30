import { Meta } from "@storybook/react";
import { IconCardGroup, IconCardGroupItemOption, IconCardGroupProps } from "./IconCardGroup";
import { Chips } from "src/components";
import { useState } from "react";
import { Css } from "src/Css";

export default {
  component: IconCardGroup,
} as Meta<IconCardGroupProps<Category>>;

enum Category {
  Math,
  History,
  Finance,
  Engineering,
  Management,
  Media,
}

const categories: IconCardGroupItemOption<Category>[] = [
  { icon: "abacus", label: "Math", value: Category.Math },
  { icon: "archive", label: "History", value: Category.History },
  { icon: "dollar", label: "Finance", value: Category.Finance },
  { icon: "hardHat", label: "Engineering", value: Category.Engineering },
  { icon: "kanban", label: "Management", value: Category.Management },
  { icon: "camera", label: "Media", value: Category.Media },
];

export function Default() {
  const [values, setValues] = useState<Category[]>([Category.Math]);

  return (
    <div>
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
