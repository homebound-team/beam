import { Meta } from "@storybook/react";
import { taskDueFilter } from "src/components/Filters/testDomain";
import { Filters } from "src/components/index";
import { jan2 } from "src/forms/formStateDomain";

export default {
  component: Filters,
  title: "Components/DateFilters",
  decorators: [],
} as Meta;

export function DateFilterInPage() {
  const filter = taskDueFilter("date");
  return filter.render({ op: "BEFORE", date: jan2 }, () => {}, {}, false, false);
}

export function DateFilterInModal() {
  const filter = taskDueFilter("date");
  return filter.render({ op: "BEFORE", date: jan2 }, () => {}, {}, true, false);
}

export function DateFilterVertical() {
  const filter = taskDueFilter("date");
  return filter.render({ op: "BEFORE", date: jan2 }, () => {}, {}, false, true);
}
