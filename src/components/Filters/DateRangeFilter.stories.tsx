import { useState } from "react";
import { Meta } from "@storybook/react";
import { taskCompleteFilter } from "src/components/Filters/testDomain";
import {DateRangeFilterValue, Filters} from "src/components/index";
import { Css } from "src/Css";
import { jan2, jan19 } from "src/forms/formStateDomain";

export default {
  component: Filters,
  title: "Components/DateRangeFilters",
  decorators: [],
} as Meta;

// TODO: Add real stories
export function DateRangeFilterInPage() {
  const [range, setRange] = useState<DateRangeFilterValue | undefined>({ value: {from: jan2, to: jan19 }})
  const [defaultValue, setDefaultValue] = useState<DateRangeFilterValue | undefined>({ value: {from: jan2, to: jan19 }})
  const filter = taskCompleteFilter("date");
  // Mimics the container of the "in page" filters to demonstrate the field can shrink in size.
  return (
    <div css={Css.df.aic.fdc.$}>
      <span>stringy range: {JSON.stringify(range)}</span>
      <br/>
      {filter.render(
        range,
        setRange,
        {},
        false,
        false,
      )}
    </div>
  );
}

export function DateRangeFilterInModal() {
  const filter = taskCompleteFilter("date");
  return filter.render({ value: { from: jan2, to: jan19 } }, (x) => { console.log(x) }, {}, true, false);
}

export function DateRangeFilterVertical() {
  const filter = taskCompleteFilter("date");
  return filter.render({ value: { from: jan2, to: jan19 } }, (x) => { console.log(x) }, {}, false, true);
}
