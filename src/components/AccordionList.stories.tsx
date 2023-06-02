import { Meta } from "@storybook/react";
import { AccordionProps } from "./Accordion";
import { AccordionList } from "./AccordionList";
import { Css } from "src/Css";

export default {
  component: AccordionList,
  title: "Workspace/Components/Accordion",
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
