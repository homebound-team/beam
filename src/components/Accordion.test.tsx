import { render, } from "src/utils/rtl";
import { Accordion } from "./Accordion";

describe(Accordion, () => {
    it("displays the correct content", async () => {
        // Given an accordion component
        // When rendered
        const r = await render(<Accordion title="Test title"> Test description </Accordion>);
        // Then it shows the correct title
        expect(r.accordion_title()).toHaveTextContent("Test title");
        // And the description will be hidden by default
        expect(r.accordion_details()).not.toBeVisible();
        // And the border bottom is not displayed by default
        expect(r.accordion()).not.toHaveStyleRule("border-bottom-width", "1px");
        // And the dropdown button is enabled by default
        expect(r.accordion_button()).not.toHaveAttribute("disabled");
    });

    it("can expand by default", async () => {
        // Given an accordion component with defaultExpanded set
        // When rendered
        const r = await render(<Accordion title="Test title" defaultExpanded> Test description </Accordion>);
        // Then it shows the correct title and description
        expect(r.accordion_title()).toHaveTextContent("Test title");
        expect(r.accordion_details()).toBeVisible();
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
        expect(r.accordion_button()).toHaveAttribute("disabled");
    });

    it("updates styles when focused", async () => {
        // Given an accordion component
        const r = await render(<Accordion title="Test title"> Test description </Accordion>);
        // When focused
        r.accordion_button().click();
        // Then the border styles are updated
        expect(r.accordion_summary()).toHaveStyleRule("border-width", "2px");
        expect(r.accordion_summary()).toHaveStyleRule("border-color", "rgba(2,143,199,1)");
    });

});
