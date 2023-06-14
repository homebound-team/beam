import { Meta } from "@storybook/react";
import { treeFilter } from "src/components/Filters/TreeFilter";
import { Filters } from "src/components/index";
import { NestedOption } from "src/inputs";
import { HasIdAndName } from "src/types";
import { zeroTo } from "src/utils/sb";

export default {
  component: Filters,
} as Meta;

export function TreeFilterInPage() {
  const filter = developmentTreeFilter()("tree");
  return filter.render(undefined, () => {}, {}, false, false);
}

export function SingleFilterInModal() {
  const filter = developmentTreeFilter()("tree");
  return filter.render(undefined, () => {}, {}, true, false);
}

export function SingleFilterVertical() {
  const filter = developmentTreeFilter()("tree");
  return filter.render(undefined, () => {}, {}, false, true);
}

function developmentTreeFilter() {
  const options: NestedOption<HasIdAndName>[] = zeroTo(2).map((devIdx) => ({
    id: `dev:${devIdx + 1}`,
    name: `Development ${devIdx + 1}`,
    children: zeroTo(2).map((cohortIdx) => ({
      id: `cohort:${cohortIdx + 1}:dev:${devIdx + 1}`,
      name: `Cohort ${cohortIdx + 1}`,
      children: zeroTo(4).map((pIdx) => ({
        id: `p:${pIdx + 1}:cohort:${cohortIdx + 1}:dev:${devIdx + 1}`,
        name: `Project ${pIdx + 1}`,
      })),
    })),
  }));

  return treeFilter({
    label: "Project Cohort or Development",
    options: options,
    getOptionValue: (o) => o.id,
    getOptionLabel: (o) => o.name,
  });
}
