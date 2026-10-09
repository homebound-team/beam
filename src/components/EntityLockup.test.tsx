import { EntityLockup } from "src/components/EntityLockup";
import { render } from "src/utils/rtl";

describe("EntityLockup", () => {
  it("renders the image, title and description", async () => {
    // Given a lockup with a description
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" description="French door" />);
    // Then it shows the image, title and description
    expect(r.entityLockup_image).toHaveAttribute("src", "fridge.jpeg");
    expect(r.entityLockup_title).toHaveTextContent("Refrigerator");
    expect(r.entityLockup_description).toHaveTextContent("French door");
  });

  it("omits the description and right content when not provided", async () => {
    // Given a lockup with only a title
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" />);
    // Then neither the description nor the right content is rendered
    expect(r.query.entityLockup_description).not.toBeInTheDocument();
    expect(r.query.entityLockup_right).not.toBeInTheDocument();
  });

  it("renders right content", async () => {
    // Given right content
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" right="+ $10.00" />);
    // Then it is shown
    expect(r.entityLockup_right).toHaveTextContent("+ $10.00");
  });

  it("renders the eyebrow above the title and the left content", async () => {
    // Given a lockup with an eyebrow and left content
    // When rendered
    const r = await render(
      <EntityLockup imgSrc="fridge.jpeg" eyebrow="Lenox" title="Holiday Lighting" left={<input type="checkbox" />} />,
    );
    // Then the eyebrow comes before the title
    expect(r.entityLockup_eyebrow).toHaveTextContent("Lenox");
    expect(r.entityLockup_eyebrow.compareDocumentPosition(r.entityLockup_title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    // And the left content comes before the image
    expect(r.entityLockup_left.compareDocumentPosition(r.entityLockup_image)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("omits the eyebrow and left content when not provided", async () => {
    // Given a lockup with only a title
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" />);
    // Then neither the eyebrow nor the left content is rendered
    expect(r.query.entityLockup_eyebrow).not.toBeInTheDocument();
    expect(r.query.entityLockup_left).not.toBeInTheDocument();
  });
});
