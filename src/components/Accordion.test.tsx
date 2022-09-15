import { click, render, } from "src/utils/rtl";
import { Accordion, AccordionList, AccordionProps } from "./Accordion";

describe(Accordion, () => {
    it("displays the correct content", async () => {
        // Given an accordion component
        // When rendered
        const r = await render(<Accordion title="Test title"> Test description </Accordion>);

        // Then it shows the correct title
        expect(r.accordion_title()).toHaveTextContent("Test title");
        // And the description will be hidden by default
        expect(r.accordion_details()).toHaveStyleRule("max-height", "0");
        // And the border bottom is not displayed by default
        expect(r.accordion()).not.toHaveStyleRule("border-bottom-width", "1px");
        // And the dropdown button is enabled by default
        expect(r.accordion_summary()).not.toHaveAttribute("disabled");
    });

    it("can expand by default", async () => {
        // Given an accordion component with defaultExpanded set
        // When rendered
        const r = await render(<Accordion title="Test title" defaultExpanded> Test description </Accordion>);

        // Then it shows the correct title and description
        expect(r.accordion_title()).toHaveTextContent("Test title");
        expect(r.accordion_details()).not.toHaveStyleRule("max-height", "0");
        expect(r.accordion_details()).toHaveTextContent("Test description");
    });

    it("can display the bottom border", async () => {
        // Given an accordion component with bottomSection set
        // When rendered
        const r = await render(<Accordion title="Test title" bottomSection> Test description </Accordion>);

        // Then it shows the bottom border
        expect(r.accordion()).toHaveStyleRule("border-bottom-width", "1px");
        expect(r.accordion()).toHaveStyleRule("border-bottom-style", "solid");
    });

    it("can be disabled", async () => {
        // Given an accordion component with disabled set
        // When rendered
        const r = await render(<Accordion title="Test title" disabled> Test description </Accordion>);

        // Then the dropdown button is disabled
        expect(r.accordion_summary()).toHaveAttribute("disabled");
    });
});

describe(AccordionList, () => {
    const accordions: AccordionProps[] = [
        { title: "First accordion title", children: <div>Fisrt accordion description</div> },
        { title: "Second accordion title", children: <div>Second accordion description</div> },
        { title: "Third accordion title", children: <div>Third accordion description</div> }
    ];

    it("displays the correct content", async () => {
        // Given an list of accordions
        // When rendered
        const r = await render(<AccordionList accordions={accordions} />);

        // Then it shows the correct title
        expect(r.accordion0_title()).toHaveTextContent("First accordion title");
        expect(r.accordion1_title()).toHaveTextContent("Second accordion title");
        expect(r.accordion2_title()).toHaveTextContent("Third accordion title");

        // And the border bottom is displayed by default
        expect(r.accordion2()).toHaveStyleRule("border-bottom-width", "1px");
    });

    it("can have multiple accordions expanded", async () => {
        // Given an list of accordions
        const r = await render(<AccordionList accordions={accordions} />);

        // When the multiple accordions are selected
        click(r.accordion0_summary())
        click(r.accordion1_summary())

        // Then both accordions are be expanded
        expect(r.accordion0_details()).not.toHaveStyleRule("max-height", "0");
        expect(r.accordion1_details()).not.toHaveStyleRule("max-height", "0");
        
        // And the third one is still collapsed
        expect(r.accordion2_details()).toHaveStyleRule("max-height", "0");
    });

    it("can have only one accordion expanded", async () => {
        // Given an list of accordions with allowMultipleExpanded set as false
        const r = await render(<AccordionList accordions={accordions} allowMultipleExpanded={false} />);

        // When the first accordions is selected
        click(r.accordion0_summary())
        // Then it shows as expanded
        expect(r.accordion0_details()).not.toHaveStyleRule("max-height", "0");

        // And when a second accordion is selected
        click(r.accordion1_summary())
        // Then the first accordion is collapsed and the second is expanded
        expect(r.accordion0_details()).toHaveStyleRule("max-height", "0");
        expect(r.accordion1_details()).not.toHaveStyleRule("max-height", "0");
    });
});


