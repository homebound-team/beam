import { TableCardView } from "src/components/Table/components/TableCard";
import { render } from "src/utils/rtl";

describe("TableCardView", () => {
  const imgSrc = "home.jpg";
  const data = [
    { header: "Beds", value: "3" },
    { header: "Baths", value: "2" },
  ];

  it("renders title and image with title as alt text", async () => {
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    expect(r.tableCardView_title).toHaveTextContent("123 Main St");
    expect(r.tableCardView_image).toHaveAttribute("alt", "123 Main St");
  });

  it("renders eyebrow above title", async () => {
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" eyebrow="Lot 42" data={[]} />);
    expect(r.tableCardView_eyebrow).toHaveTextContent("Lot 42");
  });

  it("renders badge inline with title", async () => {
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" badge="Austin, TX" data={[]} />);
    expect(r.tableCardView_badge).toHaveTextContent("Austin, TX");
  });

  it("renders status Tag", async () => {
    const r = await render(
      <TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} status={{ text: "Active", type: "success" }} />,
    );
    expect(r.tableCardView_status).toHaveTextContent("Active");
  });

  it("renders data blocks as 'header: value' pairs", async () => {
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={data} />);
    expect(r.tableCardView_beds).toHaveTextContent("Beds: 3");
    expect(r.tableCardView_baths).toHaveTextContent("Baths: 2");
  });

  it("renders progress bar with percentage label", async () => {
    const r = await render(
      <TableCardView
        imgSrc={imgSrc}
        title="123 Main St"
        data={[]}
        progress={{ label: "Construction", value: 65, minValue: 0, maxValue: 100 }}
      />,
    );
    expect(r.tableCardView_progressValue).toHaveTextContent("65%");
  });

  it("omits optional sections when props are absent", async () => {
    const r = await render(<TableCardView imgSrc={imgSrc} title="123 Main St" data={[]} />);
    expect(r.query.tableCardView_progressValue).not.toBeInTheDocument();
    expect(r.query.tableCardView_eyebrow).not.toBeInTheDocument();
  });
});
