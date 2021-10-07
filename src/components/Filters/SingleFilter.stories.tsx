import { Meta } from "@storybook/react";
import { stageSingleFilter } from "src/components/Filters/testDomain";
import { Filters } from "src/components/index";

export default {
  component: Filters,
  title: "Components/SingleFilters",
  decorators: [],
} as Meta;

export function SingleFilterInPage() {
  const filter = stageSingleFilter("stage");
  return filter.render(undefined, () => {}, {}, false, false);
}

export function SingleFilterInModal() {
  const filter = stageSingleFilter("stage");
  return filter.render(undefined, () => {}, {}, true, false);
}

export function SingleFilterVertical() {
  const filter = stageSingleFilter("stage");
  return filter.render(undefined, () => {}, {}, false, true);
}
