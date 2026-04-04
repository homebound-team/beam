import { Chip, ChipTypes } from "src/components/Chip";
import { Css, Palette } from "src/Css";
import { render } from "src/utils/rtl";

describe("Chip", () => {
  it("renders", async () => {
    const r = await render(<Chip text="Chip text content" />);
    expect(r.chip.textContent).toBe("Chip text content");
  });

  it("can set type to change background color", async () => {
    const r = await render(<Chip text="Chip" type={ChipTypes.caution} />);
    expect(r.chip).toHaveStyle({ backgroundColor: Palette.Yellow200 });
  });

  it("can set custom testids", async () => {
    const r = await render(<Chip text="Chip text content" data-testid="custom" />);
    expect(r.custom.textContent).toBe("Chip text content");
  });

  it("can render with text different than title", async () => {
    const r = await render(<Chip text="Chip text content" title="title is different" />);
    expect(r.chip.textContent).toBe("Chip text content");
    expect(r.tooltip).toHaveAttribute("title", "title is different");
  });

  it("can set background color and color with xss prop", async () => {
    const r = await render(<Chip text="Chip" xss={Css.blue100.bgBlue100.$} />);
    expect(r.chip).toHaveStyle({
      color: Palette.Blue100,
      backgroundColor: Palette.Blue100,
    });
  });
});
