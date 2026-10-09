import { EntityLockup } from "src/components/EntityLockup";
import { setViewport } from "src/tests/viewport";
import { render } from "src/utils/rtl";

describe("EntityLockup", () => {
  it("renders the image, title and description", async () => {
    // Given a lockup with a description
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" description="French door" />);
    // Then it shows the image, title and description
    expect(r.entityLockup_image).toHaveAttribute("src", "fridge.jpeg");
    expect(r.entityLockup_image).toHaveAttribute("alt", "Refrigerator");
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

  it("renders the eyebrow above the title", async () => {
    // Given a lockup with an eyebrow
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" eyebrow="Lenox" title="Holiday Lighting" />);
    // Then the eyebrow comes before the title
    expect(r.entityLockup_eyebrow).toHaveTextContent("Lenox");
    expect(r.entityLockup_eyebrow.compareDocumentPosition(r.entityLockup_title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("omits the eyebrow when not provided", async () => {
    // Given a lockup with only a title
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" />);
    // Then the eyebrow is not rendered
    expect(r.query.entityLockup_eyebrow).not.toBeInTheDocument();
  });

  it("uses the compact layout on small screens", async () => {
    // Given a mobile viewport
    setViewport("sm");
    // When a lockup is rendered without `compact`
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" />);
    // Then it uses the compact title size
    expect(r.entityLockup_title).toHaveStyle({ fontSize: "12px" });
  });

  it("uses the default layout on larger screens", async () => {
    // Given the default desktop viewport
    // When a lockup is rendered without `compact`
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" />);
    // Then it uses the default title size
    expect(r.entityLockup_title).toHaveStyle({ fontSize: "14px" });
  });
});
