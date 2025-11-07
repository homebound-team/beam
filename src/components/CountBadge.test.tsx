import { Palette } from "src/Css";
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

  it("can apply color changes via color prop", async () => {
    const r = await render(<CountBadge count={5} color={Palette.Gray900} />);
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

  it("hides if count is 0 and hideIfZero is true", async () => {
    const r = await render(<CountBadge count={0} hideIfZero />);
    expect(r.queryByTestId("countBadge")).not.toBeInTheDocument();
  });

  it("shows if count is not 0 and hideIfZero is true", async () => {
    const r = await render(<CountBadge count={1} hideIfZero />);
    expect(r.countBadge).toBeTruthy();
  });
});
