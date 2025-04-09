import { jest } from "@jest/globals";
import { click, render } from "src/utils/rtl";
import { Accordion } from "./Accordion";

describe(Accordion, () => {
  it("displays the correct content", async () => {
    // Given an accordion component
    // When rendered
    const r = await render(<Accordion title="Test title">Test description</Accordion>);

    // Then it shows the correct title
    expect(r.accordion_title).toHaveTextContent("Test title");
    // And the description will be hidden by default
    expect(r.query.accordion_content).not.toBeInTheDocument();
    // And the border bottom is not displayed by default
    expect(r.accordion_container).not.toHaveStyle({ borderBottomWidth: "1px" });
    // And the dropdown button is enabled by default
    expect(r.accordion_title).not.toBeDisabled();
  });

  it("can expand by default", async () => {
    // Given an accordion component with defaultExpanded set
    // When rendered
    const r = await render(
      <Accordion title="Test title" defaultExpanded>
        Test description
      </Accordion>,
    );

    // Then it shows the correct title and description
    expect(r.accordion_title).toHaveTextContent("Test title");
    expect(r.accordion_content).toHaveTextContent("Test description");
  });

  it("can display the bottom border", async () => {
    // Given an accordion component with bottomSection set
    // When rendered
    const r = await render(
      <Accordion title="Test title" bottomBorder>
        Test description
      </Accordion>,
    );

    // Then it shows the bottom border
    expect(r.accordion_container).toHaveStyle({ borderBottomWidth: "1px" });
    expect(r.accordion_container).toHaveStyle({ borderBottomStyle: "solid" });
  });

  it("can hide the top border", async () => {
    // Given an accordion component with topSection set as false
    // When rendered
    const r = await render(
      <Accordion title="Test title" topBorder={false}>
        Test description
      </Accordion>,
    );

    // Then it hides the top border
    expect(r.accordion_container).not.toHaveStyle({ borderTopWidth: "1px" });
  });

  it("can be disabled", async () => {
    // Given an accordion component with disabled set and expanded
    // When rendered
    const r = await render(
      <Accordion title="Test title" disabled defaultExpanded>
        Test description
      </Accordion>,
    );

    // Then the dropdown button is disabled
    expect(r.accordion_title).toBeDisabled();
    // And the content is not displayed
    expect(r.query.accordion_content).not.toBeInTheDocument();
  });

  it("calls the titleOnClick function when the title is clicked", async () => {
    // Given an accordion component with titleOnClick set
    const titleOnClick = jest.fn();
    // When rendered
    const r = await render(
      <Accordion title="Test title" titleOnClick={titleOnClick}>
        Test description
      </Accordion>,
    );

    // Then the titleOnClick function is called when the title is clicked
    click(r.accordion_title);
    expect(titleOnClick).toHaveBeenCalled();
  });

  it("calls the onToggle function when the accordion is expanded/collapsed", async () => {
    // Given an accordion component with onToggle set
    const onToggle = jest.fn();
    // When rendered
    const r = await render(
      <Accordion title="Test title" titleOnClick={onToggle}>
        Test description
      </Accordion>,
    );
    // Then the onToggle function is called when the accordion is expanded
    click(r.accordion_title);
    expect(onToggle).toHaveBeenCalledTimes(1);
    // And when it's collapsed
    click(r.accordion_title);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("alters expando behavior when titleOnClick is provided", async () => {
    // When rendered with a titleOnClick set
    const r = await render(
      <Accordion title="Test title" titleOnClick={() => {}}>
        Test description
      </Accordion>,
    );

    // when the title is clicked
    click(r.accordion_title);
    // then the content is not displayed
    expect(r.query.accordion_content).not.toBeInTheDocument();

    // when bar is clicked
    click(r.accordion_toggle);
    // then the content is displayed
    expect(r.accordion_content).toHaveTextContent("Test description");
  });
});
