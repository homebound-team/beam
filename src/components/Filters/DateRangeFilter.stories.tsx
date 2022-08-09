import { Meta } from "@storybook/react";
import { taskCompleteFilter } from "src/components/Filters/testDomain";
import { Filters } from "src/components/index";
import { Css } from "src/Css";
import { jan19, jan2 } from "src/forms/formStateDomain";

export default {
  component: Filters,
  title: "Components/DateRangeFilters",
  decorators: [],
} as Meta;

export function DateRangeFilterInPage() {
  const filter = taskCompleteFilter("date");
  // Mimics the container of the "in page" filters to demonstrate the field can shrink in size.
  return (
    <div css={Css.df.aic.fdc.$}>
      <br />
      {filter.render(undefined, () => {}, {}, false, false)}
    </div>
  );
}

export function DateRangeFilterInModal() {
  const filter = taskCompleteFilter("date");
  return filter.render({ op: "BEFORE", value: { from: jan2, to: jan19 } }, () => {}, {}, true, false);
}

export function DateRangeFilterVertical() {
  const filter = taskCompleteFilter("date");
  return filter.render({ op: "BEFORE", value: { from: jan2, to: jan19 } }, () => {}, {}, false, true);
}
