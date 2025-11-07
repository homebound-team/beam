import { Css, Palette } from "src/Css";
import { render } from "src/utils/rtl";
import { CountBadge } from "./CountBadge";

describe("CountBadge", () => {
  it("renders count", async () => {
    const r = await render(<CountBadge count={5} />);
    expect(r.countBadge.textContent).toBe("5");
  });

  it("uses default 16px size for counts <= 100", async () => {
    const r = await render(<CountBadge count={99} />);
    expect(r.countBadge).toHaveStyle({ width: "16px", height: "16px" });
  });

  it("uses 18px size for counts > 100", async () => {
    const r = await render(<CountBadge count={101} />);
    expect(r.countBadge).toHaveStyle({ width: "18px", height: "18px" });
  });

  it("uses 18px size for large counts", async () => {
    const r = await render(<CountBadge count={999} />);
    expect(r.countBadge).toHaveStyle({ width: "18px", height: "18px" });
  });

  it("uses Blue700 background by default", async () => {
    const r = await render(<CountBadge count={5} />);
    expect(r.countBadge).toHaveStyle({ backgroundColor: Palette.Blue700 });
  });

  it("can set custom background color", async () => {
    const r = await render(<CountBadge count={5} bgColor={Palette.Red600} />);
    expect(r.countBadge).toHaveStyle({ backgroundColor: Palette.Red600 });
  });

  it("can apply color changes via xss", async () => {
    const r = await render(<CountBadge count={5} xss={Css.gray900.$} />);
    expect(r.countBadge).toHaveStyle({ color: Palette.Gray900 });
  });

  it("can set custom testid", async () => {
    const r = await render(<CountBadge count={42} data-testid="customBadge" />);
    expect(r.customBadge.textContent).toBe("42");
  });

  it("renders with circular border radius", async () => {
    const r = await render(<CountBadge count={7} />);
    expect(r.countBadge).toHaveStyle({ borderRadius: "100%" });
  });

  it("renders with white text", async () => {
    const r = await render(<CountBadge count={3} />);
    expect(r.countBadge).toHaveStyle({ color: Palette.White });
  });

  it("uses full opacity by default", async () => {
    const r = await render(<CountBadge count={5} />);
    expect(r.countBadge).toHaveStyle({ opacity: "1" });
  });

  it("can set custom opacity", async () => {
    const r = await render(<CountBadge count={5} opacity={0.5} />);
    expect(r.countBadge).toHaveStyle({ opacity: "0.5" });
  });

  it("can set low opacity", async () => {
    const r = await render(<CountBadge count={5} opacity={0.25} />);
    expect(r.countBadge).toHaveStyle({ opacity: "0.25" });
  });

  it("combines opacity with custom background color", async () => {
    const r = await render(<CountBadge count={12} bgColor={Palette.Red600} opacity={0.75} />);
    expect(r.countBadge).toHaveStyle({ backgroundColor: Palette.Red600, opacity: "0.75" });
  });
});
