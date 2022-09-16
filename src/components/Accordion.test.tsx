import { render } from "src/utils/rtl";
import { Accordion } from "./Accordion";

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
    expect(r.accordion_container()).not.toHaveStyleRule("border-bottom-width", "1px");
    // And the dropdown button is enabled by default
    expect(r.accordion_title()).not.toBeDisabled()
  });

  it("can expand by default", async () => {
    // Given an accordion component with defaultExpanded set
    // When rendered
    const r = await render(<Accordion title="Test title" defaultExpanded> Test description</Accordion>);

    // Then it shows the correct title and description
    expect(r.accordion_title()).toHaveTextContent("Test title");
    expect(r.accordion_details()).not.toHaveStyleRule("max-height", "0");
    expect(r.accordion_details()).toHaveTextContent("Test description");
  });

  it("can display the bottom border", async () => {
    // Given an accordion component with bottomSection set
    // When rendered
    const r = await render(<Accordion title="Test title" bottomBorder> Test description </Accordion>);

    // Then it shows the bottom border
    expect(r.accordion_container()).toHaveStyleRule("border-bottom-width", "1px");
    expect(r.accordion_container()).toHaveStyleRule("border-bottom-style", "solid");
  });

  it("can hide the top border", async () => {
    // Given an accordion component with topSection set as false
    // When rendered
    const r = await render(<Accordion title="Test title" topBorder={false}>Test description</Accordion>);

    // Then it hides the top border
    expect(r.accordion_container()).not.toHaveStyleRule("border-top-width", "1px");
  });

  it("can be disabled", async () => {
    // Given an accordion component with disabled set
    // When rendered
    const r = await render(<Accordion title="Test title" disabled>Test description</Accordion>);

    // Then the dropdown button is disabled
    expect(r.accordion_title()).toBeDisabled();
    // And the description will be hidden by default
    expect(r.accordion_details()).toHaveStyleRule("max-height", "0");
  });
});
