import { CountBadge } from "src/components/CountBadge";
import { render } from "src/utils/rtl";

describe("custom toHaveStyle", () => {
  it("asserts static styles via the default matcher behavior", async () => {
    const r = await render(<div data-testid="subject" style={{ color: "rgb(255, 0, 0)" }} />);

    expect(r.subject).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });

  it("asserts dynamic styles via StyleX css variables", async () => {
    const r = await render(<CountBadge count={5} />);

    const style = getComputedStyle(r.countBadge);

    expect(style.width).toBe("var(--x-width)");
    expect(style.height).toBe("var(--x-height)");
    expect(style.color).toBe("var(--x-color)");
    expect(style.backgroundColor).toBe("var(--x-backgroundColor)");
    expect(style.getPropertyValue("--x-width")).toBe("16px");
    expect(style.getPropertyValue("--x-height")).toBe("16px");
    expect(style.getPropertyValue("--x-color")).toBe("rgba(255,255,255,1)");
    expect(style.getPropertyValue("--x-backgroundColor")).toBe("rgba(29, 78, 216, 1)");

    expect(r.countBadge).toHaveStyle({
      width: "16px",
      height: "16px",
      color: "rgba(255,255,255,1)",
      backgroundColor: "rgba(29, 78, 216, 1)",
    });
  });
});
