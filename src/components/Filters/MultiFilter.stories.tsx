import { Meta } from "@storybook/react";
import { stageFilter } from "src/components/Filters/testDomain";
import { Filters, multiFilter } from "src/components/index";
import { HasIdAndName } from "src/types";

export default {
  component: Filters,
  title: "Components/MultiFilters",
  decorators: [],
} as Meta;

export function MultiFilterInPage() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, false, false);
}

export function MultiFilterInModal() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, true, false);
}

export function MultiFilterVertical() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, false, true);
}

export function ZeroOptions() {
  const filter = multiFilter({
    options: [] as HasIdAndName[],
    getOptionValue: (s) => s.id,
    getOptionLabel: (s) => s.name,
    disabled: "Filter is disabled because there are no options",
  })("key");
  return filter.render(undefined, () => {}, {}, true, false);
}
