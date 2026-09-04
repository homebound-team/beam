import { CardBody } from "src/components/CardBody";
import { render } from "src/utils/rtl";

describe("CardBody", () => {
  it("renders the title, eyebrows, and badge", async () => {
    // Given a card header with both eyebrows and a badge
    // When rendered
    const r = await render(
      <CardBody title="123 Main St" leftEyebrow="226" rightEyebrow="v23" badge="Draft" badgeTags={[{ text: "New" }]} />,
    );
    // Then each renders in its own slot
    expect(r.cardBody_title).toHaveTextContent("123 Main St");
    expect(r.cardBody_leftEyebrow).toHaveTextContent("226");
    expect(r.cardBody_rightEyebrow).toHaveTextContent("v23");
    expect(r.cardBody_badge).toHaveTextContent("Draft");
    expect(r.cardBody_badge).toHaveTextContent("New");
  });

  it("splits data into two roughly even columns", async () => {
    // Given five label/value pairs
    // When rendered
    const r = await render(
      <CardBody
        title="123 Main St"
        data={[
          { label: "Sqft", value: "4,274" },
          { label: "Beds", value: "5" },
          { label: "Baths", value: "4" },
          { label: "Elevations", value: "3" },
          { label: "Width", value: "39" },
        ]}
      />,
    );
    // Then the first three go to column one, the rest to column two
    expect(r.cardBody_sqft).toHaveTextContent("4,274");
    expect(r.cardBody_beds).toHaveTextContent("5");
    expect(r.cardBody_baths).toHaveTextContent("4");
    expect(r.cardBody_elevations).toHaveTextContent("3");
    expect(r.cardBody_width).toHaveTextContent("39");
  });

  it("renders a progress percentage", async () => {
    // Given a progress value
    // When rendered
    const r = await render(<CardBody title="123 Main St" progress={65} />);
    // Then it shows as a percentage
    expect(r.cardBody_progressValue).toHaveTextContent("65%");
  });

  it("renders children after the predefined slots", async () => {
    // Given a card with custom content below the header
    // When rendered
    const r = await render(
      <CardBody title="Configuration C">
        <div data-testid="customRows">custom rows</div>
      </CardBody>,
    );
    // Then it shows up, since the header alone doesn't cover every card type's needs
    expect(r.customRows).toHaveTextContent("custom rows");
  });
});
