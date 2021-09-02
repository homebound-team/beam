import { Meta } from "@storybook/react";
import { stageFilter } from "src/components/Filters/testDomain";
import { Filters } from "src/components/index";

export default {
  component: Filters,
  title: "Components/Filters",
  decorators: [],
} as Meta;

export function MultiFilterInPage() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, false);
}

export function MultiFilterInModal() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, true);
}
