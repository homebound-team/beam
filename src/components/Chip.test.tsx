import { Chip } from "src/components/Chip";
import { render } from "src/utils/rtl";

describe("Chip", () => {
  it("renders", async () => {
    const r = await render(<Chip text="Chip text content" />);
    expect(r.chip().textContent).toBe("Chip text content");
    expect(r.chip()).toHaveAttribute("title", "Chip text content");
  });

  it("can set custom testids", async () => {
    const r = await render(<Chip text="Chip text content" data-testid="custom" />);
    expect(r.custom().textContent).toBe("Chip text content");
  });
});
