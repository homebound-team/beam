import { Meta } from "@storybook/react";
import { taskDueFilter } from "src/components/Filters/testDomain";
import { Filters } from "src/components/index";
import { Css } from "src/Css";
import { jan2 } from "src/forms/formStateDomain";

export default {
  component: Filters,
  decorators: [],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/aWUE4pPeUTgrYZ4vaTYZQU/%E2%9C%A8Beam-Design-System?node-id=34522%3A101340",
    },
  },
} as Meta;

export function DateFilterInPage() {
  const filter = taskDueFilter("date");
  // Mimics the container of the "in page" filters to demonstrate the field can shrink in size.
  return <div css={Css.df.aic.$}>{filter.render({ op: "BEFORE", value: jan2 }, () => {}, {}, false, false)}</div>;
}

export function DateFilterInModal() {
  const filter = taskDueFilter("date");
  return filter.render({ op: "BEFORE", value: jan2 }, () => {}, {}, true, false);
}

export function DateFilterVertical() {
  const filter = taskDueFilter("date");
  return filter.render({ op: "BEFORE", value: jan2 }, () => {}, {}, false, true);
}
