import { Meta } from "@storybook/react";
import { Chip } from "src";
import { Css } from "src/Css";
import { AccordionProps } from "./Accordion";
import { AccordionList } from "./AccordionList";

export default {
  component: AccordionList,
  parameters: { backgrounds: { default: "white" } },
} as Meta;

export function AccordionListWithMultipleSelections() {
  const accordions: AccordionProps[] = [
    { title: "First accordion title", children: <div>Fisrt accordion description</div> },
    { title: "Second accordion title", children: <div>Second accordion description</div> },
    { title: "Third accordion title", children: <div>Third accordion description</div> },
  ];
  return <AccordionList accordions={accordions} />;
}

export function AccordionListWithOneSelection() {
  const accordions: AccordionProps[] = [
    { title: "First accordion title", children: <div>Fisrt accordion description</div> },
    { title: "Second accordion title", children: <div>Second accordion description</div>, defaultExpanded: true },
    { title: "Third accordion title", children: <div>Third accordion description</div> },
  ];
  return <AccordionList accordions={accordions} allowMultipleExpanded={false} />;
}

export function AccordionListWithParentProp() {
  const accordions: AccordionProps[] = [
    {
      title: "First accordion title",
      xss: Css.pl0.pr0.$,
      children: (
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Original</th>
              <th>Revised</th>
              <th>Delta</th>
              <th></th>
            </tr>
            <tr>
              <td>Contract:</td>
              <td>$0</td>
              <td>$0</td>
              <td>$0</td>
            </tr>
            <tr>
              <td>Budget:</td>
              <td>$0</td>
              <td>$0</td>
              <td>$0</td>
            </tr>
            <tr>
              <td>Margin:</td>
              <td>$0</td>
              <td>$0</td>
              <td>$0</td>
            </tr>
          </tbody>
        </table>
      ),
      omitPadding: true,
    },
  ];
  return <AccordionList accordions={accordions} />;
}

export function Compact() {
  const accordions: AccordionProps[] = [
    {
      title: (
        <div css={Css.df.w100.jcsb.aic.$}>
          <span>First accordion title</span>
          <Chip text="$145.85" type="success" compact />
        </div>
      ),
      children: <div>Fisrt accordion description</div>,
    },
    {
      title: (
        <div css={Css.df.w100.jcsb.aic.$}>
          <span>Second accordion title</span>
          <Chip text="$145.85" type="success" compact />
        </div>
      ),
      children: <div>Second accordion description</div>,
      defaultExpanded: true,
    },
    {
      title: (
        <div css={Css.df.w100.jcsb.aic.$}>
          <span>Third accordion title</span>
          <Chip text="$145.85" type="success" compact />
        </div>
      ),
      children: <div>Third accordion description</div>,
    },
  ];
  return <AccordionList size="sm" accordions={accordions} allowMultipleExpanded={false} compact />;
}
