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

  it("renders 0 inside its wrapper and skips false", async () => {
    // Given a numeric zero description and a conditional `right` that resolved to false
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" description={0} right={false} />);
    // Then the zero renders as the description and the false right is omitted
    expect(r.entityLockup_description).toHaveTextContent("0");
    expect(r.query.entityLockup_right).not.toBeInTheDocument();
  });

  it("renders right content", async () => {
    // Given right content
    // When rendered
    const r = await render(<EntityLockup imgSrc="fridge.jpeg" title="Refrigerator" right="+ $10.00" />);
    // Then it is shown
    expect(r.entityLockup_right).toHaveTextContent("+ $10.00");
  });
});
