import { Meta } from "@storybook/react";
import { useState } from "react";
import { stageFilter, stageFilterDisabledOptions } from "src/components/Filters/testDomain";
import { Filters, multiFilter } from "src/components/index";
import { HasIdAndName } from "src/types";
import { zeroTo } from "src/utils/sb";

export default {
  component: Filters,
  decorators: [],
} as Meta;

export function MultiFilterInPage() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, false, false);
}

export function MultiFilterWithDisabledOptionsInPage() {
  const filter = stageFilterDisabledOptions("stage");
  return (
    <>
      <div>Supports disabled options with or without tooltip reason.</div>
      {filter.render(undefined, () => {}, {}, false, false)}
    </>
  );
}

export function MultiFilterInModal() {
  const filter = stageFilter("stage");
  return filter.render(undefined, () => {}, {}, true, false);
}

export function MultiFilterWithDisabledOptionsInModal() {
  const filter = stageFilterDisabledOptions("stage");
  return (
    <>
      <div>Supports disabled options with or without tooltip reason.</div>
      {filter.render(undefined, () => {}, {}, true, false)}
    </>
  );
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

export function LazyLoading() {
  const loadTestOptions: HasIdAndName[] = zeroTo(1000).map((i) => ({ id: String(i), name: `Project ${i}` }));
  const [loaded, setLoaded] = useState<HasIdAndName[]>([]);

  const filter = multiFilter({
    options: {
      current: [loadTestOptions[2], loadTestOptions[4]],
      load: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        setLoaded(loadTestOptions);
      },
      options: loaded,
    },
    getOptionValue: (s) => s.id,
    getOptionLabel: (s) => s.name,
  })("key");
  return filter.render([loadTestOptions[2].id, loadTestOptions[4].id], () => {}, {}, true, false);
}
