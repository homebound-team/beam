import type { Meta } from "@storybook/react-vite";
import { Filters } from "src/components/Filters/Filters";
import { stageSingleFilter } from "src/components/Filters/testDomain";

export default {
  component: Filters,
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
