import { TableCardView } from "src/components/Table/components/TableCard";
import { render } from "src/utils/rtl";

describe("TableCardView", () => {
  const imgSrc = "home.jpg";
  const data = [
    { header: "Beds", value: "3" },
    { header: "Baths", value: "2" },
  ];

  it("renders title and image with title as alt text", async () => {
    // Given a card with only required props
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    // Then title text is displayed and used as the image alt
    expect(r.tableCardView_title).toHaveTextContent("123 Main St");
    expect(r.tableCardView_image).toHaveAttribute("alt", "123 Main St");
  });

  it("renders eyebrow above title", async () => {
    // Given a card with an eyebrow prop
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" eyebrow="Lot 42" data={[]} />);
    // Then the eyebrow text is displayed
    expect(r.tableCardView_eyebrow).toHaveTextContent("Lot 42");
  });

  it("renders badge inline with title", async () => {
    // Given a card with a badge prop
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" badge="Austin, TX" data={[]} />);
    // Then the badge text is displayed
    expect(r.tableCardView_badge).toHaveTextContent("Austin, TX");
  });

  it("renders status Tag", async () => {
    // Given a card with a status prop
    // When rendered
    const r = await render(
      <TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} status={{ text: "Active", type: "success" }} />,
    );
    // Then the status Tag shows the text
    expect(r.tableCardView_status).toHaveTextContent("Active");
  });

  it("renders data blocks as 'header: value' pairs", async () => {
    // Given a card with data blocks
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={data} />);
    // Then each block is displayed as a label: value pair
    expect(r.tableCardView_beds).toHaveTextContent("Beds: 3");
    expect(r.tableCardView_baths).toHaveTextContent("Baths: 2");
  });

  it("renders progress bar with percentage label", async () => {
    // Given a card with a progress value of 65
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} progress={65} />);
    // Then the progress bar shows 65%
    expect(r.tableCardView_progressValue).toHaveTextContent("65%");
  });

  it("omits optional sections when props are absent", async () => {
    // Given a card with only required props
    // When rendered
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    // Then optional sections are not in the document
    expect(r.query.tableCardView_progressValue).not.toBeInTheDocument();
    expect(r.query.tableCardView_eyebrow).not.toBeInTheDocument();
  });
});
