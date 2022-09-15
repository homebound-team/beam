import { click } from "@homebound/rtl-utils/build/lib";
import { render } from "src/utils/rtl";
import { AccordionProps } from "./Accordion";
import { AccordionList } from "./AccordionList";

describe(AccordionList, () => {
  const accordions: AccordionProps[] = [
    { title: "First accordion title", children: <div>Fisrt accordion description</div> },
    { title: "Second accordion title", children: <div>Second accordion description</div> },
    { title: "Third accordion title", children: <div>Third accordion description</div> },
  ];

  it("displays the correct content", async () => {
    // Given a list of accordions
    // When rendered
    const r = await render(<AccordionList accordions={accordions} />);

    // Then it shows the correct title for all
    expect(r.accordionList_title_0()).toHaveTextContent("First accordion title");
    expect(r.accordionList_title_1()).toHaveTextContent("Second accordion title");
    expect(r.accordionList_title_2()).toHaveTextContent("Third accordion title");

    // And the border bottom is displayed by default
    expect(r.accordionList_container_2()).toHaveStyleRule("border-bottom-width", "1px");
  });

  it("can have multiple accordions expanded", async () => {
    // Given a list of accordions
    const r = await render(<AccordionList accordions={accordions} />);

    // When the multiple accordions are selected
    click(r.accordionList_title_0());
    click(r.accordionList_title_1());

    // Then both accordions are be expanded
    expect(r.accordionList_details_0()).not.toHaveStyleRule("max-height", "0");
    expect(r.accordionList_details_1()).not.toHaveStyleRule("max-height", "0");

    // And the third one is still collapsed
    expect(r.accordionList_details_2()).toHaveStyleRule("max-height", "0");
  });

  it("can have only one accordion expanded", async () => {
    // Given a list of accordions with allowMultipleExpanded set as false
    const r = await render(<AccordionList accordions={accordions} allowMultipleExpanded={false} />);

    // When the first accordions is selected
    click(r.accordionList_title_0());
    // Then it shows as expanded
    expect(r.accordionList_details_0()).not.toHaveStyleRule("max-height", "0");

    // And when a second accordion is selected
    click(r.accordionList_title_1());
    // Then the first accordion is collapsed and the second is expanded
    expect(r.accordionList_details_0()).toHaveStyleRule("max-height", "0");
    expect(r.accordionList_details_1()).not.toHaveStyleRule("max-height", "0");
  });
});
