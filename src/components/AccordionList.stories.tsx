
import { Meta } from "@storybook/react";
import { AccordionList, AccordionProps } from "./Accordion";

export default {
    component: AccordionList,
    title: "Components/Accordion",
} as Meta;

export function AccordionListWithMultipleSelections() {
    const accordions: AccordionProps[] = [
        { title: "First accordion title", children: <div>Fisrt accordion description</div> },
        { title: "Second accordion title", children: <div>Second accordion description</div> },
        { title: "Third accordion title", children: <div>Third accordion description</div> }
    ];
    return <AccordionList accordions={accordions} />
}

export function AccordionListWithOneSelection() {
    const accordions: AccordionProps[] = [
        { title: "First accordion title", children: <div>Fisrt accordion description</div> },
        { title: "Second accordion title", children: <div>Second accordion description</div> },
        { title: "Third accordion title", children: <div>Third accordion description</div> }
    ];
    return <AccordionList accordions={accordions} allowMultipleExpanded={false} />
}
